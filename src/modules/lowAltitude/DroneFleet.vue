<!--
  智光云枢 · 低空经济 · 无人机机队管理
  业务域：lowAltitude
  功能：机队卡片网格、实时遥测 Drawer、批量操作
-->
<template>
  <section class="zg-drone">
    <!-- 头部 -->
    <header class="zg-drone__head">
      <div class="zg-drone__headline">
        <div class="zg-drone__sigil">
          <el-icon :size="22"><Promotion /></el-icon>
        </div>
        <div class="zg-drone__copy">
          <h1 class="zg-drone__title">无人机机队管理</h1>
          <p class="zg-drone__sub">低空经济 · 智能巡检 · {{ drones.length }} 架 DJI Matrice 3D</p>
        </div>
      </div>
      <div class="zg-drone__batch">
        <el-button type="primary" :icon="Promotion" @click="batchTakeoff">一键全部起飞巡航</el-button>
        <el-button :icon="House" @click="batchReturn">一键回巢</el-button>
      </div>
    </header>

    <!-- KPI -->
    <div class="zg-drone__kpi">
      <div v-for="k in kpis" :key="k.id" class="zg-drone__kpi-cell" :class="`zg-drone__kpi-cell--${k.tone}`">
        <span class="zg-drone__kpi-icon" :style="{ background: k.grad }">
          <el-icon :size="18"><component :is="k.icon" /></el-icon>
        </span>
        <div class="zg-drone__kpi-body">
          <div class="zg-drone__kpi-val">{{ k.value }}</div>
          <div class="zg-drone__kpi-lbl">{{ k.label }}</div>
        </div>
      </div>
    </div>

    <!-- 机队卡片网格 -->
    <div class="zg-drone__grid">
      <article
        v-for="d in drones"
        :key="d.id"
        class="zg-drone__card"
        :class="`zg-drone__card--${d.status}`"
        @click="openDrawer(d)"
      >
        <header class="zg-drone__card-head">
          <div class="zg-drone__drone-glyph" :style="{ background: droneGrad(d.status) }">
            <el-icon :size="22"><Promotion /></el-icon>
          </div>
          <div class="zg-drone__drone-id">
            <span class="zg-drone__drone-code">{{ d.code }}</span>
            <el-tag :type="statusTag(d.status)" size="small" round>{{ statusText(d.status) }}</el-tag>
          </div>
        </header>
        <div class="zg-drone__drone-meta">
          <span><el-icon :size="12"><Cpu /></el-icon> {{ d.model }}</span>
          <span><el-icon :size="12"><LocationFilled /></el-icon> {{ d.location }}</span>
        </div>
        <div class="zg-drone__battery">
          <div class="zg-drone__ring" :style="`--p:${d.battery};`">
            <span class="zg-drone__ring-val">{{ d.battery }}%</span>
          </div>
          <div class="zg-drone__battery-meta">
            <div class="zg-drone__stat-row">
              <span>飞行时长</span>
              <strong>{{ d.flightHours }}h</strong>
            </div>
            <div class="zg-drone__stat-row">
              <span>固件版本</span>
              <strong>{{ d.firmware }}</strong>
            </div>
          </div>
        </div>
      </article>
    </div>

    <!-- 右侧 Drawer：实时遥测 -->
    <el-drawer v-model="drawerVisible" :title="activeDrone?.code + ' · 实时遥测'" size="420px" direction="rtl">
      <template v-if="activeDrone">
        <div class="zg-drone__telemetry">
          <div class="zg-drone__tele-metrics">
            <div v-for="m in telemetry(activeDrone)" :key="m.label" class="zg-drone__tele-cell">
              <span class="zg-drone__tele-label">{{ m.label }}</span>
              <span class="zg-drone__tele-value" :style="{ color: m.color }">{{ m.value }}</span>
              <div class="zg-drone__tele-bar"><div :style="{ width: m.pct + '%', background: m.color }"></div></div>
            </div>
          </div>

          <div class="zg-drone__route-title">当前航线轨迹</div>
          <div class="zg-drone__route-map">
            <svg viewBox="0 0 380 220" class="zg-drone__route-svg">
              <defs>
                <linearGradient id="rg" x1="0" x2="1">
                  <stop offset="0" stop-color="#6366f1" />
                  <stop offset="1" stop-color="#a855f7" />
                </linearGradient>
              </defs>
              <rect width="380" height="220" fill="#f8fafc" />
              <path d="M30,180 C80,120 140,160 200,90 C260,40 310,120 360,60" stroke="url(#rg)" stroke-width="3" fill="none" stroke-dasharray="6 4" />
              <circle v-for="(pt, i) in routePts" :key="i" :cx="pt.x" :cy="pt.y" r="4" fill="#6366f1" />
              <g :transform="`translate(${activeDrone.dronePos.x},${activeDrone.dronePos.y})`">
                <circle r="10" fill="rgba(99,102,241,0.25)" />
                <circle r="5" fill="#6366f1" />
              </g>
            </svg>
            <div class="zg-drone__route-legend">
              <span><i></i> 起点 · 岳麓山脚</span>
              <span><i></i> 途中 · 先导路</span>
              <span><i></i> 终点 · 梅溪湖</span>
            </div>
          </div>

          <el-descriptions :column="1" border size="small" class="zg-drone__desc">
            <el-descriptions-item label="机型">{{ activeDrone.model }}</el-descriptions-item>
            <el-descriptions-item label="所在位置">{{ activeDrone.location }}</el-descriptions-item>
            <el-descriptions-item label="固件版本">{{ activeDrone.firmware }}</el-descriptions-item>
            <el-descriptions-item label="飞行时长">{{ activeDrone.flightHours }}h</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="statusTag(activeDrone.status)" size="small">{{ statusText(activeDrone.status) }}</el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </template>
      <template #footer>
        <el-button @click="drawerVisible = false">关闭</el-button>
        <el-button type="danger" @click="emergencyStop">紧急降落</el-button>
      </template>
    </el-drawer>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Promotion,
  House,
  Cpu,
  LocationFilled,
  MagicStick,
  Odometer,
  Sunny,
  VideoPlay,
} from '@element-plus/icons-vue'

const regions = ['岳麓区·先导路', '岳麓区·梅溪湖', '岳麓区·橘子洲头', '岳麓区·麓谷大道']
const statusPoolDrone: Status[] = ['cruise', 'cruise', 'cruise', 'cruise', 'cruise', 'cruise', 'charging', 'charging', 'charging', 'charging', 'fault', 'standby', 'standby', 'standby']

const drones = computed<Drone[]>(() => {
  const list: Drone[] = []
  for (let i = 1; i <= 24; i++) {
    const status = statusPool[(i - 1) % statusPool.length]
    list.push({
      id: i,
      code: `ZG-D${i.toString().padStart(3, '0')}`,
      model: 'DJI Matrice 3D',
      location: regions[(i - 1) % regions.length],
      battery: status === 'charging' ? 30 + ((i * 7) % 50) : status === 'cruise' ? 55 + ((i * 11) % 40) : status === 'fault' ? 12 : 70 + ((i * 5) % 25),
      flightHours: 40 + ((i * 13) % 120),
      firmware: 'v2.4.' + (3 + (i % 4)),
      status,
      dronePos: { x: 40 + (i * 13) % 300, y: 40 + (i * 17) % 160 },
    })
  }
  return list
})

const routePts = [
  { x: 30, y: 180 }, { x: 90, y: 140 }, { x: 150, y: 130 },
  { x: 210, y: 85 }, { x: 280, y: 70 }, { x: 360, y: 60 },
]

const kpis = computed(() => [
  { id: 'total', label: '在役机队', value: drones.value.length, tone: 'indigo', icon: MagicStick, grad: 'linear-gradient(135deg,#6366f1,#a855f7)' },
  { id: 'cruise', label: '巡航中', value: drones.value.filter(d => d.status === 'cruise').length, tone: 'blue', icon: VideoPlay, grad: 'linear-gradient(135deg,#3b82f6,#06b6d4)' },
  { id: 'charge', label: '充电中', value: drones.value.filter(d => d.status === 'charging').length, tone: 'green', icon: Sunny, grad: 'linear-gradient(135deg,#10b981,#14b8a6)' },
  { id: 'flight', label: '今日飞行', value: 18, tone: 'amber', icon: Odometer, grad: 'linear-gradient(135deg,#f59e0b,#ec4899)' },
])

const drawerVisible = ref(false)
const activeDrone = ref<Drone | null>(null)

function droneGrad(s: DroneStatus) {
  return {
    cruise: 'linear-gradient(135deg,#3b82f6,#06b6d4)',
    charging: 'linear-gradient(135deg,#10b981,#14b8a6)',
    fault: 'linear-gradient(135deg,#ef4444,#f97316)',
    standby: 'linear-gradient(135deg,#94a3b8,#cbd5e1)',
  }[s]
}
function statusText(s: DroneStatus) {
  return { cruise: '巡航中', charging: '充电中', fault: '故障', standby: '待机' }[s]
}
function statusTag(s: DroneStatus): '' | 'primary' | 'success' | 'danger' | 'info' {
  return { cruise: 'primary', charging: 'success', fault: 'danger', standby: 'info' }[s] as any
}
function openDrawer(d: Drone) {
  activeDrone.value = d
  drawerVisible.value = true
}
function telemetry(d: Drone) {
  const base = [
    { label: '飞行高度', value: '128 m', pct: 64, color: '#6366f1' },
    { label: '飞行速度', value: '8.6 m/s', pct: 43, color: '#06b6d4' },
    { label: '电量', value: d.battery + '%', pct: d.battery, color: d.battery < 30 ? '#ef4444' : '#10b981' },
    { label: '信号强度', value: '92%', pct: 92, color: '#10b981' },
  ]
  return base
}

function batchTakeoff() { ElMessage.success('已向所有待机无人机下发巡航指令') }
function batchReturn() { ElMessage.warning('已向所有无人机下发回巢指令') }
function emergencyStop() { ElMessage.error(`已触发 ${activeDrone.value?.code} 紧急降落`) }
</script>

<style lang="scss" scoped>
.zg-drone {
  padding: 20px 24px 32px;
  color: var(--zg-ink-primary, #1e293b);

  // 头部
  &__head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 22px;
    background: #fff;
    border-radius: 16px;
    box-shadow: var(--zg-shadow-card, 0 4px 16px rgba(0,0,0,0.04));
        margin-bottom: 16px;
  }
  &__headline { display: flex; align-items: center; gap: 14px; }
  &__sigil {
    width: 44px; height: 44px;
    border-radius: 12px;
    background: linear-gradient(135deg, #6366f1, #a855f7);
    color: #fff;
    display: flex; align-items: center; justify-content: center;
  }
  &__title { font-size: 20px; margin: 0; font-weight: 700; }
  &__sub { font-size: 13px; margin: 2px 0 0; color: var(--zg-ink-tertiary, #94a3b8); }
  &__batch { display: flex; gap: 10px; }

  // KPI
  &__kpi {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
    margin-bottom: 18px;
  }
  &__kpi-cell {
    background: #fff;
    border-radius: 14px;
    padding: 14px 18px;
    display: flex; align-items: center; gap: 14px;
    box-shadow: var(--zg-shadow-card, 0 4px 16px rgba(0,0,0,0.04));
  }
  &__kpi-icon {
        width: 40px; height: 40px;
    border-radius: 10px;
    color: #fff;
    display: flex; align-items: center; justify-content: center;
  }
  &__kpi-val { font-size: 22px; font-weight: 700; }
  &__kpi-lbl { font-size: 12px; color: var(--zg-ink-tertiary, #94a3b8); }

  // 卡片网格
  &__grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
  }
  &__card {
    background: #fff;
    border-radius: 14px;
    padding: 14px 16px;
    box-shadow: var(--zg-shadow-card, 0 4px 16px rgba(0,0,0,0.04));
        cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s;
    border-left: 3px solid transparent;
    &:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(99,102,241,0.18); }
    &--cruise   { border-left-color: #3b82f6; }
    &--charging { border-left-color: #10b981; }
    &--fault    { border-left-color: #ef4444; }
    &--standby  { border-left-color: #94a3b8; }
  }
  &__card-head {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 10px;
  }
  &__drone-glyph {
    width: 38px; height: 38px;
    border-radius: 10px;
    color: #fff;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  &__drone-id {
    display: flex; flex-direction: column; gap: 2px;
  }
  &__drone-code { font-weight: 700; font-size: 14px; letter-spacing: 0.5px; }

  &__drone-meta {
    display: flex; flex-direction: column; gap: 4px;
    font-size: 12px;
    color: var(--zg-ink-tertiary, #94a3b8);
    margin-bottom: 12px;
    padding-bottom: 10px;
    border-bottom: 1px dashed rgba(0,0,0,0.06);
    svg { vertical-align: middle; margin-right: 4px; }
  }

  // 电池圆环
  &__battery { display: flex; gap: 14px; align-items: center; }
  &__ring {
    width: 64px; height: 64px;
    border-radius: 50%;
    background: conic-gradient(#6366f1 calc(var(--p) * 1%), rgba(99,102,241,0.12) 0);
    display: flex; align-items: center; justify-content: center;
    position: relative;
    &::after {
      content: '';
      position: absolute; inset: 6px;
      background: #fff;
      border-radius: 50%;
    }
  }
  &__ring-val {
    position: relative; z-index: 1;
    font-size: 14px; font-weight: 700; color: var(--zg-ink-primary, #1e293b);
  }
  &__battery-meta { flex: 1; display: flex; flex-direction: column; gap: 6px; }
  &__stat-row {
    display: flex; justify-content: space-between;
    font-size: 12px; color: var(--zg-ink-tertiary, #94a3b8);
    strong { font-size: 12px; color: var(--zg-ink-primary, #1e293b); font-weight: 600; }
  }

  // Drawer 遥测
  &__telemetry { display: flex; flex-direction: column; gap: 18px; }
  &__tele-metrics { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
  &__tele-cell {
    background: #f8fafc;
    border-radius: 10px;
    padding: 12px;
    display: flex; flex-direction: column; gap: 6px;
  }
  &__tele-label { font-size: 12px; color: var(--zg-ink-tertiary, #94a3b8); }
  &__tele-value { font-size: 18px; font-weight: 700; }
  &__tele-bar {
    height: 4px; background: rgba(0,0,0,0.06); border-radius: 3px; overflow: hidden;
    div { height: 100%; border-radius: 3px; transition: width 0.4s; }
  }
  &__route-title { font-size: 14px; font-weight: 600; margin-top: 8px; }
  &__route-map { border-radius: 12px; overflow: hidden; border: 1px solid rgba(0,0,0,0.06); }
  &__route-svg { display: block; width: 100%; }
  &__route-legend {
    display: flex; gap: 14px; font-size: 12px; color: var(--zg-ink-tertiary, #94a3b8);
    padding: 8px 2px 0;
    span { display: flex; align-items: center; gap: 5px;
      i { width: 8px; height: 8px; border-radius: 50%; background: #6366f1; }
    }
  }
  &__desc { margin-top: 8px; }
}
</style>
