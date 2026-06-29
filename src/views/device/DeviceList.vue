<template>
  <div class="page-container">
    <div class="page-header">
      <div class="title">设备台账</div>
      <div class="header-actions">
        <router-link to="/device/add" class="add-btn">
          <el-button type="primary">
            <el-icon><Plus /></el-icon>
            新增设备
          </el-button>
        </router-link>
      </div>
    </div>
    <div class="stats-card">
      <div class="stat-item online">
        <span class="stat-value">{{ onlineCount }}</span>
        <span class="stat-label">在线</span>
      </div>
      <div class="stat-item offline">
        <span class="stat-value">{{ offlineCount }}</span>
        <span class="stat-label">离线</span>
      </div>
      <div class="stat-item fault">
        <span class="stat-value">{{ faultCount }}</span>
        <span class="stat-label">故障</span>
      </div>
      <div class="stat-item total">
        <span class="stat-value">{{ totalCount }}</span>
        <span class="stat-label">总计</span>
      </div>
    </div>
    <div class="filter-bar">
      <el-select v-model="statusFilter" placeholder="状态筛选" class="filter-select" clearable>
        <el-option label="全部" value="" />
        <el-option label="在线" value="online" />
        <el-option label="离线" value="offline" />
        <el-option label="故障" value="fault" />
      </el-select>
      <el-input v-model="searchKeyword" placeholder="搜索设备名称或编号" class="filter-input" clearable>
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>
    <el-table :data="filteredData" border class="data-table">
      <el-table-column prop="id" label="设备编号" width="140" />
      <el-table-column prop="name" label="设备名称" min-width="200" />
      <el-table-column prop="model" label="设备型号" width="140" />
      <el-table-column prop="type" label="设备类型" width="120" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row.status)" size="small">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="location" label="安装位置" min-width="250" />
      <el-table-column prop="installDate" label="安装日期" width="120" />
      <el-table-column prop="lastMaintenance" label="维护日期" width="120" />
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <router-link :to="'/device/detail/' + row.id">
            <el-button size="small" type="primary">详情</el-button>
          </router-link>
          <el-button size="small" @click="editDevice(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteDevice(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="totalCount"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
      />
    </div>
    <el-dialog v-model="editDialogVisible" title="编辑设备" width="550px">
      <el-form :model="formData" label-width="100px">
        <el-form-item label="设备名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入设备名称" />
        </el-form-item>
        <el-form-item label="设备型号" prop="model">
          <el-input v-model="formData.model" placeholder="请输入设备型号" />
        </el-form-item>
        <el-form-item label="设备类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择设备类型">
            <el-option label="LED路灯" value="LED路灯" />
            <el-option label="高压钠灯" value="高压钠灯" />
            <el-option label="金卤灯" value="金卤灯" />
            <el-option label="隧道LED灯" value="隧道LED灯" />
            <el-option label="隧道应急灯" value="隧道应急灯" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="安装位置" prop="location">
          <el-input v-model="formData.location" placeholder="请输入安装位置" />
        </el-form-item>
        <el-form-item label="额定电压" prop="voltage">
          <el-input v-model="formData.voltage" placeholder="请输入额定电压" />
        </el-form-item>
        <el-form-item label="额定功率" prop="power">
          <el-input v-model="formData.power" placeholder="请输入额定功率" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Plus, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { deviceList } from '@/data/mockData'

const statusFilter = ref('')
const searchKeyword = ref('')
const editDialogVisible = ref(false)
const formData = ref({})
const currentPage = ref(1)
const pageSize = ref(10)

const tableData = ref([...deviceList])

const totalCount = computed(() => tableData.value.length)
const onlineCount = computed(() => tableData.value.filter(item => item.status === 'online').length)
const offlineCount = computed(() => tableData.value.filter(item => item.status === 'offline').length)
const faultCount = computed(() => tableData.value.filter(item => item.status === 'fault').length)

const filteredData = computed(() => {
  return tableData.value.filter(item => {
    const statusMatch = !statusFilter.value || item.status === statusFilter.value
    const keywordMatch = !searchKeyword.value ||
      item.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      item.id.toLowerCase().includes(searchKeyword.value.toLowerCase())
    return statusMatch && keywordMatch
  })
})

const getStatusTagType = (status) => {
  switch (status) {
    case 'online': return 'success'
    case 'offline': return 'info'
    case 'fault': return 'danger'
    default: return 'info'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'online': return '在线'
    case 'offline': return '离线'
    case 'fault': return '故障'
    default: return status
  }
}

const editDevice = (row) => {
  formData.value = { ...row }
  editDialogVisible.value = true
}

const deleteDevice = (row) => {
  ElMessageBox.confirm(
    '确定要删除该设备吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = tableData.value.findIndex(d => d.id === row.id)
    if (index > -1) {
      tableData.value.splice(index, 1)
    }
    ElMessage.success('删除成功')
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const saveEdit = () => {
  const index = tableData.value.findIndex(d => d.id === formData.value.id)
  if (index > -1) {
    tableData.value[index] = { ...formData.value }
  }
  ElMessage.success('修改成功')
  editDialogVisible.value = false
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
  align-items: center;
}

.add-btn {
  text-decoration: none;
}

.stats-card {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.stat-item {
  flex: 1;
  padding: 20px;
  border-radius: 8px;
  text-align: center;

  &.online {
    background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  }

  &.offline {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  }

  &.fault {
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  }

  &.total {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
}

.stat-value {
  display: block;
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 5px;
  color: #fff;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
  color: #fff;
}

.filter-bar {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  justify-content: flex-end;
}

.filter-select {
  width: 150px;
}

.filter-input {
  width: 280px;
}

.data-table {
  width: 100%;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>