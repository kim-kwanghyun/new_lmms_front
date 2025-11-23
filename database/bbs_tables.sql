-- ============================================================================
-- 파일 게시판 시스템 테이블 설계
-- 목적: 파일 업로드 및 게시판 관리
-- 작성일: 2025-01-23
-- ============================================================================

-- 1. 기존 테이블 삭제 (개발 환경에서만)
DROP TABLE IF EXISTS `tbl_bbs_file`;
DROP TABLE IF EXISTS `tbl_bbs_post`;

-- ============================================================================
-- 2. 게시판 게시글 테이블
-- ============================================================================
CREATE TABLE `tbl_bbs_post` (
    -- 기본 정보
    `post_id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '게시글 ID (Primary Key)',
    `title` VARCHAR(255) NOT NULL COMMENT '제목',
    `content` TEXT NULL DEFAULT NULL COMMENT '내용',
    `category` VARCHAR(50) NULL DEFAULT NULL COMMENT '카테고리',
    
    -- 상태 정보
    `status` ENUM('공개', '비공개', '삭제') NOT NULL DEFAULT '공개' COMMENT '게시글 상태',
    `is_notice` BOOLEAN NOT NULL DEFAULT FALSE COMMENT '공지사항 여부',
    `is_pinned` BOOLEAN NOT NULL DEFAULT FALSE COMMENT '상단 고정 여부',
    
    -- 조회수 및 통계
    `view_count` INT(11) NOT NULL DEFAULT 0 COMMENT '조회수',
    `like_count` INT(11) NOT NULL DEFAULT 0 COMMENT '좋아요 수',
    
    -- 시스템 정보
    `crdt_dt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록일시',
    `crdt_id` VARCHAR(50) NOT NULL DEFAULT 'system' COMMENT '등록자ID',
    `updt_dt` DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    `updt_id` VARCHAR(50) NULL DEFAULT NULL COMMENT '수정자ID',
    `del_dt` DATETIME NULL DEFAULT NULL COMMENT '삭제일시',
    `del_id` VARCHAR(50) NULL DEFAULT NULL COMMENT '삭제자ID',
    
    -- 제약 조건
    PRIMARY KEY (`post_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_category` (`category`),
    INDEX `idx_is_notice` (`is_notice`),
    INDEX `idx_is_pinned` (`is_pinned`),
    INDEX `idx_crdt_dt` (`crdt_dt`),
    INDEX `idx_crdt_id` (`crdt_id`)
)
ENGINE=InnoDB 
AUTO_INCREMENT=1 
DEFAULT CHARSET=utf8mb4 
COLLATE=utf8mb4_unicode_ci 
COMMENT='게시판 게시글 테이블';

-- ============================================================================
-- 3. 게시판 첨부파일 테이블
-- ============================================================================
CREATE TABLE `tbl_bbs_file` (
    -- 기본 정보
    `file_id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '파일 ID (Primary Key)',
    `post_id` INT(11) NOT NULL COMMENT '게시글 ID (Foreign Key)',
    
    -- 파일 정보
    `original_filename` VARCHAR(255) NOT NULL COMMENT '원본 파일명',
    `stored_filename` VARCHAR(255) NOT NULL COMMENT '저장된 파일명',
    `file_path` VARCHAR(500) NOT NULL COMMENT '파일 저장 경로',
    `file_size` BIGINT(20) NOT NULL COMMENT '파일 크기 (bytes)',
    `file_type` VARCHAR(100) NULL DEFAULT NULL COMMENT '파일 MIME 타입',
    `file_extension` VARCHAR(10) NULL DEFAULT NULL COMMENT '파일 확장자',
    
    -- 다운로드 통계
    `download_count` INT(11) NOT NULL DEFAULT 0 COMMENT '다운로드 횟수',
    
    -- 시스템 정보
    `crdt_dt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록일시',
    `crdt_id` VARCHAR(50) NOT NULL DEFAULT 'system' COMMENT '등록자ID',
    `del_dt` DATETIME NULL DEFAULT NULL COMMENT '삭제일시',
    `del_id` VARCHAR(50) NULL DEFAULT NULL COMMENT '삭제자ID',
    
    -- 제약 조건
    PRIMARY KEY (`file_id`),
    INDEX `idx_post_id` (`post_id`),
    INDEX `idx_crdt_dt` (`crdt_dt`),
    FOREIGN KEY (`post_id`) REFERENCES `tbl_bbs_post`(`post_id`) ON DELETE CASCADE
)
ENGINE=InnoDB 
AUTO_INCREMENT=1 
DEFAULT CHARSET=utf8mb4 
COLLATE=utf8mb4_unicode_ci 
COMMENT='게시판 첨부파일 테이블';

-- ============================================================================
-- 4. 샘플 데이터 (선택사항)
-- ============================================================================
-- INSERT INTO `tbl_bbs_post` (`title`, `content`, `category`, `crdt_id`) VALUES
-- ('첫 번째 게시글', '이것은 첫 번째 게시글입니다.', '일반', 'admin'),
-- ('공지사항', '중요한 공지사항입니다.', '공지', 'admin');

