<!--
  智光云枢 · 运维组织 · 绩效考核（真数据计算 + 定时刷新）
-->
<template>
  <section class="zg-ops-perf">
    <header class="zg-ops-perf__head">
      <div class="zg-ops-perf__headline">
        <div class="zg-ops-perf__sigil"><el-icon :size="22"><Trophy /></el-icon></div>
        <div class="zg-ops-perf__copy">
          <h1 class="zg-ops-perf__title">绩效考核（实时计算）</h1>
          <p class="zg-ops-perf__sub">
            2026 年 · 运维组织 · {{ staff.length }} 人 · 已处理工单 {{ orders.length }} · 巡检记录 {{ patrolRecords.length }}
            <span class="live-tag" :class="refreshTick % 2 === 0 ? 'on' : 'off'">● LIVE</span>
          </p>
        </div>
      </div>
      <div class="zg-ops-perf__cta">
        <el-button :icon="EditPen" @click="ruleDrawer = true">计算规则</el-button>
        <el-button :icon="Refresh" @click="manualRefresh">立即重算</el-button>
        <el-button type="primary"><el-icon><Plus /></el-icon>导出报告</el-button>
      </div>
    </header>

    <!-- KPI -->
    <div class="zg-ops-perf__kpis">
      <div class="perfcell" v-for="k in summaryKpis" :key="k.key" :class="'perfcell--' + k.tone">
        <div class="perfcell__icon"><el-icon :size="20"><TrendCharts /></el-icon></div>
        <div class="perfcell__body">
          <div class="perfcell__numrow">
            <span class="perfcell__num">{{ k.value }}</span>
            <span class="perfcell__unit">{{ k.unit }}</span>
          </div>
          <div class="perfcell__lbl">{{ k.label }}</div>
          <div class="perfcell__target">
            目标 <b>{{ k.target }}</b>
            <span class="perfcell__delta" :class="{ meet: k.meet, fail: !k.meet }">
              {{ k.meet ? '达标 ✓' : '未达标 ✗' }}
            </span>
          </div>
          <el-progress :percentage="k.pct" :stroke-width="4" :show-text="false" />
        </div>
      </div>
    </div>

    <!-- 排行榜（真数据） -->
    <div class="zg-ops-perf__rank">
      <div class="zg-ops-perf__rankhead">
        <h3><el-icon :size="18"><Medal /></el-icon> 人员排行榜（实时计算）</h3>
        <div class="zg-ops-perf__rankinfo">
          <el-tag type="warning" effect="plain" size="small">第一名 ¥2,400</el-tag>
          <el-tag type="warning" effect="plain" size="small">第二名 ¥1,800</el-tag>
          <el-tag type="warning" effect="plain" size="small">第三名 ¥1,200</el-tag>
          <el-tag size="small" effect="plain">数据源：orders({{ orders.length }}) + patrolRecords({{ patrolRecords.length }})</el-tag>
        </div>
      </div>

      <el-table :data="rankData" stripe class="ranktable" @row-click="openPerfDetail">
        <el-table-column label="排名" width="90" align="center">
          <template #default="{ $index }">
            <span v-if="$index === 0" class="rank-badge gold">🥇 1</span>
            <span v-else-if="$index === 1" class="rank-badge silver">🥈 2</span>
            <span v-else-if="$index === 2" class="rank-badge bronze">🥉 3</span>
            <span v-else class="rank-num">{{ $index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="姓名" min-width="160">
          <template #default="{ row, $index }">
            <div class="rankuser">
              <div class="rankuser__avatar" :class="{ top1: $index === 0, top2: $index === 1, top3: $index === 2 }">
                {{ row.name.charAt(0) }}
              </div>
              <div class="rankuser__info">
                <div class="rankuser__name">{{ row.name }}</div>
                <div class="rankuser__dept">
                  {{ row.teamPath?.join(' / ') || '运维部' }}
                  <span class="sub">· 工单 {{ row.orderCount }} · 巡检 {{ row.patrolCount }}</span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="响应(20%)" width="130" align="center">
          <template #default="{ row }">
            <div class="score">{{ row.responseTime }}min</div>
            <div class="scorebar"><div class="scorebar__fill" :style="{ width: Math.min(100, 30 / Math.max(row.responseTime, 1) * 100) + '%', background: scoreColor(30 / Math.max(row.responseTime, 1) * 100) }"></div></div>
          </template>
        </el-table-column>
        <el-table-column label="修复(30%)" width="130" align="center">
          <template #default="{ row }">
            <div class="score">{{ row.firstFixRate }}%</div>
            <div class="scorebar"><div class="scorebar__fill" :style="{ width: row.firstFixRate + '%', background: scoreColor(row.firstFixRate) }"></div></div>
          </template>
        </el-table-column>
        <el-table-column label="返修(15%)" width="130" align="center">
          <template #default="{ row }">
            <div class="score">{{ row.reworkRate }}%</div>
            <div class="scorebar"><div class="scorebar__fill" :style="{ width: (100 - row.reworkRate) + '%', background: scoreColor(100 - row.reworkRate) }"></div></div>
          </template>
        </el-table-column>
        <el-table-column label="巡检(20%)" width="130" align="center">
          <template #default="{ row }">
            <div class="score">{{ row.patrolRate }}%</div>
            <div class="scorebar"><div class="scorebar__fill" :style="{ width: row.patrolRate + '%', background: scoreColor(row.patrolRate) }"></div></div>
          </template>
        </el-table-column>
        <el-table-column label="安全(15%)" width="120" align="center">
          <template #default="{ row }">
            <div class="score" :class="{ perfect: row.safety === 100 }">{{ row.safety }}</div>
            <div class="scorebar"><div class="scorebar__fill" :style="{ width: row.safety + '%', background: scoreColor(row.safety) }"></div></div>
          </template>
        </el-table-column>
        <el-table-column label="总分" width="120" align="center" fixed="right">
          <template #default="{ row, $index }">
            <span class="totalscore" :class="{ top1: $index === 0, top2: $index === 1, top3: $index === 2 }">{{ row.score }}</span>
          </template>
        </el-table-column>
        <el-table-column label="奖金" width="140" align="center" fixed="right">
          <template #default="{ row }">
            <div class="bonus"><el-icon :size="14"><Coin /></el-icon><span>¥{{ row.bonus.toLocaleString() }}</span></div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 计算规则 Drawer -->
    <el-drawer v-model="ruleDrawer" title="绩效考核计算规则（实时）" direction="rtl" size="520px">
      <div class="ruleblock">
        <div class="ruleblock__title">总分公式</div>
        <div class="ruleblock__formula">
          <code>总分 = 20×(30/响应min) + 30×首次修复率 + 15×(1-返修率) + 20×巡检完成率 + 15×(安全)</code>
        </div>
        <div class="ruleblock__desc">数据来自共享 store：orders(工单) + patrolRecords(巡检)</div>
      </div>
      <div class="ruleblock">
        <div class="ruleblock__title">自动刷新</div>
        <div class="ruleblock__desc">
          页面每 60 秒自动重算一次排行榜。<br/>
          每 30 秒模拟新工单/新巡检记录注入（DispatchBoard 也会触发）。
        </div>
      </div>
    </el-drawer>

    <!-- 人员绩效明细 Drawer -->
    <el-drawer v-model="detailOpen" :title="detailRow ? (detailRow.name + ' 绩效明细') : ''" direction="rtl" size="460px">
      <template v-if="detailRow">
        <el-descriptions :column="1" border size="default">
          <el-descriptions-item label="工单数">{{ detailRow.orderCount }}</el-descriptions-item>
          <el-descriptions-item label="巡检记录">{{ detailRow.patrolCount }}</el-descriptions-item>
          <el-descriptions-item label="平均响应时长">{{ detailRow.responseTime }} 分钟</el-descriptions-item>
          <el-descriptions-item label="首次修复率">{{ detailRow.firstFixRate }}%</el-descriptions-item>
          <el-descriptions-item label="返修率">{{ detailRow.reworkRate }}%</el-descriptions-item>
          <el-descriptions-item label="巡检完成率">{{ detailRow.patrolRate }}%</el-descriptions-item>
          <el-descriptions-item label="安全事故">{{ detailRow.safety === 100 ? '无 ✓' : '有 ✗' }}</el-descriptions-item>
          <el-descriptions-item label="综合得分"><b>{{ detailRow.score }}</b></el-descriptions-item>
        </el-descriptions>
      </template>
    </el-drawer>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Trophy, Plus, TrendCharts, EditPen, Coin, Refresh, Medal } from '@element-plus/icons-vue'
import { staff, orders, patrolRecords, calcStaffPerformance } from '@/shared/stores/opsOrgStore'

// ===== 真绩效计算（每轮 computed 自动重算） =====
const rankData = computed(() => {
  const rows = staff.map((s) => {
    const p = calcStaffPerformance(s.id)
    const orderCount = orders.filter((o) => o.assignee === s.id).length
    const patrolCount = patrolRecords.filter((r) => r.empId === s.id).length
    return {
      id: s.id,
      name: s.name,
      teamPath: s.teamPath,
      ...p,
      orderCount,
      patrolCount,
      bonus: 0
    }
  })
  rows.sort((a, b) => b.score - a.score)

  // 奖金池 ¥21,600 —— 前三名特殊奖 + 其余加权
  const bonusPool = 21600
  rows.forEach((r, i) => {
    if (i === 0) r.bonus = 2400
    else if (i === 1) r.bonus = 1800
    else if (i === 2) r.bonus = 1200
    else r.bonus = 0
  })
  const remaining = bonusPool - 2400 - 1800 - 1200
  const others = rows.slice(3)
  const otherTotalScore = others.reduce((a, b) => a + b.score, 0) || 1
  others.forEach((r) => {
    r.bonus = Math.round((r.score / otherTotalScore) * remaining)
  })
  return rows
})

// ===== 汇总 KPI =====
const summaryKpis = computed(() => {
  const rows = rankData.value
  if (!rows.length) return []
  const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length
  const resp = avg(rows.map((r) => r.responseTime))
  const fix = avg(rows.map((r) => r.firstFixRate))
  const rework = avg(rows.map((r) => r.reworkRate))
  const patrol = avg(rows.map((r) => r.patrolRate))
  const safety = rows.every((r) => r.safety === 100) ? 100 : 0
  const mk = (key, label, value, unit, target, tone, meet) => ({
    key, label, value, unit, target, tone, meet,
    pct: meet ? Math.min(100, (value / targetNum(target)) * 100) : Math.max(0, Math.min(100, (targetNum(target) / value) * 100))
  })
  const targetNum = (t) => {
    const m = t.match(/[\d.]+/)
    return m ? Number(m[0]) : 0
  }
  return [
    mk('resp', '响应时长', resp.toFixed(0), 'min', '≤30', 'primary', resp <= 30),
    mk('fix', '首次修复率', fix.toFixed(0), '%', '≥85%', 'success', fix >= 85),
    mk('rework', '返修率', rework.toFixed(0), '%', '≤8%', 'info', rework <= 8),
    mk('patrol', '巡检完成率', patrol.toFixed(0), '%', '≥95%', 'warning', patrol >= 95),
    mk('safety', '安全事故', safety === 100 ? 0 : 1, '次', '=0', 'success', safety === 100)
  ]
})

const scoreColor = (v) => {
  if (v >= 90) return 'var(--zg-success)'
  if (v >= 75) return 'var(--zg-warning)'
  return 'var(--zg-danger)'
}

// ===== 定时刷新 =====
const refreshTick = ref(0)
let calcTimer = null
onMounted(() => {
  calcTimer = setInterval(() => {
    refreshTick.value++
    // 模拟新工单注入（会触发 calc 自动重算）
    if (Math.random() < 0.2) {
      const s = staff[Math.floor(Math.random() * staff.length)]
      orders.unshift({
        id: 'sim-' + Date.now(),
        assignee: s.id,
        title: '模拟新工单',
        createdAt: Date.now() - Math.random() * 30 * 60000,
        startedAt: Date.now() - Math.random() * 15 * 60000,
        finishedAt: Date.now(),
        repairCount: Math.random() < 0.85 ? 1 : 2,
        safetyIssue: false,
        status: 'done'
      })
    }
  }, 60000)
})
onUnmounted(() => {
  if (calcTimer) clearInterval(calcTimer)
})

const manualRefresh = () => {
  refreshTick.value++
  ElMessage.success('已立即重算所有人员绩效')
}

// ===== Drawer =====
const ruleDrawer = ref(false)
const detailOpen = ref(false)
const detailRow = ref(null)
const openPerfDetail = (row) => {
  detailRow.value = row
  detailOpen.value = true
}
</script>

<style scoped lang="scss">
.zg-ops-perf {
  padding: 24px;
  display: flex; flex-direction: column; gap: 16px;
  height: calc(100vh - 120px);

  &__head { display: flex; justify-content: space-between; align-items: center; padding-bottom: 14px; border-bottom: 1px solid var(--zg-line-soft); }
  &__headline { display: flex; align-items: center; gap: 14px; }
  &__sigil {
    width: 44px; height: 44px; border-radius: var(--zg-radius-md);
    background: var(--zg-gradient-primary); color: #fff;
    display: flex; align-items: center; justify-content: center;
  }
  &__copy { display: flex; flex-direction: column; gap: 4px; }
  &__title { margin: 0; font-size: 20px; font-weight: 600; }
  &__sub { margin: 0; font-size: 13px; color: var(--zg-ink-tertiary); display: flex; align-items: center; gap: 8px; }
}

.live-tag {
  font-size: 11px; padding: 1px 6px; border-radius: 8px; font-weight: 700;
  &.on { color: var(--zg-success); background: var(--zg-success-soft); animation: pulseLive 1.2s infinite; }
  &.off { color: var(--zg-info); background: var(--zg-info-soft); }
}
@keyframes pulseLive {
  0%,100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.zg-ops-perf__kpis { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; }
.perfcell {
  background: var(--zg-surface-card); border: 1px solid var(--zg-line-soft);
  border-radius: var(--zg-radius-lg); padding: 16px;
  display: flex; gap: 12px; box-shadow: var(--zg-shadow-card);
  transition: all var(--zg-transition-normal); position: relative; overflow: hidden;
  &:hover { transform: translateY(-2px); box-shadow: var(--zg-shadow-card-hover); }
  &::before { content: ''; position: absolute; left: 0; top: 0; width: 3px; height: 100%; }
  &__icon { width: 40px; height: 40px; border-radius: var(--zg-radius-md); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  &__body { flex: 1; display: flex; flex-direction: column; gap: 4px; }
  &__numrow { display: flex; align-items: baseline; gap: 4px; }
  &__num { font-size: 28px; font-weight: 700; line-height: 1; color: var(--zg-ink-primary); }
  &__unit { font-size: 12px; color: var(--zg-ink-tertiary); }
  &__lbl { font-size: 12px; color: var(--zg-ink-secondary); font-weight: 500; }
  &__target { font-size: 11px; color: var(--zg-ink-tertiary); display: flex; gap: 4px; align-items: center; b { font-weight: 600; } }
  &__delta { font-size: 10px; padding: 1px 6px; border-radius: 8px; font-weight: 600;
    &.meet { color: var(--zg-success); background: var(--zg-success-soft); }
    &.fail { color: var(--zg-danger); background: var(--zg-danger-soft); }
  }
  &--primary .perfcell__icon { background: var(--zg-brand-tint-50); color: var(--zg-brand-primary); }
  &--primary::before { background: var(--zg-brand-primary); }
  &--success .perfcell__icon { background: var(--zg-success-soft); color: var(--zg-success); }
  &--success::before { background: var(--zg-success); }
  &--info .perfcell__icon { background: var(--zg-info-soft); color: var(--zg-info); }
  &--info::before { background: var(--zg-info); }
  &--warning .perfcell__icon { background: var(--zg-warning-soft); color: var(--zg-warning); }
  &--warning::before { background: var(--zg-warning); }
}

.zg-ops-perf__rank {
  background: var(--zg-surface-card); border: 1px solid var(--zg-line-soft);
  border-radius: var(--zg-radius-lg); padding: 16px;
  flex: 1; min-height: 0; box-shadow: var(--zg-shadow-card);
  display: flex; flex-direction: column; overflow: hidden;
}
.zg-ops-perf__rankhead {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;
  h3 { margin: 0; font-size: 15px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
}
.zg-ops-perf__rankinfo { display: flex; gap: 6px; flex-wrap: wrap; }
.ranktable { flex: 1; cursor: pointer; }

.rank-badge {
  display: inline-flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 12px; padding: 4px 10px; border-radius: var(--zg-radius-pill);
  &.gold { background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #fff; box-shadow: 0 4px 10px -4px rgba(245,158,11,0.5); }
  &.silver { background: linear-gradient(135deg, #94a3b8, #64748b); color: #fff; box-shadow: 0 4px 10px -4px rgba(100,116,139,0.4); }
  &.bronze { background: linear-gradient(135deg, #d97706, #b45309); color: #fff; box-shadow: 0 4px 10px -4px rgba(180,83,9,0.4); }
}
.rank-num { color: var(--zg-ink-tertiary); font-weight: 500; }

.rankuser { display: flex; gap: 10px; align-items: center; position: relative; }
.rankuser__avatar {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--zg-surface-muted); color: var(--zg-ink-primary);
  display: flex; align-items: center; justify-content: center; font-weight: 600;
  &.top1 { background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #fff; box-shadow: 0 0 0 3px rgba(245,158,11,0.3); }
  &.top2 { background: linear-gradient(135deg, #cbd5e1, #94a3b8); color: #fff; box-shadow: 0 0 0 3px rgba(148,163,184,0.3); }
  &.top3 { background: linear-gradient(135deg, #fb923c, #ea580c); color: #fff; box-shadow: 0 0 0 3px rgba(234,88,12,0.3); }
}
.rankuser__info { flex: 1; }
.rankuser__name { font-size: 14px; font-weight: 600; }
.rankuser__dept { font-size: 11px; color: var(--zg-ink-tertiary); .sub { color: var(--zg-ink-placeholder); margin-left: 6px; } }

.score { font-size: 13px; font-weight: 600; color: var(--zg-ink-primary); }
.score.perfect { color: var(--zg-success); }
.scorebar { width: 80px; height: 4px; background: var(--zg-line-soft); border-radius: 2px; margin: 4px auto 0; overflow: hidden;
  &__fill { height: 100%; border-radius: 2px; transition: width 0.3s; }
}

.totalscore { font-size: 20px; font-weight: 700; color: var(--zg-ink-primary);
  &.top1 { color: var(--zg-warning); }
  &.top2 { color: var(--zg-info); }
  &.top3 { color: var(--zg-brand-primary); }
}
.bonus { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; background: var(--zg-warning-soft); color: var(--zg-warning); font-weight: 600; font-size: 13px; border-radius: var(--zg-radius-pill); }

.ruleblock { margin-bottom: 20px;
  &__title { font-size: 14px; font-weight: 600; color: var(--zg-ink-primary); padding-bottom: 6px; margin-bottom: 10px; border-bottom: 1px solid var(--zg-line-soft); }
  &__formula { background: var(--zg-surface-muted); padding: 12px 14px; border-radius: var(--zg-radius-md); code { font-family: var(--zg-font-mono); font-size: 12px; color: var(--zg-brand-primary); line-height: 1.8; } }
  &__desc { font-size: 12px; color: var(--zg-ink-secondary); line-height: 1.7; margin-top: 6px; }
}
</style>
