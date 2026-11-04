<!--
  智光云枢 · 主应用容器
  含侧边导航、顶栏、面包屑
-->
<template>
  <div class="zg-shell">
    <template v-if="isLoggedIn">
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
                <span class="zg-profile__avatar">{{ authStore.currentUser.value?.avatar || '?' }}</span>
                <span class="zg-profile__name">{{ authStore.currentUser.value?.name || '未知用户' }}</span>
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
    </template>
    <template v-else>
      <div class="zg-shell__full">
        <router-view v-slot="{ Component }">
          <transition name="zg-routefade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </template>
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
  Bell,
  ReadingLamp,
  Grid,
  Position,
  Monitor,
  Lock,
  Iphone,
  WindPower,
  Platform,
  House,
  User,
  Sunny,
  Service,
  Cpu,
  Goods,
  Warning,
  Files,
  Timer,
  Lightning
} from '@element-plus/icons-vue'
import { ElMessage as Toast } from 'element-plus'
import { getAuthStore, isAuthenticated } from '@/shared/stores/authStore'

const route = useRoute()
const router = useRouter()
const isFolded = ref(false)

const authStore = getAuthStore()

const isLoggedIn = computed(() => authStore.isLoggedIn.value)

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
    name: '灯网监控',
    path: '/lampNet',
    icon: Connection,
    children: [
      { name: '灯网总览', path: '/lampNet/dashboard' },
      { name: '光照策略编排', path: '/lampNet/recipe-composer' },
      { name: '策略库管理', path: '/lampNet/recipe-vault' },
      { name: '历史策略', path: '/lampNet/recipe-archive' },
      { name: '光源台账', path: '/lampNet/lamp-registry' },
      { name: '集群拓扑', path: '/lampNet/cluster-topology' },
      { name: 'GIS灯位图', path: '/lampNet/gis-atlas' }
    ]
  },
  {
    name: '能耗监测',
    path: '/energyPulse',
    icon: Coin,
    children: [
      { name: '馈电柜监测', path: '/energyPulse/feedCabinet' },
      { name: '供电链路', path: '/energyPulse/lineTrace' },
      { name: '边缘主机', path: '/energyPulse/edgeHost' },
      { name: '通断监测', path: '/energyPulse/loopSwitch' },
      { name: '负荷监测', path: '/energyPulse/loadProber' },
      { name: '模块台账', path: '/energyPulse/moduleLedger' },
      { name: '强电场景', path: '/energyPulse/strongScene' },
      { name: '强电场景回溯', path: '/energyPulse/strongSceneArchive' },
      { name: '链路分组', path: '/energyPulse/loopCluster' },
      { name: '光源绑定', path: '/energyPulse/lampBinding' }
    ]
  },
  {
    name: '终端管理',
    path: '/terminalAtlas',
    icon: Histogram,
    children: [
      { name: '杆塔台账', path: '/terminalAtlas/poleCatalog' },
      { name: '光源控制器', path: '/terminalAtlas/lampControl' },
      { name: '灯具清单', path: '/terminalAtlas/fixtureList' },
      { name: '视频记录仪', path: '/terminalAtlas/recorder' },
      { name: '视频采集', path: '/terminalAtlas/camera' },
      { name: '环境监测', path: '/terminalAtlas/envProbe' },
      { name: '照度监测', path: '/terminalAtlas/luminanceProbe' },
      { name: '浸水监测', path: '/terminalAtlas/waterProbe' },
      { name: '烟感监测', path: '/terminalAtlas/smokeProbe' }
    ]
  },
  {
    name: '情景管理',
    path: '/scenarioOrch',
    icon: MagicStick,
    children: [
      { name: '快捷操作', path: '/scenarioOrch/quickOperation' },
      { name: '场景联动', path: '/scenarioOrch/sceneLinkage' }
    ]
  },
  {
    name: '运维工单',
    path: '/opsTicket',
    icon: Tickets,
    children: [
      { name: '工单池', path: '/opsTicket/dispatchPool' },
      { name: '自动派单', path: '/opsTicket/autoDispatch' },
      { name: '我的工单', path: '/opsTicket/myDesk' },
      { name: '效能看板', path: '/opsTicket/statBoard' }
    ]
  },
  {
    name: '管廊照明',
    path: '/tubeLumen',
    icon: Guide,
    children: [
      { name: '管廊总览', path: '/tubeLumen/portal' },
      { name: '管廊列表', path: '/tubeLumen/tubeIndex' },
      { name: '区段管理', path: '/tubeLumen/sectionManager' },
      { name: '管廊灯具', path: '/tubeLumen/fixtureLedger' },
      { name: '管廊链路', path: '/tubeLumen/loopCluster' },
      { name: '配光管理', path: '/tubeLumen/opticsManager' },
      { name: '光通控制', path: '/tubeLumen/lumenControl' },
      { name: '定时调度', path: '/tubeLumen/cronScheduler' }
    ]
  },
  {
    name: '杆桩运营',
    path: '/poleBiz',
    icon: Grid,
    children: [
      { name: '扫码共享用电', path: '/poleBiz/sharedPower' },
      { name: '共享用电订单中心', path: '/poleBiz/powerOrder' },
      { name: '企业客户中心', path: '/poleBiz/powerEnterprise' },
      { name: '共享用电实时监控', path: '/poleBiz/powerMonitor' },
      { name: '充电桩管理', path: '/poleBiz/chargingPile' },
      { name: '5G 微基站站址', path: '/poleBiz/gBaseTower' },
      { name: '信息屏广告排期', path: '/poleBiz/adSchedule' }
    ]
  },
  {
    name: '隧道增强',
    path: '/tunnelPlus',
    icon: ReadingLamp,
    children: [
      { name: '灯随车亮', path: '/tunnelPlus/followLight' }
    ]
  },
  // ========== Phase 1 新增业务域 ==========
  {
    name: '指挥中心',
    path: '/commandCenter',
    icon: Monitor,
    children: [
      { name: '数据大屏', path: '/commandCenter/overview' }
    ]
  },
  {
    name: '智能安防',
    path: '/security',
    icon: Lock,
    children: [
      { name: '安防总览', path: '/security/overview' },
      { name: '井盖防偷', path: '/security/manhole' },
      { name: 'AI 周界防护', path: '/security/perimeter' },
      { name: '应急对讲 SOS', path: '/security/sos' }
    ]
  },
  {
    name: '移动端运维',
    path: '/mobile',
    icon: Iphone,
    children: [
      { name: '运维助手首页', path: '/mobile/home' }
    ]
  },
  {
    name: '低空经济',
    path: '/lowAltitude',
    icon: WindPower,
    children: [
      { name: '无人机机队', path: '/lowAltitude/drone' },
      { name: '停机坪站址', path: '/lowAltitude/vertiport' },
      { name: '飞行计划与空域', path: '/lowAltitude/flightPlan' }
    ]
  },
  {
    name: '数字孪生',
    path: '/digitalTwin',
    icon: Platform,
    children: [
      { name: '城市 3D 孪生', path: '/digitalTwin/city' },
      { name: '灯杆构件级孪生', path: '/digitalTwin/structure' },
      { name: '光照推演模拟器', path: '/digitalTwin/simulate' },
      { name: '数字孪生大屏', path: '/digitalTwin/matrix' },
      { name: '元数起航引擎接入', path: '/digitalTwin/adapter' }
    ]
  },
  // ========== Phase 2 新增业务域 ==========
  {
    name: 'AI 视觉分析',
    path: '/aiVision',
    icon: Cpu,
    children: [
      { name: 'AI 分析总览', path: '/aiVision/overview' },
      { name: '灯杆倾斜/倒塌', path: '/aiVision/garbageOverflow' },
      { name: '灯具故障检测', path: '/aiVision/pavementDefect' },
      { name: '配电箱/杆身安全', path: '/aiVision/occupation' },
      { name: '照明效果验收', path: '/aiVision/lightingAcceptance' }
    ]
  },
  {
    name: '智能运维 Copilot',
    path: '/aiOps',
    icon: Service,
    children: [
      { name: 'AI 运维助手', path: '/aiOps/copilot' }
    ]
  },
  {
    name: '环境气象站',
    path: '/envProbe',
    icon: Sunny,
    children: [
      { name: '气象站与空气质量', path: '/envProbe/weatherStation' }
    ]
  },
  {
    name: '开放平台',
    path: '/openApi',
    icon: Connection,
    children: [
      { name: '开放 API 网关', path: '/openApi/gateway' },
      { name: '场景可视化编排', path: '/scenarioOrch/visualFlow' }
    ]
  },
  // ========== v3 公司内部核心 ==========
  { name: '固定资产', path: '/assetManage', icon: House, children: [
    { name: '资产总台账', path: '/assetManage/ledger' },
    { name: '资产盘点', path: '/assetManage/check' },
    { name: '折旧中心', path: '/assetManage/depreciation' },
    { name: '报废与回收', path: '/assetManage/scrap' } ] },
  { name: '运维组织', path: '/opsOrg', icon: User, children: [
    { name: '组织架构与人员', path: '/opsOrg/orgChart' },
    { name: '资质证书到期', path: '/opsOrg/certCenter' },
    { name: '智能调度看板', path: '/opsOrg/dispatchBoard' },
    { name: '巡检计划配置', path: '/opsOrg/patrolPlan' },
    { name: '巡检执行与打卡', path: '/opsOrg/patrolRecord' },
    { name: '绩效考核', path: '/opsOrg/performanceBoard' } ] },
  { name: '节能报告中心', path: '/energyReport', icon: Coin, children: [
    { name: '节能绩效看板', path: '/energyReport/overview' },
    { name: 'EMC 收益计算', path: '/energyReport/emcCalc' },
    { name: '碳减排核算', path: '/energyReport/carbon' },
    { name: '政府报送模板', path: '/energyReport/govReport' } ] },
  { name: '仓储库存', path: '/warehouse', icon: Goods, children: [
    { name: '仓储总览', path: '/warehouse/overview' },
    { name: '库存台账', path: '/warehouse/ledger' },
    { name: '库存盘点', path: '/warehouse/check' },
    { name: '采购申请', path: '/warehouse/purchase' } ] },
  { name: '线路拓扑', path: '/lineTopo', icon: Connection, children: [
    { name: '线路拓扑 GIS', path: '/lineTopo/topology' },
    { name: '配电箱详情', path: '/lineTopo/cabinet' } ] },
  { name: '电网知识库', path: '/gridKnowledge', icon: Files, children: [
    { name: '知识总览', path: '/gridKnowledge/overview' } ] },
  { name: '抢修与停电研判', path: '/opsEmergency', icon: Warning, children: [
    { name: '抢修研判中心', path: '/opsEmergency/outageDispatch' } ] },
  { name: '用电申请服务', path: '/powerApply', icon: Lightning, children: [
    { name: '用电申请中心', path: '/powerApply/new' } ] }
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
  authStore.logout()
  Toast.success('已退出中枢')
  setTimeout(() => {
    router.push('/login')
  }, 500)
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
 * 智光云枢-主壳样式 v3.0
 * 设计规范：Zinc 深色侧栏 + 琥珀强调 + 极简信息层级
 * ============================================================ */

.zg-shell {
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: var(--zg-canvas-mist);
  font-family: var(--zg-font-sans);

  /* ---------- 侧栏 ---------- */
  &__rail {
    width: 240px;
    background: var(--zg-gradient-rail);
    color: #a1a1aa;
    display: flex;
    flex-direction: column;
    position: relative;
    transition: width var(--zg-transition-normal);
    flex-shrink: 0;
    box-shadow: var(--zg-shadow-rail);

    &--folded { width: 64px; }
  }

  &__stage {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  &__full {
    flex: 1;
    width: 100%;
    min-height: 100vh;
  }
}

/* ---------- 品牌区 ---------- */
.zg-brand {
  padding: 18px 16px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  &__sigil {
    width: 40px;
    height: 40px;
    border-radius: var(--zg-radius-md);
    background: var(--zg-gradient-primary);
    color: #ffffff;
    display: grid;
    place-items: center;
    box-shadow: 0 4px 12px -4px rgba(217, 119, 6, 0.4);
  }

  &__cn {
    font-size: 15px;
    font-weight: 600;
    color: #fafafa;
    letter-spacing: 0.5px;
  }

  &__en {
    font-size: 10px;
    color: var(--zg-amber-200);
    letter-spacing: 0.3px;
    margin-top: 2px;
    opacity: 0.8;
  }
}

/* ---------- 侧栏导航 ---------- */
.zg-railnav {
  flex: 1;
  overflow-y: auto;
  padding: 10px 8px;

  &__menu {
    border-right: none !important;
    background: transparent !important;

    :deep(.el-sub-menu__title),
    :deep(.el-menu-item) {
      border-radius: var(--zg-radius-md) !important;
      margin: 2px 4px !important;
      height: 40px !important;
      line-height: 40px !important;
      padding: 0 12px !important;
      transition: all var(--zg-transition-fast);
      color: #a1a1aa !important;
      font-weight: 500;
      font-size: var(--zg-text-body-sm);
      position: relative;
      overflow: hidden;
    }

    :deep(.el-sub-menu__title:hover),
    :deep(.el-menu-item:hover) {
      background: rgba(255, 255, 255, 0.06) !important;
      color: #fafafa !important;
    }

    :deep(.el-menu-item.is-active) {
      background: rgba(255, 255, 255, 0.08) !important;
      color: #fafafa !important;
      box-shadow: none;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 20px;
        background: var(--zg-amber-glow);
        border-radius: 0 2px 2px 0;
      }
    }

    :deep(.el-sub-menu .el-menu-item) {
      padding-left: 36px !important;
      font-size: var(--zg-text-caption);
      height: 36px !important;
      line-height: 36px !important;

      &.is-active::before {
        left: 12px;
        height: 16px;
      }
    }

    :deep(.el-sub-menu__icon-arrow) {
      color: #71717a;
    }
  }

  &__glyph {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    margin-right: 10px;
  }

  &__label {
    letter-spacing: 0.2px;
  }
}

/* ---------- 折叠按钮 ---------- */
.zg-foldtoggle {
  position: absolute;
  right: -12px;
  top: 56px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: grid;
  place-items: center;
  cursor: pointer;
  color: var(--zg-steel-muted);
  z-index: 10;
  border: 1px solid var(--zg-line-strong);
  transition: all var(--zg-transition-fast);

  &:hover {
    color: var(--zg-amber-glow);
    transform: scale(1.08);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }

  &:active {
    transform: scale(0.96);
  }
}

/* ---------- 顶栏 ---------- */
.zg-topbar {
  height: 56px;
  background: #ffffff;
  border-bottom: 1px solid var(--zg-line-soft);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  flex-shrink: 0;

  &__lead {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__sigil {
    width: 36px;
    height: 36px;
    border-radius: var(--zg-radius-md);
    background: var(--zg-gradient-primary);
    color: #ffffff;
    display: grid;
    place-items: center;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.5px;
    box-shadow: var(--zg-shadow-btn);
  }

  &__title {
    font-size: var(--zg-text-body-lg);
    font-weight: 600;
    color: var(--zg-charcoal-ink);
    letter-spacing: -0.01em;
  }

  &__hint {
    font-size: var(--zg-text-caption);
    color: var(--zg-whisper-tertiary);
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 2px;
  }

  &__trail {
    display: flex;
    align-items: center;
    gap: 16px;
  }
}

.zg-pulse {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--zg-emerald-success);
  position: relative;

  &::after {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: 50%;
    background: var(--zg-emerald-success);
    opacity: 0.4;
    animation: zg-pulse 2s ease-out infinite;
  }
}

@keyframes zg-pulse {
  0% {
    transform: scale(0.6);
    opacity: 0.5;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.zg-bell {
  cursor: pointer;
  color: var(--zg-whisper-tertiary);
  padding: 8px;
  border-radius: var(--zg-radius-sm);
  transition: all var(--zg-transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: var(--zg-amber-50);
    color: var(--zg-amber-glow);
  }

  &:active {
    transform: scale(0.96);
  }
}

.zg-profile {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 10px 4px 4px;
  border-radius: var(--zg-radius-md);
  transition: all var(--zg-transition-fast);

  &:hover {
    background: var(--zg-amber-50);
  }

  &__avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--zg-gradient-primary);
    color: #ffffff;
    display: grid;
    place-items: center;
    font-size: 12px;
    font-weight: 600;
  }

  &__name {
    font-size: var(--zg-text-body-sm);
    color: var(--zg-steel-muted);
    font-weight: 500;
  }
}

/* ---------- 路由画布 ---------- */
.zg-canvas {
  flex: 1;
  overflow-y: auto;
  background: var(--zg-canvas-mist);
}

/* ---------- 过渡 ---------- */
.zg-fade-enter-active,
.zg-fade-leave-active {
  transition: opacity var(--zg-transition-fast);
}

.zg-fade-enter-from,
.zg-fade-leave-to {
  opacity: 0;
}

.zg-routefade-enter-active,
.zg-routefade-leave-active {
  transition: all var(--zg-transition-normal);
}

.zg-routefade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.zg-routefade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
