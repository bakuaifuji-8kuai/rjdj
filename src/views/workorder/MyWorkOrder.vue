<template>
  <div class="my-workorder">
    <div class="page-header">
      <h2>我的工单</h2>
    </div>

    <div class="stats-panel">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-value" style="color: #f56c6c;">{{ stats.pending }}</div>
              <div class="stat-label">待处理</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-value" style="color: #e6a23c;">{{ stats.processing }}</div>
              <div class="stat-label">处理中</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-value" style="color: #67c23a;">{{ stats.completed }}</div>
              <div class="stat-label">已完成</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-value" style="color: #409eff;">{{ stats.total }}</div>
              <div class="stat-label">总工单</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="filter-bar">
      <el-select v-model="filterType" placeholder="请选择工单类型" style="width: 180px;" clearable>
        <el-option label="维修工单" value="维修工单" />
        <el-option label="巡检工单" value="巡检工单" />
        <el-option label="安装工单" value="安装工单" />
      </el-select>
      <el-select v-model="filterStatus" placeholder="请选择工单状态" style="width: 180px;" clearable>
        <el-option label="待处理" value="待处理" />
        <el-option label="处理中" value="处理中" />
        <el-option label="已完成" value="已完成" />
      </el-select>
      <el-input v-model="searchText" placeholder="请输入工单编号或标题" style="width: 250px;" clearable />
      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <div class="table-wrapper">
      <el-table :data="myWorkorderData" border stripe>
        <el-table-column prop="id" label="No" width="60" />
        <el-table-column prop="code" label="工单编号" width="140" />
        <el-table-column prop="title" label="工单标题" min-width="200" />
        <el-table-column prop="type" label="工单类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)" size="small">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="100">
          <template #default="{ row }">
            <el-tag :type="getPriorityType(row.priority)" size="small">{{ row.priority }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column prop="deadline" label="截止时间" width="170" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="text" size="small" @click="handleDetail(row)">详情</el-button>
            <el-button v-if="row.status === '待处理'" type="text" size="small" @click="handleAccept(row)">接单</el-button>
            <el-button v-if="row.status === '处理中'" type="text" size="small" @click="handleComplete(row)">完成</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        layout="prev, pager, next, jumper, total"
      />
    </div>

    <el-dialog title="工单详情" v-model="showDetailDialog" width="700px">
      <el-tabs v-model="detailTab" type="card">
        <el-tab-pane label="基本信息" name="basic">
          <div class="detail-content">
            <div class="detail-row">
              <span class="detail-label">工单编号：</span>
              <span class="detail-value">{{ detailForm.code }}</span>
              <span class="detail-label">工单标题：</span>
              <span class="detail-value">{{ detailForm.title }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">工单类型：</span>
              <el-tag :type="getTypeTagType(detailForm.type)" size="small">{{ detailForm.type }}</el-tag>
              <span class="detail-label">优先级：</span>
              <el-tag :type="getPriorityType(detailForm.priority)" size="small">{{ detailForm.priority }}</el-tag>
            </div>
            <div class="detail-row">
              <span class="detail-label">状态：</span>
              <el-tag :type="getStatusType(detailForm.status)" size="small">{{ detailForm.status }}</el-tag>
              <span class="detail-label">创建人：</span>
              <span class="detail-value">{{ detailForm.creator }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">创建时间：</span>
              <span class="detail-value">{{ detailForm.createTime }}</span>
              <span class="detail-label">截止时间：</span>
              <span class="detail-value">{{ detailForm.deadline }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">问题描述：</span>
              <span class="detail-value">{{ detailForm.description }}</span>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="处理记录" name="process">
          <div class="process-form">
            <el-form :model="processForm" label-width="100px">
              <el-form-item label="处理内容">
                <el-input v-model="processForm.content" type="textarea" :rows="4" placeholder="请输入处理内容" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleAddProcess">添加记录</el-button>
              </el-form-item>
            </el-form>
          </div>
          <el-timeline>
            <el-timeline-item
              v-for="(item, index) in processList"
              :key="index"
              :timestamp="item.time"
              :type="item.type"
            >
              {{ item.content }}
              <br />
              <span style="color: #909399;">操作人：{{ item.user }}</span>
            </el-timeline-item>
          </el-timeline>
        </el-tab-pane>
      </el-tabs>
      <template #footer>
        <el-button type="primary" @click="showDetailDialog = false">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const filterType = ref('')
const filterStatus = ref('')
const searchText = ref('')
const currentPage = ref(1)
const pageSize = ref(15)
const showDetailDialog = ref(false)
const detailTab = ref('basic')

const stats = ref({
  pending: 2,
  processing: 1,
  completed: 5,
  total: 8
})

const processForm = ref({
  content: ''
})

const detailForm = ref({
  code: '',
  title: '',
  type: '',
  priority: '',
  status: '',
  creator: '',
  createTime: '',
  deadline: '',
  description: ''
})

const processList = ref([
  { time: '2026-05-20 14:30:00', content: '创建工单', user: '系统管理员', type: 'primary' },
  { time: '2026-05-20 15:00:00', content: '接单，开始处理', user: '当前用户', type: 'warning' }
])

const myWorkorderData = ref([
  { id: 1, code: 'WD20260520001', title: '先导路LED灯005故障维修', type: '维修工单', priority: '紧急', status: '待处理', createTime: '2026-05-20 14:30:00', deadline: '2026-05-21 14:30:00', description: 'LED灯无法点亮，需要检查修复' },
  { id: 2, code: 'WD20260520002', title: '先导路5月份巡检', type: '巡检工单', priority: '中', status: '处理中', createTime: '2026-05-20 10:00:00', deadline: '2026-05-31 18:00:00', description: '对先导路全线设备进行巡检' },
  { id: 3, code: 'WD20260519003', title: '力唯中天新增路灯安装', type: '安装工单', priority: '高', status: '已完成', createTime: '2026-05-19 09:00:00', deadline: '2026-05-20 18:00:00', description: '新增3盏路灯的安装调试' }
])

const total = computed(() => myWorkorderData.value.length)

const getTypeTagType = (type) => {
  const types = { '维修工单': 'danger', '巡检工单': 'info', '安装工单': 'success' }
  return types[type] || ''
}

const getPriorityType = (priority) => {
  const types = { '紧急': 'danger', '高': 'warning', '中': 'info', '低': 'success' }
  return types[priority] || ''
}

const getStatusType = (status) => {
  const types = { '待处理': 'danger', '处理中': 'warning', '已完成': 'success' }
  return types[status] || ''
}

const handleDetail = (row) => {
  detailForm.value = {
    code: row.code,
    title: row.title,
    type: row.type,
    priority: row.priority,
    status: row.status,
    creator: '系统管理员',
    createTime: row.createTime,
    deadline: row.deadline,
    description: row.description
  }
  showDetailDialog.value = true
}

const handleAccept = (row) => {
  ElMessageBox.confirm('确定要接该工单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    const index = myWorkorderData.value.findIndex(w => w.id === row.id)
    if (index > -1) {
      myWorkorderData.value[index].status = '处理中'
      stats.value.pending--
      stats.value.processing++
    }
    ElMessage.success('接单成功')
  }).catch(() => {})
}

const handleComplete = (row) => {
  ElMessageBox.confirm('确定要完成该工单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'success'
  }).then(() => {
    const index = myWorkorderData.value.findIndex(w => w.id === row.id)
    if (index > -1) {
      myWorkorderData.value[index].status = '已完成'
      stats.value.processing--
      stats.value.completed++
    }
    ElMessage.success('工单已完成')
  }).catch(() => {})
}

const handleAddProcess = () => {
  if (!processForm.value.content) {
    ElMessage.warning('请输入处理内容')
    return
  }
  processList.value.unshift({
    time: new Date().toLocaleString(),
    content: processForm.value.content,
    user: '当前用户',
    type: 'success'
  })
  processForm.value.content = ''
  ElMessage.success('添加成功')
}

const handleSearch = () => { currentPage.value = 1 }
const handleReset = () => { filterType.value = ''; filterStatus.value = ''; searchText.value = ''; currentPage.value = 1 }
</script>

<style scoped>
.my-workorder {
  background: #f5f5f5;
  min-height: 100%;
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.stats-panel {
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
}

.stat-content {
  padding: 10px 0;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.filter-bar {
  background: #ffffff;
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.table-wrapper {
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  background: #ffffff;
  padding: 20px;
  border-radius: 8px;
}

.detail-content {
  padding: 10px;
}

.detail-row {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 15px;
  align-items: center;
}

.detail-label {
  font-weight: 500;
  color: #666;
  min-width: 100px;
}

.detail-value {
  color: #333;
  margin-right: 30px;
  margin-bottom: 5px;
}

.process-form {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}
</style>
