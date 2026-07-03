<!--
  智光云枢 · 管廊照明 · 隧道灯管理
  业务域：tubeLumen
  功能：隧道灯台账管理与调光控制
        支持卡片/列表双视图、抽屉式详情与编排、批量导入、调光控制
-->
<template>
  <section class="zg-fixture">
    <!-- 页面头部：品牌徽标 + 标题 + 概览指标 + 操作入口 -->
    <header class="zg-fixture__head">
      <div class="zg-fixture__headline">
        <div class="zg-fixture__sigil">
          <el-icon :size="22"><Lightning /></el-icon>
        </div>
        <div class="zg-fixture__copy">
          <h1 class="zg-fixture__title">隧道灯管理</h1>
          <p class="zg-fixture__sub">
            管廊照明设施 · 在役 {{ activeFixtureCount }} 台 ·
            离线 {{ offlineFixtureCount }} 台 · 累计调光 {{ totalDimmingCount }} 次
          </p>
        </div>
      </div>
      <div class="zg-fixture__cta">
        <el-button type="primary" @click="fixtureForm.openComposer()">
          <el-icon><Plus /></el-icon>
          <span>新增隧道灯</span>
        </el-button>
        <el-button type="primary" @click="importDrawerOpen = true">
          <el-icon><Upload /></el-icon>
          <span>批量导入</span>
        </el-button>
        <el-button
          type="danger"
          :disabled="selectedFixtureIds.length === 0"
          @click="onBatchRetire"
        >
          <span>批量删除</span>
        </el-button>
      </div>
    </header>

    <!-- 概览指标卡 -->
    <div class="zg-metrics">
      <div class="zg-metrics__cell">
        <span class="zg-metrics__num">{{ fixtureCtl.totalRows }}</span>
        <span class="zg-metrics__lbl">隧道灯总数</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--ok">
        <span class="zg-metrics__num">{{ activeFixtureCount }}</span>
        <span class="zg-metrics__lbl">在线运行</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--warn">
        <span class="zg-metrics__num">{{ offlineFixtureCount }}</span>
        <span class="zg-metrics__lbl">离线待检</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--info">
        <span class="zg-metrics__num">{{ totalDimmingCount }}</span>
        <span class="zg-metrics__lbl">累计调光</span>
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
          v-model="fixtureCtl.typeBucket"
          placeholder="所属产品"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="PLC灯控" value="PLC灯控" />
          <el-option label="隧道485灯控" value="隧道485灯控" />
        </el-select>
        <el-select
          v-model="fixtureCtl.statusBuckets"
          placeholder="网络状态"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="在线" value="在线" />
          <el-option label="离线" value="离线" />
        </el-select>
        <el-input
          v-model="fixtureCtl.filterLexicon"
          placeholder="检索IMEI号/灯控名称"
          clearable
          class="zg-filterband__search"
          @keyup.enter="fixtureCtl.onFilterApply()"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="fixtureCtl.onFilterApply()">
          <el-icon><Search /></el-icon>
          <span>检索</span>
        </el-button>
        <el-button @click="fixtureCtl.onFilterReset()">
          <el-icon><RefreshLeft /></el-icon>
          <span>重置</span>
        </el-button>
      </div>
    </div>

    <!-- 卡片视图 -->
    <div v-if="densityMode === 'card'" class="zg-cardgrid">
      <article
        v-for="fixture in fixtureCtl.pagedRows"
        :key="fixture.id"
        class="zg-fixturecard"
        :class="fixture.status === '在线' ? 'online' : 'offline'"
        @click="fixtureInspector.openInspector(fixture)"
      >
        <div class="zg-fixturecard__head">
          <div class="zg-fixturecard__glyph">
            <el-icon :size="24"><Lightning /></el-icon>
          </div>
          <span class="zg-status" :class="fixture.status === '在线' ? 'online' : 'offline'">
            <i class="dot"></i>{{ fixture.status }}
          </span>
        </div>
        <div class="zg-fixturecard__body">
          <h3 class="zg-fixturecard__name">{{ fixture.controllerName }}</h3>
          <p class="zg-fixturecard__meta">{{ fixture.product }} · {{ fixture.imei }}</p>
          <div class="zg-fixturecard__stats">
            <span class="zg-fixturecard__stat">
              <em>{{ fixture.brightness }}</em> %
            </span>
            <span class="zg-fixturecard__stat">
              <em>{{ fixture.lastOnline }}</em>
            </span>
          </div>
        </div>
        <div class="zg-fixturecard__foot">
          <div class="zg-fixturecard__slider">
            <el-slider
              v-model="fixture.brightness"
              :min="0"
              :max="100"
              :disabled="fixture.status === '离线'"
              class="zg-fixturecard__slider-input"
              @change="onDimming(fixture)"
            />
          </div>
          <div class="zg-fixturecard__actions">
            <el-button link type="primary" size="small" @click.stop="fixtureForm.openReviser(fixture)">修订</el-button>
            <el-button link type="danger" size="small" @click.stop="onRetireFixture(fixture)">删除</el-button>
          </div>
        </div>
      </article>
    </div>

    <!-- 列表视图 -->
    <div v-else class="zg-tablewrap">
      <el-table
        :data="fixtureCtl.pagedRows"
        stripe
        class="zg-datatable"
        @selection-change="onSelectionChange"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="No" width="60" align="center" />
        <el-table-column prop="product" label="所属产品" width="140" />
        <el-table-column prop="imei" label="IMEI号" width="140" />
        <el-table-column prop="controllerName" label="灯控名称" min-width="150" />
        <el-table-column label="亮度(%)" width="180" align="center">
          <template #default="{ row }">
            <el-slider
              v-model="row.brightness"
              :min="0"
              :max="100"
              :disabled="row.status === '离线'"
              style="width: 120px;"
              @change="onDimming(row)"
            />
            <span style="margin-left: 8px;">{{ row.brightness }}%</span>
          </template>
        </el-table-column>
        <el-table-column label="网络状态" width="100" align="center">
          <template #default="{ row }">
            <span class="zg-status" :class="row.status === '在线' ? 'online' : 'offline'">
              <i class="dot"></i>{{ row.status }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="lastOnline" label="最后在线时间" width="180" />
        <el-table-column label="处置" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="fixtureInspector.openInspector(row)">详情</el-button>
            <el-button type="primary" size="small" @click="fixtureForm.openReviser(row)">修订</el-button>
            <el-button type="danger" size="small" @click="onRetireFixture(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页条 -->
    <div class="zg-pagerbar">
      <el-pagination
        v-model:current-page="fixtureCtl.pagingCursor"
        v-model:page-size="fixtureCtl.pageSpan"
        :total="fixtureCtl.totalRows"
        :page-sizes="[10, 15, 20, 50, 100]"
        layout="prev, pager, next, jumper, ->, sizes, total"
        background
      />
    </div>

    <!-- 详情抽屉 -->
    <el-drawer
      v-model="fixtureInspector.drawerOpen"
      :title="'隧道灯详情 · ' + (focusedFixture?.controllerName || '')"
      direction="rtl"
      size="680px"
    >
      <div v-if="focusedFixture" class="zg-inspector">
        <div class="zg-inspector__head">
          <div class="zg-inspector__glyph">
            <el-icon :size="36"><Lightning /></el-icon>
          </div>
          <div class="zg-inspector__meta">
            <h2 class="zg-inspector__name">{{ focusedFixture.controllerName }}</h2>
            <p class="zg-inspector__type">{{ focusedFixture.product }} · {{ focusedFixture.imei }}</p>
            <span class="zg-status" :class="focusedFixture.status === '在线' ? 'online' : 'offline'">
              <i class="dot"></i>{{ focusedFixture.status }}
            </span>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">基本档案</h4>
          <div class="zg-inspector__grid">
            <div class="zg-inspector__cell">
              <span class="lbl">所属产品</span>
              <span class="val">{{ focusedFixture.product }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">IMEI号</span>
              <span class="val">{{ focusedFixture.imei }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">当前亮度</span>
              <span class="val">{{ focusedFixture.brightness }}%</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">最后在线</span>
              <span class="val">{{ focusedFixture.lastOnline }}</span>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">实时遥测</h4>
          <div class="zg-datagrid">
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">电压</div>
              <div class="zg-datacard__val">{{ focusedFixture.voltage || '-' }}<em>V</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">能耗</div>
              <div class="zg-datacard__val">{{ focusedFixture.energy || '-' }}<em>kWh</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">温度</div>
              <div class="zg-datacard__val">{{ focusedFixture.temperature || '-' }}<em>℃</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">调光类型</div>
              <div class="zg-datacard__val">{{ focusedFixture.dimmingType || '正向' }}<em>-</em></div>
            </div>
          </div>
        </div>

        <div class="zg-inspector__actions">
          <el-button size="large" @click="fixtureInspector.closeInspector()">关闭</el-button>
          <el-button
            type="primary"
            size="large"
            @click="fixtureForm.openReviser(focusedFixture)"
          >
            修订档案
          </el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 新建/修订抽屉 -->
    <el-drawer
      v-model="fixtureForm.drawerOpen"
      :title="fixtureForm.editMode === 'compose' ? '登记隧道灯' : '修订隧道灯'"
      direction="rtl"
      size="560px"
    >
      <el-form :model="fixtureForm.draftPayload" label-width="96px" class="zg-draftform">
        <el-form-item label="所属产品" required>
          <el-select v-model="fixtureForm.draftPayload.product" placeholder="请选择所属产品" style="width: 100%">
            <el-option label="PLC灯控" value="PLC灯控" />
            <el-option label="隧道485灯控" value="隧道485灯控" />
          </el-select>
        </el-form-item>
        <el-form-item label="IMEI号" required>
          <el-input v-model="fixtureForm.draftPayload.imei" placeholder="请输入灯控IMEI" />
        </el-form-item>
        <el-form-item label="灯控名称" required>
          <el-input v-model="fixtureForm.draftPayload.controllerName" placeholder="请输入灯控名称" />
        </el-form-item>
        <el-form-item label="初始亮度">
          <el-input-number v-model="fixtureForm.draftPayload.brightness" :min="0" :max="100" />
          <span class="zg-draftform__unit">%</span>
        </el-form-item>
        <el-form-item label="调光类型">
          <el-radio-group v-model="fixtureForm.draftPayload.dimmingType">
            <el-radio label="正向" value="正向" />
            <el-radio label="逆向" value="逆向" />
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="fixtureForm.draftPayload.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="fixtureForm.onDraftDiscard()">取消</el-button>
        <el-button
          type="primary"
          :loading="fixtureForm.submitting"
          @click="onCommitFixtureDraft"
        >
          {{ fixtureForm.editMode === 'compose' ? '登记' : '保存修订' }}
        </el-button>
      </template>
    </el-drawer>

    <!-- 批量导入抽屉 -->
    <el-drawer
      v-model="importDrawerOpen"
      title="批量导入隧道灯"
      direction="rtl"
      size="560px"
    >
      <el-form :model="importDraft" label-width="100px" class="zg-draftform">
        <el-form-item label="选择文件">
          <el-upload
            class="upload-demo"
            action="#"
            :auto-upload="false"
            :on-change="onImportFileChange"
            :file-list="importDraft.fileList"
            accept=".xlsx,.xls,.csv"
          >
            <el-button type="primary">
              <el-icon><Upload /></el-icon>
              <span>点击上传</span>
            </el-button>
            <div slot="tip" class="el-upload__tip">
              请上传Excel文件(.xlsx/.xls)或CSV文件(.csv)
            </div>
          </el-upload>
        </el-form-item>
        <el-form-item label="导入模式">
          <el-radio-group v-model="importDraft.mode">
            <el-radio label="新增" value="add">新增</el-radio>
            <el-radio label="覆盖" value="overwrite">覆盖</el-radio>
            <el-radio label="跳过重复" value="skip">跳过重复</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <span class="import-tip">
            <strong>模板说明：</strong><br/>
            1. 文件格式：Excel(.xlsx/.xls)或CSV(.csv)<br/>
            2. 必填字段：IMEI号、灯控名称<br/>
            3. 可选字段：所属产品、亮度、所属层级<br/>
            4. 点击下载模板获取导入格式
          </span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="onDownloadImportTemplate">
          <el-icon><Download /></el-icon>
          <span>下载模板</span>
        </el-button>
        <el-button @click="importDrawerOpen = false">取消</el-button>
        <el-button type="primary" @click="onBatchImport">开始导入</el-button>
      </template>
    </el-drawer>
  </section>
</template>

<script setup>
/**
 * 智光云枢 · 管廊照明 · 隧道灯管理
 * 业务域：tubeLumen
 * 功能：隧道灯台账管理与调光控制，支持卡片/列表双视图、批量导入、调光控制
 * @module tubeLumen/FixtureLedger
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
  RefreshLeft,
  Upload,
  Download
} from '@element-plus/icons-vue'
import { usePresetTable } from '@/shared/composables/usePresetTable'
import { useFormDraft } from '@/shared/composables/useFormDraft'
import { useDrawerInspector } from '@/shared/composables/useDrawerInspector'

// ---- 视图密度切换 ----
const densityMode = ref('card')

// ---- 初始 mock 数据池 ----
const initialFixtures = [
  {
    id: 1,
    product: 'PLC灯控',
    imei: '1C1334124028',
    controllerName: '线性隧道灯',
    brightness: 20,
    status: '在线',
    lastOnline: '2026-04-28 17:00:47',
    voltage: '232.8',
    energy: '0',
    temperature: '33',
    dimmingType: '正向',
    remark: ''
  },
  {
    id: 2,
    product: 'PLC灯控',
    imei: '1C1334124028',
    controllerName: '线性隧道灯',
    brightness: 20,
    status: '在线',
    lastOnline: '2026-04-28 13:37:40',
    voltage: '230.5',
    energy: '0',
    temperature: '31',
    dimmingType: '正向',
    remark: ''
  },
  {
    id: 3,
    product: '隧道485灯控',
    imei: '1C133413190B',
    controllerName: '高速隧道灯',
    brightness: 100,
    status: '在线',
    lastOnline: '2026-04-28 13:37:40',
    voltage: '228.3',
    energy: '0',
    temperature: '29',
    dimmingType: '正向',
    remark: ''
  }
]

// ---- 表格数据容器（usePresetTable） ----
const fixtureCtl = usePresetTable(null, {
  defaultPageSpan: 15,
  initialData: initialFixtures
})

// ---- 概览指标派生 ----
const activeFixtureCount = computed(
  () => fixtureCtl.presetPlaybook.filter(f => f.status === '在线').length
)
const offlineFixtureCount = computed(
  () => fixtureCtl.presetPlaybook.filter(f => f.status === '离线').length
)
const totalDimmingCount = ref(0)

// ---- 表单草稿容器（useFormDraft） ----
const fixtureForm = useFormDraft(
  {
    product: '',
    imei: '',
    controllerName: '',
    brightness: 50,
    dimmingType: '正向',
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
      if (!draft.controllerName) {
        ElMessage.warning('请输入灯控名称')
        return false
      }
      return true
    }
  }
)

// ---- 详情抽屉容器（useDrawerInspector） ----
const fixtureInspector = useDrawerInspector({ size: '680px', direction: 'rtl' })
const focusedFixture = computed(() => fixtureInspector.focusedRecord)

// ---- 多选状态 ----
const selectedFixtureIds = ref([])

/**
 * 多选变更：同步选中 ID 列表
 * @param {Array} val 选中的行数据
 */
const onSelectionChange = (val) => {
  selectedFixtureIds.value = val.map(item => item.id)
}

/**
 * 提交草稿：根据编排/修订模式写入数据池
 * 业务流包装：新建生成设备编号，修订同步调光字段
 */
const onCommitFixtureDraft = async () => {
  const snapshot = await fixtureForm.onDraftCommit()
  if (!snapshot) return

  if (fixtureForm.editMode === 'compose') {
    fixtureCtl.appendRecord({
      ...snapshot,
      status: '在线',
      lastOnline: new Date().toLocaleString(),
      voltage: '-',
      energy: '-',
      temperature: '-'
    })
    ElMessage.success('隧道灯登记成功，已并入照明台账')
  } else {
    const origin = fixtureForm.originRecord
    fixtureCtl.reviseRecord(origin.id, { ...snapshot })
    ElMessage.success('隧道灯档案已更新')
  }
}

/**
 * 调光控制：更新亮度值并累计调光次数
 * @param {Object} fixture 目标隧道灯
 */
const onDimming = (fixture) => {
  if (fixture.status === '离线') {
    ElMessage.warning('离线设备无法调光')
    return
  }
  fixtureCtl.reviseRecord(fixture.id, { brightness: fixture.brightness })
  totalDimmingCount.value++
  ElMessage.success(`已将「${fixture.controllerName}」亮度调整为 ${fixture.brightness}%`)
}

/**
 * 删除隧道灯：二次确认后从台账中移除
 * @param {Object} fixture 目标隧道灯
 */
const onRetireFixture = (fixture) => {
  ElMessageBox.confirm(
    `确定要将「${fixture.controllerName}」从照明台账中删除吗？`,
    '删除确认',
    { type: 'warning' }
  )
    .then(() => {
      fixtureCtl.retireRecord(fixture.id)
      ElMessage.success('隧道灯已删除，台账已同步')
    })
    .catch(() => {})
}

/**
 * 批量删除：二次确认后移除所有选中的隧道灯
 */
const onBatchRetire = () => {
  if (selectedFixtureIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的隧道灯')
    return
  }
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedFixtureIds.value.length} 个隧道灯吗？`,
    '批量删除确认',
    { type: 'warning' }
  )
    .then(() => {
      selectedFixtureIds.value.forEach(id => {
        fixtureCtl.retireRecord(id)
      })
      selectedFixtureIds.value = []
      ElMessage.success('批量删除成功')
    })
    .catch(() => {})
}

// ---- 批量导入 ----
const importDrawerOpen = ref(false)
const importDraft = ref({
  fileList: [],
  mode: 'add'
})

/**
 * 导入文件变更：同步文件列表
 * @param {File} file 选中的文件
 * @param {Array} fileList 文件列表
 */
const onImportFileChange = (file, fileList) => {
  importDraft.value.fileList = fileList
}

/**
 * 下载导入模板：生成 CSV 模板文件供用户下载
 */
const onDownloadImportTemplate = () => {
  const templateContent = `所属产品,IMEI号,灯控名称,亮度(%),所属层级
PLC灯控,1C1334124028,线性隧道灯,50,长沙-岳麓区-先导路
隧道485灯控,1C133413190B,高速隧道灯,100,长沙-岳麓区-先导路`

  const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', '隧道灯导入模板.csv')
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  ElMessage.success('模板下载成功')
}

/**
 * 执行批量导入：根据导入模式处理数据
 */
const onBatchImport = () => {
  if (importDraft.value.fileList.length === 0) {
    ElMessage.warning('请先选择要导入的文件')
    return
  }

  const mockData = [
    {
      id: Date.now(),
      product: 'PLC灯控',
      imei: 'IMPORT001',
      controllerName: '批量导入灯1',
      brightness: 50,
      status: '在线',
      lastOnline: new Date().toLocaleString(),
      voltage: '-',
      energy: '-',
      temperature: '-',
      dimmingType: '正向',
      remark: '批量导入'
    },
    {
      id: Date.now() + 1,
      product: 'PLC灯控',
      imei: 'IMPORT002',
      controllerName: '批量导入灯2',
      brightness: 75,
      status: '在线',
      lastOnline: new Date().toLocaleString(),
      voltage: '-',
      energy: '-',
      temperature: '-',
      dimmingType: '正向',
      remark: '批量导入'
    },
    {
      id: Date.now() + 2,
      product: '隧道485灯控',
      imei: 'IMPORT003',
      controllerName: '批量导入灯3',
      brightness: 100,
      status: '在线',
      lastOnline: new Date().toLocaleString(),
      voltage: '-',
      energy: '-',
      temperature: '-',
      dimmingType: '正向',
      remark: '批量导入'
    }
  ]

  if (importDraft.value.mode === 'add') {
    mockData.forEach(item => {
      fixtureCtl.appendRecord(item)
    })
  } else if (importDraft.value.mode === 'overwrite') {
    fixtureCtl.presetPlaybook = mockData
  }

  ElMessage.success(`成功导入 ${mockData.length} 条记录`)
  importDrawerOpen.value = false
  importDraft.value.fileList = []
}
</script>

<style scoped lang="scss">
.zg-fixture {
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
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.zg-fixturecard {
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

  &__meta {
    font-size: 12px;
    color: var(--zg-ink-tertiary);
    margin: 0;
  }

  &__stats {
    display: flex;
    flex-wrap: wrap;
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
    flex-direction: column;
    gap: 10px;
    padding-top: 10px;
    border-top: 1px dashed var(--zg-line-soft);
  }

  &__slider {
    width: 100%;
  }

  &__slider-input {
    width: 100%;
  }

  &__actions {
    display: flex;
    gap: 4px;
    justify-content: flex-end;
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

.import-tip {
  color: var(--zg-ink-tertiary);
  font-size: 13px;
  line-height: 1.8;
}
</style>