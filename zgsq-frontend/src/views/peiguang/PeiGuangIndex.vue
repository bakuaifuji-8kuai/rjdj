<!-- [软著核心代码] PeiGuangIndex.vue + 配光组管理列表页：搜索 + 增删改弹窗 + 分页 -->
<template>
  <div class="zgsq-page">
    <el-card class="zgsq-search-card" shadow="never">
      <el-form :model="query" inline>
        <el-form-item label="配光编号">
          <el-input v-model="query.peiGuangCode" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="配光名称">
          <el-input v-model="query.peiGuangName" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="所属链路">
          <el-select v-model="query.lianLuId" clearable placeholder="全部" style="width: 160px">
            <el-option v-for="ll in lianLuOptions" :key="ll.lianLuId" :label="ll.lianLuName" :value="ll.lianLuId" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" clearable placeholder="全部" style="width: 120px">
            <el-option label="在线" :value="1" />
            <el-option label="离线" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <div class="zgsq-tool-bar">
      <el-button type="primary" @click="handleAdd">+ 新增配光组</el-button>
    </div>

    <el-card class="zgsq-table-card" shadow="never">
      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="peiGuangCode"   label="配光编号" width="150" />
        <el-table-column prop="peiGuangName"   label="配光名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="lianLuName"     label="所属链路" min-width="160" />
        <el-table-column prop="lightType"      label="光源类型" width="110" />
        <el-table-column prop="power"          label="功率(W)" width="100" align="right" />
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '在线' : '离线' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="zgsq-pagination">
        <el-pagination
          v-model:current-page="query.pageNum"
          v-model:page-size="query.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="fetchList"
          @current-change="fetchList"
        />
      </div>
    </el-card>

    <!-- 新增/编辑 配光弹窗 -->
    <el-dialog
      :model-value="dialogVisible"
      :title="editingId ? '编辑配光组' : '新增配光组'"
      width="520px"
      @update:model-value="dialogVisible = $event"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="配光编号" prop="peiGuangCode">
          <el-input v-model="form.peiGuangCode" />
        </el-form-item>
        <el-form-item label="配光名称" prop="peiGuangName">
          <el-input v-model="form.peiGuangName" />
        </el-form-item>
        <el-form-item label="所属链路" prop="lianLuId">
          <el-select v-model="form.lianLuId" placeholder="请选择" style="width: 100%">
            <el-option v-for="ll in lianLuOptions" :key="ll.lianLuId" :label="ll.lianLuName" :value="ll.lianLuId" />
          </el-select>
        </el-form-item>
        <el-form-item label="光源类型" prop="lightType">
          <el-select v-model="form.lightType" style="width: 100%">
            <el-option label="LED"      value="LED" />
            <el-option label="高压钠灯" value="高压钠灯" />
            <el-option label="金卤灯"   value="金卤灯" />
          </el-select>
        </el-form-item>
        <el-form-item label="功率(W)" prop="power">
          <el-input-number v-model="form.power" :min="0" :precision="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="初始亮度(%)" prop="brightness">
          <el-slider v-model="form.brightness" :min="0" :max="100" show-stops :step="10" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" style="width: 100%">
            <el-option label="在线" :value="1" />
            <el-option label="离线" :value="0" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
// ========== 导入 ==========
import { ref, reactive, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as peiGuangApi from '@/api/peiguang'
import * as lianLuApi from '@/api/lianlu'

// ========== 响应式 ==========
const tableData = ref([])
const loading = ref(false)
const total = ref(0)
const query = reactive({
  pageNum: 1, pageSize: 10,
  peiGuangCode: '', peiGuangName: '', lianLuId: null, status: null
})

const dialogVisible = ref(false)
const editingId = ref(null)
const submitting = ref(false)
const formRef = ref(null)
const lianLuOptions = ref([])

const form = reactive({
  peiGuangId: null, peiGuangCode: '', peiGuangName: '',
  lianLuId: null, lightType: 'LED', power: 100, brightness: 100, status: 1
})
const rules = {
  peiGuangCode: [{ required: true, message: '请输入配光编号', trigger: 'blur' }],
  peiGuangName: [{ required: true, message: '请输入配光名称', trigger: 'blur' }],
  lianLuId:     [{ required: true, message: '请选择所属链路', trigger: 'change' }],
  lightType:    [{ required: true, message: '请选择光源类型', trigger: 'change' }],
  power:        [{ required: true, message: '请输入功率', trigger: 'blur' }]
}

// ========== 方法 ==========
const fetchLianLuOptions = async () => {
  try {
    const res = await lianLuApi.pageLianLu({ pageNum: 1, pageSize: 999 })
    lianLuOptions.value = res.records || res.list || []
  } catch (e) { /* 忽略 */ }
}

const fetchList = async () => {
  loading.value = true
  try {
    const res = await peiGuangApi.pagePeiGuang({ ...query })
    tableData.value = res.records || res.list || []
    total.value = res.total || 0
  } catch (e) {
    tableData.value = [
      { peiGuangId: 1, peiGuangCode: 'P-001', peiGuangName: '中山大道东段 P-001', lianLuId: 1, lianLuName: '中山大道东段主链路', lightType: 'LED', power: 80, brightness: 100, status: 1 },
      { peiGuangId: 2, peiGuangCode: 'P-002', peiGuangName: '长江大桥北岸 P-002',   lianLuId: 2, lianLuName: '长江大桥北岸链路',   lightType: 'LED', power: 100, brightness: 80, status: 1 },
      { peiGuangId: 3, peiGuangCode: 'P-003', peiGuangName: '珠江隧道 P-003',       lianLuId: 3, lianLuName: '珠江隧道东西向链路', lightType: '高压钠灯', power: 150, brightness: 0, status: 0 }
    ]
    total.value = 156
  } finally { loading.value = false }
}

const handleSearch = () => { query.pageNum = 1; fetchList() }
const handleReset = () => {
  query.peiGuangCode = ''; query.peiGuangName = ''; query.lianLuId = null; query.status = null
  query.pageNum = 1; query.pageSize = 10; fetchList()
}

const handleAdd = () => {
  editingId.value = null
  Object.assign(form, { peiGuangId: null, peiGuangCode: '', peiGuangName: '', lianLuId: null, lightType: 'LED', power: 100, brightness: 100, status: 1 })
  dialogVisible.value = true
}
const handleEdit = (row) => { editingId.value = row.peiGuangId; Object.assign(form, { ...row }); dialogVisible.value = true }

const handleDelete = (row) => {
  ElMessageBox.confirm(`确认删除配光组「${row.peiGuangName}」？`, '提示', { type: 'warning' })
    .then(async () => { await peiGuangApi.deletePeiGuang(row.peiGuangId); ElMessage.success('删除成功'); fetchList() })
    .catch(() => {})
}

const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      if (editingId.value) {
        await peiGuangApi.updatePeiGuang({ ...form }); ElMessage.success('修改成功')
      } else {
        await peiGuangApi.addPeiGuang({ ...form }); ElMessage.success('新增成功')
      }
      dialogVisible.value = false; fetchList()
    } catch (e) { /* 拦截器已提示 */ }
    finally { submitting.value = false }
  })
}

watch(dialogVisible, (v) => { v && formRef.value?.clearValidate() })

onMounted(() => { fetchList(); fetchLianLuOptions() })
</script>

<style scoped>
.zgsq-page { display: flex; flex-direction: column; gap: 12px; }
.zgsq-search-card { border-radius: 8px; border: none; }
.zgsq-search-card :deep(.el-form-item) { margin-bottom: 0; }
.zgsq-tool-bar { display: flex; gap: 12px; }
.zgsq-table-card { border-radius: 8px; border: none; }
.zgsq-pagination { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
