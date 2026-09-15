/* [软著核心代码] guanlang.js + 管廊状态 Store：缓存列表和分页数据，减少重复请求 */
import { defineStore } from 'pinia' // Pinia 定义 store 的方法
import { ref } from 'vue'           // 响应式基础 API
import { pageGuanLang } from '@/api/guanlang' // 导入管廊分页接口

/**
 * guanlangStore 定义
 * 业务说明：管廊是平台高频访问的数据，这里缓存分页结果，
 * 在列表页切页/切筛选条件时可以快速回填，提升用户体验
 */
export const useGuanLangStore = defineStore('guanlang', () => {
  // 管廊列表数据（当前页）
  const guanLangList = ref([])
  // 分页总条数
  const total = ref(0)
  // 当前查询条件（下次进入列表页可恢复）
  const lastQuery = ref({
    pageNum: 1,
    pageSize: 10,
    guanLangCode: '',
    guanLangName: '',
    status: null,
    district: ''
  })
  // 最后一次拉取时间（毫秒时间戳），用于判断是否需要重新请求
  const lastFetchTime = ref(0)

  /**
   * 拉取管廊分页列表
   * 业务说明：每次列表页加载时调用，请求成功后更新 store 中的缓存数据
   * @param {Object} query 分页查询参数
   */
  const fetchGuanLangPage = async (query) => {
    // 合并默认值与传入的查询参数
    const mergedQuery = { ...lastQuery.value, ...query }
    lastQuery.value = mergedQuery

    const res = await pageGuanLang(mergedQuery)
    // 后端返回格式：{ records: [], total: number }
    guanLangList.value = res.records || res.list || []
    total.value = res.total || 0
    lastFetchTime.value = Date.now()

    return res
  }

  /**
   * 清空缓存
   * 业务说明：新增/修改/删除后调用，强制下次进入列表页重新拉取
   */
  const clearCache = () => {
    guanLangList.value = []
    total.value = 0
    lastFetchTime.value = 0
  }

  return {
    guanLangList,
    total,
    lastQuery,
    lastFetchTime,
    fetchGuanLangPage,
    clearCache
  }
})
