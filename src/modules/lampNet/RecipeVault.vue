<!--
  智光云枢 · 灯网态势 · 处方库
  业务域：lampNet
  功能：照明策略处方台账与编排管理
        支持卡片/列表双视图、抽屉式详情与编排、启停回执
-->
<template>
  <section class="zg-vault">
    <!-- 页面头部：品牌徽标 + 标题 + 概览指标 + 新建入口 -->
    <header class="zg-vault__head">
      <div class="zg-vault__headline">
        <div class="zg-vault__sigil">
          <el-icon :size="22"><Document /></el-icon>
        </div>
        <div class="zg-vault__copy">
          <h1 class="zg-vault__title">处方库</h1>
          <p class="zg-vault__sub">
            照明策略处方中枢 · 在役 {{ activeRecipeCount }} 条 ·
            停用 {{ inactiveRecipeCount }} 条 · 累计覆盖杆塔 {{ totalPoleCount }} 座
          </p>
        </div>
      </div>
      <div class="zg-vault__cta">
        <el-button type="primary" @click="vaultForm.openComposer()">
          <el-icon><Plus /></el-icon>
          <span>编排便方</span>
        </el-button>
      </div>
    </header>

    <!-- 概览指标卡 -->
    <div class="zg-metrics">
      <div class="zg-metrics__cell">
        <span class="zg-metrics__num">{{ vaultCtl.totalRows }}</span>
        <span class="zg-metrics__lbl">处方总数</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--ok">
        <span class="zg-metrics__num">{{ activeRecipeCount }}</span>
        <span class="zg-metrics__lbl">启用运行</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--warn">
        <span class="zg-metrics__num">{{ inactiveRecipeCount }}</span>
        <span class="zg-metrics__lbl">停用待机</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--info">
        <span class="zg-metrics__num">{{ totalPoleCount }}</span>
        <span class="zg-metrics__lbl">覆盖杆塔</span>
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
          v-model="vaultCtl.statusBuckets"
          placeholder="处方状态"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="启用" value="启用" />
          <el-option label="停用" value="停用" />
        </el-select>
        <el-select
          v-model="vaultCtl.typeBucket"
          placeholder="所属区域"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="长沙-岳麓区" value="长沙-岳麓区" />
          <el-option label="长沙-天心区" value="长沙-天心区" />
          <el-option label="长沙-开福区" value="长沙-开福区" />
        </el-select>
        <el-input
          v-model="vaultCtl.filterLexicon"
          placeholder="检索处方名称/编号"
          clearable
          class="zg-filterband__search"
          @keyup.enter="vaultCtl.onFilterApply()"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="vaultCtl.onFilterApply()">
          <el-icon><Search /></el-icon>
          <span>检索</span>
        </el-button>
        <el-button @click="vaultCtl.onFilterReset()">
          <el-icon><RefreshLeft /></el-icon>
          <span>重置</span>
        </el-button>
      </div>
    </div>

    <!-- 卡片视图 -->
    <div v-if="densityMode === 'card'" class="zg-cardgrid">
      <article
        v-for="recipe in vaultCtl.pagedRows"
        :key="recipe.id"
        class="zg-vaultcard"
        :class="recipe.status === '启用' ? 'active' : 'idle'"
        @click="vaultInspector.openInspector(recipe)"
      >
        <div class="zg-vaultcard__head">
          <div class="zg-vaultcard__glyph">
            <el-icon :size="24"><Document /></el-icon>
          </div>
          <span class="zg-status" :class="recipe.status === '启用' ? 'online' : 'idle'">
            <i class="dot"></i>{{ recipe.status }}
          </span>
        </div>
        <div class="zg-vaultcard__body">
          <h3 class="zg-vaultcard__name">{{ recipe.name }}</h3>
          <p class="zg-vaultcard__area">{{ recipe.area }} · {{ recipe.model }}</p>
          <div class="zg-vaultcard__stats">
            <span class="zg-vaultcard__stat">
              <em>{{ recipe.brightness }}</em> %
            </span>
            <span class="zg-vaultcard__stat">
              <em>{{ recipe.coverage }}</em> 座
            </span>
            <span class="zg-vaultcard__stat">
              <em>{{ recipe.poleCount }}</em> 杆塔
            </span>
          </div>
        </div>
        <div class="zg-vaultcard__foot">
          <span class="zg-vaultcard__time">{{ recipe.effectTime }}</span>
          <div class="zg-vaultcard__actions">
            <el-button link type="primary" size="small" @click.stop="onToggleVault(recipe)">
              {{ recipe.status === '启用' ? '停用' : '启用' }}
            </el-button>
            <el-button link type="primary" size="small" @click.stop="vaultForm.openReviser(recipe)">修订</el-button>
            <el-button link type="danger" size="small" @click.stop="onRetireVault(recipe)">废止</el-button>
          </div>
        </div>
      </article>
    </div>

    <!-- 列表视图 -->
    <div v-else class="zg-tablewrap">
      <el-table :data="vaultCtl.pagedRows" stripe class="zg-datatable">
        <el-table-column prop="no" label="序号" width="60" align="center" />
        <el-table-column prop="area" label="所属区域" width="130" />
        <el-table-column prop="name" label="处方名称" min-width="150" />
        <el-table-column prop="model" label="策略类型" width="110" />
        <el-table-column label="处方状态" width="100" align="center">
          <template #default="{ row }">
            <span class="zg-status" :class="row.status === '启用' ? 'online' : 'idle'">
              <i class="dot"></i>{{ row.status }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="brightness" label="默认亮度(%)" width="110" align="center" />
        <el-table-column prop="coverage" label="覆盖杆塔(座)" width="110" align="center" />
        <el-table-column prop="poleCount" label="关联杆塔" width="90" align="center" />
        <el-table-column prop="effectTime" label="生效日期" width="130" />
        <el-table-column label="处置" width="240" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="vaultInspector.openInspector(row)">详情</el-button>
            <el-button type="warning" size="small" @click="onToggleVault(row)">
              {{ row.status === '启用' ? '停用' : '启用' }}
            </el-button>
            <el-button type="primary" size="small" @click="vaultForm.openReviser(row)">修订</el-button>
            <el-button type="danger" size="small" @click="onRetireVault(row)">废止</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页条 -->
    <div class="zg-pagerbar">
      <el-pagination
        v-model:current-page="vaultCtl.pagingCursor"
        v-model:page-size="vaultCtl.pageSpan"
        :total="vaultCtl.totalRows"
        :page-sizes="[10, 15, 20, 50, 100]"
        layout="prev, pager, next, jumper, ->, sizes, total"
        background
      />
    </div>

    <!-- 详情抽屉 -->
    <el-drawer
      v-model="vaultInspector.drawerOpen"
      :title="'处方详情 · ' + (focusedVault?.name || '')"
      direction="rtl"
      size="680px"
    >
      <div v-if="focusedVault" class="zg-inspector">
        <div class="zg-inspector__head">
          <div class="zg-inspector__glyph">
            <el-icon :size="36"><Document /></el-icon>
          </div>
          <div class="zg-inspector__meta">
            <h2 class="zg-inspector__name">{{ focusedVault.name }}</h2>
            <p class="zg-inspector__type">{{ focusedVault.area }} · {{ focusedVault.model }}</p>
            <span class="zg-status" :class="focusedVault.status === '启用' ? 'online' : 'idle'">
              <i class="dot"></i>{{ focusedVault.status }}
            </span>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">基本档案</h4>
          <div class="zg-inspector__grid">
            <div class="zg-inspector__cell">
              <span class="lbl">生效日期</span>
              <span class="val">{{ focusedVault.effectTime }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">运行时长</span>
              <span class="val">{{ focusedVault.runDuration }} 天</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">备注</span>
              <span class="val">{{ focusedVault.remark || '-' }}</span>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">策略遥测</h4>
          <div class="zg-datagrid">
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">默认亮度</div>
              <div class="zg-datacard__val">{{ focusedVault.brightness }}<em>%</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">覆盖杆塔</div>
              <div class="zg-datacard__val">{{ focusedVault.coverage }}<em>座</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">关联杆塔</div>
              <div class="zg-datacard__val">{{ focusedVault.poleCount }}<em>座</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">运行时长</div>
              <div class="zg-datacard__val">{{ focusedVault.runDuration }}<em>天</em></div>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">适用杆塔清单</h4>
          <el-table :data="focusedVault.poles" size="small" border>
            <el-table-column prop="no" label="序号" width="60" align="center" />
            <el-table-column prop="name" label="杆塔名称" min-width="120" />
            <el-table-column label="状态" width="90" align="center">
              <template #default="{ row }">
                <span class="zg-status" :class="row.status === '在线' ? 'online' : 'idle'">
                  <i class="dot"></i>{{ row.status }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="brightness" label="亮度(%)" width="100" align="center" />
            <el-table-column prop="networkStatus" label="网络状态" width="110" align="center">
              <template #default="{ row }">
                <span class="zg-status" :class="row.networkStatus === '在线' ? 'online' : 'offline'">
                  <i class="dot"></i>{{ row.networkStatus }}
                </span>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="zg-inspector__actions">
          <el-button size="large" @click="vaultInspector.closeInspector()">关闭</el-button>
          <el-button
            type="warning"
            size="large"
            @click="onToggleVault(focusedVault)"
          >
            {{ focusedVault.status === '启用' ? '停用处方' : '启用处方' }}
          </el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 新建/修订抽屉 -->
    <el-drawer
      v-model="vaultForm.drawerOpen"
      :title="vaultForm.editMode === 'compose' ? '编排便方' : '修订处方'"
      direction="rtl"
      size="560px"
    >
      <el-form :model="vaultForm.draftPayload" label-width="96px" class="zg-draftform">
        <el-form-item label="所属区域" required>
          <el-select v-model="vaultForm.draftPayload.area" placeholder="请选择所属区域" style="width: 100%">
            <el-option label="长沙-岳麓区" value="长沙-岳麓区" />
            <el-option label="长沙-天心区" value="长沙-天心区" />
            <el-option label="长沙-开福区" value="长沙-开福区" />
          </el-select>
        </el-form-item>
        <el-form-item label="处方名称" required>
          <el-input v-model="vaultForm.draftPayload.name" placeholder="请输入处方名称" />
        </el-form-item>
        <el-form-item label="策略类型" required>
          <el-input v-model="vaultForm.draftPayload.model" placeholder="请输入策略类型" />
        </el-form-item>
        <el-form-item label="默认亮度">
          <el-input-number v-model="vaultForm.draftPayload.brightness" :min="0" :max="100" />
          <span class="zg-draftform__unit">%</span>
        </el-form-item>
        <el-form-item label="覆盖杆塔">
          <el-input-number v-model="vaultForm.draftPayload.coverage" :min="0" :max="10000" />
          <span class="zg-draftform__unit">座</span>
        </el-form-item>
        <el-form-item label="关联杆塔">
          <el-input-number v-model="vaultForm.draftPayload.poleCount" :min="1" :max="1000" />
          <span class="zg-draftform__unit">座</span>
        </el-form-item>
        <el-form-item label="生效日期">
          <el-date-picker
            v-model="vaultForm.draftPayload.effectTime"
            type="date"
            placeholder="选择生效日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="vaultForm.draftPayload.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="vaultForm.onDraftDiscard()">取消</el-button>
        <el-button
          type="primary"
          :loading="vaultForm.submitting"
          @click="onCommitVaultDraft"
        >
          {{ vaultForm.editMode === 'compose' ? '编排' : '保存修订' }}
        </el-button>
      </template>
    </el-drawer>
  </section>
</template>

<script setup>
/**
 * 智光云枢 · 灯网态势 · 处方库
 * 业务域：lampNet
 * 功能：照明策略处方台账与编排管理
 * @module lampNet/RecipeVault
 * @author 智光云枢研发团队
 */
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Document,
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
const initialRecipes = [
  {
    id: 1,
    no: 1,
    area: '长沙-岳麓区',
    name: '先导路节能处方',
    model: '分时段调光',
    status: '启用',
    brightness: 60,
    coverage: 12,
    poleCount: 8,
    effectTime: '2024-01-15',
    remark: '主路节能策略',
    runDuration: 365,
    poles: [
      { no: 1, name: '先导路1号杆塔', status: '在线', brightness: 60, networkStatus: '在线' },
      { no: 2, name: '先导路2号杆塔', status: '在线', brightness: 60, networkStatus: '在线' },
      { no: 3, name: '先导路3号杆塔', status: '离线', brightness: 0, networkStatus: '离线' },
      { no: 4, name: '先导路4号杆塔', status: '在线', brightness: 60, networkStatus: '在线' }
    ]
  },
  {
    id: 2,
    no: 2,
    area: '长沙-岳麓区',
    name: '力唯中天景观处方',
    model: '恒定亮度',
    status: '启用',
    brightness: 80,
    coverage: 6,
    poleCount: 6,
    effectTime: '2024-02-20',
    remark: '景观照明',
    runDuration: 280,
    poles: []
  },
  {
    id: 3,
    no: 3,
    area: '长沙-天心区',
    name: '芙蓉路深夜降亮处方',
    model: '分时段调光',
    status: '停用',
    brightness: 30,
    coverage: 20,
    poleCount: 10,
    effectTime: '2024-03-10',
    remark: '待复核后启用',
    runDuration: 120,
    poles: []
  },
  {
    id: 4,
    no: 4,
    area: '长沙-天心区',
    name: '芙蓉路常规处方',
    model: '恒定亮度',
    status: '启用',
    brightness: 75,
    coverage: 20,
    poleCount: 8,
    effectTime: '2024-04-05',
    remark: '',
    runDuration: 240,
    poles: []
  },
  {
    id: 5,
    no: 5,
    area: '长沙-开福区',
    name: '湘江路智慧处方',
    model: '感应调光',
    status: '启用',
    brightness: 50,
    coverage: 30,
    poleCount: 12,
    effectTime: '2024-05-18',
    remark: '新建智慧策略',
    runDuration: 180,
    poles: []
  },
  {
    id: 6,
    no: 6,
    area: '长沙-开福区',
    name: '湘江路备用处方',
    model: '恒定亮度',
    status: '停用',
    brightness: 100,
    coverage: 30,
    poleCount: 6,
    effectTime: '2024-06-01',
    remark: '应急备用',
    runDuration: 60,
    poles: []
  }
]

// ---- 表格数据容器（usePresetTable） ----
const vaultCtl = usePresetTable(null, {
  defaultPageSpan: 15,
  initialData: initialRecipes
})

// ---- 概览指标派生 ----
const activeRecipeCount = computed(
  () => vaultCtl.presetPlaybook.filter(r => r.status === '启用').length
)
const inactiveRecipeCount = computed(
  () => vaultCtl.presetPlaybook.filter(r => r.status === '停用').length
)
const totalPoleCount = computed(
  () => vaultCtl.presetPlaybook.reduce((sum, r) => sum + (r.coverage || 0), 0)
)

// ---- 表单草稿容器（useFormDraft） ----
const vaultForm = useFormDraft(
  {
    area: '',
    name: '',
    model: '',
    brightness: 60,
    coverage: 0,
    poleCount: 1,
    effectTime: '',
    remark: ''
  },
  {
    validateFn: (draft) => {
      if (!draft.area) {
        ElMessage.warning('请选择所属区域')
        return false
      }
      if (!draft.name) {
        ElMessage.warning('请输入处方名称')
        return false
      }
      if (!draft.model) {
        ElMessage.warning('请输入策略类型')
        return false
      }
      return true
    }
  }
)

// ---- 详情抽屉容器（useDrawerInspector） ----
const vaultInspector = useDrawerInspector({ size: '680px', direction: 'rtl' })
const focusedVault = computed(() => vaultInspector.focusedRecord)

/**
 * 提交草稿：根据编排/修订模式写入数据池
 * 业务流包装：新建生成处方编号，修订同步策略字段
 */
const onCommitVaultDraft = async () => {
  const snapshot = await vaultForm.onDraftCommit()
  if (!snapshot) return

  if (vaultForm.editMode === 'compose') {
    // 编排：附带运行态默认值
    vaultCtl.appendRecord({
      ...snapshot,
      no: vaultCtl.presetPlaybook.length + 1,
      status: '启用',
      runDuration: 0,
      poles: []
    })
    ElMessage.success('处方编排成功，已并入策略台账')
  } else {
    // 修订：合并更新到原记录
    const origin = vaultForm.originRecord
    vaultCtl.reviseRecord(origin.id, { ...snapshot })
    ElMessage.success('处方档案已更新')
  }
}

/**
 * 启停处方：启用↔停用切换，含幂等回执避免重复操作
 * @param {Object} recipe 目标处方
 */
const onToggleVault = (recipe) => {
  const nextStatus = recipe.status === '启用' ? '停用' : '启用'
  ElMessageBox.confirm(
    `确认将「${recipe.name}」${nextStatus === '启用' ? '启用' : '停用'}？`,
    '启停确认',
    { type: 'warning' }
  )
    .then(() => {
      vaultCtl.reviseRecord(recipe.id, { status: nextStatus })
      ElMessage.success(`处方已${nextStatus === '启用' ? '启用' : '停用'}，策略回执已签收`)
    })
    .catch(() => {})
}

/**
 * 废止处方：二次确认后从台账中移除
 * @param {Object} recipe 目标处方
 */
const onRetireVault = (recipe) => {
  ElMessageBox.confirm(
    `确定要将「${recipe.name}」从策略台账中废止吗？`,
    '废止确认',
    { type: 'warning' }
  )
    .then(() => {
      vaultCtl.retireRecord(recipe.id)
      ElMessage.success('处方已废止，台账已同步')
    })
    .catch(() => {})
}
</script>

<style scoped lang="scss">
.zg-vault {
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

.zg-vaultcard {
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

  &.idle {
    border-left: 3px solid var(--zg-danger);
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
