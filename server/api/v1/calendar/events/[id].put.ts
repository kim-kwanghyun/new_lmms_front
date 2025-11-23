import mysql from 'mysql2/promise'
import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
import { dbConfig } from '~/server/utils/dbConfig'

export default defineEventHandler(async (event) => {
  let connection: mysql.Connection | null = null
  try {
    const eventId = getRouterParam(event, 'id')
    const body = await readBody(event)
    
    console.log('캘린더 이벤트 수정 API 호출됨:', eventId, body)

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

    if (!body || (!body.start_date && !body.end_date && !body.title && !body.url)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: {
          success: false,
          message: 'At least one field is required for update',
          timestamp: new Date().toISOString()
        }
      })
    }

    // 날짜 형식 검증 (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (body.start_date && !dateRegex.test(body.start_date)) {
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

    // 캘린더 이벤트 수정
    const updateFields: string[] = []
    const updateParams: any[] = []

    if (body.start_date !== undefined) {
      updateFields.push('start_date = ?')
      updateParams.push(body.start_date)
    }

    if (body.end_date !== undefined) {
      updateFields.push('end_date = ?')
      updateParams.push(body.end_date)
    }

    if (body.title !== undefined) {
      updateFields.push('title = ?')
      updateParams.push(body.title)
    }

    if (body.url !== undefined) {
      updateFields.push('url = ?')
      updateParams.push(body.url)
    }

    if (body.crdt_id !== undefined) {
      updateFields.push('crdt_id = ?')
      updateParams.push(body.crdt_id)
    }

    if (updateFields.length === 0) {
      return {
        success: true,
        message: 'No fields to update',
        data: { id: eventId },
        timestamp: new Date().toISOString()
      }
    }

    updateParams.push(eventId) // WHERE 절 파라미터

    const updateQuery = `
      UPDATE calender 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `
    await connection.execute(updateQuery, updateParams)

    // 수정된 데이터 조회
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

    return {
      success: true,
      message: 'Calendar event updated successfully',
      data: (rows as any[])[0],
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    console.error('캘린더 이벤트 수정 API 오류:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error',
      data: {
        success: false,
        message: 'Failed to update calendar event',
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








