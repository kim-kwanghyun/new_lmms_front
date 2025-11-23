export default defineEventHandler(async (event) => {
  try {
    const code = getRouterParam(event, 'code')
    const body = await readBody(event)
    
    // 요청 데이터 검증
    if (!body.master_name) {
      return {
        success: false,
        message: '필수 항목이 누락되었습니다.'
      }
    }

    // 실제로는 데이터베이스에서 업데이트
    const updatedMasterCode = {
      master_code: code,
      master_name: body.master_name,
      description: body.description || '',
      use_yn: body.use_yn || 'Y',
      updated_at: new Date().toISOString(),
      updated_by: 'admin' // 실제로는 인증된 사용자 ID
    }

    console.log('마스터코드 수정:', updatedMasterCode)

    return {
      success: true,
      data: updatedMasterCode,
      message: '마스터코드가 성공적으로 수정되었습니다.'
    }
  } catch (error) {
    console.error('마스터코드 수정 오류:', error)
    
    return {
      success: false,
      message: '마스터코드 수정 중 오류가 발생했습니다.'
    }
  }
})
