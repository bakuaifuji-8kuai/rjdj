<!--
  智光云枢 · 能源脉动 · 线路追踪
  业务域：energyPulse
  功能：城市照明供电链路的追踪巡检与路径回溯
        支持卡片/列表双视图、抽屉式追踪结果、链路废止
-->
<template>
  <section class="zg-trace">
    <!-- 页面头部：品牌徽标 + 标题 + 概览指标 + 追踪入口 -->
    <header class="zg-trace__head">
      <div class="zg-trace__headline">
        <div class="zg-trace__sigil">
          <el-icon :size="22"><Guide /></el-icon>
        </div>
        <div class="zg-trace__copy">
          <h1 class="zg-trace__title">线路追踪</h1>
          <p class="zg-trace__sub">
            城市照明供电链路追踪 · 在役 {{ normalTraceCount }} 条正常 ·
            预警 {{ warnTraceCount }} 条 · 故障 {{ faultTraceCount }} 条
          </p>
        </div>
      </div>
      <div class="zg-trace__cta">
        <el-button type="primary" @click="onTraceLine()">
          <el-icon><Position /></el-icon>
          <span>追踪线路</span>
        </el-button>
      </div>
    </header>

    <!-- 概览指标卡 -->
    <div class="zg-metrics">
      <div class="zg-metrics__cell">
        <span class="zg-metrics__num">{{ traceCtl.totalRows }}</span>
        <span class="zg-metrics__lbl">线路总数</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--ok">
        <span class="zg-metrics__num">{{ normalTraceCount }}</span>
        <span class="zg-metrics__lbl">正常运行</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--warn">
        <span class="zg-metrics__num">{{ warnTraceCount }}</span>
        <span class="zg-metrics__lbl">预警线路</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--danger">
        <span class="zg-metrics__num">{{ faultTraceCount }}</span>
        <span class="zg-metrics__lbl">故障线路</span>
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
          v-model="traceCtl.statusBuckets"
          placeholder="运行状态"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="正常" value="正常" />
          <el-option label="预警" value="预警" />
          <el-option label="故障" value="故障" />
        </el-select>
        <el-select
          v-model="traceCtl.typeBucket"
          placeholder="所属区域"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="长沙-岳麓区" value="长沙-岳麓区" />
          <el-option label="长沙-天心区" value="长沙-天心区" />
          <el-option label="长沙-开福区" value="长沙-开福区" />
        </el-select>
        <el-input
          v-model="traceCtl.filterLexicon"
          placeholder="检索线路名称/起点/终点"
          clearable
          class="zg-filterband__search"
          @keyup.enter="traceCtl.onFilterApply()"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="traceCtl.onFilterApply()">
          <el-icon><Search /></el-icon>
          <span>检索</span>
        </el-button>
        <el-button @click="traceCtl.onFilterReset()">
          <el-icon><RefreshLeft /></el-icon>
          <span>重置</span>
        </el-button>
      </div>
    </div>

    <!-- 卡片视图 -->
    <div v-if="densityMode === 'card'" class="zg-cardgrid">
      <article
        v-for="trace in traceCtl.pagedRows"
        :key="trace.id"
        class="zg-tracecard"
        :class="getTraceStatusClass(trace.status)"
        @click="onInspectTraceResult(trace)"
      >
        <div class="zg-tracecard__head">
          <div class="zg-tracecard__glyph">
            <el-icon :size="24"><Guide /></el-icon>
          </div>
          <span class="zg-status" :class="getTraceStatusClass(trace.status)">
            <i class="dot"></i>{{ trace.status }}
          </span>
        </div>
        <div class="zg-tracecard__body">
          <h3 class="zg-tracecard__name">{{ trace.name }}</h3>
          <p class="zg-tracecard__route">{{ trace.startPoint }} → {{ trace.endPoint }}</p>
          <div class="zg-tracecard__stats">
            <span class="zg-tracecard__stat">
              <em>{{ trace.length }}</em> km
            </span>
            <span class="zg-tracecard__stat">
              <em>{{ trace.voltage }}</em>
            </span>
            <span class="zg-tracecard__stat">
              <em>{{ trace.current }}</em> A
            </span>
          </div>
        </div>
        <div class="zg-tracecard__foot">
          <span class="zg-tracecard__time">{{ trace.updateTime }}</span>
          <div class="zg-tracecard__actions">
            <el-button link type="primary" size="small" @click.stop="onTraceLine(trace)">
              <el-icon><Position /></el-icon>追踪
            </el-button>
            <el-button link type="primary" size="small" @click.stop="onInspectTraceResult(trace)">详情</el-button>
            <el-button link type="danger" size="small" @click.stop="onRetireTrace(trace)">废止</el-button>
          </div>
        </div>
      </article>
    </div>

    <!-- 列表视图 -->
    <div v-else class="zg-tablewrap">
      <el-table :data="traceCtl.pagedRows" stripe class="zg-datatable">
        <el-table-column prop="no" label="序号" width="60" align="center" />
        <el-table-column prop="area" label="所属区域" width="130" />
        <el-table-column prop="name" label="线路名称" min-width="150" />
        <el-table-column prop="startPoint" label="起点" width="130" />
        <el-table-column prop="endPoint" label="终点" width="130" />
        <el-table-column prop="length" label="长度(km)" width="100" align="center" />
        <el-table-column prop="voltage" label="电压等级" width="100" align="center" />
        <el-table-column label="运行状态" width="100" align="center">
          <template #default="{ row }">
            <span class="zg-status" :class="getTraceStatusClass(row.status)">
              <i class="dot"></i>{{ row.status }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="150" />
        <el-table-column label="处置" width="260" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="onInspectTraceResult(row)">详情</el-button>
            <el-button type="warning" size="small" @click="onTraceLine(row)">追踪</el-button>
            <el-button type="danger" size="small" @click="onRetireTrace(row)">废止</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页条 -->
    <div class="zg-pagerbar">
      <el-pagination
        v-model:current-page="traceCtl.pagingCursor"
        v-model:page-size="traceCtl.pageSpan"
        :total="traceCtl.totalRows"
        :page-sizes="[10, 15, 20, 50, 100]"
        layout="prev, pager, next, jumper, ->, sizes, total"
        background
      />
    </div>

    <!-- 线路追踪结果抽屉 -->
    <el-drawer
      v-model="traceInspector.drawerOpen"
      :title="'线路追踪结果 · ' + (focusedTrace?.name || '')"
      direction="rtl"
      size="680px"
    >
      <div v-if="focusedTrace" class="zg-inspector">
        <div class="zg-inspector__head">
          <div class="zg-inspector__glyph">
            <el-icon :size="36"><Guide /></el-icon>
          </div>
          <div class="zg-inspector__meta">
            <h2 class="zg-inspector__name">{{ focusedTrace.name }}</h2>
            <p class="zg-inspector__type">{{ focusedTrace.area }} · {{ focusedTrace.voltage }}</p>
            <span class="zg-status" :class="getTraceStatusClass(focusedTrace.status)">
              <i class="dot"></i>{{ focusedTrace.status }}
            </span>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">基本档案</h4>
          <div class="zg-inspector__grid">
            <div class="zg-inspector__cell">
              <span class="lbl">起点</span>
              <span class="val">{{ focusedTrace.startPoint }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">终点</span>
              <span class="val">{{ focusedTrace.endPoint }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">线路长度</span>
              <span class="val">{{ focusedTrace.length }} km</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">更新时间</span>
              <span class="val">{{ focusedTrace.updateTime }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">备注</span>
              <span class="val">{{ focusedTrace.remark || '-' }}</span>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">实时遥测</h4>
          <div class="zg-datagrid">
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">电流</div>
              <div class="zg-datacard__val">{{ focusedTrace.current }}<em>A</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">功率</div>
              <div class="zg-datacard__val">{{ focusedTrace.power }}<em>kW</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">温度</div>
              <div class="zg-datacard__val">{{ focusedTrace.temperature }}<em>°C</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">负载率</div>
              <div class="zg-datacard__val">{{ focusedTrace.loadRate || 0 }}<em>%</em></div>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">追踪路径</h4>
          <div class="zg-tracepath">
            <div
              v-for="(node, idx) in focusedTrace.tracePath"
              :key="idx"
              class="zg-tracepath__node"
            >
              <div class="zg-tracepath__dot" :class="{ 'zg-tracepath__dot--active': node.active }"></div>
              <div class="zg-tracepath__info">
                <span class="zg-tracepath__station">{{ node.station }}</span>
                <span class="zg-tracepath__meta">{{ node.voltage }}V · {{ node.current }}A</span>
              </div>
              <div v-if="idx < focusedTrace.tracePath.length - 1" class="zg-tracepath__bar"></div>
            </div>
          </div>
        </div>

        <div class="zg-inspector__actions">
          <el-button size="large" @click="traceInspector.closeInspector()">关闭</el-button>
          <el-button
            type="warning"
            size="large"
            @click="onTraceLine(focusedTrace)"
          >
            重新追踪
          </el-button>
        </div>
      </div>
    </el-drawer>
  </section>
</template>

<script setup>
/**
 * 智光云枢 · 能源脉动 · 线路追踪
 * 业务域：energyPulse
 * 功能：城市照明供电链路的追踪巡检与路径回溯
 * @module energyPulse/LineTrace
 * @author 智光云枢研发团队
 */
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Guide,
  Search,
  Grid,
  List,
  RefreshLeft,
  Position
} from '@element-plus/icons-vue'
import { usePresetTable } from '@/shared/composables/usePresetTable'
import { useDrawerInspector } from '@/shared/composables/useDrawerInspector'

// ---- 视图密度切换 ----
const densityMode = ref('card')

// ---- 初始 mock 数据池 ----
const initialTraces = [
  {
    id: 1,
    no: 1,
    area: '长沙-岳麓区',
    name: '先导路主线路',
    startPoint: '岳麓大道口',
    endPoint: '桐梓坡路口',
    length: 2.5,
    voltage: '10kV',
    status: '正常',
    updateTime: '2024-07-02 14:30:00',
    remark: '主供电线路',
    current: 45,
    power: 180,
    temperature: 35,
    loadRate: 36,
    tracePath: [
      { station: '岳麓大道口配电室', voltage: 380, current: 45, active: true },
      { station: '望月湖中继柜', voltage: 380, current: 43, active: true },
      { station: '桐梓坡路口终端', voltage: 380, current: 42, active: true }
    ]
  },
  {
    id: 2,
    no: 2,
    area: '长沙-岳麓区',
    name: '先导路辅路线路',
    startPoint: '桐梓坡路口',
    endPoint: '咸嘉湖路口',
    length: 1.8,
    voltage: '10kV',
    status: '正常',
    updateTime: '2024-07-02 14:30:00',
    remark: '',
    current: 32,
    power: 128,
    temperature: 32,
    loadRate: 26,
    tracePath: [
      { station: '桐梓坡路口配电室', voltage: 380, current: 32, active: true },
      { station: '咸嘉湖路口终端', voltage: 380, current: 31, active: true }
    ]
  },
  {
    id: 3,
    no: 3,
    area: '长沙-天心区',
    name: '芙蓉路线路',
    startPoint: '劳动路口',
    endPoint: '五一大道口',
    length: 3.2,
    voltage: '10kV',
    status: '预警',
    updateTime: '2024-07-02 14:30:00',
    remark: '负载较高',
    current: 78,
    power: 312,
    temperature: 52,
    loadRate: 78,
    tracePath: [
      { station: '劳动路口配电室', voltage: 380, current: 78, active: true },
      { station: '侯家塘中继柜', voltage: 380, current: 76, active: true },
      { station: '五一大道口终端', voltage: 380, current: 75, active: false }
    ]
  },
  {
    id: 4,
    no: 4,
    area: '长沙-天心区',
    name: '解放路线路',
    startPoint: '湘江路口',
    endPoint: '韶山路路口',
    length: 2.0,
    voltage: '10kV',
    status: '正常',
    updateTime: '2024-07-02 14:30:00',
    remark: '',
    current: 38,
    power: 152,
    temperature: 34,
    loadRate: 30,
    tracePath: [
      { station: '湘江路口配电室', voltage: 380, current: 38, active: true },
      { station: '韶山路路口终端', voltage: 380, current: 37, active: true }
    ]
  },
  {
    id: 5,
    no: 5,
    area: '长沙-开福区',
    name: '湘江路线路',
    startPoint: '三一大道口',
    endPoint: '芙蓉路口',
    length: 4.5,
    voltage: '35kV',
    status: '正常',
    updateTime: '2024-07-02 14:30:00',
    remark: '新建线路',
    current: 55,
    power: 220,
    temperature: 38,
    loadRate: 44,
    tracePath: [
      { station: '三一大道口配电室', voltage: 380, current: 55, active: true },
      { station: '北辰中继柜', voltage: 380, current: 53, active: true },
      { station: '芙蓉路口终端', voltage: 380, current: 52, active: true }
    ]
  },
  {
    id: 6,
    no: 6,
    area: '长沙-开福区',
    name: '东风路线路',
    startPoint: '湘雅路口',
    endPoint: '远大路口',
    length: 2.8,
    voltage: '10kV',
    status: '故障',
    updateTime: '2024-07-02 13:45:00',
    remark: '待检修',
    current: 0,
    power: 0,
    temperature: 25,
    loadRate: 0,
    tracePath: [
      { station: '湘雅路口配电室', voltage: 0, current: 0, active: false },
      { station: '东风路中继柜', voltage: 0, current: 0, active: false },
      { station: '远大路口终端', voltage: 0, current: 0, active: false }
    ]
  }
]

// ---- 表格数据容器（usePresetTable） ----
const traceCtl = usePresetTable(null, {
  defaultPageSpan: 15,
  initialData: initialTraces
})

// ---- 概览指标派生 ----
const normalTraceCount = computed(
  () => traceCtl.presetPlaybook.filter(t => t.status === '正常').length
)
const warnTraceCount = computed(
  () => traceCtl.presetPlaybook.filter(t => t.status === '预警').length
)
const faultTraceCount = computed(
  () => traceCtl.presetPlaybook.filter(t => t.status === '故障').length
)

// ---- 详情抽屉容器（useDrawerInspector） ----
const traceInspector = useDrawerInspector({ size: '680px', direction: 'rtl' })
const focusedTrace = computed(() => traceInspector.focusedRecord)

/**
 * 获取线路状态样式类
 * @param {string} status 运行状态
 */
const getTraceStatusClass = (status) => {
  switch (status) {
    case '正常': return 'online'
    case '预警': return 'idle'
    case '故障': return 'offline'
    default: return 'idle'
  }
}

/**
 * 执行线路追踪：对目标链路发起追踪巡检，回显路径节点
 * @param {Object} trace 目标线路
 */
const onTraceLine = (trace) => {
  if (!trace) {
    ElMessage.warning('请在列表中选择一条待追踪的线路')
    return
  }
  ElMessageBox.confirm(
    `确认对「${trace.name}」执行线路追踪？`,
    '追踪确认',
    { type: 'warning' }
  )
    .then(() => {
      traceCtl.reviseRecord(trace.id, {
        updateTime: new Date().toLocaleString('zh-CN'),
        loadRate: Math.floor(Math.random() * 40) + 20
      })
      ElMessage.success(`线路追踪完成，路径节点已回显至「${trace.endPoint}」`)
      onInspectTraceResult(trace)
    })
    .catch(() => {})
}

/**
 * 查看追踪结果：打开抽屉展示线路详情与追踪路径
 * @param {Object} trace 目标线路
 */
const onInspectTraceResult = (trace) => {
  traceInspector.openInspector(trace)
}

/**
 * 废止线路：二次确认后从追踪台账中移除
 * @param {Object} trace 目标线路
 */
const onRetireTrace = (trace) => {
  ElMessageBox.confirm(
    `确定要将「${trace.name}」从追踪台账中废止吗？`,
    '废止确认',
    { type: 'warning' }
  )
    .then(() => {
      traceCtl.retireRecord(trace.id)
      ElMessage.success('线路已废止，追踪台账已同步')
    })
    .catch(() => {})
}
</script>

<style scoped lang="scss">
.zg-trace {
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
    &--danger::before { background: var(--zg-danger); }
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

.zg-tracecard {
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

  &__route {
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

.zg-tracepath {
  display: flex;
  flex-direction: column;
  padding: 4px 0;

  &__node {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    position: relative;
    padding: 6px 0 6px 4px;
  }

  &__dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--zg-ink-placeholder);
    margin-top: 3px;
    flex-shrink: 0;
    position: relative;
    z-index: 1;

    &--active {
      background: var(--zg-success);
      box-shadow: 0 0 0 4px var(--zg-success-soft);
    }
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
  }

  &__station {
    font-size: 14px;
    font-weight: 500;
    color: var(--zg-ink-primary);
  }

  &__meta {
    font-size: 12px;
    color: var(--zg-ink-tertiary);
  }

  &__bar {
    position: absolute;
    left: 8px;
    top: 16px;
    width: 2px;
    height: calc(100% + 4px);
    background: var(--zg-line-soft);
  }
}
</style>
