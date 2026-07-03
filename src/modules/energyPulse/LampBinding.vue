<!--
  智光云枢 · 能源脉动 · 光源绑定
  业务域：energyPulse
  功能：城市照明光源集控绑定管理
        支持卡片/列表双视图、抽屉式详情与编排、光源解绑回执
-->
<template>
  <section class="zg-binding">
    <!-- 页面头部：品牌徽标 + 标题 + 概览指标 + 新建入口 -->
    <header class="zg-binding__head">
      <div class="zg-binding__headline">
        <div class="zg-binding__sigil">
          <el-icon :size="22"><Link /></el-icon>
        </div>
        <div class="zg-binding__copy">
          <h1 class="zg-binding__title">光源绑定</h1>
          <p class="zg-binding__sub">
            城市照明光源集控绑定 · 在绑 {{ activeBindingCount }} 台 ·
            空闲 {{ idleBindingCount }} 台 · 累计灯控 {{ totalLampCount }} 盏
          </p>
        </div>
      </div>
      <div class="zg-binding__cta">
        <el-button type="primary" @click="onOpenComposer()">
          <el-icon><Plus /></el-icon>
          <span>新建绑定</span>
        </el-button>
      </div>
    </header>

    <!-- 概览指标卡 -->
    <div class="zg-metrics">
      <div class="zg-metrics__cell">
        <span class="zg-metrics__num">{{ bindingCtl.totalRows }}</span>
        <span class="zg-metrics__lbl">集控总数</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--ok">
        <span class="zg-metrics__num">{{ activeBindingCount }}</span>
        <span class="zg-metrics__lbl">已绑集控</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--warn">
        <span class="zg-metrics__num">{{ idleBindingCount }}</span>
        <span class="zg-metrics__lbl">空闲集控</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--info">
        <span class="zg-metrics__num">{{ totalLampCount }}</span>
        <span class="zg-metrics__lbl">灯控总数</span>
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
          v-model="bindingCtl.statusBuckets"
          placeholder="绑定状态"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="已绑" value="已绑" />
          <el-option label="空闲" value="空闲" />
        </el-select>
        <el-select
          v-model="bindingCtl.typeBucket"
          placeholder="所属区域"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="长沙-岳麓区" value="长沙-岳麓区" />
          <el-option label="长沙-天心区" value="长沙-天心区" />
          <el-option label="长沙-开福区" value="长沙-开福区" />
        </el-select>
        <el-input
          v-model="bindingCtl.filterLexicon"
          placeholder="检索集控名称/编号"
          clearable
          class="zg-filterband__search"
          @keyup.enter="bindingCtl.onFilterApply()"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="bindingCtl.onFilterApply()">
          <el-icon><Search /></el-icon>
          <span>检索</span>
        </el-button>
        <el-button @click="bindingCtl.onFilterReset()">
          <el-icon><RefreshLeft /></el-icon>
          <span>重置</span>
        </el-button>
      </div>
    </div>

    <!-- 卡片视图 -->
    <div v-if="densityMode === 'card'" class="zg-cardgrid">
      <article
        v-for="binding in bindingCtl.pagedRows"
        :key="binding.id"
        class="zg-bindingcard"
        :class="binding.status === '已绑' ? 'bound' : 'idle'"
        @click="bindingInspector.openInspector(binding)"
      >
        <div class="zg-bindingcard__head">
          <div class="zg-bindingcard__glyph">
            <el-icon :size="24"><Link /></el-icon>
          </div>
          <span class="zg-status" :class="binding.status === '已绑' ? 'online' : 'idle'">
            <i class="dot"></i>{{ binding.status }}
          </span>
        </div>
        <div class="zg-bindingcard__body">
          <h3 class="zg-bindingcard__name">{{ binding.name }}</h3>
          <p class="zg-bindingcard__area">{{ binding.area }} · {{ binding.presetSn }}</p>
          <div class="zg-bindingcard__stats">
            <span class="zg-bindingcard__stat">
              <em>{{ binding.bindCount }}</em> 灯控
            </span>
            <span class="zg-bindingcard__stat">
              <em>{{ binding.lampControls?.length || 0 }}</em> 在线
            </span>
          </div>
        </div>
        <div class="zg-bindingcard__foot">
          <span class="zg-bindingcard__time">{{ binding.installTime }}</span>
          <div class="zg-bindingcard__actions">
            <el-button link type="primary" size="small" @click.stop="onOpenReviser(binding)">
              修订
            </el-button>
            <el-button link type="warning" size="small" @click.stop="onUnbind(binding)">
              解绑
            </el-button>
            <el-button link type="danger" size="small" @click.stop="onRetireBinding(binding)">
              废止
            </el-button>
          </div>
        </div>
      </article>
    </div>

    <!-- 列表视图 -->
    <div v-else class="zg-tablewrap">
      <el-table :data="bindingCtl.pagedRows" stripe class="zg-datatable">
        <el-table-column prop="no" label="序号" width="60" align="center" />
        <el-table-column prop="area" label="所属区域" width="130" />
        <el-table-column prop="name" label="集控名称" min-width="150" />
        <el-table-column prop="presetSn" label="集控编号" width="120" />
        <el-table-column label="绑定状态" width="100" align="center">
          <template #default="{ row }">
            <span class="zg-status" :class="row.status === '已绑' ? 'online' : 'idle'">
              <i class="dot"></i>{{ row.status }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="bindCount" label="灯控数" width="90" align="center" />
        <el-table-column prop="installTime" label="绑定时间" width="130" />
        <el-table-column label="处置" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="bindingInspector.openInspector(row)">
              详情
            </el-button>
            <el-button type="warning" size="small" @click="onUnbind(row)">解绑</el-button>
            <el-button type="primary" size="small" @click="onOpenReviser(row)">修订</el-button>
            <el-button type="danger" size="small" @click="onRetireBinding(row)">废止</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页条 -->
    <div class="zg-pagerbar">
      <el-pagination
        v-model:current-page="bindingCtl.pagingCursor"
        v-model:page-size="bindingCtl.pageSpan"
        :total="bindingCtl.totalRows"
        :page-sizes="[10, 15, 20, 50, 100]"
        layout="prev, pager, next, jumper, ->, sizes, total"
        background
      />
    </div>

    <!-- 详情抽屉 -->
    <el-drawer
      v-model="bindingInspector.drawerOpen"
      :title="'光源绑定详情 · ' + (focusedBinding?.name || '')"
      direction="rtl"
      size="680px"
    >
      <div v-if="focusedBinding" class="zg-inspector">
        <div class="zg-inspector__head">
          <div class="zg-inspector__glyph">
            <el-icon :size="36"><Link /></el-icon>
          </div>
          <div class="zg-inspector__meta">
            <h2 class="zg-inspector__name">{{ focusedBinding.name }}</h2>
            <p class="zg-inspector__type">{{ focusedBinding.area }} · {{ focusedBinding.presetSn }}</p>
            <span class="zg-status" :class="focusedBinding.status === '已绑' ? 'online' : 'idle'">
              <i class="dot"></i>{{ focusedBinding.status }}
            </span>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">基本档案</h4>
          <div class="zg-inspector__grid">
            <div class="zg-inspector__cell">
              <span class="lbl">集控编号</span>
              <span class="val">{{ focusedBinding.presetSn }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">绑定数量</span>
              <span class="val">{{ focusedBinding.bindCount }} 盏</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">绑定时间</span>
              <span class="val">{{ focusedBinding.installTime }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">备注</span>
              <span class="val">{{ focusedBinding.remark || '-' }}</span>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">灯控清单</h4>
          <el-table :data="focusedBinding.lampControls" size="small" border>
            <el-table-column prop="no" label="序号" width="60" align="center" />
            <el-table-column prop="imei" label="IMEI号" min-width="140" />
            <el-table-column prop="lampControlName" label="灯控名称" min-width="120" />
            <el-table-column prop="lampPoleName" label="杆塔名称" min-width="120" />
          </el-table>
        </div>

        <div class="zg-inspector__actions">
          <el-button size="large" @click="bindingInspector.closeInspector()">关闭</el-button>
          <el-button type="warning" size="large" @click="onUnbind(focusedBinding)">
            解绑光源
          </el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 新建/修订抽屉 -->
    <el-drawer
      v-model="bindingForm.drawerOpen"
      :title="bindingForm.editMode === 'compose' ? '新建光源绑定' : '修订光源绑定'"
      direction="rtl"
      size="900px"
    >
      <el-form :model="bindingForm.draftPayload" label-width="96px" class="zg-draftform">
        <el-form-item label="所属集控" required>
          <el-select
            v-model="bindingForm.draftPayload.centralControl"
            placeholder="请选择所属集控"
            style="width: 100%"
            :disabled="bindingForm.editMode === 'revise'"
          >
            <el-option
              v-for="ctl in controllerRegistry"
              :key="ctl.presetSn"
              :label="ctl.name"
              :value="ctl.presetSn"
            />
          </el-select>
        </el-form-item>

        <el-row :gutter="16">
          <el-col :span="11">
            <div class="zg-transferpane">
              <div class="zg-transferpane__toolbar">
                <el-input
                  v-model="leftLexicon"
                  placeholder="检索IMEI或名称"
                  clearable
                  class="zg-transferpane__input"
                />
                <el-button type="primary" size="small" @click="onLeftFilterApply">
                  <el-icon><Search /></el-icon>
                </el-button>
                <el-button size="small" @click="onLeftFilterReset">
                  <el-icon><RefreshLeft /></el-icon>
                </el-button>
              </div>
              <el-table
                :data="leftPool"
                border
                size="small"
                class="zg-transferpane__table"
                @selection-change="handleLeftSelection"
              >
                <el-table-column type="selection" width="50" align="center" />
                <el-table-column prop="no" label="No" width="50" align="center" />
                <el-table-column prop="imei" label="IMEI号" min-width="120" />
                <el-table-column prop="lampControlName" label="灯控名称" min-width="100" />
                <el-table-column prop="lampPoleName" label="杆塔名称" min-width="100" />
              </el-table>
              <div v-if="leftPool.length === 0" class="zg-transferpane__empty">暂无数据</div>
            </div>
          </el-col>
          <el-col :span="2" class="zg-transferpane__shuttle">
            <el-button
              type="primary"
              circle
              :disabled="leftSelected.length === 0"
              @click="onMoveRight"
            >
              <el-icon><ArrowRight /></el-icon>
            </el-button>
            <el-button
              type="primary"
              circle
              :disabled="rightSelected.length === 0"
              style="margin-top: 10px;"
              @click="onMoveLeft"
            >
              <el-icon><ArrowLeft /></el-icon>
            </el-button>
          </el-col>
          <el-col :span="11">
            <div class="zg-transferpane">
              <div class="zg-transferpane__toolbar">
                <el-input
                  v-model="rightLexicon"
                  placeholder="检索IMEI或名称"
                  clearable
                  class="zg-transferpane__input"
                  disabled
                />
                <el-button type="primary" size="small" disabled>
                  <el-icon><Search /></el-icon>
                </el-button>
                <el-button size="small" disabled>
                  <el-icon><RefreshLeft /></el-icon>
                </el-button>
              </div>
              <el-table
                :data="chosenLamps"
                border
                size="small"
                class="zg-transferpane__table"
                @selection-change="handleRightSelection"
              >
                <el-table-column type="selection" width="50" align="center" />
                <el-table-column prop="no" label="No" width="50" align="center" />
                <el-table-column prop="imei" label="IMEI号" min-width="120" />
                <el-table-column prop="lampControlName" label="灯控名称" min-width="100" />
                <el-table-column prop="lampPoleName" label="杆塔名称" min-width="100" />
              </el-table>
              <div v-if="chosenLamps.length === 0" class="zg-transferpane__empty">暂无数据</div>
            </div>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="bindingForm.onDraftDiscard()">取消</el-button>
        <el-button
          type="primary"
          :loading="bindingForm.submitting"
          @click="onCommitBindingDraft"
        >
          {{ bindingForm.editMode === 'compose' ? '登记绑定' : '保存修订' }}
        </el-button>
      </template>
    </el-drawer>
  </section>
</template>

<script setup>
/**
 * 智光云枢 · 能源脉动 · 光源绑定
 * 业务域：energyPulse
 * 功能：城市照明光源集控绑定管理
 * @module energyPulse/LampBinding
 * @author 智光云枢研发团队
 */
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Link,
  Plus,
  Grid,
  List,
  Search,
  RefreshLeft,
  ArrowRight,
  ArrowLeft
} from '@element-plus/icons-vue'
import { usePresetTable } from '@/shared/composables/usePresetTable'
import { useFormDraft } from '@/shared/composables/useFormDraft'
import { useDrawerInspector } from '@/shared/composables/useDrawerInspector'

// ---- 视图密度切换 ----
const densityMode = ref('card')

// ---- 集控注册表 ----
const controllerRegistry = [
  { presetSn: 'ZTJK', name: '先导路集控', area: '长沙-岳麓区' },
  { presetSn: 'CS128M', name: '测试128M', area: '长沙-岳麓区' },
  { presetSn: 'XDLJK1', name: '力唯中天1栋集控1', area: '长沙-天心区' },
  { presetSn: 'XDLJK2', name: '力唯中天1栋集控2', area: '长沙-天心区' },
  { presetSn: 'FRLJK', name: '芙蓉路集控', area: '长沙-开福区' },
  { presetSn: 'XJLJK', name: '湘江路集控', area: '长沙-开福区' }
]

// ---- 初始 mock 数据池 ----
const initialBindings = [
  {
    id: 1,
    no: 1,
    name: '先导路集控',
    presetSn: 'ZTJK',
    area: '长沙-岳麓区',
    category: '长沙-岳麓区',
    status: '已绑',
    bindCount: 2,
    installTime: '2024-01-15',
    remark: '主路集控',
    lampControls: [
      { no: 1, imei: '867892010000001', lampControlName: '灯控1', lampPoleName: '杆塔001' },
      { no: 2, imei: '867892010000002', lampControlName: '灯控2', lampPoleName: '杆塔002' }
    ]
  },
  {
    id: 2,
    no: 2,
    name: '测试128M',
    presetSn: 'CS128M',
    area: '长沙-岳麓区',
    category: '长沙-岳麓区',
    status: '已绑',
    bindCount: 1,
    installTime: '2024-02-20',
    remark: '',
    lampControls: [
      { no: 3, imei: '867892010000003', lampControlName: '灯控3', lampPoleName: '杆塔003' }
    ]
  },
  {
    id: 3,
    no: 3,
    name: '力唯中天1栋集控1',
    presetSn: 'XDLJK1',
    area: '长沙-天心区',
    category: '长沙-天心区',
    status: '空闲',
    bindCount: 0,
    installTime: '2024-03-10',
    remark: '待配置',
    lampControls: []
  },
  {
    id: 4,
    no: 4,
    name: '力唯中天1栋集控2',
    presetSn: 'XDLJK2',
    area: '长沙-天心区',
    category: '长沙-天心区',
    status: '已绑',
    bindCount: 3,
    installTime: '2024-04-05',
    remark: '',
    lampControls: [
      { no: 4, imei: '867892010000004', lampControlName: '灯控4', lampPoleName: '杆塔004' },
      { no: 5, imei: '867892010000005', lampControlName: '灯控5', lampPoleName: '杆塔005' },
      { no: 6, imei: '867892010000006', lampControlName: '灯控6', lampPoleName: '杆塔006' }
    ]
  },
  {
    id: 5,
    no: 5,
    name: '芙蓉路集控',
    presetSn: 'FRLJK',
    area: '长沙-开福区',
    category: '长沙-开福区',
    status: '空闲',
    bindCount: 0,
    installTime: '2024-05-18',
    remark: '新建',
    lampControls: []
  },
  {
    id: 6,
    no: 6,
    name: '湘江路集控',
    presetSn: 'XJLJK',
    area: '长沙-开福区',
    category: '长沙-开福区',
    status: '已绑',
    bindCount: 2,
    installTime: '2024-06-01',
    remark: '',
    lampControls: [
      { no: 7, imei: '867892010000007', lampControlName: '灯控7', lampPoleName: '杆塔007' },
      { no: 8, imei: '867892010000008', lampControlName: '灯控8', lampPoleName: '杆塔008' }
    ]
  }
]

// ---- 灯控全池 ----
const allLampControls = ref([
  { no: 1, imei: '867892010000001', lampControlName: '灯控1', lampPoleName: '杆塔001' },
  { no: 2, imei: '867892010000002', lampControlName: '灯控2', lampPoleName: '杆塔002' },
  { no: 3, imei: '867892010000003', lampControlName: '灯控3', lampPoleName: '杆塔003' },
  { no: 4, imei: '867892010000004', lampControlName: '灯控4', lampPoleName: '杆塔004' },
  { no: 5, imei: '867892010000005', lampControlName: '灯控5', lampPoleName: '杆塔005' },
  { no: 6, imei: '867892010000006', lampControlName: '灯控6', lampPoleName: '杆塔006' },
  { no: 7, imei: '867892010000007', lampControlName: '灯控7', lampPoleName: '杆塔007' },
  { no: 8, imei: '867892010000008', lampControlName: '灯控8', lampPoleName: '杆塔008' },
  { no: 9, imei: '867892010000009', lampControlName: '灯控9', lampPoleName: '杆塔009' },
  { no: 10, imei: '867892010000010', lampControlName: '灯控10', lampPoleName: '杆塔010' }
])

// ---- 表格数据容器（usePresetTable） ----
const bindingCtl = usePresetTable(null, {
  defaultPageSpan: 15,
  initialData: initialBindings
})

// ---- 概览指标派生 ----
const activeBindingCount = computed(
  () => bindingCtl.presetPlaybook.filter(b => b.status === '已绑').length
)
const idleBindingCount = computed(
  () => bindingCtl.presetPlaybook.filter(b => b.status === '空闲').length
)
const totalLampCount = computed(
  () => bindingCtl.presetPlaybook.reduce((sum, b) => sum + (b.bindCount || 0), 0)
)

// ---- 表单草稿容器（useFormDraft） ----
const bindingForm = useFormDraft(
  {
    centralControl: ''
  },
  {
    validateFn: (draft) => {
      if (!draft.centralControl) {
        ElMessage.warning('请选择所属集控')
        return false
      }
      return true
    }
  }
)

// ---- 详情抽屉容器（useDrawerInspector） ----
const bindingInspector = useDrawerInspector({ size: '680px', direction: 'rtl' })
const focusedBinding = computed(() => bindingInspector.focusedRecord)

// ---- 穿梭选择状态 ----
const chosenLamps = ref([])
const leftLexicon = ref('')
const rightLexicon = ref('')
const leftSelected = ref([])
const rightSelected = ref([])

const leftPool = computed(() => {
  let pool = allLampControls.value.filter(
    lc => !chosenLamps.value.some(cl => cl.imei === lc.imei)
  )
  if (leftLexicon.value) {
    const kw = leftLexicon.value.toLowerCase()
    pool = pool.filter(
      lc =>
        lc.imei.toLowerCase().includes(kw) ||
        lc.lampControlName.toLowerCase().includes(kw) ||
        lc.lampPoleName.toLowerCase().includes(kw)
    )
  }
  return pool
})

/**
 * 打开编排抽屉（新建）
 */
const onOpenComposer = () => {
  chosenLamps.value = []
  leftLexicon.value = ''
  rightLexicon.value = ''
  leftSelected.value = []
  rightSelected.value = []
  bindingForm.openComposer()
}

/**
 * 打开修订抽屉
 * @param {Object} row 当前行数据
 */
const onOpenReviser = (row) => {
  chosenLamps.value = [...(row.lampControls || [])]
  leftLexicon.value = ''
  rightLexicon.value = ''
  leftSelected.value = []
  rightSelected.value = []
  bindingForm.openReviser(row)
}

/**
 * 提交草稿：根据编排/修订模式写入数据池
 * 业务流包装：新建生成绑定编号，修订同步灯控清单
 */
const onCommitBindingDraft = async () => {
  const snapshot = await bindingForm.onDraftCommit()
  if (!snapshot) return

  const picked = controllerRegistry.find(c => c.presetSn === snapshot.centralControl)
  if (!picked) {
    ElMessage.warning('所属集控无效')
    return
  }

  if (bindingForm.editMode === 'compose') {
    bindingCtl.appendRecord({
      ...snapshot,
      name: picked.name,
      presetSn: picked.presetSn,
      area: picked.area,
      category: picked.area,
      status: chosenLamps.value.length > 0 ? '已绑' : '空闲',
      bindCount: chosenLamps.value.length,
      installTime: new Date().toISOString().slice(0, 10),
      remark: '',
      lampControls: [...chosenLamps.value]
    })
    ElMessage.success('光源绑定登记成功，已并入台账')
  } else {
    const origin = bindingForm.originRecord
    bindingCtl.reviseRecord(origin.id, {
      ...snapshot,
      name: picked.name,
      presetSn: picked.presetSn,
      area: picked.area,
      category: picked.area,
      status: chosenLamps.value.length > 0 ? '已绑' : '空闲',
      bindCount: chosenLamps.value.length,
      lampControls: [...chosenLamps.value]
    })
    ElMessage.success('光源绑定档案已更新')
  }
}

/**
 * 解绑光源：清空灯控清单并置为空闲态，含二次确认回执
 * @param {Object} binding 目标绑定记录
 */
const onUnbind = (binding) => {
  ElMessageBox.confirm(
    `确认对集控「${binding.name}」执行解绑？`,
    '解绑确认',
    { type: 'warning' }
  )
    .then(() => {
      bindingCtl.reviseRecord(binding.id, {
        status: '空闲',
        bindCount: 0,
        lampControls: []
      })
      ElMessage.success('光源已解绑，台账已同步')
    })
    .catch(() => {})
}

/**
 * 废止绑定：二次确认后从台账中移除
 * @param {Object} binding 目标绑定记录
 */
const onRetireBinding = (binding) => {
  ElMessageBox.confirm(
    `确定要将「${binding.name}」从绑定台账中废止吗？`,
    '废止确认',
    { type: 'warning' }
  )
    .then(() => {
      bindingCtl.retireRecord(binding.id)
      ElMessage.success('绑定已废止，台账已同步')
    })
    .catch(() => {})
}

/**
 * 左侧检索
 */
const onLeftFilterApply = () => {
  ElMessage.success('查询成功')
}

/**
 * 左侧重置
 */
const onLeftFilterReset = () => {
  leftLexicon.value = ''
}

/**
 * 左侧选择变更
 * @param {Array} selection
 */
const handleLeftSelection = (selection) => {
  leftSelected.value = selection
}

/**
 * 右侧选择变更
 * @param {Array} selection
 */
const handleRightSelection = (selection) => {
  rightSelected.value = selection
}

/**
 * 向右穿梭：将左侧选中灯控移入已选池
 */
const onMoveRight = () => {
  if (leftSelected.value.length === 0) {
    ElMessage.warning('请选择要添加的灯控')
    return
  }
  leftSelected.value.forEach(lc => {
    if (!chosenLamps.value.some(cl => cl.imei === lc.imei)) {
      chosenLamps.value.push(lc)
    }
  })
  leftSelected.value = []
  ElMessage.success('已添加选中的灯控')
}

/**
 * 向左穿梭：将右侧选中灯控移出已选池
 */
const onMoveLeft = () => {
  if (rightSelected.value.length === 0) {
    ElMessage.warning('请选择要移除的灯控')
    return
  }
  const imeis = rightSelected.value.map(lc => lc.imei)
  chosenLamps.value = chosenLamps.value.filter(lc => !imeis.includes(lc.imei))
  rightSelected.value = []
  ElMessage.success('已移除选中的灯控')
}
</script>

<style scoped lang="scss">
.zg-binding {
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

.zg-bindingcard {
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

  &.bound { border-left: 3px solid var(--zg-success); }
  &.idle { border-left: 3px solid var(--zg-warning); }

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

.zg-transferpane {
  display: flex;
  flex-direction: column;
  background: var(--zg-surface-muted);
  border: 1px solid var(--zg-line-soft);
  border-radius: var(--zg-radius-md);
  padding: 12px;

  &__toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
  }

  &__input {
    flex: 1;
  }

  &__table {
    flex: 1;
  }

  &__shuttle {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  &__empty {
    text-align: center;
    padding: 32px 0;
    font-size: 13px;
    color: var(--zg-ink-placeholder);
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
