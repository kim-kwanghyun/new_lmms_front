import mysql from 'mysql2/promise'
import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
import { dbConfig } from '~/server/utils/dbConfig'

export default defineEventHandler(async (event) => {
  let connection: mysql.Connection | null = null
  try {
    const roomId = getRouterParam(event, 'id')
    const body = await readBody(event)
    
    console.log('축사방 수정 API 호출됨:', roomId, body)

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

    if (!body || (!body.room_number && !body.livestock_type && !body.created_date && !body.creator_id)) {
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

    // 가축종류 유효성 검사
    if (body.livestock_type && !['돼지', '소'].includes(body.livestock_type)) {
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

    // 존재 여부 확인
    const checkQuery = 'SELECT COUNT(*) as count FROM tbl_livestock_room WHERE idx = ?'
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

    // 축사번호 중복 체크 (다른 레코드와 중복되는지)
    if (body.room_number) {
      const duplicateQuery = 'SELECT COUNT(*) as count FROM tbl_livestock_room WHERE room_number = ? AND idx != ?'
      const [duplicateResult] = await connection.execute(duplicateQuery, [body.room_number, roomId])
      
      if ((duplicateResult as any[])[0].count > 0) {
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
    }

    // 축사방 수정
    const updateFields: string[] = []
    const updateParams: any[] = []

    if (body.room_number !== undefined) {
      updateFields.push('room_number = ?')
      updateParams.push(body.room_number)
    }

    if (body.livestock_type !== undefined) {
      updateFields.push('livestock_type = ?')
      updateParams.push(body.livestock_type)
    }

    if (body.created_date !== undefined) {
      updateFields.push('created_date = ?')
      updateParams.push(body.created_date)
    }

    if (body.creator_id !== undefined) {
      updateFields.push('creator_id = ?')
      updateParams.push(body.creator_id)
    }

    if (body.crdt_id !== undefined) {
      updateFields.push('crdt_id = ?')
      updateParams.push(body.crdt_id)
    }

    if (updateFields.length === 0) {
      return {
        success: true,
        message: 'No fields to update',
        data: { idx: roomId },
        timestamp: new Date().toISOString()
      }
    }

    updateParams.push(roomId) // WHERE 절 파라미터

    const updateQuery = `
      UPDATE tbl_livestock_room 
      SET ${updateFields.join(', ')}
      WHERE idx = ?
    `
    await connection.execute(updateQuery, updateParams)

    // 수정된 데이터 조회
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

    return {
      success: true,
      message: 'Livestock room updated successfully',
      data: (rows as any[])[0],
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    console.error('축사방 수정 API 오류:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error',
      data: {
        success: false,
        message: 'Failed to update livestock room',
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




















