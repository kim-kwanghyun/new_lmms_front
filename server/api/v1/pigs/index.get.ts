import mysql from 'mysql2/promise'
import { defineEventHandler, getQuery, createError } from 'h3'
import { getPool } from '~/server/utils/dbConfig'

export default defineEventHandler(async (event) => {
  let connection: mysql.PoolConnection | null = null
  try {
    const query = getQuery(event)
    console.log('돼지 목록 조회 API 호출됨:', query)

    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 20
    const search = query.search as string || ''
    const roomNumber = query.room_number as string || ''
    const pigStatus = query.pig_status as string || ''
    const healthStatus = query.health_status as string || ''
    const offset = (page - 1) * limit

    const pool = getPool()
    connection = await pool.getConnection()

    // 검색 조건 구성
    let whereClause = 'WHERE p.is_active = TRUE'
    const params: any[] = []

    if (search) {
      whereClause += ' AND (p.pig_tag LIKE ? OR p.pig_name LIKE ? OR p.pig_id LIKE ?)'
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    if (roomNumber) {
      whereClause += ' AND p.current_room_number = ?'
      params.push(roomNumber)
    }

    if (pigStatus) {
      whereClause += ' AND p.pig_status = ?'
      params.push(pigStatus)
    }

    if (healthStatus) {
      whereClause += ' AND p.health_status = ?'
      params.push(healthStatus)
    }

    // 전체 개수 조회
    const countQuery = `SELECT COUNT(*) as total FROM tbl_pig_info p ${whereClause}`
    const [countResult] = await connection.execute(countQuery, params)
    const total = (countResult as any[])[0].total

    // 돼지 목록 조회
    const selectQuery = `
      SELECT 
        p.pig_id,
        p.pig_tag,
        p.pig_name,
        p.current_room_number,
        p.pig_status,
        p.breed,
        p.gender,
        p.birth_date,
        p.birth_weight,
        p.entry_weight,
        p.current_weight,
        DATEDIFF(NOW(), p.birth_date) AS age_days,
        DATEDIFF(NOW(), p.entry_date) AS days_in_farm,
        DATE_FORMAT(p.entry_date, '%Y-%m-%d %H:%i:%s') AS entry_date,
        DATE_FORMAT(p.exit_date, '%Y-%m-%d %H:%i:%s') AS exit_date,
        p.health_status,
        p.supplier,
        p.manager_id,
        p.notes,
        DATE_FORMAT(p.crdt_dt, '%Y-%m-%d %H:%i:%s') AS crdt_dt,
        p.crdt_id
      FROM tbl_pig_info p 
      ${whereClause}
      ORDER BY p.entry_date DESC, p.pig_id
      LIMIT ? OFFSET ?
    `
    const [rows] = await connection.execute(selectQuery, [...params, limit, offset])

    return {
      success: true,
      message: 'Pigs retrieved successfully',
      data: {
        pigs: rows,
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
    console.error('돼지 목록 조회 API 오류:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: {
        success: false,
        message: 'Failed to retrieve pigs',
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
