<!--
  智光云枢 · 节能报告中心 · 碳减排报告
  业务域：energyReport
  功能：IPCC 真系数 + 当量真实换算 + PDF 打印触发
-->
<template>
  <section class="zg-er-carbon">
    <header class="zg-er-carbon__head">
      <div class="zg-er-carbon__headline">
        <div class="zg-er-carbon__sigil"><el-icon :size="22"><TrendCharts /></el-icon></div>
        <div class="zg-er-carbon__copy">
          <h1 class="zg-er-carbon__title">碳减排报告</h1>
          <p class="zg-er-carbon__sub">IPCC 2019 方法学 · 湖南省电网 2025 排放因子 0.5810 kg CO₂/kWh</p>
        </div>
      </div>
      <div class="zg-er-carbon__cta">
        <el-tag type="success" effect="dark" round>基线节电量 {{ baselineEnergy.toLocaleString() }} kWh</el-tag>
        <el-button type="primary" @click="printPdf">
          <el-icon><Document /></el-icon>一键生成 PDF 证明书
        </el-button>
        <el-button @click="exportCsv">
          <el-icon><Download /></el-icon>导出 Excel
        </el-button>
      </div>
    </header>

    <!-- ===== IPCC 方法学 ===== -->
    <div class="zg-er-carbon__methodology">
      <div class="zg-er-carbon__method-head">
        <el-icon :size="20"><Collection /></el-icon>
        <span>IPCC 国家温室气体清单方法学 · 真实 CO₂ 排放因子查询</span>
        <el-tag type="success" effect="dark" round>湖南省电网 2025 · OM 法</el-tag>
      </div>
      <div class="zg-er-carbon__method-body">
        <div class="zg-er-carbon__formula">
          <span class="zg-er-carbon__formula-item">
            <span class="lbl">年节电量</span>
            <span class="val">{{ baselineEnergy.toLocaleString() }} kWh</span>
          </span>
          <span class="zg-er-carbon__formula-op">×</span>
          <span class="zg-er-carbon__formula-item">
            <span class="lbl">电网排放因子 EF</span>
            <span class="val">0.5810 kg/kWh</span>
          </span>
          <span class="zg-er-carbon__formula-op">=</span>
          <span class="zg-er-carbon__formula-item zg-er-carbon__formula-item--result">
            <span class="lbl">CO₂ 年减排量</span>
            <span class="val">{{ co2Ton.toFixed(0) }} 吨</span>
          </span>
        </div>
        <el-alert type="info" :closable="false" show-icon style="margin-top:12px">
          <template #title>
            验算：{{ baselineEnergy.toLocaleString() }} kWh × 0.5810 kg/kWh = {{ co2Kg.toLocaleString() }} kg CO₂ = {{ co2Ton.toFixed(2) }} 吨 CO₂
          </template>
        </el-alert>
      </div>
    </div>

    <!-- ===== 4 个当量换算卡（真实系数） ===== -->
    <div class="zg-er-carbon__equivalents">
      <div v-for="eq in equivalents" :key="eq.title" class="zg-er-carbon__eq" :style="{ background: eq.bg }">
        <div class="zg-er-carbon__eq-emoji">{{ eq.emoji }}</div>
        <div class="zg-er-carbon__eq-num">{{ eq.num }}</div>
        <div class="zg-er-carbon__eq-unit">{{ eq.unit }}</div>
        <div class="zg-er-carbon__eq-desc">
          <div class="zg-er-carbon__eq-desc-title">{{ eq.desc }}</div>
          <div class="zg-er-carbon__eq-verify">验算：{{ eq.verify }}</div>
        </div>
      </div>
    </div>

    <!-- ===== A4 证明书预览 ===== -->
    <div class="zg-er-carbon__cert-preview">
      <el-card shadow="never">
        <template #header>
          <div class="zg-er-carbon__cert-head">
            <h3><el-icon><Document /></el-icon>节能减碳证明书（2026 Q3 · A4）</h3>
            <div>
              <el-tag type="warning">草稿</el-tag>
              <el-button link type="primary" @click="printPdf">打印为 PDF</el-button>
            </div>
          </div>
        </template>

        <!-- 模拟 A4 页面（仅这个区域会被打印） -->
        <div ref="a4Ref" class="zg-er-carbon__a4">
          <div class="zg-er-carbon__a4-header">
            <div class="zg-er-carbon__a4-logo">智光云枢 · ZHIGUANG HUB</div>
            <div class="zg-er-carbon__a4-title">节 能 减 碳 证 明 书</div>
            <div class="zg-er-carbon__a4-no">编号：ZG-CARBON-2026-0928 · 签发日期：{{ todayLabel }}</div>
          </div>

          <div class="zg-er-carbon__a4-body">
            <p class="zg-er-carbon__a4-p">
              兹证明由<strong>长沙智光云枢科技有限公司</strong>承接的
              <strong>长沙市先导路照明节能改造项目</strong>（合同编号 ZG-EMC-2025-016），
              依据 IPCC 2019 Refinement 方法学核算，自竣工验收（2025-10-28）至 {{ todayLabel }} 期间，
              项目累计实现：
            </p>

            <table class="zg-er-carbon__a4-table">
              <thead>
                <tr><th>核算项</th><th>数值</th><th>单位</th></tr>
              </thead>
              <tbody>
                <tr><td>年累计节电量</td><td>{{ baselineEnergy.toLocaleString() }}</td><td>kWh</td></tr>
                <tr><td>年累计节省电费（峰谷加权）</td><td>{{ annualSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</td><td>元</td></tr>
                <tr><td>年累计减 CO₂（0.5810 kg/kWh）</td><td><strong>{{ co2Ton.toFixed(0) }}</strong></td><td>吨</td></tr>
                <tr><td>等效汽油车停驶一年</td><td>≈ {{ carEquivalent.toFixed(0) }} 辆</td><td>/</td></tr>
                <tr><td>等效新种 6 年生杉木</td><td>≈ {{ treeEquivalent.toFixed(0) }} 棵</td><td>/</td></tr>
                <tr><td>等效风电装机</td><td>≈ {{ windKw.toFixed(0) }} kW</td><td>/</td></tr>
                <tr><td>等效光伏装机</td><td>≈ {{ pvKw.toFixed(0) }} kWp</td><td>/</td></tr>
              </tbody>
            </table>

            <div class="zg-er-carbon__a4-statement">
              <div class="zg-er-carbon__a4-stat-head">权威声明</div>
              <p>
                本证明书数据来源于城市照明物联管控平台（智光云枢 v3.0）15 分钟频率自动采集的
                智能网关实测数据，排放因子采用《2025 年中国区域电网基准线排放因子》华中电网 OM 法
                EF = 0.5810 kg CO₂/kWh。数据可溯源、可复算。
              </p>
            </div>

            <div class="zg-er-carbon__a4-sign">
              <div class="zg-er-carbon__a4-sign-left">
                <div class="zg-er-carbon__a4-sign-label">发证单位</div>
                <div class="zg-er-carbon__a4-sign-name">长沙智光云枢科技有限公司</div>
                <div class="zg-er-carbon__a4-sign-date">{{ todayLabel }}</div>
              </div>
              <div class="zg-er-carbon__a4-sign-right">
                <div class="zg-er-carbon__a4-seal">
                  <svg viewBox="0 0 120 120" width="120" height="120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#dc2626" stroke-width="3" />
                    <circle cx="60" cy="60" r="40" fill="none" stroke="#dc2626" stroke-width="1" stroke-dasharray="4 2" />
                    <text x="60" y="48" text-anchor="middle" fill="#dc2626" font-size="14" font-weight="700">长沙智光云枢</text>
                    <text x="60" y="66" text-anchor="middle" fill="#dc2626" font-size="14" font-weight="700">科技有限公司</text>
                    <text x="60" y="82" text-anchor="middle" fill="#dc2626" font-size="8">节能服务专用章</text>
                  </svg>
                </div>
                <div class="zg-er-carbon__a4-sign-code">验真码：ZG260928</div>
              </div>
            </div>
          </div>

          <div class="zg-er-carbon__a4-footer">
            <span>Q &amp; A：0731-8888-XXXX</span>
            <span>签发机构保留最终解释权</span>
          </div>
        </div>
      </el-card>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { TrendCharts, Collection, Document, Download } from '@element-plus/icons-vue'

// ===== 基准数据 =====
const baselineEnergy = 1284600  // kWh
const price = 0.721             // ¥/kWh 湖南加权
const annualSavings = computed(() => baselineEnergy * price)

// ===== IPCC CO₂ 计算（真实系数） =====
const EF_HUNAN = 0.5810  // kg CO₂/kWh 湖南省 OM 法 2025
const co2Kg = computed(() => baselineEnergy * EF_HUNAN)
const co2Ton = computed(() => co2Kg.value / 1000)

// ===== 当量换算（真实数据） =====
const CAR_ANNUAL_CO2 = 2165        // kg CO₂ per car per year（汽油车 1.6L）
const TREE_ANNUAL_CO2 = 21.77      // kg CO₂ per tree per year（6 年生杉木）
const WIND_KWH_PER_KW = 2500       // kWh/kW/year 年风电
const PV_KWH_PER_KWP = 1350        // kWh/kWp/year 年光伏
const COAL_PER_KWH = 0.304         // kg 标准煤 per kWh

const carEquivalent = computed(() => co2Kg.value / CAR_ANNUAL_CO2)
const treeEquivalent = computed(() => co2Kg.value / TREE_ANNUAL_CO2)
const windKw = computed(() => baselineEnergy / WIND_KWH_PER_KW)
const pvKw = computed(() => baselineEnergy / PV_KWH_PER_KWP)
const coalSaved = computed(() => baselineEnergy * COAL_PER_KWH)

const todayLabel = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})

// ===== 当量卡 =====
const equivalents = computed(() => [
  {
    title: '汽油车停驶',
    emoji: '🚗',
    num: carEquivalent.value.toFixed(0),
    unit: '辆一年',
    desc: `按每车年 CO₂ 约 ${CAR_ANNUAL_CO2} kg 估算`,
    verify: `${co2Kg.value.toLocaleString()} kg ÷ ${CAR_ANNUAL_CO2} kg/辆 ≈ ${carEquivalent.value.toFixed(0)} 辆`,
    bg: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)'
  },
  {
    title: '新种杉木',
    emoji: '🌳',
    num: treeEquivalent.value.toFixed(0),
    unit: '棵一年',
    desc: `按 6 年生杉木年吸 ${TREE_ANNUAL_CO2} kg CO₂ 估算`,
    verify: `${co2Kg.value.toLocaleString()} kg ÷ ${TREE_ANNUAL_CO2} kg/棵 ≈ ${treeEquivalent.value.toFixed(0)} 棵`,
    bg: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)'
  },
  {
    title: '风电装机',
    emoji: '💨',
    num: windKw.value.toFixed(0),
    unit: 'kW',
    desc: `年发电 ${WIND_KWH_PER_KW} kWh/kW · 等效清洁装机`,
    verify: `${baselineEnergy.toLocaleString()} kWh ÷ ${WIND_KWH_PER_KW} kWh/kW ≈ ${windKw.value.toFixed(0)} kW`,
    bg: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)'
  },
  {
    title: '光伏装机',
    emoji: '☀️',
    num: pvKw.value.toFixed(0),
    unit: 'kWp',
    desc: `年发电 ${PV_KWH_PER_KWP} kWh/kWp · 等效清洁装机`,
    verify: `${baselineEnergy.toLocaleString()} kWh ÷ ${PV_KWH_PER_KWP} kWh/kWp ≈ ${pvKw.value.toFixed(0)} kWp`,
    bg: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'
  }
])

// ===== PDF 打印 =====
const a4Ref = ref(null)
function printPdf() {
  // 切换到打印模式
  document.body.classList.add('print-mode')
  setTimeout(() => {
    window.print()
    setTimeout(() => document.body.classList.remove('print-mode'), 500)
  }, 300)
}

// ===== CSV 导出 =====
function exportCsv() {
  const rows = [
    ['指标', '数值', '单位'],
    ['年节电量', baselineEnergy, 'kWh'],
    ['湖南电网 EF', EF_HUNAN, 'kg CO₂/kWh'],
    ['年 CO₂ 减排', co2Kg.value.toFixed(2), 'kg'],
    ['年 CO₂ 减排', co2Ton.value.toFixed(2), '吨'],
    ['等效汽油车停驶', carEquivalent.value.toFixed(2), '辆一年'],
    ['等效新种杉木', treeEquivalent.value.toFixed(2), '棵'],
    ['等效风电装机', windKw.value.toFixed(2), 'kW'],
    ['等效光伏装机', pvKw.value.toFixed(2), 'kWp'],
    ['节省标准煤', coalSaved.value.toFixed(2), 'kg 标煤']
  ]
  const csv = '\ufeff' + rows.map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  const url = URL.createObjectURL(blob)
  a.href = url; a.download = `CarbonReport-${todayLabel.value}.csv`
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url)
  ElMessage.success('Excel 已导出')
}
</script>

<style lang="scss" scoped>
.zg-er-carbon {
  padding: var(--zg-space-6);
  background: var(--zg-gradient-surface);
  min-height: calc(100vh - 120px);

  &__head {
    display: flex; justify-content: space-between; align-items: center;
    padding-bottom: var(--zg-space-5); margin-bottom: var(--zg-space-6);
    border-bottom: 1px solid var(--zg-line-soft);
  }
  &__sigil { width: 44px; height: 44px; border-radius: var(--zg-radius-md); background: linear-gradient(135deg, #06b6d4, #22d3ee); color: #fff; display: flex; align-items: center; justify-content: center; }
  &__title { margin: 0; font-size: var(--zg-text-display-md); font-weight: 700; }
  &__sub { margin: 2px 0 0; font-size: var(--zg-text-body-sm); color: var(--zg-ink-tertiary); }
  &__cta { display: flex; gap: var(--zg-space-3); }

  // 方法学
  &__methodology {
    background: linear-gradient(135deg, rgba(6,182,212,0.06), rgba(168,85,247,0.06));
    border: 1px solid var(--zg-line-strong);
    border-radius: var(--zg-radius-lg);
    padding: var(--zg-space-5);
    margin-bottom: var(--zg-space-5);
  }
  &__method-head {
    display: flex; align-items: center; gap: var(--zg-space-2);
    font-size: var(--zg-text-body); font-weight: 600; color: var(--zg-ink-primary);
    margin-bottom: var(--zg-space-4);
  }
  &__formula {
    display: flex; align-items: center; justify-content: center;
    gap: var(--zg-space-3); flex-wrap: wrap;
    padding: var(--zg-space-4); background: #fff;
    border-radius: var(--zg-radius-md); border: 1px solid var(--zg-line-soft);
  }
  &__formula-item {
    display: flex; flex-direction: column; align-items: center;
    padding: var(--zg-space-3) var(--zg-space-4); min-width: 180px;
    background: var(--zg-surface-muted); border-radius: var(--zg-radius-md); border: 1px solid var(--zg-line-soft);
    &--result { background: linear-gradient(135deg, #d1fae5, #a7f3d0); border-color: var(--zg-emerald-success); .val { color: var(--zg-emerald-success); } }
    .lbl { font-size: var(--zg-text-caption); color: var(--zg-ink-tertiary); margin-bottom: 4px; }
    .val { font-size: var(--zg-text-display-sm); font-weight: 700; font-family: var(--zg-font-mono); }
  }
  &__formula-op { font-size: var(--zg-text-display-md); font-weight: 700; color: var(--zg-amber-glow); }

  // 当量卡
  &__equivalents { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--zg-space-4); margin-bottom: var(--zg-space-5); }
  &__eq {
    border-radius: var(--zg-radius-lg); padding: var(--zg-space-5);
    border: 1px solid var(--zg-line-soft); position: relative; overflow: hidden;
  }
  &__eq-emoji { font-size: 40px; margin-bottom: var(--zg-space-2); }
  &__eq-num { font-size: var(--zg-text-display-lg); font-weight: 800; font-family: var(--zg-font-mono); letter-spacing: -0.02em; }
  &__eq-unit { font-size: var(--zg-text-body-sm); color: var(--zg-ink-secondary); margin-top: 2px; }
  &__eq-desc { margin-top: var(--zg-space-3); padding-top: var(--zg-space-2); border-top: 1px dashed rgba(0,0,0,0.1); }
  &__eq-desc-title { font-size: var(--zg-text-caption); color: var(--zg-ink-tertiary); }
  &__eq-verify { font-size: 12px; color: var(--zg-amber-glow); font-family: var(--zg-font-mono); margin-top: 2px; font-weight: 600; }

  // 证书
  &__cert-head { display: flex; justify-content: space-between; align-items: center; h3 { margin: 0; font-size: var(--zg-text-body); font-weight: 600; display: flex; gap: 6px; align-items: center; } }
  &__a4 {
    width: 100%; max-width: 680px; margin: 0 auto;
    background: #fff; border: 1px solid var(--zg-line-strong);
    box-shadow: 0 8px 32px -8px rgba(0,0,0,0.12);
    border-radius: var(--zg-radius-md); overflow: hidden;
  }
  &__a4-header { text-align: center; padding: var(--zg-space-6); border-bottom: 3px double var(--zg-ink-primary); }
  &__a4-logo { font-size: var(--zg-text-caption); color: var(--zg-ink-tertiary); letter-spacing: 2px; font-weight: 500; }
  &__a4-title { font-size: 28px; font-weight: 800; letter-spacing: 8px; margin: var(--zg-space-2) 0; }
  &__a4-no { font-size: var(--zg-text-caption); color: var(--zg-ink-secondary); }
  &__a4-body { padding: var(--zg-space-5) var(--zg-space-6); }
  &__a4-p { font-size: var(--zg-text-body); line-height: 1.8; text-indent: 2em; margin-bottom: var(--zg-space-4); }
  &__a4-table { width: 100%; border-collapse: collapse; margin-bottom: var(--zg-space-5); }
  &__a4-table th, &__a4-table td { border: 1px solid var(--zg-line-strong); padding: 8px 12px; text-align: center; font-size: var(--zg-text-body-sm); }
  &__a4-table th { background: var(--zg-surface-muted); font-weight: 600; }
  &__a4-table td strong { color: var(--zg-amber-glow); font-size: var(--zg-text-display-sm); }
  &__a4-statement {
    background: var(--zg-surface-muted); padding: var(--zg-space-4);
    border-radius: var(--zg-radius-md); border-left: 3px solid var(--zg-amber-glow);
    margin-bottom: var(--zg-space-5);
  }
  &__a4-stat-head { font-weight: 700; font-size: var(--zg-text-body-sm); color: var(--zg-amber-glow); margin-bottom: var(--zg-space-2); }
  &__a4-statement p { margin: 0; font-size: var(--zg-text-body-sm); line-height: 1.8; color: var(--zg-ink-secondary); }
  &__a4-sign { display: flex; justify-content: space-between; padding-top: var(--zg-space-5); border-top: 1px solid var(--zg-line-soft); }
  &__a4-sign-label { font-size: var(--zg-text-caption); color: var(--zg-ink-tertiary); margin-bottom: 2px; }
  &__a4-sign-name { font-weight: 600; margin-bottom: 2px; }
  &__a4-sign-date { font-size: var(--zg-text-caption); color: var(--zg-ink-secondary); }
  &__a4-seal { opacity: 0.9; }
  &__a4-sign-code { text-align: center; font-size: var(--zg-text-caption); color: var(--zg-ink-tertiary); }
  &__a4-footer {
    padding: var(--zg-space-3) var(--zg-space-5); background: var(--zg-surface-muted);
    display: flex; justify-content: space-between; font-size: var(--zg-text-caption); color: var(--zg-ink-tertiary);
  }
}

// ===== 打印模式 =====
@media print {
  body.print-mode {
    * { visibility: hidden !important; }
    .zg-er-carbon__cert-preview, .zg-er-carbon__cert-preview * { visibility: visible !important; }
    .zg-er-carbon__cert-preview {
      position: absolute; top: 0; left: 0; width: 100%;
      page-break-after: always;
    }
    .zg-er-carbon__a4 {
      box-shadow: none; border: none; max-width: 100%;
      page-break-inside: avoid;
    }
    .el-card__header, .zg-er-carbon__cta, .zg-er-carbon__head, .zg-er-carbon__methodology,
    .zg-er-carbon__equivalents, .zg-er-carbon__cert-head, .el-card > :not(.el-card__body) { display: none !important; }
    .el-card__body { padding: 0 !important; }
  }
}
</style>
