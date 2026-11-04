<!--
  LampFaultDetect.vue — 灯具故障检测（全新）
  目标：灯具坏了 → 能耗还在算 → 节能效果没达到 → EMC 验收通不过
-->
<template>
  <section class="zg-lf-detect">
    <header class="zg-lf-head">
      <div class="zg-lf-head__sigil"><el-icon :size="22"><Sunny /></el-icon></div>
      <div class="zg-lf-head__copy">
        <h1 class="zg-lf-head__title">💡 灯具故障 AI 检测</h1>
        <p class="zg-lf-head__sub">同期亮度对比 · 自动派单 · 能耗联动 · EMC 验收关键数据</p>
      </div>
      <div class="zg-lf-head__live">
        <span class="zg-live-dot on"></span>实时检测中 · 每 30s 刷新
      </div>
    </header>

    <!-- KPI -->
    <div class="zg-lf-kpis">
      <div v-for="k in kpis" :key="k.label" class="zg-lf-kpi">
        <div class="zg-lf-kpi__icon" :style="{ background: k.bg, color: k.color }"><el-icon><component :is="k.icon" /></el-icon></div>
        <div class="zg-lf-kpi__body">
          <div class="zg-lf-kpi__num" :style="{ color: k.color }">{{ k.value }}</div>
          <div class="zg-lf-kpi__lbl">{{ k.label }}</div>
        </div>
      </div>
    </div>

    <!-- 主区：摄像头列表 + 画面 + 故障分布 -->
    <div class="zg-lf-main">
      <!-- 摄像头列表 -->
      <div class="zg-lf-cameras">
        <div class="zg-lf-cameras__head">摄像头 · 灯具视图</div>
        <div
          v-for="c in cameras"
          :key="c.id"
          class="zg-lf-camera"
          :class="{ active: selected?.id === c.id }"
          @click="selected = c"
        >
          <span class="zg-lf-camera__name">{{ c.name }}</span>
          <el-tag size="small" :type="c.faults > 0 ? 'danger' : 'success'">{{ c.faults }} 故障</el-tag>
        </div>
      </div>

      <!-- 画面 -->
      <div class="zg-lf-panel">
        <div class="zg-lf-scene" :style="selected?.bg">
          <!-- SVG：灯具一排 -->
          <svg class="zg-lf-svg" viewBox="0 0 720 260" preserveAspectRatio="none">
            <!-- 天棚 + 墙面 -->
            <rect x="0" y="0" width="720" height="60" fill="#0f172a" />
            <!-- 灯具悬臂 -->
            <line x1="10" y1="50" x2="710" y2="50" stroke="#475569" stroke-width="3" />
            <!-- 灯具 -->
            <g v-for="(lamp, i) in lamps" :key="i">
              <line :x1="lamp.x" y1="50" :x2="lamp.x" y2="80" stroke="#475569" stroke-width="1.5" />
              <rect :x="lamp.x - 28" y="80" width="56" height="20" :fill="lamp.on ? '#fde68a' : '#1e293b'" stroke="#64748b" stroke-width="1" rx="2" />
              <!-- 亮度光晕 -->
              <ellipse v-if="lamp.on" :cx="lamp.x" cy="100" rx="55" ry="30" fill="rgba(253,224,71,0.35)" />
              <!-- 故障标记 -->
              <g v-if="lamp.fault">
                <line v-if="lamp.fault === 'flicker'" :x1="lamp.x - 32" y1="76" :x2="lamp.x + 32" y2="104" stroke="#ef4444" stroke-width="2" stroke-dasharray="3,3">
                  <animate attributeName="opacity" values="1;0.2;1" dur="0.4s" repeatCount="indefinite" />
                </line>
                <text v-else :x="lamp.x" y="95" text-anchor="middle" fill="#ef4444" font-size="20" font-weight="700">✕</text>
              </g>
              <!-- 同期数据 -->
              <text :x="lamp.x" y="130" text-anchor="middle" :fill="lamp.diffColor" font-size="10" font-weight="600">{{ lamp.diff }}</text>
              <text :x="lamp.x" y="144" text-anchor="middle" fill="#94a3b8" font-size="9">{{ lamp.lm }} lm</text>
            </g>
          </svg>

          <!-- AI 检测框（故障灯） -->
          <div class="zg-lf-box" v-for="(b, bi) in faultBoxes" :key="bi" :style="b.style">
            <span class="zg-lf-box__tag" :style="{ background: b.color }">{{ b.label }}</span>
          </div>

          <div class="zg-lf-scene__foot">
            <span class="zg-lf-scene__title">{{ selected?.name }} · {{ selected?.loc }}</span>
            <span>{{ selected?.faults }} 个故障 / 共 {{ lamps.length }} 盏灯</span>
          </div>
        </div>

        <!-- 故障详情表格 -->
        <div class="zg-lf-detail">
          <div class="zg-lf-detail__title">当前画面故障详情</div>
          <el-table :data="lampFaults" size="small" border stripe>
            <el-table-column prop="lamp" label="灯具编号" width="110" />
            <el-table-column prop="type" label="故障类型" width="100">
              <template #default="{ row }">
                <el-tag :type="row.tag" size="small">{{ row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="cur" label="当前亮度" width="100" />
            <el-table-column prop="base" label="同期基准" width="100" />
            <el-table-column prop="diff" label="偏差" width="90">
              <template #default="{ row }">
                <span :style="{ color: row.diff.startsWith('-') ? '#ef4444' : '#f59e0b' }" class="mono">{{ row.diff }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="note" label="故障标记" />
          </el-table>
        </div>
      </div>

      <!-- 右侧：故障分布 + 联动信息 -->
      <div class="zg-lf-side">
        <div class="zg-lf-dist">
          <div class="zg-lf-dist__title">今日故障类型分布</div>
          <div v-for="d in dist" :key="d.label" class="zg-lf-dist__row">
            <span class="zg-lf-dist__lbl">{{ d.label }}</span>
            <div class="zg-lf-dist__bar"><div class="zg-lf-dist__fill" :style="{ width: d.percent + '%', background: d.color }"></div></div>
            <span class="zg-lf-dist__val">{{ d.count }}</span>
          </div>
        </div>

        <div class="zg-lf-link">
          <div class="zg-lf-link__title">🔗 智能联动</div>
          <div class="zg-lf-link__item">
            <el-icon><Coin /></el-icon>
            <span>故障灯具 → 关联能耗模块</span>
          </div>
          <div class="zg-lf-link__item">
            <el-icon><Tickets /></el-icon>
            <span>自动派单：先导路故障 → 换灯师傅王工</span>
          </div>
          <div class="zg-lf-link__item">
            <el-icon><ReadingLamp /></el-icon>
            <span>修复后 → 能耗曲线恢复正常</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部：故障列表 -->
    <div class="zg-lf-table">
      <div class="zg-lf-table__head">
        <span class="zg-lf-table__title">灯具故障列表（{{ faultTable.length }} 条）</span>
        <div>
          <el-tag type="danger">不亮 8</el-tag>
          <el-tag type="warning">亮度异常 12</el-tag>
          <el-tag>闪烁 5</el-tag>
          <el-tag type="info">眩光 2</el-tag>
        </div>
      </div>
      <el-table :data="faultTable" stripe border>
        <el-table-column prop="pole" label="杆桩编号" width="140" />
        <el-table-column prop="lampId" label="灯具编号" width="120" />
        <el-table-column prop="type" label="故障类型" width="120">
          <template #default="{ row }">
            <el-tag :type="row.tag" size="small" effect="light">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="亮度对比" width="220">
          <template #default="{ row }">
            <div class="zg-lf-bright">
              <div class="zg-lf-bright__bar">
                <div class="zg-lf-bright__cur" :style="{ width: row.curPct + '%', background: row.curColor }"></div>
                <div class="zg-lf-bright__base" style="width: 100%"></div>
              </div>
              <span class="zg-lf-bright__lbl">{{ row.cur }} lm / {{ row.base }} lm</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="diff" label="偏差" width="100">
          <template #default="{ row }">
            <span :style="{ color: row.diff.startsWith('-') ? '#ef4444' : '#f59e0b' }" class="mono">{{ row.diff }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="time" label="检测时间" width="140" />
        <el-table-column label="状态" width="180">
          <template #default="{ row }">
            <el-tag :type="row.statusTag" size="small">{{ row.status }}</el-tag>
            <span v-if="row.ticket" class="zg-lf-ticket">· {{ row.ticket }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default>
            <el-button type="primary" link size="small">派单</el-button>
            <el-button link size="small">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Sunny, Monitor, Warning, Tickets, ReadingLamp, Coin, Bell, TrendCharts } from '@element-plus/icons-vue'

const kpis = [
  { label: '在线灯具', value: '8,562', icon: Sunny, bg: '#fef3c7', color: '#f59e0b' },
  { label: '故障检测', value: '27', icon: Bell, bg: '#fee2e2', color: '#ef4444' },
  { label: '其中不亮', value: '8', icon: Warning, bg: '#fee2e2', color: '#ef4444' },
  { label: '亮度/闪烁/眩光', value: '19', icon: TrendCharts, bg: '#fef3c7', color: '#f59e0b' },
  { label: '今日自动派单', value: '18', icon: Tickets, bg: '#dcfce7', color: '#22c55e' }
]

const cameras = ref([
  { id: 1, name: '先导路 #23 段', loc: '岳麓区先导路', faults: 3, bg: 'linear-gradient(180deg, #0f172a, #1e293b)' },
  { id: 2, name: '麓谷产业园 #17', loc: '麓谷产业园北门', faults: 2, bg: 'linear-gradient(180deg, #1e3a8a, #0f172a)' },
  { id: 3, name: '梅溪湖环湖 #18', loc: '梅溪湖环湖路', faults: 1, bg: 'linear-gradient(180deg, #064e3b, #0f172a)' },
  { id: 4, name: '金星大道 #33 段', loc: '金星大道南段', faults: 0, bg: 'linear-gradient(180deg, #0c4a6e, #0f172a)' },
  { id: 5, name: '咸嘉湖路 #07', loc: '咸嘉湖路南段', faults: 4, bg: 'linear-gradient(180deg, #78350f, #0f172a)' },
  { id: 6, name: '岳麓山 #56 段', loc: '岳麓山东门', faults: 0, bg: 'linear-gradient(180deg, #1f2937, #0f172a)' }
])
const selected = ref(cameras.value[0])

// 灯具数据（画面上一排）
const lamps = ref([
  { x: 80,  on: true,  lm: 2780, diff: '同期 -1%', diffColor: '#22c55e' },
  { x: 190, on: true,  lm: 2750, diff: '同期 -2%', diffColor: '#22c55e' },
  { x: 300, on: false, lm: 0,    diff: '同期 -100%', diffColor: '#ef4444', fault: 'off' },
  { x: 410, on: true,  lm: 2800, diff: '基准', diffColor: '#64748b' },
  { x: 520, on: true,  lm: 1620, diff: '同期 -42%', diffColor: '#ef4444', fault: 'dim' },
  { x: 630, on: true,  lm: 2680, diff: '同期 -4%', diffColor: '#f59e0b' }
])

const faultBoxes = [
  { style: { left: '38%', top: '16%', width: '10%', height: '30%' }, label: '不亮 · 置信度 98%', color: '#ef4444' },
  { style: { left: '72%', top: '16%', width: '10%', height: '30%' }, label: '亮度低 42% · 置信度 94%', color: '#f59e0b' }
]

const lampFaults = ref([
  { lamp: 'L-0876', type: '不亮', tag: 'danger', cur: '0 lm', base: '2800 lm', diff: '-100%', note: '同期亮度低 100% · 已自动派单' },
  { lamp: 'L-0931', type: '亮度低', tag: 'warning', cur: '1620 lm', base: '2800 lm', diff: '-42%', note: '同期亮度偏差超过 30% 阈值' }
])

// 故障分布
const dist = ref([
  { label: '不亮', count: 8, percent: 100, color: '#ef4444' },
  { label: '亮度异常', count: 12, percent: 75, color: '#f59e0b' },
  { label: '闪烁', count: 5, percent: 31, color: '#8b5cf6' },
  { label: '眩光超标', count: 2, percent: 13, color: '#f97316' }
])

// 故障表格
const faultTable = ref([
  { pole: '先导路 #23', lampId: 'L-0876', type: '不亮', tag: 'danger', cur: '0', base: '2800', curPct: 0, curColor: '#ef4444', diff: '-100%', time: '14:23', status: '已派单', statusTag: 'success', ticket: 'WO-0041' },
  { pole: '麓谷 #17', lampId: 'L-0931', type: '亮度低', tag: 'warning', cur: '1620', base: '2800', curPct: 58, curColor: '#f59e0b', diff: '-42%', time: '14:18', status: '已派单', statusTag: 'success', ticket: 'WO-0040' },
  { pole: '咸嘉湖 #07', lampId: 'L-0421', type: '闪烁', tag: 'info', cur: '2100', base: '2800', curPct: 75, curColor: '#8b5cf6', diff: '-25%', time: '13:56', status: '待确认', statusTag: 'warning', ticket: '' },
  { pole: '金星大道 #33', lampId: 'L-0662', type: '眩光超标', tag: 'danger', cur: '2500', base: '2800', curPct: 89, curColor: '#f97316', diff: '-11%', time: '13:40', status: '已派单', statusTag: 'success', ticket: 'WO-0038' },
  { pole: '梅溪湖 #18', lampId: 'L-0512', type: '不亮', tag: 'danger', cur: '0', base: '2800', curPct: 0, curColor: '#ef4444', diff: '-100%', time: '13:22', status: '维修中', statusTag: 'info', ticket: 'WO-0037' },
  { pole: '麓谷 #12', lampId: 'L-0987', type: '亮度低', tag: 'warning', cur: '1960', base: '2800', curPct: 70, curColor: '#f59e0b', diff: '-30%', time: '13:08', status: '已派单', statusTag: 'success', ticket: 'WO-0036' },
  { pole: '先导路 #33', lampId: 'L-0711', type: '闪烁', tag: 'info', cur: '2400', base: '2800', curPct: 86, curColor: '#8b5cf6', diff: '-14%', time: '12:45', status: '已确认修复', statusTag: 'success', ticket: '' }
])

// 每 30s 模拟新故障（只加一个就好）
let simTimer
onMounted(() => {
  simTimer = setInterval(() => {
    const lampOn = lamps.value[2]
    if (lampOn.on) {
      lampOn.on = false
      lampOn.lm = 0
      lampOn.fault = 'off'
      lampOn.diff = '同期 -100%'
      lampOn.diffColor = '#ef4444'
    } else {
      lampOn.on = true
      lampOn.lm = 2780
      lampOn.fault = undefined
      lampOn.diff = '同期 -1%'
      lampOn.diffColor = '#22c55e'
    }
  }, 30000)
})
onUnmounted(() => { if (simTimer) clearInterval(simTimer) })
</script>

<style lang="scss" scoped>
.zg-lf-detect {
  --zg-brand-primary: #6366f1;
  --zg-gradient-primary: linear-gradient(135deg, #f59e0b, #f97316);
  --zg-success: #22c55e;
  --zg-warning: #f59e0b;
  --zg-danger: #ef4444;
  --zg-info: #3b82f6;
  padding: 20px;
  background: #f8fafc;
  min-height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif;
}

.zg-lf-head {
  background: var(--zg-gradient-primary);
  border-radius: 12px;
  padding: 18px 22px;
  color: #fff;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 14px;

  &__sigil { width: 42px; height: 42px; border-radius: 10px; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; }
  &__copy { flex: 1; }
  &__title { margin: 0 0 2px; font-size: 17px; font-weight: 600; }
  &__sub { margin: 0; font-size: 12px; opacity: 0.9; }
  &__live { font-size: 12px; background: rgba(0,0,0,0.25); padding: 6px 12px; border-radius: 16px; display: flex; align-items: center; gap: 8px; }
}

.zg-live-dot {
  width: 8px; height: 8px; border-radius: 50%; background: #94a3b8;
  &.on {
    background: #ef4444;
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
    animation: zgPulse 1.5s infinite;
  }
}
@keyframes zgPulse {
  0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}

/* KPI */
.zg-lf-kpis {
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 14px;
}
.zg-lf-kpi {
  background: #fff; border-radius: 10px; padding: 14px 16px;
  box-shadow: 0 4px 12px rgba(15,23,42,0.06);
  display: flex; align-items: center; gap: 12px;
  &__icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
  &__num { font-size: 22px; font-weight: 700; line-height: 1.1; color: #0f172a; }
  &__lbl { font-size: 12px; color: #64748b; margin-top: 2px; }
}

/* 主区 */
.zg-lf-main {
  display: grid;
  grid-template-columns: 240px 1fr 300px;
  gap: 14px;
  margin-bottom: 14px;
}

.zg-lf-cameras {
  background: #fff; border-radius: 10px; box-shadow: 0 4px 12px rgba(15,23,42,0.06);
  padding: 10px;
  &__head { font-size: 13px; font-weight: 600; color: #0f172a; padding: 4px 8px 10px; border-bottom: 1px solid #f1f5f9; }
}
.zg-lf-camera {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 12px; border-radius: 6px; cursor: pointer; margin-bottom: 6px;
  border-left: 3px solid transparent;
  &:hover { background: #f8fafc; }
  &.active { background: #fef3c7; border-left-color: #f59e0b; }
  &__name { font-size: 13px; color: #0f172a; font-weight: 500; }
}

/* 画面面板 */
.zg-lf-panel {
  background: #fff; border-radius: 10px; box-shadow: 0 4px 12px rgba(15,23,42,0.06); padding: 14px;
  display: flex; flex-direction: column; gap: 12px;
}

.zg-lf-scene {
  position: relative; height: 260px; border-radius: 8px; overflow: hidden;
  border: 1px solid #e2e8f0;
  .zg-lf-svg { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
}

.zg-lf-box {
  position: absolute;
  border: 2px dashed;
  border-radius: 2px;
  &__tag {
    position: absolute; top: -22px; left: -2px;
    padding: 2px 8px; font-size: 11px; font-weight: 600; border-radius: 2px; color: #fff; white-space: nowrap;
  }
}

.zg-lf-scene__foot {
  position: absolute; bottom: 0; left: 0; right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
  padding: 10px 14px; color: #fff;
  display: flex; justify-content: space-between; align-items: center; font-size: 12px;
  &__title { font-weight: 600; }
}

/* 详情 */
.zg-lf-detail__title { font-size: 13px; font-weight: 600; color: #0f172a; margin-bottom: 8px; }

/* 侧栏 */
.zg-lf-side { display: flex; flex-direction: column; gap: 14px; }
.zg-lf-dist, .zg-lf-link {
  background: #fff; border-radius: 10px; box-shadow: 0 4px 12px rgba(15,23,42,0.06); padding: 14px;
}
.zg-lf-dist__title, .zg-lf-link__title { font-size: 13px; font-weight: 600; color: #0f172a; margin-bottom: 10px; }
.zg-lf-dist__row { display: grid; grid-template-columns: 80px 1fr 30px; gap: 8px; align-items: center; margin-bottom: 8px; }
.zg-lf-dist__lbl { font-size: 12px; color: #334155; }
.zg-lf-dist__bar { height: 10px; background: #f1f5f9; border-radius: 5px; overflow: hidden; }
.zg-lf-dist__fill { height: 100%; border-radius: 5px; }
.zg-lf-dist__val { font-size: 12px; font-weight: 700; color: #0f172a; text-align: right; }

.zg-lf-link__item { display: flex; align-items: center; gap: 10px; padding: 8px 0; font-size: 12px; color: #334155; border-bottom: 1px dashed #f1f5f9; }
.zg-lf-link__item:last-child { border-bottom: none; }

/* 底部表格 */
.zg-lf-table {
  background: #fff; border-radius: 10px; box-shadow: 0 4px 12px rgba(15,23,42,0.06); padding: 14px;
  &__head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
  &__title { font-size: 14px; font-weight: 600; color: #0f172a; }
}

.zg-lf-bright { display: flex; flex-direction: column; gap: 3px; }
.zg-lf-bright__bar {
  height: 12px; background: #f1f5f9; border-radius: 3px; position: relative; overflow: hidden;
}
.zg-lf-bright__cur {
  position: absolute; left: 0; top: 0; bottom: 0; border-radius: 3px;
  background: repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(0,0,0,0.1) 4px, rgba(0,0,0,0.1) 5px);
}
.zg-lf-bright__base {
  position: absolute; left: 0; top: 0; bottom: 0; border-radius: 3px;
  background: repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(0,0,0,0.15) 4px, rgba(0,0,0,0.15) 5px);
}
.zg-lf-bright__lbl { font-size: 11px; color: #64748b; }

.zg-lf-ticket { font-size: 11px; color: #94a3b8; margin-left: 4px; }
.mono { font-variant-numeric: tabular-nums; font-weight: 600; }
</style>
