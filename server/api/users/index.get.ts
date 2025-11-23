// 사용자 목록 조회 API
export default defineEventHandler(async (event) => {
  try {
    console.log('사용자 목록 API 호출됨')
    
    // 실제 구현에서는 데이터베이스에서 사용자 목록을 조회
    const users = [
      {
        id: 1,
        name: '김관리자',
        email: 'admin@company.com',
        role: '관리자',
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
        last_login: '2024-01-15T09:30:00Z'
      },
      {
        id: 2,
        name: '이사용자',
        email: 'user@company.com',
        role: '일반사용자',
        status: 'active',
        created_at: '2024-01-05T00:00:00Z',
        last_login: '2024-01-14T14:20:00Z'
      },
      {
        id: 3,
        name: '박매니저',
        email: 'manager@company.com',
        role: '매니저',
        status: 'active',
        created_at: '2024-01-10T00:00:00Z',
        last_login: '2024-01-15T11:45:00Z'
      },
      {
        id: 4,
        name: '최개발자',
        email: 'dev@company.com',
        role: '개발자',
        status: 'inactive',
        created_at: '2024-01-12T00:00:00Z',
        last_login: '2024-01-13T16:10:00Z'
      },
      {
        id: 5,
        name: '정디자이너',
        email: 'designer@company.com',
        role: '디자이너',
        status: 'active',
        created_at: '2024-01-08T00:00:00Z',
        last_login: '2024-01-15T08:00:00Z'
      }
    ]
    
    return {
      success: true,
      message: 'Users retrieved successfully',
      data: users,
      metadata: {
        total: users.length,
        active: users.filter(u => u.status === 'active').length,
        inactive: users.filter(u => u.status === 'inactive').length
      },
      timestamp: new Date().toISOString()
    }
    
  } catch (error) {
    console.error('사용자 목록 API 오류:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: {
        success: false,
        message: 'Failed to retrieve users',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    })
  }
})


