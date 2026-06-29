<template>
  <div class="tunnel-list-container">
    <div class="page-header">
      <h2>隧道列表</h2>
      <el-button type="primary" @click="handleAdd">新增隧道</el-button>
    </div>
    
    <div class="search-bar">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="隧道名称">
          <el-input v-model="searchForm.name" placeholder="请输入隧道名称" clearable></el-input>
        </el-form-item>
        <el-form-item label="所属区域">
          <el-select v-model="searchForm.area" placeholder="请选择区域" clearable>
            <el-option label="岳麓区" value="岳麓区"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table :data="tunnelList" border stripe :height="400">
      <el-table-column prop="id" label="ID" width="60"></el-table-column>
      <el-table-column prop="name" label="隧道名称"></el-table-column>
      <el-table-column prop="length" label="隧道长度(米)"></el-table-column>
      <el-table-column prop="lanes" label="车道数"></el-table-column>
      <el-table-column prop="area" label="所属区域"></el-table-column>
      <el-table-column prop="level" label="所属层级"></el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === '正常' ? 'success' : 'warning'">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)">修改</el-button>
          <el-button size="small" type="primary" @click="handleDetail(scope.row)">详情</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </div>

    <el-dialog title="新增隧道" v-model="addDialogVisible" width="700px" :close-on-click-modal="false">
      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane label="基本信息" name="basic">
          <el-form :model="addForm.basic" label-width="120px" class="tunnel-form">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="*所属层级">
                  <el-select v-model="addForm.basic.level" placeholder="请选择">
                    <el-option label="长沙-岳麓区" value="长沙-岳麓区"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="*隧道名称">
                  <el-input v-model="addForm.basic.name" placeholder="请输入隧道名称"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="*隧道长度">
                  <el-input v-model="addForm.basic.length" placeholder="请输入隧道长度" style="width: 150px;">
                    <template #append>m</template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="竣工日期">
                  <el-date-picker v-model="addForm.basic.completionDate" type="date" placeholder="请选择竣工日期"></el-date-picker>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="中心点经度">
                  <el-input v-model="addForm.basic.longitude" placeholder="请输入中心点经度"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="中心点纬度">
                  <el-input v-model="addForm.basic.latitude" placeholder="请输入中心点纬度"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="地图坐标">
              <el-input v-model="addForm.basic.mapCoord" placeholder="请输入地图坐标"></el-input>
            </el-form-item>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="负责单位">
                  <el-input v-model="addForm.basic.responsibleUnit" placeholder="请输入负责单位"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="负责人员">
                  <el-input v-model="addForm.basic.responsiblePerson" placeholder="请输入负责人员"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="联系方式">
              <el-input v-model="addForm.basic.contact" placeholder="请输入联系方式"></el-input>
            </el-form-item>
            <el-form-item label="隧道地址">
              <el-input v-model="addForm.basic.address" placeholder="请输入隧道地址"></el-input>
            </el-form-item>
            <el-form-item label="简介">
              <el-input type="textarea" v-model="addForm.basic.description" placeholder="请输入简介" :rows="3"></el-input>
            </el-form-item>
            <el-form-item label="隧道图片">
              <el-input v-model="addForm.basic.image" placeholder="请上传隧道图片"></el-input>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="隧道洞信息" name="tunnel">
          <el-form :model="addForm.tunnel" label-width="120px" class="tunnel-form">
            <el-form-item label="*隧道洞类型">
              <el-radio-group v-model="addForm.tunnel.type">
                <el-radio label="单道">单道</el-radio>
                <el-radio label="双道">双道</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="*隧道洞名称">
                  <el-input v-model="addForm.tunnel.name" placeholder="请输入隧道洞名称"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="*隧道洞长度">
                  <el-input v-model="addForm.tunnel.length" placeholder="请输入隧道洞长度" style="width: 150px;">
                    <template #append>m</template>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="*隧道洞排序">
                  <el-select v-model="addForm.tunnel.sortOrder" placeholder="请选择">
                    <el-option label="上" value="上"></el-option>
                    <el-option label="下" value="下"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="车道数">
                  <el-input type="number" v-model="addForm.tunnel.lanes" placeholder="请输入车道数" style="width: 100px;"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="起始桩号">
                  <el-input v-model="addForm.tunnel.startPile" placeholder="请输入起始桩号"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="结束桩号">
                  <el-input v-model="addForm.tunnel.endPile" placeholder="请输入结束桩号"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="强电设备">
              <el-input v-model="addForm.tunnel.electricDevice" placeholder="请输入强电设备">
                <template #append>
                  <el-button size="small" type="primary">选择设备</el-button>
                </template>
              </el-input>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="分段信息" name="section">
          <div class="section-header">
            <span>展厅隧道洞</span>
            <el-button type="primary" size="small" @click="handleAddSection">添加</el-button>
          </div>
          <el-table :data="addForm.sections" border>
            <el-table-column prop="name" label="分段名称"></el-table-column>
            <el-table-column prop="type" label="分段类型">
              <template #default="scope">
                <el-select v-model="scope.row.type" style="width: 100px;">
                  <el-option label="入口段" value="入口段"></el-option>
                  <el-option label="基本段" value="基本段"></el-option>
                  <el-option label="出口段" value="出口段"></el-option>
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="sortOrder" label="分段排序">
              <template #default="scope">
                <el-input type="number" v-model="scope.row.sortOrder" style="width: 80px;"></el-input>
              </template>
            </el-table-column>
            <el-table-column prop="length" label="本段长度(米)">
              <template #default="scope">
                <el-input type="number" v-model="scope.row.length" style="width: 100px;"></el-input>
              </template>
            </el-table-column>
            <el-table-column prop="entrance" label="出入口">
              <template #default="scope">
                <el-select v-model="scope.row.entrance" style="width: 80px;">
                  <el-option label="入口" value="入口"></el-option>
                  <el-option label="出口" value="出口"></el-option>
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="distance" label="距离(米)">
              <template #default="scope">
                <el-input type="number" v-model="scope.row.distance" style="width: 100px;"></el-input>
              </template>
            </el-table-column>
            <el-table-column prop="sensor" label="关联传感器">
              <template #default="scope">
                <el-input v-model="scope.row.sensor" placeholder="请输入传感器"></el-input>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="scope">
                <el-button type="text" size="small" @click="handleEditSection(scope.row)">修改</el-button>
                <el-button type="text" size="small" style="color: #f56c6c;" @click="handleDeleteSection(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const searchForm = reactive({
  name: '',
  area: ''
})

const tunnelList = ref([
  {
    id: 1,
    name: '先导路',
    length: 2800,
    lanes: 4,
    area: '岳麓区',
    level: '长沙-岳麓区-先导路',
    status: '正常',
    createTime: '2024-01-15 10:30:00'
  },
  {
    id: 2,
    name: '麓景路隧道',
    length: 1500,
    lanes: 2,
    area: '岳麓区',
    level: '长沙-岳麓区-麓景路隧道',
    status: '正常',
    createTime: '2024-02-20 14:20:00'
  },
  {
    id: 3,
    name: '西二环隧道',
    length: 3200,
    lanes: 6,
    area: '岳麓区',
    level: '长沙-岳麓区-西二环隧道',
    status: '维护中',
    createTime: '2024-03-10 09:15:00'
  }
])

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(tunnelList.value.length)

const addDialogVisible = ref(false)
const activeTab = ref('basic')

const addForm = reactive({
  basic: {
    level: '长沙-岳麓区',
    name: '',
    length: '',
    completionDate: '',
    longitude: '',
    latitude: '',
    mapCoord: '',
    responsibleUnit: '',
    responsiblePerson: '',
    contact: '',
    address: '',
    description: '',
    image: ''
  },
  tunnel: {
    type: '单道',
    name: '',
    length: '',
    sortOrder: '上',
    lanes: 2,
    startPile: '',
    endPile: '',
    electricDevice: ''
  },
  sections: [
    { id: 1, name: '入口段', type: '入口段', sortOrder: 1, length: 5, entrance: '入口', distance: 0, sensor: '展厅光照' },
    { id: 2, name: '基本段', type: '基本段', sortOrder: 2, length: 10, entrance: '入口', distance: 5, sensor: '' },
    { id: 3, name: '出口段', type: '出口段', sortOrder: 3, length: 5, entrance: '出口', distance: 0, sensor: '展厅光照' }
  ]
})

const handleSearch = () => {
  total.value = tunnelList.value.length
}

const handleReset = () => {
  searchForm.name = ''
  searchForm.area = ''
  handleSearch()
}

const handleAdd = () => {
  activeTab.value = 'basic'
  addForm.basic = {
    level: '长沙-岳麓区',
    name: '',
    length: '',
    completionDate: '',
    longitude: '',
    latitude: '',
    mapCoord: '',
    responsibleUnit: '',
    responsiblePerson: '',
    contact: '',
    address: '',
    description: '',
    image: ''
  }
  addForm.tunnel = {
    type: '单道',
    name: '',
    length: '',
    sortOrder: '上',
    lanes: 2,
    startPile: '',
    endPile: '',
    electricDevice: ''
  }
  addForm.sections = [
    { id: 1, name: '入口段', type: '入口段', sortOrder: 1, length: 5, entrance: '入口', distance: 0, sensor: '' },
    { id: 2, name: '基本段', type: '基本段', sortOrder: 2, length: 10, entrance: '入口', distance: 5, sensor: '' },
    { id: 3, name: '出口段', type: '出口段', sortOrder: 3, length: 5, entrance: '出口', distance: 0, sensor: '' }
  ]
  addDialogVisible.value = true
}

const handleSave = () => {
  if (!addForm.basic.name) {
    ElMessage.warning('请输入隧道名称')
    return
  }
  if (!addForm.basic.length) {
    ElMessage.warning('请输入隧道长度')
    return
  }
  
  const tunnelName = addForm.basic.name
  addForm.basic.level = `${addForm.basic.level}-${tunnelName}`
  
  tunnelList.value.unshift({
    id: Date.now(),
    name: tunnelName,
    length: addForm.basic.length,
    lanes: addForm.tunnel.lanes,
    area: '岳麓区',
    level: addForm.basic.level,
    status: '正常',
    createTime: new Date().toLocaleString()
  })
  total.value = tunnelList.value.length
  addDialogVisible.value = false
  ElMessage.success('新增成功')
}

const handleEdit = (row) => {
  activeTab.value = 'basic'
  addForm.basic = {
    level: row.level ? row.level.substring(0, row.level.lastIndexOf('-')) : '长沙-岳麓区',
    name: row.name,
    length: row.length,
    completionDate: '',
    longitude: '',
    latitude: '',
    mapCoord: '',
    responsibleUnit: '',
    responsiblePerson: '',
    contact: '',
    address: '',
    description: '',
    image: ''
  }
  addForm.tunnel = {
    type: '单道',
    name: '',
    length: '',
    sortOrder: '上',
    lanes: row.lanes || 2,
    startPile: '',
    endPile: '',
    electricDevice: ''
  }
  addForm.sections = [
    { id: 1, name: '入口段', type: '入口段', sortOrder: 1, length: 5, entrance: '入口', distance: 0, sensor: '' },
    { id: 2, name: '基本段', type: '基本段', sortOrder: 2, length: 10, entrance: '入口', distance: 5, sensor: '' },
    { id: 3, name: '出口段', type: '出口段', sortOrder: 3, length: 5, entrance: '出口', distance: 0, sensor: '' }
  ]
  addDialogVisible.value = true
}

const handleDetail = (row) => {
  window.location.href = `#/tunnel/detail/${row.id}`
}

const handleDelete = (row) => {
  const index = tunnelList.value.findIndex(item => item.id === row.id)
  if (index > -1) {
    tunnelList.value.splice(index, 1)
    total.value = tunnelList.value.length
    ElMessage.success('删除成功')
  }
}

const handleAddSection = () => {
  addForm.sections.push({
    id: Date.now(),
    name: '',
    type: '基本段',
    sortOrder: addForm.sections.length + 1,
    length: '',
    entrance: '入口',
    distance: '',
    sensor: ''
  })
}

const handleEditSection = (row) => {
  ElMessage.info('编辑分段')
}

const handleDeleteSection = (row) => {
  const index = addForm.sections.findIndex(item => item.id === row.id)
  if (index > -1) {
    addForm.sections.splice(index, 1)
  }
}

const handleSizeChange = (val) => {
  pageSize.value = val
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}
</script>

<style scoped>
.tunnel-list-container {
  background: #fff;
  border-radius: 8px;
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
  font-size: 18px;
  font-weight: 600;
}

.search-bar {
  margin-bottom: 20px;
}

.search-form {
  gap: 15px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.tunnel-form {
  padding: 10px 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  font-weight: 600;
  color: #409eff;
}
</style>