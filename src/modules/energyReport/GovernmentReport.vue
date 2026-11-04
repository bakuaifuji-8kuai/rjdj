<!--
  智光云枢 · 节能报告中心 · 政府报送报告（真 PDF）
  业务域：energyReport
  功能：window.print() 真 PDF + 归档历史 + @media print 隐藏导航
-->
<template>
  <section class="zg-er-gov">
    <header class="zg-er-gov__head">
      <div class="zg-er-gov__headline">
        <div class="zg-er-gov__sigil"><el-icon :size="22"><Document /></el-icon></div>
        <div class="zg-er-gov__copy">
          <h1 class="zg-er-gov__title">政府报送报告</h1>
          <p class="zg-er-gov__sub">住建委月报 · 城管局季报 · EMC 结算 — 一键生成 PDF（真实 window.print()）</p>
        </div>
      </div>
      <div class="zg-er-gov__head-meta">
        <el-tag type="success" effect="dark" round>最近报送 2026-10-25</el-tag>
      </div>
    </header>

    <!-- ===== 模板选择 ===== -->
    <div class="zg-er-gov__templates">
      <div
        v-for="t in templates" :key="t.id"
        class="zg-er-gov__tpl" :class="{ 'is-active': activeTpl === t.id }"
        @click="activeTpl = t.id"
      >
        <div class="zg-er-gov__tpl-icon" :style="{ background: t.color }">
          <el-icon :size="20"><component :is="t.icon" /></el-icon>
        </div>
        <div class="zg-er-gov__tpl-body">
          <div class="zg-er-gov__tpl-name">{{ t.name }}</div>
          <div class="zg-er-gov__tpl-desc">{{ t.desc }}</div>
        </div>
        <div class="zg-er-gov__tpl-foot">
          <el-tag size="small" :type="t.tagType">{{ t.freq }}</el-tag>
        </div>
      </div>
    </div>

    <!-- ===== 月报模板（可打印区域） ===== -->
    <div class="zg-er-gov__editor">
      <div class="zg-er-gov__editor-toolbar no-print">
        <div class="zg-er-gov__editor-tip">
          <el-icon><InfoFilled /></el-icon>
          模板已自动填充 {{ currentMonth }} 数据 · 峰谷加权 ¥0.721/kWh · 排放因子 0.5810 kg CO₂/kWh
        </div>
        <div class="zg-er-gov__editor-actions">
          <el-button type="primary" @click="triggerPdf"><el-icon><Download /></el-icon>生成 PDF</el-button>
          <el-button @click="archiveReport"><el-icon><FolderOpened /></el-icon>归档到历史</el-button>
          <el-button @click="exportCsv"><el-icon><CopyDocument /></el-icon>下载模板 CSV</el-button>
        </div>
      </div>

      <!-- A4 可打印区域（ref 指向） -->
      <div ref="a4Ref" class="zg-er-gov__a4">
        <div class="zg-er-gov__a4-title">{{ currentMonth }} 长沙市岳麓区城市照明节能报告</div>

        <div class="zg-er-gov__a4-meta">
          编制单位：长沙智光云枢科技有限公司 · 报告编号：ZG-MONTHLY-{{ reportId }} · 编制日期：{{ todayLabel }}
        </div>

        <section class="zg-er-gov__a4-section">
          <h2 class="zg-er-gov__a4-h2">一、基本情况</h2>
          <table class="zg-er-gov__a4-table">
            <tbody>
              <tr><td class="zg-er-gov__a4-label">管辖范围</td><td colspan="3">岳麓区先导路、麓谷产业园、梅溪湖环湖路三条主线路，共 15 台配电箱、512 盏灯具</td></tr>
              <tr><td class="zg-er-gov__a4-label">在线率</td><td><strong style="color:#059669">99.2%</strong></td><td class="zg-er-gov__a4-label">本月故障数</td><td>4 起（已闭环处理）</td></tr>
              <tr><td class="zg-er-gov__a4-label">基线月耗电（校正后）</td><td>{{ (normalizedBaseline / 12).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',') }} kWh</td><td class="zg-er-gov__a4-label">改造后实测</td><td><strong style="color:#6366f1">{{ (measured / 12).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',') }} kWh</strong></td></tr>
            </tbody>
          </table>
        </section>

        <section class="zg-er-gov__a4-section">
          <h2 class="zg-er-gov__a4-h2">二、节能数据</h2>
          <div class="zg-er-gov__a4-kpis">
            <div class="zg-er-gov__a4-kpi">
              <span class="zg-er-gov__a4-kpi-num">{{ (monthlySaved).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',') }}</span>
              <span class="zg-er-gov__a4-kpi-lbl">本月节电量 kWh</span>
            </div>
            <div class="zg-er-gov__a4-kpi">
              <span class="zg-er-gov__a4-kpi-num">¥{{ (monthlySaved * 0.721).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',') }}</span>
              <span class="zg-er-gov__a4-kpi-lbl">本月节省电费（峰谷加权 ¥0.721）</span>
            </div>
            <div class="zg-er-gov__a4-kpi">
              <span class="zg-er-gov__a4-kpi-num">{{ ((1 - measured / normalizedBaseline) * 100).toFixed(1) }}%</span>
              <span class="zg-er-gov__a4-kpi-lbl">当月节能率</span>
            </div>
            <div class="zg-er-gov__a4-kpi">
              <span class="zg-er-gov__a4-kpi-num">90.5%</span>
              <span class="zg-er-gov__a4-kpi-lbl">年度累计完成</span>
            </div>
          </div>
        </section>

        <section class="zg-er-gov__a4-section">
          <h2 class="zg-er-gov__a4-h2">三、碳减排（IPCC 方法学 · EF 0.5810 kg CO₂/kWh）</h2>
          <p class="zg-er-gov__a4-p">
            根据 IPCC 2019 Refinement 方法学与湖南省电网 2025 年度排放因子，
            本月实现 CO₂ 减排 <strong>{{ (monthlySaved * 0.5810 / 1000).toFixed(2) }} 吨</strong>，年累计减排
            <strong>{{ ((normalizedBaseline - measured) * 0.5810 / 1000).toFixed(0) }} 吨</strong>，
            等效于：
          </p>
          <ul class="zg-er-gov__a4-ul">
            <li>停驶汽油车约 <strong>{{ ((normalizedBaseline - measured) * 0.5810 / 2165).toFixed(0) }} 辆一年</strong></li>
            <li>种植 6 年生杉木约 <strong>{{ ((normalizedBaseline - measured) * 0.5810 / 21.77).toFixed(0) }} 棵一年</strong></li>
            <li>等效风电装机 <strong>{{ ((normalizedBaseline - measured) / 2500).toFixed(0) }} kW</strong></li>
            <li>节省标准煤 <strong>{{ ((normalizedBaseline - measured) * 0.304).toFixed(0) }} kg</strong></li>
          </ul>
        </section>

        <section class="zg-er-gov__a4-section">
          <h2 class="zg-er-gov__a4-h2">四、下月计划</h2>
          <ol class="zg-er-gov__a4-ol">
            <li>完成麓谷产业园剩余 3 台配电箱的节能改造验收（计划 11-15 前）</li>
            <li>启动梅溪湖环湖路二期 1.2 km 路段方案勘察</li>
            <li>配合城管局完成 Q3 季度 EMC 分成结算资料提交</li>
            <li>开展秋季灯具清灰 + 线缆绝缘检测专项运维</li>
          </ol>
        </section>

        <div class="zg-er-gov__a4-sign-off">
          <div class="zg-er-gov__a4-sign-cell">
            编制：工程部 李明 &nbsp;&nbsp; 审核：技术部 王芳 &nbsp;&nbsp; 批准：总经理 张三
          </div>
          <div class="zg-er-gov__a4-stamp">（公章占位）</div>
        </div>
      </div>
    </div>

    <!-- ===== 归档历史 ===== -->
    <div class="zg-er-gov__history">
      <div class="zg-er-gov__history-head">
        <h3><el-icon><FolderOpened /></el-icon>历史归档（{{ history.length }} 项 · 近 12 个月）</h3>
        <div class="zg-er-gov__history-head-right">
          <el-input v-model="historyFilter" placeholder="搜索月份 / 类型" style="width: 200px" :prefix-icon="Search" clearable />
          <el-button type="primary" @click="exportHistoryCsv"><el-icon><Download /></el-icon>导出全部</el-button>
        </div>
      </div>

      <el-table :data="filteredHistory" stripe>
        <el-table-column prop="month" label="月份" width="130" />
        <el-table-column prop="type" label="报告类型" width="160">
          <template #default="{ row }">
            <el-tag :type="row.tagType" size="small">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="row.status === '已报送' ? 'success' : row.status === '草稿' ? 'warning' : 'info'" effect="dark" round size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="kwh" label="节电量 kWh" width="150" />
        <el-table-column prop="carbon" label="减 CO₂ 吨" width="130" />
        <el-table-column prop="size" label="文件大小" width="100" />
        <el-table-column prop="created" label="归档时间" width="170" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="viewHistory(row)">查看</el-button>
            <el-button link type="primary" size="small" @click="downloadHistory(row)">下载 PDF</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, Coin, Histogram, Collection, InfoFilled, FolderOpened, CopyDocument, Download, Search } from '@element-plus/icons-vue'

const activeTpl = ref('monthly')
const currentMonth = '2026 年 10 月'
const reportId = 'ZG-MONTHLY-2026-10'
const a4Ref = ref(null)

// ===== 节能数据 =====
const normalizedBaseline = 3200000 * 0.956
const measured = 1835400
const monthlySaved = computed(() => (normalizedBaseline - measured) / 12)

const todayLabel = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})

const templates = [
  { id: 'monthly', name: '住建委月报', desc: '每月 25 日前报送', freq: '每月', tagType: 'primary', icon: Document, color: 'linear-gradient(135deg,#6366f1,#818cf8)' },
  { id: 'quarterly', name: '城管局季报', desc: '季度汇总 + 结算', freq: '每季', tagType: 'success', icon: Histogram, color: 'linear-gradient(135deg,#10b981,#34d399)' },
  { id: 'annual', name: '年度总结', desc: 'EMC 年度绩效', freq: '每年', tagType: 'warning', icon: Collection, color: 'linear-gradient(135deg,#f59e0b,#fbbf24)' },
  { id: 'emc', name: 'EMC 分成结算', desc: '按合同约定对账', freq: '按需', tagType: 'danger', icon: Coin, color: 'linear-gradient(135deg,#a855f7,#c084fc)' }
]

// ===== 归档历史 =====
const historyFilter = ref('')
const history = ref([
  { month: '2026-10', type: '住建委月报', tagType: 'primary', status: '已报送', kwh: '117,000', carbon: '74.9', size: '2.1 MB', created: '2026-10-25 14:32' },
  { month: '2026-09', type: '住建委月报', tagType: 'primary', status: '已报送', kwh: '154,000', carbon: '98.6', size: '1.9 MB', created: '2026-09-26 10:15' },
  { month: '2026-Q3', type: '城管局季报', tagType: 'success', status: '已报送', kwh: '432,000', carbon: '276.5', size: '4.5 MB', created: '2026-10-08 16:02' },
  { month: '2026-08', type: '住建委月报', tagType: 'primary', status: '已报送', kwh: '167,750', carbon: '107.4', size: '2.0 MB', created: '2026-08-25 09:41' },
  { month: '2026-07', type: '住建委月报', tagType: 'primary', status: '已报送', kwh: '170,500', carbon: '109.1', size: '2.0 MB', created: '2026-07-26 11:22' },
  { month: '2026-H1', type: 'EMC 分成结算', tagType: 'danger', status: '已报送', kwh: '640,000', carbon: '409.6', size: '6.8 MB', created: '2026-07-02 15:10' },
  { month: '2026-06', type: '住建委月报', tagType: 'primary', status: '草稿', kwh: '162,250', carbon: '103.8', size: '1.8 MB', created: '2026-06-25 17:55' },
  { month: '2026-05', type: '住建委月报', tagType: 'primary', status: '已报送', kwh: '156,750', carbon: '100.3', size: '1.8 MB', created: '2026-05-26 08:30' },
  { month: '2025-annual', type: '年度总结', tagType: 'warning', status: '已报送', kwh: '1,100,000', carbon: '704', size: '12.4 MB', created: '2026-01-10 14:00' },
  { month: '2025-Q4', type: '城管局季报', tagType: 'success', status: '已报送', kwh: '285,000', carbon: '182.4', size: '3.2 MB', created: '2026-01-05 10:10' }
])

const filteredHistory = computed(() => {
  if (!historyFilter.value) return history.value
  const k = historyFilter.value.toLowerCase()
  return history.value.filter(r => r.month.toLowerCase().includes(k) || r.type.toLowerCase().includes(k))
})

// ===== 真 PDF =====
function triggerPdf() {
  document.body.classList.add('print-mode')
  setTimeout(() => {
    window.print()
    setTimeout(() => document.body.classList.remove('print-mode'), 500)
  }, 200)
  ElMessage.success('已调起系统打印，请选择「另存为 PDF」')
}

function archiveReport() {
  history.value.unshift({
    month: todayLabel.value.slice(0, 7).replace('-', ''),
    type: '住建委月报', tagType: 'primary', status: '已报送',
    kwh: Math.round(monthlySaved.value).toLocaleString(),
    carbon: (monthlySaved.value * 0.5810 / 1000).toFixed(2),
    size: '2.0 MB',
    created: `${todayLabel.value} ${String(new Date().getHours()).padStart(2,'0')}:${String(new Date().getMinutes()).padStart(2,'0')}`
  })
  ElMessage.success('已归档到历史记录 ✓')
}

function viewHistory(row) { ElMessage.info(`查看 ${row.month} 报告 · 归档于 ${row.created}`) }
function downloadHistory(row) { ElMessage.success(`${row.month}.pdf 开始下载（${row.size}）`) }

function exportCsv() {
  const rows = [['月份', '节电量 kWh', '减 CO₂ 吨', '节能率 %', '月节省电费 ¥'],
    [reportId, Math.round(monthlySaved.value), (monthlySaved.value * 0.5810 / 1000).toFixed(2), ((1 - measured / normalizedBaseline) * 100).toFixed(2), Math.round(monthlySaved.value * 0.721)]]
  const csv = '\ufeff' + rows.map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  const url = URL.createObjectURL(blob)
  a.href = url; a.download = `${reportId}.csv`
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url)
  ElMessage.success('模板 CSV 已导出')
}

function exportHistoryCsv() {
  const rows = [['月份', '报告类型', '状态', '节电量 kWh', '减 CO₂ 吨', '文件大小', '归档时间']]
  filteredHistory.value.forEach(h => rows.push([h.month, h.type, h.status, h.kwh, h.carbon, h.size, h.created]))
  const csv = '\ufeff' + rows.map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  const url = URL.createObjectURL(blob)
  a.href = url; a.download = `gov-history-${todayLabel.value}.csv`
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url)
  ElMessage.success('历史记录 CSV 已导出')
}
</script>

<style lang="scss" scoped>
.zg-er-gov {
  padding: var(--zg-space-6);
  background: var(--zg-gradient-surface);
  min-height: calc(100vh - 120px);

  &__head {
    display: flex; justify-content: space-between; align-items: center;
    padding-bottom: var(--zg-space-5); margin-bottom: var(--zg-space-6);
    border-bottom: 1px solid var(--zg-line-soft);
  }
  &__sigil { width: 44px; height: 44px; border-radius: var(--zg-radius-md); background: linear-gradient(135deg, #6366f1, #06b6d4); color: #fff; display: flex; align-items: center; justify-content: center; }
  &__title { margin: 0; font-size: var(--zg-text-display-md); font-weight: 700; }
  &__sub { margin: 2px 0 0; font-size: var(--zg-text-body-sm); color: var(--zg-ink-tertiary); }

  // 模板选择
  &__templates { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--zg-space-4); margin-bottom: var(--zg-space-6); }
  &__tpl {
    display: flex; flex-direction: column; gap: var(--zg-space-3);
    padding: var(--zg-space-4); border-radius: var(--zg-radius-lg);
    background: var(--zg-surface-card); border: 2px solid var(--zg-line-strong);
    box-shadow: var(--zg-shadow-card); cursor: pointer;
    transition: all var(--zg-transition-normal);
    &:hover { transform: translateY(-2px); }
    &.is-active { border-color: var(--zg-amber-glow); box-shadow: var(--zg-shadow-focus); }
  }
  &__tpl-icon { width: 44px; height: 44px; border-radius: var(--zg-radius-md); color: #fff; display: flex; align-items: center; justify-content: center; }
  &__tpl-name { font-weight: 700; }
  &__tpl-desc { font-size: var(--zg-text-caption); color: var(--zg-ink-tertiary); }

  // 编辑区
  &__editor { margin-bottom: var(--zg-space-6); }
  &__editor-toolbar {
    display: flex; justify-content: space-between; align-items: center;
    padding: var(--zg-space-3) var(--zg-space-4);
    background: var(--zg-amber-50); border-radius: var(--zg-radius-md);
    border: 1px solid var(--zg-amber-soft); margin-bottom: var(--zg-space-4);
  }
  &__editor-tip { display: flex; align-items: center; gap: 6px; color: var(--zg-amber-deep); font-size: var(--zg-text-body-sm); }
  &__editor-actions { display: flex; gap: var(--zg-space-2); }

  // A4 可打印
  &__a4 {
    width: 100%; max-width: 780px; margin: 0 auto;
    background: #fff; border: 1px solid #d1d5db;
    box-shadow: 0 8px 32px -8px rgba(0,0,0,0.12);
    border-radius: var(--zg-radius-md); padding: var(--zg-space-6) var(--zg-space-8);
  }
  &__a4-title { text-align: center; font-size: 22px; font-weight: 800; letter-spacing: 1px; padding-bottom: var(--zg-space-3); border-bottom: 2px solid var(--zg-ink-primary); margin-bottom: var(--zg-space-2); }
  &__a4-meta { text-align: center; font-size: var(--zg-text-caption); color: var(--zg-ink-tertiary); padding-bottom: var(--zg-space-4); border-bottom: 1px solid var(--zg-line-soft); margin-bottom: var(--zg-space-4); }
  &__a4-section { margin-bottom: var(--zg-space-4); }
  &__a4-h2 { font-size: var(--zg-text-display-sm); font-weight: 700; margin: var(--zg-space-3) 0 var(--zg-space-2); padding-left: var(--zg-space-3); border-left: 3px solid var(--zg-amber-glow); }
  &__a4-table { width: 100%; border-collapse: collapse; margin: var(--zg-space-2) 0; }
  &__a4-table td { border: 1px solid #d1d5db; padding: 8px 12px; font-size: var(--zg-text-body-sm); }
  &__a4-label { background: var(--zg-surface-muted); color: var(--zg-ink-secondary); width: 140px; font-weight: 500; }
  &__a4-kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--zg-space-3); margin-top: var(--zg-space-2); }
  &__a4-kpi { padding: var(--zg-space-3); background: var(--zg-surface-muted); border-radius: var(--zg-radius-md); border: 1px solid var(--zg-line-soft); text-align: center; }
  &__a4-kpi-num { display: block; font-size: var(--zg-text-display-sm); font-weight: 800; font-family: var(--zg-font-mono); }
  &__a4-kpi-lbl { font-size: var(--zg-text-caption); color: var(--zg-ink-tertiary); }
  &__a4-p { font-size: var(--zg-text-body); line-height: 1.8; text-indent: 2em; }
  &__a4-ul, &__a4-ol { padding-left: 2.5em; margin: var(--zg-space-2) 0; li { margin: 4px 0; font-size: var(--zg-text-body); line-height: 1.8; } }
  &__a4-sign-off { margin-top: var(--zg-space-6); padding-top: var(--zg-space-4); border-top: 1px solid var(--zg-line-soft); display: flex; justify-content: space-between; align-items: flex-end; }
  &__a4-sign-cell { font-size: var(--zg-text-caption); color: var(--zg-ink-secondary); }
  &__a4-stamp { padding: var(--zg-space-2) var(--zg-space-3); border: 2px dashed #dc2626; border-radius: var(--zg-radius-md); color: #dc2626; font-size: var(--zg-text-caption); }

  // 历史
  &__history {
    background: var(--zg-surface-card); border: 1px solid var(--zg-line-strong);
    border-radius: var(--zg-radius-lg); padding: var(--zg-space-5); box-shadow: var(--zg-shadow-card);
  }
  &__history-head {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: var(--zg-space-4); padding-bottom: var(--zg-space-3);
    border-bottom: 1px solid var(--zg-line-soft);
    h3 { margin: 0; font-size: var(--zg-text-body); font-weight: 600; display: flex; gap: 6px; align-items: center; }
  }
  &__history-head-right { display: flex; gap: var(--zg-space-3); }
}

// ===== 打印模式（window.print()） =====
@media print {
  body.print-mode,
  body.print-mode * { visibility: hidden !important; }

  body.print-mode .zg-er-gov__editor,
  body.print-mode .zg-er-gov__editor * { visibility: visible !important; }

  body.print-mode .zg-er-gov__editor-toolbar { display: none !important; }
  body.print-mode .zg-er-gov__a4 {
    box-shadow: none !important;
    border: none !important;
    max-width: none !important;
    page-break-inside: avoid;
    margin: 0;
    padding: 10mm;
  }
  body.print-mode .zg-er-gov__editor {
    box-shadow: none !important;
    padding: 0 !important;
    background: #fff !important;
  }
  body.print-mode .zg-er-gov__templates,
  body.print-mode .zg-er-gov__history,
  body.print-mode .zg-er-gov__head { display: none !important; }

  @page { size: A4; margin: 15mm; }
}
</style>
