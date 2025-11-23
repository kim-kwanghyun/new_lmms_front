import { defineEventHandler, createError } from 'h3'
import { resetNeo4jDriver, testNeo4jConnection } from '~/server/utils/neo4jClient'

export default defineEventHandler(async (event) => {
  try {
    console.log('=== Neo4j 드라이버 재설정 시작 ===')
    
    // 기존 드라이버 종료 및 재설정
    await resetNeo4jDriver()
    
    // 재설정 후 연결 테스트
    const isConnected = await testNeo4jConnection()
    
    if (isConnected) {
      console.log('Neo4j 드라이버 재설정 및 연결 성공')
      return {
        retcode: 'success',
        retmsg: 'Neo4j 드라이버가 성공적으로 재설정되었습니다.',
        data: {
          reset: true,
          connected: true,
          timestamp: new Date().toISOString()
        }
      }
    } else {
      throw new Error('Neo4j 재연결 실패')
    }
    
  } catch (error) {
    console.error('Neo4j 드라이버 재설정 실패:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Neo4j 드라이버 재설정 실패',
      data: {
        reset: false,
        connected: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        suggestions: [
          'Neo4j 서버 상태를 확인하세요',
          '네트워크 연결을 확인하세요',
          '인증 정보를 확인하세요'
        ]
      }
    })
  }
})


