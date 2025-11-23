// 웹페이지 목록 조회 API
export default defineEventHandler(async (event) => {
  try {
    console.log('웹페이지 목록 API 호출됨')
    
    // 실제 구현에서는 데이터베이스에서 등록된 웹페이지 목록을 조회
    const webPages = [
      {
        id: 1,
        name: '대시보드',
        path: '/',
        category: '메인',
        description: '시스템 메인 대시보드',
        isRequired: true,
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 2,
        name: '사용자 관리',
        path: '/admin/users',
        category: '관리',
        description: '사용자 계정 관리',
        isRequired: false,
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 3,
        name: '권한 관리',
        path: '/auth/permission',
        category: '관리',
        description: '사용자별 페이지 접근 권한 설정',
        isRequired: false,
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 4,
        name: '코드 관리',
        path: '/manual/manual_list',
        category: '시스템',
        description: '마스터 코드 및 코드값 관리',
        isRequired: false,
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 5,
        name: '메타데이터 관리',
        path: '/manual/metadata_list',
        category: '시스템',
        description: '시스템 메타데이터 관리',
        isRequired: false,
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 6,
        name: 'LLM 콘솔',
        path: '/llm/llm',
        category: 'AI',
        description: 'AI 언어모델 콘솔',
        isRequired: false,
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 7,
        name: '파일 관리',
        path: '/test',
        category: '도구',
        description: '파일 업로드 및 관리',
        isRequired: false,
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 8,
        name: '감사 관리',
        path: '/test-admin',
        category: '보안',
        description: '시스템 감사 로그 관리',
        isRequired: false,
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 9,
        name: '로그인',
        path: '/member/login',
        category: '인증',
        description: '사용자 로그인',
        isRequired: true,
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 10,
        name: '회원가입',
        path: '/member/register',
        category: '인증',
        description: '신규 사용자 가입',
        isRequired: false,
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 11,
        name: '프로필 설정',
        path: '/member/profile',
        category: '사용자',
        description: '개인 프로필 설정',
        isRequired: false,
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 12,
        name: '비밀번호 재설정',
        path: '/member/resetpassword',
        category: '인증',
        description: '비밀번호 재설정',
        isRequired: false,
        created_at: '2024-01-01T00:00:00Z'
      }
    ]
    
    // 카테고리별 통계
    const categories = [...new Set(webPages.map(page => page.category))]
    const categoryStats = categories.map(category => ({
      name: category,
      count: webPages.filter(page => page.category === category).length,
      required: webPages.filter(page => page.category === category && page.isRequired).length
    }))
    
    return {
      success: true,
      message: 'Web pages retrieved successfully',
      data: webPages,
      metadata: {
        total: webPages.length,
        required: webPages.filter(page => page.isRequired).length,
        optional: webPages.filter(page => !page.isRequired).length,
        categories: categoryStats
      },
      timestamp: new Date().toISOString()
    }
    
  } catch (error) {
    console.error('웹페이지 목록 API 오류:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: {
        success: false,
        message: 'Failed to retrieve web pages',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    })
  }
})


