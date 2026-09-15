/* [软著核心代码] request.js + Axios 请求封装：拦截器统一加 Token、处理 401 跳登录、业务错误 ElMessage 提示 */
import axios from 'axios'          // 导入 axios 库
import { ElMessage } from 'element-plus' // 导入 Element Plus 消息提示
import router from '@/router'      // 导入路由，用于 401 时跳登录

// 创建独立的 axios 实例，避免污染全局默认配置
const ZgsqAxios = axios.create({
  baseURL: '/api',          // 所有请求默认带 /api 前缀，由 vite proxy 转发
  timeout: 15000,           // 请求超时时间 15 秒
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

/**
 * 获取本地存储中的 Token
 * 业务说明：用户登录成功后后端签发 JWT，前端存储到 localStorage，请求时放到 Header
 * @returns {string|null} Token 字符串或 null
 */
const getZgsqToken = () => {
  return localStorage.getItem('ZgsqToken') || ''
}

/**
 * 清除登录态：删除 Token 并跳转到登录页
 * 业务说明：401 或主动退出时调用
 */
const clearZgsqAuth = () => {
  localStorage.removeItem('ZgsqToken')
  localStorage.removeItem('ZgsqUserInfo')
  router.push('/login').catch(() => {}) // 忽略重复跳转的错误
}

// ========== 请求拦截器 ==========
// 在每个请求发出前，统一在 Header 里注入 X-Zgsq-Token
ZgsqAxios.interceptors.request.use(
  (config) => {
    // 从 localStorage 取 token，放入自定义请求头
    const token = getZgsqToken()
    if (token) {
      config.headers['X-Zgsq-Token'] = token
    }
    return config
  },
  (error) => {
    // 请求本身的错误（极少发生）
    return Promise.reject(error)
  }
)

// ========== 响应拦截器 ==========
// 统一处理 HTTP 错误码、业务错误码、401 过期
ZgsqAxios.interceptors.response.use(
  (response) => {
    // 后端约定：{ code: 200, data: {...}, msg: 'ok' }
    const res = response.data

    // 未登录或 Token 过期
    if (res.code === 401) {
      ElMessage.error('登录已过期，请重新登录')
      clearZgsqAuth()
      return Promise.reject(new Error(res.msg || '未授权'))
    }

    // 后端业务错误码非 200
    if (res.code !== 200) {
      ElMessage.error(res.msg || '请求失败')
      return Promise.reject(new Error(res.msg || '业务错误'))
    }

    // 成功：返回 data 字段给业务层
    return res.data
  },
  (error) => {
    // HTTP 层错误（网络断开、500、404 等）
    if (error.response) {
      const status = error.response.status
      if (status === 401) {
        ElMessage.error('登录已过期，请重新登录')
        clearZgsqAuth()
      } else if (status === 403) {
        ElMessage.error('没有权限访问该资源')
      } else if (status === 404) {
        ElMessage.error('请求的接口不存在')
      } else if (status >= 500) {
        ElMessage.error('服务器内部错误，请联系管理员')
      } else {
        ElMessage.error(error.response.data?.msg || '请求失败')
      }
    } else {
      // 无响应：网络异常或超时
      ElMessage.error('网络连接异常，请检查网络')
    }
    return Promise.reject(error)
  }
)

// 导出封装好的 axios 实例，业务模块统一从这里导入
export default ZgsqAxios
