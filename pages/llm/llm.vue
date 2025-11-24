<template>
  <div class="page-wrapper">
    <!-- Admin Header -->
    <AdminHeader />
    
    <!-- Admin Sidebar -->
    <AdminSidebar />
    
    <!-- Main Content -->
    <div class="main with-sidebar">
      <div class="pagetitle">
        <h1>LLM console</h1>
        <nav>
          <ol class="breadcrumb">
            <li class="breadcrumb-item"><NuxtLink to="/">Home</NuxtLink></li>
            <li class="breadcrumb-item">LLM console</li>
            <li class="breadcrumb-item active">LLM console</li>
          </ol>
        </nav>
      </div><!-- End Page Title -->

      <section class="section">
        <div class="row">
          <div class="col-lg-12">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">질문</h5>
                
                <!-- 질문 입력 영역 -->
                <div class="question-section mb-4">
                  <div class="row mb-3">
                    <label for="question" class="col-sm-1 col-form-label">질문</label>
                    <div class="col-sm-11">
                      <input 
                        type="text" 
                        class="form-control" 
                        id="question" 
                        v-model="question"
                        placeholder="돼지 사료 급이량이 얼마나 되나요?"
                        @keypress.enter="submitQuestion"
                      >
                    </div>
                  </div>
                  
                  <div class="text-end">
                    <button 
                      type="button" 
                      class="btn btn-primary" 
                      @click="submitQuestion"
                      :disabled="loading || !question.trim()"
                    >
                      <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                      AI 질문하기
                    </button>
                  </div>
                </div>

                <!-- 답변 영역 -->
                <div class="answer-section mb-4">
                  <div class="row mb-3">
                    <label class="col-sm-1 col-form-label">답변</label>
                    <div class="col-sm-11">
                      <!-- AI 처리 단계 표시 -->
                      <div class="ai-processing-steps mb-3">
                        <div class="steps-container">
                          <div 
                            v-for="(step, index) in processingSteps" 
                            :key="index"
                            :class="['step-item', step.status]"
                          >
                            <div class="step-icon">
                              <i v-if="step.status === 'completed'" class="bi bi-check-circle-fill"></i>
                              <i v-else-if="step.status === 'processing'" class="bi bi-arrow-repeat spinning"></i>
                              <i v-else-if="step.status === 'error'" class="bi bi-x-circle-fill"></i>
                              <i v-else class="bi bi-circle"></i>
                            </div>
                            <div class="step-label">{{ step.label }}</div>
                            <div v-if="index < processingSteps.length - 1" class="step-connector"></div>
                          </div>
                        </div>
                      </div>
                      
                      <div class="answer-container">
                        <div v-if="loading" class="loading-message">
                          <div class="d-flex align-items-center">
                            <div class="spinner-border spinner-border-sm me-2"></div>
                            <span>답변을 생성하고 있습니다...</span>
                          </div>
                        </div>
                        <div v-else-if="currentAnswer" class="answer-content">
                          <div class="answer-text" v-html="formatAnswer(currentAnswer)"></div>
                        </div>
                        <div v-else class="no-answer">
                          <span class="text-muted">질문을 입력하고 전송 버튼을 클릭해주세요.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- AIX 쿼리 영역 -->
                <div class="aix-query-section">
                  <div class="row">
                    <label class="col-sm-1 col-form-label">AIX 쿼리</label>
                    <div class="col-sm-11">
                      <div class="aix-container">
                        <textarea 
                          class="form-control aix-textarea" 
                          rows="10"
                          v-model="aixQuery"
                          placeholder="AIX 쿼리가 여기에 표시됩니다..."
                          readonly
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 대화 히스토리 -->
                <div v-if="conversationHistory.length > 0" class="conversation-history mt-4">
                  <h6 class="mb-3">대화 기록</h6>
                  <div class="accordion" id="historyAccordion">
                    <div 
                      v-for="(conversation, index) in conversationHistory" 
                      :key="index"
                      class="accordion-item"
                    >
                      <h2 class="accordion-header">
                        <button 
                          class="accordion-button collapsed" 
                          type="button" 
                          data-bs-toggle="collapse" 
                          :data-bs-target="`#collapse${index}`"
                          aria-expanded="false"
                        >
                          <i class="bi bi-chat-dots me-2"></i>
                          {{ conversation.question.substring(0, 50) }}{{ conversation.question.length > 50 ? '...' : '' }}
                          <small class="text-muted ms-2">({{ formatTime(conversation.timestamp) }})</small>
                        </button>
                      </h2>
                      <div 
                        :id="`collapse${index}`" 
                        class="accordion-collapse collapse"
                        data-bs-parent="#historyAccordion"
                      >
                        <div class="accordion-body">
                          <div class="mb-3">
                            <strong>질문:</strong>
                            <p class="mt-1">{{ conversation.question }}</p>
                          </div>
                          <div class="mb-3">
                            <strong>답변:</strong>
                            <div class="mt-1" v-html="formatAnswer(conversation.answer)"></div>
                          </div>
                          <div v-if="conversation.aixQuery">
                            <strong>AIX 쿼리:</strong>
                            <pre class="bg-light p-2 mt-1 rounded"><code>{{ conversation.aixQuery }}</code></pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
    
    <!-- Footer -->
    <AdminFooter />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// Use custom layout
definePageMeta({
  layout: false
})

// Page head
useHead({
  title: 'LLM Console',
  meta: [
    { name: 'description', content: 'LLM Console - AI 질문 답변 시스템' }
  ]
})

// 인증 체크
onMounted(async () => {
  try {
    const { verifyAuth } = useAuth()
    const isAuthenticated = await verifyAuth()
    if (!isAuthenticated) {
      await navigateTo('/member/login')
    }
  } catch (error) {
    console.error('Authentication check failed:', error)
    await navigateTo('/member/login')
  }
})

// Reactive data
const question = ref('')
const currentAnswer = ref('')
const aixQuery = ref('')
const loading = ref(false)
const conversationHistory = ref([])

// AI 처리 단계 상태
const processingSteps = ref([
  { label: '메타데이터 검색', status: 'pending' },
  { label: '상태 정보 검색', status: 'pending' },
  { label: '시맨틱 검색', status: 'pending' },
  { label: 'AI 검색', status: 'pending' }
])

// Neo4j 관련 상태
const neo4jTesting = ref(false)
const neo4jSetting = ref(false)
const neo4jStatus = ref(null)
const envDebugging = ref(false)
const neo4jResetting = ref(false)


// 단계 상태 업데이트 함수
const updateStepStatus = (stepIndex, status) => {
  if (stepIndex >= 0 && stepIndex < processingSteps.value.length) {
    processingSteps.value[stepIndex].status = status
  }
}

// 단계 초기화 함수
const resetSteps = () => {
  processingSteps.value.forEach(step => {
    step.status = 'pending'
  })
}

// 단계별 처리 시뮬레이션 함수
const processSteps = async () => {
  // 1. 메타데이터 검색
  updateStepStatus(0, 'processing')
  await new Promise(resolve => setTimeout(resolve, 800))
  updateStepStatus(0, 'completed')
  
  // 2. 상태 정보 검색
  updateStepStatus(1, 'processing')
  await new Promise(resolve => setTimeout(resolve, 600))
  updateStepStatus(1, 'completed')
  
  // 3. 시맨틱 검색
  updateStepStatus(2, 'processing')
  await new Promise(resolve => setTimeout(resolve, 700))
  updateStepStatus(2, 'completed')
  
  // 4. AI 검색
  updateStepStatus(3, 'processing')
}

// Methods
const submitQuestion = async () => {
  if (!question.value.trim() || loading.value) return

  loading.value = true
  const currentQuestion = question.value.trim()
  
  // 단계 초기화
  resetSteps()
  currentAnswer.value = ''
  
  try {
    console.log('=== ChatGPT 질문 처리 시작 ===')
    console.log('질문:', currentQuestion)
    
    // 단계별 처리 시작 (비동기로 실행)
    processSteps()
    
    // ChatGPT API 호출 (.env.dev의 OPENAI_API_KEY 사용)
    console.log('ChatGPT API 호출 중...', { question: currentQuestion })
    
    const response = await $fetch('/api/v1/llm/chatgpt', {
      method: 'POST',
      body: {
        question: currentQuestion,
        model: 'gpt-4o-mini',
        maxTokens: 2000,
        temperature: 0.7
      },
      timeout: 60000 // 60초 타임아웃
    })
    
    console.log('ChatGPT 응답 수신:', {
      success: response.success,
      resultLength: response.result?.length || 0,
      model: response.model
    })
    
    // AI 검색 단계 완료
    updateStepStatus(3, 'completed')
    
    // 응답 데이터 검증 및 화면에 표시
    if (response && response.success === 'success' && response.result) {
      currentAnswer.value = response.result
      console.log('✅ ChatGPT 답변 표시 완료')
    } else {
      currentAnswer.value = response?.result || '답변을 받지 못했습니다. 응답 형식이 올바르지 않습니다.'
      console.warn('⚠️ ChatGPT 응답 형식 오류:', response)
      updateStepStatus(3, 'error')
    }
    
    // AIX 쿼리 영역은 ChatGPT 직접 응답 모드에서는 사용하지 않음
    aixQuery.value = `// ChatGPT 직접 응답 모드\n// 모델: ${response?.model || 'gpt-4o-mini'}\n// 응답 시간: ${new Date().toLocaleString('ko-KR')}`
    
    // 대화 히스토리에 추가
    if (response && response.result) {
      conversationHistory.value.unshift({
        question: currentQuestion,
        answer: response.result,
        aixQuery: null,
        timestamp: new Date().toISOString()
      })
      console.log('✅ 대화 히스토리에 추가 완료')
    }
    
    // 질문 입력창 초기화
    question.value = ''
    
  } catch (error) {
    console.error('❌ ChatGPT 질문 처리 오류:', error)
    
    // 오류 발생 시 현재 처리 중인 단계를 오류 상태로 변경
    const currentStepIndex = processingSteps.value.findIndex(step => step.status === 'processing')
    if (currentStepIndex >= 0) {
      updateStepStatus(currentStepIndex, 'error')
    } else {
      updateStepStatus(3, 'error')
    }
    
    let errorMessage = '죄송합니다. 답변을 생성하는 중 오류가 발생했습니다.'
    
    // 상세한 에러 메시지 처리
    if (error.data?.message) {
      errorMessage = error.data.message
    } else if (error.data?.error) {
      errorMessage = `오류: ${error.data.error}`
    } else if (error.message) {
      errorMessage = `오류: ${error.message}`
    }
    
    // HTTP 상태 코드별 에러 메시지
    if (error.statusCode === 400) {
      errorMessage = '잘못된 요청입니다. 질문을 다시 확인해주세요.'
    } else if (error.statusCode === 401) {
      errorMessage = 'OpenAI API Key가 유효하지 않습니다.\n\n해결 방법:\n1. .env.dev 파일에 OPENAI_API_KEY가 설정되어 있는지 확인\n2. API 키가 올바른지 확인'
    } else if (error.statusCode === 429) {
      errorMessage = 'API 요청 한도를 초과했습니다.\n\n잠시 후 다시 시도해주세요.'
    } else if (error.statusCode === 500) {
      errorMessage = '서버 오류가 발생했습니다.\n\n확인 사항:\n1. .env.dev 파일에 OPENAI_API_KEY 설정 확인\n2. OpenAI API 키 유효성 확인\n3. 네트워크 연결 확인'
    } else if (error.statusCode === 408 || error.name === 'TimeoutError') {
      errorMessage = '요청 시간이 초과되었습니다.\n\n네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요.'
    }
    
    currentAnswer.value = errorMessage
    aixQuery.value = `// 오류 발생\n// 상태 코드: ${error.statusCode || 'N/A'}\n// 시간: ${new Date().toLocaleString('ko-KR')}`
    
    // 에러도 히스토리에 기록 (선택사항)
    console.warn('에러 상세:', {
      statusCode: error.statusCode,
      message: error.message,
      data: error.data
    })
  } finally {
    loading.value = false
  }
}



const formatAnswer = (answer) => {
  // Simple formatting for better readability
  return answer
    .replace(/\n/g, '<br>')
    .replace(/(\d+%)/g, '<strong>$1</strong>')
    .replace(/(\d+°C)/g, '<strong>$1</strong>')
    .replace(/(\d+ppm)/g, '<strong>$1</strong>')
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleString('ko-KR')
}

// Initialize with sample question
question.value = '돼지 사료 급이량이 얼마나 되나요?'
</script>

<style scoped>
/* 페이지 래퍼 스타일 */
.page-wrapper {
  min-height: 100vh;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
}

/* 메인 콘텐츠 스타일 */
.main {
  padding: 2rem 1.5rem;
  margin-top: 0;
  flex: 1;
}

.main.with-sidebar {
  margin-left: 300px;
  transition: all 0.3s;
}

@media (max-width: 1199px) {
  .main.with-sidebar {
    margin-left: 0;
  }
}

/* 페이지 제목 스타일 */
.pagetitle {
  margin-bottom: 2rem;
}

.pagetitle h1 {
  color: #2c3e50;
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.breadcrumb {
  background: transparent;
  padding: 0;
  margin: 0;
}

.breadcrumb-item {
  font-size: 0.9rem;
}

.breadcrumb-item + .breadcrumb-item::before {
  color: #6c757d;
}

.breadcrumb-item.active {
  color: #0d6efd;
}

/* Neo4j 설정 섹션 */
.neo4j-setup-section {
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 1.5rem;
}

.neo4j-setup-section h6 {
  color: #495057;
  font-weight: 600;
}

.neo4j-setup-section .btn {
  transition: all 0.3s ease;
}

.neo4j-setup-section .btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

/* 질문 섹션 */
.question-section {
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 1.5rem;
}

.question-section .form-control {
  border-radius: 8px;
  border: 2px solid #e9ecef;
  padding: 12px 16px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.question-section .form-control:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

/* 답변 섹션 */
.answer-section {
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 1.5rem;
}

.answer-container {
  min-height: 120px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  background-color: #f8f9fa;
}

.answer-content {
  color: #495057;
  line-height: 1.6;
}

.loading-message {
  color: #6c757d;
  font-style: italic;
}

.no-answer {
  color: #adb5bd;
  font-style: italic;
  text-align: center;
  padding: 2rem 0;
}

/* AIX 쿼리 섹션 */
.aix-container {
  position: relative;
}

.aix-textarea {
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  background-color: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  resize: vertical;
}

.aix-textarea:focus {
  background-color: #ffffff;
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

/* 버튼 스타일 */
.btn-primary {
  background: linear-gradient(135deg, #0d6efd 0%, #6610f2 100%);
  border: none;
  border-radius: 8px;
  padding: 10px 24px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 대화 히스토리 */
.conversation-history {
  border-top: 2px solid #dee2e6;
  padding-top: 1.5rem;
}

.accordion-button {
  background-color: #f8f9fa;
  border: none;
  font-weight: 500;
}

.accordion-button:not(.collapsed) {
  background-color: #e7f3ff;
  color: #0d6efd;
}

.accordion-body {
  background-color: #ffffff;
}

.accordion-body pre {
  font-size: 0.85rem;
  max-height: 200px;
  overflow-y: auto;
}

/* 로딩 스피너 */
.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

/* 라벨 스타일 */
.col-form-label {
  font-weight: 600;
  color: #495057;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .main {
    padding: 1rem;
  }
  
  .pagetitle h1 {
    font-size: 1.5rem;
  }
  
  .col-sm-1 {
    margin-bottom: 0.5rem;
  }
  
  .answer-container {
    min-height: 80px;
  }
  
  .aix-textarea {
    min-height: 150px;
  }
}

/* 애니메이션 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.answer-content,
.aix-container {
  animation: fadeIn 0.5s ease-out;
}

/* AI 처리 단계 스타일 */
.ai-processing-steps {
  background: #ffffff;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.steps-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
  z-index: 1;
}

.step-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-bottom: 8px;
  transition: all 0.3s ease;
  background-color: #ffffff;
  border: 3px solid #dee2e6;
}

.step-item.pending .step-icon {
  color: #adb5bd;
  border-color: #dee2e6;
  background-color: #f8f9fa;
}

.step-item.processing .step-icon {
  color: #0d6efd;
  border-color: #0d6efd;
  background-color: #e7f3ff;
  animation: pulse 1.5s ease-in-out infinite;
}

.step-item.completed .step-icon {
  color: #28a745;
  border-color: #28a745;
  background-color: #d4edda;
}

.step-item.error .step-icon {
  color: #dc3545;
  border-color: #dc3545;
  background-color: #f8d7da;
}

.step-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: #6c757d;
  text-align: center;
  transition: color 0.3s ease;
}

.step-item.pending .step-label {
  color: #adb5bd;
}

.step-item.processing .step-label {
  color: #0d6efd;
  font-weight: 600;
}

.step-item.completed .step-label {
  color: #28a745;
  font-weight: 600;
}

.step-item.error .step-label {
  color: #dc3545;
  font-weight: 600;
}

.step-connector {
  position: absolute;
  top: 20px;
  left: 50%;
  width: 100%;
  height: 3px;
  background-color: #dee2e6;
  z-index: 0;
  transition: background-color 0.3s ease;
}

.step-item.completed + .step-item .step-connector,
.step-item.processing + .step-item .step-connector {
  background-color: #28a745;
}

.step-item.error + .step-item .step-connector {
  background-color: #dc3545;
}

/* 스피닝 애니메이션 */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.spinning {
  animation: spin 1s linear infinite;
}

/* 펄스 애니메이션 */
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

/* 반응형 디자인 - 단계 표시 */
@media (max-width: 768px) {
  .steps-container {
    flex-wrap: wrap;
    gap: 12px;
  }
  
  .step-item {
    flex: 0 0 calc(50% - 6px);
    margin-bottom: 12px;
  }
  
  .step-connector {
    display: none;
  }
  
  .step-icon {
    width: 32px;
    height: 32px;
    font-size: 16px;
  }
  
  .step-label {
    font-size: 0.75rem;
  }
}

@media (max-width: 576px) {
  .step-item {
    flex: 0 0 100%;
  }
}
</style>
