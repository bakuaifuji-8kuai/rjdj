<template>
  <div class="workorder-stats">
    <div class="page-header">
      <h2>工单统计</h2>
      <div class="header-actions">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 300px;"
        />
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <div class="stats-panel">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <el-icon :size="28"><Document /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.total }}</div>
                <div class="stat-label">总工单</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                <el-icon :size="28"><Clock /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value" style="color: #f56c6c;">{{ stats.pending }}</div>
                <div class="stat-label">待处理</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                <el-icon :size="28"><Tools /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value" style="color: #e6a23c;">{{ stats.processing }}</div>
                <div class="stat-label">处理中</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
                <el-icon :size="28"><CircleCheck /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value" style="color: #67c23a;">{{ stats.completed }}</div>
                <div class="stat-label">已完成</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">工单类型分布</div>
          </template>
          <div class="chart-container">
            <el-table :data="typeStats" border>
              <el-table-column prop="type" label="工单类型" />
              <el-table-column prop="count" label="数量" width="100" align="center" />
              <el-table-column label="占比" width="150">
                <template #default="{ row }">
                  <div class="progress-bar">
                    <el-progress :percentage="row.percentage" :color="row.color" :stroke-width="10" />
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">优先级分布</div>
          </template>
          <div class="chart-container">
            <el-table :data="priorityStats" border>
              <el-table-column prop="priority" label="优先级" />
              <el-table-column prop="count" label="数量" width="100" align="center" />
              <el-table-column label="占比" width="150">
                <template #default="{ row }">
                  <div class="progress-bar">
                    <el-progress :percentage="row.percentage" :color="row.color" :stroke-width="10" />
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">处理人工作量排行</div>
          </template>
          <div class="chart-container">
            <el-table :data="handlerStats" border>
              <el-table-column prop="rank" label="排名" width="80" align="center">
                <template #default="{ row }">
                  <el-tag v-if="row.rank === 1" type="danger" size="small">第1名</el-tag>
                  <el-tag v-else-if="row.rank === 2" type="warning" size="small">第2名</el-tag>
                  <el-tag v-else-if="row.rank === 3" type="info" size="small">第3名</el-tag>
                  <span v-else>第{{ row.rank }}名</span>
                </template>
              </el-table-column>
              <el-table-column prop="handler" label="处理人" />
              <el-table-column prop="count" label="处理工单数" width="120" align="center" />
              <el-table-column prop="completed" label="完成工单数" width="120" align="center" />
            </el-table>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">趋势分析</div>
          </template>
          <div class="chart-container">
            <div class="trend-content">
              <div class="trend-item">
                <span class="trend-label">平均处理时间：</span>
                <span class="trend-value">2.5小时</span>
                <el-tag type="success" size="small">↓ 比上周下降15%</el-tag>
              </div>
              <div class="trend-item">
                <span class="trend-label">工单及时率：</span>
                <span class="trend-value">95%</span>
                <el-tag type="success" size="small">↑ 比上周上升3%</el-tag>
              </div>
              <div class="trend-item">
                <span class="trend-label">客户满意度：</span>
                <span class="trend-value">4.8/5.0</span>
                <el-tag type="info" size="small">持平</el-tag>
              </div>
              <div class="trend-item">
                <span class="trend-label">重复工单率：</span>
                <span class="trend-value">3%</span>
                <el-tag type="success" size="small">↓ 比上周下降2%</el-tag>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, Clock, Tools, CircleCheck } from '@element-plus/icons-vue'

const dateRange = ref(null)

const stats = ref({
  total: 45,
  pending: 8,
  processing: 12,
  completed: 25
})

const typeStats = ref([
  { type: '维修工单', count: 25, percentage: 56, color: '#f56c6c' },
  { type: '巡检工单', count: 15, percentage: 33, color: '#409eff' },
  { type: '安装工单', count: 5, percentage: 11, color: '#67c23a' }
])

const priorityStats = ref([
  { priority: '紧急', count: 6, percentage: 13, color: '#f56c6c' },
  { priority: '高', count: 15, percentage: 33, color: '#e6a23c' },
  { priority: '中', count: 20, percentage: 44, color: '#409eff' },
  { priority: '低', count: 4, percentage: 9, color: '#67c23a' }
])

const handlerStats = ref([
  { rank: 1, handler: '张工', count: 18, completed: 16 },
  { rank: 2, handler: '李工', count: 15, completed: 13 },
  { rank: 3, handler: '王工', count: 12, completed: 10 },
  { rank: 4, handler: '赵工', count: 9, completed: 8 },
  { rank: 5, handler: '刘工', count: 7, completed: 6 }
])

const handleQuery = () => {
  ElMessage.success('查询成功')
}

const handleReset = () => {
  dateRange.value = null
  ElMessage.success('已重置')
}
</script>

<style scoped>
.workorder-stats {
  background: #f5f5f5;
  min-height: 100%;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.stats-panel {
  margin-bottom: 0;
}

.stat-card {
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px 0;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.card-header {
  font-weight: 600;
  font-size: 16px;
}

.chart-container {
  min-height: 250px;
}

.progress-bar {
  padding: 5px 0;
}

.trend-content {
  padding: 20px 0;
}

.trend-item {
  display: flex;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 25px;
  border-bottom: 1px solid #eee;
}

.trend-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.trend-label {
  font-size: 15px;
  color: #666;
  width: 140px;
}

.trend-value {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-right: 15px;
}
</style>
