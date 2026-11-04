<template>
  <div class="zg-twin-sim" :style="sceneVars">
    <!-- 顶部工具栏 -->
    <header class="zg-ts__top">
      <div class="zg-ts__brand">
        <el-icon :size="22" color="var(--brand-color)"><Connection /></el-icon>
        <div>
          <h1>数字孪生 · 光照推演模拟器</h1>
          <span class="zg-ts__sub">{{ segment.name }} · {{ segment.length }}m · {{ segment.lamps }} 灯杆 · {{ segment.buildings }} 建筑</span>
        </div>
      </div>

      <div class="zg-ts__top-actions">
        <el-select v-model="segmentKey" class="zg-ts__segment" @change="applySegment">
          <el-option v-for="s in segments" :key="s.key" :label="s.name" :value="s.key" />
        </el-select>

        <el-select v-model="weather" class="zg-ts__weather">
          <el-option
            v-for="w in weatherOptions"
            :key="w.key"
            :label="w.label"
            :value="w.key"
          >
            <span class="zg-ts__wopt">
              <el-icon><component :is="w.icon" /></el-icon>
              {{ w.label }}
            </span>
          </el-option>
        </el-select>

        <div class="zg-ts__sun-inputs">
          <div>
            <span>日出</span>
            <el-time-picker v-model="sunrise" format="HH:mm" value-format="HH:mm" :disabled-hours="disabledDayHours" />
          </div>
          <div>
            <span>日落</span>
            <el-time-picker v-model="sunset" format="HH:mm" value-format="HH:mm" :disabled-hours="disabledNightHours" />
          </div>
        </div>

        <el-tooltip content="一键切换日夜" placement="bottom">
          <el-button :icon="isDay ? Moon : Sunny" circle @click="toggleDayNight" />
        </el-tooltip>
        <el-tooltip content="刷新推演" placement="bottom">
          <el-button :icon="Refresh" circle @click="recalc" />
        </el-tooltip>
        <el-tooltip content="导出方案报告" placement="bottom">
          <el-button type="primary" :icon="Download" plain @click="exportReport">导出报告</el-button>
        </el-tooltip>
      </div>
    </header>

    <!-- 主体 -->
    <main class="zg-ts__main">
      <!-- 左侧：光照策略 -->
      <aside class="zg-ts__left">
        <div class="zg-ts__panel">
          <h3 class="zg-ts__panel-title"><el-icon><Setting /></el-icon>光照策略</h3>

          <div class="zg-ts__strat">
            <div v-for="p in presetPlans" :key="p.key"
                 class="zg-ts__strat-item"
                 :class="{ active: activePlan === p.key }"
                 @click="applyPlan(p.key)">
              <div class="zg-ts__strat-head">
                <strong>方案 {{ p.key.toUpperCase() }} · {{ p.title }}</strong>
                <el-tag size="small" :type="p.tagType">{{ p.mode }}</el-tag>
              </div>
              <ul>
                <li>开灯：<b>{{ p.openTime }}</b></li>
                <li>关灯：<b>{{ p.closeTime }}</b></li>
                <li>亮度：<b>{{ p.brightness }}%</b></li>
              </ul>
              <div class="zg-ts__strat-foot">
                <span>{{ p.desc }}</span>
                <el-icon><Histogram /></el-icon>
              </div>
            </div>
          </div>
        </div>

        <div class="zg-ts__panel zg-ts__panel--mini">
          <h3 class="zg-ts__panel-title"><el-icon><PartlyCloudy /></el-icon>当前天气</h3>
          <div class="zg-ts__weather-card">
            <div class="zg-ts__weather-main">
              <el-icon :size="48"><component :is="currentWeatherIcon" /></el-icon>
              <div>
                <strong>{{ currentWeatherLabel }}</strong>
                <span>影响开灯阈值</span>
              </div>
            </div>
            <el-progress :percentage="weatherImpact" :stroke-width="8" />
          </div>
        </div>
      </aside>

      <!-- 中央 3D 场景 -->
      <section class="zg-ts__scene-wrap">
        <div class="zg-ts__scene" :style="sceneTransformStyle">
          <!-- 夜空 / 天空 -->
          <div class="zg-ts__sky"></div>

          <!-- 太阳 -->
          <div class="zg-ts__sun" :style="sunStyle">
            <div class="zg-ts__sun-glow"></div>
            <div class="zg-ts__sun-core"></div>
          </div>

          <!-- 地面（承载道路、建筑、灯杆） -->
          <div class="zg-ts__ground">
            <!-- 道路（灰色条带） -->
            <div class="zg-ts__road zg-ts__road--h"></div>
            <div class="zg-ts__road zg-ts__road--v"></div>

            <!-- 十字路口环岛 -->
            <div class="zg-ts__roundabout zg-ts__roundabout--tl"></div>
            <div class="zg-ts__roundabout zg-ts__roundabout--br"></div>

            <!-- 建筑立方体 -->
            <div v-for="(b, i) in buildings" :key="'b'+i"
                 class="zg-ts__building"
                 :class="'zg-ts__building--'+b.tone"
                 :style="buildingStyle(b)">
              <div class="zg-ts__b-top"></div>
              <div class="zg-ts__b-front">
                <div class="zg-ts__b-shadow" :style="shadowStyle(b)"></div>
                <div class="zg-ts__b-windows">
                  <span v-for="k in 12" :key="k" :class="{ lit: Math.random() > 0.3 }"></span>
                </div>
              </div>
              <div class="zg-ts__b-side"></div>
            </div>

            <!-- 灯杆 + 光晕 -->
            <template v-for="(l, i) in lamps" :key="'l'+i">
              <div class="zg-ts__lamp"
                   :class="{ on: i < lampCount }"
                   :style="lampStyle(l, i)">
                <div class="zg-ts__pole"></div>
                <div class="zg-ts__pole-top"></div>
                <div class="zg-ts__glow" :style="glowStyle(l, i)"></div>
              </div>
            </template>

            <!-- 地面总辉光（夜晚） -->
            <div class="zg-ts__ground-glow"></div>
          </div>

          <!-- 场景标签（装饰） -->
          <div class="zg-ts__scene-hint">
            <el-icon><Search /></el-icon> 先导路 · 金星大道 → 麓谷大道
          </div>
        </div>

        <!-- KPI 卡组（叠加在场景右下） -->
        <div class="zg-ts__kpis">
          <div v-for="k in kpis" :key="k.key" class="zg-ts__kpi" :style="{ borderTopColor: k.color }">
            <div class="zg-ts__kpi-label">{{ k.label }}</div>
            <div class="zg-ts__kpi-value">{{ k.value }}<em>{{ k.unit }}</em></div>
            <div class="zg-ts__kpi-trend" :class="k.trend">{{ k.trendText }}</div>
          </div>
        </div>
      </section>

      <!-- 右侧：方案对比 -->
      <aside class="zg-ts__right">
        <div class="zg-ts__panel">
          <h3 class="zg-ts__panel-title"><el-icon><Histogram /></el-icon>推演方案对比</h3>
          <div class="zg-ts__cmp">
            <div v-for="p in presetPlans" :key="p.key"
                 class="zg-ts__cmp-item"
                 :class="{ active: activePlan === p.key }"
                 @click="applyPlan(p.key)">
              <div class="zg-ts__cmp-head">
                <span class="zg-ts__cmp-code">方案 {{ p.key.toUpperCase() }}</span>
                <span class="zg-ts__cmp-title">{{ p.title }}</span>
              </div>
              <div class="zg-ts__cmp-body">
                <div class="zg-ts__cmp-row">
                  <span>年度总能耗</span><b>{{ round(p.annualKwh) }} kWh</b>
                </div>
                <div class="zg-ts__cmp-row">
                  <span>年度电费</span><b class="cost">¥ {{ round(p.annualCost) }}</b>
                </div>
                <div class="zg-ts__cmp-row">
                  <span>节能率</span>
                  <b class="save" :class="{ good: p.saveRate >= 20 }">{{ p.saveRate }}%</b>
                </div>
                <div class="zg-ts__cmp-row">
                  <span>舒适指数</span><b>{{ p.comfort }} / 10</b>
                </div>
                <div class="zg-ts__cmp-row">
                  <span>告警发生率</span><b :class="{ warn: p.alarm > 5 }">{{ p.alarm }}%</b>
                </div>
                <div class="zg-ts__cmp-row zg-ts__cmp-row--bar">
                  <span>能耗</span>
                  <div class="zg-ts__cmp-bar">
                    <span :style="{ width: (p.annualKwh / maxAnnualKwh * 100) + '%' }"></span>
                  </div>
                </div>
                <div class="zg-ts__cmp-row zg-ts__cmp-row--bar">
                  <span>节能</span>
                  <div class="zg-ts__cmp-bar">
                    <span class="save" :style="{ width: p.saveRate + '%' }"></span>
                  </div>
                </div>
              </div>
              <el-button class="zg-ts__cmp-apply" size="small" :type="activePlan === p.key ? 'primary' : 'default'">
                {{ activePlan === p.key ? '已应用' : '应用方案' }}
              </el-button>
            </div>
          </div>
        </div>
      </aside>
    </main>

    <!-- 底部时间轴 -->
    <footer class="zg-ts__timeline">
      <div class="zg-ts__tl-bar">
        <div class="zg-ts__tl-sky" :style="tlSkyStyle">
          <div class="zg-ts__tl-sun" :style="tlSunStyle"></div>
          <div v-for="n in 20" :key="n" class="zg-ts__tl-star"
               :style="{ left: (n * 5) + '%', opacity: tlStarOpacity }"></div>
        </div>
        <el-slider v-model="time" :min="0" :max="24" :step="0.1"
                  class="zg-ts__slider"
                  :marks="timeMarks"
                  @input="onTimeInput" />
      </div>
      <div class="zg-ts__tl-info">
        <span class="zg-ts__tl-time">{{ formatTime(time) }}</span>
        <span class="zg-ts__tl-amp">{{ isDay ? '☀ 昼' : '🌙 夜' }} · 照度 {{ lux }} lux</span>
        <span class="zg-ts__tl-power">开灯 {{ lampCount }} / 30 · 功率 {{ round(currentPower, 0) }} W</span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Sunny, Moon, PartlyCloudy, Drizzling,
  Search, Refresh, Download, Setting, Connection, Histogram
} from '@element-plus/icons-vue'

/* ---------------- 常量 & Mock 数据 ---------------- */

const segments = [
  { key: 'xd', name: '先导路 · 金星大道 → 麓谷大道', length: 1000, lamps: 30, buildings: 5, cross: 2 },
  { key: 'yxe', name: '岳麓西大道 · 全程段', length: 1500, lamps: 42, buildings: 8, cross: 3 },
  { key: 'ls',  name: '麓山南路 · 学生街', length: 800,  lamps: 22, buildings: 12, cross: 2 }
]

const segmentKey = ref('xd')
const segment = computed(() => segments.find(s => s.key === segmentKey.value) || segments[0])

const weatherOptions = [
  { key: 'sunny', label: '晴', icon: Sunny },
  { key: 'cloudy', label: '多云', icon: PartlyCloudy },
  { key: 'rain', label: '小雨', icon: Drizzling },
  { key: 'fog', label: '雾天', icon: PartlyCloudy }
]
const weather = ref('sunny')
const currentWeatherIcon = computed(() => weatherOptions.find(w => w.key === weather.value)?.icon || Sunny)
const currentWeatherLabel = computed(() => weatherOptions.find(w => w.key === weather.value)?.label || '晴')
const weatherImpact = computed(() => ({ sunny: 20, cloudy: 45, rain: 70, fog: 92 })[weather.value] || 20)

// 日出日落
const sunrise = ref('06:00')
const sunset  = ref('18:30')
const disabledDayHours = [0,1,2,3,4,5,12,13,14,15,16,17,18,19,20,21,22,23]
const disabledNightHours = [0,1,2,3,4,5,6,7,8,9,10,11,12,20,21,22,23]

// 时间 0-24
const time = ref(18.2)
const timeMarks = { 0: '0', 6: '6', 12: '12', 18: '18', 24: '24' }

const presetPlans = [
  {
    key: 'a', title: '节能模式', mode: '省电优先', tagType: 'success',
    openTime: '19:00', closeTime: '06:00', brightness: 60, desc: '按固定时刻表',
    annualKwh: 12840, annualCost: 10272, saveRate: 38, comfort: 7, alarm: 3,
    openHour: 19, closeHour: 6, brightnessLevel: 0.6
  },
  {
    key: 'b', title: '舒适模式', mode: '光感优先', tagType: 'warning',
    openTime: '18:30', closeTime: '05:30', brightness: 100, desc: '照度保底 20lux',
    annualKwh: 19260, annualCost: 15408, saveRate: 7, comfort: 9, alarm: 2,
    openHour: 18.5, closeHour: 5.5, brightnessLevel: 1.0
  },
  {
    key: 'c', title: 'AI 动态调光', mode: '传感器 + AI', tagType: 'danger',
    openTime: '按需', closeTime: '按需', brightness: '0-100', desc: '动态闭环',
    annualKwh: 9832, annualCost: 7866, saveRate: 53, comfort: 9.5, alarm: 1,
    openHour: -1, closeHour: -1, brightnessLevel: 0.8
  }
]

const activePlan = ref('c')

/* ---------------- 派生数据：场景 CSS 变量 ---------------- */

const sunriseHour = computed(() => parseFloat(sunrise.value.split(':')[0]) + parseFloat(sunrise.value.split(':')[1]) / 60)
const sunsetHour  = computed(() => parseFloat(sunset.value.split(':')[0])  + parseFloat(sunset.value.split(':')[1])  / 60)

// 根据时间和天气算出 scene-brightness / lamp-opacity / lampCount
const weatherOpenBias = computed(() => ({ sunny: 0, cloudy: 0.6, rain: 1.2, fog: 2.5 })[weather.value] || 0)

// 开灯曲线：开灯时间前逐渐开启（过渡 1 小时），关灯同理
const lampOpenHour = computed(() => {
  const p = presetPlans.find(x => x.key === activePlan.value)
  if (p && p.openHour > 0) return p.openHour - weatherOpenBias.value
  // AI 动态：日出前 1h 开，日出后关；日落前 1h 开
  return Math.min(sunsetHour.value - 1, 18) - weatherOpenBias.value
})
const lampCloseHour = computed(() => {
  const p = presetPlans.find(x => x.key === activePlan.value)
  if (p && p.closeHour > 0) return p.closeHour + weatherOpenBias.value
  return sunriseHour.value + 1 + weatherOpenBias.value
})

// 0~1 开灯比例：平滑 sigmoid 曲线
const lampRatio = computed(() => {
  const t = time.value
  let r = 0
  // 主夜段：[关灯, 开灯+24] 或 [开灯, 关灯+24]
  if (lampCloseHour.value <= lampOpenHour.value) {
    // 标准：如 close=6, open=19
    if (t >= lampOpenHour.value || t <= lampCloseHour.value) r = 1
    else r = 0
  } else {
    r = 1
  }
  // 过渡带 ±0.75h 平滑
  const sigma = 0.75
  // 开灯沿
  const d1 = Math.abs(t - lampOpenHour.value)
  const d2 = Math.abs(t - lampCloseHour.value)
  const softOpen = 1 / (1 + Math.exp(-(lampOpenHour.value - t) / sigma))
  const softClose = 1 / (1 + Math.exp((lampCloseHour.value - t) / sigma))
  r = Math.max(r, Math.min(softOpen, 1))
  // 合并：简化逻辑
  if (t >= lampCloseHour.value && t <= lampOpenHour.value) {
    // 白天
    r = Math.max(0, softOpen) * 0.3 * weatherImpact.value / 100
  } else {
    // 夜晚
    const toClose = t < lampCloseHour.value ? (lampCloseHour.value - t + 24) : (lampCloseHour.value - t)
    const toOpen  = t > lampOpenHour.value  ? (t - lampOpenHour.value)       : (t - lampOpenHour.value + 24)
    const fadeIn  = t >= lampOpenHour.value  ? Math.min(1, (t - lampOpenHour.value) / sigma) : 1
    const fadeOut = t <= lampCloseHour.value ? Math.min(1, (lampCloseHour.value - t) / sigma) : 1
    r = fadeIn * fadeOut
  }
  // 天气强制
  if (weather.value === 'fog') r = Math.min(1, r + 0.35)
  if (weather.value === 'rain') r = Math.min(1, r + 0.15)
  return Math.max(0, Math.min(1, r))
})

const brightnessFactor = computed(() => {
  const p = presetPlans.find(x => x.key === activePlan.value)
  return p ? (typeof p.brightnessLevel === 'number' ? p.brightnessLevel : 0.85) : 1
})

const lampCount = computed(() => Math.round(segment.value.lamps * lampRatio.value * brightnessFactor.value))

// 场景整体亮度：日出→日落从 0.2 升到 1.2 再降到 0.25
const sceneBrightness = computed(() => {
  const t = time.value
  const days = sunsetHour.value - sunriseHour.value
  if (days <= 0) return 0.3
  if (t < sunriseHour.value || t > sunsetHour.value) return 0.22
  // 正弦：正午最高
  const k = (t - sunriseHour.value) / days // 0..1
  return 0.22 + 0.98 * Math.sin(k * Math.PI)
})

// 太阳角度：从东(右, -90°) 到 正午(上, -180°) 到 西(左, -270°)
const sunAngle = computed(() => {
  const days = sunsetHour.value - sunriseHour.value
  if (days <= 0) return -180
  let k
  const t = time.value
  if (t < sunriseHour.value) k = -0.5
  else if (t > sunsetHour.value) k = 1.5
  else k = (t - sunriseHour.value) / days // 0..1
  // 0 → 正东 (右偏下), 0.5 → 上, 1 → 正西
  // -90 + k*180 : 0→-90, 0.5→0, 1→90
  return -90 + k * 180
})

// 色温：白天冷蓝 6000K → 夜晚暖黄 2700K
const temperatureTint = computed(() => {
  const b = sceneBrightness.value // 0.22 ~ 1.2
  // 0.22 → rgb(40,55,90) 深蓝夜空；1.2 → rgb(210,230,255) 冷蓝
  const r = Math.round(40 + (210 - 40) * (b - 0.22) / 0.98)
  const g = Math.round(55 + (230 - 55) * (b - 0.22) / 0.98)
  const bl = Math.round(90 + (255 - 90) * (b - 0.22) / 0.98)
  return `rgb(${r},${g},${bl})`
})

const lampOpacity = computed(() => Math.max(0, Math.min(1, lampRatio.value)))

const isDay = computed(() => sceneBrightness.value > 0.7)

const sceneVars = computed(() => ({
  '--scene-brightness': sceneBrightness.value.toFixed(2),
  '--lamp-opacity': lampOpacity.value.toFixed(2),
  '--lamp-count': lampCount.value,
  '--sun-angle': sunAngle.value.toFixed(1) + 'deg',
  '--temperature-tint': temperatureTint.value,
  '--is-day': isDay.value ? 1 : 0,
  '--ground-tint': isDay.value ? '#e2e8f0' : '#1a2235',
  '--road-tint': isDay.value ? '#8a94a6' : '#2b3446',
  '--glow-color': lampOpacity.value > 0.1 ? '255, 220, 120' : '255,240,200'
}))

const sceneTransformStyle = computed(() => ({
  filter: `brightness(${sceneBrightness.value})`,
  background: `linear-gradient(180deg, var(--temperature-tint) 0%, rgba(0,0,0,0) 100%)`
}))

/* ---------------- 太阳位置 ---------------- */

const sunStyle = computed(() => {
  const angle = sunAngle.value * Math.PI / 180
  const r = 160 // 半径 px
  // 东(右): -90° → x=160, y=0; 正午(上): -180° → x=0, y=-160; 西(左): 90° → x=-160, y=0
  const x = Math.cos(angle) * r
  const y = Math.sin(angle) * r * 0.6 - 40
  const visible = sceneBrightness.value > 0.35
  return {
    transform: `translate(calc(50% + ${x}px), ${y}px)`,
    opacity: visible ? 1 : 0.25,
    filter: isDay.value ? 'none' : 'hue-rotate(-20deg) brightness(0.6)'
  }
})

const tlSkyStyle = computed(() => ({
  background: `linear-gradient(90deg, #0f1624 0%, var(--temperature-tint) ${(time.value/24)*100}%, #0f1624 100%)`
}))

const tlSunStyle = computed(() => ({
  left: `calc(${(time.value/24)*100}% - 6px)`
}))

const tlStarOpacity = computed(() => sceneBrightness.value < 0.6 ? (0.7 - sceneBrightness.value * 0.5) : 0)

/* ---------------- 建筑、灯 ---------------- */

const buildings = [
  { x: 180, y: 160, h: 110, w: 50, d: 50, tone: 'cool' },
  { x: 260, y: 160, h: 170, w: 60, d: 55, tone: 'mid' },
  { x: 360, y: 160, h: 90,  w: 70, d: 60, tone: 'warm' },
  { x: 180, y: 280, h: 130, w: 55, d: 50, tone: 'mid' },
  { x: 300, y: 280, h: 200, w: 80, d: 65, tone: 'cool' }
]

function buildingStyle(b) {
  return {
    left: b.x + 'px',
    top: b.y + 'px',
    width: b.w + 'px',
    height: b.h + 'px',
    // transform 保留 3D 方向由父级视角控制
  }
}

function shadowStyle(b) {
  // 阴影跟随太阳方向：水平偏移 = cos(angle), 纵向偏移 = -sin(angle) 投影地面
  const angle = sunAngle.value * Math.PI / 180
  const sx = Math.cos(angle) * 25
  const sy = -Math.sin(angle) * 25
  const op = sceneBrightness.value > 0.7 ? 0.35 : 0.15
  return {
    transform: `translate(${sx}px, ${sy}px)`,
    opacity: op,
    filter: `blur(2px)`
  }
}

// 30 根灯杆：沿横纵道路双侧对称
const lamps = computed(() => {
  const arr = []
  // 横向道路 14 根（上侧 7 + 下侧 7）
  for (let i = 0; i < 14; i++) {
    arr.push({ x: 80 + i * 26, y: 200 })       // 上
    arr.push({ x: 80 + i * 26, y: 240 })       // 下
  }
  // 纵向道路 2 根（两侧）
  arr.push({ x: 220, y: 60 })
  arr.push({ x: 260, y: 380 })
  // 保证总共约 30
  return arr.slice(0, segment.value.lamps)
})

function lampStyle(l, i) {
  const on = i < lampCount.value
  return {
    left: l.x + 'px',
    top: l.y + 'px',
    opacity: on ? 1 : (lampOpacity.value * 0.4)
  }
}

function glowStyle(l, i) {
  const on = i < lampCount.value
  const op = on ? Math.min(1, lampOpacity.value * 1.05) : 0
  const r = on ? (46 * brightnessFactor.value) : 8
  return {
    opacity: op,
    width: (r * 2) + 'px',
    height: (r * 2) + 'px'
  }
}

/* ---------------- KPI ---------------- */

const currentPower = computed(() => lampCount.value * 60 * brightnessFactor.value) // 单灯 60W
const lux = computed(() => Math.round(2 + lampCount.value * 1.4 * brightnessFactor.value + (isDay.value ? 600 : 0) * sceneBrightness.value))

const traditionalAnnualKwh = 20800
const annualSave = computed(() => {
  const p = presetPlans.find(x => x.key === activePlan.value)
  if (!p) return 0
  return ((traditionalAnnualKwh - p.annualKwh) * 0.8).toFixed(1)
})

const kpis = computed(() => [
  { key: 'lux',   label: '当前平均照度', value: lux.value,   unit: 'lux',  color: '#5b8def', trend: isDay.value ? 'up' : 'down', trendText: isDay.value ? '日照充足' : '人工补光' },
  { key: 'lamp',  label: '需开灯杆数',   value: lampCount.value, unit: '根', color: '#f59e0b', trend: 'flat', trendText: `/ ${segment.value.lamps}` },
  { key: 'power', label: '预估实时能耗', value: round(currentPower.value, 0), unit: 'W', color: '#10b981', trend: lampRatio.value > 0.5 ? 'up' : 'down', trendText: `亮度 ${Math.round(brightnessFactor.value*100)}%` },
  { key: 'save',  label: '年度节能',     value: annualSave.value, unit: '万元', color: '#a855f7', trend: 'up', trendText: `节能率 ${presetPlans.find(x=>x.key===activePlan.value)?.saveRate || 0}%` }
])

const maxAnnualKwh = computed(() => Math.max(...presetPlans.map(p => p.annualKwh)))

/* ---------------- 交互 ---------------- */

function onTimeInput() { /* 所有联动靠 computed */ }
function toggleDayNight() {
  time.value = isDay.value ? 1.0 : 12.0
}
function applyPlan(k) {
  activePlan.value = k
  // 同步时间轴到该方案的典型开灯时刻
  const p = presetPlans.find(x => x.key === k)
  if (p && p.openHour > 0) time.value = p.openHour
  recalc()
}
function applySegment() {
  ElMessage.success(`已切换到 ${segment.value.name}`)
}
function recalc() {
  ElMessage({ type: 'info', message: '推演引擎已重新计算', duration: 1200 })
}
function exportReport() {
  ElMessage.success('方案报告已生成（模拟）· 下载为 PDF')
}
function formatTime(t) {
  const h = Math.floor(t)
  const m = Math.floor((t - h) * 60)
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`
}
function round(v, d = 0) {
  return Number(v).toFixed(d)
}

// 监听方案 & 天气，自动刷新
watch([activePlan, weather, sunrise, sunset], recalc, { flush: 'post' })

onMounted(() => {
  recalc()
})
</script>

<style lang="scss" scoped>
.zg-twin-sim {
  --scene-brightness: 1;
  --lamp-opacity: 0.3;
  --lamp-count: 10;
  --sun-angle: 0deg;
  --temperature-tint: #3b4b6b;
  --brand-color: #5b8def;
  color: var(--el-text-color-primary);
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 14px;
  padding: 16px;
  background: #0b1220;
  font-family: "PingFang SC", "Microsoft YaHei", system-ui, -apple-system, sans-serif;
  transition: background 300ms ease;
  overflow: hidden;

  /* 顶部 */
  &__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: linear-gradient(90deg, #111a2c 0%, #0f1726 100%);
    padding: 12px 18px;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.06);
    gap: 16px;
    flex-wrap: wrap;
  }
  &__brand {
    display: flex; align-items: center; gap: 10px;
    h1 { font-size: 16px; font-weight: 600; color: #e6edf7; margin: 0; letter-spacing: .5px; }
  }
  &__sub { color: #7b8aa3; font-size: 12px; }
  &__top-actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
  &__segment, &__weather { width: 180px; }
  &__wopt { display: flex; gap: 6px; align-items: center; }
  &__sun-inputs {
    display: flex; gap: 12px; color: #cbd5e1; font-size: 12px;
    div { display: flex; align-items: center; gap: 6px; }
  }

  /* 主布局 */
  &__main {
    display: grid;
    grid-template-columns: 280px 1fr 320px;
    gap: 14px;
    min-height: 0;
  }

  /* 面板 */
  &__panel {
    background: linear-gradient(180deg, #131c30 0%, #0e1524 100%);
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.06);
    padding: 14px;
    color: #cbd5e1;
    &--mini { margin-top: 14px; }
  }
  &__panel-title {
    margin: 0 0 12px 0;
    font-size: 13px; font-weight: 600;
    display: flex; align-items: center; gap: 6px;
    color: #9fb3d1; letter-spacing: .5px;
  }

  /* 左侧策略 */
  &__strat { display: flex; flex-direction: column; gap: 10px; }
  &__strat-item {
    padding: 10px 12px; border-radius: 10px; cursor: pointer;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.06);
    transition: all .25s ease;
    ul { margin: 8px 0 0 0; padding: 0; list-style: none; font-size: 12px; color: #9fb3d1; li { padding: 2px 0; } b { color: #e6edf7; } }
    &.active { border-color: #5b8def; background: rgba(91,141,239,0.12); box-shadow: 0 0 0 1px rgba(91,141,239,.2) inset; }
    &:hover { border-color: rgba(91,141,239,0.5); transform: translateY(-1px); }
  }
  &__strat-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
  &__strat-foot { margin-top: 8px; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #6b7a93; }

  /* 天气卡 */
  &__weather-card {
    .zg-ts__weather-main { display: flex; gap: 12px; align-items: center; margin-bottom: 12px; color: #e6edf7;
      strong { display: block; font-size: 14px; }
      span { font-size: 11px; color: #7b8aa3; }
    }
  }

  /* 中央场景 */
  &__scene-wrap {
    position: relative;
    border-radius: 14px;
    overflow: hidden;
    background: #0a1120;
    border: 1px solid rgba(255,255,255,0.08);
    min-height: 480px;
    perspective: 1200px;
  }
  &__scene {
    position: relative;
    width: 100%; height: 100%;
    min-height: 480px;
    transform-style: preserve-3d;
    transition: filter .3s ease, background .3s ease;
    overflow: hidden;
  }
  &__sky {
    position: absolute; inset: 0; pointer-events: none;
    background: radial-gradient(ellipse at 50% 0%, rgba(255,255,255,.05) 0%, transparent 60%);
  }

  /* 太阳 */
  &__sun {
    position: absolute;
    top: 140px; left: 50%;
    width: 40px; height: 40px;
    transform-origin: center;
    pointer-events: none;
    transition: transform .3s ease, opacity .3s ease;
    &-glow {
      position: absolute; inset: -30px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255,230,140,0.6) 0%, rgba(255,200,80,0.2) 40%, transparent 70%);
      filter: blur(4px);
    }
    &-core {
      position: absolute; inset: 0;
      border-radius: 50%;
      background: radial-gradient(circle, #fff7cc 0%, #ffd56b 60%, #f59e0b 100%);
      box-shadow: 0 0 30px rgba(255,210,80,0.7);
    }
  }

  /* 地面 */
  &__ground {
    position: absolute; inset: 0;
    top: 40%;
    background:
      linear-gradient(180deg, var(--ground-tint) 0%, rgba(0,0,0,.4) 100%);
    transform: rotateX(60deg);
    transform-origin: top center;
    transition: background .3s ease;
  }

  /* 道路 */
  &__road {
    position: absolute;
    left: 10%; right: 10%;
    height: 32px;
    background: repeating-linear-gradient(90deg, var(--road-tint) 0 24px, rgba(255,255,255,.06) 24px 26px, var(--road-tint) 26px 50px);
    border-top: 2px solid rgba(255,255,255,.1);
    border-bottom: 2px solid rgba(255,255,255,.1);
    &--h { top: 50%; transform: translateY(-50%); }
    &--v {
      top: 15%; bottom: 15%; left: 46%;
      width: 32px; height: auto;
      background: repeating-linear-gradient(0deg, var(--road-tint) 0 24px, rgba(255,255,255,.06) 24px 26px, var(--road-tint) 26px 50px);
    }
  }
  &__roundabout {
    position: absolute;
    width: 60px; height: 60px;
    border-radius: 50%;
    border: 3px dashed rgba(255,255,255,.12);
    background: rgba(91,141,239,0.15);
    &--tl { top: calc(50% - 30px); left: calc(46% - 30px); }
    &--br { top: calc(50% - 30px); left: calc(46% - 30px); opacity: .4; }
  }

  /* 建筑 */
  &__building {
    position: absolute;
    transform-style: preserve-3d;
    transform: translateZ(0);
    transition: transform .3s ease;
    &-top, &-front, &-side { position: absolute; }
    &-top {
      left: 0; top: 0; width: 100%; height: 16px;
      transform: rotateX(90deg) translateZ(-16px);
      transform-origin: bottom;
    }
    &-front {
      left: 0; top: 0; width: 100%; height: 100%;
      background: rgba(148,163,184,.85);
      transition: background .3s ease;
    }
    &-side {
      top: 0; right: -20px; width: 20px; height: 100%;
      transform-origin: left;
      transform: rotateY(-90deg);
      background: rgba(100,116,139,.85);
    }
    &.zg-ts__building--cool &-top { background: #5b8def; }
    &.zg-ts__building--mid  &-top { background: #64748b; }
    &.zg-ts__building--warm &-top { background: #d4753d; }

    /* 夜晚建筑变深 */
    :global(.zg-twin-sim:not([data-day=1])) &-front { background: rgba(30,41,59,.85); }
  }

  /* 建筑阴影 */
  &__b-shadow {
    position: absolute;
    bottom: -20px; left: 0; width: 110%; height: 26px;
    background: rgba(0,0,0,.5);
    border-radius: 4px;
    transition: transform .2s ease, opacity .2s ease;
  }

  /* 窗户 */
  &__b-windows {
    position: absolute; inset: 8px;
    display: grid; grid-template-columns: repeat(4,1fr); grid-auto-rows: 10px; gap: 4px;
    span {
      background: rgba(255,255,255,.08);
      border-radius: 2px;
      transition: background .3s ease;
    }
    span.lit { background: #ffd56b; box-shadow: 0 0 6px rgba(255,213,107,.6); }
  }

  /* 灯杆 */
  &__lamp {
    position: absolute;
    width: 4px; height: 60px;
    transform-origin: bottom center;
    pointer-events: none;
    transition: opacity .3s ease;
    &-pole {
      position: absolute; left: 1px; bottom: 0; width: 2px; height: 54px;
      background: linear-gradient(180deg, #64748b, #334155);
      border-radius: 1px;
    }
    &-pole-top {
      position: absolute; left: -4px; top: 0; width: 10px; height: 8px;
      background: #334155; border-radius: 2px 2px 0 0;
    }
    &-glow {
      position: absolute; left: 50%; top: -14px;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255,235,150,0.9) 0%, rgba(255,200,80,0.5) 25%, rgba(255,180,60,0.25) 50%, transparent 75%);
      filter: blur(3px);
      mix-blend-mode: screen;
      transition: width .3s ease, height .3s ease, opacity .3s ease;
    }
  }

  /* 地面总辉光（夜晚） */
  &__ground-glow {
    position: absolute; left: 0; right: 0; bottom: 0; height: 40%;
    background: radial-gradient(ellipse at 50% 100%, rgba(255,210,120,0.18) 0%, transparent 70%);
    opacity: calc(var(--lamp-opacity, 0.2) * 1.2);
    pointer-events: none;
    transition: opacity .3s ease;
  }

  &__scene-hint {
    position: absolute; bottom: 10px; left: 14px;
    font-size: 11px; color: rgba(203,213,225,.7);
    display: flex; align-items: center; gap: 4px;
  }

  /* KPI */
  &__kpis {
    position: absolute; right: 16px; bottom: 16px;
    display: grid; grid-template-columns: repeat(2, 170px); gap: 10px;
    z-index: 3;
  }
  &__kpi {
    background: rgba(15,23,38,.85);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,.08);
    border-radius: 10px;
    padding: 10px 12px;
    color: #e6edf7;
    border-top: 3px solid var(--k, #5b8def);
    transition: transform .2s ease;
    &:hover { transform: translateY(-2px); }
    &-label { font-size: 11px; color: #9fb3d1; margin-bottom: 4px; }
    &-value {
      font-size: 22px; font-weight: 700; letter-spacing: 0.5px;
      em { font-size: 12px; font-weight: 400; color: #9fb3d1; margin-left: 2px; font-style: normal; }
    }
    &-trend { font-size: 11px; margin-top: 4px;
      &.up   { color: #10b981; }
      &.down { color: #f59e0b; }
      &.flat { color: #9fb3d1; }
    }
  }

  /* 右侧对比 */
  &__cmp {
    display: flex; flex-direction: column; gap: 10px;
  }
  &__cmp-item {
    padding: 12px; border-radius: 10px;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.06);
    transition: all .25s ease; cursor: pointer;
    &.active { border-color: #a855f7; background: rgba(168,85,247,.1); }
    &:hover { border-color: rgba(168,85,247,.6); transform: translateY(-1px); }
  }
  &__cmp-head {
    display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;
  }
  &__cmp-code { font-size: 11px; color: #a855f7; font-weight: 600; }
  &__cmp-title { font-size: 13px; color: #e6edf7; font-weight: 600; }
  &__cmp-body { display: flex; flex-direction: column; gap: 4px; }
  &__cmp-row {
    display: flex; justify-content: space-between; font-size: 12px; color: #9fb3d1;
    b { color: #e6edf7; font-weight: 500; }
    b.cost { color: #f59e0b; }
    b.save { color: #10b981; &.good { color: #34d399; } }
    b.warn { color: #ef4444; }
    &--bar { margin-top: 4px; }
  }
  &__cmp-bar {
    width: 70%; height: 6px; border-radius: 3px; background: rgba(255,255,255,.08);
    overflow: hidden; align-self: center;
    span { display: block; height: 100%; background: linear-gradient(90deg, #5b8def, #8b5cf6); border-radius: 3px; transition: width .4s ease; &.save { background: linear-gradient(90deg, #10b981, #34d399); } }
  }
  &__cmp-apply { margin-top: 10px; width: 100%; }

  /* 底部时间轴 */
  &__timeline {
    background: #0e1524;
    border: 1px solid rgba(255,255,255,.06);
    border-radius: 12px;
    padding: 10px 18px 6px 18px;
    color: #cbd5e1;
  }
  &__tl-bar { position: relative; height: 40px; }
  &__tl-sky {
    position: absolute; left: 0; right: 0; top: 0; height: 22px;
    border-radius: 6px; overflow: hidden;
    transition: background .4s ease;
  }
  &__tl-sun {
    position: absolute; top: 6px;
    width: 12px; height: 12px; border-radius: 50%;
    background: radial-gradient(circle, #fff7cc 0%, #ffd56b 60%, #f59e0b 100%);
    box-shadow: 0 0 10px rgba(255,210,80,.7);
    transition: left .1s linear;
  }
  &__tl-star {
    position: absolute; top: 4px; width: 2px; height: 2px; border-radius: 50%; background: #fff;
    transition: opacity .3s ease;
  }
  &__slider {
    position: absolute; top: 22px; left: 0; right: 0;
  }
  &__tl-info {
    display: flex; justify-content: space-between; align-items: center;
    margin-top: 6px; font-size: 12px;
    &-time { font-weight: 600; color: #e6edf7; font-size: 14px; letter-spacing: 1px; }
    &-amp { color: #9fb3d1; }
    &-power { color: #7b8aa3; }
  }

  /* Element Plus 微调 */
  :deep(.el-slider__runway) { background: rgba(255,255,255,.12); height: 4px; }
  :deep(.el-slider__bar) { background: linear-gradient(90deg, #5b8def, #8b5cf6); height: 4px; }
  :deep(.el-slider__button) { width: 16px; height: 16px; background: #fff; border: 2px solid #5b8def; }
  :deep(.el-slider__marks-text) { color: #7b8aa3; }
  :deep(.el-select), :deep(.el-input) .el-input__wrapper { background: #131c30 !important; box-shadow: 0 0 0 1px rgba(255,255,255,.1) inset !important; }
  :deep(.el-input__inner), :deep(.el-select__selected-item) { color: #e6edf7 !important; }
  :deep(.el-progress-bar__outer) { background: rgba(255,255,255,.08) !important; }
}
</style>
