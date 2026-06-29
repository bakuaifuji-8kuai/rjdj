<template>
  <div class="page-container">
    <div class="main-content">
      <div class="left-sidebar">
        <div class="sidebar-header">
          <el-input
            v-model="treeSearch"
            placeholder="请输入层级名称"
            class="sidebar-search"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <el-tree
          :data="treeData"
          :props="defaultProps"
          show-checkbox
          node-key="id"
          :default-expand-all="true"
          :expand-on-click-node="false"
        />
      </div>

      <div class="right-content">
        <div class="page-header">
          <div class="header-actions">
            <el-button type="primary" @click="showAddDialog = true">
              <el-icon><Plus /></el-icon>
              新增
            </el-button>
            <el-button type="success" @click="handleTurnOn">开灯</el-button>
            <el-button type="danger" @click="handleTurnOff">关灯</el-button>
            <el-button type="warning" @click="showDimmingDialog = true">调光</el-button>
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
            <el-option label="开" value="on"></el-option>
            <el-option label="关" value="off"></el-option>
          </el-select>
          <el-select v-model="filterNetworkStatus" placeholder="请选择网络状态" class="filter-select">
            <el-option label="全部" value=""></el-option>
            <el-option label="在线" value="online"></el-option>
            <el-option label="离线" value="offline"></el-option>
          </el-select>
          <el-select v-model="filterEnabled" placeholder="请选择可用状态" class="filter-select">
            <el-option label="全部" value=""></el-option>
            <el-option label="启用" value="enabled"></el-option>
            <el-option label="不启用" value="disabled"></el-option>
          </el-select>
          <el-input v-model="searchKeyword" placeholder="请输入IMEI号或名称" class="filter-input"></el-input>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>

        <div class="table-wrapper">
          <el-table :data="filteredData" border class="data-table" @selection-change="handleSelectionChange" style="width: 100%">
            <el-table-column type="selection" width="50"></el-table-column>
            <el-table-column prop="product" label="所属产品" width="80"></el-table-column>
            <el-table-column prop="imei" label="IMEI号" width="120" sortable></el-table-column>
            <el-table-column prop="name" label="灯具名称" width="100" sortable></el-table-column>
            <el-table-column prop="power" label="功率(W)" width="65" align="center"></el-table-column>
            <el-table-column prop="voltage" label="电压(V)" width="65" align="center"></el-table-column>
            <el-table-column prop="current" label="电流(mA)" width="75" align="center"></el-table-column>
            <el-table-column prop="lampStatus" label="灯具状态" width="70" align="center">
              <template #default="{ row }">
                <el-tag :type="row.lampStatus === 'on' ? 'success' : 'warning'" size="small">
                  {{ row.lampStatus === 'on' ? '开' : '关' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="brightness" label="亮度(%)" width="70" align="center">
              <template #default="{ row }">
                <span :class="row.brightness === '-' ? 'text-muted' : ''">{{ row.brightness }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="networkStatus" label="网络状态" width="75" align="center">
              <template #default="{ row }">
                <el-tag :type="row.networkStatus === 'online' ? 'success' : 'danger'" size="small">
                  {{ row.networkStatus === 'online' ? '在线' : '离线' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="lastOnline" label="最后在线时间" width="130" sortable></el-table-column>
            <el-table-column prop="currentStrategy" label="当前策略" width="120" show-overflow-tooltip></el-table-column>
            <el-table-column prop="switchRecord" label="开关灯记录" width="80" align="center">
              <template #default="{ row }">
                <el-button type="text" @click="viewSwitchRecord(row)">查看</el-button>
              </template>
            </el-table-column>
            <el-table-column prop="enabled" label="可用状态" width="75" align="center">
              <template #default="{ row }">
                <el-tag :type="row.enabled ? 'success' : 'danger'" size="small">
                  {{ row.enabled ? '启用' : '不启用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" align="center">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="handleDetail(row)">详情</el-button>
                <el-button type="warning" size="small" @click="handleEdit(row)">编辑</el-button>
                <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 15, 20, 50, 100]"
            layout="prev, pager, next, jumper, ->, sizes, total"
          ></el-pagination>
        </div>
      </div>
    </div>

    <!-- 调光对话框 -->
    <el-dialog title="调光控制" v-model="showDimmingDialog" width="400px">
      <div class="dimming-content">
        <div class="dimming-label">亮度值：{{ brightnessValue }}%</div>
        <el-slider v-model="brightnessValue" :min="0" :max="100" show-input />
        <div class="quick-actions">
          <el-button type="primary" @click="brightnessValue = 100">全亮</el-button>
          <el-button @click="brightnessValue = 75">75%</el-button>
          <el-button @click="brightnessValue = 50">50%</el-button>
          <el-button @click="brightnessValue = 25">25%</el-button>
        </div>
      </div>
      <template #footer>
        <el-button @click="showDimmingDialog = false">取消</el-button>
        <el-button type="primary" @click="handleDimming">确定</el-button>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog title="灯具详情" v-model="showDetailDialog" width="800px">
      <div v-if="selectedItem" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="所属产品">{{ selectedItem.product }}</el-descriptions-item>
          <el-descriptions-item label="IMEI号">{{ selectedItem.imei }}</el-descriptions-item>
          <el-descriptions-item label="灯具名称">{{ selectedItem.name }}</el-descriptions-item>
          <el-descriptions-item label="功率(W)">{{ selectedItem.power }}</el-descriptions-item>
          <el-descriptions-item label="电压(V)">{{ selectedItem.voltage }}</el-descriptions-item>
          <el-descriptions-item label="电流(mA)">{{ selectedItem.current }}</el-descriptions-item>
          <el-descriptions-item label="灯具状态">
            <el-tag :type="selectedItem.lampStatus === 'on' ? 'success' : 'warning'" size="small">
              {{ selectedItem.lampStatus === 'on' ? '开' : '关' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="亮度(%)">{{ selectedItem.brightness }}</el-descriptions-item>
          <el-descriptions-item label="网络状态">
            <el-tag :type="selectedItem.networkStatus === 'online' ? 'success' : 'danger'" size="small">
              {{ selectedItem.networkStatus === 'online' ? '在线' : '离线' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="最后在线">{{ selectedItem.lastOnline }}</el-descriptions-item>
          <el-descriptions-item label="当前策略">{{ selectedItem.currentStrategy }}</el-descriptions-item>
          <el-descriptions-item label="可用状态">
            <el-tag :type="selectedItem.enabled ? 'success' : 'danger'" size="small">
              {{ selectedItem.enabled ? '启用' : '不启用' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>

    <!-- 新增对话框 -->
    <el-dialog title="新增灯具" v-model="showAddDialog" width="600px">
      <el-form :model="addForm" label-width="100px">
        <el-form-item label="所属产品" prop="product" required>
          <el-select v-model="addForm.product" placeholder="请选择所属产品">
            <el-option label="电信CAT1" value="电信CAT1"></el-option>
            <el-option label="EXC-CAT1" value="EXC-CAT1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="IMEI号" prop="imei" required>
          <el-input v-model="addForm.imei" placeholder="请输入IMEI号" />
        </el-form-item>
        <el-form-item label="灯具名称" prop="name" required>
          <el-input v-model="addForm.name" placeholder="请输入灯具名称" />
        </el-form-item>
        <el-form-item label="功率(W)" prop="power">
          <el-input-number v-model="addForm.power" :min="0" placeholder="请输入功率" />
        </el-form-item>
        <el-form-item label="电压(V)" prop="voltage">
          <el-input-number v-model="addForm.voltage" :min="0" placeholder="请输入电压" />
        </el-form-item>
        <el-form-item label="电流(mA)" prop="current">
          <el-input-number v-model="addForm.current" :min="0" placeholder="请输入电流" />
        </el-form-item>
        <el-form-item label="可用状态" prop="enabled">
          <el-switch v-model="addForm.enabled" active-text="启用" inactive-text="不启用" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAdd">确定</el-button>
      </template>
    </el-dialog>

    <!-- 编辑对话框 -->
    <el-dialog title="编辑灯具" v-model="showEditDialog" width="600px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="所属产品" prop="product" required>
          <el-select v-model="editForm.product" placeholder="请选择所属产品">
            <el-option label="电信CAT1" value="电信CAT1"></el-option>
            <el-option label="EXC-CAT1" value="EXC-CAT1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="IMEI号" prop="imei" required>
          <el-input v-model="editForm.imei" placeholder="请输入IMEI号" />
        </el-form-item>
        <el-form-item label="灯具名称" prop="name" required>
          <el-input v-model="editForm.name" placeholder="请输入灯具名称" />
        </el-form-item>
        <el-form-item label="功率(W)" prop="power">
          <el-input-number v-model="editForm.power" :min="0" placeholder="请输入功率" />
        </el-form-item>
        <el-form-item label="电压(V)" prop="voltage">
          <el-input-number v-model="editForm.voltage" :min="0" placeholder="请输入电压" />
        </el-form-item>
        <el-form-item label="电流(mA)" prop="current">
          <el-input-number v-model="editForm.current" :min="0" placeholder="请输入电流" />
        </el-form-item>
        <el-form-item label="可用状态" prop="enabled">
          <el-switch v-model="editForm.enabled" active-text="启用" inactive-text="不启用" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="handleUpdate">确定</el-button>
      </template>
    </el-dialog>

    <!-- 开关灯记录对话框 -->
    <el-dialog title="开关灯记录" v-model="showSwitchRecordDialog" width="800px">
      <div v-if="selectedLamp">
        <el-table :data="switchRecords" border>
          <el-table-column prop="time" label="时间" width="180"></el-table-column>
          <el-table-column prop="action" label="操作" width="120">
            <template #default="scope">
              <el-tag :type="scope.row.action === '开灯' ? 'success' : 'warning'">
                {{ scope.row.action }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="brightness" label="亮度(%)" width="120"></el-table-column>
          <el-table-column prop="operator" label="操作人" width="120"></el-table-column>
          <el-table-column prop="remark" label="备注"></el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'

const currentPage = ref(1)
const pageSize = ref(15)
const total = ref(68)
const searchKeyword = ref('')
const filterProduct = ref('')
const filterLampStatus = ref('')
const filterNetworkStatus = ref('')
const filterEnabled = ref('')
const showDimmingDialog = ref(false)
const showDetailDialog = ref(false)
const showAddDialog = ref(false)
const showEditDialog = ref(false)
const showSwitchRecordDialog = ref(false)
const brightnessValue = ref(80)
const selectedRows = ref([])
const selectedItem = ref(null)
const selectedLamp = ref(null)
const treeSearch = ref('')
const editingItem = ref(null)

const switchRecords = ref([
  { time: '2026-04-28 17:47:19', action: '开灯', brightness: '80', operator: 'admin', remark: '定时策略执行' },
  { time: '2026-04-28 06:00:00', action: '关灯', brightness: '0', operator: 'system', remark: '日出策略执行' },
  { time: '2026-04-27 18:30:00', action: '开灯', brightness: '100', operator: 'admin', remark: '手动开启' },
  { time: '2026-04-27 05:30:00', action: '关灯', brightness: '0', operator: 'system', remark: '定时策略执行' },
  { time: '2026-04-26 19:00:00', action: '开灯', brightness: '70', operator: 'admin', remark: '调光开启' },
  { time: '2026-04-26 06:00:00', action: '关灯', brightness: '0', operator: 'system', remark: '日出策略执行' }
])

const addForm = ref({
  product: '',
  imei: '',
  name: '',
  power: 0,
  voltage: 0,
  current: 0,
  enabled: true
})

const editForm = ref({
  product: '',
  imei: '',
  name: '',
  power: 0,
  voltage: 0,
  current: 0,
  enabled: true
})

const defaultProps = {
  label: 'label',
  children: 'children'
}

const treeData = ref([
  {
    id: 1,
    label: '长沙',
    children: [
      {
        id: 2,
        label: '岳麓区',
        children: [
          { id: 3, label: '先导路' },
          { id: 4, label: '力唯中天1栋' }
        ]
      }
    ]
  }
])

const lampData = ref([
  { id: 1, product: '电信CAT1', imei: '862715067560391', name: '光亚展灯具', power: 0, voltage: 231.3, current: 0, lampStatus: 'on', brightness: '80', networkStatus: 'online', lastOnline: '2026-04-28 17:47:19', currentStrategy: '光明园区照明管理(勿删)', switchRecord: '查看', enabled: true },
  { id: 2, product: '电信CAT1', imei: '863123069184162', name: '1号楼-极简07', power: 0, voltage: 231.3, current: 0, lampStatus: 'on', brightness: '100', networkStatus: 'online', lastOnline: '2026-04-28 17:44:54', currentStrategy: '光明园区照明管理(勿删)', switchRecord: '查看', enabled: true },
  { id: 3, product: '电信CAT1', imei: '863123069133946', name: '宿舍楼02', power: 48, voltage: 0, current: 222, lampStatus: 'on', brightness: '60', networkStatus: 'online', lastOnline: '2026-04-28 04:53:41', currentStrategy: '光明园区照明管理(勿删)', switchRecord: '查看', enabled: true },
  { id: 4, product: '电信CAT1', imei: '863123069031165', name: '3号楼-极简13', power: 24, voltage: 233.1, current: 127, lampStatus: 'off', brightness: '-', networkStatus: 'offline', lastOnline: '2026-04-28 04:52:52', currentStrategy: '光明园区照明管理(勿删)', switchRecord: '查看', enabled: true },
  { id: 5, product: '电信CAT1', imei: '863123069267413', name: '食堂-极简18辅路', power: 22, voltage: 233.5, current: 110, lampStatus: 'on', brightness: '75', networkStatus: 'online', lastOnline: '2026-04-28 04:52:09', currentStrategy: '光明园区照明管理(勿删)', switchRecord: '查看', enabled: false },
  { id: 6, product: '电信CAT1', imei: '863123069265714', name: '食堂-极简18', power: 25, voltage: 233.8, current: 125, lampStatus: 'off', brightness: '-', networkStatus: 'offline', lastOnline: '2026-04-28 04:51:17', currentStrategy: '光明园区照明管理(勿删)', switchRecord: '查看', enabled: false },
  { id: 7, product: '电信CAT1', imei: '863123069277032', name: '3号楼-极简14', power: 24, voltage: 234.9, current: 122, lampStatus: 'off', brightness: '-', networkStatus: 'offline', lastOnline: '2026-04-28 04:46:48', currentStrategy: '光明园区照明管理(勿删)', switchRecord: '查看', enabled: true },
  { id: 8, product: '电信CAT1', imei: '863123069201446', name: '食堂-极简17', power: 26, voltage: 234.3, current: 130, lampStatus: 'off', brightness: '-', networkStatus: 'offline', lastOnline: '2026-04-28 04:46:48', currentStrategy: '光明园区照明管理(勿删)', switchRecord: '查看', enabled: true },
  { id: 9, product: '电信CAT1', imei: '863123069081624', name: '宿舍楼01', power: 48, voltage: 0, current: 218, lampStatus: 'on', brightness: '70', networkStatus: 'online', lastOnline: '2026-04-28 04:53:13', currentStrategy: '光明园区照明管理(勿删)', switchRecord: '查看', enabled: true },
  { id: 10, product: '电信CAT1', imei: '863123069146013', name: '宿舍楼03', power: 47, voltage: 233.2, current: 214, lampStatus: 'on', brightness: '50', networkStatus: 'online', lastOnline: '2026-04-28 04:52:12', currentStrategy: '光明园区照明管理(勿删)', switchRecord: '查看', enabled: true },
  { id: 11, product: '电信CAT1', imei: '863123069236392', name: '食堂-极简16', power: 26, voltage: 234.4, current: 130, lampStatus: 'off', brightness: '-', networkStatus: 'offline', lastOnline: '2026-04-28 04:40:04', currentStrategy: '光明园区照明管理(勿删)', switchRecord: '查看', enabled: true },
  { id: 12, product: 'EXC-CAT1', imei: '864900066365673', name: '0104Z11', power: 103, voltage: 233.3, current: 445, lampStatus: 'off', brightness: '-', networkStatus: 'offline', lastOnline: '2026-04-24 18:20:10', currentStrategy: '-', switchRecord: '查看', enabled: false },
  { id: 13, product: '电信CAT1', imei: '863123069231120', name: '1号楼-极简05', power: 44, voltage: 234.3, current: 202, lampStatus: 'off', brightness: '-', networkStatus: 'offline', lastOnline: '2026-04-23 17:45:55', currentStrategy: '光明园区照明管理(勿删)', switchRecord: '查看', enabled: true },
  { id: 14, product: 'EXC-CAT1', imei: '864900066361359', name: '展示0204Z05', power: 232, voltage: 237.9, current: 999, lampStatus: 'on', brightness: '90', networkStatus: 'online', lastOnline: '2026-04-09 21:19:55', currentStrategy: '-', switchRecord: '查看', enabled: true }
])

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
  if (filterEnabled.value) {
    result = result.filter(item => filterEnabled.value === 'enabled' ? item.enabled : !item.enabled)
  }
  if (searchKeyword.value) {
    result = result.filter(item => 
      item.imei.includes(searchKeyword.value) || 
      item.name.includes(searchKeyword.value)
    )
  }
  return result
})

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const handleSearch = () => {
  ElMessage.success('查询成功')
}

const handleReset = () => {
  searchKeyword.value = ''
  filterProduct.value = ''
  filterLampStatus.value = ''
  filterNetworkStatus.value = ''
  filterEnabled.value = ''
}

const handleTurnOn = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要控制的灯具')
    return
  }
  ElMessage.success(`已开启 ${selectedRows.value.length} 个灯具`)
}

const handleTurnOff = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要控制的灯具')
    return
  }
  ElMessage.success(`已关闭 ${selectedRows.value.length} 个灯具`)
}

const handleDimming = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要调光的灯具')
    return
  }
  ElMessage.success(`已将 ${selectedRows.value.length} 个灯具亮度设置为 ${brightnessValue.value}%`)
  showDimmingDialog.value = false
}

const handleDetail = (row) => {
  selectedItem.value = row
  showDetailDialog.value = true
}

const handleMore = (row) => {
  ElMessage.info(`更多操作: ${row.name}`)
}

const handleViewSwitchRecord = (row) => {
  ElMessage.info(`查看 ${row.name} 的开关灯记录`)
}

const handleAdd = () => {
  if (!addForm.value.product) {
    ElMessage.warning('请选择所属产品')
    return
  }
  if (!addForm.value.imei) {
    ElMessage.warning('请输入IMEI号')
    return
  }
  if (!addForm.value.name) {
    ElMessage.warning('请输入灯具名称')
    return
  }
  
  const newLamp = {
    id: Date.now(),
    product: addForm.value.product,
    imei: addForm.value.imei,
    name: addForm.value.name,
    power: addForm.value.power,
    voltage: addForm.value.voltage,
    current: addForm.value.current,
    lampStatus: 'off',
    brightness: '-',
    networkStatus: 'online',
    lastOnline: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
    currentStrategy: '-',
    switchRecord: '查看',
    enabled: addForm.value.enabled
  }
  
  lampData.value.unshift(newLamp)
  total.value++
  
  addForm.value = {
    product: '',
    imei: '',
    name: '',
    power: 0,
    voltage: 0,
    current: 0,
    enabled: true
  }
  showAddDialog.value = false
  ElMessage.success('新增灯具成功')
}

const handleEdit = (row) => {
  editingItem.value = row
  editForm.value = {
    product: row.product,
    imei: row.imei,
    name: row.name,
    power: row.power,
    voltage: row.voltage,
    current: row.current,
    enabled: row.enabled
  }
  showEditDialog.value = true
}

const handleUpdate = () => {
  if (!editForm.value.product) {
    ElMessage.warning('请选择所属产品')
    return
  }
  if (!editForm.value.imei) {
    ElMessage.warning('请输入IMEI号')
    return
  }
  if (!editForm.value.name) {
    ElMessage.warning('请输入灯具名称')
    return
  }
  
  const index = lampData.value.findIndex(item => item.id === editingItem.value.id)
  if (index !== -1) {
    lampData.value[index] = {
      ...lampData.value[index],
      product: editForm.value.product,
      imei: editForm.value.imei,
      name: editForm.value.name,
      power: editForm.value.power,
      voltage: editForm.value.voltage,
      current: editForm.value.current,
      enabled: editForm.value.enabled
    }
  }
  
  showEditDialog.value = false
  ElMessage.success('更新灯具成功')
}

const handleDelete = (row) => {
  ElMessageBox.confirm(
    '确定要删除这个灯具吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = lampData.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      lampData.value.splice(index, 1)
      total.value--
    }
    ElMessage.success('删除灯具成功')
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const viewSwitchRecord = (row) => {
  selectedLamp.value = row
  showSwitchRecordDialog.value = true
}
</script>

<style scoped>
.page-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  padding: 10px;
  box-sizing: border-box;
  min-width: 0;
}

.main-content {
  display: flex;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.left-sidebar {
  width: 180px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
  padding: 12px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  margin-bottom: 15px;
}

.sidebar-search :deep(.el-input__wrapper) {
  background: #fff;
}

.left-sidebar :deep(.el-tree) {
  flex: 1;
  overflow-y: auto;
}

.right-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow-y: auto;
}

.page-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e8e8e8;
  flex-shrink: 0;
  width: 100%;
}

.header-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
  width: 100%;
}

.control-btn {
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  border: none;
  color: #fff;
  white-space: nowrap;
}

.control-btn:hover {
  background: linear-gradient(135deg, #40a9ff 0%, #1890ff 100%);
}

.default-btn {
  background: #fff;
  border: 1px solid #d9d9d9;
  color: #666;
  white-space: nowrap;
}

.default-btn:hover {
  color: #1890ff;
  border-color: #1890ff;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  padding: 12px 15px;
  background: #fafafa;
  border-radius: 8px;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.filter-select {
  width: 140px;
  flex-shrink: 0;
}

.filter-input {
  width: 200px;
  flex-shrink: 0;
}

.table-wrapper {
  flex: 1;
  overflow-x: auto;
  overflow-y: auto;
  min-height: 0;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
}

.data-table {
  width: 100%;
  min-width: 1350px;
}

.data-table :deep(.text-muted) {
  color: #999;
}

.pagination-wrapper {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
}

.detail-content {
  padding: 10px 0;
}

.dimming-content {
  padding: 20px;
}

.dimming-label {
  text-align: center;
  font-size: 16px;
  color: #333;
  margin-bottom: 20px;
}

.quick-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
}
</style>
