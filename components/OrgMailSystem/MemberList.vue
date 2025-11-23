<template>
  <div class="member-list">
    <div class="member-header">
      <h6 class="mb-3">
        <i class="bi bi-people"></i> 
        {{ selectedOrg ? `${selectedOrg.name} 구성원` : '구성원 목록' }}
      </h6>
      
      <div v-if="selectedOrg" class="org-info mb-3">
        <div class="org-path">
          <i class="bi bi-geo-alt"></i>
          <span class="path-text">{{ getOrgPath(selectedOrg) }}</span>
        </div>
        <div class="member-stats">
          <span class="total-members">전체 {{ members.length }}명</span>
          <span class="selected-members">선택 {{ selectedMembers.size }}명</span>
        </div>
      </div>
      
      <div class="search-and-filter mb-3">
        <div class="row g-2">
          <div class="col-md-6">
            <input 
              type="text" 
              class="form-control form-control-sm" 
              placeholder="이름, 이메일, 부서 검색..." 
              v-model="searchTerm"
            >
          </div>
          <div class="col-md-3">
            <select class="form-select form-select-sm" v-model="filterPosition">
              <option value="">전체 직급</option>
              <option value="부장">부장</option>
              <option value="차장">차장</option>
              <option value="과장">과장</option>
              <option value="대리">대리</option>
              <option value="주임">주임</option>
              <option value="사원">사원</option>
            </select>
          </div>
          <div class="col-md-3">
            <select class="form-select form-select-sm" v-model="filterStatus">
              <option value="">전체 상태</option>
              <option value="재직">재직</option>
              <option value="휴직">휴직</option>
              <option value="파견">파견</option>
            </select>
          </div>
        </div>
      </div>
    </div>
    
    <div class="member-content">
      <div v-if="!selectedOrg" class="no-org-selected">
        <div class="text-center py-5">
          <i class="bi bi-diagram-3 display-1 text-muted"></i>
          <h5 class="text-muted mt-3">조직을 선택해주세요</h5>
          <p class="text-muted">왼쪽 조직도에서 조직을 선택하면<br>해당 조직의 구성원을 확인할 수 있습니다.</p>
        </div>
      </div>
      
      <div v-else-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2 text-muted">구성원 정보를 불러오는 중...</p>
      </div>
      
      <div v-else-if="filteredMembers.length === 0" class="no-members">
        <div class="text-center py-4">
          <i class="bi bi-person-x display-4 text-muted"></i>
          <h6 class="text-muted mt-2">구성원이 없습니다</h6>
          <p class="text-muted small">검색 조건을 확인해보세요.</p>
        </div>
      </div>
      
      <div v-else class="member-table-container">
        <div class="member-actions mb-3">
          <div class="d-flex justify-content-between align-items-center">
            <div class="selection-info">
              <span class="text-muted small">
                {{ filteredMembers.length }}명 중 {{ selectedMembers.size }}명 선택
              </span>
            </div>
            <div class="bulk-actions">
              <button 
                class="btn btn-sm btn-outline-primary me-2"
                @click="selectAll"
                :disabled="selectedMembers.size === filteredMembers.length"
              >
                <i class="bi bi-check-all"></i> 전체선택
              </button>
              <button 
                class="btn btn-sm btn-outline-secondary me-2"
                @click="clearSelection"
                :disabled="selectedMembers.size === 0"
              >
                <i class="bi bi-x-circle"></i> 선택해제
              </button>
              <button 
                class="btn btn-sm btn-success"
                @click="addToMailGroup"
                :disabled="selectedMembers.size === 0"
              >
                <i class="bi bi-envelope-plus"></i> 메일그룹 추가 ({{ selectedMembers.size }})
              </button>
            </div>
          </div>
        </div>
        
        <div class="table-responsive">
          <table class="table table-hover table-sm">
            <thead class="table-light">
              <tr>
                <th width="50">
                  <input 
                    type="checkbox" 
                    class="form-check-input"
                    :checked="isAllSelected"
                    :indeterminate="isIndeterminate"
                    @change="toggleAll"
                  >
                </th>
                <th width="80">프로필</th>
                <th>이름</th>
                <th>직급</th>
                <th>부서</th>
                <th>이메일</th>
                <th>전화번호</th>
                <th width="80">상태</th>
                <th width="100">액션</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="member in paginatedMembers" 
                :key="member.id"
                :class="{ 'table-active': selectedMembers.has(member.id) }"
              >
                <td>
                  <input 
                    type="checkbox" 
                    class="form-check-input"
                    :checked="selectedMembers.has(member.id)"
                    @change="toggleMember(member)"
                  >
                </td>
                <td>
                  <div class="profile-avatar">
                    <img 
                      v-if="member.profileImage" 
                      :src="member.profileImage" 
                      :alt="member.name"
                      class="avatar-img"
                    >
                    <div v-else class="avatar-placeholder">
                      {{ getInitials(member.name) }}
                    </div>
                  </div>
                </td>
                <td>
                  <div class="member-name">
                    <strong>{{ member.name }}</strong>
                    <div class="employee-id text-muted small">{{ member.employeeId }}</div>
                  </div>
                </td>
                <td>
                  <span class="badge bg-secondary">{{ member.position }}</span>
                </td>
                <td class="text-muted small">{{ member.department }}</td>
                <td>
                  <a :href="`mailto:${member.email}`" class="text-decoration-none">
                    {{ member.email }}
                  </a>
                </td>
                <td class="text-muted small">{{ member.phone || '-' }}</td>
                <td>
                  <span 
                    :class="['badge', getStatusClass(member.status)]"
                  >
                    {{ member.status }}
                  </span>
                </td>
                <td>
                  <div class="btn-group" role="group">
                    <button 
                      class="btn btn-sm btn-outline-primary"
                      @click="addSingleToMailGroup(member)"
                      :disabled="selectedMembers.has(member.id)"
                    >
                      <i class="bi bi-envelope-plus"></i>
                    </button>
                    <button 
                      class="btn btn-sm btn-outline-info"
                      @click="viewMemberDetail(member)"
                    >
                      <i class="bi bi-eye"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- 페이지네이션 -->
        <div v-if="totalPages > 1" class="d-flex justify-content-center mt-3">
          <nav>
            <ul class="pagination pagination-sm">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="currentPage = 1" :disabled="currentPage === 1">
                  <i class="bi bi-chevron-double-left"></i>
                </button>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="currentPage--" :disabled="currentPage === 1">
                  <i class="bi bi-chevron-left"></i>
                </button>
              </li>
              <li 
                v-for="page in visiblePages" 
                :key="page" 
                class="page-item"
                :class="{ active: page === currentPage }"
              >
                <button class="page-link" @click="currentPage = page">{{ page }}</button>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button class="page-link" @click="currentPage++" :disabled="currentPage === totalPages">
                  <i class="bi bi-chevron-right"></i>
                </button>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button class="page-link" @click="currentPage = totalPages" :disabled="currentPage === totalPages">
                  <i class="bi bi-chevron-double-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

interface OrgNode {
  id: string
  name: string
  type: 'company' | 'division' | 'department' | 'team' | 'unit'
  parentId?: string
}

interface Member {
  id: string
  name: string
  employeeId: string
  email: string
  phone?: string
  position: string
  department: string
  orgId: string
  status: '재직' | '휴직' | '파견'
  profileImage?: string
  joinDate: string
}

interface Props {
  selectedOrg?: OrgNode | null
}

interface Emits {
  (e: 'add-to-mail-group', members: Member[]): void
  (e: 'view-member', member: Member): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const loading = ref(false)
const members = ref<Member[]>([])
const selectedMembers = ref<Set<string>>(new Set())
const searchTerm = ref('')
const filterPosition = ref('')
const filterStatus = ref('')
const currentPage = ref(1)
const pageSize = 10

// 구성원 데이터 로드
const loadMembers = async (orgId: string) => {
  loading.value = true
  try {
    // 실제 API 호출 대신 샘플 데이터
    await new Promise(resolve => setTimeout(resolve, 500)) // 로딩 시뮬레이션
    
    const sampleMembers: Member[] = generateSampleMembers(orgId)
    members.value = sampleMembers
  } catch (error) {
    console.error('구성원 로드 실패:', error)
  } finally {
    loading.value = false
  }
}

// 샘플 데이터 생성
const generateSampleMembers = (orgId: string): Member[] => {
  const positions = ['부장', '차장', '과장', '대리', '주임', '사원']
  const statuses: ('재직' | '휴직' | '파견')[] = ['재직', '휴직', '파견']
  const names = ['김철수', '이영희', '박민수', '정수진', '최동현', '한미영', '윤석준', '강지은', '임태호', '신예린', '조현우', '배서연', '오정민', '류하늘', '서지훈']
  
  const memberCount = Math.floor(Math.random() * 15) + 5 // 5-20명
  
  return Array.from({ length: memberCount }, (_, index) => {
    const name = names[index % names.length]
    const position = positions[Math.floor(Math.random() * positions.length)]
    const status = statuses[Math.floor(Math.random() * 10) > 8 ? Math.floor(Math.random() * 3) : 0] // 90% 재직
    
    return {
      id: `member-${orgId}-${index + 1}`,
      name: `${name}${index > 14 ? index - 14 : ''}`,
      employeeId: `EMP${String(Math.floor(Math.random() * 9000) + 1000)}`,
      email: `${name.toLowerCase()}${index > 14 ? index - 14 : ''}@skgas.co.kr`,
      phone: `010-${String(Math.floor(Math.random() * 9000) + 1000)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      position,
      department: props.selectedOrg?.name || '미정',
      orgId,
      status,
      joinDate: `2020-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`
    }
  })
}

// 필터링된 구성원
const filteredMembers = computed(() => {
  let filtered = members.value

  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    filtered = filtered.filter(member => 
      member.name.toLowerCase().includes(term) ||
      member.email.toLowerCase().includes(term) ||
      member.department.toLowerCase().includes(term) ||
      member.employeeId.toLowerCase().includes(term)
    )
  }

  if (filterPosition.value) {
    filtered = filtered.filter(member => member.position === filterPosition.value)
  }

  if (filterStatus.value) {
    filtered = filtered.filter(member => member.status === filterStatus.value)
  }

  return filtered
})

// 페이지네이션
const totalPages = computed(() => Math.ceil(filteredMembers.value.length / pageSize))
const paginatedMembers = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredMembers.value.slice(start, start + pageSize)
})

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, start + 4)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// 선택 관련
const isAllSelected = computed(() => 
  filteredMembers.value.length > 0 && 
  filteredMembers.value.every(member => selectedMembers.value.has(member.id))
)

const isIndeterminate = computed(() => 
  selectedMembers.value.size > 0 && !isAllSelected.value
)

// 조직 경로 생성
const getOrgPath = (org: OrgNode): string => {
  // 실제로는 부모 조직 정보를 통해 전체 경로를 구성
  return `SK가스 > ${org.name}`
}

// 이니셜 생성
const getInitials = (name: string): string => {
  return name.charAt(0).toUpperCase()
}

// 상태별 클래스
const getStatusClass = (status: string): string => {
  const classMap = {
    '재직': 'bg-success',
    '휴직': 'bg-warning',
    '파견': 'bg-info'
  }
  return classMap[status as keyof typeof classMap] || 'bg-secondary'
}

// 구성원 선택/해제
const toggleMember = (member: Member) => {
  if (selectedMembers.value.has(member.id)) {
    selectedMembers.value.delete(member.id)
  } else {
    selectedMembers.value.add(member.id)
  }
}

// 전체 선택/해제
const toggleAll = () => {
  if (isAllSelected.value) {
    clearSelection()
  } else {
    selectAll()
  }
}

const selectAll = () => {
  filteredMembers.value.forEach(member => {
    selectedMembers.value.add(member.id)
  })
}

const clearSelection = () => {
  selectedMembers.value.clear()
}

// 메일그룹에 추가
const addToMailGroup = () => {
  const selectedMemberList = members.value.filter(member => 
    selectedMembers.value.has(member.id)
  )
  emit('add-to-mail-group', selectedMemberList)
}

const addSingleToMailGroup = (member: Member) => {
  emit('add-to-mail-group', [member])
}

// 구성원 상세보기
const viewMemberDetail = (member: Member) => {
  emit('view-member', member)
}

// 선택된 조직 변경 감지
watch(() => props.selectedOrg, (newOrg) => {
  selectedMembers.value.clear()
  currentPage.value = 1
  if (newOrg) {
    loadMembers(newOrg.id)
  }
}, { immediate: true })

// 검색어 변경시 페이지 리셋
watch([searchTerm, filterPosition, filterStatus], () => {
  currentPage.value = 1
})
</script>

<style scoped>
.member-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.member-header {
  flex-shrink: 0;
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
  background-color: #f8f9fa;
}

.member-content {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}

.org-info {
  background-color: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 12px;
}

.org-path {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: #495057;
  font-size: 0.9rem;
}

.path-text {
  font-weight: 500;
}

.member-stats {
  display: flex;
  gap: 16px;
  font-size: 0.85rem;
}

.total-members {
  color: #28a745;
  font-weight: 600;
}

.selected-members {
  color: #007bff;
  font-weight: 600;
}

.profile-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background-color: #007bff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
}

.member-name strong {
  color: #2c3e50;
}

.employee-id {
  font-size: 0.75rem;
  color: #6c757d;
}

.member-table-container {
  background-color: white;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.table {
  margin-bottom: 0;
}

.table th {
  border-top: none;
  font-weight: 600;
  color: #495057;
  font-size: 0.85rem;
}

.table td {
  vertical-align: middle;
  font-size: 0.85rem;
}

.table-active {
  background-color: #e3f2fd !important;
}

.member-actions {
  padding: 12px 16px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.selection-info {
  font-size: 0.85rem;
}

.bulk-actions {
  display: flex;
  gap: 8px;
}

.no-org-selected,
.no-members {
  background-color: white;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

/* 반응형 */
@media (max-width: 768px) {
  .member-stats {
    flex-direction: column;
    gap: 8px;
  }
  
  .bulk-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .bulk-actions .btn {
    width: 100%;
  }
  
  .table-responsive {
    font-size: 0.8rem;
  }
  
  .profile-avatar {
    width: 24px;
    height: 24px;
  }
}

/* 스크롤바 스타일링 */
.member-content::-webkit-scrollbar {
  width: 6px;
}

.member-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.member-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.member-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
