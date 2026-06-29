<template>
  <div class="circuit-group">
    <div class="page-header">
      <h2>回路分组</h2>
      <div class="header-actions">
        <el-button type="primary" @click="handleAdd">新增分组</el-button>
        <el-button type="danger">批量删除</el-button>
      </div>
    </div>

    <div class="filter-bar">
      <el-select v-model="filterTunnel" placeholder="展厅隧道" style="width: 150px;">
        <el-option label="展厅隧道" value="展厅隧道" />
      </el-select>
      <el-button type="primary" @click="handleSearch">查询</el-button>
    </div>

    <div class="table-wrapper">
      <el-table :data="groupData" border>
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="No" width="60" />
        <el-table-column prop="name" label="分组名称" min-width="120" />
        <el-table-column prop="circuitCount" label="包含回路数" width="120" />
        <el-table-column prop="deviceCount" label="关联设备数" width="120" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === '正常' ? 'success' : 'danger'">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="150" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="text" size="small" @click="handleView(row)">查看详情</el-button>
            <el-button type="text" size="small" @click="handleEdit(row)">修改</el-button>
            <el-button type="text" size="small" style="color: #f56c6c;" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog title="创建分组" v-model="showDialog" width="500px">
      <el-form :model="formData" label-width="100px">
        <el-form-item label="*分组名称" required>
          <el-input v-model="formData.name" placeholder="请输入分组名称" />
        </el-form-item>
        <el-form-item label="分组描述">
          <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入分组描述" />
        </el-form-item>
        <el-form-item label="关联回路">
          <el-select v-model="formData.circuits" multiple style="width: 100%;">
            <el-option label="照明回路1" value="HL-001" />
            <el-option label="照明回路2" value="HL-002" />
            <el-option label="照明回路3" value="HL-003" />
            <el-option label="应急回路" value="HL-004" />
          </el-select>
        </el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="formData.status" active-value="正常" inactive-value="禁用" />
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

const filterTunnel = ref('展厅隧道')
const showDialog = ref(false)

const formData = ref({
  name: '',
  description: '',
  circuits: [],
  status: '正常'
})

const groupData = ref([
  { id: 1, name: '入口段照明组', circuitCount: 2, deviceCount: 48, status: '正常', createTime: '2024-05-18 10:00' },
  { id: 2, name: '基本段照明组', circuitCount: 4, deviceCount: 96, status: '正常', createTime: '2024-05-18 10:05' },
  { id: 3, name: '出口段照明组', circuitCount: 2, deviceCount: 48, status: '正常', createTime: '2024-05-18 10:10' },
  { id: 4, name: '应急照明组', circuitCount: 1, deviceCount: 24, status: '正常', createTime: '2024-05-18 10:15' }
])

const handleSearch = () => {}
const handleView = (row) => {}
const handleAdd = () => {
  formData.value = {
    name: '',
    description: '',
    circuits: [],
    status: '正常'
  }
  showDialog.value = true
}
const handleEdit = (row) => {
  formData.value.name = row.name
  showDialog.value = true
}
const handleDelete = (row) => {}
const handleSave = () => {
  showDialog.value = false
}
</script>

<style scoped>
.circuit-group {
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
}
</style>