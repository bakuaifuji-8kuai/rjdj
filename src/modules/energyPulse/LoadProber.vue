<!--
  智光云枢 · 能耗监测 · 负载探测
  业务域：energyPulse
  功能：配电网络负载探测台账与探测结果检视
        支持卡片/列表双视图、抽屉式探测详情与负载曲线回放
-->
<template>
  <section class="zg-prober">
    <!-- 页面头部：徽标 + 标题 + 探测入口 -->
    <header class="zg-prober__head">
      <div class="zg-prober__headline">
        <div class="zg-prober__sigil">
          <el-icon :size="22"><Odometer /></el-icon>
        </div>
        <div class="zg-prober__copy">
          <h1 class="zg-prober__title">负载探测</h1>
          <p class="zg-prober__sub">
            配电网络负载态势感知 · 已探测 {{ probedCount }} 处 ·
            待探测 {{ pendingCount }} 处 · 探测中 {{ probingCount }} 处
          </p>
        </div>
      </div>
      <div class="zg-prober__cta">
        <el-button type="primary" @click="onProbeLoad()">
          <el-icon><Histogram /></el-icon>
          <span>发起探测</span>
        </el-button>
      </div>
    </header>

    <!-- 概览指标卡 -->
    <div class="zg-metrics">
      <div class="zg-metrics__cell">
        <span class="zg-metrics__num">{{ proberCtl.totalRows }}</span>
        <span class="zg-metrics__lbl">探测点总数</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--ok">
        <span class="zg-metrics__num">{{ probedCount }}</span>
        <span class="zg-metrics__lbl">已探测</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--warn">
        <span class="zg-metrics__num">{{ pendingCount }}</span>
        <span class="zg-metrics__lbl">待探测</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--info">
        <span class="zg-metrics__num">{{ avgLoadRate }}</span>
        <span class="zg-metrics__lbl">平均负载率</span>
      </div>
    </div>

    <!-- 过滤工具栏 -->
    <div class="zg-filterband">
      <div class="zg-filterband__density">
        <el-radio-group v-model="densityMode" size="default">
          <el-radio-button value="card">
            <el-icon><Grid /></el-icon>
            <span>卡片视图</span>
          </el-radio-button>
          <el-radio-button value="list">
            <el-icon><List /></el-icon>
            <span>列表视图</span>
          </el-radio-button>
        </el-radio-group>
      </div>
      <div class="zg-filterband__fields">
        <el-select
          v-model="proberCtl.statusBuckets"
          placeholder="探测状态"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="已探测" value="已探测" />
          <el-option label="待探测" value="待探测" />
          <el-option label="探测中" value="探测中" />
        </el-select>
        <el-select
          v-model="proberCtl.typeBucket"
          placeholder="所属区域"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="长沙-岳麓区" value="长沙-岳麓区" />
          <el-option label="长沙-天心区" value="长沙-天心区" />
          <el-option label="长沙-开福区" value="长沙-开福区" />
        </el-select>
        <el-input
          v-model="proberCtl.filterLexicon"
          placeholder="检索探测点名称/编号"
          clearable
          class="zg-filterband__search"
          @keyup.enter="proberCtl.onFilterApply()"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="proberCtl.onFilterApply()">
          <el-icon><Search /></el-icon>
          <span>检索</span>
        </el-button>
        <el-button @click="proberCtl.onFilterReset()">
          <el-icon><RefreshLeft /></el-icon>
          <span>重置</span>
        </el-button>
      </div>
    </div>

    <!-- 卡片视图 -->
    <div v-if="densityMode === 'card'" class="zg-cardgrid">
      <article
        v-for="probe in proberCtl.pagedRows"
        :key="probe.id"
        class="zg-probercard"
        :class="probe.status === '已探测' ? 'probed' : probe.status === '探测中' ? 'probing' : 'pending'"
        @click="onInspectProbeResult(probe)"
      >
        <div class="zg-probercard__head">
          <div class="zg-probercard__glyph">
            <el-icon :size="24"><Odometer /></el-icon>
          </div>
          <span
            class="zg-status"
            :class="probe.status === '已探测' ? 'online' : probe.status === '探测中' ? 'idle' : 'offline'"
          >
            <i class="dot"></i>{{ probe.status }}
          </span>
        </div>
        <div class="zg-probercard__body">
          <h3 class="zg-probercard__name">{{ probe.name }}</h3>
          <p class="zg-probercard__area">{{ probe.area }} · {{ probe.type }}</p>
          <div class="zg-probercard__stats">
            <span class="zg-probercard__stat">
              <em>{{ probe.voltage }}</em> V
            </span>
            <span class="zg-probercard__stat">
              <em>{{ probe.current }}</em> A
            </span>
            <span class="zg-probercard__stat">
              <em>{{ probe.loadRate }}</em> %
            </span>
          </div>
        </div>
        <div class="zg-probercard__foot">
          <span class="zg-probercard__time">{{ probe.probeTime || '未探测' }}</span>
          <div class="zg-probercard__actions">
            <el-button
              v-if="probe.status !== '探测中'"
              link
              type="primary"
              size="small"
              @click.stop="onProbeLoad(probe)"
            >
              {{ probe.status === '已探测' ? '复测' : '探测' }}
            </el-button>
            <el-button link type="danger" size="small" @click.stop="onRetireProbe(probe)">移除</el-button>
          </div>
        </div>
      </article>
    </div>

    <!-- 列表视图 -->
    <div v-else class="zg-tablewrap">
      <el-table :data="proberCtl.pagedRows" stripe class="zg-datatable">
        <el-table-column prop="no" label="序号" width="60" align="center" />
        <el-table-column prop="area" label="所属区域" width="130" />
        <el-table-column prop="name" label="探测点名称" min-width="150" />
        <el-table-column prop="type" label="探测类型" width="100" align="center" />
        <el-table-column label="探测状态" width="100" align="center">
          <template #default="{ row }">
            <span
              class="zg-status"
              :class="row.status === '已探测' ? 'online' : row.status === '探测中' ? 'idle' : 'offline'"
            >
              <i class="dot"></i>{{ row.status }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="voltage" label="电压(V)" width="100" align="center" />
        <el-table-column prop="current" label="电流(A)" width="100" align="center" />
        <el-table-column prop="power" label="功率(kW)" width="100" align="center" />
        <el-table-column prop="loadRate" label="负载率(%)" width="100" align="center" />
        <el-table-column prop="probeTime" label="探测时间" width="130" />
        <el-table-column label="处置" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="onInspectProbeResult(row)">详情</el-button>
            <el-button
              v-if="row.status !== '探测中'"
              type="warning"
              size="small"
              @click="onProbeLoad(row)"
            >
              {{ row.status === '已探测' ? '复测' : '探测' }}
            </el-button>
            <el-button type="danger" size="small" @click="onRetireProbe(row)">移除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页条 -->
    <div class="zg-pagerbar">
      <el-pagination
        v-model:current-page="proberCtl.pagingCursor"
        v-model:page-size="proberCtl.pageSpan"
        :total="proberCtl.totalRows"
        :page-sizes="[10, 15, 20, 50, 100]"
        layout="prev, pager, next, jumper, ->, sizes, total"
        background
      />
    </div>

    <!-- 探测结果抽屉 -->
    <el-drawer
      v-model="proberInspector.drawerOpen"
      :title="'探测详情 · ' + (focusedProber?.name || '')"
      direction="rtl"
      size="680px"
    >
      <div v-if="focusedProber" class="zg-inspector">
        <div class="zg-inspector__head">
          <div class="zg-inspector__glyph">
            <el-icon :size="36"><Odometer /></el-icon>
          </div>
          <div class="zg-inspector__meta">
            <h2 class="zg-inspector__name">{{ focusedProber.name }}</h2>
            <p class="zg-inspector__type">{{ focusedProber.area }} · {{ focusedProber.type }}</p>
            <span
              class="zg-status"
              :class="focusedProber.status === '已探测' ? 'online' : focusedProber.status === '探测中' ? 'idle' : 'offline'"
            >
              <i class="dot"></i>{{ focusedProber.status }}
            </span>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">基本档案</h4>
          <div class="zg-inspector__grid">
            <div class="zg-inspector__cell">
              <span class="lbl">探测类型</span>
              <span class="val">{{ focusedProber.type }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">探测时间</span>
              <span class="val">{{ focusedProber.probeTime || '-' }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">额定功率</span>
              <span class="val">{{ focusedProber.ratedPower }} kW</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">备注</span>
              <span class="val">{{ focusedProber.remark || '-' }}</span>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">实时遥测</h4>
          <div class="zg-datagrid">
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">电压</div>
              <div class="zg-datacard__val">{{ focusedProber.voltage }}<em>V</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">电流</div>
              <div class="zg-datacard__val">{{ focusedProber.current }}<em>A</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">功率</div>
              <div class="zg-datacard__val">{{ focusedProber.power }}<em>kW</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">负载率</div>
              <div class="zg-datacard__val">{{ focusedProber.loadRate }}<em>%</em></div>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">负载曲线</h4>
          <div class="zg-curvebox">
            <canvas ref="curveCanvas"></canvas>
          </div>
          <div class="zg-curvelgnd">
            <span class="zg-curvelgnd__item">
              <i class="zg-curvelgnd__dot" style="background: var(--zg-brand-primary)"></i>
              功率(kW)
            </span>
            <span class="zg-curvelgnd__item">
              <i class="zg-curvelgnd__dot" style="background: var(--zg-success)"></i>
              负载率(%)
            </span>
          </div>
        </div>

        <div class="zg-inspector__actions">
          <el-button size="large" @click="proberInspector.closeInspector()">关闭</el-button>
          <el-button
            v-if="focusedProber.status !== '探测中'"
            type="warning"
            size="large"
            @click="onProbeLoad(focusedProber)"
          >
            {{ focusedProber.status === '已探测' ? '复测负载' : '执行探测' }}
          </el-button>
        </div>
      </div>
    </el-drawer>
  </section>
</template>

<script setup>
/**
 * 智光云枢 · 能耗监测 · 负载探测
 * 业务域：energyPulse
 * 功能：配电网络负载探测台账与探测结果检视
 * @module energyPulse/LoadProber
 * @author 智光云枢研发团队
 */
import { ref, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Odometer,
  Search,
  Grid,
  List,
  RefreshLeft,
  Histogram
} from '@element-plus/icons-vue'
import { usePresetTable } from '@/shared/composables/usePresetTable'
import { useDrawerInspector } from '@/shared/composables/useDrawerInspector'

// ---- 视图密度切换 ----
const densityMode = ref('card')

// ---- 曲线画布引用 ----
const curveCanvas = ref(null)

// ---- 初始 mock 数据池 ----
const initialProbers = [
  {
    id: 1,
    no: 1,
    area: '长沙-岳麓区',
    name: '先导路1号探测点',
    type: '低压',
    status: '已探测',
    voltage: 380,
    current: 45,
    power: 29.6,
    loadRate: 72.5,
    ratedPower: 40.8,
    probeTime: '2026-07-01 14:30',
    remark: '主路负载探测',
    curves: {
      labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
      power: [12, 15, 22, 35, 30, 28, 14],
      loadRate: [30, 38, 55, 86, 74, 69, 35]
    }
  },
  {
    id: 2,
    no: 2,
    area: '长沙-岳麓区',
    name: '先导路2号探测点',
    type: '低压',
    status: '待探测',
    voltage: 0,
    current: 0,
    power: 0,
    loadRate: 0,
    ratedPower: 35.0,
    probeTime: '',
    remark: '辅路探测点',
    curves: null
  },
  {
    id: 3,
    no: 3,
    area: '长沙-天心区',
    name: '芙蓉路1号探测点',
    type: '高压',
    status: '已探测',
    voltage: 10000,
    current: 120,
    power: 2078.4,
    loadRate: 68.2,
    ratedPower: 3045.0,
    probeTime: '2026-07-02 09:15',
    remark: '高压馈线探测',
    curves: {
      labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
      power: [1500, 1600, 2100, 2400, 2300, 2200, 1700],
      loadRate: [49, 53, 69, 79, 76, 72, 56]
    }
  },
  {
    id: 4,
    no: 4,
    area: '长沙-天心区',
    name: '芙蓉路2号探测点',
    type: '低压',
    status: '探测中',
    voltage: 380,
    current: 32,
    power: 21.0,
    loadRate: 55.3,
    ratedPower: 38.0,
    probeTime: '',
    remark: '',
    curves: null
  },
  {
    id: 5,
    no: 5,
    area: '长沙-开福区',
    name: '湘江路1号探测点',
    type: '低压',
    status: '已探测',
    voltage: 380,
    current: 58,
    power: 38.1,
    loadRate: 82.4,
    ratedPower: 46.2,
    probeTime: '2026-07-02 16:45',
    remark: '商业区负载监测',
    curves: {
      labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
      power: [18, 20, 30, 42, 38, 45, 22],
      loadRate: [39, 43, 65, 91, 82, 97, 48]
    }
  },
  {
    id: 6,
    no: 6,
    area: '长沙-开福区',
    name: '湘江路2号探测点',
    type: '高压',
    status: '待探测',
    voltage: 0,
    current: 0,
    power: 0,
    loadRate: 0,
    ratedPower: 2500.0,
    probeTime: '',
    remark: '新建探测点',
    curves: null
  },
  {
    id: 7,
    no: 7,
    area: '长沙-岳麓区',
    name: '梅溪湖路1号探测点',
    type: '低压',
    status: '已探测',
    voltage: 380,
    current: 28,
    power: 18.4,
    loadRate: 48.6,
    ratedPower: 37.8,
    probeTime: '2026-07-01 11:20',
    remark: '环湖路灯回路',
    curves: {
      labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
      power: [10, 8, 15, 25, 22, 35, 12],
      loadRate: [26, 21, 40, 66, 58, 93, 32]
    }
  },
  {
    id: 8,
    no: 8,
    area: '长沙-天心区',
    name: '书院路1号探测点',
    type: '低压',
    status: '已探测',
    voltage: 380,
    current: 52,
    power: 34.2,
    loadRate: 76.0,
    ratedPower: 45.0,
    probeTime: '2026-07-02 08:00',
    remark: '老城区改造监测',
    curves: {
      labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
      power: [15, 18, 28, 38, 35, 40, 18],
      loadRate: [33, 40, 62, 84, 78, 89, 40]
    }
  }
]

// ---- 表格数据容器（usePresetTable） ----
const proberCtl = usePresetTable(null, {
  defaultPageSpan: 15,
  initialData: initialProbers
})

// ---- 概览指标派生 ----
const probedCount = computed(
  () => proberCtl.presetPlaybook.filter(p => p.status === '已探测').length
)
const pendingCount = computed(
  () => proberCtl.presetPlaybook.filter(p => p.status === '待探测').length
)
const probingCount = computed(
  () => proberCtl.presetPlaybook.filter(p => p.status === '探测中').length
)
const avgLoadRate = computed(() => {
  const list = proberCtl.presetPlaybook.filter(p => p.loadRate > 0)
  if (!list.length) return '0.0'
  const avg = list.reduce((sum, p) => sum + p.loadRate, 0) / list.length
  return avg.toFixed(1)
})

// ---- 详情抽屉容器（useDrawerInspector） ----
const proberInspector = useDrawerInspector({ size: '680px', direction: 'rtl' })
const focusedProber = computed(() => proberInspector.focusedRecord)

/**
 * 绘制负载曲线
 * @param {HTMLCanvasElement} canvas
 * @param {Object} curves
 */
const drawLoadCurve = (canvas, curves) => {
  if (!canvas || !curves) return
  const ctx = canvas.getContext('2d')
  const width = 620
  const height = 220
  const dpr = window.devicePixelRatio || 1
  canvas.width = width * dpr
  canvas.height = height * dpr
  canvas.style.width = width + 'px'
  canvas.style.height = height + 'px'
  ctx.scale(dpr, dpr)

  const padding = { top: 20, right: 20, bottom: 30, left: 55 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom
  const labels = curves.labels
  const powerData = curves.power
  const loadData = curves.loadRate
  const maxPower = Math.max(...powerData) * 1.15 || 1
  const maxLoad = 100

  ctx.clearRect(0, 0, width, height)

  // 网格线
  ctx.strokeStyle = 'var(--zg-line-soft)'
  ctx.lineWidth = 1
  for (let i = 0; i <= 5; i++) {
    const y = padding.top + (chartHeight / 5) * i
    ctx.beginPath()
    ctx.moveTo(padding.left, y)
    ctx.lineTo(width - padding.right, y)
    ctx.stroke()

    const powerValue = maxPower - (maxPower / 5) * i
    ctx.fillStyle = 'var(--zg-ink-tertiary)'
    ctx.font = '11px sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText(powerValue.toFixed(1), padding.left - 5, y + 4)
  }

  // X轴标签
  for (let i = 0; i < labels.length; i++) {
    const x = padding.left + (chartWidth / (labels.length - 1)) * i
    ctx.beginPath()
    ctx.moveTo(x, padding.top)
    ctx.lineTo(x, height - padding.bottom)
    ctx.stroke()

    ctx.fillStyle = 'var(--zg-ink-tertiary)'
    ctx.font = '11px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(labels[i], x, height - 8)
  }

  // 功率曲线
  ctx.beginPath()
  ctx.strokeStyle = 'var(--zg-brand-primary)'
  ctx.lineWidth = 2
  powerData.forEach((value, index) => {
    const x = padding.left + (chartWidth / (powerData.length - 1)) * index
    const y = padding.top + chartHeight - (value / maxPower) * chartHeight
    if (index === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  })
  ctx.stroke()

  // 负载率曲线
  ctx.beginPath()
  ctx.strokeStyle = 'var(--zg-success)'
  ctx.lineWidth = 2
  ctx.setLineDash([5, 5])
  loadData.forEach((value, index) => {
    const x = padding.left + (chartWidth / (loadData.length - 1)) * index
    const y = padding.top + chartHeight - (value / maxLoad) * chartHeight
    if (index === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  })
  ctx.stroke()
  ctx.setLineDash([])
}

/**
 * 查看探测结果：打开抽屉并绘制负载曲线
 * @param {Object} probe 探测记录
 */
const onInspectProbeResult = (probe) => {
  proberInspector.openInspector(probe)
  if (probe.curves) {
    nextTick(() => {
      setTimeout(() => drawLoadCurve(curveCanvas.value, probe.curves), 100)
    })
  }
}

/**
 * 执行负载探测：模拟探测过程并生成曲线数据
 * @param {Object} probe 目标探测点（可选，为空时新增探测点）
 */
const onProbeLoad = (probe = null) => {
  if (!probe) {
    // 新增探测点：登记到数据池
    const newProbe = {
      id: Date.now(),
      no: proberCtl.presetPlaybook.length + 1,
      area: '长沙-岳麓区',
      name: `新增探测点${proberCtl.presetPlaybook.length + 1}`,
      type: '低压',
      status: '已探测',
      voltage: 380,
      current: Math.floor(Math.random() * 60) + 10,
      power: 0,
      loadRate: 0,
      ratedPower: 40.0,
      probeTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
      remark: '新增登记',
      curves: null
    }
    newProbe.power = parseFloat(((newProbe.voltage * newProbe.current * 0.001732) / 1000).toFixed(1))
    newProbe.loadRate = parseFloat(((newProbe.power / newProbe.ratedPower) * 100).toFixed(1))
    newProbe.curves = generateMockCurves(newProbe.power, newProbe.loadRate)
    proberCtl.appendRecord(newProbe)
    ElMessage.success(`探测点「${newProbe.name}」已登记并完成探测`)
    return
  }

  // 已有探测点：执行探测
  const actionLabel = probe.status === '已探测' ? '复测' : '探测'
  ElMessageBox.confirm(
    `确认对「${probe.name}」执行${actionLabel}？`,
    `${actionLabel}确认`,
    { type: 'warning' }
  )
    .then(() => {
      // 先标记为探测中
      proberCtl.reviseRecord(probe.id, { status: '探测中' })
      ElMessage.info(`「${probe.name}」探测指令已下发，正在采集中…`)

      // 模拟探测延迟
      setTimeout(() => {
        const current = Math.floor(Math.random() * 60) + 10
        const power = parseFloat(((380 * current * 0.001732) / 1000).toFixed(1))
        const loadRate = parseFloat(((power / probe.ratedPower) * 100).toFixed(1))
        const curves = generateMockCurves(power, loadRate)

        proberCtl.reviseRecord(probe.id, {
          status: '已探测',
          voltage: 380,
          current,
          power,
          loadRate,
          probeTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
          curves
        })
        ElMessage.success(`「${probe.name}」${actionLabel}完成，遥测回执已签收`)
      }, 1200)
    })
    .catch(() => {})
}

/**
 * 生成模拟负载曲线
 * @param {number} basePower 基准功率
 * @param {number} baseLoadRate 基准负载率
 * @returns {Object}
 */
const generateMockCurves = (basePower, baseLoadRate) => {
  const labels = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00']
  const power = labels.map((_, i) => {
    const noise = (Math.random() - 0.5) * basePower * 0.4
    const trend = Math.sin((i / labels.length) * Math.PI * 2) * basePower * 0.3
    return Math.max(0, parseFloat((basePower + noise + trend).toFixed(1)))
  })
  const loadRate = labels.map((_, i) => {
    const noise = (Math.random() - 0.5) * 15
    const trend = Math.sin((i / labels.length) * Math.PI * 2) * baseLoadRate * 0.25
    return Math.max(0, Math.min(100, parseFloat((baseLoadRate + noise + trend).toFixed(1))))
  })
  return { labels, power, loadRate }
}

/**
 * 移除探测点：二次确认后从台账中移除
 * @param {Object} probe 目标探测点
 */
const onRetireProbe = (probe) => {
  ElMessageBox.confirm(
    `确定要将「${probe.name}」从探测台账中移除吗？`,
    '移除确认',
    { type: 'warning' }
  )
    .then(() => {
      proberCtl.retireRecord(probe.id)
      ElMessage.success('探测点已移除，台账已同步')
    })
    .catch(() => {})
}
</script>

<style scoped lang="scss">
.zg-prober {
  padding: 24px;

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

.zg-metrics {
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

    &--ok::before { background: var(--zg-success); }
    &--warn::before { background: var(--zg-warning); }
    &--info::before { background: var(--zg-info); }
  }

  &__num {
    font-size: 26px;
    font-weight: 700;
    color: var(--zg-ink-primary);
    line-height: 1;
  }

  &__lbl {
    font-size: 12px;
    color: var(--zg-ink-tertiary);
  }
}

.zg-filterband {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 18px;
  padding: 14px 18px;
  background: var(--zg-surface-card);
  border: 1px solid var(--zg-line-soft);
  border-radius: var(--zg-radius-lg);
  flex-wrap: wrap;

  &__fields {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  &__select { width: 160px; }
  &__search { width: 240px; }
}

.zg-cardgrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.zg-probercard {
  background: var(--zg-surface-card);
  border: 1px solid var(--zg-line-soft);
  border-radius: var(--zg-radius-lg);
  padding: 16px;
  cursor: pointer;
  transition: all var(--zg-transition-normal);
  display: flex;
  flex-direction: column;
  gap: 14px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--zg-shadow-card-hover);
    border-color: var(--zg-line-brand);
  }

  &.probed {
    border-left: 3px solid var(--zg-success);
  }
  &.probing {
    border-left: 3px solid var(--zg-warning);
  }
  &.pending {
    border-left: 3px solid var(--zg-danger);
  }

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__glyph {
    width: 38px;
    height: 38px;
    border-radius: var(--zg-radius-md);
    background: var(--zg-brand-tint-50);
    color: var(--zg-brand-primary);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__name {
    font-size: 15px;
    font-weight: 600;
    color: var(--zg-ink-primary);
    margin: 0;
  }

  &__area {
    font-size: 12px;
    color: var(--zg-ink-tertiary);
    margin: 0;
  }

  &__stats {
    display: flex;
    gap: 14px;
    margin-top: 6px;
  }

  &__stat {
    font-size: 12px;
    color: var(--zg-ink-tertiary);

    em {
      font-style: normal;
      font-size: 16px;
      font-weight: 600;
      color: var(--zg-brand-primary);
      margin-right: 2px;
    }
  }

  &__foot {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 10px;
    border-top: 1px dashed var(--zg-line-soft);
  }

  &__time {
    font-size: 12px;
    color: var(--zg-ink-placeholder);
  }

  &__actions {
    display: flex;
    gap: 4px;
  }
}

.zg-tablewrap {
  background: var(--zg-surface-card);
  border-radius: var(--zg-radius-lg);
  padding: 16px;
  margin-bottom: 20px;
  border: 1px solid var(--zg-line-soft);
}

.zg-pagerbar {
  display: flex;
  justify-content: flex-end;
  padding: 12px 0;
}

.zg-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: var(--zg-radius-pill);

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }

  &.online {
    color: var(--zg-success);
    background: var(--zg-success-soft);
  }
  &.offline {
    color: var(--zg-danger);
    background: var(--zg-danger-soft);
  }
  &.idle {
    color: var(--zg-warning);
    background: var(--zg-warning-soft);
  }
}

.zg-inspector {
  &__head {
    display: flex;
    gap: 14px;
    align-items: center;
    padding-bottom: 18px;
    border-bottom: 1px solid var(--zg-line-soft);
    margin-bottom: 18px;
  }

  &__glyph {
    width: 56px;
    height: 56px;
    border-radius: var(--zg-radius-lg);
    background: var(--zg-gradient-primary);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__meta {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__name {
    font-size: 18px;
    font-weight: 600;
    color: var(--zg-ink-primary);
    margin: 0;
  }

  &__type {
    font-size: 13px;
    color: var(--zg-ink-tertiary);
    margin: 0;
  }

  &__section {
    margin-bottom: 22px;
  }

  &__section-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--zg-ink-secondary);
    margin: 0 0 12px;
    padding-left: 8px;
    border-left: 3px solid var(--zg-brand-primary);
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  &__cell {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 10px 12px;
    background: var(--zg-surface-muted);
    border-radius: var(--zg-radius-md);

    .lbl {
      font-size: 12px;
      color: var(--zg-ink-tertiary);
    }
    .val {
      font-size: 14px;
      color: var(--zg-ink-primary);
      font-weight: 500;
    }
  }

  &__actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    padding-top: 18px;
    border-top: 1px solid var(--zg-line-soft);
    margin-top: 8px;
  }
}

.zg-datagrid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.zg-datacard {
  padding: 14px 16px;
  background: var(--zg-gradient-surface);
  border: 1px solid var(--zg-line-soft);
  border-radius: var(--zg-radius-md);

  &__lbl {
    font-size: 12px;
    color: var(--zg-ink-tertiary);
    margin-bottom: 6px;
  }

  &__val {
    font-size: 22px;
    font-weight: 700;
    color: var(--zg-brand-primary);

    em {
      font-style: normal;
      font-size: 13px;
      color: var(--zg-ink-tertiary);
      margin-left: 4px;
      font-weight: 400;
    }
  }
}

.zg-curvebox {
  background: var(--zg-surface-card);
  border: 1px solid var(--zg-line-soft);
  border-radius: var(--zg-radius-md);
  padding: 12px;
  canvas {
    display: block;
    width: 100%;
  }
}

.zg-curvelgnd {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 10px;

  &__item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--zg-ink-tertiary);
  }

  &__dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: inline-block;
  }
}
</style>
