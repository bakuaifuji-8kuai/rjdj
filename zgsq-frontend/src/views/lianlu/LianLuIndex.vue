<!-- [软著核心代码] LianLuIndex.vue + 链路管理列表页：搜索筛选 + 新增/编辑弹窗 + 表格 + 分页 -->
<template>
  <div class="zgsq-page">
    <!-- 搜索筛选 -->
    <el-card class="zgsq-search-card" shadow="never">
      <el-form :model="query" inline>
        <el-form-item label="链路编号">
          <el-input v-model="query.lianLuCode" clearable placeholder="链路编号" style="width: 160px" />
        </el-form-item>
        <el-form-item label="链路名称">
          <el-input v-model="query.lianLuName" clearable placeholder="链路名称" style="width: 160px" />
        </el-form-item>
        <el-form-item label="所属管廊">
          <el-select v-model="query.guanLangId" clearable placeholder="全部" style="width: 160px">
            <el-option v-for="gl in guanLangOptions" :key="gl.guanLangId" :label="gl.guanLangName" :value="gl.guanLangId" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" clearable placeholder="全部" style="width: 120px">
            <el-option label="启用" :value="1" />
            <el-option label="停用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作按钮 -->
    <div class="zgsq-tool-bar">
      <el-button type="primary" @click="handleAdd">+ 新增链路</el-button>
    </div>

    <!-- 表格 -->
    <el-card class="zgsq-table-card" shadow="never">
      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="lianLuCode"  label="链路编号" width="150" />
        <el-table-column prop="lianLuName"  label="链路名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="guanLangName" label="所属管廊" min-width="160" />
        <el-table-column prop="linkType"    label="类型" width="100" />
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" show-overflow-tooltip />
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

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      :model-value="dialogVisible"
      :title="editingId ? '编辑链路' : '新增链路'"
      width="520px"
      :close-on-click-modal="false"
      @update:model-value="dialogVisible = $event"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="链路编号" prop="lianLuCode">
          <el-input v-model="form.lianLuCode" placeholder="例如 L-001" />
        </el-form-item>
        <el-form-item label="链路名称" prop="lianLuName">
          <el-input v-model="form.lianLuName" placeholder="请输入链路名称" />
        </el-form-item>
        <el-form-item label="所属管廊" prop="guanLangId">
          <el-select v-model="form.guanLangId" placeholder="请选择所属管廊" style="width: 100%">
            <el-option v-for="gl in guanLangOptions" :key="gl.guanLangId" :label="gl.guanLangName" :value="gl.guanLangId" />
          </el-select>
        </el-form-item>
        <el-form-item label="链路类型" prop="linkType">
          <el-select v-model="form.linkType" placeholder="请选择" style="width: 100%">
            <el-option label="主干链路" value="主干" />
            <el-option label="支路链路" value="支路" />
            <el-option label="支线链路" value="支线" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" style="width: 100%">
            <el-option label="启用" :value="1" />
            <el-option label="停用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" />
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
// ========== 导入依赖 ==========
import { ref, reactive, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as lianLuApi from '@/api/lianlu'
import * as guanLangApi from '@/api/guanlang'

// ========== 响应式 ==========
const tableData = ref([])
const loading = ref(false)
const total = ref(0)
const query = reactive({
  pageNum: 1, pageSize: 10,
  lianLuCode: '', lianLuName: '', guanLangId: null, status: null
})

// 弹窗相关
const dialogVisible = ref(false)
const editingId = ref(null)
const submitting = ref(false)
const formRef = ref(null)

// 所属管廊下拉（来自管廊列表）
const guanLangOptions = ref([])

// 表单数据：新增 / 编辑 共用
const form = reactive({
  lianLuId: null,
  lianLuCode: '',
  lianLuName: '',
  guanLangId: null,
  linkType: '主干',
  status: 1,
  remark: ''
})
const rules = {
  lianLuCode: [{ required: true, message: '请输入链路编号', trigger: 'blur' }],
  lianLuName: [{ required: true, message: '请输入链路名称', trigger: 'blur' }],
  guanLangId: [{ required: true, message: '请选择所属管廊', trigger: 'change' }],
  linkType:   [{ required: true, message: '请选择链路类型', trigger: 'change' }]
}

// ========== 方法 ==========

/** 拉取管廊下拉列表（用在表单和搜索区） */
const fetchGuanLangOptions = async () => {
  try {
    const res = await guanLangApi.pageGuanLang({ pageNum: 1, pageSize: 999 })
    guanLangOptions.value = res.records || res.list || []
  } catch (e) { /* 忽略，可能后端未就绪 */ }
}

/** 拉取链路分页列表 */
const fetchList = async () => {
  loading.value = true
  try {
    const res = await lianLuApi.pageLianLu({ ...query })
    tableData.value = res.records || res.list || []
    total.value = res.total || 0
  } catch (e) {
    // Mock 数据
    tableData.value = [
      { lianLuId: 1, lianLuCode: 'L-001', lianLuName: '中山大道东段主链路', guanLangId: 1, guanLangName: '中山大道管廊', linkType: '主干', status: 1, remark: '' },
      { lianLuId: 2, lianLuCode: 'L-002', lianLuName: '长江大桥北岸链路',   guanLangId: 2, guanLangName: '长江大桥管廊', linkType: '主干', status: 1, remark: '' },
      { lianLuId: 3, lianLuCode: 'L-003', lianLuName: '珠江隧道东西向链路', guanLangId: 3, guanLangName: '珠江隧道管廊', linkType: '主干', status: 0, remark: '临时停用' }
    ]
    total.value = 38
  } finally {
    loading.value = false
  }
}

/** 搜索：回到第一页再查 */
const handleSearch = () => { query.pageNum = 1; fetchList() }
/** 重置：清空条件 + 回到第一页 */
const handleReset = () => {
  query.lianLuCode = ''; query.lianLuName = ''; query.guanLangId = null; query.status = null
  query.pageNum = 1; query.pageSize = 10; fetchList()
}

/** 打开新增弹窗：清空 form */
const handleAdd = () => {
  editingId.value = null
  Object.assign(form, { lianLuId: null, lianLuCode: '', lianLuName: '', guanLangId: null, linkType: '主干', status: 1, remark: '' })
  dialogVisible.value = true
}

/** 打开编辑弹窗：回填当前行数据 */
const handleEdit = (row) => {
  editingId.value = row.lianLuId
  Object.assign(form, { ...row })
  dialogVisible.value = true
}

/** 删除：二次确认 */
const handleDelete = (row) => {
  ElMessageBox.confirm(`确认删除链路「${row.lianLuName}」？`, '提示', { type: 'warning' })
    .then(async () => {
      await lianLuApi.deleteLianLu(row.lianLuId)
      ElMessage.success('删除成功'); fetchList()
    }).catch(() => {})
}

/** 提交新增 / 编辑：根据 editingId 走不同接口 */
const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      if (editingId.value) {
        await lianLuApi.updateLianLu({ ...form })
        ElMessage.success('修改成功')
      } else {
        await lianLuApi.addLianLu({ ...form })
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
      fetchList()
    } catch (e) { /* 拦截器已提示 */ }
    finally { submitting.value = false }
  })
}

// 弹窗关闭时清校验
watch(dialogVisible, (v) => { v && formRef.value?.clearValidate() })

onMounted(() => {
  fetchList()
  fetchGuanLangOptions()
})
</script>

<style scoped>
.zgsq-page { display: flex; flex-direction: column; gap: 12px; }
.zgsq-search-card { border-radius: 8px; border: none; }
.zgsq-search-card :deep(.el-form-item) { margin-bottom: 0; }
.zgsq-tool-bar { display: flex; gap: 12px; }
.zgsq-table-card { border-radius: 8px; border: none; }
.zgsq-pagination { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
