<!--
  智光云枢 · 仓储库存盘点 · 总览（真仓位映射 + 低库存自动建议）
  业务域：warehouse
-->
<template>
  <section class="zg-wh-overview">
    <header class="zg-wh-overview__head">
      <div class="zg-wh-overview__headline">
        <div class="zg-wh-overview__sigil"><el-icon :size="22"><Goods /></el-icon></div>
        <div class="zg-wh-overview__copy">
          <h1 class="zg-wh-overview__title">仓储总览</h1>
          <p class="zg-wh-overview__sub">{{ warehouseStore.state.warehouses.length }} 个仓库 · {{ warehouseStore.state.skuCatalog.length }} SKU · 库存总价值 ¥{{ totalValue.toLocaleString() }}</p>
        </div>
      </div>
      <div class="zg-wh-overview__cta">
        <el-button type="primary"><el-icon><Plus /></el-icon>登记 SKU</el-button>
        <el-button @click="exportCsv"><el-icon><Download /></el-icon>导出盘点</el-button>
      </div>
    </header>

    <!-- ===== 5 KPI ===== -->
    <div class="zg-wh-overview__kpis">
      <div v-for="(k, i) in kpis" :key="k.label" class="zg-wh-overview__kpi" :class="{ 'is-danger': k.danger }">
        <div class="zg-wh-overview__kpi-icon" :style="{ background: k.iconBg }">
          <el-icon :size="18"><component :is="k.icon" /></el-icon>
        </div>
        <div class="zg-wh-overview__kpi-body">
          <div class="zg-wh-overview__kpi-num" :class="{ 'is-danger': k.danger }">{{ k.value }}</div>
          <div class="zg-wh-overview__kpi-label">{{ k.label }}</div>
        </div>
      </div>
    </div>

    <!-- ===== GIS + 3D 仓位 ===== -->
    <div class="zg-wh-overview__main">
      <!-- GIS 地图 -->
      <div class="zg-wh-overview__panel">
        <div class="zg-wh-overview__panel-head">
          <h3><el-icon><Position /></el-icon>仓库 GIS 分布</h3>
          <span class="zg-wh-overview__panel-sub">长沙市岳麓区 · {{ warehouseStore.state.warehouses.length }} 个库区</span>
        </div>

        <div class="zg-wh-overview__gis">
          <svg viewBox="0 0 500 320" class="zg-wh-overview__gis-svg" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="zg-gis-bg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#e0f2fe" />
                <stop offset="100%" stop-color="#fef3c7" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="500" height="320" fill="url(#zg-gis-bg)" rx="8" />
            <g stroke="#cbd5e1" stroke-width="1.5" fill="none" stroke-dasharray="4 3">
              <path d="M 20 120 Q 180 80 340 140 T 480 100" />
              <path d="M 80 20 Q 120 160 200 280" />
            </g>
            <text x="40" y="40" fill="#71717a" font-size="11" font-weight="600">岳麓区</text>
            <text x="380" y="280" fill="#71717a" font-size="11" font-weight="600">高新区</text>
            <g v-for="wh in warehouseGeo" :key="wh.id" class="zg-wh-overview__wh" @click="selectWarehouse(wh)">
              <circle :cx="wh.x" :cy="wh.y" :r="wh.r + 8" :fill="wh.color" opacity="0.2" class="zg-wh-overview__wh-pulse" />
              <circle :cx="wh.x" :cy="wh.y" :r="wh.r" :fill="wh.color" class="zg-wh-overview__wh-dot" />
              <circle :cx="wh.x" :cy="wh.y" :r="wh.r - 3" fill="#fff" />
              <text :x="wh.x" :y="wh.y + 22" text-anchor="middle" fill="#18181b" font-size="12" font-weight="600">{{ wh.name }}</text>
              <text :x="wh.x" :y="wh.y + 36" text-anchor="middle" fill="#71717a" font-size="10">¥{{ wh.value.toLocaleString() }}</text>
            </g>
          </svg>
          <div class="zg-wh-overview__gis-legend">
            <div v-for="wh in warehouseGeo" :key="wh.id" class="zg-wh-overview__gis-legend-item">
              <span class="dot" :style="{ background: wh.color }"></span>{{ wh.name }}
            </div>
          </div>
        </div>
      </div>

      <!-- 3D 仓位平面图（真实 cells 数据） -->
      <div class="zg-wh-overview__panel">
        <div class="zg-wh-overview__panel-head">
          <h3><el-icon><Grid /></el-icon>仓位平面图（{{ activeZone?.name || '货架A' }} · 点击查看详情）</h3>
          <el-select v-model="activeZoneId" size="small" style="width: 180px">
            <el-option v-for="z in zonesOfActiveWh" :key="z.id" :label="z.name" :value="z.id" />
          </el-select>
        </div>

        <div class="zg-wh-overview__rack-wrap">
          <div class="zg-wh-overview__rack">
            <div
              v-for="cell in rackCells"
              :key="cell.id"
              class="zg-wh-overview__cell"
              :class="cell.status"
              :title="cell.tooltip"
              @click="openCell(cell)"
            >
              <span v-if="cell.qty > 0" class="zg-wh-overview__cell-qty">{{ cell.qty }}</span>
            </div>
          </div>
          <div class="zg-wh-overview__rack-legend">
            <span class="item"><span class="sw sw--green"></span>有货 {{ legendGreen }}</span>
            <span class="item"><span class="sw sw--gray"></span>空 {{ legendGray }}</span>
            <span class="item"><span class="sw sw--yellow"></span>超储 {{ legendYellow }}</span>
            <span class="item"><span class="sw sw--orange"></span>低库存 {{ legendOrange }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== 低值预警（自动 suggestPurchase） ===== -->
    <div class="zg-wh-overview__alerts">
      <el-alert type="error" :closable="false" show-icon :title="`⚠️ 低库存预警（${warehouseStore.lowStockSuggestions.value.length} 项 · 来自 suggestPurchase 真计算）`" />
      <div class="zg-wh-overview__alert-list">
        <div v-for="a in warehouseStore.lowStockSuggestions.value" :key="a.sku" class="zg-wh-overview__alert-row">
          <span class="sku">{{ a.sku }}</span>
          <span class="desc">{{ warehouseStore.getSku(a.sku)?.desc }}</span>
          <el-tag :type="a.urgency === 'urgent' ? 'danger' : 'warning'" effect="dark" round size="small">{{ a.current }} / {{ Math.round(a.safetyStock) }}</el-tag>
          <span class="gap">缺口 {{ Math.round(a.safetyStock - a.current) }}</span>
          <span class="suggest">建议采购 <strong>{{ a.suggestQty }}</strong> 件</span>
          <el-button size="small" type="primary" link>立即补货</el-button>
        </div>
      </div>
    </div>

    <!-- ===== 仓位详情 Drawer ===== -->
    <el-drawer v-model="cellDrawerVisible" title="仓位详情" size="460px">
      <template v-if="selectedCell">
        <div class="zg-wh-overview__cell-detail">
          <h3>仓位 {{ selectedCell.id }}</h3>
          <div class="zg-wh-overview__cell-row"><span>SKU</span><span class="mono">{{ selectedCell.skuId }}</span></div>
          <div class="zg-wh-overview__cell-row"><span>描述</span><span>{{ warehouseStore.getSku(selectedCell.skuId)?.desc || '-' }}</span></div>
          <div class="zg-wh-overview__cell-row"><span>数量</span><span class="num">{{ selectedCell.qty }}</span></div>
          <div class="zg-wh-overview__cell-row"><span>批次号</span><span class="mono">{{ selectedCell.batchNo || '-' }}</span></div>
          <div class="zg-wh-overview__cell-row"><span>入库日期</span><span>{{ selectedCell.inboundDate || '-' }}</span></div>
          <div class="zg-wh-overview__cell-row"><span>资产编码</span><span class="mono">{{ selectedCell.assetCode || '未关联' }}</span></div>
        </div>
        <el-divider>批次追溯</el-divider>
        <el-timeline>
          <el-timeline-item
            v-for="rec in warehouseStore.traceBatch(selectedCell.batchNo || '')" :key="rec.id"
            :timestamp="rec.timestamp" :type="rec.type === 'inbound' ? 'success' : rec.type === 'outbound' ? 'warning' : 'info'"
          >
            <strong>{{ rec.type }}</strong> · {{ rec.skuId }} × {{ rec.qty }} · 操作人 {{ rec.operator }}
          </el-timeline-item>
          <el-empty v-if="!selectedCell.batchNo || warehouseStore.traceBatch(selectedCell.batchNo).length === 0" description="该批次暂无追溯记录" />
        </el-timeline>
      </template>
    </el-drawer>

    <!-- ===== 仓库详情 Drawer ===== -->
    <el-drawer v-model="whDrawerVisible" title="仓库详情" size="420px">
      <template v-if="selectedWarehouse">
        <div class="zg-wh-overview__wh-detail">
          <h3>{{ selectedWarehouse.name }}</h3>
          <div class="zg-wh-overview__wh-row"><span>类型</span><span>{{ selectedWarehouse.type }}</span></div>
          <div class="zg-wh-overview__wh-row"><span>区域数</span><span>{{ selectedWarehouse.zones?.length || 0 }}</span></div>
          <div class="zg-wh-overview__wh-row"><span>仓位数</span><span>{{ cellCount(selectedWarehouse) }}</span></div>
          <div class="zg-wh-overview__wh-row"><span>管理人员</span><span>{{ selectedWarehouse.mgr || '-' }}</span></div>
          <div class="zg-wh-overview__wh-row"><span>最后盘点</span><span>{{ selectedWarehouse.lastCheck || '-' }}</span></div>
        </div>
      </template>
    </el-drawer>
  </section>
</template>

<script setup>
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Goods, Plus, Download, Position, Grid } from '@element-plus/icons-vue'
import { warehouseStore } from '@/shared/stores/warehouseStore.js'

// ===== 主选中 =====
const activeWarehouseId = ref('WH001')
const activeZoneId = ref('A')
const activeWarehouse = computed(() => warehouseStore.getWarehouse(activeWarehouseId.value))
const zonesOfActiveWh = computed(() => activeWarehouse.value?.zones || [])

// ===== KPI =====
const totalValue = computed(() => {
  let v = 0
  for (const sku of warehouseStore.state.skuCatalog) {
    v += warehouseStore.getTotalStock(sku.sku) * sku.unitPrice
  }
  return Math.round(v)
})

const kpis = computed(() => [
  { label: 'SKU 总数', value: warehouseStore.state.skuCatalog.length, icon: Goods, iconBg: 'linear-gradient(135deg,#6366f1,#818cf8)' },
  { label: '库存总价值', value: '¥' + totalValue.value.toLocaleString(), icon: Goods, iconBg: 'linear-gradient(135deg,#06b6d4,#22d3ee)' },
  { label: '低于安全库存', value: warehouseStore.lowStockSuggestions.value.length + ' 种', icon: Goods, iconBg: 'linear-gradient(135deg,#dc2626,#ef4444)', danger: true },
  { label: '本月出入库记录', value: warehouseStore.state.stockRecords.length + ' 笔', icon: Goods, iconBg: 'linear-gradient(135deg,#f59e0b,#fbbf24)' },
  { label: '采购审批中', value: warehouseStore.state.purchaseOrders.filter(p => p.status !== 'received').length + ' 单', icon: Goods, iconBg: 'linear-gradient(135deg,#10b981,#34d399)' }
])

// ===== GIS 坐标映射 =====
const warehouseGeo = computed(() => {
  const map = {
    WH001: { x: 250, y: 160, r: 14, color: '#6366f1' },
    WH002: { x: 120, y: 220, r: 11, color: '#06b6d4' },
    WH003: { x: 380, y: 90, r: 10, color: '#a855f7' }
  }
  return warehouseStore.state.warehouses.map(wh => {
    const m = map[wh.id] || { x: 250, y: 160, r: 12, color: '#6366f1' }
    let val = 0
    for (const zone of wh.zones) for (const cell of zone.cells) {
      const sku = warehouseStore.getSku(cell.skuId)
      if (sku) val += cell.qty * sku.unitPrice
    }
    return { id: wh.id, name: wh.name, value: Math.round(val), ...m }
  })
})

// ===== 仓位 cells 网格 =====
const rackCells = computed(() => {
  const zone = zonesOfActiveWh.value.find(z => z.id === activeZoneId.value) || zonesOfActiveWh.value[0]
  const cells = zone?.cells || []
  const statuses = ['green', 'empty', 'empty', 'empty', 'green', 'orange', 'green', 'yellow']
  // 构造 24 个网格
  const arr = []
  for (let i = 0; i < 24; i++) {
    const c = cells[i]
    if (c) {
      const sku = warehouseStore.getSku(c.skuId)
      const skuInfo = sku ? `${sku.sku} ${sku.desc}` : c.skuId
      let status = 'green'
      const sk = warehouseStore.getSku(c.skuId)
      if (c.qty === 0) status = 'empty'
      else if (sk && c.qty > sk.safetyStock * 3) status = 'yellow'
      else if (sk && c.qty < sk.safetyStock * 0.4) status = 'orange'
      arr.push({ id: c.id, qty: c.qty, status, tooltip: `${skuInfo} · ${c.qty} 件 · 批次 ${c.batchNo || '-'}` })
    } else {
      arr.push({ id: `EMPTY-${i}`, qty: 0, status: 'empty', tooltip: '空仓位' })
    }
  }
  return arr
})

const legendGreen = computed(() => rackCells.value.filter(c => c.status === 'green').length)
const legendGray = computed(() => rackCells.value.filter(c => c.status === 'empty').length)
const legendYellow = computed(() => rackCells.value.filter(c => c.status === 'yellow').length)
const legendOrange = computed(() => rackCells.value.filter(c => c.status === 'orange').length)

// ===== 交互 =====
const whDrawerVisible = ref(false)
const selectedWarehouse = ref(null)
function selectWarehouse(wh) {
  selectedWarehouse.value = warehouseStore.getWarehouse(wh.id)
  activeWarehouseId.value = wh.id
  whDrawerVisible.value = true
  activeZoneId.value = zonesOfActiveWh.value[0]?.id || 'A'
}

const cellDrawerVisible = ref(false)
const selectedCell = ref(null)
function openCell(cell) {
  const zone = zonesOfActiveWh.value.find(z => z.id === activeZoneId.value)
  const real = zone?.cells.find(c => c.id === cell.id)
  selectedCell.value = real || cell
  cellDrawerVisible.value = true
}

function cellCount(wh) {
  return wh.zones?.reduce((acc, z) => acc + z.cells.length, 0) || 0
}

// ===== 30 秒刷新（模拟新的出入库）=====
let tickTimer = null
onMounted(() => {
  tickTimer = setInterval(() => {
    // 随机增减一个 cell
    const wh = warehouseStore.state.warehouses[0]
    const zone = wh.zones[0]
    const cell = zone.cells[Math.floor(Math.random() * zone.cells.length)]
    const delta = Math.random() > 0.5 ? 1 : -1
    const op = delta > 0 ? warehouseStore.inbound : warehouseStore.outbound
    op({
      skuId: cell.skuId,
      qty: Math.abs(delta),
      warehouseId: wh.id,
      zoneId: zone.id,
      cellId: cell.id,
      batchNo: cell.batchNo,
      operator: '定时巡检',
      relatedOrder: 'CRON-SIM'
    })
  }, 30000)
})
onUnmounted(() => { clearInterval(tickTimer) })

// ===== CSV =====
function exportCsv() {
  const rows = [['SKU', '描述', '总库存', '安全库存', '单价', '总价值']]
  for (const sku of warehouseStore.state.skuCatalog) {
    const qty = warehouseStore.getTotalStock(sku.sku)
    rows.push([sku.sku, sku.desc, qty, sku.safetyStock, sku.unitPrice, qty * sku.unitPrice])
  }
  const csv = '\ufeff' + rows.map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  const url = URL.createObjectURL(blob)
  a.href = url; a.download = `warehouse-overview-${new Date().toISOString().slice(0,10)}.csv`
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url)
  ElMessage.success('盘点 CSV 已导出')
}
</script>

<style lang="scss" scoped>
.zg-wh-overview {
  padding: var(--zg-space-6);
  background: var(--zg-gradient-surface);
  min-height: calc(100vh - 120px);

  &__head {
    display: flex; justify-content: space-between; align-items: center;
    padding-bottom: var(--zg-space-5); margin-bottom: var(--zg-space-5);
    border-bottom: 1px solid var(--zg-line-soft);
  }
  &__sigil { width: 44px; height: 44px; border-radius: var(--zg-radius-md); background: linear-gradient(135deg, #06b6d4, #22d3ee); color: #fff; display: flex; align-items: center; justify-content: center; }
  &__title { margin: 0; font-size: var(--zg-text-display-md); font-weight: 700; }
  &__sub { margin: 2px 0 0; font-size: var(--zg-text-body-sm); color: var(--zg-ink-tertiary); }

  &__kpis { display: grid; grid-template-columns: repeat(5, 1fr); gap: var(--zg-space-4); margin-bottom: var(--zg-space-5); }
  &__kpi {
    display: flex; gap: var(--zg-space-4); align-items: center;
    background: var(--zg-surface-card); border: 1px solid var(--zg-line-strong);
    border-radius: var(--zg-radius-lg); padding: var(--zg-space-4);
    box-shadow: var(--zg-shadow-card);
    &.is-danger { border-color: var(--zg-rose-danger); }
  }
  &__kpi-icon { width: 44px; height: 44px; border-radius: var(--zg-radius-md); color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  &__kpi-num { font-size: var(--zg-text-display-sm); font-weight: 800; font-family: var(--zg-font-mono); color: var(--zg-ink-primary); &.is-danger { color: var(--zg-rose-danger); } }
  &__kpi-label { font-size: var(--zg-text-caption); color: var(--zg-ink-tertiary); }

  &__main { display: grid; grid-template-columns: 1fr 1fr; gap: var(--zg-space-5); margin-bottom: var(--zg-space-5); }
  &__panel { background: var(--zg-surface-card); border: 1px solid var(--zg-line-strong); border-radius: var(--zg-radius-lg); padding: var(--zg-space-5); box-shadow: var(--zg-shadow-card); }
  &__panel-head { display: flex; justify-content: space-between; align-items: center; padding-bottom: var(--zg-space-3); margin-bottom: var(--zg-space-4); border-bottom: 1px solid var(--zg-line-soft); h3 { margin: 0; font-size: var(--zg-text-body); font-weight: 600; display: flex; gap: 6px; align-items: center; } }

  &__gis-svg { width: 100%; height: 280px; display: block; border-radius: var(--zg-radius-md); }
  &__wh-pulse { animation: breathe 2.2s ease-in-out infinite; transform-origin: center; }
  &__wh-dot { cursor: pointer; }
  .dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
  &__gis-legend { display: flex; gap: var(--zg-space-4); padding-top: var(--zg-space-3); }

  &__rack-wrap { text-align: center; }
  &__rack { display: flex; flex-wrap: wrap; gap: 4px; justify-content: center; padding: var(--zg-space-4); background: var(--zg-surface-muted); border-radius: var(--zg-radius-md); border: 1px solid var(--zg-line-soft); max-width: 400px; margin: 0 auto; }
  &__cell {
    width: 54px; height: 54px; border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700; font-family: var(--zg-font-mono);
    cursor: pointer; transition: transform var(--zg-transition-fast);
    &:hover { transform: scale(1.12); z-index: 5; position: relative; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
    &.green { background: var(--zg-emerald-soft); border: 1px solid var(--zg-emerald-success); color: var(--zg-emerald-success); }
    &.empty { background: #f1f5f9; border: 1px dashed #cbd5e1; color: transparent; }
    &.yellow { background: var(--zg-amber-soft); border: 1px solid var(--zg-amber-glow); color: var(--zg-amber-glow); }
    &.orange { background: #fed7aa; border: 1px solid #ea580c; color: #ea580c; animation: breathe 2s infinite; }
  }
  &__rack-legend { display: flex; justify-content: center; gap: var(--zg-space-4); margin-top: var(--zg-space-3); flex-wrap: wrap; font-size: var(--zg-text-caption); color: var(--zg-ink-secondary); }
  .sw { width: 12px; height: 12px; border-radius: 3px; display: inline-block; margin-right: 4px; &--green { background: var(--zg-emerald-success); } &--gray { background: #cbd5e1; border: 1px dashed #94a3b8; } &--yellow { background: var(--zg-amber-glow); } &--orange { background: #ea580c; } }

  &__alerts { background: var(--zg-surface-card); border: 1px solid var(--zg-line-strong); border-radius: var(--zg-radius-lg); padding: var(--zg-space-5); box-shadow: var(--zg-shadow-card); }
  &__alert-list { margin-top: var(--zg-space-3); display: flex; flex-direction: column; gap: var(--zg-space-2); }
  &__alert-row { display: flex; align-items: center; gap: var(--zg-space-3); padding: var(--zg-space-3); background: var(--zg-rose-50); border-radius: var(--zg-radius-md); border-left: 3px solid var(--zg-rose-danger); .sku { font-weight: 700; font-family: var(--zg-font-mono); min-width: 130px; } .desc { flex: 1; color: var(--zg-ink-secondary); font-size: var(--zg-text-body-sm); } .gap { font-size: var(--zg-text-caption); color: var(--zg-rose-danger); font-weight: 600; } .suggest { font-size: var(--zg-text-caption); color: var(--zg-amber-glow); } }

  // Drawer 详情
  &__cell-detail h3 { margin: 0 0 var(--zg-space-3); font-size: var(--zg-text-display-sm); font-weight: 700; }
  &__cell-row { display: flex; justify-content: space-between; padding: var(--zg-space-2) 0; border-bottom: 1px solid var(--zg-line-soft); font-size: var(--zg-text-body-sm); span:first-child { color: var(--zg-ink-tertiary); } .mono { font-family: var(--zg-font-mono); } .num { font-weight: 700; color: var(--zg-amber-glow); } }

  &__wh-detail h3 { margin: 0 0 var(--zg-space-4); font-size: var(--zg-text-display-sm); font-weight: 700; color: var(--zg-ink-primary); }
  &__wh-row { display: flex; justify-content: space-between; padding: var(--zg-space-2) 0; border-bottom: 1px solid var(--zg-line-soft); font-size: var(--zg-text-body-sm); span:first-child { color: var(--zg-ink-tertiary); } }
}
</style>
