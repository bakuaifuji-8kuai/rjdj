<!-- [软著核心代码] ZgsqLayout.vue + 主布局：208px 深色渐变侧边栏 + 顶部面包屑/退出 + 主内容区 transition -->
<template>
  <!-- 页面整体 Flex 布局：左边侧栏，右边顶栏+主内容 -->
  <div class="zgsq-layout">
    <!-- ========== 左侧深色渐变侧边栏 ========== -->
    <aside class="zgsq-sider">
      <!-- Logo 区域 -->
      <div class="zgsq-logo">
        <span class="zgsq-logo-icon">💡</span>
        <span class="zgsq-logo-text">智光云枢</span>
      </div>

      <!-- 一级菜单：直接用 el-menu，通过 router 属性自动联动路由 -->
      <el-menu
        class="zgsq-menu"
        :default-active="activeMenu"
        background-color="transparent"
        text-color="#c2cbd6"
        active-text-color="#ffffff"
        router
      >
        <!-- 使用 v-for 渲染菜单项，便于统一管理 -->
        <el-menu-item
          v-for="item in menuList"
          :key="item.path"
          :index="item.path"
        >
          <!-- Element Plus 图标组件（已在 main.js 全局注册） -->
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </el-menu>
    </aside>

    <!-- ========== 右侧主区：顶栏 + 内容 ========== -->
    <div class="zgsq-main-wrap">
      <!-- 顶部面包屑 + 用户信息 + 退出按钮 -->
      <header class="zgsq-header">
        <!-- 面包屑：从路由 matched 里取 meta.title -->
        <el-breadcrumb separator="/">
          <el-breadcrumb-item
            v-for="(b, i) in breadcrumbs"
            :key="i"
          >{{ b }}</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 右侧操作区 -->
        <div class="zgsq-header-right">
          <!-- 显示当前登录用户的真实姓名 -->
          <span class="zgsq-welcome">
            👋 欢迎，{{ userStore.userInfo.userRealName || userStore.userInfo.userName || '管理员' }}
          </span>
          <!-- 退出按钮 -->
          <el-button type="danger" size="small" @click="handleLogoutClick">
            <el-icon><SwitchButton /></el-icon> 退出
          </el-button>
        </div>
      </header>

      <!-- 主内容区：带 transition 动画 -->
      <main class="zgsq-content">
        <router-view v-slot="{ Component }">
          <transition name="zgsq-content-fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
// ========== 导入依赖 ==========
import { computed } from 'vue'           // 计算属性
import { useRoute, useRouter } from 'vue-router' // 路由对象
import { ElMessageBox } from 'element-plus' // 二次确认弹窗
import { useUserStore } from '@/store/user' // 用户 store

// ========== 响应式对象 ==========
const route = useRoute()   // 当前路由
const router = useRouter() // 路由操作
const userStore = useUserStore() // 用户状态

// ========== 菜单项配置（集中管理，方便后续扩展） ==========
const menuList = [
  { path: '/dashboard', title: '🏠 首页工作台', icon: 'HomeFilled' },
  { path: '/guanlang',  title: '🏗️ 管廊管理',   icon: 'OfficeBuilding' },
  { path: '/lianlu',    title: '🔗 链路管理',   icon: 'Connection' },
  { path: '/peiguang',  title: '💡 配光组管理', icon: 'Sunny' },
  { path: '/dingshi',   title: '⏰ 定时调度',   icon: 'Timer' },
  { path: '/user',      title: '👤 用户管理',   icon: 'User' },
  { path: '/role',      title: '🎭 角色管理',   icon: 'Avatar' },
  { path: '/oplog',     title: '📋 操作日志',   icon: 'Document' }
]

// ========== 计算属性 ==========

/**
 * 当前激活的菜单项
 * 业务说明：匹配当前路由路径，让侧边栏高亮对应菜单
 */
const activeMenu = computed(() => route.path)

/**
 * 面包屑数据
 * 业务说明：从 route.matched 过滤出有 meta.title 的路由，组成面包屑数组
 */
const breadcrumbs = computed(() => {
  return route.matched
    .filter(r => r.meta && r.meta.title)
    .map(r => r.meta.title)
})

// ========== 事件处理 ==========

/**
 * 点击退出按钮
 * 业务说明：弹出确认框避免误点，确认后清除 store + localStorage 并跳登录页
 */
const handleLogoutClick = () => {
  ElMessageBox.confirm('确认要退出登录吗？', '提示', {
    confirmButtonText: '确认退出',
    cancelButtonText: '再想想',
    type: 'warning'
  }).then(() => {
    // 确认退出：调用 store 的 logout 清空登录态
    userStore.logout()
    router.push('/login') // 回到登录页
  }).catch(() => {
    // 用户点了取消，什么也不做
  })
}
</script>

<style scoped>
/* ====== 整体布局 ====== */
.zgsq-layout {
  display: flex;
  width: 100%;
  height: 100vh;
  background: #f0f2f5;
  overflow: hidden;
}

/* ====== 左侧深色渐变侧边栏 ====== */
.zgsq-sider {
  width: 208px;          /* 严格 208px 宽 */
  min-width: 208px;
  height: 100%;
  /* 深色渐变背景：从上到下由深蓝到深紫蓝 */
  background: linear-gradient(180deg, #1a2332 0%, #2c3e50 60%, #1f2d3d 100%);
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  position: relative;
  z-index: 10;
}

/* Logo 区域 */
.zgsq-logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.zgsq-logo-icon {
  font-size: 26px;
  filter: drop-shadow(0 0 6px rgba(255, 200, 80, 0.6));
}
.zgsq-logo-text {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 2px;
}

/* 菜单项样式微调：与深色背景融合 */
.zgsq-menu {
  flex: 1;
  border-right: none;  /* 去除 el-menu 默认右边框 */
  padding-top: 8px;
}
.zgsq-menu .el-menu-item {
  height: 48px;
  line-height: 48px;
  margin: 4px 10px;
  border-radius: 6px;
  transition: all 0.2s ease;
}
.zgsq-menu .el-menu-item:hover {
  background-color: rgba(255, 255, 255, 0.08) !important;
  color: #fff !important;
}
.zgsq-menu .el-menu-item.is-active {
  background: linear-gradient(90deg, #409eff 0%, #337ecc 100%) !important;
  color: #fff !important;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.35);
}

/* ====== 右侧主区 ====== */
.zgsq-main-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0; /* 防止 flex 子元素溢出 */
}

/* 顶部 Header */
.zgsq-header {
  height: 56px;
  background: #fff;
  border-bottom: 1px solid #e6e8eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.04);
}
.zgsq-header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}
.zgsq-welcome {
  color: #606266;
  font-size: 14px;
}

/* 主内容区 */
.zgsq-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

/* 内容切换过渡动画 */
.zgsq-content-fade-enter-active,
.zgsq-content-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.zgsq-content-fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.zgsq-content-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
