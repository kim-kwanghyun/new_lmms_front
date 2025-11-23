import mysql from 'mysql2/promise'
import jwt from 'jsonwebtoken'
import { dbConfig } from '~/server/utils/dbConfig'

export default defineEventHandler(async (event) => {
  try {
    // 쿠키에서 토큰 가져오기
    const token = getCookie(event, 'auth-token')
    
    if (!token) {
      return {
        retcode: 'fail',
        retmsg: '인증 토큰이 없습니다.'
      }
    }
    
    // JWT 토큰 검증
    const secretKey = process.env.JWT_SECRET || 'your-secret-key'
    let decoded: any
    
    try {
      decoded = jwt.verify(token, secretKey)
    } catch (jwtError) {
      return {
        retcode: 'fail',
        retmsg: '유효하지 않은 토큰입니다.'
      }
    }
    
    // 데이터베이스에서 회원 정보 조회
    const connection = await mysql.createConnection(dbConfig)
    
    const [rows] = await connection.execute(`
      SELECT 
        member_seq, member_id, member_name, member_nickname,
        member_location, member_gubun, member_mobile, member_email,
        mileage, member_pic, status, temp_status, member_token
      FROM tbl_member 
      WHERE member_seq = ? AND status = 1 AND temp_status = 0
    `, [decoded.member_seq])
    
    await connection.end()
    
    if (!Array.isArray(rows) || rows.length === 0) {
      return {
        retcode: 'fail',
        retmsg: '존재하지 않는 회원이거나 비활성화된 계정입니다.'
      }
    }
    
    const member = rows[0] as any
    
    // 토큰이 DB에 저장된 것과 일치하는지 확인
    if (member.member_token !== token) {
      return {
        retcode: 'fail',
        retmsg: '토큰이 일치하지 않습니다.'
      }
    }
    
    // 민감한 정보 제거
    delete member.member_token
    
    return {
      retcode: 'success',
      retmsg: '인증이 확인되었습니다.',
      data: member
    }
    
  } catch (error) {
    console.error('Auth verification error:', error)
    return {
      retcode: 'fail',
      retmsg: '인증 확인 중 오류가 발생했습니다.'
    }
  }
})
