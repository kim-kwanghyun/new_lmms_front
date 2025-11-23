// 특정 사용자의 권한 조회 API
export default defineEventHandler(async (event) => {
  try {
    const userId = getRouterParam(event, 'userId')
    
    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      })
    }
    
    console.log(`사용자 권한 조회 API 호출됨 - User ID: ${userId}`)
    
    // 실제 구현에서는 데이터베이스에서 사용자별 권한을 조회
    const generatePermissions = (userIdNum: number) => {
      const permissions: Record<string, { allowed: boolean; granted_at?: string }> = {}
      
      // 페이지 ID 1-12에 대한 권한 설정
      for (let pageId = 1; pageId <= 12; pageId++) {
        let allowed = false
        
        switch (userIdNum) {
          case 1: // 관리자 - 모든 권한
            allowed = true
            break
          case 2: // 일반사용자 - 기본 권한만
            allowed = [1, 4, 5, 9, 10, 11, 12].includes(pageId) // 대시보드, 코드관리, 메타데이터, 인증 관련
            break
          case 3: // 매니저 - 관리 권한 포함
            allowed = [1, 2, 4, 5, 7, 9, 10, 11, 12].includes(pageId)
            break
          case 4: // 개발자 - 시스템 관련 권한
            allowed = [1, 4, 5, 6, 7, 8, 9, 10, 11, 12].includes(pageId)
            break
          case 5: // 디자이너 - 제한된 권한
            allowed = [1, 6, 7, 9, 10, 11, 12].includes(pageId)
            break
          default:
            // 기본값: 필수 페이지만 허용
            allowed = [1, 9].includes(pageId) // 대시보드, 로그인만
        }
        
        permissions[pageId] = {
          allowed,
          granted_at: allowed ? '2024-01-01T00:00:00Z' : undefined
        }
      }
      
      return permissions
    }
    
    const userPermissions = generatePermissions(parseInt(userId))
    
    // 권한 통계
    const totalPages = Object.keys(userPermissions).length
    const allowedPages = Object.values(userPermissions).filter(p => p.allowed).length
    const deniedPages = totalPages - allowedPages
    
    return {
      success: true,
      message: 'User permissions retrieved successfully',
      data: {
        userId: parseInt(userId),
        permissions: userPermissions,
        statistics: {
          total: totalPages,
          allowed: allowedPages,
          denied: deniedPages,
          allowedPercentage: Math.round((allowedPages / totalPages) * 100)
        },
        lastUpdated: '2024-01-15T10:30:00Z'
      },
      timestamp: new Date().toISOString()
    }
    
  } catch (error) {
    console.error('사용자 권한 조회 API 오류:', error)
    
    // 이미 createError로 생성된 에러는 그대로 throw
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: {
        success: false,
        message: 'Failed to retrieve user permissions',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    })
  }
})


