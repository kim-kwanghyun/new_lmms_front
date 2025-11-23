import mysql from 'mysql2/promise'
import { defineEventHandler, readBody, createError } from 'h3'
import { getPool } from '~/server/utils/dbConfig'

export default defineEventHandler(async (event) => {
  let connection: mysql.PoolConnection | null = null
  try {
    const body = await readBody(event)
    console.log('돼지 입고 등록 API 호출됨:', body)

    if (!body || !body.pig_id || !body.entry_room_number || !body.gender) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: {
          success: false,
          message: 'pig_id, entry_room_number, and gender are required',
          timestamp: new Date().toISOString()
        }
      })
    }

    // 성별 유효성 검사
    if (!['수컷', '암컷', '거세'].includes(body.gender)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: {
          success: false,
          message: 'gender must be one of: 수컷, 암컷, 거세',
          timestamp: new Date().toISOString()
        }
      })
    }

    const pool = getPool()
    connection = await pool.getConnection()

    // 트랜잭션 시작
    await connection.beginTransaction()

    try {
      // 돼지 ID 중복 체크
      const checkQuery = 'SELECT COUNT(*) as count FROM tbl_pig_info WHERE pig_id = ?'
      const [checkResult] = await connection.execute(checkQuery, [body.pig_id])
      
      if ((checkResult as any[])[0].count > 0) {
        throw createError({
          statusCode: 409,
          statusMessage: 'Conflict',
          data: {
            success: false,
            message: `돼지 ID '${body.pig_id}'가 이미 존재합니다. 다른 ID를 사용해주세요.`,
            timestamp: new Date().toISOString()
          }
        })
      }

      // 축사방 존재 여부 확인
      const roomCheckQuery = 'SELECT COUNT(*) as count FROM tbl_livestock_room WHERE room_number = ? AND livestock_type = "돼지"'
      const [roomCheckResult] = await connection.execute(roomCheckQuery, [body.entry_room_number])
      
      if ((roomCheckResult as any[])[0].count === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Not Found',
          data: {
            success: false,
            message: `축사번호 '${body.entry_room_number}'가 존재하지 않거나 돼지 축사가 아닙니다.`,
            timestamp: new Date().toISOString()
          }
        })
      }

      // 돼지 정보 등록
      const insertPigQuery = `
        INSERT INTO tbl_pig_info (
          pig_id, pig_tag, pig_name, current_room_number, pig_status,
          breed, gender, birth_date, birth_weight,
          entry_date, entry_weight, entry_age_days, entry_room_number,
          supplier, entry_price, current_weight, last_weight_date,
          health_status, manager_id, crdt_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
      
      const entryDate = body.entry_date || new Date().toISOString().slice(0, 19).replace('T', ' ')
      const currentWeight = body.current_weight || body.entry_weight
      
      await connection.execute(insertPigQuery, [
        body.pig_id,
        body.pig_tag || null,
        body.pig_name || null,
        body.entry_room_number, // 현재 축사번호
        '사육중', // 기본 상태
        body.breed || null,
        body.gender,
        body.birth_date || null,
        body.birth_weight || null,
        entryDate,
        body.entry_weight || null,
        body.entry_age_days || null,
        body.entry_room_number,
        body.supplier || null,
        body.entry_price || null,
        currentWeight,
        entryDate, // 최근 체중 측정일
        body.health_status || '정상',
        body.manager_id || 'admin',
        body.crdt_id || 'admin'
      ])

      // 입고 거래 내역 등록
      const transactionId = `TXN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Date.now()}`
      const insertTransactionQuery = `
        INSERT INTO tbl_pig_transaction (
          transaction_id, pig_id, transaction_type, transaction_date,
          to_room_number, weight, age_days, unit_price, total_price,
          partner_name, partner_contact, health_check_result,
          manager_id, crdt_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
      
      await connection.execute(insertTransactionQuery, [
        transactionId,
        body.pig_id,
        '입고',
        entryDate,
        body.entry_room_number,
        body.entry_weight || null,
        body.entry_age_days || null,
        body.entry_price && body.entry_weight ? (body.entry_price / body.entry_weight) : null,
        body.entry_price || null,
        body.supplier || null,
        body.supplier_contact || null,
        body.health_check_result || '양호',
        body.manager_id || 'admin',
        body.crdt_id || 'admin'
      ])

      // 트랜잭션 커밋
      await connection.commit()

      // 생성된 데이터 조회
      const selectQuery = `
        SELECT 
          pig_id, pig_tag, pig_name, current_room_number, pig_status,
          breed, gender, birth_date, birth_weight,
          DATE_FORMAT(entry_date, '%Y-%m-%d %H:%i:%s') as entry_date,
          entry_weight, entry_age_days, entry_room_number,
          supplier, entry_price, current_weight,
          health_status, manager_id,
          DATE_FORMAT(crdt_dt, '%Y-%m-%d %H:%i:%s') as crdt_dt,
          crdt_id
        FROM tbl_pig_info 
        WHERE pig_id = ?
      `
      const [rows] = await connection.execute(selectQuery, [body.pig_id])

      return {
        success: true,
        message: 'Pig registered successfully',
        data: (rows as any[])[0],
        timestamp: new Date().toISOString()
      }

    } catch (error) {
      // 트랜잭션 롤백
      await connection.rollback()
      throw error
    }

  } catch (error) {
    console.error('돼지 입고 등록 API 오류:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error',
      data: {
        success: false,
        message: 'Failed to register pig',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    })
  } finally {
    if (connection) {
      connection.release()
    }
  }
})
