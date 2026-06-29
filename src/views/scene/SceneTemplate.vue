<template>
  <div class="page-container">
    <div class="page-header">
      <div class="title">场景模板管理</div>
      <div class="header-actions">
        <el-button type="primary" @click="showAddDialog = true">
          <el-icon><Plus /></el-icon>
          新增模板
        </el-button>
        <el-button type="danger" :disabled="selectedRows.length === 0" @click="batchDelete">
          <el-icon><Delete /></el-icon>
          删除
        </el-button>
        <el-button @click="refreshData">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <div class="filter-bar">
      <el-input
        v-model="filters.name"
        placeholder="请输入模板名称"
        class="filter-input"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select v-model="filters.type" placeholder="请选择模板类型" class="filter-select">
        <el-option label="全部类型" value="" />
        <el-option label="日常照明" value="daily" />
        <el-option label="节假日" value="holiday" />
        <el-option label="应急" value="emergency" />
        <el-option label="节能" value="energy" />
      </el-select>
      <el-button type="primary" @click="searchTemplates">查询</el-button>
      <el-button @click="resetFilters">重置</el-button>
    </div>

    <el-table
      :data="filteredTemplates"
      border
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="50" />
      <el-table-column prop="no" label="序号" width="60" align="center" />
      <el-table-column prop="name" label="模板名称" min-width="180" />
      <el-table-column prop="type" label="模板类型" width="120" align="center">
        <template #default="{ row }">
          <el-tag :type="getTypeTagType(row.type)" size="small">{{ getTypeText(row.type) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="action" label="执行动作" width="120" align="center">
        <template #default="{ row }">
          {{ getActionText(row.action) }}
        </template>
      </el-table-column>
      <el-table-column prop="brightness" label="亮度(%)" width="100" align="center" />
      <el-table-column prop="deviceCount" label="关联设备" width="100" align="center" />
      <el-table-column prop="createTime" label="创建时间" width="160" />
      <el-table-column label="操作" width="280" fixed="right" align="center">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="viewDetail(row)">查看</el-button>
          <el-button type="success" size="small" @click="editTemplate(row)">编辑</el-button>
          <el-button type="warning" size="small" @click="executeTemplate(row)">执行</el-button>
          <el-button type="danger" size="small" @click="deleteTemplate(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 30, 50]"
        layout="total, sizes, prev, pager, next, jumper"
      />
    </div>

    <el-dialog v-model="showAddDialog" :title="isEdit ? '编辑模板' : '新增模板'" width="800px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="模板名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入模板名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模板类型" prop="type">
              <el-select v-model="form.type" placeholder="请选择模板类型" style="width: 100%">
                <el-option label="日常照明" value="daily" />
                <el-option label="节假日" value="holiday" />
                <el-option label="应急" value="emergency" />
                <el-option label="节能" value="energy" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="执行动作" prop="action">
              <el-select v-model="form.action" placeholder="请选择执行动作" style="width: 100%">
                <el-option label="开灯" value="on" />
                <el-option label="关灯" value="off" />
                <el-option label="调光" value="dim" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="亮度值" prop="brightness">
              <el-slider v-model="form.brightness" :min="0" :max="100" show-input />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="模板描述">
          <el-textarea v-model="form.description" rows="3" placeholder="请输入模板描述" />
        </el-form-item>
        <el-form-item label="选择设备">
          <el-select
            v-model="form.deviceIds"
            multiple
            placeholder="请选择设备"
            style="width: 100%"
            size="large"
          >
            <el-option v-for="device in devices" :key="device.id" :label="device.name" :value="device.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showDetailDialog" title="模板详情" width="700px">
      <div v-if="currentTemplate" class="detail-content">
        <el-descriptions :column="2" :data="currentTemplate" border>
          <el-descriptions-item label="模板名称">{{ currentTemplate.name }}</el-descriptions-item>
          <el-descriptions-item label="模板类型">
            <el-tag :type="getTypeTagType(currentTemplate.type)" size="small">{{ getTypeText(currentTemplate.type) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="执行动作">{{ getActionText(currentTemplate.action) }}</el-descriptions-item>
          <el-descriptions-item label="亮度值">{{ currentTemplate.brightness }}%</el-descriptions-item>
          <el-descriptions-item label="关联设备数">{{ currentTemplate.deviceCount }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentTemplate.createTime }}</el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">{{ currentTemplate.description || '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="showDetailDialog = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Plus, Delete, Refresh, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(8)
const showAddDialog = ref(false)
const showDetailDialog = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const selectedRows = ref([])
const currentTemplate = ref(null)

const filters = reactive({
  name: '',
  type: ''
})

const form = reactive({
  name: '',
  type: '',
  action: 'on',
  brightness: 80,
  description: '',
  deviceIds: []
})

const rules = {
  name: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择模板类型', trigger: 'change' }],
  action: [{ required: true, message: '请选择执行动作', trigger: 'change' }]
}

const devices = ref([
  { id: 1, name: '先导路01号灯' },
  { id: 2, name: '先导路02号灯' },
  { id: 3, name: '先导路03号灯' },
  { id: 4, name: '力唯中天1栋大堂灯' },
  { id: 5, name: '力唯中天1栋走廊灯' },
  { id: 6, name: '展厅主灯' },
  { id: 7, name: '展厅侧灯' },
  { id: 8, name: '停车场灯组' }
])

const templates = ref([
  { id: 1, no: 1, name: '日常全亮模式', type: 'daily', action: 'on', brightness: 100, deviceCount: 50, createTime: '2024-01-15 10:00:00', description: '日常全亮照明模板' },
  { id: 2, no: 2, name: '节能调光模式', type: 'energy', action: 'dim', brightness: 60, deviceCount: 50, createTime: '2024-01-16 14:30:00', description: '夜间节能调光，亮度60%' },
  { id: 3, no: 3, name: '深夜省电模式', type: 'energy', action: 'dim', brightness: 30, deviceCount: 30, createTime: '2024-01-17 09:00:00', description: '凌晨2点后自动降低亮度' },
  { id: 4, no: 4, name: '节假日装饰模式', type: 'holiday', action: 'on', brightness: 100, deviceCount: 20, createTime: '2024-01-20 11:00:00', description: '节假日全亮装饰照明' },
  { id: 5, no: 5, name: '应急照明模式', type: 'emergency', action: 'on', brightness: 100, deviceCount: 100, createTime: '2024-02-01 16:00:00', description: '紧急情况全亮照明' },
  { id: 6, no: 6, name: '夜间巡检模式', type: 'daily', action: 'dim', brightness: 70, deviceCount: 80, createTime: '2024-02-10 10:30:00', description: '夜间巡检时的照明模式' },
  { id: 7, no: 7, name: '下班关灯模式', type: 'daily', action: 'off', brightness: 0, deviceCount: 25, createTime: '2024-02-15 15:00:00', description: '下班时间自动关灯' },
  { id: 8, no: 8, name: '周末节能模式', type: 'energy', action: 'dim', brightness: 50, deviceCount: 40, createTime: '2024-03-01 09:00:00', description: '周末人流量减少时节能' }
])

const filteredTemplates = computed(() => {
  let result = templates.value
  if (filters.name) {
    result = result.filter(t => t.name.includes(filters.name))
  }
  if (filters.type) {
    result = result.filter(t => t.type === filters.type)
  }
  return result
})

const getTypeText = (type) => {
  const map = { daily: '日常照明', holiday: '节假日', emergency: '应急', energy: '节能' }
  return map[type] || type
}

const getTypeTagType = (type) => {
  const map = { daily: 'primary', holiday: 'success', emergency: 'danger', energy: 'warning' }
  return map[type] || ''
}

const getActionText = (action) => {
  const map = { on: '开灯', off: '关灯', dim: '调光' }
  return map[action] || action
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const searchTemplates = () => {
  currentPage.value = 1
  ElMessage.success('查询成功')
}

const resetFilters = () => {
  Object.assign(filters, { name: '', type: '' })
  currentPage.value = 1
}

const refreshData = () => {
  ElMessage.success('数据已刷新')
}

const batchDelete = () => {
  ElMessageBox.confirm(`确定要删除选中的${selectedRows.value.length}个模板吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const selectedIds = selectedRows.value.map(t => t.id)
    templates.value = templates.value.filter(t => !selectedIds.includes(t.id))
    total.value = templates.value.length
    selectedRows.value = []
    ElMessage.success('批量删除成功')
  }).catch(() => {})
}

const editTemplate = (row) => {
  isEdit.value = true
  Object.assign(form, {
    name: row.name,
    type: row.type,
    action: row.action,
    brightness: row.brightness,
    description: row.description,
    deviceIds: []
  })
  showAddDialog.value = true
}

const deleteTemplate = (row) => {
  ElMessageBox.confirm(`确定要删除模板"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = templates.value.findIndex(t => t.id === row.id)
    if (index > -1) {
      templates.value.splice(index, 1)
      total.value--
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

const submitForm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      if (isEdit.value) {
        const index = templates.value.findIndex(t => t.id === currentTemplate.value.id)
        if (index > -1) {
          templates.value[index] = {
            ...templates.value[index],
            ...form,
            deviceCount: form.deviceIds.length
          }
        }
        ElMessage.success('模板修改成功')
      } else {
        const newId = Math.max(...templates.value.map(t => t.id)) + 1
        templates.value.push({
          id: newId,
          no: templates.value.length + 1,
          ...form,
          deviceCount: form.deviceIds.length,
          createTime: new Date().toLocaleString()
        })
        total.value++
        ElMessage.success('模板添加成功')
      }
      showAddDialog.value = false
      isEdit.value = false
      resetForm()
    }
  })
}

const resetForm = () => {
  Object.assign(form, { name: '', type: '', action: 'on', brightness: 80, description: '', deviceIds: [] })
}

const viewDetail = (row) => {
  currentTemplate.value = row
  showDetailDialog.value = true
}

const executeTemplate = (row) => {
  ElMessageBox.confirm(`确定要执行模板"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    ElMessage.success(`模板"${row.name}"已执行`)
  }).catch(() => {})
}
</script>

<style scoped>
.page-container {
  padding: 20px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e8e8e8;
}

.page-header .title {
  font-size: 18px;
  font-weight: 600;
  color: #1f1f1f;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  padding: 15px;
  background: #fafafa;
  border-radius: 4px;
  flex-wrap: wrap;
}

.filter-input {
  width: 220px;
}

.filter-select {
  width: 160px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.detail-content {
  padding: 10px;
}
</style>