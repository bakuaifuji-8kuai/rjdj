<!--
  智光云枢 · AI 智能运维 Copilot
  业务域：aiOps
  功能：AI 对话式运维 + 故障根因诊断 + 预测性维护 + 自动派单
-->
<template>
  <section class="zg-cop">
    <!-- 页面头部 + KPI -->
    <header class="zg-cop__head">
      <div class="zg-cop__headline">
        <div class="zg-cop__sigil">
          <el-icon :size="22"><Cpu /></el-icon>
        </div>
        <div class="zg-cop__copy">
          <h1 class="zg-cop__title">智能运维 Copilot</h1>
          <p class="zg-cop__sub">
            AI 对话式运维中枢 · 根因诊断 · 预测性维护 · 自动派单
          </p>
        </div>
        <div class="zg-cop__badge">
          <el-icon><MagicStick /></el-icon>
          <span>GPT-智光 v2.3</span>
        </div>
      </div>
      <div class="zg-cop__head-actions">
        <el-button :icon="RefreshLeft" circle size="default" @click="resetChat" />
        <el-button type="primary" plain :icon="Download" @click="exportChat">
          导出对话
        </el-button>
      </div>
    </header>

    <!-- KPI 卡 -->
    <div class="zg-metrics zg-metrics--quad">
      <div class="zg-metrics__cell">
        <span class="zg-metrics__num">{{ kpi.diagnosed }}</span>
        <span class="zg-metrics__lbl">今日诊断</span>
        <span class="zg-metrics__sub">较昨日 +6</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--ok">
        <span class="zg-metrics__num">{{ kpi.dispatched }}</span>
        <span class="zg-metrics__lbl">自动派单</span>
        <span class="zg-metrics__sub">成功率 92%</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--warn">
        <span class="zg-metrics__num">{{ kpi.predicted }}</span>
        <span class="zg-metrics__lbl">预测故障</span>
        <span class="zg-metrics__sub">7 日内</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--info">
        <span class="zg-metrics__num">{{ kpi.manual }}</span>
        <span class="zg-metrics__lbl">人工处理</span>
        <span class="zg-metrics__sub">待接管</span>
      </div>
    </div>

    <!-- 主体：对话 + 右侧任务面板 -->
    <div class="zg-cop__body">
      <!-- 左：AI 对话区 -->
      <div class="zg-cop__chat">
        <div ref="chatBoxRef" class="zg-cop__chatbox">
          <div
            v-for="(msg, idx) in messages"
            :key="idx"
            class="zg-cop__msg"
            :class="msg.role === 'user' ? 'user' : 'bot'"
          >
            <div class="zg-cop__avatar">
              <el-icon v-if="msg.role === 'user'" :size="18"><Service /></el-icon>
              <el-icon v-else :size="18"><Cpu /></el-icon>
            </div>
            <div class="zg-cop__bubble">
              <!-- 文本回复 -->
              <div v-if="msg.type === 'text'" class="zg-cop__text" v-html="msg.content"></div>

              <!-- 告警列表表格 -->
              <div v-else-if="msg.type === 'alert-table'" class="zg-cop__embedded">
                <div class="zg-cop__embedded-title">
                  <el-icon><Warning /></el-icon>
                  <span>{{ msg.title }}</span>
                </div>
                <el-table :data="msg.rows" size="small" stripe border>
                  <el-table-column prop="time" label="时间" width="150" />
                  <el-table-column prop="pole" label="杆桩" width="140" />
                  <el-table-column prop="type" label="告警类型" width="110" />
                  <el-table-column prop="level" label="级别" width="80">
                    <template #default="{ row }">
                      <el-tag :type="level2tag(row.level)" size="small" effect="light">
                        {{ row.level }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="area" label="区域" />
                </el-table>
              </div>

              <!-- 诊断卡 -->
              <div v-else-if="msg.type === 'diagnosis'" class="zg-cop__diag">
                <div class="zg-cop__diag-head">
                  <div class="zg-cop__diag-title">
                    <el-icon><Operation /></el-icon>
                    {{ msg.title }}
                  </div>
                  <el-tag :type="msg.severity === '严重' ? 'danger' : 'warning'" effect="dark">
                    {{ msg.severity }}
                  </el-tag>
                </div>
                <div class="zg-cop__diag-body">
                  <div class="zg-cop__diag-row">
                    <span class="zg-cop__diag-label">故障现象</span>
                    <span class="zg-cop__diag-value">{{ msg.phenomenon }}</span>
                  </div>
                  <div class="zg-cop__diag-row">
                    <span class="zg-cop__diag-label">可能原因</span>
                    <div class="zg-cop__diag-causes">
                      <div
                        v-for="(c, ci) in msg.causes"
                        :key="ci"
                        class="zg-cop__diag-cause"
                      >
                        <span>{{ c.name }}</span>
                        <div class="zg-cop__diag-bar">
                          <span :style="{ width: c.pct + '%' }"></span>
                        </div>
                        <em>{{ c.pct }}%</em>
                      </div>
                    </div>
                  </div>
                  <div class="zg-cop__diag-row">
                    <span class="zg-cop__diag-label">根因判定</span>
                    <span class="zg-cop__diag-value zg-cop__diag-root">
                      {{ msg.root }}
                    </span>
                  </div>
                  <div class="zg-cop__diag-row">
                    <span class="zg-cop__diag-label">已执行动作</span>
                    <div class="zg-cop__diag-actions">
                      <span
                        v-for="(a, ai) in msg.actions"
                        :key="ai"
                        class="zg-cop__diag-chip"
                      >
                        ✅ {{ a }}
                      </span>
                    </div>
                  </div>
                  <div class="zg-cop__diag-row">
                    <span class="zg-cop__diag-label">建议</span>
                    <ul class="zg-cop__diag-suggest">
                      <li v-for="(s, si) in msg.suggestions" :key="si">· {{ s }}</li>
                    </ul>
                  </div>
                </div>
                <div class="zg-cop__diag-foot">
                  <el-button type="primary" size="small">重新合闸</el-button>
                  <el-button size="small" :icon="View">查看工单</el-button>
                  <el-button size="small">关闭远程电源</el-button>
                </div>
              </div>

              <!-- 预测性维护列表 -->
              <div v-else-if="msg.type === 'predict'" class="zg-cop__predict">
                <div class="zg-cop__embedded-title">
                  <el-icon><Timer /></el-icon>
                  <span>{{ msg.title }}</span>
                </div>
                <div class="zg-cop__predict-list">
                  <div
                    v-for="(p, pi) in msg.items"
                    :key="pi"
                    class="zg-cop__predict-item"
                  >
                    <div class="zg-cop__predict-ring">
                      <svg viewBox="0 0 36 36">
                        <path
                          class="zg-cop__predict-ring-bg"
                          d="M18 2.08 a15.92 15.92 0 0 1 0 31.84 a15.92 15.92 0 0 1 0 -31.84"
                        />
                        <path
                          class="zg-cop__predict-ring-fg"
                          :stroke-dasharray="`${p.conf}, 100`"
                          d="M18 2.08 a15.92 15.92 0 0 1 0 31.84 a15.92 15.92 0 0 1 0 -31.84"
                        />
                      </svg>
                      <span>{{ p.conf }}%</span>
                    </div>
                    <div class="zg-cop__predict-info">
                      <div class="zg-cop__predict-pole">{{ p.pole }}</div>
                      <div class="zg-cop__predict-meta">
                        <span>{{ p.days }} 天内</span>
                        <span class="zg-cop__predict-dot">·</span>
                        <span>{{ p.type }}</span>
                      </div>
                      <div class="zg-cop__predict-tip">💡 {{ p.tip }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 能耗报告 -->
              <div v-else-if="msg.type === 'energy-report'" class="zg-cop__report">
                <div class="zg-cop__embedded-title">
                  <el-icon><Collection /></el-icon>
                  <span>{{ msg.title }}</span>
                </div>
                <div class="zg-cop__report-grid">
                  <div
                    v-for="(m, mi) in msg.metrics"
                    :key="mi"
                    class="zg-cop__report-cell"
                  >
                    <div class="zg-cop__report-num">{{ m.value }}</div>
                    <div class="zg-cop__report-lbl">{{ m.label }}</div>
                    <div
                      class="zg-cop__report-trend"
                      :class="m.trend > 0 ? 'up' : 'down'"
                    >
                      {{ m.trend > 0 ? '↑' : '↓' }} {{ Math.abs(m.trend) }}%
                      <span class="zg-cop__report-trend-sub">环比</span>
                    </div>
                  </div>
                </div>
                <div class="zg-cop__report-summary">
                  <div class="zg-cop__report-subtitle">📋 Copilot 摘要</div>
                  <ul class="zg-cop__report-ul">
                    <li v-for="(s, si) in msg.summary" :key="si">· {{ s }}</li>
                  </ul>
                </div>
                <div class="zg-cop__report-advice">
                  <div class="zg-cop__report-subtitle">💡 优化建议</div>
                  <ul class="zg-cop__report-ul">
                    <li v-for="(a, ai) in msg.advice" :key="ai">· {{ a }}</li>
                  </ul>
                </div>
              </div>

              <!-- 节能方案 -->
              <div v-else-if="msg.type === 'energy-plan'" class="zg-cop__plan">
                <div class="zg-cop__embedded-title">
                  <el-icon><MagicStick /></el-icon>
                  <span>{{ msg.title }}</span>
                </div>
                <div class="zg-cop__plan-list">
                  <div
                    v-for="(t, ti) in msg.techniques"
                    :key="ti"
                    class="zg-cop__plan-item"
                  >
                    <div class="zg-cop__plan-head">
                      <el-tag size="small" effect="plain">{{ t.category }}</el-tag>
                      <strong>{{ t.name }}</strong>
                    </div>
                    <p class="zg-cop__plan-desc">{{ t.desc }}</p>
                    <div class="zg-cop__plan-meta">
                      <span>📉 节电 {{ t.powerSave }}%</span>
                      <span>💰 年省 ¥{{ t.yearSave }}</span>
                      <span>⚙️ 难度 {{ t.difficulty }}</span>
                    </div>
                    <el-button size="small" type="primary" link>
                      生成实施计划 →
                    </el-button>
                  </div>
                </div>
                <div class="zg-cop__plan-total">
                  <div>
                    <em>综合预估</em>
                    <strong>年省 ¥{{ msg.totalYearSave }}</strong>
                  </div>
                  <div>
                    <em>节电率</em>
                    <strong>{{ msg.totalPowerSave }}%</strong>
                  </div>
                  <el-button type="primary" :icon="MagicStick">一键应用方案</el-button>
                </div>
              </div>
            </div>
          </div>

          <!-- 打字动画 -->
          <div v-if="typing" class="zg-cop__msg bot">
            <div class="zg-cop__avatar">
              <el-icon :size="18"><Cpu /></el-icon>
            </div>
            <div class="zg-cop__bubble zg-cop__bubble--typing">
              <div class="zg-cop__typing">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区 -->
        <div class="zg-cop__composer">
          <div class="zg-cop__quickbar">
            <el-button
              v-for="q in quickPrompts"
              :key="q.id"
              round
              size="small"
              class="zg-cop__quick"
              @click="sendMsg(q.text)"
            >
              <span>{{ q.icon }}</span>
              <span>{{ q.text }}</span>
            </el-button>
          </div>
          <div class="zg-cop__input">
            <el-input
              v-model="input"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 4 }"
              placeholder="向 Copilot 提问：告警 / 诊断 / 预测 / 报告 / 节能..."
              resize="none"
              @keydown.enter.exact.prevent="sendMsg(input)"
            />
            <div class="zg-cop__input-tools">
              <el-tooltip content="上传截图" placement="top">
                <el-button circle :icon="Paperclip" />
              </el-tooltip>
              <el-tooltip content="清空对话" placement="top">
                <el-button circle :icon="Delete" @click="resetChat" />
              </el-tooltip>
              <el-button
                type="primary"
                :icon="Promotion"
                :loading="typing"
                @click="sendMsg(input)"
              >
                发送
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 右：Copilot 任务面板 -->
      <aside class="zg-cop__panel">
        <!-- 智能诊断卡 -->
        <div class="zg-cop__panel-card">
          <div class="zg-cop__panel-title">
            <span class="zg-cop__panel-dot orange"></span>
            <el-icon><Operation /></el-icon>
            <span>智能诊断（{{ diagnosisCards.length }}）</span>
          </div>
          <div class="zg-cop__panel-list">
            <div
              v-for="(d, di) in diagnosisCards"
              :key="di"
              class="zg-cop__panel-item"
              @click="expandDiagnosis(d)"
            >
              <div class="zg-cop__panel-item-head">
                <strong>{{ d.title }}</strong>
                <el-tag
                  size="small"
                  :type="d.status === '已派单' ? 'success' : d.status === '处理中' ? 'warning' : 'info'"
                >
                  {{ d.status }}
                </el-tag>
              </div>
              <div class="zg-cop__panel-item-body">
                {{ d.summary }}
              </div>
              <div class="zg-cop__panel-item-foot">
                <span class="zg-cop__panel-meta">
                  <el-icon><Timer /></el-icon>
                  {{ d.time }}
                </span>
                <span class="zg-cop__panel-meta">
                  <el-icon><Collection /></el-icon>
                  工单 {{ d.ticket }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 预测性维护卡 -->
        <div class="zg-cop__panel-card">
          <div class="zg-cop__panel-title">
            <span class="zg-cop__panel-dot yellow"></span>
            <el-icon><Timer /></el-icon>
            <span>预测性维护（{{ predictCards.length }}）</span>
          </div>
          <div class="zg-cop__panel-list">
            <div
              v-for="(p, pi) in predictCards"
              :key="pi"
              class="zg-cop__panel-item"
            >
              <div class="zg-cop__panel-item-head">
                <strong>{{ p.pole }}</strong>
                <span class="zg-cop__panel-days">{{ p.days }} 天内</span>
              </div>
              <div class="zg-cop__panel-item-body">
                {{ p.reason }}
              </div>
              <div class="zg-cop__panel-item-foot">
                <span
                  class="zg-cop__panel-confidence"
                  :style="{ '--v': p.confidence + '%' }"
                >
                  置信度 {{ p.confidence }}%
                </span>
                <el-button size="small" text type="primary" :icon="Service">
                  发起工单
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 自动派单日志 -->
        <div class="zg-cop__panel-card">
          <div class="zg-cop__panel-title">
            <span class="zg-cop__panel-dot green"></span>
            <el-icon><Service /></el-icon>
            <span>自动派单日志</span>
          </div>
          <el-table :data="dispatchLog" size="small" stripe height="240">
            <el-table-column prop="time" label="时间" width="88" />
            <el-table-column prop="pole" label="杆桩" width="100" />
            <el-table-column prop="diagnosis" label="诊断" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag
                  size="small"
                  :type="row.status === '成功' ? 'success' : row.status === '人工' ? 'warning' : 'info'"
                >
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted } from 'vue'
import {
  ElMessage,
} from 'element-plus'
import {
  Cpu, MagicStick, Service, Operation, View, Timer, Warning, Download, Collection,
  RefreshLeft, Promotion, Paperclip, Delete,
} from '@element-plus/icons-vue'

/* ---------- KPI ---------- */
const kpi = reactive({
  diagnosed: 34,
  dispatched: 12,
  predicted: 5,
  manual: 3,
})

/* ---------- 快捷问法 ---------- */
const quickPrompts = [
  { id: 1, icon: '📊', text: '帮我查今日告警' },
  { id: 2, icon: '🔍', text: '分析先导路#23 跳闸根因' },
  { id: 3, icon: '📈', text: '预测下周可能故障的杆桩' },
  { id: 4, icon: '⚡', text: '生成本月能耗报告' },
  { id: 5, icon: '🎯', text: '推荐优化方案（节能）' },
]

/* ---------- 聊天状态 ---------- */
const chatBoxRef = ref(null)
const input = ref('')
const typing = ref(false)
const messages = ref([
  {
    role: 'bot',
    type: 'text',
    content: '你好，我是<b>智光运维 Copilot</b> 🤖<br/>我可以帮你做 根因诊断 · 预测维护 · 能耗分析 · 自动派单。<br/>有什么需要帮忙的？',
  },
])

function level2tag(level) {
  if (level === '紧急') return 'danger'
  if (level === '严重') return 'warning'
  if (level === '一般') return 'info'
  return 'success'
}

function scrollToBottom() {
  nextTick(() => {
    const box = chatBoxRef.value
    if (box) box.scrollTop = box.scrollHeight
  })
}

function sendMsg(raw) {
  const text = (raw || '').trim()
  if (!text) return
  messages.value.push({ role: 'user', type: 'text', content: escapeHtml(text).replace(/\n/g, '<br/>') })
  input.value = ''
  typing.value = true
  scrollToBottom()

  setTimeout(() => {
    const reply = buildReply(text)
    messages.value.push(reply)
    typing.value = false
    scrollToBottom()
  }, 700 + Math.random() * 500)
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}

function buildReply(text) {
  const t = text.toLowerCase()
  if (/告警|报警|alert/.test(text)) {
    return {
      role: 'bot',
      type: 'alert-table',
      title: '今日岳麓区告警（共 7 条）',
      rows: [
        { time: '10-27 09:42', pole: '先导路#23', type: '三相跳闸', level: '紧急', area: '先导路商圈' },
        { time: '10-27 08:15', pole: '麓谷产业园#87', type: '光源故障', level: '严重', area: '麓谷产业园' },
        { time: '10-27 07:03', pole: '梅溪湖环湖路#11', type: '通讯中断', level: '一般', area: '梅溪湖' },
        { time: '10-27 02:27', pole: '金星大道#56', type: '电压偏低', level: '一般', area: '金星大道' },
        { time: '10-26 23:18', pole: '咸嘉湖路#34', type: '箱变过温', level: '严重', area: '咸嘉湖路' },
        { time: '10-26 21:44', pole: '岳麓山南门#08', type: '单灯离线', level: '一般', area: '岳麓山' },
        { time: '10-26 19:12', pole: '先导路#45', type: '亮度异常', level: '一般', area: '先导路商圈' },
      ],
    }
  }

  if (/根因|跳闸|诊断|原因/.test(text)) {
    return {
      role: 'bot',
      type: 'diagnosis',
      title: '先导路#23 跳闸告警',
      severity: '严重',
      phenomenon: '2026-10-27 09:42 三相跳闸，电流瞬时达 118kW，超过额定 100kW 空开阈值',
      causes: [
        { name: '过载（118kW / 额定100kW）', pct: 92 },
        { name: '雷击', pct: 5 },
        { name: '其他', pct: 3 },
      ],
      root: '过载导致空开动作（早高峰路灯未按策略调光 + 商户招牌接入）',
      actions: [
        '远程断电保护',
        '自动派单 工单#WO202610270943',
        '通知值班工程师 王工',
      ],
      suggestions: [
        '更换 125kW 空开',
        '增加负载告警阈值（触发 110kW 预警）',
        '优化早高峰调光策略（+10% 限流）',
      ],
    }
  }

  if (/预测|下周|故障|预判/.test(text)) {
    return {
      role: 'bot',
      type: 'predict',
      title: '未来 7 天高风险杆桩预测 Top 3',
      items: [
        { pole: '麓谷产业园#87', days: 5, conf: 94, type: '亮度衰减', tip: '亮度已连续 12 天低于 70%，建议换灯头' },
        { pole: '咸嘉湖路#34', days: 12, conf: 82, type: '箱变过热', tip: '近 3 天温度曲线攀升 3°C，建议清灰' },
        { pole: '梅溪湖环湖路#11', days: 18, conf: 73, type: '通讯异常', tip: '4G 信号强度弱，建议升级 5G 模块' },
      ],
    }
  }

  if (/能耗|报告|用电|电费/.test(text)) {
    return {
      role: 'bot',
      type: 'energy-report',
      title: '2026 年 10 月能耗报告（截至今日）',
      metrics: [
        { value: '128,452 kWh', label: '总用电量', trend: -3.2 },
        { value: '¥ 89,916', label: '电费支出', trend: -2.8 },
        { value: '4.7 kWh/杆', label: '单杆日均', trend: -1.5 },
        { value: '98.6%', label: '在线率', trend: 0.4 },
      ],
      summary: [
        '本月较 9 月节电 4,210 kWh，环比 -3.2%，主要来自深夜调光策略 2.0 上线',
        '麓谷产业园商圈贡献最大节能（-1,820 kWh），得益于新增 18 号智慧杆光照联动',
        '先导路商圈晚高峰能耗偏高，建议复核招牌接入合规性',
      ],
      advice: [
        '将 23:00 - 05:00 亮度由 30% 下调至 22%，预计再省 2,100 kWh/月',
        '对先导路#23/#45 进行负载合规巡检，预计压降尖峰 15%',
        '梅溪湖环湖路增加 3 个微型气象站做辐照联动',
      ],
    }
  }

  if (/节能|优化|方案|省电/.test(text)) {
    return {
      role: 'bot',
      type: 'energy-plan',
      title: '节能优化方案组合推荐',
      techniques: [
        {
          category: '时段策略',
          name: '深夜低照度模式 2.0',
          desc: '基于噪音/辐照/能见度多因子，23:00-05:00 动态调光 18%-28%',
          powerSave: 7.2,
          yearSave: '68,400',
          difficulty: '低',
        },
        {
          category: '环境联动',
          name: '辐照-亮度自适应',
          desc: '接入气象站，辐照 > 200 W/m² 自动降亮度；雨天/雾天提亮度',
          powerSave: 5.8,
          yearSave: '55,100',
          difficulty: '中',
        },
        {
          category: '资产替换',
          name: '老旧灯头 LED 化',
          desc: '对 2018 年前投运的 312 套高压钠灯替换为 160lm/W LED',
          powerSave: 11.4,
          yearSave: '109,200',
          difficulty: '高',
        },
        {
          category: '单灯控制',
          name: '单灯按需点亮',
          desc: '车流量/人流触发式亮灯（毫米波雷达 + AI 视频），非必要时刻灭灯',
          powerSave: 18.6,
          yearSave: '178,300',
          difficulty: '高',
        },
      ],
      totalYearSave: '411,000',
      totalPowerSave: 22.3,
    }
  }

  // 默认回复
  return {
    role: 'bot',
    type: 'text',
    content: '好的，我已收到你的问题。<br/>当前我可以帮你：<br/>· 📊 查询今日告警 / 区域告警<br/>· 🔍 分析某杆桩故障根因<br/>· 📈 预测一周内可能故障<br/>· ⚡ 生成本月能耗报告<br/>· 🎯 推荐节能优化方案<br/><br/>试试点击下方快捷问法按钮吧～',
  }
}

function resetChat() {
  input.value = ''
  typing.value = false
  messages.value = [
    {
      role: 'bot',
      type: 'text',
      content: '对话已重置 ✅<br/>你好，我是<b>智光运维 Copilot</b>，有什么可以帮你的？',
    },
  ]
  ElMessage.success('对话已清空')
}

function exportChat() {
  const text = messages.value
    .map((m) => `${m.role === 'user' ? '👤 用户' : '🤖 Copilot'}：${stripHtml(m.content || m.title || '')}`)
    .join('\n\n')
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `copilot-chat-${new Date().toISOString().slice(0, 10)}.txt`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('对话已导出')
}

function stripHtml(s) {
  return s.replace(/<[^>]*>/g, '')
}

function expandDiagnosis(d) {
  const pseudoMsg = buildReply(d.title + ' 根因')
  pseudoMsg.role = 'user'
  messages.value.push({ role: 'user', type: 'text', content: '🔁 重新打开诊断：' + d.title })
  typing.value = true
  scrollToBottom()
  setTimeout(() => {
    messages.value.push(pseudoMsg)
    typing.value = false
    scrollToBottom()
  }, 600)
}

/* ---------- 右侧面板 mock 数据 ---------- */
const diagnosisCards = ref([
  {
    title: '先导路#23 跳闸告警',
    summary: '过载 118kW / 额定 100kW → 根因：早高峰调光 + 商户招牌接入',
    time: '09:42',
    ticket: 'WO202610270943',
    status: '已派单',
  },
  {
    title: '麓谷产业园#87 亮度衰减',
    summary: '连续 12 天亮度低于 70% → 根因：灯珠老化 + 驱动失效',
    time: '08:15',
    ticket: 'WO202610270820',
    status: '已派单',
  },
  {
    title: '咸嘉湖路#34 箱变过温',
    summary: '近 72h 温升 3°C → 根因：散热风扇卡滞 + 负载上升',
    time: '昨天 23:18',
    ticket: 'WO202610262325',
    status: '处理中',
  },
  {
    title: '梅溪湖环湖路#11 通讯中断',
    summary: '4G 信号 < -110dBm → 根因：基站切换异常',
    time: '07:03',
    ticket: '-',
    status: '人工',
  },
])

const predictCards = ref([
  { pole: '麓谷产业园#87', days: 5, reason: '亮度衰减 12 日连续低于 70%，灯珠色温漂移', confidence: 94 },
  { pole: '咸嘉湖路#34', days: 12, reason: '箱变温度曲线 7 日上升 3°C，散热风扇卡滞', confidence: 82 },
  { pole: '梅溪湖环湖路#11', days: 18, reason: '4G 信号 -112dBm，丢包率 14%，建议升级 5G', confidence: 73 },
])

const dispatchLog = ref([
  { time: '09:42', pole: '先导路#23', diagnosis: '过载跳闸', status: '成功' },
  { time: '08:15', pole: '麓谷产业园#87', diagnosis: '光源故障', status: '成功' },
  { time: '07:03', pole: '梅溪湖环湖路#11', diagnosis: '通讯中断', status: '人工' },
  { time: '02:27', pole: '金星大道#56', diagnosis: '电压偏低', status: '成功' },
  { time: '昨天 23:18', pole: '咸嘉湖路#34', diagnosis: '箱变过温', status: '成功' },
  { time: '昨天 21:44', pole: '岳麓山南门#08', diagnosis: '单灯离线', status: '成功' },
  { time: '昨天 19:12', pole: '先导路#45', diagnosis: '亮度异常', status: '成功' },
  { time: '昨天 16:03', pole: '麓谷产业园#12', diagnosis: '电流波动', status: '人工' },
])

onMounted(() => {
  scrollToBottom()
})
</script>

<style lang="scss" scoped>
.zg-cop {
  min-height: 100%;
  padding: 16px;
  background: linear-gradient(180deg, #f7faff 0%, #eef1f9 100%);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* 头部 */
.zg-cop__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #1e40af 0%, #3730a3 100%);
  color: #fff;
  padding: 14px 20px;
  border-radius: 12px;
  box-shadow: 0 4px 14px rgba(30, 64, 175, 0.18);
}
.zg-cop__headline {
  display: flex;
  align-items: center;
  gap: 14px;
}
.zg-cop__sigil {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}
.zg-cop__copy h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.5px;
}
.zg-cop__copy p {
  margin: 2px 0 0;
  font-size: 12px;
  opacity: 0.8;
}
.zg-cop__badge {
  margin-left: 18px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  font-size: 12px;
}
.zg-cop__head-actions {
  display: flex;
  gap: 8px;
}

/* KPI */
.zg-metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.zg-metrics__cell {
  background: #fff;
  border-radius: 10px;
  padding: 14px 16px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
  position: relative;
  overflow: hidden;
}
.zg-metrics__cell::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: #3b82f6;
}
.zg-metrics__cell--ok::before { background: #10b981; }
.zg-metrics__cell--warn::before { background: #f59e0b; }
.zg-metrics__cell--info::before { background: #8b5cf6; }
.zg-metrics__num {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.1;
}
.zg-metrics__lbl {
  font-size: 12px;
  color: #64748b;
  margin-top: 4px;
  display: block;
}
.zg-metrics__sub {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 2px;
  display: block;
}

/* 主体 */
.zg-cop__body {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 14px;
  min-height: 0;
}

/* Chat */
.zg-cop__chat {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}
.zg-cop__chatbox {
  flex: 1;
  padding: 16px 18px;
  overflow-y: auto;
  background:
    radial-gradient(circle at 20% 0%, rgba(59, 130, 246, 0.04), transparent 40%),
    radial-gradient(circle at 80% 100%, rgba(139, 92, 246, 0.04), transparent 40%),
    #fff;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.zg-cop__msg {
  display: flex;
  gap: 10px;
  max-width: 92%;
}
.zg-cop__msg.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}
.zg-cop__msg.bot {
  align-self: flex-start;
}
.zg-cop__avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.zg-cop__msg.user .zg-cop__avatar {
  background: linear-gradient(135deg, #10b981, #14b8a6);
}
.zg-cop__bubble {
  background: #f1f5f9;
  color: #0f172a;
  padding: 10px 14px;
  border-radius: 14px 14px 14px 4px;
  font-size: 13px;
  line-height: 1.65;
  word-break: break-word;
}
.zg-cop__msg.user .zg-cop__bubble {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #fff;
  border-radius: 14px 14px 4px 14px;
}
.zg-cop__msg.user .zg-cop__bubble b {
  color: inherit;
}
.zg-cop__bubble--typing {
  padding: 12px 16px;
}
.zg-cop__typing {
  display: inline-flex;
  gap: 4px;
}
.zg-cop__typing span {
  width: 7px;
  height: 7px;
  background: #94a3b8;
  border-radius: 50%;
  animation: zgTyping 1.4s infinite ease-in-out both;
}
.zg-cop__typing span:nth-child(1) { animation-delay: -0.32s; }
.zg-cop__typing span:nth-child(2) { animation-delay: -0.16s; }
@keyframes zgTyping {
  0%, 60%, 100% { opacity: 0.3; transform: scale(0.85); }
  30% { opacity: 1; transform: scale(1); }
}

.zg-cop__embedded {
  margin-top: 6px;
}
.zg-cop__embedded-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #1e293b;
}
.zg-cop__msg.user .zg-cop__embedded-title {
  color: #fff;
}

/* 诊断卡 */
.zg-cop__diag {
  margin-top: 8px;
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 10px;
  background: linear-gradient(135deg, #fffbeb, #fff7ed);
  padding: 12px 14px;
}
.zg-cop__diag-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px dashed rgba(245, 158, 11, 0.3);
}
.zg-cop__diag-title {
  font-weight: 600;
  color: #92400e;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.zg-cop__diag-row {
  margin-bottom: 8px;
}
.zg-cop__diag-label {
  font-size: 12px;
  color: #64748b;
  display: block;
  margin-bottom: 3px;
}
.zg-cop__diag-value {
  font-size: 13px;
  color: #1e293b;
}
.zg-cop__diag-root {
  color: #b45309;
  font-weight: 600;
}
.zg-cop__diag-causes {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.zg-cop__diag-cause {
  display: grid;
  grid-template-columns: 1fr 120px 46px;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}
.zg-cop__diag-bar {
  height: 8px;
  background: #fde68a;
  border-radius: 999px;
  overflow: hidden;
  span {
    display: block;
    height: 100%;
    background: linear-gradient(90deg, #f59e0b, #ef4444);
    border-radius: 999px;
    transition: width 0.6s ease;
  }
}
.zg-cop__diag-cause em {
  font-style: normal;
  color: #b45309;
  font-weight: 600;
  text-align: right;
}
.zg-cop__diag-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.zg-cop__diag-chip {
  font-size: 12px;
  background: rgba(16, 185, 129, 0.12);
  color: #047857;
  padding: 3px 8px;
  border-radius: 6px;
}
.zg-cop__diag-suggest {
  margin: 0;
  padding-left: 0;
  list-style: none;
  font-size: 12px;
  color: #1e293b;
}
.zg-cop__diag-foot {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed rgba(245, 158, 11, 0.3);
  display: flex;
  gap: 8px;
}

/* 预测 */
.zg-cop__predict {
  margin-top: 6px;
}
.zg-cop__predict-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.zg-cop__predict-item {
  display: flex;
  gap: 10px;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #fff;
}
.zg-cop__predict-ring {
  width: 48px;
  height: 48px;
  position: relative;
  flex-shrink: 0;
  svg {
    width: 48px;
    height: 48px;
  }
  span {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 700;
    color: #3b82f6;
  }
}
.zg-cop__predict-ring-bg {
  fill: none;
  stroke: #e2e8f0;
  stroke-width: 3;
}
.zg-cop__predict-ring-fg {
  fill: none;
  stroke: #3b82f6;
  stroke-width: 3;
  stroke-linecap: round;
  transition: stroke-dasharray 0.6s ease;
}
.zg-cop__predict-info { flex: 1; min-width: 0; }
.zg-cop__predict-pole { font-weight: 600; color: #0f172a; }
.zg-cop__predict-meta { font-size: 12px; color: #64748b; margin-top: 2px; }
.zg-cop__predict-dot { margin: 0 4px; color: #cbd5e1; }
.zg-cop__predict-tip {
  font-size: 12px;
  color: #334155;
  margin-top: 4px;
  background: #f0f9ff;
  padding: 4px 8px;
  border-radius: 6px;
}

/* 能耗报告 */
.zg-cop__report {
  margin-top: 6px;
}
.zg-cop__report-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}
.zg-cop__report-cell {
  background: linear-gradient(135deg, #eff6ff, #e0f2fe);
  border-radius: 10px;
  padding: 10px 12px;
}
.zg-cop__report-num { font-size: 16px; font-weight: 700; color: #0f172a; }
.zg-cop__report-lbl { font-size: 11px; color: #64748b; margin-top: 2px; }
.zg-cop__report-trend {
  display: inline-block;
  margin-top: 4px;
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.15);
  color: #047857;
  &.up { background: rgba(239, 68, 68, 0.12); color: #b91c1c; }
  &.down { background: rgba(16, 185, 129, 0.12); color: #047857; }
}
.zg-cop__report-trend-sub { font-size: 10px; opacity: 0.7; }
.zg-cop__report-summary, .zg-cop__report-advice {
  margin-top: 10px;
  font-size: 12px;
  padding: 10px;
  border-radius: 8px;
  background: #f8fafc;
  border-left: 3px solid #3b82f6;
}
.zg-cop__report-subtitle {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
}
.zg-cop__report-ul {
  margin: 0;
  padding-left: 0;
  list-style: none;
  color: #334155;
  line-height: 1.75;
}

/* 节能方案 */
.zg-cop__plan { margin-top: 6px; }
.zg-cop__plan-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.zg-cop__plan-item {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px;
  background: #fff;
}
.zg-cop__plan-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  strong { color: #0f172a; font-size: 14px; }
}
.zg-cop__plan-desc {
  margin: 0 0 8px;
  font-size: 12px;
  color: #475569;
  line-height: 1.6;
}
.zg-cop__plan-meta {
  display: flex;
  gap: 10px;
  font-size: 12px;
  color: #334155;
  margin-bottom: 4px;
}
.zg-cop__plan-total {
  margin-top: 10px;
  padding: 12px;
  background: linear-gradient(135deg, #0ea5e9, #6366f1);
  border-radius: 10px;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 24px;
  > div {
    em { font-style: normal; font-size: 11px; opacity: 0.85; display: block; }
    strong { font-size: 18px; font-weight: 700; display: block; margin-top: 2px; }
  }
  :deep(.el-button--primary) {
    background: #fff;
    color: #6366f1;
    border: none;
    font-weight: 600;
    &:hover { background: #f1f5f9; }
  }
}

/* Composer */
.zg-cop__composer {
  border-top: 1px solid #e2e8f0;
  padding: 12px 14px;
  background: #fafbfd;
}
.zg-cop__quickbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}
.zg-cop__quick {
  font-size: 12px;
  background: #fff;
  border: 1px solid #e2e8f0;
  color: #334155;
  :deep(.el-button__inner) {
    display: inline-flex;
    gap: 4px;
  }
}
.zg-cop__quick:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}
.zg-cop__input {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 8px;
  background: #fff;
  display: flex;
  gap: 8px;
  align-items: flex-end;
  transition: border-color 0.2s;
  :focus-within {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
  }
  :deep(.el-textarea__inner) {
    border: none;
    box-shadow: none !important;
    background: transparent;
    resize: none;
    padding: 6px 2px;
    font-size: 13px;
  }
}
.zg-cop__input-tools {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-bottom: 2px;
}

/* 右侧面板 */
.zg-cop__panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
}
.zg-cop__panel-card {
  background: #fff;
  border-radius: 12px;
  padding: 12px 14px;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.05);
}
.zg-cop__panel-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eef2f7;
  width: 100%;
}
.zg-cop__panel-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  &.orange { background: #f59e0b; box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.2); }
  &.yellow { background: #eab308; box-shadow: 0 0 0 3px rgba(234, 179, 8, 0.2); }
  &.green { background: #10b981; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2); }
}
.zg-cop__panel-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.zg-cop__panel-item {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px 12px;
  transition: all 0.2s;
  cursor: pointer;
  &:hover {
    border-color: #3b82f6;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.12);
  }
}
.zg-cop__panel-item-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  strong { font-size: 13px; color: #0f172a; }
}
.zg-cop__panel-item-body {
  font-size: 12px;
  color: #475569;
  line-height: 1.55;
  margin-top: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.zg-cop__panel-item-foot {
  margin-top: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.zg-cop__panel-meta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #94a3b8;
}
.zg-cop__panel-days {
  font-size: 12px;
  color: #ef4444;
  font-weight: 600;
}
.zg-cop__panel-confidence {
  font-size: 11px;
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
  padding: 2px 8px;
  border-radius: 999px;
}

/* 滚动条美化 */
.zg-cop__chatbox::-webkit-scrollbar,
.zg-cop__panel::-webkit-scrollbar {
  width: 6px;
}
.zg-cop__chatbox::-webkit-scrollbar-thumb,
.zg-cop__panel::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

/* 响应式 */
@media (max-width: 1400px) {
  .zg-cop__body { grid-template-columns: 1fr 340px; }
}
@media (max-width: 1100px) {
  .zg-cop__body { grid-template-columns: 1fr; }
}
</style>
