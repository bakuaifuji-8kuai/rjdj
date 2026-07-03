<!--
  智光云枢 · 运维工单 · 统计看板
  业务域：opsTicket
  功能：运维工单全域态势的周期统计与绩效洞察
        支持概览指标、趋势分析、类型分布、绩效排行与抽屉式详情
-->
<template>
  <section class="zg-statboard">
    <!-- 页面头部：品牌徽标 + 标题 + 时间范围选择器 -->
    <header class="zg-statboard__head">
      <div class="zg-statboard__headline">
        <div class="zg-statboard__sigil">
          <el-icon :size="22"><DataBoard /></el-icon>
        </div>
        <div class="zg-statboard__copy">
          <h1 class="zg-statboard__title">工单统计看板</h1>
          <p class="zg-statboard__sub">运维工单全域态势 · 周期统计与绩效洞察</p>
        </div>
      </div>
      <div class="zg-statboard__cta">
        <el-date-picker
          v-model="periodRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 260px"
        />
        <el-button type="primary" @click="onChangePeriod">
          <el-icon><Search /></el-icon>
          <span>查询</span>
        </el-button>
        <el-button @click="onExportReport">
          <el-icon><Download /></el-icon>
          <span>导出报表</span>
        </el-button>
      </div>
    </header>

    <!-- 概览指标卡 -->
    <div class="zg-metrics">
      <div class="zg-metrics__cell">
        <span class="zg-metrics__num">{{ statCtl.totalRows }}</span>
        <span class="zg-metrics__lbl">工单总数</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--ok">
        <span class="zg-metrics__num">{{ completionRate }}<em>%</em></span>
        <span class="zg-metrics__lbl">完成率</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--warn">
        <span class="zg-metrics__num">{{ avgHandleDuration }}<em>h</em></span>
        <span class="zg-metrics__lbl">平均处理时长</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--info">
        <span class="zg-metrics__num">{{ avgSatisfaction }}</span>
        <span class="zg-metrics__lbl">满意度</span>
      </div>
    </div>

    <!-- Dashboard 上排：趋势 + 类型分布 -->
    <div class="zg-dashboard">
      <div class="zg-panel">
        <div class="zg-panel__head">
          <el-icon><Calendar /></el-icon>
          <span>工单趋势</span>
        </div>
        <div class="zg-trendchart">
          <div
            v-for="bar in trendBreakdown"
            :key="bar.period"
            class="zg-trendchart__barwrap"
          >
            <div class="zg-trendchart__track">
              <div
                class="zg-trendchart__bar"
                :style="{ height: bar.pct + '%' }"
              ></div>
            </div>
            <span class="zg-trendchart__lbl">{{ bar.period }}</span>
            <span class="zg-trendchart__val">{{ bar.count }}</span>
          </div>
        </div>
      </div>

      <div class="zg-panel">
        <div class="zg-panel__head">
          <el-icon><DataBoard /></el-icon>
          <span>工单类型分布</span>
        </div>
        <div class="zg-breakdown">
          <div
            v-for="item in categoryBreakdown"
            :key="item.category"
            class="zg-breakdown__row"
          >
            <span class="zg-breakdown__cat">{{ item.category }}</span>
            <span class="zg-breakdown__cnt">{{ item.count }}</span>
            <div class="zg-breakdown__track">
              <div
                class="zg-breakdown__fill"
                :style="{ width: item.percentage + '%', background: item.tone }"
              ></div>
            </div>
            <span class="zg-breakdown__pct">{{ item.percentage }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Dashboard 下排：绩效排行 + 近期工单 -->
    <div class="zg-dashboard">
      <div class="zg-panel">
        <div class="zg-panel__head">
          <el-icon><Top /></el-icon>
          <span>处理人员绩效排行</span>
        </div>
        <div class="zg-leaderboard">
          <div
            v-for="item in handlerBreakdown"
            :key="item.handler"
            class="zg-leaderboard__row"
          >
            <span
              class="zg-leaderboard__rank"
              :class="{ 'is-top3': item.rank <= 3 }"
            >{{ item.rank }}</span>
            <span class="zg-leaderboard__name">{{ item.handler }}</span>
            <span class="zg-leaderboard__metric">{{ item.completed }} / {{ item.count }}</span>
            <span class="zg-leaderboard__avg">{{ item.avgDuration }}h</span>
          </div>
        </div>
      </div>

      <div class="zg-panel">
        <div class="zg-panel__head">
          <el-icon><Bottom /></el-icon>
          <span>近期工单明细</span>
        </div>
        <el-table
          :data="statCtl.pagedRows"
          stripe
          class="zg-datatable"
          size="small"
          @row-click="onInspectTicket"
        >
          <el-table-column prop="no" label="序号" width="60" align="center" />
          <el-table-column prop="presetSn" label="工单编号" width="140" />
          <el-table-column prop="name" label="工单标题" min-width="140" />
          <el-table-column prop="type" label="类型" width="100" />
          <el-table-column label="状态" width="90" align="center">
            <template #default="{ row }">
              <span
                class="zg-status"
                :class="row.status === '已完成' ? 'online' : row.status === '处理中' ? 'idle' : 'offline'"
              >
                <i class="dot"></i>{{ row.status }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="handler" label="处理人" width="90" align="center" />
          <el-table-column prop="createTime" label="创建时间" width="140" />
          <el-table-column label="操作" width="90" align="center">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click.stop="onInspectTicket(row)">
                详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="zg-pagerbar">
          <el-pagination
            v-model:current-page="statCtl.pagingCursor"
            v-model:page-size="statCtl.pageSpan"
            :total="statCtl.totalRows"
            :page-sizes="[5, 10, 15, 20]"
            layout="prev, pager, next, jumper, ->, sizes, total"
            background
          />
        </div>
      </div>
    </div>

    <!-- 工单详情抽屉 -->
    <el-drawer
      v-model="statInspector.drawerOpen"
      :title="'工单详情 · ' + (focusedTicket?.presetSn || '')"
      direction="rtl"
      size="680px"
    >
      <div v-if="focusedTicket" class="zg-inspector">
        <div class="zg-inspector__head">
          <div class="zg-inspector__glyph">
            <el-icon :size="36"><DataBoard /></el-icon>
          </div>
          <div class="zg-inspector__meta">
            <h2 class="zg-inspector__name">{{ focusedTicket.name }}</h2>
            <p class="zg-inspector__type">{{ focusedTicket.type }} · {{ focusedTicket.presetSn }}</p>
            <span
              class="zg-status"
              :class="focusedTicket.status === '已完成' ? 'online' : focusedTicket.status === '处理中' ? 'idle' : 'offline'"
            >
              <i class="dot"></i>{{ focusedTicket.status }}
            </span>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">工单档案</h4>
          <div class="zg-inspector__grid">
            <div class="zg-inspector__cell">
              <span class="lbl">创建人</span>
              <span class="val">{{ focusedTicket.creator }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">处理人</span>
              <span class="val">{{ focusedTicket.handler }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">创建时间</span>
              <span class="val">{{ focusedTicket.createTime }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">完成时间</span>
              <span class="val">{{ focusedTicket.finishTime || '-' }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">处理时长</span>
              <span class="val">{{ focusedTicket.duration > 0 ? focusedTicket.duration + ' h' : '-' }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">满意度</span>
              <span class="val">{{ focusedTicket.satisfaction > 0 ? focusedTicket.satisfaction + ' / 5.0' : '-' }}</span>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">备注信息</h4>
          <div class="zg-inspector__remark">
            {{ focusedTicket.remark || '暂无备注' }}
          </div>
        </div>

        <div class="zg-inspector__actions">
          <el-button size="large" @click="statInspector.closeInspector()">关闭</el-button>
        </div>
      </div>
    </el-drawer>
  </section>
</template>

<script setup>
/**
 * 智光云枢 · 运维工单 · 统计看板
 * 业务域：opsTicket
 * 功能：运维工单全域态势的周期统计与绩效洞察
 * @module opsTicket/StatBoard
 * @author 智光云枢研发团队
 */
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  DataBoard,
  Calendar,
  Search,
  Download,
  Top,
  Bottom
} from '@element-plus/icons-vue'
import { usePresetTable } from '@/shared/composables/usePresetTable'
import { useDrawerInspector } from '@/shared/composables/useDrawerInspector'

// ---- 统计周期 ----
const periodRange = ref(null)

// ---- 初始 mock 数据池 ----
const initialTickets = [
  { id: 1, no: 1, presetSn: 'WO-20240701001', name: '主路照明故障排查', type: '维修工单', priority: '高', status: '已完成', handler: '张工', creator: '李经理', createTime: '2024-07-01 09:00', finishTime: '2024-07-01 14:30', duration: 5.5, satisfaction: 5, remark: '已更换损坏灯具' },
  { id: 2, no: 2, presetSn: 'WO-20240701002', name: '辅路巡检任务', type: '巡检工单', priority: '中', status: '已完成', handler: '李工', creator: '王主管', createTime: '2024-07-01 10:00', finishTime: '2024-07-01 16:00', duration: 6.0, satisfaction: 4, remark: '' },
  { id: 3, no: 3, presetSn: 'WO-20240702001', name: '配电柜温度异常', type: '维修工单', priority: '紧急', status: '处理中', handler: '张工', creator: '李经理', createTime: '2024-07-02 08:30', finishTime: '', duration: 0, satisfaction: 0, remark: '待更换散热风扇' },
  { id: 4, no: 4, presetSn: 'WO-20240702002', name: '新建路段灯具安装', type: '安装工单', priority: '中', status: '已完成', handler: '王工', creator: '赵主任', createTime: '2024-07-02 09:00', finishTime: '2024-07-02 18:00', duration: 9.0, satisfaction: 5, remark: '' },
  { id: 5, no: 5, presetSn: 'WO-20240703001', name: '路灯控制箱检修', type: '维修工单', priority: '高', status: '待处理', handler: '赵工', creator: '李经理', createTime: '2024-07-03 08:00', finishTime: '', duration: 0, satisfaction: 0, remark: '' },
  { id: 6, no: 6, presetSn: 'WO-20240703002', name: '月度例行巡检', type: '巡检工单', priority: '低', status: '已完成', handler: '刘工', creator: '王主管', createTime: '2024-07-03 10:00', finishTime: '2024-07-03 15:00', duration: 5.0, satisfaction: 4, remark: '' },
  { id: 7, no: 7, presetSn: 'WO-20240704001', name: '景观灯线路故障', type: '维修工单', priority: '紧急', status: '已完成', handler: '张工', creator: '李经理', createTime: '2024-07-04 07:30', finishTime: '2024-07-04 11:00', duration: 3.5, satisfaction: 5, remark: '线路接头老化已修复' },
  { id: 8, no: 8, presetSn: 'WO-20240704002', name: '节能改造灯具更换', type: '安装工单', priority: '中', status: '处理中', handler: '李工', creator: '赵主任', createTime: '2024-07-04 09:00', finishTime: '', duration: 0, satisfaction: 0, remark: '' },
  { id: 9, no: 9, presetSn: 'WO-20240705001', name: '变压器异响排查', type: '维修工单', priority: '高', status: '已完成', handler: '王工', creator: '李经理', createTime: '2024-07-05 08:00', finishTime: '2024-07-05 17:00', duration: 9.0, satisfaction: 4, remark: '' },
  { id: 10, no: 10, presetSn: 'WO-20240705002', name: '电缆沟积水清理', type: '维修工单', priority: '中', status: '已完成', handler: '赵工', creator: '王主管', createTime: '2024-07-05 10:00', finishTime: '2024-07-05 14:00', duration: 4.0, satisfaction: 5, remark: '' },
  { id: 11, no: 11, presetSn: 'WO-20240706001', name: '智能控制器调试', type: '安装工单', priority: '低', status: '待处理', handler: '刘工', creator: '赵主任', createTime: '2024-07-06 09:00', finishTime: '', duration: 0, satisfaction: 0, remark: '' },
  { id: 12, no: 12, presetSn: 'WO-20240706002', name: '路灯杆倾斜校正', type: '维修工单', priority: '高', status: '已完成', handler: '张工', creator: '李经理', createTime: '2024-07-06 08:30', finishTime: '2024-07-06 12:30', duration: 4.0, satisfaction: 5, remark: '' }
]

// ---- 表格数据容器（usePresetTable） ----
const statCtl = usePresetTable(null, {
  defaultPageSpan: 10,
  initialData: initialTickets
})

// ---- 概览指标派生 ----
const completedTicketCount = computed(
  () => statCtl.presetPlaybook.filter(t => t.status === '已完成').length
)

const completionRate = computed(() => {
  const total = statCtl.totalRows
  return total ? Math.round((completedTicketCount.value / total) * 100) : 0
})

const avgHandleDuration = computed(() => {
  const done = statCtl.presetPlaybook.filter(t => t.status === '已完成' && t.duration > 0)
  if (!done.length) return '0.0'
  return (done.reduce((s, t) => s + t.duration, 0) / done.length).toFixed(1)
})

const avgSatisfaction = computed(() => {
  const done = statCtl.presetPlaybook.filter(t => t.status === '已完成' && t.satisfaction > 0)
  if (!done.length) return '0.0'
  return (done.reduce((s, t) => s + t.satisfaction, 0) / done.length).toFixed(1)
})

// ---- 工单趋势派生 ----
const trendBreakdown = computed(() => {
  const map = {}
  statCtl.presetPlaybook.forEach(t => {
    const day = t.createTime?.slice(5, 10) || '--'
    if (!map[day]) map[day] = { period: day, count: 0, completed: 0 }
    map[day].count++
    if (t.status === '已完成') map[day].completed++
  })
  const rows = Object.values(map).sort((a, b) => a.period.localeCompare(b.period))
  const max = Math.max(...rows.map(r => r.count), 1)
  return rows.map(r => ({ ...r, pct: Math.round((r.count / max) * 100) }))
})

// ---- 工单类型分布派生 ----
const categoryBreakdown = computed(() => {
  const map = {}
  statCtl.presetPlaybook.forEach(t => {
    map[t.type] = (map[t.type] || 0) + 1
  })
  const total = statCtl.totalRows || 1
  const tones = ['var(--zg-danger)', 'var(--zg-info)', 'var(--zg-success)', 'var(--zg-warning)']
  return Object.entries(map).map(([category, count], i) => ({
    category,
    count,
    percentage: Math.round((count / total) * 100),
    tone: tones[i % tones.length]
  }))
})

// ---- 处理人员绩效排行派生 ----
const handlerBreakdown = computed(() => {
  const map = {}
  statCtl.presetPlaybook.forEach(t => {
    if (!map[t.handler]) {
      map[t.handler] = { handler: t.handler, count: 0, completed: 0, totalDuration: 0, doneCount: 0 }
    }
    map[t.handler].count++
    if (t.status === '已完成') {
      map[t.handler].completed++
      if (t.duration > 0) {
        map[t.handler].totalDuration += t.duration
        map[t.handler].doneCount++
      }
    }
  })
  return Object.values(map)
    .map(h => ({
      rank: 0,
      handler: h.handler,
      count: h.count,
      completed: h.completed,
      avgDuration: h.doneCount ? (h.totalDuration / h.doneCount).toFixed(1) : '0.0'
    }))
    .sort((a, b) => b.completed - a.completed || parseFloat(a.avgDuration) - parseFloat(b.avgDuration))
    .map((h, i) => ({ ...h, rank: i + 1 }))
    .slice(0, 5)
})

// ---- 详情抽屉容器（useDrawerInspector） ----
const statInspector = useDrawerInspector({ size: '680px', direction: 'rtl' })
const focusedTicket = computed(() => statInspector.focusedRecord)

/**
 * 切换统计周期：应用时间过滤并刷新看板
 */
const onChangePeriod = () => {
  statCtl.onFilterApply()
  ElMessage.success('统计周期已更新，看板数据已刷新')
}

/**
 * 查看工单详情：打开抽屉加载目标工单
 * @param {Object} row 目标工单记录
 */
const onInspectTicket = (row) => {
  statInspector.openInspector(row)
}

/**
 * 导出报表：触发报表导出任务
 */
const onExportReport = () => {
  ElMessage.success('报表导出任务已下发，请至下载中心查收')
}
</script>

<style scoped lang="scss">
.zg-statboard {
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
    align-items: center;
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

    em {
      font-style: normal;
      font-size: 14px;
      color: var(--zg-ink-tertiary);
      margin-left: 4px;
      font-weight: 400;
    }
  }

  &__lbl {
    font-size: 12px;
    color: var(--zg-ink-tertiary);
  }
}

.zg-dashboard {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.zg-panel {
  background: var(--zg-surface-card);
  border: 1px solid var(--zg-line-soft);
  border-radius: var(--zg-radius-lg);
  padding: 16px;

  &__head {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    color: var(--zg-ink-secondary);
    margin-bottom: 14px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--zg-line-soft);
  }
}

.zg-trendchart {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 180px;
  padding: 10px 0;

  &__barwrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    flex: 1;
  }

  &__track {
    width: 24px;
    height: 140px;
    background: var(--zg-surface-muted);
    border-radius: var(--zg-radius-pill);
    position: relative;
    overflow: hidden;
  }

  &__bar {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    background: var(--zg-gradient-primary);
    border-radius: var(--zg-radius-pill);
    transition: height var(--zg-transition-normal);
    min-height: 4px;
  }

  &__lbl {
    font-size: 12px;
    color: var(--zg-ink-tertiary);
  }

  &__val {
    font-size: 12px;
    font-weight: 600;
    color: var(--zg-brand-primary);
  }
}

.zg-breakdown {
  display: flex;
  flex-direction: column;
  gap: 14px;

  &__row {
    display: grid;
    grid-template-columns: 90px 40px 1fr 50px;
    align-items: center;
    gap: 10px;
  }

  &__cat {
    font-size: 13px;
    color: var(--zg-ink-secondary);
  }

  &__cnt {
    font-size: 13px;
    font-weight: 600;
    color: var(--zg-ink-primary);
    text-align: right;
  }

  &__track {
    height: 8px;
    background: var(--zg-surface-muted);
    border-radius: var(--zg-radius-pill);
    overflow: hidden;
  }

  &__fill {
    height: 100%;
    border-radius: var(--zg-radius-pill);
    transition: width var(--zg-transition-normal);
  }

  &__pct {
    font-size: 12px;
    color: var(--zg-ink-tertiary);
    text-align: right;
  }
}

.zg-leaderboard {
  display: flex;
  flex-direction: column;
  gap: 10px;

  &__row {
    display: grid;
    grid-template-columns: 32px 1fr 80px 60px;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    background: var(--zg-surface-muted);
    border-radius: var(--zg-radius-md);
  }

  &__rank {
    width: 22px;
    height: 22px;
    border-radius: var(--zg-radius-pill);
    background: var(--zg-surface-card);
    color: var(--zg-ink-tertiary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 600;

    &.is-top3 {
      background: var(--zg-brand-primary);
      color: #fff;
    }
  }

  &__name {
    font-size: 14px;
    font-weight: 500;
    color: var(--zg-ink-primary);
  }

  &__metric {
    font-size: 12px;
    color: var(--zg-ink-tertiary);
    text-align: right;
  }

  &__avg {
    font-size: 12px;
    color: var(--zg-ink-tertiary);
    text-align: right;
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
  &.idle {
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

  &__remark {
    padding: 12px 14px;
    background: var(--zg-surface-muted);
    border-radius: var(--zg-radius-md);
    font-size: 14px;
    color: var(--zg-ink-secondary);
    line-height: 1.6;
    min-height: 60px;
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
