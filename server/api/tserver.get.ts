// 직원 데이터를 반환하는 API 엔드포인트
export default defineEventHandler(async (event) => {
  // 쿼리 파라미터 추출
  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 10
  
  // 실제 구현 시 아래와 같이 외부 API를 호출하거나 데이터베이스에서 데이터를 조회합니다:
  // const response = await $fetch(`https://your-api-server.com/employees?page=${page}&limit=${limit}`)
  // 또는
  // const data = await database.employees.findMany({ skip: (page - 1) * limit, take: limit })
  
  try {
    // 시뮬레이션: 네트워크 지연
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // 전체 샘플 데이터 생성 (실제로는 데이터베이스에서 조회)
    const departments = ['개발팀', '디자인팀', '기획팀', '마케팅팀', '영업팀', '인사팀', '재무팀']
   
    // 응답 데이터 구조
    return {
      departments : departments
    }
    
  } catch (error) {
    // 에러 처리
    throw createError({
      statusCode: 500,
      statusMessage: '직원 데이터를 가져오는 중 오류가 발생했습니다.'
    })
  }
})