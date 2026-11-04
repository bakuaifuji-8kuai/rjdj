<!--
  智光云枢 · 运维组织 · 智能调度看板（真拖拽派单 + 推荐算法 + GIS 真坐标）
-->
<template>
  <section class="zg-ops-dispatch">
    <header class="zg-ops-dispatch__head">
      <div class="zg-ops-dispatch__headline">
        <div class="zg-ops-dispatch__sigil"><el-icon :size="22"><Connection /></el-icon></div>
        <div class="zg-ops-dispatch__copy">
          <h1 class="zg-ops-dispatch__title">智能调度看板</h1>
          <p class="zg-ops-dispatch__sub">
            今日待派 {{ tickets.length }} · 在岗 {{ staff.length }} · 空闲 {{ idleCount }} · 维修中 {{ workingCount }}
          </p>
        </div>
      </div>
      <div class="zg-ops-dispatch__cta">
        <el-button type="warning" :icon="MagicStick" @click="openRecommend('auto')">一键推荐</el-button>
        <el-button type="primary" @click="randomCreateTicket"><el-icon><Plus /></el-icon>模拟新工单</el-button>
      </div>
    </header>

    <!-- KPI 栏 -->
    <div class="zg-ops-dispatch__kpis">
      <div class="cell cell--danger">
        <span class="num">{{ tickets.length }}</span><span class="lbl">今日待派</span>
      </div>
      <div class="cell cell--primary">
        <span class="num">{{ staff.length }}</span><span class="lbl">在岗</span>
      </div>
      <div class="cell cell--info">
        <span class="num">{{ idleCount }}</span><span class="lbl">空闲</span>
      </div>
      <div class="cell cell--warning">
        <span class="num">{{ workingCount }}</span><span class="lbl">维修中</span>
      </div>
    </div>

    <!-- 三栏布局 -->
    <div class="zg-ops-dispatch__grid">
      <!-- 左：工单池 -->
      <div class="col col--pool">
        <div class="col__head">
          <h3>工单池</h3>
          <el-tag type="danger" size="small">{{ tickets.length }}</el-tag>
        </div>
        <el-scrollbar height="calc(100% - 40px)">
          <div class="ticketlist">
            <div
              v-for="t in tickets"
              :key="t.id"
              class="ticketcard"
              :class="['ticketcard--' + t.priority, { selected: selectedTicket?.id === t.id }]"
              draggable="true"
              @dragstart="onDragTicket($event, t)"
              @click="selectedTicket = t"
            >
              <div class="ticketcard__pri">
                <span class="dot"></span>
                {{ { urgent: '紧急', high: '高', mid: '中', low: '低' }[t.priority] }}
              </div>
              <div class="ticketcard__title">{{ t.title }}</div>
              <div class="ticketcard__meta">
                <span class="mono">{{ t.no }}</span>
                <span class="addr">{{ t.location }}</span>
              </div>
              <div class="ticketcard__tag">
                <el-tag size="small" effect="plain">{{ t.type }}</el-tag>
                <span v-if="t.certNeeded" class="limit">需：{{ t.certNeeded }}</span>
                <span v-if="t.skillNeeded" class="limit limit-skill">技能：{{ t.skillNeeded }}</span>
              </div>
            </div>
            <div v-if="tickets.length === 0" class="empty-tip">所有工单已派完 🎉</div>
          </div>
        </el-scrollbar>
      </div>

      <!-- 中：人员看板 -->
      <div class="col col--board">
        <div class="col__head">
          <h3>人员看板（拖拽派单）</h3>
          <div class="col__filters">
            <el-radio-group v-model="boardFilter" size="small">
              <el-radio-button value="all">全部</el-radio-button>
              <el-radio-button value="idle">空闲</el-radio-button>
              <el-radio-button value="working">维修中</el-radio-button>
              <el-radio-button value="patrol">巡检中</el-radio-button>
            </el-radio-group>
          </div>
        </div>
        <el-scrollbar height="calc(100% - 40px)">
          <div
            class="staffgrid"
            @dragover.prevent
            @drop="onDropToBoard"
          >
            <div
              v-for="s in filteredStaff"
              :key="s.id"
              :class="['staffcard', 'staffcard--' + s.status, { dropzone: draggingTicket }]"
              @dragover.prevent="addDropActive($event.currentTarget)"
              @dragleave="removeDropActive($event.currentTarget)"
              @drop.stop.prevent="onDropToStaff($event, s)"
              @click="selectedTicket && openRecommend(s)"
            >
              <div class="staffcard__top">
                <div class="avatar" :style="{ background: s.color }">
                  {{ s.name.charAt(0) }}
                </div>
                <div class="staffcard__main">
                  <div class="name">{{ s.name }} <span class="statuspill" :class="s.status">{{ statusText(s.status) }}</span></div>
                  <div class="loc">
                    <el-icon :size="12"><Position /></el-icon>
                    {{ formatGps(s.gps) }}
                  </div>
                </div>
              </div>
              <div class="staffcard__skills">
                <span v-for="sk in s.skills" :key="sk" class="sk">{{ sk }}</span>
              </div>
              <div class="staffcard__cert">
                <el-icon :size="12"><Document /></el-icon>
                <span>资质：{{ certSummary(s) }}</span>
              </div>
              <div class="staffcard__meta">
                <span>当前负荷 {{ s.load }}/3</span>
                <span v-if="s.currentOrderId" class="working-order">工单 {{ s.currentOrderId }}</span>
              </div>
              <div class="staffcard__score" v-if="draggingTicket">
                <el-icon :size="12"><MagicStick /></el-icon>
                拖拽中…释放派单
              </div>
            </div>
          </div>
        </el-scrollbar>
      </div>

      <!-- 右：GIS 地图（真经纬度映射） -->
      <div class="col col--map">
        <div class="col__head">
          <h3>GIS 地图（真实坐标）</h3>
          <el-tag size="small" type="info">人员 {{ staff.length }} · 工单 {{ tickets.length }}</el-tag>
        </div>
        <div class="gis">
          <svg viewBox="0 0 400 300" class="gis__svg">
            <!-- 背景路网 -->
            <g stroke="#e2e8f0" stroke-width="1" fill="none">
              <path d="M0 80 Q 150 120 400 100" />
              <path d="M0 180 Q 180 140 400 200" />
              <path d="M80 0 Q 120 150 100 300" />
              <path d="M250 0 Q 220 150 280 300" />
              <path d="M0 260 L 400 250" />
            </g>
            <!-- 地形区块 -->
            <rect x="20" y="20" width="100" height="70" fill="#f0f9ff" opacity="0.5" rx="4" />
            <rect x="280" y="40" width="100" height="90" fill="#dcfce7" opacity="0.4" rx="4" />
            <rect x="120" y="200" width="160" height="80" fill="#fef3c7" opacity="0.3" rx="4" />

            <!-- 工单（红点） -->
            <g
              v-for="(t, idx) in tickets"
              :key="'t' + idx"
              class="map-dot map-dot--ticket"
              :transform="`translate(${t.xy?.[0] ?? gpsToSvg(t.gps)[0]}, ${t.xy?.[1] ?? gpsToSvg(t.gps)[1]})`"
            >
              <circle cx="0" cy="0" r="8" fill="var(--zg-danger)" opacity="0.3" class="pulse" />
              <circle cx="0" cy="0" r="4" fill="var(--zg-danger)" />
              <text x="10" y="4" font-size="10" fill="var(--zg-ink-secondary)">{{ t.no.slice(-4) }}</text>
            </g>

            <!-- 人员（蓝/绿点） -->
            <g
              v-for="(s, idx) in staff"
              :key="'s' + idx"
              class="map-dot"
              :transform="`translate(${gpsToSvg(s.gps)[0]}, ${gpsToSvg(s.gps)[1]})`"
            >
              <circle cx="0" cy="0" r="6" fill="var(--zg-info)" opacity="0.2" class="pulse-slow" />
              <circle cx="0" cy="0" r="3.5" :fill="s.status === 'idle' ? '#10b981' : (s.status === 'working' ? '#f59e0b' : '#8b5cf6')" stroke="#fff" stroke-width="1" />
              <text x="8" y="4" font-size="10" fill="var(--zg-ink-secondary)">{{ s.name }}</text>
            </g>
          </svg>

          <div class="gis__legend">
            <span><i class="lg lg-ticket"></i>工单</span>
            <span><i class="lg lg-staff"></i>人员</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 推荐算法弹窗 -->
    <el-dialog
      v-model="recommendOpen"
      :title="'智能派工推荐' + (recommendTicket ? ' · ' + recommendTicket.title : '')"
      width="620px"
    >
      <div class="reco-formula">
        <div class="formula-title">推荐公式</div>
        <code>推荐分 = 技能匹配(0.4) + 距离权重(0.3) + 当前负荷(0.2) + 资质合规(0.1)</code>
      </div>
      <div class="reco-list">
        <div v-for="(cand, idx) in recommendCandidates" :key="cand.id" class="recocard" :class="{ win: idx === 0 }">
          <div class="recocard__rank">
            <span v-if="idx === 0" class="trophy">🏆</span>
            <span v-else class="num">{{ idx + 1 }}</span>
          </div>
          <div class="recocard__body">
            <div class="recocard__top">
              <b>{{ cand.name }}</b>
              <span class="recocard__score">{{ cand.score.toFixed(2) }} 分</span>
            </div>
            <div class="recocard__detail mono">
              技能 {{ cand.skillMatch.toFixed(2) }}×0.4 + 距离 {{ cand.distanceM.toFixed(0) }}m×0.3/5000m
              + 负荷 {{ cand.load.toFixed(2) }}×0.2 + 资质 {{ cand.certWeight }}×0.1
              = <b>{{ cand.score.toFixed(2) }}</b>
            </div>
            <div class="recocard__reasons">
              <span class="tag" :class="cand.skillMatch >= 1 ? 'ok' : 'miss'">
                {{ cand.skillMatch >= 1 ? '✓ 技能匹配' : '✗ 技能待提升' }}
              </span>
              <span class="tag" :class="cand.certOk ? 'ok' : 'miss'">
                {{ cand.certOk ? '✓ 资质合规' : '✗ 资质不合规' }}
              </span>
              <span class="tag">{{ cand.distanceWeight > 0.5 ? '近' : '远' }}</span>
              <span class="tag">{{ cand.loadWeight > 0.5 ? '轻载' : '重载' }}</span>
            </div>
          </div>
          <el-button size="small" type="primary" @click="commitDispatch(cand)">派单给{{ cand.name }}</el-button>
        </div>
      </div>
    </el-dialog>
  </section>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Connection, Plus, Position, Document, MagicStick } from '@element-plus/icons-vue'
import {
  staff, tickets, dispatchTicket, recommendScore, gpsToSvg, calcDistance,
  startSimulation, stopSimulation
} from '@/shared/stores/opsOrgStore'

const idleCount = computed(() => staff.filter((s) => s.status === 'idle').length)
const workingCount = computed(() => staff.filter((s) => s.status === 'working').length)

const boardFilter = ref('all')
const filteredStaff = computed(() => {
  if (boardFilter.value === 'all') return staff
  return staff.filter((s) => s.status === boardFilter.value)
})
const statusText = (s) => ({ idle: '空闲', working: '维修中', patrol: '巡检中', offDuty: '下班', leave: '请假' }[s] || s)

// ===== 真拖拽 =====
const draggingTicket = ref(null)
const selectedTicket = ref(null)

const onDragTicket = (e, t) => {
  draggingTicket.value = t
  selectedTicket.value = t
  e.dataTransfer.effectAllowed = 'copy'
  e.dataTransfer.setData('application/x-ticket-id', String(t.id))
}
const addDropActive = (el) => el.classList.add('drop-active')
const removeDropActive = (el) => el.classList.remove('drop-active')
const clearDropActive = () => {
  document.querySelectorAll('.drop-active').forEach((el) => el.classList.remove('drop-active'))
}
const onDropToBoard = () => {
  clearDropActive()
  draggingTicket.value = null
}
const onDropToStaff = (e, s) => {
  clearDropActive()
  const t = draggingTicket.value
  if (!t) {
    // 兼容从 dataTransfer 读
    const id = Number(e.dataTransfer?.getData('application/x-ticket-id'))
    if (!id) return
    const found = tickets.find((x) => x.id === id)
    if (!found) { ElMessage.warning('工单已被派走'); draggingTicket.value = null; return }
    const r = dispatchTicket(found, s)
    if (r.ok) ElMessage.success(`✅ 已派单：${found.no} → ${s.name}`)
    else ElMessage.error('❌ 派单失败：' + r.reason)
    draggingTicket.value = null
    return
  }
  const r = dispatchTicket(t, s)
  if (r.ok) ElMessage.success(`✅ 已派单：${t.no} → ${s.name}`)
  else ElMessage.error('❌ 派单失败：' + r.reason)
  draggingTicket.value = null
}

// ===== 推荐算法（真打分） =====
const recommendOpen = ref(false)
const recommendTicket = ref(null)
const recommendCandidates = ref([])

const openRecommend = () => {
  recommendTicket.value = selectedTicket.value || tickets[0]
  if (!recommendTicket.value) {
    ElMessage.info('工单池为空，无需推荐')
    return
  }
  const t = recommendTicket.value
  const candidates = staff
    .filter((s) => s.status === 'idle' || s.status === 'working')
    .map((s) => {
      // 资质校验
      const certMap = { '登高证': 'dengao', '电工证': 'dengong', '380V操作证': 'xianjin', '有限空间作业证': 'youxianspace', '焊工证': 'hg' }
      const certKey = certMap[t.certNeeded]
      const certOk = !certKey || (s.certs[certKey]?.valid ?? false)
      // 距离
      const distM = calcDistance(s.gps, t.gps)
      const distanceWeight = 1 - Math.min(distM / 5000, 1)
      const skillMatch = t.skillNeeded && s.skills.includes(t.skillNeeded) ? 1 : 0.5
      const load = s.load / 3
      const loadWeight = 1 - load
      const score = recommendScore({
        staffSkills: s.skills,
        ticketRequiredSkill: t.skillNeeded,
        staffDistance: distM,
        ticketDistance: 0,
        staffLoad: load,
        hasRequiredCert: certOk,
        now: Date.now()
      })
      return {
        ...s,
        distM,
        distanceWeight,
        skillMatch,
        load,
        loadWeight,
        certOk,
        certWeight: certOk ? 1 : 0,
        score
      }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
  recommendCandidates.value = candidates
  recommendOpen.value = true
}

const commitDispatch = (cand) => {
  const t = recommendTicket.value
  if (!t) return
  const r = dispatchTicket(t, cand)
  if (r.ok) {
    ElMessage.success(`✅ 推荐派单成功：${t.no} → ${cand.name}（${cand.score.toFixed(2)} 分）`)
    recommendOpen.value = false
  } else {
    ElMessage.error('❌ ' + r.reason)
  }
}

// ===== 辅助 =====
const formatGps = (g) => `${g.lat.toFixed(4)},${g.lng.toFixed(4)}`
const certSummary = (s) => {
  const arr = []
  const label = { dengao: '登高', dengong: '电工', xianjin: '380V', youxianspace: '有限空间', hg: '焊工' }
  Object.entries(s.certs).forEach(([k, v]) => {
    arr.push(`${label[k] || k}${v.valid ? '' : '(过期)'}`)
  })
  return arr.join(' / ') || '无'
}
const randomCreateTicket = () => {
  const types = ['换LED', '修摄像头', '380V']
  const certs = ['', '登高证', '', '']
  const titles = ['灯头不亮', '摄像头离线', '配电箱告警', '线缆破损', '灯杆倾斜', '光源闪烁']
  tickets.push({
    id: Date.now(),
    no: 'WO-' + Date.now().toString().slice(-7),
    title: titles[Math.floor(Math.random() * titles.length)] + ' · 模拟',
    location: '先导路' + Math.floor(Math.random() * 40 + 1) + '#',
    type: '故障维修',
    priority: ['low', 'mid', 'high', 'urgent'][Math.floor(Math.random() * 4)],
    skillNeeded: types[Math.floor(Math.random() * types.length)],
    certNeeded: certs[Math.floor(Math.random() * certs.length)],
    gps: {
      lat: 28.22 + Math.random() * 0.05,
      lng: 112.90 + Math.random() * 0.07
    },
    status: 'pending'
  })
  ElMessage.success('已模拟生成一条新工单')
}

// ===== 启动模拟 =====
startSimulation()
onUnmounted(() => stopSimulation())
</script>

<style scoped lang="scss">
.zg-ops-dispatch {
  padding: 24px;
  display: flex; flex-direction: column; gap: 14px;
  height: calc(100vh - 120px);

  &__head {
    display: flex; justify-content: space-between; align-items: center;
    padding-bottom: 14px; border-bottom: 1px solid var(--zg-line-soft);
  }
  &__headline { display: flex; align-items: center; gap: 14px; }
  &__sigil {
    width: 44px; height: 44px; border-radius: var(--zg-radius-md);
    background: var(--zg-gradient-primary); color: #fff;
    display: flex; align-items: center; justify-content: center;
  }
  &__copy { display: flex; flex-direction: column; gap: 4px; }
  &__title { margin: 0; font-size: 20px; font-weight: 600; }
  &__sub { margin: 0; font-size: 13px; color: var(--zg-ink-tertiary); }
}

.zg-ops-dispatch__kpis {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
  .cell {
    background: var(--zg-surface-card);
    border: 1px solid var(--zg-line-soft);
    border-radius: var(--zg-radius-lg);
    padding: 14px 18px;
    display: flex; justify-content: space-between; align-items: center;
    box-shadow: var(--zg-shadow-card);
    .num { font-size: 28px; font-weight: 700; line-height: 1; }
    .lbl { font-size: 12px; color: var(--zg-ink-tertiary); }
    &--primary .num { color: var(--zg-brand-primary); }
    &--danger .num { color: var(--zg-danger); }
    &--warning .num { color: var(--zg-warning); }
    &--info .num { color: var(--zg-info); }
  }
}

.zg-ops-dispatch__grid {
  display: grid; grid-template-columns: 300px 1fr 380px; gap: 14px;
  flex: 1; min-height: 0;
}

.col {
  background: var(--zg-surface-card);
  border: 1px solid var(--zg-line-soft);
  border-radius: var(--zg-radius-lg);
  padding: 14px;
  display: flex; flex-direction: column;
  box-shadow: var(--zg-shadow-card);
  overflow: hidden;
  &__head {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 12px;
    h3 { margin: 0; font-size: 15px; font-weight: 600; }
  }
}

.ticketlist { display: flex; flex-direction: column; gap: 8px; }

.ticketcard {
  padding: 10px 12px;
  border-radius: var(--zg-radius-md);
  border: 1px solid var(--zg-line-soft);
  cursor: grab;
  transition: all var(--zg-transition-fast);
  background: #fff;
  &:hover { transform: translateX(2px); border-color: var(--zg-brand-primary); box-shadow: 0 4px 10px -4px rgba(217,119,6,0.2); }
  &.selected { border-color: var(--zg-brand-primary); background: var(--zg-brand-tint-50); }
  &--urgent { border-left: 3px solid var(--zg-danger); }
  &--high { border-left: 3px solid var(--zg-warning); }
  &--mid { border-left: 3px solid var(--zg-info); }
  &--low { border-left: 3px solid var(--zg-success); }

  &__pri { font-size: 11px; color: var(--zg-danger); display: flex; align-items: center; gap: 4px; font-weight: 600; .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; } }
  &__title { font-size: 13px; font-weight: 600; color: var(--zg-ink-primary); margin: 4px 0; }
  &__meta { font-size: 11px; color: var(--zg-ink-tertiary); display: flex; gap: 8px; }
  &__tag { display: flex; gap: 6px; align-items: center; margin-top: 6px; flex-wrap: wrap; .limit { font-size: 11px; color: var(--zg-warning); } .limit-skill { color: var(--zg-info); } }
}

.empty-tip { padding: 40px 12px; text-align: center; color: var(--zg-ink-tertiary); font-size: 13px; }

.mono { font-family: var(--zg-font-mono); }
.addr { flex: 1; text-align: right; }

.staffgrid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px;
}

.staffcard {
  border: 2px dashed transparent;
  background: var(--zg-surface-muted);
  border-radius: var(--zg-radius-lg);
  padding: 12px;
  transition: all var(--zg-transition-fast);
  cursor: pointer;
  position: relative;

  &:hover { border-color: var(--zg-brand-primary); transform: translateY(-2px); box-shadow: 0 6px 16px -8px rgba(217,119,6,0.3); }
  &.dropzone { border-style: solid; }
  &.drop-active { border-color: var(--zg-success); background: var(--zg-success-soft); transform: scale(1.02); }

  &__top { display: flex; gap: 10px; align-items: center; margin-bottom: 10px; }
  .avatar { width: 36px; height: 36px; border-radius: 50%; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px; }
  &__main { flex: 1; }
  .name { font-size: 13px; font-weight: 600; color: var(--zg-ink-primary); display: flex; align-items: center; gap: 6px; }
  .loc { font-size: 11px; color: var(--zg-ink-tertiary); display: flex; align-items: center; gap: 2px; margin-top: 2px; }
  &__skills { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 8px; .sk { font-size: 11px; padding: 2px 8px; background: #fff; border-radius: 10px; color: var(--zg-ink-secondary); border: 1px solid var(--zg-line-soft); } }
  &__cert { display: flex; gap: 4px; align-items: center; font-size: 11px; color: var(--zg-info); margin-bottom: 8px; }
  &__meta { display: flex; gap: 12px; font-size: 11px; color: var(--zg-ink-tertiary); padding-top: 8px; border-top: 1px dashed var(--zg-line-soft); flex-wrap: wrap; }
  .working-order { color: var(--zg-warning); }
  &__score { position: absolute; top: 8px; right: 8px; display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--zg-success); b { font-size: 14px; } }

  &--idle { background: var(--zg-info-soft); }
  &--working { background: var(--zg-warning-soft); }
  &--patrol { background: #ede9fe; }
}

.statuspill {
  display: inline-block; padding: 1px 6px; border-radius: 8px; font-size: 10px; font-weight: 500;
  &.idle { color: var(--zg-info); background: #fff; }
  &.working { color: var(--zg-warning); background: #fff; }
  &.patrol { color: #7c3aed; background: #fff; }
}

.gis {
  flex: 1; display: flex; flex-direction: column; position: relative;
  background: #f8fafc; border-radius: var(--zg-radius-md); overflow: hidden;
}
.gis__svg { flex: 1; width: 100%; height: 100%; }
.gis__legend {
  position: absolute; bottom: 8px; left: 8px;
  display: flex; gap: 12px; font-size: 11px; color: var(--zg-ink-secondary);
  background: rgba(255,255,255,0.9); padding: 4px 10px; border-radius: var(--zg-radius-sm);
  .lg { width: 10px; height: 10px; border-radius: 50%; display: inline-block; margin-right: 3px; &-ticket { background: var(--zg-danger); } &-staff { background: var(--zg-info); } }
}

.pulse { animation: pulseDot 1.6s infinite; transform-origin: center; }
.pulse-slow { animation: pulseDot 2.2s infinite; transform-origin: center; }
@keyframes pulseDot {
  0%,100% { transform: scale(1); opacity: 0.4; }
  50% { transform: scale(1.6); opacity: 0.1; }
}

.reco-formula {
  background: var(--zg-surface-muted); padding: 14px; border-radius: var(--zg-radius-md);
  margin-bottom: 16px;
  .formula-title { font-size: 12px; font-weight: 600; color: var(--zg-ink-secondary); margin-bottom: 8px; }
  code { font-size: 13px; color: var(--zg-brand-primary); font-family: var(--zg-font-mono); }
}
.reco-list { display: flex; flex-direction: column; gap: 10px; }
.recocard {
  display: flex; gap: 14px; align-items: center;
  padding: 12px; border-radius: var(--zg-radius-md);
  border: 1px solid var(--zg-line-soft);
  &.win { border-color: var(--zg-brand-primary); background: var(--zg-brand-tint-50); }
  &__rank {
    width: 40px; height: 40px; border-radius: 50%;
    background: var(--zg-surface-muted);
    display: flex; align-items: center; justify-content: center; font-weight: 700;
    .trophy { font-size: 20px; }
    .num { font-size: 16px; color: var(--zg-ink-tertiary); }
  }
  &.win &__rank { background: var(--zg-gradient-primary); color: #fff; }
  &__body { flex: 1; }
  &__top { display: flex; justify-content: space-between; align-items: center; b { font-size: 14px; } }
  &__score { font-size: 16px; font-weight: 700; color: var(--zg-brand-primary); }
  &__detail { font-size: 12px; color: var(--zg-ink-secondary); margin-top: 4px; font-family: var(--zg-font-mono); }
  &__reasons { display: flex; gap: 6px; margin-top: 6px; flex-wrap: wrap; }
}
.tag {
  font-size: 11px; padding: 2px 8px; border-radius: 8px; background: var(--zg-surface-muted);
  &.ok { color: var(--zg-success); background: var(--zg-success-soft); }
  &.miss { color: var(--zg-danger); background: var(--zg-danger-soft); }
}
</style>
