<!--
  智光云枢 · 线路拓扑 · 配电箱详情
  业务域：lineTopo
  功能：4 Tab · 内部接线 SVG · 实时遥测 setInterval · 测试记录 · 关联资产
-->
<template>
  <section class="zg-lt-cabinet">
    <header class="zg-lt-cabinet__head">
      <div class="zg-lt-cabinet__headline">
        <div class="zg-lt-cabinet__sigil"><el-icon :size="22"><Setting /></el-icon></div>
        <div class="zg-lt-cabinet__copy">
          <h1 class="zg-lt-cabinet__title">配电箱详情 · {{ cabinet.id }}</h1>
          <p class="zg-lt-cabinet__sub">{{ cabinet.name }} · {{ cabinet.spec }} · 资产编码 {{ cabinet.asset }}</p>
        </div>
      </div>
      <div class="zg-lt-cabinet__head-meta">
        <el-tag type="success" effect="dark" round>正常运行</el-tag>
        <el-tag class="zg-lt-cabinet__live"><el-icon><Monitor /></el-icon>实时 · 1s</el-tag>
      </div>
    </header>

    <!-- ===== Tabs ===== -->
    <el-tabs v-model="activeTab" class="zg-lt-cabinet__tabs">
      <!-- ===== Tab 1: 内部接线图 ===== -->
      <el-tab-pane label="内部接线图" name="wiring">
        <div class="zg-lt-cabinet__wiring-wrap">
          <div class="zg-lt-cabinet__svg-canvas">
            <svg viewBox="0 0 900 520" class="zg-lt-cabinet__svg" preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="zg-cab-bg" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#f0f9ff" />
                  <stop offset="100%" stop-color="#faf5ff" />
                </linearGradient>
                <marker id="zg-cab-arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
                </marker>
              </defs>
              <rect width="900" height="520" fill="url(#zg-cab-bg)" rx="12" />

              <!-- 进线 -->
              <path d="M 450 20 L 450 60" stroke="#dc2626" stroke-width="3" class="zg-lt-cabinet__in-line" />
              <path d="M 450 20 L 440 28 M 450 20 L 460 28" stroke="#dc2626" stroke-width="3" stroke-linecap="round" />
              <text x="450" y="15" text-anchor="middle" font-size="11" fill="#dc2626" font-weight="700">380V 进线</text>

              <!-- 主断路器 -->
              <g class="zg-lt-cabinet__device" @click="openComponent(mainBreaker)">
                <rect x="420" y="70" width="60" height="50" rx="6" fill="#fff" stroke="#18181b" stroke-width="2" />
                <rect x="420" y="70" width="60" height="50" rx="6" fill="#fff" opacity="0" />
                <rect x="435" y="80" width="30" height="6" rx="2" fill="#dc2626" />
                <rect x="435" y="95" width="30" height="6" rx="2" fill="#dc2626" />
                <rect x="435" y="110" width="30" height="6" rx="2" fill="#dc2626" />
                <text x="450" y="142" text-anchor="middle" font-size="11" fill="#18181b" font-weight="700">QF0 主空开</text>
                <text x="450" y="155" text-anchor="middle" font-size="9" fill="#64748b">CM1-100 3P 80A</text>
              </g>

              <!-- 向下连接 -->
              <path d="M 450 120 L 450 180" stroke="#64748b" stroke-width="2" />
              <!-- 横向母线 -->
              <path d="M 140 180 L 760 180" stroke="#18181b" stroke-width="4" />

              <!-- 5 条出线回路 -->
              <g v-for="(ckt, i) in circuits" :key="ckt.id">
                <!-- 竖线 -->
                <path :d="`M ${ckt.x} 180 L ${ckt.x} 240`" stroke="#64748b" stroke-width="2" />
                <!-- 断路器 -->
                <g class="zg-lt-cabinet__device" @click="openComponent(ckt)">
                  <rect :x="ckt.x - 24" y="240" width="48" height="56" rx="5" fill="#fff" stroke="#18181b" stroke-width="1.5" />
                  <rect :x="ckt.x - 14" y="252" width="28" height="5" rx="1.5" fill="#dc2626" />
                  <rect :x="ckt.x - 14" y="262" width="28" height="5" rx="1.5" fill="#dc2626" />
                  <circle :cx="ckt.x + 15" cy="280" r="3" :fill="ckt.energized ? '#059669' : '#94a3b8'" />
                  <text :x="ckt.x" y="312" text-anchor="middle" font-size="10" font-weight="700" fill="#18181b">{{ ckt.id }}</text>
                  <text :x="ckt.x" y="325" text-anchor="middle" font-size="9" fill="#64748b">{{ ckt.desc }}</text>
                </g>
                <!-- 出线 -->
                <path :d="`M ${ckt.x} 296 L ${ckt.x} 380`" stroke="#64748b" stroke-width="1.5" stroke-dasharray="3 2" />
                <text :x="ckt.x" y="400" text-anchor="middle" font-size="9" fill="#64748b">{{ ckt.load }}</text>
              </g>

              <!-- 接触器 -->
              <g class="zg-lt-cabinet__device" @click="openComponent(contactor)">
                <rect x="280" y="390" width="110" height="70" rx="8" fill="#fff" stroke="#18181b" stroke-width="2" />
                <circle cx="315" cy="420" r="12" fill="none" stroke="#18181b" stroke-width="1.5" />
                <circle cx="355" cy="420" r="12" fill="none" stroke="#18181b" stroke-width="1.5" />
                <path d="M 300 420 L 325 420" stroke="#18181b" stroke-width="2" />
                <path d="M 340 420 L 370 420" stroke="#18181b" stroke-width="2" />
                <text x="335" y="455" text-anchor="middle" font-size="11" font-weight="700" fill="#18181b">KM 接触器</text>
              </g>

              <!-- 电表 -->
              <g class="zg-lt-cabinet__device" @click="openComponent(meter)">
                <rect x="480" y="390" width="100" height="70" rx="8" fill="#fff" stroke="#18181b" stroke-width="2" />
                <rect x="490" y="400" width="80" height="28" rx="4" fill="#1e293b" />
                <text x="530" y="419" text-anchor="middle" font-size="13" fill="#22d3ee" font-weight="700" font-family="monospace">0.0000</text>
                <text x="530" y="455" text-anchor="middle" font-size="11" font-weight="700" fill="#18181b">三相电表</text>
              </g>

              <!-- 浪涌 -->
              <g class="zg-lt-cabinet__device" @click="openComponent(surge)">
                <rect x="660" y="390" width="90" height="70" rx="8" fill="#fff" stroke="#18181b" stroke-width="2" />
                <path d="M 675 415 L 705 415" stroke="#dc2626" stroke-width="3" stroke-linecap="round" />
                <path d="M 690 405 L 690 425" stroke="#dc2626" stroke-width="2" stroke-linecap="round" />
                <text x="705" y="455" text-anchor="middle" font-size="11" font-weight="700" fill="#18181b">SPD 浪涌保护</text>
              </g>
            </svg>
          </div>
          <div class="zg-lt-cabinet__wiring-tip">
            <el-icon><InfoFilled /></el-icon>点击任意组件可查看规格与资产详情
          </div>
        </div>
      </el-tab-pane>

      <!-- ===== Tab 2: 实时遥测 ===== -->
      <el-tab-pane label="实时遥测" name="telemetry">
        <div class="zg-lt-cabinet__telemetry">
          <!-- 三相电压 -->
          <div class="zg-lt-cabinet__phase">
            <h4 class="zg-lt-cabinet__phase-title">三相电压 V</h4>
            <div class="zg-lt-cabinet__phase-row">
              <div class="zg-lt-cabinet__phase-cell" v-for="p in phases" :key="p.key">
                <span class="label">{{ p.label }}</span>
                <span class="num" :class="voltageClass(p.value)">{{ voltageFmt(p.value) }}</span>
                <span class="unit">V</span>
                <span class="bar"><span class="bar-fill" :style="{ width: `${p.value / 250 * 100}%`, background: voltageBarColor(p.value) }"></span></span>
              </div>
            </div>
          </div>

          <!-- 三相电流 -->
          <div class="zg-lt-cabinet__phase">
            <h4 class="zg-lt-cabinet__phase-title">三相电流 A</h4>
            <div class="zg-lt-cabinet__phase-row">
              <div class="zg-lt-cabinet__phase-cell" v-for="c in currents" :key="c.key">
                <span class="label">{{ c.label }}</span>
                <span class="num" :class="currentClass(c.value)">{{ currentFmt(c.value) }}</span>
                <span class="unit">A</span>
                <span class="bar"><span class="bar-fill" :style="{ width: `${c.value / 200 * 100}%`, background: currentBarColor(c.value) }"></span></span>
              </div>
            </div>
          </div>

          <!-- 其他参数 -->
          <div class="zg-lt-cabinet__extra">
            <div class="zg-lt-cabinet__kpi">
              <span class="lbl">漏电流</span>
              <span class="num" :class="leakage.value > 30 ? 'is-warn' : ''">{{ leakage.value.toFixed(1) }}</span>
              <span class="unit">mA</span>
              <el-progress :percentage="leakage.value / 30 * 100" :show-text="false" :stroke-width="6" />
              <span class="zg-lt-cabinet__hint">阈值 30mA</span>
            </div>
            <div class="zg-lt-cabinet__kpi">
              <span class="lbl">配电箱温度</span>
              <span class="num" :class="temp.value > 45 ? 'is-warn' : ''">{{ temp.value.toFixed(1) }}</span>
              <span class="unit">°C</span>
              <el-progress :percentage="temp.value / 50 * 100" :show-text="false" :stroke-width="6" />
              <span class="zg-lt-cabinet__hint">阈值 45°C</span>
            </div>
            <div class="zg-lt-cabinet__kpi">
              <span class="lbl">功率因数</span>
              <span class="num">{{ pf.value.toFixed(3) }}</span>
              <span class="unit">cosφ</span>
              <el-progress :percentage="pf.value / 1 * 100" :show-text="false" :stroke-width="6" />
              <span class="zg-lt-cabinet__hint">建议 ≥ 0.92</span>
            </div>
            <div class="zg-lt-cabinet__kpi">
              <span class="lbl">总有功功率</span>
              <span class="num">{{ totalPower.value.toFixed(2) }}</span>
              <span class="unit">kW</span>
              <el-progress :percentage="totalPower.value / 150 * 100" :show-text="false" :stroke-width="6" />
              <span class="zg-lt-cabinet__hint">额定 150kW</span>
            </div>
          </div>

          <div class="zg-lt-cabinet__telemetry-foot">
            <span>数据来源：智能网关网关 #ZWG-2025-0168 · 每 1s 自动上传</span>
            <el-tag effect="dark" round type="success">实时</el-tag>
          </div>
        </div>
      </el-tab-pane>

      <!-- ===== Tab 3: 测试记录 ===== -->
      <el-tab-pane label="测试记录" name="test">
        <div class="zg-lt-cabinet__test">
          <el-alert type="warning" show-icon :closable="false" class="zg-lt-cabinet__due-alert">
            <template #title>
              <span>⚠️ 下次到期还有 <strong class="is-pulse">5 天</strong>（2026-11-02）· 三相平衡测试</span>
            </template>
          </el-alert>

          <el-table :data="testRecords" stripe>
            <el-table-column prop="date" label="测试日期" width="120" />
            <el-table-column prop="type" label="测试类型" width="130">
              <template #default="{ row }">
                <el-tag size="small">{{ row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="result" label="结果" width="100">
              <template #default="{ row }">
                <el-tag :type="row.result === '合格' ? 'success' : 'danger'" effect="dark" round size="small">{{ row.result }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="keyMetric" label="关键指标" />
            <el-table-column prop="tester" label="测试员" width="100" />
            <el-table-column prop="report" label="测试报告" width="120">
              <template #default>
                <el-button link type="primary" size="small">查看 PDF</el-button>
              </template>
            </el-table-column>
            <el-table-column prop="nextDate" label="下次到期" width="120">
              <template #default="{ row }">
                <span :style="{ color: row.daysLeft <= 7 ? 'var(--zg-rose-danger)' : 'var(--zg-ink-primary)', fontWeight: row.daysLeft <= 7 ? 700 : 400 }">
                  {{ row.nextDate }}
                  <span v-if="row.daysLeft <= 7 && row.daysLeft >= 0" class="is-pulse">（{{ row.daysLeft }}天）</span>
                  <span v-else-if="row.daysLeft < 0" class="is-pulse" style="color:var(--zg-rose-danger)">{{ row.daysLeft }}天前</span>
                </span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- ===== Tab 4: 关联资产 ===== -->
      <el-tab-pane label="关联资产" name="assets">
        <div class="zg-lt-cabinet__assets">
          <div v-for="a in assets" :key="a.code" class="zg-lt-cabinet__asset">
            <div class="zg-lt-cabinet__asset-head">
              <span class="type">{{ a.type }}</span>
              <el-tag :type="a.depreciation > 80 ? 'danger' : a.depreciation > 50 ? 'warning' : 'success'" effect="dark" round size="small">折旧 {{ a.depreciation }}%</el-tag>
            </div>
            <div class="zg-lt-cabinet__asset-name">{{ a.name }}</div>
            <div class="zg-lt-cabinet__asset-code">{{ a.code }}</div>
            <div class="zg-lt-cabinet__asset-grid">
              <div><span class="lbl">规格</span><span>{{ a.spec }}</span></div>
              <div><span class="lbl">采购日期</span><span>{{ a.purchaseDate }}</span></div>
              <div><span class="lbl">供应商</span><span>{{ a.vendor }}</span></div>
              <div><span class="lbl">价值</span><span style="color:var(--zg-amber-glow);font-weight:700">¥{{ a.value.toLocaleString() }}</span></div>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- ===== 组件 Drawer ===== -->
    <el-drawer v-model="compVisible" title="组件规格详情" size="420px">
      <template v-if="compObj">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="组件名称">{{ compObj.name }}</el-descriptions-item>
          <el-descriptions-item label="型号规格">{{ compObj.spec }}</el-descriptions-item>
          <el-descriptions-item label="资产编码">{{ compObj.code }}</el-descriptions-item>
          <el-descriptions-item label="额定参数">{{ compObj.rating }}</el-descriptions-item>
          <el-descriptions-item label="出厂日期">{{ compObj.mfg }}</el-descriptions-item>
          <el-descriptions-item label="安装位置">{{ compObj.location }}</el-descriptions-item>
        </el-descriptions>
      </template>
    </el-drawer>
  </section>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { Setting, Monitor, InfoFilled } from '@element-plus/icons-vue'
import { ElAlert, ElNotification } from 'element-plus'

const activeTab = ref('wiring')
const compVisible = ref(false)
const compObj = ref(null)

const cabinet = ref({ id: 'D-23', name: '麓谷产业园配电箱 #3', spec: '12 回路 380V', asset: 'ZG-ASSET-CAB-2024-0023' })

// 内部组件
const mainBreaker = reactive({ name: '主断路器', spec: 'CM1-100 3P 80A', code: 'ZG-COMP-QF0-2025-016', rating: '380V / 80A / 10kA', mfg: '2024-11', location: '配电箱顶部' })
const contactor = reactive({ name: '交流接触器 KM', spec: 'CJX2-65 220V 65A', code: 'ZG-COMP-KM-2025-007', rating: '线圈 220V / 主触点 65A', mfg: '2025-03', location: '配电箱右下' })
const meter = reactive({ name: '三相四线电表', spec: 'DTZY986 级 1', code: 'ZG-COMP-METER-2025-003', rating: '3×220/380V / 1.5(6)A', mfg: '2025-01', location: '配电箱中部' })
const surge = reactive({ name: 'SPD 浪涌保护器', spec: '40kA 380V 3P+N', code: 'ZG-COMP-SPD-2025-009', rating: '40kA / 220V / 残压 ≤1.2kV', mfg: '2025-02', location: '进线处' })

const circuits = reactive([
  { id: 'QF1', x: 180, desc: '回路1', load: '照明组 A', energized: true },
  { id: 'QF2', x: 280, desc: '回路2', load: '照明组 B', energized: true },
  { id: 'QF3', x: 380, desc: '回路3', load: '照明组 C', energized: false },
  { id: 'QF4', x: 560, desc: '回路4', load: '备用 1', energized: true },
  { id: 'QF5', x: 660, desc: '回路5', load: '备用 2', energized: true }
])

function openComponent(c) {
  compObj.value = c
  compVisible.value = true
}

// ===== 实时遥测（每 1s 跳动 ±0.2 / ±0.5 / ±2）=====
const phaseA = reactive({ label: 'Ua', value: 220.5, key: 'A' })
const phaseB = reactive({ label: 'Ub', value: 219.8, key: 'B' })
const phaseC = reactive({ label: 'Uc', value: 221.2, key: 'C' })
const phases = [phaseA, phaseB, phaseC]

const currentA = reactive({ label: 'Ia', value: 48.5, key: 'A' })
const currentB = reactive({ label: 'Ib', value: 51.2, key: 'B' })
const currentC = reactive({ label: 'Ic', value: 47.8, key: 'C' })
const currents = [currentA, currentB, currentC]

const leakage = reactive({ value: 18.2 })
const temp = reactive({ value: 38.5 })
const pf = reactive({ value: 0.945 })
const totalPower = reactive({ value: 28.6 })

let timer = null

// ===== 测试到期真推送 =====
const tests = ref([
  { type: '接地电阻', nextTestDate: '2027-10-05' },
  { type: '绝缘电阻', nextTestDate: '2027-01-18' },
  { type: '三相平衡', nextTestDate: '2026-11-02' },
  { type: 'SPD 残压', nextTestDate: '2027-07-10' },
  { type: '保护定值', nextTestDate: '2027-06-02' },
  { type: '漏电流', nextTestDate: '2026-10-15' },
  { type: '红外测温', nextTestDate: '2026-09-08' },
  { type: '交流耐压', nextTestDate: '2027-01-20' },
  { type: '变压器油色谱', nextTestDate: '2026-12-12' },
  { type: '继电保护', nextTestDate: '2026-10-30' }
])

const dueSoonList = computed(() => {
  const now = new Date()
  return tests.value.filter(t => {
    const days = (new Date(t.nextTestDate) - now) / 86400000
    return days > 0 && days < 30
  })
})
const overdueList = computed(() => {
  const now = new Date()
  return tests.value.filter(t => new Date(t.nextTestDate) < now)
})

onMounted(() => {
  // 测试到期真推送
  const now = new Date()
  const overdueMsgs = overdueList.value.map(t => {
    const days = Math.floor((now - new Date(t.nextTestDate)) / 86400000)
    return `${t.type} 测试已过期 ${days} 天`
  })
  const soonMsgs = dueSoonList.value.map(t => {
    const days = Math.floor((new Date(t.nextTestDate) - now) / 86400000)
    return `${t.type} 测试还剩 ${days} 天`
  })
  if (overdueMsgs.length > 0 || soonMsgs.length > 0) {
    ElNotification({
      title: '⚠️ 配电箱测试到期预警',
      message: (overdueMsgs.concat(soonMsgs)).join('；'),
      type: overdueMsgs.length > 0 ? 'error' : 'warning',
      duration: 6000,
      showClose: true
    })
  }

  timer = setInterval(() => {
    phaseA.value += (Math.random() - 0.5) * 0.4
    phaseB.value += (Math.random() - 0.5) * 0.4
    phaseC.value += (Math.random() - 0.5) * 0.4
    currentA.value += (Math.random() - 0.5) * 1
    currentB.value += (Math.random() - 0.5) * 1
    currentC.value += (Math.random() - 0.5) * 1
    leakage.value += (Math.random() - 0.5) * 0.4
    temp.value += (Math.random() - 0.5) * 0.2
    pf.value += (Math.random() - 0.5) * 0.006
    totalPower.value += (Math.random() - 0.5) * 0.8
    // 约束范围
    phaseA.value = clamp(phaseA.value, 210, 230)
    phaseB.value = clamp(phaseB.value, 210, 230)
    phaseC.value = clamp(phaseC.value, 210, 230)
    currentA.value = clamp(currentA.value, 0, 200)
    currentB.value = clamp(currentB.value, 0, 200)
    currentC.value = clamp(currentC.value, 0, 200)
    leakage.value = clamp(leakage.value, 0, 60)
    temp.value = clamp(temp.value, 20, 60)
    pf.value = clamp(pf.value, 0.8, 1)
    totalPower.value = clamp(totalPower.value, 0, 150)
  }, 1000)
})
onUnmounted(() => { if (timer) clearInterval(timer) })

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)) }
function voltageFmt(v) { return v.toFixed(1) }
function currentFmt(v) { return v.toFixed(1) }
function voltageClass(v) { return v < 215 || v > 225 ? 'is-warn' : '' }
function currentClass(v) { return v > 180 ? 'is-warn' : v > 150 ? 'is-info' : '' }
function voltageBarColor(v) { return v < 215 || v > 225 ? '#f59e0b' : '#059669' }
function currentBarColor(v) { return v > 180 ? '#dc2626' : v > 150 ? '#f59e0b' : '#059669' }

// 测试记录
const testRecords = ref([
  { date: '2026-10-05', type: '接地电阻', result: '合格', keyMetric: '2.4 Ω（≤ 4 Ω）', tester: '李明', report: 'view', nextDate: '2027-10-05', daysLeft: 342 },
  { date: '2026-09-18', type: '绝缘电阻', result: '合格', keyMetric: '0.5 MΩ（≥ 0.5 MΩ）', tester: '王芳', report: 'view', nextDate: '2026-12-18', daysLeft: 51 },
  { date: '2026-08-22', type: '三相平衡', result: '合格', keyMetric: '最大偏差 8.4%（≤ 10%）', tester: '张伟', report: 'view', nextDate: '2026-11-02', daysLeft: 5 },
  { date: '2026-07-10', type: 'SPD 残压', result: '合格', keyMetric: '1.05 kV（≤ 1.2 kV）', tester: '李明', report: 'view', nextDate: '2027-07-10', daysLeft: 256 },
  { date: '2026-06-02', type: '保护定值', result: '合格', keyMetric: '过载 85A / 短路 600A', tester: '王芳', report: 'view', nextDate: '2027-06-02', daysLeft: 218 },
  { date: '2026-04-15', type: '漏电流', result: '合格', keyMetric: '16 mA（≤ 30 mA）', tester: '张伟', report: 'view', nextDate: '2026-10-15', daysLeft: -13 },
  { date: '2026-03-08', type: '红外测温', result: '合格', keyMetric: '最高 37.2°C', tester: '李明', report: 'view', nextDate: '2026-09-08', daysLeft: -51 },
  { date: '2026-01-20', type: '交流耐压', result: '合格', keyMetric: '2.5 kV / 1 min 无击穿', tester: '王芳', report: 'view', nextDate: '2027-01-20', daysLeft: 84 },
  { date: '2025-12-12', type: '变压器油色谱', result: '合格', keyMetric: 'H₂ 0 ppm / CH₄ 2 ppm', tester: '第三方', report: 'view', nextDate: '2026-12-12', daysLeft: 65 },
  { date: '2025-10-30', type: '继电保护', result: '合格', keyMetric: '三段过流 / 零序全部正确', tester: '王芳', report: 'view', nextDate: '2026-10-30', daysLeft: 2 }
])

// 关联资产
const assets = ref([
  { type: '主断路器', name: 'CM1-100 主空开', code: 'ZG-ASSET-QF-2024-0016', spec: 'CM1-100M/3300 80A', purchaseDate: '2024-10-28', vendor: '正泰电器', value: 480, depreciation: 68 },
  { type: '交流接触器', name: 'CJX2-65 KM', code: 'ZG-ASSET-KM-2025-0007', spec: 'CJX2-6511 220V', purchaseDate: '2025-03-15', vendor: '德力西', value: 320, depreciation: 35 },
  { type: '三相电表', name: 'DTZY986', code: 'ZG-ASSET-METER-2025-0003', spec: 'DTZY986-Z 1级', purchaseDate: '2025-01-20', vendor: '威胜集团', value: 560, depreciation: 44 },
  { type: 'SPD 浪涌保护', name: 'Y10-40 SPD', code: 'ZG-ASSET-SPD-2025-009', spec: '40kA 3P+N', purchaseDate: '2025-02-28', vendor: '中光防雷', value: 380, depreciation: 40 },
  { type: '铜排母线', name: 'T2 紫铜排', code: 'ZG-ASSET-BUS-2024-0003', spec: '40×4 mm²', purchaseDate: '2024-11-01', vendor: '远东电缆', value: 1200, depreciation: 65 },
  { type: '箱体外壳', name: '冷轧钢板柜', code: 'ZG-ASSET-CAB-2024-0023', spec: '400×600×200', purchaseDate: '2024-11-10', vendor: '定制加工', value: 2800, depreciation: 66 }
])
</script>

<style lang="scss" scoped>
.zg-lt-cabinet {
  padding: var(--zg-space-6);
  background: var(--zg-gradient-surface);
  min-height: calc(100vh - 120px);

  &__head {
    display: flex; justify-content: space-between; align-items: center;
    padding-bottom: var(--zg-space-5); margin-bottom: var(--zg-space-5);
    border-bottom: 1px solid var(--zg-line-soft);
    &line { display: flex; gap: var(--zg-space-4); align-items: center; }
    &__sigil {
      width: 44px; height: 44px; border-radius: var(--zg-radius-md);
      background: linear-gradient(135deg, #06b6d4, #22d3ee);
      color: #fff; display: flex; align-items: center; justify-content: center;
    }
    &__title { margin: 0; font-size: var(--zg-text-display-md); font-weight: 700; }
    &__sub { margin: 2px 0 0; font-size: var(--zg-text-body-sm); color: var(--zg-ink-tertiary); }
    &__head-meta { display: flex; gap: var(--zg-space-2); align-items: center; }
    &__live {
      display: inline-flex; align-items: center; gap: 4px;
      background: rgba(6,182,212,0.1); color: #06b6d4;
      border-color: transparent;
    }
  }

  // Tabs 包裹
  &__tabs {
    background: var(--zg-surface-card); border: 1px solid var(--zg-line-strong);
    border-radius: var(--zg-radius-lg); padding: var(--zg-space-5); box-shadow: var(--zg-shadow-card);
  }

  // ========== 接线图 Tab ==========
  &__wiring-wrap { text-align: center; }
  &__svg-canvas { border-radius: var(--zg-radius-md); overflow: hidden; box-shadow: var(--zg-shadow-card); border: 1px solid var(--zg-line-soft); }
  &__svg { width: 100%; height: auto; }

  &__device {
    cursor: pointer; transition: transform var(--zg-transition-fast);
    &:hover { transform: scale(1.04) translateY(-1px); }
    rect:first-of-type { stroke: var(--zg-amber-glow) !important; stroke-width: 3 !important; filter: drop-shadow(0 2px 6px rgba(217,119,6,0.2)) }
  }

  &__in-line { animation: pulse 1.5s infinite; }

  &__wiring-tip {
    margin-top: var(--zg-space-3); padding: var(--zg-space-2) var(--zg-space-3);
    background: var(--zg-sky-soft); color: var(--zg-sky-info);
    border-radius: var(--zg-radius-md); display: inline-flex; gap: 6px; align-items: center;
    font-size: var(--zg-text-caption);
  }

  // ========== 遥测 Tab ==========
  &__telemetry { display: flex; flex-direction: column; gap: var(--zg-space-5); }

  &__phase-title {
    margin: 0 0 var(--zg-space-3); font-size: var(--zg-text-body); font-weight: 600;
    color: var(--zg-ink-primary); display: flex; gap: 6px; align-items: center;
    padding-left: var(--zg-space-3); border-left: 3px solid var(--zg-amber-glow);
  }

  &__phase-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--zg-space-4); }

  &__phase-cell {
    background: var(--zg-surface-muted); border: 1px solid var(--zg-line-soft);
    border-radius: var(--zg-radius-md); padding: var(--zg-space-4);
    display: grid; grid-template-columns: auto auto auto 1fr; gap: var(--zg-space-3);
    align-items: center;
  }

  &__phase-cell .label { font-weight: 700; color: var(--zg-ink-tertiary); font-size: var(--zg-text-body-sm); }
  &__phase-cell .num { font-size: var(--zg-text-display-sm); font-weight: 800; font-family: var(--zg-font-mono); color: var(--zg-ink-primary); min-width: 70px; }
  &__phase-cell .unit { font-size: var(--zg-text-caption); color: var(--zg-ink-tertiary); }
  &__phase-cell .bar { height: 6px; background: var(--zg-line-soft); border-radius: 3px; overflow: hidden; }
  &__phase-cell .bar-fill { height: 100%; border-radius: 3px; transition: width 0.5s ease; }

  .is-warn { color: var(--zg-rose-danger) !important; }
  .is-info { color: var(--zg-amber-glow) !important; }

  // 额外 KPI
  &__extra { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--zg-space-4); }

  &__kpi {
    background: var(--zg-surface-muted); border: 1px solid var(--zg-line-soft);
    border-radius: var(--zg-radius-md); padding: var(--zg-space-4);
    display: flex; flex-direction: column; gap: 6px;

    .lbl { font-size: var(--zg-text-caption); color: var(--zg-ink-tertiary); }
    .num { font-size: 28px; font-weight: 800; font-family: var(--zg-font-mono); color: var(--zg-ink-primary); }
    .unit { font-size: var(--zg-text-caption); color: var(--zg-ink-tertiary); }
    & > *:not(.lbl):not(.num):not(.unit) { order: 99; }
  }

  &__telemetry-foot {
    display: flex; justify-content: space-between; align-items: center;
    padding-top: var(--zg-space-3); border-top: 1px solid var(--zg-line-soft);
    font-size: var(--zg-text-caption); color: var(--zg-ink-tertiary);
  }

  &__hint { font-size: 11px; color: var(--zg-ink-tertiary); margin-top: 4px; }

  // ========== 测试记录 Tab ==========
  &__due-alert { margin-bottom: var(--zg-space-4); }
  .is-pulse { color: var(--zg-rose-danger); animation: pulse 1.5s infinite; font-weight: 800; }

  // ========== 关联资产 Tab ==========
  &__assets { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--zg-space-4); }

  &__asset {
    background: var(--zg-surface-muted); border: 1px solid var(--zg-line-soft);
    border-radius: var(--zg-radius-md); padding: var(--zg-space-4);
    transition: all var(--zg-transition-normal);
    &:hover { border-color: var(--zg-amber-glow); box-shadow: var(--zg-shadow-card-hover); }
  }

  &__asset-head { display: flex; justify-content: space-between; margin-bottom: 4px; .type { font-size: var(--zg-text-caption); color: var(--zg-ink-tertiary); } }
  &__asset-name { font-weight: 700; font-size: var(--zg-text-body); color: var(--zg-ink-primary); }
  &__asset-code { font-family: var(--zg-font-mono); font-size: var(--zg-text-caption); color: var(--zg-amber-glow); margin-bottom: var(--zg-space-3); }

  &__asset-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 12px; font-size: var(--zg-text-caption); div { display: flex; gap: 6px; .lbl { color: var(--zg-ink-tertiary); } } }
}</style>
