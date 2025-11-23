// 페이지 권한 그룹 목록 조회 API
export default defineEventHandler(async (event) => {
  try {
    console.log('페이지 권한 그룹 목록 API 호출됨')
    
    // 실제 구현에서는 데이터베이스에서 권한 그룹 정보를 조회
    const permissionGroups = [
      {
        id: 1,
        name: '관리자 그룹',
        description: '시스템 전체 관리 권한',
        color: '#dc3545', // 빨간색
        permissions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], // 모든 페이지 권한
        createdAt: '2024-01-15T09:00:00Z',
        updatedAt: '2024-01-15T09:00:00Z'
      },
      {
        id: 2,
        name: '일반 사용자 그룹',
        description: '기본 사용자 권한',
        color: '#28a745', // 초록색
        permissions: [1, 2, 3], // 메인, 프로필, 대시보드만
        createdAt: '2024-01-15T09:00:00Z',
        updatedAt: '2024-01-15T09:00:00Z'
      },
      {
        id: 3,
        name: '개발팀 그룹',
        description: '개발 관련 페이지 접근 권한',
        color: '#007bff', // 파란색
        permissions: [1, 2, 3, 4, 5, 6, 7], // 개발 관련 페이지들
        createdAt: '2024-01-15T09:00:00Z',
        updatedAt: '2024-01-15T09:00:00Z'
      },
      {
        id: 4,
        name: '영업팀 그룹',
        description: '영업 관련 페이지 접근 권한',
        color: '#fd7e14', // 주황색
        permissions: [1, 2, 3, 8, 9], // 영업 관련 페이지들
        createdAt: '2024-01-15T09:00:00Z',
        updatedAt: '2024-01-15T09:00:00Z'
      },
      {
        id: 5,
        name: '인사팀 그룹',
        description: '인사 관리 관련 권한',
        color: '#6f42c1', // 보라색
        permissions: [1, 2, 3, 10, 11], // 인사 관련 페이지들
        createdAt: '2024-01-15T09:00:00Z',
        updatedAt: '2024-01-15T09:00:00Z'
      }
    ]
    
    return {
      success: true,
      message: 'Permission groups retrieved successfully',
      data: permissionGroups,
      metadata: {
        totalGroups: permissionGroups.length,
        totalPermissions: Math.max(...permissionGroups.map(g => g.permissions.length)),
        averagePermissionsPerGroup: Math.round(
          permissionGroups.reduce((sum, g) => sum + g.permissions.length, 0) / permissionGroups.length
        )
      },
      timestamp: new Date().toISOString()
    }
    
  } catch (error) {
    console.error('권한 그룹 목록 API 오류:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: {
        success: false,
        message: 'Failed to retrieve permission groups',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    })
  }
})


