export default defineEventHandler(async (event) => {
  try {
    const masterCode = getRouterParam(event, 'masterCode')
    
    if (!masterCode) {
      return {
        success: false,
        data: [],
        message: '마스터코드가 지정되지 않았습니다.'
      }
    }

    // 실제로는 데이터베이스에서 조회
    let codeValues = []
    
    if (masterCode === 'USER_TYPE') {
      codeValues = [
        {
          code_value: 'ADMIN',
          code_name: '관리자',
          sort_order: 1,
          description: '시스템 관리자',
          use_yn: 'Y',
          master_code: 'USER_TYPE',
          created_at: '2024-01-01T00:00:00.000Z',
          created_by: 'admin'
        },
        {
          code_value: 'USER',
          code_name: '일반사용자',
          sort_order: 2,
          description: '일반 사용자',
          use_yn: 'Y',
          master_code: 'USER_TYPE',
          created_at: '2024-01-01T00:00:00.000Z',
          created_by: 'admin'
        },
        {
          code_value: 'GUEST',
          code_name: '게스트',
          sort_order: 3,
          description: '게스트 사용자',
          use_yn: 'N',
          master_code: 'USER_TYPE',
          created_at: '2024-01-01T00:00:00.000Z',
          created_by: 'admin'
        }
      ]
    } else if (masterCode === 'BOARD_TYPE') {
      codeValues = [
        {
          code_value: 'NOTICE',
          code_name: '공지사항',
          sort_order: 1,
          description: '공지사항 게시판',
          use_yn: 'Y',
          master_code: 'BOARD_TYPE',
          created_at: '2024-01-02T00:00:00.000Z',
          created_by: 'admin'
        },
        {
          code_value: 'FAQ',
          code_name: '자주묻는질문',
          sort_order: 2,
          description: 'FAQ 게시판',
          use_yn: 'Y',
          master_code: 'BOARD_TYPE',
          created_at: '2024-01-02T00:00:00.000Z',
          created_by: 'admin'
        }
      ]
    } else if (masterCode === 'STATUS') {
      codeValues = [
        {
          code_value: 'ACTIVE',
          code_name: '활성',
          sort_order: 1,
          description: '활성 상태',
          use_yn: 'Y',
          master_code: 'STATUS',
          created_at: '2024-01-03T00:00:00.000Z',
          created_by: 'admin'
        },
        {
          code_value: 'INACTIVE',
          code_name: '비활성',
          sort_order: 2,
          description: '비활성 상태',
          use_yn: 'Y',
          master_code: 'STATUS',
          created_at: '2024-01-03T00:00:00.000Z',
          created_by: 'admin'
        },
        {
          code_value: 'PENDING',
          code_name: '대기',
          sort_order: 3,
          description: '대기 상태',
          use_yn: 'Y',
          master_code: 'STATUS',
          created_at: '2024-01-03T00:00:00.000Z',
          created_by: 'admin'
        }
      ]
    }

    return {
      success: true,
      data: codeValues.sort((a, b) => a.sort_order - b.sort_order),
      message: '코드값 목록을 성공적으로 조회했습니다.'
    }
  } catch (error) {
    console.error('코드값 조회 오류:', error)
    
    return {
      success: false,
      data: [],
      message: '코드값 조회 중 오류가 발생했습니다.'
    }
  }
})
