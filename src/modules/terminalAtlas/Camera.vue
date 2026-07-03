<!--
  智光云枢 · 终端图谱 · 摄像头管理
  业务域：terminalAtlas
  功能：视频采集设备台账与运行监测
        支持卡片/列表双视图、抽屉式详情与编排、启停回执
-->
<template>
  <section class="zg-camera">
    <!-- 页面头部：品牌徽标 + 标题 + 概览指标 + 新建入口 -->
    <header class="zg-camera__head">
      <div class="zg-camera__headline">
        <div class="zg-camera__sigil">
          <el-icon :size="22"><VideoCamera /></el-icon>
        </div>
        <div class="zg-camera__copy">
          <h1 class="zg-camera__title">摄像头管理</h1>
          <p class="zg-camera__sub">
            视频采集终端台账 · 在役 {{ activeCameraCount }} 路 ·
            离线 {{ offlineCameraCount }} 路 · 杆塔覆盖 {{ lampPostCoverage }} 处
          </p>
        </div>
      </div>
      <div class="zg-camera__cta">
        <el-button type="primary" @click="cameraForm.openComposer()">
          <el-icon><Plus /></el-icon>
          <span>登记摄像头</span>
        </el-button>
      </div>
    </header>

    <!-- 概览指标卡 -->
    <div class="zg-metrics">
      <div class="zg-metrics__cell">
        <span class="zg-metrics__num">{{ cameraCtl.totalRows }}</span>
        <span class="zg-metrics__lbl">摄像头总数</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--ok">
        <span class="zg-metrics__num">{{ activeCameraCount }}</span>
        <span class="zg-metrics__lbl">在线运行</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--warn">
        <span class="zg-metrics__num">{{ offlineCameraCount }}</span>
        <span class="zg-metrics__lbl">离线待检</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--info">
        <span class="zg-metrics__num">{{ lampPostCoverage }}</span>
        <span class="zg-metrics__lbl">杆塔覆盖</span>
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
          v-model="cameraCtl.statusBuckets"
          placeholder="网络状态"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="在线" value="在线" />
          <el-option label="离线" value="离线" />
        </el-select>
        <el-select
          v-model="cameraCtl.typeBucket"
          placeholder="视频类型"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="枪机" value="枪机" />
          <el-option label="半球" value="半球" />
          <el-option label="球机" value="球机" />
        </el-select>
        <el-input
          v-model="cameraCtl.filterLexicon"
          placeholder="检索设备名称/编号"
          clearable
          class="zg-filterband__search"
          @keyup.enter="cameraCtl.onFilterApply()"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="cameraCtl.onFilterApply()">
          <el-icon><Search /></el-icon>
          <span>检索</span>
        </el-button>
        <el-button @click="cameraCtl.onFilterReset()">
          <el-icon><RefreshLeft /></el-icon>
          <span>重置</span>
        </el-button>
      </div>
    </div>

    <!-- 卡片视图 -->
    <div v-if="densityMode === 'card'" class="zg-cardgrid">
      <article
        v-for="camera in cameraCtl.pagedRows"
        :key="camera.id"
        class="zg-cameracard"
        :class="camera.status === '在线' ? 'online' : 'offline'"
        @click="cameraInspector.openInspector(camera)"
      >
        <div class="zg-cameracard__head">
          <div class="zg-cameracard__glyph">
            <el-icon :size="24"><VideoCamera /></el-icon>
          </div>
          <span class="zg-status" :class="camera.status === '在线' ? 'online' : 'offline'">
            <i class="dot"></i>{{ camera.status }}
          </span>
        </div>
        <div class="zg-cameracard__body">
          <h3 class="zg-cameracard__name">{{ camera.name }}</h3>
          <p class="zg-cameracard__area">{{ camera.area }} · {{ camera.model }}</p>
          <div class="zg-cameracard__stats">
            <span class="zg-cameracard__stat">
              <em>{{ camera.ipAddress }}</em> IP
            </span>
            <span class="zg-cameracard__stat">
              <em>{{ camera.port }}</em> 端口
            </span>
            <span class="zg-cameracard__stat">
              <em>{{ camera.lampPost || '-' }}</em> 杆塔
            </span>
          </div>
        </div>
        <div class="zg-cameracard__foot">
          <span class="zg-cameracard__time">{{ camera.lastOnline }}</span>
          <div class="zg-cameracard__actions">
            <el-button link type="primary" size="small" @click.stop="onToggleCamera(camera)">
              {{ camera.status === '在线' ? '停用' : '启用' }}
            </el-button>
            <el-button link type="primary" size="small" @click.stop="cameraForm.openReviser(camera)">修订</el-button>
            <el-button link type="danger" size="small" @click.stop="onRetireCamera(camera)">退役</el-button>
          </div>
        </div>
      </article>
    </div>

    <!-- 列表视图 -->
    <div v-else class="zg-tablewrap">
      <el-table :data="cameraCtl.pagedRows" stripe class="zg-datatable">
        <el-table-column prop="no" label="序号" width="60" align="center" />
        <el-table-column prop="area" label="所属区域" width="130" />
        <el-table-column prop="name" label="设备名称" min-width="150" />
        <el-table-column prop="presetSn" label="设备编号" min-width="180" />
        <el-table-column prop="category" label="视频类型" width="90" align="center" />
        <el-table-column prop="lampPost" label="所属杆塔" min-width="120" />
        <el-table-column label="网络状态" width="100" align="center">
          <template #default="{ row }">
            <span class="zg-status" :class="row.status === '在线' ? 'online' : 'offline'">
              <i class="dot"></i>{{ row.status }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="lastOnline" label="最后在线" width="160" />
        <el-table-column label="处置" width="240" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="cameraInspector.openInspector(row)">详情</el-button>
            <el-button type="warning" size="small" @click="onToggleCamera(row)">
              {{ row.status === '在线' ? '停用' : '启用' }}
            </el-button>
            <el-button type="primary" size="small" @click="cameraForm.openReviser(row)">修订</el-button>
            <el-button type="danger" size="small" @click="onRetireCamera(row)">退役</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页条 -->
    <div class="zg-pagerbar">
      <el-pagination
        v-model:current-page="cameraCtl.pagingCursor"
        v-model:page-size="cameraCtl.pageSpan"
        :total="cameraCtl.totalRows"
        :page-sizes="[10, 15, 20, 50, 100]"
        layout="prev, pager, next, jumper, ->, sizes, total"
        background
      />
    </div>

    <!-- 详情抽屉 -->
    <el-drawer
      v-model="cameraInspector.drawerOpen"
      :title="'摄像头详情 · ' + (focusedCamera?.name || '')"
      direction="rtl"
      size="680px"
    >
      <div v-if="focusedCamera" class="zg-inspector">
        <div class="zg-inspector__head">
          <div class="zg-inspector__glyph">
            <el-icon :size="36"><VideoCamera /></el-icon>
          </div>
          <div class="zg-inspector__meta">
            <h2 class="zg-inspector__name">{{ focusedCamera.name }}</h2>
            <p class="zg-inspector__type">{{ focusedCamera.area }} · {{ focusedCamera.model }}</p>
            <span class="zg-status" :class="focusedCamera.status === '在线' ? 'online' : 'offline'">
              <i class="dot"></i>{{ focusedCamera.status }}
            </span>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">基本档案</h4>
          <div class="zg-inspector__grid">
            <div class="zg-inspector__cell">
              <span class="lbl">设备编号</span>
              <span class="val">{{ focusedCamera.presetSn }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">所属产品</span>
              <span class="val">{{ focusedCamera.product }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">视频类型</span>
              <span class="val">{{ focusedCamera.category }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">所属杆塔</span>
              <span class="val">{{ focusedCamera.lampPost || '-' }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">最后在线</span>
              <span class="val">{{ focusedCamera.lastOnline }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">备注</span>
              <span class="val">{{ focusedCamera.remark || '-' }}</span>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">网络遥测</h4>
          <div class="zg-datagrid">
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">IP 地址</div>
              <div class="zg-datacard__val">{{ focusedCamera.ipAddress }}</div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">端口</div>
              <div class="zg-datacard__val">{{ focusedCamera.port }}</div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">经度</div>
              <div class="zg-datacard__val">{{ focusedCamera.longitude }}</div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">纬度</div>
              <div class="zg-datacard__val">{{ focusedCamera.latitude }}</div>
            </div>
          </div>
        </div>

        <div class="zg-inspector__actions">
          <el-button size="large" @click="cameraInspector.closeInspector()">关闭</el-button>
          <el-button
            type="warning"
            size="large"
            @click="onToggleCamera(focusedCamera)"
          >
            {{ focusedCamera.status === '在线' ? '停用设备' : '启用设备' }}
          </el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 新建/修订抽屉 -->
    <el-drawer
      v-model="cameraForm.drawerOpen"
      :title="cameraForm.editMode === 'compose' ? '登记摄像头' : '修订摄像头'"
      direction="rtl"
      size="560px"
    >
      <el-form :model="cameraForm.draftPayload" label-width="96px" class="zg-draftform">
        <el-form-item label="所属区域" required>
          <el-select v-model="cameraForm.draftPayload.area" placeholder="请选择所属区域" style="width: 100%">
            <el-option label="长沙" value="长沙" />
            <el-option label="岳麓区" value="岳麓区" />
            <el-option label="先导路" value="先导路" />
            <el-option label="力唯中天1栋" value="力唯中天1栋" />
          </el-select>
        </el-form-item>
        <el-form-item label="设备名称" required>
          <el-input v-model="cameraForm.draftPayload.name" placeholder="请输入设备名称" />
        </el-form-item>
        <el-form-item label="设备编号" required>
          <el-input v-model="cameraForm.draftPayload.presetSn" placeholder="请输入设备编号" />
        </el-form-item>
        <el-form-item label="设备型号">
          <el-input v-model="cameraForm.draftPayload.model" placeholder="请输入设备型号" />
        </el-form-item>
        <el-form-item label="视频类型" required>
          <el-select v-model="cameraForm.draftPayload.category" placeholder="请选择视频类型" style="width: 100%">
            <el-option label="枪机" value="枪机" />
            <el-option label="半球" value="半球" />
            <el-option label="球机" value="球机" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属杆塔">
          <el-select v-model="cameraForm.draftPayload.lampPost" placeholder="请选择所属杆塔" style="width: 100%">
            <el-option label="展厅隧道灯" value="展厅隧道灯" />
            <el-option label="光亚展杆塔" value="光亚展杆塔" />
            <el-option label="1号楼-极简05" value="1号楼-极简05" />
            <el-option label="2号楼-极简08" value="2号楼-极简08" />
          </el-select>
        </el-form-item>
        <el-form-item label="IP 地址">
          <el-input v-model="cameraForm.draftPayload.ipAddress" placeholder="请输入 IP 地址" />
        </el-form-item>
        <el-form-item label="端口号">
          <el-input v-model="cameraForm.draftPayload.port" placeholder="请输入端口号" />
        </el-form-item>
        <el-form-item label="经度">
          <el-input v-model="cameraForm.draftPayload.longitude" placeholder="请输入经度">
            <template #suffix>
              <el-icon><MapLocation /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="纬度">
          <el-input v-model="cameraForm.draftPayload.latitude" placeholder="请输入纬度">
            <template #suffix>
              <el-icon><MapLocation /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="cameraForm.draftPayload.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cameraForm.onDraftDiscard()">取消</el-button>
        <el-button
          type="primary"
          :loading="cameraForm.submitting"
          @click="onCommitCameraDraft"
        >
          {{ cameraForm.editMode === 'compose' ? '登记' : '保存修订' }}
        </el-button>
      </template>
    </el-drawer>
  </section>
</template>

<script setup>
/**
 * 智光云枢 · 终端图谱 · 摄像头管理
 * 业务域：terminalAtlas
 * 功能：视频采集设备台账与运行监测
 * @module terminalAtlas/Camera
 * @author 智光云枢研发团队
 */
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  VideoCamera,
  Plus,
  Grid,
  List,
  Search,
  RefreshLeft,
  MapLocation
} from '@element-plus/icons-vue'
import { usePresetTable } from '@/shared/composables/usePresetTable'
import { useFormDraft } from '@/shared/composables/useFormDraft'
import { useDrawerInspector } from '@/shared/composables/useDrawerInspector'

// ---- 视图密度切换 ----
const densityMode = ref('card')

// ---- 初始 mock 数据池 ----
const initialCameras = [
  {
    id: 1,
    no: 1,
    product: '海康枪机视频采集',
    presetSn: 'd31c52e77ed045db87',
    name: '特种照明',
    model: 'DS-2CD2T26',
    category: '枪机',
    area: '长沙',
    lampPost: '展厅隧道灯',
    status: '离线',
    lastOnline: '2026-01-10 19:10:00',
    ipAddress: '192.168.1.101',
    port: '80',
    longitude: '112.9823',
    latitude: '28.2341',
    remark: ''
  },
  {
    id: 2,
    no: 2,
    product: '海康枪机视频采集',
    presetSn: '66c0443f92f94d0ebce',
    name: '展厅入口',
    model: 'DS-2CD2T26',
    category: '枪机',
    area: '长沙',
    lampPost: '展厅隧道灯',
    status: '离线',
    lastOnline: '2026-01-10 19:10:00',
    ipAddress: '192.168.1.102',
    port: '80',
    longitude: '112.9824',
    latitude: '28.2342',
    remark: ''
  },
  {
    id: 3,
    no: 3,
    product: '海康枪机视频采集',
    presetSn: 'df56e1193c464153bf1',
    name: '路灯全景',
    model: 'DS-2CD2T26',
    category: '枪机',
    area: '长沙',
    lampPost: '展厅隧道灯',
    status: '在线',
    lastOnline: '2026-04-28 17:50:00',
    ipAddress: '192.168.1.103',
    port: '80',
    longitude: '112.9825',
    latitude: '28.2343',
    remark: ''
  },
  {
    id: 4,
    no: 4,
    product: '海康枪机视频采集',
    presetSn: '5dfe7819888140f9b7d',
    name: '路灯大屏',
    model: 'DS-2CD2T26',
    category: '枪机',
    area: '长沙',
    lampPost: '展厅隧道灯',
    status: '在线',
    lastOnline: '2026-04-28 17:50:00',
    ipAddress: '192.168.1.104',
    port: '80',
    longitude: '112.9826',
    latitude: '28.2344',
    remark: ''
  },
  {
    id: 5,
    no: 5,
    product: '海康枪机视频采集',
    presetSn: '2572900662644fe7b0d',
    name: '隧道直筒视频采集',
    model: 'DS-2CD2T26',
    category: '枪机',
    area: '长沙',
    lampPost: '展厅隧道灯',
    status: '在线',
    lastOnline: '2026-04-28 17:50:00',
    ipAddress: '192.168.1.105',
    port: '80',
    longitude: '112.9827',
    latitude: '28.2345',
    remark: ''
  },
  {
    id: 6,
    no: 6,
    product: '海康枪机视频采集',
    presetSn: 'a41b5ab812454bc69f3',
    name: '思科来展厅',
    model: 'DS-2CD2T26',
    category: '枪机',
    area: '长沙',
    lampPost: '展厅隧道灯',
    status: '在线',
    lastOnline: '2026-04-28 17:50:00',
    ipAddress: '192.168.1.106',
    port: '80',
    longitude: '112.9828',
    latitude: '28.2346',
    remark: ''
  },
  {
    id: 7,
    no: 7,
    product: '海康球机视频采集',
    presetSn: 'f05921c29d02420b90d',
    name: '展会监控',
    model: 'DS-2DC4223',
    category: '半球',
    area: '长沙',
    lampPost: '光亚展杆塔',
    status: '离线',
    lastOnline: '2024-07-11 10:40:00',
    ipAddress: '192.168.1.201',
    port: '80',
    longitude: '112.9830',
    latitude: '28.2350',
    remark: ''
  },
  {
    id: 8,
    no: 8,
    product: '海康球机视频采集',
    presetSn: '199b98f8b87d498ab04',
    name: '展厅入口',
    model: 'DS-2DC4223',
    category: '球机',
    area: '长沙',
    lampPost: '-',
    status: '离线',
    lastOnline: '2024-11-30 10:10:00',
    ipAddress: '192.168.1.202',
    port: '80',
    longitude: '112.9831',
    latitude: '28.2351',
    remark: ''
  },
  {
    id: 9,
    no: 9,
    product: '海康球机视频采集',
    presetSn: '199b98f8b87d498ab05',
    name: '路灯展厅处置区监控',
    model: 'DS-2DC4223',
    category: '球机',
    area: '长沙',
    lampPost: '1号楼-极简05',
    status: '离线',
    lastOnline: '2024-11-30 10:10:00',
    ipAddress: '192.168.1.203',
    port: '80',
    longitude: '112.9832',
    latitude: '28.2352',
    remark: ''
  },
  {
    id: 10,
    no: 10,
    product: '海康球机视频采集',
    presetSn: '4606f32216694897a26',
    name: '路灯展厅杆塔区监控',
    model: 'DS-2DC4223',
    category: '球机',
    area: '长沙',
    lampPost: '2号楼-极简08',
    status: '离线',
    lastOnline: '2024-11-30 10:10:00',
    ipAddress: '192.168.1.204',
    port: '80',
    longitude: '112.9833',
    latitude: '28.2353',
    remark: ''
  },
  {
    id: 11,
    no: 11,
    product: '海康球机视频采集',
    presetSn: '30faa1258de945c7acd',
    name: '路灯展厅隧道区监控',
    model: 'DS-2DC4223',
    category: '球机',
    area: '长沙',
    lampPost: '-',
    status: '离线',
    lastOnline: '2024-11-30 10:10:00',
    ipAddress: '192.168.1.205',
    port: '80',
    longitude: '112.9834',
    latitude: '28.2354',
    remark: ''
  },
  {
    id: 12,
    no: 12,
    product: '海康球机视频采集',
    presetSn: '1f7a35628d3a4c718f6',
    name: '路灯展厅模组区监控',
    model: 'DS-2DC4223',
    category: '球机',
    area: '长沙',
    lampPost: '-',
    status: '离线',
    lastOnline: '2024-11-30 10:10:00',
    ipAddress: '192.168.1.206',
    port: '80',
    longitude: '112.9835',
    latitude: '28.2355',
    remark: ''
  }
]

// ---- 表格数据容器（usePresetTable） ----
const cameraCtl = usePresetTable(null, {
  defaultPageSpan: 15,
  initialData: initialCameras
})

// ---- 概览指标派生 ----
const activeCameraCount = computed(
  () => cameraCtl.presetPlaybook.filter(c => c.status === '在线').length
)
const offlineCameraCount = computed(
  () => cameraCtl.presetPlaybook.filter(c => c.status === '离线').length
)
const lampPostCoverage = computed(
  () => new Set(
    cameraCtl.presetPlaybook
      .map(c => c.lampPost)
      .filter(lp => lp && lp !== '-')
  ).size
)

// ---- 表单草稿容器（useFormDraft） ----
const cameraForm = useFormDraft(
  {
    area: '',
    name: '',
    presetSn: '',
    model: '',
    category: '',
    lampPost: '',
    ipAddress: '',
    port: '',
    longitude: '',
    latitude: '',
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
      if (!draft.presetSn) {
        ElMessage.warning('请输入设备编号')
        return false
      }
      if (!draft.category) {
        ElMessage.warning('请选择视频类型')
        return false
      }
      return true
    }
  }
)

// ---- 详情抽屉容器（useDrawerInspector） ----
const cameraInspector = useDrawerInspector({ size: '680px', direction: 'rtl' })
const focusedCamera = computed(() => cameraInspector.focusedRecord)

/**
 * 提交草稿：根据编排/修订模式写入数据池
 * 业务流包装：新建生成设备编号，修订同步遥测字段
 */
const onCommitCameraDraft = async () => {
  const snapshot = await cameraForm.onDraftCommit()
  if (!snapshot) return

  if (cameraForm.editMode === 'compose') {
    // 登记：附带运行态默认值
    cameraCtl.appendRecord({
      ...snapshot,
      no: cameraCtl.presetPlaybook.length + 1,
      status: '在线',
      lastOnline: new Date().toLocaleString(),
      product: snapshot.category === '枪机' ? '海康枪机视频采集' : '海康球机视频采集'
    })
    ElMessage.success('摄像头登记成功，已并入视频台账')
  } else {
    // 修订：合并更新到原记录
    const origin = cameraForm.originRecord
    cameraCtl.reviseRecord(origin.id, { ...snapshot })
    ElMessage.success('摄像头档案已更新')
  }
}

/**
 * 启停摄像头：在线↔离线切换，含幂等回执避免重复操作
 * @param {Object} camera 目标摄像头
 */
const onToggleCamera = (camera) => {
  const nextStatus = camera.status === '在线' ? '离线' : '在线'
  ElMessageBox.confirm(
    `确认将「${camera.name}」${nextStatus === '在线' ? '启用' : '停用'}？`,
    '启停确认',
    { type: 'warning' }
  )
    .then(() => {
      cameraCtl.reviseRecord(camera.id, { status: nextStatus })
      ElMessage.success(`设备已${nextStatus === '在线' ? '启用' : '停用'}，遥测回执已签收`)
    })
    .catch(() => {})
}

/**
 * 退役摄像头：二次确认后从台账中移除
 * @param {Object} camera 目标摄像头
 */
const onRetireCamera = (camera) => {
  ElMessageBox.confirm(
    `确定要将「${camera.name}」从视频台账中退役吗？`,
    '退役确认',
    { type: 'warning' }
  )
    .then(() => {
      cameraCtl.retireRecord(camera.id)
      ElMessage.success('设备已退役，台账已同步')
    })
    .catch(() => {})
}
</script>

<style scoped lang="scss">
.zg-camera {
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

.zg-cameracard {
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
