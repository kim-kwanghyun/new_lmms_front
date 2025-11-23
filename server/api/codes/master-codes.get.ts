export default defineEventHandler(async (event) => {
  try {
    // 실제로는 데이터베이스에서 조회
    const masterCodes = [
      {
        master_code: 'USER_TYPE',
        master_name: '사용자 유형',
        description: '시스템 사용자의 유형을 구분하는 코드',
        use_yn: 'Y',
        created_at: '2024-01-01T00:00:00.000Z',
        created_by: 'admin',
        updated_at: '2024-01-01T00:00:00.000Z',
        updated_by: 'admin'
      },
      {
        master_code: 'BOARD_TYPE',
        master_name: '게시판 유형',
        description: '게시판의 유형을 구분하는 코드',
        use_yn: 'Y',
        created_at: '2024-01-02T00:00:00.000Z',
        created_by: 'admin',
        updated_at: '2024-01-02T00:00:00.000Z',
        updated_by: 'admin'
      },
      {
        master_code: 'STATUS',
        master_name: '상태',
        description: '각종 상태를 나타내는 코드',
        use_yn: 'Y',
        created_at: '2024-01-03T00:00:00.000Z',
        created_by: 'admin',
        updated_at: '2024-01-03T00:00:00.000Z',
        updated_by: 'admin'
      }
    ]

    return {
      success: true,
      data: masterCodes,
      message: '마스터코드 목록을 성공적으로 조회했습니다.'
    }
  } catch (error) {
    console.error('마스터코드 조회 오류:', error)
    
    return {
      success: false,
      data: [],
      message: '마스터코드 조회 중 오류가 발생했습니다.'
    }
  }
})
