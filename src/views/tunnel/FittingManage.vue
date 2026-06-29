<template>
  <div class="fitting-manage">
    <div class="page-header">
      <h2>灯具管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="handleAdd">新增灯具</el-button>
        <el-button type="danger" :disabled="selectedItems.length === 0" @click="handleBatchDelete">批量删除</el-button>
      </div>
    </div>

    <div class="filter-bar">
      <el-select v-model="filterProduct" placeholder="请选择所属产品" style="width: 180px;" clearable>
        <el-option label="PLC灯控" value="PLC灯控" />
        <el-option label="隧道485灯控" value="隧道485灯控" />
      </el-select>
      <el-input v-model="searchText" placeholder="请输入IMEI号或名称" style="width: 250px;" clearable />
      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <div class="table-wrapper">
      <el-table :data="fittingData" border @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="No" width="60" />
        <el-table-column prop="product" label="所属产品" width="140" />
        <el-table-column prop="imei" label="IMEI号" width="140" />
        <el-table-column prop="controllerName" label="灯控名称" width="150" />
        <el-table-column prop="lightName" label="灯具名称" width="150" />
        <el-table-column prop="brightness" label="亮度(%)" width="100" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="text" size="small" @click="handleEdit(row)">修改</el-button>
            <el-button type="text" size="small" style="color: #f56c6c;" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        layout="prev, pager, next, jumper"
        :page-sizes="[15, 30, 50]"
      />
      <span style="margin-left: 20px;">每页显示</span>
      <el-select v-model="pageSize" style="width: 80px; margin: 0 5px;">
        <el-option :value="15" label="15" />
        <el-option :value="30" label="30" />
        <el-option :value="50" label="50" />
      </el-select>
      <span>条 共 {{ total }} 条</span>
    </div>

    <el-dialog title="编辑灯具" v-model="showDialog" width="400px">
      <div class="dialog-section">
        <span class="section-title">灯具信息</span>
        <el-form :model="formData" label-width="100px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="*灯具名称" required>
                <el-input v-model="formData.lightName" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="额定功率">
                <el-input v-model="formData.power" style="width: 120px;" />
                <span style="margin-left: 10px;">W</span>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSave">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const filterProduct = ref('')
const searchText = ref('')
const currentPage = ref(1)
const pageSize = ref(15)
const showDialog = ref(false)
const selectedItems = ref([])

const formData = ref({
  lightName: '',
  power: ''
})

const fittingData = ref([
  { id: 1, product: 'PLC灯控', imei: '1C1334124028', controllerName: '线性隧道灯', lightName: '线性隧道灯', brightness: 20 },
  { id: 2, product: '隧道485灯控', imei: '1C133413190B', controllerName: '高速隧道灯', lightName: '高速隧道灯', brightness: 100 }
])

const total = computed(() => fittingData.value.length)

const handleSearch = () => { currentPage.value = 1 }
const handleReset = () => { filterProduct.value = ''; searchText.value = ''; currentPage.value = 1 }
const handleAdd = () => {
  formData.value = { lightName: '', power: '' }
  showDialog.value = true
}
const handleEdit = (row) => {
  formData.value = { ...row }
  showDialog.value = true
}
const handleSave = () => {
  showDialog.value = false
}
const handleSelectionChange = (selection) => {
  selectedItems.value = selection
}
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该灯具吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    fittingData.value = fittingData.value.filter(item => item.id !== row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}
const handleBatchDelete = () => {
  ElMessageBox.confirm(`确定要删除选中的 ${selectedItems.value.length} 个灯具吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const ids = selectedItems.value.map(item => item.id)
    fittingData.value = fittingData.value.filter(item => !ids.includes(item.id))
    selectedItems.value = []
    ElMessage.success('批量删除成功')
  }).catch(() => {})
}
</script>

<style scoped>
.fitting-manage {
  background: #f5f5f5;
  min-height: 100%;
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
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.filter-bar {
  background: #ffffff;
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  gap: 15px;
  align-items: center;
}

.table-wrapper {
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  background: #ffffff;
  padding: 20px;
  border-radius: 8px;
}

.dialog-section {
  margin-bottom: 20px;
}

.section-title {
  font-weight: 600;
  color: #409eff;
  display: block;
  margin-bottom: 15px;
}
</style>