<!--
  智光云枢 · 运维组织 · 巡检执行 + 真 GPS 打卡 + Haversine + 异常上报工单
-->
<template>
  <section class="zg-ops-patrolrecord">
    <header class="zg-ops-patrolrecord__head">
      <div class="zg-ops-patrolrecord__headline">
        <div class="zg-ops-patrolrecord__sigil"><el-icon :size="22"><Position /></el-icon></div>
        <div class="zg-ops-patrolrecord__copy">
          <h1 class="zg-ops-patrolrecord__title">巡检执行 + 打卡</h1>
          <p class="zg-ops-patrolrecord__sub">
            本月巡检 {{ kpi.done }}/{{ kpi.total }} · 异常 {{ kpi.anomaly }} · 自动工单 {{ kpi.autoTicket }}
          </p>
        </div>
      </div>
      <div class="zg-ops-patrolrecord__cta">
        <el-tag :type="gpsStatus === 'ready' ? 'success' : (gpsStatus === 'moving' ? 'warning' : 'info')" effect="dark">
          GPS：{{ gpsStatusText }}
        </el-tag>
        <el-button type="primary" :icon="Refresh" @click="forceMoveNow">立即走一步</el-button>
      </div>
    </header>

    <div class="zg-ops-patrolrecord__body">
      <!-- 左：手机端模拟（真 GPS 逻辑） -->
      <div class="zg-ops-patrolrecord__phone">
        <div class="phone-frame">
          <div class="phone-notch"></div>
          <div class="phone-screen">
            <div class="mobile-header">
              <div class="mobile-header__plan">
                <div class="mobile-header__name">PL-202611-先导路</div>
                <div class="mobile-header__chief">
                  负责人：张建国 · 当前 GPS {{ gpsPos.lat.toFixed(5) }},{{ gpsPos.lng.toFixed(5) }}
                </div>
              </div>
              <el-progress :percentage="mobileProgress" :stroke-width="6" :show-text="false" color="var(--zg-gradient-primary)" />
              <div class="mobile-header__count">
                已打卡 <b>{{ doneCount }}</b> / {{ mobilePoints.length }} · 异常 {{ anomalyCount }}
              </div>
            </div>

            <!-- 巡检点列表 -->
            <div class="mobile-points">
              <div
                v-for="(pt, i) in mobilePoints"
                :key="pt.id"
                class="mobile-point"
                :class="'mobile-point--' + pointStatus(pt)"
              >
                <div class="mobile-point__idx">{{ String(i + 1).padStart(2, '0') }}</div>
                <div class="mobile-point__body">
                  <div class="mobile-point__name">{{ pt.name }}</div>
                  <div class="mobile-point__addr">{{ pt.addr }}</div>
                  <div class="mobile-point__gps">
                    <el-icon :size="12"><Position /></el-icon>
                    <span>{{ pt.gps.lat.toFixed(4) }},{{ pt.gps.lng.toFixed(4) }}</span>
                    <span class="mobile-point__dist" :class="{ close: calcDistToPt(pt) <= 20 }">
                      {{ calcDistToPt(pt).toFixed(0) }}m
                    </span>
                  </div>
                </div>
                <div class="mobile-point__action">
                  <button
                    class="gps-btn"
                    :class="{
                      active: calcDistToPt(pt) <= 20 && !pt.checked,
                      disabled: calcDistToPt(pt) > 20 || pt.checked
                    }"
                    :disabled="calcDistToPt(pt) > 20 || pt.checked"
                    @click="gpsCheckIn(pt, i)"
                  >
                    <el-icon :size="16"><Check /></el-icon>
                  </button>
                </div>
              </div>
            </div>

            <!-- 底部 Checklist / 异常上报 -->
            <div class="mobile-bottom">
              <div class="mobile-checklist">
                <div class="mobile-checklist__title">Checklist 执行</div>
                <div class="mobile-checklist__grid">
                  <button v-for="(c, i) in mobileChecks" :key="i" class="mobile-checklist__btn" :class="c.status" @click="toggleCheck(c)">{{ c.label }}</button>
                </div>
              </div>
              <div class="mobile-anomaly">
                <el-button type="danger" size="small" class="mobile-anomaly__btn" @click="onMobileAnomaly">
                  <el-icon><Warning /></el-icon> 一键异常上报
                </el-button>
              </div>
            </div>
          </div>
          <div class="phone-home-bar"></div>
        </div>
      </div>

      <!-- 右：PC 管理视图 -->
      <div class="zg-ops-patrolrecord__pc">
        <!-- 年度巡检时间轴 -->
        <div class="pc-panel">
          <div class="pc-panel__head">
            <h3>年度巡检时间轴</h3>
            <div class="legend">
              <span><i class="dot dot-ok"></i>完成</span>
              <span><i class="dot dot-warn"></i>临期</span>
              <span><i class="dot dot-danger"></i>漏巡检</span>
            </div>
          </div>
          <div class="timeline">
            <div v-for="m in 12" :key="m" class="timemonth">
              <div class="timemonth__label">{{ m }}月</div>
              <div class="timemonth__cells">
                <div v-for="d in 28" :key="d" class="timecell" :class="monthDayStatus(m, d)"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 巡检点热力图 -->
        <div class="pc-panel">
          <div class="pc-panel__head">
            <h3>先导路 30 个巡检点热力图</h3>
            <div class="legend">
              <span><i class="dot dot-ok"></i>已打卡</span>
              <span><i class="dot dot-warn"></i>临期</span>
              <span><i class="dot dot-danger"></i>异常</span>
            </div>
          </div>
          <div class="heatgrid">
            <div v-for="pt in heatPoints" :key="pt.id" class="heatpoint" :class="pt.status">
              <div class="heatpoint__dot"></div>
              <div class="heatpoint__label">{{ pt.name }}</div>
            </div>
          </div>
        </div>

        <!-- 异常列表（动态：本地 + 自动生成） -->
        <div class="pc-panel">
          <div class="pc-panel__head">
            <h3>本月异常（{{ anomalies.length }} 条）</h3>
            <div class="anostats">
              <el-tag size="small" type="danger" effect="plain">自动工单 {{ anomalies.filter((a) => a.autoTicket).length }}</el-tag>
            </div>
          </div>
          <el-table :data="anomalies" stripe size="small">
            <el-table-column prop="time" label="时间" width="150" />
            <el-table-column prop="patrol" label="巡检人" width="90" />
            <el-table-column prop="point" label="巡检点" width="130" />
            <el-table-column prop="type" label="异常类型" width="120">
              <template #default="{ row }">
                <el-tag size="small" :type="row.severity === 'high' ? 'danger' : 'warning'">{{ row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="desc" label="描述" min-width="200" />
            <el-table-column label="处置" width="180">
              <template #default="{ row }">
                <el-tag v-if="row.autoTicket" size="small" type="info" effect="plain">
                  <el-icon><View /></el-icon> 工单 {{ row.ticketNo }}
                </el-tag>
                <el-tag v-else size="small" type="success" effect="plain">直接处理</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>

    <!-- 异常上报 Dialog -->
    <el-dialog v-model="anomalyDialog" title="异常上报" width="460px">
      <div class="anomconfirm">
        <el-form :model="anomalyForm" label-width="90px" size="default">
          <el-form-item label="异常类型">
            <el-select v-model="anomalyForm.type" style="width: 100%">
              <el-option label="灯头不亮" value="灯头不亮" />
              <el-option label="灯杆倾斜" value="灯杆倾斜" />
              <el-option label="配电箱损坏" value="配电箱损坏" />
              <el-option label="线缆破损" value="线缆破损" />
              <el-option label="摄像头离线" value="摄像头离线" />
              <el-option label="亮度不足" value="亮度不足" />
            </el-select>
          </el-form-item>
          <el-form-item label="描述">
            <el-input v-model="anomalyForm.desc" type="textarea" :rows="2" placeholder="简要描述异常情况" />
          </el-form-item>
          <el-form-item label="处置方式">
            <el-checkbox v-model="anomalyForm.genTicket">自动生成工单（关联 GPS）</el-checkbox>
          </el-form-item>
          <el-form-item label="关联巡检点">
            <span style="font-size:12px;color:var(--zg-ink-tertiary)">{{ nearestPoint.name }} · {{ nearestPoint.gps.lat.toFixed(4) }},{{ nearestPoint.gps.lng.toFixed(4) }}</span>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="anomalyDialog = false">取消</el-button>
        <el-button type="danger" @click="confirmAnomaly">确认上报</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Position, Plus, Check, Warning, View, Refresh } from '@element-plus/icons-vue'
import { calcDistance, patrolPoints, patrolRecords, orders, tickets } from '@/shared/stores/opsOrgStore'

// ---- KPI ----
const kpi = ref({ done: 24, total: 30, anomaly: 14, autoTicket: 9 })

// ---- 模拟 GPS（真经纬度） ----
const gpsPos = ref({ lat: 28.2272, lng: 112.9375 })
const gpsStatus = ref('ready') // ready / moving / out

// ---- 手机端巡检点（8 个先导路点） ----
const mobilePoints = ref([
  { id: 1, idx: '01', name: '先导路#01', addr: '先导路与八一路交汇', gps: { lat: 28.2272, lng: 112.9375 }, checked: false },
  { id: 2, idx: '02', name: '先导路#02', addr: '先导路公交站旁', gps: { lat: 28.2276, lng: 112.9378 }, checked: false },
  { id: 3, idx: '03', name: '先导路#03', addr: '先导路银行前', gps: { lat: 28.2280, lng: 112.9382 }, checked: false },
  { id: 4, idx: '04', name: '先导路#04', addr: '先导路商场入口', gps: { lat: 28.2284, lng: 112.9386 }, checked: false },
  { id: 5, idx: '05', name: '先导路#05', addr: '先导路小区对面', gps: { lat: 28.2288, lng: 112.9390 }, checked: false },
  { id: 6, idx: '06', name: '先导路#06', addr: '先导路派出所', gps: { lat: 28.2292, lng: 112.9394 }, checked: false },
  { id: 7, idx: '07', name: '先导路#07', addr: '先导路小学', gps: { lat: 28.2296, lng: 112.9398 }, checked: false },
  { id: 8, idx: '08', name: '先导路#08', addr: '先导路与金星大道交汇', gps: { lat: 28.2300, lng: 112.9402 }, checked: false }
])

const mobileChecks = ref([
  { label: '外观', status: 'ok' },
  { label: '固定', status: 'ok' },
  { label: '灯头', status: 'anomaly' },
  { label: '配电箱', status: 'pending' },
  { label: '安全标识', status: 'pending' }
])

const doneCount = computed(() => mobilePoints.value.filter((p) => p.checked).length)
const anomalyCount = computed(() => mobilePoints.value.filter((p) => p.abnormal).length)
const mobileProgress = computed(() => Math.round((doneCount.value / mobilePoints.value.length) * 100))

// ===== Haversine 距离 =====
const calcDistToPt = (pt) => calcDistance(gpsPos.value, pt.gps)
const pointStatus = (pt) => {
  if (pt.checked) return 'done'
  const d = calcDistToPt(pt)
  if (d <= 20) return 'ready'
  if (d <= 200) return 'near'
  return 'far'
}

// ===== 真 GPS 打卡（模拟：使用浏览器真 API，不支持则用模拟） =====
async function gpsCheckIn(pt, idx) {
  if (pt.checked) {
    ElMessage.info('已打卡')
    return
  }
  // 1) 先尝试浏览器真实 GPS
  let pos = null
  if (typeof navigator !== 'undefined' && navigator.geolocation) {
    try {
      pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
          reject,
          { enableHighAccuracy: true, timeout: 5000 }
        )
      })
    } catch (e) {
      // 浏览器拒绝或不支持 → 使用模拟 gpsPos
      ElMessage.warning('浏览器 GPS 不可用，使用模拟位置计算')
    }
  }
  const realPos = pos || gpsPos.value
  const dist = calcDistance(realPos, pt.gps)
  if (dist <= 20) {
    pt.checked = true
    ElMessage.success(`✅ GPS 打卡成功！${pt.name} 距离 ${dist.toFixed(1)}m`)
    // 同步到共享巡检记录
    patrolRecords.unshift({
      id: 'pr-' + Date.now(),
      empId: 1, // 张建国
      pointId: pt.id,
      pointName: pt.name,
      status: 'done',
      time: Date.now()
    })
    kpi.value.done = Math.min(kpi.value.done + 1, kpi.value.total)
  } else {
    ElMessage.warning(`⚠️ 距离 ${dist.toFixed(0)}m，超出 20m 范围`)
  }
}

// ===== setInterval 模拟人在走 =====
const moveTick = () => {
  const nextIdx = mobilePoints.value.findIndex((p) => !p.checked)
  if (nextIdx === -1) return
  const target = mobilePoints.value[nextIdx].gps
  gpsStatus.value = 'moving'
  // 朝目标移动 60% 距离（带随机偏移 ±5m）
  const dx = target.lng - gpsPos.value.lng
  const dy = target.lat - gpsPos.value.lat
  gpsPos.value = {
    lng: gpsPos.value.lng + dx * 0.6 + (Math.random() - 0.5) * 0.0001,
    lat: gpsPos.value.lat + dy * 0.6 + (Math.random() - 0.5) * 0.0001
  }
  setTimeout(() => (gpsStatus.value = 'ready'), 1500)
}
let moveTimer = null
const forceMoveNow = () => moveTick()

const gpsStatusText = computed(() => {
  if (gpsStatus.value === 'moving') return '移动中…'
  const near = mobilePoints.value.some((p) => calcDistToPt(p) <= 20)
  return near ? '就绪（20m 内可打卡）' : '正常'
})

// ===== Checklist =====
const toggleCheck = (c) => {
  const order = ['pending', 'ok', 'anomaly']
  c.status = order[(order.indexOf(c.status) + 1) % order.length]
}

// ===== 异常上报 =====
const anomalyDialog = ref(false)
const anomalyForm = ref({
  type: '灯头不亮',
  desc: '发现 LED 灯珠烧毁',
  genTicket: true
})

const nearestPoint = computed(() => {
  let best = mobilePoints.value[0]
  let bestD = Infinity
  for (const p of mobilePoints.value) {
    const d = calcDistToPt(p)
    if (d < bestD) { bestD = d; best = p }
  }
  return best
})

const onMobileAnomaly = () => { anomalyDialog.value = true }

const confirmAnomaly = () => {
  anomalyDialog.value = false
  // 1) 异常记录
  const record = {
    time: new Date().toLocaleString('zh-CN', { hour12: false }),
    patrol: '张建国',
    point: nearestPoint.value.name,
    type: anomalyForm.value.type,
    desc: anomalyForm.value.desc,
    severity: anomalyForm.value.type.includes('倾斜') || anomalyForm.value.type.includes('破损') ? 'high' : 'mid',
    autoTicket: anomalyForm.value.genTicket,
    ticketNo: ''
  }
  anomalies.value.unshift(record)
  kpi.value.anomaly++

  // 2) 真生成工单（加入共享 tickets）
  if (anomalyForm.value.genTicket) {
    const ticketId = 'WO-' + Date.now().toString().slice(-7)
    const newOrder = {
      id: Date.now(),
      no: ticketId,
      title: `【巡检异常】${nearestPoint.value.name} ${anomalyForm.value.type}`,
      location: nearestPoint.value.name,
      type: anomalyForm.value.type,
      priority: anomalyForm.value.type.includes('倾斜') ? 'urgent' : 'high',
      skillNeeded: anomalyForm.value.type.includes('摄像头') ? '修摄像头' : '换LED',
      certNeeded: anomalyForm.value.type.includes('倾斜') ? '登高证' : '',
      gps: { ...nearestPoint.value.gps },
      status: 'pending',
      autoCreated: true
    }
    tickets.unshift(newOrder)
    record.ticketNo = ticketId
    kpi.value.autoTicket++
    ElMessage.success(`✅ 已生成工单 ${ticketId}，加入派单池`)
  } else {
    ElMessage.success('✅ 异常已记录，通知调度中心处理')
  }
}

// ---- PC 时间轴 ----
const monthDayStatus = (m, d) => {
  const seed = m * 31 + d
  const v = (seed * 7919) % 100
  if (m >= 11) {
    if (v < 85) return 'ok'
    if (v < 95) return 'warn'
    return 'danger'
  }
  if (v < 80) return 'ok'
  if (v < 92) return 'warn'
  return 'danger'
}

// ---- 热力图 ----
const heatPoints = computed(() => {
  const arr = []
  const names = Array.from({ length: 30 }, (_, i) => `先导路${String(i + 1).padStart(2, '0')}`)
  names.forEach((n, i) => {
    const v = (i * 37 + 13) % 100
    let status = 'ok'
    if (v > 85) status = 'danger'
    else if (v > 70) status = 'warn'
    arr.push({ id: i + 1, name: n, status })
  })
  return arr
})

// ---- 异常列表 ----
const anomalies = ref([
  { time: '11-20 14:22:00', patrol: '张建国', point: '先导路#18', type: '灯头不亮', desc: 'LED 灯珠烧毁，需更换', severity: 'high', autoTicket: true, ticketNo: '202610-0456' },
  { time: '11-19 16:08:00', patrol: '张伟', point: '麓谷#05', type: '配电箱告警', desc: '内部温度 58°C 超阈值', severity: 'high', autoTicket: true, ticketNo: '202610-0455' },
  { time: '11-18 09:45:00', patrol: '李明', point: '梅溪湖#12', type: '摄像头离线', desc: '已离线 2 天，疑似网络故障', severity: 'high', autoTicket: true, ticketNo: '202610-0454' },
  { time: '11-17 11:30:00', patrol: '王芳', point: '金星大道#07', type: '亮度不足', desc: '实际亮度 65%，低于标称', severity: 'mid', autoTicket: true, ticketNo: '202610-0453' },
  { time: '11-16 15:12:00', patrol: '王强', point: '麓山隧道#02', type: '灯组闪烁', desc: '镇流器故障', severity: 'high', autoTicket: true, ticketNo: '202610-0452' },
  { time: '11-15 10:00:00', patrol: '陈明', point: '先导路#33', type: '灯杆倾斜', desc: '倾斜约 8°，有安全隐患', severity: 'high', autoTicket: true, ticketNo: '202610-0451' }
])

// ===== 生命周期 =====
onMounted(() => {
  moveTimer = setInterval(moveTick, 15000)
})
onUnmounted(() => {
  if (moveTimer) clearInterval(moveTimer)
})
</script>

<style scoped lang="scss">
.zg-ops-patrolrecord {
  padding: 24px;
  display: flex; flex-direction: column; gap: 16px;
  height: calc(100vh - 120px);

  &__head {
    display: flex; justify-content: space-between; align-items: center;
    padding-bottom: 14px; border-bottom: 1px solid var(--zg-line-soft);
  }
  &__headline { display: flex; align-items: center; gap: 14px; }
  &__sigil {
    width: 44px; height: 44px; border-radius: var(--zg-radius-md);
    background: var(--zg-gradient-primary); color: #fff;
    display: flex; align-items: center; justify-content: center;
  }
  &__copy { display: flex; flex-direction: column; gap: 4px; }
  &__title { margin: 0; font-size: 20px; font-weight: 600; }
  &__sub { margin: 0; font-size: 13px; color: var(--zg-ink-tertiary); }

  &__body {
    display: grid; grid-template-columns: 390px 1fr; gap: 16px;
    flex: 1; min-height: 0;
  }
}

.zg-ops-patrolrecord__phone { display: flex; align-items: center; justify-content: center; }
.phone-frame {
  width: 375px; height: 720px;
  background: #18181b; border-radius: 44px;
  padding: 12px; position: relative;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
}
.phone-notch { position: absolute; top: 12px; left: 50%; transform: translateX(-50%); width: 120px; height: 26px; background: #18181b; border-radius: 0 0 18px 18px; z-index: 5; }
.phone-screen {
  width: 100%; height: 100%;
  background: var(--zg-surface-base);
  border-radius: 32px;
  overflow: hidden;
  padding: 40px 14px 20px;
  display: flex; flex-direction: column;
}
.phone-home-bar { position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%); width: 120px; height: 4px; background: rgba(255,255,255,0.5); border-radius: 2px; }

.mobile-header {
  background: #fff; border-radius: 12px; padding: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06); margin-bottom: 12px;
  &__plan { margin-bottom: 10px; }
  &__name { font-size: 15px; font-weight: 600; color: var(--zg-ink-primary); }
  &__chief { font-size: 11px; color: var(--zg-ink-tertiary); }
  &__count { font-size: 12px; color: var(--zg-ink-secondary); margin-top: 6px; b { color: var(--zg-brand-primary); font-size: 16px; } }
}

.mobile-points { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; }
.mobile-point {
  background: #fff; border-radius: 12px; padding: 10px 12px;
  display: flex; gap: 10px; align-items: center;
  border: 1px solid var(--zg-line-soft);
  transition: all 0.2s;
  &--done { opacity: 0.7; border-color: var(--zg-success); }
  &--done .mobile-point__idx { background: var(--zg-success); color: #fff; }
  &--ready { border-color: var(--zg-brand-primary); box-shadow: 0 2px 8px -4px rgba(217,119,6,0.3); }
  &--near { opacity: 0.9; }
  &--far { opacity: 0.5; }

  &__idx {
    width: 36px; height: 36px; border-radius: 50%;
    background: var(--zg-surface-muted);
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700; color: var(--zg-ink-secondary);
    flex-shrink: 0;
  }
  &__body { flex: 1; min-width: 0; }
  &__name { font-size: 13px; font-weight: 600; }
  &__addr { font-size: 11px; color: var(--zg-ink-tertiary); margin: 2px 0; }
  &__gps { font-size: 11px; color: var(--zg-ink-tertiary); display: flex; align-items: center; gap: 3px; }
  &__dist { margin-left: 6px; color: var(--zg-danger); font-weight: 600;
    &.close { color: var(--zg-success); }
  }
}
.gps-btn {
  width: 40px; height: 40px; border-radius: 50%;
  border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  background: var(--zg-line-soft); color: var(--zg-ink-tertiary);
  transition: all 0.2s;
  &.active { background: var(--zg-gradient-success); color: #fff; box-shadow: 0 4px 12px -2px rgba(5,150,105,0.4); }
  &.disabled { background: var(--zg-line-soft); color: var(--zg-ink-placeholder); cursor: not-allowed; }
}

.mobile-bottom { display: flex; flex-direction: column; gap: 10px; margin-top: 12px; }
.mobile-checklist {
  background: #fff; border-radius: 12px; padding: 10px;
  &__title { font-size: 12px; font-weight: 600; color: var(--zg-ink-secondary); margin-bottom: 8px; }
  &__grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; }
  &__btn {
    padding: 8px 0; border-radius: 8px; border: none;
    font-size: 11px; font-weight: 600; cursor: pointer;
    background: var(--zg-surface-muted); color: var(--zg-ink-tertiary);
    transition: all 0.15s;
    &.ok { background: var(--zg-success-soft); color: var(--zg-success); }
    &.anomaly { background: var(--zg-danger-soft); color: var(--zg-danger); }
    &.pending { background: var(--zg-surface-muted); color: var(--zg-ink-tertiary); }
  }
}
.mobile-anomaly__btn { width: 100%; }

.zg-ops-patrolrecord__pc { display: flex; flex-direction: column; gap: 14px; overflow-y: auto; padding-right: 4px; }
.pc-panel {
  background: var(--zg-surface-card);
  border: 1px solid var(--zg-line-soft);
  border-radius: var(--zg-radius-lg); padding: 14px 16px;
  box-shadow: var(--zg-shadow-card);
  &__head {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 12px;
    h3 { margin: 0; font-size: 15px; font-weight: 600; }
  }
}
.legend { display: flex; gap: 12px; font-size: 11px; color: var(--zg-ink-tertiary); align-items: center;
  .dot { width: 10px; height: 10px; border-radius: 2px; display: inline-block; margin-right: 4px; vertical-align: middle; }
  .dot-ok { background: var(--zg-success); }
  .dot-warn { background: var(--zg-warning); }
  .dot-danger { background: var(--zg-danger); }
}

.timeline { display: flex; flex-direction: column; gap: 6px; }
.timemonth { display: flex; gap: 8px; align-items: center;
  &__label { width: 30px; font-size: 11px; font-weight: 600; color: var(--zg-ink-tertiary); }
  &__cells { display: flex; gap: 2px; flex: 1; }
}
.timecell { flex: 1; height: 16px; border-radius: 2px; background: var(--zg-line-soft);
  &.ok { background: rgba(5,150,105,0.5); }
  &.warn { background: var(--zg-warning); }
  &.danger { background: var(--zg-danger); }
}

.heatgrid { display: grid; grid-template-columns: repeat(10, 1fr); gap: 8px; }
.heatpoint {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 8px 4px; border-radius: var(--zg-radius-md);
  border: 1px solid var(--zg-line-soft); transition: all var(--zg-transition-fast);
  cursor: pointer;
  &:hover { transform: scale(1.05); box-shadow: var(--zg-shadow-card-hover); }
  &__dot { width: 20px; height: 20px; border-radius: 50%; background: var(--zg-success); }
  &__label { font-size: 10px; color: var(--zg-ink-tertiary); }
  &.ok .heatpoint__dot { background: var(--zg-success); }
  &.warn .heatpoint__dot { background: var(--zg-warning); }
  &.danger { background: #fff2f2;
    .heatpoint__dot { background: var(--zg-danger); animation: pulseDot 1.4s infinite; }
  }
}
@keyframes pulseDot {
  0%,100% { transform: scale(1); }
  50% { transform: scale(1.25); }
}

.anostats { display: flex; gap: 6px; }
</style>
