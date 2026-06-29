<template>
  <div class="page-container">
    <div class="page-header">
      <div class="title">线路信息</div>
      <div class="header-actions">
        <el-button type="primary" @click="showAddDialog = true">新增</el-button>
        <el-button type="primary" @click="showImportDialog = true">批量导入</el-button>
      </div>
    </div>

    <div class="main-content">
      <div class="left-panel">
        <div class="panel-header">
          <span class="panel-title">配电柜列表</span>
        </div>
        <div class="search-box">
          <el-input
            v-model="cabinetSearch"
            placeholder="请输入"
            class="search-input"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <div class="cabinet-list">
          <div
            v-for="cabinet in filteredCabinets"
            :key="cabinet.id"
            class="cabinet-item"
            :class="{ active: selectedCabinet?.id === cabinet.id }"
            @click="selectCabinet(cabinet)"
          >
            <div class="cabinet-name">{{ cabinet.name }}</div>
            <div class="cabinet-code">编号: {{ cabinet.code }}</div>
          </div>
        </div>
      </div>

      <div class="right-panel">
        <div class="panel-header">
          <span class="panel-title">线路信息</span>
        </div>
        <el-table :data="filteredLines" border class="line-table">
          <el-table-column prop="name" label="线路名称" min-width="150" />
          <el-table-column prop="code" label="线路编号" min-width="120" />
          <el-table-column prop="lampCount" label="关联灯控数" width="100" align="center" />
          <el-table-column label="操作" width="160" align="center">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="editLine(row)">修改</el-button>
              <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <el-dialog v-model="showImportDialog" title="批量导入线路" width="500px">
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
            2. 必填字段：配电柜名称、线路编号、线路名称<br/>
            3. 可选字段：控制类型、单三相、参考电流等<br/>
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

    <el-dialog v-model="showAddDialog" :title="isEdit ? '修改' : '新增'" width="650px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="*配电柜名称" prop="cabinetId">
              <el-select v-model="form.cabinetId" placeholder="请选择" style="width: 100%;">
                <el-option
                  v-for="cabinet in cabinets"
                  :key="cabinet.id"
                  :label="cabinet.name"
                  :value="cabinet.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="*上级线路" prop="parentLine">
              <el-select v-model="form.parentLine" placeholder="请选择" style="width: 100%;">
                <el-option label="无" value="" />
                <el-option label="主线1" value="main1" />
                <el-option label="主线2" value="main2" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="*控制类型" prop="controlType">
              <el-select v-model="form.controlType" placeholder="请选择" style="width: 100%;">
                <el-option label="断路器" value="breaker" />
                <el-option label="接触器" value="contactor" />
                <el-option label="继电器" value="relay" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="*线路编号" prop="code">
              <el-input v-model="form.code" placeholder="请输入" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="*线路名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="*单三相" prop="phaseType">
              <el-select v-model="form.phaseType" placeholder="请选择" style="width: 100%;">
                <el-option label="单相" value="single" />
                <el-option label="三相" value="three" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="参考电流(A)" prop="refCurrent">
              <el-input v-model="form.refCurrent" placeholder="请输入参考电流" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="额定功率" prop="ratedPower">
              <el-input v-model="form.ratedPower" placeholder="请输入额定功率" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="电流上限值(A)" prop="currentMax">
              <el-input v-model="form.currentMax" placeholder="请输入电流上限值" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电流下限值(A)" prop="currentMin">
              <el-input v-model="form.currentMin" placeholder="请输入电流下限值" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="请输入备注" maxlength="20" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const showAddDialog = ref(false)
const showImportDialog = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const cabinetSearch = ref('')
const selectedCabinet = ref(null)

const importForm = reactive({
  fileList: [],
  mode: 'add'
})

const cabinets = ref([
  { id: 1, name: '先导路1号配电柜', code: 'PDG-XDL-001' },
  { id: 2, name: '先导路2号配电柜', code: 'PDG-XDL-002' },
  { id: 3, name: '先导路1栋1号配电柜', code: 'PDG-LWZT-001' },
  { id: 4, name: '先导路1栋2号配电柜', code: 'PDG-LWZT-002' }
])

const lines = ref([
  { id: 1, cabinetId: 1, name: '断路器', code: 'AL10', lampCount: 0, parentLine: '', controlType: 'breaker', phaseType: 'single', refCurrent: '', ratedPower: '', currentMax: '', currentMin: '', remark: '' }
])

const form = reactive({
  cabinetId: '',
  parentLine: '',
  controlType: '',
  code: '',
  name: '',
  phaseType: '',
  refCurrent: '',
  ratedPower: '',
  currentMax: '',
  currentMin: '',
  remark: ''
})

const rules = {
  cabinetId: [{ required: true, message: '请选择配电柜名称', trigger: 'change' }],
  parentLine: [{ required: true, message: '请选择上级线路', trigger: 'change' }],
  controlType: [{ required: true, message: '请选择控制类型', trigger: 'change' }],
  code: [{ required: true, message: '请输入线路编号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入线路名称', trigger: 'blur' }],
  phaseType: [{ required: true, message: '请选择单三相', trigger: 'change' }]
}

const filteredCabinets = computed(() => {
  if (!cabinetSearch.value) return cabinets.value
  return cabinets.value.filter(c => c.name.includes(cabinetSearch.value) || c.code.includes(cabinetSearch.value))
})

const filteredLines = computed(() => {
  if (!selectedCabinet.value) return lines.value
  return lines.value.filter(l => l.cabinetId === selectedCabinet.value.id)
})

const selectCabinet = (cabinet) => {
  selectedCabinet.value = cabinet
}

const resetForm = () => {
  Object.assign(form, {
    cabinetId: '',
    parentLine: '',
    controlType: '',
    code: '',
    name: '',
    phaseType: '',
    refCurrent: '',
    ratedPower: '',
    currentMax: '',
    currentMin: '',
    remark: ''
  })
}

const editLine = (row) => {
  isEdit.value = true
  Object.assign(form, row)
  showAddDialog.value = true
}

const submitForm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      if (isEdit.value) {
        const index = lines.value.findIndex(l => l.id === form.id)
        if (index > -1) {
          lines.value[index] = { ...lines.value[index], ...form }
        }
        ElMessage.success('修改成功')
      } else {
        const newId = Math.max(...lines.value.map(l => l.id), 0) + 1
        lines.value.push({
          id: newId,
          ...form,
          lampCount: 0
        })
        ElMessage.success('新增成功')
      }
      showAddDialog.value = false
      isEdit.value = false
      resetForm()
    }
  })
}

const handleFileChange = (file, fileList) => {
  importForm.fileList = fileList
}

const handleDownloadTemplate = () => {
  const templateContent = `配电柜名称,上级线路,控制类型,线路编号,线路名称,单三相,参考电流(A),额定功率,电流上限值(A),电流下限值(A),备注
先导路1号配电柜,,breaker,AL01,断路器1,单相,10,500,15,5,测试线路1
先导路1号配电柜,main1,contactor,AL02,接触器1,三相,20,1000,30,10,测试线路2`
  
  const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', '线路信息导入模板.csv')
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  ElMessage.success('模板下载成功')
}

const handleImport = () => {
  if (importForm.fileList.length === 0) {
    ElMessage.warning('请先选择要导入的文件')
    return
  }
  
  const mockData = [
    { id: Date.now(), cabinetId: 1, name: '批量导入线路1', code: 'IMPORT001', lampCount: 0, parentLine: '', controlType: 'breaker', phaseType: 'single', refCurrent: '10', ratedPower: '500', currentMax: '15', currentMin: '5', remark: '批量导入' },
    { id: Date.now() + 1, cabinetId: 1, name: '批量导入线路2', code: 'IMPORT002', lampCount: 0, parentLine: 'main1', controlType: 'contactor', phaseType: 'three', refCurrent: '20', ratedPower: '1000', currentMax: '30', currentMin: '10', remark: '批量导入' }
  ]

  if (importForm.mode === 'add') {
    lines.value = [...lines.value, ...mockData]
  } else if (importForm.mode === 'overwrite') {
    lines.value = mockData
  }
  
  ElMessage.success(`成功导入 ${mockData.length} 条记录`)
  showImportDialog.value = false
  importForm.fileList = []
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该线路吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = lines.value.findIndex(l => l.id === row.id)
    if (index > -1) {
      lines.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
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
}

.main-content {
  display: flex;
  gap: 20px;
  overflow: hidden;
}

.left-panel {
  width: 200px;
  background: #fff;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  overflow: hidden;
}

.panel-header {
  padding: 12px 15px;
  border-bottom: 1px solid #e8e8e8;
  background: #fafafa;
}

.panel-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.search-box {
  padding: 10px;
}

.search-input {
  width: 100%;
}

.cabinet-list {
  flex: 1;
  overflow-y: auto;
  padding: 5px;
}

.cabinet-item {
  padding: 10px;
  margin-bottom: 5px;
  background: #fafafa;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid transparent;
}

.cabinet-item:hover {
  background: #f0f0f0;
}

.cabinet-item.active {
  background: #e6f7ff;
  border-color: #91d5ff;
}

.cabinet-name {
  font-size: 13px;
  color: #333;
  margin-bottom: 4px;
}

.cabinet-code {
  font-size: 11px;
  color: #999;
}

.right-panel {
  flex: 1;
  background: #fff;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-width: 0;
}

.line-table {
  flex: 1;
}

.import-tip {
  color: #666;
  font-size: 13px;
  line-height: 1.8;
}
</style>
