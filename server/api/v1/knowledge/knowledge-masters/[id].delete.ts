import mysql from 'mysql2/promise'
import { defineEventHandler, getRouterParam, createError } from 'h3'
import { dbConfig } from '~/server/utils/dbConfig'

export default defineEventHandler(async (event) => {
  let connection: mysql.Connection | null = null
  try {
    const knowledgeMasterId = getRouterParam(event, 'id')
    console.log('지식 마스터 삭제 API 호출됨:', knowledgeMasterId)

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

    // 트랜잭션 시작
    await connection.beginTransaction()

    try {
      // 존재 여부 확인
      const checkQuery = 'SELECT COUNT(*) as count FROM tbl_knowledge_master WHERE knowledge_master_id = ?'
      const [checkResult] = await connection.execute(checkQuery, [knowledgeMasterId])

      if ((checkResult as any[])[0].count === 0) {
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

      // 관련 지식 목록 삭제
      const deleteListQuery = 'DELETE FROM tbl_knowledge_list WHERE knowledge_master_id = ?'
      await connection.execute(deleteListQuery, [knowledgeMasterId])

      // 지식 마스터 삭제
      const deleteMasterQuery = 'DELETE FROM tbl_knowledge_master WHERE knowledge_master_id = ?'
      await connection.execute(deleteMasterQuery, [knowledgeMasterId])

      // 트랜잭션 커밋
      await connection.commit()

      return {
        success: true,
        message: 'Knowledge master and related knowledge list deleted successfully',
        data: {
          knowledge_master_id: knowledgeMasterId,
          deleted_at: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      }

    } catch (error) {
      // 트랜잭션 롤백
      await connection.rollback()
      throw error
    }

  } catch (error) {
    console.error('지식 마스터 삭제 API 오류:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error',
      data: {
        success: false,
        message: 'Failed to delete knowledge master',
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

