<template>
  <section class="zg-loopcluster">
    <header class="zg-loopcluster__head">
      <div class="zg-loopcluster__sigil">
        <el-icon :size="24"><Connection /></el-icon>
      </div>
      <div class="zg-loopcluster__copy">
        <h1 class="zg-loopcluster__title">链路分组</h1>
        <p class="zg-loopcluster__subtitle">管廊照明链路分组管理与配置</p>
      </div>
      <div class="zg-loopcluster__actions">
        <el-button type="danger" @click="onBatchRetire">
          <el-icon :size="16"><Delete /></el-icon>
          批量删除
        </el-button>
        <el-button type="primary" @click="clusterForm.openComposer()">
          <el-icon :size="16"><Plus /></el-icon>
          新增分组
        </el-button>
      </div>
    </header>

    <div class="zg-filterband">
      <div class="zg-filterband__fields">
        <el-select v-model="clusterCtl.filterLexicon" placeholder="展厅隧道" style="width: 150px;">
          <el-option label="展厅隧道" value="展厅隧道" />
        </el-select>
        <el-button type="primary" @click="clusterCtl.onFilterApply()">
          <el-icon :size="14"><Search /></el-icon>
          查询
        </el-button>
        <el-button @click="clusterCtl.onFilterReset()">
          <el-icon :size="14"><RefreshLeft /></el-icon>
          重置
        </el-button>
      </div>
    </div>

    <div class="zg-tablewrap">
      <el-table :data="clusterCtl.pagedRows" border class="zg-datatable">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="序号" width="60" align="center" />
        <el-table-column prop="name" label="分组名称" min-width="120" />
        <el-table-column prop="circuitCount" label="包含链路数" width="120" align="center" />
        <el-table-column prop="deviceCount" label="关联设备数" width="120" align="center" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === '正常' ? 'success' : 'danger'">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="150" />
        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="text" size="small" @click="clusterInspector.openInspector(row)">查看详情</el-button>
            <el-button type="text" size="small" @click="clusterForm.openReviser(row)">修改</el-button>
            <el-button type="text" size="small" style="color: #f56c6c;" @click="onClusterRetire(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="zg-pagerbar">
      <el-pagination
        v-model:current-page="clusterCtl.pagingCursor"
        v-model:page-size="clusterCtl.pageSpan"
        :total="clusterCtl.totalRows"
        :page-sizes="[10, 15, 20, 30]"
        layout="prev, pager, next, jumper, ->, sizes, total"
        background
      />
    </div>

    <el-drawer
      v-model="clusterInspector.drawerOpen"
      :title="'分组详情 · ' + (clusterInspector.focusedRecord?.name || '')"
      direction="rtl"
      size="600px"
    >
      <div v-if="clusterInspector.focusedRecord" class="zg-inspector">
        <div class="zg-inspector__head">
          <div class="zg-inspector__glyph">
            <el-icon :size="32"><Connection /></el-icon>
          </div>
          <div class="zg-inspector__meta">
            <h2 class="zg-inspector__name">{{ clusterInspector.focusedRecord.name }}</h2>
            <el-tag :type="clusterInspector.focusedRecord.status === '正常' ? 'success' : 'danger'">
              {{ clusterInspector.focusedRecord.status }}
            </el-tag>
          </div>
        </div>
        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">分组信息</h4>
          <dl class="zg-inspector__dl">
            <dt>包含链路数</dt>
            <dd>{{ clusterInspector.focusedRecord.circuitCount }} 条</dd>
            <dt>关联设备数</dt>
            <dd>{{ clusterInspector.focusedRecord.deviceCount }} 台</dd>
            <dt>创建时间</dt>
            <dd>{{ clusterInspector.focusedRecord.createTime }}</dd>
          </dl>
        </div>
        <div class="zg-inspector__actions">
          <el-button @click="clusterInspector.closeInspector()">关闭</el-button>
          <el-button type="primary" @click="clusterForm.openReviser(clusterInspector.focusedRecord)">编辑</el-button>
        </div>
      </div>
    </el-drawer>

    <el-drawer
      v-model="clusterForm.drawerOpen"
      :title="clusterForm.editMode === 'compose' ? '创建分组' : '修改分组'"
      direction="rtl"
      size="500px"
    >
      <el-form :model="clusterForm.draftPayload" label-width="100px" class="zg-draftform">
        <el-form-item label="*分组名称" required>
          <el-input v-model="clusterForm.draftPayload.name" placeholder="请输入分组名称" />
        </el-form-item>
        <el-form-item label="分组描述">
          <el-input v-model="clusterForm.draftPayload.description" type="textarea" :rows="3" placeholder="请输入分组描述" />
        </el-form-item>
        <el-form-item label="关联链路">
          <el-select v-model="clusterForm.draftPayload.circuits" multiple style="width: 100%;">
            <el-option label="照明链路1" value="HL-001" />
            <el-option label="照明链路2" value="HL-002" />
            <el-option label="照明链路3" value="HL-003" />
            <el-option label="应急链路" value="HL-004" />
          </el-select>
        </el-form-item>
        <el-form-item label="在役">
          <el-switch v-model="clusterForm.draftPayload.status" active-value="正常" inactive-value="停用" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="zg-draftform__foot">
          <el-button @click="clusterForm.onDraftDiscard()">取消</el-button>
          <el-button type="primary" @click="onCommitDraft">确定</el-button>
        </div>
      </template>
    </el-drawer>
  </section>
</template>

<script setup>
import {
  Connection,
  Plus,
  Delete,
  Search,
  RefreshLeft
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { usePresetTable } from '@/shared/composables/usePresetTable'
import { useFormDraft } from '@/shared/composables/useFormDraft'
import { useDrawerInspector } from '@/shared/composables/useDrawerInspector'

const initialClusters = [
  { id: 1, name: '入口段照明组', circuitCount: 2, deviceCount: 48, status: '正常', createTime: '2024-05-18 10:00' },
  { id: 2, name: '基本段照明组', circuitCount: 4, deviceCount: 96, status: '正常', createTime: '2024-05-18 10:05' },
  { id: 3, name: '出口段照明组', circuitCount: 2, deviceCount: 48, status: '正常', createTime: '2024-05-18 10:10' },
  { id: 4, name: '应急照明组', circuitCount: 1, deviceCount: 24, status: '正常', createTime: '2024-05-18 10:15' }
]

const clusterCtl = usePresetTable(null, {
  defaultPageSpan: 10,
  initialData: initialClusters
})

const clusterForm = useFormDraft(
  {
    name: '',
    description: '',
    circuits: [],
    status: '正常'
  },
  {
    submitApi: async (draft, { mode, origin }) => {
      if (mode === 'compose') {
        clusterCtl.appendRecord({
          ...draft,
          id: Date.now(),
          circuitCount: draft.circuits?.length || 0,
          deviceCount: (draft.circuits?.length || 0) * 24,
          createTime: new Date().toLocaleString('zh-CN')
        })
        ElMessage.success('分组已创建')
      } else {
        clusterCtl.reviseRecord(origin.id, draft)
        ElMessage.success('分组已更新')
      }
      return { ok: true }
    }
  }
)

const clusterInspector = useDrawerInspector({ size: '600px', direction: 'rtl' })

const onClusterRetire = (row) => {
  ElMessageBox.confirm(
    `确认删除分组 "${row.name}" 吗？`,
    '删除确认',
    { type: 'warning', confirmButtonClass: 'el-button--danger' }
  ).then(() => {
    clusterCtl.retireRecord(row.id)
    ElMessage.success('分组已删除')
  })
}

const onBatchRetire = () => {
  ElMessage.info('批量删除功能开发中')
}

const onCommitDraft = async () => {
  if (!clusterForm.draftPayload.name) {
    ElMessage.warning('请填写分组名称')
    return
  }
  await clusterForm.onDraftCommit()
}
</script>

<style scoped lang="scss">
.zg-loopcluster {
  padding: 24px;
  background: var(--zg-gradient-surface);
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 22px;
    background: var(--zg-surface-card);
    border-radius: var(--zg-radius-lg);
    border: 1px solid var(--zg-line-brand);
    box-shadow: var(--zg-shadow-card);
  }

  &__sigil {
    width: 44px;
    height: 44px;
    border-radius: var(--zg-radius-md);
    background: var(--zg-gradient-primary);
    color: #fff;
    display: grid;
    place-items: center;
    box-shadow: var(--zg-shadow-btn);
  }

  &__copy {
    flex: 1;
    margin-left: 14px;
  }

  &__title {
    font-size: 20px;
    font-weight: 600;
    color: var(--zg-ink-primary);
    margin: 0;
  }

  &__subtitle {
    font-size: 13px;
    color: var(--zg-ink-tertiary);
    margin: 4px 0 0;
  }

  &__actions {
    display: flex;
    gap: 10px;
  }
}

.zg-filterband {
  background: var(--zg-surface-card);
  padding: 16px 20px;
  border-radius: var(--zg-radius-lg);
  border: 1px solid var(--zg-line-soft);
  box-shadow: var(--zg-shadow-card);

  &__fields {
    display: flex;
    gap: 12px;
    align-items: center;
  }
}

.zg-tablewrap {
  background: var(--zg-surface-card);
  border-radius: var(--zg-radius-lg);
  border: 1px solid var(--zg-line-soft);
  overflow: hidden;
  box-shadow: var(--zg-shadow-card);
}

.zg-datatable {
  width: 100%;
  --el-table-header-bg-color: var(--zg-surface-muted);
  --el-table-header-text-color: var(--zg-ink-secondary);
  --el-table-row-hover-bg-color: var(--zg-brand-tint-50);
  --el-table-border-color: var(--zg-line-soft);
}

.zg-pagerbar {
  display: flex;
  justify-content: flex-end;
  padding: 14px 4px 4px;
}

.zg-inspector {
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  &__head {
    display: flex;
    gap: 16px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--zg-line-soft);
  }

  &__glyph {
    width: 64px;
    height: 64px;
    border-radius: var(--zg-radius-lg);
    display: grid;
    place-items: center;
    background: var(--zg-brand-tint-50);
    color: var(--zg-brand-primary);
    border: 1px solid var(--zg-brand-tint-100);
  }

  &__name {
    font-size: 18px;
    font-weight: 600;
    color: var(--zg-ink-primary);
    margin: 0 0 8px;
  }

  &__section-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--zg-ink-primary);
    margin: 0 0 12px;
    padding-left: 8px;
    border-left: 3px solid var(--zg-brand-primary);
  }

  &__dl {
    display: grid;
    grid-template-columns: 100px 1fr;
    gap: 10px;
    margin: 0;

    dt {
      font-size: 13px;
      color: var(--zg-ink-tertiary);
      font-weight: 500;
    }

    dd {
      font-size: 13px;
      color: var(--zg-ink-primary);
      margin: 0;
    }
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding-top: 16px;
    border-top: 1px solid var(--zg-line-soft);
  }
}

.zg-draftform {
  padding: 8px 12px;

  &__foot {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}
</style>