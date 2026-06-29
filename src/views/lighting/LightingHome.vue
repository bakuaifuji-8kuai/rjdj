<template>
  <div class="page-container">
    <div class="page-header">
      <div class="title">快捷首页</div>
      <div class="header-actions">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="margin-right: 10px;"
        />
        <el-button type="primary" @click="refreshData">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
      </div>
    </div>

    <el-row :gutter="20" class="statistics-row">
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon blue">
            <el-icon><Postcard /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.poleCount }}</div>
            <div class="stat-label">灯杆总数</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon green">
            <el-icon><Cpu /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.controllerCount }}</div>
            <div class="stat-label">控制器数量</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon orange">
            <el-icon><Sunrise /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.lampCount }}</div>
            <div class="stat-label">灯具总数</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon purple">
            <el-icon><Timer /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.onlineRate }}%</div>
            <div class="stat-label">在线率</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="statistics-row">
      <el-col :span="12">
        <div class="chart-card">
          <div class="chart-title">能耗统计</div>
          <div class="energy-grid">
            <div class="energy-item">
              <span class="energy-label">昨日能耗</span>
              <span class="energy-value">{{ energy.yesterday }} kWh</span>
            </div>
            <div class="energy-item">
              <span class="energy-label">本周能耗</span>
              <span class="energy-value">{{ energy.thisWeek }} kWh</span>
            </div>
            <div class="energy-item">
              <span class="energy-label">本月能耗</span>
              <span class="energy-value">{{ energy.thisMonth }} kWh</span>
            </div>
            <div class="energy-item">
              <span class="energy-label">年度能耗</span>
              <span class="energy-value">{{ energy.thisYear }} kWh</span>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="chart-card">
          <div class="chart-title">开关灯时间</div>
          <div class="time-info">
            <div class="time-item">
              <span class="time-label">开灯时间</span>
              <span class="time-value">{{ switchTime.on }} </span>
            </div>
            <div class="time-item">
              <span class="time-label">关灯时间</span>
              <span class="time-value">{{ switchTime.off }} </span>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="chart-card">
          <div class="chart-title">亮灯率</div>
          <div class="rate-display">
            <el-progress
              type="dashboard"
              :percentage="lightingRate"
              :width="120"
              :stroke-width="10"
              color="#52c41a"
            >
              <template #default>
                <span class="rate-value">{{ lightingRate }}%</span>
              </template>
            </el-progress>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="statistics-row">
      <el-col :span="12">
        <div class="chart-card">
          <div class="chart-title">告警统计</div>
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="alert-stat">
                <div class="alert-value today">{{ alerts.today }}</div>
                <div class="alert-label">今日告警</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="alert-stat">
                <div class="alert-value recovered">{{ alerts.recovered }}</div>
                <div class="alert-label">已恢复</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="alert-stat">
                <div class="alert-value continuing">{{ alerts.continuing }}</div>
                <div class="alert-label">持续中</div>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="chart-card">
          <div class="chart-title">故障分析</div>
          <div class="fault-chart">
            <div class="fault-bar">
              <span class="fault-label">通讯故障</span>
              <div class="bar-container">
                <div class="bar-fill comm" :style="{ width: faultAnalysis.comm + '%' }"></div>
              </div>
              <span class="fault-value">{{ faultAnalysis.comm }}%</span>
            </div>
            <div class="fault-bar">
              <span class="fault-label">灯具故障</span>
              <div class="bar-container">
                <div class="bar-fill lamp" :style="{ width: faultAnalysis.lamp + '%' }"></div>
              </div>
              <span class="fault-value">{{ faultAnalysis.lamp }}%</span>
            </div>
            <div class="fault-bar">
              <span class="fault-label">电源故障</span>
              <div class="bar-container">
                <div class="bar-fill power" :style="{ width: faultAnalysis.power + '%' }"></div>
              </div>
              <span class="fault-value">{{ faultAnalysis.power }}%</span>
            </div>
            <div class="fault-bar">
              <span class="fault-label">其他故障</span>
              <div class="bar-container">
                <div class="bar-fill other" :style="{ width: faultAnalysis.other + '%' }"></div>
              </div>
              <span class="fault-value">{{ faultAnalysis.other }}%</span>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Refresh, Postcard, Cpu, Sunrise, Timer } from '@element-plus/icons-vue'

const dateRange = ref([])
const lightingRate = ref(98.5)

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

const switchTime = reactive({
  on: '18:30',
  off: '06:15'
})

const alerts = reactive({
  today: 12,
  recovered: 8,
  continuing: 4
})

const faultAnalysis = reactive({
  comm: 35,
  lamp: 28,
  power: 22,
  other: 15
})

const refreshData = () => {
  console.log('刷新数据')
}
</script>

<style scoped>
.statistics-row {
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.stat-icon.blue {
  background: #e6f7ff;
  color: #1890ff;
}

.stat-icon.green {
  background: #f6ffed;
  color: #52c41a;
}

.stat-icon.orange {
  background: #fff7e6;
  color: #fa8c16;
}

.stat-icon.purple {
  background: #f9f0ff;
  color: #722ed1;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #1f1f1f;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}

.chart-card {
  background: #fff;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: 200px;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f1f1f;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e8e8e8;
}

.energy-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.energy-item {
  display: flex;
  flex-direction: column;
  padding: 10px;
  background: #fafafa;
  border-radius: 4px;
}

.energy-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.energy-value {
  font-size: 18px;
  font-weight: 600;
  color: #1890ff;
}

.time-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding-top: 10px;
}

.time-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: #fafafa;
  border-radius: 4px;
}

.time-label {
  font-size: 14px;
  color: #666;
}

.time-value {
  font-size: 16px;
  font-weight: 600;
  color: #1890ff;
}

.rate-display {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 140px;
}

.rate-value {
  font-size: 24px;
  font-weight: 600;
  color: #52c41a;
}

.alert-stat {
  text-align: center;
  padding: 15px;
  background: #fafafa;
  border-radius: 4px;
}

.alert-value {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 5px;
}

.alert-value.today {
  color: #fa8c16;
}

.alert-value.recovered {
  color: #52c41a;
}

.alert-value.continuing {
  color: #f5222d;
}

.alert-label {
  font-size: 14px;
  color: #666;
}

.fault-chart {
  padding-top: 10px;
}

.fault-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.fault-label {
  width: 70px;
  font-size: 13px;
  color: #666;
}

.bar-container {
  flex: 1;
  height: 20px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s;
}

.bar-fill.comm {
  background: linear-gradient(90deg, #1890ff, #69c0ff);
}

.bar-fill.lamp {
  background: linear-gradient(90deg, #fa8c16, #ffbb40);
}

.bar-fill.power {
  background: linear-gradient(90deg, #f5222d, #ff7875);
}

.bar-fill.other {
  background: linear-gradient(90deg, #722ed1, #b37feb);
}

.fault-value {
  width: 40px;
  text-align: right;
  font-size: 14px;
  font-weight: 600;
  color: #1f1f1f;
}
</style>
