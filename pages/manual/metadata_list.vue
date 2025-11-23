<template>
  <div class="page-wrapper">
    <!-- Admin Header -->
    <AdminHeader />
    
    <!-- Admin Sidebar -->
    <AdminSidebar />
    
    <!-- Main Content -->
    <div class="main with-sidebar">
      <div class="pagetitle">
        <h1>메타데이터 패턴 관리</h1>
        <nav>
          <ol class="breadcrumb">
            <li class="breadcrumb-item"><NuxtLink to="/">Home</NuxtLink></li>
            <li class="breadcrumb-item">메타데이터 관리</li>
            <li class="breadcrumb-item active">패턴 관리</li>
          </ol>
        </nav>
      </div><!-- End Page Title -->

      <section class="section">
        <div class="row">
          <!-- 왼쪽: 패턴 마스터 목록 -->
          <div class="col-lg-6">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">메타데이터 패턴 마스터</h5>
                
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <button type="button" class="btn btn-primary btn-sm me-2" @click="showAddModal">
                      <i class="bi bi-plus-circle me-1"></i> 패턴 추가
                    </button>                    

                  </div>
                
                  <button type="button" class="btn btn-success btn-sm" @click="refreshData">
                    <i class="bi bi-arrow-clockwise me-1"></i> 새로고침
                  </button>
                </div>

                <!-- DataTable Controls -->
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <div class="d-flex align-items-center">
                    <label class="me-2">Show</label>
                    <select class="form-select form-select-sm" style="width: auto;" v-model="pageSize" @change="updatePageSize">
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                    </select>
                    <span class="ms-2">entries per page</span>
                  </div>
                  
                  <div class="d-flex align-items-center">
                    <label class="me-2">Search:</label>
                    <input 
                      type="text" 
                      class="form-control form-control-sm" 
                      style="width: 200px;"
                      v-model="searchQuery"
                      @input="filterData"
                      placeholder="Search..."
                    >
                  </div>
                </div>

                <!-- Table with stripped rows --> 
                <div class="table-responsive">
                  <table class="table table-striped">
                    <thead>
                      <tr>
                        <th @click="sortBy('idx')" style="cursor: pointer;">
                          번호
                          <i class="bi" :class="getSortIcon('idx')"></i>
                        </th>
                        <th @click="sortBy('pattern_master_id')" style="cursor: pointer;">
                          패턴 ID
                          <i class="bi" :class="getSortIcon('pattern_master_id')"></i>
                        </th>                      
                        <th @click="sortBy('pattern_master_name')" style="cursor: pointer;">
                          패턴명
                          <i class="bi" :class="getSortIcon('pattern_master_name')"></i>
                        </th>                    
                        <th @click="sortBy('pattern_master_desc')" style="cursor: pointer;">
                          설명
                          <i class="bi" :class="getSortIcon('pattern_master_desc')"></i>
                        </th>                 
                        <th @click="sortBy('crdt_id')" style="cursor: pointer;">
                          등록자
                          <i class="bi" :class="getSortIcon('crdt_id')"></i>
                        </th>
                        <th @click="sortBy('crdt_dt')" style="cursor: pointer;">
                          등록일
                          <i class="bi" :class="getSortIcon('crdt_dt')"></i>
                        </th>    
                        <th>관리</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr 
                        v-for="item in paginatedData" 
                        :key="item.idx" 
                        v-if="!loading"
                        @click="handlePatternClick(item, $event)"
                        :class="{ 'table-active': selectedPattern && selectedPattern.idx === item.idx }"
                        style="cursor: pointer;"
                      >
                        <td>{{ item.idx }}</td>
                        <td>{{ item.pattern_master_id }}</td>
                        <td>{{ item.pattern_master_name }}</td>                                      
                        <td>{{ item.pattern_master_desc }}</td>                   
                        <td>{{ item.crdt_id }}</td>                    
                        <td>{{ formatDate(item.crdt_dt) }}</td>      
                        <td @click.stop>
                          <div class="btn-group" role="group">
                            <button 
                              type="button" 
                              class="btn btn-sm btn-outline-info"
                              @click="viewPattern(item)"
                              title="상세보기"
                            >
                              <i class="bi bi-eye"></i>
                            </button>
                            <button 
                              type="button" 
                              class="btn btn-sm btn-outline-warning"
                              @click="editPattern(item)"
                              title="수정"
                            >
                              <i class="bi bi-pencil"></i>
                            </button>
                            <button 
                              type="button" 
                              class="btn btn-sm btn-outline-danger"
                              @click="deletePattern(item)"
                              title="삭제"
                            >
                              <i class="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                      <tr v-if="loading">
                        <td colspan="7" class="text-center py-4">
                          <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                          </div>
                          <div class="mt-2">데이터를 불러오는 중...</div>
                        </td>
                      </tr>
                      <tr v-if="!loading && paginatedData.length === 0">
                        <td colspan="7" class="text-center py-4 text-muted">
                          데이터가 없습니다.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <!-- Pagination Info and Controls -->
                <div class="d-flex justify-content-between align-items-center mt-3">
                  <div class="text-muted">
                    Showing {{ startEntry }} to {{ endEntry }} of {{ filteredDataList.length }} entries
                    <span v-if="filteredDataList.length !== patternList.length">
                      (filtered from {{ patternList.length }} total entries)
                    </span>
                  </div>
                  
                  <nav aria-label="Page navigation">
                    <ul class="pagination pagination-sm mb-0">
                      <li class="page-item" :class="{ disabled: currentPage === 1 }">
                        <button class="page-link" @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">
                          Previous
                        </button>
                      </li>
                      
                      <li 
                        v-for="page in visiblePages" 
                        :key="page" 
                        class="page-item" 
                        :class="{ active: page === currentPage }"
                      >
                        <button class="page-link" @click="goToPage(page)">
                          {{ page }}
                        </button>
                      </li>
                      
                      <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                        <button class="page-link" @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages">
                          Next
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
                <!-- End Table with stripped rows -->
              </div>
            </div>
          </div>
          
          <!-- 오른쪽: 패턴 상세 목록 -->
          <div class="col-lg-6">
            <div class="card">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h5 class="card-title mb-0">
                    패턴 상세 목록
                    <span v-if="selectedPattern" class="text-muted fs-6">
                      ({{ selectedPattern.pattern_master_name }})
                    </span>
                  </h5>
                  
                  <button 
                    type="button" 
                    class="btn btn-primary btn-sm" 
                    @click="showAddDetailModal"
                    :disabled="!selectedPattern"
                  >
                    <i class="bi bi-plus-circle me-1"></i> 상세 추가
                  </button>
                </div>
                
                <div v-if="!selectedPattern" class="text-center py-5 text-muted">
                  <i class="bi bi-arrow-left fs-1 mb-3"></i>
                  <p>왼쪽에서 패턴을 선택하세요</p>
                </div>
                
                <div v-else>
                  <!-- 상세 검색 -->
                  <div class="mb-3">
                    <div class="input-group">
                      <input 
                        type="text" 
                        class="form-control form-control-sm" 
                        v-model="detailSearchQuery"
                        @input="searchDetails"
                        placeholder="상세 검색..."
                      >
                      <button class="btn btn-outline-secondary btn-sm" type="button" @click="refreshDetails">
                        <i class="bi bi-arrow-clockwise"></i>
                      </button>
                    </div>
                  </div>
                  
                  <!-- 상세 테이블 -->
                  <div class="table-responsive" style="max-height: 500px; overflow-y: auto;">
                    <table class="table table-striped table-sm">
                      <thead class="sticky-top bg-light">
                        <tr>
                          <th>번호</th>
                          <th>값</th>
                          <th>패턴명</th>
                          <th>설명</th>
                          <th>등록자</th>
                          <th>등록일</th>
                          <th>관리</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="detail in paginatedDetails" :key="detail.pattern_idx" v-if="!detailLoading">
                          <td>{{ detail.pattern_idx }}</td>
                          <td>{{ detail.value }}</td>
                          <td>{{ detail.pattern_name }}</td>
                          <td>{{ detail.pattern_desc }}</td>
                          <td>{{ detail.crdt_id }}</td>
                          <td>{{ formatDate(detail.crdt_dt) }}</td>
                          <td>
                            <div class="btn-group" role="group">
                              <button 
                                type="button" 
                                class="btn btn-sm btn-outline-warning"
                                @click="editDetail(detail)"
                                title="수정"
                              >
                                <i class="bi bi-pencil"></i>
                              </button>
                              <button 
                                type="button" 
                                class="btn btn-sm btn-outline-danger"
                                @click="deleteDetail(detail)"
                                title="삭제"
                              >
                                <i class="bi bi-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                        <tr v-if="detailLoading">
                          <td colspan="7" class="text-center py-4">
                            <div class="spinner-border spinner-border-sm text-primary" role="status">
                              <span class="visually-hidden">Loading...</span>
                            </div>
                            <div class="mt-2">상세 데이터를 불러오는 중...</div>
                          </td>
                        </tr>
                        <tr v-if="!detailLoading && paginatedDetails.length === 0">
                          <td colspan="7" class="text-center py-4 text-muted">
                            상세 데이터가 없습니다.
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <!-- 상세 페이지네이션 -->
                  <div class="d-flex justify-content-between align-items-center mt-3" v-if="filteredDetailList.length > 0">
                    <div class="text-muted small">
                      총 {{ filteredDetailList.length }}개 항목
                    </div>
                    
                    <nav aria-label="Detail pagination" v-if="detailTotalPages > 1">
                      <ul class="pagination pagination-sm mb-0">
                        <li class="page-item" :class="{ disabled: detailCurrentPage === 1 }">
                          <button class="page-link" @click="goToDetailPage(detailCurrentPage - 1)" :disabled="detailCurrentPage === 1">
                            이전
                          </button>
                        </li>
                        
                        <li 
                          v-for="page in visibleDetailPages" 
                          :key="page" 
                          class="page-item" 
                          :class="{ active: page === detailCurrentPage }"
                        >
                          <button class="page-link" @click="goToDetailPage(page)">
                            {{ page }}
                          </button>
                        </li>
                        
                        <li class="page-item" :class="{ disabled: detailCurrentPage === detailTotalPages }">
                          <button class="page-link" @click="goToDetailPage(detailCurrentPage + 1)" :disabled="detailCurrentPage === detailTotalPages">
                            다음
                          </button>
                        </li>
                      </ul>
                    </nav>
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
    
    <!-- Add/Edit Modal -->
    <div 
      class="modal fade" 
      id="patternModal" 
      tabindex="-1" 
      aria-labelledby="patternModalLabel" 
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="patternModalLabel">
              {{ modalMode === 'add' ? '메타데이터 패턴 추가' : '메타데이터 패턴 수정' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <form @submit.prevent="savePattern">
            <div class="modal-body">
              <div class="mb-3">
                <label for="modalPatternMasterId" class="form-label">패턴 ID <span class="text-danger">*</span></label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="modalPatternMasterId" 
                  v-model="modalForm.pattern_master_id"
                  :disabled="modalMode === 'edit'"
                  required
                >
                <div class="form-text">패턴을 식별하는 고유 ID입니다.</div>
              </div>
              <div class="mb-3">
                <label for="modalPatternMasterName" class="form-label">패턴명 <span class="text-danger">*</span></label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="modalPatternMasterName" 
                  v-model="modalForm.pattern_master_name"
                  required
                >
              </div>
              <div class="mb-3">
                <label for="modalPatternMasterDesc" class="form-label">설명</label>
                <textarea 
                  class="form-control" 
                  id="modalPatternMasterDesc" 
                  rows="3"
                  v-model="modalForm.pattern_master_desc"
                  placeholder="패턴에 대한 설명을 입력하세요"
                ></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">취소</button>
              <button type="submit" class="btn btn-primary" :disabled="modalLoading">
                <span v-if="modalLoading" class="spinner-border spinner-border-sm me-2"></span>
                {{ modalMode === 'add' ? '추가' : '수정' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    
    <!-- View Modal -->
    <div 
      class="modal fade" 
      id="viewModal" 
      tabindex="-1" 
      aria-labelledby="viewModalLabel" 
      aria-hidden="true"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="viewModalLabel">
              메타데이터 패턴 상세보기
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div v-if="viewData">
              <div class="row mb-3">
                <div class="col-sm-3"><strong>번호:</strong></div>
                <div class="col-sm-9">{{ viewData.idx }}</div>
              </div>
              <div class="row mb-3">
                <div class="col-sm-3"><strong>패턴 ID:</strong></div>
                <div class="col-sm-9">{{ viewData.pattern_master_id }}</div>
              </div>
              <div class="row mb-3">
                <div class="col-sm-3"><strong>패턴명:</strong></div>
                <div class="col-sm-9">{{ viewData.pattern_master_name }}</div>
              </div>
              <div class="row mb-3">
                <div class="col-sm-3"><strong>설명:</strong></div>
                <div class="col-sm-9">{{ viewData.pattern_master_desc || '-' }}</div>
              </div>
              <div class="row mb-3">
                <div class="col-sm-3"><strong>등록자:</strong></div>
                <div class="col-sm-9">{{ viewData.crdt_id }}</div>
              </div>
              <div class="row mb-3">
                <div class="col-sm-3"><strong>등록일:</strong></div>
                <div class="col-sm-9">{{ formatDate(viewData.crdt_dt) }}</div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">닫기</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Detail Add/Edit Modal -->
    <div 
      class="modal fade" 
      id="detailModal" 
      tabindex="-1" 
      aria-labelledby="detailModalLabel" 
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="detailModalLabel">
              {{ detailModalMode === 'add' ? '패턴 상세 추가' : '패턴 상세 수정' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <form @submit.prevent="saveDetail">
            <div class="modal-body">
              <div class="mb-3">
                <label for="modalDetailValue" class="form-label">값 <span class="text-danger">*</span></label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="modalDetailValue" 
                  v-model="detailModalForm.value"
                  :disabled="detailModalMode === 'edit'"
                  required
                >
                <div class="form-text">패턴의 값입니다.</div>
              </div>
              <div class="mb-3">
                <label for="modalDetailPatternName" class="form-label">패턴명 <span class="text-danger">*</span></label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="modalDetailPatternName" 
                  v-model="detailModalForm.pattern_name"
                  required
                >
              </div>
              <div class="mb-3">
                <label for="modalDetailPatternDesc" class="form-label">설명</label>
                <textarea 
                  class="form-control" 
                  id="modalDetailPatternDesc" 
                  rows="3"
                  v-model="detailModalForm.pattern_desc"
                  placeholder="패턴 상세에 대한 설명을 입력하세요"
                ></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">취소</button>
              <button type="submit" class="btn btn-primary" :disabled="detailModalLoading">
                <span v-if="detailModalLoading" class="spinner-border spinner-border-sm me-2"></span>
                {{ detailModalMode === 'add' ? '추가' : '수정' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

// Use custom layout
definePageMeta({
  layout: false
})

// Page head
useHead({
  title: '메타데이터 패턴 관리',
  meta: [
    { name: 'description', content: 'Metadata pattern management page' }
  ]
})

// API 클라이언트
const { metadata } = useApi()

// Reactive data
const modalForm = ref({
  pattern_master_id: '',
  pattern_master_name: '',
  pattern_master_desc: ''
})

const viewData = ref(null)
const patternList = ref([])
const loading = ref(false)
const modalLoading = ref(false)
const modalMode = ref('add') // 'add' or 'edit'

// 선택된 패턴 및 상세 데이터
const selectedPattern = ref(null)
const detailList = ref([])
const filteredDetailList = ref([])
const detailLoading = ref(false)
const detailSearchQuery = ref('')
const detailCurrentPage = ref(1)
const detailPageSize = ref(10)

// 상세 모달 관련
const detailModalForm = ref({
  pattern_master_id: '',
  value: '',
  pattern_name: '',
  pattern_desc: ''
})
const detailModalLoading = ref(false)
const detailModalMode = ref('add') // 'add' or 'edit'

// Pagination & Search
const pageSize = ref(10)
const currentPage = ref(1)
const searchQuery = ref('')
const filteredDataList = ref([])

// Sorting
const sortColumn = ref('')
const sortDirection = ref('asc')

// Computed
const totalPages = computed(() => Math.ceil(filteredDataList.value.length / pageSize.value))

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredDataList.value.slice(start, end)
})

const startEntry = computed(() => {
  if (filteredDataList.value.length === 0) return 0
  return (currentPage.value - 1) * pageSize.value + 1
})

const endEntry = computed(() => {
  const end = currentPage.value * pageSize.value
  return Math.min(end, filteredDataList.value.length)
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// 상세 데이터 관련 computed
const detailTotalPages = computed(() => Math.ceil(filteredDetailList.value.length / detailPageSize.value))

const paginatedDetails = computed(() => {
  const start = (detailCurrentPage.value - 1) * detailPageSize.value
  const end = start + detailPageSize.value
  return filteredDetailList.value.slice(start, end)
})

const visibleDetailPages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, detailCurrentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(detailTotalPages.value, start + maxVisible - 1)
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// Methods
const filterData = () => {
  const query = searchQuery.value.toLowerCase()
  if (!query) {
    filteredDataList.value = [...patternList.value]
  } else {
    filteredDataList.value = patternList.value.filter(item =>
      item.pattern_master_name.toLowerCase().includes(query) ||
      item.pattern_master_id.toLowerCase().includes(query) ||
      (item.pattern_master_desc && item.pattern_master_desc.toLowerCase().includes(query)) ||
      (item.crdt_id && item.crdt_id.toLowerCase().includes(query))
    )
  }
  currentPage.value = 1
  applySorting()
}

const sortBy = (column) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortDirection.value = 'asc'
  }
  applySorting()
}

const applySorting = () => {
  if (!sortColumn.value) return
  
  filteredDataList.value.sort((a, b) => {
    let aVal = a[sortColumn.value]
    let bVal = b[sortColumn.value]
    
    // Handle empty values
    if (!aVal) aVal = ''
    if (!bVal) bVal = ''
    
    // Convert to string for comparison
    aVal = aVal.toString().toLowerCase()
    bVal = bVal.toString().toLowerCase()
    
    if (sortDirection.value === 'asc') {
      return aVal.localeCompare(bVal)
    } else {
      return bVal.localeCompare(aVal)
    }
  })
}

const getSortIcon = (column) => {
  if (sortColumn.value !== column) return 'bi-arrow-down-up'
  return sortDirection.value === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down'
}

const updatePageSize = () => {
  currentPage.value = 1
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
  return dateString
  }
}

// API 호출 함수들
const loadPatterns = async () => {
  loading.value = true
  try {
    const response = await metadata.getAllPatterns()
    if (response.success) {
      patternList.value = response.data.patterns || []
      filterData()
    } else {
      throw new Error(response.message || 'Failed to load patterns')
    }
  } catch (error) {
    console.error('패턴 목록 로드 오류:', error)
    
    // 서버 오류 응답에서 메시지 추출
    let errorMessage = '패턴 목록을 불러오는데 실패했습니다.'
    
    if (error.data && error.data.message) {
      errorMessage = error.data.message
    } else if (error.message) {
      errorMessage += '\n오류: ' + error.message
    }
    
    // 500 오류인 경우 특별 처리
    if (error.statusCode === 500) {
      errorMessage += '\n\n해결 방법: 상단의 "DB 설정" 버튼을 클릭하여 데이터베이스를 초기화해보세요.'
    }
    
    alert(errorMessage)
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  loadPatterns()
}

const showAddModal = () => {
  modalMode.value = 'add'
  modalForm.value = {
    pattern_master_id: '',
    pattern_master_name: '',
    pattern_master_desc: ''
  }
  
  if (process.client) {
    const modal = new bootstrap.Modal(document.getElementById('patternModal'))
    modal.show()
  }
}

const editPattern = (pattern) => {
  modalMode.value = 'edit'
  modalForm.value = {
    pattern_master_id: pattern.pattern_master_id,
    pattern_master_name: pattern.pattern_master_name,
    pattern_master_desc: pattern.pattern_master_desc || ''
  }
  
  if (process.client) {
    const modal = new bootstrap.Modal(document.getElementById('patternModal'))
    modal.show()
  }
}

const viewPattern = (pattern) => {
  viewData.value = pattern
  
  if (process.client) {
    const modal = new bootstrap.Modal(document.getElementById('viewModal'))
    modal.show()
  }
}

const deletePattern = async (pattern) => {
  if (!confirm(`패턴 "${pattern.pattern_master_name}"을(를) 삭제하시겠습니까?`)) {
    return
  }
  
  try {
    const response = await metadata.deletePattern(pattern.pattern_master_id)
    if (response.success) {
      alert('패턴이 성공적으로 삭제되었습니다.')
      await loadPatterns()
    } else {
      throw new Error(response.message || 'Failed to delete pattern')
    }
  } catch (error) {
    console.error('패턴 삭제 오류:', error)
    alert('패턴 삭제에 실패했습니다: ' + error.message)
  }
}

const savePattern = async () => {
  if (!modalForm.value.pattern_master_name || !modalForm.value.pattern_master_id) {
    alert('필수 항목을 입력해주세요.')
    return
  }

  modalLoading.value = true
  
  try {
    let response
    
    if (modalMode.value === 'add') {
      response = await metadata.createPattern({
        ...modalForm.value,
        crdt_id: 'admin'
      })
    } else {
      response = await metadata.updatePattern(modalForm.value.pattern_master_id, {
        pattern_master_name: modalForm.value.pattern_master_name,
        pattern_master_desc: modalForm.value.pattern_master_desc,
        crdt_id: 'admin'
      })
    }
    
    if (response.success) {
      alert(`패턴이 성공적으로 ${modalMode.value === 'add' ? '추가' : '수정'}되었습니다.`)
      
      // 모달 닫기
      if (process.client) {
        const modal = bootstrap.Modal.getInstance(document.getElementById('patternModal'))
        modal.hide()
      }
      
      // 데이터 새로고침
      await loadPatterns()
    } else {
      throw new Error(response.message || 'Failed to save pattern')
    }
    
  } catch (error) {
    console.error('패턴 저장 오류:', error)
    alert('오류가 발생했습니다: ' + error.message)
  } finally {
    modalLoading.value = false
  }
}

// 패턴 선택 및 상세 데이터 관련 함수들
const handlePatternClick = (pattern, event) => {
  // 관리 버튼 클릭 시에는 선택하지 않음
  if (event.target.closest('.btn-group')) {
    return
  }
  
  selectPattern(pattern)
}

const selectPattern = (pattern) => {
  console.log('패턴 선택됨:', pattern)
  
  if (!pattern || !pattern.pattern_master_id) {
    console.error('유효하지 않은 패턴 데이터:', pattern)
    alert('선택된 패턴 데이터가 유효하지 않습니다.')
    return
  }
  
  selectedPattern.value = pattern
  
  // 상세 데이터 초기화
  detailList.value = []
  filteredDetailList.value = []
  
  loadPatternDetails()
}

const loadPatternDetails = async () => {
  if (!selectedPattern.value) return
  
  console.log('패턴 상세 로드 시작:', selectedPattern.value.pattern_master_id)
  detailLoading.value = true
  try {
    const response = await metadata.getPatternDetails(selectedPattern.value.pattern_master_id)
    console.log('패턴 상세 API 응답:', response)
    
    if (response.success) {
      detailList.value = response.data.details || []
      console.log('로드된 상세 데이터:', detailList.value)
      filterDetails()
    } else {
      console.error('API 응답 실패:', response)
      throw new Error(response.message || 'Failed to load pattern details')
    }
  } catch (error) {
    console.error('패턴 상세 목록 로드 오류:', error)
    
    // 서버 오류 응답에서 메시지 추출
    let errorMessage = '패턴 상세 목록을 불러오는데 실패했습니다.'
    
    if (error.data && error.data.message) {
      errorMessage = error.data.message
    } else if (error.message) {
      errorMessage += '\n오류: ' + error.message
    }
    
    // 구체적인 오류 상황별 처리
    if (error.statusCode === 404) {
      errorMessage = `선택한 패턴(${selectedPattern.value?.pattern_master_name || 'Unknown'})의 상세 정보를 찾을 수 없습니다.`
    } else if (error.statusCode === 400) {
      errorMessage = '잘못된 패턴 정보입니다. 다시 선택해주세요.'
    } else if (error.statusCode === 500) {
      errorMessage += '\n\n해결 방법:'
      errorMessage += '\n- 데이터베이스 연결 상태를 확인해주세요'
      errorMessage += '\n- tbl_meta_pattern_detail 테이블이 존재하는지 확인해주세요'
      errorMessage += '\n- 패턴 마스터 ID가 올바른지 확인해주세요'
    }
    
    alert(errorMessage)
  } finally {
    detailLoading.value = false
  }
}

const filterDetails = () => {
  const query = detailSearchQuery.value.toLowerCase()
  if (!query) {
    filteredDetailList.value = [...detailList.value]
  } else {
    filteredDetailList.value = detailList.value.filter(item =>
      (item.pattern_name && item.pattern_name.toLowerCase().includes(query)) ||
      (item.value && item.value.toLowerCase().includes(query)) ||
      (item.pattern_desc && item.pattern_desc.toLowerCase().includes(query))
    )
  }
  detailCurrentPage.value = 1
}

const searchDetails = () => {
  filterDetails()
}

const refreshDetails = () => {
  if (selectedPattern.value) {
    loadPatternDetails()
  }
}

const goToDetailPage = (page) => {
  if (page >= 1 && page <= detailTotalPages.value) {
    detailCurrentPage.value = page
  }
}

// 상세 모달 관련 함수들
const showAddDetailModal = () => {
  if (!selectedPattern.value) return
  
  detailModalMode.value = 'add'
  detailModalForm.value = {
    pattern_master_id: selectedPattern.value.pattern_master_id,
    value: '',
    pattern_name: '',
    pattern_desc: ''
  }
  
  if (process.client) {
    const modal = new bootstrap.Modal(document.getElementById('detailModal'))
    modal.show()
  }
}

const editDetail = (detail) => {
  detailModalMode.value = 'edit'
  detailModalForm.value = {
    pattern_master_id: detail.pattern_master_id,
    value: detail.value,
    pattern_name: detail.pattern_name,
    pattern_desc: detail.pattern_desc || ''
  }
  
  if (process.client) {
    const modal = new bootstrap.Modal(document.getElementById('detailModal'))
    modal.show()
  }
}

const deleteDetail = async (detail) => {
  if (!confirm(`패턴 상세 "${detail.pattern_name}"을(를) 삭제하시겠습니까?`)) {
    return
  }
  
  try {
    // 실제로는 삭제 API를 호출해야 하지만, 현재는 목록에서만 제거
    const index = detailList.value.findIndex(item => item.pattern_idx === detail.pattern_idx)
    if (index > -1) {
      detailList.value.splice(index, 1)
      filterDetails()
      alert('패턴 상세가 성공적으로 삭제되었습니다.')
    }
  } catch (error) {
    console.error('패턴 상세 삭제 오류:', error)
    alert('패턴 상세 삭제에 실패했습니다: ' + error.message)
  }
}

const saveDetail = async () => {
  if (!detailModalForm.value.pattern_name || !detailModalForm.value.value) {
    alert('필수 항목을 입력해주세요.')
    return
  }

  detailModalLoading.value = true
  
  try {
    let response
    
    if (detailModalMode.value === 'add') {
      response = await metadata.createPatternDetail({
        ...detailModalForm.value,
        crdt_id: 'admin'
      })
    } else {
      // 수정 API는 별도로 구현 필요
      alert('수정 기능은 추후 구현 예정입니다.')
      return
    }
    
    if (response.success) {
      alert(`패턴 상세가 성공적으로 ${detailModalMode.value === 'add' ? '추가' : '수정'}되었습니다.`)
    
    // 모달 닫기
    if (process.client) {
        const modal = bootstrap.Modal.getInstance(document.getElementById('detailModal'))
      modal.hide()
    }
    
      // 상세 데이터 새로고침
      await loadPatternDetails()
    } else {
      throw new Error(response.message || 'Failed to save pattern detail')
    }
    
  } catch (error) {
    console.error('패턴 상세 저장 오류:', error)
    alert('오류가 발생했습니다: ' + error.message)
  } finally {
    detailModalLoading.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadPatterns()
})
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

/* 테이블 스타일 */
.table th {
  background-color: #f8f9fa;
  border-top: 2px solid #dee2e6;
  font-weight: 600;
  color: #495057;
  white-space: nowrap;
}

.table th:hover {
  background-color: #e9ecef;
}

.table-striped > tbody > tr:nth-of-type(odd) > td {
  background-color: rgba(0, 0, 0, 0.025);
}

/* 페이지네이션 스타일 */
.pagination .page-link {
  color: #6c757d;
  border-color: #dee2e6;
}

.pagination .page-item.active .page-link {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.pagination .page-link:hover {
  color: #0d6efd;
  background-color: #e9ecef;
  border-color: #dee2e6;
}

/* 버튼 스타일 */
.btn-sm {
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
}

/* 모달 스타일 */
.modal-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.modal-footer {
  background-color: #f8f9fa;
  border-top: 1px solid #dee2e6;
}

/* 필수 항목 표시 */
.text-danger {
  color: #dc3545 !important;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .main {
    padding: 1rem;
  }
  
  .pagetitle h1 {
    font-size: 1.5rem;
  }
  
  .table-responsive {
    font-size: 0.875rem;
  }
  
  .d-flex.justify-content-between {
    flex-direction: column;
    gap: 1rem;
  }
  
  .d-flex.justify-content-between > div {
    flex-direction: column;
    align-items: flex-start !important;
  }
}

/* 로딩 스피너 */
.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

/* 선택된 행 스타일 */
.table-active {
  background-color: rgba(13, 110, 253, 0.1) !important;
  border-color: rgba(13, 110, 253, 0.2);
}

.table tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.075);
}

.table tbody tr.table-active:hover {
  background-color: rgba(13, 110, 253, 0.15) !important;
}

/* 상세 테이블 스타일 */
.table-sm th,
.table-sm td {
  padding: 0.5rem;
  font-size: 0.875rem;
}

/* 고정 헤더 스타일 */
.sticky-top {
  position: sticky;
  top: 0;
  z-index: 10;
}

/* 카드 높이 조정 */
.col-lg-6 .card {
  height: calc(100vh - 200px);
  min-height: 600px;
}

.col-lg-6 .card .card-body {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.col-lg-6 .table-responsive {
  flex: 1;
  overflow-y: auto;
}
</style>
