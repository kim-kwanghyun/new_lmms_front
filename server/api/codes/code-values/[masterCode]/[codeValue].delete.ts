export default defineEventHandler(async (event) => {
  try {
    const masterCode = getRouterParam(event, 'masterCode')
    const codeValue = getRouterParam(event, 'codeValue')
    
    if (!masterCode || !codeValue) {
      return {
        success: false,
        message: '마스터코드 또는 코드값이 지정되지 않았습니다.'
      }
    }

    // 실제로는 데이터베이스에서 삭제
    console.log('코드값 삭제:', { masterCode, codeValue })

    return {
      success: true,
      message: '코드값이 성공적으로 삭제되었습니다.'
    }
  } catch (error) {
    console.error('코드값 삭제 오류:', error)
    
    return {
      success: false,
      message: '코드값 삭제 중 오류가 발생했습니다.'
    }
  }
})
