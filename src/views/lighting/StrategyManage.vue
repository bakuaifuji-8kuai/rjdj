<template>
  <div class="page-container">
    <div class="page-header">
      <div class="title">策略管理</div>
      <div class="header-actions">
        <el-button type="primary" @click="showAddDialog">
          <el-icon><Plus /></el-icon>
          新增策略
        </el-button>
      </div>
    </div>

    <el-table :data="strategies" border style="width: 100%; margin-top: 20px;">
      <el-table-column prop="name" label="策略名称" width="180" />
      <el-table-column prop="type" label="策略类型" width="120">
        <template #default="{ row }">
          <el-tag :type="getTypeTag(row.type)" size="small">
            {{ getTypeText(row.type) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="action" label="执行动作" width="100">
        <template #default="{ row }">
          <el-tag :type="getActionTag(row.action)" size="small">
            {{ getActionText(row.action) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="startDate" label="开始日期" width="120" />
      <el-table-column prop="endDate" label="结束日期" width="120" />
      <el-table-column prop="deviceCount" label="关联设备数" width="100" align="center" />
      <el-table-column prop="enabled" label="状态" width="80" align="center">
        <template #default="{ row }">
          <el-switch v-model="row.enabled" @change="toggleStrategy(row)" />
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" min-width="200" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="editStrategy(row)">
            修改
          </el-button>
          <el-button type="info" size="small" @click="viewDetail(row)">
            详情
          </el-button>
          <el-button type="danger" size="small" @click="deleteStrategy(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '修改策略' : '新增策略'" width="700px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="策略名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入策略名称" />
        </el-form-item>
        <el-form-item label="策略类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择策略类型" style="width: 100%;" @change="onTypeChange">
            <el-option label="时间执行" value="time" />
            <el-option label="经纬度执行" value="coordinate" />
            <el-option label="计时执行" value="timer" />
          </el-select>
        </el-form-item>
        
        <div v-if="form.type === 'time'" class="type-form">
          <el-form-item label="执行动作" prop="action">
            <el-radio-group v-model="form.action">
              <el-radio label="on">开灯</el-radio>
              <el-radio label="off">关灯</el-radio>
              <el-radio label="dim">调光</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="form.action === 'dim'" label="亮度值" prop="brightness">
            <el-slider v-model="form.brightness" :min="0" :max="100" show-input />
          </el-form-item>
          <el-form-item label="执行时间" prop="executeTime">
            <el-time-picker
              v-model="form.executeTime"
              format="HH:mm"
              placeholder="选择时间"
              style="width: 100%;"
            />
          </el-form-item>
          <el-form-item label="重复日期" prop="repeatDays">
            <el-checkbox-group v-model="form.repeatDays">
              <el-checkbox label="1">周一</el-checkbox>
              <el-checkbox label="2">周二</el-checkbox>
              <el-checkbox label="3">周三</el-checkbox>
              <el-checkbox label="4">周四</el-checkbox>
              <el-checkbox label="5">周五</el-checkbox>
              <el-checkbox label="6">周六</el-checkbox>
              <el-checkbox label="0">周日</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </div>

        <div v-if="form.type === 'coordinate'" class="type-form">
          <el-form-item label="执行动作" prop="action">
            <el-radio-group v-model="form.action">
              <el-radio label="on">开灯</el-radio>
              <el-radio label="off">关灯</el-radio>
              <el-radio label="dim">调光</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="form.action === 'dim'" label="亮度值" prop="brightness">
            <el-slider v-model="form.brightness" :min="0" :max="100" show-input />
          </el-form-item>
          <el-form-item label="纬度" prop="latitude">
            <el-input-number v-model="form.latitude" :precision="6" :step="0.000001" style="width: 100%;" />
          </el-form-item>
          <el-form-item label="经度" prop="longitude">
            <el-input-number v-model="form.longitude" :precision="6" :step="0.000001" style="width: 100%;" />
          </el-form-item>
          <el-form-item label="日出/日落">
            <el-radio-group v-model="form.sunEvent">
              <el-radio label="sunrise">日出执行</el-radio>
              <el-radio label="sunset">日落执行</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="偏移时间" prop="offset">
            <el-input-number v-model="form.offset" :step="10" style="width: 200px;">
              <template #append>分钟</template>
            </el-input-number>
          </el-form-item>
        </div>

        <div v-if="form.type === 'timer'" class="type-form">
          <el-form-item label="执行动作" prop="action">
            <el-radio-group v-model="form.action">
              <el-radio label="on">开灯</el-radio>
              <el-radio label="off">关灯</el-radio>
              <el-radio label="dim">调光</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="form.action === 'dim'" label="亮度值" prop="brightness">
            <el-slider v-model="form.brightness" :min="0" :max="100" show-input />
          </el-form-item>
          <el-form-item label="间隔时长" prop="interval">
            <el-input-number v-model="form.interval" :min="1" style="width: 200px;">
              <template #append>分钟</template>
            </el-input-number>
          </el-form-item>
          <el-form-item label="开始时间" prop="startTime">
            <el-time-picker
              v-model="form.startTime"
              format="HH:mm"
              placeholder="选择开始时间"
              style="width: 100%;"
            />
          </el-form-item>
          <el-form-item label="结束时间" prop="endTime">
            <el-time-picker
              v-model="form.endTime"
              format="HH:mm"
              placeholder="选择结束时间"
              style="width: 100%;"
            />
          </el-form-item>
        </div>

        <el-form-item label="开始日期" prop="startDate">
          <el-date-picker
            v-model="form.startDate"
            type="date"
            placeholder="选择开始日期"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="结束日期" prop="endDate">
          <el-date-picker
            v-model="form.endDate"
            type="date"
            placeholder="选择结束日期"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="关联设备" prop="devices">
          <el-select v-model="form.devices" multiple placeholder="请选择关联设备" style="width: 100%;">
            <el-option label="中山路01号灯" value="1" />
            <el-option label="中山路02号灯" value="2" />
            <el-option label="人民路01号灯" value="3" />
            <el-option label="人民路02号灯" value="4" />
            <el-option label="解放路01号灯" value="5" />
            <el-option label="解放路02号灯" value="6" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入策略描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailVisible" title="策略详情" width="600px">
      <el-descriptions v-if="currentStrategy" :column="2" border>
        <el-descriptions-item label="策略名称">{{ currentStrategy.name }}</el-descriptions-item>
        <el-descriptions-item label="策略类型">
          <el-tag :type="getTypeTag(currentStrategy.type)" size="small">
            {{ getTypeText(currentStrategy.type) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="执行动作">
          <el-tag :type="getActionTag(currentStrategy.action)" size="small">
            {{ getActionText(currentStrategy.action) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="关联设备数">{{ currentStrategy.deviceCount }}</el-descriptions-item>
        <el-descriptions-item label="开始日期">{{ currentStrategy.startDate }}</el-descriptions-item>
        <el-descriptions-item label="结束日期">{{ currentStrategy.endDate }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="currentStrategy.enabled ? 'success' : 'info'" size="small">
            {{ currentStrategy.enabled ? '已启用' : '已禁用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">{{ currentStrategy.description }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const dialogVisible = ref(false)
const detailVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const currentStrategy = ref(null)

const strategies = ref([
  { id: 1, name: '夜间节能模式', type: 'time', action: 'dim', brightness: 60, executeTime: '18:00', repeatDays: ['1','2','3','4','5'], deviceCount: 50, enabled: true, startDate: '2024-01-01', endDate: '2024-12-31', description: '工作日夜间降低亮度至60%' },
  { id: 2, name: '全夜亮灯模式', type: 'time', action: 'on', brightness: 100, executeTime: '18:00', repeatDays: ['0','6'], deviceCount: 30, enabled: true, startDate: '2024-01-01', endDate: '2024-12-31', description: '周末全天保持全亮' },
  { id: 3, name: '日出日落策略', type: 'coordinate', action: 'dim', brightness: 80, latitude: 31.230416, longitude: 121.473701, sunEvent: 'sunset', offset: 0, deviceCount: 100, enabled: true, startDate: '2024-01-01', endDate: '2024-12-31', description: '根据经纬度自动开关灯' },
  { id: 4, name: '深夜间隔调光', type: 'timer', action: 'dim', brightness: 40, interval: 30, startTime: '23:00', endTime: '05:00', deviceCount: 20, enabled: false, startDate: '2024-01-01', endDate: '2024-12-31', description: '深夜每30分钟调光一次' },
  { id: 5, name: '节假日庆典', type: 'time', action: 'on', brightness: 100, executeTime: '18:00', repeatDays: ['0','6'], deviceCount: 80, enabled: true, startDate: '2024-02-01', endDate: '2024-02-29', description: '节假日期间全亮模式' },
  { id: 6, name: '故障后恢复', type: 'coordinate', action: 'on', brightness: 100, latitude: 31.230416, longitude: 121.473701, sunEvent: 'sunrise', offset: 0, deviceCount: 50, enabled: true, startDate: '2024-01-01', endDate: '2024-12-31', description: '日出时自动恢复所有灯具' }
])

const form = reactive({
  name: '',
  type: 'time',
  action: 'on',
  brightness: 100,
  executeTime: '',
  repeatDays: [],
  latitude: 31.230416,
  longitude: 121.473701,
  sunEvent: 'sunset',
  offset: 0,
  interval: 30,
  startTime: '',
  endTime: '',
  startDate: '',
  endDate: '',
  devices: [],
  description: ''
})

const rules = {
  name: [{ required: true, message: '请输入策略名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择策略类型', trigger: 'change' }],
  action: [{ required: true, message: '请选择执行动作', trigger: 'change' }]
}

const getTypeText = (type) => {
  const map = { 'time': '时间执行', 'coordinate': '经纬度执行', 'timer': '计时执行' }
  return map[type] || type
}

const getTypeTag = (type) => {
  const map = { 'time': '', 'coordinate': 'success', 'timer': 'warning' }
  return map[type] || ''
}

const getActionText = (action) => {
  const map = { 'on': '开灯', 'off': '关灯', 'dim': '调光' }
  return map[action] || action
}

const getActionTag = (action) => {
  const map = { 'on': 'success', 'off': 'warning', 'dim': '' }
  return map[action] || ''
}

const onTypeChange = () => {
  form.action = 'on'
  form.brightness = 100
}

const showAddDialog = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const editStrategy = (row) => {
  isEdit.value = true
  Object.assign(form, row)
  dialogVisible.value = true
}

const viewDetail = (row) => {
  currentStrategy.value = row
  detailVisible.value = true
}

const deleteStrategy = (row) => {
  ElMessageBox.confirm(`确定要删除策略"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = strategies.value.findIndex(s => s.id === row.id)
    if (index > -1) {
      strategies.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

const toggleStrategy = (row) => {
  ElMessage.success(`策略"${row.name}"已${row.enabled ? '启用' : '禁用'}`)
}

const submitForm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      if (isEdit.value) {
        ElMessage.success('策略修改成功')
      } else {
        const newId = Math.max(...strategies.value.map(s => s.id)) + 1
        strategies.value.push({
          id: newId,
          ...form,
          deviceCount: form.devices.length,
          enabled: true
        })
        ElMessage.success('策略创建成功')
      }
      dialogVisible.value = false
    }
  })
}

const resetForm = () => {
  Object.assign(form, {
    name: '',
    type: 'time',
    action: 'on',
    brightness: 100,
    executeTime: '',
    repeatDays: [],
    latitude: 31.230416,
    longitude: 121.473701,
    sunEvent: 'sunset',
    offset: 0,
    interval: 30,
    startTime: '',
    endTime: '',
    startDate: '',
    endDate: '',
    devices: [],
    description: ''
  })
}
</script>

<style scoped>
.action-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.type-form {
  padding: 15px;
  background: #fafafa;
  border-radius: 4px;
  margin-bottom: 20px;
}
</style>
