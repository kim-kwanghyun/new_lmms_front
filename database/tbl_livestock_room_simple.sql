-- ============================================================================
-- 축사방 관리 테이블 (간단 버전)
-- 테이블명: tbl_livestock_room
-- 목적: 기본적인 축사방 등록 및 관리
-- ============================================================================

-- 1. 기존 테이블 삭제 (있을 경우)
DROP TABLE IF EXISTS `tbl_livestock_room`;

-- 2. 기본 테이블 생성
CREATE TABLE `tbl_livestock_room` (
    `idx` INT(11) NOT NULL AUTO_INCREMENT COMMENT '일련번호',
    `room_number` VARCHAR(50) NOT NULL COMMENT '축사번호',
    `livestock_type` VARCHAR(20) NOT NULL DEFAULT '돼지' COMMENT '가축종류 (돼지, 소)',
    `created_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '개설일시',
    `creator_id` VARCHAR(50) NOT NULL COMMENT '개설자ID',
    `crdt_dt` DATETIME NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록일시',
    `crdt_id` VARCHAR(50) NULL DEFAULT NULL COMMENT '등록자ID',
    
    PRIMARY KEY (`idx`),
    UNIQUE INDEX `room_number_unique` (`room_number`),
    INDEX `livestock_type_idx` (`livestock_type`),
    INDEX `creator_id_idx` (`creator_id`)
)
COMMENT='축사방 관리 테이블'
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB
AUTO_INCREMENT=1;

-- 3. 샘플 데이터 삽입
INSERT INTO `tbl_livestock_room` (`room_number`, `livestock_type`, `created_date`, `creator_id`, `crdt_id`) VALUES
('A-001', '돼지', '2024-01-15 09:00:00', 'admin', 'admin'),
('A-002', '돼지', '2024-01-15 09:30:00', 'admin', 'admin'),
('B-001', '소', '2024-01-20 14:00:00', 'manager1', 'manager1'),
('A-003', '돼지', '2024-02-01 10:15:00', 'admin', 'admin'),
('B-002', '소', '2024-02-05 16:30:00', 'manager2', 'manager2'),
('A-004', '돼지', '2024-02-10 11:20:00', 'admin', 'admin'),
('C-001', '돼지', '2024-02-15 13:45:00', 'manager1', 'manager1'),
('B-003', '소', '2024-02-20 15:10:00', 'manager2', 'manager2');

-- ============================================================================
-- 4. 기본 CRUD 쿼리문들
-- ============================================================================

-- 4-1. 전체 축사방 목록 조회
SELECT 
    idx,
    room_number,
    livestock_type,
    DATE_FORMAT(created_date, '%Y-%m-%d %H:%i') as created_date_formatted,
    creator_id,
    DATE_FORMAT(crdt_dt, '%Y-%m-%d %H:%i') as registered_at
FROM tbl_livestock_room 
ORDER BY crdt_dt DESC;

-- 4-2. 특정 축사방 조회
SELECT * FROM tbl_livestock_room 
WHERE room_number = 'A-001';

-- 4-3. 축사번호로 검색
SELECT * FROM tbl_livestock_room 
WHERE room_number LIKE '%A-%'
ORDER BY room_number;

-- 4-4. 가축종류별 조회
SELECT * FROM tbl_livestock_room 
WHERE livestock_type = '돼지'
ORDER BY room_number;

-- 4-5. 개설자별 축사방 목록
SELECT * FROM tbl_livestock_room 
WHERE creator_id = 'admin'
ORDER BY created_date DESC;

-- ============================================================================
-- 5. 집계 쿼리문들
-- ============================================================================

-- 5-1. 가축종류별 축사방 수
SELECT 
    livestock_type,
    COUNT(*) as room_count
FROM tbl_livestock_room 
GROUP BY livestock_type;

-- 5-2. 개설자별 축사방 수
SELECT 
    creator_id,
    COUNT(*) as room_count,
    MIN(created_date) as first_created,
    MAX(created_date) as last_created
FROM tbl_livestock_room 
GROUP BY creator_id;

-- 5-3. 월별 신규 등록 현황
SELECT 
    DATE_FORMAT(created_date, '%Y-%m') as month,
    COUNT(*) as new_rooms
FROM tbl_livestock_room 
GROUP BY DATE_FORMAT(created_date, '%Y-%m')
ORDER BY month DESC;

-- 5-4. 전체 현황 요약
SELECT 
    COUNT(*) as total_rooms,
    COUNT(CASE WHEN livestock_type = '돼지' THEN 1 END) as pig_rooms,
    COUNT(CASE WHEN livestock_type = '소' THEN 1 END) as cow_rooms,
    COUNT(DISTINCT creator_id) as total_creators
FROM tbl_livestock_room;

-- ============================================================================
-- 6. 데이터 관리 쿼리문들
-- ============================================================================

-- 6-1. 새 축사방 등록
INSERT INTO tbl_livestock_room (room_number, livestock_type, created_date, creator_id, crdt_id) 
VALUES ('A-005', '돼지', NOW(), 'admin', 'admin');

-- 6-2. 축사방 정보 수정
UPDATE tbl_livestock_room 
SET livestock_type = '소', creator_id = 'new_admin'
WHERE room_number = 'A-005';

-- 6-3. 축사방 삭제
DELETE FROM tbl_livestock_room 
WHERE room_number = 'A-005';

-- 6-4. 여러 축사방 일괄 등록
INSERT INTO tbl_livestock_room (room_number, livestock_type, created_date, creator_id, crdt_id) VALUES
('D-001', '돼지', NOW(), 'batch_admin', 'batch_admin'),
('D-002', '돼지', NOW(), 'batch_admin', 'batch_admin'),
('D-003', '소', NOW(), 'batch_admin', 'batch_admin');

-- ============================================================================
-- 7. 검색 및 필터링 쿼리문들
-- ============================================================================

-- 7-1. 복합 검색 (축사번호 + 가축종류)
SELECT * FROM tbl_livestock_room 
WHERE room_number LIKE '%A-%' AND livestock_type = '돼지'
ORDER BY room_number;

-- 7-2. 기간별 검색
SELECT * FROM tbl_livestock_room 
WHERE created_date BETWEEN '2024-01-01' AND '2024-02-29'
ORDER BY created_date;

-- 7-3. 페이징 처리
SELECT * FROM tbl_livestock_room 
ORDER BY crdt_dt DESC
LIMIT 5 OFFSET 0;  -- 첫 번째 페이지 (5개씩)

-- 7-4. 검색어 포함 (축사번호 또는 개설자ID)
SELECT * FROM tbl_livestock_room 
WHERE room_number LIKE '%A-001%' OR creator_id LIKE '%admin%'
ORDER BY crdt_dt DESC;

-- ============================================================================
-- 8. 유효성 검사 쿼리문들
-- ============================================================================

-- 8-1. 축사번호 중복 체크
SELECT COUNT(*) as duplicate_count 
FROM tbl_livestock_room 
WHERE room_number = 'A-001';

-- 8-2. 존재하지 않는 축사방 체크
SELECT CASE 
    WHEN COUNT(*) > 0 THEN 'EXISTS' 
    ELSE 'NOT_EXISTS' 
END as status
FROM tbl_livestock_room 
WHERE room_number = 'Z-999';

-- 8-3. 가축종류 유효성 체크
SELECT room_number, livestock_type
FROM tbl_livestock_room 
WHERE livestock_type NOT IN ('돼지', '소');

-- ============================================================================
-- 9. 백업 및 유지보수
-- ============================================================================

-- 9-1. 테이블 구조 확인
DESCRIBE tbl_livestock_room;

-- 9-2. 인덱스 정보 확인
SHOW INDEX FROM tbl_livestock_room;

-- 9-3. 테이블 상태 확인
SHOW TABLE STATUS LIKE 'tbl_livestock_room';

-- 9-4. 데이터 백업
CREATE TABLE tbl_livestock_room_backup_20241219 AS 
SELECT * FROM tbl_livestock_room;

-- ============================================================================
-- 10. API에서 사용할 주요 쿼리문들
-- ============================================================================

-- 10-1. 목록 조회 (페이징 + 검색)
SELECT 
    idx,
    room_number,
    livestock_type,
    DATE_FORMAT(created_date, '%Y-%m-%d %H:%i:%s') as created_date,
    creator_id,
    DATE_FORMAT(crdt_dt, '%Y-%m-%d %H:%i:%s') as crdt_dt,
    crdt_id
FROM tbl_livestock_room 
WHERE 1=1
  AND (? IS NULL OR room_number LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR creator_id LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR livestock_type = ?)
ORDER BY crdt_dt DESC, idx DESC
LIMIT ? OFFSET ?;

-- 10-2. 전체 개수 조회 (검색 조건 포함)
SELECT COUNT(*) as total
FROM tbl_livestock_room 
WHERE 1=1
  AND (? IS NULL OR room_number LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR creator_id LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR livestock_type = ?);

-- 10-3. 단일 축사방 조회
SELECT 
    idx,
    room_number,
    livestock_type,
    DATE_FORMAT(created_date, '%Y-%m-%d %H:%i:%s') as created_date,
    creator_id,
    DATE_FORMAT(crdt_dt, '%Y-%m-%d %H:%i:%s') as crdt_dt,
    crdt_id
FROM tbl_livestock_room 
WHERE idx = ?;

-- 10-4. 축사방 등록
INSERT INTO tbl_livestock_room (
    room_number, 
    livestock_type, 
    created_date, 
    creator_id, 
    crdt_id
) VALUES (?, ?, ?, ?, ?);

-- 10-5. 축사방 수정
UPDATE tbl_livestock_room 
SET 
    room_number = ?,
    livestock_type = ?,
    created_date = ?,
    creator_id = ?
WHERE idx = ?;

-- 10-6. 축사방 삭제
DELETE FROM tbl_livestock_room 
WHERE idx = ?;

-- ============================================================================
-- 끝
-- ============================================================================








