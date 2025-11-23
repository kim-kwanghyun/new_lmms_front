// Admin 레이아웃용 JavaScript 파일들을 로드하는 플러그인
export default defineNuxtPlugin({
  name: 'admin-scripts',
  setup() {
    // 클라이언트 사이드에서만 실행
    if (typeof window !== 'undefined') {
      // useHead를 사용하여 스크립트 태그 추가
      useHead({
        script: [
          { src: '/assets/vendor/bootstrap/js/bootstrap.bundle.min.js', defer: true },
          { src: '/assets/vendor/apexcharts/apexcharts.min.js', defer: true },
          { src: '/assets/vendor/chart.js/chart.umd.js', defer: true },
          { src: '/assets/vendor/echarts/echarts.min.js', defer: true },
          { src: '/assets/vendor/quill/quill.js', defer: true },
          { src: '/assets/vendor/simple-datatables/simple-datatables.js', defer: true },
          { src: '/assets/vendor/tinymce/tinymce.min.js', defer: true },
          { src: '/assets/vendor/php-email-form/validate.js', defer: true },
          { src: '/assets/js/main.js', defer: true }
        ]
      })
      
      console.log('Admin 스크립트들이 로드 대기열에 추가되었습니다.')
    }
  }
})
