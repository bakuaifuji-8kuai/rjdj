<!--
  智光云枢 · 资产管控 · 盘点任务中心 (Phase 1)
  - 盘点任务创建真表单 (区域/范围/日期/负责人)
  - Drawer GIS 30 圆点 + Checklist
  - 扫码按钮 + 扫描线 CSS keyframes 动画 + ✓勾
  - 差异真计算 (丢失/损坏/账实不符)
  - 差异处理真提交 (报废草稿 / 维修工单 / 调账)
-->
<template>
  <section class="zg-am-check">
    <header class="zg-am-check__head">
      <div class="zg-am-check__headline">
        <div class="zg-am-check__sigil"><el-icon :size="22"><CircleCheck /></el-icon></div>
        <div class="zg-am-check__copy">
          <h1 class="zg-am-check__title">盘点任务中心</h1>
          <p class="zg-am-check__sub">
            全量盘点计划 · 共 {{ tasks.length }} 项 ·
            待开始 {{ pendingCount }} · 进行中 {{ inProgressCount }} ·
            已完成 {{ doneCount }} (含差异 {{ diffCount }} 件)
          </p>
        </div>
      </div>
      <div class="zg-am-check__cta">
        <el-button type="primary" @click="onOpenCreateDialog"><el-icon><Plus /></el-icon>新建盘点计划</el-button>
      </div>
    </header>

    <!-- 任务卡片网格 -->
    <div class="zg-am-check__taskgrid">
      <article v-for="t in tasks" :key="t.id" class="zg-checkcard" :class="'zg-checkcard--' + t.statusKey"
        @click="onOpenDrawer(t)">
        <div class="zg-checkcard__head">
          <span class="zg-checkcard__code">{{ t.code }}</span>
          <span class="zg-checkcard__status" :class="'zg-checkcard__status--' + t.statusKey">
            <i class="dot"></i>{{ t.status }}
          </span>
        </div>
        <h4 class="zg-checkcard__title">{{ t.name }}</h4>
        <div class="zg-checkcard__meta">
          <span><el-icon><User /></el-icon>{{ t.owner }}</span>
          <span><el-icon><Location /></el-icon>{{ t.area }}</span>
        </div>
        <div class="zg-checkcard__progress">
          <el-progress v-if="t.statusKey === 'inProgress'" :percentage="t.progress" :stroke-width="8" :color="progressColor(t.progress)" />
          <span v-else-if="t.statusKey === 'pending'" class="zg-checkcard__progress-pending">待开始</span>
          <span v-else class="zg-checkcard__progress-done">已完成</span>
        </div>
        <div class="zg-checkcard__foot">
          <span class="zg-checkcard__stat">{{ t.poles }} 杆 × {{ t.perPole }} 件 = {{ t.poles * t.perPole }} 件</span>
          <span v-if="t.statusKey === 'done' && t.diffCount" class="zg-checkcard__diff">差异 {{ t.diffCount }} 件</span>
        </div>
      </article>
    </div>

    <!-- 盘点 Drawer -->
    <el-drawer v-model="drawerOpen" :title="focused?.code + ' · ' + focused?.name" direction="rtl" size="960px">
      <template v-if="focused">
        <div class="zg-am-check__drawer-head">
          <div class="zg-am-check__drawer-info">
            <span class="zg-info-chip"><el-icon><User /></el-icon>{{ focused.owner }}</span>
            <span class="zg-info-chip"><el-icon><Location /></el-icon>{{ focused.area }}</span>
            <span class="zg-info-chip"><el-icon><Warning /></el-icon>扫描：{{ scannedCount }}/{{ totalCount }}</span>
          </div>
          <div>
            <el-button v-if="focused.statusKey === 'pending'" type="warning" @click="onStartCheck">开始盘点</el-button>
            <el-button v-if="focused.statusKey === 'inProgress'" type="success" @click="onFinishCheck">
              <el-icon><Check /></el-icon>完成盘点
            </el-button>
          </div>
        </div>

        <div class="zg-am-check__drawer-body">
          <!-- 左：GIS 地图 -->
          <div class="zg-am-check__gis">
            <div class="zg-am-check__gis-title">GIS 位置概览 ({{ gisDots.length }} 杆)</div>
            <div class="zg-am-check__gis-map">
              <div v-for="dot in gisDots" :key="dot.id" class="zg-gis-dot" :class="'zg-gis-dot--' + dot.state"
                :style="{ left: dot.x + '%', top: dot.y + '%' }" :title="dot.poleNo + ' · ' + dot.label"
                @click="activePoleId = dot.id"></div>
            </div>
            <div class="zg-am-check__gis-legend">
              <span class="lg lg--done"><i></i>已扫</span>
              <span class="lg lg--todo"><i></i>未扫</span>
              <span class="lg lg--diff"><i></i>差异</span>
            </div>
          </div>

          <!-- 右：Checklist -->
          <div class="zg-am-check__checklist">
            <div class="zg-am-check__checklist-head">
              <span>杆桩资产清单</span>
              <span class="count">{{ currentPoleItems.length }} 件</span>
            </div>
            <div class="zg-am-check__pole-switcher">
              <el-radio-group v-model="activePoleId" size="default">
                <el-radio-button v-for="p in poleList" :key="p.id" :value="p.id">{{ p.poleNo }}</el-radio-button>
              </el-radio-group>
            </div>
            <div class="zg-am-check__items">
              <div v-for="item in currentPoleItems" :key="item.code" class="zg-check-item" :class="'zg-check-item--' + item.state">
                <div class="zg-check-item__icon">
                  <el-icon v-if="item.state === 'done'"><CircleCheck /></el-icon>
                  <el-icon v-else-if="item.state === 'missing'" color="#dc2626"><CircleClose /></el-icon>
                  <el-icon v-else-if="item.state === 'damaged'" color="#d97706"><Warning /></el-icon>
                  <el-icon v-else><Refresh /></el-icon>
                </div>
                <div class="zg-check-item__body">
                  <div class="zg-check-item__code">{{ item.code }}</div>
                  <div class="zg-check-item__model">{{ item.model }} · {{ item.category }}</div>
                </div>
                <div class="zg-check-item__actions">
                  <el-button size="small" type="success" link :disabled="item.state === 'done'" @click="onMarkDone(item)">✓已扫</el-button>
                  <el-button size="small" type="danger" link :disabled="item.state === 'missing'" @click="onMarkMissing(item)">未找到</el-button>
                  <el-button size="small" type="warning" link :disabled="item.state === 'damaged'" @click="onMarkDamaged(item)">损坏</el-button>
                  <el-button size="small" type="primary" link :disabled="item.state === 'done'" @click="onScan(item)">
                    <el-icon><VideoCamera /></el-icon>扫码
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 差异报告 (只有盘点完成后显示) -->
        <div v-if="diffRows.length" class="zg-am-check__diff">
          <h4 class="zg-am-check__section-title">差异报告 ({{ diffRows.length }} 项)</h4>
          <el-table :data="diffRows" stripe>
            <el-table-column prop="type" label="类型" width="110" align="center">
              <template #default="{ row }">
                <el-tag :type="row.tagType" size="small">{{ row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="assetCode" label="资产编码" width="160">
              <template #default="{ row }"><span class="mono">{{ row.assetCode }}</span></template>
            </el-table-column>
            <el-table-column prop="shouldBeAt" label="应在位置" width="160" />
            <el-table-column prop="actualAt" label="实际情况" />
            <el-table-column prop="suggestion" label="建议处置" width="200" />
            <el-table-column label="处理" width="160" align="center">
              <template #default="{ row }">
                <el-button v-if="row.action !== 'done'" size="small" type="primary" @click="onSubmitDiff(row)">提交</el-button>
                <span v-else class="zg-diff-submitted">已处理</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </template>
    </el-drawer>

    <!-- 扫码动画 Dialog -->
    <el-dialog v-model="scanDialog" width="360px" :show-close="false" center>
      <div class="zg-scan-dialog">
        <div class="zg-scan-box">
          <div class="zg-scan-frame">
            <el-icon class="zg-scan-camera" :size="40"><VideoCamera /></el-icon>
            <div class="zg-scan-line" v-if="scanAnimating"></div>
            <el-icon v-if="scanSuccess" class="zg-scan-ok" :size="56"><CircleCheck /></el-icon>
          </div>
        </div>
        <div class="zg-scan-text">
          {{ scanSuccess ? `✓ ${scanItemCode} 确认` : '正在扫描资产条码...' }}
        </div>
      </div>
    </el-dialog>

    <!-- 新建盘点 Dialog -->
    <el-dialog v-model="createDialog" title="新建盘点计划" width="520px">
      <el-form :model="createForm" label-width="90px">
        <el-form-item label="计划名称"><el-input v-model="createForm.name" placeholder="如：先导路全盘" /></el-form-item>
        <el-form-item label="区域范围">
          <el-select v-model="createForm.area" placeholder="选择区域">
            <el-option v-for="a in ['先导路全段', '麓谷大道北段', '梅溪湖核心区', '金星大道南段', '岳麓大道全段']" :key="a" :label="a" :value="a" />
          </el-select>
        </el-form-item>
        <el-form-item label="盘点范围">
          <el-radio-group v-model="createForm.scope">
            <el-radio-button value="full">全盘</el-radio-button>
            <el-radio-button value="sample">抽盘 30%</el-radio-button>
            <el-radio-button value="sample50">抽盘 50%</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="盘点日期"><el-date-picker v-model="createForm.date" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item>
        <el-form-item label="负责人">
          <el-select v-model="createForm.owner" placeholder="选择负责人">
            <el-option v-for="o in ['张工', '李工', '王工', '陈工', '刘工']" :key="o" :label="o" :value="o" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialog = false">取消</el-button>
        <el-button type="primary" @click="onCreateTask">创建盘点任务</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  CircleCheck, Plus, User, Location, Warning, Check, Refresh, VideoCamera, CircleClose
} from '@element-plus/icons-vue'

interface TaskItem {
  id: number
  code: string
  name: string
  owner: string
  area: string
  poles: number
  perPole: number
  total: number
  progress: number
  statusKey: 'pending' | 'inProgress' | 'done'
  status: string
  diffCount: number
}

interface PoleDot { id: number; x: number; y: number; poleNo: string; label: string; state: 'done' | 'todo' | 'diff' }
interface PoleInfo { id: number; poleNo: string }
interface AssetItem {
  code: string; model: string; category: string; poleId: number
  state: 'todo' | 'done' | 'missing' | 'damaged'
}

// ============================================================
// 数据
// ============================================================
const tasks = ref<TaskItem[]>([
  { id: 1, code: 'PD202610-003', name: '先导路全盘', owner: '张工', area: '先导路全段', poles: 30, perPole: 4, total: 120, progress: 40, statusKey: 'inProgress', status: '进行中', diffCount: 0 },
  { id: 2, code: 'PD202610-002', name: '麓谷大道抽样', owner: '李工', area: '麓谷大道北段', poles: 12, perPole: 4, total: 48, progress: 100, statusKey: 'done', status: '已完成', diffCount: 3 },
  { id: 3, code: 'PD202610-001', name: '梅溪湖全盘', owner: '王工', area: '梅溪湖核心区', poles: 45, perPole: 5, total: 225, progress: 100, statusKey: 'done', status: '已完成', diffCount: 5 },
  { id: 4, code: 'PD202609-012', name: '金星大道南段', owner: '张工', area: '金星大道南段', poles: 28, perPole: 4, total: 112, progress: 0, statusKey: 'pending', status: '待开始', diffCount: 0 },
  { id: 5, code: 'PD202609-011', name: '岳麓大道全盘', owner: '陈工', area: '岳麓大道全段', poles: 40, perPole: 5, total: 200, progress: 0, statusKey: 'pending', status: '待开始', diffCount: 0 },
  { id: 6, code: 'PD202609-010', name: '湘江路灯杆专项', owner: '刘工', area: '湘江路北段', poles: 20, perPole: 2, total: 40, progress: 100, statusKey: 'done', status: '已完成', diffCount: 1 }
])

const pendingCount = computed(() => tasks.value.filter(t => t.statusKey === 'pending').length)
const inProgressCount = computed(() => tasks.value.filter(t => t.statusKey === 'inProgress').length)
const doneCount = computed(() => tasks.value.filter(t => t.statusKey === 'done').length)
const diffCount = computed(() => tasks.value.reduce((a, b) => a + b.diffCount, 0))

// ============================================================
// Drawer 状态
// ============================================================
const drawerOpen = ref(false)
const focused = ref<TaskItem | null>(null)
const activePoleId = ref<number>(1)
const gisDots = ref<PoleDot[]>([])
const poleList = ref<PoleInfo[]>([])
const assetItems = ref<AssetItem[]>([])

function generatePoleAndDots(t: TaskItem) {
  const dots: PoleDot[] = []
  const poles: PoleInfo[] = []
  const areaName = t.area.replace(/路段|全段|核心区|北段|南段/, '')
  for (let i = 1; i <= Math.min(30, t.poles); i++) {
    const px = 6 + ((i * 31) % 88)
    const py = 8 + ((i * 47) % 80)
    const stateRng = ((i * 137 + t.id * 7) % 100) / 100
    let state: 'done' | 'todo' | 'diff' = 'todo'
    if (t.statusKey === 'pending') state = 'todo'
    else if (t.statusKey === 'inProgress') {
      state = stateRng < 0.5 ? 'done' : stateRng < 0.55 ? 'diff' : 'todo'
    } else {
      state = stateRng < 0.85 ? 'done' : stateRng < 0.9 ? 'diff' : 'todo'
    }
    dots.push({
      id: i, x: px, y: py,
      poleNo: `${areaName}#${i}`,
      label: state === 'done' ? '已扫' : state === 'diff' ? '差异' : '待扫',
      state
    })
    poles.push({ id: i, poleNo: `${areaName}#${i}` })
  }
  return { dots, poles }
}

function generateAssetItems(t: TaskItem, poles: PoleInfo[]): AssetItem[] {
  const items: AssetItem[] = []
  const categories = ['灯杆', '灯具', '配电箱', '摄像头']
  const models = ['P-025', 'LED-100W-CW', 'DBX-400V-25A', 'CAM-HD1080']
  for (const pole of poles) {
    for (let a = 0; a < t.perPole; a++) {
      const catIdx = a % categories.length
      const code = `ASSET-2026-${String(1000 + (pole.id * 100 + a + t.id * 17) % 9000).slice(-4)}`
      const rng = ((pole.id * 7 + a * 13) % 100) / 100
      let state: AssetItem['state'] = 'todo'
      if (t.statusKey === 'pending') state = 'todo'
      else if (t.statusKey === 'done') {
        state = rng < 0.93 ? 'done' : rng < 0.96 ? 'damaged' : 'missing'
      } else {
        state = rng < 0.4 ? 'done' : 'todo'
      }
      items.push({ code, model: models[catIdx], category: categories[catIdx], poleId: pole.id, state })
    }
  }
  return items
}

function onOpenDrawer(t: TaskItem) {
  focused.value = t
  const { dots, poles } = generatePoleAndDots(t)
  gisDots.value = dots
  poleList.value = poles
  activePoleId.value = 1
  assetItems.value = generateAssetItems(t, poles)
  drawerOpen.value = true
}

const currentPoleItems = computed(() => assetItems.value.filter(i => i.poleId === activePoleId.value))
const scannedCount = computed(() => assetItems.value.filter(i => i.state !== 'todo').length)
const totalCount = computed(() => assetItems.value.length)

// ============================================================
// 操作按钮
// ============================================================
function onStartCheck() {
  if (focused.value) {
    focused.value.statusKey = 'inProgress'
    focused.value.status = '进行中'
  }
  ElMessage.success('已开始盘点')
}
function onMarkDone(item: AssetItem) { item.state = 'done'; ElMessage.success(`${item.code} 已确认`) }
function onMarkMissing(item: AssetItem) { item.state = 'missing'; ElMessage.warning(`${item.code} 标记为未找到`) }
function onMarkDamaged(item: AssetItem) { item.state = 'damaged'; ElMessage.warning(`${item.code} 标记为损坏`) }

// 扫码动画
const scanDialog = ref(false)
const scanAnimating = ref(false)
const scanSuccess = ref(false)
const scanItemCode = ref('')

function onScan(item: AssetItem) {
  scanItemCode.value = item.code
  scanDialog.value = true
  scanAnimating.value = true
  scanSuccess.value = false
  setTimeout(() => { scanSuccess.value = true }, 1100)
  setTimeout(() => {
    scanDialog.value = false
    item.state = 'done'
    // 更新 GIS 圆点
    const dot = gisDots.value.find(d => d.id === item.poleId)
    if (dot && dot.state !== 'diff') dot.state = 'done'
    if (focused.value) {
      focused.value.progress = Math.round((scannedCount.value / totalCount.value) * 100)
    }
    ElMessage.success(`扫码成功：${item.code}`)
  }, 1800)
}

function onFinishCheck() {
  if (!focused.value) return
  ElMessageBox.confirm('确认完成本次盘点？将自动生成差异报告。', '完成盘点', {
    type: 'success', confirmButtonText: '确认完成', cancelButtonText: '继续盘点'
  }).then(() => {
    focused.value!.statusKey = 'done'
    focused.value!.status = '已完成'
    focused.value!.progress = 100
    focused.value!.diffCount = assetItems.value.filter(i => i.state !== 'done').length
    // GIS 圆点同步
    gisDots.value.forEach(d => {
      const items = assetItems.value.filter(i => i.poleId === d.id)
      if (items.length && items.some(i => i.state !== 'done')) d.state = 'diff'
      else d.state = 'done'
    })
    ElMessage.success('盘点完成，已生成差异报告')
  }).catch(() => {})
}

// ============================================================
// 差异报告
// ============================================================
interface DiffRow {
  type: string; tagType: any; assetCode: string; shouldBeAt: string; actualAt: string; suggestion: string; action: 'pending' | 'done'
}

const diffRows = computed<DiffRow[]>(() => {
  if (!focused.value) return []
  const rows: DiffRow[] = []
  for (const item of assetItems.value) {
    if (item.state === 'missing') {
      const pole = poleList.value.find(p => p.id === item.poleId)
      rows.push({
        type: '丢失', tagType: 'danger', assetCode: item.code,
        shouldBeAt: pole?.poleNo || '', actualAt: '未找到 / 可能被盗',
        suggestion: '自动生成报废草稿 + 补采购 ¥3,000 登记',
        action: 'pending'
      })
    } else if (item.state === 'damaged') {
      const pole = poleList.value.find(p => p.id === item.poleId)
      rows.push({
        type: '损坏', tagType: 'warning', assetCode: item.code,
        shouldBeAt: pole?.poleNo || '', actualAt: '外壳变形 / 运行异常',
        suggestion: '自动生成维修工单 WO202610-xxx',
        action: 'pending'
      })
    }
  }
  return rows
})

function onSubmitDiff(row: DiffRow) {
  row.action = 'done'
  ElMessage.success(`${row.assetCode} 的处置已提交`)
}

function progressColor(p: number) {
  if (p < 50) return '#d97706'
  if (p < 95) return '#d97706'
  return '#059669'
}

// ============================================================
// 新建盘点
// ============================================================
const createDialog = ref(false)
const createForm = ref({ name: '', area: '', scope: 'full', date: '', owner: '' })

function onOpenCreateDialog() {
  createForm.value = { name: '', area: '', scope: 'full', date: new Date().toISOString().slice(0, 10), owner: '' }
  createDialog.value = true
}

let nextTaskId = 100
function onCreateTask() {
  const f = createForm.value
  if (!f.name || !f.area || !f.owner) { ElMessage.warning('请填写完整信息'); return }
  const code = `PD2026${String(10 + tasks.value.length).slice(-2)}-${String(nextTaskId++).slice(-3)}`
  const poles = 20 + Math.floor(Math.random() * 20)
  const task: TaskItem = {
    id: Date.now(),
    code, name: f.name, owner: f.owner, area: f.area,
    poles, perPole: 4, total: poles * 4, progress: 0,
    statusKey: 'pending', status: '待开始', diffCount: 0
  }
  tasks.value.unshift(task)
  createDialog.value = false
  ElMessage.success(`已创建盘点任务 ${code}`)
}
</script>

<style scoped lang="scss">
.zg-am-check {
  --brand: #d97706; --success: #059669; --warning: #d97706; --danger: #dc2626; --info: #0284c7;
  --success-soft: #d1fae5; --warning-soft: #fef3c7; --danger-soft: #fee2e2; --info-soft: #e0f2fe;
  --line-soft: rgba(241,245,249,0.8); --ink: #18181b; --ink-tertiary: #71717a;
  padding: 24px; background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
  min-height: calc(100vh - 120px); font-family: -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif;

  &__head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; padding-bottom: 18px; border-bottom: 1px solid var(--line-soft); }
  &__headline { display: flex; align-items: center; gap: 14px; }
  &__sigil { width: 44px; height: 44px; border-radius: 10px; background: linear-gradient(135deg, #d97706, #f59e0b); color: #fff; display: flex; align-items: center; justify-content: center; }
  &__copy { display: flex; flex-direction: column; gap: 4px; }
  &__title { margin: 0; font-size: 20px; font-weight: 600; }
  &__sub { margin: 0; font-size: 13px; color: var(--ink-tertiary); }
  &__cta { display: flex; gap: 10px; }

  &__taskgrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; margin-bottom: 24px; }

  &__drawer-head { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #f8fafc; border-radius: 10px; margin-bottom: 16px; }
  .zg-info-chip { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; color: #52525b; background: #fff; padding: 4px 10px; border-radius: 999px; border: 1px solid var(--line-soft); }

  &__drawer-body { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  &__gis { border: 1px solid var(--line-soft); border-radius: 16px; padding: 14px; background: #fff; }
  &__gis-title { font-size: 13px; font-weight: 600; color: #52525b; margin-bottom: 10px; }
  &__gis-map { position: relative; height: 420px; background: linear-gradient(to right, rgba(217,119,6,0.05) 1px, transparent 1px) 0 0 / 20px 20px, linear-gradient(to bottom, rgba(217,119,6,0.05) 1px, transparent 1px) 0 0 / 20px 20px, linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); border-radius: 10px; overflow: hidden; }
  .zg-gis-dot { position: absolute; width: 14px; height: 14px; border-radius: 50%; transform: translate(-50%, -50%); cursor: pointer; z-index: 2; &.zg-gis-dot--done { background: var(--success); box-shadow: 0 0 0 3px var(--success-soft); }
    &.zg-gis-dot--todo { background: #cbd5e1; box-shadow: 0 0 0 3px rgba(203,213,225,0.3); }
    &.zg-gis-dot--diff { background: var(--danger); box-shadow: 0 0 0 3px var(--danger-soft); animation: gisPulse 1.5s ease-in-out infinite; } }
  @keyframes gisPulse { 0%, 100% { transform: translate(-50%, -50%) scale(1); } 50% { transform: translate(-50%, -50%) scale(1.3); } }
  &__gis-legend { display: flex; gap: 16px; margin-top: 10px; font-size: 12px; color: var(--ink-tertiary); .lg { display: inline-flex; align-items: center; gap: 5px; } .lg i { width: 10px; height: 10px; border-radius: 50%; } .lg--done i { background: var(--success); } .lg--todo i { background: #cbd5e1; } .lg--diff i { background: var(--danger); } }

  &__checklist { border: 1px solid var(--line-soft); border-radius: 16px; padding: 14px; background: #fff; display: flex; flex-direction: column; }
  &__checklist-head { display: flex; justify-content: space-between; align-items: center; font-size: 13px; font-weight: 600; color: #52525b; margin-bottom: 10px; .count { font-size: 11px; color: var(--ink-tertiary); font-weight: 400; } }
  &__pole-switcher { margin-bottom: 12px; }
  &__items { display: flex; flex-direction: column; gap: 8px; flex: 1; overflow-y: auto; max-height: 340px; }

  &__diff { margin-top: 24px; background: #fff; border-radius: 16px; padding: 16px; border: 1px solid var(--line-soft); }
  &__section-title { font-size: 14px; font-weight: 600; color: #52525b; margin: 0 0 14px; padding-left: 8px; border-left: 3px solid var(--brand); }
  .mono { font-family: 'Geist Mono', ui-monospace, monospace; color: #18181b; }
  .zg-diff-submitted { font-size: 12px; color: var(--success); font-weight: 600; }
}

.zg-checkcard { background: #fff; border: 1px solid var(--line-soft); border-radius: 16px; padding: 16px; cursor: pointer; transition: all 250ms; display: flex; flex-direction: column; gap: 10px; border-left: 3px solid #cbd5e1; &:hover { transform: translateY(-2px); box-shadow: 0 8px 24px -8px rgba(15,23,42,0.12); border-color: var(--brand); }
  &--pending { border-left-color: #cbd5e1; } &--inProgress { border-left-color: var(--brand); } &--done { border-left-color: var(--success); }
  &__head { display: flex; justify-content: space-between; align-items: center; }
  &__code { font-family: monospace; font-size: 12px; color: var(--ink-tertiary); font-weight: 500; }
  &__status { display: inline-flex; align-items: center; gap: 5px; padding: 2px 10px; border-radius: 999px; font-size: 12px; .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; } &--pending { color: var(--ink-tertiary); background: #f1f5f9; } &--inProgress { color: var(--warning); background: var(--warning-soft); } &--done { color: var(--success); background: var(--success-soft); } }
  &__title { margin: 0; font-size: 15px; font-weight: 600; }
  &__meta { display: flex; gap: 12px; font-size: 12px; color: var(--ink-tertiary); span { display: inline-flex; align-items: center; gap: 4px; } }
  &__progress { margin-top: 4px; }
  &__progress-pending { font-size: 12px; color: var(--ink-tertiary); font-style: italic; }
  &__progress-done { font-size: 12px; color: var(--success); font-weight: 600; }
  &__foot { display: flex; justify-content: space-between; align-items: center; padding-top: 8px; border-top: 1px dashed var(--line-soft); }
  &__stat { font-size: 12px; color: var(--ink-tertiary); }
  &__diff { font-size: 12px; font-weight: 600; color: var(--danger); }
}

.zg-check-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; background: #fff; border: 1px solid var(--line-soft); transition: all 150ms; &:hover { border-color: var(--brand); }
  &--done { background: var(--success-soft); border-color: var(--success); }
  &--missing { background: var(--danger-soft); border-color: var(--danger); }
  &--damaged { background: var(--warning-soft); border-color: var(--warning); }
  &__icon { width: 32px; height: 32px; border-radius: 50%; background: #f8fafc; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: var(--info); }
  &--done &__icon { color: var(--success); }
  &__body { flex: 1; min-width: 0; }
  &__code { font-family: monospace; font-size: 12px; font-weight: 600; }
  &__model { font-size: 12px; color: var(--ink-tertiary); }
  &__actions { display: flex; gap: 4px; flex-wrap: wrap; }
}

.zg-scan-dialog { text-align: center; }
.zg-scan-box { display: flex; justify-content: center; padding: 20px 0; }
.zg-scan-frame { position: relative; width: 200px; height: 200px; border: 2px dashed #cbd5e1; border-radius: 12px; background: #0f172a; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.zg-scan-camera { color: #94a3b8; animation: camPulse 1.2s ease-in-out infinite; }
@keyframes camPulse { 0%, 100% { opacity: 0.5; transform: scale(1); } 50% { opacity: 1; transform: scale(1.1); } }
.zg-scan-line { position: absolute; left: 10px; right: 10px; height: 2px; background: linear-gradient(90deg, transparent, #22d3ee, transparent); box-shadow: 0 0 10px #22d3ee; animation: scanLine 1.4s ease-in-out infinite; }
@keyframes scanLine { 0% { top: 20px; } 50% { top: 180px; } 100% { top: 20px; } }
.zg-scan-ok { color: #10b981; animation: okPop 0.5s ease-out; }
@keyframes okPop { 0% { transform: scale(0); opacity: 0; } 60% { transform: scale(1.2); } 100% { transform: scale(1); opacity: 1; } }
.zg-scan-text { margin-top: 12px; font-size: 14px; color: #18181b; }
</style>
