import mysql from 'mysql2/promise'
import { defineEventHandler, getRouterParam, createError } from 'h3'
import { dbConfig } from '~/server/utils/dbConfig'

export default defineEventHandler(async (event) => {
  let connection: mysql.Connection | null = null
  try {
    const roomId = getRouterParam(event, 'id')
    console.log('축사방 상세 조회 API 호출됨:', roomId)

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

    // 축사방 조회
    const selectQuery = `
      SELECT 
        idx,
        room_number,
        livestock_type,
        DATE_FORMAT(created_date, '%Y-%m-%d %H:%i:%s') as created_date,
        creator_id,
        DATE_FORMAT(crdt_dt, '%Y-%m-%d %H:%i:%s') as crdt_dt,
        crdt_id
      FROM tbl_livestock_room 
      WHERE idx = ?
    `
    const [rows] = await connection.execute(selectQuery, [roomId])

    if ((rows as any[]).length === 0) {
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

    return {
      success: true,
      message: 'Livestock room retrieved successfully',
      data: (rows as any[])[0],
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    console.error('축사방 상세 조회 API 오류:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error',
      data: {
        success: false,
        message: 'Failed to retrieve livestock room',
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




















