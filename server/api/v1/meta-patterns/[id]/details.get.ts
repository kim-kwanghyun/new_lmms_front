// 메타 패턴 상세 목록 조회 API
import mysql from 'mysql2/promise'
import { defineEventHandler, getRouterParam, createError } from 'h3'

// 데이터베이스 연결 설정
const dbConfig = {
  host: process.env.CONST_DB_HOST || '223.130.159.190',
  port: parseInt(process.env.CONST_DB_PORT || '3306'),
  user: process.env.CONST_DB_USER || 'lsmms',
  password: process.env.CONST_DB_PASSWORD?.replace(/'/g, '') || 'first_lsmms',
  database: process.env.CONST_DB_DATABASE || 'LSMMS',
  charset: 'utf8mb4'
}

export default defineEventHandler(async (event) => {
  let connection: mysql.Connection | null = null
  
  try {
    // URL 파라미터에서 pattern_master_id 가져오기
    const patternMasterId = getRouterParam(event, 'id')
    
    console.log('메타 패턴 상세 목록 조회 API 호출됨:', patternMasterId)
    
    if (!patternMasterId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: {
          success: false,
          message: 'Pattern master ID is required',
          timestamp: new Date().toISOString()
        }
      })
    }
    
    // 데이터베이스 연결
    connection = await mysql.createConnection(dbConfig)
    
    // 패턴 마스터 존재 여부 확인
    const masterCheckQuery = `
      SELECT pattern_master_id, pattern_master_name 
      FROM tbl_meta_pattern_master 
      WHERE pattern_master_id = ?
    `
    const [masterResult] = await connection.execute(masterCheckQuery, [patternMasterId])
    
    if ((masterResult as any[]).length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
        data: {
          success: false,
          message: 'Pattern master not found',
          timestamp: new Date().toISOString()
        }
      })
    }
    
    // 패턴 상세 목록 조회
    const selectQuery = `
      SELECT 
        pattern_idx,
        pattern_master_id,
        value,
        pattern_name,
        pattern_desc,
        crdt_id,
        DATE_FORMAT(crdt_dt, '%Y-%m-%d %H:%i:%s') as crdt_dt,
        mdfy_id,
        DATE_FORMAT(mdfy_dt, '%Y-%m-%d %H:%i:%s') as mdfy_dt
      FROM tbl_meta_pattern_detail 
      WHERE pattern_master_id = ?
      ORDER BY pattern_idx ASC
    `
    
    const [rows] = await connection.execute(selectQuery, [patternMasterId])
    
    const masterInfo = (masterResult as any[])[0]
    
    return {
      success: true,
      message: 'Pattern details retrieved successfully',
      data: {
        pattern_master_id: patternMasterId,
        pattern_master_name: masterInfo.pattern_master_name,
        details: rows,
        count: (rows as any[]).length
      },
      timestamp: new Date().toISOString()
    }
    
  } catch (error) {
    console.error('메타 패턴 상세 목록 조회 API 오류:', error)
    
    // 이미 createError로 던진 에러는 그대로 전파
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: {
        success: false,
        message: 'Failed to retrieve pattern details',
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


