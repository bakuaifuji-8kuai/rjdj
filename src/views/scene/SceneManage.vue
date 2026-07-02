<template>
  <div class="scene-linkage-container">
    <div class="page-header">
      <div class="header-left">
        <div class="title-wrapper">
          <div class="title-icon">
            <el-icon :size="24"><Grid /></el-icon>
          </div>
          <div>
            <h1 class="main-title">场景联动管理</h1>
            <p class="sub-title">管理照明场景联动规则</p>
          </div>
        </div>
      </div>
      <div class="header-right">
        <el-tabs v-model="viewMode" class="view-tabs">
          <el-tab-pane label="卡片模式" name="card">
            <template #label>
              <el-icon :size="16"><Layout /></el-icon>
              <span>卡片模式</span>
            </template>
          </el-tab-pane>
          <el-tab-pane label="列表模式" name="list">
            <template #label>
              <el-icon :size="16"><List /></el-icon>
              <span>列表模式</span>
            </template>
          </el-tab-pane>
        </el-tabs>
        <el-button type="primary" @click="handleAdd" class="add-btn">
          <el-icon :size="16"><Plus /></el-icon>
          新增规则
        </el-button>
        <el-button :disabled="selectedRows.length === 0" @click="handleBatchDelete" class="batch-btn">
          <el-icon :size="16"><Delete /></el-icon>
          批量删除
        </el-button>
      </div>
    </div>

    <div class="filter-bar">
      <div class="search-box">
        <el-input 
          v-model="filterKeyword" 
          placeholder="请输入规则名称查询" 
          class="filter-input"
          prefix-icon="Search"
        />
      </div>
      <el-select v-model="filterStatus" placeholder="请选择启用状态" class="filter-select">
        <el-option label="全部" value="" />
        <el-option label="启用" value="true" />
        <el-option label="禁用" value="false" />
      </el-select>
      <el-select v-model="filterPriority" placeholder="请选择优先级" class="filter-select">
        <el-option label="全部" value="" />
        <el-option label="高" value="high" />
        <el-option label="低" value="low" />
      </el-select>
      <el-button type="primary" @click="handleSearch" class="search-btn">搜索</el-button>
      <el-button @click="handleReset" class="reset-btn">重置</el-button>
    </div>

    <div v-if="viewMode === 'card'" class="rule-cards">
      <div 
        v-for="rule in filteredRules" 
        :key="rule.id" 
        class="rule-card"
        :class="{ selected: rule.selected }"
        @click="toggleSelect(rule)"
      >
        <div class="card-header">
          <div class="priority-tag" :class="rule.priority">
            <span>{{ rule.priority === 'high' ? '高' : '低' }}</span>
          </div>
          <div class="checkbox-wrapper">
            <el-checkbox v-model="rule.selected" />
          </div>
          <span class="rule-name">{{ rule.name }}</span>
          <div class="card-controls">
            <el-switch v-model="rule.enabled" active-text="启用" inactive-text="禁用" @change="handleToggle(rule)" />
          </div>
        </div>
        <div class="card-body">
          <div class="execute-info">
            <span class="info-label">执行日期:</span>
            <span class="info-value">{{ rule.executeDate }}</span>
          </div>
          <div class="card-actions">
            <el-button type="text" size="small" @click.stop="handleEdit(rule)" class="action-btn">
              <el-icon :size="14"><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="text" size="small" @click.stop="handleDelete(rule)" class="action-btn delete">
              <el-icon :size="14"><Delete /></el-icon>
              删除
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="list-panel">
      <el-table :data="filteredRules" border class="data-table" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" align="center"></el-table-column>
        <el-table-column prop="no" label="#" width="50" align="center">
          <template #default="{ $index }">
            <span class="row-number">{{ $index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="规则名称" min-width="150">
          <template #default="{ row }">
            <span class="rule-name-cell">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="90" align="center">
          <template #default="{ row }">
            <div class="priority-badge" :class="row.priority">
              <span class="priority-dot"></span>
              {{ row.priority === 'high' ? '高' : '低' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="enabled" label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.enabled" @change="handleToggle(row)" />
          </template>
        </el-table-column>
        <el-table-column prop="executeDate" label="执行日期" min-width="180">
          <template #default="{ row }">
            <span class="date-cell">{{ row.executeDate }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center">
          <template #default="{ row }">
            <el-button type="text" size="small" @click="handleEdit(row)" class="table-action-btn">
              <el-icon :size="14"><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="text" size="small" @click="handleDelete(row)" class="table-action-btn delete">
              <el-icon :size="14"><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="pagination-bar">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        layout="prev, pager, next, jumper, ->, total"
        class="pagination"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessageBox } from 'element-plus';
import {
  Grid, Layout, List, Plus, Delete, Search, Edit
} from '@element-plus/icons-vue';

const router = useRouter();
const viewMode = ref('card');
const filterKeyword = ref('');
const filterStatus = ref('');
const filterPriority = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const selectedRows = ref([]);

const rulesData = ref([
  { id: 1, no: 1, name: '检测有人开', priority: 'high', enabled: true, executeDate: '2025.09.01-2028.10.31', selected: false },
  { id: 2, no: 2, name: '漏电自动断电', priority: 'high', enabled: true, executeDate: '一直执行', selected: false },
  { id: 3, no: 3, name: '光照度亮灯', priority: 'high', enabled: true, executeDate: '一直执行', selected: false },
  { id: 4, no: 4, name: '关回路', priority: 'low', enabled: true, executeDate: '一直执行', selected: false },
  { id: 5, no: 5, name: '检测无人关', priority: 'low', enabled: true, executeDate: '一直执行', selected: false }
]);

const total = computed(() => rulesData.value.length);

const filteredRules = computed(() => {
  let data = [...rulesData.value];
  if (filterKeyword.value) {
    const keyword = filterKeyword.value.toLowerCase();
    data = data.filter(item => item.name.toLowerCase().includes(keyword));
  }
  if (filterStatus.value !== '') {
    const status = filterStatus.value === 'true';
    data = data.filter(item => item.enabled === status);
  }
  if (filterPriority.value) {
    data = data.filter(item => item.priority === filterPriority.value);
  }
  return data.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value);
});

const toggleSelect = (rule) => {
  rule.selected = !rule.selected;
};

const handleSearch = () => {
  currentPage.value = 1;
};

const handleReset = () => {
  filterKeyword.value = '';
  filterStatus.value = '';
  filterPriority.value = '';
  currentPage.value = 1;
  rulesData.value.forEach(rule => rule.selected = false);
};

const handleSelectionChange = (val) => {
  selectedRows.value = val;
};

const handleAdd = () => {
  router.push('/scene/linkage-manage');
};

const handleEdit = (row) => {
  router.push('/scene/linkage-manage');
};

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该规则吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = rulesData.value.findIndex(item => item.id === row.id);
    if (index !== -1) {
      rulesData.value.splice(index, 1);
    }
  }).catch(() => {});
};

const handleBatchDelete = () => {
  ElMessageBox.confirm('确定要批量删除选中的规则吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    selectedRows.value.forEach(row => {
      const index = rulesData.value.findIndex(item => item.id === row.id);
      if (index !== -1) {
        rulesData.value.splice(index, 1);
      }
    });
    selectedRows.value = [];
    rulesData.value.forEach(rule => rule.selected = false);
  }).catch(() => {});
};

const handleToggle = (rule) => {
  ElMessageBox.confirm(`确定要${rule.enabled ? '启用' : '禁用'}规则「${rule.name}」吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).catch(() => {
    rule.enabled = !rule.enabled;
  });
};
</script>

<style scoped>
.scene-linkage-container {
  min-height: calc(100vh - 120px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px 24px;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(124, 58, 237, 0.1));
  border-radius: 12px;
  border: 1px solid rgba(0, 212, 255, 0.2);
}

.header-left {
  display: flex;
  align-items: center;
}

.title-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.3), rgba(124, 58, 237, 0.3));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00d4ff;
  border: 1px solid rgba(0, 212, 255, 0.3);
}

.main-title {
  font-size: 22px;
  font-weight: 700;
  background: linear-gradient(135deg, #00d4ff, #7c3aed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.sub-title {
  font-size: 14px;
  color: #94a3b8;
  margin: 4px 0 0 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.view-tabs {
  :deep(.el-tabs__item) {
    font-size: 14px;
    color: #94a3b8;
    padding: 8px 16px;
    
    &:hover {
      color: #00d4ff;
    }
    
    &.is-active {
      color: #00d4ff;
      font-weight: 600;
    }
  }
  
  :deep(.el-tabs__active-bar) {
    background: linear-gradient(90deg, #00d4ff, #7c3aed);
  }
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 8px;
}

.batch-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.3);
  border-color: #2d3a4b;
  color: #94a3b8;
  
  &:hover:not(:disabled) {
    border-color: #ff4757;
    color: #ff4757;
    background: rgba(255, 71, 87, 0.1);
  }
  
  &:disabled {
    opacity: 0.5;
  }
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  align-items: center;
  padding: 16px 20px;
  background: #1b2838;
  border-radius: 12px;
  border: 1px solid #2d3a4b;
}

.search-box {
  flex: 1;
  max-width: 300px;
}

.filter-input {
  width: 100%;
  
  :deep(.el-input__wrapper) {
    background: rgba(0, 0, 0, 0.3);
    border-color: #2d3a4b;
    border-radius: 8px;
  }
  
  :deep(.el-input__prefix) {
    color: #64748b;
  }
}

.filter-select {
  width: 160px;
  
  :deep(.el-select__wrapper) {
    background: rgba(0, 0, 0, 0.3);
    border-color: #2d3a4b;
    border-radius: 8px;
  }
  
  :deep(.el-select__placeholder) {
    color: #64748b;
  }
}

.search-btn, .reset-btn {
  padding: 8px 24px;
}

.rule-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.rule-card {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  border: 1px solid #2d3a4b;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.5), transparent);
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  &:hover {
    border-color: rgba(0, 212, 255, 0.4);
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.15);
    transform: translateY(-2px);
    
    &::before {
      opacity: 1;
    }
  }
  
  &.selected {
    border-color: #00d4ff;
    background: rgba(0, 212, 255, 0.08);
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.2);
    
    &::before {
      opacity: 1;
      background: linear-gradient(90deg, #00d4ff, #7c3aed);
    }
  }
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 12px;
  border-bottom: 1px solid #2d3a4b;
  margin-bottom: 12px;
}

.priority-tag {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  
  &.high {
    background: rgba(255, 71, 87, 0.15);
    color: #ff4757;
    border: 1px solid rgba(255, 71, 87, 0.3);
  }
  
  &.low {
    background: rgba(0, 255, 136, 0.15);
    color: #00ff88;
    border: 1px solid rgba(0, 255, 136, 0.3);
  }
}

.checkbox-wrapper {
  :deep(.el-checkbox__inner) {
    background: rgba(0, 0, 0, 0.3);
    border-color: #2d3a4b;
    
    &:hover {
      border-color: #00d4ff;
    }
    
    &.is-checked {
      background: linear-gradient(135deg, #00d4ff, #7c3aed);
      border-color: #00d4ff;
    }
  }
}

.rule-name {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: #e8e8e8;
}

.card-controls {
  :deep(.el-switch) {
    --el-switch-on-bg-color: #00d4ff;
    --el-switch-off-bg-color: #64748b;
    
    &:hover {
      --el-switch-on-bg-color: #7c3aed;
    }
  }
}

.card-body {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.execute-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  .info-label {
    font-size: 12px;
    color: #64748b;
  }
  
  .info-value {
    font-size: 13px;
    color: #94a3b8;
  }
}

.card-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-btn {
  font-size: 12px;
  color: #94a3b8;
  
  &:hover {
    color: #00d4ff;
  }
  
  &.delete:hover {
    color: #ff4757;
  }
  
  :deep(.el-button__text) {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

.list-panel {
  background: #1b2838;
  border-radius: 12px;
  border: 1px solid #2d3a4b;
  overflow: hidden;
}

.data-table {
  :deep(.el-table__header-wrapper) {
    background: rgba(0, 0, 0, 0.3);
    
    th {
      background: rgba(0, 0, 0, 0.3) !important;
      color: #94a3b8 !important;
      font-weight: 600;
      border-bottom: 1px solid #2d3a4b !important;
    }
  }
  
  :deep(.el-table__body-wrapper) {
    tr {
      &:hover {
        td {
          background: rgba(0, 212, 255, 0.05) !important;
        }
      }
    }
  }
}

.row-number {
  color: #64748b;
  font-size: 12px;
}

.rule-name-cell {
  color: #e8e8e8;
  font-weight: 500;
}

.priority-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  
  &.high {
    background: rgba(255, 71, 87, 0.15);
    color: #ff4757;
    
    .priority-dot {
      background: #ff4757;
      box-shadow: 0 0 8px rgba(255, 71, 87, 0.5);
    }
  }
  
  &.low {
    background: rgba(0, 255, 136, 0.15);
    color: #00ff88;
    
    .priority-dot {
      background: #00ff88;
      box-shadow: 0 0 8px rgba(0, 255, 136, 0.5);
    }
  }
  
  .priority-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }
}

.date-cell {
  color: #94a3b8;
  font-size: 13px;
}

.table-action-btn {
  font-size: 12px;
  color: #94a3b8;
  
  &:hover {
    color: #00d4ff;
  }
  
  &.delete:hover {
    color: #ff4757;
  }
  
  :deep(.el-button__text) {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

.pagination-bar {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.pagination {
  :deep(.el-pagination__total) {
    color: #94a3b8;
  }
  
  :deep(.el-pagination__sizes) {
    :deep(.el-select__wrapper) {
      background: rgba(0, 0, 0, 0.3);
      border-color: #2d3a4b;
    }
  }
  
  :deep(.el-pager li) {
    color: #94a3b8;
    
    &:hover {
      color: #00d4ff;
    }
    
    &.is-active {
      background: linear-gradient(135deg, #00d4ff, #7c3aed);
      color: #fff;
    }
  }
  
  :deep(.btn-prev), :deep(.btn-next) {
    color: #94a3b8;
    
    &:hover {
      color: #00d4ff;
    }
  }
}
</style>
