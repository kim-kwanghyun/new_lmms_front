export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    // 요청 데이터 검증
    if (!body.master_code || !body.master_name) {
      return {
        success: false,
        message: '필수 항목이 누락되었습니다.'
      }
    }

    // 마스터코드 형식 검증
    if (!/^[A-Z_]+$/.test(body.master_code)) {
      return {
        success: false,
        message: '마스터코드는 영문 대문자와 언더스코어(_)만 사용 가능합니다.'
      }
    }

    // 실제로는 데이터베이스에 저장
    const newMasterCode = {
      master_code: body.master_code,
      master_name: body.master_name,
      description: body.description || '',
      use_yn: body.use_yn || 'Y',
      created_at: new Date().toISOString(),
      created_by: 'admin', // 실제로는 인증된 사용자 ID
      updated_at: new Date().toISOString(),
      updated_by: 'admin'
    }

    console.log('새 마스터코드 생성:', newMasterCode)

    return {
      success: true,
      data: newMasterCode,
      message: '마스터코드가 성공적으로 등록되었습니다.'
    }
  } catch (error) {
    console.error('마스터코드 등록 오류:', error)
    
    return {
      success: false,
      message: '마스터코드 등록 중 오류가 발생했습니다.'
    }
  }
})
