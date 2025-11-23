<template>
  <div class="page-wrapper">
    <!-- Admin Header -->
    <AdminHeader />
    
    <!-- Admin Sidebar -->
    <AdminSidebar />
    
    <!-- Main Content -->
    <div class="main with-sidebar">
      <div class="pagetitle">
        <h1>파일 게시판</h1>
        <nav>
          <ol class="breadcrumb">
            <li class="breadcrumb-item"><NuxtLink to="/">Home</NuxtLink></li>
            <li class="breadcrumb-item active">파일 게시판</li>
          </ol>
        </nav>
      </div><!-- End Page Title -->

      <section class="section">
        <div class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-body">
                <!-- 상단 버튼 영역 -->
                <div class="d-flex justify-content-between align-items-center mb-4">
                  <h5 class="card-title mb-0">
                    <i class="bi bi-file-earmark-text me-2"></i>게시글 목록
                  </h5>
                  <button 
                    type="button" 
                    class="btn btn-primary"
                    @click="showPostModal()"
                  >
                    <i class="bi bi-plus-circle me-1"></i> 새 게시글 작성
                  </button>
                </div>

                <!-- 검색 및 필터 영역 -->
                <div class="row mb-3">
                  <div class="col-md-3">
                    <select 
                      class="form-select form-select-sm" 
                      v-model="searchCategory"
                      @change="loadPosts"
                    >
                      <option value="">전체 카테고리</option>
                      <option value="일반">일반</option>
                      <option value="공지">공지</option>
                      <option value="자료">자료</option>
                      <option value="기타">기타</option>
                    </select>
                  </div>
                  <div class="col-md-6">
                    <input 
                      type="text" 
                      class="form-control form-control-sm" 
                      placeholder="제목 또는 내용으로 검색..."
                      v-model="searchText"
                      @keyup.enter="loadPosts"
                    >
                  </div>
                  <div class="col-md-3">
                    <div class="btn-group w-100">
                      <button 
                        class="btn btn-outline-primary btn-sm" 
                        @click="loadPosts"
                      >
                        <i class="bi bi-search me-1"></i> 검색
                      </button>
                      <button 
                        class="btn btn-outline-secondary btn-sm" 
                        @click="resetSearch"
                      >
                        <i class="bi bi-arrow-clockwise me-1"></i> 초기화
                      </button>
                    </div>
                  </div>
                </div>

                <!-- 게시글 목록 테이블 -->
                <div class="table-responsive">
                  <table class="table table-hover">
                    <thead class="table-light">
                      <tr>
                        <th style="width: 60px">번호</th>
                        <th style="width: 50px">
                          <i class="bi bi-pin-angle-fill text-warning" title="고정"></i>
                        </th>
                        <th style="width: 80px">카테고리</th>
                        <th>제목</th>
                        <th style="width: 100px">첨부</th>
                        <th style="width: 100px">작성자</th>
                        <th style="width: 120px">작성일</th>
                        <th style="width: 80px">조회수</th>
                        <th style="width: 120px">관리</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-if="loading">
                        <td colspan="9" class="text-center py-4">
                          <div class="spinner-border spinner-border-sm text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                          </div>
                          <span class="ms-2">로딩 중...</span>
                        </td>
                      </tr>
                      <tr v-else-if="posts.length === 0">
                        <td colspan="9" class="text-center py-4 text-muted">
                          <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                          <p class="mb-0">등록된 게시글이 없습니다.</p>
                        </td>
                      </tr>
                      <tr 
                        v-else
                        v-for="post in posts" 
                        :key="post.post_id"
                        :class="{ 
                          'table-warning': post.is_notice,
                          'table-info': post.is_pinned && !post.is_notice
                        }"
                      >
                        <td>{{ post.post_id }}</td>
                        <td class="text-center">
                          <i 
                            v-if="post.is_pinned" 
                            class="bi bi-pin-angle-fill text-warning"
                            title="상단 고정"
                          ></i>
                          <i 
                            v-if="post.is_notice" 
                            class="bi bi-megaphone-fill text-danger"
                            title="공지사항"
                          ></i>
                        </td>
                        <td>
                          <span class="badge bg-secondary">{{ post.category || '일반' }}</span>
                        </td>
                        <td>
                          <NuxtLink 
                            :to="`/bbs/${post.post_id}`"
                            class="text-decoration-none text-dark"
                            @click.prevent="viewPost(post.post_id)"
                          >
                            {{ post.title }}
                            <span v-if="post.file_count > 0" class="text-muted ms-1">
                              <i class="bi bi-paperclip"></i> ({{ post.file_count }})
                            </span>
                          </NuxtLink>
                        </td>
                        <td class="text-center">
                          <span v-if="post.file_count > 0" class="badge bg-info">
                            {{ post.file_count }}개
                          </span>
                          <span v-else class="text-muted">-</span>
                        </td>
                        <td>{{ post.crdt_id }}</td>
                        <td>{{ formatDate(post.crdt_dt) }}</td>
                        <td class="text-center">{{ post.view_count }}</td>
                        <td>
                          <div class="btn-group btn-group-sm">
                            <button 
                              class="btn btn-outline-primary" 
                              @click="editPost(post)"
                              title="수정"
                            >
                              <i class="bi bi-pencil"></i>
                            </button>
                            <button 
                              class="btn btn-outline-danger" 
                              @click="deletePost(post.post_id)"
                              title="삭제"
                            >
                              <i class="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- 페이지네이션 -->
                <nav v-if="totalPages > 1" aria-label="Page navigation">
                  <ul class="pagination justify-content-center">
                    <li class="page-item" :class="{ disabled: currentPage === 1 }">
                      <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">이전</a>
                    </li>
                    <li 
                      v-for="page in visiblePages" 
                      :key="page"
                      class="page-item" 
                      :class="{ active: page === currentPage }"
                    >
                      <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
                    </li>
                    <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                      <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">다음</a>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- 게시글 작성/수정 모달 -->
    <div 
      class="modal fade" 
      id="postModal" 
      tabindex="-1" 
      aria-labelledby="postModalLabel" 
      aria-hidden="true"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="postModalLabel">
              {{ editingPost ? '게시글 수정' : '새 게시글 작성' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
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

              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">취소</button>
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useApiClient } from '~/composables/useApiClient'

declare const definePageMeta: (meta: { layout: string }) => void
declare const navigateTo: (path: string) => void

definePageMeta({
  layout: 'admin'
})

const apiClient = useApiClient()

// 상태 관리
const loading = ref(false)
const saving = ref(false)
const posts = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const totalCount = ref(0)
const searchText = ref('')
const searchCategory = ref('')
const editingPost = ref<any>(null)
const selectedFiles = ref<File[]>([])
const existingFiles = ref<any[]>([])
const fileInput = ref<HTMLInputElement | null>(null)

// 폼 데이터
const formData = ref({
  title: '',
  content: '',
  category: '',
  is_notice: false,
  is_pinned: false
})

// 계산된 속성
const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value))
const visiblePages = computed(() => {
  const pages: number[] = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// 게시글 목록 로드
const loadPosts = async () => {
  loading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      pageSize: pageSize.value
    }
    if (searchText.value) {
      params.search = searchText.value
    }
    if (searchCategory.value) {
      params.category = searchCategory.value
    }

    const response = await apiClient.get('/api/v1/bbs/posts', { params })
    if (response.success) {
      posts.value = response.data.posts || []
      totalCount.value = response.data.totalCount || 0
    }
  } catch (error) {
    console.error('게시글 목록 로드 실패:', error)
    alert('게시글 목록을 불러오는데 실패했습니다.')
  } finally {
    loading.value = false
  }
}

// 게시글 조회
const viewPost = async (postId: number) => {
  try {
    await apiClient.get(`/api/v1/bbs/posts/${postId}/view`)
    // 게시글 상세 페이지로 이동하거나 모달로 표시
    navigateTo(`/bbs/${postId}`)
  } catch (error) {
    console.error('게시글 조회 실패:', error)
  }
}

// 게시글 작성 모달 표시
const showPostModal = () => {
  editingPost.value = null
  formData.value = {
    title: '',
    content: '',
    category: '',
    is_notice: false,
    is_pinned: false
  }
  selectedFiles.value = []
  existingFiles.value = []
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  const modal = new (window as any).bootstrap.Modal(document.getElementById('postModal'))
  modal.show()
}

// 게시글 수정
const editPost = async (post: any) => {
  editingPost.value = post
  formData.value = {
    title: post.title,
    content: post.content || '',
    category: post.category || '',
    is_notice: post.is_notice || false,
    is_pinned: post.is_pinned || false
  }
  selectedFiles.value = []
  
  // 기존 파일 목록 로드
  try {
    const response = await apiClient.get(`/api/v1/bbs/posts/${post.post_id}/files`)
    if (response.success) {
      existingFiles.value = response.data.files || []
    }
  } catch (error) {
    console.error('파일 목록 로드 실패:', error)
  }

  const modal = new (window as any).bootstrap.Modal(document.getElementById('postModal'))
  modal.show()
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

    let response
    if (editingPost.value) {
      // 수정
      response = await apiClient.put(`/api/v1/bbs/posts/${editingPost.value.post_id}`, formDataToSend)
    } else {
      // 생성
      response = await apiClient.post('/api/v1/bbs/posts', formDataToSend)
    }

    if (response.success) {
      alert(editingPost.value ? '게시글이 수정되었습니다.' : '게시글이 등록되었습니다.')
      const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById('postModal'))
      modal.hide()
      loadPosts()
    }
  } catch (error) {
    console.error('게시글 저장 실패:', error)
    alert('게시글 저장에 실패했습니다.')
  } finally {
    saving.value = false
  }
}

// 게시글 삭제
const deletePost = async (postId: number) => {
  if (!confirm('정말 삭제하시겠습니까?')) {
    return
  }

  try {
    const response = await apiClient.delete(`/api/v1/bbs/posts/${postId}`)
    if (response.success) {
      alert('게시글이 삭제되었습니다.')
      loadPosts()
    }
  } catch (error) {
    console.error('게시글 삭제 실패:', error)
    alert('게시글 삭제에 실패했습니다.')
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
  } catch (error) {
    console.error('파일 삭제 실패:', error)
    alert('파일 삭제에 실패했습니다.')
  }
}

// 검색 초기화
const resetSearch = () => {
  searchText.value = ''
  searchCategory.value = ''
  currentPage.value = 1
  loadPosts()
}

// 페이지 변경
const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    loadPosts()
  }
}

// 날짜 포맷
const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 파일 크기 포맷
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// 컴포넌트 마운트 시 게시글 목록 로드
onMounted(() => {
  loadPosts()
})
</script>

<style scoped>
.table-hover tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.table-warning {
  background-color: #fff3cd;
}

.table-info {
  background-color: #d1ecf1;
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

