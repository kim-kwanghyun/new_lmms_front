// 메타데이터 패턴 목록 조회 API
export default defineEventHandler(async (event) => {
  try {
    console.log('메타데이터 패턴 목록 API 호출됨')
    
    // 실제 구현에서는 데이터베이스에서 모든 패턴을 조회
    const metaPatterns = [
      {
        id: 1,
        name: 'User Management Pattern',
        description: '사용자 관리를 위한 메타데이터 패턴',
        category: 'user',
        fieldsCount: 5,
        created_at: '2024-01-15T10:30:00Z'
      },
      {
        id: 2,
        name: 'Code Management Pattern',
        description: '코드 관리를 위한 메타데이터 패턴',
        category: 'code',
        fieldsCount: 4,
        created_at: '2024-01-15T11:00:00Z'
      },
      {
        id: 3,
        name: 'File Management Pattern',
        description: '파일 관리를 위한 메타데이터 패턴',
        category: 'file',
        fieldsCount: 6,
        created_at: '2024-01-15T11:30:00Z'
      }
    ]
    
    return {
      success: true,
      message: 'Meta-patterns retrieved successfully',
      data: {
        patterns: metaPatterns,
        metadata: {
          totalCount: metaPatterns.length,
          lastUpdated: new Date().toISOString(),
          version: '1.0.0'
        }
      },
      timestamp: new Date().toISOString()
    }
    
  } catch (error) {
    console.error('메타데이터 패턴 목록 API 오류:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: {
        success: false,
        message: 'Failed to retrieve meta-patterns',
        error: error.message,
        timestamp: new Date().toISOString()
      }
    })
  }
})
