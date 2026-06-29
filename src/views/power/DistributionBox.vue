<template>
  <div class="page-container">
    <div class="main-content">
      <div class="left-sidebar">
        <div class="sidebar-header">
          <el-input
            v-model="searchText"
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
          :expand-on-click-node="false"
          @check-change="handleCheckChange"
        />
      </div>

      <div class="right-content">
        <div class="page-header">
          <div class="title">配电柜</div>
          <div class="header-actions">
            <el-button type="primary" @click="showAddDialog = true">
              <el-icon><Plus /></el-icon>
              新增
            </el-button>
            <el-button @click="refreshData">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
            <el-button type="danger" @click="batchDelete" :disabled="selectedRows.length === 0">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </div>
        </div>

        <div class="filter-bar">
          <el-input
            v-model="filters.search"
            placeholder="请输入配电柜名称或编号"
            class="filter-input"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-select v-model="filters.status" placeholder="请选择状态" class="filter-select" clearable>
            <el-option label="在线" value="online" />
            <el-option label="离线" value="offline" />
          </el-select>
          <el-select v-model="filters.health" placeholder="请选择健康状态" class="filter-select" clearable>
            <el-option label="正常" value="normal" />
            <el-option label="故障" value="fault" />
          </el-select>
          <el-button type="primary" @click="searchBoxes">查询</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </div>

        <el-table :data="filteredBoxes" border style="width: 100%;" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="45" />
          <el-table-column prop="no" label="序号" width="60" align="center" />
          <el-table-column prop="code" label="设备编号" width="120" />
          <el-table-column prop="name" label="设备名称" min-width="150" />
          <el-table-column prop="location" label="位置" min-width="150" />
          <el-table-column prop="status" label="在线状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.status === 'online' ? 'success' : 'danger'" size="small">
                {{ row.status === 'online' ? '在线' : '离线' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="health" label="健康状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.health === 'normal' ? 'success' : 'danger'" size="small">
                {{ row.health === 'normal' ? '正常' : '故障' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="temperature" label="温度(℃)" width="90" align="center" />
          <el-table-column prop="humidity" label="湿度(%)" width="90" align="center" />
          <el-table-column label="操作" width="280" fixed="right" align="center">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="viewDetail(row)">详情</el-button>
              <el-button type="warning" size="small" @click="editBox(row)">编辑</el-button>
              <el-button type="danger" size="small" @click="deleteBox(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 15, 20, 30]"
            layout="total, sizes, prev, pager, next, jumper"
          />
        </div>
      </div>
    </div>

    <el-dialog v-model="showAddDialog" :title="isEdit ? '编辑配电柜' : '新增配电柜'" width="700px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="配电柜编号" prop="code">
          <el-input v-model="form.code" placeholder="请输入配电柜编号" />
        </el-form-item>
        <el-form-item label="配电柜名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入配电柜名称" />
        </el-form-item>
        <el-form-item label="配电柜位置" prop="location">
          <el-input v-model="form.location" placeholder="请输入配电柜位置" />
        </el-form-item>
        <el-form-item label="配电柜经度" prop="longitude">
          <el-input v-model="form.longitude" placeholder="请输入配电柜经度" />
        </el-form-item>
        <el-form-item label="配电柜纬度" prop="latitude">
          <el-input v-model="form.latitude" placeholder="请输入配电柜纬度" />
        </el-form-item>
        <el-form-item label="所属层级" prop="hierarchy">
          <el-select v-model="form.hierarchy" placeholder="请选择所属层级" style="width: 100%;">
            <el-option label="长沙-岳麓区-先导路" value="xiandao" />
            <el-option label="长沙-岳麓区-力唯中天1栋" value="liwei" />
          </el-select>
        </el-form-item>
        <el-form-item label="容量(kVA)" prop="capacity">
          <el-input v-model="form.capacity" placeholder="请输入配电柜容量" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showDetailDialog" title="配电柜详情" width="900px">
      <div v-if="currentBox" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="设备编号">{{ currentBox.code }}</el-descriptions-item>
          <el-descriptions-item label="设备名称">{{ currentBox.name }}</el-descriptions-item>
          <el-descriptions-item label="位置">{{ currentBox.location }}</el-descriptions-item>
          <el-descriptions-item label="在线状态">
            <el-tag :type="currentBox.status === 'online' ? 'success' : 'danger'" size="small">
              {{ currentBox.status === 'online' ? '在线' : '离线' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="健康状态">
            <el-tag :type="currentBox.health === 'normal' ? 'success' : 'danger'" size="small">
              {{ currentBox.health === 'normal' ? '正常' : '故障' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="温度">{{ currentBox.temperature }}℃</el-descriptions-item>
          <el-descriptions-item label="湿度">{{ currentBox.humidity }}%</el-descriptions-item>
        </el-descriptions>

        <el-tabs v-model="detailTab" class="detail-tabs">
          <el-tab-pane label="供电参数" name="power">
            <el-descriptions :column="3" border>
              <el-descriptions-item label="A相电压">220V</el-descriptions-item>
              <el-descriptions-item label="B相电压">221V</el-descriptions-item>
              <el-descriptions-item label="C相电压">219V</el-descriptions-item>
              <el-descriptions-item label="A相电流">15.2A</el-descriptions-item>
              <el-descriptions-item label="B相电流">14.8A</el-descriptions-item>
              <el-descriptions-item label="C相电流">15.5A</el-descriptions-item>
              <el-descriptions-item label="有功功率">10.2kW</el-descriptions-item>
              <el-descriptions-item label="无功功率">2.1kVar</el-descriptions-item>
              <el-descriptions-item label="功率因数">0.95</el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>
          <el-tab-pane label="关联线路" name="circuits">
            <el-table :data="relatedCircuits" size="small" border>
              <el-table-column prop="no" label="序号" width="60" align="center" />
              <el-table-column prop="name" label="线路名称" />
              <el-table-column prop="status" label="状态" width="80" align="center">
                <template #default="{ row }">
                  <el-tag :type="row.status === 'on' ? 'success' : 'warning'" size="small">
                    {{ row.status === 'on' ? '合闸' : '分闸' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="power" label="功率(kW)" width="100" align="center" />
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="环境监测" name="environment">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="门锁状态">
                <el-tag :type="currentBox.lockStatus === 'locked' ? 'success' : 'warning'" size="small">
                  {{ currentBox.lockStatus === 'locked' ? '锁定' : '解锁' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="门磁状态">
                <el-tag :type="currentBox.magneticStatus === 'closed' ? 'success' : 'warning'" size="small">
                  {{ currentBox.magneticStatus === 'closed' ? '关闭' : '打开' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="烟感状态">
                <el-tag :type="currentBox.smokeStatus === 'normal' ? 'success' : 'danger'" size="small">
                  {{ currentBox.smokeStatus === 'normal' ? '正常' : '报警' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="水浸状态">
                <el-tag :type="currentBox.waterStatus === 'dry' ? 'success' : 'danger'" size="small">
                  {{ currentBox.waterStatus === 'dry' ? '干燥' : '水浸' }}
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>
        </el-tabs>
      </div>
      <template #footer>
        <el-button @click="showDetailDialog = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Search, Plus, Refresh, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const searchText = ref('')
const showAddDialog = ref(false)
const showDetailDialog = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const detailTab = ref('power')
const currentPage = ref(1)
const pageSize = ref(15)
const total = ref(9)
const selectedRows = ref([])
const currentBox = ref(null)

const filters = reactive({
  search: '',
  status: '',
  health: ''
})

const form = reactive({
  code: '',
  name: '',
  location: '',
  longitude: '',
  latitude: '',
  hierarchy: '',
  capacity: '',
  description: ''
})

const rules = {
  code: [{ required: true, message: '请输入配电柜编号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入配电柜名称', trigger: 'blur' }],
  location: [{ required: true, message: '请输入配电柜位置', trigger: 'blur' }]
}

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
          { id: 111, label: '先导路' },
          { id: 112, label: '力唯中天1栋' }
        ]
      }
    ]
  }
])

const boxes = ref([
  { id: 1, no: 1, code: 'PDG-XDL-001', name: '先导路1号配电柜', location: '长沙-岳麓区-先导路入口段', status: 'online', health: 'normal', temperature: 28, humidity: 65, lockStatus: 'locked', magneticStatus: 'closed', smokeStatus: 'normal', waterStatus: 'dry' },
  { id: 2, no: 2, code: 'PDG-XDL-002', name: '先导路2号配电柜', location: '长沙-岳麓区-先导路中段', status: 'online', health: 'normal', temperature: 30, humidity: 60, lockStatus: 'locked', magneticStatus: 'closed', smokeStatus: 'normal', waterStatus: 'dry' },
  { id: 3, no: 3, code: 'PDG-LW-001', name: '力唯中天1栋配电柜', location: '长沙-岳麓区-力唯中天1栋', status: 'online', health: 'normal', temperature: 25, humidity: 70, lockStatus: 'locked', magneticStatus: 'closed', smokeStatus: 'normal', waterStatus: 'dry' },
  { id: 4, no: 4, code: 'PDG-XDL-003', name: '先导路应急配电柜', location: '长沙-岳麓区-先导路', status: 'offline', health: 'fault', temperature: '-', humidity: '-', lockStatus: 'locked', magneticStatus: 'closed', smokeStatus: 'normal', waterStatus: 'dry' }
])

const relatedCircuits = ref([
  { no: 1, name: '主照明回路1', status: 'on', power: 3.5 },
  { no: 2, name: '主照明回路2', status: 'on', power: 2.8 },
  { no: 3, name: '景观照明回路', status: 'off', power: 0 },
  { no: 4, name: '应急照明回路', status: 'on', power: 1.2 }
])

const filteredBoxes = computed(() => {
  let result = boxes.value
  if (filters.search) {
    result = result.filter(b => b.code.includes(filters.search) || b.name.includes(filters.search))
  }
  if (filters.status) {
    result = result.filter(b => b.status === filters.status)
  }
  if (filters.health) {
    result = result.filter(b => b.health === filters.health)
  }
  return result
})

const handleCheckChange = (data, checked) => {
  console.log('checked:', data, checked)
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const searchBoxes = () => {
  currentPage.value = 1
  ElMessage.success('查询成功')
}

const resetFilters = () => {
  Object.assign(filters, { search: '', status: '', health: '' })
  currentPage.value = 1
}

const refreshData = () => {
  ElMessage.success('数据已刷新')
}

const viewDetail = (row) => {
  currentBox.value = row
  detailTab.value = 'power'
  showDetailDialog.value = true
}

const editBox = (row) => {
  isEdit.value = true
  Object.assign(form, row)
  showAddDialog.value = true
}

const deleteBox = (row) => {
  ElMessageBox.confirm(`确定要删除配电柜"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = boxes.value.findIndex(b => b.id === row.id)
    if (index > -1) {
      boxes.value.splice(index, 1)
      total.value--
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

const batchDelete = () => {
  ElMessageBox.confirm(`确定要删除选中的${selectedRows.value.length}个配电柜吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const selectedIds = selectedRows.value.map(b => b.id)
    boxes.value = boxes.value.filter(b => !selectedIds.includes(b.id))
    total.value = boxes.value.length
    selectedRows.value = []
    ElMessage.success('批量删除成功')
  }).catch(() => {})
}

const submitForm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      if (isEdit.value) {
        ElMessage.success('配电柜修改成功')
      } else {
        const newId = Math.max(...boxes.value.map(b => b.id)) + 1
        boxes.value.push({
          id: newId,
          no: boxes.value.length + 1,
          ...form,
          status: 'online',
          health: 'normal',
          temperature: '-',
          humidity: '-',
          lockStatus: 'locked',
          magneticStatus: 'closed',
          smokeStatus: 'normal',
          waterStatus: 'dry'
        })
        total.value++
        ElMessage.success('配电柜添加成功')
      }
      showAddDialog.value = false
    }
  })
}
</script>

<style scoped>
.page-container {
  padding: 20px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.main-content {
  display: flex;
  gap: 20px;
}

.left-sidebar {
  width: 200px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 15px;
  flex-shrink: 0;
}

.sidebar-header {
  margin-bottom: 15px;
}

.right-content {
  flex: 1;
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
  gap: 15px;
  margin-bottom: 20px;
  padding: 15px;
  background: #fafafa;
  border-radius: 4px;
  flex-wrap: wrap;
}

.filter-input {
  width: 220px;
}

.filter-select {
  width: 150px;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.detail-content {
  padding: 10px 0;
}

.detail-tabs {
  margin-top: 20px;
}
</style>
