<template>
  <div class="page-container">
    <div class="page-header">
      <div class="header-right">
        <el-button type="primary" @click="handleAdd">新增</el-button>
        <el-button>批量导入</el-button>
        <el-button>批量导出</el-button>
        <el-button type="danger" :disabled="selectedRows.length === 0" @click="handleBatchDelete">删除</el-button>
        <el-button class="map-btn">地图</el-button>
      </div>
    </div>

    <div class="content-area">
      <div class="left-panel">
        <el-input v-model="treeSearch" placeholder="请输入层级名称" class="tree-search"></el-input>
        <el-input v-model="treeSearch2" placeholder="请输入层级名称" class="tree-search"></el-input>
        <el-tree
          :data="treeData"
          :props="treeProps"
          :default-expand-all="true"
          show-checkbox
          node-key="id"
          class="tree-component"
        ></el-tree>
      </div>

      <div class="right-panel">
        <div class="filter-bar">
          <el-input v-model="searchKeyword" placeholder="请输入名称进行查询" class="filter-input"></el-input>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>

        <el-table :data="lampPostData" border class="data-table" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50"></el-table-column>
          <el-table-column prop="no" label="No" width="60" align="center"></el-table-column>
          <el-table-column prop="lampPostName" label="灯杆名称" min-width="150"></el-table-column>
          <el-table-column prop="lampPostNo" label="灯杆编号" min-width="150"></el-table-column>
          <el-table-column prop="specification" label="规格(米)" width="120" align="center"></el-table-column>
          <el-table-column prop="mountedCount" label="挂载设备数" width="120" align="center"></el-table-column>
          <el-table-column label="操作" width="150" align="center" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="handleEdit(row)">修改</el-button>
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

    <el-dialog :title="dialogTitle" v-model="showDialog" width="900px">
      <el-form :model="formData" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="灯杆名称">
              <el-input v-model="formData.lampPostName"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="灯杆编号">
              <el-input v-model="formData.lampPostNo"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="灯杆规格">
              <el-input v-model="formData.specification"></el-input>
              <span style="margin-left: 5px;">米</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属层级">
              <el-select v-model="formData.level" style="width: 100%">
                <el-option label="长沙" value="1"></el-option>
                <el-option label="岳麓区" value="2"></el-option>
                <el-option label="先导路" value="3"></el-option>
                <el-option label="力唯中天1栋" value="4"></el-option>
                <el-option label="力唯中天2栋" value="5"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="灯杆经度">
              <el-input v-model="formData.longitude"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="灯杆纬度">
              <el-input v-model="formData.latitude"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const currentPage = ref(1)
const pageSize = ref(15)
const total = ref(50)
const searchKeyword = ref('')
const showDialog = ref(false)
const isEdit = ref(false)
const selectedRows = ref([])
const treeSearch = ref('')
const treeSearch2 = ref('')

const dialogTitle = ref('新增')

const treeProps = {
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
          {
            id: 3,
            label: '先导路',
            children: [
              { id: 4, label: '力唯中天1栋' },
              { id: 5, label: '力唯中天2栋' }
            ]
          }
        ]
      }
    ]
  }
])

const lampPostData = ref([
  { no: 1, lampPostName: '美人广场新1', lampPostNo: '美人广场新1', specification: 11, mountedCount: 0 },
  { no: 2, lampPostName: '灯具展示06', lampPostNo: 'ZS06', specification: 3, mountedCount: 3 },
  { no: 3, lampPostName: '灯具展示05', lampPostNo: 'ZS05', specification: 3, mountedCount: 4 },
  { no: 4, lampPostName: '灯具展示04', lampPostNo: 'ZS04', specification: 3, mountedCount: 4 },
  { no: 5, lampPostName: '灯具展示03', lampPostNo: 'ZS03', specification: 3, mountedCount: 4 },
  { no: 6, lampPostName: '灯具展示02', lampPostNo: 'ZS02', specification: 3, mountedCount: 4 },
  { no: 7, lampPostName: '灯具展示01', lampPostNo: 'ZS01', specification: 3, mountedCount: 4 },
  { no: 8, lampPostName: '彩云街路灯', lampPostNo: 'X001', specification: 0, mountedCount: 0 },
  { no: 9, lampPostName: '太阳能测试', lampPostNo: 'T001', specification: 0, mountedCount: 1 },
  { no: 10, lampPostName: '光亚展灯杆', lampPostNo: 'GYZ0036', specification: 10, mountedCount: 3 },
  { no: 11, lampPostName: 'Z08灯杆(左)', lampPostNo: 'ZT-Z08', specification: 3, mountedCount: 1 },
  { no: 12, lampPostName: 'Z05灯杆(中)', lampPostNo: 'ZT-Z05', specification: 3, mountedCount: 1 },
  { no: 13, lampPostName: 'Z10灯杆(右)', lampPostNo: 'ZT-Z10', specification: 3, mountedCount: 1 },
  { no: 14, lampPostName: '1号楼-极简05', lampPostNo: 'L05', specification: 6, mountedCount: 2 },
  { no: 15, lampPostName: '1号楼-极简06', lampPostNo: 'L06', specification: 6, mountedCount: 2 }
])

const formData = ref({
  lampPostName: '',
  lampPostNo: '',
  specification: '',
  level: '',
  longitude: '',
  latitude: ''
})

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const handleSearch = () => {
  ElMessage.success('查询成功')
}

const handleReset = () => {
  searchKeyword.value = ''
}

const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增'
  formData.value = {
    lampPostName: '',
    lampPostNo: '',
    specification: '',
    level: '',
    longitude: '',
    latitude: ''
  }
  showDialog.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑灯杆'
  formData.value = {
    lampPostName: row.lampPostName,
    lampPostNo: row.lampPostNo,
    specification: row.specification,
    level: '1',
    longitude: '',
    latitude: ''
  }
  showDialog.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除灯杆【${row.lampPostName}】吗？`,
    '删除确认',
    { type: 'warning' }
  ).then(() => {
    const index = lampPostData.value.findIndex(item => item.no === row.no)
    if (index !== -1) {
      lampPostData.value.splice(index, 1)
    }
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要删除的灯杆')
    return
  }
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedRows.value.length} 个灯杆吗？`,
    '批量删除确认',
    { type: 'warning' }
  ).then(() => {
    const nos = selectedRows.value.map(row => row.no)
    lampPostData.value = lampPostData.value.filter(item => !nos.includes(item.no))
    selectedRows.value = []
    ElMessage.success('批量删除成功')
  }).catch(() => {})
}

const handleSubmit = () => {
  if (isEdit.value) {
    const index = lampPostData.value.findIndex(item => item.lampPostNo === formData.value.lampPostNo)
    if (index !== -1) {
      lampPostData.value[index].lampPostName = formData.value.lampPostName
    }
    ElMessage.success('修改成功')
  } else {
    const newNo = lampPostData.value.length > 0 ? Math.max(...lampPostData.value.map(item => item.no)) + 1 : 1
    lampPostData.value.push({
      no: newNo,
      lampPostName: formData.value.lampPostName,
      lampPostNo: formData.value.lampPostNo,
      specification: formData.value.specification,
      mountedCount: 0
    })
    ElMessage.success('新增成功')
  }
  showDialog.value = false
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
  display: flex;
  gap: 20px;
  overflow: hidden;
}

.left-panel {
  width: 300px;
  background: #fff;
  border-radius: 4px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.tree-search {
  margin-bottom: 10px;
}

.tree-component {
  flex: 1;
  overflow-y: auto;
}

.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.filter-bar {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  padding: 15px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.filter-input {
  width: 250px;
}

.data-table {
  flex: 1;
  background: #fff;
  border-radius: 4px;
  overflow: auto;
}

.pagination-wrapper {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}
</style>