<!--
  智光云枢 · 情景编排 · 预案模板管理
  业务域：scenarioOrch
  功能：预案模板的台账管理、执行调度、生命周期管控
        支持卡片/列表双视图、抽屉式详情与编排、批量废止
-->
<template>
  <section class="zg-template">
    <header class="zg-template__head">
      <div class="zg-template__headline">
        <div class="zg-template__sigil">
          <el-icon :size="22"><Grid /></el-icon>
        </div>
        <div class="zg-template__copy">
          <h1 class="zg-template__title">预案模板管理</h1>
          <p class="zg-template__sub">
            情景编排中枢 · 在线 {{ activeTemplateCount }} 个 ·
            应急 {{ emergencyTemplateCount }} 个 · 累计设备 {{ totalDeviceCount }} 台
          </p>
        </div>
      </div>
      <div class="zg-template__cta">
        <el-button type="primary" @click="templateForm.openComposer()">
          <el-icon><Plus /></el-icon>
          <span>新增预案</span>
        </el-button>
        <el-button
          type="danger"
          :disabled="templateCtl.pagedRows.filter(r => r._selected).length === 0"
          @click="onBatchRetire"
        >
          <el-icon><Delete /></el-icon>
          <span>批量废止</span>
        </el-button>
        <el-button @click="templateCtl.refreshVideoPlaybook()">
          <el-icon><RefreshLeft /></el-icon>
          <span>刷新</span>
        </el-button>
      </div>
    </header>

    <div class="zg-metrics">
      <div class="zg-metrics__cell">
        <span class="zg-metrics__num">{{ templateCtl.totalRows }}</span>
        <span class="zg-metrics__lbl">预案总数</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--ok">
        <span class="zg-metrics__num">{{ activeTemplateCount }}</span>
        <span class="zg-metrics__lbl">在线预案</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--warn">
        <span class="zg-metrics__num">{{ emergencyTemplateCount }}</span>
        <span class="zg-metrics__lbl">应急预案</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--info">
        <span class="zg-metrics__num">{{ totalDeviceCount }}</span>
        <span class="zg-metrics__lbl">关联设备</span>
      </div>
    </div>

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
          v-model="templateCtl.typeBucket"
          placeholder="模板类型"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="日常照明" value="daily" />
          <el-option label="节假日" value="holiday" />
          <el-option label="应急" value="emergency" />
          <el-option label="节能" value="energy" />
        </el-select>
        <el-input
          v-model="templateCtl.filterLexicon"
          placeholder="检索模板名称"
          clearable
          class="zg-filterband__search"
          @keyup.enter="templateCtl.onFilterApply()"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="templateCtl.onFilterApply()">
          <el-icon><Search /></el-icon>
          <span>检索</span>
        </el-button>
        <el-button @click="templateCtl.onFilterReset()">
          <el-icon><RefreshLeft /></el-icon>
          <span>重置</span>
        </el-button>
      </div>
    </div>

    <div v-if="densityMode === 'card'" class="zg-cardgrid">
      <article
        v-for="template in templateCtl.pagedRows"
        :key="template.id"
        class="zg-templatecard"
        :class="template.type"
        @click="templateInspector.openInspector(template)"
      >
        <div class="zg-templatecard__head">
          <div class="zg-templatecard__glyph">
            <el-icon :size="24"><Grid /></el-icon>
          </div>
          <span class="zg-tag" :class="template.type">
            {{ getTypeText(template.type) }}
          </span>
        </div>
        <div class="zg-templatecard__body">
          <h3 class="zg-templatecard__name">{{ template.name }}</h3>
          <p class="zg-templatecard__action">{{ getActionText(template.action) }} · {{ template.brightness }}%</p>
          <div class="zg-templatecard__stats">
            <span class="zg-templatecard__stat">
              <em>{{ template.deviceCount }}</em> 设备
            </span>
          </div>
        </div>
        <div class="zg-templatecard__foot">
          <span class="zg-templatecard__time">{{ template.createdAt }}</span>
          <div class="zg-templatecard__actions">
            <el-button link type="primary" size="small" @click.stop="onExecuteTemplate(template)">
              <el-icon><VideoPlay /></el-icon>执行
            </el-button>
            <el-button link type="primary" size="small" @click.stop="templateForm.openReviser(template)">修订</el-button>
            <el-button link type="danger" size="small" @click.stop="onRetireTemplate(template)">废止</el-button>
          </div>
        </div>
      </article>
    </div>

    <div v-else class="zg-tablewrap">
      <el-table :data="templateCtl.pagedRows" stripe class="zg-datatable" @selection-change="onRowSelectionChange">
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column prop="no" label="序号" width="60" align="center" />
        <el-table-column prop="name" label="模板名称" min-width="180" />
        <el-table-column prop="type" label="模板类型" width="120" align="center">
          <template #default="{ row }">
            <span class="zg-tag" :class="row.type">{{ getTypeText(row.type) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="action" label="执行动作" width="120" align="center">
          <template #default="{ row }">
            {{ getActionText(row.action) }}
          </template>
        </el-table-column>
        <el-table-column prop="brightness" label="亮度(%)" width="100" align="center" />
        <el-table-column prop="deviceCount" label="关联设备" width="100" align="center" />
        <el-table-column prop="createdAt" label="创建时间" width="160" />
        <el-table-column label="处置" width="240" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="templateInspector.openInspector(row)">详情</el-button>
            <el-button type="success" size="small" @click="onExecuteTemplate(row)">
              <el-icon><VideoPlay /></el-icon>执行
            </el-button>
            <el-button type="primary" size="small" @click="templateForm.openReviser(row)">修订</el-button>
            <el-button type="danger" size="small" @click="onRetireTemplate(row)">废止</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="zg-pagerbar">
      <el-pagination
        v-model:current-page="templateCtl.pagingCursor"
        v-model:page-size="templateCtl.pageSpan"
        :total="templateCtl.totalRows"
        :page-sizes="[10, 15, 20, 50, 100]"
        layout="prev, pager, next, jumper, ->, sizes, total"
        background
      />
    </div>

    <el-drawer
      v-model="templateInspector.drawerOpen"
      :title="'预案详情 · ' + (focusedTemplate?.name || '')"
      direction="rtl"
      size="680px"
    >
      <div v-if="focusedTemplate" class="zg-inspector">
        <div class="zg-inspector__head">
          <div class="zg-inspector__glyph">
            <el-icon :size="36"><Grid /></el-icon>
          </div>
          <div class="zg-inspector__meta">
            <h2 class="zg-inspector__name">{{ focusedTemplate.name }}</h2>
            <p class="zg-inspector__type">{{ getTypeText(focusedTemplate.type) }} · {{ getActionText(focusedTemplate.action) }}</p>
            <span class="zg-tag" :class="focusedTemplate.type">{{ getTypeText(focusedTemplate.type) }}</span>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">基本档案</h4>
          <div class="zg-inspector__grid">
            <div class="zg-inspector__cell">
              <span class="lbl">执行动作</span>
              <span class="val">{{ getActionText(focusedTemplate.action) }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">亮度值</span>
              <span class="val">{{ focusedTemplate.brightness }}%</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">关联设备</span>
              <span class="val">{{ focusedTemplate.deviceCount }} 台</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">创建时间</span>
              <span class="val">{{ focusedTemplate.createdAt }}</span>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">模板描述</h4>
          <div class="zg-inspector__desc">
            {{ focusedTemplate.description || '-' }}
          </div>
        </div>

        <div class="zg-inspector__actions">
          <el-button size="large" @click="templateInspector.closeInspector()">关闭</el-button>
          <el-button type="success" size="large" @click="onExecuteTemplate(focusedTemplate)">
            <el-icon><VideoPlay /></el-icon>执行预案
          </el-button>
        </div>
      </div>
    </el-drawer>

    <el-drawer
      v-model="templateForm.drawerOpen"
      :title="templateForm.editMode === 'compose' ? '新增预案' : '修订预案'"
      direction="rtl"
      size="560px"
    >
      <el-form ref="templateForm.formAnchor" :model="templateForm.draftPayload" label-width="96px" class="zg-draftform">
        <el-form-item label="模板名称" required>
          <el-input v-model="templateForm.draftPayload.name" placeholder="请输入模板名称" />
        </el-form-item>
        <el-form-item label="模板类型" required>
          <el-select v-model="templateForm.draftPayload.type" placeholder="请选择模板类型" style="width: 100%">
            <el-option label="日常照明" value="daily" />
            <el-option label="节假日" value="holiday" />
            <el-option label="应急" value="emergency" />
            <el-option label="节能" value="energy" />
          </el-select>
        </el-form-item>
        <el-form-item label="执行动作" required>
          <el-select v-model="templateForm.draftPayload.action" placeholder="请选择执行动作" style="width: 100%">
            <el-option label="开灯" value="on" />
            <el-option label="关灯" value="off" />
            <el-option label="调光" value="dim" />
          </el-select>
        </el-form-item>
        <el-form-item label="亮度值">
          <el-slider v-model="templateForm.draftPayload.brightness" :min="0" :max="100" show-input />
        </el-form-item>
        <el-form-item label="关联设备数">
          <el-input-number v-model="templateForm.draftPayload.deviceCount" :min="0" :max="9999" />
          <span class="zg-draftform__unit">台</span>
        </el-form-item>
        <el-form-item label="模板描述">
          <el-input
            v-model="templateForm.draftPayload.description"
            type="textarea"
            :rows="3"
            placeholder="请输入模板描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="templateForm.onDraftDiscard()">取消</el-button>
        <el-button
          type="primary"
          :loading="templateForm.submitting"
          @click="onCommitTemplateDraft"
        >
          {{ templateForm.editMode === 'compose' ? '新增' : '保存修订' }}
        </el-button>
      </template>
    </el-drawer>
  </section>
</template>

<script setup>
/**
 * 智光云枢 · 情景编排 · 预案模板管理
 * 业务域：scenarioOrch
 * 功能：预案模板的台账管理、执行调度、生命周期管控
 * @module scenarioOrch/PresetTemplate
 * @author 智光云枢研发团队
 */
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Grid,
  Plus,
  List,
  Search,
  RefreshLeft,
  VideoPlay,
  Delete
} from '@element-plus/icons-vue'
import { usePresetTable } from '@/shared/composables/usePresetTable'
import { useFormDraft } from '@/shared/composables/useFormDraft'
import { useDrawerInspector } from '@/shared/composables/useDrawerInspector'

const densityMode = ref('card')

const initialTemplates = [
  {
    id: 1,
    no: 1,
    name: '日常全亮模式',
    type: 'daily',
    action: 'on',
    brightness: 100,
    deviceCount: 50,
    createdAt: '2024-01-15 10:00:00',
    description: '日常全亮照明模板'
  },
  {
    id: 2,
    no: 2,
    name: '节能调光模式',
    type: 'energy',
    action: 'dim',
    brightness: 60,
    deviceCount: 50,
    createdAt: '2024-01-16 14:30:00',
    description: '夜间节能调光，亮度60%'
  },
  {
    id: 3,
    no: 3,
    name: '深夜省电模式',
    type: 'energy',
    action: 'dim',
    brightness: 30,
    deviceCount: 30,
    createdAt: '2024-01-17 09:00:00',
    description: '凌晨2点后自动降低亮度'
  },
  {
    id: 4,
    no: 4,
    name: '节假日装饰模式',
    type: 'holiday',
    action: 'on',
    brightness: 100,
    deviceCount: 20,
    createdAt: '2024-01-20 11:00:00',
    description: '节假日全亮装饰照明'
  },
  {
    id: 5,
    no: 5,
    name: '应急照明模式',
    type: 'emergency',
    action: 'on',
    brightness: 100,
    deviceCount: 100,
    createdAt: '2024-02-01 16:00:00',
    description: '紧急情况全亮照明'
  },
  {
    id: 6,
    no: 6,
    name: '夜间巡检模式',
    type: 'daily',
    action: 'dim',
    brightness: 70,
    deviceCount: 80,
    createdAt: '2024-02-10 10:30:00',
    description: '夜间巡检时的照明模式'
  },
  {
    id: 7,
    no: 7,
    name: '下班关灯模式',
    type: 'daily',
    action: 'off',
    brightness: 0,
    deviceCount: 25,
    createdAt: '2024-02-15 15:00:00',
    description: '下班时间自动关灯'
  },
  {
    id: 8,
    no: 8,
    name: '周末节能模式',
    type: 'energy',
    action: 'dim',
    brightness: 50,
    deviceCount: 40,
    createdAt: '2024-03-01 09:00:00',
    description: '周末人流量减少时节能'
  }
]

const templateCtl = usePresetTable(null, {
  defaultPageSpan: 15,
  initialData: initialTemplates
})

const activeTemplateCount = computed(
  () => templateCtl.presetVideoPlaybook.value.filter(t => t.type !== 'emergency').length
)

const emergencyTemplateCount = computed(
  () => templateCtl.presetVideoPlaybook.value.filter(t => t.type === 'emergency').length
)

const totalDeviceCount = computed(
  () => templateCtl.presetVideoPlaybook.value.reduce((sum, t) => sum + (t.deviceCount || 0), 0)
)

const templateForm = useFormDraft(
  {
    name: '',
    type: '',
    action: 'on',
    brightness: 80,
    deviceCount: 0,
    description: ''
  },
  {
    validateFn: (draft) => {
      if (!draft.name) {
        ElMessage.warning('请输入模板名称')
        return false
      }
      if (!draft.type) {
        ElMessage.warning('请选择模板类型')
        return false
      }
      if (!draft.action) {
        ElMessage.warning('请选择执行动作')
        return false
      }
      return true
    }
  }
)

const templateInspector = useDrawerInspector({ size: '680px', direction: 'rtl' })
const focusedTemplate = computed(() => templateInspector.focusedRecord)

/**
 * 获取模板类型中文描述
 * @param {string} type 类型编码
 * @returns {string} 中文描述
 */
const getTypeText = (type) => {
  const map = { daily: '日常照明', holiday: '节假日', emergency: '应急', energy: '节能' }
  return map[type] || type
}

/**
 * 获取执行动作中文描述
 * @param {string} action 动作编码
 * @returns {string} 中文描述
 */
const getActionText = (action) => {
  const map = { on: '开灯', off: '关灯', dim: '调光' }
  return map[action] || action
}

/**
 * 行选择变更处理
 * @param {Array} selection 选中行数组
 */
const onRowSelectionChange = (selection) => {
  templateCtl.pagedRows.value.forEach(row => {
    row._selected = selection.some(s => s.id === row.id)
  })
}

/**
 * 提交预案草稿：根据编排/修订模式写入数据池
 * 业务流包装：新建生成编号，修订同步字段
 */
const onCommitTemplateDraft = async () => {
  const snapshot = await templateForm.onDraftCommit()
  if (!snapshot) return

  if (templateForm.editMode === 'compose') {
    templateCtl.appendRecord({
      ...snapshot,
      createdAt: new Date().toLocaleString(),
      deviceCount: snapshot.deviceCount || 0
    })
    ElMessage.success('预案模板新增成功，已并入编排台账')
  } else {
    const origin = templateForm.originRecord
    templateCtl.reviseRecord(origin.id, { ...snapshot })
    ElMessage.success('预案模板档案已更新')
  }
}

/**
 * 执行预案：触发情景编排调度，含执行确认回执
 * @param {Object} template 目标预案模板
 */
const onExecuteTemplate = (template) => {
  ElMessageBox.confirm(
    `确认执行「${template.name}」预案？此操作将触发${template.deviceCount}台设备的${getActionText(template.action)}动作`,
    '执行确认',
    { type: 'info' }
  )
    .then(() => {
      ElMessage.success(`预案「${template.name}」已下发执行，调度回执已签收`)
    })
    .catch(() => {})
}

/**
 * 废止预案：二次确认后从台账中移除
 * @param {Object} template 目标预案模板
 */
const onRetireTemplate = (template) => {
  ElMessageBox.confirm(
    `确定要将「${template.name}」从预案台账中废止吗？`,
    '废止确认',
    { type: 'warning' }
  )
    .then(() => {
      templateCtl.retireRecord(template.id)
      ElMessage.success('预案已废止，台账已同步')
    })
    .catch(() => {})
}

/**
 * 批量废止预案：批量确认后移除选中记录
 */
const onBatchRetire = () => {
  const selectedRows = templateCtl.pagedRows.value.filter(r => r._selected)
  if (selectedRows.length === 0) {
    ElMessage.warning('请先选择要废止的预案')
    return
  }

  ElMessageBox.confirm(
    `确定要废止选中的${selectedRows.length}个预案吗？`,
    '批量废止确认',
    { type: 'warning' }
  )
    .then(() => {
      selectedRows.forEach(row => {
        templateCtl.retireRecord(row.id)
      })
      ElMessage.success(`已成功废止${selectedRows.length}个预案`)
    })
    .catch(() => {})
}
</script>

<style scoped lang="scss">
.zg-template {
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

  &__cta {
    display: flex;
    gap: 10px;
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

.zg-templatecard {
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

  &.daily { border-left: 3px solid var(--zg-brand-primary); }
  &.holiday { border-left: 3px solid var(--zg-success); }
  &.emergency { border-left: 3px solid var(--zg-danger); }
  &.energy { border-left: 3px solid var(--zg-warning); }

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

  &__action {
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

.zg-tag {
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: var(--zg-radius-pill);

  &.daily {
    color: var(--zg-brand-primary);
    background: var(--zg-brand-tint-100);
  }
  &.holiday {
    color: var(--zg-success);
    background: var(--zg-success-soft);
  }
  &.emergency {
    color: var(--zg-danger);
    background: var(--zg-danger-soft);
  }
  &.energy {
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

  &__desc {
    padding: 12px 14px;
    background: var(--zg-surface-muted);
    border-radius: var(--zg-radius-md);
    font-size: 13px;
    color: var(--zg-ink-secondary);
    line-height: 1.6;
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

.zg-draftform {
  &__unit {
    margin-left: 8px;
    font-size: 13px;
    color: var(--zg-ink-tertiary);
  }
}
</style>