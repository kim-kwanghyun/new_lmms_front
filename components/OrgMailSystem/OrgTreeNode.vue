<template>
  <div class="tree-node" :class="{ 'selected': isSelected }">
    <div 
      class="node-content" 
      :class="{ 'has-children': hasChildren }"
      @click="handleSelect"
    >
      <div class="node-toggle" @click.stop="handleToggle">
        <i 
          v-if="hasChildren"
          :class="['bi', isExpanded ? 'bi-chevron-down' : 'bi-chevron-right']"
        ></i>
        <span v-else class="toggle-spacer"></span>
      </div>
      
      <div class="node-icon">
        <i :class="getIconClass()"></i>
      </div>
      
      <div class="node-info">
        <div class="node-name">{{ node.name }}</div>
        <div class="node-details">
          <span class="node-type">{{ getTypeLabel() }}</span>
          <span v-if="node.memberCount" class="member-count">
            <i class="bi bi-people"></i> {{ node.memberCount }}명
          </span>
        </div>
      </div>
    </div>
    
    <div v-if="hasChildren && isExpanded" class="children">
      <OrgTreeNode 
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :selected-id="selectedId"
        :expanded-ids="expandedIds"
        @select="$emit('select', $event)"
        @toggle="$emit('toggle', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

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
  node: OrgNode
  selectedId?: string
  expandedIds: Set<string>
}

interface Emits {
  (e: 'select', node: OrgNode): void
  (e: 'toggle', nodeId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isSelected = computed(() => props.selectedId === props.node.id)
const hasChildren = computed(() => props.node.children && props.node.children.length > 0)
const isExpanded = computed(() => props.expandedIds.has(props.node.id))

const handleSelect = () => {
  emit('select', props.node)
}

const handleToggle = () => {
  if (hasChildren.value) {
    emit('toggle', props.node.id)
  }
}

const getIconClass = () => {
  const iconMap = {
    company: 'bi bi-building text-primary',
    division: 'bi bi-diagram-3 text-success',
    department: 'bi bi-collection text-info',
    team: 'bi bi-people text-warning',
    unit: 'bi bi-person-badge text-secondary'
  }
  return iconMap[props.node.type] || 'bi bi-folder'
}

const getTypeLabel = () => {
  const typeMap = {
    company: '회사',
    division: '사업부',
    department: '부서',
    team: '팀',
    unit: '유닛'
  }
  return typeMap[props.node.type] || '기타'
}
</script>

<style scoped>
.tree-node {
  margin-bottom: 2px;
}

.node-content {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
  background-color: transparent;
}

.node-content:hover {
  background-color: #f8f9fa;
}

.node-content.selected,
.tree-node.selected > .node-content {
  background-color: #e3f2fd;
  border: 1px solid #2196f3;
  box-shadow: 0 2px 4px rgba(33, 150, 243, 0.1);
}

.node-toggle {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  cursor: pointer;
  border-radius: 3px;
  transition: background-color 0.2s ease;
}

.node-toggle:hover {
  background-color: #e9ecef;
}

.toggle-spacer {
  width: 12px;
}

.node-icon {
  margin-right: 10px;
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.node-info {
  flex: 1;
  min-width: 0;
}

.node-name {
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.node-details {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.75rem;
  color: #6c757d;
}

.node-type {
  background-color: #e9ecef;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 500;
}

.member-count {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #28a745;
  font-weight: 500;
}

.children {
  margin-left: 28px;
  border-left: 2px solid #e9ecef;
  padding-left: 8px;
}

/* 타입별 색상 */
.tree-node[data-type="company"] .node-name {
  color: #1976d2;
  font-weight: 600;
}

.tree-node[data-type="division"] .node-name {
  color: #388e3c;
  font-weight: 600;
}

.tree-node[data-type="department"] .node-name {
  color: #0288d1;
  font-weight: 500;
}

.tree-node[data-type="team"] .node-name {
  color: #f57c00;
  font-weight: 500;
}

.tree-node[data-type="unit"] .node-name {
  color: #5e35b1;
  font-weight: 500;
}

/* 반응형 */
@media (max-width: 768px) {
  .node-content {
    padding: 6px 8px;
  }
  
  .node-details {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .children {
    margin-left: 20px;
  }
}
</style>
