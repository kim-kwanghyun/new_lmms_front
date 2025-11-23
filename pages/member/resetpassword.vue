<template>
  <div class="container">
    <section class="section register min-vh-100 d-flex flex-column align-items-center justify-content-center py-4">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-lg-4 col-md-6 d-flex flex-column align-items-center justify-content-center">
            
            
            
            <div class="card mb-3">
              <div class="card-body">
                <div class="pt-4 pb-2">
                  <h5 class="card-title text-center pb-0 fs-4">Reset Password</h5>                  
                </div>
                
                <form @submit.prevent="handlePasswordReset">
                  <div class="col-12">
                    <label for="yourPassword" class="form-label">Password</label>
                    <input 
                      type="password" 
                      v-model="form.pwd1" 
                      class="form-control" 
                      id="pwd1" 
                      required
                    >
                    <div class="invalid-feedback">Please enter your password!</div>
                  </div>

                  <div class="col-12">
                    <label for="yourPassword" class="form-label">Confirm Password</label>
                    <input 
                      type="password" 
                      v-model="form.pwd2" 
                      class="form-control" 
                      id="pwd2" 
                      required
                    >
                    <div class="invalid-feedback">Please confirm your password!</div>
                  </div>                      

                  <div class="col-12">
                    <button 
                      class="btn btn-primary w-100" 
                      type="submit"
                      :disabled="loading"
                    >
                      {{ loading ? 'Processing...' : '확인' }}
                    </button>
                  </div>
                </form>
                
                <div class="col-12 mt-3">
                  <button 
                    class="btn btn-secondary w-100" 
                    @click="handleAppLogin"
                  >
                    앱 회원 비밀번호 재설정
                  </button>
                </div>
              </div>
            </div>

            <div class="credits">
              Designed by <a href="https://hping.co.kr/">ping</a>
            </div>

          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// Set page meta
definePageMeta({
  layout: false
})

// Use head for SEO
useHead({
  title: 'Reset Password',
  meta: [
    { name: 'description', content: 'Reset your password' }
  ],
  link: [
    { rel: 'icon', href: '/assets/img/[50]pic_logo.png' },
    { rel: 'apple-touch-icon', href: '/assets/img/[50]pic_logo.png' }
  ]
})

// Reactive data
const form = ref({
  pwd1: '',
  pwd2: '',
  member_id: '',
  randomNumber: ''
})

const loading = ref(false)
const route = useRoute()

// Get URL parameters on mount
onMounted(() => {
  form.value.member_id = route.query.member_id || ''
  form.value.randomNumber = route.query.randomNumber || ''
})

// Methods
const handlePasswordReset = async () => {
  if (form.value.pwd1 !== form.value.pwd2) {
    alert('비밀번호가 틀립니다.')
    return
  }

  loading.value = true
  
  try {
    const response = await $fetch('/member/ajaxpostChangePwd', {
      method: 'POST',
      body: {
        pwd1: form.value.pwd1,
        pwd2: form.value.pwd2,
        member_id: form.value.member_id,
        randomNumber: form.value.randomNumber
      }
    })

    if (response.retcode === 'success') {
      alert('비밀번호가 수정되었습니다.')
      await navigateTo('/member/login')
    } else if (response.retcode === 'fail') {
      await navigateTo('/member/login')
    }
  } catch (error) {
    console.error('Password reset error:', error)
  } finally {
    loading.value = false
    alert('비밀번호가 수정되었습니다.')
    await navigateTo('/member/login')
  }
}

const handleAppLogin = async () => {
  // Use a more Vue-friendly approach for SweetAlert2
  const { value: email } = await Swal.fire({
    title: '앱 등록이메일을 입력하세요',
    input: 'text',
    inputPlaceholder: '',
    showCancelButton: true,
    confirmButtonText: '확인',
    cancelButtonText: '취소',
    inputValidator: (value) => {
      if (!value) {
        return 'LSMMS 앱에서 등록한 이메일을 입력해야 합니다!'
      }
    }
  })

  if (email) {
    await sendEmail({ email })
  }
}

const sendEmail = async (sendData) => {
  try {
    const response = await $fetch('/member/ajaxFirstLogin', {
      method: 'POST',
      body: sendData
    })

    if (response.retcode === 'success') {
      alert('이메일로 비밀번호 설정 경로을 전송하였습니다.')
    } else if (response.retcode === 'fail') {
      alert('앱회원이 아니거나 이메일을 잘못 입력하셨습니다.')
    }
  } catch (error) {
    console.error('Send email error:', error)
  }
}
</script>

<style scoped>
/* Custom styles can be added here if needed */
</style>
