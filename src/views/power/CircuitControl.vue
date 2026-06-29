<template>
  <div class="page-container">
    <div class="main-content">
      <div class="left-panel">
        <div class="panel-header">
          <div class="panel-tabs">
            <span class="tab active">设备</span>
          </div>
        </div>
        <div class="search-box">
          <el-input
            v-model="deviceSearch"
            placeholder="请输入设备名称查询"
            class="search-input"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <div class="device-tree">
          <el-tree
            :data="deviceTreeData"
            :props="defaultProps"
            show-checkbox
            node-key="id"
            :expand-on-click-node="false"
            @check-change="handleDeviceCheck"
          />
        </div>
      </div>

      <div class="right-panel">
        <div class="panel-header">
          <div class="header-left">
            <el-button type="primary" @click="batchControl('on')">全开</el-button>
            <el-button type="danger" @click="batchControl('off')">全关</el-button>
          </div>
        </div>

        <div class="content-wrapper">
          <div class="filter-bar">
            <el-select v-model="filters.product" placeholder="请选择所属产品" class="filter-select">
              <el-option label="全部产品" value="" />
              <el-option label="电信CAT1" value="cat1" />
              <el-option label="EXC-CAT1" value="exc" />
            </el-select>
            <el-select v-model="filters.networkStatus" placeholder="请选择网络状态" class="filter-select">
              <el-option label="全部状态" value="" />
              <el-option label="在线" value="online" />
              <el-option label="离线" value="offline" />
            </el-select>
            <el-select v-model="filters.switchStatus" placeholder="请选择开关状态" class="filter-select">
              <el-option label="全部状态" value="" />
              <el-option label="开" value="on" />
              <el-option label="关" value="off" />
            </el-select>
            <el-input
              v-model="filters.search"
              placeholder="请输入回路/模块名称"
              class="filter-input"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" @click="searchCircuits">搜索</el-button>
            <el-button @click="resetFilters">重置</el-button>
          </div>

          <el-table :data="filteredCircuits" border class="circuit-table" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="45" />
            <el-table-column prop="no" label="No" width="60" align="center" />
            <el-table-column prop="deviceName" label="设备名称" min-width="150" />
            <el-table-column prop="circuitName" label="回路名称" min-width="150" />
            <el-table-column prop="moduleName" label="模块名称" min-width="150" />
            <el-table-column prop="switchStatus" label="开关状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.switchStatus === 'on' ? 'success' : 'danger'" size="small">
                  {{ row.switchStatus === 'on' ? '开' : '关' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="reportTime" label="上报时间" width="180" />
            <el-table-column prop="networkStatus" label="网络状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.networkStatus === 'online' ? 'success' : 'danger'" size="small">
                  {{ row.networkStatus === 'online' ? '在线' : '离线' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="lastOnline" label="最后在线时间" width="180" />
            <el-table-column label="开关记录" width="100" align="center">
              <template #default="{ row }">
                <el-button type="text" @click="viewSwitchLog(row)">查看</el-button>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" align="center">
              <template #default="{ row }">
                <el-button type="success" size="small" @click="controlCircuit(row, 'on')">开</el-button>
                <el-button type="danger" size="small" @click="controlCircuit(row, 'off')">关</el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :total="total"
              :page-sizes="[15, 30, 50, 100]"
              layout="prev, pager, next, jumper, ->, sizes, total"
            />
          </div>
        </div>
      </div>
    </div>

    <el-dialog v-model="showLogDialog" title="开关记录" width="800px">
      <div class="log-content">
        <div class="log-header">
          <span class="log-title">{{ currentCircuit?.deviceName }} - {{ currentCircuit?.circuitName }}</span>
        </div>
        <el-table :data="switchLogs" border size="small">
          <el-table-column prop="no" label="序号" width="60" align="center" />
          <el-table-column prop="operator" label="操作人" width="120" />
          <el-table-column prop="action" label="操作类型" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.action === 'on' ? 'success' : 'danger'" size="small">
                {{ row.action === 'on' ? '打开' : '关闭' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="operateTime" label="操作时间" width="180" />
          <el-table-column prop="result" label="执行结果" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.result === 'success' ? 'success' : 'danger'" size="small">
                {{ row.result === 'success' ? '成功' : '失败' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" />
        </el-table>
        <div class="log-pagination">
          <el-pagination
            v-model:current-page="logPage"
            v-model:page-size="logPageSize"
            :total="logTotal"
            layout="prev, pager, next, total"
          />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const deviceSearch = ref('')
const currentPage = ref(1)
const pageSize = ref(15)
const total = ref(0)
const selectedRows = ref([])
const showLogDialog = ref(false)
const currentCircuit = ref(null)
const logPage = ref(1)
const logPageSize = ref(10)
const logTotal = ref(0)

const defaultProps = {
  children: 'children',
  label: 'label'
}

const filters = reactive({
  product: '',
  networkStatus: '',
  switchStatus: '',
  search: ''
})

const deviceTreeData = ref([
  {
    id: 'root',
    label: '长沙',
    children: [
      {
        id: 'district',
        label: '岳麓区',
        children: [
          {
            id: 'xiandao',
            label: '先导路',
            children: [
              { id: 'device-1', label: '先导路集控1', deviceId: 1 },
              { id: 'device-2', label: '先导路集控2', deviceId: 2 }
            ]
          },
          {
            id: 'liwei',
            label: '先导路1栋',
            children: [
              { id: 'device-3', label: '先导路集控1', deviceId: 3 },
              { id: 'device-4', label: '先导路集控2', deviceId: 4 }
            ]
          }
        ]
      }
    ]
  }
])

const circuits = ref([
  { id: 1, no: 1, deviceName: '先导路集控1', circuitName: '内置回路1', moduleName: '内置6回路模块', switchStatus: 'off', reportTime: '2026-05-14 10:30:14', networkStatus: 'online', lastOnline: '2026-05-14 10:30:00' },
  { id: 2, no: 2, deviceName: '先导路集控1', circuitName: '内置回路2', moduleName: '内置6回路模块', switchStatus: 'off', reportTime: '2026-05-14 10:30:14', networkStatus: 'online', lastOnline: '2026-05-14 10:30:00' },
  { id: 3, no: 3, deviceName: '先导路集控1', circuitName: '内置回路3', moduleName: '内置6回路模块', switchStatus: 'on', reportTime: '2026-05-14 10:30:14', networkStatus: 'online', lastOnline: '2026-05-14 10:30:00' },
  { id: 4, no: 4, deviceName: '先导路集控1', circuitName: '内置回路4', moduleName: '内置6回路模块', switchStatus: 'off', reportTime: '2026-05-14 10:30:14', networkStatus: 'online', lastOnline: '2026-05-14 10:30:00' },
  { id: 5, no: 5, deviceName: '先导路集控1', circuitName: '内置回路5', moduleName: '内置6回路模块', switchStatus: 'off', reportTime: '2026-05-14 10:30:14', networkStatus: 'online', lastOnline: '2026-05-14 10:30:00' },
  { id: 6, no: 6, deviceName: '先导路集控1', circuitName: '内置回路6', moduleName: '内置6回路模块', switchStatus: 'off', reportTime: '2026-05-14 10:30:14', networkStatus: 'online', lastOnline: '2026-05-14 10:30:00' },
  { id: 7, no: 7, deviceName: '先导路集控2', circuitName: '回路1', moduleName: 'EXC_10_3', switchStatus: 'on', reportTime: '2026-05-14 10:28:14', networkStatus: 'online', lastOnline: '2026-05-14 10:28:00' },
  { id: 8, no: 8, deviceName: '先导路集控2', circuitName: '回路2', moduleName: 'EXC_10_3', switchStatus: 'on', reportTime: '2026-05-14 10:28:14', networkStatus: 'online', lastOnline: '2026-05-14 10:28:00' },
  { id: 9, no: 9, deviceName: '先导路集控2', circuitName: '回路3', moduleName: 'EXC_10_3', switchStatus: 'off', reportTime: '2026-05-14 10:28:14', networkStatus: 'online', lastOnline: '2026-05-14 10:28:00' },
  { id: 10, no: 10, deviceName: '先导路集控1', circuitName: '交流接触器01', moduleName: 'EXC_10_1', switchStatus: 'off', reportTime: '2026-05-14 09:15:14', networkStatus: 'offline', lastOnline: '2026-05-14 09:15:00' },
  { id: 11, no: 11, deviceName: '先导路集控1', circuitName: '交流接触器02', moduleName: 'EXC_10_1', switchStatus: 'off', reportTime: '2026-05-14 09:15:14', networkStatus: 'offline', lastOnline: '2026-05-14 09:15:00' },
  { id: 12, no: 12, deviceName: '先导路集控2', circuitName: '回路1', moduleName: 'EXC_10_3', switchStatus: 'on', reportTime: '2026-05-14 10:32:14', networkStatus: 'online', lastOnline: '2026-05-14 10:32:00' },
  { id: 13, no: 13, deviceName: '先导路集控2', circuitName: '回路2', moduleName: 'EXC_10_3', switchStatus: 'off', reportTime: '2026-05-14 10:32:14', networkStatus: 'online', lastOnline: '2026-05-14 10:32:00' },
  { id: 14, no: 14, deviceName: '先导路集控2', circuitName: '回路3', moduleName: 'EXC_10_3', switchStatus: 'on', reportTime: '2026-05-14 10:32:14', networkStatus: 'online', lastOnline: '2026-05-14 10:32:00' },
  { id: 15, no: 15, deviceName: '先导路集控2', circuitName: '回路4', moduleName: 'EXC_10_3', switchStatus: 'off', reportTime: '2026-05-14 10:32:14', networkStatus: 'online', lastOnline: '2026-05-14 10:32:00' }
])

total.value = circuits.value.length

const switchLogs = ref([
  { no: 1, operator: 'admin', action: 'on', operateTime: '2026-05-14 10:30:00', result: 'success', remark: '定时任务执行' },
  { no: 2, operator: 'operator', action: 'off', operateTime: '2026-05-14 06:00:00', result: 'success', remark: '定时任务执行' },
  { no: 3, operator: 'admin', action: 'on', operateTime: '2026-05-13 18:00:00', result: 'success', remark: '定时任务执行' },
  { no: 4, operator: 'operator', action: 'off', operateTime: '2026-05-13 06:00:00', result: 'success', remark: '定时任务执行' },
  { no: 5, operator: 'admin', action: 'on', operateTime: '2026-05-12 18:00:00', result: 'success', remark: '手动操作' }
])

logTotal.value = switchLogs.value.length

const filteredCircuits = computed(() => {
  let result = circuits.value
  if (filters.product) result = result.filter(c => c.deviceName.includes(filters.product))
  if (filters.networkStatus) result = result.filter(c => c.networkStatus === filters.networkStatus)
  if (filters.switchStatus) result = result.filter(c => c.switchStatus === filters.switchStatus)
  if (filters.search) result = result.filter(c => c.circuitName.includes(filters.search) || c.moduleName.includes(filters.search))
  return result
})

const handleDeviceCheck = (data, checked) => {
  console.log('Device checked:', data, checked)
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const searchCircuits = () => {
  currentPage.value = 1
  ElMessage.success('查询成功')
}

const resetFilters = () => {
  Object.assign(filters, { product: '', networkStatus: '', switchStatus: '', search: '' })
  currentPage.value = 1
}

const controlCircuit = (row, action) => {
  if (row.networkStatus === 'offline') {
    ElMessage.warning('设备离线，无法操作')
    return
  }
  row.switchStatus = action
  const actionText = action === 'on' ? '打开' : '关闭'
  ElMessage.success(`${row.circuitName}已${actionText}`)
}

const batchControl = (action) => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要操作的回路')
    return
  }
  selectedRows.value.forEach(row => {
    if (row.networkStatus === 'online') {
      row.switchStatus = action
    }
  })
  const actionText = action === 'on' ? '全开' : '全关'
  ElMessage.success(`已执行${actionText}`)
}

const viewSwitchLog = (row) => {
  currentCircuit.value = row
  showLogDialog.value = true
}
</script>

<style scoped>
.page-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  display: flex;
  gap: 15px;
  overflow: hidden;
}

.left-panel {
  width: 200px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;
  height: 100%;
}

.panel-header {
  padding: 12px;
  border-bottom: 1px solid #e8e8e8;
  background: #fafafa;
}

.panel-tabs {
  display: flex;
  gap: 15px;
}

.tab {
  cursor: pointer;
  font-size: 14px;
  color: #666;
  padding-bottom: 8px;
  border-bottom: 2px solid transparent;
}

.tab.active {
  color: #1890ff;
  border-bottom-color: #1890ff;
}

.search-box {
  padding: 10px;
  border-bottom: 1px solid #e8e8e8;
}

.search-input {
  width: 100%;
}

.device-tree {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
  background: #f5f5f5;
  box-sizing: border-box;
}

.content-wrapper {
  flex: 1;
  overflow: hidden;
  overflow-x: auto;
}

.header-left {
  display: flex;
  gap: 10px;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.filter-select {
  width: 150px;
}

.filter-input {
  width: 200px;
}

.circuit-table {
  flex: 1;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: auto;
  min-width: 0;
}

:deep(.circuit-table .el-table) {
  min-width: 100%;
}

.pagination-wrapper {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}

.log-content {
  padding: 10px 0;
}

.log-header {
  margin-bottom: 15px;
}

.log-title {
  font-weight: 600;
  color: #333;
}

.log-pagination {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}
</style>