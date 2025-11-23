export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    // 요청 데이터 검증
    if (!body.master_code || !body.code_value || !body.code_name) {
      return {
        success: false,
        message: '필수 항목이 누락되었습니다.'
      }
    }

    // 실제로는 데이터베이스에 저장
    const newCodeValue = {
      master_code: body.master_code,
      code_value: body.code_value,
      code_name: body.code_name,
      sort_order: body.sort_order || 1,
      description: body.description || '',
      use_yn: body.use_yn || 'Y',
      created_at: new Date().toISOString(),
      created_by: 'admin', // 실제로는 인증된 사용자 ID
      updated_at: new Date().toISOString(),
      updated_by: 'admin'
    }

    console.log('새 코드값 생성:', newCodeValue)

    return {
      success: true,
      data: newCodeValue,
      message: '코드값이 성공적으로 등록되었습니다.'
    }
  } catch (error) {
    console.error('코드값 등록 오류:', error)
    
    return {
      success: false,
      message: '코드값 등록 중 오류가 발생했습니다.'
    }
  }
})
