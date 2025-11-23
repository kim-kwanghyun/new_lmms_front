import mysql from 'mysql2/promise'
import { defineEventHandler, getQuery, createError } from 'h3'
import { getPool } from '~/server/utils/dbConfig'

export default defineEventHandler(async (event) => {
  let connection: mysql.PoolConnection | null = null
  try {
    const query = getQuery(event)
    console.log('일일 급이 기록 조회 API 호출됨:', query)

    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 20
    const pigId = query.pig_id as string || ''
    const roomNumber = query.room_number as string || ''
    const feedingDate = query.feeding_date as string || ''
    const startDate = query.start_date as string || ''
    const endDate = query.end_date as string || ''
    const offset = (page - 1) * limit

    const pool = getPool()
    connection = await pool.getConnection()

    // 검색 조건 구성
    let whereClause = 'WHERE 1=1'
    const params: any[] = []

    if (pigId) {
      whereClause += ' AND pf.pig_id = ?'
      params.push(pigId)
    }

    if (roomNumber) {
      whereClause += ' AND pf.room_number = ?'
      params.push(roomNumber)
    }

    if (feedingDate) {
      whereClause += ' AND pf.feeding_date = ?'
      params.push(feedingDate)
    }

    if (startDate) {
      whereClause += ' AND pf.feeding_date >= ?'
      params.push(startDate)
    }

    if (endDate) {
      whereClause += ' AND pf.feeding_date <= ?'
      params.push(endDate)
    }

    // 전체 개수 조회
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM tbl_pig_daily_feeding pf
      ${whereClause}
    `
    const [countResult] = await connection.execute(countQuery, params)
    const total = (countResult as any[])[0].total

    // 급이 기록 조회
    const selectQuery = `
      SELECT 
        pf.feeding_id,
        pf.pig_id,
        pi.pig_name,
        pi.pig_tag,
        pf.room_number,
        pf.feeding_date,
        TIME_FORMAT(pf.feeding_time, '%H:%i') as feeding_time,
        pf.feeding_round,
        pf.pig_weight,
        pf.pig_condition,
        pf.weather_condition,
        pf.temperature,
        pf.humidity,
        pf.feed_type,
        pf.feed_planned_amount,
        pf.feed_actual_amount,
        pf.feed_consumed_amount,
        pf.feed_leftover_amount,
        pf.feed_consumption_rate,
        pf.water_planned_amount,
        pf.water_actual_amount,
        pf.water_consumed_amount,
        pf.water_leftover_amount,
        pf.water_consumption_rate,
        pf.feeding_method,
        pf.feeding_equipment,
        pf.water_method,
        pf.water_equipment,
        pf.feed_quality,
        pf.water_quality,
        pf.hygiene_status,
        pf.feed_unit_cost,
        pf.feed_total_cost,
        pf.water_unit_cost,
        pf.water_total_cost,
        pf.manager_id,
        pf.manager_name,
        pf.checker_id,
        pf.check_time,
        pf.notes,
        pf.feeding_issues,
        pf.health_observations,
        DATE_FORMAT(pf.crdt_dt, '%Y-%m-%d %H:%i:%s') as crdt_dt,
        pf.crdt_id,
        DATE_FORMAT(pf.updt_dt, '%Y-%m-%d %H:%i:%s') as updt_dt,
        pf.updt_id
      FROM tbl_pig_daily_feeding pf
      LEFT JOIN tbl_pig_info pi ON pf.pig_id = pi.pig_id
      ${whereClause}
      ORDER BY pf.feeding_date DESC, pf.feeding_time DESC, pf.pig_id
      LIMIT ? OFFSET ?
    `
    const [rows] = await connection.execute(selectQuery, [...params, limit, offset])

    // 일일 통계 조회 (같은 조건으로)
    const statsQuery = `
      SELECT 
        pf.feeding_date,
        COUNT(DISTINCT pf.pig_id) as pig_count,
        COUNT(*) as feeding_count,
        SUM(pf.feed_actual_amount) as total_feed_amount,
        SUM(pf.water_actual_amount) as total_water_amount,
        AVG(pf.feed_consumption_rate) as avg_feed_consumption_rate,
        AVG(pf.water_consumption_rate) as avg_water_consumption_rate
      FROM tbl_pig_daily_feeding pf
      ${whereClause}
      GROUP BY pf.feeding_date
      ORDER BY pf.feeding_date DESC
      LIMIT 10
    `
    const [statsRows] = await connection.execute(statsQuery, params)

    return {
      success: true,
      message: 'Daily feeding records retrieved successfully',
      data: {
        records: rows,
        statistics: statsRows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      },
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    console.error('일일 급이 기록 조회 API 오류:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: {
        success: false,
        message: 'Failed to retrieve daily feeding records',
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
