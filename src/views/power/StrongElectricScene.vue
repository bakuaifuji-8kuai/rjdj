<template>
  <div class="page-container">
    <div class="toolbar">
      <el-button type="primary" @click="handleAdd">新增</el-button>
      <el-button @click="handleLightSensor">光感策略</el-button>
      <el-button type="success" :disabled="selectedRows.length === 0" @click="handleDeploy">下发</el-button>
      <el-button type="danger" :disabled="selectedRows.length === 0" @click="handleDelete">删除</el-button>
    </div>
    
    <div class="filter-bar">
      <el-input v-model="filters.name" placeholder="请输入场景名称" class="filter-input" clearable>
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select v-model="filters.type" placeholder="请选择场景类型" class="filter-select" clearable>
        <el-option label="定时场景" value="timer" />
        <el-option label="光感场景" value="light" />
      </el-select>
      <el-button type="primary" @click="searchScenes">查询</el-button>
      <el-button @click="resetFilters">重置</el-button>
    </div>

    <el-table 
      :data="filteredScenes" 
      border 
      class="scene-table"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="50" />
      <el-table-column prop="no" label="No" width="70" align="center" />
      <el-table-column prop="name" label="场景名称" min-width="180" />
      <el-table-column prop="type" label="场景类型" width="120" align="center">
        <template #default="{ row }">
          <el-tag :type="row.type === 'timer' ? 'primary' : 'success'" size="small">
            {{ row.type === 'timer' ? '定时场景' : '光感场景' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
            {{ row.status === 'active' ? '已启用' : '未启用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="deployCount" label="下发次数" width="100" align="center" />
      <el-table-column prop="creator" label="创建人" width="120" />
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="操作" width="220" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button type="warning" size="small" @click="handleView(row)">详情</el-button>
          <el-button type="danger" size="small" @click="handleDeleteOne(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
      />
    </div>

    <!-- 新增/编辑场景弹窗 -->
    <el-dialog 
      :title="isEdit ? '编辑场景' : '新增场景'" 
      v-model="showSceneDialog" 
      width="700px"
      :close-on-click-modal="false"
    >
      <el-form :model="sceneForm" :rules="sceneRules" ref="sceneFormRef" label-width="100px">
        <el-form-item label="场景名称" prop="name">
          <el-input v-model="sceneForm.name" placeholder="请输入场景名称" />
        </el-form-item>
        <el-form-item label="场景类型" prop="type">
          <el-radio-group v-model="sceneForm.type" @change="handleTypeChange">
            <el-radio value="timer">定时场景</el-radio>
            <el-radio value="light">光感场景</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <!-- 定时场景配置 -->
        <template v-if="sceneForm.type === 'timer'">
          <el-divider content-position="left">定时动作配置</el-divider>
          <div class="timer-actions">
            <div v-for="(action, index) in sceneForm.actions" :key="index" class="action-item">
              <el-row :gutter="10">
                <el-col :span="5">
                  <el-select v-model="action.type" placeholder="动作类型" style="width: 100%">
                    <el-option label="开灯" value="on" />
                    <el-option label="关灯" value="off" />
                  </el-select>
                </el-col>
                <el-col :span="6">
                  <el-time-picker
                    v-model="action.time"
                    placeholder="执行时间"
                    format="HH:mm"
                    value-format="HH:mm"
                    style="width: 100%"
                  />
                </el-col>
                <el-col :span="11">
                  <el-checkbox-group v-model="action.weekDays" size="small">
                    <el-checkbox label="1">周一</el-checkbox>
                    <el-checkbox label="2">周二</el-checkbox>
                    <el-checkbox label="3">周三</el-checkbox>
                    <el-checkbox label="4">周四</el-checkbox>
                    <el-checkbox label="5">周五</el-checkbox>
                    <el-checkbox label="6">周六</el-checkbox>
                    <el-checkbox label="0">周日</el-checkbox>
                  </el-checkbox-group>
                </el-col>
                <el-col :span="2">
                  <el-button type="danger" icon="Delete" @click="removeAction(index)" circle size="small" />
                </el-col>
              </el-row>
            </div>
            <el-button type="primary" plain @click="addAction" style="width: 100%">+ 添加动作</el-button>
          </div>
        </template>
        
        <!-- 光感场景配置 -->
        <template v-if="sceneForm.type === 'light'">
          <el-divider content-position="left">光感策略配置</el-divider>
          <el-form-item label="光感阈值">
            <el-input-number v-model="sceneForm.lightThreshold" :min="0" :max="1000" placeholder="光照阈值 (lux)" />
            <span class="unit">lux</span>
          </el-form-item>
          <el-form-item label="触发动作">
            <el-select v-model="sceneForm.lightAction" placeholder="选择触发动作">
              <el-option label="开灯" value="on" />
              <el-option label="关灯" value="off" />
            </el-select>
          </el-form-item>
          <el-form-item label="生效时段">
            <el-time-picker
              v-model="sceneForm.lightTimeRange"
              is-range
              placeholder="开始时间 - 结束时间"
              format="HH:mm"
              value-format="HH:mm"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              style="width: 100%"
            />
          </el-form-item>
        </template>

        <el-divider content-position="left">关联设备</el-divider>
        <el-form-item label="选择设备">
          <el-transfer
            v-model="sceneForm.devices"
            :data="deviceOptions"
            :titles="['可选设备', '已选设备']"
            filterable
            filter-placeholder="搜索设备"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showSceneDialog = false">取消</el-button>
        <el-button type="primary" @click="submitScene">确定</el-button>
      </template>
    </el-dialog>

    <!-- 详情弹窗 -->
    <el-dialog title="场景详情" v-model="showDetailDialog" width="600px">
      <div class="detail-content" v-if="currentScene">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="场景名称">{{ currentScene.name }}</el-descriptions-item>
          <el-descriptions-item label="场景类型">
            <el-tag :type="currentScene.type === 'timer' ? 'primary' : 'success'" size="small">
              {{ currentScene.type === 'timer' ? '定时场景' : '光感场景' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentScene.status === 'active' ? 'success' : 'info'" size="small">
              {{ currentScene.status === 'active' ? '已启用' : '未启用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建人">{{ currentScene.creator }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentScene.createTime }}</el-descriptions-item>
        </el-descriptions>
        
        <el-divider content-position="left" style="margin-top: 20px">策略配置</el-divider>
        <div v-if="currentScene.type === 'timer'" class="timer-detail">
          <div v-for="(action, index) in currentScene.actions" :key="index" class="action-detail">
            <span class="action-no">动作 {{ index + 1 }}：</span>
            <el-tag size="small">{{ action.type === 'on' ? '开灯' : '关灯' }}</el-tag>
            <span>，执行时间：{{ action.time }}</span>
            <span>，执行星期：{{ action.weekDaysText }}</span>
          </div>
        </div>
        <div v-else class="light-detail">
          <div>光感阈值：{{ currentScene.lightThreshold }} lux</div>
          <div>触发动作：{{ currentScene.lightAction === 'on' ? '开灯' : '关灯' }}</div>
          <div>生效时段：{{ currentScene.lightTimeRange[0] }} 至 {{ currentScene.lightTimeRange[1] }}</div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Search, Plus, Delete, Clock, Sunrise, Download } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const selectedRows = ref([])
const showSceneDialog = ref(false)
const showDetailDialog = ref(false)
const isEdit = ref(false)
const currentScene = ref(null)
const sceneFormRef = ref(null)

const filters = reactive({
  name: '',
  type: ''
})

const weekDayMap = {
  '0': '周日',
  '1': '周一',
  '2': '周二',
  '3': '周三',
  '4': '周四',
  '5': '周五',
  '6': '周六'
}

const scenes = ref([
  {
    id: 1,
    no: 1,
    name: '夜间照明场景',
    type: 'timer',
    status: 'active',
    deployCount: 15,
    creator: '管理员',
    createTime: '2026-05-10 10:00:00',
    actions: [
      { type: 'on', time: '18:00', weekDays: ['1', '2', '3', '4', '5'] },
      { type: 'off', time: '06:00', weekDays: ['1', '2', '3', '4', '5'] }
    ]
  },
  {
    id: 2,
    no: 2,
    name: '周末照明场景',
    type: 'timer',
    status: 'active',
    deployCount: 8,
    creator: '管理员',
    createTime: '2026-05-12 14:30:00',
    actions: [
      { type: 'on', time: '19:00', weekDays: ['6', '0'] },
      { type: 'off', time: '07:00', weekDays: ['6', '0'] }
    ]
  },
  {
    id: 3,
    no: 3,
    name: '阴天自动照明',
    type: 'light',
    status: 'inactive',
    deployCount: 5,
    creator: '管理员',
    createTime: '2026-05-13 09:00:00',
    lightThreshold: 200,
    lightAction: 'on',
    lightTimeRange: ['06:00', '20:00']
  },
  {
    id: 4,
    no: 4,
    name: '强光自动关闭',
    type: 'light',
    status: 'active',
    deployCount: 3,
    creator: '管理员',
    createTime: '2026-05-14 16:00:00',
    lightThreshold: 800,
    lightAction: 'off',
    lightTimeRange: ['08:00', '18:00']
  }
])

total.value = scenes.value.length

const deviceOptions = ref([
  { key: 1, label: '先导路集控1' },
  { key: 2, label: '先导路集控2' },
  { key: 3, label: '先导路集控1' },
  { key: 4, label: '先导路集控2' }
])

const sceneForm = reactive({
  name: '',
  type: 'timer',
  actions: [
    { type: 'on', time: '18:00', weekDays: ['1', '2', '3', '4', '5', '6', '0'] }
  ],
  lightThreshold: 200,
  lightAction: 'on',
  lightTimeRange: ['06:00', '22:00'],
  devices: []
})

const sceneRules = {
  name: [{ required: true, message: '请输入场景名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择场景类型', trigger: 'change' }]
}

const filteredScenes = computed(() => {
  let result = scenes.value
  if (filters.name) {
    result = result.filter(s => s.name.includes(filters.name))
  }
  if (filters.type) {
    result = result.filter(s => s.type === filters.type)
  }
  return result
})

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const searchScenes = () => {
  currentPage.value = 1
  ElMessage.success('查询成功')
}

const resetFilters = () => {
  Object.assign(filters, { name: '', type: '' })
  currentPage.value = 1
}

const handleAdd = () => {
  isEdit.value = false
  resetSceneForm()
  showSceneDialog.value = true
}

const handleLightSensor = () => {
  isEdit.value = false
  resetSceneForm()
  sceneForm.type = 'light'
  showSceneDialog.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(sceneForm, {
    name: row.name,
    type: row.type,
    actions: row.type === 'timer' ? JSON.parse(JSON.stringify(row.actions)) : [],
    lightThreshold: row.lightThreshold || 200,
    lightAction: row.lightAction || 'on',
    lightTimeRange: row.lightTimeRange || ['06:00', '22:00'],
    devices: []
  })
  showSceneDialog.value = true
}

const handleView = (row) => {
  currentScene.value = {
    ...row,
    actions: row.actions ? row.actions.map(a => ({
      ...a,
      weekDaysText: a.weekDays.map(d => weekDayMap[d]).join('、')
    })) : []
  }
  showDetailDialog.value = true
}

const handleDeploy = () => {
  ElMessageBox.confirm(
    `确定要下发选中的 ${selectedRows.value.length} 个场景吗？`,
    '场景下发',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const deployTime = new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/\//g, '-')
    
    const selectedCount = selectedRows.value.length
    const historyList = JSON.parse(localStorage.getItem('sceneDeployHistory') || '[]')
    const startNo = historyList.length + 1
    
    selectedRows.value.forEach((scene, index) => {
      const historyRecord = {
        no: startNo + index,
        sceneName: scene.name,
        operator: '管理员',
        deployTime: deployTime,
        sceneId: scene.id,
        type: scene.type
      }
      
      historyList.unshift(historyRecord)
    })
    
    localStorage.setItem('sceneDeployHistory', JSON.stringify(historyList))
    
    selectedRows.value.forEach(scene => {
      const sceneIndex = scenes.value.findIndex(s => s.id === scene.id)
      if (sceneIndex > -1) {
        scenes.value[sceneIndex].deployCount++
      }
    })
    
    selectedRows.value = []
    ElMessage.success(`成功下发 ${selectedCount} 个场景`)
  })
}

const handleDelete = () => {
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedRows.value.length} 个场景吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('删除成功')
  })
}

const handleDeleteOne = (row) => {
  ElMessageBox.confirm(
    `确定要删除场景【${row.name}】吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('删除成功')
  })
}

const submitScene = () => {
  sceneFormRef.value.validate((valid) => {
    if (valid) {
      if (sceneForm.type === 'timer' && sceneForm.actions.length === 0) {
        ElMessage.warning('请至少添加一个定时动作')
        return
      }
      ElMessage.success(isEdit.value ? '编辑成功' : '创建成功')
      showSceneDialog.value = false
    }
  })
}

const addAction = () => {
  sceneForm.actions.push({
    type: 'on',
    time: '18:00',
    weekDays: ['1', '2', '3', '4', '5', '6', '0']
  })
}

const removeAction = (index) => {
  if (sceneForm.actions.length > 1) {
    sceneForm.actions.splice(index, 1)
  } else {
    ElMessage.warning('至少保留一个动作')
  }
}

const handleTypeChange = () => {
  if (sceneForm.type === 'timer') {
    sceneForm.actions = [{ type: 'on', time: '18:00', weekDays: ['1', '2', '3', '4', '5', '6', '0'] }]
  }
}

const resetSceneForm = () => {
  Object.assign(sceneForm, {
    name: '',
    type: 'timer',
    actions: [
      { type: 'on', time: '18:00', weekDays: ['1', '2', '3', '4', '5', '6', '0'] }
    ],
    lightThreshold: 200,
    lightAction: 'on',
    lightTimeRange: ['06:00', '22:00'],
    devices: []
  })
}
</script>

<style scoped>
.page-container {
  padding: 20px;
  background: #f0f2f5;
  min-height: 100%;
}

.toolbar {
  margin-bottom: 20px;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-select {
  width: 150px;
}

.filter-input {
  width: 200px;
}

.scene-table {
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.timer-actions {
  width: 100%;
}

.action-item {
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 10px;
}

.unit {
  margin-left: 10px;
  color: #606266;
}

.detail-content {
  padding: 10px 0;
}

.timer-detail,
.light-detail {
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
}

.action-detail {
  margin-bottom: 10px;
}

.action-no {
  font-weight: 600;
  color: #303133;
}

.action-detail span {
  margin-right: 10px;
}
</style>