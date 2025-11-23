import mysql from 'mysql2/promise'
import { defineEventHandler, getRouterParam, createError } from 'h3'
import { dbConfig } from '~/server/utils/dbConfig'

export default defineEventHandler(async (event) => {
  let connection: mysql.Connection | null = null
  try {
    const eventId = getRouterParam(event, 'id')
    console.log('캘린더 이벤트 삭제 API 호출됨:', eventId)

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

    // 존재 여부 확인
    const checkQuery = 'SELECT COUNT(*) as count FROM calender WHERE id = ?'
    const [checkResult] = await connection.execute(checkQuery, [eventId])

    if ((checkResult as any[])[0].count === 0) {
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

    // 캘린더 이벤트 삭제
    const deleteQuery = 'DELETE FROM calender WHERE id = ?'
    await connection.execute(deleteQuery, [eventId])

    return {
      success: true,
      message: 'Calendar event deleted successfully',
      data: {
        id: eventId,
        deleted_at: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    console.error('캘린더 이벤트 삭제 API 오류:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error',
      data: {
        success: false,
        message: 'Failed to delete calendar event',
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




















