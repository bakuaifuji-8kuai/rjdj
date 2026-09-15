<!-- [软著核心代码] GuanLangEdit.vue + 管廊编辑弹窗：带数据回显，提交调 PUT /api/guanlang/update -->
<template>
  <el-dialog
    :model-value="visible"
    title="编辑管廊"
    width="640px"
    :close-on-click-modal="false"
    @update:model-value="$emit('update:visible', $event)"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="管廊编号" prop="guanLangCode">
            <el-input v-model="form.guanLangCode" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="管廊名称" prop="guanLangName">
            <el-input v-model="form.guanLangName" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="长度(米)" prop="lengthMeters">
            <el-input-number v-model="form.lengthMeters" :min="0" :precision="2" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="所属行政区" prop="district">
            <el-input v-model="form.district" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="养护单位" prop="maintainUnit">
            <el-input v-model="form.maintainUnit" />
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
            <el-input v-model="form.remark" type="textarea" :rows="2" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">保存修改</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
// ========== 导入依赖 ==========
import { ref, reactive, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { updateGuanLang, getGuanLangDetail } from '@/api/guanlang'

// ========== props / emit ==========
const props = defineProps({
  visible: Boolean,
  guanLangId: [Number, String] // 编辑时必须传管廊主键
})
const emit = defineEmits(['update:visible', 'success'])

// ========== 响应式 ==========
const formRef = ref(null)
const submitting = ref(false)
const form = reactive({
  guanLangId: null,
  guanLangCode: '',
  guanLangName: '',
  lengthMeters: 0,
  district: '',
  maintainUnit: '',
  status: 1,
  patrolFrequency: 7,
  lastPatrolDate: '',
  remark: ''
})

// ========== 校验规则 ==========
const rules = {
  guanLangCode:    [{ required: true, message: '请输入管廊编号', trigger: 'blur' }],
  guanLangName:    [{ required: true, message: '请输入管廊名称', trigger: 'blur' }],
  lengthMeters:    [{ required: true, message: '请输入管廊长度', trigger: 'blur' }],
  district:        [{ required: true, message: '请输入所属行政区', trigger: 'blur' }],
  maintainUnit:    [{ required: true, message: '请输入养护单位', trigger: 'blur' }],
  status:          [{ required: true, message: '请选择状态', trigger: 'change' }],
  patrolFrequency: [{ required: true, message: '请输入巡检频率', trigger: 'blur' }]
}

// ========== 数据回显 ==========

/**
 * 打开弹窗时，拉取管廊详情并填入表单
 * 业务说明：编辑场景下，必须根据 guanLangId 从后端拿最新数据，避免前端缓存脏数据
 */
const fetchDetail = async () => {
  if (!props.guanLangId) return
  try {
    const detail = await getGuanLangDetail(props.guanLangId)
    if (detail) {
      Object.assign(form, {
        guanLangId: detail.guanLangId,
        guanLangCode: detail.guanLangCode || '',
        guanLangName: detail.guanLangName || '',
        lengthMeters: detail.lengthMeters || 0,
        district: detail.district || '',
        maintainUnit: detail.maintainUnit || '',
        status: detail.status ?? 1,
        patrolFrequency: detail.patrolFrequency || 7,
        lastPatrolDate: detail.lastPatrolDate || '',
        remark: detail.remark || ''
      })
    }
  } catch (e) {
    // 拉取失败提示
  }
}

// 监听 visible：从关闭→打开时，拉取详情并回显
watch(() => props.visible, (val) => {
  if (val) {
    fetchDetail()   // 异步拉取数据
    formRef.value?.clearValidate() // 清校验
  }
})

onMounted(() => {
  // 挂载时如果 visible 已经是 true（理论上不会），也拉一次
  if (props.visible) fetchDetail()
})

// ========== 事件 ==========

/**
 * 提交编辑：PUT /api/guanlang/update
 */
const handleSubmit = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return

    submitting.value = true
    try {
      await updateGuanLang({ ...form })
      ElMessage.success('修改管廊成功')
      emit('success') // 通知父组件刷新
      emit('update:visible', false)
    } catch (e) {
      // 错误已统一提示
    } finally {
      submitting.value = false
    }
  })
}

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
