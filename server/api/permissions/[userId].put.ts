// 사용자 권한 업데이트 API
export default defineEventHandler(async (event) => {
  try {
    const userId = getRouterParam(event, 'userId')
    const body = await readBody(event)
    
    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      })
    }
    
    if (!body || !body.permissions) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Permissions data is required'
      })
    }
    
    console.log(`사용자 권한 업데이트 API 호출됨 - User ID: ${userId}`)
    console.log('권한 데이터:', body.permissions)
    
    // 실제 구현에서는 데이터베이스에 권한 정보를 저장
    // 예: 
    // - user_permissions 테이블에 INSERT/UPDATE
    // - 기존 권한 삭제 후 새로운 권한 삽입
    // - 권한 변경 로그 기록
    
    // 권한 검증
    const validPermissions = {}
    let allowedCount = 0
    
    for (const [pageId, permission] of Object.entries(body.permissions)) {
      const pageIdNum = parseInt(pageId)
      
      if (isNaN(pageIdNum) || pageIdNum < 1) {
        throw createError({
          statusCode: 400,
          statusMessage: `Invalid page ID: ${pageId}`
        })
      }
      
      const allowed = Boolean(permission.allowed)
      validPermissions[pageId] = {
        allowed,
        updated_at: new Date().toISOString(),
        updated_by: 'admin' // 실제로는 현재 로그인한 관리자 ID
      }
      
      if (allowed) allowedCount++
    }
    
    // 시뮬레이션: 데이터베이스 저장 지연
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 권한 변경 로그 기록 (실제 구현에서)
    const auditLog = {
      action: 'UPDATE_USER_PERMISSIONS',
      userId: parseInt(userId),
      changedBy: 'admin',
      changedAt: new Date().toISOString(),
      changes: validPermissions,
      summary: `${allowedCount}개 페이지 접근 허용`
    }
    
    console.log('권한 변경 감사 로그:', auditLog)
    
    return {
      success: true,
      message: 'User permissions updated successfully',
      data: {
        userId: parseInt(userId),
        updatedPermissions: validPermissions,
        statistics: {
          total: Object.keys(validPermissions).length,
          allowed: allowedCount,
          denied: Object.keys(validPermissions).length - allowedCount
        },
        auditLog
      },
      timestamp: new Date().toISOString()
    }
    
  } catch (error) {
    console.error('사용자 권한 업데이트 API 오류:', error)
    
    // 이미 createError로 생성된 에러는 그대로 throw
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: {
        success: false,
        message: 'Failed to update user permissions',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    })
  }
})


