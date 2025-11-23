import mysql from 'mysql2/promise'
import { defineEventHandler, getQuery, createError } from 'h3'
import { dbConfig } from '~/server/utils/dbConfig'

export default defineEventHandler(async (event) => {
  let connection: mysql.Connection | null = null
  try {
    const query = getQuery(event)
    console.log('게시글 목록 조회 API 호출됨:', query)

    const page = parseInt(query.page as string) || 1
    const pageSize = parseInt(query.pageSize as string) || 10
    const search = query.search as string
    const category = query.category as string
    const offset = (page - 1) * pageSize

    connection = await mysql.createConnection(dbConfig)

    // WHERE 조건 구성
    const whereConditions: string[] = ["status != '삭제'"]
    const params: any[] = []

    if (search) {
      whereConditions.push('(title LIKE ? OR content LIKE ?)')
      const searchPattern = `%${search}%`
      params.push(searchPattern, searchPattern)
    }

    if (category) {
      whereConditions.push('category = ?')
      params.push(category)
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : ''

    // 전체 개수 조회
    const countQuery = `
      SELECT COUNT(*) as total
      FROM tbl_bbs_post
      ${whereClause}
    `
    const [countRows] = await connection.execute(countQuery, params)
    const totalCount = (countRows as any[])[0]?.total || 0

    // 게시글 목록 조회 (공지사항 및 고정글 우선 정렬)
    const selectQuery = `
      SELECT 
        p.post_id,
        p.title,
        p.content,
        p.category,
        p.status,
        p.is_notice,
        p.is_pinned,
        p.view_count,
        p.like_count,
        p.crdt_id,
        DATE_FORMAT(p.crdt_dt, '%Y-%m-%d %H:%i:%s') as crdt_dt,
        DATE_FORMAT(p.updt_dt, '%Y-%m-%d %H:%i:%s') as updt_dt,
        COUNT(f.file_id) as file_count
      FROM tbl_bbs_post p
      LEFT JOIN tbl_bbs_file f ON p.post_id = f.post_id AND f.del_dt IS NULL
      ${whereClause}
      GROUP BY p.post_id
      ORDER BY p.is_notice DESC, p.is_pinned DESC, p.crdt_dt DESC
      LIMIT ? OFFSET ?
    `
    params.push(pageSize, offset)
    const [rows] = await connection.execute(selectQuery, params)

    return {
      success: true,
      message: '게시글 목록 조회 성공',
      data: {
        posts: rows,
        totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize)
      },
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    console.error('게시글 목록 조회 API 오류:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: {
        success: false,
        message: '게시글 목록 조회 실패',
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

