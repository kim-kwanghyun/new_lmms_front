// 돈방 센서 데이터 조회 API
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
      limit = 100, 
      gwid = '', 
      devid = '', 
      start_date = '',
      end_date = '',
      chart_type = 'hourly' // hourly, daily, raw
    } = query
    
    console.log('센서 데이터 조회 API 호출됨:', query)
    
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
    
    // 날짜 범위 필터 (rcvtime이 문자열 형태이므로 SUBSTRING 사용)
    if (start_date && end_date) {
      whereClause += ' AND SUBSTRING(rcvtime, 1, 8) BETWEEN ? AND ?'
      queryParams.push(start_date.replace(/-/g, ''), end_date.replace(/-/g, ''))
    } else if (start_date) {
      whereClause += ' AND SUBSTRING(rcvtime, 1, 8) >= ?'
      queryParams.push(start_date.replace(/-/g, ''))
    } else if (end_date) {
      whereClause += ' AND SUBSTRING(rcvtime, 1, 8) <= ?'
      queryParams.push(end_date.replace(/-/g, ''))
    }
    
    let selectQuery = ''
    let groupByClause = ''
    
    // 차트 타입에 따른 쿼리 구성
    if (chart_type === 'hourly') {
      // 시간별 평균 데이터
      selectQuery = `
        SELECT 
          CONCAT(
            SUBSTRING(rcvtime, 1, 4), '-',
            SUBSTRING(rcvtime, 5, 2), '-', 
            SUBSTRING(rcvtime, 7, 2), ' ',
            SUBSTRING(rcvtime, 9, 2), ':00:00'
          ) as time_group,
          gwid,
          devid,
          AVG(temp) as temp,
          AVG(humi) as humi,
          AVG(co2) as co2,
          AVG(nh3) as nh3,
          AVG(h2s) as h2s,
          AVG(res1) as res1,
          AVG(res2) as res2,
          AVG(res3) as res3,
          COUNT(*) as data_count
        FROM tbl_raw_sen_status 
        ${whereClause}
        GROUP BY gwid, devid, SUBSTRING(rcvtime, 1, 10)
        ORDER BY time_group DESC
        LIMIT 168
      `
    } else if (chart_type === 'daily') {
      // 일별 평균 데이터
      selectQuery = `
        SELECT 
          CONCAT(
            SUBSTRING(rcvtime, 1, 4), '-',
            SUBSTRING(rcvtime, 5, 2), '-', 
            SUBSTRING(rcvtime, 7, 2)
          ) as time_group,
          gwid,
          devid,
          AVG(temp) as temp,
          AVG(humi) as humi,
          AVG(co2) as co2,
          AVG(nh3) as nh3,
          AVG(h2s) as h2s,
          AVG(res1) as res1,
          AVG(res2) as res2,
          AVG(res3) as res3,
          MIN(temp) as min_temp,
          MAX(temp) as max_temp,
          MIN(humi) as min_humi,
          MAX(humi) as max_humi,
          COUNT(*) as data_count
        FROM tbl_raw_sen_status 
        ${whereClause}
        GROUP BY gwid, devid, SUBSTRING(rcvtime, 1, 8)
        ORDER BY time_group DESC
        LIMIT 30
      `
    } else {
      // 원본 데이터
      const offset = (Number(page) - 1) * Number(limit)
      selectQuery = `
        SELECT 
          idx,
          gwid,
          devid,
          rcvtime,
          temp,
          humi,
          co2,
          nh3,
          h2s,
          res1,
          res2,
          res3,
          alm1, alm2, alm3, alm4, alm5, alm6, alm7, alm8,
          almpwroff
        FROM tbl_raw_sen_status 
        ${whereClause}
        ORDER BY rcvtime DESC, idx DESC
        LIMIT ? OFFSET ?
      `
      queryParams.push(Number(limit), offset)
    }
    
    const [rows] = await connection.execute(selectQuery, queryParams)
    
    // 전체 개수 조회 (원본 데이터인 경우만)
    let totalCount = 0
    let pagination = null
    
    if (chart_type === 'raw') {
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM tbl_raw_sen_status 
        ${whereClause}
      `
      const [countResult] = await connection.execute(countQuery, queryParams.slice(0, -2))
      totalCount = (countResult as any[])[0].total
      
      pagination = {
        page: Number(page),
        limit: Number(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / Number(limit))
      }
    }
    
    // 통계 정보 조회
    const statsQuery = `
      SELECT 
        COUNT(*) as total_records,
        COUNT(DISTINCT gwid) as unique_rooms,
        COUNT(DISTINCT devid) as unique_devices,
        AVG(temp) as avg_temp,
        MIN(temp) as min_temp,
        MAX(temp) as max_temp,
        AVG(humi) as avg_humi,
        MIN(humi) as min_humi,
        MAX(humi) as max_humi,
        AVG(co2) as avg_co2,
        MAX(co2) as max_co2,
        AVG(nh3) as avg_nh3,
        MAX(nh3) as max_nh3,
        AVG(h2s) as avg_h2s,
        MAX(h2s) as max_h2s
      FROM tbl_raw_sen_status 
      ${whereClause}
    `
    const [statsResult] = await connection.execute(statsQuery, queryParams.slice(0, chart_type === 'raw' ? -2 : queryParams.length))
    
    // 돈방별 최신 상태 조회
    const latestStatusQuery = `
      SELECT 
        gwid,
        devid,
        rcvtime,
        temp,
        humi,
        co2,
        nh3,
        h2s,
        (CASE WHEN alm1 > 0 OR alm2 > 0 OR alm3 > 0 OR alm4 > 0 OR 
                   alm5 > 0 OR alm6 > 0 OR alm7 > 0 OR alm8 > 0 
              THEN 1 ELSE 0 END) as has_alarm
      FROM tbl_raw_sen_status t1
      WHERE rcvtime = (
        SELECT MAX(rcvtime) 
        FROM tbl_raw_sen_status t2 
        WHERE t2.gwid = t1.gwid AND t2.devid = t1.devid
        ${gwid ? ' AND t2.gwid = ' + gwid : ''}
        ${devid ? ' AND t2.devid = ' + devid : ''}
      )
      ${gwid ? 'AND gwid = ' + gwid : ''}
      ${devid ? 'AND devid = ' + devid : ''}
      ORDER BY gwid, devid
    `
    const [latestResult] = await connection.execute(latestStatusQuery)
    
    return {
      success: true,
      message: 'Sensor data retrieved successfully',
      data: {
        records: rows,
        pagination: pagination,
        statistics: (statsResult as any[])[0],
        latest_status: latestResult,
        chart_type: chart_type
      },
      timestamp: new Date().toISOString()
    }
    
  } catch (error) {
    console.error('센서 데이터 조회 API 오류:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: {
        success: false,
        message: 'Failed to retrieve sensor data',
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


