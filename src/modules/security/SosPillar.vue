<!--
  智光云枢 · 安防中心 · 应急对讲 SOS
  业务域：security
  功能：SOS 应急柱台账 + 实时对讲事件流 + 应急响应轨迹时间线
        长沙先导路 / 麓谷产业园 / 梅溪湖景区 / 橘子洲头 全覆盖
-->
<template>
  <section class="zg-sos">
    <header class="zg-sos__head">
      <div class="zg-sos__headline">
        <div class="zg-sos__sigil">
          <el-icon :size="22"><Promotion /></el-icon>
        </div>
        <div class="zg-sos__copy">
          <h1 class="zg-sos__title">应急对讲柱 · SOS 一键求助</h1>
          <p class="zg-sos__sub">
            长沙先导路 · 麓谷产业园 · 梅溪湖 · 橘子洲头 · 全区 92 根应急对讲柱
          </p>
        </div>
      </div>
      <div class="zg-sos__head-right">
        <el-button type="primary" :icon="Microphone">对讲控制台</el-button>
      </div>
    </header>

    <!-- ============ KPI ============ -->
    <div class="zg-kpi">
      <div class="zg-kpi__cell">
        <div class="zg-kpi__icon"><el-icon :size="20"><OfficeBuilding /></el-icon></div>
        <div class="zg-kpi__body">
          <div class="zg-kpi__num">92</div>
          <div class="zg-kpi__lbl">在役应急柱</div>
        </div>
      </div>
      <div class="zg-kpi__cell zg-kpi__cell--ok">
        <div class="zg-kpi__icon"><el-icon :size="20"><CircleCheck /></el-icon></div>
        <div class="zg-kpi__body">
          <div class="zg-kpi__num">{{ onlineCount }}</div>
          <div class="zg-kpi__lbl">在线</div>
          <el-progress :percentage="onlineRate" :stroke-width="6" :show-text="false" status="success" />
        </div>
      </div>
      <div class="zg-kpi__cell zg-kpi__cell--danger">
        <div class="zg-kpi__icon"><el-icon :size="20"><Warning /></el-icon></div>
        <div class="zg-kpi__body">
          <div class="zg-kpi__num">3</div>
          <div class="zg-kpi__lbl">今日求助</div>
        </div>
      </div>
      <div class="zg-kpi__cell zg-kpi__cell--warn">
        <div class="zg-kpi__icon"><el-icon :size="20"><Timer /></el-icon></div>
        <div class="zg-kpi__body">
          <div class="zg-kpi__num">2'48"</div>
          <div class="zg-kpi__lbl">平均响应时长</div>
        </div>
      </div>
    </div>

    <!-- ============ 主体：左侧卡片列表 + 右侧事件流 ============ -->
    <div class="zg-sos__main">
      <!-- 左：应急柱卡片列表 -->
      <div class="zg-sos__left">
        <div class="zg-sos__panel">
          <div class="zg-sos__panel-head">
            <strong>📞 应急对讲柱 · 实时状态</strong>
            <div class="zg-sos__filters">
              <el-tag size="small" :type="filter === 'all' ? 'primary' : 'info'" effect="plain" @click="filter = 'all'" style="cursor: pointer">全部 {{ pillarList.length }}</el-tag>
              <el-tag size="small" :type="filter === 'online' ? 'success' : 'info'" effect="plain" @click="filter = 'online'" style="cursor: pointer">在线 {{ onlineCount }}</el-tag>
              <el-tag size="small" :type="filter === 'calling' ? 'danger' : 'info'" effect="plain" @click="filter = 'calling'" style="cursor: pointer">呼叫中 {{ callingCount }}</el-tag>
            </div>
          </div>
          <div class="zg-sos__grid">
            <div
              v-for="p in filteredPillars"
              :key="p.id"
              class="zg-sos__card"
              :class="'zg-sos__card--' + p.status"
              @click="openPillarDetail(p)"
            >
              <!-- 紧急呼叫状态机 -->
              <div class="zg-sos__state">
                <div class="zg-sos__state-icon" :class="'zg-sos__state-icon--' + p.status">
                  <el-icon :size="20" v-if="p.status === 'idle'"><Microphone /></el-icon>
                  <el-icon :size="20" v-else-if="p.status === 'calling'"><PhoneFilled /></el-icon>
                  <el-icon :size="20" v-else-if="p.status === 'answering'"><Headset /></el-icon>
                  <el-icon :size="20" v-else-if="p.status === 'end'"><CircleClose /></el-icon>
                  <el-icon :size="20" v-else><VideoPause /></el-icon>
                </div>
                <div class="zg-sos__state-ring" :class="'zg-sos__state-ring--' + p.status"></div>
              </div>

              <div class="zg-sos__card-body">
                <div class="zg-sos__card-head">
                  <span class="zg-sos__pillar-id">{{ p.id }}</span>
                  <span class="zg-sos__pillar-status" :class="'status-' + p.status">
                    {{ stateText(p.status) }}
                  </span>
                </div>
                <div class="zg-sos__pillar-loc">
                  <el-icon :size="12"><Location /></el-icon>
                  {{ p.location }}
                </div>
                <div class="zg-sos__pillar-meta">
                  <span class="meta-item">
                    <el-icon :size="12"><Clock /></el-icon>
                    {{ p.lastCall || '—' }}
                  </span>
                  <span class="meta-item" :class="{ danger: p.battery < 30 }">
                    <el-icon :size="12"><Service /></el-icon>
                    {{ p.battery }}%
                  </span>
                  <span class="meta-item">
                    <el-icon :size="12"><VideoCamera /></el-icon>
                    <span :class="p.cameraOnline ? 'ok' : 'off'">{{ p.cameraOnline ? '在线' : '离线' }}</span>
                  </span>
                </div>
                <!-- 电池进度条 -->
                <el-progress
                  :percentage="p.battery"
                  :stroke-width="4"
                  :show-text="false"
                  :color="p.battery > 50 ? '#22c55e' : p.battery > 20 ? '#f59e0b' : '#ef4444'"
                  style="margin-top: 6px"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 应急响应轨迹 -->
        <div class="zg-sos__panel">
          <div class="zg-sos__panel-head">
            <strong>🚨 应急响应轨迹 · SOS-018 事件</strong>
            <el-tag type="danger" size="small">处理中</el-tag>
          </div>
          <div class="zg-sos__trajectory">
            <div v-for="(step, i) in sosTrajectory" :key="i" class="zg-sos__traj-step" :class="{ active: step.active, done: step.done }">
              <div class="zg-sos__traj-node">
                <el-icon :size="14"><component :is="step.icon" /></el-icon>
              </div>
              <div class="zg-sos__traj-line" v-if="i < sosTrajectory.length - 1"></div>
              <div class="zg-sos__traj-content">
                <div class="zg-sos__traj-title">{{ step.title }}</div>
                <div class="zg-sos__traj-time">{{ step.time }}</div>
                <div class="zg-sos__traj-desc" v-if="step.desc">{{ step.desc }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右：实时对讲事件流 -->
      <div class="zg-sos__right">
        <div class="zg-sos__panel zg-sos__panel--event">
          <div class="zg-sos__panel-head">
            <strong>📡 实时对讲事件流</strong>
            <el-badge :value="eventStream.length" type="danger" class="zg-sos__badge">
              <el-icon :size="16" color="#ef4444"><Bell /></el-icon>
            </el-badge>
          </div>
          <div class="zg-sos__event-list">
            <div v-for="(e, i) in eventStream" :key="i" class="zg-sos__event-item" :class="'zg-sos__event-item--' + e.type">
              <div class="zg-sos__event-time">{{ e.time }}</div>
              <div class="zg-sos__event-dot" :class="e.type"></div>
              <div class="zg-sos__event-body">
                <div class="zg-sos__event-title">{{ e.title }}</div>
                <div class="zg-sos__event-sub">{{ e.desc }}</div>
                <div class="zg-sos__event-actions">
                  <el-tag size="small" :type="eventTagType(e.type)">{{ eventTypeLabel(e.type) }}</el-tag>
                  <span class="zg-sos__event-pillar">{{ e.pillar }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ============ 应急柱详情 Drawer ============ -->
    <el-drawer v-model="detailVisible" :title="focusPillar?.id + ' · 详情'" size="480px">
      <div v-if="focusPillar" class="zg-sos__detail">
        <div class="zg-sos__dloc">
          <el-icon :size="18" color="#6366f1"><Location /></el-icon>
          <span>{{ focusPillar.location }}</span>
        </div>
        <section class="zg-sos__dsec">
          <h4>📋 基本信息</h4>
          <div class="zg-sos__dgrid">
            <div class="zg-sos__dcell"><span class="lbl">编号</span><span class="val">{{ focusPillar.id }}</span></div>
            <div class="zg-sos__dcell"><span class="lbl">状态</span><span class="val" :class="focusPillar.status === 'offline' ? 'danger' : ''">{{ stateText(focusPillar.status) }}</span></div>
            <div class="zg-sos__dcell"><span class="lbl">电池</span><span class="val" :class="{ danger: focusPillar.battery < 30 }">{{ focusPillar.battery }}%</span></div>
            <div class="zg-sos__dcell"><span class="lbl">摄像头</span><span class="val">{{ focusPillar.cameraOnline ? '● 在线' : '○ 离线' }}</span></div>
            <div class="zg-sos__dcell"><span class="lbl">IP 地址</span><span class="val">{{ focusPillar.ip }}</span></div>
            <div class="zg-sos__dcell"><span class="lbl">部署日期</span><span class="val">{{ focusPillar.deployDate }}</span></div>
          </div>
        </section>
        <section class="zg-sos__dsec">
          <h4>🎙 操作</h4>
          <div class="zg-sos__dactions">
            <el-button type="primary" :disabled="focusPillar.status !== 'idle'" :icon="Microphone">发起对讲</el-button>
            <el-button type="warning" :icon="Warning">触发 SOS 测试</el-button>
            <el-button :icon="VideoCamera">查看摄像头</el-button>
          </div>
        </section>
        <section class="zg-sos__dsec">
          <h4>📅 历史呼叫记录</h4>
          <div class="zg-sos__dlog">
            <div v-for="(log, i) in focusPillar.calls" :key="i" class="dlog-row">
              <span class="dlog-time">{{ log.time }}</span>
              <span class="dlog-type">{{ log.type }}</span>
              <span class="dlog-desc">{{ log.desc }}</span>
            </div>
            <div v-if="!focusPillar.calls || focusPillar.calls.length === 0" class="zg-sos__empty">暂无呼叫记录</div>
          </div>
        </section>
      </div>
    </el-drawer>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  Promotion, Microphone, PhoneFilled, Headset, CircleClose, VideoPause,
  OfficeBuilding, CircleCheck, Warning, Timer, Location, Clock, Service,
  VideoCamera, Bell, Monitor, Van, CircleCheckFilled
} from '@element-plus/icons-vue'

const detailVisible = ref(false)
const focusPillar = ref(null)
const filter = ref('all')

// Mock 应急柱数据
const pillarList = ref([
  { id: 'SOS-011', location: '先导路 · 桐梓坡路口', status: 'idle', battery: 96, cameraOnline: true, lastCall: '10-25 14:20', ip: '10.0.31.11', deployDate: '2024-06-12', calls: [{ time: '10-25 14:20', type: '测试', desc: '例行通话测试' }, { time: '09-18 09:12', type: '求助', desc: '路人迷路咨询路线' }] },
  { id: 'SOS-012', location: '先导路 · 麓谷大道东', status: 'idle', battery: 94, cameraOnline: true, lastCall: '10-22 16:08', ip: '10.0.31.12', deployDate: '2024-06-12', calls: [{ time: '10-22 16:08', type: '求助', desc: '车辆轻微剐蹭，协助报警' }] },
  { id: 'SOS-013', location: '麓谷产业园 · 东门', status: 'idle', battery: 88, cameraOnline: true, lastCall: '—', ip: '10.0.31.13', deployDate: '2024-07-20', calls: [] },
  { id: 'SOS-014', location: '麓谷产业园 · 西门', status: 'offline', battery: 5, cameraOnline: false, lastCall: '10-15 11:45', ip: '10.0.31.14', deployDate: '2024-07-20', calls: [{ time: '10-15 11:45', type: '求助', desc: '设备电量告急前最后一次呼叫' }] },
  { id: 'SOS-015', location: '先导路 · 文轩路口', status: 'answering', battery: 78, cameraOnline: true, lastCall: '进行中', ip: '10.0.31.15', deployDate: '2024-08-05', calls: [{ time: '10-27 17:22', type: 'SOS', desc: '突发疾病求助，已接通' }] },
  { id: 'SOS-016', location: '先导路 · 金星大道跨线桥', status: 'idle', battery: 82, cameraOnline: true, lastCall: '10-20 09:30', ip: '10.0.31.16', deployDate: '2024-08-05', calls: [{ time: '10-20 09:30', type: '测试', desc: '定期巡检测试' }] },
  { id: 'SOS-017', location: '梅溪湖 · 节庆岛', status: 'end', battery: 62, cameraOnline: true, lastCall: '10-27 14:22 ~ 14:28', ip: '10.0.31.17', deployDate: '2024-09-01', calls: [{ time: '10-27 14:22', type: 'SOS', desc: '游客突发心脏病，6分钟完成处置' }] },
  { id: 'SOS-018', location: '梅溪湖 · 环湖路中段', status: 'calling', battery: 71, cameraOnline: true, lastCall: '呼叫中', ip: '10.0.31.18', deployDate: '2024-09-01', calls: [{ time: '10-27 14:22', type: 'SOS', desc: '紧急求助触发' }] },
  { id: 'SOS-019', location: '橘子洲头 · 青年毛泽东雕像', status: 'idle', battery: 91, cameraOnline: true, lastCall: '10-26 10:15', ip: '10.0.31.19', deployDate: '2024-05-01', calls: [{ time: '10-26 10:15', type: '求助', desc: '儿童走失协助广播' }] },
  { id: 'SOS-020', location: '橘子洲头 · 游客中心', status: 'idle', battery: 95, cameraOnline: true, lastCall: '10-24 15:42', ip: '10.0.31.20', deployDate: '2024-05-01', calls: [{ time: '10-24 15:42', type: '咨询', desc: '游客咨询游船班次' }] },
  { id: 'SOS-021', location: '先导路 · 枫林路口', status: 'idle', battery: 85, cameraOnline: true, lastCall: '—', ip: '10.0.31.21', deployDate: '2024-10-10', calls: [] },
  { id: 'SOS-022', location: '岳麓区 · 新民路公交站', status: 'idle', battery: 90, cameraOnline: true, lastCall: '10-23 08:10', ip: '10.0.31.22', deployDate: '2024-04-01', calls: [{ time: '10-23 08:10', type: '求助', desc: '公交车延误咨询' }] },
])

const filteredPillars = computed(() => {
  if (filter.value === 'all') return pillarList.value
  return pillarList.value.filter(p => p.status === filter.value || (filter.value === 'online' && p.status !== 'offline'))
})

const onlineCount = computed(() => pillarList.value.filter(p => p.status !== 'offline').length)
const onlineRate = computed(() => Math.round(onlineCount.value / pillarList.value.length * 100))
const callingCount = computed(() => pillarList.value.filter(p => p.status === 'calling' || p.status === 'answering').length)

// 实时事件流
const eventStream = ref([
  { time: '18:02:47', type: 'dispatch', pillar: 'SOS-018', title: '派单完成', desc: '岳麓区巡逻车已接单，预计 3 分钟到达梅溪湖环湖路' },
  { time: '17:55:33', type: 'call', pillar: 'SOS-015', title: '对讲接通', desc: '突发疾病求助已接通，值班员李工正在安抚' },
  { time: '17:42:18', type: 'alert', pillar: 'SOS-018', title: 'SOS 触发', desc: '紧急求助按钮被按下，已自动连入调度中心' },
  { time: '16:38:02', type: 'maintenance', pillar: 'SOS-014', title: '低电量告警', desc: '电池仅剩 5%，请尽快前往麓谷产业园西门更换' },
  { time: '15:20:11', type: 'end', pillar: 'SOS-017', title: '对讲结束', desc: '梅溪湖节庆岛事件处置完成，通话时长 6 分 23 秒' },
  { time: '14:28:45', type: 'resolve', pillar: 'SOS-017', title: '事件解决', desc: '120 急救到场，患者已移交，状态良好' },
  { time: '14:22:08', type: 'alert', pillar: 'SOS-017', title: 'SOS 触发', desc: '梅溪湖节庆岛游客突发心脏病求助' },
  { time: '11:05:22', type: 'call', pillar: 'SOS-012', title: '对讲接通', desc: '路人咨询先导路换乘路线' },
])

// 应急轨迹
const sosTrajectory = ref([
  { title: 'SOS 触发', time: '14:22:08', desc: '游客在 SOS-018 按下紧急按钮', done: true, active: false, icon: Warning },
  { title: '调度中心接听', time: '14:22:15', desc: '值班员张工在 7 秒内接通对讲', done: true, active: false, icon: Headset },
  { title: '联动 110 / 120', time: '14:22:32', desc: '后台自动同步报警信息至岳麓区分局', done: true, active: false, icon: Monitor },
  { title: '巡逻车派单', time: '14:23:10', desc: '岳麓区巡逻车（湘A·警 085）接单前往', done: true, active: true, icon: Van },
  { title: '医护到场', time: '—', desc: '预计 14:28 到达现场', done: false, active: false, icon: CircleCheck },
  { title: '事件解决', time: '—', desc: '现场处置完毕，记录归档', done: false, active: false, icon: CircleCheckFilled },
])

// 工具方法
const stateText = (s) => ({ idle: '空闲', calling: '呼叫中', answering: '接听中', end: '已结束', offline: '离线' }[s] || s)
const eventTagType = (t) => ({ alert: 'danger', call: 'warning', dispatch: 'primary', resolve: 'success', maintenance: 'info', end: 'success' }[t] || '')
const eventTypeLabel = (t) => ({ alert: 'SOS 触发', call: '对讲', dispatch: '派单', resolve: '解决', maintenance: '维护', end: '结束' }[t] || t)

const openPillarDetail = (p) => { focusPillar.value = p; detailVisible.value = true }
</script>

<style scoped lang="scss">
.zg-sos { padding: 20px; display: flex; flex-direction: column; gap: 16px; }

// 头部
.zg-sos__head { display: flex; justify-content: space-between; align-items: center; }
.zg-sos__headline { display: flex; align-items: center; gap: 14px; }
.zg-sos__sigil {
  width: 44px; height: 44px; border-radius: 10px;
  background: linear-gradient(135deg, var(--zg-danger, #ef4444), var(--zg-warning, #f59e0b));
    color: #fff; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.35);
}
.zg-sos__title { font-size: 20px; font-weight: 600; color: var(--zg-ink-primary, #1e293b); margin: 0 0 4px; }
.zg-sos__sub { font-size: 13px; color: var(--zg-ink-tertiary, #94a3b8); margin: 0; }

// KPI
.zg-kpi { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.zg-kpi__cell {
  background: #fff; border: 1px solid var(--zg-line-soft, #f1f5f9);
  border-radius: 12px; padding: 14px 16px; display: flex; align-items: center; gap: 14px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}
.zg-kpi__icon {
  width: 42px; height: 42px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  background: #eef2ff; color: var(--zg-brand-primary, #6366f1);
}
.zg-kpi__body { display: flex; flex-direction: column; gap: 2px; flex: 1; }
.zg-kpi__num { font-size: 22px; font-weight: 700; color: var(--zg-ink-primary, #1e293b); }
.zg-kpi__lbl { font-size: 13px; color: var(--zg-ink-tertiary, #94a3b8); }

.zg-kpi__cell--ok .zg-kpi__icon { background: #dcfce7; color: var(--zg-success, #22c55e); }
.zg-kpi__cell--ok .zg-kpi__num { color: var(--zg-success, #22c55e); }
.zg-kpi__cell--danger .zg-kpi__icon { background: #fee2e2; color: var(--zg-danger, #ef4444); }
.zg-kpi__cell--danger .zg-kpi__num { color: var(--zg-danger, #ef4444); }
.zg-kpi__cell--warn .zg-kpi__icon { background: #fef3c7; color: var(--zg-warning, #f59e0b); }
.zg-kpi__cell--warn .zg-kpi__num { color: var(--zg-warning, #f59e0b); }

// ============ 主体 ============
.zg-sos__main { display: grid; grid-template-columns: 1.55fr 1fr; gap: 14px; }
.zg-sos__left { display: flex; flex-direction: column; gap: 14px; }

.zg-sos__panel {
  background: #fff; border: 1px solid var(--zg-line-soft, #f1f5f9);
  border-radius: 12px; padding: 14px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}
.zg-sos__panel-head {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;
  strong { font-size: 14px; color: var(--zg-ink-primary, #1e293b); font-weight: 600; }
}

// ============ 应急柱卡片 ============
.zg-sos__grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px;
}
.zg-sos__card {
  position: relative; cursor: pointer;
  background: #fff; border: 1px solid var(--zg-line-soft, #f1f5f9); border-radius: 12px;
  padding: 12px; display: flex; gap: 12px;
  transition: all 0.2s;
}
.zg-sos__card:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(99,102,241,0.12); border-color: var(--zg-brand-primary, #6366f1); }
.zg-sos__card--calling { border-color: var(--zg-danger, #ef4444); background: linear-gradient(180deg, #fff 0%, #fef2f2 100%); }
.zg-sos__card--answering { border-color: var(--zg-success, #22c55e); background: linear-gradient(180deg, #fff 0%, #f0fdf4 100%); }
.zg-sos__card--end { border-color: #fbbf24; background: linear-gradient(180deg, #fff 0%, #fefce8 100%); }
.zg-sos__card--offline { opacity: 0.6; }

// 状态机图标
.zg-sos__state { position: relative; width: 48px; height: 48px; flex-shrink: 0; }
.zg-sos__state-icon {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: #f1f5f9; color: #94a3b8; z-index: 2;
}
.zg-sos__state-icon--idle { background: #f1f5f9; color: #64748b; }
.zg-sos__state-icon--calling { background: var(--zg-danger, #ef4444); color: #fff; animation: blink 0.8s infinite; }
.zg-sos__state-icon--answering { background: var(--zg-success, #22c55e); color: #fff; }
.zg-sos__state-icon--end { background: var(--zg-warning, #f59e0b); color: #fff; }
.zg-sos__state-icon--offline { background: #cbd5e1; color: #64748b; }

.zg-sos__state-ring {
  position: absolute; inset: 0; border-radius: 50%; z-index: 1;
  border: 2px solid transparent;
}
.zg-sos__state-ring--calling { border-color: var(--zg-danger, #ef4444); animation: rippleRing 1.2s infinite; }
.zg-sos__state-ring--answering { border-color: var(--zg-success, #22c55e); box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.15); }
@keyframes blink { 0%, 100% { opacity: 1 } 50% { opacity: 0.4 } }
@keyframes rippleRing {
  0% { transform: scale(1); opacity: 1 }
  100% { transform: scale(1.4); opacity: 0 }
}

.zg-sos__card-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.zg-sos__card-head { display: flex; justify-content: space-between; align-items: center; }
.zg-sos__pillar-id { font-size: 14px; font-weight: 700; color: var(--zg-ink-primary, #1e293b); font-family: monospace; }
.zg-sos__pillar-status { font-size: 11px; padding: 2px 8px; border-radius: 10px; }
.zg-sos__pillar-status.status-idle { background: #f1f5f9; color: #64748b; }
.zg-sos__pillar-status.status-calling { background: #fee2e2; color: var(--zg-danger, #ef4444); animation: blink 0.8s infinite; }
.zg-sos__pillar-status.status-answering { background: #dcfce7; color: var(--zg-success, #22c55e); }
.zg-sos__pillar-status.status-end { background: #fef3c7; color: var(--zg-warning, #f59e0b); }
.zg-sos__pillar-status.status-offline { background: #e2e8f0; color: #94a3b8; }

.zg-sos__pillar-loc {
  display: flex; align-items: center; gap: 4px; font-size: 12px; color: #64748b;
  margin-top: 2px;
  .el-icon { color: var(--zg-brand-primary, #6366f1); }
}

.zg-sos__pillar-meta {
  display: flex; gap: 10px; margin-top: 4px; font-size: 11px; color: #94a3b8; flex-wrap: wrap;
}
.meta-item { display: flex; align-items: center; gap: 3px; }
.meta-item .ok { color: var(--zg-success, #22c55e); }
.meta-item .off { color: #94a3b8; }
.meta-item.danger { color: var(--zg-danger, #ef4444); font-weight: 600; }

// ============ 应急轨迹时间线 ============
.zg-sos__trajectory { display: flex; flex-direction: column; gap: 0; }
.zg-sos__traj-step {
  position: relative; display: flex; gap: 14px;
  padding: 6px 0;
}
.zg-sos__traj-node {
  width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
  background: #f1f5f9; color: #94a3b8;
  display: flex; align-items: center; justify-content: center; z-index: 2;
}
.zg-sos__traj-step.done .zg-sos__traj-node { background: var(--zg-success, #22c55e); color: #fff; }
.zg-sos__traj-step.active .zg-sos__traj-node {
  background: var(--zg-warning, #f59e0b); color: #fff;
  animation: pulseRing 1.4s infinite;
}
@keyframes pulseRing {
  0%, 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.5) }
  50% { box-shadow: 0 0 0 8px rgba(245, 158, 11, 0) }
}
.zg-sos__traj-line {
  position: absolute; left: 15px; top: 38px; width: 2px; height: calc(100% - 32px);
  background: #e2e8f0; z-index: 1;
}
.zg-sos__traj-content { flex: 1; padding-top: 4px; padding-bottom: 8px; }
.zg-sos__traj-step.done .zg-sos__traj-content { .zg-sos__traj-title { color: var(--zg-success, #22c55e); } }
.zg-sos__traj-step.active .zg-sos__traj-content { .zg-sos__traj-title { color: var(--zg-warning, #f59e0b); font-weight: 700; } }
.zg-sos__traj-title { font-size: 13px; color: var(--zg-ink-primary, #1e293b); font-weight: 500; }
.zg-sos__traj-time { font-size: 11px; font-family: monospace; color: #94a3b8; margin-top: 2px; }
.zg-sos__traj-desc { font-size: 12px; color: #64748b; margin-top: 2px; }

// ============ 右侧事件流 ============
.zg-sos__right { display: flex; flex-direction: column; gap: 14px; }
.zg-sos__panel--event { height: calc(100vh - 180px); max-height: 760px; display: flex; flex-direction: column; }
.zg-sos__badge { display: flex; }

.zg-sos__event-list { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; }
.zg-sos__event-item {
  position: relative; padding: 10px 12px 10px 22px;
  background: linear-gradient(90deg, #fff, #f8fafc);
  border: 1px solid var(--zg-line-soft, #f1f5f9); border-radius: 10px;
  transition: all 0.2s;
}
.zg-sos__event-item:hover { transform: translateX(2px); box-shadow: 0 2px 8px rgba(99, 102, 241, 0.15); }
.zg-sos__event-item--alert { border-left: 3px solid var(--zg-danger, #ef4444); }
.zg-sos__event-item--call { border-left: 3px solid var(--zg-warning, #f59e0b); }
.zg-sos__event-item--dispatch { border-left: 3px solid var(--zg-brand-primary, #6366f1); }
.zg-sos__event-item--resolve { border-left: 3px solid var(--zg-success, #22c55e); }
.zg-sos__event-item--maintenance { border-left: 3px solid #64748b; }
.zg-sos__event-item--end { border-left: 3px solid var(--zg-success, #22c55e); }

.zg-sos__event-dot {
  position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--zg-brand-primary, #6366f1);
}
.zg-sos__event-dot.alert { background: var(--zg-danger, #ef4444); animation: blink 0.8s infinite; }
.zg-sos__event-dot.call { background: var(--zg-warning, #f59e0b); }
.zg-sos__event-dot.dispatch { background: var(--zg-brand-primary, #6366f1); }
.zg-sos__event-dot.resolve { background: var(--zg-success, #22c55e); }
.zg-sos__event-dot.maintenance { background: #64748b; }
.zg-sos__event-dot.end { background: var(--zg-success, #22c55e); }

.zg-sos__event-time { font-family: monospace; font-size: 11px; color: #94a3b8; }
.zg-sos__event-title { font-size: 13px; font-weight: 600; color: var(--zg-ink-primary, #1e293b); margin-top: 2px; }
.zg-sos__event-sub { font-size: 12px; color: #64748b; margin-top: 2px; }
.zg-sos__event-actions { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
.zg-sos__event-pillar { font-size: 11px; color: var(--zg-brand-primary, #6366f1); font-family: monospace; }

// ============ Drawer ============
.zg-sos__detail { display: flex; flex-direction: column; gap: 16px; }
.zg-sos__dloc { display: flex; align-items: center; gap: 6px; padding: 10px 12px; background: #eef2ff; border-radius: 8px; font-size: 13px; color: var(--zg-ink-primary, #1e293b); }

.zg-sos__dsec h4 { margin: 0 0 10px; font-size: 13px; font-weight: 600; color: var(--zg-ink-primary, #1e293b); padding-left: 8px; border-left: 3px solid var(--zg-brand-primary, #6366f1); }
.zg-sos__dgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.zg-sos__dcell { background: #f8fafc; border-radius: 8px; padding: 10px 12px; display: flex; flex-direction: column; gap: 2px; }
.zg-sos__dcell .lbl { font-size: 11px; color: #94a3b8; }
.zg-sos__dcell .val { font-size: 14px; font-weight: 600; color: var(--zg-ink-primary, #1e293b); font-family: monospace; }
.zg-sos__dcell .val.danger { color: var(--zg-danger, #ef4444); }

.zg-sos__dactions { display: flex; gap: 8px; flex-wrap: wrap; }

.zg-sos__dlog { display: flex; flex-direction: column; gap: 4px; }
.dlog-row { display: flex; gap: 10px; font-size: 12px; padding: 6px 0; border-bottom: 1px dashed var(--zg-line-soft, #f1f5f9); }
.dlog-row:last-child { border-bottom: none; }
.dlog-time { font-family: monospace; color: #94a3b8; min-width: 72px; }
.dlog-type { color: var(--zg-brand-primary, #6366f1); font-weight: 500; min-width: 32px; }
.dlog-desc { color: var(--zg-ink-primary, #1e293b); flex: 1; }
.zg-sos__empty { font-size: 12px; color: #94a3b8; text-align: center; padding: 12px; }

@media (max-width: 1280px) {
  .zg-kpi { grid-template-columns: repeat(2, 1fr); }
  .zg-sos__main { grid-template-columns: 1fr; }
}
</style>
