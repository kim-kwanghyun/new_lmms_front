import mysql from 'mysql2/promise'
import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
import { dbConfig } from '~/server/utils/dbConfig'

export default defineEventHandler(async (event) => {
  let connection: mysql.Connection | null = null
  try {
    const knowledgeMasterId = getRouterParam(event, 'knowledgeMasterId')
    const idx = getRouterParam(event, 'idx')
    const body = await readBody(event)

    console.log('지식 목록 수정 API 호출됨:', knowledgeMasterId, idx, body)

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

    if (!body || (!body.knowledge_name && !body.knowledge_desc && !body.gubun && body.knowledge_id === undefined)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: {
          success: false,
          message: 'At least one field is required for update',
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

    // 지식 목록 수정
    const updateFields: string[] = []
    const updateParams: any[] = []

    if (body.gubun !== undefined) {
      updateFields.push('gubun = ?')
      updateParams.push(body.gubun)
    }

    if (body.knowledge_id !== undefined) {
      updateFields.push('knowledge_id = ?')
      updateParams.push(body.knowledge_id)
    }

    if (body.knowledge_name !== undefined) {
      updateFields.push('knowledge_name = ?')
      updateParams.push(body.knowledge_name)
    }

    if (body.knowledge_desc !== undefined) {
      updateFields.push('knowledge_desc = ?')
      updateParams.push(body.knowledge_desc)
    }

    if (body.crdt_id !== undefined) {
      updateFields.push('crdt_id = ?')
      updateParams.push(body.crdt_id)
    }

    if (updateFields.length === 0) {
      return {
        success: true,
        message: 'No fields to update',
        data: { knowledge_master_id: knowledgeMasterId, idx: idx },
        timestamp: new Date().toISOString()
      }
    }

    updateParams.push(knowledgeMasterId, idx) // WHERE 절 파라미터

    const updateQuery = `
      UPDATE tbl_knowledge_list
      SET ${updateFields.join(', ')}
      WHERE knowledge_master_id = ? AND idx = ?
    `
    await connection.execute(updateQuery, updateParams)

    // 수정된 데이터 조회
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
      WHERE knowledge_master_id = ? AND idx = ?
    `
    const [rows] = await connection.execute(selectQuery, [knowledgeMasterId, idx])

    return {
      success: true,
      message: 'Knowledge list updated successfully',
      data: (rows as any[])[0],
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    console.error('지식 목록 수정 API 오류:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error',
      data: {
        success: false,
        message: 'Failed to update knowledge list',
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
