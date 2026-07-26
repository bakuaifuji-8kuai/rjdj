<template>
  <section class="zg-tubeindex">
    <header class="zg-tubeindex__head">
      <div class="zg-tubeindex__sigil">
        <el-icon :size="24"><Guide /></el-icon>
      </div>
      <div class="zg-tubeindex__copy">
        <h1 class="zg-tubeindex__title">管廊列表</h1>
        <p class="zg-tubeindex__subtitle">隧道台账与分段配置管理</p>
      </div>
      <div class="zg-tubeindex__actions">
        <el-button type="primary" @click="tubeForm.openComposer()">
          <el-icon :size="16"><Plus /></el-icon>
          新增隧道
        </el-button>
      </div>
    </header>

    <div class="zg-metrics">
      <div class="zg-metrics__cell">
        <div class="zg-metrics__value">{{ totalRows }}</div>
        <div class="zg-metrics__label">隧道总数</div>
      </div>
      <div class="zg-metrics__cell">
        <div class="zg-metrics__value">{{ normalCount }}</div>
        <div class="zg-metrics__label">正常运行</div>
      </div>
      <div class="zg-metrics__cell">
        <div class="zg-metrics__value">{{ maintenanceCount }}</div>
        <div class="zg-metrics__label">维护中</div>
      </div>
      <div class="zg-metrics__cell">
        <div class="zg-metrics__value">{{ totalLength }}m</div>
        <div class="zg-metrics__label">总长度</div>
      </div>
    </div>

    <div class="zg-filterband">
      <div class="zg-filterband__view">
        <el-button-group>
          <el-button :type="densityMode === 'card' ? 'primary' : 'default'" @click="densityMode = 'card'">
            <el-icon><Grid /></el-icon>
            卡片
          </el-button>
          <el-button :type="densityMode === 'list' ? 'primary' : 'default'" @click="densityMode = 'list'">
            <el-icon><List /></el-icon>
            列表
          </el-button>
        </el-button-group>
      </div>
      <div class="zg-filterband__fields">
        <el-select v-model="statusBuckets" placeholder="全部状态" class="zg-filterband__select">
          <el-option label="全部" value=""></el-option>
          <el-option label="正常" value="正常"></el-option>
          <el-option label="维护中" value="维护中"></el-option>
        </el-select>
        <el-input
          v-model="filterLexicon"
          placeholder="搜索隧道名称"
          class="zg-filterband__input"
          @keyup.enter="onFilterApply()"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-button type="primary" @click="onFilterApply()">检索</el-button>
        <el-button @click="onFilterReset()">重置</el-button>
      </div>
    </div>

    <div class="zg-tubegrid" v-if="densityMode === 'card'">
      <div
        v-for="tube in pagedRows"
        :key="tube.id"
        class="zg-tubecard"
        @click="tubeInspector.openInspector(tube)"
      >
        <div class="zg-tubecard__head">
          <span class="zg-tubecard__title">{{ tube.name }}</span>
          <el-tag :type="tube.status === '正常' ? 'success' : 'warning'" size="small">
            {{ tube.status }}
          </el-tag>
        </div>
        <div class="zg-tubecard__body">
          <div class="zg-tubecard__info">
            <span class="zg-tubecard__label">长度</span>
            <span class="zg-tubecard__value">{{ tube.length }}m</span>
          </div>
          <div class="zg-tubecard__info">
            <span class="zg-tubecard__label">车道</span>
            <span class="zg-tubecard__value">{{ tube.lanes }}条</span>
          </div>
          <div class="zg-tubecard__info">
            <span class="zg-tubecard__label">区域</span>
            <span class="zg-tubecard__value">{{ tube.area }}</span>
          </div>
        </div>
        <div class="zg-tubecard__foot">
          <el-button type="text" size="small" @click.stop="tubeForm.openReviser(tube)">修改</el-button>
          <el-button type="text" size="small" @click.stop="onRetireTube(tube)">废止</el-button>
        </div>
      </div>
    </div>

    <div class="zg-tablewrap" v-else>
      <el-table :data="pagedRows" border class="zg-table">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="name" label="隧道名称" />
        <el-table-column prop="length" label="隧道长度(米)" />
        <el-table-column prop="lanes" label="车道数" />
        <el-table-column prop="area" label="所属区域" />
        <el-table-column prop="level" label="所属层级" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '正常' ? 'success' : 'warning'">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="处置" width="200">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="tubeInspector.openInspector(row)">详情</el-button>
            <el-button type="text" size="small" @click="tubeForm.openReviser(row)">修改</el-button>
            <el-button type="danger" size="small" @click="onRetireTube(row)">废止</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="zg-pagerbar">
      <el-pagination
        v-model:current-page="pageCursor"
        v-model:page-size="pageSpan"
        :total="totalRows"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
      />
    </div>

    <el-drawer
      :title="tubeInspector.loading ? '加载中...' : '隧道详情'"
      v-model="tubeInspector.drawerOpen"
      :size="tubeInspector.drawerSize"
      :direction="tubeInspector.drawerDirection"
      @close="tubeInspector.closeInspector()"
    >
      <div v-if="focusedTube" class="zg-inspector">
        <el-descriptions :column="2" border class="zg-inspector__desc">
          <el-descriptions-item label="隧道名称">{{ focusedTube.name }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="focusedTube.status === '正常' ? 'success' : 'warning'">{{ focusedTube.status }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="隧道长度">{{ focusedTube.length }}m</el-descriptions-item>
          <el-descriptions-item label="车道数">{{ focusedTube.lanes }}条</el-descriptions-item>
          <el-descriptions-item label="所属区域">{{ focusedTube.area }}</el-descriptions-item>
          <el-descriptions-item label="所属层级">{{ focusedTube.level }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ focusedTube.createTime }}</el-descriptions-item>
        </el-descriptions>
        <div class="zg-inspector__actions">
          <el-button type="primary" @click="tubeForm.openReviser(focusedTube)">修订</el-button>
          <el-button @click="onToggleTube(focusedTube)">
            {{ focusedTube.status === '正常' ? '维护中' : '正常' }}
          </el-button>
        </div>
      </div>
    </el-drawer>

    <el-drawer
      :title="tubeForm.editMode === 'compose' ? '编排隧道' : '修订隧道'"
      v-model="tubeForm.drawerOpen"
      :size="'720px'"
      direction="rtl"
      @close="tubeForm.onDraftDiscard()"
    >
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本信息" name="basic">
          <el-form :model="tubeForm.draftPayload.basic" label-width="120px" class="zg-form">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="*所属层级">
                  <el-select v-model="tubeForm.draftPayload.basic.level" placeholder="请选择">
                    <el-option label="长沙-岳麓区" value="长沙-岳麓区"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="*隧道名称">
                  <el-input v-model="tubeForm.draftPayload.basic.name" placeholder="请输入隧道名称"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="*隧道长度">
                  <el-input v-model="tubeForm.draftPayload.basic.length" placeholder="请输入隧道长度" style="width: 150px;">
                    <template #append>m</template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="竣工日期">
                  <el-date-picker v-model="tubeForm.draftPayload.basic.completionDate" type="date" placeholder="请选择竣工日期"></el-date-picker>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="中心点经度">
                  <el-input v-model="tubeForm.draftPayload.basic.longitude" placeholder="请输入中心点经度"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="中心点纬度">
                  <el-input v-model="tubeForm.draftPayload.basic.latitude" placeholder="请输入中心点纬度"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="地图坐标">
              <el-input v-model="tubeForm.draftPayload.basic.mapCoord" placeholder="请输入地图坐标"></el-input>
            </el-form-item>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="负责单位">
                  <el-input v-model="tubeForm.draftPayload.basic.responsibleUnit" placeholder="请输入负责单位"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="负责人员">
                  <el-input v-model="tubeForm.draftPayload.basic.responsiblePerson" placeholder="请输入负责人员"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="联系方式">
              <el-input v-model="tubeForm.draftPayload.basic.contact" placeholder="请输入联系方式"></el-input>
            </el-form-item>
            <el-form-item label="隧道地址">
              <el-input v-model="tubeForm.draftPayload.basic.address" placeholder="请输入隧道地址"></el-input>
            </el-form-item>
            <el-form-item label="简介">
              <el-input type="textarea" v-model="tubeForm.draftPayload.basic.description" placeholder="请输入简介" :rows="3"></el-input>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="隧道洞信息" name="tunnel">
          <el-form :model="tubeForm.draftPayload.tunnel" label-width="120px" class="zg-form">
            <el-form-item label="*隧道洞类型">
              <el-radio-group v-model="tubeForm.draftPayload.tunnel.type">
                <el-radio label="单道">单道</el-radio>
                <el-radio label="双道">双道</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="*隧道洞名称">
                  <el-input v-model="tubeForm.draftPayload.tunnel.name" placeholder="请输入隧道洞名称"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="*隧道洞长度">
                  <el-input v-model="tubeForm.draftPayload.tunnel.length" placeholder="请输入隧道洞长度" style="width: 150px;">
                    <template #append>m</template>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="*隧道洞排序">
                  <el-select v-model="tubeForm.draftPayload.tunnel.sortOrder" placeholder="请选择">
                    <el-option label="上" value="上"></el-option>
                    <el-option label="下" value="下"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="车道数">
                  <el-input type="number" v-model="tubeForm.draftPayload.tunnel.lanes" placeholder="请输入车道数" style="width: 100px;"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="起始桩号">
                  <el-input v-model="tubeForm.draftPayload.tunnel.startPile" placeholder="请输入起始桩号"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="结束桩号">
                  <el-input v-model="tubeForm.draftPayload.tunnel.endPile" placeholder="请输入结束桩号"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="分段信息" name="section">
          <div class="zg-section-header">
            <span>展厅隧道洞</span>
            <el-button type="primary" size="small" @click="onAddSection">添加</el-button>
          </div>
          <el-table :data="tubeForm.draftPayload.sections" border>
            <el-table-column prop="name" label="分段名称"></el-table-column>
            <el-table-column prop="type" label="分段类型">
              <template #default="{ row }">
                <el-select v-model="row.type" style="width: 100px;">
                  <el-option label="入口段" value="入口段"></el-option>
                  <el-option label="基本段" value="基本段"></el-option>
                  <el-option label="出口段" value="出口段"></el-option>
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="sortOrder" label="分段排序">
              <template #default="{ row }">
                <el-input type="number" v-model="row.sortOrder" style="width: 80px;"></el-input>
              </template>
            </el-table-column>
            <el-table-column prop="length" label="本段长度(米)">
              <template #default="{ row }">
                <el-input type="number" v-model="row.length" style="width: 100px;"></el-input>
              </template>
            </el-table-column>
            <el-table-column prop="entrance" label="出入口">
              <template #default="{ row }">
                <el-select v-model="row.entrance" style="width: 80px;">
                  <el-option label="入口" value="入口"></el-option>
                  <el-option label="出口" value="出口"></el-option>
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="处置" width="120">
              <template #default="{ row }">
                <el-button type="text" size="small" @click="onRemoveSection(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
      <template #footer>
        <el-button @click="tubeForm.onDraftDiscard()">取消</el-button>
        <el-button type="primary" :loading="tubeForm.submitting" @click="onCommitTubeDraft()">保存</el-button>
      </template>
    </el-drawer>
  </section>
</template>

<script setup>
/**
 * 智光云枢 · 管廊照明 · 管廊列表
 * 业务域：tubeLumen
 * 功能：页面级业务组件
 * @module tubeLumen/TubeIndex
 * @author 智光云枢研发团队
 */
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Guide, Plus, Grid, List, Search } from '@element-plus/icons-vue'
import { useFormDraft } from '@/shared/composables/useFormDraft'
import { useDrawerInspector } from '@/shared/composables/useDrawerInspector'
import { useTubeStore } from '@/shared/stores/tubeStore'

const tubeStore = useTubeStore()

const densityMode = ref('list')
const activeTab = ref('basic')
const pageCursor = ref(1)
const pageSpan = ref(10)
const filterLexicon = ref('')
const statusBuckets = ref('')

const tubeForm = useFormDraft({
  basic: {
    level: '长沙-岳麓区',
    name: '',
    length: '',
    completionDate: '',
    longitude: '',
    latitude: '',
    mapCoord: '',
    responsibleUnit: '',
    responsiblePerson: '',
    contact: '',
    address: '',
    description: ''
  },
  tunnel: {
    type: '单道',
    name: '',
    length: '',
    sortOrder: '上',
    lanes: 2,
    startPile: '',
    endPile: ''
  },
  sections: [
    { id: 1, name: '入口段', type: '入口段', sortOrder: 1, length: 5, entrance: '入口', distance: 0, sensor: '' },
    { id: 2, name: '基本段', type: '基本段', sortOrder: 2, length: 10, entrance: '入口', distance: 5, sensor: '' },
    { id: 3, name: '出口段', type: '出口段', sortOrder: 3, length: 5, entrance: '出口', distance: 0, sensor: '' }
  ]
})

const tubeInspector = useDrawerInspector({ size: '680px', direction: 'rtl' })

const focusedTube = computed(() => tubeInspector.focusedRecord)

const filteredTubes = computed(() => {
  let list = tubeStore.tubes.slice()
  if (statusBuckets.value) {
    list = list.filter(t => t.status === statusBuckets.value)
  }
  if (filterLexicon.value) {
    const kw = filterLexicon.value.toLowerCase()
    list = list.filter(t => t.name.toLowerCase().includes(kw))
  }
  return list
})

const totalRows = computed(() => filteredTubes.value.length)

const pagedRows = computed(() => {
  const start = (pageCursor.value - 1) * pageSpan.value
  return filteredTubes.value.slice(start, start + pageSpan.value)
})

const normalCount = computed(() => tubeStore.normalCount.value)
const maintenanceCount = computed(() => tubeStore.maintenanceCount.value)
const totalLength = computed(() => tubeStore.totalLength.value)

const onFilterApply = () => {
  pageCursor.value = 1
}

const onFilterReset = () => {
  filterLexicon.value = ''
  statusBuckets.value = ''
  pageCursor.value = 1
}

/**
 * 提交隧道草稿
 */
const onCommitTubeDraft = async () => {
  const result = await tubeForm.onDraftCommit()
  if (result) {
    if (tubeForm.editMode === 'compose') {
      const tubeLabel = result.basic.name
      const level = `${result.basic.level}-${tubeLabel}`
      tubeStore.addTube({
        name: tubeLabel,
        length: Number(result.basic.length) || 0,
        lanes: result.tunnel.lanes,
        area: '岳麓区',
        level: level,
        status: '正常'
      })
      ElMessage.success('隧道编排成功')
    } else {
      tubeStore.updateTube(tubeForm.originRecord.id, {
        name: result.basic.name,
        length: Number(result.basic.length) || 0,
        lanes: result.tunnel.lanes
      })
      ElMessage.success('隧道修订成功')
    }
  }
}

/**
 * 投切隧道状态
 * @param {Object} tube 隧道记录
 */
const onToggleTube = (tube) => {
  const targetStatus = tube.status === '正常' ? '维护中' : '正常'
  ElMessageBox.confirm(`确定要将隧道状态变更为${targetStatus}吗？`, '提示', {
    type: 'warning'
  }).then(() => {
    tubeStore.updateTube(tube.id, { status: targetStatus })
    ElMessage.success(`隧道已${targetStatus}`)
  }).catch(() => {})
}

/**
 * 废止隧道
 * @param {Object} tube 隧道记录
 */
const onRetireTube = (tube) => {
  ElMessageBox.confirm('确定要废止此隧道吗？', '提示', {
    type: 'warning'
  }).then(() => {
    tubeStore.deleteTube(tube.id)
    ElMessage.success('隧道已废止')
  }).catch(() => {})
}

/**
 * 添加分段
 */
const onAddSection = () => {
  tubeForm.draftPayload.sections.push({
    id: Date.now(),
    name: '',
    type: '基本段',
    sortOrder: tubeForm.draftPayload.sections.length + 1,
    length: '',
    entrance: '入口',
    distance: '',
    sensor: ''
  })
}

/**
 * 移除分段
 * @param {Object} row 分段记录
 */
const onRemoveSection = (row) => {
  const index = tubeForm.draftPayload.sections.findIndex(item => item.id === row.id)
  if (index > -1) {
    tubeForm.draftPayload.sections.splice(index, 1)
  }
}
</script>

<style scoped lang="scss">
.zg-tubeindex {
  background: var(--zg-canvas-mist);
  min-height: 100%;
  padding: var(--zg-space-6);
}

.zg-tubeindex__head {
  display: flex;
  align-items: center;
  gap: var(--zg-space-4);
  margin-bottom: var(--zg-space-6);
}

.zg-tubeindex__sigil {
  width: 48px;
  height: 48px;
  border-radius: var(--zg-radius-lg);
  background: var(--zg-gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.zg-tubeindex__copy {
  flex: 1;
}

.zg-tubeindex__title {
  margin: 0;
  font-size: var(--zg-text-display-md);
  font-weight: 600;
  color: var(--zg-ink-primary);
  letter-spacing: -0.3px;
}

.zg-tubeindex__subtitle {
  margin: 4px 0 0;
  font-size: var(--zg-text-body-sm);
  color: var(--zg-ink-secondary);
}

.zg-tubeindex__actions {
  display: flex;
  gap: var(--zg-space-3);
}

.zg-metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--zg-space-4);
  margin-bottom: var(--zg-space-6);
}

.zg-metrics__cell {
  background: #fff;
  border-radius: var(--zg-radius-lg);
  padding: var(--zg-space-4);
  text-align: center;
  box-shadow: var(--zg-shadow-card);
}

.zg-metrics__value {
  font-size: var(--zg-text-display-lg);
  font-weight: 700;
  color: var(--zg-ink-primary);
}

.zg-metrics__label {
  font-size: var(--zg-text-body-sm);
  color: var(--zg-ink-secondary);
  margin-top: 4px;
}

.zg-filterband {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border-radius: var(--zg-radius-lg);
  padding: var(--zg-space-4);
  margin-bottom: var(--zg-space-4);
  box-shadow: var(--zg-shadow-card);
}

.zg-filterband__view {
  display: flex;
  gap: var(--zg-space-3);
}

.zg-filterband__fields {
  display: flex;
  gap: var(--zg-space-3);
  align-items: center;
}

.zg-filterband__select {
  width: 140px;
}

.zg-filterband__input {
  width: 200px;
}

.zg-tubegrid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--zg-space-4);
  margin-bottom: var(--zg-space-4);
}

.zg-tubecard {
  background: #fff;
  border-radius: var(--zg-radius-lg);
  padding: var(--zg-space-4);
  box-shadow: var(--zg-shadow-card);
  cursor: pointer;
  transition: all 0.3s ease;
}

.zg-tubecard:hover {
  box-shadow: var(--zg-shadow-floating);
  transform: translateY(-2px);
}

.zg-tubecard__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--zg-space-3);
}

.zg-tubecard__title {
  font-weight: 600;
  color: var(--zg-ink-primary);
}

.zg-tubecard__body {
  margin-bottom: var(--zg-space-3);
}

.zg-tubecard__info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.zg-tubecard__label {
  font-size: var(--zg-text-body-sm);
  color: var(--zg-ink-secondary);
}

.zg-tubecard__value {
  font-size: var(--zg-text-body-sm);
  font-weight: 500;
  color: var(--zg-ink-primary);
}

.zg-tubecard__foot {
  display: flex;
  gap: var(--zg-space-3);
  justify-content: flex-end;
}

.zg-tablewrap {
  background: #fff;
  border-radius: var(--zg-radius-lg);
  padding: var(--zg-space-4);
  box-shadow: var(--zg-shadow-card);
  margin-bottom: var(--zg-space-4);
}

.zg-table {
  --el-table-header-bg-color: var(--zg-surface-muted);
  --el-table-header-text-color: var(--zg-ink-secondary);
  --el-table-row-hover-bg-color: var(--zg-canvas-mist);
  --el-table-border-color: var(--zg-ghost-border);
  border-radius: var(--zg-radius-md);
  overflow: hidden;
}

.zg-pagerbar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  background: #fff;
  border-radius: var(--zg-radius-lg);
  padding: var(--zg-space-4);
  box-shadow: var(--zg-shadow-card);
}

.zg-inspector {
  padding: var(--zg-space-3);
}

.zg-inspector__desc {
  margin-bottom: var(--zg-space-4);
}

.zg-inspector__actions {
  display: flex;
  gap: var(--zg-space-3);
  justify-content: flex-end;
}

.zg-form {
  padding: var(--zg-space-3);
}

.zg-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--zg-space-4);
  font-weight: 600;
  color: var(--zg-amber-glow);
}
</style>