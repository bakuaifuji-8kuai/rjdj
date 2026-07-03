<!--
  智光云枢 · 运维工单 · 自动派发规则
  业务域：opsTicket
  功能：告警自动派发规则的台账管理
        支持卡片/列表双视图、抽屉式详情与编排、规则启停控制
-->
<template>
  <section class="zg-autodispatch">
    <!-- 页面头部：品牌徽标 + 标题 + 新建入口 -->
    <header class="zg-autodispatch__head">
      <div class="zg-autodispatch__headline">
        <div class="zg-autodispatch__sigil">
          <el-icon :size="22"><Setting /></el-icon>
        </div>
        <div class="zg-autodispatch__copy">
          <h1 class="zg-autodispatch__title">自动派发规则</h1>
          <p class="zg-autodispatch__sub">
            告警智能派发中枢 · 在役 {{ activeRuleCount }} 条 ·
            停用 {{ inactiveRuleCount }} 条 · 覆盖层级 {{ levelCoverageCount }} 个
          </p>
        </div>
      </div>
      <div class="zg-autodispatch__cta">
        <el-button type="primary" @click="ruleForm.openComposer()">
          <el-icon><Plus /></el-icon>
          <span>新建规则</span>
        </el-button>
      </div>
    </header>

    <!-- 概览指标卡 -->
    <div class="zg-metrics">
      <div class="zg-metrics__cell">
        <span class="zg-metrics__num">{{ ruleCtl.totalRows }}</span>
        <span class="zg-metrics__lbl">规则总数</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--ok">
        <span class="zg-metrics__num">{{ activeRuleCount }}</span>
        <span class="zg-metrics__lbl">在役规则</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--warn">
        <span class="zg-metrics__num">{{ inactiveRuleCount }}</span>
        <span class="zg-metrics__lbl">停用规则</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--info">
        <span class="zg-metrics__num">{{ levelCoverageCount }}</span>
        <span class="zg-metrics__lbl">覆盖层级</span>
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
          v-model="ruleCtl.typeBucket"
          placeholder="设备类型"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="集控" value="集控" />
          <el-option label="光源" value="光源" />
          <el-option label="单灯控制器" value="单灯控制器" />
        </el-select>
        <el-select
          v-model="ruleCtl.statusBuckets"
          placeholder="规则状态"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="在役" value="在役" />
          <el-option label="关闭" value="关闭" />
        </el-select>
        <el-input
          v-model="ruleCtl.filterLexicon"
          placeholder="检索规则名称/层级"
          clearable
          class="zg-filterband__search"
          @keyup.enter="ruleCtl.onFilterApply()"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="ruleCtl.onFilterApply()">
          <el-icon><Search /></el-icon>
          <span>检索</span>
        </el-button>
        <el-button @click="ruleCtl.onFilterReset()">
          <el-icon><RefreshLeft /></el-icon>
          <span>重置</span>
        </el-button>
      </div>
    </div>

    <!-- 卡片视图 -->
    <div v-if="densityMode === 'card'" class="zg-cardgrid">
      <article
        v-for="rule in ruleCtl.pagedRows"
        :key="rule.id"
        class="zg-rulecard"
        :class="rule.status === '在役' ? 'online' : 'offline'"
        @click="ruleInspector.openInspector(rule)"
      >
        <div class="zg-rulecard__head">
          <div class="zg-rulecard__glyph">
            <el-icon :size="24"><Setting /></el-icon>
          </div>
          <span class="zg-status" :class="rule.status === '在役' ? 'online' : 'offline'">
            <i class="dot"></i>{{ rule.status }}
          </span>
        </div>
        <div class="zg-rulecard__body">
          <h3 class="zg-rulecard__name">{{ rule.levelName }}</h3>
          <p class="zg-rulecard__meta">{{ rule.deviceType }} · {{ rule.workOrderType }}</p>
          <div class="zg-rulecard__stats">
            <span class="zg-rulecard__stat">
              <em>{{ rule.alarmType ? rule.alarmType.split(',').length : 0 }}</em> 类告警
            </span>
            <span class="zg-rulecard__stat">
              <em>{{ rule.deviceType }}</em> 设备
            </span>
          </div>
        </div>
        <div class="zg-rulecard__foot">
          <span class="zg-rulecard__sn">No.{{ rule.no }}</span>
          <div class="zg-rulecard__actions">
            <el-button link type="primary" size="small" @click.stop="onToggleRule(rule)">
              {{ rule.status === '在役' ? '停用' : '在役' }}
            </el-button>
            <el-button link type="primary" size="small" @click.stop="onOpenReviser(rule)">修订</el-button>
            <el-button link type="danger" size="small" @click.stop="onRetireRule(rule)">废止</el-button>
          </div>
        </div>
      </article>
    </div>

    <!-- 列表视图 -->
    <div v-else class="zg-tablewrap">
      <el-table :data="ruleCtl.pagedRows" stripe class="zg-datatable">
        <el-table-column prop="no" label="序号" width="60" align="center" />
        <el-table-column prop="levelName" label="所属层级" min-width="150" />
        <el-table-column prop="deviceType" label="设备类型" width="110" align="center">
          <template #default="{ row }">
            <span class="zg-rulecard__badge">{{ row.deviceType }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="alarmType" label="告警类型" min-width="200" />
        <el-table-column prop="workOrderType" label="处置单类型" width="130" align="center" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <span class="zg-status" :class="row.status === '在役' ? 'online' : 'offline'">
              <i class="dot"></i>{{ row.status }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="处置" width="260" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="ruleInspector.openInspector(row)">详情</el-button>
            <el-button type="warning" size="small" @click="onToggleRule(row)">
              {{ row.status === '在役' ? '停用' : '在役' }}
            </el-button>
            <el-button type="primary" size="small" @click="onOpenReviser(row)">修订</el-button>
            <el-button type="danger" size="small" @click="onRetireRule(row)">废止</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页条 -->
    <div class="zg-pagerbar">
      <el-pagination
        v-model:current-page="ruleCtl.pagingCursor"
        v-model:page-size="ruleCtl.pageSpan"
        :total="ruleCtl.totalRows"
        :page-sizes="[10, 15, 20, 50, 100]"
        layout="prev, pager, next, jumper, ->, sizes, total"
        background
      />
    </div>

    <!-- 详情抽屉 -->
    <el-drawer
      v-model="ruleInspector.drawerOpen"
      :title="'规则详情 · ' + (focusedRule?.levelName || '')"
      direction="rtl"
      size="680px"
    >
      <div v-if="focusedRule" class="zg-inspector">
        <div class="zg-inspector__head">
          <div class="zg-inspector__glyph">
            <el-icon :size="36"><Setting /></el-icon>
          </div>
          <div class="zg-inspector__meta">
            <h2 class="zg-inspector__name">{{ focusedRule.levelName }}</h2>
            <p class="zg-inspector__type">{{ focusedRule.deviceType }} · {{ focusedRule.workOrderType }}</p>
            <span class="zg-status" :class="focusedRule.status === '在役' ? 'online' : 'offline'">
              <i class="dot"></i>{{ focusedRule.status }}
            </span>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">规则档案</h4>
          <div class="zg-inspector__grid">
            <div class="zg-inspector__cell">
              <span class="lbl">所属层级</span>
              <span class="val">{{ focusedRule.levelName }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">设备类型</span>
              <span class="val">{{ focusedRule.deviceType }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">处置单类型</span>
              <span class="val">{{ focusedRule.workOrderType }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">规则序号</span>
              <span class="val">No.{{ focusedRule.no }}</span>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">告警覆盖</h4>
          <div class="zg-inspector__grid">
            <div class="zg-inspector__cell" style="grid-column: 1 / -1;">
              <span class="lbl">告警类型</span>
              <span class="val">{{ focusedRule.alarmType || '-' }}</span>
            </div>
          </div>
        </div>

        <div class="zg-inspector__actions">
          <el-button size="large" @click="ruleInspector.closeInspector()">关闭</el-button>
          <el-button
            type="warning"
            size="large"
            @click="onToggleRule(focusedRule)"
          >
            {{ focusedRule.status === '在役' ? '停用规则' : '在役规则' }}
          </el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 新建/修订抽屉 -->
    <el-drawer
      v-model="ruleForm.drawerOpen"
      :title="ruleForm.editMode === 'compose' ? '新建派发规则' : '修订派发规则'"
      direction="rtl"
      size="560px"
    >
      <el-form :model="ruleForm.draftPayload" label-width="96px" class="zg-draftform">
        <el-form-item label="所属层级" required>
          <el-select v-model="ruleForm.draftPayload.levelName" placeholder="请选择所属层级" style="width: 100%">
            <el-option label="力唯中天产业园" value="力唯中天产业园" />
            <el-option label="园区地面" value="园区地面" />
            <el-option label="1栋地面" value="1栋地面" />
            <el-option label="1栋" value="1栋" />
            <el-option label="4栋" value="4栋" />
            <el-option label="园区道路" value="园区道路" />
            <el-option label="充电桩区域" value="充电桩区域" />
          </el-select>
        </el-form-item>
        <el-form-item label="设备类型" required>
          <el-select v-model="ruleForm.draftPayload.deviceType" placeholder="请选择设备类型" style="width: 100%">
            <el-option label="集控" value="集控" />
            <el-option label="光源" value="光源" />
            <el-option label="单灯控制器" value="单灯控制器" />
          </el-select>
        </el-form-item>
        <el-form-item label="告警类型" required>
          <el-select v-model="ruleForm.draftPayload.alarmType" placeholder="请选择告警类型" style="width: 100%" multiple>
            <el-option label="设备掉电告警" value="设备掉电告警" />
            <el-option label="设备离线告警" value="设备离线告警" />
            <el-option label="光源调光异常" value="光源调光异常" />
            <el-option label="信号强度" value="信号强度" />
            <el-option label="离线告警" value="离线告警" />
            <el-option label="欠压告警" value="欠压告警" />
            <el-option label="非计划异常亮灯" value="非计划异常亮灯" />
          </el-select>
        </el-form-item>
        <el-form-item label="处置单类型" required>
          <el-select v-model="ruleForm.draftPayload.workOrderType" placeholder="请选择处置单类型" style="width: 100%">
            <el-option label="爱克园区巡检" value="爱克园区巡检" />
            <el-option label="光源故障模板" value="光源故障模板" />
            <el-option label="巡检模板" value="巡检模板" />
            <el-option label="-" value="-" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="ruleForm.onDraftDiscard()">取消</el-button>
        <el-button
          type="primary"
          :loading="ruleForm.submitting"
          @click="onCommitRuleDraft"
        >
          {{ ruleForm.editMode === 'compose' ? '新建' : '保存修订' }}
        </el-button>
      </template>
    </el-drawer>
  </section>
</template>

<script setup>
/**
 * 智光云枢 · 运维工单 · 自动派发规则
 * 业务域：opsTicket
 * 功能：告警自动派发规则的台账与生命周期管理
 * @module opsTicket/AutoDispatch
 * @author 智光云枢研发团队
 */
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Setting,
  Plus,
  Grid,
  List,
  Search,
  RefreshLeft
} from '@element-plus/icons-vue'
import { usePresetTable } from '@/shared/composables/usePresetTable'
import { useFormDraft } from '@/shared/composables/useFormDraft'
import { useDrawerInspector } from '@/shared/composables/useDrawerInspector'

// ---- 视图密度切换 ----
const densityMode = ref('card')

// ---- 初始 mock 数据池 ----
const initialRules = [
  {
    id: 1,
    no: 1,
    name: '力唯中天产业园-集控规则',
    category: '集控',
    levelName: '力唯中天产业园',
    deviceType: '集控',
    alarmType: '设备掉电告警,设备离线告警',
    workOrderType: '光源故障模板',
    status: '在役'
  },
  {
    id: 2,
    no: 2,
    name: '力唯中天产业园-集控规则',
    category: '集控',
    levelName: '力唯中天产业园',
    deviceType: '集控',
    alarmType: '设备掉电告警,设备离线告警',
    workOrderType: '光源故障模板',
    status: '在役'
  },
  {
    id: 3,
    no: 3,
    name: '园区道路-光源规则',
    category: '光源',
    levelName: '园区道路',
    deviceType: '光源',
    alarmType: '光源调光异常',
    workOrderType: '巡检模板',
    status: '在役'
  },
  {
    id: 4,
    no: 4,
    name: '力唯中天产业园-集控规则',
    category: '集控',
    levelName: '力唯中天产业园',
    deviceType: '集控',
    alarmType: '设备离线告警',
    workOrderType: '巡检模板',
    status: '关闭'
  },
  {
    id: 5,
    no: 5,
    name: '力唯中天产业园-单灯规则',
    category: '单灯控制器',
    levelName: '力唯中天产业园',
    deviceType: '单灯控制器',
    alarmType: '信号强度,离线告警,欠压告警',
    workOrderType: '巡检模板',
    status: '关闭'
  },
  {
    id: 6,
    no: 6,
    name: '力唯中天产业园-单灯规则',
    category: '单灯控制器',
    levelName: '力唯中天产业园',
    deviceType: '单灯控制器',
    alarmType: '信号强度,离线告警,欠压告警',
    workOrderType: '巡检模板',
    status: '关闭'
  },
  {
    id: 7,
    no: 7,
    name: '充电桩区域-光源规则',
    category: '光源',
    levelName: '充电桩区域',
    deviceType: '光源',
    alarmType: '非计划异常亮灯,光源调光异常',
    workOrderType: '-',
    status: '关闭'
  }
]

// ---- 表格数据容器（usePresetTable） ----
const ruleCtl = usePresetTable(null, {
  defaultPageSpan: 15,
  initialData: initialRules
})

// ---- 概览指标派生 ----
const activeRuleCount = computed(
  () => ruleCtl.presetPlaybook.filter(r => r.status === '在役').length
)
const inactiveRuleCount = computed(
  () => ruleCtl.presetPlaybook.filter(r => r.status === '关闭').length
)
const levelCoverageCount = computed(
  () => new Set(ruleCtl.presetPlaybook.map(r => r.levelName)).size
)

// ---- 表单草稿容器（useFormDraft） ----
const ruleForm = useFormDraft(
  {
    levelName: '',
    deviceType: '',
    alarmType: [],
    workOrderType: ''
  },
  {
    validateFn: (draft) => {
      if (!draft.levelName) {
        ElMessage.warning('请选择所属层级')
        return false
      }
      if (!draft.deviceType) {
        ElMessage.warning('请选择设备类型')
        return false
      }
      if (!draft.alarmType || draft.alarmType.length === 0) {
        ElMessage.warning('请选择告警类型')
        return false
      }
      if (!draft.workOrderType) {
        ElMessage.warning('请选择处置单类型')
        return false
      }
      return true
    }
  }
)

// ---- 详情抽屉容器（useDrawerInspector） ----
const ruleInspector = useDrawerInspector({ size: '680px', direction: 'rtl' })
const focusedRule = computed(() => ruleInspector.focusedRecord)

/**
 * 打开修订抽屉：将逗号分隔的告警类型转为数组后载入草稿
 * @param {Object} record 目标规则记录
 */
const onOpenReviser = (record) => {
  ruleForm.openReviser({
    ...record,
    alarmType: record.alarmType ? record.alarmType.split(',') : []
  })
}

/**
 * 提交草稿：根据编排/修订模式写入数据池
 * 业务流包装：新建生成规则序号，修订同步告警类型字符串化
 */
const onCommitRuleDraft = async () => {
  const snapshot = await ruleForm.onDraftCommit()
  if (!snapshot) return

  const payload = {
    ...snapshot,
    alarmType: Array.isArray(snapshot.alarmType) ? snapshot.alarmType.join(',') : snapshot.alarmType
  }

  if (ruleForm.editMode === 'compose') {
    ruleCtl.appendRecord({
      ...payload,
      status: '在役',
      name: `${payload.levelName}-${payload.deviceType}规则`
    })
    ElMessage.success('派发规则新建成功，已并入规则台账')
  } else {
    const origin = ruleForm.originRecord
    ruleCtl.reviseRecord(origin.id, { ...payload })
    ElMessage.success('派发规则档案已更新')
  }
}

/**
 * 规则启停切换：在役↔关闭状态切换，含二次确认
 * @param {Object} rule 目标派发规则
 */
const onToggleRule = (rule) => {
  const nextStatus = rule.status === '在役' ? '关闭' : '在役'
  ElMessageBox.confirm(
    `确认将「${rule.levelName}」${nextStatus === '在役' ? '启用' : '停用'}？`,
    '启停确认',
    { type: 'warning' }
  )
    .then(() => {
      ruleCtl.reviseRecord(rule.id, { status: nextStatus })
      ElMessage.success(`规则已${nextStatus === '在役' ? '启用' : '停用'}，派发策略已同步`)
    })
    .catch(() => {})
}

/**
 * 废止规则：二次确认后从台账中移除
 * @param {Object} rule 目标派发规则
 */
const onRetireRule = (rule) => {
  ElMessageBox.confirm(
    `确定要将「${rule.levelName}」从派发台账中废止吗？`,
    '废止确认',
    { type: 'warning' }
  )
    .then(() => {
      ruleCtl.retireRecord(rule.id)
      ElMessage.success('规则已废止，台账已同步')
    })
    .catch(() => {})
}
</script>

<style scoped lang="scss">
.zg-autodispatch {
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

.zg-rulecard {
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

  &.offline {
    border-left: 3px solid var(--zg-danger);
  }
  &.online {
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

  &__meta {
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

  &__sn {
    font-size: 12px;
    color: var(--zg-ink-placeholder);
  }

  &__actions {
    display: flex;
    gap: 4px;
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 60px;
    height: 24px;
    padding: 0 8px;
    background: var(--zg-brand-tint-50);
    color: var(--zg-brand-primary);
    font-size: 12px;
    font-weight: 500;
    border-radius: var(--zg-radius-md);
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

.zg-draftform {
  &__unit {
    margin-left: 8px;
    font-size: 13px;
    color: var(--zg-ink-tertiary);
  }
}
</style>
