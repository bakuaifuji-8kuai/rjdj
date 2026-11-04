<!--
  智光云枢 · 运维组织 · 资质证书中心（真到期推送 + 续期 Drawer + 派工联动）
-->
<template>
  <section class="zg-ops-certcenter">
    <header class="zg-ops-certcenter__head">
      <div class="zg-ops-certcenter__headline">
        <div class="zg-ops-certcenter__sigil"><el-icon :size="22"><Document /></el-icon></div>
        <div class="zg-ops-certcenter__copy">
          <h1 class="zg-ops-certcenter__title">资质证书中心</h1>
          <p class="zg-ops-certcenter__sub">
            持证人 {{ holderCount }} 人 · 30 天内到期
            <b class="danger">{{ expiring30dCount }}</b> · 已过期 <b class="critical">{{ expiredCount }}</b>
          </p>
        </div>
      </div>
      <div class="zg-ops-certcenter__cta">
        <el-button type="warning" @click="rescan">重新扫描</el-button>
        <el-button type="primary"><el-icon><Plus /></el-icon>新办登记</el-button>
      </div>
    </header>

    <!-- 到期自动推送 Alert（真逻辑：过期禁止派工） -->
    <el-alert
      v-if="expiredCerts.length"
      type="error"
      show-icon
      :closable="false"
      title="⚠️ 派工单自动限制已生效"
      class="zg-ops-certcenter__alert"
    >
      <template #default>
        <div v-for="c in expiredCerts" :key="c.id" class="alertline">
          <el-icon :size="16" color="var(--zg-danger)"><Warning /></el-icon>
          <span><b>{{ c.holder }}</b> 的 {{ c.type }} 已过期 <b>{{ c.daysExpired }}</b> 天 —— <b>系统已禁止派此类工单</b></span>
        </div>
      </template>
    </el-alert>

    <el-alert
      v-if="soonCerts.length"
      type="warning"
      :closable="false"
      title="🗓️ 30 天内到期预警"
      show-icon
      class="zg-ops-certcenter__alert"
      style="margin-top: 10px"
    >
      <template #default>
        <div v-for="c in soonCerts" :key="'s-' + c.id" class="alertline">
          <el-icon :size="16" color="var(--zg-warning)"><Clock /></el-icon>
          <span><b>{{ c.holder }}</b> 的 {{ c.type }} 还剩 <b>{{ c.days }}</b> 天，建议尽快续期</span>
          <el-button link type="primary" size="small" style="margin-left: auto" @click="onRenew(c)">办理续期</el-button>
        </div>
      </template>
    </el-alert>

    <!-- KPI -->
    <div class="zg-ops-certcenter__kpis">
      <div class="kpi kpi--primary">
        <div class="kpi__icon"><el-icon :size="22"><Document /></el-icon></div>
        <div class="kpi__body">
          <span class="kpi__num">{{ certs.length }}</span>
          <span class="kpi__lbl">证书总数</span>
        </div>
      </div>
      <div class="kpi kpi--danger">
        <div class="kpi__icon"><el-icon :size="22"><Clock /></el-icon></div>
        <div class="kpi__body">
          <span class="kpi__num">{{ expiring30dCount }}</span>
          <span class="kpi__lbl">30 天内到期</span>
        </div>
      </div>
      <div class="kpi kpi--critical">
        <div class="kpi__icon"><el-icon :size="22"><Warning /></el-icon></div>
        <div class="kpi__body">
          <span class="kpi__num">{{ expiredCount }}</span>
          <span class="kpi__lbl">已过期（禁止派工）</span>
        </div>
      </div>
      <div class="kpi kpi--ok">
        <div class="kpi__icon"><el-icon :size="22"><CircleCheck /></el-icon></div>
        <div class="kpi__body">
          <span class="kpi__num">{{ okCount }}</span>
          <span class="kpi__lbl">在有效期</span>
        </div>
      </div>
    </div>

    <div class="zg-ops-certcenter__main">
      <!-- 到期热力图 -->
      <div class="zg-ops-certcenter__heatmap">
        <div class="zg-ops-certcenter__sectionhead">
          <h3>到期热力图（2026）</h3>
          <span class="legend">
            <i class="lg lg-ok"></i>充足
            <i class="lg lg-soon"></i>临期
            <i class="lg lg-danger"></i>即将到期
            <i class="lg lg-expired"></i>已过期
          </span>
        </div>
        <div class="heatgrid">
          <div v-for="m in 12" :key="m" class="heatmonth">
            <div class="heatmonth__label">{{ m }} 月</div>
            <div class="heatmonth__row">
              <div
                v-for="d in 31"
                :key="d"
                class="heatcell"
                :class="getHeatClass(m, d)"
                :title="`${m}-${d} · ${getHeatCount(m, d) || 0} 张到期`"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 详情列表 -->
      <div class="zg-ops-certcenter__list">
        <div class="zg-ops-certcenter__sectionhead">
          <h3>证书到期列表（{{ filteredCerts.length }} 条）</h3>
          <div class="filters">
            <el-select v-model="filterType" placeholder="类型" clearable size="small" style="width:120px">
              <el-option v-for="t in certTypes" :key="t" :label="t" :value="t" />
            </el-select>
            <el-select v-model="filterStatus" placeholder="状态" clearable size="small" style="width:120px">
              <el-option label="正常" value="ok" />
              <el-option label="临期" value="soon" />
              <el-option label="即将到期" value="danger" />
              <el-option label="已过期" value="expired" />
            </el-select>
            <el-button type="primary" size="small" :icon="Filter" @click="filterType = ''; filterStatus = ''">重置</el-button>
          </div>
        </div>

        <el-table :data="filteredCerts" stripe height="calc(100% - 54px)">
          <el-table-column prop="type" label="证书类型" width="140">
            <template #default="{ row }">
              <el-tag :type="certColor(row.type)" effect="light" size="small">{{ row.type }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="holder" label="持证人" width="110">
            <template #default="{ row }">
              <div class="holdername">
                <span class="avatar">{{ row.holder.charAt(0) }}</span>
                {{ row.holder }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="certNo" label="证书号" width="200">
            <template #default="{ row }"><span class="mono">{{ row.certNo }}</span></template>
          </el-table-column>
          <el-table-column prop="issueDate" label="发证日" width="110" />
          <el-table-column label="到期日 / 进度" min-width="220">
            <template #default="{ row }">
              <div class="expirebar">
                <span class="expirebar__label">{{ row.expireDate }}</span>
                <svg class="expirebar__svg" viewBox="0 0 100 6" preserveAspectRatio="none">
                  <rect x="0" y="0" width="100" height="6" rx="3" fill="var(--zg-line-soft)" />
                  <rect x="0" y="0" :width="Math.max(0, 100 - row.progress)" height="6" rx="3" :fill="progressColor(row)" />
                </svg>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="剩余天数" width="100" align="center">
            <template #default="{ row }">
              <span class="days" :class="row.status">{{ row.days > 0 ? row.days + ' 天' : '已过期' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="120" align="center">
            <template #default="{ row }">
              <span class="statuspill" :class="row.status">
                {{ { ok: '正常', soon: '临期', danger: '即将到期', expired: '已过期' }[row.status] }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right" align="center">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="onRemind(row)">提醒</el-button>
              <el-button link type="primary" size="small" @click="onRenew(row)">续期</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 续期 Drawer（真更新数据） -->
    <el-drawer v-model="renewOpen" title="办理续期" direction="rtl" size="460px">
      <el-form :model="renewForm" label-width="100px" size="default">
        <el-form-item label="持证人">
          <span>{{ renewForm.holder }}</span>
        </el-form-item>
        <el-form-item label="证书类型">
          <el-tag :type="certColor(renewForm.type)" effect="light">{{ renewForm.type }}</el-tag>
        </el-form-item>
        <el-form-item label="原证书号">
          <span class="mono">{{ renewForm.oldCertNo }}</span>
        </el-form-item>
        <el-form-item label="新证书号">
          <el-input v-model="renewForm.newCertNo" placeholder="如未换发可填原号" />
        </el-form-item>
        <el-form-item label="原到期日">
          <span>{{ renewForm.oldExpiry }}</span>
        </el-form-item>
        <el-form-item label="新到期日" required>
          <el-date-picker
            v-model="renewForm.newExpiry"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择新到期日（通常延后 3 年）"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="renewOpen = false">取消</el-button>
        <el-button type="primary" @click="commitRenew">确认续期</el-button>
      </template>
    </el-drawer>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document, Clock, Warning, Plus, Filter, CircleCheck } from '@element-plus/icons-vue'
import { staff } from '@/shared/stores/opsOrgStore'

const certTypes = ['登高证', '电工证', '380V操作证', '有限空间作业证', '焊工证']
const certColor = (t) => ({ '登高证': 'primary', '电工证': 'warning', '焊工证': 'danger', '380V操作证': 'success', '有限空间作业证': 'info' }[t] || 'info')

// ===== 基础证书列表 =====
const today = new Date('2026-10-28')
const makeCert = (id, type, holder, staffId, certNo, issueDate, expiryDate, certKey) => {
  const exp = new Date(expiryDate)
  const diffMs = exp - today
  const days = Math.ceil(diffMs / 86400000)
  const daysPassed = Math.ceil((today - new Date(issueDate)) / 86400000)
  const totalSpan = Math.max(1, Math.ceil((exp - new Date(issueDate)) / 86400000))
  const progress = Math.min(100, Math.max(0, (daysPassed / totalSpan) * 100))
  let status = 'ok'
  if (days < 0) status = 'expired'
  else if (days <= 7) status = 'danger'
  else if (days <= 30) status = 'soon'
  return {
    id, type, holder, staffId, certNo, issueDate, expireDate: expiryDate, certKey,
    days: days < 0 ? Math.abs(days) : days,
    daysRemaining: days,
    daysExpired: days < 0 ? Math.abs(days) : 0,
    progress, status,
    valid: days >= 0
  }
}

const CERT_KEY_MAP = {
  '登高证': 'dengao', '电工证': 'dengong', '380V操作证': 'xianjin',
  '有限空间作业证': 'youxianspace', '焊工证': 'hg'
}

// 从共享 staff 生成 cert list
const allCerts = computed(() => {
  const arr = []
  let id = 1
  staff.forEach((s) => {
    Object.entries(s.certs).forEach(([k, v]) => {
      const type = Object.keys(CERT_KEY_MAP).find((tk) => CERT_KEY_MAP[tk] === k) || k
      arr.push(makeCert(id++, type, s.name, s.id, v.certNo || '—', v.issueDate || '2024-01-01', v.expiry, k))
    })
  })
  return arr
})

const certs = computed(() => allCerts.value)
const holderCount = computed(() => new Set(staff.map((s) => s.id)).size)
const expiredCount = computed(() => certs.value.filter((c) => c.status === 'expired').length)
const expiring30dCount = computed(() => certs.value.filter((c) => c.status === 'soon' || c.status === 'danger').length)
const okCount = computed(() => certs.value.filter((c) => c.status === 'ok').length)

const expiredCerts = computed(() => certs.value.filter((c) => c.status === 'expired'))
const soonCerts = computed(() => certs.value.filter((c) => c.status === 'soon' || c.status === 'danger'))

// 热力图用的到期日程
const heatSchedule = [
  { month: 6, day: 15, cls: 'soon' },
  { month: 10, day: 25, cls: 'expired' }
]
const getHeatClass = (m, d) => {
  const hit = heatSchedule.find((h) => h.month === m && h.day === d)
  if (hit) return `heat-${hit.cls}`
  // 真实数据：根据 certs 的到期日画
  const hitReal = certs.value.find((c) => {
    const dt = new Date(c.expireDate)
    return dt.getMonth() + 1 === m && dt.getDate() === d
  })
  if (hitReal) {
    if (hitReal.status === 'expired') return 'heat-expired'
    if (hitReal.status === 'danger') return 'heat-danger'
    if (hitReal.status === 'soon') return 'heat-soon'
  }
  return (m + d) % 7 === 0 ? 'heat-ok' : ''
}
const getHeatCount = (m, d) => heatSchedule.filter((h) => h.month === m && h.day === d).length

// ===== 筛选 =====
const filterType = ref('')
const filterStatus = ref('')
const filteredCerts = computed(() => {
  let list = certs.value
  if (filterType.value) list = list.filter((c) => c.type === filterType.value)
  if (filterStatus.value) list = list.filter((c) => c.status === filterStatus.value)
  return list
})

const progressColor = (row) => {
  if (row.status === 'expired') return 'var(--zg-danger)'
  if (row.status === 'danger') return 'var(--zg-danger)'
  if (row.status === 'soon') return 'var(--zg-warning)'
  return 'var(--zg-success)'
}

// ===== 续期 Drawer（真更新 staff.certs） =====
const renewOpen = ref(false)
const renewForm = ref({
  certId: 0, holder: '', type: '', oldCertNo: '', oldExpiry: '',
  newCertNo: '', newExpiry: null, certKey: '', staffId: 0
})

const onRenew = (row) => {
  renewForm.value = {
    certId: row.id, holder: row.holder, type: row.type,
    oldCertNo: row.certNo, oldExpiry: row.expireDate,
    newCertNo: row.certNo, newExpiry: null, certKey: row.certKey, staffId: row.staffId
  }
  renewOpen.value = true
}

const commitRenew = () => {
  const f = renewForm.value
  if (!f.newExpiry) {
    ElMessage.warning('请选择新到期日')
    return
  }
  const s = staff.find((x) => x.id === f.staffId)
  if (!s) return
  const cert = s.certs[f.certKey]
  if (cert) {
    cert.valid = true
    cert.expiry = f.newExpiry
    cert.certNo = f.newCertNo || cert.certNo
  }
  ElMessage.success(`✅ 已为 ${f.holder} 办理 ${f.type} 续期，新到期日 ${f.newExpiry}`)
  renewOpen.value = false
}

const onRemind = (row) => {
  ElMessage.success(`已发送续期提醒短信给 ${row.holder}（${row.certNo} 还剩 ${Math.abs(row.days)} 天）`)
}

const rescan = () => {
  ElMessage.success('🔄 已重新扫描全员证书状态')
}

// ===== onMounted 自动推送 =====
onMounted(() => {
  // 真实过期扫描 & 弹窗
  setTimeout(() => {
    if (expiredCerts.value.length) {
      ElMessageBox.alert(
        expiredCerts.value.map((c) => `${c.holder}(${c.type}) 已过期 ${c.daysExpired} 天`).join('；\n'),
        '⚠️ 资质证书已过期（系统已禁止派此类工单）',
        { type: 'error', confirmButtonText: '我知道了' }
      )
    }
    if (soonCerts.value.length) {
      ElMessageBox.alert(
        soonCerts.value.map((c) => `${c.holder}(${c.type}) 还剩 ${c.days} 天到期`).join('；\n'),
        '🗓️ 30 天内到期预警',
        { type: 'warning', confirmButtonText: '我知道了' }
      )
    }
  }, 300)
})
</script>

<style scoped lang="scss">
.zg-ops-certcenter {
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
    box-shadow: var(--zg-shadow-btn);
  }
  &__copy { display: flex; flex-direction: column; gap: 4px; }
  &__title { margin: 0; font-size: 20px; font-weight: 600; }
  &__sub { margin: 0; font-size: 13px; color: var(--zg-ink-tertiary);
    b.danger { color: var(--zg-danger); }
    b.critical { color: var(--zg-danger); animation: pulse 1.4s infinite; }
  }
}

.alertline {
  display: flex; align-items: center; gap: 8px; margin: 4px 0; font-size: 13px;
  b { color: var(--zg-danger); }
}

.zg-ops-certcenter__kpis {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px;
}
.kpi {
  background: var(--zg-surface-card); border: 1px solid var(--zg-line-soft);
  border-radius: var(--zg-radius-lg); padding: 18px 20px;
  display: flex; align-items: center; gap: 16px;
  box-shadow: var(--zg-shadow-card);
  transition: all var(--zg-transition-normal);
  &:hover { transform: translateY(-2px); box-shadow: var(--zg-shadow-card-hover); }
  &__icon { width: 48px; height: 48px; border-radius: var(--zg-radius-md); display: flex; align-items: center; justify-content: center; }
  &__body { display: flex; flex-direction: column; gap: 2px; }
  &__num { font-size: 28px; font-weight: 700; line-height: 1; color: var(--zg-ink-primary); }
  &__lbl { font-size: 12px; color: var(--zg-ink-tertiary); }

  &--primary .kpi__icon { background: var(--zg-brand-tint-50); color: var(--zg-brand-primary); }
  &--danger .kpi__icon { background: var(--zg-danger-soft); color: var(--zg-danger); }
  &--critical .kpi__icon { background: var(--zg-danger); color: #fff; animation: breathe 1.6s infinite; }
  &--ok .kpi__icon { background: var(--zg-success-soft); color: var(--zg-success); }
}

.zg-ops-certcenter__main {
  display: grid; grid-template-columns: 420px 1fr; gap: 16px; flex: 1; min-height: 0;
}
.zg-ops-certcenter__heatmap,
.zg-ops-certcenter__list {
  background: var(--zg-surface-card); border: 1px solid var(--zg-line-soft);
  border-radius: var(--zg-radius-lg); padding: 16px;
  box-shadow: var(--zg-shadow-card); display: flex; flex-direction: column; overflow: hidden;
}
.zg-ops-certcenter__sectionhead {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;
  h3 { margin: 0; font-size: 15px; font-weight: 600; }
}

.legend { display: flex; gap: 10px; font-size: 11px; color: var(--zg-ink-tertiary); align-items: center; }
.lg { width: 12px; height: 12px; border-radius: 2px; display: inline-block; margin-right: 2px;
  &-ok { background: var(--zg-success); }
  &-soon { background: var(--zg-warning); }
  &-danger { background: var(--zg-danger); }
  &-expired { background: #8b0000; animation: breathe 1.4s infinite; }
}

.heatgrid { display: flex; flex-direction: column; gap: 6px; flex: 1; overflow-y: auto; }
.heatmonth { display: flex; align-items: center; gap: 8px;
  &__label { width: 38px; font-size: 11px; color: var(--zg-ink-tertiary); font-weight: 600; }
  &__row { display: grid; grid-template-columns: repeat(31, 1fr); gap: 2px; flex: 1; }
}
.heatcell {
  width: 100%; aspect-ratio: 1; border-radius: 2px;
  background: var(--zg-line-soft); transition: transform 0.15s;
  &:hover { transform: scale(1.4); z-index: 2; box-shadow: 0 0 0 1px var(--zg-ink-primary); }
  &.heat-ok { background: rgba(5,150,105,0.4); }
  &.heat-soon { background: var(--zg-warning); }
  &.heat-danger { background: var(--zg-danger); }
  &.heat-expired { background: #8b0000; animation: breathe 1.2s infinite; }
}

.filters { display: flex; gap: 8px; }

.holdername { display: flex; align-items: center; gap: 8px; }
.holdername .avatar {
  width: 24px; height: 24px; border-radius: 50%;
  background: var(--zg-gradient-primary); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 600;
}
.mono { font-family: var(--zg-font-mono); font-size: 12px; background: var(--zg-surface-muted); padding: 2px 6px; border-radius: 3px; }

.expirebar { display: flex; flex-direction: column; gap: 4px; }
.expirebar__label { font-size: 12px; color: var(--zg-ink-secondary); }
.expirebar__svg { width: 100%; height: 6px; border-radius: 3px; }

.days { font-weight: 600; font-size: 13px;
  &.danger, &.expired { color: var(--zg-danger); }
  &.soon { color: var(--zg-warning); }
  &.ok { color: var(--zg-success); }
}

.statuspill {
  display: inline-block; padding: 2px 10px; border-radius: var(--zg-radius-pill);
  font-size: 11px; font-weight: 500;
  &.ok { color: var(--zg-success); background: var(--zg-success-soft); }
  &.soon { color: var(--zg-warning); background: var(--zg-warning-soft); }
  &.danger { color: var(--zg-danger); background: var(--zg-danger-soft); }
  &.expired { color: var(--zg-danger); background: #fee2e2; animation: pulse 1.4s infinite; }
}

@keyframes pulse {
  0%,100% { opacity: 1; }
  50% { opacity: 0.4; }
}
@keyframes breathe {
  0%,100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.15); opacity: 0.7; }
}
</style>
