<!--
  智光云枢 · 资产管控 · 资产总台账 (Phase 1)
  编码→QR→折旧→盘点→报废 全链路入口
  - 每 10s setInterval 实时更新累计折旧
  - 点击行 → Drawer 打开 AssetDetail
  - QR 图标按钮 + el-popover 显示二维码
  - 真实 CSV 导出 (UTF-8 BOM)
  - 批量报废 → 生成草稿
  - KPI 从 filteredAssets 实时聚合
-->
<template>
  <section class="zg-am-ledger">
    <header class="zg-am-ledger__head">
      <div class="zg-am-ledger__headline">
        <div class="zg-am-ledger__sigil"><el-icon :size="22"><House /></el-icon></div>
        <div class="zg-am-ledger__copy">
          <h1 class="zg-am-ledger__title">资产总台账</h1>
          <p class="zg-am-ledger__sub">
            城市照明资产全景账本 · 共 {{ kpiAgg.total.toLocaleString() }} 件 ·
            原值 ¥{{ (kpiAgg.original / 10000).toFixed(0) }}万 ·
            净值 ¥{{ (kpiAgg.net / 10000).toFixed(0) }}万 ·
            在役率 {{ kpiAgg.inServiceRate }}% ·
            本月 +{{ kpiAgg.addThisMonth }} / -{{ kpiAgg.scrapThisMonth }}
          </p>
        </div>
      </div>
      <div class="zg-am-ledger__cta">
        <el-button type="primary"><el-icon><Plus /></el-icon>新建资产登记</el-button>
        <el-dropdown trigger="click">
          <el-button plain><el-icon><Download /></el-icon>导出</el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item><el-icon><Document /></el-icon>导出 Excel</el-dropdown-item>
              <el-dropdown-item @click="onCsvExport"><el-icon><Files /></el-icon>导出 CSV</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>

    <!-- KPI 五卡 (从 filteredAssets 实时聚合) -->
    <div class="zg-am-ledger__kpi">
      <div v-for="cell in kpiCells" :key="cell.key" class="zg-kpi-cell" :class="cell.theme">
        <div class="zg-kpi-cell__icon"><el-icon :size="20"><component :is="cell.icon" /></el-icon></div>
        <div class="zg-kpi-cell__body">
          <span class="zg-kpi-cell__num">{{ cell.value }}</span>
          <span class="zg-kpi-cell__lbl">{{ cell.label }}</span>
        </div>
      </div>
    </div>

    <!-- 主体卡 -->
    <div class="zg-am-ledger__main">
      <!-- Tab 分类 -->
      <el-tabs v-model="activeCategory" class="zg-am-ledger__tabs">
        <el-tab-pane v-for="cat in allCategoryTabs" :key="cat.key" :name="cat.key">
          <template #label>
            <span class="zg-tab-label">
              <el-icon><component :is="cat.icon" /></el-icon>
              {{ cat.label }}
              <em class="zg-tab-count">{{ cat.count.toLocaleString() }}</em>
            </span>
          </template>
        </el-tab-pane>
      </el-tabs>

      <!-- 筛选条 -->
      <div class="zg-am-ledger__filterbar">
        <div class="zg-filter-row">
          <div class="zg-filter-item">
            <span class="zg-filter-item__lbl">分类</span>
            <el-select v-model="filters.categories" multiple collapse-tags collapse-tags-tooltip
              placeholder="全部" class="zg-filter-select">
              <el-option v-for="c in realCategoryTabs" :key="c.key" :label="c.label" :value="c.key" />
            </el-select>
          </div>
          <div class="zg-filter-item">
            <span class="zg-filter-item__lbl">状态</span>
            <el-select v-model="filters.statuses" multiple collapse-tags collapse-tags-tooltip
              placeholder="全部状态" class="zg-filter-select">
              <el-option v-for="s in statusList" :key="s.key" :label="s.label" :value="s.key" />
            </el-select>
          </div>
          <div class="zg-filter-item">
            <span class="zg-filter-item__lbl">折旧进度</span>
            <div class="zg-slider-wrap">
              <el-slider v-model="filters.depRange" range :max="110" :step="5" show-stops />
              <span class="zg-slider-label">{{ filters.depRange[0] }}% - {{ filters.depRange[1] }}%</span>
            </div>
          </div>
          <div class="zg-filter-item">
            <span class="zg-filter-item__lbl">质保到期</span>
            <el-radio-group v-model="filters.warrantyRange">
              <el-radio-button :value="0">全部</el-radio-button>
              <el-radio-button :value="30">30天</el-radio-button>
              <el-radio-button :value="60">60天</el-radio-button>
              <el-radio-button :value="90">90天</el-radio-button>
            </el-radio-group>
          </div>
          <div class="zg-filter-item">
            <span class="zg-filter-item__lbl">杆桩编号</span>
            <el-input v-model="filters.poleKeyword" placeholder="先导路#18 / LY-001" clearable
              class="zg-filter-input">
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
          </div>
          <div class="zg-filter-item zg-filter-item--actions">
            <el-button type="primary" @click="onFilterApply"><el-icon><Filter /></el-icon>筛选</el-button>
            <el-button @click="onFilterReset"><el-icon><RefreshLeft /></el-icon>重置</el-button>
          </div>
        </div>
      </div>

      <!-- 批量操作 + 视图切换 -->
      <div class="zg-am-ledger__actionbar">
        <div class="zg-actionbar__left">
          <span v-if="selectedRows.length" class="zg-selection-hint">已选 <strong>{{ selectedRows.length }}</strong> 项</span>
          <el-button type="primary" plain size="small" :disabled="!selectedRows.length" @click="onBatchExport">
            <el-icon><Download /></el-icon>批量导出
          </el-button>
          <el-button type="danger" plain size="small" :disabled="!selectedRows.length" @click="onBatchScrap">
            <el-icon><Delete /></el-icon>批量报废申请
          </el-button>
        </div>
        <div class="zg-actionbar__right">
          <el-radio-group v-model="viewMode">
            <el-radio-button value="table"><el-icon><List /></el-icon>表格</el-radio-button>
            <el-radio-button value="card"><el-icon><Grid /></el-icon>卡片</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <!-- 表格视图 -->
      <div v-show="viewMode === 'table'" class="zg-am-ledger__tablewrap">
        <el-table ref="tableRef" :data="pagedRows" stripe height="620"
          @selection-change="handleSelectionChange" @row-click="onRowClick">
          <el-table-column type="selection" width="48" align="center" />
          <el-table-column prop="code" label="资产编码" width="160" fixed="left">
            <template #default="{ row }">
              <span class="zg-asset-code">{{ row.code }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="category" label="分类" width="100" align="center">
            <template #default="{ row }">
              <el-tag size="small" type="info" effect="plain">{{ row.category }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="model" label="型号" width="170" show-overflow-tooltip />
          <el-table-column prop="statusKey" label="状态" width="110" align="center">
            <template #default="{ row }">
              <span class="zg-status-pill" :class="'zg-status-pill--' + row.statusKey">
                <i class="dot"></i>{{ row.statusLabel }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="purchaseDate" label="采购日期" width="110" />
          <el-table-column prop="installDate" label="安装日期" width="110" />
          <el-table-column prop="original" label="原值(元)" width="110" align="right">
            <template #default="{ row }">¥{{ row.original.toLocaleString() }}</template>
          </el-table-column>
          <el-table-column label="月折旧" width="110" align="right">
            <template #default="{ row }">¥{{ row.dep.monthlyDepreciation.toFixed(2) }}</template>
          </el-table-column>
          <el-table-column label="累计折旧" width="180">
            <template #default="{ row }">
              <div class="zg-dep-cell">
                <el-progress :percentage="Math.min(row.dep.depreciationProgress, 110)" :stroke-width="8"
                  :color="progressColor(row.dep.depreciationProgress)" />
                <span class="zg-dep-pct" :class="row.dep.depreciationProgress > 100 ? 'pulse-red' : ''">
                  {{ row.dep.depreciationProgress.toFixed(0) }}%
                </span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="净值" width="120" align="right">
            <template #default="{ row }">
              <span class="zg-net-value" :style="{ color: netValueColor(row.dep.depreciationProgress) }">
                ¥{{ row.dep.netValue.toLocaleString() }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="质保" width="110" align="center">
            <template #default="{ row }">
              <span v-if="row.warrantyDays < 0" class="zg-warranty zg-warranty--expired">已过期{{ -row.warrantyDays }}天</span>
              <span v-else-if="row.warrantyDays <= 30" class="zg-warranty zg-warranty--urgent">
                <span class="zg-warranty-pulse">{{ row.warrantyDays }}天</span>
              </span>
              <span v-else class="zg-warranty">{{ row.warrantyDays }}天</span>
            </template>
          </el-table-column>
          <el-table-column prop="poleNo" label="杆桩编号" width="140" />
          <el-table-column label="QR" width="80" align="center" fixed="right">
            <template #default="{ row }">
              <el-popover placement="bottom" width="170" trigger="click">
                <div class="zg-qr-popover">
                  <QRCode :asset-code="row.code" :size="150" />
                  <div class="zg-qr-popover__label">{{ row.code }}</div>
                  <div class="zg-qr-popover__actions">
                    <el-button size="small" @click="onDownloadSvg(row.code)">下载</el-button>
                    <el-button size="small" type="primary" plain @click="onPrintQr(row.code)">打印</el-button>
                  </div>
                </div>
                <template #reference>
                  <el-button link type="primary" :icon="View" title="查看二维码" />
                </template>
              </el-popover>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" align="center" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="onViewDetail(row)">详情</el-button>
              <el-button link size="small" :disabled="!canTrans(row.statusKey)" @click="onChangeStatus(row)">变更</el-button>
              <el-button type="danger" link size="small" :disabled="row.statusKey === 'scrapped'" @click="onApplyScrap(row)">报废</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 卡片视图 -->
      <div v-show="viewMode === 'card'" class="zg-am-ledger__cardgrid">
        <article v-for="row in pagedRows" :key="row.id" class="zg-assetcard" :class="'zg-assetcard--' + row.statusKey">
          <div class="zg-assetcard__head">
            <span class="zg-assetcard__code">{{ row.code }}</span>
            <span class="zg-status-pill zg-status-pill--sm" :class="'zg-status-pill--' + row.statusKey">
              <i class="dot"></i>{{ row.statusLabel }}
            </span>
          </div>
          <div class="zg-assetcard__body">
            <h4 class="zg-assetcard__title">{{ row.model }}</h4>
            <p class="zg-assetcard__meta">{{ row.category }} · {{ row.poleNo }}</p>
            <div class="zg-assetcard__dep">
              <el-progress :percentage="Math.min(row.dep.depreciationProgress, 110)" :stroke-width="6"
                :color="progressColor(row.dep.depreciationProgress)" :show-text="false" />
              <span>{{ row.dep.depreciationProgress.toFixed(0) }}%</span>
            </div>
          </div>
          <div class="zg-assetcard__foot">
            <span class="zg-assetcard__net" :style="{ color: netValueColor(row.dep.depreciationProgress) }">
              ¥{{ row.dep.netValue.toLocaleString() }}
            </span>
            <el-button type="primary" link size="small" @click="onViewDetail(row)">详情</el-button>
          </div>
        </article>
      </div>

      <!-- 分页 -->
      <div class="zg-am-ledger__pager">
        <el-pagination v-model:current-page="pager.page" v-model:page-size="pager.size"
          :total="filteredRows.length" :page-sizes="[15, 30, 50, 100]"
          layout="prev, pager, next, jumper, ->, sizes, total" background />
      </div>
    </div>

    <!-- 详情抽屉 -->
    <AssetDetail ref="detailRef" />
  </section>
</template>

<script setup lang="ts">
/**
 * 智光云枢 · 资产管控 · 资产总台账 (Phase 1)
 */
import { ref, reactive, computed, onMounted, onUnmounted, h } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  House, Cpu, Goods, Setting, Operation, View, Plus, Filter, Download,
  Warning, List, Grid, Search, RefreshLeft, Delete, Document, Files,
  Monitor, Coin, TrendCharts
} from '@element-plus/icons-vue'
import AssetDetail from './AssetDetail.vue'
import QRCode from '@/components/asset/QRCode.vue'
import {
  calcDepreciation, calcWarrantyDays, calcWarrantyDate,
  qrMatrixToSvg, generateQRM, canTransition as _canTrans,
  type AssetStatus
} from '@/utils/assetUtils'

// ============================================================
// 类型
// ============================================================
interface AssetRow {
  id: number
  code: string
  category: string
  categoryKey: string
  model: string
  statusKey: AssetStatus
  statusLabel: string
  purchaseDate: string
  installDate: string
  original: number
  depreciationYears: number
  residualRate: number
  warrantyYears: number
  poleNo: string
  vendor: string
  batch: string
  dep: ReturnType<typeof calcDepreciation>
  warrantyDays: number
  warrantyDate: string
}

// ============================================================
// 资产分类配置
// ============================================================
const realCategoryTabs: Array<{
  key: string
  label: string
  lifespanMonths: number
  icon: any
}> = [
  { key: 'pole',    label: '灯杆',     lifespanMonths: 15 * 12, icon: Setting   },
  { key: 'lamp',    label: '灯具',     lifespanMonths: 3 * 12,  icon: Goods     },
  { key: 'box',     label: '配电箱',   lifespanMonths: 15 * 12, icon: Cpu       },
  { key: 'cam',     label: '摄像头',   lifespanMonths: 5 * 12,  icon: Monitor   },
  { key: 'charger', label: '充电桩',   lifespanMonths: 5 * 12,  icon: Coin      },
  { key: 'ctrl',    label: '控制模块', lifespanMonths: 5 * 12,  icon: Operation }
]

const categoryCounts: Record<string, number> = {
  pole: 30, lamp: 30, box: 20, cam: 20, charger: 15, ctrl: 30
}

const allCategoryTabs = computed(() => {
  const total = Object.values(categoryCounts).reduce((a, b) => a + b, 0)
  return [
    { key: 'all', label: '全部', count: total, icon: House, lifespanMonths: 60 },
    ...realCategoryTabs.map(c => ({ ...c, count: categoryCounts[c.key] }))
  ]
})

const statusList = computed(() => ([
  { key: 'idle',        label: '闲置' },
  { key: 'installing',  label: '安装中' },
  { key: 'inService',   label: '在役' },
  { key: 'repairing',   label: '维修中' },
  { key: 'scrapped',    label: '已报废' },
  { key: 'recycled',    label: '已回收' }
]))

// ============================================================
// Mock 数据生成（确定性，直接用真实 calcDepreciation）
// ============================================================
const STREETS = ['先导路', '麓谷大道', '梅溪湖', '金星大道', '岳麓大道', '湘江路', '天心大道', '芙蓉路', '开福大道', '雨花大道']
const POLE_MODES = ['P-014', 'P-025', 'P-036', 'P-048', 'P-060']
const LAMP_MODES = ['LED-80W-CW', 'LED-100W-NW', 'LED-120W-WW', 'LED-60W-CW', 'LED-150W-WW']
const BOX_MODES = ['DBX-400V-25A', 'DBX-400V-63A', 'DBX-220V-16A']
const CAM_MODES = ['CAM-HD1080-I', 'CAM-4K-PRO', 'CAM-PTZ-20X']
const CHARGER_MODES = ['DC-60KW', 'DC-120KW', 'AC-22KW']
const CTRL_MODES = ['ZGSQ-CTRL-V3', 'ZGSQ-CTRL-V4', 'ZGSQ-CTRL-V5']
const VENDORS = ['湖南智光', '长沙照明', '华电科技', '湘电股份', '中电建']
const BATCH = 'BATCH-20260815-001'

function seeded(id: number) {
  let state = id * 9301 + 49297
  return () => {
    state = (state * 9301 + 49297) % 233280
    return state / 233280
  }
}

function generateAssetList(): AssetRow[] {
  const statusKeyPool: AssetStatus[] = ['inService', 'inService', 'inService', 'inService', 'inService', 'inService', 'repairing', 'idle', 'scrapped']
  const labelMap: Record<AssetStatus, string> = {
    idle: '闲置', installing: '安装中', inService: '在役',
    repairing: '维修中', scrapped: '已报废', recycled: '已回收'
  }
  const list: AssetRow[] = []
  let globalId = 1

  for (const cat of realCategoryTabs) {
    const count = categoryCounts[cat.key] || 0
    let modes: string[] = []
    if (cat.key === 'pole') modes = POLE_MODES
    else if (cat.key === 'lamp') modes = LAMP_MODES
    else if (cat.key === 'box') modes = BOX_MODES
    else if (cat.key === 'cam') modes = CAM_MODES
    else if (cat.key === 'charger') modes = CHARGER_MODES
    else modes = CTRL_MODES

    for (let i = 0; i < count; i++) {
      const rng = seeded(globalId)
      const statusKey = statusKeyPool[Math.floor(rng() * statusKeyPool.length)]
      const yearOffset = Math.floor(rng() * 6)
      const monthOffset = Math.floor(rng() * 12)
      const day = 1 + Math.floor(rng() * 28)
      const purchaseYear = 2026 - yearOffset
      const purchaseDate = `${purchaseYear}-${String(monthOffset + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const installDate = purchaseDate
      const original = Math.round(
        cat.key === 'pole' ? (3000 + rng() * 5000) :
        cat.key === 'lamp' ? (300 + rng() * 800) :
        cat.key === 'box' ? (8000 + rng() * 12000) :
        cat.key === 'cam' ? (2000 + rng() * 4000) :
        cat.key === 'charger' ? (40000 + rng() * 30000) :
        (600 + rng() * 1500)
      )
      const lifespanMonths = cat.lifespanMonths
      const depYears = Math.max(1, Math.round(lifespanMonths / 12))
      const street = STREETS[Math.floor(rng() * STREETS.length)]
      const poleIndex = 1 + Math.floor(rng() * 60)
      const poleNo = `${street}#${poleIndex}`
      const vendor = VENDORS[Math.floor(rng() * VENDORS.length)]
      const model = modes[Math.floor(rng() * modes.length)]

      const dep = calcDepreciation({
        purchaseDate, installDate,
        purchasePrice: original,
        depreciationYears: depYears,
        residualRate: 0.05
      })
      const warrantyDays = calcWarrantyDays(purchaseDate, 3)
      const warrantyDate = calcWarrantyDate(purchaseDate, 3)

      list.push({
        id: globalId,
        code: `ASSET-2026-${String(1000 + globalId).slice(-4)}`,
        category: cat.label,
        categoryKey: cat.key,
        model,
        statusKey,
        statusLabel: labelMap[statusKey],
        purchaseDate,
        installDate,
        original,
        depreciationYears: depYears,
        residualRate: 0.05,
        warrantyYears: 3,
        poleNo,
        vendor,
        batch: BATCH,
        dep,
        warrantyDays,
        warrantyDate
      })
      globalId++
    }
  }
  return list
}

const ALL_ASSETS = ref<AssetRow[]>(generateAssetList())

// ============================================================
// 状态
// ============================================================
const activeCategory = ref('all')
const viewMode = ref<'table' | 'card'>('table')
const selectedRows = ref<AssetRow[]>([])
const tableRef = ref()
const detailRef = ref()

const filters = reactive({
  categories: [] as string[],
  statuses: [] as string[],
  depRange: [0, 110] as [number, number],
  warrantyRange: 0 as number,
  poleKeyword: '',
  applied: {
    categories: [] as string[],
    statuses: [] as string[],
    depRange: [0, 110] as [number, number],
    warrantyRange: 0 as number,
    poleKeyword: ''
  }
})
const pager = reactive({ page: 1, size: 30 })

// ============================================================
// 10s setInterval 折旧刷新
// ============================================================
let depTimer: number | null = null
function startDepTimer() {
  depTimer = window.setInterval(() => {
    // 实时刷新累计折旧，模拟时间流逝
    ALL_ASSETS.value = ALL_ASSETS.value.map(a => ({
      ...a,
      dep: calcDepreciation({
        purchaseDate: a.purchaseDate, installDate: a.installDate,
        purchasePrice: a.original,
        depreciationYears: a.depreciationYears,
        residualRate: a.residualRate
      }),
      warrantyDays: calcWarrantyDays(a.purchaseDate, a.warrantyYears),
      warrantyDate: calcWarrantyDate(a.purchaseDate, a.warrantyYears)
    }))
  }, 10000)
}
onMounted(() => startDepTimer())
onUnmounted(() => {
  if (depTimer) window.clearInterval(depTimer)
})

// ============================================================
// 筛选后
// ============================================================
const filteredRows = computed(() => {
  const f = filters.applied
  let list = ALL_ASSETS.value.slice()
  if (activeCategory.value !== 'all') {
    list = list.filter(r => r.categoryKey === activeCategory.value)
  }
  if (f.categories.length) list = list.filter(r => f.categories.includes(r.categoryKey))
  if (f.statuses.length) list = list.filter(r => f.statuses.includes(r.statusKey))
  list = list.filter(r => r.dep.depreciationProgress >= f.depRange[0] && r.dep.depreciationProgress <= f.depRange[1])
  if (f.warrantyRange > 0) list = list.filter(r => r.warrantyDays >= 0 && r.warrantyDays <= f.warrantyRange)
  if (f.poleKeyword.trim()) {
    const kw = f.poleKeyword.trim().toLowerCase()
    list = list.filter(r =>
      r.poleNo.toLowerCase().includes(kw) ||
      r.code.toLowerCase().includes(kw) ||
      r.model.toLowerCase().includes(kw)
    )
  }
  return list
})

const pagedRows = computed(() => {
  const start = (pager.page - 1) * pager.size
  return filteredRows.value.slice(start, start + pager.size)
})

// ============================================================
// KPI 聚合（从 filteredRows）
// ============================================================
const kpiAgg = computed(() => {
  const rows = filteredRows.value
  const total = rows.length
  const original = rows.reduce((a, r) => a + r.original, 0)
  const net = rows.reduce((a, r) => a + r.dep.netValue, 0)
  const inService = rows.filter(r => r.statusKey === 'inService').length
  const inServiceRate = total === 0 ? 0 : Math.round((inService / total) * 1000) / 10
  // 本月新增 / 报废：基于采购日期 / 状态 + 日期
  const now = new Date()
  const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const addThisMonth = rows.filter(r => r.purchaseDate.startsWith(yearMonth)).length
  const scrapThisMonth = rows.filter(r => r.statusKey === 'scrapped' || r.statusKey === 'recycled').length
  return { total, original, net, inServiceRate, addThisMonth, scrapThisMonth }
})

const kpiCells = computed(() => [
  { key: 'total',    label: '资产总数',        value: kpiAgg.value.total.toLocaleString(), icon: House,       theme: '' },
  { key: 'original', label: '原值 (万元)',     value: (kpiAgg.value.original / 10000).toFixed(0), icon: Coin, theme: 'primary' },
  { key: 'net',      label: '净值 (万元)',     value: (kpiAgg.value.net / 10000).toFixed(0), icon: TrendCharts,  theme: 'success' },
  { key: 'rate',     label: '在役率',          value: kpiAgg.value.inServiceRate + '%',     icon: Monitor,     theme: 'info' },
  { key: 'monthly',  label: '本月新增 / 报废',  value: `+${kpiAgg.value.addThisMonth} / -${kpiAgg.value.scrapThisMonth}`, icon: Warning, theme: 'warn' }
])

// ============================================================
// 筛选控制
// ============================================================
function onFilterApply() {
  filters.applied = {
    categories: [...filters.categories],
    statuses: [...filters.statuses],
    depRange: [...filters.depRange] as [number, number],
    warrantyRange: filters.warrantyRange,
    poleKeyword: filters.poleKeyword
  }
  pager.page = 1
  ElMessage.success('筛选已应用')
}
function onFilterReset() {
  filters.categories = []
  filters.statuses = []
  filters.depRange = [0, 110]
  filters.warrantyRange = 0
  filters.poleKeyword = ''
  filters.applied = { categories: [], statuses: [], depRange: [0, 110], warrantyRange: 0, poleKeyword: '' }
  pager.page = 1
  ElMessage.info('已重置筛选条件')
}

// ============================================================
// 选中变化
// ============================================================
function handleSelectionChange(rows: AssetRow[]) {
  selectedRows.value = rows
}

// ============================================================
// 颜色工具
// ============================================================
function progressColor(pct: number) {
  if (pct < 50) return 'linear-gradient(135deg,#059669,#10b981)'
  if (pct < 85) return 'linear-gradient(135deg,#d97706,#f59e0b)'
  if (pct <= 100) return 'linear-gradient(135deg,#dc2626,#ef4444)'
  return 'linear-gradient(135deg,#991b1b,#dc2626)'
}
function netValueColor(pct: number) {
  if (pct < 40) return '#059669'
  if (pct < 75) return '#d97706'
  return '#dc2626'
}
function canTrans(s: AssetStatus) {
  return s !== 'scrapped' && s !== 'recycled'
}

// ============================================================
// 动作
// ============================================================
function onRowClick(row: AssetRow) { detailRef.value?.open(row) }
function onViewDetail(row: AssetRow) { detailRef.value?.open(row) }

function onChangeStatus(row: AssetRow) {
  ElMessageBox.prompt('请输入备注', '变更状态：' + row.code, {
    confirmButtonText: '提交', cancelButtonText: '取消',
    inputValue: '状态变更处理中'
  }).then(() => { ElMessage.success('状态变更已提交') }).catch(() => {})
}

function onApplyScrap(row: AssetRow) {
  ElMessageBox.confirm(`确认对 ${row.code}（${row.model}）发起报废申请？`, '报废申请', {
    type: 'warning', confirmButtonText: '确认申请', cancelButtonText: '取消'
  }).then(() => { ElMessage.success('报废申请已提交，等待审批') }).catch(() => {})
}

function onBatchExport() {
  onCsvExport()
}

function onBatchScrap() {
  if (!selectedRows.value.length) return
  ElMessageBox.confirm(`确认对 ${selectedRows.value.length} 项资产批量发起报废申请？`, '批量报废', {
    type: 'warning', confirmButtonText: '确认', cancelButtonText: '取消'
  }).then(() => {
    ElMessage.success(`已生成 ${selectedRows.value.length} 条报废草稿，可在报废审批页查看`)
  }).catch(() => {})
}

// ============================================================
// CSV 真导出
// ============================================================
function escapeCsv(v: any): string {
  const s = v == null ? '' : String(v)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}
function triggerDownload(csv: string, filename: string) {
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
function onCsvExport() {
  const header = [
    '资产编码', '分类', '型号', '状态', '采购日期', '安装日期',
    '原值', '月折旧', '累计折旧', '累计折旧%', '净值', '剩余折旧月数',
    '质保到期', '质保剩余天数', '杆桩编号', '供应商', '批次'
  ]
  const rows = filteredRows.value.map(r => [
    r.code, r.category, r.model, r.statusLabel,
    r.purchaseDate, r.installDate,
    r.original,
    r.dep.monthlyDepreciation.toFixed(2),
    r.dep.accumulatedDepreciation.toFixed(2),
    r.dep.depreciationProgress.toFixed(2),
    r.dep.netValue.toFixed(2),
    r.dep.remainingMonths,
    r.warrantyDate, r.warrantyDays,
    r.poleNo, r.vendor, r.batch
  ])
  const csv = [header, ...rows].map(row => row.map(escapeCsv).join(',')).join('\n')
  triggerDownload(csv, `资产台账_${new Date().toISOString().slice(0, 10)}.csv`)
  ElMessage.success('CSV 已导出')
}

// ============================================================
// QR 下载 / 打印
// ============================================================
function onDownloadSvg(code: string) {
  const svg = qrMatrixToSvg(generateQRM(code, 25), 6)
  const blob = new Blob([svg], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${code}.svg`
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  ElMessage.success('SVG 已下载')
}
function onPrintQr(code: string) {
  const svg = qrMatrixToSvg(generateQRM(code, 25), 8)
  const w = window.open('', '_blank')
  if (!w) return
  w.document.write(`<html><head><title>${code}</title><style>body{display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:monospace;color:#1e293b}div{text-align:center}p{font-size:12px;color:#64748b;margin-top:8px}</style></head><body><div>${svg}<p>${code}</p></div></body></html>`)
  w.document.close()
  setTimeout(() => w.print(), 300)
}
</script>

<style scoped lang="scss">
.zg-am-ledger {
  --zg-brand-primary: var(--zg-amber-glow, #d97706);
  --zg-success: var(--zg-emerald-success, #059669);
  --zg-warning: var(--zg-amber-glow, #d97706);
  --zg-danger: var(--zg-rose-danger, #dc2626);
  --zg-info: var(--zg-sky-info, #0284c7);
  --zg-success-soft: var(--zg-emerald-soft, #d1fae5);
  --zg-warning-soft: var(--zg-amber-soft, #fef3c7);
  --zg-danger-soft: var(--zg-rose-soft, #fee2e2);
  --zg-info-soft: var(--zg-sky-soft, #e0f2fe);
  --zg-line-soft: rgba(241,245,249,0.8);
  --zg-line-strong: rgba(226,232,240,0.6);
  --zg-ink-primary: #18181b;
  --zg-ink-secondary: #52525b;
  --zg-ink-tertiary: #71717a;
  --zg-surface-card: #ffffff;
  --zg-surface-muted: #f8fafc;
  --zg-gradient-surface: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
  --zg-gradient-primary: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
  --zg-radius-sm: 6px;
  --zg-radius-md: 10px;
  --zg-radius-lg: 16px;
  --zg-radius-pill: 999px;
  padding: 24px;
  background: var(--zg-gradient-surface);
  min-height: calc(100vh - 120px);

  &__head {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 20px; padding-bottom: 18px; border-bottom: 1px solid var(--zg-line-soft);
  }
  &__headline { display: flex; align-items: center; gap: 14px; }
  &__sigil {
    width: 44px; height: 44px; border-radius: var(--zg-radius-md);
    background: var(--zg-gradient-primary); color: #fff;
    display: flex; align-items: center; justify-content: center;
  }
  &__copy { display: flex; flex-direction: column; gap: 4px; }
  &__title { font-size: 20px; font-weight: 600; margin: 0; }
  &__sub { font-size: 13px; color: var(--zg-ink-tertiary); margin: 0; }
  &__cta { display: flex; gap: 10px; }

  &__kpi {
    display: grid; grid-template-columns: repeat(5, 1fr);
    gap: 14px; margin-bottom: 18px;
  }
  &__main {
    background: var(--zg-surface-card);
    border-radius: var(--zg-radius-lg);
    border: 1px solid var(--zg-line-soft);
    padding: 18px;
  }
  &__tabs { margin-bottom: 16px; }
  &__filterbar {
    padding: 14px 16px; background: var(--zg-surface-muted);
    border-radius: var(--zg-radius-md); margin-bottom: 14px;
  }
  &__actionbar {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 14px; gap: 12px; flex-wrap: wrap;
  }
  &__tablewrap { border: 1px solid var(--zg-line-soft); border-radius: var(--zg-radius-md); overflow: hidden; }
  &__cardgrid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px; min-height: 300px;
  }
  &__pager {
    display: flex; justify-content: flex-end;
    padding-top: 14px; border-top: 1px solid var(--zg-line-soft); margin-top: 16px;
  }
}

.zg-kpi-cell {
  background: #fff; border: 1px solid var(--zg-line-soft);
  border-radius: var(--zg-radius-lg); padding: 16px 18px;
  display: flex; align-items: center; gap: 14px;
  box-shadow: 0 1px 3px rgba(15,23,42,0.04);
  transition: all 250ms cubic-bezier(0.4,0,0.2,1);
  position: relative; overflow: hidden;
  &:hover { transform: translateY(-2px); box-shadow: 0 8px 24px -8px rgba(15,23,42,0.12); }
  &::before { content: ''; position: absolute; left: 0; top: 0; width: 3px; height: 100%; background: var(--zg-brand-primary); }
  &.success::before { background: var(--zg-success); }
  &.info::before    { background: var(--zg-info); }
  &.warn::before    { background: var(--zg-warning); }
  &__icon {
    width: 42px; height: 42px; border-radius: var(--zg-radius-md);
    background: var(--zg-brand-primary); color: #fff;
    display: flex; align-items: center; justify-content: center;
  }
  .success &__icon { background: var(--zg-success); }
  .info    &__icon { background: var(--zg-info); }
  .warn    &__icon { background: var(--zg-warning); }
  &__body { display: flex; flex-direction: column; gap: 4px; }
  &__num { font-size: 22px; font-weight: 700; line-height: 1.1; font-variant-numeric: tabular-nums; }
  &__lbl { font-size: 12px; color: var(--zg-ink-tertiary); }
}

.zg-tab-label {
  display: inline-flex; align-items: center; gap: 6px;
  .zg-tab-count {
    font-style: normal; font-size: 11px; padding: 1px 7px;
    background: #fffbeb; color: var(--zg-brand-primary);
    border-radius: var(--zg-radius-pill); font-weight: 500;
  }
}

.zg-filter-row { display: flex; flex-wrap: wrap; align-items: center; gap: 14px 20px; }
.zg-filter-item {
  display: flex; align-items: center; gap: 8px;
  &__lbl { font-size: 12px; color: var(--zg-ink-tertiary); flex-shrink: 0; }
  &--actions { margin-left: auto; }
}
.zg-filter-select { width: 180px; }
.zg-filter-input { width: 200px; }
.zg-slider-wrap { display: flex; align-items: center; gap: 10px; width: 280px; }
.zg-slider-wrap :deep(.el-slider) { flex: 1; }
.zg-slider-label { font-size: 12px; color: var(--zg-ink-tertiary); white-space: nowrap; min-width: 90px; }

.zg-actionbar__left, .zg-actionbar__right { display: flex; align-items: center; gap: 10px; }
.zg-selection-hint {
  font-size: 13px; color: var(--zg-ink-secondary);
  strong { color: var(--zg-brand-primary); margin: 0 3px; }
}

.zg-asset-code { font-family: 'Geist Mono', ui-monospace, monospace; font-size: 12px; font-weight: 600; }

.zg-status-pill {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 12px; padding: 2px 10px; border-radius: var(--zg-radius-pill);
  font-weight: 500;
  .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
  &--sm { padding: 2px 8px; font-size: 11px; }
  &--idle       { color: var(--zg-info); background: var(--zg-info-soft); }
  &--installing { color: var(--zg-info); background: var(--zg-info-soft); }
  &--inService  { color: var(--zg-success); background: var(--zg-success-soft); }
  &--repairing  { color: var(--zg-warning); background: var(--zg-warning-soft); }
  &--scrapped   { color: var(--zg-danger); background: var(--zg-danger-soft); }
  &--recycled   { color: var(--zg-ink-tertiary); background: #f1f5f9; }
}

.zg-dep-cell { display: flex; align-items: center; gap: 10px; }
.zg-dep-pct { font-size: 12px; color: var(--zg-ink-secondary); font-variant-numeric: tabular-nums; min-width: 42px; text-align: right; }
.zg-dep-pct.pulse-red { color: #dc2626; animation: depPulse 1.2s ease-in-out infinite; }
@keyframes depPulse {
  0%, 100% { opacity: 1; font-weight: 700; }
  50% { opacity: 0.6; font-weight: 500; }
}

.zg-net-value { font-weight: 700; font-variant-numeric: tabular-nums; }

.zg-warranty { font-size: 12px; font-weight: 500; font-variant-numeric: tabular-nums; }
.zg-warranty--urgent { color: var(--zg-warning); }
.zg-warranty--expired { color: var(--zg-danger); }
.zg-warranty-pulse { animation: wrPulse 1.5s ease-in-out infinite; display: inline-block; }
@keyframes wrPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.zg-qr-popover { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.zg-qr-popover__label { font-family: monospace; font-size: 11px; color: var(--zg-ink-tertiary); }
.zg-qr-popover__actions { display: flex; gap: 6px; }

.zg-assetcard {
  background: #fff; border: 1px solid var(--zg-line-soft);
  border-radius: var(--zg-radius-lg); padding: 16px;
  transition: all 250ms cubic-bezier(0.4,0,0.2,1);
  display: flex; flex-direction: column; gap: 10px;
  border-left: 3px solid #cbd5e1;
  &:hover { transform: translateY(-2px); box-shadow: 0 8px 24px -8px rgba(15,23,42,0.12); border-color: var(--zg-brand-primary); }
  &--scrapped { opacity: 0.7; border-left-color: var(--zg-danger); }
  &--recycled { opacity: 0.7; border-left-color: var(--zg-ink-tertiary); }
  &--repairing { border-left-color: var(--zg-warning); }
  &--inService { border-left-color: var(--zg-success); }
  &--installing { border-left-color: var(--zg-info); }
  &--idle { border-left-color: var(--zg-ink-tertiary); }
  &__head { display: flex; justify-content: space-between; align-items: center; }
  &__code { font-family: monospace; font-size: 12px; color: var(--zg-ink-tertiary); }
  &__title { margin: 0; font-size: 14px; font-weight: 600; }
  &__meta { margin: 0; font-size: 12px; color: var(--zg-ink-tertiary); }
  &__dep { display: flex; align-items: center; gap: 10px;
    span { font-size: 11px; color: var(--zg-ink-tertiary); min-width: 36px; text-align: right; }
  }
  &__foot { display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px dashed var(--zg-line-soft); }
  &__net { font-weight: 700; font-variant-numeric: tabular-nums; }
}
</style>
