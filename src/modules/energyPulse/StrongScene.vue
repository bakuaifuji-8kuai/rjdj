<!--
  智光云枢 · 能耗监测 · 强场景
  业务域：energyPulse
  功能：城市照明强场景预案的台账编排、策略配置与下发执行
        支持卡片/列表双视图、抽屉式详情与编排、场景激活回执
-->
<template>
  <section class="zg-strongscene">
    <!-- 页面头部：品牌徽标 + 标题 + 新建入口 -->
    <header class="zg-strongscene__head">
      <div class="zg-strongscene__headline">
        <div class="zg-strongscene__sigil">
          <el-icon :size="22"><Lightning /></el-icon>
        </div>
        <div class="zg-strongscene__copy">
          <h1 class="zg-strongscene__title">强场景</h1>
          <p class="zg-strongscene__sub">
            城市照明强场景预案 · 在役 {{ activeSceneCount }} 个 ·
            未在役 {{ inactiveSceneCount }} 个 · 累计下发 {{ totalDeployCount }} 次
          </p>
        </div>
      </div>
      <div class="zg-strongscene__cta">
        <el-button type="primary" @click="sceneForm.openComposer()">
          <el-icon><Plus /></el-icon>
          <span>编排预案</span>
        </el-button>
      </div>
    </header>

    <!-- 概览指标卡 -->
    <div class="zg-metrics">
      <div class="zg-metrics__cell">
        <span class="zg-metrics__num">{{ sceneCtl.totalRows }}</span>
        <span class="zg-metrics__lbl">预案总数</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--ok">
        <span class="zg-metrics__num">{{ activeSceneCount }}</span>
        <span class="zg-metrics__lbl">已在役</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--warn">
        <span class="zg-metrics__num">{{ inactiveSceneCount }}</span>
        <span class="zg-metrics__lbl">未在役</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--info">
        <span class="zg-metrics__num">{{ totalDeployCount }}</span>
        <span class="zg-metrics__lbl">累计下发</span>
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
          v-model="sceneCtl.statusBuckets"
          placeholder="生命周期"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="已在役" value="active" />
          <el-option label="未在役" value="inactive" />
        </el-select>
        <el-select
          v-model="sceneCtl.typeBucket"
          placeholder="策略类型"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="定时预案" value="timer" />
          <el-option label="光感预案" value="light" />
        </el-select>
        <el-input
          v-model="sceneCtl.filterLexicon"
          placeholder="检索预案名称"
          clearable
          class="zg-filterband__search"
          @keyup.enter="sceneCtl.onFilterApply()"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="sceneCtl.onFilterApply()">
          <el-icon><Search /></el-icon>
          <span>检索</span>
        </el-button>
        <el-button @click="sceneCtl.onFilterReset()">
          <el-icon><RefreshLeft /></el-icon>
          <span>重置</span>
        </el-button>
      </div>
    </div>

    <!-- 卡片视图 -->
    <div v-if="densityMode === 'card'" class="zg-cardgrid">
      <article
        v-for="scene in sceneCtl.pagedRows"
        :key="scene.id"
        class="zg-scenecard"
        :class="scene.status === 'active' ? 'active' : 'inactive'"
        @click="sceneInspector.openInspector(scene)"
      >
        <div class="zg-scenecard__head">
          <div class="zg-scenecard__glyph">
            <el-icon :size="24"><Lightning /></el-icon>
          </div>
          <span class="zg-status" :class="scene.status === 'active' ? 'online' : 'idle'">
            <i class="dot"></i>{{ scene.status === 'active' ? '已在役' : '未在役' }}
          </span>
        </div>
        <div class="zg-scenecard__body">
          <h3 class="zg-scenecard__name">{{ scene.name }}</h3>
          <p class="zg-scenecard__type">
            <el-tag :type="scene.type === 'timer' ? 'primary' : 'success'" size="small">
              {{ scene.type === 'timer' ? '定时预案' : '光感预案' }}
            </el-tag>
          </p>
          <div class="zg-scenecard__stats">
            <span class="zg-scenecard__stat">
              <em>{{ scene.deployCount }}</em> 次下发
            </span>
            <span class="zg-scenecard__stat">
              <em>{{ scene.creator }}</em>
            </span>
          </div>
        </div>
        <div class="zg-scenecard__foot">
          <span class="zg-scenecard__time">{{ scene.createTime }}</span>
          <div class="zg-scenecard__actions">
            <el-button link type="warning" size="small" @click.stop="onActivateScene(scene)">
              {{ scene.status === 'active' ? '退役' : '激活' }}
            </el-button>
            <el-button link type="primary" size="small" @click.stop="sceneForm.openReviser(scene)">修订</el-button>
            <el-button link type="danger" size="small" @click.stop="onRetireScene(scene)">废止</el-button>
          </div>
        </div>
      </article>
    </div>

    <!-- 列表视图 -->
    <div v-else class="zg-tablewrap">
      <el-table :data="sceneCtl.pagedRows" stripe class="zg-datatable">
        <el-table-column prop="no" label="序号" width="60" align="center" />
        <el-table-column prop="name" label="预案名称" min-width="150" />
        <el-table-column label="策略类型" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="row.type === 'timer' ? 'primary' : 'success'" size="small">
              {{ row.type === 'timer' ? '定时预案' : '光感预案' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="生命周期" width="100" align="center">
          <template #default="{ row }">
            <span class="zg-status" :class="row.status === 'active' ? 'online' : 'idle'">
              <i class="dot"></i>{{ row.status === 'active' ? '已在役' : '未在役' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="deployCount" label="下发次数" width="100" align="center" />
        <el-table-column prop="creator" label="创建人" width="120" />
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column label="处置" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="sceneInspector.openInspector(row)">详情</el-button>
            <el-button type="warning" size="small" @click="onActivateScene(row)">
              {{ row.status === 'active' ? '退役' : '激活' }}
            </el-button>
            <el-button type="primary" size="small" @click="sceneForm.openReviser(row)">修订</el-button>
            <el-button type="danger" size="small" @click="onRetireScene(row)">废止</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页条 -->
    <div class="zg-pagerbar">
      <el-pagination
        v-model:current-page="sceneCtl.pagingCursor"
        v-model:page-size="sceneCtl.pageSpan"
        :total="sceneCtl.totalRows"
        :page-sizes="[10, 15, 20, 50, 100]"
        layout="prev, pager, next, jumper, ->, sizes, total"
        background
      />
    </div>

    <!-- 详情抽屉 -->
    <el-drawer
      v-model="sceneInspector.drawerOpen"
      :title="'预案详情 · ' + (focusedScene?.name || '')"
      direction="rtl"
      size="680px"
    >
      <div v-if="focusedScene" class="zg-inspector">
        <div class="zg-inspector__head">
          <div class="zg-inspector__glyph">
            <el-icon :size="36"><Lightning /></el-icon>
          </div>
          <div class="zg-inspector__meta">
            <h2 class="zg-inspector__name">{{ focusedScene.name }}</h2>
            <p class="zg-inspector__type">
              <el-tag :type="focusedScene.type === 'timer' ? 'primary' : 'success'" size="small">
                {{ focusedScene.type === 'timer' ? '定时预案' : '光感预案' }}
              </el-tag>
            </p>
            <span class="zg-status" :class="focusedScene.status === 'active' ? 'online' : 'idle'">
              <i class="dot"></i>{{ focusedScene.status === 'active' ? '已在役' : '未在役' }}
            </span>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">基本档案</h4>
          <div class="zg-inspector__grid">
            <div class="zg-inspector__cell">
              <span class="lbl">创建人</span>
              <span class="val">{{ focusedScene.creator }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">创建时间</span>
              <span class="val">{{ focusedScene.createTime }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">下发次数</span>
              <span class="val">{{ focusedScene.deployCount }} 次</span>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">策略配置</h4>
          <div v-if="focusedScene.type === 'timer'" class="zg-recipe">
            <div v-for="(action, index) in focusedScene.actions" :key="index" class="zg-recipe__row">
              <span class="zg-recipe__no">动作 {{ index + 1 }}</span>
              <el-tag size="small">{{ action.type === 'on' ? '开灯' : '关灯' }}</el-tag>
              <span class="zg-recipe__sep">执行时间：{{ action.time }}</span>
              <span class="zg-recipe__sep">执行星期：{{ action.weekDays.map(d => weekDayMap[d]).join('、') }}</span>
            </div>
          </div>
          <div v-else class="zg-recipe">
            <div class="zg-recipe__row">
              <span class="zg-recipe__sep">光感阈值：{{ focusedScene.lightThreshold }} lux</span>
            </div>
            <div class="zg-recipe__row">
              <span class="zg-recipe__sep">触发动作：{{ focusedScene.lightAction === 'on' ? '开灯' : '关灯' }}</span>
            </div>
            <div class="zg-recipe__row">
              <span class="zg-recipe__sep">生效时段：{{ focusedScene.lightTimeRange?.[0] }} 至 {{ focusedScene.lightTimeRange?.[1] }}</span>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">关联设备</h4>
          <el-table :data="resolveDevices(focusedScene.devices)" size="small" border>
            <el-table-column prop="key" label="编号" width="70" align="center" />
            <el-table-column prop="label" label="设备名称" min-width="140" />
          </el-table>
        </div>

        <div class="zg-inspector__actions">
          <el-button size="large" @click="sceneInspector.closeInspector()">关闭</el-button>
          <el-button
            type="warning"
            size="large"
            @click="onActivateScene(focusedScene)"
          >
            {{ focusedScene.status === 'active' ? '退役预案' : '激活预案' }}
          </el-button>
          <el-button type="success" size="large" @click="onDeployScene(focusedScene)">下发</el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 新建/修订抽屉 -->
    <el-drawer
      v-model="sceneForm.drawerOpen"
      :title="sceneForm.editMode === 'compose' ? '编排预案' : '修订预案'"
      direction="rtl"
      size="620px"
    >
      <el-form :model="sceneForm.draftPayload" label-width="100px" class="zg-draftform">
        <el-form-item label="预案名称" required>
          <el-input v-model="sceneForm.draftPayload.name" placeholder="请输入预案名称" />
        </el-form-item>
        <el-form-item label="策略类型" required>
          <el-radio-group v-model="sceneForm.draftPayload.type" @change="handleRecipeChange">
            <el-radio value="timer">定时预案</el-radio>
            <el-radio value="light">光感预案</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 定时预案配置 -->
        <template v-if="sceneForm.draftPayload.type === 'timer'">
          <el-divider content-position="left">定时动作配置</el-divider>
          <div class="zg-timerrecipe">
            <div v-for="(action, index) in sceneForm.draftPayload.actions" :key="index" class="zg-timerrecipe__row">
              <el-row :gutter="10">
                <el-col :span="5">
                  <el-select v-model="action.type" placeholder="动作类型" style="width: 100%">
                    <el-option label="开灯" value="on" />
                    <el-option label="关灯" value="off" />
                  </el-select>
                </el-col>
                <el-col :span="6">
                  <el-time-picker
                    v-model="action.time"
                    placeholder="执行时间"
                    format="HH:mm"
                    value-format="HH:mm"
                    style="width: 100%"
                  />
                </el-col>
                <el-col :span="11">
                  <el-checkbox-group v-model="action.weekDays" size="small">
                    <el-checkbox label="1">周一</el-checkbox>
                    <el-checkbox label="2">周二</el-checkbox>
                    <el-checkbox label="3">周三</el-checkbox>
                    <el-checkbox label="4">周四</el-checkbox>
                    <el-checkbox label="5">周五</el-checkbox>
                    <el-checkbox label="6">周六</el-checkbox>
                    <el-checkbox label="0">周日</el-checkbox>
                  </el-checkbox-group>
                </el-col>
                <el-col :span="2">
                  <el-button type="danger" circle size="small" @click="removeRecipeAction(index)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </el-col>
              </el-row>
            </div>
            <el-button type="primary" plain @click="addRecipeAction" style="width: 100%">+ 添加动作</el-button>
          </div>
        </template>

        <!-- 光感预案配置 -->
        <template v-if="sceneForm.draftPayload.type === 'light'">
          <el-divider content-position="left">光感策略配置</el-divider>
          <el-form-item label="光感阈值">
            <el-input-number v-model="sceneForm.draftPayload.lightThreshold" :min="0" :max="1000" placeholder="光照阈值 (lux)" />
            <span class="zg-draftform__unit">lux</span>
          </el-form-item>
          <el-form-item label="触发动作">
            <el-select v-model="sceneForm.draftPayload.lightAction" placeholder="选择触发动作" style="width: 100%">
              <el-option label="开灯" value="on" />
              <el-option label="关灯" value="off" />
            </el-select>
          </el-form-item>
          <el-form-item label="生效时段">
            <el-time-picker
              v-model="sceneForm.draftPayload.lightTimeRange"
              is-range
              placeholder="开始时间 - 结束时间"
              format="HH:mm"
              value-format="HH:mm"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              style="width: 100%"
            />
          </el-form-item>
        </template>

        <el-divider content-position="left">关联设备</el-divider>
        <el-form-item label="选择设备">
          <el-transfer
            v-model="sceneForm.draftPayload.devices"
            :data="deviceOptions"
            :titles="['可选设备', '已选设备']"
            filterable
            filter-placeholder="搜索设备"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="sceneForm.onDraftDiscard()">取消</el-button>
        <el-button
          type="primary"
          :loading="sceneForm.submitting"
          @click="onCommitSceneDraft"
        >
          {{ sceneForm.editMode === 'compose' ? '编排' : '保存修订' }}
        </el-button>
      </template>
    </el-drawer>
  </section>
</template>

<script setup>
/**
 * 智光云枢 · 能耗监测 · 强场景
 * 业务域：energyPulse
 * 功能：城市照明强场景预案的台账编排、策略配置与下发执行
 * @module energyPulse/StrongScene
 * @author 智光云枢研发团队
 */
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Lightning,
  Plus,
  Grid,
  List,
  Search,
  RefreshLeft,
  Delete
} from '@element-plus/icons-vue'
import { usePresetTable } from '@/shared/composables/usePresetTable'
import { useFormDraft } from '@/shared/composables/useFormDraft'
import { useDrawerInspector } from '@/shared/composables/useDrawerInspector'

// ---- 视图密度切换 ----
const densityMode = ref('card')

// ---- 星期映射 ----
const weekDayMap = {
  '0': '周日',
  '1': '周一',
  '2': '周二',
  '3': '周三',
  '4': '周四',
  '5': '周五',
  '6': '周六'
}

// ---- 初始 mock 数据池 ----
const initialScenes = [
  {
    id: 1,
    no: 1,
    name: '夜间照明预案',
    type: 'timer',
    status: 'active',
    deployCount: 15,
    creator: '管理员',
    createTime: '2026-05-10 10:00:00',
    actions: [
      { type: 'on', time: '18:00', weekDays: ['1', '2', '3', '4', '5'] },
      { type: 'off', time: '06:00', weekDays: ['1', '2', '3', '4', '5'] }
    ],
    devices: []
  },
  {
    id: 2,
    no: 2,
    name: '周末照明预案',
    type: 'timer',
    status: 'active',
    deployCount: 8,
    creator: '管理员',
    createTime: '2026-05-12 14:30:00',
    actions: [
      { type: 'on', time: '19:00', weekDays: ['6', '0'] },
      { type: 'off', time: '07:00', weekDays: ['6', '0'] }
    ],
    devices: []
  },
  {
    id: 3,
    no: 3,
    name: '阴天自动照明',
    type: 'light',
    status: 'inactive',
    deployCount: 5,
    creator: '管理员',
    createTime: '2026-05-13 09:00:00',
    lightThreshold: 200,
    lightAction: 'on',
    lightTimeRange: ['06:00', '20:00'],
    devices: []
  },
  {
    id: 4,
    no: 4,
    name: '强光自动关闭',
    type: 'light',
    status: 'active',
    deployCount: 3,
    creator: '管理员',
    createTime: '2026-05-14 16:00:00',
    lightThreshold: 800,
    lightAction: 'off',
    lightTimeRange: ['08:00', '18:00'],
    devices: []
  }
]

// ---- 设备候选池 ----
const deviceOptions = ref([
  { key: 1, label: '先导路集控1' },
  { key: 2, label: '先导路集控2' },
  { key: 3, label: '先导路集控1' },
  { key: 4, label: '先导路集控2' }
])

// ---- 表格数据容器（usePresetTable） ----
const sceneCtl = usePresetTable(null, {
  defaultPageSpan: 15,
  initialData: initialScenes
})

// ---- 概览指标派生 ----
const activeSceneCount = computed(
  () => sceneCtl.presetPlaybook.filter(s => s.status === 'active').length
)
const inactiveSceneCount = computed(
  () => sceneCtl.presetPlaybook.filter(s => s.status === 'inactive').length
)
const totalDeployCount = computed(
  () => sceneCtl.presetPlaybook.reduce((sum, s) => sum + (s.deployCount || 0), 0)
)

// ---- 表单草稿容器（useFormDraft） ----
const sceneForm = useFormDraft(
  {
    name: '',
    type: 'timer',
    actions: [
      { type: 'on', time: '18:00', weekDays: ['1', '2', '3', '4', '5', '6', '0'] }
    ],
    lightThreshold: 200,
    lightAction: 'on',
    lightTimeRange: ['06:00', '22:00'],
    devices: []
  },
  {
    validateFn: (draft) => {
      if (!draft.name) {
        ElMessage.warning('请输入预案名称')
        return false
      }
      if (draft.type === 'timer' && (!draft.actions || draft.actions.length === 0)) {
        ElMessage.warning('请至少添加一个定时动作')
        return false
      }
      return true
    }
  }
)

// ---- 详情抽屉容器（useDrawerInspector） ----
const sceneInspector = useDrawerInspector({ size: '680px', direction: 'rtl' })
const focusedScene = computed(() => sceneInspector.focusedRecord)

/**
 * 将设备键值数组解析为候选池中的完整记录
 * @param {number[]} keys 已选设备键值
 * @returns {Object[]} 设备记录
 */
const resolveDevices = (keys) => {
  if (!keys || keys.length === 0) return []
  return deviceOptions.value.filter(d => keys.includes(d.key))
}

/**
 * 提交草稿：根据编排/修订模式写入数据池
 * 业务流包装：新建生成预案编号，修订同步策略字段
 */
const onCommitSceneDraft = async () => {
  const snapshot = await sceneForm.onDraftCommit()
  if (!snapshot) return

  if (sceneForm.editMode === 'compose') {
    // 编排：附带运行态默认值
    sceneCtl.appendRecord({
      ...snapshot,
      no: sceneCtl.presetPlaybook.length + 1,
      status: 'inactive',
      deployCount: 0,
      creator: '管理员',
      createTime: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).replace(/\//g, '-')
    })
    ElMessage.success('预案编排成功，已并入强场景台账')
  } else {
    // 修订：合并更新到原记录
    const origin = sceneForm.originRecord
    sceneCtl.reviseRecord(origin.id, { ...snapshot })
    ElMessage.success('预案策略已更新')
  }
}

/**
 * 激活/退役场景：active↔inactive 切换，含二次确认
 * @param {Object} scene 目标预案
 */
const onActivateScene = (scene) => {
  const nextStatus = scene.status === 'active' ? 'inactive' : 'active'
  const verb = nextStatus === 'active' ? '激活' : '退役'
  ElMessageBox.confirm(
    `确认将「${scene.name}」${verb}？`,
    '生命周期变更确认',
    { type: 'warning' }
  )
    .then(() => {
      sceneCtl.reviseRecord(scene.id, { status: nextStatus })
      ElMessage.success(`预案已${verb}，运行回执已签收`)
    })
    .catch(() => {})
}

/**
 * 废止场景：二次确认后从台账中移除
 * @param {Object} scene 目标预案
 */
const onRetireScene = (scene) => {
  ElMessageBox.confirm(
    `确定要将「${scene.name}」从强场景台账中废止吗？`,
    '废止确认',
    { type: 'warning' }
  )
    .then(() => {
      sceneCtl.retireRecord(scene.id)
      ElMessage.success('预案已废止，台账已同步')
    })
    .catch(() => {})
}

/**
 * 下发场景：将预案下发到执行历史
 * @param {Object} scene 目标预案
 */
const onDeployScene = (scene) => {
  ElMessageBox.confirm(
    `确定要下发预案「${scene.name}」吗？`,
    '下发确认',
    { type: 'info' }
  )
    .then(() => {
      const deployTime = new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).replace(/\//g, '-')

      const historyList = JSON.parse(localStorage.getItem('sceneDeployHistory') || '[]')
      const record = {
        no: historyList.length + 1,
        sceneName: scene.name,
        operator: '管理员',
        deployTime,
        sceneId: scene.id,
        type: scene.type
      }
      historyList.unshift(record)
      localStorage.setItem('sceneDeployHistory', JSON.stringify(historyList))

      sceneCtl.reviseRecord(scene.id, { deployCount: (scene.deployCount || 0) + 1 })
      ElMessage.success(`预案「${scene.name}」下发成功`)
    })
    .catch(() => {})
}

/**
 * 策略类型切换时重置默认动作
 */
const handleRecipeChange = () => {
  if (sceneForm.draftPayload.type === 'timer') {
    sceneForm.draftPayload.actions = [
      { type: 'on', time: '18:00', weekDays: ['1', '2', '3', '4', '5', '6', '0'] }
    ]
  }
}

/**
 * 添加定时动作
 */
const addRecipeAction = () => {
  sceneForm.draftPayload.actions.push({
    type: 'on',
    time: '18:00',
    weekDays: ['1', '2', '3', '4', '5', '6', '0']
  })
}

/**
 * 移除定时动作
 * @param {number} index 动作索引
 */
const removeRecipeAction = (index) => {
  if (sceneForm.draftPayload.actions.length > 1) {
    sceneForm.draftPayload.actions.splice(index, 1)
  } else {
    ElMessage.warning('至少保留一个动作')
  }
}
</script>

<style scoped lang="scss">
.zg-strongscene {
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

.zg-scenecard {
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

  &.inactive {
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

  &__type {
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

.zg-recipe {
  padding: 14px 16px;
  background: var(--zg-surface-muted);
  border-radius: var(--zg-radius-md);

  &__row {
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  &__no {
    font-weight: 600;
    color: var(--zg-ink-secondary);
  }

  &__sep {
    font-size: 13px;
    color: var(--zg-ink-tertiary);
  }
}

.zg-timerrecipe {
  &__row {
    padding: 12px;
    background: var(--zg-surface-muted);
    border-radius: var(--zg-radius-md);
    margin-bottom: 10px;
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
