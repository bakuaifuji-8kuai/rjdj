<!--
  智光云枢 · 情景编排 · 预案联动
  业务域：scenarioOrch
  功能：情景编排预案联动的台账管理与触发控制
        支持卡片/列表双视图、抽屉式详情与编排、联动触发回执
-->
<template>
  <section class="zg-linkage">
    <!-- 页面头部：品牌徽标 + 标题 + 概览指标 + 新建入口 -->
    <header class="zg-linkage__head">
      <div class="zg-linkage__headline">
        <div class="zg-linkage__sigil">
          <el-icon :size="22"><Connection /></el-icon>
        </div>
        <div class="zg-linkage__copy">
          <h1 class="zg-linkage__title">预案联动</h1>
          <p class="zg-linkage__sub">
            情景编排联动中枢 · 在役 {{ activeLinkageCount }} 条 ·
            停用 {{ idleLinkageCount }} 条 · 累计触发 {{ totalTriggerCount }} 次
          </p>
        </div>
      </div>
      <div class="zg-linkage__cta">
        <el-button type="primary" @click="linkageForm.openComposer()">
          <el-icon><Plus /></el-icon>
          <span>新增联动</span>
        </el-button>
      </div>
    </header>

    <!-- 概览指标卡 -->
    <div class="zg-metrics">
      <div class="zg-metrics__cell">
        <span class="zg-metrics__num">{{ linkageCtl.totalRows }}</span>
        <span class="zg-metrics__lbl">联动总数</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--ok">
        <span class="zg-metrics__num">{{ activeLinkageCount }}</span>
        <span class="zg-metrics__lbl">在役运行</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--warn">
        <span class="zg-metrics__num">{{ idleLinkageCount }}</span>
        <span class="zg-metrics__lbl">停用待启</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--info">
        <span class="zg-metrics__num">{{ highPriorityCount }}</span>
        <span class="zg-metrics__lbl">高优先级</span>
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
          v-model="linkageCtl.statusBuckets"
          placeholder="运行状态"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="在役" value="在役" />
          <el-option label="停用" value="停用" />
        </el-select>
        <el-select
          v-model="linkageCtl.typeBucket"
          placeholder="优先级"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="高优先级" value="high" />
          <el-option label="低优先级" value="low" />
        </el-select>
        <el-input
          v-model="linkageCtl.filterLexicon"
          placeholder="检索联动名称"
          clearable
          class="zg-filterband__search"
          @keyup.enter="linkageCtl.onFilterApply()"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="linkageCtl.onFilterApply()">
          <el-icon><Search /></el-icon>
          <span>检索</span>
        </el-button>
        <el-button @click="linkageCtl.onFilterReset()">
          <el-icon><RefreshLeft /></el-icon>
          <span>重置</span>
        </el-button>
      </div>
    </div>

    <!-- 卡片视图 -->
    <div v-if="densityMode === 'card'" class="zg-cardgrid">
      <article
        v-for="linkage in linkageCtl.pagedRows"
        :key="linkage.id"
        class="zg-linkagecard"
        :class="linkage.status === '在役' ? 'active' : 'idle'"
        @click="linkageInspector.openInspector(linkage)"
      >
        <div class="zg-linkagecard__head">
          <div class="zg-linkagecard__glyph">
            <el-icon :size="24"><Connection /></el-icon>
          </div>
          <span class="zg-status" :class="linkage.status === '在役' ? 'online' : 'offline'">
            <i class="dot"></i>{{ linkage.status }}
          </span>
        </div>
        <div class="zg-linkagecard__body">
          <h3 class="zg-linkagecard__name">{{ linkage.name }}</h3>
          <p class="zg-linkagecard__meta">{{ linkage.scene }} · {{ linkage.priority === 'high' ? '高优先级' : '低优先级' }}</p>
          <div class="zg-linkagecard__stats">
            <span class="zg-linkagecard__stat">
              <em>{{ linkage.triggerCount }}</em> 次触发
            </span>
            <span class="zg-linkagecard__stat">
              <em>{{ linkage.actionCount }}</em> 项动作
            </span>
          </div>
        </div>
        <div class="zg-linkagecard__foot">
          <span class="zg-linkagecard__time">{{ linkage.executeDate }}</span>
          <div class="zg-linkagecard__actions">
            <el-button link type="primary" size="small" @click.stop="onToggleLinkage(linkage)">
              {{ linkage.status === '在役' ? '停用' : '启用' }}
            </el-button>
            <el-button link type="primary" size="small" @click.stop="linkageForm.openReviser(linkage)">修订</el-button>
            <el-button link type="warning" size="small" @click.stop="onTriggerLinkage(linkage)">触发</el-button>
            <el-button link type="danger" size="small" @click.stop="onRetireLinkage(linkage)">废止</el-button>
          </div>
        </div>
      </article>
    </div>

    <!-- 列表视图 -->
    <div v-else class="zg-tablewrap">
      <el-table :data="linkageCtl.pagedRows" stripe class="zg-datatable">
        <el-table-column prop="no" label="序号" width="60" align="center" />
        <el-table-column prop="scene" label="所属场景" width="130" />
        <el-table-column prop="name" label="联动名称" min-width="150" />
        <el-table-column label="优先级" width="100" align="center">
          <template #default="{ row }">
            <span class="zg-priority" :class="row.priority">
              {{ row.priority === 'high' ? '高' : '低' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="运行状态" width="100" align="center">
          <template #default="{ row }">
            <span class="zg-status" :class="row.status === '在役' ? 'online' : 'offline'">
              <i class="dot"></i>{{ row.status }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="triggerCount" label="触发次数" width="100" align="center" />
        <el-table-column prop="actionCount" label="动作数" width="90" align="center" />
        <el-table-column prop="executeDate" label="执行周期" width="150" />
        <el-table-column label="处置" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="linkageInspector.openInspector(row)">详情</el-button>
            <el-button type="warning" size="small" @click="onToggleLinkage(row)">
              {{ row.status === '在役' ? '停用' : '启用' }}
            </el-button>
            <el-button type="primary" size="small" @click="linkageForm.openReviser(row)">修订</el-button>
            <el-button type="success" size="small" @click="onTriggerLinkage(row)">触发</el-button>
            <el-button type="danger" size="small" @click="onRetireLinkage(row)">废止</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页条 -->
    <div class="zg-pagerbar">
      <el-pagination
        v-model:current-page="linkageCtl.pagingCursor"
        v-model:page-size="linkageCtl.pageSpan"
        :total="linkageCtl.totalRows"
        :page-sizes="[10, 15, 20, 50, 100]"
        layout="prev, pager, next, jumper, ->, sizes, total"
        background
      />
    </div>

    <!-- 详情抽屉 -->
    <el-drawer
      v-model="linkageInspector.drawerOpen"
      :title="'联动详情 · ' + (focusedLinkage?.name || '')"
      direction="rtl"
      size="680px"
    >
      <div v-if="focusedLinkage" class="zg-inspector">
        <div class="zg-inspector__head">
          <div class="zg-inspector__glyph">
            <el-icon :size="36"><Connection /></el-icon>
          </div>
          <div class="zg-inspector__meta">
            <h2 class="zg-inspector__name">{{ focusedLinkage.name }}</h2>
            <p class="zg-inspector__type">{{ focusedLinkage.scene }} · {{ focusedLinkage.priority === 'high' ? '高优先级' : '低优先级' }}</p>
            <span class="zg-status" :class="focusedLinkage.status === '在役' ? 'online' : 'offline'">
              <i class="dot"></i>{{ focusedLinkage.status }}
            </span>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">基本档案</h4>
          <div class="zg-inspector__grid">
            <div class="zg-inspector__cell">
              <span class="lbl">执行周期</span>
              <span class="val">{{ focusedLinkage.executeDate }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">触发条件</span>
              <span class="val">{{ focusedLinkage.triggerCond || '-' }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">创建时间</span>
              <span class="val">{{ focusedLinkage.createTime }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">最后触发</span>
              <span class="val">{{ focusedLinkage.lastTriggerTime || '-' }}</span>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">执行统计</h4>
          <div class="zg-datagrid">
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">触发次数</div>
              <div class="zg-datacard__val">{{ focusedLinkage.triggerCount }}<em>次</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">动作数量</div>
              <div class="zg-datacard__val">{{ focusedLinkage.actionCount }}<em>项</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">成功率</div>
              <div class="zg-datacard__val">{{ focusedLinkage.successRate }}<em>%</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">运行时长</div>
              <div class="zg-datacard__val">{{ focusedLinkage.runTime }}<em>h</em></div>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">动作清单</h4>
          <el-table :data="focusedLinkage.actions" size="small" border>
            <el-table-column prop="no" label="序号" width="60" align="center" />
            <el-table-column prop="name" label="动作名称" min-width="120" />
            <el-table-column label="类型" width="100" align="center">
              <template #default="{ row }">
                <span class="zg-action-type">{{ row.type }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="target" label="目标设备" width="120" />
            <el-table-column label="状态" width="90" align="center">
              <template #default="{ row }">
                <span class="zg-status" :class="row.enabled ? 'online' : 'idle'">
                  <i class="dot"></i>{{ row.enabled ? '启用' : '禁用' }}
                </span>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="zg-inspector__actions">
          <el-button size="large" @click="linkageInspector.closeInspector()">关闭</el-button>
          <el-button
            type="success"
            size="large"
            @click="onTriggerLinkage(focusedLinkage)"
          >
            <el-icon><VideoPlay /></el-icon>
            <span>触发联动</span>
          </el-button>
          <el-button
            type="warning"
            size="large"
            @click="onToggleLinkage(focusedLinkage)"
          >
            {{ focusedLinkage.status === '在役' ? '停用联动' : '启用联动' }}
          </el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 新建/修订抽屉 -->
    <el-drawer
      v-model="linkageForm.drawerOpen"
      :title="linkageForm.editMode === 'compose' ? '新增联动' : '修订联动'"
      direction="rtl"
      size="560px"
    >
      <el-form :model="linkageForm.draftPayload" label-width="96px" class="zg-draftform">
        <el-form-item label="所属场景" required>
          <el-select v-model="linkageForm.draftPayload.scene" placeholder="请选择所属场景" style="width: 100%">
            <el-option label="照明控制" value="照明控制" />
            <el-option label="安防监控" value="安防监控" />
            <el-option label="环境监测" value="环境监测" />
            <el-option label="能耗管理" value="能耗管理" />
          </el-select>
        </el-form-item>
        <el-form-item label="联动名称" required>
          <el-input v-model="linkageForm.draftPayload.name" placeholder="请输入联动名称" />
        </el-form-item>
        <el-form-item label="优先级" required>
          <el-radio-group v-model="linkageForm.draftPayload.priority">
            <el-radio value="high">高优先级</el-radio>
            <el-radio value="low">低优先级</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="触发条件">
          <el-input v-model="linkageForm.draftPayload.triggerCond" placeholder="请输入触发条件描述" />
        </el-form-item>
        <el-form-item label="执行周期">
          <el-input v-model="linkageForm.draftPayload.executeDate" placeholder="如：一直执行、2025.01.01-2025.12.31" />
        </el-form-item>
        <el-form-item label="动作数量">
          <el-input-number v-model="linkageForm.draftPayload.actionCount" :min="1" :max="50" />
          <span class="zg-draftform__unit">项</span>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="linkageForm.draftPayload.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="linkageForm.onDraftDiscard()">取消</el-button>
        <el-button
          type="primary"
          :loading="linkageForm.submitting"
          @click="onCommitLinkageDraft"
        >
          {{ linkageForm.editMode === 'compose' ? '新增' : '保存修订' }}
        </el-button>
      </template>
    </el-drawer>
  </section>
</template>

<script setup>
/**
 * 智光云枢 · 情景编排 · 预案联动
 * 业务域：scenarioOrch
 * 功能：情景编排预案联动的台账管理与触发控制
 * @module scenarioOrch/PresetLinkage
 * @author 智光云枢研发团队
 */
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Connection,
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
    scene: '照明控制',
    name: '检测有人开灯',
    priority: 'high',
    status: '在役',
    triggerCount: 128,
    actionCount: 3,
    executeDate: '2025.09.01-2028.10.31',
    triggerCond: '人体感应传感器检测到有人',
    createTime: '2025-01-15',
    lastTriggerTime: '2025-07-02 18:30:00',
    successRate: 98.5,
    runTime: 4380,
    remark: '主照明联动规则',
    actions: [
      { no: 1, name: '开启主灯', type: '开关', target: '主灯设备', enabled: true },
      { no: 2, name: '调节亮度', type: '调节', target: '调光器', enabled: true },
      { no: 3, name: '记录日志', type: '记录', target: '日志系统', enabled: true }
    ]
  },
  {
    id: 2,
    no: 2,
    scene: '安防监控',
    name: '漏电自动断电',
    priority: 'high',
    status: '在役',
    triggerCount: 12,
    actionCount: 2,
    executeDate: '一直执行',
    triggerCond: '漏电电流超过阈值',
    createTime: '2025-02-20',
    lastTriggerTime: '2025-06-28 09:15:00',
    successRate: 100,
    runTime: 3600,
    remark: '安全保护联动',
    actions: [
      { no: 1, name: '切断电源', type: '开关', target: '断路器', enabled: true },
      { no: 2, name: '发送告警', type: '通知', target: '告警平台', enabled: true }
    ]
  },
  {
    id: 3,
    no: 3,
    scene: '照明控制',
    name: '光照度自动亮灯',
    priority: 'high',
    status: '在役',
    triggerCount: 256,
    actionCount: 2,
    executeDate: '一直执行',
    triggerCond: '环境光照度低于阈值',
    createTime: '2025-03-10',
    lastTriggerTime: '2025-07-03 06:45:00',
    successRate: 99.2,
    runTime: 2900,
    remark: '',
    actions: [
      { no: 1, name: '开启路灯', type: '开关', target: '路灯组', enabled: true },
      { no: 2, name: '记录能耗', type: '记录', target: '能耗系统', enabled: true }
    ]
  },
  {
    id: 4,
    no: 4,
    scene: '照明控制',
    name: '检测无人关灯',
    priority: 'low',
    status: '在役',
    triggerCount: 89,
    actionCount: 2,
    executeDate: '一直执行',
    triggerCond: '人体感应传感器持续10分钟无人',
    createTime: '2025-04-05',
    lastTriggerTime: '2025-07-02 22:00:00',
    successRate: 95.5,
    runTime: 2160,
    remark: '节能联动',
    actions: [
      { no: 1, name: '关闭主灯', type: '开关', target: '主灯设备', enabled: true },
      { no: 2, name: '进入待机', type: '调节', target: '控制系统', enabled: true }
    ]
  },
  {
    id: 5,
    no: 5,
    scene: '能耗管理',
    name: '功率超限降载',
    priority: 'low',
    status: '停用',
    triggerCount: 5,
    actionCount: 3,
    executeDate: '一直执行',
    triggerCond: '总功率超过设定阈值',
    createTime: '2025-05-18',
    lastTriggerTime: '2025-06-15 14:20:00',
    successRate: 80,
    runTime: 1800,
    remark: '待优化后启用',
    actions: [
      { no: 1, name: '降低亮度', type: '调节', target: '调光器', enabled: false },
      { no: 2, name: '关闭辅助设备', type: '开关', target: '辅助设备', enabled: false },
      { no: 3, name: '发送通知', type: '通知', target: '运维平台', enabled: true }
    ]
  },
  {
    id: 6,
    no: 6,
    scene: '环境监测',
    name: '温湿度异常告警',
    priority: 'low',
    status: '停用',
    triggerCount: 3,
    actionCount: 2,
    executeDate: '2025.06.01-2025.08.31',
    triggerCond: '温度>35°C或湿度>85%',
    createTime: '2025-06-01',
    lastTriggerTime: '2025-06-20 15:30:00',
    successRate: 100,
    runTime: 720,
    remark: '夏季监测联动',
    actions: [
      { no: 1, name: '发送告警', type: '通知', target: '告警平台', enabled: true },
      { no: 2, name: '启动通风', type: '开关', target: '通风设备', enabled: false }
    ]
  }
]

// ---- 表格数据容器（usePresetTable） ----
const linkageCtl = usePresetTable(null, {
  defaultPageSpan: 15,
  initialData: initialLinkages
})

// ---- 概览指标派生 ----
const activeLinkageCount = computed(
  () => linkageCtl.presetPlaybook.filter(l => l.status === '在役').length
)
const idleLinkageCount = computed(
  () => linkageCtl.presetPlaybook.filter(l => l.status === '停用').length
)
const highPriorityCount = computed(
  () => linkageCtl.presetPlaybook.filter(l => l.priority === 'high').length
)
const totalTriggerCount = computed(
  () => linkageCtl.presetPlaybook.reduce((sum, l) => sum + (l.triggerCount || 0), 0)
)

// ---- 表单草稿容器（useFormDraft） ----
const linkageForm = useFormDraft(
  {
    scene: '',
    name: '',
    priority: 'low',
    triggerCond: '',
    executeDate: '',
    actionCount: 1,
    remark: ''
  },
  {
    validateFn: (draft) => {
      if (!draft.scene) {
        ElMessage.warning('请选择所属场景')
        return false
      }
      if (!draft.name) {
        ElMessage.warning('请输入联动名称')
        return false
      }
      if (!draft.priority) {
        ElMessage.warning('请选择优先级')
        return false
      }
      return true
    }
  }
)

// ---- 详情抽屉容器（useDrawerInspector） ----
const linkageInspector = useDrawerInspector({ size: '680px', direction: 'rtl' })
const focusedLinkage = computed(() => linkageInspector.focusedRecord)

/**
 * 提交草稿：根据编排/修订模式写入数据池
 * 业务流包装：新建生成联动编号，修订同步执行统计
 */
const onCommitLinkageDraft = async () => {
  const snapshot = await linkageForm.onDraftCommit()
  if (!snapshot) return

  if (linkageForm.editMode === 'compose') {
    // 新增：附带运行态默认值
    linkageCtl.appendRecord({
      ...snapshot,
      no: linkageCtl.presetPlaybook.length + 1,
      status: '在役',
      triggerCount: 0,
      successRate: 100,
      runTime: 0,
      createTime: new Date().toISOString().slice(0, 10),
      lastTriggerTime: '-',
      actions: []
    })
    ElMessage.success('联动规则新增成功，已并入联动台账')
  } else {
    // 修订：合并更新到原记录
    const origin = linkageForm.originRecord
    linkageCtl.reviseRecord(origin.id, { ...snapshot })
    ElMessage.success('联动规则已更新')
  }
}

/**
 * 启停联动：在役↔停用切换，含幂等回执避免重复操作
 * @param {Object} linkage 目标联动规则
 */
const onToggleLinkage = (linkage) => {
  const nextStatus = linkage.status === '在役' ? '停用' : '在役'
  ElMessageBox.confirm(
    `确认将「${linkage.name}」${nextStatus === '在役' ? '启用' : '停用'}？`,
    '启停确认',
    { type: 'warning' }
  )
    .then(() => {
      linkageCtl.reviseRecord(linkage.id, { status: nextStatus })
      ElMessage.success(`联动已${nextStatus === '在役' ? '启用' : '停用'}，状态回执已签收`)
    })
    .catch(() => {})
}

/**
 * 废止联动：二次确认后从台账中移除
 * @param {Object} linkage 目标联动规则
 */
const onRetireLinkage = (linkage) => {
  ElMessageBox.confirm(
    `确定要将「${linkage.name}」从联动台账中废止吗？`,
    '废止确认',
    { type: 'warning' }
  )
    .then(() => {
      linkageCtl.retireRecord(linkage.id)
      ElMessage.success('联动已废止，台账已同步')
    })
    .catch(() => {})
}

/**
 * 触发联动：手动触发联动规则执行
 * @param {Object} linkage 目标联动规则
 */
const onTriggerLinkage = (linkage) => {
  ElMessageBox.confirm(
    `确认手动触发联动「${linkage.name}」？将执行 ${linkage.actionCount} 项动作。`,
    '触发确认',
    { type: 'info' }
  )
    .then(() => {
      // 更新触发次数和最后触发时间
      const newTriggerCount = (linkage.triggerCount || 0) + 1
      linkageCtl.reviseRecord(linkage.id, {
        triggerCount: newTriggerCount,
        lastTriggerTime: new Date().toLocaleString('zh-CN')
      })
      ElMessage.success(`联动触发成功，已执行 ${linkage.actionCount} 项动作`)
    })
    .catch(() => {})
}
</script>

<style scoped lang="scss">
.zg-linkage {
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

  &.idle {
    border-left: 3px solid var(--zg-warning);
  }
  &.active {
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 22px;
  padding: 0 8px;
  border-radius: var(--zg-radius-sm);
  font-size: 12px;
  font-weight: 600;

  &.high {
    background: var(--zg-danger-soft);
    color: var(--zg-danger);
  }
  &.low {
    background: var(--zg-success-soft);
    color: var(--zg-success);
  }
}

.zg-action-type {
  font-size: 12px;
  padding: 2px 6px;
  background: var(--zg-info-soft);
  color: var(--zg-info);
  border-radius: var(--zg-radius-sm);
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