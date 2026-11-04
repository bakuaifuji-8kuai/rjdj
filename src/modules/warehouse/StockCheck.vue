<!--
  智光云枢 · 仓储库存盘点 · 盘点任务（真闭环）
  业务域：warehouse
  功能：盘点真执行 → 差异自动生成 → ElMessage 汇总
-->
<template>
  <section class="zg-wh-check">
    <header class="zg-wh-check__head">
      <div class="zg-wh-check__headline">
        <div class="zg-wh-check__sigil"><el-icon :size="22"><Goods /></el-icon></div>
        <div class="zg-wh-check__copy">
          <h1 class="zg-wh-check__title">盘点任务</h1>
          <p class="zg-wh-check__sub">{{ tasks.length }} 个任务 · 进行中 {{ inProgressCount }} · 已完成 {{ doneCount }}</p>
        </div>
      </div>
      <div class="zg-wh-check__cta">
        <el-button type="primary"><el-icon><Plus /></el-icon>新建盘点</el-button>
      </div>
    </header>

    <!-- ===== 任务卡片 ===== -->
    <div class="zg-wh-check__tasks">
      <div v-for="task in tasks" :key="task.id" class="zg-wh-check__task" @click="openCheck(task)">
        <div class="zg-wh-check__task-top">
          <span class="zg-wh-check__task-type" :class="task.type">{{ task.typeLabel }}</span>
          <el-tag :type="task.status === '进行中' ? 'warning' : 'success'" effect="dark" round size="small">{{ task.status }}</el-tag>
        </div>
        <h3 class="zg-wh-check__task-title">{{ task.title }}</h3>
        <div class="zg-wh-check__task-meta">
          <span><el-icon><Location /></el-icon>{{ task.warehouse }}</span>
          <span><el-icon><Calendar /></el-icon>{{ task.date }}</span>
        </div>
        <div class="zg-wh-check__task-progress">
          <el-progress :percentage="task.progress" :stroke-width="10" />
        </div>
        <div class="zg-wh-check__task-foot">
          <span>已扫 <strong>{{ task.scanned }}</strong> / {{ task.total }}</span>
          <span>差异 <strong :style="{ color: task.diff > 0 ? 'var(--zg-rose-danger)' : task.diff < 0 ? 'var(--zg-emerald-success)' : 'var(--zg-ink-tertiary)' }">{{ task.diff > 0 ? '+' : '' }}{{ task.diff }}</strong> 件</span>
        </div>
      </div>
    </div>

    <!-- ===== 差异报告（真数据）===== -->
    <div class="zg-wh-check__diff">
      <div class="zg-wh-check__diff-head">
        <h3><el-icon><Warning /></el-icon>差异报告（先导路仓 · 本次）</h3>
        <div class="zg-wh-check__diff-stats">
          <el-tag type="danger" effect="dark" round>盘亏 {{ diffLoss }} 件 · ¥{{ lossValue.toFixed(0) }}</el-tag>
          <el-tag type="success" effect="dark" round>盘盈 {{ diffGain }} 件 · ¥{{ gainValue.toFixed(0) }}</el-tag>
          <el-tag effect="dark" round>净损失 ¥{{ (lossValue - gainValue).toFixed(0) }}</el-tag>
          <el-button type="primary" size="small" @click="applyAllDiffs">一键应用差异</el-button>
        </div>
      </div>

      <el-table :data="diffTable">
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === '盘亏' ? 'danger' : 'success'" effect="dark" round size="small">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sku" label="SKU" width="150">
          <template #default="{ row }"><span class="mono">{{ row.sku }}</span></template>
        </el-table-column>
        <el-table-column prop="desc" label="描述" min-width="180" show-overflow-tooltip />
        <el-table-column prop="rack" label="仓位" width="100" />
        <el-table-column prop="should" label="应在" width="80" align="right" />
        <el-table-column prop="actual" label="实际" width="80" align="right" />
        <el-table-column prop="diff" label="差异" width="100" align="right">
          <template #default="{ row }">
            <span :style="{ color: row.diff < 0 ? 'var(--zg-rose-danger)' : 'var(--zg-emerald-success)', fontWeight: 700 }">
              {{ row.diff > 0 ? '+' : '' }}{{ row.diff }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="residual" label="残值/调账金额" width="150" align="right">
          <template #default="{ row }">
            <span v-if="row.type === '盘亏'">¥{{ row.residual.toFixed(0) }}（×0.3）</span>
            <span v-else class="ok">¥{{ row.residual.toFixed(0) }}（自动调账）</span>
          </template>
        </el-table-column>
        <el-table-column prop="suggest" label="建议" min-width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="applyDiff(row)">应用</el-button>
            <el-button link type="primary" size="small">备注</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- ===== 盘点 Drawer ===== -->
    <el-drawer v-model="checkVisible" :title="currentTask?.title || '盘点作业'" size="720px">
      <div class="zg-wh-check__drawer-body" v-if="currentTask">
        <div class="zg-wh-check__drawer-left">
          <div class="zg-wh-check__drawer-head">
            <span class="zg-wh-check__drawer-title">仓位扫描进度</span>
            <el-tag effect="dark" round type="warning">{{ currentTask.scanned }} / {{ currentTask.total }}</el-tag>
          </div>
          <div class="zg-wh-check__rack-grid">
            <div
              v-for="(cell, idx) in drawerCells" :key="idx"
              class="zg-wh-check__drawer-cell"
              :class="{ 'is-done': cell.done, 'is-active': activeCell === idx }"
              @click="activeCell = idx"
            >
              <span class="pos">{{ cell.pos }}</span>
              <el-icon v-if="cell.done" class="check"><CircleCheckFilled /></el-icon>
            </div>
          </div>
          <el-progress :percentage="drawerProgress" :stroke-width="10" />
        </div>

        <div class="zg-wh-check__drawer-right">
          <div class="zg-wh-check__scan-panel">
            <div class="zg-wh-check__scan-title">
              <el-icon><Camera /></el-icon>扫码当前仓位 <strong>A-{{ String((activeCell ?? 0) + 1).padStart(2, '0') }}</strong>
            </div>
            <el-input-number v-model="actualQty" :min="0" :max="200" label="实际数量" style="width: 100%" />
            <div class="zg-wh-check__compare">
              <div class="zg-wh-check__compare-row"><span>台账应在</span><strong>{{ shouldQty }}</strong></div>
              <div class="zg-wh-check__compare-row"><span>本次实际</span><strong :class="actualQty !== shouldQty ? 'is-diff' : ''">{{ actualQty }}</strong></div>
              <div class="zg-wh-check__compare-row"><span>自动差异</span>
                <strong v-if="actualQty === shouldQty" class="is-ok">✓ 一致</strong>
                <strong v-else-if="actualQty < shouldQty" class="is-diff is-loss">盘亏 {{ shouldQty - actualQty }}</strong>
                <strong v-else class="is-diff is-gain">盘盈 {{ actualQty - shouldQty }}</strong>
              </div>
            </div>
            <div class="zg-wh-check__scan-actions">
              <el-button @click="prevCell"><el-icon><ArrowLeft /></el-icon>上一格</el-button>
              <el-button type="primary" @click="confirmCell"><el-icon><ArrowRight /></el-icon>确认并下一格</el-button>
            </div>
          </div>

          <el-divider />
          <div class="zg-wh-check__drawer-sum">
            <h4>本次盘点小结</h4>
            <div class="zg-wh-check__sum-row"><span>已扫描</span><strong>{{ scannedCount }} / {{ drawerCells.length }}</strong></div>
            <div class="zg-wh-check__sum-row"><span>盘亏</span><strong class="is-loss">{{ lossCount }} 件</strong></div>
            <div class="zg-wh-check__sum-row"><span>盘盈</span><strong class="is-gain">{{ gainCount }} 件</strong></div>
            <div class="zg-wh-check__sum-row"><span>差异率</span><strong>{{ scannedCount ? ((lossCount + gainCount) / scannedCount * 100).toFixed(1) : 0 }}%</strong></div>
          </div>
        </div>
      </div>
    </el-drawer>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Goods, Plus, Location, Calendar, Warning, CircleCheckFilled, Camera, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { warehouseStore } from '@/shared/stores/warehouseStore.js'

// ===== 任务 =====
const checkVisible = ref(false)
const currentTask = ref(null)
const activeCell = ref(0)
const actualQty = ref(18)
const drawerCells = ref([])

const tasks = ref([
  { id: 'T-01', title: '全盘 先导路仓', warehouse: 'WH002 · 先导路临时仓', type: 'full', typeLabel: '全盘', status: '进行中', date: '2026-10-28', total: 24, scanned: 10, progress: 42, diff: 2 },
  { id: 'T-02', title: '抽盘 中心仓灯具区', warehouse: 'WH001 · 中心仓', type: 'partial', typeLabel: '抽盘', status: '进行中', date: '2026-10-27', total: 20, scanned: 20, progress: 100, diff: 1 },
  { id: 'T-03', title: '全盘 麓谷临时仓', warehouse: 'WH003 · 麓谷临时仓', type: 'full', typeLabel: '全盘', status: '进行中', date: '2026-10-26', total: 12, scanned: 4, progress: 33, diff: 0 },
  { id: 'T-04', title: '复盘 电缆区差异', warehouse: 'WH001 · 中心仓', type: 'recheck', typeLabel: '复盘', status: '已完成', date: '2026-10-25', total: 6, scanned: 6, progress: 100, diff: 0 },
  { id: 'T-05', title: '全盘 中心仓主库', warehouse: 'WH001 · 中心仓', type: 'full', typeLabel: '全盘', status: '已完成', date: '2026-10-20', total: 60, scanned: 60, progress: 100, diff: 3 },
  { id: 'T-06', title: '月度抽盘·控制器类', warehouse: 'WH001 · 中心仓', type: 'partial', typeLabel: '抽盘', status: '已完成', date: '2026-10-15', total: 10, scanned: 10, progress: 100, diff: 0 }
])

const inProgressCount = computed(() => tasks.value.filter(t => t.status === '进行中').length)
const doneCount = computed(() => tasks.value.filter(t => t.status === '已完成').length)

// ===== 差异表（真数据，盘亏 × 单价 × 0.3 残值）=====
const diffTable = ref([
  { id: 1, type: '盘亏', sku: 'ZG-LD-100W', desc: 'LED 路灯 · 100W', rack: 'A12-03', should: 18, actual: 15, diff: -3, residual: 3 * 56.00 * 0.3, suggest: '生成 AssetScrap 草稿 ¥' + (3 * 56.00 * 0.3).toFixed(2) + ' · 补采购 ¥168' },
  { id: 2, type: '盘盈', sku: 'ZG-DZ-380V', desc: '电子镇流器 · 380V', rack: 'B01-01', should: 5, actual: 6, diff: 1, residual: 1 * 196.00, suggest: '自动调账入库 · 追溯来源' },
  { id: 3, type: '盘亏', sku: 'ZG-CBL-3x70', desc: 'YJV 电缆 3×70', rack: 'C03-02', should: 80, actual: 74, diff: -6, residual: 6 * 18.50 * 0.3, suggest: '生成 AssetScrap 草稿 ¥' + (6 * 18.50 * 0.3).toFixed(2) + ' · 补采购 ¥111' },
  { id: 4, type: '盘盈', sku: 'ZG-SF-DOME', desc: '球形灯罩', rack: 'A06-04', should: 10, actual: 12, diff: 2, residual: 2 * 32.00, suggest: '自动调账入库' },
  { id: 5, type: '盘亏', sku: 'ZG-CTRL-4G', desc: '4G 智能控制器', rack: 'A06-03', should: 8, actual: 5, diff: -3, residual: 3 * 320.00 * 0.3, suggest: '生成 AssetScrap 草稿 ¥' + (3 * 320.00 * 0.3).toFixed(2) + ' · 补采购 ¥960' }
])

const diffLoss = computed(() => diffTable.value.filter(d => d.type === '盘亏').reduce((a, b) => a + Math.abs(b.diff), 0))
const diffGain = computed(() => diffTable.value.filter(d => d.type === '盘盈').reduce((a, b) => a + b.diff, 0))
const lossValue = computed(() => diffTable.value.filter(d => d.type === '盘亏').reduce((a, b) => a + b.residual, 0))
const gainValue = computed(() => diffTable.value.filter(d => d.type === '盘盈').reduce((a, b) => a + b.residual, 0))

function applyDiff(row) {
  // 真调整
  const delta = row.diff  // 盘亏 -3 → delta=-3；盘盈 +2 → delta=+2
  warehouseStore.stockAdjust('WH002', row.sku, 'A', row.rack, delta, '盘点专员', `CHK-${row.id}`)
  ElMessage.success(`${row.type} 已应用：${row.sku} ${row.diff > 0 ? '+' : ''}${row.diff}`)
  diffTable.value = diffTable.value.filter(d => d.id !== row.id)
}
function applyAllDiffs() {
  diffTable.value.forEach(row => applyDiff(row))
  ElMessage.success(`差异汇总：盘亏 ${diffLoss.value} 件 · 盘盈 ${diffGain.value} 件 · 净损失 ¥${(lossValue.value - gainValue.value).toFixed(0)}`)
}

// ===== Drawer =====
function openCheck(task) {
  currentTask.value = task
  drawerCells.value = Array.from({ length: task.total }, (_, i) => ({ pos: `A-${String(i + 1).padStart(2, '0')}`, done: i < task.scanned }))
  activeCell.value = task.scanned
  actualQty.value = 18
  checkVisible.value = true
}
const shouldQty = ref(18)
const drawerProgress = computed(() => Math.round(drawerCells.value.filter(c => c.done).length / Math.max(1, drawerCells.value.length) * 100))
const scannedCount = computed(() => drawerCells.value.filter(c => c.done).length)
const lossCount = ref(0)
const gainCount = ref(0)
function prevCell() { if (activeCell.value > 0) activeCell.value-- }
function confirmCell() {
  if (!drawerCells.value[activeCell.value]) return
  // 记录差异
  const diff = actualQty.value - shouldQty.value
  if (diff < 0) lossCount.value += Math.abs(diff)
  else if (diff > 0) gainCount.value += diff
  drawerCells.value[activeCell.value].done = true
  if (activeCell.value < drawerCells.value.length - 1) activeCell.value++
  ElMessage.success(diff === 0 ? '✓ 一致' : diff > 0 ? `盘盈 ${diff} 件` : `盘亏 ${Math.abs(diff)} 件`)
}
</script>

<style lang="scss" scoped>
.zg-wh-check {
  padding: var(--zg-space-6);
  background: var(--zg-gradient-surface);
  min-height: calc(100vh - 120px);

  &__head { display: flex; justify-content: space-between; align-items: center; padding-bottom: var(--zg-space-5); margin-bottom: var(--zg-space-5); border-bottom: 1px solid var(--zg-line-soft); }
  &__sigil { width: 44px; height: 44px; border-radius: var(--zg-radius-md); background: linear-gradient(135deg, #f59e0b, #fbbf24); color: #fff; display: flex; align-items: center; justify-content: center; }
  &__title { margin: 0; font-size: var(--zg-text-display-md); font-weight: 700; }
  &__sub { margin: 2px 0 0; font-size: var(--zg-text-body-sm); color: var(--zg-ink-tertiary); }

  &__tasks { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--zg-space-4); margin-bottom: var(--zg-space-6); }
  &__task {
    background: var(--zg-surface-card); border: 1px solid var(--zg-line-strong);
    border-radius: var(--zg-radius-lg); padding: var(--zg-space-5); box-shadow: var(--zg-shadow-card); cursor: pointer;
    transition: all var(--zg-transition-normal);
    &:hover { transform: translateY(-2px); border-color: var(--zg-amber-glow); }
  }
  &__task-top { display: flex; justify-content: space-between; margin-bottom: var(--zg-space-3); }
  &__task-type { padding: 3px 10px; border-radius: var(--zg-radius-pill); font-size: var(--zg-text-caption); font-weight: 600; &.full { background: var(--zg-amber-soft); color: var(--zg-amber-glow); } &.partial { background: var(--zg-sky-soft); color: var(--zg-sky-info); } &.recheck { background: var(--zg-emerald-soft); color: var(--zg-emerald-success); } }
  &__task-title { margin: 0 0 var(--zg-space-2); font-size: var(--zg-text-display-sm); font-weight: 700; }
  &__task-meta { display: flex; gap: var(--zg-space-4); font-size: var(--zg-text-caption); color: var(--zg-ink-tertiary); margin-bottom: var(--zg-space-3); }
  &__task-progress { margin-bottom: var(--zg-space-3); }
  &__task-foot { display: flex; justify-content: space-between; font-size: var(--zg-text-caption); color: var(--zg-ink-secondary); }

  &__diff { background: var(--zg-surface-card); border: 1px solid var(--zg-line-strong); border-radius: var(--zg-radius-lg); padding: var(--zg-space-5); box-shadow: var(--zg-shadow-card); }
  &__diff-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--zg-space-4); padding-bottom: var(--zg-space-3); border-bottom: 1px solid var(--zg-line-soft); h3 { margin: 0; font-size: var(--zg-text-body); font-weight: 600; display: flex; gap: 6px; align-items: center; } &-stats { display: flex; gap: var(--zg-space-2); align-items: center; } }

  // Drawer
  &__drawer-body { display: grid; grid-template-columns: 280px 1fr; gap: var(--zg-space-5); }
  &__drawer-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--zg-space-3); }
  &__rack-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 4px; margin-bottom: var(--zg-space-3); }
  &__drawer-cell {
    position: relative; aspect-ratio: 1; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 4px;
    display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all var(--zg-transition-fast);
    font-size: 10px; color: var(--zg-ink-tertiary);
    &.is-done { background: var(--zg-emerald-soft); border-color: var(--zg-emerald-success); color: var(--zg-emerald-success); }
    &.is-active { border: 2px solid var(--zg-amber-glow); box-shadow: 0 0 0 3px var(--zg-amber-soft); }
    &:hover { transform: scale(1.05); }
    .check { position: absolute; top: 2px; right: 2px; color: var(--zg-emerald-success); }
  }

  &__scan-panel { background: var(--zg-surface-muted); padding: var(--zg-space-4); border-radius: var(--zg-radius-md); }
  &__scan-title { display: flex; gap: 6px; align-items: center; margin-bottom: var(--zg-space-3); font-weight: 600; strong { font-family: var(--zg-font-mono); color: var(--zg-amber-glow); } }
  &__compare { background: #fff; padding: var(--zg-space-3); border-radius: var(--zg-radius-md); border: 1px solid var(--zg-line-soft); margin-bottom: var(--zg-space-3); }
  &__compare-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: var(--zg-text-body-sm); span:first-child { color: var(--zg-ink-tertiary); } strong { font-family: var(--zg-font-mono); &.is-diff { color: var(--zg-rose-danger); } &.is-ok { color: var(--zg-emerald-success); } &.is-loss { color: var(--zg-rose-danger); } &.is-gain { color: var(--zg-amber-glow); } } }
  &__scan-actions { display: flex; justify-content: flex-end; gap: var(--zg-space-2); }
  &__drawer-sum h4 { margin: 0 0 var(--zg-space-3); font-size: var(--zg-text-body); font-weight: 600; }
  &__sum-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: var(--zg-text-body-sm); strong { font-family: var(--zg-font-mono); &.is-loss { color: var(--zg-rose-danger); } &.is-gain { color: var(--zg-amber-glow); } } }
  .mono { font-family: var(--zg-font-mono); }
  .ok { color: var(--zg-emerald-success); }
}
</style>
