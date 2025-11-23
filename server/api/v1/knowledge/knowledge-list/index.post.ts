import mysql from 'mysql2/promise'
import { defineEventHandler, readBody, createError } from 'h3'
import { dbConfig } from '~/server/utils/dbConfig'

export default defineEventHandler(async (event) => {
  let connection: mysql.Connection | null = null
  try {
    const body = await readBody(event)
    console.log('지식 목록 생성 API 호출됨:', body)

    if (!body || !body.knowledge_master_id || !body.knowledge_name) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: {
          success: false,
          message: 'knowledge_master_id and knowledge_name are required',
          timestamp: new Date().toISOString()
        }
      })
    }

    connection = await mysql.createConnection(dbConfig)

    // knowledge_master_id 존재 여부 확인
    const checkMasterQuery = 'SELECT COUNT(*) as count FROM tbl_knowledge_master WHERE knowledge_master_id = ?'
    const [checkMasterResult] = await connection.execute(checkMasterQuery, [body.knowledge_master_id])
    
    if ((checkMasterResult as any[])[0].count === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
        data: {
          success: false,
          message: 'Knowledge master not found',
          timestamp: new Date().toISOString()
        }
      })
    }

    // 지식 목록 생성 (crdt_dt는 DEFAULT sysdate()로 자동 설정됨)
    const insertQuery = `
      INSERT INTO tbl_knowledge_list (
        knowledge_master_id,
        gubun,
        knowledge_id,
        knowledge_name,
        knowledge_desc,
        crdt_id
      ) VALUES (?, ?, ?, ?, ?, ?)
    `
    
    const [result] = await connection.execute(insertQuery, [
      body.knowledge_master_id,
      body.gubun || null,
      body.knowledge_id || null,
      body.knowledge_name,
      body.knowledge_desc || null,
      body.crdt_id || 'system'
    ])

    const insertId = (result as any).insertId

    // 생성된 데이터 조회
    const selectQuery = `
      SELECT 
        idx,
        knowledge_master_id,
        gubun,
        knowledge_id,
        knowledge_name,
        knowledge_desc,
        DATE_FORMAT(crdt_dt, '%Y-%m-%d %H:%i:%s') as crdt_dt,
        crdt_id
      FROM tbl_knowledge_list 
      WHERE idx = ?
    `
    const [rows] = await connection.execute(selectQuery, [insertId])

    return {
      success: true,
      message: 'Knowledge list created successfully',
      data: (rows as any[])[0],
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    console.error('지식 목록 생성 API 오류:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error',
      data: {
        success: false,
        message: 'Failed to create knowledge list',
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
