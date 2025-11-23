import mysql from 'mysql2/promise'
import { defineEventHandler, readMultipartFormData, createError, getHeader } from 'h3'
import { dbConfig } from '~/server/utils/dbConfig'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export default defineEventHandler(async (event) => {
  let connection: mysql.Connection | null = null
  try {
    // 요청 헤더 확인
    const contentType = getHeader(event, 'content-type')
    console.log('게시글 생성 API 호출됨')
    console.log('Content-Type:', contentType)
    
    const formData = await readMultipartFormData(event)
    console.log('FormData 파싱 결과:', formData ? `파싱 성공 (${formData.length}개 필드)` : 'null')

    if (!formData || formData.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: {
          success: false,
          message: 'Form data is required',
          timestamp: new Date().toISOString()
        }
      })
    }

    // FormData에서 데이터 추출
    const postData: any = {}
    const files: any[] = []

    for (const field of formData) {
      if (field.name === 'files' && field.filename) {
        files.push(field)
      } else {
        postData[field.name] = field.data.toString('utf-8')
      }
    }

    if (!postData.title) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: {
          success: false,
          message: 'title is required',
          timestamp: new Date().toISOString()
        }
      })
    }

    connection = await mysql.createConnection(dbConfig)

    // 트랜잭션 시작
    await connection.beginTransaction()

    try {
      // 게시글 생성
      const insertQuery = `
        INSERT INTO tbl_bbs_post (
          title,
          content,
          category,
          is_notice,
          is_pinned,
          crdt_id
        ) VALUES (?, ?, ?, ?, ?, ?)
      `
      
      const [result] = await connection.execute(insertQuery, [
        postData.title,
        postData.content || null,
        postData.category || null,
        postData.is_notice === 'true' ? 1 : 0,
        postData.is_pinned === 'true' ? 1 : 0,
        postData.crdt_id || 'system'
      ])

      const postId = (result as any).insertId

      // 파일 저장
      const uploadedFiles = []
      if (files.length > 0) {
        const uploadDir = join(process.cwd(), 'uploads', 'bbs')
        
        // 업로드 디렉토리 생성
        if (!existsSync(uploadDir)) {
          await mkdir(uploadDir, { recursive: true })
        }

        for (const file of files) {
          const timestamp = Date.now()
          const randomStr = Math.random().toString(36).substring(2, 15)
          const fileExtension = file.filename?.split('.').pop() || ''
          const storedFilename = `${timestamp}_${randomStr}.${fileExtension}`
          const filePath = join(uploadDir, storedFilename)

          // 파일 저장
          await writeFile(filePath, file.data)

          // 파일 정보 DB 저장
          const fileInsertQuery = `
            INSERT INTO tbl_bbs_file (
              post_id,
              original_filename,
              stored_filename,
              file_path,
              file_size,
              file_type,
              file_extension,
              crdt_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `

          const [fileResult] = await connection.execute(fileInsertQuery, [
            postId,
            file.filename,
            storedFilename,
            filePath,
            file.data.length,
            file.type || null,
            fileExtension,
            postData.crdt_id || 'system'
          ])

          uploadedFiles.push({
            file_id: (fileResult as any).insertId,
            original_filename: file.filename,
            stored_filename: storedFilename
          })
        }
      }

      // 트랜잭션 커밋
      await connection.commit()

      // 생성된 게시글 조회
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
          DATE_FORMAT(p.crdt_dt, '%Y-%m-%d %H:%i:%s') as crdt_dt
        FROM tbl_bbs_post p
        WHERE p.post_id = ?
      `
      const [rows] = await connection.execute(selectQuery, [postId])

      return {
        success: true,
        message: '게시글이 생성되었습니다',
        data: {
          post: (rows as any[])[0],
          files: uploadedFiles
        },
        timestamp: new Date().toISOString()
      }

    } catch (error) {
      // 트랜잭션 롤백
      await connection.rollback()
      throw error
    }

  } catch (error) {
    console.error('게시글 생성 API 오류:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error',
      data: {
        success: false,
        message: '게시글 생성 실패',
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

