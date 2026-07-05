<!--
  智光云枢 · 终端管理 · 数据采集器
  业务域：terminalAtlas
  功能：终端设备数据采集与监控管理
        支持卡片/列表双视图、抽屉式详情与编排、状态投切回执
-->
<template>
  <section class="zg-recorder">
    <!-- 页面头部：品牌徽标 + 标题 + 概览指标 + 新建入口 -->
    <header class="zg-recorder__head">
      <div class="zg-recorder__headline">
        <div class="zg-recorder__sigil">
          <el-icon :size="22"><DataLine /></el-icon>
        </div>
        <div class="zg-recorder__copy">
          <h1 class="zg-recorder__title">数据采集器</h1>
          <p class="zg-recorder__sub">
            终端设备采集中枢 · 在线 {{ onlineRecorderCount }} 台 ·
            离线 {{ offlineRecorderCount }} 台 · 累计通道 {{ totalChannelCount }} 路
          </p>
        </div>
      </div>
      <div class="zg-recorder__cta">
        <el-button type="primary" @click="recorderForm.openComposer()">
          <el-icon><Plus /></el-icon>
          <span>新增采集器</span>
        </el-button>
      </div>
    </header>

    <!-- 概览指标卡 -->
    <div class="zg-metrics">
      <div class="zg-metrics__cell">
        <span class="zg-metrics__num">{{ recorderCtl.totalRows }}</span>
        <span class="zg-metrics__lbl">采集器总数</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--ok">
        <span class="zg-metrics__num">{{ onlineRecorderCount }}</span>
        <span class="zg-metrics__lbl">在线运行</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--warn">
        <span class="zg-metrics__num">{{ offlineRecorderCount }}</span>
        <span class="zg-metrics__lbl">离线待检</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--info">
        <span class="zg-metrics__num">{{ totalChannelCount }}</span>
        <span class="zg-metrics__lbl">通道总数</span>
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
          v-model="recorderCtl.statusBuckets"
          placeholder="网络状态"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="在线" value="在线" />
          <el-option label="离线" value="离线" />
        </el-select>
        <el-select
          v-model="recorderCtl.typeBucket"
          placeholder="所属产品"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="EXC-CAT1" value="EXC-CAT1" />
          <el-option label="电信CAT1" value="电信CAT1" />
        </el-select>
        <el-input
          v-model="recorderCtl.filterLexicon"
          placeholder="检索设备名称/编号"
          clearable
          class="zg-filterband__search"
          @keyup.enter="recorderCtl.onFilterApply()"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="recorderCtl.onFilterApply()">
          <el-icon><Search /></el-icon>
          <span>检索</span>
        </el-button>
        <el-button @click="recorderCtl.onFilterReset()">
          <el-icon><RefreshLeft /></el-icon>
          <span>重置</span>
        </el-button>
      </div>
    </div>

    <!-- 卡片视图 -->
    <div v-if="densityMode === 'card'" class="zg-cardgrid">
      <article
        v-for="recorder in recorderCtl.pagedRows"
        :key="recorder.id"
        class="zg-recordercard"
        :class="recorder.networkStatus === '在线' ? 'online' : 'offline'"
        @click="recorderInspector.openInspector(recorder)"
      >
        <div class="zg-recordercard__head">
          <div class="zg-recordercard__glyph">
            <el-icon :size="24"><DataLine /></el-icon>
          </div>
          <span class="zg-status" :class="recorder.networkStatus === '在线' ? 'online' : 'offline'">
            <i class="dot"></i>{{ recorder.networkStatus }}
          </span>
        </div>
        <div class="zg-recordercard__body">
          <h3 class="zg-recordercard__name">{{ recorder.name }}</h3>
          <p class="zg-recordercard__area">{{ recorder.product }} · {{ recorder.deviceNo }}</p>
          <div class="zg-recordercard__stats">
            <span class="zg-recordercard__stat">
              <em>{{ recorder.channels }}</em> 路
            </span>
            <span class="zg-recordercard__stat">
              <em>{{ recorder.ipAddress }}</em>
            </span>
            <span class="zg-recordercard__stat">
              <em>{{ recorder.port }}</em> 端口
            </span>
          </div>
        </div>
        <div class="zg-recordercard__foot">
          <span class="zg-recordercard__time">{{ recorder.lastOnline }}</span>
          <div class="zg-recordercard__actions">
            <el-button link type="primary" size="small" @click.stop="onToggleRecorder(recorder)">
              {{ recorder.networkStatus === '在线' ? '停用' : '启用' }}
            </el-button>
            <el-button link type="primary" size="small" @click.stop="recorderForm.openReviser(recorder)">修订</el-button>
            <el-button link type="danger" size="small" @click.stop="onRetireRecorder(recorder)">废止</el-button>
          </div>
        </div>
      </article>
    </div>

    <!-- 列表视图 -->
    <div v-else class="zg-tablewrap">
      <el-table :data="recorderCtl.pagedRows" stripe class="zg-datatable">
        <el-table-column prop="no" label="序号" width="60" align="center" />
        <el-table-column prop="product" label="所属产品" width="120" />
        <el-table-column prop="deviceNo" label="设备编号" min-width="120" />
        <el-table-column prop="name" label="设备名称" min-width="140" />
        <el-table-column prop="ipAddress" label="IP地址" width="130" />
        <el-table-column label="网络状态" width="100" align="center">
          <template #default="{ row }">
            <span class="zg-status" :class="row.networkStatus === '在线' ? 'online' : 'offline'">
              <i class="dot"></i>{{ row.networkStatus }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="channels" label="通道数" width="90" align="center" />
        <el-table-column prop="lampPost" label="所属杆塔" width="110" />
        <el-table-column prop="lastOnline" label="最后在线" width="160" />
        <el-table-column label="处置" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="recorderInspector.openInspector(row)">详情</el-button>
            <el-button type="success" size="small" @click="onReadRecordData(row)">读取数据</el-button>
            <el-button type="warning" size="small" @click="onToggleRecorder(row)">
              {{ row.networkStatus === '在线' ? '停用' : '启用' }}
            </el-button>
            <el-button type="primary" size="small" @click="recorderForm.openReviser(row)">修订</el-button>
            <el-button type="danger" size="small" @click="onRetireRecorder(row)">废止</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页条 -->
    <div class="zg-pagerbar">
      <el-pagination
        v-model:current-page="recorderCtl.pagingCursor"
        v-model:page-size="recorderCtl.pageSpan"
        :total="recorderCtl.totalRows"
        :page-sizes="[10, 15, 20, 50, 100]"
        layout="prev, pager, next, jumper, ->, sizes, total"
        background
      />
    </div>

    <!-- 详情抽屉 -->
    <el-drawer
      v-model="recorderInspector.drawerOpen"
      :title="'数据采集器详情 · ' + (focusedRecorder?.name || '')"
      direction="rtl"
      size="680px"
    >
      <div v-if="focusedRecorder" class="zg-inspector">
        <div class="zg-inspector__head">
          <div class="zg-inspector__glyph">
            <el-icon :size="36"><DataLine /></el-icon>
          </div>
          <div class="zg-inspector__meta">
            <h2 class="zg-inspector__name">{{ focusedRecorder.name }}</h2>
            <p class="zg-inspector__type">{{ focusedRecorder.product }} · {{ focusedRecorder.deviceNo }}</p>
            <span class="zg-status" :class="focusedRecorder.networkStatus === '在线' ? 'online' : 'offline'">
              <i class="dot"></i>{{ focusedRecorder.networkStatus }}
            </span>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">基本档案</h4>
          <div class="zg-inspector__grid">
            <div class="zg-inspector__cell">
              <span class="lbl">所属产品</span>
              <span class="val">{{ focusedRecorder.product }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">设备编号</span>
              <span class="val">{{ focusedRecorder.deviceNo }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">设备型号</span>
              <span class="val">{{ focusedRecorder.model || '-' }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">所属层级</span>
              <span class="val">{{ focusedRecorder.level || '-' }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">所属杆塔</span>
              <span class="val">{{ focusedRecorder.lampPost || '-' }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">最后在线</span>
              <span class="val">{{ focusedRecorder.lastOnline }}</span>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">网络配置</h4>
          <div class="zg-datagrid">
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">IP地址</div>
              <div class="zg-datacard__val">{{ focusedRecorder.ipAddress }}<em></em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">端口号</div>
              <div class="zg-datacard__val">{{ focusedRecorder.port }}<em></em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">通道数</div>
              <div class="zg-datacard__val">{{ focusedRecorder.channels }}<em>路</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">运行时长</div>
              <div class="zg-datacard__val">{{ focusedRecorder.runTime || 0 }}<em>h</em></div>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">采集通道</h4>
          <el-table :data="focusedRecorder.channelList" size="small" border>
            <el-table-column prop="no" label="序号" width="60" align="center" />
            <el-table-column prop="name" label="通道名称" min-width="120" />
            <el-table-column label="状态" width="90" align="center">
              <template #default="{ row }">
                <span class="zg-status" :class="row.status === '采集' ? 'online' : 'idle'">
                  <i class="dot"></i>{{ row.status }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="resolution" label="分辨率" width="110" align="center" />
            <el-table-column prop="frameRate" label="帧率" width="90" align="center" />
          </el-table>
        </div>

        <div class="zg-inspector__actions">
          <el-button size="large" @click="recorderInspector.closeInspector()">关闭</el-button>
          <el-button
            type="success"
            size="large"
            @click="onReadRecordData(focusedRecorder)"
          >
            读取采集数据
          </el-button>
          <el-button
            type="warning"
            size="large"
            @click="onToggleRecorder(focusedRecorder)"
          >
            {{ focusedRecorder.networkStatus === '在线' ? '停用采集器' : '启用采集器' }}
          </el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 新建/修订抽屉 -->
    <el-drawer
      v-model="recorderForm.drawerOpen"
      :title="recorderForm.editMode === 'compose' ? '新增数据采集器' : '修订数据采集器'"
      direction="rtl"
      size="560px"
    >
      <el-form :model="recorderForm.draftPayload" label-width="96px" class="zg-draftform">
        <el-form-item label="所属产品" required>
          <el-select v-model="recorderForm.draftPayload.product" placeholder="请选择所属产品" style="width: 100%">
            <el-option label="EXC-CAT1" value="EXC-CAT1" />
            <el-option label="电信CAT1" value="电信CAT1" />
          </el-select>
        </el-form-item>
        <el-form-item label="设备编号" required>
          <el-input v-model="recorderForm.draftPayload.deviceNo" placeholder="请输入设备编号" />
        </el-form-item>
        <el-form-item label="设备名称" required>
          <el-input v-model="recorderForm.draftPayload.name" placeholder="请输入设备名称" />
        </el-form-item>
        <el-form-item label="设备型号">
          <el-input v-model="recorderForm.draftPayload.model" placeholder="请输入设备型号" />
        </el-form-item>
        <el-form-item label="IP地址" required>
          <el-input v-model="recorderForm.draftPayload.ipAddress" placeholder="请输入IP地址" />
        </el-form-item>
        <el-form-item label="端口号" required>
          <el-input-number v-model="recorderForm.draftPayload.port" :min="1" :max="65535" />
          <span class="zg-draftform__unit">Port</span>
        </el-form-item>
        <el-form-item label="所属层级">
          <el-select v-model="recorderForm.draftPayload.level" placeholder="请选择所属层级" style="width: 100%">
            <el-option label="长沙" value="长沙" />
            <el-option label="岳麓区" value="岳麓区" />
            <el-option label="先导路" value="先导路" />
            <el-option label="力唯中天1栋" value="力唯中天1栋" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属杆塔">
          <el-select v-model="recorderForm.draftPayload.lampPost" placeholder="请选择所属杆塔" style="width: 100%">
            <el-option label="光源展示01" value="光源展示01" />
            <el-option label="光源展示02" value="光源展示02" />
            <el-option label="光源展示03" value="光源展示03" />
          </el-select>
        </el-form-item>
        <el-form-item label="通道数" required>
          <el-input-number v-model="recorderForm.draftPayload.channels" :min="1" :max="16" />
          <span class="zg-draftform__unit">路</span>
        </el-form-item>
        <el-form-item label="设备经度">
          <el-input v-model="recorderForm.draftPayload.longitude" placeholder="请输入设备经度" />
        </el-form-item>
        <el-form-item label="设备纬度">
          <el-input v-model="recorderForm.draftPayload.latitude" placeholder="请输入设备纬度" />
        </el-form-item>
        <el-form-item label="用户名" required>
          <el-input v-model="recorderForm.draftPayload.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" required>
          <el-input v-model="recorderForm.draftPayload.password" type="password" placeholder="请输入密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="recorderForm.onDraftDiscard()">取消</el-button>
        <el-button
          type="primary"
          :loading="recorderForm.submitting"
          @click="onCommitRecorderDraft"
        >
          {{ recorderForm.editMode === 'compose' ? '登记' : '保存修订' }}
        </el-button>
      </template>
    </el-drawer>
  </section>
</template>

<script setup>
/**
 * 智光云枢 · 终端管理 · 数据采集器
 * 业务域：terminalAtlas
 * 功能：终端设备数据采集与监控管理
 * @module terminalAtlas/Recorder
 * @author 智光云枢研发团队
 */
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  DataLine,
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
const initialRecorders = [
  {
    id: 1,
    no: 1,
    product: 'EXC-CAT1',
    deviceNo: 'REC-2024-001',
    name: '主入口数据采集器',
    model: 'DVR-4000',
    ipAddress: '192.168.1.101',
    port: 8000,
    level: '岳麓区',
    lampPost: '光源展示01',
    longitude: '112.938889',
    latitude: '28.231111',
    channels: 8,
    username: 'admin',
    password: '******',
    networkStatus: '在线',
    lastOnline: '2025-06-15 09:30:00',
    runTime: 4320,
    channelList: [
      { no: 1, name: '通道1', status: '采集', resolution: '1920x1080', frameRate: '25fps' },
      { no: 2, name: '通道2', status: '采集', resolution: '1920x1080', frameRate: '25fps' },
      { no: 3, name: '通道3', status: '停止', resolution: '1280x720', frameRate: '15fps' },
      { no: 4, name: '通道4', status: '采集', resolution: '1920x1080', frameRate: '25fps' }
    ]
  },
  {
    id: 2,
    no: 2,
    product: '电信CAT1',
    deviceNo: 'REC-2024-002',
    name: '停车场数据采集器',
    model: 'DVR-4000',
    ipAddress: '192.168.1.102',
    port: 8000,
    level: '岳麓区',
    lampPost: '光源展示02',
    longitude: '112.939111',
    latitude: '28.231333',
    channels: 4,
    username: 'admin',
    password: '******',
    networkStatus: '在线',
    lastOnline: '2025-06-15 09:28:00',
    runTime: 3600,
    channelList: []
  },
  {
    id: 3,
    no: 3,
    product: 'EXC-CAT1',
    deviceNo: 'REC-2024-003',
    name: '办公楼数据采集器',
    model: 'NVR-8000',
    ipAddress: '192.168.1.103',
    port: 8000,
    level: '先导路',
    lampPost: '光源展示03',
    longitude: '112.939333',
    latitude: '28.231555',
    channels: 16,
    username: 'admin',
    password: '******',
    networkStatus: '离线',
    lastOnline: '2025-06-14 18:00:00',
    runTime: 2160,
    channelList: []
  },
  {
    id: 4,
    no: 4,
    product: '电信CAT1',
    deviceNo: 'REC-2024-004',
    name: '园区数据采集器',
    model: 'DVR-4000',
    ipAddress: '192.168.1.104',
    port: 8000,
    level: '长沙',
    lampPost: '光源展示01',
    longitude: '112.939555',
    latitude: '28.231777',
    channels: 8,
    username: 'admin',
    password: '******',
    networkStatus: '在线',
    lastOnline: '2025-06-15 09:25:00',
    runTime: 5400,
    channelList: []
  },
  {
    id: 5,
    no: 5,
    product: 'EXC-CAT1',
    deviceNo: 'REC-2024-005',
    name: '仓库数据采集器',
    model: 'NVR-8000',
    ipAddress: '192.168.1.105',
    port: 8000,
    level: '力唯中天1栋',
    lampPost: '光源展示02',
    longitude: '112.939777',
    latitude: '28.231999',
    channels: 12,
    username: 'admin',
    password: '******',
    networkStatus: '离线',
    lastOnline: '2025-06-13 10:00:00',
    runTime: 1800,
    channelList: []
  }
]

// ---- 表格数据容器（usePresetTable） ----
const recorderCtl = usePresetTable(null, {
  defaultPageSpan: 15,
  initialData: initialRecorders
})

// ---- 概览指标派生 ----
const onlineRecorderCount = computed(
  () => recorderCtl.presetPlaybook.filter(r => r.networkStatus === '在线').length
)
const offlineRecorderCount = computed(
  () => recorderCtl.presetPlaybook.filter(r => r.networkStatus === '离线').length
)
const totalChannelCount = computed(
  () => recorderCtl.presetPlaybook.reduce((sum, r) => sum + (r.channels || 0), 0)
)

// ---- 表单草稿容器（useFormDraft） ----
const recorderForm = useFormDraft(
  {
    product: '',
    deviceNo: '',
    name: '',
    model: '',
    ipAddress: '',
    port: 8000,
    level: '',
    lampPost: '',
    longitude: '',
    latitude: '',
    channels: 4,
    username: '',
    password: ''
  },
  {
    validateFn: (draft) => {
      if (!draft.product) {
        ElMessage.warning('请选择所属产品')
        return false
      }
      if (!draft.deviceNo) {
        ElMessage.warning('请输入设备编号')
        return false
      }
      if (!draft.name) {
        ElMessage.warning('请输入设备名称')
        return false
      }
      if (!draft.ipAddress) {
        ElMessage.warning('请输入IP地址')
        return false
      }
      if (!draft.port) {
        ElMessage.warning('请输入端口号')
        return false
      }
      if (!draft.channels) {
        ElMessage.warning('请输入通道数')
        return false
      }
      if (!draft.username) {
        ElMessage.warning('请输入用户名')
        return false
      }
      if (!draft.password) {
        ElMessage.warning('请输入密码')
        return false
      }
      return true
    }
  }
)

// ---- 详情抽屉容器（useDrawerInspector） ----
const recorderInspector = useDrawerInspector({ size: '680px', direction: 'rtl' })
const focusedRecorder = computed(() => recorderInspector.focusedRecord)

/**
 * 提交草稿：根据编排/修订模式写入数据池
 * 业务流包装：新建生成设备编号，修订同步配置字段
 */
const onCommitRecorderDraft = async () => {
  const snapshot = await recorderForm.onDraftCommit()
  if (!snapshot) return

  if (recorderForm.editMode === 'compose') {
    // 登记：附带运行态默认值
    recorderCtl.appendRecord({
      ...snapshot,
      no: recorderCtl.presetPlaybook.length + 1,
      networkStatus: '在线',
      lastOnline: new Date().toLocaleString(),
      runTime: 0,
      channelList: []
    })
    ElMessage.success('数据采集器登记成功，已并入采集台账')
  } else {
    // 修订：合并更新到原记录
    const origin = recorderForm.originRecord
    recorderCtl.reviseRecord(origin.id, { ...snapshot })
    ElMessage.success('数据采集器配置已更新')
  }
}

/**
 * 投切采集器：在线↔离线切换，含幂等回执避免重复投切
 * @param {Object} recorder 目标采集器
 */
const onToggleRecorder = (recorder) => {
  const nextStatus = recorder.networkStatus === '在线' ? '离线' : '在线'
  ElMessageBox.confirm(
    `确认将「${recorder.name}」${nextStatus === '在线' ? '启用' : '停用'}？`,
    '投切确认',
    { type: 'warning' }
  )
    .then(() => {
      recorderCtl.reviseRecord(recorder.id, { networkStatus: nextStatus, lastOnline: new Date().toLocaleString() })
      ElMessage.success(`采集器已${nextStatus === '在线' ? '启用' : '停用'}，状态回执已签收`)
    })
    .catch(() => {})
}

/**
 * 废止采集器：二次确认后从台账中移除
 * @param {Object} recorder 目标采集器
 */
const onRetireRecorder = (recorder) => {
  ElMessageBox.confirm(
    `确定要将「${recorder.name}」从采集台账中废止吗？`,
    '废止确认',
    { type: 'warning' }
  )
    .then(() => {
      recorderCtl.retireRecord(recorder.id)
      ElMessage.success('采集器已废止，台账已同步')
    })
    .catch(() => {})
}

/**
 * 读取采集数据：模拟数据读取操作
 * @param {Object} recorder 目标采集器
 */
const onReadRecordData = (recorder) => {
  ElMessage.info(`正在读取「${recorder.name}」的采集数据...`)
  setTimeout(() => {
    ElMessage.success(`「${recorder.name}」采集数据读取完成，共 ${recorder.channels} 路`)
  }, 800)
}
</script>

<style scoped lang="scss">
.zg-recorder {
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

.zg-recordercard {
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