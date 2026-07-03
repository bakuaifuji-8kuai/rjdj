/**
 * 智光云枢-页面生命周期组合式函数
 * 封装页面挂载、卸载、标题设置、访问审计等通用生命周期逻辑
 * 业务域：共享层
 * @module shared/composables/usePageLifecycle
 * @author 智光云枢研发团队
 */
import { onMounted, onUnmounted, onActivated, onDeactivated, ref } from 'vue'

/**
 * 创建页面生命周期管理
 * @param {Object} options 配置项
 * @param {string} options.pageTitle 页面标题
 * @param {string} options.moduleName 业务模块名
 * @param {Function} options.onReady 就绪回调
 * @param {Function} options.onLeave 离开回调
 * @returns {Object} 生命周期状态
 */
export function usePageLifecycle(options = {}) {
  const {
    pageTitle = '',
    moduleName = '',
    onReady = null,
    onLeave = null
  } = options

  // 页面是否已就绪
  const pageReady = ref(false)
  // 页面是否在激活态
  const pageActive = ref(false)
  // 进入时间戳
  const enterTick = ref(0)

  /**
   * 设置文档标题
   */
  const setTitle = (title) => {
    const fullTitle = title
      ? `${title} - 智光云枢`
      : '智光云枢 - 城市照明物联管控平台'
    if (typeof document !== 'undefined') {
      document.title = fullTitle
    }
  }

  /**
   * 记录访问审计（mock）
   */
  const recordAudit = (action) => {
    // 真实项目中应调用 auditApi.recordVisit
    const payload = {
      module: moduleName,
      title: pageTitle,
      action,
      at: Date.now()
    }
    // 仅在开发模式下输出
    if (import.meta?.env?.DEV) {
      // console.debug('[zg-audit]', payload)
    }
  }

  onMounted(() => {
    pageReady.value = true
    pageActive.value = true
    enterTick.value = Date.now()
    if (pageTitle) {
      setTitle(pageTitle)
    }
    recordAudit('enter')
    if (onReady) {
      onReady()
    }
  })

  onUnmounted(() => {
    pageActive.value = false
    recordAudit('leave')
    if (onLeave) {
      onLeave()
    }
  })

  // 支持 <keep-alive> 场景
  onActivated(() => {
    pageActive.value = true
    enterTick.value = Date.now()
    recordAudit('activate')
  })

  onDeactivated(() => {
    pageActive.value = false
    recordAudit('deactivate')
  })

  return {
    pageReady,
    pageActive,
    enterTick,
    setTitle,
    recordAudit
  }
}

export default usePageLifecycle
