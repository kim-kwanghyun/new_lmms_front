<template>
  <div class="mail-group-manager">
    <div class="mail-group-header">
      <h6 class="mb-3">
        <i class="bi bi-envelope-open"></i> 메일그룹 관리
      </h6>
      
      <div class="group-controls mb-3">
        <div class="row g-2">
          <div class="col-md-6">
            <input 
              type="text" 
              class="form-control form-control-sm" 
              placeholder="그룹명 검색..." 
              v-model="searchTerm"
            >
          </div>
          <div class="col-md-3">
            <select class="form-select form-select-sm" v-model="filterStatus">
              <option value="">전체 상태</option>
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
            </select>
          </div>
          <div class="col-md-3">
            <button 
              class="btn btn-primary btn-sm w-100" 
              @click="showCreateModal = true"
            >
              <i class="bi bi-plus-circle"></i> 새 그룹
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="mail-group-content">
      <!-- 메일그룹 목록 -->
      <div class="group-list mb-4">
        <div v-if="filteredMailGroups.length === 0" class="no-groups">
          <div class="text-center py-4">
            <i class="bi bi-envelope-x display-4 text-muted"></i>
            <h6 class="text-muted mt-2">메일그룹이 없습니다</h6>
            <p class="text-muted small">새 그룹을 생성해보세요.</p>
          </div>
        </div>
        
        <div v-else class="row g-3">
          <div 
            v-for="group in paginatedMailGroups" 
            :key="group.id"
            class="col-md-6 col-lg-4"
          >
            <div 
              class="mail-group-card"
              :class="{ 'selected': selectedGroupId === group.id }"
              @click="selectMailGroup(group)"
            >
              <div class="card h-100">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <h6 class="card-title mb-0">{{ group.name }}</h6>
                    <span 
                      :class="['badge', group.status === 'active' ? 'bg-success' : 'bg-secondary']"
                    >
                      {{ group.status === 'active' ? '활성' : '비활성' }}
                    </span>
                  </div>
                  
                  <p class="card-text text-muted small mb-2">
                    {{ group.description || '설명 없음' }}
                  </p>
                  
                  <div class="group-stats mb-3">
                    <div class="d-flex justify-content-between text-muted small">
                      <span>
                        <i class="bi bi-people"></i> {{ group.members.length }}명
                      </span>
                      <span>
                        <i class="bi bi-calendar"></i> {{ formatDate(group.createdAt) }}
                      </span>
                    </div>
                  </div>
                  
                  <div class="group-actions">
                    <div class="btn-group w-100" role="group">
                      <button 
                        class="btn btn-sm btn-outline-primary"
                        @click.stop="editMailGroup(group)"
                      >
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button 
                        class="btn btn-sm btn-outline-info"
                        @click.stop="viewGroupMembers(group)"
                      >
                        <i class="bi bi-eye"></i>
                      </button>
                      <button 
                        class="btn btn-sm btn-outline-success"
                        @click.stop="sendTestEmail(group)"
                        :disabled="group.members.length === 0"
                      >
                        <i class="bi bi-envelope"></i>
                      </button>
                      <button 
                        class="btn btn-sm btn-outline-danger"
                        @click.stop="deleteMailGroup(group)"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
      
      <!-- 선택된 그룹의 멤버 목록 -->
      <div v-if="selectedGroup" class="selected-group-members">
        <div class="card">
          <div class="card-header">
            <div class="d-flex justify-content-between align-items-center">
              <h6 class="mb-0">
                <i class="bi bi-people"></i> {{ selectedGroup.name }} 멤버 목록 ({{ selectedGroup.members.length }}명)
              </h6>
              <div class="member-actions">
                <button 
                  class="btn btn-sm btn-outline-danger me-2"
                  @click="clearAllMembers"
                  :disabled="selectedGroup.members.length === 0"
                >
                  <i class="bi bi-trash"></i> 전체 삭제
                </button>
                <button 
                  class="btn btn-sm btn-success"
                  @click="saveGroup"
                  :disabled="!hasChanges"
                >
                  <i class="bi bi-save"></i> 저장
                </button>
              </div>
            </div>
          </div>
          <div class="card-body">
            <div v-if="selectedGroup.members.length === 0" class="text-center py-4">
              <i class="bi bi-person-plus display-4 text-muted"></i>
              <h6 class="text-muted mt-2">멤버가 없습니다</h6>
              <p class="text-muted small">조직도에서 직원을 선택하여 추가해보세요.</p>
            </div>
            
            <div v-else class="table-responsive">
              <table class="table table-sm table-hover">
                <thead class="table-light">
                  <tr>
                    <th width="50">#</th>
                    <th>이름</th>
                    <th>이메일</th>
                    <th>부서</th>
                    <th>직급</th>
                    <th>추가일</th>
                    <th width="80">액션</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(member, index) in selectedGroup.members" :key="member.id">
                    <td>{{ index + 1 }}</td>
                    <td>
                      <div class="d-flex align-items-center">
                        <div class="member-avatar me-2">
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
                        <div>
                          <strong>{{ member.name }}</strong>
                          <div class="text-muted small">{{ member.employeeId }}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <a :href="`mailto:${member.email}`" class="text-decoration-none">
                        {{ member.email }}
                      </a>
                    </td>
                    <td class="text-muted small">{{ member.department }}</td>
                    <td>
                      <span class="badge bg-secondary">{{ member.position }}</span>
                    </td>
                    <td class="text-muted small">{{ formatDate(member.addedAt || new Date().toISOString()) }}</td>
                    <td>
                      <button 
                        class="btn btn-sm btn-outline-danger"
                        @click="removeMember(member)"
                      >
                        <i class="bi bi-x-circle"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 새 그룹 생성/편집 모달 -->
    <div v-if="showCreateModal || showEditModal" class="modal-backdrop">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ showEditModal ? '메일그룹 편집' : '새 메일그룹 생성' }}
            </h5>
            <button 
              type="button" 
              class="btn-close" 
              @click="closeModals"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveMailGroup">
              <div class="mb-3">
                <label class="form-label">그룹명 *</label>
                <input 
                  type="text" 
                  class="form-control" 
                  v-model="groupForm.name"
                  required
                  placeholder="예: 개발팀 메일그룹"
                >
              </div>
              <div class="mb-3">
                <label class="form-label">설명</label>
                <textarea 
                  class="form-control" 
                  v-model="groupForm.description"
                  rows="3"
                  placeholder="메일그룹에 대한 설명을 입력하세요"
                ></textarea>
              </div>
              <div class="mb-3">
                <label class="form-label">상태</label>
                <select class="form-select" v-model="groupForm.status">
                  <option value="active">활성</option>
                  <option value="inactive">비활성</option>
                </select>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button 
              type="button" 
              class="btn btn-secondary" 
              @click="closeModals"
            >
              취소
            </button>
            <button 
              type="button" 
              class="btn btn-primary" 
              @click="saveMailGroup"
              :disabled="!groupForm.name.trim()"
            >
              {{ showEditModal ? '수정' : '생성' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

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
  addedAt?: string
}

interface MailGroup {
  id: string
  name: string
  description?: string
  status: 'active' | 'inactive'
  members: Member[]
  createdAt: string
  updatedAt: string
  createdBy: string
}

interface Props {
  newMembers?: Member[]
}

interface Emits {
  (e: 'group-updated', group: MailGroup): void
  (e: 'members-added', count: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const mailGroups = ref<MailGroup[]>([])
const selectedGroupId = ref<string>('')
const selectedGroup = ref<MailGroup | null>(null)
const searchTerm = ref('')
const filterStatus = ref('')
const currentPage = ref(1)
const pageSize = 6
const hasChanges = ref(false)

// 모달 상태
const showCreateModal = ref(false)
const showEditModal = ref(false)
const groupForm = ref({
  name: '',
  description: '',
  status: 'active' as 'active' | 'inactive'
})

// 메일그룹 데이터 로드
const loadMailGroups = async () => {
  // 실제 API 호출 대신 샘플 데이터
  const sampleGroups: MailGroup[] = [
    {
      id: 'group-1',
      name: '개발팀 전체',
      description: '모든 개발팀 구성원',
      status: 'active',
      members: [],
      createdAt: '2024-01-15T09:00:00Z',
      updatedAt: '2024-01-15T09:00:00Z',
      createdBy: 'admin'
    },
    {
      id: 'group-2',
      name: 'IAM 인증팀',
      description: 'IAM 인증 관련 업무 담당자',
      status: 'active',
      members: [],
      createdAt: '2024-01-20T14:30:00Z',
      updatedAt: '2024-01-20T14:30:00Z',
      createdBy: 'admin'
    },
    {
      id: 'group-3',
      name: '시스템 운영팀',
      description: '시스템 운영 및 관리',
      status: 'inactive',
      members: [],
      createdAt: '2024-02-01T11:15:00Z',
      updatedAt: '2024-02-01T11:15:00Z',
      createdBy: 'admin'
    }
  ]
  
  mailGroups.value = sampleGroups
}

// 필터링된 메일그룹
const filteredMailGroups = computed(() => {
  let filtered = mailGroups.value

  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    filtered = filtered.filter(group => 
      group.name.toLowerCase().includes(term) ||
      (group.description && group.description.toLowerCase().includes(term))
    )
  }

  if (filterStatus.value) {
    filtered = filtered.filter(group => group.status === filterStatus.value)
  }

  return filtered
})

// 페이지네이션
const totalPages = computed(() => Math.ceil(filteredMailGroups.value.length / pageSize))
const paginatedMailGroups = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredMailGroups.value.slice(start, start + pageSize)
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

// 메일그룹 선택
const selectMailGroup = (group: MailGroup) => {
  selectedGroupId.value = group.id
  selectedGroup.value = { ...group }
  hasChanges.value = false
}

// 새 멤버들 추가
const addMembersToGroup = (members: Member[]) => {
  if (!selectedGroup.value) return
  
  const existingIds = new Set(selectedGroup.value.members.map(m => m.id))
  const newMembers = members.filter(member => !existingIds.has(member.id))
  
  newMembers.forEach(member => {
    selectedGroup.value!.members.push({
      ...member,
      addedAt: new Date().toISOString()
    })
  })
  
  hasChanges.value = true
  emit('members-added', newMembers.length)
}

// 멤버 제거
const removeMember = (member: Member) => {
  if (!selectedGroup.value) return
  
  const index = selectedGroup.value.members.findIndex(m => m.id === member.id)
  if (index > -1) {
    selectedGroup.value.members.splice(index, 1)
    hasChanges.value = true
  }
}

// 모든 멤버 제거
const clearAllMembers = () => {
  if (!selectedGroup.value) return
  
  if (confirm('모든 멤버를 제거하시겠습니까?')) {
    selectedGroup.value.members = []
    hasChanges.value = true
  }
}

// 그룹 저장
const saveGroup = async () => {
  if (!selectedGroup.value) return
  
  try {
    // 실제 API 호출
    const groupIndex = mailGroups.value.findIndex(g => g.id === selectedGroup.value!.id)
    if (groupIndex > -1) {
      mailGroups.value[groupIndex] = {
        ...selectedGroup.value,
        updatedAt: new Date().toISOString()
      }
    }
    
    hasChanges.value = false
    emit('group-updated', selectedGroup.value)
    
    // 성공 메시지 (실제로는 toast 등으로 표시)
    console.log('메일그룹이 저장되었습니다.')
  } catch (error) {
    console.error('저장 실패:', error)
  }
}

// 새 메일그룹 생성/편집
const saveMailGroup = async () => {
  if (!groupForm.value.name.trim()) return
  
  try {
    if (showEditModal.value && selectedGroup.value) {
      // 편집
      selectedGroup.value.name = groupForm.value.name
      selectedGroup.value.description = groupForm.value.description
      selectedGroup.value.status = groupForm.value.status
      selectedGroup.value.updatedAt = new Date().toISOString()
      
      const groupIndex = mailGroups.value.findIndex(g => g.id === selectedGroup.value!.id)
      if (groupIndex > -1) {
        mailGroups.value[groupIndex] = { ...selectedGroup.value }
      }
    } else {
      // 생성
      const newGroup: MailGroup = {
        id: `group-${Date.now()}`,
        name: groupForm.value.name,
        description: groupForm.value.description,
        status: groupForm.value.status,
        members: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'current-user'
      }
      
      mailGroups.value.push(newGroup)
      selectMailGroup(newGroup)
    }
    
    closeModals()
    hasChanges.value = false
  } catch (error) {
    console.error('저장 실패:', error)
  }
}

// 메일그룹 편집
const editMailGroup = (group: MailGroup) => {
  groupForm.value = {
    name: group.name,
    description: group.description || '',
    status: group.status
  }
  selectedGroup.value = group
  showEditModal.value = true
}

// 메일그룹 삭제
const deleteMailGroup = async (group: MailGroup) => {
  if (!confirm(`"${group.name}" 메일그룹을 삭제하시겠습니까?`)) return
  
  try {
    const index = mailGroups.value.findIndex(g => g.id === group.id)
    if (index > -1) {
      mailGroups.value.splice(index, 1)
    }
    
    if (selectedGroupId.value === group.id) {
      selectedGroupId.value = ''
      selectedGroup.value = null
    }
  } catch (error) {
    console.error('삭제 실패:', error)
  }
}

// 그룹 멤버 보기
const viewGroupMembers = (group: MailGroup) => {
  selectMailGroup(group)
}

// 테스트 이메일 발송
const sendTestEmail = (group: MailGroup) => {
  if (group.members.length === 0) return
  
  const emails = group.members.map(m => m.email).join(';')
  window.open(`mailto:${emails}?subject=테스트 메일&body=메일그룹 테스트입니다.`)
}

// 모달 닫기
const closeModals = () => {
  showCreateModal.value = false
  showEditModal.value = false
  groupForm.value = {
    name: '',
    description: '',
    status: 'active'
  }
}

// 유틸리티 함수들
const getInitials = (name: string): string => {
  return name.charAt(0).toUpperCase()
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('ko-KR')
}

// 새 멤버 추가 감지
watch(() => props.newMembers, (newMembers) => {
  if (newMembers && newMembers.length > 0 && selectedGroup.value) {
    addMembersToGroup(newMembers)
  }
}, { deep: true })

onMounted(() => {
  loadMailGroups()
})
</script>

<style scoped>
.mail-group-manager {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.mail-group-header {
  flex-shrink: 0;
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
  background-color: #f8f9fa;
}

.mail-group-content {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}

.mail-group-card {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.mail-group-card:hover {
  transform: translateY(-2px);
}

.mail-group-card.selected .card {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.card {
  transition: all 0.2s ease;
  border-radius: 8px;
}

.card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.group-stats {
  border-top: 1px solid #e9ecef;
  padding-top: 8px;
}

.member-avatar {
  width: 24px;
  height: 24px;
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
  font-size: 0.7rem;
  font-weight: 600;
}

.selected-group-members {
  background-color: white;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.no-groups {
  background-color: white;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

/* 모달 스타일 */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}

.modal-dialog {
  background: white;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content {
  border: none;
  border-radius: 8px;
}

.modal-header {
  border-bottom: 1px solid #e9ecef;
  padding: 1rem 1.5rem;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  border-top: 1px solid #e9ecef;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  opacity: 0.5;
}

.btn-close:hover {
  opacity: 1;
}

/* 반응형 */
@media (max-width: 768px) {
  .group-controls .col-md-3,
  .group-controls .col-md-6 {
    margin-bottom: 0.5rem;
  }
  
  .member-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .member-actions .btn {
    width: 100%;
  }
  
  .modal-dialog {
    width: 95%;
    margin: 1rem;
  }
}

/* 스크롤바 스타일링 */
.mail-group-content::-webkit-scrollbar,
.modal-dialog::-webkit-scrollbar {
  width: 6px;
}

.mail-group-content::-webkit-scrollbar-track,
.modal-dialog::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.mail-group-content::-webkit-scrollbar-thumb,
.modal-dialog::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.mail-group-content::-webkit-scrollbar-thumb:hover,
.modal-dialog::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
