<template>
  <div class="lighting-control">
    <div class="page-header">
      <h2>隧道照明</h2>
      <div class="header-actions" v-if="activeTab === 'dimming'">
        <el-button type="primary" @click="handleAdd">新增</el-button>
        <el-button type="danger" :disabled="selectedDimmingItems.length === 0" @click="handleBatchDeleteDimming">批量删除</el-button>
      </div>
    </div>

    <el-tabs v-model="activeTab" type="card" style="margin-bottom: 20px;">
      <el-tab-pane label="调光控制" name="dimming">
        <div class="filter-bar">
          <el-select v-model="filterTunnel" placeholder="展厅隧道" style="width: 150px;">
            <el-option label="展厅隧道" value="展厅隧道" />
            <el-option label="先导路" value="先导路" />
          </el-select>
          <el-select v-model="filterHole" placeholder="展厅隧道洞" style="width: 150px;">
            <el-option label="展厅隧道洞" value="展厅隧道洞" />
          </el-select>
          <el-button type="primary" @click="handleSearch">查询</el-button>
        </div>

        <div class="table-wrapper">
          <el-table :data="dimmingData" border @selection-change="handleDimmingSelectionChange">
            <el-table-column type="selection" width="50" />
            <el-table-column prop="id" label="No" width="60" />
            <el-table-column prop="sectionType" label="分段-照明类型" min-width="150" />
            <el-table-column prop="dawn" label="凌晨" width="80">
              <template #default="{ row }">{{ row.dawn || '-' }}</template>
            </el-table-column>
            <el-table-column prop="day" label="白天" width="80">
              <template #default="{ row }">{{ row.day || '-' }}</template>
            </el-table-column>
            <el-table-column prop="dusk" label="傍晚" width="80">
              <template #default="{ row }">{{ row.dusk || '-' }}</template>
            </el-table-column>
            <el-table-column prop="night" label="夜间" width="80">
              <template #default="{ row }">{{ row.night || '-' }}</template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button type="text" size="small" @click="handleEditDimming(row)">修改</el-button>
                <el-button type="text" size="small" style="color: #f56c6c;" @click="handleDeleteDimming(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <el-tab-pane label="回路控制" name="circuit">
        <div class="filter-bar">
          <el-select v-model="circuitFilter" placeholder="选择回路" style="width: 200px;">
            <el-option label="全部回路" value="" />
            <el-option label="回路1" value="1" />
            <el-option label="回路2" value="2" />
          </el-select>
          <el-button type="primary" @click="handleCircuitSearch">查询</el-button>
        </div>

        <div class="table-wrapper">
          <el-table :data="circuitData" border>
            <el-table-column type="selection" width="50" />
            <el-table-column prop="id" label="回路编号" width="100" />
            <el-table-column prop="name" label="回路名称" width="120" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === '正常' ? 'success' : 'danger'" size="small">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="load" label="负载率" width="100">
              <template #default="{ row }">{{ row.load }}%</template>
            </el-table-column>
            <el-table-column prop="power" label="功率(kW)" width="100" />
            <el-table-column prop="devices" label="关联设备" width="100" />
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button type="text" size="small" @click="handleCircuitControl(row)">控制</el-button>
                <el-button type="text" size="small" style="color: #f56c6c;" @click="handleDeleteCircuit(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>

    <el-dialog title="回路调光" v-model="showCircuitControlDialog" width="500px">
      <el-form :model="circuitControlForm" label-width="100px">
        <el-form-item label="回路名称">
          <span>{{ circuitControlForm.name }}</span>
        </el-form-item>
        <el-form-item label="亮度(%)">
          <el-slider v-model="circuitControlForm.brightness" :min="0" :max="100" style="width: 300px;" />
          <el-input-number v-model="circuitControlForm.brightness" :min="0" :max="100" style="width: 80px;" />
        </el-form-item>
        <el-form-item label="预设">
          <el-button size="small" @click="circuitControlForm.brightness = 0">0%</el-button>
          <el-button size="small" @click="circuitControlForm.brightness = 25">25%</el-button>
          <el-button size="small" @click="circuitControlForm.brightness = 50">50%</el-button>
          <el-button size="small" @click="circuitControlForm.brightness = 75">75%</el-button>
          <el-button size="small" @click="circuitControlForm.brightness = 100">100%</el-button>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCircuitControlDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSaveCircuitControl">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog title="新增" v-model="showDimmingDialog" width="500px">
      <el-form :model="dimmingForm" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="分段类型">
              <el-select v-model="dimmingForm.sectionType">
                <el-option label="入口段" value="入口段" />
                <el-option label="基本段" value="基本段" />
                <el-option label="出口段" value="出口段" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分段名称">
              <el-select v-model="dimmingForm.sectionName" placeholder="请选择">
                <el-option label="入口段-全部" value="入口段-全部" />
                <el-option label="入口段-基本照明" value="入口段-基本照明" />
                <el-option label="基本段-基本照明" value="基本段-基本照明" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="*照明级别" required>
              <el-select v-model="dimmingForm.lightingLevel">
                <el-option label="基本照明" value="基本照明" />
                <el-option label="加强照明" value="加强照明" />
                <el-option label="应急照明" value="应急照明" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="*执行模式" required>
              <el-select v-model="dimmingForm.executeMode">
                <el-option label="光感" value="光感" />
                <el-option label="时序" value="时序" />
                <el-option label="手动" value="手动" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="*传感器类型" required>
              <el-select v-model="dimmingForm.sensorType">
                <el-option label="光照度传感器" value="光照度传感器" />
                <el-option label="CO传感器" value="CO传感器" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="启用">
              <el-checkbox v-model="dimmingForm.enabled" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="照度值1">
              <el-input-number v-model="dimmingForm.illuminance1" style="width: 100px;" />
              <span style="margin: 0 10px;">lx</span>
              <el-input-number v-model="dimmingForm.illuminance2" style="width: 100px;" />
              <span style="margin-left: 10px;">lx</span>
              <el-button type="primary" size="small" style="margin-left: 20px;">+</el-button>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="16">
            <el-form-item label="调光值1">
              <el-slider v-model="dimmingForm.dimmingValue" :min="0" :max="100" style="width: 200px;" />
              <el-input-number v-model="dimmingForm.dimmingValue" :min="0" :max="100" style="width: 80px;" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="是否启用">
              <el-switch v-model="dimmingForm.dimmingEnabled" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="showDimmingDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSaveDimming">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const activeTab = ref('dimming')
const filterTunnel = ref('展厅隧道')
const filterHole = ref('展厅隧道洞')
const circuitFilter = ref('')
const showDimmingDialog = ref(false)
const selectedDimmingItems = ref([])

const dimmingForm = ref({
  sectionType: '入口段',
  sectionName: '',
  lightingLevel: '基本照明',
  executeMode: '光感',
  sensorType: '光照度传感器',
  enabled: true,
  illuminance1: 2500,
  illuminance2: 25000,
  dimmingValue: 50,
  dimmingEnabled: true
})

const dimmingData = ref([
  { id: 1, sectionType: '入口段-基本照明', dawn: '-', day: '-', dusk: '-', night: '-', status: '未配置' },
  { id: 2, sectionType: '入口段-全部', dawn: '-', day: '-', dusk: '-', night: '-', status: '未配置' },
  { id: 3, sectionType: '基本段-基本照明', dawn: '10%', day: '30%', dusk: '20%', night: '15%', status: '已配置' }
])

const circuitData = ref([
  { id: 'HL-001', name: '照明回路1', status: '正常', load: 65, power: 12.5, devices: 24 },
  { id: 'HL-002', name: '照明回路2', status: '正常', load: 45, power: 8.8, devices: 18 },
  { id: 'HL-003', name: '照明回路3', status: '故障', load: 0, power: 0, devices: 20 },
  { id: 'HL-004', name: '应急回路', status: '正常', load: 30, power: 5.2, devices: 10 }
])

const handleSearch = () => {
  console.log('Search:', filterTunnel.value, filterHole.value)
}

const handleCircuitSearch = () => {
  console.log('Circuit search:', circuitFilter.value)
}

const handleEditDimming = (row) => {
  dimmingForm.value.sectionType = row.sectionType.split('-')[0] || '入口段'
  dimmingForm.value.sectionName = row.sectionType
  showDimmingDialog.value = true
}

const handleAdd = () => {
  dimmingForm.value = {
    sectionType: '入口段',
    sectionName: '',
    lightingLevel: '基本照明',
    executeMode: '光感',
    sensorType: '光照度传感器',
    enabled: true,
    illuminance1: 2500,
    illuminance2: 25000,
    dimmingValue: 50,
    dimmingEnabled: true
  }
  showDimmingDialog.value = true
}

const handleDeleteDimming = (row) => {
  ElMessageBox.confirm('确定要删除该调光配置吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = dimmingData.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      dimmingData.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

const handleDimmingSelectionChange = (selection) => {
  selectedDimmingItems.value = selection
}

const handleBatchDeleteDimming = () => {
  ElMessageBox.confirm(`确定要删除选中的 ${selectedDimmingItems.value.length} 条调光配置吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const ids = selectedDimmingItems.value.map(item => item.id)
    dimmingData.value = dimmingData.value.filter(item => !ids.includes(item.id))
    selectedDimmingItems.value = []
    ElMessage.success('批量删除成功')
  }).catch(() => {})
}

const showCircuitControlDialog = ref(false)
const circuitControlForm = ref({
  id: '',
  name: '',
  brightness: 50
})

const handleCircuitControl = (row) => {
  circuitControlForm.value = {
    id: row.id,
    name: row.name,
    brightness: 50
  }
  showCircuitControlDialog.value = true
}

const handleSaveCircuitControl = () => {
  const circuit = circuitData.value.find(item => item.id === circuitControlForm.value.id)
  if (circuit) {
    ElMessage.success(`${circuitControlForm.value.name} 调光成功，亮度: ${circuitControlForm.value.brightness}%`)
  }
  showCircuitControlDialog.value = false
}

const handleSaveDimming = () => {
  const targetIndex = dimmingData.value.findIndex(item => item.sectionType === dimmingForm.value.sectionName)
  if (targetIndex !== -1) {
    dimmingData.value[targetIndex].dawn = `${dimmingForm.value.dimmingValue}%`
    dimmingData.value[targetIndex].day = `${dimmingForm.value.dimmingValue}%`
    dimmingData.value[targetIndex].dusk = `${dimmingForm.value.dimmingValue}%`
    dimmingData.value[targetIndex].night = `${dimmingForm.value.dimmingValue}%`
    dimmingData.value[targetIndex].status = '已配置'
  } else {
    dimmingData.value.push({
      id: Date.now(),
      sectionType: dimmingForm.value.sectionName,
      dawn: `${dimmingForm.value.dimmingValue}%`,
      day: `${dimmingForm.value.dimmingValue}%`,
      dusk: `${dimmingForm.value.dimmingValue}%`,
      night: `${dimmingForm.value.dimmingValue}%`,
      status: '已配置'
    })
  }
  ElMessage.success('调光配置保存成功')
  showDimmingDialog.value = false
}

const handleDeleteCircuit = (row) => {
  console.log('Delete circuit:', row)
}
</script>

<style scoped>
.lighting-control {
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

.filter-bar {
  background: #ffffff;
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  gap: 15px;
  align-items: center;
}

.table-wrapper {
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
}
</style>
