<template>
  <div class="device-alarm">
    <div class="page-header">
      <h2>设备告警</h2>
      <div class="header-actions">
        <el-button type="primary" :disabled="selectedItems.length === 0" @click="handleBatchProcess">批量处理</el-button>
      </div>
    </div>

    <div class="filter-bar">
      <el-select v-model="filterLevel" placeholder="请选择告警级别" style="width: 180px;" clearable>
        <el-option label="紧急" value="紧急" />
        <el-option label="重要" value="重要" />
        <el-option label="一般" value="一般" />
      </el-select>
      <el-select v-model="filterStatus" placeholder="请选择处理状态" style="width: 180px;" clearable>
        <el-option label="未处理" value="未处理" />
        <el-option label="处理中" value="处理中" />
        <el-option label="已处理" value="已处理" />
      </el-select>
      <el-date-picker v-model="filterDate" type="date" placeholder="选择日期" style="width: 180px;" />
      <el-input v-model="searchText" placeholder="请输入设备编号或告警内容" style="width: 250px;" clearable />
      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <div class="table-wrapper">
      <el-table :data="alarmData" border stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="No" width="60" />
        <el-table-column prop="level" label="告警级别" width="100">
          <template #default="{ row }">
            <el-tag :type="getLevelType(row.level)" size="small">{{ row.level }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="deviceCode" label="设备编号" width="140" />
        <el-table-column prop="deviceName" label="设备名称" width="160" />
        <el-table-column prop="content" label="告警内容" min-width="200" />
        <el-table-column prop="alarmTime" label="告警时间" width="170" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button v-if="row.status !== '已处理'" type="text" size="small" @click="handleProcess(row)">处理</el-button>
            <el-button type="text" size="small" @click="handleDetail(row)">详情</el-button>
            <el-button v-if="row.status !== '已处理'" type="text" size="small" style="color: #f56c6c;" @click="handleIgnore(row)">忽略</el-button>
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

    <el-dialog title="告警处理" v-model="showProcessDialog" width="500px">
      <el-form :model="processForm" label-width="100px">
        <el-form-item label="告警设备">
          <el-input v-model="processForm.deviceName" disabled />
        </el-form-item>
        <el-form-item label="告警内容">
          <el-input v-model="processForm.content" type="textarea" :rows="3" disabled />
        </el-form-item>
        <el-form-item label="处理结果">
          <el-radio-group v-model="processForm.result">
            <el-radio label="已修复">已修复</el-radio>
            <el-radio label="误报">误报</el-radio>
            <el-radio label="其他">其他</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="处理说明">
          <el-input v-model="processForm.remark" type="textarea" :rows="4" placeholder="请输入处理说明" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showProcessDialog = false">取消</el-button>
        <el-button type="primary" @click="handleProcessSave">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog title="告警详情" v-model="showDetailDialog" width="600px">
      <div class="detail-content">
        <div class="detail-row">
          <span class="detail-label">告警级别：</span>
          <el-tag :type="getLevelType(detailForm.level)" size="small">{{ detailForm.level }}</el-tag>
        </div>
        <div class="detail-row">
          <span class="detail-label">设备编号：</span>
          <span class="detail-value">{{ detailForm.deviceCode }}</span>
          <span class="detail-label">设备名称：</span>
          <span class="detail-value">{{ detailForm.deviceName }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">告警内容：</span>
          <span class="detail-value">{{ detailForm.content }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">告警时间：</span>
          <span class="detail-value">{{ detailForm.alarmTime }}</span>
          <span class="detail-label">状态：</span>
          <el-tag :type="getStatusType(detailForm.status)" size="small">{{ detailForm.status }}</el-tag>
        </div>
        <div class="detail-row" v-if="detailForm.processTime">
          <span class="detail-label">处理时间：</span>
          <span class="detail-value">{{ detailForm.processTime }}</span>
          <span class="detail-label">处理人：</span>
          <span class="detail-value">{{ detailForm.processUser }}</span>
        </div>
        <div class="detail-row" v-if="detailForm.result">
          <span class="detail-label">处理结果：</span>
          <span class="detail-value">{{ detailForm.result }}</span>
        </div>
        <div class="detail-row" v-if="detailForm.remark">
          <span class="detail-label">处理说明：</span>
          <span class="detail-value">{{ detailForm.remark }}</span>
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="showDetailDialog = false">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const filterLevel = ref('')
const filterStatus = ref('')
const filterDate = ref(null)
const searchText = ref('')
const currentPage = ref(1)
const pageSize = ref(15)
const showProcessDialog = ref(false)
const showDetailDialog = ref(false)
const selectedItems = ref([])

const processForm = ref({
  id: null,
  deviceName: '',
  content: '',
  result: '已修复',
  remark: ''
})

const detailForm = ref({
  level: '',
  deviceCode: '',
  deviceName: '',
  content: '',
  alarmTime: '',
  status: '',
  processTime: '',
  processUser: '',
  result: '',
  remark: ''
})

const alarmData = ref([
  { id: 1, level: '紧急', deviceCode: 'PDG001', deviceName: '先导路1号配电柜', content: '配电柜温度过高，当前85°C', alarmTime: '2026-05-20 14:30:25', status: '未处理' },
  { id: 2, level: '重要', deviceCode: 'DK002', deviceName: '先导路副灯控', content: '设备离线', alarmTime: '2026-05-20 12:15:00', status: '处理中' },
  { id: 3, level: '一般', deviceCode: 'CGQ001', deviceName: '先导路光照传感器', content: '通信延迟较高', alarmTime: '2026-05-20 10:05:00', status: '已处理' },
  { id: 4, level: '紧急', deviceCode: 'LED005', deviceName: '先导路LED灯005', content: '电路故障，无法点亮', alarmTime: '2026-05-19 20:30:10', status: '未处理' }
])

const total = computed(() => alarmData.value.length)

const getLevelType = (level) => {
  const types = { '紧急': 'danger', '重要': 'warning', '一般': 'info' }
  return types[level] || 'info'
}

const getStatusType = (status) => {
  const types = { '未处理': 'danger', '处理中': 'warning', '已处理': 'success' }
  return types[status] || 'info'
}

const handleSelectionChange = (val) => {
  selectedItems.value = val
}

const handleProcess = (row) => {
  processForm.value = {
    id: row.id,
    deviceName: row.deviceName,
    content: row.content,
    result: '已修复',
    remark: ''
  }
  showProcessDialog.value = true
}

const handleProcessSave = () => {
  const index = alarmData.value.findIndex(a => a.id === processForm.value.id)
  if (index > -1) {
    alarmData.value[index].status = '已处理'
    alarmData.value[index].processTime = new Date().toLocaleString()
    alarmData.value[index].processUser = '当前用户'
    alarmData.value[index].result = processForm.value.result
    alarmData.value[index].remark = processForm.value.remark
  }
  ElMessage.success('处理成功')
  showProcessDialog.value = false
}

const handleIgnore = (row) => {
  ElMessageBox.confirm('确定要忽略该告警吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = alarmData.value.findIndex(a => a.id === row.id)
    if (index > -1) {
      alarmData.value[index].status = '已处理'
      alarmData.value[index].result = '忽略'
    }
    ElMessage.success('已忽略')
  }).catch(() => {})
}

const handleBatchProcess = () => {
  ElMessageBox.confirm(`确定要批量处理选中的 ${selectedItems.value.length} 条告警吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const ids = selectedItems.value.map(item => item.id)
    alarmData.value.forEach(item => {
      if (ids.includes(item.id)) {
        item.status = '已处理'
        item.processTime = new Date().toLocaleString()
        item.processUser = '当前用户'
      }
    })
    selectedItems.value = []
    ElMessage.success('批量处理成功')
  }).catch(() => {})
}

const handleDetail = (row) => {
  detailForm.value = {
    level: row.level,
    deviceCode: row.deviceCode,
    deviceName: row.deviceName,
    content: row.content,
    alarmTime: row.alarmTime,
    status: row.status,
    processTime: row.processTime || '',
    processUser: row.processUser || '',
    result: row.result || '',
    remark: row.remark || ''
  }
  showDetailDialog.value = true
}

const handleSearch = () => { currentPage.value = 1 }
const handleReset = () => { filterLevel.value = ''; filterStatus.value = ''; filterDate.value = null; searchText.value = ''; currentPage.value = 1 }
</script>

<style scoped>
.device-alarm {
  background: #f5f5f5;
  min-height: 100%;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 10px;
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
</style>
