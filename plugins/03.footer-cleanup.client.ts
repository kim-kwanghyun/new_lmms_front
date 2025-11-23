// 푸터 아이콘 제거를 위한 클라이언트 플러그인
export default defineNuxtPlugin({
  name: 'footer-cleanup',
  setup() {
    if (typeof window !== 'undefined') {
      // DOM이 로드된 후 실행
      const cleanupFooter = () => {
        // 푸터 요소들 찾기
        const footers = document.querySelectorAll('#footer, .footer')
        
        footers.forEach(footer => {
          // 모든 아이콘 요소 제거
          const icons = footer.querySelectorAll('i, .icon, [class*="icon"], [class*="bi-"], .fa, [class*="fa-"]')
          icons.forEach(icon => {
            icon.style.display = 'none'
            icon.style.visibility = 'hidden'
            icon.style.opacity = '0'
          })
          
          // credits 섹션 제거
          const credits = footer.querySelectorAll('.credits, .designer-info, .template-info')
          credits.forEach(credit => {
            credit.style.display = 'none'
          })
        })
        
        // 개발 도구 및 성능 측정 요소들 제거
        const devElements = document.querySelectorAll(`
          .nuxt-devtools, #nuxt-devtools, [data-nuxt-devtools],
          .devtools-panel, .performance-monitor, .debug-info,
          .dev-overlay, .timing-info, .ms-indicator,
          [class*="devtools"], [class*="debug"], [class*="timing"], [class*="performance"],
          [id*="devtools"], [id*="debug"], [id*="timing"], [id*="performance"],
          .vite-dev-overlay, .__nuxt-dev-overlay, .nuxt-loading-indicator,
          .vue-devtools, .__vue-devtools-global-hook,
          .development-only, .dev-only, .debug-only,
          [data-dev], [data-debug], [data-development]
        `)
        
        devElements.forEach(element => {
          element.style.display = 'none'
          element.style.visibility = 'hidden'
          element.style.opacity = '0'
          element.style.position = 'absolute'
          element.style.left = '-9999px'
          element.style.top = '-9999px'
          element.style.pointerEvents = 'none'
        })
        
        // 하단 고정 요소들 (개발 도구 등) 제거
        const fixedElements = document.querySelectorAll('[style*="position: fixed"]')
        fixedElements.forEach(element => {
          const style = element.getAttribute('style') || ''
          if (style.includes('bottom') || style.includes('z-index: 999')) {
            element.style.display = 'none'
          }
        })
        
        // 가상 요소 및 개발 도구 스타일 추가
        const style = document.createElement('style')
        style.textContent = `
          #footer::before, #footer::after, #footer *::before, #footer *::after,
          .footer::before, .footer::after, .footer *::before, .footer *::after {
            display: none !important;
            content: none !important;
          }
          
          /* 개발 도구 관련 요소들 강제 숨김 */
          .nuxt-devtools, #nuxt-devtools, [data-nuxt-devtools],
          .devtools-panel, .performance-monitor, .debug-info,
          .dev-overlay, .timing-info, .ms-indicator,
          [class*="devtools"], [class*="debug"], [class*="timing"],
          .vite-dev-overlay, .__nuxt-dev-overlay {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            position: absolute !important;
            left: -9999px !important;
            pointer-events: none !important;
          }
        `
        if (!document.querySelector('#footer-cleanup-style')) {
          style.id = 'footer-cleanup-style'
          document.head.appendChild(style)
        }
      }
      
      // DOM 로드 완료 후 실행
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', cleanupFooter)
      } else {
        cleanupFooter()
      }
      
      // 페이지 변경 시에도 실행 (SPA 대응)
      const observer = new MutationObserver(() => {
        cleanupFooter()
      })
      
      // body 변경 감시
      if (document.body) {
        observer.observe(document.body, {
          childList: true,
          subtree: true
        })
      }
      
      console.log('푸터 아이콘 정리 플러그인이 로드되었습니다.')
    }
  }
})
