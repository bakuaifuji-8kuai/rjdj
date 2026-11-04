<!--
  智光云枢 · 低空经济 · 无人机停机坪站址
  业务域：lowAltitude
  功能：停机坪卡片、详情 Drawer、资源位招商表格
-->
<template>
  <section class="zg-vertiport">
    <!-- 头部 -->
    <header class="zg-vertiport__head">
      <div class="zg-vertiport__headline">
        <div class="zg-vertiport__sigil">
          <el-icon :size="22"><HomeFilled /></el-icon>
        </div>
        <div class="zg-vertiport__copy">
          <h1 class="zg-vertiport__title">无人机停机坪</h1>
          <p class="zg-vertiport__sub">低空经济 · 站址资源 · 灯杆挂载型 {{ lamppostCount }} / {{ ports.length }}</p>
        </div>
      </div>
    </header>

    <!-- KPI -->
    <div class="zg-vertiport__kpi">
      <div v-for="k in kpis" :key="k.id" class="zg-vertiport__kpi-cell" :class="`zg-vertiport__kpi-cell--${k.tone}`">
        <span class="zg-vertiport__kpi-icon" :style="{ background: k.grad }">
          <el-icon :size="18"><component :is="k.icon" /></el-icon>
        </span>
        <div class="zg-vertiport__kpi-body">
          <div class="zg-vertiport__kpi-val">{{ k.value }}</div>
          <div class="zg-vertiport__kpi-lbl">{{ k.label }}</div>
        </div>
      </div>
    </div>

    <!-- 停机坪卡片网格 -->
    <div class="zg-vertiport__grid">
      <article
        v-for="p in ports"
        :key="p.id"
        class="zg-vertiport__card"
        :class="`zg-vertiport__card--${p.status}`"
        @click="openDetail(p)"
      >
        <div class="zg-vertiport__card-bg">
          <svg viewBox="0 0 120 80" class="zg-vertiport__bg-svg">
            <rect x="10" y="10" width="100" height="60" rx="8" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="4 3" />
            <text x="60" y="46" text-anchor="middle" font-size="18" font-weight="700" fill="currentColor">H</text>
            <line x1="30" y1="20" x2="30" y2="60" stroke="currentColor" stroke-width="1" opacity="0.5" />
            <line x1="90" y1="20" x2="90" y2="60" stroke="currentColor" stroke-width="1" opacity="0.5" />
          </svg>
        </div>
        <header class="zg-vertiport__card-head">
          <div>
            <div class="zg-vertiport__port-code">{{ p.code }}</div>
            <div class="zg-vertiport__port-loc">
              <el-icon :size="12"><LocationFilled /></el-icon>
              {{ p.location }}
            </div>
          </div>
          <el-tag :type="statusTag(p.status)" size="small" round>{{ statusText(p.status) }}</el-tag>
        </header>

        <div class="zg-vertiport__info-row">
          <span class="zg-vertiport__info-label">所属灯杆</span>
          <span>{{ p.lamppost }}</span>
          <el-tag v-if="p.isLamppost" size="small" effect="plain" type="warning">挂杆</el-tag>
        </div>
        <div class="zg-vertiport__info-row">
          <span class="zg-vertiport__info-label">运营商</span>
          <span class="zg-vertiport__ops">{{ p.operator }}</span>
        </div>
        <div class="zg-vertiport__info-row">
          <span class="zg-vertiport__info-label">可用接口</span>
          <div class="zg-vertiport__ports">
            <span v-for="pt in p.interfaces" :key="pt" class="zg-vertiport__port-tag">{{ pt }}</span>
          </div>
        </div>

        <footer class="zg-vertiport__foot">
          <div v-if="p.currentDrone" class="zg-vertiport__current">
            <el-icon :size="14"><Promotion /></el-icon>
            <span>{{ p.currentDrone }}</span>
            <span class="zg-vertiport__wait">等待 {{ p.waitTime }}s</span>
          </div>
          <div v-else class="zg-vertiport__current zg-vertiport__current--empty">暂无无人机</div>
          <div class="zg-vertiport__chargers">
            <span :class="{ on: p.chargers >= 1 }"><el-icon :size="12"><Service /></el-icon> 充电桩 {{ p.chargers }}/{{ p.chargersTotal }}</span>
          </div>
        </footer>
      </article>
    </div>

    <!-- 资源位招商表格 -->
    <section class="zg-vertiport__merchant">
      <header class="zg-vertiport__merchant-head">
        <h3>停机坪资源位招商</h3>
        <el-button type="primary" link :icon="Plus">新增资源位</el-button>
      </header>
      <el-table :data="merchantRows" stripe size="small" border>
        <el-table-column prop="code" label="停机坪" width="120" />
        <el-table-column prop="location" label="位置" min-width="160" />
        <el-table-column prop="operator" label="意向运营商" width="120" />
        <el-table-column prop="usage" label="用途" width="140" />
        <el-table-column prop="fee" label="年服务费" width="120" />
        <el-table-column prop="status" label="招采状态" width="120">
          <template #default="{ row }">
            <el-tag :type="row.status === '已签约' ? 'success' : row.status === '洽谈中' ? 'warning' : 'info'" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openDetail(row)">查看</el-button>
            <el-button link type="primary" size="small">签约</el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>

    <!-- 详情 Drawer -->
    <el-drawer v-model="drawerVisible" :title="activePort?.code + ' · 停机坪详情'" size="440px" direction="rtl">
      <template v-if="activePort">
        <div class="zg-vertiport__detail">
          <div class="zg-vertiport__detail-section">
            <div class="zg-vertiport__detail-title">站址档案</div>
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="编号">{{ activePort.code }}</el-descriptions-item>
              <el-descriptions-item label="位置">{{ activePort.location }}</el-descriptions-item>
              <el-descriptions-item label="经纬度">{{ activePort.lnglat }}</el-descriptions-item>
              <el-descriptions-item label="所属灯杆">{{ activePort.lamppost || '独立站址' }}</el-descriptions-item>
              <el-descriptions-item label="海拔高度">{{ activePort.altitude }} m</el-descriptions-item>
              <el-descriptions-item label="状态">
                <el-tag :type="statusTag(activePort.status)" size="small">{{ statusText(activePort.status) }}</el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <div class="zg-vertiport__detail-section">
            <div class="zg-vertiport__detail-title">电气接口</div>
            <el-tag v-for="i in activePort.interfaces" :key="i" class="zg-vertiport__if-tag" type="primary" effect="plain">{{ i }}</el-tag>
          </div>

          <div class="zg-vertiport__detail-section">
            <div class="zg-vertiport__detail-title">运营方</div>
            <el-tag>{{ activePort.operator }}</el-tag>
          </div>

          <div class="zg-vertiport__detail-section">
            <div class="zg-vertiport__detail-title">预约记录</div>
            <el-timeline>
              <el-timeline-item v-for="(r, i) in activePort.reservations" :key="i" :timestamp="r.time" placement="top">
                {{ r.drone }} · {{ r.type }}
              </el-timeline-item>
            </el-timeline>
          </div>
        </div>
      </template>
    </el-drawer>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  HomeFilled,
  LocationFilled,
  Promotion,
  Service,
  Plus,
} from '@element-plus/icons-vue'

const opsPool = ['美团无人机', '顺丰速运', '京东物流', '智光云枢']
const locPool = [
  '岳麓区·先导路与金星路交叉口',
  '岳麓区·梅溪湖大剧院广场',
  '岳麓区·橘子洲头游客中心',
  '岳麓区·麓谷信息港',
  '开福区·长沙金融中心',
  '天心区·芙蓉广场',
  '雨花区·高铁南站',
  '望城区·月亮岛景区',
]
const statusCyclePort: Status[] = ['free', 'takeoff', 'landing', 'closed']

const ports = computed<Port[]>(() => {
  const list: Port[] = []
  for (let i = 1; i <= 12; i++) {
    const isLamppost = i <= 4
    list.push({
      id: i,
      code: `ZG-H${i.toString().padStart(3, '0')}`,
      location: locPool[(i - 1) % locPool.length],
      lnglat: `112.${72 + i}, 28.${21 + i}`,
      altitude: 30 + i * 5,
      lamppost: isLamppost ? `Z-LAMP-${100 + i}` : '',
      isLamppost,
      interfaces: ['480V', 'L1/L2', '光口'].filter((_, idx) => idx < 2 + (i % 2)),
      operator: opsPool[(i - 1) % opsPool.length],
      status: statusCycle[(i - 1) % 4],
      currentDrone: statusCycle[(i - 1) % 4] === 'free' ? '' : `ZG-D${(i * 3).toString().padStart(3, '0')}`,
      waitTime: statusCycle[(i - 1) % 4] === 'takeoff' ? 28 : 0,
      chargers: i % 3,
      chargersTotal: 2,
      reservations: [
        { time: '10:24', drone: `ZG-D${((i + 1) * 7).toString().padStart(3, '0')}`, type: '配送中' },
        { time: '09:12', drone: `ZG-D${((i + 2) * 5).toString().padStart(3, '0')}`, type: '巡检' },
        { time: '08:40', drone: `ZG-D${((i + 3) * 3).toString().padStart(3, '0')}`, type: '起飞巡航' },
      ],
    })
  }
  return list
})

const lamppostCount = computed(() => ports.value.filter(p => p.isLamppost).length)

const kpis = computed(() => [
  { id: 'total', label: '停机坪总数', value: ports.value.length, tone: 'indigo', icon: HomeFilled, grad: 'linear-gradient(135deg,#6366f1,#a855f7)' },
  { id: 'free', label: '可用', value: ports.value.filter(p => p.status === 'free').length, tone: 'green', icon: Service, grad: 'linear-gradient(135deg,#10b981,#14b8a6)' },
  { id: 'occupy', label: '被占用', value: ports.value.filter(p => p.status === 'takeoff' || p.status === 'landing').length, tone: 'amber', icon: Promotion, grad: 'linear-gradient(135deg,#f59e0b,#ec4899)' },
  { id: 'maint', label: '维护中', value: ports.value.filter(p => p.status === 'closed').length, tone: 'gray', icon: LocationFilled, grad: 'linear-gradient(135deg,#94a3b8,#cbd5e1)' },
])

const merchantRows = computed(() => ports.value.slice(0, 6).map(p => ({
  code: p.code,
  location: p.location,
  operator: p.operator,
  usage: ['即时配送', '灯网巡检', '应急消防'][p.id % 3],
  fee: (8 + p.id).toFixed(1) + ' 万/年',
  status: p.id % 3 === 0 ? '已签约' : p.id % 3 === 1 ? '洽谈中' : '空置',
})))

const drawerVisible = ref(false)
const activePort = ref<Port | null>(null)

function openDetail(p: Port) {
  activePort.value = p
  drawerVisible.value = true
}

function statusText(s: PortStatus) {
  return { free: '空闲', takeoff: '起飞中', landing: '降落中', closed: '关闭' }[s]
}
function statusTag(s: PortStatus): '' | 'success' | 'primary' | 'warning' | 'info' {
  return { free: 'success', takeoff: 'primary', landing: 'warning', closed: 'info' }[s] as any
}
</script>

<style lang="scss" scoped>
.zg-vertiport {
  padding: 20px 24px 32px;
  color: var(--zg-ink-primary, #1e293b);

  // 头部
  &__head {
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

  // 卡片网格
  &__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
    margin-bottom: 22px;
  }
  &__card {
    background: #fff;
    border-radius: 14px;
    overflow: hidden;
    box-shadow: var(--zg-shadow-card, 0 4px 16px rgba(0,0,0,0.04));
        cursor: pointer;
    transition: transform 0.15s;
    border-top: 3px solid transparent;
    &:hover { transform: translateY(-2px); }
    &--free     { border-top-color: #10b981; }
    &--takeoff  { border-top-color: #3b82f6; }
    &--landing  { border-top-color: #a855f7; }
    &--closed   { border-top-color: #94a3b8; }
  }
  &__card-bg {
    height: 90px;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
    color: #6366f1;
    padding: 10px;
  }
  &__bg-svg { width: 100%; height: 100%; }

  &__card-head {
    padding: 12px 14px 8px;
    display: flex; justify-content: space-between; align-items: flex-start;
  }
  &__port-code { font-weight: 700; font-size: 15px; }
  &__port-loc { font-size: 12px; color: var(--zg-ink-tertiary, #94a3b8); margin-top: 2px;
    svg { vertical-align: middle; margin-right: 3px; }
  }

  &__info-row {
    display: flex; align-items: center; gap: 8px;
    padding: 4px 14px;
    font-size: 12px;
    color: var(--zg-ink-primary, #1e293b);
  }
  &__info-label { color: var(--zg-ink-tertiary, #94a3b8); width: 64px; flex-shrink: 0; }
  &__ops { font-weight: 600; color: var(--zg-brand-primary, #6366f1); }
  &__ports { display: flex; gap: 4px; flex-wrap: wrap; }
  &__port-tag {
    font-size: 11px; padding: 0 6px; height: 20px; line-height: 20px;
    background: rgba(99,102,241,0.1); color: #6366f1;
    border-radius: 10px;
  }

  &__foot {
    margin-top: 10px;
    padding: 10px 14px;
    border-top: 1px dashed rgba(0,0,0,0.06);
    background: #fafbfc;
    display: flex; justify-content: space-between; align-items: center;
  }
  &__current {
    display: flex; align-items: center; gap: 5px;
    font-size: 12px; font-weight: 600; color: var(--zg-brand-primary, #6366f1);
    &--empty { color: var(--zg-ink-tertiary, #94a3b8); font-weight: 400; }
  }
  &__wait { font-size: 11px; color: var(--zg-warning, #f59e0b); font-weight: 400; margin-left: 6px; }
  &__chargers { font-size: 11px; color: var(--zg-ink-tertiary, #94a3b8);
    .on { color: var(--zg-success, #10b981); }
  }

  // 招商表格
  &__merchant {
    background: #fff;
    border-radius: 14px;
    padding: 16px 18px;
    box-shadow: var(--zg-shadow-card, 0 4px 16px rgba(0,0,0,0.04));
  }
  &__merchant-head {
        display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 12px;
    h3 { margin: 0; font-size: 15px; font-weight: 700; }
  }

  // Drawer detail
  &__detail { display: flex; flex-direction: column; gap: 20px; }
  &__detail-section { display: flex; flex-direction: column; gap: 10px; }
  &__detail-title {
    font-size: 14px; font-weight: 700;
    padding-left: 10px;
    border-left: 3px solid #6366f1;
  }
  &__if-tag { margin-right: 6px; }
}
</style>
