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
          <div class="title">灯控管理</div>
          <div class="header-actions">
            <el-button type="primary" @click="handleAdd">新增</el-button>
            <el-button @click="handleImport">批量导入</el-button>
            <el-button @click="handleExport">批量导出</el-button>
            <el-button type="danger" :disabled="selectedRows.length === 0" @click="handleBatchDelete">删除</el-button>
          </div>
        </div>

        <div class="filter-bar">
          <el-select v-model="filterProduct" placeholder="请选择所属产品" class="filter-select">
            <el-option label="全部" value=""></el-option>
            <el-option label="EXC-CAT1" value="EXC-CAT1"></el-option>
            <el-option label="电信CAT1" value="电信CAT1"></el-option>
          </el-select>
          <el-select v-model="filterStatus" placeholder="请选择网络状态" class="filter-select">
            <el-option label="全部" value=""></el-option>
            <el-option label="在线" value="online"></el-option>
            <el-option label="离线" value="offline"></el-option>
          </el-select>
          <el-input v-model="searchKeyword" placeholder="请输入IMEI号或名称" class="filter-input"></el-input>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>

        <el-table :data="filteredData" border class="data-table" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50"></el-table-column>
          <el-table-column prop="no" label="No" width="60" align="center"></el-table-column>
          <el-table-column prop="product" label="所属产品" min-width="100"></el-table-column>
          <el-table-column prop="imei" label="IMEI号" min-width="150" sortable></el-table-column>
          <el-table-column prop="name" label="灯控名称" min-width="120" sortable></el-table-column>
          <el-table-column prop="circuitCount" label="回路数量" width="100" align="center"></el-table-column>
          <el-table-column prop="poleName" label="灯杆名称" min-width="120" sortable></el-table-column>
          <el-table-column prop="networkStatus" label="网络状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.networkStatus === 'online' ? 'success' : 'danger'" size="small">
                {{ row.networkStatus === 'online' ? '在线' : '离线' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="lastOnline" label="最后在线时间" min-width="160" sortable></el-table-column>
          <el-table-column label="操作" width="200" align="center">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="handleEdit(row)">修改</el-button>
              <el-button type="info" size="small" @click="handleDetail(row)">详情</el-button>
              <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
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
          ></el-pagination>
        </div>
      </div>
    </div>

    <!-- 新增/编辑灯控对话框 -->
    <el-dialog :title="isEdit ? '修改灯控' : '新增灯控'" v-model="showDialog" width="700px">
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="*所属产品" prop="product">
              <el-select v-model="formData.product" placeholder="请选择所属产品" style="width: 100%">
                <el-option label="EXC-CAT1" value="EXC-CAT1"></el-option>
                <el-option label="电信CAT1" value="电信CAT1"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="*IMEI号" prop="imei">
              <el-input v-model="formData.imei" placeholder="请输入灯控IMEI"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="*灯控名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入灯控名称"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="绑定线路">
              <el-select v-model="formData.circuit" placeholder="请选择" style="width: 100%">
                <el-option label="力唯中天1栋1号配电柜-主照明回路" value="circuit1"></el-option>
                <el-option label="力唯中天1栋1号配电柜-景观照明回路" value="circuit2"></el-option>
                <el-option label="力唯中天1栋2号配电柜-主照明回路" value="circuit3"></el-option>
                <el-option label="力唯中天1栋2号配电柜-景观照明回路" value="circuit4"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="*所属灯杆" prop="poleName">
              <el-select v-model="formData.poleName" placeholder="请选择所属灯杆" style="width: 100%">
                <el-option label="力唯中天1栋1号灯杆" value="力唯中天1栋1号灯杆"></el-option>
                <el-option label="力唯中天1栋2号灯杆" value="力唯中天1栋2号灯杆"></el-option>
                <el-option label="力唯中天1栋3号灯杆" value="力唯中天1栋3号灯杆"></el-option>
                <el-option label="力唯中天1栋4号灯杆" value="力唯中天1栋4号灯杆"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="*回路数" prop="circuitCount">
              <el-select v-model="formData.circuitCount" placeholder="请选择回路数" style="width: 100%">
                <el-option label="1" :value="1"></el-option>
                <el-option label="2" :value="2"></el-option>
                <el-option label="3" :value="3"></el-option>
                <el-option label="4" :value="4"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="调光类型">
              <el-radio-group v-model="formData.dimmingType">
                <el-radio label="正向">正向</el-radio>
                <el-radio label="逆向">逆向</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog title="灯控详情" v-model="showDetailDialog" width="800px">
      <div v-if="selectedItem" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="所属产品">{{ selectedItem.product }}</el-descriptions-item>
          <el-descriptions-item label="IMEI号">{{ selectedItem.imei }}</el-descriptions-item>
          <el-descriptions-item label="灯控名称">{{ selectedItem.name }}</el-descriptions-item>
          <el-descriptions-item label="灯杆名称">{{ selectedItem.poleName }}</el-descriptions-item>
          <el-descriptions-item label="回路数量">{{ selectedItem.circuitCount }}</el-descriptions-item>
          <el-descriptions-item label="网络状态">
            <el-tag :type="selectedItem.networkStatus === 'online' ? 'success' : 'danger'" size="small">
              {{ selectedItem.networkStatus === 'online' ? '在线' : '离线' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="最后在线">{{ selectedItem.lastOnline }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>

    <!-- 批量导入弹窗 -->
    <el-dialog title="批量导入灯控" v-model="showImportDialog" width="500px">
      <el-upload
        ref="uploadRef"
        class="upload-demo"
        drag
        :auto-upload="false"
        :on-change="handleFileChange"
        :limit="1"
        accept=".xlsx,.xls"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            只能上传 xlsx/xls 文件，模板请先下载
          </div>
        </template>
      </el-upload>
      <el-button type="primary" style="margin-top: 20px;" @click="downloadTemplate">下载导入模板</el-button>
      <template #footer>
        <el-button @click="showImportDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmImport" :disabled="!importFile">确定导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, UploadFilled } from '@element-plus/icons-vue'

const currentPage = ref(1)
const pageSize = ref(15)
const total = ref(61)
const searchKeyword = ref('')
const filterProduct = ref('')
const filterStatus = ref('')
const showDialog = ref(false)
const showDetailDialog = ref(false)
const isEdit = ref(false)
const selectedRows = ref([])
const selectedItem = ref(null)
const treeSearch = ref('')
const formRef = ref(null)
const showImportDialog = ref(false)
const importFile = ref(null)
const uploadRef = ref(null)

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

const lampControlData = ref([
  { no: 1, product: 'EXC-CAT1', imei: '864900066803780', name: '展示0303Z08', circuitCount: 1, poleName: '力唯中天1栋1号灯杆', networkStatus: 'offline', lastOnline: '2025-06-07 18:19:15' },
  { no: 2, product: 'EXC-CAT1', imei: '864900066830981', name: '展示0401Z10', circuitCount: 1, poleName: '力唯中天1栋2号灯杆', networkStatus: 'offline', lastOnline: '2025-10-15 05:05:40' },
  { no: 3, product: 'EXC-CAT1', imei: '864900066389699', name: '展示0504Z02', circuitCount: 1, poleName: '力唯中天1栋3号灯杆', networkStatus: 'offline', lastOnline: '2025-06-07 16:26:54' },
  { no: 4, product: 'EXC-CAT1', imei: '864900066368727', name: '展示0503Z02', circuitCount: 1, poleName: '力唯中天1栋4号灯杆', networkStatus: 'offline', lastOnline: '2025-09-28 15:16:56' },
  { no: 5, product: 'EXC-CAT1', imei: '864900066365889', name: '展示0502Z01', circuitCount: 1, poleName: '力唯中天1栋1号灯杆', networkStatus: 'offline', lastOnline: '2025-09-28 15:16:59' },
  { no: 6, product: 'EXC-CAT1', imei: '864900066389038', name: '展示0501Z01', circuitCount: 1, poleName: '力唯中天1栋2号灯杆', networkStatus: 'offline', lastOnline: '2025-11-22 18:55:35' },
  { no: 7, product: 'EXC-CAT1', imei: '864900066361359', name: '展示0204Z05', circuitCount: 1, poleName: '力唯中天1栋3号灯杆', networkStatus: 'offline', lastOnline: '2026-04-29 21:19:55' },
  { no: 8, product: 'EXC-CAT1', imei: '864900066801586', name: '展示0203Z05', circuitCount: 1, poleName: '力唯中天1栋4号灯杆', networkStatus: 'offline', lastOnline: '2026-01-12 15:02:40' },
  { no: 9, product: 'EXC-CAT1', imei: '864900066368735', name: '展示0202Z05', circuitCount: 1, poleName: '力唯中天1栋1号灯杆', networkStatus: 'offline', lastOnline: '2026-03-20 10:47:38' },
  { no: 10, product: 'EXC-CAT1', imei: '864900066392321', name: '展示0201Z05', circuitCount: 1, poleName: '力唯中天1栋2号灯杆', networkStatus: 'offline', lastOnline: '2026-02-26 15:24:25' },
  { no: 11, product: 'EXC-CAT1', imei: '864900066785755', name: '展示0304Z08', circuitCount: 1, poleName: '力唯中天1栋3号灯杆', networkStatus: 'offline', lastOnline: '2025-06-07 18:19:58' },
  { no: 12, product: 'EXC-CAT1', imei: '864900066817368', name: '展示0302Z08', circuitCount: 1, poleName: '力唯中天1栋4号灯杆', networkStatus: 'offline', lastOnline: '2025-06-16 11:34:39' },
  { no: 13, product: 'EXC-CAT1', imei: '864900066841392', name: '展示0301Z08', circuitCount: 1, poleName: '力唯中天1栋1号灯杆', networkStatus: 'offline', lastOnline: '2026-03-24 10:54:54' },
  { no: 14, product: 'EXC-CAT1', imei: '864900066392024', name: '展示0404Z10', circuitCount: 1, poleName: '力唯中天1栋2号灯杆', networkStatus: 'offline', lastOnline: '2025-11-26 15:16:32' },
  { no: 15, product: 'EXC-CAT1', imei: '864900066793361', name: '展示0403Z10', circuitCount: 1, poleName: '力唯中天1栋3号灯杆', networkStatus: 'offline', lastOnline: '2026-01-30 18:48:58' }
])

const formData = ref({
  product: '',
  imei: '',
  name: '',
  circuit: '',
  poleName: '',
  circuitCount: '',
  dimmingType: '正向'
})

const formRules = {
  product: [{ required: true, message: '请选择所属产品', trigger: 'change' }],
  imei: [{ required: true, message: '请输入IMEI号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入灯控名称', trigger: 'blur' }],
  poleName: [{ required: true, message: '请选择所属灯杆', trigger: 'change' }],
  circuitCount: [{ required: true, message: '请选择回路数', trigger: 'change' }]
}

const filteredData = computed(() => {
  let result = lampControlData.value
  if (filterProduct.value) {
    result = result.filter(item => item.product === filterProduct.value)
  }
  if (filterStatus.value) {
    result = result.filter(item => item.networkStatus === filterStatus.value)
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
  filterStatus.value = ''
}

const handleAdd = () => {
  isEdit.value = false
  formData.value = {
    product: '',
    imei: '',
    name: '',
    circuit: '',
    poleName: '',
    circuitCount: '',
    dimmingType: '正向'
  }
  showDialog.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  formData.value = {
    product: row.product,
    imei: row.imei,
    name: row.name,
    circuit: '',
    poleName: row.poleName,
    circuitCount: row.circuitCount,
    dimmingType: '正向'
  }
  showDialog.value = true
}

const handleDetail = (row) => {
  selectedItem.value = row
  showDetailDialog.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除灯控【${row.name}】吗？`,
    '删除确认',
    { type: 'warning' }
  ).then(() => {
    const index = lampControlData.value.findIndex(item => item.imei === row.imei)
    if (index !== -1) {
      lampControlData.value.splice(index, 1)
    }
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要删除的灯控')
    return
  }
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedRows.value.length} 个灯控吗？`,
    '批量删除确认',
    { type: 'warning' }
  ).then(() => {
    const imeis = selectedRows.value.map(row => row.imei)
    lampControlData.value = lampControlData.value.filter(item => !imeis.includes(item.imei))
    selectedRows.value = []
    ElMessage.success('批量删除成功')
  }).catch(() => {})
}

const handleSubmit = () => {
  formRef.value?.validate((valid) => {
    if (valid) {
      if (isEdit.value) {
        const index = lampControlData.value.findIndex(item => item.imei === formData.value.imei)
        if (index !== -1) {
          lampControlData.value[index].name = formData.value.name
          lampControlData.value[index].poleName = formData.value.poleName
          lampControlData.value[index].circuitCount = formData.value.circuitCount
        }
        ElMessage.success('修改成功')
      } else {
        const newNo = lampControlData.value.length > 0 ? Math.max(...lampControlData.value.map(item => item.no)) + 1 : 1
        lampControlData.value.push({
          no: newNo,
          product: formData.value.product,
          imei: formData.value.imei,
          name: formData.value.name,
          circuitCount: formData.value.circuitCount,
          poleName: formData.value.poleName,
          networkStatus: 'offline',
          lastOnline: new Date().toLocaleString('zh-CN')
        })
        ElMessage.success('新增成功')
      }
      showDialog.value = false
    }
  })
}

// 批量导入
const handleImport = () => {
  showImportDialog.value = true
  importFile.value = null
}

// 文件变更处理
const handleFileChange = (file) => {
  importFile.value = file.raw
}

// 下载导入模板
const downloadTemplate = () => {
  ElMessage.success('模板下载成功（演示版）')
}

// 确认导入
const confirmImport = () => {
  if (!importFile.value) {
    ElMessage.warning('请先选择文件')
    return
  }
  ElMessage.success('批量导入成功（演示版）')
  showImportDialog.value = false
}

// 批量导出
const handleExport = () => {
  if (filteredData.value.length === 0) {
    ElMessage.warning('没有可导出的数据')
    return
  }
  
  const headers = ['No', '所属产品', 'IMEI号', '灯控名称', '回路数量', '灯杆名称', '网络状态', '最后在线']
  const rows = filteredData.value.map(item => [
    item.no,
    item.product,
    item.imei,
    item.name,
    item.circuitCount,
    item.poleName,
    item.networkStatus === 'online' ? '在线' : '离线',
    item.lastOnline
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
  link.setAttribute('download', `灯控数据_${new Date().toLocaleDateString()}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  ElMessage.success('导出成功')
}
</script>

<style scoped>
.page-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  padding: 20px;
}

.main-content {
  display: flex;
  gap: 20px;
  height: 100%;
}

.left-sidebar {
  width: 200px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
  padding: 15px;
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
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  padding: 12px 15px;
  background: #fafafa;
  border-radius: 8px;
}

.filter-select {
  width: 150px;
}

.filter-input {
  width: 200px;
}

.data-table {
  flex: 1;
  overflow: hidden;
}

.pagination-wrapper {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}

.detail-content {
  padding: 10px 0;
}

.asset-content {
  padding: 40px;
  text-align: center;
  color: #6b7a8f;
}
</style>