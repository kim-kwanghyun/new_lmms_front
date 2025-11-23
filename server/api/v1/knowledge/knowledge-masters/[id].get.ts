import mysql from 'mysql2/promise'
import { defineEventHandler, getRouterParam, createError } from 'h3'
import { dbConfig } from '~/server/utils/dbConfig'

export default defineEventHandler(async (event) => {
  let connection: mysql.Connection | null = null
  try {
    const knowledgeMasterId = getRouterParam(event, 'id')
    console.log('지식 마스터 상세 조회 API 호출됨:', knowledgeMasterId)

    if (!knowledgeMasterId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: {
          success: false,
          message: 'Knowledge master ID is required',
          timestamp: new Date().toISOString()
        }
      })
    }

    connection = await mysql.createConnection(dbConfig)

    // 지식 마스터 조회
    const masterQuery = `
      SELECT 
        idx,
        knowledge_master_name,
        knowledge_master_id,
        knowledge_master_desc,
        crdt_id,
        DATE_FORMAT(crdt_dt, '%Y-%m-%d %H:%i:%s') as crdt_dt
      FROM tbl_knowledge_master 
      WHERE knowledge_master_id = ?
    `
    const [masterRows] = await connection.execute(masterQuery, [knowledgeMasterId])

    if ((masterRows as any[]).length === 0) {
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

    // 관련 지식 목록 조회
    const listQuery = `
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
    const [listRows] = await connection.execute(listQuery, [knowledgeMasterId])

    return {
      success: true,
      message: 'Knowledge master retrieved successfully',
      data: {
        master: (masterRows as any[])[0],
        knowledgeList: listRows
      },
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    console.error('지식 마스터 상세 조회 API 오류:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error',
      data: {
        success: false,
        message: 'Failed to retrieve knowledge master',
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
