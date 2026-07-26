<!--
  智光云枢 · 运维工单 · 工单池
  业务域：opsTicket
  功能：城市照明运维工单的调度分配与状态流转
        支持卡片/列表双视图、抽屉式详情与编排、工单指派回执
-->
<template>
  <section class="zg-dispatch">
    <!-- 页面头部：品牌徽标 + 标题 + 概览指标 + 新建入口 -->
    <header class="zg-dispatch__head">
      <div class="zg-dispatch__headline">
        <div class="zg-dispatch__sigil">
          <el-icon :size="22"><Tickets /></el-icon>
        </div>
        <div class="zg-dispatch__copy">
          <h1 class="zg-dispatch__title">工单池</h1>
          <p class="zg-dispatch__sub">
            城市照明运维中枢 · 在册 {{ dispatchCtl.totalRows }} 单 ·
            待处理 {{ pendingTicketCount }} 单 · 处理中 {{ activeTicketCount }} 单
          </p>
        </div>
      </div>
      <div class="zg-dispatch__cta">
        <el-button type="primary" @click="dispatchForm.openComposer()">
          <el-icon><Plus /></el-icon>
          <span>新建工单</span>
        </el-button>
      </div>
    </header>

    <!-- 概览指标卡 -->
    <div class="zg-metrics">
      <div class="zg-metrics__cell">
        <span class="zg-metrics__num">{{ dispatchCtl.totalRows }}</span>
        <span class="zg-metrics__lbl">工单总数</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--warn">
        <span class="zg-metrics__num">{{ pendingTicketCount }}</span>
        <span class="zg-metrics__lbl">待处理</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--info">
        <span class="zg-metrics__num">{{ activeTicketCount }}</span>
        <span class="zg-metrics__lbl">处理中</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--ok">
        <span class="zg-metrics__num">{{ closedTicketCount }}</span>
        <span class="zg-metrics__lbl">已完成</span>
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
          v-model="dispatchCtl.statusBuckets"
          placeholder="工单状态"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="待处理" value="待处理" />
          <el-option label="处理中" value="处理中" />
          <el-option label="已完成" value="已完成" />
          <el-option label="已关闭" value="已关闭" />
        </el-select>
        <el-select
          v-model="dispatchCtl.typeBucket"
          placeholder="工单类型"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="故障报修" value="故障报修" />
          <el-option label="日常巡检" value="日常巡检" />
          <el-option label="维护保养" value="维护保养" />
        </el-select>
        <el-select
          v-model="priorityBucket"
          placeholder="优先级"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="高" value="高" />
          <el-option label="中" value="中" />
          <el-option label="低" value="低" />
        </el-select>
        <el-input
          v-model="dispatchCtl.filterLexicon"
          placeholder="检索工单标题"
          clearable
          class="zg-filterband__search"
          @keyup.enter="dispatchCtl.onFilterApply()"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="dispatchCtl.onFilterApply()">
          <el-icon><Search /></el-icon>
          <span>检索</span>
        </el-button>
        <el-button @click="onResetFilters()">
          <el-icon><RefreshLeft /></el-icon>
          <span>重置</span>
        </el-button>
      </div>
    </div>

    <!-- 卡片视图 -->
    <div v-if="densityMode === 'card'" class="zg-cardgrid">
      <article
        v-for="ticket in visibleTickets"
        :key="ticket.id"
        class="zg-ticketcard"
        :class="ticketStatusClass(ticket.status)"
        @click="dispatchInspector.openInspector(ticket)"
      >
        <div class="zg-ticketcard__head">
          <div class="zg-ticketcard__glyph">
            <el-icon :size="24"><Tickets /></el-icon>
          </div>
          <span class="zg-status" :class="ticketStatusClass(ticket.status)">
            <i class="dot"></i>{{ ticket.status }}
          </span>
        </div>
        <div class="zg-ticketcard__body">
          <h3 class="zg-ticketcard__name">{{ ticket.name }}</h3>
          <p class="zg-ticketcard__area">{{ ticket.type }} · {{ ticket.deviceName }}</p>
          <div class="zg-ticketcard__stats">
            <span class="zg-ticketcard__stat">
              <em>{{ ticket.ticketSn }}</em>
            </span>
            <span class="zg-ticketcard__stat">
              <em>{{ ticket.priority }}</em> 优先级
            </span>
          </div>
        </div>
        <div class="zg-ticketcard__foot">
          <span class="zg-ticketcard__time">{{ ticket.createTime }}</span>
          <div class="zg-ticketcard__actions">
            <el-button link type="primary" size="small" @click.stop="dispatchInspector.openInspector(ticket)">详情</el-button>
            <el-button link type="primary" size="small" @click.stop="onAssignTicket(ticket)">指派</el-button>
            <el-button link type="danger" size="small" @click.stop="onRetireTicket(ticket)">废止</el-button>
          </div>
        </div>
      </article>
    </div>

    <!-- 列表视图 -->
    <div v-else class="zg-tablewrap">
      <el-table :data="visibleTickets" stripe class="zg-datatable">
        <el-table-column prop="no" label="序号" width="60" align="center" />
        <el-table-column prop="ticketSn" label="工单编号" width="170" />
        <el-table-column prop="type" label="工单类型" width="110" />
        <el-table-column prop="name" label="工单标题" min-width="160" />
        <el-table-column prop="deviceName" label="关联设备" width="150" />
        <el-table-column label="工单状态" width="100" align="center">
          <template #default="{ row }">
            <span class="zg-status" :class="ticketStatusClass(row.status)">
              <i class="dot"></i>{{ row.status }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="priorityTagType(row.priority)">{{ row.priority }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="creator" label="创建人" width="100" />
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="处置" width="250" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="dispatchInspector.openInspector(row)">详情</el-button>
            <el-button type="warning" size="small" @click="onAssignTicket(row)">指派</el-button>
            <el-button type="danger" size="small" @click="onRetireTicket(row)">废止</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页条 -->
    <div class="zg-pagerbar">
      <el-pagination
        v-model:current-page="dispatchCtl.pagingCursor"
        v-model:page-size="dispatchCtl.pageSpan"
        :total="dispatchCtl.totalRows"
        :page-sizes="[10, 15, 20, 50, 100]"
        layout="prev, pager, next, jumper, ->, sizes, total"
        background
      />
    </div>

    <!-- 详情抽屉 -->
    <el-drawer
      v-model="dispatchInspector.drawerOpen"
      :title="'工单详情 · ' + (focusedTicket?.name || '')"
      direction="rtl"
      size="680px"
    >
      <div v-if="focusedTicket" class="zg-inspector">
        <div class="zg-inspector__head">
          <div class="zg-inspector__glyph">
            <el-icon :size="36"><Tickets /></el-icon>
          </div>
          <div class="zg-inspector__meta">
            <h2 class="zg-inspector__name">{{ focusedTicket.name }}</h2>
            <p class="zg-inspector__type">{{ focusedTicket.type }} · {{ focusedTicket.deviceName }}</p>
            <span class="zg-status" :class="ticketStatusClass(focusedTicket.status)">
              <i class="dot"></i>{{ focusedTicket.status }}
            </span>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">基本档案</h4>
          <div class="zg-inspector__grid">
            <div class="zg-inspector__cell">
              <span class="lbl">工单编号</span>
              <span class="val">{{ focusedTicket.ticketSn }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">设备编号</span>
              <span class="val">{{ focusedTicket.deviceCode || '-' }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">优先级</span>
              <span class="val">{{ focusedTicket.priority }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">负责人</span>
              <span class="val">{{ focusedTicket.assignee || '-' }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">创建人</span>
              <span class="val">{{ focusedTicket.creator }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">创建时间</span>
              <span class="val">{{ focusedTicket.createTime }}</span>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">问题描述</h4>
          <p class="zg-inspector__desc">{{ focusedTicket.description || '-' }}</p>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">处理记录</h4>
          <el-timeline>
            <el-timeline-item
              v-for="(record, idx) in focusedTicket.records"
              :key="idx"
              :timestamp="record.time"
              placement="top"
            >
              <div class="zg-inspector__record">
                <span class="operator">{{ record.operator }}</span>
                <span class="action">{{ record.action }}</span>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>

        <div class="zg-inspector__actions">
          <el-button size="large" @click="dispatchInspector.closeInspector()">关闭</el-button>
          <el-button
            v-if="focusedTicket.status === '待处理'"
            type="warning"
            size="large"
            @click="onAssignTicket(focusedTicket)"
          >
            指派工单
          </el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 新建/修订抽屉 -->
    <el-drawer
      v-model="dispatchForm.drawerOpen"
      :title="dispatchForm.editMode === 'compose' ? '新建工单' : '修订工单'"
      direction="rtl"
      size="560px"
    >
      <el-form :model="dispatchForm.draftPayload" label-width="96px" class="zg-draftform">
        <el-form-item label="工单类型" required>
          <el-select v-model="dispatchForm.draftPayload.type" placeholder="请选择工单类型" style="width: 100%">
            <el-option label="故障报修" value="故障报修" />
            <el-option label="日常巡检" value="日常巡检" />
            <el-option label="维护保养" value="维护保养" />
          </el-select>
        </el-form-item>
        <el-form-item label="工单标题" required>
          <el-input v-model="dispatchForm.draftPayload.name" placeholder="请输入工单标题" />
        </el-form-item>
        <el-form-item label="关联设备">
          <el-select v-model="dispatchForm.draftPayload.deviceName" placeholder="请选择关联设备" style="width: 100%">
            <el-option label="先导路001杆塔" value="先导路001杆塔" />
            <el-option label="芙蓉路002杆塔" value="芙蓉路002杆塔" />
            <el-option label="LED路灯001" value="LED路灯001" />
            <el-option label="监控视频采集001" value="监控视频采集001" />
            <el-option label="光照传感器001" value="光照传感器001" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="dispatchForm.draftPayload.priority" placeholder="请选择优先级" style="width: 100%">
            <el-option label="高" value="高" />
            <el-option label="中" value="中" />
            <el-option label="低" value="低" />
          </el-select>
        </el-form-item>
        <el-form-item label="问题描述">
          <el-input
            v-model="dispatchForm.draftPayload.description"
            type="textarea"
            :rows="4"
            placeholder="请输入问题描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dispatchForm.onDraftDiscard()">取消</el-button>
        <el-button
          type="primary"
          :loading="dispatchForm.submitting"
          @click="onCommitTicketDraft"
        >
          {{ dispatchForm.editMode === 'compose' ? '新建' : '保存修订' }}
        </el-button>
      </template>
    </el-drawer>
  </section>
</template>

<script setup>
/**
 * 智光云枢 · 运维工单 · 工单池
 * 业务域：opsTicket
 * 功能：城市照明运维工单的调度分配与状态流转
 * @module opsTicket/DispatchPool
 * @author 智光云枢研发团队
 */
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Tickets,
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

// ---- 优先级筛选桶（本地扩展维度，叠加在 composable 分页结果之上） ----
const priorityBucket = ref('')

// ---- 初始 mock 数据池 ----
const initialTickets = [
  {
    id: 1,
    no: 1,
    ticketSn: 'WO-2024-0701-001',
    type: '故障报修',
    name: '先导路路灯故障',
    deviceName: '先导路001杆塔',
    deviceCode: 'DG-XDL-001',
    status: '待处理',
    priority: '高',
    creator: '管理员',
    createTime: '2024-07-02 10:00:00',
    assignee: '',
    description: '先导路001杆塔路灯不亮，需要检修',
    records: [
      { operator: '管理员', action: '创建工单', time: '2024-07-02 10:00:00' }
    ]
  },
  {
    id: 2,
    no: 2,
    ticketSn: 'WO-2024-0702-002',
    type: '日常巡检',
    name: '芙蓉路路灯巡检',
    deviceName: '芙蓉路002杆塔',
    deviceCode: 'DG-FRL-002',
    status: '处理中',
    priority: '中',
    creator: '管理员',
    createTime: '2024-07-02 09:00:00',
    assignee: '张工',
    description: '定期巡检芙蓉路路灯设备状态',
    records: [
      { operator: '管理员', action: '创建工单', time: '2024-07-02 09:00:00' },
      { operator: '张工', action: '开始处理', time: '2024-07-02 09:30:00' }
    ]
  },
  {
    id: 3,
    no: 3,
    ticketSn: 'WO-2024-0701-003',
    type: '维护保养',
    name: 'LED路灯维护',
    deviceName: 'LED路灯001',
    deviceCode: 'DJ-LED-001',
    status: '已完成',
    priority: '低',
    creator: '管理员',
    createTime: '2024-07-01 14:00:00',
    assignee: '李工',
    description: 'LED路灯定期维护保养',
    records: [
      { operator: '管理员', action: '创建工单', time: '2024-07-01 14:00:00' },
      { operator: '李工', action: '开始处理', time: '2024-07-01 14:30:00' },
      { operator: '李工', action: '完成维护', time: '2024-07-01 16:00:00' }
    ]
  },
  {
    id: 4,
    no: 4,
    ticketSn: 'WO-2024-0702-004',
    type: '故障报修',
    name: '监控视频采集故障',
    deviceName: '监控视频采集001',
    deviceCode: 'CAM-001',
    status: '待处理',
    priority: '高',
    creator: '管理员',
    createTime: '2024-07-02 11:30:00',
    assignee: '',
    description: '监控视频采集画面异常，需要检修',
    records: [
      { operator: '管理员', action: '创建工单', time: '2024-07-02 11:30:00' }
    ]
  },
  {
    id: 5,
    no: 5,
    ticketSn: 'WO-2024-0701-005',
    type: '日常巡检',
    name: '开福区路灯巡检',
    deviceName: '湘江路1号馈电柜',
    deviceCode: 'POWER-XJL-001',
    status: '已关闭',
    priority: '低',
    creator: '管理员',
    createTime: '2024-07-01 10:00:00',
    assignee: '王工',
    description: '开福区路灯设备定期巡检',
    records: [
      { operator: '管理员', action: '创建工单', time: '2024-07-01 10:00:00' },
      { operator: '王工', action: '巡检完成', time: '2024-07-01 12:00:00' },
      { operator: '管理员', action: '关闭工单', time: '2024-07-01 12:30:00' }
    ]
  },
  {
    id: 6,
    no: 6,
    ticketSn: 'WO-2024-0702-006',
    type: '维护保养',
    name: '传感器设备维护',
    deviceName: '光照传感器001',
    deviceCode: 'SENSOR-LIGHT-001',
    status: '处理中',
    priority: '中',
    creator: '管理员',
    createTime: '2024-07-02 13:00:00',
    assignee: '赵工',
    description: '传感器设备定期维护',
    records: [
      { operator: '管理员', action: '创建工单', time: '2024-07-02 13:00:00' },
      { operator: '赵工', action: '开始处理', time: '2024-07-02 13:30:00' }
    ]
  }
]

// ---- 工单数据容器（usePresetTable） ----
const dispatchCtl = usePresetTable(null, {
  defaultPageSpan: 15,
  initialData: initialTickets
})

// ---- 概览指标派生 ----
const pendingTicketCount = computed(
  () => dispatchCtl.presetPlaybook.filter(t => t.status === '待处理').length
)
const activeTicketCount = computed(
  () => dispatchCtl.presetPlaybook.filter(t => t.status === '处理中').length
)
const closedTicketCount = computed(
  () => dispatchCtl.presetPlaybook.filter(t => t.status === '已完成').length
)

// ---- 卡片/列表展示数据（在分页结果上叠加优先级筛选） ----
const visibleTickets = computed(() => {
  if (!priorityBucket.value) return dispatchCtl.pagedRows
  return dispatchCtl.pagedRows.filter(t => t.priority === priorityBucket.value)
})

/**
 * 重置过滤条件：清空状态/类型/优先级/关键词并回到首页
 */
const onResetFilters = () => {
  dispatchCtl.onFilterReset()
  priorityBucket.value = ''
}

/**
 * 工单状态徽标样式映射
 * @param {string} status 工单状态
 * @returns {string} 样式类名
 */
const ticketStatusClass = (status) => {
  const map = {
    '待处理': 'offline',
    '处理中': 'idle',
    '已完成': 'online',
    '已关闭': 'closed'
  }
  return map[status] || 'idle'
}

/**
 * 优先级标签类型映射
 * @param {string} priority 优先级
 * @returns {string} el-tag type
 */
const priorityTagType = (priority) => {
  const map = { '高': 'danger', '中': 'warning', '低': 'success' }
  return map[priority] || 'info'
}

// ---- 表单草稿容器（useFormDraft） ----
const dispatchForm = useFormDraft(
  {
    type: '',
    name: '',
    deviceName: '',
    priority: '中',
    description: ''
  },
  {
    validateFn: (draft) => {
      if (!draft.type) {
        ElMessage.warning('请选择工单类型')
        return false
      }
      if (!draft.name) {
        ElMessage.warning('请输入工单标题')
        return false
      }
      return true
    }
  }
)

// ---- 详情抽屉容器（useDrawerInspector） ----
const dispatchInspector = useDrawerInspector({ size: '680px', direction: 'rtl' })
const focusedTicket = computed(() => dispatchInspector.focusedRecord)

/**
 * 提交草稿：根据编排/修订模式写入工单池
 * 业务流包装：新建生成工单编号与初始处理记录，修订同步档案字段
 */
const onCommitTicketDraft = async () => {
  const snapshot = await dispatchForm.onDraftCommit()
  if (!snapshot) return

  if (dispatchForm.editMode === 'compose') {
    // 新建：附带调度态默认值与初始回执
    const seq = dispatchCtl.presetPlaybook.length + 1
    const now = new Date()
    const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
    dispatchCtl.appendRecord({
      ...snapshot,
      no: seq,
      ticketSn: `WO-${now.getFullYear()}-${String(seq).padStart(4, '0')}`,
      deviceCode: '',
      status: '待处理',
      creator: '管理员',
      createTime: stamp,
      assignee: '',
      records: [
        { operator: '管理员', action: '创建工单', time: stamp }
      ]
    })
    ElMessage.success('工单已创建，调度凭证已签发')
  } else {
    // 修订：合并更新到原记录
    const origin = dispatchForm.originRecord
    dispatchCtl.reviseRecord(origin.id, { ...snapshot })
    ElMessage.success('工单档案已更新')
  }
}

/**
 * 指派工单：将待处理工单流转为处理中并指派外勤班组
 * 业务流包装：状态流转 + 处理记录追加 + 调度回执签收
 * @param {Object} ticket 目标工单
 */
const onAssignTicket = (ticket) => {
  if (ticket.status !== '待处理') {
    ElMessage.info('仅待处理工单可指派')
    return
  }
  ElMessageBox.confirm(
    `确认将工单「${ticket.name}」指派给外勤班组并开始处理？`,
    '指派确认',
    { type: 'warning' }
  )
    .then(() => {
      const now = new Date()
      const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
      const nextRecords = [
        ...(ticket.records || []),
        { operator: '调度中心', action: '指派外勤班组并开始处理', time: stamp }
      ]
      dispatchCtl.reviseRecord(ticket.id, {
        status: '处理中',
        assignee: ticket.assignee || '外勤班组',
        records: nextRecords
      })
      ElMessage.success('工单已派发，调度回执已签收')
    })
    .catch(() => {})
}

/**
 * 废止工单：二次确认后从工单池中移除
 * @param {Object} ticket 目标工单
 */
const onRetireTicket = (ticket) => {
  ElMessageBox.confirm(
    `确定要将工单「${ticket.name}」从工单池中废止吗？`,
    '废止确认',
    { type: 'warning' }
  )
    .then(() => {
      dispatchCtl.retireRecord(ticket.id)
      ElMessage.success('工单已废止，工单池已同步')
    })
    .catch(() => {})
}
</script>

<style scoped lang="scss">
.zg-dispatch {
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

  &__select { width: 150px; }
  &__search { width: 240px; }
}

.zg-cardgrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.zg-ticketcard {
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
  &.idle {
    border-left: 3px solid var(--zg-warning);
  }
  &.closed {
    border-left: 3px solid var(--zg-info);
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

  &__area {
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
      font-size: 14px;
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
  &.closed {
    color: var(--zg-info);
    background: var(--zg-surface-muted);
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
    font-size: 14px;
    color: var(--zg-ink-secondary);
    line-height: 1.8;
    background: var(--zg-surface-muted);
    padding: 12px 14px;
    border-radius: var(--zg-radius-md);
    border: 1px solid var(--zg-line-soft);
    margin: 0;
  }

  &__record {
    display: flex;
    gap: 8px;

    .operator {
      font-weight: 600;
      color: var(--zg-ink-primary);
    }
    .action {
      color: var(--zg-ink-secondary);
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
