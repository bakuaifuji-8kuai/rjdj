<template>
  <div class="lamp-manage">
    <div class="page-header">
      <h2>隧道灯管理</h2>
      <div class="header-actions">
        <el-button type="text" @click="handleDimming">调光</el-button>
        <el-button type="primary" @click="handleAdd">新增</el-button>
        <el-button type="primary" @click="handleBatchImport">批量导入</el-button>
        <el-button type="danger" :disabled="selectedItems.length === 0" @click="handleBatchDelete">删除</el-button>
      </div>
    </div>

    <div class="filter-bar">
      <el-select v-model="filterProduct" placeholder="请选择所属产品" style="width: 180px;" clearable>
        <el-option label="PLC灯控" value="PLC灯控" />
        <el-option label="隧道485灯控" value="隧道485灯控" />
      </el-select>
      <el-select v-model="filterStatus" placeholder="请选择网络状态" style="width: 180px;" clearable>
        <el-option label="在线" value="在线" />
        <el-option label="离线" value="离线" />
      </el-select>
      <el-input v-model="searchText" placeholder="请输入IMEI号或名称" style="width: 250px;" clearable />
      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <div class="table-wrapper">
      <el-table :data="lampData" border @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="No" width="60" />
        <el-table-column prop="product" label="所属产品" width="140" />
        <el-table-column prop="imei" label="IMEI号" width="140" />
        <el-table-column prop="controllerName" label="灯控名称" width="150" />
        <el-table-column prop="brightness" label="亮度(%)" width="150">
          <template #default="{ row }">
            <el-slider v-model="row.brightness" :min="0" :max="100" :disabled="row.status === '离线'" style="width: 100px;" />
            <span style="margin-left: 10px;">{{ row.brightness }}%</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="网络状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '在线' ? 'success' : 'danger'" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastOnline" label="最后在线时间" width="180" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="text" size="small" @click="handleEdit(row)">修改</el-button>
            <el-button type="text" size="small" @click="handleDetail(row)">详情</el-button>
            <el-button type="text" size="small" style="color: #f56c6c;" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        layout="prev, pager, next, jumper"
      />
      <span style="margin-left: 20px;">上一页</span>
      <el-select v-model="currentPage" style="width: 80px; margin: 0 5px;">
        <el-option :value="1" label="1" />
      </el-select>
      <span>下一页</span>
      <span style="margin: 0 10px;">前往</span>
      <el-input-number v-model="currentPage" :min="1" :max="1" style="width: 80px;" />
      <span style="margin: 0 5px;">页</span>
      <span>每页显示</span>
      <el-select v-model="pageSize" style="width: 80px; margin: 0 5px;">
        <el-option :value="15" label="15" />
        <el-option :value="30" label="30" />
        <el-option :value="50" label="50" />
      </el-select>
      <span>条 共 {{ total }} 条</span>
    </div>

    <el-dialog title="批量导入" v-model="showImportDialog" width="500px">
      <el-form :model="importForm" label-width="100px">
        <el-form-item label="选择文件">
          <el-upload
            class="upload-demo"
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :file-list="importForm.fileList"
            accept=".xlsx,.xls,.csv"
          >
            <el-button type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">
              请上传Excel文件(.xlsx/.xls)或CSV文件(.csv)
            </div>
          </el-upload>
        </el-form-item>
        <el-form-item label="导入模式">
          <el-radio-group v-model="importForm.mode">
            <el-radio label="新增" value="add">新增</el-radio>
            <el-radio label="覆盖" value="overwrite">覆盖</el-radio>
            <el-radio label="跳过" value="skip">跳过重复</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <span class="import-tip">
            <strong>模板说明：</strong><br/>
            1. 文件格式：Excel(.xlsx/.xls)或CSV(.csv)<br/>
            2. 必填字段：IMEI号、灯控名称<br/>
            3. 可选字段：所属产品、亮度、所属层级<br/>
            4. 点击下载模板获取导入格式
          </span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="text" @click="handleDownloadTemplate">下载模板</el-button>
        <el-button @click="showImportDialog = false">取消</el-button>
        <el-button type="primary" @click="handleImport">开始导入</el-button>
      </template>
    </el-dialog>

    <el-dialog title="新增灯控" v-model="showAddDialog" width="600px">
      <el-form :model="addForm" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="*所属产品" required>
              <el-select v-model="addForm.product">
                <el-option label="PLC灯控" value="PLC灯控" />
                <el-option label="隧道485灯控" value="隧道485灯控" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="*IMEI号" required>
              <el-input v-model="addForm.imei" placeholder="请输入灯控IMEI" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="*灯控名称" required>
              <el-input v-model="addForm.controllerName" placeholder="请输入灯控名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="绑定回路">
              <el-select v-model="addForm.circuit" placeholder="请选择">
                <el-option label="展厅配电柜/隧道线型灯供电(开)" value="展厅配电柜/隧道线型灯供电(开)" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="*所属层级" required>
              <el-select v-model="addForm.level">
                <el-option label="长沙-岳麓区-先导路" value="长沙-岳麓区-先导路" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="*回路数" required>
              <el-select v-model="addForm.circuitCount">
                <el-option label="单路" value="单路" />
                <el-option label="双路" value="双路" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="*照明级别" required>
              <el-select v-model="addForm.lightingLevel">
                <el-option label="基本照明" value="基本照明" />
                <el-option label="加强照明" value="加强照明" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="*调光类型" required>
              <el-radio-group v-model="addForm.dimmingType">
                <el-radio label="正向" value="正向" />
                <el-radio label="逆向" value="逆向" />
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <div class="form-section">
          <span class="section-title">灯具信息</span>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="*灯具名称" required>
                <el-input v-model="addForm.lightName" placeholder="请输入灯具名称" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="额定功率">
                <el-input v-model="addForm.power" style="width: 120px;" placeholder="请输入额定功率" />
                <span style="margin-left: 10px;">W</span>
                <el-button type="primary" size="small" style="margin-left: 20px;">+</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAddSave">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog title="修改灯控" v-model="showEditDialog" width="600px">
      <el-form :model="editForm" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="*所属产品" required>
              <el-select v-model="editForm.product">
                <el-option label="PLC灯控" value="PLC灯控" />
                <el-option label="隧道485灯控" value="隧道485灯控" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="*IMEI号" required>
              <el-input v-model="editForm.imei" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="*灯控名称" required>
              <el-input v-model="editForm.controllerName" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="绑定回路">
              <el-select v-model="editForm.circuit">
                <el-option label="展厅配电柜/隧道线型灯供电(开)" value="展厅配电柜/隧道线型灯供电(开)" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="*所属层级" required>
              <el-select v-model="editForm.level">
                <el-option label="长沙-岳麓区-先导路" value="长沙-岳麓区-先导路" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="*回路数" required>
              <el-select v-model="editForm.circuitCount">
                <el-option label="单路" value="单路" />
                <el-option label="双路" value="双路" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="*照明级别" required>
              <el-select v-model="editForm.lightingLevel">
                <el-option label="基本照明" value="基本照明" />
                <el-option label="加强照明" value="加强照明" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="*调光类型" required>
              <el-radio-group v-model="editForm.dimmingType">
                <el-radio label="正向" value="正向" />
                <el-radio label="逆向" value="逆向" />
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="handleEditSave">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog title="调光" v-model="showDimmingDialog" width="500px">
      <el-form :model="dimmingForm" label-width="100px">
        <el-form-item label="亮度(%)">
          <el-slider v-model="dimmingForm.brightness" :min="0" :max="100" style="width: 300px;" />
          <el-input-number v-model="dimmingForm.brightness" :min="0" :max="100" style="width: 80px;" />
        </el-form-item>
        <el-form-item label="预设">
          <el-button size="small" @click="dimmingForm.brightness = 25">25%</el-button>
          <el-button size="small" @click="dimmingForm.brightness = 50">50%</el-button>
          <el-button size="small" @click="dimmingForm.brightness = 75">75%</el-button>
          <el-button size="small" @click="dimmingForm.brightness = 100">100%</el-button>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDimmingDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSaveDimming">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog title="灯控详情" v-model="showDetailDialog" width="600px">
      <el-tabs v-model="detailTab" type="card">
        <el-tab-pane label="基本信息" name="basic">
          <div class="detail-content">
            <div class="detail-row">
              <span class="detail-label">所属产品：</span>
              <span class="detail-value">{{ detailForm.product }}</span>
              <span class="detail-label">IMEI号：</span>
              <span class="detail-value">{{ detailForm.imei }}</span>
              <span class="detail-label">灯控名称：</span>
              <span class="detail-value">{{ detailForm.controllerName }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">所属层级：</span>
              <span class="detail-value">{{ detailForm.level }}</span>
              <span class="detail-label">回路数：</span>
              <span class="detail-value">{{ detailForm.circuitCount }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">调光类型：</span>
              <span class="detail-value">{{ detailForm.dimmingType }}</span>
              <span class="detail-label">项目经纬度：</span>
              <span class="detail-value">{{ detailForm.latLng }}</span>
              <el-button type="text" size="small">同步</el-button>
              <span class="detail-label">灯控经纬度：</span>
              <span class="detail-value">{{ detailForm.deviceLatLng }}</span>
              <el-button type="text" size="small">回读</el-button>
            </div>
            <div class="detail-row">
              <span class="detail-label">数据上报周期：</span>
              <span class="detail-value">{{ detailForm.reportCycle }}</span>
              <span class="detail-label">绑定线路：</span>
              <span class="detail-value">{{ detailForm.line }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">所属集控：</span>
              <span class="detail-value">{{ detailForm.centralControl }}</span>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="上传信息" name="upload">
          <div class="detail-content">
            <div class="detail-row">
              <span class="detail-label">数据上报时间：</span>
              <span class="detail-value">{{ detailForm.reportTime }}</span>
              <span class="detail-label">网络状态：</span>
              <span class="detail-value">{{ detailForm.status }}</span>
              <span class="detail-label">最后在线时间：</span>
              <span class="detail-value">{{ detailForm.lastOnline }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">电压(V)：</span>
              <span class="detail-value">{{ detailForm.voltage }}</span>
              <span class="detail-label">能耗(kwh)：</span>
              <span class="detail-value">{{ detailForm.energy }}</span>
              <span class="detail-label">温度(℃)：</span>
              <span class="detail-value">{{ detailForm.temperature }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">电压(V)：</span>
              <span class="detail-value">{{ detailForm.voltage }}</span>
              <span class="detail-label">能耗(kwh)：</span>
              <span class="detail-value">{{ detailForm.energy }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">硬件版本：</span>
              <span class="detail-value">{{ detailForm.hardwareVersion }}</span>
              <span class="detail-label">固件版本：</span>
              <span class="detail-value">{{ detailForm.firmwareVersion }}</span>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
      <template #footer>
        <el-button type="primary" @click="showDetailDialog = false">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const filterProduct = ref('')
const filterStatus = ref('')
const searchText = ref('')
const currentPage = ref(1)
const pageSize = ref(15)
const showAddDialog = ref(false)
const showEditDialog = ref(false)
const showDetailDialog = ref(false)
const showImportDialog = ref(false)
const detailTab = ref('basic')

const importForm = ref({
  fileList: [],
  mode: 'add'
})

const addForm = ref({
  product: '',
  imei: '',
  controllerName: '',
  circuit: '',
  level: '',
  circuitCount: '',
  lightingLevel: '',
  dimmingType: '正向',
  lightName: '',
  power: ''
})

const editForm = ref({
  product: '',
  imei: '',
  controllerName: '',
  circuit: '',
  level: '',
  circuitCount: '',
  lightingLevel: '',
  dimmingType: '正向'
})

const detailForm = ref({
  product: '',
  imei: '',
  controllerName: '',
  level: '',
  circuitCount: '',
  dimmingType: '',
  latLng: '',
  deviceLatLng: '',
  reportCycle: '',
  line: '',
  centralControl: '',
  reportTime: '',
  status: '',
  lastOnline: '',
  voltage: '',
  energy: '',
  temperature: '',
  hardwareVersion: '',
  firmwareVersion: ''
})

const lampData = ref([
  { id: 1, product: 'PLC灯控', imei: '1C1334124028', controllerName: '线性隧道灯', brightness: 20, status: '在线', lastOnline: '2026-04-28 17:00:47' },
  { id: 2, product: 'PLC灯控', imei: '1C1334124028', controllerName: '线性隧道灯', brightness: 20, status: '在线', lastOnline: '2026-04-28 13:37:40' },
  { id: 3, product: '隧道485灯控', imei: '1C133413190B', controllerName: '高速隧道灯', brightness: 100, status: '在线', lastOnline: '2026-04-28 13:37:40' }
])

const total = computed(() => lampData.value.length)

const selectedItems = ref([])
const selectedLamps = ref([])
const showDimmingDialog = ref(false)
const dimmingForm = ref({
  brightness: 50
})

const handleSelectionChange = (val) => {
  selectedItems.value = val
  selectedLamps.value = val.map(item => item.id)
}

const handleDimming = () => {
  if (selectedLamps.value.length === 0) {
    ElMessage.warning('请先选择要调光的灯具')
    return
  }
  dimmingForm.value.brightness = 50
  showDimmingDialog.value = true
}

const handleSaveDimming = () => {
  selectedLamps.value.forEach(id => {
    const lamp = lampData.value.find(item => item.id === id)
    if (lamp) {
      lamp.brightness = dimmingForm.value.brightness
    }
  })
  ElMessage.success('调光成功')
  showDimmingDialog.value = false
  selectedLamps.value = []
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该隧道灯吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = lampData.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      lampData.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

const handleBatchDelete = () => {
  if (selectedItems.value.length === 0) {
    ElMessage.warning('请先选择要删除的隧道灯')
    return
  }
  ElMessageBox.confirm(`确定要删除选中的 ${selectedItems.value.length} 个隧道灯吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const ids = selectedItems.value.map(item => item.id)
    lampData.value = lampData.value.filter(item => !ids.includes(item.id))
    selectedItems.value = []
    selectedLamps.value = []
    ElMessage.success('批量删除成功')
  }).catch(() => {})
}

const handleBatchImport = () => {
  importForm.value = {
    fileList: [],
    mode: 'add'
  }
  showImportDialog.value = true
}

const handleFileChange = (file, fileList) => {
  importForm.value.fileList = fileList
}

const handleDownloadTemplate = () => {
  const templateContent = `所属产品,IMEI号,灯控名称,亮度(%),所属层级
PLC灯控,1C1334124028,线性隧道灯,50,长沙-岳麓区-先导路
隧道485灯控,1C133413190B,高速隧道灯,100,长沙-岳麓区-先导路`
  
  const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', '隧道灯导入模板.csv')
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  ElMessage.success('模板下载成功')
}

const handleImport = () => {
  if (importForm.value.fileList.length === 0) {
    ElMessage.warning('请先选择要导入的文件')
    return
  }
  
  const mockData = [
    { id: Date.now(), product: 'PLC灯控', imei: 'IMPORT001', controllerName: '批量导入灯1', brightness: 50, status: '在线', lastOnline: new Date().toLocaleString() },
    { id: Date.now() + 1, product: 'PLC灯控', imei: 'IMPORT002', controllerName: '批量导入灯2', brightness: 75, status: '在线', lastOnline: new Date().toLocaleString() },
    { id: Date.now() + 2, product: '隧道485灯控', imei: 'IMPORT003', controllerName: '批量导入灯3', brightness: 100, status: '在线', lastOnline: new Date().toLocaleString() }
  ]

  if (importForm.value.mode === 'add') {
    lampData.value = [...lampData.value, ...mockData]
  } else if (importForm.value.mode === 'overwrite') {
    lampData.value = mockData
  }
  
  ElMessage.success(`成功导入 ${mockData.length} 条记录`)
  showImportDialog.value = false
}

const handleSearch = () => { currentPage.value = 1 }
const handleReset = () => { filterProduct.value = ''; filterStatus.value = ''; searchText.value = ''; currentPage.value = 1 }
const handleAdd = () => {
  addForm.value = {
    product: '',
    imei: '',
    controllerName: '',
    circuit: '',
    level: '',
    circuitCount: '',
    lightingLevel: '',
    dimmingType: '正向',
    lightName: '',
    power: ''
  }
  showAddDialog.value = true
}
const handleEdit = (row) => {
  editForm.value = {
    product: row.product,
    imei: row.imei,
    controllerName: row.controllerName,
    circuit: '',
    level: '长沙-岳麓区-先导路',
    circuitCount: '单路',
    lightingLevel: '基本照明',
    dimmingType: '正向'
  }
  showEditDialog.value = true
}
const handleDetail = (row) => {
  detailForm.value = {
    product: row.product,
    imei: row.imei,
    controllerName: row.controllerName,
    level: '长沙-岳麓区-先导路',
    circuitCount: '单路',
    dimmingType: '正向',
    latLng: '22.735108,113.930463',
    deviceLatLng: '0,0',
    reportCycle: '-',
    line: '展厅配电柜-隧道线型灯供电(开)',
    centralControl: '先导路集控',
    reportTime: '2026-04-28 12:01',
    status: '在线',
    lastOnline: row.lastOnline,
    voltage: '232.8',
    energy: '0',
    temperature: '33',
    hardwareVersion: '0.0',
    firmwareVersion: '15020'
  }
  showDetailDialog.value = true
}
const handleAddSave = () => {
  showAddDialog.value = false
}
const handleEditSave = () => {
  showEditDialog.value = false
}
</script>

<style scoped>
.lamp-manage {
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
  margin-bottom: 20px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  background: #ffffff;
  padding: 20px;
  border-radius: 8px;
}

.form-section {
  margin-top: 20px;
}

.section-title {
  font-weight: 600;
  color: #409eff;
  display: block;
  margin-bottom: 15px;
}

.detail-content {
  padding: 10px;
}

.detail-row {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 15px;
}

.detail-label {
  font-weight: 500;
  color: #666;
  min-width: 100px;
}

.detail-value {
  color: #333;
  margin-right: 30px;
  margin-bottom: 5px;
}

.import-tip {
  color: #666;
  font-size: 13px;
  line-height: 1.8;
}
</style>
