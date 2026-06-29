<template>
  <div class="page-container">
    <div class="page-header">
      <div class="title">新建工单</div>
      <div class="header-actions">
        <router-link to="/workorder/list">
          <el-button>返回列表</el-button>
        </router-link>
      </div>
    </div>
    <el-form :model="formData" label-width="120px" class="workorder-form">
      <div class="form-section">
        <div class="section-title">基本信息</div>
        <el-form-item label="工单类型" prop="type" required>
          <el-select v-model="formData.type" placeholder="请选择工单类型">
            <el-option label="故障工单" value="fault" />
            <el-option label="维修工单" value="maintenance" />
          </el-select>
        </el-form-item>
        <el-form-item label="工单标题" prop="title" required>
          <el-input v-model="formData.title" placeholder="请输入工单标题" />
        </el-form-item>
        <el-form-item label="详细描述" prop="description">
          <el-textarea v-model="formData.description" rows="4" placeholder="请输入详细描述" />
        </el-form-item>
      </div>
      <div class="form-section">
        <div class="section-title">位置信息</div>
        <el-form-item label="地点" prop="location" required>
          <el-input v-model="formData.location" placeholder="请输入地点" />
        </el-form-item>
      </div>
      <div class="form-section">
        <div class="section-title">优先级</div>
        <el-form-item label="优先级" prop="priority">
          <el-select v-model="formData.priority">
            <el-option label="高" value="high" />
            <el-option label="中" value="medium" />
            <el-option label="低" value="low" />
          </el-select>
        </el-form-item>
      </div>
      <div class="form-actions">
        <router-link to="/workorder/list">
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

const router = useRouter()
const formData = ref({
  type: '',
  title: '',
  description: '',
  location: '',
  priority: 'medium',
  status: 'pending',
  assignee: '',
  createTime: '',
  updateTime: ''
})

const generateId = () => {
  const timestamp = Date.now().toString(36).toUpperCase()
  return 'WO' + timestamp.slice(-3) + String(Math.random()).slice(-3).toUpperCase()
}

const submitForm = () => {
  if (!formData.value.type || !formData.value.title || !formData.value.location) {
    ElMessage.warning('请填写必填项')
    return
  }
  
  const now = new Date().toLocaleString('zh-CN')
  formData.value.id = generateId()
  formData.value.createTime = now
  formData.value.updateTime = now
  
  ElMessage.success('工单创建成功')
  router.push('/workorder/list')
}
</script>

<style scoped>
.workorder-form {
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