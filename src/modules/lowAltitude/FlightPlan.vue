<!--
  智光云枢 · 低空经济 · 飞行计划与空域申报
  业务域：lowAltitude
  功能：飞行计划时间轴、空域管理面板、航线地图
-->
<template>
  <section class="zg-fplan">
    <!-- 头部 -->
    <header class="zg-fplan__head">
      <div class="zg-fplan__headline">
        <div class="zg-fplan__sigil">
          <el-icon :size="22"><Promotion /></el-icon>
        </div>
        <div class="zg-fplan__copy">
          <h1 class="zg-fplan__title">飞行计划与空域申报</h1>
          <p class="zg-fplan__sub">低空经济 · 空域智理 · 实时协同</p>
        </div>
      </div>
      <el-button type="primary" :icon="Edit" @click="showForm = !showForm">新增空域申请</el-button>
    </header>

    <!-- KPI -->
    <div class="zg-fplan__kpi">
      <div v-for="k in kpis" :key="k.id" class="zg-fplan__kpi-cell">
        <span class="zg-fplan__kpi-icon" :style="{ background: k.grad }">
          <el-icon :size="18"><component :is="k.icon" /></el-icon>
        </span>
        <div class="zg-fplan__kpi-body">
          <div class="zg-fplan__kpi-val" :style="{ color: k.valColor }">{{ k.value }}</div>
          <div class="zg-fplan__kpi-lbl">{{ k.label }}</div>
        </div>
      </div>
    </div>

    <!-- 主区域：时间轴 + 空域 -->
    <div class="zg-fplan__main">
      <!-- 左侧：飞行计划时间轴 -->
      <div class="zg-fplan__timeline-panel">
        <header class="zg-fplan__panel-head">
          <div class="zg-fplan__panel-title">飞行计划</div>
          <el-radio-group v-model="scope" size="small">
            <el-radio-button label="today">今日</el-radio-button>
            <el-radio-button label="week">本周</el-radio-button>
            <el-radio-button label="month">本月</el-radio-button>
          </el-radio-group>
        </header>

        <el-timeline class="zg-fplan__timeline">
          <el-timeline-item
            v-for="p in visiblePlans"
            :key="p.id"
            :type="p.statusType"
            :hollow="p.status !== 'ongoing'"
            :timestamp="p.departTime"
            placement="top"
            :size="p.status === 'ongoing' ? 'normal' : 'large'"
          >
            <article class="zg-fplan__plan-item">
              <header class="zg-fplan__plan-head">
                <span class="zg-fplan__plan-code">{{ p.code }}</span>
                <el-tag :type="p.statusType" size="small">{{ p.statusText }}</el-tag>
              </header>
              <div class="zg-fplan__plan-body">
                <div class="zg-fplan__plan-main">
                  <el-icon :size="14"><Promotion /></el-icon>
                  <span>{{ p.drone }}</span>
                  <el-divider direction="vertical" />
                  <span class="zg-fplan__route-chip" :class="`zg-fplan__route-chip--${p.routeType}`">{{ p.routeTypeText }}</span>
                </div>
                <div class="zg-fplan__plan-route">
                  <el-icon :size="12"><LocationFilled /></el-icon>
                  <span>{{ p.depart }} → {{ p.arrive }}</span>
                </div>
              </div>
              <footer class="zg-fplan__plan-foot">
                <span><el-icon :size="12"><Clock /></el-icon> 预计 {{ p.eta }}</span>
                <el-button v-if="p.status === 'pending'" type="primary" link size="small" @click="approve(p)">审批</el-button>
                <el-button v-if="p.status === 'ongoing'" type="danger" link size="small">中止</el-button>
              </footer>
            </article>
          </el-timeline-item>
        </el-timeline>
      </div>

      <!-- 右侧：空域管理面板 -->
      <div class="zg-fplan__airspace-panel">
        <header class="zg-fplan__panel-head">
          <div class="zg-fplan__panel-title">空域管理</div>
        </header>

        <!-- 新增空域表单 -->
        <el-form v-if="showForm" class="zg-fplan__air-form" label-width="80px" size="small">
          <el-form-item label="空域名称"><el-input v-model="form.name" placeholder="例：梅溪湖湖上空域" /></el-form-item>
          <el-form-item label="经纬度">
            <div class="zg-fplan__latlng">
              <el-input v-model="form.lng" placeholder="经度" />
              <el-input v-model="form.lat" placeholder="纬度" />
            </div>
          </el-form-item>
          <el-form-item label="高度">
            <el-input-number v-model="form.height" :min="10" :max="500" :step="10" />
            <span class="zg-fplan__unit">米</span>
          </el-form-item>
          <el-form-item label="起止时间">
            <el-date-picker v-model="form.range" type="datetimerange" range-separator="至" start-placeholder="开始" end-placeholder="结束" />
          </el-form-item>
          <el-form-item label="用途">
            <el-select v-model="form.usage" placeholder="选择用途">
              <el-option label="灯网巡检" value="巡检" />
              <el-option label="应急救火" value="救火" />
              <el-option label="广告投放" value="广告" />
              <el-option label="即时配送" value="配送" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitForm">提交申请</el-button>
            <el-button @click="showForm = false">取消</el-button>
          </el-form-item>
        </el-form>

        <!-- 空域列表 -->
        <el-table :data="airspaces" size="small" stripe>
          <el-table-column prop="name" label="空域名称" min-width="140" />
          <el-table-column prop="height" label="高度层" width="90">
            <template #default="{ row }">{{ row.height }} m</template>
          </el-table-column>
          <el-table-column prop="period" label="时段" min-width="140" />
          <el-table-column label="审批状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.apType" size="small">{{ row.apText }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 底部实时航线地图 -->
    <section class="zg-fplan__map-section">
      <header class="zg-fplan__panel-head">
        <div class="zg-fplan__panel-title">实时航线 · 长沙低空走廊</div>
        <el-tag type="success" effect="plain" size="small">3 架次巡航中</el-tag>
      </header>
      <div class="zg-fplan__map-wrap">
        <svg viewBox="0 0 900 360" class="zg-fplan__map-svg">
          <defs>
            <linearGradient id="route-g1" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stop-color="#6366f1" />
              <stop offset="1" stop-color="#a855f7" />
            </linearGradient>
            <linearGradient id="route-g2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stop-color="#10b981" />
              <stop offset="1" stop-color="#06b6d4" />
            </linearGradient>
            <linearGradient id="route-g3" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stop-color="#f59e0b" />
              <stop offset="1" stop-color="#ef4444" />
            </linearGradient>
          </defs>
          <!-- 网格化地图底 -->
          <rect width="900" height="360" fill="#f8fafc" />
          <g stroke="rgba(99,102,241,0.08)" stroke-width="1">
            <line v-for="i in 18" :key="'v'+i" :x1="i*50" y1="0" :x2="i*50" y2="360" />
            <line v-for="i in 8" :key="'h'+i" x1="0" :y1="i*45" x2="900" :y2="i*45" />
          </g>

          <!-- 航线 1：先导路→岳麓山→梅溪湖 -->
          <path d="M40,280 C160,200 260,240 380,150 C500,80 620,180 760,90" stroke="url(#route-g1)" stroke-width="3" fill="none" stroke-dasharray="8 4" class="route-line" />
          <!-- 航线 2：橘子洲头→河东→高铁南 -->
          <path d="M120,320 C250,280 380,300 520,260 C640,220 760,280 860,240" stroke="url(#route-g2)" stroke-width="3" fill="none" stroke-dasharray="8 4" class="route-line" />
          <!-- 航线 3：麓谷→金星路→金融中心 -->
          <path d="M30,80 C150,120 280,60 420,120 C560,180 680,100 860,150" stroke="url(#route-g3)" stroke-width="3" fill="none" stroke-dasharray="8 4" class="route-line" />

          <!-- 节点：关键 POI -->
          <g v-for="n in nodes" :key="n.name">
            <circle :cx="n.x" :cy="n.y" r="8" fill="rgba(99,102,241,0.2)" />
            <circle :cx="n.x" :cy="n.y" r="4" fill="#6366f1" />
            <text :x="n.x + 12" :y="n.y + 4" font-size="11" fill="#475569">{{ n.name }}</text>
          </g>

          <!-- 无人机动画 -->
          <g v-for="d in animatedDrones" :key="d.code">
            <circle :cx="d.x" :cy="d.y" r="14" :fill="d.color" opacity="0.25">
              <animate attributeName="r" from="10" to="20" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" from="0.3" to="0" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle :cx="d.x" :cy="d.y" r="6" :fill="d.color" />
            <text :x="d.x - 30" :y="d.y - 14" font-size="10" :fill="d.color" font-weight="600">{{ d.code }}</text>
          </g>
        </svg>
        <div class="zg-fplan__map-legend">
          <span><i style="background:#6366f1"></i> ZG-D003 · 灯网巡检</span>
          <span><i style="background:#10b981"></i> ZG-D008 · 配送</span>
          <span><i style="background:#f59e0b"></i> ZG-D015 · 应急待命</span>
        </div>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Promotion,
  LocationFilled,
  Clock,
  Edit,
  MagicStick,
  TrendCharts,
  Files,
  Calendar,
} from '@element-plus/icons-vue'

const kpis = [
  { id: 'today', label: '今日计划', value: 8, grad: 'linear-gradient(135deg,#6366f1,#a855f7)', icon: MagicStick, valColor: '#6366f1' },
  { id: 'run', label: '执行中', value: 3, grad: 'linear-gradient(135deg,#3b82f6,#06b6d4)', icon: TrendCharts, valColor: '#3b82f6' },
  { id: 'pending', label: '待审批', value: 2, grad: 'linear-gradient(135deg,#f59e0b,#ec4899)', icon: Files, valColor: '#f59e0b' },
  { id: 'month', label: '本月累计飞行', value: 127, grad: 'linear-gradient(135deg,#10b981,#14b8a6)', icon: Calendar, valColor: '#10b981' },
]

const scope = ref<'today' | 'week' | 'month'>('today')

const routeTypes: { key: Plan['routeType']; text: string }[] = [
  { key: 'inspect', text: '灯网巡检' },
  { key: 'fire', text: '应急救火' },
  { key: 'ads', text: '广告投放' },
  { key: 'deliver', text: '即时配送' },
]
const statusCycle: { key: Plan['status']; text: string; type: Plan['statusType'] }[] = [
  { key: 'ongoing', text: '执行中', type: 'primary' },
  { key: 'approved', text: '已批准', type: 'success' },
  { key: 'pending', text: '审批中', type: 'warning' },
  { key: 'done', text: '已完成', type: 'info' },
  { key: 'canceled', text: '已取消', type: 'danger' },
]
const routePairs = [
  ['先导路', '梅溪湖'], ['岳麓山脚', '橘子洲头'], ['麓谷大道', '高铁南站'],
  ['金星路', '金融中心'], ['芙蓉广场', '月亮岛'], ['三一大道', '世界之窗'],
]

const allPlans = computed<Plan[]>(() => {
  const list: Plan[] = []
  for (let i = 1; i <= 16; i++) {
    const rt = routeTypes[(i - 1) % routeTypes.length]
    const st = statusCycle[(i - 1) % statusCycle.length]
    const pair = routePairs[(i - 1) % routePairs.length]
    const day = i <= 8 ? 0 : i <= 12 ? 1 : 2
    list.push({
      id: i,
      code: `FP-20261027-${i.toString().padStart(3, '0')}`,
      drone: `ZG-D${((i * 3) % 24 + 1).toString().padStart(3, '0')}`,
      routeType: rt.key,
      routeTypeText: rt.text,
      depart: pair[0],
      arrive: pair[1],
      departTime: `${(7 + (i % 10)).toString().padStart(2, '0')}:${((i * 13) % 60).toString().padStart(2, '0')}`,
      eta: `${15 + (i % 20)} min`,
      status: st.key,
      statusText: st.text,
      statusType: st.type,
      day,
    })
  }
  return list
})

const visiblePlans = computed(() => {
  if (scope.value === 'today') return allPlans.value.filter(p => p.day === 0)
  if (scope.value === 'week') return allPlans.value.filter(p => p.day <= 1)
  return allPlans.value
})

// 空域
const airspaces = ref([
  { name: '梅溪湖湖上空域', height: 120, period: '08:00-18:00', apText: '已批准', apType: 'success' as const },
  { name: '橘子洲头景区上空', height: 80, period: '09:00-22:00', apText: '已批准', apType: 'success' as const },
  { name: '先导路走廊', height: 150, period: '全天', apText: '已批准', apType: 'success' as const },
  { name: '高铁南站周边', height: 60, period: '10:00-16:00', apText: '审批中', apType: 'warning' as const },
  { name: '金融中心CBD', height: 100, period: '07:00-22:00', apText: '待申请', apType: 'info' as const },
  { name: '月亮岛景区', height: 90, period: '08:30-20:30', apText: '已批准', apType: 'success' as const },
])

const showForm = ref(false)
const form = ref({ name: '', lng: '', lat: '', height: 120, range: null as any, usage: '' })
function submitForm() {
  if (!form.value.name || !form.value.usage) {
    ElMessage.warning('请填写空域名称与用途')
    return
  }
  airspaces.value.push({
    name: form.value.name,
    height: form.value.height,
    period: '待生成',
    apText: '审批中',
    apType: 'warning',
  })
  ElMessage.success('空域申请已提交，正在审批')
  showForm.value = false
  form.value = { name: '', lng: '', lat: '', height: 120, range: null, usage: '' }
}

function approve(p: Plan) {
  p.status = 'approved'
  p.statusText = '已批准'
  p.statusType = 'success'
  ElMessage.success(`已批准 ${p.code}`)
}

// 地图节点
const nodes = [
  { name: '先导路', x: 40, y: 280 },
  { name: '岳麓山脚', x: 260, y: 170 },
  { name: '梅溪湖', x: 760, y: 90 },
  { name: '橘子洲头', x: 120, y: 320 },
  { name: '高铁南站', x: 860, y: 240 },
  { name: '麓谷', x: 30, y: 80 },
  { name: '金融中心', x: 860, y: 150 },
]

// 动画无人机
const animatedDrones = ref([
  { code: 'ZG-D003', x: 380, y: 150, color: '#6366f1', t: 0 },
  { code: 'ZG-D008', x: 520, y: 260, color: '#10b981', t: 1 },
  { code: 'ZG-D015', x: 420, y: 120, color: '#f59e0b', t: 2 },
])
</script>

<style lang="scss" scoped>
.zg-fplan {
  padding: 20px 24px 32px;
  color: var(--zg-ink-primary, #1e293b);

  // 头部
  &__head {
    display: flex; justify-content: space-between; align-items: center;
    padding: 18px 22px;
    background: #fff;
    border-radius: 16px;
    box-shadow: var(--zg-shadow-card, 0 4px 16px rgba(0,0,0,0.04));
        margin-bottom: 16px;
  }
  &__headline { display: flex; align-items: center; gap: 14px; }
  &__sigil {
    width: 44px; height: 44px;
    border-radius: 12px;
    background: linear-gradient(135deg, #6366f1, #a855f7);
    color: #fff;
    display: flex; align-items: center; justify-content: center;
  }
  &__title { font-size: 20px; margin: 0; font-weight: 700; }
  &__sub { font-size: 13px; margin: 2px 0 0; color: var(--zg-ink-tertiary, #94a3b8); }

  // KPI
  &__kpi {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
    margin-bottom: 18px;
  }
  &__kpi-cell {
    background: #fff;
    border-radius: 14px;
    padding: 14px 18px;
    display: flex; align-items: center; gap: 14px;
    box-shadow: var(--zg-shadow-card, 0 4px 16px rgba(0,0,0,0.04));
  }
  &__kpi-icon {
        width: 40px; height: 40px;
    border-radius: 10px;
    color: #fff;
    display: flex; align-items: center; justify-content: center;
  }
  &__kpi-val { font-size: 22px; font-weight: 700; }
  &__kpi-lbl { font-size: 12px; color: var(--zg-ink-tertiary, #94a3b8); }

  // 主区域
  &__main {
    display: grid;
    grid-template-columns: 1.4fr 1fr;
    gap: 16px;
    margin-bottom: 18px;
  }
  &__timeline-panel,
  &__airspace-panel {
    background: #fff;
    border-radius: 14px;
    padding: 16px 18px;
    box-shadow: var(--zg-shadow-card, 0 4px 16px rgba(0,0,0,0.04));
  }
  &__panel-head {
        display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 14px; padding-bottom: 10px;
    border-bottom: 1px solid rgba(0,0,0,0.06);
  }
  &__panel-title { font-size: 15px; font-weight: 700; }

  // 计划卡片
  &__timeline { padding-top: 10px; }
  &__plan-item {
    background: #fafbfc;
    border-radius: 10px;
    padding: 10px 14px;
    border: 1px solid rgba(0,0,0,0.04);
  }
  &__plan-head {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 6px;
  }
  &__plan-code { font-size: 12px; font-family: ui-monospace, monospace; color: var(--zg-ink-tertiary, #94a3b8); }
  &__plan-main {
    display: flex; align-items: center; gap: 6px;
    font-size: 13px; font-weight: 600;
  }
  &__plan-route {
    font-size: 12px; color: var(--zg-ink-tertiary, #94a3b8);
    display: flex; align-items: center; gap: 4px; margin-top: 4px;
  }
  &__plan-foot {
    display: flex; justify-content: space-between; align-items: center;
    margin-top: 6px; padding-top: 6px;
    font-size: 11px; color: var(--zg-ink-tertiary, #94a3b8);
    border-top: 1px dashed rgba(0,0,0,0.05);
    svg { vertical-align: middle; margin-right: 3px; }
  }
  &__route-chip {
    font-size: 11px; padding: 1px 7px; border-radius: 10px; font-weight: 500;
    &--inspect { background: rgba(99,102,241,0.1); color: #6366f1; }
    &--fire    { background: rgba(239,68,68,0.1); color: #ef4444; }
    &--ads     { background: rgba(245,158,11,0.1); color: #f59e0b; }
    &--deliver { background: rgba(16,185,129,0.1); color: #10b981; }
  }

  // 空域表单
  &__air-form {
    background: #f8fafc;
    border-radius: 10px;
    padding: 12px;
    margin-bottom: 12px;
  }
  &__latlng { display: flex; gap: 8px; width: 100%; }
  &__unit { margin-left: 8px; color: var(--zg-ink-tertiary, #94a3b8); font-size: 12px; }

  // 底部地图
  &__map-section {
    background: #fff;
    border-radius: 14px;
    padding: 16px 18px;
    box-shadow: var(--zg-shadow-card, 0 4px 16px rgba(0,0,0,0.04));
  }
  &__map-wrap { border-radius: 12px; overflow: hidden; border: 1px solid rgba(0,0,0,0.06); }
  &__map-svg { display: block; width: 100%; height: 360px; }
  &__route-line {
        animation: dashmove 20s linear infinite;
  }
  @keyframes dashmove {
    to { stroke-dashoffset: -200; }
  }
  &__map-legend {
    display: flex; gap: 20px; padding: 10px 4px 4px;
    font-size: 12px; color: var(--zg-ink-tertiary, #94a3b8);
    i { width: 10px; height: 10px; border-radius: 50%; display: inline-block; margin-right: 6px; vertical-align: middle; }
  }
}
</style>
