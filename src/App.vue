<!--
  智光云枢 · 主应用容器
  含侧边导航、顶栏、面包屑
-->
<template>
  <div class="zg-shell">
    <aside class="zg-shell__rail" :class="{ 'zg-shell__rail--folded': isFolded }">
      <div class="zg-brand">
        <div class="zg-brand__sigil">
          <el-icon :size="32"><Connection /></el-icon>
        </div>
        <transition name="zg-fade">
          <div v-show="!isFolded" class="zg-brand__copy">
            <div class="zg-brand__cn">智光云枢</div>
            <div class="zg-brand__en">ZhiGuangCloud Hub</div>
          </div>
        </transition>
      </div>

      <nav class="zg-railnav">
        <el-menu
          :default-active="activeEntry"
          mode="vertical"
          class="zg-railnav__menu"
          :collapse="isFolded"
          background-color="transparent"
          text-color="#cbd5e1"
          active-text-color="#ffffff"
        >
          <template v-for="entry in navList" :key="entry.path">
            <el-sub-menu :index="entry.path">
              <template #title>
                <span class="zg-railnav__glyph">
                  <el-icon :size="18"><component :is="entry.icon" /></el-icon>
                </span>
                <span class="zg-railnav__label">{{ entry.name }}</span>
              </template>
              <template v-for="leaf in entry.children" :key="leaf.path">
                <el-menu-item
                  :index="leaf.path"
                  @click="navigateTo(leaf.path)"
                >
                  {{ leaf.name }}
                </el-menu-item>
              </template>
            </el-sub-menu>
          </template>
        </el-menu>
      </nav>

      <div class="zg-foldtoggle" @click="isFolded = !isFolded">
        <el-icon :size="16">
          <component :is="isFolded ? ArrowRight : ArrowLeft" />
        </el-icon>
      </div>
    </aside>

    <main class="zg-shell__stage">
      <header class="zg-topbar">
        <div class="zg-topbar__lead">
          <div class="zg-topbar__sigil">ZGH</div>
          <div class="zg-topbar__copy">
            <div class="zg-topbar__title">智光云枢 · 城市照明物联管控平台</div>
            <div class="zg-topbar__hint">
              <span class="zg-pulse"></span>
              中枢在线 · {{ todayLabel }} · {{ onlineNodeCount }} 节点在网
            </div>
          </div>
        </div>
        <div class="zg-topbar__trail">
          <el-badge :value="3" class="zg-bell">
            <el-icon :size="18"><Bell /></el-icon>
          </el-badge>
          <el-dropdown>
            <span class="zg-profile">
              <span class="zg-profile__avatar">运</span>
              <span class="zg-profile__name">运维员</span>
              <el-icon :size="14"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="onProfile">个人中心</el-dropdown-item>
                <el-dropdown-item divided @click="onLogout">退出中枢</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <section class="zg-canvas">
        <router-view v-slot="{ Component }">
          <transition name="zg-routefade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </section>
    </main>
  </div>
</template>

<script setup>
/**
 * 智光云枢-主应用容器组件
 * 含侧边导航、顶栏、用户菜单
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Connection,
  Coin,
  Histogram,
  MagicStick,
  Tickets,
  Guide,
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  Bell
} from '@element-plus/icons-vue'
import { ElMessage as Toast } from 'element-plus'

const route = useRoute()
const router = useRouter()
const isFolded = ref(false)

const onlineNodeCount = ref(2184)

// 时间脉冲
const nowTick = ref(Date.now())
let tickTimer = null
const todayLabel = computed(() => {
  const d = new Date(nowTick.value)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
})

// 业务域导航（新）
const navList = [
  {
    name: '灯网态势',
    path: '/lampNet',
    icon: Connection,
    children: [
      { name: '灯网驾驶舱', path: '/lampNet/dashboard' },
      { name: '光照处方编排', path: '/lampNet/recipe-composer' },
      { name: '处方库管理', path: '/lampNet/recipe-vault' },
      { name: '历史处方', path: '/lampNet/recipe-archive' },
      { name: '光源台账', path: '/lampNet/lamp-registry' },
      { name: '集群拓扑', path: '/lampNet/cluster-topology' },
      { name: 'GIS灯位图', path: '/lampNet/gis-atlas' }
    ]
  },
  {
    name: '能源脉动',
    path: '/energyPulse',
    icon: Coin,
    children: [
      { name: '馈电柜监测', path: '/energyPulse/feedCabinet' },
      { name: '供电链路', path: '/energyPulse/lineTrace' },
      { name: '边缘主机', path: '/energyPulse/edgeHost' },
      { name: '链路通断', path: '/energyPulse/loopSwitch' },
      { name: '负荷探针', path: '/energyPulse/loadProber' },
      { name: '模块台账', path: '/energyPulse/moduleLedger' },
      { name: '强电情景', path: '/energyPulse/strongScene' },
      { name: '强电情景回溯', path: '/energyPulse/strongSceneArchive' },
      { name: '链路分组', path: '/energyPulse/loopCluster' },
      { name: '光源绑定', path: '/energyPulse/lampBinding' }
    ]
  },
  {
    name: '终端图谱',
    path: '/terminalAtlas',
    icon: Histogram,
    children: [
      { name: '杆塔位点', path: '/terminalAtlas/poleCatalog' },
      { name: '光源控制器', path: '/terminalAtlas/lampControl' },
      { name: '灯具清单', path: '/terminalAtlas/fixtureList' },
      { name: '视频记录仪', path: '/terminalAtlas/recorder' },
      { name: '视频采集', path: '/terminalAtlas/camera' },
      { name: '环境探针', path: '/terminalAtlas/envProbe' },
      { name: '照度探针', path: '/terminalAtlas/luminanceProbe' },
      { name: '浸水探针', path: '/terminalAtlas/waterProbe' },
      { name: '烟感探针', path: '/terminalAtlas/smokeProbe' }
    ]
  },
  {
    name: '情景编排',
    path: '/scenarioOrch',
    icon: MagicStick,
    children: [
      { name: '预案控制台', path: '/scenarioOrch/presetConsole' },
      { name: '预案库', path: '/scenarioOrch/presetLibrary' },
      { name: '预案联动', path: '/scenarioOrch/presetLinkage' },
      { name: '联动管理', path: '/scenarioOrch/linkageManager' },
      { name: '预案模板', path: '/scenarioOrch/presetTemplate' },
      { name: '触发器', path: '/scenarioOrch/presetTrigger' },
      { name: '时间编排', path: '/scenarioOrch/presetSchedule' }
    ]
  },
  {
    name: '运维工单',
    path: '/opsTicket',
    icon: Tickets,
    children: [
      { name: '调度池', path: '/opsTicket/dispatchPool' },
      { name: '新建处置单', path: '/opsTicket/ticketCreate' },
      { name: '处置单详情', path: '/opsTicket/ticketDetail/1' },
      { name: '告警自动调度', path: '/opsTicket/autoDispatch' },
      { name: '我的工位', path: '/opsTicket/myDesk' },
      { name: '效能看板', path: '/opsTicket/statBoard' }
    ]
  },
  {
    name: '管廊照明',
    path: '/tubeLumen',
    icon: Guide,
    children: [
      { name: '管廊门户', path: '/tubeLumen/portal' },
      { name: '管廊索引', path: '/tubeLumen/tubeIndex' },
      { name: '区段管理', path: '/tubeLumen/sectionManager' },
      { name: '管廊灯具', path: '/tubeLumen/fixtureLedger' },
      { name: '管廊链路', path: '/tubeLumen/loopCluster' },
      { name: '配光管理', path: '/tubeLumen/opticsManager' },
      { name: '光通控制', path: '/tubeLumen/lumenControl' },
      { name: '定时调度', path: '/tubeLumen/cronScheduler' }
    ]
  }
]

const activeEntry = computed(() => route.path)

// 路由跳转（带业务封装：路由切换时记录访问审计）
const navigateTo = (path) => {
  // 业务封装：路由切换前记录访问审计
  // 实际项目应调用 auditApi.recordVisit()
  router.push(path).catch(() => {
    // 重复路由不报错
  })
}

const onProfile = () => {
  Toast.info('个人中心建设中')
}
const onLogout = () => {
  Toast.success('已退出中枢')
}

onMounted(() => {
  tickTimer = setInterval(() => {
    nowTick.value = Date.now()
  }, 60_000)
})

onUnmounted(() => {
  if (tickTimer) clearInterval(tickTimer)
})
</script>

<style scoped lang="scss">
/* =============================================================
 * 智光云枢-主壳样式
 * 视觉规范：深青侧栏 + 浅色主体 + 极简信息层级
 * ============================================================ */

.zg-shell {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: #f0fdfa;

  /* ---------- 侧栏 ---------- */
  &__rail {
    width: 244px;
    background: linear-gradient(180deg, #0c4a6e 0%, #082f49 60%, #052033 100%);
    color: #cbd5e1;
    display: flex;
    flex-direction: column;
    position: relative;
    transition: width 0.3s ease;
    flex-shrink: 0;
    box-shadow: 4px 0 16px -8px rgba(8, 47, 73, 0.4);

    &--folded { width: 64px; }
  }

  &__stage {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
}

/* ---------- 品牌区 ---------- */
.zg-brand {
  padding: 20px 18px 18px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(148, 197, 230, 0.08);

  &__sigil {
    width: 42px; height: 42px;
    border-radius: 12px;
    background: linear-gradient(135deg, #0891b2, #06b6d4);
    color: #ffffff;
    display: grid; place-items: center;
    box-shadow: 0 4px 14px -2px rgba(8, 145, 178, 0.6);
  }
  &__cn { font-size: 16px; font-weight: 600; color: #f0f9ff; letter-spacing: 1px; }
  &__en { font-size: 10px; color: #67e8f9; letter-spacing: 0.5px; margin-top: 2px; }
}

/* ---------- 侧栏导航 ---------- */
.zg-railnav {
  flex: 1;
  overflow-y: auto;
  padding: 12px 10px;

  &__menu {
    border-right: none !important;

    :deep(.el-sub-menu__title),
    :deep(.el-menu-item) {
      border-radius: 10px !important;
      margin: 3px 6px !important;
      height: 42px !important;
      line-height: 42px !important;
      padding: 0 14px !important;
      transition: all 0.25s ease;
      color: #cbd5e1 !important;
      font-weight: 500;
      font-size: 13px;
    }
    :deep(.el-sub-menu__title:hover),
    :deep(.el-menu-item:hover) {
      background: rgba(8, 145, 178, 0.18) !important;
      color: #ffffff !important;
    }
    :deep(.el-menu-item.is-active) {
      background: linear-gradient(90deg, #0891b2, #06b6d4) !important;
      color: #ffffff !important;
      box-shadow: 0 4px 12px -2px rgba(8, 145, 178, 0.4);
    }
    :deep(.el-sub-menu .el-menu-item) {
      padding-left: 38px !important;
      font-size: 12px;
      height: 36px !important;
      line-height: 36px !important;
    }
  }
  &__glyph {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px; height: 22px;
    margin-right: 8px;
  }
  &__label { letter-spacing: 0.5px; }
}

/* ---------- 折叠按钮 ---------- */
.zg-foldtoggle {
  position: absolute;
  right: -14px; top: 64px;
  width: 28px; height: 28px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
  display: grid; place-items: center;
  cursor: pointer;
  color: #0e7490;
  z-index: 10;
  border: 1px solid #cffafe;
  transition: all 0.2s;
  &:hover { color: #0891b2; transform: scale(1.05); }
}

/* ---------- 顶栏 ---------- */
.zg-topbar {
  height: 64px;
  background: #ffffff;
  border-bottom: 1px solid #e0f7fa;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  flex-shrink: 0;

  &__lead { display: flex; align-items: center; gap: 14px; }
  &__sigil {
    width: 40px; height: 40px;
    border-radius: 10px;
    background: linear-gradient(135deg, #0891b2, #06b6d4);
    color: #ffffff;
    display: grid; place-items: center;
    font-size: 13px; font-weight: 700;
    letter-spacing: 1px;
  }
  &__title { font-size: 15px; font-weight: 600; color: #0f172a; }
  &__hint { font-size: 12px; color: #64748b; display: flex; align-items: center; gap: 6px; margin-top: 2px; }
  &__trail { display: flex; align-items: center; gap: 20px; }
}

.zg-pulse {
  display: inline-block;
  width: 8px; height: 8px;
  border-radius: 50%;
  background: #10b981;
  position: relative;
  &::after {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: 50%;
    background: #10b981;
    opacity: 0.4;
    animation: zg-pulse 1.6s ease-out infinite;
  }
}

@keyframes zg-pulse {
  0% { transform: scale(0.6); opacity: 0.6; }
  100% { transform: scale(2.2); opacity: 0; }
}

.zg-bell {
  cursor: pointer;
  color: #475569;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s;
  &:hover { background: #ecfeff; color: #0891b2; }
}

.zg-profile {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 8px;
  transition: all 0.2s;
  &:hover { background: #ecfeff; }
  &__avatar {
    width: 30px; height: 30px;
    border-radius: 50%;
    background: linear-gradient(135deg, #0891b2, #06b6d4);
    color: #ffffff;
    display: grid; place-items: center;
    font-size: 13px; font-weight: 600;
  }
  &__name { font-size: 13px; color: #334155; }
}

/* ---------- 路由画布 ---------- */
.zg-canvas {
  flex: 1;
  overflow-y: auto;
  background: #f0fdfa;
}

/* ---------- 过渡 ---------- */
.zg-fade-enter-active, .zg-fade-leave-active { transition: opacity 0.2s ease; }
.zg-fade-enter-from, .zg-fade-leave-to { opacity: 0; }

.zg-routefade-enter-active, .zg-routefade-leave-active { transition: all 0.28s ease; }
.zg-routefade-enter-from { opacity: 0; transform: translateY(6px); }
.zg-routefade-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
