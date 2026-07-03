<!--
  智光云枢 · 灯网态势 · 光源台账
  业务域：lampNet
  功能：城市照明光源设备的台账登记与状态管理
        支持卡片/列表双视图、抽屉式详情与编排、点熄灯切换回执
-->
<template>
  <section class="zg-registry">
    <!-- 页面头部：品牌徽标 + 标题 + 概览指标 + 新建入口 -->
    <header class="zg-registry__head">
      <div class="zg-registry__headline">
        <div class="zg-registry__sigil">
          <el-icon :size="22"><Sunny /></el-icon>
        </div>
        <div class="zg-registry__copy">
          <h1 class="zg-registry__title">光源台账</h1>
          <p class="zg-registry__sub">
            城市照明光源中枢 · 在役 {{ activeLampCount }} 盏 ·
            停用 {{ offlineLampCount }} 盏 · 累计功率 {{ totalWattage }} W
          </p>
        </div>
      </div>
      <div class="zg-registry__cta">
        <el-button type="primary" @click="registryForm.openComposer()">
          <el-icon><Plus /></el-icon>
          <span>登记光源</span>
        </el-button>
      </div>
    </header>

    <!-- 概览指标卡 -->
    <div class="zg-metrics">
      <div class="zg-metrics__cell">
        <span class="zg-metrics__num">{{ registryCtl.totalRows }}</span>
        <span class="zg-metrics__lbl">光源总数</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--ok">
        <span class="zg-metrics__num">{{ activeLampCount }}</span>
        <span class="zg-metrics__lbl">在役运行</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--warn">
        <span class="zg-metrics__num">{{ offlineLampCount }}</span>
        <span class="zg-metrics__lbl">停用待启</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--info">
        <span class="zg-metrics__num">{{ totalWattage }}</span>
        <span class="zg-metrics__lbl">累计功率(W)</span>
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
          v-model="registryCtl.statusBuckets"
          placeholder="运行状态"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="在役" value="在役" />
          <el-option label="停用" value="停用" />
          <el-option label="检修" value="检修" />
        </el-select>
        <el-select
          v-model="registryCtl.typeBucket"
          placeholder="光源类型"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="LED" value="LED" />
          <el-option label="高压钠灯" value="高压钠灯" />
          <el-option label="金卤灯" value="金卤灯" />
        </el-select>
        <el-input
          v-model="registryCtl.filterLexicon"
          placeholder="检索光源名称/型号"
          clearable
          class="zg-filterband__search"
          @keyup.enter="registryCtl.onFilterApply()"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="registryCtl.onFilterApply()">
          <el-icon><Search /></el-icon>
          <span>检索</span>
        </el-button>
        <el-button @click="registryCtl.onFilterReset()">
          <el-icon><RefreshLeft /></el-icon>
          <span>重置</span>
        </el-button>
      </div>
    </div>

    <!-- 卡片视图 -->
    <div v-if="densityMode === 'card'" class="zg-cardgrid">
      <article
        v-for="lamp in registryCtl.pagedRows"
        :key="lamp.id"
        class="zg-lampcard"
        :class="lamp.status === '在役' ? 'online' : 'offline'"
        @click="registryInspector.openInspector(lamp)"
      >
        <div class="zg-lampcard__head">
          <div class="zg-lampcard__glyph">
            <el-icon :size="24"><Sunny /></el-icon>
          </div>
          <span class="zg-status" :class="lamp.status === '在役' ? 'online' : 'offline'">
            <i class="dot"></i>{{ lamp.status }}
          </span>
        </div>
        <div class="zg-lampcard__body">
          <h3 class="zg-lampcard__name">{{ lamp.name }}</h3>
          <p class="zg-lampcard__area">{{ lamp.area }} · {{ lamp.model }}</p>
          <div class="zg-lampcard__stats">
            <span class="zg-lampcard__stat">
              <em>{{ lamp.power }}</em> W
            </span>
            <span class="zg-lampcard__stat">
              <em>{{ lamp.luminousFlux }}</em> lm
            </span>
            <span class="zg-lampcard__stat">
              <em>{{ lamp.runTime }}</em> h
            </span>
          </div>
        </div>
        <div class="zg-lampcard__foot">
          <span class="zg-lampcard__time">{{ lamp.installTime }}</span>
          <div class="zg-lampcard__actions">
            <el-button link type="primary" size="small" @click.stop="onToggleLamp(lamp)">
              {{ lamp.status === '在役' ? '熄灯' : '点亮' }}
            </el-button>
            <el-button link type="primary" size="small" @click.stop="registryForm.openReviser(lamp)">修订</el-button>
            <el-button link type="danger" size="small" @click.stop="onRetireLamp(lamp)">废止</el-button>
          </div>
        </div>
      </article>
    </div>

    <!-- 列表视图 -->
    <div v-else class="zg-tablewrap">
      <el-table :data="registryCtl.pagedRows" stripe class="zg-datatable">
        <el-table-column prop="no" label="序号" width="60" align="center" />
        <el-table-column prop="area" label="所属区域" width="130" />
        <el-table-column prop="name" label="光源名称" min-width="150" />
        <el-table-column prop="model" label="光源型号" width="120" />
        <el-table-column prop="type" label="光源类型" width="110" align="center" />
        <el-table-column label="运行状态" width="100" align="center">
          <template #default="{ row }">
            <span class="zg-status" :class="row.status === '在役' ? 'online' : 'offline'">
              <i class="dot"></i>{{ row.status }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="power" label="功率(W)" width="100" align="center" />
        <el-table-column prop="luminousFlux" label="光通量(lm)" width="110" align="center" />
        <el-table-column prop="runTime" label="运行时长(h)" width="110" align="center" />
        <el-table-column prop="installTime" label="安装时间" width="130" />
        <el-table-column label="处置" width="240" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="registryInspector.openInspector(row)">详情</el-button>
            <el-button type="warning" size="small" @click="onToggleLamp(row)">
              {{ row.status === '在役' ? '熄灯' : '点亮' }}
            </el-button>
            <el-button type="primary" size="small" @click="registryForm.openReviser(row)">修订</el-button>
            <el-button type="danger" size="small" @click="onRetireLamp(row)">废止</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页条 -->
    <div class="zg-pagerbar">
      <el-pagination
        v-model:current-page="registryCtl.pagingCursor"
        v-model:page-size="registryCtl.pageSpan"
        :total="registryCtl.totalRows"
        :page-sizes="[10, 15, 20, 50, 100]"
        layout="prev, pager, next, jumper, ->, sizes, total"
        background
      />
    </div>

    <!-- 详情抽屉 -->
    <el-drawer
      v-model="registryInspector.drawerOpen"
      :title="'光源详情 · ' + (focusedLamp?.name || '')"
      direction="rtl"
      size="680px"
    >
      <div v-if="focusedLamp" class="zg-inspector">
        <div class="zg-inspector__head">
          <div class="zg-inspector__glyph">
            <el-icon :size="36"><Sunny /></el-icon>
          </div>
          <div class="zg-inspector__meta">
            <h2 class="zg-inspector__name">{{ focusedLamp.name }}</h2>
            <p class="zg-inspector__type">{{ focusedLamp.area }} · {{ focusedLamp.model }}</p>
            <span class="zg-status" :class="focusedLamp.status === '在役' ? 'online' : 'offline'">
              <i class="dot"></i>{{ focusedLamp.status }}
            </span>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">基本档案</h4>
          <div class="zg-inspector__grid">
            <div class="zg-inspector__cell">
              <span class="lbl">安装时间</span>
              <span class="val">{{ focusedLamp.installTime }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">光源类型</span>
              <span class="val">{{ focusedLamp.type }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">累计运行</span>
              <span class="val">{{ focusedLamp.runTime }} h</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">维保单位</span>
              <span class="val">{{ focusedLamp.maintainer || '-' }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">备注</span>
              <span class="val">{{ focusedLamp.remark || '-' }}</span>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">实时遥测</h4>
          <div class="zg-datagrid">
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">额定功率</div>
              <div class="zg-datacard__val">{{ focusedLamp.power }}<em>W</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">光通量</div>
              <div class="zg-datacard__val">{{ focusedLamp.luminousFlux }}<em>lm</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">能效比</div>
              <div class="zg-datacard__val">{{ focusedLamp.efficiency }}<em>lm/W</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">运行时长</div>
              <div class="zg-datacard__val">{{ focusedLamp.runTime }}<em>h</em></div>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">部件清单</h4>
          <el-table :data="focusedLamp.components" size="small" border>
            <el-table-column prop="no" label="序号" width="60" align="center" />
            <el-table-column prop="name" label="部件名称" min-width="120" />
            <el-table-column label="状态" width="90" align="center">
              <template #default="{ row }">
                <span class="zg-status" :class="row.status === '正常' ? 'online' : 'idle'">
                  <i class="dot"></i>{{ row.status }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="lifeSpan" label="剩余寿命(h)" width="130" align="center" />
          </el-table>
        </div>

        <div class="zg-inspector__actions">
          <el-button size="large" @click="registryInspector.closeInspector()">关闭</el-button>
          <el-button
            type="warning"
            size="large"
            @click="onToggleLamp(focusedLamp)"
          >
            {{ focusedLamp.status === '在役' ? '熄灯停用' : '点亮投役' }}
          </el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 新建/修订抽屉 -->
    <el-drawer
      v-model="registryForm.drawerOpen"
      :title="registryForm.editMode === 'compose' ? '登记光源' : '修订光源'"
      direction="rtl"
      size="560px"
    >
      <el-form :model="registryForm.draftPayload" label-width="96px" class="zg-draftform">
        <el-form-item label="所属区域" required>
          <el-select v-model="registryForm.draftPayload.area" placeholder="请选择所属区域" style="width: 100%">
            <el-option label="长沙-岳麓区" value="长沙-岳麓区" />
            <el-option label="长沙-天心区" value="长沙-天心区" />
            <el-option label="长沙-开福区" value="长沙-开福区" />
          </el-select>
        </el-form-item>
        <el-form-item label="光源名称" required>
          <el-input v-model="registryForm.draftPayload.name" placeholder="请输入光源名称" />
        </el-form-item>
        <el-form-item label="光源型号" required>
          <el-input v-model="registryForm.draftPayload.model" placeholder="请输入光源型号" />
        </el-form-item>
        <el-form-item label="光源类型" required>
          <el-select v-model="registryForm.draftPayload.type" placeholder="请选择光源类型" style="width: 100%">
            <el-option label="LED" value="LED" />
            <el-option label="高压钠灯" value="高压钠灯" />
            <el-option label="金卤灯" value="金卤灯" />
          </el-select>
        </el-form-item>
        <el-form-item label="额定功率">
          <el-input-number v-model="registryForm.draftPayload.power" :min="0" :max="2000" />
          <span class="zg-draftform__unit">W</span>
        </el-form-item>
        <el-form-item label="光通量">
          <el-input-number v-model="registryForm.draftPayload.luminousFlux" :min="0" :max="50000" />
          <span class="zg-draftform__unit">lm</span>
        </el-form-item>
        <el-form-item label="安装时间">
          <el-date-picker
            v-model="registryForm.draftPayload.installTime"
            type="date"
            placeholder="选择安装时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="维保单位">
          <el-input v-model="registryForm.draftPayload.maintainer" placeholder="请输入维保单位" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="registryForm.draftPayload.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="registryForm.onDraftDiscard()">取消</el-button>
        <el-button
          type="primary"
          :loading="registryForm.submitting"
          @click="onCommitLampDraft"
        >
          {{ registryForm.editMode === 'compose' ? '登记' : '保存修订' }}
        </el-button>
      </template>
    </el-drawer>
  </section>
</template>

<script setup>
/**
 * 智光云枢 · 灯网态势 · 光源台账
 * 业务域：lampNet
 * 功能：城市照明光源设备的台账登记与状态管理
 * @module lampNet/LampRegistry
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

// ---- 初始 mock 数据池（光源台账） ----
const initialLamps = [
  {
    id: 1,
    no: 1,
    area: '长沙-岳麓区',
    name: '先导路1号光源',
    model: 'LED-150W',
    type: 'LED',
    status: '在役',
    power: 150,
    luminousFlux: 18000,
    efficiency: 120,
    runTime: 8760,
    installTime: '2024-01-15',
    maintainer: '岳麓照明所',
    remark: '主路光源',
    components: [
      { no: 1, name: '驱动电源', status: '正常', lifeSpan: 32000 },
      { no: 2, name: '光源模组', status: '正常', lifeSpan: 28000 },
      { no: 3, name: '控制模块', status: '正常', lifeSpan: 45000 },
      { no: 4, name: '散热组件', status: '告警', lifeSpan: 6000 }
    ]
  },
  {
    id: 2,
    no: 2,
    area: '长沙-岳麓区',
    name: '先导路2号光源',
    model: 'LED-120W',
    type: 'LED',
    status: '在役',
    power: 120,
    luminousFlux: 14400,
    efficiency: 120,
    runTime: 7200,
    installTime: '2024-02-20',
    maintainer: '岳麓照明所',
    remark: '辅路光源',
    components: []
  },
  {
    id: 3,
    no: 3,
    area: '长沙-天心区',
    name: '芙蓉路1号光源',
    model: 'HPS-250W',
    type: '高压钠灯',
    status: '停用',
    power: 250,
    luminousFlux: 25000,
    efficiency: 100,
    runTime: 18000,
    installTime: '2023-03-10',
    maintainer: '天心照明所',
    remark: '待检修',
    components: []
  },
  {
    id: 4,
    no: 4,
    area: '长沙-天心区',
    name: '芙蓉路2号光源',
    model: 'LED-180W',
    type: 'LED',
    status: '在役',
    power: 180,
    luminousFlux: 21600,
    efficiency: 120,
    runTime: 4500,
    installTime: '2024-04-05',
    maintainer: '天心照明所',
    remark: '',
    components: []
  },
  {
    id: 5,
    no: 5,
    area: '长沙-开福区',
    name: '湘江路1号光源',
    model: 'MH-200W',
    type: '金卤灯',
    status: '检修',
    power: 200,
    luminousFlux: 18000,
    efficiency: 90,
    runTime: 12000,
    installTime: '2023-05-18',
    maintainer: '开福照明所',
    remark: '光衰明显',
    components: []
  },
  {
    id: 6,
    no: 6,
    area: '长沙-岳麓区',
    name: '中山路1号光源',
    model: 'LED-100W',
    type: 'LED',
    status: '在役',
    power: 100,
    luminousFlux: 12000,
    efficiency: 120,
    runTime: 5600,
    installTime: '2024-03-22',
    maintainer: '岳麓照明所',
    remark: '步道光源',
    components: []
  },
  {
    id: 7,
    no: 7,
    area: '长沙-天心区',
    name: '中山路2号光源',
    model: 'HPS-150W',
    type: '高压钠灯',
    status: '在役',
    power: 150,
    luminousFlux: 15000,
    efficiency: 100,
    runTime: 9800,
    installTime: '2023-11-08',
    maintainer: '天心照明所',
    remark: '',
    components: []
  },
  {
    id: 8,
    no: 8,
    area: '长沙-开福区',
    name: '人民路1号光源',
    model: 'LED-200W',
    type: 'LED',
    status: '停用',
    power: 200,
    luminousFlux: 24000,
    efficiency: 120,
    runTime: 3200,
    installTime: '2024-05-30',
    maintainer: '开福照明所',
    remark: '线缆改造暂停',
    components: []
  },
  {
    id: 9,
    no: 9,
    area: '长沙-天心区',
    name: '五一大道1号光源',
    model: 'LED-150W',
    type: 'LED',
    status: '在役',
    power: 150,
    luminousFlux: 18000,
    efficiency: 120,
    runTime: 6700,
    installTime: '2024-02-11',
    maintainer: '天心照明所',
    remark: '主干道光源',
    components: []
  },
  {
    id: 10,
    no: 10,
    area: '长沙-开福区',
    name: '五一大道2号光源',
    model: 'MH-175W',
    type: '金卤灯',
    status: '在役',
    power: 175,
    luminousFlux: 15750,
    efficiency: 90,
    runTime: 7400,
    installTime: '2023-09-14',
    maintainer: '开福照明所',
    remark: '',
    components: []
  },
  {
    id: 11,
    no: 11,
    area: '长沙-天心区',
    name: '芙蓉路3号光源',
    model: 'LED-160W',
    type: 'LED',
    status: '检修',
    power: 160,
    luminousFlux: 19200,
    efficiency: 120,
    runTime: 4100,
    installTime: '2024-04-28',
    maintainer: '天心照明所',
    remark: '驱动电源故障',
    components: []
  },
  {
    id: 12,
    no: 12,
    area: '长沙-岳麓区',
    name: '先导路3号光源',
    model: 'HPS-100W',
    type: '高压钠灯',
    status: '在役',
    power: 100,
    luminousFlux: 10000,
    efficiency: 100,
    runTime: 15300,
    installTime: '2023-07-19',
    maintainer: '岳麓照明所',
    remark: '',
    components: []
  }
]

// ---- 表格数据容器（usePresetTable） ----
const registryCtl = usePresetTable(null, {
  defaultPageSpan: 15,
  initialData: initialLamps
})

// ---- 概览指标派生 ----
const activeLampCount = computed(
  () => registryCtl.presetPlaybook.filter(l => l.status === '在役').length
)
const offlineLampCount = computed(
  () => registryCtl.presetPlaybook.filter(l => l.status !== '在役').length
)
const totalWattage = computed(
  () => registryCtl.presetPlaybook.reduce((sum, l) => sum + (l.power || 0), 0)
)

// ---- 表单草稿容器（useFormDraft） ----
const registryForm = useFormDraft(
  {
    area: '',
    name: '',
    model: '',
    type: '',
    power: 0,
    luminousFlux: 0,
    installTime: '',
    maintainer: '',
    remark: ''
  },
  {
    validateFn: (draft) => {
      if (!draft.area) {
        ElMessage.warning('请选择所属区域')
        return false
      }
      if (!draft.name) {
        ElMessage.warning('请输入光源名称')
        return false
      }
      if (!draft.model) {
        ElMessage.warning('请输入光源型号')
        return false
      }
      if (!draft.type) {
        ElMessage.warning('请选择光源类型')
        return false
      }
      return true
    }
  }
)

// ---- 详情抽屉容器（useDrawerInspector） ----
const registryInspector = useDrawerInspector({ size: '680px', direction: 'rtl' })
const focusedLamp = computed(() => registryInspector.focusedRecord)

/**
 * 提交草稿：根据编排/修订模式写入光源台账
 * 业务流包装：新建生成光源编号并附带在役默认态，修订同步遥测字段
 * @returns {Promise<void>}
 */
const onCommitLampDraft = async () => {
  const snapshot = await registryForm.onDraftCommit()
  if (!snapshot) return

  if (registryForm.editMode === 'compose') {
    // 登记：附带运行态默认值
    registryCtl.appendRecord({
      ...snapshot,
      no: registryCtl.presetPlaybook.length + 1,
      status: '在役',
      runTime: 0,
      efficiency: snapshot.power > 0 ? Math.round(snapshot.luminousFlux / snapshot.power) : 0,
      components: []
    })
    ElMessage.success('光源登记成功，已并入灯网台账')
  } else {
    // 修订：合并更新到原记录
    const origin = registryForm.originRecord
    registryCtl.reviseRecord(origin.id, { ...snapshot })
    ElMessage.success('光源档案已更新')
  }
}

/**
 * 点熄灯切换：在役 ↔ 停用，含幂等回执避免重复切换
 * @param {Object} lamp 目标光源
 */
const onToggleLamp = (lamp) => {
  const nextStatus = lamp.status === '在役' ? '停用' : '在役'
  ElMessageBox.confirm(
    `确认将「${lamp.name}」${nextStatus === '在役' ? '点亮投役' : '熄灯停用'}？`,
    '点熄灯确认',
    { type: 'warning' }
  )
    .then(() => {
      registryCtl.reviseRecord(lamp.id, { status: nextStatus })
      ElMessage.success(`光源已${nextStatus === '在役' ? '点亮投役' : '熄灯停用'}，开关回执已签收`)
    })
    .catch(() => {})
}

/**
 * 废止光源：二次确认后从台账中移除
 * @param {Object} lamp 目标光源
 */
const onRetireLamp = (lamp) => {
  ElMessageBox.confirm(
    `确定要将「${lamp.name}」从灯网台账中废止吗？`,
    '废止确认',
    { type: 'warning' }
  )
    .then(() => {
      registryCtl.retireRecord(lamp.id)
      ElMessage.success('光源已废止，台账已同步')
    })
    .catch(() => {})
}
</script>

<style scoped lang="scss">
.zg-registry {
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

.zg-lampcard {
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
