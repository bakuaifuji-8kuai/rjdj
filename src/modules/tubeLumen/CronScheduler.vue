<template>
  <section class="zg-cronscheduler">
    <header class="zg-cronscheduler__head">
      <div class="zg-cronscheduler__sigil">
        <el-icon :size="24"><Timer /></el-icon>
      </div>
      <div class="zg-cronscheduler__copy">
        <h1 class="zg-cronscheduler__title">时序调度</h1>
        <p class="zg-cronscheduler__subtitle">管廊照明时段调光配置管理</p>
      </div>
      <div class="zg-cronscheduler__actions">
        <el-button type="primary" @click="scheduleForm.openComposer()">
          <el-icon :size="16"><Plus /></el-icon>
          添加时段
        </el-button>
      </div>
    </header>

    <div class="zg-metrics">
      <div class="zg-metrics__cell">
        <div class="zg-metrics__value">{{ scheduleCtl.totalRows }}</div>
        <div class="zg-metrics__label">时段总数</div>
      </div>
      <div class="zg-metrics__cell">
        <div class="zg-metrics__value">{{ inServiceCount }}</div>
        <div class="zg-metrics__label">在役时段</div>
      </div>
      <div class="zg-metrics__cell">
        <div class="zg-metrics__value">{{ retiredCount }}</div>
        <div class="zg-metrics__label">停用时段</div>
      </div>
      <div class="zg-metrics__cell">
        <div class="zg-metrics__value">{{ executeCount }}</div>
        <div class="zg-metrics__label">执行次数</div>
      </div>
    </div>

    <div class="zg-filterband">
      <div class="zg-filterband__view">
        <el-button-group>
          <el-button :type="densityMode === 'card' ? 'primary' : 'default'" @click="densityMode = 'card'">
            <el-icon><Grid /></el-icon>
            卡片
          </el-button>
          <el-button :type="densityMode === 'list' ? 'primary' : 'default'" @click="densityMode = 'list'">
            <el-icon><List /></el-icon>
            列表
          </el-button>
        </el-button-group>
      </div>
      <div class="zg-filterband__fields">
        <el-select v-model="scheduleCtl.statusBuckets" placeholder="全部状态" class="zg-filterband__select">
          <el-option label="全部" value=""></el-option>
          <el-option label="在役" value="在役"></el-option>
          <el-option label="停用" value="停用"></el-option>
        </el-select>
        <el-input
          v-model="scheduleCtl.filterLexicon"
          placeholder="搜索时段名称"
          class="zg-filterband__input"
          @keyup.enter="scheduleCtl.onFilterApply()"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-button type="primary" @click="scheduleCtl.onFilterApply()">检索</el-button>
        <el-button @click="scheduleCtl.onFilterReset()">重置</el-button>
      </div>
    </div>

    <div class="zg-timeslotgrid" v-if="densityMode === 'card'">
      <div
        v-for="slot in scheduleCtl.pagedRows"
        :key="slot.id"
        class="zg-timeslotcard"
        @click="scheduleInspector.openInspector(slot)"
      >
        <div class="zg-timeslotcard__head">
          <span class="zg-timeslotcard__title">{{ slot.name }}</span>
          <el-tag :type="slot.status === '在役' ? 'success' : 'warning'" size="small">
            {{ slot.status }}
          </el-tag>
        </div>
        <div class="zg-timeslotcard__body">
          <div class="zg-timeslotcard__timerange">{{ slot.startTime }} - {{ slot.endTime }}</div>
          <div class="zg-timeslotcard__brightness">
            调光值: <strong>{{ slot.brightness }}%</strong>
          </div>
          <div class="zg-timeslotcard__section">适用分段: {{ slot.section }}</div>
        </div>
        <div class="zg-timeslotcard__foot">
          <el-button type="text" size="small" @click.stop="scheduleForm.openReviser(slot)">修改</el-button>
          <el-button type="text" size="small" @click.stop="onRetireSchedule(slot)">废止</el-button>
        </div>
      </div>
    </div>

    <div class="zg-tablewrap" v-else>
      <el-table :data="scheduleCtl.pagedRows" border class="zg-table">
        <el-table-column prop="id" label="No" width="60" />
        <el-table-column prop="name" label="时段名称" width="120" />
        <el-table-column prop="startTime" label="开始时间" width="100" />
        <el-table-column prop="endTime" label="结束时间" width="100" />
        <el-table-column prop="brightness" label="调光值" width="100">
          <template #default="{ row }">{{ row.brightness }}%</template>
        </el-table-column>
        <el-table-column prop="section" label="适用分段" width="150" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === '在役' ? 'success' : 'warning'">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="处置" width="200">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="scheduleInspector.openInspector(row)">详情</el-button>
            <el-button type="text" size="small" @click="scheduleForm.openReviser(row)">修改</el-button>
            <el-button type="danger" size="small" @click="onRetireSchedule(row)">废止</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="zg-pagerbar">
      <el-pagination
        v-model:current-page="scheduleCtl.pagingCursor"
        v-model:page-size="scheduleCtl.pageSpan"
        :total="scheduleCtl.totalRows"
        :page-sizes="[10, 15, 20, 50]"
        layout="prev, pager, next, jumper, ->, sizes, total"
      />
    </div>

    <el-drawer
      :title="scheduleInspector.loading ? '加载中...' : '时段详情'"
      :visible="scheduleInspector.drawerOpen"
      :size="scheduleInspector.drawerSize"
      :direction="scheduleInspector.drawerDirection"
      @close="scheduleInspector.closeInspector()"
    >
      <div v-if="focusedSchedule" class="zg-inspector">
        <el-descriptions :column="2" border class="zg-inspector__desc">
          <el-descriptions-item label="时段名称">{{ focusedSchedule.name }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="focusedSchedule.status === '在役' ? 'success' : 'warning'">{{ focusedSchedule.status }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="开始时间">{{ focusedSchedule.startTime }}</el-descriptions-item>
          <el-descriptions-item label="结束时间">{{ focusedSchedule.endTime }}</el-descriptions-item>
          <el-descriptions-item label="调光值">{{ focusedSchedule.brightness }}%</el-descriptions-item>
          <el-descriptions-item label="适用分段">{{ focusedSchedule.section }}</el-descriptions-item>
        </el-descriptions>
        <div class="zg-inspector__actions">
          <el-button type="primary" @click="scheduleForm.openReviser(focusedSchedule)">修订</el-button>
          <el-button @click="onToggleSchedule(focusedSchedule)">
            {{ focusedSchedule.status === '在役' ? '停用' : '启用' }}
          </el-button>
        </div>
      </div>
    </el-drawer>

    <el-drawer
      :title="scheduleForm.editMode === 'compose' ? '编排时段' : '修订时段'"
      :visible="scheduleForm.drawerOpen"
      :size="'560px'"
      direction="rtl"
      @close="scheduleForm.onDraftDiscard()"
    >
      <el-form :model="scheduleForm.draftPayload" label-width="80px" class="zg-form">
        <el-form-item label="时段名称">
          <el-input v-model="scheduleForm.draftPayload.name" placeholder="请输入时段名称" />
        </el-form-item>
        <el-form-item label="开始时间">
          <el-time-picker v-model="scheduleForm.draftPayload.startTime" format="HH:mm" />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-time-picker v-model="scheduleForm.draftPayload.endTime" format="HH:mm" />
        </el-form-item>
        <el-form-item label="调光值">
          <el-slider v-model="scheduleForm.draftPayload.brightness" :min="0" :max="100" show-input />
        </el-form-item>
        <el-form-item label="适用分段">
          <el-select v-model="scheduleForm.draftPayload.section" multiple>
            <el-option label="入口段" value="入口段" />
            <el-option label="基本段" value="基本段" />
            <el-option label="出口段" value="出口段" />
          </el-select>
        </el-form-item>
        <el-form-item label="在役">
          <el-switch v-model="scheduleForm.draftPayload.status" active-value="在役" inactive-value="停用" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="scheduleForm.onDraftDiscard()">取消</el-button>
        <el-button type="primary" :loading="scheduleForm.submitting" @click="onCommitScheduleDraft()">确定</el-button>
      </template>
    </el-drawer>
  </section>
</template>

<script setup>
/**
 * 智光云枢 · 管廊照明 · 时序调度
 * 业务域：tubeLumen
 * 功能：页面级业务组件
 * @module tubeLumen/CronScheduler
 * @author 智光云枢研发团队
 */
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Timer, Plus, Grid, List, Search } from '@element-plus/icons-vue'
import { usePresetTable } from '@/shared/composables/usePresetTable'
import { useFormDraft } from '@/shared/composables/useFormDraft'
import { useDrawerInspector } from '@/shared/composables/useDrawerInspector'

const densityMode = ref('card')

const initialSchedules = [
  { id: 1, name: '凌晨时段', startTime: '00:00', endTime: '06:00', brightness: 10, section: '基本段', status: '在役' },
  { id: 2, name: '白天时段', startTime: '06:00', endTime: '18:00', brightness: 30, section: '基本段', status: '在役' },
  { id: 3, name: '傍晚时段', startTime: '18:00', endTime: '20:00', brightness: 20, section: '入口段', status: '在役' },
  { id: 4, name: '夜间时段', startTime: '20:00', endTime: '24:00', brightness: 15, section: '基本段', status: '在役' }
]

const scheduleCtl = usePresetTable(null, { defaultPageSpan: 15, initialData: initialSchedules })

const scheduleForm = useFormDraft({
  name: '',
  startTime: '00:00',
  endTime: '06:00',
  brightness: 10,
  section: [],
  status: '在役'
})

const scheduleInspector = useDrawerInspector({ size: '680px', direction: 'rtl' })

const focusedSchedule = computed(() => scheduleInspector.focusedRecord)

const inServiceCount = computed(() =>
  scheduleCtl.presetPlaybook.filter(r => r.status === '在役').length
)

const retiredCount = computed(() =>
  scheduleCtl.presetPlaybook.filter(r => r.status === '停用').length
)

const executeCount = ref(128)

/**
 * 提交时段草稿
 */
const onCommitScheduleDraft = async () => {
  const result = await scheduleForm.onDraftCommit()
  if (result) {
    if (scheduleForm.editMode === 'compose') {
      scheduleCtl.appendRecord(result)
      ElMessage.success('时段编排成功')
    } else {
      scheduleCtl.reviseRecord(scheduleForm.originRecord.id, result)
      ElMessage.success('时段修订成功')
    }
  }
}

/**
 * 投切时段启停状态
 * @param {Object} slot 时段记录
 */
const onToggleSchedule = (slot) => {
  const targetStatus = slot.status === '在役' ? '停用' : '在役'
  ElMessageBox.confirm(`确定要${targetStatus === '在役' ? '启用' : '停用'}此时段吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    scheduleCtl.reviseRecord(slot.id, { status: targetStatus })
    ElMessage.success(`时段已${targetStatus}`)
  }).catch(() => {})
}

/**
 * 废止时段
 * @param {Object} slot 时段记录
 */
const onRetireSchedule = (slot) => {
  ElMessageBox.confirm('确定要废止此时段吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    scheduleCtl.retireRecord(slot.id)
    ElMessage.success('时段已废止')
  }).catch(() => {})
}
</script>

<style scoped lang="scss">
.zg-cronscheduler {
  background: var(--zg-bg-page);
  min-height: 100%;
  padding: var(--zg-spacing-lg);
}

.zg-cronscheduler__head {
  display: flex;
  align-items: center;
  gap: var(--zg-spacing-md);
  margin-bottom: var(--zg-spacing-lg);
}

.zg-cronscheduler__sigil {
  width: 48px;
  height: 48px;
  border-radius: var(--zg-radius-lg);
  background: var(--zg-gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.zg-cronscheduler__copy {
  flex: 1;
}

.zg-cronscheduler__title {
  margin: 0;
  font-size: var(--zg-font-size-xl);
  font-weight: 600;
  color: var(--zg-text-primary);
  letter-spacing: -0.3px;
}

.zg-cronscheduler__subtitle {
  margin: 4px 0 0;
  font-size: var(--zg-font-size-sm);
  color: var(--zg-text-secondary);
}

.zg-cronscheduler__actions {
  display: flex;
  gap: var(--zg-spacing-sm);
}

.zg-metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--zg-spacing-md);
  margin-bottom: var(--zg-spacing-lg);
}

.zg-metrics__cell {
  background: #fff;
  border-radius: var(--zg-radius-lg);
  padding: var(--zg-spacing-md);
  text-align: center;
  box-shadow: var(--zg-shadow-sm);
}

.zg-metrics__value {
  font-size: var(--zg-font-size-2xl);
  font-weight: 700;
  color: var(--zg-text-primary);
}

.zg-metrics__label {
  font-size: var(--zg-font-size-sm);
  color: var(--zg-text-secondary);
  margin-top: 4px;
}

.zg-filterband {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border-radius: var(--zg-radius-lg);
  padding: var(--zg-spacing-md);
  margin-bottom: var(--zg-spacing-md);
  box-shadow: var(--zg-shadow-sm);
}

.zg-filterband__view {
  display: flex;
  gap: var(--zg-spacing-sm);
}

.zg-filterband__fields {
  display: flex;
  gap: var(--zg-spacing-sm);
  align-items: center;
}

.zg-filterband__select {
  width: 140px;
}

.zg-filterband__input {
  width: 200px;
}

.zg-timeslotgrid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--zg-spacing-md);
  margin-bottom: var(--zg-spacing-md);
}

.zg-timeslotcard {
  background: #fff;
  border-radius: var(--zg-radius-lg);
  padding: var(--zg-spacing-md);
  box-shadow: var(--zg-shadow-sm);
  cursor: pointer;
  transition: all 0.3s ease;
}

.zg-timeslotcard:hover {
  box-shadow: var(--zg-shadow-md);
  transform: translateY(-2px);
}

.zg-timeslotcard__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--zg-spacing-sm);
}

.zg-timeslotcard__title {
  font-weight: 600;
  color: var(--zg-text-primary);
}

.zg-timeslotcard__body {
  margin-bottom: var(--zg-spacing-sm);
}

.zg-timeslotcard__timerange {
  font-size: var(--zg-font-size-sm);
  color: var(--zg-text-secondary);
  margin-bottom: 8px;
}

.zg-timeslotcard__brightness {
  font-size: var(--zg-font-size-base);
  color: var(--zg-text-primary);
}

.zg-timeslotcard__brightness strong {
  color: var(--zg-color-primary);
  font-size: var(--zg-font-size-lg);
  font-weight: 700;
}

.zg-timeslotcard__section {
  font-size: var(--zg-font-size-xs);
  color: var(--zg-text-muted);
  margin-top: 4px;
}

.zg-timeslotcard__foot {
  display: flex;
  gap: var(--zg-spacing-sm);
  justify-content: flex-end;
}

.zg-tablewrap {
  background: #fff;
  border-radius: var(--zg-radius-lg);
  padding: var(--zg-spacing-md);
  box-shadow: var(--zg-shadow-sm);
  margin-bottom: var(--zg-spacing-md);
}

.zg-table {
  --el-table-header-bg-color: var(--zg-bg-muted);
  --el-table-header-text-color: var(--zg-text-secondary);
  --el-table-row-hover-bg-color: var(--zg-bg-hover);
  --el-table-border-color: var(--zg-border-color);
  border-radius: var(--zg-radius-md);
  overflow: hidden;
}

.zg-pagerbar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  background: #fff;
  border-radius: var(--zg-radius-lg);
  padding: var(--zg-spacing-md);
  box-shadow: var(--zg-shadow-sm);
}

.zg-inspector {
  padding: var(--zg-spacing-sm);
}

.zg-inspector__desc {
  margin-bottom: var(--zg-spacing-md);
}

.zg-inspector__actions {
  display: flex;
  gap: var(--zg-spacing-sm);
  justify-content: flex-end;
}

.zg-form {
  padding: var(--zg-spacing-sm);
}
</style>