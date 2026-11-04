<!--
  智光云枢 · 运维组织 · 组织架构 + 真人员增删改 + 技能筛选
-->
<template>
  <section class="zg-ops-orgchart">
    <header class="zg-ops-orgchart__head">
      <div class="zg-ops-orgchart__headline">
        <div class="zg-ops-orgchart__sigil"><el-icon :size="22"><User /></el-icon></div>
        <div class="zg-ops-orgchart__copy">
          <h1 class="zg-ops-orgchart__title">组织架构 · 人员台账</h1>
          <p class="zg-ops-orgchart__sub">长沙光智照明 · 在册 {{ staff.length }} 人 · 4 大部门 · 8 个班组</p>
        </div>
      </div>
      <div class="zg-ops-orgchart__cta">
        <el-button :icon="Filter" @click="activeSkill = ''">清除技能筛选</el-button>
        <el-button type="primary" :icon="Plus" @click="openCreate"><el-icon><Plus /></el-icon>新增人员</el-button>
      </div>
    </header>

    <div class="zg-ops-orgchart__body">
      <!-- 左：组织树 + 技能筛选标签 -->
      <aside class="zg-ops-orgchart__tree">
        <div class="zg-ops-orgchart__treehead">
          <el-input v-model="treeFilter" placeholder="搜索部门/班组" clearable size="default">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </div>
        <el-scrollbar height="calc(100% - 52px)">
          <el-tree
            ref="treeRef"
            :data="orgTree"
            :props="{ label: 'label', children: 'children' }"
            node-key="id"
            default-expand-all
            draggable
            :filter-node-method="filterNode"
            :expand-on-click-node="false"
            @node-click="treeNodeClick"
            class="zg-ops-orgchart__eltree"
          >
            <template #default="{ data }">
              <span class="orgnode" :class="data.type">
                <el-icon v-if="data.type === 'root'" class="orgnode__icon"><Collection /></el-icon>
                <el-icon v-else-if="data.type === 'dept'" class="orgnode__icon"><FolderOpened /></el-icon>
                <el-icon v-else-if="data.type === 'team'" class="orgnode__icon"><Setting /></el-icon>
                <el-icon v-else class="orgnode__icon"><Edit /></el-icon>
                <span class="orgnode__label">{{ data.label }}</span>
                <span v-if="data.count" class="orgnode__count">{{ data.count }}</span>
              </span>
            </template>
          </el-tree>

          <!-- 技能标签真筛选 -->
          <div class="skill-filter-box">
            <div class="skill-filter-box__title">🎯 技能标签筛选</div>
            <div class="skill-filter-box__desc">
              点击标签筛选有该技能的人
              <span v-if="activeSkill" class="active-badge">当前：{{ activeSkill }} ×</span>
            </div>
            <div class="skill-filter-box__tags">
              <el-tag
                v-for="s in allSkills"
                :key="s"
                :type="activeSkill === s ? 'warning' : 'info'"
                :effect="activeSkill === s ? 'dark' : 'plain'"
                class="skilltag"
                @click="activeSkill = activeSkill === s ? '' : s"
              >{{ s }}</el-tag>
            </div>
          </div>
        </el-scrollbar>
      </aside>

      <!-- 右：人员列表（真 reactive 数据） -->
      <div class="zg-ops-orgchart__table">
        <div class="zg-ops-orgchart__tablehead">
          <div class="zg-ops-orgchart__ttitle">
            <el-icon :size="18"><User /></el-icon>
            <span>
              {{ currentNodeName }} · {{ filteredPersonnel.length }} 人
              <span v-if="activeSkill" class="skill-filter-indicator">（已筛选技能：{{ activeSkill }}）</span>
            </span>
          </div>
          <div class="zg-ops-orgchart__tactions">
            <el-input v-model="keyword" placeholder="姓名/手机" clearable size="default" style="width:220px">
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
            <el-select v-model="statusFilter" placeholder="状态" clearable size="default" style="width:130px">
              <el-option v-for="s in statusOptions" :key="s.value" :label="s.label" :value="s.value" />
            </el-select>
          </div>
        </div>

        <el-table :data="pagedPersonnel" stripe class="zg-ops-orgchart__eltable" height="calc(100% - 110px)">
          <el-table-column prop="id" label="工号" width="130">
            <template #default="{ row }"><span class="empid">OP-{{ String(row.id).padStart(5, '0') }}</span></template>
          </el-table-column>
          <el-table-column prop="name" label="姓名" width="110">
            <template #default="{ row }">
              <div class="nameline">
                <span class="avatar">{{ row.name.charAt(0) }}</span>
                <span>{{ row.name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="phone" label="手机" width="130" />
          <el-table-column label="技能标签" min-width="220">
            <template #default="{ row }">
              <div class="skilltags">
                <el-tag
                  v-for="s in row.skills"
                  :key="s"
                  size="small"
                  :type="activeSkill === s ? 'warning' : 'info'"
                  :effect="activeSkill === s ? 'dark' : 'plain'"
                  class="skilltag"
                >{{ s }}</el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="当前状态" width="130">
            <template #default="{ row }">
              <span class="statuschip" :class="'statuschip--' + row.status">
                <span class="statusdot"></span>{{ statusText(row.status) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="GPS 位置" min-width="180">
            <template #default="{ row }">
              <div class="gpsline">
                <el-icon :size="14"><Position /></el-icon>
                <span>{{ row.gps.lat.toFixed(4) }},{{ row.gps.lng.toFixed(4) }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="资质" min-width="180">
            <template #default="{ row }">
              <div class="certchips">
                <el-tag
                  v-for="(v, k) in row.certs"
                  :key="k"
                  size="small"
                  :type="v.valid ? 'success' : 'danger'"
                  effect="light"
                >{{ certLabel(k) }}{{ v.valid ? '' : '(过期)' }}</el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <div class="rowactions">
                <el-button link type="primary" size="small" @click="onEdit(row)">编辑</el-button>
                <el-button link type="success" size="small" @click="onTrack(row)">定位</el-button>
                <el-button link type="danger" size="small" @click="onRemove(row)">删除</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <div class="zg-ops-orgchart__pager">
          <el-pagination
            v-model:current-page="page"
            v-model:page-size="pageSize"
            :total="filteredPersonnel.length"
            :page-sizes="[10, 15, 20]"
            layout="total, sizes, prev, pager, next"
            background
          />
        </div>
      </div>
    </div>

    <!-- 新增/编辑 Drawer（真写回 staff） -->
    <el-drawer v-model="formOpen" :title="formMode === 'edit' ? '编辑人员' : '新增人员'" direction="rtl" size="480px">
      <el-form :model="form" label-width="90px" size="default">
        <el-form-item label="姓名" required>
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="手机">
          <el-input v-model="form.phone" placeholder="如 138****0001" />
        </el-form-item>
        <el-form-item label="归属班组">
          <el-select v-model="form.teamId" placeholder="选择班组" style="width: 100%">
            <el-option v-for="t in teamOptions" :key="t.id" :label="t.label" :value="t.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="技能">
          <el-select v-model="form.skills" multiple placeholder="选择技能" style="width: 100%">
            <el-option v-for="s in allSkills" :key="s" :label="s" :value="s" />
          </el-select>
        </el-form-item>
        <el-form-item label="GPS 纬度">
          <el-input-number v-model="form.gps.lat" :precision="6" :step="0.0001" :min="28.1" :max="28.3" style="width: 100%" />
        </el-form-item>
        <el-form-item label="GPS 经度">
          <el-input-number v-model="form.gps.lng" :precision="6" :step="0.0001" :min="112.85" :max="113.0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="当前状态">
          <el-select v-model="form.status" style="width: 100%">
            <el-option v-for="s in statusOptions" :key="s.value" :label="s.label" :value="s.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formOpen = false">取消</el-button>
        <el-button type="primary" @click="commitForm">保存</el-button>
      </template>
    </el-drawer>
  </section>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Plus, Search, Position, Collection, FolderOpened, Setting, Edit, Filter } from '@element-plus/icons-vue'
import { staff } from '@/shared/stores/opsOrgStore'

// ===== 组织树 =====
const orgTree = ref([
  {
    id: 'root', type: 'root', label: '长沙光智照明有限公司', count: String(staff.length),
    children: [
      {
        id: 'dept-ops', type: 'dept', label: '运维部', count: String(staff.filter((s) => s.teamId.startsWith('team')).length),
        children: [
          { id: 'team-1', type: 'team', label: '一分队（先导路/麓谷）', chief: '张建国', count: String(staff.filter((s) => s.teamId === 'team-1').length) },
          { id: 'team-2', type: 'team', label: '二分队（梅溪湖/金星大道）', chief: '李明', count: String(staff.filter((s) => s.teamId === 'team-2').length) },
          { id: 'team-3', type: 'team', label: '隧道专项组', chief: '王强', count: String(staff.filter((s) => s.teamId === 'team-3').length) }
        ]
      },
      { id: 'dept-eng', type: 'dept', label: '工程部', chief: '赵刚', count: '12' },
      { id: 'dept-purchase', type: 'dept', label: '采购仓储部', chief: '刘芳', count: '6' },
      { id: 'dept-finance', type: 'dept', label: '财务部', chief: '陈敏', count: '4' }
    ]
  }
])

const treeRef = ref(null)
const treeFilter = ref('')
watch(treeFilter, (val) => treeRef.value?.filter(val))
const filterNode = (value, data) => {
  if (!value) return true
  return (data.label || '').includes(value) || (data.chief || '').includes(value)
}

const selectedId = ref('root')
const treeNodeClick = (data) => { selectedId.value = data.id }
const currentNodeName = computed(() => {
  const find = (nodes) => {
    for (const n of nodes) {
      if (n.id === selectedId.value) return n.label
      if (n.children) { const r = find(n.children); if (r) return r }
    }
    return ''
  }
  return find(orgTree.value) || '全员'
})

// ===== 技能筛选（真筛选） =====
const allSkills = computed(() => {
  const set = new Set()
  staff.forEach((s) => s.skills.forEach((sk) => set.add(sk)))
  return Array.from(set).sort()
})
const activeSkill = ref('')

// ===== 状态 =====
const statusOptions = [
  { value: 'idle', label: '空闲' },
  { value: 'working', label: '维修中' },
  { value: 'patrol', label: '巡检中' },
  { value: 'offDuty', label: '下班' },
  { value: 'leave', label: '请假' }
]
const statusText = (s) => ({ idle: '空闲', working: '维修中', patrol: '巡检中', offDuty: '下班', leave: '请假' }[s] || s)

// ===== 搜索 / 过滤 / 分页 =====
const keyword = ref('')
const statusFilter = ref('')
const page = ref(1)
const pageSize = ref(10)

const filteredPersonnel = computed(() => {
  let list = [...staff]

  // 选中节点过滤
  if (selectedId.value !== 'root') {
    if (selectedId.value.startsWith('team-')) {
      list = list.filter((p) => p.teamId === selectedId.value)
    } else if (selectedId.value.startsWith('dept-ops')) {
      const opsTeams = ['team-1', 'team-2', 'team-3']
      list = list.filter((p) => opsTeams.includes(p.teamId))
    }
  }

  // 技能筛选
  if (activeSkill.value) list = list.filter((p) => p.skills.includes(activeSkill.value))
  // 关键词
  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    list = list.filter((p) => p.name.includes(kw) || p.phone.includes(kw))
  }
  if (statusFilter.value) list = list.filter((p) => p.status === statusFilter.value)
  return list
})

const pagedPersonnel = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredPersonnel.value.slice(start, start + pageSize.value)
})
watch([filteredPersonnel, pageSize], () => { page.value = 1 })

// ===== 资质显示 =====
const certLabel = (k) => ({ dengao: '登高', dengong: '电工', xianjin: '380V', youxianspace: '有限空间', hg: '焊工' }[k] || k)

// ===== 增删改 Drawer =====
const formOpen = ref(false)
const formMode = ref('create')
const form = ref({
  id: 0, name: '', phone: '', teamId: 'team-1', skills: [],
  gps: { lat: 28.2275, lng: 112.9380 }, status: 'idle',
  teamPath: ['运维部', '一分队']
})

const teamOptions = [
  { id: 'team-1', label: '运维部 / 一分队' },
  { id: 'team-2', label: '运维部 / 二分队' },
  { id: 'team-3', label: '运维部 / 隧道专项组' }
]

const teamPathMap = {
  'team-1': ['运维部', '一分队'],
  'team-2': ['运维部', '二分队'],
  'team-3': ['运维部', '隧道专项组']
}

const openCreate = () => {
  formMode.value = 'create'
  form.value = {
    id: 0, name: '', phone: '', teamId: 'team-1', skills: [],
    gps: { lat: 28.2275, lng: 112.9380 }, status: 'idle',
    teamPath: ['运维部', '一分队']
  }
  formOpen.value = true
}

const onEdit = (row) => {
  formMode.value = 'edit'
  form.value = {
    id: row.id, name: row.name, phone: row.phone, teamId: row.teamId,
    skills: [...row.skills], gps: { ...row.gps }, status: row.status,
    teamPath: row.teamPath
  }
  formOpen.value = true
}

const commitForm = () => {
  if (!form.value.name.trim()) {
    ElMessage.warning('请填写姓名')
    return
  }
  const path = teamPathMap[form.value.teamId] || ['运维部', '一分队']
  if (formMode.value === 'create') {
    const nextId = Math.max(...staff.map((s) => s.id), 0) + 1
    const entry = {
      id: nextId,
      name: form.value.name,
      phone: form.value.phone || '138****0000',
      status: form.value.status,
      skills: form.value.skills.length ? form.value.skills : ['换LED'],
      gps: { ...form.value.gps },
      load: 0, currentOrderId: null,
      color: ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'][nextId % 6],
      teamId: form.value.teamId, teamPath: path,
      certs: {}
    }
    staff.push(entry)
    ElMessage.success(`✅ 已新增人员 ${entry.name}`)
  } else {
    const idx = staff.findIndex((s) => s.id === form.value.id)
    if (idx >= 0) {
      staff[idx].name = form.value.name
      staff[idx].phone = form.value.phone
      staff[idx].skills = [...form.value.skills]
      staff[idx].gps = { ...form.value.gps }
      staff[idx].status = form.value.status
      staff[idx].teamId = form.value.teamId
      staff[idx].teamPath = path
      ElMessage.success(`✅ 已保存 ${staff[idx].name} 的修改`)
    }
  }
  formOpen.value = false
}

const onRemove = (row) => {
  ElMessageBox.confirm(`确认从运维组织中移除 ${row.name}？此操作不可撤销。`, '操作确认', { type: 'warning' })
    .then(() => {
      const idx = staff.findIndex((s) => s.id === row.id)
      if (idx >= 0) staff.splice(idx, 1)
      ElMessage.success(`✅ 已移除 ${row.name}`)
    })
    .catch(() => {})
}

const onTrack = (row) => {
  ElMessage.success(`📍 已定位 ${row.name} 到地图：${row.gps.lat.toFixed(4)},${row.gps.lng.toFixed(4)}`)
}
</script>

<style scoped lang="scss">
.zg-ops-orgchart {
  padding: 24px;
  display: flex; flex-direction: column;
  height: calc(100vh - 120px); gap: 16px;

  &__head { display: flex; justify-content: space-between; align-items: center; padding-bottom: 14px; border-bottom: 1px solid var(--zg-line-soft); }
  &__headline { display: flex; align-items: center; gap: 14px; }
  &__sigil {
    width: 44px; height: 44px; border-radius: var(--zg-radius-md);
    background: var(--zg-gradient-primary); color: #fff;
    display: flex; align-items: center; justify-content: center; box-shadow: var(--zg-shadow-btn);
  }
  &__copy { display: flex; flex-direction: column; gap: 4px; }
  &__title { margin: 0; font-size: 20px; font-weight: 600; }
  &__sub { margin: 0; font-size: 13px; color: var(--zg-ink-tertiary); }
  &__body { display: grid; grid-template-columns: 300px 1fr; gap: 16px; flex: 1; min-height: 0; }

  &__tree,
  &__table {
    background: var(--zg-surface-card); border: 1px solid var(--zg-line-soft);
    border-radius: var(--zg-radius-lg); padding: 14px;
    box-shadow: var(--zg-shadow-card); display: flex; flex-direction: column; overflow: hidden;
  }
  &__treehead { margin-bottom: 10px; }
  &__eltree {
    flex: 1;
    :deep(.el-tree-node__content) { height: 34px; border-radius: var(--zg-radius-sm); }
    :deep(.el-tree-node.is-current > .el-tree-node__content) {
      background: var(--zg-brand-tint-50); color: var(--zg-brand-primary);
    }
  }
  &__tablehead { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  &__ttitle { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 600; color: var(--zg-ink-primary); }
  &__tactions { display: flex; gap: 10px; }
  &__pager { margin-top: 12px; display: flex; justify-content: flex-end; }
}

.orgnode {
  display: flex; align-items: center; gap: 6px; width: 100%;
  &.root .orgnode__icon { color: var(--zg-brand-primary); }
  &.dept .orgnode__icon { color: var(--zg-info); }
  &.team .orgnode__icon { color: var(--zg-success); }
  &__label { flex: 1; font-size: 13px; }
  &__count { font-size: 11px; color: var(--zg-ink-tertiary); background: var(--zg-surface-muted); padding: 1px 8px; border-radius: var(--zg-radius-pill); }
}

.skill-filter-box {
  margin-top: 16px; padding-top: 14px; border-top: 1px dashed var(--zg-line-soft);
  &__title { font-size: 12px; font-weight: 600; color: var(--zg-ink-secondary); margin-bottom: 6px; }
  &__desc { font-size: 11px; color: var(--zg-ink-tertiary); margin-bottom: 10px; line-height: 1.5; }
  &__tags { display: flex; flex-wrap: wrap; gap: 6px; }
}
.skilltag { cursor: pointer; transition: all 0.15s; &:hover { transform: scale(1.05); } }
.active-badge { color: var(--zg-brand-primary); font-weight: 600; margin-left: 4px; }
.skill-filter-indicator { font-size: 12px; color: var(--zg-warning); font-weight: 500; }

.empid { font-family: var(--zg-font-mono); font-size: 12px; background: var(--zg-surface-muted); padding: 2px 8px; border-radius: var(--zg-radius-sm); color: var(--zg-ink-secondary); }
.nameline { display: flex; align-items: center; gap: 8px; }
.avatar {
  width: 28px; height: 28px; border-radius: 50%;
  background: var(--zg-gradient-primary); color: #fff;
  display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600;
}
.skilltags { display: flex; gap: 4px; flex-wrap: wrap; }
.statuschip {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 3px 10px; border-radius: var(--zg-radius-pill);
  font-size: 12px; font-weight: 500;
  .statusdot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
  &--idle { color: var(--zg-info); background: var(--zg-info-soft); }
  &--working { color: var(--zg-warning); background: var(--zg-warning-soft); }
  &--patrol { color: #8b5cf6; background: #ede9fe; }
  &--offDuty { color: var(--zg-ink-tertiary); background: var(--zg-surface-muted); }
  &--leave { color: var(--zg-brand-primary); background: var(--zg-brand-tint-50); }
}
.gpsline { display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--zg-ink-secondary); }
.rowactions { display: flex; gap: 4px; }
.certchips { display: flex; gap: 4px; flex-wrap: wrap; }
</style>
