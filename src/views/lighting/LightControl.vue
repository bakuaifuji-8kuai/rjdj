<template>
  <div class="page-container">
    <div class="page-header">
      <div class="title">远程控制</div>
      <div class="header-actions">
        <el-button type="primary" @click="batchControl">
          <component :is="icons.Batch" />
          批量控制
        </el-button>
      </div>
    </div>
    <div class="control-section">
      <div class="section-title">区域选择</div>
      <div class="area-selector">
        <div 
          v-for="area in areas" 
          :key="area.id"
          :class="['area-card', { active: selectedArea === area.id }]"
          @click="selectArea(area.id)"
        >
          <component :is="area.icon" class="area-icon" />
          <span class="area-name">{{ area.name }}</span>
          <span class="area-count">{{ getAreaCount(area.id) }}盏</span>
        </div>
      </div>
    </div>
    <div class="control-section">
      <div class="section-title">控制操作</div>
      <div class="control-panel">
        <div class="control-row">
          <div class="control-btn-group">
            <el-button type="primary" size="large" @click="controlAll('on')">
              <component :is="icons.Power" />
              全部开启
            </el-button>
            <el-button size="large" @click="controlAll('off')">
              <component :is="icons.PowerOff" />
              全部关闭
            </el-button>
          </div>
        </div>
        <div class="control-row">
          <div class="brightness-control">
            <span class="control-label">亮度调节</span>
            <div class="brightness-slider">
              <el-slider 
                v-model="brightnessValue" 
                :min="0" 
                :max="100" 
                :step="5"
                @change="onBrightnessChange"
              />
              <span class="brightness-value">{{ brightnessValue }}%</span>
            </div>
            <div class="quick-buttons">
              <el-button v-for="level in brightnessLevels" :key="level" @click="setBrightness(level)">
                {{ level }}%
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="control-section">
      <div class="section-title">路灯列表</div>
      <el-table :data="filteredLights" border class="data-table">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="设备编号" width="100" />
        <el-table-column prop="name" label="路灯名称" />
        <el-table-column prop="location" label="安装位置" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="brightness" label="亮度(%)" width="100" />
        <el-table-column prop="power" label="功率(W)" width="100" />
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button 
              size="small" 
              :type="scope.row.status === 'on' ? 'default' : 'primary'"
              @click="toggleLight(scope.row)"
            >
              {{ scope.row.status === 'on' ? '关闭' : '开启' }}
            </el-button>
            <el-button size="small" @click="adjustBrightness(scope.row)">调亮度</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-dialog title="亮度调节" :visible.sync="brightnessDialogVisible" width="400px">
      <div v-if="currentLight" class="brightness-dialog">
        <div class="light-info">{{ currentLight.name }}</div>
        <el-slider 
          v-model="currentBrightness" 
          :min="0" 
          :max="100" 
          :step="1"
          show-input
        />
      </div>
      <template #footer>
        <el-button @click="brightnessDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmBrightness">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { VideoPlay, VideoPause, Grid, MapLocation } from '@element-plus/icons-vue'
import { lightStatusData } from '@/data/mockData'

const icons = { Power: VideoPlay, PowerOff: VideoPause, Batch: Grid, MapPin: MapLocation }
const selectedArea = ref('all')
const brightnessValue = ref(80)
const brightnessDialogVisible = ref(false)
const currentLight = ref(null)
const currentBrightness = ref(80)
const selectedLights = ref([])

const areas = [
  { id: 'all', name: '全部区域', icon: MapLocation },
  { id: 'zhongshan', name: '中山路', icon: MapLocation },
  { id: 'renmin', name: '人民路', icon: MapLocation },
  { id: 'jiefang', name: '解放路', icon: MapLocation },
  { id: 'gongyuan', name: '公园路', icon: MapLocation },
  { id: 'wenhua', name: '文化路', icon: MapLocation }
]

const brightnessLevels = [30, 50, 70, 85, 100]

const tableData = ref([...lightStatusData])

const filteredLights = computed(() => {
  if (selectedArea.value === 'all') return tableData.value
  const areaMap = {
    zhongshan: '中山路',
    renmin: '人民路',
    jiefang: '解放路',
    gongyuan: '公园路',
    wenhua: '文化路'
  }
  return tableData.value.filter(item => item.location.includes(areaMap[selectedArea.value]))
})

const getAreaCount = (areaId) => {
  if (areaId === 'all') return tableData.value.length
  const areaMap = {
    zhongshan: '中山路',
    renmin: '人民路',
    jiefang: '解放路',
    gongyuan: '公园路',
    wenhua: '文化路'
  }
  return tableData.value.filter(item => item.location.includes(areaMap[areaId])).length
}

const getStatusTagType = (status) => {
  switch (status) {
    case 'on': return 'success'
    case 'off': return 'info'
    case 'fault': return 'danger'
    default: return 'info'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'on': return '开启'
    case 'off': return '关闭'
    case 'fault': return '故障'
    default: return status
  }
}

const selectArea = (areaId) => {
  selectedArea.value = areaId
}

const controlAll = (action) => {
  filteredLights.value.forEach(light => {
    if (light.status !== 'fault') {
      light.status = action
      light.brightness = action === 'on' ? brightnessValue.value : 0
    }
  })
}

const toggleLight = (row) => {
  if (row.status === 'fault') return
  row.status = row.status === 'on' ? 'off' : 'on'
  row.brightness = row.status === 'on' ? brightnessValue.value : 0
}

const onBrightnessChange = (val) => {
  filteredLights.value.forEach(light => {
    if (light.status === 'on') {
      light.brightness = val
    }
  })
}

const setBrightness = (level) => {
  brightnessValue.value = level
  onBrightnessChange(level)
}

const adjustBrightness = (row) => {
  if (row.status === 'fault') return
  currentLight.value = row
  currentBrightness.value = row.brightness
  brightnessDialogVisible.value = true
}

const confirmBrightness = () => {
  if (currentLight.value && currentLight.value.status !== 'fault') {
    currentLight.value.brightness = currentBrightness.value
    if (currentLight.value.status === 'off') {
      currentLight.value.status = 'on'
    }
  }
  brightnessDialogVisible.value = false
}

const batchControl = () => {
  selectedLights.value.forEach(id => {
    const light = tableData.value.find(l => l.id === id)
    if (light && light.status !== 'fault') {
      light.status = 'on'
      light.brightness = brightnessValue.value
    }
  })
}
</script>

<style scoped>
.control-section {
  margin-bottom: 25px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #333;
}

.area-selector {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.area-card {
  flex: 0 0 calc(16.666% - 12px);
  min-width: 120px;
  padding: 20px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
  
  &:hover {
    border-color: #1890ff;
    background: #f0f7ff;
  }
  
  &.active {
    border-color: #1890ff;
    background: #e6f7ff;
  }
}

.area-icon {
  font-size: 24px;
  color: #1890ff;
  margin-bottom: 8px;
}

.area-name {
  display: block;
  font-size: 14px;
  color: #333;
}

.area-count {
  display: block;
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.control-panel {
  background: #fafafa;
  padding: 20px;
  border-radius: 8px;
}

.control-row {
  margin-bottom: 20px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.control-btn-group {
  display: flex;
  gap: 15px;
}

.brightness-control {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.control-label {
  font-weight: 500;
  color: #666;
}

.brightness-slider {
  display: flex;
  align-items: center;
  gap: 15px;
}

.brightness-value {
  font-weight: 600;
  color: #1890ff;
  min-width: 60px;
}

.quick-buttons {
  display: flex;
  gap: 10px;
}

.data-table {
  width: 100%;
}

.brightness-dialog {
  padding: 20px 0;
}

.light-info {
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
}
</style>
