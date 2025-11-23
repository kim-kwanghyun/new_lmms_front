import mysql from 'mysql2/promise'
import { defineEventHandler, readBody, createError } from 'h3'
import { getPool } from '~/server/utils/dbConfig'

export default defineEventHandler(async (event) => {
  let connection: mysql.PoolConnection | null = null
  try {
    const body = await readBody(event)
    console.log('급이 기록 등록 API 호출됨:', body)

    if (!body || !body.pig_id || !body.room_number || !body.feeding_date || !body.feeding_time || !body.feeding_round) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: {
          success: false,
          message: 'pig_id, room_number, feeding_date, feeding_time, and feeding_round are required',
          timestamp: new Date().toISOString()
        }
      })
    }

    const pool = getPool()
    connection = await pool.getConnection()

    // 트랜잭션 시작
    await connection.beginTransaction()

    try {
      // 중복 체크 (같은 돼지, 같은 날, 같은 시간, 같은 차수)
      const checkQuery = `
        SELECT COUNT(*) as count 
        FROM tbl_pig_daily_feeding 
        WHERE pig_id = ? AND feeding_date = ? AND feeding_time = ? AND feeding_round = ?
      `
      const [checkResult] = await connection.execute(checkQuery, [
        body.pig_id, body.feeding_date, body.feeding_time, body.feeding_round
      ])
      
      if ((checkResult as any[])[0].count > 0) {
        throw createError({
          statusCode: 409,
          statusMessage: 'Conflict',
          data: {
            success: false,
            message: `해당 시간(${body.feeding_time})의 ${body.feeding_round}차 급이 기록이 이미 존재합니다.`,
            timestamp: new Date().toISOString()
          }
        })
      }

      // 돼지 존재 여부 확인 (더 상세한 체크)
      const pigCheckQuery = `
        SELECT 
          pig_id, 
          current_room_number, 
          pig_status, 
          pig_name,
          health_status,
          is_active
        FROM tbl_pig_info 
        WHERE pig_id = ?
      `
      const [pigCheckResult] = await connection.execute(pigCheckQuery, [body.pig_id])
      
      if ((pigCheckResult as any[]).length === 0) {
        // 돼지가 전혀 존재하지 않는 경우
        throw createError({
          statusCode: 404,
          statusMessage: 'Not Found',
          data: {
            success: false,
            message: `돼지 ID '${body.pig_id}'가 데이터베이스에 존재하지 않습니다.`,
            timestamp: new Date().toISOString()
          }
        })
      }
      
      const pigInfo = (pigCheckResult as any[])[0]
      console.log('돼지 정보 확인 결과:', pigInfo)
      
      // 돼지는 존재하지만 급이가 불가능한 상태인 경우
      if (pigInfo.pig_status === '출고' || pigInfo.pig_status === '폐사') {
        throw createError({
          statusCode: 400,
          statusMessage: 'Bad Request',
          data: {
            success: false,
            message: `돼지 ID '${body.pig_id}'는 현재 '${pigInfo.pig_status}' 상태로 급이 기록을 등록할 수 없습니다.`,
            timestamp: new Date().toISOString()
          }
        })
      }
      
      // 비활성화된 돼지인 경우
      if (pigInfo.is_active === 0 || pigInfo.is_active === false) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Bad Request',
          data: {
            success: false,
            message: `돼지 ID '${body.pig_id}'는 비활성화된 상태입니다. (상태: ${pigInfo.pig_status})`,
            timestamp: new Date().toISOString()
          }
        })
      }

      // 섭취율 계산
      let feedConsumptionRate = null
      let waterConsumptionRate = null
      
      if (body.feed_actual_amount && body.feed_consumed_amount) {
        feedConsumptionRate = Math.round((body.feed_consumed_amount / body.feed_actual_amount) * 100 * 100) / 100
      }
      
      if (body.water_actual_amount && body.water_consumed_amount) {
        waterConsumptionRate = Math.round((body.water_consumed_amount / body.water_actual_amount) * 100 * 100) / 100
      }

      // 비용 계산
      let feedTotalCost = null
      let waterTotalCost = null
      
      if (body.feed_unit_cost && body.feed_actual_amount) {
        feedTotalCost = Math.round(body.feed_unit_cost * body.feed_actual_amount)
      }
      
      if (body.water_unit_cost && body.water_actual_amount) {
        waterTotalCost = Math.round(body.water_unit_cost * body.water_actual_amount)
      }

      // 급이 기록 등록
      const insertQuery = `
        INSERT INTO tbl_pig_daily_feeding (
          pig_id, room_number, feeding_date, feeding_time, feeding_round,
          pig_weight, pig_condition, weather_condition, temperature, humidity,
          feed_type, feed_planned_amount, feed_actual_amount, feed_consumed_amount, feed_leftover_amount, feed_consumption_rate,
          water_planned_amount, water_actual_amount, water_consumed_amount, water_leftover_amount, water_consumption_rate,
          feeding_method, feeding_equipment, water_method, water_equipment,
          feed_quality, water_quality, hygiene_status,
          feed_unit_cost, feed_total_cost, water_unit_cost, water_total_cost,
          manager_id, manager_name, checker_id, check_time,
          notes, feeding_issues, health_observations,
          crdt_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
      
      await connection.execute(insertQuery, [
        body.pig_id,
        body.room_number,
        body.feeding_date,
        body.feeding_time,
        body.feeding_round,
        body.pig_weight || null,
        body.pig_condition || '정상',
        body.weather_condition || null,
        body.temperature || null,
        body.humidity || null,
        body.feed_type || null,
        body.feed_planned_amount || 0,
        body.feed_actual_amount || 0,
        body.feed_consumed_amount || null,
        body.feed_leftover_amount || null,
        feedConsumptionRate,
        body.water_planned_amount || 0,
        body.water_actual_amount || 0,
        body.water_consumed_amount || null,
        body.water_leftover_amount || null,
        waterConsumptionRate,
        body.feeding_method || '자동급이',
        body.feeding_equipment || null,
        body.water_method || '자동급수',
        body.water_equipment || null,
        body.feed_quality || null,
        body.water_quality || null,
        body.hygiene_status || '청결',
        body.feed_unit_cost || null,
        feedTotalCost,
        body.water_unit_cost || null,
        waterTotalCost,
        body.manager_id || 'admin',
        body.manager_name || null,
        body.checker_id || null,
        body.check_time || null,
        body.notes || null,
        body.feeding_issues || null,
        body.health_observations || null,
        body.crdt_id || 'admin'
      ])

      // 트랜잭션 커밋
      await connection.commit()

      // 생성된 데이터 조회
      const selectQuery = `
        SELECT 
          pf.feeding_id,
          pf.pig_id,
          pf.room_number,
          pf.feeding_date,
          TIME_FORMAT(pf.feeding_time, '%H:%i') as feeding_time,
          pf.feeding_round,
          pf.feed_actual_amount,
          pf.water_actual_amount,
          pf.feed_consumption_rate,
          pf.water_consumption_rate,
          pf.manager_name,
          DATE_FORMAT(pf.crdt_dt, '%Y-%m-%d %H:%i:%s') as crdt_dt
        FROM tbl_pig_daily_feeding pf
        WHERE pf.pig_id = ? AND pf.feeding_date = ? AND pf.feeding_time = ? AND pf.feeding_round = ?
        ORDER BY pf.feeding_id DESC
        LIMIT 1
      `
      const [rows] = await connection.execute(selectQuery, [
        body.pig_id, body.feeding_date, body.feeding_time, body.feeding_round
      ])

      return {
        success: true,
        message: 'Daily feeding record created successfully',
        data: (rows as any[])[0],
        timestamp: new Date().toISOString()
      }

    } catch (error) {
      // 트랜잭션 롤백
      await connection.rollback()
      throw error
    }

  } catch (error) {
    console.error('급이 기록 등록 API 오류:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error',
      data: {
        success: false,
        message: 'Failed to create daily feeding record',
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
