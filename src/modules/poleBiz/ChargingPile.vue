<!--
  智光云枢 · 杆桩运营 · 充电桩管理
  业务域：poleBiz
  功能：灯杆合一充电桩台账 + 实时充电进度 + 计费联动
        参考：上海嘉定"光储充放一体综合杆"、深圳"杆桩合一"政策
-->
<template>
  <section class="zg-cp">
    <header class="zg-cp__head">
      <div class="zg-cp__headline">
        <div class="zg-cp__sigil">
          <el-icon :size="22"><Lightning /></el-icon>
        </div>
        <div class="zg-cp__copy">
          <h1 class="zg-cp__title">杆桩合一 · 充电桩管理</h1>
          <p class="zg-cp__sub">
            智慧灯杆挂桩 · 占地少布点灵活 · 峰谷调度联动 · 在役 {{ totalCount }} 台 ·
            今日充电 {{ totalEnergy }} kWh · 峰值负荷 {{ peakLoad }} kW
          </p>
        </div>
      </div>
    </header>

    <!-- KPI -->
    <div class="zg-metrics">
      <div class="zg-metrics__cell"><span class="zg-metrics__num">{{ totalCount }}</span><span class="zg-metrics__lbl">充电桩总数</span></div>
      <div class="zg-metrics__cell zg-metrics__cell--ok"><span class="zg-metrics__num">{{ busyCount }}</span><span class="zg-metrics__lbl">充电中</span></div>
      <div class="zg-metrics__cell zg-metrics__cell--info"><span class="zg-metrics__num">{{ freeCount }}</span><span class="zg-metrics__lbl">空闲可用</span></div>
      <div class="zg-metrics__cell zg-metrics__cell--warn"><span class="zg-metrics__num">{{ faultCount }}</span><span class="zg-metrics__lbl">故障</span></div>
      <div class="zg-metrics__cell zg-metrics__cell--danger"><span class="zg-metrics__num">¥{{ todayIncome.toLocaleString('zh-CN') }}</span><span class="zg-metrics__lbl">今日充电收入</span></div>
    </div>

    <!-- 工具栏 -->
    <div class="zg-filterband">
      <el-select v-model="filterType" placeholder="全部类型" size="default" style="width: 140px">
        <el-option label="全部类型" value="" />
        <el-option label="慢充 7kW" value="慢充7kW" />
        <el-option label="直流快充" value="直流快充" />
      </el-select>
      <el-select v-model="filterStatus" placeholder="全部状态" size="default" style="width: 120px">
        <el-option label="全部状态" value="" />
        <el-option label="充电中" value="BUSY" />
        <el-option label="空闲" value="FREE" />
        <el-option label="故障" value="FAULT" />
      </el-select>
      <el-input v-model="keyword" placeholder="搜索桩编号 / 位置" :prefix-icon="Search" clearable size="default" style="width: 260px" />
    </div>

    <!-- 卡片网格 -->
    <div class="zg-cp__grid">
      <div
        v-for="pile in filteredList"
        :key="pile.id"
        class="zg-cp-card"
        :class="{ 'zg-cp-card--fault': pile.status === 'FAULT', 'zg-cp-card--busy': pile.status === 'BUSY' }"
        @click="onCardClick(pile)"
      >
        <div class="zg-cp-card__head">
          <span class="zg-cp-card__id">{{ pile.id }}</span>
          <el-tag v-if="pile.status === 'BUSY'" type="success" effect="dark" round size="small">🟡 充电中</el-tag>
          <el-tag v-else-if="pile.status === 'FREE'" type="info" effect="dark" round size="small">⚪ 空闲</el-tag>
          <el-tag v-else type="danger" effect="dark" round size="small">🔴 故障</el-tag>
        </div>
        <div class="zg-cp-card__name">{{ pile.name }}</div>
        <div class="zg-cp-card__spec">
          <el-tag size="small" type="warning">{{ pile.powerKw }}kW</el-tag>
          <el-tag size="small">{{ pile.type }}</el-tag>
          <el-tag size="small" type="success">{{ pile.connector }}</el-tag>
        </div>
        <div class="zg-cp-card__geo">{{ pile.geoLabel }}</div>

        <!-- 实时充电条 -->
        <div v-if="pile.status === 'BUSY' && pile.currentSession" class="zg-cp-card__session">
          <div class="zg-cp-card__bar">
            <div class="zg-cp-card__bar-fill" :style="{ width: liveProgressMap[pile.id] + '%' }"></div>
          </div>
          <div class="zg-cp-card__session-info">
            <span>{{ pile.currentSession.brand }} · {{ pile.currentSession.vehicleNo }}</span>
            <span class="zg-cp-card__progress-text">{{ liveProgressMap[pile.id] }}% · 剩 {{ pile.currentSession.remainingMin }} 分钟</span>
          </div>
          <div class="zg-cp-card__fee">
            已充 <strong>{{ liveKwhMap[pile.id].toFixed(1) }}</strong> kWh · 已收 ¥<strong>{{ liveFeeMap[pile.id].toFixed(2) }}</strong>
          </div>
        </div>
        <div v-else-if="pile.status === 'FAULT'" class="zg-cp-card__fault">
          <el-icon color="#ef4444"><Warning /></el-icon>
          <span>{{ pile.faultTrace }}</span>
        </div>
        <div v-else class="zg-cp-card__empty">点击查看详情 · 扫码启动</div>

        <div class="zg-cp-card__footer">
          <span>今日充 {{ pile.todayChargeCount }} 次</span>
          <span>{{ pile.todayEnergyKwh }} kWh</span>
        </div>
      </div>
    </div>

    <!-- ========== 详情 Drawer ========== -->
    <el-drawer v-model="detailVisible" :title="detailFocus?.name" size="560px">
      <div v-if="detailFocus" class="zg-cp__drawer-body">

        <!-- 实时充电面板 -->
        <section v-if="detailFocus.status === 'BUSY' && detailFocus.currentSession" class="zg-cp__section">
          <h4 class="zg-cp__section-title">⚡ 实时充电中</h4>
          <div class="zg-cp__live">
            <div class="zg-cp__live-header">
              <span class="zg-cp__live-vehicle">🚗 {{ detailFocus.currentSession.brand }} · {{ detailFocus.currentSession.vehicleNo }}</span>
              <span class="zg-cp__live-start">{{ detailFocus.currentSession.startAt }} 启动</span>
            </div>
            <div class="zg-cp__live-bar-wrap">
              <div class="zg-cp__live-bar" :style="{ width: liveProgressMap[detailFocus.id] + '%' }">
                <span>{{ liveProgressMap[detailFocus.id] }}%</span>
              </div>
            </div>
            <div class="zg-cp__live-metrics">
              <div><span class="lbl">已充</span><span class="val">{{ liveKwhMap[detailFocus.id].toFixed(2) }} kWh</span></div>
              <div><span class="lbl">实时费用</span><span class="val val--warn">¥{{ liveFeeMap[detailFocus.id].toFixed(2) }}</span></div>
              <div><span class="lbl">预估剩余</span><span class="val">{{ detailFocus.currentSession.remainingMin }} 分钟</span></div>
            </div>
          </div>
        </section>

        <!-- 基本档案 -->
        <section class="zg-cp__section">
          <h4 class="zg-cp__section-title">📋 桩体档案</h4>
          <div class="zg-cp__grid">
            <div class="zg-cp__cell"><span class="lbl">桩编号</span><span class="val">{{ detailFocus.id }}</span></div>
            <div class="zg-cp__cell"><span class="lbl">挂装灯杆</span><span class="val">{{ detailFocus.poleId }}</span></div>
            <div class="zg-cp__cell"><span class="lbl">功率</span><span class="val">{{ detailFocus.powerKw }} kW</span></div>
            <div class="zg-cp__cell"><span class="lbl">类型</span><span class="val">{{ detailFocus.type }}</span></div>
            <div class="zg-cp__cell"><span class="lbl">接口</span><span class="val">{{ detailFocus.connector }}</span></div>
            <div class="zg-cp__cell"><span class="lbl">投运日期</span><span class="val">{{ detailFocus.installDate }}</span></div>
            <div class="zg-cp__cell zg-cp__cell--full"><span class="lbl">位置</span><span class="val">{{ detailFocus.geoLabel }}</span></div>
          </div>
        </section>

        <!-- 今日统计 -->
        <section class="zg-cp__section">
          <h4 class="zg-cp__section-title">📊 今日运营</h4>
          <div class="zg-cp__stats">
            <div class="zg-cp__stat"><span class="num">{{ detailFocus.todayChargeCount }}</span><span class="lbl">充电次数</span></div>
            <div class="zg-cp__stat"><span class="num">{{ detailFocus.todayEnergyKwh }}</span><span class="lbl">kWh</span></div>
            <div class="zg-cp__stat"><span class="num">¥{{ detailFocus.todayIncome.toFixed(0) }}</span><span class="lbl">收入</span></div>
            <div class="zg-cp__stat"><span class="num">{{ detailFocus.totalEnergyKwh.toLocaleString() }}</span><span class="lbl">累计 kWh</span></div>
          </div>
        </section>

        <!-- 操作按钮 -->
        <div class="zg-cp__actions">
          <el-button v-if="detailFocus.status === 'FREE'" type="primary" size="large" @click="simulateStartCharge(detailFocus)">
            <el-icon><VideoPlay /></el-icon>模拟车辆驶入开始充电
          </el-button>
          <el-button v-if="detailFocus.status === 'BUSY'" type="danger" size="large" @click="simulateEndCharge(detailFocus)">
            <el-icon><VideoPause /></el-icon>结束充电
          </el-button>
        </div>
      </div>
    </el-drawer>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Lightning, Search, Warning, VideoPlay, VideoPause } from '@element-plus/icons-vue'
import { chargingPiles } from '@/data/mockData'

const rawList = ref([])
const keyword = ref('')
const filterType = ref('')
const filterStatus = ref('')
const detailVisible = ref(false)
const detailFocus = ref(null)

// 实时跳动数据
const liveProgressMap = reactive({}) // { pileId: 32 }
const liveKwhMap = reactive({})
const liveFeeMap = reactive({})
let tickTimer = null

const startTick = () => {
  tickTimer = setInterval(() => {
    rawList.value.forEach(p => {
      if (p.status === 'BUSY') {
        // 进度 +0.4%，kWh +0.12，费用 +0.18
        liveProgressMap[p.id] = Math.min(99, (liveProgressMap[p.id] || 0) + 0.4)
        liveKwhMap[p.id] = (liveKwhMap[p.id] || 0) + 0.12
        liveFeeMap[p.id] = (liveFeeMap[p.id] || 0) + 0.18
      }
    })
  }, 1000)
}
const stopTick = () => { if (tickTimer) clearInterval(tickTimer) }

const initList = () => {
  rawList.value = JSON.parse(JSON.stringify(chargingPiles))
  // 初始化正在充电的桩的实时数据
  rawList.value.forEach(p => {
    if (p.status === 'BUSY' && p.currentSession) {
      liveProgressMap[p.id] = Math.floor(Math.random() * 60) + 20
      liveKwhMap[p.id] = p.currentSession.consumedKwh
      liveFeeMap[p.id] = p.currentSession.feeYuan
    }
  })
}

const filteredList = computed(() => rawList.value.filter(r => {
  if (filterType.value && !r.type.includes(filterType.value)) return false
  if (filterStatus.value && r.status !== filterStatus.value) return false
  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    if (!r.id.toLowerCase().includes(kw) && !r.geoLabel.includes(kw)) return false
  }
  return true
}))

const totalCount = computed(() => rawList.value.length)
const busyCount = computed(() => rawList.value.filter(r => r.status === 'BUSY').length)
const freeCount = computed(() => rawList.value.filter(r => r.status === 'FREE').length)
const faultCount = computed(() => rawList.value.filter(r => r.status === 'FAULT').length)
const totalEnergy = computed(() => rawList.value.reduce((s, r) => s + r.todayEnergyKwh, 0))
const peakLoad = computed(() => rawList.value.filter(r => r.status === 'BUSY').reduce((s, r) => s + r.powerKw, 0))
const todayIncome = computed(() => rawList.value.reduce((s, r) => s + r.todayIncome, 0))

const onCardClick = (pile) => { openDetail(pile) }
const openDetail = (pile) => {
  detailFocus.value = pile
  detailVisible.value = true
}

const simulateStartCharge = (pile) => {
  const mockSessions = [
    { vehicleNo: '粤A·88888', brand: '比亚迪', consumedKwh: 0, feeYuan: 0, startAt: new Date().toTimeString().slice(0,8), remainingMin: 45 },
    { vehicleNo: '粤B·E12345', brand: '小鹏', consumedKwh: 0, feeYuan: 0, startAt: new Date().toTimeString().slice(0,8), remainingMin: 30 },
    { vehicleNo: '粤A·T99999', brand: '特斯拉', consumedKwh: 0, feeYuan: 0, startAt: new Date().toTimeString().slice(0,8), remainingMin: 15 },
    { vehicleNo: '粤S·N56789', brand: '蔚来', consumedKwh: 0, feeYuan: 0, startAt: new Date().toTimeString().slice(0,8), remainingMin: 50 },
  ]
  const sess = mockSessions[Math.floor(Math.random() * mockSessions.length)]
  pile.status = 'BUSY'
  pile.currentSession = sess
  pile.todayChargeCount++
  liveProgressMap[pile.id] = 0
  liveKwhMap[pile.id] = 0
  liveFeeMap[pile.id] = 0
  ElMessage.success(`${pile.id} · 模拟开始充电（${sess.brand}）`)
}
const simulateEndCharge = (pile) => {
  const settleKwh = liveKwhMap[pile.id]
  const settleFee = liveFeeMap[pile.id]
  pile.todayEnergyKwh += settleKwh
  pile.todayIncome += settleFee
  pile.status = 'FREE'
  pile.currentSession = null
  delete liveProgressMap[pile.id]
  delete liveKwhMap[pile.id]
  delete liveFeeMap[pile.id]
  detailFocus.value = null
  detailVisible.value = false
  ElMessage.success(`充电结束 · ${settleKwh.toFixed(1)} kWh · ¥${settleFee.toFixed(2)}`)
}

onMounted(() => { initList(); startTick() })
onUnmounted(() => stopTick())
</script>

<style scoped lang="scss">
// 复用 zg-metrics / zg-filterband 等公共类（从上一个页面来）
.zg-cp { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
.zg-cp__head { display: flex; align-items: center; justify-content: space-between; }
.zg-cp__headline { display: flex; align-items: center; gap: 14px; }
.zg-cp__sigil {
  width: 44px; height: 44px; border-radius: 10px;
  background: linear-gradient(135deg, #f59e0b, #ef4444);
  color: #fff; display: flex; align-items: center; justify-content: center;
}
.zg-cp__title { font-size: 20px; font-weight: 600; color: #1f2d3d; margin: 0 0 4px; }
.zg-cp__sub { font-size: 13px; color: #909399; margin: 0; }

// KPI 复用
.zg-metrics { display: flex; gap: 12px; flex-wrap: wrap; }
.zg-metrics__cell { flex: 1; min-width: 140px; background: #fff; border-radius: 12px; padding: 14px 18px; border: 1px solid #f0f0f0; display: flex; flex-direction: column; gap: 4px; }
.zg-metrics__num { font-size: 22px; font-weight: 700; color: #1f2d3d; }
.zg-metrics__lbl { font-size: 12px; color: #909399; }
.zg-metrics__cell--ok .zg-metrics__num { color: #10b981; }
.zg-metrics__cell--info .zg-metrics__num { color: #6366f1; }
.zg-metrics__cell--warn .zg-metrics__num { color: #f59e0b; }
.zg-metrics__cell--danger .zg-metrics__num { color: #ef4444; }

// 工具栏
.zg-filterband { display: flex; gap: 10px; align-items: center; background: #fff; border-radius: 10px; padding: 10px 14px; border: 1px solid #f0f0f0; }

// 卡片网格
.zg-cp__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 14px; }
.zg-cp-card {
  background: #fff; border-radius: 12px; padding: 18px;
  border: 1px solid #f0f0f0; cursor: pointer;
  transition: all 0.2s; display: flex; flex-direction: column; gap: 10px;
}
.zg-cp-card:hover { box-shadow: 0 4px 16px rgba(99,102,241,0.15); border-color: #6366f1; transform: translateY(-2px); }
.zg-cp-card--busy { border-color: #10b981; background: linear-gradient(180deg, #ecfdf5 0%, #fff 30%); }
.zg-cp-card--fault { border-color: #ef4444; background: linear-gradient(180deg, #fef2f2 0%, #fff 30%); }

.zg-cp-card__head { display: flex; justify-content: space-between; align-items: center; }
.zg-cp-card__id { font-family: monospace; font-size: 14px; font-weight: 600; color: #6366f1; }
.zg-cp-card__name { font-size: 15px; font-weight: 600; color: #1f2d3d; }
.zg-cp-card__spec { display: flex; gap: 6px; flex-wrap: wrap; }
.zg-cp-card__geo { font-size: 12px; color: #909399; }

// 充电进度条
.zg-cp-card__session { background: #fffbeb; border-radius: 8px; padding: 10px; border: 1px solid #fde68a; }
.zg-cp-card__bar { height: 8px; background: #fef3c7; border-radius: 4px; overflow: hidden; margin-bottom: 6px; }
.zg-cp-card__bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #f59e0b, #10b981);
  border-radius: 4px;
  transition: width 1s ease-out;
}
.zg-cp-card__session-info { display: flex; justify-content: space-between; font-size: 12px; color: #606266; }
.zg-cp-card__progress-text { color: #f59e0b; font-weight: 600; }
.zg-cp-card__fee { font-size: 12px; color: #1f2d3d; margin-top: 4px; }
.zg-cp-card__fault { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #ef4444; background: #fef2f2; border-radius: 8px; padding: 8px 10px; }
.zg-cp-card__empty { font-size: 12px; color: #c0c4cc; text-align: center; padding: 6px; }

.zg-cp-card__footer { display: flex; justify-content: space-between; font-size: 12px; color: #909399; padding-top: 6px; border-top: 1px solid #f0f0f0; }

// Drawer
.zg-cp__drawer-body { padding: 0 8px; }
.zg-cp__section { margin-bottom: 22px; }
.zg-cp__section-title { font-size: 14px; font-weight: 600; color: #1f2d3d; margin: 0 0 12px; padding-left: 8px; border-left: 3px solid #f59e0b; }

// 实时充电
.zg-cp__live { background: linear-gradient(135deg, #fffbeb, #fef3c7); border-radius: 10px; padding: 16px; }
.zg-cp__live-header { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13px; }
.zg-cp__live-vehicle { font-weight: 600; color: #1f2d3d; }
.zg-cp__live-start { color: #909399; }
.zg-cp__live-bar-wrap { height: 18px; background: #fef3c7; border-radius: 9px; overflow: hidden; margin-bottom: 10px; }
.zg-cp__live-bar {
  height: 100%;
  background: linear-gradient(90deg, #f59e0b, #10b981);
  border-radius: 9px; color: #fff; font-size: 11px;
  display: flex; align-items: center; justify-content: flex-end; padding-right: 8px;
  transition: width 1s ease-out;
  min-width: 30px;
}
.zg-cp__live-metrics { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
.zg-cp__live-metrics > div { background: #fff; border-radius: 8px; padding: 10px; text-align: center; }
.zg-cp__live-metrics .lbl { display: block; font-size: 11px; color: #909399; }
.zg-cp__live-metrics .val { font-size: 16px; font-weight: 700; color: #1f2d3d; }
.zg-cp__live-metrics .val--warn { color: #ef4444; }

// 档案
.zg-cp__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 14px; }
.zg-cp__cell { background: #f9fafb; border-radius: 8px; padding: 10px 12px; display: flex; flex-direction: column; gap: 2px; }
.zg-cp__cell--full { grid-column: 1 / -1; }
.zg-cp__cell .lbl { font-size: 11px; color: #909399; }
.zg-cp__cell .val { font-size: 14px; color: #1f2d3d; font-weight: 500; }

// 统计
.zg-cp__stats { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px; }
.zg-cp__stat { background: #f9fafb; border-radius: 8px; padding: 12px; text-align: center; display: flex; flex-direction: column; gap: 2px; }
.zg-cp__stat .num { font-size: 18px; font-weight: 700; color: #1f2d3d; }
.zg-cp__stat .lbl { font-size: 11px; color: #909399; }

.zg-cp__actions { margin-top: 20px; }</style>
