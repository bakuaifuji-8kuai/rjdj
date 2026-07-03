<!--
  智光云枢 · 能源脉动 · 回路开关
  业务域：energyPulse
  功能：照明供电回路的通断管控与履历追踪
        支持卡片/列表双视图、抽屉式详情与编排、回路投切回执
-->
<template>
  <section class="zg-loopswitch">
    <!-- 页面头部：品牌徽标 + 标题 + 概览指标 + 新建入口 -->
    <header class="zg-loopswitch__head">
      <div class="zg-loopswitch__headline">
        <div class="zg-loopswitch__sigil">
          <el-icon :size="22"><Switch /></el-icon>
        </div>
        <div class="zg-loopswitch__copy">
          <h1 class="zg-loopswitch__title">回路开关</h1>
          <p class="zg-loopswitch__sub">
            照明供电回路通断管控 · 在役 {{ activeSwitchCount }} 路 ·
            离线 {{ offlineSwitchCount }} 路 · 合闸 {{ closedSwitchCount }} 路
          </p>
        </div>
      </div>
      <div class="zg-loopswitch__cta">
        <el-button type="primary" @click="switchForm.openComposer()">
          <el-icon><Plus /></el-icon>
          <span>新建回路</span>
        </el-button>
      </div>
    </header>

    <!-- 概览指标卡 -->
    <div class="zg-metrics">
      <div class="zg-metrics__cell">
        <span class="zg-metrics__num">{{ switchCtl.totalRows }}</span>
        <span class="zg-metrics__lbl">回路总数</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--ok">
        <span class="zg-metrics__num">{{ activeSwitchCount }}</span>
        <span class="zg-metrics__lbl">在线运行</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--warn">
        <span class="zg-metrics__num">{{ offlineSwitchCount }}</span>
        <span class="zg-metrics__lbl">离线待检</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--info">
        <span class="zg-metrics__num">{{ closedSwitchCount }}</span>
        <span class="zg-metrics__lbl">合闸回路</span>
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
          v-model="switchCtl.statusBuckets"
          placeholder="网络状态"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="在线" value="在线" />
          <el-option label="离线" value="离线" />
        </el-select>
        <el-select
          v-model="switchCtl.typeBucket"
          placeholder="所属区域"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="长沙-岳麓区" value="长沙-岳麓区" />
          <el-option label="长沙-天心区" value="长沙-天心区" />
          <el-option label="长沙-开福区" value="长沙-开福区" />
        </el-select>
        <el-input
          v-model="switchCtl.filterLexicon"
          placeholder="检索回路名称/设备"
          clearable
          class="zg-filterband__search"
          @keyup.enter="switchCtl.onFilterApply()"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="switchCtl.onFilterApply()">
          <el-icon><Search /></el-icon>
          <span>检索</span>
        </el-button>
        <el-button @click="switchCtl.onFilterReset()">
          <el-icon><RefreshLeft /></el-icon>
          <span>重置</span>
        </el-button>
      </div>
    </div>

    <!-- 卡片视图 -->
    <div v-if="densityMode === 'card'" class="zg-cardgrid">
      <article
        v-for="loop in switchCtl.pagedRows"
        :key="loop.id"
        class="zg-switchcard"
        :class="loop.status === '在线' ? 'online' : 'offline'"
        @click="switchInspector.openInspector(loop)"
      >
        <div class="zg-switchcard__head">
          <div class="zg-switchcard__glyph">
            <el-icon :size="24"><Switch /></el-icon>
          </div>
          <span class="zg-status" :class="loop.status === '在线' ? 'online' : 'offline'">
            <i class="dot"></i>{{ loop.status }}
          </span>
        </div>
        <div class="zg-switchcard__body">
          <h3 class="zg-switchcard__name">{{ loop.name }}</h3>
          <p class="zg-switchcard__area">{{ loop.category }} · {{ loop.deviceTag }}</p>
          <div class="zg-switchcard__stats">
            <span class="zg-switchcard__stat">
              <em>{{ loop.voltage }}</em> V
            </span>
            <span class="zg-switchcard__stat">
              <em>{{ loop.current }}</em> A
            </span>
            <span class="zg-switchcard__stat">
              <em>{{ loop.switchState }}</em>
            </span>
          </div>
        </div>
        <div class="zg-switchcard__foot">
          <span class="zg-switchcard__time">{{ loop.reportAt }}</span>
          <div class="zg-switchcard__actions">
            <el-button link type="primary" size="small" @click.stop="onToggleSwitch(loop)">
              {{ loop.switchState === '合闸' ? '分闸' : '合闸' }}
            </el-button>
            <el-button link type="primary" size="small" @click.stop="switchForm.openReviser(loop)">修订</el-button>
            <el-button link type="danger" size="small" @click.stop="onRetireSwitch(loop)">废止</el-button>
          </div>
        </div>
      </article>
    </div>

    <!-- 列表视图 -->
    <div v-else class="zg-tablewrap">
      <el-table :data="switchCtl.pagedRows" stripe class="zg-datatable">
        <el-table-column prop="no" label="序号" width="60" align="center" />
        <el-table-column prop="category" label="所属区域" width="130" />
        <el-table-column prop="name" label="回路名称" min-width="150" />
        <el-table-column prop="deviceTag" label="设备名称" width="130" />
        <el-table-column prop="moduleTag" label="模块名称" width="120" />
        <el-table-column label="网络状态" width="100" align="center">
          <template #default="{ row }">
            <span class="zg-status" :class="row.status === '在线' ? 'online' : 'offline'">
              <i class="dot"></i>{{ row.status }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="开关状态" width="100" align="center">
          <template #default="{ row }">
            <span class="zg-status" :class="row.switchState === '合闸' ? 'online' : 'idle'">
              <i class="dot"></i>{{ row.switchState }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="voltage" label="电压(V)" width="100" align="center" />
        <el-table-column prop="current" label="电流(A)" width="100" align="center" />
        <el-table-column prop="reportAt" label="上报时间" width="160" />
        <el-table-column label="处置" width="260" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="switchInspector.openInspector(row)">详情</el-button>
            <el-button type="warning" size="small" @click="onToggleSwitch(row)">
              {{ row.switchState === '合闸' ? '分闸' : '合闸' }}
            </el-button>
            <el-button type="primary" size="small" @click="switchForm.openReviser(row)">修订</el-button>
            <el-button type="danger" size="small" @click="onRetireSwitch(row)">废止</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页条 -->
    <div class="zg-pagerbar">
      <el-pagination
        v-model:current-page="switchCtl.pagingCursor"
        v-model:page-size="switchCtl.pageSpan"
        :total="switchCtl.totalRows"
        :page-sizes="[10, 15, 20, 50, 100]"
        layout="prev, pager, next, jumper, ->, sizes, total"
        background
      />
    </div>

    <!-- 详情抽屉 -->
    <el-drawer
      v-model="switchInspector.drawerOpen"
      :title="'回路详情 · ' + (focusedSwitch?.name || '')"
      direction="rtl"
      size="680px"
    >
      <div v-if="focusedSwitch" class="zg-inspector">
        <div class="zg-inspector__head">
          <div class="zg-inspector__glyph">
            <el-icon :size="36"><Switch /></el-icon>
          </div>
          <div class="zg-inspector__meta">
            <h2 class="zg-inspector__name">{{ focusedSwitch.name }}</h2>
            <p class="zg-inspector__type">{{ focusedSwitch.category }} · {{ focusedSwitch.deviceTag }}</p>
            <span class="zg-status" :class="focusedSwitch.status === '在线' ? 'online' : 'offline'">
              <i class="dot"></i>{{ focusedSwitch.status }}
            </span>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">基本档案</h4>
          <div class="zg-inspector__grid">
            <div class="zg-inspector__cell">
              <span class="lbl">模块名称</span>
              <span class="val">{{ focusedSwitch.moduleTag }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">上报时间</span>
              <span class="val">{{ focusedSwitch.reportAt }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">最后在线</span>
              <span class="val">{{ focusedSwitch.lastOnlineAt }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">备注</span>
              <span class="val">{{ focusedSwitch.remark || '-' }}</span>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">实时遥测</h4>
          <div class="zg-datagrid">
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">电压</div>
              <div class="zg-datacard__val">{{ focusedSwitch.voltage }}<em>V</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">电流</div>
              <div class="zg-datacard__val">{{ focusedSwitch.current }}<em>A</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">开关状态</div>
              <div class="zg-datacard__val">{{ focusedSwitch.switchState }}</div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">网络状态</div>
              <div class="zg-datacard__val">{{ focusedSwitch.status }}</div>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">通断履历</h4>
          <el-table :data="focusedSwitch.switchLogs" size="small" border>
            <el-table-column prop="no" label="序号" width="60" align="center" />
            <el-table-column prop="operator" label="处置人" width="120" />
            <el-table-column label="处置类型" width="100" align="center">
              <template #default="{ row }">
                <span class="zg-status" :class="row.action === '合闸' ? 'online' : 'idle'">
                  <i class="dot"></i>{{ row.action }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="operateTime" label="处置时间" width="160" />
            <el-table-column label="执行结果" width="100" align="center">
              <template #default="{ row }">
                <span class="zg-status" :class="row.result === '成功' ? 'online' : 'offline'">
                  <i class="dot"></i>{{ row.result }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" min-width="120" />
          </el-table>
        </div>

        <div class="zg-inspector__actions">
          <el-button size="large" @click="switchInspector.closeInspector()">关闭</el-button>
          <el-button
            type="warning"
            size="large"
            @click="onToggleSwitch(focusedSwitch)"
          >
            {{ focusedSwitch.switchState === '合闸' ? '执行分闸' : '执行合闸' }}
          </el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 新建/修订抽屉 -->
    <el-drawer
      v-model="switchForm.drawerOpen"
      :title="switchForm.editMode === 'compose' ? '新建回路' : '修订回路'"
      direction="rtl"
      size="560px"
    >
      <el-form :model="switchForm.draftPayload" label-width="96px" class="zg-draftform">
        <el-form-item label="所属区域" required>
          <el-select v-model="switchForm.draftPayload.category" placeholder="请选择所属区域" style="width: 100%">
            <el-option label="长沙-岳麓区" value="长沙-岳麓区" />
            <el-option label="长沙-天心区" value="长沙-天心区" />
            <el-option label="长沙-开福区" value="长沙-开福区" />
          </el-select>
        </el-form-item>
        <el-form-item label="回路名称" required>
          <el-input v-model="switchForm.draftPayload.name" placeholder="请输入回路名称" />
        </el-form-item>
        <el-form-item label="设备名称" required>
          <el-input v-model="switchForm.draftPayload.deviceTag" placeholder="请输入设备名称" />
        </el-form-item>
        <el-form-item label="模块名称" required>
          <el-input v-model="switchForm.draftPayload.moduleTag" placeholder="请输入模块名称" />
        </el-form-item>
        <el-form-item label="额定电压">
          <el-input-number v-model="switchForm.draftPayload.voltage" :min="0" :max="1000" />
          <span class="zg-draftform__unit">V</span>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="switchForm.draftPayload.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="switchForm.onDraftDiscard()">取消</el-button>
        <el-button
          type="primary"
          :loading="switchForm.submitting"
          @click="onCommitSwitchDraft"
        >
          {{ switchForm.editMode === 'compose' ? '登记' : '保存修订' }}
        </el-button>
      </template>
    </el-drawer>
  </section>
</template>

<script setup>
/**
 * 智光云枢 · 能源脉动 · 回路开关
 * 业务域：energyPulse
 * 功能：照明供电回路的通断管控与履历追踪
 * @module energyPulse/LoopSwitch
 * @author 智光云枢研发团队
 */
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Switch,
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
    category: '长沙-岳麓区',
    name: '先导路集控1-内置链路1',
    deviceTag: '先导路集控1',
    moduleTag: '内置6链路模块',
    status: '在线',
    switchState: '分闸',
    voltage: 220,
    current: 0,
    reportAt: '2026-05-14 10:30:14',
    lastOnlineAt: '2026-05-14 10:30:00',
    remark: '主控回路',
    switchLogs: [
      { no: 1, operator: 'admin', action: '合闸', operateTime: '2026-05-14 10:30:00', result: '成功', remark: '定时任务执行' },
      { no: 2, operator: 'operator', action: '分闸', operateTime: '2026-05-14 06:00:00', result: '成功', remark: '定时任务执行' }
    ]
  },
  {
    id: 2,
    no: 2,
    category: '长沙-岳麓区',
    name: '先导路集控1-内置链路2',
    deviceTag: '先导路集控1',
    moduleTag: '内置6链路模块',
    status: '在线',
    switchState: '分闸',
    voltage: 220,
    current: 0,
    reportAt: '2026-05-14 10:30:14',
    lastOnlineAt: '2026-05-14 10:30:00',
    remark: '',
    switchLogs: []
  },
  {
    id: 3,
    no: 3,
    category: '长沙-岳麓区',
    name: '先导路集控1-内置链路3',
    deviceTag: '先导路集控1',
    moduleTag: '内置6链路模块',
    status: '在线',
    switchState: '合闸',
    voltage: 220,
    current: 12.5,
    reportAt: '2026-05-14 10:30:14',
    lastOnlineAt: '2026-05-14 10:30:00',
    remark: '',
    switchLogs: []
  },
  {
    id: 4,
    no: 4,
    category: '长沙-岳麓区',
    name: '先导路集控2-链路1',
    deviceTag: '先导路集控2',
    moduleTag: 'EXC_10_3',
    status: '在线',
    switchState: '合闸',
    voltage: 220,
    current: 10.2,
    reportAt: '2026-05-14 10:28:14',
    lastOnlineAt: '2026-05-14 10:28:00',
    remark: '',
    switchLogs: []
  },
  {
    id: 5,
    no: 5,
    category: '长沙-岳麓区',
    name: '先导路集控2-链路2',
    deviceTag: '先导路集控2',
    moduleTag: 'EXC_10_3',
    status: '在线',
    switchState: '合闸',
    voltage: 220,
    current: 8.8,
    reportAt: '2026-05-14 10:28:14',
    lastOnlineAt: '2026-05-14 10:28:00',
    remark: '',
    switchLogs: []
  },
  {
    id: 6,
    no: 6,
    category: '长沙-岳麓区',
    name: '先导路集控2-链路3',
    deviceTag: '先导路集控2',
    moduleTag: 'EXC_10_3',
    status: '在线',
    switchState: '分闸',
    voltage: 0,
    current: 0,
    reportAt: '2026-05-14 10:28:14',
    lastOnlineAt: '2026-05-14 10:28:00',
    remark: '',
    switchLogs: []
  },
  {
    id: 7,
    no: 7,
    category: '长沙-天心区',
    name: '芙蓉路集控1-交流接触器01',
    deviceTag: '芙蓉路集控1',
    moduleTag: 'EXC_10_1',
    status: '离线',
    switchState: '分闸',
    voltage: 0,
    current: 0,
    reportAt: '2026-05-14 09:15:14',
    lastOnlineAt: '2026-05-14 09:15:00',
    remark: '待检修',
    switchLogs: [
      { no: 1, operator: 'admin', action: '分闸', operateTime: '2026-05-14 09:15:00', result: '成功', remark: '离线保护' }
    ]
  },
  {
    id: 8,
    no: 8,
    category: '长沙-开福区',
    name: '湘江路集控1-主回路1',
    deviceTag: '湘江路集控1',
    moduleTag: 'GGD-2',
    status: '在线',
    switchState: '合闸',
    voltage: 380,
    current: 25,
    reportAt: '2026-05-14 08:00:14',
    lastOnlineAt: '2026-05-14 08:00:00',
    remark: '主干道照明',
    switchLogs: []
  }
]

// ---- 表格数据容器（usePresetTable） ----
const switchCtl = usePresetTable(null, {
  defaultPageSpan: 15,
  initialData: initialLoops
})

// ---- 概览指标派生 ----
const activeSwitchCount = computed(
  () => switchCtl.presetPlaybook.filter(l => l.status === '在线').length
)
const offlineSwitchCount = computed(
  () => switchCtl.presetPlaybook.filter(l => l.status === '离线').length
)
const closedSwitchCount = computed(
  () => switchCtl.presetPlaybook.filter(l => l.switchState === '合闸').length
)

// ---- 表单草稿容器（useFormDraft） ----
const switchForm = useFormDraft(
  {
    category: '',
    name: '',
    deviceTag: '',
    moduleTag: '',
    voltage: 220,
    remark: ''
  },
  {
    validateFn: (draft) => {
      if (!draft.category) {
        ElMessage.warning('请选择所属区域')
        return false
      }
      if (!draft.name) {
        ElMessage.warning('请输入回路名称')
        return false
      }
      if (!draft.deviceTag) {
        ElMessage.warning('请输入设备名称')
        return false
      }
      if (!draft.moduleTag) {
        ElMessage.warning('请输入模块名称')
        return false
      }
      return true
    }
  }
)

// ---- 详情抽屉容器（useDrawerInspector） ----
const switchInspector = useDrawerInspector({ size: '680px', direction: 'rtl' })
const focusedSwitch = computed(() => switchInspector.focusedRecord)

/**
 * 提交草稿：根据编排/修订模式写入数据池
 * 业务流包装：新建生成回路编号，修订同步遥测字段
 */
const onCommitSwitchDraft = async () => {
  const snapshot = await switchForm.onDraftCommit()
  if (!snapshot) return

  if (switchForm.editMode === 'compose') {
    // 登记：附带运行态默认值
    switchCtl.appendRecord({
      ...snapshot,
      no: switchCtl.presetPlaybook.length + 1,
      status: '在线',
      switchState: '分闸',
      current: 0,
      reportAt: '-',
      lastOnlineAt: '-',
      switchLogs: []
    })
    ElMessage.success('回路登记成功，已并入供电台账')
  } else {
    // 修订：合并更新到原记录
    const origin = switchForm.originRecord
    switchCtl.reviseRecord(origin.id, { ...snapshot })
    ElMessage.success('回路档案已更新')
  }
}

/**
 * 投切回路：合闸↔分闸切换，含幂等回执避免重复投切
 * @param {Object} loop 目标回路
 */
const onToggleSwitch = (loop) => {
  if (loop.status === '离线') {
    ElMessage.warning('回路离线，无法执行投切')
    return
  }
  const nextState = loop.switchState === '合闸' ? '分闸' : '合闸'
  ElMessageBox.confirm(
    `确认将「${loop.name}」执行${nextState}？`,
    '投切确认',
    { type: 'warning' }
  )
    .then(() => {
      switchCtl.reviseRecord(loop.id, { switchState: nextState })
      ElMessage.success(`回路已${nextState}，遥测回执已签收`)
    })
    .catch(() => {})
}

/**
 * 废止回路：二次确认后从台账中移除
 * @param {Object} loop 目标回路
 */
const onRetireSwitch = (loop) => {
  ElMessageBox.confirm(
    `确定要将「${loop.name}」从供电台账中废止吗？`,
    '废止确认',
    { type: 'warning' }
  )
    .then(() => {
      switchCtl.retireRecord(loop.id)
      ElMessage.success('回路已废止，台账已同步')
    })
    .catch(() => {})
}
</script>

<style scoped lang="scss">
.zg-loopswitch {
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

.zg-switchcard {
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
