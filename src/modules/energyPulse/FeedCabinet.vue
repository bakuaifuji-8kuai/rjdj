<!--
  智光云枢 · 能源脉动 · 馈电柜监测
  业务域：energyPulse
  功能：城市照明供电中枢的馈电柜台账与实时监测
        支持卡片/列表双视图、抽屉式详情与编排、链路投切回执
-->
<template>
  <section class="zg-cabinet">
    <!-- 页面头部：品牌徽标 + 标题 + 概览指标 + 新建入口 -->
    <header class="zg-cabinet__head">
      <div class="zg-cabinet__headline">
        <div class="zg-cabinet__sigil">
          <el-icon :size="22"><Lightning /></el-icon>
        </div>
        <div class="zg-cabinet__copy">
          <h1 class="zg-cabinet__title">馈电柜监测</h1>
          <p class="zg-cabinet__sub">
            城市照明供电中枢 · 在役 {{ activeCabinetCount }} 台 ·
            离线 {{ offlineCabinetCount }} 台 · 累计链路 {{ totalCircuitCount }} 条
          </p>
        </div>
      </div>
      <div class="zg-cabinet__cta">
        <el-button type="primary" @click="cabinetForm.openComposer()">
          <el-icon><Plus /></el-icon>
          <span>登记馈电柜</span>
        </el-button>
      </div>
    </header>

    <!-- 概览指标卡 -->
    <div class="zg-metrics">
      <div class="zg-metrics__cell">
        <span class="zg-metrics__num">{{ cabinetCtl.totalRows }}</span>
        <span class="zg-metrics__lbl">馈电柜总数</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--ok">
        <span class="zg-metrics__num">{{ activeCabinetCount }}</span>
        <span class="zg-metrics__lbl">在线运行</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--warn">
        <span class="zg-metrics__num">{{ offlineCabinetCount }}</span>
        <span class="zg-metrics__lbl">离线待检</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--info">
        <span class="zg-metrics__num">{{ totalCircuitCount }}</span>
        <span class="zg-metrics__lbl">链路总数</span>
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
          v-model="cabinetCtl.statusBuckets"
          placeholder="运行状态"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="在线" value="在线" />
          <el-option label="离线" value="离线" />
        </el-select>
        <el-select
          v-model="cabinetCtl.typeBucket"
          placeholder="所属区域"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="长沙-岳麓区" value="长沙-岳麓区" />
          <el-option label="长沙-天心区" value="长沙-天心区" />
          <el-option label="长沙-开福区" value="长沙-开福区" />
        </el-select>
        <el-input
          v-model="cabinetCtl.filterLexicon"
          placeholder="检索设备名称/编号"
          clearable
          class="zg-filterband__search"
          @keyup.enter="cabinetCtl.onFilterApply()"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="cabinetCtl.onFilterApply()">
          <el-icon><Search /></el-icon>
          <span>检索</span>
        </el-button>
        <el-button @click="cabinetCtl.onFilterReset()">
          <el-icon><RefreshLeft /></el-icon>
          <span>重置</span>
        </el-button>
      </div>
    </div>

    <!-- 卡片视图 -->
    <div v-if="densityMode === 'card'" class="zg-cardgrid">
      <article
        v-for="cabinet in cabinetCtl.pagedRows"
        :key="cabinet.id"
        class="zg-cabinetcard"
        :class="cabinet.status === '在线' ? 'online' : 'offline'"
        @click="cabinetInspector.openInspector(cabinet)"
      >
        <div class="zg-cabinetcard__head">
          <div class="zg-cabinetcard__glyph">
            <el-icon :size="24"><Lightning /></el-icon>
          </div>
          <span class="zg-status" :class="cabinet.status === '在线' ? 'online' : 'offline'">
            <i class="dot"></i>{{ cabinet.status }}
          </span>
        </div>
        <div class="zg-cabinetcard__body">
          <h3 class="zg-cabinetcard__name">{{ cabinet.name }}</h3>
          <p class="zg-cabinetcard__area">{{ cabinet.area }} · {{ cabinet.model }}</p>
          <div class="zg-cabinetcard__stats">
            <span class="zg-cabinetcard__stat">
              <em>{{ cabinet.voltage }}</em> V
            </span>
            <span class="zg-cabinetcard__stat">
              <em>{{ cabinet.power }}</em> kW
            </span>
            <span class="zg-cabinetcard__stat">
              <em>{{ cabinet.circuitCount }}</em> 链路
            </span>
          </div>
        </div>
        <div class="zg-cabinetcard__foot">
          <span class="zg-cabinetcard__time">{{ cabinet.installTime }}</span>
          <div class="zg-cabinetcard__actions">
            <el-button link type="primary" size="small" @click.stop="onToggleCabinet(cabinet)">
              {{ cabinet.status === '在线' ? '停运' : '投运' }}
            </el-button>
            <el-button link type="primary" size="small" @click.stop="cabinetForm.openReviser(cabinet)">修订</el-button>
            <el-button link type="danger" size="small" @click.stop="onRetireCabinet(cabinet)">废止</el-button>
          </div>
        </div>
      </article>
    </div>

    <!-- 列表视图 -->
    <div v-else class="zg-tablewrap">
      <el-table :data="cabinetCtl.pagedRows" stripe class="zg-datatable">
        <el-table-column prop="no" label="序号" width="60" align="center" />
        <el-table-column prop="area" label="所属区域" width="130" />
        <el-table-column prop="name" label="设备名称" min-width="150" />
        <el-table-column prop="model" label="设备型号" width="110" />
        <el-table-column label="运行状态" width="100" align="center">
          <template #default="{ row }">
            <span class="zg-status" :class="row.status === '在线' ? 'online' : 'offline'">
              <i class="dot"></i>{{ row.status }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="voltage" label="电压(V)" width="100" align="center" />
        <el-table-column prop="power" label="功率(kW)" width="100" align="center" />
        <el-table-column prop="circuitCount" label="链路数" width="90" align="center" />
        <el-table-column prop="installTime" label="投运时间" width="130" />
        <el-table-column label="处置" width="240" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="cabinetInspector.openInspector(row)">详情</el-button>
            <el-button type="warning" size="small" @click="onToggleCabinet(row)">
              {{ row.status === '在线' ? '停运' : '投运' }}
            </el-button>
            <el-button type="primary" size="small" @click="cabinetForm.openReviser(row)">修订</el-button>
            <el-button type="danger" size="small" @click="onRetireCabinet(row)">废止</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页条 -->
    <div class="zg-pagerbar">
      <el-pagination
        v-model:current-page="cabinetCtl.pagingCursor"
        v-model:page-size="cabinetCtl.pageSpan"
        :total="cabinetCtl.totalRows"
        :page-sizes="[10, 15, 20, 50, 100]"
        layout="prev, pager, next, jumper, ->, sizes, total"
        background
      />
    </div>

    <!-- 详情抽屉 -->
    <el-drawer
      v-model="cabinetInspector.drawerOpen"
      :title="'馈电柜详情 · ' + (focusedCabinet?.name || '')"
      direction="rtl"
      size="680px"
    >
      <div v-if="focusedCabinet" class="zg-inspector">
        <div class="zg-inspector__head">
          <div class="zg-inspector__glyph">
            <el-icon :size="36"><Lightning /></el-icon>
          </div>
          <div class="zg-inspector__meta">
            <h2 class="zg-inspector__name">{{ focusedCabinet.name }}</h2>
            <p class="zg-inspector__type">{{ focusedCabinet.area }} · {{ focusedCabinet.model }}</p>
            <span class="zg-status" :class="focusedCabinet.status === '在线' ? 'online' : 'offline'">
              <i class="dot"></i>{{ focusedCabinet.status }}
            </span>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">基本档案</h4>
          <div class="zg-inspector__grid">
            <div class="zg-inspector__cell">
              <span class="lbl">投运时间</span>
              <span class="val">{{ focusedCabinet.installTime }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">运行时长</span>
              <span class="val">{{ focusedCabinet.runTime }} h</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">备注</span>
              <span class="val">{{ focusedCabinet.remark || '-' }}</span>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">实时遥测</h4>
          <div class="zg-datagrid">
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">电压</div>
              <div class="zg-datacard__val">{{ focusedCabinet.voltage }}<em>V</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">功率</div>
              <div class="zg-datacard__val">{{ focusedCabinet.power }}<em>kW</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">链路数</div>
              <div class="zg-datacard__val">{{ focusedCabinet.circuitCount }}<em>条</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">运行时长</div>
              <div class="zg-datacard__val">{{ focusedCabinet.runTime }}<em>h</em></div>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">链路清单</h4>
          <el-table :data="focusedCabinet.circuits" size="small" border>
            <el-table-column prop="no" label="序号" width="60" align="center" />
            <el-table-column prop="name" label="链路名称" min-width="120" />
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
          <el-button size="large" @click="cabinetInspector.closeInspector()">关闭</el-button>
          <el-button
            type="warning"
            size="large"
            @click="onToggleCabinet(focusedCabinet)"
          >
            {{ focusedCabinet.status === '在线' ? '停运柜体' : '投运柜体' }}
          </el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 新建/修订抽屉 -->
    <el-drawer
      v-model="cabinetForm.drawerOpen"
      :title="cabinetForm.editMode === 'compose' ? '登记馈电柜' : '修订馈电柜'"
      direction="rtl"
      size="560px"
    >
      <el-form :model="cabinetForm.draftPayload" label-width="96px" class="zg-draftform">
        <el-form-item label="所属区域" required>
          <el-select v-model="cabinetForm.draftPayload.area" placeholder="请选择所属区域" style="width: 100%">
            <el-option label="长沙-岳麓区" value="长沙-岳麓区" />
            <el-option label="长沙-天心区" value="长沙-天心区" />
            <el-option label="长沙-开福区" value="长沙-开福区" />
          </el-select>
        </el-form-item>
        <el-form-item label="设备名称" required>
          <el-input v-model="cabinetForm.draftPayload.name" placeholder="请输入设备名称" />
        </el-form-item>
        <el-form-item label="设备型号" required>
          <el-input v-model="cabinetForm.draftPayload.model" placeholder="请输入设备型号" />
        </el-form-item>
        <el-form-item label="额定电压">
          <el-input-number v-model="cabinetForm.draftPayload.voltage" :min="0" :max="1000" />
          <span class="zg-draftform__unit">V</span>
        </el-form-item>
        <el-form-item label="额定功率">
          <el-input-number v-model="cabinetForm.draftPayload.power" :min="0" :max="1000" />
          <span class="zg-draftform__unit">kW</span>
        </el-form-item>
        <el-form-item label="链路数量">
          <el-input-number v-model="cabinetForm.draftPayload.circuitCount" :min="1" :max="100" />
          <span class="zg-draftform__unit">条</span>
        </el-form-item>
        <el-form-item label="投运时间">
          <el-date-picker
            v-model="cabinetForm.draftPayload.installTime"
            type="date"
            placeholder="选择投运时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="cabinetForm.draftPayload.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cabinetForm.onDraftDiscard()">取消</el-button>
        <el-button
          type="primary"
          :loading="cabinetForm.submitting"
          @click="onCommitCabinetDraft"
        >
          {{ cabinetForm.editMode === 'compose' ? '登记' : '保存修订' }}
        </el-button>
      </template>
    </el-drawer>
  </section>
</template>

<script setup>
/**
 * 智光云枢 · 能源脉动 · 馈电柜监测
 * 业务域：energyPulse
 * 功能：城市照明供电中枢的馈电柜台账与实时监测
 * @module energyPulse/FeedCabinet
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
  RefreshLeft
} from '@element-plus/icons-vue'
import { usePresetTable } from '@/shared/composables/usePresetTable'
import { useFormDraft } from '@/shared/composables/useFormDraft'
import { useDrawerInspector } from '@/shared/composables/useDrawerInspector'

// ---- 视图密度切换 ----
const densityMode = ref('card')

// ---- 初始 mock 数据池 ----
const initialCabinets = [
  {
    id: 1,
    no: 1,
    area: '长沙-岳麓区',
    name: '先导路1号馈电柜',
    model: 'GGD-1',
    status: '在线',
    voltage: 380,
    power: 50,
    circuitCount: 8,
    installTime: '2024-01-15',
    remark: '主路馈电柜',
    runTime: 8760,
    circuits: [
      { no: 1, name: '链路1', status: '开启', current: 25, power: 6 },
      { no: 2, name: '链路2', status: '开启', current: 22, power: 5 },
      { no: 3, name: '链路3', status: '关闭', current: 0, power: 0 },
      { no: 4, name: '链路4', status: '开启', current: 18, power: 4 }
    ]
  },
  {
    id: 2,
    no: 2,
    area: '长沙-岳麓区',
    name: '先导路2号馈电柜',
    model: 'GGD-1',
    status: '在线',
    voltage: 380,
    power: 45,
    circuitCount: 6,
    installTime: '2024-02-20',
    remark: '辅路馈电柜',
    runTime: 7200,
    circuits: []
  },
  {
    id: 3,
    no: 3,
    area: '长沙-天心区',
    name: '芙蓉路1号馈电柜',
    model: 'GGD-2',
    status: '离线',
    voltage: 0,
    power: 0,
    circuitCount: 10,
    installTime: '2024-03-10',
    remark: '待检修',
    runTime: 5000,
    circuits: []
  },
  {
    id: 4,
    no: 4,
    area: '长沙-天心区',
    name: '芙蓉路2号馈电柜',
    model: 'GGD-1',
    status: '在线',
    voltage: 380,
    power: 55,
    circuitCount: 8,
    installTime: '2024-04-05',
    remark: '',
    runTime: 4500,
    circuits: []
  },
  {
    id: 5,
    no: 5,
    area: '长沙-开福区',
    name: '湘江路1号馈电柜',
    model: 'GGD-2',
    status: '在线',
    voltage: 380,
    power: 60,
    circuitCount: 12,
    installTime: '2024-05-18',
    remark: '新建',
    runTime: 2800,
    circuits: []
  }
]

// ---- 表格数据容器（usePresetTable） ----
const cabinetCtl = usePresetTable(null, {
  defaultPageSpan: 15,
  initialData: initialCabinets
})

// ---- 概览指标派生 ----
const activeCabinetCount = computed(
  () => cabinetCtl.presetPlaybook.filter(c => c.status === '在线').length
)
const offlineCabinetCount = computed(
  () => cabinetCtl.presetPlaybook.filter(c => c.status === '离线').length
)
const totalCircuitCount = computed(
  () => cabinetCtl.presetPlaybook.reduce((sum, c) => sum + (c.circuitCount || 0), 0)
)

// ---- 表单草稿容器（useFormDraft） ----
const cabinetForm = useFormDraft(
  {
    area: '',
    name: '',
    model: '',
    voltage: 0,
    power: 0,
    circuitCount: 1,
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
        ElMessage.warning('请输入设备名称')
        return false
      }
      if (!draft.model) {
        ElMessage.warning('请输入设备型号')
        return false
      }
      return true
    }
  }
)

// ---- 详情抽屉容器（useDrawerInspector） ----
const cabinetInspector = useDrawerInspector({ size: '680px', direction: 'rtl' })
const focusedCabinet = computed(() => cabinetInspector.focusedRecord)

/**
 * 提交草稿：根据编排/修订模式写入数据池
 * 业务流包装：新建生成设备编号，修订同步遥测字段
 */
const onCommitCabinetDraft = async () => {
  const snapshot = await cabinetForm.onDraftCommit()
  if (!snapshot) return

  if (cabinetForm.editMode === 'compose') {
    // 登记：附带运行态默认值
    cabinetCtl.appendRecord({
      ...snapshot,
      no: cabinetCtl.presetPlaybook.length + 1,
      status: '在线',
      runTime: 0,
      circuits: []
    })
    ElMessage.success('馈电柜登记成功，已并入供电台账')
  } else {
    // 修订：合并更新到原记录
    const origin = cabinetForm.originRecord
    cabinetCtl.reviseRecord(origin.id, { ...snapshot })
    ElMessage.success('馈电柜档案已更新')
  }
}

/**
 * 投切柜体：在线↔离线切换，含幂等回执避免重复投切
 * @param {Object} cabinet 目标馈电柜
 */
const onToggleCabinet = (cabinet) => {
  const nextStatus = cabinet.status === '在线' ? '离线' : '在线'
  ElMessageBox.confirm(
    `确认将「${cabinet.name}」${nextStatus === '在线' ? '投运' : '停运'}？`,
    '投切确认',
    { type: 'warning' }
  )
    .then(() => {
      cabinetCtl.reviseRecord(cabinet.id, { status: nextStatus })
      ElMessage.success(`柜体已${nextStatus === '在线' ? '投运' : '停运'}，遥测回执已签收`)
    })
    .catch(() => {})
}

/**
 * 废止柜体：二次确认后从台账中移除
 * @param {Object} cabinet 目标馈电柜
 */
const onRetireCabinet = (cabinet) => {
  ElMessageBox.confirm(
    `确定要将「${cabinet.name}」从供电台账中废止吗？`,
    '废止确认',
    { type: 'warning' }
  )
    .then(() => {
      cabinetCtl.retireRecord(cabinet.id)
      ElMessage.success('柜体已废止，台账已同步')
    })
    .catch(() => {})
}
</script>

<style scoped lang="scss">
.zg-cabinet {
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

.zg-cabinetcard {
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
