// 실시간 급이량 조회 API
import mysql from 'mysql2/promise'
import { defineEventHandler, getQuery, createError } from 'h3'

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
    const query = getQuery(event)
    const { 
      page = 1, 
      limit = 50, 
      search = '', 
      gwid = '', 
      devid = '', 
      tagnum = '',
      start_date = '',
      end_date = ''
    } = query
    
    console.log('실시간 급이량 조회 API 호출됨:', query)
    
    // 데이터베이스 연결
    connection = await mysql.createConnection(dbConfig)
    
    // 검색 조건 설정
    let whereClause = 'WHERE 1=1'
    const queryParams: any[] = []
    
    // 돈방번호 필터
    if (gwid) {
      whereClause += ' AND gwid = ?'
      queryParams.push(gwid)
    }
    
    // 기기번호 필터
    if (devid) {
      whereClause += ' AND devid = ?'
      queryParams.push(devid)
    }
    
    // 태그번호 필터
    if (tagnum) {
      whereClause += ' AND tagnum = ?'
      queryParams.push(tagnum)
    }
    
    // 날짜 범위 필터
    if (start_date && end_date) {
      whereClause += ' AND DATE(rcvtime) BETWEEN ? AND ?'
      queryParams.push(start_date, end_date)
    } else if (start_date) {
      whereClause += ' AND DATE(rcvtime) >= ?'
      queryParams.push(start_date)
    } else if (end_date) {
      whereClause += ' AND DATE(rcvtime) <= ?'
      queryParams.push(end_date)
    }
    
    // 검색어 필터
    if (search) {
      whereClause += ' AND (gwid LIKE ? OR devid LIKE ? OR tagnum LIKE ?)'
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }
    
    // 전체 개수 조회
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM tbl_raw_sen_intime 
      ${whereClause}
    `
    const [countResult] = await connection.execute(countQuery, queryParams)
    const totalCount = (countResult as any[])[0].total
    
    // 페이징 계산
    const offset = (Number(page) - 1) * Number(limit)
    
    // 실시간 급이량 목록 조회
    const selectQuery = `
      SELECT 
        idx,
        gwid,
        devid,
        rcvtime,
        eatfeed,
        tagnum,
        mngnum
      FROM tbl_raw_sen_intime 
      ${whereClause}
      ORDER BY rcvtime DESC, idx DESC
      LIMIT ? OFFSET ?
    `
    
    const [rows] = await connection.execute(selectQuery, [...queryParams, Number(limit), offset])
    
    // 통계 정보 조회
    const statsQuery = `
      SELECT 
        COUNT(*) as total_records,
        COUNT(DISTINCT gwid) as unique_rooms,
        COUNT(DISTINCT devid) as unique_devices,
        COUNT(DISTINCT tagnum) as unique_tags,
        SUM(eatfeed) as total_feed,
        AVG(eatfeed) as avg_feed,
        MAX(eatfeed) as max_feed,
        MIN(eatfeed) as min_feed
      FROM tbl_raw_sen_intime 
      ${whereClause}
    `
    const [statsResult] = await connection.execute(statsQuery, queryParams)
    
    // 최근 급이량 추이 (시간별)
    const trendQuery = `
      SELECT 
        DATE_FORMAT(rcvtime, '%Y-%m-%d %H:00:00') as hour_group,
        COUNT(*) as record_count,
        SUM(eatfeed) as total_feed,
        AVG(eatfeed) as avg_feed
      FROM tbl_raw_sen_intime 
      ${whereClause}
      GROUP BY DATE_FORMAT(rcvtime, '%Y-%m-%d %H:00:00')
      ORDER BY hour_group DESC
      LIMIT 24
    `
    const [trendResult] = await connection.execute(trendQuery, queryParams)
    
    return {
      success: true,
      message: 'Real-time feeding data retrieved successfully',
      data: {
        records: rows,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalCount,
          totalPages: Math.ceil(totalCount / Number(limit))
        },
        statistics: (statsResult as any[])[0],
        trend: trendResult
      },
      timestamp: new Date().toISOString()
    }
    
  } catch (error) {
    console.error('실시간 급이량 조회 API 오류:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: {
        success: false,
        message: 'Failed to retrieve real-time feeding data',
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


