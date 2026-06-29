<template>
  <div class="section-manage">
    <div class="page-header">
      <h2>分段管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="handleAdd">新增</el-button>
        <el-button type="danger" :disabled="selectedRows.length === 0" @click="handleBatchDelete">批量删除</el-button>
      </div>
    </div>

    <div class="filter-bar">
      <el-select v-model="filterTunnel" placeholder="展厅隧道" style="width: 150px;">
        <el-option label="展厅隧道" value="展厅隧道" />
      </el-select>
      <el-select v-model="filterHole" placeholder="展厅隧道洞" style="width: 150px;">
        <el-option label="展厅隧道洞" value="展厅隧道洞" />
      </el-select>
      <el-button type="primary" @click="handleSearch">查询</el-button>
    </div>

    <div class="table-wrapper">
      <el-table :data="sectionData" border @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="No" width="60" />
        <el-table-column prop="name" label="分段名称" min-width="120" />
        <el-table-column prop="type" label="分段类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTagType(row.type)">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="order" label="排序" width="80" />
        <el-table-column prop="length" label="长度(米)" width="100" />
        <el-table-column prop="entrance" label="出入口" width="80" />
        <el-table-column prop="sensor" label="关联传感器" width="120" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === '启用' ? 'success' : 'warning'">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button type="text" size="small" @click="handleEdit(row)">修改</el-button>
            <el-button type="text" size="small" style="color: #f56c6c;" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog :title="isEdit ? '修改分段' : '新增分段'" v-model="showDialog" width="500px">
      <el-form :model="formData" label-width="100px">
        <el-form-item label="*分段名称" required>
          <el-input v-model="formData.name" placeholder="请输入分段名称" />
        </el-form-item>
        <el-form-item label="*分段类型" required>
          <el-select v-model="formData.type">
            <el-option label="入口段" value="入口段" />
            <el-option label="基本段" value="基本段" />
            <el-option label="出口段" value="出口段" />
          </el-select>
        </el-form-item>
        <el-form-item label="*排序" required>
          <el-input-number v-model="formData.order" :min="1" />
        </el-form-item>
        <el-form-item label="*长度(米)" required>
          <el-input-number v-model="formData.length" :min="0" />
        </el-form-item>
        <el-form-item label="出入口">
          <el-select v-model="formData.entrance">
            <el-option label="入口" value="入口" />
            <el-option label="出口" value="出口" />
          </el-select>
        </el-form-item>
        <el-form-item label="关联传感器">
          <el-input v-model="formData.sensor" placeholder="请输入传感器名称" />
        </el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="formData.status" active-value="启用" inactive-value="禁用" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSave">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const filterTunnel = ref('展厅隧道')
const filterHole = ref('展厅隧道洞')
const showDialog = ref(false)
const isEdit = ref(false)
const selectedRows = ref([])

const formData = ref({
  name: '',
  type: '入口段',
  order: 1,
  length: 0,
  entrance: '入口',
  sensor: '',
  status: '启用'
})

const sectionData = ref([
  { id: 1, name: '入口段', type: '入口段', order: 1, length: 5, entrance: '入口', sensor: '展厅光照', status: '启用' },
  { id: 2, name: '基本段', type: '基本段', order: 2, length: 10, entrance: '入口', sensor: '-', status: '启用' },
  { id: 3, name: '出口段', type: '出口段', order: 3, length: 5, entrance: '出口', sensor: '展厅光照', status: '启用' }
])

const getTagType = (type) => {
  const types = { '入口段': 'primary', '基本段': 'success', '出口段': 'warning' }
  return types[type] || 'info'
}

const handleSearch = () => {}

const handleSelectionChange = (val) => {
  selectedRows.value = val
}

const handleAdd = () => {
  isEdit.value = false
  formData.value = {
    name: '',
    type: '入口段',
    order: 1,
    length: 0,
    entrance: '入口',
    sensor: '',
    status: '启用'
  }
  showDialog.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  formData.value = { ...row }
  showDialog.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该分段吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = sectionData.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      sectionData.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

const handleBatchDelete = () => {
  ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 个分段吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const ids = selectedRows.value.map(item => item.id)
    sectionData.value = sectionData.value.filter(item => !ids.includes(item.id))
    selectedRows.value = []
    ElMessage.success('批量删除成功')
  }).catch(() => {})
}

const handleSave = () => {
  showDialog.value = false
}
</script>

<style scoped>
.section-manage {
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
  margin-bottom: 15px;
  border-radius: 4px;
}

.table-wrapper {
  background: #ffffff;
  padding: 15px;
  border-radius: 4px;
}
</style>