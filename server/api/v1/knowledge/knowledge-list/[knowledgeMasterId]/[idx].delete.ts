import mysql from 'mysql2/promise'
import { defineEventHandler, getRouterParam, createError } from 'h3'
import { dbConfig } from '~/server/utils/dbConfig'

export default defineEventHandler(async (event) => {
  let connection: mysql.Connection | null = null
  try {
    const knowledgeMasterId = getRouterParam(event, 'knowledgeMasterId')
    const idx = getRouterParam(event, 'idx')

    console.log('지식 목록 삭제 API 호출됨:', knowledgeMasterId, idx)

    if (!knowledgeMasterId || !idx) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: {
          success: false,
          message: 'knowledgeMasterId and idx are required',
          timestamp: new Date().toISOString()
        }
      })
    }

    connection = await mysql.createConnection(dbConfig)

    // 존재 여부 확인
    const checkQuery = 'SELECT COUNT(*) as count FROM tbl_knowledge_list WHERE knowledge_master_id = ? AND idx = ?'
    const [checkResult] = await connection.execute(checkQuery, [knowledgeMasterId, idx])

    if ((checkResult as any[])[0].count === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
        data: {
          success: false,
          message: 'Knowledge list not found',
          timestamp: new Date().toISOString()
        }
      })
    }

    // 지식 목록 삭제
    const deleteQuery = 'DELETE FROM tbl_knowledge_list WHERE knowledge_master_id = ? AND idx = ?'
    const [result] = await connection.execute(deleteQuery, [knowledgeMasterId, idx])

    return {
      success: true,
      message: 'Knowledge list deleted successfully',
      data: {
        knowledge_master_id: knowledgeMasterId,
        idx: idx,
        deleted_at: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    console.error('지식 목록 삭제 API 오류:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error',
      data: {
        success: false,
        message: 'Failed to delete knowledge list',
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

