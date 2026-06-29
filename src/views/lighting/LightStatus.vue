<template>
  <div class="page-container">
    <div class="page-header">
      <div class="title">路灯实时状态</div>
      <div class="header-actions">
        <el-button type="primary" @click="refreshData">
          <component :is="icons.Refresh" />
          刷新数据
        </el-button>
      </div>
    </div>
    <div class="stats-card">
      <div class="stat-item">
        <span class="stat-value online">{{ onlineCount }}</span>
        <span class="stat-label">在线</span>
      </div>
      <div class="stat-item">
        <span class="stat-value offline">{{ offlineCount }}</span>
        <span class="stat-label">离线</span>
      </div>
      <div class="stat-item">
        <span class="stat-value fault">{{ faultCount }}</span>
        <span class="stat-label">故障</span>
      </div>
      <div class="stat-item">
        <span class="stat-value total">{{ totalCount }}</span>
        <span class="stat-label">总数</span>
      </div>
    </div>
    <div class="filter-bar">
      <el-select v-model="statusFilter" placeholder="状态筛选" class="filter-select">
        <el-option label="全部" value="" />
        <el-option label="开启" value="on" />
        <el-option label="关闭" value="off" />
        <el-option label="故障" value="fault" />
      </el-select>
      <el-input v-model="searchKeyword" placeholder="搜索路灯名称或位置" class="filter-input" />
    </div>
    <el-table :data="filteredData" border class="data-table">
      <el-table-column prop="id" label="设备编号" width="100" />
      <el-table-column prop="name" label="路灯名称" />
      <el-table-column prop="location" label="安装位置" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="getStatusTagType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="brightness" label="亮度(%)" width="100">
        <template #default="scope">
          <el-progress :percentage="scope.row.brightness" :show-text="false" width="80" />
          <span class="progress-text">{{ scope.row.brightness }}%</span>
        </template>
      </el-table-column>
      <el-table-column prop="power" label="功率(W)" width="100" />
      <el-table-column prop="lastUpdate" label="更新时间" width="180" />
      <el-table-column label="操作" width="120">
        <template #default="scope">
          <el-button size="small" @click="viewDetail(scope.row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog title="路灯详情" :visible.sync="detailDialogVisible" width="500px">
      <div v-if="selectedLight" class="detail-content">
        <el-form label-width="100px">
          <el-form-item label="设备编号">{{ selectedLight.id }}</el-form-item>
          <el-form-item label="路灯名称">{{ selectedLight.name }}</el-form-item>
          <el-form-item label="安装位置">{{ selectedLight.location }}</el-form-item>
          <el-form-item label="当前状态">
            <el-tag :type="getStatusTagType(selectedLight.status)">
              {{ getStatusText(selectedLight.status) }}
            </el-tag>
          </el-form-item>
          <el-form-item label="亮度">
            <el-progress :percentage="selectedLight.brightness" :show-text="true" />
          </el-form-item>
          <el-form-item label="功率">{{ selectedLight.power }}W</el-form-item>
          <el-form-item label="最后更新">{{ selectedLight.lastUpdate }}</el-form-item>
        </el-form>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { lightStatusData } from '@/data/mockData'

const icons = { Refresh }
const statusFilter = ref('')
const searchKeyword = ref('')
const detailDialogVisible = ref(false)
const selectedLight = ref(null)

const tableData = ref([...lightStatusData])

const totalCount = computed(() => tableData.value.length)
const onlineCount = computed(() => tableData.value.filter(item => item.status === 'on').length)
const offlineCount = computed(() => tableData.value.filter(item => item.status === 'off').length)
const faultCount = computed(() => tableData.value.filter(item => item.status === 'fault').length)

const filteredData = computed(() => {
  return tableData.value.filter(item => {
    const statusMatch = !statusFilter.value || item.status === statusFilter.value
    const keywordMatch = !searchKeyword.value || 
      item.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      item.location.toLowerCase().includes(searchKeyword.value.toLowerCase())
    return statusMatch && keywordMatch
  })
})

const getStatusTagType = (status) => {
  switch (status) {
    case 'on': return 'success'
    case 'off': return 'info'
    case 'fault': return 'danger'
    default: return 'info'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'on': return '开启'
    case 'off': return '关闭'
    case 'fault': return '故障'
    default: return status
  }
}

const refreshData = () => {
  tableData.value = [...lightStatusData]
}

const viewDetail = (row) => {
  selectedLight.value = row
  detailDialogVisible.value = true
}
</script>

<style scoped>
.stats-card {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.stat-item {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  color: #fff;
}

.stat-value {
  display: block;
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

.filter-bar {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  justify-content: flex-end;
}

.filter-select {
  width: 150px;
}

.filter-input {
  width: 250px;
}

.data-table {
  width: 100%;
}

.progress-text {
  margin-left: 10px;
  font-size: 12px;
  color: #666;
}

.detail-content {
  padding: 10px 0;
}
</style>
