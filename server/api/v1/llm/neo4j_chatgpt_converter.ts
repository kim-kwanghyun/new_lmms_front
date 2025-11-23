#!/usr/bin/env node
/**
 * Neo4j 응답을 ChatGPT API를 이용하여 자연스러운 문장으로 변환하는 시스템 (TypeScript)
 */

import OpenAI from 'openai'

interface ChatGPTConfig {
  model?: string
  maxTokens?: number
}

class Neo4jToChatGPTConverter {
  private openaiApiKey: string | null
  private openai: OpenAI | null

  constructor() {
    // OpenAI 설정
    this.openaiApiKey = process.env.OPENAI_API_KEY || null
    
    if (this.openaiApiKey) {
      try {
        this.openai = new OpenAI({ apiKey: this.openaiApiKey })
        console.log('🚀 Neo4j to ChatGPT 변환기 초기화 완료')
      } catch (error) {
        console.error('OpenAI 클라이언트 초기화 실패:', error)
        this.openai = null
      }
    } else {
      console.warn('OpenAI API Key가 설정되지 않았습니다.')
      this.openai = null
    }
  }

  async close(): Promise<void> {
    // OpenAI는 별도 close가 필요 없음
  }

  /**
   * ChatGPT API 호출
   */
  async getChatGPTResponse(
    prompt: string, 
    model: string = 'gpt-4o-mini', 
    maxTokens: number = 500
  ): Promise<string> {
    // OpenAI 클라이언트가 없는 경우 기본 응답 반환
    if (!this.openai) {
      console.warn('OpenAI 클라이언트를 사용할 수 없습니다. 기본 응답을 반환합니다.')
      return this.generateFallbackResponse(prompt)
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: 'system',
            content: '당신은 전문적이고 친절한 AI 어시스턴트입니다. 정확하고 이해하기 쉬운 답변을 제공합니다.'
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: maxTokens,
        temperature: 0.7,
        top_p: 0.9
      })

      return response.choices[0]?.message?.content?.trim() || this.generateFallbackResponse(prompt)
    } catch (error: any) {
      console.error('❌ ChatGPT API 호출 오류:', error.message)
      return this.generateFallbackResponse(prompt, error.message)
    }
  }

  /**
   * OpenAI API 실패 시 기본 응답 생성
   */
  private generateFallbackResponse(prompt: string, errorMessage?: string): string {
    const baseResponse = `요청하신 "${prompt}"에 대한 정보를 처리했습니다.`
    
    if (errorMessage) {
      return `${baseResponse}\n\n참고: AI 응답 생성 중 일시적인 문제가 발생했습니다. (${errorMessage})`
    }
    
    return `${baseResponse}\n\n참고: AI 응답 서비스를 사용할 수 없어 기본 응답을 제공합니다.`
  }
}

export default Neo4jToChatGPTConverter
