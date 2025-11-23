<template>
  <div class="page-wrapper">
    <!-- Admin Header -->
    <AdminHeader />
    
    <!-- Admin Sidebar -->
    <AdminSidebar />
    
    <!-- Main Content -->
    <div class="main with-sidebar">
      <div class="pagetitle">
        <h1>축산의사결정시스템</h1>        
      </div>

      <section class="section dashboard">
        <!-- 돈방 선택 -->
        <div class="room-selector mb-4">
          <select class="form-select" v-model="selectedRoom" @change="onRoomChange">
            <option value="">축사를 선택하세요</option>
            <option 
              v-for="room in roomList" 
              :key="room.room_number" 
              :value="room.room_number"
            >
              {{ room.room_number }}번 축사
            </option>
          </select>
        </div>

        <!-- 통계 카드 섹션 -->
        <div class="row mb-4">
          <div class="col-xxl-2 col-md-4">
            <div class="card info-card">
              <div class="card-body">
                <div class="card-icon">
                  <i class="bi bi-thermometer-half text-success"></i>
                </div>
                <div class="card-info">
                  <h6>현재 온도</h6>
                  <h4>{{ currentStats.temperature }}</h4>
                </div>
              </div>
            </div>
          </div>

          <div class="col-xxl-2 col-md-4">
            <div class="card info-card">
              <div class="card-body">
                <div class="card-icon">
                  <i class="bi bi-bucket text-warning"></i>
                </div>
                <div class="card-info">
                  <h6>총사료급이량</h6>
                  <h4>{{ currentStats.totalFeed }}</h4>
                </div>
              </div>
            </div>
          </div>

          <div class="col-xxl-2 col-md-4">
            <div class="card info-card">
              <div class="card-body">
                <div class="card-icon">
                  <i class="bi bi-droplet text-info"></i>
                </div>
                <div class="card-info">
                  <h6>급수량 상태</h6>
                  <h4>{{ currentStats.waterStatus }}</h4>
                </div>
              </div>
            </div>
          </div>

          <div class="col-xxl-2 col-md-4">
            <div class="card info-card">
              <div class="card-body">
                <div class="card-icon">
                  <i class="bi bi-activity text-primary"></i>
                </div>
                <div class="card-info">
                  <h6>사료량 상태</h6>
                  <h4>{{ currentStats.feedStatus }}</h4>
                </div>
              </div>
            </div>
          </div>

          <div class="col-xxl-2 col-md-4">
            <div class="card info-card">
              <div class="card-body">
                <div class="card-icon">
                  <i class="bi bi-speedometer2 text-success"></i>
                </div>
                <div class="card-info">
                  <h6>사료 상태</h6>
                  <h4>{{ currentStats.feedCondition }}</h4>
                </div>
              </div>
            </div>
          </div>

          <div class="col-xxl-2 col-md-4">
            <div class="card info-card">
              <div class="card-body">
                <div class="card-icon">
                  <i class="bi bi-gear text-secondary"></i>
                </div>
                <div class="card-info">
                  <h6>장비 상태</h6>
                  <h4>{{ currentStats.equipmentStatus }}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 차트 섹션 -->
        <div class="row">
          <!-- 월별 사료량 차트 -->
          <div class="col-lg-4 mb-4">
            <div class="card">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h5 class="card-title">월별 사료량</h5>
                  <div class="chart-controls">
                    <button class="btn btn-sm btn-primary">금월</button>
                    <button class="btn btn-sm btn-outline-secondary">금주</button>
                  </div>
                </div>
                <div class="chart-container">
                  <canvas ref="monthlyFeedChart" width="400" height="300"></canvas>
                </div>
              </div>
            </div>
          </div>

          <!-- 축사 환경 온도 차트 -->
          <div class="col-lg-4 mb-4">
            <div class="card">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h5 class="card-title">축사 환경 온도</h5>
                  <div class="chart-controls">
                    <button class="btn btn-sm btn-outline-secondary">
                      <i class="bi bi-arrow-clockwise"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary">
                      <i class="bi bi-three-dots"></i>
                    </button>
                  </div>
                </div>
                <div class="chart-container">
                  <canvas ref="temperatureChart" width="400" height="300"></canvas>
                </div>
              </div>
            </div>
          </div>

          <!-- 온도 차트 -->
          <div class="col-lg-4 mb-4">
            <div class="card">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h5 class="card-title">온도</h5>
                  <div class="chart-controls">
                    <button class="btn btn-sm btn-outline-secondary">
                      <i class="bi bi-arrow-clockwise"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary">
                      <i class="bi bi-three-dots"></i>
                    </button>
                  </div>
                </div>
                <div class="chart-container">
                  <canvas ref="tempChart" width="400" height="300"></canvas>
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
import { ref, onMounted, onUnmounted } from 'vue'

// Use custom layout
definePageMeta({
  layout: false
})

// Page head
useHead({
  title: '축산의사결정시스템',
  meta: [
    { name: 'description', content: '축산의사결정시스템 대시보드' }
  ]
})


// Chart.js 로드 함수
let Chart = null
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

// Auth
const { user: currentUser, verifyAuth } = useAuth()

// Reactive data
const selectedRoom = ref('')
const roomList = ref([])
const monthlyFeedChart = ref(null)
const temperatureChart = ref(null)
const tempChart = ref(null)

// 차트 인스턴스
const monthlyFeedChartInstance = ref(null)
const temperatureChartInstance = ref(null)
const tempChartInstance = ref(null)

// 현재 통계 데이터
const currentStats = ref({
  temperature: '25',
  totalFeed: '89.00kg',
  waterStatus: '10',
  feedStatus: '10',
  feedCondition: '정상온도',
  equipmentStatus: '정상온도'
})

// Methods
const loadRoomList = async () => {
  try {
    const { livestock } = useApi()
    const response = await livestock.getRooms()
    
    if (response.success) {
      roomList.value = response.data.rooms
      
      // 첫 번째 축사를 기본 선택
      if (roomList.value.length > 0) {
        selectedRoom.value = roomList.value[0].room_number
      }
    } else {
      console.error('축사 목록 로드 실패:', response.message)
    }
  } catch (error) {
    console.error('축사 목록 로드 중 오류:', error)
  }
}

const onRoomChange = () => {
  console.log('선택된 축사:', selectedRoom.value)
  // 축사 변경 시 통계 데이터 업데이트 로직 추가 가능
  updateStatsForRoom(selectedRoom.value)
}

const updateStatsForRoom = (roomNumber) => {
  // 선택된 축사에 따른 통계 데이터 업데이트
  // 실제 데이터는 API를 통해 가져와야 함
  console.log(`축사 ${roomNumber}의 데이터를 업데이트합니다.`)
}

const initCharts = async () => {
  const ChartJS = await loadChart()
  if (!ChartJS || !process.client) return

  // 월별 사료량 차트 데이터
  const monthlyFeedData = {
    labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    datasets: [{
      label: '사료량',
      data: [460, 458, 455, 443, 445, 448, 470, 460, 445, 444, 455, 460],
      borderColor: '#8B5CF6',
      backgroundColor: 'transparent',
      borderWidth: 3,
      pointBackgroundColor: '#8B5CF6',
      pointBorderColor: '#8B5CF6',
      pointRadius: 4,
      tension: 0.4
    }]
  }

  // 축사 환경 온도 차트 데이터
  const temperatureData = {
    labels: ['2024-05-14', '2024-05-15', '2024-05-16', '2024-05-17', '2024-05-18', '2024-05-19', '2024-05-20'],
    datasets: [{
      label: '온도',
      data: [20.0, 21.5, 22.0, 23.5, 24.0, 24.5, 25.0],
      borderColor: '#8B5CF6',
      backgroundColor: 'transparent',
      borderWidth: 3,
      pointBackgroundColor: '#8B5CF6',
      pointBorderColor: '#8B5CF6',
      pointRadius: 4,
      tension: 0.4
    }]
  }

  // 온도 차트 데이터
  const tempData = {
    labels: ['2024-02-26', '2024-02-27', '2024-02-28', '2024-02-29', '2024-03-01', '2024-03-02', '2024-03-03'],
    datasets: [{
      label: '온도',
      data: [10.0, 11.0, 12.0, 12.5, 13.0, 13.5, 12.5],
      borderColor: '#8B5CF6',
      backgroundColor: 'transparent',
      borderWidth: 3,
      pointBackgroundColor: '#8B5CF6',
      pointBorderColor: '#8B5CF6',
      pointRadius: 4,
      tension: 0.4
    }]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: '#f0f0f0'
        },
        ticks: {
          font: {
            size: 11
          }
        }
      }
    }
  }

  // 월별 사료량 차트 생성
  if (monthlyFeedChart.value) {
    if (monthlyFeedChartInstance.value) {
      monthlyFeedChartInstance.value.destroy()
    }
    monthlyFeedChartInstance.value = new ChartJS(monthlyFeedChart.value, {
      type: 'line',
      data: monthlyFeedData,
      options: chartOptions
    })
  }

  // 축사 환경 온도 차트 생성
  if (temperatureChart.value) {
    if (temperatureChartInstance.value) {
      temperatureChartInstance.value.destroy()
    }
    temperatureChartInstance.value = new ChartJS(temperatureChart.value, {
      type: 'line',
      data: temperatureData,
      options: chartOptions
    })
  }

  // 온도 차트 생성
  if (tempChart.value) {
    if (tempChartInstance.value) {
      tempChartInstance.value.destroy()
    }
    tempChartInstance.value = new ChartJS(tempChart.value, {
      type: 'line',
      data: tempData,
      options: chartOptions
    })
  }
}

// Lifecycle
onMounted(async () => {
  // 인증 체크 및 사용자 정보 로드
  try {
    const isAuthenticated = await verifyAuth()
    if (!isAuthenticated) {
      await navigateTo('/member/login')
      return
    }
    
    console.log('로그인된 사용자:', currentUser.value)
  } catch (error) {
    console.error('Authentication check failed:', error)
    await navigateTo('/member/login')
    return
  }

  // 축사 목록 로드
  await loadRoomList()
  
  // 차트 초기화
  await nextTick()
  setTimeout(initCharts, 100)
})

onUnmounted(() => {
  if (monthlyFeedChartInstance.value) {
    monthlyFeedChartInstance.value.destroy()
  }
  if (temperatureChartInstance.value) {
    temperatureChartInstance.value.destroy()
  }
  if (tempChartInstance.value) {
    tempChartInstance.value.destroy()
  }
})
</script>

<style scoped>
/* 페이지 래퍼 */
.page-wrapper {
  min-height: 100vh;
  background: #f4f6f9;
}

/* 메인 콘텐츠 영역 - 사이드바와 겹치지 않도록 마진 설정 */
.main.with-sidebar {
  margin-left: 280px; /* 사이드바 너비만큼 여백 */
  padding: 20px;
  min-height: calc(100vh - 60px); /* 헤더 높이 제외 */
  transition: all 0.3s;
}

/* 사이드바가 숨겨진 상태에서 메인 콘텐츠 조정 */
body.toggle-sidebar .main.with-sidebar {
  margin-left: 0;
}

/* 반응형 디자인 - 작은 화면에서는 마진 제거 */
@media (max-width: 1199px) {
  .main.with-sidebar {
    margin-left: 0;
  }
}

/* 페이지 제목 */
.pagetitle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.pagetitle h1 {
  font-size: 24px;
  margin: 0;
  font-weight: 600;
  color: #012970;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-name {
  font-weight: 600;
  color: #012970;
}

/* 돈방 선택 */
.room-selector {
  width: 200px;
}

.room-selector .form-select {
  width: 100px;
  display: inline-block;
}

/* 통계 카드 */
.info-card {
  height: 100px;
  border: none;
  border-radius: 10px;
  box-shadow: 0px 0 30px rgba(1, 41, 112, 0.1);
  transition: all 0.3s;
}

.info-card:hover {
  transform: translateY(-5px);
}

.info-card .card-body {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.card-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.card-icon i.text-success {
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.card-icon i.text-warning {
  background: rgba(255, 193, 7, 0.1);
  color: #ffc107;
}

.card-icon i.text-info {
  background: rgba(23, 162, 184, 0.1);
  color: #17a2b8;
}

.card-icon i.text-primary {
  background: rgba(13, 110, 253, 0.1);
  color: #0d6efd;
}

.card-icon i.text-secondary {
  background: rgba(108, 117, 125, 0.1);
  color: #6c757d;
}

.card-info h6 {
  font-size: 14px;
  color: #899bbd;
  font-weight: 400;
  margin: 0 0 5px 0;
}

.card-info h4 {
  font-size: 24px;
  color: #012970;
  font-weight: 700;
  margin: 0;
}

/* 차트 카드 */
.card {
  box-shadow: 0px 0 30px rgba(1, 41, 112, 0.1);
  border: none;
  border-radius: 10px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #012970;
  margin: 0;
}

.chart-controls {
  display: flex;
  gap: 5px;
}

.chart-controls .btn {
  padding: 5px 12px;
  font-size: 12px;
  border-radius: 4px;
}

.chart-container {
  position: relative;
  height: 300px;
  width: 100%;
}

.chart-container canvas {
  max-width: 100%;
  height: 100% !important;
}

/* 반응형 */
@media (max-width: 1200px) {
  .col-lg-4 {
    margin-bottom: 20px;
  }
}

@media (max-width: 768px) {
  .pagetitle {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .pagetitle h1 {
    font-size: 20px;
  }
  
  .info-card .card-body {
    padding: 15px;
    gap: 15px;
  }
  
  .card-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }
  
  .card-info h4 {
    font-size: 20px;
  }
  
  .chart-container {
    height: 250px;
  }
}

@media (max-width: 576px) {
  .col-xxl-2 {
    margin-bottom: 15px;
  }
  
  .info-card {
    height: auto;
  }
  
  .info-card .card-body {
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }
}
</style>