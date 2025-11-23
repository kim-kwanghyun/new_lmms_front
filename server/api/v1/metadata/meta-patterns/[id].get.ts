// 특정 메타데이터 패턴 조회 API
export default defineEventHandler(async (event) => {
  try {
    // URL 파라미터에서 ID 가져오기
    const id = getRouterParam(event, 'id')
    
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Pattern ID is required'
      })
    }
    
    console.log(`Meta-pattern API 호출됨 - ID: ${id}`)
    
    // 실제 구현에서는 데이터베이스에서 특정 패턴을 조회
    const metaPatterns = {
      '1': {
        id: 1,
        name: 'User Management Pattern',
        description: '사용자 관리를 위한 메타데이터 패턴',
        category: 'user',
        fields: [
          {
            name: 'user_id',
            type: 'string',
            required: true,
            description: '사용자 고유 ID'
          },
          {
            name: 'username',
            type: 'string',
            required: true,
            maxLength: 50,
            description: '사용자명'
          },
          {
            name: 'email',
            type: 'email',
            required: true,
            description: '이메일 주소'
          },
          {
            name: 'role',
            type: 'enum',
            values: ['admin', 'user', 'guest'],
            default: 'user',
            description: '사용자 권한'
          },
          {
            name: 'created_at',
            type: 'datetime',
            required: true,
            description: '생성 일시'
          }
        ],
        validation: {
          rules: [
            'email must be unique',
            'username must be unique',
            'password must be at least 8 characters'
          ]
        },
        relationships: [
          {
            type: 'one-to-many',
            target: 'user_sessions',
            description: '사용자 세션 정보'
          },
          {
            type: 'many-to-many',
            target: 'user_groups',
            description: '사용자 그룹 관계'
          }
        ]
      },
      '2': {
        id: 2,
        name: 'Code Management Pattern',
        description: '코드 관리를 위한 메타데이터 패턴',
        category: 'code',
        fields: [
          {
            name: 'master_code',
            type: 'string',
            required: true,
            pattern: '^[A-Z_]+$',
            description: '마스터 코드'
          },
          {
            name: 'code_value',
            type: 'string',
            required: true,
            description: '코드 값'
          },
          {
            name: 'code_name',
            type: 'string',
            required: true,
            description: '코드명'
          },
          {
            name: 'sort_order',
            type: 'integer',
            default: 1,
            description: '정렬 순서'
          }
        ]
      }
    }
    
    const pattern = metaPatterns[id]
    
    if (!pattern) {
      throw createError({
        statusCode: 404,
        statusMessage: `Meta-pattern with ID ${id} not found`
      })
    }
    
    return {
      success: true,
      message: 'Meta-pattern retrieved successfully',
      data: {
        pattern,
        metadata: {
          totalPatterns: Object.keys(metaPatterns).length,
          lastUpdated: new Date().toISOString(),
          version: '1.0.0'
        }
      },
      timestamp: new Date().toISOString()
    }
    
  } catch (error) {
    console.error('Meta-pattern API 오류:', error)
    
    // 이미 createError로 생성된 에러는 그대로 throw
    if (error.statusCode) {
      throw error
    }
    
    // 일반 에러는 500으로 변환
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: {
        success: false,
        message: 'Failed to retrieve meta-pattern',
        error: error.message,
        timestamp: new Date().toISOString()
      }
    })
  }
})
