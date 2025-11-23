<template>
  <div class="page-wrapper">
    <!-- Admin Header -->
    <AdminHeader />
    
    <!-- Admin Sidebar -->
    <AdminSidebar />
    
    <!-- Main Content -->
    <div class="main with-sidebar">
      <div class="pagetitle">
        <h1>게시글 상세</h1>
        <nav>
          <ol class="breadcrumb">
            <li class="breadcrumb-item"><NuxtLink to="/">Home</NuxtLink></li>
            <li class="breadcrumb-item"><NuxtLink to="/bbs">파일 게시판</NuxtLink></li>
            <li class="breadcrumb-item active">게시글 상세</li>
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

            <div v-else-if="post" class="card">
              <div class="card-body">
                <!-- 게시글 헤더 -->
                <div class="d-flex justify-content-between align-items-start mb-4">
                  <div>
                    <h2 class="card-title mb-2">
                      <span v-if="post.is_notice" class="badge bg-danger me-2">공지</span>
                      <span v-if="post.is_pinned" class="badge bg-warning me-2">고정</span>
                      <span v-if="post.category" class="badge bg-secondary me-2">{{ post.category }}</span>
                      {{ post.title }}
                    </h2>
                    <div class="text-muted">
                      <small>
                        <i class="bi bi-person me-1"></i>{{ post.crdt_id || '작성자' }}
                        <span class="ms-3">
                          <i class="bi bi-calendar me-1"></i>{{ formatDate(post.crdt_dt) }}
                        </span>
                        <span class="ms-3">
                          <i class="bi bi-eye me-1"></i>조회수 {{ post.view_count || 0 }}
                        </span>
                      </small>
                    </div>
                  </div>
                  <div>
                    <button class="btn btn-outline-secondary btn-sm" @click="$router.push('/bbs')">
                      <i class="bi bi-list me-1"></i>목록
                    </button>
                  </div>
                </div>

                <hr>

                <!-- 게시글 내용 -->
                <div class="post-content mb-4" v-html="formatContent(post.content)"></div>

                <!-- 첨부파일 -->
                <div v-if="files && files.length > 0" class="mt-4">
                  <h5 class="mb-3">
                    <i class="bi bi-paperclip me-2"></i>첨부파일 ({{ files.length }}개)
                  </h5>
                  <div class="list-group">
                    <div 
                      v-for="file in files" 
                      :key="file.file_id"
                      class="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <div class="d-flex align-items-center">
                        <i class="bi bi-file-earmark me-2"></i>
                        <span>{{ file.original_filename }}</span>
                        <small class="text-muted ms-2">({{ formatFileSize(file.file_size) }})</small>
                      </div>
                      <button 
                        class="btn btn-sm btn-outline-primary"
                        @click="downloadFile(file.file_id, file.original_filename)"
                      >
                        <i class="bi bi-download me-1"></i>다운로드
                      </button>
                    </div>
                  </div>
                </div>

                <!-- 하단 버튼 -->
                <div class="mt-4 pt-3 border-top">
                  <div class="d-flex justify-content-between">
                    <button class="btn btn-outline-secondary" @click="$router.push('/bbs')">
                      <i class="bi bi-list me-1"></i>목록으로
                    </button>
                    <div>
                      <button 
                        v-if="canEdit"
                        class="btn btn-outline-primary me-2"
                        @click="editPost"
                      >
                        <i class="bi bi-pencil me-1"></i>수정
                      </button>
                      <button 
                        v-if="canDelete"
                        class="btn btn-outline-danger"
                        @click="deletePost"
                      >
                        <i class="bi bi-trash me-1"></i>삭제
                      </button>
                    </div>
                  </div>
                </div>
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
const error = ref<string | null>(null)
const post = ref<any>(null)
const files = ref<any[]>([])

const postId = computed(() => route.params.id as string)
const canEdit = computed(() => true) // 권한 체크 로직 추가 필요
const canDelete = computed(() => true) // 권한 체크 로직 추가 필요

// 게시글 로드
const loadPost = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await apiClient.get(`/api/v1/bbs/posts/${postId.value}`)
    if (response.success) {
      post.value = response.data.post
      files.value = response.data.files || []
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

// 파일 다운로드
const downloadFile = async (fileId: number, filename: string) => {
  try {
    const response = await fetch(`/api/v1/bbs/files/${fileId}/download`)
    if (response.ok) {
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } else {
      alert('파일 다운로드에 실패했습니다.')
    }
  } catch (err) {
    console.error('파일 다운로드 실패:', err)
    alert('파일 다운로드에 실패했습니다.')
  }
}

// 게시글 수정
const editPost = () => {
  router.push(`/bbs/edit/${postId.value}`)
}

// 게시글 삭제
const deletePost = async () => {
  if (!confirm('정말 삭제하시겠습니까?')) {
    return
  }

  try {
    const response = await apiClient.delete(`/api/v1/bbs/posts/${postId.value}`)
    if (response.success) {
      alert('게시글이 삭제되었습니다.')
      router.push('/bbs')
    } else {
      alert('게시글 삭제에 실패했습니다.')
    }
  } catch (err) {
    console.error('게시글 삭제 실패:', err)
    alert('게시글 삭제에 실패했습니다.')
  }
}

// 날짜 포맷
const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 파일 크기 포맷
const formatFileSize = (bytes: number) => {
  if (!bytes || bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// 내용 포맷 (줄바꿈 처리)
const formatContent = (content: string) => {
  if (!content) return ''
  return content.replace(/\n/g, '<br>')
}

// 컴포넌트 마운트 시 게시글 로드
onMounted(() => {
  loadPost()
})
</script>

<style scoped>
.post-content {
  min-height: 200px;
  line-height: 1.8;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.list-group-item {
  border-left: none;
  border-right: none;
}

.list-group-item:first-child {
  border-top: none;
}

.list-group-item:last-child {
  border-bottom: none;
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

