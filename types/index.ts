// 전역 타입 선언
import type { ApiClient } from '~/utils/apiClient'

declare module '#app' {
  interface NuxtApp {
    $apiClient: ApiClient
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $apiClient: ApiClient
  }
}

export {}