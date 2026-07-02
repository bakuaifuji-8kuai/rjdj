<template>
  <div class="quick-operation-container">
    <div class="page-header">
      <div class="header-left">
        <div class="title-wrapper">
          <div class="title-icon">
            <el-icon :size="24"><Zap /></el-icon>
          </div>
          <div>
            <h1 class="main-title">快捷场景操作</h1>
            <p class="sub-title">快速执行预设场景，高效管理照明系统</p>
          </div>
        </div>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleAdd" class="add-btn">
          <el-icon :size="16"><Plus /></el-icon>
          新增场景
        </el-button>
      </div>
    </div>

    <div class="tabs-container">
      <el-tabs v-model="activeTab" class="main-tabs">
        <el-tab-pane label="场景控制" name="control">
          <div class="control-panel">
            <div class="filter-bar">
              <div class="search-box">
                <el-input 
                  v-model="filterKeyword" 
                  placeholder="请输入场景名称查询" 
                  class="search-input"
                  prefix-icon="Search"
                />
              </div>
              <el-button type="primary" @click="handleSearch" class="search-btn">查询</el-button>
              <el-button @click="handleReset" class="reset-btn">重置</el-button>
            </div>

            <div class="batch-bar" v-if="selectedScenes.length > 0">
              <span class="batch-info">已选择 <span class="selected-count">{{ selectedScenes.length }}</span> 个场景</span>
              <el-button type="danger" @click="handleBatchExecute">批量执行</el-button>
              <el-button @click="handleClearSelection">取消选择</el-button>
            </div>

            <div class="scene-grid">
              <div 
                v-for="scene in filteredScenes" 
                :key="scene.id" 
                class="scene-card"
                :class="{ selected: scene.selected }"
                @click="toggleSelect(scene)"
              >
                <div class="card-header">
                  <label class="checkbox-wrapper">
                    <el-checkbox v-model="scene.selected" />
                  </label>
                  <span class="scene-name">{{ scene.name }}</span>
                  <span class="scene-tag">{{ getTagText(scene.id) }}</span>
                </div>
                <div class="card-body">
                  <div class="scene-info">
                    <span class="scene-id">ID: {{ scene.id }}</span>
                  </div>
                </div>
                <div class="card-footer">
                  <el-button type="primary" @click.stop="handleExecute(scene)" class="execute-btn">
                    <el-icon :size="14"><Play /></el-icon>
                    执行
                  </el-button>
                  <el-button @click.stop="handleResult(scene)" class="result-btn">
                    <el-icon :size="14"><InfoFilled /></el-icon>
                    结果
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="场景下发记录" name="records">
          <div class="records-panel">
            <div class="records-header">
              <div class="records-title">下发记录列表</div>
              <el-button @click="handleRefreshRecords">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
            <el-table :data="recordsData" border class="records-table">
              <el-table-column prop="no" label="#" width="60" align="center">
                <template #default="{ $index }">
                  <span class="row-number">{{ $index + 1 }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="sceneName" label="场景名称" min-width="180">
                <template #default="{ row }">
                  <span class="scene-name-cell">{{ row.sceneName }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="executeTime" label="下发时间" min-width="180">
                <template #default="{ row }">
                  <span class="time-cell">{{ row.executeTime }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="100" align="center">
                <template #default="{ row }">
                  <div class="status-badge" :class="row.status">
                    <span class="status-dot"></span>
                    {{ row.status === 'success' ? '成功' : '失败' }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="detail" label="详情" min-width="200">
                <template #default="{ row }">
                  <span class="detail-cell">{{ row.detail }}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100" align="center">
                <template #default="{ row }">
                  <el-button size="small" @click="handleViewDetail(row)">详情</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <el-dialog title="执行结果" v-model="showResultDialog" width="550px" class="result-dialog">
      <div class="result-content">
        <div class="result-header" :class="resultData.status">
          <div class="result-icon">
            <el-icon v-if="resultData.status === 'success'" :size="48"><CheckCircle /></el-icon>
            <el-icon v-else :size="48"><CloseCircle /></el-icon>
          </div>
          <div class="result-title">
            {{ resultData.status === 'success' ? '执行成功' : '执行失败' }}
          </div>
        </div>
        <el-descriptions :column="2" :data="resultData" border class="result-descriptions">
          <el-descriptions-item label="场景名称" label-class-name="desc-label">
            <span class="desc-value">{{ resultData.name }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="执行时间" label-class-name="desc-label">
            <span class="desc-value">{{ resultData.executeTime }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="状态" label-class-name="desc-label">
            <el-tag :type="resultData.status === 'success' ? 'success' : 'danger'" size="small">
              {{ resultData.status === 'success' ? '成功' : '失败' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="控制数量" label-class-name="desc-label">
            <span class="desc-value">{{ resultData.count }} 盏灯具</span>
          </el-descriptions-item>
          <el-descriptions-item label="详情" :span="2" label-class-name="desc-label">
            <span class="desc-value">{{ resultData.detail }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button type="primary" @click="showResultDialog = false">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessageBox } from 'element-plus';
import {
  Zap, Plus, Search, Play, InfoFilled, Refresh,
  CheckCircle, CloseCircle
} from '@element-plus/icons-vue';

const router = useRouter();
const activeTab = ref('control');
const filterKeyword = ref('');
const showResultDialog = ref(false);

const resultData = ref({});

const scenesData = ref([
  { id: 1, name: '(0)应急开灯', visible: true, selected: false },
  { id: 2, name: '(0)某路段人工复查', visible: true, selected: false },
  { id: 3, name: '(1)线性灯-100', visible: true, selected: false },
  { id: 4, name: '(1)线性灯-10', visible: true, selected: false },
  { id: 5, name: '(1)线性灯-50', visible: true, selected: false },
  { id: 6, name: '(1)线性灯关', visible: true, selected: false },
  { id: 7, name: '(1)隧道灯具全关', visible: true, selected: false },
  { id: 8, name: '(2)高速灯-100', visible: true, selected: false },
  { id: 9, name: '(2)高速灯-50', visible: true, selected: false },
  { id: 10, name: '(2)高速灯-10', visible: true, selected: false },
  { id: 11, name: '(2)高速灯关', visible: true, selected: false },
  { id: 12, name: '(3)低位红光关闭', visible: true, selected: false },
  { id: 13, name: '(3)低位雾光关闭', visible: true, selected: false },
  { id: 14, name: '(3)低位雾光开', visible: true, selected: false },
  { id: 15, name: '(3)低位白光关闭', visible: true, selected: false },
  { id: 16, name: '(3)低位白光开', visible: true, selected: false },
  { id: 17, name: '(3)低位红光开', visible: true, selected: false },
  { id: 18, name: '(5)灯具展示100...', visible: true, selected: false },
  { id: 19, name: '(99)展厅一键全开', visible: true, selected: false },
  { id: 20, name: '(99)展厅全关', visible: true, selected: false }
]);

const recordsData = ref([
  { no: 1, sceneName: '应急开灯', executeTime: '2024-04-22 10:26:58', status: 'success', detail: '执行成功，共控制156盏灯具', count: 156 },
  { no: 2, sceneName: '隧道灯具全关', executeTime: '2024-04-22 09:15:30', status: 'success', detail: '执行成功，共控制89盏灯具', count: 89 },
  { no: 3, sceneName: '线性灯-50', executeTime: '2024-04-22 08:00:00', status: 'success', detail: '执行成功，共控制234盏灯具', count: 234 },
  { no: 4, sceneName: '高速灯-100', executeTime: '2024-04-21 22:30:00', status: 'danger', detail: '执行失败，部分设备离线', count: 0 }
]);

const filteredScenes = computed(() => {
  if (!filterKeyword.value) return scenesData.value;
  const keyword = filterKeyword.value.toLowerCase();
  return scenesData.value.filter(item => item.name.toLowerCase().includes(keyword));
});

const selectedScenes = computed(() => {
  return scenesData.value.filter(item => item.selected);
});

const getTagText = (id) => {
  const tagMap = {
    0: '应急',
    1: '线性灯',
    2: '高速灯',
    3: '低位灯',
    5: '展示',
    99: '展厅'
  };
  return tagMap[id] || '其他';
};

const toggleSelect = (scene) => {
  scene.selected = !scene.selected;
};

const handleSearch = () => {};

const handleReset = () => {
  filterKeyword.value = '';
  scenesData.value.forEach(scene => scene.selected = false);
};

const handleAdd = () => {
  router.push('/scene/manage');
};

const handleExecute = (scene) => {
  ElMessageBox.confirm(
    `确定要执行场景「${scene.name}」吗？`,
    '确认执行',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
      confirmButtonClass: 'confirm-btn',
      cancelButtonClass: 'cancel-btn'
    }
  ).then(() => {
    showResultDialog.value = true;
    resultData.value = {
      name: scene.name,
      executeTime: new Date().toLocaleString(),
      status: 'success',
      count: 156,
      detail: '执行成功，共控制156盏灯具'
    };
  }).catch(() => {});
};

const handleResult = (scene) => {
  showResultDialog.value = true;
  resultData.value = {
    name: scene.name,
    executeTime: new Date().toLocaleString(),
    status: 'success',
    count: 156,
    detail: '执行成功，共控制156盏灯具'
  };
};

const handleBatchExecute = () => {
  ElMessageBox.confirm(
    `确定要批量执行 ${selectedScenes.value.length} 个场景吗？`,
    '批量执行',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    showResultDialog.value = true;
    resultData.value = {
      name: `批量执行(${selectedScenes.value.length}个场景)`,
      executeTime: new Date().toLocaleString(),
      status: 'success',
      count: selectedScenes.value.length * 156,
      detail: `批量执行成功，共控制 ${selectedScenes.value.length * 156} 盏灯具`
    };
    scenesData.value.forEach(scene => scene.selected = false);
  }).catch(() => {});
};

const handleClearSelection = () => {
  scenesData.value.forEach(scene => scene.selected = false);
};

const handleRefreshRecords = () => {
  console.log('刷新记录');
};

const handleViewDetail = (row) => {
  showResultDialog.value = true;
  resultData.value = {
    name: row.sceneName,
    executeTime: row.executeTime,
    status: row.status === 'success' ? 'success' : 'danger',
    count: row.count || 0,
    detail: row.detail
  };
};
</script>

<style scoped>
.quick-operation-container {
  min-height: calc(100vh - 120px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px 24px;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(124, 58, 237, 0.1));
  border-radius: 12px;
  border: 1px solid rgba(0, 212, 255, 0.2);
}

.header-left {
  display: flex;
  align-items: center;
}

.title-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.3), rgba(124, 58, 237, 0.3));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00d4ff;
  border: 1px solid rgba(0, 212, 255, 0.3);
}

.main-title {
  font-size: 22px;
  font-weight: 700;
  background: linear-gradient(135deg, #00d4ff, #7c3aed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.sub-title {
  font-size: 14px;
  color: #94a3b8;
  margin: 4px 0 0 0;
}

.header-right {
  display: flex;
  align-items: center;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tabs-container {
  background: #1b2838;
  border-radius: 12px;
  border: 1px solid #2d3a4b;
  overflow: hidden;
}

.main-tabs {
  :deep(.el-tabs__header) {
    background: rgba(0, 0, 0, 0.2);
    padding: 0 24px;
    border-bottom: 1px solid #2d3a4b;
  }
  
  :deep(.el-tabs__item) {
    font-size: 14px;
    font-weight: 500;
    color: #94a3b8;
    padding: 20px 30px;
    margin: 0;
    
    &:hover {
      color: #00d4ff;
    }
    
    &.is-active {
      color: #00d4ff;
      font-weight: 600;
    }
  }
  
  :deep(.el-tabs__active-bar) {
    background: linear-gradient(90deg, #00d4ff, #7c3aed);
    height: 3px;
    border-radius: 2px;
  }
}

.control-panel {
  padding: 24px;
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  align-items: center;
}

.search-box {
  flex: 1;
  max-width: 350px;
}

.search-input {
  width: 100%;
  
  :deep(.el-input__wrapper) {
    background: rgba(0, 0, 0, 0.3);
    border-color: #2d3a4b;
    border-radius: 8px;
  }
  
  :deep(.el-input__prefix) {
    color: #64748b;
  }
}

.search-btn, .reset-btn {
  padding: 8px 24px;
}

.batch-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(0, 212, 255, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(0, 212, 255, 0.2);
  margin-bottom: 20px;
}

.batch-info {
  font-size: 14px;
  color: #94a3b8;
  
  .selected-count {
    color: #00d4ff;
    font-weight: 600;
    font-size: 16px;
    margin: 0 4px;
  }
}

.scene-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.scene-card {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  border: 1px solid #2d3a4b;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.5), transparent);
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  &:hover {
    border-color: rgba(0, 212, 255, 0.4);
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.15);
    transform: translateY(-2px);
    
    &::before {
      opacity: 1;
    }
  }
  
  &.selected {
    border-color: #00d4ff;
    background: rgba(0, 212, 255, 0.08);
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.2);
    
    &::before {
      opacity: 1;
      background: linear-gradient(90deg, #00d4ff, #7c3aed);
    }
  }
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.checkbox-wrapper {
  :deep(.el-checkbox__inner) {
    background: rgba(0, 0, 0, 0.3);
    border-color: #2d3a4b;
    
    &:hover {
      border-color: #00d4ff;
    }
    
    &.is-checked {
      background: linear-gradient(135deg, #00d4ff, #7c3aed);
      border-color: #00d4ff;
    }
  }
}

.scene-name {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: #e8e8e8;
}

.scene-tag {
  font-size: 12px;
  color: #00d4ff;
  background: rgba(0, 212, 255, 0.15);
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid rgba(0, 212, 255, 0.2);
}

.card-body {
  margin-bottom: 16px;
}

.scene-info {
  display: flex;
  gap: 12px;
  
  .scene-id {
    font-size: 12px;
    color: #64748b;
    font-family: monospace;
  }
}

.card-footer {
  display: flex;
  gap: 10px;
}

.execute-btn, .result-btn {
  flex: 1;
  font-size: 12px;
  padding: 8px;
}

.execute-btn {
  :deep(.el-button__text) {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }
}

.result-btn {
  background: rgba(0, 0, 0, 0.3);
  border-color: #2d3a4b;
  color: #94a3b8;
  
  &:hover {
    border-color: #00d4ff;
    color: #00d4ff;
    background: rgba(0, 212, 255, 0.1);
  }
  
  :deep(.el-button__text) {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }
}

.records-panel {
  padding: 24px;
}

.records-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.records-title {
  font-size: 16px;
  font-weight: 600;
  color: #e8e8e8;
}

.records-table {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  overflow: hidden;
  
  :deep(.el-table__header-wrapper) {
    background: rgba(0, 0, 0, 0.3);
    
    th {
      background: rgba(0, 0, 0, 0.3) !important;
      color: #94a3b8 !important;
      font-weight: 600;
      border-bottom: 1px solid #2d3a4b !important;
    }
  }
  
  :deep(.el-table__body-wrapper) {
    tr {
      &:hover {
        td {
          background: rgba(0, 212, 255, 0.05) !important;
        }
      }
    }
  }
}

.row-number {
  color: #64748b;
  font-size: 12px;
}

.scene-name-cell {
  color: #e8e8e8;
  font-weight: 500;
}

.time-cell {
  color: #94a3b8;
  font-size: 13px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 13px;
  
  &.success {
    background: rgba(0, 255, 136, 0.15);
    color: #00ff88;
    
    .status-dot {
      background: #00ff88;
      box-shadow: 0 0 8px rgba(0, 255, 136, 0.5);
    }
  }
  
  &.danger {
    background: rgba(255, 71, 87, 0.15);
    color: #ff4757;
    
    .status-dot {
      background: #ff4757;
      box-shadow: 0 0 8px rgba(255, 71, 87, 0.5);
    }
  }
  
  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
}

.detail-cell {
  color: #64748b;
  font-size: 13px;
}

.result-dialog {
  :deep(.el-dialog__header) {
    background: rgba(0, 0, 0, 0.3);
    border-bottom: 1px solid #2d3a4b;
    padding: 20px 24px;
    
    .el-dialog__title {
      color: #e8e8e8;
      font-size: 16px;
      font-weight: 600;
    }
  }
  
  :deep(.el-dialog__body) {
    background: #1b2838;
    padding: 0;
  }
  
  :deep(.el-dialog__footer) {
    background: rgba(0, 0, 0, 0.2);
    border-top: 1px solid #2d3a4b;
    padding: 16px 24px;
  }
}

.result-content {
  padding: 24px;
}

.result-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 8px;
  
  &.success {
    background: rgba(0, 255, 136, 0.1);
    
    .result-icon { color: #00ff88; }
    .result-title { color: #00ff88; }
  }
  
  &.danger {
    background: rgba(255, 71, 87, 0.1);
    
    .result-icon { color: #ff4757; }
    .result-title { color: #ff4757; }
  }
}

.result-icon {
  margin-bottom: 12px;
  
  :deep(.el-icon) {
    filter: drop-shadow(0 0 20px currentColor);
  }
}

.result-title {
  font-size: 20px;
  font-weight: 600;
}

.result-descriptions {
  :deep(.el-descriptions__label) {
    color: #64748b;
    font-weight: 500;
    padding: 12px 16px;
    background: rgba(0, 0, 0, 0.2);
  }
  
  :deep(.el-descriptions__content) {
    color: #e8e8e8;
    padding: 12px 16px;
  }
}

.desc-label {
  color: #64748b;
}

.desc-value {
  color: #e8e8e8;
}

.confirm-btn {
  background: linear-gradient(135deg, #00d4ff, #7c3aed) !important;
  border: none !important;
}

.cancel-btn {
  background: rgba(0, 0, 0, 0.3) !important;
  border-color: #2d3a4b !important;
  color: #94a3b8 !important;
}
</style>
