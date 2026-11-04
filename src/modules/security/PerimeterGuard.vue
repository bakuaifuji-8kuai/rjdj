<!--
  智光云枢 · 安防中心 · AI 视频周界防护
  业务域：security
  功能：多宫格视频墙 + 实时识别事件流 + AI 识别类型统计 + 识别规则配置
        覆盖麓谷产业园 / 先导路主干道 / 梅溪湖环湖路
-->
<template>
  <section class="zg-perimeter">
    <header class="zg-perimeter__head">
      <div class="zg-perimeter__headline">
        <div class="zg-perimeter__sigil">
          <el-icon :size="22"><VideoCamera /></el-icon>
        </div>
        <div class="zg-perimeter__copy">
          <h1 class="zg-perimeter__title">AI 视频周界 · 智能安防</h1>
          <p class="zg-perimeter__sub">
            麓谷产业园 · 先导路主干道 · 梅溪湖环湖路 · 园区周界全覆盖
          </p>
        </div>
      </div>
      <div class="zg-perimeter__head-actions">
        <el-button type="primary" :icon="Cpu">AI 引擎 v2.4</el-button>
      </div>
    </header>

    <!-- ============ KPI ============ -->
    <div class="zg-kpi">
      <div class="zg-kpi__cell">
        <div class="zg-kpi__icon"><el-icon :size="20"><VideoCamera /></el-icon></div>
        <div class="zg-kpi__body">
          <div class="zg-kpi__num">384</div>
          <div class="zg-kpi__lbl">接入摄像头</div>
        </div>
      </div>
      <div class="zg-kpi__cell zg-kpi__cell--ok">
        <div class="zg-kpi__icon"><el-icon :size="20"><CircleCheck /></el-icon></div>
        <div class="zg-kpi__body">
          <div class="zg-kpi__num">378</div>
          <div class="zg-kpi__lbl">活跃画面</div>
          <el-progress :percentage="98" :stroke-width="6" :show-text="false" status="success" />
        </div>
      </div>
      <div class="zg-kpi__cell zg-kpi__cell--danger">
        <div class="zg-kpi__icon"><el-icon :size="20"><Warning /></el-icon></div>
        <div class="zg-kpi__body">
          <div class="zg-kpi__num">46</div>
          <div class="zg-kpi__lbl">今日识别事件</div>
        </div>
      </div>
      <div class="zg-kpi__cell zg-kpi__cell--info">
        <div class="zg-kpi__icon"><el-icon :size="20"><Monitor /></el-icon></div>
        <div class="zg-kpi__body">
          <div class="zg-kpi__num">98.4%</div>
          <div class="zg-kpi__lbl">在线率</div>
        </div>
      </div>
    </div>

    <!-- ============ 主体 ============ -->
    <div class="zg-perimeter__main">
      <!-- 左：视频墙 + 统计 -->
      <div class="zg-perimeter__left">
        <!-- 视频墙 -->
        <div class="zg-perimeter__panel">
          <div class="zg-perimeter__panel-head">
            <strong>🎬 多宫格视频墙 · 实时画面</strong>
            <el-tag type="danger" size="small" effect="dark">● LIVE · AI 分析中</el-tag>
          </div>
          <div class="zg-perimeter__wall">
            <div
              v-for="cam in cameraWall"
              :key="cam.id"
              class="zg-perimeter__cell"
              :class="{ 'zg-perimeter__cell--off': cam.online === false }"
              @click="openCamDetail(cam)"
            >
              <div class="zg-perimeter__scene">
                <!-- SVG 占位：模拟监控画面 -->
                <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice">
                  <rect width="200" height="120" fill="#1e293b" />
                  <polygon points="0,90 200,90 170,120 30,120" fill="#334155" />
                  <rect x="10" y="30" width="30" height="60" fill="#475569" />
                  <rect x="55" y="20" width="40" height="70" fill="#475569" />
                  <rect x="105" y="35" width="30" height="55" fill="#475569" />
                  <rect x="145" y="25" width="45" height="65" fill="#475569" />
                  <circle cx="90" cy="85" r="3" fill="#22c55e" />
                  <rect x="85" y="78" width="10" height="14" fill="#22c55e" />
                  <rect x="130" y="92" width="22" height="10" fill="#60a5fa" rx="2" />
                </svg>
                <!-- AI 检测框 -->
                <div v-if="cam.detectType" class="zg-perimeter__bbox" :class="'bbox-' + cam.detectType">
                  <span>{{ cam.detectTypeLabel }}</span>
                </div>
                <div v-if="cam.online === false" class="zg-perimeter__off-mask">
                  <el-icon :size="24" color="#94a3b8"><VideoPause /></el-icon>
                  <span>离线</span>
                </div>
              </div>
              <div class="zg-perimeter__cell-info">
                <div class="zg-perimeter__cell-top">
                  <span class="zg-perimeter__cam-name">{{ cam.id }} · {{ cam.name }}</span>
                  <span class="zg-perimeter__live-dot" :class="{ on: cam.online }"></span>
                </div>
                <div class="zg-perimeter__cell-bottom">
                  <el-tag v-for="(t, i) in cam.tags" :key="i" size="small" :type="tagType(t)" effect="plain">{{ t }}</el-tag>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- AI 识别类型统计 -->
        <div class="zg-perimeter__panel">
          <div class="zg-perimeter__panel-head">
            <strong>📊 AI 识别类型统计 · 今日</strong>
          </div>
          <div class="zg-perimeter__stats">
            <div v-for="s in aiStats" :key="s.type" class="zg-perimeter__stat-bar">
              <div class="zg-perimeter__stat-lbl">
                <el-icon :size="14" :color="s.color"><component :is="s.icon" /></el-icon>
                <span>{{ s.type }}</span>
              </div>
              <div class="zg-perimeter__stat-track">
                <div class="zg-perimeter__stat-fill" :style="{ width: (s.count / maxStatCount * 100) + '%', background: s.color }"></div>
              </div>
              <div class="zg-perimeter__stat-num" :style="{ color: s.color }">{{ s.count }}</div>
            </div>
          </div>
        </div>

        <!-- Tab: 识别规则配置 -->
        <div class="zg-perimeter__panel">
          <div class="zg-perimeter__panel-head">
            <strong>⚙️ 识别规则配置</strong>
            <el-button link type="primary">重置默认</el-button>
          </div>
          <div class="zg-perimeter__rules">
            <div v-for="rule in rules" :key="rule.key" class="zg-perimeter__rule">
              <div class="zg-perimeter__rule-info">
                <div class="zg-perimeter__rule-name">{{ rule.name }}</div>
                <div class="zg-perimeter__rule-desc">{{ rule.desc }}</div>
              </div>
              <el-switch v-model="rule.enabled" size="default" />
              <el-slider
                v-model="rule.sensitivity"
                :min="1" :max="10" :show-tooltip="false"
                style="width: 160px"
                :disabled="!rule.enabled"
              />
              <span class="zg-perimeter__rule-sens">{{ sensitivityLabel(rule.sensitivity) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右：实时事件流 -->
      <div class="zg-perimeter__right">
        <div class="zg-perimeter__panel zg-perimeter__panel--event">
          <div class="zg-perimeter__panel-head">
            <strong>📡 实时识别事件流</strong>
            <el-badge :value="eventStream.length" type="danger" class="zg-event-badge">
              <el-icon :size="16" color="#ef4444"><Warning /></el-icon>
            </el-badge>
          </div>
          <div class="zg-perimeter__event-list">
            <div v-for="(e, i) in eventStream" :key="i" class="zg-perimeter__event-item">
              <div class="zg-perimeter__event-time">{{ e.time }}</div>
              <div class="zg-perimeter__event-body">
                <div class="zg-perimeter__event-title">
                  <el-tag :type="eventTagType(e.type)" size="small" effect="dark">{{ e.type }}</el-tag>
                  <span class="zg-perimeter__event-cam">{{ e.camera }}</span>
                </div>
                <div class="zg-perimeter__event-conf">
                  置信度 <el-progress :percentage="e.confidence" :stroke-width="6" :show-text="false" style="flex: 1; margin: 0 8px" :color="confColor(e.confidence)" />
                  <strong :style="{ color: confColor(e.confidence) }">{{ e.confidence }}%</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ============ 摄像头详情 Drawer ============ -->
    <el-drawer v-model="camDetailVisible" :title="focusCam?.id + ' · ' + focusCam?.name" size="480px">
      <div v-if="focusCam" class="zg-perimeter__cam-detail">
        <div class="zg-perimeter__cam-status">
          <span :class="focusCam.online ? 'ok' : 'off'">
            {{ focusCam.online ? '● 在线运行' : '○ 离线' }}
          </span>
          <span>{{ focusCam.location }}</span>
        </div>
        <section class="zg-perimeter__cam-sec">
          <h4>📷 摄像头规格</h4>
          <div class="zg-perimeter__cam-grid">
            <div class="zg-perimeter__cam-cell"><span class="lbl">分辨率</span><span class="val">{{ focusCam.resolution }}</span></div>
            <div class="zg-perimeter__cam-cell"><span class="lbl">帧率</span><span class="val">25 FPS</span></div>
            <div class="zg-perimeter__cam-cell"><span class="lbl">编码</span><span class="val">H.265</span></div>
            <div class="zg-perimeter__cam-cell"><span class="lbl">IP</span><span class="val">{{ focusCam.ip }}</span></div>
          </div>
        </section>
        <section class="zg-perimeter__cam-sec">
          <h4>🔍 已启用 AI 规则</h4>
          <div class="zg-perimeter__cam-tags">
            <el-tag v-for="t in focusCam.tags" :key="t" :type="tagType(t)">{{ t }}</el-tag>
          </div>
        </section>
      </div>
    </el-drawer>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  VideoCamera, Cpu, CircleCheck, Warning, Monitor, VideoPause,
  User, Van, Box, MoreFilled
} from '@element-plus/icons-vue'

const camDetailVisible = ref(false)
const focusCam = ref(null)

// 6 宫格摄像头墙数据
const cameraWall = ref([
  { id: 'CAM-K12', name: '先导路·麓谷大道东', location: '先导路麓谷大道路口', resolution: '1920×1080', ip: '10.0.12.112', online: true, detectType: 'person', detectTypeLabel: 'PERSON', tags: ['人员闯入', '车辆违停'] },
  { id: 'CAM-K18', name: '先导路·文轩路口', location: '先导路文轩路交叉口', resolution: '1920×1080', ip: '10.0.12.118', online: true, detectType: 'vehicle', detectTypeLabel: 'VEHICLE', tags: ['车辆违停', '人员闯入'] },
  { id: 'CAM-K24', name: '麓谷产业园·西门', location: '麓谷产业园西门围墙外侧', resolution: '2560×1440', ip: '10.0.13.24', online: true, detectType: 'intrusion', detectTypeLabel: 'INTRUSION', tags: ['翻越围栏', '人员闯入'] },
  { id: 'CAM-K31', name: '梅溪湖·环湖路北', location: '梅溪湖环湖路东段', resolution: '1920×1080', ip: '10.0.14.31', online: true, detectType: null, detectTypeLabel: null, tags: ['人员闯入'] },
  { id: 'CAM-K37', name: '麓谷科技新城·地下车库', location: '麓谷科技新城地下车库入口', resolution: '1920×1080', ip: '10.0.15.37', online: false, detectType: null, detectTypeLabel: null, tags: ['车辆违停', '物品遗留'] },
  { id: 'CAM-K45', name: '橘子洲头·北入口', location: '橘子洲头景区北入口', resolution: '1920×1080', ip: '10.0.16.45', online: true, detectType: 'person', detectTypeLabel: 'PERSON', tags: ['人员闯入'] },
])

// AI 统计
const aiStats = ref([
  { type: '人员闯入', count: 18, color: '#ef4444', icon: User },
  { type: '车辆违停', count: 14, color: '#f59e0b', icon: Van },
  { type: '物品遗留', count: 8, color: '#6366f1', icon: Box },
  { type: '翻越围栏', count: 6, color: '#22c55e', icon: MoreFilled },
])
const maxStatCount = computed(() => Math.max(...aiStats.value.map(s => s.count)))

// 实时事件流
const eventStream = ref([
  { time: '18:02:14', type: '人员闯入', camera: 'CAM-K24 · 麓谷产业园西门', confidence: 96 },
  { time: '18:01:58', type: '车辆违停', camera: 'CAM-K18 · 先导路·文轩路口', confidence: 88 },
  { time: '18:00:42', type: '物品遗留', camera: 'CAM-K31 · 梅溪湖·环湖路北', confidence: 71 },
  { time: '17:58:30', type: '翻越围栏', camera: 'CAM-K24 · 麓谷产业园西门', confidence: 92 },
  { time: '17:55:16', type: '人员闯入', camera: 'CAM-K45 · 橘子洲头·北入口', confidence: 85 },
  { time: '17:52:05', type: '车辆违停', camera: 'CAM-K12 · 先导路·麓谷大道东', confidence: 82 },
  { time: '17:48:47', type: '物品遗留', camera: 'CAM-K31 · 梅溪湖·环湖路北', confidence: 65 },
  { time: '17:44:12', type: '人员闯入', camera: 'CAM-K24 · 麓谷产业园西门', confidence: 94 },
])

// 识别规则
const rules = ref([
  { key: 'person', name: '人员闯入检测', desc: '周界警戒区域内识别到人形目标', enabled: true, sensitivity: 7 },
  { key: 'vehicle', name: '车辆违停检测', desc: '禁停区域内车辆停留超过 30 秒', enabled: true, sensitivity: 8 },
  { key: 'baggage', name: '物品遗留检测', desc: '静止物体在警戒区域内停留超过 3 分钟', enabled: true, sensitivity: 5 },
  { key: 'fence', name: '翻越围栏检测', desc: '检测到攀越围栏行为', enabled: true, sensitivity: 9 },
  { key: 'fire', name: '烟雾火焰检测', desc: '画面中出现烟雾或火焰特征', enabled: false, sensitivity: 6 },
  { key: 'fight', name: '打架斗殴检测', desc: '多人肢体冲突行为识别', enabled: false, sensitivity: 7 },
])

const openCamDetail = (c) => { focusCam.value = c; camDetailVisible.value = true }
const tagType = (t) => {
  const m = { '人员闯入': 'danger', '车辆违停': 'warning', '物品遗留': 'info', '翻越围栏': 'success', '烟雾火焰': 'danger', '打架斗殴': 'danger' }
  return m[t] || ''
}
const eventTagType = (t) => tagType(t)
const confColor = (c) => c >= 90 ? '#22c55e' : c >= 75 ? '#6366f1' : '#f59e0b'
const sensitivityLabel = (v) => v <= 3 ? '低' : v <= 7 ? '中' : '高'
</script>

<style scoped lang="scss">
.zg-perimeter { padding: 20px; display: flex; flex-direction: column; gap: 16px; }

// 头部
.zg-perimeter__head { display: flex; justify-content: space-between; align-items: center; }
.zg-perimeter__headline { display: flex; align-items: center; gap: 14px; }
.zg-perimeter__sigil {
  width: 44px; height: 44px; border-radius: 10px;
  background: linear-gradient(135deg, var(--zg-brand-primary, #6366f1), var(--zg-brand-secondary, #a855f7));
    color: #fff; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
}
.zg-perimeter__title { font-size: 20px; font-weight: 600; color: var(--zg-ink-primary, #1e293b); margin: 0 0 4px; }
.zg-perimeter__sub { font-size: 13px; color: var(--zg-ink-tertiary, #94a3b8); margin: 0; }

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
.zg-kpi__cell--info .zg-kpi__icon { background: #dbeafe; color: var(--zg-info, #3b82f6); }
.zg-kpi__cell--info .zg-kpi__num { color: var(--zg-info, #3b82f6); }

// ============ 主体 ============
.zg-perimeter__main { display: grid; grid-template-columns: 1.6fr 1fr; gap: 14px; }
.zg-perimeter__left { display: flex; flex-direction: column; gap: 14px; }

.zg-perimeter__panel {
  background: #fff; border: 1px solid var(--zg-line-soft, #f1f5f9);
  border-radius: 12px; padding: 14px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}
.zg-perimeter__panel-head {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;
  strong { font-size: 14px; color: var(--zg-ink-primary, #1e293b); font-weight: 600; }
}

// ============ 视频墙 ============
.zg-perimeter__wall { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.zg-perimeter__cell {
  background: #0f172a; border-radius: 10px; overflow: hidden;
  border: 1px solid #334155; cursor: pointer;
  transition: all 0.2s; display: flex; flex-direction: column;
}
.zg-perimeter__cell:hover { border-color: var(--zg-brand-primary, #6366f1); box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.3); }
.zg-perimeter__cell--off { opacity: 0.5; }
.zg-perimeter__scene { position: relative; flex: 1; min-height: 120px; }
.zg-perimeter__scene svg { width: 100%; height: 100%; display: block; }

.zg-perimeter__bbox {
  position: absolute; border: 2px solid #22c55e; border-radius: 2px;
  top: 40%; left: 40%; width: 26%; height: 38%;
  &.bbox-vehicle { border-color: #f59e0b; top: 60%; width: 32%; height: 20%; left: 45%; }
  &.bbox-intrusion { border-color: #ef4444; border-style: dashed; animation: blink 0.8s infinite; }
  span {
    position: absolute; top: -22px; left: -2px;
    background: #22c55e; color: #fff; font-size: 10px; font-family: monospace;
    padding: 2px 6px; border-radius: 2px;
  }
}
@keyframes blink { 0%, 100% { opacity: 1 } 50% { opacity: 0.5 } }

.zg-perimeter__off-mask {
  position: absolute; inset: 0; background: rgba(15, 23, 42, 0.85);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  color: #94a3b8; gap: 4px; font-size: 12px;
}

.zg-perimeter__cell-info { padding: 8px 10px; background: #0f172a; color: #fff; display: flex; flex-direction: column; gap: 6px; }
.zg-perimeter__cell-top { display: flex; justify-content: space-between; align-items: center; }
.zg-perimeter__cam-name { font-size: 12px; font-family: monospace; color: #e2e8f0; }
.zg-perimeter__live-dot { width: 8px; height: 8px; border-radius: 50%; background: #475569; }
.zg-perimeter__live-dot.on { background: #22c55e; box-shadow: 0 0 6px rgba(34, 197, 94, 0.7); animation: blink 1.2s infinite; }
.zg-perimeter__cell-bottom { display: flex; gap: 4px; flex-wrap: wrap; }

// ============ 统计条形图 ============
.zg-perimeter__stats { display: flex; flex-direction: column; gap: 10px; }
.zg-perimeter__stat-bar { display: flex; align-items: center; gap: 10px; }
.zg-perimeter__stat-lbl { display: flex; align-items: center; gap: 4px; width: 90px; font-size: 12px; color: var(--zg-ink-primary, #1e293b); }
.zg-perimeter__stat-track { flex: 1; height: 12px; background: #f1f5f9; border-radius: 6px; overflow: hidden; }
.zg-perimeter__stat-fill { height: 100%; border-radius: 6px; transition: width 0.4s; }
.zg-perimeter__stat-num { width: 40px; font-size: 14px; font-weight: 700; text-align: right; font-family: monospace; }

// ============ 规则配置 ============
.zg-perimeter__rules { display: flex; flex-direction: column; gap: 10px; }
.zg-perimeter__rule {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 12px; background: #f8fafc; border-radius: 8px;
}
.zg-perimeter__rule-info { flex: 1; min-width: 0; }
.zg-perimeter__rule-name { font-size: 13px; font-weight: 500; color: var(--zg-ink-primary, #1e293b); }
.zg-perimeter__rule-desc { font-size: 11px; color: #94a3b8; margin-top: 2px; }
.zg-perimeter__rule-sens { width: 36px; font-size: 12px; color: var(--zg-brand-primary, #6366f1); font-weight: 600; text-align: center; }

// ============ 事件流 ============
.zg-perimeter__right { display: flex; flex-direction: column; gap: 14px; }
.zg-perimeter__panel--event { height: calc(100vh - 180px); max-height: 760px; display: flex; flex-direction: column; }
.zg-event-badge { display: flex; }
.zg-perimeter__event-list { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; }
.zg-perimeter__event-item {
  display: flex; gap: 10px; padding: 10px 12px;
  background: linear-gradient(90deg, #fff, #f8fafc);
  border: 1px solid var(--zg-line-soft, #f1f5f9); border-radius: 10px;
  border-left: 3px solid var(--zg-brand-primary, #6366f1);
  transition: all 0.2s;
}
.zg-perimeter__event-item:hover { transform: translateX(2px); box-shadow: 0 2px 8px rgba(99, 102, 241, 0.15); }
.zg-perimeter__event-time { font-family: monospace; font-size: 11px; color: #94a3b8; min-width: 54px; padding-top: 2px; }
.zg-perimeter__event-body { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.zg-perimeter__event-title { display: flex; align-items: center; gap: 8px; }
.zg-perimeter__event-cam { font-size: 12px; color: var(--zg-ink-primary, #1e293b); }
.zg-perimeter__event-conf { display: flex; align-items: center; font-size: 11px; color: #94a3b8; }

// ============ Drawer ============
.zg-perimeter__cam-detail { display: flex; flex-direction: column; gap: 16px; }
.zg-perimeter__cam-status { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: #eef2ff; border-radius: 8px; font-size: 13px; color: var(--zg-ink-primary, #1e293b); }
.zg-perimeter__cam-status .ok { color: var(--zg-success, #22c55e); font-weight: 600; }
.zg-perimeter__cam-status .off { color: var(--zg-danger, #ef4444); font-weight: 600; }
.zg-perimeter__cam-sec h4 { margin: 0 0 10px; font-size: 13px; font-weight: 600; color: var(--zg-ink-primary, #1e293b); padding-left: 8px; border-left: 3px solid var(--zg-brand-primary, #6366f1); }
.zg-perimeter__cam-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.zg-perimeter__cam-cell { background: #f8fafc; border-radius: 8px; padding: 10px 12px; display: flex; flex-direction: column; gap: 2px; }
.zg-perimeter__cam-cell .lbl { font-size: 11px; color: #94a3b8; }
.zg-perimeter__cam-cell .val { font-size: 14px; font-weight: 600; color: var(--zg-ink-primary, #1e293b); font-family: monospace; }
.zg-perimeter__cam-tags { display: flex; gap: 6px; flex-wrap: wrap; }

@media (max-width: 1280px) {
  .zg-kpi { grid-template-columns: repeat(2, 1fr); }
  .zg-perimeter__main { grid-template-columns: 1fr; }
}</style>
