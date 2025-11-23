import { getPool } from '~/server/utils/dbConfig'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    console.log('Received registration data:', body)
    
    // 필수 필드 검증 (안전한 문자열 처리)
    const requiredFields = ['member_id', 'member_name', 'member_email', 'member_mobile', 'member_gubun', 'member_pwd']
    for (const field of requiredFields) {
      const value = body[field]
      if (!value || (typeof value === 'string' && value.trim() === '') || (typeof value !== 'string' && !value)) {
        throw createError({
          statusCode: 400,
          statusMessage: `${field}는 필수 입력 항목입니다.`
        })
      }
    }

    // 문자열 필드들을 안전하게 처리
    const memberId = String(body.member_id).trim()
    const memberName = String(body.member_name).trim()
    const memberEmail = String(body.member_email).trim()
    const memberMobile = String(body.member_mobile).trim()
    const memberGubun = Number(body.member_gubun) || 1 // 기본값 1 (일반회원)
    const memberLocation = body.member_location ? String(body.member_location).trim() : null
    const memberNickname = body.member_nickname ? String(body.member_nickname).trim() : null
    const recommender = body.recommender ? String(body.recommender).trim() : ''
    const memberPwd = String(body.member_pwd)

    // 데이터베이스 연결 풀 가져오기
    const pool = getPool()
    const connection = await pool.getConnection()

    try {
      // 회원 ID 중복 확인 (이메일을 회원 ID로 사용)
      const checkIdQuery = 'SELECT member_id FROM tbl_member WHERE member_id = ? AND status = 1'
      const [existingMember] = await connection.execute(checkIdQuery, [memberId])
      
      if (Array.isArray(existingMember) && existingMember.length > 0) {
        throw createError({
          statusCode: 409,
          statusMessage: '이미 사용 중인 회원 ID입니다.'
        })
      }

      // 이메일 중복 확인
      const checkEmailQuery = 'SELECT member_email FROM tbl_member WHERE member_email = ? AND status = 1'
      const [existingEmail] = await connection.execute(checkEmailQuery, [memberEmail])
      
      if (Array.isArray(existingEmail) && existingEmail.length > 0) {
        throw createError({
          statusCode: 409,
          statusMessage: '이미 사용 중인 이메일입니다.'
        })
      }

      // 회원 등록
      const insertQuery = `
        INSERT INTO tbl_member (
          member_id, member_name, member_email, member_mobile, 
          member_gubun, member_location, member_nickname, 
          recommender, member_pwd, status, crdt_date, crdt_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), ?)
      `
      
      const insertParams = [
        memberId,
        memberName,
        memberEmail,
        memberMobile,
        memberGubun,
        memberLocation,
        memberNickname,
        recommender,
        memberPwd,
        memberId // crdt_id로 회원 ID 사용
      ]

      console.log('Insert parameters:', insertParams)

      const [result] = await connection.execute(insertQuery, insertParams)
      
      if (result && typeof result === 'object' && 'affectedRows' in result && result.affectedRows > 0) {
        return {
          retcode: 'success',
          retmsg: '회원가입이 완료되었습니다.',
          data: {
            member_seq: result.insertId,
            member_id: memberId,
            member_name: memberName
          }
        }
      } else {
        throw createError({
          statusCode: 500,
          statusMessage: '회원가입 처리 중 오류가 발생했습니다.'
        })
      }
    } finally {
      connection.release()
    }

  } catch (error: any) {
    console.error('Member registration error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: '서버 오류가 발생했습니다.'
    })
  }
})
