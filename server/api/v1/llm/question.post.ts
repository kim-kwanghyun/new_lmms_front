import { defineEventHandler, readBody, createError, getSession } from 'h3'
import { neo4j_llm_qa } from './neo4j_llm_qa'

// 타입 정의
interface QuestionRequest {
  question: string
}

interface AIXMetadata {
  pig_env: string
  feed_mgt: string
  pig_beh: string
  disease: string
  outweather: string
  manure: string
  work: string
  index: string
  finance: string
  market: string
}

interface AIXFormat {
  livestockNo: string
  datetime: string
  question: string
  neo4j_ret: string
  metadata: AIXMetadata
}

interface QuestionResponse {
  result: string
  neo4j_ret: string
  aix_ret: AIXFormat
  success: string
}

// AIX 포맷 생성 함수
async function makeAIXFormat(neo4j_ret: string, question: string): Promise<AIXFormat> {
  const ret: AIXFormat = {
    livestockNo: "0001",
    datetime: new Date().toISOString().replace(/[-:T]/g, '').slice(0, 12),
    question: question,
    neo4j_ret: neo4j_ret,
    metadata: {
      pig_env: "",
      feed_mgt: "",
      pig_beh: "",
      disease: "",
      outweather: "",
      manure: "",
      work: "",
      index: "",
      finance: "",
      market: ""
    }
  }

  return ret
}

export default defineEventHandler(async (event) => {
  let body: QuestionRequest | null = null
  
  try {
    console.log("post_question start")

    // 요청 본문 읽기
    body = await readBody<QuestionRequest>(event)
    const { question } = body

    // 질문 유효성 검사
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: {
          success: 'error',
          message: '질문이 필요합니다.'
        }
      })
    }

    // 외부 LLM 서버에 요청할 데이터 준비
    const requestData = {
      question: question
    }

    console.log('외부 LLM 서버에 요청 중...', requestData)

    // 외부 LLM 서버에 HTTP 요청
    const response = await $fetch<any>('http://hping.co.kr:8105/llm/post_question', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: requestData,
      timeout: 30000 // 30초 타임아웃
    })

    
    console.log('외부 LLM 서버 응답:', response)

    // Neo4j LLM QA 시스템도 호출 (기존 로직 유지)
    console.log('Neo4j LLM QA 시스템 호출 중...')
    const neo4jResult = await neo4j_llm_qa(question)
    
    if (neo4jResult.success !== 'success') {
      console.warn('Neo4j LLM QA 처리 실패:', neo4jResult.result)
    }

    // AIX 포맷 생성
    const aixFormat = await makeAIXFormat(neo4jResult.neo4j_ret || '', question)
    
    // 응답 객체 구성
    const retObject: QuestionResponse = {
      result: response?.result || response?.answer || neo4jResult.chatgpt_ret || '',
      neo4j_ret: neo4jResult.neo4j_ret || '',
      aix_ret: aixFormat,
      success: "success"
    }

    console.log("--------------------------------")
    console.log("retObject aix_ret:", JSON.stringify(retObject.aix_ret))
    console.log("--------------------------------")

    return retObject

  } catch (error: any) {
    console.error('Question API Error:', error)
    
    // 이미 createError로 던진 에러는 그대로 전파
    if (error.statusCode) {
      throw error
    }
    
    // 외부 서버 요청 실패 시 Neo4j 결과라도 반환하려고 시도
    if (error.name === 'FetchError' || error.code === 'FETCH_ERROR') {
      console.warn('외부 LLM 서버 요청 실패, Neo4j 결과만 사용:', error.message)
      
      try {
        // Neo4j만이라도 시도
        const neo4jResult = await neo4j_llm_qa(body?.question || '')
        const aixFormat = await makeAIXFormat(neo4jResult.neo4j_ret || '', body?.question || '')
        
        return {
          result: neo4jResult.chatgpt_ret || '외부 서버 연결 실패로 Neo4j 결과만 제공됩니다.',
          neo4j_ret: neo4jResult.neo4j_ret || '',
          aix_ret: aixFormat,
          success: "partial_success",
          warning: '외부 LLM 서버에 연결할 수 없습니다.'
        }
      } catch (fallbackError) {
        console.error('Neo4j 대체 처리도 실패:', fallbackError)
      }
    }
    
    // 일반적인 에러 처리
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: {
        success: 'error',
        message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
        timestamp: new Date().toISOString()
      }
    })
  }
})