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
    <Footer />
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

// Neo4j 관련 상태
const neo4jTesting = ref(false)
const neo4jSetting = ref(false)
const neo4jStatus = ref(null)
const envDebugging = ref(false)
const neo4jResetting = ref(false)


// Methods
const submitQuestion = async () => {
  if (!question.value.trim() || loading.value) return

  loading.value = true
  const currentQuestion = question.value.trim()
  
  try {
    console.log('=== 질문 처리 시작 ===')
    console.log('질문:', currentQuestion)
    
    // 새로운 LLM API 호출
    const response = await $fetch('/api/v1/llm/question', {
      method: 'POST',
      body: {
        question: currentQuestion
      }
    })
    console.log('response:', JSON.stringify(response))
    
    // 응답 데이터를 화면에 표시
    if (response.result) {
      currentAnswer.value = response.result
    } else {
      currentAnswer.value = '답변을 받지 못했습니다.'
    }
    
    // AIX 쿼리 데이터를 화면에 표시
    if (response.aix_ret) {
      aixQuery.value = JSON.stringify(response.aix_ret, null, 2)
    } else {
      aixQuery.value = '// AIX 쿼리 데이터가 없습니다.'
    }
    
    // 대화 히스토리에 추가
    conversationHistory.value.unshift({
      question: currentQuestion,
      answer: response.result || '답변을 받지 못했습니다.',
      aixQuery: response.aix_ret ? JSON.stringify(response.aix_ret, null, 2) : null,
      timestamp: new Date().toISOString()
    })
    
    // 질문 입력창 초기화
    question.value = ''
    
  } catch (error) {
    console.error('Error submitting question:', error)
    
    let errorMessage = '죄송합니다. 답변을 생성하는 중 오류가 발생했습니다.'
    
    if (error.data?.error) {
      errorMessage += `\n\n오류 상세: ${error.data.error}`
    }
    
    if (error.statusCode === 500) {
      errorMessage += '\n\n- Neo4j 연결을 확인해주세요.\n- OpenAI API 키를 확인해주세요.\n- 네트워크 연결을 확인해주세요.'
    }
    
    currentAnswer.value = errorMessage
    aixQuery.value = '// 오류로 인해 쿼리를 생성할 수 없습니다.'
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
</style>
