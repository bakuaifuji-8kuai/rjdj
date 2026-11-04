<!--
  智光云枢 · 安防中心 · 井盖防偷监测
  业务域：security
  功能：先导路沿线 15 个智能井盖的实时在线状态 / 倾角传感器 / 振动告警 / 积水告警
        支持列表视图与 SVG 地图视图切换、告警派发工单
-->
<template>
  <section class="zg-manhole">
    <header class="zg-manhole__head">
      <div class="zg-manhole__headline">
        <div class="zg-manhole__sigil">
          <el-icon :size="22"><Grid /></el-icon>
        </div>
        <div class="zg-manhole__copy">
          <h1 class="zg-manhole__title">井盖安全监测</h1>
          <p class="zg-manhole__sub">
            先导路沿线 · 岳麓段 · 麓谷段 · 梅溪湖段 · 共 {{ manholeList.length }} 个智能井盖
          </p>
        </div>
      </div>
      <el-button type="primary" :icon="Plus">新增井盖</el-button>
    </header>

    <!-- ============ KPI ============ -->
    <div class="zg-kpi">
      <div class="zg-kpi__cell">
        <div class="zg-kpi__icon"><el-icon :size="20"><Grid /></el-icon></div>
        <div class="zg-kpi__body">
          <div class="zg-kpi__num">{{ manholeList.length }}</div>
          <div class="zg-kpi__lbl">在役井盖</div>
        </div>
      </div>
      <div class="zg-kpi__cell zg-kpi__cell--ok">
        <div class="zg-kpi__icon"><el-icon :size="20"><CircleCheck /></el-icon></div>
        <div class="zg-kpi__body">
          <div class="zg-kpi__num">{{ onlineCount }}</div>
          <div class="zg-kpi__lbl">在线运行</div>
          <el-progress :percentage="onlineRate" :stroke-width="6" :show-text="false" status="success" />
        </div>
      </div>
      <div class="zg-kpi__cell zg-kpi__cell--danger">
        <div class="zg-kpi__icon"><el-icon :size="20"><Warning /></el-icon></div>
        <div class="zg-kpi__body">
          <div class="zg-kpi__num">{{ antiTamperWarningFilled }}</div>
          <div class="zg-kpi__lbl">防撬告警</div>
        </div>
      </div>
      <div class="zg-kpi__cell zg-kpi__cell--warn">
        <div class="zg-kpi__icon"><el-icon :size="20"><MostlyCloudy /></el-icon></div>
        <div class="zg-kpi__body">
          <div class="zg-kpi__num">{{ waterWarningFilled }}</div>
          <div class="zg-kpi__lbl">积水告警</div>
        </div>
      </div>
    </div>

    <!-- ============ Tab 切换 ============ -->
    <el-tabs v-model="activeTab" class="zg-manhole__tabs">
      <!-- ============ Tab 1：列表视图 ============ -->
      <el-tab-pane label="📋 卡片列表" name="list">
        <div class="zg-manhole__grid">
          <div
            v-for="m in manholeList"
            :key="m.id"
            class="zg-manhole__card"
            :class="{ 'zg-manhole__card--alert': m.alert === true }"
            @click="openDetail(m)"
          >
            <div class="zg-manhole__card-head">
              <div class="zg-manhole__code">{{ m.id }}</div>
              <div class="zg-manhole__status">
                <span v-if="m.status === 'online'" class="tag tag-ok">● 在线</span>
                <span v-else-if="m.status === 'offline'" class="tag tag-off">○ 离线</span>
                <span v-else-if="m.alert" class="tag tag-danger">⚠ 告警</span>
              </div>
            </div>

            <div class="zg-manhole__loc">
              <el-icon><Location /></el-icon>
              <span>{{ m.location }}</span>
            </div>

            <div class="zg-manhole__sensors">
              <div class="sensor">
                <div class="sensor__lbl">倾角</div>
                <div class="sensor__val" :class="{ danger: m.tilt > 15 }">{{ m.tilt }}°</div>
                <div class="sensor__bar">
                  <div class="sensor__fill" :style="{ width: Math.min(100, m.tilt / 30 * 100) + '%' }" :class="{ danger: m.tilt > 15 }"></div>
                </div>
              </div>
              <div class="sensor">
                <div class="sensor__lbl">振动</div>
                <div class="sensor__val" :class="{ warn: m.vibration > 40 }">{{ m.vibration }}</div>
                <div class="sensor__bar">
                  <div class="sensor__fill warn" :style="{ width: Math.min(100, m.vibration / 80 * 100) + '%' }"></div>
                </div>
              </div>
            </div>

            <div class="zg-manhole__foot">
              <span>巡检 {{ m.lastInspect }}</span>
              <el-button size="small" type="primary" link @click.stop="dispatchTicket(m)" v-if="m.alert">派单</el-button>
            </div>

            <div v-if="m.alert" class="zg-manhole__alert-pulse"></div>
          </div>
        </div>
      </el-tab-pane>

      <!-- ============ Tab 2：地图视图 ============ -->
      <el-tab-pane label="🗺️ 地图视图" name="map">
        <div class="zg-manhole__map-wrap">
          <svg viewBox="0 0 800 400" class="zg-manhole__map">
            <defs>
              <linearGradient id="mhbg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#f0f9ff" />
                <stop offset="100%" stop-color="#e0f2fe" />
              </linearGradient>
              <linearGradient id="road" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stop-color="#fbbf24" />
                <stop offset="100%" stop-color="#f59e0b" />
              </linearGradient>
            </defs>
            <rect width="800" height="400" fill="url(#mhbg)" />
            <!-- 先导路 -->
            <path d="M 20 120 L 780 200" stroke="url(#road)" stroke-width="28" fill="none" stroke-linecap="round" />
            <path d="M 20 120 L 780 200" stroke="#fff" stroke-width="2" stroke-dasharray="12 10" fill="none" />
            <!-- 梅溪湖 -->
            <ellipse cx="150" cy="290" rx="90" ry="55" fill="#bae6fd" opacity="0.7" />
            <!-- 麓谷科技 -->
            <rect x="520" y="40" width="150" height="80" fill="#fde68a" opacity="0.4" />
            <!-- 节点 -->
            <g v-for="m in manholeList" :key="m.id" @click="openDetail(m)" class="mh-node-group">
              <circle :cx="m.mapX" :cy="m.mapY" r="14" :class="'mh-ripple mh-ripple--' + (m.alert ? 'alert' : m.status === 'offline' ? 'off' : 'ok')" />
              <circle :cx="m.mapX" :cy="m.mapY" r="6" :class="'mh-dot mh-dot--' + (m.alert ? 'alert' : m.status === 'offline' ? 'off' : 'ok')" />
              <text :x="m.mapX + 12" :y="m.mapY + 4" class="mh-label">{{ m.id }}</text>
            </g>
          </svg>
          <!-- 地名 -->
          <div class="geo geo-left">岳麓区</div>
          <div class="geo geo-center">先导路 · 主干段</div>
          <div class="geo geo-right">麓谷</div>
          <div class="geo geo-lake">梅溪湖</div>
          <!-- 图例 -->
          <div class="zg-manhole__legend">
            <span><i class="ld ld-ok"></i>在线</span>
            <span><i class="ld ld-alert"></i>告警</span>
            <span><i class="ld ld-off"></i>离线</span>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- ============ 详情 Drawer ============ -->
    <el-drawer v-model="detailVisible" :title="focusManhole?.id + ' · 详情'" size="460px">
      <div v-if="focusManhole" class="zg-manhole__detail">
        <div class="zg-manhole__dloc">
          <el-icon :size="18" color="#6366f1"><Location /></el-icon>
          <span>{{ focusManhole.location }}</span>
        </div>

        <section class="zg-manhole__dsec">
          <h4>📡 实时传感器</h4>
          <div class="zg-manhole__dgrid">
            <div class="zg-manhole__dcell"><span class="lbl">倾角</span><span class="val" :class="{ danger: focusManhole.tilt > 15 }">{{ focusManhole.tilt }}°</span></div>
            <div class="zg-manhole__dcell"><span class="lbl">振动</span><span class="val">{{ focusManhole.vibration }}</span></div>
            <div class="zg-manhole__dcell"><span class="lbl">积水</span><span class="val">{{ focusManhole.waterLevel }} mm</span></div>
            <div class="zg-manhole__dcell"><span class="lbl">电池</span><span class="val">{{ focusManhole.battery }}%</span></div>
            <div class="zg-manhole__dcell zg-manhole__dcell--full"><span class="lbl">位置坐标</span><span class="val">N28°13′ {{ focusManhole.lat }}  E112°54′ {{ focusManhole.lng }}</span></div>
            <div class="zg-manhole__dcell zg-manhole__dcell--full"><span class="lbl">最后在线</span><span class="val">{{ focusManhole.lastOnline }}</span></div>
          </div>
        </section>

        <section class="zg-manhole__dsec" v-if="focusManhole.alert">
          <h4 class="danger">⚠️ 当前告警</h4>
          <div class="zg-manhole__dalert">
            <div>{{ focusManhole.alertType }} · {{ focusManhole.alertTime }}</div>
            <div class="zg-manhole__dactions">
              <el-button type="danger" size="small" @click="markHandled">标记已处理</el-button>
              <el-button type="warning" size="small" @click="dispatchTicket(focusManhole)">派发工单</el-button>
            </div>
          </div>
        </section>

        <section class="zg-manhole__dsec">
          <h4>📅 最近巡检记录</h4>
          <div class="zg-manhole__dlog">
            <div v-for="(log, i) in focusManhole.logs" :key="i" class="dlog-row">
              <span class="dlog-time">{{ log.time }}</span>
              <span class="dlog-act">{{ log.actor }}</span>
              <span class="dlog-desc">{{ log.desc }}</span>
            </div>
          </div>
        </section>
      </div>
    </el-drawer>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Grid, Plus, Location, CircleCheck, Warning, MostlyCloudy } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const activeTab = ref('list')
const detailVisible = ref(false)
const focusManhole = ref(null)

// 15 个 mock 井盖数据（先导路沿线）
const manholeList = ref([
  { id: 'MH-001', location: '先导路 · 桐梓坡路口', status: 'online', alert: false, tilt: 2, vibration: 12, waterLevel: 0, battery: 94, lastInspect: '2026-10-25 10:30', lastOnline: '10-27 18:02:11', lat: '34.215', lng: '12.508', mapX: 180, mapY: 140, logs: [{ time: '10-25', actor: '张工', desc: '常规巡检，正常' }, { time: '09-18', actor: '李工', desc: '传感器校准' }] },
  { id: 'MH-002', location: '先导路 · 咸嘉湖路口', status: 'online', alert: false, tilt: 1, vibration: 8, waterLevel: 0, battery: 88, lastInspect: '2026-10-24 14:20', lastOnline: '10-27 18:02:11', lat: '34.218', lng: '12.512', mapX: 230, mapY: 152, logs: [{ time: '10-24', actor: '李工', desc: '清理井内杂物' }] },
  { id: 'MH-003', location: '先导路 · 金星大道跨线桥', status: 'alert', alertType: '防撬告警', alertTime: '2026-10-27 17:42', tilt: 18, vibration: 62, waterLevel: 0, battery: 72, lastInspect: '2026-10-23 09:15', lastOnline: '10-27 17:42:03', lat: '34.220', lng: '12.516', mapX: 290, mapY: 160, logs: [{ time: '10-27', actor: '系统', desc: '防撬告警自动触发' }, { time: '10-23', actor: '王工', desc: '防水处理' }] },
  { id: 'MH-004', location: '先导路 · 金菊路口', status: 'online', alert: false, tilt: 3, vibration: 15, waterLevel: 2, battery: 81, lastInspect: '2026-10-26 11:40', lastOnline: '10-27 18:02:10', lat: '34.222', lng: '12.520', mapX: 350, mapY: 170, logs: [{ time: '10-26', actor: '张工', desc: '更换电池' }] },
  { id: 'MH-005', location: '先导路 · 枫林路口', status: 'offline', alert: false, tilt: 0, vibration: 0, waterLevel: 0, battery: 8, lastInspect: '2026-10-15 10:00', lastOnline: '10-26 22:14:55', lat: '34.224', lng: '12.524', mapX: 405, mapY: 178, logs: [{ time: '10-26', actor: '系统', desc: '设备离线，疑似断电' }] },
  { id: 'MH-006', location: '先导路 · 麓谷大道口', status: 'online', alert: false, tilt: 1, vibration: 6, waterLevel: 0, battery: 96, lastInspect: '2026-10-27 08:30', lastOnline: '10-27 18:02:11', lat: '34.226', lng: '12.528', mapX: 460, mapY: 186, logs: [{ time: '10-27', actor: '李工', desc: '早班巡检，一切正常' }] },
  { id: 'MH-007', location: '先导路 · 文轩路口', status: 'alert', alertType: '积水告警', alertTime: '2026-10-27 15:20', tilt: 4, vibration: 22, waterLevel: 48, battery: 65, lastInspect: '2026-10-20 16:10', lastOnline: '10-27 18:02:11', lat: '34.228', lng: '12.532', mapX: 515, mapY: 194, logs: [{ time: '10-27', actor: '系统', desc: '积水深度 48mm，触发告警' }] },
  { id: 'MH-008', location: '先导路 · 咸嘉湖西路', status: 'online', alert: false, tilt: 2, vibration: 10, waterLevel: 0, battery: 90, lastInspect: '2026-10-25 14:00', lastOnline: '10-27 18:02:11', lat: '34.230', lng: '12.536', mapX: 570, mapY: 202, logs: [{ time: '10-25', actor: '王工', desc: '定期巡检' }] },
  { id: 'MH-009', location: '先导路 · 燕联路口', status: 'online', alert: false, tilt: 0, vibration: 5, waterLevel: 0, battery: 92, lastInspect: '2026-10-24 09:30', lastOnline: '10-27 18:02:11', lat: '34.232', lng: '12.540', mapX: 620, mapY: 210, logs: [{ time: '10-24', actor: '张工', desc: '井盖螺丝紧固' }] },
  { id: 'MH-010', location: '先导路 · 天顶路口', status: 'online', alert: false, tilt: 3, vibration: 18, waterLevel: 1, battery: 85, lastInspect: '2026-10-26 15:40', lastOnline: '10-27 18:02:11', lat: '34.234', lng: '12.544', mapX: 675, mapY: 218, logs: [{ time: '10-26', actor: '李工', desc: '检查完毕' }] },
  { id: 'MH-011', location: '先导路 · 尖山路口', status: 'online', alert: false, tilt: 1, vibration: 7, waterLevel: 0, battery: 89, lastInspect: '2026-10-27 10:10', lastOnline: '10-27 18:02:11', lat: '34.236', lng: '12.548', mapX: 720, mapY: 225, logs: [{ time: '10-27', actor: '王工', desc: '例行检查' }] },
  { id: 'MH-012', location: '先导路 · 麓谷科技园南门', status: 'alert', alertType: '防撬告警', alertTime: '2026-10-27 11:08', tilt: 22, vibration: 75, waterLevel: 0, battery: 60, lastInspect: '2026-10-22 08:00', lastOnline: '10-27 11:08:22', lat: '34.240', lng: '12.555', mapX: 610, mapY: 90, logs: [{ time: '10-27', actor: '系统', desc: '强力振动 + 倾角突变告警' }] },
  { id: 'MH-013', location: '先导路 · 梅溪湖西岸', status: 'online', alert: false, tilt: 2, vibration: 14, waterLevel: 3, battery: 78, lastInspect: '2026-10-21 16:20', lastOnline: '10-27 18:02:11', lat: '34.200', lng: '12.505', mapX: 150, mapY: 285, logs: [{ time: '10-21', actor: '张工', desc: '湖边防腐蚀处理' }] },
  { id: 'MH-014', location: '先导路 · 梅溪湖隧道东口', status: 'online', alert: false, tilt: 4, vibration: 25, waterLevel: 5, battery: 71, lastInspect: '2026-10-19 11:30', lastOnline: '10-27 18:02:11', lat: '34.210', lng: '12.510', mapX: 240, mapY: 250, logs: [{ time: '10-19', actor: '李工', desc: '隧道内信号增强' }] },
  { id: 'MH-015', location: '先导路 · 橘子洲大桥西', status: 'online', alert: false, tilt: 1, vibration: 9, waterLevel: 0, battery: 93, lastInspect: '2026-10-26 09:00', lastOnline: '10-27 18:02:11', lat: '34.212', lng: '12.505', mapX: 130, mapY: 170, logs: [{ time: '10-26', actor: '王工', desc: '大桥段巡检完毕' }] },
])

const onlineCount = computed(() => manholeList.value.filter(m => m.status === 'online').length)
const onlineRate = computed(() => Math.round(onlineCount.value / manholeList.value.length * 100))
const antiTamperWarningFilled = computed(() => manholeList.value.filter(m => m.alert && m.alertType?.includes('防撬')).length)
const waterWarningFilled = computed(() => manholeList.value.filter(m => m.alert && m.alertType?.includes('积水')).length)

const openDetail = (m) => { focusManhole.value = m; detailVisible.value = true }
const markHandled = () => {
  if (focusManhole.value) {
    focusManhole.value.alert = false
    focusManhole.value.alertType = ''
    ElMessage.success('告警已标记为处理完成')
  }
}
const dispatchTicket = (m) => {
  ElMessage.success(`已为 ${m.id} 派发告警工单`)
  detailVisible.value = false
}
</script>

<style scoped lang="scss">
.zg-manhole { padding: 20px; display: flex; flex-direction: column; gap: 16px; }

// 头部
.zg-manhole__head { display: flex; justify-content: space-between; align-items: center; }
.zg-manhole__headline { display: flex; align-items: center; gap: 14px; }
.zg-manhole__sigil {
  width: 44px; height: 44px; border-radius: 10px;
  background: linear-gradient(135deg, var(--zg-brand-primary, #6366f1), #06b6d4);
  color: #fff; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
}
.zg-manhole__title { font-size: 20px; font-weight: 600; color: var(--zg-ink-primary, #1e293b); margin: 0 0 4px; }
.zg-manhole__sub { font-size: 13px; color: var(--zg-ink-tertiary, #94a3b8); margin: 0; }

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

// Tabs
.zg-manhole__tabs :deep(.el-tabs__item) { font-size: 14px; }

// ============ 卡片列表 ============
.zg-manhole__grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px; padding: 4px;
}
.zg-manhole__card {
  position: relative; cursor: pointer;
  background: #fff; border: 1px solid var(--zg-line-soft, #f1f5f9); border-radius: 12px;
  padding: 14px; display: flex; flex-direction: column; gap: 10px;
  transition: all 0.2s; overflow: hidden;
}
.zg-manhole__card:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(99,102,241,0.12); border-color: var(--zg-brand-primary, #6366f1); }
.zg-manhole__card--alert {
  border-color: var(--zg-danger, #ef4444);
  background: linear-gradient(180deg, #fff 0%, #fef2f2 100%);
}
.zg-manhole__alert-pulse {
  position: absolute; inset: -1px; border-radius: 12px; border: 2px solid var(--zg-danger, #ef4444);
  pointer-events: none; animation: pulseBorder 1.6s infinite;
}
@keyframes pulseBorder {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.2; }
}

.zg-manhole__card-head { display: flex; justify-content: space-between; align-items: center; }
.zg-manhole__code { font-size: 14px; font-weight: 700; color: var(--zg-ink-primary, #1e293b); font-family: monospace; }
.tag { font-size: 11px; padding: 2px 8px; border-radius: 10px; }
.tag-ok { color: var(--zg-success, #22c55e); background: #dcfce7; }
.tag-off { color: #94a3b8; background: #f1f5f9; }
.tag-danger { color: var(--zg-danger, #ef4444); background: #fee2e2; animation: blink 0.8s infinite; }
@keyframes blink { 0%, 100% { opacity: 1 } 50% { opacity: 0.5 } }

.zg-manhole__loc {
  display: flex; align-items: center; gap: 4px; font-size: 12px; color: #64748b;
  .el-icon { color: var(--zg-brand-primary, #6366f1); }
}

.zg-manhole__sensors { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.sensor { display: flex; flex-direction: column; gap: 4px; padding: 8px 10px; background: #f8fafc; border-radius: 8px; }
.sensor__lbl { font-size: 10px; color: #94a3b8; }
.sensor__val { font-size: 16px; font-weight: 700; color: var(--zg-ink-primary, #1e293b); }
.sensor__val.danger { color: var(--zg-danger, #ef4444); }
.sensor__val.warn { color: var(--zg-warning, #f59e0b); }
.sensor__bar { height: 4px; background: #e2e8f0; border-radius: 2px; overflow: hidden; }
.sensor__fill { height: 100%; background: var(--zg-brand-primary, #6366f1); border-radius: 2px; transition: width 0.4s; }
.sensor__fill.danger { background: var(--zg-danger, #ef4444); }
.sensor__fill.warn { background: var(--zg-warning, #f59e0b); }

.zg-manhole__foot {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 11px; color: #94a3b8; padding-top: 8px; border-top: 1px dashed var(--zg-line-soft, #f1f5f9);
}

// ============ 地图视图 ============
.zg-manhole__map-wrap { position: relative; border-radius: 12px; overflow: hidden; border: 1px solid var(--zg-line-soft, #f1f5f9); }
.zg-manhole__map { width: 100%; height: 400px; display: block; cursor: pointer; }
.mh-node-group { cursor: pointer; }
.mh-label { font-size: 10px; font-family: monospace; fill: var(--zg-ink-primary, #1e293b); pointer-events: none; }
.mh-dot { transition: all 0.2s; }
.mh-dot--ok { fill: var(--zg-success, #22c55e); stroke: #fff; stroke-width: 2; }
.mh-dot--alert { fill: var(--zg-danger, #ef4444); stroke: #fff; stroke-width: 2; }
.mh-dot--off { fill: #94a3b8; stroke: #fff; stroke-width: 2; }
.mh-ripple { opacity: 0.4; animation: mhRipple 1.8s infinite; }
.mh-ripple--ok { fill: var(--zg-success, #22c55e); }
.mh-ripple--alert { fill: var(--zg-danger, #ef4444); }
.mh-ripple--off { fill: #cbd5e1; }
@keyframes mhRipple { 0% { r: 6; opacity: 0.6 } 100% { r: 22; opacity: 0 } }

.geo { position: absolute; background: rgba(255,255,255,0.9); padding: 3px 10px; border-radius: 10px; font-size: 11px; color: var(--zg-ink-primary, #1e293b); font-weight: 500; border: 1px solid var(--zg-line-soft, #f1f5f9); }
.geo-left { top: 14px; left: 14px; }
.geo-center { top: 14px; left: 50%; transform: translateX(-50%); }
.geo-right { top: 14px; right: 14px; }
.geo-lake { bottom: 18px; left: 14px; }

.zg-manhole__legend {
  position: absolute; bottom: 14px; right: 14px;
  display: flex; gap: 12px; padding: 6px 12px;
  background: rgba(255,255,255,0.95); border-radius: 10px; border: 1px solid var(--zg-line-soft, #f1f5f9);
  font-size: 11px; color: #64748b;
  span { display: flex; align-items: center; gap: 4px; }
}
.ld { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
.ld-ok { background: var(--zg-success, #22c55e); }
.ld-alert { background: var(--zg-danger, #ef4444); animation: blink 0.8s infinite; }
.ld-off { background: #94a3b8; }

// ============ 详情 Drawer ============
.zg-manhole__detail { display: flex; flex-direction: column; gap: 18px; }
.zg-manhole__dloc { display: flex; align-items: center; gap: 6px; padding: 10px 12px; background: #eef2ff; border-radius: 8px; font-size: 13px; color: var(--zg-ink-primary, #1e293b); }

.zg-manhole__dsec h4 { margin: 0 0 10px; font-size: 13px; font-weight: 600; color: var(--zg-ink-primary, #1e293b); padding-left: 8px; border-left: 3px solid var(--zg-brand-primary, #6366f1); }
.zg-manhole__dsec h4.danger { border-left-color: var(--zg-danger, #ef4444); color: var(--zg-danger, #ef4444); }
.zg-manhole__dgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.zg-manhole__dcell {
  background: #f8fafc; border-radius: 8px; padding: 10px 12px; display: flex; flex-direction: column; gap: 2px;
}
.zg-manhole__dcell--full { grid-column: 1 / -1; }
.zg-manhole__dcell .lbl { font-size: 11px; color: #94a3b8; }
.zg-manhole__dcell .val { font-size: 14px; font-weight: 600; color: var(--zg-ink-primary, #1e293b); }
.zg-manhole__dcell .val.danger { color: var(--zg-danger, #ef4444); }

.zg-manhole__dalert { background: #fee2e2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px; color: var(--zg-danger, #ef4444); font-size: 13px; }
.zg-manhole__dactions { display: flex; gap: 8px; margin-top: 10px; }

.zg-manhole__dlog { display: flex; flex-direction: column; gap: 6px; }
.dlog-row { display: flex; gap: 10px; font-size: 12px; padding: 6px 0; border-bottom: 1px dashed var(--zg-line-soft, #f1f5f9); }
.dlog-row:last-child { border-bottom: none; }
.dlog-time { font-family: monospace; color: #94a3b8; min-width: 48px; }
.dlog-act { color: var(--zg-brand-primary, #6366f1); min-width: 40px; }
.dlog-desc { color: var(--zg-ink-primary, #1e293b); flex: 1; }</style>
