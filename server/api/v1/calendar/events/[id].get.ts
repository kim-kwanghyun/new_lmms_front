import mysql from 'mysql2/promise'
import { defineEventHandler, getRouterParam, createError } from 'h3'
import { dbConfig } from '~/server/utils/dbConfig'

export default defineEventHandler(async (event) => {
  let connection: mysql.Connection | null = null
  try {
    const eventId = getRouterParam(event, 'id')
    console.log('캘린더 이벤트 상세 조회 API 호출됨:', eventId)

    if (!eventId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: {
          success: false,
          message: 'Event ID is required',
          timestamp: new Date().toISOString()
        }
      })
    }

    connection = await mysql.createConnection(dbConfig)

    // 캘린더 이벤트 조회
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
      WHERE id = ?
    `
    const [rows] = await connection.execute(selectQuery, [eventId])

    if ((rows as any[]).length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
        data: {
          success: false,
          message: 'Calendar event not found',
          timestamp: new Date().toISOString()
        }
      })
    }

    return {
      success: true,
      message: 'Calendar event retrieved successfully',
      data: (rows as any[])[0],
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    console.error('캘린더 이벤트 상세 조회 API 오류:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error',
      data: {
        success: false,
        message: 'Failed to retrieve calendar event',
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








