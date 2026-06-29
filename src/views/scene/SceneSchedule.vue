<template>
  <div class="page-container">
    <div class="page-header">
      <div class="title">定时场景管理</div>
      <div class="header-actions">
        <el-button type="primary" @click="addSchedule">
          <component :is="icons.Plus" />
          新增定时
        </el-button>
      </div>
    </div>
    <el-table :data="schedulesWithTemplateName" border class="schedule-table">
      <el-table-column prop="id" label="定时编号" width="100" />
      <el-table-column prop="name" label="定时名称" />
      <el-table-column prop="templateName" label="关联场景" width="150" />
      <el-table-column prop="scheduleType" label="执行类型" width="120">
        <template #default="scope">
          <el-tag :type="getTypeTagType(scope.row.scheduleType)">
            {{ getTypeText(scope.row.scheduleType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="time" label="执行时间" width="120" />
      <el-table-column prop="enabled" label="状态" width="100">
        <template #default="scope">
          <el-switch 
            v-model="scope.row.enabled"
            @change="toggleEnable(scope.row)"
            active-color="#13ce66"
            inactive-color="#ff4949"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button size="small" @click="editSchedule(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteSchedule(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :title="editDialogTitle" v-model="dialogVisible" width="500px">
      <el-form :model="formData" label-width="100px">
        <el-form-item label="定时名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入定时名称" />
        </el-form-item>
        <el-form-item label="关联场景" prop="templateId">
          <el-select v-model="formData.templateId" placeholder="请选择场景">
            <el-option 
              v-for="template in enabledTemplates" 
              :key="template.id" 
              :label="template.name" 
              :value="template.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="执行类型" prop="scheduleType">
          <el-select v-model="formData.scheduleType">
            <el-option label="每天" value="daily" />
            <el-option label="周末" value="weekend" />
            <el-option label="节假日" value="holiday" />
          </el-select>
        </el-form-item>
        <el-form-item label="执行时间" prop="time">
          <el-time-picker 
            v-model="formData.time" 
            format="HH:mm" 
            placeholder="选择执行时间"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveSchedule">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const icons = { Plus }
const schedules = ref([
  { id: 'SCH001', name: '工作日定时节能', templateId: 'S002', scheduleType: 'daily', time: '22:00', enabled: true },
  { id: 'SCH002', name: '周末全亮模式', templateId: 'S001', scheduleType: 'weekend', time: '18:00', enabled: true },
  { id: 'SCH003', name: '深夜自动降亮', templateId: 'S003', scheduleType: 'daily', time: '02:00', enabled: true },
  { id: 'SCH004', name: '节假日特殊模式', templateId: 'S001', scheduleType: 'holiday', time: '17:30', enabled: false }
])
const templates = ref([
  { id: 'S001', name: '节日庆典模式', description: '全亮度照明，营造节日氛围', brightness: 100, duration: null, enabled: true },
  { id: 'S002', name: '节能模式', description: '降低亮度至50%，节省电能', brightness: 50, duration: null, enabled: true },
  { id: 'S003', name: '深夜模式', description: '凌晨2点后降低亮度', brightness: 30, duration: '02:00-05:00', enabled: true },
  { id: 'S004', name: '应急模式', description: '突发情况全亮照明', brightness: 100, duration: null, enabled: false },
  { id: 'S005', name: '雾霾模式', description: '提高亮度应对低能见度', brightness: 90, duration: null, enabled: true }
])
const dialogVisible = ref(false)
const isEdit = ref(false)
const formData = ref({
  id: '',
  name: '',
  templateId: '',
  scheduleType: 'daily',
  time: '',
  enabled: true
})

const editDialogTitle = computed(() => isEdit.value ? '编辑定时场景' : '新增定时场景')

const enabledTemplates = computed(() => {
  return templates.value.filter(t => t.enabled)
})

const schedulesWithTemplateName = computed(() => {
  return schedules.value.map(s => {
    const template = templates.value.find(t => t.id === s.templateId)
    return {
      ...s,
      templateName: template ? template.name : '未知场景'
    }
  })
})

const getTypeTagType = (type) => {
  switch (type) {
    case 'daily': return 'success'
    case 'weekend': return 'warning'
    case 'holiday': return 'info'
    default: return 'info'
  }
}

const getTypeText = (type) => {
  switch (type) {
    case 'daily': return '每天'
    case 'weekend': return '周末'
    case 'holiday': return '节假日'
    default: return type
  }
}

const addSchedule = () => {
  isEdit.value = false
  formData.value = {
    id: '',
    name: '',
    templateId: '',
    scheduleType: 'daily',
    time: '',
    enabled: true
  }
  dialogVisible.value = true
}

const editSchedule = (row) => {
  isEdit.value = true
  formData.value = { ...row }
  dialogVisible.value = true
}

const deleteSchedule = (row) => {
  ElMessageBox.confirm(
    '确定要删除该定时任务吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = schedules.value.findIndex(s => s.id === row.id)
    if (index > -1) {
      schedules.value.splice(index, 1)
    }
    ElMessage.success('删除成功')
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const toggleEnable = (row) => {
  row.enabled = !row.enabled
}

const saveSchedule = () => {
  if (!formData.value.name || !formData.value.templateId || !formData.value.time) {
    ElMessage.warning('请填写完整信息')
    return
  }
  
  if (isEdit.value) {
    const index = schedules.value.findIndex(s => s.id === formData.value.id)
    if (index > -1) {
      schedules.value[index] = { ...formData.value }
    }
    ElMessage.success('修改成功')
  } else {
    const newId = 'SCH' + String(schedules.value.length + 1).padStart(3, '0')
    schedules.value.push({
      ...formData.value,
      id: newId
    })
    ElMessage.success('新增成功')
  }
  dialogVisible.value = false
}
</script>

<style scoped>
.schedule-table {
  width: 100%;
}
</style>
