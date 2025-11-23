<template>
  <div id="app">
    
    <!-- 커스텀 로딩 화면 -->
    <LoadingScreen v-if="isAppLoading" />
    
    <!-- 메인 앱 콘텐츠 -->
    <div v-show="!isAppLoading">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 앱 로딩 상태 관리
const isAppLoading = ref(true)

// 앱 초기화 시뮬레이션
onMounted(async () => {
  try {
    // CSS 파일들을 동적으로 로드 (Bootstrap과 아이콘만)
    if (typeof window !== 'undefined') {
      const cssFiles = [
        '/assets/vendor/bootstrap/css/bootstrap.min.css',
        '/assets/vendor/bootstrap-icons/bootstrap-icons.css',
        '/assets/vendor/boxicons/css/boxicons.min.css',
        '/assets/vendor/remixicon/remixicon.css'
        // style.css는 제거 - assets/css/main.css가 대체
      ]
      
      cssFiles.forEach(href => {
        if (!document.querySelector(`link[href="${href}"]`)) {
          const link = document.createElement('link')
          link.rel = 'stylesheet'
          link.href = href
          document.head.appendChild(link)
        }
      })
    }
    // 실제 앱에서는 여기에 초기화 로직을 추가
    // 예: API 호출, 사용자 인증 확인, 설정 로드 등
    
    // 시뮬레이션: 2-4초 후 로딩 완료
    const loadingTime = 2000 + Math.random() * 2000
    
    await new Promise(resolve => setTimeout(resolve, loadingTime))
    
    // 로딩 완료
    isAppLoading.value = false
  } catch (error) {
    console.error('앱 초기화 중 오류:', error)
    // 오류가 발생해도 로딩 화면을 숨김
    isAppLoading.value = false
  }
})

// 페이지 변경 시 로딩 상태 관리 (선택사항)
// const router = useRouter()
// router.beforeEach((to: any, from: any) => {
//   // 필요에 따라 페이지 변경 시에도 로딩 화면 표시
//   // isAppLoading.value = true
// })

// router.afterEach(() => {
//   // 페이지 로드 완료 후 로딩 화면 숨김
//   // isAppLoading.value = false
// })
</script>

<!-- 스타일은 assets/css/main.css에서 관리 -->
