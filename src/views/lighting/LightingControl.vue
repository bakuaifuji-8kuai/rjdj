<template>
  <div class="page-container">
    <div class="page-header">
      <div class="title">照明控制</div>
    </div>
    <div class="content-area">
      <div class="control-panel">
        <el-card class="control-card">
          <template #header>
            <div class="card-header">
              <span>照明控制</span>
            </div>
          </template>
          <div class="control-content">
            <div class="control-item">
              <span class="label">区域选择：</span>
              <el-select v-model="selectedArea" placeholder="请选择区域" style="width: 200px">
                <el-option label="先导路" value="xiandao" />
                <el-option label="力唯中天1栋" value="liwei" />
              </el-select>
            </div>
            <div class="control-item">
              <span class="label">当前亮度：</span>
              <el-slider v-model="brightness" :min="0" :max="100" style="width: 300px" />
              <span class="value">{{ brightness }}%</span>
            </div>
            <div class="control-item">
              <span class="label">快速操作：</span>
              <el-button type="primary" @click="setBrightness(100)">全亮</el-button>
              <el-button @click="setBrightness(50)">半亮</el-button>
              <el-button type="info" @click="setBrightness(0)">全关</el-button>
            </div>
            <div class="control-item">
              <el-button type="primary" size="large" @click="applyLighting">应用</el-button>
            </div>
          </div>
        </el-card>

        <el-card class="status-card">
          <template #header>
            <div class="card-header">
              <span>当前状态</span>
            </div>
          </template>
          <div class="status-content">
            <div class="status-item">
              <span class="status-label">设备在线数：</span>
              <span class="status-value success">156</span>
            </div>
            <div class="status-item">
              <span class="status-label">当前功耗：</span>
              <span class="status-value">45.6 kW</span>
            </div>
            <div class="status-item">
              <span class="status-label">今日能耗：</span>
              <span class="status-value">328.5 kWh</span>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const selectedArea = ref('xiandao')
const brightness = ref(50)

const setBrightness = (value) => {
  brightness.value = value
}

const applyLighting = () => {
  ElMessage.success('照明控制已应用，亮度：' + brightness.value + '%')
}
</script>

<style scoped>
.page-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-header {
  margin-bottom: 20px;
}

.title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.content-area {
  flex: 1;
}

.control-panel {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.control-card, .status-card {
  background: #fff;
}

.card-header {
  font-weight: 600;
  font-size: 16px;
}

.control-content {
  padding: 20px 0;
}

.control-item {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  gap: 15px;
}

.label {
  font-weight: 500;
  min-width: 100px;
}

.value {
  margin-left: 15px;
  font-size: 18px;
  font-weight: 600;
  color: #409eff;
  min-width: 60px;
}

.status-content {
  padding: 20px 0;
}

.status-item {
  display: flex;
  justify-content: space-between;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
}

.status-item:last-child {
  border-bottom: none;
}

.status-label {
  color: #666;
}

.status-value {
  font-weight: 600;
  color: #333;
}

.status-value.success {
  color: #67c23a;
}
</style>