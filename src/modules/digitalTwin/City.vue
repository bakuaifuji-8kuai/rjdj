<!--
  智光云枢 · 数字孪生城市 · 3D 可视化
  业务域：digitalTwin
  功能：纯 CSS 3D transform 实现立体城市，可视化灯杆/摄像头/无人机/告警热点
  @version 1.0.0
-->
<template>
  <section class="zg-twin" :style="sceneVars">
    <!-- 粒子背景 -->
    <div class="zg-twin__particles">
      <span
        v-for="n in 40"
        :key="n"
        class="zg-twin__particle"
        :style="{
          left: (Math.random() * 100) + '%',
          top: (Math.random() * 100) + '%',
          animationDelay: (Math.random() * 6) + 's',
          animationDuration: (4 + Math.random() * 6) + 's'
        }"
      ></span>
    </div>

    <!-- 顶部控制栏 -->
    <header class="zg-twin__topbar">
      <div class="zg-twin__brand">
        <div class="zg-twin__logo">
          <el-icon :size="22"><Cpu /></el-icon>
        </div>
        <div class="zg-twin__brand-copy">
          <h1 class="zg-twin__title">智光云枢 · 数字孪生城市</h1>
          <p class="zg-twin__subtitle">City Light Grid · 3D Visual Twin · {{ liveClock }}</p>
        </div>
      </div>

      <div class="zg-twin__top-ctrl">
        <div class="zg-twin__ctrl-block">
          <span class="zg-twin__ctrl-label">
            <el-icon :size="14"><Compass /></el-icon> 旋转
          </span>
          <el-slider
            v-model="viewY"
            :min="0"
            :max="360"
            :step="1"
            :show-tooltip="false"
            class="zg-twin__slider"
          />
          <span class="zg-twin__val">{{ viewY }}°</span>
        </div>
        <div class="zg-twin__ctrl-block">
          <span class="zg-twin__ctrl-label">
            <el-icon :size="14"><Histogram /></el-icon> 俯仰
          </span>
          <el-slider
            v-model="viewX"
            :min="30"
            :max="70"
            :step="1"
            :show-tooltip="false"
            class="zg-twin__slider"
          />
          <span class="zg-twin__val">{{ viewX }}°</span>
        </div>
        <el-button size="small" round @click="resetView">
          <el-icon><RefreshRight /></el-icon> 重置视角
        </el-button>
      </div>
    </header>

    <!-- 主体区域 -->
    <div class="zg-twin__main">
      <!-- 中央 3D 舞台 -->
      <div class="zg-twin__stage-wrap">
        <div class="zg-twin__stage" :style="stageTransform">
          <!-- 透视容器 -->
          <div class="zg-twin__perspective">

            <!-- 地平面 -->
            <div class="zg-twin__ground"></div>

            <!-- 街区 -->
            <div
              v-for="blk in buildings"
              :key="'b-'+blk.id"
              class="zg-twin__cube"
              :class="`zg-twin__cube--${blk.status}`"
              :style="cubeStyle(blk)"
              @click="focusBuilding(blk)"
            >
              <div class="zg-twin__cube-face zg-twin__cube-face--front"></div>
              <div class="zg-twin__cube-face zg-twin__cube-face--back"></div>
              <div class="zg-twin__cube-face zg-twin__cube-face--left"></div>
              <div class="zg-twin__cube-face zg-twin__cube-face--right"></div>
              <div class="zg-twin__cube-face zg-twin__cube-face--top"></div>
            </div>

            <!-- 灯杆 -->
            <template v-if="layers.lamps">
              <div
                v-for="lamp in lamps"
                :key="'l-'+lamp.id"
                class="zg-twin__lamp"
                :style="lampStyle(lamp)"
                @click.stop="openLampDetail(lamp)"
              >
                <div class="zg-twin__lamp-pole"></div>
                <div class="zg-twin__lamp-cone"></div>
                <div class="zg-twin__lamp-glow" :class="{ 'is-warn': lamp.status === 'warn' }"></div>
              </div>
            </template>

            <!-- 摄像头 -->
            <template v-if="layers.cameras">
              <div
                v-for="cam in cameras"
                :key="'c-'+cam.id"
                class="zg-twin__cam"
                :style="camStyle(cam)"
              >
                <div class="zg-twin__cam-body"></div>
                <div class="zg-twin__cam-pulse"></div>
              </div>
            </template>

            <!-- 无人机 -->
            <template v-if="layers.drones">
              <div
                v-for="dr in drones"
                :key="'d-'+dr.id"
                class="zg-twin__drone"
                :style="droneStyle(dr)"
              >
                <div class="zg-twin__drone-box"></div>
                <div class="zg-twin__drone-prop zg-twin__drone-prop--a"></div>
                <div class="zg-twin__drone-prop zg-twin__drone-prop--b"></div>
              </div>
            </template>

            <!-- 告警热点 -->
            <template v-if="layers.alerts">
              <div
                v-for="a in alertSpots"
                :key="'a-'+a.id"
                class="zg-twin__alert"
                :style="alertStyle(a)"
                @click.stop="openWarningFilledDetail(a)"
              >
                <div class="zg-twin__alert-core"></div>
                <div class="zg-twin__alert-ring"></div>
                <div class="zg-twin__alert-ring zg-twin__alert-ring--delay"></div>
              </div>
            </template>

            <!-- 扫描光束 -->
            <div class="zg-twin__scanbeam"></div>

          </div>
        </div>

        <!-- 场景角标 -->
        <div class="zg-twin__stage-hud">
          <div class="zg-twin__hud-cell">
            <el-icon :size="14"><Grid /></el-icon>
            <span>街区 {{ buildings.length }}</span>
          </div>
          <div class="zg-twin__hud-cell">
            <el-icon :size="14"><Place /></el-icon>
            <span>灯杆 {{ lamps.length }}</span>
          </div>
          <div class="zg-twin__hud-cell">
            <el-icon :size="14"><Camera /></el-icon>
            <span>摄像 {{ cameras.length }}</span>
          </div>
          <div class="zg-twin__hud-cell zg-twin__hud-cell--warn">
            <el-icon :size="14"><WarningFilled /></el-icon>
            <span>告警 {{ alertSpots.length }}</span>
          </div>
        </div>
      </div>

      <!-- 右侧面板 -->
      <aside class="zg-twin__sidebar">
        <!-- 图层开关 -->
        <section class="zg-twin__panel">
          <header class="zg-twin__panel-head">
            <el-icon :size="15"><Monitor /></el-icon>
            <span>图层控制</span>
          </header>
          <ul class="zg-twin__layer-list">
            <li v-for="ly in layerOptions" :key="ly.key" class="zg-twin__layer-item">
              <span class="zg-twin__layer-name">
                <el-icon :size="14"><component :is="ly.icon" /></el-icon>
                {{ ly.label }}
              </span>
              <el-switch v-model="layers[ly.key]" active-color="#6366f1" />
            </li>
          </ul>
        </section>

        <!-- 实时指标 -->
        <section class="zg-twin__panel">
          <header class="zg-twin__panel-head">
            <el-icon :size="15"><DataBoard /></el-icon>
            <span>实时指标</span>
          </header>
          <ul class="zg-twin__metric-list">
            <li
              v-for="m in metrics"
              :key="m.id"
              class="zg-twin__metric-item"
            >
              <span class="zg-twin__metric-lbl">{{ m.label }}</span>
              <span class="zg-twin__metric-num" :class="m.tone">{{ m.value }}</span>
              <span class="zg-twin__metric-unit">{{ m.unit }}</span>
            </li>
          </ul>
        </section>

        <!-- 告警热点 Top 5 -->
        <section class="zg-twin__panel zg-twin__panel--flex">
          <header class="zg-twin__panel-head">
            <el-icon :size="15"><CaretTop /></el-icon>
            <span>告警热点 Top 5</span>
            <span class="zg-twin__panel-badge">{{ alertSpots.length }}</span>
          </header>
          <ul class="zg-twin__alert-list">
            <li
              v-for="(a, i) in topWarningFilleds"
              :key="a.id"
              class="zg-twin__alert-item"
              @click="openWarningFilledDetail(a)"
            >
              <span class="zg-twin__alert-rank">{{ i + 1 }}</span>
              <div class="zg-twin__alert-body">
                <span class="zg-twin__alert-title">{{ a.title }}</span>
                <span class="zg-twin__alert-sub">{{ a.loc }} · {{ a.time }}</span>
              </div>
              <span class="zg-twin__alert-level" :class="a.level">{{ a.levelText }}</span>
            </li>
          </ul>
        </section>
      </aside>
    </div>

    <!-- 底部数据条 -->
    <footer class="zg-twin__bottom">
      <div class="zg-twin__timeline">
        <span class="zg-twin__timeline-label">
          <el-icon :size="14"><Timer /></el-icon> 时间轴
        </span>
        <el-slider
          v-model="sceneHour"
          :min="0"
          :max="24"
          :step="0.5"
          :show-tooltip="false"
          class="zg-twin__timeline-slider"
        />
        <span class="zg-twin__timeline-time">{{ formatHour(sceneHour) }}</span>
        <span class="zg-twin__timeline-phase">{{ phaseLabel }}</span>
      </div>

      <div class="zg-twin__telemetry">
        <div class="zg-twin__telemetry-head">
          <el-icon :size="14"><Connection /></el-icon>
          <span>遥测流</span>
        </div>
        <div class="zg-twin__telemetry-body">
          <div class="zg-twin__telemetry-track">
            <div
              v-for="(row, i) in telemetryLoop"
              :key="i"
              class="zg-twin__telemetry-row"
            >{{ row }}</div>
          </div>
        </div>
      </div>

      <div class="zg-twin__kpis">
        <div
          v-for="k in bottomKpis"
          :key="k.id"
          class="zg-twin__kpi"
        >
          <span class="zg-twin__kpi-label">{{ k.label }}</span>
          <span class="zg-twin__kpi-num" :class="k.tone">{{ animatedValue(k.id, k.value) }}</span>
          <span class="zg-twin__kpi-unit">{{ k.unit }}</span>
        </div>
      </div>
    </footer>

    <!-- 灯杆详情抽屉 -->
    <el-drawer
      v-model="lampDrawer"
      size="380px"
      direction="rtl"
      :show-close="false"
      class="zg-twin__drawer"
    >
      <template v-if="activeLamp">
        <header class="zg-twin__drawer-head">
          <div class="zg-twin__drawer-title">
            <el-icon :size="18"><Place /></el-icon>
            <span>灯杆遥测详情</span>
          </div>
          <el-button text @click="lampDrawer = false">
            <el-icon><Close /></el-icon>
          </el-button>
        </header>
        <div class="zg-twin__drawer-body">
          <div class="zg-twin__lamp-card">
            <div class="zg-twin__lamp-no">#{{ activeLamp.id }}</div>
            <div class="zg-twin__lamp-stat" :class="activeLamp.status">
              {{ activeLamp.status === 'online' ? '在线' : activeLamp.status === 'warn' ? '告警' : '离线' }}
            </div>
          </div>
          <dl class="zg-twin__kv">
            <dt>编号</dt><dd>LAMP-{{ String(activeLamp.id).padStart(4, '0') }}</dd>
            <dt>位置</dt><dd>{{ activeLamp.loc }}</dd>
            <dt>亮度</dt><dd>{{ activeLamp.brightness }}%</dd>
            <dt>电流</dt><dd>{{ activeLamp.current }} A</dd>
            <dt>功率</dt><dd>{{ (activeLamp.current * 220 * 0.05).toFixed(2) }} kW</dd>
            <dt>温度</dt><dd>{{ 35 + activeLamp.id % 8 }} ℃</dd>
            <dt>今日能耗</dt><dd>{{ (Math.random() * 12 + 4).toFixed(1) }} kWh</dd>
          </dl>

          <div class="zg-twin__hist">
            <div class="zg-twin__hist-title">最近电流（24h）</div>
            <div class="zg-twin__hist-bars">
              <div
                v-for="h in 24"
                :key="h"
                class="zg-twin__hist-bar"
                :style="{ height: (20 + Math.sin(h / 3) * 20 + 20) + '%' }"
              ></div>
            </div>
          </div>

          <div class="zg-twin__alarm-hist">
            <div class="zg-twin__hist-title">告警历史</div>
            <ul class="zg-twin__alarm-list">
              <li class="zg-twin__alarm-hist-item" v-for="(ah, i) in activeLampHistory" :key="i">
                <span class="zg-twin__alarm-tag" :class="ah.level">{{ ah.levelText }}</span>
                <span>{{ ah.msg }}</span>
                <span class="zg-twin__alarm-time">{{ ah.time }}</span>
              </li>
              <li v-if="activeLampHistory.length === 0" class="zg-twin__alarm-hist-empty">
                近 30 天无告警
              </li>
            </ul>
          </div>
        </div>
      </template>
    </el-drawer>
  </section>
</template>

<script setup>
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue'
import {
  Cpu, Monitor, Place, Camera, CaretTop, DataBoard, Histogram,
  Compass, Grid, WarningFilled, Timer, Connection, RefreshRight, Close,
  Warning
} from '@element-plus/icons-vue'

/* ------------------------------------------------------------------
   数据：街区 / 灯杆 / 摄像头 / 无人机 / 告警热点
------------------------------------------------------------------ */

const rand = (min, max) => Math.random() * (max - min) + min
const randInt = (min, max) => Math.floor(rand(min, max + 1))

// 生成 24 个街区
const BUILDING_COUNT = 24
const buildings = Array.from({ length: BUILDING_COUNT }, (_, i) => {
  const gx = i % 6
  const gz = Math.floor(i / 6)
  const statusRoll = Math.random()
  const status = statusRoll < 0.82 ? 'online' : statusRoll < 0.95 ? 'warn' : 'offline'
  return {
    id: i + 1,
    // 地面 1200x1200，网格间距 180
    x: gx * 180 - 450 + rand(-30, 30),
    z: gz * 180 - 450 + rand(-30, 30),
    w: randInt(80, 130),
    d: randInt(80, 130),
    h: randInt(80, 320),
    status
  }
})

// 生成 32 根灯杆
const LAMP_COUNT = 32
const lamps = Array.from({ length: LAMP_COUNT }, (_, i) => {
  const statusRoll = Math.random()
  const status = statusRoll < 0.9 ? 'online' : statusRoll < 0.97 ? 'warn' : 'offline'
  const brightness = status === 'offline' ? 0 : randInt(45, 100)
  return {
    id: i + 1,
    x: rand(-520, 520),
    z: rand(-520, 520),
    h: randInt(80, 140),
    brightness,
    current: rand(0.1, 0.6).toFixed(2),
    status,
    loc: ['长安街', '银河路', '曙光大道', '北斗巷', '启明路', '星云大道'][i % 6] + ' ' + (100 + i) + ' 号'
  }
})

// 生成 6 个摄像头
const CAM_COUNT = 6
const cameras = Array.from({ length: CAM_COUNT }, (_, i) => ({
  id: i + 1,
  x: rand(-500, 500),
  z: rand(-500, 500),
  h: randInt(120, 220),
  loc: ['路口', '广场', '天桥', '隧道口', '园区', '江边'][i % 6]
}))

// 生成 3 架无人机 + 动画偏移（hover）
const DRONE_COUNT = 3
const drones = Array.from({ length: DRONE_COUNT }, (_, i) => ({
  id: i + 1,
  baseX: rand(-420, 420),
  baseZ: rand(-420, 420),
  h: randInt(280, 420),
  phaseX: i * 1.7,
  phaseZ: i * 2.3
}))

// 告警热点 5 个
const alertSpots = [
  { id: 'A01', x: -280, z: -160, title: '银河路三车追尾', loc: '银河路 · 启明路口', time: '刚刚', level: 'high', levelText: '紧急' },
  { id: 'A02', x:  320, z:  220, title: '灯杆电流异常', loc: '长安街 1280 号', time: '2 分钟前', level: 'high', levelText: '紧急' },
  { id: 'A03', x:  160, z: -360, title: '摄像头离线', loc: '星云大道 4 号', time: '5 分钟前', level: 'mid', levelText: '一般' },
  { id: 'A04', x: -380, z:  300, title: '烟雾探测触发', loc: '隧道 3 号出入口', time: '12 分钟前', level: 'mid', levelText: '一般' },
  { id: 'A05', x:    0, z:    0, title: '能耗波动预警', loc: '中心广场', time: '23 分钟前', level: 'low', levelText: '提示' }
]
const topWarningFilleds = alertSpots

/* ------------------------------------------------------------------
   交互状态
------------------------------------------------------------------ */

const viewX = ref(55)
const viewY = ref(-35)
const sceneHour = ref(20)

const layers = reactive({
  lamps: true,
  cameras: true,
  drones: true,
  alerts: true
})

const layerOptions = [
  { key: 'lamps',   label: '灯杆',    icon: Place },
  { key: 'cameras', label: '摄像头',  icon: Camera },
  { key: 'drones',  label: '无人机',  icon: Monitor },
  { key: 'alerts',  label: '告警热点', icon: WarningFilled }
]

const metrics = computed(() => {
  const onlineCount = lamps.filter(l => l.status === 'online').length
  const onlineRate = ((onlineCount / lamps.length) * 100).toFixed(1)
  return [
    { id: 'm1', label: '在网灯杆',  value: lamps.length, tone: 'ok',   unit: '根' },
    { id: 'm2', label: '在线率',    value: onlineRate,   tone: 'ok',   unit: '%' },
    { id: 'm3', label: '今日能耗',  value: randInt(1820, 2350), tone: 'neon', unit: 'kWh' },
    { id: 'm4', label: '活跃告警',  value: alertSpots.length, tone: 'warn', unit: '个' }
  ]
})

const bottomKpis = computed(() => [
  { id: 'k1', label: '节点总数',     value: (lamps.length + cameras.length + drones.length) * 128, tone: 'cyan',   unit: '个' },
  { id: 'k2', label: '今日告警',     value: randInt(12, 48),                                    tone: 'amber',  unit: '条' },
  { id: 'k3', label: '设备吞吐',     value: randInt(23800, 38600),                              tone: 'violet', unit: 'msg/s' }
])

// 抽屉
const lampDrawer = ref(false)
const activeLamp = ref(null)
const activeLampHistory = computed(() => {
  if (!activeLamp.value) return []
  const base = activeLamp.value
  if (base.status === 'online') return []
  const entries = []
  const count = base.status === 'warn' ? 3 : 2
  for (let i = 0; i < count; i++) {
    entries.push({
      level: i === 0 ? 'high' : 'mid',
      levelText: i === 0 ? '紧急' : '一般',
      msg: ['过流保护触发', '通信中断 8min', '亮度骤降 35%'][i],
      time: `${i + 1}h 前`
    })
  }
  return entries
})

/* ------------------------------------------------------------------
   计算属性：视角、场景变量、时间轴
------------------------------------------------------------------ */

const stageTransform = computed(() => ({
  transform: `rotateX(${viewX.value}deg) rotateY(${viewY.value}deg)`
}))

// 亮度变量：白天（6-18 点）亮，夜晚暗 + 灯杆发光强
const sceneVars = computed(() => {
  const h = sceneHour.value
  const dayFactor =
    h >= 6 && h <= 18
      ? 1 - Math.min(1, Math.abs(h - 12) / 6) * 0.4
      : h < 6
        ? 0.25 + (h / 6) * 0.35
        : 0.25 + ((24 - h) / 6) * 0.35
  return {
    '--scene-brightness': dayFactor.toFixed(3),
    '--lamp-glow-strength': (1 - dayFactor).toFixed(3),
    '--ambient': h >= 6 && h <= 18 ? '#1a2a5a' : '#050818'
  }
})

const phaseLabel = computed(() => {
  const h = sceneHour.value
  if (h >= 6 && h < 10) return '晨光'
  if (h >= 10 && h < 14) return '正午'
  if (h >= 14 && h < 18) return '午后'
  if (h >= 18 && h < 21) return '黄昏'
  if (h >= 21 || h < 3) return '深夜'
  return '凌晨'
})

/* ------------------------------------------------------------------
   样式函数
------------------------------------------------------------------ */

function cubeStyle(blk) {
  return {
    left: `calc(50% + ${blk.x}px)`,
    top: `calc(50% + ${blk.z}px)`,
    width: blk.w + 'px',
    height: blk.d + 'px',
    ['--cube-h']: blk.h + 'px',
    transform: `translate(-50%, -50%)`
  }
}

function lampStyle(lamp) {
  return {
    left: `calc(50% + ${lamp.x}px)`,
    top: `calc(50% + ${lamp.z}px)`,
    ['--lamp-h']: lamp.h + 'px',
    transform: 'translate(-50%, -100%)'
  }
}

function camStyle(cam) {
  return {
    left: `calc(50% + ${cam.x}px)`,
    top: `calc(50% + ${cam.z}px)`,
    transform: 'translate(-50%, -100%)',
    animationDelay: (cam.id * 0.4) + 's'
  }
}

function droneStyle(dr) {
  const t = Date.now() / 1000
  const ox = Math.sin(t * 0.4 + dr.phaseX) * 40
  const oz = Math.cos(t * 0.35 + dr.phaseZ) * 40
  return {
    left: `calc(50% + ${dr.baseX + ox}px)`,
    top: `calc(50% + ${dr.baseZ + oz}px)`,
    transform: `translate(-50%, -100%) translateZ(${dr.h}px)`,
    animationDelay: (dr.id * 0.7) + 's'
  }
}

function alertStyle(a) {
  return {
    left: `calc(50% + ${a.x}px)`,
    top: `calc(50% + ${a.z}px)`,
    transform: 'translate(-50%, -50%)',
    animationDelay: (Math.random() * 1.5) + 's'
  }
}

/* ------------------------------------------------------------------
   交互函数
------------------------------------------------------------------ */

function resetView() {
  viewX.value = 55
  viewY.value = -35
}

function focusBuilding(blk) {
  console.log('focus building', blk)
}

function openLampDetail(lamp) {
  activeLamp.value = lamp
  lampDrawer.value = true
}

function openWarningFilledDetail(a) {
  activeLamp.value = {
    id: a.id.replace(/\D/g, '') || 1,
    status: 'warn',
    loc: a.loc,
    brightness: 72,
    current: '0.42'
  }
  lampDrawer.value = true
}

/* ------------------------------------------------------------------
   时间 / 遥测 / 数字动画
------------------------------------------------------------------ */

const liveClock = ref('')
function tickClock() {
  const d = new Date()
  liveClock.value = d.toLocaleTimeString('zh-CN', { hour12: false })
}
let clockTimer

function formatHour(h) {
  const hi = Math.floor(h)
  const mi = Math.round((h - hi) * 60)
  return `${String(hi).padStart(2, '0')}:${String(mi).padStart(2, '0')}`
}

const telemetryRows = [
  '[12:01:44] LAMP-0128 亮度 96% 电流 0.41A 正常',
  '[12:01:45] LAMP-0077 电流 0.18A 低于阈值',
  '[12:01:46] CAM-0003 心跳 OK 丢包 0.2%',
  '[12:01:47] DRONE-01 巡检完成 飞行 18min',
  '[12:01:48] LAMP-0104 告警恢复 已在线 2h',
  '[12:01:49] 集群 A 负载 42% 温控 OK',
  '[12:01:50] 网关 GW-09 下行 28kbps',
  '[12:01:51] LAMP-0199 亮度调整 82% → 74%'
]
const telemetryLoop = ref([...telemetryRows])
let telemetryTimer

function shiftTelemetry() {
  telemetryLoop.value.push(telemetryRows[Math.floor(Math.random() * telemetryRows.length)])
  if (telemetryLoop.value.length > 16) telemetryLoop.value.shift()
  telemetryLoop.value = [...telemetryLoop.value]
}

// 数字跳动：缓慢逼近目标
const animatedCache = reactive({})
function animatedValue(id, target) {
  animatedCache[id] = animatedCache[id] || 0
  const prev = animatedCache[id]
  const step = (target - prev) * 0.06
  animatedCache[id] = Math.abs(target - prev) < 1 ? target : prev + step
  return Math.round(animatedCache[id]).toLocaleString()
}

let animTimer

onMounted(() => {
  tickClock()
  clockTimer = setInterval(tickClock, 1000)
  telemetryTimer = setInterval(shiftTelemetry, 1800)
  animTimer = setInterval(() => {
    // 触发 computed 更新（通过读取会自动更新）
    drones.value = [...drones.value]
  }, 80)
})

onUnmounted(() => {
  clearInterval(clockTimer)
  clearInterval(telemetryTimer)
  clearInterval(animTimer)
})
</script>

<style lang="scss" scoped>
/* =========================================================
   基础变量与容器
========================================================= */
.zg-twin {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100vh;
  overflow: hidden;
  color: #e6e9ff;
  font-family: 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif;
  background:
    radial-gradient(circle at 15% 20%, rgba(99, 102, 241, 0.25), transparent 45%),
    radial-gradient(circle at 85% 80%, rgba(236, 72, 153, 0.12), transparent 40%),
    linear-gradient(135deg, #0a0e27 0%, #0f1a3a 60%, #050818 100%);
  background-color: var(--ambient, #0a0e27);
  transition: background-color 0.6s ease;

  --scene-brightness: 1;
  --lamp-glow-strength: 0.3;

  /* 霓虹渐变通用 */
  --neon-gradient: linear-gradient(90deg, #6366f1 0%, #a855f7 50%, #22d3ee 100%);
  --neon-text: linear-gradient(90deg, #818cf8 0%, #c084fc 50%, #67e8f9 100%);
  --panel-border: 1px solid rgba(99, 102, 241, 0.3);
  --panel-bg: rgba(15, 22, 60, 0.45);
}

/* =========================================================
   粒子背景
========================================================= */
.zg-twin__particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  .zg-twin__particle {
    position: absolute;
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: rgba(199, 210, 254, 0.9);
    box-shadow: 0 0 8px 2px rgba(129, 140, 248, 0.6);
    animation: zg-particle-float 6s ease-in-out infinite;
  }
}

@keyframes zg-particle-float {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.6; }
  50%      { transform: translateY(-30px) scale(1.3); opacity: 1; }
}

/* =========================================================
   顶部控制栏
========================================================= */
.zg-twin__topbar {
  position: relative;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: linear-gradient(180deg, rgba(10, 14, 39, 0.85), rgba(10, 14, 39, 0.2));
    border-bottom: 1px solid rgba(99, 102, 241, 0.2);
  backdrop-filter: blur(6px);
}
.zg-twin__brand {
  display: flex;
  align-items: center;
  gap: 14px;
}
.zg-twin__logo {
  width: 42px; height: 42px;
  display: grid; place-items: center;
  border-radius: 10px;
  background: var(--neon-gradient);
  box-shadow: 0 0 18px rgba(99, 102, 241, 0.6);
  color: white;
}
.zg-twin__brand-copy { .zg-twin__subtitle { margin: 2px 0 0; font-size: 12px; color: #9aa3d6; } }
.zg-twin__title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  background: var(--neon-text);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  letter-spacing: 0.5px;
}

.zg-twin__top-ctrl {
  display: flex; align-items: center; gap: 18px;
}
.zg-twin__ctrl-block {
  display: flex; align-items: center; gap: 8px;
  padding: 6px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(99, 102, 241, 0.25);
}
.zg-twin__ctrl-label {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 12px; color: #a5b0e6;
  white-space: nowrap;
}
.zg-twin__slider { width: 140px; }
.zg-twin__val { min-width: 36px; text-align: right; font-variant-numeric: tabular-nums; color: #c7d2fe; font-size: 13px; }

/* Element Plus slider 轨道着色 */
.zg-twin :deep(.el-slider__runway)  { background: rgba(99,102,241,0.15); }
.zg-twin :deep(.el-slider__bar)     { background: var(--neon-gradient); }
.zg-twin :deep(.el-slider__button)  { border-color: #a855f7; box-shadow: 0 0 6px #a855f7; }

/* =========================================================
   主体
========================================================= */
.zg-twin__main {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 16px;
  padding: 16px 24px 0;
  height: calc(100vh - 190px);
  min-height: 500px;
}

/* =========================================================
   舞台容器 + 透视 + 地平面
========================================================= */
.zg-twin__stage-wrap {
  position: relative;
  flex: 1;
  border: var(--panel-border);
  border-radius: 14px;
  background: var(--panel-bg);
  backdrop-filter: blur(8px);
  overflow: hidden;
}
.zg-twin__stage {
  position: absolute;
  inset: 0;
  transition: transform 0.18s linear;
  transform-style: preserve-3d;
}
.zg-twin__perspective {
  position: absolute;
  inset: 0;
  perspective: 2400px;
  transform-style: preserve-3d;
}

/* 地平面：1200x1200 中心 */
.zg-twin__ground {
  position: absolute;
  left: 50%; top: 50%;
  width: 1200px; height: 1200px;
  transform: translate(-50%, -50%) rotateX(90deg);
  background-image:
    linear-gradient(rgba(99, 102, 241, 0.18) 1px, transparent 1px),
    linear-gradient(90deg, rgba(99, 102, 241, 0.18) 1px, transparent 1px);
  background-size: 60px 60px;
  box-shadow:
    0 0 100px rgba(99, 102, 241, 0.15) inset,
    0 0 220px rgba(34, 211, 238, 0.08);
  opacity: calc(0.3 + var(--scene-brightness, 1) * 0.5);
}

/* =========================================================
   街区立方体（5 个面）
========================================================= */
.zg-twin__cube {
  position: absolute;
  transform-style: preserve-3d;
  cursor: pointer;

  &--warn .zg-twin__cube-face--top    { background: linear-gradient(135deg, #f43f5e, #9f1239); box-shadow: 0 0 20px rgba(244, 63, 94, 0.6); }
  &--offline .zg-twin__cube-face--top { background: linear-gradient(135deg, #4b5563, #1f2937); }

  &--warn .zg-twin__cube-face--front,
  &--warn .zg-twin__cube-face--left   { background: linear-gradient(180deg, #5c2733, #2a0f17); }
}

.zg-twin__cube-face {
  position: absolute;
  border: 1px solid rgba(99, 102, 241, 0.12);
  box-sizing: border-box;
}
.zg-twin__cube-face--front {
  left: 0; bottom: 0;
  width: 100%; height: var(--cube-h);
  background: linear-gradient(180deg, #334155 0%, #1e293b 100%);
  transform-origin: bottom;
  transform: rotateX(-90deg);
}
.zg-twin__cube-face--back {
  left: 0; top: 100%;
  width: 100%; height: var(--cube-h);
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  transform-origin: top;
  transform: rotateX(90deg);
}
.zg-twin__cube-face--left {
  right: 100%; bottom: 0;
  width: var(--cube-h); height: 100%;
  background: linear-gradient(90deg, #2a3447, #0f172a);
  transform-origin: right;
  transform: rotateY(90deg);
}
.zg-twin__cube-face--right {
  left: 100%; bottom: 0;
  width: var(--cube-h); height: 100%;
  background: linear-gradient(270deg, #334155, #1e293b);
  transform-origin: left;
  transform: rotateY(-90deg);
}
.zg-twin__cube-face--top {
  left: 0; top: calc(var(--cube-h) * -1);
  width: 100%; height: 100%;
  background: linear-gradient(135deg, #10b981, #065f46);
  transform-origin: bottom center;
  transform: rotateX(90deg);
  box-shadow: 0 0 18px rgba(16, 185, 129, 0.4);
  transition: box-shadow 0.3s;
}

/* =========================================================
   灯杆：圆锥体 + 发光
========================================================= */
.zg-twin__lamp {
  position: absolute;
  width: 0; height: 0;
  transform-style: preserve-3d;
}
.zg-twin__lamp-pole {
  position: absolute;
  left: -3px; bottom: 0;
  width: 6px;
  height: var(--lamp-h);
  background: linear-gradient(180deg, #94a3b8, #475569);
  transform-origin: bottom center;
  transform: rotateX(-90deg);
  /* 让杆身"立起来"： rotateX(-90) 后，杆朝 -Z 方向；我们想要 +Y 方向，用 translateZ 校正 */
  transform: translateZ(calc(var(--lamp-h) * -1)) rotateX(90deg);
}
.zg-twin__lamp-cone {
  position: absolute;
  bottom: calc(var(--lamp-h) * -1);
  left: 50%;
  transform: translate(-50%, 50%) rotateX(90deg);
  width: 22px; height: 14px;
  border-radius: 50%;
  background: radial-gradient(circle, #fde68a 0%, #f59e0b 60%, #78350f 100%);
  box-shadow: 0 0 18px rgba(251, 191, 36, 0.9);
  animation: zg-lamp-pulse 2.4s ease-in-out infinite;
  animation-delay: calc(var(--lamp-glow-strength, 0.3) * 0s);
}
.zg-twin__lamp-glow {
  position: absolute;
  bottom: calc(var(--lamp-h) * -1);
  left: 50%;
  transform: translate(-50%, 50%);
  width: 60px; height: 60px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(253, 224, 71, 0.55), rgba(253, 224, 71, 0) 70%);
  filter: blur(4px);
  opacity: calc(0.4 + var(--lamp-glow-strength, 0.3) * 1.2);
  animation: zg-glow-breathe 3s ease-in-out infinite;
  pointer-events: none;

  &.is-warn {
    background: radial-gradient(circle, rgba(244, 63, 94, 0.7), rgba(244, 63, 94, 0) 70%);
    box-shadow: 0 0 22px rgba(244, 63, 94, 0.7);
  }
}

@keyframes zg-lamp-pulse {
  0%, 100% { box-shadow: 0 0 14px rgba(251, 191, 36, 0.8); }
  50%      { box-shadow: 0 0 30px rgba(251, 191, 36, 1), 0 0 50px rgba(253, 224, 71, 0.6); }
}
@keyframes zg-glow-breathe {
  0%, 100% { opacity: 0.3; transform: translate(-50%, 50%) scale(1); }
  50%      { opacity: 0.9; transform: translate(-50%, 50%) scale(1.2); }
}

/* =========================================================
   摄像头：小球 + 脉冲
========================================================= */
.zg-twin__cam {
  position: absolute;
  transform-style: preserve-3d;
  animation: zg-cam-float 5s ease-in-out infinite;
}
.zg-twin__cam-body {
  position: absolute;
  left: 50%;
  transform: translate(-50%, -100%);
  width: 16px; height: 16px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #a78bfa, #4c1d95);
  box-shadow: 0 0 14px rgba(167, 139, 250, 0.7);
}
.zg-twin__cam-pulse {
  position: absolute;
  left: 50%;
  transform: translate(-50%, -100%);
  width: 16px; height: 16px;
  border-radius: 50%;
  border: 2px solid rgba(167, 139, 250, 0.7);
  animation: zg-pulse-ring 2.4s ease-out infinite;
}
@keyframes zg-cam-float {
  0%, 100% { transform: translate(-50%, -100%) translateZ(120px); }
  50%      { transform: translate(-50%, -100%) translateZ(150px); }
}
@keyframes zg-pulse-ring {
  0%   { width: 16px; height: 16px; opacity: 0.9; }
  100% { width: 44px; height: 44px; opacity: 0; }
}

/* =========================================================
   无人机
========================================================= */
.zg-twin__drone {
  position: absolute;
  width: 40px; height: 40px;
  transform-style: preserve-3d;
}
.zg-twin__drone-box {
  position: absolute;
  left: 50%; top: 50%;
  width: 16px; height: 16px;
  transform: translate(-50%, -50%);
  background: linear-gradient(135deg, #22d3ee, #0891b2);
  border-radius: 3px;
  box-shadow: 0 0 10px rgba(34, 211, 238, 0.8);
}
.zg-twin__drone-prop {
  position: absolute;
  left: 50%; top: 50%;
  width: 36px; height: 2px;
  background: rgba(203, 213, 225, 0.6);
  transform-origin: center;
  &--a { transform: translate(-50%, -50%) rotateZ(0deg); animation: zg-prop-a 0.06s linear infinite; }
  &--b { transform: translate(-50%, -50%) rotateZ(45deg); animation: zg-prop-b 0.06s linear infinite; }
}
@keyframes zg-prop-a { to { transform: translate(-50%, -50%) rotateZ(180deg); } }
@keyframes zg-prop-b { to { transform: translate(-50%, -50%) rotateZ(225deg); } }

/* =========================================================
   告警热点
========================================================= */
.zg-twin__alert {
  position: absolute;
  z-index: 5;
}
.zg-twin__alert-core {
  position: absolute;
  width: 14px; height: 14px;
  border-radius: 50%;
  background: radial-gradient(circle, #fee2e2, #ef4444 50%, #991b1b);
  box-shadow: 0 0 18px 6px rgba(239, 68, 68, 0.8);
  animation: zg-alert-core 1.2s ease-in-out infinite;
}
.zg-twin__alert-ring {
  position: absolute;
  width: 14px; height: 14px;
  border-radius: 50%;
  border: 2px solid rgba(239, 68, 68, 0.85);
  animation: zg-alert-ring 1.6s ease-out infinite;
  &--delay { animation-delay: 0.8s; }
}
@keyframes zg-alert-core {
  0%, 100% { box-shadow: 0 0 10px 2px rgba(239, 68, 68, 0.6); }
  50%      { box-shadow: 0 0 26px 10px rgba(239, 68, 68, 0.9); }
}
@keyframes zg-alert-ring {
  0%   { width: 14px; height: 14px; opacity: 0.9; }
  100% { width: 80px; height: 80px; opacity: 0; }
}

/* =========================================================
   扫描光束
========================================================= */
.zg-twin__scanbeam {
  position: absolute;
  left: 50%; top: 50%;
  width: 80px; height: 1600px;
  transform: translate(-50%, -50%) rotateX(90deg);
  background: linear-gradient(180deg, transparent 0%, rgba(99, 102, 241, 0.05) 20%, rgba(99, 102, 241, 0.35) 50%, rgba(99, 102, 241, 0.05) 80%, transparent 100%);
  filter: blur(3px);
  animation: zg-scan 6s ease-in-out infinite;
  pointer-events: none;
}
@keyframes zg-scan {
  0%, 100% { transform: translate(-50%, -50%) rotateX(90deg) translateX(-400px); opacity: 0.25; }
  50%      { transform: translate(-50%, -50%) rotateX(90deg) translateX(400px); opacity: 0.9; }
}

/* =========================================================
   舞台 HUD 角标
========================================================= */
.zg-twin__stage-hud {
  position: absolute;
  top: 14px; left: 14px;
  display: flex; gap: 10px;
  z-index: 10;
  pointer-events: none;
}
.zg-twin__hud-cell {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 5px 12px;
  font-size: 12px;
  border-radius: 20px;
  background: rgba(10, 14, 39, 0.55);
  border: 1px solid rgba(99, 102, 241, 0.35);
  color: #c7d2fe;
  backdrop-filter: blur(4px);
  &--warn { color: #fda4af; border-color: rgba(244, 63, 94, 0.45); }
}

/* =========================================================
   右侧面板
========================================================= */
.zg-twin__sidebar {
  width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.zg-twin__panel {
  border: var(--panel-border);
  border-radius: 12px;
  background: var(--panel-bg);
  backdrop-filter: blur(8px);
  padding: 14px 16px;
  &--flex { flex: 1; display: flex; flex-direction: column; min-height: 220px; }
}
.zg-twin__panel-head {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; font-weight: 600;
  color: #c7d2fe;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px dashed rgba(99, 102, 241, 0.3);
}
.zg-twin__panel-badge {
  margin-left: auto;
  padding: 2px 8px;
  font-size: 11px;
  border-radius: 10px;
  background: rgba(244, 63, 94, 0.2);
  color: #fda4af;
  border: 1px solid rgba(244, 63, 94, 0.4);
}

.zg-twin__layer-list,
.zg-twin__metric-list {
  list-style: none; margin: 0; padding: 0;
}
.zg-twin__layer-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(99, 102, 241, 0.1);
  &:last-child { border-bottom: none; }
}
.zg-twin__layer-name {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 13px; color: #d0d7f5;
}

.zg-twin__metric-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: baseline;
  column-gap: 10px;
  padding: 9px 0;
  border-bottom: 1px solid rgba(99, 102, 241, 0.1);
  &:last-child { border-bottom: none; }
}
.zg-twin__metric-lbl { font-size: 12px; color: #9aa3d6; }
.zg-twin__metric-num {
  font-size: 22px; font-weight: 700; font-variant-numeric: tabular-nums;
  background: var(--neon-text);
  -webkit-background-clip: text; background-clip: text; color: transparent;
  &.ok   { background: linear-gradient(90deg, #34d399, #059669); -webkit-background-clip: text; background-clip: text; color: transparent; }
  &.warn { background: linear-gradient(90deg, #fb7185, #be123c); -webkit-background-clip: text; background-clip: text; color: transparent; }
  &.neon { background: var(--neon-text); -webkit-background-clip: text; background-clip: text; color: transparent; }
}
.zg-twin__metric-unit { font-size: 11px; color: #6b7ab0; }

/* 告警列表 */
.zg-twin__alert-list {
  list-style: none; margin: 0; padding: 0;
  flex: 1; overflow: hidden;
}
.zg-twin__alert-item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 0;
  border-bottom: 1px solid rgba(244, 63, 94, 0.12);
  cursor: pointer;
  transition: background 0.2s;
  border-radius: 4px;
  padding: 9px 6px;
  &:hover { background: rgba(244, 63, 94, 0.08); }
}
.zg-twin__alert-rank {
  width: 22px; height: 22px;
  display: grid; place-items: center;
  font-size: 11px; font-weight: 700;
  color: white;
  border-radius: 50%;
  background: linear-gradient(135deg, #ef4444, #9f1239);
  flex-shrink: 0;
}
.zg-twin__alert-body { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1; }
.zg-twin__alert-title { font-size: 13px; color: #fecaca; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.zg-twin__alert-sub { font-size: 11px; color: #9aa3d6; }
.zg-twin__alert-level {
  font-size: 10px; padding: 2px 8px; border-radius: 4px; flex-shrink: 0;
  &.high { background: rgba(239, 68, 68, 0.2); color: #fda4af; border: 1px solid rgba(239, 68, 68, 0.4); }
  &.mid  { background: rgba(245, 158, 11, 0.2); color: #fcd34d; border: 1px solid rgba(245, 158, 11, 0.4); }
  &.low  { background: rgba(59, 130, 246, 0.2); color: #93c5fd; border: 1px solid rgba(59, 130, 246, 0.4); }
}

/* =========================================================
   底部数据条
========================================================= */
.zg-twin__bottom {
  position: relative;
  z-index: 10;
  margin: 12px 24px 18px;
  padding: 12px 16px;
  border: var(--panel-border);
  border-radius: 12px;
  background: var(--panel-bg);
  backdrop-filter: blur(8px);
  display: grid;
  grid-template-columns: 320px 1fr 320px;
  gap: 18px;
  align-items: center;
}

.zg-twin__timeline {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  align-items: center;
  gap: 10px;
}
.zg-twin__timeline-label {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 12px; color: #a5b0e6; white-space: nowrap;
}
.zg-twin__timeline-slider { width: 100%; }
.zg-twin__timeline-time {
  font-size: 15px; font-weight: 600;
  color: #c7d2fe; font-variant-numeric: tabular-nums;
}
.zg-twin__timeline-phase {
  padding: 2px 8px;
  font-size: 11px;
  border-radius: 4px;
  background: rgba(99, 102, 241, 0.2);
  color: #a5b4fc;
  border: 1px solid rgba(99, 102, 241, 0.4);
}

/* 遥测流 */
.zg-twin__telemetry {
  display: flex; flex-direction: column; gap: 4px; min-width: 0;
}
.zg-twin__telemetry-head {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 11px; color: #67e8f9;
}
.zg-twin__telemetry-body {
  overflow: hidden;
  height: 48px;
  position: relative;
}
.zg-twin__telemetry-track {
  display: flex; flex-direction: column;
  animation: zg-telemetry-scroll 24s linear infinite;
}
.zg-twin__telemetry-row {
  font-family: 'JetBrains Mono', 'Consolas', monospace;
  font-size: 12px;
  color: #a5b4fc;
  padding: 3px 0;
  white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis;
  &:nth-child(odd)  { color: #67e8f9; }
  &:nth-child(3n)    { color: #c4b5fd; }
}
@keyframes zg-telemetry-scroll {
  0%   { transform: translateY(0); }
  100% { transform: translateY(-50%); }
}

/* KPI 数字跳动 */
.zg-twin__kpis {
  display: flex; justify-content: space-between; gap: 10px;
}
.zg-twin__kpi {
  display: flex; flex-direction: column; align-items: center;
  flex: 1;
  padding: 6px 8px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(99, 102, 241, 0.18);
}
.zg-twin__kpi-label { font-size: 11px; color: #9aa3d6; }
.zg-twin__kpi-num {
  font-size: 22px; font-weight: 700; font-variant-numeric: tabular-nums;
  background: var(--neon-text);
  -webkit-background-clip: text; background-clip: text; color: transparent;
  &.cyan    { background: linear-gradient(90deg, #22d3ee, #0891b2); -webkit-background-clip: text; background-clip: text; color: transparent; }
  &.amber   { background: linear-gradient(90deg, #fbbf24, #d97706); -webkit-background-clip: text; background-clip: text; color: transparent; }
  &.violet  { background: linear-gradient(90deg, #c084fc, #7c3aed); -webkit-background-clip: text; background-clip: text; color: transparent; }
}
.zg-twin__kpi-unit { font-size: 10px; color: #6b7ab0; }

/* =========================================================
   抽屉 / 灯杆详情
========================================================= */
.zg-twin :deep(.el-drawer) {
  background: linear-gradient(180deg, #0a0e27, #050818) !important;
  border-left: 1px solid rgba(99, 102, 241, 0.4);
  color: #e6e9ff;
}
.zg-twin__drawer-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(99, 102, 241, 0.2);
}
.zg-twin__drawer-title {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 16px; font-weight: 600;
  background: var(--neon-text);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.zg-twin__drawer-body { padding: 18px 20px 24px; }

.zg-twin__lamp-card {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px;
  border-radius: 10px;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.3);
  margin-bottom: 18px;
}
.zg-twin__lamp-no {
  font-size: 22px; font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  color: #c7d2fe;
}
.zg-twin__lamp-stat {
  padding: 4px 12px; border-radius: 4px; font-size: 12px;
  &.online  { background: rgba(16, 185, 129, 0.2); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.4); }
  &.warn    { background: rgba(244, 63, 94, 0.2); color: #fda4af; border: 1px solid rgba(244, 63, 94, 0.4); }
  &.offline { background: rgba(107, 114, 128, 0.2); color: #d1d5db; border: 1px solid rgba(107, 114, 128, 0.4); }
}

.zg-twin__kv {
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 10px 12px;
  margin: 0 0 18px;
  font-size: 13px;
  dd { margin: 0; color: #c7d2fe; font-variant-numeric: tabular-nums; }
  dt { color: #6b7ab0; font-size: 12px; }
}

.zg-twin__hist, .zg-twin__alarm-hist { margin-bottom: 16px; }
.zg-twin__hist-title {
  font-size: 12px; color: #9aa3d6;
  margin-bottom: 10px; letter-spacing: 0.3px;
}
.zg-twin__hist-bars {
  display: flex; align-items: flex-end; gap: 3px;
  height: 60px;
  padding: 8px;
  border-radius: 6px;
  background: rgba(99, 102, 241, 0.05);
  border: 1px solid rgba(99, 102, 241, 0.2);
}
.zg-twin__hist-bar {
  flex: 1;
  background: linear-gradient(180deg, #818cf8, #4338ca);
  border-radius: 2px 2px 0 0;
  min-height: 4px;
  box-shadow: 0 0 6px rgba(129, 140, 248, 0.5);
}

.zg-twin__alarm-list { list-style: none; margin: 0; padding: 0; }
.zg-twin__alarm-hist-item {
  display: grid;
  grid-template-columns: 52px 1fr 60px;
  gap: 8px;
  align-items: center;
  padding: 7px 0;
  font-size: 12px;
  border-bottom: 1px dashed rgba(99, 102, 241, 0.15);
  &:last-child { border-bottom: none; }
}
.zg-twin__alarm-hist-empty {
  padding: 16px 0; text-align: center;
  color: #6b7ab0; font-size: 12px;
}
.zg-twin__alarm-tag {
  display: inline-block; text-align: center;
  padding: 1px 6px; border-radius: 3px; font-size: 10px;
  &.high { background: rgba(239, 68, 68, 0.2); color: #fda4af; }
  &.mid  { background: rgba(245, 158, 11, 0.2); color: #fcd34d; }
  &.low  { background: rgba(59, 130, 246, 0.2); color: #93c5fd; }
}
.zg-twin__alarm-time { color: #6b7ab0; font-size: 11px; text-align: right; }</style>
