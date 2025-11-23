import mysql from 'mysql2/promise'
import { defineEventHandler, readBody, createError } from 'h3'
import { dbConfig } from '~/server/utils/dbConfig'

export default defineEventHandler(async (event) => {
  let connection: mysql.Connection | null = null
  try {
    const body = await readBody(event)
    console.log('캘린더 이벤트 생성 API 호출됨:', body)

    if (!body || !body.start_date || !body.title) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: {
          success: false,
          message: 'start_date and title are required',
          timestamp: new Date().toISOString()
        }
      })
    }

    // 날짜 형식 검증 (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(body.start_date)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: {
          success: false,
          message: 'start_date must be in YYYY-MM-DD format',
          timestamp: new Date().toISOString()
        }
      })
    }

    if (body.end_date && !dateRegex.test(body.end_date)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: {
          success: false,
          message: 'end_date must be in YYYY-MM-DD format',
          timestamp: new Date().toISOString()
        }
      })
    }

    connection = await mysql.createConnection(dbConfig)

    // 캘린더 이벤트 생성 (crdt_date는 DEFAULT sysdate()로 자동 설정됨)
    const insertQuery = `
      INSERT INTO calender (
        start_date,
        end_date,
        title,
        url,
        crdt_id
      ) VALUES (?, ?, ?, ?, ?)
    `
    
    const [result] = await connection.execute(insertQuery, [
      body.start_date,
      body.end_date || body.start_date, // end_date가 없으면 start_date와 동일하게 설정
      body.title,
      body.url || null,
      body.crdt_id || 'system'
    ])

    const insertId = (result as any).insertId

    // 생성된 데이터 조회
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
    const [rows] = await connection.execute(selectQuery, [insertId])

    return {
      success: true,
      message: 'Calendar event created successfully',
      data: (rows as any[])[0],
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    console.error('캘린더 이벤트 생성 API 오류:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error',
      data: {
        success: false,
        message: 'Failed to create calendar event',
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

