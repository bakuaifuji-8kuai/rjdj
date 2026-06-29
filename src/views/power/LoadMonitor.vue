<template>
  <div class="page-container">
    <div class="page-header">
      <div class="title">电压电流负荷展示</div>
      <div class="header-actions">
        <el-select v-model="timeRange" placeholder="时间范围" class="range-select">
          <el-option label="今日" value="today" />
          <el-option label="本周" value="week" />
          <el-option label="本月" value="month" />
        </el-select>
      </div>
    </div>
    <div class="summary-cards">
      <div class="summary-card">
        <div class="card-title">总功率</div>
        <div class="card-value">{{ statistics.power.toLocaleString() }} W</div>
        <div class="card-trend positive">
          <component :is="icons.TrendingUp" />
          <span>+12.5%</span>
        </div>
      </div>
      <div class="summary-card">
        <div class="card-title">用电量</div>
        <div class="card-value">{{ statistics.energy }} kWh</div>
        <div class="card-trend positive">
          <component :is="icons.TrendingUp" />
          <span>+8.3%</span>
        </div>
      </div>
      <div class="summary-card">
        <div class="card-title">峰值负荷</div>
        <div class="card-value">{{ statistics.peakLoad.toFixed(1) }} A</div>
        <div class="card-trend negative">
          <component :is="icons.TrendingDown" />
          <span>-5.2%</span>
        </div>
      </div>
    </div>
    <div class="chart-section">
      <div class="chart-card">
        <div class="chart-header">
          <span class="chart-title">电压趋势</span>
          <el-tag type="info">220V ± 5%</el-tag>
        </div>
        <div class="chart-container">
          <canvas ref="voltageChart"></canvas>
        </div>
      </div>
      <div class="chart-card">
        <div class="chart-header">
          <span class="chart-title">电流趋势</span>
          <el-tag type="warning">峰值: {{ maxCurrent.toFixed(1) }}A</el-tag>
        </div>
        <div class="chart-container">
          <canvas ref="currentChart"></canvas>
        </div>
      </div>
    </div>
    <div class="chart-section">
      <div class="chart-card full-width">
        <div class="chart-header">
          <span class="chart-title">功率与负载率</span>
          <div class="legend">
            <span class="legend-item"><span class="legend-dot power"></span> 功率(kW)</span>
            <span class="legend-item"><span class="legend-dot load"></span> 负载率(%)</span>
          </div>
        </div>
        <div class="chart-container">
          <canvas ref="powerChart"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>import { ref, computed, onMounted } from 'vue';
import { ArrowUp, ArrowDown } from '@element-plus/icons-vue';
import { loadHistoryData, energyStatistics } from '@/data/mockData';
const icons = { TrendingUp: ArrowUp, TrendingDown: ArrowDown };
const timeRange = ref('today');
const voltageChart = ref(null);
const currentChart = ref(null);
const powerChart = ref(null);
const statistics = computed(() => {
 return energyStatistics[timeRange.value];
});
const maxCurrent = computed(() => {
 return Math.max(...loadHistoryData.current);
});
const drawChart = (canvas, data, color, label, unit) => {
 const ctx = canvas.getContext('2d');
 const width = canvas.width;
 const height = canvas.height;
 const padding = { top: 20, right: 20, bottom: 30, left: 45 };
 const chartWidth = width - padding.left - padding.right;
 const chartHeight = height - padding.top - padding.bottom;
 const maxValue = Math.max(...data) * 1.1;
 const minValue = Math.min(...data) * 0.9;
 ctx.clearRect(0, 0, width, height);
 ctx.strokeStyle = '#e8e8e8';
 ctx.lineWidth = 1;
 for (let i = 0; i <= 5; i++) {
 const y = padding.top + (chartHeight / 5) * i;
 ctx.beginPath();
 ctx.moveTo(padding.left, y);
 ctx.lineTo(width - padding.right, y);
 ctx.stroke();
 const value = maxValue - ((maxValue - minValue) / 5) * i;
 ctx.fillStyle = '#999';
 ctx.font = '11px sans-serif';
 ctx.textAlign = 'right';
 ctx.fillText(value.toFixed(1), padding.left - 5, y + 4);
 }
 ctx.strokeStyle = '#e8e8e8';
 for (let i = 0; i < loadHistoryData.labels.length; i++) {
 const x = padding.left + (chartWidth / (loadHistoryData.labels.length - 1)) * i;
 ctx.beginPath();
 ctx.moveTo(x, padding.top);
 ctx.lineTo(x, height - padding.bottom);
 ctx.stroke();
 ctx.fillStyle = '#999';
 ctx.font = '11px sans-serif';
 ctx.textAlign = 'center';
 ctx.fillText(loadHistoryData.labels[i], x, height - 8);
 }
 ctx.beginPath();
 ctx.strokeStyle = color;
 ctx.lineWidth = 2;
 ctx.shadowColor = color;
 ctx.shadowBlur = 5;
 data.forEach((value, index) => {
 const x = padding.left + (chartWidth / (data.length - 1)) * index;
 const y = padding.top + chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight;
 if (index === 0) {
 ctx.moveTo(x, y);
 }
 else {
 ctx.lineTo(x, y);
 }
 });
 ctx.stroke();
 ctx.shadowBlur = 0;
 const lastX = padding.left + chartWidth;
 const lastY = padding.top + chartHeight - ((data[data.length - 1] - minValue) / (maxValue - minValue)) * chartHeight;
 ctx.fillStyle = color;
 ctx.beginPath();
 ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
 ctx.fill();
 ctx.fillStyle = '#333';
 ctx.font = '12px sans-serif';
 ctx.textAlign = 'left';
 ctx.fillText(`${data[data.length - 1].toFixed(1)}${unit}`, lastX + 8, lastY + 4);
};
const drawPowerChart = (canvas) => {
 const ctx = canvas.getContext('2d');
 const width = canvas.width;
 const height = canvas.height;
 const padding = { top: 20, right: 20, bottom: 30, left: 55 };
 const chartWidth = width - padding.left - padding.right;
 const chartHeight = height - padding.top - padding.bottom;
 const powerData = loadHistoryData.power.map(p => p / 1000);
 const loadData = loadHistoryData.loadPercent;
 const maxPower = Math.max(...powerData) * 1.1;
 const maxLoad = 100;
 ctx.clearRect(0, 0, width, height);
 ctx.strokeStyle = '#e8e8e8';
 ctx.lineWidth = 1;
 for (let i = 0; i <= 5; i++) {
 const y = padding.top + (chartHeight / 5) * i;
 ctx.beginPath();
 ctx.moveTo(padding.left, y);
 ctx.lineTo(width - padding.right, y);
 ctx.stroke();
 const powerValue = maxPower - (maxPower / 5) * i;
 ctx.fillStyle = '#999';
 ctx.font = '11px sans-serif';
 ctx.textAlign = 'right';
 ctx.fillText(powerValue.toFixed(1), padding.left - 5, y + 4);
 }
 ctx.fillStyle = '#999';
 ctx.font = '11px sans-serif';
 ctx.save();
 ctx.translate(20, height / 2);
 ctx.rotate(-Math.PI / 2);
 ctx.textAlign = 'center';
 ctx.fillText('功率(kW)', 0, 0);
 ctx.restore();
 ctx.strokeStyle = '#e8e8e8';
 for (let i = 0; i < loadHistoryData.labels.length; i++) {
 const x = padding.left + (chartWidth / (loadHistoryData.labels.length - 1)) * i;
 ctx.beginPath();
 ctx.moveTo(x, padding.top);
 ctx.lineTo(x, height - padding.bottom);
 ctx.stroke();
 ctx.fillStyle = '#999';
 ctx.font = '11px sans-serif';
 ctx.textAlign = 'center';
 ctx.fillText(loadHistoryData.labels[i], x, height - 8);
 }
 ctx.beginPath();
 ctx.strokeStyle = '#1890ff';
 ctx.lineWidth = 2;
 ctx.shadowColor = '#1890ff';
 ctx.shadowBlur = 5;
 powerData.forEach((value, index) => {
 const x = padding.left + (chartWidth / (powerData.length - 1)) * index;
 const y = padding.top + chartHeight - (value / maxPower) * chartHeight;
 if (index === 0) {
 ctx.moveTo(x, y);
 }
 else {
 ctx.lineTo(x, y);
 }
 });
 ctx.stroke();
 ctx.shadowBlur = 0;
 ctx.beginPath();
 ctx.strokeStyle = '#52c41a';
 ctx.lineWidth = 2;
 ctx.setLineDash([5, 5]);
 ctx.shadowColor = '#52c41a';
 ctx.shadowBlur = 3;
 loadData.forEach((value, index) => {
 const x = padding.left + (chartWidth / (loadData.length - 1)) * index;
 const y = padding.top + chartHeight - (value / maxLoad) * chartHeight;
 if (index === 0) {
 ctx.moveTo(x, y);
 }
 else {
 ctx.lineTo(x, y);
 }
 });
 ctx.stroke();
 ctx.setLineDash([]);
 ctx.shadowBlur = 0;
};
const resizeCanvas = (canvas, width, height) => {
 const dpr = window.devicePixelRatio || 1;
 canvas.width = width * dpr;
 canvas.height = height * dpr;
 canvas.style.width = width + 'px';
 canvas.style.height = height + 'px';
 canvas.getContext('2d').scale(dpr, dpr);
};
onMounted(() => {
 setTimeout(() => {
 if (voltageChart.value) {
 resizeCanvas(voltageChart.value, 450, 200);
 drawChart(voltageChart.value, loadHistoryData.voltage, '#1890ff', '电压', 'V');
 }
 if (currentChart.value) {
 resizeCanvas(currentChart.value, 450, 200);
 drawChart(currentChart.value, loadHistoryData.current, '#faad14', '电流', 'A');
 }
 if (powerChart.value) {
 resizeCanvas(powerChart.value, 920, 250);
 drawPowerChart(powerChart.value);
 }
 }, 100);
});
</script>

<style scoped>
.summary-cards {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.summary-card {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 25px;
  border-radius: 8px;
  color: #fff;
}

.card-title {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.card-value {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 10px;
}

.card-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  
  &.positive {
    color: #95de64;
  }
  
  &.negative {
    color: #ff7875;
  }
}

.chart-section {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.chart-card {
  flex: 1;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  
  &.full-width {
    flex: 1 1 100%;
  }
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.legend {
  display: flex;
  gap: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #666;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  
  &.power {
    background: #1890ff;
  }
  
  &.load {
    background: #52c41a;
  }
}

.chart-container {
  height: 200px;
  
  .full-width & {
    height: 250px;
  }
}

.range-select {
  width: 120px;
}
</style>
