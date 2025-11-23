import mysql from 'mysql2/promise'
import { defineEventHandler, getRouterParam, createError, setResponseHeader } from 'h3'
import { dbConfig } from '~/server/utils/dbConfig'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'

export default defineEventHandler(async (event) => {
  let connection: mysql.Connection | null = null
  try {
    const fileId = getRouterParam(event, 'id')
    console.log('파일 다운로드 API 호출됨:', fileId)

    if (!fileId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: {
          success: false,
          message: 'file_id is required',
          timestamp: new Date().toISOString()
        }
      })
    }

    connection = await mysql.createConnection(dbConfig)

    // 파일 정보 조회
    const [fileRows] = await connection.execute(
      'SELECT file_id, original_filename, file_path, file_type FROM tbl_bbs_file WHERE file_id = ? AND del_dt IS NULL',
      [fileId]
    )

    if ((fileRows as any[]).length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
        data: {
          success: false,
          message: '파일을 찾을 수 없습니다',
          timestamp: new Date().toISOString()
        }
      })
    }

    const file = (fileRows as any[])[0]

    // 파일 존재 확인
    if (!existsSync(file.file_path)) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
        data: {
          success: false,
          message: '파일이 서버에 존재하지 않습니다',
          timestamp: new Date().toISOString()
        }
      })
    }

    // 파일 읽기
    const fileBuffer = await readFile(file.file_path)

    // 다운로드 횟수 증가
    await connection.execute(
      'UPDATE tbl_bbs_file SET download_count = download_count + 1 WHERE file_id = ?',
      [fileId]
    )

    // 파일 응답 설정
    setResponseHeader(event, 'Content-Type', file.file_type || 'application/octet-stream')
    setResponseHeader(event, 'Content-Disposition', `attachment; filename="${encodeURIComponent(file.original_filename)}"`)
    setResponseHeader(event, 'Content-Length', fileBuffer.length.toString())

    return fileBuffer

  } catch (error) {
    console.error('파일 다운로드 API 오류:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error',
      data: {
        success: false,
        message: '파일 다운로드 실패',
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

