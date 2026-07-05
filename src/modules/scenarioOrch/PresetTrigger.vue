<!--
  智光云枢 · 情景管理 · 预案触发器
  业务域：scenarioOrch
  功能：预案触发器管理与触发控制台
        支持卡片/列表双视图、抽屉式详情与编排、触发器启停测试
-->
<template>
  <section class="zg-trigger">
    <!-- 页面头部：品牌徽标 + 标题 + 概览指标 + 新建入口 -->
    <header class="zg-trigger__head">
      <div class="zg-trigger__headline">
        <div class="zg-trigger__sigil">
          <el-icon :size="22"><Timer /></el-icon>
        </div>
        <div class="zg-trigger__copy">
          <h1 class="zg-trigger__title">预案触发器</h1>
          <p class="zg-trigger__sub">
            情景管理中枢 · 已启用 {{ activeTriggerCount }} 个 ·
            已停用 {{ inactiveTriggerCount }} 个 · 累计触发 {{ totalTriggerCount }} 次
          </p>
        </div>
      </div>
      <div class="zg-trigger__cta">
        <el-button type="primary" @click="triggerForm.openComposer()">
          <el-icon><Plus /></el-icon>
          <span>新增触发器</span>
        </el-button>
      </div>
    </header>

    <!-- 概览指标卡 -->
    <div class="zg-metrics">
      <div class="zg-metrics__cell">
        <span class="zg-metrics__num">{{ triggerCtl.totalRows }}</span>
        <span class="zg-metrics__lbl">触发器总数</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--ok">
        <span class="zg-metrics__num">{{ activeTriggerCount }}</span>
        <span class="zg-metrics__lbl">已启用</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--warn">
        <span class="zg-metrics__num">{{ inactiveTriggerCount }}</span>
        <span class="zg-metrics__lbl">已停用</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--info">
        <span class="zg-metrics__num">{{ totalTriggerCount }}</span>
        <span class="zg-metrics__lbl">累计触发</span>
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
          v-model="triggerCtl.statusBuckets"
          placeholder="运行状态"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="已启用" value="已启用" />
          <el-option label="已停用" value="已停用" />
        </el-select>
        <el-select
          v-model="triggerCtl.typeBucket"
          placeholder="触发器类型"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="定时触发" value="定时触发" />
          <el-option label="事件触发" value="事件触发" />
          <el-option label="手动触发" value="手动触发" />
        </el-select>
        <el-input
          v-model="triggerCtl.filterLexicon"
          placeholder="检索触发器名称/编号"
          clearable
          class="zg-filterband__search"
          @keyup.enter="triggerCtl.onFilterApply()"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="triggerCtl.onFilterApply()">
          <el-icon><Search /></el-icon>
          <span>检索</span>
        </el-button>
        <el-button @click="triggerCtl.onFilterReset()">
          <el-icon><RefreshLeft /></el-icon>
          <span>重置</span>
        </el-button>
      </div>
    </div>

    <!-- 卡片视图 -->
    <div v-if="densityMode === 'card'" class="zg-cardgrid">
      <article
        v-for="trigger in triggerCtl.pagedRows"
        :key="trigger.id"
        class="zg-triggercard"
        :class="trigger.lifecycle === '已启用' ? 'enabled' : 'disabled'"
        @click="triggerInspector.openInspector(trigger)"
      >
        <div class="zg-triggercard__head">
          <div class="zg-triggercard__glyph">
            <el-icon :size="24"><Timer /></el-icon>
          </div>
          <span class="zg-status" :class="trigger.lifecycle === '已启用' ? 'online' : 'offline'">
            <i class="dot"></i>{{ trigger.lifecycle }}
          </span>
        </div>
        <div class="zg-triggercard__body">
          <h3 class="zg-triggercard__name">{{ trigger.label }}</h3>
          <p class="zg-triggercard__type">{{ trigger.category }} · {{ trigger.presetLabel }}</p>
          <div class="zg-triggercard__stats">
            <span class="zg-triggercard__stat">
              <em>{{ trigger.luminancePct }}</em>%
            </span>
            <span class="zg-triggercard__stat">
              <em>{{ trigger.invokeCount }}</em> 次触发
            </span>
          </div>
        </div>
        <div class="zg-triggercard__foot">
          <span class="zg-triggercard__time">{{ trigger.createTime }}</span>
          <div class="zg-triggercard__actions">
            <el-button link type="primary" size="small" @click.stop="onToggleTrigger(trigger)">
              {{ trigger.lifecycle === '已启用' ? '停用' : '启用' }}
            </el-button>
            <el-button link type="primary" size="small" @click.stop="triggerForm.openReviser(trigger)">修订</el-button>
            <el-button link type="success" size="small" @click.stop="onTestTrigger(trigger)">测试</el-button>
            <el-button link type="danger" size="small" @click.stop="onRetireTrigger(trigger)">废止</el-button>
          </div>
        </div>
      </article>
    </div>

    <!-- 列表视图 -->
    <div v-else class="zg-tablewrap">
      <el-table :data="triggerCtl.pagedRows" stripe class="zg-datatable">
        <el-table-column prop="no" label="序号" width="60" align="center" />
        <el-table-column prop="presetSn" label="触发器编号" width="130" />
        <el-table-column prop="label" label="触发器名称" min-width="150" />
        <el-table-column prop="category" label="类型" width="100" />
        <el-table-column prop="presetLabel" label="关联预案" width="140" />
        <el-table-column label="运行状态" width="100" align="center">
          <template #default="{ row }">
            <span class="zg-status" :class="row.lifecycle === '已启用' ? 'online' : 'offline'">
              <i class="dot"></i>{{ row.lifecycle }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="luminancePct" label="亮度(%)" width="90" align="center" />
        <el-table-column prop="invokeCount" label="触发次数" width="90" align="center" />
        <el-table-column prop="createTime" label="创建时间" width="130" />
        <el-table-column label="处置" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="triggerInspector.openInspector(row)">详情</el-button>
            <el-button type="warning" size="small" @click="onToggleTrigger(row)">
              {{ row.lifecycle === '已启用' ? '停用' : '启用' }}
            </el-button>
            <el-button type="success" size="small" @click="onTestTrigger(row)">测试</el-button>
            <el-button type="primary" size="small" @click="triggerForm.openReviser(row)">修订</el-button>
            <el-button type="danger" size="small" @click="onRetireTrigger(row)">废止</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页条 -->
    <div class="zg-pagerbar">
      <el-pagination
        v-model:current-page="triggerCtl.pagingCursor"
        v-model:page-size="triggerCtl.pageSpan"
        :total="triggerCtl.totalRows"
        :page-sizes="[10, 15, 20, 50, 100]"
        layout="prev, pager, next, jumper, ->, sizes, total"
        background
      />
    </div>

    <!-- 详情抽屉 -->
    <el-drawer
      v-model="triggerInspector.drawerOpen"
      :title="'触发器详情 · ' + (focusedTrigger?.label || '')"
      direction="rtl"
      size="680px"
    >
      <div v-if="focusedTrigger" class="zg-inspector">
        <div class="zg-inspector__head">
          <div class="zg-inspector__glyph">
            <el-icon :size="36"><Timer /></el-icon>
          </div>
          <div class="zg-inspector__meta">
            <h2 class="zg-inspector__name">{{ focusedTrigger.label }}</h2>
            <p class="zg-inspector__type">{{ focusedTrigger.category }} · {{ focusedTrigger.presetLabel }}</p>
            <span class="zg-status" :class="focusedTrigger.lifecycle === '已启用' ? 'online' : 'offline'">
              <i class="dot"></i>{{ focusedTrigger.lifecycle }}
            </span>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">基本档案</h4>
          <div class="zg-inspector__grid">
            <div class="zg-inspector__cell">
              <span class="lbl">触发器编号</span>
              <span class="val">{{ focusedTrigger.presetSn }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">创建时间</span>
              <span class="val">{{ focusedTrigger.createTime }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">触发次数</span>
              <span class="val">{{ focusedTrigger.invokeCount }} 次</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">最后触发</span>
              <span class="val">{{ focusedTrigger.lastInvokeTime || '-' }}</span>
            </div>
            <div class="zg-inspector__cell zg-inspector__cell--full">
              <span class="lbl">备注</span>
              <span class="val">{{ focusedTrigger.remark || '-' }}</span>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">触发参数</h4>
          <div class="zg-datagrid">
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">亮度设置</div>
              <div class="zg-datacard__val">{{ focusedTrigger.luminancePct }}<em>%</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">触发类型</div>
              <div class="zg-datacard__val">{{ focusedTrigger.category }}<em></em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">生效时段</div>
              <div class="zg-datacard__val">{{ focusedTrigger.duration || '全天' }}<em></em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">关联预案</div>
              <div class="zg-datacard__val">{{ focusedTrigger.presetLabel }}<em></em></div>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">触发履历</h4>
          <el-table :data="focusedTrigger.history" size="small" border>
            <el-table-column prop="time" label="触发时间" width="160" />
            <el-table-column prop="operator" label="触发人" width="100" />
            <el-table-column label="状态" width="90" align="center">
              <template #default="{ row }">
                <span class="zg-status" :class="row.status === '成功' ? 'online' : 'offline'">
                  <i class="dot"></i>{{ row.status }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" min-width="120" />
          </el-table>
        </div>

        <div class="zg-inspector__actions">
          <el-button size="large" @click="triggerInspector.closeInspector()">关闭</el-button>
          <el-button
            type="success"
            size="large"
            @click="onTestTrigger(focusedTrigger)"
          >
            <el-icon><VideoPlay /></el-icon>
            测试触发
          </el-button>
          <el-button
            type="warning"
            size="large"
            @click="onToggleTrigger(focusedTrigger)"
          >
            {{ focusedTrigger.lifecycle === '已启用' ? '停用触发器' : '启用触发器' }}
          </el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 新建/修订抽屉 -->
    <el-drawer
      v-model="triggerForm.drawerOpen"
      :title="triggerForm.editMode === 'compose' ? '新增触发器' : '修订触发器'"
      direction="rtl"
      size="560px"
    >
      <el-form :model="triggerForm.draftPayload" label-width="96px" class="zg-draftform">
        <el-form-item label="触发器名称" required>
          <el-input v-model="triggerForm.draftPayload.label" placeholder="请输入触发器名称" />
        </el-form-item>
        <el-form-item label="触发器类型" required>
          <el-select v-model="triggerForm.draftPayload.category" placeholder="请选择类型" style="width: 100%">
            <el-option label="定时触发" value="定时触发" />
            <el-option label="事件触发" value="事件触发" />
            <el-option label="手动触发" value="手动触发" />
          </el-select>
        </el-form-item>
        <el-form-item label="关联预案" required>
          <el-select v-model="triggerForm.draftPayload.presetLabel" placeholder="请选择预案" style="width: 100%">
            <el-option label="节日庆典模式" value="节日庆典模式" />
            <el-option label="节能模式" value="节能模式" />
            <el-option label="深夜模式" value="深夜模式" />
            <el-option label="应急模式" value="应急模式" />
            <el-option label="雾霾模式" value="雾霾模式" />
          </el-select>
        </el-form-item>
        <el-form-item label="亮度设置">
          <el-slider v-model="triggerForm.draftPayload.luminancePct" :min="0" :max="100" show-input />
          <span class="zg-draftform__unit">%</span>
        </el-form-item>
        <el-form-item label="生效时段">
          <el-input v-model="triggerForm.draftPayload.duration" placeholder="例如：02:00-05:00 或留空表示全天" />
        </el-form-item>
        <el-form-item label="运行状态">
          <el-radio-group v-model="triggerForm.draftPayload.lifecycle">
            <el-radio value="已启用">已启用</el-radio>
            <el-radio value="已停用">已停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="triggerForm.draftPayload.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="triggerForm.onDraftDiscard()">取消</el-button>
        <el-button
          type="primary"
          :loading="triggerForm.submitting"
          @click="onCommitTriggerDraft"
        >
          {{ triggerForm.editMode === 'compose' ? '新增' : '保存修订' }}
        </el-button>
      </template>
    </el-drawer>
  </section>
</template>

<script setup>
/**
 * 智光云枢 · 情景管理 · 预案触发器
 * 业务域：scenarioOrch
 * 功能：预案触发器管理与触发控制台
 * @module scenarioOrch/PresetTrigger
 * @author 智光云枢研发团队
 */
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Timer,
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

// ---- 初始 mock 数据池 ----
const initialTriggers = [
  {
    id: 1,
    no: 1,
    presetSn: 'TRG-2024-001',
    label: '节日庆典触发器',
    category: '定时触发',
    presetLabel: '节日庆典模式',
    lifecycle: '已启用',
    luminancePct: 100,
    duration: null,
    invokeCount: 25,
    createTime: '2024-01-15',
    lastInvokeTime: '2024-03-20 18:00:00',
    remark: '全亮度照明，营造节日氛围',
    history: [
      { time: '2024-03-20 18:00:00', operator: '管理员', status: '成功', remark: '节日开启' },
      { time: '2024-02-10 18:00:00', operator: '系统自动', status: '成功', remark: '春节模式' }
    ]
  },
  {
    id: 2,
    no: 2,
    presetSn: 'TRG-2024-002',
    label: '节能降耗触发器',
    category: '定时触发',
    presetLabel: '节能模式',
    lifecycle: '已启用',
    luminancePct: 50,
    duration: '22:00-06:00',
    invokeCount: 180,
    createTime: '2024-01-20',
    lastInvokeTime: '2024-03-21 22:00:00',
    remark: '夜间节能降耗',
    history: [
      { time: '2024-03-21 22:00:00', operator: '系统自动', status: '成功', remark: '日常节能' }
    ]
  },
  {
    id: 3,
    no: 3,
    presetSn: 'TRG-2024-003',
    label: '深夜静默触发器',
    category: '定时触发',
    presetLabel: '深夜模式',
    lifecycle: '已启用',
    luminancePct: 30,
    duration: '02:00-05:00',
    invokeCount: 90,
    createTime: '2024-02-01',
    lastInvokeTime: '2024-03-22 02:00:00',
    remark: '凌晨低亮度运行',
    history: []
  },
  {
    id: 4,
    no: 4,
    presetSn: 'TRG-2024-004',
    label: '应急响应触发器',
    category: '事件触发',
    presetLabel: '应急模式',
    lifecycle: '已停用',
    luminancePct: 100,
    duration: null,
    invokeCount: 5,
    createTime: '2024-02-10',
    lastInvokeTime: '2024-02-15 20:30:00',
    remark: '突发情况全亮照明',
    history: [
      { time: '2024-02-15 20:30:00', operator: '管理员', status: '成功', remark: '应急演练' }
    ]
  },
  {
    id: 5,
    no: 5,
    presetSn: 'TRG-2024-005',
    label: '雾霾应对触发器',
    category: '事件触发',
    presetLabel: '雾霾模式',
    lifecycle: '已启用',
    luminancePct: 90,
    duration: null,
    invokeCount: 12,
    createTime: '2024-02-20',
    lastInvokeTime: '2024-03-18 07:00:00',
    remark: '低能见度天气增强照明',
    history: []
  },
  {
    id: 6,
    no: 6,
    presetSn: 'TRG-2024-006',
    label: '周末休闲触发器',
    category: '手动触发',
    presetLabel: '节能模式',
    lifecycle: '已停用',
    luminancePct: 60,
    duration: '08:00-22:00',
    invokeCount: 8,
    createTime: '2024-03-01',
    lastInvokeTime: '2024-03-17 10:00:00',
    remark: '周末适度照明',
    history: []
  }
]

// ---- 表格数据容器（usePresetTable） ----
const triggerCtl = usePresetTable(null, {
  defaultPageSpan: 15,
  initialData: initialTriggers
})

// ---- 概览指标派生 ----
const activeTriggerCount = computed(
  () => triggerCtl.presetPlaybook.filter(t => t.lifecycle === '已启用').length
)
const inactiveTriggerCount = computed(
  () => triggerCtl.presetPlaybook.filter(t => t.lifecycle === '已停用').length
)
const totalTriggerCount = computed(
  () => triggerCtl.presetPlaybook.reduce((sum, t) => sum + (t.invokeCount || 0), 0)
)

// ---- 表单草稿容器（useFormDraft） ----
const triggerForm = useFormDraft(
  {
    label: '',
    category: '定时触发',
    presetLabel: '',
    luminancePct: 80,
    duration: '',
    lifecycle: '已启用',
    remark: ''
  },
  {
    validateFn: (draft) => {
      if (!draft.label) {
        ElMessage.warning('请输入触发器名称')
        return false
      }
      if (!draft.category) {
        ElMessage.warning('请选择触发器类型')
        return false
      }
      if (!draft.presetLabel) {
        ElMessage.warning('请选择关联预案')
        return false
      }
      return true
    }
  }
)

// ---- 详情抽屉容器（useDrawerInspector） ----
const triggerInspector = useDrawerInspector({ size: '680px', direction: 'rtl' })
const focusedTrigger = computed(() => triggerInspector.focusedRecord)

/**
 * 提交草稿：根据编排/修订模式写入数据池
 * 业务流包装：新建生成触发器编号，修订同步触发参数
 */
const onCommitTriggerDraft = async () => {
  const snapshot = await triggerForm.onDraftCommit()
  if (!snapshot) return

  if (triggerForm.editMode === 'compose') {
    // 新增：附带运行态默认值
    triggerCtl.appendRecord({
      ...snapshot,
      presetSn: `TRG-${new Date().getFullYear()}-${String(triggerCtl.presetPlaybook.length + 1).padStart(3, '0')}`,
      invokeCount: 0,
      createTime: new Date().toISOString().split('T')[0],
      lastInvokeTime: null,
      history: []
    })
    ElMessage.success('触发器新增成功，已纳入编排体系')
  } else {
    // 修订：合并更新到原记录
    const origin = triggerForm.originRecord
    triggerCtl.reviseRecord(origin.id, { ...snapshot })
    ElMessage.success('触发器配置已更新')
  }
}

/**
 * 启停触发器：已启用↔已停用切换
 * @param {Object} trigger 目标触发器
 */
const onToggleTrigger = (trigger) => {
  const nextLifecycle = trigger.lifecycle === '已启用' ? '已停用' : '已启用'
  ElMessageBox.confirm(
    `确认将「${trigger.label}」${nextLifecycle === '已启用' ? '启用' : '停用'}？`,
    '启停确认',
    { type: 'warning' }
  )
    .then(() => {
      triggerCtl.reviseRecord(trigger.id, { lifecycle: nextLifecycle })
      ElMessage.success(`触发器已${nextLifecycle === '已启用' ? '启用' : '停用'}`)
    })
    .catch(() => {})
}

/**
 * 测试触发器：模拟触发执行
 * @param {Object} trigger 目标触发器
 */
const onTestTrigger = (trigger) => {
  ElMessageBox.confirm(
    `确认测试触发器「${trigger.label}」？将模拟执行预案「${trigger.presetLabel}」`,
    '测试触发',
    { type: 'info' }
  )
    .then(() => {
      // 模拟触发：更新触发次数和履历
      const now = new Date().toLocaleString('zh-CN')
      const newHistory = {
        time: now,
        operator: '管理员',
        status: '成功',
        remark: '测试触发'
      }
      const currentHistory = trigger.history || []
      triggerCtl.reviseRecord(trigger.id, {
        invokeCount: (trigger.invokeCount || 0) + 1,
        lastInvokeTime: now,
        history: [newHistory, ...currentHistory]
      })
      ElMessage.success(`触发器测试成功，预案「${trigger.presetLabel}」已模拟执行`)
    })
    .catch(() => {})
}

/**
 * 废止触发器：二次确认后从编排中移除
 * @param {Object} trigger 目标触发器
 */
const onRetireTrigger = (trigger) => {
  ElMessageBox.confirm(
    `确定要将触发器「${trigger.label}」从编排中废止吗？`,
    '废止确认',
    { type: 'warning' }
  )
    .then(() => {
      triggerCtl.retireRecord(trigger.id)
      ElMessage.success('触发器已废止，编排体系已同步')
    })
    .catch(() => {})
}
</script>

<style scoped lang="scss">
.zg-trigger {
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

.zg-triggercard {
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

  &__type {
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

    &--full {
      grid-column: span 2;
    }

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