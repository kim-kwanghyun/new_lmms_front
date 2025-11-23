import mysql from 'mysql2/promise'
import { defineEventHandler, createError } from 'h3'
import { getPool } from '~/server/utils/dbConfig'

export default defineEventHandler(async (event) => {
  let connection: mysql.PoolConnection | null = null
  try {
    console.log('돼지 테이블 존재 확인 API 호출됨')

    const pool = getPool()
    connection = await pool.getConnection()

    // 돼지 관련 테이블 존재 여부 확인
    const checkTablesQuery = `
      SELECT 
        table_name,
        table_comment
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
        AND table_name IN ('tbl_pig_info', 'tbl_pig_daily_feeding', 'tbl_pig_health_records', 'tbl_pig_weight_records')
      ORDER BY table_name
    `
    
    const [tablesResult] = await connection.execute(checkTablesQuery)
    const existingTables = (tablesResult as any[]).map(row => row.table_name)
    
    const requiredTables = ['tbl_pig_info', 'tbl_pig_daily_feeding', 'tbl_pig_health_records', 'tbl_pig_weight_records']
    const missingTables = requiredTables.filter(table => !existingTables.includes(table))
    
    // 각 테이블의 컬럼 정보도 확인
    const tableInfo: any = {}
    
    for (const tableName of existingTables) {
      const columnsQuery = `
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          column_comment
        FROM information_schema.columns 
        WHERE table_schema = DATABASE() 
          AND table_name = ?
        ORDER BY ordinal_position
      `
      const [columnsResult] = await connection.execute(columnsQuery, [tableName])
      tableInfo[tableName] = {
        exists: true,
        columns: columnsResult
      }
    }
    
    // 누락된 테이블 정보 추가
    for (const tableName of missingTables) {
      tableInfo[tableName] = {
        exists: false,
        columns: []
      }
    }

    return {
      success: true,
      message: 'Pig tables check completed',
      data: {
        requiredTables,
        existingTables,
        missingTables,
        tableInfo,
        allTablesExist: missingTables.length === 0
      },
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    console.error('돼지 테이블 확인 API 오류:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: {
        success: false,
        message: 'Failed to check pig tables',
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