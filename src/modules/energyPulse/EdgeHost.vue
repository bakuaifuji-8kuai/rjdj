<!--
  智光云枢 · 能耗监测 · 边缘主机管理
  业务域：energyPulse
  功能：城市照明边缘主机台账与实时监测
        支持左树右表布局、卡片/列表双视图、抽屉式详情与编排
-->
<template>
  <section class="zg-edge">
    <!-- 页面头部：品牌徽标 + 标题 + 概览指标 + 新建入口 -->
    <header class="zg-edge__head">
      <div class="zg-edge__headline">
        <div class="zg-edge__sigil">
          <el-icon :size="22"><Cpu /></el-icon>
        </div>
        <div class="zg-edge__copy">
          <h1 class="zg-edge__title">边缘主机</h1>
          <p class="zg-edge__sub">
            城市照明边缘计算节点 · 在役 {{ activeEdgeCount }} 台 ·
            离线 {{ offlineEdgeCount }} 台 · 累计链路 {{ totalCircuitCount }} 条
          </p>
        </div>
      </div>
      <div class="zg-edge__cta">
        <el-button type="primary" @click="edgeForm.openComposer()">
          <el-icon><Plus /></el-icon>
          <span>登记边缘主机</span>
        </el-button>
      </div>
    </header>

    <!-- 概览指标卡 -->
    <div class="zg-metrics">
      <div class="zg-metrics__cell">
        <span class="zg-metrics__num">{{ edgeCtl.totalRows }}</span>
        <span class="zg-metrics__lbl">主机总数</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--ok">
        <span class="zg-metrics__num">{{ activeEdgeCount }}</span>
        <span class="zg-metrics__lbl">在线运行</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--warn">
        <span class="zg-metrics__num">{{ offlineEdgeCount }}</span>
        <span class="zg-metrics__lbl">离线待检</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--info">
        <span class="zg-metrics__num">{{ totalCircuitCount }}</span>
        <span class="zg-metrics__lbl">链路总数</span>
      </div>
    </div>

    <!-- 左树右表布局容器 -->
    <div class="zg-edgelayout">
      <!-- 左侧区域树 -->
      <aside class="zg-edgelayout__tree">
        <div class="zg-edgetree__header">
          <el-input
            v-model="treeSearch"
            placeholder="检索区域层级"
            clearable
            class="zg-edgetree__search"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <el-tree
          :data="treeData"
          :props="treeProps"
          show-checkbox
          node-key="id"
          :expand-on-click-node="false"
          class="zg-edgetree"
          @check-change="onZoneCheckChange"
        />
      </aside>

      <!-- 右侧内容区 -->
      <main class="zg-edgelayout__content">
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
              v-model="edgeCtl.statusBuckets"
              placeholder="网络状态"
              clearable
              class="zg-filterband__select"
            >
              <el-option label="在线" value="online" />
              <el-option label="离线" value="offline" />
            </el-select>
            <el-select
              v-model="edgeCtl.typeBucket"
              placeholder="所属馈电柜"
              clearable
              class="zg-filterband__select"
            >
              <el-option label="先导路1号馈电柜" value="先导路1号馈电柜" />
              <el-option label="先导路2号馈电柜" value="先导路2号馈电柜" />
              <el-option label="先导路1栋1号馈电柜" value="先导路1栋1号馈电柜" />
              <el-option label="先导路1栋2号馈电柜" value="先导路1栋2号馈电柜" />
            </el-select>
            <el-input
              v-model="edgeCtl.filterLexicon"
              placeholder="检索设备名称/编号"
              clearable
              class="zg-filterband__search"
              @keyup.enter="edgeCtl.onFilterApply()"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" @click="edgeCtl.onFilterApply()">
              <el-icon><Search /></el-icon>
              <span>检索</span>
            </el-button>
            <el-button @click="edgeCtl.onFilterReset()">
              <el-icon><RefreshLeft /></el-icon>
              <span>重置</span>
            </el-button>
          </div>
        </div>

        <!-- 卡片视图 -->
        <div v-if="densityMode === 'card'" class="zg-cardgrid">
          <article
            v-for="edge in edgeCtl.pagedRows"
            :key="edge.id"
            class="zg-edgecard"
            :class="edge.networkStatus === 'online' ? 'online' : 'offline'"
            @click="edgeInspector.openInspector(edge)"
          >
            <div class="zg-edgecard__head">
              <div class="zg-edgecard__glyph">
                <el-icon :size="24"><Cpu /></el-icon>
              </div>
              <span class="zg-status" :class="edge.networkStatus === 'online' ? 'online' : 'offline'">
                <i class="dot"></i>{{ edge.networkStatus === 'online' ? '在线' : '离线' }}
              </span>
            </div>
            <div class="zg-edgecard__body">
              <h3 class="zg-edgecard__name">{{ edge.deviceName }}</h3>
              <p class="zg-edgecard__meta">{{ edge.cabinetName }} · {{ edge.model }}</p>
              <div class="zg-edgecard__stats">
                <span class="zg-edgecard__stat">
                  <em>{{ edge.mac }}</em>
                </span>
                <span class="zg-edgecard__stat">
                  <em>{{ edge.ip }}</em>
                </span>
              </div>
            </div>
            <div class="zg-edgecard__foot">
              <span class="zg-edgecard__time">最后在线：{{ edge.lastOnline }}</span>
              <div class="zg-edgecard__actions">
                <el-button link type="primary" size="small" @click.stop="onReadVersion(edge)">回读版本</el-button>
                <el-button link type="primary" size="small" @click.stop="edgeForm.openReviser(edge)">修订</el-button>
                <el-button link type="danger" size="small" @click.stop="onRetireEdge(edge)">废止</el-button>
              </div>
            </div>
          </article>
        </div>

        <!-- 列表视图 -->
        <div v-else class="zg-tablewrap">
          <el-table :data="edgeCtl.pagedRows" stripe class="zg-datatable">
            <el-table-column prop="no" label="序号" width="60" align="center" />
            <el-table-column prop="deviceName" label="设备名称" min-width="150" />
            <el-table-column prop="mac" label="MAC地址" min-width="180" />
            <el-table-column prop="ip" label="IP地址" min-width="140" />
            <el-table-column label="网络状态" width="100" align="center">
              <template #default="{ row }">
                <span class="zg-status" :class="row.networkStatus === 'online' ? 'online' : 'offline'">
                  <i class="dot"></i>{{ row.networkStatus === 'online' ? '在线' : '离线' }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="scene" label="当前预案" min-width="140" />
            <el-table-column prop="lastOnline" label="最后在线时间" min-width="160" />
            <el-table-column prop="cabinetName" label="所属馈电柜" min-width="140" />
            <el-table-column label="处置" width="260" align="center" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="edgeInspector.openInspector(row)">详情</el-button>
                <el-button type="warning" size="small" @click="onReadVersion(row)">回读版本</el-button>
                <el-button type="primary" size="small" @click="edgeForm.openReviser(row)">修订</el-button>
                <el-button type="danger" size="small" @click="onRetireEdge(row)">废止</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 分页条 -->
        <div class="zg-pagerbar">
          <el-pagination
            v-model:current-page="edgeCtl.pagingCursor"
            v-model:page-size="edgeCtl.pageSpan"
            :total="edgeCtl.totalRows"
            :page-sizes="[10, 15, 20, 50, 100]"
            layout="prev, pager, next, jumper, ->, sizes, total"
            background
          />
        </div>
      </main>
    </div>

    <!-- 详情抽屉 -->
    <el-drawer
      v-model="edgeInspector.drawerOpen"
      :title="'边缘主机详情 · ' + (focusedEdge?.deviceName || '')"
      :direction="edgeInspector.drawerDirection"
      :size="edgeInspector.drawerSize"
    >
      <div v-if="focusedEdge" class="zg-inspector">
        <div class="zg-inspector__head">
          <div class="zg-inspector__glyph">
            <el-icon :size="36"><Cpu /></el-icon>
          </div>
          <div class="zg-inspector__meta">
            <h2 class="zg-inspector__name">{{ focusedEdge.deviceName }}</h2>
            <p class="zg-inspector__type">{{ focusedEdge.cabinetName }} · {{ focusedEdge.model }}</p>
            <span class="zg-status" :class="focusedEdge.networkStatus === 'online' ? 'online' : 'offline'">
              <i class="dot"></i>{{ focusedEdge.networkStatus === 'online' ? '在线' : '离线' }}
            </span>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">基本档案</h4>
          <div class="zg-inspector__grid">
            <div class="zg-inspector__cell">
              <span class="lbl">设备编号</span>
              <span class="val">{{ focusedEdge.presetSn || '-' }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">设备型号</span>
              <span class="val">{{ focusedEdge.model || '-' }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">所属馈电柜</span>
              <span class="val">{{ focusedEdge.cabinetName || '-' }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">备注</span>
              <span class="val">{{ focusedEdge.remark || '-' }}</span>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">网络信息</h4>
          <div class="zg-inspector__grid">
            <div class="zg-inspector__cell">
              <span class="lbl">MAC地址</span>
              <span class="val">{{ focusedEdge.mac || '-' }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">IP地址</span>
              <span class="val">{{ focusedEdge.ip || '-' }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">最后在线</span>
              <span class="val">{{ focusedEdge.lastOnline || '-' }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">当前预案</span>
              <span class="val">{{ focusedEdge.scene || '-' }}</span>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">软件版本</h4>
          <div class="zg-inspector__grid">
            <div class="zg-inspector__cell">
              <span class="lbl">版本号</span>
              <span class="val">{{ focusedEdge.softwareVersion || '-' }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">操作</span>
              <span class="val">
                <el-button type="primary" size="small" @click="onReadVersion(focusedEdge)">回读版本</el-button>
              </span>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">位置信息</h4>
          <div class="zg-inspector__grid">
            <div class="zg-inspector__cell">
              <span class="lbl">项目经纬度</span>
              <span class="val">{{ focusedEdge.projectCoords || '-' }}</span>
              <el-button type="primary" size="small" @click="onSyncPosition(focusedEdge)" class="zg-inspector__btn">同步</el-button>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">设备经纬度</span>
              <span class="val">{{ focusedEdge.deviceCoords || '-' }}</span>
              <el-button type="primary" size="small" @click="onReadDeviceCoords(focusedEdge)" class="zg-inspector__btn">回读</el-button>
            </div>
          </div>
        </div>

        <div class="zg-inspector__actions">
          <el-button size="large" @click="edgeInspector.closeInspector()">关闭</el-button>
          <el-button type="primary" size="large" @click="edgeForm.openReviser(focusedEdge)">修订档案</el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 新建/修订抽屉 -->
    <el-drawer
      v-model="edgeForm.drawerOpen"
      :title="edgeForm.editMode === 'compose' ? '登记边缘主机' : '修订边缘主机'"
      direction="rtl"
      size="560px"
    >
      <el-form :model="edgeForm.draftPayload" label-width="96px" class="zg-draftform">
        <el-form-item label="设备名称" required>
          <el-input v-model="edgeForm.draftPayload.deviceName" placeholder="请输入设备名称" />
        </el-form-item>
        <el-form-item label="设备编号" required>
          <el-input v-model="edgeForm.draftPayload.presetSn" placeholder="请输入设备编号" />
        </el-form-item>
        <el-form-item label="MAC地址" required>
          <el-input v-model="edgeForm.draftPayload.mac" placeholder="请输入MAC地址，如：00-14-97-38-DD-D2" />
        </el-form-item>
        <el-form-item label="IP地址">
          <el-input v-model="edgeForm.draftPayload.ip" placeholder="请输入IP地址，如：10.80.91.139" />
        </el-form-item>
        <el-form-item label="所属馈电柜" required>
          <el-select v-model="edgeForm.draftPayload.cabinetName" placeholder="请选择所属馈电柜" style="width: 100%">
            <el-option label="先导路1号馈电柜" value="先导路1号馈电柜" />
            <el-option label="先导路2号馈电柜" value="先导路2号馈电柜" />
            <el-option label="先导路1栋1号馈电柜" value="先导路1栋1号馈电柜" />
            <el-option label="先导路1栋2号馈电柜" value="先导路1栋2号馈电柜" />
          </el-select>
        </el-form-item>
        <el-form-item label="设备型号">
          <el-select v-model="edgeForm.draftPayload.model" placeholder="请选择设备型号" style="width: 100%">
            <el-option label="EXC-GLA0605E-P20" value="EXC-GLA0605E-P20" />
            <el-option label="G420A路灯边缘主机-Pro" value="G420A" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="edgeForm.draftPayload.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="edgeForm.onDraftDiscard()">取消</el-button>
        <el-button
          type="primary"
          :loading="edgeForm.submitting"
          @click="onCommitEdgeDraft"
        >
          {{ edgeForm.editMode === 'compose' ? '登记' : '保存修订' }}
        </el-button>
      </template>
    </el-drawer>
  </section>
</template>

<script setup>
/**
 * 智光云枢 · 能耗监测 · 边缘主机管理
 * 业务域：energyPulse
 * 功能：城市照明边缘主机台账与实时监测
 *       支持左树右表布局、卡片/列表双视图、抽屉式详情与编排
 * @module energyPulse/EdgeHost
 * @author 智光云枢研发团队
 */
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Cpu,
  Plus,
  Grid,
  List,
  Search,
  RefreshLeft,
  Download,
  Upload
} from '@element-plus/icons-vue'
import { usePresetTable } from '@/shared/composables/usePresetTable'
import { useFormDraft } from '@/shared/composables/useFormDraft'
import { useDrawerInspector } from '@/shared/composables/useDrawerInspector'

// ---- 视图密度切换 ----
const densityMode = ref('card')

// ---- 区域树搜索 ----
const treeSearch = ref('')

// ---- 区域树配置 ----
const treeProps = {
  children: 'children',
  label: 'label'
}

// ---- 区域树数据 ----
const treeData = ref([
  {
    id: 1,
    label: '长沙',
    children: [
      {
        id: 11,
        label: '岳麓区',
        children: [
          { id: 111, label: '先导路', children: [] },
          { id: 112, label: '力唯中天1栋', children: [] }
        ]
      }
    ]
  }
])

// ---- 初始 mock 数据池 ----
const initialEdges = [
  {
    id: 1,
    no: 1,
    deviceName: '先导路集控1',
    presetSn: 'test128M',
    mac: '00-14-97-38-DD-D2',
    ip: '10.80.91.139',
    networkStatus: 'online',
    scene: '先导路夜间照明',
    lastOnline: '2026-05-14 09:30:00',
    cabinetName: '先导路1号馈电柜',
    model: 'EXC-GLA0605E-P20',
    softwareVersion: '3.1.9',
    projectCoords: '113.930463,22.735108',
    deviceCoords: '114.052778,22.545278',
    remark: '主路集控'
  },
  {
    id: 2,
    no: 2,
    deviceName: '先导路集控2',
    presetSn: 'test256M',
    mac: '00-14-97-38-DD-D3',
    ip: '10.80.91.140',
    networkStatus: 'online',
    scene: '先导路节能模式',
    lastOnline: '2026-05-14 09:28:00',
    cabinetName: '先导路2号馈电柜',
    model: 'G420A',
    softwareVersion: '3.2.1',
    projectCoords: '113.930563,22.735208',
    deviceCoords: '114.052878,22.545378',
    remark: ''
  },
  {
    id: 3,
    no: 3,
    deviceName: '力唯中天1栋集控1',
    presetSn: 'test512M',
    mac: '00-14-97-38-DD-D4',
    ip: '10.80.91.141',
    networkStatus: 'offline',
    scene: '力唯中天1栋照明',
    lastOnline: '2026-05-14 08:15:00',
    cabinetName: '先导路1栋1号馈电柜',
    model: 'EXC-GLA0605E-P20',
    softwareVersion: '3.1.8',
    projectCoords: '113.930663,22.735308',
    deviceCoords: '114.052978,22.545478',
    remark: '待检修'
  },
  {
    id: 4,
    no: 4,
    deviceName: '力唯中天1栋集控2',
    presetSn: 'test1024M',
    mac: '00-14-97-38-DD-D5',
    ip: '10.80.91.142',
    networkStatus: 'online',
    scene: '力唯中天1栋节能',
    lastOnline: '2026-05-14 09:32:00',
    cabinetName: '先导路1栋2号馈电柜',
    model: 'G420A',
    softwareVersion: '3.2.0',
    projectCoords: '113.930763,22.735408',
    deviceCoords: '114.053078,22.545578',
    remark: ''
  }
]

// ---- 表格数据容器（usePresetTable） ----
const edgeCtl = usePresetTable(null, {
  defaultPageSpan: 15,
  initialData: initialEdges
})

// ---- 概览指标派生 ----
const activeEdgeCount = computed(
  () => edgeCtl.presetPlaybook.filter(e => e.networkStatus === 'online').length
)
const offlineEdgeCount = computed(
  () => edgeCtl.presetPlaybook.filter(e => e.networkStatus === 'offline').length
)
const totalCircuitCount = computed(() => {
  return edgeCtl.presetPlaybook.length * 8
})

// ---- 表单草稿容器（useFormDraft） ----
const edgeForm = useFormDraft(
  {
    deviceName: '',
    presetSn: '',
    mac: '',
    ip: '',
    cabinetName: '',
    model: '',
    remark: ''
  },
  {
    validateFn: (draft) => {
      if (!draft.deviceName) {
        ElMessage.warning('请输入设备名称')
        return false
      }
      if (!draft.presetSn) {
        ElMessage.warning('请输入设备编号')
        return false
      }
      if (!draft.mac) {
        ElMessage.warning('请输入MAC地址')
        return false
      }
      if (!draft.cabinetName) {
        ElMessage.warning('请选择所属馈电柜')
        return false
      }
      return true
    }
  }
)

// ---- 详情抽屉容器（useDrawerInspector） ----
const edgeInspector = useDrawerInspector({ size: '720px', direction: 'rtl' })
const focusedEdge = computed(() => edgeInspector.focusedRecord)

/**
 * 提交草稿：根据编排/修订模式写入数据池
 * 业务流包装：新建生成序号，修订同步档案字段
 */
const onCommitEdgeDraft = async () => {
  const snapshot = await edgeForm.onDraftCommit()
  if (!snapshot) return

  if (edgeForm.editMode === 'compose') {
    edgeCtl.appendRecord({
      ...snapshot,
      networkStatus: 'online',
      scene: '默认照明预案',
      lastOnline: new Date().toLocaleString('zh-CN'),
      softwareVersion: '3.1.0',
      projectCoords: '-',
      deviceCoords: '-'
    })
    ElMessage.success('边缘主机登记成功，已并入设备台账')
  } else {
    const origin = edgeForm.originRecord
    edgeCtl.reviseRecord(origin.id, { ...snapshot })
    ElMessage.success('边缘主机档案已更新')
  }
}

/**
 * 回读版本：从边缘主机同步软件版本信息
 * @param {Object} edge 目标边缘主机
 */
const onReadVersion = (edge) => {
  ElMessageBox.confirm(
    `确认从「${edge.deviceName}」回读软件版本信息？`,
    '回读确认',
    { type: 'info' }
  )
    .then(() => {
      edgeCtl.reviseRecord(edge.id, {
        softwareVersion: '3.2.2',
        lastOnline: new Date().toLocaleString('zh-CN')
      })
      ElMessage.success('软件版本回读成功，版本号已更新')
    })
    .catch(() => {})
}

/**
 * 同步经纬度：将项目经纬度同步到设备
 * @param {Object} edge 目标边缘主机
 */
const onSyncPosition = (edge) => {
  ElMessageBox.confirm(
    `确认将项目经纬度同步到「${edge.deviceName}」？`,
    '同步确认',
    { type: 'info' }
  )
    .then(() => {
      edgeCtl.reviseRecord(edge.id, {
        deviceCoords: edge.projectCoords,
        lastOnline: new Date().toLocaleString('zh-CN')
      })
      ElMessage.success('经纬度同步成功，设备位置已更新')
    })
    .catch(() => {})
}

/**
 * 回读设备经纬度：从边缘主机获取当前定位信息
 * @param {Object} edge 目标边缘主机
 */
const onReadDeviceCoords = (edge) => {
  ElMessageBox.confirm(
    `确认从「${edge.deviceName}」回读设备经纬度？`,
    '回读确认',
    { type: 'info' }
  )
    .then(() => {
      edgeCtl.reviseRecord(edge.id, {
        deviceCoords: '114.052778,22.545278',
        lastOnline: new Date().toLocaleString('zh-CN')
      })
      ElMessage.success('设备经纬度回读成功')
    })
    .catch(() => {})
}

/**
 * 区域选择变更：处理左侧树节点勾选
 * @param {Object} data 节点数据
 * @param {boolean} checked 是否选中
 * @param {boolean} indeterminate 半选状态
 */
const onZoneCheckChange = (data, checked, indeterminate) => {}

/**
 * 废止边缘主机：二次确认后从台账中移除
 * @param {Object} edge 目标边缘主机
 */
const onRetireEdge = (edge) => {
  ElMessageBox.confirm(
    `确定要将「${edge.deviceName}」从设备台账中废止吗？`,
    '废止确认',
    { type: 'warning' }
  )
    .then(() => {
      edgeCtl.retireRecord(edge.id)
      ElMessage.success('边缘主机已废止，台账已同步')
    })
    .catch(() => {})
}
</script>

<style scoped lang="scss">
.zg-edge {
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

.zg-edgelayout {
  display: flex;
  gap: 16px;

  &__tree {
    width: 240px;
    flex-shrink: 0;
  }

  &__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
}

.zg-edgetree {
  background: var(--zg-surface-card);
  border: 1px solid var(--zg-line-soft);
  border-radius: var(--zg-radius-lg);
  padding: 8px;
  height: calc(100vh - 380px);
  overflow-y: auto;

  &__header {
    padding: 12px 14px;
    background: var(--zg-surface-card);
    border: 1px solid var(--zg-line-soft);
    border-radius: var(--zg-radius-lg);
    margin-bottom: 10px;
  }

  &__search {
    width: 100%;
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

.zg-edgecard {
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
    flex-direction: column;
    gap: 4px;
    margin-top: 6px;
  }

  &__stat {
    font-size: 12px;
    color: var(--zg-ink-tertiary);
    font-family: monospace;

    em {
      font-style: normal;
      font-size: 13px;
      font-weight: 500;
      color: var(--zg-brand-primary);
    }
  }

  &__foot {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 10px;
    border-top: 1px dashed var(--zg-line-soft);
    flex-wrap: wrap;
    gap: 8px;
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
  flex: 1;
  overflow: auto;
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
    position: relative;

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

  &__btn {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
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

.zg-draftform {
  &__unit {
    margin-left: 8px;
    font-size: 13px;
    color: var(--zg-ink-tertiary);
  }
}
</style>