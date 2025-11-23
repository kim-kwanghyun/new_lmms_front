<template>
  <div class="vertical-layout vertical-menu blank-page">
    <div class="container-fluid">
      <div class="row justify-content-center">
        <div class="col-12 col-md-8 col-lg-6 col-xl-5">
          <div class="card bg-authentication rounded-0 mb-0">
            <div class="row m-0">
              <div class="col-12 p-0">
                <div class="card rounded-0 mb-0 p-2">
                  <div class="card-header pb-1">
                    <div class="card-title">
                      <h4 class="mb-0 text-center">회원가입</h4>
                    </div>
                  </div>
                  <p class="px-2 text-center">새 계정을 만들어 서비스를 이용해보세요</p>
                  
                  <div class="card-content">
                    <div class="card-body pt-1">
                      <form @submit.prevent="handleRegister">
                         <!-- 이메일 입력 -->
                         <fieldset class="form-label-group mb-3 position-relative has-icon-left">
                          <input 
                            v-model="form.member_email"
                            type="email"
                            class="form-control"
                            :class="{ 'is-invalid': errors.member_email }"
                            id="user-member-email"
                            placeholder=""
                            required
                            :disabled="loading"
                          >
                          <div class="form-control-position">
                            <i class="bi bi-envelope"></i>
                          </div>
                          <label for="user-member-email">이메일</label>
                          <div v-if="errors.member_email" class="invalid-feedback">
                            {{ errors.member_email }}
                          </div>
                        </fieldset>


                        <!-- 회원명 입력 -->
                        <fieldset class="form-label-group mb-3 position-relative has-icon-left">
                          <input 
                            v-model="form.member_name"
                            type="text"
                            class="form-control"
                            :class="{ 'is-invalid': errors.member_name }"
                            id="user-member-name"
                            placeholder=""
                            required
                            :disabled="loading"
                          >
                          <div class="form-control-position">
                            <i class="bi bi-person-badge"></i>
                          </div>
                          <label for="user-member-name">회원명</label>
                          <div v-if="errors.member_name" class="invalid-feedback">
                            {{ errors.member_name }}
                          </div>
                        </fieldset>

                       
                        <!-- 휴대폰 번호 입력 -->
                        <fieldset class="form-label-group mb-3 position-relative has-icon-left">
                          <input 
                            v-model="form.member_mobile"
                            type="tel"
                            class="form-control"
                            :class="{ 'is-invalid': errors.member_mobile }"
                            id="user-member-mobile"
                            placeholder=""
                            required
                            :disabled="loading"
                          >
                          <div class="form-control-position">
                            <i class="bi bi-phone"></i>
                          </div>
                          <label for="user-member-mobile">휴대폰 번호</label>
                          <div v-if="errors.member_mobile" class="invalid-feedback">
                            {{ errors.member_mobile }}
                          </div>
                        </fieldset>

                      

                        <!-- 지역 입력 -->
                        <fieldset class="form-label-group mb-3 position-relative has-icon-left">
                          <input 
                            v-model="form.member_location"
                            type="text"
                            class="form-control"
                            :class="{ 'is-invalid': errors.member_location }"
                            id="user-member-location"
                            placeholder=""
                            :disabled="loading"
                          >
                          <div class="form-control-position">
                            <i class="bi bi-geo-alt"></i>
                          </div>
                          <label for="user-member-location">지역 (선택사항)</label>
                          <div v-if="errors.member_location" class="invalid-feedback">
                            {{ errors.member_location }}
                          </div>
                        </fieldset>

                        <!-- 별칭 입력 -->
                        <fieldset class="form-label-group mb-3 position-relative has-icon-left">
                          <input 
                            v-model="form.member_nickname"
                            type="text"
                            class="form-control"
                            :class="{ 'is-invalid': errors.member_nickname }"
                            id="user-member-nickname"
                            placeholder=""
                            :disabled="loading"
                          >
                          <div class="form-control-position">
                            <i class="bi bi-tag"></i>
                          </div>
                          <label for="user-member-nickname">별칭 (선택사항)</label>
                          <div v-if="errors.member_nickname" class="invalid-feedback">
                            {{ errors.member_nickname }}
                          </div>
                        </fieldset>

                        <!-- 추천인 코드 입력 -->
                        <fieldset class="form-label-group mb-3 position-relative has-icon-left">
                          <input 
                            v-model="form.recommender"
                            type="text"
                            class="form-control"
                            :class="{ 'is-invalid': errors.recommender }"
                            id="user-recommender"
                            placeholder=""
                            :disabled="loading"
                          >
                          <div class="form-control-position">
                            <i class="bi bi-gift"></i>
                          </div>
                          <label for="user-recommender">추천인 코드 (선택사항)</label>
                          <div v-if="errors.recommender" class="invalid-feedback">
                            {{ errors.recommender }}
                          </div>
                        </fieldset>

                        <!-- 비밀번호 입력 -->
                        <fieldset class="form-label-group mb-3 position-relative has-icon-left">
                          <input 
                            v-model="form.member_pwd"
                            :type="showPassword ? 'text' : 'password'"
                            class="form-control"
                            :class="{ 'is-invalid': errors.member_pwd }"
                            id="user-member-pwd"
                            placeholder=""
                            required
                            :disabled="loading"
                          >
                          <div class="form-control-position">
                            <i class="bi bi-lock"></i>
                          </div>
                          <button 
                            type="button"
                            class="btn btn-link position-absolute"
                            style="right: 10px; top: 50%; transform: translateY(-50%); z-index: 10;"
                            @click="togglePassword"
                          >
                            <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                          </button>
                          <label for="user-member-pwd">비밀번호</label>
                          <div v-if="errors.member_pwd" class="invalid-feedback">
                            {{ errors.member_pwd }}
                          </div>
                        </fieldset>

                        <!-- 비밀번호 확인 -->
                        <fieldset class="form-label-group mb-3 position-relative has-icon-left">
                          <input 
                            v-model="form.confirmPassword"
                            :type="showConfirmPassword ? 'text' : 'password'"
                            class="form-control"
                            :class="{ 'is-invalid': errors.confirmPassword }"
                            id="user-confirm-password"
                            placeholder=""
                            required
                            :disabled="loading"
                          >
                          <div class="form-control-position">
                            <i class="bi bi-lock-fill"></i>
                          </div>
                          <button 
                            type="button"
                            class="btn btn-link position-absolute"
                            style="right: 10px; top: 50%; transform: translateY(-50%); z-index: 10;"
                            @click="toggleConfirmPassword"
                          >
                            <i :class="showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                          </button>
                          <label for="user-confirm-password">비밀번호 확인</label>
                          <div v-if="errors.confirmPassword" class="invalid-feedback">
                            {{ errors.confirmPassword }}
                          </div>
                        </fieldset>

                        <!-- 약관 동의 -->
                        <div class="form-check mb-3">
                          <input 
                            v-model="form.agreeTerms"
                            class="form-check-input"
                            :class="{ 'is-invalid': errors.agreeTerms }"
                            type="checkbox"
                            id="agree-terms"
                            required
                            :disabled="loading"
                          >
                          <label class="form-check-label" for="agree-terms">
                            <a href="#" class="text-decoration-none">이용약관</a> 및 
                            <a href="#" class="text-decoration-none">개인정보처리방침</a>에 동의합니다
                          </label>
                          <div v-if="errors.agreeTerms" class="invalid-feedback d-block">
                            {{ errors.agreeTerms }}
                          </div>
                        </div>

                        <!-- 회원가입 버튼 -->
                        <button 
                          type="submit"
                          class="btn btn-primary btn-lg w-100 mb-3"
                          :disabled="loading"
                        >
                          <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          {{ loading ? '처리 중...' : '회원가입' }}
                        </button>

                        <!-- 구분선 -->
                        <div class="divider my-3">
                          <div class="divider-text">또는</div>
                        </div>

                        <!-- 소셜 로그인 버튼들 -->
                        <div class="row">
                          <div class="col-6 mb-2">
                            <button type="button" class="btn btn-outline-primary w-100">
                              <i class="bi bi-google me-1"></i> Google
                            </button>
                          </div>
                          <div class="col-6 mb-2">
                            <button type="button" class="btn btn-outline-warning w-100">
                              <i class="bi bi-chat-fill me-1"></i> Kakao
                            </button>
                          </div>
                        </div>

                        <!-- 로그인 링크 -->
                        <div class="text-center mt-4">
                          <p class="mb-0">
                            이미 계정이 있으신가요? 
                            <NuxtLink to="/member/login" class="text-decoration-none fw-bold">로그인</NuxtLink>
                          </p>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Alert Modal -->
    <div 
      v-if="alert.show"
      class="modal fade show d-block"
      tabindex="-1"
      style="background-color: rgba(0,0,0,0.5);"
    >
      <div class="modal-dialog modal-sm modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-0">
            <h5 class="modal-title">
              <i :class="alert.type === 'success' ? 'bi bi-check-circle text-success' : 'bi bi-exclamation-triangle text-warning'"></i>
              {{ alert.type === 'success' ? '성공' : '알림' }}
            </h5>
          </div>
          <div class="modal-body">
            {{ alert.message }}
          </div>
          <div class="modal-footer border-0">
            <button type="button" class="btn btn-primary btn-sm" @click="closeAlert">확인</button>
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
  title: 'Register Member',
  meta: [
    { name: 'description', content: 'Register new member account' },
    { name: 'keywords', content: 'register, member, account, signup' }
  ]
})

// Reactive data
const form = ref({
  member_name: '',
  member_email: '',
  member_mobile: '',
  member_location: '',
  member_nickname: '',
  recommender: '',
  member_pwd: '',
  confirmPassword: '',
  agreeTerms: false
})

const loading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const errors = ref({})
const alert = ref({
  show: false,
  type: 'success',
  message: ''
})

// Methods
const validateForm = () => {
  errors.value = {}


  // 회원명 유효성 검사
  if (!form.value.member_name) {
    errors.value.member_name = '회원명을 입력해주세요.'
  } else if (form.value.member_name.length < 2) {
    errors.value.member_name = '회원명은 최소 2자 이상이어야 합니다.'
  }

  // 이메일 유효성 검사
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!form.value.member_email) {
    errors.value.member_email = '이메일을 입력해주세요.'
  } else if (!emailPattern.test(form.value.member_email)) {
    errors.value.member_email = '올바른 이메일 형식을 입력해주세요.'
  }

  // 휴대폰 번호 유효성 검사
  const mobilePattern = /^01[0-9]-?[0-9]{4}-?[0-9]{4}$/
  if (!form.value.member_mobile) {
    errors.value.member_mobile = '휴대폰 번호를 입력해주세요.'
  } else if (!mobilePattern.test(form.value.member_mobile.replace(/-/g, ''))) {
    errors.value.member_mobile = '올바른 휴대폰 번호를 입력해주세요.'
  }


  // 비밀번호 유효성 검사
  if (!form.value.member_pwd) {
    errors.value.member_pwd = '비밀번호를 입력해주세요.'
  } else if (form.value.member_pwd.length < 8) {
    errors.value.member_pwd = '비밀번호는 최소 8자 이상이어야 합니다.'
  } else if (!/(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(form.value.member_pwd)) {
    errors.value.member_pwd = '비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다.'
  }

  // 비밀번호 확인 검사
  if (!form.value.confirmPassword) {
    errors.value.confirmPassword = '비밀번호 확인을 입력해주세요.'
  } else if (form.value.member_pwd !== form.value.confirmPassword) {
    errors.value.confirmPassword = '비밀번호가 일치하지 않습니다.'
  }

  // 약관 동의 검사
  if (!form.value.agreeTerms) {
    errors.value.agreeTerms = '이용약관에 동의해주세요.'
  }

  return Object.keys(errors.value).length === 0
}

const showAlert = (type, message) => {
  alert.value = {
    show: true,
    type,
    message
  }
}

const closeAlert = () => {
  alert.value.show = false
  if (alert.value.type === 'success') {
    navigateTo('/member/login')
  }
}

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const toggleConfirmPassword = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

const handleRegister = async () => {
  // 폼 유효성 검사
  if (!validateForm()) {
    return
  }

  loading.value = true
  
  try {
    // 비밀번호를 SHA256으로 암호화
    const hashedPassword = CryptoJS.SHA256(form.value.member_pwd).toString()
    
    const response = await $fetch('/api/member/register', {
      method: 'POST',
      body: {
        member_id: form.value.member_email.trim(),
        member_name: form.value.member_name.trim(),
        member_email: form.value.member_email.trim(),
        member_mobile: form.value.member_mobile.trim(),
        member_gubun: 1,
        member_location: form.value.member_location.trim(),
        member_nickname: form.value.member_nickname.trim(),
        recommender: form.value.recommender.trim(),
        member_pwd: hashedPassword
      }
    })

    if (response.retcode === 'success') {
      showAlert('success', '회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.')
    } else {
      showAlert('error', response.retmsg || '회원가입에 실패했습니다.')
    }
  } catch (error) {
    console.error('Registration error:', error)
    
    if (error.statusCode === 400) {
      showAlert('error', error.statusMessage || '입력 정보를 확인해주세요.')
    } else if (error.statusCode === 409) {
      showAlert('error', '이미 사용 중인 회원 ID입니다.')
    } else if (error.statusCode === 500) {
      showAlert('error', '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    } else {
      showAlert('error', '회원가입 처리 중 오류가 발생했습니다.')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.vertical-layout.vertical-menu.blank-page {
  min-height: 100vh;
  background: #ffffff;
  display: flex;
  align-items: center;
  padding: 20px 0;
}

.card.bg-authentication {
  background: #ffffff;
  border: 1px solid #e9ecef;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  border-radius: 20px !important;
}

.card-header {
  background: transparent;
  border-bottom: none;
  padding-top: 2rem;
}

.card-title h4 {
  color: #2c3e50;
  font-weight: 600;
  font-size: 1.8rem;
}

.form-label-group {
  position: relative;
  margin-bottom: 1.5rem;
}

.form-label-group input {
  height: 50px;
  border-radius: 12px;
  border: 2px solid #e9ecef;
  padding-left: 3rem;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
}

.form-label-group input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
  background: white;
}

.form-label-group label {
  position: absolute;
  top: 50%;
  left: 3rem;
  transform: translateY(-50%);
  color: #6c757d;
  font-size: 1rem;
  transition: all 0.3s ease;
  pointer-events: none;
  background: transparent;
  padding: 0 5px;
}

.form-label-group input:focus + .form-control-position + label,
.form-label-group input:not(:placeholder-shown) + .form-control-position + label {
  top: 0;
  left: 1rem;
  font-size: 0.8rem;
  color: #667eea;
  background: white;
  font-weight: 500;
}

.form-control-position {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
  color: #6c757d;
  font-size: 1.1rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  height: 50px;
  font-weight: 600;
  font-size: 1rem;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.btn-outline-primary {
  border: 2px solid #667eea;
  color: #667eea;
  border-radius: 12px;
  height: 45px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-outline-primary:hover {
  background: #667eea;
  transform: translateY(-1px);
}

.btn-outline-warning {
  border: 2px solid #ffc107;
  color: #ffc107;
  border-radius: 12px;
  height: 45px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-outline-warning:hover {
  background: #ffc107;
  transform: translateY(-1px);
}

.divider {
  position: relative;
  text-align: center;
  margin: 1.5rem 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #dee2e6;
}

.divider-text {
  background: white;
  padding: 0 1rem;
  color: #6c757d;
  font-size: 0.9rem;
}

.form-check-input:checked {
  background-color: #667eea;
  border-color: #667eea;
}

.form-check-input:focus {
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.form-check-label {
  color: #6c757d;
  font-size: 0.9rem;
}

.form-check-label a {
  color: #667eea;
  font-weight: 500;
}

.form-check-label a:hover {
  color: #5a6fd8;
}

.text-center p {
  color: #6c757d;
}

.text-center a {
  color: #667eea;
  font-weight: 600;
}

.text-center a:hover {
  color: #5a6fd8;
}

.modal-content {
  border-radius: 15px;
  border: none;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.modal-header {
  border-bottom: 1px solid #f1f3f4;
  padding: 1.5rem;
}

.modal-body {
  padding: 1.5rem;
  color: #495057;
}

.modal-footer {
  border-top: 1px solid #f1f3f4;
  padding: 1rem 1.5rem;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

.is-invalid {
  border-color: #dc3545 !important;
}

.invalid-feedback {
  display: block;
  width: 100%;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #dc3545;
}

/* 반응형 디자인 */
@media (max-width: 576px) {
  .vertical-layout.vertical-menu.blank-page {
    padding: 10px;
  }
  
  .card.bg-authentication {
    margin: 0;
    border-radius: 15px !important;
  }
  
  .card-title h4 {
    font-size: 1.5rem;
  }
  
  .form-label-group input {
    height: 45px;
    font-size: 0.9rem;
  }
  
  .btn-primary {
    height: 45px;
    font-size: 0.9rem;
  }
}

/* 애니메이션 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card.bg-authentication {
  animation: fadeInUp 0.6s ease-out;
}

.form-label-group {
  animation: fadeInUp 0.6s ease-out;
}

.form-label-group:nth-child(1) { animation-delay: 0.1s; }
.form-label-group:nth-child(2) { animation-delay: 0.2s; }
.form-label-group:nth-child(3) { animation-delay: 0.3s; }
.form-label-group:nth-child(4) { animation-delay: 0.4s; }
</style>
