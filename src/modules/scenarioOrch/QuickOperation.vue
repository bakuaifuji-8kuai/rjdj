<template>
  <section class="zg-quick-op">
    <header class="zg-quick-op__head">
      <div class="zg-quick-op__headline">
        <div class="zg-quick-op__sigil">
          <el-icon :size="22"><Lightning /></el-icon>
        </div>
        <div class="zg-quick-op__copy">
          <h1 class="zg-quick-op__title">快捷操作</h1>
          <p class="zg-quick-op__sub">
            场景快速控制与下发管理 · 在册 {{ sceneCtl.totalRows }} 个场景 ·
            累计下发 {{ recordCtl.totalRows }} 条记录
          </p>
        </div>
      </div>
      <div class="zg-quick-op__cta">
        <el-button type="primary" @click="sceneForm.openComposer()">
          <el-icon><Plus /></el-icon>
          <span>新增</span>
        </el-button>
      </div>
    </header>

    <div class="zg-tabwrap">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="场景控制" name="control">
          <div class="zg-filterband">
            <div class="zg-filterband__fields">
              <el-input
                v-model="sceneCtl.filterLexicon"
                placeholder="请输入场景名称查询"
                clearable
                class="zg-filterband__search"
                @keyup.enter="sceneCtl.onFilterApply()"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              <el-button type="primary" @click="sceneCtl.onFilterApply()">
                <el-icon><Search /></el-icon>
                <span>查询</span>
              </el-button>
              <el-button @click="sceneCtl.onFilterReset()">
                <el-icon><Refresh /></el-icon>
                <span>重置</span>
              </el-button>
            </div>
          </div>

          <div class="zg-cardgrid">
            <article
              v-for="scene in sceneCtl.pagedRows"
              :key="scene.id"
              class="zg-scenecard"
            >
              <div class="zg-scenecard__head">
                <span class="zg-scenecard__name">{{ scene.name }}</span>
                <div class="zg-scenecard__right">
                  <el-switch
                    v-model="scene.visible"
                    :active-text="''"
                    :inactive-text="''"
                    @change="onToggleVisible(scene)"
                  />
                  <el-dropdown @command="(cmd) => onSceneAction(scene, cmd)">
                    <span class="zg-scenecard__more">
                      <el-icon><MoreFilled /></el-icon>
                    </span>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="edit">编辑</el-dropdown-item>
                        <el-dropdown-item command="detail">详情</el-dropdown-item>
                        <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </div>
              <div class="zg-scenecard__body">
                <span class="zg-scenecard__serial">ID: {{ scene.id }}</span>
                <span class="zg-scenecard__status">{{ scene.visible ? '显示' : '隐藏' }}</span>
              </div>
              <div class="zg-scenecard__foot">
                <el-button type="primary" size="small" @click="onExecuteScene(scene)">
                  <el-icon><VideoPlay /></el-icon>
                  <span>执行</span>
                </el-button>
                <el-button size="small" @click="onViewResult(scene)">
                  <el-icon><InfoFilled /></el-icon>
                  <span>执行结果</span>
                </el-button>
              </div>
            </article>
          </div>

          <div class="zg-pagerbar">
            <el-pagination
              v-model:current-page="sceneCtl.pagingCursor"
              v-model:page-size="sceneCtl.pageSpan"
              :total="sceneCtl.totalRows"
              :page-sizes="[10, 15, 20, 50, 100]"
              layout="prev, pager, next, jumper, ->, sizes, total"
              background
            />
          </div>
        </el-tab-pane>

        <el-tab-pane label="场景下发记录" name="records">
          <div class="zg-filterband">
            <div class="zg-filterband__fields">
              <el-input
                v-model="recordCtl.filterLexicon"
                placeholder="请输入场景名称查询"
                clearable
                class="zg-filterband__search"
                @keyup.enter="recordCtl.onFilterApply()"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              <el-button type="primary" @click="recordCtl.onFilterApply()">
                <el-icon><Search /></el-icon>
                <span>查询</span>
              </el-button>
              <el-button @click="recordCtl.onFilterReset()">
                <el-icon><Refresh /></el-icon>
                <span>重置</span>
              </el-button>
            </div>
          </div>

          <div class="zg-tablewrap">
            <el-table :data="recordCtl.pagedRows" stripe class="zg-datatable">
              <el-table-column prop="no" label="序号" width="60" align="center" />
              <el-table-column prop="deployTime" label="下发时间" min-width="160" />
              <el-table-column prop="sceneName" label="场景名称" min-width="160" />
              <el-table-column prop="deployUser" label="下发人员" min-width="120" />
              <el-table-column label="操作" width="80" align="center" fixed="right">
                <template #default="{ row }">
                  <el-button type="primary" size="small" @click="onInspectRecord(row)">详情</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div class="zg-pagerbar">
            <el-pagination
              v-model:current-page="recordCtl.pagingCursor"
              v-model:page-size="recordCtl.pageSpan"
              :total="recordCtl.totalRows"
              :page-sizes="[10, 15, 20, 50, 100]"
              layout="prev, pager, next, jumper, ->, sizes, total"
              background
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <el-drawer
      v-model="sceneForm.drawerOpen"
      :title="sceneForm.editMode === 'compose' ? '新增场景' : '编辑场景'"
      direction="rtl"
      size="640px"
    >
      <el-form :model="sceneForm.draftPayload" label-width="96px" class="zg-draftform">
        <el-form-item label="场景名称" required>
          <el-input v-model="sceneForm.draftPayload.name" placeholder="请输入场景名称" />
        </el-form-item>
        <el-form-item label="显示状态" required>
          <el-select v-model="sceneForm.draftPayload.visible" placeholder="请选择" style="width: 100%">
            <el-option :label="'显示'" :value="true" />
            <el-option :label="'隐藏'" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序序号" required>
          <el-input-number v-model="sceneForm.draftPayload.sortOrder" :min="1" :max="999" />
        </el-form-item>

        <div class="zg-form-section">
          <div class="zg-form-section__head">
            <h4 class="zg-form-section__title">动作步骤</h4>
            <el-button type="primary" size="small" @click="addActionStep">
              <el-icon><Plus /></el-icon>
              <span>添加步骤</span>
            </el-button>
          </div>

          <div
            v-for="(step, index) in sceneForm.draftPayload.steps"
            :key="index"
            class="zg-action-step"
          >
            <div class="zg-action-step__header">
              <span class="zg-action-step__num">{{ index + 1 }}</span>
              <span class="zg-action-step__title">动作步骤 {{ index + 1 }}</span>
              <el-button
                v-if="sceneForm.draftPayload.steps.length > 1"
                type="danger"
                size="small"
                @click="removeActionStep(index)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
            <el-form-item label="产品类型" required>
              <el-select
                v-model="step.productType"
                placeholder="请选择产品类型"
                style="width: 100%"
                @change="onProductTypeChange(index)"
              >
                <el-option label="灯控制器" value="灯控制器" />
                <el-option label="集控" value="集控" />
                <el-option label="传感器" value="传感器" />
                <el-option label="摄像头" value="摄像头" />
                <el-option label="智能主控" value="智能主控" />
                <el-option label="智能主控-站点" value="智能主控-站点" />
              </el-select>
            </el-form-item>
            <el-form-item label="设备" required>
              <el-select
                v-model="step.devices"
                multiple
                collapse-tags
                collapse-tags-tooltip
                placeholder="请选择设备"
                style="width: 100%"
              >
                <el-option
                  v-for="dev in getDevicesByType(step.productType)"
                  :key="dev.id"
                  :label="dev.name"
                  :value="dev.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="延时时长" required>
              <el-input-number
                v-model="step.delaySeconds"
                :min="0"
                :max="3600"
                style="width: 100%"
              />
              <span class="zg-form-item__unit">秒</span>
            </el-form-item>
            <el-form-item label="动作类型" required>
              <el-select
                v-model="step.actionType"
                placeholder="请选择动作类型"
                style="width: 100%"
              >
                <el-option label="开关灯" value="开关灯" />
                <el-option label="亮度调节" value="亮度调节" />
              </el-select>
            </el-form-item>
            <el-form-item label="动作内容" required>
              <el-select
                v-if="step.actionType === '开关灯'"
                v-model="step.actionContent"
                placeholder="请选择动作内容"
                style="width: 100%"
              >
                <el-option label="开启" value="开启" />
                <el-option label="关闭" value="关闭" />
              </el-select>
              <el-input-number
                v-else
                v-model="step.actionContent"
                :min="0"
                :max="100"
                style="width: 100%"
              />
              <span v-if="step.actionType === '亮度调节'" class="zg-form-item__unit">%</span>
            </el-form-item>
          </div>
        </div>
      </el-form>
      <template #footer>
        <div class="zg-draftform__foot">
          <el-button @click="sceneForm.onDraftDiscard()">取消</el-button>
          <el-button
            type="primary"
            :loading="sceneForm.submitting"
            @click="onCommitSceneDraft"
          >
            {{ sceneForm.editMode === 'compose' ? '保存' : '保存修改' }}
          </el-button>
        </div>
      </template>
    </el-drawer>

    <el-drawer
      v-model="resultInspector.drawerOpen"
      :title="'执行结果 · ' + (focusedScene?.name || '')"
      direction="rtl"
      size="560px"
    >
      <div v-if="focusedScene" class="zg-inspector">
        <div class="zg-inspector__head">
          <div class="zg-inspector__glyph">
            <el-icon :size="36"><CircleCheckFilled /></el-icon>
          </div>
          <div class="zg-inspector__meta">
            <h2 class="zg-inspector__name">执行成功</h2>
            <p class="zg-inspector__type">{{ focusedScene.name }}</p>
            <span class="zg-status success">
              <i class="dot"></i>成功
            </span>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">执行结果列表</h4>
          <el-table :data="focusedScene.results || []" size="small" border class="zg-datatable">
            <el-table-column prop="no" label="序号" width="60" align="center" />
            <el-table-column prop="productType" label="产品类型" min-width="100" />
            <el-table-column prop="deviceName" label="设备名称" min-width="120" />
            <el-table-column prop="actionType" label="动作类型" min-width="80" />
            <el-table-column prop="executeTime" label="执行时间" min-width="140" />
          </el-table>
        </div>

        <div class="zg-inspector__actions">
          <el-button size="large" @click="resultInspector.closeInspector()">取消</el-button>
          <el-button type="primary" size="large" @click="resultInspector.closeInspector()">确定</el-button>
        </div>
      </div>
    </el-drawer>

    <el-drawer
      v-model="recordInspector.drawerOpen"
      :title="'下发详情 · ' + (focusedRecord?.sceneName || '')"
      direction="rtl"
      size="560px"
    >
      <div v-if="focusedRecord" class="zg-inspector">
        <div class="zg-inspector__head">
          <div class="zg-inspector__glyph">
            <el-icon :size="36"><CircleCheckFilled /></el-icon>
          </div>
          <div class="zg-inspector__meta">
            <h2 class="zg-inspector__name">{{ focusedRecord.sceneName }}</h2>
            <p class="zg-inspector__type">{{ focusedRecord.deployTime }}</p>
            <span class="zg-status success">
              <i class="dot"></i>成功
            </span>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">执行结果列表</h4>
          <el-table :data="focusedRecord.results || []" size="small" border class="zg-datatable">
            <el-table-column prop="no" label="序号" width="60" align="center" />
            <el-table-column prop="productType" label="产品类型" min-width="100" />
            <el-table-column prop="deviceName" label="设备名称" min-width="120" />
            <el-table-column prop="actionType" label="动作类型" min-width="80" />
            <el-table-column prop="executeTime" label="执行时间" min-width="140" />
          </el-table>
        </div>

        <div class="zg-inspector__actions">
          <el-button size="large" @click="recordInspector.closeInspector()">关闭</el-button>
        </div>
      </div>
    </el-drawer>

    <el-drawer
      v-model="sceneDetailInspector.drawerOpen"
      :title="'场景详情 · ' + (focusedSceneDetail?.name || '')"
      direction="rtl"
      size="560px"
    >
      <div v-if="focusedSceneDetail" class="zg-inspector">
        <div class="zg-inspector__head">
          <div class="zg-inspector__glyph">
            <el-icon :size="36"><Lightning /></el-icon>
          </div>
          <div class="zg-inspector__meta">
            <h2 class="zg-inspector__name">{{ focusedSceneDetail.name }}</h2>
            <p class="zg-inspector__type">ID: {{ focusedSceneDetail.id }}</p>
            <span class="zg-status" :class="focusedSceneDetail.visible ? 'online' : 'offline'">
              <i class="dot"></i>{{ focusedSceneDetail.visible ? '显示' : '隐藏' }}
            </span>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">基本信息</h4>
          <div class="zg-inspector__grid">
            <div class="zg-inspector__cell">
              <span class="lbl">场景名称</span>
              <span class="val">{{ focusedSceneDetail.name }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">显示状态</span>
              <span class="val">{{ focusedSceneDetail.visible ? '显示' : '隐藏' }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">排序序号</span>
              <span class="val">{{ focusedSceneDetail.sortOrder }}</span>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">动作步骤</h4>
          <div v-if="focusedSceneDetail.steps && focusedSceneDetail.steps.length > 0">
            <div
              v-for="(step, index) in focusedSceneDetail.steps"
              :key="index"
              class="zg-inspector__condition-item"
            >
              <span class="zg-inspector__condition-num">{{ index + 1 }}.</span>
              <div class="zg-inspector__step-content">
                <div class="zg-inspector__step-row">
                  <span class="zg-inspector__step-label">产品类型</span>
                  <span class="zg-inspector__step-value">{{ step.productType }}</span>
                </div>
                <div class="zg-inspector__step-row">
                  <span class="zg-inspector__step-label">设备名称</span>
                  <span class="zg-inspector__step-value">{{ step.devices.map(id => getDeviceName(step.productType, id)).join(', ') }}</span>
                </div>
                <div class="zg-inspector__step-row">
                  <span class="zg-inspector__step-label">延时时长</span>
                  <span class="zg-inspector__step-value">{{ step.delaySeconds }}秒</span>
                </div>
                <div class="zg-inspector__step-row">
                  <span class="zg-inspector__step-label">动作类型</span>
                  <span class="zg-inspector__step-value">{{ step.actionType }}</span>
                </div>
                <div class="zg-inspector__step-row">
                  <span class="zg-inspector__step-label">动作内容</span>
                  <span class="zg-inspector__step-value">{{ step.actionContent }}{{ step.actionType === '亮度调节' ? '%' : '' }}</span>
                </div>
              </div>
            </div>
          </div>
          <p v-else class="zg-inspector__empty">-</p>
        </div>

        <div class="zg-inspector__actions">
          <el-button size="large" @click="sceneDetailInspector.closeInspector()">关闭</el-button>
          <el-button type="primary" size="large" @click="sceneForm.openReviser(focusedSceneDetail)">修改</el-button>
        </div>
      </div>
    </el-drawer>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Lightning,
  Plus,
  Search,
  Refresh,
  VideoPlay,
  InfoFilled,
  MoreFilled,
  Delete,
  CircleCheckFilled
} from '@element-plus/icons-vue'
import { usePresetTable } from '@/shared/composables/usePresetTable'
import { useFormDraft } from '@/shared/composables/useFormDraft'
import { useDrawerInspector } from '@/shared/composables/useDrawerInspector'
import { useCurrentUser } from '@/shared/composables/useCurrentUser'

const activeTab = ref('control')
const currentUser = useCurrentUser()

const deviceData = {
  '灯控制器': [
    { id: 'lc-001', name: '灯控器-A1' },
    { id: 'lc-002', name: '灯控器-A2' },
    { id: 'lc-003', name: '灯控器-B1' },
    { id: 'lc-004', name: '灯控器-B2' }
  ],
  '集控': [
    { id: 'cc-001', name: '集控中心-主站' },
    { id: 'cc-002', name: '集控中心-分站' }
  ],
  '传感器': [
    { id: 'sen-001', name: '温湿度传感器-1' },
    { id: 'sen-002', name: '光照传感器-1' },
    { id: 'sen-003', name: '人体感应传感器-1' }
  ],
  '摄像头': [
    { id: 'cam-001', name: '摄像头-东门' },
    { id: 'cam-002', name: '摄像头-西门' }
  ],
  '智能主控': [
    { id: 'mc-001', name: '智能主控-区域1' },
    { id: 'mc-002', name: '智能主控-区域2' }
  ],
  '智能主控-站点': [
    { id: 'mcs-001', name: '站点主控-1号站' },
    { id: 'mcs-002', name: '站点主控-2号站' }
  ]
}

const initialScenes = [
  {
    id: 1,
    name: '应急开灯',
    visible: true,
    sortOrder: 1,
    steps: [
      { productType: '灯控制器', devices: ['lc-001', 'lc-002'], delaySeconds: 0, actionType: '开关灯', actionContent: '开启' }
    ],
    results: [
      { no: 1, productType: '灯控制器', deviceName: '灯控器-A1', actionType: '开关灯', executeTime: '2024-04-22 10:26:58' },
      { no: 2, productType: '灯控制器', deviceName: '灯控器-A2', actionType: '开关灯', executeTime: '2024-04-22 10:26:59' }
    ]
  },
  {
    id: 2,
    name: '节能模式',
    visible: true,
    sortOrder: 2,
    steps: [
      { productType: '灯控制器', devices: ['lc-001', 'lc-002', 'lc-003'], delaySeconds: 5, actionType: '亮度调节', actionContent: 30 }
    ],
    results: []
  },
  {
    id: 3,
    name: '全亮模式',
    visible: true,
    sortOrder: 3,
    steps: [
      { productType: '灯控制器', devices: ['lc-001', 'lc-002', 'lc-003', 'lc-004'], delaySeconds: 0, actionType: '亮度调节', actionContent: 100 }
    ],
    results: []
  },
  {
    id: 4,
    name: '夜间巡检',
    visible: true,
    sortOrder: 4,
    steps: [
      { productType: '摄像头', devices: ['cam-001', 'cam-002'], delaySeconds: 0, actionType: '开关灯', actionContent: '开启' },
      { productType: '灯控制器', devices: ['lc-001'], delaySeconds: 2, actionType: '亮度调节', actionContent: 50 }
    ],
    results: []
  }
]

const initialRecords = [
  {
    id: 1,
    no: 1,
    sceneName: '应急开灯',
    deployTime: '2024-04-22 10:26:58',
    deployUser: '管理员',
    results: [
      { no: 1, productType: '灯控制器', deviceName: '灯控器-A1', actionType: '开关灯', executeTime: '2024-04-22 10:26:58' },
      { no: 2, productType: '灯控制器', deviceName: '灯控器-A2', actionType: '开关灯', executeTime: '2024-04-22 10:26:59' }
    ]
  },
  {
    id: 2,
    no: 2,
    sceneName: '节能模式',
    deployTime: '2024-04-22 09:15:30',
    deployUser: '操作员',
    results: [
      { no: 1, productType: '灯控制器', deviceName: '灯控器-A1', actionType: '亮度调节', executeTime: '2024-04-22 09:15:35' }
    ]
  }
]

const sceneCtl = usePresetTable(null, {
  defaultPageSpan: 15,
  initialData: initialScenes
})

const recordCtl = usePresetTable(null, {
  defaultPageSpan: 10,
  initialData: initialRecords
})

const sceneForm = useFormDraft(
  {
    name: '',
    visible: true,
    sortOrder: 1,
    steps: [{
      productType: '',
      devices: [],
      delaySeconds: 0,
      actionType: '',
      actionContent: ''
    }]
  },
  {
    submitApi: async (draft, { mode, origin }) => {
      if (mode === 'compose') {
        const newScene = {
          ...draft,
          id: Date.now(),
          results: []
        }
        sceneCtl.appendRecord(newScene)
        ElMessage.success('场景已创建')
      } else if (origin && origin.id) {
        sceneCtl.reviseRecord(origin.id, draft)
        ElMessage.success('场景已更新')
      }
      return { ok: true }
    },
    validateFn: (draft) => {
      if (!draft.name) {
        ElMessage.warning('请填写场景名称')
        return false
      }
      if (!draft.sortOrder) {
        ElMessage.warning('请填写排序序号')
        return false
      }
      const validStep = draft.steps.some(s => s.productType && s.devices.length > 0 && s.actionType && s.actionContent)
      if (!validStep) {
        ElMessage.warning('请至少配置一个有效的动作步骤')
        return false
      }
      return true
    }
  }
)

const resultInspector = useDrawerInspector({ size: '560px', direction: 'rtl' })
const focusedScene = computed(() => resultInspector.focusedRecord)

const recordInspector = useDrawerInspector({ size: '560px', direction: 'rtl' })
const focusedRecord = computed(() => recordInspector.focusedRecord)

const sceneDetailInspector = useDrawerInspector({ size: '560px', direction: 'rtl' })
const focusedSceneDetail = computed(() => sceneDetailInspector.focusedRecord)

const getDevicesByType = (productType) => {
  return deviceData[productType] || []
}

const getDeviceName = (productType, deviceId) => {
  const devices = deviceData[productType] || []
  const device = devices.find(d => d.id === deviceId)
  return device?.name || deviceId
}

const addActionStep = () => {
  sceneForm.draftPayload.steps.push({
    productType: '',
    devices: [],
    delaySeconds: 0,
    actionType: '',
    actionContent: ''
  })
}

const removeActionStep = (index) => {
  sceneForm.draftPayload.steps.splice(index, 1)
}

const onProductTypeChange = (index) => {
  sceneForm.draftPayload.steps[index].devices = []
}

const onToggleVisible = (scene) => {
  ElMessage.success(`场景"${scene.name}"已${scene.visible ? '显示' : '隐藏'}`)
}

const onSceneAction = (scene, action) => {
  switch (action) {
    case 'edit':
      sceneForm.openReviser(scene)
      break
    case 'detail':
      sceneDetailInspector.openInspector(scene)
      break
    case 'delete':
      ElMessageBox.confirm(`确认删除场景"${scene.name}"吗？`, '删除确认', { type: 'warning' })
        .then(() => {
          sceneCtl.retireRecord(scene.id)
          ElMessage.success('场景已删除')
        })
      break
  }
}

const onExecuteScene = (scene) => {
  const now = new Date().toLocaleString('zh-CN')
  const results = scene.steps.flatMap((step, idx) =>
    step.devices.map((devId, devIdx) => {
      const device = getDevicesByType(step.productType).find(d => d.id === devId)
      return {
        no: idx * 10 + devIdx + 1,
        productType: step.productType,
        deviceName: device?.name || devId,
        actionType: step.actionType,
        executeTime: now
      }
    })
  )

  scene.results = results

  recordCtl.appendRecord({
    id: Date.now(),
    no: recordCtl.totalRows + 1,
    sceneName: scene.name,
    deployTime: now,
    deployUser: currentUser.value.name,
    results: results
  })

  ElMessage.success(`场景"${scene.name}"执行成功`)
  resultInspector.openInspector(scene)
}

const onViewResult = (scene) => {
  if (!scene.results || scene.results.length === 0) {
    ElMessage.info('该场景暂无执行结果')
    return
  }
  resultInspector.openInspector(scene)
}

const onInspectRecord = (record) => {
  recordInspector.openInspector(record)
}

const onCommitSceneDraft = async () => {
  await sceneForm.onDraftCommit()
}
</script>

<style scoped lang="scss">
.zg-quick-op {
  padding: 20px 24px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 100%;
  background: linear-gradient(180deg, #f0fdfa 0%, #ecfeff 100%);

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background: var(--zg-surface-card);
    border-radius: var(--zg-radius-lg);
    border: 1px solid var(--zg-line-brand);
  }

  &__sigil {
    width: 40px;
    height: 40px;
    border-radius: var(--zg-radius-md);
    background: var(--zg-gradient-primary);
    color: #fff;
    display: grid;
    place-items: center;
  }

  &__title {
    font-size: 18px;
    font-weight: 600;
    color: var(--zg-ink-primary);
    margin: 0 0 4px;
  }

  &__sub {
    font-size: 13px;
    color: var(--zg-ink-tertiary);
    margin: 0;
  }
}

.zg-filterband {
  background: var(--zg-surface-card);
  padding: 14px 18px;
  border-radius: var(--zg-radius-lg);
  border: 1px solid var(--zg-line-soft);

  &__fields {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  &__search {
    width: 220px;
  }
}

.zg-cardgrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  padding: 8px 0;
}

.zg-scenecard {
  background: var(--zg-surface-card);
  border-radius: var(--zg-radius-lg);
  border: 1px solid var(--zg-line-soft);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--zg-brand-primary);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  }

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__name {
    font-size: 15px;
    font-weight: 600;
    color: var(--zg-ink-primary);
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__more {
    cursor: pointer;
    color: var(--zg-ink-tertiary);
    font-size: 16px;
  }

  &__body {
    display: flex;
    gap: 12px;
    font-size: 13px;
    color: var(--zg-ink-tertiary);
  }

  &__foot {
    display: flex;
    gap: 8px;
    margin-top: auto;
  }
}

.zg-tablewrap {
  background: var(--zg-surface-card);
  border-radius: var(--zg-radius-lg);
  border: 1px solid var(--zg-line-soft);
  overflow: hidden;
}

.zg-datatable {
  width: 100%;

  :deep(.el-table__header-wrapper) {
    background: var(--zg-surface-elevated);
  }

  :deep(.el-table th) {
    background: var(--zg-surface-elevated);
    font-weight: 600;
    color: var(--zg-ink-secondary);
  }
}

.zg-pagerbar {
  display: flex;
  justify-content: flex-end;
  padding: 16px;
  background: var(--zg-surface-card);
  border-radius: var(--zg-radius-lg);
  border: 1px solid var(--zg-line-soft);
  margin-top: 8px;
}

.zg-draftform {
  padding: 8px 0;

  &__foot {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}

.zg-form-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed var(--zg-line-soft);

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  &__title {
    font-size: 14px;
    font-weight: 600;
    color: var(--zg-ink-primary);
    margin: 0;
  }
}

.zg-action-step {
  background: var(--zg-surface-elevated);
  border-radius: var(--zg-radius-md);
  padding: 12px;
  margin-bottom: 12px;

  &__header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }

  &__num {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--zg-brand-primary);
    color: #fff;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__title {
    font-size: 13px;
    font-weight: 500;
    color: var(--zg-ink-primary);
    flex: 1;
  }
}

.zg-form-item__unit {
  margin-left: 8px;
  font-size: 13px;
  color: var(--zg-ink-tertiary);
}

.zg-inspector {
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__head {
    display: flex;
    gap: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--zg-line-soft);
  }

  &__glyph {
    color: var(--zg-brand-success);
  }

  &__meta {
    flex: 1;
  }

  &__name {
    font-size: 18px;
    font-weight: 600;
    color: var(--zg-ink-primary);
    margin: 0 0 4px;
  }

  &__type {
    font-size: 13px;
    color: var(--zg-ink-tertiary);
    margin: 0;
  }

  &__section {
    &-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--zg-ink-primary);
      margin: 0 0 12px;
    }
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding-top: 16px;
    border-top: 1px solid var(--zg-line-soft);
    margin-top: auto;
  }

  &__step-content {
    flex: 1;
    padding-left: 8px;
  }

  &__step-row {
    display: flex;
    justify-content: space-between;
    padding: 4px 0;
  }

  &__step-label {
    font-size: 12px;
    color: var(--zg-ink-tertiary);
  }

  &__step-value {
    font-size: 12px;
    color: var(--zg-ink-primary);
    font-weight: 500;
  }
}

.zg-status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;

  &.success {
    background: rgba(34, 197, 94, 0.1);
    color: #22c55e;

    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #22c55e;
    }
  }

  &.online {
    background: rgba(34, 197, 94, 0.1);
    color: #22c55e;

    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #22c55e;
    }
  }

  &.offline {
    background: rgba(107, 114, 128, 0.1);
    color: #6b7280;

    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #6b7280;
    }
  }
}
</style>