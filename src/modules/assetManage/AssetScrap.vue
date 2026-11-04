<!--
  智光云枢 · 资产管控 · 报废与回收 (Phase 1)
  - 审批状态机：pending → manager_approved → finance_approved → gm_approved → done / rejected
  - 每一级 approve 按钮 → 状态流转 → timeline 更新
  - 回收真登记：废品重量 × 单价 = 回收金额 → recycled → 净值清零
  - 统计真计算：本月报废数 / 残值收入 / 剩余价值
-->
<template>
  <section class="zg-am-scrap">
    <header class="zg-am-scrap__head">
      <div class="zg-am-scrap__headline">
        <div class="zg-am-scrap__sigil"><el-icon :size="22"><DeleteFilled /></el-icon></div>
        <div class="zg-am-scrap__copy">
          <h1 class="zg-am-scrap__title">报废与回收</h1>
          <p class="zg-am-scrap__sub">
            资产报废处置中心 · 本月报废 {{ kpi.monthScrap }} 件 ·
            残值收入 ¥{{ kpi.salvage.toLocaleString() }} ·
            累计处置 {{ kpi.totalScrap }} 件
          </p>
        </div>
      </div>
      <div class="zg-am-scrap__cta">
        <el-button type="primary" @click="onNewScrap"><el-icon><Plus /></el-icon>发起报废申请</el-button>
        <el-button plain><el-icon><Download /></el-icon>导出回收台账</el-button>
      </div>
    </header>

    <!-- KPI -->
    <div class="zg-am-scrap__kpi">
      <div v-for="cell in kpiCells" :key="cell.key" class="zg-kpi-cell" :class="cell.theme">
        <div class="zg-kpi-cell__icon"><el-icon :size="20"><component :is="cell.icon" /></el-icon></div>
        <div class="zg-kpi-cell__body">
          <span class="zg-kpi-cell__num">{{ cell.value }}</span>
          <span class="zg-kpi-cell__lbl">{{ cell.label }}</span>
        </div>
      </div>
    </div>

    <div class="zg-am-scrap__main">
      <!-- 报废审批卡 -->
      <div class="zg-am-scrap__panel">
        <div class="zg-am-scrap__panel-head">
          <h4><el-icon><Document /></el-icon>报废审批单 ({{ scrapRequests.length }})</h4>
          <el-radio-group v-model="filterStatus" size="small">
            <el-radio-button value="all">全部</el-radio-button>
            <el-radio-button value="pending">审批中</el-radio-button>
            <el-radio-button value="done">已完成</el-radio-button>
            <el-radio-button value="rejected">已驳回</el-radio-button>
          </el-radio-group>
        </div>
        <div class="zg-am-scrap__cards">
          <article v-for="req in filteredRequests" :key="req.id" class="zg-scrapcard" :class="'zg-scrapcard--' + req.statusKey">
            <div class="zg-scrapcard__head">
              <span class="zg-scrapcard__code mono">{{ req.code }}</span>
              <span class="zg-scrapcard__status" :class="'zg-scrapcard__status--' + req.statusKey">
                <i class="dot"></i>{{ req.statusLabel }}
              </span>
            </div>
            <div class="zg-scrapcard__body">
              <div class="zg-scrapcard__asset">
                <span class="zg-scrapcard__asset-code mono">{{ req.assetCode }}</span>
                <span class="zg-scrapcard__asset-model">{{ req.model }}</span>
              </div>
              <p class="zg-scrapcard__reason"><el-icon><Warning /></el-icon>{{ req.reason }}</p>
              <div class="zg-scrapcard__value">
                <span>净值</span>
                <strong>¥{{ req.netValue.toLocaleString() }}</strong>
                <span class="sep">|</span>
                <span>残值估价</span>
                <strong>¥{{ req.salvage.toLocaleString() }}</strong>
              </div>
            </div>

            <!-- 审批流进度 -->
            <div class="zg-scrapcard__flow">
              <div v-for="(step, idx) in approvalSteps" :key="step.key" class="zg-approval-step"
                :class="{ done: req.approvalIndex > idx, active: req.approvalIndex === idx && req.statusKey !== 'done', future: req.approvalIndex < idx || req.statusKey === 'rejected' }">
                <div class="zg-approval-step__dot">
                  <el-icon v-if="req.approvalIndex > idx"><CircleCheck /></el-icon>
                  <el-icon v-else-if="req.statusKey === 'rejected' && idx >= req.approvalIndex"><CircleClose /></el-icon>
                  <span v-else>{{ idx + 1 }}</span>
                </div>
                <div class="zg-approval-step__label">{{ step.label }}</div>
              </div>
            </div>

            <!-- 当前操作按钮 -->
            <div class="zg-scrapcard__actions" v-if="req.statusKey === 'pending' || req.statusKey === 'manager_approved' || req.statusKey === 'finance_approved' || req.statusKey === 'gm_approved'">
              <el-button size="small" type="primary" :disabled="req.statusKey !== approvalSteps[req.approvalIndex]?.key" @click="onApprove(req)">
                {{ approvalSteps[req.approvalIndex]?.label || '审批' }} ✓
              </el-button>
              <el-button size="small" type="danger" plain @click="onReject(req)">驳回</el-button>
            </div>

            <!-- 回收登记（最后一级审批通过后） -->
            <div v-if="req.statusKey === 'done' && !req.recycled" class="zg-scrapcard__recycle">
              <span class="zg-recycle-title">回收登记：</span>
              <el-input-number v-model="req.scrapWeight" :min="0" :step="1" size="small" />
              <span>kg ×</span>
              <el-input-number v-model="req.scrapPrice" :min="0" :step="0.5" size="small" />
              <span>元/kg</span>
              <strong class="zg-recycle-amount">= ¥{{ (req.scrapWeight * req.scrapPrice).toFixed(2) }}</strong>
              <el-button size="small" type="success" @click="onRecycle(req)"><el-icon><Collection /></el-icon>确认回收</el-button>
            </div>
            <div v-if="req.recycled" class="zg-scrapcard__recycle--done">
              ✓ 已回收 ¥{{ (req.scrapWeight * req.scrapPrice).toFixed(2) }} · 净值已清零
            </div>

            <div class="zg-scrapcard__foot">
              <span class="zg-scrapcard__submitter">提交：{{ req.submitter }}</span>
              <span class="zg-scrapcard__date">{{ req.submitDate }}</span>
            </div>
          </article>
        </div>
      </div>

      <!-- 回收记录 -->
      <div class="zg-am-scrap__panel">
        <div class="zg-am-scrap__panel-head">
          <h4><el-icon><Collection /></el-icon>回收记录 ({{ recycleRecords.length }})</h4>
        </div>
        <el-table :data="recycleRecords" size="default" stripe>
          <el-table-column prop="date" label="日期" width="110" />
          <el-table-column prop="assetCode" label="资产编码" width="150">
            <template #default="{ row }"><span class="mono">{{ row.assetCode }}</span></template>
          </el-table-column>
          <el-table-column prop="model" label="型号" width="160" show-overflow-tooltip />
          <el-table-column prop="weight" label="重量(kg)" width="100" align="right" />
          <el-table-column prop="price" label="单价" width="90" align="right">
            <template #default="{ row }">¥{{ row.price.toFixed(2) }}</template>
          </el-table-column>
          <el-table-column label="回收金额" width="120" align="right">
            <template #default="{ row }"><strong>¥{{ (row.weight * row.price).toFixed(2) }}</strong></template>
          </el-table-column>
          <el-table-column prop="operator" label="操作员" width="100" />
        </el-table>
      </div>
    </div>

    <!-- 新建报废 Dialog -->
    <el-dialog v-model="createDialog" title="发起报废申请" width="520px">
      <el-form :model="createForm" label-width="100px">
        <el-form-item label="资产编码">
          <el-input v-model="createForm.assetCode" placeholder="ASSET-2026-xxxx" />
        </el-form-item>
        <el-form-item label="资产型号">
          <el-input v-model="createForm.model" placeholder="LED-100W-NW" />
        </el-form-item>
        <el-form-item label="报废原因">
          <el-select v-model="createForm.reason" placeholder="选择原因">
            <el-option v-for="r in ['达到使用年限', '严重损坏无法修复', '技术淘汰', '丢失', '其他']" :key="r" :label="r" :value="r" />
          </el-select>
        </el-form-item>
        <el-form-item label="净值 / 残值">
          <div style="display:flex;gap:10px;align-items:center;width:100%">
            <el-input-number v-model="createForm.netValue" :min="0" style="flex:1" />
            <span>/</span>
            <el-input-number v-model="createForm.salvage" :min="0" style="flex:1" />
          </div>
        </el-form-item>
        <el-form-item label="申请人">
          <el-input v-model="createForm.submitter" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialog = false">取消</el-button>
        <el-button type="primary" @click="submitNewScrap">提交申请</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  DeleteFilled, Plus, Download, Document, Collection, CircleCheck, CircleClose, Warning
} from '@element-plus/icons-vue'

// ============================================================
// 审批状态机
// ============================================================
const approvalSteps = [
  { key: 'pending',              label: '待提交', role: '系统' },
  { key: 'manager_approved',    label: '部门经理审批', role: '部门经理' },
  { key: 'finance_approved',    label: '财务审批', role: '财务部' },
  { key: 'gm_approved',          label: '总经理审批', role: '总经理' },
  { key: 'done',                 label: '审批完成', role: '系统' }
]

type ScrapStatus = 'pending' | 'manager_approved' | 'finance_approved' | 'gm_approved' | 'done' | 'rejected'

interface ScrapRequest {
  id: number; code: string; assetCode: string; model: string
  reason: string; statusKey: ScrapStatus; statusLabel: string
  approvalIndex: number
  netValue: number; salvage: number
  submitter: string; submitDate: string
  scrapWeight: number; scrapPrice: number; recycled: boolean
  rejectReason?: string; rejectUser?: string; rejectDate?: string
}

const initialRequests: ScrapRequest[] = [
  { id: 1, code: 'SC202610-008', assetCode: 'ASSET-2026-1023', model: 'LED-100W-NW', reason: '达到使用年限', statusKey: 'gm_approved', statusLabel: '总经理审批中', approvalIndex: 3, netValue: 68, salvage: 42, submitter: '王工', submitDate: '2026-10-12', scrapWeight: 0, scrapPrice: 2.5, recycled: false },
  { id: 2, code: 'SC202610-007', assetCode: 'ASSET-2026-1045', model: 'CAM-HD1080-I', reason: '严重损坏', statusKey: 'finance_approved', statusLabel: '财务已批', approvalIndex: 2, netValue: 320, salvage: 200, submitter: '张工', submitDate: '2026-10-08', scrapWeight: 0, scrapPrice: 1.8, recycled: false },
  { id: 3, code: 'SC202610-006', assetCode: 'ASSET-2026-1012', model: 'DBX-400V-25A', reason: '技术淘汰', statusKey: 'manager_approved', statusLabel: '经理已批', approvalIndex: 1, netValue: 1500, salvage: 900, submitter: '李工', submitDate: '2026-10-05', scrapWeight: 0, scrapPrice: 0.5, recycled: false },
  { id: 4, code: 'SC202610-005', assetCode: 'ASSET-2026-1003', model: 'P-025', reason: '丢失', statusKey: 'pending', statusLabel: '待审批', approvalIndex: 0, netValue: 1800, salvage: 1500, submitter: '王工', submitDate: '2026-10-02', scrapWeight: 0, scrapPrice: 0.0, recycled: false },
  { id: 5, code: 'SC202610-004', assetCode: 'ASSET-2026-1088', model: 'LED-80W-CW', reason: '达到使用年限', statusKey: 'done', statusLabel: '已完成', approvalIndex: 4, netValue: 32, salvage: 20, submitter: '张工', submitDate: '2026-09-28', scrapWeight: 8.5, scrapPrice: 2.8, recycled: true },
  { id: 6, code: 'SC202610-003', assetCode: 'ASSET-2026-1099', model: 'ZGSQ-CTRL-V3', reason: '技术淘汰', statusKey: 'rejected', statusLabel: '已驳回', approvalIndex: 1, netValue: 250, salvage: 120, submitter: '刘工', submitDate: '2026-09-20', scrapWeight: 0, scrapPrice: 0, recycled: false, rejectReason: '折旧评估不符，重新申请', rejectUser: '财务部', rejectDate: '2026-09-22' }
]

const scrapRequests = ref<ScrapRequest[]>([...initialRequests])

// ============================================================
// 筛选
// ============================================================
const filterStatus = ref<'all' | 'pending' | 'done' | 'rejected'>('all')
const filteredRequests = computed(() => {
  const list = scrapRequests.value.slice().sort((a, b) => b.id - a.id)
  if (filterStatus.value === 'pending') return list.filter(r => ['pending', 'manager_approved', 'finance_approved', 'gm_approved'].includes(r.statusKey))
  if (filterStatus.value === 'done') return list.filter(r => r.statusKey === 'done')
  if (filterStatus.value === 'rejected') return list.filter(r => r.statusKey === 'rejected')
  return list
})

// ============================================================
// 回收记录（从已完成且已回收的生成）
// ============================================================
const recycleRecords = computed(() => {
  return scrapRequests.value
    .filter(r => r.recycled)
    .sort((a, b) => b.id - a.id)
    .map(r => ({
      date: r.submitDate,
      assetCode: r.assetCode,
      model: r.model,
      weight: r.scrapWeight,
      price: r.scrapPrice,
      operator: r.approvalIndex >= 3 ? '财务' : '回收商'
    }))
})

// ============================================================
// KPI 真计算
// ============================================================
const kpi = computed(() => {
  const now = new Date()
  const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const monthScrap = scrapRequests.value.filter(r => r.submitDate.startsWith(yearMonth) && (r.statusKey === 'done')).length
  const salvage = recycleRecords.value.reduce((a, r) => a + r.weight * r.price, 0)
  const totalScrap = scrapRequests.value.filter(r => r.statusKey === 'done' || r.statusKey === 'recycled').length
  const remaining = scrapRequests.value.reduce((a, r) => a + (r.recycled ? 0 : r.netValue), 0)
  return { monthScrap, salvage: Math.round(salvage * 100) / 100, totalScrap, remaining }
})

const kpiCells = computed(() => [
  { key: 'monthScrap', label: '本月报废数', value: kpi.value.monthScrap + ' 件', icon: Document, theme: 'danger' },
  { key: 'salvage',    label: '残值收入',   value: '¥' + Math.round(kpi.value.salvage).toLocaleString(), icon: Collection, theme: 'success' },
  { key: 'totalScrap', label: '累计处置',   value: kpi.value.totalScrap + ' 件', icon: DeleteFilled, theme: 'warn' },
  { key: 'remaining',  label: '剩余净值',   value: '¥' + Math.round(kpi.value.remaining).toLocaleString(), icon: Document, theme: 'info' }
])

// ============================================================
// 审批状态机逻辑
// ============================================================
const statusLabelMap: Record<ScrapStatus, string> = {
  pending: '待审批', manager_approved: '经理已批', finance_approved: '财务已批',
  gm_approved: '总经理已批', done: '审批完成', rejected: '已驳回'
}

function onApprove(req: ScrapRequest) {
  ElMessageBox.prompt('请输入审批备注', `${approvalSteps[req.approvalIndex].role} 审批`, {
    inputValue: '同意', confirmButtonText: '审批通过', cancelButtonText: '取消'
  }).then(() => {
    const curIdx = req.approvalIndex
    if (curIdx < approvalSteps.length - 1) {
      req.approvalIndex = curIdx + 1
      req.statusKey = approvalSteps[curIdx + 1].key as ScrapStatus
      req.statusLabel = statusLabelMap[req.statusKey]
      if (req.statusKey === 'done') {
        req.statusLabel = '审批完成，待回收'
      }
    }
    ElMessage.success(`${approvalSteps[curIdx].role} 审批通过`)
  }).catch(() => {})
}

function onReject(req: ScrapRequest) {
  ElMessageBox.prompt('请输入驳回理由', '驳回申请', {
    inputValue: '资产状态不符，请核实后重新申请',
    confirmButtonText: '确认驳回', cancelButtonText: '取消', type: 'warning' as any
  }).then(({ value }) => {
    req.statusKey = 'rejected'
    req.statusLabel = '已驳回'
    req.rejectReason = value
    req.rejectDate = new Date().toISOString().slice(0, 10)
    ElMessage.success('申请已驳回')
  }).catch(() => {})
}

function onRecycle(req: ScrapRequest) {
  const amount = req.scrapWeight * req.scrapPrice
  ElMessageBox.confirm(`确认回收 ${req.scrapWeight} kg × ¥${req.scrapPrice}/kg = ¥${amount.toFixed(2)}？回收后净值将清零。`, '确认回收', {
    type: 'success' as any, confirmButtonText: '确认回收', cancelButtonText: '取消'
  }).then(() => {
    req.recycled = true
    req.netValue = 0
    req.statusKey = 'recycled' as any
    ElMessage.success(`回收完成，残值收入 ¥${amount.toFixed(2)}`)
  }).catch(() => {})
}

// ============================================================
// 新建报废
// ============================================================
const createDialog = ref(false)
const createForm = reactive({ assetCode: '', model: '', reason: '', netValue: 0, salvage: 0, submitter: '' })

function onNewScrap() {
  Object.assign(createForm, { assetCode: '', model: '', reason: '', netValue: 0, salvage: 0, submitter: '' })
  createDialog.value = true
}

let nextId = 100
function submitNewScrap() {
  if (!createForm.assetCode || !createForm.model) { ElMessage.warning('请填写资产编码和型号'); return }
  const id = Date.now()
  const now = new Date()
  const code = `SC${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${String(nextId++).slice(-3)}`
  scrapRequests.value.unshift({
    id, code,
    assetCode: createForm.assetCode, model: createForm.model,
    reason: createForm.reason || '其他',
    statusKey: 'pending', statusLabel: '待审批',
    approvalIndex: 0,
    netValue: createForm.netValue || 0,
    salvage: createForm.salvage || 0,
    submitter: createForm.submitter || '当前用户',
    submitDate: now.toISOString().slice(0, 10),
    scrapWeight: 0, scrapPrice: 0, recycled: false
  })
  createDialog.value = false
  ElMessage.success(`报废申请 ${code} 已提交，等待部门经理审批`)
}
</script>

<style scoped lang="scss">
.zg-am-scrap {
  --brand: #d97706; --success: #059669; --warning: #d97706; --danger: #dc2626; --info: #0284c7;
  padding: 24px; background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
  min-height: calc(100vh - 120px); font-family: -apple-system, 'PingFang SC', sans-serif;

  &__head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; padding-bottom: 18px; border-bottom: 1px solid rgba(241,245,249,0.8); }
  &__headline { display: flex; align-items: center; gap: 14px; }
  &__sigil { width: 44px; height: 44px; border-radius: 10px; background: linear-gradient(135deg, #dc2626, #ef4444); color: #fff; display: flex; align-items: center; justify-content: center; }
  &__copy { display: flex; flex-direction: column; gap: 4px; }
  &__title { margin: 0; font-size: 20px; font-weight: 600; }
  &__sub { margin: 0; font-size: 13px; color: #71717a; }
  &__cta { display: flex; gap: 10px; }
  &__kpi { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 18px; }
  &__main { display: flex; flex-direction: column; gap: 16px; }
  &__panel { background: #fff; border-radius: 16px; border: 1px solid rgba(241,245,249,0.8); padding: 18px; }
  &__panel-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; h4 { margin: 0; font-size: 14px; color: #52525b; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; } }
  &__cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(420px, 1fr)); gap: 14px; }
}
.zg-kpi-cell { background: #fff; border: 1px solid rgba(241,245,249,0.8); border-radius: 16px; padding: 16px 18px; display: flex; align-items: center; gap: 14px; position: relative; overflow: hidden;
  &::before { content: ''; position: absolute; left: 0; top: 0; width: 3px; height: 100%; background: var(--brand); }
  &.danger::before { background: var(--danger); } &.success::before { background: var(--success); } &.warn::before { background: var(--warning); } &.info::before { background: var(--info); }
  &__icon { width: 42px; height: 42px; border-radius: 10px; background: var(--brand); color: #fff; display: flex; align-items: center; justify-content: center; }
  .danger &__icon { background: var(--danger); } .success &__icon { background: var(--success); } .warn &__icon { background: var(--warning); } .info &__icon { background: var(--info); }
  &__body { display: flex; flex-direction: column; gap: 4px; }
  &__num { font-size: 22px; font-weight: 700; font-variant-numeric: tabular-nums; }
  &__lbl { font-size: 12px; color: #71717a; }
}
.mono { font-family: 'Geist Mono', ui-monospace, monospace; }

.zg-scrapcard {
  background: #fff; border: 1px solid rgba(241,245,249,0.8); border-radius: 14px; padding: 14px;
  border-left: 3px solid #cbd5e1; transition: all 200ms;
  &:hover { box-shadow: 0 8px 24px -8px rgba(15,23,42,0.12); }
  &--done { border-left-color: #059669; } &--rejected { border-left-color: #dc2626; opacity: 0.75; }
  &__head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  &__code { font-size: 12px; color: #71717a; font-weight: 500; }
  &__status { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; padding: 2px 8px; border-radius: 999px; font-weight: 500;
    .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
    &--pending, &--manager_approved, &--finance_approved { color: #d97706; background: #fef3c7; }
    &--gm_approved { color: #d97706; background: #fef3c7; animation: pulse 1.5s infinite; }
    &--done { color: #059669; background: #d1fae5; }
    &--rejected { color: #dc2626; background: #fee2e2; }
  }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
  &__asset { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;
    &-code { font-size: 13px; font-weight: 600; color: #18181b; }
    &-model { font-size: 11px; color: #71717a; }
  }
  &__reason { margin: 0 0 8px; font-size: 12px; color: #52525b; display: inline-flex; align-items: center; gap: 4px; }
  &__value { display: flex; gap: 8px; align-items: center; font-size: 12px; color: #71717a; strong { color: #18181b; font-size: 13px; } .sep { color: #cbd5e1; margin: 0 4px; } }
  &__flow { display: flex; justify-content: space-between; margin: 12px 0; padding: 10px; background: #f8fafc; border-radius: 10px; }
  &__actions { display: flex; gap: 8px; margin-bottom: 8px; }
  &__recycle { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; padding: 10px; background: #fffbeb; border-radius: 10px; margin-bottom: 8px;
    .zg-recycle-title { font-size: 12px; color: #52525b; }
    .zg-recycle-amount { font-size: 14px; color: #d97706; font-weight: 700; }
  }
  &__recycle--done { padding: 10px; background: #d1fae5; border-radius: 10px; font-size: 12px; color: #059669; font-weight: 600; margin-bottom: 8px; }
  &__foot { display: flex; justify-content: space-between; font-size: 11px; color: #71717a; padding-top: 8px; border-top: 1px dashed rgba(241,245,249,0.8); }
}

.zg-approval-step {
  flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; position: relative;
  &__dot { width: 24px; height: 24px; border-radius: 50%; background: #cbd5e1; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600; }
  &__label { font-size: 10px; color: #71717a; text-align: center; }
  &.done &__dot { background: #059669; } &.done &__label { color: #059669; }
  &.active &__dot { background: #d97706; animation: pulse 1.5s infinite; } &.active &__label { color: #d97706; font-weight: 600; }
  &.future &__dot { background: #cbd5e1; } &.future &__label { color: #a1a1aa; }
}
</style>
