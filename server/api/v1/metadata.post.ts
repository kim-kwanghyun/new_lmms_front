// Metadata POST API 엔드포인트
export default defineEventHandler(async (event) => {
  try {
    // POST 데이터 읽기
    const body = await readBody(event)
    
    console.log('Metadata POST API 호출됨:', body)
    
    // 요청 데이터 검증
    if (!body || typeof body !== 'object') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request body'
      })
    }
    
    // 실제 구현에서는 데이터베이스에 메타데이터 저장/업데이트
    const result = {
      id: Date.now(),
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active'
    }
    
    return {
      success: true,
      message: 'Metadata saved successfully',
      data: result,
      timestamp: new Date().toISOString()
    }
    
  } catch (error) {
    console.error('Metadata POST API 오류:', error)
    
    // 에러 응답
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error',
      data: {
        success: false,
        message: 'Failed to save metadata',
        error: error.message,
        timestamp: new Date().toISOString()
      }
    })
  }
})
