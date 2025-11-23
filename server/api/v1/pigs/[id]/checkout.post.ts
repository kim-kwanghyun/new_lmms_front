import mysql from 'mysql2/promise'
import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
import { getPool } from '~/server/utils/dbConfig'

export default defineEventHandler(async (event) => {
  let connection: mysql.PoolConnection | null = null
  try {
    const pigId = getRouterParam(event, 'id')
    const body = await readBody(event)
    
    console.log('돼지 출고 처리 API 호출됨:', pigId, body)

    if (!pigId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: {
          success: false,
          message: 'Pig ID is required',
          timestamp: new Date().toISOString()
        }
      })
    }

    if (!body || !body.exit_reason || !body.exit_destination) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: {
          success: false,
          message: 'exit_reason and exit_destination are required',
          timestamp: new Date().toISOString()
        }
      })
    }

    // 출고 사유 유효성 검사
    if (!['정상출하', '도축', '판매', '폐사', '기타'].includes(body.exit_reason)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: {
          success: false,
          message: 'exit_reason must be one of: 정상출하, 도축, 판매, 폐사, 기타',
          timestamp: new Date().toISOString()
        }
      })
    }

    const pool = getPool()
    connection = await pool.getConnection()

    // 트랜잭션 시작
    await connection.beginTransaction()

    try {
      // 돼지 존재 여부 및 현재 상태 확인
      const checkQuery = `
        SELECT pig_id, pig_tag, pig_name, current_room_number, pig_status, 
               current_weight, health_status 
        FROM tbl_pig_info 
        WHERE pig_id = ? AND is_active = TRUE
      `
      const [checkResult] = await connection.execute(checkQuery, [pigId])

      if ((checkResult as any[]).length === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Not Found',
          data: {
            success: false,
            message: 'Pig not found or inactive',
            timestamp: new Date().toISOString()
          }
        })
      }

      const pigInfo = (checkResult as any[])[0]

      // 이미 출고된 돼지인지 확인
      if (pigInfo.pig_status === '출고') {
        throw createError({
          statusCode: 400,
          statusMessage: 'Bad Request',
          data: {
            success: false,
            message: 'Pig is already checked out',
            timestamp: new Date().toISOString()
          }
        })
      }

      const exitDate = body.exit_date || new Date().toISOString().slice(0, 19).replace('T', ' ')
      const exitWeight = body.exit_weight || pigInfo.current_weight

      // 돼지 정보 업데이트 (출고 처리)
      const updatePigQuery = `
        UPDATE tbl_pig_info 
        SET 
          pig_status = '출고',
          current_room_number = NULL,
          exit_date = ?,
          exit_weight = ?,
          exit_reason = ?,
          exit_destination = ?,
          exit_price = ?,
          current_weight = ?,
          updt_dt = NOW(),
          updt_id = ?
        WHERE pig_id = ?
      `
      
      await connection.execute(updatePigQuery, [
        exitDate,
        exitWeight,
        body.exit_reason,
        body.exit_destination,
        body.exit_price || null,
        exitWeight,
        body.manager_id || 'admin',
        pigId
      ])

      // 출고 거래 내역 등록
      const transactionId = `TXN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Date.now()}`
      const insertTransactionQuery = `
        INSERT INTO tbl_pig_transaction (
          transaction_id, pig_id, transaction_type, transaction_date,
          from_room_number, weight, unit_price, total_price,
          partner_name, partner_contact, health_check_result,
          transport_method, transport_cost, invoice_number,
          manager_id, notes, crdt_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
      
      await connection.execute(insertTransactionQuery, [
        transactionId,
        pigId,
        '출고',
        exitDate,
        pigInfo.current_room_number, // 출고 전 축사번호
        exitWeight,
        body.exit_price && exitWeight ? (body.exit_price / exitWeight) : null,
        body.exit_price || null,
        body.exit_destination,
        body.buyer_contact || null,
        body.health_check_result || '양호',
        body.transport_method || null,
        body.transport_cost || null,
        body.invoice_number || null,
        body.manager_id || 'admin',
        body.notes || null,
        body.crdt_id || 'admin'
      ])

      // 트랜잭션 커밋
      await connection.commit()

      // 업데이트된 데이터 조회
      const selectQuery = `
        SELECT 
          pig_id, pig_tag, pig_name, current_room_number, pig_status,
          breed, gender, birth_date,
          DATE_FORMAT(entry_date, '%Y-%m-%d %H:%i:%s') as entry_date,
          entry_weight, current_weight,
          DATE_FORMAT(exit_date, '%Y-%m-%d %H:%i:%s') as exit_date,
          exit_weight, exit_reason, exit_destination, exit_price,
          health_status, manager_id,
          DATE_FORMAT(updt_dt, '%Y-%m-%d %H:%i:%s') as updt_dt,
          updt_id
        FROM tbl_pig_info 
        WHERE pig_id = ?
      `
      const [rows] = await connection.execute(selectQuery, [pigId])

      return {
        success: true,
        message: 'Pig checked out successfully',
        data: {
          pig: (rows as any[])[0],
          transaction_id: transactionId
        },
        timestamp: new Date().toISOString()
      }

    } catch (error) {
      // 트랜잭션 롤백
      await connection.rollback()
      throw error
    }

  } catch (error) {
    console.error('돼지 출고 처리 API 오류:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error',
      data: {
        success: false,
        message: 'Failed to checkout pig',
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
