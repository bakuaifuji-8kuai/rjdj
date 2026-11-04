<!--
  智光云枢 · 仓储库存盘点 · 采购申请（真审批流）
  业务域：warehouse
  功能：suggestPurchase 真计算 → 勾选 → generate PO → 审批 timeline → approved 后自动入库
-->
<template>
  <section class="zg-wh-purchase">
    <header class="zg-wh-purchase__head">
      <div class="zg-wh-purchase__headline">
        <div class="zg-wh-purchase__sigil"><el-icon :size="22"><ShoppingCart /></el-icon></div>
        <div class="zg-wh-purchase__copy">
          <h1 class="zg-wh-purchase__title">采购申请</h1>
          <p class="zg-wh-purchase__sub">安全库存自动建议 · 勾选一键生成采购申请单 · 审批 approved 后自动到货入库</p>
        </div>
      </div>
      <div class="zg-wh-purchase__cta">
        <el-button type="primary" :disabled="selectedItems.length === 0" @click="poVisible = true">
          <el-icon><ShoppingCart /></el-icon>
          生成采购申请单（{{ selectedItems.length }}）
        </el-button>
      </div>
    </header>

    <!-- ===== 安全库存建议 ===== -->
    <div class="zg-wh-purchase__section">
      <div class="zg-wh-purchase__section-head">
        <h3><el-icon><Warning /></el-icon>安全库存建议（suggestPurchase 真计算 · {{ suggestions.length }} 项）</h3>
        <span class="zg-wh-purchase__hint">勾选后一键生成申请单</span>
      </div>

      <div class="zg-wh-purchase__list">
        <div v-for="item in suggestions" :key="item.sku" class="zg-wh-purchase__item" :class="item.level">
          <el-checkbox :model-value="selectedItems.includes(item.sku)" @change="toggleItem(item.sku)" />
          <div class="zg-wh-purchase__item-body">
            <div class="zg-wh-purchase__item-head">
              <span class="sku">{{ item.sku }}</span>
              <span class="desc">{{ item.desc }}</span>
              <el-tag v-if="item.level === 'alert'" type="danger" effect="dark" round size="small">⚠️ 紧急（actual < safety）</el-tag>
              <el-tag v-else-if="item.level === 'warn'" type="warning" effect="dark" round size="small">提示（需要补货）</el-tag>
              <el-tag v-else type="success" effect="dark" round size="small">充足</el-tag>
            </div>
            <div class="zg-wh-purchase__item-bar">
              <div class="zg-wh-purchase__item-bar-track">
                <div class="zg-wh-purchase__item-bar-fill" :style="{ width: `${Math.min(100, item.ratio * 100)}%`, background: item.level === 'ok' ? 'var(--zg-emerald-success)' : item.level === 'warn' ? 'var(--zg-amber-glow)' : 'var(--zg-rose-danger)' }"></div>
                <div class="zg-wh-purchase__item-bar-safe" :style="{ left: `${Math.min(100, item.safetyRatio * 100)}%` }"></div>
              </div>
              <span class="ratio">{{ Math.round(item.ratio * 100) }}%</span>
            </div>
            <div class="zg-wh-purchase__item-detail">
              <span>实际 <strong>{{ item.current }}</strong></span>
              <span>安全 <strong>{{ item.safety }}</strong></span>
              <span>30天用 <strong>{{ item.usage }}</strong></span>
              <span v-if="item.purchaseQty > 0" class="need">建议采购 <strong>{{ item.purchaseQty }}</strong> 件</span>
              <span class="price">¥{{ item.price.toFixed(2) }}/件</span>
              <span v-if="item.purchaseQty > 0" class="total">小计 <strong>¥{{ (item.purchaseQty * item.price).toLocaleString() }}</strong></span>
            </div>
          </div>
        </div>
      </div>

      <div class="zg-wh-purchase__sum-bar">
        <span>已勾选 {{ selectedItems.length }} 项 · 预计总金额</span>
        <strong class="total">¥{{ totalAmount.toLocaleString() }}</strong>
        <el-button type="primary" size="small" :disabled="selectedItems.length === 0" @click="poVisible = true">生成申请</el-button>
      </div>
    </div>

    <!-- ===== 采购 Drawer ===== -->
    <el-drawer v-model="poVisible" title="采购申请单（真创建）" size="600px">
      <div class="zg-wh-purchase__po">
        <div class="zg-wh-purchase__po-head">
          <span>申请编号 ZG-PO-{{ poNumber }}</span>
          <el-tag type="warning" effect="dark" round>草稿 pending</el-tag>
        </div>
        <el-form label-width="110px" label-position="right">
          <el-form-item label="供应商">
            <el-select v-model="po.supplier" style="width: 100%" placeholder="选择长期供应商">
              <el-option label="飞利浦照明（战略）" value="飞利浦" />
              <el-option label="欧普照明长沙代理" value="欧普" />
              <el-option label="正泰电器长沙分公司" value="正泰" />
              <el-option label="中缆集团" value="中缆" />
            </el-select>
          </el-form-item>
          <el-form-item label="到货日期">
            <el-date-picker v-model="po.arrival" type="date" placeholder="选择期望到货日期" style="width: 100%" />
          </el-form-item>
          <el-form-item label="到货仓库">
            <el-select v-model="po.warehouse" style="width: 100%">
              <el-option v-for="wh in warehouseStore.state.warehouses" :key="wh.id" :label="wh.name" :value="wh.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="po.remark" type="textarea" :rows="2" placeholder="项目关联 / 特殊要求" />
          </el-form-item>
        </el-form>

        <el-divider>明细 {{ selectedSks.length }} 项</el-divider>

        <div class="zg-wh-purchase__po-items">
          <div v-for="sk in selectedSks" :key="sk.sku" class="zg-wh-purchase__po-item">
            <span class="sku">{{ sk.sku }}</span>
            <span class="desc">{{ sk.desc }}</span>
            <span class="qty">× {{ sk.purchaseQty }}</span>
            <span class="amt">¥{{ (sk.purchaseQty * sk.price).toLocaleString() }}</span>
          </div>
        </div>

        <div class="zg-wh-purchase__po-total">
          <span>合计</span>
          <strong>¥{{ totalAmount.toLocaleString() }}</strong>
        </div>
      </div>

      <template #footer>
        <el-button @click="poVisible = false">取消</el-button>
        <el-button type="primary" @click="submitPO"><el-icon><Check /></el-icon>提交审批</el-button>
      </template>
    </el-drawer>

    <!-- ===== 审批时间线（真审批流）===== -->
    <div class="zg-wh-purchase__history">
      <div class="zg-wh-purchase__history-head">
        <h3><el-icon><Operation /></el-icon>采购审批历史（真状态流转）</h3>
      </div>

      <el-table :data="warehouseStore.state.purchaseOrders" stripe>
        <el-table-column prop="id" label="单号" width="170">
          <template #default="{ row }"><span class="mono">{{ row.id }}</span></template>
        </el-table-column>
        <el-table-column prop="supplier" label="供应商" width="180" />
        <el-table-column prop="warehouse" label="仓库" width="140">
          <template #default="{ row }">{{ warehouseStore.getWarehouse(row.warehouse)?.name || row.warehouse }}</template>
        </el-table-column>
        <el-table-column prop="totalPrice" label="金额" width="120" align="right">
          <template #default="{ row }">¥{{ row.totalPrice.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="状态" width="160">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" effect="dark" round size="small">{{ statusLabel(row.status) }}</el-tag>
            <el-icon v-if="row.status !== 'received'" class="zg-wh-purchase__arrow" color="#94a3b8"><ArrowRight /></el-icon>
            <el-tag v-if="row.status !== 'received'" :type="nextTagType(row.status)" effect="plain" round size="small">{{ nextStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="申请时间" width="170" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status !== 'received'" link type="primary" size="small" @click="doApprove(row)">批准 → {{ nextStatusLabel(row.status) }}</el-button>
            <el-button link type="primary" size="small">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 审批时间线 -->
      <div class="zg-wh-purchase__tl-title">审批时间线（最近 5 单）</div>
      <el-timeline>
        <el-timeline-item
          v-for="h in approvalTimeline" :key="h.id + h.approver + h.time"
          :timestamp="h.time"
          :type="h.type"
        >
          <div class="zg-wh-purchase__tl-content">
            <strong>{{ h.id }}</strong> · {{ h.approver }} · {{ h.step }}
            <el-tag :type="h.tagType" size="small" effect="dark" round style="margin-left:8px">{{ h.status }}</el-tag>
          </div>
          <div class="zg-wh-purchase__tl-sub">
            供应商 {{ h.supplier }} · 金额 ¥{{ h.amount.toLocaleString() }}
          </div>
        </el-timeline-item>
      </el-timeline>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { ShoppingCart, Warning, Operation, Check, ArrowRight } from '@element-plus/icons-vue'
import { warehouseStore } from '@/shared/stores/warehouseStore.js'

// ===== 建议（真 suggestPurchase）=====
const suggestions = computed(() => {
  return warehouseStore.state.skuCatalog.map(sku => {
    const s = warehouseStore.suggestPurchase(sku.sku)
    const max = Math.max(sku.safetyStock * 2, s.usage * 3)
    let level = 'ok'
    if (s && s.urgency === 'urgent') level = 'alert'
    else if (s && s.urgency === 'warn') level = 'warn'
    return {
      sku: sku.sku, desc: sku.desc, price: sku.unitPrice,
      current: s.current, safety: Math.round(s.safetyStock), usage: s.usage,
      purchaseQty: s.suggestQty, max,
      ratio: s.current / Math.max(1, sku.safetyStock),
      safetyRatio: sku.safetyStock / Math.max(1, max),
      level
    }
  }).filter(s => s.level !== 'ok')
})

// ===== 勾选 =====
const selectedItems = ref(['ZG-LD-100W', 'ZG-CBL-3x70'])
function toggleItem(sku) {
  const i = selectedItems.value.indexOf(sku)
  if (i >= 0) selectedItems.value.splice(i, 1)
  else selectedItems.value.push(sku)
}
const selectedSks = computed(() => {
  return suggestions.value.filter(s => selectedItems.value.includes(s.sku) && s.purchaseQty > 0)
})
const totalAmount = computed(() => selectedSks.value.reduce((a, s) => a + s.purchaseQty * s.price, 0))

// ===== PO Drawer =====
const poVisible = ref(false)
const poNumber = computed(() => new Date().toISOString().slice(0,10).replace(/-/g,'') + '-' + String(Math.floor(Math.random() * 999)).padStart(3, '0'))
const po = reactive({ supplier: '', arrival: '', warehouse: warehouseStore.state.warehouses[0]?.id, remark: '' })

function submitPO() {
  if (!po.supplier) { ElMessage.warning('请选择供应商'); return }
  const items = selectedSks.value.map(s => ({ skuId: s.sku, qty: s.purchaseQty, unitPrice: s.price }))
  const npo = warehouseStore.createPurchaseOrder({
    items, supplier: po.supplier, warehouse: po.warehouse, remark: po.remark
  })
  ElMessage.success(`采购申请 ${npo.id} 已创建（status=pending）`)
  poVisible.value = false
  // 清空选择
  selectedItems.value = []
}

// ===== 审批 =====
const FLOW = ['pending', 'approved', 'shipped', 'received']
const FLOW_LABEL = { pending: 'pending', approved: 'approved', shipped: 'shipped', received: 'received' }
function statusLabel(s) { return { pending: '待审批', approved: '主管已批', shipped: '已发货', received: '已入库' }[s] || s }
function nextStatusLabel(s) { const i = FLOW.indexOf(s); return i < FLOW.length - 1 ? statusLabel(FLOW[i+1]) : s }
function nextTagType(s) { return { pending: 'warning', approved: 'primary', shipped: 'success', received: 'success' }[FLOW[FLOW.indexOf(s)+1]] }
function statusTagType(s) { return { pending: 'warning', approved: 'primary', shipped: 'success', received: 'success' }[s] }

function doApprove(row) {
  const approver = { pending: '主管赵刚', approved: '财务陈敏', shipped: '仓储李明', received: '系统自动' }[row.status] || '审批人'
  const step = { pending: '主管审批', approved: '财务审批', shipped: '确认到货', received: '自动入库' }[row.status] || '审批'
  warehouseStore.approvePO(row.id, approver, step)
  if (FLOW.indexOf(row.status) === FLOW.length - 2) {
    ElMessage.success(`批准完成：${row.id} → received（已自动入库）🎉`)
  } else {
    ElMessage.success(`${row.id} 已批准进入下一状态`)
  }
}

// ===== 时间线（聚合 approvals）=====
const approvalTimeline = computed(() => {
  const tl = []
  for (const po of warehouseStore.state.purchaseOrders) {
    if (po.approvals.length > 0) {
      const last = po.approvals[po.approvals.length - 1]
      tl.push({
        id: po.id, approver: last.by, step: last.step,
        supplier: po.supplier, amount: po.totalPrice, status: po.status, time: last.at,
        type: po.status === 'received' ? 'success' : po.status === 'pending' ? 'warning' : 'primary',
        tagType: po.status === 'received' ? 'success' : po.status === 'pending' ? 'warning' : 'primary'
      })
    }
  }
  return tl.slice(0, 5)
})
</script>

<style lang="scss" scoped>
.zg-wh-purchase {
  padding: var(--zg-space-6);
  background: var(--zg-gradient-surface);
  min-height: calc(100vh - 120px);

  &__head { display: flex; justify-content: space-between; align-items: center; padding-bottom: var(--zg-space-5); margin-bottom: var(--zg-space-5); border-bottom: 1px solid var(--zg-line-soft); }
  &__sigil { width: 44px; height: 44px; border-radius: var(--zg-radius-md); background: linear-gradient(135deg, #6366f1, #a855f7); color: #fff; display: flex; align-items: center; justify-content: center; }
  &__title { margin: 0; font-size: var(--zg-text-display-md); font-weight: 700; }
  &__sub { margin: 2px 0 0; font-size: var(--zg-text-body-sm); color: var(--zg-ink-tertiary); }

  &__section { background: var(--zg-surface-card); border: 1px solid var(--zg-line-strong); border-radius: var(--zg-radius-lg); padding: var(--zg-space-5); box-shadow: var(--zg-shadow-card); margin-bottom: var(--zg-space-5); }
  &__section-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--zg-space-4); padding-bottom: var(--zg-space-3); border-bottom: 1px solid var(--zg-line-soft); h3 { margin: 0; font-size: var(--zg-text-body); font-weight: 600; display: flex; gap: 6px; align-items: center; } &__hint { font-size: var(--zg-text-caption); color: var(--zg-ink-tertiary); } }

  &__list { display: flex; flex-direction: column; gap: var(--zg-space-2); }
  &__item {
    display: flex; gap: var(--zg-space-4); align-items: center;
    padding: var(--zg-space-3) var(--zg-space-4); border-radius: var(--zg-radius-md);
    border-left: 4px solid;
    &.alert { background: var(--zg-rose-50); border-color: var(--zg-rose-danger); }
    &.warn { background: var(--zg-amber-50); border-color: var(--zg-amber-glow); }
    &.ok { background: var(--zg-emerald-50); border-color: var(--zg-emerald-success); }
  }
  &__item-body { flex: 1; min-width: 0; }
  &__item-head { display: flex; align-items: center; gap: var(--zg-space-2); margin-bottom: 6px; .sku { font-family: var(--zg-font-mono); font-weight: 700; min-width: 130px; } .desc { flex: 1; color: var(--zg-ink-secondary); font-size: var(--zg-text-body-sm); } }
  &__item-bar { display: flex; gap: var(--zg-space-3); align-items: center; margin-bottom: 6px; }
  &__item-bar-track { flex: 1; height: 8px; background: rgba(0,0,0,0.05); border-radius: 4px; position: relative; }
  &__item-bar-fill { height: 100%; border-radius: 4px; transition: width 0.4s ease; }
  &__item-bar-safe { position: absolute; top: -2px; bottom: -2px; width: 2px; background: var(--zg-ink-primary); opacity: 0.4; border-radius: 1px; }
  &__ratio { font-size: var(--zg-text-caption); font-family: var(--zg-font-mono); color: var(--zg-ink-secondary); min-width: 42px; text-align: right; }
  &__item-detail { display: flex; gap: var(--zg-space-3); flex-wrap: wrap; font-size: var(--zg-text-caption); color: var(--zg-ink-tertiary); strong { color: var(--zg-ink-primary); font-family: var(--zg-font-mono); font-weight: 700; } .need strong { color: var(--zg-amber-glow); } .total strong { color: var(--zg-rose-danger); font-size: var(--zg-text-body-sm); } }

  &__sum-bar { margin-top: var(--zg-space-4); padding: var(--zg-space-3) var(--zg-space-4); background: linear-gradient(90deg, var(--zg-amber-soft), #fff); border-radius: var(--zg-radius-md); display: flex; align-items: center; gap: var(--zg-space-3); border: 1px solid var(--zg-amber-soft); strong.total { margin-left: auto; font-size: var(--zg-text-display-sm); font-family: var(--zg-font-mono); color: var(--zg-rose-danger); font-weight: 800; } }

  &__po-head { display: flex; justify-content: space-between; align-items: center; padding-bottom: var(--zg-space-3); margin-bottom: var(--zg-space-3); border-bottom: 1px solid var(--zg-line-soft); font-family: var(--zg-font-mono); font-weight: 600; }
  &__po-items { display: flex; flex-direction: column; gap: var(--zg-space-2); max-height: 220px; overflow-y: auto; }
  &__po-item { display: grid; grid-template-columns: 130px 1fr auto auto; gap: var(--zg-space-3); align-items: center; padding: var(--zg-space-2) var(--zg-space-3); background: var(--zg-surface-muted); border-radius: var(--zg-radius-md); .sku { font-family: var(--zg-font-mono); font-weight: 600; } .desc { color: var(--zg-ink-tertiary); font-size: var(--zg-text-caption); } .amt { font-family: var(--zg-font-mono); font-weight: 700; color: var(--zg-amber-glow); } }
  &__po-total { margin-top: var(--zg-space-3); padding-top: var(--zg-space-3); border-top: 2px solid var(--zg-line-soft); display: flex; justify-content: space-between; align-items: center; font-weight: 600; strong { font-size: var(--zg-text-display-md); font-family: var(--zg-font-mono); color: var(--zg-rose-danger); } }

  &__history { background: var(--zg-surface-card); border: 1px solid var(--zg-line-strong); border-radius: var(--zg-radius-lg); padding: var(--zg-space-5); box-shadow: var(--zg-shadow-card); }
  &__history-head { padding-bottom: var(--zg-space-3); margin-bottom: var(--zg-space-3); border-bottom: 1px solid var(--zg-line-soft); h3 { margin: 0; font-size: var(--zg-text-body); font-weight: 600; display: flex; gap: 6px; align-items: center; } }
  .mono { font-family: var(--zg-font-mono); }
  &__arrow { margin: 0 4px; }
  &__tl-title { font-weight: 600; color: var(--zg-ink-primary); margin: var(--zg-space-4) 0 var(--zg-space-3); }
  &__tl-content { display: flex; align-items: center; gap: var(--zg-space-3); margin-bottom: 4px; strong { font-family: var(--zg-font-mono); } }
  &__tl-sub { font-size: var(--zg-text-caption); color: var(--zg-ink-tertiary); }
}
</style>
