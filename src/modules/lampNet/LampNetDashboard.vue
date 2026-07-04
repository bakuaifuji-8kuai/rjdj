<!--
  智光云枢 · 灯网态势 · 态势看板
  业务域：lampNet
  功能：实时呈现城市照明在网通量、能耗趋势、告警分布与处方投递等核心态势
  @version 2.0.1 - forced rebuild
-->
<template>
  <section class="zg-pulseboard">
    <!-- 页面头部：品牌徽标 + 标题 + 实时时间 -->
    <header class="zg-pulseboard__head">
      <div class="zg-pulseboard__headline">
        <div class="zg-pulseboard__sigil">
          <el-icon :size="22"><Aim /></el-icon>
        </div>
        <div class="zg-pulseboard__copy">
          <h1 class="zg-pulseboard__title">灯网态势看板</h1>
          <p class="zg-pulseboard__sub">
            城市照明物联 · 实时在网态势 · {{ liveChrono }}
          </p>
        </div>
      </div>
    </header>

    <!-- 态势脉冲条：4 个关键指标 -->
    <div class="zg-pulsebar">
      <div
        v-for="pulse in pulseStrips"
        :key="pulse.id"
        class="zg-pulsebar__cell"
        :class="`zg-pulsebar__cell--${pulse.tone}`"
      >
        <span class="zg-pulsebar__lbl">{{ pulse.label }}</span>
        <span class="zg-pulsebar__val">{{ pulse.value }}</span>
        <span class="zg-pulsebar__delta" :class="pulse.tone">{{ pulse.delta }}</span>
      </div>
    </div>

    <!-- 四象限 KPI 卡 -->
    <div class="zg-kpiquad">
      <article
        v-for="kpi in kpiCells"
        :key="kpi.id"
        class="zg-kpiquad__cell zg-kpiquad__cell--clickable"
        :class="`zg-kpiquad__cell--${kpi.tone}`"
        @click="openKpiDetail(kpi)"
      >
        <header class="zg-kpiquad__head">
          <span class="zg-kpiquad__glyph">
            <el-icon :size="20"><component :is="kpi.glyph" /></el-icon>
          </span>
          <span class="zg-kpiquad__caption">{{ kpi.caption }}</span>
        </header>
        <div class="zg-kpiquad__metric">
          <span class="zg-kpiquad__number">{{ kpi.metric }}</span>
          <span class="zg-kpiquad__unit">{{ kpi.unit }}</span>
        </div>
        <footer class="zg-kpiquad__foot">
          <span class="zg-kpiquad__delta" :class="kpi.deltaTone">
            <el-icon v-if="kpi.deltaTone === 'up'" :size="12"><Top /></el-icon>
            <el-icon v-else-if="kpi.deltaTone === 'down'" :size="12"><Bottom /></el-icon>
            <el-icon v-else-if="kpi.deltaTone === 'warn'" :size="12"><Warning /></el-icon>
            {{ kpi.deltaText }}
          </span>
          <span class="zg-kpiquad__hint">{{ kpi.hint }}</span>
        </footer>
      </article>
    </div>

    <!-- 图表区域 -->
    <div class="zg-chartdeck">
      <!-- 能耗趋势图 -->
      <div class="zg-chartdeck__panel">
        <header class="zg-chartdeck__head">
          <h3 class="zg-chartdeck__title">能耗趋势图</h3>
          <div class="zg-chartdeck__tabs">
            <button
              v-for="chip in trendChips"
              :key="chip.id"
              :class="['zg-chip', { 'zg-chip--on': trendScope === chip.id }]"
              @click="trendScope = chip.id"
            >
              {{ chip.label }}
            </button>
          </div>
        </header>
        <div class="zg-chartdeck__body">
          <div class="zg-trendchart">
            <div
              v-for="(v, i) in powerTrendSeries"
              :key="i"
              class="zg-trendchart__bar"
            >
              <span class="zg-trendchart__hour">{{ v.hour }}</span>
              <div class="zg-trendchart__track">
                <div
                  class="zg-trendchart__fill"
                  :style="{ width: v.percent + '%' }"
                ></div>
              </div>
              <span class="zg-trendchart__val">{{ v.kwh }}kWh</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 告警类别分布饼图 -->
      <div class="zg-chartdeck__panel">
        <header class="zg-chartdeck__head">
          <h3 class="zg-chartdeck__title">告警类别分布</h3>
          <span class="zg-chartdeck__aside">最近 24h</span>
        </header>
        <div class="zg-chartdeck__body">
          <div class="zg-piechart">
            <div class="zg-piechart__donut" :style="donutStyle">
              <div class="zg-piechart__core">
                <span class="zg-piechart__coreval">{{ activeAlertFeed.length }}</span>
                <span class="zg-piechart__corelbl">告警总数</span>
              </div>
            </div>
            <ul class="zg-piechart__legend">
              <li v-for="(slice, idx) in alertSlices" :key="idx">
                <i class="zg-piechart__dot" :style="{ background: slice.color }"></i>
                <span class="zg-piechart__tag">{{ slice.tag }}</span>
                <span class="zg-piechart__pct">{{ slice.pct }}%</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 处方投递成功率折线图 -->
      <div class="zg-chartdeck__panel">
        <header class="zg-chartdeck__head">
          <h3 class="zg-chartdeck__title">处方投递成功率</h3>
          <span class="zg-chartdeck__aside">近 7 日</span>
        </header>
        <div class="zg-chartdeck__body">
          <div class="zg-linechart">
            <div class="zg-linechart__axis">
              <div v-for="n in 5" :key="n" class="zg-linechart__grid"></div>
            </div>
            <div class="zg-linechart__plot">
              <svg class="zg-linechart__svg" viewBox="0 0 100 40" preserveAspectRatio="none">
                <polygon class="zg-linechart__area" :points="recipeAreaPoly" />
                <polyline class="zg-linechart__poly" :points="recipePolyline" />
              </svg>
              <div class="zg-linechart__dots">
                <div
                  v-for="(pt, idx) in recipeCurvePoints"
                  :key="idx"
                  class="zg-linechart__dot"
                  :class="pt.tone"
                  :style="{ left: pt.x + '%', bottom: pt.y + '%' }"
                ></div>
              </div>
            </div>
            <div class="zg-linechart__xaxis">
              <span v-for="(pt, idx) in recipeCurvePoints" :key="idx">{{ pt.at }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 在网拓扑区段概览（保留原数据与可视化） -->
      <div class="zg-chartdeck__panel">
        <header class="zg-chartdeck__head">
          <h3 class="zg-chartdeck__title">在网拓扑区段</h3>
          <span class="zg-chartdeck__aside">{{ topologyClusters.length }} 个区段</span>
        </header>
        <div class="zg-chartdeck__body">
          <div class="zg-topoclusters">
            <div
              v-for="cluster in topologyClusters"
              :key="cluster.id"
              class="zg-topoclusters__tile zg-topoclusters__tile--clickable"
              :class="`zg-topoclusters__tile--${cluster.tone}`"
              @click="goToTopology(cluster)"
            >
              <div class="zg-topoclusters__name">{{ cluster.name }}</div>
              <div class="zg-topoclusters__count">
                <span class="zg-topoclusters__online">{{ cluster.online }}</span>
                <span class="zg-topoclusters__divider">/</span>
                <span class="zg-topoclusters__total">{{ cluster.total }}</span>
              </div>
              <div class="zg-topoclusters__bar">
                <div
                  class="zg-topoclusters__fill"
                  :style="{ width: cluster.percent + '%' }"
                ></div>
              </div>
              <div class="zg-topoclusters__hint">{{ cluster.percent }}% 在网</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部数据区 -->
    <div class="zg-databand">
      <!-- 活跃告警列表 -->
      <div class="zg-databand__panel">
        <header class="zg-databand__head">
          <h3 class="zg-databand__title">活跃告警列表</h3>
          <span class="zg-databand__aside">
            <el-icon :size="14"><Bell /></el-icon>
            {{ activeAlertFeed.length }} 起待处置
          </span>
        </header>
        <div class="zg-databand__body">
          <ul class="zg-alertroll">
            <li
              v-for="alert in activeAlertFeed"
              :key="alert.id"
              :class="['zg-alertroll__item', `zg-alertroll__item--${alert.severity}`, 'zg-alertroll__item--clickable']"
              @click="openAlertDetail(alert)"
            >
              <span class="zg-alertroll__dot"></span>
              <div class="zg-alertroll__main">
                <div class="zg-alertroll__line">
                  <span class="zg-alertroll__tag">{{ alert.tag }}</span>
                  <span class="zg-alertroll__time">
                    <el-icon :size="12"><Clock /></el-icon>
                    {{ alert.at }}
                  </span>
                </div>
                <p class="zg-alertroll__msg">{{ alert.message }}</p>
              </div>
              <span class="zg-alertroll__node">{{ alert.nodeSn }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- 最近处方投递记录 -->
      <div class="zg-databand__panel">
        <header class="zg-databand__head">
          <h3 class="zg-databand__title zg-databand__title--clickable" @click="goToRecipeLog">
            最近处方投递记录
            <el-icon :size="14" class="zg-databand__arrow"><ArrowRight /></el-icon>
          </h3>
          <span class="zg-databand__aside">
            <el-icon :size="14"><Calendar /></el-icon>
            近 24h
          </span>
        </header>
        <div class="zg-databand__body">
          <ol class="zg-reciperoll">
            <li
              v-for="(step, idx) in recipeDeliveryLog"
              :key="idx"
              class="zg-reciperoll__step"
            >
              <span class="zg-reciperoll__node" :class="step.tone"></span>
              <div class="zg-reciperoll__body">
                <div class="zg-reciperoll__head">
                  <span class="zg-reciperoll__title">{{ step.title }}</span>
                  <span class="zg-reciperoll__chrono">{{ step.at }}</span>
                </div>
                <p class="zg-reciperoll__msg">{{ step.detail }}</p>
                <div class="zg-reciperoll__meta">
                  <span>触发：{{ step.trigger }}</span>
                  <span>覆盖：{{ step.coverage }} 节点</span>
                </div>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </div>

    <!-- 详情抽屉 -->
    <el-drawer
      v-model="drawerOpen"
      :title="drawerTitle"
      direction="rtl"
      size="480px"
    >
      <div v-if="drawerContent" class="zg-detail-drawer">
        <div
          v-for="(row, idx) in drawerContent.rows"
          :key="idx"
          class="zg-detail-drawer__row"
        >
          <span class="zg-detail-drawer__label">{{ row.label }}</span>
          <span class="zg-detail-drawer__value">{{ row.value }}</span>
        </div>
        <div v-if="drawerContent.type === 'alert'" class="zg-detail-drawer__actions">
          <el-button type="primary" size="small">派发工单</el-button>
          <el-button size="small">标记已读</el-button>
          <el-button size="small" plain>关闭</el-button>
        </div>
        <div v-if="drawerContent.type === 'kpi'" class="zg-detail-drawer__actions">
          <el-button type="primary" size="small">查看趋势</el-button>
          <el-button size="small" plain>导出报表</el-button>
        </div>
      </div>
    </el-drawer>
  </section>
</template>

<script setup>
/**
 * 智光云枢 · 灯网态势 · 态势看板
 * 业务域：lampNet
 * 功能：实时呈现城市照明在网通量、能耗趋势、告警分布与处方投递等核心态势
 * @module lampNet/LampNetDashboard
 * @author 智光云枢研发团队
 * @version 2.0.0
 */
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Aim,
  Lightning,
  Bell,
  Top,
  Bottom,
  Warning,
  Calendar,
  Clock,
  ArrowRight
} from '@element-plus/icons-vue'

const router = useRouter()

// ---- 详情抽屉 ----
const drawerOpen = ref(false)
const drawerTitle = ref('')
const drawerContent = ref(null)

/**
 * 打开KPI详情抽屉
 */
function openKpiDetail (kpi) {
  drawerTitle.value = `${kpi.caption} · 指标详情`
  drawerContent.value = {
    type: 'kpi',
    rows: [
      { label: '指标名称', value: kpi.caption },
      { label: '当前数值', value: `${kpi.metric} ${kpi.unit}` },
      { label: '变化趋势', value: kpi.deltaText },
      { label: '统计口径', value: kpi.hint },
      { label: '采集时间', value: liveChrono.value }
    ]
  }
  drawerOpen.value = true
}

/**
 * 打开告警详情抽屉
 */
function openAlertDetail (alert) {
  drawerTitle.value = `告警详情 · ${alert.tag}`
  drawerContent.value = {
    type: 'alert',
    rows: [
      { label: '告警编号', value: alert.id },
      { label: '告警类型', value: alert.tag },
      { label: '告警时间', value: alert.at },
      { label: '严重等级', value: severityLabel(alert.severity) },
      { label: '关联节点', value: alert.nodeSn },
      { label: '告警描述', value: alert.message },
      { label: '处置状态', value: '待处置' }
    ]
  }
  drawerOpen.value = true
}

/**
 * 严重等级标签
 */
function severityLabel (severity) {
  const map = { critical: '紧急', warn: '警告', info: '提示' }
  return map[severity] || '未知'
}

/**
 * 跳转到集群拓扑页面
 */
function goToTopology (cluster) {
  ElMessage.success(`正在跳转至「${cluster.name}」拓扑视图...`)
  router.push({
    path: '/lampNet/cluster-topology',
    query: { cluster: cluster.id, name: cluster.name }
  })
}

/**
 * 跳转到处方投递记录页面
 */
function goToRecipeLog () {
  router.push('/lampNet/recipe-archive')
}

// ---- 实时时钟 ----
const liveChrono = ref(formatChrono())
let chronoTicker = setInterval(() => { liveChrono.value = formatChrono() }, 60_000)

/**
 * 格式化当前时间为展示字符串
 * @returns {string} 格式化后的日期时间，如 2024-07-03 14:30
 */
function formatChrono () {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// ---- 态势脉冲条 ----
const pulseStrips = ref([
  { id: 1, label: '在网节点', value: '2,184', delta: '+12', tone: 'up' },
  { id: 2, label: '今日能耗', value: '8,652', delta: '-3.2%', tone: 'down' },
  { id: 3, label: '待处置告警', value: '7', delta: '+2', tone: 'warn' },
  { id: 4, label: '健康度', value: '98.6%', delta: '+0.4%', tone: 'up' }
])

// ---- 四象限 KPI ----
const kpiCells = ref([
  {
    id: 'kpi-online',
    caption: '在网通量率',
    metric: '98.6',
    unit: '%',
    deltaText: '同比 +1.2%',
    deltaTone: 'up',
    tone: 'primary',
    glyph: Aim,
    hint: '主干道 / 次干道 / 支路'
  },
  {
    id: 'kpi-power',
    caption: '今日累计能耗',
    metric: '8,652',
    unit: 'kWh',
    deltaText: '环比 -3.2%',
    deltaTone: 'down',
    tone: 'aux',
    glyph: Lightning,
    hint: '昨日同期 8,938 kWh'
  },
  {
    id: 'kpi-alarm',
    caption: '未恢复告警',
    metric: '7',
    unit: '起',
    deltaText: '2 起为紧急',
    deltaTone: 'warn',
    tone: 'alert',
    glyph: Bell,
    hint: '主要来源：能耗越限 / 链路掉线'
  },
  {
    id: 'kpi-dispatch',
    caption: '处方投递成功率',
    metric: '99.2',
    unit: '%',
    deltaText: '近 7 日均值',
    deltaTone: 'flat',
    tone: 'success',
    glyph: Calendar,
    hint: '处方投递总数 1,283 次'
  }
])

// ---- 能耗趋势图 ----
const trendChips = [
  { id: 'today', label: '今日' },
  { id: 'week', label: '近 7 日' },
  { id: 'month', label: '本月' }
]
const trendScope = ref('today')

// 三组不同的趋势数据
const trendDataset = {
  today: [
    { hour: '00', kwh: 412, percent: 35 },
    { hour: '02', kwh: 386, percent: 32 },
    { hour: '04', kwh: 358, percent: 30 },
    { hour: '06', kwh: 624, percent: 52 },
    { hour: '08', kwh: 786, percent: 65 },
    { hour: '10', kwh: 528, percent: 44 },
    { hour: '12', kwh: 462, percent: 38 },
    { hour: '14', kwh: 498, percent: 41 },
    { hour: '16', kwh: 712, percent: 59 },
    { hour: '18', kwh: 956, percent: 78 },
    { hour: '20', kwh: 1102, percent: 92 },
    { hour: '22', kwh: 828, percent: 68 }
  ],
  week: [
    { hour: '周一', kwh: 8652, percent: 72 },
    { hour: '周二', kwh: 7896, percent: 66 },
    { hour: '周三', kwh: 9124, percent: 76 },
    { hour: '周四', kwh: 8432, percent: 70 },
    { hour: '周五', kwh: 9876, percent: 82 },
    { hour: '周六', kwh: 10234, percent: 85 },
    { hour: '周日', kwh: 7968, percent: 66 }
  ],
  month: [
    { hour: 'W1', kwh: 58420, percent: 68 },
    { hour: 'W2', kwh: 62180, percent: 72 },
    { hour: 'W3', kwh: 67960, percent: 79 },
    { hour: 'W4', kwh: 54320, percent: 63 }
  ]
}

const powerTrendSeries = computed(() => trendDataset[trendScope.value] || [])

// ---- 活跃告警流 ----
const activeAlertFeed = ref([
  {
    id: 1,
    tag: '能耗越限',
    at: '14:23',
    severity: 'warn',
    message: '中山路段支路能耗连续 30 分钟超阈值',
    nodeSn: 'TWR-CY-0184'
  },
  {
    id: 2,
    tag: '链路掉线',
    at: '13:48',
    severity: 'critical',
    message: '北环路 3 号链路心跳丢失，疑似链路故障',
    nodeSn: 'LOOP-N-003'
  },
  {
    id: 3,
    tag: '亮度漂移',
    at: '12:15',
    severity: 'info',
    message: '工业二路 18 杆光源亮度持续低于基线',
    nodeSn: 'LMP-IND-0072'
  },
  {
    id: 4,
    tag: '门禁告警',
    at: '10:02',
    severity: 'warn',
    message: '城南馈电柜 02 号机柜门开启超时',
    nodeSn: 'CAB-S-002'
  }
])

/**
 * 计算告警类别分布扇区
 * 基于活跃告警流按 tag 聚合计数，生成饼图扇区角度与颜色
 * @returns {Array<{tag:string, count:number, pct:number, color:string}>}
 */
const alertSlices = computed(() => {
  const groups = {}
  activeAlertFeed.value.forEach(a => {
    groups[a.tag] = (groups[a.tag] || 0) + 1
  })
  const total = activeAlertFeed.value.length || 1
  const palette = [
    'var(--zg-brand-primary)',
    'var(--zg-warning)',
    'var(--zg-danger)',
    'var(--zg-info)'
  ]
  let acc = 0
  return Object.entries(groups).map(([tag, count], idx) => {
    const pct = Math.round((count / total) * 100)
    const start = acc
    acc += pct
    return {
      tag,
      count,
      pct,
      color: palette[idx % palette.length],
      start,
      end: acc
    }
  })
})

/**
 * 告警环形图背景样式
 * 使用 conic-gradient 按扇区比例堆叠
 * @returns {Object} style 对象
 */
const donutStyle = computed(() => {
  const slices = alertSlices.value
  if (!slices.length) return {}
  const stops = slices.map(s => `${s.color} ${s.start}% ${s.end}%`).join(', ')
  return { background: `conic-gradient(${stops})` }
})

// ---- 处方投递日志 ----
const recipeDeliveryLog = ref([
  {
    title: '晨曦唤醒 · 主干道',
    at: '05:30',
    tone: 'success',
    detail: '处方 PRST-CN-001 投递成功，激活 248 节点，色温 3000K。',
    trigger: '时间编排',
    coverage: 248
  },
  {
    title: '傍晚柔光 · 次干道',
    at: '18:45',
    tone: 'success',
    detail: '处方 PRST-CN-014 投递成功，激活 162 节点，色温 2700K。',
    trigger: '照度探针联动',
    coverage: 162
  },
  {
    title: '深夜节能 · 全域',
    at: '23:00',
    tone: 'pending',
    detail: '处方 PRST-CN-019 排队中，等待运维窗口',
    trigger: '定时',
    coverage: 0
  }
])

/**
 * 将处方投递日志映射为折线图坐标点
 * 以覆盖节点数为纵轴，时间序列为横轴，归一化到百分比
 * @returns {Array<{x:number, y:number, at:string, tone:string}>}
 */
const recipeCurvePoints = computed(() => {
  const pts = recipeDeliveryLog.value.map((r, i, arr) => ({
    x: arr.length > 1 ? (i / (arr.length - 1)) * 100 : 50,
    y: Math.min((r.coverage / 300) * 100, 100),
    at: r.at,
    tone: r.tone
  }))
  return pts
})

/**
 * 生成 SVG 折线点串
 * @returns {string}
 */
const recipePolyline = computed(() => {
  return recipeCurvePoints.value
    .map(p => `${p.x},${40 - (p.y / 100) * 40}`)
    .join(' ')
})

/**
 * 生成 SVG 面积图闭合多边形点串
 * @returns {string}
 */
const recipeAreaPoly = computed(() => {
  const pts = recipeCurvePoints.value
  if (!pts.length) return ''
  const body = pts.map(p => `${p.x},${40 - (p.y / 100) * 40}`).join(' ')
  return `${pts[0].x},40 ${body} ${pts[pts.length - 1].x},40`
})

// ---- 在网拓扑区段簇 ----
const topologyClusters = ref([
  { id: 1, name: '城东片区', online: 412, total: 420, percent: 98, tone: 'primary' },
  { id: 2, name: '城西片区', online: 386, total: 402, percent: 96, tone: 'primary' },
  { id: 3, name: '城南片区', online: 348, total: 358, percent: 97, tone: 'aux' },
  { id: 4, name: '城北片区', online: 402, total: 412, percent: 98, tone: 'primary' },
  { id: 5, name: '中央商务', online: 218, total: 220, percent: 99, tone: 'success' },
  { id: 6, name: '工业园区', online: 412, total: 432, percent: 95, tone: 'aux' }
])
</script>

<style scoped lang="scss">
.zg-pulseboard {
  padding: 24px;
  background: var(--zg-gradient-surface);
  min-height: 100%;

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 18px;
    border-bottom: 1px solid var(--zg-line-soft);
  }

  &__headline {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  &__sigil {
    width: 44px;
    height: 44px;
    border-radius: var(--zg-radius-md);
    background: var(--zg-gradient-primary);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--zg-shadow-btn);
  }

  &__copy {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__title {
    font-size: 20px;
    font-weight: 600;
    color: var(--zg-ink-primary);
    margin: 0;
  }

  &__sub {
    font-size: 13px;
    color: var(--zg-ink-tertiary);
    margin: 0;
  }
}

.zg-pulsebar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 20px;

  &__cell {
    background: var(--zg-surface-card);
    border: 1px solid var(--zg-line-soft);
    border-radius: var(--zg-radius-lg);
    padding: 16px 18px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    box-shadow: var(--zg-shadow-card);
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      width: 3px;
      height: 100%;
      background: var(--zg-brand-primary);
    }

    &--up::before { background: var(--zg-success); }
    &--down::before { background: var(--zg-warning); }
    &--warn::before { background: var(--zg-danger); }
  }

  &__lbl {
    font-size: 12px;
    color: var(--zg-ink-tertiary);
  }

  &__val {
    font-size: 26px;
    font-weight: 700;
    color: var(--zg-ink-primary);
    line-height: 1;
  }

  &__delta {
    font-size: 12px;
    font-weight: 500;

    &.up { color: var(--zg-success); }
    &.down { color: var(--zg-warning); }
    &.warn { color: var(--zg-danger); }
  }
}

.zg-kpiquad {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;

  &__cell {
    background: var(--zg-surface-card);
    border-radius: var(--zg-radius-lg);
    padding: 18px 20px;
    box-shadow: var(--zg-shadow-card);
    border: 1px solid var(--zg-line-brand);
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: var(--zg-gradient-primary);
    }

    &--aux::before { background: var(--zg-gradient-warning); }
    &--alert::before { background: var(--zg-gradient-danger); }
    &--success::before { background: var(--zg-gradient-success); }
  }

  &__head {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__glyph {
    width: 30px;
    height: 30px;
    border-radius: var(--zg-radius-sm);
    background: var(--zg-brand-tint-50);
    color: var(--zg-brand-primary);
    display: grid;
    place-items: center;
  }

  &__caption {
    font-size: 13px;
    color: var(--zg-ink-secondary);
  }

  &__metric {
    margin: 10px 0 6px;
    display: flex;
    align-items: baseline;
    gap: 6px;
  }

  &__number {
    font-size: 28px;
    font-weight: 700;
    color: var(--zg-ink-primary);
  }

  &__unit {
    font-size: 12px;
    color: var(--zg-ink-tertiary);
  }

  &__foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__delta {
    font-size: 12px;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 2px;

    &.up { color: var(--zg-success); }
    &.down { color: var(--zg-warning); }
    &.warn { color: var(--zg-danger); }
    &.flat { color: var(--zg-ink-placeholder); }
  }

  &__hint {
    font-size: 11px;
    color: var(--zg-ink-placeholder);
  }
}

.zg-chartdeck {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 20px;

  &__panel {
    background: var(--zg-surface-card);
    border-radius: var(--zg-radius-lg);
    border: 1px solid var(--zg-line-brand);
    box-shadow: var(--zg-shadow-card);
  }

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
    border-bottom: 1px solid var(--zg-line-soft);
  }

  &__title {
    font-size: 14px;
    font-weight: 600;
    color: var(--zg-ink-primary);
    margin: 0;
  }

  &__aside {
    font-size: 12px;
    color: var(--zg-ink-placeholder);
  }

  &__tabs {
    display: flex;
    gap: 4px;
  }

  &__body {
    padding: 16px 20px;
  }
}

.zg-chip {
  padding: 4px 12px;
  font-size: 12px;
  border-radius: var(--zg-radius-sm);
  border: 1px solid var(--zg-brand-tint-100);
  background: var(--zg-surface-card);
  color: var(--zg-brand-primary);
  cursor: pointer;
  transition: all var(--zg-transition-fast);

  &:hover {
    background: var(--zg-brand-tint-50);
  }

  &--on {
    background: var(--zg-brand-primary);
    color: #fff;
    border-color: var(--zg-brand-primary);
  }
}

.zg-trendchart {
  display: flex;
  flex-direction: column;
  gap: 8px;

  &__bar {
    display: grid;
    grid-template-columns: 36px 1fr 60px;
    align-items: center;
    gap: 10px;
  }

  &__hour {
    font-size: 11px;
    color: var(--zg-ink-placeholder);
  }

  &__track {
    height: 8px;
    background: var(--zg-surface-muted);
    border-radius: 4px;
    overflow: hidden;
  }

  &__fill {
    height: 100%;
    background: var(--zg-gradient-primary);
    border-radius: 4px;
    transition: width var(--zg-transition-normal);
  }

  &__val {
    font-size: 12px;
    color: var(--zg-ink-tertiary);
    text-align: right;
  }
}

.zg-piechart {
  display: flex;
  align-items: center;
  gap: 24px;

  &__donut {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    position: relative;
    flex-shrink: 0;
  }

  &__core {
    position: absolute;
    inset: 28px;
    border-radius: 50%;
    background: var(--zg-surface-card);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.04);
  }

  &__coreval {
    font-size: 22px;
    font-weight: 700;
    color: var(--zg-ink-primary);
    line-height: 1;
  }

  &__corelbl {
    font-size: 11px;
    color: var(--zg-ink-placeholder);
    margin-top: 2px;
  }

  &__legend {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;

    li {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
    }
  }

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  &__tag {
    color: var(--zg-ink-secondary);
    flex: 1;
  }

  &__pct {
    color: var(--zg-ink-primary);
    font-weight: 600;
  }
}

.zg-linechart {
  position: relative;
  height: 160px;

  &__axis {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    pointer-events: none;
  }

  &__grid {
    height: 1px;
    background: var(--zg-line-soft);
  }

  &__plot {
    position: absolute;
    inset: 0 0 20px 0;
  }

  &__svg {
    width: 100%;
    height: 100%;
    overflow: visible;
  }

  &__poly {
    fill: none;
    stroke: var(--zg-brand-primary);
    stroke-width: 2;
  }

  &__area {
    fill: var(--zg-brand-tint-50);
    opacity: 0.6;
  }

  &__dots {
    position: absolute;
    inset: 0;
  }

  &__dot {
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--zg-brand-primary);
    border: 2px solid var(--zg-surface-card);
    transform: translate(-50%, 50%);
    box-shadow: 0 0 0 2px var(--zg-brand-tint-200);

    &.success { background: var(--zg-success); }
    &.pending { background: var(--zg-warning); }
    &.warn { background: var(--zg-danger); }
  }

  &__xaxis {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: var(--zg-ink-placeholder);
  }
}

.zg-topoclusters {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;

  &__tile {
    padding: 12px 14px;
    border-radius: var(--zg-radius-md);
    background: var(--zg-brand-tint-50);
    border: 1px solid var(--zg-brand-tint-100);

    &--aux {
      background: var(--zg-warning-soft);
      border-color: var(--zg-warning-soft);
    }

    &--success {
      background: var(--zg-success-soft);
      border-color: var(--zg-success-soft);
    }
  }

  &__name {
    font-size: 13px;
    color: var(--zg-ink-primary);
    font-weight: 500;
  }

  &__count {
    display: flex;
    align-items: baseline;
    gap: 2px;
    margin: 6px 0;
  }

  &__online {
    font-size: 18px;
    font-weight: 700;
    color: var(--zg-brand-primary);
  }

  &__divider {
    color: var(--zg-ink-placeholder);
  }

  &__total {
    font-size: 12px;
    color: var(--zg-ink-tertiary);
  }

  &__bar {
    height: 4px;
    background: var(--zg-brand-tint-100);
    border-radius: 2px;
    overflow: hidden;
  }

  &__fill {
    height: 100%;
    background: var(--zg-gradient-primary);
  }

  &__hint {
    font-size: 11px;
    color: var(--zg-ink-tertiary);
    margin-top: 4px;
  }
}

.zg-databand {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  &__panel {
    background: var(--zg-surface-card);
    border-radius: var(--zg-radius-lg);
    border: 1px solid var(--zg-line-brand);
    box-shadow: var(--zg-shadow-card);
  }

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
    border-bottom: 1px solid var(--zg-line-soft);
  }

  &__title {
    font-size: 14px;
    font-weight: 600;
    color: var(--zg-ink-primary);
    margin: 0;
  }

  &__aside {
    font-size: 12px;
    color: var(--zg-ink-placeholder);
    display: flex;
    align-items: center;
    gap: 4px;
  }

  &__body {
    padding: 16px 20px;
  }
}

.zg-alertroll {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;

  &__item {
    display: grid;
    grid-template-columns: 8px 1fr auto;
    gap: 12px;
    padding: 10px 12px;
    border-radius: var(--zg-radius-md);
    background: var(--zg-surface-muted);
    border-left: 3px solid var(--zg-line-strong);
    align-items: center;

    &--warn { border-left-color: var(--zg-warning); }
    &--critical { border-left-color: var(--zg-danger); }
    &--info { border-left-color: var(--zg-brand-primary); }
  }

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--zg-line-strong);
  }

  &__line {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__tag {
    font-size: 11px;
    padding: 1px 8px;
    border-radius: var(--zg-radius-pill);
    background: var(--zg-brand-tint-50);
    color: var(--zg-brand-primary);
  }

  &__time {
    font-size: 11px;
    color: var(--zg-ink-placeholder);
    display: flex;
    align-items: center;
    gap: 2px;
  }

  &__msg {
    font-size: 13px;
    color: var(--zg-ink-primary);
    margin: 4px 0 0;
  }

  &__node {
    font-size: 11px;
    color: var(--zg-brand-primary);
    font-family: var(--zg-font-mono);
  }
}

.zg-reciperoll {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
  position: relative;

  &__step {
    display: grid;
    grid-template-columns: 14px 1fr;
    gap: 12px;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      left: 6px;
      top: 14px;
      bottom: -14px;
      width: 2px;
      background: var(--zg-line-brand);
    }

    &:last-child::before {
      display: none;
    }
  }

  &__node {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--zg-line-strong);
    margin-top: 4px;
    box-shadow: 0 0 0 3px var(--zg-brand-tint-50);

    &.success { background: var(--zg-success); }
    &.pending { background: var(--zg-warning); }
    &.warn { background: var(--zg-danger); }
  }

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__title {
    font-size: 13px;
    font-weight: 600;
    color: var(--zg-ink-primary);
  }

  &__chrono {
    font-size: 11px;
    color: var(--zg-ink-placeholder);
    font-family: var(--zg-font-mono);
  }

  &__msg {
    font-size: 12px;
    color: var(--zg-ink-tertiary);
    margin: 4px 0 6px;
    line-height: 1.6;
  }

  &__meta {
    font-size: 11px;
    color: var(--zg-ink-tertiary);
    display: flex;
    gap: 12px;
  }
}

/* === 交互效果样式 === */

// KPI卡片可点击
.zg-kpiquad__cell--clickable {
  cursor: pointer;
  transition: transform var(--zg-transition-fast), box-shadow var(--zg-transition-fast);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  &:active {
    transform: translateY(-1px);
  }
}

// 告警列表项可点击
.zg-alertroll__item--clickable {
  cursor: pointer;
  transition: background var(--zg-transition-fast), border-color var(--zg-transition-fast);

  &:hover {
    background: var(--zg-brand-tint-50);

    &.zg-alertroll__item--warn { border-left-color: var(--zg-warning); }
    &.zg-alertroll__item--critical { border-left-color: var(--zg-danger); }
  }
}

// 拓扑区段可点击
.zg-topoclusters__tile--clickable {
  cursor: pointer;
  transition: transform var(--zg-transition-fast), box-shadow var(--zg-transition-fast);

  &:hover {
    transform: scale(1.03);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: scale(1.01);
  }
}

// 处方投递标题可点击
.zg-databand__title--clickable {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: color var(--zg-transition-fast);

  &:hover {
    color: var(--zg-brand-primary);

    .zg-databand__arrow {
      transform: translateX(3px);
    }
  }
}

.zg-databand__arrow {
  transition: transform var(--zg-transition-fast);
}

// 趋势图标签切换动画
.zg-chip {
  &:active {
    transform: scale(0.96);
  }
}

// 详情抽屉样式
.zg-detail-drawer {
  padding: 0 4px;

  &__row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 12px 0;
    border-bottom: 1px solid var(--zg-line-soft);
    gap: 16px;
  }

  &__label {
    font-size: 13px;
    color: var(--zg-ink-tertiary);
    flex-shrink: 0;
    min-width: 80px;
  }

  &__value {
    font-size: 13px;
    color: var(--zg-ink-primary);
    font-weight: 500;
    text-align: right;
    flex: 1;
    word-break: break-all;
  }

  &__actions {
    display: flex;
    gap: 8px;
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid var(--zg-line-soft);
  }
}
</style>
