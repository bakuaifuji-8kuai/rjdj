<!--
  智光云枢 · 运维工单 · 处置单详情
  业务域：opsTicket
  功能：运维处置单详情展示、流程时间线、派发与完成操作
        支持派发抽屉选择处理人员、创建类似处置单
-->
<template>
  <section class="zg-ticketdetail">
    <!-- 页面头部：品牌徽标 + 标题 + 返回按钮 -->
    <header class="zg-ticketdetail__head">
      <div class="zg-ticketdetail__headline">
        <div class="zg-ticketdetail__sigil">
          <el-icon :size="22"><Tickets /></el-icon>
        </div>
        <div class="zg-ticketdetail__copy">
          <h1 class="zg-ticketdetail__title">处置单详情</h1>
          <p class="zg-ticketdetail__sub">运维工单 · {{ focusedTicket?.id || '' }}</p>
        </div>
      </div>
      <div class="zg-ticketdetail__cta">
        <el-button @click="goBackToList">
          <el-icon><ArrowLeft /></el-icon>
          <span>返回列表</span>
        </el-button>
      </div>
    </header>

    <!-- 订单标题区域：标题 + 标签组 -->
    <div v-if="focusedTicket" class="zg-ticketcard">
      <div class="zg-ticketcard__header">
        <div class="zg-ticketcard__title-row">
          <h2 class="zg-ticketcard__title">{{ focusedTicket.title }}</h2>
        </div>
        <div class="zg-ticketcard__tags">
          <el-tag :type="resolveTypeTag(focusedTicket.type)">
            {{ resolveTypeLabel(focusedTicket.type) }}
          </el-tag>
          <el-tag :type="resolvePriorityTag(focusedTicket.priority)">
            {{ resolvePriorityLabel(focusedTicket.priority) }}
          </el-tag>
          <el-tag :type="resolveStatusTag(focusedTicket.status)">
            {{ resolveStatusLabel(focusedTicket.status) }}
          </el-tag>
        </div>
      </div>
      <div class="zg-ticketcard__meta">
        <span class="zg-ticketcard__id">处置单编号: {{ focusedTicket.id }}</span>
      </div>
    </div>

    <!-- 详情网格：基本信息/位置信息/详细描述/时间信息 -->
    <div v-if="focusedTicket" class="zg-ticketdetail__grid">
      <!-- 基本信息 -->
      <article class="zg-ticketdetail__card">
        <div class="zg-ticketdetail__card-head">
          <el-icon :size="16"><User /></el-icon>
          <span class="zg-ticketdetail__card-title">基本信息</span>
        </div>
        <div class="zg-ticketdetail__card-body">
          <div class="zg-ticketdetail__row">
            <span class="zg-ticketdetail__lbl">处置单类型</span>
            <el-tag :type="resolveTypeTag(focusedTicket.type)">
              {{ resolveTypeLabel(focusedTicket.type) }}
            </el-tag>
          </div>
          <div class="zg-ticketdetail__row">
            <span class="zg-ticketdetail__lbl">优先级</span>
            <el-tag :type="resolvePriorityTag(focusedTicket.priority)">
              {{ resolvePriorityLabel(focusedTicket.priority) }}
            </el-tag>
          </div>
          <div class="zg-ticketdetail__row">
            <span class="zg-ticketdetail__lbl">当前状态</span>
            <el-tag :type="resolveStatusTag(focusedTicket.status)">
              {{ resolveStatusLabel(focusedTicket.status) }}
            </el-tag>
          </div>
          <div class="zg-ticketdetail__row">
            <span class="zg-ticketdetail__lbl">处理人员</span>
            <span class="zg-ticketdetail__val">{{ focusedTicket.assignee || '未分配' }}</span>
          </div>
        </div>
      </article>

      <!-- 位置信息 -->
      <article class="zg-ticketdetail__card">
        <div class="zg-ticketdetail__card-head">
          <el-icon :size="16"><MapLocation /></el-icon>
          <span class="zg-ticketdetail__card-title">位置信息</span>
        </div>
        <div class="zg-ticketdetail__card-body">
          <div class="zg-ticketdetail__row">
            <span class="zg-ticketdetail__lbl">地点</span>
            <span class="zg-ticketdetail__val">{{ focusedTicket.location }}</span>
          </div>
        </div>
      </article>

      <!-- 详细描述 -->
      <article class="zg-ticketdetail__card zg-ticketdetail__card--full">
        <div class="zg-ticketdetail__card-head">
          <span class="zg-ticketdetail__card-title">详细描述</span>
        </div>
        <div class="zg-ticketdetail__card-body">
          <div class="zg-ticketdetail__description">
            {{ focusedTicket.description }}
          </div>
        </div>
      </article>

      <!-- 时间信息 -->
      <article class="zg-ticketdetail__card">
        <div class="zg-ticketdetail__card-head">
          <el-icon :size="16"><Calendar /></el-icon>
          <span class="zg-ticketdetail__card-title">时间信息</span>
        </div>
        <div class="zg-ticketdetail__card-body">
          <div class="zg-ticketdetail__row">
            <span class="zg-ticketdetail__lbl">创建时间</span>
            <span class="zg-ticketdetail__val">{{ focusedTicket.createTime }}</span>
          </div>
          <div class="zg-ticketdetail__row">
            <span class="zg-ticketdetail__lbl">更新时间</span>
            <span class="zg-ticketdetail__val">{{ focusedTicket.updateTime }}</span>
          </div>
        </div>
      </article>
    </div>

    <!-- 流程时间线：处置单流程 -->
    <div v-if="focusedTicket" class="zg-ticketdetail__timeline">
      <div class="zg-ticketdetail__timeline-head">
        <span class="zg-ticketdetail__timeline-title">处置单流程</span>
      </div>
      <el-timeline>
        <el-timeline-item timestamp="创建">{{ focusedTicket.title }} 已创建，等待处理</el-timeline-item>
        <el-timeline-item v-if="focusedTicket.status !== 'pending'" timestamp="派发">
          处置单已派发给 {{ focusedTicket.assignee || '处理人员' }}
        </el-timeline-item>
        <el-timeline-item v-if="focusedTicket.status === 'completed'" timestamp="完成">处置单已完成</el-timeline-item>
      </el-timeline>
    </div>

    <!-- 操作按钮区域：派发/完成/创建类似 -->
    <div v-if="focusedTicket" class="zg-ticketdetail__actions">
      <el-button
        v-if="focusedTicket.status === 'pending'"
        type="primary"
        @click="onAssign"
      >
        <el-icon><User /></el-icon>
        <span>派发处置单</span>
      </el-button>
      <el-button
        v-if="focusedTicket.status === 'processing'"
        type="success"
        @click="onComplete"
      >
        <span>完成处置单</span>
      </el-button>
      <el-button @click="onCreateSimilar">
        <el-icon><Tickets /></el-icon>
        <span>创建类似处置单</span>
      </el-button>
    </div>

    <!-- 派发抽屉：选择处理人员 -->
    <el-drawer
      v-model="ticketInspector.drawerOpen"
      title="派发处置单"
      :size="ticketInspector.drawerSize.value"
      :direction="ticketInspector.drawerDirection.value"
    >
      <el-form :model="assignForm" label-width="96px" class="zg-ticketdetail__form">
        <el-form-item label="处理人员" required>
          <el-select v-model="assignForm.assignee" placeholder="请选择处理人员" style="width: 100%">
            <el-option label="张三" value="张三" />
            <el-option label="李四" value="李四" />
            <el-option label="王五" value="王五" />
            <el-option label="赵六" value="赵六" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="ticketInspector.closeInspector()">取消</el-button>
        <el-button type="primary" @click="confirmAssign">确认派发</el-button>
      </template>
    </el-drawer>
  </section>
</template>

<script setup>
/**
 * 智光云枢 · 运维工单 · 处置单详情
 * 业务域：opsTicket
 * 功能：运维处置单详情展示、流程时间线、派发与完成操作
 * @module opsTicket/TicketDetail
 * @author 智光云枢研发团队
 */
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Tickets,
  ArrowLeft,
  User,
  Calendar,
  MapLocation
} from '@element-plus/icons-vue'
import { useDrawerInspector } from '@/shared/composables/useDrawerInspector'

// ---- 路由实例 ----
const route = useRoute()
const router = useRouter()

// ---- 派发抽屉容器（useDrawerInspector） ----
const ticketInspector = useDrawerInspector({ size: '500px', direction: 'rtl' })

// ---- 初始 mock 数据池 ----
const initialTickets = [
  {
    id: 'WO-2024-001',
    title: '先导路1号馈电柜故障处置',
    type: 'fault',
    priority: 'high',
    status: 'pending',
    assignee: '',
    location: '长沙-岳麓区·先导路1号',
    description: '馈电柜主开关跳闸，需现场排查短路原因并恢复供电。经初步判断可能是线路老化导致，需携带万用表、绝缘测试仪等工具。',
    createTime: '2024-01-15 09:30:00',
    updateTime: '2024-01-15 09:30:00'
  },
  {
    id: 'WO-2024-002',
    title: '芙蓉路2号路灯维修',
    type: 'maintenance',
    priority: 'medium',
    status: 'processing',
    assignee: '张三',
    location: '长沙-天心区·芙蓉路2号',
    description: '路灯照明亮度不足，需检查镇流器和灯泡状态，必要时更换配件。',
    createTime: '2024-01-14 14:20:00',
    updateTime: '2024-01-14 16:00:00'
  },
  {
    id: 'WO-2024-003',
    title: '湘江路配电柜巡检',
    type: 'maintenance',
    priority: 'low',
    status: 'completed',
    assignee: '李四',
    location: '长沙-开福区·湘江路1号',
    description: '季度例行巡检，检查配电柜运行状态、温度、湿度等参数，记录异常情况。',
    createTime: '2024-01-10 08:00:00',
    updateTime: '2024-01-10 12:00:00'
  }
]

// ---- 当前聚焦的处置单 ----
const focusedTicket = ref(null)

// ---- 派发表单 ----
const assignForm = ref({ assignee: '' })

// ---- 初始化加载 ----
onMounted(() => {
  const id = route.params.id
  focusedTicket.value = initialTickets.find(t => t.id === id) || initialTickets[0]
})

/**
 * 返回列表页
 */
const goBackToList = () => {
  router.push('/workorder/list')
}

/**
 * 解析处置单类型标签样式
 * @param {string} type 类型值
 * @returns {string} 标签类型
 */
const resolveTypeTag = (type) => {
  switch (type) {
    case 'fault': return 'danger'
    case 'maintenance': return 'warning'
    default: return 'info'
  }
}

/**
 * 解析处置单类型显示标签
 * @param {string} type 类型值
 * @returns {string} 显示文本
 */
const resolveTypeLabel = (type) => {
  switch (type) {
    case 'fault': return '故障处置单'
    case 'maintenance': return '维修处置单'
    default: return type
  }
}

/**
 * 解析优先级标签样式
 * @param {string} priority 优先级值
 * @returns {string} 标签类型
 */
const resolvePriorityTag = (priority) => {
  switch (priority) {
    case 'high': return 'danger'
    case 'medium': return 'warning'
    case 'low': return 'success'
    default: return 'info'
  }
}

/**
 * 解析优先级显示文本
 * @param {string} priority 优先级值
 * @returns {string} 显示文本
 */
const resolvePriorityLabel = (priority) => {
  switch (priority) {
    case 'high': return '高优先级'
    case 'medium': return '中优先级'
    case 'low': return '低优先级'
    default: return priority
  }
}

/**
 * 解析状态标签样式
 * @param {string} status 状态值
 * @returns {string} 标签类型
 */
const resolveStatusTag = (status) => {
  switch (status) {
    case 'pending': return 'warning'
    case 'processing': return 'primary'
    case 'completed': return 'success'
    default: return 'info'
  }
}

/**
 * 解析状态显示文本
 * @param {string} status 状态值
 * @returns {string} 显示文本
 */
const resolveStatusLabel = (status) => {
  switch (status) {
    case 'pending': return '待处理'
    case 'processing': return '处理中'
    case 'completed': return '已完成'
    default: return status
  }
}

/**
 * 打开派发抽屉：准备派发处置单给处理人员
 */
const onAssign = () => {
  assignForm.value = { assignee: '' }
  ticketInspector.openInspector(focusedTicket.value)
}

/**
 * 完成处置单：二次确认后将状态变更为已完成
 */
const onComplete = () => {
  ElMessageBox.confirm(
    `确定要完成「${focusedTicket.value.title}」吗？`,
    '完成确认',
    { type: 'success' }
  )
    .then(() => {
      focusedTicket.value.status = 'completed'
      focusedTicket.value.updateTime = new Date().toLocaleString('zh-CN')
      ElMessage.success('处置单已完成')
    })
    .catch(() => {})
}

/**
 * 创建类似处置单：跳转到新建页面，携带当前工单信息
 */
const onCreateSimilar = () => {
  router.push('/workorder/create')
  ElMessage.info('正在创建类似处置单...')
}

/**
 * 确认派发：校验处理人员选择后更新工单状态
 */
const confirmAssign = () => {
  if (!assignForm.value.assignee) {
    ElMessage.warning('请选择处理人员')
    return
  }

  focusedTicket.value.assignee = assignForm.value.assignee
  focusedTicket.value.status = 'processing'
  focusedTicket.value.updateTime = new Date().toLocaleString('zh-CN')
  ElMessage.success('派发成功，处置单已进入处理状态')
  ticketInspector.closeInspector()
}
</script>

<style scoped lang="scss">
.zg-ticketdetail {
  padding: 24px;
  background: var(--zg-surface-page);

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

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
    margin-bottom: 20px;
  }

  &__card {
    background: var(--zg-surface-card);
    border: 1px solid var(--zg-line-soft);
    border-radius: var(--zg-radius-lg);
    padding: 18px;
    box-shadow: var(--zg-shadow-card);
    display: flex;
    flex-direction: column;
    gap: 14px;

    &--full {
      grid-column: 1 / -1;
    }
  }

  &__card-head {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--zg-line-soft);
  }

  &__card-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--zg-ink-secondary);
    padding-left: 6px;
    border-left: 3px solid var(--zg-brand-primary);
  }

  &__card-body {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 10px;
    background: var(--zg-surface-muted);
    border-radius: var(--zg-radius-md);
  }

  &__lbl {
    font-size: 12px;
    color: var(--zg-ink-tertiary);
  }

  &__val {
    font-size: 14px;
    color: var(--zg-ink-primary);
    font-weight: 500;
  }

  &__description {
    padding: 14px 16px;
    background: var(--zg-surface-muted);
    border-radius: var(--zg-radius-md);
    line-height: 1.7;
    color: var(--zg-ink-secondary);
    font-size: 14px;
  }

  &__timeline {
    background: var(--zg-surface-card);
    border: 1px solid var(--zg-line-soft);
    border-radius: var(--zg-radius-lg);
    padding: 18px;
    margin-bottom: 20px;
    box-shadow: var(--zg-shadow-card);
  }

  &__timeline-head {
    margin-bottom: 16px;
  }

  &__timeline-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--zg-ink-secondary);
    padding-left: 8px;
    border-left: 3px solid var(--zg-brand-primary);
  }

  &__actions {
    display: flex;
    gap: 12px;
    justify-content: center;
    padding-top: 16px;
    border-top: 1px solid var(--zg-line-soft);
  }

  &__form {
    padding: 8px 0;
  }
}

.zg-ticketcard {
  background: var(--zg-gradient-primary);
  border-radius: var(--zg-radius-lg);
  padding: 20px;
  margin-bottom: 20px;
  color: #fff;
  box-shadow: var(--zg-shadow-card);

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 14px;
  }

  &__title-row {
    flex: 1;
    min-width: 200px;
  }

  &__title {
    font-size: 22px;
    font-weight: 600;
    margin: 0;
    line-height: 1.3;
  }

  &__tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;

    :deep(.el-tag) {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.3);
      color: #fff;
      font-size: 12px;
    }
  }

  &__meta {
    padding-top: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
  }

  &__id {
    font-size: 13px;
    opacity: 0.9;
  }
}
</style>