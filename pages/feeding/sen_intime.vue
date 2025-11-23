<template>
  <div class="page-wrapper">
    <!-- Admin Header -->
    <AdminHeader />
    
    <!-- Admin Sidebar -->
    <AdminSidebar />
    
    <!-- Main Content -->
    <div class="main with-sidebar">
      <div class="pagetitle">
        <h1>실시간 급이량 관리</h1>
        <nav>
          <ol class="breadcrumb">
            <li class="breadcrumb-item"><NuxtLink to="/">Home</NuxtLink></li>
            <li class="breadcrumb-item">급이 관리</li>
            <li class="breadcrumb-item active">실시간 급이량</li>
          </ol>
        </nav>
      </div><!-- End Page Title -->

      <section class="section">
        <!-- 통계 카드 섹션 -->
        <div class="row mb-4" v-if="statistics">
          <div class="col-xxl-3 col-md-6">
            <div class="card info-card sales-card">
              <div class="card-body">
                <h5 class="card-title">총 급이 기록</h5>
                <div class="d-flex align-items-center">
                  <div class="card-icon rounded-circle d-flex align-items-center justify-content-center">
                    <i class="bi bi-clipboard-data"></i>
                  </div>
                  <div class="ps-3">
                    <h6>{{ formatNumber(statistics.total_records) }}</h6>
                    <span class="text-muted small pt-2">건</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-xxl-3 col-md-6">
            <div class="card info-card revenue-card">
              <div class="card-body">
                <h5 class="card-title">총 급이량</h5>
                <div class="d-flex align-items-center">
                  <div class="card-icon rounded-circle d-flex align-items-center justify-content-center">
                    <i class="bi bi-bucket"></i>
                  </div>
                  <div class="ps-3">
                    <h6>{{ formatWeight(statistics.total_feed) }}</h6>
                    <span class="text-success small pt-1 fw-bold">평균: {{ formatWeight(statistics.avg_feed) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-xxl-3 col-md-6">
            <div class="card info-card customers-card">
              <div class="card-body">
                <h5 class="card-title">활성 돈방</h5>
                <div class="d-flex align-items-center">
                  <div class="card-icon rounded-circle d-flex align-items-center justify-content-center">
                    <i class="bi bi-house-door"></i>
                  </div>
                  <div class="ps-3">
                    <h6>{{ statistics.unique_rooms }}</h6>
                    <span class="text-muted small pt-2">개</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-xxl-3 col-md-6">
            <div class="card info-card">
              <div class="card-body">
                <h5 class="card-title">활성 태그</h5>
                <div class="d-flex align-items-center">
                  <div class="card-icon rounded-circle d-flex align-items-center justify-content-center">
                    <i class="bi bi-tags"></i>
                  </div>
                  <div class="ps-3">
                    <h6>{{ statistics.unique_tags }}</h6>
                    <span class="text-muted small pt-2">개</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 필터 및 검색 섹션 -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">검색 및 필터</h5>
                
                <div class="row g-3">
                  <!-- 검색어 -->
                  <div class="col-md-3">
                    <label class="form-label">검색어</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      v-model="filters.search"
                      placeholder="돈방번호, 기기번호, 태그번호 검색..."
                    >
                  </div>
                  
                  <!-- 돈방번호 -->
                  <div class="col-md-2">
                    <label class="form-label">돈방번호</label>
                    <input 
                      type="number" 
                      class="form-control" 
                      v-model="filters.gwid"
                      placeholder="돈방번호"
                    >
                  </div>
                  
                  <!-- 기기번호 -->
                  <div class="col-md-2">
                    <label class="form-label">기기번호</label>
                    <input 
                      type="number" 
                      class="form-control" 
                      v-model="filters.devid"
                      placeholder="기기번호"
                    >
                  </div>
                  
                  <!-- 태그번호 -->
                  <div class="col-md-2">
                    <label class="form-label">태그번호</label>
                    <input 
                      type="number" 
                      class="form-control" 
                      v-model="filters.tagnum"
                      placeholder="태그번호"
                    >
                  </div>
                  
                  <!-- 시작일 -->
                  <div class="col-md-2">
                    <label class="form-label">시작일</label>
                    <input 
                      type="date" 
                      class="form-control" 
                      v-model="filters.start_date"
                    >
                  </div>
                  
                  <!-- 종료일 -->
                  <div class="col-md-1">
                    <label class="form-label">종료일</label>
                    <input 
                      type="date" 
                      class="form-control" 
                      v-model="filters.end_date"
                    >
                  </div>
                </div>
                
                <div class="row mt-3">
                  <div class="col-12">
                    <button type="button" class="btn btn-primary me-2" @click="searchData">
                      <i class="bi bi-search me-1"></i> 검색
                    </button>
                    <button type="button" class="btn btn-secondary me-2" @click="resetFilters">
                      <i class="bi bi-arrow-clockwise me-1"></i> 초기화
                    </button>
                    <button type="button" class="btn btn-success me-2" @click="refreshData">
                      <i class="bi bi-arrow-clockwise me-1"></i> 새로고침
                    </button>
                    <button type="button" class="btn btn-info" @click="exportData">
                      <i class="bi bi-download me-1"></i> 엑셀 다운로드
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 데이터 테이블 -->
        <div class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h5 class="card-title mb-0">실시간 급이량 목록</h5>
                  
                  <div class="d-flex align-items-center">
                    <label class="me-2">표시 개수:</label>
                    <select class="form-select form-select-sm" style="width: auto;" v-model="pageSize" @change="changePageSize">
                      <option value="25">25</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                      <option value="200">200</option>
                    </select>
                  </div>
                </div>

                <!-- 테이블 -->
                <div class="table-responsive">
                  <table class="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th @click="sortBy('idx')" style="cursor: pointer;">
                          번호
                          <i class="bi" :class="getSortIcon('idx')"></i>
                        </th>
                        <th @click="sortBy('gwid')" style="cursor: pointer;">
                          돈방번호
                          <i class="bi" :class="getSortIcon('gwid')"></i>
                        </th>
                        <th @click="sortBy('devid')" style="cursor: pointer;">
                          기기번호
                          <i class="bi" :class="getSortIcon('devid')"></i>
                        </th>
                        <th @click="sortBy('rcvtime')" style="cursor: pointer;">
                          수신시간
                          <i class="bi" :class="getSortIcon('rcvtime')"></i>
                        </th>
                        <th @click="sortBy('eatfeed')" style="cursor: pointer;">
                          급이량
                          <i class="bi" :class="getSortIcon('eatfeed')"></i>
                        </th>
                        <th @click="sortBy('tagnum')" style="cursor: pointer;">
                          태그번호
                          <i class="bi" :class="getSortIcon('tagnum')"></i>
                        </th>
                        <th @click="sortBy('mngnum')" style="cursor: pointer;">
                          관리번호
                          <i class="bi" :class="getSortIcon('mngnum')"></i>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in feedingData" :key="item.idx" v-if="!loading">
                        <td>{{ item.idx }}</td>
                        <td>
                          <span class="badge bg-primary">{{ item.gwid }}</span>
                        </td>
                        <td>
                          <span class="badge bg-info">{{ item.devid }}</span>
                        </td>
                        <td>{{ formatDateTime(item.rcvtime) }}</td>
                        <td>
                          <strong class="text-success">{{ formatWeight(item.eatfeed) }}</strong>
                        </td>
                        <td>
                          <span class="badge bg-warning text-dark">{{ item.tagnum }}</span>
                        </td>
                        <td>{{ item.mngnum }}</td>
                      </tr>
                      
                      <!-- 로딩 상태 -->
                      <tr v-if="loading">
                        <td colspan="7" class="text-center py-4">
                          <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                          </div>
                          <div class="mt-2">데이터를 불러오는 중...</div>
                        </td>
                      </tr>
                      
                      <!-- 데이터 없음 -->
                      <tr v-if="!loading && feedingData.length === 0">
                        <td colspan="7" class="text-center py-4 text-muted">
                          <i class="bi bi-inbox fs-1 mb-3 d-block"></i>
                          데이터가 없습니다.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- 페이지네이션 -->
                <div class="d-flex justify-content-between align-items-center mt-3" v-if="pagination.total > 0">
                  <div class="text-muted">
                    총 {{ formatNumber(pagination.total) }}건 중 
                    {{ ((pagination.page - 1) * pagination.limit) + 1 }} - 
                    {{ Math.min(pagination.page * pagination.limit, pagination.total) }}건 표시
                  </div>
                  
                  <nav aria-label="Page navigation" v-if="pagination.totalPages > 1">
                    <ul class="pagination pagination-sm mb-0">
                      <li class="page-item" :class="{ disabled: pagination.page === 1 }">
                        <button class="page-link" @click="goToPage(pagination.page - 1)" :disabled="pagination.page === 1">
                          이전
                        </button>
                      </li>
                      
                      <li 
                        v-for="page in visiblePages" 
                        :key="page" 
                        class="page-item" 
                        :class="{ active: page === pagination.page }"
                      >
                        <button class="page-link" @click="goToPage(page)">
                          {{ page }}
                        </button>
                      </li>
                      
                      <li class="page-item" :class="{ disabled: pagination.page === pagination.totalPages }">
                        <button class="page-link" @click="goToPage(pagination.page + 1)" :disabled="pagination.page === pagination.totalPages">
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
      </section>
    </div>
    
    <!-- Footer -->
    <Footer />
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
  title: '실시간 급이량 관리',
  meta: [
    { name: 'description', content: '실시간 급이량 데이터 조회 및 관리 페이지' }
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
const feedingData = ref([])
const statistics = ref(null)
const trend = ref([])
const loading = ref(false)
const pageSize = ref(50)

// 필터 상태
const filters = ref({
  search: '',
  gwid: '',
  devid: '',
  tagnum: '',
  start_date: '',
  end_date: ''
})

// 페이지네이션 상태
const pagination = ref({
  page: 1,
  limit: 50,
  total: 0,
  totalPages: 0
})

// 정렬 상태
const sortColumn = ref('rcvtime')
const sortDirection = ref('desc')

// Computed
const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, pagination.value.page - Math.floor(maxVisible / 2))
  let end = Math.min(pagination.value.totalPages, start + maxVisible - 1)
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// Methods
const loadFeedingData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      limit: pagination.value.limit,
      ...filters.value
    }
    
    // 빈 값 제거
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key]
      }
    })
    
    console.log('실시간 급이량 데이터 로드 시작:', params)
    
    const response = await $fetch('/api/v1/feeding/sen-intime', {
      method: 'GET',
      query: params
    })
    
    if (response.success) {
      feedingData.value = response.data.records || []
      pagination.value = response.data.pagination || pagination.value
      statistics.value = response.data.statistics || null
      trend.value = response.data.trend || []
      
      console.log('데이터 로드 성공:', {
        records: feedingData.value.length,
        total: pagination.value.total
      })
    } else {
      throw new Error(response.message || 'Failed to load feeding data')
    }
    
  } catch (error) {
    console.error('급이량 데이터 로드 오류:', error)
    
    let errorMessage = '급이량 데이터를 불러오는데 실패했습니다.'
    
    if (error.data?.message) {
      errorMessage = error.data.message
    } else if (error.message) {
      errorMessage += '\n오류: ' + error.message
    }
    
    if (error.statusCode === 500) {
      errorMessage += '\n\n해결 방법:'
      errorMessage += '\n- 데이터베이스 연결 상태를 확인해주세요'
      errorMessage += '\n- tbl_raw_sen_intime 테이블이 존재하는지 확인해주세요'
    }
    
    alert(errorMessage)
  } finally {
    loading.value = false
  }
}

const searchData = () => {
  pagination.value.page = 1
  loadFeedingData()
}

const resetFilters = () => {
  filters.value = {
    search: '',
    gwid: '',
    devid: '',
    tagnum: '',
    start_date: '',
    end_date: ''
  }
  pagination.value.page = 1
  loadFeedingData()
}

const refreshData = () => {
  loadFeedingData()
}

const changePageSize = () => {
  pagination.value.limit = Number(pageSize.value)
  pagination.value.page = 1
  loadFeedingData()
}

const goToPage = (page) => {
  if (page >= 1 && page <= pagination.value.totalPages) {
    pagination.value.page = page
    loadFeedingData()
  }
}

const sortBy = (column) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortDirection.value = 'asc'
  }
  // 정렬은 서버에서 처리하도록 API 재호출
  loadFeedingData()
}

const getSortIcon = (column) => {
  if (sortColumn.value !== column) return 'bi-arrow-down-up'
  return sortDirection.value === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down'
}

const exportData = async () => {
  try {
    alert('엑셀 다운로드 기능은 추후 구현 예정입니다.')
  } catch (error) {
    console.error('엑셀 다운로드 오류:', error)
    alert('엑셀 다운로드에 실패했습니다.')
  }
}

// 포맷팅 함수들
const formatDateTime = (dateTime) => {
  if (!dateTime) return ''
  
  // 문자열이 20230719175231 형태인지 확인
  if (typeof dateTime === 'string' && /^\d{14}$/.test(dateTime)) {
    try {
      // 20230719175231 -> 2023-07-19 17:52:31 형태로 변환
      const year = dateTime.substring(0, 4)
      const month = dateTime.substring(4, 6)
      const day = dateTime.substring(6, 8)
      const hour = dateTime.substring(8, 10)
      const minute = dateTime.substring(10, 12)
      const second = dateTime.substring(12, 14)
      
      return `${year}-${month}-${day} ${hour}:${minute}:${second}`
    } catch (error) {
      console.error('날짜 포맷 변환 오류:', error)
      return dateTime
    }
  }
  
  // 일반적인 날짜 형태인 경우 기존 로직 사용
  try {
    const date = new Date(dateTime)
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch (error) {
    return dateTime
  }
}

const formatWeight = (weight) => {
  if (!weight && weight !== 0) return '0.00kg'
  return Number(weight).toFixed(2) + 'kg'
}

const formatNumber = (number) => {
  if (!number && number !== 0) return '0'
  return Number(number).toLocaleString('ko-KR')
}

// 초기 데이터 로드
onMounted(() => {
  // 오늘 날짜로 기본 설정
  const today = new Date().toISOString().split('T')[0]
  filters.value.start_date = '2023-01-01'
  filters.value.end_date = today
  
  loadFeedingData()
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

/* 정보 카드 스타일 */
.info-card {
  transition: transform 0.3s ease;
}

.info-card:hover {
  transform: translateY(-5px);
}

.card-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 1.5rem;
}

.sales-card .card-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.revenue-card .card-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.customers-card .card-icon {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
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

.table-hover tbody tr:hover {
  background-color: rgba(0, 123, 255, 0.075);
}

/* 배지 스타일 */
.badge {
  font-size: 0.85rem;
  padding: 0.5em 0.75em;
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
.btn {
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

/* 폼 컨트롤 스타일 */
.form-control, .form-select {
  border-radius: 6px;
  border: 1px solid #dee2e6;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-control:focus, .form-select:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

/* 로딩 스피너 */
.spinner-border {
  width: 2rem;
  height: 2rem;
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
}

/* 애니메이션 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card {
  animation: fadeIn 0.6s ease-out;
}
</style>
