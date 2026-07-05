<!--
  智光云枢 · 终端管理 · 亮度传感器
  业务域：terminalAtlas
  功能：城市照明亮度传感器台账与实时监测
        支持卡片/列表双视图、抽屉式详情与编排、亮度读取回执
-->
<template>
  <section class="zg-luminance">
    <!-- 页面头部：品牌徽标 + 标题 + 概览指标 + 新建入口 -->
    <header class="zg-luminance__head">
      <div class="zg-luminance__headline">
        <div class="zg-luminance__sigil">
          <el-icon :size="22"><Sunny /></el-icon>
        </div>
        <div class="zg-luminance__copy">
          <h1 class="zg-luminance__title">亮度传感器</h1>
          <p class="zg-luminance__sub">
            城市照明感知终端 · 在役 {{ activeProbeCount }} 台 ·
            离线 {{ offlineProbeCount }} 台 · 累计采集 {{ totalSampleCount }} 次
          </p>
        </div>
      </div>
      <div class="zg-luminance__cta">
        <el-button type="primary" @click="probeForm.openComposer()">
          <el-icon><Plus /></el-icon>
          <span>新增传感器</span>
        </el-button>
      </div>
    </header>

    <!-- 概览指标卡 -->
    <div class="zg-metrics">
      <div class="zg-metrics__cell">
        <span class="zg-metrics__num">{{ probeCtl.totalRows }}</span>
        <span class="zg-metrics__lbl">传感器总数</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--ok">
        <span class="zg-metrics__num">{{ activeProbeCount }}</span>
        <span class="zg-metrics__lbl">在线运行</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--warn">
        <span class="zg-metrics__num">{{ offlineProbeCount }}</span>
        <span class="zg-metrics__lbl">离线待检</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--info">
        <span class="zg-metrics__num">{{ totalSampleCount }}</span>
        <span class="zg-metrics__lbl">采集总次数</span>
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
          v-model="probeCtl.statusBuckets"
          placeholder="运行状态"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="在线" value="在线" />
          <el-option label="离线" value="离线" />
        </el-select>
        <el-select
          v-model="probeCtl.typeBucket"
          placeholder="所属区域"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="长沙-岳麓区" value="长沙-岳麓区" />
          <el-option label="长沙-天心区" value="长沙-天心区" />
          <el-option label="长沙-开福区" value="长沙-开福区" />
        </el-select>
        <el-input
          v-model="probeCtl.filterLexicon"
          placeholder="检索设备名称/编号"
          clearable
          class="zg-filterband__search"
          @keyup.enter="probeCtl.onFilterApply()"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="probeCtl.onFilterApply()">
          <el-icon><Search /></el-icon>
          <span>检索</span>
        </el-button>
        <el-button @click="probeCtl.onFilterReset()">
          <el-icon><RefreshLeft /></el-icon>
          <span>重置</span>
        </el-button>
      </div>
    </div>

    <!-- 卡片视图 -->
    <div v-if="densityMode === 'card'" class="zg-cardgrid">
      <article
        v-for="probe in probeCtl.pagedRows"
        :key="probe.id"
        class="zg-probecard"
        :class="probe.status === '在线' ? 'online' : 'offline'"
        @click="probeInspector.openInspector(probe)"
      >
        <div class="zg-probecard__head">
          <div class="zg-probecard__glyph">
            <el-icon :size="24"><Sunny /></el-icon>
          </div>
          <span class="zg-status" :class="probe.status === '在线' ? 'online' : 'offline'">
            <i class="dot"></i>{{ probe.status }}
          </span>
        </div>
        <div class="zg-probecard__body">
          <h3 class="zg-probecard__name">{{ probe.name }}</h3>
          <p class="zg-probecard__area">{{ probe.area }} · {{ probe.model }}</p>
          <div class="zg-probecard__stats">
            <span class="zg-probecard__stat">
              <em>{{ probe.luminance }}</em> lx
            </span>
            <span class="zg-probecard__stat">
              <em>{{ probe.sampleCount }}</em> 次
            </span>
            <span class="zg-probecard__stat">
              <em>{{ probe.precision }}</em> 精度
            </span>
          </div>
        </div>
        <div class="zg-probecard__foot">
          <span class="zg-probecard__time">{{ probe.installTime }}</span>
          <div class="zg-probecard__actions">
            <el-button link type="primary" size="small" @click.stop="onReadLuminance(probe)">
              读取亮度
            </el-button>
            <el-button link type="primary" size="small" @click.stop="onToggleProbe(probe)">
              {{ probe.status === '在线' ? '停用' : '启用' }}
            </el-button>
            <el-button link type="primary" size="small" @click.stop="probeForm.openReviser(probe)">修订</el-button>
            <el-button link type="danger" size="small" @click.stop="onRetireProbe(probe)">废止</el-button>
          </div>
        </div>
      </article>
    </div>

    <!-- 列表视图 -->
    <div v-else class="zg-tablewrap">
      <el-table :data="probeCtl.pagedRows" stripe class="zg-datatable">
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
        <el-table-column prop="luminance" label="亮度值(lx)" width="110" align="center" />
        <el-table-column prop="sampleCount" label="采集次数" width="100" align="center" />
        <el-table-column prop="precision" label="精度等级" width="90" align="center" />
        <el-table-column prop="installTime" label="投运时间" width="130" />
        <el-table-column label="处置" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="probeInspector.openInspector(row)">详情</el-button>
            <el-button type="success" size="small" @click="onReadLuminance(row)">读取亮度</el-button>
            <el-button type="warning" size="small" @click="onToggleProbe(row)">
              {{ row.status === '在线' ? '停用' : '启用' }}
            </el-button>
            <el-button type="primary" size="small" @click="probeForm.openReviser(row)">修订</el-button>
            <el-button type="danger" size="small" @click="onRetireProbe(row)">废止</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页条 -->
    <div class="zg-pagerbar">
      <el-pagination
        v-model:current-page="probeCtl.pagingCursor"
        v-model:page-size="probeCtl.pageSpan"
        :total="probeCtl.totalRows"
        :page-sizes="[10, 15, 20, 50, 100]"
        layout="prev, pager, next, jumper, ->, sizes, total"
        background
      />
    </div>

    <!-- 详情抽屉 -->
    <el-drawer
      v-model="probeInspector.drawerOpen"
      :title="'亮度传感器详情 · ' + (focusedProbe?.name || '')"
      direction="rtl"
      size="680px"
    >
      <div v-if="focusedProbe" class="zg-inspector">
        <div class="zg-inspector__head">
          <div class="zg-inspector__glyph">
            <el-icon :size="36"><Sunny /></el-icon>
          </div>
          <div class="zg-inspector__meta">
            <h2 class="zg-inspector__name">{{ focusedProbe.name }}</h2>
            <p class="zg-inspector__type">{{ focusedProbe.area }} · {{ focusedProbe.model }}</p>
            <span class="zg-status" :class="focusedProbe.status === '在线' ? 'online' : 'offline'">
              <i class="dot"></i>{{ focusedProbe.status }}
            </span>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">基本档案</h4>
          <div class="zg-inspector__grid">
            <div class="zg-inspector__cell">
              <span class="lbl">投运时间</span>
              <span class="val">{{ focusedProbe.installTime }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">运行时长</span>
              <span class="val">{{ focusedProbe.runTime }} h</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">精度等级</span>
              <span class="val">{{ focusedProbe.precision }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">备注</span>
              <span class="val">{{ focusedProbe.remark || '-' }}</span>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">实时遥测</h4>
          <div class="zg-datagrid">
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">当前亮度</div>
              <div class="zg-datacard__val">{{ focusedProbe.luminance }}<em>lx</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">采集次数</div>
              <div class="zg-datacard__val">{{ focusedProbe.sampleCount }}<em>次</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">运行时长</div>
              <div class="zg-datacard__val">{{ focusedProbe.runTime }}<em>h</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">精度等级</div>
              <div class="zg-datacard__val">{{ focusedProbe.precision }}</div>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">历史采集记录</h4>
          <el-table :data="focusedProbe.samples" size="small" border>
            <el-table-column prop="no" label="序号" width="60" align="center" />
            <el-table-column prop="time" label="采集时间" min-width="140" />
            <el-table-column label="亮度值(lx)" width="120" align="center">
              <template #default="{ row }">
                <span class="zg-luminance-value">{{ row.value }}</span>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="90" align="center">
              <template #default="{ row }">
                <span class="zg-status" :class="row.status === '正常' ? 'online' : 'idle'">
                  <i class="dot"></i>{{ row.status }}
                </span>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="zg-inspector__actions">
          <el-button size="large" @click="probeInspector.closeInspector()">关闭</el-button>
          <el-button
            type="success"
            size="large"
            @click="onReadLuminance(focusedProbe)"
          >
            读取亮度
          </el-button>
          <el-button
            type="warning"
            size="large"
            @click="onToggleProbe(focusedProbe)"
          >
            {{ focusedProbe.status === '在线' ? '停用传感器' : '启用传感器' }}
          </el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 新建/修订抽屉 -->
    <el-drawer
      v-model="probeForm.drawerOpen"
      :title="probeForm.editMode === 'compose' ? '新增亮度传感器' : '修订亮度传感器'"
      direction="rtl"
      size="560px"
    >
      <el-form :model="probeForm.draftPayload" label-width="96px" class="zg-draftform">
        <el-form-item label="所属区域" required>
          <el-select v-model="probeForm.draftPayload.area" placeholder="请选择所属区域" style="width: 100%">
            <el-option label="长沙-岳麓区" value="长沙-岳麓区" />
            <el-option label="长沙-天心区" value="长沙-天心区" />
            <el-option label="长沙-开福区" value="长沙-开福区" />
          </el-select>
        </el-form-item>
        <el-form-item label="设备名称" required>
          <el-input v-model="probeForm.draftPayload.name" placeholder="请输入设备名称" />
        </el-form-item>
        <el-form-item label="设备型号" required>
          <el-input v-model="probeForm.draftPayload.model" placeholder="请输入设备型号" />
        </el-form-item>
        <el-form-item label="亮度量程">
          <el-input-number v-model="probeForm.draftPayload.rangeMin" :min="0" :max="100000" />
          <span class="zg-draftform__unit">~</span>
          <el-input-number v-model="probeForm.draftPayload.rangeMax" :min="0" :max="100000" />
          <span class="zg-draftform__unit">lx</span>
        </el-form-item>
        <el-form-item label="精度等级">
          <el-select v-model="probeForm.draftPayload.precision" placeholder="请选择精度等级" style="width: 100%">
            <el-option label="高精度" value="高精度" />
            <el-option label="标准" value="标准" />
            <el-option label="经济型" value="经济型" />
          </el-select>
        </el-form-item>
        <el-form-item label="采样频率">
          <el-input-number v-model="probeForm.draftPayload.sampleRate" :min="1" :max="60" />
          <span class="zg-draftform__unit">分钟/次</span>
        </el-form-item>
        <el-form-item label="投运时间">
          <el-date-picker
            v-model="probeForm.draftPayload.installTime"
            type="date"
            placeholder="选择投运时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="probeForm.draftPayload.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="probeForm.onDraftDiscard()">取消</el-button>
        <el-button
          type="primary"
          :loading="probeForm.submitting"
          @click="onCommitProbeDraft"
        >
          {{ probeForm.editMode === 'compose' ? '新增' : '保存修订' }}
        </el-button>
      </template>
    </el-drawer>
  </section>
</template>

<script setup>
/**
 * 智光云枢 · 终端管理 · 亮度传感器
 * 业务域：terminalAtlas
 * 功能：城市照明亮度传感器台账与实时监测
 * @module terminalAtlas/LuminanceProbe
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
const initialProbes = [
  {
    id: 1,
    no: 1,
    area: '长沙-岳麓区',
    name: '先导路A段-亮度传感器01',
    model: 'LX-200A',
    status: '在线',
    luminance: 2350,
    sampleCount: 128,
    precision: '高精度',
    rangeMin: 0,
    rangeMax: 50000,
    sampleRate: 5,
    installTime: '2024-01-15',
    remark: '主干道监测',
    runTime: 8760,
    samples: [
      { no: 1, time: '2026-07-03 09:15:30', value: 2350, status: '正常' },
      { no: 2, time: '2026-07-03 09:10:30', value: 2280, status: '正常' },
      { no: 3, time: '2026-07-03 09:05:30', value: 2420, status: '正常' },
      { no: 4, time: '2026-07-03 09:00:30', value: 2190, status: '正常' }
    ]
  },
  {
    id: 2,
    no: 2,
    area: '长沙-岳麓区',
    name: '先导路B段-亮度传感器02',
    model: 'LX-200A',
    status: '在线',
    luminance: 2480,
    sampleCount: 96,
    precision: '高精度',
    rangeMin: 0,
    rangeMax: 50000,
    sampleRate: 10,
    installTime: '2024-02-20',
    remark: '辅路监测',
    runTime: 7200,
    samples: [
      { no: 1, time: '2026-07-03 09:16:00', value: 2480, status: '正常' },
      { no: 2, time: '2026-07-03 09:06:00', value: 2390, status: '正常' }
    ]
  },
  {
    id: 3,
    no: 3,
    area: '长沙-天心区',
    name: '芙蓉路1号-亮度传感器01',
    model: 'LX-150B',
    status: '离线',
    luminance: 0,
    sampleCount: 52,
    precision: '标准',
    rangeMin: 0,
    rangeMax: 30000,
    sampleRate: 15,
    installTime: '2024-03-10',
    remark: '待检修',
    runTime: 5000,
    samples: []
  },
  {
    id: 4,
    no: 4,
    area: '长沙-天心区',
    name: '芙蓉路2号-亮度传感器02',
    model: 'LX-150B',
    status: '在线',
    luminance: 1890,
    sampleCount: 78,
    precision: '标准',
    rangeMin: 0,
    rangeMax: 30000,
    sampleRate: 15,
    installTime: '2024-04-05',
    remark: '',
    runTime: 4500,
    samples: [
      { no: 1, time: '2026-07-03 09:14:45', value: 1890, status: '正常' }
    ]
  },
  {
    id: 5,
    no: 5,
    area: '长沙-开福区',
    name: '湘江路1号-亮度传感器01',
    model: 'LX-100C',
    status: '在线',
    luminance: 3200,
    sampleCount: 145,
    precision: '经济型',
    rangeMin: 0,
    rangeMax: 20000,
    sampleRate: 5,
    installTime: '2024-05-18',
    remark: '新建',
    runTime: 2800,
    samples: [
      { no: 1, time: '2026-07-03 09:18:20', value: 3200, status: '正常' },
      { no: 2, time: '2026-07-03 09:13:20', value: 3150, status: '正常' }
    ]
  },
  {
    id: 6,
    no: 6,
    area: '长沙-岳麓区',
    name: '先导路C段-亮度传感器03',
    model: 'LX-200A',
    status: '在线',
    luminance: 2760,
    sampleCount: 112,
    precision: '高精度',
    rangeMin: 0,
    rangeMax: 50000,
    sampleRate: 5,
    installTime: '2024-06-10',
    remark: '新扩建路段',
    runTime: 1900,
    samples: [
      { no: 1, time: '2026-07-03 09:17:15', value: 2760, status: '正常' }
    ]
  },
  {
    id: 7,
    no: 7,
    area: '长沙-天心区',
    name: '芙蓉路3号-亮度传感器03',
    model: 'LX-150B',
    status: '在线',
    luminance: 2050,
    sampleCount: 88,
    precision: '标准',
    rangeMin: 0,
    rangeMax: 30000,
    sampleRate: 10,
    installTime: '2024-07-02',
    remark: '',
    runTime: 720,
    samples: [
      { no: 1, time: '2026-07-03 09:12:45', value: 2050, status: '正常' }
    ]
  },
  {
    id: 8,
    no: 8,
    area: '长沙-开福区',
    name: '湘江路2号-亮度传感器02',
    model: 'LX-100C',
    status: '离线',
    luminance: 0,
    sampleCount: 23,
    precision: '经济型',
    rangeMin: 0,
    rangeMax: 20000,
    sampleRate: 30,
    installTime: '2024-08-15',
    remark: '故障待修',
    runTime: 360,
    samples: []
  }
]

// ---- 表格数据容器（usePresetTable） ----
const probeCtl = usePresetTable(null, {
  defaultPageSpan: 15,
  initialData: initialProbes
})

// ---- 概览指标派生 ----
const activeProbeCount = computed(
  () => probeCtl.presetPlaybook.filter(p => p.status === '在线').length
)
const offlineProbeCount = computed(
  () => probeCtl.presetPlaybook.filter(p => p.status === '离线').length
)
const totalSampleCount = computed(
  () => probeCtl.presetPlaybook.reduce((sum, p) => sum + (p.sampleCount || 0), 0)
)

// ---- 表单草稿容器（useFormDraft） ----
const probeForm = useFormDraft(
  {
    area: '',
    name: '',
    model: '',
    rangeMin: 0,
    rangeMax: 50000,
    precision: '标准',
    sampleRate: 10,
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
const probeInspector = useDrawerInspector({ size: '680px', direction: 'rtl' })
const focusedProbe = computed(() => probeInspector.focusedRecord)

/**
 * 提交草稿：根据编排/修订模式写入数据池
 * 业务流包装：新建生成设备编号，修订同步遥测字段
 */
const onCommitProbeDraft = async () => {
  const snapshot = await probeForm.onDraftCommit()
  if (!snapshot) return

  if (probeForm.editMode === 'compose') {
    // 新增：附带运行态默认值
    probeCtl.appendRecord({
      ...snapshot,
      no: probeCtl.presetPlaybook.length + 1,
      status: '在线',
      luminance: 0,
      sampleCount: 0,
      runTime: 0,
      samples: []
    })
    ElMessage.success('亮度传感器新增成功，已并入感知台账')
  } else {
    // 修订：合并更新到原记录
    const origin = probeForm.originRecord
    probeCtl.reviseRecord(origin.id, { ...snapshot })
    ElMessage.success('亮度传感器档案已更新')
  }
}

/**
 * 启用/停用传感器：在线↔离线切换，含幂等回执避免重复投切
 * @param {Object} probe 目标传感器
 */
const onToggleProbe = (probe) => {
  const nextStatus = probe.status === '在线' ? '离线' : '在线'
  ElMessageBox.confirm(
    `确认将「${probe.name}」${nextStatus === '在线' ? '启用' : '停用'}？`,
    '投切确认',
    { type: 'warning' }
  )
    .then(() => {
      probeCtl.reviseRecord(probe.id, { status: nextStatus })
      ElMessage.success(`传感器已${nextStatus === '在线' ? '启用' : '停用'}，遥测回执已签收`)
    })
    .catch(() => {})
}

/**
 * 废止传感器：二次确认后从台账中移除
 * @param {Object} probe 目标传感器
 */
const onRetireProbe = (probe) => {
  ElMessageBox.confirm(
    `确定要将「${probe.name}」从感知台账中废止吗？`,
    '废止确认',
    { type: 'warning' }
  )
    .then(() => {
      probeCtl.retireRecord(probe.id)
      ElMessage.success('传感器已废止，台账已同步')
    })
    .catch(() => {})
}

/**
 * 读取亮度值：模拟采集当前亮度并更新采集记录
 * @param {Object} probe 目标传感器
 */
const onReadLuminance = (probe) => {
  if (probe.status === '离线') {
    ElMessage.warning('传感器离线，无法读取亮度值')
    return
  }
  
  // 模拟采集亮度值（实际应调用后端接口）
  const newLuminance = Math.floor(1800 + Math.random() * 1500)
  const newSample = {
    no: (probe.samples?.length || 0) + 1,
    time: new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).replace(/\//g, '-'),
    value: newLuminance,
    status: '正常'
  }
  
  probeCtl.reviseRecord(probe.id, {
    luminance: newLuminance,
    sampleCount: (probe.sampleCount || 0) + 1,
    samples: [newSample, ...(probe.samples || [])].slice(0, 10)
  })
  
  ElMessage.success(`亮度采集成功：${newLuminance} lx`)
}
</script>

<style scoped lang="scss">
.zg-luminance {
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
    background: var(--zg-gradient-warning);
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

.zg-probecard {
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
    background: var(--zg-warning-tint-50);
    color: var(--zg-warning);
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
      color: var(--zg-warning);
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
    background: var(--zg-gradient-warning);
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
    border-left: 3px solid var(--zg-warning);
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
    color: var(--zg-warning);

    em {
      font-style: normal;
      font-size: 13px;
      color: var(--zg-ink-tertiary);
      margin-left: 4px;
      font-weight: 400;
    }
  }
}

.zg-luminance-value {
  font-weight: 600;
  color: var(--zg-warning);
}

.zg-draftform {
  &__unit {
    margin-left: 8px;
    font-size: 13px;
    color: var(--zg-ink-tertiary);
  }
}
</style>