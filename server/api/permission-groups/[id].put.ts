// 권한 그룹 수정 API
export default defineEventHandler(async (event) => {
  try {
    const groupId = parseInt(getRouterParam(event, 'id') || '0')
    const body = await readBody(event)
    
    console.log('권한 그룹 수정 API 호출됨:', groupId, body)
    
    if (!groupId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: {
          success: false,
          message: 'Invalid group ID',
          timestamp: new Date().toISOString()
        }
      })
    }
    
    // 실제 구현에서는 데이터베이스에서 권한 그룹을 업데이트
    const updatedGroup = {
      id: groupId,
      name: body.name || '권한 그룹',
      description: body.description || '',
      color: body.color || '#007bff',
      permissions: body.permissions || [],
      updatedAt: new Date().toISOString()
    }
    
    return {
      success: true,
      message: 'Permission group updated successfully',
      data: updatedGroup,
      timestamp: new Date().toISOString()
    }
    
  } catch (error) {
    console.error('권한 그룹 수정 API 오류:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: {
        success: false,
        message: 'Failed to update permission group',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    })
  }
})


