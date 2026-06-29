<template>
  <div class="page-container">
    <div class="page-header">
      <div class="header-right">
        <el-button type="primary" @click="handleAdd">新增</el-button>
        <el-button type="danger" :disabled="selectedRows.length === 0" @click="handleBatchUnbind">解绑</el-button>
      </div>
    </div>

    <div class="content-area">
      <el-tabs v-model="activeTab" class="main-tabs">
        <el-tab-pane label="灯控绑定" name="lamp">
          <div class="filter-bar">
            <el-input v-model="searchKeyword" placeholder="请输入名称或编号查询" class="filter-input">
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </div>

          <el-table :data="filteredData" border class="data-table" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="50"></el-table-column>
            <el-table-column prop="no" label="No" width="60" align="center"></el-table-column>
            <el-table-column prop="centralControlName" label="集控名称" min-width="200"></el-table-column>
            <el-table-column prop="centralControlNo" label="集控编号" width="200"></el-table-column>
            <el-table-column prop="bindCount" label="关联灯控数" width="150" align="center"></el-table-column>
            <el-table-column label="操作" width="200" align="center" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="handleEdit(row)">修改</el-button>
                <el-button type="danger" size="small" @click="handleUnbind(row)">解绑</el-button>
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
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 新增/编辑灯控绑定对话框 -->
    <el-dialog :title="dialogTitle" v-model="showDialog" width="900px" :close-on-click-modal="false">
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="100px">
        <el-form-item label="所属集控" prop="centralControl">
          <el-select v-model="formData.centralControl" placeholder="请选择" style="width: 100%">
            <el-option label="先导路集控" value="ZTJK"></el-option>
            <el-option label="测试128M" value="CS128M"></el-option>
            <el-option label="力唯中天1栋集控1" value="XDLJK1"></el-option>
            <el-option label="力唯中天1栋集控2" value="XDLJK2"></el-option>
          </el-select>
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="11">
            <div class="table-select">
              <div class="select-header">
                <el-input v-model="leftSearch" placeholder="请输入IMEI号或名称" style="width: 200px; margin-right: 10px;"></el-input>
                <el-button type="primary" size="small" @click="handleLeftSearch">查询</el-button>
                <el-button size="small" @click="handleLeftReset">重置</el-button>
              </div>
              <el-table :data="leftTableData" border style="margin-top: 10px;" @selection-change="handleLeftSelection" size="small">
                <el-table-column type="selection" width="50"></el-table-column>
                <el-table-column prop="no" label="No" width="50" align="center"></el-table-column>
                <el-table-column prop="imei" label="IMEI号" min-width="120"></el-table-column>
                <el-table-column prop="lampControlName" label="灯控名称" min-width="120"></el-table-column>
                <el-table-column prop="lampPoleName" label="灯杆名称" min-width="120"></el-table-column>
              </el-table>
              <div class="empty-tip" v-if="leftTableData.length === 0">暂无数据</div>
            </div>
          </el-col>
          <el-col :span="2" class="transfer-buttons">
            <el-button type="primary" circle @click="handleMoveRight" :disabled="leftSelected.length === 0">
              <el-icon><ArrowRight /></el-icon>
            </el-button>
            <el-button type="primary" circle @click="handleMoveLeft" :disabled="rightSelected.length === 0" style="margin-top: 10px;">
              <el-icon><ArrowLeft /></el-icon>
            </el-button>
          </el-col>
          <el-col :span="11">
            <div class="table-select">
              <div class="select-header">
                <el-input v-model="rightSearch" placeholder="请输入IMEI号或名称" style="width: 200px; margin-right: 10px;" disabled></el-input>
                <el-button type="primary" size="small" disabled>查询</el-button>
                <el-button size="small" disabled>重置</el-button>
              </div>
              <el-table :data="selectedLampControls" border style="margin-top: 10px;" @selection-change="handleRightSelection" size="small">
                <el-table-column type="selection" width="50"></el-table-column>
                <el-table-column prop="no" label="No" width="50" align="center"></el-table-column>
                <el-table-column prop="imei" label="IMEI号" min-width="120"></el-table-column>
                <el-table-column prop="lampControlName" label="灯控名称" min-width="120"></el-table-column>
                <el-table-column prop="lampPoleName" label="灯杆名称" min-width="120"></el-table-column>
              </el-table>
              <div class="empty-tip" v-if="selectedLampControls.length === 0">暂无数据</div>
            </div>
          </el-col>
        </el-row>
      </el-form>
      
      <template #footer>
        <el-button @click="handleDialogClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Search, ArrowRight, ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const activeTab = ref('lamp')
const currentPage = ref(1)
const pageSize = ref(15)
const total = ref(1)
const searchKeyword = ref('')
const showDialog = ref(false)
const isEdit = ref(false)
const leftSearch = ref('')
const rightSearch = ref('')
const selectedRows = ref([])
const leftSelected = ref([])
const rightSelected = ref([])
const formRef = ref(null)

const formData = ref({
  centralControl: ''
})

const formRules = {
  centralControl: [{ required: true, message: '请选择所属集控', trigger: 'change' }]
}

const dialogTitle = computed(() => isEdit.value ? '编辑灯控绑定' : '新增灯控绑定')

const bindData = ref([
  {
    no: 1,
    centralControlName: '先导路集控',
    centralControlNo: 'ZTJK',
    bindCount: 2,
    lampControls: [
      { no: 1, imei: '867892010000001', lampControlName: '灯控1', lampPoleName: '灯杆001' },
      { no: 2, imei: '867892010000002', lampControlName: '灯控2', lampPoleName: '灯杆002' }
    ]
  }
])

const selectedLampControls = ref([])

const allLampControls = ref([
  { no: 1, imei: '867892010000001', lampControlName: '灯控1', lampPoleName: '灯杆001' },
  { no: 2, imei: '867892010000002', lampControlName: '灯控2', lampPoleName: '灯杆002' },
  { no: 3, imei: '867892010000003', lampControlName: '灯控3', lampPoleName: '灯杆003' },
  { no: 4, imei: '867892010000004', lampControlName: '灯控4', lampPoleName: '灯杆004' },
  { no: 5, imei: '867892010000005', lampControlName: '灯控5', lampPoleName: '灯杆005' },
  { no: 6, imei: '867892010000006', lampControlName: '灯控6', lampPoleName: '灯杆006' }
])

const filteredData = computed(() => {
  if (!searchKeyword.value) return bindData.value
  return bindData.value.filter(item => 
    item.centralControlName.includes(searchKeyword.value) || 
    item.centralControlNo.includes(searchKeyword.value)
  )
})

const leftTableData = computed(() => {
  let result = allLampControls.value.filter(lc => 
    !selectedLampControls.value.some(slc => slc.imei === lc.imei)
  )
  if (leftSearch.value) {
    result = result.filter(lc => 
      lc.imei.includes(leftSearch.value) || 
      lc.lampControlName.includes(leftSearch.value) ||
      lc.lampPoleName.includes(leftSearch.value)
    )
  }
  return result
})

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const handleLeftSelection = (selection) => {
  leftSelected.value = selection
}

const handleRightSelection = (selection) => {
  rightSelected.value = selection
}

const handleSearch = () => {
  ElMessage.success('查询成功')
}

const handleReset = () => {
  searchKeyword.value = ''
  ElMessage.info('已重置')
}

const handleAdd = () => {
  isEdit.value = false
  selectedLampControls.value = []
  formData.value = {
    centralControl: ''
  }
  showDialog.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  formData.value = {
    centralControl: row.centralControlNo
  }
  selectedLampControls.value = [...row.lampControls]
  showDialog.value = true
}

const handleUnbind = (row) => {
  ElMessageBox.confirm(
    `确定要对集控【${row.centralControlName}】执行"解绑"操作吗？`,
    '解绑确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = bindData.value.findIndex(item => item.no === row.no)
    if (index !== -1) {
      bindData.value[index].bindCount = 0
      bindData.value[index].lampControls = []
    }
    ElMessage.success('解绑成功')
  }).catch(() => {})
}

const handleBatchUnbind = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要解绑的集控')
    return
  }
  ElMessageBox.confirm(
    `确定要对选中的 ${selectedRows.value.length} 个集控执行"解绑"操作吗？`,
    '批量解绑确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    selectedRows.value.forEach(row => {
      const index = bindData.value.findIndex(item => item.no === row.no)
      if (index !== -1) {
        bindData.value[index].bindCount = 0
        bindData.value[index].lampControls = []
      }
    })
    selectedRows.value = []
    ElMessage.success('批量解绑成功')
  }).catch(() => {})
}

const handleMoveRight = () => {
  if (leftSelected.value.length === 0) {
    ElMessage.warning('请选择要添加的灯控')
    return
  }
  leftSelected.value.forEach(lc => {
    if (!selectedLampControls.value.some(slc => slc.imei === lc.imei)) {
      selectedLampControls.value.push(lc)
    }
  })
  leftSelected.value = []
  ElMessage.success('已添加选中的灯控')
}

const handleMoveLeft = () => {
  if (rightSelected.value.length === 0) {
    ElMessage.warning('请选择要移除的灯控')
    return
  }
  const imeis = rightSelected.value.map(lc => lc.imei)
  selectedLampControls.value = selectedLampControls.value.filter(lc => !imeis.includes(lc.imei))
  rightSelected.value = []
  ElMessage.success('已移除选中的灯控')
}

const handleLeftSearch = () => {
  ElMessage.success('查询成功')
}

const handleLeftReset = () => {
  leftSearch.value = ''
  ElMessage.info('已重置')
}

const handleDialogClose = () => {
  showDialog.value = false
  formRef.value?.resetFields()
}

const handleSubmit = () => {
  formRef.value?.validate((valid) => {
    if (valid) {
      if (isEdit.value) {
        const index = bindData.value.findIndex(item => item.centralControlNo === formData.value.centralControl)
        if (index !== -1) {
          bindData.value[index].bindCount = selectedLampControls.value.length
          bindData.value[index].lampControls = [...selectedLampControls.value]
        }
        ElMessage.success('修改成功')
      } else {
        const centralControlMap = {
          'ZTJK': '先导路集控',
          'CS128M': '测试128M',
          'XDLJK1': '力唯中天1栋集控1',
          'XDLJK2': '力唯中天1栋集控2'
        }
        const newNo = bindData.value.length > 0 ? Math.max(...bindData.value.map(item => item.no)) + 1 : 1
        bindData.value.push({
          no: newNo,
          centralControlName: centralControlMap[formData.value.centralControl] || formData.value.centralControl,
          centralControlNo: formData.value.centralControl,
          bindCount: selectedLampControls.value.length,
          lampControls: [...selectedLampControls.value]
        })
        total.value++
        ElMessage.success('新增成功')
      }
      showDialog.value = false
      formRef.value?.resetFields()
    }
  })
}
</script>

<style scoped>
.page-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 15px;
}

.header-right {
  display: flex;
  gap: 10px;
}

.content-area {
  flex: 1;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 15px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.main-tabs :deep(.el-tabs__content) {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.main-tabs :deep(.el-tab-pane) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
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

.table-select {
  display: flex;
  flex-direction: column;
}

.select-header {
  display: flex;
  align-items: center;
}

.transfer-buttons {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.empty-tip {
  text-align: center;
  padding: 40px;
  color: #909399;
}
</style>
