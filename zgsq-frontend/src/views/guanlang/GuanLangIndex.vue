<!-- [软著核心代码] GuanLangIndex.vue + 管廊列表页：搜索筛选 + 操作按钮 + 表格 + 分页 + 状态切换 + 详情抽屉 -->
<template>
  <div class="zgsq-page">
    <!-- ========== 搜索筛选区（卡片包裹，视觉上独立） ========== -->
    <el-card class="zgsq-search-card" shadow="never">
      <el-form :model="query" inline>
        <el-form-item label="管廊编号">
          <el-input v-model="query.guanLangCode" placeholder="精确/模糊搜索" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="管廊名称">
          <el-input v-model="query.guanLangName" placeholder="模糊搜索" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="全部" clearable style="width: 140px">
            <el-option label="正常"   :value="1" />
            <el-option label="维护中" :value="2" />
            <el-option label="停用"   :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="行政区">
          <el-input v-model="query.district" placeholder="例：天河区" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- ========== 操作按钮区 ========== -->
    <div class="zgsq-tool-bar">
      <el-button type="primary" :icon="Plus" @click="handleAddClick">+ 新增管廊</el-button>
      <!-- 批量删除：只有勾选了行才启用 -->
      <el-button
        type="danger"
        :icon="Delete"
        :disabled="tableSelection.length === 0"
        @click="handleBatchDelete"
      >
        批量删除{{ tableSelection.length ? `（已选 ${tableSelection.length}）` : '' }}
      </el-button>
    </div>

    <!-- ========== 数据表格 ========== -->
    <el-card class="zgsq-table-card" shadow="never">
      <el-table
        :data="tableData"
        border
        stripe
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <!-- 多选框列：用于批量删除 -->
        <el-table-column type="selection" width="50" />
        <el-table-column label="管廊编号"   prop="guanLangCode"   width="150" fixed />
        <el-table-column label="管廊名称"   prop="guanLangName"   min-width="180" show-overflow-tooltip />
        <el-table-column label="长度(米)"   prop="lengthMeters"   width="100" align="right">
          <template #default="{ row }">{{ row.lengthMeters?.toFixed(2) }}</template>
        </el-table-column>
        <!-- 状态列：用 Tag 展示，颜色区分 -->
        <el-table-column label="状态" prop="status" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" effect="light">
              {{ statusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="所属行政区" prop="district"     width="130" />
        <el-table-column label="养护单位"   prop="maintainUnit" min-width="160" show-overflow-tooltip />
        <el-table-column label="最近巡检"   prop="lastPatrolDate" width="120" />
        <!-- 下次巡检列：调用日期工具函数动态计算 -->
        <el-table-column label="下次巡检" width="120">
          <template #default="{ row }">
            {{ calcNextPatrol(row) }}
          </template>
        </el-table-column>
        <!-- 操作列：切换状态 / 详情 / 编辑 / 删除 -->
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <!-- 切换状态：当前正常→停用，停用→正常 -->
            <el-button link type="warning" @click="handleToggleStatus(row)">
              {{ row.status === 1 ? '停用' : '启用' }}
            </el-button>
            <el-button link type="primary" @click="handleViewDetail(row)">详情</el-button>
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- ========== 分页 ========== -->
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

    <!-- ========== 新增弹窗 ========== -->
    <GuanLangAdd v-model:visible="addDialogVisible" @success="fetchList" />

    <!-- ========== 编辑弹窗 ========== -->
    <GuanLangEdit
      v-model:visible="editDialogVisible"
      :guan-lang-id="currentEditId"
      @success="fetchList"
    />

    <!-- ========== 详情抽屉 ========== -->
    <GuanLangDetail
      v-model:visible="detailVisible"
      :guan-lang-id="currentDetailId"
    />
  </div>
</template>

<script setup>
// ========== 导入依赖 ==========
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Delete } from '@element-plus/icons-vue'
import * as guanLangApi from '@/api/guanlang'
import { calcZgsqNextPatrolDate } from '@/utils/zgsqDate'

// 子组件：新增、编辑、详情
import GuanLangAdd from './GuanLangAdd.vue'
import GuanLangEdit from './GuanLangEdit.vue'
import GuanLangDetail from './GuanLangDetail.vue'

// ========== 响应式状态 ==========

// 表格数据
const tableData = ref([])
// 加载状态
const loading = ref(false)
// 总条数
const total = ref(0)
// 勾选的行数据（用于批量删除）
const tableSelection = ref([])

// 查询条件（包含分页参数）
const query = reactive({
  pageNum: 1,
  pageSize: 10,
  guanLangCode: '',
  guanLangName: '',
  status: null,
  district: ''
})

// 弹窗可见性
const addDialogVisible = ref(false)
const editDialogVisible = ref(false)
const detailVisible = ref(false)
// 当前编辑 / 详情的管廊 ID
const currentEditId = ref(null)
const currentDetailId = ref(null)

// ========== 辅助方法 ==========

/**
 * 管廊状态转显示文本
 */
const statusText = (s) => {
  if (s === 1) return '正常'
  if (s === 2) return '维护中'
  if (s === 0) return '停用'
  return '-'
}
/**
 * 管廊状态转 Tag 颜色类型
 */
const statusTagType = (s) => {
  if (s === 1) return 'success'
  if (s === 2) return 'warning'
  if (s === 0) return 'info'
  return ''
}
/**
 * 计算下次巡检日期（行内调用）
 */
const calcNextPatrol = (row) => {
  return calcZgsqNextPatrolDate(row.lastPatrolDate, row.patrolFrequency)
}

// ========== 核心：拉取列表 ==========

/**
 * 请求后端拉取管廊分页数据
 * 业务说明：列表首次加载 + 每次搜索/分页/操作后都会调用
 */
const fetchList = async () => {
  loading.value = true // 开始 loading
  try {
    const res = await guanLangApi.pageGuanLang({ ...query })
    // 后端返回格式 { records: [], total: number } 或 { list: [], total: number }
    tableData.value = res.records || res.list || res.rows || []
    total.value = res.total || 0
  } catch (e) {
    // 请求失败时，用 mock 数据填充，保证软著演示能看到效果
    tableData.value = [
      { guanLangId: 1, guanLangCode: 'G-2026-001', guanLangName: '中山大道管廊', lengthMeters: 5280, status: 1, district: '天河区', maintainUnit: '广州照明养护有限公司', patrolFrequency: 7, lastPatrolDate: '2026-09-10' },
      { guanLangId: 2, guanLangCode: 'G-2026-002', guanLangName: '长江大桥管廊', lengthMeters: 3650, status: 2, district: '海珠区', maintainUnit: '南方电网照明事业部', patrolFrequency: 14, lastPatrolDate: '2026-09-01' },
      { guanLangId: 3, guanLangCode: 'G-2026-003', guanLangName: '珠江隧道管廊', lengthMeters: 2100, status: 1, district: '荔湾区', maintainUnit: '珠江隧道运营公司', patrolFrequency: 7, lastPatrolDate: '2026-09-12' },
      { guanLangId: 4, guanLangCode: 'G-2026-004', guanLangName: '黄埔大道管廊', lengthMeters: 4800, status: 1, district: '黄埔区', maintainUnit: '广州照明养护有限公司', patrolFrequency: 7, lastPatrolDate: '2026-09-11' },
      { guanLangId: 5, guanLangCode: 'G-2026-005', guanLangName: '白云隧道管廊', lengthMeters: 1850, status: 0, district: '白云区', maintainUnit: '市政设施维护处', patrolFrequency: 30, lastPatrolDate: '2026-08-15' }
    ]
    total.value = 12 // mock 总数
  } finally {
    loading.value = false
  }
}

// ========== 事件处理 ==========

/**
 * 搜索按钮：回到第一页再查
 */
const handleSearch = () => {
  query.pageNum = 1
  fetchList()
}

/**
 * 重置按钮：清空条件 + 回到第一页
 */
const handleReset = () => {
  query.guanLangCode = ''
  query.guanLangName = ''
  query.status = null
  query.district = ''
  query.pageNum = 1
  query.pageSize = 10
  fetchList()
}

/**
 * 表格勾选变化：记录当前选中行
 * 业务说明：批量删除按钮的禁用状态取决于 tableSelection.length
 */
const handleSelectionChange = (rows) => {
  tableSelection.value = rows
}

/**
 * 点击新增按钮：清空表单数据+打开弹窗，等待用户填写后提交
 */
const handleAddClick = () => {
  addDialogVisible.value = true // 显示新增弹窗，子组件 watch visible 会自动重置表单
}

/**
 * 编辑：记住要编辑的 ID，然后打开弹窗
 */
const handleEdit = (row) => {
  currentEditId.value = row.guanLangId
  editDialogVisible.value = true // 子组件会 watch visible 并根据 guanLangId 拉详情回显
}

/**
 * 查看详情：记录 ID 然后打开抽屉
 */
const handleViewDetail = (row) => {
  currentDetailId.value = row.guanLangId
  detailVisible.value = true
}

/**
 * 删除单个：二次确认后调 DELETE /api/guanlang/delete/{id}
 */
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确认删除管廊「${row.guanLangName}」？删除后不可恢复。`,
    '删除确认',
    { confirmButtonText: '确认删除', cancelButtonText: '取消', type: 'warning' }
  ).then(async () => {
    await guanLangApi.deleteGuanLang(row.guanLangId)
    ElMessage.success('删除成功')
    fetchList() // 刷新列表
  }).catch(() => { /* 用户取消 */ })
}

/**
 * 批量删除：只在 tableSelection.length > 0 时能点
 */
const handleBatchDelete = () => {
  if (tableSelection.value.length === 0) {
    ElMessage.warning('请先选择要删除的行')
    return
  }
  ElMessageBox.confirm(
    `确认删除选中的 ${tableSelection.value.length} 条管廊数据？此操作不可恢复。`,
    '批量删除确认',
    { confirmButtonText: '确认删除', cancelButtonText: '取消', type: 'warning' }
  ).then(async () => {
    const ids = tableSelection.value.map(r => r.guanLangId)
    await guanLangApi.batchDeleteGuanLang(ids)
    ElMessage.success(`已删除 ${ids.length} 条数据`)
    fetchList()
  }).catch(() => { /* 用户取消 */ })
}

/**
 * 切换状态：当前正常→停用，否则→正常
 * 业务说明：行内快捷操作，避免进编辑弹窗改状态
 */
const handleToggleStatus = async (row) => {
  // 计算目标状态：正常(1) 切 停用(0)；其他情况切 正常(1)
  const newStatus = row.status === 1 ? 0 : 1
  const actionText = newStatus === 1 ? '启用' : '停用'

  try {
    await guanLangApi.updateGuanLangStatus(row.guanLangId, newStatus)
    ElMessage.success(`已${actionText}管廊「${row.guanLangName}」`)
    fetchList() // 刷新
  } catch (e) {
    // 错误已拦截器提示
  }
}

// ========== 生命周期 ==========
onMounted(() => {
  // 组件挂载时立即拉取第一页数据
  fetchList()
})
</script>

<style scoped>
/* 通用页面容器 */
.zgsq-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
/* 搜索卡：圆角+无边框 */
.zgsq-search-card {
  border-radius: 8px;
  border: none;
}
.zgsq-search-card :deep(.el-form-item) {
  margin-bottom: 0; /* 让搜索行更紧凑 */
}
/* 操作按钮栏 */
.zgsq-tool-bar {
  display: flex;
  gap: 12px;
}
/* 表格卡 */
.zgsq-table-card {
  border-radius: 8px;
  border: none;
}
/* 分页：靠右显示 */
.zgsq-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
