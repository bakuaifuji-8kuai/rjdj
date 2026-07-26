<template>
  <section class="zg-scene-linkage">
    <header class="zg-scene-linkage__head">
      <div class="zg-scene-linkage__headline">
        <div class="zg-scene-linkage__sigil">
          <el-icon :size="22"><Link /></el-icon>
        </div>
        <div class="zg-scene-linkage__copy">
          <h1 class="zg-scene-linkage__title">场景联动</h1>
          <p class="zg-scene-linkage__sub">
            联动规则管理中心 · 在役 {{ activeRuleCount }} 条 ·
            停用 {{ idleRuleCount }} 条 · 累计触发 {{ totalTriggerCount }} 次
          </p>
        </div>
      </div>
      <div class="zg-scene-linkage__cta">
        <el-button type="primary" @click="ruleForm.openComposer()">
          <el-icon><Plus /></el-icon>
          <span>新增</span>
        </el-button>
        <el-button
          v-if="selectedRules.length > 0"
          type="danger"
          @click="onBatchDelete"
        >
          <el-icon><Delete /></el-icon>
          <span>批量删除</span>
        </el-button>
      </div>
    </header>

    <div class="zg-metrics">
      <div class="zg-metrics__cell">
        <span class="zg-metrics__num">{{ ruleCtl.totalRows }}</span>
        <span class="zg-metrics__lbl">规则总数</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--ok">
        <span class="zg-metrics__num">{{ activeRuleCount }}</span>
        <span class="zg-metrics__lbl">在役运行</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--warn">
        <span class="zg-metrics__num">{{ idleRuleCount }}</span>
        <span class="zg-metrics__lbl">停用待启</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--info">
        <span class="zg-metrics__num">{{ highPriorityCount }}</span>
        <span class="zg-metrics__lbl">高优先级</span>
      </div>
    </div>

    <div class="zg-filterband">
      <div class="zg-filterband__density">
        <el-radio-group v-model="viewMode" size="default">
          <el-radio-button value="card">
            <el-icon><Grid /></el-icon>
            <span>卡片模式</span>
          </el-radio-button>
          <el-radio-button value="list">
            <el-icon><List /></el-icon>
            <span>列表模式</span>
          </el-radio-button>
        </el-radio-group>
      </div>
      <div class="zg-filterband__fields">
        <el-input
          v-model="ruleCtl.filterLexicon"
          placeholder="请输入规则名称查询"
          clearable
          class="zg-filterband__search"
          @keyup.enter="ruleCtl.onFilterApply()"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select
          v-model="ruleCtl.statusBuckets"
          placeholder="启用状态"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="启用" value="启用" />
          <el-option label="禁用" value="禁用" />
        </el-select>
        <el-select
          v-model="ruleCtl.typeBucket"
          placeholder="优先级"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="高" value="high" />
          <el-option label="中" value="medium" />
          <el-option label="低" value="low" />
        </el-select>
        <el-button type="primary" @click="ruleCtl.onFilterApply()">
          <el-icon><Search /></el-icon>
          <span>搜索</span>
        </el-button>
        <el-button @click="ruleCtl.onFilterReset()">
          <el-icon><Refresh /></el-icon>
          <span>重置</span>
        </el-button>
      </div>
    </div>

    <div v-if="viewMode === 'card'" class="zg-cardgrid">
      <article
        v-for="rule in ruleCtl.pagedRows"
        :key="rule.id"
        class="zg-rulecard"
        :class="{ 'zg-rulecard--selected': selectedRules.includes(rule.id) }"
      >
        <div class="zg-rulecard__checkbox">
          <el-checkbox
            :checked="selectedRules.includes(rule.id)"
            @change="onToggleSelect(rule.id)"
          />
        </div>
        <div class="zg-rulecard__content">
          <div class="zg-rulecard__head">
            <span class="zg-priority-tag" :class="rule.priority">
              {{ priorityText[rule.priority] }}
            </span>
            <span class="zg-rulecard__name">{{ rule.name }}</span>
            <div class="zg-rulecard__right">
              <el-switch
                v-model="rule.status"
                :active-value="'启用'"
                :inactive-value="'禁用'"
                :active-text="''"
                :inactive-text="''"
                @change="onToggleStatus(rule)"
              />
              <el-dropdown @command="(cmd) => onRuleAction(rule, cmd)">
                <span class="zg-rulecard__more">
                  <el-icon><MoreFilled /></el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="edit">编辑</el-dropdown-item>
                    <el-dropdown-item command="detail">详情</el-dropdown-item>
                    <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
          <div class="zg-rulecard__body">
            <span class="zg-rulecard__execute-date">{{ rule.executeDate }}</span>
          </div>
        </div>
      </article>
    </div>

    <div v-else class="zg-tablewrap">
      <el-table :data="ruleCtl.pagedRows" stripe class="zg-datatable">
        <el-table-column width="50" align="center">
          <template #default="{ row }">
            <el-checkbox
              :checked="selectedRules.includes(row.id)"
              @change="onToggleSelect(row.id)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="no" label="序号" width="60" align="center" />
        <el-table-column prop="name" label="规则名称" min-width="160" />
        <el-table-column label="优先级" width="80" align="center">
          <template #default="{ row }">
            <span class="zg-priority-tag" :class="row.priority">
              {{ priorityText[row.priority] }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="启用状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="'启用'"
              :inactive-value="'禁用'"
              :active-text="'启用'"
              :inactive-text="'禁用'"
              @change="onToggleStatus(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="executeDate" label="执行日期" min-width="140" />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="ruleInspector.openInspector(row)">详情</el-button>
            <el-button size="small" @click="ruleForm.openReviser(row)">修改</el-button>
            <el-button type="danger" size="small" @click="onDeleteRule(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

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

    <el-drawer
      v-model="ruleForm.drawerOpen"
      :title="ruleForm.editMode === 'compose' ? '新增规则' : '编辑规则'"
      direction="rtl"
      size="720px"
    >
      <el-form :model="ruleForm.draftPayload" label-width="96px" class="zg-draftform">
        <el-form-item label="规则名称" required>
          <el-input v-model="ruleForm.draftPayload.name" placeholder="请输入规则名称" />
        </el-form-item>
        <el-form-item label="优先级" required>
          <el-select v-model="ruleForm.draftPayload.priority" placeholder="请选择" style="width: 100%">
            <el-option label="低" value="low" />
            <el-option label="中" value="medium" />
            <el-option label="高" value="high" />
          </el-select>
        </el-form-item>
        <el-form-item label="执行日期" required>
          <el-radio-group v-model="ruleForm.draftPayload.executeMode">
            <el-radio value="一直执行">一直执行</el-radio>
            <el-radio value="定时执行">定时执行</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="ruleForm.draftPayload.executeMode === '定时执行'" label="日期范围">
          <el-date-picker
            v-model="ruleForm.draftPayload.executeDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="触发时间段">
          <el-button type="primary" size="small" @click="openTimeRangeModal">
            <el-icon><Clock /></el-icon>
            <span>设置时间段</span>
          </el-button>
          <div v-if="ruleForm.draftPayload.triggerTimeRanges.length > 0" class="zg-time-range-list">
            <div
              v-for="(range, index) in ruleForm.draftPayload.triggerTimeRanges"
              :key="index"
              class="zg-time-range-item"
            >
              {{ range.start }} - {{ range.end }}
              <el-button type="danger" size="small" @click="removeTimeRange(index)">删除</el-button>
            </div>
          </div>
        </el-form-item>

        <el-tabs v-model="activeFormTab">
          <el-tab-pane label="触发条件" name="trigger">
            <div class="zg-form-section">
              <div class="zg-form-section__head">
                <h4 class="zg-form-section__title">触发条件</h4>
                <el-button type="primary" size="small" @click="addTriggerCondition">
                  <el-icon><Plus /></el-icon>
                  <span>添加条件</span>
                </el-button>
              </div>
              <div
                v-for="(cond, index) in ruleForm.draftPayload.triggerConditions"
                :key="index"
                class="zg-condition-step"
              >
                <div class="zg-condition-step__header">
                  <span class="zg-condition-step__num">{{ index + 1 }}</span>
                  <span class="zg-condition-step__title">触发条件 {{ index + 1 }}</span>
                  <el-button
                    v-if="ruleForm.draftPayload.triggerConditions.length > 1"
                    type="danger"
                    size="small"
                    @click="removeTriggerCondition(index)"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
                <el-form-item label="产品类型" required>
                  <el-select
                    v-model="cond.productType"
                    placeholder="请选择产品类型"
                    style="width: 100%"
                    @change="onTriggerProductTypeChange(index)"
                  >
                    <el-option label="灯控制器" value="灯控制器" />
                    <el-option label="集控" value="集控" />
                    <el-option label="传感器" value="传感器" />
                    <el-option label="摄像头" value="摄像头" />
                    <el-option label="智能主控" value="智能主控" />
                  </el-select>
                </el-form-item>
                <el-form-item label="设备" required>
                  <el-select
                    v-model="cond.device"
                    placeholder="请选择设备"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="dev in getDevicesByType(cond.productType)"
                      :key="dev.id"
                      :label="dev.name"
                      :value="dev.id"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="触发类型" required>
                  <el-select
                    v-model="cond.triggerType"
                    placeholder="请选择触发类型"
                    style="width: 100%"
                  >
                    <el-option label="事件触发" value="事件触发" />
                    <el-option label="属性触发" value="属性触发" />
                  </el-select>
                </el-form-item>
                <el-form-item label="触发条件" required>
                  <el-select
                    v-model="cond.triggerCondition"
                    placeholder="请选择触发条件"
                    style="width: 100%"
                  >
                    <el-option label="信号强度" value="信号强度" />
                    <el-option label="离线告警" value="离线告警" />
                    <el-option label="当日流量超限" value="当日流量超限" />
                    <el-option label="欠压告警" value="欠压告警" />
                    <el-option label="过压告警" value="过压告警" />
                    <el-option label="过流告警" value="过流告警" />
                    <el-option label="低温告警" value="低温告警" />
                    <el-option label="高温告警" value="高温告警" />
                    <el-option label="人体感应" value="人体感应" />
                    <el-option label="光照度低于阈值" value="光照度低于阈值" />
                  </el-select>
                </el-form-item>
                <template v-if="cond.triggerType === '属性触发'">
                  <el-form-item label="对比条件">
                    <el-select
                      v-model="cond.compareCondition"
                      placeholder="请选择对比条件"
                      style="width: 100%"
                    >
                      <el-option label="大于" value="大于" />
                      <el-option label="小于" value="小于" />
                      <el-option label="等于" value="等于" />
                      <el-option label="大于等于" value="大于等于" />
                      <el-option label="小于等于" value="小于等于" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="触发阈值">
                    <el-input v-model="cond.triggerThreshold" placeholder="请输入触发阈值" />
                  </el-form-item>
                </template>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="执行动作" name="action">
            <div class="zg-form-section">
              <div class="zg-form-section__head">
                <h4 class="zg-form-section__title">执行动作</h4>
                <el-button type="primary" size="small" @click="addExecuteAction">
                  <el-icon><Plus /></el-icon>
                  <span>添加动作</span>
                </el-button>
              </div>
              <div
                v-for="(action, index) in ruleForm.draftPayload.executeActions"
                :key="index"
                class="zg-action-step"
              >
                <div class="zg-action-step__header">
                  <span class="zg-action-step__num">{{ index + 1 }}</span>
                  <span class="zg-action-step__title">执行动作 {{ index + 1 }}</span>
                  <el-button
                    v-if="ruleForm.draftPayload.executeActions.length > 1"
                    type="danger"
                    size="small"
                    @click="removeExecuteAction(index)"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
                <el-form-item label="产品类型" required>
                  <el-select
                    v-model="action.productType"
                    placeholder="请选择产品类型"
                    style="width: 100%"
                    @change="onActionProductTypeChange(index)"
                  >
                    <el-option label="灯控制器" value="灯控制器" />
                    <el-option label="集控" value="集控" />
                    <el-option label="传感器" value="传感器" />
                    <el-option label="摄像头" value="摄像头" />
                    <el-option label="智能主控" value="智能主控" />
                  </el-select>
                </el-form-item>
                <el-form-item label="设备" required>
                  <el-select
                    v-model="action.devices"
                    multiple
                    collapse-tags
                    collapse-tags-tooltip
                    placeholder="请选择设备"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="dev in getDevicesByType(action.productType)"
                      :key="dev.id"
                      :label="dev.name"
                      :value="dev.id"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="延时时长" required>
                  <el-input-number
                    v-model="action.delaySeconds"
                    :min="0"
                    :max="3600"
                    style="width: 100%"
                  />
                  <span class="zg-form-item__unit">秒</span>
                </el-form-item>
                <el-form-item label="动作类型" required>
                  <el-select
                    v-model="action.actionType"
                    placeholder="请选择动作类型"
                    style="width: 100%"
                  >
                    <el-option label="开关灯" value="开关灯" />
                    <el-option label="亮度调节" value="亮度调节" />
                  </el-select>
                </el-form-item>
                <el-form-item label="动作内容" required>
                  <el-select
                    v-if="action.actionType === '开关灯'"
                    v-model="action.actionContent"
                    placeholder="请选择动作内容"
                    style="width: 100%"
                  >
                    <el-option label="开启" value="开启" />
                    <el-option label="关闭" value="关闭" />
                  </el-select>
                  <el-input-number
                    v-else
                    v-model="action.actionContent"
                    :min="0"
                    :max="100"
                    style="width: 100%"
                  />
                  <span v-if="action.actionType === '亮度调节'" class="zg-form-item__unit">%</span>
                </el-form-item>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <template #footer>
        <div class="zg-draftform__foot">
          <el-button @click="ruleForm.onDraftDiscard()">取消</el-button>
          <el-button
            type="primary"
            :loading="ruleForm.submitting"
            @click="onCommitRuleDraft"
          >
            {{ ruleForm.editMode === 'compose' ? '保存' : '保存修改' }}
          </el-button>
        </div>
      </template>
    </el-drawer>

    <el-drawer
      v-model="ruleInspector.drawerOpen"
      :title="'规则详情 · ' + (focusedRule?.name || '')"
      direction="rtl"
      size="680px"
    >
      <div v-if="focusedRule" class="zg-inspector">
        <div class="zg-inspector__head">
          <div class="zg-inspector__glyph">
            <el-icon :size="36"><Link /></el-icon>
          </div>
          <div class="zg-inspector__meta">
            <h2 class="zg-inspector__name">{{ focusedRule.name }}</h2>
            <p class="zg-inspector__type">{{ priorityText[focusedRule.priority] }}优先级 · {{ focusedRule.executeDate }}</p>
            <span class="zg-status" :class="focusedRule.status === '启用' ? 'online' : 'offline'">
              <i class="dot"></i>{{ focusedRule.status }}
            </span>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">触发条件</h4>
          <div v-if="focusedRule.triggerConditions && focusedRule.triggerConditions.length > 0">
            <div
              v-for="(cond, index) in focusedRule.triggerConditions"
              :key="index"
              class="zg-inspector__condition-item"
            >
              <span class="zg-inspector__condition-num">{{ index + 1 }}.</span>
              <span>{{ cond.productType }} · {{ getDeviceName(cond.productType, cond.device) }} · {{ cond.triggerType }} · {{ cond.triggerCondition }}</span>
              <span v-if="cond.compareCondition && cond.triggerThreshold">
                · {{ cond.compareCondition }} {{ cond.triggerThreshold }}
              </span>
            </div>
          </div>
          <p v-else class="zg-inspector__empty">-</p>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">执行动作</h4>
          <div v-if="focusedRule.executeActions && focusedRule.executeActions.length > 0">
            <div
              v-for="(action, index) in focusedRule.executeActions"
              :key="index"
              class="zg-inspector__condition-item"
            >
              <span class="zg-inspector__condition-num">{{ index + 1 }}.</span>
              <span>{{ action.productType }} · {{ action.devices.map(id => getDeviceName(action.productType, id)).join(', ') }} · 延时{{ action.delaySeconds }}秒 · {{ action.actionType }} · {{ action.actionContent }}</span>
            </div>
          </div>
          <p v-else class="zg-inspector__empty">-</p>
        </div>

        <div class="zg-inspector__actions">
          <el-button size="large" @click="ruleInspector.closeInspector()">关闭</el-button>
          <el-button type="primary" size="large" @click="ruleForm.openReviser(focusedRule)">修改</el-button>
        </div>
      </div>
    </el-drawer>

    <el-dialog v-model="timeRangeModalVisible" title="设置触发时间段" width="480px">
      <div class="zg-time-range-form">
        <div v-for="(range, index) in timeRangeFormData" :key="index" class="zg-time-range-row">
          <el-time-picker
            v-model="range.start"
            format="HH:mm:ss"
            value-format="HH:mm:ss"
            placeholder="开始时间"
            style="width: 140px"
          />
          <span class="zg-time-range-separator">-</span>
          <el-time-picker
            v-model="range.end"
            format="HH:mm:ss"
            value-format="HH:mm:ss"
            placeholder="结束时间"
            style="width: 140px"
          />
          <el-button
            v-if="timeRangeFormData.length > 1"
            type="danger"
            size="small"
            @click="removeTimeRangeForm(index)"
          >
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
        <el-button type="primary" size="small" @click="addTimeRangeForm" style="margin-top: 12px">
          <el-icon><Plus /></el-icon>
          <span>添加时间段</span>
        </el-button>
      </div>
      <template #footer>
        <el-button @click="timeRangeModalVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTimeRange">确定</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Link,
  Plus,
  Grid,
  List,
  Search,
  Refresh,
  Delete,
  MoreFilled,
  Clock
} from '@element-plus/icons-vue'
import { usePresetTable } from '@/shared/composables/usePresetTable'
import { useFormDraft } from '@/shared/composables/useFormDraft'
import { useDrawerInspector } from '@/shared/composables/useDrawerInspector'

const viewMode = ref('card')
const activeFormTab = ref('trigger')
const selectedRules = ref([])
const timeRangeModalVisible = ref(false)
const timeRangeFormData = ref([{ start: '', end: '' }])

const priorityText = {
  high: '高',
  medium: '中',
  low: '低'
}

const deviceData = {
  '灯控制器': [
    { id: 'lc-001', name: '灯控器-A1' },
    { id: 'lc-002', name: '灯控器-A2' },
    { id: 'lc-003', name: '灯控器-B1' },
    { id: 'lc-004', name: '灯控器-B2' }
  ],
  '集控': [
    { id: 'cc-001', name: '集控中心-主站' },
    { id: 'cc-002', name: '集控中心-分站' }
  ],
  '传感器': [
    { id: 'sen-001', name: '温湿度传感器-1' },
    { id: 'sen-002', name: '光照传感器-1' },
    { id: 'sen-003', name: '人体感应传感器-1' }
  ],
  '摄像头': [
    { id: 'cam-001', name: '摄像头-东门' },
    { id: 'cam-002', name: '摄像头-西门' }
  ],
  '智能主控': [
    { id: 'mc-001', name: '智能主控-区域1' },
    { id: 'mc-002', name: '智能主控-区域2' }
  ]
}

const initialRules = [
  {
    id: 1,
    no: 1,
    name: '检测有人开灯',
    priority: 'high',
    status: '启用',
    executeMode: '一直执行',
    executeDate: '一直执行',
    triggerTimeRanges: [{ start: '00:00:00', end: '23:59:59' }],
    triggerConditions: [
      { productType: '传感器', device: 'sen-003', triggerType: '事件触发', triggerCondition: '人体感应' }
    ],
    executeActions: [
      { productType: '灯控制器', devices: ['lc-001', 'lc-002'], delaySeconds: 0, actionType: '开关灯', actionContent: '开启' }
    ]
  },
  {
    id: 2,
    no: 2,
    name: '光照度自动亮灯',
    priority: 'high',
    status: '启用',
    executeMode: '一直执行',
    executeDate: '一直执行',
    triggerTimeRanges: [{ start: '06:00:00', end: '18:00:00' }],
    triggerConditions: [
      { productType: '传感器', device: 'sen-002', triggerType: '属性触发', triggerCondition: '光照度低于阈值', compareCondition: '小于', triggerThreshold: '20' }
    ],
    executeActions: [
      { productType: '灯控制器', devices: ['lc-001', 'lc-002', 'lc-003'], delaySeconds: 0, actionType: '开关灯', actionContent: '开启' }
    ]
  },
  {
    id: 3,
    no: 3,
    name: '检测无人关灯',
    priority: 'medium',
    status: '启用',
    executeMode: '一直执行',
    executeDate: '一直执行',
    triggerTimeRanges: [{ start: '00:00:00', end: '23:59:59' }],
    triggerConditions: [
      { productType: '传感器', device: 'sen-003', triggerType: '事件触发', triggerCondition: '人体感应' }
    ],
    executeActions: [
      { productType: '灯控制器', devices: ['lc-001', 'lc-002'], delaySeconds: 600, actionType: '开关灯', actionContent: '关闭' }
    ]
  },
  {
    id: 4,
    no: 4,
    name: '夜间节能模式',
    priority: 'low',
    status: '禁用',
    executeMode: '定时执行',
    executeDate: '2026-07-08 ~ 2026-07-13',
    triggerTimeRanges: [{ start: '22:00:00', end: '06:00:00' }],
    triggerConditions: [
      { productType: '传感器', device: 'sen-002', triggerType: '属性触发', triggerCondition: '光照度低于阈值', compareCondition: '小于', triggerThreshold: '10' }
    ],
    executeActions: [
      { productType: '灯控制器', devices: ['lc-001', 'lc-002', 'lc-003', 'lc-004'], delaySeconds: 0, actionType: '亮度调节', actionContent: 30 }
    ]
  }
]

const ruleCtl = usePresetTable(null, {
  defaultPageSpan: 15,
  initialData: initialRules
})

const ruleForm = useFormDraft(
  {
    name: '',
    priority: 'low',
    executeMode: '一直执行',
    executeDate: '一直执行',
    executeDateRange: [],
    triggerTimeRanges: [],
    triggerConditions: [{
      productType: '',
      device: '',
      triggerType: '',
      triggerCondition: '',
      compareCondition: '',
      triggerThreshold: ''
    }],
    executeActions: [{
      productType: '',
      devices: [],
      delaySeconds: 0,
      actionType: '',
      actionContent: ''
    }]
  },
  {
    submitApi: async (draft, { mode, origin }) => {
      const executeDate = draft.executeMode === '一直执行'
        ? '一直执行'
        : `${draft.executeDateRange[0]} ~ ${draft.executeDateRange[1]}`

      if (mode === 'compose') {
        const newRule = {
          ...draft,
          id: Date.now(),
          no: ruleCtl.totalRows + 1,
          status: '启用',
          executeDate: executeDate
        }
        ruleCtl.appendRecord(newRule)
        ElMessage.success('规则已创建')
      } else if (origin && origin.id) {
        ruleCtl.reviseRecord(origin.id, { ...draft, executeDate })
        ElMessage.success('规则已更新')
      }
      return { ok: true }
    },
    validateFn: (draft) => {
      if (!draft.name) {
        ElMessage.warning('请填写规则名称')
        return false
      }
      const validCondition = draft.triggerConditions.some(
        c => c.productType && c.device && c.triggerType && c.triggerCondition
      )
      if (!validCondition) {
        ElMessage.warning('请至少配置一个有效的触发条件')
        return false
      }
      const validAction = draft.executeActions.some(
        a => a.productType && a.devices.length > 0 && a.actionType && a.actionContent
      )
      if (!validAction) {
        ElMessage.warning('请至少配置一个有效的执行动作')
        return false
      }
      return true
    }
  }
)

const ruleInspector = useDrawerInspector({ size: '680px', direction: 'rtl' })
const focusedRule = computed(() => ruleInspector.focusedRecord)

const activeRuleCount = computed(
  () => ruleCtl.presetPlaybook.filter(r => r.status === '启用').length
)
const idleRuleCount = computed(
  () => ruleCtl.presetPlaybook.filter(r => r.status === '禁用').length
)
const highPriorityCount = computed(
  () => ruleCtl.presetPlaybook.filter(r => r.priority === 'high').length
)
const totalTriggerCount = computed(
  () => ruleCtl.presetPlaybook.reduce((sum, r) => sum + (r.triggerCount || 0), 0)
)

const getDevicesByType = (productType) => {
  return deviceData[productType] || []
}

const getDeviceName = (productType, deviceId) => {
  const devices = deviceData[productType] || []
  const device = devices.find(d => d.id === deviceId)
  return device?.name || deviceId
}

const onToggleSelect = (id) => {
  const index = selectedRules.value.indexOf(id)
  if (index > -1) {
    selectedRules.value.splice(index, 1)
  } else {
    selectedRules.value.push(id)
  }
}

const onToggleStatus = (rule) => {
  ElMessage.success(`规则"${rule.name}"已${rule.status === '启用' ? '启用' : '禁用'}`)
}

const onRuleAction = (rule, action) => {
  switch (action) {
    case 'edit':
      ruleForm.openReviser(rule)
      break
    case 'detail':
      ruleInspector.openInspector(rule)
      break
    case 'delete':
      onDeleteRule(rule)
      break
  }
}

const onDeleteRule = (rule) => {
  ElMessageBox.confirm(`确认删除规则"${rule.name}"吗？`, '删除确认', { type: 'warning' })
    .then(() => {
      ruleCtl.retireRecord(rule.id)
      selectedRules.value = selectedRules.value.filter(id => id !== rule.id)
      ElMessage.success('规则已删除')
    })
}

const onBatchDelete = () => {
  ElMessageBox.confirm(`确认删除选中的${selectedRules.value.length}条规则吗？`, '批量删除确认', { type: 'warning' })
    .then(() => {
      selectedRules.value.forEach(id => ruleCtl.retireRecord(id))
      selectedRules.value = []
      ElMessage.success('规则已批量删除')
    })
}

const addTriggerCondition = () => {
  ruleForm.draftPayload.triggerConditions.push({
    productType: '',
    device: '',
    triggerType: '',
    triggerCondition: '',
    compareCondition: '',
    triggerThreshold: ''
  })
}

const removeTriggerCondition = (index) => {
  ruleForm.draftPayload.triggerConditions.splice(index, 1)
}

const onTriggerProductTypeChange = (index) => {
  ruleForm.draftPayload.triggerConditions[index].device = ''
}

const addExecuteAction = () => {
  ruleForm.draftPayload.executeActions.push({
    productType: '',
    devices: [],
    delaySeconds: 0,
    actionType: '',
    actionContent: ''
  })
}

const removeExecuteAction = (index) => {
  ruleForm.draftPayload.executeActions.splice(index, 1)
}

const onActionProductTypeChange = (index) => {
  ruleForm.draftPayload.executeActions[index].devices = []
}

const openTimeRangeModal = () => {
  timeRangeFormData.value = ruleForm.draftPayload.triggerTimeRanges.length > 0
    ? JSON.parse(JSON.stringify(ruleForm.draftPayload.triggerTimeRanges))
    : [{ start: '', end: '' }]
  timeRangeModalVisible.value = true
}

const addTimeRangeForm = () => {
  timeRangeFormData.value.push({ start: '', end: '' })
}

const removeTimeRangeForm = (index) => {
  timeRangeFormData.value.splice(index, 1)
}

const saveTimeRange = () => {
  const validRanges = timeRangeFormData.value.filter(r => r.start && r.end)
  ruleForm.draftPayload.triggerTimeRanges = validRanges
  timeRangeModalVisible.value = false
  ElMessage.success('触发时间段已设置')
}

const onCommitRuleDraft = async () => {
  await ruleForm.onDraftCommit()
}

watch(() => ruleForm.draftPayload.executeMode, (mode) => {
  if (mode === '一直执行') {
    ruleForm.draftPayload.executeDate = '一直执行'
    ruleForm.draftPayload.executeDateRange = []
  }
})
</script>

<style scoped lang="scss">
.zg-scene-linkage {
  padding: 20px 24px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 100%;
  background: linear-gradient(180deg, #f0fdfa 0%, #ecfeff 100%);

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background: var(--zg-surface-card);
    border-radius: var(--zg-radius-lg);
    border: 1px solid var(--zg-line-brand);
  }

  &__sigil {
    width: 40px;
    height: 40px;
    border-radius: var(--zg-radius-md);
    background: var(--zg-gradient-primary);
    color: #fff;
    display: grid;
    place-items: center;
  }

  &__title {
    font-size: 18px;
    font-weight: 600;
    color: var(--zg-ink-primary);
    margin: 0 0 4px;
  }

  &__sub {
    font-size: 13px;
    color: var(--zg-ink-tertiary);
    margin: 0;
  }

  &__cta {
    display: flex;
    gap: 8px;
  }
}

.zg-metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;

  &__cell {
    background: var(--zg-surface-card);
    border-radius: var(--zg-radius-lg);
    padding: 16px;
    text-align: center;
    border: 1px solid var(--zg-line-soft);

    &--ok {
      border-color: var(--zg-brand-success);
    }

    &--warn {
      border-color: var(--zg-brand-warning);
    }

    &--info {
      border-color: var(--zg-brand-info);
    }
  }

  &__num {
    display: block;
    font-size: 24px;
    font-weight: 700;
    color: var(--zg-ink-primary);
    margin-bottom: 4px;
  }

  &__lbl {
    font-size: 13px;
    color: var(--zg-ink-tertiary);
  }
}

.zg-filterband {
  background: var(--zg-surface-card);
  padding: 14px 18px;
  border-radius: var(--zg-radius-lg);
  border: 1px solid var(--zg-line-soft);
  display: flex;
  justify-content: space-between;
  align-items: center;

  &__density {
    display: flex;
    gap: 8px;
  }

  &__fields {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  &__search {
    width: 220px;
  }

  &__select {
    width: 140px;
  }
}

.zg-cardgrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
  padding: 8px 0;
}

.zg-rulecard {
  background: var(--zg-surface-card);
  border-radius: var(--zg-radius-lg);
  border: 1px solid var(--zg-line-soft);
  padding: 16px;
  display: flex;
  gap: 12px;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--zg-brand-primary);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  }

  &--selected {
    border-color: var(--zg-brand-primary);
    background: rgba(59, 130, 246, 0.05);
  }

  &__checkbox {
    display: flex;
    align-items: flex-start;
    padding-top: 2px;
  }

  &__content {
    flex: 1;
  }

  &__head {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__name {
    font-size: 15px;
    font-weight: 600;
    color: var(--zg-ink-primary);
    flex: 1;
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__more {
    cursor: pointer;
    color: var(--zg-ink-tertiary);
    font-size: 16px;
  }

  &__body {
    margin-top: 8px;
  }

  &__execute-date {
    font-size: 13px;
    color: var(--zg-ink-tertiary);
  }
}

.zg-priority-tag {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;

  &.high {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
  }

  &.medium {
    background: rgba(249, 115, 22, 0.1);
    color: #f97316;
  }

  &.low {
    background: rgba(107, 114, 128, 0.1);
    color: #6b7280;
  }
}

.zg-tablewrap {
  background: var(--zg-surface-card);
  border-radius: var(--zg-radius-lg);
  border: 1px solid var(--zg-line-soft);
  overflow: hidden;
}

.zg-datatable {
  width: 100%;

  :deep(.el-table__header-wrapper) {
    background: var(--zg-surface-elevated);
  }

  :deep(.el-table th) {
    background: var(--zg-surface-elevated);
    font-weight: 600;
    color: var(--zg-ink-secondary);
  }
}

.zg-pagerbar {
  display: flex;
  justify-content: flex-end;
  padding: 16px;
  background: var(--zg-surface-card);
  border-radius: var(--zg-radius-lg);
  border: 1px solid var(--zg-line-soft);
  margin-top: 8px;
}

.zg-draftform {
  padding: 8px 0;

  &__foot {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}

.zg-form-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed var(--zg-line-soft);

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  &__title {
    font-size: 14px;
    font-weight: 600;
    color: var(--zg-ink-primary);
    margin: 0;
  }
}

.zg-condition-step,
.zg-action-step {
  background: var(--zg-surface-elevated);
  border-radius: var(--zg-radius-md);
  padding: 12px;
  margin-bottom: 12px;

  &__header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }

  &__num {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--zg-brand-primary);
    color: #fff;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__title {
    font-size: 13px;
    font-weight: 500;
    color: var(--zg-ink-primary);
    flex: 1;
  }
}

.zg-form-item__unit {
  margin-left: 8px;
  font-size: 13px;
  color: var(--zg-ink-tertiary);
}

.zg-time-range-list {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.zg-time-range-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--zg-ink-secondary);
}

.zg-time-range-form {
  padding: 8px 0;
}

.zg-time-range-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.zg-time-range-separator {
  color: var(--zg-ink-tertiary);
}

.zg-inspector {
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__head {
    display: flex;
    gap: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--zg-line-soft);
  }

  &__glyph {
    color: var(--zg-brand-primary);
  }

  &__meta {
    flex: 1;
  }

  &__name {
    font-size: 18px;
    font-weight: 600;
    color: var(--zg-ink-primary);
    margin: 0 0 4px;
  }

  &__type {
    font-size: 13px;
    color: var(--zg-ink-tertiary);
    margin: 0;
  }

  &__section {
    &-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--zg-ink-primary);
      margin: 0 0 12px;
    }
  }

  &__condition-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-size: 13px;
    color: var(--zg-ink-secondary);
    margin-bottom: 8px;
    padding: 8px;
    background: var(--zg-surface-elevated);
    border-radius: var(--zg-radius-sm);
  }

  &__condition-num {
    font-weight: 600;
    color: var(--zg-brand-primary);
  }

  &__empty {
    font-size: 13px;
    color: var(--zg-ink-tertiary);
    text-align: center;
    padding: 16px;
    background: var(--zg-surface-elevated);
    border-radius: var(--zg-radius-sm);
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding-top: 16px;
    border-top: 1px solid var(--zg-line-soft);
    margin-top: auto;
  }
}

.zg-status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;

  &.online {
    background: rgba(34, 197, 94, 0.1);
    color: #22c55e;

    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #22c55e;
    }
  }

  &.offline {
    background: rgba(107, 114, 128, 0.1);
    color: #6b7280;

    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #6b7280;
    }
  }
}
</style>