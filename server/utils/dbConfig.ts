import mysql from 'mysql2/promise'

// 환경변수에서 데이터베이스 설정 읽기 (Connection에서 안전한 옵션만)
export const dbConfig = {
  host: process.env.CONST_DB_HOST || '223.130.159.190',
  port: parseInt(process.env.CONST_DB_PORT || '3306'),
  user: process.env.CONST_DB_USER || 'lsmms',
  password: (process.env.CONST_DB_PASSWORD || 'first_lsmms').replace(/'/g, ''), // 따옴표 제거
  database: process.env.CONST_DB_DATABASE || 'LSMMS',
  charset: 'utf8mb4',
  timezone: '+09:00',
  // MySQL2 Connection에서 지원하는 옵션들만
  connectTimeout: 60000,
  // 큰 숫자 처리 설정
  supportBigNumbers: true,
  bigNumberStrings: true,
  // 날짜 처리 설정
  dateStrings: true
}

// 연결 풀 설정 (성능 향상을 위해)
export const poolConfig = {
  // 기본 연결 설정
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  charset: dbConfig.charset,
  timezone: dbConfig.timezone,
  supportBigNumbers: dbConfig.supportBigNumbers,
  bigNumberStrings: dbConfig.bigNumberStrings,
  dateStrings: dbConfig.dateStrings,
  
  // 풀 전용 설정
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000, // 풀에서 연결 획득 타임아웃
  timeout: 60000,        // 풀에서 연결 타임아웃
  idleTimeout: 900000,   // 15분 후 유휴 연결 해제
}

console.log('DB Config:', {
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  database: dbConfig.database,
  password: '***' // 비밀번호는 로그에 출력하지 않음
})

// 연결 풀 생성
let pool: mysql.Pool | null = null

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool(poolConfig)
  }
  return pool
}

// 데이터베이스 연결 테스트 함수
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await mysql.createConnection(dbConfig)
    const [rows] = await connection.execute('SELECT 1 as test')
    await connection.end()
    console.log('Database connection test successful')
    return true
  } catch (error) {
    console.error('Database connection test failed:', error)
    return false
  }
}

// 풀 연결 테스트 함수
export async function testPoolConnection(): Promise<boolean> {
  try {
    const pool = getPool()
    const connection = await pool.getConnection()
    const [rows] = await connection.execute('SELECT 1 as test')
    connection.release()
    console.log('Database pool connection test successful')
    return true
  } catch (error) {
    console.error('Database pool connection test failed:', error)
    return false
  }
}
