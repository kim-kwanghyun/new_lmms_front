#!/usr/bin/env node
/**
 * Neo4j 데이터를 기반으로 LLM이 답변하는 질의응답 시스템
 * Neo4j LLM-based Q&A System v1.0
 */

import neo4j, { Driver, Session, Record } from 'neo4j-driver'
import Neo4jToChatGPTConverter from './neo4j_chatgpt_converter'

// 타입 정의
interface QueryPattern {
  patterns: string[]
  query: string
}

interface QueryPatterns {
  [key: string]: QueryPattern
}

interface QueryInfo {
  pattern: string
  query: string
  keywords: string[]
  mainKeyword: string
}

interface SearchResult {
  [key: string]: any
}

interface MetadataItem {
  pattern_name: string
  [key: string]: any
}

interface ProcessQuestionResult {
  question: string
  searchResults: SearchResult[]
  response: string
  queryInfo: QueryInfo
}

interface QAResult {
  chatgpt_ret?: string
  neo4j_ret?: string
  result?: string
  success: 'success' | 'error'
}

// Global 타입 확장
declare global {
  var metaPatterns: { [key: number]: MetadataItem[] }
}

class Neo4jLLMQASystem {
  private driver: Driver
  private queryPatterns: QueryPatterns

  constructor(neo4jUri: string, neo4jUser: string, neo4jPassword: string) {
    this.driver = neo4j.driver(neo4jUri, neo4j.auth.basic(neo4jUser, neo4jPassword))
    console.log('🚀 Neo4j LLM Q&A 시스템 초기화 완료')
    
    this.queryPatterns = {
      '개체찾기': {
        patterns: global.metaPatterns?.[1]?.map(item => item.pattern_name) || [],
        query: `
          MATCH (n) 
          WHERE (n.이름 CONTAINS $keyword OR n.설명 CONTAINS $keyword OR n.name CONTAINS $keyword OR n.description CONTAINS $keyword)
          RETURN n.이름 as name, n.name as name2, labels(n)[0] as type, n.설명 as description, n.description as description2
          LIMIT 10
        `
      },
      '관계찾기': {
        patterns: global.metaPatterns?.[2]?.map(item => item.pattern_name) || [],
        query: `
          MATCH (a)-[r]->(b)
          WHERE (a.이름 CONTAINS $keyword OR a.name CONTAINS $keyword OR 
                 b.이름 CONTAINS $keyword OR b.name CONTAINS $keyword OR 
                 type(r) CONTAINS $keyword)
          RETURN a.이름 as from_entity, a.name as from_entity2, 
                 type(r) as relation_type, 
                 b.이름 as to_entity, b.name as to_entity2,
                 r.설명 as relation_desc, r.description as relation_desc2
          LIMIT 10
        `
      },
      '타입별검색': {
        patterns: global.metaPatterns?.[3]?.map(item => item.pattern_name) || [],
        query: `
          MATCH (n:$label)
          RETURN n.이름 as name, n.name as name2, labels(n)[0] as type, n.설명 as description, n.description as description2
          LIMIT 15
        `
      },
      '통계정보': {
        patterns: global.metaPatterns?.[4]?.map(item => item.pattern_name) || [],
        query: `
          MATCH (n)
          WITH labels(n)[0] as type, count(n) as count
          RETURN type, count
          ORDER BY count DESC
        `
      },            
      '상세검색': {
        patterns: global.metaPatterns?.[6]?.map(item => item.pattern_name) || [],
        query: `
          MATCH (parent)-[r]->(child)
          WHERE (parent.이름 CONTAINS $keyword OR child.이름 CONTAINS $keyword OR 
                 parent.설명 CONTAINS $keyword OR child.설명 CONTAINS $keyword)
          RETURN parent.이름 as parent_name, type(r) as relation, 
                 child.이름 as child_name, child.설명 as child_description
          LIMIT 20
        `
      },
      '키워드검색': {
        patterns: global.metaPatterns?.[7]?.map(item => item.pattern_name) || [],
        query: `
          MATCH (n)
          WHERE (n.이름 CONTAINS $keyword OR n.설명 CONTAINS $keyword)
          RETURN n.이름 as name, labels(n)[0] as type, n.설명 as description
          LIMIT 10
        `
      }
    }
  }

  async close(): Promise<void> {
    await this.driver.close()
  }

  async analyzeQuestion(question: string): Promise<QueryInfo> {
    console.log("analyzeQuestion start")
    const lowerQuestion = question.toLowerCase()
    const keywords = await this.extractKeywords(question)

    console.log("lowerQuestion:", lowerQuestion)
    console.log("keywords:", JSON.stringify(keywords))
    console.log("=============================================")
    
    // keywords에 각 패턴의 pattern_name이 포함되어 있는지 체크
    for (const [patternName, patternInfo] of Object.entries(this.queryPatterns)) {
      console.log(`🔍 패턴 체크: ${patternName}`)
      console.log(`   패턴 리스트:`, patternInfo.patterns)
      
      // 1. 질문 텍스트에 패턴이 포함되어 있는지 체크
      const hasPatternInQuestion = patternInfo.patterns.some(pattern => 
        lowerQuestion.includes(pattern.toLowerCase())
      )
      
      // 2. 추출된 키워드에 패턴이 포함되어 있는지 체크
      const hasPatternInKeywords = keywords.some(keyword => 
        patternInfo.patterns.some(pattern => 
          keyword.includes(pattern) || pattern.includes(keyword)
        )
      )
      
      console.log(`   질문에 패턴 포함: ${hasPatternInQuestion}`)
      console.log(`   키워드에 패턴 포함: ${hasPatternInKeywords}`)
      
      if (hasPatternInQuestion || hasPatternInKeywords) {
        console.log(`✅ 매칭된 패턴: ${patternName}`)
        return {
          pattern: patternName,
          query: patternInfo.query,
          keywords: keywords,
          mainKeyword: keywords[0] || ''
        }
      }
    }
    
    console.log("❌ 매칭된 패턴 없음 - 기본 '개체찾기' 패턴 사용")
    return {
      pattern: '개체찾기',
      query: this.queryPatterns['개체찾기'].query,
      keywords: keywords,
      mainKeyword: keywords[0] || ''
    }
  }

  async extractKeywords(question: string): Promise<string[]> {
    const stopWords = ['은', '는', '이', '가', '을', '를', '에', '에서', '로', '으로', 
                      '와', '과', '의', '도', '만', '부터', '까지', '에게', '한테',
                      '무엇', '누구', '어떤', '어디', '언제', '왜', '어떻게',
                      '알려줘', '찾아줘', '검색해줘', '보여줘', '중에서', '대해서']
    
    // 한글 단어 추출 (2글자 이상)
    const koreanWords = question.match(/[가-힣]{2,}/g) || []

    console.log("koreanWords:" + JSON.stringify(koreanWords))
    console.log("=============================================")
    
    // 데이터베이스에서 특별한 키워드들 가져오기
    // llmdatabase 모듈이 없으므로 빈 배열로 처리
    let specialKeywords: MetadataItem[] = []
    try {
      // TODO: llmdatabase 모듈이 구현되면 활성화
      // const metadata_database = await import('./llmdatabase')
      // specialKeywords = await metadata_database.select_metadata_group()
      specialKeywords = []
    } catch (error) {
      console.log("메타데이터 데이터베이스 로드 실패:", error)
      specialKeywords = []
    }
    
    console.log("specialKeywords:" + JSON.stringify(specialKeywords))
    console.log("=============================================")
    
    // specialKeywords에서 pattern_name 추출
    const patternNames = specialKeywords.map(item => item.pattern_name).filter(name => name)
    console.log("patternNames:" + JSON.stringify(patternNames))
    
    // stopWords 제거 및 길이 필터링
    const filteredWords = koreanWords
      .filter(word => !stopWords.includes(word))
      .filter(word => word.length >= 2)
    
    // patternNames에 포함된 특별 키워드 추출
    const foundSpecialKeywords = filteredWords.filter(word => 
      patternNames.some(special => word.includes(special) || special.includes(word))
    )
    
    console.log("foundSpecialKeywords:" + JSON.stringify(foundSpecialKeywords))
    
    // foundSpecialKeywords에서 최대 5개 반환
    return foundSpecialKeywords.slice(0, 5)
  }

  async searchNeo4j(queryInfo: QueryInfo): Promise<SearchResult[]> {
    const session: Session = this.driver.session()
    
    try {
      let results: SearchResult[] = []
      
      if (queryInfo.pattern === '통계정보') {
        const result = await session.run(queryInfo.query)
        results = result.records.map((record: Record) => record.toObject())
      } else if (queryInfo.pattern === '타입별검색' && queryInfo.keywords.length > 0) {
        // 타입별 검색은 라벨로 직접 검색
        for (const keyword of queryInfo.keywords) {
          const labelQuery = `MATCH (n:${keyword}) RETURN n.이름 as name, n.name as name2, labels(n)[0] as type, n.설명 as description, n.description as description2 LIMIT 15`
          try {
            const result = await session.run(labelQuery)
            const keywordResults = result.records.map((record: Record) => record.toObject())
            results.push(...keywordResults)
          } catch (error) {
            // 라벨이 존재하지 않는 경우 무시
            console.log(`라벨 '${keyword}'를 찾을 수 없습니다.`)
          }
        }
        results = this.removeDuplicates(results)
      } else if (queryInfo.pattern === '상세검색' && queryInfo.keywords.length > 0) {
        // 상세검색 - 부모-자식 관계 검색
        for (const keyword of queryInfo.keywords) {
          const result = await session.run(queryInfo.query, { keyword })
          const keywordResults = result.records.map((record: Record) => record.toObject())
          results.push(...keywordResults)
        }
        results = this.removeDuplicates(results)
      } else if (queryInfo.pattern === '키워드검색' && queryInfo.keywords.length > 0) {
        // 키워드 검색 - 특정 키워드에 대한 직접 검색
        for (const keyword of queryInfo.keywords) {
          const result = await session.run(queryInfo.query, { keyword })
          const keywordResults = result.records.map((record: Record) => record.toObject())
          results.push(...keywordResults)
        }
        results = this.removeDuplicates(results)
      } else if (queryInfo.keywords.length > 0) {
        for (const keyword of queryInfo.keywords) {
          const result = await session.run(queryInfo.query, { keyword })
          const keywordResults = result.records.map((record: Record) => record.toObject())
          results.push(...keywordResults)
        }
        results = this.removeDuplicates(results)
      }
      
      return results
      
    } catch (error: any) {
      console.error('Neo4j 검색 오류:', error.message)
      return []
    } finally {
      await session.close()
    }
  }

  private removeDuplicates(results: SearchResult[]): SearchResult[] {
    const seen = new Set<string>()
    return results.filter(item => {
      const key = JSON.stringify(item)
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })
  }

  private generateResponse(question: string, searchResults: SearchResult[], queryInfo: QueryInfo): string {
    if (searchResults.length === 0) {
      return `"${question}"에 대한 정보를 데이터베이스에서 찾을 수 없습니다. 
      
다른 키워드로 검색해보시거나, 더 구체적인 질문을 해주시면 도움을 드릴 수 있습니다.

💡 검색 팁:
- 구체적인 이름이나 용어 사용
- "관계", "연결", "관련" 등의 키워드 사용
- "통계" 또는 "개수"로 전체 현황 확인`
    }

    let response = ``
    if (queryInfo.pattern === '통계정보') {
      response += "📊 **데이터베이스 현황:**\n"
      searchResults.forEach(item => {
        response += `- ${item.type}: ${item.count}개\n`
      })

    } else if (queryInfo.pattern === '관계찾기') {
      response += "관련 관계 정보:\n"
      searchResults.forEach(item => {
        const fromEntity = item.from_entity || item.from_entity2 || '알 수 없음'
        const toEntity = item.to_entity || item.to_entity2 || '알 수 없음'
        const relationType = item.relation_type || '관계'
        response += `- ${fromEntity} → ${relationType} → ${toEntity}\n`
        const relationDesc = item.relation_desc || item.relation_desc2
        if (relationDesc) {
          response += `  설명: ${relationDesc}\n`
        }
      })

    } else if (queryInfo.pattern === '상세검색') {
      response += "상세 검색 결과:\n"
      searchResults.forEach(item => {
        response += `- ${item.parent_name} → ${item.relation} → ${item.child_name}\n`
        if (item.child_description) {
          response += `  설명: ${item.child_description}\n`
        }
      })

    } else if (queryInfo.pattern === '키워드검색') {
      response += "키워드 검색 결과:\n"
      searchResults.forEach(item => {
        response += `- ${item.name} (${item.type || '타입미상'})\n`
        if (item.description) {
          response += `  설명: ${item.description}\n`
        }
      })

    } else {
      response += "관련 개체 정보:\n"
      searchResults.forEach(item => {
        const name = item.name || item.name2 || '이름 없음'
        const type = item.type || '타입미상'
        response += `- ${name} (${type})\n`
        const description = item.description || item.description2
        if (description) {
          response += `  설명: ${description}\n`
        }
      })
    }

    return response
  }

  async processQuestion(question: string): Promise<ProcessQuestionResult> {
    console.log(`\n🤔 질문 분석 중: "${question}"`)
    
    const queryInfo = await this.analyzeQuestion(question)
    console.log(`📋 검색 패턴: ${queryInfo.pattern}`)
    console.log(`🔍 키워드: ${queryInfo.keywords.join(', ')}`)
    
    console.log('🔎 데이터베이스 검색 중...')
    const searchResults = await this.searchNeo4j(queryInfo)
    console.log(`📊 검색 결과: ${searchResults.length}개`)
    
    console.log('🤖 답변 생성 중...')
    const response = this.generateResponse(question, searchResults, queryInfo)
    
    return {
      question,
      searchResults,
      response,
      queryInfo
    }
  }
}

async function neo4j_llm_qa(question: string): Promise<QAResult> {
  console.log("neo4j_llm_qa start")

  const retObject: QAResult = { success: 'error' }

  const NEO4J_URI = process.env.NEO4J_URI || "neo4j+s://c6492ebe.databases.neo4j.io"
  const NEO4J_USER = process.env.NEO4J_USER || "neo4j"
  const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || "lT0HDm-frp0d828fWZebzNGRV3Q5myba0RmBusq5YFA"
  
  const qaSystem = new Neo4jLLMQASystem(NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD)
  const chatGPTConverter = new Neo4jToChatGPTConverter()
  
  try {
    if (question && question.trim().length > 0) {
      const result = await qaSystem.processQuestion(question)
      console.log('\n 답변:')
      console.log("--------------------------------")
      console.log("result:" + JSON.stringify(result))
      console.log("--------------------------------")

      const chatgpt_ret = await chatGPTConverter.getChatGPTResponse(result.response)

      console.log(chatgpt_ret)
      retObject.chatgpt_ret = chatgpt_ret
      retObject.neo4j_ret = result.response
      retObject.success = "success"
    } else {
      retObject.result = "질문이 없습니다."
      retObject.success = "error"
    }
    
  } catch (error: any) {
    console.error(`❌ 시스템 오류: ${error.message}`)
    retObject.result = `오류 발생: ${error.message}`
    retObject.success = "error"
  } finally {
    await qaSystem.close()
    await chatGPTConverter.close()
  }
 
  return retObject
}

export {
  Neo4jLLMQASystem,
  neo4j_llm_qa
}
