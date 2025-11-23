// API 클라이언트 플러그인
export default defineNuxtPlugin({
  name: 'api-client',
  setup(nuxtApp) {
    // 이미 제공된 경우 건너뛰기
    if (nuxtApp.$apiClient) {
      return
    }
    
    const config = useRuntimeConfig()
    const baseURL = config.public?.apiBase || 'http://localhost:8205'
    
    // 간단한 API 클라이언트 생성
    const apiClient = {
      get: (url: string) => $fetch(url),
      post: (url: string, data: any) => $fetch(url, { method: 'POST', body: data }),
      put: (url: string, data: any) => $fetch(url, { method: 'PUT', body: data }),
      delete: (url: string) => $fetch(url, { method: 'DELETE' })
    }
    
    return {
      provide: {
        apiClient
      }
    }
  }
})