/**
 * 智光云枢-通用表格组合式函数
 * 封装分页、检索、数据池管理等通用表格行为
 * 业务域：共享层
 * @module shared/composables/usePresetTable
 * @author 智光云枢研发团队
 */
import { ref, computed, reactive } from 'vue'

/**
 * 创建表格数据管理容器
 * @param {Function} fetchApi 数据获取函数（可选，mock模式下可用初始数据代替）
 * @param {Object} options 配置项
 * @param {number} options.defaultPageSpan 默认页长
 * @param {Array} options.initialData 初始数据（mock模式）
 * @returns {Object} 表格状态与方法集合
 */
export function usePresetTable(fetchApi = null, options = {}) {
  const { defaultPageSpan = 15, initialData = [] } = options

  // 数据池
  const presetPlaybook = ref([...initialData])
  // 分页游标
  const pagingCursor = ref(1)
  // 页长
  const pageSpan = ref(defaultPageSpan)
  // 总条数
  const totalRows = computed(() => presetPlaybook.value.length)
  // 过滤词
  const filterLexicon = ref('')
  // 类型分桶
  const typeBucket = ref('')
  // 状态分桶
  const statusBuckets = ref('')
  // 加载态
  const loadingSpin = ref(false)
  // 聚焦行
  const focusedRow = ref(null)

  // 分页后的数据
  const pagedRows = computed(() => {
    let rows = [...presetPlaybook.value]
    const lexicon = String(filterLexicon.value || '')
    if (lexicon) {
      const kw = lexicon.toLowerCase()
      rows = rows.filter(r =>
        (String(r.label || r.name || '')).toLowerCase().includes(kw) ||
        (String(r.presetLabel || r.presetSn || '')).toLowerCase().includes(kw)
      )
    }
    if (typeBucket.value) {
      rows = rows.filter(r => r.type === typeBucket.value || r.category === typeBucket.value)
    }
    if (statusBuckets.value) {
      rows = rows.filter(r =>
        r.status === statusBuckets.value || r.lifecycle === statusBuckets.value
      )
    }
    const start = (pagingCursor.value - 1) * pageSpan.value
    return rows.slice(start, start + pageSpan.value)
  })

  /**
   * 应用过滤条件
   */
  const onFilterApply = () => {
    pagingCursor.value = 1
    // 真实项目中应调用 fetchApi
    return Promise.resolve()
  }

  /**
   * 重置过滤条件
   */
  const onFilterReset = () => {
    filterLexicon.value = ''
    typeBucket.value = ''
    statusBuckets.value = ''
    pagingCursor.value = 1
  }

  /**
   * 新增记录到数据池
   * @param {Object} record 新记录
   */
  const appendRecord = (record) => {
    presetPlaybook.value.push({
      id: Date.now(),
      no: presetPlaybook.value.length + 1,
      ...record
    })
  }

  /**
   * 从数据池移除记录
   * @param {string|number} sn 记录唯一标识
   */
  const retireRecord = (sn) => {
    const idx = presetPlaybook.value.findIndex(r => r.id === sn || r.presetSn === sn)
    if (idx !== -1) {
      presetPlaybook.value.splice(idx, 1)
    }
  }

  /**
   * 更新指定记录
   * @param {string|number} sn 记录唯一标识
   * @param {Object} patch 更新字段
   */
  const reviseRecord = (sn, patch) => {
    const idx = presetPlaybook.value.findIndex(r => r.id === sn || r.presetSn === sn)
    if (idx !== -1) {
      presetPlaybook.value[idx] = { ...presetPlaybook.value[idx], ...patch }
    }
  }

  /**
   * 刷新数据池
   */
  const refreshPlaybook = async () => {
    loadingSpin.value = true
    try {
      if (fetchApi) {
        const data = await fetchApi()
        presetPlaybook.value = data
      }
    } finally {
      loadingSpin.value = false
    }
  }

  return reactive({
    presetPlaybook,
    pagingCursor,
    pageSpan,
    totalRows,
    filterLexicon,
    typeBucket,
    statusBuckets,
    loadingSpin,
    focusedRow,
    pagedRows,
    onFilterApply,
    onFilterReset,
    appendRecord,
    retireRecord,
    reviseRecord,
    refreshPlaybook
  })
}

export default usePresetTable
