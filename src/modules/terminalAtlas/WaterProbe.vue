<!--
  智光云枢 · 终端管理 · 水浸传感器
  业务域：terminalAtlas
  功能：水浸传感器台账与状态监测
        支持卡片/列表双视图、抽屉式详情与编排、水浸状态读取
-->
<template>
  <section class="zg-waterprobe">
    <!-- 页面头部：品牌徽标 + 标题 + 概览指标 + 新建入口 -->
    <header class="zg-waterprobe__head">
      <div class="zg-waterprobe__headline">
        <div class="zg-waterprobe__sigil">
          <el-icon :size="22"><Warning /></el-icon>
        </div>
        <div class="zg-waterprobe__copy">
          <h1 class="zg-waterprobe__title">水浸传感器</h1>
          <p class="zg-waterprobe__sub">
            终端管理 · 在役 {{ activeProbeCount }} 台 ·
            离线 {{ offlineProbeCount }} 台 · 告警 {{ alertProbeCount }} 台
          </p>
        </div>
      </div>
      <div class="zg-waterprobe__cta">
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
      <div class="zg-metrics__cell zg-metrics__cell--danger">
        <span class="zg-metrics__num">{{ alertProbeCount }}</span>
        <span class="zg-metrics__lbl">水浸告警</span>
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
          placeholder="水浸状态"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="正常" value="正常" />
          <el-option label="告警" value="告警" />
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
        :class="probe.waterStatus === '告警' ? 'alert' : (probe.onlineStatus === '在线' ? 'online' : 'offline')"
        @click="probeInspector.openInspector(probe)"
      >
        <div class="zg-probecard__head">
          <div class="zg-probecard__glyph">
            <el-icon :size="24"><Warning /></el-icon>
          </div>
          <span class="zg-status" :class="probe.onlineStatus === '在线' ? 'online' : 'offline'">
            <i class="dot"></i>{{ probe.onlineStatus }}
          </span>
        </div>
        <div class="zg-probecard__body">
          <h3 class="zg-probecard__name">{{ probe.name }}</h3>
          <p class="zg-probecard__area">{{ probe.location }}</p>
          <div class="zg-probecard__stats">
            <span class="zg-probecard__stat">
              <em>{{ probe.waterStatus }}</em> 水浸
            </span>
            <span class="zg-probecard__stat">
              <em>{{ probe.sensitivity }}</em> 灵敏度
            </span>
          </div>
        </div>
        <div class="zg-probecard__foot">
          <span class="zg-probecard__time">{{ probe.updateTime }}</span>
          <div class="zg-probecard__actions">
            <el-button link type="primary" size="small" @click.stop="onReadWaterStatus(probe)">
              读取状态
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
        <el-table-column prop="name" label="设备名称" min-width="150" />
        <el-table-column prop="location" label="安装位置" width="180" />
        <el-table-column label="水浸状态" width="100" align="center">
          <template #default="{ row }">
            <span class="zg-status" :class="row.waterStatus === '正常' ? 'normal' : 'alert'">
              <i class="dot"></i>{{ row.waterStatus }}
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
        <el-table-column prop="sensitivity" label="灵敏度" width="90" align="center" />
        <el-table-column prop="updateTime" label="更新时间" width="160" />
        <el-table-column label="处置" width="260" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="probeInspector.openInspector(row)">详情</el-button>
            <el-button type="success" size="small" @click="onReadWaterStatus(row)">读取状态</el-button>
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
      :title="'水浸传感器详情 · ' + (focusedProbe?.name || '')"
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
            <span class="zg-status" :class="focusedProbe.onlineStatus === '在线' ? 'online' : 'offline'">
              <i class="dot"></i>{{ focusedProbe.onlineStatus }}
            </span>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">基本档案</h4>
          <div class="zg-inspector__grid">
            <div class="zg-inspector__cell">
              <span class="lbl">设备编号</span>
              <span class="val">{{ focusedProbe.no }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">安装时间</span>
              <span class="val">{{ focusedProbe.installTime }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">灵敏度等级</span>
              <span class="val">{{ focusedProbe.sensitivity }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">备注</span>
              <span class="val">{{ focusedProbe.remark || '-' }}</span>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">实时状态</h4>
          <div class="zg-datagrid">
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">水浸状态</div>
              <div class="zg-datacard__val">
                <span class="zg-status" :class="focusedProbe.waterStatus === '正常' ? 'normal' : 'alert'">
                  <i class="dot"></i>{{ focusedProbe.waterStatus }}
                </span>
              </div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">在线状态</div>
              <div class="zg-datacard__val">
                <span class="zg-status" :class="focusedProbe.onlineStatus === '在线' ? 'online' : 'offline'">
                  <i class="dot"></i>{{ focusedProbe.onlineStatus }}
                </span>
              </div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">告警次数</div>
              <div class="zg-datacard__val">{{ focusedProbe.alertCount }}<em>次</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">最后更新</div>
              <div class="zg-datacard__val"><em>{{ focusedProbe.updateTime }}</em></div>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">历史告警</h4>
          <el-table :data="focusedProbe.alertHistory" size="small" border>
            <el-table-column prop="time" label="告警时间" width="160" />
            <el-table-column prop="type" label="告警类型" width="100" />
            <el-table-column prop="message" label="告警信息" min-width="180" />
            <el-table-column label="处理状态" width="100" align="center">
              <template #default="{ row }">
                <span class="zg-status" :class="row.handled ? 'online' : 'alert'">
                  <i class="dot"></i>{{ row.handled ? '已处理' : '待处理' }}
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
            @click="onReadWaterStatus(focusedProbe)"
          >
            读取水浸状态
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
        <el-form-item label="设备名称" required>
          <el-input v-model="probeForm.draftPayload.name" placeholder="请输入设备名称" />
        </el-form-item>
        <el-form-item label="安装位置" required>
          <el-select v-model="probeForm.draftPayload.location" placeholder="请选择安装位置" style="width: 100%">
            <el-option label="长沙-岳麓区-先导路" value="长沙-岳麓区-先导路" />
            <el-option label="长沙-岳麓区-力唯中天1栋" value="长沙-岳麓区-力唯中天1栋" />
            <el-option label="长沙-天心区-芙蓉路" value="长沙-天心区-芙蓉路" />
            <el-option label="长沙-开福区-湘江路" value="长沙-开福区-湘江路" />
          </el-select>
        </el-form-item>
        <el-form-item label="灵敏度等级">
          <el-select v-model="probeForm.draftPayload.sensitivity" placeholder="请选择灵敏度" style="width: 100%">
            <el-option label="高" value="高" />
            <el-option label="中" value="中" />
            <el-option label="低" value="低" />
          </el-select>
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
          {{ probeForm.editMode === 'compose' ? '新增' : '保存修订' }}
        </el-button>
      </template>
    </el-drawer>
  </section>
</template>

<script setup>
/**
 * 智光云枢 · 终端管理 · 水浸传感器
 * 业务域：terminalAtlas
 * 功能：水浸传感器台账与状态监测
 * @module terminalAtlas/WaterProbe
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
    name: '先导路A段-水浸01',
    location: '长沙-岳麓区-先导路',
    waterStatus: '正常',
    onlineStatus: '在线',
    sensitivity: '高',
    installTime: '2024-01-15',
    updateTime: '2026-07-03 09:15:30',
    alertCount: 0,
    remark: '主路水浸监测',
    alertHistory: []
  },
  {
    id: 2,
    no: 2,
    name: '先导路B段-水浸02',
    location: '长沙-岳麓区-先导路',
    waterStatus: '正常',
    onlineStatus: '在线',
    sensitivity: '中',
    installTime: '2024-02-20',
    updateTime: '2026-07-03 09:16:00',
    alertCount: 1,
    remark: '辅路水浸监测',
    alertHistory: [
      { time: '2026-06-15 14:30:00', type: '水浸', message: '检测到积水深度超过阈值', handled: true }
    ]
  },
  {
    id: 3,
    no: 3,
    name: '力唯中天1栋-水浸01',
    location: '长沙-岳麓区-力唯中天1栋',
    waterStatus: '告警',
    onlineStatus: '在线',
    sensitivity: '高',
    installTime: '2024-03-10',
    updateTime: '2026-07-03 08:45:22',
    alertCount: 2,
    remark: '地下室监测',
    alertHistory: [
      { time: '2026-07-01 10:20:00', type: '水浸', message: '地下室积水告警', handled: false },
      { time: '2026-06-28 16:15:00', type: '水浸', message: '管道漏水检测', handled: true }
    ]
  },
  {
    id: 4,
    no: 4,
    name: '芙蓉路1段-水浸01',
    location: '长沙-天心区-芙蓉路',
    waterStatus: '正常',
    onlineStatus: '离线',
    sensitivity: '中',
    installTime: '2024-04-05',
    updateTime: '2026-06-30 18:20:00',
    alertCount: 0,
    remark: '待检修',
    alertHistory: []
  },
  {
    id: 5,
    no: 5,
    name: '湘江路南段-水浸01',
    location: '长沙-开福区-湘江路',
    waterStatus: '正常',
    onlineStatus: '在线',
    sensitivity: '高',
    installTime: '2024-05-18',
    updateTime: '2026-07-03 07:30:45',
    alertCount: 0,
    remark: '沿江监测点',
    alertHistory: []
  },
  {
    id: 6,
    no: 6,
    name: '芙蓉路2段-水浸02',
    location: '长沙-天心区-芙蓉路',
    waterStatus: '告警',
    onlineStatus: '在线',
    sensitivity: '高',
    installTime: '2024-06-22',
    updateTime: '2026-07-03 06:10:33',
    alertCount: 1,
    remark: '路口低洼处',
    alertHistory: [
      { time: '2026-07-03 06:10:00', type: '水浸', message: '暴雨导致路面积水', handled: false }
    ]
  },
  {
    id: 7,
    no: 7,
    name: '先导路C段-水浸03',
    location: '长沙-岳麓区-先导路',
    waterStatus: '正常',
    onlineStatus: '在线',
    sensitivity: '低',
    installTime: '2024-07-10',
    updateTime: '2026-07-02 22:15:00',
    alertCount: 0,
    remark: '',
    alertHistory: []
  },
  {
    id: 8,
    no: 8,
    name: '力唯中天2栋-水浸01',
    location: '长沙-岳麓区-力唯中天1栋',
    waterStatus: '正常',
    onlineStatus: '离线',
    sensitivity: '中',
    installTime: '2024-08-05',
    updateTime: '2026-06-28 14:20:00',
    alertCount: 0,
    remark: '设备维护中',
    alertHistory: []
  }
]

// ---- 表格数据容器（usePresetTable） ----
const probeCtl = usePresetTable(null, {
  defaultPageSpan: 15,
  initialData: initialProbes
})

// ---- 概览指标派生 ----
const activeProbeCount = computed(
  () => probeCtl.presetPlaybook.filter(p => p.onlineStatus === '在线').length
)
const offlineProbeCount = computed(
  () => probeCtl.presetPlaybook.filter(p => p.onlineStatus === '离线').length
)
const alertProbeCount = computed(
  () => probeCtl.presetPlaybook.filter(p => p.waterStatus === '告警').length
)

// ---- 表单草稿容器（useFormDraft） ----
const probeForm = useFormDraft(
  {
    name: '',
    location: '',
    sensitivity: '中',
    installTime: '',
    remark: ''
  },
  {
    validateFn: (draft) => {
      if (!draft.name) {
        ElMessage.warning('请输入设备名称')
        return false
      }
      if (!draft.location) {
        ElMessage.warning('请选择安装位置')
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
      waterStatus: '正常',
      onlineStatus: '在线',
      updateTime: new Date().toLocaleString(),
      alertCount: 0,
      alertHistory: []
    })
    ElMessage.success('水浸传感器新增成功，已并入监测台账')
  } else {
    // 修订：合并更新到原记录
    const origin = probeForm.originRecord
    probeCtl.reviseRecord(origin.id, {
      ...snapshot,
      updateTime: new Date().toLocaleString()
    })
    ElMessage.success('传感器档案已更新')
  }
}

/**
 * 读取水浸状态：实时获取传感器水浸状态
 * @param {Object} probe 目标传感器
 */
const onReadWaterStatus = (probe) => {
  ElMessage.info(`正在读取「${probe.name}」水浸状态...`)
  setTimeout(() => {
    const status = Math.random() > 0.2 ? '正常' : '告警'
    probeCtl.reviseRecord(probe.id, {
      waterStatus: status,
      updateTime: new Date().toLocaleString()
    })
    if (status === '告警') {
      ElMessage.warning(`「${probe.name}」检测到水浸告警，请及时处理`)
    } else {
      ElMessage.success(`「${probe.name}」水浸状态正常`)
    }
  }, 500)
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
</script>

<style scoped lang="scss">
.zg-waterprobe {
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
    &--danger::before { background: var(--zg-danger); }
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
  &.alert {
    border-left: 3px solid var(--zg-warning);
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
  &.alert {
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