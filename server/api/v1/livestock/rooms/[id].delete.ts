import mysql from 'mysql2/promise'
import { defineEventHandler, getRouterParam, createError } from 'h3'
import { dbConfig } from '~/server/utils/dbConfig'

export default defineEventHandler(async (event) => {
  let connection: mysql.Connection | null = null
  try {
    const roomId = getRouterParam(event, 'id')
    console.log('축사방 삭제 API 호출됨:', roomId)

    if (!roomId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: {
          success: false,
          message: 'Room ID is required',
          timestamp: new Date().toISOString()
        }
      })
    }

    connection = await mysql.createConnection(dbConfig)

    // 존재 여부 확인
    const checkQuery = 'SELECT COUNT(*) as count, room_number FROM tbl_livestock_room WHERE idx = ?'
    const [checkResult] = await connection.execute(checkQuery, [roomId])

    if ((checkResult as any[])[0].count === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
        data: {
          success: false,
          message: 'Livestock room not found',
          timestamp: new Date().toISOString()
        }
      })
    }

    const roomNumber = (checkResult as any[])[0].room_number

    // 축사방 삭제
    const deleteQuery = 'DELETE FROM tbl_livestock_room WHERE idx = ?'
    await connection.execute(deleteQuery, [roomId])

    return {
      success: true,
      message: 'Livestock room deleted successfully',
      data: {
        idx: roomId,
        room_number: roomNumber,
        deleted_at: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    console.error('축사방 삭제 API 오류:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error',
      data: {
        success: false,
        message: 'Failed to delete livestock room',
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




















