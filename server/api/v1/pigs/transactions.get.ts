import mysql from 'mysql2/promise'
import { defineEventHandler, getQuery, createError } from 'h3'
import { getPool } from '~/server/utils/dbConfig'

export default defineEventHandler(async (event) => {
  let connection: mysql.PoolConnection | null = null
  try {
    const query = getQuery(event)
    console.log('돼지 거래내역 조회 API 호출됨:', query)

    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 20
    const pigId = query.pig_id as string || ''
    const transactionType = query.transaction_type as string || ''
    const roomNumber = query.room_number as string || ''
    const startDate = query.start_date as string || ''
    const endDate = query.end_date as string || ''
    const offset = (page - 1) * limit

    const pool = getPool()
    connection = await pool.getConnection()

    // 검색 조건 구성
    let whereClause = 'WHERE 1=1'
    const params: any[] = []

    if (pigId) {
      whereClause += ' AND t.pig_id = ?'
      params.push(pigId)
    }

    if (transactionType) {
      whereClause += ' AND t.transaction_type = ?'
      params.push(transactionType)
    }

    if (roomNumber) {
      whereClause += ' AND (t.from_room_number = ? OR t.to_room_number = ?)'
      params.push(roomNumber, roomNumber)
    }

    if (startDate) {
      whereClause += ' AND DATE(t.transaction_date) >= ?'
      params.push(startDate)
    }

    if (endDate) {
      whereClause += ' AND DATE(t.transaction_date) <= ?'
      params.push(endDate)
    }

    // 전체 개수 조회
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM tbl_pig_transaction t
      JOIN tbl_pig_info p ON t.pig_id = p.pig_id
      ${whereClause}
    `
    const [countResult] = await connection.execute(countQuery, params)
    const total = (countResult as any[])[0].total

    // 거래 내역 조회
    const selectQuery = `
      SELECT 
        t.transaction_id,
        t.pig_id,
        p.pig_tag,
        p.pig_name,
        t.transaction_type,
        DATE_FORMAT(t.transaction_date, '%Y-%m-%d %H:%i:%s') as transaction_date,
        t.from_room_number,
        t.to_room_number,
        t.weight,
        t.age_days,
        t.unit_price,
        t.total_price,
        t.partner_name,
        t.partner_contact,
        t.transport_method,
        t.transport_cost,
        t.health_check_result,
        t.vaccination_info,
        t.quality_grade,
        t.manager_id,
        t.approved_by,
        DATE_FORMAT(t.approval_date, '%Y-%m-%d %H:%i:%s') as approval_date,
        t.transaction_status,
        t.invoice_number,
        t.certificate_number,
        t.notes,
        DATE_FORMAT(t.crdt_dt, '%Y-%m-%d %H:%i:%s') as crdt_dt,
        t.crdt_id
      FROM tbl_pig_transaction t
      JOIN tbl_pig_info p ON t.pig_id = p.pig_id
      ${whereClause}
      ORDER BY t.transaction_date DESC, t.transaction_id DESC
      LIMIT ? OFFSET ?
    `
    const [rows] = await connection.execute(selectQuery, [...params, limit, offset])

    // 거래 유형별 통계
    const statsQuery = `
      SELECT 
        t.transaction_type,
        COUNT(*) as count,
        AVG(t.weight) as avg_weight,
        SUM(t.total_price) as total_amount
      FROM tbl_pig_transaction t
      JOIN tbl_pig_info p ON t.pig_id = p.pig_id
      ${whereClause}
      GROUP BY t.transaction_type
      ORDER BY t.transaction_type
    `
    const [statsRows] = await connection.execute(statsQuery, params)

    return {
      success: true,
      message: 'Pig transactions retrieved successfully',
      data: {
        transactions: rows,
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
    console.error('돼지 거래내역 조회 API 오류:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: {
        success: false,
        message: 'Failed to retrieve pig transactions',
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
