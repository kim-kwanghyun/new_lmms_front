// API 클라이언트 Composable - Nuxt 3 네이티브 방식
export const useApi = () => {
  // 런타임 설정에서 API 베이스 URL 가져오기
  const getBaseURL = () => {
    // Nuxt 내부 API는 항상 빈 베이스 URL 사용 (내부 라우팅)
    return ''
  }
  
  // API 호출 헬퍼 함수
  const apiCall = async (url: string, options: any = {}) => {
    try {
      const baseURL = getBaseURL()
      const fullURL = baseURL + url
      
      console.log(`API 요청: ${options.method || 'GET'} ${fullURL}`)
      
      // $fetch 사용 시도, 실패하면 네이티브 fetch 사용
      let response: any
      try {
        // Nuxt의 $fetch 사용
        response = await (globalThis as any).$fetch(url, {
          baseURL,
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...options.headers
          }
        })
      } catch (fetchError) {
        // $fetch가 없으면 네이티브 fetch 사용
        const fetchOptions: RequestInit = {
          method: options.method || 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...options.headers
          }
        }
        
        if (options.body) {
          fetchOptions.body = JSON.stringify(options.body)
        }
        
        const fetchResponse = await fetch(fullURL, fetchOptions)
        
        if (!fetchResponse.ok) {
          throw new Error(`HTTP ${fetchResponse.status}: ${fetchResponse.statusText}`)
        }
        
        response = await fetchResponse.json()
      }
      
      console.log('API 응답:', response)
      return response
    } catch (error) {
      console.error('API 호출 실패:', error)
      throw error
    }
  }
  
  return {
    // 마스터코드 관련 API
    masterCodes: {
      async getAll() {
        return await apiCall('/api/codes/master-codes')
      },
      
      async create(data: any) {
        return await apiCall('/api/codes/master-codes', { method: 'POST', body: data })
      },
      
      async update(code: string, data: any) {
        return await apiCall(`/api/codes/master-codes/${code}`, { method: 'PUT', body: data })
      },
      
      async delete(code: string) {
        return await apiCall(`/api/codes/master-codes/${code}`, { method: 'DELETE' })
      }
    },
    
    // 코드값 관련 API
    codeValues: {
      async getByMasterCode(masterCode: string) {
        return await apiCall(`/api/codes/code-values/${masterCode}`)
      },
      
      async create(data: any) {
        return await apiCall('/api/codes/code-values', { method: 'POST', body: data })
      },
      
      async update(masterCode: string, codeValue: string, data: any) {
        return await apiCall(`/api/codes/code-values/${masterCode}/${codeValue}`, { method: 'PUT', body: data })
      },
      
      async delete(masterCode: string, codeValue: string) {
        return await apiCall(`/api/codes/code-values/${masterCode}/${codeValue}`, { method: 'DELETE' })
      }
    },
    
    // 메타데이터 API
    metadata: {
      async get(params?: any) {
        return await apiCall('/api/v1/metadata', { query: params })
      },
      
      async create(data: any) {
        return await apiCall('/api/v1/metadata', { method: 'POST', body: data })
      },
      
      async update(data: any) {
        return await apiCall('/api/v1/metadata', { method: 'PUT', body: data })
      },
      
      // 메타데이터 패턴 관련
      async getPattern(id: string | number) {
        return await apiCall(`/api/v1/meta-patterns/${id}`)
      },
      
      async getAllPatterns() {
        return await apiCall('/api/v1/meta-patterns')
      },
      
      async createPattern(data: any) {
        return await apiCall('/api/v1/meta-patterns', { method: 'POST', body: data })
      },
      
      async updatePattern(id: string | number, data: any) {
        return await apiCall(`/api/v1/meta-patterns/${id}`, { method: 'PUT', body: data })
      },
      
      async deletePattern(id: string | number) {
        return await apiCall(`/api/v1/meta-patterns/${id}`, { method: 'DELETE' })
      },
      
      // 패턴 상세 관련
      async getPatternDetails(patternMasterId: string) {
        return await apiCall(`/api/v1/meta-patterns/${patternMasterId}/details`)
      },
      
      async createPatternDetail(data: any) {
        return await apiCall('/api/v1/meta-pattern-details', { method: 'POST', body: data })
      }
    },
    
    // 지식 관리 API
    knowledge: {
      // 지식 마스터 관련
      async getAllMasters(params?: any) {
        return await apiCall('/api/v1/knowledge/knowledge-masters', { query: params })
      },
      
      async getMaster(id: string) {
        return await apiCall(`/api/v1/knowledge/knowledge-masters/${id}`)
      },
      
      async createMaster(data: any) {
        return await apiCall('/api/v1/knowledge/knowledge-masters', { method: 'POST', body: data })
      },
      
      async updateMaster(id: string, data: any) {
        return await apiCall(`/api/v1/knowledge/knowledge-masters/${id}`, { method: 'PUT', body: data })
      },
      
      async deleteMaster(id: string) {
        return await apiCall(`/api/v1/knowledge/knowledge-masters/${id}`, { method: 'DELETE' })
      },
      
      // 지식 목록 관련
      async getKnowledgeList(knowledgeMasterId: string) {
        return await apiCall(`/api/v1/knowledge/knowledge-list/${knowledgeMasterId}`)
      },
      
      async createKnowledgeList(data: any) {
        return await apiCall('/api/v1/knowledge/knowledge-list', { method: 'POST', body: data })
      },
      
      async updateKnowledgeList(knowledgeMasterId: string, idx: string, data: any) {
        return await apiCall(`/api/v1/knowledge/knowledge-list/${knowledgeMasterId}/${idx}`, { method: 'PUT', body: data })
      },
      
      async deleteKnowledgeList(knowledgeMasterId: string, idx: string) {
        return await apiCall(`/api/v1/knowledge/knowledge-list/${knowledgeMasterId}/${idx}`, { method: 'DELETE' })
      }
    },
    
    // 캘린더 관련 API
    calendar: {
      // 이벤트 목록 조회
      async getEvents(params?: any) {
        return await apiCall('/api/v1/calendar/events', { query: params })
      },
      
      // 특정 이벤트 조회
      async getEvent(id: string | number) {
        return await apiCall(`/api/v1/calendar/events/${id}`)
      },
      
      // 이벤트 생성
      async createEvent(data: any) {
        return await apiCall('/api/v1/calendar/events', { method: 'POST', body: data })
      },
      
      // 이벤트 수정
      async updateEvent(id: string | number, data: any) {
        return await apiCall(`/api/v1/calendar/events/${id}`, { method: 'PUT', body: data })
      },
      
      // 이벤트 삭제
      async deleteEvent(id: string | number) {
        return await apiCall(`/api/v1/calendar/events/${id}`, { method: 'DELETE' })
      },
      
      // 월별 이벤트 조회
      async getMonthEvents(year: number, month: number) {
        return await apiCall('/api/v1/calendar/events', { 
          query: { year: year.toString(), month: month.toString() } 
        })
      },
      
      // 기간별 이벤트 조회
      async getEventsByDateRange(startDate: string, endDate: string) {
        return await apiCall('/api/v1/calendar/events', { 
          query: { start_date: startDate, end_date: endDate } 
        })
      }
    },
    
    // 축사방 관리 API
    livestock: {
      // 축사방 목록 조회
      async getRooms(params?: any) {
        return await apiCall('/api/v1/livestock/rooms', { query: params })
      },
      
      // 특정 축사방 조회
      async getRoom(id: string | number) {
        return await apiCall(`/api/v1/livestock/rooms/${id}`)
      },
      
      // 축사방 생성
      async createRoom(data: any) {
        return await apiCall('/api/v1/livestock/rooms', { method: 'POST', body: data })
      },
      
      // 축사방 수정
      async updateRoom(id: string | number, data: any) {
        return await apiCall(`/api/v1/livestock/rooms/${id}`, { method: 'PUT', body: data })
      },
      
      // 축사방 삭제
      async deleteRoom(id: string | number) {
        return await apiCall(`/api/v1/livestock/rooms/${id}`, { method: 'DELETE' })
      }
    },
    
    // 돼지 관리 API
    pigs: {
      // 돼지 목록 조회
      async getPigs(params?: any) {
        return await apiCall('/api/v1/pigs', { query: params })
      },
      
      // 돼지 입고 등록
      async registerPig(data: any) {
        return await apiCall('/api/v1/pigs', { method: 'POST', body: data })
      },
      
      // 돼지 출고 처리
      async checkoutPig(pigId: string, data: any) {
        return await apiCall(`/api/v1/pigs/${pigId}/checkout`, { method: 'POST', body: data })
      },
      
      // 거래 내역 조회
      async getTransactions(params?: any) {
        return await apiCall('/api/v1/pigs/transactions', { query: params })
      },
      
      // 축사방별 돼지 현황
      async getPigsByRoom(roomNumber: string) {
        return await apiCall('/api/v1/pigs', { query: { room_number: roomNumber, pig_status: '사육중' } })
      }
    },
    
    // 급이량/급수량 관리 API
    feeding: {
      // 일일 급이 기록 조회
      async getDailyRecords(params?: any) {
        return await apiCall('/api/v1/feeding/daily-records', { query: params })
      },
      
      // 급이 기록 등록
      async createDailyRecord(data: any) {
        return await apiCall('/api/v1/feeding/daily-records', { method: 'POST', body: data })
      },
      
      // 급이 기준 조회
      async getStandards(params?: any) {
        return await apiCall('/api/v1/feeding/standards', { query: params })
      },
      
      // 급이 현황 요약
      async getSummary(params?: any) {
        return await apiCall('/api/v1/feeding/summary', { query: params })
      },
      
      // 특정 돼지 급이 기록
      async getPigFeedingRecords(pigId: string, params?: any) {
        return await apiCall('/api/v1/feeding/daily-records', { 
          query: { pig_id: pigId, ...params } 
        })
      },
      
      // 축사별 급이 기록
      async getRoomFeedingRecords(roomNumber: string, params?: any) {
        return await apiCall('/api/v1/feeding/daily-records', { 
          query: { room_number: roomNumber, ...params } 
        })
      },
      
      // 실시간 급이량 조회
      async getSenIntime(params?: any) {
        return await apiCall('/api/v1/feeding/sen-intime', { query: params })
      },
      
      // 센서 데이터 조회
      async getSenStatus(params?: any) {
        return await apiCall('/api/v1/feeding/sen-status', { query: params })
      }
    },
    
    // 사용자 관련 API
    users: {
      async login(credentials: { email: string; password: string }) {
        return await apiCall('/api/auth/login', { method: 'POST', body: credentials })
      },
      
      async register(userData: any) {
        return await apiCall('/api/auth/register', { method: 'POST', body: userData })
      },
      
      async logout() {
        return await apiCall('/api/auth/logout', { method: 'POST' })
      },
      
      async getProfile() {
        return await apiCall('/api/auth/profile')
      }
    },
    
    // 시스템 정보 API
    system: {
      async getInfo() {
        return await apiCall('/api/system/info')
      },
      
      async getHealth() {
        return await apiCall('/api/system/health')
      },
      
      async testDatabase() {
        return await apiCall('/api/v1/system/db-test')
      },
      
      // 급이 테이블 확인
      async checkFeedingTables() {
        return await apiCall('/api/v1/system/feeding-tables-check')
      },
      
      // 돼지 정보 확인
      async checkPigInfo(pigId: string) {
        return await apiCall('/api/v1/system/pig-info-check', { query: { pig_id: pigId } })
      }
    },
    
    // 직접 API 호출 (디버깅용)
    async call(url: string, options: any = {}) {
      return await apiCall(url, options)
    }
  }
}

// 간단한 API 클라이언트 (기존 호환성을 위해)
export const useApiClient = () => {
  const api = useApi()
  
  return {
    get: (url: string, options?: any) => {
      if (options?.params) {
        return api.call(url, { query: options.params })
      }
      return api.call(url)
    },
    post: (url: string, data?: any, options?: any) => {
      if (data instanceof FormData) {
        // FormData인 경우 Content-Type 헤더를 설정하지 않음 (브라우저가 자동으로 boundary 포함)
        const fetchOptions: any = {
          method: 'POST',
          body: data
        }
        
        // options에서 Content-Type 헤더 제거
        if (options?.headers) {
          const headers = { ...options.headers }
          delete headers['Content-Type']
          delete headers['content-type']
          if (Object.keys(headers).length > 0) {
            fetchOptions.headers = headers
          }
        }
        
        return (globalThis as any).$fetch(url, fetchOptions).catch(async (error: any) => {
          // $fetch 실패 시 네이티브 fetch 사용
          const response = await fetch(url, fetchOptions)
          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`)
          }
          return await response.json()
        })
      }
      return api.call(url, { method: 'POST', body: data, ...options })
    },
    put: (url: string, data?: any, options?: any) => {
      if (data instanceof FormData) {
        // FormData인 경우 Content-Type 헤더를 설정하지 않음 (브라우저가 자동으로 boundary 포함)
        const fetchOptions: any = {
          method: 'PUT',
          body: data
        }
        
        // options에서 Content-Type 헤더 제거
        if (options?.headers) {
          const headers = { ...options.headers }
          delete headers['Content-Type']
          delete headers['content-type']
          if (Object.keys(headers).length > 0) {
            fetchOptions.headers = headers
          }
        }
        
        return (globalThis as any).$fetch(url, fetchOptions).catch(async (error: any) => {
          // $fetch 실패 시 네이티브 fetch 사용
          const response = await fetch(url, fetchOptions)
          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`)
          }
          return await response.json()
        })
      }
      return api.call(url, { method: 'PUT', body: data, ...options })
    },
    delete: (url: string, options?: any) => api.call(url, { method: 'DELETE', ...options })
  }
}

// 에러 핸들링을 위한 composable
export const useApiError = () => {
  const handleError = (error: any) => {
    if (error.status) {
      switch (error.status) {
        case 401:
          // 인증 오류 - 로그인 페이지로 리다이렉트
          if (typeof window !== 'undefined') {
            window.location.href = '/member/login'
          }
          break
        case 403:
          // 권한 없음
          alert('접근 권한이 없습니다.')
          break
        case 404:
          // 리소스 없음
          alert('요청한 리소스를 찾을 수 없습니다.')
          break
        case 500:
          // 서버 오류
          alert('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
          break
        default:
          alert(`오류가 발생했습니다: ${error.message}`)
      }
    } else {
      // 네트워크 오류 등
      alert('네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.')
    }
    
    console.error('API Error:', error)
  }
  
  return { handleError }
}