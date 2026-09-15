/* [软著核心代码] index.js + Vue Router 路由配置：公开路由 Login，其余需登录；路由守卫校验 Token */
import { createRouter, createWebHashHistory } from 'vue-router' // 导入 Vue Router
import ZgsqLayout from '@/layout/ZgsqLayout.vue' // 主布局组件（侧边栏 + 顶栏）

/**
 * 路由表定义
 * 业务说明：
 * - Login 是公开路由，不需要登录即可访问
 * - 其他路由都包在 ZgsqLayout 下，children 里是各业务页面
 * - meta.icon 配合侧边栏显示图标，meta.title 显示菜单名和面包屑
 */
const routes = [
  // ========== 登录页：公开路由 ==========
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/Login.vue'), // 懒加载，减少首屏体积
    meta: { title: '登录', public: true }
  },
  // ========== 主业务路由：都在 ZgsqLayout 之下 ==========
  {
    path: '/',
    component: ZgsqLayout,
    redirect: '/dashboard', // 根路径自动跳到工作台
    children: [
      // 首页工作台
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Dashboard.vue'),
        meta: { title: '首页工作台', icon: 'HomeFilled' }
      },
      // 管廊管理（列表 + 新增 + 编辑 + 详情）
      {
        path: 'guanlang',
        name: 'GuanLangIndex',
        component: () => import('@/views/guanlang/GuanLangIndex.vue'),
        meta: { title: '管廊管理', icon: 'OfficeBuilding' }
      },
      // 链路管理
      {
        path: 'lianlu',
        name: 'LianLuIndex',
        component: () => import('@/views/lianlu/LianLuIndex.vue'),
        meta: { title: '链路管理', icon: 'Connection' }
      },
      // 配光组管理
      {
        path: 'peiguang',
        name: 'PeiGuangIndex',
        component: () => import('@/views/peiguang/PeiGuangIndex.vue'),
        meta: { title: '配光组管理', icon: 'Sunny' }
      },
      // 定时调度
      {
        path: 'dingshi',
        name: 'DingShiIndex',
        component: () => import('@/views/dingshi/DingShiIndex.vue'),
        meta: { title: '定时调度', icon: 'Timer' }
      },
      // 用户管理
      {
        path: 'user',
        name: 'UserIndex',
        component: () => import('@/views/user/UserIndex.vue'),
        meta: { title: '用户管理', icon: 'User' }
      },
      // 角色管理
      {
        path: 'role',
        name: 'RoleIndex',
        component: () => import('@/views/role/RoleIndex.vue'),
        meta: { title: '角色管理', icon: 'Avatar' }
      },
      // 操作日志
      {
        path: 'oplog',
        name: 'OpLogIndex',
        component: () => import('@/views/oplog/OpLogIndex.vue'),
        meta: { title: '操作日志', icon: 'Document' }
      }
    ]
  },
  // ========== 通配符：未匹配路径跳工作台 ==========
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' }
]

// 创建 Router 实例，使用 hash 模式（适合静态部署，无需 Nginx 配置 rewrite）
const router = createRouter({
  history: createWebHashHistory(),
  routes
})

/**
 * 全局前置路由守卫
 * 业务说明：
 * - 访问公开路由（登录页）直接放行
 * - 其他页面如果没有 Token，强制跳登录
 * - 有 Token 正常放行
 */
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('ZgsqToken')

  // 目标路由是公开的，直接放行
  if (to.meta.public) {
    // 已登录用户访问登录页，自动跳回工作台
    if (token && to.name === 'Login') {
      next('/dashboard')
    } else {
      next()
    }
    return
  }

  // 非公开路由，校验 Token
  if (!token) {
    next({ path: '/login', query: { redirect: to.fullPath } }) // 记录来源，登录后可跳回
  } else {
    next()
  }
})

// 全局后置钩子：动态设置页面标题
router.afterEach((to) => {
  const title = to.meta.title || '智光云枢'
  document.title = `${title} - 智光云枢 - 城市照明物联管控平台`
})

export default router
