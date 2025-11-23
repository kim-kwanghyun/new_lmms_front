// 메타 패턴 목록 조회 API
import mysql from 'mysql2/promise'

// 데이터베이스 연결 설정
const dbConfig = {
  host: process.env.CONST_DB_HOST || '223.130.159.190',
  port: parseInt(process.env.CONST_DB_PORT || '3306'),
  user: process.env.CONST_DB_USER || 'lsmms',
  password: process.env.CONST_DB_PASSWORD?.replace(/'/g, '') || 'first_lsmms',
  database: process.env.CONST_DB_DATABASE || 'LSMMS',
  charset: 'utf8mb4'
}

export default defineEventHandler(async (event) => {
  let connection: mysql.Connection | null = null
  
  try {
    // 쿼리 파라미터 가져오기
    const query = getQuery(event)
    const { page = 1, limit = 10, search = '' } = query
    
    console.log('메타 패턴 목록 조회 API 호출됨:', query)
    
    // 데이터베이스 연결
    connection = await mysql.createConnection(dbConfig)
    
    // 검색 조건 설정
    let whereClause = 'WHERE 1=1'
    const queryParams: any[] = []
    
    if (search) {
      whereClause += ' AND (pattern_master_name LIKE ? OR pattern_master_desc LIKE ? OR pattern_master_id LIKE ?)'
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }
    
    // 전체 개수 조회
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM tbl_meta_pattern_master 
      ${whereClause}
    `
    const [countResult] = await connection.execute(countQuery, queryParams)
    const totalCount = (countResult as any[])[0].total
    
    // 페이징 계산
    const offset = (Number(page) - 1) * Number(limit)
    
    // 메타 패턴 마스터 목록 조회
    const selectQuery = `
      SELECT 
        idx,
        pattern_master_name,
        pattern_master_id,
        pattern_master_desc,
        crdt_id,
        crdt_dt
      FROM tbl_meta_pattern_master 
      ${whereClause}
      ORDER BY crdt_dt DESC
      LIMIT ? OFFSET ?
    `
    
    const [rows] = await connection.execute(selectQuery, [...queryParams, Number(limit), offset])
    
    return {
      success: true,
      message: 'Meta patterns retrieved successfully',
      data: {
        patterns: rows,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalCount,
          totalPages: Math.ceil(totalCount / Number(limit))
        }
      },
      timestamp: new Date().toISOString()
    }
    
  } catch (error) {
    console.error('메타 패턴 목록 조회 API 오류:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: {
        success: false,
        message: 'Failed to retrieve meta patterns',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    })
  } finally {
    if (connection) {
      await connection.end()
    }
  }
})
