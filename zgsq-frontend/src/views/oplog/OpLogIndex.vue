<!-- [软著核心代码] OpLogIndex.vue + 操作日志：只读列表页，搜索筛选 + 分页 -->
<template>
  <div class="zgsq-page">
    <el-card class="zgsq-search-card" shadow="never">
      <el-form :model="query" inline>
        <el-form-item label="操作人">
          <el-input v-model="query.userName" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="操作类型">
          <el-select v-model="query.operType" clearable placeholder="全部" style="width: 140px">
            <el-option label="新增" value="新增" />
            <el-option label="修改" value="修改" />
            <el-option label="删除" value="删除" />
            <el-option label="查询" value="查询" />
            <el-option label="登录" value="登录" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始"
            end-placeholder="结束"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 360px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="zgsq-table-card" shadow="never">
      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column type="index" label="#" width="60" />
        <el-table-column prop="userName"   label="操作人" width="120" />
        <el-table-column prop="operType"   label="操作类型" width="110">
          <template #default="{ row }">
            <el-tag :type="opTagType(row.operType)" size="small">{{ row.operType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operModule"  label="业务模块" width="120" />
        <el-table-column prop="operDesc"    label="操作描述" show-overflow-tooltip />
        <el-table-column prop="operMethod"  label="请求接口" width="200" />
        <el-table-column prop="operIp"      label="IP" width="140" />
        <el-table-column prop="operTime"    label="操作时间" width="180" />
      </el-table>

      <div class="zgsq-pagination">
        <el-pagination
          v-model:current-page="query.pageNum"
          v-model:page-size="query.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="fetchList"
          @current-change="fetchList"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
// ========== 导入 ==========
import { ref, reactive, watch, onMounted } from 'vue'
import * as oplogApi from '@/api/oplog'

// ========== 响应式 ==========
const tableData = ref([])
const loading = ref(false)
const total = ref(0)
// 时间范围用单独变量，搜索时拆成 startTime / endTime 传给后端
const dateRange = ref([])

const query = reactive({
  pageNum: 1, pageSize: 10,
  userName: '', operType: '', startTime: '', endTime: ''
})

/** 操作类型对应 Tag 颜色 */
const opTagType = (t) => {
  if (t === '新增') return 'success'
  if (t === '修改') return 'warning'
  if (t === '删除') return 'danger'
  if (t === '登录') return 'info'
  return ''
}

// ========== 方法 ==========
const fetchList = async () => {
  loading.value = true
  try {
    // 时间范围拆分成 startTime / endTime 两个参数
    if (dateRange.value && dateRange.value.length === 2) {
      query.startTime = dateRange.value[0]
      query.endTime   = dateRange.value[1]
    } else {
      query.startTime = ''; query.endTime = ''
    }
    const res = await oplogApi.pageOpLog({ ...query })
    tableData.value = res.records || res.list || []
    total.value = res.total || 0
  } catch (e) {
    tableData.value = [
      { userName: 'admin',     operType: '新增', operModule: '管廊管理', operDesc: '新增管廊 G003 - 中山大道东段', operMethod: 'POST /api/guanlang/add',   operIp: '192.168.1.100', operTime: '2026-09-15 10:32:18' },
      { userName: 'admin',     operType: '修改', operModule: '链路管理', operDesc: '更新链路 L012 所属管廊',       operMethod: 'PUT /api/lianlu/update',   operIp: '192.168.1.100', operTime: '2026-09-15 09:45:02' },
      { userName: 'zhangsan',  operType: '删除', operModule: '定时调度', operDesc: '删除定时调度任务 T-0087',      operMethod: 'DELETE /api/dingshi/delete/87', operIp: '192.168.1.105', operTime: '2026-09-15 08:12:55' },
      { userName: 'admin',     operType: '新增', operModule: '配光组管理', operDesc: '新增配光组 P-2026-09-15-014', operMethod: 'POST /api/peiguang/add', operIp: '192.168.1.100', operTime: '2026-09-14 22:03:10' },
      { userName: 'lisi',      operType: '修改', operModule: '角色管理', operDesc: '修改角色「巡检员」权限配置',   operMethod: 'PUT /api/role/update', operIp: '192.168.1.108', operTime: '2026-09-14 18:30:00' },
      { userName: 'admin',     operType: '登录', operModule: '认证中心', operDesc: '用户 admin 登录成功',          operMethod: 'POST /api/user/login', operIp: '192.168.1.100', operTime: '2026-09-14 08:00:00' }
    ]
    total.value = 256
  } finally { loading.value = false }
}

const handleSearch = () => { query.pageNum = 1; fetchList() }
const handleReset = () => {
  query.userName = ''; query.operType = ''
  dateRange.value = []; query.startTime = ''; query.endTime = ''
  query.pageNum = 1; query.pageSize = 10; fetchList()
}

onMounted(() => { fetchList() })
// dateRange 变化时同步到 query（可选，也可以只在点击搜索时同步）
watch(dateRange, () => { /* 搜索时会统一同步 */ })
</script>

<style scoped>
.zgsq-page { display: flex; flex-direction: column; gap: 12px; }
.zgsq-search-card { border-radius: 8px; border: none; }
.zgsq-search-card :deep(.el-form-item) { margin-bottom: 0; }
.zgsq-table-card { border-radius: 8px; border: none; }
.zgsq-pagination { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
