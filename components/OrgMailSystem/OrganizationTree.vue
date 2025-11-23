<template>
  <div class="organization-tree">
    <div class="tree-header">
      <h6 class="mb-3">
        <i class="bi bi-diagram-3"></i> 조직도
      </h6>
      <div class="search-box mb-3">
        <input 
          type="text" 
          class="form-control form-control-sm" 
          placeholder="조직 검색..." 
          v-model="searchTerm"
        >
      </div>
    </div>
    
    <div class="tree-content">
      <div class="tree-actions mb-2">
        <button 
          class="btn btn-sm btn-outline-secondary me-1" 
          @click="expandAll"
        >
          <i class="bi bi-arrows-expand"></i> 전체 펼치기
        </button>
        <button 
          class="btn btn-sm btn-outline-secondary" 
          @click="collapseAll"
        >
          <i class="bi bi-arrows-collapse"></i> 전체 접기
        </button>
      </div>
      
      <div class="tree-nodes">
        <OrgTreeNode 
          v-for="node in filteredOrganizations"
          :key="node.id"
          :node="node"
          :selected-id="selectedOrgId"
          :expanded-ids="expandedIds"
          @select="handleOrgSelect"
          @toggle="handleToggle"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface OrgNode {
  id: string
  name: string
  code?: string
  type: 'company' | 'division' | 'department' | 'team' | 'unit'
  parentId?: string
  children?: OrgNode[]
  memberCount?: number
}

interface Props {
  selectedOrgId?: string
}

interface Emits {
  (e: 'org-select', org: OrgNode): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const searchTerm = ref('')
const expandedIds = ref<Set<string>>(new Set())
const organizations = ref<OrgNode[]>([])

// 조직도 데이터 로드
const loadOrganizations = async () => {
  // 실제 API 호출 대신 샘플 데이터
  organizations.value = [
    {
      id: 'skgas',
      name: 'SK가스',
      type: 'company',
      memberCount: 1250,
      children: [
        {
          id: 'iam',
          name: 'IAM',
          type: 'division',
          parentId: 'skgas',
          memberCount: 45,
          children: [
            {
              id: 'iam-auth',
              name: '인증',
              type: 'department',
              parentId: 'iam',
              memberCount: 12,
              children: [
                { id: 'iam-auth-dev', name: '개발팀', type: 'team', parentId: 'iam-auth', memberCount: 5 },
                { id: 'iam-auth-ops', name: '운영팀', type: 'team', parentId: 'iam-auth', memberCount: 4 },
                { id: 'iam-auth-qa', name: 'QA팀', type: 'team', parentId: 'iam-auth', memberCount: 3 }
              ]
            },
            {
              id: 'iam-system',
              name: '시스템',
              type: 'department', 
              parentId: 'iam',
              memberCount: 15,
              children: [
                { id: 'iam-system-infra', name: '인프라팀', type: 'team', parentId: 'iam-system', memberCount: 6 },
                { id: 'iam-system-db', name: 'DB팀', type: 'team', parentId: 'iam-system', memberCount: 4 },
                { id: 'iam-system-security', name: '보안팀', type: 'team', parentId: 'iam-system', memberCount: 5 }
              ]
            },
            {
              id: 'iam-support',
              name: '지원',
              type: 'department',
              parentId: 'iam', 
              memberCount: 18,
              children: [
                { id: 'iam-support-help', name: '헬프데스크', type: 'team', parentId: 'iam-support', memberCount: 8 },
                { id: 'iam-support-training', name: '교육팀', type: 'team', parentId: 'iam-support', memberCount: 6 },
                { id: 'iam-support-doc', name: '문서팀', type: 'team', parentId: 'iam-support', memberCount: 4 }
              ]
            }
          ]
        },
        {
          id: 'business',
          name: '사업부',
          type: 'division',
          parentId: 'skgas',
          memberCount: 320,
          children: [
            {
              id: 'business-sales',
              name: '영업팀',
              type: 'department',
              parentId: 'business',
              memberCount: 85,
              children: [
                { id: 'business-sales-retail', name: '소매영업', type: 'team', parentId: 'business-sales', memberCount: 35 },
                { id: 'business-sales-wholesale', name: '도매영업', type: 'team', parentId: 'business-sales', memberCount: 28 },
                { id: 'business-sales-online', name: '온라인영업', type: 'team', parentId: 'business-sales', memberCount: 22 }
              ]
            },
            {
              id: 'business-marketing',
              name: '마케팅팀',
              type: 'department',
              parentId: 'business',
              memberCount: 45,
              children: [
                { id: 'business-marketing-digital', name: '디지털마케팅', type: 'team', parentId: 'business-marketing', memberCount: 20 },
                { id: 'business-marketing-brand', name: '브랜드마케팅', type: 'team', parentId: 'business-marketing', memberCount: 15 },
                { id: 'business-marketing-pr', name: 'PR팀', type: 'team', parentId: 'business-marketing', memberCount: 10 }
              ]
            }
          ]
        },
        {
          id: 'hr',
          name: '인사팀',
          type: 'division',
          parentId: 'skgas',
          memberCount: 65,
          children: [
            { id: 'hr-recruit', name: '채용팀', type: 'department', parentId: 'hr', memberCount: 12 },
            { id: 'hr-training', name: '교육팀', type: 'department', parentId: 'hr', memberCount: 18 },
            { id: 'hr-welfare', name: '복리후생팀', type: 'department', parentId: 'hr', memberCount: 15 },
            { id: 'hr-payroll', name: '급여팀', type: 'department', parentId: 'hr', memberCount: 10 },
            { id: 'hr-labor', name: '노무팀', type: 'department', parentId: 'hr', memberCount: 10 }
          ]
        }
      ]
    }
  ]
  
  // 기본적으로 최상위 노드들 펼치기
  expandedIds.value.add('skgas')
  expandedIds.value.add('iam')
  expandedIds.value.add('business')
  expandedIds.value.add('hr')
}

// 검색 필터링
const filteredOrganizations = computed(() => {
  if (!searchTerm.value) return organizations.value
  
  const filterNodes = (nodes: OrgNode[]): OrgNode[] => {
    return nodes.filter(node => {
      const matchesSearch = node.name.toLowerCase().includes(searchTerm.value.toLowerCase())
      const hasMatchingChildren = node.children && filterNodes(node.children).length > 0
      
      if (matchesSearch || hasMatchingChildren) {
        return {
          ...node,
          children: node.children ? filterNodes(node.children) : undefined
        }
      }
      return false
    }).filter(Boolean) as OrgNode[]
  }
  
  return filterNodes(organizations.value)
})

// 조직 선택 처리
const handleOrgSelect = (org: OrgNode) => {
  emit('org-select', org)
}

// 노드 토글 처리
const handleToggle = (nodeId: string) => {
  if (expandedIds.value.has(nodeId)) {
    expandedIds.value.delete(nodeId)
  } else {
    expandedIds.value.add(nodeId)
  }
}

// 전체 펼치기
const expandAll = () => {
  const addAllIds = (nodes: OrgNode[]) => {
    nodes.forEach(node => {
      expandedIds.value.add(node.id)
      if (node.children) {
        addAllIds(node.children)
      }
    })
  }
  addAllIds(organizations.value)
}

// 전체 접기
const collapseAll = () => {
  expandedIds.value.clear()
  // 최상위만 유지
  expandedIds.value.add('skgas')
}

onMounted(() => {
  loadOrganizations()
})
</script>

<style scoped>
.organization-tree {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tree-header {
  flex-shrink: 0;
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
  background-color: #f8f9fa;
}

.tree-content {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}

.tree-actions {
  display: flex;
  gap: 0.5rem;
}

.tree-nodes {
  max-height: calc(100vh - 300px);
  overflow-y: auto;
}

.search-box input {
  border-radius: 0.375rem;
}

.btn-sm {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}

/* 스크롤바 스타일링 */
.tree-content::-webkit-scrollbar,
.tree-nodes::-webkit-scrollbar {
  width: 6px;
}

.tree-content::-webkit-scrollbar-track,
.tree-nodes::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.tree-content::-webkit-scrollbar-thumb,
.tree-nodes::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.tree-content::-webkit-scrollbar-thumb:hover,
.tree-nodes::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
