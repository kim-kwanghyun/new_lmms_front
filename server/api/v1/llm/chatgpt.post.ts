import { defineEventHandler, readBody, createError } from 'h3'
import OpenAI from 'openai'
import { useRuntimeConfig } from '#imports'

// 타입 정의
interface ChatGPTRequest {
  question: string
  model?: string
  maxTokens?: number
  temperature?: number
}

interface ChatGPTResponse {
  result: string
  success: string
  model?: string
}

export default defineEventHandler(async (event) => {
  try {
    // 요청 본문 읽기
    const body = await readBody<ChatGPTRequest>(event)
    const { question, model = 'gpt-4o-mini', maxTokens = 1000, temperature = 0.7 } = body

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

    // 환경 변수에서 OpenAI API Key 가져오기
    // 1. runtimeConfig에서 가져오기 (nuxt.config.ts에서 설정)
    // 2. process.env에서 직접 가져오기 (fallback)
    const config = useRuntimeConfig(event)
    const openaiApiKey: string | undefined = (config.openaiApiKey as string) || 
                        process.env.OPENAI_API_KEY || 
                        process.env.NUXT_OPENAI_API_KEY ||
                        process.env.VITE_OPENAI_API_KEY

    // 디버깅용 로그 (키의 일부만 표시)
    const keyPreview = openaiApiKey && typeof openaiApiKey === 'string'
      ? `${openaiApiKey.substring(0, 7)}...${openaiApiKey.substring(openaiApiKey.length - 4)}` 
      : '없음'
    console.log('OpenAI API Key 확인:', {
      exists: !!openaiApiKey,
      preview: keyPreview,
      length: (openaiApiKey && typeof openaiApiKey === 'string') ? openaiApiKey.length : 0,
      source: config.openaiApiKey ? 'runtimeConfig' : 'process.env',
      runtimeConfigValue: config.openaiApiKey ? '있음' : '없음',
      processEnvValue: process.env.OPENAI_API_KEY ? '있음' : '없음'
    })

    if (!openaiApiKey || (typeof openaiApiKey === 'string' && openaiApiKey.trim().length === 0)) {
      // 환경 변수 디버깅 정보
      const envKeys = Object.keys(process.env).filter(key => 
        key.includes('OPENAI') || key.includes('API')
      )
      console.error('환경 변수 확인 실패:', {
        availableKeys: envKeys,
        nodeEnv: process.env.NODE_ENV
      })

      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        data: {
          success: 'error',
          message: `OpenAI API Key가 설정되지 않았습니다.

해결 방법:
1. 프로젝트 루트에 .env 파일 생성 (또는 .env.dev 파일)
2. 파일에 다음 내용 추가:
   OPENAI_API_KEY=sk-your-api-key-here

3. 개발 서버 재시작:
   npm run dev

참고: .env.dev 파일은 자동으로 로드되지 않을 수 있습니다.
.env 파일을 사용하거나, 환경 변수를 직접 설정해주세요.`
        }
      })
    }

    // OpenAI 클라이언트 생성 (타임아웃 설정 포함)
    const openai = new OpenAI({ 
      apiKey: openaiApiKey as string,
      timeout: 60000, // 60초 타임아웃
      maxRetries: 2 // 최대 2회 재시도
    })

    console.log('ChatGPT API 호출 시작:', { 
      question: question.substring(0, 50) + (question.length > 50 ? '...' : ''),
      model, 
      maxTokens 
    })

    // ChatGPT API 호출 (타임아웃 및 에러 처리)
    let response
    try {
      response = await Promise.race([
        openai.chat.completions.create({
          model: model,
          messages: [
            {
              role: 'system',
              content: '당신은 전문적이고 친절한 AI 어시스턴트입니다. 정확하고 이해하기 쉬운 답변을 제공합니다. 한국어로 답변해주세요.'
            },
            { 
              role: 'user', 
              content: question 
            }
          ],
          max_tokens: maxTokens,
          temperature: temperature,
          top_p: 0.9
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('API 요청 타임아웃 (60초 초과)')), 60000)
        )
      ]) as any
    } catch (apiError: any) {
      console.error('OpenAI API 호출 실패:', {
        message: apiError.message,
        code: apiError.code,
        status: apiError.status,
        type: apiError.constructor?.name
      })
      throw apiError
    }

    const answer = response.choices[0]?.message?.content?.trim() || '답변을 생성할 수 없습니다.'

    console.log('ChatGPT API 응답 성공:', { answerLength: answer.length })

    // 응답 객체 구성
    const retObject: ChatGPTResponse = {
      result: answer,
      success: 'success',
      model: model
    }

    return retObject

  } catch (error: any) {
    console.error('ChatGPT API Error 상세:', {
      message: error.message,
      statusCode: error.statusCode,
      status: error.status,
      code: error.code,
      type: error.constructor?.name,
      name: error.name,
      cause: error.cause
    })

    // 타임아웃 오류 처리
    if (error.message?.includes('타임아웃') || error.code === 'ETIMEDOUT' || error.name === 'TimeoutError') {
      throw createError({
        statusCode: 504,
        statusMessage: 'Gateway Timeout',
        data: {
          success: 'error',
          message: 'OpenAI API 응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.'
        }
      })
    }

    // OpenAI API 특정 오류 처리
    if (error.status === 401 || error.statusCode === 401 || error.response?.status === 401) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
        data: {
          success: 'error',
          message: 'OpenAI API Key가 유효하지 않습니다. API 키를 확인해주세요.'
        }
      })
    }

    if (error.status === 429 || error.statusCode === 429 || error.response?.status === 429) {
      throw createError({
        statusCode: 429,
        statusMessage: 'Too Many Requests',
        data: {
          success: 'error',
          message: 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.'
        }
      })
    }

    // 네트워크 오류 처리
    if (error.code === 'ECONNREFUSED' || 
        error.code === 'ETIMEDOUT' || 
        error.code === 'ENOTFOUND' ||
        error.code === 'ECONNRESET' ||
        error.message?.includes('fetch') ||
        error.message?.includes('network') ||
        error.message?.includes('connection')) {
      throw createError({
        statusCode: 503,
        statusMessage: 'Service Unavailable',
        data: {
          success: 'error',
          message: `OpenAI API 서버에 연결할 수 없습니다.

가능한 원인:
1. 인터넷 연결 문제
2. 방화벽 설정
3. OpenAI API 서버 일시적 장애

해결 방법:
- 네트워크 연결을 확인해주세요
- 잠시 후 다시 시도해주세요
- OpenAI 서비스 상태를 확인해주세요`
        }
      })
    }

    // OpenAI SDK 에러 처리
    if (error instanceof Error && error.message) {
      // OpenAI API 에러 메시지 추출
      const openaiError = error as any
      if (openaiError.response?.data?.error?.message) {
        throw createError({
          statusCode: openaiError.status || 500,
          statusMessage: 'OpenAI API Error',
          data: {
            success: 'error',
            message: `OpenAI API 오류: ${openaiError.response.data.error.message}`
          }
        })
      }
    }

    // 일반적인 에러 처리
    const errorMessage = error.message || error.statusMessage || '알 수 없는 오류가 발생했습니다.'
    
    throw createError({
      statusCode: error.statusCode || error.status || error.response?.status || 500,
      statusMessage: error.statusMessage || 'Internal Server Error',
      data: {
        success: 'error',
        message: errorMessage,
        timestamp: new Date().toISOString(),
        ...(process.env.NODE_ENV === 'development' && {
          debug: {
            errorType: error.constructor?.name,
            code: error.code,
            status: error.status,
            statusCode: error.statusCode,
            responseStatus: error.response?.status
          }
        })
      }
    })
  }
})

