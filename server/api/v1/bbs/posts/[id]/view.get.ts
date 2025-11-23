import mysql from 'mysql2/promise'
import { defineEventHandler, getRouterParam, createError } from 'h3'
import { dbConfig } from '~/server/utils/dbConfig'

export default defineEventHandler(async (event) => {
  let connection: mysql.Connection | null = null
  try {
    const postId = getRouterParam(event, 'id')
    console.log('게시글 조회수 증가 API 호출됨:', postId)

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

    // 조회수 증가
    await connection.execute(
      'UPDATE tbl_bbs_post SET view_count = view_count + 1 WHERE post_id = ?',
      [postId]
    )

    return {
      success: true,
      message: '조회수가 증가되었습니다',
      data: {
        post_id: postId
      },
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    console.error('조회수 증가 API 오류:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: {
        success: false,
        message: '조회수 증가 실패',
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

