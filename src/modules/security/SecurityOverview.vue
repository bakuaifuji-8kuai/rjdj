<!--
  智光云枢 · 安防中心 · 态势总览
  业务域：security
  功能：井盖/AI 摄像头/SOS 应急柱 多源安防态势一张图
        长沙先导路 · 岳麓区 · 麓谷 · 梅溪湖 安防资源总览
-->
<template>
  <section class="zg-security">
    <header class="zg-security__head">
      <div class="zg-security__headline">
        <div class="zg-security__sigil">
          <el-icon :size="22"><Lock /></el-icon>
        </div>
        <div class="zg-security__copy">
          <h1 class="zg-security__title">智能安防中心 · 态势总览</h1>
          <p class="zg-security__sub">
            覆盖长沙 · 岳麓区 · 先导路 · 麓谷 · 梅溪湖 · 橘子洲头 · 全区安防资源一张图
          </p>
        </div>
      </div>
      <div class="zg-security__alert-pulse">
        <el-badge :value="liveWarningFilledCount" type="danger" class="zg-pulse-badge" :max="99">
          <div class="zg-pulse-badge__icon">
            <el-icon :size="18"><Bell /></el-icon>
          </div>
        </el-badge>
        <span class="zg-pulse-badge__txt">实时告警</span>
      </div>
    </header>

    <!-- ============ KPI 卡 ============ -->
    <div class="zg-kpi">
      <div class="zg-kpi__cell zg-kpi__cell--ok">
        <div class="zg-kpi__icon"><el-icon :size="20"><Grid /></el-icon></div>
        <div class="zg-kpi__body">
          <div class="zg-kpi__num">1,247</div>
          <div class="zg-kpi__lbl">井盖在线</div>
          <div class="zg-kpi__mini">1,302 在役 · 在线率 95.8%</div>
        </div>
      </div>
      <div class="zg-kpi__cell zg-kpi__cell--info">
        <div class="zg-kpi__icon"><el-icon :size="20"><VideoCamera /></el-icon></div>
        <div class="zg-kpi__body">
          <div class="zg-kpi__num">384</div>
          <div class="zg-kpi__lbl">AI 摄像头</div>
          <div class="zg-kpi__mini">378 在线 · AI 识别中 126</div>
        </div>
      </div>
      <div class="zg-kpi__cell zg-kpi__cell--warn">
        <div class="zg-kpi__icon"><el-icon :size="20"><Warning /></el-icon></div>
        <div class="zg-kpi__body">
          <div class="zg-kpi__num">92</div>
          <div class="zg-kpi__lbl">SOS 应急柱</div>
          <div class="zg-kpi__mini">今日呼叫 3 次 · 响应 ≤ 3min</div>
        </div>
      </div>
      <div class="zg-kpi__cell zg-kpi__cell--danger">
        <div class="zg-kpi__icon"><el-icon :size="20"><WarningFilled /></el-icon></div>
        <div class="zg-kpi__body">
          <div class="zg-kpi__num">7</div>
          <div class="zg-kpi__lbl">今日安全事件</div>
          <div class="zg-kpi__mini">已处理 5 · 处理中 2</div>
        </div>
      </div>
    </div>

    <!-- ============ 中部三列 ============ -->
    <div class="zg-security__triple">
      <!-- 左：井盖在线地图 -->
      <div class="zg-security__panel">
        <div class="zg-security__panel-head">
          <strong>🗺️ 井盖在线分布 · 先导路</strong>
          <div class="zg-security__legend">
            <span><i class="dot dot-ok"></i>在线</span>
            <span><i class="dot dot-off"></i>离线</span>
            <span><i class="dot dot-alert"></i>告警</span>
          </div>
        </div>
        <div class="zg-security__map">
          <!-- 占位 SVG 地图：湘江 + 先导路主干道示意 -->
          <svg viewBox="0 0 420 240" class="zg-security__svg">
            <!-- 底色 -->
            <defs>
              <linearGradient id="waterg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#dbeafe" />
                <stop offset="100%" stop-color="#bfdbfe" />
              </linearGradient>
              <linearGradient id="roadg" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stop-color="#e2e8f0" />
                <stop offset="100%" stop-color="#cbd5e1" />
              </linearGradient>
            </defs>
            <!-- 湘江 -->
            <path d="M 0 140 Q 100 100 200 160 T 420 120 L 420 240 L 0 240 Z" fill="url(#waterg)" opacity="0.6" />
            <!-- 先导路主干道 -->
            <path d="M 10 80 L 410 100" stroke="url(#roadg)" stroke-width="26" stroke-linecap="round" fill="none" />
            <path d="M 10 80 L 410 100" stroke="#f1f5f9" stroke-width="2" stroke-dasharray="6 8" fill="none" />
            <!-- 麓谷大道 -->
            <path d="M 120 20 L 140 220" stroke="#e2e8f0" stroke-width="16" stroke-linecap="round" fill="none" />
            <!-- 节点 -->
            <g v-for="n in manholeNodes" :key="n.id">
              <circle :cx="n.x" :cy="n.y" r="8" :class="'node node--' + n.status" />
              <circle :cx="n.x" :cy="n.y" r="3" fill="#fff" />
            </g>
          </svg>
          <!-- 地名 -->
          <div class="zg-security__geo-tag geo-1">岳麓区</div>
          <div class="zg-security__geo-tag geo-2">麓谷</div>
          <div class="zg-security__geo-tag geo-3">梅溪湖</div>
          <div class="zg-security__geo-tag geo-4">橘子洲头</div>
        </div>
      </div>

      <!-- 中：AI 分析实时画面 -->
      <div class="zg-security__panel">
        <div class="zg-security__panel-head">
          <strong>🎥 AI 视频分析 · 实时画面</strong>
          <el-tag type="danger" size="small" effect="dark" class="zg-live-tag">● LIVE</el-tag>
        </div>
        <div class="zg-security__ai-feed">
          <div class="zg-security__ai-video">
            <div class="zg-security__ai-scene">
              <!-- 占位画面：模拟监控视角 -->
              <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice">
                <rect width="320" height="180" fill="#1e293b" />
                <!-- 道路 -->
                <polygon points="0,140 320,140 280,180 40,180" fill="#334155" />
                <line x1="0" y1="155" x2="320" y2="155" stroke="#fbbf24" stroke-width="1" stroke-dasharray="12 10" />
                <!-- 远景建筑 -->
                <rect x="20" y="60" width="40" height="80" fill="#475569" />
                <rect x="80" y="40" width="50" height="100" fill="#475569" />
                <rect x="150" y="70" width="35" height="70" fill="#475569" />
                <rect x="210" y="50" width="45" height="90" fill="#475569" />
                <rect x="270" y="65" width="40" height="75" fill="#475569" />
                <!-- 行人 -->
                <circle cx="120" cy="130" r="4" fill="#f87171" />
                <rect x="117" y="134" width="6" height="10" fill="#f87171" />
                <!-- 车辆 -->
                <rect x="200" y="145" width="40" height="16" fill="#60a5fa" rx="3" />
                <circle cx="210" cy="163" r="4" fill="#0f172a" />
                <circle cx="230" cy="163" r="4" fill="#0f172a" />
                <!-- AI 检测框 -->
                <rect x="110" y="120" width="26" height="30" stroke="#22c55e" stroke-width="1.5" fill="none" />
                <rect x="195" y="140" width="50" height="26" stroke="#ef4444" stroke-width="1.5" fill="none" />
                <text x="112" y="120" fill="#22c55e" font-size="9" font-family="monospace">PERSON</text>
                <text x="197" y="138" fill="#ef4444" font-size="9" font-family="monospace">VEHICLE</text>
              </svg>
              <div class="zg-security__ai-overlay">
                <span>📷 CAM-麓谷大道-K12</span>
                <span class="zg-security__ai-time">{{ nowStr }}</span>
              </div>
            </div>
          </div>
          <div class="zg-security__ai-tags">
            <div class="zg-security__ai-tag"><el-icon><Warning /></el-icon>人员入侵 · 置信度 96%</div>
            <div class="zg-security__ai-tag"><el-icon><Van /></el-icon>车辆违停 · 置信度 88%</div>
            <div class="zg-security__ai-tag"><el-icon><Delete /></el-icon>垃圾满溢 · 置信度 73%</div>
          </div>
        </div>
      </div>

      <!-- 右：SOS 应急柱 + 响应时间线 -->
      <div class="zg-security__panel">
        <div class="zg-security__panel-head">
          <strong>📞 SOS 应急响应</strong>
          <el-tag size="small" type="warning">3 次呼叫</el-tag>
        </div>
        <div class="zg-security__sos-status">
          <div v-for="p in sosPillars" :key="p.id" class="zg-sos-mini">
            <div class="zg-sos-mini__dot" :class="p.status === 'online' ? 'on' : p.status === 'calling' ? 'alert' : ''"></div>
            <div class="zg-sos-mini__info">
              <div class="zg-sos-mini__name">{{ p.id }} · {{ p.location }}</div>
              <div class="zg-sos-mini__sub">
                <span :class="p.status === 'online' ? 'ok' : p.status === 'calling' ? 'danger' : 'off'">
                  {{ p.status === 'online' ? '● 在线' : p.status === 'calling' ? '● 呼叫中' : '○ 离线' }}
                </span>
                <span>电池 {{ p.battery }}%</span>
              </div>
            </div>
          </div>
        </div>
        <div class="zg-security__timeline">
          <h4 class="zg-security__tl-title">⏱ 应急响应时间线</h4>
          <div v-for="(t, i) in sosTimeline" :key="i" class="zg-security__tl-item">
            <div class="zg-security__tl-time">{{ t.time }}</div>
            <div class="zg-security__tl-dot" :class="t.level"></div>
            <div class="zg-security__tl-copy">{{ t.text }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ============ 底部：安全事件表格 ============ -->
    <div class="zg-security__panel zg-security__panel--full">
      <div class="zg-security__panel-head">
        <strong>📋 今日安全事件</strong>
        <el-button type="primary" size="small" :icon="Refresh">刷新</el-button>
      </div>
      <el-table :data="eventList" stripe size="default" style="width: 100%">
        <el-table-column prop="type" label="事件类型" width="140">
          <template #default="{ row }">
            <el-tag :type="typeTag(row.type)" size="small">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="location" label="位置" min-width="180" />
        <el-table-column label="等级" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.level === '紧急' ? 'danger' : row.level === '重要' ? 'warning' : 'info'" effect="dark" size="small">
              {{ row.level }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="time" label="时间" width="160" />
        <el-table-column label="状态" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === '已处理' ? 'success' : row.status === '处理中' ? 'warning' : 'info'" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small">详情</el-button>
            <el-button link type="primary" size="small" v-if="row.status !== '已处理'">派单</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Lock, Bell, Grid, VideoCamera, Warning, WarningFilled, Refresh, Van, Delete } from '@element-plus/icons-vue'

const nowStr = ref('')
let timer = null
onMounted(() => {
  timer = setInterval(() => {
    const d = new Date()
    nowStr.value = d.toLocaleString('zh-CN', { hour12: false })
  }, 1000)
  nowStr.value = new Date().toLocaleString('zh-CN', { hour12: false })
})
onUnmounted(() => clearInterval(timer))

// ============ 井盖节点（地图）============
const manholeNodes = ref([
  { id: 'MH-001', x: 60, y: 85, status: 'ok' },
  { id: 'MH-002', x: 95, y: 88, status: 'ok' },
  { id: 'MH-003', x: 130, y: 90, status: 'alert' },
  { id: 'MH-004', x: 165, y: 92, status: 'ok' },
  { id: 'MH-005', x: 200, y: 94, status: 'ok' },
  { id: 'MH-006', x: 235, y: 96, status: 'off' },
  { id: 'MH-007', x: 270, y: 98, status: 'ok' },
  { id: 'MH-008', x: 305, y: 100, status: 'alert' },
  { id: 'MH-009', x: 340, y: 102, status: 'ok' },
  { id: 'MH-010', x: 375, y: 104, status: 'ok' },
  // 麓谷支线
  { id: 'MH-011', x: 140, y: 55, status: 'ok' },
  { id: 'MH-012', x: 138, y: 130, status: 'ok' },
])

// ============ SOS 应急柱状态 ============
const sosPillars = ref([
  { id: 'SOS-012', location: '先导路 · 麓谷段', status: 'online', battery: 94 },
  { id: 'SOS-018', location: '梅溪湖 · 节庆岛', status: 'calling', battery: 71 },
  { id: 'SOS-025', location: '橘子洲头 · 青年毛泽东雕像', status: 'offline', battery: 12 },
])

// ============ 应急响应时间线 ============
const sosTimeline = ref([
  { time: '14:22:08', level: 'danger', text: 'SOS-018 触发紧急求助' },
  { time: '14:22:15', level: 'warn', text: '后台自动派单至岳麓区 110 联动' },
  { time: '14:23:40', level: 'info', text: '调度员张工已接听并确认现场情况' },
  { time: '14:26:52', level: 'ok', text: '巡逻车已到达梅溪湖节庆岛' },
])

// ============ 安全事件表格 ============
const eventList = ref([
  { type: '井盖告警', location: '先导路 · 麓谷大道交叉', level: '紧急', time: '2026-10-27 09:14', status: '已处理' },
  { type: '人员闯入', location: '麓谷科技新城 · 地下车库入口', level: '重要', time: '2026-10-27 10:31', status: '已处理' },
  { type: '车辆违停', location: '梅溪湖 · 环湖路', level: '一般', time: '2026-10-27 11:05', status: '已处理' },
  { type: 'SOS 求助', location: '橘子洲头 · 游客中心', level: '紧急', time: '2026-10-27 14:22', status: '处理中' },
  { type: '垃圾满溢', location: '岳麓区 · 新民路公交站', level: '一般', time: '2026-10-27 15:40', status: '已处理' },
  { type: '井盖告警', location: '先导路 · 文轩路', level: '重要', time: '2026-10-27 16:18', status: '处理中' },
  { type: '翻越围栏', location: '麓谷产业园 · 西侧围墙', level: '重要', time: '2026-10-27 17:02', status: '已处理' },
])

const typeTag = (t) => {
  const m = { '井盖告警': 'danger', '人员闯入': 'warning', '车辆违停': 'info', 'SOS 求助': 'danger', '垃圾满溢': 'info', '翻越围栏': 'warning' }
  return m[t] || ''
}

const liveWarningFilledCount = computed(() => eventList.value.filter(e => e.status === '处理中').length)
</script>

<style scoped lang="scss">
.zg-security { padding: 20px; display: flex; flex-direction: column; gap: 16px; }

// ============ 头部 ============
.zg-security__head {
  display: flex; justify-content: space-between; align-items: center;
}
.zg-security__headline { display: flex; align-items: center; gap: 14px; }
.zg-security__sigil {
  width: 44px; height: 44px; border-radius: 10px;
  background: linear-gradient(135deg, var(--zg-brand-primary, #6366f1), var(--zg-brand-secondary, #a855f7));
  color: #fff; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
}
.zg-security__title { font-size: 20px; font-weight: 600; color: var(--zg-ink-primary, #1e293b); margin: 0 0 4px; }
.zg-security__sub { font-size: 13px; color: var(--zg-ink-tertiary, #94a3b8); margin: 0; }

.zg-security__alert-pulse {
  display: flex; align-items: center; gap: 8px; padding: 8px 14px;
  background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px;
}
.zg-pulse-badge__icon {
  width: 34px; height: 34px; border-radius: 50%;
  background: #fee2e2; color: #ef4444;
  display: flex; align-items: center; justify-content: center;
  animation: pulseWarningFilled 1.6s infinite;
}
.zg-pulse-badge__txt { font-size: 12px; color: #ef4444; font-weight: 600; }
@keyframes pulseWarningFilled {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.5); }
  50% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
}

// ============ KPI ============
.zg-kpi { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.zg-kpi__cell {
  background: var(--zg-surface-card, #fff); border: 1px solid var(--zg-line-soft, #f1f5f9);
  border-radius: 12px; padding: 14px 16px;
  display: flex; align-items: center; gap: 14px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}
.zg-kpi__icon {
  width: 42px; height: 42px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
}
.zg-kpi__body { display: flex; flex-direction: column; gap: 2px; flex: 1; }
.zg-kpi__num { font-size: 22px; font-weight: 700; color: var(--zg-ink-primary, #1e293b); }
.zg-kpi__lbl { font-size: 13px; color: var(--zg-ink-tertiary, #94a3b8); }
.zg-kpi__mini { font-size: 11px; color: #94a3b8; font-family: monospace; }

.zg-kpi__cell--ok .zg-kpi__icon { background: #dcfce7; color: var(--zg-success, #22c55e); }
.zg-kpi__cell--ok .zg-kpi__num { color: var(--zg-success, #22c55e); }
.zg-kpi__cell--info .zg-kpi__icon { background: #dbeafe; color: var(--zg-info, #3b82f6); }
.zg-kpi__cell--info .zg-kpi__num { color: var(--zg-info, #3b82f6); }
.zg-kpi__cell--warn .zg-kpi__icon { background: #fef3c7; color: var(--zg-warning, #f59e0b); }
.zg-kpi__cell--warn .zg-kpi__num { color: var(--zg-warning, #f59e0b); }
.zg-kpi__cell--danger .zg-kpi__icon { background: #fee2e2; color: var(--zg-danger, #ef4444); }
.zg-kpi__cell--danger .zg-kpi__num { color: var(--zg-danger, #ef4444); }

// ============ 中部三列 ============
.zg-security__triple { display: grid; grid-template-columns: 1.15fr 1fr 1fr; gap: 14px; }
.zg-security__panel {
  background: var(--zg-surface-card, #fff); border: 1px solid var(--zg-line-soft, #f1f5f9);
  border-radius: 12px; padding: 14px; display: flex; flex-direction: column; gap: 12px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}
.zg-security__panel--full { grid-column: 1 / -1; }
.zg-security__panel-head {
  display: flex; justify-content: space-between; align-items: center;
  strong { font-size: 14px; color: var(--zg-ink-primary, #1e293b); font-weight: 600; }
}

// ============ 井盖地图 ============
.zg-security__legend { display: flex; gap: 10px; font-size: 11px; color: #64748b; span { display: flex; align-items: center; gap: 4px; } }
.dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.dot-ok { background: var(--zg-success, #22c55e); box-shadow: 0 0 6px rgba(34, 197, 94, 0.6); }
.dot-off { background: #94a3b8; }
.dot-alert { background: var(--zg-danger, #ef4444); box-shadow: 0 0 6px rgba(239, 68, 68, 0.6); animation: blink 1.2s infinite; }

.zg-security__map { position: relative; border-radius: 10px; overflow: hidden; background: linear-gradient(180deg, #f8fafc, #f1f5f9); }
.zg-security__svg { width: 100%; height: 240px; display: block; }
.node { fill: var(--zg-success, #22c55e); transition: all 0.3s; }
.node--ok { fill: var(--zg-success, #22c55e); filter: drop-shadow(0 0 4px rgba(34, 197, 94, 0.7)); }
.node--off { fill: #94a3b8; filter: none; }
.node--alert { fill: var(--zg-danger, #ef4444); filter: drop-shadow(0 0 6px rgba(239, 68, 68, 0.9)); animation: blink 1s infinite; }
@keyframes blink { 0%, 100% { opacity: 1 } 50% { opacity: 0.4 } }

.zg-security__geo-tag {
  position: absolute; background: rgba(255,255,255,0.85); color: var(--zg-ink-primary, #1e293b);
  padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 500;
  backdrop-filter: blur(4px); border: 1px solid var(--zg-line-soft, #f1f5f9);
}
.geo-1 { top: 14px; left: 14px; }
.geo-2 { top: 70px; right: 14px; }
.geo-3 { bottom: 20px; left: 14px; }
.geo-4 { bottom: 20px; right: 14px; }

// ============ AI 视频 ============
.zg-live-tag { animation: blink 1.2s infinite; }
.zg-security__ai-video .zg-security__ai-scene { border-radius: 8px; overflow: hidden; position: relative; }
.zg-security__ai-video svg { width: 100%; display: block; }
.zg-security__ai-overlay {
  position: absolute; bottom: 6px; left: 6px; right: 6px;
  display: flex; justify-content: space-between;
  font-size: 11px; color: #fff; font-family: monospace;
  text-shadow: 0 1px 2px rgba(0,0,0,0.8);
}
.zg-security__ai-tags { display: flex; flex-direction: column; gap: 8px; }
.zg-security__ai-tag {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 12px; background: #f8fafc; border-radius: 8px;
  font-size: 12px; color: var(--zg-ink-primary, #1e293b);
  border-left: 3px solid var(--zg-brand-primary, #6366f1);
}
.zg-security__ai-tag .el-icon { color: var(--zg-brand-primary, #6366f1); }

// ============ SOS 应急 ============
.zg-security__sos-status { display: flex; flex-direction: column; gap: 8px; }
.zg-sos-mini { display: flex; align-items: center; gap: 10px; padding: 10px; background: #f8fafc; border-radius: 8px; }
.zg-sos-mini__dot { width: 10px; height: 10px; border-radius: 50%; background: #cbd5e1; }
.zg-sos-mini__dot.on { background: var(--zg-success, #22c55e); box-shadow: 0 0 6px rgba(34, 197, 94, 0.7); }
.zg-sos-mini__dot.alert { background: var(--zg-danger, #ef4444); box-shadow: 0 0 6px rgba(239, 68, 68, 0.8); animation: blink 0.8s infinite; }
.zg-sos-mini__info { flex: 1; }
.zg-sos-mini__name { font-size: 13px; color: var(--zg-ink-primary, #1e293b); font-weight: 500; }
.zg-sos-mini__sub { display: flex; justify-content: space-between; font-size: 11px; color: #64748b; margin-top: 2px; }
.zg-sos-mini__sub .ok { color: var(--zg-success, #22c55e); }
.zg-sos-mini__sub .danger { color: var(--zg-danger, #ef4444); }
.zg-sos-mini__sub .off { color: #94a3b8; }

// ============ 时间线 ============
.zg-security__tl-title { margin: 4px 0 8px; font-size: 13px; font-weight: 600; color: var(--zg-ink-primary, #1e293b); }
.zg-security__tl-item {
  display: flex; align-items: flex-start; gap: 10px; padding: 6px 0;
  border-bottom: 1px dashed var(--zg-line-soft, #f1f5f9);
}
.zg-security__tl-item:last-child { border-bottom: none; }
.zg-security__tl-time { font-size: 11px; font-family: monospace; color: #94a3b8; min-width: 56px; }
.zg-security__tl-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 5px; flex-shrink: 0; }
.zg-security__tl-dot.danger { background: var(--zg-danger, #ef4444); }
.zg-security__tl-dot.warn { background: var(--zg-warning, #f59e0b); }
.zg-security__tl-dot.info { background: var(--zg-info, #3b82f6); }
.zg-security__tl-dot.ok { background: var(--zg-success, #22c55e); }
.zg-security__tl-copy { font-size: 12px; color: var(--zg-ink-primary, #1e293b); }

// ============ 响应式 ============
@media (max-width: 1280px) {
  .zg-kpi { grid-template-columns: repeat(2, 1fr); }
  .zg-security__triple { grid-template-columns: 1fr 1fr; }
}
</style>
