<!-- [软著核心代码] DingShiIndex.vue + 定时调度列表页：增删改、启停切换、分页 -->
<template>
  <div class="zgsq-page">
    <el-card class="zgsq-search-card" shadow="never">
      <el-form :model="query" inline>
        <el-form-item label="调度名称">
          <el-input v-model="query.dingshiName" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.enabled" clearable placeholder="全部" style="width: 120px">
            <el-option label="启用" :value="1" />
            <el-option label="暂停" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <div class="zgsq-tool-bar">
      <el-button type="primary" @click="handleAdd">+ 新增定时调度</el-button>
    </div>

    <el-card class="zgsq-table-card" shadow="never">
      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="dingshiName" label="调度名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="peiGuangName" label="目标配光组" min-width="160" />
        <el-table-column prop="cronExpr"    label="Cron 表达式" width="160">
          <template #default="{ row }">
            <code style="color:#409eff">{{ row.cronExpr }}</code>
          </template>
        </el-table-column>
        <el-table-column prop="startTime"   label="开始时间" width="150" />
        <el-table-column prop="endTime"     label="结束时间" width="150" />
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.enabled"
              :active-value="1"
              :inactive-value="0"
              @change="handleToggle(row)"
            />
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

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      :model-value="dialogVisible"
      :title="editingId ? '编辑定时调度' : '新增定时调度'"
      width="520px"
      @update:model-value="dialogVisible = $event"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="调度名称" prop="dingshiName">
          <el-input v-model="form.dingshiName" placeholder="如：工作日傍晚开路灯" />
        </el-form-item>
        <el-form-item label="目标配光组" prop="peiGuangId">
          <el-select v-model="form.peiGuangId" placeholder="请选择" style="width: 100%" filterable>
            <el-option v-for="pg in peiGuangOptions" :key="pg.peiGuangId" :label="pg.peiGuangName" :value="pg.peiGuangId" />
          </el-select>
        </el-form-item>
        <el-form-item label="Cron 表达式" prop="cronExpr">
          <el-input v-model="form.cronExpr" placeholder="0 30 18 ? * MON-FRI" />
          <div style="font-size:12px;color:#909399;margin-top:4px">
            提示：秒 分 时 日 月 周，例 <code>0 0 18 * * ?</code> 表示每天 18:00
          </div>
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-time-picker v-model="form.startTime" format="HH:mm" value-format="HH:mm" style="width: 100%" />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-time-picker v-model="form.endTime" format="HH:mm" value-format="HH:mm" style="width: 100%" />
        </el-form-item>
        <el-form-item label="亮度(%)" prop="brightness">
          <el-slider v-model="form.brightness" :min="0" :max="100" show-stops :step="10" />
        </el-form-item>
        <el-form-item label="启用状态" prop="enabled">
          <el-switch v-model="form.enabled" :active-value="1" :inactive-value="0" />
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
import * as dingShiApi from '@/api/dingshi'
import * as peiGuangApi from '@/api/peiguang'

// ========== 响应式 ==========
const tableData = ref([])
const loading = ref(false)
const total = ref(0)
const query = reactive({ pageNum: 1, pageSize: 10, dingshiName: '', enabled: null })

const dialogVisible = ref(false)
const editingId = ref(null)
const submitting = ref(false)
const formRef = ref(null)
const peiGuangOptions = ref([])

const form = reactive({
  dingshiId: null, dingshiName: '', peiGuangId: null,
  cronExpr: '', startTime: '18:00', endTime: '06:00', brightness: 100, enabled: 1
})
const rules = {
  dingshiName: [{ required: true, message: '请输入调度名称', trigger: 'blur' }],
  peiGuangId:  [{ required: true, message: '请选择目标配光组', trigger: 'change' }],
  cronExpr:    [{ required: true, message: '请输入 Cron 表达式', trigger: 'blur' }]
}

// ========== 方法 ==========
const fetchPeiGuangOptions = async () => {
  try {
    const res = await peiGuangApi.pagePeiGuang({ pageNum: 1, pageSize: 999 })
    peiGuangOptions.value = res.records || res.list || []
  } catch (e) { /* 忽略 */ }
}

const fetchList = async () => {
  loading.value = true
  try {
    const res = await dingShiApi.pageDingShi({ ...query })
    tableData.value = res.records || res.list || []
    total.value = res.total || 0
  } catch (e) {
    tableData.value = [
      { dingshiId: 1, dingshiName: '工作日傍晚开路灯', peiGuangId: 1, peiGuangName: '中山大道东段 P-001', cronExpr: '0 0 18 * * ?', startTime: '18:00', endTime: '06:00', brightness: 100, enabled: 1 },
      { dingshiId: 2, dingshiName: '工作日清晨关路灯', peiGuangId: 2, peiGuangName: '长江大桥北岸 P-002', cronExpr: '0 0 6 * * MON-FRI', startTime: '06:00', endTime: '06:00', brightness: 0, enabled: 1 },
      { dingshiId: 3, dingshiName: '周末夜间巡航巡检', peiGuangId: 3, peiGuangName: '珠江隧道 P-003', cronExpr: '0 0 22 ? * SAT,SUN', startTime: '22:00', endTime: '23:30', brightness: 50, enabled: 0 }
    ]
    total.value = 42
  } finally { loading.value = false }
}

const handleSearch = () => { query.pageNum = 1; fetchList() }
const handleReset = () => { query.dingshiName = ''; query.enabled = null; query.pageNum = 1; fetchList() }

const handleAdd = () => {
  editingId.value = null
  Object.assign(form, { dingshiId: null, dingshiName: '', peiGuangId: null, cronExpr: '', startTime: '18:00', endTime: '06:00', brightness: 100, enabled: 1 })
  dialogVisible.value = true
}
const handleEdit = (row) => { editingId.value = row.dingshiId; Object.assign(form, { ...row }); dialogVisible.value = true }

/** 启停切换：直接点开关触发 */
const handleToggle = async (row) => {
  try {
    await dingShiApi.toggleDingShi(row.dingshiId, row.enabled)
    ElMessage.success(`已${row.enabled ? '启用' : '暂停'}「${row.dingshiName}」`)
  } catch (e) {
    // 失败则把开关还原
    row.enabled = row.enabled === 1 ? 0 : 1
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确认删除调度「${row.dingshiName}」？`, '提示', { type: 'warning' })
    .then(async () => { await dingShiApi.deleteDingShi(row.dingshiId); ElMessage.success('删除成功'); fetchList() })
    .catch(() => {})
}

const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      if (editingId.value) {
        await dingShiApi.updateDingShi({ ...form }); ElMessage.success('修改成功')
      } else {
        await dingShiApi.addDingShi({ ...form }); ElMessage.success('新增成功')
      }
      dialogVisible.value = false; fetchList()
    } catch (e) { /* 拦截器已提示 */ }
    finally { submitting.value = false }
  })
}

watch(dialogVisible, (v) => { v && formRef.value?.clearValidate() })
onMounted(() => { fetchList(); fetchPeiGuangOptions() })
</script>

<style scoped>
.zgsq-page { display: flex; flex-direction: column; gap: 12px; }
.zgsq-search-card { border-radius: 8px; border: none; }
.zgsq-search-card :deep(.el-form-item) { margin-bottom: 0; }
.zgsq-tool-bar { display: flex; gap: 12px; }
.zgsq-table-card { border-radius: 8px; border: none; }
.zgsq-pagination { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
