<template>
  <div>
    <Head>
      <title>축사방 관리 - LSMMS</title>
    </Head>

    <div class="container-fluid">
      <!-- 페이지 헤더 -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center">
            <h1 class="h3 mb-0 text-gray-800">
              <i class="bi bi-house-door me-2"></i>축사방 관리
            </h1>
            <button 
              class="btn btn-primary"
              @click="showRoomModal()"
            >
              <i class="bi bi-plus-circle me-1"></i>
              새 축사방 등록
            </button>
          </div>
        </div>
      </div>

      <!-- 검색 및 필터 -->
      <div class="row mb-3">
        <div class="col-12">
          <div class="card shadow">
            <div class="card-body">
              <div class="row g-3 align-items-end">
                <div class="col-md-4">
                  <label for="searchInput" class="form-label">검색</label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="bi bi-search"></i>
                    </span>
                    <input 
                      type="text" 
                      class="form-control" 
                      id="searchInput"
                      v-model="searchText"
                      placeholder="축사번호 또는 개설자ID로 검색"
                      @keyup.enter="searchRooms"
                    >
                  </div>
                </div>
                <div class="col-md-3">
                  <label for="livestockTypeFilter" class="form-label">가축종류</label>
                  <select 
                    class="form-select" 
                    id="livestockTypeFilter"
                    v-model="livestockTypeFilter"
                  >
                    <option value="">전체</option>
                    <option value="돼지">돼지</option>
                    <option value="소">소</option>
                  </select>
                </div>
                <div class="col-md-2">
                  <label for="limitSelect" class="form-label">표시개수</label>
                  <select 
                    class="form-select" 
                    id="limitSelect"
                    v-model="pagination.limit"
                    @change="fetchRooms"
                  >
                    <option value="10">10개</option>
                    <option value="20">20개</option>
                    <option value="50">50개</option>
                    <option value="100">100개</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <div class="btn-group w-100">
                    <button 
                      class="btn btn-outline-primary"
                      @click="searchRooms"
                    >
                      <i class="bi bi-search me-1"></i>검색
                    </button>
                    <button 
                      class="btn btn-outline-secondary"
                      @click="resetSearch"
                    >
                      <i class="bi bi-arrow-clockwise me-1"></i>초기화
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 축사방 목록 테이블 -->
      <div class="row">
        <div class="col-12">
          <div class="card shadow">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">
                <i class="bi bi-list-ul me-2"></i>축사방 목록
                <span class="badge bg-primary ms-2">{{ pagination.total }}개</span>
              </h5>
              <div class="text-muted">
                <small>{{ pagination.page }}/{{ pagination.totalPages }} 페이지</small>
              </div>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th style="width: 8%">번호</th>
                      <th style="width: 15%">축사번호</th>
                      <th style="width: 12%">가축종류</th>
                      <th style="width: 18%">개설일시</th>
                      <th style="width: 12%">개설자ID</th>
                      <th style="width: 18%">등록일시</th>
                      <th style="width: 17%">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(room, index) in rooms" :key="room.idx">
                      <td>
                        <span class="fw-bold text-primary">
                          {{ (pagination.page - 1) * pagination.limit + index + 1 }}
                        </span>
                      </td>
                      <td>
                        <code class="bg-light text-dark px-2 py-1 rounded">
                          {{ room.room_number }}
                        </code>
                      </td>
                      <td>
                        <span 
                          class="badge"
                          :class="{
                            'bg-success': room.livestock_type === '돼지',
                            'bg-info': room.livestock_type === '소'
                          }"
                        >
                          {{ room.livestock_type }}
                        </span>
                      </td>
                      <td>
                        <div class="d-flex flex-column">
                          <span class="fw-bold">{{ formatDate(room.created_date) }}</span>
                          <small class="text-muted">{{ formatTime(room.created_date) }}</small>
                        </div>
                      </td>
                      <td>
                        <span class="badge bg-secondary">{{ room.creator_id }}</span>
                      </td>
                      <td>
                        <div class="d-flex flex-column">
                          <span>{{ formatDate(room.crdt_dt) }}</span>
                          <small class="text-muted">{{ room.crdt_id }}</small>
                        </div>
                      </td>
                      <td>
                        <div class="btn-group btn-group-sm">
                          <button 
                            class="btn btn-outline-info" 
                            @click="viewRoom(room)"
                            title="상세보기"
                          >
                            <i class="bi bi-eye"></i>
                          </button>
                          <button 
                            class="btn btn-outline-primary" 
                            @click="editRoom(room)"
                            title="수정"
                          >
                            <i class="bi bi-pencil"></i>
                          </button>
                          <button 
                            class="btn btn-outline-danger" 
                            @click="confirmDeleteRoom(room)"
                            title="삭제"
                          >
                            <i class="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr v-if="rooms.length === 0">
                      <td colspan="7" class="text-center text-muted py-4">
                        <i class="bi bi-house-x me-2"></i>
                        등록된 축사방이 없습니다.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- 페이지네이션 -->
            <div class="card-footer" v-if="pagination.totalPages > 1">
              <nav aria-label="축사방 목록 페이지네이션">
                <ul class="pagination pagination-sm justify-content-center mb-0">
                  <li class="page-item" :class="{ disabled: pagination.page <= 1 }">
                    <button 
                      class="page-link" 
                      @click="changePage(pagination.page - 1)"
                      :disabled="pagination.page <= 1"
                    >
                      이전
                    </button>
                  </li>
                  
                  <li 
                    v-for="page in getPageNumbers()" 
                    :key="page"
                    class="page-item" 
                    :class="{ active: pagination.page === page }"
                  >
                    <button class="page-link" @click="changePage(page)">
                      {{ page }}
                    </button>
                  </li>
                  
                  <li class="page-item" :class="{ disabled: pagination.page >= pagination.totalPages }">
                    <button 
                      class="page-link" 
                      @click="changePage(pagination.page + 1)"
                      :disabled="pagination.page >= pagination.totalPages"
                    >
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

    <!-- 축사방 등록/수정 모달 -->
    <div 
      class="modal fade" 
      id="roomModal" 
      tabindex="-1" 
      ref="roomModalRef"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-house-door-fill me-2"></i>
              {{ isEditMode ? '축사방 수정' : (isViewMode ? '축사방 상세보기' : '새 축사방 등록') }}
            </h5>
            <button 
              type="button" 
              class="btn-close" 
              data-bs-dismiss="modal"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveRoom">
              <div class="mb-3">
                <label for="roomNumber" class="form-label">
                  축사번호 <span class="text-danger">*</span>
                </label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="roomNumber"
                  v-model="roomForm.room_number"
                  :readonly="isViewMode"
                  required
                  maxlength="50"
                  placeholder="예: A-001, B-002"
                >
                <div class="form-text">
                  영문, 숫자, 하이픈(-) 사용 가능합니다.
                </div>
              </div>
              
              <div class="mb-3">
                <label for="livestockType" class="form-label">
                  가축종류 <span class="text-danger">*</span>
                </label>
                <select 
                  class="form-select" 
                  id="livestockType"
                  v-model="roomForm.livestock_type"
                  :disabled="isViewMode"
                  required
                >
                  <option value="">가축종류를 선택하세요</option>
                  <option value="돼지">돼지</option>
                  <option value="소">소</option>
                </select>
              </div>
              
              <div class="mb-3">
                <label for="createdDate" class="form-label">
                  개설일시 <span class="text-danger">*</span>
                </label>
                <input 
                  type="datetime-local" 
                  class="form-control" 
                  id="createdDate"
                  v-model="roomForm.created_date"
                  :readonly="isViewMode"
                  required
                >
              </div>
              
              <div class="mb-3">
                <label for="creatorId" class="form-label">
                  개설자ID <span class="text-danger">*</span>
                </label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="creatorId"
                  v-model="roomForm.creator_id"
                  :readonly="isViewMode"
                  required
                  maxlength="50"
                  placeholder="개설자 ID를 입력하세요"
                >
              </div>

              <div v-if="isEditMode || isViewMode" class="mb-3">
                <label class="form-label">등록 정보</label>
                <div class="bg-light p-3 rounded">
                  <div class="row">
                    <div class="col-6">
                      <small class="text-muted">등록일시:</small><br>
                      <span class="fw-bold">{{ roomForm.crdt_dt }}</span>
                    </div>
                    <div class="col-6">
                      <small class="text-muted">등록자:</small><br>
                      <span class="fw-bold">{{ roomForm.crdt_id }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button 
              type="button" 
              class="btn btn-secondary" 
              data-bs-dismiss="modal"
            >
              {{ isViewMode ? '닫기' : '취소' }}
            </button>
            <button 
              v-if="!isViewMode"
              type="button" 
              class="btn btn-primary"
              @click="saveRoom"
              :disabled="!roomForm.room_number || !roomForm.livestock_type || !roomForm.creator_id"
            >
              <i class="bi bi-check-circle me-1"></i>
              {{ isEditMode ? '수정' : '등록' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'

// 페이지 메타데이터
definePageMeta({
  layout: 'admin'
})

// 페이지 제목
useHead({
  title: '축사방 관리 - LSMMS'
})

// 타입 정의
interface LivestockRoom {
  idx: number
  room_number: string
  livestock_type: string
  created_date: string
  creator_id: string
  crdt_dt: string
  crdt_id: string
}

// 반응형 데이터
const rooms = ref<LivestockRoom[]>([])
const searchText = ref<string>('')
const livestockTypeFilter = ref<string>('')
const roomModalRef = ref<HTMLElement | null>(null)
const isEditMode = ref(false)
const isViewMode = ref(false)

// 페이지네이션
const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0
})

// 축사방 폼 데이터
const roomForm = ref({
  idx: null as number | null,
  room_number: '',
  livestock_type: '',
  created_date: '',
  creator_id: '',
  crdt_dt: '',
  crdt_id: ''
})

// 날짜 포맷팅
const formatDate = (dateStr: string): string => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('ko-KR')
}

const formatTime = (dateStr: string): string => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleTimeString('ko-KR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

// 페이지 번호 계산
const getPageNumbers = (): number[] => {
  const pages: number[] = []
  const start = Math.max(1, pagination.value.page - 2)
  const end = Math.min(pagination.value.totalPages, pagination.value.page + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
}

// 페이지 변경
const changePage = (page: number) => {
  if (page >= 1 && page <= pagination.value.totalPages) {
    pagination.value.page = page
    fetchRooms()
  }
}

// 축사방 목록 조회
const fetchRooms = async () => {
  try {
    console.log('축사방 목록 조회 시작')
    
    const params = {
      page: pagination.value.page,
      limit: pagination.value.limit,
      search: searchText.value,
      livestock_type: livestockTypeFilter.value
    }

    const response = await $fetch('/api/v1/livestock/rooms', { query: params }) as any
    
    console.log('축사방 API 응답:', response)
    
    if (response && response.success) {
      rooms.value = response.data.rooms || []
      pagination.value = {
        ...pagination.value,
        ...response.data.pagination
      }
      console.log('축사방 목록 로드 완료:', rooms.value.length, '개')
    } else {
      console.error('축사방 API 응답이 성공적이지 않음:', response)
      rooms.value = []
    }
  } catch (error) {
    console.error('축사방 목록 조회 오류:', error)
    rooms.value = []
    // 개발용 샘플 데이터
    rooms.value = [
      {
        idx: 1,
        room_number: 'A-001',
        livestock_type: '돼지',
        created_date: '2024-01-15 09:00:00',
        creator_id: 'admin',
        crdt_dt: new Date().toISOString(),
        crdt_id: 'admin'
      }
    ]
  }
}

// 검색
const searchRooms = () => {
  pagination.value.page = 1
  fetchRooms()
}

// 검색 초기화
const resetSearch = () => {
  searchText.value = ''
  livestockTypeFilter.value = ''
  pagination.value.page = 1
  fetchRooms()
}

// 축사방 모달 표시
const showRoomModal = (room?: LivestockRoom, viewMode = false) => {
  isViewMode.value = viewMode
  isEditMode.value = !!room && !viewMode
  
  if (room) {
    roomForm.value = {
      idx: room.idx,
      room_number: room.room_number,
      livestock_type: room.livestock_type,
      created_date: room.created_date.replace(' ', 'T').substring(0, 16),
      creator_id: room.creator_id,
      crdt_dt: room.crdt_dt,
      crdt_id: room.crdt_id
    }
  } else {
    // 등록 모드
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    
    roomForm.value = {
      idx: null,
      room_number: '',
      livestock_type: '',
      created_date: now.toISOString().slice(0, 16),
      creator_id: 'admin',
      crdt_dt: '',
      crdt_id: ''
    }
  }
  
  // 모달 표시
  nextTick(() => {
    const modal = new (window as any).bootstrap.Modal(roomModalRef.value)
    modal.show()
  })
}

// 축사방 상세보기
const viewRoom = (room: LivestockRoom) => {
  showRoomModal(room, true)
}

// 축사방 수정
const editRoom = (room: LivestockRoom) => {
  showRoomModal(room, false)
}

// 축사방 삭제 확인
const confirmDeleteRoom = (room: LivestockRoom) => {
  if (confirm(`축사번호 "${room.room_number}" (${room.livestock_type})를 삭제하시겠습니까?`)) {
    deleteRoom(room.idx)
  }
}

// 축사방 저장
const saveRoom = async () => {
  try {
    if (!roomForm.value.room_number || !roomForm.value.livestock_type || !roomForm.value.creator_id) {
      alert('필수 항목을 모두 입력해주세요.')
      return
    }
    
    let response
    
    const requestData = {
      room_number: roomForm.value.room_number,
      livestock_type: roomForm.value.livestock_type,
      created_date: roomForm.value.created_date.replace('T', ' ') + ':00',
      creator_id: roomForm.value.creator_id,
      crdt_id: 'admin'
    }
    
    if (isEditMode.value && roomForm.value.idx) {
      // 수정
      response = await $fetch(`/api/v1/livestock/rooms/${roomForm.value.idx}`, {
        method: 'PUT',
        body: requestData
      }) as any
    } else {
      // 등록
      response = await $fetch('/api/v1/livestock/rooms', {
        method: 'POST',
        body: requestData
      }) as any
    }
    
    if (response && response.success) {
      alert(isEditMode.value ? '축사방이 수정되었습니다.' : '축사방이 등록되었습니다.')
      
      // 모달 닫기
      const modal = (window as any).bootstrap.Modal.getInstance(roomModalRef.value)
      modal.hide()
      
      // 목록 새로고침
      await fetchRooms()
    } else {
      console.error('축사방 저장 API 응답이 성공적이지 않음:', response)
      alert('축사방 저장에 실패했습니다.')
    }
  } catch (error) {
    console.error('축사방 저장 오류:', error)
    alert('축사방 저장 중 오류가 발생했습니다: ' + (error instanceof Error ? error.message : '알 수 없는 오류'))
  }
}

// 축사방 삭제
const deleteRoom = async (roomId: number) => {
  try {
    console.log('축사방 삭제 시작:', roomId)
    
    const response = await $fetch(`/api/v1/livestock/rooms/${roomId}`, {
      method: 'DELETE'
    }) as any
    
    console.log('삭제 API 응답:', response)
    
    if (response && response.success) {
      alert('축사방이 삭제되었습니다.')
      
      // 목록 새로고침
      await fetchRooms()
    } else {
      console.error('축사방 삭제 API 응답이 성공적이지 않음:', response)
      alert('축사방 삭제에 실패했습니다.')
    }
  } catch (error) {
    console.error('축사방 삭제 오류:', error)
    alert('축사방 삭제 중 오류가 발생했습니다: ' + (error instanceof Error ? error.message : '알 수 없는 오류'))
  }
}

// 컴포넌트 마운트
onMounted(() => {
  fetchRooms()
})
</script>

<style scoped>
.table th {
  background-color: #f8f9fa;
  border-top: none;
  font-weight: 600;
  font-size: 0.875rem;
}

.badge {
  font-size: 0.75rem;
}

.btn-group-sm .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

.pagination-sm .page-link {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .table-responsive {
    font-size: 0.875rem;
  }
  
  .btn-group-sm .btn {
    padding: 0.125rem 0.25rem;
    font-size: 0.7rem;
  }
}
</style>
