<!--
  智光云枢 · 隧道增强 · 灯随车亮
  业务域：tunnelPlus
  功能：隧道口毫米波雷达检测 → 车辆跟踪 → 前方灯段逐级点亮
        参考：浙江建金高速目科里隧道、深中隧道"灯随车亮"系统
-->
<template>
  <section class="zg-fl">
    <!-- 页面头部 -->
    <header class="zg-fl__head">
      <div class="zg-fl__headline">
        <div class="zg-fl__sigil">
          <el-icon :size="22"><ReadingLamp /></el-icon>
        </div>
        <div class="zg-fl__copy">
          <h1 class="zg-fl__title">灯随车亮 · 伴随式照明</h1>
          <p class="zg-fl__sub">
            毫米波雷达 {{ tunnel.radarRangeM }}m 检测区 · {{ tunnel.segmentCount }} 段独立调光 ·
            响应延迟 < 30ms · 节能约 40%
          </p>
        </div>
      </div>
      <div class="zg-fl__status">
        <el-tag type="success" effect="dark" round size="default">
          <span class="zg-fl__pulse"></span>系统在线
        </el-tag>
      </div>
    </header>

    <!-- ========== 主可视化舞台 ========== -->
    <div class="zg-fl__stage">

      <!-- 左：毫米波雷达 -->
      <div class="zg-fl__radar">
        <h3 class="zg-fl__radar-title">📡 毫米波雷达</h3>
        <p class="zg-fl__radar-sub">{{ tunnel.radarRangeM }}m 检测区 · 识别率 99.2%</p>
        <div class="zg-fl__radar-scene">
          <!-- 雷达扇形 -->
          <svg viewBox="0 0 120 120" class="zg-fl__radar-svg">
            <!-- 同心圆 -->
            <circle cx="60" cy="110" r="30" fill="none" stroke="#6366f1" stroke-width="0.5" opacity="0.4" />
            <circle cx="60" cy="110" r="50" fill="none" stroke="#6366f1" stroke-width="0.5" opacity="0.3" />
            <circle cx="60" cy="110" r="70" fill="none" stroke="#6366f1" stroke-width="0.5" opacity="0.2" />
            <!-- 雷达扫描线（CSS 动画扫动）-->
            <line x1="60" y1="110" x2="60" y2="40" stroke="#8b5cf6" stroke-width="1.5" class="zg-fl__radar-sweep" />
            <!-- 目标标记（车辆进入时闪烁）-->
            <g v-if="carDetected">
              <circle :cx="radarDot.x" :cy="radarDot.y" r="4" fill="#ef4444" class="zg-fl__radar-target" />
              <text :x="radarDot.x + 8" :y="radarDot.y + 4" fill="#ef4444" font-size="6">车辆</text>
            </g>
            <!-- 雷达底部 -->
            <rect x="52" y="108" width="16" height="8" rx="2" fill="#4c1d95" />
          </svg>
        </div>
      </div>

      <!-- 中：隧道灯段阵列 + 车辆 -->
      <div class="zg-fl__tunnel">
        <h3 class="zg-fl__tunnel-title">🚇 {{ tunnel.tunnelName }}（{{ tunnel.tunnelLengthM }}m）</h3>
        <div class="zg-fl__tunnel-scene">
          <!-- 背景：隧道轮廓 -->
          <div class="zg-fl__tunnel-bg">
            <div class="zg-fl__tunnel-road"></div>
            <div class="zg-fl__tunnel-ceiling"></div>
          </div>

          <!-- 车辆 SVG（从左向右移动）-->
          <svg viewBox="0 0 60 30" class="zg-fl__car" :style="{ left: carX + '%' }">
            <rect x="2" y="6" width="40" height="18" rx="4" fill="#6366f1" />
            <rect x="8" y="2" width="28" height="8" rx="3" fill="#818cf8" />
            <circle cx="12" cy="26" r="4" fill="#1f2937" />
            <circle cx="34" cy="26" r="4" fill="#1f2937" />
            <rect x="40" y="10" width="18" height="12" rx="2" fill="#4f46e5" />
            <!-- 车头灯光 -->
            <ellipse cx="58" cy="16" rx="8" ry="6" fill="#fde68a" opacity="0.6" />
          </svg>

          <!-- 灯段阵列 -->
          <div class="zg-fl__segments">
            <div
              v-for="(seg, idx) in tunnel.segments"
              :key="seg.idx"
              class="zg-fl__seg"
              :class="{ 'zg-fl__seg--on': seg.brightness > 10 }"
              :style="{ width: seg.lengthM / tunnel.tunnelLengthM * 100 + '%', '--lux': seg.brightness + '%' }"
            >
              <div class="zg-fl__seg-light" :style="{ opacity: seg.brightness / 100 }"></div>
              <div class="zg-fl__seg-info">
                <span class="zg-fl__seg-name">{{ seg.name }}</span>
                <span class="zg-fl__seg-lux">{{ seg.brightness }}%</span>
              </div>
            </div>
          </div>

          <!-- 入口/出口标签 -->
          <div class="zg-fl__tunnel-labels">
            <span class="zg-fl__label zg-fl__label--in">入口 ▶</span>
            <span class="zg-fl__label zg-fl__label--out">▶ 出口</span>
          </div>
        </div>
      </div>

      <!-- 右：亮度跟随曲线 -->
      <div class="zg-fl__curve">
        <h3 class="zg-fl__curve-title">📈 亮度跟随曲线</h3>
        <svg viewBox="0 0 260 140" class="zg-fl__curve-svg">
          <!-- 坐标轴 -->
          <line x1="30" y1="10" x2="30" y2="130" stroke="#e5e7eb" stroke-width="1" />
          <line x1="30" y1="130" x2="255" y2="130" stroke="#e5e7eb" stroke-width="1" />
          <!-- Y 刻度 -->
          <text x="8" y="14" font-size="8" fill="#909399">100%</text>
          <text x="8" y="72" font-size="8" fill="#909399">50%</text>
          <text x="8" y="132" font-size="8" fill="#909399">0%</text>
          <!-- X 刻度 -->
          <text x="30" y="145" font-size="7" fill="#909399">入口</text>
          <text x="250" y="145" font-size="7" fill="#909399">出口</text>

          <!-- 基础线（虚线，基准亮度）-->
          <polyline :points="baseCurvePoints" fill="none" stroke="#c0c4cc" stroke-width="1" stroke-dasharray="3,3" />

          <!-- 实时跟随曲线（渐变紫色）-->
          <polyline :points="curvePoints" fill="none" stroke="url(#curveGrad)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
          <defs>
            <linearGradient id="curveGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#6366f1" />
              <stop offset="100%" stop-color="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>
        <div class="zg-fl__curve-legend">
          <span class="zg-fl__legend-dot zg-fl__legend-dot--active"></span>实时亮度
          <span class="zg-fl__legend-dot zg-fl__legend-dot--base"></span>基准亮度
        </div>
      </div>
    </div>

    <!-- ========== 模拟控制台 ========== -->
    <div class="zg-fl__controls">
      <div class="zg-fl__ctrl-row">
        <el-button-group>
          <el-button type="primary" size="large" @click="startDemo" :disabled="isPlaying">
            <el-icon><VideoPlay /></el-icon>🚗 模拟车辆驶入（{{ carSpeedLabel }}）
          </el-button>
          <el-button size="large" @click="togglePause" :disabled="!isPlaying">
            {{ isPaused ? '▶ 继续' : '⏸ 暂停' }}
          </el-button>
          <el-button type="danger" size="large" @click="resetDemo">
            <el-icon><RefreshLeft /></el-icon>↩ 重置
          </el-button>
        </el-button-group>

        <el-switch v-model="loopMode" active-text="循环模式" />
      </div>

      <div class="zg-fl__ctrl-row zg-fl__ctrl-row--sliders">
        <div class="zg-fl__ctrl-item">
          <span class="zg-fl__ctrl-label">车速模拟</span>
          <el-slider v-model="carSpeed" :min="1" :max="5" :step="1" style="width: 200px" />
        </div>
        <div class="zg-fl__ctrl-item">
          <span class="zg-fl__ctrl-label">基准亮度</span>
          <el-slider v-model="baseBrightness" :min="5" :max="30" :step="5" style="width: 150px" />
        </div>
        <div class="zg-fl__ctrl-item">
          <span class="zg-fl__ctrl-label">跟随峰值</span>
          <el-slider v-model="peakBrightness" :min="60" :max="100" :step="10" style="width: 150px" />
        </div>
      </div>
    </div>

    <!-- ========== 状态仪表盘 ========== -->
    <div class="zg-fl__gauges">
      <div class="zg-fl__gauge">
        <div class="zg-fl__gauge-num">{{ currentSegmentIdx >= 0 ? tunnel.segments[currentSegmentIdx].name : '—' }}</div>
        <div class="zg-fl__gauge-lbl">当前车位置</div>
      </div>
      <div class="zg-fl__gauge">
        <div class="zg-fl__gauge-num">{{ carPositionM.toFixed(0) }}m</div>
        <div class="zg-fl__gauge-lbl">行驶里程</div>
      </div>
      <div class="zg-fl__gauge">
        <div class="zg-fl__gauge-num">{{ (peakBrightness - baseBrightness) * tunnel.segmentCount }}</div>
        <div class="zg-fl__gauge-lbl">节能潜力（kWh/天）</div>
      </div>
      <div class="zg-fl__gauge">
        <div class="zg-fl__gauge-num" :class="{ 'zg-fl__gauge-num--ok': carDetected }">{{ carDetected ? 'DETECTED' : 'IDLE' }}</div>
        <div class="zg-fl__gauge-lbl">雷达状态</div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { ReadingLamp, VideoPlay, RefreshLeft } from '@element-plus/icons-vue'
import { followLightTunnel } from '@/data/mockData'

// ========== 状态 ==========
const tunnel = reactive(JSON.parse(JSON.stringify(followLightTunnel)))

const carX = ref(-10)         // 车的位置（百分比）
const carSpeed = ref(3)       // 速度档位 1~5
const baseBrightness = ref(10)
const peakBrightness = ref(90)
const loopMode = ref(false)
const isPlaying = ref(false)
const isPaused = ref(false)
const carDetected = ref(false)

let rafId = null
let startTime = 0
let lastFrame = 0

// ========== 派生计算 ==========
const carSpeedLabel = computed(() => {
  const map = { 1: '慢速 20km/h', 2: '标准 40km/h', 3: '快速 60km/h', 4: '高速 80km/h', 5: '极速 120km/h' }
  return map[carSpeed.value] || '标准'
})
const carPositionM = computed(() => Math.max(0, carX.value) / 100 * tunnel.tunnelLengthM)
const currentSegmentIdx = computed(() => {
  const pos = carX.value
  let acc = 0
  for (let i = 0; i < tunnel.segments.length; i++) {
    acc += tunnel.segments[i].lengthM / tunnel.tunnelLengthM * 100
    if (pos < acc) return i
  }
  return tunnel.segments.length - 1
})
const radarDot = computed(() => {
  // 在雷达扇形里，车越近出口，dot 越靠下
  const p = Math.min(1, Math.max(0, (carX.value - 10) / 30)) // 10%~40% 区间内雷达有信号
  return { x: 60 + p * 0, y: 110 - p * 45 }
})

// ========== 曲线点 ==========
const curvePoints = computed(() => {
  const pts = tunnel.segments.map((seg, i) => {
    const x = 30 + (i / (tunnel.segments.length - 1)) * 225
    const y = 130 - seg.brightness / 100 * 115
    return `${x},${y}`
  })
  return pts.join(' ')
})
const baseCurvePoints = computed(() => {
  return tunnel.segments.map((_, i) => {
    const x = 30 + (i / (tunnel.segments.length - 1)) * 225
    const y = 130 - baseBrightness.value / 100 * 115
    return `${x},${y}`
  }).join(' ')
})

// ========== 核心：根据车位置更新各段亮度 ==========
const updateBrightness = () => {
  const carPos = carX.value
  tunnel.segments.forEach((seg, idx) => {
    const segStart = tunnel.segments.slice(0, idx).reduce((s, x) => s + x.lengthM, 0) / tunnel.tunnelLengthM * 100
    const segEnd = segStart + seg.lengthM / tunnel.tunnelLengthM * 100
    // 车前方 2 段范围亮起，距离越近越亮
    const distance = carPos - segEnd  // 负值表示在前方
    if (distance >= -8 && distance < 10) {
      // 距离在 [-8, 10] 区间内有亮度（8%=约 174m 前方）
      const factor = Math.max(0, 1 - Math.abs(distance) / 10)
      seg.brightness = Math.round(baseBrightness.value + (peakBrightness.value - baseBrightness.value) * factor)
    } else if (carPos < -5) {
      seg.brightness = baseBrightness.value  // 还没进入，维持基准
    } else {
      seg.brightness = Math.round(baseBrightness.value + 5)  // 离开后轻微残留再恢复
    }
  })
}

// ========== 动画循环 ==========
const speedFactor = () => 0.08 * carSpeed.value  // 每帧百分比增量
const loop = (ts) => {
  if (!lastFrame) lastFrame = ts
  const dt = (ts - lastFrame) / 16.667  // 归一化到 60fps
  lastFrame = ts

  if (!isPaused.value && isPlaying.value) {
    // 车辆从左到右移动
    carX.value += speedFactor() * dt

    // 雷达检测：车在 5%~20% 区间（雷达区）时 DETECTED
    carDetected.value = carX.value >= 5 && carX.value <= 20

    // 更新亮度
    updateBrightness()

    // 车到达出口
    if (carX.value > 105) {
      if (loopMode.value) {
        carX.value = -10  // 循环重置
        tunnel.segments.forEach(s => s.brightness = baseBrightness.value)
      } else {
        isPlaying.value = false
        carX.value = -10
        tunnel.segments.forEach(s => s.brightness = baseBrightness.value)
        carDetected.value = false
      }
    }
  }

  rafId = requestAnimationFrame(loop)
}

// ========== 事件 ==========
const startDemo = () => {
  if (isPlaying.value) return
  carX.value = -10
  tunnel.segments.forEach(s => s.brightness = baseBrightness.value)
  isPlaying.value = true
  isPaused.value = false
  carDetected.value = false
  lastFrame = 0
  rafId = requestAnimationFrame(loop)
}
const togglePause = () => { isPaused.value = !isPaused.value }
const resetDemo = () => {
  isPlaying.value = false
  isPaused.value = false
  carX.value = -10
  carDetected.value = false
  tunnel.segments.forEach(s => s.brightness = baseBrightness.value)
}

onMounted(() => { tunnel.segments.forEach(s => s.brightness = baseBrightness.value) })
onUnmounted(() => { if (rafId) cancelAnimationFrame(rafId) })
</script>

<style scoped lang="scss">

.zg-fl { padding: 20px; display: flex; flex-direction: column; gap: 16px; }

// 头部
.zg-fl__head { display: flex; align-items: center; justify-content: space-between; }
.zg-fl__headline { display: flex; align-items: center; gap: 14px; }
.zg-fl__sigil { width: 44px; height: 44px; border-radius: 10px; background: linear-gradient(135deg, #10b981, #6366f1); color: #fff; display: flex; align-items: center; justify-content: center; }
.zg-fl__title { font-size: 20px; font-weight: 600; color: #1f2d3d; margin: 0 0 4px; }
.zg-fl__sub { font-size: 13px; color: #909399; margin: 0; }
.zg-fl__pulse { display: inline-block; width: 8px; height: 8px; background: #10b981; border-radius: 50%; margin-right: 6px; animation: pulse 1.5s infinite; }
@keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.3 } }

// ========== 主舞台 ==========
.zg-fl__stage {
  display: grid; grid-template-columns: 200px 1fr 280px; gap: 14px;
  background: #fff; border-radius: 14px; padding: 16px; border: 1px solid #f0f0f0;
}

// 雷达
.zg-fl__radar { display: flex; flex-direction: column; }
.zg-fl__radar-title { font-size: 14px; font-weight: 600; color: #1f2d3d; margin: 0 0 4px; }
.zg-fl__radar-sub { font-size: 11px; color: #909399; margin: 0 0 10px; }
.zg-fl__radar-scene { background: #f8fafc; border-radius: 10px; padding: 8px; }
.zg-fl__radar-svg { width: 100%; height: auto; }
.zg-fl__radar-sweep { transform-origin: 60px 110px; animation: sweep 2s linear infinite; }
@keyframes sweep { from { transform: rotate(0deg) } to { transform: rotate(180deg) } }
.zg-fl__radar-target { animation: blink 0.6s infinite; }
@keyframes blink { 0%,100% { opacity: 1 } 50% { opacity: 0.3 } }

// 隧道场景
.zg-fl__tunnel { display: flex; flex-direction: column; }
.zg-fl__tunnel-title { font-size: 14px; font-weight: 600; color: #1f2d3d; margin: 0 0 10px; }
.zg-fl__tunnel-scene {
  position: relative; height: 180px; background: #1e293b; border-radius: 10px; overflow: hidden;
  display: flex; align-items: center;
}
.zg-fl__tunnel-bg { position: absolute; inset: 0; }
.zg-fl__tunnel-road { position: absolute; left: 0; right: 0; top: 55%; bottom: 0; background: linear-gradient(180deg, #374151, #1f2937); }
.zg-fl__tunnel-ceiling { position: absolute; left: 0; right: 0; top: 0; height: 20%; background: linear-gradient(180deg, #374151, transparent); }

// 车辆 SVG
.zg-fl__car { position: absolute; top: 45%; width: 44px; height: 22px; transition: left 0.05s linear; z-index: 10; filter: drop-shadow(0 0 8px rgba(99,102,241,0.6)) }

// 灯段
.zg-fl__segments { position: absolute; left: 4%; right: 4%; top: 20%; bottom: 55%; display: flex; gap: 0; }
.zg-fl__seg {
  position: relative; height: 100%;
  background: rgba(255,255,255,0.02);
  border-left: 1px solid rgba(255,255,255,0.1);
}
.zg-fl__seg-light {
  position: absolute; inset: 0;
  background: linear-gradient(180deg, rgba(253,230,138,0.9), rgba(253,230,138,0.1));
  transition: opacity 0.6s ease-out;
  border-radius: 2px;
}
.zg-fl__seg--on .zg-fl__seg-light { box-shadow: 0 0 20px rgba(253,230,138,0.4); }
.zg-fl__seg-info { position: absolute; bottom: -4px; left: 50%; transform: translateX(-50%); white-space: nowrap; font-size: 9px; }
.zg-fl__seg-name { color: #94a3b8; }
.zg-fl__seg-lux { color: #fbbf24; font-weight: 700; }

// 入口出口标签
.zg-fl__tunnel-labels { position: absolute; left: 4%; right: 4%; bottom: -2px; display: flex; justify-content: space-between; }
.zg-fl__label { font-size: 10px; color: #64748b; font-family: monospace; }

// 曲线
.zg-fl__curve { display: flex; flex-direction: column; }
.zg-fl__curve-title { font-size: 14px; font-weight: 600; color: #1f2d3d; margin: 0 0 10px; }
.zg-fl__curve-svg { background: #f8fafc; border-radius: 10px; padding: 4px; }
.zg-fl__curve-legend { display: flex; gap: 14px; margin-top: 8px; font-size: 11px; color: #606266; align-items: center; }
.zg-fl__legend-dot { display: inline-block; width: 14px; height: 2px; margin-right: 4px; }
.zg-fl__legend-dot--active { background: linear-gradient(90deg, #6366f1, #8b5cf6); }
.zg-fl__legend-dot--base { border-top: 1px dashed #c0c4cc; }

// ========== 控制台 ==========
.zg-fl__controls { background: #fff; border-radius: 12px; padding: 14px 16px; border: 1px solid #f0f0f0; display: flex; flex-direction: column; gap: 10px; }
.zg-fl__ctrl-row { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; }
.zg-fl__ctrl-row--sliders { border-top: 1px solid #f0f0f0; padding-top: 10px; }
.zg-fl__ctrl-item { display: flex; align-items: center; gap: 10px; }
.zg-fl__ctrl-label { font-size: 13px; color: #606266; min-width: 70px; }

// ========== 仪表盘 ==========
.zg-fl__gauges { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.zg-fl__gauge { background: linear-gradient(135deg, #f0f4ff, #f5f3ff); border-radius: 12px; padding: 14px; text-align: center; border: 1px solid #e0e7ff; }
.zg-fl__gauge-num { font-size: 22px; font-weight: 700; color: #6366f1; font-family: 'JetBrains Mono', monospace; }
.zg-fl__gauge-num--ok { color: #10b981; }
.zg-fl__gauge-lbl { font-size: 11px; color: #909399; margin-top: 2px; }

</style>
