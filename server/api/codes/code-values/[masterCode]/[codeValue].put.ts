export default defineEventHandler(async (event) => {
  try {
    const masterCode = getRouterParam(event, 'masterCode')
    const codeValue = getRouterParam(event, 'codeValue')
    const body = await readBody(event)
    
    // 요청 데이터 검증
    if (!body.code_name) {
      return {
        success: false,
        message: '필수 항목이 누락되었습니다.'
      }
    }

    // 실제로는 데이터베이스에서 업데이트
    const updatedCodeValue = {
      master_code: masterCode,
      code_value: codeValue,
      code_name: body.code_name,
      sort_order: body.sort_order || 1,
      description: body.description || '',
      use_yn: body.use_yn || 'Y',
      updated_at: new Date().toISOString(),
      updated_by: 'admin' // 실제로는 인증된 사용자 ID
    }

    console.log('코드값 수정:', updatedCodeValue)

    return {
      success: true,
      data: updatedCodeValue,
      message: '코드값이 성공적으로 수정되었습니다.'
    }
  } catch (error) {
    console.error('코드값 수정 오류:', error)
    
    return {
      success: false,
      message: '코드값 수정 중 오류가 발생했습니다.'
    }
  }
})
