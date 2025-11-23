import mysql from 'mysql2/promise'
import { defineEventHandler, getQuery, createError } from 'h3'
import { getPool } from '~/server/utils/dbConfig'

export default defineEventHandler(async (event) => {
  let connection: mysql.PoolConnection | null = null
  try {
    const query = getQuery(event)
    console.log('급이 기준 조회 API 호출됨:', query)

    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 20
    const pigType = query.pig_type as string || ''
    const season = query.season as string || ''
    const isActive = query.is_active !== undefined ? query.is_active === 'true' : true
    const offset = (page - 1) * limit

    const pool = getPool()
    connection = await pool.getConnection()

    // 검색 조건 구성
    let whereClause = 'WHERE 1=1'
    const params: any[] = []

    if (pigType) {
      whereClause += ' AND fs.pig_type = ?'
      params.push(pigType)
    }

    if (season) {
      whereClause += ' AND fs.season = ?'
      params.push(season)
    }

    if (isActive !== undefined) {
      whereClause += ' AND fs.is_active = ?'
      params.push(isActive)
    }

    // 전체 개수 조회
    const countQuery = `SELECT COUNT(*) as total FROM tbl_feeding_standard fs ${whereClause}`
    const [countResult] = await connection.execute(countQuery, params)
    const total = (countResult as any[])[0].total

    // 급이 기준 조회
    const selectQuery = `
      SELECT 
        fs.standard_id,
        fs.standard_name,
        fs.pig_type,
        fs.weight_min,
        fs.weight_max,
        fs.feed_amount_per_day,
        fs.feed_times_per_day,
        fs.feed_amount_per_time,
        fs.water_amount_per_day,
        fs.water_times_per_day,
        fs.water_amount_per_time,
        fs.season,
        fs.temperature_min,
        fs.temperature_max,
        fs.feed_type,
        fs.feed_protein_rate,
        fs.feed_energy,
        fs.is_active,
        fs.description,
        DATE_FORMAT(fs.crdt_dt, '%Y-%m-%d %H:%i:%s') as crdt_dt,
        fs.crdt_id
      FROM tbl_feeding_standard fs
      ${whereClause}
      ORDER BY fs.pig_type, fs.weight_min, fs.standard_id
      LIMIT ? OFFSET ?
    `
    const [rows] = await connection.execute(selectQuery, [...params, limit, offset])

    // 돼지 유형별 통계
    const typeStatsQuery = `
      SELECT 
        fs.pig_type,
        COUNT(*) as standard_count,
        AVG(fs.feed_amount_per_day) as avg_feed_amount,
        AVG(fs.water_amount_per_day) as avg_water_amount
      FROM tbl_feeding_standard fs
      WHERE fs.is_active = TRUE
      GROUP BY fs.pig_type
      ORDER BY fs.pig_type
    `
    const [typeStatsRows] = await connection.execute(typeStatsQuery)

    return {
      success: true,
      message: 'Feeding standards retrieved successfully',
      data: {
        standards: rows,
        typeStatistics: typeStatsRows,
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
    console.error('급이 기준 조회 API 오류:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: {
        success: false,
        message: 'Failed to retrieve feeding standards',
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




















