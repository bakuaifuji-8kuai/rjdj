<template>
  <div class="page-container">
    <div class="page-header">
      <el-button type="primary" @click="handleAdd">新增时段</el-button>
      <el-button type="danger" @click="handleBatchDelete" :disabled="selectedRows.length === 0">批量删除</el-button>
    </div>
    <div class="content-area">
      <el-table :data="timePeriods" border @selection-change="handleSelection">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="no" label="序号" width="80" align="center" />
        <el-table-column prop="name" label="时段名称" min-width="150" />
        <el-table-column prop="startTime" label="开始时间" width="120" align="center" />
        <el-table-column prop="endTime" label="结束时间" width="120" align="center" />
        <el-table-column prop="brightness" label="亮度(%)" width="100" align="center" />
        <el-table-column prop="enabled" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.enabled ? 'success' : 'info'" size="small">
              {{ row.enabled ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">修改</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog :title="dialogTitle" v-model="showDialog" width="500px">
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="100px">
        <el-form-item label="时段名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入时段名称" />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-time-picker v-model="formData.startTime" format="HH:mm" value-format="HH:mm" placeholder="选择时间" style="width: 100%" />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-time-picker v-model="formData.endTime" format="HH:mm" value-format="HH:mm" placeholder="选择时间" style="width: 100%" />
        </el-form-item>
        <el-form-item label="亮度" prop="brightness">
          <el-slider v-model="formData.brightness" :min="0" :max="100" show-input />
        </el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="formData.enabled" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const timePeriods = ref([
  { no: 1, name: '白天模式', startTime: '06:00', endTime: '18:00', brightness: 80, enabled: true },
  { no: 2, name: '黄昏模式', startTime: '18:00', endTime: '19:00', brightness: 60, enabled: true },
  { no: 3, name: '夜间模式', startTime: '19:00', endTime: '23:00', brightness: 40, enabled: true },
  { no: 4, name: '深夜模式', startTime: '23:00', endTime: '06:00', brightness: 20, enabled: true }
])

const selectedRows = ref([])
const showDialog = ref(false)
const isEdit = ref(false)
const formRef = ref(null)

const formData = ref({
  name: '',
  startTime: '',
  endTime: '',
  brightness: 50,
  enabled: true
})

const formRules = {
  name: [{ required: true, message: '请输入时段名称', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }]
}

const dialogTitle = computed(() => isEdit.value ? '修改时段' : '新增时段')

const handleSelection = (val) => {
  selectedRows.value = val
}

const handleAdd = () => {
  isEdit.value = false
  formData.value = {
    name: '',
    startTime: '',
    endTime: '',
    brightness: 50,
    enabled: true
  }
  showDialog.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  formData.value = { ...row }
  showDialog.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除时段【${row.name}】吗？`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = timePeriods.value.findIndex(t => t.no === row.no)
    if (index !== -1) {
      timePeriods.value.splice(index, 1)
    }
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要删除的时段')
    return
  }
  ElMessageBox.confirm(`确定删除选中的 ${selectedRows.value.length} 个时段吗？`, '批量删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const nos = selectedRows.value.map(r => r.no)
    timePeriods.value = timePeriods.value.filter(t => !nos.includes(t.no))
    selectedRows.value = []
    ElMessage.success('批量删除成功')
  }).catch(() => {})
}

const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      if (isEdit.value) {
        const index = timePeriods.value.findIndex(t => t.no === formData.value.no)
        if (index !== -1) {
          timePeriods.value[index] = { ...formData.value }
        }
        ElMessage.success('修改成功')
      } else {
        const newNo = Math.max(...timePeriods.value.map(t => t.no)) + 1
        timePeriods.value.push({
          no: newNo,
          ...formData.value
        })
        ElMessage.success('新增成功')
      }
      showDialog.value = false
      formRef.value.resetFields()
    }
  })
}
</script>

<style scoped>
.page-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.content-area {
  flex: 1;
  background: #fff;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>