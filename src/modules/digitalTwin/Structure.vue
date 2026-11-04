<!--
  智光云枢 · 数字孪生 · 灯杆构件级 3D 拆解
  业务域：digitalTwin
  功能：纯 CSS 3D transforms 拆解单根智慧灯杆的 10 个构件，点击联动遥测详情
  @version 1.0.0
-->
<template>
  <section class="zg-twin-structure">
    <!-- 顶部 -->
    <header class="zg-ts__top">
      <div class="zg-ts__brand">
        <div class="zg-ts__logo">
          <el-icon :size="20"><MagicStick /></el-icon>
        </div>
        <div class="zg-ts__copy">
          <h1 class="zg-ts__title">数字孪生 · 灯杆构件级 3D 拆解</h1>
          <p class="zg-ts__subtitle">
            先导路 #23 · YD-LG-023 · 岳麓区先导路与金星大道交叉口
          </p>
        </div>
      </div>

      <div class="zg-ts__top-ctrl">
        <div class="zg-ts__pole-meta">
          <span class="zg-ts__meta-item">
            <span class="zg-ts__meta-dot" style="background:#10b981"></span>
            在线
          </span>
          <span class="zg-ts__meta-item">杆高 12m</span>
          <span class="zg-ts__meta-item">构件 {{ currentModel.components.length }} 个</span>
        </div>
        <el-select v-model="currentModelKey" size="default" class="zg-ts__model-select">
          <el-option
            v-for="m in poleModels"
            :key="m.key"
            :label="m.name + '（' + m.components.length + ' 构件）'"
            :value="m.key"
          />
        </el-select>
        <el-button-group>
          <el-button :icon="Refresh" @click="resetView">重置视角</el-button>
        </el-button-group>
      </div>
    </header>

    <!-- 主体三栏 -->
    <div class="zg-ts__body">
      <!-- 左：构件列表 -->
      <aside class="zg-ts__col zg-ts__col--left">
        <div class="zg-ts__col-head">
          <h2><el-icon :size="16"><Grid /></el-icon> 构件清单</h2>
          <span class="zg-ts__col-sub">共 {{ currentModel.components.length }} 项</span>
        </div>
        <div class="zg-ts__comp-list">
          <div
            v-for="c in currentModel.components"
            :key="c.id"
            class="zg-ts__comp-card"
            :class="{
              'is-active': selectedId === c.id,
              'is-offline': c.status === 'offline',
              'is-alert': c.status === 'alert'
            }"
            @click="selectComponent(c.id)"
          >
            <div class="zg-ts__comp-icon" :style="{ background: c.iconBg }">
              <el-icon :size="16"><component :is="c.icon" /></el-icon>
            </div>
            <div class="zg-ts__comp-body">
              <div class="zg-ts__comp-row">
                <span class="zg-ts__comp-name">{{ c.name }}</span>
                <span class="zg-ts__comp-status" :class="'s-' + c.status">
                  {{ statusLabel(c.status) }}
                </span>
              </div>
              <div class="zg-ts__comp-sub">
                <span>{{ c.model }}</span>
                <span :class="'zg-ts__health h-' + healthLevel(c.health)">
                  健康 {{ c.health }}%
                </span>
              </div>
              <!-- 健康度圆环 -->
              <div class="zg-ts__health-ring" :style="healthRingStyle(c.health)">
                <svg viewBox="0 0 36 36">
                  <path class="zg-ts__ring-bg" d="M18 2.5 a15.5 15.5 0 1 1 0.001 0 Z" />
                  <path
                    class="zg-ts__ring-fg"
                    :class="'c-' + healthLevel(c.health)"
                    :stroke-dasharray="c.health + ' 100'"
                    d="M18 2.5 a15.5 15.5 0 1 1 0.001 0 Z"
                  />
                </svg>
              </div>
              <!-- 外挂展开开关 -->
              <div v-if="c.external" class="zg-ts__comp-toggle" @click.stop="toggleExternal(c.id)">
                <el-icon :size="14"><Expand /></el-icon>
                <span>{{ externalExpanded[c.id] ? '已展开' : '已收起' }}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- 中：3D 场景 -->
      <div class="zg-ts__col zg-ts__col--center">
        <div class="zg-ts__scene-wrap">
          <div class="zg-ts__scene" :style="sceneStyle">
            <!-- 地面 -->
            <div class="zg-ts__ground"></div>

            <!-- 3D 舞台 -->
            <div class="zg-ts__stage" :style="stageStyle">
              <!-- 杆身主体 -->
              <div
                v-if="showComponent('pole')"
                class="zg-ts__pole"
                :class="{ 'is-section': sectionMode }"
                @click="toggleSection"
              >
                <!-- 隐藏的电池舱虚线轮廓（剖切模式或默认显示轮廓） -->
                <div class="zg-ts__battery-outline"></div>
                <div v-if="sectionMode" class="zg-ts__battery-inner">
                  <div class="zg-ts__battery-cell" v-for="n in 4" :key="n"></div>
                  <div class="zg-ts__wire"></div>
                  <div class="zg-ts__wire wire--2"></div>
                </div>
                <div class="zg-ts__pole-cap"></div>
                <div class="zg-ts__pole-base"></div>
              </div>

              <!-- 1. 杆顶光伏板 -->
              <div
                v-if="showComponent('solar')"
                class="zg-ts__cmp zg-ts__cmp--solar"
                :class="{ 'is-highlight': selectedId === 'solar', 'is-external': false }"
                @click="selectComponent('solar')"
              >
                <div class="zg-ts__solar-panel">
                  <div class="zg-ts__solar-grid">
                    <span v-for="n in 18" :key="n"></span>
                  </div>
                  <div class="zg-ts__solar-kpi">
                    <el-icon :size="12"><Sunny /></el-icon>
                    <span>{{ solarKpi }}</span>
                    <span class="zg-ts__unit">kWh</span>
                  </div>
                </div>
              </div>

              <!-- 2. 灯头舱 -->
              <div
                v-if="showComponent('lamp')"
                class="zg-ts__cmp zg-ts__cmp--lamp"
                :class="{ 'is-highlight': selectedId === 'lamp' }"
                @click="selectComponent('lamp')"
              >
                <div class="zg-ts__lamp-body"></div>
                <div class="zg-ts__lamp-led"></div>
              </div>

              <!-- 3. AI 摄像头 -->
              <div
                v-if="showComponent('camera')"
                class="zg-ts__cmp zg-ts__cmp--camera"
                :class="{
                  'is-highlight': selectedId === 'camera',
                  'is-external': true,
                  'is-expanded': externalExpanded['camera']
                }"
                @click="selectComponent('camera')"
              >
                <div class="zg-ts__cam-body"></div>
                <div class="zg-ts__cam-lens"></div>
                <div class="zg-ts__cam-fov"></div>
                <div class="zg-ts__cam-beam"></div>
              </div>

              <!-- 4. 5G 微基站盒 -->
              <div
                v-if="showComponent('5g')"
                class="zg-ts__cmp zg-ts__cmp--5g"
                :class="{ 'is-highlight': selectedId === '5g' }"
                @click="selectComponent('5g')"
              >
                <div class="zg-ts__box-body"></div>
                <div class="zg-ts__antenna a1"></div>
                <div class="zg-ts__antenna a2"></div>
                <div class="zg-ts__antenna a3"></div>
                <div class="zg-ts__antenna a4"></div>
              </div>

              <!-- 5. LED 广告屏 -->
              <div
                v-if="showComponent('screen')"
                class="zg-ts__cmp zg-ts__cmp--screen"
                :class="{
                  'is-highlight': selectedId === 'screen',
                  'is-external': true,
                  'is-expanded': externalExpanded['screen']
                }"
                @click="selectComponent('screen')"
              >
                <div class="zg-ts__screen-frame">
                  <div class="zg-ts__screen-content">
                    <span class="zg-ts__scr-t1">智慧先导</span>
                    <span class="zg-ts__scr-t2">AI CITY 2026</span>
                  </div>
                </div>
              </div>

              <!-- 6. 充电桩挂盒 -->
              <div
                v-if="showComponent('charger')"
                class="zg-ts__cmp zg-ts__cmp--charger"
                :class="{
                  'is-highlight': selectedId === 'charger',
                  'is-external': true,
                  'is-expanded': externalExpanded['charger']
                }"
                @click="selectComponent('charger')"
              >
                <div class="zg-ts__charger-box">
                  <div class="zg-ts__charger-bolt">⚡</div>
                  <div class="zg-ts__charger-no">02</div>
                </div>
              </div>

              <!-- 7. 应急对讲 SOS -->
              <div
                v-if="showComponent('sos')"
                class="zg-ts__cmp zg-ts__cmp--sos"
                :class="{ 'is-highlight': selectedId === 'sos' }"
                @click="selectComponent('sos')"
              >
                <div class="zg-ts__sos-box">
                  <div class="zg-ts__sos-btn"></div>
                </div>
              </div>

              <!-- 8. 控制器舱 -->
              <div
                v-if="showComponent('controller')"
                class="zg-ts__cmp zg-ts__cmp--controller"
                :class="{ 'is-highlight': selectedId === 'controller' }"
                @click="selectComponent('controller')"
              >
                <div class="zg-ts__ctrl-box">
                  <div class="zg-ts__ctrl-leds">
                    <span></span><span></span><span></span>
                  </div>
                  <span class="zg-ts__ctrl-label">PLC · Edge</span>
                </div>
              </div>

              <!-- 9. 电池舱（内部，点击杆身剖切可见） -->
              <!-- 电池舱的 3D 元素通过杆身剖切模式显示，这里不单独渲染 -->

              <!-- 10. 杆身已渲染 -->
            </div>
          </div>
        </div>

        <!-- 视角控制 -->
        <div class="zg-ts__view-ctrl">
          <div class="zg-ts__slider-row">
            <span class="zg-ts__slider-label"><el-icon :size="14"><View /></el-icon> 旋转 Y</span>
            <el-slider v-model="viewY" :min="0" :max="360" :step="1" class="zg-ts__slider" />
            <span class="zg-ts__val">{{ viewY }}°</span>
          </div>
          <div class="zg-ts__slider-row">
            <span class="zg-ts__slider-label"><el-icon :size="14"><Monitor /></el-icon> 俯仰 X</span>
            <el-slider v-model="viewX" :min="30" :max="75" :step="1" class="zg-ts__slider" />
            <span class="zg-ts__val">{{ viewX }}°</span>
          </div>
          <div class="zg-ts__slider-row">
            <span class="zg-ts__slider-label"><el-icon :size="14"><ZoomIn /></el-icon> 缩放</span>
            <el-slider v-model="viewScale" :min="0.5" :max="2" :step="0.05" class="zg-ts__slider" />
            <span class="zg-ts__val">{{ viewScale.toFixed(2) }}x</span>
          </div>
          <div class="zg-ts__btns">
            <el-button size="small" :icon="ZoomOut" @click="viewScale = Math.max(0.5, viewScale - 0.1)">−</el-button>
            <el-button size="small" :icon="ZoomIn" @click="viewScale = Math.min(2, viewScale + 0.1)">+</el-button>
            <el-button size="small" :icon="Setting" @click="sectionMode = !sectionMode">
              {{ sectionMode ? '关闭剖切' : '剖切模式' }}
            </el-button>
          </div>
        </div>

        <!-- 图例 -->
        <div class="zg-ts__legend">
          <div class="zg-ts__legend-item"><span class="dot" style="background:#10b981"></span>在线</div>
          <div class="zg-ts__legend-item"><span class="dot" style="background:#f59e0b"></span>维护</div>
          <div class="zg-ts__legend-item"><span class="dot" style="background:#f43f5e"></span>告警</div>
          <div class="zg-ts__legend-item"><span class="dot" style="background:#94a3b8"></span>离线</div>
        </div>
      </div>

      <!-- 右：遥测详情 -->
      <aside class="zg-ts__col zg-ts__col--right">
        <div class="zg-ts__col-head">
          <h2><el-icon :size="16"><Connection /></el-icon> 遥测详情</h2>
          <span class="zg-ts__col-sub">{{ selectedComp ? selectedComp.id.toUpperCase() : '请选择构件' }}</span>
        </div>

        <template v-if="selectedComp">
          <!-- 构件头部 -->
          <div class="zg-ts__detail-header" :style="{ borderColor: selectedComp.iconBg }">
            <div class="zg-ts__detail-icon" :style="{ background: selectedComp.iconBg }">
              <el-icon :size="22"><component :is="selectedComp.icon" /></el-icon>
            </div>
            <div class="zg-ts__detail-title">
              <h3>{{ selectedComp.name }}</h3>
              <p>{{ selectedComp.model }} · SN {{ selectedComp.sn }}</p>
            </div>
            <el-tag :type="tagType(selectedComp.status)" effect="light" round>
              {{ statusLabel(selectedComp.status) }}
            </el-tag>
          </div>

          <!-- 实时遥测卡片 -->
          <div class="zg-ts__kpi-grid">
            <div v-for="k in telemetryData.kpis" :key="k.label" class="zg-ts__kpi-card">
              <span class="zg-ts__kpi-label">{{ k.label }}</span>
              <div class="zg-ts__kpi-val">
                <span class="zg-ts__num" :style="{ color: k.color }">{{ k.value }}</span>
                <span class="zg-ts__unit">{{ k.unit }}</span>
              </div>
              <span class="zg-ts__kpi-sub">更新 {{ telemetryData.updateAt }}</span>
            </div>
          </div>

          <!-- 24h 迷你趋势图 -->
          <div class="zg-ts__panel">
            <div class="zg-ts__panel-head">
              <h4>24 小时趋势</h4>
              <span class="zg-ts__panel-sub">{{ telemetryData.trendLabel }}</span>
            </div>
            <div class="zg-ts__trend-bars">
              <div
                v-for="(h, i) in telemetryData.trend"
                :key="i"
                class="zg-ts__trend-bar"
                :style="{ height: h + '%' }"
              ></div>
            </div>
            <div class="zg-ts__trend-axis">
              <span>00</span><span>06</span><span>12</span><span>18</span><span>24</span>
            </div>
          </div>

          <!-- 告警历史 -->
          <div class="zg-ts__panel">
            <div class="zg-ts__panel-head">
              <h4>告警历史</h4>
              <el-tag size="small" type="danger" effect="plain">{{ telemetryData.alerts.length }}</el-tag>
            </div>
            <el-timeline class="zg-ts__timeline">
              <el-timeline-item
                v-for="(a, i) in telemetryData.alerts"
                :key="i"
                :timestamp="a.time"
                :type="a.level"
                :hollow="i > 0"
              >
                <div class="zg-ts__alert-row">
                  <span class="zg-ts__alert-title">{{ a.title }}</span>
                  <span class="zg-ts__alert-sol" v-if="a.solved">已解决</span>
                  <span class="zg-ts__alert-sol unsolved" v-else>未处理</span>
                </div>
                <p class="zg-ts__alert-desc">{{ a.desc }}</p>
              </el-timeline-item>
            </el-timeline>
          </div>

          <!-- 运维记录 -->
          <div class="zg-ts__panel">
            <div class="zg-ts__panel-head">
              <h4>最近运维</h4>
            </div>
            <div class="zg-ts__ops-list">
              <div v-for="(o, i) in telemetryData.ops" :key="i" class="zg-ts__ops-item">
                <span class="zg-ts__ops-avatar">{{ o.user.slice(0, 1) }}</span>
                <div class="zg-ts__ops-body">
                  <p class="zg-ts__ops-title">{{ o.action }}</p>
                  <span>{{ o.user }} · {{ o.time }}</span>
                </div>
              </div>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="zg-ts__empty">
            <el-icon :size="40" color="#cbd5e1"><Grid /></el-icon>
            <p>请点击左侧构件或中央 3D 场景中的构件查看详情</p>
          </div>
        </template>
      </aside>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import {
  Monitor, Connection, Camera, Grid, MagicStick, Setting, Refresh, View,
  Expand, ZoomIn, ZoomOut, Sunny, Service, Cpu, Compass
} from '@element-plus/icons-vue'

/* ---------- 灯杆型号数据 ---------- */
const poleModels = [
  {
    key: 'A',
    name: '智慧杆A',
    components: [
      { id: 'solar', name: '杆顶光伏板', icon: Sunny, iconBg: '#1e40af', status: 'online', health: 92, model: 'SOLAR-350W-MK2', sn: 'SN-S-023', external: false },
      { id: 'lamp', name: '灯头舱', icon: Monitor, iconBg: '#111827', status: 'online', health: 98, model: 'LED-200W-Warm', sn: 'SN-L-023', external: false },
      { id: 'camera', name: 'AI 摄像头', icon: Camera, iconBg: '#0f172a', status: 'online', health: 95, model: 'IPC-8MP-AI-Pro', sn: 'SN-C-023', external: true },
      { id: '5g', name: '5G 微基站盒', icon: Connection, iconBg: '#334155', status: 'online', health: 88, model: 'Femto-5G-V2', sn: 'SN-G-023', external: false },
      { id: 'screen', name: 'LED 广告屏', icon: Grid, iconBg: '#4f46e5', status: 'online', health: 85, model: 'P3-SMD-640x960', sn: 'SN-SC-023', external: true },
      { id: 'charger', name: '充电桩挂盒', icon: Cpu, iconBg: '#059669', status: 'online', health: 90, model: 'AC-7kW-Type2', sn: 'SN-CH-023', external: true },
      { id: 'sos', name: '应急对讲 SOS', icon: Connection, iconBg: '#dc2626', status: 'online', health: 100, model: 'SOS-Intercom-X', sn: 'SN-SOS-023', external: false },
      { id: 'controller', name: '控制器舱', icon: Setting, iconBg: '#1f2937', status: 'online', health: 96, model: 'PLC-Edge-GW', sn: 'SN-CT-023', external: false },
      { id: 'battery', name: '电池舱（内部）', icon: Service, iconBg: '#65a30d', status: 'maintain', health: 78, model: 'LiFePO4-48V-200Ah', sn: 'SN-B-023', external: false }
    ]
  },
  {
    key: 'B',
    name: '综合杆B',
    components: [
      { id: 'lamp', name: '灯头舱', icon: Monitor, iconBg: '#111827', status: 'online', health: 99, model: 'LED-180W-Warm', sn: 'SN-L-B023', external: false },
      { id: 'camera', name: 'AI 摄像头', icon: Camera, iconBg: '#0f172a', status: 'online', health: 91, model: 'IPC-5MP-Lite', sn: 'SN-C-B023', external: true },
      { id: '5g', name: '5G 微基站盒', icon: Connection, iconBg: '#334155', status: 'alert', health: 62, model: 'Femto-5G-Lite', sn: 'SN-G-B023', external: false },
      { id: 'sos', name: '应急对讲 SOS', icon: Connection, iconBg: '#dc2626', status: 'online', health: 100, model: 'SOS-Intercom-X', sn: 'SN-SOS-B023', external: false },
      { id: 'controller', name: '控制器舱', icon: Setting, iconBg: '#1f2937', status: 'online', health: 94, model: 'PLC-Lite-GW', sn: 'SN-CT-B023', external: false },
      { id: 'battery', name: '电池舱（内部）', icon: Service, iconBg: '#65a30d', status: 'offline', health: 0, model: 'LiFePO4-48V-100Ah', sn: 'SN-B-B023', external: false }
    ]
  },
  {
    key: 'C',
    name: '管廊杆C',
    components: [
      { id: 'lamp', name: '灯头舱', icon: Monitor, iconBg: '#111827', status: 'online', health: 97, model: 'LED-150W-Cold', sn: 'SN-L-C023', external: false },
      { id: 'camera', name: 'AI 摄像头', icon: Camera, iconBg: '#0f172a', status: 'online', health: 89, model: 'IPC-4MP-Underground', sn: 'SN-C-C023', external: true },
      { id: 'controller', name: '控制器舱', icon: Setting, iconBg: '#1f2937', status: 'online', health: 93, model: 'PLC-Underground-v3', sn: 'SN-CT-C023', external: false },
      { id: 'battery', name: '电池舱（内部）', icon: Service, iconBg: '#65a30d', status: 'online', health: 82, model: 'LiFePO4-48V-150Ah', sn: 'SN-B-C023', external: false }
    ]
  }
]

const currentModelKey = ref('A')
const currentModel = computed(() => poleModels.find(m => m.key === currentModelKey.value))

/* ---------- 3D 视角 ---------- */
const viewY = ref(30)
const viewX = ref(55)
const viewScale = ref(1)
const sectionMode = ref(false)

const resetView = () => {
  viewY.value = 30
  viewX.value = 55
  viewScale.value = 1
  sectionMode.value = false
}

const sceneStyle = computed(() => ({
  perspective: '1400px',
  perspectiveOrigin: '50% 40%'
}))
const stageStyle = computed(() => ({
  transform: `rotateX(${viewX.value}deg) rotateY(${viewY.value}deg) scale(${viewScale.value})`,
  transformStyle: 'preserve-3d'
}))

/* ---------- 选中 / 展开 ---------- */
const selectedId = ref('solar')
const externalExpanded = ref({ camera: false, screen: true, charger: false })

const selectComponent = (id) => {
  selectedId.value = id
}
const toggleExternal = (id) => {
  externalExpanded.value[id] = !externalExpanded.value[id]
}
const toggleSection = () => {
  sectionMode.value = !sectionMode.value
}
const showComponent = (id) => {
  if (id === 'pole') return true
  return currentModel.value.components.some(c => c.id === id)
}

const selectedComp = computed(() =>
  currentModel.value.components.find(c => c.id === selectedId.value)
)

/* ---------- 辅助函数 ---------- */
const statusLabel = (s) => ({ online: '在线', offline: '离线', alert: '告警', maintain: '维护' }[s] || '-')
const tagType = (s) => ({ online: 'success', offline: 'info', alert: 'danger', maintain: 'warning' }[s] || 'info')
const healthLevel = (v) => v >= 85 ? 'good' : v >= 65 ? 'warn' : 'bad'
const healthRingStyle = (v) => ({
  background: 'transparent'
})

/* ---------- 实时遥测数据（按构件 id 映射） ---------- */
const solarKpi = ref('0.12')

// 基础遥测模板
const telemetryTemplates = {
  solar: {
    kpis: [
      { label: '今日发电量', value: '0.12', unit: 'kWh', color: '#1e40af' },
      { label: '累计发电', value: '584.2', unit: 'kWh', color: '#10b981' },
      { label: '实时功率', value: '186', unit: 'W', color: '#f59e0b' },
      { label: '板面温度', value: '41', unit: '°C', color: '#ef4444' }
    ],
    trendLabel: '今日发电功率 (W)',
    trend: [12,10,8,7,6,5,8,22,55,78,92,96,94,88,82,70,55,35,22,14,10,8,7,6],
    updateAt: '刚刚',
    alerts: [
      { time: '2026-10-26 14:22', level: 'warning', title: '发电效率下降 8%', desc: '疑似板面积灰，建议清洗', solved: true },
      { time: '2026-10-22 09:15', level: 'info', title: 'MPPT 模块重启', desc: '自动恢复，未影响发电', solved: true }
    ],
    ops: [
      { user: '张工', action: '远程巡检发电数据', time: '今日 09:32' },
      { user: '李运维', action: '清理板面灰尘', time: '3 天前' }
    ]
  },
  lamp: {
    kpis: [
      { label: '亮度', value: '85', unit: '%', color: '#f59e0b' },
      { label: '电流', value: '1.2', unit: 'A', color: '#10b981' },
      { label: '温度', value: '42', unit: '°C', color: '#ef4444' },
      { label: '电压', value: '220', unit: 'V', color: '#6366f1' }
    ],
    trendLabel: '24h 亮度曲线 (%)',
    trend: [0,0,0,0,0,0,15,45,70,80,85,85,82,80,78,75,70,55,30,10,5,0,0,0],
    updateAt: '3 秒前',
    alerts: [
      { time: '2026-10-25 03:12', level: 'danger', title: 'LED 亮度骤降', desc: '驱动模块过温保护触发，已自动恢复', solved: true }
    ],
    ops: [
      { user: '王工', action: '远程调光至 85%', time: '今日 18:00' }
    ]
  },
  camera: {
    kpis: [
      { label: 'RTSP 帧率', value: '25', unit: 'fps', color: '#10b981' },
      { label: '分辨率', value: '1920×1080', unit: '', color: '#0f172a' },
      { label: '上行带宽', value: '4.2', unit: 'Mbps', color: '#6366f1' },
      { label: '在线时长', value: '99.92', unit: '%', color: '#10b981' }
    ],
    trendLabel: '实时上行带宽 (Mbps)',
    trend: [2,2,3,2,2,3,4,5,5,4,3,4,5,5,4,5,5,4,3,2,2,3,2,2],
    updateAt: '1 秒前',
    alerts: [
      { time: '2026-10-24 22:48', level: 'warning', title: '夜间帧率波动', desc: '红外补光灯老化，建议更换', solved: false },
      { time: '2026-10-18 11:02', level: 'info', title: '镜头清洗', desc: '自动清洁完成', solved: true }
    ],
    ops: [
      { user: 'AI 运维', action: '自动对焦校准', time: '2 小时前' },
      { user: '张工', action: '升级 AI 固件 v2.3', time: '1 周前' }
    ]
  },
  '5g': {
    kpis: [
      { label: '在线用户', value: '127', unit: '', color: '#10b981' },
      { label: '下行速率', value: '86', unit: 'Mbps', color: '#6366f1' },
      { label: 'CPU 负载', value: '38', unit: '%', color: '#f59e0b' },
      { label: '信号强度', value: '-72', unit: 'dBm', color: '#10b981' }
    ],
    trendLabel: '在线用户数 (个)',
    trend: [5,3,2,2,3,8,42,88,120,118,110,125,127,122,118,115,108,95,82,58,35,18,10,6],
    updateAt: '2 秒前',
    alerts: [
      { time: '2026-10-26 20:15', level: 'danger', title: '射频模块温度过高', desc: '62°C 触发降频保护', solved: false }
    ],
    ops: [
      { user: '李运维', action: '更换散热风扇', time: '3 小时前' }
    ]
  },
  screen: {
    kpis: [
      { label: '当前播放', value: '智慧先导', unit: '', color: '#4f46e5' },
      { label: '屏幕温度', value: '36', unit: '°C', color: '#ef4444' },
      { label: '亮度', value: '75', unit: '%', color: '#f59e0b' },
      { label: '运行时长', value: '1248', unit: 'h', color: '#0f172a' }
    ],
    trendLabel: '日均播放时长 (h)',
    trend: [0,0,0,0,0,0,12,16,18,18,18,18,18,18,18,18,18,16,8,0,0,0,0,0],
    updateAt: '5 秒前',
    alerts: [],
    ops: [
      { user: '市场部', action: '更新广告素材包', time: '今日 10:20' }
    ]
  },
  charger: {
    kpis: [
      { label: '当前功率', value: '0', unit: 'kW', color: '#059669' },
      { label: '今日充电', value: '42.6', unit: 'kWh', color: '#059669' },
      { label: '电压', value: '238', unit: 'V', color: '#6366f1' },
      { label: '枪头温度', value: '32', unit: '°C', color: '#ef4444' }
    ],
    trendLabel: '今日充电量 (kWh)',
    trend: [0,0,0,0,0,2,8,12,15,14,10,8,6,5,4,3,3,2,2,0,0,0,0,0],
    updateAt: '空闲中',
    alerts: [],
    ops: [
      { user: '自动巡检', action: '枪头自检通过', time: '今日 06:00' }
    ]
  },
  sos: {
    kpis: [
      { label: '在线状态', value: '正常', unit: '', color: '#10b981' },
      { label: '今日呼叫', value: '0', unit: '次', color: '#0f172a' },
      { label: '电池电压', value: '4.12', unit: 'V', color: '#10b981' },
      { label: '信号强度', value: '-68', unit: 'dBm', color: '#10b981' }
    ],
    trendLabel: '近 7 日呼叫次数',
    trend: [0,1,0,0,2,0,0],
    updateAt: '刚刚',
    alerts: [],
    ops: [
      { user: '周应急', action: '应急对讲测试通过', time: '2 天前' }
    ]
  },
  controller: {
    kpis: [
      { label: '主控 CPU', value: '24', unit: '%', color: '#10b981' },
      { label: '内存', value: '512', unit: 'MB', color: '#10b981' },
      { label: '在线设备', value: '7', unit: '台', color: '#10b981' },
      { label: '固件版本', value: 'v3.2.1', unit: '', color: '#6366f1' }
    ],
    trendLabel: 'CPU 负载 (%)',
    trend: [18,19,20,18,17,22,30,32,28,26,24,24,25,24,23,24,25,26,24,22,20,19,18,18],
    updateAt: '1 秒前',
    alerts: [],
    ops: [
      { user: 'AI 运维', action: '自动固件升级', time: '1 周前' }
    ]
  },
  battery: {
    kpis: [
      { label: 'SOC', value: '78', unit: '%', color: '#10b981' },
      { label: '电压', value: '48.6', unit: 'V', color: '#10b981' },
      { label: '充放电', value: '2.1', unit: 'A', color: '#f59e0b' },
      { label: '温度', value: '31', unit: '°C', color: '#ef4444' }
    ],
    trendLabel: '近 24h SOC (%)',
    trend: [78,78,78,77,77,77,76,75,74,73,72,72,73,74,75,76,77,77,78,78,78,78,78,78],
    updateAt: '2 秒前',
    alerts: [
      { time: '2026-10-20 08:00', level: 'warning', title: '压差接近阈值', desc: '单体压差 28mV，建议均衡', solved: false }
    ],
    ops: [
      { user: '李运维', action: '主动均衡激活', time: '2 天前' }
    ]
  }
}

const defaultTelemetry = {
  kpis: [{ label: '待机', value: '-', unit: '', color: '#64748b' }],
  trendLabel: '暂无数据',
  trend: [],
  updateAt: '-',
  alerts: [],
  ops: []
}

const telemetryData = computed(() => {
  if (!selectedComp.value) return defaultTelemetry
  return telemetryTemplates[selectedComp.value.id] || defaultTelemetry
})

/* ---------- 数字跳动（光伏） ---------- */
let timer = null
onMounted(() => {
  timer = setInterval(() => {
    solarKpi.value = (parseFloat(solarKpi.value) + 0.01).toFixed(2)
    // 更新模板中发电量 kpi
    if (telemetryTemplates.solar && telemetryTemplates.solar.kpis[0]) {
      telemetryTemplates.solar.kpis[0].value = solarKpi.value
    }
  }, 1000)
})
onBeforeUnmount(() => clearInterval(timer))

// 切换型号时重置选中
watch(currentModelKey, () => {
  const first = currentModel.value.components[0]
  if (first) selectedId.value = first.id
})

// 默认选中
if (!selectedId.value) selectedId.value = currentModel.value.components[0].id
</script>

<style lang="scss" scoped>
/* ===================== 根容器 ===================== */
.zg-twin-structure {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif;
  color: #0f172a;
  padding: 16px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-sizing: border-box;
}

/* ===================== 顶部 ===================== */
.zg-ts__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 14px 20px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}
.zg-ts__brand { display: flex; align-items: center; gap: 14px; }
.zg-ts__logo {
  width: 40px; height: 40px; border-radius: 10px;
  background: linear-gradient(135deg, #6366f1, #3b82f6);
  color: #fff; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}
.zg-ts__title { font-size: 17px; font-weight: 600; margin: 0; color: #0f172a; }
.zg-ts__subtitle { font-size: 12px; color: #64748b; margin: 2px 0 0; }
.zg-ts__top-ctrl { display: flex; align-items: center; gap: 14px; }
.zg-ts__pole-meta {
  display: flex; gap: 16px; padding: 6px 14px;
  background: #f1f5f9; border-radius: 999px; font-size: 12px; color: #334155;
}
.zg-ts__meta-item { display: flex; align-items: center; gap: 6px; }
.zg-ts__meta-dot { width: 8px; height: 8px; border-radius: 50%; }
.zg-ts__model-select { width: 200px; }

/* ===================== 主体 ===================== */
.zg-ts__body {
  display: grid;
  grid-template-columns: 300px 1fr 360px;
  gap: 14px;
  flex: 1;
  min-height: 0;
}
.zg-ts__col {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.zg-ts__col-head {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px dashed #e2e8f0;
  h2 { font-size: 14px; font-weight: 600; color: #0f172a; margin: 0; display: flex; align-items: center; gap: 6px; }
}
.zg-ts__col-sub { font-size: 12px; color: #94a3b8; }

/* ===================== 左：构件列表 ===================== */
.zg-ts__comp-list {
  flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 10px;
}
.zg-ts__comp-card {
  position: relative; display: flex; gap: 10px; padding: 10px;
  border: 1px solid #e2e8f0; border-radius: 10px;
  cursor: pointer; transition: all .2s; background: #fff;
  &:hover { border-color: #cbd5e1; background: #f8fafc; }
  &.is-active {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
    background: linear-gradient(135deg, #f5f6ff 0%, #ffffff 100%);
  }
  &.is-offline { opacity: 0.65; }
}
.zg-ts__comp-icon {
  width: 36px; height: 36px; border-radius: 8px;
  color: #fff; display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.zg-ts__comp-body { flex: 1; min-width: 0; padding-right: 36px; position: relative; }
.zg-ts__comp-row { display: flex; align-items: center; justify-content: space-between; gap: 6px; }
.zg-ts__comp-name { font-size: 13px; font-weight: 500; color: #0f172a; }
.zg-ts__comp-status { font-size: 11px; padding: 1px 8px; border-radius: 999px; font-weight: 500;
  &.s-online { background: #dcfce7; color: #16a34a; }
  &.s-offline { background: #f1f5f9; color: #64748b; }
  &.s-alert { background: #ffe4e6; color: #e11d48; }
  &.s-maintain { background: #fef3c7; color: #d97706; }
}
.zg-ts__comp-sub { font-size: 11px; color: #64748b; margin-top: 3px; display: flex; justify-content: space-between; }
.zg-ts__health {
  &.h-good { color: #10b981; }
  &.h-warn { color: #f59e0b; }
  &.h-bad { color: #ef4444; }
}
.zg-ts__health-ring {
  position: absolute; top: 8px; right: 6px; width: 28px; height: 28px;
  svg { width: 100%; height: 100%; transform: rotate(-90deg); }
  .zg-ts__ring-bg { fill: none; stroke: #e2e8f0; stroke-width: 3; }
  .zg-ts__ring-fg {
    fill: none; stroke-width: 3; stroke-linecap: round;
    &.c-good { stroke: #10b981; }
    &.c-warn { stroke: #f59e0b; }
    &.c-bad { stroke: #ef4444; }
  }
}
.zg-ts__comp-toggle {
  position: absolute; bottom: 8px; right: 6px;
  display: flex; align-items: center; gap: 3px; font-size: 11px; color: #6366f1;
  cursor: pointer;
}

/* ===================== 中央 3D 场景 ===================== */
.zg-ts__col--center { padding: 12px; }
.zg-ts__scene-wrap {
  flex: 1; background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 12px; border: 1px solid #e2e8f0;
  position: relative; overflow: hidden;
  min-height: 420px;
}
.zg-ts__scene {
  width: 100%; height: 100%;
  position: relative;
  display: flex; align-items: center; justify-content: center;
}

.zg-ts__stage {
  position: relative;
  width: 160px; height: 620px;
  transform-style: preserve-3d;
  transition: transform .4s ease;
}

/* 地面 */
.zg-ts__ground {
  position: absolute;
  width: 520px; height: 520px;
  left: 50%; top: 80%;
  transform: translate(-50%, -50%) rotateX(90deg);
  background:
    linear-gradient(rgba(148,163,184,0.25) 1px, transparent 1px) 0 0 / 40px 40px,
    linear-gradient(90deg, rgba(148,163,184,0.25) 1px, transparent 1px) 0 0 / 40px 40px,
    radial-gradient(ellipse at center, #e2e8f0 0%, #cbd5e1 100%);
  border-radius: 50%;
  transform: translate(-50%, -50%) rotateX(90deg) translateZ(-20px);
  box-shadow: 0 30px 60px rgba(15, 23, 42, 0.1);
}

/* 杆身主体 */
.zg-ts__pole {
  position: absolute;
  width: 32px; height: 480px;
  left: 50%; bottom: 60px;
  transform: translateX(-50%) translateZ(0);
  background: linear-gradient(90deg, #64748b 0%, #cbd5e1 30%, #e2e8f0 50%, #cbd5e1 70%, #64748b 100%);
  border-radius: 4px;
  box-shadow:
    -6px 0 0 #334155,
    0 0 20px rgba(15, 23, 42, 0.08);
  cursor: pointer;
  transition: opacity .3s, background .3s;

  &.is-section {
    opacity: 0.5;
    background: linear-gradient(90deg, #94a3b8 0%, #e2e8f0 50%, #94a3b8 100%);
  }
}
.zg-ts__pole-cap {
  position: absolute; top: -6px; left: 50%; transform: translateX(-50%);
  width: 36px; height: 8px; background: #475569; border-radius: 2px;
}
.zg-ts__pole-base {
  position: absolute; bottom: -24px; left: 50%; transform: translateX(-50%);
  width: 60px; height: 24px;
  background: linear-gradient(180deg, #475569, #334155);
  border-radius: 4px;
}
.zg-ts__battery-outline {
  position: absolute; top: 260px; left: 50%; transform: translateX(-50%);
  width: 22px; height: 120px;
  border: 2px dashed rgba(250, 204, 21, 0.85);
  border-radius: 4px;
  transition: all .3s;
  pointer-events: none;
  box-sizing: border-box;
}
.zg-ts__battery-inner {
  position: absolute; top: 260px; left: 50%; transform: translateX(-50%);
  width: 22px; height: 120px;
  display: flex; flex-direction: column; justify-content: space-between; padding: 3px;
  opacity: 0; pointer-events: none; transition: opacity .3s;
}
.zg-ts__pole.is-section .zg-ts__battery-inner { opacity: 1; }
.zg-ts__battery-cell {
  flex: 1; background: linear-gradient(180deg, #84cc16, #4d7c0f);
  border-radius: 2px; border: 1px solid rgba(255,255,255,0.3);
}
.zg-ts__wire {
  position: absolute; left: 50%; top: -80px; width: 2px; height: 160px;
  background: #f59e0b; transform: translateX(-50%);
}
.zg-ts__wire--2 { left: 80%; background: #0ea5e9; height: 200px; top: -100px; }

/* ===================== 通用构件 ===================== */
.zg-ts__cmp {
  position: absolute; left: 50%; transform-style: preserve-3d;
  transition: transform .3s, box-shadow .3s, filter .3s;
  cursor: pointer;

  &.is-highlight {
    box-shadow: 0 0 0 2px #6366f1, 0 0 20px rgba(99, 102, 241, 0.5);
    filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.4)) }

  &.is-external.is-expanded { transform: translateX(-50%) translateZ(60px) !important; }
  &.is-external { transform: translateX(-50%) translateZ(0); }
}

/* ===================== 1. 光伏板 ===================== */
.zg-ts__cmp--solar {
  top: 20px; left: 50%; transform: translateX(-50%) rotateX(30deg);
  width: 110px; height: 70px;
}
.zg-ts__solar-panel {
  width: 100%; height: 100%;
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 40%, #3b82f6 100%);
  border-radius: 4px;
  box-shadow:
    0 4px 0 #0c1f5a,
    0 0 25px rgba(59, 130, 246, 0.5);
  position: relative; overflow: hidden;
}
.zg-ts__solar-grid {
  position: absolute; inset: 4px;
  display: grid; grid-template-columns: repeat(6, 1fr); grid-template-rows: repeat(3, 1fr);
  gap: 2px;
  span { background: linear-gradient(135deg, #60a5fa, #1e40af); border-radius: 1px; }
}
.zg-ts__solar-kpi {
  position: absolute; top: -22px; left: 50%; transform: translateX(-50%);
  display: flex; align-items: center; gap: 3px; font-size: 12px; font-weight: 600;
  color: #1e40af; white-space: nowrap;
  background: rgba(255,255,255,0.9); padding: 2px 8px; border-radius: 10px;
  box-shadow: 0 2px 6px rgba(15,23,42,0.1);
}
.zg-ts__solar-kpi .zg-ts__unit { color: #64748b; font-weight: 400; font-size: 10px; }

/* ===================== 2. 灯头 ===================== */
.zg-ts__cmp--lamp {
  top: 100px; left: 50%; transform: translateX(-50%);
  width: 70px; height: 40px;
}
.zg-ts__lamp-body {
  width: 100%; height: 100%;
  background: linear-gradient(180deg, #475569 0%, #334155 100%);
  border-radius: 8px 8px 20px 20px;
  box-shadow: 0 4px 0 #1e293b;
  position: relative;
}
.zg-ts__lamp-led {
  position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%);
  width: 60px; height: 14px; border-radius: 50%;
  background: radial-gradient(ellipse at center, #fef3c7 0%, #fbbf24 40%, #f59e0b 70%, transparent 90%);
  animation: lamp-pulse 2.5s ease-in-out infinite;
  filter: blur(1px);
}
@keyframes lamp-pulse {
  0%, 100% { opacity: 0.9; box-shadow: 0 0 30px rgba(251, 191, 36, 0.6), 0 0 60px rgba(251, 191, 36, 0.3); }
  50%      { opacity: 1;   box-shadow: 0 0 50px rgba(251, 191, 36, 0.9), 0 0 90px rgba(251, 191, 36, 0.5); }
}

/* ===================== 3. 摄像头 ===================== */
.zg-ts__cmp--camera {
  top: 175px; left: 50%; transform: translateX(-50%) translateZ(0);
  width: 34px; height: 30px;
}
.zg-ts__cam-body {
  width: 34px; height: 24px; border-radius: 4px;
  background: linear-gradient(180deg, #334155, #0f172a);
  box-shadow: 0 2px 0 #020617; position: relative;
}
.zg-ts__cam-lens {
  position: absolute; right: -8px; top: 50%; transform: translateY(-50%);
  width: 14px; height: 14px; border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #a5b4fc, #4f46e5 40%, #0f172a 80%);
  box-shadow: 0 0 10px rgba(79, 70, 229, 0.7);
}
.zg-ts__cam-fov {
  position: absolute; right: 6px; top: 50%; transform: translateY(-50%);
  width: 100px; height: 60px;
  background: linear-gradient(90deg, rgba(99, 102, 241, 0.5), rgba(99, 102, 241, 0) 70%);
  clip-path: polygon(0 50%, 100% 0, 100% 100%);
  opacity: 0.5; pointer-events: none;
}
.zg-ts__cam-beam {
  position: absolute; right: 6px; top: 50%; transform: translateY(-50%);
  width: 140px; height: 2px;
  background: linear-gradient(90deg, rgba(239, 68, 68, 0.9), rgba(239, 68, 68, 0));
    box-shadow: 0 0 6px rgba(239, 68, 68, 0.8);
  pointer-events: none;
  animation: beam-flicker 2s infinite;
}
@keyframes beam-flicker {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}

/* ===================== 4. 5G 基站 ===================== */
.zg-ts__cmp--5g {
  top: 230px; left: 50%; transform: translateX(-50%);
  width: 36px; height: 38px;
}
.zg-ts__box-body {
  width: 100%; height: 100%;
  background: linear-gradient(180deg, #475569, #334155);
  border-radius: 4px; box-shadow: 0 3px 0 #1e293b;
  position: relative;
}
.zg-ts__antenna {
  position: absolute; top: -30px; width: 2px; height: 28px;
  background: linear-gradient(180deg, #94a3b8, #475569);
  transform-origin: bottom center;
  &.a1 { left: 8px; transform: rotate(-20deg); }
  &.a2 { left: 15px; transform: rotate(-8deg); }
  &.a3 { left: 20px; transform: rotate(8deg); }
  &.a4 { left: 27px; transform: rotate(20deg); }
}

/* ===================== 5. 广告屏 ===================== */
.zg-ts__cmp--screen {
  top: 290px; left: 50%; transform: translateX(-50%) translateZ(0);
  width: 46px; height: 80px;
}
.zg-ts__screen-frame {
  width: 100%; height: 100%;
  background: #0f172a; border-radius: 4px;
  box-shadow: 0 3px 0 #020617, inset 0 0 0 2px #4f46e5;
  padding: 4px; box-sizing: border-box;
}
.zg-ts__screen-content {
  width: 100%; height: 100%;
  background: linear-gradient(180deg, #1e1b4b, #4338ca);
  border-radius: 2px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  color: #fff; overflow: hidden;
}
.zg-ts__scr-t1 { font-size: 10px; font-weight: 600; letter-spacing: 1px; background: linear-gradient(90deg, #fde68a, #fbbf24); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.zg-ts__scr-t2 { font-size: 6px; margin-top: 4px; color: #c7d2fe; letter-spacing: 0.5px; }

/* ===================== 6. 充电桩 ===================== */
.zg-ts__cmp--charger {
  top: 385px; left: 50%; transform: translateX(-50%) translateZ(0);
  width: 40px; height: 50px;
}
.zg-ts__charger-box {
  width: 100%; height: 100%;
  background: linear-gradient(180deg, #10b981, #059669);
  border-radius: 8px; box-shadow: 0 3px 0 #047857;
  color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center;
  position: relative;
}
.zg-ts__charger-bolt { font-size: 16px; line-height: 1; text-shadow: 0 0 6px rgba(250, 204, 21, 0.7); }
.zg-ts__charger-no { font-size: 10px; margin-top: 3px; opacity: 0.9; }

/* ===================== 7. SOS ===================== */
.zg-ts__cmp--sos {
  top: 450px; left: 50%; transform: translateX(-50%);
  width: 32px; height: 36px;
}
.zg-ts__sos-box {
  width: 100%; height: 100%;
  background: linear-gradient(180deg, #475569, #334155);
  border-radius: 4px; box-shadow: 0 3px 0 #1e293b;
  position: relative;
  display: flex; align-items: center; justify-content: center;
}
.zg-ts__sos-btn {
  width: 16px; height: 16px; border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #fecaca, #ef4444 60%, #b91c1c 100%);
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.7), inset 0 -2px 4px rgba(0,0,0,0.3);
  animation: sos-pulse 2s ease-in-out infinite;
}
@keyframes sos-pulse {
  0%, 100% { box-shadow: 0 0 10px rgba(239, 68, 68, 0.7); }
  50%      { box-shadow: 0 0 20px rgba(239, 68, 68, 1); }
}

/* ===================== 8. 控制器舱 ===================== */
.zg-ts__cmp--controller {
  top: 505px; left: 50%; transform: translateX(-50%);
  width: 40px; height: 36px;
}
.zg-ts__ctrl-box {
  width: 100%; height: 100%;
  background: linear-gradient(180deg, #334155, #1f2937);
  border-radius: 4px; box-shadow: 0 3px 0 #0f172a;
  position: relative;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;
}
.zg-ts__ctrl-leds { display: flex; gap: 3px;
  span { width: 5px; height: 5px; border-radius: 50%; }
  span:nth-child(1) { background: #10b981; box-shadow: 0 0 4px #10b981; }
  span:nth-child(2) { background: #f59e0b; box-shadow: 0 0 4px #f59e0b; }
  span:nth-child(3) { background: #3b82f6; box-shadow: 0 0 4px #3b82f6; }
}
.zg-ts__ctrl-label { font-size: 6px; color: #cbd5e1; letter-spacing: 0.5px; }

/* ===================== 视角控制 ===================== */
.zg-ts__view-ctrl {
  display: grid; grid-template-columns: 1fr 1fr 1fr auto;
  gap: 14px; padding: 12px 14px; margin-top: 12px;
  background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px;
}
.zg-ts__slider-row { display: flex; align-items: center; gap: 10px; }
.zg-ts__slider-label { font-size: 12px; color: #334155; display: flex; align-items: center; gap: 4px; min-width: 70px; }
.zg-ts__slider { flex: 1; }
.zg-ts__val { font-size: 12px; color: #6366f1; font-weight: 600; min-width: 40px; text-align: right; }
.zg-ts__btns { display: flex; gap: 6px; }

/* 图例 */
.zg-ts__legend {
  display: flex; justify-content: center; gap: 24px; margin-top: 10px;
  font-size: 12px; color: #64748b;
}
.zg-ts__legend-item { display: flex; align-items: center; gap: 6px; }
.zg-ts__legend-item .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }

/* ===================== 右：遥测详情 ===================== */
.zg-ts__detail-header {
  display: flex; align-items: center; gap: 12px; padding: 14px;
  background: linear-gradient(135deg, #f8fafc, #ffffff);
  border: 1px solid #e2e8f0; border-left: 3px solid #6366f1; border-radius: 10px;
  margin-bottom: 14px;
}
.zg-ts__detail-icon {
  width: 44px; height: 44px; border-radius: 10px;
  color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.zg-ts__detail-title { flex: 1;
  h3 { font-size: 15px; font-weight: 600; margin: 0 0 3px; color: #0f172a; }
  p  { font-size: 11px; color: #64748b; margin: 0; }
}
.zg-ts__kpi-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px;
}
.zg-ts__kpi-card {
  background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px;
  padding: 10px 12px; position: relative;
}
.zg-ts__kpi-label { font-size: 11px; color: #64748b; display: block; }
.zg-ts__kpi-val { display: flex; align-items: baseline; gap: 4px; margin-top: 2px; }
.zg-ts__kpi-val .zg-ts__num { font-size: 22px; font-weight: 700; font-variant-numeric: tabular-nums; }
.zg-ts__kpi-val .zg-ts__unit { font-size: 11px; color: #94a3b8; }
.zg-ts__kpi-sub { font-size: 10px; color: #94a3b8; margin-top: 3px; display: block; }

.zg-ts__panel {
  background: #fff; border: 1px solid #e2e8f0; border-radius: 10px;
  padding: 12px 14px; margin-bottom: 12px;
}
.zg-ts__panel-head {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;
  h4 { font-size: 13px; font-weight: 600; margin: 0; color: #0f172a; }
}
.zg-ts__panel-sub { font-size: 11px; color: #94a3b8; }

.zg-ts__trend-bars {
  display: flex; align-items: flex-end; gap: 3px; height: 80px;
  padding: 4px 2px 0; background: #f8fafc; border-radius: 6px;
}
.zg-ts__trend-bar {
  flex: 1; min-width: 3px;
  background: linear-gradient(180deg, #6366f1 0%, #a5b4fc 100%);
  border-radius: 2px 2px 0 0;
  transition: height .4s;
}
.zg-ts__trend-axis {
  display: flex; justify-content: space-between; margin-top: 4px;
  font-size: 10px; color: #94a3b8;
}

.zg-ts__timeline { padding-left: 4px; }
.zg-ts__alert-row { display: flex; align-items: center; gap: 8px; }
.zg-ts__alert-title { font-size: 12px; font-weight: 500; color: #0f172a; }
.zg-ts__alert-sol {
  font-size: 10px; padding: 1px 6px; border-radius: 10px;
  background: #dcfce7; color: #16a34a;
  &.unsolved { background: #ffe4e6; color: #e11d48; }
}
.zg-ts__alert-desc { font-size: 11px; color: #64748b; margin: 4px 0 0; }

.zg-ts__ops-list { display: flex; flex-direction: column; gap: 10px; }
.zg-ts__ops-item { display: flex; gap: 10px; }
.zg-ts__ops-avatar {
  width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, #6366f1, #3b82f6); color: #fff;
  display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600;
}
.zg-ts__ops-body {
  p { font-size: 12px; margin: 0 0 2px; color: #0f172a; }
  span { font-size: 11px; color: #94a3b8; }
}

.zg-ts__empty {
  flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
  color: #94a3b8; gap: 10px;
  p { font-size: 12px; margin: 0; }
}

/* 滚动条 */
.zg-ts__comp-list::-webkit-scrollbar { width: 5px; }
.zg-ts__comp-list::-webkit-scrollbar-track { background: transparent; }
.zg-ts__comp-list::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }

/* 响应式（基础） */
@media (max-width: 1280px) {
  .zg-ts__body { grid-template-columns: 260px 1fr 320px; }
}
</style>
