<template>
  <div class="app-container">
    <aside class="sidebar" :class="{ collapsed: isCollapse }">
      <div class="sidebar-header">
        <div class="logo">
          <div class="logo-icon-wrapper animate-pulse-glow">
            <el-icon :size="36"><Sunrise /></el-icon>
          </div>
          <span class="logo-text" v-show="!isCollapse">智慧照明系统</span>
        </div>
      </div>
      <div class="sidebar-decoration"></div>
      <el-menu
        :default-active="activeMenu"
        mode="vertical"
        class="sidebar-menu"
        :collapse="isCollapse"
        :background-color="isCollapse ? '#0a1929' : '#0a1929'"
        text-color="#94a3b8"
        active-text-color="#00d4ff"
      >
        <template v-for="menu in menuList" :key="menu.path">
          <el-sub-menu :index="menu.path">
            <template #title>
              <div class="menu-icon-wrapper">
                <el-icon :size="20"><component :is="menu.icon" /></el-icon>
                <span class="icon-glow"></span>
              </div>
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
        <el-icon :size="18"><component :is="isCollapse ? icons.ArrowRight : icons.ArrowLeft" /></el-icon>
      </div>
    </aside>
    <main class="main-content">
      <header class="header">
        <div class="header-left">
          <div class="system-info">
            <span class="system-title">城市智慧照明系统后台管理</span>
            <span class="system-status">
              <span class="status-dot"></span>
              系统运行中
            </span>
          </div>
        </div>
        <div class="header-right">
          <div class="header-notifications">
            <el-badge :value="3" class="notification-badge">
              <el-icon class="notification-icon"><Bell /></el-icon>
            </el-badge>
          </div>
          <el-dropdown>
            <span class="user-info">
              <div class="user-avatar">
                <el-icon :size="20"><UserFilled /></el-icon>
              </div>
              <span>管理员</span>
              <el-icon :size="14"><ArrowDown /></el-icon>
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
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
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
  ArrowDown,
  Bell
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
  background: #0d1b2a;
}

.sidebar {
  width: 240px;
  background: linear-gradient(180deg, #0a1929 0%, #0d1b2a 100%);
  color: #e8e8e8;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: width 0.3s ease;
  border-right: 1px solid rgba(0, 212, 255, 0.1);
  z-index: 100;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.5), transparent);
  }
  
  &.collapsed {
    width: 64px;
    
    .logo-text {
      display: none;
    }
    
    .sidebar-header {
      padding: 16px;
    }
    
    .logo {
      justify-content: center;
    }
  }
}

.sidebar-decoration {
  position: absolute;
  top: 100px;
  right: 0;
  width: 2px;
  height: 200px;
  background: linear-gradient(180deg, transparent, rgba(0, 212, 255, 0.3), transparent);
  opacity: 0.5;
}

.sidebar-header {
  padding: 24px;
  border-bottom: 1px solid rgba(0, 212, 255, 0.1);
  position: relative;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon-wrapper {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(124, 58, 237, 0.2));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(0, 212, 255, 0.3);
  color: #00d4ff;
  
  :deep(.el-icon) {
    filter: drop-shadow(0 0 10px rgba(0, 212, 255, 0.5));
  }
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  background: linear-gradient(135deg, #00d4ff, #7c3aed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
}

.sidebar-menu {
  flex: 1;
  border-right: none;
  overflow-y: auto;
  padding: 10px 0;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 212, 255, 0.3);
    border-radius: 2px;
  }
}

.menu-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .icon-glow {
    position: absolute;
    width: 24px;
    height: 24px;
    background: rgba(0, 212, 255, 0.1);
    border-radius: 50%;
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  &:hover .icon-glow,
  &.is-active .icon-glow {
    opacity: 1;
  }
}

.sidebar-menu :deep(.el-menu-item),
.sidebar-menu :deep(.el-sub-menu__title) {
  padding: 0 24px !important;
  margin: 4px 8px !important;
  height: 44px !important;
  line-height: 44px !important;
  border-radius: 8px;
  transition: all 0.3s ease;
  color: #94a3b8;
  
  &:hover {
    background: rgba(0, 212, 255, 0.1) !important;
    color: #00d4ff;
  }
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(124, 58, 237, 0.1)) !important;
  color: #00d4ff;
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.2);
}

.sidebar-menu :deep(.el-sub-menu__title) {
  margin-bottom: 4px !important;
  
  .el-sub-menu__icon-arrow {
    color: #64748b;
  }
}

.collapse-btn {
  position: absolute;
  right: -15px;
  top: 200px;
  transform: translateY(-50%);
  width: 30px;
  height: 30px;
  background: linear-gradient(135deg, #0a1929, #1b2838);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #00d4ff;
  z-index: 10;
  border: 1px solid rgba(0, 212, 255, 0.3);
  box-shadow: 0 0 15px rgba(0, 212, 255, 0.3);
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, #00d4ff, #7c3aed);
    color: #fff;
    transform: translateY(-50%) scale(1.1);
    box-shadow: 0 0 25px rgba(0, 212, 255, 0.5);
  }
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #0d1b2a;
  overflow: hidden;
}

.header {
  height: 72px;
  background: linear-gradient(180deg, #0a1929 0%, #0d1b2a 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  border-bottom: 1px solid rgba(0, 212, 255, 0.1);
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.3), transparent);
  }
}

.header-left {
  display: flex;
  align-items: center;
}

.system-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.system-title {
  font-size: 18px;
  font-weight: 700;
  background: linear-gradient(135deg, #00d4ff, #7c3aed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.system-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #00ff88;
  
  .status-dot {
    width: 8px;
    height: 8px;
    background: #00ff88;
    border-radius: 50%;
    animation: pulse-glow 2s ease-in-out infinite;
    box-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
  }
}

@keyframes pulse-glow {
  0%, 100% {
    opacity: 1;
    box-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
  }
  50% {
    opacity: 0.6;
    box-shadow: 0 0 20px rgba(0, 255, 136, 0.8);
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 24px;
}

.header-notifications {
  position: relative;
}

.notification-icon {
  font-size: 20px;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    color: #00d4ff;
    transform: scale(1.1);
  }
}

.notification-badge {
  :deep(.el-badge__content) {
    background: linear-gradient(135deg, #ff4757, #ff6b81);
    border: 1px solid #0d1b2a;
    box-shadow: 0 0 10px rgba(255, 71, 87, 0.5);
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  color: #94a3b8;
  font-size: 14px;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(0, 212, 255, 0.1);
    color: #00d4ff;
  }
}

.user-avatar {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.3), rgba(124, 58, 237, 0.3));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(0, 212, 255, 0.3);
  color: #00d4ff;
}

.content-wrapper {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 212, 255, 0.3);
    border-radius: 3px;
    
    &:hover {
      background: rgba(0, 212, 255, 0.5);
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
