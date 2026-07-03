<!--
  智光云枢 · 情景编排 · 预案调度
  业务域：scenarioOrch
  功能：定时预案调度编排与管理
        支持卡片/列表双视图、抽屉式详情与编排、调度执行控制
-->
<template>
  <section class="zg-schedule">
    <!-- 页面头部：品牌徽标 + 标题 + 概览指标 + 新建入口 -->
    <header class="zg-schedule__head">
      <div class="zg-schedule__headline">
        <div class="zg-schedule__sigil">
          <el-icon :size="22"><Calendar /></el-icon>
        </div>
        <div class="zg-schedule__copy">
          <h1 class="zg-schedule__title">预案调度</h1>
          <p class="zg-schedule__sub">
            定时预案编排中枢 · 启用 {{ activeScheduleCount }} 项 ·
            停用 {{ inactiveScheduleCount }} 项 · 今日待执行 {{ todayPendingCount }} 项
          </p>
        </div>
      </div>
      <div class="zg-schedule__cta">
        <el-button type="primary" @click="scheduleForm.openComposer()">
          <el-icon><Plus /></el-icon>
          <span>新增调度</span>
        </el-button>
      </div>
    </header>

    <!-- 概览指标卡 -->
    <div class="zg-metrics">
      <div class="zg-metrics__cell">
        <span class="zg-metrics__num">{{ scheduleCtl.totalRows }}</span>
        <span class="zg-metrics__lbl">调度总数</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--ok">
        <span class="zg-metrics__num">{{ activeScheduleCount }}</span>
        <span class="zg-metrics__lbl">启用调度</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--warn">
        <span class="zg-metrics__num">{{ inactiveScheduleCount }}</span>
        <span class="zg-metrics__lbl">停用调度</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--info">
        <span class="zg-metrics__num">{{ todayPendingCount }}</span>
        <span class="zg-metrics__lbl">今日待执行</span>
      </div>
    </div>

    <!-- 过滤工具栏 -->
    <div class="zg-filterband">
      <div class="zg-filterband__density">
        <el-radio-group v-model="densityMode" size="default">
          <el-radio-button value="card">
            <el-icon><Grid /></el-icon>
            <span>卡片视图</span>
          </el-radio-button>
          <el-radio-button value="list">
            <el-icon><List /></el-icon>
            <span>列表视图</span>
          </el-radio-button>
        </el-radio-group>
      </div>
      <div class="zg-filterband__fields">
        <el-select
          v-model="scheduleCtl.statusBuckets"
          placeholder="调度状态"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="启用" value="启用" />
          <el-option label="停用" value="停用" />
        </el-select>
        <el-select
          v-model="scheduleCtl.typeBucket"
          placeholder="执行类型"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="每天" value="每天" />
          <el-option label="周末" value="周末" />
          <el-option label="节假日" value="节假日" />
        </el-select>
        <el-input
          v-model="scheduleCtl.filterLexicon"
          placeholder="检索调度名称/编号"
          clearable
          class="zg-filterband__search"
          @keyup.enter="scheduleCtl.onFilterApply()"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="scheduleCtl.onFilterApply()">
          <el-icon><Search /></el-icon>
          <span>检索</span>
        </el-button>
        <el-button @click="scheduleCtl.onFilterReset()">
          <el-icon><RefreshLeft /></el-icon>
          <span>重置</span>
        </el-button>
      </div>
    </div>

    <!-- 卡片视图 -->
    <div v-if="densityMode === 'card'" class="zg-cardgrid">
      <article
        v-for="schedule in scheduleCtl.pagedRows"
        :key="schedule.id"
        class="zg-schedulecard"
        :class="schedule.enabled ? 'enabled' : 'disabled'"
        @click="scheduleInspector.openInspector(schedule)"
      >
        <div class="zg-schedulecard__head">
          <div class="zg-schedulecard__glyph">
            <el-icon :size="24"><Calendar /></el-icon>
          </div>
          <span class="zg-status" :class="schedule.enabled ? 'online' : 'offline'">
            <i class="dot"></i>{{ schedule.enabled ? '启用' : '停用' }}
          </span>
        </div>
        <div class="zg-schedulecard__body">
          <h3 class="zg-schedulecard__name">{{ schedule.name }}</h3>
          <p class="zg-schedulecard__template">{{ schedule.templateName }} · {{ schedule.scheduleType }}</p>
          <div class="zg-schedulecard__stats">
            <span class="zg-schedulecard__stat">
              <em>{{ schedule.time }}</em>
            </span>
            <span class="zg-schedulecard__stat">
              执行 {{ schedule.executeCount }} 次
            </span>
          </div>
        </div>
        <div class="zg-schedulecard__foot">
          <span class="zg-schedulecard__time">{{ schedule.lastExecuteTime }}</span>
          <div class="zg-schedulecard__actions">
            <el-button link type="primary" size="small" @click.stop="onToggleSchedule(schedule)">
              {{ schedule.enabled ? '停用' : '启用' }}
            </el-button>
            <el-button link type="primary" size="small" @click.stop="scheduleForm.openReviser(schedule)">修订</el-button>
            <el-button link type="success" size="small" @click.stop="onExecuteSchedule(schedule)">执行</el-button>
            <el-button link type="danger" size="small" @click.stop="onRetireSchedule(schedule)">废止</el-button>
          </div>
        </div>
      </article>
    </div>

    <!-- 列表视图 -->
    <div v-else class="zg-tablewrap">
      <el-table :data="scheduleCtl.pagedRows" stripe class="zg-datatable">
        <el-table-column prop="no" label="序号" width="60" align="center" />
        <el-table-column prop="id" label="调度编号" width="110" />
        <el-table-column prop="name" label="调度名称" min-width="150" />
        <el-table-column prop="templateName" label="关联预案" width="140" />
        <el-table-column prop="scheduleType" label="执行类型" width="100" align="center">
          <template #default="{ row }">
            <span class="zg-type-tag">{{ row.scheduleType }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="time" label="执行时间" width="100" align="center" />
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <span class="zg-status" :class="row.enabled ? 'online' : 'offline'">
              <i class="dot"></i>{{ row.enabled ? '启用' : '停用' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="executeCount" label="执行次数" width="90" align="center" />
        <el-table-column prop="lastExecuteTime" label="上次执行" width="140" />
        <el-table-column label="处置" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="scheduleInspector.openInspector(row)">详情</el-button>
            <el-button type="warning" size="small" @click="onToggleSchedule(row)">
              {{ row.enabled ? '停用' : '启用' }}
            </el-button>
            <el-button type="primary" size="small" @click="scheduleForm.openReviser(row)">修订</el-button>
            <el-button type="success" size="small" @click="onExecuteSchedule(row)">执行</el-button>
            <el-button type="danger" size="small" @click="onRetireSchedule(row)">废止</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页条 -->
    <div class="zg-pagerbar">
      <el-pagination
        v-model:current-page="scheduleCtl.pagingCursor"
        v-model:page-size="scheduleCtl.pageSpan"
        :total="scheduleCtl.totalRows"
        :page-sizes="[10, 15, 20, 50, 100]"
        layout="prev, pager, next, jumper, ->, sizes, total"
        background
      />
    </div>

    <!-- 详情抽屉 -->
    <el-drawer
      v-model="scheduleInspector.drawerOpen"
      :title="'调度详情 · ' + (focusedSchedule?.name || '')"
      direction="rtl"
      size="680px"
    >
      <div v-if="focusedSchedule" class="zg-inspector">
        <div class="zg-inspector__head">
          <div class="zg-inspector__glyph">
            <el-icon :size="36"><Calendar /></el-icon>
          </div>
          <div class="zg-inspector__meta">
            <h2 class="zg-inspector__name">{{ focusedSchedule.name }}</h2>
            <p class="zg-inspector__type">{{ focusedSchedule.templateName }} · {{ focusedSchedule.scheduleType }}</p>
            <span class="zg-status" :class="focusedSchedule.enabled ? 'online' : 'offline'">
              <i class="dot"></i>{{ focusedSchedule.enabled ? '启用' : '停用' }}
            </span>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">调度档案</h4>
          <div class="zg-inspector__grid">
            <div class="zg-inspector__cell">
              <span class="lbl">调度编号</span>
              <span class="val">{{ focusedSchedule.id }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">执行时间</span>
              <span class="val">{{ focusedSchedule.time }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">执行类型</span>
              <span class="val">{{ focusedSchedule.scheduleType }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">创建时间</span>
              <span class="val">{{ focusedSchedule.createTime }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">上次执行</span>
              <span class="val">{{ focusedSchedule.lastExecuteTime }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">执行次数</span>
              <span class="val">{{ focusedSchedule.executeCount }}</span>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">执行统计</h4>
          <div class="zg-datagrid">
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">执行次数</div>
              <div class="zg-datacard__val">{{ focusedSchedule.executeCount }}<em>次</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">成功率</div>
              <div class="zg-datacard__val">{{ focusedSchedule.successRate }}<em>%</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">预案亮度</div>
              <div class="zg-datacard__val">{{ focusedSchedule.brightness }}<em>%</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">运行时长</div>
              <div class="zg-datacard__val">{{ focusedSchedule.runDuration }}<em>h</em></div>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">执行日志</h4>
          <el-table :data="focusedSchedule.executeLogs" size="small" border>
            <el-table-column prop="no" label="序号" width="60" align="center" />
            <el-table-column prop="executeTime" label="执行时间" width="160" />
            <el-table-column label="执行状态" width="100" align="center">
              <template #default="{ row }">
                <span class="zg-status" :class="row.status === '成功' ? 'online' : 'offline'">
                  <i class="dot"></i>{{ row.status }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="brightness" label="亮度(%)" width="100" align="center" />
            <el-table-column prop="affectedCount" label="影响设备" width="100" align="center" />
          </el-table>
        </div>

        <div class="zg-inspector__actions">
          <el-button size="large" @click="scheduleInspector.closeInspector()">关闭</el-button>
          <el-button
            type="success"
            size="large"
            @click="onExecuteSchedule(focusedSchedule)"
          >
            <el-icon><VideoPlay /></el-icon>
            立即执行
          </el-button>
          <el-button
            type="warning"
            size="large"
            @click="onToggleSchedule(focusedSchedule)"
          >
            {{ focusedSchedule.enabled ? '停用调度' : '启用调度' }}
          </el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 新建/修订抽屉 -->
    <el-drawer
      v-model="scheduleForm.drawerOpen"
      :title="scheduleForm.editMode === 'compose' ? '新增调度' : '修订调度'"
      direction="rtl"
      size="560px"
    >
      <el-form :model="scheduleForm.draftPayload" label-width="96px" class="zg-draftform">
        <el-form-item label="调度名称" required>
          <el-input v-model="scheduleForm.draftPayload.name" placeholder="请输入调度名称" />
        </el-form-item>
        <el-form-item label="关联预案" required>
          <el-select v-model="scheduleForm.draftPayload.templateId" placeholder="请选择预案" style="width: 100%">
            <el-option
              v-for="template in enabledTemplates"
              :key="template.id"
              :label="template.name"
              :value="template.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="执行类型" required>
          <el-select v-model="scheduleForm.draftPayload.scheduleType" placeholder="请选择执行类型" style="width: 100%">
            <el-option label="每天" value="每天" />
            <el-option label="周末" value="周末" />
            <el-option label="节假日" value="节假日" />
          </el-select>
        </el-form-item>
        <el-form-item label="执行时间" required>
          <el-time-picker
            v-model="scheduleForm.draftPayload.time"
            format="HH:mm"
            placeholder="选择执行时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="启用状态">
          <el-switch v-model="scheduleForm.draftPayload.enabled" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="scheduleForm.draftPayload.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="scheduleForm.onDraftDiscard()">取消</el-button>
        <el-button
          type="primary"
          :loading="scheduleForm.submitting"
          @click="onCommitScheduleDraft"
        >
          {{ scheduleForm.editMode === 'compose' ? '新增' : '保存修订' }}
        </el-button>
      </template>
    </el-drawer>
  </section>
</template>

<script setup>
/**
 * 智光云枢 · 情景编排 · 预案调度
 * 业务域：scenarioOrch
 * 功能：定时预案调度编排与管理
 * @module scenarioOrch/PresetSchedule
 * @author 智光云枢研发团队
 */
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Calendar,
  Plus,
  Grid,
  List,
  Search,
  RefreshLeft,
  VideoPlay
} from '@element-plus/icons-vue'
import { usePresetTable } from '@/shared/composables/usePresetTable'
import { useFormDraft } from '@/shared/composables/useFormDraft'
import { useDrawerInspector } from '@/shared/composables/useDrawerInspector'

// ---- 视图密度切换 ----
const densityMode = ref('card')

// ---- 预案模板池（mock） ----
const enabledTemplates = ref([
  { id: 'T001', name: '节日庆典模式', brightness: 100, enabled: true },
  { id: 'T002', name: '节能模式', brightness: 50, enabled: true },
  { id: 'T003', name: '深夜模式', brightness: 30, enabled: true },
  { id: 'T004', name: '应急模式', brightness: 100, enabled: true },
  { id: 'T005', name: '雾霾模式', brightness: 90, enabled: true }
])

// ---- 初始 mock 数据池 ----
const initialSchedules = [
  {
    id: 'SCH001',
    no: 1,
    name: '工作日定时节能',
    templateId: 'T002',
    templateName: '节能模式',
    scheduleType: '每天',
    time: '22:00',
    enabled: true,
    executeCount: 156,
    successRate: 98,
    brightness: 50,
    runDuration: 1200,
    createTime: '2024-01-15 10:30',
    lastExecuteTime: '2024-12-20 22:00',
    remark: '工作日夜间节能调度',
    executeLogs: [
      { no: 1, executeTime: '2024-12-20 22:00', status: '成功', brightness: 50, affectedCount: 120 },
      { no: 2, executeTime: '2024-12-19 22:00', status: '成功', brightness: 50, affectedCount: 120 },
      { no: 3, executeTime: '2024-12-18 22:00', status: '成功', brightness: 50, affectedCount: 118 }
    ]
  },
  {
    id: 'SCH002',
    no: 2,
    name: '周末全亮模式',
    templateId: 'T001',
    templateName: '节日庆典模式',
    scheduleType: '周末',
    time: '18:00',
    enabled: true,
    executeCount: 89,
    successRate: 100,
    brightness: 100,
    runDuration: 800,
    createTime: '2024-02-10 14:20',
    lastExecuteTime: '2024-12-21 18:00',
    remark: '周末夜间全亮',
    executeLogs: [
      { no: 1, executeTime: '2024-12-21 18:00', status: '成功', brightness: 100, affectedCount: 150 },
      { no: 2, executeTime: '2024-12-14 18:00', status: '成功', brightness: 100, affectedCount: 150 }
    ]
  },
  {
    id: 'SCH003',
    no: 3,
    name: '深夜自动降亮',
    templateId: 'T003',
    templateName: '深夜模式',
    scheduleType: '每天',
    time: '02:00',
    enabled: true,
    executeCount: 245,
    successRate: 99,
    brightness: 30,
    runDuration: 1800,
    createTime: '2024-03-05 09:15',
    lastExecuteTime: '2024-12-21 02:00',
    remark: '凌晨降亮节能',
    executeLogs: [
      { no: 1, executeTime: '2024-12-21 02:00', status: '成功', brightness: 30, affectedCount: 80 },
      { no: 2, executeTime: '2024-12-20 02:00', status: '失败', brightness: 30, affectedCount: 0 }
    ]
  },
  {
    id: 'SCH004',
    no: 4,
    name: '节假日特殊模式',
    templateId: 'T001',
    templateName: '节日庆典模式',
    scheduleType: '节假日',
    time: '17:30',
    enabled: false,
    executeCount: 12,
    successRate: 100,
    brightness: 100,
    runDuration: 150,
    createTime: '2024-04-18 16:45',
    lastExecuteTime: '2024-10-01 17:30',
    remark: '节假日全亮',
    executeLogs: [
      { no: 1, executeTime: '2024-10-01 17:30', status: '成功', brightness: 100, affectedCount: 200 }
    ]
  },
  {
    id: 'SCH005',
    no: 5,
    name: '雾霾天增强照明',
    templateId: 'T005',
    templateName: '雾霾模式',
    scheduleType: '每天',
    time: '06:00',
    enabled: true,
    executeCount: 78,
    successRate: 97,
    brightness: 90,
    runDuration: 600,
    createTime: '2024-05-20 11:30',
    lastExecuteTime: '2024-12-21 06:00',
    remark: '清晨雾霾增强照明',
    executeLogs: []
  }
]

// ---- 表格数据容器（usePresetTable） ----
const scheduleCtl = usePresetTable(null, {
  defaultPageSpan: 15,
  initialData: initialSchedules
})

// ---- 概览指标派生 ----
const activeScheduleCount = computed(
  () => scheduleCtl.presetPlaybook.filter(s => s.enabled).length
)
const inactiveScheduleCount = computed(
  () => scheduleCtl.presetPlaybook.filter(s => !s.enabled).length
)
const todayPendingCount = computed(
  () => scheduleCtl.presetPlaybook.filter(s => s.enabled).length
)

// ---- 表单草稿容器（useFormDraft） ----
const scheduleForm = useFormDraft(
  {
    name: '',
    templateId: '',
    scheduleType: '每天',
    time: '',
    enabled: true,
    remark: ''
  },
  {
    validateFn: (draft) => {
      if (!draft.name) {
        ElMessage.warning('请输入调度名称')
        return false
      }
      if (!draft.templateId) {
        ElMessage.warning('请选择关联预案')
        return false
      }
      if (!draft.scheduleType) {
        ElMessage.warning('请选择执行类型')
        return false
      }
      if (!draft.time) {
        ElMessage.warning('请选择执行时间')
        return false
      }
      return true
    }
  }
)

// ---- 详情抽屉容器（useDrawerInspector） ----
const scheduleInspector = useDrawerInspector({ size: '680px', direction: 'rtl' })
const focusedSchedule = computed(() => scheduleInspector.focusedRecord)

/**
 * 提交草稿：根据编排/修订模式写入数据池
 * 业务流包装：新建生成调度编号，修订同步执行统计
 */
const onCommitScheduleDraft = async () => {
  const snapshot = await scheduleForm.onDraftCommit()
  if (!snapshot) return

  const template = enabledTemplates.value.find(t => t.id === snapshot.templateId)

  if (scheduleForm.editMode === 'compose') {
    // 新增：附带调度态默认值
    scheduleCtl.appendRecord({
      ...snapshot,
      id: 'SCH' + String(scheduleCtl.presetPlaybook.length + 1).padStart(3, '0'),
      no: scheduleCtl.presetPlaybook.length + 1,
      templateName: template ? template.name : '未知预案',
      executeCount: 0,
      successRate: 100,
      brightness: template ? template.brightness : 100,
      runDuration: 0,
      createTime: new Date().toLocaleString('zh-CN'),
      lastExecuteTime: '-',
      executeLogs: []
    })
    ElMessage.success('调度创建成功，已并入编排计划')
  } else {
    // 修订：合并更新到原记录
    const origin = scheduleForm.originRecord
    scheduleCtl.reviseRecord(origin.id, {
      ...snapshot,
      templateName: template ? template.name : origin.templateName
    })
    ElMessage.success('调度配置已更新')
  }
}

/**
 * 启用/停用调度：切换运行状态
 * @param {Object} schedule 目标调度
 */
const onToggleSchedule = (schedule) => {
  const nextStatus = schedule.enabled ? false : true
  const actionText = nextStatus ? '启用' : '停用'
  ElMessageBox.confirm(
    `确认将「${schedule.name}」${actionText}？`,
    '状态切换确认',
    { type: 'warning' }
  )
    .then(() => {
      scheduleCtl.reviseRecord(schedule.id, { enabled: nextStatus })
      ElMessage.success(`调度已${actionText}，编排计划已更新`)
    })
    .catch(() => {})
}

/**
 * 废止调度：二次确认后从编排计划中移除
 * @param {Object} schedule 目标调度
 */
const onRetireSchedule = (schedule) => {
  ElMessageBox.confirm(
    `确定要将「${schedule.name}」从编排计划中废止吗？`,
    '废止确认',
    { type: 'warning' }
  )
    .then(() => {
      scheduleCtl.retireRecord(schedule.id)
      ElMessage.success('调度已废止，编排计划已同步')
    })
    .catch(() => {})
}

/**
 * 执行调度：立即触发调度预案
 * @param {Object} schedule 目标调度
 */
const onExecuteSchedule = (schedule) => {
  ElMessageBox.confirm(
    `确认立即执行调度「${schedule.name}」？\n预案：${schedule.templateName}\n亮度：${schedule.brightness}%`,
    '执行确认',
    { type: 'info' }
  )
    .then(() => {
      // 更新执行统计
      scheduleCtl.reviseRecord(schedule.id, {
        executeCount: schedule.executeCount + 1,
        lastExecuteTime: new Date().toLocaleString('zh-CN')
      })
      ElMessage.success(`调度「${schedule.name}」已触发执行，预案${schedule.templateName}已下发`)
    })
    .catch(() => {})
}
</script>

<style scoped lang="scss">
.zg-schedule {
  padding: 24px;

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 18px;
    border-bottom: 1px solid var(--zg-line-soft);
  }

  &__headline {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  &__sigil {
    width: 44px;
    height: 44px;
    border-radius: var(--zg-radius-md);
    background: var(--zg-gradient-primary);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--zg-shadow-btn);
  }

  &__copy {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__title {
    font-size: 20px;
    font-weight: 600;
    color: var(--zg-ink-primary);
    margin: 0;
  }

  &__sub {
    font-size: 13px;
    color: var(--zg-ink-tertiary);
    margin: 0;
  }
}

.zg-metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 20px;

  &__cell {
    background: var(--zg-surface-card);
    border: 1px solid var(--zg-line-soft);
    border-radius: var(--zg-radius-lg);
    padding: 16px 18px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    box-shadow: var(--zg-shadow-card);
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      width: 3px;
      height: 100%;
      background: var(--zg-brand-primary);
    }

    &--ok::before { background: var(--zg-success); }
    &--warn::before { background: var(--zg-warning); }
    &--info::before { background: var(--zg-info); }
  }

  &__num {
    font-size: 26px;
    font-weight: 700;
    color: var(--zg-ink-primary);
    line-height: 1;
  }

  &__lbl {
    font-size: 12px;
    color: var(--zg-ink-tertiary);
  }
}

.zg-filterband {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 18px;
  padding: 14px 18px;
  background: var(--zg-surface-card);
  border: 1px solid var(--zg-line-soft);
  border-radius: var(--zg-radius-lg);
  flex-wrap: wrap;

  &__fields {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  &__select { width: 160px; }
  &__search { width: 240px; }
}

.zg-cardgrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.zg-schedulecard {
  background: var(--zg-surface-card);
  border: 1px solid var(--zg-line-soft);
  border-radius: var(--zg-radius-lg);
  padding: 16px;
  cursor: pointer;
  transition: all var(--zg-transition-normal);
  display: flex;
  flex-direction: column;
  gap: 14px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--zg-shadow-card-hover);
    border-color: var(--zg-line-brand);
  }

  &.disabled {
    border-left: 3px solid var(--zg-danger);
  }
  &.enabled {
    border-left: 3px solid var(--zg-success);
  }

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__glyph {
    width: 38px;
    height: 38px;
    border-radius: var(--zg-radius-md);
    background: var(--zg-brand-tint-50);
    color: var(--zg-brand-primary);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__name {
    font-size: 15px;
    font-weight: 600;
    color: var(--zg-ink-primary);
    margin: 0;
  }

  &__template {
    font-size: 12px;
    color: var(--zg-ink-tertiary);
    margin: 0;
  }

  &__stats {
    display: flex;
    gap: 14px;
    margin-top: 6px;
  }

  &__stat {
    font-size: 12px;
    color: var(--zg-ink-tertiary);

    em {
      font-style: normal;
      font-size: 16px;
      font-weight: 600;
      color: var(--zg-brand-primary);
      margin-right: 2px;
    }
  }

  &__foot {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 10px;
    border-top: 1px dashed var(--zg-line-soft);
  }

  &__time {
    font-size: 12px;
    color: var(--zg-ink-placeholder);
  }

  &__actions {
    display: flex;
    gap: 4px;
  }
}

.zg-tablewrap {
  background: var(--zg-surface-card);
  border-radius: var(--zg-radius-lg);
  padding: 16px;
  margin-bottom: 20px;
  border: 1px solid var(--zg-line-soft);
}

.zg-pagerbar {
  display: flex;
  justify-content: flex-end;
  padding: 12px 0;
}

.zg-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: var(--zg-radius-pill);

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }

  &.online {
    color: var(--zg-success);
    background: var(--zg-success-soft);
  }
  &.offline {
    color: var(--zg-danger);
    background: var(--zg-danger-soft);
  }
  &.idle {
    color: var(--zg-warning);
    background: var(--zg-warning-soft);
  }
}

.zg-type-tag {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  border-radius: var(--zg-radius-sm);
  background: var(--zg-brand-tint-50);
  color: var(--zg-brand-primary);
}

.zg-inspector {
  &__head {
    display: flex;
    gap: 14px;
    align-items: center;
    padding-bottom: 18px;
    border-bottom: 1px solid var(--zg-line-soft);
    margin-bottom: 18px;
  }

  &__glyph {
    width: 56px;
    height: 56px;
    border-radius: var(--zg-radius-lg);
    background: var(--zg-gradient-primary);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__meta {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__name {
    font-size: 18px;
    font-weight: 600;
    color: var(--zg-ink-primary);
    margin: 0;
  }

  &__type {
    font-size: 13px;
    color: var(--zg-ink-tertiary);
    margin: 0;
  }

  &__section {
    margin-bottom: 22px;
  }

  &__section-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--zg-ink-secondary);
    margin: 0 0 12px;
    padding-left: 8px;
    border-left: 3px solid var(--zg-brand-primary);
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  &__cell {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 10px 12px;
    background: var(--zg-surface-muted);
    border-radius: var(--zg-radius-md);

    .lbl {
      font-size: 12px;
      color: var(--zg-ink-tertiary);
    }
    .val {
      font-size: 14px;
      color: var(--zg-ink-primary);
      font-weight: 500;
    }
  }

  &__actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    padding-top: 18px;
    border-top: 1px solid var(--zg-line-soft);
    margin-top: 8px;
  }
}

.zg-datagrid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.zg-datacard {
  padding: 14px 16px;
  background: var(--zg-gradient-surface);
  border: 1px solid var(--zg-line-soft);
  border-radius: var(--zg-radius-md);

  &__lbl {
    font-size: 12px;
    color: var(--zg-ink-tertiary);
    margin-bottom: 6px;
  }

  &__val {
    font-size: 22px;
    font-weight: 700;
    color: var(--zg-brand-primary);

    em {
      font-style: normal;
      font-size: 13px;
      color: var(--zg-ink-tertiary);
      margin-left: 4px;
      font-weight: 400;
    }
  }
}

.zg-draftform {
  &__unit {
    margin-left: 8px;
    font-size: 13px;
    color: var(--zg-ink-tertiary);
  }
}
</style>