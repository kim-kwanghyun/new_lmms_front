import { Client } from 'ssh2'
import { readFileSync } from 'fs'
import bcrypt from 'bcrypt'

export interface SSHConfig {
  host: string
  port: number
  username: string
  password?: string
  privateKey?: string
  privateKeyPath?: string
}

export interface CommandResult {
  success: boolean
  stdout: string
  stderr: string
  exitCode: number
  executionTime: number
}

export class SSHClient {
  private conn: Client
  private config: SSHConfig

  constructor(config: SSHConfig) {
    this.conn = new Client()
    this.config = config
  }

  /**
   * SSH 서버에 연결
   */
  async connect(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const connectOptions: any = {
        host: this.config.host,
        port: this.config.port,
        username: this.config.username,
      }

      // 인증 방식 설정
      if (this.config.password) {
        connectOptions.password = this.config.password
      } else if (this.config.privateKey) {
        connectOptions.privateKey = this.config.privateKey
      } else if (this.config.privateKeyPath) {
        try {
          connectOptions.privateKey = readFileSync(this.config.privateKeyPath)
        } catch (error) {
          reject(new Error(`SSH 키 파일을 읽을 수 없습니다: ${this.config.privateKeyPath}`))
          return
        }
      }

      this.conn.on('ready', () => {
        resolve(true)
      })

      this.conn.on('error', (err) => {
        reject(err)
      })

      try {
        this.conn.connect(connectOptions)
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * 명령어 실행
   */
  async executeCommand(command: string, options: { timeout?: number, pty?: boolean } = {}): Promise<CommandResult> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now()
      let stdout = ''
      let stderr = ''
      let exitCode = 0
      const timeout = options.timeout || 30000 // 기본 30초 타임아웃

      // 환경 변수와 PATH를 설정하여 명령어 실행
      const envCommand = `source ~/.bashrc ~/.profile /etc/profile 2>/dev/null; export PATH=$PATH:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:~/.local/bin; ${command}`

      const execOptions: any = {}
      if (options.pty) {
        execOptions.pty = true
      }

      // 타임아웃 설정
      const timeoutHandle = setTimeout(() => {
        reject(new Error(`명령 실행 시간 초과 (${timeout}ms)`))
      }, timeout)

      this.conn.exec(envCommand, execOptions, (err, stream) => {
        if (err) {
          clearTimeout(timeoutHandle)
          reject(err)
          return
        }

        stream.on('close', (code: number, signal?: string) => {
          clearTimeout(timeoutHandle)
          const executionTime = Date.now() - startTime
          exitCode = code || 0

          // pm2나 다른 프로세스 관리 도구의 경우 exit code가 0이 아니어도 성공일 수 있음
          const isSuccess = exitCode === 0 || (command.includes('pm2') && exitCode <= 1)

          resolve({
            success: isSuccess,
            stdout: stdout.trim(),
            stderr: stderr.trim(),
            exitCode,
            executionTime
          })
        })

        stream.on('data', (data: Buffer) => {
          stdout += data.toString()
        })

        stream.stderr.on('data', (data: Buffer) => {
          stderr += data.toString()
        })

        // 에러 처리
        stream.on('error', (err) => {
          clearTimeout(timeoutHandle)
          reject(err)
        })
      })
    })
  }

  /**
   * PM2 명령어 실행 (특별 처리)
   */
  async executePM2Command(command: string): Promise<CommandResult> {
    // PM2 명령어는 더 긴 타임아웃과 환경 설정이 필요
    const pm2Command = `source ~/.nvm/nvm.sh 2>/dev/null; source ~/.bashrc 2>/dev/null; export PATH=$PATH:~/.local/bin:/usr/local/bin; which pm2 >/dev/null 2>&1 && ${command} || (npm list -g pm2 >/dev/null 2>&1 && ${command} || echo "PM2가 설치되지 않았습니다.")`
    
    return this.executeCommand(pm2Command, { 
      timeout: 60000, // PM2는 60초 타임아웃
      pty: true 
    })
  }

  /**
   * 시스템 서비스 명령어 실행 (systemctl, service 등)
   */
  async executeServiceCommand(command: string): Promise<CommandResult> {
    // systemctl이나 service 명령어는 sudo가 필요할 수 있음
    const serviceCommand = command.includes('sudo') ? command : `sudo ${command}`
    
    return this.executeCommand(serviceCommand, { 
      timeout: 45000,
      pty: true 
    })
  }

  /**
   * Docker 명령어 실행
   */
  async executeDockerCommand(command: string): Promise<CommandResult> {
    const dockerCommand = `which docker >/dev/null 2>&1 && ${command} || echo "Docker가 설치되지 않았습니다."`
    
    return this.executeCommand(dockerCommand, { 
      timeout: 60000,
      pty: false 
    })
  }

  /**
   * 스마트 명령어 실행 - 명령어 유형에 따라 자동으로 최적화
   */
  async executeSmartCommand(command: string): Promise<CommandResult> {
    const trimmedCommand = command.trim().toLowerCase()
    
    // PM2 관련 명령어
    if (trimmedCommand.includes('pm2')) {
      return this.executePM2Command(command)
    }
    
    // 시스템 서비스 관련 명령어
    if (trimmedCommand.includes('systemctl') || trimmedCommand.includes('service') || 
        trimmedCommand.includes('nginx') || trimmedCommand.includes('apache')) {
      return this.executeServiceCommand(command)
    }
    
    // Docker 관련 명령어
    if (trimmedCommand.includes('docker')) {
      return this.executeDockerCommand(command)
    }
    
    // 긴 실행 시간이 예상되는 명령어들
    if (trimmedCommand.includes('apt') || trimmedCommand.includes('yum') || 
        trimmedCommand.includes('npm install') || trimmedCommand.includes('git clone')) {
      return this.executeCommand(command, { timeout: 120000, pty: true })
    }
    
    // 대화형 명령어들
    if (trimmedCommand.includes('top') || trimmedCommand.includes('htop') || 
        trimmedCommand.includes('nano') || trimmedCommand.includes('vi') || trimmedCommand.includes('vim')) {
      return this.executeCommand(command, { timeout: 10000, pty: true })
    }
    
    // 기본 명령어 실행
    return this.executeCommand(command)
  }

  /**
   * 연결 테스트
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.connect()
      const result = await this.executeCommand('echo "connection test"')
      this.disconnect()
      return result.success && result.stdout.includes('connection test')
    } catch (error) {
      return false
    }
  }

  /**
   * 연결 해제
   */
  disconnect(): void {
    this.conn.end()
  }
}

/**
 * 비밀번호 암호화
 */
export async function encryptPassword(password: string): Promise<string> {
  const saltRounds = 10
  return await bcrypt.hash(password, saltRounds)
}

/**
 * 비밀번호 검증
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

/**
 * SSH 클라이언트 팩토리
 */
export function createSSHClient(config: SSHConfig): SSHClient {
  return new SSHClient(config)
}
