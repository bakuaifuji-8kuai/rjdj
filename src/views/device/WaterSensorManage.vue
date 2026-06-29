<template>
  <div class="page-container">
    <div class="page-header">
      <h2>水浸传感器</h2>
      <div class="header-actions">
        <el-button type="primary" @click="handleAdd">新增</el-button>
      </div>
    </div>
    <div class="content-card">
      <el-table :data="sensorData" border stripe>
        <el-table-column prop="id" label="编号" width="80" />
        <el-table-column prop="name" label="设备名称" width="180" />
        <el-table-column prop="location" label="安装位置" min-width="200" />
        <el-table-column prop="waterStatus" label="水浸状态" width="120">
          <template #default="{ row }">
            <el-tag :type="row.waterStatus === '正常' ? 'success' : 'danger'" size="small">
              {{ row.waterStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="onlineStatus" label="在线状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.onlineStatus === '在线' ? 'success' : 'danger'" size="small">
              {{ row.onlineStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" min-width="180" />
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleDetail(row)">查看</el-button>
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          layout="prev, pager, next, jumper, ->, sizes, total"
        />
      </div>
    </div>

    <el-dialog :title="dialogTitle" v-model="showDialog" width="500px">
      <el-form :model="formData" label-width="100px">
        <el-form-item label="*设备名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入设备名称" />
        </el-form-item>
        <el-form-item label="*安装位置" prop="location">
          <el-select v-model="formData.location" placeholder="请选择安装位置" class="form-select">
            <el-option label="长沙-岳麓区-先导路" value="长沙-岳麓区-先导路" />
            <el-option label="长沙-岳麓区-力唯中天1栋" value="长沙-岳麓区-力唯中天1栋" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog title="详情" v-model="showDetailDialog" width="500px">
      <el-descriptions :column="2" :data="detailData" border>
        <el-descriptions-item label="编号">{{ detailData.id }}</el-descriptions-item>
        <el-descriptions-item label="设备名称">{{ detailData.name }}</el-descriptions-item>
        <el-descriptions-item label="安装位置">{{ detailData.location }}</el-descriptions-item>
        <el-descriptions-item label="水浸状态">
          <el-tag :type="detailData.waterStatus === '正常' ? 'success' : 'danger'" size="small">
            {{ detailData.waterStatus }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="在线状态">
          <el-tag :type="detailData.onlineStatus === '在线' ? 'success' : 'danger'" size="small">
            {{ detailData.onlineStatus }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ detailData.updateTime }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(25)
const showDialog = ref(false)
const showDetailDialog = ref(false)
const dialogTitle = ref('新增')
const editingId = ref(null)

const formData = ref({
  name: '',
  location: ''
})

const detailData = ref({})

const sensorData = ref([
  {
    id: 1,
    name: '先导路A段-水浸01',
    location: '长沙-岳麓区-先导路',
    waterStatus: '正常',
    onlineStatus: '在线',
    updateTime: '2026-05-22 09:15:30'
  },
  {
    id: 2,
    name: '先导路B段-水浸02',
    location: '长沙-岳麓区-先导路',
    waterStatus: '正常',
    onlineStatus: '在线',
    updateTime: '2026-05-22 09:16:00'
  },
  {
    id: 3,
    name: '力唯中天1栋-水浸01',
    location: '长沙-岳麓区-力唯中天1栋',
    waterStatus: '正常',
    onlineStatus: '在线',
    updateTime: '2026-05-22 09:14:45'
  }
])

const handleAdd = () => {
  dialogTitle.value = '新增'
  editingId.value = null
  showDialog.value = true
  formData.value = {
    name: '',
    location: ''
  }
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑'
  editingId.value = row.id
  showDialog.value = true
  formData.value = {
    name: row.name,
    location: row.location
  }
}

const handleDetail = (row) => {
  showDetailDialog.value = true
  detailData.value = { ...row }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该设备吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    const index = sensorData.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      sensorData.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  } catch {
    ElMessage.info('已取消删除')
  }
}

const handleConfirm = () => {
  if (!formData.value.name || !formData.value.location) {
    ElMessage.warning('请填写必填字段')
    return
  }

  if (editingId.value) {
    const index = sensorData.value.findIndex(item => item.id === editingId.value)
    if (index !== -1) {
      sensorData.value[index] = {
        ...sensorData.value[index],
        name: formData.value.name,
        location: formData.value.location,
        updateTime: new Date().toLocaleString()
      }
      ElMessage.success('修改成功')
    }
  } else {
    const newRecord = {
      id: sensorData.value.length + 1,
      name: formData.value.name,
      location: formData.value.location,
      waterStatus: '正常',
      onlineStatus: '在线',
      updateTime: new Date().toLocaleString()
    }
    sensorData.value.push(newRecord)
    ElMessage.success('新增成功')
  }
  showDialog.value = false
}
</script>

<style scoped>
.page-container {
  padding: 20px;
  background: #f0f2f5;
  min-height: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f1f1f;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.content-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.form-select {
  width: 100%;
}
</style>
