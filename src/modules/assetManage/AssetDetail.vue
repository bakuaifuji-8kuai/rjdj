<!--
  智光云枢 · 资产管控 · 资产详情 Drawer (Phase 1)
  - QRCode 组件 + 下载 SVG + 打印
  - calcDepreciation 实时计算 + 大号数字 + 圆环（净值占比）
  - 12 个月柱图：已过月 indigo，未来月灰色
  - 状态流转 timeline：真实状态流转 + 可操作变更
  - defineExpose({ open })
-->
<template>
  <el-drawer v-model="drawerOpen" :title="drawerTitle" direction="rtl" size="680px" class="zg-am-detail-drawer">
    <div v-if="focused" class="zg-am-detail">
      <!-- 顶部概览 -->
      <div class="zg-am-detail__top">
        <div class="zg-am-detail__headline">
          <h2 class="zg-am-detail__code">{{ focused.code }}</h2>
          <span class="zg-am-detail__status" :class="'zg-am-detail__status--' + focused.statusKey">
            <i class="dot"></i>{{ focused.statusLabel }}
          </span>
          <span class="zg-am-detail__model">{{ focused.model }}</span>
          <p class="zg-am-detail__meta">{{ focused.category }} · {{ focused.poleNo }} · 采购 {{ focused.purchaseDate }}</p>
        </div>
        <div class="zg-am-detail__qrcode">
          <QRCode :asset-code="focused.code" :size="qrSize" />
          <span class="zg-am-detail__qrcode-label">资产二维码</span>
          <div class="zg-am-detail__qrcode-actions">
            <el-button size="small" @click="onDownloadSvg"><el-icon><Download /></el-icon>下载 SVG</el-button>
            <el-button size="small" plain @click="onPrintQr"><el-icon><Printer /></el-icon>打印</el-button>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <el-tabs v-model="activeTab" class="zg-am-detail__tabs">
        <!-- Tab 1 基础档案 -->
        <el-tab-pane label="基础档案" name="basic">
          <el-descriptions :column="2" border class="zg-am-detail__descs">
            <el-descriptions-item label="资产编码">{{ focused.code }}</el-descriptions-item>
            <el-descriptions-item label="分类">{{ focused.category }}</el-descriptions-item>
            <el-descriptions-item label="型号">{{ focused.model }}</el-descriptions-item>
            <el-descriptions-item label="序列号">{{ focused.serialNo }}</el-descriptions-item>
            <el-descriptions-item label="供应商">{{ focused.vendor }}</el-descriptions-item>
            <el-descriptions-item label="采购日期">{{ focused.purchaseDate }}</el-descriptions-item>
            <el-descriptions-item label="安装日期">{{ focused.installDate }}</el-descriptions-item>
            <el-descriptions-item label="杆桩编号">{{ focused.poleNo }}</el-descriptions-item>
            <el-descriptions-item label="物理位置" :span="2">{{ focused.location }}</el-descriptions-item>
            <el-descriptions-item label="质保到期">{{ focused.warrantyDate }} · 剩余 {{ focused.warrantyDays }} 天</el-descriptions-item>
            <el-descriptions-item label="折旧年限">{{ focused.depreciationYears }} 年 / 残值率 {{ Math.round(focused.residualRate * 100) }}%</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <!-- Tab 2 财务折旧 (真实 calcDepreciation) -->
        <el-tab-pane label="财务折旧" name="finance">
          <div class="zg-am-detail__kpi-row">
            <div class="zg-am-detail__kpi-card zg-am-detail__kpi-card--primary">
              <span class="lbl">原值</span>
              <span class="num">¥{{ focused.original.toLocaleString() }}</span>
            </div>
            <div class="zg-am-detail__kpi-card zg-am-detail__kpi-card--warn">
              <span class="lbl">已折旧</span>
              <span class="num">¥{{ dep.accumulatedDepreciation.toLocaleString() }}</span>
            </div>
            <div class="zg-am-detail__kpi-card zg-am-detail__kpi-card--success">
              <span class="lbl">净值</span>
              <span class="num">¥{{ dep.netValue.toLocaleString() }}</span>
            </div>
            <div class="zg-am-detail__kpi-card zg-am-detail__kpi-card--info">
              <span class="lbl">月折旧</span>
              <span class="num">¥{{ dep.monthlyDepreciation.toFixed(2) }}</span>
            </div>
          </div>

          <div class="zg-am-detail__circle-row">
            <div class="zg-am-detail__ring">
              <svg viewBox="0 0 100 100" width="160" height="160">
                <circle cx="50" cy="50" r="44" stroke="#f1f5f9" stroke-width="10" fill="none" />
                <circle cx="50" cy="50" r="44" :stroke="ringColor" stroke-width="10" fill="none"
                  stroke-linecap="round" :stroke-dasharray="ringDash" stroke-dashoffset="0" transform="rotate(-90 50 50)" />
              </svg>
              <div class="zg-am-detail__ring-center">
                <span class="pct">{{ Math.min(100, dep.depreciationProgress).toFixed(0) }}%</span>
                <span class="lbl">已折旧 / 剩余 {{ dep.remainingMonths }} 月</span>
              </div>
            </div>
            <div class="zg-am-detail__circle-copy">
              <h4 class="zg-am-detail__section-title">净值占比</h4>
              <p>
                残值 ¥{{ residual.toLocaleString() }} · 累计折旧 <strong>¥{{ dep.accumulatedDepreciation.toLocaleString() }}</strong>
              </p>
              <p class="formula">
                折旧年限 {{ focused.depreciationYears }} 年 · 已折旧 {{ dep.accumulatedMonths }} 月<br>
                月折旧 = 原值 × (1−残值率) ÷ (年数 × 12)
              </p>
              <el-tag v-if="dep.isFullyDepreciated" type="danger" effect="dark">已折旧完毕</el-tag>
            </div>
          </div>

          <h4 class="zg-am-detail__section-title">近 12 个月月度折旧</h4>
          <div class="zg-am-detail__barchart">
            <div v-for="(info, idx) in monthlyBars" :key="idx" class="bar-cell">
              <div class="bar-track">
                <div class="bar-fill" :class="info.past ? 'bar-fill--past' : 'bar-fill--future'"
                  :style="{ height: barHeight(info, 1) + '%' }"></div>
              </div>
              <span class="bar-label">{{ info.label }}</span>
            </div>
          </div>
        </el-tab-pane>

        <!-- Tab 3 状态流转 -->
        <el-tab-pane label="状态流转" name="timeline">
          <div class="zg-am-detail__transition-bar">
            <div class="zg-am-detail__transition-title">
              当前状态：
              <span class="zg-am-detail__status" :class="'zg-am-detail__status--' + focused.statusKey">
                <i class="dot"></i>{{ focused.statusLabel }}
              </span>
            </div>
            <div class="zg-am-detail__transition-actions">
              <el-button v-for="s in nextTransitions" :key="s.key" size="small" type="primary" plain
                :disabled="focused.statusKey === s.key" @click="onChangeState(s.key)">
                → {{ s.label }}
              </el-button>
            </div>
          </div>

          <el-timeline class="zg-am-detail__timeline">
            <el-timeline-item v-for="(item, idx) in statusFlows" :key="idx"
              :timestamp="item.time" :type="item.type" :hollow="idx === 0">
              <div class="zg-am-detail__flow-item">
                <div class="zg-am-detail__flow-head">
                  <span class="zg-am-detail__flow-title">{{ item.title }}</span>
                  <span class="zg-am-detail__flow-status" :class="'zg-am-detail__flow-status--' + item.statusKey">{{ item.status }}</span>
                </div>
                <p class="zg-am-detail__flow-body">{{ item.remark }}</p>
                <span class="zg-am-detail__flow-user">操作人：{{ item.user }}</span>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-tab-pane>

        <!-- Tab 4 关联工单 -->
        <el-tab-pane label="关联工单" name="tickets">
          <el-table :data="relatedTickets" stripe size="default">
            <el-table-column prop="code" label="工单号" width="150">
              <template #default="{ row }"><span class="zg-ticket-code">{{ row.code }}</span></template>
            </el-table-column>
            <el-table-column prop="type" label="类型" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.typeTagType" size="small" effect="plain">{{ row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="time" label="时间" width="170" />
            <el-table-column prop="user" label="操作人" width="90" />
            <el-table-column prop="result" label="结果">
              <template #default="{ row }">
                <span :class="'zg-am-detail__ticket-result zg-am-detail__ticket-result--' + row.resultKey">{{ row.result }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>

    <template #footer v-if="focused">
      <div class="zg-am-detail__footer">
        <el-button @click="drawerOpen = false">关闭</el-button>
        <el-button type="primary"><el-icon><Edit /></el-icon>编辑档案</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Download, Printer } from '@element-plus/icons-vue'
import QRCode from '@/components/asset/QRCode.vue'
import {
  calcDepreciation, calcWarrantyDays, calcWarrantyDate,
  qrMatrixToSvg, generateQRM, canTransition, assetStatusLabel, assetStatusFlow,
  type AssetStatus
} from '@/utils/assetUtils'

interface DetailAsset {
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
  serialNo: string
  location: string
  warrantyDays: number
  warrantyDate: string
}

const drawerOpen = ref(false)
const focused = ref<DetailAsset | null>(null)
const activeTab = ref('basic')
const qrSize = 160
const customFlows = ref<Array<{ title: string; status: string; statusKey: AssetStatus; remark: string; user: string; time: string; type: string }>>([])

const drawerTitle = computed(() => focused.value ? `资产详情 · ${focused.value.code}` : '资产详情')

// ============================================================
// 真实折旧
// ============================================================
const dep = computed(() => {
  if (!focused.value) return { monthlyDepreciation: 0, accumulatedMonths: 0, accumulatedDepreciation: 0, netValue: 0, depreciationProgress: 0, remainingMonths: 0, isFullyDepreciated: false }
  return calcDepreciation({
    purchaseDate: focused.value.purchaseDate,
    installDate: focused.value.installDate,
    purchasePrice: focused.value.original,
    depreciationYears: focused.value.depreciationYears,
    residualRate: focused.value.residualRate
  })
})

const residual = computed(() => focused.value ? Math.round(focused.value.original * focused.value.residualRate) : 0)

const ringDash = computed(() => {
  const pct = dep.value.depreciationProgress
  const circ = 2 * Math.PI * 44
  return `${(circ * Math.min(pct, 100)) / 100} ${circ}`
})
const ringColor = computed(() => {
  const pct = dep.value.depreciationProgress
  if (pct < 50) return '#059669'
  if (pct < 85) return '#d97706'
  return '#dc2626'
})

// 12 个月柱图：已过月 indigo，未来月灰色
const monthlyBars = computed(() => {
  const labels = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  const now = new Date()
  const curMonth = now.getMonth() // 0-11
  return labels.map((l, i) => ({ label: l, past: i <= curMonth, value: dep.value.monthlyDepreciation }))
})
function barHeight(info: { value: number }, factor: number) {
  // 固定高度，月度折旧高度一样
  return 75
}

// ============================================================
// 状态流转 timeline
// ============================================================
const statusFlows = computed(() => {
  if (!focused.value) return []
  const f = focused.value
  const base = [
    {
      time: f.purchaseDate + ' 09:00',
      title: '采购入库',
      status: '已入库',
      statusKey: 'idle' as AssetStatus,
      remark: `供应商 ${f.vendor} 交付，批次 ${f.batch}，入库检验合格`,
      user: '采购人 王工',
      type: 'primary'
    },
    {
      time: f.installDate + ' 14:00',
      title: '安装调试',
      status: assetStatusLabel[f.statusKey] || '在役',
      statusKey: f.statusKey,
      remark: `安装于 ${f.poleNo}，通电调试通过，开始投入使用`,
      user: '运维 张工',
      type: f.statusKey === 'inService' ? 'success' : 'primary'
    }
  ]
  // 自定义追加
  return [...customFlows.value, ...base]
})

const nextTransitions = computed(() => {
  if (!focused.value) return []
  const allowed = assetStatusFlow[focused.value.statusKey] || []
  return allowed.map(k => ({ key: k, label: assetStatusLabel[k] }))
})

function onChangeState(target: AssetStatus) {
  if (!focused.value) return
  if (!canTransition(focused.value.statusKey, target)) {
    ElMessage.warning(`不允许从 ${assetStatusLabel[focused.value.statusKey]} 直接转到 ${assetStatusLabel[target]}`)
    return
  }
  ElMessageBox.prompt('请输入变更备注', `变更状态 → ${assetStatusLabel[target]}`, {
    inputValue: `状态变更为 ${assetStatusLabel[target]}`,
    confirmButtonText: '确认变更',
    cancelButtonText: '取消'
  }).then(({ value }) => {
    const now = new Date()
    const time = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    const type: any = target === 'scrapped' ? 'danger' : target === 'recycled' ? 'success' : target === 'repairing' ? 'warning' : 'primary'
    customFlows.value.unshift({
      title: `状态变更 → ${assetStatusLabel[target]}`,
      status: assetStatusLabel[target],
      statusKey: target,
      remark: value || '',
      user: '当前操作员',
      time,
      type
    })
    focused.value.statusKey = target
    focused.value.statusLabel = assetStatusLabel[target]
    ElMessage.success('状态已变更')
  }).catch(() => {})
}

// ============================================================
// 关联工单
// ============================================================
const relatedTickets = computed(() => {
  if (!focused.value) return []
  const baseId = focused.value.id
  return [
    {
      code: `WO2026${String(baseId % 12).padStart(2, '0')}-${String(100 + baseId).slice(-3)}`,
      type: '维修工单', typeTagType: 'danger' as const,
      time: '2026-08-15 09:20', user: '张工',
      result: '已完成修复', resultKey: 'ok'
    },
    {
      code: `WO2026${String(baseId % 6 + 1).padStart(2, '0')}-${String(200 + baseId).slice(-3)}`,
      type: '巡检工单', typeTagType: 'info' as const,
      time: '2026-06-22 14:10', user: '李工',
      result: '巡检通过', resultKey: 'ok'
    }
  ]
})

// ============================================================
// QR 下载 / 打印
// ============================================================
function onDownloadSvg() {
  if (!focused.value) return
  const svg = qrMatrixToSvg(generateQRM(focused.value.code, 25), 6)
  const blob = new Blob([svg], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${focused.value.code}.svg`
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  ElMessage.success('SVG 已下载')
}
function onPrintQr() {
  if (!focused.value) return
  const svg = qrMatrixToSvg(generateQRM(focused.value.code, 25), 8)
  const w = window.open('', '_blank')
  if (!w) return
  w.document.write(`<html><head><title>${focused.value.code}</title></head><body style="display:flex;align-items:center;justify-content:center;height:100vh;margin:0">${svg}</body></html>`)
  w.document.close()
  setTimeout(() => w.print(), 300)
}

// ============================================================
// 对外暴露 open
// ============================================================
function open(row: any) {
  const streets = ['先导路', '麓谷大道', '梅溪湖', '金星大道']
  const street = streets[(row.id - 1) % streets.length]
  focused.value = {
    ...row,
    serialNo: `SN-${String(row.id * 137 + 999).slice(-8)}`,
    location: `长沙市岳麓区 ${street} 与${['金星大道', '岳麓大道', '湘江路'][row.id % 3]}交叉口`,
    warrantyDate: calcWarrantyDate(row.purchaseDate, row.warrantyYears || 3),
    warrantyDays: calcWarrantyDays(row.purchaseDate, row.warrantyYears || 3)
  }
  // 如果状态在流转中，也要保证 statusLabel 正确
  if (focused.value && !focused.value.statusLabel) {
    focused.value.statusLabel = assetStatusLabel[focused.value.statusKey as AssetStatus] || '未知'
  }
  customFlows.value = []
  activeTab.value = 'basic'
  drawerOpen.value = true
}
function close() { drawerOpen.value = false }

defineExpose({ open, close })
</script>

<style scoped lang="scss">
.zg-am-detail {
  --zg-brand-primary: #d97706;
  --zg-success: #059669;
  --zg-warning: #d97706;
  --zg-danger: #dc2626;
  --zg-info: #0284c7;
  --zg-success-soft: #d1fae5;
  --zg-warning-soft: #fef3c7;
  --zg-danger-soft: #fee2e2;
  --zg-info-soft: #e0f2fe;
  --zg-line-soft: rgba(241,245,249,0.8);
  --zg-ink-primary: #18181b;
  --zg-ink-secondary: #52525b;
  --zg-ink-tertiary: #71717a;
  --zg-surface-muted: #f8fafc;
  --zg-radius-md: 10px;
  --zg-radius-lg: 16px;
  --zg-radius-pill: 999px;

  &__top {
    display: flex; justify-content: space-between; align-items: flex-start;
    padding: 14px 16px; background: linear-gradient(135deg, #fffbeb, #fff);
    border-radius: var(--zg-radius-md); margin-bottom: 20px;
  }
  &__headline { display: flex; flex-direction: column; gap: 6px; flex: 1; min-width: 0; }
  &__code { margin: 0; font-size: 18px; font-weight: 700; font-family: 'Geist Mono', ui-monospace, monospace; }
  &__model { font-size: 13px; color: var(--zg-ink-tertiary); }
  &__meta { margin: 0; font-size: 12px; color: var(--zg-ink-tertiary); }

  &__status {
    align-self: flex-start;
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 12px; border-radius: var(--zg-radius-pill);
    font-size: 12px; font-weight: 500;
    .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
    &--idle       { color: var(--zg-info); background: var(--zg-info-soft); }
    &--installing { color: var(--zg-info); background: var(--zg-info-soft); }
    &--inService  { color: var(--zg-success); background: var(--zg-success-soft); }
    &--repairing  { color: var(--zg-warning); background: var(--zg-warning-soft); }
    &--scrapped   { color: var(--zg-danger); background: var(--zg-danger-soft); }
    &--recycled   { color: var(--zg-ink-tertiary); background: #f1f5f9; }
  }

  &__qrcode { text-align: center; background: #fff; padding: 10px; border-radius: var(--zg-radius-md); border: 1px solid var(--zg-line-soft); }
  &__qrcode-label { display: block; font-size: 11px; color: var(--zg-ink-tertiary); margin-top: 6px; }
  &__qrcode-actions { display: flex; gap: 6px; margin-top: 8px; justify-content: center; }

  &__tabs { margin-top: 4px; }
  &__section-title {
    font-size: 14px; font-weight: 600; color: var(--zg-ink-secondary);
    margin: 20px 0 12px; padding-left: 8px; border-left: 3px solid var(--zg-brand-primary);
  }
  &__descs {
    :deep(.el-descriptions__label) { font-weight: 500; color: var(--zg-ink-tertiary); width: 100px; }
  }

  &__kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
  &__kpi-card {
    background: #fff; border: 1px solid var(--zg-line-soft);
    border-radius: var(--zg-radius-md); padding: 14px 16px;
    display: flex; flex-direction: column; gap: 6px;
    position: relative; overflow: hidden;
    &::before { content: ''; position: absolute; left: 0; top: 0; width: 3px; height: 100%; background: var(--zg-brand-primary); }
    &.success::before { background: var(--zg-success); }
    &.warn::before    { background: var(--zg-warning); }
    &.info::before    { background: var(--zg-info); }
    .lbl { font-size: 12px; color: var(--zg-ink-tertiary); }
    .num { font-size: 20px; font-weight: 700; font-variant-numeric: tabular-nums; }
  }

  &__circle-row { display: flex; gap: 24px; align-items: center; padding: 16px; background: var(--zg-surface-muted); border-radius: var(--zg-radius-md); margin-bottom: 8px; }
  &__ring { position: relative; flex-shrink: 0; }
  &__ring-center {
    position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;
    .pct { font-size: 22px; font-weight: 700; font-variant-numeric: tabular-nums; }
    .lbl { font-size: 11px; color: var(--zg-ink-tertiary); text-align: center; margin-top: 2px; }
  }
  &__circle-copy { flex: 1; p { margin: 6px 0; font-size: 13px; line-height: 1.6; strong { color: var(--zg-brand-primary); font-size: 15px; } }
    .formula { margin-top: 10px; padding-top: 10px; border-top: 1px dashed var(--zg-line-soft); font-family: monospace; font-size: 12px; color: var(--zg-ink-tertiary); }
  }

  &__barchart { display: grid; grid-template-columns: repeat(12, 1fr); gap: 6px; align-items: end; height: 180px; padding: 12px; background: var(--zg-surface-muted); border-radius: var(--zg-radius-md); }
  .bar-cell { display: flex; flex-direction: column; align-items: center; gap: 4px; height: 100%; }
  .bar-track { flex: 1; width: 100%; background: #eef2f7; border-radius: 3px; overflow: hidden; display: flex; align-items: flex-end; }
  .bar-fill { width: 100%; border-radius: 3px; min-height: 4px; transition: height 400ms ease; }
  .bar-fill--past { background: linear-gradient(180deg, #6366f1, #4f46e5); }
  .bar-fill--future { background: #cbd5e1; opacity: 0.6; }
  .bar-label { font-size: 11px; color: var(--zg-ink-tertiary); }

  &__transition-bar { padding: 14px; background: var(--zg-surface-muted); border-radius: var(--zg-radius-md); margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
  &__transition-title { font-size: 13px; color: var(--zg-ink-secondary); }
  &__transition-actions { display: flex; gap: 6px; flex-wrap: wrap; }

  &__flow-item {
    &-head { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
    &-title { font-weight: 600; font-size: 14px; }
    &-body { margin: 4px 0; font-size: 13px; line-height: 1.6; color: var(--zg-ink-secondary); }
    &-user { font-size: 12px; color: var(--zg-ink-tertiary); }
  }
  &__flow-status {
    font-size: 11px; padding: 2px 8px; border-radius: var(--zg-radius-pill); font-weight: 500;
    &--idle       { color: var(--zg-info); background: var(--zg-info-soft); }
    &--installing { color: var(--zg-info); background: var(--zg-info-soft); }
    &--inService  { color: var(--zg-success); background: var(--zg-success-soft); }
    &--repairing  { color: var(--zg-warning); background: var(--zg-warning-soft); }
    &--scrapped   { color: var(--zg-danger); background: var(--zg-danger-soft); }
    &--recycled   { color: var(--zg-ink-tertiary); background: #f1f5f9; }
  }

  &__ticket-result { font-weight: 500; font-size: 12px; padding: 2px 8px; border-radius: var(--zg-radius-pill); }
  &__ticket-result--ok { color: var(--zg-success); background: var(--zg-success-soft); }
  &__ticket-result--warn { color: var(--zg-warning); background: var(--zg-warning-soft); }
  &__ticket-result--fail { color: var(--zg-danger); background: var(--zg-danger-soft); }
  .zg-ticket-code { font-family: monospace; font-size: 12px; font-weight: 600; }

  &__footer { display: flex; justify-content: flex-end; gap: 10px; }
}
</style>
