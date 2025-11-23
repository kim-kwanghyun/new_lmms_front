// API 클라이언트 유틸리티
export class ApiClient {
  private baseURL: string
  private defaultHeaders: Record<string, string>

  constructor(baseURL: string = 'http://localhost:8080') {
    this.baseURL = baseURL
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }

  // 헤더 설정
  setHeader(key: string, value: string) {
    this.defaultHeaders[key] = value
  }

  // 헤더 제거
  removeHeader(key: string) {
    delete this.defaultHeaders[key]
  }

  // 인증 토큰 설정
  setAuthToken(token: string) {
    this.setHeader('Authorization', `Bearer ${token}`)
  }

  // 인증 토큰 제거
  removeAuthToken() {
    this.removeHeader('Authorization')
  }

  // HTTP 요청 공통 처리
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers
      },
      mode: 'cors'
    }

    try {
      console.log(`API 요청: ${config.method || 'GET'} ${url}`)
      
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new ApiError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorText
        )
      }

      // 응답이 비어있는 경우 (DELETE 등)
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return {} as T
      }

      const data = await response.json()
      console.log('API 응답:', data)
      
      return data
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      
      console.error('API 요청 실패:', error)
      throw new ApiError(
        `네트워크 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
        0,
        String(error)
      )
    }
  }

  // GET 요청
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    let url = endpoint
    
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          searchParams.append(key, String(value))
        }
      })
      
      if (searchParams.toString()) {
        url += `?${searchParams.toString()}`
      }
    }

    return this.request<T>(url, { method: 'GET' })
  }

  // POST 요청
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  // PUT 요청
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  // PATCH 요청
  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  // DELETE 요청
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  // 파일 업로드
  async uploadFile<T>(endpoint: string, file: File, fieldName: string = 'file'): Promise<T> {
    const formData = new FormData()
    formData.append(fieldName, file)

    const headers = { ...this.defaultHeaders }
    delete headers['Content-Type'] // multipart/form-data는 자동 설정

    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers
    })
  }

  // 다중 파일 업로드
  async uploadFiles<T>(endpoint: string, files: File[], fieldName: string = 'files'): Promise<T> {
    const formData = new FormData()
    files.forEach(file => {
      formData.append(fieldName, file)
    })

    const headers = { ...this.defaultHeaders }
    delete headers['Content-Type']

    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers
    })
  }
}

// API 에러 클래스
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// 기본 API 클라이언트 인스턴스 (기본값으로 localhost:8080 사용)
export const apiClient = new ApiClient('http://localhost:8080')

// Nuxt 플러그인에서 사용할 수 있는 팩토리 함수
export const createApiClient = (baseURL?: string) => {
  return new ApiClient(baseURL || 'http://localhost:8080')
}