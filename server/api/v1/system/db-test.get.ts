import { defineEventHandler, createError } from 'h3'
import { testConnection } from '~/server/utils/dbConfig'

export default defineEventHandler(async (event) => {
  try {
    console.log('데이터베이스 연결 테스트 시작...')
    
    const isConnected = await testConnection()
    
    if (isConnected) {
      return {
        success: true,
        message: 'Database connection successful',
        timestamp: new Date().toISOString(),
        status: 'connected'
      }
    } else {
      throw createError({
        statusCode: 500,
        statusMessage: 'Database Connection Failed',
        data: {
          success: false,
          message: 'Failed to connect to database',
          timestamp: new Date().toISOString(),
          status: 'disconnected'
        }
      })
    }
  } catch (error) {
    console.error('데이터베이스 연결 테스트 오류:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: {
        success: false,
        message: 'Database connection test failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        status: 'error'
      }
    })
  }
})

