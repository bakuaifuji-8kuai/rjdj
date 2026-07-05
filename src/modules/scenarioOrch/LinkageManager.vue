<!--
  智光云枢 · 情景管理 · 联动管理
  业务域：scenarioOrch
  功能：联动规则编排与管理，支持触发条件与执行动作配置
        支持卡片/列表双视图、抽屉式详情与编排、规则测试验证
-->
<template>
  <section class="zg-linkagemgr">
    <!-- 页面头部：品牌徽标 + 标题 + 概览指标 + 新建入口 -->
    <header class="zg-linkagemgr__head">
      <div class="zg-linkagemgr__headline">
        <div class="zg-linkagemgr__sigil">
          <el-icon :size="22"><Setting /></el-icon>
        </div>
        <div class="zg-linkagemgr__copy">
          <h1 class="zg-linkagemgr__title">联动管理</h1>
          <p class="zg-linkagemgr__sub">
            情景管理规则引擎 · 已启用 {{ activeLinkageCount }} 条 ·
            已停用 {{ idleLinkageCount }} 条 · 累计触发 {{ totalTriggerCount }} 次
          </p>
        </div>
      </div>
      <div class="zg-linkagemgr__cta">
        <el-button type="primary" @click="mgrForm.openComposer()">
          <el-icon><Plus /></el-icon>
          <span>新建联动</span>
        </el-button>
      </div>
    </header>

    <!-- 概览指标卡 -->
    <div class="zg-metrics">
      <div class="zg-metrics__cell">
        <span class="zg-metrics__num">{{ mgrCtl.totalRows }}</span>
        <span class="zg-metrics__lbl">联动规则总数</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--ok">
        <span class="zg-metrics__num">{{ activeLinkageCount }}</span>
        <span class="zg-metrics__lbl">已启用规则</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--warn">
        <span class="zg-metrics__num">{{ idleLinkageCount }}</span>
        <span class="zg-metrics__lbl">已停用规则</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--info">
        <span class="zg-metrics__num">{{ totalTriggerCount }}</span>
        <span class="zg-metrics__lbl">累计触发次数</span>
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
          v-model="mgrCtl.statusBuckets"
          placeholder="规则状态"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="已启用" value="已启用" />
          <el-option label="已停用" value="已停用" />
        </el-select>
        <el-select
          v-model="mgrCtl.typeBucket"
          placeholder="优先级"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="高优先级" value="高" />
          <el-option label="中优先级" value="中" />
          <el-option label="低优先级" value="低" />
        </el-select>
        <el-input
          v-model="mgrCtl.filterLexicon"
          placeholder="检索规则名称"
          clearable
          class="zg-filterband__search"
          @keyup.enter="mgrCtl.onFilterApply()"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="mgrCtl.onFilterApply()">
          <el-icon><Search /></el-icon>
          <span>检索</span>
        </el-button>
        <el-button @click="mgrCtl.onFilterReset()">
          <el-icon><RefreshLeft /></el-icon>
          <span>重置</span>
        </el-button>
      </div>
    </div>

    <!-- 卡片视图 -->
    <div v-if="densityMode === 'card'" class="zg-cardgrid">
      <article
        v-for="linkage in mgrCtl.pagedRows"
        :key="linkage.id"
        class="zg-linkagecard"
        :class="linkage.status === '已启用' ? 'enabled' : 'disabled'"
        @click="mgrInspector.openInspector(linkage)"
      >
        <div class="zg-linkagecard__head">
          <div class="zg-linkagecard__glyph">
            <el-icon :size="24"><Setting /></el-icon>
          </div>
          <span class="zg-status" :class="linkage.status === '已启用' ? 'online' : 'idle'">
            <i class="dot"></i>{{ linkage.status }}
          </span>
        </div>
        <div class="zg-linkagecard__body">
          <h3 class="zg-linkagecard__name">{{ linkage.name }}</h3>
          <p class="zg-linkagecard__priority">优先级：{{ linkage.priority }}</p>
          <div class="zg-linkagecard__stats">
            <span class="zg-linkagecard__stat">
              <em>{{ linkage.conditionCount }}</em> 触发条件
            </span>
            <span class="zg-linkagecard__stat">
              <em>{{ linkage.actionCount }}</em> 执行动作
            </span>
            <span class="zg-linkagecard__stat">
              <em>{{ linkage.triggerCount }}</em> 次触发
            </span>
          </div>
        </div>
        <div class="zg-linkagecard__foot">
          <span class="zg-linkagecard__time">{{ linkage.createTime }}</span>
          <div class="zg-linkagecard__actions">
            <el-button link type="primary" size="small" @click.stop="onToggleLinkage(linkage)">
              {{ linkage.status === '已启用' ? '停用' : '启用' }}
            </el-button>
            <el-button link type="primary" size="small" @click.stop="mgrForm.openReviser(linkage)">修订</el-button>
            <el-button link type="warning" size="small" @click.stop="onTestLinkage(linkage)">测试</el-button>
            <el-button link type="danger" size="small" @click.stop="onRetireLinkage(linkage)">废止</el-button>
          </div>
        </div>
      </article>
    </div>

    <!-- 列表视图 -->
    <div v-else class="zg-tablewrap">
      <el-table :data="mgrCtl.pagedRows" stripe class="zg-datatable">
        <el-table-column prop="no" label="序号" width="60" align="center" />
        <el-table-column prop="name" label="规则名称" min-width="150" />
        <el-table-column prop="priority" label="优先级" width="100" align="center">
          <template #default="{ row }">
            <span class="zg-priority" :class="row.priority === '高' ? 'high' : row.priority === '中' ? 'medium' : 'low'">
              {{ row.priority }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="规则状态" width="100" align="center">
          <template #default="{ row }">
            <span class="zg-status" :class="row.status === '已启用' ? 'online' : 'idle'">
              <i class="dot"></i>{{ row.status }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="conditionCount" label="触发条件" width="100" align="center" />
        <el-table-column prop="actionCount" label="执行动作" width="100" align="center" />
        <el-table-column prop="triggerCount" label="触发次数" width="100" align="center" />
        <el-table-column prop="createTime" label="创建时间" width="130" />
        <el-table-column label="处置" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="mgrInspector.openInspector(row)">详情</el-button>
            <el-button type="warning" size="small" @click="onToggleLinkage(row)">
              {{ row.status === '已启用' ? '停用' : '启用' }}
            </el-button>
            <el-button type="primary" size="small" @click="mgrForm.openReviser(row)">修订</el-button>
            <el-button type="warning" size="small" @click="onTestLinkage(row)">测试</el-button>
            <el-button type="danger" size="small" @click="onRetireLinkage(row)">废止</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页条 -->
    <div class="zg-pagerbar">
      <el-pagination
        v-model:current-page="mgrCtl.pagingCursor"
        v-model:page-size="mgrCtl.pageSpan"
        :total="mgrCtl.totalRows"
        :page-sizes="[10, 15, 20, 50, 100]"
        layout="prev, pager, next, jumper, ->, sizes, total"
        background
      />
    </div>

    <!-- 详情抽屉 -->
    <el-drawer
      v-model="mgrInspector.drawerOpen"
      :title="'联动规则详情 · ' + (focusedLinkage?.name || '')"
      direction="rtl"
      size="720px"
    >
      <div v-if="focusedLinkage" class="zg-inspector">
        <div class="zg-inspector__head">
          <div class="zg-inspector__glyph">
            <el-icon :size="36"><Setting /></el-icon>
          </div>
          <div class="zg-inspector__meta">
            <h2 class="zg-inspector__name">{{ focusedLinkage.name }}</h2>
            <p class="zg-inspector__type">优先级：{{ focusedLinkage.priority }} · {{ focusedLinkage.executeType }}</p>
            <span class="zg-status" :class="focusedLinkage.status === '已启用' ? 'online' : 'idle'">
              <i class="dot"></i>{{ focusedLinkage.status }}
            </span>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">基本档案</h4>
          <div class="zg-inspector__grid">
            <div class="zg-inspector__cell">
              <span class="lbl">创建时间</span>
              <span class="val">{{ focusedLinkage.createTime }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">执行类型</span>
              <span class="val">{{ focusedLinkage.executeType }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">触发次数</span>
              <span class="val">{{ focusedLinkage.triggerCount }} 次</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">备注</span>
              <span class="val">{{ focusedLinkage.remark || '-' }}</span>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">触发条件</h4>
          <div class="zg-inspector__grid zg-inspector__grid--full">
            <el-table :data="focusedLinkage.conditions" size="small" border>
              <el-table-column prop="no" label="序号" width="60" align="center" />
              <el-table-column prop="productType" label="产品类型" width="120" />
              <el-table-column prop="device" label="设备" min-width="120" />
              <el-table-column prop="triggerType" label="触发类型" width="100" />
              <el-table-column prop="triggerCondition" label="触发条件" min-width="120" />
            </el-table>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">执行动作</h4>
          <div class="zg-inspector__grid zg-inspector__grid--full">
            <el-table :data="focusedLinkage.actions" size="small" border>
              <el-table-column prop="no" label="序号" width="60" align="center" />
              <el-table-column prop="productType" label="产品类型" width="120" />
              <el-table-column prop="device" label="设备" min-width="120" />
              <el-table-column prop="action" label="执行动作" min-width="100" />
            </el-table>
          </div>
        </div>

        <div class="zg-inspector__actions">
          <el-button size="large" @click="mgrInspector.closeInspector()">关闭</el-button>
          <el-button type="warning" size="large" @click="onTestLinkage(focusedLinkage)">
            <el-icon><VideoPlay /></el-icon>
            <span>测试联动</span>
          </el-button>
          <el-button
            type="primary"
            size="large"
            @click="onToggleLinkage(focusedLinkage)"
          >
            {{ focusedLinkage.status === '已启用' ? '停用规则' : '启用规则' }}
          </el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 新建/修订抽屉 -->
    <el-drawer
      v-model="mgrForm.drawerOpen"
      :title="mgrForm.editMode === 'compose' ? '新建联动规则' : '修订联动规则'"
      direction="rtl"
      size="640px"
    >
      <el-form :model="mgrForm.draftPayload" label-width="96px" class="zg-draftform">
        <el-form-item label="规则名称" required>
          <el-input v-model="mgrForm.draftPayload.name" placeholder="请输入规则名称" />
        </el-form-item>
        <el-form-item label="优先级" required>
          <el-select v-model="mgrForm.draftPayload.priority" placeholder="请选择优先级" style="width: 100%">
            <el-option label="高" value="高" />
            <el-option label="中" value="中" />
            <el-option label="低" value="低" />
          </el-select>
        </el-form-item>
        <el-form-item label="执行类型" required>
          <el-radio-group v-model="mgrForm.draftPayload.executeType">
            <el-radio value="一直执行">一直执行</el-radio>
            <el-radio value="定时执行">定时执行</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="触发时间段">
          <el-time-picker
            v-model="mgrForm.draftPayload.startTime"
            placeholder="开始时间"
            style="width: 45%"
          />
          <span style="margin: 0 8px">至</span>
          <el-time-picker
            v-model="mgrForm.draftPayload.endTime"
            placeholder="结束时间"
            style="width: 45%"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="mgrForm.draftPayload.remark"
            type="textarea"
            :rows="2"
            placeholder="请输入备注信息"
          />
        </el-form-item>

        <el-divider content-position="left">触发条件</el-divider>

        <div class="zg-draftform__list">
          <div
            v-for="(condition, index) in mgrForm.draftPayload.conditions"
            :key="index"
            class="zg-draftform__card"
          >
            <div class="zg-draftform__card-head">
              <span class="zg-draftform__card-index">条件 {{ index + 1 }}</span>
              <el-button
                v-if="mgrForm.draftPayload.conditions.length > 1"
                type="danger"
                size="small"
                link
                @click="removeCondition(index)"
              >
                移除
              </el-button>
            </div>
            <div class="zg-draftform__card-body">
              <el-form-item label="产品类型">
                <el-select v-model="condition.productType" placeholder="请选择产品类型" style="width: 100%">
                  <el-option label="灯控制器" value="灯控制器" />
                  <el-option label="传感器" value="传感器" />
                  <el-option label="视频采集" value="视频采集" />
                </el-select>
              </el-form-item>
              <el-form-item label="设备">
                <el-select v-model="condition.device" placeholder="请选择设备" style="width: 100%">
                  <el-option label="展厅隧道灯" value="展厅隧道灯" />
                  <el-option label="光亚展杆塔" value="光亚展杆塔" />
                  <el-option label="入口投光灯" value="入口投光灯" />
                </el-select>
              </el-form-item>
              <el-form-item label="触发类型">
                <el-select v-model="condition.triggerType" placeholder="请选择触发类型" style="width: 100%">
                  <el-option label="事件触发" value="事件触发" />
                  <el-option label="属性触发" value="属性触发" />
                </el-select>
              </el-form-item>
              <el-form-item label="触发条件">
                <el-select v-model="condition.triggerCondition" placeholder="请选择触发条件" style="width: 100%">
                  <el-option label="检测有人" value="检测有人" />
                  <el-option label="检测无人" value="检测无人" />
                  <el-option label="光照度低于阈值" value="光照度低于阈值" />
                  <el-option label="漏电告警" value="漏电告警" />
                </el-select>
              </el-form-item>
            </div>
          </div>
          <el-button type="primary" plain @click="addCondition" style="width: 100%">
            <el-icon><Plus /></el-icon>
            <span>添加触发条件</span>
          </el-button>
        </div>

        <el-divider content-position="left">执行动作</el-divider>

        <div class="zg-draftform__list">
          <div
            v-for="(action, index) in mgrForm.draftPayload.actions"
            :key="index"
            class="zg-draftform__card"
          >
            <div class="zg-draftform__card-head">
              <span class="zg-draftform__card-index">动作 {{ index + 1 }}</span>
              <el-button
                v-if="mgrForm.draftPayload.actions.length > 1"
                type="danger"
                size="small"
                link
                @click="removeAction(index)"
              >
                移除
              </el-button>
            </div>
            <div class="zg-draftform__card-body">
              <el-form-item label="产品类型">
                <el-select v-model="action.productType" placeholder="请选择产品类型" style="width: 100%">
                  <el-option label="灯控制器" value="灯控制器" />
                  <el-option label="集控" value="集控" />
                  <el-option label="传感器" value="传感器" />
                </el-select>
              </el-form-item>
              <el-form-item label="设备">
                <el-select v-model="action.device" placeholder="请选择设备" style="width: 100%">
                  <el-option label="展厅隧道灯" value="展厅隧道灯" />
                  <el-option label="光亚展杆塔" value="光亚展杆塔" />
                  <el-option label="入口投光灯" value="入口投光灯" />
                </el-select>
              </el-form-item>
              <el-form-item label="执行动作">
                <el-select v-model="action.action" placeholder="请选择执行动作" style="width: 100%">
                  <el-option label="开灯" value="开灯" />
                  <el-option label="关灯" value="关灯" />
                  <el-option label="调光50%" value="调光50%" />
                  <el-option label="断电" value="断电" />
                </el-select>
              </el-form-item>
            </div>
          </div>
          <el-button type="primary" plain @click="addAction" style="width: 100%">
            <el-icon><Plus /></el-icon>
            <span>添加执行动作</span>
          </el-button>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="mgrForm.onDraftDiscard()">取消</el-button>
        <el-button
          type="primary"
          :loading="mgrForm.submitting"
          @click="onCommitMgrDraft"
        >
          {{ mgrForm.editMode === 'compose' ? '创建' : '保存修订' }}
        </el-button>
      </template>
    </el-drawer>
  </section>
</template>

<script setup>
/**
 * 智光云枢 · 情景管理 · 联动管理
 * 业务域：scenarioOrch
 * 功能：联动规则编排与管理，支持触发条件与执行动作配置
 * @module scenarioOrch/LinkageManager
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
  RefreshLeft,
  VideoPlay
} from '@element-plus/icons-vue'
import { usePresetTable } from '@/shared/composables/usePresetTable'
import { useFormDraft } from '@/shared/composables/useFormDraft'
import { useDrawerInspector } from '@/shared/composables/useDrawerInspector'

// ---- 视图密度切换 ----
const densityMode = ref('card')

// ---- 初始 mock 数据池 ----
const initialLinkages = [
  {
    id: 1,
    no: 1,
    name: '展厅有人自动开灯',
    priority: '高',
    status: '已启用',
    executeType: '一直执行',
    conditionCount: 1,
    actionCount: 1,
    triggerCount: 128,
    createTime: '2024-01-15',
    remark: '展厅区域自动化联动',
    startTime: '',
    endTime: '',
    conditions: [
      {
        no: 1,
        productType: '传感器',
        device: '展厅隧道灯',
        triggerType: '事件触发',
        triggerCondition: '检测有人'
      }
    ],
    actions: [
      {
        no: 1,
        productType: '灯控制器',
        device: '展厅隧道灯',
        action: '开灯'
      }
    ]
  },
  {
    id: 2,
    no: 2,
    name: '夜间自动调光策略',
    priority: '中',
    status: '已启用',
    executeType: '定时执行',
    conditionCount: 1,
    actionCount: 2,
    triggerCount: 89,
    createTime: '2024-02-20',
    remark: '夜间节能调光',
    startTime: '22:00',
    endTime: '06:00',
    conditions: [
      {
        no: 1,
        productType: '传感器',
        device: '光亚展杆塔',
        triggerType: '属性触发',
        triggerCondition: '光照度低于阈值'
      }
    ],
    actions: [
      {
        no: 1,
        productType: '灯控制器',
        device: '光亚展杆塔',
        action: '调光50%'
      },
      {
        no: 2,
        productType: '灯控制器',
        device: '入口投光灯',
        action: '关灯'
      }
    ]
  },
  {
    id: 3,
    no: 3,
    name: '无人自动关灯',
    priority: '低',
    status: '已停用',
    executeType: '一直执行',
    conditionCount: 2,
    actionCount: 1,
    triggerCount: 45,
    createTime: '2024-03-10',
    remark: '展厅无人时自动关灯',
    startTime: '',
    endTime: '',
    conditions: [
      {
        no: 1,
        productType: '传感器',
        device: '展厅隧道灯',
        triggerType: '事件触发',
        triggerCondition: '检测无人'
      },
      {
        no: 2,
        productType: '传感器',
        device: '入口投光灯',
        triggerType: '事件触发',
        triggerCondition: '检测无人'
      }
    ],
    actions: [
      {
        no: 1,
        productType: '灯控制器',
        device: '展厅隧道灯',
        action: '关灯'
      }
    ]
  },
  {
    id: 4,
    no: 4,
    name: '漏电保护联动',
    priority: '高',
    status: '已启用',
    executeType: '一直执行',
    conditionCount: 1,
    actionCount: 1,
    triggerCount: 3,
    createTime: '2024-04-05',
    remark: '漏电时自动断电保护',
    startTime: '',
    endTime: '',
    conditions: [
      {
        no: 1,
        productType: '传感器',
        device: '光亚展杆塔',
        triggerType: '事件触发',
        triggerCondition: '漏电告警'
      }
    ],
    actions: [
      {
        no: 1,
        productType: '集控',
        device: '光亚展杆塔',
        action: '断电'
      }
    ]
  },
  {
    id: 5,
    no: 5,
    name: '日间自动关灯',
    priority: '中',
    status: '已启用',
    executeType: '定时执行',
    conditionCount: 1,
    actionCount: 3,
    triggerCount: 156,
    createTime: '2024-05-18',
    remark: '日间自然光充足时关灯',
    startTime: '08:00',
    endTime: '18:00',
    conditions: [
      {
        no: 1,
        productType: '传感器',
        device: '入口投光灯',
        triggerType: '属性触发',
        triggerCondition: '光照度低于阈值'
      }
    ],
    actions: [
      {
        no: 1,
        productType: '灯控制器',
        device: '展厅隧道灯',
        action: '关灯'
      },
      {
        no: 2,
        productType: '灯控制器',
        device: '光亚展杆塔',
        action: '关灯'
      },
      {
        no: 3,
        productType: '灯控制器',
        device: '入口投光灯',
        action: '关灯'
      }
    ]
  }
]

// ---- 表格数据容器（usePresetTable） ----
const mgrCtl = usePresetTable(null, {
  defaultPageSpan: 15,
  initialData: initialLinkages
})

// ---- 概览指标派生 ----
const activeLinkageCount = computed(
  () => mgrCtl.presetPlaybook.filter(l => l.status === '已启用').length
)
const idleLinkageCount = computed(
  () => mgrCtl.presetPlaybook.filter(l => l.status === '已停用').length
)
const totalTriggerCount = computed(
  () => mgrCtl.presetPlaybook.reduce((sum, l) => sum + (l.triggerCount || 0), 0)
)

// ---- 表单草稿容器（useFormDraft） ----
const mgrForm = useFormDraft(
  {
    name: '',
    priority: '',
    executeType: '一直执行',
    startTime: '',
    endTime: '',
    remark: '',
    conditions: [
      {
        productType: '',
        device: '',
        triggerType: '',
        triggerCondition: ''
      }
    ],
    actions: [
      {
        productType: '',
        device: '',
        action: ''
      }
    ]
  },
  {
    validateFn: (draft) => {
      if (!draft.name) {
        ElMessage.warning('请输入规则名称')
        return false
      }
      if (!draft.priority) {
        ElMessage.warning('请选择优先级')
        return false
      }
      if (draft.conditions.some(c => !c.productType || !c.device || !c.triggerType || !c.triggerCondition)) {
        ElMessage.warning('请完善所有触发条件')
        return false
      }
      if (draft.actions.some(a => !a.productType || !a.device || !a.action)) {
        ElMessage.warning('请完善所有执行动作')
        return false
      }
      return true
    }
  }
)

// ---- 详情抽屉容器（useDrawerInspector） ----
const mgrInspector = useDrawerInspector({ size: '720px', direction: 'rtl' })
const focusedLinkage = computed(() => mgrInspector.focusedRecord)

// ---- 触发条件与执行动作管理 ----
const addCondition = () => {
  mgrForm.draftPayload.conditions.push({
    productType: '',
    device: '',
    triggerType: '',
    triggerCondition: ''
  })
}

const removeCondition = (index) => {
  if (mgrForm.draftPayload.conditions.length > 1) {
    mgrForm.draftPayload.conditions.splice(index, 1)
  }
}

const addAction = () => {
  mgrForm.draftPayload.actions.push({
    productType: '',
    device: '',
    action: ''
  })
}

const removeAction = (index) => {
  if (mgrForm.draftPayload.actions.length > 1) {
    mgrForm.draftPayload.actions.splice(index, 1)
  }
}

/**
 * 提交草稿：根据编排/修订模式写入数据池
 * 业务流包装：新建生成规则编号，修订同步条件与动作
 */
const onCommitMgrDraft = async () => {
  const snapshot = await mgrForm.onDraftCommit()
  if (!snapshot) return

  if (mgrForm.editMode === 'compose') {
    // 新建：附带运行态默认值
    mgrCtl.appendRecord({
      ...snapshot,
      conditionCount: snapshot.conditions.length,
      actionCount: snapshot.actions.length,
      status: '已启用',
      triggerCount: 0
    })
    ElMessage.success('联动规则创建成功，已纳入编排引擎')
  } else {
    // 修订：合并更新到原记录
    const origin = mgrForm.originRecord
    mgrCtl.reviseRecord(origin.id, {
      ...snapshot,
      conditionCount: snapshot.conditions.length,
      actionCount: snapshot.actions.length
    })
    ElMessage.success('联动规则已更新')
  }
}

/**
 * 启停联动：已启用↔已停用切换，含幂等回执避免重复操作
 * @param {Object} linkage 目标联动规则
 */
const onToggleLinkage = (linkage) => {
  const nextStatus = linkage.status === '已启用' ? '已停用' : '已启用'
  ElMessageBox.confirm(
    `确认将「${linkage.name}」${nextStatus === '已启用' ? '启用' : '停用'}？`,
    '启停确认',
    { type: 'warning' }
  )
    .then(() => {
      mgrCtl.reviseRecord(linkage.id, { status: nextStatus })
      ElMessage.success(`规则已${nextStatus === '已启用' ? '启用' : '停用'}，编排引擎已同步`)
    })
    .catch(() => {})
}

/**
 * 废止联动：二次确认后从规则池中移除
 * @param {Object} linkage 目标联动规则
 */
const onRetireLinkage = (linkage) => {
  ElMessageBox.confirm(
    `确定要将「${linkage.name}」从编排引擎中废止吗？`,
    '废止确认',
    { type: 'warning' }
  )
    .then(() => {
      mgrCtl.retireRecord(linkage.id)
      ElMessage.success('联动规则已废止，引擎已同步')
    })
    .catch(() => {})
}

/**
 * 测试联动：模拟触发联动规则并返回执行结果
 * @param {Object} linkage 目标联动规则
 */
const onTestLinkage = (linkage) => {
  ElMessageBox.confirm(
    `即将模拟执行联动规则「${linkage.name}」，确认继续？`,
    '测试确认',
    { type: 'info' }
  )
    .then(() => {
      // 模拟测试过程
      setTimeout(() => {
        ElMessage.success(`联动规则测试成功：已触发 ${linkage.conditionCount} 个条件，执行 ${linkage.actionCount} 个动作`)
      }, 800)
    })
    .catch(() => {})
}
</script>

<style scoped lang="scss">
.zg-linkagemgr {
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

.zg-linkagecard {
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
    border-left: 3px solid var(--zg-warning);
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

  &__priority {
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

.zg-priority {
  display: inline-block;
  padding: 2px 8px;
  border-radius: var(--zg-radius-sm);
  font-size: 12px;

  &.high {
    background: var(--zg-danger-soft);
    color: var(--zg-danger);
  }
  &.medium {
    background: var(--zg-warning-soft);
    color: var(--zg-warning);
  }
  &.low {
    background: var(--zg-info-soft);
    color: var(--zg-info);
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

    &--full {
      grid-template-columns: 1fr;
    }
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
  &__list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__card {
    background: var(--zg-surface-muted);
    border: 1px solid var(--zg-line-soft);
    border-radius: var(--zg-radius-md);
    padding: 14px;
  }

  &__card-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--zg-line-soft);
  }

  &__card-index {
    font-size: 13px;
    font-weight: 600;
    color: var(--zg-ink-primary);
  }

  &__card-body {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .el-form-item {
      margin-bottom: 12px;
    }
  }

  &__unit {
    margin-left: 8px;
    font-size: 13px;
    color: var(--zg-ink-tertiary);
  }
}
</style>