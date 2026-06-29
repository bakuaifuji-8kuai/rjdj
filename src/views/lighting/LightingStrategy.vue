<template>
  <div class="page-container">
    <div class="page-header">
      <div class="title">照明策略</div>
      <div class="header-actions">
        <el-button @click="refreshData">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <div class="main-content">
      <div class="left-sidebar">
        <div class="sidebar-header">
          <el-select v-model="hierarchyType" class="hierarchy-select">
            <el-option label="层级分组" value="hierarchy" />
          </el-select>
        </div>
        <el-tree
          :data="treeData"
          :props="defaultProps"
          show-checkbox
          node-key="id"
          :expand-on-click-node="false"
          @check-change="handleCheckChange"
        />
      </div>

      <div class="right-content">
        <div class="filter-bar">
          <el-input
            v-model="filters.search"
            placeholder="请输入IMEI号或名称"
            class="filter-input"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-select v-model="filters.lampStatus" placeholder="请选择灯具状态" class="filter-select" clearable>
            <el-option label="全部" value="" />
            <el-option label="开" value="on" />
            <el-option label="关" value="off" />
          </el-select>
          <el-select v-model="filters.networkStatus" placeholder="请选择网络状态" class="filter-select" clearable>
            <el-option label="全部" value="" />
            <el-option label="在线" value="online" />
            <el-option label="离线" value="offline" />
          </el-select>
          <el-button type="primary" @click="searchLamps">查询</el-button>
          <el-button @click="resetFilters">重置</el-button>
          <el-button type="success" @click="handleTurnOn" :disabled="selectedRows.length === 0">开灯</el-button>
          <el-button type="danger" @click="handleTurnOff" :disabled="selectedRows.length === 0">关灯</el-button>
          <span class="brightness-label">亮度:</span>
          <el-slider
            v-model="brightnessValue"
            :min="0"
            :max="100"
            :step="1"
            class="brightness-slider"
          />
        </div>

        <el-table :data="filteredLamps" border class="lamp-table" style="width: 100%;" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" />
          <el-table-column prop="no" label="No" width="60" align="center" />
          <el-table-column prop="imei" label="IMEI号" min-width="150" />
          <el-table-column prop="lampName" label="灯具名称" min-width="120" />
          <el-table-column prop="poleName" label="灯杆名称" min-width="120" />
          <el-table-column prop="lampStatus" label="灯具状态" width="90" align="center">
            <template #default="{ row }">
              <el-tag :type="row.lampStatus === 'on' ? 'success' : 'info'" size="small">
                {{ row.lampStatus === 'on' ? '开' : '关' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="brightness" label="亮度(%)" width="100" align="center" />
          <el-table-column prop="networkStatus" label="网络状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.networkStatus === 'online' ? 'success' : 'danger'" size="small">
                {{ row.networkStatus === 'online' ? '在线' : '离线' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right" align="center">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="viewCurrentStrategy(row)">当前策略</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 15, 20, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>

    <el-dialog v-model="strategyVisible" title="当前策略" width="700px">
      <div class="strategy-dialog">
        <el-table 
          :data="currentLampStrategies" 
          border
          :row-key="(row, index) => index"
          @selection-change="handleStrategySelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="action" label="执行动作" width="120" />
          <el-table-column prop="condition" label="执行条件" min-width="250" />
          <el-table-column prop="startDate" label="开始日期" width="130" />
          <el-table-column prop="endDate" label="结束日期" width="130" />
        </el-table>
        
        <div v-if="selectedStrategies.length > 0" class="brightness-control">
          <span class="control-label">调整选中策略的亮度:</span>
          <el-slider
            v-model="selectedBrightness"
            :min="0"
            :max="100"
            :step="1"
            class="strategy-brightness-slider"
          />
          <span class="brightness-value">{{ selectedBrightness }}%</span>
          <el-button type="primary" @click="updateStrategyBrightness">应用亮度</el-button>
        </div>
        <div v-else class="no-selection-tip">
          请选择策略记录以调整亮度
        </div>
      </div>
      <template #footer>
        <el-button @click="strategyVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Refresh, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const hierarchyType = ref('hierarchy')
const currentPage = ref(1)
const pageSize = ref(15)
const total = ref(68)
const selectedRows = ref([])
const strategyVisible = ref(false)
const currentLampStrategies = ref([])
const selectedStrategies = ref([])
const brightnessValue = ref(60)
const selectedBrightness = ref(60)

const filters = reactive({
  search: '',
  lampStatus: '',
  networkStatus: ''
})

const defaultProps = {
  children: 'children',
  label: 'label'
}

const treeData = ref([
  {
    id: 1,
    label: '长沙',
    children: [
      { 
        id: 11, 
        label: '岳麓区',
        children: [
          { id: 111, label: '先导路' },
          { id: 112, label: '力唯中天1栋' }
        ]
      }
    ]
  }
])

const lamps = ref([
  { id: 1, no: 1, imei: '862715067560391', lampName: '先导路路灯1', poleName: '先导路1号灯杆', lampStatus: 'on', brightness: 80, networkStatus: 'online' },
  { id: 2, no: 2, imei: '862715067560392', lampName: '先导路路灯2', poleName: '先导路2号灯杆', lampStatus: 'on', brightness: 80, networkStatus: 'online' },
  { id: 3, no: 3, imei: '863123069184162', lampName: '力唯中天1栋灯1', poleName: '力唯中天1栋1号灯杆', lampStatus: 'on', brightness: 70, networkStatus: 'online' },
  { id: 4, no: 4, imei: '863123069133946', lampName: '力唯中天1栋灯2', poleName: '力唯中天1栋2号灯杆', lampStatus: 'off', brightness: 0, networkStatus: 'offline' },
  { id: 5, no: 5, imei: '863123069031165', lampName: '先导路路灯3', poleName: '先导路3号灯杆', lampStatus: 'off', brightness: 0, networkStatus: 'offline' },
  { id: 6, no: 6, imei: '863123069267413', lampName: '先导路路灯4', poleName: '先导路4号灯杆', lampStatus: 'off', brightness: 0, networkStatus: 'offline' },
  { id: 7, no: 7, imei: '863123069265714', lampName: '力唯中天1栋灯3', poleName: '力唯中天1栋3号灯杆', lampStatus: 'off', brightness: 0, networkStatus: 'offline' },
  { id: 8, no: 8, imei: '863123069201446', lampName: '力唯中天1栋灯4', poleName: '力唯中天1栋4号灯杆', lampStatus: 'off', brightness: 0, networkStatus: 'offline' },
  { id: 9, no: 9, imei: '864900066365673', lampName: '先导路路灯5', poleName: '先导路5号灯杆', lampStatus: 'off', brightness: 0, networkStatus: 'offline' },
  { id: 10, no: 10, imei: '863123069231120', lampName: '先导路路灯6', poleName: '先导路6号灯杆', lampStatus: 'off', brightness: 0, networkStatus: 'offline' },
  { id: 11, no: 11, imei: '864900066363135', lampName: '力唯中天1栋灯5', poleName: '力唯中天1栋5号灯杆', lampStatus: 'off', brightness: 0, networkStatus: 'offline' },
  { id: 12, no: 12, imei: '863123069267462', lampName: '力唯中天1栋灯6', poleName: '力唯中天1栋6号灯杆', lampStatus: 'off', brightness: 0, networkStatus: 'offline' },
  { id: 13, no: 13, imei: '862715067560393', lampName: '先导路路灯7', poleName: '先导路7号灯杆', lampStatus: 'off', brightness: 0, networkStatus: 'offline' },
  { id: 14, no: 14, imei: '862715067560394', lampName: '先导路路灯8', poleName: '先导路8号灯杆', lampStatus: 'off', brightness: 0, networkStatus: 'offline' },
  { id: 15, no: 15, imei: '863123069146013', lampName: '力唯中天1栋灯7', poleName: '力唯中天1栋7号灯杆', lampStatus: 'off', brightness: 0, networkStatus: 'offline' }
])

const filteredLamps = computed(() => {
  let result = lamps.value
  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    result = result.filter(l => 
      l.imei.includes(filters.search) || 
      l.lampName.toLowerCase().includes(searchLower)
    )
  }
  if (filters.lampStatus) {
    result = result.filter(l => l.lampStatus === filters.lampStatus)
  }
  if (filters.networkStatus) {
    result = result.filter(l => l.networkStatus === filters.networkStatus)
  }
  return result
})

const handleCheckChange = (data, checked) => {
  console.log('selected hierarchy:', data, checked)
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const handleStrategySelectionChange = (selection) => {
  selectedStrategies.value = selection
  if (selection.length > 0) {
    const firstStrategy = selection[0]
    const match = firstStrategy.condition.match(/调光值:\s*(\d+)%/)
    if (match) {
      selectedBrightness.value = parseInt(match[1])
    } else {
      selectedBrightness.value = 60
    }
  }
}

const searchLamps = () => {
  currentPage.value = 1
  ElMessage.success('查询成功')
}

const resetFilters = () => {
  Object.assign(filters, {
    search: '',
    lampStatus: '',
    networkStatus: ''
  })
  currentPage.value = 1
}

const refreshData = () => {
  ElMessage.success('数据已刷新')
}

const handleTurnOn = () => {
  ElMessageBox.confirm(`确定要给选中的 ${selectedRows.value.length} 个灯具开灯吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'success'
  }).then(() => {
    selectedRows.value.forEach(row => {
      row.lampStatus = 'on'
      row.brightness = brightnessValue.value
    })
    ElMessage.success('开灯成功')
  }).catch(() => {})
}

const handleTurnOff = () => {
  ElMessageBox.confirm(`确定要给选中的 ${selectedRows.value.length} 个灯具关灯吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'danger'
  }).then(() => {
    selectedRows.value.forEach(row => {
      row.lampStatus = 'off'
      row.brightness = 0
    })
    ElMessage.success('关灯成功')
  }).catch(() => {})
}

const viewCurrentStrategy = (row) => {
  currentLampStrategies.value = [
    { action: '关灯', condition: '日出之前，偏移时间值: 5分钟', startDate: '2023-12-01', endDate: '2029-01-01' },
    { action: '关灯', condition: '日出之前，偏移时间值: 1分钟', startDate: '2023-12-01', endDate: '2029-01-01' },
    { action: '开灯', condition: '日落之后，偏移时间值: 1分钟，调光值: 60%', startDate: '2023-12-01', endDate: '2029-01-01' },
    { action: '调光', condition: '执行时间: 22:30:04，调光值: 45%', startDate: '2023-12-01', endDate: '2029-01-01' }
  ]
  selectedStrategies.value = []
  selectedBrightness.value = 60
  strategyVisible.value = true
}

const updateStrategyBrightness = () => {
  if (selectedStrategies.value.length === 0) {
    ElMessage.warning('请先选择策略记录')
    return
  }
  
  ElMessageBox.confirm(`确定要将选中的 ${selectedStrategies.value.length} 条策略的亮度调整为 ${selectedBrightness.value}% 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'primary'
  }).then(() => {
    selectedStrategies.value.forEach(strategy => {
      if (strategy.condition.includes('调光值')) {
        strategy.condition = strategy.condition.replace(/调光值:\s*\d+%/, `调光值: ${selectedBrightness.value}%`)
      }
    })
    ElMessage.success('亮度调整成功')
  }).catch(() => {})
}

const handleSizeChange = (val) => {
  pageSize.value = val
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}
</script>

<style scoped>
.page-container {
  padding: 20px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e8e8e8;
}

.page-header .title {
  font-size: 18px;
  font-weight: 600;
  color: #1f1f1f;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.main-content {
  display: flex;
  gap: 20px;
}

.left-sidebar {
  width: 200px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 15px;
  flex-shrink: 0;
}

.sidebar-header {
  margin-bottom: 15px;
}

.hierarchy-select {
  width: 100%;
}

.right-content {
  flex: 1;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  padding: 15px;
  background: #fafafa;
  border-radius: 4px;
  flex-wrap: wrap;
}

.filter-input {
  width: 250px;
}

.filter-select {
  width: 150px;
}

.brightness-label {
  font-size: 14px;
  color: #666;
}

.brightness-slider {
  width: 200px;
}

.lamp-table {
  margin-bottom: 20px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
}

.strategy-dialog {
  padding: 10px;
}

.brightness-control {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
  padding: 15px;
  background: #fafafa;
  border-radius: 4px;
}

.control-label {
  font-size: 14px;
  color: #666;
}

.strategy-brightness-slider {
  flex: 1;
  max-width: 300px;
}

.brightness-value {
  font-size: 16px;
  font-weight: 600;
  color: #1890ff;
  min-width: 50px;
}

.no-selection-tip {
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 14px;
}
</style>