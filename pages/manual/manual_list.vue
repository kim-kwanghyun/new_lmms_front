<template>
  <div class="page-wrapper">
    <!-- Admin Header -->
    <AdminHeader />
    
    <!-- Admin Sidebar -->
    <AdminSidebar />
    
    <!-- Main Content -->
    <div class="main with-sidebar">
    <div class="pagetitle">
        <h1>지식 관리</h1>
      <nav>
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><NuxtLink to="/">Home</NuxtLink></li>
            <li class="breadcrumb-item">매뉴얼 관리</li>
            <li class="breadcrumb-item active">지식 관리</li>
        </ol>
      </nav>
    </div><!-- End Page Title -->

    <section class="section">
      <div class="row">
        <!-- 지식 마스터 관리 -->
        <div class="col-lg-6">
          <div class="card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="card-title mb-0">지식 마스터 관리</h5>
                <button type="button" class="btn btn-primary btn-sm" @click="showKnowledgeMasterModal()">
                  <i class="bi bi-plus-circle me-1"></i> 지식마스터 추가
                </button>
              </div>
              
              <!-- 검색 필터 -->
              <div class="row mb-3">
                <div class="col-md-8">
                  <input 
                    type="text" 
                    class="form-control form-control-sm" 
                    placeholder="지식마스터명 또는 ID로 검색..."
                    v-model="masterSearchText"
                    @input="searchMasters"
                  >
                </div>
                <div class="col-md-4">
                  <button class="btn btn-outline-secondary btn-sm w-100" @click="resetMasterSearch">
                    <i class="bi bi-arrow-clockwise me-1"></i> 초기화
                  </button>
                </div>
              </div>
              
              <!-- 지식 마스터 테이블 -->
              <div class="table-responsive" style="max-height: 500px; overflow-y: auto;">
                <table class="table table-sm table-hover">
                  <thead class="table-light sticky-top">
                    <tr>
                      <th style="width: 25%">마스터ID</th>
                      <th style="width: 35%">마스터명</th>
                      <th style="width: 20%">등록자</th>
                      <th style="width: 20%">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr 
                      v-for="master in filteredKnowledgeMasters" 
                      :key="master.knowledge_master_id"
                      :class="{ 'table-active': selectedKnowledgeMaster === master.knowledge_master_id }"
                      @click="selectKnowledgeMaster(master.knowledge_master_id)"
                      style="cursor: pointer;"
                    >
                      <td>
                        <code class="text-primary">{{ master.knowledge_master_id }}</code>
                      </td>
                      <td>{{ master.knowledge_master_name }}</td>
                      <td>{{ master.crdt_id }}</td>
                      <td>
                        <div class="btn-group btn-group-sm">
                          <button 
                            class="btn btn-outline-primary" 
                            @click.stop="editKnowledgeMaster(master)"
                            title="수정"
                          >
                            <i class="bi bi-pencil"></i>
                          </button>
                          <button 
                            class="btn btn-outline-danger" 
                            @click.stop="deleteKnowledgeMaster(master.knowledge_master_id)"
                            title="삭제"
                          >
                            <i class="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div v-if="filteredKnowledgeMasters.length === 0" class="text-center py-4 text-muted">
                  <i class="bi bi-inbox fs-1"></i>
                  <p class="mt-2">등록된 지식마스터가 없습니다.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 지식 목록 관리 -->
        <div class="col-lg-6">
          <div class="card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="card-title mb-0">
                  지식 목록 관리
                  <small v-if="selectedKnowledgeMaster" class="text-muted">
                    ({{ selectedKnowledgeMaster }})
                  </small>
                </h5>
                <button 
                  type="button" 
                  class="btn btn-success btn-sm" 
                  @click="showKnowledgeListModal()"
                  :disabled="!selectedKnowledgeMaster"
                >
                  <i class="bi bi-plus-circle me-1"></i> 지식 추가
                </button>
              </div>

              <!-- 선택된 지식마스터 정보 -->
              <div v-if="selectedKnowledgeMasterInfo" class="alert alert-info py-2 mb-3">
                <small>
                  <strong>{{ selectedKnowledgeMasterInfo.knowledge_master_name }}</strong> 
                  ({{ selectedKnowledgeMasterInfo.knowledge_master_id }}) 의 지식 목록
                </small>
              </div>

              <!-- 지식 목록 검색 -->
              <div class="row mb-3" v-if="selectedKnowledgeMaster">
                <div class="col-md-8">
                  <input 
                    type="text" 
                    class="form-control form-control-sm" 
                    placeholder="지식명으로 검색..."
                    v-model="knowledgeSearchText"
                    @input="searchKnowledgeList"
                  >
                </div>
                <div class="col-md-4">
                  <button class="btn btn-outline-secondary btn-sm w-100" @click="resetKnowledgeSearch">
                    <i class="bi bi-arrow-clockwise me-1"></i> 초기화
                  </button>
              </div>
              </div>

              <!-- 지식 목록 테이블 -->
              <div class="table-responsive" style="max-height: 500px; overflow-y: auto;">
                <table class="table table-sm table-hover" v-if="selectedKnowledgeMaster">
                  <thead class="table-light sticky-top">
                    <tr>                    
                      <th style="width: 15%">지식명</th>
                      <th style="width: 55%">설명</th>
                      <th style="width: 20%">등록자</th>
                      <th style="width: 20%">관리</th>
                  </tr>
                </thead>
                <tbody>
                    <tr v-for="knowledge in filteredKnowledgeList" :key="knowledge.idx">                     
                      <td>{{ knowledge.knowledge_name }}</td>
                      <td>
                        {{ knowledge.knowledge_desc }}
                      </td>
                      <td>{{ knowledge.crdt_id }}</td>
                      <td>
                        <div class="btn-group btn-group-sm">
                          <button 
                            class="btn btn-outline-primary" 
                            @click="editKnowledgeList(knowledge)"
                            title="수정"
                          >
                            <i class="bi bi-pencil"></i>
                          </button>
                          <button 
                            class="btn btn-outline-danger" 
                            @click="deleteKnowledgeList(knowledge.idx)"
                            title="삭제"
                          >
                            <i class="bi bi-trash"></i>
                          </button>
                        </div>
                    </td>
                  </tr>
                </tbody>
              </table>
                <div v-else class="text-center py-5 text-muted">
                  <i class="bi bi-arrow-left fs-1"></i>
                  <p class="mt-2">좌측에서 지식마스터를 선택해주세요.</p>
                </div>
                <div v-if="selectedKnowledgeMaster && filteredKnowledgeList.length === 0" class="text-center py-4 text-muted">
                  <i class="bi bi-inbox fs-1"></i>
                  <p class="mt-2">등록된 지식이 없습니다.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
    <!-- End Main Content -->

    <!-- 지식마스터 등록/수정 모달 -->
    <div 
      class="modal fade" 
      id="knowledgeMasterModal" 
      tabindex="-1" 
      aria-labelledby="knowledgeMasterModalLabel" 
      aria-hidden="true"
      ref="knowledgeMasterModalRef"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="knowledgeMasterModalLabel">
              {{ knowledgeMasterForm.isEdit ? '지식마스터 수정' : '지식마스터 등록' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <form @submit.prevent="saveKnowledgeMaster">
            <div class="modal-body">
              <div class="mb-3">
                <label for="knowledgeMasterId" class="form-label">지식마스터ID <span class="text-danger">*</span></label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="knowledgeMasterId" 
                  v-model="knowledgeMasterForm.knowledge_master_id"
                  :disabled="knowledgeMasterForm.isEdit"
                  placeholder="예: MANUAL_001"
                  required
                >
                <div class="form-text">영문, 숫자, 언더스코어(_)만 사용 가능합니다.</div>
              </div>
              <div class="mb-3">
                <label for="knowledgeMasterName" class="form-label">지식마스터명 <span class="text-danger">*</span></label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="knowledgeMasterName" 
                  v-model="knowledgeMasterForm.knowledge_master_name"
                  placeholder="예: 사용자 매뉴얼"
                  required
                >
              </div>
              <div class="mb-3">
                <label for="knowledgeMasterDesc" class="form-label">설명</label>
                <textarea 
                  class="form-control" 
                  id="knowledgeMasterDesc" 
                  rows="3"
                  v-model="knowledgeMasterForm.knowledge_master_desc"
                  placeholder="지식마스터에 대한 설명을 입력하세요"
                ></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">취소</button>
              <button type="submit" class="btn btn-primary" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                {{ knowledgeMasterForm.isEdit ? '수정' : '등록' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 지식 목록 등록/수정 모달 -->
    <div 
      class="modal fade" 
      id="knowledgeListModal" 
      tabindex="-1" 
      aria-labelledby="knowledgeListModalLabel" 
      aria-hidden="true"
      ref="knowledgeListModalRef"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="knowledgeListModalLabel">
              {{ knowledgeListForm.isEdit ? '지식 수정' : '지식 등록' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <form @submit.prevent="saveKnowledgeList">
            <div class="modal-body">
              <div class="mb-3">
                <label for="knowledgeGubun" class="form-label">구분</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="knowledgeGubun" 
                  v-model="knowledgeListForm.gubun"
                  placeholder="예: 매뉴얼, 가이드 등"
                >
              </div>
              <div class="mb-3">
                <label for="knowledgeName" class="form-label">지식명 <span class="text-danger">*</span></label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="knowledgeName" 
                  v-model="knowledgeListForm.knowledge_name"
                  placeholder="예: 로그인 방법"
                  required
                >
              </div>
              <div class="mb-3">
                <label for="knowledgeId" class="form-label">지식ID</label>
                <input 
                  type="number" 
                  class="form-control" 
                  id="knowledgeId" 
                  v-model="knowledgeListForm.knowledge_id"
                  placeholder="지식 ID (숫자)"
                >
              </div>
              <div class="mb-3">
                <label for="knowledgeDesc" class="form-label">설명</label>
                <textarea 
                  class="form-control" 
                  id="knowledgeDesc" 
                  rows="4"
                  v-model="knowledgeListForm.knowledge_desc"
                  placeholder="지식에 대한 상세 설명을 입력하세요"
                ></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">취소</button>
              <button type="submit" class="btn btn-success" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                {{ knowledgeListForm.isEdit ? '수정' : '등록' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    
  </div>
  <!-- End Page Wrapper -->
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'

// Use custom layout with embedded header
definePageMeta({
  layout: false
})

// Page head
useHead({
  title: '지식 관리',
  meta: [
    { name: 'description', content: 'Knowledge management page - Knowledge masters and knowledge list' }
  ]
})

// Reactive data
const loading = ref(false)
const knowledgeMasterModalRef = ref(null)
const knowledgeListModalRef = ref(null)

// 지식마스터 관련
const knowledgeMasters = ref([])
const filteredKnowledgeMasters = ref([])
const selectedKnowledgeMaster = ref('')
const masterSearchText = ref('')

// 지식목록 관련
const knowledgeList = ref([])
const filteredKnowledgeList = ref([])
const knowledgeSearchText = ref('')

// 지식마스터 폼
const knowledgeMasterForm = ref({
  knowledge_master_id: '',
  knowledge_master_name: '',
  knowledge_master_desc: '',
  isEdit: false
})

// 지식목록 폼
const knowledgeListForm = ref({
  gubun: '',
  knowledge_name: '',
  knowledge_id: null,
  knowledge_desc: '',
  isEdit: false,
  idx: null
})

// Computed
const selectedKnowledgeMasterInfo = computed(() => {
  return knowledgeMasters.value.find(master => master.knowledge_master_id === selectedKnowledgeMaster.value)
})

// 데이터베이스 연결 테스트
const testDatabaseConnection = async () => {
  try {
    const api = useApi()
    const response = await api.system.testDatabase()
    console.log('데이터베이스 연결 테스트 결과:', response)
    return response.success
  } catch (error) {
    console.error('데이터베이스 연결 테스트 실패:', error)
    return false
  }
}

// 지식마스터 관련 메서드
const fetchKnowledgeMasters = async () => {
  try {
    console.log('지식마스터 목록 조회 시작...')
    
    // 먼저 데이터베이스 연결 테스트
    const dbConnected = await testDatabaseConnection()
    if (!dbConnected) {
      console.warn('데이터베이스 연결 실패, 샘플 데이터로 대체')
      // 샘플 데이터로 즉시 대체
      knowledgeMasters.value = [
        {
          idx: 1,
          knowledge_master_id: 'SAMPLE_001',
          knowledge_master_name: '샘플 지식마스터 (DB 연결 실패)',
          knowledge_master_desc: '데이터베이스에 연결할 수 없어 샘플 데이터로 표시됩니다.',
          crdt_id: 'admin',
          crdt_dt: new Date().toISOString()
        }
      ]
      filteredKnowledgeMasters.value = knowledgeMasters.value
      return
    }
    
    const api = useApi()
    
    // 빈 파라미터로 API 호출
    const response = await api.knowledge.getAllMasters({})
    
    console.log('지식마스터 API 응답:', response)
    
    if (response && response.success) {
      knowledgeMasters.value = response.data.masters || []
      filteredKnowledgeMasters.value = knowledgeMasters.value
      console.log('지식마스터 목록 로드 완료:', knowledgeMasters.value.length, '개')
    } else {
      console.error('API 응답이 성공적이지 않음:', response)
      
      // 개발용 샘플 데이터 추가
      knowledgeMasters.value = [
        {
          idx: 1,
          knowledge_master_id: 'SAMPLE_001',
          knowledge_master_name: '샘플 지식마스터',
          knowledge_master_desc: '테스트용 샘플 데이터입니다.',
          crdt_id: 'admin',
          crdt_dt: new Date().toISOString()
        }
      ]
      filteredKnowledgeMasters.value = knowledgeMasters.value
      
      console.warn('샘플 데이터로 대체됨')
    }
  } catch (error) {
    console.error('지식마스터 목록 조회 오류:', error)
    console.error('오류 상세:', {
      message: error.message,
      status: error.status,
      statusCode: error.statusCode,
      data: error.data,
      cause: error.cause
    })
    
    // 개발용 샘플 데이터로 대체
    knowledgeMasters.value = [
      {
        idx: 1,
        knowledge_master_id: 'SAMPLE_001',
        knowledge_master_name: '샘플 지식마스터',
        knowledge_master_desc: '데이터베이스 연결 오류로 인한 샘플 데이터입니다.',
        crdt_id: 'admin',
        crdt_dt: new Date().toISOString()
      }
    ]
    filteredKnowledgeMasters.value = knowledgeMasters.value
    
    let errorMessage = '지식마스터 목록을 불러오는데 실패했습니다.'
    if (error.status === 500 || error.statusCode === 500) {
      errorMessage += '\n서버 오류가 발생했습니다. 데이터베이스 연결을 확인해주세요.'
    } else if (error.message) {
      errorMessage += '\n오류: ' + error.message
    }
    errorMessage += '\n\n샘플 데이터로 대체되었습니다.'
    
    console.warn('샘플 데이터로 대체됨:', errorMessage)
    // alert(errorMessage) // 개발 중에는 alert 대신 console.warn 사용
  }
}

const fetchKnowledgeList = async (knowledgeMasterId) => {
  if (!knowledgeMasterId) {
    knowledgeList.value = []
    filteredKnowledgeList.value = []
    return
  }

  try {
    console.log('지식 목록 조회 시작:', knowledgeMasterId)
    const api = useApi()
    const response = await api.knowledge.getKnowledgeList(knowledgeMasterId)
    
    console.log('지식 목록 API 응답:', response)
    
    if (response && response.success) {
      knowledgeList.value = response.data.knowledgeList || []
      filteredKnowledgeList.value = knowledgeList.value
      console.log('지식 목록 로드 완료:', knowledgeList.value.length, '개')
    } else {
      console.error('지식 목록 API 응답이 성공적이지 않음:', response)
      
      // 샘플 데이터로 대체
      knowledgeList.value = [
        {
          idx: 1,
          knowledge_master_id: knowledgeMasterId,
          gubun: '매뉴얼',
          knowledge_id: 1,
          knowledge_name: '샘플 지식',
          knowledge_desc: '테스트용 샘플 지식 데이터입니다.',
          crdt_id: 'admin',
          crdt_dt: new Date().toISOString()
        }
      ]
      filteredKnowledgeList.value = knowledgeList.value
      console.warn('지식 목록 샘플 데이터로 대체됨')
    }
  } catch (error) {
    console.error('지식 목록 조회 오류:', error)
    
    // 샘플 데이터로 대체
    knowledgeList.value = [
      {
        idx: 1,
        knowledge_master_id: knowledgeMasterId,
        gubun: '매뉴얼',
        knowledge_id: 1,
        knowledge_name: '샘플 지식 (오류)',
        knowledge_desc: '데이터베이스 연결 오류로 인한 샘플 데이터입니다.',
        crdt_id: 'admin',
        crdt_dt: new Date().toISOString()
      }
    ]
    filteredKnowledgeList.value = knowledgeList.value
    
    console.warn('지식 목록 오류로 인한 샘플 데이터 대체:', error.message)
    // alert('지식 목록을 불러오는데 실패했습니다: ' + error.message + '\n\n샘플 데이터로 대체되었습니다.')
  }
}

const selectKnowledgeMaster = (knowledgeMasterId) => {
  selectedKnowledgeMaster.value = knowledgeMasterId
  knowledgeSearchText.value = ''
  fetchKnowledgeList(knowledgeMasterId)
}

const searchMasters = () => {
  const searchText = masterSearchText.value.toLowerCase()
  if (!searchText) {
    filteredKnowledgeMasters.value = knowledgeMasters.value
  } else {
    filteredKnowledgeMasters.value = knowledgeMasters.value.filter(master =>
      master.knowledge_master_id.toLowerCase().includes(searchText) ||
      master.knowledge_master_name.toLowerCase().includes(searchText)
    )
  }
}

const resetMasterSearch = () => {
  masterSearchText.value = ''
  filteredKnowledgeMasters.value = knowledgeMasters.value
}

const searchKnowledgeList = () => {
  const searchText = knowledgeSearchText.value.toLowerCase()
  if (!searchText) {
    filteredKnowledgeList.value = knowledgeList.value
  } else {
    filteredKnowledgeList.value = knowledgeList.value.filter(knowledge =>
      knowledge.knowledge_name.toLowerCase().includes(searchText)
    )
  }
}

const resetKnowledgeSearch = () => {
  knowledgeSearchText.value = ''
  filteredKnowledgeList.value = knowledgeList.value
}

// 지식마스터 모달 관련
const showKnowledgeMasterModal = (master = null) => {
  if (master) {
    knowledgeMasterForm.value = {
      knowledge_master_id: master.knowledge_master_id,
      knowledge_master_name: master.knowledge_master_name,
      knowledge_master_desc: master.knowledge_master_desc || '',
      isEdit: true
    }
  } else {
    knowledgeMasterForm.value = {
      knowledge_master_id: '',
      knowledge_master_name: '',
      knowledge_master_desc: '',
      isEdit: false
    }
  }
  
  // Bootstrap 모달 열기
  if (process.client) {
    const modal = new bootstrap.Modal(document.getElementById('knowledgeMasterModal'))
    modal.show()
  }
}

const editKnowledgeMaster = (master) => {
  showKnowledgeMasterModal(master)
}

const saveKnowledgeMaster = async () => {
  if (!knowledgeMasterForm.value.knowledge_master_id || !knowledgeMasterForm.value.knowledge_master_name) {
    alert('필수 항목을 입력해주세요.')
    return
  }

  loading.value = true

  try {
    const requestData = {
      knowledge_master_id: knowledgeMasterForm.value.knowledge_master_id,
      knowledge_master_name: knowledgeMasterForm.value.knowledge_master_name,
      knowledge_master_desc: knowledgeMasterForm.value.knowledge_master_desc,
      crdt_id: 'admin'
    }

    const api = useApi()
    let response

    if (knowledgeMasterForm.value.isEdit) {
      response = await api.knowledge.updateMaster(knowledgeMasterForm.value.knowledge_master_id, requestData)
    } else {
      response = await api.knowledge.createMaster(requestData)
    }

    if (response.success) {
      alert(knowledgeMasterForm.value.isEdit ? '지식마스터가 수정되었습니다.' : '지식마스터가 등록되었습니다.')
      
      // 모달 닫기
      if (process.client) {
        const modal = bootstrap.Modal.getInstance(document.getElementById('knowledgeMasterModal'))
        modal.hide()
      }
      
      // 목록 새로고침
      await fetchKnowledgeMasters()
      
      // 현재 선택된 지식마스터가 수정된 경우 지식목록도 새로고침
      if (knowledgeMasterForm.value.isEdit && selectedKnowledgeMaster.value === knowledgeMasterForm.value.knowledge_master_id) {
        await fetchKnowledgeList(selectedKnowledgeMaster.value)
      }
    } else {
      alert('저장에 실패했습니다: ' + (response.message || '알 수 없는 오류'))
    }
  } catch (error) {
    console.error('Save knowledge master error:', error)
    alert('오류가 발생했습니다: ' + error.message)
  } finally {
    loading.value = false
  }
}

const deleteKnowledgeMaster = async (knowledgeMasterId) => {
  if (!confirm('정말로 이 지식마스터를 삭제하시겠습니까?\n관련된 모든 지식도 함께 삭제됩니다.')) {
    return
  }

  loading.value = true

  try {
    const api = useApi()
    const response = await api.knowledge.deleteMaster(knowledgeMasterId)

    if (response.success) {
      alert('지식마스터가 삭제되었습니다.')
      
      // 삭제된 지식마스터가 현재 선택된 것이라면 선택 해제
      if (selectedKnowledgeMaster.value === knowledgeMasterId) {
        selectedKnowledgeMaster.value = ''
        knowledgeList.value = []
        filteredKnowledgeList.value = []
      }
      
      // 목록 새로고침
      await fetchKnowledgeMasters()
    } else {
      alert('삭제에 실패했습니다: ' + (response.message || '알 수 없는 오류'))
    }
  } catch (error) {
    console.error('Delete knowledge master error:', error)
    alert('오류가 발생했습니다: ' + error.message)
  } finally {
    loading.value = false
  }
}

// 지식목록 모달 관련
const showKnowledgeListModal = (knowledge = null) => {
  if (!selectedKnowledgeMaster.value) {
    alert('먼저 지식마스터를 선택해주세요.')
    return
  }

  if (knowledge) {
    knowledgeListForm.value = {
      gubun: knowledge.gubun || '',
      knowledge_name: knowledge.knowledge_name,
      knowledge_id: knowledge.knowledge_id,
      knowledge_desc: knowledge.knowledge_desc || '',
      isEdit: true,
      idx: knowledge.idx
    }
  } else {
    knowledgeListForm.value = {
      gubun: '',
      knowledge_name: '',
      knowledge_id: null,
      knowledge_desc: '',
      isEdit: false,
      idx: null
    }
  }
  
  // Bootstrap 모달 열기
  if (process.client) {
    const modal = new bootstrap.Modal(document.getElementById('knowledgeListModal'))
    modal.show()
  }
}

const editKnowledgeList = (knowledge) => {
  showKnowledgeListModal(knowledge)
}

const saveKnowledgeList = async () => {
  if (!knowledgeListForm.value.knowledge_name) {
    alert('지식명을 입력해주세요.')
    return
  }

  loading.value = true
  
  try {
    const requestData = {
      knowledge_master_id: selectedKnowledgeMaster.value,
      gubun: knowledgeListForm.value.gubun,
      knowledge_name: knowledgeListForm.value.knowledge_name,
      knowledge_id: knowledgeListForm.value.knowledge_id,
      knowledge_desc: knowledgeListForm.value.knowledge_desc,
      crdt_id: 'admin'
    }

    const api = useApi()
    let response

    if (knowledgeListForm.value.isEdit) {
      response = await api.knowledge.updateKnowledgeList(
        selectedKnowledgeMaster.value, 
        knowledgeListForm.value.idx.toString(), 
        requestData
      )
    } else {
      response = await api.knowledge.createKnowledgeList(requestData)
    }

    if (response.success) {
      alert(knowledgeListForm.value.isEdit ? '지식이 수정되었습니다.' : '지식이 등록되었습니다.')
      
      // 모달 닫기
      if (process.client) {
        const modal = bootstrap.Modal.getInstance(document.getElementById('knowledgeListModal'))
        modal.hide()
      }
      
      // 지식목록 새로고침
      await fetchKnowledgeList(selectedKnowledgeMaster.value)
    } else {
      alert('저장에 실패했습니다: ' + (response.message || '알 수 없는 오류'))
    }
  } catch (error) {
    console.error('Save knowledge list error:', error)
    alert('오류가 발생했습니다: ' + error.message)
  } finally {
    loading.value = false
  }
}

const deleteKnowledgeList = async (idx) => {
  if (!confirm('정말로 이 지식을 삭제하시겠습니까?')) {
    return
  }

  loading.value = true

  try {
    const api = useApi()
    const response = await api.knowledge.deleteKnowledgeList(selectedKnowledgeMaster.value, idx.toString())

    if (response.success) {
      alert('지식이 삭제되었습니다.')
      
      // 지식목록 새로고침
      await fetchKnowledgeList(selectedKnowledgeMaster.value)
    } else {
      alert('삭제에 실패했습니다: ' + (response.message || '알 수 없는 오류'))
    }
  } catch (error) {
    console.error('Delete knowledge list error:', error)
    alert('오류가 발생했습니다: ' + error.message)
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  fetchKnowledgeMasters()
})
</script>

<style scoped>
/* 페이지 래퍼 스타일 */
.page-wrapper {
  min-height: 100vh;
  background-color: #f8f9fa;
}

/* 메인 콘텐츠 스타일 */
.main {
  padding: 2rem 1.5rem;
  margin-top: 0;
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

/* 지식 관리 페이지 스타일 */
.btn-sm {
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
}

/* 테이블 행 호버 효과 */
.table-hover tbody tr:hover {
  background-color: rgba(0, 123, 255, 0.1);
}

/* 선택된 지식마스터 행 강조 */
.table-active {
  background-color: rgba(0, 123, 255, 0.2) !important;
}

/* 스크롤바 스타일링 */
.table-responsive::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.table-responsive::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.table-responsive::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.table-responsive::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* 고정 헤더 스타일 */
.sticky-top {
  position: sticky;
  top: 0;
  z-index: 10;
}

/* 코드 텍스트 스타일 */
code {
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  background-color: rgba(0, 0, 0, 0.05);
}

/* 배지 스타일 개선 */
.badge {
  font-size: 0.75rem;
  font-weight: 500;
}

/* 빈 상태 아이콘 */
.bi.fs-1 {
  font-size: 3rem !important;
  opacity: 0.3;
}

/* 모달 스타일 개선 */
.modal-header {
  border-bottom: 1px solid #dee2e6;
  background-color: #f8f9fa;
}

.modal-footer {
  border-top: 1px solid #dee2e6;
  background-color: #f8f9fa;
}

/* 필수 항목 표시 */
.text-danger {
  color: #dc3545 !important;
}

/* 폼 텍스트 스타일 */
.form-text {
  font-size: 0.875rem;
  color: #6c757d;
}

/* 알림 박스 스타일 */
.alert-info {
  background-color: #d1ecf1;
  border-color: #b6d4da;
  color: #0c5460;
  border-radius: 0.375rem;
}

/* 버튼 그룹 간격 */
.btn-group-sm > .btn {
  margin-right: 2px;
}

.btn-group-sm > .btn:last-child {
  margin-right: 0;
}

/* 카드 제목 스타일 */
.card-title {
  color: #495057;
  font-weight: 600;
}

/* 검색 입력 필드 */
.form-control-sm {
  border-radius: 0.375rem;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .main {
    padding: 1rem;
  }
  
  .pagetitle h1 {
    font-size: 1.5rem;
  }
  
  .col-lg-6 {
    margin-bottom: 1rem;
  }
  
  .table-responsive {
    font-size: 0.875rem;
  }
  
  .btn-group-sm > .btn {
    padding: 0.125rem 0.25rem;
    font-size: 0.75rem;
  }
  
  .card-title {
    font-size: 1.1rem;
  }
}

/* 헤더와 네비게이션이 고정되어 있을 경우 여백 조정 */
@media (min-width: 992px) {
  .main {
    padding-top: 1rem;
  }
}

/* 애니메이션 효과 */
.card {
  transition: box-shadow 0.15s ease-in-out;
}

.card:hover {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important;
}

.btn {
  transition: all 0.15s ease-in-out;
}

/* 로딩 스피너 */
.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

/* 테이블 셀 정렬 */
.table th,
.table td {
  vertical-align: middle;
}

/* 툴팁 스타일 개선 */
[title] {
  cursor: help;
}

/* 모달 애니메이션 개선 */
.modal.fade .modal-dialog {
  transition: transform 0.3s ease-out;
}

.modal.show .modal-dialog {
  transform: none;
}
</style>