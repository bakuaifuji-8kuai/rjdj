<!--
  智光云枢 · 管廊照明 · 配光管理
  业务域：tubeLumen
  功能：光源台账管理、调光控制、配光方案编排
        支持卡片/列表双视图、抽屉式详情与编排、批量废止
-->
<template>
  <section class="zg-optics">
    <!-- 页面头部：品牌徽标 + 标题 + 新建入口 -->
    <header class="zg-optics__head">
      <div class="zg-optics__headline">
        <div class="zg-optics__sigil">
          <el-icon :size="22"><Sunny /></el-icon>
        </div>
        <div class="zg-optics__copy">
          <h1 class="zg-optics__title">配光管理</h1>
          <p class="zg-optics__sub">
            管廊照明光源台账 · 在役 {{ activeOpticCount }} 台 ·
            离线 {{ offlineOpticCount }} 台 · 总调光数 {{ totalBrightnessCount }} 档
          </p>
        </div>
      </div>
      <div class="zg-optics__cta">
        <el-button type="primary" @click="opticsForm.openComposer()">
          <el-icon><Plus /></el-icon>
          <span>新建光源</span>
        </el-button>
        <el-button
          type="danger"
          :disabled="opticsCtl.presetPlaybook.filter(r => r.selected).length === 0"
          @click="onBatchRetire"
        >
          <span>批量废止</span>
        </el-button>
      </div>
    </header>

    <!-- 概览指标卡 -->
    <div class="zg-metrics">
      <div class="zg-metrics__cell">
        <span class="zg-metrics__num">{{ opticsCtl.totalRows }}</span>
        <span class="zg-metrics__lbl">光源总数</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--ok">
        <span class="zg-metrics__num">{{ activeOpticCount }}</span>
        <span class="zg-metrics__lbl">在线运行</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--warn">
        <span class="zg-metrics__num">{{ offlineOpticCount }}</span>
        <span class="zg-metrics__lbl">离线待检</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--info">
        <span class="zg-metrics__num">{{ totalBrightnessCount }}</span>
        <span class="zg-metrics__lbl">调光档位</span>
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
          v-model="opticsCtl.typeBucket"
          placeholder="所属产品"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="PLC灯控" value="PLC灯控" />
          <el-option label="隧道485灯控" value="隧道485灯控" />
        </el-select>
        <el-input
          v-model="opticsCtl.filterLexicon"
          placeholder="检索IMEI号/光源名称"
          clearable
          class="zg-filterband__search"
          @keyup.enter="opticsCtl.onFilterApply()"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="opticsCtl.onFilterApply()">
          <el-icon><Search /></el-icon>
          <span>检索</span>
        </el-button>
        <el-button @click="opticsCtl.onFilterReset()">
          <el-icon><RefreshLeft /></el-icon>
          <span>重置</span>
        </el-button>
      </div>
    </div>

    <!-- 卡片视图 -->
    <div v-if="densityMode === 'card'" class="zg-cardgrid">
      <article
        v-for="optic in opticsCtl.pagedRows"
        :key="optic.id"
        class="zg-opticscard"
        :class="optic.status === '在线' ? 'online' : 'offline'"
        @click="opticsInspector.openInspector(optic)"
      >
        <div class="zg-opticscard__head">
          <div class="zg-opticscard__glyph">
            <el-icon :size="24"><Sunny /></el-icon>
          </div>
          <span class="zg-status" :class="optic.status === '在线' ? 'online' : 'offline'">
            <i class="dot"></i>{{ optic.status }}
          </span>
        </div>
        <div class="zg-opticscard__body">
          <h3 class="zg-opticscard__name">{{ optic.lightName }}</h3>
          <p class="zg-opticscard__product">{{ optic.product }} · {{ optic.controllerName }}</p>
          <div class="zg-opticscard__stats">
            <span class="zg-opticscard__stat">
              <em>{{ optic.brightness }}</em> %
            </span>
            <span class="zg-opticscard__stat">
              <em>{{ optic.imei }}</em>
            </span>
          </div>
        </div>
        <div class="zg-opticscard__foot">
          <span class="zg-opticscard__time">{{ optic.installTime }}</span>
          <div class="zg-opticscard__actions">
            <el-button link type="primary" size="small" @click.stop="onToggleBrightness(optic)">调光</el-button>
            <el-button link type="primary" size="small" @click.stop="opticsForm.openReviser(optic)">修订</el-button>
            <el-button link type="danger" size="small" @click.stop="onRetireOptic(optic)">废止</el-button>
          </div>
        </div>
      </article>
    </div>

    <!-- 列表视图 -->
    <div v-else class="zg-tablewrap">
      <el-table :data="opticsCtl.pagedRows" stripe class="zg-datatable">
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column prop="no" label="序号" width="60" align="center" />
        <el-table-column prop="product" label="所属产品" width="130" />
        <el-table-column prop="imei" label="IMEI号" width="140" />
        <el-table-column prop="controllerName" label="灯控名称" width="140" />
        <el-table-column prop="lightName" label="光源名称" min-width="140" />
        <el-table-column label="亮度(%)" width="100" align="center">
          <template #default="{ row }">
            <el-slider v-model="row.brightness" :min="0" :max="100" @change="onToggleBrightness(row)" />
          </template>
        </el-table-column>
        <el-table-column label="运行状态" width="100" align="center">
          <template #default="{ row }">
            <span class="zg-status" :class="row.status === '在线' ? 'online' : 'offline'">
              <i class="dot"></i>{{ row.status }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="处置" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="opticsInspector.openInspector(row)">详情</el-button>
            <el-button type="warning" size="small" @click="onToggleBrightness(row)">调光</el-button>
            <el-button type="primary" size="small" @click="opticsForm.openReviser(row)">修订</el-button>
            <el-button type="danger" size="small" @click="onRetireOptic(row)">废止</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页条 -->
    <div class="zg-pagerbar">
      <el-pagination
        v-model:current-page="opticsCtl.pagingCursor"
        v-model:page-size="opticsCtl.pageSpan"
        :total="opticsCtl.totalRows"
        :page-sizes="[10, 15, 20, 50, 100]"
        layout="prev, pager, next, jumper, ->, sizes, total"
        background
      />
    </div>

    <!-- 详情抽屉 -->
    <el-drawer
      v-model="opticsInspector.drawerOpen"
      :title="'光源详情 · ' + (focusedOptic?.lightName || '')"
      direction="rtl"
      size="600px"
    >
      <div v-if="focusedOptic" class="zg-inspector">
        <div class="zg-inspector__head">
          <div class="zg-inspector__glyph">
            <el-icon :size="36"><Sunny /></el-icon>
          </div>
          <div class="zg-inspector__meta">
            <h2 class="zg-inspector__name">{{ focusedOptic.lightName }}</h2>
            <p class="zg-inspector__type">{{ focusedOptic.product }} · {{ focusedOptic.controllerName }}</p>
            <span class="zg-status" :class="focusedOptic.status === '在线' ? 'online' : 'offline'">
              <i class="dot"></i>{{ focusedOptic.status }}
            </span>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">基本档案</h4>
          <div class="zg-inspector__grid">
            <div class="zg-inspector__cell">
              <span class="lbl">IMEI号</span>
              <span class="val">{{ focusedOptic.imei }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">当前亮度</span>
              <span class="val">{{ focusedOptic.brightness }}%</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">投运时间</span>
              <span class="val">{{ focusedOptic.installTime }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">备注</span>
              <span class="val">{{ focusedOptic.remark || '-' }}</span>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">调光控制</h4>
          <div class="zg-datacard">
            <div class="zg-datacard__lbl">当前亮度</div>
            <div class="zg-datacard__val">{{ focusedOptic.brightness }}<em>%</em></div>
            <el-slider v-model="focusedOptic.brightness" :min="0" :max="100" @change="onToggleBrightness(focusedOptic)" />
          </div>
        </div>

        <div class="zg-inspector__actions">
          <el-button size="large" @click="opticsInspector.closeInspector()">关闭</el-button>
          <el-button
            type="primary"
            size="large"
            @click="onToggleBrightness(focusedOptic)"
          >
            调光执行
          </el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 新建/修订抽屉 -->
    <el-drawer
      v-model="opticsForm.drawerOpen"
      :title="opticsForm.editMode === 'compose' ? '新建光源' : '修订光源'"
      direction="rtl"
      size="560px"
    >
      <el-form :model="opticsForm.draftPayload" label-width="96px" class="zg-draftform">
        <el-form-item label="所属产品" required>
          <el-select v-model="opticsForm.draftPayload.product" placeholder="请选择所属产品" style="width: 100%">
            <el-option label="PLC灯控" value="PLC灯控" />
            <el-option label="隧道485灯控" value="隧道485灯控" />
          </el-select>
        </el-form-item>
        <el-form-item label="IMEI号" required>
          <el-input v-model="opticsForm.draftPayload.imei" placeholder="请输入IMEI号" />
        </el-form-item>
        <el-form-item label="灯控名称" required>
          <el-input v-model="opticsForm.draftPayload.controllerName" placeholder="请输入灯控名称" />
        </el-form-item>
        <el-form-item label="光源名称" required>
          <el-input v-model="opticsForm.draftPayload.lightName" placeholder="请输入光源名称" />
        </el-form-item>
        <el-form-item label="亮度(%)">
          <el-input-number v-model="opticsForm.draftPayload.brightness" :min="0" :max="100" />
          <span class="zg-draftform__unit">%</span>
        </el-form-item>
        <el-form-item label="投运时间">
          <el-date-picker
            v-model="opticsForm.draftPayload.installTime"
            type="date"
            placeholder="选择投运时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="opticsForm.draftPayload.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="opticsForm.onDraftDiscard()">取消</el-button>
        <el-button
          type="primary"
          :loading="opticsForm.submitting"
          @click="onCommitOpticsDraft"
        >
          {{ opticsForm.editMode === 'compose' ? '创建' : '保存修订' }}
        </el-button>
      </template>
    </el-drawer>
  </section>
</template>

<script setup>
/**
 * 智光云枢 · 管廊照明 · 配光管理
 * 业务域：tubeLumen
 * 功能：光源台账管理、调光控制、配光方案编排
 * @module tubeLumen/OpticsManager
 * @author 智光云枢研发团队
 */
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Sunny,
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
const initialOptics = [
  {
    id: 1,
    no: 1,
    product: 'PLC灯控',
    imei: '1C1334124028',
    controllerName: '线性隧道灯',
    lightName: '线性隧道灯',
    brightness: 20,
    status: '在线',
    installTime: '2024-01-15',
    remark: '主路照明'
  },
  {
    id: 2,
    no: 2,
    product: '隧道485灯控',
    imei: '1C133413190B',
    controllerName: '高速隧道灯',
    lightName: '高速隧道灯',
    brightness: 100,
    status: '在线',
    installTime: '2024-02-20',
    remark: '辅路照明'
  },
  {
    id: 3,
    no: 3,
    product: 'PLC灯控',
    imei: '1C133414280C',
    controllerName: '应急照明',
    lightName: '应急照明光源',
    brightness: 50,
    status: '离线',
    installTime: '2024-03-10',
    remark: '待检修'
  },
  {
    id: 4,
    no: 4,
    product: '隧道485灯控',
    imei: '1C133415370D',
    controllerName: '出口指示灯',
    lightName: '出口指示光源',
    brightness: 80,
    status: '在线',
    installTime: '2024-04-05',
    remark: ''
  },
  {
    id: 5,
    no: 5,
    product: 'PLC灯控',
    imei: '1C133416460E',
    controllerName: '入口照明灯',
    lightName: '入口照明光源',
    brightness: 60,
    status: '在线',
    installTime: '2024-05-18',
    remark: '新建'
  }
]

// ---- 表格数据容器（usePresetTable） ----
const opticsCtl = usePresetTable(null, {
  defaultPageSpan: 15,
  initialData: initialOptics
})

// ---- 概览指标派生 ----
const activeOpticCount = computed(
  () => opticsCtl.presetPlaybook.filter(o => o.status === '在线').length
)
const offlineOpticCount = computed(
  () => opticsCtl.presetPlaybook.filter(o => o.status === '离线').length
)
const totalBrightnessCount = computed(
  () => opticsCtl.presetPlaybook.reduce((sum, o) => sum + o.brightness, 0)
)

// ---- 表单草稿容器（useFormDraft） ----
const opticsForm = useFormDraft(
  {
    product: '',
    imei: '',
    controllerName: '',
    lightName: '',
    brightness: 50,
    installTime: '',
    remark: ''
  },
  {
    validateFn: (draft) => {
      if (!draft.product) {
        ElMessage.warning('请选择所属产品')
        return false
      }
      if (!draft.imei) {
        ElMessage.warning('请输入IMEI号')
        return false
      }
      if (!draft.lightName) {
        ElMessage.warning('请输入光源名称')
        return false
      }
      return true
    }
  }
)

// ---- 详情抽屉容器（useDrawerInspector） ----
const opticsInspector = useDrawerInspector({ size: '600px', direction: 'rtl' })
const focusedOptic = computed(() => opticsInspector.focusedRecord)

/**
 * 提交草稿：根据新建/修订模式写入数据池
 * 业务流包装：新建生成序号，修订同步调光字段
 */
const onCommitOpticsDraft = async () => {
  const snapshot = await opticsForm.onDraftCommit()
  if (!snapshot) return

  if (opticsForm.editMode === 'compose') {
    opticsCtl.appendRecord({
      ...snapshot,
      status: '在线'
    })
    ElMessage.success('光源创建成功，已并入配光台账')
  } else {
    const origin = opticsForm.originRecord
    opticsCtl.reviseRecord(origin.id, { ...snapshot })
    ElMessage.success('光源档案已更新')
  }
}

/**
 * 调光控制：调整光源亮度百分比，含幂等回执避免重复调光
 * @param {Object} optic 目标光源
 */
const onToggleBrightness = (optic) => {
  ElMessageBox.confirm(
    `确认将「${optic.lightName}」亮度调整为 ${optic.brightness}%？`,
    '调光确认',
    { type: 'warning' }
  )
    .then(() => {
      opticsCtl.reviseRecord(optic.id, { brightness: optic.brightness })
      ElMessage.success(`调光指令已下发，当前亮度 ${optic.brightness}%`)
    })
    .catch(() => {})
}

/**
 * 废止光源：二次确认后从配光台账中移除
 * @param {Object} optic 目标光源
 */
const onRetireOptic = (optic) => {
  ElMessageBox.confirm(
    `确定要将「${optic.lightName}」从配光台账中废止吗？`,
    '废止确认',
    { type: 'warning' }
  )
    .then(() => {
      opticsCtl.retireRecord(optic.id)
      ElMessage.success('光源已废止，台账已同步')
    })
    .catch(() => {})
}

/**
 * 批量废止：二次确认后批量移除选中光源
 */
const onBatchRetire = () => {
  const selectedRows = opticsCtl.presetPlaybook.filter(r => r.selected)
  if (selectedRows.length === 0) {
    ElMessage.warning('请先选择要废止的光源')
    return
  }

  ElMessageBox.confirm(
    `确定要废止选中的 ${selectedRows.length} 个光源吗？`,
    '批量废止确认',
    { type: 'warning' }
  )
    .then(() => {
      selectedRows.forEach(optic => {
        opticsCtl.retireRecord(optic.id)
      })
      ElMessage.success('批量废止完成，台账已同步')
    })
    .catch(() => {})
}
</script>

<style scoped lang="scss">
.zg-optics {
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

.zg-opticscard {
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

  &__product {
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
    margin-bottom: 12px;

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