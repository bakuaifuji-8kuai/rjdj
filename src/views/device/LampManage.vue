<template>
  <div class="lamp-manage">
    <div class="main-content">
      <div class="left-panel">
        <div class="panel-header">
          <el-input v-model="treeSearch" placeholder="请输入层级名称" prefix-icon="Search" />
        </div>
        <el-tree
          :data="treeData"
          :props="defaultProps"
          show-checkbox
          node-key="id"
          :expand-on-click-node="false"
          @check="handleTreeCheck"
        />
      </div>

      <div class="right-panel">
        <div class="page-header">
          <div class="header-actions">
            <el-button type="primary" @click="handleTurnOn">开灯</el-button>
            <el-button type="danger" @click="handleTurnOff">关灯</el-button>
            <el-button @click="handleDimming">调光</el-button>
          </div>
        </div>

        <div class="filter-bar">
          <el-select v-model="filterProduct" placeholder="请选择所属产品" class="filter-select">
            <el-option label="全部" value=""></el-option>
            <el-option label="电信CAT1" value="电信CAT1"></el-option>
            <el-option label="EXC-CAT1" value="EXC-CAT1"></el-option>
          </el-select>
          <el-select v-model="filterLampStatus" placeholder="请选择灯具状态" class="filter-select">
            <el-option label="全部" value=""></el-option>
            <el-option label="开" value="开"></el-option>
            <el-option label="关" value="关"></el-option>
          </el-select>
          <el-select v-model="filterNetworkStatus" placeholder="请选择网络状态" class="filter-select">
            <el-option label="全部" value=""></el-option>
            <el-option label="在线" value="在线"></el-option>
            <el-option label="离线" value="离线"></el-option>
          </el-select>
          <el-select v-model="filterAvailable" placeholder="请选择可用状态" class="filter-select">
            <el-option label="全部" value=""></el-option>
            <el-option label="启用" value="启用"></el-option>
            <el-option label="不启用" value="不启用"></el-option>
          </el-select>
          <el-input v-model="searchText" placeholder="请输入IMEI号或名称" class="filter-input" />
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>

        <div class="table-wrapper">
          <el-table :data="filteredData" border @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="50" />
            <el-table-column prop="no" label="No" width="60" />
            <el-table-column prop="product" label="所属产品" width="120" />
            <el-table-column prop="imei" label="IMEI号" min-width="150" />
            <el-table-column prop="name" label="灯具名称" min-width="150" />
            <el-table-column prop="power" label="功率(W)" width="100" />
            <el-table-column prop="voltage" label="电压(V)" width="100" />
            <el-table-column prop="current" label="电流(mA)" width="100" />
            <el-table-column prop="lampStatus" label="灯具状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.lampStatus === '开' ? 'success' : 'danger'" size="small">
                  {{ row.lampStatus }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="brightness" label="亮度(%)" width="100" />
            <el-table-column prop="networkStatus" label="网络状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.networkStatus === '在线' ? 'success' : 'danger'" size="small">
                  {{ row.networkStatus }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="lastOnline" label="最后在线时间" min-width="160" />
            <el-table-column prop="strategy" label="当前策略" min-width="120" />
            <el-table-column prop="switchRecord" label="开关灯记录" width="120">
              <template #default>
                <el-button type="text" size="small" @click="handleSwitchRecord">查看</el-button>
              </template>
            </el-table-column>
            <el-table-column prop="available" label="可用状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.available === '启用' ? 'success' : 'warning'" size="small">
                  {{ row.available }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default>
                <el-button type="text" size="small">详情</el-button>
                <el-button type="text" size="small">更多</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="pagination">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            layout="prev, pager, next, jumper, ->, go, ->, sizes, total"
            :page-sizes="[15, 30, 50]"
          />
        </div>
      </div>
    </div>

    <!-- 开关灯记录弹窗 -->
    <el-dialog title="开关灯记录" v-model="showRecordDialog" width="600px">
      <el-table :data="switchRecords" border>
        <el-table-column prop="id" label="No" width="60" />
        <el-table-column prop="time" label="时间" min-width="160" />
        <el-table-column prop="action" label="动作" width="100">
          <template #default="{ row }">
            <el-tag :type="row.action === '开灯' ? 'success' : 'danger'" size="small">
              {{ row.action }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operator" label="操作人" width="120" />
        <el-table-column prop="remark" label="备注" min-width="150" />
      </el-table>
      <template #footer>
        <el-button @click="showRecordDialog = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 调光弹窗 -->
    <el-dialog title="调光设置" v-model="showDimmingDialog" width="500px">
      <el-form label-width="100px">
        <el-form-item label="亮度">
          <el-slider 
            v-model="brightnessValue" 
            :min="0" 
            :max="100" 
            :step="10"
            :marks="marks"
            show-input
          />
        </el-form-item>
        <el-form-item label="预设亮度">
          <el-button-group>
            <el-button @click="brightnessValue = 100">100%</el-button>
            <el-button @click="brightnessValue = 75">75%</el-button>
            <el-button @click="brightnessValue = 50">50%</el-button>
            <el-button @click="brightnessValue = 25">25%</el-button>
          </el-button-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDimmingDialog = false">取消</el-button>
        <el-button type="primary" @click="handleDimmingConfirm">确认调光</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const treeSearch = ref('')
const filterProduct = ref('')
const filterLampStatus = ref('')
const filterNetworkStatus = ref('')
const filterAvailable = ref('')
const searchText = ref('')
const currentPage = ref(1)
const pageSize = ref(15)
const showRecordDialog = ref(false)
const showDimmingDialog = ref(false)
const brightnessValue = ref(100)

const marks = {
  0: '0%',
  25: '25%',
  50: '50%',
  75: '75%',
  100: '100%'
}

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
          { id: 111, label: '先导路', children: [] },
          { id: 112, label: '力唯中天1栋', children: [] }
        ]
      }
    ]
  }
])

const lampData = ref([
  { no: 1, product: '电信CAT1', imei: '862715067560391', name: '光亚展灯具', power: 0, voltage: 231.3, current: 0, lampStatus: '关', brightness: '-', networkStatus: '在线', lastOnline: '2026-04-28 17:57:42', strategy: '光明园区照明管理(勿删)', switchRecord: '', available: '启用' },
  { no: 2, product: '电信CAT1', imei: '863123069184162', name: '1号楼-极简07', power: 0, voltage: 231.3, current: 0, lampStatus: '关', brightness: '-', networkStatus: '在线', lastOnline: '2026-04-28 17:54:54', strategy: '光明园区照明管理(勿删)', switchRecord: '', available: '启用' },
  { no: 3, product: '电信CAT1', imei: '863123069133946', name: '宿舍楼02', power: 48, voltage: 0, current: 222, lampStatus: '关', brightness: '-', networkStatus: '离线', lastOnline: '2026-04-28 04:53:41', strategy: '光明园区照明管理(勿删)', switchRecord: '', available: '启用' },
  { no: 4, product: '电信CAT1', imei: '863123069031165', name: '3号楼-极简13', power: 24, voltage: 233.1, current: 127, lampStatus: '关', brightness: '-', networkStatus: '离线', lastOnline: '2026-04-28 04:52:52', strategy: '光明园区照明管理(勿删)', switchRecord: '', available: '启用' },
  { no: 5, product: '电信CAT1', imei: '863123069267413', name: '食堂-极简18辅路', power: 22, voltage: 233.5, current: 110, lampStatus: '关', brightness: '-', networkStatus: '离线', lastOnline: '2026-04-28 04:52:09', strategy: '光明园区照明管理(勿删)', switchRecord: '', available: '不启用' },
  { no: 6, product: '电信CAT1', imei: '863123069265714', name: '食堂-极简18', power: 25, voltage: 233.8, current: 125, lampStatus: '关', brightness: '-', networkStatus: '离线', lastOnline: '2026-04-28 04:51:17', strategy: '光明园区照明管理(勿删)', switchRecord: '', available: '不启用' },
  { no: 7, product: '电信CAT1', imei: '863123069277032', name: '3号楼-极简14', power: 24, voltage: 234.9, current: 122, lampStatus: '关', brightness: '-', networkStatus: '离线', lastOnline: '2026-04-24 04:56:48', strategy: '光明园区照明管理(勿删)', switchRecord: '', available: '启用' },
  { no: 8, product: '电信CAT1', imei: '863123069201446', name: '食堂-极简17', power: 26, voltage: 234.3, current: 130, lampStatus: '关', brightness: '-', networkStatus: '离线', lastOnline: '2026-04-28 04:56:48', strategy: '光明园区照明管理(勿删)', switchRecord: '', available: '启用' },
  { no: 9, product: '电信CAT1', imei: '863123069081624', name: '宿舍楼01', power: 48, voltage: 0, current: 218, lampStatus: '关', brightness: '-', networkStatus: '离线', lastOnline: '2026-04-28 04:55:13', strategy: '光明园区照明管理(勿删)', switchRecord: '', available: '启用' },
  { no: 10, product: '电信CAT1', imei: '863123069146013', name: '宿舍楼03', power: 47, voltage: 233.2, current: 214, lampStatus: '关', brightness: '-', networkStatus: '离线', lastOnline: '2026-04-28 04:55:12', strategy: '光明园区照明管理(勿删)', switchRecord: '', available: '启用' },
  { no: 11, product: '电信CAT1', imei: '863123069236392', name: '食堂-极简16', power: 26, voltage: 234.4, current: 130, lampStatus: '关', brightness: '-', networkStatus: '离线', lastOnline: '2026-04-28 04:54:04', strategy: '光明园区照明管理(勿删)', switchRecord: '', available: '启用' },
  { no: 12, product: 'EXC-CAT1', imei: '8649000666365673', name: '0104Z4Z11', power: 103, voltage: 233.3, current: 445, lampStatus: '关', brightness: '-', networkStatus: '离线', lastOnline: '2026-04-24 18:20:10', strategy: '', switchRecord: '', available: '启用' },
  { no: 13, product: '电信CAT1', imei: '863123069231120', name: '1号楼-极简05', power: 44, voltage: 234.3, current: 202, lampStatus: '关', brightness: '-', networkStatus: '离线', lastOnline: '2026-04-23 17:56:55', strategy: '光明园区照明管理(勿删)', switchRecord: '', available: '启用' },
  { no: 14, product: 'EXC-CAT1', imei: '8649000666361359', name: '展示0204Z05', power: 232, voltage: 237.9, current: 999, lampStatus: '关', brightness: '-', networkStatus: '离线', lastOnline: '2026-04-09 21:29:55', strategy: '', switchRecord: '', available: '启用' }
])

const switchRecords = ref([
  { id: 1, time: '2026-04-28 17:57:42', action: '开灯', operator: 'admin', remark: '定时任务' },
  { id: 2, time: '2026-04-28 06:00:00', action: '关灯', operator: 'admin', remark: '定时任务' },
  { id: 3, time: '2026-04-27 18:00:00', action: '开灯', operator: 'admin', remark: '定时任务' },
  { id: 4, time: '2026-04-27 06:00:00', action: '关灯', operator: 'admin', remark: '定时任务' }
])

const total = computed(() => filteredData.value.length)
const selectedItems = ref([])

const filteredData = computed(() => {
  let result = lampData.value
  if (filterProduct.value) {
    result = result.filter(item => item.product === filterProduct.value)
  }
  if (filterLampStatus.value) {
    result = result.filter(item => item.lampStatus === filterLampStatus.value)
  }
  if (filterNetworkStatus.value) {
    result = result.filter(item => item.networkStatus === filterNetworkStatus.value)
  }
  if (filterAvailable.value) {
    result = result.filter(item => item.available === filterAvailable.value)
  }
  if (searchText.value) {
    result = result.filter(item => item.imei.includes(searchText.value) || item.name.includes(searchText.value))
  }
  return result
})

const handleTreeCheck = (data, info) => {
  // 树形筛选逻辑
}

const handleSelectionChange = (val) => {
  selectedItems.value = val
}

const handleSearch = () => { currentPage.value = 1 }
const handleReset = () => {
  filterProduct.value = ''
  filterLampStatus.value = ''
  filterNetworkStatus.value = ''
  filterAvailable.value = ''
  searchText.value = ''
  currentPage.value = 1
}

const handleTurnOn = () => {
  if (selectedItems.value.length === 0) {
    ElMessage.warning('请先选择要开灯的灯具')
    return
  }
  
  // 更新选中灯具的状态
  selectedItems.value.forEach(item => {
    const lamp = lampData.value.find(l => l.no === item.no)
    if (lamp) {
      lamp.lampStatus = '开'
      lamp.brightness = '100%'
    }
  })
  
  ElMessage.success('已将选中的 ' + selectedItems.value.length + ' 个灯具开灯')
}

const handleTurnOff = () => {
  if (selectedItems.value.length === 0) {
    ElMessage.warning('请先选择要关灯的灯具')
    return
  }
  
  // 更新选中灯具的状态
  selectedItems.value.forEach(item => {
    const lamp = lampData.value.find(l => l.no === item.no)
    if (lamp) {
      lamp.lampStatus = '关'
      lamp.brightness = '0%'
    }
  })
  
  ElMessage.success('已将选中的 ' + selectedItems.value.length + ' 个灯具关灯')
}

const handleDimming = () => {
  if (selectedItems.value.length === 0) {
    ElMessage.warning('请先选择要调光的灯具')
    return
  }
  showDimmingDialog.value = true
}

const handleDimmingConfirm = () => {
  if (selectedItems.value.length === 0) {
    ElMessage.warning('请先选择要调光的灯具')
    return
  }
  
  // 更新选中灯具的亮度
  selectedItems.value.forEach(item => {
    const lamp = lampData.value.find(l => l.no === item.no)
    if (lamp) {
      lamp.brightness = brightnessValue.value + '%'
    }
  })
  
  ElMessage.success('已将选中的 ' + selectedItems.value.length + ' 个灯具亮度设置为 ' + brightnessValue + '%')
  showDimmingDialog.value = false
}

const handleSelfCheck = () => {
  ElMessage.info('自检功能')
}

const handleStatusSetting = () => {
  ElMessage.info('状态设置')
}

const handleBatchExport = () => {
  if (filteredData.value.length === 0) {
    ElMessage.warning('没有可导出的数据')
    return
  }
  
  const headers = ['No', '所属产品', 'IMEI号', '灯具名称', '功率(W)', '电压(V)', '电流(mA)', '灯具状态', '亮度(%)', '网络状态', '最后在线时间', '当前策略', '可用状态']
  const rows = filteredData.value.map(item => [
    item.no,
    item.product,
    item.imei,
    item.name,
    item.power,
    item.voltage,
    item.current,
    item.lampStatus,
    item.brightness,
    item.networkStatus,
    item.lastOnline,
    item.strategy,
    item.available
  ])
  
  let csvContent = '\uFEFF'
  csvContent += headers.join(',') + '\n'
  rows.forEach(row => {
    csvContent += row.join(',') + '\n'
  })
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `灯具数据_${new Date().toLocaleDateString()}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  ElMessage.success('导出成功')
}

const handleSwitchRecord = () => {
  showRecordDialog.value = true
}
</script>

<style scoped>
.lamp-manage {
  background: #f5f5f5;
  min-height: 100%;
  padding: 20px;
}

.main-content {
  display: flex;
  gap: 20px;
  height: calc(100vh - 120px);
}

.left-panel {
  width: 220px;
  background: #ffffff;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  padding: 12px;
  border-bottom: 1px solid #e8e8e8;
}

.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.page-header {
  margin-bottom: 15px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.filter-bar {
  background: #ffffff;
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 15px;
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-select {
  width: 150px;
}

.filter-input {
  width: 200px;
}

.table-wrapper {
  flex: 1;
  background: #ffffff;
  border-radius: 8px;
  padding: 15px;
  overflow: hidden;
}

.table-wrapper :deep(.el-table) {
  height: calc(100% - 30px);
}

.pagination {
  display: flex;
  justify-content: flex-end;
  background: #ffffff;
  padding: 15px;
  border-radius: 8px;
  margin-top: 15px;
}
</style>