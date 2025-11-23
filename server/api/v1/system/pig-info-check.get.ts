import mysql from 'mysql2/promise'
import { defineEventHandler, getQuery, createError } from 'h3'
import { getPool } from '~/server/utils/dbConfig'

export default defineEventHandler(async (event) => {
  let connection: mysql.PoolConnection | null = null
  try {
    const query = getQuery(event)
    const pigId = query.pig_id as string
    
    console.log('돼지 정보 확인 API 호출됨:', { pigId })

    if (!pigId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: {
          success: false,
          message: 'pig_id parameter is required',
          timestamp: new Date().toISOString()
        }
      })
    }

    const pool = getPool()
    connection = await pool.getConnection()

    // 특정 돼지 정보 조회
    const pigInfoQuery = `
      SELECT 
        pig_id,
        pig_name,
        pig_tag,
        current_room_number,
        pig_status,
        breed,
        gender,
        birth_date,
        entry_weight,
        current_weight,
        entry_date,
        exit_date,
        health_status,
        supplier,
        entry_price,
        manager_id,
        notes,
        is_active,
        DATE_FORMAT(crdt_dt, '%Y-%m-%d %H:%i:%s') as crdt_dt,
        DATE_FORMAT(updt_dt, '%Y-%m-%d %H:%i:%s') as updt_dt
      FROM tbl_pig_info 
      WHERE pig_id = ?
    `
    
    const [pigResult] = await connection.execute(pigInfoQuery, [pigId])
    const pigInfo = (pigResult as any[])[0]

    // 전체 돼지 상태 통계
    const statusStatsQuery = `
      SELECT 
        pig_status,
        COUNT(*) as count
      FROM tbl_pig_info
      GROUP BY pig_status
      ORDER BY pig_status
    `
    const [statusStatsResult] = await connection.execute(statusStatsQuery)

    // 비슷한 ID 검색 (부분 일치)
    const similarPigsQuery = `
      SELECT 
        pig_id,
        pig_name,
        pig_status,
        current_room_number
      FROM tbl_pig_info 
      WHERE pig_id LIKE ?
      ORDER BY pig_id
      LIMIT 10
    `
    const [similarPigsResult] = await connection.execute(similarPigsQuery, [`%${pigId}%`])

    return {
      success: true,
      message: 'Pig information check completed',
      data: {
        pigId,
        pigInfo,
        exists: !!pigInfo,
        statusStatistics: statusStatsResult,
        similarPigs: similarPigsResult
      },
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    console.error('돼지 정보 확인 API 오류:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: {
        success: false,
        message: 'Failed to check pig information',
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




















