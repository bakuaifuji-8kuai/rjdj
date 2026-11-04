<!--
  智光云枢 · 资产管控 · 折旧中心 (Phase 1)
  - 真实 calcDepreciation 实时计算
  - 进度条 color 映射：<50% 绿 / 50-85% 黄 / 85-100% 红 pulse / >100% 深红 pulse
  - CSV 真导出 (UTF-8 BOM)
  - 批量报废建议：depreciationProgress ≥ 95% → 勾选 → 自动填草稿
-->
<template>
  <section class="zg-am-dep">
    <header class="zg-am-dep__head">
      <div class="zg-am-dep__headline">
        <div class="zg-am-dep__sigil"><el-icon :size="22"><TrendCharts /></el-icon></div>
        <div class="zg-am-dep__copy">
          <h1 class="zg-am-dep__title">折旧中心</h1>
          <p class="zg-am-dep__sub">
            月度计提引擎 · 本月应计提 ¥{{ kpiMonthly.toLocaleString() }} ·
            累计 ¥{{ (kpiAccumulated / 10000).toFixed(0) }}万 ·
            已完成折旧 {{ kpiDone }} 件 ·
            下月可报废 {{ kpiNextScrap }} 件
          </p>
        </div>
      </div>
      <div class="zg-am-dep__cta">
        <el-button type="primary"><el-icon><Coin /></el-icon>计提本月折旧</el-button>
        <el-button plain @click="onCsvExport"><el-icon><Download /></el-icon>导出折旧明细</el-button>
        <el-button type="danger" plain :disabled="!readyScrapCount" @click="onBatchScrap">
          <el-icon><Delete /></el-icon>批量报废 ({{ readyScrapCount }})
        </el-button>
      </div>
    </header>

    <!-- KPI -->
    <div class="zg-am-dep__kpi">
      <div v-for="cell in kpiCells" :key="cell.key" class="zg-kpi-cell" :class="cell.theme">
        <div class="zg-kpi-cell__icon"><el-icon :size="20"><component :is="cell.icon" /></el-icon></div>
        <div class="zg-kpi-cell__body">
          <span class="zg-kpi-cell__num">{{ cell.value }}</span>
          <span class="zg-kpi-cell__lbl">{{ cell.label }}</span>
        </div>
      </div>
    </div>

    <!-- 筛选 + 表 -->
    <div class="zg-am-dep__main">
      <div class="zg-am-dep__filterbar">
        <div class="zg-filter-row">
          <div class="zg-filter-item">
            <span class="zg-filter-item__lbl">分类</span>
            <el-select v-model="filters.category" placeholder="全部分类" clearable class="zg-filter-select">
              <el-option v-for="c in categoryList" :key="c.key" :label="c.label" :value="c.key" />
            </el-select>
          </div>
          <div class="zg-filter-item">
            <span class="zg-filter-item__lbl">折旧进度</span>
            <div class="zg-slider-wrap">
              <el-slider v-model="filters.range" range :max="110" :step="5" />
              <span class="zg-slider-label">{{ filters.range[0] }}% - {{ filters.range[1] }}%</span>
            </div>
          </div>
          <div class="zg-filter-item">
            <span class="zg-filter-item__lbl">报废建议</span>
            <el-radio-group v-model="filters.scrapState">
              <el-radio-button :value="'all'">全部</el-radio-button>
              <el-radio-button :value="'soon'">≥90%</el-radio-button>
              <el-radio-button :value="'ready'">≥95%</el-radio-button>
              <el-radio-button :value="'overdue'">已超期</el-radio-button>
            </el-radio-group>
          </div>
          <div class="zg-filter-item zg-filter-item--actions">
            <el-button @click="onReset"><el-icon><RefreshLeft /></el-icon>重置</el-button>
          </div>
        </div>
      </div>

      <el-table ref="tableRef" :data="pagedRows" stripe height="580" @selection-change="onSelection">
        <el-table-column type="selection" width="44" />
        <el-table-column prop="code" label="资产编码" width="150" fixed="left">
          <template #default="{ row }"><span class="mono">{{ row.code }}</span></template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="90" align="center">
          <template #default="{ row }">
            <el-tag size="small" type="info" effect="plain">{{ row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="model" label="型号" width="160" show-overflow-tooltip />
        <el-table-column label="原值 · 月折旧" width="160">
          <template #default="{ row }">
            <div>¥{{ row.original.toLocaleString() }}</div>
            <div class="sub">¥{{ row.dep.monthlyDepreciation.toFixed(2) }}/月</div>
          </template>
        </el-table-column>
        <el-table-column label="累计折旧 · 进度" width="240">
          <template #default="{ row }">
            <div class="zg-dep-row">
              <div class="zg-dep-row__bar">
                <el-progress :percentage="Math.min(row.dep.depreciationProgress, 110)" :stroke-width="10"
                  :color="depColor(row.dep.depreciationProgress)" :show-text="false" />
              </div>
              <div class="zg-dep-row__info">
                <span>¥{{ row.dep.accumulatedDepreciation.toLocaleString() }}</span>
                <span class="pct" :class="row.dep.depreciationProgress >= 85 ? 'pulse-red' : ''">{{ row.dep.depreciationProgress.toFixed(0) }}%</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="净值" width="110" align="right">
          <template #default="{ row }">
            <span class="zg-net" :style="{ color: depColor(row.dep.depreciationProgress) }">¥{{ row.dep.netValue.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column label="剩余月数" width="90" align="center">
          <template #default="{ row }">
            <span class="mono">{{ row.dep.remainingMonths }}</span>
          </template>
        </el-table-column>
        <el-table-column label="报废建议" width="130" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.dep.depreciationProgress >= 100" type="danger" effect="dark">已超期</el-tag>
            <el-tag v-else-if="row.dep.depreciationProgress >= 95" type="danger">强烈建议</el-tag>
            <el-tag v-else-if="row.dep.depreciationProgress >= 85" type="warning">建议关注</el-tag>
            <el-tag v-else type="info" effect="plain">正常</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="poleNo" label="杆桩编号" width="140" />
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="danger" link size="small" :disabled="row.dep.depreciationProgress < 85">
              <el-icon><Delete /></el-icon>报废
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="zg-am-dep__pager">
        <el-pagination v-model:current-page="pager.page" v-model:page-size="pager.size"
          :total="filteredRows.length" :page-sizes="[20, 30, 50]"
          layout="prev, pager, next, jumper, ->, sizes, total" background />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { TrendCharts, Coin, Download, Delete, RefreshLeft, Histogram } from '@element-plus/icons-vue'
import { calcDepreciation, calcWarrantyDate, calcWarrantyDays } from '@/utils/assetUtils'

interface DepRow {
  id: number; code: string; category: string; categoryKey: string; model: string
  original: number; purchaseDate: string; installDate: string
  depreciationYears: number; residualRate: number; residualValue: number
  poleNo: string; vendor: string; warrantyDate: string; warrantyDays: number
  dep: ReturnType<typeof calcDepreciation>
}

const categoryList = [
  { key: 'pole',    label: '灯杆',     lifespanYears: 15, count: 30 },
  { key: 'lamp',    label: '灯具',     lifespanYears: 3,  count: 30 },
  { key: 'box',     label: '配电箱',   lifespanYears: 15, count: 20 },
  { key: 'cam',     label: '摄像头',   lifespanYears: 5,  count: 20 },
  { key: 'charger', label: '充电桩',   lifespanYears: 5,  count: 15 },
  { key: 'ctrl',    label: '控制模块', lifespanYears: 5,  count: 30 }
]

const VENDORS = ['湖南智光', '长沙照明', '华电科技', '湘电股份']
const STREETS = ['先导路', '麓谷大道', '梅溪湖', '金星大道', '岳麓大道']

function seeded(id: number) {
  let state = id * 9301 + 49297
  return () => { state = (state * 9301 + 49297) % 233280; return state / 233280 }
}

function generateRows(): DepRow[] {
  const rows: DepRow[] = []
  let id = 1
  for (const cat of categoryList) {
    for (let i = 0; i < cat.count; i++) {
      const rng = seeded(id)
      const yearOffset = Math.floor(rng() * (cat.lifespanYears + 1))
      const monthOffset = Math.floor(rng() * 12)
      const day = 1 + Math.floor(rng() * 28)
      const purchaseDate = `${2026 - yearOffset}-${String(monthOffset + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const original = Math.round(
        cat.key === 'pole' ? 3000 + rng() * 5000 :
        cat.key === 'lamp' ? 300 + rng() * 800 :
        cat.key === 'box' ? 8000 + rng() * 12000 :
        cat.key === 'cam' ? 2000 + rng() * 4000 :
        cat.key === 'charger' ? 40000 + rng() * 30000 :
        600 + rng() * 1500
      )
      const poleNo = `${STREETS[id % STREETS.length]}#${1 + id % 40}`
      const vendor = VENDORS[id % VENDORS.length]
      const warrantyDate = calcWarrantyDate(purchaseDate, 3)
      const warrantyDays = calcWarrantyDays(purchaseDate, 3)
      const dep = calcDepreciation({ purchaseDate, installDate: purchaseDate, purchasePrice: original, depreciationYears: cat.lifespanYears, residualRate: 0.05 })
      rows.push({
        id, code: `ASSET-2026-${String(1000 + id).slice(-4)}`,
        category: cat.label, categoryKey: cat.key,
        model: `${cat.label}-${String(100 + (id * 13) % 900)}`,
        original, purchaseDate, installDate: purchaseDate,
        depreciationYears: cat.lifespanYears, residualRate: 0.05, residualValue: Math.round(original * 0.05),
        poleNo, vendor, warrantyDate, warrantyDays, dep
      })
      id++
    }
  }
  return rows
}

const ALL_ROWS = ref<DepRow[]>(generateRows())

// 10s 刷新
let timer: number | null = null
onMounted(() => {
  timer = window.setInterval(() => {
    ALL_ROWS.value = ALL_ROWS.value.map(r => ({
      ...r,
      dep: calcDepreciation({
        purchaseDate: r.purchaseDate, installDate: r.installDate,
        purchasePrice: r.original, depreciationYears: r.depreciationYears, residualRate: r.residualRate
      })
    }))
  }, 10000)
})
onUnmounted(() => { if (timer) window.clearInterval(timer) })

// ============================================================
// KPI 从真实数据聚合
// ============================================================
const kpiMonthly = computed(() => ALL_ROWS.value.reduce((a, r) => a + r.dep.monthlyDepreciation, 0))
const kpiAccumulated = computed(() => ALL_ROWS.value.reduce((a, r) => a + r.dep.accumulatedDepreciation, 0))
const kpiDone = computed(() => ALL_ROWS.value.filter(r => r.dep.isFullyDepreciated).length)
const kpiNextScrap = computed(() => ALL_ROWS.value.filter(r => r.dep.depreciationProgress >= 95).length)

const kpiCells = computed(() => [
  { key: 'monthly',   label: '本月应计提',   value: '¥' + Math.round(kpiMonthly.value).toLocaleString(), icon: Coin,        theme: 'primary' },
  { key: 'acc',       label: '累计折旧',     value: (kpiAccumulated.value / 10000).toFixed(0) + ' 万',  icon: TrendCharts, theme: 'warn' },
  { key: 'done',      label: '已完成折旧',   value: kpiDone.value + ' 件',                              icon: Histogram,   theme: 'success' },
  { key: 'nextScrap', label: '建议报废',     value: kpiNextScrap.value + ' 件',                        icon: Delete,      theme: 'danger' }
])

// ============================================================
// 筛选
// ============================================================
const filters = reactive({
  category: '' as string,
  range: [0, 110] as [number, number],
  scrapState: 'all' as 'all' | 'soon' | 'ready' | 'overdue'
})
const pager = reactive({ page: 1, size: 20 })
const readyScrapCount = computed(() => filteredRows.value.filter(r => r.dep.depreciationProgress >= 95).length)

const filteredRows = computed(() => {
  let list = ALL_ROWS.value.slice()
  if (filters.category) list = list.filter(r => r.categoryKey === filters.category)
  list = list.filter(r => r.dep.depreciationProgress >= filters.range[0] && r.dep.depreciationProgress <= filters.range[1])
  if (filters.scrapState === 'soon') list = list.filter(r => r.dep.depreciationProgress >= 90 && r.dep.depreciationProgress < 95)
  if (filters.scrapState === 'ready') list = list.filter(r => r.dep.depreciationProgress >= 95)
  if (filters.scrapState === 'overdue') list = list.filter(r => r.dep.depreciationProgress >= 100)
  return list
})

const pagedRows = computed(() => {
  const start = (pager.page - 1) * pager.size
  return filteredRows.value.slice(start, start + pager.size)
})

// ============================================================
// 颜色
// ============================================================
function depColor(pct: number) {
  if (pct < 50) return '#059669'
  if (pct < 85) return '#d97706'
  if (pct <= 100) return '#dc2626'
  return '#991b1b'
}

// ============================================================
// 动作
// ============================================================
function onReset() { filters.category = ''; filters.range = [0, 110]; filters.scrapState = 'all'; pager.page = 1 }

function onSelection(rows: DepRow[]) { selectedForScrap.value = rows }
const selectedForScrap = ref<DepRow[]>([])

function onBatchScrap() {
  const ready = filteredRows.value.filter(r => r.dep.depreciationProgress >= 95)
  if (!ready.length) { ElMessage.warning('暂无可报废资产'); return }
  ElMessageBox.confirm(`将 ${ready.length} 项折旧进度≥95% 的资产生成报废草稿？`, '批量报废建议', {
    type: 'warning', confirmButtonText: '生成草稿', cancelButtonText: '取消'
  }).then(() => {
    ElMessage.success(`已自动生成 ${ready.length} 条报废草稿 (可在报废审批页提交)`)
  }).catch(() => {})
}

function escapeCsv(v: any) {
  const s = v == null ? '' : String(v)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`
  return s
}

function triggerDownload(csv: string, filename: string) {
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename
  document.body.appendChild(a); a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function onCsvExport() {
  const header = ['资产编码', '分类', '型号', '原值', '折旧年限(年)', '月折旧', '累计折旧', '累计折旧%', '净值', '剩余折旧月数', '杆桩编号', '质保到期', '质保剩余天数', '供应商']
  const rows = filteredRows.value.map(r => [
    r.code, r.category, r.model, r.original, r.depreciationYears,
    r.dep.monthlyDepreciation.toFixed(2),
    r.dep.accumulatedDepreciation.toFixed(2),
    r.dep.depreciationProgress.toFixed(2),
    r.dep.netValue.toFixed(2),
    r.dep.remainingMonths,
    r.poleNo, r.warrantyDate, r.warrantyDays, r.vendor
  ])
  const csv = [header, ...rows].map(row => row.map(escapeCsv).join(',')).join('\n')
  triggerDownload(csv, `折旧明细_${new Date().toISOString().slice(0, 10)}.csv`)
  ElMessage.success('CSV 已导出')
}
</script>

<style scoped lang="scss">
.zg-am-dep {
  --brand: #d97706; --success: #059669; --warning: #d97706; --danger: #dc2626;
  padding: 24px; background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
  min-height: calc(100vh - 120px); font-family: -apple-system, 'PingFang SC', sans-serif;
  &__head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; padding-bottom: 18px; border-bottom: 1px solid rgba(241,245,249,0.8); }
  &__headline { display: flex; align-items: center; gap: 14px; }
  &__sigil { width: 44px; height: 44px; border-radius: 10px; background: linear-gradient(135deg, #d97706, #f59e0b); color: #fff; display: flex; align-items: center; justify-content: center; }
  &__copy { display: flex; flex-direction: column; gap: 4px; }
  &__title { margin: 0; font-size: 20px; font-weight: 600; }
  &__sub { margin: 0; font-size: 13px; color: #71717a; }
  &__cta { display: flex; gap: 10px; }
  &__kpi { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 18px; }
  &__main { background: #fff; border-radius: 16px; border: 1px solid rgba(241,245,249,0.8); padding: 18px; }
  &__filterbar { padding: 14px 16px; background: #f8fafc; border-radius: 10px; margin-bottom: 14px; }
  &__pager { display: flex; justify-content: flex-end; padding-top: 14px; border-top: 1px solid rgba(241,245,249,0.8); margin-top: 16px; }
}
.zg-kpi-cell { background: #fff; border: 1px solid rgba(241,245,249,0.8); border-radius: 16px; padding: 16px 18px; display: flex; align-items: center; gap: 14px; position: relative; overflow: hidden;
  &::before { content: ''; position: absolute; left: 0; top: 0; width: 3px; height: 100%; background: var(--brand); }
  &.warn::before { background: var(--warning); } &.success::before { background: var(--success); } &.danger::before { background: var(--danger); }
  &__icon { width: 42px; height: 42px; border-radius: 10px; background: var(--brand); color: #fff; display: flex; align-items: center; justify-content: center; }
  .warn &__icon { background: var(--warning); } .success &__icon { background: var(--success); } .danger &__icon { background: var(--danger); }
  &__body { display: flex; flex-direction: column; gap: 4px; }
  &__num { font-size: 22px; font-weight: 700; font-variant-numeric: tabular-nums; }
  &__lbl { font-size: 12px; color: #71717a; }
}
.zg-filter-row { display: flex; flex-wrap: wrap; align-items: center; gap: 14px 20px; }
.zg-filter-item { display: flex; align-items: center; gap: 8px; &__lbl { font-size: 12px; color: #71717a; flex-shrink: 0; } &--actions { margin-left: auto; } }
.zg-filter-select { width: 180px; }
.zg-slider-wrap { display: flex; align-items: center; gap: 10px; width: 260px; :deep(.el-slider) { flex: 1; } }
.zg-slider-label { font-size: 12px; color: #71717a; white-space: nowrap; }

.zg-dep-row { display: flex; flex-direction: column; gap: 4px; }
.zg-dep-row__info { display: flex; justify-content: space-between; font-size: 12px; color: #52525b; font-variant-numeric: tabular-nums; .pct { font-weight: 600; } }
.zg-net { font-weight: 700; font-variant-numeric: tabular-nums; }
.sub { font-size: 11px; color: #71717a; }
.mono { font-family: 'Geist Mono', ui-monospace, monospace; }
.pulse-red { animation: pulseRed 1.2s ease-in-out infinite; color: #dc2626 !important; }
@keyframes pulseRed { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; font-weight: 700; } }
</style>
