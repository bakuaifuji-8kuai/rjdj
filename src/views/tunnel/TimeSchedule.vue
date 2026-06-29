<template>
  <div class="time-schedule">
    <div class="page-header">
      <h2>时序设置</h2>
      <div class="header-actions">
        <el-button type="primary" @click="handleAdd">添加时段</el-button>
      </div>
    </div>

    <div class="filter-bar">
      <el-select v-model="filterTunnel" placeholder="展厅隧道" style="width: 150px;">
        <el-option label="展厅隧道" value="展厅隧道" />
      </el-select>
      <el-button type="primary" @click="handleSearch">查询</el-button>
    </div>

    <div class="schedule-grid">
      <div class="schedule-card">
        <div class="card-header">
          <span class="card-title">凌晨时段</span>
          <el-button type="text" size="small" @click="editSchedule('dawn')">修改</el-button>
        </div>
        <div class="card-content">
          <div class="time-range">00:00 - 06:00</div>
          <div class="brightness-info">
            <span>调光值: <strong>10%</strong></span>
          </div>
        </div>
      </div>

      <div class="schedule-card">
        <div class="card-header">
          <span class="card-title">白天时段</span>
          <el-button type="text" size="small" @click="editSchedule('day')">修改</el-button>
        </div>
        <div class="card-content">
          <div class="time-range">06:00 - 18:00</div>
          <div class="brightness-info">
            <span>调光值: <strong>30%</strong></span>
          </div>
        </div>
      </div>

      <div class="schedule-card">
        <div class="card-header">
          <span class="card-title">傍晚时段</span>
          <el-button type="text" size="small" @click="editSchedule('dusk')">修改</el-button>
        </div>
        <div class="card-content">
          <div class="time-range">18:00 - 20:00</div>
          <div class="brightness-info">
            <span>调光值: <strong>20%</strong></span>
          </div>
        </div>
      </div>

      <div class="schedule-card">
        <div class="card-header">
          <span class="card-title">夜间时段</span>
          <el-button type="text" size="small" @click="editSchedule('night')">修改</el-button>
        </div>
        <div class="card-content">
          <div class="time-range">20:00 - 24:00</div>
          <div class="brightness-info">
            <span>调光值: <strong>15%</strong></span>
          </div>
        </div>
      </div>
    </div>

    <div class="table-wrapper">
      <el-table :data="scheduleList" border>
        <el-table-column prop="id" label="No" width="60" />
        <el-table-column prop="name" label="时段名称" width="120" />
        <el-table-column prop="startTime" label="开始时间" width="100" />
        <el-table-column prop="endTime" label="结束时间" width="100" />
        <el-table-column prop="brightness" label="调光值" width="100">
          <template #default="{ row }">{{ row.brightness }}%</template>
        </el-table-column>
        <el-table-column prop="section" label="适用分段" width="150" />
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

    <el-dialog title="编辑时段" v-model="showDialog" width="400px">
      <el-form :model="formData" label-width="80px">
        <el-form-item label="时段名称">
          <el-input v-model="formData.name" />
        </el-form-item>
        <el-form-item label="开始时间">
          <el-time-picker v-model="formData.startTime" format="HH:mm" />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-time-picker v-model="formData.endTime" format="HH:mm" />
        </el-form-item>
        <el-form-item label="调光值">
          <el-slider v-model="formData.brightness" :min="0" :max="100" show-input />
        </el-form-item>
        <el-form-item label="适用分段">
          <el-select v-model="formData.section" multiple>
            <el-option label="入口段" value="入口段" />
            <el-option label="基本段" value="基本段" />
            <el-option label="出口段" value="出口段" />
          </el-select>
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
const showDialog = ref(false)

const formData = ref({
  name: '',
  startTime: '00:00',
  endTime: '06:00',
  brightness: 10,
  section: [],
  status: '启用'
})

const scheduleList = ref([
  { id: 1, name: '凌晨时段', startTime: '00:00', endTime: '06:00', brightness: 10, section: '基本段', status: '启用' },
  { id: 2, name: '白天时段', startTime: '06:00', endTime: '18:00', brightness: 30, section: '基本段', status: '启用' },
  { id: 3, name: '傍晚时段', startTime: '18:00', endTime: '20:00', brightness: 20, section: '入口段', status: '启用' },
  { id: 4, name: '夜间时段', startTime: '20:00', endTime: '24:00', brightness: 15, section: '基本段', status: '启用' }
])

const handleSearch = () => {}

const handleAdd = () => {
  formData.value = {
    name: '',
    startTime: '00:00',
    endTime: '06:00',
    brightness: 10,
    section: [],
    status: '启用'
  }
  showDialog.value = true
}

const editSchedule = (type) => {
  const names = { dawn: '凌晨时段', day: '白天时段', dusk: '傍晚时段', night: '夜间时段' }
  formData.value.name = names[type]
  showDialog.value = true
}

const handleEdit = (row) => {
  formData.value = { ...row }
  showDialog.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除此时段吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = scheduleList.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      scheduleList.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

const handleSave = () => {
  showDialog.value = false
}
</script>

<style scoped>
.time-schedule {
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

.schedule-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.schedule-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.card-title {
  font-weight: 600;
  color: #333;
}

.time-range {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.brightness-info {
  font-size: 16px;
  color: #333;
}

.table-wrapper {
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
}
</style>