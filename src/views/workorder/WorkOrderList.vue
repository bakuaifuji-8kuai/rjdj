<template>
  <div class="page-container">
    <div class="main-content">
      <div class="right-content">
        <div class="page-header">
          <div class="header-left">
            <div class="tab-item" :class="{ active: activeTab === 'pending' }" @click="activeTab = 'pending'">
              待处理的 ({{ pendingCount }})
            </div>
            <div class="tab-item" :class="{ active: activeTab === 'my' }" @click="activeTab = 'my'">
              我发起的 ({{ myCount }})
            </div>
            <div class="tab-item" :class="{ active: activeTab === 'processed' }" @click="activeTab = 'processed'">
              已处理的 ({{ processedCount }})
            </div>
            <div class="tab-item" :class="{ active: activeTab === 'cc' }" @click="activeTab = 'cc'">
              抄送我的 ({{ ccCount }})
            </div>
            <div class="tab-item" :class="{ active: activeTab === 'all' }" @click="activeTab = 'all'">
              全部工单 ({{ allCount }})
            </div>
          </div>
          <div class="header-right">
            <el-button type="primary" @click="handleAdd">创建工单</el-button>
            <el-button :disabled="selectedRows.length === 0" @click="handleBatchDelete">删除</el-button>
          </div>
        </div>

        <div class="filter-bar">
          <el-input v-model="filterKeyword" placeholder="请输入工单名称查询" class="filter-input" />
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>

        <div class="table-wrapper">
          <el-table :data="filteredList" border class="data-table" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="50" />
            <el-table-column prop="no" label="No" width="60" align="center" />
            <el-table-column prop="name" label="工单名称" min-width="200" />
            <el-table-column prop="type" label="工单类型" width="120" />
            <el-table-column prop="creator" label="发起人" width="100" />
            <el-table-column prop="isOverdue" label="是否超时" width="100" align="center">
              <template #default="{ row }">
                <el-tag v-if="row.isOverdue" type="danger" size="small">是</el-tag>
                <el-tag v-else type="success" size="small">否</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="工单状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="工单发起时间" width="170" />
            <el-table-column label="操作" width="120" align="center">
              <template #default="{ row }">
                <el-button type="text" size="small" @click="handleDetail(row)">详情</el-button>
                <el-button type="text" size="small" @click="handleDelete(row)">删除</el-button>
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
          />
        </div>
      </div>
    </div>

    <el-dialog title="工单详情" v-model="showDetailDialog" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="工单编号">{{ detailForm.no }}</el-descriptions-item>
        <el-descriptions-item label="工单名称">{{ detailForm.name }}</el-descriptions-item>
        <el-descriptions-item label="工单类型">{{ detailForm.type }}</el-descriptions-item>
        <el-descriptions-item label="发起人">{{ detailForm.creator }}</el-descriptions-item>
        <el-descriptions-item label="是否超时">
          <el-tag :type="detailForm.isOverdue ? 'danger' : 'success'" size="small">{{ detailForm.isOverdue ? '是' : '否' }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="工单状态">
          <el-tag :type="getStatusType(detailForm.status)" size="small">{{ detailForm.status }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="工单发起时间" :span="2">{{ detailForm.createTime }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="showDetailDialog = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog title="创建工单" v-model="showAddDialog" width="600px">
      <div v-if="!selectedType" class="type-select">
        <el-form-item label="工单类型" required>
          <el-select v-model="selectedType" placeholder="请选择工单类型" style="width: 100%">
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
          <el-form-item label="工单类型">
            <span>{{ selectedType }}</span>
          </el-form-item>
          <el-form-item label="工单名称" required>
            <el-input v-model="addForm.name" placeholder="请输入工单名称" />
          </el-form-item>
          <el-form-item label="数字输入框">
            <el-input-number v-model="addForm.number" :min="0" />
          </el-form-item>
          <el-form-item label="日期范围">
            <el-date-picker
              v-model="addForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            />
          </el-form-item>
          <el-form-item label="时间范围">
            <el-time-picker
              v-model="addForm.timeRange"
              is-range
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
            />
          </el-form-item>
          <el-form-item label="图片上传">
            <el-upload
              class="image-uploader"
              action="#"
              :show-file-list="false"
              :before-upload="beforeUpload"
            >
              <div class="upload-area">
                <el-icon class="upload-icon"><Plus /></el-icon>
              </div>
            </el-upload>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="handleAddCancel">取消</el-button>
        <el-button type="primary" @click="handleAddSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

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
  { id: 2, no: 2, name: '先导路5月份巡检', type: '巡检工单', creator: '张工', isOverdue: false, status: '处理中', createTime: '2026-05-20 10:00:00' }
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
.page-container {
  display: flex;
  height: calc(100vh - 60px);
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.right-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 15px;
  overflow: hidden;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e8e8e8;
}

.header-left {
  display: flex;
  gap: 0;
}

.tab-item {
  padding: 10px 20px;
  cursor: pointer;
  border: 1px solid #e8e8e8;
  border-right: none;
  background: #f5f7fa;
  transition: all 0.3s;
}

.tab-item:first-child {
  border-radius: 4px 0 0 4px;
}

.tab-item:last-child {
  border-right: 1px solid #e8e8e8;
  border-radius: 0 4px 4px 0;
}

.tab-item.active {
  background: #409eff;
  color: #ffffff;
  border-color: #409eff;
}

.header-right {
  display: flex;
  gap: 10px;
}

.filter-bar {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  align-items: center;
}

.filter-input {
  width: 250px;
}

.table-wrapper {
  flex: 1;
  overflow: auto;
  background: #ffffff;
  border: 1px solid #e8e8e8;
}

.data-table {
  width: 100%;
}

.pagination-bar {
  display: flex;
  justify-content: center;
  padding: 15px 0;
}

.type-select {
  padding: 20px 0;
}

.form-content {
  padding: 10px 0;
}

.image-uploader {
  display: flex;
}

.upload-area {
  width: 100px;
  height: 100px;
  border: 1px dashed var(--el-border-color);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--el-transition-duration-fast);
}

.upload-area:hover {
  border-color: var(--el-color-primary);
}

.upload-icon {
  font-size: 24px;
  color: var(--el-text-color-secondary);
}
</style>
