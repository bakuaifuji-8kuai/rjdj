<!--
  智光云枢 · 灯网态势 · 处方编排
  业务域：lampNet
  功能：城市照明光照策略的处方台账管理与生命周期编排
        支持卡片/列表双视图、抽屉式详情与编排、处方投用/停用回执
-->
<template>
  <section class="zg-recipe">
    <!-- 页面头部：品牌徽标 + 标题 + 概览指标 + 新建入口 -->
    <header class="zg-recipe__head">
      <div class="zg-recipe__headline">
        <div class="zg-recipe__sigil">
          <el-icon :size="22"><Edit /></el-icon>
        </div>
        <div class="zg-recipe__copy">
          <h1 class="zg-recipe__title">处方编排</h1>
          <p class="zg-recipe__sub">
            城市照明光照策略中枢 · 在役 {{ activeRecipeCount }} 张 ·
            停用 {{ retiredRecipeCount }} 张 · 累计关联节点 {{ totalNodeCount }} 个
          </p>
        </div>
      </div>
      <div class="zg-recipe__cta">
        <el-button type="primary" @click="recipeForm.openComposer()">
          <el-icon><Plus /></el-icon>
          <span>新建处方</span>
        </el-button>
      </div>
    </header>

    <!-- 概览指标卡 -->
    <div class="zg-metrics">
      <div class="zg-metrics__cell">
        <span class="zg-metrics__num">{{ recipeCtl.totalRows }}</span>
        <span class="zg-metrics__lbl">处方总数</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--ok">
        <span class="zg-metrics__num">{{ activeRecipeCount }}</span>
        <span class="zg-metrics__lbl">在役处方</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--warn">
        <span class="zg-metrics__num">{{ retiredRecipeCount }}</span>
        <span class="zg-metrics__lbl">停用处方</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--info">
        <span class="zg-metrics__num">{{ totalNodeCount }}</span>
        <span class="zg-metrics__lbl">关联节点数</span>
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
          v-model="recipeCtl.typeBucket"
          placeholder="处方类型"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="调光策略" value="调光策略" />
          <el-option label="开关策略" value="开关策略" />
          <el-option label="巡检策略" value="巡检策略" />
          <el-option label="告警联动" value="告警联动" />
          <el-option label="节能策略" value="节能策略" />
        </el-select>
        <el-select
          v-model="recipeCtl.statusBuckets"
          placeholder="生命周期"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="在役" value="在役" />
          <el-option label="停用" value="停用" />
        </el-select>
        <el-input
          v-model="recipeCtl.filterLexicon"
          placeholder="检索处方名称/编号"
          clearable
          class="zg-filterband__search"
          @keyup.enter="recipeCtl.onFilterApply()"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="recipeCtl.onFilterApply()">
          <el-icon><Search /></el-icon>
          <span>检索</span>
        </el-button>
        <el-button @click="recipeCtl.onFilterReset()">
          <el-icon><RefreshLeft /></el-icon>
          <span>重置</span>
        </el-button>
      </div>
    </div>

    <!-- 卡片视图 -->
    <div v-if="densityMode === 'card'" class="zg-cardgrid">
      <article
        v-for="recipe in recipeCtl.pagedRows"
        :key="recipe.id"
        class="zg-recipecard"
        :class="recipe.status === '在役' ? 'online' : 'offline'"
        @click="recipeInspector.openInspector(recipe)"
      >
        <div class="zg-recipecard__head">
          <div class="zg-recipecard__glyph">
            <el-icon :size="24"><Edit /></el-icon>
          </div>
          <span class="zg-status" :class="recipe.status === '在役' ? 'online' : 'offline'">
            <i class="dot"></i>{{ recipe.status }}
          </span>
        </div>
        <div class="zg-recipecard__body">
          <h3 class="zg-recipecard__name">{{ recipe.name }}</h3>
          <p class="zg-recipecard__category">{{ recipe.category }} · {{ recipe.triggerMode }}</p>
          <div class="zg-recipecard__stats">
            <span class="zg-recipecard__stat">
              <em>{{ recipe.nodeCount }}</em> 节点
            </span>
            <span class="zg-recipecard__stat">
              <em>{{ recipe.efficacy }}</em> %能效
            </span>
            <span class="zg-recipecard__stat">
              <em>{{ recipe.commands?.length || 0 }}</em> 指令
            </span>
          </div>
        </div>
        <div class="zg-recipecard__foot">
          <span class="zg-recipecard__time">{{ recipe.createdAt }}</span>
          <div class="zg-recipecard__actions">
            <el-button link type="primary" size="small" @click.stop="onTriggerRecipe(recipe)">
              {{ recipe.status === '在役' ? '停用' : '投用' }}
            </el-button>
            <el-button link type="primary" size="small" @click.stop="recipeForm.openReviser(recipe)">修订</el-button>
            <el-button link type="danger" size="small" @click.stop="onRetireRecipe(recipe)">废止</el-button>
          </div>
        </div>
      </article>
    </div>

    <!-- 列表视图 -->
    <div v-else class="zg-tablewrap">
      <el-table :data="recipeCtl.pagedRows" stripe class="zg-datatable">
        <el-table-column prop="no" label="序号" width="60" align="center" />
        <el-table-column prop="category" label="处方类型" width="120" />
        <el-table-column prop="name" label="处方名称" min-width="160" />
        <el-table-column prop="triggerMode" label="触发方式" width="110" />
        <el-table-column label="生命周期" width="100" align="center">
          <template #default="{ row }">
            <span class="zg-status" :class="row.status === '在役' ? 'online' : 'offline'">
              <i class="dot"></i>{{ row.status }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="nodeCount" label="关联节点" width="100" align="center" />
        <el-table-column prop="efficacy" label="预期能效(%)" width="110" align="center" />
        <el-table-column label="指令数" width="90" align="center">
          <template #default="{ row }">
            {{ row.commands?.length || 0 }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="130" />
        <el-table-column label="处置" width="240" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="recipeInspector.openInspector(row)">详情</el-button>
            <el-button type="warning" size="small" @click="onTriggerRecipe(row)">
              {{ row.status === '在役' ? '停用' : '投用' }}
            </el-button>
            <el-button type="primary" size="small" @click="recipeForm.openReviser(row)">修订</el-button>
            <el-button type="danger" size="small" @click="onRetireRecipe(row)">废止</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页条 -->
    <div class="zg-pagerbar">
      <el-pagination
        v-model:current-page="recipeCtl.pagingCursor"
        v-model:page-size="recipeCtl.pageSpan"
        :total="recipeCtl.totalRows"
        :page-sizes="[10, 15, 20, 50, 100]"
        layout="prev, pager, next, jumper, ->, sizes, total"
        background
      />
    </div>

    <!-- 详情抽屉 -->
    <el-drawer
      v-model="recipeInspector.drawerOpen"
      :title="'处方详情 · ' + (focusedRecipe?.name || '')"
      direction="rtl"
      size="680px"
    >
      <div v-if="focusedRecipe" class="zg-inspector">
        <div class="zg-inspector__head">
          <div class="zg-inspector__glyph">
            <el-icon :size="36"><Edit /></el-icon>
          </div>
          <div class="zg-inspector__meta">
            <h2 class="zg-inspector__name">{{ focusedRecipe.name }}</h2>
            <p class="zg-inspector__type">{{ focusedRecipe.category }} · {{ focusedRecipe.triggerMode }}</p>
            <span class="zg-status" :class="focusedRecipe.status === '在役' ? 'online' : 'offline'">
              <i class="dot"></i>{{ focusedRecipe.status }}
            </span>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">基本档案</h4>
          <div class="zg-inspector__grid">
            <div class="zg-inspector__cell">
              <span class="lbl">创建时间</span>
              <span class="val">{{ focusedRecipe.createdAt }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">触发方式</span>
              <span class="val">{{ focusedRecipe.triggerMode }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">备注</span>
              <span class="val">{{ focusedRecipe.remark || '-' }}</span>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">策略效能</h4>
          <div class="zg-datagrid">
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">关联节点</div>
              <div class="zg-datacard__val">{{ focusedRecipe.nodeCount }}<em>个</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">预期能效</div>
              <div class="zg-datacard__val">{{ focusedRecipe.efficacy }}<em>%</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">指令条数</div>
              <div class="zg-datacard__val">{{ focusedRecipe.commands?.length || 0 }}<em>条</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">运行时长</div>
              <div class="zg-datacard__val">{{ focusedRecipe.runDuration || 0 }}<em>h</em></div>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">指令清单</h4>
          <el-table :data="focusedRecipe.commands" size="small" border>
            <el-table-column prop="no" label="序号" width="60" align="center" />
            <el-table-column prop="action" label="动作" min-width="100" />
            <el-table-column prop="target" label="作用对象" min-width="120" />
            <el-table-column prop="param" label="参数" width="140" align="center" />
          </el-table>
        </div>

        <div class="zg-inspector__actions">
          <el-button size="large" @click="recipeInspector.closeInspector()">关闭</el-button>
          <el-button
            type="warning"
            size="large"
            @click="onTriggerRecipe(focusedRecipe)"
          >
            {{ focusedRecipe.status === '在役' ? '停用处方' : '投用处方' }}
          </el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 新建/修订抽屉 -->
    <el-drawer
      v-model="recipeForm.drawerOpen"
      :title="recipeForm.editMode === 'compose' ? '新建处方' : '修订处方'"
      direction="rtl"
      size="560px"
    >
      <el-form :model="recipeForm.draftPayload" label-width="96px" class="zg-draftform">
        <el-form-item label="处方类型" required>
          <el-select v-model="recipeForm.draftPayload.category" placeholder="请选择处方类型" style="width: 100%">
            <el-option label="调光策略" value="调光策略" />
            <el-option label="开关策略" value="开关策略" />
            <el-option label="巡检策略" value="巡检策略" />
            <el-option label="告警联动" value="告警联动" />
            <el-option label="节能策略" value="节能策略" />
          </el-select>
        </el-form-item>
        <el-form-item label="处方名称" required>
          <el-input v-model="recipeForm.draftPayload.name" placeholder="请输入处方名称" />
        </el-form-item>
        <el-form-item label="触发方式" required>
          <el-select v-model="recipeForm.draftPayload.triggerMode" placeholder="请选择触发方式" style="width: 100%">
            <el-option label="定时触发" value="定时触发" />
            <el-option label="手动触发" value="手动触发" />
            <el-option label="光感联动" value="光感联动" />
            <el-option label="告警联动" value="告警联动" />
          </el-select>
        </el-form-item>
        <el-form-item label="关联节点">
          <el-input-number v-model="recipeForm.draftPayload.nodeCount" :min="0" :max="10000" />
          <span class="zg-draftform__unit">个</span>
        </el-form-item>
        <el-form-item label="预期能效">
          <el-input-number v-model="recipeForm.draftPayload.efficacy" :min="0" :max="100" />
          <span class="zg-draftform__unit">%</span>
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="recipeForm.draftPayload.createdAt"
            type="date"
            placeholder="选择创建时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="recipeForm.draftPayload.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="recipeForm.onDraftDiscard()">取消</el-button>
        <el-button
          type="primary"
          :loading="recipeForm.submitting"
          @click="onCommitRecipeDraft"
        >
          {{ recipeForm.editMode === 'compose' ? '创建' : '保存修订' }}
        </el-button>
      </template>
    </el-drawer>
  </section>
</template>

<script setup>
/**
 * 智光云枢 · 灯网态势 · 处方编排
 * 业务域：lampNet
 * 功能：城市照明光照策略的处方台账管理与生命周期编排
 *        支持卡片/列表双视图、抽屉式详情与编排、处方投用/停用回执
 * @module lampNet/RecipeComposer
 * @author 智光云枢研发团队
 */
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Edit,
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
    category: '节能策略',
    name: '岳麓区主干道节能调光',
    triggerMode: '光感联动',
    status: '在役',
    nodeCount: 128,
    efficacy: 35,
    createdAt: '2024-03-15',
    remark: '春季夜间降功率运行',
    runDuration: 2160,
    commands: [
      { no: 1, action: '亮度下调', target: '主路灯组', param: '70%' },
      { no: 2, action: '时段关闭', target: '辅路灯组', param: '02:00-05:00' }
    ]
  },
  {
    id: 2,
    no: 2,
    category: '开关策略',
    name: '天心区芙蓉路定时开关',
    triggerMode: '定时触发',
    status: '在役',
    nodeCount: 256,
    efficacy: 28,
    createdAt: '2024-04-02',
    remark: '冬季提前开灯',
    runDuration: 1520,
    commands: [
      { no: 1, action: '开灯', target: '全线灯组', param: '18:00' },
      { no: 2, action: '关灯', target: '全线灯组', param: '06:30' }
    ]
  },
  {
    id: 3,
    no: 3,
    category: '告警联动',
    name: '开福区湘江路故障联动',
    triggerMode: '告警联动',
    status: '停用',
    nodeCount: 64,
    efficacy: 22,
    createdAt: '2024-05-10',
    remark: '待策略验证后投用',
    runDuration: 480,
    commands: [
      { no: 1, action: '告警上报', target: '运维平台', param: '即时' },
      { no: 2, action: '备用回路', target: '故障节点邻区', param: '自动切换' }
    ]
  },
  {
    id: 4,
    no: 4,
    category: '巡检策略',
    name: '全城光源健康巡检',
    triggerMode: '手动触发',
    status: '在役',
    nodeCount: 512,
    efficacy: 15,
    createdAt: '2024-06-01',
    remark: '每月例行巡检',
    runDuration: 720,
    commands: [
      { no: 1, action: '电流采样', target: '全部光源', param: '逐盏' },
      { no: 2, action: '电压采样', target: '全部光源', param: '逐盏' }
    ]
  },
  {
    id: 5,
    no: 5,
    category: '调光策略',
    name: '商业区人流自适应调光',
    triggerMode: '光感联动',
    status: '在役',
    nodeCount: 98,
    efficacy: 42,
    createdAt: '2024-06-20',
    remark: '高峰期满功率，低峰期降亮',
    runDuration: 360,
    commands: [
      { no: 1, action: '亮度上调', target: '商业区灯组', param: '100%' },
      { no: 2, action: '亮度下调', target: '商业区灯组', param: '50%' }
    ]
  }
]

// ---- 表格数据容器（usePresetTable） ----
const recipeCtl = usePresetTable(null, {
  defaultPageSpan: 15,
  initialData: initialRecipes
})

// ---- 概览指标派生 ----
const activeRecipeCount = computed(
  () => recipeCtl.presetPlaybook.filter(r => r.status === '在役').length
)
const retiredRecipeCount = computed(
  () => recipeCtl.presetPlaybook.filter(r => r.status === '停用').length
)
const totalNodeCount = computed(
  () => recipeCtl.presetPlaybook.reduce((sum, r) => sum + (r.nodeCount || 0), 0)
)

// ---- 表单草稿容器（useFormDraft） ----
const recipeForm = useFormDraft(
  {
    category: '',
    name: '',
    triggerMode: '',
    nodeCount: 0,
    efficacy: 0,
    createdAt: '',
    remark: ''
  },
  {
    validateFn: (draft) => {
      if (!draft.category) {
        ElMessage.warning('请选择处方类型')
        return false
      }
      if (!draft.name) {
        ElMessage.warning('请输入处方名称')
        return false
      }
      if (!draft.triggerMode) {
        ElMessage.warning('请选择触发方式')
        return false
      }
      return true
    }
  }
)

// ---- 详情抽屉容器（useDrawerInspector） ----
const recipeInspector = useDrawerInspector({ size: '680px', direction: 'rtl' })
const focusedRecipe = computed(() => recipeInspector.focusedRecord)

/**
 * 提交草稿：根据编排/修订模式写入数据池
 * 业务流包装：新建生成处方编号，修订同步策略字段
 */
const onCommitRecipeDraft = async () => {
  const snapshot = await recipeForm.onDraftCommit()
  if (!snapshot) return

  if (recipeForm.editMode === 'compose') {
    // 创建：附带运行态默认值
    recipeCtl.appendRecord({
      ...snapshot,
      no: recipeCtl.presetPlaybook.length + 1,
      status: '在役',
      runDuration: 0,
      commands: []
    })
    ElMessage.success('处方创建成功，已并入光照策略台账')
  } else {
    // 修订：合并更新到原记录
    const origin = recipeForm.originRecord
    recipeCtl.reviseRecord(origin.id, { ...snapshot })
    ElMessage.success('处方档案已更新')
  }
}

/**
 * 触发处方：在役↔停用切换，含幂等回执避免重复触发
 * @param {Object} recipe 目标处方
 */
const onTriggerRecipe = (recipe) => {
  const nextStatus = recipe.status === '在役' ? '停用' : '在役'
  ElMessageBox.confirm(
    `确认将「${recipe.name}」${nextStatus === '在役' ? '投用' : '停用'}？`,
    '状态切换确认',
    { type: 'warning' }
  )
    .then(() => {
      recipeCtl.reviseRecord(recipe.id, { status: nextStatus })
      ElMessage.success(`处方已${nextStatus === '在役' ? '投用' : '停用'}，策略回执已签收`)
    })
    .catch(() => {})
}

/**
 * 废止处方：二次确认后从台账中移除
 * @param {Object} recipe 目标处方
 */
const onRetireRecipe = (recipe) => {
  ElMessageBox.confirm(
    `确定要将「${recipe.name}」从光照策略台账中废止吗？`,
    '废止确认',
    { type: 'warning' }
  )
    .then(() => {
      recipeCtl.retireRecord(recipe.id)
      ElMessage.success('处方已废止，台账已同步')
    })
    .catch(() => {})
}
</script>

<style scoped lang="scss">
.zg-recipe {
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

.zg-recipecard {
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

  &__category {
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
