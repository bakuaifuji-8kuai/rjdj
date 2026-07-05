<!--
  智光云枢 · 能耗监测 · 回路集群
  业务域：energyPulse
  功能：城市照明回路台账与集群监测
        支持卡片/列表双视图、抽屉式详情与编排、回路启停回执
-->
<template>
  <section class="zg-loop">
    <!-- 页面头部：品牌徽标 + 标题 + 概览指标 + 新建入口 -->
    <header class="zg-loop__head">
      <div class="zg-loop__headline">
        <div class="zg-loop__sigil">
          <el-icon :size="22"><Connection /></el-icon>
        </div>
        <div class="zg-loop__copy">
          <h1 class="zg-loop__title">回路集群</h1>
          <p class="zg-loop__sub">
            城市照明供电回路 · 在役 {{ activeLoopCount }} 条 ·
            停用 {{ inactiveLoopCount }} 条 · 累计负载 {{ totalLoadCount }} 节点
          </p>
        </div>
      </div>
      <div class="zg-loop__cta">
        <el-button type="primary" @click="loopForm.openComposer()">
          <el-icon><Plus /></el-icon>
          <span>登记回路</span>
        </el-button>
      </div>
    </header>

    <!-- 概览指标卡 -->
    <div class="zg-metrics">
      <div class="zg-metrics__cell">
        <span class="zg-metrics__num">{{ loopCtl.totalRows }}</span>
        <span class="zg-metrics__lbl">回路总数</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--ok">
        <span class="zg-metrics__num">{{ activeLoopCount }}</span>
        <span class="zg-metrics__lbl">在线运行</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--warn">
        <span class="zg-metrics__num">{{ inactiveLoopCount }}</span>
        <span class="zg-metrics__lbl">离线停用</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--info">
        <span class="zg-metrics__num">{{ totalLoadCount }}</span>
        <span class="zg-metrics__lbl">负载节点总数</span>
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
          v-model="loopCtl.statusBuckets"
          placeholder="运行状态"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="启用" value="启用" />
          <el-option label="停用" value="停用" />
        </el-select>
        <el-select
          v-model="loopCtl.typeBucket"
          placeholder="所属区域"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="长沙-岳麓区" value="长沙-岳麓区" />
          <el-option label="长沙-天心区" value="长沙-天心区" />
          <el-option label="长沙-开福区" value="长沙-开福区" />
        </el-select>
        <el-input
          v-model="loopCtl.filterLexicon"
          placeholder="检索回路名称/编号"
          clearable
          class="zg-filterband__search"
          @keyup.enter="loopCtl.onFilterApply()"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="loopCtl.onFilterApply()">
          <el-icon><Search /></el-icon>
          <span>检索</span>
        </el-button>
        <el-button @click="loopCtl.onFilterReset()">
          <el-icon><RefreshLeft /></el-icon>
          <span>重置</span>
        </el-button>
      </div>
    </div>

    <!-- 卡片视图 -->
    <div v-if="densityMode === 'card'" class="zg-cardgrid">
      <article
        v-for="loop in loopCtl.pagedRows"
        :key="loop.id"
        class="zg-loopcard"
        :class="loop.status === '启用' ? 'online' : 'offline'"
        @click="loopInspector.openInspector(loop)"
      >
        <div class="zg-loopcard__head">
          <div class="zg-loopcard__glyph">
            <el-icon :size="24"><Connection /></el-icon>
          </div>
          <span class="zg-status" :class="loop.status === '启用' ? 'online' : 'offline'">
            <i class="dot"></i>{{ loop.status }}
          </span>
        </div>
        <div class="zg-loopcard__body">
          <h3 class="zg-loopcard__name">{{ loop.name }}</h3>
          <p class="zg-loopcard__area">{{ loop.area }} · {{ loop.model }}</p>
          <div class="zg-loopcard__stats">
            <span class="zg-loopcard__stat">
              <em>{{ loop.voltage }}</em> V
            </span>
            <span class="zg-loopcard__stat">
              <em>{{ loop.current }}</em> A
            </span>
            <span class="zg-loopcard__stat">
              <em>{{ loop.power }}</em> kW
            </span>
            <span class="zg-loopcard__stat">
              <em>{{ loop.loadCount }}</em> 节点
            </span>
          </div>
        </div>
        <div class="zg-loopcard__foot">
          <span class="zg-loopcard__time">{{ loop.installTime }}</span>
          <div class="zg-loopcard__actions">
            <el-button link type="primary" size="small" @click.stop="onToggleLoop(loop)">
              {{ loop.status === '启用' ? '停用' : '启用' }}
            </el-button>
            <el-button link type="primary" size="small" @click.stop="loopForm.openReviser(loop)">修订</el-button>
            <el-button link type="danger" size="small" @click.stop="onRetireLoop(loop)">废止</el-button>
          </div>
        </div>
      </article>
    </div>

    <!-- 列表视图 -->
    <div v-else class="zg-tablewrap">
      <el-table :data="loopCtl.pagedRows" stripe class="zg-datatable">
        <el-table-column prop="no" label="序号" width="60" align="center" />
        <el-table-column prop="area" label="所属区域" width="130" />
        <el-table-column prop="name" label="回路名称" min-width="150" />
        <el-table-column prop="model" label="回路规格" width="110" />
        <el-table-column label="运行状态" width="100" align="center">
          <template #default="{ row }">
            <span class="zg-status" :class="row.status === '启用' ? 'online' : 'offline'">
              <i class="dot"></i>{{ row.status }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="voltage" label="电压(V)" width="100" align="center" />
        <el-table-column prop="current" label="电流(A)" width="100" align="center" />
        <el-table-column prop="power" label="功率(kW)" width="100" align="center" />
        <el-table-column prop="loadCount" label="负载节点" width="90" align="center" />
        <el-table-column prop="installTime" label="投运时间" width="130" />
        <el-table-column label="处置" width="240" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="loopInspector.openInspector(row)">详情</el-button>
            <el-button type="warning" size="small" @click="onToggleLoop(row)">
              {{ row.status === '启用' ? '停用' : '启用' }}
            </el-button>
            <el-button type="primary" size="small" @click="loopForm.openReviser(row)">修订</el-button>
            <el-button type="danger" size="small" @click="onRetireLoop(row)">废止</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页条 -->
    <div class="zg-pagerbar">
      <el-pagination
        v-model:current-page="loopCtl.pagingCursor"
        v-model:page-size="loopCtl.pageSpan"
        :total="loopCtl.totalRows"
        :page-sizes="[10, 15, 20, 50, 100]"
        layout="prev, pager, next, jumper, ->, sizes, total"
        background
      />
    </div>

    <!-- 详情抽屉 -->
    <el-drawer
      v-model="loopInspector.drawerOpen"
      :title="'回路详情 · ' + (focusedLoop?.name || '')"
      direction="rtl"
      size="680px"
    >
      <div v-if="focusedLoop" class="zg-inspector">
        <div class="zg-inspector__head">
          <div class="zg-inspector__glyph">
            <el-icon :size="36"><Connection /></el-icon>
          </div>
          <div class="zg-inspector__meta">
            <h2 class="zg-inspector__name">{{ focusedLoop.name }}</h2>
            <p class="zg-inspector__type">{{ focusedLoop.area }} · {{ focusedLoop.model }}</p>
            <span class="zg-status" :class="focusedLoop.status === '启用' ? 'online' : 'offline'">
              <i class="dot"></i>{{ focusedLoop.status }}
            </span>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">基本档案</h4>
          <div class="zg-inspector__grid">
            <div class="zg-inspector__cell">
              <span class="lbl">投运时间</span>
              <span class="val">{{ focusedLoop.installTime }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">运行时长</span>
              <span class="val">{{ focusedLoop.runTime }} h</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">备注</span>
              <span class="val">{{ focusedLoop.remark || '-' }}</span>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">实时遥测</h4>
          <div class="zg-datagrid">
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">电压</div>
              <div class="zg-datacard__val">{{ focusedLoop.voltage }}<em>V</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">电流</div>
              <div class="zg-datacard__val">{{ focusedLoop.current }}<em>A</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">功率</div>
              <div class="zg-datacard__val">{{ focusedLoop.power }}<em>kW</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">负载节点</div>
              <div class="zg-datacard__val">{{ focusedLoop.loadCount }}<em>个</em></div>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">负载节点清单</h4>
          <el-table :data="focusedLoop.loads" size="small" border>
            <el-table-column prop="no" label="序号" width="60" align="center" />
            <el-table-column prop="name" label="负载名称" min-width="120" />
            <el-table-column label="状态" width="90" align="center">
              <template #default="{ row }">
                <span class="zg-status" :class="row.status === '开启' ? 'online' : 'idle'">
                  <i class="dot"></i>{{ row.status }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="current" label="电流(A)" width="100" align="center" />
            <el-table-column prop="power" label="功率(kW)" width="110" align="center" />
          </el-table>
        </div>

        <div class="zg-inspector__actions">
          <el-button size="large" @click="loopInspector.closeInspector()">关闭</el-button>
          <el-button
            type="warning"
            size="large"
            @click="onToggleLoop(focusedLoop)"
          >
            {{ focusedLoop.status === '启用' ? '停用回路' : '启用回路' }}
          </el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 新建/修订抽屉 -->
    <el-drawer
      v-model="loopForm.drawerOpen"
      :title="loopForm.editMode === 'compose' ? '登记回路' : '修订回路'"
      direction="rtl"
      size="560px"
    >
      <el-form :model="loopForm.draftPayload" label-width="96px" class="zg-draftform">
        <el-form-item label="所属区域" required>
          <el-select v-model="loopForm.draftPayload.area" placeholder="请选择所属区域" style="width: 100%">
            <el-option label="长沙-岳麓区" value="长沙-岳麓区" />
            <el-option label="长沙-天心区" value="长沙-天心区" />
            <el-option label="长沙-开福区" value="长沙-开福区" />
          </el-select>
        </el-form-item>
        <el-form-item label="回路名称" required>
          <el-input v-model="loopForm.draftPayload.name" placeholder="请输入回路名称" />
        </el-form-item>
        <el-form-item label="回路规格" required>
          <el-input v-model="loopForm.draftPayload.model" placeholder="请输入回路规格" />
        </el-form-item>
        <el-form-item label="额定电压">
          <el-input-number v-model="loopForm.draftPayload.voltage" :min="0" :max="1000" />
          <span class="zg-draftform__unit">V</span>
        </el-form-item>
        <el-form-item label="额定电流">
          <el-input-number v-model="loopForm.draftPayload.current" :min="0" :max="500" />
          <span class="zg-draftform__unit">A</span>
        </el-form-item>
        <el-form-item label="额定功率">
          <el-input-number v-model="loopForm.draftPayload.power" :min="0" :max="1000" />
          <span class="zg-draftform__unit">kW</span>
        </el-form-item>
        <el-form-item label="负载节点">
          <el-input-number v-model="loopForm.draftPayload.loadCount" :min="1" :max="100" />
          <span class="zg-draftform__unit">个</span>
        </el-form-item>
        <el-form-item label="投运时间">
          <el-date-picker
            v-model="loopForm.draftPayload.installTime"
            type="date"
            placeholder="选择投运时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="loopForm.draftPayload.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="loopForm.onDraftDiscard()">取消</el-button>
        <el-button
          type="primary"
          :loading="loopForm.submitting"
          @click="onCommitLoopDraft"
        >
          {{ loopForm.editMode === 'compose' ? '登记' : '保存修订' }}
        </el-button>
      </template>
    </el-drawer>
  </section>
</template>

<script setup>
/**
 * 智光云枢 · 能耗监测 · 回路集群
 * 业务域：energyPulse
 * 功能：城市照明供电回路台账与集群监测
 * @module energyPulse/LoopCluster
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
  RefreshLeft
} from '@element-plus/icons-vue'
import { usePresetTable } from '@/shared/composables/usePresetTable'
import { useFormDraft } from '@/shared/composables/useFormDraft'
import { useDrawerInspector } from '@/shared/composables/useDrawerInspector'

// ---- 视图密度切换 ----
const densityMode = ref('card')

// ---- 初始 mock 数据池 ----
const initialLoops = [
  {
    id: 1,
    no: 1,
    area: '长沙-岳麓区',
    name: '先导路1号回路',
    model: 'YJV-4×35',
    status: '启用',
    voltage: 380,
    current: 80,
    power: 52,
    loadCount: 12,
    installTime: '2024-01-15',
    remark: '主干道照明回路',
    runTime: 8760,
    loads: [
      { no: 1, name: '路灯杆A01', status: '开启', current: 4.2, power: 1.6 },
      { no: 2, name: '路灯杆A02', status: '开启', current: 4.0, power: 1.5 },
      { no: 3, name: '景观灯B01', status: '关闭', current: 0, power: 0 },
      { no: 4, name: '路灯杆A03', status: '开启', current: 3.8, power: 1.4 }
    ]
  },
  {
    id: 2,
    no: 2,
    area: '长沙-岳麓区',
    name: '先导路2号回路',
    model: 'YJV-4×25',
    status: '启用',
    voltage: 380,
    current: 65,
    power: 42,
    loadCount: 10,
    installTime: '2024-02-20',
    remark: '辅路照明回路',
    runTime: 7200,
    loads: []
  },
  {
    id: 3,
    no: 3,
    area: '长沙-天心区',
    name: '芙蓉路1号回路',
    model: 'YJV-4×50',
    status: '停用',
    voltage: 0,
    current: 0,
    power: 0,
    loadCount: 16,
    installTime: '2024-03-10',
    remark: '待检修',
    runTime: 5000,
    loads: []
  },
  {
    id: 4,
    no: 4,
    area: '长沙-天心区',
    name: '芙蓉路2号回路',
    model: 'YJV-4×35',
    status: '启用',
    voltage: 380,
    current: 75,
    power: 48,
    loadCount: 14,
    installTime: '2024-04-05',
    remark: '',
    runTime: 4500,
    loads: []
  },
  {
    id: 5,
    no: 5,
    area: '长沙-开福区',
    name: '湘江路1号回路',
    model: 'YJV-4×70',
    status: '启用',
    voltage: 380,
    current: 95,
    power: 62,
    loadCount: 20,
    installTime: '2024-05-18',
    remark: '新建',
    runTime: 2800,
    loads: []
  }
]

// ---- 表格数据容器（usePresetTable） ----
const loopCtl = usePresetTable(null, {
  defaultPageSpan: 15,
  initialData: initialLoops
})

// ---- 概览指标派生 ----
const activeLoopCount = computed(
  () => loopCtl.presetPlaybook.filter(l => l.status === '启用').length
)
const inactiveLoopCount = computed(
  () => loopCtl.presetPlaybook.filter(l => l.status === '停用').length
)
const totalLoadCount = computed(
  () => loopCtl.presetPlaybook.reduce((sum, l) => sum + (l.loadCount || 0), 0)
)

// ---- 表单草稿容器（useFormDraft） ----
const loopForm = useFormDraft(
  {
    area: '',
    name: '',
    model: '',
    voltage: 0,
    current: 0,
    power: 0,
    loadCount: 1,
    installTime: '',
    remark: ''
  },
  {
    validateFn: (draft) => {
      if (!draft.area) {
        ElMessage.warning('请选择所属区域')
        return false
      }
      if (!draft.name) {
        ElMessage.warning('请输入回路名称')
        return false
      }
      if (!draft.model) {
        ElMessage.warning('请输入回路规格')
        return false
      }
      return true
    }
  }
)

// ---- 详情抽屉容器（useDrawerInspector） ----
const loopInspector = useDrawerInspector({ size: '680px', direction: 'rtl' })
const focusedLoop = computed(() => loopInspector.focusedRecord)

/**
 * 提交草稿：根据编排/修订模式写入数据池
 * 业务流包装：新建生成回路编号，修订同步遥测字段
 */
const onCommitLoopDraft = async () => {
  const snapshot = await loopForm.onDraftCommit()
  if (!snapshot) return

  if (loopForm.editMode === 'compose') {
    // 登记：附带运行态默认值
    loopCtl.appendRecord({
      ...snapshot,
      no: loopCtl.presetPlaybook.length + 1,
      status: '启用',
      runTime: 0,
      loads: []
    })
    ElMessage.success('回路登记成功，已并入集群台账')
  } else {
    // 修订：合并更新到原记录
    const origin = loopForm.originRecord
    loopCtl.reviseRecord(origin.id, { ...snapshot })
    ElMessage.success('回路档案已更新')
  }
}

/**
 * 启停回路：启用↔停用切换，含幂等回执避免重复操作
 * @param {Object} loop 目标回路
 */
const onToggleLoop = (loop) => {
  const nextStatus = loop.status === '启用' ? '停用' : '启用'
  ElMessageBox.confirm(
    `确认将「${loop.name}」${nextStatus === '启用' ? '启用' : '停用'}？`,
    '启停确认',
    { type: 'warning' }
  )
    .then(() => {
      loopCtl.reviseRecord(loop.id, { status: nextStatus })
      ElMessage.success(`回路已${nextStatus === '启用' ? '启用' : '停用'}，遥测回执已签收`)
    })
    .catch(() => {})
}

/**
 * 废止回路：二次确认后从台账中移除
 * @param {Object} loop 目标回路
 */
const onRetireLoop = (loop) => {
  ElMessageBox.confirm(
    `确定要将「${loop.name}」从集群台账中废止吗？`,
    '废止确认',
    { type: 'warning' }
  )
    .then(() => {
      loopCtl.retireRecord(loop.id)
      ElMessage.success('回路已废止，台账已同步')
    })
    .catch(() => {})
}
</script>

<style scoped lang="scss">
.zg-loop {
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

.zg-loopcard {
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

.zg-draftform {
  &__unit {
    margin-left: 8px;
    font-size: 13px;
    color: var(--zg-ink-tertiary);
  }
}
</style>
