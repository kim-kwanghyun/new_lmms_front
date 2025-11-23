-- ============================================================================
-- 축사방 관리 테이블 설계 및 쿼리문
-- 테이블명: tbl_livestock_room
-- 목적: 돼지축사방 등록 및 관리
-- 작성일: 2024-12-19
-- ============================================================================

-- 1. 테이블 삭제 (기존 테이블이 있을 경우)
DROP TABLE IF EXISTS `tbl_livestock_room`;

-- 2. 테이블 생성
CREATE TABLE `tbl_livestock_room` (
    -- 기본 정보
    `idx` INT(11) NOT NULL AUTO_INCREMENT COMMENT '일련번호 (Primary Key)',
    `room_number` VARCHAR(50) NOT NULL COMMENT '축사번호 (예: A-001, B-002)',
    `livestock_type` ENUM('돼지', '소', '닭', '오리') NOT NULL DEFAULT '돼지' COMMENT '가축종류',
    
    -- 축사방 상세 정보
    `room_name` VARCHAR(100) NULL DEFAULT NULL COMMENT '축사방 이름/별칭',
    `room_area` DECIMAL(10,2) NULL DEFAULT NULL COMMENT '축사방 면적(㎡)',
    `max_capacity` INT(11) NULL DEFAULT NULL COMMENT '최대 수용 가능 마리수',
    `current_capacity` INT(11) NULL DEFAULT 0 COMMENT '현재 사육 마리수',
    
    -- 위치 정보
    `building_code` VARCHAR(20) NULL DEFAULT NULL COMMENT '건물코드 (예: A동, B동)',
    `floor_number` TINYINT(2) NULL DEFAULT 1 COMMENT '층수',
    `room_position` VARCHAR(50) NULL DEFAULT NULL COMMENT '축사방 위치 (예: 좌측, 우측, 중앙)',
    
    -- 환경 정보
    `temperature_min` DECIMAL(5,2) NULL DEFAULT NULL COMMENT '최저 온도(℃)',
    `temperature_max` DECIMAL(5,2) NULL DEFAULT NULL COMMENT '최고 온도(℃)',
    `humidity_level` DECIMAL(5,2) NULL DEFAULT NULL COMMENT '습도(%)',
    `ventilation_type` VARCHAR(50) NULL DEFAULT NULL COMMENT '환기 방식',
    
    -- 시설 정보
    `feeding_system` VARCHAR(50) NULL DEFAULT NULL COMMENT '급이 시설',
    `water_system` VARCHAR(50) NULL DEFAULT NULL COMMENT '급수 시설',
    `waste_system` VARCHAR(50) NULL DEFAULT NULL COMMENT '분뇨 처리 시설',
    
    -- 상태 정보
    `room_status` ENUM('운영중', '점검중', '비운영', '폐쇄') NOT NULL DEFAULT '운영중' COMMENT '축사방 상태',
    `last_cleaning_date` DATETIME NULL DEFAULT NULL COMMENT '최근 청소일시',
    `last_inspection_date` DATETIME NULL DEFAULT NULL COMMENT '최근 점검일시',
    
    -- 개설 정보
    `created_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '개설일시',
    `creator_id` VARCHAR(50) NOT NULL COMMENT '개설자ID',
    `creator_name` VARCHAR(100) NULL DEFAULT NULL COMMENT '개설자 이름',
    
    -- 관리 정보
    `manager_id` VARCHAR(50) NULL DEFAULT NULL COMMENT '담당 관리자ID',
    `manager_name` VARCHAR(100) NULL DEFAULT NULL COMMENT '담당 관리자 이름',
    `manager_phone` VARCHAR(20) NULL DEFAULT NULL COMMENT '담당자 연락처',
    
    -- 비고
    `notes` TEXT NULL DEFAULT NULL COMMENT '비고/특이사항',
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE COMMENT '활성화 여부',
    
    -- 시스템 정보
    `crdt_dt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록일시',
    `crdt_id` VARCHAR(50) NOT NULL DEFAULT 'system' COMMENT '등록자ID',
    `updt_dt` DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    `updt_id` VARCHAR(50) NULL DEFAULT NULL COMMENT '수정자ID',
    
    -- 제약 조건
    PRIMARY KEY (`idx`),
    UNIQUE KEY `uk_room_number` (`room_number`),
    INDEX `idx_livestock_type` (`livestock_type`),
    INDEX `idx_room_status` (`room_status`),
    INDEX `idx_building_code` (`building_code`),
    INDEX `idx_creator_id` (`creator_id`),
    INDEX `idx_manager_id` (`manager_id`),
    INDEX `idx_created_date` (`created_date`),
    INDEX `idx_is_active` (`is_active`)
)
ENGINE=InnoDB 
AUTO_INCREMENT=1 
DEFAULT CHARSET=utf8mb4 
COLLATE=utf8mb4_unicode_ci 
COMMENT='축사방 관리 테이블';

-- 3. 샘플 데이터 삽입
INSERT INTO `tbl_livestock_room` (
    `room_number`, `livestock_type`, `room_name`, `room_area`, `max_capacity`, `current_capacity`,
    `building_code`, `floor_number`, `room_position`,
    `temperature_min`, `temperature_max`, `humidity_level`, `ventilation_type`,
    `feeding_system`, `water_system`, `waste_system`,
    `room_status`, `last_cleaning_date`, `last_inspection_date`,
    `created_date`, `creator_id`, `creator_name`,
    `manager_id`, `manager_name`, `manager_phone`,
    `notes`, `crdt_id`
) VALUES 
-- 돼지 축사방
('A-001', '돼지', '돼지사 A동 1호', 150.50, 100, 85, 'A동', 1, '좌측', 
 18.0, 25.0, 65.5, '자동환기시스템', '자동급이기', '자동급수기', '슬러리시스템',
 '운영중', '2024-12-18 06:00:00', '2024-12-15 14:00:00',
 '2024-01-15 09:00:00', 'admin', '관리자', 
 'manager001', '김축사', '010-1234-5678',
 '신규 설치된 축사방으로 시설이 우수함', 'admin'),

('A-002', '돼지', '돼지사 A동 2호', 150.50, 100, 92, 'A동', 1, '중앙',
 18.0, 25.0, 68.2, '자동환기시스템', '자동급이기', '자동급수기', '슬러리시스템',
 '운영중', '2024-12-18 06:30:00', '2024-12-15 14:30:00',
 '2024-01-15 09:30:00', 'admin', '관리자',
 'manager001', '김축사', '010-1234-5678',
 '정상 운영 중', 'admin'),

('A-003', '돼지', '돼지사 A동 3호', 150.50, 100, 78, 'A동', 1, '우측',
 18.0, 25.0, 63.8, '자동환기시스템', '자동급이기', '자동급수기', '슬러리시스템',
 '운영중', '2024-12-17 06:00:00', '2024-12-15 15:00:00',
 '2024-02-01 10:15:00', 'admin', '관리자',
 'manager001', '김축사', '010-1234-5678',
 '환기 시설 점검 필요', 'admin'),

-- 소 축사방
('B-001', '소', '한우사 B동 1호', 200.75, 50, 35, 'B동', 1, '좌측',
 15.0, 22.0, 70.0, '자연환기', '자동급이기', '자동급수기', '고액분리시스템',
 '운영중', '2024-12-18 07:00:00', '2024-12-16 10:00:00',
 '2024-01-20 14:00:00', 'manager1', '관리자1',
 'manager002', '이한우', '010-2345-6789',
 '한우 전용 축사방', 'manager1'),

('B-002', '소', '한우사 B동 2호', 200.75, 50, 42, 'B동', 1, '우측',
 15.0, 22.0, 72.5, '자연환기', '자동급이기', '자동급수기', '고액분리시스템',
 '운영중', '2024-12-18 07:30:00', '2024-12-16 10:30:00',
 '2024-02-05 16:30:00', 'manager2', '관리자2',
 'manager002', '이한우', '010-2345-6789',
 '신규 송아지 입식 예정', 'manager2'),

-- 점검 중인 축사방
('A-004', '돼지', '돼지사 A동 4호', 150.50, 100, 0, 'A동', 1, '좌측 끝',
 18.0, 25.0, NULL, '자동환기시스템', '자동급이기', '자동급수기', '슬러리시스템',
 '점검중', '2024-12-10 06:00:00', '2024-12-18 09:00:00',
 '2024-03-01 11:00:00', 'admin', '관리자',
 'manager001', '김축사', '010-1234-5678',
 '급수 시설 교체 작업 중', 'admin'),

-- 닭 축사방
('C-001', '닭', '산란계사 C동 1호', 300.00, 1000, 950, 'C동', 2, '전체',
 20.0, 28.0, 60.0, '강제환기시스템', '체인급이기', '니플급수기', '벨트집분시스템',
 '운영중', '2024-12-18 05:00:00', '2024-12-17 16:00:00',
 '2024-03-15 08:00:00', 'poultry_manager', '양계관리자',
 'manager003', '박산란', '010-3456-7890',
 '산란율 92% 유지 중', 'poultry_manager');

-- ============================================================================
-- 4. 기본 조회 쿼리문들
-- ============================================================================

-- 4-1. 전체 축사방 목록 조회 (기본 정보)
SELECT 
    idx,
    room_number,
    livestock_type,
    room_name,
    room_status,
    current_capacity,
    max_capacity,
    CONCAT(current_capacity, '/', max_capacity, ' 마리') AS capacity_info,
    ROUND((current_capacity / max_capacity) * 100, 1) AS occupancy_rate,
    creator_name,
    manager_name,
    DATE_FORMAT(created_date, '%Y-%m-%d') AS created_date_formatted,
    DATE_FORMAT(crdt_dt, '%Y-%m-%d %H:%i') AS registered_at
FROM tbl_livestock_room 
WHERE is_active = TRUE
ORDER BY building_code, room_number;

-- 4-2. 가축종류별 축사방 현황
SELECT 
    livestock_type,
    COUNT(*) AS total_rooms,
    SUM(CASE WHEN room_status = '운영중' THEN 1 ELSE 0 END) AS operating_rooms,
    SUM(CASE WHEN room_status = '점검중' THEN 1 ELSE 0 END) AS maintenance_rooms,
    SUM(max_capacity) AS total_capacity,
    SUM(current_capacity) AS current_total,
    ROUND(AVG((current_capacity / max_capacity) * 100), 1) AS avg_occupancy_rate
FROM tbl_livestock_room 
WHERE is_active = TRUE
GROUP BY livestock_type
ORDER BY livestock_type;

-- 4-3. 건물별 축사방 현황
SELECT 
    building_code,
    COUNT(*) AS room_count,
    SUM(room_area) AS total_area,
    SUM(max_capacity) AS total_capacity,
    SUM(current_capacity) AS current_total,
    ROUND((SUM(current_capacity) / SUM(max_capacity)) * 100, 1) AS occupancy_rate,
    GROUP_CONCAT(DISTINCT livestock_type ORDER BY livestock_type) AS livestock_types
FROM tbl_livestock_room 
WHERE is_active = TRUE
GROUP BY building_code
ORDER BY building_code;

-- 4-4. 상세 정보 포함 축사방 조회
SELECT 
    r.idx,
    r.room_number,
    r.livestock_type,
    r.room_name,
    r.room_area,
    r.max_capacity,
    r.current_capacity,
    CONCAT(r.current_capacity, '/', r.max_capacity) AS capacity_status,
    ROUND((r.current_capacity / r.max_capacity) * 100, 1) AS occupancy_rate,
    r.building_code,
    CONCAT(r.building_code, ' ', r.floor_number, '층 ', r.room_position) AS location_info,
    r.room_status,
    CONCAT(r.temperature_min, '°C ~ ', r.temperature_max, '°C') AS temperature_range,
    CONCAT(r.humidity_level, '%') AS humidity_info,
    r.ventilation_type,
    r.manager_name,
    r.manager_phone,
    DATE_FORMAT(r.last_cleaning_date, '%Y-%m-%d %H:%i') AS last_cleaned,
    DATE_FORMAT(r.last_inspection_date, '%Y-%m-%d %H:%i') AS last_inspected,
    DATEDIFF(NOW(), r.last_cleaning_date) AS days_since_cleaning,
    DATEDIFF(NOW(), r.last_inspection_date) AS days_since_inspection,
    r.notes
FROM tbl_livestock_room r
WHERE r.is_active = TRUE
ORDER BY r.building_code, r.room_number;

-- ============================================================================
-- 5. 검색 및 필터링 쿼리문들
-- ============================================================================

-- 5-1. 축사번호로 검색
SELECT * FROM tbl_livestock_room 
WHERE room_number LIKE '%A-001%' AND is_active = TRUE;

-- 5-2. 가축종류로 필터링
SELECT * FROM tbl_livestock_room 
WHERE livestock_type = '돼지' AND is_active = TRUE
ORDER BY room_number;

-- 5-3. 상태별 필터링
SELECT * FROM tbl_livestock_room 
WHERE room_status = '운영중' AND is_active = TRUE
ORDER BY building_code, room_number;

-- 5-4. 수용률 기준 검색 (80% 이상)
SELECT 
    room_number,
    livestock_type,
    current_capacity,
    max_capacity,
    ROUND((current_capacity / max_capacity) * 100, 1) AS occupancy_rate
FROM tbl_livestock_room 
WHERE (current_capacity / max_capacity) * 100 >= 80 
    AND is_active = TRUE
ORDER BY occupancy_rate DESC;

-- 5-5. 관리자별 축사방 목록
SELECT * FROM tbl_livestock_room 
WHERE manager_id = 'manager001' AND is_active = TRUE
ORDER BY room_number;

-- 5-6. 최근 청소가 필요한 축사방 (7일 이상)
SELECT 
    room_number,
    livestock_type,
    DATE_FORMAT(last_cleaning_date, '%Y-%m-%d %H:%i') AS last_cleaned,
    DATEDIFF(NOW(), last_cleaning_date) AS days_since_cleaning
FROM tbl_livestock_room 
WHERE DATEDIFF(NOW(), last_cleaning_date) >= 7 
    AND is_active = TRUE
ORDER BY days_since_cleaning DESC;

-- ============================================================================
-- 6. 집계 및 통계 쿼리문들
-- ============================================================================

-- 6-1. 전체 현황 요약
SELECT 
    COUNT(*) AS total_rooms,
    COUNT(CASE WHEN room_status = '운영중' THEN 1 END) AS operating_rooms,
    COUNT(CASE WHEN room_status = '점검중' THEN 1 END) AS maintenance_rooms,
    SUM(max_capacity) AS total_capacity,
    SUM(current_capacity) AS current_livestock,
    ROUND((SUM(current_capacity) / SUM(max_capacity)) * 100, 1) AS overall_occupancy_rate,
    SUM(room_area) AS total_area
FROM tbl_livestock_room 
WHERE is_active = TRUE;

-- 6-2. 월별 신규 등록 현황
SELECT 
    DATE_FORMAT(created_date, '%Y-%m') AS month,
    COUNT(*) AS new_rooms,
    GROUP_CONCAT(DISTINCT livestock_type) AS livestock_types
FROM tbl_livestock_room 
WHERE is_active = TRUE
GROUP BY DATE_FORMAT(created_date, '%Y-%m')
ORDER BY month DESC;

-- 6-3. 가축종류별 평균 수용률
SELECT 
    livestock_type,
    COUNT(*) AS room_count,
    AVG(room_area) AS avg_area,
    AVG(max_capacity) AS avg_max_capacity,
    AVG(current_capacity) AS avg_current_capacity,
    ROUND(AVG((current_capacity / max_capacity) * 100), 1) AS avg_occupancy_rate
FROM tbl_livestock_room 
WHERE is_active = TRUE AND max_capacity > 0
GROUP BY livestock_type;

-- ============================================================================
-- 7. 데이터 관리 쿼리문들
-- ============================================================================

-- 7-1. 축사방 등록
INSERT INTO tbl_livestock_room (
    room_number, livestock_type, room_name, room_area, max_capacity,
    building_code, floor_number, room_position,
    creator_id, creator_name, manager_id, manager_name, manager_phone,
    crdt_id
) VALUES (
    'A-005', '돼지', '돼지사 A동 5호', 150.50, 100,
    'A동', 1, '중앙',
    'admin', '관리자', 'manager001', '김축사', '010-1234-5678',
    'admin'
);

-- 7-2. 축사방 정보 수정
UPDATE tbl_livestock_room 
SET 
    current_capacity = 95,
    last_cleaning_date = NOW(),
    notes = '정기 청소 완료',
    updt_dt = NOW(),
    updt_id = 'admin'
WHERE room_number = 'A-001';

-- 7-3. 축사방 상태 변경
UPDATE tbl_livestock_room 
SET 
    room_status = '점검중',
    current_capacity = 0,
    updt_dt = NOW(),
    updt_id = 'admin'
WHERE room_number = 'A-002';

-- 7-4. 축사방 비활성화 (삭제 대신)
UPDATE tbl_livestock_room 
SET 
    is_active = FALSE,
    updt_dt = NOW(),
    updt_id = 'admin'
WHERE room_number = 'A-005';

-- 7-5. 담당자 변경
UPDATE tbl_livestock_room 
SET 
    manager_id = 'new_manager',
    manager_name = '새담당자',
    manager_phone = '010-9999-8888',
    updt_dt = NOW(),
    updt_id = 'admin'
WHERE building_code = 'A동';

-- ============================================================================
-- 8. 유지보수 및 점검 관련 쿼리문들
-- ============================================================================

-- 8-1. 점검이 필요한 축사방 (30일 이상 점검 안함)
SELECT 
    room_number,
    livestock_type,
    manager_name,
    manager_phone,
    DATE_FORMAT(last_inspection_date, '%Y-%m-%d') AS last_inspection,
    DATEDIFF(NOW(), last_inspection_date) AS days_overdue
FROM tbl_livestock_room 
WHERE DATEDIFF(NOW(), last_inspection_date) > 30 
    AND is_active = TRUE
ORDER BY days_overdue DESC;

-- 8-2. 청소 스케줄 관리
SELECT 
    room_number,
    livestock_type,
    DATE_FORMAT(last_cleaning_date, '%Y-%m-%d') AS last_cleaned,
    DATE_ADD(last_cleaning_date, INTERVAL 7 DAY) AS next_cleaning_due,
    CASE 
        WHEN DATEDIFF(NOW(), last_cleaning_date) >= 7 THEN '청소 필요'
        WHEN DATEDIFF(NOW(), last_cleaning_date) >= 5 THEN '청소 예정'
        ELSE '정상'
    END AS cleaning_status
FROM tbl_livestock_room 
WHERE is_active = TRUE
ORDER BY last_cleaning_date;

-- 8-3. 수용률 경고 (90% 이상)
SELECT 
    room_number,
    livestock_type,
    current_capacity,
    max_capacity,
    ROUND((current_capacity / max_capacity) * 100, 1) AS occupancy_rate,
    manager_name,
    manager_phone
FROM tbl_livestock_room 
WHERE (current_capacity / max_capacity) * 100 >= 90 
    AND is_active = TRUE
ORDER BY occupancy_rate DESC;

-- ============================================================================
-- 9. 백업 및 복원 관련
-- ============================================================================

-- 9-1. 테이블 백업 생성
CREATE TABLE tbl_livestock_room_backup AS 
SELECT * FROM tbl_livestock_room;

-- 9-2. 데이터 내보내기 (CSV 형태)
SELECT 
    room_number,
    livestock_type,
    room_name,
    room_area,
    max_capacity,
    current_capacity,
    room_status,
    building_code,
    manager_name,
    created_date
FROM tbl_livestock_room 
WHERE is_active = TRUE
INTO OUTFILE '/tmp/livestock_rooms.csv'
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n';

-- ============================================================================
-- 10. 인덱스 최적화
-- ============================================================================

-- 복합 인덱스 추가 (자주 함께 사용되는 조건들)
CREATE INDEX idx_livestock_status ON tbl_livestock_room(livestock_type, room_status);
CREATE INDEX idx_building_status ON tbl_livestock_room(building_code, room_status);
CREATE INDEX idx_manager_active ON tbl_livestock_room(manager_id, is_active);

-- 쿼리 성능 확인
EXPLAIN SELECT * FROM tbl_livestock_room 
WHERE livestock_type = '돼지' AND room_status = '운영중';

-- ============================================================================
-- 끝
-- ============================================================================








