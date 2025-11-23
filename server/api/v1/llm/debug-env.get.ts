import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  // 환경 변수 디버깅용 (개발 환경에서만 사용)
  const isDev = process.env.NODE_ENV === 'development'
  
  if (!isDev) {
    return {
      retcode: 'fail',
      retmsg: '프로덕션 환경에서는 사용할 수 없습니다.'
    }
  }

  return {
    retcode: 'success',
    retmsg: '환경 변수 정보',
    data: {
      neo4j: {
        uri: process.env.CONST_NEO4J_URI || process.env.NEO4J_URI || '설정되지 않음',
        user: process.env.CONST_NEO4J_USER || process.env.NEO4J_USERNAME || '설정되지 않음',
        password: (process.env.CONST_NEO4J_PASSWORD || process.env.NEO4J_PASSWORD) ? '***설정됨***' : '***설정되지 않음***'
      },
      openai: {
        apiKey: process.env.OPENAI_API_KEY ? '***설정됨***' : '***설정되지 않음***'
      },
      database: {
        host: process.env.CONST_DB_HOST || '설정되지 않음',
        database: process.env.CONST_DB_DATABASE || '설정되지 않음',
        user: process.env.CONST_DB_USER || '설정되지 않음',
        password: process.env.CONST_DB_PASSWORD ? '***설정됨***' : '***설정되지 않음***'
      },
      nodeEnv: process.env.NODE_ENV || 'development'
    }
  }
})
