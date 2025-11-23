-- ============================================================================
-- 돼지 급이량/급수량 관리 시스템 테이블 설계
-- 목적: 축사별, 돼지별 일일 사료 및 물 공급량 관리
-- 작성일: 2024-12-19
-- ============================================================================

-- 1. 기존 테이블 삭제 (개발 환경에서만)
DROP TABLE IF EXISTS `tbl_pig_daily_feeding`;
DROP TABLE IF EXISTS `tbl_feeding_standard`;

-- ============================================================================
-- 2. 급이 기준 테이블 (사료/급수 기준량 관리)
-- ============================================================================
CREATE TABLE `tbl_feeding_standard` (
    -- 기본 정보
    `standard_id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '기준 ID (Primary Key)',
    `standard_name` VARCHAR(100) NOT NULL COMMENT '기준명',
    `pig_type` ENUM('자돈', '육성돈', '비육돈', '모돈', '웅돈') NOT NULL COMMENT '돼지 구분',
    `weight_min` DECIMAL(5,2) NOT NULL COMMENT '최소 체중(kg)',
    `weight_max` DECIMAL(5,2) NOT NULL COMMENT '최대 체중(kg)',
    
    -- 급이 기준량
    `feed_amount_per_day` DECIMAL(6,2) NOT NULL COMMENT '일일 사료량(kg)',
    `feed_times_per_day` TINYINT(2) NOT NULL DEFAULT 3 COMMENT '일일 급이 횟수',
    `feed_amount_per_time` DECIMAL(6,2) NOT NULL COMMENT '회당 사료량(kg)',
    
    -- 급수 기준량
    `water_amount_per_day` DECIMAL(6,2) NOT NULL COMMENT '일일 급수량(L)',
    `water_times_per_day` TINYINT(2) NOT NULL DEFAULT 6 COMMENT '일일 급수 횟수',
    `water_amount_per_time` DECIMAL(6,2) NOT NULL COMMENT '회당 급수량(L)',
    
    -- 환경 조건
    `season` ENUM('봄', '여름', '가을', '겨울', '전년') NOT NULL DEFAULT '전년' COMMENT '계절별 기준',
    `temperature_min` DECIMAL(4,1) NULL DEFAULT NULL COMMENT '적용 최저온도(℃)',
    `temperature_max` DECIMAL(4,1) NULL DEFAULT NULL COMMENT '적용 최고온도(℃)',
    
    -- 사료 정보
    `feed_type` VARCHAR(50) NULL DEFAULT NULL COMMENT '사료 종류',
    `feed_protein_rate` DECIMAL(4,1) NULL DEFAULT NULL COMMENT '조단백질 함량(%)',
    `feed_energy` DECIMAL(6,2) NULL DEFAULT NULL COMMENT '에너지(kcal/kg)',
    
    -- 상태 정보
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE COMMENT '활성화 여부',
    `description` TEXT NULL DEFAULT NULL COMMENT '설명',
    
    -- 시스템 정보
    `crdt_dt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록일시',
    `crdt_id` VARCHAR(50) NOT NULL DEFAULT 'system' COMMENT '등록자ID',
    `updt_dt` DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    `updt_id` VARCHAR(50) NULL DEFAULT NULL COMMENT '수정자ID',
    
    -- 제약 조건
    PRIMARY KEY (`standard_id`),
    UNIQUE KEY `uk_standard_name` (`standard_name`),
    INDEX `idx_pig_type` (`pig_type`),
    INDEX `idx_weight_range` (`weight_min`, `weight_max`),
    INDEX `idx_season` (`season`),
    INDEX `idx_is_active` (`is_active`)
)
ENGINE=InnoDB 
AUTO_INCREMENT=1 
DEFAULT CHARSET=utf8mb4 
COLLATE=utf8mb4_unicode_ci 
COMMENT='급이 기준 테이블';

-- ============================================================================
-- 3. 일일 급이/급수 실적 테이블
-- ============================================================================
CREATE TABLE `tbl_pig_daily_feeding` (
    -- 기본 정보
    `feeding_id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '급이 ID (Primary Key)',
    `pig_id` VARCHAR(50) NOT NULL COMMENT '돼지 고유번호',
    `room_number` VARCHAR(50) NOT NULL COMMENT '축사번호',
    `feeding_date` DATE NOT NULL COMMENT '급이일 (YYYY-MM-DD)',
    `feeding_time` TIME NOT NULL COMMENT '급이시간 (HH:MM:SS)',
    `feeding_round` TINYINT(2) NOT NULL COMMENT '급이 차수 (1회차, 2회차 등)',
    
    -- 돼지 상태 정보
    `pig_weight` DECIMAL(5,2) NULL DEFAULT NULL COMMENT '측정 체중(kg)',
    `pig_condition` ENUM('정상', '식욕부진', '병약', '스트레스') NOT NULL DEFAULT '정상' COMMENT '돼지 상태',
    `weather_condition` VARCHAR(50) NULL DEFAULT NULL COMMENT '날씨 상태',
    `temperature` DECIMAL(4,1) NULL DEFAULT NULL COMMENT '기온(℃)',
    `humidity` DECIMAL(4,1) NULL DEFAULT NULL COMMENT '습도(%)',
    
    -- 급이 정보
    `feed_type` VARCHAR(50) NULL DEFAULT NULL COMMENT '사료 종류',
    `feed_planned_amount` DECIMAL(6,2) NOT NULL COMMENT '계획 급이량(kg)',
    `feed_actual_amount` DECIMAL(6,2) NOT NULL COMMENT '실제 급이량(kg)',
    `feed_consumed_amount` DECIMAL(6,2) NULL DEFAULT NULL COMMENT '섭취량(kg)',
    `feed_leftover_amount` DECIMAL(6,2) NULL DEFAULT NULL COMMENT '잔량(kg)',
    `feed_consumption_rate` DECIMAL(5,2) NULL DEFAULT NULL COMMENT '섭취율(%)',
    
    -- 급수 정보
    `water_planned_amount` DECIMAL(6,2) NOT NULL COMMENT '계획 급수량(L)',
    `water_actual_amount` DECIMAL(6,2) NOT NULL COMMENT '실제 급수량(L)',
    `water_consumed_amount` DECIMAL(6,2) NULL DEFAULT NULL COMMENT '음수량(L)',
    `water_leftover_amount` DECIMAL(6,2) NULL DEFAULT NULL COMMENT '잔량(L)',
    `water_consumption_rate` DECIMAL(5,2) NULL DEFAULT NULL COMMENT '음수율(%)',
    
    -- 급이 방법 및 장비
    `feeding_method` ENUM('자동급이', '수동급이', '혼합급이') NOT NULL DEFAULT '자동급이' COMMENT '급이 방법',
    `feeding_equipment` VARCHAR(100) NULL DEFAULT NULL COMMENT '급이 장비',
    `water_method` ENUM('자동급수', '수동급수', '혼합급수') NOT NULL DEFAULT '자동급수' COMMENT '급수 방법',
    `water_equipment` VARCHAR(100) NULL DEFAULT NULL COMMENT '급수 장비',
    
    -- 품질 및 안전
    `feed_quality` ENUM('우수', '양호', '보통', '불량') NULL DEFAULT NULL COMMENT '사료 품질',
    `water_quality` ENUM('우수', '양호', '보통', '불량') NULL DEFAULT NULL COMMENT '급수 품질',
    `hygiene_status` ENUM('청결', '보통', '불결') NOT NULL DEFAULT '청결' COMMENT '위생상태',
    
    -- 비용 정보
    `feed_unit_cost` DECIMAL(8,2) NULL DEFAULT NULL COMMENT '사료 단가(원/kg)',
    `feed_total_cost` DECIMAL(10,2) NULL DEFAULT NULL COMMENT '사료 총비용(원)',
    `water_unit_cost` DECIMAL(8,2) NULL DEFAULT NULL COMMENT '물 단가(원/L)',
    `water_total_cost` DECIMAL(10,2) NULL DEFAULT NULL COMMENT '급수 총비용(원)',
    
    -- 관리 정보
    `manager_id` VARCHAR(50) NOT NULL COMMENT '급이 담당자ID',
    `manager_name` VARCHAR(100) NULL DEFAULT NULL COMMENT '급이 담당자명',
    `checker_id` VARCHAR(50) NULL DEFAULT NULL COMMENT '확인자ID',
    `check_time` DATETIME NULL DEFAULT NULL COMMENT '확인시간',
    
    -- 특이사항
    `notes` TEXT NULL DEFAULT NULL COMMENT '특이사항/비고',
    `feeding_issues` TEXT NULL DEFAULT NULL COMMENT '급이 관련 문제사항',
    `health_observations` TEXT NULL DEFAULT NULL COMMENT '건강 관찰사항',
    
    -- 시스템 정보
    `crdt_dt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록일시',
    `crdt_id` VARCHAR(50) NOT NULL DEFAULT 'system' COMMENT '등록자ID',
    `updt_dt` DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    `updt_id` VARCHAR(50) NULL DEFAULT NULL COMMENT '수정자ID',
    
    -- 제약 조건
    PRIMARY KEY (`feeding_id`),
    UNIQUE KEY `uk_pig_feeding_time` (`pig_id`, `feeding_date`, `feeding_time`, `feeding_round`),
    INDEX `idx_pig_id` (`pig_id`),
    INDEX `idx_room_number` (`room_number`),
    INDEX `idx_feeding_date` (`feeding_date`),
    INDEX `idx_feeding_round` (`feeding_round`),
    INDEX `idx_manager_id` (`manager_id`),
    INDEX `idx_pig_condition` (`pig_condition`),
    INDEX `idx_feeding_method` (`feeding_method`),
    
    -- 외래키 제약
    FOREIGN KEY (`pig_id`) REFERENCES `tbl_pig_info`(`pig_id`) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (`room_number`) REFERENCES `tbl_livestock_room`(`room_number`) ON UPDATE CASCADE ON DELETE CASCADE
)
ENGINE=InnoDB 
AUTO_INCREMENT=1 
DEFAULT CHARSET=utf8mb4 
COLLATE=utf8mb4_unicode_ci 
COMMENT='일일 급이/급수 실적 테이블';

-- ============================================================================
-- 4. 급이 기준 샘플 데이터 삽입
-- ============================================================================
INSERT INTO `tbl_feeding_standard` (
    `standard_name`, `pig_type`, `weight_min`, `weight_max`,
    `feed_amount_per_day`, `feed_times_per_day`, `feed_amount_per_time`,
    `water_amount_per_day`, `water_times_per_day`, `water_amount_per_time`,
    `season`, `feed_type`, `feed_protein_rate`, `feed_energy`,
    `description`, `crdt_id`
) VALUES 
-- 자돈 기준
('자돈 기본기준', '자돈', 5.0, 30.0, 1.5, 4, 0.375, 4.0, 8, 0.5, '전년', '자돈용사료', 20.0, 3400, '이유 후 자돈 표준 급이기준', 'admin'),

-- 육성돈 기준
('육성돈 기본기준', '육성돈', 30.0, 60.0, 2.8, 3, 0.93, 8.0, 6, 1.33, '전년', '육성돈용사료', 18.0, 3300, '육성돈 표준 급이기준', 'admin'),

-- 비육돈 기준 (전기)
('비육돈 전기기준', '비육돈', 60.0, 85.0, 3.2, 3, 1.07, 12.0, 6, 2.0, '전년', '비육전기사료', 16.0, 3250, '비육돈 전기 급이기준', 'admin'),

-- 비육돈 기준 (후기)
('비육돈 후기기준', '비육돈', 85.0, 120.0, 3.8, 2, 1.9, 15.0, 6, 2.5, '전년', '비육후기사료', 14.0, 3200, '비육돈 후기 급이기준', 'admin'),

-- 모돈 기준 (임신기)
('모돈 임신기기준', '모돈', 150.0, 250.0, 3.5, 2, 1.75, 18.0, 6, 3.0, '전년', '모돈사료', 14.5, 3150, '임신모돈 급이기준', 'admin'),

-- 모돈 기준 (포유기)
('모돈 포유기기준', '모돈', 150.0, 250.0, 6.5, 3, 2.17, 25.0, 8, 3.125, '전년', '포유모돈사료', 18.0, 3400, '포유모돈 급이기준', 'admin');

-- ============================================================================
-- 5. 일일 급이/급수 샘플 데이터 삽입
-- ============================================================================
INSERT INTO `tbl_pig_daily_feeding` (
    `pig_id`, `room_number`, `feeding_date`, `feeding_time`, `feeding_round`,
    `pig_weight`, `pig_condition`, `temperature`, `humidity`,
    `feed_type`, `feed_planned_amount`, `feed_actual_amount`, `feed_consumed_amount`, `feed_leftover_amount`,
    `water_planned_amount`, `water_actual_amount`, `water_consumed_amount`, `water_leftover_amount`,
    `feeding_method`, `water_method`, `feed_quality`, `water_quality`, `hygiene_status`,
    `manager_id`, `manager_name`, `notes`, `crdt_id`
) VALUES 
-- PIG-A001-001 급이 기록 (오늘)
('PIG-A001-001', 'A-001', CURDATE(), '07:00:00', 1, 85.3, '정상', 18.5, 65.0,
 '비육전기사료', 1.07, 1.07, 1.05, 0.02,
 2.0, 2.0, 1.9, 0.1,
 '자동급이', '자동급수', '우수', '양호', '청결',
 'manager001', '김축사', '정상 급이 완료', 'manager001'),

('PIG-A001-001', 'A-001', CURDATE(), '13:00:00', 2, 85.3, '정상', 22.0, 68.0,
 '비육전기사료', 1.07, 1.07, 1.07, 0.00,
 2.0, 2.0, 1.95, 0.05,
 '자동급이', '자동급수', '우수', '양호', '청결',
 'manager001', '김축사', '완전 섭취', 'manager001'),

('PIG-A001-001', 'A-001', CURDATE(), '19:00:00', 3, 85.3, '정상', 19.5, 70.0,
 '비육전기사료', 1.07, 1.07, 1.06, 0.01,
 2.0, 2.0, 1.88, 0.12,
 '자동급이', '자동급수', '우수', '양호', '청결',
 'manager001', '김축사', '저녁 급이 완료', 'manager001'),

-- PIG-A001-002 급이 기록 (오늘)
('PIG-A001-002', 'A-001', CURDATE(), '07:00:00', 1, 88.7, '정상', 18.5, 65.0,
 '비육전기사료', 1.07, 1.07, 1.07, 0.00,
 2.0, 2.0, 2.0, 0.0,
 '자동급이', '자동급수', '우수', '양호', '청결',
 'manager001', '김축사', '완전 섭취', 'manager001'),

('PIG-A001-002', 'A-001', CURDATE(), '13:00:00', 2, 88.7, '정상', 22.0, 68.0,
 '비육전기사료', 1.07, 1.07, 1.05, 0.02,
 2.0, 2.0, 1.92, 0.08,
 '자동급이', '자동급수', '우수', '양호', '청결',
 'manager001', '김축사', '정상 급이', 'manager001'),

-- 어제 데이터
('PIG-A001-001', 'A-001', DATE_SUB(CURDATE(), INTERVAL 1 DAY), '07:00:00', 1, 85.1, '정상', 17.0, 62.0,
 '비육전기사료', 1.07, 1.07, 1.04, 0.03,
 2.0, 2.0, 1.85, 0.15,
 '자동급이', '자동급수', '양호', '양호', '청결',
 'manager001', '김축사', '어제 아침 급이', 'manager001'),

('PIG-A001-001', 'A-001', DATE_SUB(CURDATE(), INTERVAL 1 DAY), '13:00:00', 2, 85.1, '정상', 20.5, 65.0,
 '비육전기사료', 1.07, 1.07, 1.07, 0.00,
 2.0, 2.0, 1.98, 0.02,
 '자동급이', '자동급수', '양호', '양호', '청결',
 'manager001', '김축사', '어제 점심 급이', 'manager001'),

('PIG-A001-001', 'A-001', DATE_SUB(CURDATE(), INTERVAL 1 DAY), '19:00:00', 3, 85.1, '정상', 18.0, 68.0,
 '비육전기사료', 1.07, 1.07, 1.05, 0.02,
 2.0, 2.0, 1.9, 0.1,
 '자동급이', '자동급수', '양호', '양호', '청결',
 'manager001', '김축사', '어제 저녁 급이', 'manager001');

-- ============================================================================
-- 6. 기본 조회 쿼리문들
-- ============================================================================

-- 6-1. 특정 돼지의 최근 7일 급이 현황
SELECT 
    pf.feeding_date,
    pf.feeding_round,
    TIME_FORMAT(pf.feeding_time, '%H:%i') as feeding_time,
    pf.feed_planned_amount,
    pf.feed_actual_amount,
    pf.feed_consumed_amount,
    pf.feed_consumption_rate,
    pf.water_planned_amount,
    pf.water_actual_amount,
    pf.water_consumed_amount,
    pf.water_consumption_rate,
    pf.pig_condition,
    pf.manager_name
FROM tbl_pig_daily_feeding pf
WHERE pf.pig_id = 'PIG-A001-001'
    AND pf.feeding_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
ORDER BY pf.feeding_date DESC, pf.feeding_time DESC;

-- 6-2. 축사별 일일 급이 현황 요약
SELECT 
    pf.room_number,
    pf.feeding_date,
    COUNT(DISTINCT pf.pig_id) as pig_count,
    COUNT(*) as feeding_count,
    SUM(pf.feed_actual_amount) as total_feed_amount,
    SUM(pf.water_actual_amount) as total_water_amount,
    AVG(pf.feed_consumption_rate) as avg_feed_consumption_rate,
    AVG(pf.water_consumption_rate) as avg_water_consumption_rate
FROM tbl_pig_daily_feeding pf
WHERE pf.feeding_date = CURDATE()
GROUP BY pf.room_number, pf.feeding_date
ORDER BY pf.room_number;

-- 6-3. 급이 기준 대비 실적 분석
SELECT 
    pf.pig_id,
    pi.pig_name,
    pi.current_weight,
    fs.standard_name,
    fs.feed_amount_per_day as standard_feed,
    SUM(pf.feed_actual_amount) as actual_feed_today,
    ROUND((SUM(pf.feed_actual_amount) / fs.feed_amount_per_day) * 100, 1) as feed_achievement_rate,
    fs.water_amount_per_day as standard_water,
    SUM(pf.water_actual_amount) as actual_water_today,
    ROUND((SUM(pf.water_actual_amount) / fs.water_amount_per_day) * 100, 1) as water_achievement_rate
FROM tbl_pig_daily_feeding pf
JOIN tbl_pig_info pi ON pf.pig_id = pi.pig_id
LEFT JOIN tbl_feeding_standard fs ON pi.current_weight BETWEEN fs.weight_min AND fs.weight_max 
    AND fs.pig_type = '비육돈' AND fs.is_active = TRUE
WHERE pf.feeding_date = CURDATE()
GROUP BY pf.pig_id, pi.pig_name, pi.current_weight, fs.standard_name, fs.feed_amount_per_day, fs.water_amount_per_day
ORDER BY pf.pig_id;

-- ============================================================================
-- 끝
-- ============================================================================
