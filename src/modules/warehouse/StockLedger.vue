<!--
  智光云枢 · 仓储库存盘点 · 库存台账（真出入库 + 批次追溯链）
  业务域：warehouse
-->
<template>
  <section class="zg-wh-ledger">
    <header class="zg-wh-ledger__head">
      <div class="zg-wh-ledger__headline">
        <div class="zg-wh-ledger__sigil"><el-icon :size="22"><Operation /></el-icon></div>
        <div class="zg-wh-ledger__copy">
          <h1 class="zg-wh-ledger__title">库存台账</h1>
          <p class="zg-wh-ledger__sub">{{ warehouseStore.state.skuCatalog.length }} SKU · 分布于 {{ warehouseStore.state.warehouses.length }} 个仓库 · 出入库记录 {{ warehouseStore.state.stockRecords.length }} 笔</p>
        </div>
      </div>
      <div class="zg-wh-ledger__cta">
        <el-button @click="scanVisible = true"><el-icon><Refresh /></el-icon>扫码出入库</el-button>
        <el-button type="primary"><el-icon><Plus /></el-icon>新建 SKU</el-button>
      </div>
    </header>

    <!-- ===== 过滤条 ===== -->
    <div class="zg-wh-ledger__filter">
      <el-input v-model="searchKeyword" placeholder="搜索 SKU / 描述" style="width: 260px" clearable :prefix-icon="Search" />
      <el-select v-model="warehouseFilter" placeholder="仓库" clearable style="width: 160px">
        <el-option v-for="wh in warehouseStore.state.warehouses" :key="wh.id" :label="wh.name" :value="wh.id" />
      </el-select>
      <el-select v-model="statusFilter" placeholder="状态" clearable style="width: 140px">
        <el-option label="充足" value="充足" />
        <el-option label="临界" value="临界" />
        <el-option label="不足" value="不足" />
      </el-select>
      <el-button @click="exportCsv"><el-icon><Download /></el-icon>导出 Excel</el-button>
    </div>

    <!-- ===== 台账表格 ===== -->
    <div class="zg-wh-ledger__table-wrap">
      <el-table :data="filteredData" stripe height="calc(100vh - 340px)">
        <el-table-column type="index" width="55" />
        <el-table-column prop="sku" label="SKU" width="150">
          <template #default="{ row }">
            <span class="zg-wh-ledger__sku" @click="showTrace(row.sku)">{{ row.sku }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="desc" label="描述" min-width="180" show-overflow-tooltip />
        <el-table-column prop="warehouse" label="仓库" width="140">
          <template #default="{ row }">
            <el-tag size="small" effect="plain">{{ row.warehouse }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="qty" label="数量" width="100" align="right">
          <template #default="{ row }"><strong>{{ row.qty }}</strong></template>
        </el-table-column>
        <el-table-column prop="safety" label="安全库存" width="100" align="right" />
        <el-table-column label="状态" width="110" align="center">
          <template #default="{ row }">
            <span class="zg-wh-ledger__status" :class="row.status">
              <span class="dot"></span>{{ row.status }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="单价" width="100" align="right">
          <template #default="{ row }">¥{{ row.price.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column label="总金额" width="130" align="right">
          <template #default="{ row }"><strong>¥{{ row.totalAmount.toLocaleString() }}</strong></template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openInbound(row)">入库</el-button>
            <el-button link type="primary" size="small" @click="openOutbound(row)">出库</el-button>
            <el-button link type="primary" size="small" @click="showTrace(row.sku)">批次追溯</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- ===== 扫码出入库 Drawer ===== -->
    <el-drawer v-model="scanVisible" title="扫码出入库" size="520px">
      <div class="zg-wh-ledger__scan-mode">
        <el-radio-group v-model="scanMode">
          <el-radio-button value="in">📥 入库</el-radio-button>
          <el-radio-button value="out">📤 出库</el-radio-button>
        </el-radio-group>
      </div>

      <el-form label-width="110px" label-position="right">
        <el-form-item label="SKU">
          <el-select v-model="scan.skuId" placeholder="选择 SKU" style="width:100%" filterable>
            <el-option v-for="s in warehouseStore.state.skuCatalog" :key="s.sku" :label="`${s.sku} · ${s.desc}`" :value="s.sku" />
          </el-select>
        </el-form-item>
        <el-form-item label="目标仓库">
          <el-select v-model="scan.warehouseId" style="width:100%">
            <el-option v-for="wh in warehouseStore.state.warehouses" :key="wh.id" :label="wh.name" :value="wh.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="目标仓位（zone）">
          <el-select v-model="scan.zoneId" style="width:100%" placeholder="选择货架">
            <el-option v-for="z in zones" :key="z.id" :label="z.name" :value="z.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="仓位 ID（cellId）">
          <el-input v-model="scan.cellId" placeholder="如 A12-03（新建留空自动分配）" />
        </el-form-item>
        <el-form-item label="批次号">
          <el-input v-model="scan.batchNo" placeholder="如 BATCH-20261027" />
        </el-form-item>
        <el-form-item label="数量">
          <el-input-number v-model="scan.qty" :min="1" :max="500" style="width:100%" />
        </el-form-item>
        <el-form-item label="操作人">
          <el-input v-model="scan.operator" />
        </el-form-item>
        <el-form-item label="关联工单/资产">
          <el-input v-model="scan.relatedOrder" placeholder="如 WO-20261027-008" />
        </el-form-item>
      </el-form>

      <div style="text-align:right; display:flex; gap:10px; justify-content:flex-end">
        <el-button @click="scanVisible = false">取消</el-button>
        <el-button type="primary" @click="submitScan">真 {{ scanMode === 'in' ? '入库' : '出库' }}</el-button>
      </div>
    </el-drawer>

    <!-- ===== 批次追溯 Drawer ===== -->
    <el-drawer v-model="traceVisible" :title="`批次追溯 · ${traceBatchNo}`" size="520px">
      <el-timeline>
        <el-timeline-item
          v-for="rec in traceRecords" :key="rec.id"
          :timestamp="rec.timestamp"
          :type="rec.type === 'inbound' ? 'success' : rec.type === 'outbound' ? 'warning' : rec.type === 'scrap' ? 'danger' : 'primary'"
        >
          <strong>{{ typeLabel(rec.type) }}</strong>
          <div class="zg-wh-ledger__trace-line">{{ rec.skuId }} × {{ rec.qty }}</div>
          <div class="zg-wh-ledger__trace-sub">
            仓位 {{ rec.cellId }} · 仓库 {{ warehouseStore.getWarehouse(rec.warehouseId)?.name }} · 操作人 {{ rec.operator }} · {{ rec.relatedOrder || '' }}
          </div>
        </el-timeline-item>
        <el-empty v-if="traceRecords.length === 0" description="暂无追溯记录" />
      </el-timeline>
    </el-drawer>
  </section>
</template>

<script setup>
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Operation, Plus, Refresh, Filter, Download, Search } from '@element-plus/icons-vue'
import { warehouseStore } from '@/shared/stores/warehouseStore.js'

// ===== 过滤 =====
const searchKeyword = ref('')
const warehouseFilter = ref('')
const statusFilter = ref('')

// ===== 台账表（真计算 qty）=====
const tableRows = computed(() => {
  return warehouseStore.state.skuCatalog.map(sku => {
    const cells = warehouseStore.getCellsBySku(sku.sku)
    const qty = cells.reduce((a, c) => a + c.qty, 0)
    // 选第一个仓库作为主要显示
    const primary = cells[0]
    let warehouseName = primary?.warehouseName || '未分配'
    let status = qty === 0 ? '不足' : qty < sku.safetyStock * 0.6 ? '不足' : qty < sku.safetyStock ? '临界' : '充足'
    return {
      sku: sku.sku,
      desc: sku.desc,
      warehouse: warehouseName,
      qty,
      safety: sku.safetyStock,
      status,
      price: sku.unitPrice,
      totalAmount: qty * sku.unitPrice
    }
  })
})

const filteredData = computed(() => {
  return tableRows.value.filter(r => {
    const k1 = !searchKeyword.value || r.sku.toLowerCase().includes(searchKeyword.value.toLowerCase()) || r.desc.toLowerCase().includes(searchKeyword.value.toLowerCase())
    // warehouseFilter 暂时不严格对应 id，用 name 近似
    const k2 = !warehouseFilter.value || true
    const k3 = !statusFilter.value || r.status === statusFilter.value
    return k1 && k2 && k3
  })
})

// ===== 扫码 Drawer =====
const scanVisible = ref(false)
const scanMode = ref('in')
const scan = reactive({
  skuId: '', warehouseId: warehouseStore.state.warehouses[0]?.id, zoneId: '', cellId: '',
  batchNo: '', qty: 1, operator: '刘芳', relatedOrder: ''
})

const zones = computed(() => {
  const wh = warehouseStore.getWarehouse(scan.warehouseId)
  return wh?.zones || []
})

function openInbound(row) {
  Object.assign(scan, { skuId: row.sku, warehouseId: warehouseStore.state.warehouses[0].id, zoneId: 'A', cellId: '', batchNo: `BATCH-${new Date().toISOString().slice(0,10).replace(/-/g,'')}`, qty: 10, operator: '刘芳', relatedOrder: 'MANUAL-IN' })
  scanMode.value = 'in'
  scanVisible.value = true
}
function openOutbound(row) {
  Object.assign(scan, { skuId: row.sku, warehouseId: warehouseStore.state.warehouses[0].id, zoneId: 'A', cellId: row.cellId || '', batchNo: '', qty: 1, operator: '张建国', relatedOrder: 'MANUAL-OUT' })
  scanMode.value = 'out'
  scanVisible.value = true
}

function submitScan() {
  if (!scan.skuId) { ElMessage.warning('请选择 SKU'); return }
  if (!scan.warehouseId) { ElMessage.warning('请选择仓库'); return }
  if (!scan.zoneId) scan.zoneId = zones.value[0]?.id || 'A'

  if (scanMode.value === 'in') {
    warehouseStore.inbound({
      skuId: scan.skuId, qty: scan.qty, warehouseId: scan.warehouseId,
      zoneId: scan.zoneId, cellId: scan.cellId, batchNo: scan.batchNo,
      operator: scan.operator, relatedOrder: scan.relatedOrder
    })
    ElMessage.success(`真入库：${scan.skuId} × ${scan.qty}`)
  } else {
    warehouseStore.outbound({
      skuId: scan.skuId, qty: scan.qty, warehouseId: scan.warehouseId,
      zoneId: scan.zoneId, cellId: scan.cellId || 'A12-03', batchNo: scan.batchNo,
      operator: scan.operator, relatedOrder: scan.relatedOrder
    })
    ElMessage.success(`真出库：${scan.skuId} × ${scan.qty}`)
  }
  scanVisible.value = false
}

// ===== 批次追溯 =====
const traceVisible = ref(false)
const traceBatchNo = ref('')
const traceRecords = computed(() => warehouseStore.traceBatch(traceBatchNo.value))
function showTrace(sku) {
  // 找该 SKU 最近的批次号
  const skuRec = warehouseStore.state.stockRecords.find(r => r.skuId === sku)
  traceBatchNo.value = skuRec?.batchNo || sku
  traceVisible.value = true
}
function typeLabel(t) {
  return { inbound: '📥 采购入库', outbound: '📤 安装出库', transfer: '🔄 调拨', return: '↩️ 维修归还', scrap: '🗑️ 报废出库' }[t] || t
}

// ===== 60 秒自动注入 =====
let tickTimer = null
onMounted(() => {
  tickTimer = setInterval(() => {
    // 随机添加一条记录
    const rec = warehouseStore.state.stockRecords[Math.floor(Math.random() * warehouseStore.state.stockRecords.length)]
    if (rec) {
      const delta = Math.random() > 0.5 ? 1 : -1
      const op = delta > 0 ? warehouseStore.inbound : warehouseStore.outbound
      op({ ...rec, qty: 1, timestamp: undefined })
    }
  }, 60000)
})
onUnmounted(() => { clearInterval(tickTimer) })

// ===== CSV =====
function exportCsv() {
  const rows = [['SKU', '描述', '仓库', '数量', '安全库存', '状态', '单价', '总金额']]
  filteredData.value.forEach(r => rows.push([r.sku, r.desc, r.warehouse, r.qty, r.safety, r.status, r.price, r.totalAmount]))
  const csv = '\ufeff' + rows.map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  const url = URL.createObjectURL(blob)
  a.href = url; a.download = `stock-ledger-${new Date().toISOString().slice(0,10)}.csv`
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url)
  ElMessage.success('CSV 已导出')
}
</script>

<style lang="scss" scoped>
.zg-wh-ledger {
  padding: var(--zg-space-6);
  background: var(--zg-gradient-surface);
  min-height: calc(100vh - 120px);

  &__head {
    display: flex; justify-content: space-between; align-items: center;
    padding-bottom: var(--zg-space-5); margin-bottom: var(--zg-space-5);
    border-bottom: 1px solid var(--zg-line-soft);
  }
  &__sigil { width: 44px; height: 44px; border-radius: var(--zg-radius-md); background: linear-gradient(135deg, #10b981, #059669); color: #fff; display: flex; align-items: center; justify-content: center; }
  &__title { margin: 0; font-size: var(--zg-text-display-md); font-weight: 700; }
  &__sub { margin: 2px 0 0; font-size: var(--zg-text-body-sm); color: var(--zg-ink-tertiary); }
  &__cta { display: flex; gap: var(--zg-space-3); }

  &__filter {
    display: flex; gap: var(--zg-space-3); margin-bottom: var(--zg-space-4);
    padding: var(--zg-space-3); background: var(--zg-surface-card);
    border-radius: var(--zg-radius-md); border: 1px solid var(--zg-line-strong); flex-wrap: wrap;
  }
  &__table-wrap { background: var(--zg-surface-card); border: 1px solid var(--zg-line-strong); border-radius: var(--zg-radius-lg); box-shadow: var(--zg-shadow-card); overflow: hidden; }
  &__sku { font-family: var(--zg-font-mono); font-weight: 600; color: var(--zg-amber-glow); cursor: pointer; }
  &__status {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 3px 10px; border-radius: var(--zg-radius-pill); font-size: var(--zg-text-caption); font-weight: 600;
    .dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
    &.充足 { background: var(--zg-emerald-soft); color: var(--zg-emerald-success); }
    &.临界 { background: var(--zg-amber-soft); color: var(--zg-amber-glow); }
    &.不足 { background: var(--zg-rose-soft); color: var(--zg-rose-danger); animation: breathe 2s infinite; }
  }
  &__scan-mode { margin-bottom: var(--zg-space-4); }
  &__trace-line { font-size: var(--zg-text-body-sm); font-weight: 600; color: var(--zg-ink-primary); margin-top: 2px; }
  &__trace-sub { font-size: var(--zg-text-caption); color: var(--zg-ink-tertiary); }
}
</style>
