import mysql from 'mysql2/promise'
import { defineEventHandler, getRouterParam, createError } from 'h3'
import { dbConfig } from '~/server/utils/dbConfig'

export default defineEventHandler(async (event) => {
  let connection: mysql.Connection | null = null
  try {
    const postId = getRouterParam(event, 'id')
    console.log('게시글 상세 조회 API 호출됨:', postId)

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

    // 게시글 조회
    const selectQuery = `
      SELECT 
        p.post_id,
        p.title,
        p.content,
        p.category,
        p.is_notice,
        p.is_pinned,
        p.view_count,
        p.crdt_id,
        DATE_FORMAT(p.crdt_dt, '%Y-%m-%d %H:%i:%s') as crdt_dt,
        DATE_FORMAT(p.updt_dt, '%Y-%m-%d %H:%i:%s') as updt_dt
      FROM tbl_bbs_post p
      WHERE p.post_id = ? AND p.del_dt IS NULL
    `
    const [rows] = await connection.execute(selectQuery, [postId])

    if ((rows as any[]).length === 0) {
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

    const post = (rows as any[])[0]

    // 조회수 증가
    await connection.execute(
      'UPDATE tbl_bbs_post SET view_count = view_count + 1 WHERE post_id = ?',
      [postId]
    )
    post.view_count = post.view_count + 1

    // 첨부파일 목록 조회
    const fileQuery = `
      SELECT 
        file_id,
        original_filename,
        stored_filename,
        file_path,
        file_size,
        file_type,
        download_count,
        DATE_FORMAT(crdt_dt, '%Y-%m-%d %H:%i:%s') as crdt_dt
      FROM tbl_bbs_file
      WHERE post_id = ? AND del_dt IS NULL
      ORDER BY crdt_dt ASC
    `
    const [fileRows] = await connection.execute(fileQuery, [postId])

    return {
      success: true,
      message: '게시글 상세 조회 성공',
      data: {
        post,
        files: fileRows
      },
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    console.error('게시글 상세 조회 API 오류:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error',
      data: {
        success: false,
        message: '게시글 상세 조회 실패',
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

