import mysql from 'mysql2/promise'
import { defineEventHandler, createError } from 'h3'
import { getPool } from '~/server/utils/dbConfig'

export default defineEventHandler(async (event) => {
  let connection
  try {
    console.log('급이 기록 테스트 데이터 생성 API 호출됨')

    const pool = getPool()
    connection = await pool.getConnection()

    // 트랜잭션 시작
    await connection.beginTransaction()

    try {
      // 기존 테스트 데이터 삭제 (선택적)
      await connection.execute(`
        DELETE FROM tbl_pig_daily_feeding 
        WHERE manager_id = 'test_admin' 
        AND notes LIKE '%테스트 데이터%'
      `)

      // 샘플 급이 기록 데이터 생성
      const sampleData = []
      const today = new Date()
      
      // 최근 7일간의 데이터 생성
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const currentDate = new Date(today)
        currentDate.setDate(today.getDate() - dayOffset)
        const dateStr = currentDate.toISOString().split('T')[0]
        
        // 각 날짜마다 여러 돼지의 급이 기록 생성
        const pigIds = ['12431', '12432', '12433', '12434', '12435']
        const rooms = ['A-001', 'A-002', 'B-001']
        
        for (const pigId of pigIds) {
          const roomNumber = rooms[Math.floor(Math.random() * rooms.length)]
          
          // 하루에 2-3번 급이
          const feedingTimes = ['08:00', '14:00', '18:00']
          
          for (let round = 1; round <= Math.min(3, Math.floor(Math.random() * 3) + 1); round++) {
            const feedingTime = feedingTimes[round - 1]
            
            const feedPlanned = 1.5 + Math.random() * 1.0 // 1.5-2.5kg
            const feedActual = feedPlanned * (0.9 + Math.random() * 0.2) // 90-110%
            const feedConsumed = feedActual * (0.8 + Math.random() * 0.2) // 80-100%
            
            const waterPlanned = 3.0 + Math.random() * 2.0 // 3.0-5.0L
            const waterActual = waterPlanned * (0.9 + Math.random() * 0.2)
            const waterConsumed = waterActual * (0.8 + Math.random() * 0.2)
            
            const feedConsumptionRate = (feedConsumed / feedActual) * 100
            const waterConsumptionRate = (waterConsumed / waterActual) * 100
            
            const conditions = ['정상', '정상', '정상', '식욕부진', '스트레스']
            const pigCondition = conditions[Math.floor(Math.random() * conditions.length)]
            
            sampleData.push({
              pig_id: pigId,
              room_number: roomNumber,
              feeding_date: dateStr,
              feeding_time: feedingTime,
              feeding_round: round,
              pig_weight: 45 + Math.random() * 30, // 45-75kg
              pig_condition: pigCondition,
              temperature: 18 + Math.random() * 10, // 18-28도
              humidity: 50 + Math.random() * 30, // 50-80%
              feed_type: '사료',
              feed_planned_amount: Number(feedPlanned.toFixed(1)),
              feed_actual_amount: Number(feedActual.toFixed(1)),
              feed_consumed_amount: Number(feedConsumed.toFixed(1)),
              feed_leftover_amount: Number((feedActual - feedConsumed).toFixed(1)),
              feed_consumption_rate: Number(feedConsumptionRate.toFixed(1)),
              water_planned_amount: Number(waterPlanned.toFixed(1)),
              water_actual_amount: Number(waterActual.toFixed(1)),
              water_consumed_amount: Number(waterConsumed.toFixed(1)),
              water_leftover_amount: Number((waterActual - waterConsumed).toFixed(1)),
              water_consumption_rate: Number(waterConsumptionRate.toFixed(1)),
              feeding_method: '자동급이',
              water_method: '자동급수',
              feed_quality: '양호',
              water_quality: '양호',
              hygiene_status: '청결',
              manager_id: 'test_admin',
              manager_name: '테스트 관리자',
              notes: `테스트 데이터 - ${dateStr} ${round}차 급이`
            })
          }
        }
      }

      console.log(`생성할 테스트 데이터 수: ${sampleData.length}개`)

      // 배치 INSERT
      const insertQuery = `
        INSERT INTO tbl_pig_daily_feeding (
          pig_id, room_number, feeding_date, feeding_time, feeding_round,
          pig_weight, pig_condition, weather_condition, temperature, humidity, feed_type,
          feed_planned_amount, feed_actual_amount, feed_consumed_amount, 
          feed_leftover_amount, feed_consumption_rate,
          water_planned_amount, water_actual_amount, water_consumed_amount, 
          water_leftover_amount, water_consumption_rate,
          feeding_method, feeding_equipment, water_method, water_equipment,
          feed_quality, water_quality, hygiene_status,
          feed_unit_cost, feed_total_cost, water_unit_cost, water_total_cost,
          manager_id, manager_name, checker_id, check_time,
          notes, feeding_issues, health_observations, crdt_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `

      let insertedCount = 0
      for (const data of sampleData) {
        try {
          await connection.execute(insertQuery, [
            data.pig_id, data.room_number, data.feeding_date, data.feeding_time, data.feeding_round,
            data.pig_weight, data.pig_condition, data.weather_condition || '맑음', data.temperature, data.humidity, data.feed_type,
            data.feed_planned_amount, data.feed_actual_amount, data.feed_consumed_amount,
            data.feed_leftover_amount, data.feed_consumption_rate,
            data.water_planned_amount, data.water_actual_amount, data.water_consumed_amount,
            data.water_leftover_amount, data.water_consumption_rate,
            data.feeding_method, data.feeding_equipment || '자동급이기', data.water_method, data.water_equipment || '자동급수기',
            data.feed_quality, data.water_quality, data.hygiene_status,
            data.feed_unit_cost || 1500, data.feed_total_cost || (data.feed_actual_amount * 1500),
            data.water_unit_cost || 10, data.water_total_cost || (data.water_actual_amount * 10),
            data.manager_id, data.manager_name, data.checker_id || 'admin', data.check_time || null,
            data.notes, data.feeding_issues || null, data.health_observations || null, 'admin'
          ])
          insertedCount++
        } catch (error) {
          console.warn(`데이터 삽입 실패 (중복 가능성):`, data.pig_id, data.feeding_date, data.feeding_time, data.feeding_round)
        }
      }

      // 트랜잭션 커밋
      await connection.commit()

      // 생성된 데이터 확인
      const [countResult] = await connection.execute(`
        SELECT COUNT(*) as total 
        FROM tbl_pig_daily_feeding 
        WHERE manager_id = 'test_admin'
      `)
      const totalTestRecords = (countResult as any[])[0].total

      console.log(`테스트 데이터 생성 완료: ${insertedCount}개 삽입, 총 ${totalTestRecords}개 테스트 레코드 존재`)

      return {
        success: true,
        message: 'Test feeding data created successfully',
        data: {
          inserted: insertedCount,
          totalTestRecords: totalTestRecords,
          sampleDataCount: sampleData.length
        },
        timestamp: new Date().toISOString()
      }

    } catch (error) {
      // 트랜잭션 롤백
      await connection.rollback()
      throw error
    }

  } catch (error) {
    console.error('급이 기록 테스트 데이터 생성 API 오류:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: {
        success: false,
        message: 'Failed to create test feeding data',
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
