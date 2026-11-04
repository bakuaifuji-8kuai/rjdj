/**
 * 智光云枢 · 用户认证状态管理
 * 业务域：auth
 * 功能：管理用户登录状态、Token、权限等
 * @module shared/stores/authStore
 * @author 智光云枢研发团队
 */
import { reactive, computed } from 'vue'

const STORAGE_KEY = 'zhiguang_auth'

// 状态（全局单例，所有组件共享同一份）
const state = reactive({
  isLoggedIn: false,
  user: null,
  token: null
})

// 计算属性
const isLoggedIn = computed(() => state.isLoggedIn)
const currentUser = computed(() => state.user)
const token = computed(() => state.token)

// 用于非 setup 环境（如路由守卫）获取原始布尔值

/**
 * 从本地存储恢复认证状态
 */
const restoreAuth = () => {
  try {
    // 优先从 localStorage 恢复，其次 sessionStorage
    const stored = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY)
    if (stored) {
      const auth = JSON.parse(stored)
      // 验证 token 格式，确保是新登录系统生成的 token
      if (auth.token && auth.token.startsWith('token_')) {
        state.isLoggedIn = true
        state.user = auth.user
        state.token = auth.token
      } else {
        // 旧的认证数据，清除掉强制重新登录
        logout()
      }
    }
  } catch (error) {
    console.error('恢复认证状态失败:', error)
    logout()
  }
}

/**
 * 用户登录
 * @param {Object} credentials 登录凭证 { username, password, remember }
 * @returns {boolean} 登录是否成功
 */
const login = (credentials) => {
  // 模拟用户验证（实际项目中应调用后端 API）
  const validUsers = [
    { username: 'admin', password: 'admin123', name: '系统管理员', avatar: '管' },
    { username: 'operator', password: 'operator123', name: '运维人员', avatar: '运' },
    { username: 'guest', password: 'guest123', name: '访客用户', avatar: '访' }
  ]

  const user = validUsers.find(
    u => u.username === credentials.username && u.password === credentials.password
  )

  if (user) {
    state.isLoggedIn = true
    state.user = {
      username: user.username,
      name: user.name,
      avatar: user.avatar
    }
    state.token = `token_${Date.now()}_${Math.random().toString(36).substr(2)}`

    // 存储到本地
    const data = JSON.stringify({ user: state.user, token: state.token })
    if (credentials.remember) {
      localStorage.setItem(STORAGE_KEY, data)
      sessionStorage.removeItem(STORAGE_KEY)
    } else {
      sessionStorage.setItem(STORAGE_KEY, data)
      localStorage.removeItem(STORAGE_KEY)
    }

    return true
  }

  return false
}

/**
 * 用户登出
 */
const logout = () => {
  state.isLoggedIn = false
  state.user = null
  state.token = null
  localStorage.removeItem(STORAGE_KEY)
  sessionStorage.removeItem(STORAGE_KEY)
}

/**
 * 检查是否已登录
 */
const checkAuth = () => {
  if (!state.isLoggedIn) {
    restoreAuth()
  }
  return state.isLoggedIn
}

// 初始化时恢复认证状态
restoreAuth()

// 导出单例对象（useAuthStore 和 getAuthStore 返回同一个对象）
const store = {
  isLoggedIn,
  currentUser,
  token,
  login,
  logout,
  checkAuth,
  restoreAuth
}

export const useAuthStore = () => store
export const getAuthStore = () => store
export const isAuthenticated = () => state.isLoggedIn
