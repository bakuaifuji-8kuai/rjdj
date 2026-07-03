<!--
  智光云枢 · 管廊照明 · 区段管理
  业务域：tubeLumen
  功能：城市管廊照明区段的划分与运行管理
        支持卡片/列表双视图、抽屉式详情与编排、区段启停回执
-->
<template>
  <section class="zg-section">
    <!-- 页面头部：品牌徽标 + 标题 + 概览指标 + 新建入口 -->
    <header class="zg-section__head">
      <div class="zg-section__headline">
        <div class="zg-section__sigil">
          <el-icon :size="22"><Coordinate /></el-icon>
        </div>
        <div class="zg-section__copy">
          <h1 class="zg-section__title">区段管理</h1>
          <p class="zg-section__sub">
            管廊照明区段台账 · 在役 {{ activeSectionCount }} 段 ·
            停用 {{ idleSectionCount }} 段 · 累计长度 {{ totalLengthCount }} 米
          </p>
        </div>
      </div>
      <div class="zg-section__cta">
        <el-button type="primary" @click="sectionForm.openComposer()">
          <el-icon><Plus /></el-icon>
          <span>新建区段</span>
        </el-button>
      </div>
    </header>

    <!-- 概览指标卡 -->
    <div class="zg-metrics">
      <div class="zg-metrics__cell">
        <span class="zg-metrics__num">{{ sectionCtl.totalRows }}</span>
        <span class="zg-metrics__lbl">区段总数</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--ok">
        <span class="zg-metrics__num">{{ activeSectionCount }}</span>
        <span class="zg-metrics__lbl">在役运行</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--warn">
        <span class="zg-metrics__num">{{ idleSectionCount }}</span>
        <span class="zg-metrics__lbl">停用待启</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--info">
        <span class="zg-metrics__num">{{ totalLengthCount }}</span>
        <span class="zg-metrics__lbl">区段总长(米)</span>
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
          v-model="sectionCtl.statusBuckets"
          placeholder="运行状态"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="在役" value="在役" />
          <el-option label="停用" value="停用" />
        </el-select>
        <el-select
          v-model="sectionCtl.typeBucket"
          placeholder="区段类型"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="入口段" value="入口段" />
          <el-option label="基本段" value="基本段" />
          <el-option label="出口段" value="出口段" />
        </el-select>
        <el-select
          v-model="tunnelScope"
          placeholder="所属管廊"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="展厅隧道" value="展厅隧道" />
        </el-select>
        <el-input
          v-model="sectionCtl.filterLexicon"
          placeholder="检索区段名称"
          clearable
          class="zg-filterband__search"
          @keyup.enter="sectionCtl.onFilterApply()"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="sectionCtl.onFilterApply()">
          <el-icon><Search /></el-icon>
          <span>检索</span>
        </el-button>
        <el-button @click="onResetSectionFilter()">
          <el-icon><RefreshLeft /></el-icon>
          <span>重置</span>
        </el-button>
      </div>
    </div>

    <!-- 卡片视图 -->
    <div v-if="densityMode === 'card'" class="zg-cardgrid">
      <article
        v-for="section in sectionCtl.pagedRows"
        :key="section.id"
        class="zg-sectioncard"
        :class="section.status === '在役' ? 'online' : 'offline'"
        @click="sectionInspector.openInspector(section)"
      >
        <div class="zg-sectioncard__head">
          <div class="zg-sectioncard__glyph">
            <el-icon :size="24"><Lightning /></el-icon>
          </div>
          <span class="zg-status" :class="section.status === '在役' ? 'online' : 'offline'">
            <i class="dot"></i>{{ section.status }}
          </span>
        </div>
        <div class="zg-sectioncard__body">
          <h3 class="zg-sectioncard__name">{{ section.name }}</h3>
          <p class="zg-sectioncard__area">{{ section.tunnel }} · {{ section.type }}</p>
          <div class="zg-sectioncard__stats">
            <span class="zg-sectioncard__stat">
              <em>{{ section.length }}</em> 米
            </span>
            <span class="zg-sectioncard__stat">
              <em>{{ section.lampCount }}</em> 灯具
            </span>
            <span class="zg-sectioncard__stat">
              <em>{{ section.order }}</em> 序位
            </span>
          </div>
        </div>
        <div class="zg-sectioncard__foot">
          <span class="zg-sectioncard__time">{{ section.bindTime }}</span>
          <div class="zg-sectioncard__actions">
            <el-button link type="primary" size="small" @click.stop="sectionInspector.openInspector(section)">详情</el-button>
            <el-button link type="primary" size="small" @click.stop="onToggleSection(section)">
              {{ section.status === '在役' ? '停用' : '启用' }}
            </el-button>
            <el-button link type="primary" size="small" @click.stop="sectionForm.openReviser(section)">修订</el-button>
            <el-button link type="danger" size="small" @click.stop="onRetireSection(section)">废止</el-button>
          </div>
        </div>
      </article>
    </div>

    <!-- 列表视图 -->
    <div v-else class="zg-tablewrap">
      <el-table :data="sectionCtl.pagedRows" stripe class="zg-datatable">
        <el-table-column prop="no" label="序号" width="60" align="center" />
        <el-table-column prop="tunnel" label="所属管廊" width="120" />
        <el-table-column prop="name" label="区段名称" min-width="130" />
        <el-table-column prop="type" label="区段类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getSectionTagTone(row.type)" effect="light">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="order" label="排序" width="80" align="center" />
        <el-table-column prop="length" label="长度(米)" width="100" align="center" />
        <el-table-column prop="entrance" label="出入口" width="80" align="center" />
        <el-table-column prop="sensor" label="关联传感器" width="130" />
        <el-table-column prop="lampCount" label="灯具数" width="90" align="center" />
        <el-table-column label="运行状态" width="100" align="center">
          <template #default="{ row }">
            <span class="zg-status" :class="row.status === '在役' ? 'online' : 'offline'">
              <i class="dot"></i>{{ row.status }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="bindTime" label="启用时间" width="130" />
        <el-table-column label="处置" width="260" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="sectionInspector.openInspector(row)">详情</el-button>
            <el-button type="warning" size="small" @click="onToggleSection(row)">
              {{ row.status === '在役' ? '停用' : '启用' }}
            </el-button>
            <el-button type="primary" size="small" @click="sectionForm.openReviser(row)">修订</el-button>
            <el-button type="danger" size="small" @click="onRetireSection(row)">废止</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页条 -->
    <div class="zg-pagerbar">
      <el-pagination
        v-model:current-page="sectionCtl.pagingCursor"
        v-model:page-size="sectionCtl.pageSpan"
        :total="sectionCtl.totalRows"
        :page-sizes="[10, 15, 20, 50, 100]"
        layout="prev, pager, next, jumper, ->, sizes, total"
        background
      />
    </div>

    <!-- 详情抽屉 -->
    <el-drawer
      v-model="sectionInspector.drawerOpen"
      :title="'区段详情 · ' + (focusedSection?.name || '')"
      direction="rtl"
      size="680px"
    >
      <div v-if="focusedSection" class="zg-inspector">
        <div class="zg-inspector__head">
          <div class="zg-inspector__glyph">
            <el-icon :size="36"><Lightning /></el-icon>
          </div>
          <div class="zg-inspector__meta">
            <h2 class="zg-inspector__name">{{ focusedSection.name }}</h2>
            <p class="zg-inspector__type">{{ focusedSection.tunnel }} · {{ focusedSection.type }}</p>
            <span class="zg-status" :class="focusedSection.status === '在役' ? 'online' : 'offline'">
              <i class="dot"></i>{{ focusedSection.status }}
            </span>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">基本档案</h4>
          <div class="zg-inspector__grid">
            <div class="zg-inspector__cell">
              <span class="lbl">所属管廊</span>
              <span class="val">{{ focusedSection.tunnel }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">区段类型</span>
              <span class="val">{{ focusedSection.type }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">排序序位</span>
              <span class="val">{{ focusedSection.order }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">出入口</span>
              <span class="val">{{ focusedSection.entrance }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">关联传感器</span>
              <span class="val">{{ focusedSection.sensor || '-' }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">启用时间</span>
              <span class="val">{{ focusedSection.bindTime }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">备注</span>
              <span class="val">{{ focusedSection.remark || '-' }}</span>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">运行指标</h4>
          <div class="zg-datagrid">
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">区段长度</div>
              <div class="zg-datacard__val">{{ focusedSection.length }}<em>米</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">灯具数量</div>
              <div class="zg-datacard__val">{{ focusedSection.lampCount }}<em>盏</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">排序序位</div>
              <div class="zg-datacard__val">{{ focusedSection.order }}<em>位</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">运行时长</div>
              <div class="zg-datacard__val">{{ focusedSection.runTime }}<em>h</em></div>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">灯具清单</h4>
          <el-table :data="focusedSection.lamps" size="small" border>
            <el-table-column prop="no" label="序号" width="60" align="center" />
            <el-table-column prop="name" label="灯具名称" min-width="120" />
            <el-table-column label="状态" width="90" align="center">
              <template #default="{ row }">
                <span class="zg-status" :class="row.status === '点亮' ? 'online' : 'idle'">
                  <i class="dot"></i>{{ row.status }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="power" label="功率(kW)" width="110" align="center" />
          </el-table>
        </div>

        <div class="zg-inspector__actions">
          <el-button size="large" @click="sectionInspector.closeInspector()">关闭</el-button>
          <el-button
            type="warning"
            size="large"
            @click="onToggleSection(focusedSection)"
          >
            {{ focusedSection.status === '在役' ? '停用区段' : '启用区段' }}
          </el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 新建/修订抽屉 -->
    <el-drawer
      v-model="sectionForm.drawerOpen"
      :title="sectionForm.editMode === 'compose' ? '新建区段' : '修订区段'"
      direction="rtl"
      size="560px"
    >
      <el-form :model="sectionForm.draftPayload" label-width="96px" class="zg-draftform">
        <el-form-item label="所属管廊" required>
          <el-select v-model="sectionForm.draftPayload.tunnel" placeholder="请选择所属管廊" style="width: 100%">
            <el-option label="展厅隧道" value="展厅隧道" />
          </el-select>
        </el-form-item>
        <el-form-item label="区段名称" required>
          <el-input v-model="sectionForm.draftPayload.name" placeholder="请输入区段名称" />
        </el-form-item>
        <el-form-item label="区段类型" required>
          <el-select v-model="sectionForm.draftPayload.type" placeholder="请选择区段类型" style="width: 100%">
            <el-option label="入口段" value="入口段" />
            <el-option label="基本段" value="基本段" />
            <el-option label="出口段" value="出口段" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序序位">
          <el-input-number v-model="sectionForm.draftPayload.order" :min="1" />
          <span class="zg-draftform__unit">位</span>
        </el-form-item>
        <el-form-item label="区段长度">
          <el-input-number v-model="sectionForm.draftPayload.length" :min="0" />
          <span class="zg-draftform__unit">米</span>
        </el-form-item>
        <el-form-item label="出入口">
          <el-select v-model="sectionForm.draftPayload.entrance" placeholder="请选择出入口" style="width: 100%">
            <el-option label="入口" value="入口" />
            <el-option label="出口" value="出口" />
          </el-select>
        </el-form-item>
        <el-form-item label="关联传感器">
          <el-input v-model="sectionForm.draftPayload.sensor" placeholder="请输入关联传感器名称" />
        </el-form-item>
        <el-form-item label="启用时间">
          <el-date-picker
            v-model="sectionForm.draftPayload.bindTime"
            type="date"
            placeholder="选择启用时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="sectionForm.draftPayload.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="sectionForm.onDraftDiscard()">取消</el-button>
        <el-button
          type="primary"
          :loading="sectionForm.submitting"
          @click="onCommitSectionDraft"
        >
          {{ sectionForm.editMode === 'compose' ? '新建' : '保存修订' }}
        </el-button>
      </template>
    </el-drawer>
  </section>
</template>

<script setup>
/**
 * 智光云枢 · 管廊照明 · 区段管理
 * 业务域：tubeLumen
 * 功能：城市管廊照明区段的划分与运行管理
 * @module tubeLumen/SectionManager
 * @author 智光云枢研发团队
 */
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Coordinate,
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

// ---- 所属管廊筛选范围（本地态） ----
const tunnelScope = ref('')

// ---- 初始 mock 数据池（管廊照明区段台账） ----
const initialSections = [
  {
    id: 1,
    no: 1,
    tunnel: '展厅隧道',
    name: '入口段',
    type: '入口段',
    order: 1,
    length: 5,
    entrance: '入口',
    sensor: '展厅光照',
    status: '在役',
    lampCount: 8,
    bindTime: '2024-01-15',
    runTime: 8760,
    remark: '展厅入口过渡照明区段',
    lamps: [
      { no: 1, name: '入口主灯A', status: '点亮', power: 0.4 },
      { no: 2, name: '入口主灯B', status: '点亮', power: 0.4 },
      { no: 3, name: '入口引导灯', status: '熄灯', power: 0 }
    ]
  },
  {
    id: 2,
    no: 2,
    tunnel: '展厅隧道',
    name: '基本段',
    type: '基本段',
    order: 2,
    length: 10,
    entrance: '入口',
    sensor: '-',
    status: '在役',
    lampCount: 12,
    bindTime: '2024-02-10',
    runTime: 7200,
    remark: '隧道中部基础照明区段',
    lamps: []
  },
  {
    id: 3,
    no: 3,
    tunnel: '展厅隧道',
    name: '出口段',
    type: '出口段',
    order: 3,
    length: 5,
    entrance: '出口',
    sensor: '展厅光照',
    status: '在役',
    lampCount: 6,
    bindTime: '2024-03-05',
    runTime: 4500,
    remark: '展厅出口过渡照明区段',
    lamps: []
  }
]

// ---- 表格数据容器（usePresetTable） ----
const sectionCtl = usePresetTable(null, {
  defaultPageSpan: 15,
  initialData: initialSections
})

// ---- 概览指标派生 ----
const activeSectionCount = computed(
  () => sectionCtl.presetPlaybook.filter(s => s.status === '在役').length
)
const idleSectionCount = computed(
  () => sectionCtl.presetPlaybook.filter(s => s.status === '停用').length
)
const totalLengthCount = computed(
  () => sectionCtl.presetPlaybook.reduce((sum, s) => sum + (s.length || 0), 0)
)

// ---- 表单草稿容器（useFormDraft） ----
const sectionForm = useFormDraft(
  {
    tunnel: '展厅隧道',
    name: '',
    type: '入口段',
    order: 1,
    length: 0,
    entrance: '入口',
    sensor: '',
    bindTime: '',
    remark: ''
  },
  {
    validateFn: (draft) => {
      if (!draft.tunnel) {
        ElMessage.warning('请选择所属管廊')
        return false
      }
      if (!draft.name) {
        ElMessage.warning('请输入区段名称')
        return false
      }
      if (!draft.type) {
        ElMessage.warning('请选择区段类型')
        return false
      }
      return true
    }
  }
)

// ---- 详情抽屉容器（useDrawerInspector） ----
const sectionInspector = useDrawerInspector({ size: '680px', direction: 'rtl' })
const focusedSection = computed(() => sectionInspector.focusedRecord)

/**
 * 区段类型标签色调映射
 * @param {string} type 区段类型
 * @returns {string} Element Plus tag 类型
 */
const getSectionTagTone = (type) => {
  const tones = { '入口段': 'primary', '基本段': 'success', '出口段': 'warning' }
  return tones[type] || 'info'
}

/**
 * 重置过滤条件：清空本地管廊筛选并委托 composable 复位
 */
const onResetSectionFilter = () => {
  tunnelScope.value = ''
  sectionCtl.onFilterReset()
}

/**
 * 提交草稿：根据编排/修订模式写入区段台账
 * compose 模式 appendRecord 并附带运行态默认值，revise 模式 reviseRecord 合并更新
 */
const onCommitSectionDraft = async () => {
  const snapshot = await sectionForm.onDraftCommit()
  if (!snapshot) return

  if (sectionForm.editMode === 'compose') {
    // 新建：附带运行态默认值
    sectionCtl.appendRecord({
      ...snapshot,
      status: '在役',
      lampCount: 0,
      runTime: 0,
      lamps: []
    })
    ElMessage.success('区段新建成功，已并入管廊照明台账')
  } else {
    // 修订：合并更新到原记录
    const origin = sectionForm.originRecord
    sectionCtl.reviseRecord(origin.id, { ...snapshot })
    ElMessage.success('区段档案已更新')
  }
}

/**
 * 启停区段：在役↔停用切换，含二次确认与照明链路回执
 * @param {Object} section 目标区段
 */
const onToggleSection = (section) => {
  const nextStatus = section.status === '在役' ? '停用' : '在役'
  ElMessageBox.confirm(
    `确认将「${section.name}」${nextStatus === '在役' ? '启用' : '停用'}？`,
    '启停确认',
    { type: 'warning' }
  )
    .then(() => {
      sectionCtl.reviseRecord(section.id, { status: nextStatus })
      ElMessage.success(`区段已${nextStatus === '在役' ? '启用' : '停用'}，照明链路已同步`)
    })
    .catch(() => {})
}

/**
 * 废止区段：二次确认后从台账中移除
 * @param {Object} section 目标区段
 */
const onRetireSection = (section) => {
  ElMessageBox.confirm(
    `确定要将「${section.name}」从管廊区段台账中废止吗？`,
    '废止确认',
    { type: 'warning' }
  )
    .then(() => {
      sectionCtl.retireRecord(section.id)
      ElMessage.success('区段已废止，台账已同步')
    })
    .catch(() => {})
}
</script>

<style scoped lang="scss">
.zg-section {
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

.zg-sectioncard {
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
