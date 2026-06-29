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
            <el-button type="primary" @click="handleAdd">新增</el-button>
            <el-button type="danger" :disabled="selectedRows.length === 0" @click="handleBatchDelete">删除</el-button>
          </div>
        </div>

        <div class="filter-bar">
          <el-select v-model="filterProduct" placeholder="请选择所属产品" class="filter-select">
            <el-option label="EXC-CAT1" value="EXC-CAT1" />
            <el-option label="电信CAT1" value="电信CAT1" />
          </el-select>
          <el-input v-model="filterKeyword" placeholder="请输入名称或编号查" class="filter-input" />
          <el-select v-model="filterNetworkStatus" placeholder="请选择网络状态" class="filter-select">
            <el-option label="在线" value="online" />
            <el-option label="离线" value="offline" />
          </el-select>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>

        <div class="table-wrapper">
          <el-table :data="filteredData" border class="data-table" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="50"></el-table-column>
            <el-table-column prop="no" label="No" width="50" align="center"></el-table-column>
            <el-table-column prop="product" label="所属产品" min-width="100"></el-table-column>
            <el-table-column prop="deviceNo" label="设备编号" min-width="120" sortable></el-table-column>
            <el-table-column prop="name" label="设备名称" min-width="120" sortable></el-table-column>
            <el-table-column prop="lampPost" label="所属灯杆" min-width="100"></el-table-column>
            <el-table-column prop="networkStatus" label="网络状态" width="90" align="center">
              <template #default="{ row }">
                <el-tag :type="row.networkStatus === 'online' ? 'success' : 'danger'" size="small">
                  {{ row.networkStatus === 'online' ? '在线' : '离线' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="lastOnline" label="最后在线时间" min-width="160" sortable></el-table-column>
            <el-table-column label="操作" width="120" align="center">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="handleDetail(row)">详情</el-button>
                <el-button type="text" size="small" @click="handleEdit(row)">修改</el-button>
                <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="pagination-bar">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            layout="prev, pager, next, jumper, ->, total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>

    <el-dialog :title="dialogTitle" v-model="showAddDialog" width="600px">
      <el-form :model="formData" label-width="100px" class="form-container">
        <el-form-item label="*所属产品" prop="product">
          <el-select v-model="formData.product" placeholder="请选择所属产品" class="form-select">
            <el-option label="EXC-CAT1" value="EXC-CAT1" />
            <el-option label="电信CAT1" value="电信CAT1" />
          </el-select>
        </el-form-item>
        <el-form-item label="*设备编号" prop="deviceNo">
          <el-input v-model="formData.deviceNo" placeholder="请输入设备编号" />
        </el-form-item>
        <el-form-item label="*设备名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入设备名称" />
        </el-form-item>
        <el-form-item label="设备型号" prop="model">
          <el-input v-model="formData.model" placeholder="请输入设备型号" />
        </el-form-item>
        <el-form-item label="*IP地址" prop="ipAddress">
          <el-input v-model="formData.ipAddress" placeholder="请输入IP地址" />
        </el-form-item>
        <el-form-item label="*端口号" prop="port">
          <el-input v-model="formData.port" placeholder="请输入端口号" />
        </el-form-item>
        <el-form-item label="*所属层级" prop="level">
          <el-select v-model="formData.level" placeholder="请选择所属层级" class="form-select">
            <el-option label="长沙" value="长沙" />
            <el-option label="岳麓区" value="岳麓区" />
            <el-option label="先导路" value="先导路" />
            <el-option label="力唯中天1栋" value="力唯中天1栋" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属灯杆" prop="lampPost">
          <el-select v-model="formData.lampPost" placeholder="请选择" class="form-select">
            <el-option label="灯具展示01" value="灯具展示01" />
            <el-option label="灯具展示02" value="灯具展示02" />
            <el-option label="灯具展示03" value="灯具展示03" />
          </el-select>
        </el-form-item>
        <el-form-item label="设备经度" prop="longitude">
          <el-input v-model="formData.longitude" placeholder="请输入">
            <template #suffix>
              <el-icon><MapLocation /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="设备纬度" prop="latitude">
          <el-input v-model="formData.latitude" placeholder="请输入">
            <template #suffix>
              <el-icon><MapLocation /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="*通道数" prop="channels">
          <el-select v-model="formData.channels" placeholder="请选择通道数" class="form-select">
            <el-option label="1" value="1" />
            <el-option label="2" value="2" />
            <el-option label="4" value="4" />
            <el-option label="8" value="8" />
          </el-select>
        </el-form-item>
        <el-form-item label="*用户名" prop="username">
          <el-input v-model="formData.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="*密码" prop="password">
          <el-input v-model="formData.password" type="password" placeholder="请输入密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog title="详情" v-model="showDetailDialog" width="500px">
      <el-descriptions :column="2" :data="detailData" border>
        <el-descriptions-item label="所属产品">{{ detailData.product }}</el-descriptions-item>
        <el-descriptions-item label="设备编号">{{ detailData.deviceNo }}</el-descriptions-item>
        <el-descriptions-item label="设备名称">{{ detailData.name }}</el-descriptions-item>
        <el-descriptions-item label="设备型号">{{ detailData.model }}</el-descriptions-item>
        <el-descriptions-item label="IP地址">{{ detailData.ipAddress }}</el-descriptions-item>
        <el-descriptions-item label="端口号">{{ detailData.port }}</el-descriptions-item>
        <el-descriptions-item label="所属层级">{{ detailData.level }}</el-descriptions-item>
        <el-descriptions-item label="所属灯杆">{{ detailData.lampPost }}</el-descriptions-item>
        <el-descriptions-item label="设备经度">{{ detailData.longitude }}</el-descriptions-item>
        <el-descriptions-item label="设备纬度">{{ detailData.latitude }}</el-descriptions-item>
        <el-descriptions-item label="通道数">{{ detailData.channels }}</el-descriptions-item>
        <el-descriptions-item label="网络状态">
          <el-tag :type="detailData.networkStatus === 'online' ? 'success' : 'danger'" size="small">
            {{ detailData.networkStatus === 'online' ? '在线' : '离线' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="最后在线时间">{{ detailData.lastOnline }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Search, MapLocation } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const treeSearch = ref('')
const filterProduct = ref('')
const filterKeyword = ref('')
const filterNetworkStatus = ref('')
const currentPage = ref(1)
const pageSize = ref(15)
const selectedRows = ref([])
const showAddDialog = ref(false)
const showDetailDialog = ref(false)
const dialogTitle = ref('新增')
const editingId = ref(null)

const formData = ref({
  product: '',
  deviceNo: '',
  name: '',
  model: '',
  ipAddress: '',
  port: '',
  level: '',
  lampPost: '',
  longitude: '',
  latitude: '',
  channels: '',
  username: '',
  password: ''
})

const detailData = ref({})

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

const defaultProps = {
  children: 'children',
  label: 'label'
}

const mockData = ref([
  { no: 1, product: 'EXC-CAT1', deviceNo: 'DVRC001', name: '主入口摄像机', lampPost: '灯具展示01', networkStatus: 'online', lastOnline: '2025-06-15 09:30:00' },
  { no: 2, product: '电信CAT1', deviceNo: 'DVRC002', name: '停车场摄像机', lampPost: '灯具展示02', networkStatus: 'online', lastOnline: '2025-06-15 09:28:00' },
  { no: 3, product: 'EXC-CAT1', deviceNo: 'DVRC003', name: '办公楼摄像机', lampPost: '灯具展示03', networkStatus: 'offline', lastOnline: '2025-06-14 18:00:00' },
  { no: 4, product: '电信CAT1', deviceNo: 'DVRC004', name: '园区摄像机', lampPost: '灯具展示01', networkStatus: 'online', lastOnline: '2025-06-15 09:25:00' },
  { no: 5, product: 'EXC-CAT1', deviceNo: 'DVRC005', name: '仓库摄像机', lampPost: '灯具展示02', networkStatus: 'offline', lastOnline: '2025-06-13 10:00:00' }
])

const total = computed(() => mockData.value.length)

const filteredData = computed(() => {
  let data = [...mockData.value]
  if (filterProduct.value) {
    data = data.filter(item => item.product === filterProduct.value)
  }
  if (filterKeyword.value) {
    const keyword = filterKeyword.value.toLowerCase()
    data = data.filter(item => item.name.toLowerCase().includes(keyword) || item.deviceNo.toLowerCase().includes(keyword))
  }
  if (filterNetworkStatus.value) {
    data = data.filter(item => item.networkStatus === filterNetworkStatus.value)
  }
  return data.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value)
})

const handleSearch = () => {
  currentPage.value = 1
}

const handleReset = () => {
  filterProduct.value = ''
  filterKeyword.value = ''
  filterNetworkStatus.value = ''
  currentPage.value = 1
}

const handleSelectionChange = (val) => {
  selectedRows.value = val
}

const handleAdd = () => {
  dialogTitle.value = '新增'
  editingId.value = null
  showAddDialog.value = true
  formData.value = {
    product: '',
    deviceNo: '',
    name: '',
    model: '',
    ipAddress: '',
    port: '',
    level: '',
    lampPost: '',
    longitude: '',
    latitude: '',
    channels: '',
    username: '',
    password: ''
  }
}

const handleEdit = (row) => {
  dialogTitle.value = '修改'
  editingId.value = row.deviceNo
  showAddDialog.value = true
  formData.value = { ...row }
}

const handleDetail = (row) => {
  showDetailDialog.value = true
  detailData.value = { ...row }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该设备吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    const index = mockData.value.findIndex(item => item.deviceNo === row.deviceNo)
    if (index !== -1) {
      mockData.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  } catch {
    ElMessage.info('已取消删除')
  }
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 个设备吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    selectedRows.value.forEach(row => {
      const index = mockData.value.findIndex(item => item.deviceNo === row.deviceNo)
      if (index !== -1) {
        mockData.value.splice(index, 1)
      }
    })
    selectedRows.value = []
    ElMessage.success('删除成功')
  } catch {
    ElMessage.info('已取消删除')
  }
}

const handleConfirm = () => {
  if (!formData.value.product || !formData.value.deviceNo || !formData.value.name || !formData.value.ipAddress || !formData.value.port || !formData.value.level || !formData.value.channels || !formData.value.username || !formData.value.password) {
    alert('请填写所有必填字段')
    return
  }
  if (editingId.value) {
    // 修改操作
    const index = mockData.value.findIndex(item => item.deviceNo === editingId.value)
    if (index !== -1) {
      mockData.value[index] = {
        ...mockData.value[index],
        product: formData.value.product,
        deviceNo: formData.value.deviceNo,
        name: formData.value.name,
        lampPost: formData.value.lampPost || '-',
        lastOnline: new Date().toLocaleString()
      }
    }
  } else {
    // 新增操作
    const newRecord = {
      no: mockData.value.length + 1,
      product: formData.value.product,
      deviceNo: formData.value.deviceNo,
      name: formData.value.name,
      lampPost: formData.value.lampPost || '-',
      networkStatus: 'online',
      lastOnline: new Date().toLocaleString()
    }
    mockData.value.push(newRecord)
  }
  showAddDialog.value = false
}

const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}
</script>

<style scoped>
.page-container {
  display: flex;
  height: calc(100vh - 60px);
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.left-sidebar {
  width: 200px;
  background: #fafafa;
  border-right: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 12px;
  border-bottom: 1px solid #e8e8e8;
}

.sidebar-search {
  width: 100%;
}

.right-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 15px;
  overflow: hidden;
}

.page-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e8e8e8;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.filter-bar {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  flex-wrap: wrap;
  align-items: center;
}

.filter-select {
  width: 180px;
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
}

.pagination-bar {
  padding-top: 15px;
  display: flex;
  justify-content: flex-end;
}

.form-container {
  padding: 10px;
}

.form-select {
  width: 100%;
}
</style>