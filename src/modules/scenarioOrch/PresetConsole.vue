<!--
  智光云枢 · 情景编排 · 预案控制台
  业务域：scenarioOrch
  功能：预案快速投递与执行回执管理
        支持场景网格多选批量执行、投递记录抽屉式检视
-->
<template>
  <section class="zg-console">
    <!-- 页面头部：品牌徽标 + 标题 + 概览副标题 + 新建入口 -->
    <header class="zg-console__head">
      <div class="zg-console__headline">
        <div class="zg-console__sigil">
          <el-icon :size="22"><Lightning /></el-icon>
        </div>
        <div class="zg-console__copy">
          <h1 class="zg-console__title">预案控制台</h1>
          <p class="zg-console__sub">
            快速执行预设预案 · 在册 {{ consoleCtl.totalRows }} 个 ·
            已选 {{ selectedTally }} 个 · 累计投递 {{ recordCtl.totalRows }} 条
          </p>
        </div>
      </div>
      <div class="zg-console__cta">
        <el-button type="primary" @click="onComposePreset()">
          <el-icon><Plus /></el-icon>
          <span>新增预案</span>
        </el-button>
      </div>
    </header>

    <!-- 概览指标卡 -->
    <div class="zg-metrics">
      <div class="zg-metrics__cell">
        <span class="zg-metrics__num">{{ consoleCtl.totalRows }}</span>
        <span class="zg-metrics__lbl">预案总数</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--info">
        <span class="zg-metrics__num">{{ selectedTally }}</span>
        <span class="zg-metrics__lbl">已选预案</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--ok">
        <span class="zg-metrics__num">{{ successTally }}</span>
        <span class="zg-metrics__lbl">投递成功</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--warn">
        <span class="zg-metrics__num">{{ failureTally }}</span>
        <span class="zg-metrics__lbl">投递失败</span>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="zg-tabwrap">
      <el-tabs v-model="activeTab">
        <!-- 预案控制 -->
        <el-tab-pane label="预案控制" name="control">
          <!-- 过滤工具栏 -->
          <div class="zg-filterband">
            <div class="zg-filterband__fields">
              <el-input
                v-model="consoleCtl.filterLexicon"
                placeholder="检索预案名称"
                clearable
                class="zg-filterband__search"
                @keyup.enter="onFilterApply()"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              <el-button type="primary" @click="onFilterApply()">
                <el-icon><Search /></el-icon>
                <span>查询</span>
              </el-button>
              <el-button @click="onFilterReset()">
                <el-icon><Refresh /></el-icon>
                <span>重置</span>
              </el-button>
            </div>
          </div>

          <!-- 批量执行条 -->
          <div v-if="selectedTally > 0" class="zg-batchband">
            <span class="zg-batchband__info">
              已选择 <span class="zg-batchband__count">{{ selectedTally }}</span> 个预案
            </span>
            <div class="zg-batchband__actions">
              <el-button type="danger" @click="onBatchTrigger()">
                <el-icon><VideoPlay /></el-icon>
                <span>批量执行</span>
              </el-button>
              <el-button @click="onClearSelection()">
                <span>取消选择</span>
              </el-button>
            </div>
          </div>

          <!-- 场景网格 -->
          <div class="zg-cardgrid">
            <article
              v-for="scene in consoleCtl.pagedRows"
              :key="scene?.id"
              class="zg-scenecard"
              :class="{ 'zg-scenecard--active': scene.selected }"
              @click="onToggleSceneSelect(scene)"
            >
              <div class="zg-scenecard__head">
                <el-checkbox :checked="scene.selected" @change="scene.selected = $event" @click.stop />
                <span class="zg-scenecard__name">{{ scene?.name }}</span>
                <span class="zg-scenecard__tag">{{ scene ? resolveSceneTag(scene.id) : '' }}</span>
              </div>
              <div class="zg-scenecard__body">
                <span class="zg-scenecard__serial">ID: {{ scene?.id }}</span>
              </div>
              <div class="zg-scenecard__foot">
                <el-button type="primary" size="small" @click.stop="onTriggerScene(scene)">
                  <el-icon><VideoPlay /></el-icon>
                  <span>执行</span>
                </el-button>
                <el-button size="small" @click.stop="onViewResult(scene)">
                  <el-icon><InfoFilled /></el-icon>
                  <span>结果</span>
                </el-button>
              </div>
            </article>
          </div>

          <!-- 分页 -->
          <div class="zg-pagerbar">
            <el-pagination
              v-model:current-page="consoleCtl.pagingCursor"
              v-model:page-size="consoleCtl.pageSpan"
              :total="consoleCtl.totalRows"
              :page-sizes="[10, 15, 20, 50, 100]"
              layout="prev, pager, next, jumper, ->, sizes, total"
              background
            />
          </div>
        </el-tab-pane>

        <!-- 投递记录 -->
        <el-tab-pane label="投递记录" name="records">
          <div class="zg-tablewrap">
            <div class="zg-tablewrap__head">
              <h3 class="zg-tablewrap__title">投递记录列表</h3>
              <el-button @click="onRefreshRecords()">
                <el-icon><Refresh /></el-icon>
                <span>刷新</span>
              </el-button>
            </div>
            <el-table :data="recordCtl.pagedRows" stripe class="zg-datatable">
              <el-table-column prop="no" label="#" width="60" align="center" />
              <el-table-column prop="presetLabel" label="预案名称" min-width="160" />
              <el-table-column prop="executeTime" label="投递时间" min-width="160" />
              <el-table-column label="状态" width="100" align="center">
                <template #default="{ row }">
                  <span class="zg-status" :class="row.status === 'success' ? 'success' : 'danger'">
                    <i class="dot"></i>{{ row.status === 'success' ? '成功' : '失败' }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="detail" label="详情" min-width="200" />
              <el-table-column label="处置" width="100" align="center" fixed="right">
                <template #default="{ row }">
                  <el-button type="primary" size="small" @click="onInspectRecord(row)">详情</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 分页 -->
          <div class="zg-pagerbar">
            <el-pagination
              v-model:current-page="recordCtl.pagingCursor"
              v-model:page-size="recordCtl.pageSpan"
              :total="recordCtl.totalRows"
              :page-sizes="[10, 15, 20, 50, 100]"
              layout="prev, pager, next, jumper, ->, sizes, total"
              background
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 执行结果抽屉 -->
    <el-drawer
      v-model="consoleInspector.drawerOpen"
      :title="'执行回执 · ' + (focusedScene?.name || '')"
      direction="rtl"
      size="560px"
    >
      <div v-if="focusedScene" class="zg-inspector">
        <div class="zg-inspector__head">
          <div class="zg-inspector__glyph">
            <el-icon v-if="resultSnapshot.status === 'success'" :size="36"><CircleCheckFilled /></el-icon>
            <el-icon v-else :size="36"><CircleCloseFilled /></el-icon>
          </div>
          <div class="zg-inspector__meta">
            <h2 class="zg-inspector__name">
              {{ resultSnapshot.status === 'success' ? '执行成功' : '执行失败' }}
            </h2>
            <p class="zg-inspector__type">{{ focusedScene.name }}</p>
            <span class="zg-status" :class="resultSnapshot.status === 'success' ? 'success' : 'danger'">
              <i class="dot"></i>{{ resultSnapshot.status === 'success' ? '成功' : '失败' }}
            </span>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">执行明细</h4>
          <div class="zg-inspector__grid">
            <div class="zg-inspector__cell">
              <span class="lbl">预案名称</span>
              <span class="val">{{ resultSnapshot.name }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">执行时间</span>
              <span class="val">{{ resultSnapshot.executeTime }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">状态</span>
              <span class="val">{{ resultSnapshot.status === 'success' ? '成功' : '失败' }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">控制数量</span>
              <span class="val">{{ resultSnapshot.count }} 盏光源</span>
            </div>
            <div class="zg-inspector__cell zg-inspector__cell--wide">
              <span class="lbl">详情</span>
              <span class="val">{{ resultSnapshot.detail }}</span>
            </div>
          </div>
        </div>

        <div class="zg-inspector__actions">
          <el-button size="large" @click="consoleInspector.closeInspector()">关闭</el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 记录详情抽屉 -->
    <el-drawer
      v-model="recordInspector.drawerOpen"
      :title="'投递详情 · ' + (focusedRecord?.presetLabel || '')"
      direction="rtl"
      size="560px"
    >
      <div v-if="focusedRecord" class="zg-inspector">
        <div class="zg-inspector__head">
          <div class="zg-inspector__glyph">
            <el-icon v-if="focusedRecord.status === 'success'" :size="36"><CircleCheckFilled /></el-icon>
            <el-icon v-else :size="36"><CircleCloseFilled /></el-icon>
          </div>
          <div class="zg-inspector__meta">
            <h2 class="zg-inspector__name">{{ focusedRecord.presetLabel }}</h2>
            <p class="zg-inspector__type">{{ focusedRecord.executeTime }}</p>
            <span class="zg-status" :class="focusedRecord.status === 'success' ? 'success' : 'danger'">
              <i class="dot"></i>{{ focusedRecord.status === 'success' ? '成功' : '失败' }}
            </span>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">投递明细</h4>
          <div class="zg-inspector__grid">
            <div class="zg-inspector__cell">
              <span class="lbl">预案名称</span>
              <span class="val">{{ focusedRecord.presetLabel }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">投递时间</span>
              <span class="val">{{ focusedRecord.executeTime }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">状态</span>
              <span class="val">{{ focusedRecord.status === 'success' ? '成功' : '失败' }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">控制数量</span>
              <span class="val">{{ focusedRecord.count || 0 }} 盏光源</span>
            </div>
            <div class="zg-inspector__cell zg-inspector__cell--wide">
              <span class="lbl">详情</span>
              <span class="val">{{ focusedRecord.detail }}</span>
            </div>
          </div>
        </div>

        <div class="zg-inspector__actions">
          <el-button size="large" @click="recordInspector.closeInspector()">关闭</el-button>
        </div>
      </div>
    </el-drawer>
  </section>
</template>

<script setup>
/**
 * 智光云枢 · 情景编排 · 预案控制台
 * 业务域：scenarioOrch
 * 功能：预案快速投递与执行回执管理
 *        支持场景网格多选批量执行、投递记录抽屉式检视
 * @module scenarioOrch/PresetConsole
 * @author 智光云枢研发团队
 */
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Lightning,
  Plus,
  VideoPlay,
  InfoFilled,
  Refresh,
  CircleCheckFilled,
  CircleCloseFilled,
  Search
} from '@element-plus/icons-vue'
import { usePresetTable } from '@/shared/composables/usePresetTable'
import { useDrawerInspector } from '@/shared/composables/useDrawerInspector'

const router = useRouter()
const activeTab = ref('control')

// ---- 初始 mock 数据池 ----
const initialScenes = [
  { id: 1, name: '(0)应急开灯', visible: true, selected: false },
  { id: 2, name: '(0)某路段人工复查', visible: true, selected: false },
  { id: 3, name: '(1)线性灯-100', visible: true, selected: false },
  { id: 4, name: '(1)线性灯-10', visible: true, selected: false },
  { id: 5, name: '(1)线性灯-50', visible: true, selected: false },
  { id: 6, name: '(1)线性灯关', visible: true, selected: false },
  { id: 7, name: '(1)隧道光源全关', visible: true, selected: false },
  { id: 8, name: '(2)高速灯-100', visible: true, selected: false },
  { id: 9, name: '(2)高速灯-50', visible: true, selected: false },
  { id: 10, name: '(2)高速灯-10', visible: true, selected: false },
  { id: 11, name: '(2)高速灯关', visible: true, selected: false },
  { id: 12, name: '(3)低位红光关闭', visible: true, selected: false },
  { id: 13, name: '(3)低位雾光关闭', visible: true, selected: false },
  { id: 14, name: '(3)低位雾光开', visible: true, selected: false },
  { id: 15, name: '(3)低位白光关闭', visible: true, selected: false },
  { id: 16, name: '(3)低位白光开', visible: true, selected: false },
  { id: 17, name: '(3)低位红光开', visible: true, selected: false },
  { id: 18, name: '(5)光源展示100...', visible: true, selected: false },
  { id: 19, name: '(99)展厅一键全开', visible: true, selected: false },
  { id: 20, name: '(99)展厅全关', visible: true, selected: false }
]

const initialRecords = [
  { no: 1, presetLabel: '应急开灯', executeTime: '2024-04-22 10:26:58', status: 'success', detail: '执行成功，共控制156盏光源', count: 156 },
  { no: 2, presetLabel: '隧道光源全关', executeTime: '2024-04-22 09:15:30', status: 'success', detail: '执行成功，共控制89盏光源', count: 89 },
  { no: 3, presetLabel: '线性灯-50', executeTime: '2024-04-22 08:00:00', status: 'success', detail: '执行成功，共控制234盏光源', count: 234 },
  { no: 4, presetLabel: '高速灯-100', executeTime: '2024-04-21 22:30:00', status: 'danger', detail: '执行失败，部分设备离线', count: 0 }
]

// ---- 控制台数据容器（usePresetTable） ----
const consoleCtl = usePresetTable(null, {
  defaultPageSpan: 15,
  initialData: initialScenes
})

// ---- 投递记录数据容器（usePresetTable） ----
const recordCtl = usePresetTable(null, {
  defaultPageSpan: 10,
  initialData: initialRecords
})

// ---- 执行结果抽屉容器（useDrawerInspector） ----
const consoleInspector = useDrawerInspector({ size: '560px', direction: 'rtl' })
const focusedScene = computed(() => consoleInspector.focusedRecord)

// ---- 记录详情抽屉容器（useDrawerInspector） ----
const recordInspector = useDrawerInspector({ size: '560px', direction: 'rtl' })
const focusedRecord = computed(() => recordInspector.focusedRecord)

// ---- 执行结果快照 ----
const resultSnapshot = ref({})

// ---- 概览指标派生 ----
const selectedTally = computed(
  () => consoleCtl.presetPlaybook.filter(s => s.selected).length
)
const successTally = computed(
  () => recordCtl.presetPlaybook.filter(r => r.status === 'success').length
)
const failureTally = computed(
  () => recordCtl.presetPlaybook.filter(r => r.status === 'danger').length
)

// ---- 标签解析器 ----
const resolveSceneTag = (id) => {
  const tagMap = {
    0: '应急',
    1: '线性灯',
    2: '高速灯',
    3: '低位灯',
    5: '展示',
    99: '展厅'
  }
  return tagMap[id] || '其他'
}

// ---- 选择交互 ----
const onToggleSceneSelect = (scene) => {
  scene.selected = !scene.selected
}

/**
 * 清空已选：取消所有场景的选择态
 */
const onClearSelection = () => {
  consoleCtl.presetPlaybook.forEach(s => { s.selected = false })
}

/**
 * 应用过滤条件并回到首页
 */
const onFilterApply = () => {
  consoleCtl.onFilterApply()
}

/**
 * 重置过滤条件并清空选择态
 */
const onFilterReset = () => {
  consoleCtl.onFilterReset()
  onClearSelection()
}

/**
 * 新建预案：跳转至编排管理页
 */
const onComposePreset = () => {
  router.push('/scene/manage')
}

/**
 * 触发投递：将单个预案投递到执行队列并回显结果
 * @param {Object} scene 目标预案
 */
const onTriggerScene = (scene) => {
  ElMessageBox.confirm(
    `确定要执行预案「${scene.name}」吗？`,
    '投递确认',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'info' }
  )
    .then(() => {
      resultSnapshot.value = {
        name: scene.name,
        executeTime: new Date().toLocaleString(),
        status: 'success',
        count: 156,
        detail: '执行成功，共控制156盏光源'
      }
      consoleInspector.openInspector(scene)
    })
    .catch(() => {})
}

/**
 * 批量触发：将已选预案批量投递到执行队列
 */
const onBatchTrigger = () => {
  const tally = selectedTally.value
  if (tally === 0) return
  ElMessageBox.confirm(
    `确定要批量执行 ${tally} 个预案吗？`,
    '批量投递确认',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
  )
    .then(() => {
      resultSnapshot.value = {
        name: `批量执行(${tally}个预案)`,
        executeTime: new Date().toLocaleString(),
        status: 'success',
        count: tally * 156,
        detail: `批量执行成功，共控制 ${tally * 156} 盏光源`
      }
      consoleInspector.openInspector({ name: `批量执行(${tally}个预案)`, id: 'batch' })
      onClearSelection()
    })
    .catch(() => {})
}

/**
 * 查看结果：直接打开执行回执抽屉
 * @param {Object} scene 目标预案
 */
const onViewResult = (scene) => {
  resultSnapshot.value = {
    name: scene.name,
    executeTime: new Date().toLocaleString(),
    status: 'success',
    count: 156,
    detail: '执行成功，共控制156盏光源'
  }
  consoleInspector.openInspector(scene)
}

/**
 * 刷新记录：重新加载投递记录数据池
 */
const onRefreshRecords = () => {
  recordCtl.refreshPlaybook()
  ElMessage.success('投递记录已刷新')
}

/**
 * 检视记录：打开投递记录详情抽屉
 * @param {Object} row 目标记录行
 */
const onInspectRecord = (row) => {
  recordInspector.openInspector(row)
}
</script>

<style scoped lang="scss">
.zg-console {
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

.zg-tabwrap {
  background: var(--zg-surface-card);
  border: 1px solid var(--zg-line-soft);
  border-radius: var(--zg-radius-lg);
  padding: 20px;
}

.zg-filterband {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 18px;
  padding: 14px 18px;
  background: var(--zg-surface-muted);
  border: 1px solid var(--zg-line-soft);
  border-radius: var(--zg-radius-lg);
  flex-wrap: wrap;

  &__fields {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  &__search { width: 280px; }
}

.zg-batchband {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--zg-brand-tint-50);
  border: 1px solid var(--zg-line-brand);
  border-radius: var(--zg-radius-md);
  margin-bottom: 18px;

  &__info {
    font-size: 14px;
    color: var(--zg-ink-secondary);
  }

  &__count {
    color: var(--zg-brand-primary);
    font-weight: 600;
    font-size: 16px;
    margin: 0 4px;
  }

  &__actions {
    display: flex;
    gap: 8px;
  }
}

.zg-cardgrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.zg-scenecard {
  background: var(--zg-surface-card);
  border: 1px solid var(--zg-line-soft);
  border-radius: var(--zg-radius-lg);
  padding: 16px;
  cursor: pointer;
  transition: all var(--zg-transition-normal);
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--zg-shadow-card-hover);
    border-color: var(--zg-line-brand);
  }

  &--active {
    border-color: var(--zg-brand-primary);
    background: var(--zg-brand-tint-50);
    box-shadow: var(--zg-shadow-card-hover);
  }

  &__head {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__name {
    flex: 1;
    font-size: 14px;
    font-weight: 600;
    color: var(--zg-ink-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__tag {
    font-size: 12px;
    color: var(--zg-brand-primary);
    background: var(--zg-brand-tint-50);
    padding: 2px 8px;
    border-radius: var(--zg-radius-sm);
    border: 1px solid var(--zg-line-brand);
    flex-shrink: 0;
  }

  &__body {
    min-height: 20px;
  }

  &__serial {
    font-size: 12px;
    color: var(--zg-ink-placeholder);
    font-family: monospace;
  }

  &__foot {
    display: flex;
    gap: 10px;
    padding-top: 10px;
    border-top: 1px dashed var(--zg-line-soft);
  }
}

.zg-tablewrap {
  background: var(--zg-surface-card);
  border-radius: var(--zg-radius-lg);
  padding: 16px;
  margin-bottom: 20px;
  border: 1px solid var(--zg-line-soft);

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  &__title {
    font-size: 16px;
    font-weight: 600;
    color: var(--zg-ink-primary);
    margin: 0;
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

  &.success {
    color: var(--zg-success);
    background: var(--zg-success-soft);
  }

  &.danger {
    color: var(--zg-danger);
    background: var(--zg-danger-soft);
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

    &--wide {
      grid-column: span 2;
    }

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
</style>
