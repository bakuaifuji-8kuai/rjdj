<template>
  <div class="workorder-container">
    <div class="page-header">
      <div class="header-left">
        <div class="title-wrapper">
          <div class="title-icon">
            <el-icon :size="24"><ClipboardList /></el-icon>
          </div>
          <div>
            <h1 class="main-title">工单管理</h1>
            <p class="sub-title">管理照明系统工单流程</p>
          </div>
        </div>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleAdd" class="add-btn">
          <el-icon :size="16"><Plus /></el-icon>
          创建工单
        </el-button>
        <el-button :disabled="selectedRows.length === 0" @click="handleBatchDelete" class="batch-btn">
          <el-icon :size="16"><Delete /></el-icon>
          删除
        </el-button>
      </div>
    </div>

    <div class="tabs-container">
      <div class="tab-items">
        <div 
          v-for="tab in tabs" 
          :key="tab.key"
          class="tab-item"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          <span class="tab-label">{{ tab.label }}</span>
          <span class="tab-count" :class="getCountClass(tab.key)">{{ tab.count }}</span>
        </div>
      </div>
    </div>

    <div class="filter-bar">
      <div class="search-box">
        <el-input 
          v-model="filterKeyword" 
          placeholder="请输入工单名称查询" 
          class="filter-input"
          prefix-icon="Search"
        />
      </div>
      <el-button type="primary" @click="handleSearch" class="search-btn">搜索</el-button>
      <el-button @click="handleReset" class="reset-btn">重置</el-button>
    </div>

    <div class="table-wrapper">
      <el-table :data="filteredList" border class="data-table" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" align="center"></el-table-column>
        <el-table-column prop="no" label="#" width="60" align="center">
          <template #default="{ $index }">
            <span class="row-number">{{ $index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="工单名称" min-width="200">
          <template #default="{ row }">
            <span class="name-cell">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="工单类型" width="120">
          <template #default="{ row }">
            <span class="type-cell">{{ row.type }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="creator" label="发起人" width="100">
          <template #default="{ row }">
            <span class="creator-cell">{{ row.creator }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="isOverdue" label="是否超时" width="100" align="center">
          <template #default="{ row }">
            <div class="overdue-badge" :class="row.isOverdue ? 'yes' : 'no'">
              <span class="badge-dot"></span>
              {{ row.isOverdue ? '是' : '否' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="工单状态" width="100" align="center">
          <template #default="{ row }">
            <div class="status-badge" :class="row.status">
              <span class="badge-dot"></span>
              {{ row.status }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="工单发起时间" width="170">
          <template #default="{ row }">
            <span class="time-cell">{{ row.createTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template #default="{ row }">
            <el-button type="text" size="small" @click="handleDetail(row)" class="table-action-btn">
              <el-icon :size="14"><InfoFilled /></el-icon>
              详情
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
        layout="prev, pager, next, total"
        class="pagination"
      />
    </div>

    <el-dialog title="工单详情" v-model="showDetailDialog" width="600px" class="detail-dialog">
      <div class="detail-content">
        <div class="detail-header" :class="getStatusType(detailForm.status)">
          <div class="detail-status">
            <span class="status-dot"></span>
            {{ detailForm.status }}
          </div>
        </div>
        <el-descriptions :column="2" border class="detail-descriptions">
          <el-descriptions-item label="工单编号" label-class-name="desc-label">
            <span class="desc-value">{{ detailForm.no }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="工单名称" label-class-name="desc-label">
            <span class="desc-value">{{ detailForm.name }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="工单类型" label-class-name="desc-label">
            <span class="desc-value">{{ detailForm.type }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="发起人" label-class-name="desc-label">
            <span class="desc-value">{{ detailForm.creator }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="是否超时" label-class-name="desc-label">
            <div class="overdue-badge" :class="detailForm.isOverdue ? 'yes' : 'no'">
              <span class="badge-dot"></span>
              {{ detailForm.isOverdue ? '是' : '否' }}
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="工单状态" label-class-name="desc-label">
            <div class="status-badge" :class="detailForm.status">
              <span class="badge-dot"></span>
              {{ detailForm.status }}
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="工单发起时间" :span="2" label-class-name="desc-label">
            <span class="desc-value">{{ detailForm.createTime }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="showDetailDialog = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog title="创建工单" v-model="showAddDialog" width="600px" class="add-dialog">
      <div v-if="!selectedType" class="type-select">
        <el-form-item label="工单类型" required class="form-item">
          <el-select v-model="selectedType" placeholder="请选择工单类型" style="width: 100%" class="type-select-input">
            <el-option label="爱克园区巡检" value="爱克园区巡检" />
            <el-option label="11月6号灯具故障模板" value="11月6号灯具故障模板" />
            <el-option label="灯具故障模板" value="灯具故障模板" />
            <el-option label="单灯故障自动派单" value="单灯故障自动派单" />
            <el-option label="巡检模板" value="巡检模板" />
          </el-select>
        </el-form-item>
      </div>
      <div v-else class="form-content">
        <el-form :model="addForm" label-width="100px">
          <el-form-item label="工单类型" class="form-item">
            <span class="type-display">{{ selectedType }}</span>
          </el-form-item>
          <el-form-item label="工单名称" required class="form-item">
            <el-input v-model="addForm.name" placeholder="请输入工单名称" class="form-input" />
          </el-form-item>
          <el-form-item label="数字输入框" class="form-item">
            <el-input-number v-model="addForm.number" :min="0" class="form-input" />
          </el-form-item>
          <el-form-item label="日期范围" class="form-item">
            <el-date-picker
              v-model="addForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              class="form-input"
            />
          </el-form-item>
          <el-form-item label="时间范围" class="form-item">
            <el-time-picker
              v-model="addForm.timeRange"
              is-range
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              class="form-input"
            />
          </el-form-item>
          <el-form-item label="图片上传" class="form-item">
            <el-upload
              class="image-uploader"
              action="#"
              :show-file-list="false"
              :before-upload="beforeUpload"
            >
              <div class="upload-area">
                <el-icon class="upload-icon"><Plus /></el-icon>
                <span class="upload-text">点击上传</span>
              </div>
            </el-upload>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="handleAddCancel" class="cancel-btn">取消</el-button>
        <el-button type="primary" @click="handleAddSubmit" class="submit-btn">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ClipboardList, Plus, Delete, Search, InfoFilled
} from '@element-plus/icons-vue'

const activeTab = ref('all')
const filterKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const selectedRows = ref([])
const showDetailDialog = ref(false)
const showAddDialog = ref(false)
const selectedType = ref('')

const workorderList = ref([
  { id: 1, no: 1, name: '先导路LED灯005故障维修', type: '维修工单', creator: '管理员', isOverdue: false, status: '待处理', createTime: '2026-05-20 14:30:00' },
  { id: 2, no: 2, name: '先导路5月份巡检', type: '巡检工单', creator: '张工', isOverdue: false, status: '处理中', createTime: '2026-05-20 10:00:00' },
  { id: 3, no: 3, name: '人民路路灯改造项目', type: '改造工单', creator: '管理员', isOverdue: true, status: '待处理', createTime: '2026-05-18 09:00:00' },
  { id: 4, no: 4, name: '体育馆照明系统检修', type: '检修工单', creator: '李工', isOverdue: false, status: '已完成', createTime: '2026-05-15 14:00:00' },
  { id: 5, no: 5, name: '工业园区夜间照明调整', type: '调整工单', creator: '管理员', isOverdue: false, status: '已关闭', createTime: '2026-05-10 10:00:00' }
])

const detailForm = ref({
  no: '',
  name: '',
  type: '',
  creator: '',
  isOverdue: false,
  status: '',
  createTime: ''
})

const addForm = ref({
  name: '',
  number: 0,
  dateRange: [],
  timeRange: []
})

const pendingCount = computed(() => workorderList.value.filter(w => w.status === '待处理').length)
const myCount = computed(() => workorderList.value.filter(w => w.creator === '管理员').length)
const processedCount = computed(() => workorderList.value.filter(w => w.status === '已完成' || w.status === '已关闭').length)
const ccCount = computed(() => 0)
const allCount = computed(() => workorderList.value.length)

const tabs = computed(() => [
  { key: 'pending', label: '待处理', count: pendingCount.value },
  { key: 'my', label: '我发起的', count: myCount.value },
  { key: 'processed', label: '已处理', count: processedCount.value },
  { key: 'cc', label: '抄送我的', count: ccCount.value },
  { key: 'all', label: '全部工单', count: allCount.value }
])

const filteredList = computed(() => {
  let data = [...workorderList.value]
  
  if (activeTab.value === 'pending') {
    data = data.filter(w => w.status === '待处理')
  } else if (activeTab.value === 'my') {
    data = data.filter(w => w.creator === '管理员')
  } else if (activeTab.value === 'processed') {
    data = data.filter(w => w.status === '已完成' || w.status === '已关闭')
  } else if (activeTab.value === 'cc') {
    data = []
  }
  
  if (filterKeyword.value) {
    data = data.filter(w => w.name.toLowerCase().includes(filterKeyword.value.toLowerCase()))
  }
  
  return data
})

const total = computed(() => filteredList.value.length)

const getStatusType = (status) => {
  const types = { '待处理': 'danger', '处理中': 'warning', '已完成': 'success', '已关闭': 'info' }
  return types[status] || ''
}

const getCountClass = (key) => {
  if (key === 'pending' && pendingCount.value > 0) return 'danger'
  if (key === 'my' && myCount.value > 0) return 'info'
  return ''
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleReset = () => {
  filterKeyword.value = ''
  currentPage.value = 1
}

const handleSelectionChange = (val) => {
  selectedRows.value = val
}

const handleAdd = () => {
  showAddDialog.value = true
  selectedType.value = ''
  addForm.value = {
    name: '',
    number: 0,
    dateRange: [],
    timeRange: []
  }
}

const handleAddCancel = () => {
  showAddDialog.value = false
  selectedType.value = ''
  addForm.value = {
    name: '',
    number: 0,
    dateRange: [],
    timeRange: []
  }
}

const handleAddSubmit = () => {
  if (!addForm.value.name) {
    ElMessage.warning('请输入工单名称')
    return
  }
  const newId = Math.max(...workorderList.value.map(w => w.id)) + 1
  const newNo = Math.max(...workorderList.value.map(w => w.no)) + 1
  workorderList.value.push({
    id: newId,
    no: newNo,
    name: addForm.value.name,
    type: selectedType.value,
    creator: '管理员',
    isOverdue: false,
    status: '待处理',
    createTime: new Date().toLocaleString('zh-CN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    }).replace(/\//g, '-')
  })
  ElMessage.success('创建工单成功')
  showAddDialog.value = false
  selectedType.value = ''
  addForm.value = {
    name: '',
    number: 0,
    dateRange: [],
    timeRange: []
  }
}

const beforeUpload = (file) => {
  ElMessage.info('图片上传功能演示')
  return false
}

const handleDetail = (row) => {
  detailForm.value = { ...row }
  showDetailDialog.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该工单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = workorderList.value.findIndex(w => w.id === row.id)
    if (index > -1) {
      workorderList.value.splice(index, 1)
    }
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleBatchDelete = () => {
  ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 个工单吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const ids = selectedRows.value.map(item => item.id)
    workorderList.value = workorderList.value.filter(w => !ids.includes(w.id))
    selectedRows.value = []
    ElMessage.success('删除成功')
  }).catch(() => {})
}
</script>

<style scoped>
.workorder-container {
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
  gap: 12px;
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

.tabs-container {
  background: #1b2838;
  border-radius: 12px;
  border: 1px solid #2d3a4b;
  padding: 8px;
  margin-bottom: 20px;
}

.tab-items {
  display: flex;
  gap: 8px;
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(0, 0, 0, 0.2);
  
  &:hover {
    background: rgba(0, 212, 255, 0.1);
  }
  
  &.active {
    background: linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(124, 58, 237, 0.1));
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.15);
    
    .tab-label {
      color: #00d4ff;
    }
    
    .tab-count {
      background: rgba(0, 212, 255, 0.3);
      border-color: #00d4ff;
      color: #00d4ff;
    }
  }
}

.tab-label {
  font-size: 14px;
  color: #94a3b8;
}

.tab-count {
  font-size: 12px;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #2d3a4b;
  color: #64748b;
  
  &.danger {
    background: rgba(255, 71, 87, 0.15);
    border-color: #ff4757;
    color: #ff4757;
  }
  
  &.info {
    background: rgba(0, 212, 255, 0.15);
    border-color: #00d4ff;
    color: #00d4ff;
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

.search-btn, .reset-btn {
  padding: 8px 24px;
}

.table-wrapper {
  background: #1b2838;
  border-radius: 12px;
  border: 1px solid #2d3a4b;
  overflow: hidden;
  margin-bottom: 20px;
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

.name-cell {
  color: #e8e8e8;
  font-weight: 500;
}

.type-cell {
  color: #94a3b8;
  font-size: 13px;
}

.creator-cell {
  color: #94a3b8;
  font-size: 13px;
}

.overdue-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  
  &.yes {
    background: rgba(255, 71, 87, 0.15);
    color: #ff4757;
    
    .badge-dot {
      background: #ff4757;
      box-shadow: 0 0 8px rgba(255, 71, 87, 0.5);
    }
  }
  
  &.no {
    background: rgba(0, 255, 136, 0.15);
    color: #00ff88;
    
    .badge-dot {
      background: #00ff88;
      box-shadow: 0 0 8px rgba(0, 255, 136, 0.5);
    }
  }
  
  .badge-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  
  &.待处理 {
    background: rgba(255, 71, 87, 0.15);
    color: #ff4757;
    
    .badge-dot {
      background: #ff4757;
      box-shadow: 0 0 8px rgba(255, 71, 87, 0.5);
    }
  }
  
  &.处理中 {
    background: rgba(255, 170, 0, 0.15);
    color: #ffaa00;
    
    .badge-dot {
      background: #ffaa00;
      box-shadow: 0 0 8px rgba(255, 170, 0, 0.5);
    }
  }
  
  &.已完成 {
    background: rgba(0, 255, 136, 0.15);
    color: #00ff88;
    
    .badge-dot {
      background: #00ff88;
      box-shadow: 0 0 8px rgba(0, 255, 136, 0.5);
    }
  }
  
  &.已关闭 {
    background: rgba(0, 212, 255, 0.15);
    color: #00d4ff;
    
    .badge-dot {
      background: #00d4ff;
      box-shadow: 0 0 8px rgba(0, 212, 255, 0.5);
    }
  }
  
  .badge-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }
}

.time-cell {
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

.detail-dialog {
  :deep(.el-dialog__header) {
    background: rgba(0, 0, 0, 0.3);
    border-bottom: 1px solid #2d3a4b;
    padding: 20px 24px;
    
    .el-dialog__title {
      color: #e8e8e8;
      font-size: 16px;
      font-weight: 600;
    }
  }
  
  :deep(.el-dialog__body) {
    background: #1b2838;
    padding: 0;
  }
  
  :deep(.el-dialog__footer) {
    background: rgba(0, 0, 0, 0.2);
    border-top: 1px solid #2d3a4b;
    padding: 16px 24px;
  }
}

.detail-content {
  padding: 24px;
}

.detail-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
  padding: 12px 16px;
  border-radius: 8px;
  
  &.danger {
    background: rgba(255, 71, 87, 0.1);
    .detail-status { color: #ff4757; }
    .status-dot { background: #ff4757; box-shadow: 0 0 10px rgba(255, 71, 87, 0.5); }
  }
  
  &.warning {
    background: rgba(255, 170, 0, 0.1);
    .detail-status { color: #ffaa00; }
    .status-dot { background: #ffaa00; box-shadow: 0 0 10px rgba(255, 170, 0, 0.5); }
  }
  
  &.success {
    background: rgba(0, 255, 136, 0.1);
    .detail-status { color: #00ff88; }
    .status-dot { background: #00ff88; box-shadow: 0 0 10px rgba(0, 255, 136, 0.5); }
  }
  
  &.info {
    background: rgba(0, 212, 255, 0.1);
    .detail-status { color: #00d4ff; }
    .status-dot { background: #00d4ff; box-shadow: 0 0 10px rgba(0, 212, 255, 0.5); }
  }
}

.detail-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  
  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
}

.detail-descriptions {
  :deep(.el-descriptions__label) {
    color: #64748b;
    font-weight: 500;
    padding: 12px 16px;
    background: rgba(0, 0, 0, 0.2);
  }
  
  :deep(.el-descriptions__content) {
    color: #e8e8e8;
    padding: 12px 16px;
  }
}

.desc-label {
  color: #64748b;
}

.desc-value {
  color: #e8e8e8;
}

.add-dialog {
  :deep(.el-dialog__header) {
    background: rgba(0, 0, 0, 0.3);
    border-bottom: 1px solid #2d3a4b;
    padding: 20px 24px;
    
    .el-dialog__title {
      color: #e8e8e8;
      font-size: 16px;
      font-weight: 600;
    }
  }
  
  :deep(.el-dialog__body) {
    background: #1b2838;
    padding: 24px;
  }
  
  :deep(.el-dialog__footer) {
    background: rgba(0, 0, 0, 0.2);
    border-top: 1px solid #2d3a4b;
    padding: 16px 24px;
  }
}

.type-select {
  padding: 20px 0;
}

.form-item {
  margin-bottom: 20px;
  
  :deep(.el-form-item__label) {
    color: #94a3b8;
  }
}

.type-select-input {
  :deep(.el-select__wrapper) {
    background: rgba(0, 0, 0, 0.3);
    border-color: #2d3a4b;
  }
  
  :deep(.el-select__placeholder) {
    color: #64748b;
  }
}

.type-display {
  color: #00d4ff;
  font-weight: 500;
}

.form-input {
  width: 100%;
  
  :deep(.el-input__wrapper),
  :deep(.el-select__wrapper) {
    background: rgba(0, 0, 0, 0.3);
    border-color: #2d3a4b;
    border-radius: 8px;
  }
  
  :deep(.el-input__placeholder) {
    color: #64748b;
  }
}

.image-uploader {
  display: flex;
}

.upload-area {
  width: 120px;
  height: 120px;
  border: 1px dashed #2d3a4b;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  background: rgba(0, 0, 0, 0.2);
  
  &:hover {
    border-color: #00d4ff;
    background: rgba(0, 212, 255, 0.1);
  }
}

.upload-icon {
  font-size: 28px;
  color: #64748b;
  margin-bottom: 8px;
  
  .upload-area:hover & {
    color: #00d4ff;
  }
}

.upload-text {
  font-size: 13px;
  color: #64748b;
  
  .upload-area:hover & {
    color: #00d4ff;
  }
}

.cancel-btn {
  background: rgba(0, 0, 0, 0.3) !important;
  border-color: #2d3a4b !important;
  color: #94a3b8 !important;
}

.submit-btn {
  background: linear-gradient(135deg, #00d4ff, #7c3aed) !important;
  border: none !important;
}
</style>
