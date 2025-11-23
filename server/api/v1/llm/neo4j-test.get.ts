import { defineEventHandler, createError } from 'h3'
import { testNeo4jConnection } from '~/server/utils/neo4jClient'

export default defineEventHandler(async (event) => {
  try {
    console.log('=== Neo4j 연결 테스트 시작 ===')
    
    const isConnected = await testNeo4jConnection()
    
    if (isConnected) {
      console.log('Neo4j 연결 성공')
      return {
        retcode: 'success',
        retmsg: 'Neo4j 연결이 성공적으로 완료되었습니다.',
        data: {
          connected: true,
          timestamp: new Date().toISOString()
        }
      }
    } else {
      throw new Error('Neo4j 연결 실패')
    }
    
  } catch (error) {
    console.error('Neo4j 연결 테스트 실패:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Neo4j 연결 테스트 실패',
      data: {
        connected: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        suggestions: [
          'Neo4j 서버가 실행 중인지 확인하세요',
          '환경 변수 NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD를 확인하세요',
          'Neo4j 서버 포트(기본값: 7687)가 열려있는지 확인하세요'
        ]
      }
    })
  }
})
