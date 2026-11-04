<!--
  LightingAcceptance.vue — 夜间照明效果验收（全新）
  目标：EMC 合同能源管理验收刚需 —— 甲方付钱要证明"装了之后路面真亮了"
-->
<template>
  <section class="zg-la-accept">
    <header class="zg-la-head">
      <div class="zg-la-head__sigil"><el-icon :size="22"><ReadingLamp /></el-icon></div>
      <div class="zg-la-head__copy">
        <h1 class="zg-la-head__title">🌃 夜间照明效果 AI 验收</h1>
        <p class="zg-la-head__sub">EMC 合同能源管理验收刚需 · 路面照度 · 均匀度 · 盲区 · 眩光</p>
      </div>
      <div class="zg-la-head__badge">
        <el-tag type="success" effect="dark" size="small">AI 引擎在线</el-tag>
      </div>
    </header>

    <!-- KPI -->
    <div class="zg-la-kpis">
      <div v-for="k in kpis" :key="k.label" class="zg-la-kpi">
        <div class="zg-la-kpi__icon" :style="{ background: k.bg, color: k.color }"><el-icon><component :is="k.icon" /></el-icon></div>
        <div class="zg-la-kpi__body">
          <div class="zg-la-kpi__num" :style="{ color: k.color }">{{ k.value }}</div>
          <div class="zg-la-kpi__lbl">{{ k.label }}</div>
        </div>
      </div>
    </div>

    <!-- 验收流程 Step -->
    <div class="zg-la-steps">
      <el-steps :active="4" align-center simple finish-status="success">
        <el-step title="1. 选项目" />
        <el-step title="2. 夜间摄像头上车巡逻" />
        <el-step title="3. AI 生成照度热力图" />
        <el-step title="4. 系统打分（均匀度/盲区/眩光/达标率）" />
        <el-step title="5. 生成验收报告 PDF" />
      </el-steps>
    </div>

    <!-- 主区：左画面 + 右评分 -->
    <div class="zg-la-main">
      <!-- 左：夜间画面 + 照度热力图 overlay -->
      <div class="zg-la-left">
        <div class="zg-la-scene">
          <!-- 夜间道路渐变底 -->
          <div class="zg-la-road">
            <svg class="zg-la-road-svg" viewBox="0 0 720 400" preserveAspectRatio="none">
              <!-- 天空（夜空） -->
              <rect x="0" y="0" width="720" height="160" fill="#0a0f1e" />
              <!-- 远山 -->
              <path d="M0,160 Q80,100 150,140 T300,120 T450,130 T600,110 T720,150 L720,160 Z" fill="#1e293b" />
              <!-- 地面 -->
              <rect x="0" y="160" width="720" height="240" fill="#111827" />
              <!-- 路面 -->
              <polygon points="260,400 460,400 360,200 360,200" fill="#1f2937" />
              <!-- 路中分隔线 -->
              <polygon points="358,200 362,200 364,400 356,400" fill="#e2e8f0" opacity="0.3" />
              <!-- 路灯（两侧） -->
              <g v-for="(l, li) in leftLamps" :key="'l'+li">
                <rect :x="l.x" :y="l.y" width="4" :height="l.h" fill="#475569" />
                <circle :cx="l.x+2" :cy="l.y" r="6" fill="#fde68a" />
                <ellipse :cx="l.x+2" :cy="l.y+20" rx="40" ry="60" fill="rgba(253,224,71,0.25)" />
              </g>
              <g v-for="(r, ri) in rightLamps" :key="'r'+ri">
                <rect :x="r.x" :y="r.y" width="4" :height="r.h" fill="#475569" />
                <circle :cx="r.x+2" :cy="r.y" r="6" fill="#fde68a" />
                <ellipse :cx="r.x+2" :cy="r.y+20" rx="40" ry="60" fill="rgba(253,224,71,0.25)" />
              </g>
              <!-- 照度热力图 overlay（半透明） -->
              <g>
                <!-- 盲区（红色 <15 lux）-->
                <ellipse cx="330" cy="330" rx="45" ry="25" fill="rgba(239,68,68,0.55)" />
                <text x="330" y="335" text-anchor="middle" fill="#fff" font-size="10" font-weight="700">盲区 12.8 lux</text>
                <!-- 暗区（黄色 15-30 lux） -->
                <ellipse cx="420" cy="280" rx="35" ry="20" fill="rgba(251,191,36,0.45)" />
                <ellipse cx="270" cy="280" rx="35" ry="20" fill="rgba(251,191,36,0.45)" />
                <!-- 达标区（绿色 >30 lux） -->
                <ellipse cx="360" cy="240" rx="50" ry="30" fill="rgba(34,197,94,0.30)" />
                <ellipse cx="395" cy="350" rx="40" ry="20" fill="rgba(34,197,94,0.25)" />
              </g>
              <!-- 眩光标记（红色放射） -->
              <g transform="translate(60,180)">
                <polygon points="0,0 -20,-6 0,6 0,0 6,-20 -6,0 0,0 0,-6 20,0 0,6 -20,0 0,0 6,20 -6,0" fill="#f97316" opacity="0.6" />
                <text x="0" y="35" text-anchor="middle" fill="#f97316" font-size="10" font-weight="600">眩光 63 G 值</text>
              </g>
              <!-- 照度标尺 -->
              <g transform="translate(570,360)">
                <rect x="0" y="0" width="140" height="12" fill="#fff" opacity="0.3" />
                <rect x="0" y="0" width="46" height="12" fill="#ef4444" />
                <rect x="46" y="0" width="46" height="12" fill="#fbbf24" />
                <rect x="92" y="0" width="48" height="12" fill="#22c55e" />
                <text x="0" y="25" fill="#fff" font-size="9">0</text>
                <text x="46" y="25" fill="#fff" font-size="9">15</text>
                <text x="92" y="25" fill="#fff" font-size="9">30</text>
                <text x="120" y="25" fill="#fff" font-size="9">lux</text>
              </g>
            </svg>
          </div>
          <!-- 画面叠加文字 -->
          <div class="zg-la-overlay">
            <span class="zg-la-overlay__item">📷 先导路改造段 · 夜间巡逻中</span>
            <span class="zg-la-overlay__item">🧮 平均 <strong>34.2 lux</strong> · 最暗 <strong>12.8 lux</strong></span>
            <span class="zg-la-overlay__item">📍 盲区位置：先导路 #23 和 #24 之间</span>
          </div>
        </div>

        <!-- 照度数据表 -->
        <div class="zg-la-table">
          <div class="zg-la-table__title">关键点位照度数据</div>
          <el-table :data="samplePoints" size="small" stripe>
            <el-table-column prop="point" label="位置" width="120" />
            <el-table-column prop="lux" label="实测(lux)" width="100">
              <template #default="{ row }">
                <span :style="{ color: row.lux < 15 ? '#ef4444' : row.lux < 30 ? '#f59e0b' : '#22c55e', fontWeight: 600 }">{{ row.lux }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="req" label="达标值" width="100" />
            <el-table-column prop="color" label="热力色" width="100">
              <template #default="{ row }">
                <span class="zg-la-swatch" :style="{ background: row.color }"></span>
              </template>
            </el-table-column>
            <el-table-column prop="judge" label="判定" width="100">
              <template #default="{ row }">
                <el-tag :type="row.pass ? 'success' : 'danger'" size="small">{{ row.judge }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <!-- 右：评分维度 -->
      <div class="zg-la-right">
        <div class="zg-la-score">
          <div class="zg-la-score__title">📊 AI 自动评分</div>
          <div class="zg-la-score__final fail">
            <div class="zg-la-score__num">78</div>
            <div class="zg-la-score__lbl">最终评分</div>
            <el-tag type="danger" size="small">未通过</el-tag>
          </div>
        </div>

        <div class="zg-la-dims">
          <div v-for="d in dimensions" :key="d.label" class="zg-la-dim">
            <div class="zg-la-dim__head">
              <span class="zg-la-dim__label">{{ d.label }}</span>
              <span class="zg-la-dim__val" :style="{ color: d.pass ? '#22c55e' : '#ef4444' }">{{ d.ratio }} {{ d.pass ? '✓' : '✗' }}</span>
            </div>
            <el-progress :percentage="d.pct" :stroke-width="14" :show-text="false" :color="d.pass ? '#22c55e' : '#ef4444'" />
            <div class="zg-la-dim__meta">{{ d.meta }}</div>
          </div>
        </div>

        <div class="zg-la-actions">
          <el-button type="primary" size="default" class="zg-la-actions__btn">
            <el-icon><ReadingLamp /></el-icon> 生成验收报告（PDF）
          </el-button>
          <el-button type="warning" size="default" plain>
            自动创建整改工单
          </el-button>
        </div>

        <!-- 整改建议 -->
        <div class="zg-la-suggest">
          <div class="zg-la-suggest__title">📝 AI 整改建议</div>
          <div v-for="(s, si) in suggestions" :key="si" class="zg-la-suggest__item">
            <el-icon :size="14"><Warning /></el-icon>
            <span>{{ s }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部：验收报告表格 -->
    <div class="zg-la-reports">
      <div class="zg-la-reports__head">
        <span class="zg-la-reports__title">📋 历史验收报告</span>
        <el-button type="primary" size="small" plain>新建验收</el-button>
      </div>
      <el-table :data="reports" stripe border>
        <el-table-column prop="project" label="项目名称" width="180" />
        <el-table-column prop="date" label="验收日期" width="120" />
        <el-table-column label="平均照度" width="120">
          <template #default="{ row }">
            <strong>{{ row.avgLux }}</strong> / 30 lux
          </template>
        </el-table-column>
        <el-table-column label="均匀度" width="120">
          <template #default="{ row }">
            <span :style="{ color: row.uniformity >= 0.7 ? '#22c55e' : '#ef4444', fontWeight: 600 }">{{ row.uniformity }}</span>
            / 0.7
          </template>
        </el-table-column>
        <el-table-column prop="blindSpot" label="盲区" width="80" />
        <el-table-column label="眩光 GR" width="100">
          <template #default="{ row }">
            <span :style="{ color: row.glare <= 30 ? '#22c55e' : '#ef4444', fontWeight: 600 }">{{ row.glare }}</span>
            / 30
          </template>
        </el-table-column>
        <el-table-column label="评分" width="90">
          <template #default="{ row }">
            <strong :style="{ color: row.score >= 80 ? '#22c55e' : '#ef4444', fontSize: '16px' }">{{ row.score }}</strong>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.pass ? 'success' : 'danger'" size="small">{{ row.pass ? '✓ 通过' : '✗ 需整改' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="节能关联" width="140">
          <template #default="{ row }">
            <el-tag v-if="row.pass" type="success" size="small">节能数据已计入 EMC</el-tag>
            <el-tag v-else type="warning" size="small">整改后重新验收</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default>
            <el-button type="primary" link size="small">查看报告</el-button>
            <el-button link size="small">PDF 下载</el-button>
            <el-button link size="small" :disabled="row.pass">整改跟踪</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { ReadingLamp, Warning, TrendCharts, DataAnalysis, Timer, Tickets, Bell, Monitor } from '@element-plus/icons-vue'

const kpis = [
  { label: '已验收项目', value: '8', icon: DataAnalysis, bg: '#eef2ff', color: '#6366f1' },
  { label: '通过率', value: '7/8', icon: Bell, bg: '#dcfce7', color: '#22c55e' },
  { label: '不合格', value: '1', icon: Warning, bg: '#fee2e2', color: '#ef4444' },
  { label: '平均照度', value: '34.2 lux', icon: Monitor, bg: '#dbeafe', color: '#3b82f6' },
  { label: '达标要求', value: '30 lux', icon: TrendCharts, bg: '#f1f5f9', color: '#475569' }
]

// 画面两侧路灯
const leftLamps = [
  { x: 60, y: 160, h: 80 }, { x: 90, y: 180, h: 60 }, { x: 115, y: 200, h: 40 }
]
const rightLamps = [
  { x: 640, y: 160, h: 80 }, { x: 615, y: 180, h: 60 }, { x: 590, y: 200, h: 40 }
]

// 关键点位
const samplePoints = ref([
  { point: '#23 和 #24 之间', lux: 12.8, req: '≥15 lux', color: '#ef4444', pass: false, judge: '盲区' },
  { point: '#23 灯下方', lux: 38.5, req: '≥30 lux', color: '#22c55e', pass: true, judge: '达标' },
  { point: '#24 灯下方', lux: 36.1, req: '≥30 lux', color: '#22c55e', pass: true, judge: '达标' },
  { point: '路中偏右', lux: 22.4, req: '≥15 lux', color: '#fbbf24', pass: true, judge: '基本达标' },
  { point: '#23 以北 10m', lux: 28.7, req: '≥15 lux', color: '#fbbf24', pass: true, judge: '基本达标' }
])

// 评分维度
const dimensions = ref([
  { label: '平均照度', ratio: '114%', pct: 100, pass: true, meta: '34.2 / 30 lux · 充足' },
  { label: '照度均匀度', ratio: '89%', pct: 89, pass: false, meta: '0.62 / 0.7 · 暗点 12.8 lux 导致' },
  { label: '盲区覆盖', ratio: '100%', pct: 100, pass: true, meta: '除 1 个小盲区外全覆盖' },
  { label: '眩光 GR 值', ratio: '137%', pct: 73, pass: false, meta: '63 / 30 · 3 盏灯角度错了晃眼' }
])

const suggestions = ref([
  '🔧 先导路 #23 与 #24 之间建议增加 1 盏补光灯头，覆盖盲区 12.8 lux',
  '🔧 #23 灯的仰角下调 5°，可将眩光 GR 从 63 降至 28（经光照推演验证）',
  '🔧 北侧 3 盏灯建议更换更低眩光角的光学透镜，预计改造费约 ¥3,800'
])

// 验收报告
const reports = ref([
  { project: '先导路 LED 改造', date: '2026-10-28', avgLux: '34.2', uniformity: 0.62, blindSpot: '有 1 处', glare: 63, score: 78, pass: false },
  { project: '麓谷产业园园区照明', date: '2026-10-15', avgLux: '38.1', uniformity: 0.78, blindSpot: '无', glare: 28, score: 94, pass: true },
  { project: '梅溪湖环湖路改造', date: '2026-10-02', avgLux: '36.7', uniformity: 0.75, blindSpot: '无', glare: 25, score: 92, pass: true },
  { project: '金星大道南段', date: '2026-09-18', avgLux: '35.0', uniformity: 0.72, blindSpot: '无', glare: 29, score: 90, pass: true },
  { project: '咸嘉湖路升级', date: '2026-09-05', avgLux: '33.8', uniformity: 0.71, blindSpot: '无', glare: 26, score: 89, pass: true },
  { project: '岳麓山东门广场', date: '2026-08-22', avgLux: '37.2', uniformity: 0.80, blindSpot: '无', glare: 24, score: 95, pass: true },
  { project: '先导路（南段）', date: '2026-08-10', avgLux: '35.5', uniformity: 0.74, blindSpot: '无', glare: 27, score: 91, pass: true },
  { project: '麓谷产业园二期', date: '2026-07-28', avgLux: '36.0', uniformity: 0.76, blindSpot: '无', glare: 28, score: 92, pass: true }
])
</script>

<style lang="scss" scoped>
.zg-la-accept {
  --zg-brand-primary: #6366f1;
  --zg-gradient-primary: linear-gradient(135deg, #6366f1, #22c55e);
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
.zg-la-head {
  background: linear-gradient(135deg, #0f172a, #1e3a8a);
  border-radius: 12px;
  padding: 18px 22px;
  color: #fff;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 14px;

  &__sigil { width: 42px; height: 42px; border-radius: 10px; background: rgba(255,255,255,0.18); display: flex; align-items: center; justify-content: center; }
  &__title { margin: 0 0 2px; font-size: 17px; font-weight: 600; }
  &__sub { margin: 0; font-size: 12px; opacity: 0.9; }
  &__copy { flex: 1; }
}

/* KPI */
.zg-la-kpis {
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 14px;
}
.zg-la-kpi {
  background: #fff; border-radius: 10px; padding: 14px 16px;
  box-shadow: 0 4px 12px rgba(15,23,42,0.06);
  display: flex; align-items: center; gap: 12px;
  &__icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
  &__num { font-size: 22px; font-weight: 700; line-height: 1.1; color: #0f172a; }
  &__lbl { font-size: 12px; color: #64748b; margin-top: 2px; }
}

/* Steps */
.zg-la-steps {
  background: #fff; border-radius: 10px; padding: 18px 30px;
  box-shadow: 0 4px 12px rgba(15,23,42,0.06); margin-bottom: 14px;
}

/* 主区 */
.zg-la-main {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 14px;
  margin-bottom: 14px;
}

/* 左：画面 */
.zg-la-left { display: flex; flex-direction: column; gap: 12px; }
.zg-la-scene {
  position: relative; border-radius: 10px; overflow: hidden;
  box-shadow: 0 4px 12px rgba(15,23,42,0.06);
  background: #0f172a;
  .zg-la-road-svg { width: 100%; height: auto; display: block; }
}

.zg-la-overlay {
  position: absolute; top: 12px; left: 12px; right: 12px;
  display: flex; gap: 10px; flex-wrap: wrap;
  &__item {
    background: rgba(0,0,0,0.6); color: #fff;
    padding: 4px 10px; border-radius: 4px; font-size: 11px;
    strong { color: #fde68a; margin: 0 2px; }
  }
}

.zg-la-table {
  background: #fff; border-radius: 10px; box-shadow: 0 4px 12px rgba(15,23,42,0.06); padding: 14px;
  &__title { font-size: 13px; font-weight: 600; color: #0f172a; margin-bottom: 10px; }
}
.zg-la-swatch { width: 40px; height: 14px; border-radius: 3px; display: inline-block; border: 1px solid #e2e8f0; }

/* 右：评分 */
.zg-la-right { display: flex; flex-direction: column; gap: 12px; }
.zg-la-score {
  background: #fff; border-radius: 10px; box-shadow: 0 4px 12px rgba(15,23,42,0.06); padding: 14px; text-align: center;
  &__title { font-size: 13px; font-weight: 600; color: #0f172a; margin-bottom: 10px; text-align: left; }
  &__final { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 14px; border-radius: 8px; background: #f8fafc; }
  &__final.fail { background: #fef2f2; border: 1px solid #fecaca; }
  &__final.pass { background: #f0fdf4; border: 1px solid #bbf7d0; }
  &__num { font-size: 44px; font-weight: 800; color: #ef4444; line-height: 1; font-variant-numeric: tabular-nums; }
  .pass &__num { color: #22c55e; }
  &__lbl { font-size: 12px; color: #64748b; }
}

.zg-la-dims {
  background: #fff; border-radius: 10px; box-shadow: 0 4px 12px rgba(15,23,42,0.06); padding: 14px;
}
.zg-la-dim { margin-bottom: 14px; &:last-child { margin-bottom: 0; } }
.zg-la-dim__head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.zg-la-dim__label { font-size: 13px; font-weight: 600; color: #0f172a; }
.zg-la-dim__val { font-size: 14px; font-weight: 700; font-variant-numeric: tabular-nums; }
.zg-la-dim__meta { font-size: 11px; color: #64748b; margin-top: 4px; }

.zg-la-actions { display: flex; flex-direction: column; gap: 8px; }
.zg-la-actions__btn { width: 100%; }

.zg-la-suggest {
  background: #fff; border-radius: 10px; box-shadow: 0 4px 12px rgba(15,23,42,0.06); padding: 14px;
  &__title { font-size: 13px; font-weight: 600; color: #0f172a; margin-bottom: 8px; }
  &__item { display: flex; gap: 8px; align-items: flex-start; padding: 6px 0; font-size: 11px; color: #334155; line-height: 1.5; border-bottom: 1px dashed #f1f5f9; }
  &__item:last-child { border-bottom: none; }
}

/* 底部报告 */
.zg-la-reports {
  background: #fff; border-radius: 10px; box-shadow: 0 4px 12px rgba(15,23,42,0.06); padding: 14px;
  &__head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
  &__title { font-size: 14px; font-weight: 600; color: #0f172a; }
}
</style>
