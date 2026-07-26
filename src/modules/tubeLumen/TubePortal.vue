<template>
  <section class="zg-tubeportal">
    <header class="zg-tubeportal__head">
      <div class="zg-tubeportal__sigil">
        <el-icon :size="24"><Guide /></el-icon>
      </div>
      <div class="zg-tubeportal__copy">
        <h1 class="zg-tubeportal__title">隧道总览</h1>
        <p class="zg-tubeportal__subtitle">管廊照明一站式监控指挥中心</p>
      </div>
      <div class="zg-tubeportal__actions">
        <el-button @click="onRefreshData()">
          <el-icon><RefreshLeft /></el-icon>
          刷新数据
        </el-button>
      </div>
    </header>

    <div class="zg-metrics">
      <div class="zg-metrics__cell">
        <div class="zg-metrics__icon primary">
          <el-icon :size="24"><Guide /></el-icon>
        </div>
        <div class="zg-metrics__info">
          <div class="zg-metrics__value">{{ stats.totalTunnels }}</div>
          <div class="zg-metrics__label">隧道总数</div>
        </div>
      </div>
      <div class="zg-metrics__cell">
        <div class="zg-metrics__icon success">
          <el-icon :size="24"><SuccessFilled /></el-icon>
        </div>
        <div class="zg-metrics__info">
          <div class="zg-metrics__value">{{ stats.onlineTunnels }}</div>
          <div class="zg-metrics__label">在线隧道</div>
        </div>
      </div>
      <div class="zg-metrics__cell">
        <div class="zg-metrics__icon danger">
          <el-icon :size="24"><WarningFilled /></el-icon>
        </div>
        <div class="zg-metrics__info">
          <div class="zg-metrics__value">{{ stats.alarms }}</div>
          <div class="zg-metrics__label">告警数量</div>
        </div>
      </div>
      <div class="zg-metrics__cell">
        <div class="zg-metrics__icon warning">
          <el-icon :size="24"><PieChart /></el-icon>
        </div>
        <div class="zg-metrics__info">
          <div class="zg-metrics__value">{{ stats.energyConsumption }}</div>
          <div class="zg-metrics__label">今日能耗(kWh)</div>
        </div>
      </div>
    </div>

    <div class="zg-contentgrid">
      <div class="zg-contentgrid__item tunnel-list">
        <div class="zg-panel__head">
          <h3>管廊列表</h3>
        </div>
        <el-table :data="portalCtl.pagedRows" border class="zg-table">
          <el-table-column prop="name" label="隧道名称" width="150" />
          <el-table-column prop="location" label="所在区域" width="120" />
          <el-table-column prop="length" label="长度(m)" width="100" />
          <el-table-column prop="status" label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="row.status === '在线' ? 'success' : 'danger'" size="small">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="devices" label="设备数量" width="100" />
          <el-table-column label="处置" width="180">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="portalInspector.openInspector(row)">查看</el-button>
              <el-button type="text" size="small" @click="portalForm.openReviser(row)">编辑</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="zg-contentgrid__item environment-monitor">
        <div class="zg-panel__head">
          <h3>环境监测</h3>
        </div>
        <div class="zg-monitorgrid">
          <div class="zg-monitoritem">
            <div class="zg-monitoritem__label">CO浓度</div>
            <div class="zg-monitoritem__value">35 <span>ppm</span></div>
            <div class="zg-monitoritem__status normal">正常</div>
          </div>
          <div class="zg-monitoritem">
            <div class="zg-monitoritem__label">能见度</div>
            <div class="zg-monitoritem__value">850 <span>m</span></div>
            <div class="zg-monitoritem__status normal">正常</div>
          </div>
          <div class="zg-monitoritem">
            <div class="zg-monitoritem__label">风速</div>
            <div class="zg-monitoritem__value">2.5 <span>m/s</span></div>
            <div class="zg-monitoritem__status normal">正常</div>
          </div>
          <div class="zg-monitoritem">
            <div class="zg-monitoritem__label">光照度</div>
            <div class="zg-monitoritem__value">450 <span>lux</span></div>
            <div class="zg-monitoritem__status normal">正常</div>
          </div>
        </div>
      </div>

      <div class="zg-contentgrid__item alarm-list">
        <div class="zg-panel__head">
          <h3>最新告警</h3>
        </div>
        <div class="zg-alarmitems">
          <div v-for="alarm in recentAlarms" :key="alarm.id" class="zg-alarmitem">
            <div class="zg-alarmitem__icon" :class="alarm.level">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="zg-alarmitem__content">
              <div class="zg-alarmitem__title">{{ alarm.title }}</div>
              <div class="zg-alarmitem__info">
                <span>{{ alarm.tunnel }}</span>
                <span>{{ alarm.time }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="zg-contentgrid__item energy-chart">
        <div class="zg-panel__head">
          <h3>能耗趋势</h3>
          <el-select size="small" v-model="energyTimeRange" style="width: 120px;">
            <el-option label="今日" value="today" />
            <el-option label="本周" value="week" />
            <el-option label="本月" value="month" />
          </el-select>
        </div>
        <div class="zg-chartplaceholder">
          <div class="zg-chartbar">
            <div v-for="(value, index) in energyData" :key="index" class="zg-baritem">
              <div class="zg-bar" :style="{ height: value + '%' }"></div>
              <div class="zg-barlabel">{{ index + 1 }}时</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-drawer
      :title="portalForm.editMode === 'compose' ? '编排隧道' : '修订隧道'"
      v-model="portalForm.drawerOpen"
      :size="'560px'"
      direction="rtl"
      @close="portalForm.onDraftDiscard()"
    >
      <el-form :model="portalForm.draftPayload" label-width="100px" class="zg-form">
        <el-form-item label="隧道名称">
          <el-input v-model="portalForm.draftPayload.name" placeholder="请输入隧道名称" />
        </el-form-item>
        <el-form-item label="所在区域">
          <el-select v-model="portalForm.draftPayload.region" placeholder="请选择区域">
            <el-option label="长沙" value="长沙" />
            <el-option label="长沙/岳麓区" value="长沙/岳麓区" />
            <el-option label="长沙-岳麓区-先导路" value="长沙-岳麓区-先导路" />
          </el-select>
        </el-form-item>
        <el-form-item label="隧道长度(m)">
          <el-input-number v-model="portalForm.draftPayload.length" :min="0" />
        </el-form-item>
        <el-form-item label="车道数量">
          <el-input-number v-model="portalForm.draftPayload.lanes" :min="1" :max="10" />
        </el-form-item>
        <el-form-item label="设计时速">
          <el-input-number v-model="portalForm.draftPayload.speed" :min="0" /> km/h
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="portalForm.onDraftDiscard()">取消</el-button>
        <el-button type="primary" :loading="portalForm.submitting" @click="onCommitTunnelDraft()">确定</el-button>
      </template>
    </el-drawer>

    <el-drawer
      :title="portalInspector.loading ? '加载中...' : '隧道详情'"
      v-model="portalInspector.drawerOpen"
      :size="portalInspector.drawerSize"
      :direction="portalInspector.drawerDirection"
      @close="portalInspector.closeInspector()"
    >
      <div v-if="focusedTunnel" class="zg-inspector">
        <el-descriptions :column="2" border class="zg-inspector__desc">
          <el-descriptions-item label="隧道名称">{{ focusedTunnel.name }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="focusedTunnel.status === '在线' ? 'success' : 'danger'">{{ focusedTunnel.status }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="所在区域">{{ focusedTunnel.location }}</el-descriptions-item>
          <el-descriptions-item label="隧道长度">{{ focusedTunnel.length }}m</el-descriptions-item>
          <el-descriptions-item label="设备数量">{{ focusedTunnel.devices }}台</el-descriptions-item>
        </el-descriptions>
        <div class="zg-inspector__actions">
          <el-button type="primary" @click="portalForm.openReviser(focusedTunnel)">修订</el-button>
        </div>
      </div>
    </el-drawer>
  </section>
</template>

<script setup>
/**
 * 智光云枢 · 管廊照明 · 管廊总览
 * 业务域：tubeLumen
 * 功能：页面级业务组件
 * @module tubeLumen/TubePortal
 * @author 智光云枢研发团队
 */
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Guide, SuccessFilled, WarningFilled, PieChart, Warning, RefreshLeft } from '@element-plus/icons-vue'
import { usePresetTable } from '@/shared/composables/usePresetTable'
import { useFormDraft } from '@/shared/composables/useFormDraft'
import { useDrawerInspector } from '@/shared/composables/useDrawerInspector'

const energyTimeRange = ref('today')

const stats = ref({
  totalTunnels: 12,
  onlineTunnels: 10,
  alarms: 3,
  energyConsumption: 45230
})

const initialTubes = [
  { id: 1, name: '先导路', location: '长沙-岳麓区-先导路', length: 1000, status: '在线', devices: 156 }
]

const recentAlarms = ref([
  { id: 1, title: '照明设备故障', tunnel: '先导路', time: '10:25', level: 'warning' },
  { id: 2, title: 'CO浓度超标', tunnel: '先导路', time: '09:15', level: 'danger' },
  { id: 3, title: '通风系统异常', tunnel: '先导路', time: '08:30', level: 'warning' }
])

const energyData = ref([45, 52, 38, 42, 55, 68, 75, 82, 78, 65, 58, 48])

const portalCtl = usePresetTable(null, { defaultPageSpan: 10, initialData: initialTubes })

const portalForm = useFormDraft({
  name: '',
  region: '',
  length: 0,
  lanes: 2,
  speed: 60
})

const portalInspector = useDrawerInspector({ size: '560px', direction: 'rtl' })

const focusedTunnel = computed(() => portalInspector.focusedRecord)

/**
 * 刷新统计数据
 */
const onRefreshData = () => {
  ElMessage.success('数据刷新成功')
}

/**
 * 提交隧道草稿
 */
const onCommitTunnelDraft = async () => {
  const result = await portalForm.onDraftCommit()
  if (result) {
    portalCtl.reviseRecord(portalForm.originRecord.id, result)
    ElMessage.success('隧道修订成功')
  }
}
</script>

<style scoped lang="scss">
.zg-tubeportal {
  padding: var(--zg-space-6);
  background: var(--zg-canvas-mist);
  min-height: 100%;
}

.zg-tubeportal__head {
  display: flex;
  align-items: center;
  gap: var(--zg-space-4);
  margin-bottom: var(--zg-space-6);
}

.zg-tubeportal__sigil {
  width: 48px;
  height: 48px;
  border-radius: var(--zg-radius-lg);
  background: var(--zg-gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.zg-tubeportal__copy {
  flex: 1;
}

.zg-tubeportal__title {
  margin: 0;
  font-size: var(--zg-text-display-md);
  font-weight: 600;
  color: var(--zg-ink-primary);
  letter-spacing: -0.3px;
}

.zg-tubeportal__subtitle {
  margin: 4px 0 0;
  font-size: var(--zg-text-body-sm);
  color: var(--zg-ink-secondary);
}

.zg-tubeportal__actions {
  display: flex;
  gap: var(--zg-space-3);
}

.zg-metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--zg-space-4);
  margin-bottom: var(--zg-space-6);
}

.zg-metrics__cell {
  background: #fff;
  border-radius: var(--zg-radius-lg);
  padding: var(--zg-space-4);
  display: flex;
  align-items: center;
  gap: var(--zg-space-4);
  box-shadow: var(--zg-shadow-card);
}

.zg-metrics__icon {
  width: 56px;
  height: 56px;
  border-radius: var(--zg-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.zg-metrics__icon.primary {
  background: var(--zg-gradient-primary);
}

.zg-metrics__icon.success {
  background: var(--zg-gradient-success);
}

.zg-metrics__icon.danger {
  background: var(--zg-gradient-danger);
}

.zg-metrics__icon.warning {
  background: var(--zg-gradient-warning);
}

.zg-metrics__info {
  flex: 1;
}

.zg-metrics__value {
  font-size: var(--zg-text-display-lg);
  font-weight: 700;
  color: var(--zg-ink-primary);
  line-height: 1.2;
  letter-spacing: -0.5px;
}

.zg-metrics__label {
  font-size: var(--zg-text-body-sm);
  color: var(--zg-ink-secondary);
  margin-top: 6px;
}

.zg-contentgrid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--zg-space-4);
}

.zg-contentgrid__item {
  background: #fff;
  border-radius: var(--zg-radius-lg);
  padding: var(--zg-space-4);
  box-shadow: var(--zg-shadow-card);
}

.zg-panel__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--zg-space-4);
  padding-bottom: var(--zg-space-3);
  border-bottom: 1px solid var(--zg-ghost-border);
}

.zg-panel__head h3 {
  margin: 0;
  font-size: var(--zg-text-body-lg);
  font-weight: 600;
  color: var(--zg-ink-primary);
}

.tunnel-list {
  grid-column: span 2;
}

.zg-table {
  --el-table-header-bg-color: var(--zg-surface-muted);
  --el-table-header-text-color: var(--zg-ink-secondary);
  --el-table-row-hover-bg-color: var(--zg-canvas-mist);
  --el-table-border-color: var(--zg-ghost-border);
  border-radius: var(--zg-radius-md);
  overflow: hidden;
}

.zg-monitorgrid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--zg-space-3);
}

.zg-monitoritem {
  background: var(--zg-surface-muted);
  border-radius: var(--zg-radius-md);
  padding: var(--zg-space-4);
  text-align: center;
  border: 1px solid var(--zg-ghost-border);
  transition: all 0.2s ease;
}

.zg-monitoritem:hover {
  background: var(--zg-canvas-mist);
}

.zg-monitoritem__label {
  font-size: var(--zg-text-body-sm);
  color: var(--zg-ink-secondary);
  margin-bottom: 8px;
}

.zg-monitoritem__value {
  font-size: var(--zg-text-display-sm);
  font-weight: 700;
  color: var(--zg-amber-glow);
}

.zg-monitoritem__value span {
  font-size: var(--zg-text-caption);
  font-weight: 400;
  color: var(--zg-whisper-tertiary);
}

.zg-monitoritem__status {
  font-size: var(--zg-text-caption);
  margin-top: 6px;
}

.zg-monitoritem__status.normal {
  color: var(--zg-emerald-success);
  font-weight: 500;
}

.zg-alarmitems {
  display: flex;
  flex-direction: column;
  gap: var(--zg-space-3);
}

.zg-alarmitem {
  display: flex;
  align-items: center;
  gap: var(--zg-space-4);
  padding: var(--zg-space-4);
  background: var(--zg-surface-muted);
  border-radius: var(--zg-radius-md);
  border: 1px solid var(--zg-ghost-border);
  transition: all 0.2s ease;
}

.zg-alarmitem:hover {
  background: var(--zg-canvas-mist);
}

.zg-alarmitem__icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.zg-alarmitem__icon.warning {
  background: var(--zg-gradient-warning);
}

.zg-alarmitem__icon.danger {
  background: var(--zg-gradient-danger);
}

.zg-alarmitem__content {
  flex: 1;
  min-width: 0;
}

.zg-alarmitem__title {
  font-size: var(--zg-text-body-sm);
  font-weight: 500;
  color: var(--zg-ink-primary);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.zg-alarmitem__info {
  font-size: var(--zg-text-caption);
  color: var(--zg-whisper-tertiary);
  display: flex;
  gap: var(--zg-space-4);
}

.zg-chartplaceholder {
  height: 200px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0 10px;
}

.zg-chartbar {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  height: 100%;
  padding: var(--zg-space-4) 0;
  width: 100%;
}

.zg-baritem {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.zg-bar {
  width: 100%;
  max-width: 28px;
  background: var(--zg-gradient-primary);
  border-radius: var(--zg-radius-sm) var(--zg-radius-sm) 2px 2px;
  min-height: 8px;
  transition: height 0.3s ease;
}

.zg-barlabel {
  font-size: var(--zg-text-caption);
  color: var(--zg-whisper-tertiary);
  margin-top: 6px;
}

.zg-inspector {
  padding: var(--zg-space-3);
}

.zg-inspector__desc {
  margin-bottom: var(--zg-space-4);
}

.zg-inspector__actions {
  display: flex;
  gap: var(--zg-space-3);
  justify-content: flex-end;
}

.zg-form {
  padding: var(--zg-space-3);
}
</style>