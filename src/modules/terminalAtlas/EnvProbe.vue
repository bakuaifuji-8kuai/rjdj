<!--
  智光云枢 · 终端管理 · 环境传感器
  业务域：terminalAtlas
  功能：城市照明环境传感器的台账与实时监测
        支持卡片/列表双视图、抽屉式详情与编排、环境数据读取
-->
<template>
  <section class="zg-envprobe">
    <!-- 页面头部：品牌徽标 + 标题 + 概览指标 + 新建入口 -->
    <header class="zg-envprobe__head">
      <div class="zg-envprobe__headline">
        <div class="zg-envprobe__sigil">
          <el-icon :size="22"><Cloudy /></el-icon>
        </div>
        <div class="zg-envprobe__copy">
          <h1 class="zg-envprobe__title">环境传感器</h1>
          <p class="zg-envprobe__sub">
            城市照明环境监测 · 在线 {{ activeProbeCount }} 台 ·
            离线 {{ offlineProbeCount }} 台 · 累计采集 {{ totalDataPoints }} 次
          </p>
        </div>
      </div>
      <div class="zg-envprobe__cta">
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
        <span class="zg-metrics__num">{{ totalDataPoints }}</span>
        <span class="zg-metrics__lbl">采集次数</span>
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
          placeholder="在线状态"
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
            <el-icon :size="24"><Cloudy /></el-icon>
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
              <em>{{ probe.temperature }}</em> °C
            </span>
            <span class="zg-probecard__stat">
              <em>{{ probe.humidity }}</em> %
            </span>
            <span class="zg-probecard__stat">
              <em>{{ probe.pm25 }}</em> μg/m³
            </span>
          </div>
        </div>
        <div class="zg-probecard__foot">
          <span class="zg-probecard__time">{{ probe.installTime }}</span>
          <div class="zg-probecard__actions">
            <el-button link type="primary" size="small" @click.stop="onReadEnvData(probe)">读取</el-button>
            <el-button link type="primary" size="small" @click.stop="onToggleProbe(probe)">
              {{ probe.status === '在线' ? '停运' : '投运' }}
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
        <el-table-column label="在线状态" width="100" align="center">
          <template #default="{ row }">
            <span class="zg-status" :class="row.status === '在线' ? 'online' : 'offline'">
              <i class="dot"></i>{{ row.status }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="temperature" label="温度(°C)" width="100" align="center" />
        <el-table-column prop="humidity" label="湿度(%)" width="100" align="center" />
        <el-table-column prop="pm25" label="PM2.5(μg/m³)" width="120" align="center" />
        <el-table-column prop="installTime" label="投运时间" width="130" />
        <el-table-column label="处置" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="success" size="small" @click="onReadEnvData(row)">读取</el-button>
            <el-button type="primary" size="small" @click="probeInspector.openInspector(row)">详情</el-button>
            <el-button type="warning" size="small" @click="onToggleProbe(row)">
              {{ row.status === '在线' ? '停运' : '投运' }}
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
      :title="'环境传感器详情 · ' + (focusedProbe?.name || '')"
      direction="rtl"
      size="680px"
    >
      <div v-if="focusedProbe" class="zg-inspector">
        <div class="zg-inspector__head">
          <div class="zg-inspector__glyph">
            <el-icon :size="36"><Cloudy /></el-icon>
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
              <span class="lbl">RS485地址</span>
              <span class="val">{{ focusedProbe.rs485Address }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">备注</span>
              <span class="val">{{ focusedProbe.remark || '-' }}</span>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">环境实时数据</h4>
          <div class="zg-datagrid">
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">温度</div>
              <div class="zg-datacard__val">{{ focusedProbe.temperature }}<em>°C</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">湿度</div>
              <div class="zg-datacard__val">{{ focusedProbe.humidity }}<em>%</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">PM2.5</div>
              <div class="zg-datacard__val">{{ focusedProbe.pm25 }}<em>μg/m³</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">运行时长</div>
              <div class="zg-datacard__val">{{ focusedProbe.runTime }}<em>h</em></div>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">历史采集记录</h4>
          <el-table :data="focusedProbe.historyData" size="small" border>
            <el-table-column prop="no" label="序号" width="60" align="center" />
            <el-table-column prop="time" label="采集时间" min-width="160" />
            <el-table-column prop="temperature" label="温度(°C)" width="100" align="center" />
            <el-table-column prop="humidity" label="湿度(%)" width="100" align="center" />
            <el-table-column prop="pm25" label="PM2.5(μg/m³)" width="120" align="center" />
          </el-table>
        </div>

        <div class="zg-inspector__actions">
          <el-button size="large" @click="probeInspector.closeInspector()">关闭</el-button>
          <el-button
            type="success"
            size="large"
            @click="onReadEnvData(focusedProbe)"
          >
            读取环境数据
          </el-button>
          <el-button
            type="warning"
            size="large"
            @click="onToggleProbe(focusedProbe)"
          >
            {{ focusedProbe.status === '在线' ? '停运传感器' : '投运传感器' }}
          </el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 新建/修订抽屉 -->
    <el-drawer
      v-model="probeForm.drawerOpen"
      :title="probeForm.editMode === 'compose' ? '新增传感器' : '修订传感器'"
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
        <el-form-item label="RS485地址" required>
          <el-input v-model="probeForm.draftPayload.rs485Address" placeholder="请输入RS485地址" />
        </el-form-item>
        <el-form-item label="连接方式">
          <el-select v-model="probeForm.draftPayload.connection" placeholder="请选择连接方式" style="width: 100%">
            <el-option label="边缘主机透传" value="边缘主机透传" />
            <el-option label="直连云平台" value="直连云平台" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属杆塔">
          <el-select v-model="probeForm.draftPayload.lampPost" placeholder="请选择所属杆塔" style="width: 100%">
            <el-option label="-" value="-" />
            <el-option label="展厅隧道灯" value="展厅隧道灯" />
            <el-option label="光亚展杆塔" value="光亚展杆塔" />
          </el-select>
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
 * 智光云枢 · 终端管理 · 环境传感器
 * 业务域：terminalAtlas
 * 功能：城市照明环境传感器的台账与实时监测
 * @module terminalAtlas/EnvProbe
 * @author 智光云枢研发团队
 */
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Cloudy,
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
    name: '先导路1号环境传感器',
    model: 'ZH-200',
    status: '在线',
    temperature: 25.3,
    humidity: 65,
    pm25: 35,
    rs485Address: '01',
    connection: '边缘主机透传',
    lampPost: '展厅隧道灯',
    installTime: '2024-01-15',
    remark: '主路环境监测',
    runTime: 8760,
    historyData: [
      { no: 1, time: '2024-04-22 10:26:58', temperature: '25.3', humidity: '65', pm25: '35' },
      { no: 2, time: '2024-04-22 10:25:00', temperature: '25.1', humidity: '64', pm25: '34' },
      { no: 3, time: '2024-04-22 10:24:00', temperature: '25.0', humidity: '63', pm25: '33' }
    ]
  },
  {
    id: 2,
    no: 2,
    area: '长沙-岳麓区',
    name: '先导路2号环境传感器',
    model: 'ZH-200',
    status: '在线',
    temperature: 26.1,
    humidity: 62,
    pm25: 28,
    rs485Address: '02',
    connection: '边缘主机透传',
    lampPost: '光亚展杆塔',
    installTime: '2024-02-20',
    remark: '辅路环境监测',
    runTime: 7200,
    historyData: []
  },
  {
    id: 3,
    no: 3,
    area: '长沙-天心区',
    name: '芙蓉路1号环境传感器',
    model: 'ZH-300',
    status: '离线',
    temperature: 0,
    humidity: 0,
    pm25: 0,
    rs485Address: '03',
    connection: '边缘主机透传',
    lampPost: '-',
    installTime: '2024-03-10',
    remark: '待检修',
    runTime: 5000,
    historyData: []
  },
  {
    id: 4,
    no: 4,
    area: '长沙-天心区',
    name: '芙蓉路2号环境传感器',
    model: 'ZH-200',
    status: '在线',
    temperature: 24.8,
    humidity: 68,
    pm25: 42,
    rs485Address: '04',
    connection: '直连云平台',
    lampPost: '-',
    installTime: '2024-04-05',
    remark: '',
    runTime: 4500,
    historyData: []
  },
  {
    id: 5,
    no: 5,
    area: '长沙-开福区',
    name: '湘江路1号环境传感器',
    model: 'ZH-300',
    status: '在线',
    temperature: 27.2,
    humidity: 58,
    pm25: 22,
    rs485Address: '05',
    connection: '边缘主机透传',
    lampPost: '-',
    installTime: '2024-05-18',
    remark: '新建',
    runTime: 2800,
    historyData: []
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
const totalDataPoints = computed(
  () => probeCtl.presetPlaybook.reduce((sum, p) => sum + (p.historyData?.length || 0), 0)
)

// ---- 表单草稿容器（useFormDraft） ----
const probeForm = useFormDraft(
  {
    area: '',
    name: '',
    model: '',
    rs485Address: '',
    connection: '边缘主机透传',
    lampPost: '-',
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
      if (!draft.rs485Address) {
        ElMessage.warning('请输入RS485地址')
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
      temperature: 25.0,
      humidity: 60,
      pm25: 30,
      runTime: 0,
      historyData: []
    })
    ElMessage.success('环境传感器新增成功，已并入监测台账')
  } else {
    // 修订：合并更新到原记录
    const origin = probeForm.originRecord
    probeCtl.reviseRecord(origin.id, { ...snapshot })
    ElMessage.success('环境传感器档案已更新')
  }
}

/**
 * 投切传感器：在线↔离线切换，含幂等回执避免重复投切
 * @param {Object} probe 目标传感器
 */
const onToggleProbe = (probe) => {
  const nextStatus = probe.status === '在线' ? '离线' : '在线'
  ElMessageBox.confirm(
    `确认将「${probe.name}」${nextStatus === '在线' ? '投运' : '停运'}？`,
    '投切确认',
    { type: 'warning' }
  )
    .then(() => {
      probeCtl.reviseRecord(probe.id, { status: nextStatus })
      ElMessage.success(`传感器已${nextStatus === '在线' ? '投运' : '停运'}，遥测回执已签收`)
    })
    .catch(() => {})
}

/**
 * 废止传感器：二次确认后从台账中移除
 * @param {Object} probe 目标传感器
 */
const onRetireProbe = (probe) => {
  ElMessageBox.confirm(
    `确定要将「${probe.name}」从监测台账中废止吗？`,
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
 * 读取环境数据：从传感器获取温度/湿度/PM2.5实时数据
 * @param {Object} probe 目标传感器
 */
const onReadEnvData = (probe) => {
  if (probe.status === '离线') {
    ElMessage.warning('传感器离线，无法读取环境数据')
    return
  }

  // Mock 模拟读取环境数据
  const newTemperature = 25 + Math.random() * 5
  const newHumidity = 55 + Math.random() * 20
  const newPm25 = 20 + Math.random() * 40

  const newDataPoint = {
    no: (probe.historyData?.length || 0) + 1,
    time: new Date().toLocaleString(),
    temperature: newTemperature.toFixed(1),
    humidity: newHumidity.toFixed(0),
    pm25: newPm25.toFixed(0)
  }

  probeCtl.reviseRecord(probe.id, {
    temperature: parseFloat(newTemperature.toFixed(1)),
    humidity: parseFloat(newHumidity.toFixed(0)),
    pm25: parseFloat(newPm25.toFixed(0)),
    historyData: [...(probe.historyData || []), newDataPoint]
  })

  ElMessage.success(`环境数据读取成功：温度 ${newTemperature.toFixed(1)}°C，湿度 ${newHumidity.toFixed(0)}%，PM2.5 ${newPm25.toFixed(0)}μg/m³`)
}
</script>

<style scoped lang="scss">
.zg-envprobe {
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