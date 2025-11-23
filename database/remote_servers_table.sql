-- 원격 서버 정보를 저장하는 테이블
CREATE TABLE IF NOT EXISTS remote_servers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL COMMENT '서버명',
    host VARCHAR(255) NOT NULL COMMENT 'IP 주소 또는 호스트명',
    port INT DEFAULT 22 COMMENT 'SSH 포트',
    username VARCHAR(100) NOT NULL COMMENT '접속 사용자명',
    auth_type ENUM('password', 'key') DEFAULT 'password' COMMENT '인증 방식',
    password_hash VARCHAR(255) NULL COMMENT '암호화된 비밀번호',
    private_key_path VARCHAR(500) NULL COMMENT 'SSH 개인키 경로',
    description TEXT NULL COMMENT '서버 설명',
    status ENUM('connected', 'disconnected', 'connecting') DEFAULT 'disconnected' COMMENT '연결 상태',
    last_connected_at TIMESTAMP NULL COMMENT '마지막 연결 시간',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '등록일',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
    created_by INT NULL COMMENT '등록자 ID',
    
    INDEX idx_host_port (host, port),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='원격 서버 관리';

-- SSH 명령 실행 로그를 저장하는 테이블
CREATE TABLE IF NOT EXISTS ssh_command_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    server_id INT NOT NULL COMMENT '서버 ID',
    command TEXT NOT NULL COMMENT '실행된 명령어',
    stdout LONGTEXT NULL COMMENT '표준 출력',
    stderr LONGTEXT NULL COMMENT '에러 출력',
    exit_code INT NULL COMMENT '종료 코드',
    execution_time_ms INT NULL COMMENT '실행 시간(밀리초)',
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '실행 시간',
    executed_by INT NULL COMMENT '실행자 ID',
    
    FOREIGN KEY (server_id) REFERENCES remote_servers(id) ON DELETE CASCADE,
    INDEX idx_server_id (server_id),
    INDEX idx_executed_at (executed_at),
    INDEX idx_executed_by (executed_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='SSH 명령 실행 로그';
