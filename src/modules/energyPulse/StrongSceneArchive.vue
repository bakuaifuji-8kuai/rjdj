<!--
  智光云枢 · 能源脉动 · 强场景归档
  业务域：energyPulse
  功能：照明场景预案的归档台账管理
        支持卡片/列表双视图、抽屉式详情、还原与批量清退
-->
<template>
  <section class="zg-scenearchive">
    <!-- 页面头部：品牌徽标 + 标题 + 概览指标 -->
    <header class="zg-scenearchive__head">
      <div class="zg-scenearchive__headline">
        <div class="zg-scenearchive__sigil">
          <el-icon :size="22"><DocumentChecked /></el-icon>
        </div>
        <div class="zg-scenearchive__copy">
          <h1 class="zg-scenearchive__title">强场景归档</h1>
          <p class="zg-scenearchive__sub">
            照明场景预案归档中心 · 已归档 {{ archivedCount }} 条 ·
            已还原 {{ restoredCount }} 条 · 本月新增 {{ monthlyNewCount }} 条
          </p>
        </div>
      </div>
    </header>

    <!-- 概览指标卡 -->
    <div class="zg-metrics">
      <div class="zg-metrics__cell">
        <span class="zg-metrics__num">{{ archiveCtl.totalRows }}</span>
        <span class="zg-metrics__lbl">归档总数</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--ok">
        <span class="zg-metrics__num">{{ archivedCount }}</span>
        <span class="zg-metrics__lbl">已归档</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--info">
        <span class="zg-metrics__num">{{ restoredCount }}</span>
        <span class="zg-metrics__lbl">已还原</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--warn">
        <span class="zg-metrics__num">{{ monthlyNewCount }}</span>
        <span class="zg-metrics__lbl">本月新增</span>
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
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="起始日期"
          end-placeholder="截止日期"
          value-format="YYYY-MM-DD"
          class="zg-filterband__daterange"
        />
        <el-select
          v-model="archiveCtl.statusBuckets"
          placeholder="归档状态"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="已归档" value="已归档" />
          <el-option label="已还原" value="已还原" />
        </el-select>
        <el-input
          v-model="archiveCtl.filterLexicon"
          placeholder="检索预案名称/投递人员"
          clearable
          class="zg-filterband__search"
          @keyup.enter="archiveCtl.onFilterApply()"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="archiveCtl.onFilterApply()">
          <el-icon><Search /></el-icon>
          <span>检索</span>
        </el-button>
        <el-button @click="onFilterResetAll()">
          <el-icon><RefreshLeft /></el-icon>
          <span>重置</span>
        </el-button>
      </div>
    </div>

    <!-- 卡片视图 -->
    <div v-if="densityMode === 'card'" class="zg-cardgrid">
      <article
        v-for="arc in archiveCtl.pagedRows"
        :key="arc.id"
        class="zg-archivecard"
        :class="arc.status === '已归档' ? 'archived' : 'restored'"
        @click="archiveInspector.openInspector(arc)"
      >
        <div class="zg-archivecard__head">
          <div class="zg-archivecard__glyph">
            <el-icon :size="22"><DocumentChecked /></el-icon>
          </div>
          <span class="zg-status" :class="arc.status === '已归档' ? 'archived' : 'restored'">
            <i class="dot"></i>{{ arc.status }}
          </span>
        </div>
        <div class="zg-archivecard__body">
          <h3 class="zg-archivecard__name">{{ arc.archiveName }}</h3>
          <p class="zg-archivecard__meta">{{ arc.category }} · {{ arc.operator }}</p>
          <div class="zg-archivecard__stats">
            <span class="zg-archivecard__stat">
              <em>{{ arc.type }}</em>
            </span>
            <span class="zg-archivecard__stat">
              <em>{{ arc.deviceCount }}</em> 设备
            </span>
          </div>
        </div>
        <div class="zg-archivecard__foot">
          <span class="zg-archivecard__time">{{ arc.archiveTime }}</span>
          <div class="zg-archivecard__actions">
            <el-button
              v-if="arc.status === '已归档'"
              link
              type="primary"
              size="small"
              @click.stop="onRestoreArchive(arc)"
            >
              还原
            </el-button>
            <el-button link type="danger" size="small" @click.stop="onRetireArchive(arc)">
              删除
            </el-button>
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
        @selection-change="onSelectionChange"
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column prop="no" label="序号" width="60" align="center" />
        <el-table-column prop="archiveName" label="预案名称" min-width="180" />
        <el-table-column prop="category" label="场景分类" width="120" />
        <el-table-column prop="operator" label="投递人员" width="120" />
        <el-table-column prop="archiveTime" label="归档时间" width="170" />
        <el-table-column label="预案类型" width="110" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="row.type === '定时预案' ? 'primary' : 'success'">
              {{ row.type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="归档状态" width="100" align="center">
          <template #default="{ row }">
            <span class="zg-status" :class="row.status === '已归档' ? 'archived' : 'restored'">
              <i class="dot"></i>{{ row.status }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="deviceCount" label="关联设备" width="90" align="center" />
        <el-table-column label="处置" width="240" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="archiveInspector.openInspector(row)">
              详情
            </el-button>
            <el-button
              v-if="row.status === '已归档'"
              type="warning"
              size="small"
              @click="onRestoreArchive(row)"
            >
              还原
            </el-button>
            <el-button type="danger" size="small" @click="onRetireArchive(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="zg-batchbar">
        <el-button
          type="danger"
          size="small"
          :disabled="!selectedRows.length"
          @click="onBatchRetire"
        >
          <el-icon><RefreshRight /></el-icon>
          <span>批量清退</span>
        </el-button>
        <span class="zg-batchbar__hint">已选 {{ selectedRows.length }} 条</span>
      </div>
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
      :title="'归档详情 · ' + (focusedArchive?.archiveName || '')"
      direction="rtl"
      size="680px"
    >
      <div v-if="focusedArchive" class="zg-inspector">
        <div class="zg-inspector__head">
          <div class="zg-inspector__glyph">
            <el-icon :size="36"><DocumentChecked /></el-icon>
          </div>
          <div class="zg-inspector__meta">
            <h2 class="zg-inspector__name">{{ focusedArchive.archiveName }}</h2>
            <p class="zg-inspector__type">
              {{ focusedArchive.category }} · {{ focusedArchive.operator }}
            </p>
            <span
              class="zg-status"
              :class="focusedArchive.status === '已归档' ? 'archived' : 'restored'"
            >
              <i class="dot"></i>{{ focusedArchive.status }}
            </span>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">基本档案</h4>
          <div class="zg-inspector__grid">
            <div class="zg-inspector__cell">
              <span class="lbl">归档时间</span>
              <span class="val">{{ focusedArchive.archiveTime }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">投递人员</span>
              <span class="val">{{ focusedArchive.operator }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">预案类型</span>
              <span class="val">{{ focusedArchive.type }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">关联设备</span>
              <span class="val">{{ focusedArchive.deviceCount }} 台</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">场景备注</span>
              <span class="val">{{ focusedArchive.remark || '-' }}</span>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">投递履历</h4>
          <div class="zg-datagrid">
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">投递次数</div>
              <div class="zg-datacard__val">{{ focusedArchive.deployCount }}<em>次</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">成功次数</div>
              <div class="zg-datacard__val">{{ focusedArchive.successCount }}<em>次</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">最近投递</div>
              <div class="zg-datacard__val">{{ focusedArchive.lastDeploy || '-' }}</div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">场景分类</div>
              <div class="zg-datacard__val">{{ focusedArchive.category }}</div>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">设备清单</h4>
          <el-table :data="focusedArchive.devices" size="small" border>
            <el-table-column prop="no" label="序号" width="60" align="center" />
            <el-table-column prop="name" label="设备名称" min-width="140" />
            <el-table-column prop="location" label="安装位置" min-width="140" />
            <el-table-column label="状态" width="90" align="center">
              <template #default="{ row }">
                <span class="zg-status" :class="row.status === '在线' ? 'online' : 'offline'">
                  <i class="dot"></i>{{ row.status }}
                </span>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="zg-inspector__actions">
          <el-button size="large" @click="archiveInspector.closeInspector()">关闭</el-button>
          <el-button
            v-if="focusedArchive.status === '已归档'"
            type="warning"
            size="large"
            @click="onRestoreArchive(focusedArchive)"
          >
            还原场景
          </el-button>
        </div>
      </div>
    </el-drawer>
  </section>
</template>

<script setup>
/**
 * 智光云枢 · 能源脉动 · 强场景归档
 * 业务域：energyPulse
 * 功能：照明场景预案的归档台账管理
 * @module energyPulse/StrongSceneArchive
 * @author 智光云枢研发团队
 */
import { ref, computed } from 'vue'
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
const selectedRows = ref([])
const onSelectionChange = (rows) => {
  selectedRows.value = rows
}

// ---- 初始 mock 数据池 ----
const initialArchives = [
  {
    id: 1,
    no: 1,
    archiveName: '园区路灯照明',
    operator: 'tanrongfu',
    archiveTime: '2026-01-09 13:59:26',
    type: '光感预案',
    status: '已归档',
    category: '道路照明',
    deviceCount: 12,
    deployCount: 8,
    successCount: 8,
    lastDeploy: '2026-01-09 13:59:26',
    remark: '主干道双侧路灯组',
    devices: [
      { no: 1, name: '路灯A01', location: '先导路东段', status: '在线' },
      { no: 2, name: '路灯A02', location: '先导路中段', status: '在线' },
      { no: 3, name: '路灯A03', location: '先导路西段', status: '离线' }
    ]
  },
  {
    id: 2,
    no: 2,
    archiveName: '定时',
    operator: 'admin',
    archiveTime: '2026-01-05 11:33:52',
    type: '定时预案',
    status: '已归档',
    category: '景观照明',
    deviceCount: 6,
    deployCount: 15,
    successCount: 14,
    lastDeploy: '2026-01-05 11:33:52',
    remark: '每日定时开启',
    devices: []
  },
  {
    id: 3,
    no: 3,
    archiveName: '开关',
    operator: 'test08',
    archiveTime: '2025-05-08 11:17:53',
    type: '光感预案',
    status: '已还原',
    category: '园区照明',
    deviceCount: 4,
    deployCount: 3,
    successCount: 3,
    lastDeploy: '2025-05-08 11:17:53',
    remark: '',
    devices: []
  },
  {
    id: 4,
    no: 4,
    archiveName: '开关2',
    operator: 'test08',
    archiveTime: '2025-05-08 10:26:38',
    type: '定时预案',
    status: '已归档',
    category: '园区照明',
    deviceCount: 4,
    deployCount: 5,
    successCount: 5,
    lastDeploy: '2025-05-08 10:26:38',
    remark: '',
    devices: []
  },
  {
    id: 5,
    no: 5,
    archiveName: '开关2',
    operator: 'test08',
    archiveTime: '2025-05-08 09:57:31',
    type: '定时预案',
    status: '已归档',
    category: '园区照明',
    deviceCount: 4,
    deployCount: 2,
    successCount: 2,
    lastDeploy: '2025-05-08 09:57:31',
    remark: '',
    devices: []
  },
  {
    id: 6,
    no: 6,
    archiveName: '开关2',
    operator: 'test08',
    archiveTime: '2025-05-07 18:28:36',
    type: '光感预案',
    status: '已还原',
    category: '园区照明',
    deviceCount: 4,
    deployCount: 4,
    successCount: 4,
    lastDeploy: '2025-05-07 18:28:36',
    remark: '',
    devices: []
  },
  {
    id: 7,
    no: 7,
    archiveName: '开关',
    operator: 'test08',
    archiveTime: '2025-05-07 17:41:50',
    type: '光感预案',
    status: '已归档',
    category: '园区照明',
    deviceCount: 4,
    deployCount: 6,
    successCount: 6,
    lastDeploy: '2025-05-07 17:41:50',
    remark: '',
    devices: []
  },
  {
    id: 8,
    no: 8,
    archiveName: '开关',
    operator: 'test08',
    archiveTime: '2025-05-07 11:09:09',
    type: '光感预案',
    status: '已归档',
    category: '园区照明',
    deviceCount: 4,
    deployCount: 3,
    successCount: 3,
    lastDeploy: '2025-05-07 11:09:09',
    remark: '',
    devices: []
  },
  {
    id: 9,
    no: 9,
    archiveName: '开关2',
    operator: 'test08',
    archiveTime: '2025-05-07 11:08:53',
    type: '定时预案',
    status: '已还原',
    category: '园区照明',
    deviceCount: 4,
    deployCount: 2,
    successCount: 2,
    lastDeploy: '2025-05-07 11:08:53',
    remark: '',
    devices: []
  },
  {
    id: 10,
    no: 10,
    archiveName: '开关',
    operator: 'test08',
    archiveTime: '2025-05-07 10:43:24',
    type: '光感预案',
    status: '已归档',
    category: '园区照明',
    deviceCount: 4,
    deployCount: 7,
    successCount: 7,
    lastDeploy: '2025-05-07 10:43:24',
    remark: '',
    devices: []
  },
  {
    id: 11,
    no: 11,
    archiveName: '开关2',
    operator: 'test08',
    archiveTime: '2025-05-06 18:19:53',
    type: '定时预案',
    status: '已归档',
    category: '园区照明',
    deviceCount: 4,
    deployCount: 1,
    successCount: 1,
    lastDeploy: '2025-05-06 18:19:53',
    remark: '',
    devices: []
  },
  {
    id: 12,
    no: 12,
    archiveName: '开关2',
    operator: 'test08',
    archiveTime: '2025-05-06 16:09:25',
    type: '定时预案',
    status: '已归档',
    category: '园区照明',
    deviceCount: 4,
    deployCount: 2,
    successCount: 2,
    lastDeploy: '2025-05-06 16:09:25',
    remark: '',
    devices: []
  },
  {
    id: 13,
    no: 13,
    archiveName: '开关',
    operator: 'test08',
    archiveTime: '2025-05-06 16:07:33',
    type: '光感预案',
    status: '已还原',
    category: '园区照明',
    deviceCount: 4,
    deployCount: 5,
    successCount: 5,
    lastDeploy: '2025-05-06 16:07:33',
    remark: '',
    devices: []
  },
  {
    id: 14,
    no: 14,
    archiveName: '园区路灯照明',
    operator: 'test08',
    archiveTime: '2025-05-06 16:07:18',
    type: '光感预案',
    status: '已归档',
    category: '道路照明',
    deviceCount: 10,
    deployCount: 9,
    successCount: 9,
    lastDeploy: '2025-05-06 16:07:18',
    remark: '辅道单侧灯组',
    devices: []
  },
  {
    id: 15,
    no: 15,
    archiveName: '测试',
    operator: 'test08',
    archiveTime: '2024-11-19 15:02:00',
    type: '定时预案',
    status: '已归档',
    category: '测试场景',
    deviceCount: 2,
    deployCount: 1,
    successCount: 0,
    lastDeploy: '2024-11-19 15:02:00',
    remark: '仅用于联调测试',
    devices: []
  }
]

// ---- 表格数据容器（usePresetTable） ----
const archiveCtl = usePresetTable(null, {
  defaultPageSpan: 15,
  initialData: initialArchives
})

// ---- 概览指标派生 ----
const archivedCount = computed(
  () => archiveCtl.presetPlaybook.filter(a => a.status === '已归档').length
)
const restoredCount = computed(
  () => archiveCtl.presetPlaybook.filter(a => a.status === '已还原').length
)
const monthlyNewCount = computed(() => {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  return archiveCtl.presetPlaybook.filter(a => {
    const d = new Date(a.archiveTime)
    return d.getFullYear() === y && d.getMonth() === m
  }).length
})

// ---- 详情抽屉容器（useDrawerInspector） ----
const archiveInspector = useDrawerInspector({ size: '680px', direction: 'rtl' })
const focusedArchive = computed(() => archiveInspector.focusedRecord)

/**
 * 统一重置：过滤条件 + 日期范围
 */
const onFilterResetAll = () => {
  dateRange.value = []
  archiveCtl.onFilterReset()
}

/**
 * 还原归档场景：将已归档记录还原为可投运状态
 * @param {Object} arc 目标归档记录
 */
const onRestoreArchive = (arc) => {
  ElMessageBox.confirm(
    `确认将「${arc.archiveName}」还原为可投运场景？`,
    '还原确认',
    { type: 'warning' }
  )
    .then(() => {
      archiveCtl.reviseRecord(arc.id, { status: '已还原' })
      ElMessage.success(`场景「${arc.archiveName}」已还原，可重新投递`)
    })
    .catch(() => {})
}

/**
 * 删除归档：二次确认后从台账中移除单条记录
 * @param {Object} arc 目标归档记录
 */
const onRetireArchive = (arc) => {
  ElMessageBox.confirm(
    `确定要将「${arc.archiveName}」从归档台账中删除吗？`,
    '删除确认',
    { type: 'warning' }
  )
    .then(() => {
      archiveCtl.retireRecord(arc.id)
      ElMessage.success('归档记录已删除，台账已同步')
    })
    .catch(() => {})
}

/**
 * 批量清退：对列表视图多选记录执行批量删除
 */
const onBatchRetire = () => {
  const rows = selectedRows.value
  if (!rows.length) {
    ElMessage.warning('请至少选择一条归档记录')
    return
  }
  ElMessageBox.confirm(
    `确定批量删除选中的 ${rows.length} 条归档记录？`,
    '批量清退确认',
    { type: 'warning' }
  )
    .then(() => {
      rows.forEach(r => archiveCtl.retireRecord(r.id))
      selectedRows.value = []
      ElMessage.success('批量清退已完成，台账已同步')
    })
    .catch(() => {})
}
</script>

<style scoped lang="scss">
.zg-scenearchive {
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
  &__daterange { width: 260px; }
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

.zg-batchbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed var(--zg-line-soft);

  &__hint {
    font-size: 12px;
    color: var(--zg-ink-tertiary);
  }
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
  &.archived {
    color: var(--zg-brand-primary);
    background: var(--zg-brand-tint-100);
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
