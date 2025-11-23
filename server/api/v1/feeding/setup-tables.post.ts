import mysql from 'mysql2/promise'
import { defineEventHandler, createError } from 'h3'
import { getPool } from '~/server/utils/dbConfig'

export default defineEventHandler(async (event) => {
  let connection
  try {
    console.log('급이 관리 테이블 설정 API 호출됨')

    const pool = getPool()
    connection = await pool.getConnection()

    // 트랜잭션 시작
    await connection.beginTransaction()

    try {
      // 1. tbl_feeding_standard 테이블 생성
      const feedingStandardTable = `
        CREATE TABLE IF NOT EXISTS \`tbl_feeding_standard\` (
          \`standard_id\` INT(11) NOT NULL AUTO_INCREMENT,
          \`standard_name\` VARCHAR(100) NOT NULL COMMENT '기준 이름',
          \`pig_type\` VARCHAR(50) NOT NULL COMMENT '돼지 유형 (자돈, 육성돈, 비육돈)',
          \`weight_min\` DECIMAL(5,2) NOT NULL COMMENT '최소 체중(kg)',
          \`weight_max\` DECIMAL(5,2) NOT NULL COMMENT '최대 체중(kg)',
          \`feed_amount_per_day\` DECIMAL(5,2) NOT NULL COMMENT '일일 사료량(kg)',
          \`feed_times_per_day\` INT(2) NOT NULL DEFAULT 3 COMMENT '일일 급이 횟수',
          \`feed_amount_per_time\` DECIMAL(5,2) NOT NULL COMMENT '회당 사료량(kg)',
          \`water_amount_per_day\` DECIMAL(5,2) NOT NULL COMMENT '일일 급수량(L)',
          \`water_times_per_day\` INT(2) NOT NULL DEFAULT 6 COMMENT '일일 급수 횟수',
          \`water_amount_per_time\` DECIMAL(5,2) NOT NULL COMMENT '회당 급수량(L)',
          \`season\` VARCHAR(20) NULL DEFAULT NULL COMMENT '계절 (봄, 여름, 가을, 겨울)',
          \`temperature_min\` DECIMAL(4,1) NULL DEFAULT NULL COMMENT '최소 온도(℃)',
          \`temperature_max\` DECIMAL(4,1) NULL DEFAULT NULL COMMENT '최대 온도(℃)',
          \`feed_type\` VARCHAR(50) NULL DEFAULT NULL COMMENT '사료 종류',
          \`feed_protein_rate\` DECIMAL(4,1) NULL DEFAULT NULL COMMENT '사료 단백질 함량(%)',
          \`feed_energy\` DECIMAL(6,2) NULL DEFAULT NULL COMMENT '사료 에너지(kcal/kg)',
          \`is_active\` BOOLEAN NOT NULL DEFAULT TRUE COMMENT '활성 상태',
          \`description\` TEXT NULL DEFAULT NULL COMMENT '설명',
          \`crdt_dt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
          \`crdt_id\` VARCHAR(50) NOT NULL DEFAULT 'system' COMMENT '생성자ID',
          PRIMARY KEY (\`standard_id\`) USING BTREE,
          INDEX \`idx_pig_type_weight\` (\`pig_type\`, \`weight_min\`, \`weight_max\`) USING BTREE,
          INDEX \`idx_active\` (\`is_active\`) USING BTREE
        ) COMMENT='급이 기준 정보' COLLATE='utf8mb4_unicode_ci' ENGINE=InnoDB;
      `

      // 2. tbl_pig_daily_feeding 테이블 생성 (실제 스키마와 일치)
      const pigDailyFeedingTable = `
        CREATE TABLE IF NOT EXISTS \`tbl_pig_daily_feeding\` (
          \`feeding_id\` INT(11) NOT NULL AUTO_INCREMENT COMMENT '급이 ID (Primary Key)',
          \`pig_id\` VARCHAR(50) NOT NULL COMMENT '돼지 고유번호' COLLATE 'utf8mb4_unicode_ci',
          \`room_number\` VARCHAR(50) NOT NULL COMMENT '축사번호' COLLATE 'utf8mb4_unicode_ci',
          \`feeding_date\` DATE NOT NULL COMMENT '급이일 (YYYY-MM-DD)',
          \`feeding_time\` TIME NOT NULL COMMENT '급이시간 (HH:MM:SS)',
          \`feeding_round\` TINYINT(2) NOT NULL COMMENT '급이 차수 (1회차, 2회차 등)',
          \`pig_weight\` DECIMAL(5,2) NULL DEFAULT NULL COMMENT '측정 체중(kg)',
          \`pig_condition\` ENUM('정상','식욕부진','병약','스트레스') NOT NULL DEFAULT '정상' COMMENT '돼지 상태' COLLATE 'utf8mb4_unicode_ci',
          \`weather_condition\` VARCHAR(50) NULL DEFAULT NULL COMMENT '날씨 상태' COLLATE 'utf8mb4_unicode_ci',
          \`temperature\` DECIMAL(4,1) NULL DEFAULT NULL COMMENT '기온(℃)',
          \`humidity\` DECIMAL(4,1) NULL DEFAULT NULL COMMENT '습도(%)',
          \`feed_type\` VARCHAR(50) NULL DEFAULT NULL COMMENT '사료 종류' COLLATE 'utf8mb4_unicode_ci',
          \`feed_planned_amount\` DECIMAL(6,2) NOT NULL COMMENT '계획 급이량(kg)',
          \`feed_actual_amount\` DECIMAL(6,2) NOT NULL COMMENT '실제 급이량(kg)',
          \`feed_consumed_amount\` DECIMAL(6,2) NULL DEFAULT NULL COMMENT '섭취량(kg)',
          \`feed_leftover_amount\` DECIMAL(6,2) NULL DEFAULT NULL COMMENT '잔량(kg)',
          \`feed_consumption_rate\` DECIMAL(5,2) NULL DEFAULT NULL COMMENT '섭취율(%)',
          \`water_planned_amount\` DECIMAL(6,2) NOT NULL COMMENT '계획 급수량(L)',
          \`water_actual_amount\` DECIMAL(6,2) NOT NULL COMMENT '실제 급수량(L)',
          \`water_consumed_amount\` DECIMAL(6,2) NULL DEFAULT NULL COMMENT '음수량(L)',
          \`water_leftover_amount\` DECIMAL(6,2) NULL DEFAULT NULL COMMENT '잔량(L)',
          \`water_consumption_rate\` DECIMAL(5,2) NULL DEFAULT NULL COMMENT '음수율(%)',
          \`feeding_method\` ENUM('자동급이','수동급이','혼합급이') NOT NULL DEFAULT '자동급이' COMMENT '급이 방법' COLLATE 'utf8mb4_unicode_ci',
          \`feeding_equipment\` VARCHAR(100) NULL DEFAULT NULL COMMENT '급이 장비' COLLATE 'utf8mb4_unicode_ci',
          \`water_method\` ENUM('자동급수','수동급수','혼합급수') NOT NULL DEFAULT '자동급수' COMMENT '급수 방법' COLLATE 'utf8mb4_unicode_ci',
          \`water_equipment\` VARCHAR(100) NULL DEFAULT NULL COMMENT '급수 장비' COLLATE 'utf8mb4_unicode_ci',
          \`feed_quality\` ENUM('우수','양호','보통','불량') NULL DEFAULT NULL COMMENT '사료 품질' COLLATE 'utf8mb4_unicode_ci',
          \`water_quality\` ENUM('우수','양호','보통','불량') NULL DEFAULT NULL COMMENT '급수 품질' COLLATE 'utf8mb4_unicode_ci',
          \`hygiene_status\` ENUM('청결','보통','불결') NOT NULL DEFAULT '청결' COMMENT '위생상태' COLLATE 'utf8mb4_unicode_ci',
          \`feed_unit_cost\` DECIMAL(8,2) NULL DEFAULT NULL COMMENT '사료 단가(원/kg)',
          \`feed_total_cost\` DECIMAL(10,2) NULL DEFAULT NULL COMMENT '사료 총비용(원)',
          \`water_unit_cost\` DECIMAL(8,2) NULL DEFAULT NULL COMMENT '물 단가(원/L)',
          \`water_total_cost\` DECIMAL(10,2) NULL DEFAULT NULL COMMENT '급수 총비용(원)',
          \`manager_id\` VARCHAR(50) NOT NULL COMMENT '급이 담당자ID' COLLATE 'utf8mb4_unicode_ci',
          \`manager_name\` VARCHAR(100) NULL DEFAULT NULL COMMENT '급이 담당자명' COLLATE 'utf8mb4_unicode_ci',
          \`checker_id\` VARCHAR(50) NULL DEFAULT NULL COMMENT '확인자ID' COLLATE 'utf8mb4_unicode_ci',
          \`check_time\` DATETIME NULL DEFAULT NULL COMMENT '확인시간',
          \`notes\` TEXT NULL DEFAULT NULL COMMENT '특이사항/비고' COLLATE 'utf8mb4_unicode_ci',
          \`feeding_issues\` TEXT NULL DEFAULT NULL COMMENT '급이 관련 문제사항' COLLATE 'utf8mb4_unicode_ci',
          \`health_observations\` TEXT NULL DEFAULT NULL COMMENT '건강 관찰사항' COLLATE 'utf8mb4_unicode_ci',
          \`crdt_dt\` DATETIME NOT NULL DEFAULT current_timestamp() COMMENT '등록일시',
          \`crdt_id\` VARCHAR(50) NOT NULL DEFAULT 'system' COMMENT '등록자ID' COLLATE 'utf8mb4_unicode_ci',
          \`updt_dt\` DATETIME NULL DEFAULT NULL ON UPDATE current_timestamp() COMMENT '수정일시',
          \`updt_id\` VARCHAR(50) NULL DEFAULT NULL COMMENT '수정자ID' COLLATE 'utf8mb4_unicode_ci',
          PRIMARY KEY (\`feeding_id\`) USING BTREE,
          UNIQUE INDEX \`uk_pig_feeding_time\` (\`pig_id\`, \`feeding_date\`, \`feeding_time\`, \`feeding_round\`) USING BTREE,
          INDEX \`idx_pig_id\` (\`pig_id\`) USING BTREE,
          INDEX \`idx_room_number\` (\`room_number\`) USING BTREE,
          INDEX \`idx_feeding_date\` (\`feeding_date\`) USING BTREE,
          INDEX \`idx_feeding_round\` (\`feeding_round\`) USING BTREE,
          INDEX \`idx_manager_id\` (\`manager_id\`) USING BTREE,
          INDEX \`idx_pig_condition\` (\`pig_condition\`) USING BTREE,
          INDEX \`idx_feeding_method\` (\`feeding_method\`) USING BTREE
        ) COMMENT='일일 급이/급수 실적 테이블' COLLATE='utf8mb4_unicode_ci' ENGINE=InnoDB AUTO_INCREMENT=10;
      `

      console.log('급이 기준 테이블 생성 중...')
      await connection.execute(feedingStandardTable)

      console.log('일일 급이 기록 테이블 생성 중...')
      await connection.execute(pigDailyFeedingTable)

      // 기본 급이 기준 데이터 삽입
      const defaultStandards = [
        {
          standard_name: '자돈 급이기준 (5-20kg)',
          pig_type: '자돈',
          weight_min: 5.0,
          weight_max: 20.0,
          feed_amount_per_day: 1.0,
          feed_times_per_day: 4,
          feed_amount_per_time: 0.25,
          water_amount_per_day: 2.5,
          water_times_per_day: 8,
          water_amount_per_time: 0.31,
          feed_type: '자돈사료',
          feed_protein_rate: 20.0,
          feed_energy: 3400.0,
          description: '5-20kg 자돈을 위한 기본 급이 기준'
        },
        {
          standard_name: '육성돈 급이기준 (20-50kg)',
          pig_type: '육성돈',
          weight_min: 20.0,
          weight_max: 50.0,
          feed_amount_per_day: 2.0,
          feed_times_per_day: 3,
          feed_amount_per_time: 0.67,
          water_amount_per_day: 5.0,
          water_times_per_day: 6,
          water_amount_per_time: 0.83,
          feed_type: '육성돈사료',
          feed_protein_rate: 18.0,
          feed_energy: 3300.0,
          description: '20-50kg 육성돈을 위한 기본 급이 기준'
        },
        {
          standard_name: '비육돈 급이기준 (50-110kg)',
          pig_type: '비육돈',
          weight_min: 50.0,
          weight_max: 110.0,
          feed_amount_per_day: 2.8,
          feed_times_per_day: 3,
          feed_amount_per_time: 0.93,
          water_amount_per_day: 7.0,
          water_times_per_day: 6,
          water_amount_per_time: 1.17,
          feed_type: '비육돈사료',
          feed_protein_rate: 16.0,
          feed_energy: 3200.0,
          description: '50-110kg 비육돈을 위한 기본 급이 기준'
        }
      ]

      // 기존 기본 데이터가 있는지 확인
      const [existingStandards] = await connection.execute(`
        SELECT COUNT(*) as count FROM tbl_feeding_standard WHERE crdt_id = 'system'
      `)
      
      const existingCount = (existingStandards as any[])[0].count

      if (existingCount === 0) {
        console.log('기본 급이 기준 데이터 삽입 중...')
        
        const insertStandardQuery = `
          INSERT INTO tbl_feeding_standard (
            standard_name, pig_type, weight_min, weight_max,
            feed_amount_per_day, feed_times_per_day, feed_amount_per_time,
            water_amount_per_day, water_times_per_day, water_amount_per_time,
            feed_type, feed_protein_rate, feed_energy, description, crdt_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `

        for (const standard of defaultStandards) {
          await connection.execute(insertStandardQuery, [
            standard.standard_name, standard.pig_type, standard.weight_min, standard.weight_max,
            standard.feed_amount_per_day, standard.feed_times_per_day, standard.feed_amount_per_time,
            standard.water_amount_per_day, standard.water_times_per_day, standard.water_amount_per_time,
            standard.feed_type, standard.feed_protein_rate, standard.feed_energy, standard.description, 'system'
          ])
        }

        console.log(`기본 급이 기준 ${defaultStandards.length}개 삽입 완료`)
      } else {
        console.log(`기본 급이 기준 데이터 이미 존재 (${existingCount}개)`)
      }

      // 트랜잭션 커밋
      await connection.commit()

      // 테이블 정보 확인
      const [feedingStandardInfo] = await connection.execute(`
        SELECT COUNT(*) as count FROM tbl_feeding_standard
      `)
      const [pigDailyFeedingInfo] = await connection.execute(`
        SELECT COUNT(*) as count FROM tbl_pig_daily_feeding
      `)

      const standardCount = (feedingStandardInfo as any[])[0].count
      const dailyFeedingCount = (pigDailyFeedingInfo as any[])[0].count

      console.log('급이 관리 테이블 설정 완료')
      console.log(`- 급이 기준: ${standardCount}건`)
      console.log(`- 일일 급이 기록: ${dailyFeedingCount}건`)

      return {
        success: true,
        message: 'Feeding management tables setup completed successfully',
        data: {
          tablesCreated: ['tbl_feeding_standard', 'tbl_pig_daily_feeding'],
          standardCount,
          dailyFeedingCount,
          defaultStandardsInserted: existingCount === 0 ? defaultStandards.length : 0
        },
        timestamp: new Date().toISOString()
      }

    } catch (error) {
      // 트랜잭션 롤백
      await connection.rollback()
      throw error
    }

  } catch (error) {
    console.error('급이 관리 테이블 설정 API 오류:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: {
        success: false,
        message: 'Failed to setup feeding management tables',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    })
  } finally {
    if (connection) {
      connection.release()
    }
  }
})
