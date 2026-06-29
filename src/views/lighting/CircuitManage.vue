<template>
  <div class="page-container">
    <div class="page-header">
      <el-button type="primary" @click="handleAdd">新增回路</el-button>
      <el-button type="danger" @click="handleBatchDelete" :disabled="selectedRows.length === 0">批量删除</el-button>
    </div>
    <div class="content-area">
      <el-table :data="circuits" border @selection-change="handleSelection">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="no" label="序号" width="80" align="center" />
        <el-table-column prop="name" label="回路名称" min-width="200" />
        <el-table-column prop="location" label="安装位置" min-width="150" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === '开启' ? 'success' : row.status === '关闭' ? 'danger' : 'warning'" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="brightness" label="亮度(%)" width="100" align="center" />
        <el-table-column prop="power" label="功率(W)" width="100" align="center" />
        <el-table-column label="操作" width="280" align="center">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">修改</el-button>
            <el-button size="small" :type="row.status === '开启' ? 'warning' : 'success'" @click="toggleStatus(row)">
              {{ row.status === '开启' ? '关闭' : '开启' }}
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog :title="dialogTitle" v-model="showDialog" width="500px">
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="100px">
        <el-form-item label="回路名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入回路名称" />
        </el-form-item>
        <el-form-item label="安装位置" prop="location">
          <el-input v-model="formData.location" placeholder="请输入安装位置" />
        </el-form-item>
        <el-form-item label="亮度" prop="brightness">
          <el-slider v-model="formData.brightness" :min="0" :max="100" show-input />
        </el-form-item>
        <el-form-item label="功率(W)" prop="power">
          <el-input-number v-model="formData.power" :min="0" :max="10000" />
        </el-form-item>
        <el-form-item label="状态">
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

const circuits = ref([
  { no: 1, name: '主回路1', location: '先导路A区', status: '开启', brightness: 80, power: 1200, enabled: true },
  { no: 2, name: '主回路2', location: '先导路B区', status: '开启', brightness: 75, power: 1100, enabled: true },
  { no: 3, name: '辅回路1', location: '力唯中天1栋', status: '关闭', brightness: 0, power: 800, enabled: false },
  { no: 4, name: '辅回路2', location: '力唯中天1栋', status: '维护', brightness: 0, power: 850, enabled: false },
  { no: 5, name: '景观回路', location: '园区入口', status: '开启', brightness: 60, power: 600, enabled: true }
])

const selectedRows = ref([])
const showDialog = ref(false)
const isEdit = ref(false)
const formRef = ref(null)

const formData = ref({
  name: '',
  location: '',
  brightness: 50,
  power: 1000,
  enabled: true
})

const formRules = {
  name: [{ required: true, message: '请输入回路名称', trigger: 'blur' }],
  location: [{ required: true, message: '请输入安装位置', trigger: 'blur' }]
}

const dialogTitle = computed(() => isEdit.value ? '修改回路' : '新增回路')

const handleSelection = (val) => {
  selectedRows.value = val
}

const handleAdd = () => {
  isEdit.value = false
  formData.value = {
    name: '',
    location: '',
    brightness: 50,
    power: 1000,
    enabled: true
  }
  showDialog.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  formData.value = { ...row }
  showDialog.value = true
}

const toggleStatus = (row) => {
  row.status = row.status === '开启' ? '关闭' : '开启'
  ElMessage.success(`回路【${row.name}】已${row.status}`)
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除回路【${row.name}】吗？`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = circuits.value.findIndex(c => c.no === row.no)
    if (index !== -1) {
      circuits.value.splice(index, 1)
    }
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要删除的回路')
    return
  }
  ElMessageBox.confirm(`确定删除选中的 ${selectedRows.value.length} 个回路吗？`, '批量删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const nos = selectedRows.value.map(r => r.no)
    circuits.value = circuits.value.filter(c => !nos.includes(c.no))
    selectedRows.value = []
    ElMessage.success('批量删除成功')
  }).catch(() => {})
}

const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      if (isEdit.value) {
        const index = circuits.value.findIndex(c => c.no === formData.value.no)
        if (index !== -1) {
          circuits.value[index] = {
            ...circuits.value[index],
            ...formData.value,
            status: formData.value.enabled ? '开启' : '关闭'
          }
        }
        ElMessage.success('修改成功')
      } else {
        const newNo = Math.max(...circuits.value.map(c => c.no)) + 1
        circuits.value.push({
          no: newNo,
          ...formData.value,
          status: formData.value.enabled ? '开启' : '关闭'
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