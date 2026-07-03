<!--
  智光云枢 · 终端图谱 · 烟雾传感器
  业务域：terminalAtlas
  功能：城市照明终端烟雾监测设备的台账与状态管控
        支持卡片/列表双视图、抽屉式详情与编排、状态读取回执
-->
<template>
  <section class="zg-smokeprobe">
    <!-- 页面头部：品牌徽标 + 标题 + 概览指标 + 新建入口 -->
    <header class="zg-smokeprobe__head">
      <div class="zg-smokeprobe__headline">
        <div class="zg-smokeprobe__sigil">
          <el-icon :size="22"><Warning /></el-icon>
        </div>
        <div class="zg-smokeprobe__copy">
          <h1 class="zg-smokeprobe__title">烟雾传感器</h1>
          <p class="zg-smokeprobe__sub">
            终端图谱监测节点 · 正常 {{ normalProbeCount }} 台 ·
            异常 {{ abnormalProbeCount }} 台 · 在线 {{ activeProbeCount }} 台
          </p>
        </div>
      </div>
      <div class="zg-smokeprobe__cta">
        <el-button type="primary" @click="probeForm.openComposer()">
          <el-icon><Plus /></el-icon>
          <span>登记传感器</span>
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
        <span class="zg-metrics__num">{{ normalProbeCount }}</span>
        <span class="zg-metrics__lbl">烟雾正常</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--warn">
        <span class="zg-metrics__num">{{ abnormalProbeCount }}</span>
        <span class="zg-metrics__lbl">烟雾异常</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--info">
        <span class="zg-metrics__num">{{ activeProbeCount }}</span>
        <span class="zg-metrics__lbl">在线运行</span>
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
          placeholder="烟雾状态"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="正常" value="正常" />
          <el-option label="异常" value="异常" />
        </el-select>
        <el-select
          v-model="probeCtl.typeBucket"
          placeholder="在线状态"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="在线" value="在线" />
          <el-option label="离线" value="离线" />
        </el-select>
        <el-input
          v-model="probeCtl.filterLexicon"
          placeholder="检索设备名称/位置"
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
        :class="probe.smokeStatus === '正常' ? 'normal' : 'abnormal'"
        @click="probeInspector.openInspector(probe)"
      >
        <div class="zg-probecard__head">
          <div class="zg-probecard__glyph">
            <el-icon :size="24"><Warning /></el-icon>
          </div>
          <span class="zg-status" :class="probe.smokeStatus === '正常' ? 'normal' : 'abnormal'">
            <i class="dot"></i>{{ probe.smokeStatus }}
          </span>
        </div>
        <div class="zg-probecard__body">
          <h3 class="zg-probecard__name">{{ probe.name }}</h3>
          <p class="zg-probecard__location">{{ probe.location }}</p>
          <div class="zg-probecard__stats">
            <span class="zg-probecard__stat">
              <em>{{ probe.sensitivity }}</em> %
            </span>
            <span class="zg-probecard__stat">
              <em>{{ probe.battery }}</em> %
            </span>
            <span class="zg-probecard__stat">
              <em>{{ probe.concentration }}</em> ppm
            </span>
          </div>
        </div>
        <div class="zg-probecard__foot">
          <span class="zg-probecard__time">{{ probe.updateTime }}</span>
          <div class="zg-probecard__actions">
            <el-button link type="primary" size="small" @click.stop="onReadSmokeStatus(probe)">
              读状态
            </el-button>
            <el-button link type="primary" size="small" @click.stop="onToggleProbe(probe)">
              {{ probe.onlineStatus === '在线' ? '停运' : '投运' }}
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
        <el-table-column prop="location" label="安装位置" width="160" />
        <el-table-column prop="name" label="设备名称" min-width="150" />
        <el-table-column label="烟雾状态" width="100" align="center">
          <template #default="{ row }">
            <span class="zg-status" :class="row.smokeStatus === '正常' ? 'normal' : 'abnormal'">
              <i class="dot"></i>{{ row.smokeStatus }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="在线状态" width="100" align="center">
          <template #default="{ row }">
            <span class="zg-status" :class="row.onlineStatus === '在线' ? 'online' : 'offline'">
              <i class="dot"></i>{{ row.onlineStatus }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="sensitivity" label="灵敏度(%)" width="100" align="center" />
        <el-table-column prop="battery" label="电量(%)" width="100" align="center" />
        <el-table-column prop="concentration" label="浓度(ppm)" width="100" align="center" />
        <el-table-column prop="updateTime" label="更新时间" width="150" />
        <el-table-column label="处置" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="success" size="small" @click="onReadSmokeStatus(row)">读状态</el-button>
            <el-button type="warning" size="small" @click="onToggleProbe(row)">
              {{ row.onlineStatus === '在线' ? '停运' : '投运' }}
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
      :title="'烟雾传感器详情 · ' + (focusedProbe?.name || '')"
      direction="rtl"
      size="680px"
    >
      <div v-if="focusedProbe" class="zg-inspector">
        <div class="zg-inspector__head">
          <div class="zg-inspector__glyph">
            <el-icon :size="36"><Warning /></el-icon>
          </div>
          <div class="zg-inspector__meta">
            <h2 class="zg-inspector__name">{{ focusedProbe.name }}</h2>
            <p class="zg-inspector__type">{{ focusedProbe.location }}</p>
            <span class="zg-status" :class="focusedProbe.smokeStatus === '正常' ? 'normal' : 'abnormal'">
              <i class="dot"></i>{{ focusedProbe.smokeStatus }}
            </span>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">基本档案</h4>
          <div class="zg-inspector__grid">
            <div class="zg-inspector__cell">
              <span class="lbl">设备编号</span>
              <span class="val">{{ focusedProbe.id }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">在线状态</span>
              <span class="val">{{ focusedProbe.onlineStatus }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">安装时间</span>
              <span class="val">{{ focusedProbe.installTime }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">更新时间</span>
              <span class="val">{{ focusedProbe.updateTime }}</span>
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
              <div class="zg-datacard__lbl">烟雾浓度</div>
              <div class="zg-datacard__val">{{ focusedProbe.concentration }}<em>ppm</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">灵敏度</div>
              <div class="zg-datacard__val">{{ focusedProbe.sensitivity }}<em>%</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">电池电量</div>
              <div class="zg-datacard__val">{{ focusedProbe.battery }}<em>%</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">运行时长</div>
              <div class="zg-datacard__val">{{ focusedProbe.runTime }}<em>h</em></div>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">告警记录</h4>
          <el-table :data="focusedProbe.alarms" size="small" border>
            <el-table-column prop="no" label="序号" width="60" align="center" />
            <el-table-column prop="time" label="告警时间" min-width="150" />
            <el-table-column label="告警类型" width="120" align="center">
              <template #default="{ row }">
                <span class="zg-status" :class="row.level === '高' ? 'abnormal' : 'warn'">
                  <i class="dot"></i>{{ row.type }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="concentration" label="浓度值(ppm)" width="110" align="center" />
            <el-table-column prop="level" label="级别" width="80" align="center" />
          </el-table>
        </div>

        <div class="zg-inspector__actions">
          <el-button size="large" @click="probeInspector.closeInspector()">关闭</el-button>
          <el-button
            type="success"
            size="large"
            @click="onReadSmokeStatus(focusedProbe)"
          >
            读取烟雾状态
          </el-button>
          <el-button
            type="warning"
            size="large"
            @click="onToggleProbe(focusedProbe)"
          >
            {{ focusedProbe.onlineStatus === '在线' ? '停运传感器' : '投运传感器' }}
          </el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 新建/修订抽屉 -->
    <el-drawer
      v-model="probeForm.drawerOpen"
      :title="probeForm.editMode === 'compose' ? '登记烟雾传感器' : '修订烟雾传感器'"
      direction="rtl"
      size="560px"
    >
      <el-form :model="probeForm.draftPayload" label-width="96px" class="zg-draftform">
        <el-form-item label="安装位置" required>
          <el-select v-model="probeForm.draftPayload.location" placeholder="请选择安装位置" style="width: 100%">
            <el-option label="长沙-岳麓区-先导路" value="长沙-岳麓区-先导路" />
            <el-option label="长沙-岳麓区-力唯中天1栋" value="长沙-岳麓区-力唯中天1栋" />
            <el-option label="长沙-岳麓区-麓谷大道" value="长沙-岳麓区-麓谷大道" />
            <el-option label="长沙-天心区-芙蓉路" value="长沙-天心区-芙蓉路" />
            <el-option label="长沙-开福区-湘江路" value="长沙-开福区-湘江路" />
          </el-select>
        </el-form-item>
        <el-form-item label="设备名称" required>
          <el-input v-model="probeForm.draftPayload.name" placeholder="请输入设备名称" />
        </el-form-item>
        <el-form-item label="灵敏度">
          <el-input-number v-model="probeForm.draftPayload.sensitivity" :min="0" :max="100" />
          <span class="zg-draftform__unit">%</span>
        </el-form-item>
        <el-form-item label="初始电量">
          <el-input-number v-model="probeForm.draftPayload.battery" :min="0" :max="100" />
          <span class="zg-draftform__unit">%</span>
        </el-form-item>
        <el-form-item label="告警阈值">
          <el-input-number v-model="probeForm.draftPayload.threshold" :min="0" :max="1000" />
          <span class="zg-draftform__unit">ppm</span>
        </el-form-item>
        <el-form-item label="安装时间">
          <el-date-picker
            v-model="probeForm.draftPayload.installTime"
            type="date"
            placeholder="选择安装时间"
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
          {{ probeForm.editMode === 'compose' ? '登记' : '保存修订' }}
        </el-button>
      </template>
    </el-drawer>
  </section>
</template>

<script setup>
/**
 * 智光云枢 · 终端图谱 · 烟雾传感器
 * 业务域：terminalAtlas
 * 功能：城市照明终端烟雾监测设备的台账与状态管控
 * @module terminalAtlas/SmokeProbe
 * @author 智光云枢研发团队
 */
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Warning,
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
    location: '长沙-岳麓区-先导路',
    name: '先导路A段-烟雾01',
    smokeStatus: '正常',
    onlineStatus: '在线',
    sensitivity: 85,
    battery: 92,
    concentration: 12,
    threshold: 50,
    installTime: '2024-01-15',
    updateTime: '2026-05-22 09:15:30',
    remark: '主路监测点',
    runTime: 12000,
    alarms: [
      { no: 1, time: '2026-05-20 14:30:00', type: '烟雾告警', concentration: 68, level: '高' },
      { no: 2, time: '2026-04-15 08:20:00', type: '低电量', concentration: 15, level: '低' }
    ]
  },
  {
    id: 2,
    no: 2,
    location: '长沙-岳麓区-先导路',
    name: '先导路B段-烟雾02',
    smokeStatus: '正常',
    onlineStatus: '在线',
    sensitivity: 88,
    battery: 78,
    concentration: 18,
    threshold: 50,
    installTime: '2024-02-20',
    updateTime: '2026-05-22 09:16:00',
    remark: '辅路监测点',
    runTime: 10000,
    alarms: []
  },
  {
    id: 3,
    no: 3,
    location: '长沙-岳麓区-力唯中天1栋',
    name: '力唯中天1栋-烟雾01',
    smokeStatus: '异常',
    onlineStatus: '在线',
    sensitivity: 92,
    battery: 65,
    concentration: 85,
    threshold: 50,
    installTime: '2024-03-10',
    updateTime: '2026-05-22 09:14:45',
    remark: '楼宇监测',
    runTime: 8500,
    alarms: [
      { no: 1, time: '2026-05-22 09:14:45', type: '烟雾告警', concentration: 85, level: '高' }
    ]
  },
  {
    id: 4,
    no: 4,
    location: '长沙-岳麓区-麓谷大道',
    name: '麓谷大道-烟雾01',
    smokeStatus: '正常',
    onlineStatus: '离线',
    sensitivity: 80,
    battery: 45,
    concentration: 0,
    threshold: 50,
    installTime: '2024-04-05',
    updateTime: '2026-05-20 16:30:00',
    remark: '待检修',
    runTime: 6000,
    alarms: []
  },
  {
    id: 5,
    no: 5,
    location: '长沙-天心区-芙蓉路',
    name: '芙蓉路-烟雾01',
    smokeStatus: '正常',
    onlineStatus: '在线',
    sensitivity: 90,
    battery: 88,
    concentration: 22,
    threshold: 50,
    installTime: '2024-05-18',
    updateTime: '2026-05-22 10:05:12',
    remark: '新建监测点',
    runTime: 4500,
    alarms: []
  },
  {
    id: 6,
    no: 6,
    location: '长沙-开福区-湘江路',
    name: '湘江路-烟雾01',
    smokeStatus: '正常',
    onlineStatus: '在线',
    sensitivity: 87,
    battery: 95,
    concentration: 15,
    threshold: 50,
    installTime: '2024-06-10',
    updateTime: '2026-05-22 08:45:20',
    remark: '',
    runTime: 3200,
    alarms: []
  }
]

// ---- 表格数据容器（usePresetTable） ----
const probeCtl = usePresetTable(null, {
  defaultPageSpan: 15,
  initialData: initialProbes
})

// ---- 概览指标派生 ----
const normalProbeCount = computed(
  () => probeCtl.presetPlaybook.filter(p => p.smokeStatus === '正常').length
)
const abnormalProbeCount = computed(
  () => probeCtl.presetPlaybook.filter(p => p.smokeStatus === '异常').length
)
const activeProbeCount = computed(
  () => probeCtl.presetPlaybook.filter(p => p.onlineStatus === '在线').length
)

// ---- 表单草稿容器（useFormDraft） ----
const probeForm = useFormDraft(
  {
    location: '',
    name: '',
    sensitivity: 85,
    battery: 100,
    threshold: 50,
    installTime: '',
    remark: ''
  },
  {
    validateFn: (draft) => {
      if (!draft.location) {
        ElMessage.warning('请选择安装位置')
        return false
      }
      if (!draft.name) {
        ElMessage.warning('请输入设备名称')
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
    // 登记：附带运行态默认值
    probeCtl.appendRecord({
      ...snapshot,
      no: probeCtl.presetPlaybook.length + 1,
      smokeStatus: '正常',
      onlineStatus: '在线',
      concentration: 0,
      runTime: 0,
      updateTime: new Date().toLocaleString(),
      alarms: []
    })
    ElMessage.success('烟雾传感器登记成功，已并入监测台账')
  } else {
    // 修订：合并更新到原记录
    const origin = probeForm.originRecord
    probeCtl.reviseRecord(origin.id, {
      ...snapshot,
      updateTime: new Date().toLocaleString()
    })
    ElMessage.success('烟雾传感器档案已更新')
  }
}

/**
 * 投切传感器：在线↔离线切换，含幂等回执避免重复投切
 * @param {Object} probe 目标烟雾传感器
 */
const onToggleProbe = (probe) => {
  const nextStatus = probe.onlineStatus === '在线' ? '离线' : '在线'
  ElMessageBox.confirm(
    `确认将「${probe.name}」${nextStatus === '在线' ? '投运' : '停运'}？`,
    '投切确认',
    { type: 'warning' }
  )
    .then(() => {
      probeCtl.reviseRecord(probe.id, {
        onlineStatus: nextStatus,
        updateTime: new Date().toLocaleString()
      })
      ElMessage.success(`传感器已${nextStatus === '在线' ? '投运' : '停运'}，状态回执已签收`)
    })
    .catch(() => {})
}

/**
 * 废止传感器：二次确认后从台账中移除
 * @param {Object} probe 目标烟雾传感器
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
 * 读取烟雾状态：模拟遥测数据读取并更新浓度值
 * @param {Object} probe 目标烟雾传感器
 */
const onReadSmokeStatus = (probe) => {
  ElMessageBox.confirm(
    `确认读取「${probe.name}」的实时烟雾状态？`,
    '状态读取',
    { type: 'info' }
  )
    .then(() => {
      // 模拟遥测数据读取
      const newConcentration = Math.floor(Math.random() * 100)
      const newSmokeStatus = newConcentration > probe.threshold ? '异常' : '正常'
      const newBattery = Math.max(0, probe.battery - 1)

      probeCtl.reviseRecord(probe.id, {
        concentration: newConcentration,
        smokeStatus: newSmokeStatus,
        battery: newBattery,
        updateTime: new Date().toLocaleString()
      })

      if (newSmokeStatus === '异常') {
        ElMessage.warning(`烟雾浓度异常：${newConcentration} ppm，超阈值告警`)
      } else {
        ElMessage.success(`烟雾状态正常，当前浓度：${newConcentration} ppm`)
      }
    })
    .catch(() => {})
}
</script>

<style scoped lang="scss">
.zg-smokeprobe {
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

  &.abnormal {
    border-left: 3px solid var(--zg-danger);
  }
  &.normal {
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
    background: var(--zg-warning-soft);
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

  &__location {
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
  &.normal {
    color: var(--zg-success);
    background: var(--zg-success-soft);
  }
  &.abnormal {
    color: var(--zg-danger);
    background: var(--zg-danger-soft);
  }
  &.warn {
    color: var(--zg-warning);
    background: var(--zg-warning-soft);
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