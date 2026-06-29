<template>
  <div class="page-container">
    <div class="page-header">
      <div class="header-actions">
        <el-button type="primary" @click="showAddDialog = true">新增分组</el-button>
      </div>
    </div>

    <div class="main-content">
      <div class="right-content">
        <div class="filter-bar">
          <el-select v-model="filterGroupType" placeholder="请选择分组类型" class="filter-select">
            <el-option label="灯具分组" value="灯具分组"></el-option>
            <el-option label="灯杆分组" value="灯杆分组"></el-option>
          </el-select>
          <el-input v-model="searchKeyword" placeholder="请输入分组名称查询" class="filter-input" />
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>

        <div class="table-wrapper">
          <el-table :data="groupData" border class="data-table">
            <el-table-column prop="no" label="No" width="50" align="center"></el-table-column>
            <el-table-column prop="groupType" label="分组类型" width="100"></el-table-column>
            <el-table-column prop="groupName" label="分组名称" width="150"></el-table-column>
            <el-table-column prop="deviceCount" label="关联设备数" width="100" align="center"></el-table-column>
            <el-table-column prop="remark" label="备注" width="150"></el-table-column>
            <el-table-column label="操作" width="180" align="center">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="handleEdit(row)">修改</el-button>
                <el-button type="info" size="small" @click="handleDetail(row)">详情</el-button>
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

    <!-- 详情对话框 -->
    <el-dialog title="分组详情" v-model="showDetailDialog" width="700px">
      <div v-if="selectedGroup" class="detail-content">
        <div class="detail-header">
          <span class="detail-label">分组类型:</span>
          <span>{{ selectedGroup.groupType }}</span>
          <span class="detail-label">分组名称:</span>
          <span>{{ selectedGroup.groupName }}</span>
          <span class="detail-label">备注信息:</span>
          <span>{{ selectedGroup.remark || '-' }}</span>
        </div>
        <el-table :data="selectedGroup.devices" border>
          <el-table-column prop="no" label="No" width="50" align="center"></el-table-column>
          <el-table-column prop="product" label="所属产品" width="120"></el-table-column>
          <el-table-column prop="imei" label="IMEI号" width="150"></el-table-column>
          <el-table-column prop="name" label="灯具名称" width="200"></el-table-column>
        </el-table>
      </div>
      <template #footer>
        <el-button @click="showDetailDialog = false">确定</el-button>
      </template>
    </el-dialog>

    <!-- 新增分组对话框 -->
    <el-dialog title="新增分组" v-model="showAddDialog" width="900px">
      <div class="add-dialog-content">
        <div class="add-form">
          <el-form :model="addForm" label-width="80px" inline>
            <el-form-item label="分组类型" required>
              <el-select v-model="addForm.groupType" placeholder="请选择分组类型" class="form-select">
                <el-option label="灯具分组" value="灯具分组"></el-option>
                <el-option label="灯杆分组" value="灯杆分组"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="分组名称" required>
              <el-input v-model="addForm.groupName" placeholder="请输入分组名称" class="form-input" />
            </el-form-item>
            <el-form-item label="所属层级">
              <el-select v-model="addForm.level" placeholder="请选择所属层级" class="form-select">
                <el-option label="长沙-岳麓区-先导路" value="长沙-岳麓区-先导路"></el-option>
                <el-option label="长沙-岳麓区-力唯中天1栋" value="长沙-岳麓区-力唯中天1栋"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="备注信息">
              <el-input v-model="addForm.remark" placeholder="请输入备注信息" class="form-input" />
            </el-form-item>
          </el-form>
        </div>

        <div class="device-selector">
          <div class="selector-panel">
            <div class="panel-header">
              <el-input v-model="leftSearch" placeholder="请输入编号或名称" class="selector-search" />
              <el-button type="primary" size="small" @click="searchLeft">查询</el-button>
              <el-button size="small" @click="resetLeft">重置</el-button>
            </div>
            <el-table :data="leftDevices" border @selection-change="handleLeftSelect">
              <el-table-column type="selection" width="50"></el-table-column>
              <el-table-column prop="no" label="No" width="50"></el-table-column>
              <el-table-column prop="code" label="编号" width="120"></el-table-column>
              <el-table-column prop="name" label="名称" width="150"></el-table-column>
            </el-table>
          </div>

          <div class="selector-buttons">
            <el-button type="primary" size="small" @click="moveToRight">></el-button>
            <el-button type="primary" size="small" @click="moveToLeft"><</el-button>
          </div>

          <div class="selector-panel">
            <div class="panel-header">
              <el-input v-model="rightSearch" placeholder="请输入编号或名称" class="selector-search" />
              <el-button type="primary" size="small" @click="searchRight">查询</el-button>
              <el-button size="small" @click="resetRight">重置</el-button>
            </div>
            <el-table :data="rightDevices" border @selection-change="handleRightSelect">
              <el-table-column type="selection" width="50"></el-table-column>
              <el-table-column prop="no" label="No" width="50"></el-table-column>
              <el-table-column prop="code" label="编号" width="120"></el-table-column>
              <el-table-column prop="name" label="名称" width="150"></el-table-column>
            </el-table>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAdd">确定</el-button>
      </template>
    </el-dialog>

    <!-- 编辑分组对话框 -->
    <el-dialog title="编辑分组" v-model="showEditDialog" width="900px">
      <div class="add-dialog-content">
        <div class="add-form">
          <el-form :model="editForm" label-width="80px" inline>
            <el-form-item label="分组类型" required>
              <el-select v-model="editForm.groupType" placeholder="请选择分组类型" class="form-select">
                <el-option label="灯具分组" value="灯具分组"></el-option>
                <el-option label="灯杆分组" value="灯杆分组"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="分组名称" required>
              <el-input v-model="editForm.groupName" placeholder="请输入分组名称" class="form-input" />
            </el-form-item>
            <el-form-item label="所属层级">
              <el-select v-model="editForm.level" placeholder="请选择所属层级" class="form-select">
                <el-option label="长沙-岳麓区-先导路" value="长沙-岳麓区-先导路"></el-option>
                <el-option label="长沙-岳麓区-力唯中天1栋" value="长沙-岳麓区-力唯中天1栋"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="备注信息">
              <el-input v-model="editForm.remark" placeholder="请输入备注信息" class="form-input" />
            </el-form-item>
          </el-form>
        </div>

        <div class="device-selector">
          <div class="selector-panel">
            <div class="panel-header">
              <el-input v-model="editLeftSearch" placeholder="请输入IMEI号或名称" class="selector-search" />
              <el-select v-model="editLeftFilter" placeholder="请选择主辅路" class="selector-select">
                <el-option label="全部" value=""></el-option>
                <el-option label="主路" value="主路"></el-option>
                <el-option label="辅路" value="辅路"></el-option>
              </el-select>
              <el-button type="primary" size="small" @click="searchEditLeft">查询</el-button>
              <el-button size="small" @click="resetEditLeft">重置</el-button>
            </div>
            <el-table :data="editLeftDevices" border @selection-change="handleEditLeftSelect">
              <el-table-column type="selection" width="50"></el-table-column>
              <el-table-column prop="no" label="No" width="50"></el-table-column>
              <el-table-column prop="product" label="所属产品" width="100"></el-table-column>
              <el-table-column prop="imei" label="IMEI号" width="150"></el-table-column>
              <el-table-column prop="name" label="灯具名称" width="150"></el-table-column>
            </el-table>
          </div>

          <div class="selector-buttons">
            <el-button type="primary" size="small" @click="editMoveToRight">></el-button>
            <el-button type="primary" size="small" @click="editMoveToLeft"><</el-button>
          </div>

          <div class="selector-panel">
            <div class="panel-header">
              <el-input v-model="editRightSearch" placeholder="请输入IMEI号或名称" class="selector-search" />
              <el-select v-model="editRightFilter" placeholder="请选择主辅路" class="selector-select">
                <el-option label="全部" value=""></el-option>
                <el-option label="主路" value="主路"></el-option>
                <el-option label="辅路" value="辅路"></el-option>
              </el-select>
              <el-button type="primary" size="small" @click="searchEditRight">查询</el-button>
              <el-button size="small" @click="resetEditRight">重置</el-button>
            </div>
            <el-table :data="editRightDevices" border @selection-change="handleEditRightSelect">
              <el-table-column type="selection" width="50"></el-table-column>
              <el-table-column prop="no" label="No" width="50"></el-table-column>
              <el-table-column prop="product" label="所属产品" width="100"></el-table-column>
              <el-table-column prop="imei" label="IMEI号" width="150"></el-table-column>
              <el-table-column prop="name" label="灯具名称" width="150"></el-table-column>
            </el-table>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="handleUpdate">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const currentPage = ref(1)
const pageSize = ref(15)
const total = ref(2)
const searchKeyword = ref('')
const filterGroupType = ref('')
const showDetailDialog = ref(false)
const showAddDialog = ref(false)
const showEditDialog = ref(false)
const selectedGroup = ref(null)
const editingGroup = ref(null)

const leftSearch = ref('')
const rightSearch = ref('')
const editLeftSearch = ref('')
const editRightSearch = ref('')
const editLeftFilter = ref('')
const editRightFilter = ref('')

const leftDevices = ref([
  { no: 1, code: '美人广场新1', name: '美人广场新1' },
  { no: 2, code: 'ZS06', name: '灯具展示06' },
  { no: 3, code: 'ZS05', name: '灯具展示05' },
  { no: 4, code: 'ZS04', name: '灯具展示04' },
  { no: 5, code: 'ZS03', name: '灯具展示03' },
  { no: 6, code: 'ZS02', name: '灯具展示02' },
  { no: 7, code: 'ZS01', name: '灯具展示01' },
  { no: 8, code: 'X001', name: '彩云街路灯' },
  { no: 9, code: 'T001', name: '太阳能测试' },
  { no: 10, code: 'GYZ0036', name: '光亚展灯杆' }
])

const rightDevices = ref([])
const selectedLeft = ref([])
const selectedRight = ref([])

const editLeftDevices = ref([
  { no: 1, product: '电信CAT1', imei: '862715067560391', name: '光亚展灯具' },
  { no: 2, product: '电信CAT1', imei: '863123069184162', name: '1号楼-极简07' },
  { no: 3, product: '电信CAT1', imei: '863123069133946', name: '宿舍楼02' },
  { no: 4, product: '电信CAT1', imei: '863123069031165', name: '3号楼-极简13' },
  { no: 5, product: '电信CAT1', imei: '863123069267413', name: '食堂-极简18辅路' },
  { no: 6, product: '电信CAT1', imei: '863123069265714', name: '食堂-极简18' },
  { no: 7, product: '电信CAT1', imei: '863123069277032', name: '3号楼-极简14' },
  { no: 8, product: '电信CAT1', imei: '863123069201446', name: '食堂-极简17' },
  { no: 9, product: '电信CAT1', imei: '863123069081624', name: '宿舍楼01' },
  { no: 10, product: '电信CAT1', imei: '863123069146013', name: '宿舍楼03' }
])

const editRightDevices = ref([
  { no: 1, product: '电信CAT1', imei: '864076062016600', name: 'Z08灯头' },
  { no: 2, product: '电信CAT1', imei: '864076062087494', name: 'Z05灯头' },
  { no: 3, product: '电信CAT1', imei: '864076062016808', name: 'Z10灯头' }
])

const editSelectedLeft = ref([])
const editSelectedRight = ref([])

const addForm = ref({
  groupType: '',
  groupName: '',
  level: '',
  remark: ''
})

const editForm = ref({
  groupType: '',
  groupName: '',
  level: '',
  remark: ''
})

const groupData = ref([
  { 
    id: 1, 
    no: 1, 
    groupType: '灯具分组', 
    groupName: '展厅3个路灯', 
    deviceCount: 3, 
    remark: '-',
    devices: [
      { no: 1, product: '电信CAT1', imei: '864076062016600', name: 'Z08灯头' },
      { no: 2, product: '电信CAT1', imei: '864076062016808', name: 'Z10灯头' },
      { no: 3, product: '电信CAT1', imei: '864076062087494', name: 'Z05灯头' }
    ]
  },
  { 
    id: 2, 
    no: 2, 
    groupType: '灯具分组', 
    groupName: '演示箱', 
    deviceCount: 3, 
    remark: '-',
    devices: []
  }
])

const handleSearch = () => {
  ElMessage.success('查询成功')
}

const handleReset = () => {
  searchKeyword.value = ''
  filterGroupType.value = ''
  currentPage.value = 1
}

const handleDetail = (row) => {
  selectedGroup.value = row
  showDetailDialog.value = true
}

const handleEdit = (row) => {
  editingGroup.value = row
  editForm.value = {
    groupType: row.groupType,
    groupName: row.groupName,
    level: row.level || '',
    remark: row.remark || ''
  }
  showEditDialog.value = true
}

const handleUpdate = () => {
  if (!editForm.value.groupType) {
    ElMessage.warning('请选择分组类型')
    return
  }
  if (!editForm.value.groupName) {
    ElMessage.warning('请输入分组名称')
    return
  }

  const index = groupData.value.findIndex(item => item.id === editingGroup.value.id)
  if (index !== -1) {
    groupData.value[index] = {
      ...groupData.value[index],
      groupType: editForm.value.groupType,
      groupName: editForm.value.groupName,
      level: editForm.value.level,
      remark: editForm.value.remark,
      deviceCount: editRightDevices.value.length
    }
  }

  showEditDialog.value = false
  ElMessage.success('更新分组成功')
}

const handleDelete = (row) => {
  ElMessageBox.confirm(
    '确定要删除这个分组吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = groupData.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      groupData.value.splice(index, 1)
      total.value--
    }
    ElMessage.success('删除分组成功')
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const handleLeftSelect = (val) => {
  selectedLeft.value = val
}

const handleRightSelect = (val) => {
  selectedRight.value = val
}

const moveToRight = () => {
  selectedLeft.value.forEach(item => {
    const exists = rightDevices.value.find(d => d.code === item.code)
    if (!exists) {
      rightDevices.value.push(item)
    }
  })
  selectedLeft.value.forEach(item => {
    const index = leftDevices.value.findIndex(d => d.code === item.code)
    if (index !== -1) {
      leftDevices.value.splice(index, 1)
    }
  })
  selectedLeft.value = []
}

const moveToLeft = () => {
  selectedRight.value.forEach(item => {
    const exists = leftDevices.value.find(d => d.code === item.code)
    if (!exists) {
      leftDevices.value.push(item)
    }
  })
  selectedRight.value.forEach(item => {
    const index = rightDevices.value.findIndex(d => d.code === item.code)
    if (index !== -1) {
      rightDevices.value.splice(index, 1)
    }
  })
  selectedRight.value = []
}

const searchLeft = () => {
  ElMessage.success('查询成功')
}

const resetLeft = () => {
  leftSearch.value = ''
}

const searchRight = () => {
  ElMessage.success('查询成功')
}

const resetRight = () => {
  rightSearch.value = ''
}

const handleAdd = () => {
  if (!addForm.value.groupType) {
    ElMessage.warning('请选择分组类型')
    return
  }
  if (!addForm.value.groupName) {
    ElMessage.warning('请输入分组名称')
    return
  }

  const newGroup = {
    id: Date.now(),
    no: groupData.value.length + 1,
    groupType: addForm.value.groupType,
    groupName: addForm.value.groupName,
    level: addForm.value.level,
    deviceCount: rightDevices.value.length,
    remark: addForm.value.remark || '-',
    devices: rightDevices.value.map((d, i) => ({
      no: i + 1,
      product: '电信CAT1',
      imei: d.code,
      name: d.name
    }))
  }

  groupData.value.push(newGroup)
  total.value++

  addForm.value = {
    groupType: '',
    groupName: '',
    level: '',
    remark: ''
  }
  rightDevices.value = []

  showAddDialog.value = false
  ElMessage.success('新增分组成功')
}

const handleEditLeftSelect = (val) => {
  editSelectedLeft.value = val
}

const handleEditRightSelect = (val) => {
  editSelectedRight.value = val
}

const editMoveToRight = () => {
  editSelectedLeft.value.forEach(item => {
    const exists = editRightDevices.value.find(d => d.imei === item.imei)
    if (!exists) {
      editRightDevices.value.push(item)
    }
  })
  editSelectedLeft.value.forEach(item => {
    const index = editLeftDevices.value.findIndex(d => d.imei === item.imei)
    if (index !== -1) {
      editLeftDevices.value.splice(index, 1)
    }
  })
  editSelectedLeft.value = []
}

const editMoveToLeft = () => {
  editSelectedRight.value.forEach(item => {
    const exists = editLeftDevices.value.find(d => d.imei === item.imei)
    if (!exists) {
      editLeftDevices.value.push(item)
    }
  })
  editSelectedRight.value.forEach(item => {
    const index = editRightDevices.value.findIndex(d => d.imei === item.imei)
    if (index !== -1) {
      editRightDevices.value.splice(index, 1)
    }
  })
  editSelectedRight.value = []
}

const searchEditLeft = () => {
  ElMessage.success('查询成功')
}

const resetEditLeft = () => {
  editLeftSearch.value = ''
  editLeftFilter.value = ''
}

const searchEditRight = () => {
  ElMessage.success('查询成功')
}

const resetEditRight = () => {
  editRightSearch.value = ''
  editRightFilter.value = ''
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
}

.main-content {
  display: flex;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.right-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow-y: auto;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
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
  overflow: auto;
}

.data-table {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.data-table :deep(.el-table) {
  --el-table-header-text-color: #606266;
  --el-table-row-hover-bg-color: #f5f7fa;
  --el-table-row-bg-color: #fff;
  --el-table-border-color: #ebeef5;
}

.data-table :deep(.el-table__header-wrapper) {
  background: #fafafa;
}

.data-table :deep(.el-table__header-row) {
  background: #fafafa;
}

.data-table :deep(.el-table__header-cell) {
  font-weight: 600;
  color: #606266;
  background: #fafafa;
  border-bottom: 2px solid #e8e8e8;
}

.data-table :deep(.el-table__body-wrapper) {
  background: #fff;
}

.data-table :deep(.el-table__row) {
  transition: background-color 0.2s ease;
}

.data-table :deep(.el-table__row:hover) {
  background: #f5f7fa;
}

.data-table :deep(.el-table__cell) {
  padding: 12px 8px;
  border-bottom: 1px solid #ebeef5;
  color: #606266;
}

.data-table :deep(.el-button--primary) {
  background: #409eff;
  border-color: #409eff;
}

.data-table :deep(.el-button--info) {
  background: #909399;
  border-color: #909399;
}

.data-table :deep(.el-button--danger) {
  background: #f56c6c;
  border-color: #f56c6c;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e8e8e8;
}

.detail-content {
  padding: 10px;
}

.detail-header {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e8e8e8;
}

.detail-label {
  color: #606266;
  font-weight: bold;
}

.add-dialog-content {
  padding: 10px;
}

.add-form {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e8e8e8;
}

.form-select {
  width: 150px;
}

.form-input {
  width: 200px;
}

.device-selector {
  display: flex;
  gap: 15px;
  height: 400px;
}

.selector-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-bottom: 1px solid #e8e8e8;
}

.selector-search {
  flex: 1;
}

.selector-select {
  width: 120px;
}

.selector-panel :deep(.el-table) {
  flex: 1;
}

.selector-buttons {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
}
</style>
