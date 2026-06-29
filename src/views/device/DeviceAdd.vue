<template>
  <div class="page-container">
    <div class="page-header">
      <div class="title">新增设备</div>
      <div class="header-actions">
        <router-link to="/device/list">
          <el-button>返回列表</el-button>
        </router-link>
      </div>
    </div>
    <el-form :model="formData" label-width="120px" class="device-form">
      <div class="form-section">
        <div class="section-title">基本信息</div>
        <el-form-item label="设备编号" prop="id">
          <el-input v-model="formData.id" placeholder="自动生成" disabled />
        </el-form-item>
        <el-form-item label="设备名称" prop="name" required>
          <el-input v-model="formData.name" placeholder="请输入设备名称" />
        </el-form-item>
        <el-form-item label="设备型号" prop="model" required>
          <el-input v-model="formData.model" placeholder="请输入设备型号" />
        </el-form-item>
        <el-form-item label="设备类型" prop="type" required>
          <el-select v-model="formData.type" placeholder="请选择设备类型">
            <el-option label="LED路灯" value="LED路灯" />
            <el-option label="高压钠灯" value="高压钠灯" />
            <el-option label="金卤灯" value="金卤灯" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
      </div>
      <div class="form-section">
        <div class="section-title">安装信息</div>
        <el-form-item label="安装位置" prop="location" required>
          <el-input v-model="formData.location" placeholder="请输入安装位置" />
        </el-form-item>
        <el-form-item label="安装日期" prop="installDate">
          <el-date-picker 
            v-model="formData.installDate" 
            type="date" 
            placeholder="选择安装日期"
          />
        </el-form-item>
      </div>
      <div class="form-section">
        <div class="section-title">设备参数</div>
        <el-form-item label="额定电压(V)" prop="voltage">
          <el-input v-model="formData.voltage" type="number" placeholder="请输入额定电压" />
        </el-form-item>
        <el-form-item label="额定功率(W)" prop="power">
          <el-input v-model="formData.power" type="number" placeholder="请输入额定功率" />
        </el-form-item>
        <el-form-item label="亮度(%)" prop="brightness">
          <el-slider v-model="formData.brightness" :min="0" :max="100" :step="1" show-input />
        </el-form-item>
      </div>
      <div class="form-section">
        <div class="section-title">维护信息</div>
        <el-form-item label="上次维护日期" prop="lastMaintenance">
          <el-date-picker 
            v-model="formData.lastMaintenance" 
            type="date" 
            placeholder="选择维护日期"
          />
        </el-form-item>
        <el-form-item label="备注信息" prop="remark">
          <el-textarea v-model="formData.remark" rows="3" placeholder="请输入备注信息" />
        </el-form-item>
      </div>
      <div class="form-actions">
        <router-link to="/device/list">
          <el-button>取消</el-button>
        </router-link>
        <el-button type="primary" @click="submitForm">提交</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const formData = ref({
  id: '',
  name: '',
  model: '',
  type: '',
  location: '',
  installDate: '',
  voltage: 220,
  power: 150,
  brightness: 80,
  lastMaintenance: '',
  remark: '',
  status: 'offline'
})

const generateId = () => {
  const timestamp = Date.now().toString(36).toUpperCase()
  return 'DVC' + timestamp.slice(-3) + String(Math.random()).slice(-3).toUpperCase()
}

const submitForm = () => {
  if (!formData.value.name || !formData.value.model || !formData.value.type || !formData.value.location) {
    ElMessage.warning('请填写必填项')
    return
  }
  
  formData.value.id = generateId()
  ElMessage.success('设备添加成功')
  router.push('/device/list')
}
</script>

<style scoped>
.device-form {
  max-width: 600px;
  margin: 0 auto;
}

.form-section {
  margin-bottom: 25px;
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e8e8e8;
  color: #333;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  padding-top: 20px;
}
</style>