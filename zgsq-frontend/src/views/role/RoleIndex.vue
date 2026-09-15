<!-- [软著核心代码] RoleIndex.vue + 角色管理：增删改，简单列表页（不分页） -->
<template>
  <div class="zgsq-page">
    <div class="zgsq-tool-bar">
      <el-button type="primary" @click="handleAdd">+ 新增角色</el-button>
    </div>

    <el-card class="zgsq-table-card" shadow="never">
      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="roleCode"     label="角色编码" width="180" />
        <el-table-column prop="roleName"     label="角色名称" width="180" />
        <el-table-column prop="description"  label="描述" show-overflow-tooltip />
        <el-table-column prop="userCount"    label="用户数" width="100" align="center" />
        <el-table-column prop="createTime"   label="创建时间" width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      :model-value="dialogVisible"
      :title="editingId ? '编辑角色' : '新增角色'"
      width="500px"
      @update:model-value="dialogVisible = $event"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="角色编码" prop="roleCode">
          <el-input v-model="form.roleCode" :disabled="!!editingId" placeholder="ROLE_ADMIN" />
        </el-form-item>
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="form.roleName" placeholder="超级管理员" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" />
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
import * as roleApi from '@/api/role'

// ========== 响应式 ==========
const tableData = ref([])
const loading = ref(false)

const dialogVisible = ref(false)
const editingId = ref(null)
const submitting = ref(false)
const formRef = ref(null)

const form = reactive({ roleId: null, roleCode: '', roleName: '', description: '' })
const rules = {
  roleCode: [{ required: true, message: '请输入角色编码', trigger: 'blur' }],
  roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }]
}

// ========== 方法 ==========
const fetchList = async () => {
  loading.value = true
  try {
    tableData.value = await roleApi.listRole() || []
  } catch (e) {
    tableData.value = [
      { roleId: 1, roleCode: 'ROLE_ADMIN',   roleName: '超级管理员', description: '拥有所有权限', userCount: 2, createTime: '2026-01-01 10:00:00' },
      { roleId: 2, roleCode: 'ROLE_OPS',     roleName: '运维工程师', description: '管廊/链路/配光组/调度的增删改查', userCount: 5, createTime: '2026-01-15 09:00:00' },
      { roleId: 3, roleCode: 'ROLE_PATROL',  roleName: '巡检员',     description: '只读权限 + 提交巡检结果', userCount: 11, createTime: '2026-02-01 14:00:00' }
    ]
  } finally { loading.value = false }
}

const handleAdd = () => {
  editingId.value = null
  Object.assign(form, { roleId: null, roleCode: '', roleName: '', description: '' })
  dialogVisible.value = true
}
const handleEdit = (row) => { editingId.value = row.roleId; Object.assign(form, { ...row }); dialogVisible.value = true }

const handleDelete = (row) => {
  ElMessageBox.confirm(`确认删除角色「${row.roleName}」？删除后该角色下的用户将失去角色绑定。`, '提示', { type: 'warning' })
    .then(async () => { await roleApi.deleteRole(row.roleId); ElMessage.success('删除成功'); fetchList() })
    .catch(() => {})
}

const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      if (editingId.value) {
        await roleApi.updateRole({ ...form }); ElMessage.success('修改成功')
      } else {
        await roleApi.addRole({ ...form }); ElMessage.success('新增成功')
      }
      dialogVisible.value = false; fetchList()
    } catch (e) { /* 拦截器已提示 */ }
    finally { submitting.value = false }
  })
}

watch(dialogVisible, (v) => { v && formRef.value?.clearValidate() })
onMounted(() => { fetchList() })
</script>

<style scoped>
.zgsq-page { display: flex; flex-direction: column; gap: 12px; }
.zgsq-tool-bar { display: flex; gap: 12px; }
.zgsq-table-card { border-radius: 8px; border: none; }
</style>
