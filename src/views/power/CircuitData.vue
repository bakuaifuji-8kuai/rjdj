<template>
  <div class="page-container">
    <div class="page-header">
      <div class="title">回路用电数据</div>
      <div class="header-actions">
        <el-select v-model="selectedBox" placeholder="选择配电箱" class="box-select">
          <el-option label="全部" value="" />
          <el-option v-for="box in boxes" :key="box.id" :label="box.name" :value="box.id" />
        </el-select>
      </div>
    </div>
    <div class="circuit-stats">
      <div class="stat-card">
        <div class="stat-icon">
          <component :is="icons.Electricity" />
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ totalPower.toFixed(1) }} kW</span>
          <span class="stat-label">总功率</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <component :is="icons.Battery" />
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ totalEnergy }} kWh</span>
          <span class="stat-label">总用电量</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <component :is="icons.Gauge" />
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ avgPowerFactor.toFixed(2) }}</span>
          <span class="stat-label">平均功率因数</span>
        </div>
      </div>
    </div>
    <el-table :data="filteredCircuits" border class="data-table">
      <el-table-column prop="id" label="回路编号" width="100" />
      <el-table-column prop="name" label="回路名称" />
      <el-table-column prop="boxId" label="所属配电箱" width="120">
        <template #default="scope">
          {{ getBoxName(scope.row.boxId) }}
        </template>
      </el-table-column>
      <el-table-column prop="power" label="功率(W)" width="100" />
      <el-table-column prop="energy" label="用电量(kWh)" width="120" />
      <el-table-column prop="voltage" label="电压(V)" width="100" />
      <el-table-column prop="current" label="电流(A)" width="100" />
      <el-table-column prop="powerFactor" label="功率因数" width="100" />
      <el-table-column label="功率因数状态" width="120">
        <template #default="scope">
          <el-tag :type="getPowerFactorTag(scope.row.powerFactor)">
            {{ getPowerFactorText(scope.row.powerFactor) }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Lightning, Tools, Cpu } from '@element-plus/icons-vue'
import { circuitData, distributionBoxes } from '@/data/mockData'

const icons = { Electricity: Lightning, Battery: Tools, Gauge: Cpu }
const selectedBox = ref('')
const circuits = ref([...circuitData])
const boxes = ref([...distributionBoxes])

const filteredCircuits = computed(() => {
  if (!selectedBox.value) return circuits.value
  return circuits.value.filter(c => c.boxId === selectedBox.value)
})

const totalPower = computed(() => {
  return filteredCircuits.value.reduce((sum, c) => sum + c.power, 0) / 1000
})

const totalEnergy = computed(() => {
  return filteredCircuits.value.reduce((sum, c) => sum + c.energy, 0)
})

const avgPowerFactor = computed(() => {
  const count = filteredCircuits.value.length
  if (count === 0) return 0
  return filteredCircuits.value.reduce((sum, c) => sum + c.powerFactor, 0) / count
})

const getBoxName = (boxId) => {
  const box = boxes.value.find(b => b.id === boxId)
  return box ? box.name : boxId
}

const getPowerFactorTag = (pf) => {
  if (pf >= 0.95) return 'success'
  if (pf >= 0.9) return 'warning'
  return 'danger'
}

const getPowerFactorText = (pf) => {
  if (pf >= 0.95) return '优秀'
  if (pf >= 0.9) return '良好'
  return '需优化'
}
</script>

<style scoped>
.circuit-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  flex: 1;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.box-select {
  width: 200px;
}

.data-table {
  width: 100%;
}
</style>
