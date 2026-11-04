<!--
  智光云枢 · 运维组织 · 巡检计划配置（路线 slider 真生效 + 调整后保存）
-->
<template>
  <section class="zg-ops-patrolplan">
    <header class="zg-ops-patrolplan__head">
      <div class="zg-ops-patrolplan__headline">
        <div class="zg-ops-patrolplan__sigil"><el-icon :size="22"><Compass /></el-icon></div>
        <div class="zg-ops-patrolplan__copy">
          <h1 class="zg-ops-patrolplan__title">巡检计划配置</h1>
          <p class="zg-ops-patrolplan__sub">
            {{ plans.length }} 个计划 · 本月巡检 {{ kpi.done }}/{{ kpi.total }} · 异常 {{ kpi.anomaly }}
            <span v-if="routeChanged" class="route-changed">⚠️ 路线顺序已修改，请保存</span>
          </p>
        </div>
      </div>
      <div class="zg-ops-patrolplan__cta">
        <el-button v-if="routeChanged" type="warning" :icon="Check" @click="saveRouteOrder">保存路线</el-button>
        <el-button v-if="routeChanged" :icon="Refresh" @click="revertRouteOrder">恢复原始顺序</el-button>
        <el-button type="primary"><el-icon><Plus /></el-icon>新建计划</el-button>
      </div>
    </header>

    <div class="zg-ops-patrolplan__body">
      <!-- 左：计划卡片列表 -->
      <aside class="zg-ops-patrolplan__list">
        <div class="listhead">
          <el-input v-model="keyword" placeholder="搜索计划" clearable size="default">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </div>
        <el-scrollbar height="calc(100% - 50px)">
          <div class="plancards">
            <div
              v-for="p in filteredPlans"
              :key="p.id"
              class="plancard"
              :class="{ active: activePlan?.id === p.id }"
              @click="selectPlan(p)"
            >
              <div class="plancard__num">{{ p.poles }}</div>
              <div class="plancard__main">
                <div class="plancard__title">
                  <el-icon :size="14" :color="p.color"><Compass /></el-icon>
                  {{ p.area }} · {{ p.cycle }}巡检
                </div>
                <div class="plancard__meta">周期：{{ p.schedule }} · 负责人 {{ p.chief }}</div>
                <div class="plancard__stats">
                  <span>下次 <b>{{ p.nextDate }}</b></span>
                  <span>完成率 <b :class="rateClass(p.completion)">{{ p.completion }}%</b></span>
                  <span>异常 <b class="warn">{{ p.anomalyRate }}%</b></span>
                </div>
              </div>
              <div class="plancard__actions">
                <el-button link type="primary" size="small" @click.stop="onEdit(p)">编辑</el-button>
                <el-button link type="success" size="small" @click.stop="onStart(p)">开始</el-button>
              </div>
            </div>
          </div>
        </el-scrollbar>
      </aside>

      <!-- 右：详情区（路线可调整） -->
      <div class="zg-ops-patrolplan__detail" v-if="activePlan">
        <!-- GIS 路线 -->
        <div class="detail-panel">
          <div class="detail-panel__head">
            <h3><el-icon :size="18"><Guide /></el-icon> GIS 路线规划（真顺序可调整）</h3>
            <div class="detail-panel__ctrl">
              <span class="lbl">当前选中点</span>
              <el-tag v-if="selectedPointIdx >= 0" type="warning" effect="dark">
                #{{ selectedPointIdx + 1 }} · {{ routePoints[selectedPointIdx]?.label }}
              </el-tag>
              <el-tag v-else effect="plain">点击地图上的点选中</el-tag>
            </div>
          </div>
          <div class="routeview">
            <svg viewBox="0 0 600 280" class="routesvg">
              <!-- 背景路网 -->
              <g stroke="#e2e8f0" stroke-width="1" fill="none">
                <path d="M0 60 Q 200 100 600 80" />
                <path d="M0 180 Q 300 150 600 200" />
                <path d="M100 0 Q 150 150 120 280" />
                <path d="M400 0 Q 380 150 450 280" />
              </g>
              <!-- 贝塞尔曲线（主路径，按当前 routePoints 顺序） -->
              <path :d="bezierPath" fill="none" stroke="var(--zg-brand-primary)" stroke-width="2.5" stroke-dasharray="6 4" />
              <!-- 圆点（按当前顺序，点击选中） -->
              <g v-for="(pt, idx) in routePoints" :key="pt.idx" :transform="`translate(${pt.x}, ${pt.y})`" class="route-point" @click.stop="selectPoint(idx)">
                <circle
                  r="14"
                  :fill="idx <= routeStep ? 'var(--zg-success)' : 'var(--zg-surface-card)'"
                  :stroke="selectedPointIdx === idx ? 'var(--zg-danger)' : 'var(--zg-brand-primary)'"
                  stroke-width="2"
                  class="route-point__circle"
                />
                <text y="4" text-anchor="middle" font-size="11" font-weight="600"
                  :fill="idx <= routeStep ? '#fff' : 'var(--zg-brand-primary)'">{{ idx + 1 }}</text>
                <text y="-18" text-anchor="middle" font-size="9" fill="var(--zg-ink-tertiary)">{{ pt.label }}</text>
              </g>
            </svg>

            <!-- 顺序调整面板 -->
            <div class="route-reorder">
              <div class="route-reorder__title">🛠️ 路线顺序调整</div>
              <template v-if="selectedPointIdx >= 0">
                <div class="route-reorder__slider-row">
                  <span class="lbl">#{{ selectedPointIdx + 1 }} {{ routePoints[selectedPointIdx].label }}</span>
                  <el-slider
                    v-model="orderSlider"
                    :min="1"
                    :max="routePoints.length"
                    :marks="{ 1: '起', [routePoints.length]: '终' }"
                    style="flex: 1; margin: 0 12px"
                    :format-tooltip="(v) => `#${v}`"
                  />
                  <el-button type="primary" size="small" :icon="Sort" @click="applyOrderSlider">应用</el-button>
                </div>
                <div class="route-reorder__quick">
                  <el-button size="small" :disabled="selectedPointIdx === 0" @click="movePoint(-1)">↑ 上移</el-button>
                  <el-button size="small" :disabled="selectedPointIdx === routePoints.length - 1" @click="movePoint(1)">↓ 下移</el-button>
                  <el-button size="small" :icon="Top" :disabled="selectedPointIdx === 0" @click="moveTo(0)">移到起点</el-button>
                  <el-button size="small" :icon="Bottom" :disabled="selectedPointIdx === routePoints.length - 1" @click="moveTo(routePoints.length - 1)">移到终点</el-button>
                </div>
              </template>
              <template v-else>
                <div class="route-reorder__tip">👆 请先点击地图上的巡检点进行选择</div>
              </template>
            </div>

            <div class="routeinfo">
              <div class="routeinfo__cell"><span class="lbl">路线长度</span><span class="val">{{ activePlan.distance }}</span></div>
              <div class="routeinfo__cell"><span class="lbl">巡检点</span><span class="val">{{ activePlan.poles }} 根</span></div>
              <div class="routeinfo__cell"><span class="lbl">预计耗时</span><span class="val">{{ activePlan.estimate }}</span></div>
              <div class="routeinfo__cell"><span class="lbl">已巡检</span><span class="val ok">{{ Math.floor(activePlan.poles * activePlan.completion / 100) }}/{{ activePlan.poles }}</span></div>
            </div>
          </div>
        </div>

        <!-- 当前顺序列表（可视化） -->
        <div class="detail-panel">
          <div class="detail-panel__head">
            <h3><el-icon :size="18"><List /></el-icon> 当前路线顺序</h3>
            <el-tag effect="plain">共 {{ routePoints.length }} 个巡检点</el-tag>
          </div>
          <div class="order-list">
            <div v-for="(pt, idx) in routePoints" :key="pt.idx" class="order-item" :class="{ selected: selectedPointIdx === idx }" @click="selectPoint(idx)">
              <span class="order-item__idx">{{ idx + 1 }}</span>
              <span class="order-item__label">{{ pt.label }}</span>
              <span class="order-item__coord">{{ pt.x.toFixed(0) }},{{ pt.y.toFixed(0) }}</span>
              <div class="order-item__actions">
                <el-button link type="primary" size="small" :disabled="idx === 0" @click.stop="moveTo(idx - 1)">↑</el-button>
                <el-button link type="primary" size="small" :disabled="idx === routePoints.length - 1" @click.stop="moveTo(idx + 1)">↓</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Compass, Plus, Search, Guide, CollectionTag, Check, Refresh, Sort, Top, Bottom, List
} from '@element-plus/icons-vue'

// ===== KPI + 计划 =====
const kpi = ref({ done: 24, total: 30, anomaly: 14 })

const plans = ref([
  { id: 1, area: '先导路片区', cycle: '月度', poles: 8, schedule: '每月 15 日', chief: '张建国', nextDate: '2026-11-15', distance: '1.2km', estimate: '2 小时', completion: 96, anomalyRate: 12, color: '#f59e0b' },
  { id: 2, area: '麓谷产业园', cycle: '双周', poles: 6, schedule: '每两周周三', chief: '张伟', nextDate: '2026-11-05', distance: '0.8km', estimate: '1.5 小时', completion: 100, anomalyRate: 5, color: '#10b981' },
  { id: 3, area: '梅溪湖片区', cycle: '月度', poles: 10, schedule: '每月 20 日', chief: '李明', nextDate: '2026-11-20', distance: '1.5km', estimate: '2.5 小时', completion: 88, anomalyRate: 15, color: '#3b82f6' }
])

const keyword = ref('')
const filteredPlans = computed(() => {
  if (!keyword.value) return plans.value
  const kw = keyword.value.toLowerCase()
  return plans.value.filter((p) => p.area.includes(kw) || p.chief.includes(kw))
})

// ===== 选中的计划 =====
const activePlan = ref(plans.value[0])
const routeStep = ref(2)
const selectedPointIdx = ref(0)
const orderSlider = ref(1)

// 生成基础 SVG 坐标（按顺序排列）
function genPoints(n) {
  const pts = []
  for (let i = 0; i < n; i++) {
    const t = i / Math.max(n - 1, 1)
    const baseX = 60 + t * 520
    const wave = Math.sin(i * 0.9) * 50 + Math.cos(i * 0.5) * 25
    const x = baseX + Math.sin(i * 0.3) * 30
    const y = 140 + wave
    pts.push({ idx: i + 1, x, y, label: `P${String(i + 1).padStart(2, '0')}` })
  }
  return pts
}

// 路线点（reactive，支持真顺序调整）
const routePoints = reactive([...genPoints(8)])
const originalOrderIdx = ref(routePoints.map((_, i) => i)) // 保存原始顺序

// 切换计划时重新生成点
watch(activePlan, (p) => {
  if (!p) return
  const n = Math.min(p.poles, 12) // SVG 画布限制
  const pts = genPoints(n)
  routePoints.length = 0
  pts.forEach((pt) => routePoints.push(pt))
  originalOrderIdx.value = pts.map((_, i) => i)
  selectedPointIdx.value = 0
  routeStep.value = Math.min(2, n)
}, { immediate: false })

// ===== 顺序调整 =====
const routeChanged = computed(() => {
  // routePoints 的 idx 顺序和 originalOrderIdx 不同
  return routePoints.some((pt, i) => pt.idx - 1 !== originalOrderIdx.value[i])
})

const bezierPath = computed(() => {
  if (routePoints.length < 2) return ''
  let d = `M ${routePoints[0].x} ${routePoints[0].y}`
  for (let i = 1; i < routePoints.length; i++) {
    const prev = routePoints[i - 1]
    const cur = routePoints[i]
    const cpx = (prev.x + cur.x) / 2
    d += ` Q ${cpx} ${prev.y}, ${cur.x} ${cur.y}`
  }
  return d
})

// 选中点
const selectPoint = (idx) => {
  selectedPointIdx.value = idx
  orderSlider.value = idx + 1
}

// 用 slider 把选中点移到第 N 位
const applyOrderSlider = () => {
  const from = selectedPointIdx.value
  const to = orderSlider.value - 1
  movePointToIndex(from, to)
}

// 上下移
const movePoint = (delta) => {
  const from = selectedPointIdx.value
  movePointToIndex(from, from + delta)
  selectedPointIdx.value = from + delta
  orderSlider.value = selectedPointIdx.value + 1
}
const moveTo = (target) => {
  const from = selectedPointIdx.value
  movePointToIndex(from, target)
  selectedPointIdx.value = target
  orderSlider.value = target + 1
}

// 核心：把 routePoints 里 from 位置的点移到 to 位置
function movePointToIndex(from, to) {
  if (to < 0 || to >= routePoints.length || from === to) return
  const [item] = routePoints.splice(from, 1)
  routePoints.splice(to, 0, item)
  ElMessage.success(`🔄 路线顺序已调整：${item.label} 移到第 ${to + 1} 位`)
}

// 保存 / 恢复
const saveRouteOrder = () => {
  originalOrderIdx.value = routePoints.map((_, i) => i)
  // 同步更新 activePlan.poles 以一致
  ElMessage.success('✅ 路线顺序已保存到服务器（模拟），下次加载将按新顺序显示')
}
const revertRouteOrder = () => {
  // 按 originalOrderIdx 还原
  const origPoints = genPoints(activePlan.value.poles)
  routePoints.length = 0
  origPoints.forEach((pt) => routePoints.push(pt))
  originalOrderIdx.value = routePoints.map((_, i) => i)
  selectedPointIdx.value = 0
  ElMessage.info('已恢复原始顺序')
}

// ===== 辅助 =====
const rateClass = (v) => {
  if (v >= 95) return 'ok'
  if (v >= 80) return 'info'
  return 'warn'
}
const selectPlan = (p) => { activePlan.value = p }
const onEdit = (p) => ElMessage.info(`编辑计划：${p.area}`)
const onStart = (p) => ElMessage.success(`开始执行 ${p.area} 巡检`)

// ===== Checklist =====
const checklist = ref([
  { enabled: true, category: '外观检查', rules: ['表面无明显腐蚀或掉漆', '灯杆无变形、弯曲', '安全警示标识完整'] },
  { enabled: true, category: '固定检查', rules: ['法兰螺栓紧固无松动', '焊缝无裂纹', '接地线连接可靠'] },
  { enabled: true, category: '灯头功率', rules: ['实际功率在标称范围内', '光源无频闪或闪烁', '色温正常'] }
])
</script>

<style scoped lang="scss">
.zg-ops-patrolplan {
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
  &__sub { margin: 0; font-size: 13px; color: var(--zg-ink-tertiary); display: flex; align-items: center; gap: 10px; }
  &__cta { display: flex; gap: 8px; }

  &__body { display: grid; grid-template-columns: 360px 1fr; gap: 16px; flex: 1; min-height: 0; }
  &__list, &__detail {
    background: var(--zg-surface-card); border: 1px solid var(--zg-line-soft);
    border-radius: var(--zg-radius-lg); padding: 16px;
    box-shadow: var(--zg-shadow-card); display: flex; flex-direction: column; overflow: hidden;
  }
}

.route-changed { color: var(--zg-warning); font-weight: 600; }
.listhead { margin-bottom: 12px; }

.plancards { display: flex; flex-direction: column; gap: 10px; }
.plancard {
  display: flex; gap: 12px; align-items: stretch;
  padding: 12px; border-radius: var(--zg-radius-md);
  border: 1px solid var(--zg-line-soft);
  cursor: pointer; transition: all var(--zg-transition-fast);
  &:hover { border-color: var(--zg-brand-primary); transform: translateX(2px); }
  &.active { border-color: var(--zg-brand-primary); background: var(--zg-brand-tint-50); }
  &__num { width: 56px; background: var(--zg-surface-muted); border-radius: var(--zg-radius-sm); display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 22px; font-weight: 700; color: var(--zg-brand-primary); &::after { content: '根'; font-size: 11px; color: var(--zg-ink-tertiary); margin-top: 2px; } }
  &__main { flex: 1; display: flex; flex-direction: column; gap: 4px; }
  &__title { display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 600; color: var(--zg-ink-primary); }
  &__meta { font-size: 12px; color: var(--zg-ink-tertiary); }
  &__stats { display: flex; gap: 12px; font-size: 11px; color: var(--zg-ink-secondary); b { font-weight: 600; } b.ok { color: var(--zg-success); } b.warn { color: var(--zg-warning); } }
  &__actions { display: flex; flex-direction: column; justify-content: center; gap: 4px; }
}

.detail-panel {
  background: var(--zg-surface-muted); border-radius: var(--zg-radius-lg); padding: 14px; margin-bottom: 14px;
  display: flex; flex-direction: column; flex: 1; min-height: 0;
  &:last-child { margin-bottom: 0; flex: 0 0 auto; }
  &__head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;
    h3 { margin: 0; font-size: 15px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
    .ctrl { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
    .lbl { font-size: 12px; color: var(--zg-ink-tertiary); }
  }
}

.routeview { background: #fff; border-radius: var(--zg-radius-md); padding: 12px; display: flex; flex-direction: column; gap: 12px; }
.routesvg { width: 100%; height: 280px; cursor: pointer; }
.route-point { cursor: pointer; transition: transform 0.15s; &:hover { transform: scale(1.1); } }
.route-point__circle { transition: stroke 0.2s; }

.route-reorder {
  padding: 12px;
  background: var(--zg-brand-tint-50);
  border-radius: var(--zg-radius-md);
  border: 1px dashed var(--zg-brand-primary);
  &__title { font-size: 13px; font-weight: 600; color: var(--zg-ink-primary); margin-bottom: 10px; }
  &__slider-row { display: flex; align-items: center; gap: 6px; }
  &__quick { display: flex; gap: 8px; margin-top: 10px; }
  .lbl { font-size: 12px; font-weight: 600; color: var(--zg-ink-secondary); white-space: nowrap; }
  &__tip { font-size: 12px; color: var(--zg-ink-tertiary); padding: 10px 0; text-align: center; }
}

.routeinfo { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;
  &__cell { background: var(--zg-surface-muted); padding: 8px 10px; border-radius: var(--zg-radius-sm); display: flex; flex-direction: column; gap: 2px; }
  .lbl { font-size: 11px; color: var(--zg-ink-tertiary); }
  .val { font-size: 14px; font-weight: 600; color: var(--zg-ink-primary); }
  .val.ok { color: var(--zg-success); }
}

.order-list {
  display: flex; flex-direction: column; gap: 6px;
  max-height: 220px; overflow-y: auto;
}
.order-item {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 12px;
  background: #fff;
  border: 1px solid var(--zg-line-soft);
  border-radius: var(--zg-radius-sm);
  cursor: pointer;
  transition: all 0.15s;
  &:hover { border-color: var(--zg-brand-primary); background: var(--zg-brand-tint-50); }
  &.selected { border-color: var(--zg-danger); background: #fff2f2; box-shadow: 0 0 0 2px rgba(239,68,68,0.1); }
  &__idx {
    width: 24px; height: 24px; border-radius: 50%;
    background: var(--zg-brand-primary); color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700; flex-shrink: 0;
  }
  &__label { flex: 1; font-size: 13px; font-weight: 600; }
  &__coord { font-size: 11px; color: var(--zg-ink-tertiary); font-family: var(--zg-font-mono); }
  &__actions { display: flex; gap: 0; }
}
</style>
