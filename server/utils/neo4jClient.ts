import neo4j from 'neo4j-driver'

// Neo4j 드라이버 인스턴스
let driver: any = null

// Neo4j 연결 설정
export const getNeo4jDriver = () => {
  if (!driver) {
    // 환경 변수 또는 기본값 사용
    const uri = process.env.NEO4J_URI || 'neo4j+s://c6492ebe.databases.neo4j.io'
    const username = process.env.NEO4J_USERNAME || 'neo4j'
    const password = process.env.NEO4J_PASSWORD || 'lT0HDm-frp0d828fWZebzNGRV3Q5myba0RmBusq5YFA'

    console.log('Neo4j 연결 정보:')
    console.log('URI:', uri)
    console.log('Username:', username)
    console.log('Password:', password ? '***설정됨***' : '***설정되지 않음***')

    try {
      // Neo4j Aura 클라우드 연결을 위한 개선된 설정
      const driverConfig = {
        disableLosslessIntegers: true,
        maxConnectionLifetime: 5 * 60 * 1000, // 5 minutes (더 짧게)
        maxConnectionPoolSize: 5, // 더 적게
        connectionAcquisitionTimeout: 30 * 1000, // 30 seconds (더 짧게)
        connectionTimeout: 20 * 1000, // 20 seconds
        maxTransactionRetryTime: 15 * 1000, // 15 seconds
        resolver: undefined, // 기본 resolver 사용
        logging: {
          level: 'info',
          logger: (level: string, message: string) => console.log(`[Neo4j ${level}] ${message}`)
        }
      }

      console.log('Neo4j Aura 클라우드 연결 모드 (개선된 설정)')

      driver = neo4j.driver(
        uri,
        neo4j.auth.basic(username, password),
        driverConfig
      )

      // 연결 테스트
      driver.verifyConnectivity()
        .then(() => {
          console.log('Neo4j driver connectivity verified successfully')
        })
        .catch((error: any) => {
          console.error('Neo4j connectivity verification failed:', error)
        })

      console.log('Neo4j driver initialized successfully')
    } catch (error) {
      console.error('Failed to initialize Neo4j driver:', error)
      driver = null
      throw error
    }
  }

  return driver
}

// Neo4j 세션 생성
export const createNeo4jSession = () => {
  const driver = getNeo4jDriver()
  return driver.session()
}

// Neo4j 연결 종료
export const closeNeo4jDriver = async () => {
  if (driver) {
    try {
      await driver.close()
    } catch (error) {
      console.error('Error closing Neo4j driver:', error)
    } finally {
      driver = null
      console.log('Neo4j driver closed')
    }
  }
}

// 드라이버 강제 재설정
export const resetNeo4jDriver = async () => {
  await closeNeo4jDriver()
  console.log('Neo4j driver reset completed')
}

// 연결 테스트
export const testNeo4jConnection = async (): Promise<boolean> => {
  let session = null
  
  try {
    console.log('Neo4j 연결 테스트 시작...')
    
    // 먼저 드라이버 연결 확인
    const driver = getNeo4jDriver()
    await driver.verifyConnectivity()
    console.log('Neo4j 드라이버 연결 확인 완료')
    
    // 세션 생성 및 쿼리 테스트
    session = driver.session()
    console.log('Neo4j 세션 생성 완료')
    
    const result = await session.run('RETURN 1 as test, datetime() as currentTime')
    const record = result.records[0]
    const testValue = record.get('test')
    const currentTime = record.get('currentTime')
    
    console.log('Neo4j connection test successful:')
    console.log('- Test value:', testValue)
    console.log('- Server time:', currentTime.toString())
    
    return testValue === 1
  } catch (error) {
    console.error('Neo4j connection test failed:', error)
    
    // 상세한 오류 정보 출력
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    
    return false
  } finally {
    if (session) {
      try {
        await session.close()
        console.log('Neo4j 세션 정상 종료')
      } catch (closeError) {
        console.error('Neo4j 세션 종료 중 오류:', closeError)
      }
    }
  }
}

// 샘플 데이터 생성 (테스트용)
export const createSampleData = async () => {
  let session = null
  
  try {
    session = createNeo4jSession()
    // 기존 데이터 삭제 (테스트용)
    await session.run('MATCH (n) DETACH DELETE n')
    
    // 축산 관련 샘플 데이터 생성
    const queries = [
      // 농장 정보
      `CREATE (f1:Farm {
        name: "행복농장", 
        location: "경기도 화성시", 
        type: "양돈농장",
        description: "친환경 양돈 농장으로 건강한 돼지를 기릅니다",
        capacity: 1000,
        established: "2010-01-01"
      })`,
      
      `CREATE (f2:Farm {
        name: "푸른목장", 
        location: "충청남도 천안시", 
        type: "한우농장",
        description: "고품질 한우를 생산하는 목장입니다",
        capacity: 500,
        established: "2015-05-15"
      })`,

      // 사료 정보
      `CREATE (feed1:Feed {
        name: "성장기 사료", 
        type: "돼지용",
        description: "성장기 돼지를 위한 고영양 사료입니다",
        protein: 18.5,
        fat: 4.2,
        fiber: 6.0,
        price: 45000
      })`,
      
      `CREATE (feed2:Feed {
        name: "비육용 사료", 
        type: "소용",
        description: "비육용 소를 위한 전문 사료입니다",
        protein: 16.0,
        fat: 3.8,
        fiber: 8.5,
        price: 38000
      })`,

      // 질병 정보
      `CREATE (disease1:Disease {
        name: "구제역", 
        type: "바이러스성",
        description: "소, 돼지 등 우제류 동물에 발생하는 전염병입니다",
        symptoms: "발열, 식욕부진, 입안 물집",
        treatment: "예방접종, 격리치료",
        prevention: "정기 백신접종, 농장 출입 통제"
      })`,
      
      `CREATE (disease2:Disease {
        name: "돼지열병", 
        type: "바이러스성",
        description: "돼지에게 치명적인 급성 전염병입니다",
        symptoms: "고열, 식욕부진, 구토, 설사",
        treatment: "항생제 투여, 수액 공급",
        prevention: "백신접종, 청결한 사육환경 유지"
      })`,

      // 관리 정보
      `CREATE (management1:Management {
        name: "급이 관리", 
        category: "사료",
        description: "돼지의 성장 단계별 급이량 관리 방법입니다",
        content: "자돈: 체중의 4-5%, 육성돈: 체중의 3-4%, 비육돈: 체중의 2.5-3%",
        frequency: "1일 2-3회",
        notes: "깨끗한 물을 충분히 공급해야 합니다"
      })`,
      
      `CREATE (management2:Management {
        name: "환경 관리", 
        category: "돈사",
        description: "돼지 사육을 위한 최적 환경 조건입니다",
        content: "온도: 18-22°C, 습도: 60-70%, 환기: 시간당 6-8회",
        frequency: "상시 모니터링",
        notes: "암모니아 농도를 20ppm 이하로 유지해야 합니다"
      })`,

      // 관계 생성
      `MATCH (f:Farm {name: "행복농장"}), (feed:Feed {name: "성장기 사료"})
       CREATE (f)-[:USES_FEED]->(feed)`,
       
      `MATCH (f:Farm {name: "푸른목장"}), (feed:Feed {name: "비육용 사료"})
       CREATE (f)-[:USES_FEED]->(feed)`,
       
      `MATCH (d:Disease), (m:Management {category: "사료"})
       CREATE (m)-[:PREVENTS]->(d)`,
       
      `MATCH (f:Farm {type: "양돈농장"}), (m:Management {category: "돈사"})
       CREATE (f)-[:APPLIES]->(m)`
    ]

    for (const query of queries) {
      await session.run(query)
    }
    
    console.log('Sample data created successfully')
    return true
  } catch (error) {
    console.error('Failed to create sample data:', error)
    return false
  } finally {
    if (session) {
      await session.close()
    }
  }
}

