<template>
  <div class="app-container">
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo">
          <el-icon :size="32" class="logo-icon"><Sunrise /></el-icon>
          <span class="logo-text">智慧照明系统</span>
        </div>
      </div>
      <el-menu
        :default-active="activeMenu"
        mode="vertical"
        class="sidebar-menu"
        background-color="#001529"
        text-color="#fff"
        active-text-color="#1890ff"
        :collapse="isCollapse"
      >
        <template v-for="menu in menuList" :key="menu.path">
          <el-sub-menu :index="menu.path">
            <template #title>
              <el-icon><component :is="menu.icon" /></el-icon>
              <span>{{ menu.name }}</span>
            </template>
            <template v-for="sub in menu.children" :key="sub.path">
              <template v-if="sub.children">
                <el-sub-menu :index="sub.path">
                  <template #title>
                    <span>{{ sub.name }}</span>
                  </template>
                  <el-menu-item
                    v-for="child in sub.children"
                    :key="child.path"
                    :index="child.path"
                    @click="handleMenuClick(child.path)"
                  >
                    {{ child.name }}
                  </el-menu-item>
                </el-sub-menu>
              </template>
              <el-menu-item
                v-else
                :index="sub.path"
                @click="handleMenuClick(sub.path)"
              >
                {{ sub.name }}
              </el-menu-item>
            </template>
          </el-sub-menu>
        </template>
      </el-menu>
      <div class="collapse-btn" @click="isCollapse = !isCollapse">
        <el-icon><component :is="isCollapse ? icons.ArrowRight : icons.ArrowLeft" /></el-icon>
      </div>
    </aside>
    <main class="main-content">
      <header class="header">
        <div class="header-left">
          <router-link to="/" class="system-title">城市智慧照明系统后台管理</router-link>
        </div>
        <div class="header-right">
          <el-dropdown>
            <span class="user-info">
              <el-icon class="user-icon"><UserFilled /></el-icon>
              <span>管理员</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人中心</el-dropdown-item>
                <el-dropdown-item>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>
      <div class="content-wrapper">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Sunrise,
  Lightning,
  Cpu,
  Grid,
  List,
  Location,
  ArrowLeft,
  ArrowRight,
  UserFilled,
  ArrowDown
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const isCollapse = ref(false)

const icons = {
  Lightbulb: Sunrise,
  Zap: Lightning,
  Server: Cpu,
  Layout: Grid,
  ClipboardList: List,
  Tunnel: Location,
  ArrowLeft,
  ArrowRight,
  User: UserFilled,
  ChevronDown: ArrowDown
}

const menuList = [
  {
    name: '智慧照明',
    path: '/lighting',
    icon: icons.Lightbulb,
    children: [
      { name: '照明策略', path: '/lighting/strategy' },
      { name: '策略管理', path: '/lighting/manage' },
      { name: '历史下发策略', path: '/lighting/history' },
      { name: '灯具管理', path: '/lighting/lamp' },
      { name: '分组管理', path: '/lighting/group' }
    ]
  },
  {
    name: '供电管理',
    path: '/power',
    icon: icons.Zap,
    children: [
      { name: '配电柜', path: '/power/distribution' },
      { name: '线路信息', path: '/power/line' },
      { name: '集控设备', path: '/power/central' },
      { name: '回路控制', path: '/power/circuit' },
      { name: '模块信息', path: '/power/module' },
      { name: '强电场景', path: '/power/strong-electric' },
      { name: '历史下发场景', path: '/power/history-scene' },
      { name: '回路分组', path: '/power/circuit-group' },
      { name: '灯控绑定', path: '/power/lamp-control-bind' }
    ]
  },
  {
    name: '设备管理',
    path: '/device',
    icon: icons.Server,
    children: [
      { name: '灯杆管理', path: '/device/lamp-post' },
      { name: '灯控管理', path: '/device/lamp-control' },
      { name: '灯具管理', path: '/device/lamp' },
      { name: '录像机', path: '/device/video-recorder' },
      { name: '摄像头', path: '/device/camera' },
      { 
        name: '传感器设备', 
        path: '/device/sensor',
        children: [
          { name: '环境传感器', path: '/device/environment-sensor' },
          { name: '光照度传感器', path: '/device/light-sensor' },
          { name: '水浸传感器', path: '/device/water-sensor' },
          { name: '烟雾传感器', path: '/device/smoke-sensor' }
        ]
      }
    ]
  },
  {
    name: '智能场景',
    path: '/scene',
    icon: icons.Layout,
    children: [
      { name: '快捷操作', path: '/scene/quick-operation' },
      { name: '场景管理', path: '/scene/manage' }
    ]
  },
  {
    name: '工单管理',
    path: '/workorder',
    icon: icons.ClipboardList,
    children: [
      { name: '工单列表', path: '/workorder/list' },
      { name: '告警自动派单', path: '/workorder/alarm-dispatch' }
    ]
  },
  {
    name: '隧道管理',
    path: '/tunnel',
    icon: icons.Tunnel,
    children: [
      { name: '隧道首页', path: '/tunnel/home' },
      { name: '隧道列表', path: '/tunnel/list' },
      { name: '区段管理', path: '/tunnel/section' },
      { name: '灯具管理', path: '/tunnel/lamp' },
      { name: '回路分组', path: '/tunnel/circuit-group' },
      { name: '配光管理', path: '/tunnel/fitting' },
      { name: '照明控制', path: '/tunnel/lighting-control' },
      { name: '时间调度', path: '/tunnel/time-schedule' }
    ]
  }
]

const activeMenu = computed(() => {
  return route.path
})

const handleMenuClick = (path) => {
  router.push(path)
}
</script>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  width: 220px;
  background: #001529;
  color: #fff;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: width 0.3s;
  
  &.collapsed {
    width: 64px;
  }
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #002140;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  color: #1890ff;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
}

.sidebar-menu {
  flex: 1;
  border-right: none;
  overflow-y: auto;
}

.sidebar-menu :deep(.el-menu-item) {
  padding: 0 20px !important;
  margin: 0 !important;
  height: 44px !important;
  line-height: 44px !important;
}

.sidebar-menu :deep(.el-sub-menu__title) {
  padding: 0 20px !important;
  margin: 0 !important;
  height: 44px !important;
  line-height: 44px !important;
}

.collapse-btn {
  position: absolute;
  right: -15px;
  top: 50%;
  transform: translateY(-50%);
  width: 30px;
  height: 30px;
  background: #001529;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #fff;
  z-index: 10;
  border: 1px solid #002140;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f0f2f5;
}

.header {
  height: 64px;
  background: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.system-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f1f1f;
  text-decoration: none;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #666;
  font-size: 14px;
}

.user-icon {
  width: 28px;
  height: 28px;
  line-height: 28px;
  background: #f0f0f0;
  border-radius: 50%;
  text-align: center;
}

.content-wrapper {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}
</style>