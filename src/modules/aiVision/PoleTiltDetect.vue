<!--
  PoleTiltDetect.vue — 灯杆倾斜/倒塌检测（全新）
  目标：灯杆是核心固定资产，歪了塌了必须第一时间知道
-->
<template>
  <section class="zg-pt-detect">
    <header class="zg-pt-head">
      <div class="zg-pt-head__sigil"><el-icon :size="22"><Warning /></el-icon></div>
      <div class="zg-pt-head__copy">
        <h1 class="zg-pt-head__title">灯杆倾斜/倒塌 AI 检测</h1>
        <p class="zg-pt-head__sub">识别杆身偏离垂直角度 >5° · 视觉角度 + GPS 双验证 · 自动派维修工单</p>
      </div>
      <div class="zg-pt-head__actions">
        <el-button type="primary" plain @click="drawer = true">阈值设置</el-button>
      </div>
    </header>

    <!-- KPI -->
    <div class="zg-pt-kpis">
      <div class="zg-pt-kpi" v-for="k in kpis" :key="k.label">
        <div class="zg-pt-kpi__icon" :style="{ background: k.bg, color: k.color }"><el-icon><component :is="k.icon" /></el-icon></div>
        <div class="zg-pt-kpi__body">
          <div class="zg-pt-kpi__num" :style="{ color: k.color }">{{ k.value }}</div>
          <div class="zg-pt-kpi__lbl">{{ k.label }}</div>
        </div>
      </div>
    </div>

    <!-- 主区：左摄像头列表 + 右 tab 视图 -->
    <div class="zg-pt-main">
      <!-- 摄像头列表 -->
      <div class="zg-pt-cameras">
        <div class="zg-pt-cameras__head">
          <span>摄像头 · 倾斜读数</span>
          <el-tag size="small">共 {{ cameras.length }} 台</el-tag>
        </div>
        <div
          v-for="c in cameras"
          :key="c.id"
          class="zg-pt-camera"
          :class="{ active: selected?.id === c.id, danger: c.level === 'danger', warn: c.level === 'warn' }"
          @click="selected = c"
        >
          <div class="zg-pt-camera__top">
            <span class="zg-pt-camera__name">{{ c.name }}</span>
            <span class="zg-pt-camera__angle">{{ c.angle }}°</span>
          </div>
          <div class="zg-pt-camera__loc">{{ c.loc }}</div>
          <div class="zg-pt-camera__foot">
            <span class="zg-pt-camera__time">最近检测 {{ c.lastTime }}</span>
            <el-tag size="small" :type="levelTagType(c.level)">{{ levelText(c.level) }}</el-tag>
          </div>
        </div>
        <div class="zg-pt-pager">
          <el-pagination :page-size="8" :total="32" layout="prev, pager, next" small />
        </div>
      </div>

      <!-- Tab 主视图 -->
      <div class="zg-pt-panel">
        <el-tabs v-model="tab">
          <el-tab-pane label="实时画面" name="live">
            <div class="zg-pt-live">
              <div class="zg-pt-scene" :style="selected?.bg">
                <!-- SVG 检测：垂直线参考 + 杆身实际线 + 夹角 + 阈值 -->
                <svg class="zg-pt-svg" viewBox="0 0 400 300" preserveAspectRatio="none">
                  <!-- 地面 -->
                  <rect x="0" y="270" width="400" height="30" fill="#1e293b" />
                  <!-- 垂直参考线 -->
                  <line x1="200" y1="50" x2="200" y2="270" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="5,4" />
                  <text x="206" y="48" fill="#22c55e" font-size="11">垂直参考</text>
                  <!-- 倾斜杆身 -->
                  <line x1="200" y1="270" x2="248" y2="50" stroke="#ef4444" stroke-width="5" stroke-linecap="round" />
                  <!-- 夹角弧线 -->
                  <path d="M200,150 A48,48 0 0 1 224,132" fill="none" stroke="#ef4444" stroke-width="2" />
                  <text x="216" y="142" fill="#ef4444" font-size="14" font-weight="700">{{ selected?.angle }}°</text>
                  <!-- 杆顶摄像头 -->
                  <rect x="238" y="38" width="18" height="12" fill="#e2e8f0" stroke="#475569" stroke-width="1" />
                  <!-- AI 检测框 -->
                  <rect x="170" y="40" width="110" height="235" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="6,3" rx="2" />
                </svg>
                <div class="zg-pt-scene__lbl">
                  <span class="zg-pt-level-badge danger">倾斜 {{ selected?.angle }}° · 置信度 {{ selected?.conf }}%</span>
                  <span>{{ selected?.name }} · {{ selected?.loc }}</span>
                </div>
              </div>

              <!-- 角度仪表盘 -->
              <div class="zg-pt-gauge">
                <div class="zg-pt-gauge__title">当前倾斜角度仪表盘</div>
                <svg viewBox="0 0 180 110" class="zg-pt-gauge__svg">
                  <!-- 刻度弧 0-15° -->
                  <path d="M20,100 A70,70 0 0 1 160,100" fill="none" stroke="#e2e8f0" stroke-width="10" />
                  <!-- 警告区 5-10° -->
                  <path d="M76,40 A70,70 0 0 1 124,40" fill="none" stroke="#f59e0b" stroke-width="10" />
                  <!-- 危险区 >10° -->
                  <path d="M124,40 A70,70 0 0 1 160,100" fill="none" stroke="#ef4444" stroke-width="10" />
                  <!-- 5°阈值虚线标 -->
                  <line x1="65" y1="38" x2="70" y2="28" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="2,2" />
                  <text x="62" y="25" font-size="9" fill="#f59e0b">5°阈值</text>
                  <!-- 指针 -->
                  <line :x1="90" :y1="100" :x2="needleX" :y2="needleY" stroke="#1e293b" stroke-width="3" stroke-linecap="round" />
                  <circle cx="90" cy="100" r="5" fill="#1e293b" />
                </svg>
                <div class="zg-pt-gauge__val">当前 <strong>{{ selected?.angle }}°</strong> / 阈值 5°</div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="历史趋势" name="trend">
            <div class="zg-pt-trend">
              <div class="zg-pt-trend__title">{{ selected?.name }} · 近 30 天倾斜趋势</div>
              <svg viewBox="0 0 720 220" class="zg-pt-trend__svg">
                <!-- Y 轴 -->
                <text v-for="(yt, yi) in [0,5,10,15]" :key="yi" :x="18" :y="200 - yi * 40 + 4" font-size="10" fill="#94a3b8">{{ yt }}°</text>
                <!-- 网格线 -->
                <line v-for="(yt, yi) in [0,5,10,15]" :key="'g'+yi" x1="50" :y1="200 - yi * 40" x2="710" :y2="200 - yi * 40" stroke="#f1f5f9" stroke-width="1" />
                <!-- 5°阈值线 -->
                <line x1="50" y1="160" x2="710" y2="160" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4,3" />
                <text x="54" y="156" font-size="10" fill="#f59e0b">5° 告警阈值</text>
                <!-- 折线 -->
                <polyline :points="trendLinePoints" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
                <!-- 数据点 -->
                <circle v-for="(pt, pi) in trendPoints" :key="pi" :cx="pt.x" :cy="pt.y" :r="pt.v > 5 ? 4 : 3" :fill="pt.v > 5 ? '#ef4444' : '#6366f1'" stroke="#fff" stroke-width="1.5" />
                <!-- X 轴日期 -->
                <text v-for="(d, di) in trendDates" :key="di" :x="50 + di * 22" y="215" font-size="9" fill="#94a3b8" text-anchor="middle">{{ d }}</text>
              </svg>
              <div class="zg-pt-trend__stat">
                <div>30 天峰值 <strong style="color:#ef4444">8.2°</strong></div>
                <div>超过阈值天数 <strong style="color:#f59e0b">4 天</strong></div>
                <div>平均倾斜 <strong>2.8°</strong></div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 底部：倾斜告警卡片 -->
    <div class="zg-pt-alerts">
      <div class="zg-pt-alerts__head">
        <span class="zg-pt-alerts__title">倾斜告警（{{ alertCards.length }} 条需关注）</span>
        <el-button type="primary" size="small" plain>批量派单</el-button>
      </div>
      <div class="zg-pt-alert-cards">
        <div
          v-for="a in alertCards"
          :key="a.id"
          class="zg-pt-alert"
          :class="a.level"
        >
          <div class="zg-pt-alert__badge">{{ levelEmoji(a.level) }} [{{ levelText(a.level) }}]</div>
          <div class="zg-pt-alert__body">
            <div class="zg-pt-alert__name">{{ a.name }} · 倾斜 <strong>{{ a.angle }}°</strong></div>
            <div class="zg-pt-alert__meta">📍 {{ a.loc }} · 🕒 {{ a.time }} · 置信度 {{ a.conf }}%</div>
          </div>
          <el-button
            v-if="a.level !== 'ok'"
            type="primary"
            size="small"
            :style="{ background: a.level === 'danger' ? '#ef4444' : '#f59e0b', borderColor: a.level === 'danger' ? '#ef4444' : '#f59e0b' }"
            @click="createTicket(a)"
          >
            生成维修工单
          </el-button>
          <el-tag v-else size="small" type="success">运行正常</el-tag>
        </div>
      </div>
    </div>

    <!-- 阈值设置 Drawer -->
    <el-drawer v-model="drawer" title="倾斜检测阈值设置" size="380px">
      <el-form label-position="top">
        <el-form-item label="危险阈值角度（默认 10°）">
          <el-slider v-model="settings.dangerAngle" :min="5" :max="20" :marks="{5:'5°',10:'10°',15:'15°',20:'20°'}" />
          <span class="zg-form-hint">超过此值触发倒塌告警</span>
        </el-form-item>
        <el-form-item label="警告阈值角度（默认 5°）">
          <el-slider v-model="settings.warnAngle" :min="2" :max="10" :marks="{2:'2°',5:'5°',10:'10°'}" />
          <span class="zg-form-hint">超过此值触发倾斜预警</span>
        </el-form-item>
        <el-form-item label="连续检测次数（防抖用）">
          <el-input-number v-model="settings.stableCount" :min="1" :max="10" />
          <span class="zg-form-hint">连续 N 次检测都超阈值才告警</span>
        </el-form-item>
        <el-form-item label="GPS 辅助验证">
          <el-switch v-model="settings.gpsAssist" active-text="开启 · 视觉+GPS 双验证" />
          <span class="zg-form-hint">杆身倾斜 = GPS 位置偏移 + 视觉角度 双验证</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="drawer = false">取消</el-button>
        <el-button type="primary" @click="drawer = false">保存</el-button>
      </template>
    </el-drawer>
  </section>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage as Toast } from 'element-plus'
import {
  Warning, Monitor, TrendCharts, Timer, DataAnalysis, Bell
} from '@element-plus/icons-vue'

const kpis = [
  { label: '今日检测杆数', value: '384', icon: Monitor, bg: '#eef2ff', color: '#6366f1' },
  { label: '倾斜预警', value: '12', icon: Bell, bg: '#fef3c7', color: '#f59e0b' },
  { label: '倒塌告警', value: '1', icon: Warning, bg: '#fee2e2', color: '#ef4444' },
  { label: '平均倾斜角度', value: '2.1°', icon: TrendCharts, bg: '#dbeafe', color: '#3b82f6' },
  { label: '已派工单', value: '8', icon: Timer, bg: '#dcfce7', color: '#22c55e' }
]

const cameras = ref([
  { id: 1, name: '先导路 #23', loc: '岳麓区先导路', angle: 8.2, conf: 97, level: 'danger', lastTime: '14:23', bg: 'linear-gradient(180deg, #1e293b 0%, #334155 60%, #475569 100%)' },
  { id: 2, name: '麓谷产业园 #17', loc: '麓谷产业园北门', angle: 5.8, conf: 95, level: 'warn', lastTime: '14:18', bg: 'linear-gradient(180deg, #0f766e, #134e4a)' },
  { id: 3, name: '梅溪湖环湖 #18', loc: '梅溪湖环湖路', angle: 3.1, conf: 96, level: 'ok', lastTime: '14:15', bg: 'linear-gradient(180deg, #1e40af, #1e3a8a)' },
  { id: 4, name: '金星大道 #33', loc: '金星大道南段', angle: 4.5, conf: 98, level: 'ok', lastTime: '14:12', bg: 'linear-gradient(180deg, #3730a3, #1e1b4b)' },
  { id: 5, name: '咸嘉湖路 #07', loc: '咸嘉湖路南段', angle: 1.2, conf: 97, level: 'ok', lastTime: '14:10', bg: 'linear-gradient(180deg, #065f46, #022c22)' },
  { id: 6, name: '岳麓山 #56', loc: '岳麓山东门', angle: 11.4, conf: 99, level: 'danger', lastTime: '14:08', bg: 'linear-gradient(180deg, #7c2d12, #431407)' },
  { id: 7, name: '先导路 #01', loc: '岳麓区先导路', angle: 1.2, conf: 98, level: 'ok', lastTime: '14:05', bg: 'linear-gradient(180deg, #0f766e, #064e3b)' },
  { id: 8, name: '麓谷产业园 #05', loc: '麓谷产业园 A 区', angle: 6.3, conf: 94, level: 'warn', lastTime: '14:02', bg: 'linear-gradient(180deg, #1e3a8a, #1e1b4b)' }
])

const selected = ref(cameras.value[0])
const tab = ref('live')
const drawer = ref(false)
const settings = reactive({ dangerAngle: 10, warnAngle: 5, stableCount: 3, gpsAssist: true })

function levelTagType(l) { return l === 'danger' ? 'danger' : l === 'warn' ? 'warning' : 'success' }
function levelText(l) { return l === 'danger' ? '危险' : l === 'warn' ? '警告' : '正常' }
function levelEmoji(l) { return l === 'danger' ? '🔴' : l === 'warn' ? '⚠️' : '✅' }

// 仪表盘指针
const needleX = computed(() => {
  const angle = Math.min(selected.value?.angle || 0, 15)
  const rad = (60 - (angle / 15) * 120) * Math.PI / 180
  return 90 + 60 * Math.cos(rad)
})
const needleY = computed(() => {
  const angle = Math.min(selected.value?.angle || 0, 15)
  const rad = (60 - (angle / 15) * 120) * Math.PI / 180
  return 100 - 60 * Math.sin(rad)
})

// 历史趋势
const trendDates = ['10-01','10-05','10-09','10-13','10-17','10-21','10-25','10-29']
const trendValues = [1.8, 2.3, 2.1, 3.5, 4.8, 5.6, 6.9, 8.2]
const trendPoints = computed(() => trendValues.map((v, i) => ({ x: 50 + i * 82, y: 200 - v * 8, v })))
const trendLinePoints = computed(() => trendPoints.value.map(p => `${p.x},${p.y}`).join(' '))

// 底部告警卡片
const alertCards = [
  { id: 1, name: '先导路 #23', loc: '岳麓区先导路', angle: 8.2, conf: 97, level: 'danger', time: '2026-10-29 14:23' },
  { id: 2, name: '岳麓山 #56', loc: '岳麓山东门', angle: 11.4, conf: 99, level: 'danger', time: '2026-10-29 14:08' },
  { id: 3, name: '麓谷产业园 #17', loc: '麓谷产业园北门', angle: 5.8, conf: 95, level: 'warn', time: '2026-10-29 14:18' },
  { id: 4, name: '麓谷产业园 #05', loc: '麓谷产业园 A 区', angle: 6.3, conf: 94, level: 'warn', time: '2026-10-29 14:02' },
  { id: 5, name: '先导路 #01', loc: '岳麓区先导路', angle: 1.2, conf: 98, level: 'ok', time: '2026-10-29 14:05' },
  { id: 6, name: '咸嘉湖路 #07', loc: '咸嘉湖路南段', angle: 1.5, conf: 97, level: 'ok', time: '2026-10-29 14:10' }
]

function createTicket(a) {
  Toast.success(`已创建维修工单 WO-${Date.now().toString().slice(-6)} · ${a.name}`)
}
</script>

<style lang="scss" scoped>
.zg-pt-detect {
  --zg-brand-primary: #6366f1;
  --zg-gradient-primary: linear-gradient(135deg, #6366f1, #a855f7);
  --zg-success: #22c55e;
  --zg-warning: #f59e0b;
  --zg-danger: #ef4444;
  --zg-info: #3b82f6;
  padding: 20px;
  background: #f8fafc;
  min-height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif;
}

.zg-pt-head {
  background: var(--zg-gradient-primary);
  border-radius: 12px;
  padding: 18px 22px;
  color: #fff;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 4px 16px rgba(99,102,241,0.25);

  &__sigil {
    width: 42px; height: 42px; border-radius: 10px;
    background: rgba(255,255,255,0.2);
    display: flex; align-items: center; justify-content: center;
  }
  &__title { margin: 0 0 2px; font-size: 17px; font-weight: 600; }
  &__sub { margin: 0; font-size: 12px; opacity: 0.9; }
  &__copy { flex: 1; min-width: 0; }
}

.zg-pt-kpis {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-bottom: 14px;
}
.zg-pt-kpi {
  background: #fff;
  border-radius: 10px;
  padding: 14px 16px;
  box-shadow: 0 4px 12px rgba(15,23,42,0.06);
  display: flex; align-items: center; gap: 12px;

  &__icon {
    width: 40px; height: 40px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center; font-size: 18px;
  }
  &__num { font-size: 22px; font-weight: 700; line-height: 1.1; color: #0f172a; }
  &__lbl { font-size: 12px; color: #64748b; margin-top: 2px; }
}

.zg-pt-main {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 14px;
  margin-bottom: 14px;
}

/* 摄像头列表 */
.zg-pt-cameras {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(15,23,42,0.06);
  display: flex; flex-direction: column;
  max-height: 680px;
  overflow: hidden;

  &__head {
    padding: 12px 14px;
    border-bottom: 1px solid #f1f5f9;
    display: flex; align-items: center; justify-content: space-between;
    font-size: 13px; font-weight: 600; color: #0f172a;
  }
}

.zg-pt-camera {
  padding: 12px 14px;
  border-bottom: 1px solid #f8fafc;
  cursor: pointer;
  transition: all 0.15s;
  border-left: 3px solid transparent;

  &:hover { background: #f8fafc; }
  &.active { background: #eef2ff; border-left-color: var(--zg-brand-primary); }
  &.danger { border-left-color: #ef4444; }
  &.warn { border-left-color: #f59e0b; }

  &__top { display: flex; justify-content: space-between; align-items: center; }
  &__name { font-size: 13px; font-weight: 600; color: #0f172a; }
  &__angle { font-size: 18px; font-weight: 700; color: #22c55e; font-variant-numeric: tabular-nums; }
  .danger &__angle { color: #ef4444; }
  .warn &__angle { color: #f59e0b; }

  &__loc { font-size: 11px; color: #64748b; margin-top: 4px; }
  &__foot { display: flex; justify-content: space-between; align-items: center; margin-top: 6px; }
  &__time { font-size: 11px; color: #94a3b8; }
}

.zg-pt-pager {
  padding: 10px;
  display: flex; justify-content: center;
  border-top: 1px solid #f1f5f9;
  margin-top: auto;
}

/* Tab 面板 */
.zg-pt-panel {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(15,23,42,0.06);
  padding: 14px;

  :deep(.el-tabs__nav-wrap::after) { background: #f1f5f9; }
}

/* 实时画面 */
.zg-pt-live {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 14px;
}
.zg-pt-scene {
  position: relative;
  height: 380px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  background: #1e293b;

  .zg-pt-svg { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
  &__lbl {
    position: absolute; bottom: 0; left: 0; right: 0;
    background: linear-gradient(transparent, rgba(0,0,0,0.75));
    padding: 12px 14px; color: #fff;
    display: flex; justify-content: space-between; align-items: center;
    font-size: 13px;
  }
}
.zg-pt-level-badge {
  padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 600;
  &.danger { background: #ef4444; color: #fff; }
  &.warn { background: #f59e0b; color: #fff; }
  &.ok { background: #22c55e; color: #fff; }
}

/* 仪表盘 */
.zg-pt-gauge {
  background: #f8fafc;
  border-radius: 8px;
  padding: 14px;
  display: flex; flex-direction: column;
  align-items: center;

  &__title { font-size: 13px; font-weight: 600; color: #0f172a; margin-bottom: 8px; }
  &__svg { width: 100%; max-width: 300px; }
  &__val { margin-top: 10px; font-size: 13px; color: #475569; strong { font-size: 20px; color: var(--zg-brand-primary); } }
}

/* 趋势 */
.zg-pt-trend__title { font-size: 14px; font-weight: 600; color: #0f172a; margin-bottom: 10px; }
.zg-pt-trend__svg { width: 100%; height: 240px; border: 1px solid #f1f5f9; border-radius: 8px; background: #fafafa; }
.zg-pt-trend__stat {
  display: flex; gap: 18px; margin-top: 10px;
  font-size: 12px; color: #475569;
  strong { color: #0f172a; margin-left: 2px; }
}

/* 告警卡片 */
.zg-pt-alerts {
  background: #fff;
  border-radius: 10px;
  padding: 14px;
  box-shadow: 0 4px 12px rgba(15,23,42,0.06);

  &__head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  &__title { font-size: 14px; font-weight: 600; color: #0f172a; }
}

.zg-pt-alert-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
.zg-pt-alert {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px;
  border-radius: 8px;
  background: #fafafa;
  border-left: 3px solid #22c55e;

  &.danger { border-left-color: #ef4444; background: #fef2f2; }
  &.warn { border-left-color: #f59e0b; background: #fffbeb; }

  &__badge { font-size: 12px; font-weight: 600; min-width: 80px; }
  &.danger &__badge { color: #ef4444; }
  &.warn &__badge { color: #f59e0b; }

  &__body { flex: 1; min-width: 0; }
  &__name { font-size: 13px; font-weight: 600; color: #0f172a; strong { color: #ef4444; } }
  &__meta { font-size: 11px; color: #64748b; margin-top: 4px; }
}

.zg-form-hint { font-size: 11px; color: #94a3b8; margin-top: 4px; display: block; }
</style>
