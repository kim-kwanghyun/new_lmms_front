import mysql from 'mysql2/promise'
import { defineEventHandler, getRouterParam, createError } from 'h3'
import { dbConfig } from '~/server/utils/dbConfig'

export default defineEventHandler(async (event) => {
  let connection: mysql.Connection | null = null
  try {
    const postId = getRouterParam(event, 'id')
    console.log('게시글 삭제 API 호출됨:', postId)

    if (!postId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: {
          success: false,
          message: 'post_id is required',
          timestamp: new Date().toISOString()
        }
      })
    }

    connection = await mysql.createConnection(dbConfig)

    // 게시글 존재 확인
    const [checkRows] = await connection.execute(
      'SELECT post_id FROM tbl_bbs_post WHERE post_id = ? AND status != ?',
      [postId, '삭제']
    )

    if ((checkRows as any[]).length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
        data: {
          success: false,
          message: '게시글을 찾을 수 없습니다',
          timestamp: new Date().toISOString()
        }
      })
    }

    // 게시글 삭제 (소프트 삭제)
    const deleteQuery = `
      UPDATE tbl_bbs_post SET
        status = '삭제',
        del_dt = NOW(),
        del_id = 'system'
      WHERE post_id = ?
    `
    await connection.execute(deleteQuery, [postId])

    return {
      success: true,
      message: '게시글이 삭제되었습니다',
      data: {
        post_id: postId
      },
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    console.error('게시글 삭제 API 오류:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error',
      data: {
        success: false,
        message: '게시글 삭제 실패',
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

