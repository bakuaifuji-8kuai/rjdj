<!--
  智光云枢 · AI 视觉总览（照明版·重写）
  业务域：aiVision
  核心：照明公司真正关心的 8 个 AI 视觉场景
-->
<template>
  <section class="zg-av-overview">
    <header class="zg-av-head">
      <div class="zg-av-head__inner">
        <div class="zg-av-head__sigil"><el-icon :size="22"><Cpu /></el-icon></div>
        <div class="zg-av-head__copy">
          <h1 class="zg-av-head__title">AI 视觉 · 杆顶摄像头智能大脑</h1>
          <p class="zg-av-head__sub">
            接入摄像头 {{ totalCameras }}（先导路 48 · 麓谷 64 · 梅溪湖 72 · 金星大道 86 · 咸嘉湖 54 · 岳麓山 60） ·
            活跃 AI 模型 {{ activeModels }} ·
            今日告警 {{ todayAlerts }} ·
            高置信度 {{ highConfidence }}
          </p>
        </div>
        <div class="zg-av-head__actions">
          <el-tag type="success" effect="light">AI 引擎在线</el-tag>
          <span class="zg-av-head__clock">{{ currentTime }}</span>
        </div>
      </div>
    </header>

    <!-- ============ 5 KPI 卡 ============ -->
    <div class="zg-kpis">
      <div v-for="k in kpis" :key="k.label" class="zg-kpi" :class="k.tone">
        <div class="zg-kpi__icon"><el-icon><component :is="k.icon" /></el-icon></div>
        <div class="zg-kpi__body">
          <div class="zg-kpi__num">{{ k.value }}</div>
          <div class="zg-kpi__lbl">{{ k.label }}</div>
        </div>
        <div v-if="k.delta" class="zg-kpi__delta" :class="{ up: k.delta.startsWith('↑') }">{{ k.delta }}</div>
      </div>
    </div>

    <!-- ============ 中央主区 ============ -->
    <div class="zg-main">
      <!-- 左：4 宫格实时画面 -->
      <div class="zg-grid">
        <div class="zg-grid__head">
          <span class="zg-grid__title">实时检测画面 · 多模型并行</span>
          <el-tag effect="plain" size="small">2×2 宫格</el-tag>
        </div>
        <el-row :gutter="12">
          <el-col :span="12" v-for="(cam, i) in gridCameras" :key="i">
            <div class="zg-cam" :style="cam.bgStyle">
              <!-- 倾斜检测：竖线参考 + 杆身线 + 夹角 -->
              <svg v-if="cam.type === 'tilt'" class="zg-svg-overlay" viewBox="0 0 300 200" preserveAspectRatio="none">
                <line x1="150" y1="40" x2="150" y2="190" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="4,3" />
                <line x1="150" y1="40" x2="182" y2="190" stroke="#ef4444" stroke-width="3" />
                <path d="M150,100 A30,30 0 0 1 172,115" fill="none" stroke="#ef4444" stroke-width="1.5" />
                <text x="162" y="108" fill="#ef4444" font-size="11" font-weight="700">8.2°</text>
                <rect x="120" y="30" width="80" height="160" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="6,3" rx="2" />
              </svg>
              <!-- 灯具故障：一排灯 -->
              <svg v-else-if="cam.type === 'lamp'" class="zg-svg-overlay" viewBox="0 0 300 200" preserveAspectRatio="none">
                <line x1="20" y1="90" x2="280" y2="90" stroke="#64748b" stroke-width="2" />
                <circle v-for="(lx, li) in [50,110,170,230]" :key="li" :cx="lx" cy="90" r="16" :fill="li === 2 ? '#1e293b' : '#fde68a'" stroke="#475569" stroke-width="1.5" />
                <text v-if="cam.highlightX" :x="cam.highlightX" y="94" text-anchor="middle" fill="#fff" font-size="10" font-weight="700">X</text>
                <rect v-if="cam.highlightBox" :x="cam.highlightBox.x" :y="cam.highlightBox.y" :width="cam.highlightBox.w" :height="cam.highlightBox.h" fill="none" stroke="#ef4444" stroke-width="2" rx="2" />
              </svg>
              <!-- 配电箱冒烟 -->
              <svg v-else-if="cam.type === 'smoke'" class="zg-svg-overlay" viewBox="0 0 300 200" preserveAspectRatio="none">
                <rect x="110" y="70" width="80" height="110" fill="#475569" stroke="#1e293b" stroke-width="2" rx="3" />
                <rect x="120" y="80" width="60" height="40" fill="#1e293b" />
                <ellipse cx="150" cy="55" rx="50" ry="18" fill="rgba(251,146,60,0.55)" />
                <ellipse cx="130" cy="42" rx="35" ry="14" fill="rgba(251,146,60,0.45)" />
                <ellipse cx="170" cy="38" rx="30" ry="12" fill="rgba(251,146,60,0.35)" />
                <rect x="105" y="65" width="90" height="120" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="6,3" rx="2" />
              </svg>
              <!-- 隧道烟雾 -->
              <svg v-else-if="cam.type === 'tunnel'" class="zg-svg-overlay" viewBox="0 0 300 200" preserveAspectRatio="none">
                <path d="M30,200 Q150,20 270,200 Z" fill="#334155" />
                <ellipse cx="160" cy="130" rx="80" ry="40" fill="rgba(148,163,184,0.55)" />
                <ellipse cx="140" cy="100" rx="50" ry="25" fill="rgba(148,163,184,0.45)" />
                <rect x="80" y="90" width="140" height="100" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="6,3" rx="2" />
              </svg>

              <!-- AI 标签 -->
              <div class="zg-cam__label" :style="{ background: cam.alertColor }">
                {{ cam.alertText }}
              </div>
              <div class="zg-cam__conf">置信度 {{ cam.conf }}</div>

              <!-- 底部信息条 -->
              <div class="zg-cam__foot">
                <div class="zg-cam__name">
                  <span class="zg-live-dot on"></span>{{ cam.name }}
                </div>
                <div class="zg-cam__loc">{{ cam.loc }}</div>
              </div>
            </div>
          </el-col>
        </el-row>

        <!-- 置信度阈值 -->
        <div class="zg-threshold">
          <span class="zg-threshold__lbl">置信度阈值</span>
          <el-slider v-model="threshold" :min="0.70" :max="0.99" :step="0.01" :show-tooltip="true" style="flex:1;margin:0 16px" />
          <span class="zg-threshold__val">{{ threshold.toFixed(2) }}</span>
        </div>
      </div>

      <!-- 右：AI 模型矩阵 -->
      <div class="zg-models">
        <div class="zg-models__head">
          <span class="zg-grid__title">AI 检测模型矩阵</span>
          <el-tag type="success" effect="plain">8/8 运行中</el-tag>
        </div>
        <div v-for="m in models" :key="m.key" class="zg-model" :class="{ on: m.on }">
          <div class="zg-model__icon" :style="{ background: m.on ? m.color : '#f1f5f9', color: m.on ? '#fff' : '#94a3b8' }">
            <el-icon><component :is="m.icon" /></el-icon>
          </div>
          <div class="zg-model__body">
            <div class="zg-model__name">{{ m.name }}</div>
            <div class="zg-model__sub">今日 <strong>{{ m.count }}</strong> 次 · 置信度 {{ m.avgConf }}%</div>
          </div>
          <el-switch v-model="m.on" active-color="#6366f1" />
        </div>
      </div>
    </div>

    <!-- ============ 底部：告警事件流 + 场景分布 ============ -->
    <div class="zg-bottom">
      <!-- 今日告警分布 -->
      <div class="zg-bar-chart">
        <div class="zg-bar-chart__title">今日告警分布 · 8 类场景</div>
        <div v-for="b in barChart" :key="b.name" class="zg-bar">
          <div class="zg-bar__lbl">{{ b.name }}</div>
          <div class="zg-bar__track"><div class="zg-bar__fill" :style="{ width: b.percent + '%', background: b.color }"></div></div>
          <div class="zg-bar__val">{{ b.count }}</div>
        </div>
        <div class="zg-bar-chart__total">今日合计 <strong>{{ totalBarCount }}</strong> 条告警 · 已自动派单 <strong>12</strong></div>
      </div>

      <!-- 实时告警事件流 -->
      <div class="zg-stream">
        <div class="zg-stream__head">
          <span class="zg-bar-chart__title">实时告警事件流</span>
          <span class="zg-stream__live"><span class="zg-live-dot on"></span>LIVE</span>
        </div>
        <div class="zg-stream__mask">
          <div class="zg-stream__track">
            <div v-for="(evt, ri) in [...eventList, ...eventList]" :key="ri" class="zg-evt" :class="evt.level">
              <span class="zg-evt__time">{{ evt.time }}</span>
              <span class="zg-evt__type" :style="{ background: evt.color }">{{ evt.type }}</span>
              <span class="zg-evt__loc">{{ evt.loc }}</span>
              <span class="zg-evt__extra">{{ evt.extra }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import {
  Cpu, Monitor, Warning, Sunny, Lock, Opportunity, View, DataAnalysis, Timer,
  SuccessFilled, InfoFilled, Bell
} from '@element-plus/icons-vue'

/* ====== KPI ====== */
const totalCameras = 384
const activeModels = 8
const todayAlerts = 47
const highConfidence = '98.2%'
const workOrders = 12

const kpis = [
  { label: '接入摄像头', value: totalCameras, icon: Monitor, tone: 'info', delta: '6 大区全覆盖' },
  { label: '活跃 AI 模型', value: `${activeModels}/8`, icon: Cpu, tone: '', delta: '全部运行中' },
  { label: '今日识别告警', value: todayAlerts, icon: Bell, tone: 'warn', delta: '↑ 较昨日 +12%' },
  { label: '高置信度占比', value: highConfidence, icon: DataAnalysis, tone: 'ok', delta: '↑ +0.4%' },
  { label: '已自动派工单', value: workOrders, icon: Timer, tone: '', delta: '↓ 较昨日 -5' }
]

/* ====== 4 宫格实时画面 ====== */
const gridCameras = [
  {
    name: '先导路 #23 杆', loc: '岳麓区先导路',
    type: 'tilt', conf: '97%',
    alertText: '倾斜 8.2°', alertColor: '#ef4444',
    bgStyle: { background: 'linear-gradient(180deg, #1e293b 0%, #334155 60%, #475569 100%)' }
  },
  {
    name: '麓谷产业园 #17', loc: '麓谷产业园北门',
    type: 'lamp', conf: '94%',
    alertText: '灯珠死 3 颗', alertColor: '#ef4444',
    highlightBox: { x: 145, y: 75, w: 50, h: 32 }, highlightX: 170,
    bgStyle: { background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)' }
  },
  {
    name: '麓谷配电箱 B-08', loc: '麓谷产业园 A 区',
    type: 'smoke', conf: '99%',
    alertText: '冒烟！已派工', alertColor: '#ef4444',
    bgStyle: { background: 'linear-gradient(180deg, #3f3f46 0%, #18181b 100%)' }
  },
  {
    name: '隧道 L-03 入口', loc: '梅溪湖隧道',
    type: 'tunnel', conf: '98%',
    alertText: '隧道 L-03 有烟雾', alertColor: '#ef4444',
    bgStyle: { background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)' }
  }
]

/* ====== 8 个照明 AI 模型 ====== */
const models = reactive([
  { key: 'tilt', name: '🔌 灯杆倾斜/倒塌', icon: Warning, on: true, count: 12, avgConf: 97, color: '#ef4444' },
  { key: 'lamp', name: '💡 灯具故障', icon: Sunny, on: true, count: 18, avgConf: 94, color: '#f59e0b' },
  { key: 'cabinet', name: '🧰 配电箱异常', icon: Lock, on: true, count: 6, avgConf: 96, color: '#8b5cf6' },
  { key: 'crack', name: '🔩 杆身裂痕/配件', icon: Opportunity, on: true, count: 4, avgConf: 91, color: '#3b82f6' },
  { key: 'accept', name: '🌃 夜间照明验收', icon: View, on: true, count: 3, avgConf: 88, color: '#10b981' },
  { key: 'smoke', name: '⚠️ 隧道烟雾/火情', icon: Warning, on: true, count: 2, avgConf: 98, color: '#ef4444' },
  { key: 'top', name: '📷 杆顶附件状态', icon: Monitor, on: true, count: 5, avgConf: 92, color: '#0ea5e9' },
  { key: 'intrude', name: '🚪 区域入侵', icon: Lock, on: true, count: 2, avgConf: 95, color: '#f97316' }
])

const threshold = ref(0.80)

/* ====== 告警分布 ====== */
const barChart = [
  { name: '灯具故障', count: 18, percent: 100, color: '#f59e0b' },
  { name: '灯杆倾斜', count: 12, percent: 67, color: '#ef4444' },
  { name: '配电箱异常', count: 6, percent: 33, color: '#8b5cf6' },
  { name: '杆身裂痕', count: 4, percent: 22, color: '#3b82f6' },
  { name: '杆顶附件', count: 5, percent: 28, color: '#0ea5e9' },
  { name: '隧道烟雾', count: 2, percent: 11, color: '#ef4444' },
  { name: '区域入侵', count: 2, percent: 11, color: '#f97316' },
  { name: '照明验收', count: 3, percent: 17, color: '#10b981' }
]
const totalBarCount = computed(() => barChart.reduce((a, b) => a + b.count, 0))

/* ====== 实时事件流 ====== */
const eventList = ref([
  { time: '14:32:18', type: '🔴严重', color: '#ef4444', loc: '先导路 #23 灯杆倾斜 8.2°', extra: '已派工单 WO-20261029-0041', level: 'danger' },
  { time: '14:31:45', type: '🔴严重', color: '#ef4444', loc: '麓谷产业园配电箱冒烟', extra: '已派工单 WO-20261029-0040', level: 'danger' },
  { time: '14:30:12', type: '🟠警告', color: '#f59e0b', loc: '梅溪湖环湖路 #18 灯具亮度同期低 42%', extra: '置信度 94%', level: 'warn' },
  { time: '14:29:33', type: '🟠警告', color: '#f59e0b', loc: '隧道 L-03 检测到烟雾', extra: '已触发全亮预案', level: 'warn' },
  { time: '14:28:07', type: '🟡提示', color: '#eab308', loc: '咸嘉湖路 #07 摄像头外壳被撬痕迹', extra: '置信度 89%', level: 'info' },
  { time: '14:26:52', type: '🟡提示', color: '#eab308', loc: '先导路 #41 LED 广告屏故障', extra: '置信度 91%', level: 'info' },
  { time: '14:25:19', type: '🟠警告', color: '#f59e0b', loc: '金星大道 #33 灯具闪烁频率 8Hz', extra: '已派单 WO-0039', level: 'warn' },
  { time: '14:24:03', type: '🟡提示', color: '#eab308', loc: '岳麓山 #56 光伏板脏污告警', extra: '置信度 86%', level: 'info' },
  { time: '14:22:48', type: '🔴严重', color: '#ef4444', loc: '麓谷产业园 C 区有人入侵箱变围栏', extra: '已联动 SOS 喊话', level: 'danger' },
  { time: '14:21:30', type: '🟠警告', color: '#f59e0b', loc: '先导路 #12 杆身法兰螺栓缺失 2 颗', extra: '置信度 93%', level: 'warn' },
  { time: '14:20:15', type: '🟡提示', color: '#eab308', loc: '咸嘉湖路夜间照明验收完成', extra: '评分 92 · 通过', level: 'info' },
  { time: '14:18:02', type: '🟠警告', color: '#f59e0b', loc: '梅溪湖 #05 配电箱箱体被猫撬开', extra: '置信度 96%', level: 'warn' }
])

/* ====== 时钟 & 事件追加 ====== */
const currentTime = ref('')
const eventTemplates = [
  () => ({ type: '🔴严重', color: '#ef4444', loc: '先导路 #' + (10 + Math.floor(Math.random() * 40)) + ' 灯杆倾斜 ' + (5 + Math.random() * 6).toFixed(1) + '°', extra: '已派工单', level: 'danger' }),
  () => ({ type: '🟠警告', color: '#f59e0b', loc: '麓谷 #' + (5 + Math.floor(Math.random() * 20)) + ' 灯具亮度低 ' + (30 + Math.floor(Math.random() * 30)) + '%', extra: '置信度 ' + (90 + Math.floor(Math.random() * 8)) + '%', level: 'warn' }),
  () => ({ type: '🟡提示', color: '#eab308', loc: '咸嘉湖 #' + (10 + Math.floor(Math.random() * 30)) + ' 摄像头外壳松动', extra: '置信度 ' + (85 + Math.floor(Math.random() * 10)) + '%', level: 'info' }),
  () => ({ type: '🔴严重', color: '#ef4444', loc: '隧道 L-0' + (1 + Math.floor(Math.random() * 5)) + ' 检测到烟雾扩散', extra: '已触发全亮 + 告警', level: 'danger' }),
  () => ({ type: '🟠警告', color: '#f59e0b', loc: '金星大道配电箱 B-' + (10 + Math.floor(Math.random() * 30)) + ' 被小动物进入', extra: '置信度 96%', level: 'warn' })
]

let timer, eventTimer
onMounted(() => {
  currentTime.value = new Date().toLocaleString('zh-CN', { hour12: false })
  timer = setInterval(() => {
    currentTime.value = new Date().toLocaleString('zh-CN', { hour12: false })
  }, 1000)
  // 每 15 秒追加新告警
  eventTimer = setInterval(() => {
    const tpl = eventTemplates[Math.floor(Math.random() * eventTemplates.length)]()
    const now = new Date()
    tpl.time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
    eventList.value.unshift(tpl)
    if (eventList.value.length > 20) eventList.value.pop()
  }, 15000)
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
  if (eventTimer) clearInterval(eventTimer)
})
</script>

<style lang="scss" scoped>
.zg-av-overview {
  --zg-brand-primary: #6366f1;
  --zg-gradient-primary: linear-gradient(135deg, #6366f1, #a855f7);
  --zg-success: #22c55e;
  --zg-warning: #f59e0b;
  --zg-danger: #ef4444;
  --zg-info: #3b82f6;
  --zg-surface-card: #ffffff;
  --zg-shadow-card: 0 4px 16px rgba(15, 23, 42, 0.08);

  padding: 20px;
  background: #f8fafc;
  min-height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif;
}

/* ====== 头部 ====== */
.zg-av-head {
  background: var(--zg-gradient-primary);
  border-radius: 12px;
  padding: 20px 24px;
  color: #fff;
  margin-bottom: 16px;
  box-shadow: var(--zg-shadow-card);

  &__inner { display: flex; align-items: center; gap: 16px; }
  &__sigil {
    width: 44px; height: 44px; border-radius: 10px;
    background: rgba(255, 255, 255, 0.18);
    display: flex; align-items: center; justify-content: center;
    backdrop-filter: blur(4px);
  }
  &__copy { flex: 1; min-width: 0; }
  &__title { margin: 0 0 4px 0; font-size: 18px; font-weight: 600; }
  &__sub { margin: 0; font-size: 13px; opacity: 0.88; }
  &__actions { display: flex; align-items: center; gap: 12px; }
  &__clock { font-size: 13px; opacity: 0.9; font-variant-numeric: tabular-nums; }
}

/* ====== KPI ====== */
.zg-kpis {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}
.zg-kpi {
  background: var(--zg-surface-card);
  border-radius: 10px;
  padding: 16px;
  box-shadow: var(--zg-shadow-card);
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;

  &__icon {
    width: 40px; height: 40px; border-radius: 10px;
    background: #eef2ff; color: var(--zg-brand-primary);
    display: flex; align-items: center; justify-content: center; font-size: 20px;
  }
  &__body { flex: 1; min-width: 0; }
  &__num { font-size: 22px; font-weight: 700; color: #0f172a; line-height: 1.1; }
  &__lbl { font-size: 12px; color: #64748b; margin-top: 2px; }
  &__delta { position: absolute; top: 8px; right: 10px; font-size: 11px; color: #94a3b8; }
  &__delta.up { color: var(--zg-success); }
  &.ok .zg-kpi__icon { background: #dcfce7; color: var(--zg-success); }
  &.warn .zg-kpi__icon { background: #fef3c7; color: var(--zg-warning); }
  &.info .zg-kpi__icon { background: #dbeafe; color: var(--zg-info); }
}

/* ====== 主区 ====== */
.zg-main {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 16px;
  margin-bottom: 16px;
}

.zg-grid {
  background: var(--zg-surface-card);
  border-radius: 12px;
  padding: 16px;
  box-shadow: var(--zg-shadow-card);
  &__head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
  &__title { font-size: 14px; font-weight: 600; color: #0f172a; }
}

.zg-cam {
  position: relative;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 12px;
  border: 1px solid #e2e8f0;

  .zg-svg-overlay { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }

  &__label {
    position: absolute; top: 10px; left: 10px;
    padding: 4px 10px; font-size: 12px; font-weight: 600;
    border-radius: 4px; color: #fff; z-index: 2;
  }
  &__conf {
    position: absolute; top: 12px; right: 12px;
    font-size: 11px; color: #fff; background: rgba(0,0,0,0.45);
    padding: 3px 8px; border-radius: 4px; z-index: 2;
  }
  &__foot {
    position: absolute; bottom: 0; left: 0; right: 0;
    background: linear-gradient(transparent, rgba(15, 23, 42, 0.8));
    padding: 10px 12px 8px; color: #fff;
    display: flex; justify-content: space-between; font-size: 12px; z-index: 2;
  }
  &__name { display: flex; align-items: center; gap: 6px; }
  &__loc { opacity: 0.85; }
}

.zg-live-dot {
  width: 8px; height: 8px; border-radius: 50%; background: #94a3b8;
  &.on {
    background: var(--zg-danger);
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
    animation: zgPulse 1.5s infinite;
  }
}
@keyframes zgPulse {
  0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}

.zg-threshold {
  display: flex; align-items: center;
  padding: 12px 16px; background: #f1f5f9;
  border-radius: 8px; margin-top: 4px;
  &__lbl { font-size: 13px; color: #475569; font-weight: 500; white-space: nowrap; }
  &__val { font-size: 15px; font-weight: 700; color: var(--zg-brand-primary); font-variant-numeric: tabular-nums; }
}

/* ====== 模型矩阵 ====== */
.zg-models {
  background: var(--zg-surface-card);
  border-radius: 12px;
  padding: 16px;
  box-shadow: var(--zg-shadow-card);
  &__head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
}
.zg-model {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 12px; border-radius: 8px; margin-bottom: 8px;
  border: 1px solid #e2e8f0; background: #fff;
  transition: all 0.2s;

  &.on { border-color: transparent; background: #faf5ff; box-shadow: inset 3px 0 0 var(--zg-brand-primary); }

  &__icon {
    width: 36px; height: 36px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center; font-size: 17px; flex-shrink: 0;
  }
  &__body { flex: 1; min-width: 0; }
  &__name { font-size: 13px; font-weight: 600; color: #0f172a; }
  &__sub { font-size: 11px; color: #64748b; margin-top: 2px; strong { color: var(--zg-brand-primary); } }
}

/* ====== 底部 ====== */
.zg-bottom {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.zg-bar-chart, .zg-stream {
  background: var(--zg-surface-card);
  border-radius: 12px;
  padding: 16px;
  box-shadow: var(--zg-shadow-card);
}
.zg-bar-chart__title { font-size: 14px; font-weight: 600; color: #0f172a; margin-bottom: 14px; display: block; }
.zg-bar-chart__total {
  margin-top: 16px; padding-top: 12px; border-top: 1px dashed #e2e8f0;
  font-size: 12px; color: #64748b; strong { color: var(--zg-brand-primary); font-size: 15px; margin: 0 2px; }
}

.zg-bar {
  display: grid;
  grid-template-columns: 110px 1fr 40px;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  &__lbl { font-size: 13px; color: #334155; }
  &__track { height: 14px; background: #f1f5f9; border-radius: 6px; overflow: hidden; }
  &__fill { height: 100%; border-radius: 6px; transition: width 0.6s ease; }
  &__val { font-size: 13px; font-weight: 600; color: #0f172a; text-align: right; }
}

/* ====== 事件流 ====== */
.zg-stream__head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.zg-stream__live { font-size: 12px; font-weight: 700; color: var(--zg-danger); display: flex; align-items: center; gap: 6px; }
.zg-stream__mask { height: 340px; overflow: hidden; position: relative; }
.zg-stream__track { animation: zgRoll 25s linear infinite; }
@keyframes zgRoll {
  0% { transform: translateY(0); }
  100% { transform: translateY(-50%); }
}

.zg-evt {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 12px; margin-bottom: 8px;
  background: #f8fafc; border-radius: 8px;
  border-left: 3px solid var(--zg-brand-primary);

  &.danger { border-left-color: #ef4444; }
  &.warn { border-left-color: #f59e0b; }
  &.info { border-left-color: #eab308; }

  &__time { font-size: 12px; color: #64748b; font-variant-numeric: tabular-nums; min-width: 60px; }
  &__type { font-size: 11px; padding: 3px 7px; border-radius: 4px; font-weight: 600; color: #fff; white-space: nowrap; }
  &__loc { flex: 1; font-size: 12px; color: #334155; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  &__extra { font-size: 11px; color: #94a3b8; white-space: nowrap; }
}
</style>
