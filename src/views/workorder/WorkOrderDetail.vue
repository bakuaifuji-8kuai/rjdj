<template>
  <div class="page-container">
    <div class="page-header">
      <div class="title">工单详情</div>
      <div class="header-actions">
        <router-link to="/workorder/list">
          <el-button>返回列表</el-button>
        </router-link>
      </div>
    </div>
    <div v-if="order" class="detail-content">
      <div class="detail-header">
        <div class="order-title">
          <h2>{{ order.title }}</h2>
          <div class="order-tags">
            <el-tag :type="order.type === 'fault' ? 'danger' : 'warning'">
              {{ order.type === 'fault' ? '故障工单' : '维修工单' }}
            </el-tag>
            <el-tag :type="getPriorityTagType(order.priority)">
              {{ getPriorityText(order.priority) }}优先级
            </el-tag>
            <el-tag :type="getStatusTagType(order.status)">
              {{ getStatusText(order.status) }}
            </el-tag>
          </div>
        </div>
        <div class="order-id">工单编号: {{ order.id }}</div>
      </div>
      <div class="detail-grid">
        <div class="detail-card">
          <div class="card-title">基本信息</div>
          <el-form label-width="100px">
            <el-form-item label="工单类型">
              <el-tag :type="order.type === 'fault' ? 'danger' : 'warning'">
                {{ order.type === 'fault' ? '故障工单' : '维修工单' }}
              </el-tag>
            </el-form-item>
            <el-form-item label="优先级">
              <el-tag :type="getPriorityTagType(order.priority)">
                {{ getPriorityText(order.priority) }}
              </el-tag>
            </el-form-item>
            <el-form-item label="当前状态">
              <el-tag :type="getStatusTagType(order.status)">
                {{ getStatusText(order.status) }}
              </el-tag>
            </el-form-item>
            <el-form-item label="处理人员">{{ order.assignee || '未分配' }}</el-form-item>
          </el-form>
        </div>
        <div class="detail-card">
          <div class="card-title">位置信息</div>
          <el-form label-width="100px">
            <el-form-item label="地点">{{ order.location }}</el-form-item>
          </el-form>
        </div>
        <div class="detail-card full-width">
          <div class="card-title">详细描述</div>
          <div class="description-content">{{ order.description }}</div>
        </div>
        <div class="detail-card">
          <div class="card-title">时间信息</div>
          <el-form label-width="100px">
            <el-form-item label="创建时间">{{ order.createTime }}</el-form-item>
            <el-form-item label="更新时间">{{ order.updateTime }}</el-form-item>
          </el-form>
        </div>
      </div>
      <div class="status-timeline">
        <div class="timeline-title">工单流程</div>
        <el-timeline>
          <el-timeline-item timestamp="创建">工单已创建，等待处理</el-timeline-item>
          <el-timeline-item v-if="order.status !== 'pending'" timestamp="派发">工单已派发给 {{ order.assignee }}</el-timeline-item>
          <el-timeline-item v-if="order.status === 'completed'" timestamp="完成">工单已完成</el-timeline-item>
        </el-timeline>
      </div>
      <div class="detail-actions">
        <el-button 
          v-if="order.status === 'pending'" 
          type="primary" 
          @click="handleAssign"
        >
          派发工单
        </el-button>
        <el-button 
          v-if="order.status === 'processing'" 
          type="success" 
          @click="handleComplete"
        >
          完成工单
        </el-button>
        <router-link to="/workorder/create">
          <el-button>创建类似工单</el-button>
        </router-link>
      </div>
    </div>
    <el-dialog title="派发工单" :visible.sync="assignDialogVisible" width="450px">
      <el-form :model="assignForm" label-width="80px">
        <el-form-item label="处理人员">
          <el-select v-model="assignForm.assignee" placeholder="请选择处理人员">
            <el-option label="张三" value="张三" />
            <el-option label="李四" value="李四" />
            <el-option label="王五" value="王五" />
            <el-option label="赵六" value="赵六" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="assignDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAssign">确认派发</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { workOrders } from '@/data/mockData'

const route = useRoute()
const router = useRouter()
const order = ref(null)
const assignDialogVisible = ref(false)
const assignForm = ref({ assignee: '' })

onMounted(() => {
  const id = route.params.id
  order.value = workOrders.find(w => w.id === id) || workOrders[0]
})

const getPriorityTagType = (priority) => {
  switch (priority) {
    case 'high': return 'danger'
    case 'medium': return 'warning'
    case 'low': return 'success'
    default: return 'info'
  }
}

const getPriorityText = (priority) => {
  switch (priority) {
    case 'high': return '高'
    case 'medium': return '中'
    case 'low': return '低'
    default: return priority
  }
}

const getStatusTagType = (status) => {
  switch (status) {
    case 'pending': return 'warning'
    case 'processing': return 'primary'
    case 'completed': return 'success'
    default: return 'info'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'pending': return '待处理'
    case 'processing': return '处理中'
    case 'completed': return '已完成'
    default: return status
  }
}

const handleAssign = () => {
  assignForm.value = { assignee: '' }
  assignDialogVisible.value = true
}

const confirmAssign = () => {
  if (!assignForm.value.assignee) {
    ElMessage.warning('请选择处理人员')
    return
  }
  
  if (order.value) {
    order.value.assignee = assignForm.value.assignee
    order.value.status = 'processing'
    order.value.updateTime = new Date().toLocaleString('zh-CN')
  }
  ElMessage.success('派发成功')
  assignDialogVisible.value = false
}

const handleComplete = () => {
  ElMessageBox.confirm(
    '确定要完成此工单吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success'
    }
  ).then(() => {
    if (order.value) {
      order.value.status = 'completed'
      order.value.updateTime = new Date().toLocaleString('zh-CN')
    }
    ElMessage.success('工单已完成')
  }).catch(() => {
    ElMessage.info('已取消')
  })
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

.order-title {
  margin-bottom: 10px;
}

.order-title h2 {
  margin: 0 0 10px 0;
  font-size: 24px;
}

.order-tags {
  display: flex;
  gap: 10px;
}

.order-id {
  font-size: 14px;
  opacity: 0.9;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}

.detail-card {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  
  &.full-width {
    grid-column: 1 / -1;
  }
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
  color: #333;
}

.description-content {
  padding: 15px;
  background: #fafafa;
  border-radius: 4px;
  line-height: 1.6;
  color: #666;
}

.status-timeline {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 25px;
}

.timeline-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #333;
}

.detail-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}
</style>