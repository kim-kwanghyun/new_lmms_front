-- ============================================================================
-- 메타데이터 패턴 관리 테이블 설계
-- 목적: 메타데이터 패턴 마스터 및 상세 정보 관리
-- 작성일: 2024-12-19
-- ============================================================================

-- 1. 메타데이터 패턴 마스터 테이블
CREATE TABLE IF NOT EXISTS `tbl_meta_pattern_master` (
    `idx` INT(11) NOT NULL AUTO_INCREMENT COMMENT '순번',
    `pattern_master_id` VARCHAR(50) NOT NULL COMMENT '패턴 마스터 ID',
    `pattern_master_name` VARCHAR(100) NOT NULL COMMENT '패턴 마스터명',
    `pattern_master_desc` TEXT NULL DEFAULT NULL COMMENT '패턴 마스터 설명',
    `crdt_id` VARCHAR(50) NOT NULL COMMENT '등록자 ID',
    `crdt_dt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록일시',
    `mdfy_id` VARCHAR(50) NULL DEFAULT NULL COMMENT '수정자 ID',
    `mdfy_dt` DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    PRIMARY KEY (`idx`),
    UNIQUE KEY `uk_pattern_master_id` (`pattern_master_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='메타데이터 패턴 마스터';

-- 2. 메타데이터 패턴 상세 테이블
CREATE TABLE IF NOT EXISTS `tbl_meta_pattern_detail` (
    `pattern_idx` INT(11) NOT NULL AUTO_INCREMENT COMMENT '패턴 순번',
    `pattern_master_id` VARCHAR(50) NOT NULL COMMENT '패턴 마스터 ID (FK)',
    `value` VARCHAR(200) NOT NULL COMMENT '패턴 값',
    `pattern_name` VARCHAR(100) NOT NULL COMMENT '패턴명',
    `pattern_desc` TEXT NULL DEFAULT NULL COMMENT '패턴 설명',
    `crdt_id` VARCHAR(50) NOT NULL COMMENT '등록자 ID',
    `crdt_dt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록일시',
    `mdfy_id` VARCHAR(50) NULL DEFAULT NULL COMMENT '수정자 ID',
    `mdfy_dt` DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    PRIMARY KEY (`pattern_idx`),
    UNIQUE KEY `uk_pattern_master_value` (`pattern_master_id`, `value`),
    FOREIGN KEY (`pattern_master_id`) REFERENCES `tbl_meta_pattern_master` (`pattern_master_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='메타데이터 패턴 상세';

-- 3. 테스트 데이터 삽입
INSERT INTO `tbl_meta_pattern_master` (`pattern_master_id`, `pattern_master_name`, `pattern_master_desc`, `crdt_id`) VALUES
('PIG_BREED', '돼지 품종', '돼지 품종 분류를 위한 패턴', 'admin'),
('PIG_STATUS', '돼지 상태', '돼지의 현재 상태를 나타내는 패턴', 'admin'),
('ROOM_TYPE', '축사 유형', '축사방의 유형 분류 패턴', 'admin'),
('FEED_TYPE', '사료 종류', '급이 사료의 종류 분류 패턴', 'admin'),
('HEALTH_STATUS', '건강 상태', '돼지의 건강 상태 분류 패턴', 'admin');

INSERT INTO `tbl_meta_pattern_detail` (`pattern_master_id`, `value`, `pattern_name`, `pattern_desc`, `crdt_id`) VALUES
-- 돼지 품종
('PIG_BREED', 'LANDRACE', '랜드레이스', '백색 품종으로 산자수가 많고 모성능력이 우수', 'admin'),
('PIG_BREED', 'YORKSHIRE', '요크셔', '대백종으로 불리며 성장이 빠르고 육질이 좋음', 'admin'),
('PIG_BREED', 'DUROC', '듀록', '적갈색 품종으로 육질이 우수하고 사료효율이 좋음', 'admin'),
('PIG_BREED', 'HAMPSHIRE', '햄프셔', '흑백 무늬 품종으로 근육 발달이 우수', 'admin'),
('PIG_BREED', 'CROSSBRED', '교잡종', '여러 품종을 교배한 잡종', 'admin'),

-- 돼지 상태
('PIG_STATUS', 'ENTRY', '입고', '농장에 새로 입고된 상태', 'admin'),
('PIG_STATUS', 'GROWING', '사육중', '정상적으로 사육되고 있는 상태', 'admin'),
('PIG_STATUS', 'READY_EXIT', '출고준비', '출고 준비가 완료된 상태', 'admin'),
('PIG_STATUS', 'EXITED', '출고완료', '농장에서 출고된 상태', 'admin'),
('PIG_STATUS', 'DEAD', '폐사', '폐사한 상태', 'admin'),

-- 축사 유형
('ROOM_TYPE', 'NURSERY', '이유실', '이유한 새끼돼지를 기르는 축사', 'admin'),
('ROOM_TYPE', 'GROWING', '육성실', '중간 크기의 돼지를 기르는 축사', 'admin'),
('ROOM_TYPE', 'FINISHING', '비육실', '출하 전 비육하는 축사', 'admin'),
('ROOM_TYPE', 'BREEDING', '번식실', '번식용 돼지를 기르는 축사', 'admin'),
('ROOM_TYPE', 'ISOLATION', '격리실', '병든 돼지나 새로 들어온 돼지를 격리하는 축사', 'admin'),

-- 사료 종류
('FEED_TYPE', 'STARTER', '이유사료', '이유한 새끼돼지용 고영양 사료', 'admin'),
('FEED_TYPE', 'GROWER', '육성사료', '중간 크기 돼지용 성장 사료', 'admin'),
('FEED_TYPE', 'FINISHER', '비육사료', '출하 전 비육용 사료', 'admin'),
('FEED_TYPE', 'BREEDER', '번식사료', '번식용 돼지 전용 사료', 'admin'),
('FEED_TYPE', 'MEDICINAL', '약용사료', '치료 목적의 첨가제가 포함된 사료', 'admin'),

-- 건강 상태
('HEALTH_STATUS', 'NORMAL', '정상', '건강한 상태', 'admin'),
('HEALTH_STATUS', 'TREATMENT', '치료중', '질병으로 인해 치료를 받고 있는 상태', 'admin'),
('HEALTH_STATUS', 'QUARANTINE', '격리', '전염병 예방을 위해 격리된 상태', 'admin'),
('HEALTH_STATUS', 'OBSERVATION', '관찰', '건강 상태를 지켜보고 있는 상태', 'admin'),
('HEALTH_STATUS', 'RECOVERY', '회복중', '치료 후 회복 중인 상태', 'admin');

-- 4. 인덱스 생성
CREATE INDEX `idx_pattern_master_name` ON `tbl_meta_pattern_master` (`pattern_master_name`);
CREATE INDEX `idx_pattern_master_crdt_dt` ON `tbl_meta_pattern_master` (`crdt_dt`);
CREATE INDEX `idx_pattern_detail_name` ON `tbl_meta_pattern_detail` (`pattern_name`);
CREATE INDEX `idx_pattern_detail_crdt_dt` ON `tbl_meta_pattern_detail` (`crdt_dt`);

-- 5. 데이터 확인 쿼리
SELECT 
    m.idx,
    m.pattern_master_id,
    m.pattern_master_name,
    m.pattern_master_desc,
    m.crdt_id,
    m.crdt_dt,
    COUNT(d.pattern_idx) as detail_count
FROM tbl_meta_pattern_master m
LEFT JOIN tbl_meta_pattern_detail d ON m.pattern_master_id = d.pattern_master_id
GROUP BY m.idx, m.pattern_master_id, m.pattern_master_name, m.pattern_master_desc, m.crdt_id, m.crdt_dt
ORDER BY m.crdt_dt DESC;
