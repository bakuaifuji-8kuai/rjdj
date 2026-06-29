<template>
  <div class="device-ledger">
    <div class="page-header">
      <h2>设备台账</h2>
      <div class="header-actions">
        <el-button type="primary" @click="handleExport">导出</el-button>
      </div>
    </div>

    <div class="filter-bar">
      <el-select v-model="filterType" placeholder="请选择设备类型" style="width: 180px;" clearable>
        <el-option label="灯控设备" value="灯控设备" />
        <el-option label="配电柜" value="配电柜" />
        <el-option label="集控设备" value="集控设备" />
        <el-option label="传感器" value="传感器" />
      </el-select>
      <el-select v-model="filterStatus" placeholder="请选择状态" style="width: 180px;" clearable>
        <el-option label="正常" value="正常" />
        <el-option label="故障" value="故障" />
        <el-option label="待维护" value="待维护" />
      </el-select>
      <el-input v-model="searchText" placeholder="请输入设备编号或名称" style="width: 250px;" clearable />
      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <div class="table-wrapper">
      <el-table :data="deviceData" border stripe>
        <el-table-column prop="id" label="No" width="60" />
        <el-table-column prop="code" label="设备编号" width="140" />
        <el-table-column prop="name" label="设备名称" width="160" />
        <el-table-column prop="type" label="设备类型" width="120" />
        <el-table-column prop="model" label="设备型号" width="140" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="location" label="安装位置" min-width="180" />
        <el-table-column prop="installDate" label="安装日期" width="120" />
        <el-table-column prop="warrantyEnd" label="质保到期" width="120" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="text" size="small" @click="handleDetail(row)">详情</el-button>
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

    <el-dialog title="设备详情" v-model="showDetailDialog" width="700px">
      <el-tabs v-model="detailTab" type="card">
        <el-tab-pane label="基本信息" name="basic">
          <div class="detail-content">
            <div class="detail-row">
              <span class="detail-label">设备编号：</span>
              <span class="detail-value">{{ detailForm.code }}</span>
              <span class="detail-label">设备名称：</span>
              <span class="detail-value">{{ detailForm.name }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">设备类型：</span>
              <span class="detail-value">{{ detailForm.type }}</span>
              <span class="detail-label">设备型号：</span>
              <span class="detail-value">{{ detailForm.model }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">品牌：</span>
              <span class="detail-value">{{ detailForm.brand }}</span>
              <span class="detail-label">状态：</span>
              <span class="detail-value">{{ detailForm.status }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">安装位置：</span>
              <span class="detail-value">{{ detailForm.location }}</span>
              <span class="detail-label">安装日期：</span>
              <span class="detail-value">{{ detailForm.installDate }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">质保期：</span>
              <span class="detail-value">{{ detailForm.warrantyStart }} 至 {{ detailForm.warrantyEnd }}</span>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="技术参数" name="tech">
          <div class="detail-content">
            <div class="detail-row">
              <span class="detail-label">额定电压：</span>
              <span class="detail-value">{{ detailForm.voltage }} V</span>
              <span class="detail-label">额定功率：</span>
              <span class="detail-value">{{ detailForm.power }} W</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">通信方式：</span>
              <span class="detail-value">{{ detailForm.communication }}</span>
              <span class="detail-label">IP地址：</span>
              <span class="detail-value">{{ detailForm.ip }}</span>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="维护记录" name="maintenance">
          <el-table :data="maintenanceList" size="small" border>
            <el-table-column prop="date" label="日期" width="120" />
            <el-table-column prop="type" label="维护类型" width="120" />
            <el-table-column prop="content" label="维护内容" />
            <el-table-column prop="operator" label="操作人" width="100" />
          </el-table>
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
import { ElMessage } from 'element-plus'

const filterType = ref('')
const filterStatus = ref('')
const searchText = ref('')
const currentPage = ref(1)
const pageSize = ref(15)
const showDetailDialog = ref(false)
const detailTab = ref('basic')

const detailForm = ref({
  code: '',
  name: '',
  type: '',
  model: '',
  brand: '',
  status: '',
  location: '',
  installDate: '',
  warrantyStart: '',
  warrantyEnd: '',
  voltage: '',
  power: '',
  communication: '',
  ip: ''
})

const maintenanceList = ref([
  { date: '2026-04-15', type: '巡检', content: '常规检查，设备正常', operator: '张工' },
  { date: '2026-03-20', type: '维修', content: '更换电源模块', operator: '李工' }
])

const deviceData = ref([
  { id: 1, code: 'DK001', name: '先导路主灯控', type: '灯控设备', model: 'LC-2000', status: '正常', location: '长沙-岳麓区-先导路', installDate: '2024-01-15', warrantyEnd: '2027-01-14' },
  { id: 2, code: 'PDG001', name: '先导路1号配电柜', type: '配电柜', model: 'PDG-100', status: '正常', location: '长沙-岳麓区-先导路', installDate: '2024-01-15', warrantyEnd: '2027-01-14' },
  { id: 3, code: 'JK001', name: '力唯中天集控', type: '集控设备', model: 'JK-500', status: '故障', location: '长沙-岳麓区-力唯中天1栋', installDate: '2024-02-20', warrantyEnd: '2027-02-19' },
  { id: 4, code: 'CGQ001', name: '先导路光照传感器', type: '传感器', model: 'CGQ-100', status: '正常', location: '长沙-岳麓区-先导路', installDate: '2024-01-15', warrantyEnd: '2027-01-14' }
])

const total = computed(() => deviceData.value.length)

const getStatusType = (status) => {
  const types = { '正常': 'success', '故障': 'danger', '待维护': 'warning' }
  return types[status] || 'info'
}

const handleSearch = () => { currentPage.value = 1 }
const handleReset = () => { filterType.value = ''; filterStatus.value = ''; searchText.value = ''; currentPage.value = 1 }

const handleDetail = (row) => {
  detailForm.value = {
    code: row.code,
    name: row.name,
    type: row.type,
    model: row.model,
    brand: '知名品牌',
    status: row.status,
    location: row.location,
    installDate: row.installDate,
    warrantyStart: '2024-01-15',
    warrantyEnd: row.warrantyEnd,
    voltage: '220',
    power: '150',
    communication: 'PLC',
    ip: '192.168.1.101'
  }
  showDetailDialog.value = true
}

const handleExport = () => {
  ElMessage.success('导出功能')
}
</script>

<style scoped>
.device-ledger {
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
