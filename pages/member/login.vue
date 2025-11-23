<template>
  <div class="login-container">
    <!-- 좌측 배경 영역 -->
    <div class="login-left">
      <div class="tech-background">
        <!-- 로고 이미지 추가 -->
        <div class="logo-container">
          <img src="/assets/images/full_logo.png" alt="AI-LSMMS Full Logo" class="full-logo" />
        </div>
        <br></br>
        <!-- 기술적 배경 요소들 -->
        <div class="gear-container">
          <div class="gear gear-1">
            <div class="gear-inner">
              <div class="gear-teeth"></div>
              <div class="gear-teeth"></div>
              <div class="gear-teeth"></div>
              <div class="gear-teeth"></div>
              <div class="gear-teeth"></div>
              <div class="gear-teeth"></div>
              <div class="gear-teeth"></div>
              <div class="gear-teeth"></div>
            </div>
          </div>
          <div class="gear gear-2">
            <div class="gear-inner">
              <div class="gear-teeth"></div>
              <div class="gear-teeth"></div>
              <div class="gear-teeth"></div>
              <div class="gear-teeth"></div>
              <div class="gear-teeth"></div>
              <div class="gear-teeth"></div>
            </div>
          </div>
        </div>
    
    
      </div>
    </div>

    <!-- 우측 로그인 폼 영역 -->
    <div class="login-right">
      <div class="login-form-container">
        <!-- 로고 -->
        <div class="logo-section">
          <img src="/assets/images/logo.png" alt="LSMMS Logo" class="logo-image" />
        </div>

        <!-- 로그인 폼 -->
        <div class="login-form">
          <h1 class="login-title">LLM 기반 스마트양돈관리시스템 로그인</h1>
          
        
          <!-- 로그인 폼 -->
          <form @submit.prevent="handleLogin" class="login-form-content">
            <div class="input-group">
              <label for="member_id" class="input-label">
                <i class="bi bi-person"></i>
                아이디
              </label>
              <input 
                type="text" 
                v-model="form.member_id" 
                id="member_id" 
                class="form-input"
                placeholder="admin"
                required
              >
            </div>

            <div class="input-group">
              <label for="member_pwd" class="input-label">
                <i class="bi bi-lock"></i>
                비밀번호
              </label>
              <input 
                type="password" 
                v-model="form.member_pwd" 
                id="member_pwd" 
                class="form-input"
                placeholder="••••••••"
                required
              >
            </div>

            <button 
              type="submit" 
              class="login-btn"
              :disabled="loading"
            >
              {{ loading ? '로그인 중...' : 'LOGIN' }}
            </button>
          </form>

          <!-- 하단 정보 -->
          <div class="login-info">
            <div class="info-message">
              <i class="bi bi-info-circle"></i>
              <span>사용 권한이 없으신 분은 사용신청을하신 후 이용가능합니다.</span>
            </div>
            <div class="info-links">
              <NuxtLink to="/member/register" class="info-link">사용신청하기 +</NuxtLink>
              <NuxtLink to="/member/resetpassword" class="info-link">비밀번호 변경 비밀번호 문의</NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CryptoJS from 'crypto-js'

// Set page meta
definePageMeta({
  layout: false
})

// Use head for SEO
useHead({
  title: 'Login - LSMMS Admin',
  meta: [
    { name: 'description', content: 'Login to LSMMS Admin panel' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' },
    { rel: 'icon', href: '/favicon-16x16.png', sizes: '16x16' },
    { rel: 'icon', href: '/favicon-32x32.png', sizes: '32x32' },
    { rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: '180x180' },
    { rel: 'manifest', href: '/site.webmanifest' }
  ]
})

// Reactive data
const form = ref({
  member_id: '',
  member_pwd: '',
  remember: false
})

const loading = ref(false)
const loginType = ref('eam') // 기본값을 EAM으로 설정

// Methods
const handleLogin = async () => {
  loading.value = true
  
  try {
    // 입력값 검증
    if (!form.value.member_id.trim()) {
      alert('회원 ID를 입력해주세요.')
      return
    }
    
    if (!form.value.member_pwd.trim()) {
      alert('비밀번호를 입력해주세요.')
      return
    }
    
    // 비밀번호를 SHA256으로 암호화
    const hashedPassword = CryptoJS.SHA256(form.value.member_pwd).toString()
    
    const response = await $fetch('/api/member/login', {
      method: 'POST',
      body: {
        member_id: form.value.member_id.trim(),
        member_pwd: hashedPassword
      },
      credentials: 'include'
    })

    if (response.retcode === 'success') {
      // 로그인 성공 메시지
      alert(`${response.data.member_name}님, 환영합니다!`)
      
      // 메인 대시보드로 이동
      await navigateTo('/')
    } else {
      alert(response.retmsg || '로그인에 실패했습니다.')
    }
  } catch (error) {
    console.error('Login error:', error)
    
    if (error.statusCode === 400) {
      alert(error.statusMessage || '입력 정보를 확인해주세요.')
    } else if (error.statusCode === 500) {
      alert('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    } else {
      alert('로그인 처리 중 오류가 발생했습니다.')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 전체 컨테이너 */
.login-container {
  display: flex;
  min-height: 100vh;
  width: 100%;
}

/* 좌측 배경 영역 */
.login-left {
  flex: 1;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  position: relative;
  overflow: hidden;
}

.tech-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 30%, rgba(0, 150, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(0, 200, 255, 0.1) 0%, transparent 50%);
}

/* 로고 컨테이너 */
.logo-container {
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  text-align: center;
}

.full-logo {
  max-width: 300px;
  width: 100%;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 0 20px rgba(0, 150, 255, 0.3));
  animation: logoGlow 3s ease-in-out infinite alternate;
}

@keyframes logoGlow {
  0% {
    filter: drop-shadow(0 0 20px rgba(0, 150, 255, 0.3));
    transform: scale(1);
  }
  100% {
    filter: drop-shadow(0 0 30px rgba(0, 200, 255, 0.5));
    transform: scale(1.02);
  }
}

/* 기어 애니메이션 */
.gear-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.gear {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(45deg, #00a8ff, #0097e6);
  box-shadow: 
    0 0 20px rgba(0, 168, 255, 0.5),
    inset 0 0 20px rgba(255, 255, 255, 0.1);
  animation: rotate 20s linear infinite;
}

.gear-1 {
  width: 200px;
  height: 200px;
  top: -100px;
  left: -100px;
}

.gear-2 {
  width: 120px;
  height: 120px;
  top: -60px;
  left: 80px;
  animation-direction: reverse;
  animation-duration: 15s;
}

.gear-inner {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.gear-teeth {
  position: absolute;
  width: 8px;
  height: 20px;
  background: #00a8ff;
  border-radius: 4px;
  box-shadow: 0 0 10px rgba(0, 168, 255, 0.8);
}

.gear-1 .gear-teeth:nth-child(1) { top: 0; left: 50%; transform: translateX(-50%); }
.gear-1 .gear-teeth:nth-child(2) { top: 14.6%; right: 0; transform: rotate(45deg); }
.gear-1 .gear-teeth:nth-child(3) { top: 50%; right: 0; transform: translateY(-50%) rotate(90deg); }
.gear-1 .gear-teeth:nth-child(4) { bottom: 14.6%; right: 0; transform: rotate(135deg); }
.gear-1 .gear-teeth:nth-child(5) { bottom: 0; left: 50%; transform: translateX(-50%) rotate(180deg); }
.gear-1 .gear-teeth:nth-child(6) { bottom: 14.6%; left: 0; transform: rotate(225deg); }
.gear-1 .gear-teeth:nth-child(7) { top: 50%; left: 0; transform: translateY(-50%) rotate(270deg); }
.gear-1 .gear-teeth:nth-child(8) { top: 14.6%; left: 0; transform: rotate(315deg); }

.gear-2 .gear-teeth:nth-child(1) { top: 0; left: 50%; transform: translateX(-50%); }
.gear-2 .gear-teeth:nth-child(2) { top: 25%; right: 0; transform: rotate(60deg); }
.gear-2 .gear-teeth:nth-child(3) { top: 50%; right: 0; transform: translateY(-50%) rotate(120deg); }
.gear-2 .gear-teeth:nth-child(4) { bottom: 25%; right: 0; transform: rotate(180deg); }
.gear-2 .gear-teeth:nth-child(5) { bottom: 0; left: 50%; transform: translateX(-50%) rotate(240deg); }
.gear-2 .gear-teeth:nth-child(6) { top: 25%; left: 0; transform: rotate(300deg); }

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 회로 패턴 */
.circuit-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.circuit-line {
  position: absolute;
  background: linear-gradient(90deg, transparent, #00a8ff, transparent);
  height: 2px;
  opacity: 0.6;
}

.circuit-line:nth-child(1) {
  top: 20%;
  left: 10%;
  width: 30%;
  transform: rotate(15deg);
}

.circuit-line:nth-child(2) {
  top: 60%;
  right: 15%;
  width: 25%;
  transform: rotate(-20deg);
}

.circuit-line:nth-child(3) {
  bottom: 30%;
  left: 20%;
  width: 40%;
  transform: rotate(10deg);
}

.circuit-dot {
  position: absolute;
  width: 6px;
  height: 6px;
  background: #00a8ff;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(0, 168, 255, 0.8);
  animation: pulse 2s ease-in-out infinite;
}

.circuit-dot:nth-child(4) { top: 25%; left: 15%; animation-delay: 0s; }
.circuit-dot:nth-child(5) { top: 45%; right: 20%; animation-delay: 0.5s; }
.circuit-dot:nth-child(6) { bottom: 35%; left: 25%; animation-delay: 1s; }
.circuit-dot:nth-child(7) { bottom: 15%; right: 30%; animation-delay: 1.5s; }

@keyframes pulse {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

/* 글로우 효과 */
.glow-effects {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.glow-point {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #00a8ff;
  border-radius: 50%;
  box-shadow: 0 0 20px rgba(0, 168, 255, 0.8);
  animation: twinkle 3s ease-in-out infinite;
}

.glow-point:nth-child(1) { top: 15%; left: 25%; animation-delay: 0s; }
.glow-point:nth-child(2) { top: 35%; right: 30%; animation-delay: 1s; }
.glow-point:nth-child(3) { bottom: 25%; left: 40%; animation-delay: 2s; }
.glow-point:nth-child(4) { bottom: 45%; right: 15%; animation-delay: 0.5s; }

@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.5); }
}

/* 우측 로그인 폼 영역 */
.login-right {
  flex: 1;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.login-form-container {
  width: 100%;
  max-width: 400px;
}

/* 로고 섹션 */
.logo-section {
  text-align: center;
  margin-bottom: 40px;
}

.logo-image {
  max-height: 60px;
  width: auto;
}

/* 로그인 폼 */
.login-form {
  background: #ffffff;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.login-title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  text-align: center;
  margin-bottom: 30px;
}

/* 로그인 타입 선택 */
.login-type-selector {
  display: flex;
  margin-bottom: 30px;
  background: #f8f9fa;
  border-radius: 10px;
  padding: 4px;
}

.login-type-btn {
  flex: 1;
  padding: 12px 20px;
  border: none;
  background: transparent;
  color: #6c757d;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.login-type-btn.active {
  background: #ffffff;
  color: #333;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 입력 필드 */
.input-group {
  margin-bottom: 20px;
}

.input-label {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.input-label i {
  margin-right: 8px;
  color: #6c757d;
}

.form-input {
  width: 100%;
  padding: 15px 20px;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: #ffffff;
}

.form-input:focus {
  outline: none;
  border-color: #00a8ff;
  box-shadow: 0 0 0 3px rgba(0, 168, 255, 0.1);
}

.form-input::placeholder {
  color: #adb5bd;
}

/* 로그인 버튼 */
.login-btn {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 20px;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.3);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* 하단 정보 */
.login-info {
  text-align: center;
}

.info-message {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
  font-size: 14px;
  color: #6c757d;
}

.info-message i {
  margin-right: 8px;
  color: #00a8ff;
}

.info-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-link {
  color: #00a8ff;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.3s ease;
}

.info-link:hover {
  color: #0097e6;
  text-decoration: underline;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
  }
  
  .logo-container {
    top: 15%;
  }
  
  .full-logo {
    max-width: 200px;
  }
  
  .login-left {
    min-height: 40vh;
  }
  
  .gear-1 {
    width: 150px;
    height: 150px;
    top: -75px;
    left: -75px;
  }
  
  .gear-2 {
    width: 90px;
    height: 90px;
    top: -45px;
    left: 60px;
  }
  
  .login-form {
    padding: 30px 20px;
  }
  
  .login-title {
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .login-right {
    padding: 20px;
  }
  
  .login-form {
    padding: 25px 15px;
  }
  
  .login-type-selector {
    flex-direction: column;
    gap: 4px;
  }
  
  .info-links {
    flex-direction: column;
    align-items: center;
  }
}
</style>
