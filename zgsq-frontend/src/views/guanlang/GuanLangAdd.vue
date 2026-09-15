<!-- [软著核心代码] GuanLangAdd.vue + 管廊新增弹窗：el-dialog + el-form，字段全、表单校验、POST 提交 -->
<template>
  <el-dialog
    :model-value="visible"
    title="新增管廊"
    width="640px"
    :close-on-click-modal="false"
    @update:model-value="$emit('update:visible', $event)"
  >
    <!-- 表单：所有字段集中定义，rules 在下面 script 里 -->
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="管廊编号" prop="guanLangCode">
            <el-input v-model="form.guanLangCode" placeholder="例如 G-2026-001" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="管廊名称" prop="guanLangName">
            <el-input v-model="form.guanLangName" placeholder="请输入管廊名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="长度(米)" prop="lengthMeters">
            <el-input-number v-model="form.lengthMeters" :min="0" :precision="2" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="所属行政区" prop="district">
            <el-input v-model="form.district" placeholder="例：天河区" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="养护单位" prop="maintainUnit">
            <el-input v-model="form.maintainUnit" placeholder="养护公司全称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="管廊状态" prop="status">
            <el-select v-model="form.status" style="width: 100%">
              <el-option label="正常"     :value="1" />
              <el-option label="维护中"   :value="2" />
              <el-option label="停用"     :value="0" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="巡检频率" prop="patrolFrequency">
            <el-input-number v-model="form.patrolFrequency" :min="1" style="width: 100%" />
            <span class="zgsq-form-tip">天 / 次</span>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="最近巡检日" prop="lastPatrolDate">
            <el-date-picker v-model="form.lastPatrolDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="备注">
            <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="选填" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <!-- 底部按钮区 -->
    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
// ========== 导入依赖 ==========
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { addGuanLang } from '@/api/guanlang'

// ========== props / emit ==========
const props = defineProps({
  visible: Boolean // 弹窗是否显示
})
const emit = defineEmits(['update:visible', 'success'])

// ========== 初始化表单 ==========
const initForm = () => ({
  guanLangCode: '',
  guanLangName: '',
  lengthMeters: 0,
  district: '',
  maintainUnit: '',
  status: 1,               // 默认正常
  patrolFrequency: 7,      // 默认每周巡检一次
  lastPatrolDate: '',
  remark: ''
})

// ========== 响应式 ==========
const formRef = ref(null)    // el-form 引用
const submitting = ref(false) // 提交中状态
const form = reactive(initForm())

// ========== 表单校验规则 ==========
const rules = {
  guanLangCode:  [
    { required: true, message: '请输入管廊编号', trigger: 'blur' },
    { min: 2, max: 32, message: '长度 2~32 字符', trigger: 'blur' }
  ],
  guanLangName:  [{ required: true, message: '请输入管廊名称', trigger: 'blur' }],
  lengthMeters: [{ required: true, message: '请输入管廊长度', trigger: 'blur' }],
  district:      [{ required: true, message: '请输入所属行政区', trigger: 'blur' }],
  maintainUnit:  [{ required: true, message: '请输入养护单位', trigger: 'blur' }],
  status:        [{ required: true, message: '请选择状态', trigger: 'change' }],
  patrolFrequency: [{ required: true, message: '请输入巡检频率', trigger: 'blur' }]
}

// ========== 监听 visible：弹窗打开时重置表单 ==========
watch(() => props.visible, (val) => {
  if (val) {
    // 重置为初始值，避免上一次的残留
    Object.assign(form, initForm())
    formRef.value?.clearValidate() // 清除上一次的校验提示
  }
})

// ========== 事件 ==========

/**
 * 点击保存：先校验，校验通过后调后端 POST 接口
 */
const handleSubmit = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return // 校验失败

    submitting.value = true // 禁用按钮防重复提交
    try {
      await addGuanLang({ ...form }) // 克隆一份避免外部修改
      ElMessage.success('新增管廊成功')
      emit('success') // 通知父组件刷新列表
      emit('update:visible', false) // 关闭弹窗
    } catch (e) {
      // 错误已在 axios 拦截器统一提示
    } finally {
      submitting.value = false
    }
  })
}

/**
 * 取消：关闭弹窗
 */
const handleCancel = () => {
  emit('update:visible', false)
}
</script>

<style scoped>
.zgsq-form-tip {
  margin-left: 8px;
  font-size: 12px;
  color: #909399;
}
</style>
