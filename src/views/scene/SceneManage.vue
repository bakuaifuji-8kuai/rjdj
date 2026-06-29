<template>
  <div class="scene-linkage-container">
    <div class="page-header">
      <div class="header-left">
        <el-tabs v-model="viewMode" class="header-tabs">
          <el-tab-pane label="卡片模式" name="card">卡片模式</el-tab-pane>
          <el-tab-pane label="列表模式" name="list">列表模式</el-tab-pane>
        </el-tabs>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleAdd">新增</el-button>
        <el-button :disabled="selectedRows.length === 0" @click="handleBatchDelete">批量删除</el-button>
      </div>
    </div>

    <div class="filter-bar">
      <el-input v-model="filterKeyword" placeholder="请输入规则名称查询" class="filter-input" />
      <el-select v-model="filterStatus" placeholder="请选择启用状态" class="filter-select">
        <el-option label="全部" value="" />
        <el-option label="启用" value="true" />
        <el-option label="禁用" value="false" />
      </el-select>
      <el-select v-model="filterPriority" placeholder="请选择优先级" class="filter-select">
        <el-option label="全部" value="" />
        <el-option label="高" value="high" />
        <el-option label="低" value="low" />
      </el-select>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <div v-if="viewMode === 'card'" class="rule-cards">
      <el-card v-for="rule in filteredRules" :key="rule.id" class="rule-card">
        <div class="card-header">
          <div class="priority-tag" :class="rule.priority">
            <span>{{ rule.priority === 'high' ? '高' : '低' }}</span>
          </div>
          <label class="checkbox-label">
            <el-checkbox v-model="rule.selected" />
            <span class="rule-name">{{ rule.name }}</span>
          </label>
          <div class="card-controls">
            <el-switch v-model="rule.enabled" active-text="启用" inactive-text="禁用" @change="handleToggle(rule)" />
          </div>
        </div>
        <div class="card-body">
          <div class="execute-info">
            <span>执行日期:</span>
            <span>{{ rule.executeDate }}</span>
          </div>
          <el-button type="text" @click="handleMore(rule)" class="more-btn">...</el-button>
        </div>
      </el-card>
    </div>

    <div v-else class="list-panel">
      <el-table :data="filteredRules" border class="data-table" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50"></el-table-column>
        <el-table-column prop="no" label="No" width="50" align="center"></el-table-column>
        <el-table-column prop="name" label="规则名称" min-width="150"></el-table-column>
        <el-table-column prop="priority" label="优先级" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.priority === 'high' ? 'danger' : 'success'" size="small">
              {{ row.priority === 'high' ? '高' : '低' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="enabled" label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.enabled" @change="handleToggle(row)" />
          </template>
        </el-table-column>
        <el-table-column prop="executeDate" label="执行日期" min-width="180"></el-table-column>
        <el-table-column label="操作" width="150" align="center">
          <template #default="{ row }">
            <el-button type="text" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="text" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="pagination-bar">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        layout="prev, pager, next, jumper, ->, total"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessageBox } from 'element-plus';

const router = useRouter();
const viewMode = ref('card');
const filterKeyword = ref('');
const filterStatus = ref('');
const filterPriority = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const selectedRows = ref([]);

const rulesData = ref([
  { id: 1, no: 1, name: '检测有人开', priority: 'high', enabled: true, executeDate: '2025.09.01-2028.10.31', selected: false },
  { id: 2, no: 2, name: '漏电自动断电', priority: 'high', enabled: true, executeDate: '一直执行', selected: false },
  { id: 3, no: 3, name: '光照度亮灯', priority: 'high', enabled: true, executeDate: '一直执行', selected: false },
  { id: 4, no: 4, name: '关回路', priority: 'low', enabled: true, executeDate: '一直执行', selected: false },
  { id: 5, no: 5, name: '检测无人关', priority: 'low', enabled: true, executeDate: '一直执行', selected: false }
]);

const total = computed(() => rulesData.value.length);

const filteredRules = computed(() => {
  let data = [...rulesData.value];
  if (filterKeyword.value) {
    const keyword = filterKeyword.value.toLowerCase();
    data = data.filter(item => item.name.toLowerCase().includes(keyword));
  }
  if (filterStatus.value !== '') {
    const status = filterStatus.value === 'true';
    data = data.filter(item => item.enabled === status);
  }
  if (filterPriority.value) {
    data = data.filter(item => item.priority === filterPriority.value);
  }
  return data.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value);
});

const handleSearch = () => {
  currentPage.value = 1;
};

const handleReset = () => {
  filterKeyword.value = '';
  filterStatus.value = '';
  filterPriority.value = '';
  currentPage.value = 1;
};

const handleSelectionChange = (val) => {
  selectedRows.value = val;
};

const handleAdd = () => {
  router.push('/scene/linkage-manage');
};

const handleEdit = (row) => {
  router.push('/scene/linkage-manage');
};

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该规则吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = rulesData.value.findIndex(item => item.id === row.id);
    if (index !== -1) {
      rulesData.value.splice(index, 1);
    }
  }).catch(() => {});
};

const handleBatchDelete = () => {
  ElMessageBox.confirm('确定要批量删除选中的规则吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    selectedRows.value.forEach(row => {
      const index = rulesData.value.findIndex(item => item.id === row.id);
      if (index !== -1) {
        rulesData.value.splice(index, 1);
      }
    });
    selectedRows.value = [];
  }).catch(() => {});
};

const handleToggle = (rule) => {
  ElMessageBox.confirm(`确定要${rule.enabled ? '启用' : '禁用'}规则「${rule.name}」吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).catch(() => {
    rule.enabled = !rule.enabled;
  });
};

const handleMore = (rule) => {
  alert(`更多操作：${rule.name}`);
};
</script>

<style scoped>
.scene-linkage-container {
  display: flex;
  flex-direction: column;
  height: calc(100% - 30px);
  padding: 15px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.filter-bar {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-input, .filter-select {
  width: 200px;
}

.rule-cards {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 15px;
  overflow-y: auto;
  flex: 1;
  padding-right: 10px;
}

.rule-card :deep(.el-card__body) {
  padding: 15px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 10px;
}

.priority-tag {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.priority-tag.high {
  background: rgba(245, 108, 108, 0.2);
  border: 1px solid #f56c6c;
}

.priority-tag.low {
  background: rgba(103, 194, 58, 0.2);
  border: 1px solid #67c23a;
}

.checkbox-label {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.rule-name {
  color: #303133;
  font-size: 14px;
}

.card-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.execute-info {
  display: flex;
  gap: 8px;
  color: #606266;
  font-size: 12px;
}

.more-btn {
  color: #409eff;
  padding: 4px 8px;
}

.list-panel {
  flex: 1;
  overflow: auto;
}

.data-table {
  width: 100%;
}

.pagination-bar {
  display: flex;
  justify-content: center;
  padding: 15px 0;
}
</style>
