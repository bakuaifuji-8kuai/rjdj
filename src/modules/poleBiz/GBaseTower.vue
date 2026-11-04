<!--
  智光云枢 · 杆桩运营 · 5G 微基站站址租赁
  业务域：poleBiz
  功能：多运营商共享智慧灯杆 + 站址租赁合同管理 + 实时信号/流量监控
        参考：华为 LampSite / 中兴 QCell 系列、运营商杆站租赁模式
-->
<template>
  <section class="zg-gb">
    <header class="zg-gb__head">
      <div class="zg-gb__headline">
        <div class="zg-gb__sigil">
          <el-icon :size="22"><Cpu /></el-icon>
        </div>
        <div class="zg-gb__copy">
          <h1 class="zg-gb__title">5G 微基站站址租赁</h1>
          <p class="zg-gb__sub">
            多运营商共建共享 · 杆体承重 {{ loadHealthPct }}% ·
            在役 {{ totalCount }} 站 · 月均租金总收入 ¥{{ monthlyRevenue.toLocaleString() }}
          </p>
        </div>
      </div>
      <div class="zg-gb__cta">
        <el-button type="primary" @click="Toast.info('新建租赁合同 · 建设中')">
          <el-icon><Plus /></el-icon>新建合同
        </el-button>
      </div>
    </header>

    <!-- KPI -->
    <div class="zg-metrics">
      <div class="zg-metrics__cell"><span class="zg-metrics__num">{{ totalCount }}</span><span class="zg-metrics__lbl">基站总数</span></div>
      <div class="zg-metrics__cell zg-metrics__cell--ok"><span class="zg-metrics__num">{{ activeCount }}</span><span class="zg-metrics__lbl">合同执行中</span></div>
      <div class="zg-metrics__cell zg-metrics__cell--info"><span class="zg-metrics__num">{{ renewCount }}</span><span class="zg-metrics__lbl">即将到期续租</span></div>
      <div class="zg-metrics__cell zg-metrics__cell--warn"><span class="zg-metrics__num">{{ expiredCount }}</span><span class="zg-metrics__lbl">已到期待处理</span></div>
      <div class="zg-metrics__cell zg-metrics__cell--danger"><span class="zg-metrics__num">{{ multiOpCount }}</span><span class="zg-metrics__lbl">多运营商共享站</span></div>
    </div>

    <!-- 工具栏 -->
    <div class="zg-filterband">
      <el-select v-model="filterVendor" placeholder="全部厂商" size="default" style="width: 140px">
        <el-option label="全部厂商" value="" />
        <el-option label="华为" value="华为" />
        <el-option label="中兴" value="中兴" />
        <el-option label="爱立信" value="爱立信" />
        <el-option label="诺基亚" value="诺基亚" />
      </el-select>
      <el-select v-model="filterStatus" placeholder="合同状态" size="default" style="width: 140px">
        <el-option label="全部" value="" />
        <el-option label="执行中" value="ACTIVE" />
        <el-option label="续租中" value="RENEW" />
        <el-option label="已到期" value="EXPIRED" />
      </el-select>
      <el-input v-model="keyword" placeholder="搜索基站 / 灯杆 / 位置" :prefix-icon="Search" clearable size="default" style="width: 260px" />
    </div>

    <!-- 卡片网格 -->
    <div class="zg-gb__grid">
      <div
        v-for="tower in filteredList"
        :key="tower.id"
        class="zg-gb-card"
        :class="{ 'zg-gb-card--warn': tower.contractStatus === 'RENEW', 'zg-gb-card--danger': tower.contractStatus === 'EXPIRED' }"
        @click="openDetail(tower)"
      >
        <div class="zg-gb-card__head">
          <span class="zg-gb-card__id">{{ tower.id }}</span>
          <el-tag v-if="tower.contractStatus === 'ACTIVE'" type="success" effect="dark" round size="small">● 执行中</el-tag>
          <el-tag v-else-if="tower.contractStatus === 'RENEW'" type="warning" effect="dark" round size="small">⏳ 续租中</el-tag>
          <el-tag v-else type="danger" effect="dark" round size="small">✖ 已到期</el-tag>
        </div>
        <div class="zg-gb-card__name">{{ tower.name }}</div>
        <div class="zg-gb-card__vendor">
          <el-tag size="small">{{ tower.towerVendor }}</el-tag>
          <el-tag size="small" type="info">{{ tower.towerModel }}</el-tag>
          <el-tag size="small" type="warning">{{ tower.band }}</el-tag>
        </div>
        <div class="zg-gb-card__ops">
          <span
            v-for="op in tower.operators"
            :key="op"
            class="zg-gb-card__op-chip"
            :class="'zg-gb-card__op--' + ({'移动':'cm','联通':'cu','电信':'ct'})[op]"
          >{{ op }}</span>
        </div>
        <div class="zg-gb-card__geo">{{ tower.geoLabel }}</div>

        <!-- 实时遥测（亮点：信号强度 + 吞吐 + 杆体负荷）-->
        <div class="zg-gb-card__telemetry">
          <div class="zg-gb-card__tl-cell">
            <span class="lbl">信号</span>
            <span class="val">{{ tower.signalStrength }}<em>dBm</em></span>
            <div class="zg-gb-card__bar"><div class="zg-gb-card__bar-fill" :style="{ width: (100 + tower.signalStrength) + '%' }"></div></div>
          </div>
          <div class="zg-gb-card__tl-cell">
            <span class="lbl">吞吐</span>
            <span class="val">{{ tower.throughputMbps }}<em>Mbps</em></span>
          </div>
          <div class="zg-gb-card__tl-cell">
            <span class="lbl">杆体负荷</span>
            <span class="val" :class="{ 'zg-gb-card__val--danger': tower.poleLoadPct > 80 }">{{ tower.poleLoadPct }}<em>%</em></span>
            <div class="zg-gb-card__bar"><div class="zg-gb-card__bar-fill" :class="{ 'zg-gb-card__bar-fill--danger': tower.poleLoadPct > 80 }" :style="{ width: tower.poleLoadPct + '%' }"></div></div>
          </div>
        </div>

        <div class="zg-gb-card__contract">
          <span>月租 <strong>¥{{ tower.monthlyRent.toLocaleString() }}</strong></span>
          <span>{{ tower.startDate }} ~ {{ tower.endDate }}</span>
        </div>
      </div>
    </div>

    <!-- ========== 详情 Drawer ========== -->
    <el-drawer v-model="detailVisible" :title="detailFocus?.name || '基站详情'" size="600px">
      <div v-if="detailFocus" class="zg-gb__drawer">
        <section class="zg-gb__section">
          <h4 class="zg-gb__section-title">📶 实时遥测</h4>
          <div class="zg-gb__telemetry-big">
            <div class="zg-gb__tm-cell">
              <span class="lbl">信号强度</span>
              <span class="val">{{ detailFocus.signalStrength }}<em>dBm</em></span>
              <el-progress :percentage="100 + detailFocus.signalStrength" :stroke-width="10" />
            </div>
            <div class="zg-gb__tm-cell">
              <span class="lbl">当前吞吐</span>
              <span class="val">{{ detailFocus.throughputMbps }}<em>Mbps</em></span>
            </div>
            <div class="zg-gb__tm-cell">
              <span class="lbl">覆盖用户</span>
              <span class="val">{{ detailFocus.subscriberCount.toLocaleString() }}<em>人</em></span>
            </div>
            <div class="zg-gb__tm-cell">
              <span class="lbl">杆体承重</span>
              <span class="val" :class="{ 'zg-gb__val--danger': detailFocus.poleLoadPct > 80 }">{{ detailFocus.poleLoadPct }}<em>%</em></span>
              <el-progress :percentage="detailFocus.poleLoadPct" :stroke-width="10" :color="detailFocus.poleLoadPct > 80 ? '#ef4444' : '#6366f1'" />
            </div>
          </div>
        </section>

        <section class="zg-gb__section">
          <h4 class="zg-gb__section-title">📋 基站档案</h4>
          <div class="zg-gb__grid">
            <div class="zg-gb__cell"><span class="lbl">基站编号</span><span class="val">{{ detailFocus.id }}</span></div>
            <div class="zg-gb__cell"><span class="lbl">挂装灯杆</span><span class="val">{{ detailFocus.poleId }}</span></div>
            <div class="zg-gb__cell"><span class="lbl">设备厂商</span><span class="val">{{ detailFocus.towerVendor }}</span></div>
            <div class="zg-gb__cell"><span class="lbl">设备型号</span><span class="val">{{ detailFocus.towerModel }}</span></div>
            <div class="zg-gb__cell"><span class="lbl">5G 频段</span><span class="val">{{ detailFocus.band }}</span></div>
            <div class="zg-gb__cell"><span class="lbl">功耗</span><span class="val">{{ detailFocus.powerKw }} kW</span></div>
            <div class="zg-gb__cell zg-gb__cell--full"><span class="lbl">位置</span><span class="val">{{ detailFocus.geoLabel }}</span></div>
            <div class="zg-gb__cell zg-gb__cell--full"><span class="lbl">入驻运营商</span>
              <span class="val">
                <span v-for="op in detailFocus.operators" :key="op" class="zg-gb-card__op-chip" :class="'zg-gb-card__op--' + ({'移动':'cm','联通':'cu','电信':'ct'})[op]">{{ op }}</span>
              </span>
            </div>
          </div>
        </section>

        <section class="zg-gb__section">
          <h4 class="zg-gb__section-title">📝 租赁合同</h4>
          <div class="zg-gb__contract-box">
            <div class="zg-gb__contract-row"><span>合同编号</span><span class="val">{{ detailFocus.contractNo }}</span></div>
            <div class="zg-gb__contract-row"><span>租赁期限</span><span class="val">{{ detailFocus.startDate }} → {{ detailFocus.endDate }}</span></div>
            <div class="zg-gb__contract-row"><span>月租金额</span><span class="val val--warn">¥{{ detailFocus.monthlyRent.toLocaleString() }} / 月</span></div>
            <div class="zg-gb__contract-row"><span>最近缴费</span><span class="val">{{ detailFocus.lastPayDate || '—' }}</span></div>
            <div class="zg-gb__contract-row"><span>合同状态</span>
              <el-tag :type="{ACTIVE:'success',RENEW:'warning',EXPIRED:'danger'}[detailFocus.contractStatus]" effect="dark" round>
                {{ {ACTIVE:'执行中',RENEW:'续租中',EXPIRED:'已到期'}[detailFocus.contractStatus] }}
              </el-tag>
            </div>
          </div>
        </section>

        <div class="zg-gb__actions">
          <el-button type="primary" size="large">
            <el-icon><DocumentChecked /></el-icon>查看完整合同
          </el-button>
          <el-button v-if="detailFocus.contractStatus === 'EXPIRED' || detailFocus.contractStatus === 'RENEW'" type="warning" size="large">
            发起续签
          </el-button>
        </div>
      </div>
    </el-drawer>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { ElMessage as Toast } from 'element-plus'
import { Cpu, Plus, Search, DocumentChecked } from '@element-plus/icons-vue'
import { gBaseStations } from '@/data/mockData'

const rawList = ref([])
const keyword = ref('')
const filterVendor = ref('')
const filterStatus = ref('')
const detailVisible = ref(false)
const detailFocus = ref(null)

const liveProgressMap = reactive({})
let tickTimer = null

const startTick = () => {
  tickTimer = setInterval(() => {
    rawList.value.forEach(t => {
      if (t.contractStatus === 'ACTIVE') {
        t.signalStrength += (Math.random() - 0.5) * 4
        t.signalStrength = Math.round(t.signalStrength)
        t.throughputMbps += Math.round((Math.random() - 0.3) * 30)
        t.throughputMbps = Math.max(50, t.throughputMbps)
      }
    })
  }, 2500)
}

const init = () => {
  rawList.value = JSON.parse(JSON.stringify(gBaseStations))
}

const filteredList = computed(() => rawList.value.filter(r => {
  if (filterVendor.value && r.towerVendor !== filterVendor.value) return false
  if (filterStatus.value && r.contractStatus !== filterStatus.value) return false
  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    if (!r.name.toLowerCase().includes(kw) && !r.id.toLowerCase().includes(kw) && !r.geoLabel.includes(kw)) return false
  }
  return true
}))

const totalCount = computed(() => rawList.value.length)
const activeCount = computed(() => rawList.value.filter(r => r.contractStatus === 'ACTIVE').length)
const renewCount = computed(() => rawList.value.filter(r => r.contractStatus === 'RENEW').length)
const expiredCount = computed(() => rawList.value.filter(r => r.contractStatus === 'EXPIRED').length)
const multiOpCount = computed(() => rawList.value.filter(r => r.operators.length >= 2).length)
const monthlyRevenue = computed(() => rawList.value.filter(r => r.contractStatus === 'ACTIVE').reduce((s, r) => s + r.monthlyRent, 0))
const loadHealthPct = computed(() => {
  const avg = rawList.value.reduce((s, r) => s + r.poleLoadPct, 0) / rawList.value.length
  return Math.round(avg)
})

const openDetail = (t) => { detailFocus.value = t; detailVisible.value = true }

onMounted(() => { init(); startTick() })
</script>

<style scoped lang="scss">
.zg-gb { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
.zg-gb__head { display: flex; justify-content: space-between; align-items: center; }
.zg-gb__headline { display: flex; align-items: center; gap: 14px; }
.zg-gb__sigil { width: 44px; height: 44px; border-radius: 10px; background: linear-gradient(135deg, #0ea5e9, #6366f1); color: #fff; display: flex; align-items: center; justify-content: center; }
.zg-gb__title { font-size: 20px; font-weight: 600; color: #1f2d3d; margin: 0 0 4px; }
.zg-gb__sub { font-size: 13px; color: #909399; margin: 0; }

.zg-metrics { display: flex; gap: 12px; flex-wrap: wrap; }
.zg-metrics__cell { flex: 1; min-width: 140px; background: #fff; border-radius: 12px; padding: 14px 18px; border: 1px solid #f0f0f0; display: flex; flex-direction: column; gap: 4px; }
.zg-metrics__num { font-size: 22px; font-weight: 700; color: #1f2d3d; }
.zg-metrics__lbl { font-size: 12px; color: #909399; }
.zg-metrics__cell--ok .zg-metrics__num { color: #10b981; }
.zg-metrics__cell--info .zg-metrics__num { color: #6366f1; }
.zg-metrics__cell--warn .zg-metrics__num { color: #f59e0b; }
.zg-metrics__cell--danger .zg-metrics__num { color: #ef4444; }

.zg-filterband { display: flex; gap: 10px; align-items: center; background: #fff; border-radius: 10px; padding: 10px 14px; border: 1px solid #f0f0f0; }

.zg-gb__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 14px; }
.zg-gb-card { background: #fff; border-radius: 12px; padding: 16px; border: 1px solid #f0f0f0; cursor: pointer; display: flex; flex-direction: column; gap: 8px; transition: all 0.2s; }
.zg-gb-card:hover { box-shadow: 0 4px 16px rgba(14,165,233,0.15); border-color: #0ea5e9; transform: translateY(-2px); }
.zg-gb-card--warn { border-color: #f59e0b; }
.zg-gb-card--danger { border-color: #ef4444; background: #fef2f2; }
.zg-gb-card__head { display: flex; justify-content: space-between; align-items: center; }
.zg-gb-card__id { font-family: monospace; font-size: 14px; font-weight: 600; color: #0ea5e9; }
.zg-gb-card__name { font-size: 15px; font-weight: 600; color: #1f2d3d; }
.zg-gb-card__vendor { display: flex; gap: 6px; flex-wrap: wrap; }
.zg-gb-card__ops { display: flex; gap: 6px; flex-wrap: wrap; }
.zg-gb-card__op-chip { font-size: 11px; padding: 2px 8px; border-radius: 10px; font-weight: 600; }
.zg-gb-card__op--cm { background: #e0f2fe; color: #0369a1; }
.zg-gb-card__op--cu { background: #dcfce7; color: #15803d; }
.zg-gb-card__op--ct { background: #fce7f3; color: #be185d; }
.zg-gb-card__geo { font-size: 12px; color: #909399; }

.zg-gb-card__telemetry { background: #f8fafc; border-radius: 8px; padding: 10px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
.zg-gb-card__tl-cell { display: flex; flex-direction: column; gap: 3px; }
.zg-gb-card__tl-cell .lbl { font-size: 10px; color: #909399; }
.zg-gb-card__tl-cell .val { font-size: 14px; font-weight: 700; color: #1f2d3d; font-family: monospace; }
.zg-gb-card__tl-cell em { font-size: 10px; color: #909399; font-style: normal; margin-left: 2px; }
.zg-gb-card__val--danger { color: #ef4444; }
.zg-gb-card__bar { height: 3px; background: #e2e8f0; border-radius: 2px; overflow: hidden; }
.zg-gb-card__bar-fill { height: 100%; background: linear-gradient(90deg, #0ea5e9, #6366f1); border-radius: 2px; transition: width 0.5s ease-out; }
.zg-gb-card__bar-fill--danger { background: #ef4444; }

.zg-gb-card__contract { display: flex; justify-content: space-between; font-size: 12px; color: #606266; padding-top: 6px; border-top: 1px solid #f0f0f0; }
.zg-gb-card__contract strong { color: #0ea5e9; }

// Drawer
.zg-gb__section { margin-bottom: 22px; }
.zg-gb__section-title { font-size: 14px; font-weight: 600; color: #1f2d3d; margin: 0 0 12px; padding-left: 8px; border-left: 3px solid #0ea5e9; }
.zg-gb__telemetry-big { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.zg-gb__tm-cell { background: #f0f9ff; border-radius: 10px; padding: 14px; display: flex; flex-direction: column; gap: 6px; }
.zg-gb__tm-cell .lbl { font-size: 12px; color: #909399; }
.zg-gb__tm-cell .val { font-size: 22px; font-weight: 700; color: #0369a1; font-family: monospace; }
.zg-gb__tm-cell em { font-size: 12px; color: #909399; font-style: normal; margin-left: 2px; }
.zg-gb__val--danger { color: #ef4444; }

.zg-gb__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 14px; }
.zg-gb__cell { background: #f9fafb; border-radius: 8px; padding: 10px 12px; display: flex; flex-direction: column; gap: 2px; }
.zg-gb__cell--full { grid-column: 1 / -1; }
.zg-gb__cell .lbl { font-size: 11px; color: #909399; }
.zg-gb__cell .val { font-size: 14px; color: #1f2d3d; font-weight: 500; }

.zg-gb__contract-box { background: linear-gradient(135deg, #f0f9ff, #e0f2fe); border-radius: 10px; padding: 14px; }
.zg-gb__contract-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #bae6fd; font-size: 13px; color: #0c4a6e; }
.zg-gb__contract-row:last-child { border-bottom: none; }
.zg-gb__contract-row .val { font-weight: 600; color: #0369a1; }
.zg-gb__contract-row .val--warn { color: #f59e0b; font-size: 15px; }

.zg-gb__actions { display: flex; gap: 10px; margin-top: 10px; }</style>
