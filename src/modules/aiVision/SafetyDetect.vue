<!--
  SafetyDetect.vue — 配电箱/杆身安全检测（全新）
  3 子场景：配电箱异常 + 杆身裂痕/配件丢失 + 区域入侵
-->
<template>
  <section class="zg-sd-detect">
    <header class="zg-sd-head">
      <div class="zg-sd-head__sigil"><el-icon :size="22"><Lock /></el-icon></div>
      <div class="zg-sd-head__copy">
        <h1 class="zg-sd-head__title">安全检测 · 配电箱 / 杆身 / 区域入侵</h1>
        <p class="zg-sd-head__sub">3 合 1 场景 · 智能安防 · 自动派工 + SOS 喊话联动</p>
      </div>
      <div class="zg-sd-head__alert" v-if="smokeAlert">
        <span class="zg-sd-pulse"></span>🔥 高危：麓谷产业园配电箱冒烟
      </div>
    </header>

    <!-- 3 个子场景 KPI 组 -->
    <div class="zg-sd-kpis">
      <!-- 场景 A：配电箱 -->
      <div class="zg-sd-kpi-block">
        <div class="zg-sd-kpi-block__title">🧰 配电箱异常</div>
        <div class="zg-sd-kpi-row">
          <div v-for="k in cabinetKpis" :key="k.label" class="zg-sd-kpi-tile">
            <div class="zg-sd-kpi-tile__num" :style="{ color: k.color }" :class="{ pulse: k.pulse }">{{ k.value }}</div>
            <div class="zg-sd-kpi-tile__lbl">{{ k.label }}</div>
          </div>
        </div>
      </div>
      <!-- 场景 B：杆身 -->
      <div class="zg-sd-kpi-block">
        <div class="zg-sd-kpi-block__title">🔩 杆身裂痕 / 配件丢失</div>
        <div class="zg-sd-kpi-row">
          <div v-for="k in poleKpis" :key="k.label" class="zg-sd-kpi-tile">
            <div class="zg-sd-kpi-tile__num" :style="{ color: k.color }">{{ k.value }}</div>
            <div class="zg-sd-kpi-tile__lbl">{{ k.label }}</div>
          </div>
        </div>
      </div>
      <!-- 场景 C：入侵 -->
      <div class="zg-sd-kpi-block">
        <div class="zg-sd-kpi-block__title">🚪 区域入侵（夜间）</div>
        <div class="zg-sd-kpi-row">
          <div v-for="k in intrudeKpis" :key="k.label" class="zg-sd-kpi-tile">
            <div class="zg-sd-kpi-tile__num" :style="{ color: k.color }">{{ k.value }}</div>
            <div class="zg-sd-kpi-tile__lbl">{{ k.label }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主视图：el-tabs 三 Tab -->
    <div class="zg-sd-tabs">
      <el-tabs v-model="tab">
        <!-- Tab 1 配电箱 -->
        <el-tab-pane label="🧰 配电箱异常" name="cabinet">
          <div class="zg-sd-tab-main">
            <div class="zg-sd-scene" :style="cabinetScene.bg">
              <svg class="zg-sd-svg" viewBox="0 0 400 300" preserveAspectRatio="none">
                <!-- 配电箱主体 -->
                <rect x="130" y="80" width="140" height="180" fill="#475569" stroke="#1e293b" stroke-width="3" rx="4" />
                <rect x="140" y="90" width="60" height="80" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
                <!-- 门打开 -->
                <g transform="translate(200, 80)">
                  <rect x="0" y="0" width="70" height="170" fill="#64748b" stroke="#334155" stroke-width="2" rx="3" transform="skewY(-20)" />
                  <text x="30" y="90" fill="#fff" font-size="10" text-anchor="middle" transform="skewY(20)">门已打开</text>
                </g>
                <!-- 冒烟 -->
                <ellipse cx="200" cy="60" rx="60" ry="18" fill="rgba(251,146,60,0.55)" />
                <ellipse cx="180" cy="45" rx="40" ry="14" fill="rgba(251,146,60,0.45)" />
                <!-- 检测框 -->
                <rect x="125" y="75" width="150" height="195" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="6,3" rx="2" />
              </svg>
              <div class="zg-sd-scene__lbl">
                <div>
                  <el-tag type="danger" effect="dark" size="small" class="zg-sd-badget">⚠️ 箱体被撬 + 冒烟</el-tag>
                  <span class="zg-sd-scene__name">麓谷产业园 A 区配电箱 B-08</span>
                </div>
                <span>置信度 99% · 2 分钟前</span>
              </div>
            </div>
            <div class="zg-sd-actions">
              <div class="zg-sd-action-card danger">
                <div class="zg-sd-action-card__badge">🔥 高危告警</div>
                <div class="zg-sd-action-card__title">箱体冒烟</div>
                <div class="zg-sd-action-card__desc">已自动派工单 WO-20261029-0042 给维保张工</div>
                <div class="zg-sd-action-card__time">2 分钟前 · 麓谷产业园 A 区</div>
                <el-button type="danger" size="small" class="zg-sd-action-card__btn">查看工单详情</el-button>
              </div>
              <div class="zg-sd-action-card">
                <div class="zg-sd-action-card__badge warn">⚠️ 中危告警</div>
                <div class="zg-sd-action-card__title">箱体门被撬开</div>
                <div class="zg-sd-action-card__desc">AI 识别门与闭合状态不符，可能被撬或维修未关</div>
                <el-button type="warning" size="small" plain class="zg-sd-action-card__btn">派遣安防岗</el-button>
              </div>
              <div class="zg-sd-action-card">
                <div class="zg-sd-action-card__badge info">🐾 小动物入侵</div>
                <div class="zg-sd-action-card__title">发现野猫进入箱体</div>
                <div class="zg-sd-action-card__desc">存在拉弧风险 · 建议清理</div>
                <el-button size="small" plain class="zg-sd-action-card__btn">通知运维</el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- Tab 2 杆身 -->
        <el-tab-pane label="🔩 杆身裂痕 / 配件丢失" name="pole">
          <div class="zg-sd-tab-main">
            <div class="zg-sd-scene" :style="poleScene.bg">
              <svg class="zg-sd-svg" viewBox="0 0 400 300" preserveAspectRatio="none">
                <!-- 地面 -->
                <rect x="0" y="260" width="400" height="40" fill="#1e293b" />
                <!-- 杆身 -->
                <rect x="188" y="40" width="24" height="220" fill="#64748b" stroke="#334155" stroke-width="1.5" />
                <!-- 法兰 -->
                <rect x="170" y="250" width="60" height="16" fill="#334155" />
                <circle cx="176" cy="258" r="3" fill="#1e293b" />
                <circle cx="224" cy="258" r="3" fill="#ef4444" />
                <text x="230" y="260" fill="#ef4444" font-size="10" font-weight="700">螺栓缺失</text>
                <!-- 杆身裂纹（红色曲线） -->
                <path d="M192,100 Q196,120 190,140 Q186,160 194,180 Q200,200 192,220" fill="none" stroke="#ef4444" stroke-width="2.5" />
                <text x="208" y="150" fill="#ef4444" font-size="10" font-weight="600">裂纹 32cm</text>
                <!-- 检测框 -->
                <rect x="172" y="35" width="60" height="235" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="6,3" rx="2" />
              </svg>
              <div class="zg-sd-scene__lbl">
                <div>
                  <el-tag type="danger" effect="dark" size="small">⚠️ 杆身裂纹 + 法兰螺栓缺失</el-tag>
                  <span class="zg-sd-scene__name">先导路 #12</span>
                </div>
                <span>置信度 93% · 5 分钟前</span>
              </div>
            </div>
            <div class="zg-sd-detail-list">
              <div class="zg-sd-detail-card" v-for="d in poleDetails" :key="d.id">
                <div class="zg-sd-detail-card__head">
                  <span class="zg-sd-detail-card__type" :style="{ color: d.color }">{{ d.type }}</span>
                  <el-tag size="small" :type="d.tagType">{{ d.severity }}</el-tag>
                </div>
                <div class="zg-sd-detail-card__body">
                  <div>📍 {{ d.loc }}</div>
                  <div>🕒 {{ d.time }}</div>
                  <div>📏 {{ d.measure }}</div>
                </div>
                <el-button size="small" type="primary" plain>派工处理</el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- Tab 3 入侵 -->
        <el-tab-pane label="🚪 区域入侵（夜间红外）" name="intrude">
          <div class="zg-sd-tab-main">
            <div class="zg-sd-scene" :style="{ background: 'linear-gradient(180deg, #0a0a0a 0%, #1c1917 100%)' }">
              <svg class="zg-sd-svg" viewBox="0 0 400 300" preserveAspectRatio="none">
                <!-- 红外纹理背景 -->
                <defs>
                  <pattern id="irgrid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M40,0 L0,0 L0,40" fill="none" stroke="rgba(239,68,68,0.08)" stroke-width="0.5" />
                  </pattern>
                </defs>
                <rect x="0" y="0" width="400" height="300" fill="url(#irgrid)" />
                <!-- 围栏线 -->
                <line x1="30" y1="240" x2="370" y2="240" stroke="#ef4444" stroke-width="1" stroke-dasharray="5,3" opacity="0.5" />
                <text x="330" y="236" fill="#ef4444" font-size="9" opacity="0.6">围栏警戒线</text>
                <!-- 人形轮廓（红外风格·发光） -->
                <circle cx="200" cy="100" r="15" fill="rgba(239,68,68,0.8)" />
                <path d="M200,115 L200,180 M200,125 L175,160 M200,125 L225,160 M200,180 L185,225 M200,180 L215,225" stroke="#ef4444" stroke-width="4" fill="none" />
                <!-- 热成像光晕 -->
                <ellipse cx="200" cy="160" rx="60" ry="50" fill="rgba(239,68,68,0.15)" />
                <!-- 人形框 -->
                <rect x="150" y="80" width="100" height="170" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="6,3" rx="2" />
                <!-- SOS 喇叭位置 -->
                <rect x="340" y="120" width="20" height="30" fill="#475569" stroke="#94a3b8" stroke-width="1" />
                <text x="348" y="115" fill="#22c55e" font-size="8">SOS 柱</text>
                <!-- 时间戳 -->
                <text x="10" y="20" fill="#22c55e" font-size="10" font-family="monospace">2026-10-29 03:14:27</text>
              </svg>
              <div class="zg-sd-scene__lbl">
                <div>
                  <el-tag type="danger" effect="dark" size="small">⚠️ 夜间人员入侵 · 已过围栏</el-tag>
                  <span class="zg-sd-scene__name">麓谷产业园 C 区箱变围栏</span>
                </div>
                <span>置信度 96% · 3 分钟前</span>
              </div>
            </div>
            <div class="zg-sd-intrude-actions">
              <div class="zg-sd-intrude-card">
                <div class="zg-sd-intrude-card__icon">🔊</div>
                <div>
                  <div class="zg-sd-intrude-card__title">联动 SOS 柱喇叭</div>
                  <div class="zg-sd-intrude-card__desc">自动循环喊话："您已进入高压危险区域，请立即离开"</div>
                  <el-tag type="success" size="small">已执行</el-tag>
                </div>
              </div>
              <div class="zg-sd-intrude-card">
                <div class="zg-sd-intrude-card__icon">📞</div>
                <div>
                  <div class="zg-sd-intrude-card__title">自动派安防岗工单</div>
                  <div class="zg-sd-intrude-card__desc">WO-20261029-0043 · 已派遣最近的安防人员（距离 1.2km）</div>
                  <el-tag type="success" size="small">已派单</el-tag>
                </div>
              </div>
              <div class="zg-sd-intrude-card">
                <div class="zg-sd-intrude-card__icon">📸</div>
                <div>
                  <div class="zg-sd-intrude-card__title">告警截图已留存</div>
                  <div class="zg-sd-intrude-card__desc">2 张红外截图 + 15s 视频片段 · 归档号 INT-20261029-03</div>
                  <el-button link type="primary" size="small">查看</el-button>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 底部：综合告警列表 -->
    <div class="zg-sd-bottom">
      <div class="zg-sd-bottom__head">
        <span class="zg-sd-bottom__title">今日安全告警汇总（{{ allAlerts.length }} 条）</span>
        <el-tag type="danger">高危 2</el-tag>
        <el-tag type="warning">中危 5</el-tag>
      </div>
      <el-table :data="allAlerts" stripe border>
        <el-table-column prop="time" label="时间" width="80" />
        <el-table-column label="类型" width="130">
          <template #default="{ row }">
            <el-tag :type="row.tagType" size="small" effect="light">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="location" label="位置" />
        <el-table-column prop="desc" label="检测详情" />
        <el-table-column prop="conf" label="置信度" width="90" />
        <el-table-column prop="workOrder" label="联动工单" width="160" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default>
            <el-button type="primary" link size="small">处理</el-button>
            <el-button link size="small">查看画面</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { Lock, Warning, Bell, Tickets, Opportunity, TrendCharts } from '@element-plus/icons-vue'

const smokeAlert = ref(true)

// KPI
const cabinetKpis = [
  { label: '今日检测配电箱', value: '312', color: '#6366f1', pulse: false },
  { label: '箱体打开告警', value: '2', color: '#f59e0b', pulse: false },
  { label: '冒烟告警', value: '1', color: '#ef4444', pulse: true },
  { label: '小动物进入', value: '3', color: '#8b5cf6', pulse: false }
]
const poleKpis = [
  { label: '杆身裂痕', value: '2', color: '#ef4444' },
  { label: '法兰螺栓松动', value: '3', color: '#f59e0b' },
  { label: '摄像头被撬', value: '1', color: '#f97316' },
  { label: 'SOS 柱按钮盖丢失', value: '1', color: '#3b82f6' }
]
const intrudeKpis = [
  { label: '夜间入侵事件', value: '3', color: '#ef4444' },
  { label: '已联动 SOS 喊话', value: '3', color: '#22c55e' },
  { label: '已派安防岗', value: '3', color: '#22c55e' },
  { label: '告警截图留存', value: '3', color: '#6366f1' }
]

const tab = ref('cabinet')

// 场景数据
const cabinetScene = { bg: 'linear-gradient(180deg, #3f3f46, #18181b)' }
const poleScene = { bg: 'linear-gradient(180deg, #1e293b, #0f172a)' }

const poleDetails = [
  { id: 1, type: '杆身裂纹', loc: '先导路 #12', time: '14:20', measure: '长度 32cm（高风险）', severity: '严重', color: '#ef4444', tagType: 'danger' },
  { id: 2, type: '法兰螺栓缺失', loc: '先导路 #12', time: '14:20', measure: '缺失 2 颗 · 对角位置', severity: '严重', color: '#ef4444', tagType: 'danger' },
  { id: 3, type: '摄像头外壳被撬', loc: '咸嘉湖 #07', time: '13:56', measure: '外壳螺丝松动痕迹', severity: '中等', color: '#f59e0b', tagType: 'warning' },
  { id: 4, type: 'SOS 柱按钮盖丢失', loc: '麓谷产业园 B 区', time: '13:22', measure: '按钮外露 · 雨水风险', severity: '中等', color: '#f59e0b', tagType: 'warning' }
]

const allAlerts = [
  { time: '14:32', type: '配电箱冒烟', tagType: 'danger', location: '麓谷产业园 A 区 B-08', desc: '冒烟 + 箱体被撬痕迹', conf: '99%', workOrder: 'WO-0042（已派工）' },
  { time: '14:28', type: '杆身裂纹', tagType: 'danger', location: '先导路 #12', desc: '裂纹长度 32cm', conf: '93%', workOrder: 'WO-0041（已派工）' },
  { time: '14:20', type: '法兰螺栓缺失', tagType: 'danger', location: '先导路 #12', desc: '对角 2 颗螺栓缺失', conf: '95%', workOrder: 'WO-0041（已派工）' },
  { time: '14:02', type: '小动物入侵', tagType: 'warning', location: '咸嘉湖路 B-12', desc: '野猫进入箱体', conf: '96%', workOrder: 'WO-0039（已派工）' },
  { time: '03:14', type: '区域入侵', tagType: 'danger', location: '麓谷产业园 C 区箱变', desc: '夜间有人过围栏', conf: '96%', workOrder: 'WO-0043（已派安防）' },
  { time: '02:33', type: '箱体门打开', tagType: 'warning', location: '金星大道 B-22', desc: 'AI 识别门与闭合状态不符', conf: '89%', workOrder: '需二次确认' },
  { time: '01:15', type: '摄像头被撬', tagType: 'warning', location: '咸嘉湖 #07', desc: '外壳螺丝松动痕迹', conf: '91%', workOrder: 'WO-0035（已派工）' }
]
</script>

<style lang="scss" scoped>
.zg-sd-detect {
  --zg-brand-primary: #6366f1;
  --zg-gradient-primary: linear-gradient(135deg, #f97316, #ef4444);
  --zg-success: #22c55e;
  --zg-warning: #f59e0b;
  --zg-danger: #ef4444;
  --zg-info: #3b82f6;
  padding: 20px;
  background: #f8fafc;
  min-height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif;
}

/* 头部 */
.zg-sd-head {
  background: linear-gradient(135deg, #431407, #7c2d12);
  border-radius: 12px;
  padding: 16px 22px;
  color: #fff;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 14px;

  &__sigil { width: 42px; height: 42px; border-radius: 10px; background: rgba(255,255,255,0.18); display: flex; align-items: center; justify-content: center; }
  &__title { margin: 0 0 2px; font-size: 16px; font-weight: 600; }
  &__sub { margin: 0; font-size: 12px; opacity: 0.9; }
  &__copy { flex: 1; }
  &__alert {
    padding: 8px 14px; background: rgba(239, 68, 68, 0.3); border: 1px solid rgba(239, 68, 68, 0.6);
    border-radius: 20px; font-size: 12px; font-weight: 600;
    display: flex; align-items: center; gap: 8px; color: #fecaca;
  }
}
.zg-sd-pulse {
  width: 10px; height: 10px; border-radius: 50%; background: #ef4444;
  animation: spulse 1s infinite;
}
@keyframes spulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.8); }
  50% { box-shadow: 0 0 0 10px rgba(239,68,68,0); }
}

/* KPI 3 块 */
.zg-sd-kpis {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 14px;
}
.zg-sd-kpi-block {
  background: #fff; border-radius: 10px; padding: 14px 16px; box-shadow: 0 4px 12px rgba(15,23,42,0.06);
  &__title { font-size: 13px; font-weight: 600; color: #0f172a; margin-bottom: 10px; }
}
.zg-sd-kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.zg-sd-kpi-tile {
  background: #f8fafc; border-radius: 8px; padding: 10px 8px; text-align: center;
  &__num { font-size: 20px; font-weight: 700; line-height: 1.1; font-variant-numeric: tabular-nums; }
  &__lbl { font-size: 11px; color: #64748b; margin-top: 3px; }
  .pulse { animation: kpulse 1.2s infinite; }
}
@keyframes kpulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.12); }
}

/* Tabs */
.zg-sd-tabs {
  background: #fff; border-radius: 10px; box-shadow: 0 4px 12px rgba(15,23,42,0.06); padding: 14px; margin-bottom: 14px;
}
.zg-sd-tab-main {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 14px;
  padding-top: 10px;
}

/* 场景画面 */
.zg-sd-scene {
  position: relative; height: 340px; border-radius: 8px; overflow: hidden;
  border: 1px solid #e2e8f0;
  .zg-sd-svg { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
}
.zg-sd-scene__lbl {
  position: absolute; bottom: 0; left: 0; right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.75));
  padding: 12px 14px; color: #fff;
  display: flex; justify-content: space-between; align-items: center; font-size: 12px;
  &__name { margin-left: 8px; opacity: 0.9; }
}
.zg-sd-badget { margin-right: 4px; }

/* 右侧动作卡 */
.zg-sd-actions { display: flex; flex-direction: column; gap: 10px; }
.zg-sd-action-card {
  background: #f8fafc; border-radius: 8px; padding: 12px; border-left: 3px solid #22c55e;
  &.danger { border-left-color: #ef4444; background: #fef2f2; }
  &.warn { border-left-color: #f59e0b; background: #fffbeb; }
  &__badge { font-size: 11px; font-weight: 600; color: #22c55e; margin-bottom: 4px; &.danger { color: #ef4444; } &.warn { color: #f59e0b; } &.info { color: #8b5cf6; } }
  &__title { font-size: 13px; font-weight: 600; color: #0f172a; }
  &__desc { font-size: 11px; color: #64748b; margin-top: 4px; }
  &__time { font-size: 11px; color: #94a3b8; margin-top: 6px; }
  &__btn { margin-top: 8px; }
}

/* 杆身详情卡列表 */
.zg-sd-detail-list { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; align-content: start; }
.zg-sd-detail-card {
  background: #f8fafc; border-radius: 8px; padding: 12px;
  border-left: 3px solid #ef4444;
  &__head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
  &__type { font-size: 13px; font-weight: 600; }
  &__body { font-size: 11px; color: #475569; line-height: 1.6; margin-bottom: 8px; }
}

/* 入侵联动 */
.zg-sd-intrude-actions { display: flex; flex-direction: column; gap: 10px; }
.zg-sd-intrude-card {
  background: #f8fafc; border-radius: 8px; padding: 12px; display: flex; gap: 12px; align-items: flex-start;
  border-left: 3px solid #ef4444;
  &__icon { font-size: 22px; }
  &__title { font-size: 13px; font-weight: 600; color: #0f172a; }
  &__desc { font-size: 11px; color: #64748b; margin: 3px 0 6px; }
}

/* 底部 */
.zg-sd-bottom {
  background: #fff; border-radius: 10px; box-shadow: 0 4px 12px rgba(15,23,42,0.06); padding: 14px;
  &__head { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  &__title { font-size: 14px; font-weight: 600; color: #0f172a; margin-right: 4px; }
}
</style>
