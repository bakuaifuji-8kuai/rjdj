<template>
  <div class="page-container">
    <div class="page-header">
      <div class="title">时序策略</div>
      <div class="header-actions">
        <el-button type="primary" @click="addStrategy">
          <component :is="icons.Plus" />
          新增策略
        </el-button>
      </div>
    </div>
    <el-table :data="strategyList" border class="data-table">
      <el-table-column prop="id" label="策略编号" width="100" />
      <el-table-column prop="name" label="策略名称" />
      <el-table-column prop="startTime" label="开始时间" width="100" />
      <el-table-column prop="endTime" label="结束时间" width="100" />
      <el-table-column prop="brightness" label="亮度(%)" width="100">
        <template #default="scope">
          <el-progress :percentage="scope.row.brightness" :show-text="true" width="80" />
        </template>
      </el-table-column>
      <el-table-column prop="enabled" label="状态" width="100">
        <template #default="scope">
          <el-switch 
            :value="scope.row.enabled" 
            @change="toggleEnable(scope.row)"
            active-color="#13ce66"
            inactive-color="#ff4949"
          />
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="120" />
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button size="small" @click="editStrategy(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteStrategy(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :title="editDialogTitle" :visible.sync="dialogVisible" width="500px">
      <el-form :model="formData" label-width="100px">
        <el-form-item label="策略名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入策略名称" />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-time-picker 
            v-model="formData.startTime" 
            format="HH:mm" 
            placeholder="选择开始时间"
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-time-picker 
            v-model="formData.endTime" 
            format="HH:mm" 
            placeholder="选择结束时间"
          />
        </el-form-item>
        <el-form-item label="亮度" prop="brightness">
          <el-slider 
            v-model="formData.brightness" 
            :min="0" 
            :max="100" 
            :step="1"
            show-input
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveStrategy">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { timingStrategies } from '@/data/mockData'

const icons = { Plus, Edit, Delete }
const strategyList = ref([...timingStrategies])
const dialogVisible = ref(false)
const isEdit = ref(false)
const formData = ref({
  id: '',
  name: '',
  startTime: '',
  endTime: '',
  brightness: 80,
  enabled: true,
  createTime: ''
})

const editDialogTitle = computed(() => isEdit.value ? '编辑策略' : '新增策略')

const addStrategy = () => {
  isEdit.value = false
  formData.value = {
    id: '',
    name: '',
    startTime: '',
    endTime: '',
    brightness: 80,
    enabled: true,
    createTime: ''
  }
  dialogVisible.value = true
}

const editStrategy = (row) => {
  isEdit.value = true
  formData.value = { ...row }
  dialogVisible.value = true
}

const deleteStrategy = (row) => {
  ElMessageBox.confirm(
    '确定要删除该策略吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = strategyList.value.findIndex(s => s.id === row.id)
    if (index > -1) {
      strategyList.value.splice(index, 1)
    }
    ElMessage.success('删除成功')
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const toggleEnable = (row) => {
  row.enabled = !row.enabled
}

const saveStrategy = () => {
  if (!formData.value.name || !formData.value.startTime || !formData.value.endTime) {
    ElMessage.warning('请填写完整信息')
    return
  }
  
  if (isEdit.value) {
    const index = strategyList.value.findIndex(s => s.id === formData.value.id)
    if (index > -1) {
      strategyList.value[index] = { ...formData.value }
    }
    ElMessage.success('修改成功')
  } else {
    const newId = 'T' + String(strategyList.value.length + 1).padStart(3, '0')
    strategyList.value.push({
      ...formData.value,
      id: newId,
      createTime: new Date().toISOString().split('T')[0]
    })
    ElMessage.success('新增成功')
  }
  dialogVisible.value = false
}
</script>

<style scoped>
.data-table {
  width: 100%;
}
</style>
