import mysql from 'mysql2/promise'
import CryptoJS from 'crypto-js'
import jwt from 'jsonwebtoken'
import { dbConfig } from '~/server/utils/dbConfig'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { member_id, member_pwd } = body
    
    if (!member_id || !member_pwd) {
      throw createError({
        statusCode: 400,
        statusMessage: '아이디와 비밀번호를 입력해주세요.'
      })
    }
    
    const connection = await mysql.createConnection(dbConfig)
    
    // 회원 정보 조회
    const [rows] = await connection.execute(`
      SELECT 
        member_seq, member_id, member_pwd, member_name, member_nickname,
        member_location, member_gubun, member_mobile, member_email,
        mileage, member_pic, status, temp_status
      FROM tbl_member 
      WHERE member_id = ? AND status = 1 AND temp_status = 0
    `, [member_id])
    
    await connection.end()
    
    if (!Array.isArray(rows) || rows.length === 0) {
      return {
        retcode: 'fail',
        retmsg: '존재하지 않는 회원이거나 비활성화된 계정입니다.'
      }
    }
    
    const member = rows[0] as any
    
    // 비밀번호 검증 (SHA256 방식)
    let passwordMatch = false
    
    // 클라이언트에서 이미 SHA256으로 해시된 비밀번호가 전송됨
    const receivedHashedPwd = member_pwd
    
    // DB에 저장된 비밀번호가 SHA256 해시인지 평문인지 확인
    if (member.member_pwd.length === 64 && /^[a-f0-9]+$/i.test(member.member_pwd)) {
      // 이미 SHA256으로 해시된 비밀번호
      passwordMatch = receivedHashedPwd === member.member_pwd
    } 
    
    if (!passwordMatch) {
      return {
        retcode: 'fail',
        retmsg: '아이디 또는 비밀번호가 올바르지 않습니다.'
      }
    }
    
    // JWT 토큰 생성
    const secretKey = process.env.JWT_SECRET || 'your-secret-key'
    const token = jwt.sign(
      { 
        member_seq: member.member_seq,
        member_id: member.member_id,
        member_name: member.member_name,
        member_gubun: member.member_gubun
      },
      secretKey,
      { expiresIn: '24h' }
    )
    
    // 토큰을 데이터베이스에 저장
    const tokenConnection = await mysql.createConnection(dbConfig)
    await tokenConnection.execute(`
      UPDATE tbl_member 
      SET member_token = ?, mdfy_date = NOW() 
      WHERE member_seq = ?
    `, [token, member.member_seq])
    await tokenConnection.end()
    
    // 쿠키에 토큰 설정
    setCookie(event, 'auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 // 24시간
    })
    
    // 민감한 정보 제거
    delete member.member_pwd
    delete member.token_id
    delete member.member_token
    delete member.serverAuthCode
    delete member.temp_token
    
    return {
      retcode: 'success',
      retmsg: '로그인에 성공했습니다.',
      data: {
        ...member,
        token: token
      }
    }
    
  } catch (error) {
    console.error('Login error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '로그인 처리 중 오류가 발생했습니다.'
    })
  }
})
