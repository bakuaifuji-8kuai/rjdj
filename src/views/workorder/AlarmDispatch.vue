<template>
  <div class="page-container">
    <div class="page-header">
      <div class="header-right">
        <el-button type="primary" @click="handleAdd">新增</el-button>
        <el-button type="danger" :disabled="selectedRows.length === 0" @click="handleBatchDelete">删除</el-button>
      </div>
    </div>

    <div class="filter-bar">
      <el-select v-model="filterDeviceType" placeholder="请选择设备类型" class="filter-select">
        <el-option label="全部" value="" />
        <el-option label="集控" value="集控" />
        <el-option label="灯具" value="灯具" />
        <el-option label="单灯控制器" value="单灯控制器" />
      </el-select>
      <el-select v-model="filterStatus" placeholder="请选择状态" class="filter-select">
        <el-option label="全部" value="" />
        <el-option label="启用" value="启用" />
        <el-option label="关闭" value="关闭" />
      </el-select>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <div class="table-wrapper">
      <el-table :data="filteredData" border class="data-table" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50"></el-table-column>
        <el-table-column prop="no" label="No" width="50" align="center"></el-table-column>
        <el-table-column prop="levelName" label="层级名称" min-width="150"></el-table-column>
        <el-table-column prop="deviceType" label="设备类型" width="100"></el-table-column>
        <el-table-column prop="alarmType" label="告警类型" min-width="200"></el-table-column>
        <el-table-column prop="workOrderType" label="工单类型" width="120"></el-table-column>
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === '启用' ? 'success' : 'danger'" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" align="center">
          <template #default="{ row }">
            <el-button 
              type="text" 
              size="small" 
              :class="row.status === '启用' ? 'text-danger' : 'text-success'" 
              @click="handleToggleStatus(row)"
            >
              {{ row.status === '启用' ? '停用' : '启用' }}
            </el-button>
            <el-button type="text" size="small" @click="handleEdit(row)">修改</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
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
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <el-dialog :title="isEdit ? '修改规则' : '新增规则'" v-model="showAddDialog" width="550px">
      <el-form :model="formData" label-width="100px" class="form-container">
        <el-form-item label="*所属层级" prop="levelName">
          <el-select v-model="formData.levelName" placeholder="请选择所属层级" class="form-select">
            <el-option label="力唯中天产业园" value="力唯中天产业园" />
            <el-option label="园区地面" value="园区地面" />
            <el-option label="1栋地面" value="1栋地面" />
            <el-option label="1栋" value="1栋" />
            <el-option label="4栋" value="4栋" />
            <el-option label="园区道路" value="园区道路" />
            <el-option label="充电桩区域" value="充电桩区域" />
          </el-select>
        </el-form-item>
        <el-form-item label="*设备类型" prop="deviceType">
          <el-select v-model="formData.deviceType" placeholder="请选择设备类型" class="form-select">
            <el-option label="集控" value="集控" />
            <el-option label="灯具" value="灯具" />
            <el-option label="单灯控制器" value="单灯控制器" />
          </el-select>
        </el-form-item>
        <el-form-item label="*告警类型" prop="alarmType">
          <el-select v-model="formData.alarmType" placeholder="请选择告警类型" class="form-select" multiple>
            <el-option label="设备掉电告警" value="设备掉电告警" />
            <el-option label="设备离线告警" value="设备离线告警" />
            <el-option label="灯具调光异常" value="灯具调光异常" />
            <el-option label="信号强度" value="信号强度" />
            <el-option label="离线告警" value="离线告警" />
            <el-option label="欠压告警" value="欠压告警" />
            <el-option label="非计划异常亮灯" value="非计划异常亮灯" />
          </el-select>
        </el-form-item>
        <el-form-item label="*工单类型" prop="workOrderType">
          <el-select v-model="formData.workOrderType" placeholder="请选择工单类型" class="form-select">
            <el-option label="爱克园区巡检" value="爱克园区巡检" />
            <el-option label="灯具故障模板" value="灯具故障模板" />
            <el-option label="巡检模板" value="巡检模板" />
            <el-option label="-" value="-" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showAddDialog = false">取消</el-button>
          <el-button type="primary" @click="handleConfirm">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessageBox } from 'element-plus'

const showAddDialog = ref(false)
const isEdit = ref(false)
const filterDeviceType = ref('')
const filterStatus = ref('')
const selectedRows = ref([])
const currentPage = ref(1)
const pageSize = ref(15)

const mockData = ref([
  {
    no: 1,
    levelName: '力唯中天产业园',
    deviceType: '集控',
    alarmType: '设备掉电告警,设备离线告警',
    workOrderType: '灯具故障模板',
    status: '启用'
  },
  {
    no: 2,
    levelName: '力唯中天产业园',
    deviceType: '集控',
    alarmType: '设备掉电告警,设备离线告警',
    workOrderType: '灯具故障模板',
    status: '启用'
  },
  {
    no: 3,
    levelName: '园区道路',
    deviceType: '灯具',
    alarmType: '灯具调光异常',
    workOrderType: '巡检模板',
    status: '启用'
  },
  {
    no: 4,
    levelName: '力唯中天产业园',
    deviceType: '集控',
    alarmType: '设备离线告警',
    workOrderType: '巡检模板',
    status: '关闭'
  },
  {
    no: 5,
    levelName: '力唯中天产业园',
    deviceType: '单灯控制器',
    alarmType: '信号强度,离线告警,欠压告警',
    workOrderType: '巡检模板',
    status: '关闭'
  },
  {
    no: 6,
    levelName: '力唯中天产业园',
    deviceType: '单灯控制器',
    alarmType: '信号强度,离线告警,欠压告警',
    workOrderType: '巡检模板',
    status: '关闭'
  },
  {
    no: 7,
    levelName: '充电桩区域',
    deviceType: '灯具',
    alarmType: '非计划异常亮灯,灯具调光异常',
    workOrderType: '-',
    status: '关闭'
  }
])

const total = computed(() => mockData.value.length)

const filteredData = computed(() => {
  let result = mockData.value
  if (filterDeviceType.value) {
    result = result.filter(i => i.deviceType === filterDeviceType.value)
  }
  if (filterStatus.value) {
    result = result.filter(i => i.status === filterStatus.value)
  }
  return result
})

const formData = ref({
  levelName: '',
  deviceType: '',
  alarmType: [],
  workOrderType: ''
})

const editingRow = ref(null)

const handleAdd = () => {
  isEdit.value = false
  showAddDialog.value = true
  formData.value = {
    levelName: '',
    deviceType: '',
    alarmType: [],
    workOrderType: ''
  }
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleReset = () => {
  filterDeviceType.value = ''
  filterStatus.value = ''
  currentPage.value = 1
}

const handleSelectionChange = (val) => {
  selectedRows.value = val
}

const handleToggleStatus = (row) => {
  row.status = row.status === '启用' ? '关闭' : '启用'
}

const handleEdit = (row) => {
  isEdit.value = true
  editingRow.value = row
  showAddDialog.value = true
  formData.value = {
    levelName: row.levelName,
    deviceType: row.deviceType,
    alarmType: row.alarmType.split(','),
    workOrderType: row.workOrderType
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除这条规则吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = mockData.value.findIndex(item => item.no === row.no)
    if (index !== -1) {
      mockData.value.splice(index, 1)
    }
  }).catch(() => {})
}

const handleBatchDelete = () => {
  ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 条规则吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    selectedRows.value.forEach(row => {
      const index = mockData.value.findIndex(item => item.no === row.no)
      if (index !== -1) {
        mockData.value.splice(index, 1)
      }
    })
    selectedRows.value = []
  }).catch(() => {})
}

const handleConfirm = () => {
  if (!formData.value.levelName || !formData.value.deviceType || !formData.value.alarmType.length || !formData.value.workOrderType) {
    alert('请填写所有必填字段')
    return
  }
  if (isEdit.value && editingRow.value) {
    const index = mockData.value.findIndex(item => item.no === editingRow.value.no)
    if (index !== -1) {
      mockData.value[index] = {
        ...mockData.value[index],
        levelName: formData.value.levelName,
        deviceType: formData.value.deviceType,
        alarmType: formData.value.alarmType.join(','),
        workOrderType: formData.value.workOrderType
      }
    }
  } else {
    const newRecord = {
      no: mockData.value.length + 1,
      levelName: formData.value.levelName,
      deviceType: formData.value.deviceType,
      alarmType: formData.value.alarmType.join(','),
      workOrderType: formData.value.workOrderType,
      status: '启用'
    }
    mockData.value.push(newRecord)
  }
  showAddDialog.value = false
}

const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}
</script>

<style scoped>
.page-container {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.page-header {
  display: flex;
  justify-content: flex-end;
  padding-bottom: 15px;
  border-bottom: 1px solid #e8e8e8;
}

.header-right {
  display: flex;
  gap: 10px;
}

.filter-bar {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-select {
  width: 180px;
}

.table-wrapper {
  flex: 1;
  overflow: auto;
  min-height: 0;
}

.data-table {
  width: 100%;
  min-width: 1200px;
}

.pagination-bar {
  display: flex;
  justify-content: center;
  padding: 15px 0;
}

.form-container {
  padding: 10px 0;
}

.form-select {
  width: 100%;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 15px;
}
</style>