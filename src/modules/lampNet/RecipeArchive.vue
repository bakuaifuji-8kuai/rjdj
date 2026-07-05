<!--
  智光云枢 · 灯网监控 · 策略归档
  业务域：lampNet
  功能：灯网监控策略沉淀中心的归档管理与还原处置
        支持卡片/列表双视图、抽屉式详情、归档还原与批量清理
-->
<template>
  <section class="zg-archive">
    <!-- 页面头部：品牌徽标 + 标题 + 概览指标 -->
    <header class="zg-archive__head">
      <div class="zg-archive__headline">
        <div class="zg-archive__sigil">
          <el-icon :size="22"><DocumentChecked /></el-icon>
        </div>
        <div class="zg-archive__copy">
          <h1 class="zg-archive__title">策略归档</h1>
          <p class="zg-archive__sub">
            灯网监控策略沉淀中心 · 在役归档 {{ activeArchiveCount }} 条 ·
            已还原 {{ restoredArchiveCount }} 条 · 累计关联设备 {{ totalDeviceCount }} 台
          </p>
        </div>
      </div>
    </header>

    <!-- 概览指标卡 -->
    <div class="zg-metrics">
      <div class="zg-metrics__cell">
        <span class="zg-metrics__num">{{ archiveCtl.totalRows }}</span>
        <span class="zg-metrics__lbl">归档策略总数</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--ok">
        <span class="zg-metrics__num">{{ activeArchiveCount }}</span>
        <span class="zg-metrics__lbl">在役归档</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--warn">
        <span class="zg-metrics__num">{{ restoredArchiveCount }}</span>
        <span class="zg-metrics__lbl">已还原</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--info">
        <span class="zg-metrics__num">{{ totalDeviceCount }}</span>
        <span class="zg-metrics__lbl">关联设备</span>
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
          v-model="archiveCtl.statusBuckets"
          placeholder="归档状态"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="已归档" value="已归档" />
          <el-option label="已还原" value="已还原" />
        </el-select>
        <el-select
          v-model="archiveCtl.typeBucket"
          placeholder="策略类型"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="时间执行" value="time" />
          <el-option label="经纬度执行" value="coordinate" />
          <el-option label="计时执行" value="timer" />
        </el-select>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          class="zg-filterband__daterange"
        />
        <el-input
          v-model="archiveCtl.filterLexicon"
          placeholder="检索策略名称/动作"
          clearable
          class="zg-filterband__search"
          @keyup.enter="onArchiveFilterApply()"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="onArchiveFilterApply()">
          <el-icon><Search /></el-icon>
          <span>检索</span>
        </el-button>
        <el-button @click="onArchiveFilterReset()">
          <el-icon><RefreshLeft /></el-icon>
          <span>重置</span>
        </el-button>
      </div>
    </div>

    <!-- 批量操作条（列表视图下） -->
    <div v-if="densityMode === 'list' && selectedArchives.length" class="zg-batchband">
      <span class="zg-batchband__hint">已选 {{ selectedArchives.length }} 条归档记录</span>
      <el-button type="danger" size="small" @click="onBatchRetire()">批量删除</el-button>
    </div>

    <!-- 卡片视图 -->
    <div v-if="densityMode === 'card'" class="zg-cardgrid">
      <article
        v-for="archive in archiveCtl.pagedRows"
        :key="archive.id"
        class="zg-archivecard"
        :class="archive.status === '已归档' ? 'archived' : 'restored'"
        @click="archiveInspector.openInspector(archive)"
      >
        <div class="zg-archivecard__head">
          <div class="zg-archivecard__glyph">
            <el-icon :size="24"><DocumentChecked /></el-icon>
          </div>
          <span class="zg-status" :class="archive.status === '已归档' ? 'archived' : 'restored'">
            <i class="dot"></i>{{ archive.status }}
          </span>
        </div>
        <div class="zg-archivecard__body">
          <h3 class="zg-archivecard__name">{{ archive.name }}</h3>
          <p class="zg-archivecard__meta">{{ getTypeText(archive.type) }} · {{ getActionText(archive.action) }}</p>
          <div class="zg-archivecard__stats">
            <span class="zg-archivecard__stat">
              <em>{{ archive.deviceCount }}</em> 台设备
            </span>
            <span class="zg-archivecard__stat">
              <em>{{ archive.brightness }}</em>% 亮度
            </span>
            <span class="zg-archivecard__stat">
              <em>{{ archive.executeTime || '-' }}</em>
            </span>
          </div>
        </div>
        <div class="zg-archivecard__foot">
          <span class="zg-archivecard__time">{{ archive.archiveDate }}</span>
          <div class="zg-archivecard__actions">
            <el-button link type="primary" size="small" @click.stop="onRestoreArchive(archive)">
              <el-icon><RefreshRight /></el-icon>
              <span>还原</span>
            </el-button>
            <el-button link type="danger" size="small" @click.stop="onRetireArchive(archive)">删除</el-button>
          </div>
        </div>
      </article>
    </div>

    <!-- 列表视图 -->
    <div v-else class="zg-tablewrap">
      <el-table
        :data="archiveCtl.pagedRows"
        stripe
        class="zg-datatable"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="no" label="序号" width="60" align="center" />
        <el-table-column prop="name" label="策略名称" min-width="150" />
        <el-table-column label="策略类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type)" size="small">{{ getTypeText(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="执行动作" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getActionTag(row.action)" size="small">{{ getActionText(row.action) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="deviceCount" label="关联设备数" width="100" align="center" />
        <el-table-column label="归档状态" width="100" align="center">
          <template #default="{ row }">
            <span class="zg-status" :class="row.status === '已归档' ? 'archived' : 'restored'">
              <i class="dot"></i>{{ row.status }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="archiveDate" label="归档日期" width="120" />
        <el-table-column label="处置" width="240" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="archiveInspector.openInspector(row)">详情</el-button>
            <el-button type="warning" size="small" @click="onRestoreArchive(row)">还原</el-button>
            <el-button type="danger" size="small" @click="onRetireArchive(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页条 -->
    <div class="zg-pagerbar">
      <el-pagination
        v-model:current-page="archiveCtl.pagingCursor"
        v-model:page-size="archiveCtl.pageSpan"
        :total="archiveCtl.totalRows"
        :page-sizes="[10, 15, 20, 50, 100]"
        layout="prev, pager, next, jumper, ->, sizes, total"
        background
      />
    </div>

    <!-- 详情抽屉 -->
    <el-drawer
      v-model="archiveInspector.drawerOpen"
      :title="'归档详情 · ' + (focusedArchive?.name || '')"
      direction="rtl"
      size="680px"
    >
      <div v-if="focusedArchive" class="zg-inspector">
        <div class="zg-inspector__head">
          <div class="zg-inspector__glyph">
            <el-icon :size="36"><DocumentChecked /></el-icon>
          </div>
          <div class="zg-inspector__meta">
            <h2 class="zg-inspector__name">{{ focusedArchive.name }}</h2>
            <p class="zg-inspector__type">{{ getTypeText(focusedArchive.type) }} · {{ getActionText(focusedArchive.action) }}</p>
            <span class="zg-status" :class="focusedArchive.status === '已归档' ? 'archived' : 'restored'">
              <i class="dot"></i>{{ focusedArchive.status }}
            </span>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">基本档案</h4>
          <div class="zg-inspector__grid">
            <div class="zg-inspector__cell">
              <span class="lbl">策略类型</span>
              <span class="val">{{ getTypeText(focusedArchive.type) }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">执行动作</span>
              <span class="val">{{ getActionText(focusedArchive.action) }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">亮度设定</span>
              <span class="val">{{ focusedArchive.brightness }}%</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">执行时间</span>
              <span class="val">{{ focusedArchive.executeTime || '-' }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">生效区间</span>
              <span class="val">{{ focusedArchive.startDate }} ~ {{ focusedArchive.endDate }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">归档日期</span>
              <span class="val">{{ focusedArchive.archiveDate }}</span>
            </div>
            <div class="zg-inspector__cell" style="grid-column: span 2;">
              <span class="lbl">描述</span>
              <span class="val">{{ focusedArchive.description || '-' }}</span>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">统计概览</h4>
          <div class="zg-datagrid">
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">关联设备</div>
              <div class="zg-datacard__val">{{ focusedArchive.deviceCount }}<em>台</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">亮度设定</div>
              <div class="zg-datacard__val">{{ focusedArchive.brightness }}<em>%</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">策略状态</div>
              <div class="zg-datacard__val">{{ focusedArchive.enabled ? '在役' : '停用' }}<em></em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">归档天数</div>
              <div class="zg-datacard__val">{{ computeArchiveDays(focusedArchive.archiveDate) }}<em>天</em></div>
            </div>
          </div>
        </div>

        <div class="zg-inspector__actions">
          <el-button size="large" @click="archiveInspector.closeInspector()">关闭</el-button>
          <el-button
            type="warning"
            size="large"
            @click="onRestoreArchive(focusedArchive)"
          >
            <el-icon><RefreshRight /></el-icon>
            <span>还原策略</span>
          </el-button>
        </div>
      </div>
    </el-drawer>
  </section>
</template>

<script setup>
/**
 * 智光云枢 · 灯网监控 · 策略归档
 * 业务域：lampNet
 * 功能：灯网监控策略沉淀中心的归档管理与还原处置
 *        支持卡片/列表双视图、抽屉式详情、归档还原与批量清理
 * @module lampNet/RecipeArchive
 * @author 智光云枢研发团队
 */
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  DocumentChecked,
  Grid,
  List,
  Search,
  RefreshLeft,
  RefreshRight
} from '@element-plus/icons-vue'
import { usePresetTable } from '@/shared/composables/usePresetTable'
import { useDrawerInspector } from '@/shared/composables/useDrawerInspector'

// ---- 视图密度切换 ----
const densityMode = ref('card')

// ---- 日期范围 ----
const dateRange = ref([])

// ---- 列表多选 ----
const selectedArchives = ref([])

watch(densityMode, () => {
  selectedArchives.value = []
})

// ---- 初始 mock 数据池 ----
const initialArchives = [
  {
    id: 1,
    no: 1,
    name: '夜间节能模式',
    type: 'time',
    action: 'dim',
    brightness: 60,
    executeTime: '18:00',
    deviceCount: 50,
    enabled: true,
    status: '已归档',
    archiveDate: '2024-06-15',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    description: '工作日夜间降低亮度至60%'
  },
  {
    id: 2,
    no: 2,
    name: '全夜亮灯模式',
    type: 'time',
    action: 'on',
    brightness: 100,
    executeTime: '18:00',
    deviceCount: 30,
    enabled: true,
    status: '已归档',
    archiveDate: '2024-05-20',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    description: '周末全天保持全亮'
  },
  {
    id: 3,
    no: 3,
    name: '日出日落策略',
    type: 'coordinate',
    action: 'dim',
    brightness: 80,
    executeTime: '',
    deviceCount: 100,
    enabled: true,
    status: '已归档',
    archiveDate: '2024-04-10',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    description: '根据经纬度自动开关灯'
  },
  {
    id: 4,
    no: 4,
    name: '深夜间隔调光',
    type: 'timer',
    action: 'dim',
    brightness: 40,
    executeTime: '23:00',
    deviceCount: 20,
    enabled: false,
    status: '已归档',
    archiveDate: '2024-03-08',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    description: '深夜每30分钟调光一次'
  },
  {
    id: 5,
    no: 5,
    name: '节假日庆典',
    type: 'time',
    action: 'on',
    brightness: 100,
    executeTime: '18:00',
    deviceCount: 80,
    enabled: true,
    status: '已归档',
    archiveDate: '2024-02-01',
    startDate: '2024-02-01',
    endDate: '2024-02-29',
    description: '节假日期间全亮模式'
  },
  {
    id: 6,
    no: 6,
    name: '故障后恢复',
    type: 'coordinate',
    action: 'on',
    brightness: 100,
    executeTime: '',
    deviceCount: 50,
    enabled: true,
    status: '已还原',
    archiveDate: '2024-01-12',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    description: '日出时自动恢复所有光源'
  }
]

const rawArchivePool = JSON.parse(JSON.stringify(initialArchives))

// ---- 表格数据容器（usePresetTable） ----
const archiveCtl = usePresetTable(null, {
  defaultPageSpan: 15,
  initialData: initialArchives
})

// ---- 概览指标派生 ----
const activeArchiveCount = computed(
  () => archiveCtl.presetPlaybook.filter(a => a.enabled).length
)
const restoredArchiveCount = computed(
  () => archiveCtl.presetPlaybook.filter(a => a.status === '已还原').length
)
const totalDeviceCount = computed(
  () => archiveCtl.presetPlaybook.reduce((sum, a) => sum + (a.deviceCount || 0), 0)
)

// ---- 详情抽屉容器（useDrawerInspector） ----
const archiveInspector = useDrawerInspector({ size: '680px', direction: 'rtl' })
const focusedArchive = computed(() => archiveInspector.focusedRecord)

// ---- 类型/动作文本映射 ----
const getTypeText = (type) => {
  const map = { time: '时间执行', coordinate: '经纬度执行', timer: '计时执行' }
  return map[type] || type
}
const getTypeTag = (type) => {
  const map = { time: '', coordinate: 'success', timer: 'warning' }
  return map[type] || ''
}
const getActionText = (action) => {
  const map = { on: '开灯', off: '关灯', dim: '调光' }
  return map[action] || action
}
const getActionTag = (action) => {
  const map = { on: 'success', off: 'warning', dim: '' }
  return map[action] || ''
}

const computeArchiveDays = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime()
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
}

// ---- 过滤应用与重置 ----
const onArchiveFilterApply = () => {
  let rows = [...rawArchivePool]
  if (dateRange.value && dateRange.value.length === 2) {
    const [start, end] = dateRange.value
    rows = rows.filter(r => r.archiveDate >= start && r.archiveDate <= end)
  }
  archiveCtl.presetPlaybook = rows
  archiveCtl.onFilterApply()
}

const onArchiveFilterReset = () => {
  dateRange.value = []
  archiveCtl.presetPlaybook = [...rawArchivePool]
  archiveCtl.onFilterReset()
}

// ---- 列表选择变更 ----
const handleSelectionChange = (rows) => {
  selectedArchives.value = rows
}

/**
 * 还原归档策略：将已归档策略还原至在役库
 * @param {Object} archive 目标归档记录
 */
const onRestoreArchive = (archive) => {
  if (archive.status === '已还原') {
    ElMessage.warning('该策略已还原，无需重复操作')
    return
  }
  ElMessageBox.confirm(
    `确认将「${archive.name}」还原到在役策略库？`,
    '还原确认',
    { type: 'warning' }
  )
    .then(() => {
      archiveCtl.reviseRecord(archive.id, { status: '已还原', enabled: false })
      ElMessage.success(`「${archive.name}」已还原至在役策略库`)
    })
    .catch(() => {})
}

/**
 * 删除归档：二次确认后从归档台账中移除
 * @param {Object} archive 目标归档记录
 */
const onRetireArchive = (archive) => {
  ElMessageBox.confirm(
    `确定要将「${archive.name}」从归档台账中删除吗？`,
    '删除确认',
    { type: 'warning' }
  )
    .then(() => {
      archiveCtl.retireRecord(archive.id)
      selectedArchives.value = selectedArchives.value.filter(a => a.id !== archive.id)
      ElMessage.success('归档记录已删除')
    })
    .catch(() => {})
}

/**
 * 批量删除归档：对列表中选中的归档记录执行批量清理
 */
const onBatchRetire = () => {
  const count = selectedArchives.value.length
  if (!count) {
    ElMessage.warning('请先选择待删除的归档记录')
    return
  }
  ElMessageBox.confirm(
    `确定要批量删除选中的 ${count} 条归档记录吗？`,
    '批量删除确认',
    { type: 'warning' }
  )
    .then(() => {
      selectedArchives.value.forEach(a => archiveCtl.retireRecord(a.id))
      selectedArchives.value = []
      ElMessage.success(`已批量删除 ${count} 条归档记录`)
    })
    .catch(() => {})
}
</script>

<style scoped lang="scss">
.zg-archive {
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
  &__daterange { width: 240px; }
}

.zg-batchband {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding: 10px 14px;
  background: var(--zg-surface-card);
  border: 1px solid var(--zg-line-soft);
  border-radius: var(--zg-radius-md);

  &__hint {
    font-size: 13px;
    color: var(--zg-ink-secondary);
  }
}

.zg-cardgrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.zg-archivecard {
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

  &.archived {
    border-left: 3px solid var(--zg-brand-primary);
  }
  &.restored {
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
  &.archived {
    color: var(--zg-brand-primary);
    background: var(--zg-brand-tint-50);
  }
  &.restored {
    color: var(--zg-success);
    background: var(--zg-success-soft);
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
</style>
