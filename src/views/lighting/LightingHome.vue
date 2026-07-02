<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <div class="header-left">
        <div class="title-wrapper">
          <div class="title-icon">
            <el-icon :size="24"><Sunrise /></el-icon>
          </div>
          <div>
            <h1 class="main-title">智慧照明监控中心</h1>
            <p class="sub-title">实时监控城市照明系统运行状态</p>
          </div>
        </div>
      </div>
      <div class="header-right">
        <div class="date-selector">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            class="date-picker"
          />
        </div>
        <el-button type="primary" @click="refreshData" class="refresh-btn">
          <el-icon :size="16"><Refresh /></el-icon>
          刷新数据
        </el-button>
      </div>
    </div>

    <el-row :gutter="20" class="stats-row">
      <el-col :span="6" v-for="(stat, index) in statCards" :key="index">
        <div class="stat-card glow-border" :style="{ animationDelay: index * 0.1 + 's' }">
          <div class="stat-header">
            <div class="stat-icon-wrapper" :class="stat.color">
              <el-icon :size="28"><component :is="stat.icon" /></el-icon>
            </div>
            <div class="stat-trend" :class="stat.trend > 0 ? 'up' : 'down'">
              <el-icon :size="14">{{ stat.trend > 0 ? <TrendCharts /> : <TrendDown /> }}</el-icon>
              <span>{{ Math.abs(stat.trend) }}%</span>
            </div>
          </div>
          <div class="stat-body">
            <div class="stat-value" :class="stat.color">
              <span class="number">{{ stat.value }}</span>
              <span class="unit">{{ stat.unit }}</span>
            </div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
          <div class="stat-footer">
            <div class="progress-bar">
              <div class="progress-fill" :class="stat.color" :style="{ width: stat.progress + '%' }"></div>
            </div>
            <span class="progress-text">{{ stat.progress }}%</span>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <div class="chart-card">
          <div class="chart-header">
            <div class="chart-title">
              <el-icon :size="18"><BarChart3 /></el-icon>
              能耗统计
            </div>
            <div class="chart-tabs">
              <el-radio-group v-model="energyPeriod" class="period-tabs">
                <el-radio-button label="week">本周</el-radio-button>
                <el-radio-button label="month">本月</el-radio-button>
                <el-radio-button label="year">本年</el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <div class="energy-grid">
            <div class="energy-card" v-for="(item, index) in energyData" :key="index">
              <div class="energy-icon" :class="item.color">
                <el-icon :size="20"><component :is="item.icon" /></el-icon>
              </div>
              <div class="energy-info">
                <div class="energy-value">{{ item.value }} <span class="unit">kWh</span></div>
                <div class="energy-label">{{ item.label }}</div>
              </div>
              <div class="energy-change" :class="item.change > 0 ? 'increase' : 'decrease'">
                {{ item.change > 0 ? '+' : '' }}{{ item.change }}%
              </div>
            </div>
          </div>
          <div class="energy-chart">
            <div class="chart-bars">
              <div class="bar-item" v-for="(bar, index) in energyChartData" :key="index">
                <div class="bar-wrapper">
                  <div class="bar-fill" :style="{ height: bar.value + '%' }"></div>
                </div>
                <span class="bar-label">{{ bar.label }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="chart-card">
          <div class="chart-header">
            <div class="chart-title">
              <el-icon :size="18"><Clock /></el-icon>
              开关灯时间
            </div>
          </div>
          <div class="time-panel">
            <div class="time-card">
              <div class="time-icon on">
                <el-icon :size="32"><Sunset /></el-icon>
              </div>
              <div class="time-info">
                <div class="time-label">开灯时间</div>
                <div class="time-value">{{ switchTime.on }}</div>
              </div>
            </div>
            <div class="time-card">
              <div class="time-icon off">
                <el-icon :size="32"><Sunrise /></el-icon>
              </div>
              <div class="time-info">
                <div class="time-label">关灯时间</div>
                <div class="time-value">{{ switchTime.off }}</div>
              </div>
            </div>
          </div>
          <div class="time-bar">
            <div class="bar-segment night" :style="{ width: nightPercent + '%' }"></div>
            <div class="bar-segment day" :style="{ width: (100 - nightPercent) + '%' }"></div>
          </div>
          <div class="time-bar-labels">
            <span>白天 {{ (100 - nightPercent).toFixed(0) }}%</span>
            <span>夜间 {{ nightPercent.toFixed(0) }}%</span>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="chart-card">
          <div class="chart-header">
            <div class="chart-title">
              <el-icon :size="18"><Lightbulb /></el-icon>
              亮灯率
            </div>
          </div>
          <div class="rate-display">
            <div class="rate-ring">
              <svg viewBox="0 0 100 100" class="ring-svg">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(0, 212, 255, 0.1)" stroke-width="8" />
                <circle 
                  cx="50" cy="50" r="42" fill="none" 
                  stroke="url(#gradient)" 
                  stroke-width="8"
                  stroke-linecap="round"
                  :stroke-dasharray="circumference"
                  :stroke-dashoffset="dashOffset"
                  class="ring-progress"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#00d4ff" />
                    <stop offset="100%" stop-color="#7c3aed" />
                  </linearGradient>
                </defs>
              </svg>
              <div class="rate-content">
                <span class="rate-value">{{ lightingRate }}</span>
                <span class="rate-unit">%</span>
                <div class="rate-label">亮灯率</div>
              </div>
            </div>
          </div>
          <div class="rate-stats">
            <div class="rate-stat-item">
              <span class="stat-num">{{ Math.floor(lightingRate * 25.12) }}</span>
              <span class="stat-text">亮灯数</span>
            </div>
            <div class="rate-stat-item">
              <span class="stat-num">{{ Math.floor((100 - lightingRate) * 0.25) }}</span>
              <span class="stat-text">故障数</span>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="bottom-row">
      <el-col :span="12">
        <div class="chart-card">
          <div class="chart-header">
            <div class="chart-title">
              <el-icon :size="18"><Bell /></el-icon>
              告警统计
            </div>
            <div class="alert-tabs">
              <el-radio-group v-model="alertPeriod" class="period-tabs">
                <el-radio-button label="today">今日</el-radio-button>
                <el-radio-button label="week">本周</el-radio-button>
                <el-radio-button label="month">本月</el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <div class="alert-stats">
            <div class="alert-stat-card today">
              <div class="alert-icon">
                <el-icon :size="24"><AlertTriangle /></el-icon>
              </div>
              <div class="alert-info">
                <div class="alert-value">{{ alerts.today }}</div>
                <div class="alert-label">今日告警</div>
              </div>
              <div class="alert-trend up">+12%</div>
            </div>
            <div class="alert-stat-card recovered">
              <div class="alert-icon">
                <el-icon :size="24"><CheckCircle /></el-icon>
              </div>
              <div class="alert-info">
                <div class="alert-value">{{ alerts.recovered }}</div>
                <div class="alert-label">已恢复</div>
              </div>
              <div class="alert-trend down">-5%</div>
            </div>
            <div class="alert-stat-card continuing">
              <div class="alert-icon">
                <el-icon :size="24"><Clock /></el-icon>
              </div>
              <div class="alert-info">
                <div class="alert-value">{{ alerts.continuing }}</div>
                <div class="alert-label">持续中</div>
              </div>
              <div class="alert-trend up">+8%</div>
            </div>
          </div>
          <div class="alert-list">
            <div class="alert-item" v-for="(item, index) in alertList" :key="index">
              <div class="alert-type" :class="item.type"></div>
              <div class="alert-content">
                <div class="alert-title">{{ item.title }}</div>
                <div class="alert-time">{{ item.time }}</div>
              </div>
              <el-tag :type="item.type === 'danger' ? 'danger' : 'warning'" size="small">
                {{ item.type === 'danger' ? '紧急' : '一般' }}
              </el-tag>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="chart-card">
          <div class="chart-header">
            <div class="chart-title">
              <el-icon :size="18"><PieChart /></el-icon>
              故障分析
            </div>
          </div>
          <div class="fault-chart">
            <div class="fault-pie">
              <svg viewBox="0 0 100 100" class="pie-svg">
                <circle 
                  v-for="(segment, index) in faultSegments" 
                  :key="index"
                  cx="50" cy="50" r="40"
                  fill="none"
                  :stroke="segment.color"
                  stroke-width="20"
                  :stroke-dasharray="segment.dashArray"
                  :stroke-dashoffset="segment.offset"
                  class="pie-segment"
                  :style="{ animationDelay: index * 0.1 + 's' }"
                />
              </svg>
              <div class="pie-center">
                <span class="pie-total">100%</span>
              </div>
            </div>
            <div class="fault-legend">
              <div class="legend-item" v-for="(item, index) in faultAnalysis" :key="index">
                <div class="legend-color" :style="{ background: item.color }"></div>
                <span class="legend-label">{{ item.label }}</span>
                <span class="legend-value">{{ item.value }}%</span>
              </div>
            </div>
          </div>
          <div class="fault-bars">
            <div class="fault-bar-item" v-for="(item, index) in faultAnalysis" :key="index">
              <div class="fault-bar-header">
                <span class="fault-label">{{ item.label }}</span>
                <span class="fault-value">{{ item.value }}%</span>
              </div>
              <div class="fault-bar-container">
                <div class="fault-bar-fill" :style="{ width: item.value + '%', background: item.color }"></div>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { 
  Refresh, Postcard, Cpu, Sunrise, Timer, TrendCharts, TrendDown,
  BarChart3, Clock, Lightbulb, Sunset, Bell, AlertTriangle, 
  CheckCircle, PieChart, Zap, Calendar, TrendingUp
} from '@element-plus/icons-vue'

const dateRange = ref([])
const energyPeriod = ref('week')
const alertPeriod = ref('today')

const lightingRate = ref(98.5)
const circumference = 2 * Math.PI * 42
const dashOffset = computed(() => circumference * (1 - lightingRate.value / 100))

const nightPercent = computed(() => {
  const onTime = new Date(`2000-01-01 ${switchTime.on}`)
  const offTime = new Date(`2000-01-01 ${switchTime.off}`)
  let diff = offTime - onTime
  if (diff < 0) diff += 24 * 60 * 60 * 1000
  return (diff / (24 * 60 * 60 * 1000)) * 100
})

const statCards = reactive([
  { icon: Postcard, label: '灯杆总数', value: 1256, unit: '根', color: 'blue', trend: 5.2, progress: 85 },
  { icon: Cpu, label: '控制器数量', value: 1256, unit: '个', color: 'green', trend: 3.8, progress: 92 },
  { icon: Lightbulb, label: '灯具总数', value: 2512, unit: '盏', color: 'orange', trend: -2.1, progress: 98 },
  { icon: TrendingUp, label: '在线率', value: 99.2, unit: '%', color: 'purple', trend: 0.5, progress: 99 }
])

const statistics = reactive({
  poleCount: 1256,
  controllerCount: 1256,
  lampCount: 2512,
  onlineRate: 99.2
})

const energy = reactive({
  yesterday: 4521.8,
  thisWeek: 31652.6,
  thisMonth: 135862.4,
  thisYear: 1623458.8
})

const energyData = reactive([
  { icon: Calendar, label: '昨日能耗', value: 4521.8, change: -8.5, color: 'blue' },
  { icon: Calendar, label: '本周能耗', value: 31652.6, change: 5.2, color: 'green' },
  { icon: Calendar, label: '本月能耗', value: 135862.4, change: 12.3, color: 'orange' },
  { icon: Calendar, label: '年度能耗', value: 1623458.8, change: -3.2, color: 'purple' }
])

const energyChartData = reactive([
  { label: '周一', value: 65 },
  { label: '周二', value: 78 },
  { label: '周三', value: 52 },
  { label: '周四', value: 85 },
  { label: '周五', value: 92 },
  { label: '周六', value: 45 },
  { label: '周日', value: 68 }
])

const switchTime = reactive({
  on: '18:30',
  off: '06:15'
})

const alerts = reactive({
  today: 12,
  recovered: 8,
  continuing: 4
})

const alertList = reactive([
  { title: '灯杆 #1234 通讯故障', time: '10分钟前', type: 'danger' },
  { title: '灯具 #5678 电流异常', time: '25分钟前', type: 'warning' },
  { title: '配电柜 #001 温度过高', time: '1小时前', type: 'warning' },
  { title: '灯杆 #9012 离线告警', time: '2小时前', type: 'danger' }
])

const faultAnalysis = reactive([
  { label: '通讯故障', value: 35, color: 'linear-gradient(90deg, #00d4ff, #69c0ff)' },
  { label: '灯具故障', value: 28, color: 'linear-gradient(90deg, #ffaa00, #ffbb40)' },
  { label: '电源故障', value: 22, color: 'linear-gradient(90deg, #ff4757, #ff7875)' },
  { label: '其他故障', value: 15, color: 'linear-gradient(90deg, #7c3aed, #b37feb)' }
])

const faultSegments = computed(() => {
  let offset = 0
  return faultAnalysis.map(item => {
    const dashArray = `${(item.value / 100) * circumference} ${circumference}`
    const segment = { dashArray, offset }
    offset -= (item.value / 100) * circumference
    return segment
  })
})

const refreshData = () => {
  console.log('刷新数据')
}
</script>

<style scoped>
.dashboard-container {
  min-height: calc(100vh - 120px);
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px 24px;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(124, 58, 237, 0.1));
  border-radius: 12px;
  border: 1px solid rgba(0, 212, 255, 0.2);
}

.header-left {
  display: flex;
  align-items: center;
}

.title-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.3), rgba(124, 58, 237, 0.3));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00d4ff;
  border: 1px solid rgba(0, 212, 255, 0.3);
}

.main-title {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #00d4ff, #7c3aed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.sub-title {
  font-size: 14px;
  color: #94a3b8;
  margin: 4px 0 0 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.date-picker {
  width: 280px;
  
  :deep(.el-input__wrapper) {
    background: rgba(0, 0, 0, 0.3);
    border-color: rgba(0, 212, 255, 0.2);
  }
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stats-row {
  margin-bottom: 24px;
}

.stat-card {
  background: #1b2838;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #2d3a4b;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    inset: -1px;
    background: linear-gradient(45deg, rgba(0, 212, 255, 0.1), rgba(124, 58, 237, 0.1), rgba(0, 212, 255, 0.1));
    background-size: 200% 200%;
    border-radius: inherit;
    z-index: -1;
    animation: border-flow 3s linear infinite;
  }
}

@keyframes border-flow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.stat-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &.blue {
    background: linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(0, 212, 255, 0.1));
    color: #00d4ff;
    box-shadow: 0 0 15px rgba(0, 212, 255, 0.2);
  }
  
  &.green {
    background: linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(0, 255, 136, 0.1));
    color: #00ff88;
    box-shadow: 0 0 15px rgba(0, 255, 136, 0.2);
  }
  
  &.orange {
    background: linear-gradient(135deg, rgba(255, 170, 0, 0.2), rgba(255, 170, 0, 0.1));
    color: #ffaa00;
    box-shadow: 0 0 15px rgba(255, 170, 0, 0.2);
  }
  
  &.purple {
    background: linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(124, 58, 237, 0.1));
    color: #a78bfa;
    box-shadow: 0 0 15px rgba(124, 58, 237, 0.2);
  }
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  padding: 4px 8px;
  border-radius: 4px;
  
  &.up {
    background: rgba(0, 255, 136, 0.1);
    color: #00ff88;
  }
  
  &.down {
    background: rgba(0, 212, 255, 0.1);
    color: #00d4ff;
  }
}

.stat-body {
  margin-bottom: 16px;
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  display: flex;
  align-items: baseline;
  gap: 6px;
  
  &.blue { color: #00d4ff; text-shadow: 0 0 20px rgba(0, 212, 255, 0.3); }
  &.green { color: #00ff88; text-shadow: 0 0 20px rgba(0, 255, 136, 0.3); }
  &.orange { color: #ffaa00; text-shadow: 0 0 20px rgba(255, 170, 0, 0.3); }
  &.purple { color: #a78bfa; text-shadow: 0 0 20px rgba(124, 58, 237, 0.3); }
  
  .unit {
    font-size: 16px;
    font-weight: 400;
    color: #94a3b8;
  }
}

.stat-label {
  font-size: 14px;
  color: #94a3b8;
  margin-top: 4px;
}

.stat-footer {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.6s ease;
  
  &.blue { background: linear-gradient(90deg, #00d4ff, #69c0ff); }
  &.green { background: linear-gradient(90deg, #00ff88, #69c0ff); }
  &.orange { background: linear-gradient(90deg, #ffaa00, #ffbb40); }
  &.purple { background: linear-gradient(90deg, #7c3aed, #b37feb); }
}

.progress-text {
  font-size: 12px;
  color: #64748b;
  width: 40px;
  text-align: right;
}

.chart-row, .bottom-row {
  margin-bottom: 24px;
}

.chart-card {
  background: #1b2838;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #2d3a4b;
  height: 100%;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #2d3a4b;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #e8e8e8;
  display: flex;
  align-items: center;
  gap: 8px;
}

.period-tabs {
  :deep(.el-radio-button__inner) {
    background: rgba(0, 0, 0, 0.3);
    border-color: #2d3a4b;
    color: #94a3b8;
    
    &:hover {
      border-color: #00d4ff;
      color: #00d4ff;
    }
    
    &.is-active {
      background: rgba(0, 212, 255, 0.1);
      border-color: #00d4ff;
      color: #00d4ff;
    }
  }
}

.energy-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 24px;
}

.energy-card {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.energy-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &.blue { background: rgba(0, 212, 255, 0.15); color: #00d4ff; }
  &.green { background: rgba(0, 255, 136, 0.15); color: #00ff88; }
  &.orange { background: rgba(255, 170, 0, 0.15); color: #ffaa00; }
  &.purple { background: rgba(124, 58, 237, 0.15); color: #a78bfa; }
}

.energy-info {
  flex: 1;
  
  .energy-value {
    font-size: 16px;
    font-weight: 600;
    color: #e8e8e8;
    
    .unit {
      font-size: 12px;
      font-weight: 400;
      color: #64748b;
    }
  }
  
  .energy-label {
    font-size: 12px;
    color: #64748b;
  }
}

.energy-change {
  font-size: 13px;
  font-weight: 600;
  
  &.increase { color: #ff4757; }
  &.decrease { color: #00ff88; }
}

.energy-chart {
  height: 120px;
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 100%;
  padding-top: 20px;
}

.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  height: 100%;
}

.bar-wrapper {
  width: 30px;
  height: calc(100% - 24px);
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}

.bar-fill {
  width: 100%;
  background: linear-gradient(180deg, #00d4ff, #7c3aed);
  border-radius: 4px;
  transition: height 0.6s ease;
  box-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
}

.bar-label {
  font-size: 11px;
  color: #64748b;
  margin-top: 8px;
}

.time-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.time-card {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.time-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &.on {
    background: linear-gradient(135deg, rgba(255, 170, 0, 0.3), rgba(255, 71, 87, 0.2));
    color: #ffaa00;
  }
  
  &.off {
    background: linear-gradient(135deg, rgba(0, 212, 255, 0.3), rgba(124, 58, 237, 0.2));
    color: #00d4ff;
  }
}

.time-info {
  flex: 1;
  
  .time-label {
    font-size: 12px;
    color: #64748b;
    margin-bottom: 4px;
  }
  
  .time-value {
    font-size: 24px;
    font-weight: 700;
    color: #e8e8e8;
  }
}

.time-bar {
  display: flex;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.bar-segment {
  transition: width 0.6s ease;
  
  &.night { background: linear-gradient(90deg, #7c3aed, #00d4ff); }
  &.day { background: linear-gradient(90deg, #ffaa00, #00ff88); }
}

.time-bar-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #64748b;
}

.rate-display {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 180px;
}

.rate-ring {
  position: relative;
  width: 160px;
  height: 160px;
}

.ring-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.ring-progress {
  transition: stroke-dashoffset 0.8s ease;
  filter: drop-shadow(0 0 10px rgba(0, 212, 255, 0.5));
}

.rate-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  
  .rate-value {
    font-size: 40px;
    font-weight: 700;
    color: #00d4ff;
    text-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
  }
  
  .rate-unit {
    font-size: 16px;
    color: #94a3b8;
  }
  
  .rate-label {
    font-size: 12px;
    color: #64748b;
    margin-top: 4px;
  }
}

.rate-stats {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-top: 16px;
}

.rate-stat-item {
  text-align: center;
  
  .stat-num {
    font-size: 20px;
    font-weight: 600;
    color: #e8e8e8;
    display: block;
  }
  
  .stat-text {
    font-size: 12px;
    color: #64748b;
  }
}

.alert-stats {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.alert-stat-card {
  flex: 1;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-left: 3px solid;
  
  &.today {
    border-left-color: #ffaa00;
    
    .alert-icon { color: #ffaa00; }
    .alert-value { color: #ffaa00; }
  }
  
  &.recovered {
    border-left-color: #00ff88;
    
    .alert-icon { color: #00ff88; }
    .alert-value { color: #00ff88; }
  }
  
  &.continuing {
    border-left-color: #ff4757;
    
    .alert-icon { color: #ff4757; }
    .alert-value { color: #ff4757; }
  }
}

.alert-icon {
  font-size: 20px;
}

.alert-info {
  flex: 1;
  
  .alert-value {
    font-size: 24px;
    font-weight: 700;
  }
  
  .alert-label {
    font-size: 12px;
    color: #64748b;
  }
}

.alert-trend {
  font-size: 13px;
  font-weight: 600;
  
  &.up { color: #ff4757; }
  &.down { color: #00ff88; }
}

.alert-list {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 8px;
}

.alert-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 6px;
  transition: background 0.3s;
  
  &:hover {
    background: rgba(0, 212, 255, 0.05);
  }
}

.alert-type {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  
  &.danger { background: #ff4757; box-shadow: 0 0 8px rgba(255, 71, 87, 0.5); }
  &.warning { background: #ffaa00; box-shadow: 0 0 8px rgba(255, 170, 0, 0.5); }
}

.alert-content {
  flex: 1;
  
  .alert-title {
    font-size: 14px;
    color: #e8e8e8;
  }
  
  .alert-time {
    font-size: 12px;
    color: #64748b;
    margin-top: 4px;
  }
}

.fault-chart {
  display: flex;
  align-items: center;
  gap: 40px;
  margin-bottom: 24px;
}

.fault-pie {
  position: relative;
  width: 120px;
  height: 120px;
}

.pie-svg {
  width: 100%;
  height: 100%;
}

.pie-segment {
  transition: stroke-dashoffset 0.8s ease;
}

.pie-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  
  .pie-total {
    font-size: 14px;
    font-weight: 600;
    color: #94a3b8;
  }
}

.fault-legend {
  flex: 1;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.legend-label {
  flex: 1;
  font-size: 14px;
  color: #94a3b8;
}

.legend-value {
  font-size: 14px;
  font-weight: 600;
  color: #e8e8e8;
}

.fault-bars {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 12px;
}

.fault-bar-item {
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.fault-bar-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.fault-label {
  font-size: 13px;
  color: #94a3b8;
}

.fault-value {
  font-size: 13px;
  font-weight: 600;
  color: #e8e8e8;
}

.fault-bar-container {
  height: 6px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
  overflow: hidden;
}

.fault-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.6s ease;
  box-shadow: 0 0 8px currentColor;
}
</style>
