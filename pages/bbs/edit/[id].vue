<template>
  <div class="page-wrapper">
    <!-- Admin Header -->
    <AdminHeader />
    
    <!-- Admin Sidebar -->
    <AdminSidebar />
    
    <!-- Main Content -->
    <div class="main with-sidebar">
      <div class="pagetitle">
        <h1>게시글 수정</h1>
        <nav>
          <ol class="breadcrumb">
            <li class="breadcrumb-item"><NuxtLink to="/">Home</NuxtLink></li>
            <li class="breadcrumb-item"><NuxtLink to="/bbs">파일 게시판</NuxtLink></li>
            <li class="breadcrumb-item active">게시글 수정</li>
          </ol>
        </nav>
      </div><!-- End Page Title -->

      <section class="section">
        <div class="row">
          <div class="col-12">
            <div v-if="loading" class="card">
              <div class="card-body text-center py-5">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3">게시글을 불러오는 중...</p>
              </div>
            </div>

            <div v-else-if="error" class="card">
              <div class="card-body text-center py-5">
                <i class="bi bi-exclamation-triangle text-danger fs-1 d-block mb-3"></i>
                <h5 class="text-danger">{{ error }}</h5>
                <button class="btn btn-primary mt-3" @click="$router.push('/bbs')">
                  목록으로 돌아가기
                </button>
              </div>
            </div>

            <div v-else class="card">
              <div class="card-body">
                <form @submit.prevent="savePost">
                  <div class="mb-3">
                    <label for="postTitle" class="form-label">제목 <span class="text-danger">*</span></label>
                    <input 
                      type="text" 
                      class="form-control" 
                      id="postTitle"
                      v-model="formData.title"
                      required
                      placeholder="게시글 제목을 입력하세요"
                    >
                  </div>

                  <div class="row mb-3">
                    <div class="col-md-6">
                      <label for="postCategory" class="form-label">카테고리</label>
                      <select 
                        class="form-select" 
                        id="postCategory"
                        v-model="formData.category"
                      >
                        <option value="">선택하세요</option>
                        <option value="일반">일반</option>
                        <option value="공지">공지</option>
                        <option value="자료">자료</option>
                        <option value="기타">기타</option>
                      </select>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">옵션</label>
                      <div class="form-check">
                        <input 
                          class="form-check-input" 
                          type="checkbox" 
                          id="isNotice"
                          v-model="formData.is_notice"
                        >
                        <label class="form-check-label" for="isNotice">
                          공지사항
                        </label>
                      </div>
                      <div class="form-check">
                        <input 
                          class="form-check-input" 
                          type="checkbox" 
                          id="isPinned"
                          v-model="formData.is_pinned"
                        >
                        <label class="form-check-label" for="isPinned">
                          상단 고정
                        </label>
                      </div>
                    </div>
                  </div>

                  <div class="mb-3">
                    <label for="postContent" class="form-label">내용</label>
                    <textarea 
                      class="form-control" 
                      id="postContent"
                      v-model="formData.content"
                      rows="10"
                      placeholder="게시글 내용을 입력하세요"
                    ></textarea>
                  </div>

                  <!-- 파일 업로드 영역 -->
                  <div class="mb-3">
                    <label class="form-label">첨부파일</label>
                    <div class="border rounded p-3">
                      <input 
                        type="file" 
                        class="form-control mb-2" 
                        id="fileInput"
                        ref="fileInput"
                        multiple
                        @change="handleFileSelect"
                      >
                      <div v-if="selectedFiles.length > 0" class="mt-2">
                        <div 
                          v-for="(file, index) in selectedFiles" 
                          :key="index"
                          class="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded"
                        >
                          <div class="d-flex align-items-center">
                            <i class="bi bi-file-earmark me-2"></i>
                            <span>{{ file.name }}</span>
                            <small class="text-muted ms-2">({{ formatFileSize(file.size) }})</small>
                          </div>
                          <button 
                            type="button" 
                            class="btn btn-sm btn-outline-danger"
                            @click="removeFile(index)"
                          >
                            <i class="bi bi-x"></i>
                          </button>
                        </div>
                      </div>
                      <div v-if="existingFiles.length > 0" class="mt-2">
                        <small class="text-muted d-block mb-2">기존 첨부파일:</small>
                        <div 
                          v-for="file in existingFiles" 
                          :key="file.file_id"
                          class="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded"
                        >
                          <div class="d-flex align-items-center">
                            <i class="bi bi-file-earmark me-2"></i>
                            <span>{{ file.original_filename }}</span>
                            <small class="text-muted ms-2">({{ formatFileSize(file.file_size) }})</small>
                          </div>
                          <button 
                            type="button" 
                            class="btn btn-sm btn-outline-danger"
                            @click="removeExistingFile(file.file_id)"
                          >
                            <i class="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="d-flex justify-content-between">
                    <button type="button" class="btn btn-secondary" @click="$router.back()">
                      취소
                    </button>
                    <button type="submit" class="btn btn-primary" :disabled="saving">
                      <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
                      {{ saving ? '저장 중...' : '저장' }}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useApiClient } from '~/composables/useApiClient'
import { useRoute, useRouter } from 'vue-router'

declare const definePageMeta: (meta: { layout: string }) => void

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()
const apiClient = useApiClient()

const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)
const selectedFiles = ref<File[]>([])
const existingFiles = ref<any[]>([])
const fileInput = ref<HTMLInputElement | null>(null)

const postId = computed(() => route.params.id as string)

// 폼 데이터
const formData = ref({
  title: '',
  content: '',
  category: '',
  is_notice: false,
  is_pinned: false
})

// 게시글 로드
const loadPost = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await apiClient.get(`/api/v1/bbs/posts/${postId.value}`)
    if (response.success) {
      const post = response.data.post
      formData.value = {
        title: post.title || '',
        content: post.content || '',
        category: post.category || '',
        is_notice: post.is_notice || false,
        is_pinned: post.is_pinned || false
      }
      existingFiles.value = response.data.files || []
    } else {
      error.value = response.message || '게시글을 불러올 수 없습니다.'
    }
  } catch (err: any) {
    console.error('게시글 로드 실패:', err)
    if (err.statusCode === 404) {
      error.value = '게시글을 찾을 수 없습니다.'
    } else {
      error.value = '게시글을 불러오는데 실패했습니다.'
    }
  } finally {
    loading.value = false
  }
}

// 게시글 저장
const savePost = async () => {
  saving.value = true
  try {
    const formDataToSend = new FormData()
    formDataToSend.append('title', formData.value.title)
    formDataToSend.append('content', formData.value.content || '')
    formDataToSend.append('category', formData.value.category || '')
    formDataToSend.append('is_notice', formData.value.is_notice.toString())
    formDataToSend.append('is_pinned', formData.value.is_pinned.toString())

    // 파일 추가
    selectedFiles.value.forEach((file) => {
      formDataToSend.append('files', file)
    })

    const response = await apiClient.put(`/api/v1/bbs/posts/${postId.value}`, formDataToSend)

    if (response.success) {
      alert('게시글이 수정되었습니다.')
      router.push(`/bbs/${postId.value}`)
    } else {
      alert('게시글 수정에 실패했습니다.')
    }
  } catch (err) {
    console.error('게시글 저장 실패:', err)
    alert('게시글 저장에 실패했습니다.')
  } finally {
    saving.value = false
  }
}

// 파일 선택 처리
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    selectedFiles.value = Array.from(target.files)
  }
}

// 파일 제거
const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// 기존 파일 제거
const removeExistingFile = async (fileId: number) => {
  if (!confirm('이 파일을 삭제하시겠습니까?')) {
    return
  }

  try {
    const response = await apiClient.delete(`/api/v1/bbs/files/${fileId}`)
    if (response.success) {
      existingFiles.value = existingFiles.value.filter(f => f.file_id !== fileId)
      alert('파일이 삭제되었습니다.')
    }
  } catch (err) {
    console.error('파일 삭제 실패:', err)
    alert('파일 삭제에 실패했습니다.')
  }
}

// 파일 크기 포맷
const formatFileSize = (bytes: number) => {
  if (!bytes || bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// 컴포넌트 마운트 시 게시글 로드
onMounted(() => {
  loadPost()
})
</script>

<style scoped>
.form-check {
  margin-bottom: 0.5rem;
}
</style>

<style>
/* 이 페이지에서만 메인 콘텐츠의 좌측 공백 제거 */
.page-wrapper .main.with-sidebar {
  margin-left: 0 !important;
  padding-left: 15px;
  padding-right: 15px;
}
</style>

