-- ============================================================================
-- 개별 돼지 관리 및 입출고 시스템 테이블 설계
-- 목적: 축사방별 개별 돼지 입고/출고 관리
-- 작성일: 2024-12-19
-- ============================================================================

-- 1. 기존 테이블 삭제 (개발 환경에서만)
DROP TABLE IF EXISTS `tbl_pig_transaction`;
DROP TABLE IF EXISTS `tbl_pig_info`;

-- ============================================================================
-- 2. 개별 돼지 정보 테이블
-- ============================================================================
CREATE TABLE `tbl_pig_info` (
    -- 기본 정보
    `pig_id` VARCHAR(50) NOT NULL COMMENT '돼지 고유번호 (Primary Key)',
    `pig_tag` VARCHAR(30) NULL DEFAULT NULL COMMENT '돼지 태그번호/귀표번호',
    `pig_name` VARCHAR(100) NULL DEFAULT NULL COMMENT '돼지 이름/별칭',
    
    -- 현재 상태
    `current_room_number` VARCHAR(50) NULL DEFAULT NULL COMMENT '현재 축사번호',
    `pig_status` ENUM('입고', '사육중', '출고', '폐사', '이동') NOT NULL DEFAULT '입고' COMMENT '돼지 상태',
    
    -- 생물학적 정보
    `breed` VARCHAR(50) NULL DEFAULT NULL COMMENT '품종 (대백, 랜드레이스, 듀록 등)',
    `gender` ENUM('수컷', '암컷', '거세') NOT NULL DEFAULT '수컷' COMMENT '성별',
    `birth_date` DATE NULL DEFAULT NULL COMMENT '출생일',
    `birth_weight` DECIMAL(5,2) NULL DEFAULT NULL COMMENT '출생시 체중(kg)',
    
    -- 입고 정보
    `entry_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '입고일시',
    `entry_weight` DECIMAL(5,2) NULL DEFAULT NULL COMMENT '입고시 체중(kg)',
    `entry_age_days` INT(11) NULL DEFAULT NULL COMMENT '입고시 일령',
    `entry_room_number` VARCHAR(50) NOT NULL COMMENT '최초 입고 축사번호',
    `supplier` VARCHAR(100) NULL DEFAULT NULL COMMENT '공급업체/농장',
    `entry_price` DECIMAL(10,2) NULL DEFAULT NULL COMMENT '입고 단가(원)',
    
    -- 현재 정보
    `current_weight` DECIMAL(5,2) NULL DEFAULT NULL COMMENT '현재 체중(kg)',
    `last_weight_date` DATETIME NULL DEFAULT NULL COMMENT '최근 체중 측정일',
    `health_status` ENUM('정상', '치료중', '격리', '관찰') NOT NULL DEFAULT '정상' COMMENT '건강상태',
    `vaccination_status` TEXT NULL DEFAULT NULL COMMENT '백신접종 이력 (JSON 형태)',
    
    -- 출고 정보
    `exit_date` DATETIME NULL DEFAULT NULL COMMENT '출고일시',
    `exit_weight` DECIMAL(5,2) NULL DEFAULT NULL COMMENT '출고시 체중(kg)',
    `exit_reason` ENUM('정상출하', '도축', '판매', '폐사', '기타') NULL DEFAULT NULL COMMENT '출고 사유',
    `exit_destination` VARCHAR(100) NULL DEFAULT NULL COMMENT '출고처',
    `exit_price` DECIMAL(10,2) NULL DEFAULT NULL COMMENT '출고 단가(원)',
    
    -- 관리 정보
    `manager_id` VARCHAR(50) NULL DEFAULT NULL COMMENT '담당 관리자ID',
    `notes` TEXT NULL DEFAULT NULL COMMENT '비고/특이사항',
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE COMMENT '활성화 여부',
    
    -- 시스템 정보
    `crdt_dt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록일시',
    `crdt_id` VARCHAR(50) NOT NULL DEFAULT 'system' COMMENT '등록자ID',
    `updt_dt` DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    `updt_id` VARCHAR(50) NULL DEFAULT NULL COMMENT '수정자ID',
    
    -- 제약 조건
    PRIMARY KEY (`pig_id`),
    UNIQUE KEY `uk_pig_tag` (`pig_tag`),
    INDEX `idx_current_room` (`current_room_number`),
    INDEX `idx_pig_status` (`pig_status`),
    INDEX `idx_entry_date` (`entry_date`),
    INDEX `idx_exit_date` (`exit_date`),
    INDEX `idx_breed` (`breed`),
    INDEX `idx_gender` (`gender`),
    INDEX `idx_health_status` (`health_status`),
    INDEX `idx_manager_id` (`manager_id`),
    INDEX `idx_is_active` (`is_active`),
    
    -- 외래키 제약 (축사방 테이블과 연결)
    FOREIGN KEY (`current_room_number`) REFERENCES `tbl_livestock_room`(`room_number`) ON UPDATE CASCADE ON DELETE SET NULL,
    FOREIGN KEY (`entry_room_number`) REFERENCES `tbl_livestock_room`(`room_number`) ON UPDATE CASCADE
)
ENGINE=InnoDB 
DEFAULT CHARSET=utf8mb4 
COLLATE=utf8mb4_unicode_ci 
COMMENT='개별 돼지 정보 관리 테이블';

-- ============================================================================
-- 3. 돼지 입출고 거래 내역 테이블
-- ============================================================================
CREATE TABLE `tbl_pig_transaction` (
    -- 기본 정보
    `transaction_id` VARCHAR(50) NOT NULL COMMENT '거래 고유번호 (Primary Key)',
    `pig_id` VARCHAR(50) NOT NULL COMMENT '돼지 고유번호',
    `transaction_type` ENUM('입고', '출고', '이동', '폐사', '체중측정') NOT NULL COMMENT '거래 유형',
    `transaction_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '거래일시',
    
    -- 축사방 정보
    `from_room_number` VARCHAR(50) NULL DEFAULT NULL COMMENT '출발 축사번호 (이동시)',
    `to_room_number` VARCHAR(50) NULL DEFAULT NULL COMMENT '도착 축사번호',
    
    -- 거래 상세 정보
    `weight` DECIMAL(5,2) NULL DEFAULT NULL COMMENT '체중(kg)',
    `age_days` INT(11) NULL DEFAULT NULL COMMENT '일령',
    `unit_price` DECIMAL(10,2) NULL DEFAULT NULL COMMENT '단가(원/kg)',
    `total_price` DECIMAL(12,2) NULL DEFAULT NULL COMMENT '총액(원)',
    
    -- 거래처 정보
    `partner_name` VARCHAR(100) NULL DEFAULT NULL COMMENT '거래처명 (공급업체/구매업체)',
    `partner_contact` VARCHAR(50) NULL DEFAULT NULL COMMENT '거래처 연락처',
    `partner_address` TEXT NULL DEFAULT NULL COMMENT '거래처 주소',
    
    -- 운송 정보
    `transport_method` VARCHAR(50) NULL DEFAULT NULL COMMENT '운송 방법',
    `transport_cost` DECIMAL(10,2) NULL DEFAULT NULL COMMENT '운송비(원)',
    `driver_name` VARCHAR(50) NULL DEFAULT NULL COMMENT '운전자명',
    `vehicle_number` VARCHAR(20) NULL DEFAULT NULL COMMENT '차량번호',
    
    -- 건강 및 품질 정보
    `health_check_result` ENUM('양호', '보통', '주의', '불량') NULL DEFAULT NULL COMMENT '건강검사 결과',
    `vaccination_info` TEXT NULL DEFAULT NULL COMMENT '백신접종 정보',
    `medication_info` TEXT NULL DEFAULT NULL COMMENT '투약 정보',
    `quality_grade` VARCHAR(20) NULL DEFAULT NULL COMMENT '등급 (특급, 1급, 2급 등)',
    
    -- 관리 정보
    `manager_id` VARCHAR(50) NOT NULL COMMENT '담당자ID',
    `approved_by` VARCHAR(50) NULL DEFAULT NULL COMMENT '승인자ID',
    `approval_date` DATETIME NULL DEFAULT NULL COMMENT '승인일시',
    `transaction_status` ENUM('대기', '진행중', '완료', '취소') NOT NULL DEFAULT '완료' COMMENT '거래 상태',
    
    -- 문서 정보
    `invoice_number` VARCHAR(50) NULL DEFAULT NULL COMMENT '송장번호',
    `certificate_number` VARCHAR(50) NULL DEFAULT NULL COMMENT '검역증명서 번호',
    `notes` TEXT NULL DEFAULT NULL COMMENT '비고',
    
    -- 시스템 정보
    `crdt_dt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록일시',
    `crdt_id` VARCHAR(50) NOT NULL DEFAULT 'system' COMMENT '등록자ID',
    `updt_dt` DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    `updt_id` VARCHAR(50) NULL DEFAULT NULL COMMENT '수정자ID',
    
    -- 제약 조건
    PRIMARY KEY (`transaction_id`),
    INDEX `idx_pig_id` (`pig_id`),
    INDEX `idx_transaction_type` (`transaction_type`),
    INDEX `idx_transaction_date` (`transaction_date`),
    INDEX `idx_from_room` (`from_room_number`),
    INDEX `idx_to_room` (`to_room_number`),
    INDEX `idx_manager_id` (`manager_id`),
    INDEX `idx_transaction_status` (`transaction_status`),
    INDEX `idx_partner_name` (`partner_name`),
    
    -- 외래키 제약
    FOREIGN KEY (`pig_id`) REFERENCES `tbl_pig_info`(`pig_id`) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (`from_room_number`) REFERENCES `tbl_livestock_room`(`room_number`) ON UPDATE CASCADE ON DELETE SET NULL,
    FOREIGN KEY (`to_room_number`) REFERENCES `tbl_livestock_room`(`room_number`) ON UPDATE CASCADE ON DELETE SET NULL
)
ENGINE=InnoDB 
DEFAULT CHARSET=utf8mb4 
COLLATE=utf8mb4_unicode_ci 
COMMENT='돼지 입출고 거래 내역 테이블';

-- ============================================================================
-- 4. 샘플 데이터 삽입
-- ============================================================================

-- 4-1. 개별 돼지 정보 샘플 데이터
INSERT INTO `tbl_pig_info` (
    `pig_id`, `pig_tag`, `pig_name`, `current_room_number`, `pig_status`,
    `breed`, `gender`, `birth_date`, `birth_weight`,
    `entry_date`, `entry_weight`, `entry_age_days`, `entry_room_number`,
    `supplier`, `entry_price`, `current_weight`, `last_weight_date`,
    `health_status`, `manager_id`, `crdt_id`
) VALUES 
-- A-001 축사방 돼지들
('PIG-A001-001', 'TAG-001', '돼지1호', 'A-001', '사육중', 
 '대백', '암컷', '2024-01-01', 1.2,
 '2024-01-15 09:00:00', 25.5, 14, 'A-001',
 '삼성농장', 180000, 85.3, '2024-12-15 14:00:00',
 '정상', 'manager001', 'admin'),

('PIG-A001-002', 'TAG-002', '돼지2호', 'A-001', '사육중',
 '랜드레이스', '수컷', '2024-01-02', 1.3,
 '2024-01-15 09:30:00', 26.2, 13, 'A-001',
 '삼성농장', 185000, 88.7, '2024-12-15 14:30:00',
 '정상', 'manager001', 'admin'),

('PIG-A001-003', 'TAG-003', '돼지3호', 'A-001', '사육중',
 '듀록', '거세', '2024-01-03', 1.1,
 '2024-01-16 10:00:00', 24.8, 13, 'A-001',
 '현대농장', 175000, 82.1, '2024-12-15 15:00:00',
 '정상', 'manager001', 'admin'),

-- A-002 축사방 돼지들
('PIG-A002-001', 'TAG-004', '돼지4호', 'A-002', '사육중',
 '대백', '암컷', '2024-01-05', 1.4,
 '2024-01-20 11:00:00', 27.1, 15, 'A-002',
 'LG농장', 190000, 89.5, '2024-12-16 09:00:00',
 '정상', 'manager001', 'admin'),

('PIG-A002-002', 'TAG-005', '돼지5호', 'A-002', '치료중',
 '랜드레이스', '수컷', '2024-01-04', 1.2,
 '2024-01-20 11:30:00', 25.8, 16, 'A-002',
 'LG농장', 180000, 78.2, '2024-12-16 09:30:00',
 '치료중', 'manager001', 'admin'),

-- 출고된 돼지
('PIG-A001-004', 'TAG-006', '출고돼지1호', NULL, '출고',
 '대백', '거세', '2024-01-01', 1.3,
 '2024-01-10 08:00:00', 24.5, 9, 'A-001',
 '삼성농장', 175000, 110.5, '2024-11-15 10:00:00',
 '정상', 'manager001', 'admin');

-- 출고 정보 업데이트
UPDATE `tbl_pig_info` 
SET 
    `exit_date` = '2024-11-15 14:00:00',
    `exit_weight` = 110.5,
    `exit_reason` = '정상출하',
    `exit_destination` = '대한육류가공',
    `exit_price` = 220000
WHERE `pig_id` = 'PIG-A001-004';

-- 4-2. 거래 내역 샘플 데이터
INSERT INTO `tbl_pig_transaction` (
    `transaction_id`, `pig_id`, `transaction_type`, `transaction_date`,
    `to_room_number`, `weight`, `age_days`, `unit_price`, `total_price`,
    `partner_name`, `partner_contact`, `health_check_result`,
    `manager_id`, `crdt_id`
) VALUES 
-- 입고 거래
('TXN-20240115-001', 'PIG-A001-001', '입고', '2024-01-15 09:00:00',
 'A-001', 25.5, 14, 7058, 180000,
 '삼성농장', '010-1111-2222', '양호',
 'manager001', 'admin'),

('TXN-20240115-002', 'PIG-A001-002', '입고', '2024-01-15 09:30:00',
 'A-001', 26.2, 13, 7061, 185000,
 '삼성농장', '010-1111-2222', '양호',
 'manager001', 'admin'),

('TXN-20240116-001', 'PIG-A001-003', '입고', '2024-01-16 10:00:00',
 'A-001', 24.8, 13, 7056, 175000,
 '현대농장', '010-3333-4444', '양호',
 'manager001', 'admin'),

-- 체중 측정 거래
('TXN-20241215-001', 'PIG-A001-001', '체중측정', '2024-12-15 14:00:00',
 'A-001', 85.3, 348, NULL, NULL,
 NULL, NULL, '양호',
 'manager001', 'admin'),

('TXN-20241215-002', 'PIG-A001-002', '체중측정', '2024-12-15 14:30:00',
 'A-001', 88.7, 347, NULL, NULL,
 NULL, NULL, '양호',
 'manager001', 'admin'),

-- 출고 거래
('TXN-20241115-001', 'PIG-A001-004', '출고', '2024-11-15 14:00:00',
 NULL, 110.5, 318, 1991, 220000,
 '대한육류가공', '010-5555-6666', '양호',
 'manager001', 'admin');

-- ============================================================================
-- 5. 기본 조회 쿼리문들
-- ============================================================================

-- 5-1. 축사방별 현재 사육 중인 돼지 목록
SELECT 
    p.pig_id,
    p.pig_tag,
    p.pig_name,
    p.current_room_number,
    p.breed,
    p.gender,
    p.current_weight,
    DATEDIFF(NOW(), p.birth_date) AS current_age_days,
    DATE_FORMAT(p.entry_date, '%Y-%m-%d') AS entry_date,
    p.health_status,
    p.manager_id
FROM tbl_pig_info p
WHERE p.pig_status = '사육중' 
    AND p.current_room_number = 'A-001'
    AND p.is_active = TRUE
ORDER BY p.entry_date;

-- 5-2. 전체 돼지 현황 요약
SELECT 
    pig_status,
    COUNT(*) AS pig_count,
    AVG(current_weight) AS avg_weight,
    SUM(CASE WHEN gender = '수컷' THEN 1 ELSE 0 END) AS male_count,
    SUM(CASE WHEN gender = '암컷' THEN 1 ELSE 0 END) AS female_count,
    SUM(CASE WHEN gender = '거세' THEN 1 ELSE 0 END) AS castrated_count
FROM tbl_pig_info 
WHERE is_active = TRUE
GROUP BY pig_status;

-- 5-3. 축사방별 돼지 현황
SELECT 
    r.room_number,
    r.livestock_type,
    COUNT(p.pig_id) AS current_pig_count,
    AVG(p.current_weight) AS avg_weight,
    MIN(p.entry_date) AS oldest_entry,
    MAX(p.entry_date) AS newest_entry
FROM tbl_livestock_room r
LEFT JOIN tbl_pig_info p ON r.room_number = p.current_room_number 
    AND p.pig_status = '사육중' 
    AND p.is_active = TRUE
WHERE r.livestock_type = '돼지'
GROUP BY r.room_number, r.livestock_type
ORDER BY r.room_number;

-- 5-4. 최근 입출고 내역
SELECT 
    t.transaction_id,
    t.pig_id,
    p.pig_tag,
    p.pig_name,
    t.transaction_type,
    DATE_FORMAT(t.transaction_date, '%Y-%m-%d %H:%i') AS transaction_date,
    t.to_room_number,
    t.weight,
    t.partner_name,
    t.manager_id
FROM tbl_pig_transaction t
JOIN tbl_pig_info p ON t.pig_id = p.pig_id
WHERE t.transaction_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
ORDER BY t.transaction_date DESC;

-- 5-5. 품종별 성장 현황
SELECT 
    breed,
    COUNT(*) AS pig_count,
    AVG(current_weight) AS avg_current_weight,
    AVG(entry_weight) AS avg_entry_weight,
    AVG(current_weight - entry_weight) AS avg_weight_gain,
    AVG(DATEDIFF(NOW(), entry_date)) AS avg_days_in_farm
FROM tbl_pig_info 
WHERE pig_status = '사육중' AND is_active = TRUE
GROUP BY breed
ORDER BY avg_weight_gain DESC;

-- ============================================================================
-- 6. 관리 및 분석 쿼리문들
-- ============================================================================

-- 6-1. 건강상태별 돼지 목록
SELECT 
    current_room_number,
    health_status,
    COUNT(*) AS pig_count,
    GROUP_CONCAT(pig_tag ORDER BY pig_tag) AS pig_tags
FROM tbl_pig_info 
WHERE pig_status = '사육중' AND is_active = TRUE
GROUP BY current_room_number, health_status
HAVING health_status != '정상'
ORDER BY current_room_number, health_status;

-- 6-2. 체중 증가율 분석
SELECT 
    p.pig_id,
    p.pig_tag,
    p.current_room_number,
    p.entry_weight,
    p.current_weight,
    (p.current_weight - p.entry_weight) AS weight_gain,
    DATEDIFF(NOW(), p.entry_date) AS days_in_farm,
    ROUND((p.current_weight - p.entry_weight) / DATEDIFF(NOW(), p.entry_date), 3) AS daily_weight_gain
FROM tbl_pig_info p
WHERE p.pig_status = '사육중' 
    AND p.is_active = TRUE
    AND p.entry_weight IS NOT NULL 
    AND p.current_weight IS NOT NULL
    AND DATEDIFF(NOW(), p.entry_date) > 0
ORDER BY daily_weight_gain DESC;

-- 6-3. 월별 입출고 통계
SELECT 
    DATE_FORMAT(transaction_date, '%Y-%m') AS month,
    transaction_type,
    COUNT(*) AS transaction_count,
    AVG(weight) AS avg_weight,
    SUM(total_price) AS total_amount
FROM tbl_pig_transaction 
WHERE transaction_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
    AND transaction_type IN ('입고', '출고')
GROUP BY DATE_FORMAT(transaction_date, '%Y-%m'), transaction_type
ORDER BY month DESC, transaction_type;

-- ============================================================================
-- 7. API에서 사용할 쿼리문들
-- ============================================================================

-- 7-1. 돼지 목록 조회 (페이징 + 검색)
SELECT 
    p.pig_id,
    p.pig_tag,
    p.pig_name,
    p.current_room_number,
    p.pig_status,
    p.breed,
    p.gender,
    p.current_weight,
    DATEDIFF(NOW(), p.birth_date) AS age_days,
    DATE_FORMAT(p.entry_date, '%Y-%m-%d %H:%i:%s') AS entry_date,
    p.health_status,
    p.manager_id
FROM tbl_pig_info p
WHERE p.is_active = TRUE
    AND (? IS NULL OR p.current_room_number = ?)
    AND (? IS NULL OR p.pig_status = ?)
    AND (? IS NULL OR p.pig_tag LIKE CONCAT('%', ?, '%') OR p.pig_name LIKE CONCAT('%', ?, '%'))
ORDER BY p.entry_date DESC
LIMIT ? OFFSET ?;

-- 7-2. 거래 내역 조회
SELECT 
    t.transaction_id,
    t.pig_id,
    p.pig_tag,
    p.pig_name,
    t.transaction_type,
    DATE_FORMAT(t.transaction_date, '%Y-%m-%d %H:%i:%s') AS transaction_date,
    t.from_room_number,
    t.to_room_number,
    t.weight,
    t.total_price,
    t.partner_name,
    t.manager_id
FROM tbl_pig_transaction t
JOIN tbl_pig_info p ON t.pig_id = p.pig_id
WHERE (? IS NULL OR t.pig_id = ?)
    AND (? IS NULL OR t.transaction_type = ?)
    AND (? IS NULL OR DATE(t.transaction_date) >= ?)
    AND (? IS NULL OR DATE(t.transaction_date) <= ?)
ORDER BY t.transaction_date DESC
LIMIT ? OFFSET ?;

-- ============================================================================
-- 끝
-- ============================================================================
