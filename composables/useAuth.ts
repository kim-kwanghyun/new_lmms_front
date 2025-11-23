import { ref, computed, readonly } from 'vue'
import CryptoJS from 'crypto-js'

interface Member {
  member_seq: number
  member_id: string
  member_name: string
  member_nickname?: string
  member_location?: string
  member_gubun: string
  member_mobile?: string
  member_email?: string
  mileage?: number
  member_pic?: string
  status: number
  temp_status: number
}

const user = ref<Member | null>(null)
const isAuthenticated = computed(() => !!user.value)

export const useAuth = () => {
  // 로그인 함수
  const login = async (credentials: { member_id: string; member_pwd: string }) => {
    try {
      // 비밀번호를 SHA256으로 암호화
      const hashedPassword = CryptoJS.SHA256(credentials.member_pwd).toString()
      
      const response = await $fetch('/api/member/login', {
        method: 'POST',
        body: {
          member_id: credentials.member_id,
          member_pwd: hashedPassword
        },
        credentials: 'include'
      })

      if (response.retcode === 'success') {
        user.value = response.data
        // 로그인 성공 시 메인 대시보드로 이동 (클라이언트에서 처리)
        return response
      } else {
        throw new Error(response.retmsg || '로그인에 실패했습니다.')
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  // 로그아웃 함수
  const logout = async () => {
    try {
      await $fetch('/api/member/logout', {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      user.value = null
      await navigateTo('/member/login')
    }
  }

  // 사용자 정보 확인
  const verifyAuth = async () => {
    try {
      const response = await $fetch('/api/member/verify', {
        method: 'GET',
        credentials: 'include'
      })

      if (response.retcode === 'success') {
        user.value = response.data
        return true
      } else {
        user.value = null
        return false
      }
    } catch (error) {
      console.error('Auth verification error:', error)
      user.value = null
      return false
    }
  }

  // 페이지 보호 함수
  const requireAuth = async () => {
    const isValid = await verifyAuth()
    if (!isValid) {
      await navigateTo('/member/login')
      return false
    }
    return true
  }

  // 관리자 권한 확인
  const requireAdmin = async () => {
    const isValid = await requireAuth()
    if (!isValid) return false

    if (user.value?.member_gubun !== '1') {
      throw createError({
        statusCode: 403,
        statusMessage: '관리자 권한이 필요합니다.'
      })
    }
    return true
  }

  // 사용자 정보 새로고침
  const refreshUser = async () => {
    return await verifyAuth()
  }

  return {
    user: readonly(user),
    isAuthenticated,
    login,
    logout,
    verifyAuth,
    requireAuth,
    requireAdmin,
    refreshUser
  }
}
