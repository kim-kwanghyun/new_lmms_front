// 간단한 테스트 API 엔드포인트
export default defineEventHandler(async (event) => {
  console.log('테스트 API 호출됨')
  
  return {
    success: true,
    message: 'Test API is working!',
    timestamp: new Date().toISOString(),
    server: 'Nuxt Server',
    data: {
      test: true,
      version: '1.0.0'
    }
  }
})
