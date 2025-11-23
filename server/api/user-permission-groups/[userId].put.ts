// 사용자의 권한 그룹 할당 API
export default defineEventHandler(async (event) => {
  try {
    const userId = parseInt(getRouterParam(event, 'userId') || '0')
    const body = await readBody(event)
    
    console.log('사용자 권한 그룹 할당 API 호출됨:', userId, body)
    
    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: {
          success: false,
          message: 'Invalid user ID',
          timestamp: new Date().toISOString()
        }
      })
    }
    
    if (!Array.isArray(body.permissionGroupIds)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: {
          success: false,
          message: 'Permission group IDs must be an array',
          timestamp: new Date().toISOString()
        }
      })
    }
    
    // 실제 구현에서는 데이터베이스에서 사용자의 권한 그룹을 업데이트
    const result = {
      userId: userId,
      permissionGroupIds: body.permissionGroupIds,
      updatedAt: new Date().toISOString()
    }
    
    return {
      success: true,
      message: 'User permission groups updated successfully',
      data: result,
      timestamp: new Date().toISOString()
    }
    
  } catch (error) {
    console.error('사용자 권한 그룹 할당 API 오류:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: {
        success: false,
        message: 'Failed to update user permission groups',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    })
  }
})


