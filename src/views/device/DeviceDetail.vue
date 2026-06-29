<template>
  <div class="page-container">
    <div class="page-header">
      <div class="title">设备详情</div>
      <div class="header-actions">
        <router-link to="/device/list">
          <el-button>返回列表</el-button>
        </router-link>
      </div>
    </div>
    <div v-if="device" class="detail-content">
      <div class="detail-header">
        <div class="device-title">
          <h2>{{ device.name }}</h2>
          <el-tag :type="getStatusTagType(device.status)" class="status-tag">
            {{ getStatusText(device.status) }}
          </el-tag>
        </div>
        <div class="device-id">设备编号: {{ device.id }}</div>
      </div>
      <div class="detail-grid">
        <div class="detail-card">
          <div class="card-title">基本信息</div>
          <el-form label-width="100px">
            <el-form-item label="设备型号">{{ device.model }}</el-form-item>
            <el-form-item label="设备类型">{{ device.type }}</el-form-item>
            <el-form-item label="安装位置">{{ device.location }}</el-form-item>
            <el-form-item label="安装日期">{{ device.installDate }}</el-form-item>
          </el-form>
        </div>
        <div class="detail-card">
          <div class="card-title">设备参数</div>
          <el-form label-width="100px">
            <el-form-item label="额定电压">{{ device.voltage }}V</el-form-item>
            <el-form-item label="额定功率">{{ device.power }}W</el-form-item>
            <el-form-item label="当前亮度">
              <el-progress :percentage="device.brightness" :show-text="true" />
            </el-form-item>
            <el-form-item v-if="device.faultReason" label="故障原因">
              <el-tag type="danger">{{ device.faultReason }}</el-tag>
            </el-form-item>
          </el-form>
        </div>
        <div class="detail-card">
          <div class="card-title">维护信息</div>
          <el-form label-width="100px">
            <el-form-item label="上次维护">{{ device.lastMaintenance }}</el-form-item>
            <el-form-item label="下次维护">
              <el-tag type="info">{{ getNextMaintenance(device.lastMaintenance) }}</el-tag>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <div class="detail-actions">
        <router-link :to="'/device/add'">
          <el-button type="primary">复制新增</el-button>
        </router-link>
        <el-button @click="goBack">返回列表</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { deviceList } from '@/data/mockData'

const route = useRoute()
const router = useRouter()
const device = ref(null)

onMounted(() => {
  const id = route.params.id
  device.value = deviceList.find(d => d.id === id) || deviceList[0]
})

const getStatusTagType = (status) => {
  switch (status) {
    case 'online': return 'success'
    case 'offline': return 'info'
    case 'fault': return 'danger'
    default: return 'info'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'online': return '在线'
    case 'offline': return '离线'
    case 'fault': return '故障'
    default: return status
  }
}

const getNextMaintenance = (lastDate) => {
  if (!lastDate) return '未维护'
  const date = new Date(lastDate)
  date.setMonth(date.getMonth() + 3)
  return date.toISOString().split('T')[0]
}

const goBack = () => {
  router.push('/device/list')
}
</script>

<style scoped>
.detail-header {
  margin-bottom: 25px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  color: #fff;
}

.device-title {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
}

.device-title h2 {
  margin: 0;
  font-size: 24px;
}

.status-tag {
  font-size: 12px;
}

.device-id {
  font-size: 14px;
  opacity: 0.9;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}

.detail-card {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e8e8e8;
}

.detail-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}
</style>