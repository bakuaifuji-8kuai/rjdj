<template>
  <div class="page-container">
    <div class="page-header">
      <div class="header-right">
        <el-button type="primary" @click="handleAdd">新增</el-button>
        <el-button type="danger" :disabled="selectedRows.length === 0" @click="handleBatchDelete">删除</el-button>
      </div>
    </div>

    <div class="content-area">
      <div class="filter-bar">
        <el-input v-model="searchKeyword" placeholder="请输入分组名称查询" class="filter-input">
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <el-table :data="filteredGroups" border class="group-table" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50"></el-table-column>
        <el-table-column prop="no" label="No" width="60" align="center"></el-table-column>
        <el-table-column prop="groupName" label="分组名称" min-width="200"></el-table-column>
        <el-table-column prop="deviceCount" label="关联设备数" width="150" align="center"></el-table-column>
        <el-table-column prop="creator" label="创建人" width="150"></el-table-column>
        <el-table-column prop="remark" label="备注" min-width="150"></el-table-column>
        <el-table-column label="操作" width="300" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleBatchOn(row)">全开</el-button>
            <el-button type="primary" size="small" @click="handleBatchOff(row)">全关</el-button>
            <el-button type="warning" size="small" @click="handleEdit(row)">修改</el-button>
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

    <!-- 新增/编辑分组对话框 -->
    <el-dialog :title="dialogTitle" v-model="showDialog" width="900px" :close-on-click-modal="false">
      <el-form :model="groupForm" :rules="groupRules" ref="groupFormRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="分组名称" prop="groupName">
              <el-input v-model="groupForm.groupName" placeholder="请输入分组名称"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="所属层级" prop="level">
              <el-select v-model="groupForm.level" placeholder="请选择所属层级" style="width: 100%">
                <el-option label="长沙" value="1"></el-option>
                <el-option label="岳麓区" value="2"></el-option>
                <el-option label="先导路" value="3"></el-option>
                <el-option label="先导路1栋" value="4"></el-option>
                <el-option label="先导路2栋" value="5"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="分组备注" prop="remark">
              <el-input v-model="groupForm.remark" placeholder="请输入分组备注"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="circuit-select">
              <div class="select-header">
                <span class="select-title">可选回路</span>
                <el-input v-model="leftSearch" placeholder="请输入回路名称" style="width: 180px; margin-right: 10px;"></el-input>
                <el-button type="primary" size="small" @click="handleLeftSearch">查询</el-button>
                <el-button size="small" @click="handleLeftReset">重置</el-button>
              </div>
              <el-table :data="leftCircuits" border style="margin-top: 10px;" @selection-change="handleLeftSelection" size="small">
                <el-table-column type="selection" width="50"></el-table-column>
                <el-table-column prop="no" label="No" width="50" align="center"></el-table-column>
                <el-table-column prop="circuitName" label="回路名称" min-width="120"></el-table-column>
                <el-table-column prop="centralControl" label="所属集控" min-width="100"></el-table-column>
              </el-table>
              <div class="pagination-small">
                <el-pagination
                  :current-page="leftPage"
                  :page-size="10"
                  :total="leftTotal"
                  layout="prev, pager, next"
                  @current-change="handleLeftPageChange"
                ></el-pagination>
              </div>
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
          <el-col :span="10">
            <div class="circuit-select">
              <div class="select-header">
                <span class="select-title">已选回路</span>
                <el-input v-model="rightSearch" placeholder="请输入回路名称" style="width: 180px; margin-right: 10px;" disabled></el-input>
              </div>
              <el-table :data="selectedCircuits" border style="margin-top: 10px;" @selection-change="handleRightSelection" size="small">
                <el-table-column type="selection" width="50"></el-table-column>
                <el-table-column prop="no" label="No" width="50" align="center"></el-table-column>
                <el-table-column prop="circuitName" label="回路名称" min-width="120"></el-table-column>
                <el-table-column prop="centralControl" label="所属集控" min-width="100"></el-table-column>
              </el-table>
              <div class="empty-tip" v-if="selectedCircuits.length === 0">
                暂无数据
              </div>
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

const currentPage = ref(1)
const pageSize = ref(15)
const total = ref(2)
const searchKeyword = ref('')
const showDialog = ref(false)
const isEdit = ref(false)
const leftPage = ref(1)
const leftTotal = ref(40)
const leftSearch = ref('')
const rightSearch = ref('')
const selectedRows = ref([])
const leftSelected = ref([])
const rightSelected = ref([])
const groupFormRef = ref(null)

const groupForm = ref({
  groupName: '',
  level: '',
  remark: ''
})

const groupRules = {
  groupName: [{ required: true, message: '请输入分组名称', trigger: 'blur' }],
  level: [{ required: true, message: '请选择所属层级', trigger: 'change' }]
}

const dialogTitle = computed(() => isEdit.value ? '编辑' : '新增')

const circuitGroups = ref([
  {
    no: 1,
    groupName: '隔一亮一组',
    deviceCount: 8,
    creator: 'test08',
    remark: '',
    circuits: [
      { no: 1, circuitName: '内置回路1', centralControl: '测试128M' },
      { no: 2, circuitName: '内置回路2', centralControl: '测试128M' },
      { no: 3, circuitName: '内置回路3', centralControl: '测试128M' },
      { no: 4, circuitName: '内置回路4', centralControl: '测试128M' },
      { no: 5, circuitName: '内置回路5', centralControl: '测试128M' },
      { no: 6, circuitName: '内置回路6', centralControl: '测试128M' },
      { no: 7, circuitName: '回路1', centralControl: '测试128M' },
      { no: 8, circuitName: '回路2', centralControl: '测试128M' }
    ]
  },
  {
    no: 2,
    groupName: '隔一亮一B组',
    deviceCount: 0,
    creator: 'admin',
    remark: '不可更改',
    circuits: []
  }
])

const selectedCircuits = ref([])

const allCircuits = ref([
  { no: 1, circuitName: '内置回路1', centralControl: '测试128M' },
  { no: 2, circuitName: '内置回路2', centralControl: '测试128M' },
  { no: 3, circuitName: '内置回路3', centralControl: '测试128M' },
  { no: 4, circuitName: '内置回路4', centralControl: '测试128M' },
  { no: 5, circuitName: '内置回路5', centralControl: '测试128M' },
  { no: 6, circuitName: '内置回路6', centralControl: '测试128M' },
  { no: 7, circuitName: '回路1', centralControl: '测试128M' },
  { no: 8, circuitName: '回路2', centralControl: '测试128M' },
  { no: 9, circuitName: '回路3', centralControl: '先导路集控1' },
  { no: 10, circuitName: '回路4', centralControl: '先导路集控1' },
  { no: 11, circuitName: '回路5', centralControl: '先导路集控2' },
  { no: 12, circuitName: '回路6', centralControl: '先导路集控2' }
])

const leftCircuits = computed(() => {
  const start = (leftPage.value - 1) * 10
  const end = start + 10
  let result = allCircuits.value.filter(c => 
    !selectedCircuits.value.some(sc => sc.no === c.no)
  )
  if (leftSearch.value) {
    result = result.filter(c => 
      c.circuitName.includes(leftSearch.value) || 
      c.centralControl.includes(leftSearch.value)
    )
  }
  return result.slice(start, end)
})

const filteredGroups = computed(() => {
  if (!searchKeyword.value) return circuitGroups.value
  return circuitGroups.value.filter(g => g.groupName.includes(searchKeyword.value))
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
  selectedCircuits.value = []
  groupForm.value = {
    groupName: '',
    level: '',
    remark: ''
  }
  showDialog.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  groupForm.value = {
    groupName: row.groupName,
    level: '1',
    remark: row.remark
  }
  selectedCircuits.value = [...row.circuits]
  showDialog.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除分组【${row.groupName}】吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    circuitGroups.value = circuitGroups.value.filter(g => g.no !== row.no)
    total.value--
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要删除的分组')
    return
  }
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedRows.value.length} 个分组吗？`,
    '批量删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const ids = selectedRows.value.map(r => r.no)
    circuitGroups.value = circuitGroups.value.filter(g => !ids.includes(g.no))
    total.value -= selectedRows.value.length
    selectedRows.value = []
    ElMessage.success('批量删除成功')
  }).catch(() => {})
}

const handleBatchOn = (row) => {
  ElMessageBox.confirm(
    `确定要对分组【${row.groupName}】内的所有回路执行"全开"操作吗？`,
    '批量控制',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success(`分组【${row.groupName}】内的 ${row.deviceCount} 个回路已全部开启`)
  }).catch(() => {})
}

const handleBatchOff = (row) => {
  ElMessageBox.confirm(
    `确定要对分组【${row.groupName}】内的所有回路执行"全关"操作吗？`,
    '批量控制',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success(`分组【${row.groupName}】内的 ${row.deviceCount} 个回路已全部关闭`)
  }).catch(() => {})
}

const handleMoveRight = () => {
  if (leftSelected.value.length === 0) {
    ElMessage.warning('请选择要添加的回路')
    return
  }
  leftSelected.value.forEach(circuit => {
    if (!selectedCircuits.value.some(c => c.no === circuit.no)) {
      selectedCircuits.value.push(circuit)
    }
  })
  leftSelected.value = []
  ElMessage.success('已添加选中的回路')
}

const handleMoveLeft = () => {
  if (rightSelected.value.length === 0) {
    ElMessage.warning('请选择要移除的回路')
    return
  }
  const ids = rightSelected.value.map(c => c.no)
  selectedCircuits.value = selectedCircuits.value.filter(c => !ids.includes(c.no))
  rightSelected.value = []
  ElMessage.success('已移除选中的回路')
}

const handleLeftSearch = () => {
  leftPage.value = 1
  ElMessage.success('查询成功')
}

const handleLeftReset = () => {
  leftSearch.value = ''
  leftPage.value = 1
  ElMessage.info('已重置')
}

const handleLeftPageChange = (page) => {
  leftPage.value = page
}

const handleDialogClose = () => {
  showDialog.value = false
  groupFormRef.value?.resetFields()
}

const handleSubmit = () => {
  groupFormRef.value?.validate((valid) => {
    if (valid) {
      if (isEdit.value) {
        const index = circuitGroups.value.findIndex(g => g.no === groupForm.value.no)
        if (index !== -1) {
          circuitGroups.value[index].groupName = groupForm.value.groupName
          circuitGroups.value[index].remark = groupForm.value.remark
          circuitGroups.value[index].deviceCount = selectedCircuits.value.length
          circuitGroups.value[index].circuits = [...selectedCircuits.value]
        }
        ElMessage.success('修改成功')
      } else {
        const newNo = circuitGroups.value.length > 0 ? Math.max(...circuitGroups.value.map(g => g.no)) + 1 : 1
        circuitGroups.value.push({
          no: newNo,
          groupName: groupForm.value.groupName,
          deviceCount: selectedCircuits.value.length,
          creator: '管理员',
          remark: groupForm.value.remark,
          circuits: [...selectedCircuits.value]
        })
        total.value++
        ElMessage.success('新增成功')
      }
      showDialog.value = false
      groupFormRef.value?.resetFields()
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

.filter-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.filter-input {
  width: 200px;
}

.group-table {
  flex: 1;
  overflow: hidden;
}

.pagination-wrapper {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}

.circuit-select {
  display: flex;
  flex-direction: column;
}

.select-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.select-title {
  font-weight: 500;
  color: #303133;
  min-width: 60px;
}

.transfer-buttons {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.pagination-small {
  margin-top: 10px;
  display: flex;
  justify-content: center;
}

.empty-tip {
  text-align: center;
  padding: 40px;
  color: #909399;
}
</style>
