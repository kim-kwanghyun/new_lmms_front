<template>
  <div class="page-wrapper">
    <!-- Admin Header -->
    <AdminHeader />
    
    <!-- Admin Sidebar -->
    <AdminSidebar />
    
    <!-- Main Content -->
    <div class="main with-sidebar">
      <div class="pagetitle">
        <h1>센서 데이터 모니터링</h1>
        <nav>
          <ol class="breadcrumb">
            <li class="breadcrumb-item"><NuxtLink to="/">Home</NuxtLink></li>
            <li class="breadcrumb-item">급이 관리</li>
            <li class="breadcrumb-item active">센서 데이터</li>
          </ol>
        </nav>
      </div><!-- End Page Title -->

      <section class="section">
        <!-- 실시간 상태 카드 섹션 -->
        <div class="row mb-4" v-if="latestStatus && latestStatus.length > 0">
          <div class="col-12">
            <h5 class="mb-3">실시간 센서 상태</h5>
          </div>
          <div class="col-xxl-3 col-lg-4 col-md-6 mb-3" v-for="status in latestStatus" :key="`${status.gwid}-${status.devid}`">
            <div class="card sensor-card" :class="{ 'border-danger': status.has_alarm }">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <h6 class="card-title mb-0">돈방 {{ status.gwid }} - 기기 {{ status.devid }}</h6>
                  <span v-if="status.has_alarm" class="badge bg-danger">
                    <i class="bi bi-exclamation-triangle"></i> 알람
                  </span>
                </div>
                <div class="sensor-data">
                  <div class="row">
                    <div class="col-6">
                      <small class="text-muted">온도</small>
                      <div class="fw-bold text-primary">{{ formatValue(status.temp, '°C') }}</div>
                    </div>
                    <div class="col-6">
                      <small class="text-muted">습도</small>
                      <div class="fw-bold text-info">{{ formatValue(status.humi, '%') }}</div>
                    </div>
                  </div>
                  <div class="row mt-2">
                    <div class="col-4">
                      <small class="text-muted">CO2</small>
                      <div class="fw-bold text-warning">{{ formatValue(status.co2, 'ppm') }}</div>
                    </div>
                    <div class="col-4">
                      <small class="text-muted">NH3</small>
                      <div class="fw-bold text-success">{{ formatValue(status.nh3, 'ppm') }}</div>
                    </div>
                    <div class="col-4">
                      <small class="text-muted">H2S</small>
                      <div class="fw-bold text-danger">{{ formatValue(status.h2s, 'ppm') }}</div>
                    </div>
                  </div>
                </div>
                <small class="text-muted">최종 업데이트: {{ formatDateTime(status.rcvtime) }}</small>
              </div>
            </div>
          </div>
        </div>

        <!-- 필터 및 검색 섹션 -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">검색 조건</h5>
                
                <div class="row g-3">
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
                  <div class="col-md-2">
                    <label class="form-label">종료일</label>
                    <input 
                      type="date" 
                      class="form-control" 
                      v-model="filters.end_date"
                    >
                  </div>
                  
                  <!-- 차트 타입 -->
                  <div class="col-md-2">
                    <label class="form-label">차트 타입</label>
                    <select class="form-select" v-model="filters.chart_type">
                      <option value="hourly">시간별 평균</option>
                      <option value="daily">일별 평균</option>
                      <option value="raw">원본 데이터</option>
                    </select>
                  </div>
                  
                  <!-- 버튼 -->
                  <div class="col-md-2">
                    <label class="form-label">&nbsp;</label>
                    <div class="d-flex gap-2">
                      <button type="button" class="btn btn-primary" @click="searchData">
                        <i class="bi bi-search"></i>
                      </button>
                      <button type="button" class="btn btn-secondary" @click="resetFilters">
                        <i class="bi bi-arrow-clockwise"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 차트 섹션 -->
        <div class="row mb-4" v-if="chartData.length > 0 && filters.chart_type !== 'raw'">
          <!-- 온도/습도 차트 -->
          <div class="col-lg-6 mb-4">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">온도 / 습도</h5>
                <canvas ref="tempHumiChart" width="400" height="200"></canvas>
              </div>
            </div>
          </div>
          
          <!-- 가스 농도 차트 -->
          <div class="col-lg-6 mb-4">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">가스 농도 (CO2, NH3, H2S)</h5>
                <canvas ref="gasChart" width="400" height="200"></canvas>
              </div>
            </div>
          </div>
          
          <!-- 예비 센서 차트 -->
          <div class="col-lg-12 mb-4" v-if="hasReserveData">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">예비 센서 (RES1, RES2, RES3)</h5>
                <canvas ref="reserveChart" width="800" height="200"></canvas>
              </div>
            </div>
          </div>
        </div>

        <!-- 통계 정보 -->
        <div class="row mb-4" v-if="statistics">
          <div class="col-12">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">통계 정보</h5>
                <div class="row">
                  <div class="col-md-3">
                    <div class="stats-item">
                      <h6>온도</h6>
                      <p>평균: {{ formatValue(statistics.avg_temp, '°C') }}</p>
                      <p>최저: {{ formatValue(statistics.min_temp, '°C') }}</p>
                      <p>최고: {{ formatValue(statistics.max_temp, '°C') }}</p>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="stats-item">
                      <h6>습도</h6>
                      <p>평균: {{ formatValue(statistics.avg_humi, '%') }}</p>
                      <p>최저: {{ formatValue(statistics.min_humi, '%') }}</p>
                      <p>최고: {{ formatValue(statistics.max_humi, '%') }}</p>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="stats-item">
                      <h6>CO2</h6>
                      <p>평균: {{ formatValue(statistics.avg_co2, 'ppm') }}</p>
                      <p>최고: {{ formatValue(statistics.max_co2, 'ppm') }}</p>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="stats-item">
                      <h6>기타</h6>
                      <p>총 기록: {{ formatNumber(statistics.total_records) }}건</p>
                      <p>돈방 수: {{ statistics.unique_rooms }}개</p>
                      <p>기기 수: {{ statistics.unique_devices }}개</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 원본 데이터 테이블 -->
        <div class="row" v-if="filters.chart_type === 'raw'">
          <div class="col-12">
            <div class="card">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h5 class="card-title mb-0">센서 데이터 목록</h5>
                  <button type="button" class="btn btn-success" @click="refreshData">
                    <i class="bi bi-arrow-clockwise me-1"></i> 새로고침
                  </button>
                </div>

                <!-- 테이블 -->
                <div class="table-responsive">
                  <table class="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th>번호</th>
                        <th>돈방</th>
                        <th>기기</th>
                        <th>수신시간</th>
                        <th>온도(°C)</th>
                        <th>습도(%)</th>
                        <th>CO2(ppm)</th>
                        <th>NH3(ppm)</th>
                        <th>H2S(ppm)</th>
                        <th>알람</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in sensorData" :key="item.idx" v-if="!loading">
                        <td>{{ item.idx }}</td>
                        <td><span class="badge bg-primary">{{ item.gwid }}</span></td>
                        <td><span class="badge bg-info">{{ item.devid }}</span></td>
                        <td>{{ formatDateTime(item.rcvtime) }}</td>
                        <td class="text-end">{{ formatValue(item.temp) }}</td>
                        <td class="text-end">{{ formatValue(item.humi) }}</td>
                        <td class="text-end">{{ formatValue(item.co2) }}</td>
                        <td class="text-end">{{ formatValue(item.nh3) }}</td>
                        <td class="text-end">{{ formatValue(item.h2s) }}</td>
                        <td>
                          <span v-if="hasAlarm(item)" class="badge bg-danger">
                            <i class="bi bi-exclamation-triangle"></i>
                          </span>
                          <span v-else class="badge bg-success">정상</span>
                        </td>
                      </tr>
                      
                      <!-- 로딩 상태 -->
                      <tr v-if="loading">
                        <td colspan="10" class="text-center py-4">
                          <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                          </div>
                          <div class="mt-2">데이터를 불러오는 중...</div>
                        </td>
                      </tr>
                      
                      <!-- 데이터 없음 -->
                      <tr v-if="!loading && sensorData.length === 0">
                        <td colspan="10" class="text-center py-4 text-muted">
                          <i class="bi bi-inbox fs-1 mb-3 d-block"></i>
                          데이터가 없습니다.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- 페이지네이션 -->
                <div class="d-flex justify-content-between align-items-center mt-3" v-if="pagination && pagination.total > 0">
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
import { ref, onMounted, onUnmounted, computed, nextTick, watch } from 'vue'

// Use custom layout
definePageMeta({
  layout: false
})

// Page head
useHead({
  title: '센서 데이터 모니터링',
  meta: [
    { name: 'description', content: '돈방 센서 데이터 모니터링 및 그래프 분석 페이지' }
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

// Chart.js import (클라이언트 사이드에서만)
let Chart = null

// Chart.js 로드 함수
const loadChart = async () => {
  if (!process.client || Chart) return Chart
  
  try {
    const chartModule = await import('chart.js/auto')
    Chart = chartModule.default
    return Chart
  } catch (error) {
    console.error('Chart.js 로드 실패:', error)
    return null
  }
}

// Reactive data
const sensorData = ref([])
const chartData = ref([])
const statistics = ref(null)
const latestStatus = ref([])
const loading = ref(false)

// 차트 참조
const tempHumiChart = ref(null)
const gasChart = ref(null)
const reserveChart = ref(null)

// 차트 인스턴스
const tempHumiChartInstance = ref(null)
const gasChartInstance = ref(null)
const reserveChartInstance = ref(null)

// 필터 상태
const filters = ref({
  gwid: '',
  devid: '',
  start_date: '',
  end_date: '',
  chart_type: 'hourly'
})

// 페이지네이션 상태
const pagination = ref({
  page: 1,
  limit: 100,
  total: 0,
  totalPages: 0
})

// Computed
const visiblePages = computed(() => {
  if (!pagination.value.totalPages) return []
  
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

const hasReserveData = computed(() => {
  return chartData.value.some(item => item.res1 || item.res2 || item.res3)
})

// Methods
const loadSensorData = async () => {
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
    
    console.log('센서 데이터 로드 시작:', params)
    
    const response = await $fetch('/api/v1/feeding/sen-status', {
      method: 'GET',
      query: params
    })
    
    if (response.success) {
      if (filters.value.chart_type === 'raw') {
        sensorData.value = response.data.records || []
        pagination.value = response.data.pagination || pagination.value
      } else {
        chartData.value = response.data.records || []
        await nextTick()
        updateCharts()
      }
      
      statistics.value = response.data.statistics || null
      latestStatus.value = response.data.latest_status || []
      
      console.log('데이터 로드 성공:', {
        records: response.data.records?.length || 0,
        chart_type: filters.value.chart_type
      })
    } else {
      throw new Error(response.message || 'Failed to load sensor data')
    }
    
  } catch (error) {
    console.error('센서 데이터 로드 오류:', error)
    
    let errorMessage = '센서 데이터를 불러오는데 실패했습니다.'
    
    if (error.data?.message) {
      errorMessage = error.data.message
    } else if (error.message) {
      errorMessage += '\n오류: ' + error.message
    }
    
    if (error.statusCode === 500) {
      errorMessage += '\n\n해결 방법:'
      errorMessage += '\n- 데이터베이스 연결 상태를 확인해주세요'
      errorMessage += '\n- tbl_raw_sen_status 테이블이 존재하는지 확인해주세요'
    }
    
    alert(errorMessage)
  } finally {
    loading.value = false
  }
}

const updateCharts = async () => {
  // Chart.js 동적 로드
  const ChartJS = await loadChart()
  if (!ChartJS || !process.client || chartData.value.length === 0) return
  
  // 차트 데이터 준비
  const labels = chartData.value.map(item => item.time_group).reverse()
  const tempData = chartData.value.map(item => parseFloat(item.temp) || 0).reverse()
  const humiData = chartData.value.map(item => parseFloat(item.humi) || 0).reverse()
  const co2Data = chartData.value.map(item => parseFloat(item.co2) || 0).reverse()
  const nh3Data = chartData.value.map(item => parseFloat(item.nh3) || 0).reverse()
  const h2sData = chartData.value.map(item => parseFloat(item.h2s) || 0).reverse()
  
  // 온도/습도 차트
  if (tempHumiChart.value) {
    if (tempHumiChartInstance.value) {
      tempHumiChartInstance.value.destroy()
    }
    
    tempHumiChartInstance.value = new ChartJS(tempHumiChart.value, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: '온도(°C)',
            data: tempData,
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.1)',
            yAxisID: 'y'
          },
          {
            label: '습도(%)',
            data: humiData,
            borderColor: 'rgb(54, 162, 235)',
            backgroundColor: 'rgba(54, 162, 235, 0.1)',
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: '시간'
            }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: '온도(°C)'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: '습도(%)'
            },
            grid: {
              drawOnChartArea: false,
            },
          }
        }
      }
    })
  }
  
  // 가스 농도 차트
  if (gasChart.value) {
    if (gasChartInstance.value) {
      gasChartInstance.value.destroy()
    }
    
    gasChartInstance.value = new ChartJS(gasChart.value, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'CO2(ppm)',
            data: co2Data,
            borderColor: 'rgb(255, 205, 86)',
            backgroundColor: 'rgba(255, 205, 86, 0.1)'
          },
          {
            label: 'NH3(ppm)',
            data: nh3Data,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.1)'
          },
          {
            label: 'H2S(ppm)',
            data: h2sData,
            borderColor: 'rgb(153, 102, 255)',
            backgroundColor: 'rgba(153, 102, 255, 0.1)'
          }
        ]
      },
      options: {
        responsive: true,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: '시간'
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: '농도(ppm)'
            }
          }
        }
      }
    })
  }
  
  // 예비 센서 차트
  if (reserveChart.value && hasReserveData.value) {
    if (reserveChartInstance.value) {
      reserveChartInstance.value.destroy()
    }
    
    const res1Data = chartData.value.map(item => parseFloat(item.res1) || 0).reverse()
    const res2Data = chartData.value.map(item => parseFloat(item.res2) || 0).reverse()
    const res3Data = chartData.value.map(item => parseFloat(item.res3) || 0).reverse()
    
    reserveChartInstance.value = new ChartJS(reserveChart.value, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'RES1',
            data: res1Data,
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.1)'
          },
          {
            label: 'RES2',
            data: res2Data,
            borderColor: 'rgb(54, 162, 235)',
            backgroundColor: 'rgba(54, 162, 235, 0.1)'
          },
          {
            label: 'RES3',
            data: res3Data,
            borderColor: 'rgb(255, 205, 86)',
            backgroundColor: 'rgba(255, 205, 86, 0.1)'
          }
        ]
      },
      options: {
        responsive: true,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: '시간'
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: '값'
            }
          }
        }
      }
    })
  }
}

const searchData = () => {
  pagination.value.page = 1
  loadSensorData()
}

const resetFilters = () => {
  filters.value = {
    gwid: '',
    devid: '',
    start_date: '',
    end_date: '',
    chart_type: 'hourly'
  }
  pagination.value.page = 1
  loadSensorData()
}

const refreshData = () => {
  loadSensorData()
}

const goToPage = (page) => {
  if (page >= 1 && page <= pagination.value.totalPages) {
    pagination.value.page = page
    loadSensorData()
  }
}

// 포맷팅 함수들
const formatDateTime = (dateTime) => {
  if (!dateTime) return ''
  
  // 문자열이 20230719175231 형태인지 확인
  if (typeof dateTime === 'string' && /^\d{14}$/.test(dateTime)) {
    try {
      const year = dateTime.substring(0, 4)
      const month = dateTime.substring(4, 6)
      const day = dateTime.substring(6, 8)
      const hour = dateTime.substring(8, 10)
      const minute = dateTime.substring(10, 12)
      const second = dateTime.substring(12, 14)
      
      return `${year}-${month}-${day} ${hour}:${minute}:${second}`
    } catch (error) {
      return dateTime
    }
  }
  
  return dateTime
}

const formatValue = (value, unit = '') => {
  if (!value && value !== 0) return '-'
  const num = parseFloat(value)
  if (isNaN(num)) return '-'
  return num.toFixed(2) + unit
}

const formatNumber = (number) => {
  if (!number && number !== 0) return '0'
  return Number(number).toLocaleString('ko-KR')
}

const hasAlarm = (item) => {
  return item.alm1 > 0 || item.alm2 > 0 || item.alm3 > 0 || item.alm4 > 0 ||
         item.alm5 > 0 || item.alm6 > 0 || item.alm7 > 0 || item.alm8 > 0
}

// Watch for chart type changes
watch(() => filters.value.chart_type, (newType) => {
  if (newType !== 'raw') {
    sensorData.value = []
    pagination.value = { page: 1, limit: 100, total: 0, totalPages: 0 }
  } else {
    chartData.value = []
    // 차트 인스턴스 정리
    if (tempHumiChartInstance.value) {
      tempHumiChartInstance.value.destroy()
      tempHumiChartInstance.value = null
    }
    if (gasChartInstance.value) {
      gasChartInstance.value.destroy()
      gasChartInstance.value = null
    }
    if (reserveChartInstance.value) {
      reserveChartInstance.value.destroy()
      reserveChartInstance.value = null
    }
  }
})

// 초기 데이터 로드
onMounted(() => {
  // 오늘 날짜로 기본 설정
  const today = new Date().toISOString().split('T')[0]
  filters.value.start_date = '2023-01-01'
  filters.value.end_date = today
  
  loadSensorData()
})

// 컴포넌트 언마운트 시 차트 정리
onUnmounted(() => {
  if (tempHumiChartInstance.value) {
    tempHumiChartInstance.value.destroy()
  }
  if (gasChartInstance.value) {
    gasChartInstance.value.destroy()
  }
  if (reserveChartInstance.value) {
    reserveChartInstance.value.destroy()
  }
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

/* 센서 카드 스타일 */
.sensor-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.sensor-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.sensor-card.border-danger {
  border-color: #dc3545 !important;
  box-shadow: 0 0 10px rgba(220, 53, 69, 0.3);
}

.sensor-data {
  font-size: 0.9rem;
}

/* 통계 아이템 스타일 */
.stats-item {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.stats-item h6 {
  color: #495057;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.stats-item p {
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
}

/* 테이블 스타일 */
.table th {
  background-color: #f8f9fa;
  border-top: 2px solid #dee2e6;
  font-weight: 600;
  color: #495057;
  white-space: nowrap;
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

/* 차트 컨테이너 */
.card canvas {
  max-height: 400px;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .main {
    padding: 1rem;
  }
  
  .pagetitle h1 {
    font-size: 1.5rem;
  }
  
  .sensor-card {
    margin-bottom: 1rem;
  }
  
  .table-responsive {
    font-size: 0.875rem;
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
