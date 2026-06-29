<template>
  <div class="page-container">
    <div class="page-header">
      <div class="title">历史下发场景</div>
      <div class="header-right">
        <el-button @click="refreshData">刷新</el-button>
      </div>
    </div>

    <div class="content-area">
      <el-table :data="historyScenes" border class="scene-table">
        <el-table-column prop="no" label="No" width="60" align="center" />
        <el-table-column prop="sceneName" label="场景名称" min-width="200" />
        <el-table-column prop="operator" label="下发人员" width="150" />
        <el-table-column prop="deployTime" label="下发时间" width="200" />
        <el-table-column label="操作" width="100" align="center">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 15, 20, 50, 100]"
          layout="prev, pager, next, jumper, ->, sizes, total"
        />
      </div>

      <div class="bottom-buttons">
        <el-button size="small">隐藏</el-button>
        <el-button size="small">显示</el-button>
      </div>
    </div>

    <el-dialog v-model="showDetailDialog" title="下发详情" width="450px">
      <div class="detail-content" v-if="currentRecord">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="场景名称">
            <span class="scene-name">{{ currentRecord.sceneName }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="下发人员">{{ currentRecord.operator }}</el-descriptions-item>
          <el-descriptions-item label="下发时间">{{ currentRecord.deployTime }}</el-descriptions-item>
          <el-descriptions-item label="场景类型">
            <el-tag :type="currentRecord.type === 'timer' ? 'primary' : 'success'" size="small">
              {{ currentRecord.type === 'timer' ? '定时场景' : (currentRecord.type === 'light' ? '光感场景' : '未知') }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
        <div class="detail-extra">
          <el-divider content-position="left">下发信息</el-divider>
          <div class="info-row">
            <span class="info-label">下发状态:</span>
            <el-tag type="success" size="small">下发成功</el-tag>
          </div>
          <div class="info-row">
            <span class="info-label">执行结果:</span>
            <span class="info-value">已成功下发至关联设备</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const currentPage = ref(1)
const pageSize = ref(15)
const total = ref(0)
const showDetailDialog = ref(false)
const currentRecord = ref(null)

const defaultHistoryScenes = ref([
  { no: 1, sceneName: '园区路灯照明', operator: 'tanrongfu', deployTime: '2026-01-09 13:59:26' },
  { no: 2, sceneName: '定时', operator: 'admin', deployTime: '2026-01-05 11:33:52' },
  { no: 3, sceneName: '开关', operator: 'test08', deployTime: '2025-05-08 11:17:53' },
  { no: 4, sceneName: '开关2', operator: 'test08', deployTime: '2025-05-08 10:26:38' },
  { no: 5, sceneName: '开关2', operator: 'test08', deployTime: '2025-05-08 09:57:31' },
  { no: 6, sceneName: '开关2', operator: 'test08', deployTime: '2025-05-07 18:28:36' },
  { no: 7, sceneName: '开关', operator: 'test08', deployTime: '2025-05-07 17:41:50' },
  { no: 8, sceneName: '开关', operator: 'test08', deployTime: '2025-05-07 11:09:09' },
  { no: 9, sceneName: '开关2', operator: 'test08', deployTime: '2025-05-07 11:08:53' },
  { no: 10, sceneName: '开关', operator: 'test08', deployTime: '2025-05-07 10:43:24' },
  { no: 11, sceneName: '开关2', operator: 'test08', deployTime: '2025-05-06 18:19:53' },
  { no: 12, sceneName: '开关2', operator: 'test08', deployTime: '2025-05-06 16:09:25' },
  { no: 13, sceneName: '开关', operator: 'test08', deployTime: '2025-05-06 16:07:33' },
  { no: 14, sceneName: '园区路灯照明', operator: 'test08', deployTime: '2025-05-06 16:07:18' },
  { no: 15, sceneName: '测试', operator: 'test08', deployTime: '2024-11-19 15:02:00' }
])

const historyScenes = ref([])

const loadHistoryData = () => {
  const storedHistory = localStorage.getItem('sceneDeployHistory')
  if (storedHistory) {
    const newRecords = JSON.parse(storedHistory)
    if (newRecords.length > 0) {
      historyScenes.value = [...newRecords, ...defaultHistoryScenes.value]
    } else {
      historyScenes.value = [...defaultHistoryScenes.value]
    }
  } else {
    historyScenes.value = [...defaultHistoryScenes.value]
  }
  total.value = historyScenes.value.length
}

onMounted(() => {
  loadHistoryData()
})

const refreshData = () => {
  loadHistoryData()
  ElMessage.success('数据已刷新')
}

const handleDetail = (row) => {
  currentRecord.value = row
  showDetailDialog.value = true
}
</script>

<style scoped>
.page-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.page-header .title {
  font-size: 18px;
  font-weight: 600;
  color: #1f1f1f;
}

.header-right {
  display: flex;
  gap: 10px;
}

.content-area {
  flex: 1;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 15px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.scene-table {
  flex: 1;
  overflow: hidden;
}

.pagination-wrapper {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}

.bottom-buttons {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.detail-content {
  padding: 10px 0;
}

.scene-name {
  font-weight: 600;
  color: #1f1f1f;
}

.detail-extra {
  margin-top: 15px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.info-label {
  font-weight: 500;
  color: #333;
  min-width: 80px;
}

.info-value {
  color: #666;
}
</style>
