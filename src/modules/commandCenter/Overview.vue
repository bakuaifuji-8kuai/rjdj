<template>
  <div class="zg-command">
    <!-- 背景装饰 -->
    <div class="bg-decor">
      <div class="bg-glow bg-glow--tl"></div>
      <div class="bg-glow bg-glow--br"></div>
      <div class="bg-grid"></div>
    </div>

    <!-- 顶部标题栏 -->
    <header class="zg-header">
      <div class="header-left">
        <div class="logo">
          <div class="logo-icon">
            <Monitor />
          </div>
          <div class="logo-text">
            <span class="title-main">智光云枢 · 城市照明指挥中心</span>
            <span class="title-sub">SMART LIGHTING COMMAND CENTER</span>
          </div>
        </div>
      </div>
      <div class="header-center">
        <div class="center-title">
          <span class="deco-line deco-line--left"></span>
          <span class="center-text">指挥中心 · 数据大屏</span>
          <span class="deco-line deco-line--right"></span>
        </div>
      </div>
      <div class="header-right">
        <div class="clock">
          <div class="clock-date">{{ currentDate }}</div>
          <div class="clock-time">
            <span>{{ hh }}</span>
            <span class="clock-sep">:</span>
            <span>{{ mm }}</span>
            <span class="clock-sep">:</span>
            <span>{{ ss }}</span>
          </div>
        </div>
        <el-select v-model="region" class="region-select" size="default">
          <el-option
            v-for="item in regions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <div class="status-dot">
          <span class="dot-inner"></span>
          <span>系统在线</span>
        </div>
      </div>
    </header>

    <!-- 主体区域 -->
    <main class="zg-main">
      <!-- 左侧栏 -->
      <section class="col col-left">
        <!-- KPI 卡片组 -->
        <div class="kpi-grid">
          <div
            v-for="(kpi, idx) in kpis"
            :key="idx"
            class="kpi-card"
            :style="{ '--accent': kpi.color }"
          >
            <div class="kpi-border"></div>
            <div class="kpi-inner">
              <div class="kpi-head">
                <component :is="kpi.icon" class="kpi-icon" />
                <span class="kpi-label">{{ kpi.label }}</span>
              </div>
              <div class="kpi-value">
                <span class="num">{{ kpi.value }}</span>
                <span class="unit">{{ kpi.unit }}</span>
              </div>
              <div class="kpi-foot">
                <span :class="['trend', kpi.trend >= 0 ? 'up' : 'down']">
                  <component :is="kpi.trend >= 0 ? Top : Bottom" />
                  {{ Math.abs(kpi.trend) }}%
                </span>
                <span class="vs">同比上周</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 能耗趋势柱状图 -->
        <div class="panel">
          <div class="panel-head">
            <span class="panel-title">能耗趋势（近 7 天）</span>
            <span class="panel-sub">单位 MWh</span>
          </div>
          <div class="panel-body">
            <div class="bar-chart">
              <div class="bar-grid">
                <span v-for="i in 4" :key="i" class="grid-line"></span>
              </div>
              <div class="bar-list">
                <div
                  v-for="(item, idx) in energyTrend"
                  :key="idx"
                  class="bar-item"
                >
                  <div class="bar-wrapper">
                    <div
                      class="bar"
                      :style="{ height: item.pct + '%' }"
                    ></div>
                    <div class="bar-tooltip">
                      <b>{{ item.value }} MWh</b>
                      <span>{{ item.day }}</span>
                    </div>
                  </div>
                  <div class="bar-label">{{ item.dayShort }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 设备类型分布 -->
        <div class="panel">
          <div class="panel-head">
            <span class="panel-title">设备类型分布</span>
            <span class="panel-sub">共 {{ totalDevices.toLocaleString() }} 台</span>
          </div>
          <div class="panel-body donut-body">
            <div class="donut-wrap">
              <svg viewBox="0 0 120 120" class="donut">
                <circle cx="60" cy="60" r="48" class="donut-track" />
                <circle
                  v-for="(seg, idx) in donutSegments"
                  :key="idx"
                  cx="60"
                  cy="60"
                  r="48"
                  class="donut-slice"
                  :style="{
                    stroke: seg.color,
                    strokeDasharray: seg.dash,
                    strokeDashoffset: seg.offset,
                  }"
                />
              </svg>
              <div class="donut-center">
                <div class="center-num">{{ totalDevices.toLocaleString() }}</div>
                <div class="center-lbl">设备总数</div>
              </div>
            </div>
            <div class="donut-legend">
              <div
                v-for="(seg, idx) in donutSegments"
                :key="idx"
                class="legend-item"
              >
                <span class="legend-dot" :style="{ background: seg.color }"></span>
                <span class="legend-name">{{ seg.name }}</span>
                <span class="legend-val">{{ seg.count.toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 中间地图区 -->
      <section class="col col-center">
        <div class="panel map-panel">
          <div class="panel-head">
            <span class="panel-title">城市照明实景 · {{ regionLabel }}</span>
            <div class="legend-inline">
              <span class="lg-item"><i class="lg-dot lg-lamp"></i>灯杆</span>
              <span class="lg-item"><i class="lg-dot lg-cam"></i>摄像头</span>
              <span class="lg-item"><i class="lg-dot lg-char"></i>充电桩</span>
            </div>
          </div>
          <div class="panel-body map-body">
            <!-- 扫描光束 -->
            <div class="scan-beam"></div>
            <!-- 网格 -->
            <div class="map-grid"></div>
            <!-- 城市轮廓 SVG -->
            <svg viewBox="0 0 800 520" class="city-svg" preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="cityFill" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stop-color="#1e3a8a" stop-opacity="0.45" />
                  <stop offset="100%" stop-color="#6366f1" stop-opacity="0.15" />
                </linearGradient>
                <linearGradient id="cityStroke" x1="0" x2="1">
                  <stop offset="0%" stop-color="#06b6d4" />
                  <stop offset="100%" stop-color="#8b5cf6" />
                </linearGradient>
              </defs>
              <!-- 岳麓区轮廓（示意） -->
              <path
                d="M80,120 L180,80 L320,60 L480,90 L620,70 L720,140 L740,260 L700,380 L580,460 L420,470 L260,440 L140,380 L70,280 Z"
                fill="url(#cityFill)"
                stroke="url(#cityStroke)"
                stroke-width="1.5"
                class="city-path"
              />
              <!-- 内部区块 -->
              <path
                d="M200,180 L360,150 L460,200 L420,320 L280,340 L220,280 Z"
                fill="rgba(99,102,241,0.18)"
                stroke="rgba(99,102,241,0.5)"
                stroke-width="1"
              />
              <path
                d="M480,180 L620,160 L680,240 L640,340 L540,340 L480,260 Z"
                fill="rgba(139,92,246,0.18)"
                stroke="rgba(139,92,246,0.5)"
                stroke-width="1"
              />
              <!-- 河流 -->
              <path
                d="M60,280 Q200,300 360,290 Q520,280 740,300"
                fill="none"
                stroke="#06b6d4"
                stroke-opacity="0.35"
                stroke-width="6"
              />
            </svg>

            <!-- 发光节点 -->
            <div
              v-for="(n, idx) in mapNodes"
              :key="idx"
              class="map-node"
              :class="'node-' + n.type"
              :style="{
                left: n.x + '%',
                top: n.y + '%',
                animationDelay: (idx * 0.3) + 's',
              }"
            >
              <span class="node-core"></span>
              <span class="node-pulse"></span>
            </div>

            <!-- 浮动标签 -->
            <div class="map-label" style="left: 30%; top: 40%">岳麓高新区</div>
            <div class="map-label" style="left: 60%; top: 65%">先导路片区</div>
            <div class="map-label" style="left: 20%; top: 70%">滨江新城</div>

            <!-- 地图底部数据条 -->
            <div class="map-stats">
              <div class="ms-item">
                <span class="ms-num">{{ mapStats.lamps }}</span>
                <span class="ms-lbl">在线灯杆</span>
              </div>
              <div class="ms-item">
                <span class="ms-num">{{ mapStats.cameras }}</span>
                <span class="ms-lbl">监控摄像头</span>
              </div>
              <div class="ms-item">
                <span class="ms-num">{{ mapStats.chargers }}</span>
                <span class="ms-lbl">充电桩</span>
              </div>
              <div class="ms-item">
                <span class="ms-num">{{ mapStats.alerts }}</span>
                <span class="ms-lbl">活跃告警</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 右侧栏 -->
      <section class="col col-right">
        <!-- 实时告警流 -->
        <div class="panel">
          <div class="panel-head">
            <span class="panel-title">实时告警流</span>
            <span class="panel-sub live">
              <i class="live-dot"></i>LIVE
            </span>
          </div>
          <div class="panel-body alert-body">
            <div class="alert-scroll">
              <div
                v-for="(a, idx) in alertStream"
                :key="idx"
                class="alert-item"
                :class="'lv-' + a.level"
              >
                <span class="alert-dot"></span>
                <div class="alert-main">
                  <div class="alert-top">
                    <span class="alert-name">{{ a.name }}</span>
                    <span class="alert-level">{{ levelText(a.level) }}</span>
                  </div>
                  <div class="alert-sub">
                    <span class="alert-loc">📍 {{ a.location }}</span>
                    <span class="alert-time">{{ a.time }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Top 5 告警类型 -->
        <div class="panel">
          <div class="panel-head">
            <span class="panel-title">Top 5 告警类型</span>
            <span class="panel-sub">近 24h</span>
          </div>
          <div class="panel-body topn-body">
            <div
              v-for="(t, idx) in topWarningFilleds"
              :key="idx"
              class="topn-row"
            >
              <span class="topn-rank" :style="{ background: t.color }">
                {{ idx + 1 }}
              </span>
              <span class="topn-name">{{ t.name }}</span>
              <div class="topn-bar-wrap">
                <div
                  class="topn-bar"
                  :style="{ width: t.pct + '%', background: t.color }"
                ></div>
              </div>
              <span class="topn-val">{{ t.count }}</span>
            </div>
          </div>
        </div>

        <!-- 设备健康度 -->
        <div class="panel">
          <div class="panel-head">
            <span class="panel-title">设备健康度</span>
            <span class="panel-sub">综合评分 92.4</span>
          </div>
          <div class="panel-body gauge-body">
            <div
              v-for="(g, idx) in gauges"
              :key="idx"
              class="gauge-item"
            >
              <div class="gauge-ring" :style="{ '--val': g.pct, '--clr': g.color }">
                <svg viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="16" class="gr-track" />
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    class="gr-bar"
                    :style="{ stroke: g.color }"
                  />
                </svg>
                <span class="gr-text">{{ g.pct }}%</span>
              </div>
              <span class="gauge-label">{{ g.label }}</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, h } from 'vue'
import {
  Monitor,
  Connection,
  Cpu,
  Coin,
  DataAnalysis,
  Top,
  Bottom,
} from '@element-plus/icons-vue'

/* ---------- 实时时钟 ---------- */
const now = ref(new Date())
let timer = null
onMounted(() => {
  timer = setInterval(() => (now.value = new Date()), 1000)
})
onUnmounted(() => clearInterval(timer))

const pad = (n) => n.toString().padStart(2, '0')
const hh = computed(() => pad(now.value.getHours()))
const mm = computed(() => pad(now.value.getMinutes()))
const ss = computed(() => pad(now.value.getSeconds()))
const currentDate = computed(() => {
  const d = now.value
  const week = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()]
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}  星期${week}`
})

/* ---------- 区域选择 ---------- */
const regions = [
  { label: '长沙 · 岳麓区', value: 'yuelu' },
  { label: '长沙 · 天心区', value: 'tianxin' },
  { label: '长沙 · 开福区', value: 'kaifu' },
  { label: '长沙 · 雨花区', value: 'yuhua' },
  { label: '长沙 · 望城区', value: 'wangcheng' },
]
const region = ref('yuelu')
const regionLabel = computed(
  () => regions.find((r) => r.value === region.value)?.label ?? ''
)

/* ---------- KPI ---------- */
const kpis = [
  {
    label: '在网设备',
    value: '12,847',
    unit: '台',
    trend: 3.2,
    color: '#6366f1',
    icon: Connection,
  },
  {
    label: '今日能耗',
    value: '384.2',
    unit: 'MWh',
    trend: -1.8,
    color: '#06b6d4',
    icon: Cpu,
  },
  {
    label: '在线率',
    value: '98.7',
    unit: '%',
    trend: 0.4,
    color: '#10b981',
    icon: DataAnalysis,
  },
  {
    label: '年度节省',
    value: '¥5.6M',
    unit: '',
    trend: 12.6,
    color: '#f59e0b',
    icon: Coin,
  },
]

/* ---------- 能耗趋势 ---------- */
const energyTrend = [
  { day: '2026-10-21', dayShort: '10/21', value: 362.1, pct: 72 },
  { day: '2026-10-22', dayShort: '10/22', value: 348.5, pct: 69 },
  { day: '2026-10-23', dayShort: '10/23', value: 401.3, pct: 80 },
  { day: '2026-10-24', dayShort: '10/24', value: 426.8, pct: 85 },
  { day: '2026-10-25', dayShort: '10/25', value: 378.9, pct: 76 },
  { day: '2026-10-26', dayShort: '10/26', value: 395.4, pct: 79 },
  { day: '2026-10-27', dayShort: '今日', value: 384.2, pct: 77 },
]

/* ---------- 环形图 ---------- */
const donutData = [
  { name: '路灯', count: 8420, color: '#6366f1' },
  { name: '监控摄像头', count: 2180, color: '#06b6d4' },
  { name: '充电桩', count: 964, color: '#8b5cf6' },
  { name: '信号灯杆', count: 812, color: '#f59e0b' },
  { name: '环境传感器', count: 471, color: '#10b981' },
]
const totalDevices = computed(() => donutData.reduce((s, d) => s + d.count, 0))
const donutSegments = computed(() => {
  const c = 2 * Math.PI * 48
  let acc = 0
  return donutData.map((d) => {
    const frac = d.count / totalDevices.value
    const dash = frac * c
    const seg = {
      ...d,
      dash: `${dash} ${c - dash}`,
      offset: -acc,
    }
    acc += dash
    return seg
  })
})

/* ---------- 地图节点 ---------- */
const mapNodes = [
  { x: 18, y: 28, type: 'lamp' },
  { x: 26, y: 42, type: 'lamp' },
  { x: 33, y: 35, type: 'cam' },
  { x: 40, y: 50, type: 'lamp' },
  { x: 48, y: 30, type: 'char' },
  { x: 55, y: 45, type: 'lamp' },
  { x: 62, y: 38, type: 'cam' },
  { x: 70, y: 52, type: 'lamp' },
  { x: 75, y: 28, type: 'lamp' },
  { x: 22, y: 58, type: 'cam' },
  { x: 30, y: 68, type: 'char' },
  { x: 42, y: 62, type: 'lamp' },
  { x: 56, y: 72, type: 'lamp' },
  { x: 66, y: 65, type: 'cam' },
  { x: 78, y: 70, type: 'char' },
  { x: 14, y: 48, type: 'lamp' },
  { x: 85, y: 42, type: 'lamp' },
]
const mapStats = {
  lamps: '8,420',
  cameras: '2,180',
  chargers: '964',
  alerts: 17,
}

/* ---------- 实时告警流 ---------- */
const alertTemplates = [
  { name: 'LED 灯杆 L-YL-0021', level: 'danger' },
  { name: '监控摄像头 CAM-LG-088', level: 'warning' },
  { name: '直流充电桩 CHAR-XD-12', level: 'info' },
  { name: '太阳能路灯 L-HX-0314', level: 'warning' },
  { name: '箱式变电器 BXB-07', level: 'danger' },
  { name: '环境传感器 ENV-2205', level: 'info' },
  { name: '信号灯杆 SIG-JD-44', level: 'warning' },
  { name: 'LED 灯杆 L-YL-0156', level: 'info' },
  { name: '监控摄像头 CAM-BJ-033', level: 'danger' },
  { name: '充电桩 CHAR-GL-05', level: 'warning' },
  { name: '网关设备 GW-0218', level: 'info' },
  { name: 'LED 灯杆 L-XD-0078', level: 'danger' },
]
const locations = [
  '岳麓区 · 先导路 218 号',
  '岳麓区 · 麓谷大道 88 号',
  '岳麓区 · 滨江新城潇湘北路',
  '岳麓区 · 梅溪湖节庆岛',
  '岳麓区 · 咸嘉湖路 7 号',
  '岳麓区 · 桐梓坡西路 314 号',
  '岳麓区 · 东方红广场',
  '岳麓区 · 麓山南路口',
]
const rand = (n) => Math.floor(Math.random() * n)
const fmtTime = (d) =>
  `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
const genWarningFilleds = () => {
  const arr = []
  for (let i = 0; i < 12; i++) {
    const t = alertTemplates[rand(alertTemplates.length)]
    const d = new Date(Date.now() - rand(3600 * 1000))
    arr.push({
      ...t,
      location: locations[rand(locations.length)],
      time: fmtTime(d),
    })
  }
  return arr
}
const alertStream = ref(genWarningFilleds())
let alertTimer = null
onMounted(() => {
  alertTimer = setInterval(() => {
    alertStream.value = genWarningFilleds()
  }, 15000)
})
onUnmounted(() => clearInterval(alertTimer))
const levelText = (lv) =>
  ({ danger: '严重', warning: '警告', info: '提示' }[lv] ?? lv)

/* ---------- Top 5 告警 ---------- */
const topWarningFilleds = [
  { name: '通信中断', count: 48, pct: 100, color: '#ef4444' },
  { name: '照度异常', count: 32, pct: 67, color: '#f59e0b' },
  { name: '电流过载', count: 24, pct: 50, color: '#8b5cf6' },
  { name: '设备离线', count: 19, pct: 40, color: '#06b6d4' },
  { name: '温度过高', count: 12, pct: 25, color: '#6366f1' },
]

/* ---------- 健康度仪表盘 ---------- */
const gauges = [
  { label: '在线率', pct: 98, color: '#10b981' },
  { label: '电量', pct: 92, color: '#06b6d4' },
  { label: '亮度', pct: 87, color: '#f59e0b' },
  { label: '温度', pct: 76, color: '#6366f1' },
  { label: '通信', pct: 95, color: '#8b5cf6' },
]
</script>

<style scoped lang="scss">







/* ====== 根容器 ====== */
.zg-command {
  position: relative;
  width: 100%;
  min-height: 100vh;
  padding: 16px;
  box-sizing: border-box;
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif;
  color: #e2e8f0;
  overflow: hidden;
  background: linear-gradient(180deg, #0a1628 0%, #0d1f3c 50%, #0a1628 100%);
}

/* 背景装饰 */
.bg-decor {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}
.bg-glow {
  position: absolute;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.35;
}
.bg-glow--tl {
  top: -150px;
  left: -100px;
  background: radial-gradient(circle, #6366f1, transparent 70%);
}
.bg-glow--br {
  bottom: -180px;
  right: -120px;
  background: radial-gradient(circle, #06b6d4, transparent 70%);
}
.bg-grid {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(
      rgba(99, 102, 241, 0.08) 1px,
      transparent 1px
    ),
    linear-gradient(90deg, rgba(99, 102, 241, 0.08) 1px, transparent 1px);
  background-size: 60px 60px;
}

/* ====== 顶部标题栏 ====== */
.zg-header {
  position: relative;
  z-index: 1;
  height: 68px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 0 24px;
  margin-bottom: 16px;
  border-radius: 14px;
  background: linear-gradient(
    90deg,
    rgba(99, 102, 241, 0.15),
    rgba(6, 182, 212, 0.1),
    rgba(139, 92, 246, 0.15)
  );
  border: 1px solid rgba(99, 102, 241, 0.4);
  box-shadow: 0 0 24px rgba(99, 102, 241, 0.25), inset 0 0 12px rgba(99, 102, 241, 0.15);
  backdrop-filter: blur(6px);
}

.header-left {
  display: flex;
  align-items: center;
}
.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}
.logo-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #fff;
  background: linear-gradient(135deg, #6366f1, #06b6d4);
  box-shadow: 0 0 18px rgba(99, 102, 241, 0.7);
}
.logo-text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}
.title-main {
  font-size: 18px;
  font-weight: 700;
  background: linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 1px;
}
.title-sub {
  font-size: 10px;
  letter-spacing: 2px;
  color: rgba(148, 163, 184, 0.7);
  margin-top: 4px;
}

.header-center {
  display: flex;
  justify-content: center;
}
.center-title {
  display: flex;
  align-items: center;
  gap: 14px;
}
.center-text {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 4px;
  background: linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 30px rgba(99, 102, 241, 0.6);
}
.deco-line {
  display: inline-block;
  width: 80px;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(99, 102, 241, 0.9),
    transparent
  );
  position: relative;
}
.deco-line::after {
  content: '';
  position: absolute;
  top: -3px;
  left: 50%;
  transform: translateX(-50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #06b6d4;
  box-shadow: 0 0 10px #06b6d4;
}

.header-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 18px;
}
.clock {
  text-align: right;
}
.clock-date {
  font-size: 12px;
  color: rgba(148, 163, 184, 0.8);
  letter-spacing: 1px;
}
.clock-time {
  font-size: 22px;
  font-weight: 700;
  font-family: 'Consolas', 'Courier New', monospace;
  color: #fff;
  letter-spacing: 2px;
  text-shadow: 0 0 12px rgba(99, 102, 241, 0.8);
}
.clock-sep {
  animation: blink 1s infinite;
}
@keyframes blink {
  50% { opacity: 0.2; }
}

.region-select {
  :deep(.el-select__wrapper) {
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(99, 102, 241, 0.4);
    box-shadow: 0 0 12px rgba(99, 102, 241, 0.2);
    border-radius: 8px;
    min-width: 160px;
    padding: 0 10px;
    color: #fff;
  }
  :deep(.el-select__placeholder),
  :deep(.el-select__selected-item) {
    color: #e2e8f0;
  }
  :deep(.el-select__caret) {
    color: #6366f1;
  }
}

.status-dot {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #10b981;
  padding: 6px 12px;
  border-radius: 20px;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.4);
}
.dot-inner {
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  box-shadow: 0 0 8px #10b981;
  animation: pulse-dot 1.6s infinite;
}
@keyframes pulse-dot {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.4); opacity: 0.5; }
}

/* ====== 主体布局 ====== */
.zg-main {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 340px 1fr 340px;
  gap: 16px;
  height: calc(100vh - 68px - 32px);
  min-height: 680px;
}
.col {
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
}

/* ====== 面板通用 ====== */
.panel {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 14px 16px;
  border-radius: 14px;
  background: linear-gradient(
    160deg,
    rgba(15, 23, 42, 0.85),
    rgba(17, 24, 39, 0.7)
  );
  border: 1px solid rgba(99, 102, 241, 0.35);
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.15),
    inset 0 0 30px rgba(6, 182, 212, 0.04);
  backdrop-filter: blur(4px);
  overflow: hidden;
}
.panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #6366f1, #06b6d4, transparent);
}
.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  position: relative;
  padding-bottom: 10px;
  border-bottom: 1px dashed rgba(99, 102, 241, 0.25);
}
.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: #f1f5f9;
  position: relative;
  padding-left: 12px;
}
.panel-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 14px;
  background: linear-gradient(180deg, #6366f1, #06b6d4);
  border-radius: 2px;
  box-shadow: 0 0 8px #6366f1;
}
.panel-sub {
  font-size: 11px;
  color: rgba(148, 163, 184, 0.7);
  letter-spacing: 0.5px;
}
.panel-body {
  flex: 1;
  min-height: 0;
}

/* ====== KPI 卡片 ====== */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  flex: 0 0 auto;
}
.kpi-card {
  position: relative;
  border-radius: 12px;
  padding: 14px 14px 12px;
  background: linear-gradient(
    145deg,
    rgba(30, 41, 59, 0.7),
    rgba(15, 23, 42, 0.9)
  );
  border: 1px solid rgba(99, 102, 241, 0.3);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
}
.kpi-border {
  position: absolute;
  inset: 0;
  border-radius: 12px;
  padding: 1px;
  background: linear-gradient(
    135deg,
    var(--accent),
    transparent 60%,
    var(--accent)
    );
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0.7;
  pointer-events: none;
}
.kpi-inner {
  position: relative;
  z-index: 1;
}
.kpi-head {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: rgba(226, 232, 240, 0.75);
  margin-bottom: 6px;
}
.kpi-icon {
  font-size: 16px;
  color: var(--accent);
  filter: drop-shadow(0 0 6px var(--accent));
}
.kpi-value {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 6px;
}
.kpi-value .num {
  font-size: 26px;
  font-weight: 700;
  font-family: 'Consolas', monospace;
  color: #fff;
  text-shadow: 0 0 12px var(--accent), 0 0 24px rgba(0, 0, 0, 0.4);
  letter-spacing: 1px;
}
.kpi-value .unit {
  font-size: 12px;
  color: rgba(226, 232, 240, 0.65);
}
.kpi-foot {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
}
.trend {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-weight: 600;
}
.trend.up {
  color: #10b981;
}
.trend.down {
  color: #ef4444;
}
.vs {
  color: rgba(148, 163, 184, 0.6);
}

/* ====== 能耗柱状图 ====== */
.bar-chart {
  position: relative;
  height: 100%;
  min-height: 160px;
}
.bar-grid {
  position: absolute;
  inset: 0 0 22px 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.grid-line {
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(99, 102, 241, 0.25),
    transparent
    );
}
.bar-list {
  position: absolute;
  inset: 0 0 0 0;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 6px 2px 22px;
}
.bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}
.bar-wrapper {
  position: relative;
  width: 70%;
  height: calc(100% - 22px);
  display: flex;
  align-items: flex-end;
}
.bar {
  width: 100%;
  border-radius: 4px 4px 0 0;
  background: linear-gradient(180deg, #6366f1, #06b6d4);
  box-shadow: 0 0 10px rgba(99, 102, 241, 0.6),
    inset 0 0 6px rgba(255, 255, 255, 0.2);
  transition: all 0.3s;
  position: relative;
}
.bar-wrapper:hover .bar {
  background: linear-gradient(180deg, #8b5cf6, #06b6d4);
  box-shadow: 0 0 16px rgba(139, 92, 246, 0.9);
}
.bar-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(-8px);
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(99, 102, 241, 0.6);
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 11px;
  color: #fff;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
  box-shadow: 0 0 12px rgba(99, 102, 241, 0.5);
  display: flex;
  flex-direction: column;
  gap: 2px;
  z-index: 10;
}
.bar-wrapper:hover .bar-tooltip {
  opacity: 1;
}
.bar-tooltip b {
  color: #06b6d4;
  font-weight: 600;
}
.bar-tooltip span {
  color: rgba(226, 232, 240, 0.7);
  font-size: 10px;
}
.bar-label {
  position: absolute;
  bottom: 4px;
  font-size: 10px;
  color: rgba(148, 163, 184, 0.8);
}

/* ====== 环形图 ====== */
.donut-body {
  display: flex;
  gap: 14px;
  align-items: center;
  justify-content: center;
}
.donut-wrap {
  position: relative;
  width: 140px;
  height: 140px;
  flex-shrink: 0;
}
.donut {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}
.donut-track {
  fill: none;
  stroke: rgba(99, 102, 241, 0.15);
  stroke-width: 10;
}
.donut-slice {
  fill: none;
  stroke-width: 10;
  stroke-linecap: butt;
  transition: stroke-dasharray 0.6s ease;
  filter: drop-shadow(0 0 4px currentColor);
}
.donut-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.center-num {
  font-size: 22px;
  font-weight: 700;
  font-family: 'Consolas', monospace;
  color: #fff;
  text-shadow: 0 0 10px rgba(99, 102, 241, 0.8);
}
.center-lbl {
  font-size: 10px;
  color: rgba(148, 163, 184, 0.7);
  margin-top: 2px;
  letter-spacing: 1px;
}
.donut-legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 0;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}
.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  box-shadow: 0 0 6px currentColor;
  flex-shrink: 0;
}
.legend-name {
  flex: 1;
  color: rgba(226, 232, 240, 0.8);
}
.legend-val {
  font-family: 'Consolas', monospace;
  color: #06b6d4;
  font-weight: 600;
}

/* ====== 中间地图 ====== */
.map-panel {
  padding: 14px 18px;
}
.legend-inline {
  display: flex;
  gap: 14px;
  font-size: 11px;
  color: rgba(226, 232, 240, 0.75);
}
.lg-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.lg-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}
.lg-lamp {
  background: #f59e0b;
  box-shadow: 0 0 8px #f59e0b;
}
.lg-cam {
  background: #06b6d4;
  box-shadow: 0 0 8px #06b6d4;
}
.lg-char {
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
}

.map-body {
  position: relative;
  height: calc(100% - 40px);
  border-radius: 10px;
  overflow: hidden;
  background: radial-gradient(
      ellipse at 50% 50%,
      rgba(99, 102, 241, 0.12),
      transparent 70%
    ),
    linear-gradient(180deg, rgba(5, 10, 30, 0.8), rgba(5, 15, 35, 0.9));
  border: 1px solid rgba(99, 102, 241, 0.2);
}
.map-grid {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(
      rgba(99, 102, 241, 0.08) 1px,
      transparent 1px
    ),
    linear-gradient(90deg, rgba(99, 102, 241, 0.08) 1px, transparent 1px);
  background-size: 50px 50px;
  pointer-events: none;
}
.city-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.city-path {
  filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.6));
  animation: path-glow 4s ease-in-out infinite;
}
@keyframes path-glow {
  0%, 100% {
    filter: drop-shadow(0 0 6px rgba(99, 102, 241, 0.4)); }
  50% {
    filter: drop-shadow(0 0 14px rgba(6, 182, 212, 0.8)); }
}

/* 扫描光束 */
.scan-beam {
  position: absolute;
  left: 0;
  right: 0;
  height: 80px;
  background: linear-gradient(
    180deg,
    transparent,
    rgba(6, 182, 212, 0.25),
    rgba(139, 92, 246, 0.25),
    transparent
    );
  pointer-events: none;
  animation: scan 6s linear infinite;
  z-index: 2;
}
@keyframes scan {
  0% { top: -10%; }
  100% { top: 110%; }
}

/* 节点 */
.map-node {
  position: absolute;
  width: 14px;
  height: 14px;
  transform: translate(-50%, -50%);
  z-index: 3;
}
.node-core {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.node-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 14px;
  height: 14px;
  border-radius: 50%;
  animation: node-pulse 2.2s ease-in-out infinite;
}
@keyframes node-pulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  50% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}
.node-lamp .node-core {
  background: #f59e0b;
  box-shadow: 0 0 10px #f59e0b;
}
.node-lamp .node-pulse {
  border: 2px solid #f59e0b;
  box-shadow: 0 0 12px rgba(245, 158, 11, 0.7);
}
.node-cam .node-core {
  background: #06b6d4;
  box-shadow: 0 0 10px #06b6d4;
}
.node-cam .node-pulse {
  border: 2px solid #06b6d4;
  box-shadow: 0 0 12px rgba(6, 182, 212, 0.7);
}
.node-char .node-core {
  background: #10b981;
  box-shadow: 0 0 10px #10b981;
}
.node-char .node-pulse {
  border: 2px solid #10b981;
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.7);
}

/* 浮动标签 */
.map-label {
  position: absolute;
  font-size: 11px;
  color: rgba(226, 232, 240, 0.85);
  padding: 4px 10px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(99, 102, 241, 0.5);
  border-radius: 4px;
  transform: translate(-50%, -50%);
  z-index: 4;
  pointer-events: none;
  letter-spacing: 1px;
  box-shadow: 0 0 10px rgba(99, 102, 241, 0.3);
}

/* 地图底部统计 */
.map-stats {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 24px;
  padding: 10px 22px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(99, 102, 241, 0.4);
  border-radius: 10px;
  backdrop-filter: blur(6px);
  z-index: 5;
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
}
.ms-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.ms-num {
  font-size: 18px;
  font-weight: 700;
  font-family: 'Consolas', monospace;
  color: #06b6d4;
  text-shadow: 0 0 8px rgba(6, 182, 212, 0.8);
}
.ms-lbl {
  font-size: 10px;
  color: rgba(148, 163, 184, 0.8);
  letter-spacing: 1px;
}

/* ====== 实时告警流 ====== */
.live {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #ef4444 !important;
  font-weight: 600;
}
.live-dot {
  width: 6px;
  height: 6px;
  background: #ef4444;
  border-radius: 50%;
  box-shadow: 0 0 6px #ef4444;
  animation: pulse-dot 1s infinite;
}

.alert-body {
  overflow: hidden;
  height: calc(100% - 40px);
}
.alert-scroll {
  display: flex;
  flex-direction: column;
  gap: 8px;
  animation: alert-scroll 25s linear infinite;
}
@keyframes alert-scroll {
  0% { transform: translateY(0); }
  100% { transform: translateY(-50%); }
}
.alert-scroll:hover {
  animation-play-state: paused;
}
.alert-item {
  position: relative;
  padding: 10px 12px 10px 18px;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.6);
  border-left: 3px solid rgba(99, 102, 241, 0.4);
  display: flex;
  align-items: flex-start;
  gap: 10px;
  transition: background 0.2s;
}
.alert-item:hover {
  background: rgba(30, 41, 59, 0.85);
}
.alert-item.lv-danger {
  border-left-color: #ef4444;
  background: rgba(239, 68, 68, 0.08);
}
.alert-item.lv-warning {
  border-left-color: #f59e0b;
  background: rgba(245, 158, 11, 0.08);
}
.alert-item.lv-info {
  border-left-color: #06b6d4;
  background: rgba(6, 182, 212, 0.08);
}
.alert-dot {
  position: absolute;
  left: 6px;
  top: 14px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.lv-danger .alert-dot {
  background: #ef4444;
  box-shadow: 0 0 8px #ef4444;
}
.lv-warning .alert-dot {
  background: #f59e0b;
  box-shadow: 0 0 8px #f59e0b;
}
.lv-info .alert-dot {
  background: #06b6d4;
  box-shadow: 0 0 8px #06b6d4;
}
.alert-main {
  flex: 1;
  min-width: 0;
}
.alert-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  gap: 6px;
}
.alert-name {
  font-size: 12px;
  color: #f1f5f9;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.alert-level {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 3px;
  font-weight: 600;
  flex-shrink: 0;
}
.lv-danger .alert-level {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.18);
}
.lv-warning .alert-level {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.18);
}
.lv-info .alert-level {
  color: #06b6d4;
  background: rgba(6, 182, 212, 0.18);
}
.alert-sub {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: rgba(148, 163, 184, 0.75);
}
.alert-loc {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  margin-right: 8px;
}
.alert-time {
  font-family: 'Consolas', monospace;
  color: rgba(226, 232, 240, 0.6);
  flex-shrink: 0;
}

/* ====== Top 5 告警 ====== */
.topn-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
  padding: 4px 0;
}
.topn-row {
  display: grid;
  grid-template-columns: 20px 1fr 70px 40px;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}
.topn-rank {
  width: 20px;
  height: 20px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  font-family: 'Consolas', monospace;
  box-shadow: 0 0 8px currentColor;
}
.topn-name {
  color: rgba(226, 232, 240, 0.9);
}
.topn-bar-wrap {
  height: 8px;
  background: rgba(99, 102, 241, 0.12);
  border-radius: 4px;
  overflow: hidden;
}
.topn-bar {
  height: 100%;
  border-radius: 4px;
  box-shadow: 0 0 10px currentColor;
  transition: width 1s ease;
}
.topn-val {
  font-family: 'Consolas', monospace;
  color: #06b6d4;
  font-weight: 600;
  text-align: right;
}

/* ====== 健康度仪表盘 ====== */
.gauge-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 0;
}
.gauge-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 1;
}
.gauge-ring {
  position: relative;
  width: 62px;
  height: 62px;
}
.gauge-ring svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}
.gr-track {
  fill: none;
  stroke: rgba(99, 102, 241, 0.15);
  stroke-width: 4;
}
.gr-bar {
  fill: none;
  stroke-width: 4;
  stroke-linecap: round;
  stroke-dasharray: 100.53;
  stroke-dashoffset: calc(100.53 - (100.53 * var(--val)) / 100);
  filter: drop-shadow(0 0 4px currentColor);
  transition: stroke-dashoffset 1.2s ease;
}
.gr-text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  font-family: 'Consolas', monospace;
  color: #fff;
  text-shadow: 0 0 6px var(--clr);
}
.gauge-label {
  font-size: 11px;
  color: rgba(148, 163, 184, 0.8);
  letter-spacing: 1px;
}

/* ====== 响应式微调 ====== */
@media (max-width: 1600px) {
  .zg-main {
    grid-template-columns: 300px 1fr 300px;
  }
  .center-text {
    font-size: 18px;
    letter-spacing: 2px;
  }
}








/* ====== 根容器 ====== */
.zg-command {
  position: relative;
  width: 100%;
  min-height: 100vh;
  padding: 16px;
  box-sizing: border-box;
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif;
  color: #e2e8f0;
  overflow: hidden;
  background: linear-gradient(180deg, #0a1628 0%, #0d1f3c 50%, #0a1628 100%);
}

/* 背景装饰 */
.bg-decor {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}
.bg-glow {
  position: absolute;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.35;
}
.bg-glow--tl {
  top: -150px;
  left: -100px;
  background: radial-gradient(circle, #6366f1, transparent 70%);
}
.bg-glow--br {
  bottom: -180px;
  right: -120px;
  background: radial-gradient(circle, #06b6d4, transparent 70%);
}
.bg-grid {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(
      rgba(99, 102, 241, 0.08) 1px,
      transparent 1px
    ),
    linear-gradient(90deg, rgba(99, 102, 241, 0.08) 1px, transparent 1px);
  background-size: 60px 60px;
}

/* ====== 顶部标题栏 ====== */
.zg-header {
  position: relative;
  z-index: 1;
  height: 68px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 0 24px;
  margin-bottom: 16px;
  border-radius: 14px;
  background: linear-gradient(
    90deg,
    rgba(99, 102, 241, 0.15),
    rgba(6, 182, 212, 0.1),
    rgba(139, 92, 246, 0.15)
  );
  border: 1px solid rgba(99, 102, 241, 0.4);
  box-shadow: 0 0 24px rgba(99, 102, 241, 0.25), inset 0 0 12px rgba(99, 102, 241, 0.15);
  backdrop-filter: blur(6px);
}

.header-left {
  display: flex;
  align-items: center;
}
.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}
.logo-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #fff;
  background: linear-gradient(135deg, #6366f1, #06b6d4);
  box-shadow: 0 0 18px rgba(99, 102, 241, 0.7);
}
.logo-text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}
.title-main {
  font-size: 18px;
  font-weight: 700;
  background: linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 1px;
}
.title-sub {
  font-size: 10px;
  letter-spacing: 2px;
  color: rgba(148, 163, 184, 0.7);
  margin-top: 4px;
}

.header-center {
  display: flex;
  justify-content: center;
}
.center-title {
  display: flex;
  align-items: center;
  gap: 14px;
}
.center-text {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 4px;
  background: linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 30px rgba(99, 102, 241, 0.6);
}
.deco-line {
  display: inline-block;
  width: 80px;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(99, 102, 241, 0.9),
    transparent
  );
  position: relative;
}
.deco-line::after {
  content: '';
  position: absolute;
  top: -3px;
  left: 50%;
  transform: translateX(-50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #06b6d4;
  box-shadow: 0 0 10px #06b6d4;
}

.header-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 18px;
}
.clock {
  text-align: right;
}
.clock-date {
  font-size: 12px;
  color: rgba(148, 163, 184, 0.8);
  letter-spacing: 1px;
}
.clock-time {
  font-size: 22px;
  font-weight: 700;
  font-family: 'Consolas', 'Courier New', monospace;
  color: #fff;
  letter-spacing: 2px;
  text-shadow: 0 0 12px rgba(99, 102, 241, 0.8);
}
.clock-sep {
  animation: blink 1s infinite;
}
@keyframes blink {
  50% { opacity: 0.2; }
}

.region-select {
  :deep(.el-select__wrapper) {
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(99, 102, 241, 0.4);
    box-shadow: 0 0 12px rgba(99, 102, 241, 0.2);
    border-radius: 8px;
    min-width: 160px;
    padding: 0 10px;
    color: #fff;
  }
  :deep(.el-select__placeholder),
  :deep(.el-select__selected-item) {
    color: #e2e8f0;
  }
  :deep(.el-select__caret) {
    color: #6366f1;
  }
}

.status-dot {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #10b981;
  padding: 6px 12px;
  border-radius: 20px;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.4);
}
.dot-inner {
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  box-shadow: 0 0 8px #10b981;
  animation: pulse-dot 1.6s infinite;
}
@keyframes pulse-dot {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.4); opacity: 0.5; }
}

/* ====== 主体布局 ====== */
.zg-main {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 340px 1fr 340px;
  gap: 16px;
  height: calc(100vh - 68px - 32px);
  min-height: 680px;
}
.col {
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
}

/* ====== 面板通用 ====== */
.panel {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 14px 16px;
  border-radius: 14px;
  background: linear-gradient(
    160deg,
    rgba(15, 23, 42, 0.85),
    rgba(17, 24, 39, 0.7)
  );
  border: 1px solid rgba(99, 102, 241, 0.35);
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.15),
    inset 0 0 30px rgba(6, 182, 212, 0.04);
  backdrop-filter: blur(4px);
  overflow: hidden;
}
.panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #6366f1, #06b6d4, transparent);
}
.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  position: relative;
  padding-bottom: 10px;
  border-bottom: 1px dashed rgba(99, 102, 241, 0.25);
}
.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: #f1f5f9;
  position: relative;
  padding-left: 12px;
}
.panel-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 14px;
  background: linear-gradient(180deg, #6366f1, #06b6d4);
  border-radius: 2px;
  box-shadow: 0 0 8px #6366f1;
}
.panel-sub {
  font-size: 11px;
  color: rgba(148, 163, 184, 0.7);
  letter-spacing: 0.5px;
}
.panel-body {
  flex: 1;
  min-height: 0;
}

/* ====== KPI 卡片 ====== */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  flex: 0 0 auto;
}
.kpi-card {
  position: relative;
  border-radius: 12px;
  padding: 14px 14px 12px;
  background: linear-gradient(
    145deg,
    rgba(30, 41, 59, 0.7),
    rgba(15, 23, 42, 0.9)
  );
  border: 1px solid rgba(99, 102, 241, 0.3);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
}
.kpi-border {
  position: absolute;
  inset: 0;
  border-radius: 12px;
  padding: 1px;
  background: linear-gradient(
    135deg,
    var(--accent),
    transparent 60%,
    var(--accent)
    );
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0.7;
  pointer-events: none;
}
.kpi-inner {
  position: relative;
  z-index: 1;
}
.kpi-head {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: rgba(226, 232, 240, 0.75);
  margin-bottom: 6px;
}
.kpi-icon {
  font-size: 16px;
  color: var(--accent);
  filter: drop-shadow(0 0 6px var(--accent));
}
.kpi-value {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 6px;
}
.kpi-value .num {
  font-size: 26px;
  font-weight: 700;
  font-family: 'Consolas', monospace;
  color: #fff;
  text-shadow: 0 0 12px var(--accent), 0 0 24px rgba(0, 0, 0, 0.4);
  letter-spacing: 1px;
}
.kpi-value .unit {
  font-size: 12px;
  color: rgba(226, 232, 240, 0.65);
}
.kpi-foot {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
}
.trend {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-weight: 600;
}
.trend.up {
  color: #10b981;
}
.trend.down {
  color: #ef4444;
}
.vs {
  color: rgba(148, 163, 184, 0.6);
}

/* ====== 能耗柱状图 ====== */
.bar-chart {
  position: relative;
  height: 100%;
  min-height: 160px;
}
.bar-grid {
  position: absolute;
  inset: 0 0 22px 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.grid-line {
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(99, 102, 241, 0.25),
    transparent
    );
}
.bar-list {
  position: absolute;
  inset: 0 0 0 0;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 6px 2px 22px;
}
.bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}
.bar-wrapper {
  position: relative;
  width: 70%;
  height: calc(100% - 22px);
  display: flex;
  align-items: flex-end;
}
.bar {
  width: 100%;
  border-radius: 4px 4px 0 0;
  background: linear-gradient(180deg, #6366f1, #06b6d4);
  box-shadow: 0 0 10px rgba(99, 102, 241, 0.6),
    inset 0 0 6px rgba(255, 255, 255, 0.2);
  transition: all 0.3s;
  position: relative;
}
.bar-wrapper:hover .bar {
  background: linear-gradient(180deg, #8b5cf6, #06b6d4);
  box-shadow: 0 0 16px rgba(139, 92, 246, 0.9);
}
.bar-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(-8px);
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(99, 102, 241, 0.6);
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 11px;
  color: #fff;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
  box-shadow: 0 0 12px rgba(99, 102, 241, 0.5);
  display: flex;
  flex-direction: column;
  gap: 2px;
  z-index: 10;
}
.bar-wrapper:hover .bar-tooltip {
  opacity: 1;
}
.bar-tooltip b {
  color: #06b6d4;
  font-weight: 600;
}
.bar-tooltip span {
  color: rgba(226, 232, 240, 0.7);
  font-size: 10px;
}
.bar-label {
  position: absolute;
  bottom: 4px;
  font-size: 10px;
  color: rgba(148, 163, 184, 0.8);
}

/* ====== 环形图 ====== */
.donut-body {
  display: flex;
  gap: 14px;
  align-items: center;
  justify-content: center;
}
.donut-wrap {
  position: relative;
  width: 140px;
  height: 140px;
  flex-shrink: 0;
}
.donut {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}
.donut-track {
  fill: none;
  stroke: rgba(99, 102, 241, 0.15);
  stroke-width: 10;
}
.donut-slice {
  fill: none;
  stroke-width: 10;
  stroke-linecap: butt;
  transition: stroke-dasharray 0.6s ease;
  filter: drop-shadow(0 0 4px currentColor);
}
.donut-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.center-num {
  font-size: 22px;
  font-weight: 700;
  font-family: 'Consolas', monospace;
  color: #fff;
  text-shadow: 0 0 10px rgba(99, 102, 241, 0.8);
}
.center-lbl {
  font-size: 10px;
  color: rgba(148, 163, 184, 0.7);
  margin-top: 2px;
  letter-spacing: 1px;
}
.donut-legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 0;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}
.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  box-shadow: 0 0 6px currentColor;
  flex-shrink: 0;
}
.legend-name {
  flex: 1;
  color: rgba(226, 232, 240, 0.8);
}
.legend-val {
  font-family: 'Consolas', monospace;
  color: #06b6d4;
  font-weight: 600;
}

/* ====== 中间地图 ====== */
.map-panel {
  padding: 14px 18px;
}
.legend-inline {
  display: flex;
  gap: 14px;
  font-size: 11px;
  color: rgba(226, 232, 240, 0.75);
}
.lg-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.lg-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}
.lg-lamp {
  background: #f59e0b;
  box-shadow: 0 0 8px #f59e0b;
}
.lg-cam {
  background: #06b6d4;
  box-shadow: 0 0 8px #06b6d4;
}
.lg-char {
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
}

.map-body {
  position: relative;
  height: calc(100% - 40px);
  border-radius: 10px;
  overflow: hidden;
  background: radial-gradient(
      ellipse at 50% 50%,
      rgba(99, 102, 241, 0.12),
      transparent 70%
    ),
    linear-gradient(180deg, rgba(5, 10, 30, 0.8), rgba(5, 15, 35, 0.9));
  border: 1px solid rgba(99, 102, 241, 0.2);
}
.map-grid {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(
      rgba(99, 102, 241, 0.08) 1px,
      transparent 1px
    ),
    linear-gradient(90deg, rgba(99, 102, 241, 0.08) 1px, transparent 1px);
  background-size: 50px 50px;
  pointer-events: none;
}
.city-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.city-path {
  filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.6));
  animation: path-glow 4s ease-in-out infinite;
}
@keyframes path-glow {
  0%, 100% {
    filter: drop-shadow(0 0 6px rgba(99, 102, 241, 0.4)); }
  50% {
    filter: drop-shadow(0 0 14px rgba(6, 182, 212, 0.8)); }
}

/* 扫描光束 */
.scan-beam {
  position: absolute;
  left: 0;
  right: 0;
  height: 80px;
  background: linear-gradient(
    180deg,
    transparent,
    rgba(6, 182, 212, 0.25),
    rgba(139, 92, 246, 0.25),
    transparent
    );
  pointer-events: none;
  animation: scan 6s linear infinite;
  z-index: 2;
}
@keyframes scan {
  0% { top: -10%; }
  100% { top: 110%; }
}

/* 节点 */
.map-node {
  position: absolute;
  width: 14px;
  height: 14px;
  transform: translate(-50%, -50%);
  z-index: 3;
}
.node-core {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.node-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 14px;
  height: 14px;
  border-radius: 50%;
  animation: node-pulse 2.2s ease-in-out infinite;
}
@keyframes node-pulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  50% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}
.node-lamp .node-core {
  background: #f59e0b;
  box-shadow: 0 0 10px #f59e0b;
}
.node-lamp .node-pulse {
  border: 2px solid #f59e0b;
  box-shadow: 0 0 12px rgba(245, 158, 11, 0.7);
}
.node-cam .node-core {
  background: #06b6d4;
  box-shadow: 0 0 10px #06b6d4;
}
.node-cam .node-pulse {
  border: 2px solid #06b6d4;
  box-shadow: 0 0 12px rgba(6, 182, 212, 0.7);
}
.node-char .node-core {
  background: #10b981;
  box-shadow: 0 0 10px #10b981;
}
.node-char .node-pulse {
  border: 2px solid #10b981;
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.7);
}

/* 浮动标签 */
.map-label {
  position: absolute;
  font-size: 11px;
  color: rgba(226, 232, 240, 0.85);
  padding: 4px 10px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(99, 102, 241, 0.5);
  border-radius: 4px;
  transform: translate(-50%, -50%);
  z-index: 4;
  pointer-events: none;
  letter-spacing: 1px;
  box-shadow: 0 0 10px rgba(99, 102, 241, 0.3);
}

/* 地图底部统计 */
.map-stats {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 24px;
  padding: 10px 22px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(99, 102, 241, 0.4);
  border-radius: 10px;
  backdrop-filter: blur(6px);
  z-index: 5;
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
}
.ms-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.ms-num {
  font-size: 18px;
  font-weight: 700;
  font-family: 'Consolas', monospace;
  color: #06b6d4;
  text-shadow: 0 0 8px rgba(6, 182, 212, 0.8);
}
.ms-lbl {
  font-size: 10px;
  color: rgba(148, 163, 184, 0.8);
  letter-spacing: 1px;
}

/* ====== 实时告警流 ====== */
.live {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #ef4444 !important;
  font-weight: 600;
}
.live-dot {
  width: 6px;
  height: 6px;
  background: #ef4444;
  border-radius: 50%;
  box-shadow: 0 0 6px #ef4444;
  animation: pulse-dot 1s infinite;
}

.alert-body {
  overflow: hidden;
  height: calc(100% - 40px);
}
.alert-scroll {
  display: flex;
  flex-direction: column;
  gap: 8px;
  animation: alert-scroll 25s linear infinite;
}
@keyframes alert-scroll {
  0% { transform: translateY(0); }
  100% { transform: translateY(-50%); }
}
.alert-scroll:hover {
  animation-play-state: paused;
}
.alert-item {
  position: relative;
  padding: 10px 12px 10px 18px;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.6);
  border-left: 3px solid rgba(99, 102, 241, 0.4);
  display: flex;
  align-items: flex-start;
  gap: 10px;
  transition: background 0.2s;
}
.alert-item:hover {
  background: rgba(30, 41, 59, 0.85);
}
.alert-item.lv-danger {
  border-left-color: #ef4444;
  background: rgba(239, 68, 68, 0.08);
}
.alert-item.lv-warning {
  border-left-color: #f59e0b;
  background: rgba(245, 158, 11, 0.08);
}
.alert-item.lv-info {
  border-left-color: #06b6d4;
  background: rgba(6, 182, 212, 0.08);
}
.alert-dot {
  position: absolute;
  left: 6px;
  top: 14px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.lv-danger .alert-dot {
  background: #ef4444;
  box-shadow: 0 0 8px #ef4444;
}
.lv-warning .alert-dot {
  background: #f59e0b;
  box-shadow: 0 0 8px #f59e0b;
}
.lv-info .alert-dot {
  background: #06b6d4;
  box-shadow: 0 0 8px #06b6d4;
}
.alert-main {
  flex: 1;
  min-width: 0;
}
.alert-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  gap: 6px;
}
.alert-name {
  font-size: 12px;
  color: #f1f5f9;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.alert-level {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 3px;
  font-weight: 600;
  flex-shrink: 0;
}
.lv-danger .alert-level {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.18);
}
.lv-warning .alert-level {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.18);
}
.lv-info .alert-level {
  color: #06b6d4;
  background: rgba(6, 182, 212, 0.18);
}
.alert-sub {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: rgba(148, 163, 184, 0.75);
}
.alert-loc {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  margin-right: 8px;
}
.alert-time {
  font-family: 'Consolas', monospace;
  color: rgba(226, 232, 240, 0.6);
  flex-shrink: 0;
}

/* ====== Top 5 告警 ====== */
.topn-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
  padding: 4px 0;
}
.topn-row {
  display: grid;
  grid-template-columns: 20px 1fr 70px 40px;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}
.topn-rank {
  width: 20px;
  height: 20px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  font-family: 'Consolas', monospace;
  box-shadow: 0 0 8px currentColor;
}
.topn-name {
  color: rgba(226, 232, 240, 0.9);
}
.topn-bar-wrap {
  height: 8px;
  background: rgba(99, 102, 241, 0.12);
  border-radius: 4px;
  overflow: hidden;
}
.topn-bar {
  height: 100%;
  border-radius: 4px;
  box-shadow: 0 0 10px currentColor;
  transition: width 1s ease;
}
.topn-val {
  font-family: 'Consolas', monospace;
  color: #06b6d4;
  font-weight: 600;
  text-align: right;
}

/* ====== 健康度仪表盘 ====== */
.gauge-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 0;
}
.gauge-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 1;
}
.gauge-ring {
  position: relative;
  width: 62px;
  height: 62px;
}
.gauge-ring svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}
.gr-track {
  fill: none;
  stroke: rgba(99, 102, 241, 0.15);
  stroke-width: 4;
}
.gr-bar {
  fill: none;
  stroke-width: 4;
  stroke-linecap: round;
  stroke-dasharray: 100.53;
  stroke-dashoffset: calc(100.53 - (100.53 * var(--val)) / 100);
  filter: drop-shadow(0 0 4px currentColor);
  transition: stroke-dashoffset 1.2s ease;
}
.gr-text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  font-family: 'Consolas', monospace;
  color: #fff;
  text-shadow: 0 0 6px var(--clr);
}
.gauge-label {
  font-size: 11px;
  color: rgba(148, 163, 184, 0.8);
  letter-spacing: 1px;
}

/* ====== 响应式微调 ====== */
@media (max-width: 1600px) {
  .zg-main {
    grid-template-columns: 300px 1fr 300px;
  }
  .center-text {
    font-size: 18px;
    letter-spacing: 2px;
  }
}


</style>
