/**
 * 智光云枢-表单草稿组合式函数
 * 封装新建/修订表单的草稿管理、校验、提交流程
 * 业务域：共享层
 * @module shared/composables/useFormDraft
 * @author 智光云枢研发团队
 */
import { ref, reactive } from 'vue'

/**
 * 创建表单草稿管理容器
 * @param {Object} schema 表单字段 schema 与初始值
 * @param {Object} options 配置项
 * @param {Function} options.submitApi 提交接口（可选）
 * @param {Function} options.validateFn 自定义校验（可选）
 * @returns {Object} 表单状态与方法集合
 */
export function useFormDraft(schema = {}, options = {}) {
  const { submitApi = null, validateFn = null } = options

  // 草稿数据（深拷贝初始 schema）
  const draftPayload = reactive({ ...schema })
  // 草稿锚点（表单 ref）
  const formAnchor = ref(null)
  // 抽屉可见性
  const drawerOpen = ref(false)
  // 模式：compose 新建 / revise 修订
  const editMode = ref('compose')
  // 提交中
  const submitting = ref(false)
  // 修订时的原始记录
  const originRecord = ref(null)

  /**
   * 打开编排抽屉（新建）
   */
  const openComposer = () => {
    editMode.value = 'compose'
    originRecord.value = null
    resetDraft()
    drawerOpen.value = true
  }

  /**
   * 打开修订抽屉
   * @param {Object} record 要修订的记录
   */
  const openReviser = (record) => {
    editMode.value = 'revise'
    originRecord.value = { ...record }
    Object.assign(draftPayload, { ...record })
    drawerOpen.value = true
  }

  /**
   * 关闭抽屉
   */
  const closeDrawer = () => {
    drawerOpen.value = false
  }

  /**
   * 重置草稿
   */
  const resetDraft = () => {
    Object.keys(draftPayload).forEach(key => {
      delete draftPayload[key]
    })
    Object.assign(draftPayload, { ...schema })
  }

  /**
   * 校验草稿
   * @returns {Promise<boolean>} 是否通过
   */
  const validateDraft = async () => {
    if (formAnchor.value && typeof formAnchor.value.validate === 'function') {
      try {
        await formAnchor.value.validate()
      } catch {
        return false
      }
    }
    if (validateFn) {
      return validateFn(draftPayload)
    }
    return true
  }

  /**
   * 提交草稿
   * @returns {Promise<Object|null>} 提交结果
   */
  const onDraftCommit = async () => {
    const valid = await validateDraft()
    if (!valid) return null

    submitting.value = true
    try {
      if (submitApi) {
        const result = await submitApi(draftPayload, {
          mode: editMode.value,
          origin: originRecord.value
        })
        closeDrawer()
        return result
      }
      // 无接口时，返回草稿快照
      const snapshot = { ...draftPayload }
      closeDrawer()
      return snapshot
    } finally {
      submitting.value = false
    }
  }

  /**
   * 丢弃草稿
   */
  const onDraftDiscard = () => {
    resetDraft()
    closeDrawer()
  }

  return reactive({
    // 状态
    draftPayload,
    formAnchor,
    drawerOpen,
    editMode,
    submitting,
    originRecord,
    // 方法
    openComposer,
    openReviser,
    closeDrawer,
    resetDraft,
    validateDraft,
    onDraftCommit,
    onDraftDiscard
  })
}

export default useFormDraft
