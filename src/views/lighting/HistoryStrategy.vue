<template>
  <div class="page-container">
    <div class="page-header">
      <div class="title">历史下发策略</div>
      <div class="header-actions">
        <el-button @click="refreshData">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <div class="filter-bar">
      <el-input
        v-model="filters.name"
        placeholder="请输入策略名称"
        class="filter-input"
        clearable
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select v-model="filters.status" placeholder="请选择执行状态" class="filter-select" clearable>
        <el-option label="成功" value="success" />
        <el-option label="部分成功" value="partial" />
        <el-option label="失败" value="fail" />
      </el-select>
      <el-date-picker
        v-model="filters.dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始时间"
        end-placeholder="结束时间"
        class="filter-date"
        value-format="YYYY-MM-DD"
      />
      <el-button type="primary" @click="searchRecords">查询</el-button>
      <el-button @click="resetFilters">重置</el-button>
    </div>

    <el-table :data="filteredRecords" border class="record-table" style="width: 100%;">
      <el-table-column prop="id" label="序号" width="80" align="center" />
      <el-table-column prop="strategyName" label="策略名称" min-width="200">
        <template #default="{ row }">
          <el-link type="primary" @click="viewDetail(row)">{{ row.strategyName }}</el-link>
        </template>
      </el-table-column>
      <el-table-column prop="sendTime" label="下发时间" width="180" />
      <el-table-column prop="operator" label="下发人员" width="120" />
      <el-table-column prop="deviceCount" label="关联设备数" width="120" align="center" />
      <el-table-column prop="successCount" label="成功数" width="100" align="center">
        <template #default="{ row }">
          <span style="color: #52c41a; font-weight: 500;">{{ row.successCount }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="failCount" label="失败数" width="100" align="center">
        <template #default="{ row }">
          <span style="color: #f5222d; font-weight: 500;">{{ row.failCount }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="执行状态" width="120" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row.status)" size="small">{{ getStatusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 30, 50]"
        layout="total, sizes, prev, pager, next, jumper"
      />
    </div>

    <el-dialog v-model="showDetailDialog" title="策略详情" width="800px">
      <div v-if="currentRecord" class="detail-content">
        <div class="detail-section">
          <div class="section-title">基本信息</div>
          <el-descriptions :column="2" :data="currentRecord" border>
            <el-descriptions-item label="策略名称">{{ currentRecord.strategyName }}</el-descriptions-item>
            <el-descriptions-item label="下发时间">{{ currentRecord.sendTime }}</el-descriptions-item>
            <el-descriptions-item label="下发人员">{{ currentRecord.operator }}</el-descriptions-item>
            <el-descriptions-item label="执行状态">
              <el-tag :type="getStatusTagType(currentRecord.status)" size="small">
                {{ getStatusText(currentRecord.status) }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </div>
        
        <div class="detail-section">
          <div class="section-title">执行结果</div>
          <el-table :data="currentRecord.results" border size="small">
            <el-table-column prop="deviceNo" label="设备编号" min-width="150" />
            <el-table-column prop="deviceName" label="设备名称" min-width="150" />
            <el-table-column prop="result" label="执行结果" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.result === 'success' ? 'success' : 'danger'" size="small">
                  {{ row.result === 'success' ? '成功' : '失败' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="message" label="备注" min-width="200" />
          </el-table>
        </div>
      </div>
      <template #footer>
        <el-button @click="showDetailDialog = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Refresh, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(12)
const showDetailDialog = ref(false)
const currentRecord = ref(null)

const filters = reactive({
  name: '',
  status: '',
  dateRange: []
})

const records = ref([
  { 
    id: 1, 
    strategyName: '夜间节能调光策略', 
    sendTime: '2024-06-15 22:00:00', 
    operator: 'admin', 
    deviceCount: 150,
    successCount: 148,
    failCount: 2,
    status: 'partial',
    results: [
      { deviceNo: 'L001', deviceName: '中山路01号灯', result: 'success', message: '' },
      { deviceNo: 'L002', deviceName: '中山路02号灯', result: 'success', message: '' },
      { deviceNo: 'L003', deviceName: '人民路01号灯', result: 'fail', message: '设备离线' },
      { deviceNo: 'L004', deviceName: '人民路02号灯', result: 'fail', message: '通信超时' }
    ]
  },
  { 
    id: 2, 
    strategyName: '周末全亮策略', 
    sendTime: '2024-06-15 06:00:00', 
    operator: 'admin', 
    deviceCount: 200,
    successCount: 200,
    failCount: 0,
    status: 'success',
    results: []
  },
  { 
    id: 3, 
    strategyName: '暴雨天气应急策略', 
    sendTime: '2024-06-14 18:30:00', 
    operator: 'admin', 
    deviceCount: 180,
    successCount: 175,
    failCount: 5,
    status: 'partial',
    results: []
  },
  { 
    id: 4, 
    strategyName: '定时关灯策略', 
    sendTime: '2024-06-14 05:30:00', 
    operator: 'system', 
    deviceCount: 200,
    successCount: 200,
    failCount: 0,
    status: 'success',
    results: []
  },
  { 
    id: 5, 
    strategyName: '节假日装饰灯策略', 
    sendTime: '2024-06-13 19:00:00', 
    operator: 'admin', 
    deviceCount: 50,
    successCount: 50,
    failCount: 0,
    status: 'success',
    results: []
  },
  { 
    id: 6, 
    strategyName: '故障设备排查策略', 
    sendTime: '2024-06-13 10:00:00', 
    operator: 'admin', 
    deviceCount: 10,
    successCount: 8,
    failCount: 2,
    status: 'partial',
    results: []
  },
  { 
    id: 7, 
    strategyName: '日常调光策略-1', 
    sendTime: '2024-06-12 22:00:00', 
    operator: 'system', 
    deviceCount: 200,
    successCount: 198,
    failCount: 2,
    status: 'partial',
    results: []
  },
  { 
    id: 8, 
    strategyName: '日常调光策略-2', 
    sendTime: '2024-06-12 06:00:00', 
    operator: 'system', 
    deviceCount: 200,
    successCount: 200,
    failCount: 0,
    status: 'success',
    results: []
  },
  { 
    id: 9, 
    strategyName: '检修模式策略', 
    sendTime: '2024-06-11 09:00:00', 
    operator: 'admin', 
    deviceCount: 30,
    successCount: 30,
    failCount: 0,
    status: 'success',
    results: []
  },
  { 
    id: 10, 
    strategyName: '恢复正常模式', 
    sendTime: '2024-06-11 18:00:00', 
    operator: 'admin', 
    deviceCount: 30,
    successCount: 30,
    failCount: 0,
    status: 'success',
    results: []
  },
  { 
    id: 11, 
    strategyName: '紧急调光策略', 
    sendTime: '2024-06-10 23:30:00', 
    operator: 'admin', 
    deviceCount: 100,
    successCount: 95,
    failCount: 5,
    status: 'partial',
    results: []
  },
  { 
    id: 12, 
    strategyName: '测试策略', 
    sendTime: '2024-06-10 14:00:00', 
    operator: 'admin', 
    deviceCount: 5,
    successCount: 3,
    failCount: 2,
    status: 'partial',
    results: []
  }
])

const filteredRecords = computed(() => {
  let result = records.value
  if (filters.name) {
    result = result.filter(r => r.strategyName.includes(filters.name))
  }
  if (filters.status) {
    result = result.filter(r => r.status === filters.status)
  }
  return result
})

const getStatusText = (status) => {
  const map = { success: '成功', partial: '部分成功', fail: '失败' }
  return map[status] || status
}

const getStatusTagType = (status) => {
  const map = { success: 'success', partial: 'warning', fail: 'danger' }
  return map[status] || ''
}

const searchRecords = () => {
  currentPage.value = 1
  ElMessage.success('查询成功')
}

const resetFilters = () => {
  Object.assign(filters, { name: '', status: '', dateRange: [] })
  currentPage.value = 1
}

const refreshData = () => {
  ElMessage.success('数据已刷新')
}

const viewDetail = (row) => {
  currentRecord.value = row
  showDetailDialog.value = true
}
</script>

<style scoped>
.page-container {
  padding: 20px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e8e8e8;
}

.page-header .title {
  font-size: 18px;
  font-weight: 600;
  color: #1f1f1f;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  padding: 15px;
  background: #fafafa;
  border-radius: 4px;
  flex-wrap: wrap;
}

.filter-input {
  width: 220px;
}

.filter-select {
  width: 160px;
}

.filter-date {
  width: 280px;
}

.record-table {
  margin-bottom: 20px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
}

.detail-content {
  max-height: 600px;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 20px;
}

.section-title {
  font-weight: 600;
  font-size: 14px;
  color: #333;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e8e8e8;
}
</style>