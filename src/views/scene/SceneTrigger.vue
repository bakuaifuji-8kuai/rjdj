<template>
  <div class="page-container">
    <div class="page-header">
      <div class="title">一键场景触发</div>
      <div class="header-actions">
        <el-button type="primary" @click="refreshStatus">
          <component :is="icons.Refresh" />
          刷新状态
        </el-button>
      </div>
    </div>
    <div class="trigger-section">
      <div class="section-title">快速触发</div>
      <div class="quick-triggers">
        <div 
          v-for="template in enabledTemplates" 
          :key="template.id"
          class="trigger-card"
          @click="triggerScene(template)"
        >
          <div class="trigger-icon">
            <component :is="icons.Lightbulb" />
          </div>
          <div class="trigger-info">
            <span class="trigger-name">{{ template.name }}</span>
            <span class="trigger-brightness">亮度: {{ template.brightness }}%</span>
          </div>
          <el-button type="primary" size="small">触发</el-button>
        </div>
      </div>
    </div>
    <div class="trigger-section">
      <div class="section-title">当前场景状态</div>
      <div class="current-scene">
        <div class="scene-status">
          <el-tag :type="currentScene ? 'success' : 'info'" size="large">
            {{ currentScene ? '场景运行中: ' + currentScene.name : '无场景运行' }}
          </el-tag>
        </div>
        <div v-if="currentScene" class="scene-detail">
          <div class="detail-row">
            <span class="detail-label">亮度设置</span>
            <el-progress :percentage="currentScene.brightness" :show-text="true" />
          </div>
          <div class="detail-row">
            <span class="detail-label">启动时间</span>
            <span class="detail-value">{{ currentScene.startTime }}</span>
          </div>
          <div class="detail-actions">
            <el-button type="warning" @click="stopScene">停止场景</el-button>
          </div>
        </div>
      </div>
    </div>
    <div class="trigger-section">
      <div class="section-title">触发历史记录</div>
      <el-table :data="triggerHistory" border class="history-table">
        <el-table-column prop="time" label="触发时间" width="180" />
        <el-table-column prop="sceneName" label="场景名称" />
        <el-table-column prop="brightness" label="亮度(%)" width="100" />
        <el-table-column prop="operator" label="操作人" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'success' ? 'success' : 'danger'">
              {{ scope.row.status === 'success' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-dialog title="场景触发确认" v-model="confirmDialogVisible" width="400px">
      <div class="confirm-content">
        <p>确认触发场景:</p>
        <p class="scene-name">{{ pendingScene?.name }}</p>
        <p class="scene-desc">{{ pendingScene?.description }}</p>
      </div>
      <template #footer>
        <el-button @click="confirmDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmTrigger">确认触发</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Refresh, Sunrise } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const icons = { Refresh, Lightbulb: Sunrise }
const templates = ref([
  { id: 'S001', name: '节日庆典模式', description: '全亮度照明，营造节日氛围', brightness: 100, duration: null, enabled: true },
  { id: 'S002', name: '节能模式', description: '降低亮度至50%，节省电能', brightness: 50, duration: null, enabled: true },
  { id: 'S003', name: '深夜模式', description: '凌晨2点后降低亮度', brightness: 30, duration: '02:00-05:00', enabled: true },
  { id: 'S004', name: '应急模式', description: '突发情况全亮照明', brightness: 100, duration: null, enabled: false },
  { id: 'S005', name: '雾霾模式', description: '提高亮度应对低能见度', brightness: 90, duration: null, enabled: true }
])
const confirmDialogVisible = ref(false)
const pendingScene = ref(null)
const currentScene = ref(null)

const triggerHistory = ref([
  { id: 1, time: '2024-01-15 14:30:22', sceneName: '节能模式', brightness: 50, operator: '管理员', status: 'success' },
  { id: 2, time: '2024-01-15 10:15:33', sceneName: '节日庆典模式', brightness: 100, operator: '张三', status: 'success' },
  { id: 3, time: '2024-01-14 22:00:00', sceneName: '深夜模式', brightness: 30, operator: '系统自动', status: 'success' },
  { id: 4, time: '2024-01-14 18:30:00', sceneName: '日常照明策略', brightness: 100, operator: '系统自动', status: 'success' },
  { id: 5, time: '2024-01-13 14:20:00', sceneName: '雾霾模式', brightness: 90, operator: '李四', status: 'success' }
])

const enabledTemplates = computed(() => {
  return templates.value.filter(t => t.enabled)
})

const triggerScene = (template) => {
  pendingScene.value = template
  confirmDialogVisible.value = true
}

const confirmTrigger = () => {
  if (pendingScene.value) {
    currentScene.value = {
      ...pendingScene.value,
      startTime: new Date().toLocaleString('zh-CN')
    }
    triggerHistory.value.unshift({
      id: Date.now(),
      time: new Date().toLocaleString('zh-CN'),
      sceneName: pendingScene.value.name,
      brightness: pendingScene.value.brightness,
      operator: '管理员',
      status: 'success'
    })
    ElMessage.success('场景触发成功')
  }
  confirmDialogVisible.value = false
}

const stopScene = () => {
  currentScene.value = null
  ElMessage.info('场景已停止')
}

const refreshStatus = () => {
  ElMessage.success('状态已刷新')
}
</script>

<style scoped>
.trigger-section {
  margin-bottom: 25px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #333;
}

.quick-triggers {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
}

.trigger-card {
  display: flex;
  align-items: center;
  gap: 15px;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }
}

.trigger-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
}

.trigger-info {
  flex: 1;
}

.trigger-name {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.trigger-brightness {
  font-size: 13px;
  color: #666;
}

.current-scene {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.scene-status {
  margin-bottom: 20px;
}

.scene-detail {
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.detail-row {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.detail-label {
  width: 100px;
  font-size: 14px;
  color: #666;
}

.detail-value {
  font-size: 14px;
  color: #333;
}

.detail-actions {
  margin-top: 15px;
}

.history-table {
  width: 100%;
}

.confirm-content {
  padding: 10px 0;
}

.confirm-content p {
  margin-bottom: 8px;
  color: #666;
}

.scene-name {
  font-size: 18px;
  font-weight: 600;
  color: #333 !important;
}

.scene-desc {
  color: #999 !important;
  font-size: 14px;
}
</style>