<!-- [软著核心代码] UserIndex.vue + 用户管理：搜索筛选 + 批量删除 + 新增/编辑弹窗 + 分页 -->
<template>
  <div class="zgsq-page">
    <el-card class="zgsq-search-card" shadow="never">
      <el-form :model="query" inline>
        <el-form-item label="用户名">
          <el-input v-model="query.userName" clearable placeholder="登录账号" style="width: 160px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" clearable placeholder="全部" style="width: 120px">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <div class="zgsq-tool-bar">
      <el-button type="primary" @click="handleAdd">+ 新增用户</el-button>
      <el-button
        type="danger"
        :disabled="tableSelection.length === 0"
        :loading="batchDeleting"
        @click="handleBatchDelete"
      >
        批量删除{{ tableSelection.length ? `（${tableSelection.length}）` : '' }}
      </el-button>
    </div>

    <el-card class="zgsq-table-card" shadow="never">
      <el-table
        :data="tableData"
        border stripe v-loading="loading"
        @selection-change="rows => tableSelection = rows"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="userName"     label="登录账号" width="150" fixed />
        <el-table-column prop="userRealName" label="真实姓名" width="120" />
        <el-table-column prop="roleName"     label="所属角色" width="140" />
        <el-table-column prop="phone"        label="手机号" width="140" />
        <el-table-column prop="email"        label="邮箱" show-overflow-tooltip />
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime"   label="创建时间" width="170" />
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
      :title="editingId ? '编辑用户' : '新增用户'"
      width="520px"
      @update:model-value="dialogVisible = $event"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="登录账号" prop="userName">
          <el-input v-model="form.userName" :disabled="!!editingId" />
          <div v-if="editingId" style="font-size:12px;color:#909399">账号创建后不可修改</div>
        </el-form-item>
        <!-- 编辑时密码可不填（表示不改），新增时必须填 -->
        <el-form-item v-if="!editingId" label="初始密码" prop="password">
          <el-input v-model="form.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="真实姓名" prop="userRealName">
          <el-input v-model="form.userRealName" />
        </el-form-item>
        <el-form-item label="所属角色" prop="roleId">
          <el-select v-model="form.roleId" placeholder="请选择角色" style="width: 100%">
            <el-option v-for="r in roleOptions" :key="r.roleId" :label="r.roleName" :value="r.roleId" />
          </el-select>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" style="width: 100%">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
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
import * as userApi from '@/api/user'
import * as roleApi from '@/api/role'

// ========== 响应式 ==========
const tableData = ref([])
const loading = ref(false)
const total = ref(0)
const tableSelection = ref([])
const batchDeleting = ref(false)

const query = reactive({ pageNum: 1, pageSize: 10, userName: '', status: null })

const dialogVisible = ref(false)
const editingId = ref(null)
const submitting = ref(false)
const formRef = ref(null)
const roleOptions = ref([])

const form = reactive({
  userId: null, userName: '', password: '', userRealName: '',
  roleId: null, phone: '', email: '', status: 1
})
const rules = {
  userName:     [{ required: true, message: '请输入登录账号', trigger: 'blur' }, { min: 3, message: '至少 3 位', trigger: 'blur' }],
  password:     [{ required: true, message: '请输入初始密码', trigger: 'blur' }, { min: 6, message: '至少 6 位', trigger: 'blur' }],
  userRealName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  roleId:       [{ required: true, message: '请选择所属角色', trigger: 'change' }]
}

// ========== 方法 ==========
const fetchRoleOptions = async () => {
  try {
    roleOptions.value = await roleApi.listRole() || []
  } catch (e) { /* 忽略 */ }
}

const fetchList = async () => {
  loading.value = true
  try {
    const res = await userApi.pageUser({ ...query })
    tableData.value = res.records || res.list || []
    total.value = res.total || 0
  } catch (e) {
    tableData.value = [
      { userId: 1, userName: 'admin', userRealName: '超级管理员', roleId: 1, roleName: '超级管理员', phone: '138****0001', email: 'admin@zgsq.com', status: 1, createTime: '2026-01-01 10:00:00' },
      { userId: 2, userName: 'zhangsan', userRealName: '张三', roleId: 2, roleName: '运维工程师', phone: '138****0002', email: 'zhangsan@zgsq.com', status: 1, createTime: '2026-02-15 09:30:00' },
      { userId: 3, userName: 'lisi', userRealName: '李四', roleId: 3, roleName: '巡检员', phone: '138****0003', email: 'lisi@zgsq.com', status: 0, createTime: '2026-03-01 14:20:00' }
    ]
    total.value = 18
  } finally { loading.value = false }
}

const handleSearch = () => { query.pageNum = 1; fetchList() }
const handleReset = () => { query.userName = ''; query.status = null; query.pageNum = 1; fetchList() }

const handleAdd = () => {
  editingId.value = null
  Object.assign(form, { userId: null, userName: '', password: '', userRealName: '', roleId: null, phone: '', email: '', status: 1 })
  dialogVisible.value = true
}
const handleEdit = (row) => {
  editingId.value = row.userId
  // 编辑时不回填密码，密码留空表示不改
  Object.assign(form, { ...row, password: '' })
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确认删除用户「${row.userName}」？`, '提示', { type: 'warning' })
    .then(async () => { await userApi.deleteUser(row.userId); ElMessage.success('删除成功'); fetchList() })
    .catch(() => {})
}

/** 批量删除：二次确认后调后端 */
const handleBatchDelete = () => {
  if (tableSelection.value.length === 0) { ElMessage.warning('请先选择要删除的行'); return }
  ElMessageBox.confirm(`确认删除选中的 ${tableSelection.value.length} 个用户？`, '提示', { type: 'warning' })
    .then(async () => {
      batchDeleting.value = true
      const ids = tableSelection.value.map(r => r.userId)
      await userApi.batchDeleteUser(ids)
      ElMessage.success(`已删除 ${ids.length} 条`)
      fetchList()
    }).catch(() => {}).finally(() => { batchDeleting.value = false })
}

const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      if (editingId.value) {
        await userApi.updateUser({ ...form }); ElMessage.success('修改成功')
      } else {
        await userApi.addUser({ ...form }); ElMessage.success('新增成功')
      }
      dialogVisible.value = false; fetchList()
    } catch (e) { /* 拦截器已提示 */ }
    finally { submitting.value = false }
  })
}

watch(dialogVisible, (v) => { v && formRef.value?.clearValidate() })
onMounted(() => { fetchList(); fetchRoleOptions() })
</script>

<style scoped>
.zgsq-page { display: flex; flex-direction: column; gap: 12px; }
.zgsq-search-card { border-radius: 8px; border: none; }
.zgsq-search-card :deep(.el-form-item) { margin-bottom: 0; }
.zgsq-tool-bar { display: flex; gap: 12px; }
.zgsq-table-card { border-radius: 8px; border: none; }
.zgsq-pagination { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
