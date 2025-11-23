import mysql from 'mysql2/promise'
import { dbConfig } from '~/server/utils/dbConfig'

export default defineEventHandler(async (event) => {
  let connection
  
  try {
    // MySQL 연결 설정
    connection = await mysql.createConnection(dbConfig)
    
    // tbl_livestock_room에서 room_number 조회
    const selectQuery = `
      SELECT DISTINCT room_number 
      FROM tbl_livestock_room 
      WHERE room_number IS NOT NULL 
      ORDER BY room_number ASC
    `
    
    const [rows] = await connection.execute(selectQuery)
    
    return {
      success: true,
      data: {
        rooms: rows
      }
    }
    
  } catch (error: any) {
    console.error('축사 목록 조회 오류:', error)
    
    return {
      success: false,
      message: '축사 목록을 조회하는 중 오류가 발생했습니다.',
      error: error?.message || '알 수 없는 오류'
    }
    
  } finally {
    if (connection) {
      await connection.end()
    }
  }
})