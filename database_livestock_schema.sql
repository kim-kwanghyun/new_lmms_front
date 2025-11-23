-- 축사방 관리 테이블
CREATE TABLE `tbl_livestock_room` (
    `idx` INT(11) NOT NULL AUTO_INCREMENT COMMENT '일련번호',
    `room_number` VARCHAR(50) NOT NULL COMMENT '축사번호',
    `livestock_type` VARCHAR(20) NOT NULL DEFAULT '돼지' COMMENT '가축종류 (돼지, 소)',
    `created_date` DATETIME NOT NULL DEFAULT SYSDATE() COMMENT '개설일시',
    `creator_id` VARCHAR(50) NOT NULL COMMENT '개설자ID',
    `crdt_dt` DATETIME NULL DEFAULT SYSDATE() COMMENT '등록일시',
    `crdt_id` VARCHAR(50) NULL DEFAULT NULL COMMENT '등록자ID',
    PRIMARY KEY (`idx`) USING BTREE,
    UNIQUE INDEX `room_number_unique` (`room_number`) USING BTREE,
    INDEX `livestock_type_idx` (`livestock_type`) USING BTREE,
    INDEX `creator_id_idx` (`creator_id`) USING BTREE
)
COMMENT='축사방 관리 테이블'
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB
AUTO_INCREMENT=1;

-- 샘플 데이터 삽입
INSERT INTO `tbl_livestock_room` (`room_number`, `livestock_type`, `created_date`, `creator_id`, `crdt_id`) VALUES
('A-001', '돼지', '2024-01-15 09:00:00', 'admin', 'admin'),
('A-002', '돼지', '2024-01-15 09:30:00', 'admin', 'admin'),
('B-001', '소', '2024-01-20 14:00:00', 'manager1', 'manager1'),
('A-003', '돼지', '2024-02-01 10:15:00', 'admin', 'admin'),
('B-002', '소', '2024-02-05 16:30:00', 'manager2', 'manager2');








