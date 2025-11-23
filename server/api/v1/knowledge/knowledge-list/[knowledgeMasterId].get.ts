import mysql from 'mysql2/promise'
import { defineEventHandler, getRouterParam, createError } from 'h3'
import { dbConfig } from '~/server/utils/dbConfig'

export default defineEventHandler(async (event) => {
  let connection: mysql.Connection | null = null
  try {
    const knowledgeMasterId = getRouterParam(event, 'knowledgeMasterId')
    console.log('지식 목록 조회 API 호출됨:', knowledgeMasterId)

    if (!knowledgeMasterId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: {
          success: false,
          message: 'knowledgeMasterId is required',
          timestamp: new Date().toISOString()
        }
      })
    }

    connection = await mysql.createConnection(dbConfig)

    // tbl_knowledge_master 존재 여부 확인 (선택 사항, 유효성 검사)
    const checkMasterQuery = 'SELECT COUNT(*) as count FROM tbl_knowledge_master WHERE knowledge_master_id = ?'
    const [checkMasterResult] = await connection.execute(checkMasterQuery, [knowledgeMasterId])

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

    // 지식 목록 조회
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
      WHERE knowledge_master_id = ?
      ORDER BY idx ASC
    `
    const [rows] = await connection.execute(selectQuery, [knowledgeMasterId])

    return {
      success: true,
      message: 'Knowledge list retrieved successfully',
      data: {
        knowledge_master_id: knowledgeMasterId,
        knowledgeList: rows
      },
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    console.error('지식 목록 조회 API 오류:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error',
      data: {
        success: false,
        message: 'Failed to retrieve knowledge list',
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
