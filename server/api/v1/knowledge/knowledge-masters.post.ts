import mysql from 'mysql2/promise'
import { defineEventHandler, readBody, createError } from 'h3'
import { dbConfig } from '~/server/utils/dbConfig'

export default defineEventHandler(async (event) => {
  let connection: mysql.Connection | null = null
  try {
    const body = await readBody(event)
    console.log('지식 마스터 생성 API 호출됨:', body)

    if (!body || !body.knowledge_master_name || !body.knowledge_master_id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: {
          success: false,
          message: 'knowledge_master_name and knowledge_master_id are required',
          timestamp: new Date().toISOString()
        }
      })
    }

    connection = await mysql.createConnection(dbConfig)

    // 중복 체크 (UNIQUE 인덱스로 인한 중복 방지)
    const checkQuery = 'SELECT COUNT(*) as count FROM tbl_knowledge_master WHERE knowledge_master_id = ?'
    const [checkResult] = await connection.execute(checkQuery, [body.knowledge_master_id])
    
    if ((checkResult as any[])[0].count > 0) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Conflict',
        data: {
          success: false,
          message: `Knowledge master ID '${body.knowledge_master_id}' already exists. Please use a different ID.`,
          timestamp: new Date().toISOString()
        }
      })
    }

    // 지식 마스터 생성 (crdt_dt는 DEFAULT sysdate()로 자동 설정됨)
    const insertQuery = `
      INSERT INTO tbl_knowledge_master (
        knowledge_master_name,
        knowledge_master_id,
        knowledge_master_desc,
        crdt_id
      ) VALUES (?, ?, ?, ?)
    `
    
    const [result] = await connection.execute(insertQuery, [
      body.knowledge_master_name,
      body.knowledge_master_id,
      body.knowledge_master_desc || null,
      body.crdt_id || 'system'
    ])

    const insertId = (result as any).insertId

    // 생성된 데이터 조회
    const selectQuery = `
      SELECT 
        idx,
        knowledge_master_name,
        knowledge_master_id,
        knowledge_master_desc,
        crdt_id,
        DATE_FORMAT(crdt_dt, '%Y-%m-%d %H:%i:%s') as crdt_dt
      FROM tbl_knowledge_master 
      WHERE idx = ?
    `
    const [rows] = await connection.execute(selectQuery, [insertId])

    return {
      success: true,
      message: 'Knowledge master created successfully',
      data: (rows as any[])[0],
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    console.error('지식 마스터 생성 API 오류:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error',
      data: {
        success: false,
        message: 'Failed to create knowledge master',
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
