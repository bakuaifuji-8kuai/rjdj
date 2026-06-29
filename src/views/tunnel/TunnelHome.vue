<template>
  <div class="tunnel-home">
    <div class="page-header">
      <h2>隧道总览</h2>
      <div class="header-actions">
        <el-button type="primary">刷新数据</el-button>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background: #409eff;">
          <el-icon :size="32"><Guide /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.totalTunnels }}</div>
          <div class="stat-label">隧道总数</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: #67c23a;">
          <el-icon :size="32"><SuccessFilled /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.onlineTunnels }}</div>
          <div class="stat-label">在线隧道</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: #f56c6c;">
          <el-icon :size="32"><WarningFilled /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.alarms }}</div>
          <div class="stat-label">告警数量</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: #e6a23c;">
          <el-icon :size="32"><PieChart /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.energyConsumption }}</div>
          <div class="stat-label">今日能耗(kWh)</div>
        </div>
      </div>
    </div>

    <div class="content-grid">
      <div class="grid-item tunnel-list">
        <div class="card-header">
          <h3>隧道列表</h3>
          <el-button type="primary" size="small" @click="handleAddTunnel">新增隧道</el-button>
        </div>
        <el-table :data="tunnelData" border style="width: 100%">
          <el-table-column prop="name" label="隧道名称" width="150" />
          <el-table-column prop="location" label="所在区域" width="120" />
          <el-table-column prop="length" label="长度(m)" width="100" />
          <el-table-column prop="status" label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="row.status === '在线' ? 'success' : 'danger'" size="small">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="devices" label="设备数量" width="100" />
          <el-table-column label="操作" width="180">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="handleViewDetail(row)">查看</el-button>
              <el-button type="warning" size="small" @click="handleEdit(row)">编辑</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="grid-item environment-monitor">
        <div class="card-header">
          <h3>环境监测</h3>
          <el-button type="text" size="small">查看详情</el-button>
        </div>
        <div class="monitor-grid">
          <div class="monitor-item">
            <div class="monitor-label">CO浓度</div>
            <div class="monitor-value">35 <span>ppm</span></div>
            <div class="monitor-status normal">正常</div>
          </div>
          <div class="monitor-item">
            <div class="monitor-label">能见度</div>
            <div class="monitor-value">850 <span>m</span></div>
            <div class="monitor-status normal">正常</div>
          </div>
          <div class="monitor-item">
            <div class="monitor-label">风速</div>
            <div class="monitor-value">2.5 <span>m/s</span></div>
            <div class="monitor-status normal">正常</div>
          </div>
          <div class="monitor-item">
            <div class="monitor-label">光照度</div>
            <div class="monitor-value">450 <span>lux</span></div>
            <div class="monitor-status normal">正常</div>
          </div>
        </div>
      </div>

      <div class="grid-item alarm-list">
        <div class="card-header">
          <h3>最新告警</h3>
          <el-button type="text" size="small">全部告警</el-button>
        </div>
        <div class="alarm-items">
          <div v-for="alarm in recentAlarms" :key="alarm.id" class="alarm-item">
            <div class="alarm-icon" :class="alarm.level">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="alarm-content">
              <div class="alarm-title">{{ alarm.title }}</div>
              <div class="alarm-info">
                <span>{{ alarm.tunnel }}</span>
                <span>{{ alarm.time }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid-item energy-chart">
        <div class="card-header">
          <h3>能耗趋势</h3>
          <el-select size="small" v-model="energyTimeRange" style="width: 120px;">
            <el-option label="今日" value="today" />
            <el-option label="本周" value="week" />
            <el-option label="本月" value="month" />
          </el-select>
        </div>
        <div class="chart-placeholder">
          <div class="chart-bar">
            <div v-for="(value, index) in energyData" :key="index" class="bar-item">
              <div class="bar" :style="{ height: value + '%' }"></div>
              <div class="bar-label">{{ index + 1 }}时</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-dialog title="新增隧道" v-model="showAddDialog" width="600px">
      <el-form :model="tunnelForm" label-width="100px">
        <el-form-item label="隧道名称">
          <el-input v-model="tunnelForm.name" placeholder="请输入隧道名称" />
        </el-form-item>
        <el-form-item label="所在区域">
          <el-select v-model="tunnelForm.region" placeholder="请选择区域">
            <el-option label="长沙" value="长沙" />
            <el-option label="长沙/岳麓区" value="长沙/岳麓区" />
            <el-option label="长沙-岳麓区-先导路" value="长沙-岳麓区-先导路" />
          </el-select>
        </el-form-item>
        <el-form-item label="隧道长度(m)">
          <el-input-number v-model="tunnelForm.length" :min="0" />
        </el-form-item>
        <el-form-item label="车道数量">
          <el-input-number v-model="tunnelForm.lanes" :min="1" :max="10" />
        </el-form-item>
        <el-form-item label="设计时速">
          <el-input-number v-model="tunnelForm.speed" :min="0" /> km/h
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSaveTunnel">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Guide, SuccessFilled, WarningFilled, PieChart, Warning } from '@element-plus/icons-vue'

const router = useRouter()
const showAddDialog = ref(false)
const energyTimeRange = ref('today')

const stats = ref({
  totalTunnels: 12,
  onlineTunnels: 10,
  alarms: 3,
  energyConsumption: 45230
})

const tunnelData = ref([
  { id: 1, name: '先导路', location: '长沙-岳麓区-先导路', length: 1000, status: '在线', devices: 156 }
])

const recentAlarms = ref([
  { id: 1, title: '照明设备故障', tunnel: '先导路', time: '10:25', level: 'warning' },
  { id: 2, title: 'CO浓度超标', tunnel: '先导路', time: '09:15', level: 'danger' },
  { id: 3, title: '通风系统异常', tunnel: '先导路', time: '08:30', level: 'warning' }
])

const energyData = ref([45, 52, 38, 42, 55, 68, 75, 82, 78, 65, 58, 48])

const tunnelForm = ref({
  name: '',
  region: '',
  length: 0,
  lanes: 2,
  speed: 60
})

const handleAddTunnel = () => {
  showAddDialog.value = true
}

const handleSaveTunnel = () => {
  showAddDialog.value = false
}

const handleViewDetail = (row) => {
  router.push(`/tunnel/detail/${row.id}`)
}

const handleEdit = (row) => {
  console.log('Edit tunnel:', row)
}
</script>

<style scoped>
.tunnel-home {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100%;
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: 600;
  color: #333;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-top: 8px;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.grid-item {
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
  padding-bottom: 15px;
  border-bottom: 1px solid #e8e8e8;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.tunnel-list {
  grid-column: span 2;
}

.monitor-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.monitor-item {
  background: #f9fafb;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
}

.monitor-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.monitor-value {
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.monitor-value span {
  font-size: 14px;
  font-weight: normal;
  color: #666;
}

.monitor-status {
  font-size: 12px;
  margin-top: 5px;
}

.monitor-status.normal {
  color: #67c23a;
}

.alarm-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alarm-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
}

.alarm-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
}

.alarm-icon.warning {
  background: #e6a23c;
}

.alarm-icon.danger {
  background: #f56c6c;
}

.alarm-content {
  flex: 1;
}

.alarm-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.alarm-info {
  font-size: 12px;
  color: #999;
  display: flex;
  gap: 10px;
}

.chart-placeholder {
  height: 200px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.chart-bar {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 100%;
  padding: 20px 0;
}

.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 40px;
}

.bar {
  width: 30px;
  background: linear-gradient(180deg, #409eff 0%, #66b1ff 100%);
  border-radius: 4px 4px 0 0;
  min-height: 10px;
}

.bar-label {
  font-size: 10px;
  color: #999;
  margin-top: 5px;
}
</style>
