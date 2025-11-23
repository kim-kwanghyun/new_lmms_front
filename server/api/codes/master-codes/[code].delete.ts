export default defineEventHandler(async (event) => {
  try {
    const code = getRouterParam(event, 'code')
    
    if (!code) {
      return {
        success: false,
        message: '마스터코드가 지정되지 않았습니다.'
      }
    }

    // 실제로는 데이터베이스에서 삭제 (관련 코드값도 함께)
    console.log('마스터코드 삭제:', code)

    return {
      success: true,
      message: '마스터코드가 성공적으로 삭제되었습니다.'
    }
  } catch (error) {
    console.error('마스터코드 삭제 오류:', error)
    
    return {
      success: false,
      message: '마스터코드 삭제 중 오류가 발생했습니다.'
    }
  }
})
