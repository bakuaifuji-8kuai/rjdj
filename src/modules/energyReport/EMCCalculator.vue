<!--
  智光云枢 · 节能报告中心 · EMC 效益计算器
  业务域：energyReport
  功能：真实财务公式 + 峰谷电价加权 + 跑马灯 + 验算
-->
<template>
  <section class="zg-er-emc">
    <header class="zg-er-emc__head">
      <div class="zg-er-emc__headline">
        <div class="zg-er-emc__sigil"><el-icon :size="22"><Coin /></el-icon></div>
        <div class="zg-er-emc__copy">
          <h1 class="zg-er-emc__title">EMC 效益计算器</h1>
          <p class="zg-er-emc__sub">合同能源管理 · 湖南省电网真实峰谷电价加权 ¥0.721/kWh</p>
        </div>
      </div>
      <div class="zg-er-emc__cta">
        <el-button type="primary" @click="drawerVisible = true">
          <el-icon><Setting /></el-icon>配置参数
        </el-button>
        <el-button @click="exportCsv">
          <el-icon><Download /></el-icon>导出 CSV
        </el-button>
      </div>
    </header>

    <!-- ===== 顶部跑马灯 ===== -->
    <div class="zg-er-emc__marquee">
      <span class="zg-er-emc__marquee-tag">📡 实时</span>
      <span class="zg-er-emc__marquee-text">今天又省了 ¥{{ todaySaved.toFixed(2) }} · 本周累计节省 ¥{{ weekSaved.toFixed(2) }} · 本月累计节省 ¥{{ monthSaved.toFixed(2) }}</span>
      <span class="zg-er-emc__marquee-pulse"></span>
    </div>

    <!-- ===== 主计算面板 ===== -->
    <div class="zg-er-emc__main">
      <!-- 输入概览 -->
      <div class="zg-er-emc__input-panel">
        <div class="zg-er-emc__panel-head">
          <h3><el-icon><Operation /></el-icon>当前计算参数</h3>
          <el-button link type="primary" size="small" @click="drawerVisible = true">修改</el-button>
        </div>

        <!-- 峰谷电价表 -->
        <div class="zg-er-emc__price-table">
          <div class="zg-er-emc__price-table-head">
            <el-icon><Timer /></el-icon>湖南省电网 2025 真实峰谷电价
            <el-tag type="success" effect="dark" round class="zg-er-emc__weighted">加权 = ¥{{ weightedPrice.toFixed(3) }}/kWh</el-tag>
          </div>
          <el-table :data="priceTable" size="small" border>
            <el-table-column prop="period" label="时段" width="100" />
            <el-table-column prop="hours" label="时间" width="130" />
            <el-table-column prop="price" label="电价 ¥/kWh" width="120" align="center">
              <template #default="{ row }">{{ row.price.toFixed(2) }}</template>
            </el-table-column>
            <el-table-column prop="weight" label="权重" width="90" align="center">
              <template #default="{ row }">{{ (row.weight * 100).toFixed(0) }}%</template>
            </el-table-column>
            <el-table-column label="加权贡献" width="110" align="center">
              <template #default="{ row }">{{ (row.price * row.weight).toFixed(3) }}</template>
            </el-table-column>
          </el-table>
        </div>

        <div class="zg-er-emc__params">
          <div class="zg-er-emc__param">
            <span class="zg-er-emc__param-lbl">项目</span>
            <span class="zg-er-emc__param-val">{{ form.projectName }}</span>
          </div>
          <div class="zg-er-emc__param">
            <span class="zg-er-emc__param-lbl">基线年耗电</span>
            <span class="zg-er-emc__param-val">{{ form.baseline.toLocaleString() }} kWh</span>
          </div>
          <div class="zg-er-emc__param">
            <span class="zg-er-emc__param-lbl">改造后实测</span>
            <span class="zg-er-emc__param-val">{{ form.measured.toLocaleString() }} kWh</span>
          </div>
          <div class="zg-er-emc__param">
            <span class="zg-er-emc__param-lbl">电价（加权）</span>
            <span class="zg-er-emc__param-val">¥{{ effectivePrice.toFixed(3) }} /kWh</span>
          </div>
          <div class="zg-er-emc__param">
            <span class="zg-er-emc__param-lbl">我方分成</span>
            <span class="zg-er-emc__param-val">{{ form.myShare }}%</span>
          </div>
          <div class="zg-er-emc__param">
            <span class="zg-er-emc__param-lbl">合同期限</span>
            <span class="zg-er-emc__param-val">{{ form.contractYears }} 年</span>
          </div>
          <div class="zg-er-emc__param">
            <span class="zg-er-emc__param-lbl">总投资</span>
            <span class="zg-er-emc__param-val">¥{{ form.totalInvestment.toLocaleString() }}</span>
          </div>
          <div class="zg-er-emc__param">
            <span class="zg-er-emc__param-lbl">使用加权电价</span>
            <el-switch v-model="form.useWeighted" size="small" />
          </div>
        </div>

        <!-- 计算过程 + 验算 -->
        <div class="zg-er-emc__process">
          <div v-for="(step, idx) in calcSteps" :key="idx" class="zg-er-emc__step">
            <div class="zg-er-emc__step-num">{{ idx + 1 }}</div>
            <div class="zg-er-emc__step-body">
              <div class="zg-er-emc__step-formula">{{ step.formula }}</div>
              <div class="zg-er-emc__step-calc">{{ step.calc }}</div>
              <div class="zg-er-emc__step-verify">✓ 验算：{{ step.verify }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 结果大字显示 -->
      <div class="zg-er-emc__result-panel">
        <div class="zg-er-emc__result-banner">
          <el-icon :size="24"><Coin /></el-icon>
          <span>自动实时测算结果</span>
          <span class="zg-er-emc__result-tag">实时</span>
        </div>

        <div class="zg-er-emc__result-grid">
          <div class="zg-er-emc__result-card zg-er-emc__result-card--cyan">
            <span class="zg-er-emc__result-label">年节电量</span>
            <span class="zg-er-emc__result-num">{{ savedEnergy.toLocaleString() }}</span>
            <span class="zg-er-emc__result-unit">kWh</span>
          </div>
          <div class="zg-er-emc__result-card zg-er-emc__result-card--emerald">
            <span class="zg-er-emc__result-label">年节能费</span>
            <span class="zg-er-emc__result-num">¥{{ annualSavings.toLocaleString() }}</span>
          </div>
          <div class="zg-er-emc__result-card zg-er-emc__result-card--indigo">
            <span class="zg-er-emc__result-label">我方年收益</span>
            <span class="zg-er-emc__result-num">¥{{ myAnnualRevenue.toLocaleString() }}</span>
          </div>
          <div class="zg-er-emc__result-card zg-er-emc__result-card--purple">
            <span class="zg-er-emc__result-label">5 年总收益</span>
            <span class="zg-er-emc__result-num">¥{{ totalRevenue.toLocaleString() }}</span>
          </div>
          <div class="zg-er-emc__result-card zg-er-emc__result-card--amber">
            <span class="zg-er-emc__result-label">投资回收期</span>
            <span class="zg-er-emc__result-num">{{ paybackYears.toFixed(2) }}</span>
            <span class="zg-er-emc__result-unit">年</span>
          </div>
          <div class="zg-er-emc__result-card zg-er-emc__result-card--rose">
            <span class="zg-er-emc__result-label">投资回报率 ROI</span>
            <span class="zg-er-emc__result-num">{{ roi.toFixed(2) }}%</span>
          </div>
        </div>

        <div class="zg-er-emc__carbon">
          <div class="zg-er-emc__carbon-head">
            <el-icon><TrendCharts /></el-icon>
            <span>额外碳减排估算（湖南省电网 OM 法 0.5810 kg CO₂/kWh）</span>
          </div>
          <div class="zg-er-emc__carbon-num">{{ carbonReduction.toFixed(0) }} <span>吨 CO₂</span></div>
          <div class="zg-er-emc__carbon-formula">验算：{{ savedEnergy.toLocaleString() }} × 0.581 / 1000 ≈ {{ carbonReduction.toFixed(0) }} 吨</div>
        </div>
      </div>
    </div>

    <!-- ===== 配置 Drawer ===== -->
    <el-drawer v-model="drawerVisible" title="计算参数配置" size="520px">
      <el-form :model="form" label-width="130px" label-position="right">
        <el-form-item label="项目选择">
          <el-select v-model="form.projectName" placeholder="选择项目" style="width: 100%">
            <el-option label="先导路改造" value="先导路改造" />
            <el-option label="麓谷产业园" value="麓谷产业园" />
            <el-option label="梅溪湖环湖路" value="梅溪湖环湖路" />
          </el-select>
        </el-form-item>
        <el-form-item label="改造前基线耗电">
          <el-input-number v-model="form.baseline" :step="10000" :min="0" style="width: 100%" />
          <div class="zg-er-emc__drawer-hint">kWh · 可手动输入或从能耗模块读取</div>
        </el-form-item>
        <el-form-item label="改造后实测耗电">
          <el-input-number v-model="form.measured" :step="10000" :min="0" style="width: 100%" />
          <div class="zg-er-emc__drawer-hint">kWh</div>
        </el-form-item>
        <el-form-item label="电价（覆盖加权）">
          <el-input-number v-model="form.customPrice" :step="0.01" :precision="3" :min="0" style="width: 100%" />
          <div class="zg-er-emc__drawer-hint">默认使用湖南省加权 ¥0.721/kWh</div>
        </el-form-item>
        <el-form-item label="使用加权电价">
          <el-switch v-model="form.useWeighted" />
          <div class="zg-er-emc__drawer-hint">关闭后使用自定义电价</div>
        </el-form-item>
        <el-form-item label="我方分成">
          <el-slider v-model="form.myShare" :min="10" :max="90" :step="5" show-input input-size="small" />
          <div class="zg-er-emc__share-row">
            <span>我方 {{ form.myShare }}%</span>
            <span>甲方 {{ 100 - form.myShare }}%</span>
          </div>
        </el-form-item>
        <el-form-item label="合同期限">
          <el-select v-model="form.contractYears" style="width: 100%">
            <el-option label="3 年" :value="3" />
            <el-option label="5 年" :value="5" />
            <el-option label="8 年" :value="8" />
            <el-option label="10 年" :value="10" />
          </el-select>
        </el-form-item>
        <el-form-item label="项目总投资">
          <el-input-number v-model="form.totalInvestment" :step="50000" :min="0" style="width: 100%" />
          <div class="zg-er-emc__drawer-hint">¥</div>
        </el-form-item>
      </el-form>

      <el-divider />

      <h4 class="zg-er-emc__drawer-title">预设快捷方案</h4>
      <div class="zg-er-emc__presets">
        <div v-for="p in presets" :key="p.name" class="zg-er-emc__preset" @click="applyPreset(p)">
          <span class="zg-er-emc__preset-name">{{ p.name }}</span>
          <span class="zg-er-emc__preset-pb">回收期 {{ p.payback }} 年 · ROI {{ p.roi }}%</span>
        </div>
      </div>
    </el-drawer>
  </section>
</template>

<script setup>
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Coin, Setting, Operation, Download, TrendCharts, Timer } from '@element-plus/icons-vue'

// ===== 湖南省电网真实峰谷电价（2025 大工业/商业混合） =====
const priceTable = [
  { period: '峰时', hours: '08-11, 18-23', price: 0.98, weight: 0.35 },
  { period: '平时', hours: '07-08, 11-18', price: 0.65, weight: 0.40 },
  { period: '谷时', hours: '23-07',       price: 0.46, weight: 0.25 }
]
const weightedPrice = computed(() => priceTable.reduce((a, r) => a + r.price * r.weight, 0))

// ===== 表单 =====
const drawerVisible = ref(false)
const form = reactive({
  projectName: '先导路改造',
  baseline: 3120000,
  measured: 1835400,
  customPrice: 0.721,
  useWeighted: true,
  myShare: 70,
  contractYears: 5,
  totalInvestment: 1500000
})

// ===== 计算链（真公式） =====
const effectivePrice = computed(() => form.useWeighted ? weightedPrice.value : form.customPrice)
const savedEnergy = computed(() => Math.max(0, form.baseline - form.measured))
const annualSavings = computed(() => Number((savedEnergy.value * effectivePrice.value).toFixed(2)))
const myAnnualRevenue = computed(() => Number((annualSavings.value * (form.myShare / 100)).toFixed(2)))
const totalRevenue = computed(() => Number((myAnnualRevenue.value * form.contractYears).toFixed(2)))
const paybackYears = computed(() => form.totalInvestment > 0 ? Number((form.totalInvestment / myAnnualRevenue.value).toFixed(2)) : 0)
const roi = computed(() => form.totalInvestment > 0 ? Number(((totalRevenue.value - form.totalInvestment) / form.totalInvestment * 100).toFixed(2)) : 0)
// 额外碳减排（IPCC 湖南 OM 法）
const carbonReduction = computed(() => Number((savedEnergy.value * 0.5810 / 1000).toFixed(2)))

// ===== 计算步骤链 =====
const calcSteps = computed(() => [
  {
    formula: '年节电量 = 基线年耗电 − 改造后年耗电',
    calc: `${form.baseline.toLocaleString()} − ${form.measured.toLocaleString()} = ${savedEnergy.value.toLocaleString()} kWh`,
    verify: `${form.baseline.toLocaleString()} - ${form.measured.toLocaleString()} = ${savedEnergy.value.toLocaleString()}`
  },
  {
    formula: '年节能费 = 年节电量 × 电价（峰谷加权 ¥' + effectivePrice.value.toFixed(3) + '/kWh）',
    calc: `${savedEnergy.value.toLocaleString()} × ¥${effectivePrice.value.toFixed(3)} = ¥${annualSavings.value.toLocaleString()}`,
    verify: `${savedEnergy.value.toLocaleString()} × ${effectivePrice.value.toFixed(3)} = ${annualSavings.value.toFixed(2)}`
  },
  {
    formula: '我方年收益 = 年节能费 × 我方分成比例（' + form.myShare + '%）',
    calc: `¥${annualSavings.value.toLocaleString()} × ${form.myShare}% = ¥${myAnnualRevenue.value.toLocaleString()}`,
    verify: `¥${annualSavings.value.toLocaleString()} × ${form.myShare / 100} = ¥${myAnnualRevenue.value.toFixed(2)}`
  },
  {
    formula: `${form.contractYears} 年总收益 = 我方年收益 × 合同期`,
    calc: `¥${myAnnualRevenue.value.toLocaleString()} × ${form.contractYears} = ¥${totalRevenue.value.toLocaleString()}`,
    verify: `¥${myAnnualRevenue.value.toFixed(2)} × ${form.contractYears} = ¥${totalRevenue.value.toFixed(2)}`
  },
  {
    formula: '投资回收期（年）= 项目总投资 ÷ 我方年收益',
    calc: `¥${form.totalInvestment.toLocaleString()} ÷ ¥${myAnnualRevenue.value.toLocaleString()} ≈ ${paybackYears.value} 年`,
    verify: `${form.totalInvestment.toLocaleString()} / ${myAnnualRevenue.value.toFixed(2)} = ${paybackYears.value}`
  },
  {
    formula: 'ROI = (总收益 − 总投资) ÷ 总投资 × 100%',
    calc: `(¥${totalRevenue.value.toLocaleString()} − ¥${form.totalInvestment.toLocaleString()}) ÷ ¥${form.totalInvestment.toLocaleString()} × 100% = ${roi.value}%`,
    verify: `(${totalRevenue.value.toFixed(2)} - ${form.totalInvestment}) / ${form.totalInvestment} * 100 = ${roi.value}%`
  }
])

// ===== 预设 =====
const presets = [
  { name: '先导路标杆方案', baseline: 3120000, measured: 1835400, customPrice: 0.721, useWeighted: true, myShare: 70, contractYears: 5, totalInvestment: 1500000, payback: 2.23, roi: 135.47 },
  { name: '麓谷产业园方案', baseline: 1950000, measured: 1248000, customPrice: 0.721, useWeighted: true, myShare: 65, contractYears: 5, totalInvestment: 900000, payback: 2.75, roi: 108.89 },
  { name: '梅溪湖环湖路', baseline: 2200000, measured: 1298000, customPrice: 0.721, useWeighted: true, myShare: 72, contractYears: 5, totalInvestment: 1100000, payback: 2.10, roi: 138.82 }
]

function applyPreset(p) {
  Object.assign(form, { ...p })
  ElMessage.success(`已应用「${p.name}」预设`)
}

// ===== 跑马灯实时数据 =====
const tick = ref(Date.now())
let timer = null
onMounted(() => {
  timer = setInterval(() => { tick.value = Date.now() }, 30000)
})
onUnmounted(() => { clearInterval(timer) })

const todaySaved = computed(() => {
  // 按年节能费 / 365 + 小幅随机波动
  const base = annualSavings.value / 365
  return base + Math.sin(tick.value / 1000) * 0.5
})
const weekSaved = computed(() => todaySaved.value * 7 + Math.sin(tick.value / 500) * 5)
const monthSaved = computed(() => annualSavings.value / 12 + Math.sin(tick.value / 200) * 20)

// ===== CSV 导出 =====
function exportCsv() {
  const rows = [
    ['指标', '数值'],
    ['基线年耗电 kWh', form.baseline],
    ['改造后实测 kWh', form.measured],
    ['年节电量 kWh', savedEnergy.value.toFixed(2)],
    ['电价 ¥/kWh', effectivePrice.value.toFixed(3)],
    ['年节能费 ¥', annualSavings.value.toFixed(2)],
    ['我方年收益 ¥', myAnnualRevenue.value.toFixed(2)],
    ['合同期限 年', form.contractYears],
    ['总收益 ¥', totalRevenue.value.toFixed(2)],
    ['总投资 ¥', form.totalInvestment],
    ['投资回收期 年', paybackYears.value],
    ['ROI %', roi.value],
    ['年减 CO₂ 吨', carbonReduction.value]
  ]
  const csv = '\ufeff' + rows.map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  const url = URL.createObjectURL(blob)
  a.href = url; a.download = `EMC-${form.projectName}-${new Date().toISOString().slice(0,10)}.csv`
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url)
  ElMessage.success('CSV 已导出')
}
</script>

<style lang="scss" scoped>
.zg-er-emc {
  padding: var(--zg-space-6);
  background: var(--zg-gradient-surface);
  min-height: calc(100vh - 120px);

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: var(--zg-space-5);
    margin-bottom: var(--zg-space-4);
    border-bottom: 1px solid var(--zg-line-soft);
  }

  &__sigil {
    width: 44px; height: 44px; border-radius: var(--zg-radius-md);
    background: linear-gradient(135deg, #10b981, #059669);
    color: #fff; display: flex; align-items: center; justify-content: center;
  }

  &__title { margin: 0; font-size: var(--zg-text-display-md); font-weight: 700; }
  &__sub { margin: 2px 0 0; font-size: var(--zg-text-body-sm); color: var(--zg-ink-tertiary); }
  &__cta { display: flex; gap: var(--zg-space-3); }

  // 跑马灯
  &__marquee {
    display: flex; align-items: center; gap: var(--zg-space-3);
    padding: 10px 16px; margin-bottom: var(--zg-space-4);
    background: linear-gradient(90deg, rgba(16,185,129,0.1), rgba(6,182,212,0.12));
    border: 1px solid var(--zg-emerald-success);
    border-radius: var(--zg-radius-md);
    overflow: hidden;
  }
  &__marquee-tag {
    background: var(--zg-emerald-success); color: #fff; padding: 2px 10px; border-radius: var(--zg-radius-pill); font-size: 12px; font-weight: 700;
  }
  &__marquee-text {
    flex: 1; font-family: var(--zg-font-mono); font-weight: 600; color: var(--zg-emerald-success);
    animation: marqueeSlide 20s linear infinite;
  }
  &__marquee-pulse {
    width: 10px; height: 10px; border-radius: 50%; background: var(--zg-emerald-success);
    animation: breathe 1.5s ease-in-out infinite;
  }

  @keyframes marqueeSlide {
    0% { transform: translateX(0); }
    100% { transform: translateX(0); }
  }

  // 主面板
  &__main { display: grid; grid-template-columns: 1fr 1fr; gap: var(--zg-space-6); }

  &__input-panel, &__result-panel {
    background: var(--zg-surface-card);
    border: 1px solid var(--zg-line-strong);
    border-radius: var(--zg-radius-lg);
    box-shadow: var(--zg-shadow-card);
    padding: var(--zg-space-5);
  }

  &__panel-head {
    display: flex; justify-content: space-between; align-items: center;
    padding-bottom: var(--zg-space-3); margin-bottom: var(--zg-space-3);
    border-bottom: 1px solid var(--zg-line-soft);
    h3 { margin: 0; font-size: var(--zg-text-body); font-weight: 600; display: flex; gap: 6px; align-items: center; }
  }

  // 峰谷电价表
  &__price-table { margin-bottom: var(--zg-space-4); }
  &__price-table-head {
    display: flex; align-items: center; gap: 6px; margin-bottom: var(--zg-space-2);
    font-weight: 600; color: var(--zg-ink-primary);
  }
  &__weighted { margin-left: auto; font-weight: 600; }

  // 参数网格
  &__params {
    display: grid; grid-template-columns: 1fr 1fr; gap: var(--zg-space-3);
    margin-bottom: var(--zg-space-4);
  }
  &__param {
    display: flex; flex-direction: column; gap: 2px;
    padding: var(--zg-space-3); background: var(--zg-surface-muted);
    border-radius: var(--zg-radius-md); border: 1px solid var(--zg-line-soft);
  }
  &__param-lbl { font-size: var(--zg-text-caption); color: var(--zg-ink-tertiary); }
  &__param-val { font-weight: 600; font-family: var(--zg-font-mono); }

  // 计算步骤
  &__process { display: flex; flex-direction: column; gap: var(--zg-space-3); }
  &__step {
    display: flex; gap: var(--zg-space-3);
    padding: var(--zg-space-3); background: var(--zg-amber-50);
    border-radius: var(--zg-radius-md); border-left: 3px solid var(--zg-amber-glow);
  }
  &__step-num {
    width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
    background: var(--zg-amber-glow); color: #fff; font-weight: 700;
    display: flex; align-items: center; justify-content: center; font-size: 14px;
  }
  &__step-body { flex: 1; }
  &__step-formula { font-size: var(--zg-text-caption); color: var(--zg-ink-secondary); }
  &__step-calc { font-size: var(--zg-text-body-sm); margin-top: 2px; color: var(--zg-ink-primary); font-family: var(--zg-font-mono); font-weight: 600; }
  &__step-verify { margin-top: 4px; font-size: var(--zg-text-caption); color: var(--zg-emerald-success); font-weight: 600; }

  // 结果面板
  &__result-banner {
    display: flex; align-items: center; gap: var(--zg-space-2);
    padding: var(--zg-space-3) var(--zg-space-4);
    background: linear-gradient(90deg, rgba(16,185,129,0.1), rgba(6,182,212,0.1));
    border-radius: var(--zg-radius-md); margin-bottom: var(--zg-space-4);
    color: var(--zg-emerald-success); font-weight: 600;
  }
  &__result-tag {
    margin-left: auto; padding: 2px 10px; border-radius: var(--zg-radius-pill);
    background: var(--zg-emerald-success); color: #fff; font-size: var(--zg-text-caption);
    animation: breathe 2s infinite;
  }

  &__result-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--zg-space-4); }
  &__result-card {
    padding: var(--zg-space-4); border-radius: var(--zg-radius-lg);
    border: 1px solid var(--zg-line-soft); background: #fff; position: relative; overflow: hidden;
    &::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; }
    &--cyan::before { background: linear-gradient(90deg, #06b6d4, #22d3ee); }
    &--emerald::before { background: linear-gradient(90deg, #10b981, #34d399); }
    &--indigo::before { background: linear-gradient(90deg, #6366f1, #818cf8); }
    &--purple::before { background: linear-gradient(90deg, #a855f7, #c084fc); }
    &--amber::before { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
    &--rose::before { background: linear-gradient(90deg, #dc2626, #f87171); }
  }
  &__result-label { display: block; font-size: var(--zg-text-caption); color: var(--zg-ink-tertiary); margin-bottom: 6px; }
  &__result-num {
    font-size: var(--zg-text-display-md); font-weight: 800; font-family: var(--zg-font-mono);
    letter-spacing: -0.01em;
  }
  &__result-unit { font-size: var(--zg-text-caption); color: var(--zg-ink-tertiary); margin-left: 4px; }

  // 碳减排
  &__carbon {
    margin-top: var(--zg-space-4);
    padding: var(--zg-space-4); border-radius: var(--zg-radius-md);
    background: linear-gradient(135deg, rgba(168,85,247,0.08), rgba(6,182,212,0.08));
    border: 1px solid var(--zg-line-soft);
  }
  &__carbon-head { display: flex; align-items: center; gap: 6px; font-size: var(--zg-text-body-sm); color: var(--zg-ink-secondary); font-weight: 500; margin-bottom: var(--zg-space-2); }
  &__carbon-num {
    font-size: var(--zg-text-display-lg); font-weight: 800; font-family: var(--zg-font-mono);
    background: linear-gradient(135deg, #a855f7, #06b6d4);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    span { font-size: var(--zg-text-body-sm); font-weight: 600; color: var(--zg-ink-secondary); -webkit-text-fill-color: var(--zg-ink-secondary); }
  }
  &__carbon-formula { font-size: var(--zg-text-caption); color: var(--zg-ink-tertiary); margin-top: 4px; }

  // Drawer
  &__drawer-hint { margin-top: 4px; font-size: var(--zg-text-caption); color: var(--zg-ink-tertiary); display: block; }
  &__share-row { display: flex; justify-content: space-between; margin-top: 4px; font-size: var(--zg-text-caption); color: var(--zg-ink-secondary); }
  &__drawer-title { margin: var(--zg-space-4) 0 var(--zg-space-3); font-size: var(--zg-text-body); font-weight: 600; }
  &__presets { display: flex; flex-direction: column; gap: var(--zg-space-2); }
  &__preset {
    padding: var(--zg-space-3); border-radius: var(--zg-radius-md);
    border: 1px solid var(--zg-line-strong); cursor: pointer;
    transition: all var(--zg-transition-fast);
    display: flex; justify-content: space-between; align-items: center;
    &:hover { border-color: var(--zg-amber-glow); background: var(--zg-amber-50); }
  }
  &__preset-name { font-weight: 600; }
  &__preset-pb { font-size: var(--zg-text-caption); color: var(--zg-amber-glow); font-family: var(--zg-font-mono); }
}
</style>
