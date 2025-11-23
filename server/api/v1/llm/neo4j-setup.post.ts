import { defineEventHandler, createError } from 'h3'
import { createSampleData, testNeo4jConnection } from '~/server/utils/neo4jClient'

export default defineEventHandler(async (event) => {
  try {
    console.log('=== Neo4j 샘플 데이터 생성 시작 ===')
    
    // 먼저 연결 테스트
    const isConnected = await testNeo4jConnection()
    if (!isConnected) {
      throw new Error('Neo4j 연결에 실패했습니다. 연결을 먼저 확인해주세요.')
    }
    
    // 샘플 데이터 생성
    const success = await createSampleData()
    
    if (success) {
      console.log('Neo4j 샘플 데이터 생성 완료')
      return {
        retcode: 'success',
        retmsg: 'Neo4j 샘플 데이터가 성공적으로 생성되었습니다.',
        data: {
          created: true,
          timestamp: new Date().toISOString(),
          sampleData: [
            '농장 정보 (행복농장, 푸른목장)',
            '사료 정보 (성장기 사료, 비육용 사료)',
            '질병 정보 (구제역, 돼지열병)',
            '관리 정보 (급이 관리, 환경 관리)',
            '관계 정보 (농장-사료, 관리-질병 등)'
          ]
        }
      }
    } else {
      throw new Error('샘플 데이터 생성에 실패했습니다.')
    }
    
  } catch (error) {
    console.error('Neo4j 샘플 데이터 생성 실패:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Neo4j 샘플 데이터 생성 실패',
      data: {
        created: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        suggestions: [
          'Neo4j 연결을 먼저 테스트해보세요',
          'Neo4j 데이터베이스에 쓰기 권한이 있는지 확인하세요',
          'Neo4j 서버의 메모리 및 디스크 공간을 확인하세요'
        ]
      }
    })
  }
})
