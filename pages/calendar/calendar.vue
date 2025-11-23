<template>
  <div>
    <Head>
      <title>일정관리 - LSMMS</title>
    </Head>

    <div class="container-fluid">
      <!-- 페이지 헤더 -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center">
            <h1 class="h3 mb-0 text-gray-800">
              <i class="bi bi-calendar3 me-2"></i>일정관리
            </h1>
            <button 
              class="btn btn-primary"
              @click="showEventModal()"
            >
              <i class="bi bi-plus-circle me-1"></i>
              새 일정 등록
            </button>
          </div>
        </div>
      </div>

      <!-- 상단 레이아웃: 좌측 캘린더 + 우측 일정 목록 -->
      <div class="row mb-4">
        <!-- 좌측: 캘린더 -->
        <div class="col-lg-7 col-md-12 mb-3">
          <div class="card shadow">
            <div class="card-header">
              <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                  <button 
                    class="btn btn-outline-primary btn-sm me-2"
                    @click="changeMonth(-1)"
                  >
                    <i class="bi bi-chevron-left"></i>
                  </button>
                  <h5 class="mb-0 me-2">{{ currentYear }}년 {{ currentMonth }}월</h5>
                  <button 
                    class="btn btn-outline-primary btn-sm"
                    @click="changeMonth(1)"
                  >
                    <i class="bi bi-chevron-right"></i>
                  </button>
                </div>
                <button 
                  class="btn btn-outline-secondary btn-sm"
                  @click="goToToday()"
                >
                  <i class="bi bi-house me-1"></i>오늘
                </button>
              </div>
            </div>
            <div class="card-body p-0">
              <!-- 요일 헤더 -->
              <div class="row g-0 border-bottom bg-light">
                <div 
                  v-for="day in weekDays" 
                  :key="day"
                  class="col border-end text-center py-2 fw-bold"
                  :class="{ 'text-danger': day === '일', 'text-primary': day === '토' }"
                >
                  {{ day }}
                </div>
              </div>

              <!-- 캘린더 날짜 그리드 -->
              <div class="calendar-grid">
                <div 
                  v-for="week in calendarWeeks" 
                  :key="week[0]?.date || 'empty'"
                  class="row g-0"
                >
                  <div 
                    v-for="(day, dayIndex) in week"
                    :key="day?.date || `empty-${dayIndex}`"
                    class="col border-end border-bottom calendar-day"
                    :class="{
                      'other-month': day && !day.isCurrentMonth,
                      'today': day && day.isToday,
                      'selected': day && day.date === selectedDate,
                      'has-events': day && day.events && day.events.length > 0
                    }"
                    @click="day && selectDate(day.date)"
                  >
                    <div class="day-content p-1" style="min-height: 80px;">
                      <div v-if="day" class="day-header d-flex justify-content-between align-items-start mb-1">
                        <span 
                          class="day-number fw-bold"
                          :class="{
                            'text-muted': !day.isCurrentMonth,
                            'text-danger': day.dayOfWeek === 0,
                            'text-primary': day.dayOfWeek === 6
                          }"
                        >
                          {{ day.dayOfMonth }}
                        </span>
                      </div>
                      
                      <!-- 일정 개수 표시 -->
                      <div v-if="day && day.events && day.events.length > 0" class="events-indicator">
                        <span class="badge bg-primary rounded-pill">{{ day.events.length }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 우측: 일정 목록 표 -->
        <div class="col-lg-5 col-md-12 mb-3">
          <div class="card shadow">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">
                <i class="bi bi-list-ul me-2"></i>일정 목록
              </h5>
              <div class="btn-group btn-group-sm">
                <button 
                  class="btn btn-outline-info"
                  :class="{ active: eventFilter === 'all' }"
                  @click="resetFilter"
                >
                  전체
                </button>
                <button 
                  class="btn btn-outline-info"
                  :class="{ active: eventFilter === 'today' }"
                  @click="eventFilter = 'today'"
                >
                  오늘
                </button>
                <button 
                  class="btn btn-outline-info"
                  :class="{ active: eventFilter === 'week' }"
                  @click="eventFilter = 'week'"
                >
                  이번주
                </button>
                <button 
                  class="btn btn-outline-success"
                  :class="{ active: eventFilter === 'selected' }"
                  @click="eventFilter = 'selected'"
                  v-if="selectedDate"
                >
                  <i class="bi bi-calendar-check me-1"></i>
                  {{ selectedDate ? formatDisplayDate(selectedDate) : '날짜 선택' }}
                </button>
              </div>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive" style="max-height: 500px; overflow-y: auto;">
                <table class="table table-sm table-hover mb-0">
                  <thead class="table-light sticky-top">
                    <tr>
                      <th style="width: 30%">날짜</th>
                      <th style="width: 45%">제목</th>
                      <th style="width: 25%">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr 
                      v-for="event in filteredEvents" 
                      :key="event.id"
                    >
                      <td>
                        <div class="d-flex flex-column">
                          <small class="fw-bold">{{ formatShortDate(event.start_date) }}</small>
                          <small v-if="event.start_date !== event.end_date" class="fw-bold">
                            ~ {{ formatShortDate(event.end_date) }}
                          </small>
                        </div>
                      </td>
                      <td>
                        <div class="d-flex flex-column">
                          <span class="fw-bold">{{ event.title }}</span>
                          <small v-if="event.contents" class="text-muted text-truncate" style="max-width: 200px;">
                            <i class="bi bi-file-text me-1"></i>{{ event.contents }}
                          </small>
                          <small v-if="event.url" class="text-muted">
                            <i class="bi bi-link-45deg"></i> URL 포함
                          </small>
                        </div>
                      </td>
                      <td>
                        <div class="btn-group btn-group-sm">
                          <button 
                            class="btn btn-outline-info" 
                            @click="viewEventDetail(event)"
                            title="상세보기"
                          >
                            <i class="bi bi-eye"></i>
                          </button>
                          <button 
                            class="btn btn-outline-primary" 
                            @click="editEvent(event)"
                            title="수정"
                          >
                            <i class="bi bi-pencil"></i>
                          </button>
                          <button 
                            class="btn btn-outline-danger" 
                            @click="confirmDeleteEvent(event)"
                            title="삭제"
                          >
                            <i class="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr v-if="filteredEvents.length === 0">
                      <td colspan="3" class="text-center text-muted py-4">
                        <i class="bi bi-calendar-x me-2"></i>
                        <span v-if="eventFilter === 'all'">등록된 일정이 없습니다.</span>
                        <span v-else-if="eventFilter === 'today'">오늘 일정이 없습니다.</span>
                        <span v-else-if="eventFilter === 'week'">이번주 일정이 없습니다.</span>
                        <span v-else-if="eventFilter === 'selected'">{{ selectedDate ? formatShortDate(selectedDate) : '선택된 날짜' }}에 일정이 없습니다.</span>
                        <span v-else>해당 기간에 일정이 없습니다.</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>

    <!-- 일정 등록/수정 모달 -->
    <div 
      class="modal fade" 
      id="eventModal" 
      tabindex="-1" 
      ref="eventModalRef"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-calendar-plus me-2"></i>
              {{ isEditMode ? '일정 수정' : '새 일정 등록' }}
            </h5>
            <button 
              type="button" 
              class="btn-close" 
              data-bs-dismiss="modal"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveEvent">
              <div class="mb-3">
                <label for="eventTitle" class="form-label">일정 제목 <span class="text-danger">*</span></label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="eventTitle"
                  v-model="eventForm.title"
                  required
                  maxlength="50"
                  placeholder="일정 제목을 입력하세요"
                >
              </div>
              
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="eventStartDate" class="form-label">시작일 <span class="text-danger">*</span></label>
                  <input 
                    type="date" 
                    class="form-control" 
                    id="eventStartDate"
                    v-model="eventForm.start_date"
                    required
                  >
                </div>
                <div class="col-md-6 mb-3">
                  <label for="eventEndDate" class="form-label">종료일</label>
                  <input 
                    type="date" 
                    class="form-control" 
                    id="eventEndDate"
                    v-model="eventForm.end_date"
                    :min="eventForm.start_date"
                  >
                </div>
              </div>
              
              <div class="mb-3">
                <label for="eventUrl" class="form-label">관련 URL</label>
                <input 
                  type="url" 
                  class="form-control" 
                  id="eventUrl"
                  v-model="eventForm.url"
                  maxlength="200"
                  placeholder="https://example.com"
                >
              </div>
              
              <div class="mb-3">
                <label for="eventContents" class="form-label">상세 내용</label>
                <textarea 
                  class="form-control" 
                  id="eventContents"
                  v-model="eventForm.contents"
                  rows="4"
                  placeholder="일정에 대한 상세 내용을 입력하세요"
                  style="resize: vertical;"
                ></textarea>
                <div class="form-text">
                  일정의 상세 설명, 준비사항, 참고사항 등을 입력할 수 있습니다.
                </div>
              </div>
              
              <div class="mb-3">
                <label for="eventCreator" class="form-label">등록자</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="eventCreator"
                  v-model="eventForm.crdt_id"
                  maxlength="50"
                  placeholder="등록자 ID"
                >
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button 
              type="button" 
              class="btn btn-secondary" 
              data-bs-dismiss="modal"
            >
              취소
            </button>
            <button 
              type="button" 
              class="btn btn-primary"
              @click="saveEvent"
              :disabled="!eventForm.title || !eventForm.start_date"
            >
              <i class="bi bi-check-circle me-1"></i>
              {{ isEditMode ? '수정' : '등록' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 일정 상세보기 모달 -->
    <div 
      class="modal fade" 
      id="eventDetailModal" 
      tabindex="-1" 
      ref="eventDetailModalRef"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">
              <i class="bi bi-calendar-event me-2"></i>
              일정 상세정보
            </h5>
            <button 
              type="button" 
              class="btn-close btn-close-white" 
              data-bs-dismiss="modal"
            ></button>
          </div>
          <div class="modal-body" v-if="selectedEventDetail">
            <div class="row">
              <div class="col-md-8">
                <h4 class="text-primary mb-3">
                  <i class="bi bi-calendar-check me-2"></i>
                  {{ selectedEventDetail.title }}
                </h4>
                
                <div class="mb-4" v-if="selectedEventDetail.contents && selectedEventDetail.contents.trim()">
                  <h6 class="text-secondary mb-2">
                    <i class="bi bi-file-text me-1"></i>상세 내용
                  </h6>
                  <div class="bg-light p-3 rounded border">
                    <pre class="mb-0" style="white-space: pre-wrap; font-family: inherit;">{{ selectedEventDetail.contents }}</pre>
                  </div>
                </div>

                
                <div class="mb-3" v-if="selectedEventDetail.url">
                  <h6 class="text-secondary mb-2">
                    <i class="bi bi-link-45deg me-1"></i>관련 URL
                  </h6>
                  <a 
                    :href="selectedEventDetail.url" 
                    target="_blank" 
                    class="btn btn-outline-primary btn-sm"
                  >
                    <i class="bi bi-box-arrow-up-right me-1"></i>
                    {{ selectedEventDetail.url }}
                  </a>
                </div>
              </div>
              
              <div class="col-md-4">
                <div class="card bg-light">
                  <div class="card-body">
                    <h6 class="card-title text-secondary">
                      <i class="bi bi-info-circle me-1"></i>일정 정보
                    </h6>
                    
                    <div class="mb-3">
                      <small class="text-muted d-block">시작일</small>
                      <div class="fw-bold text-primary">
                        <i class="bi bi-calendar-date me-1"></i>
                        {{ formatDisplayDate(selectedEventDetail.start_date) }}
                      </div>
                    </div>
                    
                    <div class="mb-3" v-if="selectedEventDetail.start_date !== selectedEventDetail.end_date">
                      <small class="text-muted d-block">종료일</small>
                      <div class="fw-bold text-primary">
                        <i class="bi bi-calendar-date me-1"></i>
                        {{ formatDisplayDate(selectedEventDetail.end_date) }}
                      </div>
                    </div>
                    
                    <div class="mb-3" v-if="selectedEventDetail.crdt_id">
                      <small class="text-muted d-block">등록자</small>
                      <div class="fw-bold">
                        <i class="bi bi-person me-1"></i>
                        {{ selectedEventDetail.crdt_id }}
                      </div>
                    </div>
                    
                    <div v-if="selectedEventDetail.crdt_date">
                      <small class="text-muted d-block">등록일</small>
                      <div class="fw-bold">
                        <i class="bi bi-clock me-1"></i>
                        {{ formatDisplayDateTime(selectedEventDetail.crdt_date) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button 
              type="button" 
              class="btn btn-primary"
              @click="editEventFromDetail"
            >
              <i class="bi bi-pencil me-1"></i>
              수정하기
            </button>
            <button 
              type="button" 
              class="btn btn-secondary" 
              data-bs-dismiss="modal"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
// import { useApiClient } from '@/composables/useApiClient' // Nuxt auto-import 사용

// 페이지 메타데이터
definePageMeta({
  layout: 'admin'
})

// 페이지 제목
useHead({
  title: '일정관리 - LSMMS'
})

// 타입 정의
interface CalendarEvent {
  id: number
  title: string
  start_date: string
  end_date: string
  url?: string
  contents?: string
  crdt_id: string
  crdt_date?: string
}

interface CalendarDay {
  date: string
  dayOfMonth: number
  dayOfWeek: number
  isCurrentMonth: boolean
  isToday: boolean
  events: CalendarEvent[]
}

// API 클라이언트를 함수 내에서 호출하도록 변경

// 반응형 데이터
const currentDate = ref(new Date())
const events = ref<CalendarEvent[]>([])
const selectedDate = ref<string>('')
const eventModalRef = ref<HTMLElement | null>(null)
const eventDetailModalRef = ref<HTMLElement | null>(null)
const isEditMode = ref(false)
const eventFilter = ref<'all' | 'today' | 'week' | 'selected'>('all')
const selectedEventDetail = ref<CalendarEvent | null>(null)

// 이벤트 폼 데이터
const eventForm = ref({
  id: null as number | null,
  title: '',
  start_date: '',
  end_date: '',
  url: '',
  contents: '',
  crdt_id: 'admin'
})

// 요일 배열
const weekDays = ['일', '월', '화', '수', '목', '금', '토']

// 현재 년/월
const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth() + 1)

// 필터링된 이벤트 목록
const filteredEvents = computed(() => {
  const today = formatDate(new Date())
  const oneWeekLater = formatDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
  
  switch (eventFilter.value) {
    case 'today':
      return events.value.filter(event => 
        event.start_date <= today && event.end_date >= today
      ).sort((a, b) => a.start_date.localeCompare(b.start_date))
    
    case 'week':
      return events.value.filter(event => 
        event.start_date <= oneWeekLater && event.end_date >= today
      ).sort((a, b) => a.start_date.localeCompare(b.start_date))
    
    case 'selected':
      if (!selectedDate.value) {
        return []
      }
      const filtered = events.value.filter(event => 
        event.start_date <= selectedDate.value && event.end_date >= selectedDate.value
      ).sort((a, b) => a.start_date.localeCompare(b.start_date))
      
      console.log('=== 선택된 날짜 필터링 ===')
      console.log('선택된 날짜:', selectedDate.value)
      console.log('전체 이벤트 수:', events.value.length)
      console.log('필터링된 이벤트 수:', filtered.length)
      console.log('필터링된 이벤트:', filtered)
      console.log('==========================')
      
      return filtered
    
    default: // all
      return events.value.sort((a, b) => a.start_date.localeCompare(b.start_date))
  }
})

// 캘린더 주 배열 생성
const calendarWeeks = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const firstDayOfWeek = firstDay.getDay()
  const daysInMonth = lastDay.getDate()
  
  const weeks: CalendarDay[][] = []
  let currentWeek: CalendarDay[] = []
  
  // 이전 달의 날짜들로 첫 주 채우기
  const prevMonth = new Date(year, month - 2, 0)
  const prevMonthDays = prevMonth.getDate()
  
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month - 2, prevMonthDays - i)
    currentWeek.push(createDayObject(date, false))
  }
  
  // 현재 달의 날짜들
  for (let day = 1; day <= daysInMonth; day++) {
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
    
    const date = new Date(year, month - 1, day)
    currentWeek.push(createDayObject(date, true))
  }
  
  // 다음 달의 날짜들로 마지막 주 채우기
  let nextMonthDay = 1
  while (currentWeek.length < 7) {
    const date = new Date(year, month, nextMonthDay)
    currentWeek.push(createDayObject(date, false))
    nextMonthDay++
  }
  weeks.push(currentWeek)
  
  return weeks
})

// 날짜 객체 생성 헬퍼
const createDayObject = (date: Date, isCurrentMonth: boolean): CalendarDay => {
  const today = new Date()
  const dateStr = formatDate(date)
  const dayEvents = events.value.filter(event => 
    event.start_date <= dateStr && event.end_date >= dateStr
  )
  
  // 디버깅: 특정 날짜에 대해서만 로그 출력
  if (date.getDate() === 25 && date.getMonth() === 7) { // 8월 25일
    console.log('=== 8월 25일 날짜 객체 생성 ===')
    console.log('원본 Date 객체:', date)
    console.log('포맷된 날짜 문자열:', dateStr)
    console.log('dayOfMonth:', date.getDate())
    console.log('month:', date.getMonth() + 1)
    console.log('===============================')
  }
  
  return {
    date: dateStr,
    dayOfMonth: date.getDate(),
    dayOfWeek: date.getDay(),
    isCurrentMonth,
    isToday: date.toDateString() === today.toDateString(),
    events: dayEvents
  }
}

// 날짜 포맷팅 (로컬 시간대 기준)
const formatDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 표시용 날짜 포맷팅 (시간대 문제 해결)
const formatDisplayDate = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day) // 로컬 시간대로 생성
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short'
  })
}

// 짧은 날짜 포맷팅 (DD/MM/YY 형식)
const formatShortDate = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-').map(Number)
  const shortYear = year.toString().slice(-2) // 마지막 2자리만
  const result = `${shortYear}/${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}`
  
  
  return result
}

// 월 변경
const changeMonth = (delta: number) => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() + delta)
  currentDate.value = newDate
  
  // 월이 변경되면 선택된 날짜 초기화
  if (eventFilter.value === 'selected') {
    resetFilter()
  }
  
  fetchEvents()
}

// 오늘로 이동
const goToToday = () => {
  currentDate.value = new Date()
  
  // 오늘로 이동하면 선택된 날짜 초기화
  if (eventFilter.value === 'selected') {
    resetFilter()
  }
  
  fetchEvents()
}

// 날짜 선택
const selectDate = (dateStr: string) => {
  selectedDate.value = dateStr
  eventFilter.value = 'selected'
  console.log('=== 날짜 선택 디버깅 ===')
  console.log('클릭한 날짜 문자열:', dateStr)
  console.log('표시용 날짜:', formatDisplayDate(dateStr))
  console.log('필터 변경됨:', eventFilter.value)
  console.log('해당 날짜의 일정:', events.value.filter(event => 
    event.start_date <= dateStr && event.end_date >= dateStr
  ))
  console.log('=========================')
}

// 필터 초기화
const resetFilter = () => {
  eventFilter.value = 'all'
  selectedDate.value = ''
  console.log('필터 초기화됨')
}

// 이벤트 수정
const editEvent = (event: CalendarEvent) => {
  console.log('이벤트 수정:', event)
  showEventModal(event.start_date, event)
}

// 이벤트 삭제 확인
const confirmDeleteEvent = (event: CalendarEvent) => {
  console.log('이벤트 삭제 확인:', event)
  if (confirm(`"${event.title}" 일정을 삭제하시겠습니까?`)) {
    deleteEventById(event.id)
  }
}

// 이벤트 목록 조회
const fetchEvents = async () => {
  try {
    console.log('이벤트 목록 조회 시작:', currentYear.value, currentMonth.value)
    const response = await $fetch(`/api/v1/calendar/events?year=${currentYear.value}&month=${currentMonth.value}`) as any
    
    alert("response: " + response)
      console.log('이벤트 API 응답:', response)
    
    if (response && response.success) {
      events.value = response.data.events || []
      console.log('이벤트 목록 로드 완료:', events.value.length, '개')
      console.log('첫 번째 이벤트 데이터:', events.value[0])
      if (events.value[0]) {
        console.log('첫 번째 이벤트 contents:', events.value[0].contents)
      }
    } else {
      console.error('이벤트 API 응답이 성공적이지 않음:', response)
      events.value = []
    }
  } catch (error: any) {
    console.error('이벤트 목록 조회 오류:', error)
    events.value = []
    // 개발용 샘플 데이터
    events.value = [
      {
        id: 1,
        title: '샘플 일정',
        start_date: formatDate(new Date()),
        end_date: formatDate(new Date()),
        url: '',
        contents: '이것은 샘플 일정의 상세 내용입니다. 실제 데이터베이스 연결 후에는 실제 일정 데이터가 표시됩니다.',
        crdt_id: 'admin',
        crdt_date: new Date().toISOString()
      },
      {
        id: 2,
        title: '8월 25일 테스트 일정',
        start_date: '2024-08-25',
        end_date: '2024-08-25',
        url: '',
        contents: '8월 25일 날짜 선택 테스트를 위한 일정입니다.',
        crdt_id: 'admin',
        crdt_date: new Date().toISOString()
      },
      {
        id: 3,
        title: '8월 24일 테스트 일정',
        start_date: '2024-08-24',
        end_date: '2024-08-24',
        url: '',
        contents: '8월 24일 일정입니다. 25일 클릭 시 이 일정이 나오면 안됩니다.',
        crdt_id: 'admin',
        crdt_date: new Date().toISOString()
      },
      {
        id: 4,
        title: '2025년 8월 24일 테스트',
        start_date: '2025-08-24',
        end_date: '2025-08-24',
        url: '',
        contents: '2025년 날짜 형식 테스트 (24/08/25로 표시되어야 함)',
        crdt_id: 'admin',
        crdt_date: new Date().toISOString()
      }
    ]
    console.log('샘플 데이터 로드됨:', events.value)
    console.log('샘플 데이터 contents:', events.value[0].contents)
  }
}

// 이벤트 모달 표시
const showEventModal = (dateStr?: string, event?: CalendarEvent) => {
  if (event) {
    // 수정 모드
    console.log('수정 모드 - 이벤트 데이터:', event)
    console.log('수정 모드 - Contents 값:', event.contents)
    
    isEditMode.value = true
    eventForm.value = {
      id: event.id,
      title: event.title,
      start_date: event.start_date,
      end_date: event.end_date || event.start_date,
      url: event.url || '',
      contents: event.contents || '',
      crdt_id: event.crdt_id || 'admin'
    }
    
    console.log('수정 모드 - eventForm 설정 후:', eventForm.value)
    console.log('수정 모드 - eventForm.contents:', eventForm.value.contents)
  } else {
    // 등록 모드
    isEditMode.value = false
    eventForm.value = {
      id: null,
      title: '',
      start_date: dateStr || formatDate(new Date()),
      end_date: '',
      url: '',
      contents: '',
      crdt_id: 'admin'
    }
  }
  
  // 모달 표시
  nextTick(() => {
    const modal = new (window as any).bootstrap.Modal(eventModalRef.value)
    modal.show()
  })
}

// 이벤트 저장
const saveEvent = async () => {
  try {
    if (!eventForm.value.title || !eventForm.value.start_date) {
      alert('제목과 시작일은 필수입니다.')
      return
    }
    
    // 종료일이 없으면 시작일과 동일하게 설정
    if (!eventForm.value.end_date) {
      eventForm.value.end_date = eventForm.value.start_date
    }
    

    let response
    
    if (isEditMode.value && eventForm.value.id) {
      // 수정
      response = await $fetch(`/api/v1/calendar/events/${eventForm.value.id}`, {
        method: 'PUT',
        body: {
          title: eventForm.value.title,
          start_date: eventForm.value.start_date,
          end_date: eventForm.value.end_date,
          url: eventForm.value.url || null,
          crdt_id: eventForm.value.crdt_id
        }
      }) as any
    } else {
      // 등록
      response = await $fetch('/api/v1/calendar/events', {
        method: 'POST',
        body: {
          title: eventForm.value.title,
          start_date: eventForm.value.start_date,
          end_date: eventForm.value.end_date,
          url: eventForm.value.url || null,
          crdt_id: eventForm.value.crdt_id
        }
      }) as any
    }
    
    if (response && response.success) {
      alert(isEditMode.value ? '일정이 수정되었습니다.' : '일정이 등록되었습니다.')
      
      // 모달 닫기
      const modal = (window as any).bootstrap.Modal.getInstance(eventModalRef.value)
      modal.hide()
      
      // 이벤트 목록 새로고침
      await fetchEvents()
    } else {
      console.error('일정 저장 API 응답이 성공적이지 않음:', response)
      alert('일정 저장에 실패했습니다.')
    }
  } catch (error: any) {
    console.error('일정 저장 오류:', error)
    alert('일정 저장 중 오류가 발생했습니다: ' + (error?.message || '알 수 없는 오류'))
  }
}

// ID로 이벤트 삭제
const deleteEventById = async (eventId: number) => {
  try {
    console.log('이벤트 삭제 시작:', eventId)
    const response = await $fetch(`/api/v1/calendar/events/${eventId}`, {
      method: 'DELETE'
    }) as any
    
    console.log('삭제 API 응답:', response)
    
    if (response && response.success) {
      alert('일정이 삭제되었습니다.')
      
      // 이벤트 목록 새로고침
      await fetchEvents()
    } else {
      console.error('일정 삭제 API 응답이 성공적이지 않음:', response)
      alert('일정 삭제에 실패했습니다.')
    }
  } catch (error: any) {
    console.error('일정 삭제 오류:', error)
    alert('일정 삭제 중 오류가 발생했습니다: ' + (error instanceof Error ? error.message : '알 수 없는 오류'))
  }
}

// 일정 상세보기
const viewEventDetail = (event: CalendarEvent) => {
  console.log('상세보기 이벤트 데이터:', event)
  console.log('Contents 값:', event.contents)
  console.log('Contents 타입:', typeof event.contents)
  console.log('Contents 길이:', event.contents?.length)
  
  selectedEventDetail.value = event
  
  console.log('selectedEventDetail 설정 후:', selectedEventDetail.value)
  
  nextTick(() => {
    const modal = new (window as any).bootstrap.Modal(eventDetailModalRef.value)
    modal.show()
  })
}

// 상세보기에서 수정하기
const editEventFromDetail = () => {
  if (selectedEventDetail.value) {
    // 상세보기 모달 닫기
    const detailModal = (window as any).bootstrap.Modal.getInstance(eventDetailModalRef.value)
    if (detailModal) {
      detailModal.hide()
    }
    
    // 수정 모달 열기
    setTimeout(() => {
      editEvent(selectedEventDetail.value!)
    }, 300)
  }
}

// 날짜시간 포맷팅 (등록일 표시용)
const formatDisplayDateTime = (dateTimeStr: string) => {
  if (!dateTimeStr) return ''
  const date = new Date(dateTimeStr)
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 컴포넌트 마운트
onMounted(() => {
  fetchEvents()
})
</script>

<style scoped>
.calendar-day {
  cursor: pointer;
  transition: background-color 0.2s;
}

.calendar-day:hover {
  background-color: #f8f9fa;
}

.calendar-day.today {
  background-color: #e3f2fd;
}

.calendar-day.selected {
  background-color: #4caf50;
  color: white;
  font-weight: bold;
}

.calendar-day.selected:hover {
  background-color: #45a049;
}

.calendar-day.other-month {
  background-color: #fafafa;
}

.calendar-day.has-events {
  background-color: #fff3e0;
}

.day-content {
  position: relative;
}

.events-indicator {
  position: absolute;
  top: 2px;
  right: 2px;
}

.calendar-grid {
  min-height: 400px;
}

@media (max-width: 768px) {
  .calendar-day {
    min-height: 60px !important;
  }
  
  .day-content {
    min-height: 60px !important;
  }
}
</style>