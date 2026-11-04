<!--
  智光云枢 · 节能报告中心 · 节能总览（基线校正真对比）
  业务域：energyReport
  功能：基线校正算法 + SVG 折线叠加 + 60 秒注入新数据
-->
<template>
  <section class="zg-er-overview">
    <header class="zg-er-overview__head">
      <div class="zg-er-overview__headline">
        <div class="zg-er-overview__sigil"><el-icon :size="22"><TrendCharts /></el-icon></div>
        <div class="zg-er-overview__copy">
          <h1 class="zg-er-overview__title">节能总览（基线校正）</h1>
          <p class="zg-er-overview__sub">校正系数 {{ correctionFactor.toFixed(3) }} · 校正前 {{ baseline.toLocaleString() }} → 校正后 {{ normalizedBaseline.toLocaleString() }} kWh</p>
        </div>
      </div>
      <div class="zg-er-overview__head-meta">
        <el-tag type="success" effect="dark" round>2026 年度</el-tag>
        <span class="zg-er-overview__meta-divider">|</span>
        <span>截止 {{ todayLabel }}</span>
      </div>
    </header>

    <!-- ===== 基线校正告警 ===== -->
    <el-alert
      type="warning"
      :closable="false"
      show-icon
      title="基线校正说明：改造前一年为暖冬（比常年高 2°C），基线耗电下调 5%；同期法定节假日数量差 −2 天，按日平均耗电调整。综合校正系数 = 气象 × 节假日 = {{ correctionFactor.toFixed(3) }}"
      style="margin-bottom: 20px"
    />

    <!-- ===== 5 大字 KPI ===== -->
    <div class="zg-er-overview__kpis">
      <div v-for="(k, i) in kpis" :key="k.label" class="zg-er-overview__kpi">
        <div class="zg-er-overview__kpi-top">
          <span class="zg-er-overview__kpi-label">{{ k.label }}</span>
          <el-icon :size="16" class="zg-er-overview__kpi-icon" :style="{ color: k.iconColor }"><component :is="k.icon" /></el-icon>
        </div>
        <div class="zg-er-overview__kpi-num" :style="{ background: k.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }">
          {{ k.value }}
        </div>
        <div class="zg-er-overview__kpi-unit">{{ k.unit }}</div>
        <div class="zg-er-overview__kpi-foot">{{ k.foot }}</div>
      </div>
    </div>

    <!-- ===== 三图区域 ===== -->
    <div class="zg-er-overview__charts">
      <!-- 校正前 vs 校正后 vs 改造后 -->
      <div class="zg-er-overview__card">
        <div class="zg-er-overview__card-head">
          <h3><el-icon><Histogram /></el-icon>基线校正前后 · 改造后对比</h3>
          <div class="zg-er-overview__legend">
            <span class="dot dot--gray"></span>校正前基线
            <span class="dot dot--amber"></span>校正后基线
            <span class="dot dot--purple"></span>改造后实测
          </div>
        </div>
        <div class="zg-er-overview__ring-row">
          <div v-for="ring in rings" :key="ring.title" class="zg-er-overview__ring">
            <svg viewBox="0 0 120 120" width="120" height="120">
              <circle cx="60" cy="60" r="48" fill="none" stroke="#f1f5f9" stroke-width="10" />
              <circle cx="60" cy="60" r="48" fill="none" :stroke="ring.color" stroke-width="10"
                stroke-linecap="round" stroke-dasharray="301.6"
                :stroke-dashoffset="301.6 * (1 - ring.pct)"
                transform="rotate(-90 60 60)" class="zg-er-overview__ring-fg" />
            </svg>
            <div class="zg-er-overview__ring-label">
              <span class="zg-er-overview__ring-title">{{ ring.title }}</span>
              <span class="zg-er-overview__ring-val">{{ ring.pctVal.toLocaleString() }}</span>
              <span class="zg-er-overview__ring-unit">kWh</span>
            </div>
          </div>
        </div>
        <div class="zg-er-overview__correction-detail">
          <div>校正前基线：<strong>{{ baseline.toLocaleString() }}</strong> kWh</div>
          <div>× 校正系数 <strong>{{ correctionFactor.toFixed(3) }}</strong></div>
          <div>= 校正后基线：<strong class="ok">{{ normalizedBaseline.toLocaleString() }}</strong> kWh</div>
          <div>节能率：<strong class="big">{{ (1 - measured / normalizedBaseline) * 100 }}</strong>%</div>
        </div>
      </div>

      <!-- 12 个月柱图 + SVG 折线叠加 -->
      <div class="zg-er-overview__card">
        <div class="zg-er-overview__card-head">
          <h3><el-icon><Collection /></el-icon>12 月逐月耗电（柱 + 折线）</h3>
          <span class="zg-er-overview__card-sub">灰 = 校正前 / 紫 = 改造后 / 红 = 差值</span>
        </div>
        <div class="zg-er-overview__barchart">
          <div class="zg-er-overview__bars">
            <div v-for="m in monthlyData" :key="m.month" class="zg-er-overview__bar-col" :title="`${m.month}: 旧 ${m.old} → 新 ${m.new} kWh`">
              <div class="zg-er-overview__bar-stack">
                <div class="zg-er-overview__bar zg-er-overview__bar--old" :style="{ height: `${(m.old / maxBar) * 100}%` }"></div>
                <div class="zg-er-overview__bar zg-er-overview__bar--new" :style="{ height: `${(m.new / maxBar) * 100}%` }"></div>
              </div>
              <span class="zg-er-overview__bar-lbl">{{ m.month.slice(0,2) }}</span>
            </div>
          </div>
          <!-- SVG 折线叠加 -->
          <svg class="zg-er-overview__line-svg" viewBox="0 0 600 220" preserveAspectRatio="none">
            <defs>
              <linearGradient id="zg-line-diff" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#dc2626" stop-opacity="0.4" />
                <stop offset="100%" stop-color="#dc2626" stop-opacity="0" />
              </linearGradient>
            </defs>
            <!-- 差值折线 -->
            <polyline
              class="zg-er-overview__diff-line"
              :points="diffLinePoints"
              fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
              vector-effect="non-scaling-stroke"
            />
            <!-- 差值点 -->
            <g v-for="(pt, i) in diffPoints" :key="'pt-' + i">
              <circle :cx="pt.x" :cy="pt.y" r="4" fill="#dc2626" />
            </g>
          </svg>
        </div>
      </div>

      <!-- 项目级对比 -->
      <div class="zg-er-overview__card">
        <div class="zg-er-overview__card-head">
          <h3><el-icon><Coin /></el-icon>项目级节能率对比（校正后）</h3>
        </div>
        <div class="zg-er-overview__proj">
          <div v-for="p in projects" :key="p.name" class="zg-er-overview__proj-row">
            <div class="zg-er-overview__proj-head">
              <span class="zg-er-overview__proj-name">{{ p.name }}</span>
              <span class="zg-er-overview__proj-pct">{{ p.pct }}%</span>
            </div>
            <div class="zg-er-overview__proj-bar-track">
              <div class="zg-er-overview__proj-bar-fill" :style="{ width: `${p.pct}%`, background: p.color }"></div>
            </div>
            <div class="zg-er-overview__proj-meta">
              <span>校正基线 {{ p.normalized.toLocaleString() }} kWh</span>
              <span>年节 {{ p.saved.toLocaleString() }} kWh</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== 脚注 ===== -->
    <footer class="zg-er-overview__foot">
      <span class="zg-er-overview__foot-item">数据来源：智能网关 + 云枢平台 · 每 15 分钟自动聚合</span>
      <span class="zg-er-overview__foot-item">排放因子：湖南省电网 2025 OM 法 = 0.5810 kg CO₂/kWh</span>
      <span class="zg-er-overview__foot-item">行业基准：25%（住建部 2025 城市照明白皮书）</span>
    </footer>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { TrendCharts, Coin, Histogram, Collection } from '@element-plus/icons-vue'

// ===== 基线校正算法 =====
const baseline = 3200000        // 校正前基线（改造前一年实际耗电）
const weatherFactor = 0.95      // 暖冬校正 -5%（比常年高 2°C）
const holidayFactor = 1.006     // 节假日差 -2 天 × 2800 kWh/天 ≈ -5600 → 调整
const correctionFactor = computed(() => Number((weatherFactor * holidayFactor).toFixed(4)))
const normalizedBaseline = computed(() => Math.round(baseline * correctionFactor.value))

const measured = 1835400       // 改造后实测
const annualSavings = computed(() => normalizedBaseline.value - measured)

const todayLabel = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})

// ===== KPI =====
const kpis = computed(() => [
  { label: '校正后年节电量', value: annualSavings.value.toLocaleString(), unit: 'kWh', foot: '≈ 37,760 棵杉木吸收', icon: TrendCharts, gradient: 'linear-gradient(135deg, #6366f1, #818cf8)', iconColor: '#6366f1' },
  { label: '年节省电费（峰谷加权）', value: '¥' + (annualSavings.value * 0.721).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ','), unit: '', foot: '年度照明公司净利润', icon: Coin, gradient: 'linear-gradient(135deg, #a855f7, #c084fc)', iconColor: '#a855f7' },
  { label: '年减 CO₂（EF 0.581）', value: (annualSavings.value * 0.5810 / 1000).toFixed(0), unit: '吨', foot: '≈ 停 380 辆汽油车一年', icon: Histogram, gradient: 'linear-gradient(135deg, #06b6d4, #22d3ee)', iconColor: '#06b6d4' },
  { label: '节能率（校正后）', value: ((1 - measured / normalizedBaseline.value) * 100).toFixed(1), unit: '%', foot: '行业平均 25%', icon: Collection, gradient: 'linear-gradient(135deg, #10b981, #34d399)', iconColor: '#10b981' },
  { label: 'EMC 应收分成', value: '¥' + ((annualSavings.value * 0.721) * 0.7).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ','), unit: '', foot: '70% 份额 · 5 年期', icon: Coin, gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)', iconColor: '#f59e0b' }
])

// ===== 环形图 =====
const rings = computed(() => [
  { title: '校正前基线', pct: baseline / baseline, pctVal: baseline, color: '#94a3b8' },
  { title: '校正后基线', pct: normalizedBaseline.value / baseline, pctVal: normalizedBaseline.value, color: '#f59e0b' },
  { title: '改造后实测', pct: measured / baseline, pctVal: measured, color: '#a855f7' }
])

// ===== 逐月数据（60 秒注入新数据）=====
const monthlyBase = [
  { month: '01月', old: 270000, new: 150000 },
  { month: '02月', old: 240000, new: 133000 },
  { month: '03月', old: 260000, new: 145000 },
  { month: '04月', old: 285000, new: 158000 },
  { month: '05月', old: 298000, new: 165000 },
  { month: '06月', old: 310000, new: 172000 },
  { month: '07月', old: 325000, new: 180000 },
  { month: '08月', old: 320000, new: 177000 },
  { month: '09月', old: 295000, new: 162000 },
  { month: '10月', old: 270000, new: 150000 },
  { month: '11月', old: 285000, new: 158000 },
  { month: '12月', old: 290000, new: 160000 }
]

const monthlyData = ref(monthlyBase.map(m => ({ ...m })))
const maxBar = computed(() => Math.max(...monthlyData.value.map(m => m.old), 1))

// SVG 折线点
const W = 600, H = 220, PAD = 10
const diffPoints = computed(() => {
  const arr = []
  monthlyData.value.forEach((m, i) => {
    const x = PAD + (i / 11) * (W - 2 * PAD)
    const diff = m.old - m.new
    const y = H - PAD - (diff / (maxBar.value * 0.8)) * (H - 2 * PAD)
    arr.push({ x, y })
  })
  return arr
})
const diffLinePoints = computed(() => diffPoints.value.map(p => `${p.x},${p.y}`).join(' '))

// ===== 60 秒注入 =====
let tickTimer = null, tickIdx = 0
onMounted(() => {
  tickTimer = setInterval(() => {
    const idx = tickIdx % 12
    monthlyData.value[idx].new = Math.max(100000, monthlyData.value[idx].new + Math.round((Math.random() - 0.5) * 2000))
    monthlyData.value[idx].old = Math.max(monthlyData.value[idx].new + 50000, monthlyData.value[idx].old + Math.round((Math.random() - 0.5) * 3000))
    tickIdx++
  }, 60000)
})
onUnmounted(() => { clearInterval(tickTimer) })

// ===== 项目对比 =====
const projects = computed(() => [
  { name: '先导路改造项目', pct: ((1 - 1835400 / normalizedBaseline.value) * 100).toFixed(1), normalized: normalizedBaseline.value, saved: annualSavings.value, color: 'linear-gradient(90deg,#6366f1,#818cf8)' },
  { name: '麓谷产业园', pct: '36.0', normalized: 1950000, saved: 702000, color: 'linear-gradient(90deg,#a855f7,#c084fc)' },
  { name: '梅溪湖环湖路', pct: '41.0', normalized: 2200000, saved: 902000, color: 'linear-gradient(90deg,#06b6d4,#22d3ee)' }
])
</script>

<style lang="scss" scoped>
.zg-er-overview {
  padding: var(--zg-space-6);
  background: var(--zg-gradient-surface);
  min-height: calc(100vh - 120px);

  &__head {
    display: flex; align-items: center; justify-content: space-between;
    padding-bottom: var(--zg-space-5); margin-bottom: var(--zg-space-4);
    border-bottom: 1px solid var(--zg-line-soft);
  }
  &__sigil { width: 44px; height: 44px; border-radius: var(--zg-radius-md); background: linear-gradient(135deg, #6366f1, #a855f7); color: #fff; display: flex; align-items: center; justify-content: center; }
  &__title { margin: 0; font-size: var(--zg-text-display-md); font-weight: 700; }
  &__sub { margin: 2px 0 0; font-size: var(--zg-text-body-sm); color: var(--zg-ink-tertiary); }

  // KPI
  &__kpis { display: grid; grid-template-columns: repeat(5, 1fr); gap: var(--zg-space-5); margin-bottom: var(--zg-space-6); }
  &__kpi {
    background: var(--zg-surface-card); border: 1px solid var(--zg-line-strong);
    border-radius: var(--zg-radius-lg); padding: var(--zg-space-5);
    box-shadow: var(--zg-shadow-card);
  }
  &__kpi-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--zg-space-2); }
  &__kpi-label { font-size: var(--zg-text-body-sm); color: var(--zg-ink-secondary); font-weight: 500; }
  &__kpi-num { font-size: 40px; font-weight: 800; line-height: 1.1; font-family: var(--zg-font-mono); }
  &__kpi-foot { margin-top: var(--zg-space-3); font-size: var(--zg-text-caption); color: var(--zg-ink-tertiary); padding-top: var(--zg-space-2); border-top: 1px dashed var(--zg-line-soft); }

  // 图表区
  &__charts { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--zg-space-5); margin-bottom: var(--zg-space-6); }
  &__card {
    background: var(--zg-surface-card); border: 1px solid var(--zg-line-strong);
    border-radius: var(--zg-radius-lg); box-shadow: var(--zg-shadow-card);
    padding: var(--zg-space-5); min-height: 420px;
    display: flex; flex-direction: column;
  }
  &__card-head {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: var(--zg-space-4); padding-bottom: var(--zg-space-3);
    border-bottom: 1px solid var(--zg-line-soft);
    h3 { margin: 0; font-size: var(--zg-text-body); font-weight: 600; display: flex; gap: 6px; align-items: center; }
  }
  &__card-sub { color: var(--zg-ink-tertiary); font-size: var(--zg-text-caption); }

  // 图例
  &__legend { display: flex; gap: var(--zg-space-3); align-items: center; font-size: var(--zg-text-caption); color: var(--zg-ink-secondary); }
  .dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 4px; vertical-align: middle; }
  .dot--gray { background: #94a3b8; }
  .dot--amber { background: #f59e0b; }
  .dot--purple { background: #a855f7; }

  // 环形图
  &__ring-row { display: flex; justify-content: space-around; margin-top: var(--zg-space-4); margin-bottom: var(--zg-space-3); }
  &__ring { display: flex; flex-direction: column; align-items: center; gap: var(--zg-space-3); }
  &__ring-label { display: flex; flex-direction: column; align-items: center; }
  &__ring-title { font-size: var(--zg-text-caption); color: var(--zg-ink-tertiary); }
  &__ring-val { font-size: var(--zg-text-display-sm); font-weight: 700; font-family: var(--zg-font-mono); color: var(--zg-ink-primary); }
  &__ring-unit { font-size: var(--zg-text-caption); color: var(--zg-ink-tertiary); }

  // 校正细节
  &__correction-detail {
    padding: var(--zg-space-3); background: var(--zg-amber-50); border-radius: var(--zg-radius-md); border: 1px solid var(--zg-amber-soft);
    font-size: var(--zg-text-body-sm);
    div { padding: 2px 0; }
    strong.ok { color: var(--zg-emerald-success); }
    strong.big { color: var(--zg-rose-danger); font-size: var(--zg-text-display-sm); }
  }

  // 柱状图 + 折线叠加
  &__barchart { flex: 1; position: relative; height: 260px; }
  &__bars { display: flex; align-items: flex-end; justify-content: space-between; gap: 4px; height: 100%; padding-bottom: 28px; }
  &__bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px; height: 100%; }
  &__bar-stack { flex: 1; width: 60%; display: flex; flex-direction: column; justify-content: flex-end; gap: 2px; }
  &__bar { width: 100%; border-radius: 2px 2px 0 0; transition: height 0.8s ease; }
  &__bar--old { background: linear-gradient(180deg, #94a3b8, #cbd5e1); }
  &__bar--new { background: linear-gradient(180deg, #a855f7, #c084fc); }
  &__bar-lbl { font-size: 10px; color: var(--zg-ink-tertiary); font-family: var(--zg-font-mono); }
  &__line-svg {
    position: absolute; top: 0; left: 0; width: 100%; height: calc(100% - 28px);
    pointer-events: none;
  }
  &__diff-line { transition: all 0.8s ease; }

  // 项目对比
  &__proj { display: flex; flex-direction: column; gap: var(--zg-space-4); }
  &__proj-row {
    padding: var(--zg-space-3); border-radius: var(--zg-radius-md);
    background: var(--zg-surface-muted); border: 1px solid var(--zg-line-soft);
  }
  &__proj-head { display: flex; justify-content: space-between; margin-bottom: var(--zg-space-2); }
  &__proj-name { font-weight: 600; font-size: var(--zg-text-body); }
  &__proj-pct { font-weight: 700; color: var(--zg-amber-glow); font-family: var(--zg-font-mono); }
  &__proj-bar-track { height: 10px; background: var(--zg-line-soft); border-radius: 6px; overflow: hidden; margin-bottom: var(--zg-space-2); }
  &__proj-bar-fill { height: 100%; border-radius: 6px; transition: width 1s ease; }
  &__proj-meta { display: flex; justify-content: space-between; font-size: var(--zg-text-caption); color: var(--zg-ink-tertiary); }

  // 脚注
  &__foot {
    display: flex; justify-content: space-between; padding: var(--zg-space-4);
    background: var(--zg-surface-muted); border-radius: var(--zg-radius-md);
    border: 1px solid var(--zg-line-soft); font-size: var(--zg-text-caption); color: var(--zg-ink-tertiary);
  }
}
</style>
