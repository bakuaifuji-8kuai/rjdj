/* [软著核心代码] user.js + 用户状态 Store：登录态、Token、用户信息，持久化到 localStorage */
import { defineStore } from 'pinia' // Pinia 定义 store 的方法
import { ref } from 'vue'           // 使用 ref 创建响应式状态
import * as userApi from '@/api/user' // 导入用户相关接口

/**
 * userStore 定义
 * 业务说明：维护全局登录态、Token、当前登录用户的基本信息
 * 采用 Composition API 风格（setup 函数形式），比 Options 风格更灵活
 */
export const useUserStore = defineStore('user', () => {
  // ====== 状态 ======
  // 是否已登录（刷新后从 localStorage 恢复）
  const isLoggedIn = ref(!!localStorage.getItem('ZgsqToken'))

  // JWT Token，API 请求时放入 Header
  const token = ref(localStorage.getItem('ZgsqToken') || '')

  // 当前登录用户的基本信息对象
  const userInfo = ref({
    userId: null,          // 用户主键
    userName: '',          // 登录账号
    userRealName: '',      // 真实姓名
    roleName: ''           // 所属角色名
  })

  // 刷新时尝试从 localStorage 恢复 userInfo
  const savedInfo = localStorage.getItem('ZgsqUserInfo')
  if (savedInfo) {
    try {
      userInfo.value = JSON.parse(savedInfo)
    } catch (e) {
      // 忽略 JSON 解析异常
    }
  }

  // ====== Actions ======

  /**
   * 用户登录
   * 业务说明：调用后端登录接口，成功后把 Token 和用户信息写入 localStorage + store
   * @param {Object} payload { userName, password }
   */
  const login = async (payload) => {
    const res = await userApi.login(payload)
    // 后端返回格式：{ token, userInfo }
    setToken(res.token)
    setUserInfo(res.userInfo)
    isLoggedIn.value = true
    return res
  }

  /**
   * 用户登出
   * 业务说明：清除 store 状态 + 清除 localStorage，下次必须重新登录
   */
  const logout = () => {
    token.value = ''
    isLoggedIn.value = false
    userInfo.value = { userId: null, userName: '', userRealName: '', roleName: '' }
    localStorage.removeItem('ZgsqToken')
    localStorage.removeItem('ZgsqUserInfo')
  }

  /**
   * 设置 Token（同时写入 localStorage 做持久化）
   * @param {string} val JWT 字符串
   */
  const setToken = (val) => {
    token.value = val
    localStorage.setItem('ZgsqToken', val)
  }

  /**
   * 设置用户信息对象（同时写入 localStorage 做持久化）
   * @param {Object} info { userId, userName, userRealName, roleName }
   */
  const setUserInfo = (info) => {
    userInfo.value = { ...userInfo.value, ...info }
    localStorage.setItem('ZgsqUserInfo', JSON.stringify(userInfo.value))
  }

  // 对外暴露状态和 actions
  return {
    isLoggedIn,
    token,
    userInfo,
    login,
    logout,
    setToken,
    setUserInfo
  }
})
