import mysql from 'mysql2/promise'
import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
import { dbConfig } from '~/server/utils/dbConfig'

export default defineEventHandler(async (event) => {
  let connection: mysql.Connection | null = null
  try {
    const knowledgeMasterId = getRouterParam(event, 'id')
    const body = await readBody(event)
    
    console.log('지식 마스터 수정 API 호출됨:', knowledgeMasterId, body)

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

    if (!body || (!body.knowledge_master_name && !body.knowledge_master_desc)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: {
          success: false,
          message: 'At least knowledge_master_name or knowledge_master_desc is required for update',
          timestamp: new Date().toISOString()
        }
      })
    }

    connection = await mysql.createConnection(dbConfig)

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

    // 지식 마스터 수정
    const updateFields: string[] = []
    const updateParams: any[] = []

    if (body.knowledge_master_name !== undefined) {
      updateFields.push('knowledge_master_name = ?')
      updateParams.push(body.knowledge_master_name)
    }

    if (body.knowledge_master_desc !== undefined) {
      updateFields.push('knowledge_master_desc = ?')
      updateParams.push(body.knowledge_master_desc)
    }

    if (body.crdt_id !== undefined) {
      updateFields.push('crdt_id = ?')
      updateParams.push(body.crdt_id)
    }

    if (updateFields.length === 0) {
      return {
        success: true,
        message: 'No fields to update',
        data: { knowledge_master_id: knowledgeMasterId },
        timestamp: new Date().toISOString()
      }
    }

    updateParams.push(knowledgeMasterId) // WHERE 절 파라미터

    const updateQuery = `
      UPDATE tbl_knowledge_master 
      SET ${updateFields.join(', ')}
      WHERE knowledge_master_id = ?
    `
    await connection.execute(updateQuery, updateParams)

    // 수정된 데이터 조회
    const selectQuery = `
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
    const [rows] = await connection.execute(selectQuery, [knowledgeMasterId])

    return {
      success: true,
      message: 'Knowledge master updated successfully',
      data: (rows as any[])[0],
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    console.error('지식 마스터 수정 API 오류:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error',
      data: {
        success: false,
        message: 'Failed to update knowledge master',
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
