import mysql from 'mysql2/promise'
import { defineEventHandler, getQuery, createError } from 'h3'
import { getPool } from '~/server/utils/dbConfig'

export default defineEventHandler(async (event) => {
  let connection: mysql.PoolConnection | null = null
  try {
    const query = getQuery(event)
    console.log('급이 현황 요약 API 호출됨:', query)

    const targetDate = query.date as string || new Date().toISOString().split('T')[0]
    const roomNumber = query.room_number as string || ''

    const pool = getPool()
    connection = await pool.getConnection()

    let whereClause = 'WHERE pf.feeding_date = ?'
    const params: any[] = [targetDate]

    if (roomNumber) {
      whereClause += ' AND pf.room_number = ?'
      params.push(roomNumber)
    }

    // 1. 전체 급이 현황 요약
    const summaryQuery = `
      SELECT 
        COUNT(DISTINCT pf.pig_id) as total_pigs,
        COUNT(DISTINCT pf.room_number) as total_rooms,
        COUNT(*) as total_feeding_records,
        SUM(pf.feed_actual_amount) as total_feed_amount,
        SUM(pf.water_actual_amount) as total_water_amount,
        AVG(pf.feed_consumption_rate) as avg_feed_consumption_rate,
        AVG(pf.water_consumption_rate) as avg_water_consumption_rate,
        SUM(pf.feed_total_cost) as total_feed_cost,
        SUM(pf.water_total_cost) as total_water_cost
      FROM tbl_pig_daily_feeding pf
      ${whereClause}
    `
    const [summaryResult] = await connection.execute(summaryQuery, params)
    const summary = (summaryResult as any[])[0]

    // 2. 축사별 급이 현황
    const roomSummaryQuery = `
      SELECT 
        pf.room_number,
        COUNT(DISTINCT pf.pig_id) as pig_count,
        COUNT(*) as feeding_count,
        SUM(pf.feed_actual_amount) as total_feed_amount,
        SUM(pf.water_actual_amount) as total_water_amount,
        AVG(pf.feed_consumption_rate) as avg_feed_consumption_rate,
        AVG(pf.water_consumption_rate) as avg_water_consumption_rate,
        AVG(pf.temperature) as avg_temperature,
        AVG(pf.humidity) as avg_humidity
      FROM tbl_pig_daily_feeding pf
      ${whereClause}
      GROUP BY pf.room_number
      ORDER BY pf.room_number
    `
    const [roomSummaryResult] = await connection.execute(roomSummaryQuery, params)

    // 3. 급이 차수별 현황
    const roundSummaryQuery = `
      SELECT 
        pf.feeding_round,
        COUNT(*) as feeding_count,
        SUM(pf.feed_actual_amount) as total_feed_amount,
        SUM(pf.water_actual_amount) as total_water_amount,
        AVG(pf.feed_consumption_rate) as avg_feed_consumption_rate,
        AVG(pf.water_consumption_rate) as avg_water_consumption_rate,
        MIN(pf.feeding_time) as earliest_time,
        MAX(pf.feeding_time) as latest_time
      FROM tbl_pig_daily_feeding pf
      ${whereClause}
      GROUP BY pf.feeding_round
      ORDER BY pf.feeding_round
    `
    const [roundSummaryResult] = await connection.execute(roundSummaryQuery, params)

    // 4. 돼지 상태별 현황
    const conditionSummaryQuery = `
      SELECT 
        pf.pig_condition,
        COUNT(DISTINCT pf.pig_id) as pig_count,
        AVG(pf.feed_consumption_rate) as avg_feed_consumption_rate,
        AVG(pf.water_consumption_rate) as avg_water_consumption_rate
      FROM tbl_pig_daily_feeding pf
      ${whereClause}
      GROUP BY pf.pig_condition
      ORDER BY pf.pig_condition
    `
    const [conditionSummaryResult] = await connection.execute(conditionSummaryQuery, params)

    // 5. 급이 품질 현황
    const qualitySummaryQuery = `
      SELECT 
        pf.feed_quality,
        pf.water_quality,
        pf.hygiene_status,
        COUNT(*) as count
      FROM tbl_pig_daily_feeding pf
      ${whereClause}
      GROUP BY pf.feed_quality, pf.water_quality, pf.hygiene_status
      ORDER BY count DESC
    `
    const [qualitySummaryResult] = await connection.execute(qualitySummaryQuery, params)

    // 6. 최근 7일간 급이 추이
    const trendQuery = `
      SELECT 
        pf.feeding_date,
        COUNT(DISTINCT pf.pig_id) as pig_count,
        SUM(pf.feed_actual_amount) as total_feed_amount,
        SUM(pf.water_actual_amount) as total_water_amount,
        AVG(pf.feed_consumption_rate) as avg_feed_consumption_rate,
        AVG(pf.water_consumption_rate) as avg_water_consumption_rate
      FROM tbl_pig_daily_feeding pf
      WHERE pf.feeding_date >= DATE_SUB(?, INTERVAL 6 DAY)
        AND pf.feeding_date <= ?
        ${roomNumber ? 'AND pf.room_number = ?' : ''}
      GROUP BY pf.feeding_date
      ORDER BY pf.feeding_date DESC
    `
    const trendParams = [targetDate, targetDate]
    if (roomNumber) {
      trendParams.push(roomNumber)
    }
    const [trendResult] = await connection.execute(trendQuery, trendParams)

    // 7. 급이 기준 대비 실적
    const achievementQuery = `
      SELECT 
        pf.pig_id,
        pi.pig_name,
        pi.current_weight,
        fs.standard_name,
        fs.feed_amount_per_day as standard_feed,
        SUM(pf.feed_actual_amount) as actual_feed,
        ROUND((SUM(pf.feed_actual_amount) / fs.feed_amount_per_day) * 100, 1) as feed_achievement_rate,
        fs.water_amount_per_day as standard_water,
        SUM(pf.water_actual_amount) as actual_water,
        ROUND((SUM(pf.water_actual_amount) / fs.water_amount_per_day) * 100, 1) as water_achievement_rate
      FROM tbl_pig_daily_feeding pf
      JOIN tbl_pig_info pi ON pf.pig_id = pi.pig_id
      LEFT JOIN tbl_feeding_standard fs ON pi.current_weight BETWEEN fs.weight_min AND fs.weight_max 
        AND fs.pig_type = '비육돈' AND fs.is_active = TRUE
      ${whereClause}
      GROUP BY pf.pig_id, pi.pig_name, pi.current_weight, fs.standard_name, fs.feed_amount_per_day, fs.water_amount_per_day
      ORDER BY feed_achievement_rate ASC
      LIMIT 10
    `
    const [achievementResult] = await connection.execute(achievementQuery, params)

    return {
      success: true,
      message: 'Feeding summary retrieved successfully',
      data: {
        date: targetDate,
        summary,
        roomSummary: roomSummaryResult,
        roundSummary: roundSummaryResult,
        conditionSummary: conditionSummaryResult,
        qualitySummary: qualitySummaryResult,
        weeklyTrend: trendResult,
        achievementAnalysis: achievementResult
      },
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    console.error('급이 현황 요약 API 오류:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: {
        success: false,
        message: 'Failed to retrieve feeding summary',
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




















