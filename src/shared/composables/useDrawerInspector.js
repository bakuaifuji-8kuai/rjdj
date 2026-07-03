/**
 * 智光云枢-详情抽屉组合式函数
 * 封装详情抽屉的打开/关闭、数据加载、只读检视等通用逻辑
 * 业务域：共享层
 * @module shared/composables/useDrawerInspector
 * @author 智光云枢研发团队
 */
import { ref, reactive } from 'vue'

/**
 * 创建详情抽屉管理容器
 * @param {Object} options 配置项
 * @param {Function} options.fetchDetail 获取详情的接口函数（可选）
 * @param {string} options.size 抽屉宽度
 * @param {string} options.direction 抽屉方向
 * @returns {Object} 抽屉状态与方法集合
 */
export function useDrawerInspector(options = {}) {
  const {
    fetchDetail = null,
    size = '600px',
    direction = 'rtl'
  } = options

  // 抽屉可见性
  const drawerOpen = ref(false)
  // 当前检视的记录
  const focusedRecord = ref(null)
  // 加载态
  const loading = ref(false)
  // 抽屉配置
  const drawerSize = ref(size)
  const drawerDirection = ref(direction)

  /**
   * 打开抽屉并加载详情
   * @param {Object} record 当前行记录
   */
  const openInspector = async (record) => {
    focusedRecord.value = record
    drawerOpen.value = true

    // 如果有详情接口，异步加载完整数据
    if (fetchDetail && record) {
      loading.value = true
      try {
        const sn = record.id || record.presetSn || record.nodeSn || record.ticketSn
        const detail = await fetchDetail(sn, record)
        if (detail) {
          focusedRecord.value = { ...record, ...detail }
        }
      } catch (e) {
        console.warn('[zg-inspector] 加载详情失败', e)
      } finally {
        loading.value = false
      }
    }
  }

  /**
   * 关闭抽屉
   */
  const closeInspector = () => {
    drawerOpen.value = false
    // 延迟清空，避免动画过程中数据消失
    setTimeout(() => {
      focusedRecord.value = null
    }, 300)
  }

  return reactive({
    drawerOpen,
    focusedRecord,
    loading,
    drawerSize,
    drawerDirection,
    openInspector,
    closeInspector
  })
}

export default useDrawerInspector
