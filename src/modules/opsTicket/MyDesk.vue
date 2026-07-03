<!--
  智光云枢 · 运维工单 · 我的工作台
  业务域：opsTicket
  功能：运维人员工单处置工作台，支持待办/处理中/已办工单管理与流转
-->
<template>
  <section class="zg-mydesk">
    <!-- 页面头部：品牌徽标 + 标题 + 概览指标 -->
    <header class="zg-mydesk__head">
      <div class="zg-mydesk__headline">
        <div class="zg-mydesk__sigil">
          <el-icon :size="22"><UserFilled /></el-icon>
        </div>
        <div class="zg-mydesk__copy">
          <h1 class="zg-mydesk__title">我的工作台</h1>
          <p class="zg-mydesk__sub">
            运维工单处置中枢 · 待办 {{ pendingCount }} 单 ·
            处理中 {{ processingCount }} 单 · 累计完成 {{ completedCount }} 单
          </p>
        </div>
      </div>
    </header>

    <!-- 概览指标卡 -->
    <div class="zg-metrics">
      <div class="zg-metrics__cell zg-metrics__cell--danger">
        <span class="zg-metrics__num">{{ pendingCount }}</span>
        <span class="zg-metrics__lbl">待处理</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--warn">
        <span class="zg-metrics__num">{{ processingCount }}</span>
        <span class="zg-metrics__lbl">处理中</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--ok">
        <span class="zg-metrics__num">{{ completedCount }}</span>
        <span class="zg-metrics__lbl">已完成</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--info">
        <span class="zg-metrics__num">{{ closedCount }}</span>
        <span class="zg-metrics__lbl">已关闭</span>
      </div>
    </div>

    <!-- 待办工单列表 -->
    <div class="zg-mydesk__section">
      <div class="zg-mydesk__section-head">
        <h3 class="zg-mydesk__section-title">
          <el-icon><Tickets /></el-icon>
          <span>待办工单</span>
          <em class="zg-mydesk__section-badge">{{ pendingCount }}</em>
        </h3>
        <div class="zg-mydesk__section-actions">
          <el-button size="small" @click="onRefreshPending">
            <el-icon><RefreshLeft /></el-icon>
            <span>刷新</span>
          </el-button>
        </div>
      </div>
      <div v-if="pendingTickets.length > 0" class="zg-ticketgrid">
        <article
          v-for="ticket in pendingTickets"
          :key="ticket.id"
          class="zg-ticketcard zg-ticketcard--pending"
          @click="onInspectTicket(ticket)"
        >
          <div class="zg-ticketcard__head">
            <div class="zg-ticketcard__glyph">
              <el-icon :size="20"><Tickets /></el-icon>
            </div>
            <span class="zg-ticketcard__code">{{ ticket.code }}</span>
            <span class="zg-status zg-status--danger">
              <i class="dot"></i>{{ ticket.status }}
            </span>
          </div>
          <div class="zg-ticketcard__body">
            <h4 class="zg-ticketcard__title">{{ ticket.title }}</h4>
            <p class="zg-ticketcard__desc">{{ ticket.description }}</p>
            <div class="zg-ticketcard__meta">
              <span class="zg-ticketcard__type">
                <el-tag size="small" :type="getTypeTagType(ticket.type)">{{ ticket.type }}</el-tag>
              </span>
              <span class="zg-ticketcard__priority">
                <el-tag size="small" :type="getPriorityType(ticket.priority)">{{ ticket.priority }}</el-tag>
              </span>
            </div>
          </div>
          <div class="zg-ticketcard__foot">
            <span class="zg-ticketcard__deadline">截止：{{ ticket.deadline }}</span>
            <div class="zg-ticketcard__actions">
              <el-button type="primary" size="small" @click.stop="onAcceptTicket(ticket)">接单</el-button>
            </div>
          </div>
        </article>
      </div>
      <el-empty v-else description="暂无待办工单" :image-size="100" />
    </div>

    <!-- 处理中工单列表 -->
    <div class="zg-mydesk__section">
      <div class="zg-mydesk__section-head">
        <h3 class="zg-mydesk__section-title">
          <el-icon><Tickets /></el-icon>
          <span>处理中工单</span>
          <em class="zg-mydesk__section-badge">{{ processingCount }}</em>
        </h3>
      </div>
      <div v-if="processingTickets.length > 0" class="zg-ticketgrid">
        <article
          v-for="ticket in processingTickets"
          :key="ticket.id"
          class="zg-ticketcard zg-ticketcard--processing"
          @click="onInspectTicket(ticket)"
        >
          <div class="zg-ticketcard__head">
            <div class="zg-ticketcard__glyph">
              <el-icon :size="20"><Tickets /></el-icon>
            </div>
            <span class="zg-ticketcard__code">{{ ticket.code }}</span>
            <span class="zg-status zg-status--warn">
              <i class="dot"></i>{{ ticket.status }}
            </span>
          </div>
          <div class="zg-ticketcard__body">
            <h4 class="zg-ticketcard__title">{{ ticket.title }}</h4>
            <p class="zg-ticketcard__desc">{{ ticket.description }}</p>
            <div class="zg-ticketcard__meta">
              <span class="zg-ticketcard__type">
                <el-tag size="small" :type="getTypeTagType(ticket.type)">{{ ticket.type }}</el-tag>
              </span>
              <span class="zg-ticketcard__priority">
                <el-tag size="small" :type="getPriorityType(ticket.priority)">{{ ticket.priority }}</el-tag>
              </span>
            </div>
          </div>
          <div class="zg-ticketcard__foot">
            <span class="zg-ticketcard__deadline">截止：{{ ticket.deadline }}</span>
            <div class="zg-ticketcard__actions">
              <el-button type="success" size="small" @click.stop="onCompleteTicket(ticket)">完成</el-button>
            </div>
          </div>
        </article>
      </div>
      <el-empty v-else description="暂无处理中工单" :image-size="100" />
    </div>

    <!-- 已办工单列表 -->
    <div class="zg-mydesk__section">
      <div class="zg-mydesk__section-head">
        <h3 class="zg-mydesk__section-title">
          <el-icon><Tickets /></el-icon>
          <span>已办工单</span>
          <em class="zg-mydesk__section-badge">{{ completedCount + closedCount }}</em>
        </h3>
        <div class="zg-mydesk__section-actions">
          <el-select
            v-model="deskCtl.statusBuckets"
            placeholder="状态筛选"
            clearable
            size="small"
            class="zg-mydesk__filter-select"
          >
            <el-option label="已完成" value="已完成" />
            <el-option label="已关闭" value="已关闭" />
          </el-select>
          <el-input
            v-model="deskCtl.filterLexicon"
            placeholder="检索工单编号/标题"
            clearable
            size="small"
            class="zg-mydesk__filter-input"
            @keyup.enter="deskCtl.onFilterApply()"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-button type="primary" size="small" @click="deskCtl.onFilterApply()">
            <el-icon><Search /></el-icon>
            <span>检索</span>
          </el-button>
          <el-button size="small" @click="deskCtl.onFilterReset()">
            <el-icon><RefreshLeft /></el-icon>
            <span>重置</span>
          </el-button>
        </div>
      </div>
      <div class="zg-tablewrap">
        <el-table :data="deskCtl.pagedRows" stripe class="zg-datatable">
          <el-table-column prop="no" label="序号" width="60" align="center" />
          <el-table-column prop="code" label="工单编号" width="150" />
          <el-table-column prop="title" label="工单标题" min-width="200" />
          <el-table-column prop="type" label="工单类型" width="120" align="center">
            <template #default="{ row }">
              <el-tag size="small" :type="getTypeTagType(row.type)">{{ row.type }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="priority" label="优先级" width="90" align="center">
            <template #default="{ row }">
              <el-tag size="small" :type="getPriorityType(row.priority)">{{ row.priority }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100" align="center">
            <template #default="{ row }">
              <span class="zg-status" :class="getStatusClass(row.status)">
                <i class="dot"></i>{{ row.status }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="170" />
          <el-table-column prop="deadline" label="截止时间" width="170" />
          <el-table-column label="处置" width="120" align="center" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="onInspectTicket(row)">详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="zg-pagerbar">
        <el-pagination
          v-model:current-page="deskCtl.pagingCursor"
          v-model:page-size="deskCtl.pageSpan"
          :total="deskCtl.totalRows"
          :page-sizes="[10, 15, 20, 50]"
          layout="prev, pager, next, jumper, ->, sizes, total"
          background
        />
      </div>
    </div>

    <!-- 工单详情抽屉 -->
    <el-drawer
      v-model="deskInspector.drawerOpen"
      :title="'工单详情 · ' + (focusedTicket?.code || '')"
      direction="rtl"
      size="680px"
    >
      <div v-if="focusedTicket" class="zg-inspector">
        <div class="zg-inspector__head">
          <div class="zg-inspector__glyph">
            <el-icon :size="36"><Tickets /></el-icon>
          </div>
          <div class="zg-inspector__meta">
            <h2 class="zg-inspector__name">{{ focusedTicket.title }}</h2>
            <p class="zg-inspector__type">{{ focusedTicket.code }} · {{ focusedTicket.type }}</p>
            <span class="zg-status" :class="getStatusClass(focusedTicket.status)">
              <i class="dot"></i>{{ focusedTicket.status }}
            </span>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">工单档案</h4>
          <div class="zg-inspector__grid">
            <div class="zg-inspector__cell">
              <span class="lbl">工单编号</span>
              <span class="val">{{ focusedTicket.code }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">工单类型</span>
              <span class="val">{{ focusedTicket.type }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">优先级</span>
              <span class="val">{{ focusedTicket.priority }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">创建人</span>
              <span class="val">{{ focusedTicket.creator }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">创建时间</span>
              <span class="val">{{ focusedTicket.createdAt }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">截止时间</span>
              <span class="val">{{ focusedTicket.deadline }}</span>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">问题描述</h4>
          <div class="zg-inspector__content">
            {{ focusedTicket.description }}
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">处理记录</h4>
          <el-timeline>
            <el-timeline-item
              v-for="(item, index) in focusedTicket.processLogs"
              :key="index"
              :timestamp="item.time"
              :type="item.type"
              placement="top"
            >
              {{ item.content }}
              <br />
              <span style="color: var(--zg-ink-tertiary);">处置人：{{ item.user }}</span>
            </el-timeline-item>
          </el-timeline>
        </div>

        <div class="zg-inspector__actions">
          <el-button size="large" @click="deskInspector.closeInspector()">关闭</el-button>
          <el-button
            v-if="focusedTicket.status === '待处理'"
            type="primary"
            size="large"
            @click="onAcceptTicket(focusedTicket)"
          >
            接单
          </el-button>
          <el-button
            v-if="focusedTicket.status === '处理中'"
            type="success"
            size="large"
            @click="onCompleteTicket(focusedTicket)"
          >
            完成工单
          </el-button>
        </div>
      </div>
    </el-drawer>
  </section>
</template>

<script setup>
/**
 * 智光云枢 · 运维工单 · 我的工作台
 * 业务域：opsTicket
 * 功能：运维人员工单处置工作台，支持待办/处理中/已办工单管理与流转
 * @module opsTicket/MyDesk
 * @author 智光云枢研发团队
 */
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  UserFilled,
  Tickets,
  Grid,
  List,
  Search,
  RefreshLeft
} from '@element-plus/icons-vue'
import { usePresetTable } from '@/shared/composables/usePresetTable'
import { useDrawerInspector } from '@/shared/composables/useDrawerInspector'

// ---- 初始 mock 数据池 ----
const initialTickets = [
  {
    id: 1,
    no: 1,
    code: 'WO20260703001',
    title: '先导路LED路灯故障修复',
    type: '维修工单',
    priority: '紧急',
    status: '待处理',
    creator: '张三',
    createdAt: '2026-07-01 09:30:00',
    deadline: '2026-07-03 18:00:00',
    description: '先导路与岳麓大道交叉口LED路灯不亮，需要检查线路及灯具状态',
    processLogs: [
      { time: '2026-07-01 09:30:00', content: '工单创建', user: '张三', type: 'primary' }
    ]
  },
  {
    id: 2,
    no: 2,
    code: 'WO20260703002',
    title: '岳麓大道配电柜巡检',
    type: '巡检工单',
    priority: '高',
    status: '待处理',
    creator: '李四',
    createdAt: '2026-07-02 10:00:00',
    deadline: '2026-07-05 18:00:00',
    description: '岳麓大道全线配电柜月度巡检，需检查设备运行状态、接线情况及安全防护',
    processLogs: [
      { time: '2026-07-02 10:00:00', content: '工单创建', user: '李四', type: 'primary' }
    ]
  },
  {
    id: 3,
    no: 3,
    code: 'WO20260703003',
    title: '湘江路新建路灯安装',
    type: '安装工单',
    priority: '中',
    status: '处理中',
    creator: '王五',
    createdAt: '2026-06-28 14:00:00',
    deadline: '2026-07-04 18:00:00',
    description: '湘江路北段新建5盏路灯安装调试，包含灯具安装、线路敷设及调试验收',
    processLogs: [
      { time: '2026-06-28 14:00:00', content: '工单创建', user: '王五', type: 'primary' },
      { time: '2026-06-29 09:00:00', content: '已接单，开始处理', user: '当前用户', type: 'warning' },
      { time: '2026-06-30 16:00:00', content: '完成灯具安装，进行线路敷设', user: '当前用户', type: 'success' }
    ]
  },
  {
    id: 4,
    no: 4,
    code: 'WO20260703004',
    title: '天心区景观照明维护',
    type: '维修工单',
    priority: '高',
    status: '处理中',
    creator: '赵六',
    createdAt: '2026-06-30 08:00:00',
    deadline: '2026-07-03 12:00:00',
    description: '天心区核心商圈景观照明系统故障排查与修复',
    processLogs: [
      { time: '2026-06-30 08:00:00', content: '工单创建', user: '赵六', type: 'primary' },
      { time: '2026-06-30 10:30:00', content: '已接单，开始处理', user: '当前用户', type: 'warning' }
    ]
  },
  {
    id: 5,
    no: 5,
    code: 'WO20260703005',
    title: '开福区智能控制器升级',
    type: '安装工单',
    priority: '中',
    status: '已完成',
    creator: '孙七',
    createdAt: '2026-06-25 11:00:00',
    deadline: '2026-06-30 18:00:00',
    description: '开福区路灯智能控制器批量升级换代',
    processLogs: [
      { time: '2026-06-25 11:00:00', content: '工单创建', user: '孙七', type: 'primary' },
      { time: '2026-06-26 09:00:00', content: '已接单，开始处理', user: '当前用户', type: 'warning' },
      { time: '2026-06-29 17:00:00', content: '升级完成，验收合格', user: '当前用户', type: 'success' }
    ]
  },
  {
    id: 6,
    no: 6,
    code: 'WO20260703006',
    title: '雨花区路灯电缆更换',
    type: '维修工单',
    priority: '紧急',
    status: '已完成',
    creator: '周八',
    createdAt: '2026-06-20 16:00:00',
    deadline: '2026-06-22 18:00:00',
    description: '雨花区韶山路路段地下电缆老化更换工程',
    processLogs: [
      { time: '2026-06-20 16:00:00', content: '工单创建', user: '周八', type: 'primary' },
      { time: '2026-06-20 17:30:00', content: '已接单，开始处理', user: '当前用户', type: 'warning' },
      { time: '2026-06-22 15:00:00', content: '电缆更换完毕，通电测试正常', user: '当前用户', type: 'success' }
    ]
  },
  {
    id: 7,
    no: 7,
    code: 'WO20260703007',
    title: '芙蓉区照明设施检修',
    type: '巡检工单',
    priority: '低',
    status: '已关闭',
    creator: '吴九',
    createdAt: '2026-06-15 08:30:00',
    deadline: '2026-06-18 18:00:00',
    description: '芙蓉区主干道照明设施季度检修',
    processLogs: [
      { time: '2026-06-15 08:30:00', content: '工单创建', user: '吴九', type: 'primary' },
      { time: '2026-06-15 10:00:00', content: '已接单，开始处理', user: '当前用户', type: 'warning' },
      { time: '2026-06-17 16:00:00', content: '检修完成，设备运行正常', user: '当前用户', type: 'success' }
    ]
  },
  {
    id: 8,
    no: 8,
    code: 'WO20260703008',
    title: '望城区节能灯具更换',
    type: '安装工单',
    priority: '中',
    status: '已关闭',
    creator: '郑十',
    createdAt: '2026-06-10 09:00:00',
    deadline: '2026-06-15 18:00:00',
    description: '望城区金星路节能LED灯具批量更换',
    processLogs: [
      { time: '2026-06-10 09:00:00', content: '工单创建', user: '郑十', type: 'primary' },
      { time: '2026-06-11 08:00:00', content: '已接单，开始处理', user: '当前用户', type: 'warning' },
      { time: '2026-06-14 17:30:00', content: '更换完毕，节能效果达标', user: '当前用户', type: 'success' }
    ]
  }
]

// ---- 表格数据容器（usePresetTable） ----
const deskCtl = usePresetTable(null, {
  defaultPageSpan: 10,
  initialData: initialTickets.filter(t => t.status === '已完成' || t.status === '已关闭')
})

// ---- 详情抽屉容器（useDrawerInspector） ----
const deskInspector = useDrawerInspector({ size: '680px', direction: 'rtl' })

// ---- 聚焦工单 ----
const focusedTicket = computed(() => deskInspector.focusedRecord)

// ---- 概览指标派生 ----
const pendingCount = computed(
  () => initialTickets.filter(t => t.status === '待处理').length
)
const processingCount = computed(
  () => initialTickets.filter(t => t.status === '处理中').length
)
const completedCount = computed(
  () => initialTickets.filter(t => t.status === '已完成').length
)
const closedCount = computed(
  () => initialTickets.filter(t => t.status === '已关闭').length
)

// ---- 待办工单列表 ----
const pendingTickets = computed(
  () => initialTickets.filter(t => t.status === '待处理')
)

// ---- 处理中工单列表 ----
const processingTickets = computed(
  () => initialTickets.filter(t => t.status === '处理中')
)

// ---- 工具方法 ----
const getTypeTagType = (type) => {
  const types = { '维修工单': 'danger', '巡检工单': 'info', '安装工单': 'success' }
  return types[type] || ''
}

const getPriorityType = (priority) => {
  const types = { '紧急': 'danger', '高': 'warning', '中': 'info', '低': 'success' }
  return types[priority] || ''
}

const getStatusClass = (status) => {
  const classes = { '待处理': 'zg-status--danger', '处理中': 'zg-status--warn', '已完成': 'zg-status--ok', '已关闭': 'zg-status--info' }
  return classes[status] || ''
}

/**
 * 刷新待办列表
 */
const onRefreshPending = () => {
  ElMessage.success('待办工单列表已刷新')
}

/**
 * 接单：将工单状态流转为处理中
 * @param {Object} ticket 目标工单
 */
const onAcceptTicket = (ticket) => {
  ElMessageBox.confirm(
    `确认接收工单「${ticket.code}」？`,
    '接单确认',
    { type: 'info' }
  )
    .then(() => {
      const idx = initialTickets.findIndex(t => t.id === ticket.id)
      if (idx !== -1) {
        initialTickets[idx].status = '处理中'
        initialTickets[idx].processLogs.push({
          time: new Date().toLocaleString(),
          content: '已接单，开始处理',
          user: '当前用户',
          type: 'warning'
        })
      }
      deskInspector.closeInspector()
      ElMessage.success('工单已接收，请及时处置')
    })
    .catch(() => {})
}

/**
 * 处理工单：记录处理过程
 * @param {Object} ticket 目标工单
 */
const onProcessTicket = (ticket) => {
  deskInspector.openInspector(ticket)
}

/**
 * 完成工单：将工单状态流转为已完成
 * @param {Object} ticket 目标工单
 */
const onCompleteTicket = (ticket) => {
  ElMessageBox.confirm(
    `确认完成工单「${ticket.code}」？`,
    '完成确认',
    { type: 'success' }
  )
    .then(() => {
      const idx = initialTickets.findIndex(t => t.id === ticket.id)
      if (idx !== -1) {
        initialTickets[idx].status = '已完成'
        initialTickets[idx].processLogs.push({
          time: new Date().toLocaleString(),
          content: '工单处置完成',
          user: '当前用户',
          type: 'success'
        })
        // 更新已办列表
        deskCtl.presetPlaybook = initialTickets.filter(
          t => t.status === '已完成' || t.status === '已关闭'
        )
      }
      deskInspector.closeInspector()
      ElMessage.success('工单已完成')
    })
    .catch(() => {})
}

/**
 * 查看详情：打开只读检视面板
 * @param {Object} ticket 目标工单
 */
const onInspectTicket = (ticket) => {
  deskInspector.openInspector(ticket)
}
</script>

<style scoped lang="scss">
.zg-mydesk {
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

  &__section {
    margin-bottom: 24px;
  }

  &__section-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14px;
  }

  &__section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    font-weight: 600;
    color: var(--zg-ink-primary);
    margin: 0;
  }

  &__section-badge {
    font-style: normal;
    font-size: 12px;
    padding: 2px 8px;
    background: var(--zg-brand-tint-50);
    color: var(--zg-brand-primary);
    border-radius: var(--zg-radius-pill);
  }

  &__section-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__filter-select {
    width: 120px;
  }

  &__filter-input {
    width: 200px;
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

    &--danger::before { background: var(--zg-danger); }
    &--warn::before { background: var(--zg-warning); }
    &--ok::before { background: var(--zg-success); }
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

.zg-ticketgrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
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
  gap: 12px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--zg-shadow-card-hover);
    border-color: var(--zg-line-brand);
  }

  &--pending {
    border-left: 3px solid var(--zg-danger);
  }

  &--processing {
    border-left: 3px solid var(--zg-warning);
  }

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
  }

  &__glyph {
    width: 32px;
    height: 32px;
    border-radius: var(--zg-radius-md);
    background: var(--zg-brand-tint-50);
    color: var(--zg-brand-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__code {
    font-size: 12px;
    color: var(--zg-ink-tertiary);
    font-family: monospace;
    flex: 1;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__title {
    font-size: 14px;
    font-weight: 600;
    color: var(--zg-ink-primary);
    margin: 0;
    line-height: 1.4;
  }

  &__desc {
    font-size: 12px;
    color: var(--zg-ink-tertiary);
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__meta {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  &__foot {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 10px;
    border-top: 1px dashed var(--zg-line-soft);
  }

  &__deadline {
    font-size: 12px;
    color: var(--zg-ink-placeholder);
  }

  &__actions {
    display: flex;
    gap: 6px;
  }
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

  &--danger {
    color: var(--zg-danger);
    background: var(--zg-danger-soft);
  }
  &--warn {
    color: var(--zg-warning);
    background: var(--zg-warning-soft);
  }
  &--ok {
    color: var(--zg-success);
    background: var(--zg-success-soft);
  }
  &--info {
    color: var(--zg-info);
    background: var(--zg-info-soft);
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

  &__content {
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
</style>