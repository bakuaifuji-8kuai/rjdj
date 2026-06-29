<template>
  <div class="pole-manage">
    <div class="main-content">
      <div class="left-panel">
        <div class="panel-header">
          <el-input v-model="treeSearch" placeholder="请输入层级名称" prefix-icon="Search" />
        </div>
        <el-tree
          ref="treeRef"
          :data="treeData"
          :props="defaultProps"
          show-checkbox
          node-key="id"
          :expand-on-click-node="false"
          @check="handleCheck"
        />
      </div>

      <div class="right-panel">
        <div class="page-header">
          <h2>灯杆管理</h2>
          <div class="header-actions">
            <el-button type="primary" @click="handleAdd">新增</el-button>
            <el-button type="warning" @click="handleImport">批量导入</el-button>
            <el-button @click="handleExport">批量导出</el-button>
            <el-button type="danger" :disabled="selectedItems.length === 0" @click="handleBatchDelete">删除</el-button>
          </div>
        </div>

        <div class="filter-bar">
          <el-input v-model="searchText" placeholder="请输入名称进行查询" style="width: 250px;" />
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>

        <div class="table-wrapper">
          <el-table :data="filteredPoleData" border @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="50" />
            <el-table-column prop="id" label="No" width="60" />
            <el-table-column prop="name" label="灯杆名称" width="150" />
            <el-table-column prop="code" label="灯杆编号" width="140" />
            <el-table-column prop="height" label="规格(米)" width="100" />
            <el-table-column prop="lampCount" label="挂载设备数" width="120" />
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="handleEdit(row)">修改</el-button>
                <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="pagination">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            layout="prev, pager, next, jumper, ->, sizes, total"
            :page-sizes="[15, 30, 50, 100]"
          />
        </div>
      </div>
    </div>

    <el-dialog :title="dialogTitle" v-model="showDialog" width="700px">
      <el-form :model="form" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="*灯杆名称" required>
              <el-input v-model="form.name" placeholder="请输入灯杆名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="*灯杆编号" required>
              <el-input v-model="form.code" placeholder="请输入灯杆编号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="灯杆规格">
              <el-input-number v-model="form.height" :min="0" :max="50" :step="0.01" style="width: 100%;" />
              <span style="margin-left: 5px;">米</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="*所属层级" required>
              <el-select v-model="form.location" style="width: 100%;">
                <el-option label="长沙-岳麓区-先导路" value="长沙-岳麓区-先导路" />
                <el-option label="长沙-岳麓区-力唯中天1栋" value="长沙-岳麓区-力唯中天1栋" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="*灯杆经度" required>
              <el-input v-model="form.lng" placeholder="请输入灯杆经度" />
              <el-button size="small" style="margin-left: 5px;">定位</el-button>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="*灯杆纬度" required>
              <el-input v-model="form.lat" placeholder="请输入灯杆纬度" />
              <el-button size="small" style="margin-left: 5px;">定位</el-button>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="安装日期">
              <el-date-picker v-model="form.installDate" type="date" placeholder="请选择日期" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="安装位置">
              <el-input v-model="form.installLocation" placeholder="请输入灯杆安装位置" />
            </el-form-item>
          </el-col>
        </el-row>
        <div class="image-section">
          <el-form-item label="配置图片">
            <div class="image-preview">
              <img v-if="form.imageUrl" :src="form.imageUrl" class="preview-img" />
              <div v-else class="preview-placeholder">
                <span>点击上传图片</span>
              </div>
            </div>
            <div class="image-library">
              <span class="library-title">素材库(10/10)</span>
              <div class="library-images">
                <div 
                  v-for="(img, index) in imageLibrary" 
                  :key="index" 
                  class="library-item"
                  :class="{ active: form.imageUrl === img }"
                  @click="selectImage(img)"
                >
                  <img :src="img" class="library-img" />
                </div>
              </div>
            </div>
            <el-button type="primary" style="margin-top: 10px;">上传</el-button>
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSave">确定</el-button>
      </template>
    </el-dialog>

    <!-- 批量导入弹窗 -->
    <el-dialog title="批量导入灯杆" v-model="showImportDialog" width="500px">
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
import { UploadFilled } from '@element-plus/icons-vue'

const treeRef = ref(null)
const treeSearch = ref('')
const searchText = ref('')
const selectedLocation = ref('')
const currentPage = ref(1)
const pageSize = ref(15)
const showDialog = ref(false)
const showImportDialog = ref(false)
const isEdit = ref(false)
const dialogTitle = computed(() => isEdit.value ? '修改灯杆' : '新增灯杆')
const importFile = ref(null)
const uploadRef = ref(null)

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

const form = ref({
  id: null,
  name: '',
  code: '',
  height: 0,
  location: '',
  lng: '',
  lat: '',
  installDate: '',
  installLocation: '',
  imageUrl: ''
})

const imageLibrary = [
  'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=street%20lamp%20pole%20modern%20design&image_size=square',
  'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=led%20street%20light%20pole&image_size=square',
  'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=garden%20lamp%20post&image_size=square',
  'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=outdoor%20lighting%20pole&image_size=square',
  'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=solar%20street%20light&image_size=square',
  'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=street%20light%20fixture&image_size=square',
  'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=decorative%20lamp%20pole&image_size=square',
  'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=industrial%20light%20pole&image_size=square'
]

const poleData = ref([
  { id: 1, name: '美人广场新1', code: '美人广场新1', height: 11, lampCount: 0, location: '长沙-岳麓区-先导路' },
  { id: 2, name: '灯具展示06', code: 'ZS06', height: 3, lampCount: 3, location: '长沙-岳麓区-力唯中天1栋' },
  { id: 3, name: '灯具展示05', code: 'ZS05', height: 3, lampCount: 4, location: '长沙-岳麓区-力唯中天1栋' },
  { id: 4, name: '灯具展示04', code: 'ZS04', height: 3, lampCount: 4, location: '长沙-岳麓区-力唯中天1栋' },
  { id: 5, name: '灯具展示03', code: 'ZS03', height: 3, lampCount: 4, location: '长沙-岳麓区-力唯中天1栋' },
  { id: 6, name: '灯具展示02', code: 'ZS02', height: 3, lampCount: 4, location: '长沙-岳麓区-力唯中天1栋' },
  { id: 7, name: '灯具展示01', code: 'ZS01', height: 3, lampCount: 4, location: '长沙-岳麓区-力唯中天1栋' },
  { id: 8, name: '彩云街路灯', code: 'X001', height: 0, lampCount: 0, location: '长沙-岳麓区-先导路' },
  { id: 9, name: '太阳能测试', code: 'T001', height: 0, lampCount: 1, location: '长沙-岳麓区-先导路' },
  { id: 10, name: '光亚展灯杆', code: 'GYZ0036', height: 10, lampCount: 3, location: '长沙-岳麓区-先导路' },
  { id: 11, name: 'Z08灯杆(左)', code: 'ZT-Z08', height: 3, lampCount: 1, location: '长沙-岳麓区-先导路' },
  { id: 12, name: 'Z05灯杆(中)', code: 'ZT-Z05', height: 3, lampCount: 1, location: '长沙-岳麓区-先导路' },
  { id: 13, name: 'Z10灯杆(右)', code: 'ZT-Z10', height: 3, lampCount: 1, location: '长沙-岳麓区-先导路' },
  { id: 14, name: '1号楼-极简05', code: 'L05', height: 6, lampCount: 2, location: '长沙-岳麓区-力唯中天1栋' },
  { id: 15, name: '1号楼-极简06', code: 'L06', height: 6, lampCount: 2, location: '长沙-岳麓区-力唯中天1栋' }
])

const total = computed(() => filteredPoleData.value.length)
const selectedItems = ref([])
const checkedLocations = ref([])

const filteredPoleData = computed(() => {
  let result = poleData.value
  if (searchText.value) {
    result = result.filter(item => item.name.includes(searchText.value) || item.code.includes(searchText.value))
  }
  if (checkedLocations.value.length > 0) {
    result = result.filter(item => checkedLocations.value.includes(item.location))
  }
  return result
})

const handleCheck = (data, info) => {
  // 获取所有选中的叶子节点
  const checkedKeys = info.checkedKeys
  const selected = []
  
  // 遍历树获取选中的叶子节点
  const traverse = (nodes) => {
    for (const node of nodes) {
      if (checkedKeys.includes(node.id)) {
        if (!node.children || node.children.length === 0) {
          // 叶子节点，直接添加
          if (node.id === 111) selected.push('长沙-岳麓区-先导路')
          if (node.id === 112) selected.push('长沙-岳麓区-力唯中天1栋')
        }
      }
      if (node.children && node.children.length > 0) {
        traverse(node.children)
      }
    }
  }
  traverse(treeData.value)
  checkedLocations.value = selected
}

const handleSelectionChange = (val) => {
  selectedItems.value = val
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该灯杆吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = poleData.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      poleData.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

const handleBatchDelete = () => {
  if (selectedItems.value.length === 0) {
    ElMessage.warning('请先选择要删除的灯杆')
    return
  }
  ElMessageBox.confirm(`确定要删除选中的 ${selectedItems.value.length} 个灯杆吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const ids = selectedItems.value.map(item => item.id)
    poleData.value = poleData.value.filter(item => !ids.includes(item.id))
    selectedItems.value = []
    ElMessage.success('批量删除成功')
  }).catch(() => {})
}

const handleSearch = () => { currentPage.value = 1 }
const handleReset = () => { searchText.value = ''; currentPage.value = 1 }

const handleAdd = () => {
  isEdit.value = false
  form.value = {
    id: null,
    name: '',
    code: '',
    height: 0,
    location: '',
    lng: '',
    lat: '',
    installDate: '',
    installLocation: '',
    imageUrl: ''
  }
  showDialog.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  form.value = { ...row }
  showDialog.value = true
}

const selectImage = (img) => {
  form.value.imageUrl = img
}

const handleSave = () => {
  if (isEdit.value) {
    const index = poleData.value.findIndex(p => p.id === form.value.id)
    if (index > -1) {
      poleData.value[index] = { ...poleData.value[index], ...form.value }
    }
    ElMessage.success('修改成功')
  } else {
    const newId = Math.max(...poleData.value.map(p => p.id)) + 1
    poleData.value.push({ id: newId, ...form.value })
    ElMessage.success('新增成功')
  }
  showDialog.value = false
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
  // 模拟导入过程
  ElMessage.success('批量导入成功（演示版）')
  showImportDialog.value = false
}

// 批量导出
const handleExport = () => {
  if (filteredPoleData.value.length === 0) {
    ElMessage.warning('没有可导出的数据')
    return
  }
  
  // 模拟导出 - 生成CSV格式
  const headers = ['No', '灯杆名称', '灯杆编号', '规格(米)', '挂载设备数', '位置']
  const rows = filteredPoleData.value.map(item => [
    item.id,
    item.name,
    item.code,
    item.height,
    item.lampCount,
    item.location
  ])
  
  // 组合CSV内容
  let csvContent = '\uFEFF' // 添加BOM防止中文乱码
  csvContent += headers.join(',') + '\n'
  rows.forEach(row => {
    csvContent += row.join(',') + '\n'
  })
  
  // 创建下载链接
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `灯杆数据_${new Date().toLocaleDateString()}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  ElMessage.success('导出成功')
}
</script>

<style scoped>
.pole-manage {
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.page-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f1f1f;
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

.image-section {
  margin-top: 20px;
}

.image-preview {
  margin-bottom: 15px;
}

.preview-img {
  width: 150px;
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #e8e8e8;
}

.preview-placeholder {
  width: 150px;
  height: 150px;
  border: 1px dashed #e8e8e8;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  cursor: pointer;
}

.image-library {
  margin-bottom: 15px;
}

.library-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 10px;
  display: block;
}

.library-images {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.library-item {
  width: 80px;
  height: 80px;
  border: 2px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  overflow: hidden;
}

.library-item.active {
  border-color: #409eff;
}

.library-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>