import mysql from 'mysql2/promise'
import { defineEventHandler, getQuery, createError } from 'h3'
import { dbConfig } from '~/server/utils/dbConfig'

export default defineEventHandler(async (event) => {
  let connection: mysql.Connection | null = null
  try {
    const query = getQuery(event)
    console.log('캘린더 이벤트 목록 조회 API 호출됨:', query)

    const year = query.year as string
    const month = query.month as string
    const startDate = query.start_date as string
    const endDate = query.end_date as string

    connection = await mysql.createConnection(dbConfig)

    let whereClause = ''
    const params: any[] = []

    // 년/월로 조회하는 경우
    if (year && month) {
      const yearMonth = `${year}-${month.padStart(2, '0')}`
      whereClause = 'WHERE (start_date LIKE ? OR end_date LIKE ?)'
      params.push(`${yearMonth}%`, `${yearMonth}%`)
    }
    // 시작일/종료일 범위로 조회하는 경우
    else if (startDate && endDate) {
      whereClause = 'WHERE (start_date <= ? AND end_date >= ?) OR (start_date >= ? AND start_date <= ?)'
      params.push(endDate, startDate, startDate, endDate)
    }
    // 특정 날짜로 조회하는 경우
    else if (startDate) {
      whereClause = 'WHERE start_date <= ? AND end_date >= ?'
      params.push(startDate, startDate)
    }

    // 캘린더 이벤트 목록 조회
    const selectQuery = `
      SELECT 
        id,
        start_date,
        end_date,
        title,
        url,
        crdt_id,
        DATE_FORMAT(crdt_date, '%Y-%m-%d %H:%i:%s') as crdt_date
      FROM calender 
      ${whereClause}
      ORDER BY start_date ASC, id ASC
    `
    const [rows] = await connection.execute(selectQuery, params)

    return {
      success: true,
      message: 'Calendar events retrieved successfully',
      data: {
        events: rows,
        query: { year, month, startDate, endDate }
      },
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    console.error('캘린더 이벤트 목록 조회 API 오류:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: {
        success: false,
        message: 'Failed to retrieve calendar events',
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

