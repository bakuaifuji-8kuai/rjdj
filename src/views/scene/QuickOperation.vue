<template>
  <div class="page-container">
    <div class="main-content">
      <div class="right-content">
        <div class="page-header">
          <div class="header-left">
            <el-tabs v-model="activeTab" class="header-tabs">
              <el-tab-pane label="场景控制" name="control">场景控制</el-tab-pane>
              <el-tab-pane label="场景下发记录" name="records">场景下发记录</el-tab-pane>
            </el-tabs>
          </div>
          <div class="header-right">
            <el-button v-if="activeTab === 'control'" type="primary" @click="handleAdd">新增</el-button>
          </div>
        </div>

        <div v-if="activeTab === 'control'" class="control-panel">
          <div class="filter-bar">
            <el-input v-model="filterKeyword" placeholder="请输入场景名称查询" class="filter-input" />
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </div>

          <div class="scene-cards">
            <el-card
              v-for="scene in filteredScenes"
              :key="scene.id"
              class="scene-card"
            >
              <div class="card-header">
                <label class="checkbox-label">
                  <el-checkbox v-model="scene.selected" />
                  <span>{{ scene.name }}</span>
                </label>
              </div>
              <div class="card-body">
                <el-button type="primary" @click="handleExecute(scene)">执行</el-button>
                <el-button type="info" @click="handleResult(scene)">执行结果</el-button>
              </div>
            </el-card>
          </div>
        </div>

        <div v-else class="records-panel">
          <el-table :data="recordsData" border class="data-table">
            <el-table-column prop="no" label="No" width="50" align="center"></el-table-column>
            <el-table-column prop="sceneName" label="场景名称" min-width="150"></el-table-column>
            <el-table-column prop="executeTime" label="下发时间" min-width="160"></el-table-column>
            <el-table-column prop="status" label="状态" width="90" align="center">
              <template #default="{ row }">
                <el-tag :type="row.status === 'success' ? 'success' : 'danger'" size="small">
                  {{ row.status === 'success' ? '成功' : '失败' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="detail" label="详情" min-width="200"></el-table-column>
          </el-table>
        </div>
      </div>
    </div>

    <el-dialog title="执行结果" v-model="showResultDialog" width="500px">
      <el-descriptions :column="2" :data="resultData" border>
        <el-descriptions-item label="场景名称">{{ resultData.name }}</el-descriptions-item>
        <el-descriptions-item label="执行时间">{{ resultData.executeTime }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="resultData.status === 'success' ? 'success' : 'danger'" size="small">
            {{ resultData.status === 'success' ? '成功' : '失败' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="详情">{{ resultData.detail }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessageBox } from 'element-plus';

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
  { no: 1, sceneName: '应急开灯', executeTime: '2024-04-22 10:26:58', status: 'success', detail: '执行成功，共控制156盏灯具' },
  { no: 2, sceneName: '隧道灯具全关', executeTime: '2024-04-22 09:15:30', status: 'success', detail: '执行成功，共控制89盏灯具' },
  { no: 3, sceneName: '线性灯-50', executeTime: '2024-04-22 08:00:00', status: 'success', detail: '执行成功，共控制234盏灯具' },
  { no: 4, sceneName: '高速灯-100', executeTime: '2024-04-21 22:30:00', status: 'danger', detail: '执行失败，部分设备离线' }
]);

const filteredScenes = computed(() => {
  if (!filterKeyword.value) return scenesData.value;
  const keyword = filterKeyword.value.toLowerCase();
  return scenesData.value.filter(item => item.name.toLowerCase().includes(keyword));
});

const handleSearch = () => {};

const handleReset = () => {
  filterKeyword.value = '';
};

const handleAdd = () => {
  router.push('/scene/manage');
};

const handleExecute = (scene) => {
  ElMessageBox.confirm(
    `确定要执行场景「${scene.name}」吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(() => {
    showResultDialog.value = true;
    resultData.value = {
      name: scene.name,
      executeTime: new Date().toLocaleString(),
      status: 'success',
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
    detail: '执行成功，共控制156盏灯具'
  };
};

const handleMore = (scene) => {
  alert(`更多操作：${scene.name}`);
};
</script>

<style scoped>
.page-container {
  display: flex;
  height: calc(100vh - 60px);
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.right-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 15px;
  overflow: hidden;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e8e8e8;
}

.header-tabs {
  --el-tabs-header-text-color: #606266;
  --el-tabs-active-text-color: #409eff;
  --el-tabs-border-color: #e8e8e8;
  --el-tabs-active-bar-color: #409eff;
}

.filter-bar {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  align-items: center;
}

.filter-input {
  width: 250px;
}

.scene-cards {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 15px;
  overflow-y: auto;
  flex: 1;
  padding-right: 10px;
}

.scene-card {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 1px solid #e8e8e8;
  margin-bottom: 10px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #303133;
  font-size: 14px;
}

.card-body {
  display: flex;
  gap: 8px;
}

.card-body .el-button {
  flex: 1;
  padding: 6px;
  font-size: 12px;
}

.records-panel {
  flex: 1;
  overflow: auto;
}

.data-table {
  width: 100%;
}

.form-select {
  width: 100%;
}
</style>