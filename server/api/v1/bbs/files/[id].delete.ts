import mysql from 'mysql2/promise'
import { defineEventHandler, getRouterParam, createError } from 'h3'
import { dbConfig } from '~/server/utils/dbConfig'
import { unlink } from 'fs/promises'
import { existsSync } from 'fs'

export default defineEventHandler(async (event) => {
  let connection: mysql.Connection | null = null
  try {
    const fileId = getRouterParam(event, 'id')
    console.log('파일 삭제 API 호출됨:', fileId)

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
      'SELECT file_id, file_path FROM tbl_bbs_file WHERE file_id = ? AND del_dt IS NULL',
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

    // 파일 삭제 (소프트 삭제)
    await connection.execute(
      'UPDATE tbl_bbs_file SET del_dt = NOW(), del_id = ? WHERE file_id = ?',
      ['system', fileId]
    )

    // 물리적 파일 삭제 (선택사항)
    if (file.file_path && existsSync(file.file_path)) {
      try {
        await unlink(file.file_path)
      } catch (error) {
        console.warn('파일 삭제 실패 (무시):', error)
      }
    }

    return {
      success: true,
      message: '파일이 삭제되었습니다',
      data: {
        file_id: fileId
      },
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    console.error('파일 삭제 API 오류:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error',
      data: {
        success: false,
        message: '파일 삭제 실패',
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

