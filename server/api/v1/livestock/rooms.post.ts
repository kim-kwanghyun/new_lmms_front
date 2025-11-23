import mysql from 'mysql2/promise'
import { defineEventHandler, readBody, createError } from 'h3'
import { dbConfig } from '~/server/utils/dbConfig'

export default defineEventHandler(async (event) => {
  let connection: mysql.Connection | null = null
  try {
    const body = await readBody(event)
    console.log('축사방 생성 API 호출됨:', body)

    if (!body || !body.room_number || !body.livestock_type || !body.creator_id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: {
          success: false,
          message: 'room_number, livestock_type, and creator_id are required',
          timestamp: new Date().toISOString()
        }
      })
    }

    // 가축종류 유효성 검사
    if (!['돼지', '소'].includes(body.livestock_type)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: {
          success: false,
          message: 'livestock_type must be either "돼지" or "소"',
          timestamp: new Date().toISOString()
        }
      })
    }

    connection = await mysql.createConnection(dbConfig)

    // 축사번호 중복 체크
    const checkQuery = 'SELECT COUNT(*) as count FROM tbl_livestock_room WHERE room_number = ?'
    const [checkResult] = await connection.execute(checkQuery, [body.room_number])
    
    if ((checkResult as any[])[0].count > 0) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Conflict',
        data: {
          success: false,
          message: `축사번호 '${body.room_number}'가 이미 존재합니다. 다른 번호를 사용해주세요.`,
          timestamp: new Date().toISOString()
        }
      })
    }

    // 축사방 생성 (crdt_dt는 DEFAULT sysdate()로 자동 설정됨)
    const insertQuery = `
      INSERT INTO tbl_livestock_room (
        room_number,
        livestock_type,
        created_date,
        creator_id,
        crdt_id
      ) VALUES (?, ?, ?, ?, ?)
    `
    
    // 개설일시가 제공되지 않으면 현재 시간 사용
    const createdDate = body.created_date || new Date().toISOString().slice(0, 19).replace('T', ' ')
    
    const [result] = await connection.execute(insertQuery, [
      body.room_number,
      body.livestock_type,
      createdDate,
      body.creator_id,
      body.crdt_id || body.creator_id
    ])

    const insertId = (result as any).insertId

    // 생성된 데이터 조회
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
    const [rows] = await connection.execute(selectQuery, [insertId])

    return {
      success: true,
      message: 'Livestock room created successfully',
      data: (rows as any[])[0],
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    console.error('축사방 생성 API 오류:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error',
      data: {
        success: false,
        message: 'Failed to create livestock room',
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




















