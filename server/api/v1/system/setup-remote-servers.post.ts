import mysql from 'mysql2/promise'
import { dbConfig } from '~/server/utils/dbConfig'
import { readFileSync } from 'fs'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  try {
    const connection = await mysql.createConnection(dbConfig)
    
    // SQL 파일 읽기
    const sqlFilePath = join(process.cwd(), 'database', 'remote_servers_table.sql')
    const sqlContent = readFileSync(sqlFilePath, 'utf-8')
    
    // SQL 문을 세미콜론으로 분리하여 각각 실행
    const sqlStatements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0)
    
    for (const statement of sqlStatements) {
      await connection.execute(statement)
    }
    
    await connection.end()
    
    return {
      success: true,
      message: '원격 서버 관리 테이블이 성공적으로 생성되었습니다.'
    }
  } catch (error) {
    console.error('테이블 생성 실패:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '테이블 생성 중 오류가 발생했습니다: ' + error.message
    })
  }
})

















