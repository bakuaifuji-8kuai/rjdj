<!--
  智光云枢 · 杆桩运营 · 信息发布屏广告排期
  业务域：poleBiz
  功能：智慧灯杆 LED 屏台账 + 24h 可视化排期时间轴 + 实时播放状态监控
        参考：长沙先导路 P2.5/P3 LED 屏运营、商业户外屏 CPM 计费
-->
<template>
  <section class="zg-ad">
    <header class="zg-ad__head">
      <div class="zg-ad__headline">
        <div class="zg-ad__sigil">
          <el-icon :size="22"><Promotion /></el-icon>
        </div>
        <div class="zg-ad__copy">
          <h1 class="zg-ad__title">信息发布屏 · 广告排期</h1>
          <p class="zg-ad__sub">
            {{ totalBoards }} 块 LED 屏在役 · 今日投放 {{ todayPlayCount }} 次 ·
            曝光 {{ todayExposure.toLocaleString() }} · 公益信息 {{ publicAdCount }} 条
          </p>
        </div>
      </div>
    </header>

    <!-- ============ Tab 切换 ============ -->
    <el-tabs v-model="activeTab" class="zg-ad__tabs">
      <el-tab-pane label="📺 屏体台账" name="boards">
        <!-- 屏体 KPI -->
        <div class="zg-metrics">
          <div class="zg-metrics__cell"><span class="zg-metrics__num">{{ boardList.length }}</span><span class="zg-metrics__lbl">屏体总数</span></div>
          <div class="zg-metrics__cell zg-metrics__cell--ok"><span class="zg-metrics__num">{{ onlineBoardCount }}</span><span class="zg-metrics__lbl">在线运行</span></div>
          <div class="zg-metrics__cell zg-metrics__cell--info"><span class="zg-metrics__num">{{ schedulerRunningCount }}</span><span class="zg-metrics__lbl">排期执行中</span></div>
          <div class="zg-metrics__cell zg-metrics__cell--warn"><span class="zg-metrics__num">¥{{ monthlyRevenue.toLocaleString() }}</span><span class="zg-metrics__lbl">月均广告收入</span></div>
        </div>

        <!-- 屏体网格 -->
        <div class="zg-ad__board-grid">
          <div
            v-for="board in boardList"
            :key="board.id"
            class="zg-ad-board-card"
            :class="{ 'zg-ad-board-card--offline': board.panelStatus !== 'ONLINE', 'zg-ad-board-card--fault': board.panelStatus === 'FAULT' }"
            @click="openBoardDetail(board)"
          >
            <!-- 模拟屏体画面 -->
            <div class="zg-ad-board-card__screen">
              <div v-if="board.panelStatus === 'ONLINE' && board.runningAds.length" class="zg-ad-board-card__ad-preview">
                <div class="zg-ad-board-card__ad-brand">{{ adBrandMap[board.runningAds[0]] || '公益信息' }}</div>
                <div class="zg-ad-board-card__ad-sub">{{ board.geoLabel }}</div>
              </div>
              <div v-else-if="board.panelStatus === 'FAULT'" class="zg-ad-board-card__fault">
                <el-icon :size="32" color="#ef4444"><Warning /></el-icon>
                <span>屏体故障</span>
              </div>
              <div v-else class="zg-ad-board-card__offline">待机中</div>
              <span class="zg-ad-board-card__live-dot" :class="{ on: board.panelStatus === 'ONLINE' }"></span>
            </div>

            <div class="zg-ad-board-card__info">
              <div class="zg-ad-board-card__name">{{ board.name }}</div>
              <div class="zg-ad-board-card__spec">
                <el-tag size="small" type="info">{{ board.pitch }}</el-tag>
                <el-tag size="small">{{ board.size }}</el-tag>
                <el-tag size="small" type="warning">{{ board.orientation }}</el-tag>
              </div>
              <div class="zg-ad-board-card__meta">
                <span>{{ board.geoLabel }}</span>
                <span>{{ board.brightness }}</span>
              </div>
              <div class="zg-ad-board-card__stats">
                <span>▶ {{ board.todayPlayCount }} 次</span>
                <span>👁 {{ formatNum(board.todayExposure) }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="📅 广告排期" name="schedule">
        <!-- 排期时间轴（当前选中某块屏的 24h 排期）-->
        <div class="zg-ad__timeline-header">
          <div class="zg-ad__timeline-title">
            <strong>{{ activeBoardForSchedule?.name || '选择屏体' }}</strong>
            <span class="zg-ad__timeline-date">· {{ scheduleDate }}</span>
          </div>
          <el-select v-model="activeBoardIdForSchedule" placeholder="选择屏体" style="width: 260px">
            <el-option v-for="b in boardList.filter(x => x.panelStatus === 'ONLINE')" :key="b.id" :label="b.name" :value="b.id" />
          </el-select>
        </div>

        <!-- 24h 排期轴 -->
        <div class="zg-ad__timeline">
          <!-- 时间刻度 -->
          <div class="zg-ad__timeline-ticks">
            <span v-for="h in 25" :key="h" class="zg-ad__tick">{{ (h - 1).toString().padStart(2, '0') }}:00</span>
          </div>
          <!-- 时间轴 -->
          <div class="zg-ad__timeline-bar">
            <!-- 背景网格 -->
            <div class="zg-ad__timeline-grid">
              <span v-for="h in 24" :key="h" class="zg-ad__grid-cell"></span>
            </div>
            <!-- 排条 -->
            <div
              v-for="(slot, idx) in activeBoardSchedules"
              :key="idx"
              class="zg-ad__schedule-slot"
              :class="'priority-' + slot.priority"
              :style="{
                left: hh2percent(slot.slotStart) + '%',
                width: hh2percentWidth(slot.slotStart, slot.slotEnd) + '%'
              }"
              :title="slot.brand + ' · ' + slot.slotStart + ' ~ ' + slot.slotEnd"
            >
              <span class="slot-brand">{{ slot.brand }}</span>
              <span class="slot-range">{{ slot.slotStart }}~{{ slot.slotEnd }}</span>
            </div>
          </div>

          <!-- 图例 -->
          <div class="zg-ad__legend">
            <span class="lg-item"><i class="lg-dot lg-dot--1"></i>优先级1（商业黄金档）</span>
            <span class="lg-item"><i class="lg-dot lg-dot--2"></i>优先级2</span>
            <span class="lg-item"><i class="lg-dot lg-dot--3"></i>优先级3</span>
            <span class="lg-item"><i class="lg-dot lg-dot--0"></i>公益信息</span>
          </div>
        </div>

        <!-- 排期明细表格 -->
        <el-table :data="activeBoardSchedules" stripe size="default" style="margin-top: 16px" empty-text="当前屏今日无排期">
          <el-table-column prop="adId" label="广告 ID" width="90" />
          <el-table-column prop="brand" label="广告主" min-width="160" />
          <el-table-column prop="mediaType" label="形式" width="120" />
          <el-table-column label="时段" width="160" align="center">
            <template #default="{ row }">
              <el-tag effect="plain" round>{{ row.slotStart }} ~ {{ row.slotEnd }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="优先级" width="90" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.priority === 0" type="info" size="small">公益</el-tag>
              <el-tag v-else size="small">P{{ row.priority }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="合同期" min-width="200">
            <template #default="{ row }">{{ row.startDate }} ~ {{ row.endDate }}</template>
          </el-table-column>
          <el-table-column label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.status === 'ACTIVE' || row.status === 'PUBLIC'" type="success" size="small">生效中</el-tag>
              <el-tag v-else type="info" size="small">待生效</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="CPM" width="80" align="right">
            <template #default="{ row }">{{ row.cpm === 0 ? '免费' : '¥' + row.cpm }}</template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- ========== 屏体详情 Drawer ========== -->
    <el-drawer v-model="boardDetailVisible" :title="boardDetailFocus?.name" size="560px">
      <div v-if="boardDetailFocus" class="zg-ad__board-detail">
        <section class="zg-ad__section">
          <h4 class="zg-ad__section-title">📺 屏体规格</h4>
          <div class="zg-ad__grid">
            <div class="zg-ad__cell"><span class="lbl">屏体编号</span><span class="val">{{ boardDetailFocus.id }}</span></div>
            <div class="zg-ad__cell"><span class="lbl">挂装灯杆</span><span class="val">{{ boardDetailFocus.poleId }}</span></div>
            <div class="zg-ad__cell"><span class="lbl">物理分辨率</span><span class="val">{{ boardDetailFocus.pitch }}</span></div>
            <div class="zg-ad__cell"><span class="lbl">物理尺寸</span><span class="val">{{ boardDetailFocus.size }}</span></div>
            <div class="zg-ad__cell"><span class="lbl">亮度</span><span class="val">{{ boardDetailFocus.brightness }}</span></div>
            <div class="zg-ad__cell"><span class="lbl">朝向</span><span class="val">{{ boardDetailFocus.orientation }}</span></div>
            <div class="zg-ad__cell zg-ad__cell--full"><span class="lbl">位置</span><span class="val">{{ boardDetailFocus.geoLabel }}</span></div>
            <div class="zg-ad__cell zg-ad__cell--full"><span class="lbl">备注</span><span class="val">{{ boardDetailFocus.remark }}</span></div>
          </div>
        </section>

        <section class="zg-ad__section">
          <h4 class="zg-ad__section-title">📊 今日运营</h4>
          <div class="zg-ad__stats">
            <div class="zg-ad__stat"><span class="num">{{ boardDetailFocus.todayPlayCount }}</span><span class="lbl">播放次数</span></div>
            <div class="zg-ad__stat"><span class="num">{{ formatNum(boardDetailFocus.todayExposure) }}</span><span class="lbl">曝光量</span></div>
            <div class="zg-ad__stat"><span class="num">{{ boardDetailFocus.runningAds.length }}</span><span class="lbl">当前广告</span></div>
            <div class="zg-ad__stat">
              <span class="num" :class="{'zg-gb__val--danger': boardDetailFocus.panelStatus !== 'ONLINE'}">
                {{ boardDetailFocus.panelStatus === 'ONLINE' ? '● 在线' : boardDetailFocus.panelStatus === 'FAULT' ? '✖ 故障' : '○ 离线' }}
              </span>
              <span class="lbl">屏体状态</span>
            </div>
          </div>
        </section>

        <section v-if="boardDetailFocus.panelStatus === 'FAULT' && boardDetailFocus.faultTrace" class="zg-ad__section">
          <h4 class="zg-ad__section-title zg-ad__section-title--danger">⚠️ 故障详情</h4>
          <div class="zg-ad__fault-box">{{ boardDetailFocus.faultTrace }}</div>
        </section>
      </div>
    </el-drawer>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Promotion, Warning } from '@element-plus/icons-vue'
import { adBoards, adSchedules } from '@/data/mockData'

const boardList = ref([])
const scheduleList = ref([])
const activeTab = ref('boards')
const activeBoardIdForSchedule = ref('AD004')  // 默认选中芙蓉广场黄金屏
const scheduleDate = new Date().toISOString().slice(0, 10)
const boardDetailVisible = ref(false)
const boardDetailFocus = ref(null)

const init = () => {
  boardList.value = JSON.parse(JSON.stringify(adBoards))
  scheduleList.value = JSON.parse(JSON.stringify(adSchedules))
}

const adBrandMap = computed(() => {
  const m = {}
  scheduleList.value.forEach(s => { m[s.adId] = s.brand })
  return m
})

const activeBoardForSchedule = computed(() => boardList.value.find(b => b.id === activeBoardIdForSchedule.value))
const activeBoardSchedules = computed(() => {
  return scheduleList.value
    .filter(s => s.adBoardId === activeBoardIdForSchedule.value)
    .sort((a, b) => hh2num(a.slotStart) - hh2num(b.slotStart))
})

// ===== KPI =====
const totalBoards = computed(() => boardList.value.length)
const onlineBoardCount = computed(() => boardList.value.filter(b => b.panelStatus === 'ONLINE').length)
const schedulerRunningCount = computed(() => boardList.value.filter(b => b.schedulerStatus === 'RUNNING').length)
const todayPlayCount = computed(() => boardList.value.reduce((s, b) => s + b.todayPlayCount, 0))
const todayExposure = computed(() => boardList.value.reduce((s, b) => s + b.todayExposure, 0))
const publicAdCount = computed(() => scheduleList.value.filter(s => s.status === 'PUBLIC').length)
const monthlyRevenue = computed(() => {
  // 粗略估算：每月 30 天，每条排期 CPM * 播放次数 / 1000
  return scheduleList.value
    .filter(s => s.cpm > 0)
    .reduce((s, r) => s + r.cpm * r.bookedSlots / 1000 * 30, 0)
    .toFixed(0)
})

// ===== 工具 =====
const hh2num = (hh) => { const [h, m] = hh.split(':').map(Number); return h + m / 60 }
const hh2percent = (hh) => hh2num(hh) / 24 * 100
const hh2percentWidth = (start, end) => Math.max(2, hh2percent(end) - hh2percent(start))

const formatNum = (n) => {
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w'
  return n.toLocaleString()
}

const openBoardDetail = (b) => { boardDetailFocus.value = b; boardDetailVisible.value = true }

onMounted(() => init())
</script>

<style scoped lang="scss">
.zg-ad { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
.zg-ad__head { display: flex; justify-content: space-between; align-items: center; }
.zg-ad__headline { display: flex; align-items: center; gap: 14px; }
.zg-ad__sigil { width: 44px; height: 44px; border-radius: 10px; background: linear-gradient(135deg, #f59e0b, #ef4444); color: #fff; display: flex; align-items: center; justify-content: center; }
.zg-ad__title { font-size: 20px; font-weight: 600; color: #1f2d3d; margin: 0 0 4px; }
.zg-ad__sub { font-size: 13px; color: #909399; margin: 0; }

// KPI
.zg-metrics { display: flex; gap: 12px; flex-wrap: wrap; }
.zg-metrics__cell { flex: 1; min-width: 140px; background: #fff; border-radius: 12px; padding: 14px 18px; border: 1px solid #f0f0f0; display: flex; flex-direction: column; gap: 4px; }
.zg-metrics__num { font-size: 22px; font-weight: 700; color: #1f2d3d; }
.zg-metrics__lbl { font-size: 12px; color: #909399; }
.zg-metrics__cell--ok .zg-metrics__num { color: #10b981; }
.zg-metrics__cell--info .zg-metrics__num { color: #6366f1; }
.zg-metrics__cell--warn .zg-metrics__num { color: #f59e0b; }

// Tab
.zg-ad__tabs :deep(.el-tabs__item) { font-size: 14px; }

// 屏体卡片网格
.zg-ad__board-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }
.zg-ad-board-card { background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #f0f0f0; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; }
.zg-ad-board-card:hover { box-shadow: 0 4px 16px rgba(245,158,11,0.15); border-color: #f59e0b; transform: translateY(-2px); }
.zg-ad-board-card--offline .zg-ad-board-card__screen { background: #374151; }
.zg-ad-board-card--fault { border-color: #ef4444; }
.zg-ad-board-card--fault .zg-ad-board-card__screen { background: #fef2f2; }

.zg-ad-board-card__screen {
  position: relative; height: 140px;
  background: linear-gradient(135deg, #1f2937, #4b5563);
  display: flex; align-items: center; justify-content: center; overflow: hidden;
}
.zg-ad-board-card__ad-preview { text-align: center; color: #fff; }
.zg-ad-board-card__ad-brand { font-size: 20px; font-weight: 700; letter-spacing: 2px; text-shadow: 0 2px 8px rgba(0,0,0,0.5); }
.zg-ad-board-card__ad-sub { font-size: 11px; color: #fde68a; margin-top: 4px; }
.zg-ad-board-card__offline { color: #9ca3af; font-size: 12px; }
.zg-ad-board-card__fault { text-align: center; color: #ef4444; }
.zg-ad-board-card__fault span { display: block; font-size: 12px; margin-top: 4px; }

.zg-ad-board-card__live-dot {
  position: absolute; top: 8px; right: 8px; width: 8px; height: 8px; border-radius: 50%;
  background: #6b7280;
}
.zg-ad-board-card__live-dot.on { background: #10b981; box-shadow: 0 0 6px #10b981; animation: blink 1.5s infinite; }
@keyframes blink { 0%,100% { opacity: 1 } 50% { opacity: 0.3 } }

.zg-ad-board-card__info { padding: 12px; display: flex; flex-direction: column; gap: 6px; }
.zg-ad-board-card__name { font-size: 14px; font-weight: 600; color: #1f2d3d; }
.zg-ad-board-card__spec { display: flex; gap: 4px; flex-wrap: wrap; }
.zg-ad-board-card__meta { display: flex; justify-content: space-between; font-size: 11px; color: #909399; }
.zg-ad-board-card__stats { display: flex; justify-content: space-between; font-size: 11px; color: #6366f1; font-family: monospace; padding-top: 4px; border-top: 1px solid #f0f0f0; }

// ========== 排期时间轴（核心亮点）==========
.zg-ad__timeline-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.zg-ad__timeline-title strong { font-size: 15px; color: #1f2d3d; }
.zg-ad__timeline-date { color: #909399; font-size: 13px; margin-left: 6px; }

.zg-ad__timeline { background: #fff; border-radius: 12px; padding: 14px 14px 18px; border: 1px solid #f0f0f0; }
.zg-ad__timeline-ticks { display: grid; grid-template-columns: repeat(25, 1fr); padding: 0 0 4px 0; }
.zg-ad__tick { font-size: 10px; color: #909399; text-align: left; }

.zg-ad__timeline-bar { position: relative; height: 42px; }
.zg-ad__timeline-grid { position: absolute; inset: 0; display: grid; grid-template-columns: repeat(24, 1fr); }
.zg-ad__grid-cell { border-right: 1px dashed #e5e7eb; }
.zg-ad__grid-cell:last-child { border-right: none; }

.zg-ad__schedule-slot {
  position: absolute; top: 4px; height: 34px;
  border-radius: 4px; padding: 2px 8px;
  display: flex; align-items: center; gap: 8px;
  font-size: 12px; font-weight: 600; color: #fff;
  overflow: hidden; white-space: nowrap;
  cursor: pointer; transition: transform 0.15s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.12);
}
.zg-ad__schedule-slot:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
.priority-1 { background: linear-gradient(90deg, #ef4444, #f59e0b); }
.priority-2 { background: linear-gradient(90deg, #6366f1, #8b5cf6); }
.priority-3 { background: linear-gradient(90deg, #0ea5e9, #22d3ee); }
.priority-0 { background: linear-gradient(90deg, #10b981, #84cc16); }

.slot-brand { flex-shrink: 0; }
.slot-range { opacity: 0.8; font-size: 10px; }

.zg-ad__legend { display: flex; gap: 14px; margin-top: 10px; font-size: 11px; color: #606266; }
.lg-item { display: flex; align-items: center; gap: 4px; }
.lg-dot { width: 14px; height: 8px; border-radius: 2px; display: inline-block; }
.lg-dot--1 { background: linear-gradient(90deg, #ef4444, #f59e0b); }
.lg-dot--2 { background: linear-gradient(90deg, #6366f1, #8b5cf6); }
.lg-dot--3 { background: linear-gradient(90deg, #0ea5e9, #22d3ee); }
.lg-dot--0 { background: linear-gradient(90deg, #10b981, #84cc16); }

// Drawer
.zg-ad__section { margin-bottom: 22px; }
.zg-ad__section-title { font-size: 14px; font-weight: 600; color: #1f2d3d; margin: 0 0 12px; padding-left: 8px; border-left: 3px solid #f59e0b; }
.zg-ad__section-title--danger { border-left-color: #ef4444; color: #ef4444; }

.zg-ad__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 14px; }
.zg-ad__cell { background: #f9fafb; border-radius: 8px; padding: 10px 12px; display: flex; flex-direction: column; gap: 2px; }
.zg-ad__cell--full { grid-column: 1 / -1; }
.zg-ad__cell .lbl { font-size: 11px; color: #909399; }
.zg-ad__cell .val { font-size: 14px; color: #1f2d3d; font-weight: 500; }

.zg-ad__stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.zg-ad__stat { background: #fef3c7; border-radius: 10px; padding: 12px; text-align: center; display: flex; flex-direction: column; gap: 2px; }
.zg-ad__stat .num { font-size: 18px; font-weight: 700; color: #92400e; }
.zg-ad__stat .lbl { font-size: 11px; color: #909399; }
.zg-gb__val--danger { color: #ef4444; }

.zg-ad__fault-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px; color: #dc2626; font-size: 13px; }</style>
