// 사용자의 권한 그룹 조회 API
export default defineEventHandler(async (event) => {
  try {
    const userId = parseInt(getRouterParam(event, 'userId') || '0')
    console.log('사용자 권한 그룹 조회 API 호출됨:', userId)
    
    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: {
          success: false,
          message: 'Invalid user ID',
          timestamp: new Date().toISOString()
        }
      })
    }
    
    // 실제 구현에서는 데이터베이스에서 사용자의 권한 그룹을 조회
    const userPermissionGroups = {
      1: [1], // 박본부장 - 관리자 그룹
      2: [3], // 조관리자 - 개발팀 그룹
      3: [3], // 이운영자 - 개발팀 그룹
      4: [3], // 최개발자 - 개발팀 그룹
      5: [3], // 정개발자 - 개발팀 그룹
      6: [2], // 김인턴 - 일반 사용자 그룹
      7: [2], // 이디자이너 - 일반 사용자 그룹
      8: [2], // 홍디자이너 - 일반 사용자 그룹
      9: [4], // 송영업 - 영업팀 그룹
      10: [4], // 윤마케터 - 영업팀 그룹
      11: [1], // 김대표 - 관리자 그룹
      12: [1], // 이부사장 - 관리자 그룹
      13: [5], // 한인사 - 인사팀 그룹
      14: [5]  // 신회계 - 인사팀 그룹
    }
    
    const assignedGroups = userPermissionGroups[userId] || [2] // 기본값: 일반 사용자 그룹
    
    return {
      success: true,
      message: 'User permission groups retrieved successfully',
      data: {
        userId: userId,
        permissionGroupIds: assignedGroups
      },
      timestamp: new Date().toISOString()
    }
    
  } catch (error) {
    console.error('사용자 권한 그룹 조회 API 오류:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: {
        success: false,
        message: 'Failed to retrieve user permission groups',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    })
  }
})


