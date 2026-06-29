<template>
  <div class="page-container">
    <div class="page-header">
      <div class="title">GIS地图</div>
      <div class="header-actions">
        <el-input
          v-model="searchText"
          placeholder="按IMEI号或名称搜索"
          style="width: 200px; margin-right: 10px;"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button @click="refreshMap">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <div class="map-container">
      <div class="map-toolbar">
        <div class="toolbar-left">
          <el-radio-group v-model="statusFilter" size="default">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="on">开灯</el-radio-button>
            <el-radio-button label="off">关灯</el-radio-button>
            <el-radio-button label="alert">告警</el-radio-button>
            <el-radio-button label="offline">离线</el-radio-button>
          </el-radio-group>
        </div>
        <div class="toolbar-right">
          <el-radio-group v-model="mapMode" size="small">
            <el-radio-button label="satellite">卫星</el-radio-button>
            <el-radio-button label="2d">2D</el-radio-button>
            <el-radio-button label="3d">3D</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <div class="map-content">
        <div class="map-area">
          <div class="map-placeholder">
            <div class="map-grid">
              <div
                v-for="(light, index) in filteredLights"
                :key="light.id"
                class="map-light"
                :class="getLightClass(light.status)"
                :style="getLightPosition(index)"
                @click="showLightDetail(light)"
              >
                <div class="light-icon">
                  <el-icon><Sunrise /></el-icon>
                </div>
                <div class="light-info">
                  <span class="light-name">{{ light.name }}</span>
                  <span class="light-status">{{ getStatusText(light.status) }}</span>
                </div>
              </div>
            </div>
            <div class="map-legend">
              <div class="legend-title">图例</div>
              <div class="legend-items">
                <div class="legend-item">
                  <span class="legend-dot online"></span>
                  <span>在线开灯</span>
                </div>
                <div class="legend-item">
                  <span class="legend-dot offline-off"></span>
                  <span>在线关灯</span>
                </div>
                <div class="legend-item">
                  <span class="legend-dot alert"></span>
                  <span>告警</span>
                </div>
                <div class="legend-item">
                  <span class="legend-dot offline"></span>
                  <span>离线</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="map-sidebar">
          <div class="sidebar-section">
            <div class="section-title">设备统计</div>
            <div class="stat-list">
              <div class="stat-item">
                <span class="stat-dot online"></span>
                <span class="stat-label">在线</span>
                <span class="stat-value">{{ stats.online }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-dot offline"></span>
                <span class="stat-label">离线</span>
                <span class="stat-value">{{ stats.offline }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-dot alert"></span>
                <span class="stat-label">告警</span>
                <span class="stat-value">{{ stats.alert }}</span>
              </div>
            </div>
          </div>

          <div class="sidebar-section">
            <div class="section-title">快捷操作</div>
            <div class="quick-actions">
              <el-button type="primary" size="small" @click="batchControl('on')">
                <el-icon><Sunrise /></el-icon>
                批量开灯
              </el-button>
              <el-button type="danger" size="small" @click="batchControl('off')">
                <el-icon><Moon /></el-icon>
                批量关灯
              </el-button>
              <el-button size="small" @click="showTimedControl = true">
                <el-icon><Timer /></el-icon>
                定时控制
              </el-button>
            </div>
          </div>

          <div class="sidebar-section">
            <div class="section-title">选中设备信息</div>
            <div v-if="selectedLight" class="device-info">
              <div class="info-item">
                <span class="info-label">设备名称</span>
                <span class="info-value">{{ selectedLight.name }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">IMEI号</span>
                <span class="info-value">{{ selectedLight.imei }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">状态</span>
                <span class="info-value" :class="'status-' + selectedLight.status">
                  {{ getStatusText(selectedLight.status) }}
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">亮度</span>
                <span class="info-value">{{ selectedLight.brightness }}%</span>
              </div>
              <div class="info-item">
                <span class="info-label">电压</span>
                <span class="info-value">{{ selectedLight.voltage }}V</span>
              </div>
              <div class="info-item">
                <span class="info-label">电流</span>
                <span class="info-value">{{ selectedLight.current }}A</span>
              </div>
              <div class="info-item">
                <span class="info-label">功率</span>
                <span class="info-value">{{ selectedLight.power }}W</span>
              </div>
              <div class="action-buttons">
                <el-button type="primary" size="small" @click="controlLight(selectedLight, 'on')">
                  开灯
                </el-button>
                <el-button type="danger" size="small" @click="controlLight(selectedLight, 'off')">
                  关灯
                </el-button>
                <el-button size="small" @click="showBrightnessDialog(selectedLight)">
                  调光
                </el-button>
              </div>
            </div>
            <div v-else class="no-selection">
              <span>点击地图上的路灯查看详情</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-dialog v-model="showTimedControl" title="定时控制" width="500px">
      <el-form :model="timedForm" label-width="100px">
        <el-form-item label="控制类型">
          <el-radio-group v-model="timedForm.type">
            <el-radio label="on">开灯</el-radio>
            <el-radio label="off">关灯</el-radio>
            <el-radio label="dim">调光</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="执行时间">
          <el-time-picker v-model="timedForm.time" format="HH:mm" placeholder="选择时间" style="width: 100%;" />
        </el-form-item>
        <el-form-item v-if="timedForm.type === 'dim'" label="亮度值">
          <el-slider v-model="timedForm.brightness" :min="0" :max="100" show-input />
        </el-form-item>
        <el-form-item label="重复">
          <el-checkbox-group v-model="timedForm.days">
            <el-checkbox label="1">周一</el-checkbox>
            <el-checkbox label="2">周二</el-checkbox>
            <el-checkbox label="3">周三</el-checkbox>
            <el-checkbox label="4">周四</el-checkbox>
            <el-checkbox label="5">周五</el-checkbox>
            <el-checkbox label="6">周六</el-checkbox>
            <el-checkbox label="0">周日</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showTimedControl = false">取消</el-button>
        <el-button type="primary" @click="submitTimedControl">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showBrightness" title="亮度调节" width="400px">
      <div class="brightness-control">
        <el-slider v-model="brightnessValue" :min="0" :max="100" show-input />
      </div>
      <template #footer>
        <el-button @click="showBrightness = false">取消</el-button>
        <el-button type="primary" @click="submitBrightness">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { Search, Refresh, Sunrise, Moon, Timer } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const searchText = ref('')
const statusFilter = ref('all')
const mapMode = ref('2d')
const selectedLight = ref(null)
const showTimedControl = ref(false)
const showBrightness = ref(false)
const brightnessValue = ref(80)

const timedForm = reactive({
  type: 'on',
  time: '',
  brightness: 80,
  days: []
})

const lights = ref([
  { id: 1, name: '中山路01号灯', imei: '861234567890001', status: 'online-on', brightness: 100, voltage: 220, current: 2.5, power: 550, x: 10, y: 15 },
  { id: 2, name: '中山路02号灯', imei: '861234567890002', status: 'online-on', brightness: 80, voltage: 218, current: 2.0, power: 440, x: 25, y: 15 },
  { id: 3, name: '人民路01号灯', imei: '861234567890003', status: 'online-off', brightness: 0, voltage: 220, current: 0, power: 0, x: 40, y: 30 },
  { id: 4, name: '人民路02号灯', imei: '861234567890004', status: 'alert', brightness: 60, voltage: 180, current: 1.5, power: 330, x: 55, y: 30 },
  { id: 5, name: '解放路01号灯', imei: '861234567890005', status: 'offline', brightness: 0, voltage: 0, current: 0, power: 0, x: 70, y: 45 },
  { id: 6, name: '解放路02号灯', imei: '861234567890006', status: 'online-on', brightness: 90, voltage: 219, current: 2.2, power: 484, x: 85, y: 45 },
  { id: 7, name: '公园路01号灯', imei: '861234567890007', status: 'online-on', brightness: 70, voltage: 221, current: 1.8, power: 396, x: 15, y: 60 },
  { id: 8, name: '公园路02号灯', imei: '861234567890008', status: 'online-off', brightness: 0, voltage: 220, current: 0, power: 0, x: 30, y: 60 },
  { id: 9, name: '文化路01号灯', imei: '861234567890009', status: 'alert', brightness: 50, voltage: 160, current: 1.2, power: 264, x: 45, y: 75 },
  { id: 10, name: '文化路02号灯', imei: '861234567890010', status: 'online-on', brightness: 100, voltage: 220, current: 2.5, power: 550, x: 60, y: 75 }
])

const stats = computed(() => {
  const result = { online: 0, offline: 0, alert: 0 }
  lights.value.forEach(light => {
    if (light.status === 'offline') result.offline++
    else if (light.status === 'alert') result.alert++
    else result.online++
  })
  return result
})

const filteredLights = computed(() => {
  if (!searchText.value) {
    if (statusFilter.value === 'all') return lights.value
    return lights.value.filter(l => l.status.startsWith(statusFilter.value))
  }
  return lights.value.filter(l => 
    l.name.includes(searchText.value) || l.imei.includes(searchText.value)
  )
})

const getLightClass = (status) => {
  const classMap = {
    'online-on': 'light-on',
    'online-off': 'light-off',
    'alert': 'light-alert',
    'offline': 'light-offline'
  }
  return classMap[status] || ''
}

const getLightPosition = (index) => {
  const light = filteredLights.value[index]
  if (light) {
    return { left: light.x + '%', top: light.y + '%' }
  }
  return {}
}

const getStatusText = (status) => {
  const textMap = {
    'online-on': '在线-开灯',
    'online-off': '在线-关灯',
    'alert': '告警',
    'offline': '离线'
  }
  return textMap[status] || status
}

const showLightDetail = (light) => {
  selectedLight.value = light
}

const controlLight = (light, action) => {
  if (action === 'on') {
    light.status = 'online-on'
  } else {
    light.status = 'online-off'
  }
}

const showBrightnessDialog = (light) => {
  brightnessValue.value = light.brightness
  showBrightness.value = true
}

const submitBrightness = () => {
  if (selectedLight.value) {
    selectedLight.value.brightness = brightnessValue.value
    if (brightnessValue.value > 0) {
      selectedLight.value.status = 'online-on'
    } else {
      selectedLight.value.status = 'online-off'
    }
  }
  showBrightness.value = false
}

const batchControl = (action) => {
  lights.value.forEach(light => {
    if (light.status !== 'offline') {
      if (action === 'on') {
        light.status = 'online-on'
      } else {
        light.status = 'online-off'
      }
    }
  })
}

const submitTimedControl = () => {
  console.log('定时控制配置:', timedForm)
  showTimedControl.value = false
  ElMessage.success('定时控制已设置')
}

const refreshMap = () => {
  console.log('刷新地图')
}
</script>

<style scoped>
.map-container {
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.map-toolbar {
  padding: 15px 20px;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.map-content {
  display: flex;
  height: calc(100vh - 300px);
}

.map-area {
  flex: 1;
  position: relative;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
}

.map-placeholder {
  width: 100%;
  height: 100%;
  position: relative;
}

.map-grid {
  width: 100%;
  height: 100%;
  position: relative;
}

.map-light {
  position: absolute;
  transform: translate(-50%, -50%);
  cursor: pointer;
  transition: transform 0.2s;
}

.map-light:hover {
  transform: translate(-50%, -50%) scale(1.1);
}

.light-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-bottom: 5px;
}

.light-on .light-icon {
  background: #52c41a;
  color: #fff;
  box-shadow: 0 0 10px rgba(82, 196, 26, 0.5);
}

.light-off .light-icon {
  background: #d9d9d9;
  color: #666;
}

.light-alert .light-icon {
  background: #f5222d;
  color: #fff;
  animation: blink 1s infinite;
}

.light-offline .light-icon {
  background: #8c8c8c;
  color: #fff;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.light-info {
  text-align: center;
  font-size: 12px;
}

.light-name {
  display: block;
  color: #333;
  font-weight: 500;
}

.light-status {
  color: #666;
}

.map-legend {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: #fff;
  padding: 15px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.legend-title {
  font-weight: 600;
  margin-bottom: 10px;
  color: #333;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-dot.online {
  background: #52c41a;
}

.legend-dot.offline-off {
  background: #d9d9d9;
}

.legend-dot.alert {
  background: #f5222d;
}

.legend-dot.offline {
  background: #8c8c8c;
}

.map-sidebar {
  width: 300px;
  background: #fafafa;
  border-left: 1px solid #e8e8e8;
  padding: 15px;
  overflow-y: auto;
}

.sidebar-section {
  margin-bottom: 20px;
}

.section-title {
  font-weight: 600;
  font-size: 14px;
  color: #333;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e8e8e8;
}

.stat-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #fff;
  border-radius: 4px;
}

.stat-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.stat-dot.online {
  background: #52c41a;
}

.stat-dot.offline {
  background: #8c8c8c;
}

.stat-dot.alert {
  background: #f5222d;
}

.stat-label {
  flex: 1;
  color: #666;
}

.stat-value {
  font-weight: 600;
  color: #333;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.quick-actions .el-button {
  width: 100%;
  justify-content: center;
}

.device-info {
  background: #fff;
  padding: 15px;
  border-radius: 4px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-of-type {
  border-bottom: none;
}

.info-label {
  color: #666;
}

.info-value {
  font-weight: 500;
  color: #333;
}

.status-online-on {
  color: #52c41a;
}

.status-online-off {
  color: #999;
}

.status-alert {
  color: #f5222d;
}

.status-offline {
  color: #8c8c8c;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.no-selection {
  background: #fff;
  padding: 30px;
  text-align: center;
  color: #999;
  border-radius: 4px;
}
</style>