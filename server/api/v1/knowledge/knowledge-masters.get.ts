import mysql from 'mysql2/promise'
import { defineEventHandler, getQuery, createError } from 'h3'
import { dbConfig } from '~/server/utils/dbConfig'

export default defineEventHandler(async (event) => {
  let connection: mysql.Connection | null = null
  try {
    const query = getQuery(event)
    console.log('지식 마스터 목록 조회 API 호출됨:', query)

    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 100
    const search = query.search as string || ''
    const offset = (page - 1) * limit

    connection = await mysql.createConnection(dbConfig)

    // 검색 조건 구성
    let whereClause = ''
    const params: any[] = []

    if (search) {
      whereClause = 'WHERE knowledge_master_name LIKE ? OR knowledge_master_id LIKE ? OR knowledge_master_desc LIKE ?'
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    // 전체 개수 조회
    const countQuery = `SELECT COUNT(*) as total FROM tbl_knowledge_master ${whereClause}`
    const [countResult] = await connection.execute(countQuery, params)
    const total = (countResult as any[])[0].total

    // 지식 마스터 목록 조회
    const selectQuery = `
      SELECT 
        idx,
        knowledge_master_name,
        knowledge_master_id,
        knowledge_master_desc,
        crdt_id,
        DATE_FORMAT(crdt_dt, '%Y-%m-%d %H:%i:%s') as crdt_dt
      FROM tbl_knowledge_master 
      ${whereClause}
      ORDER BY idx DESC
      LIMIT ? OFFSET ?
    `
    const [rows] = await connection.execute(selectQuery, [...params, limit, offset])

    return {
      success: true,
      message: 'Knowledge masters retrieved successfully',
      data: {
        masters: rows,
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
    console.error('지식 마스터 목록 조회 API 오류:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: {
        success: false,
        message: 'Failed to retrieve knowledge masters',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    })
  } finally {
    if (connection) {
      await connection.end()
    }
  }
})
