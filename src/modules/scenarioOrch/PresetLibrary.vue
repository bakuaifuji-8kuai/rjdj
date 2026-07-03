<template>
  <section class="zg-vault">
    <header class="zg-vault__head">
      <div class="zg-vault__headline">
        <div class="zg-vault__sigil">
          <el-icon :size="22"><Grid /></el-icon>
        </div>
        <div class="zg-vault__copy">
          <h1 class="zg-vault__title">预案库</h1>
          <p class="zg-vault__sub">预置情景预案池 · 共 {{ tableCtl.totalRows }} 条</p>
        </div>
      </div>
      <div class="zg-vault__cta">
        <el-button type="primary" @click="presetForm.openComposer()">
          <el-icon><Plus /></el-icon>
          <span>新建预案</span>
        </el-button>
      </div>
    </header>

    <div class="zg-filterband">
      <div class="zg-filterband__fields">
        <el-select v-model="tableCtl.typeBucket" placeholder="预案类型" clearable class="zg-filterband__select">
          <el-option label="定时预案" value="定时预案" />
          <el-option label="手动预案" value="手动预案" />
        </el-select>
        <el-input
          v-model="tableCtl.filterLexicon"
          placeholder="检索预案名称"
          clearable
          class="zg-filterband__search"
          @keyup.enter="tableCtl.onFilterApply()"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="tableCtl.onFilterApply()">检索</el-button>
        <el-button @click="tableCtl.onFilterReset()">重置</el-button>
      </div>
    </div>

    <div class="zg-cardgrid">
      <article
        v-for="(preset, index) in tableCtl.pagedRows"
        :key="preset?.id || index"
        class="zg-presetcard"
        @click="presetInspector.openInspector(preset)"
      >
        <div class="zg-presetcard__head">
          <div class="zg-presetcard__glyph">
            <el-icon :size="26"><Sunrise /></el-icon>
          </div>
          <span class="zg-presetcard__tag" :class="preset?.status === '在役' ? 'online' : 'idle'">
            {{ preset?.status }}
          </span>
        </div>
        <div class="zg-presetcard__body">
          <h3 class="zg-presetcard__name">{{ preset?.name }}</h3>
          <p class="zg-presetcard__category">{{ preset?.type }}</p>
          <p class="zg-presetcard__brief">{{ preset?.description }}</p>
        </div>
        <div class="zg-presetcard__foot">
          <span class="zg-presetcard__time">{{ preset?.createTime }}</span>
          <div class="zg-presetcard__actions">
            <el-button link type="primary" size="small" @click.stop="onTriggerPreset(preset)">投递</el-button>
            <el-button link type="primary" size="small" @click.stop="presetForm.openReviser(preset)">修订</el-button>
            <el-button link type="danger" size="small" @click.stop="onRetirePreset(preset)">废止</el-button>
          </div>
        </div>
      </article>
    </div>

    <div class="zg-pagerbar">
      <el-pagination
        v-model:current-page="tableCtl.pagingCursor"
        v-model:page-size="tableCtl.pageSpan"
        :total="tableCtl.totalRows"
        :page-sizes="[8, 12, 16]"
        layout="prev, pager, next, jumper, ->, sizes, total"
        background
      />
    </div>

    <el-drawer
      v-model="presetInspector.drawerOpen"
      :title="'预案详情 · ' + (presetInspector.focusedRecord?.name || '')"
      direction="rtl"
      size="640px"
    >
      <div v-if="presetInspector.focusedRecord" class="zg-inspector">
        <h2 class="zg-inspector__name">{{ presetInspector.focusedRecord.name }}</h2>
        <p>{{ presetInspector.focusedRecord.description }}</p>
        <div class="zg-inspector__actions">
          <el-button @click="presetInspector.closeInspector()">关闭</el-button>
          <el-button type="primary" @click="onTriggerPreset(presetInspector.focusedRecord)">立即投递</el-button>
        </div>
      </div>
    </el-drawer>

    <el-drawer
      v-model="presetForm.drawerOpen"
      :title="presetForm.editMode === 'compose' ? '新建预案' : '修订预案'"
      direction="rtl"
      size="560px"
    >
      <el-form :model="presetForm.draftPayload" label-width="96px" class="zg-draftform">
        <el-form-item label="预案名称" required>
          <el-input v-model="presetForm.draftPayload.name" placeholder="请输入预案名称" />
        </el-form-item>
        <el-form-item label="预案类型" required>
          <el-select v-model="presetForm.draftPayload.type" placeholder="请选择" style="width: 100%">
            <el-option label="定时预案" value="定时预案" />
            <el-option label="手动预案" value="手动预案" />
          </el-select>
        </el-form-item>
        <el-form-item label="预案描述">
          <el-input v-model="presetForm.draftPayload.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="zg-draftform__foot">
          <el-button @click="presetForm.onDraftDiscard()">取消</el-button>
          <el-button type="primary" @click="onCommitDraft">确定</el-button>
        </div>
      </template>
    </el-drawer>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { Grid, Plus, Search, Sunrise } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { usePresetTable } from '@/shared/composables/usePresetTable'
import { useFormDraft } from '@/shared/composables/useFormDraft'
import { useDrawerInspector } from '@/shared/composables/useDrawerInspector'
import { usePageLifecycle } from '@/shared/composables/usePageLifecycle'

usePageLifecycle({
  pageTitle: '预案库',
  moduleName: 'scenarioOrch'
})

const initialPresets = [
  { id: 1, name: '晨曦唤醒·主干道', type: '定时预案', description: '清晨日出时渐进式下调主干道光源亮度', status: '在役', createTime: '2024-01-10' },
  { id: 2, name: '暮色点亮·次干道', type: '定时预案', description: '傍晚日落时段自动激活次干道全量光源', status: '在役', createTime: '2024-01-12' },
  { id: 3, name: '深夜节能·全域', type: '手动预案', description: '夜间低峰期降低全域光源亮度至30%', status: '在役', createTime: '2024-02-15' },
  { id: 4, name: '佳节灯饰·CBD', type: '手动预案', description: '节假日增强中央商务区景观照明效果', status: '停用', createTime: '2024-03-01' },
  { id: 5, name: '应急全亮·疏散通道', type: '手动预案', description: '紧急情况触发全功率照明', status: '在役', createTime: '2024-04-05' },
  { id: 6, name: '寅时抑能·支路', type: '定时预案', description: '凌晨2-5点降低支路灯源功率至40%', status: '在役', createTime: '2024-05-10' }
]

const tableCtl = usePresetTable(null, {
  defaultPageSpan: 8,
  initialData: initialPresets
})

const presetForm = useFormDraft(
  { name: '', type: '', description: '' },
  {
    submitApi: async (draft, { mode, origin }) => {
      if (mode === 'compose') {
        tableCtl.appendRecord({ ...draft, status: '在役', createTime: new Date().toLocaleDateString('zh-CN') })
        ElMessage.success('预案已创建')
      } else if (origin && origin.id) {
        tableCtl.reviseRecord(origin.id, draft)
        ElMessage.success('预案已更新')
      }
      return { ok: true }
    }
  }
)

const presetInspector = useDrawerInspector({ size: '640px', direction: 'rtl' })

const onTriggerPreset = (preset) => {
  if (!preset) return
  ElMessage.success(`预案 "${preset.name}" 投递成功`)
}

const onRetirePreset = (preset) => {
  ElMessageBox.confirm(`确认废止预案 "${preset.name}" 吗？`, '废止确认', { type: 'warning' })
    .then(() => {
      tableCtl.retireRecord(preset.id)
      ElMessage.success('预案已废止')
    })
}

const onCommitDraft = async () => {
  if (!presetForm.draftPayload.name) {
    ElMessage.warning('请填写预案名称')
    return
  }
  await presetForm.onDraftCommit()
}
</script>

<style scoped lang="scss">
.zg-vault {
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
}

.zg-cardgrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.zg-presetcard {
  background: var(--zg-surface-card);
  border-radius: var(--zg-radius-lg);
  border: 1px solid var(--zg-line-soft);
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--zg-brand-primary);
    box-shadow: var(--zg-shadow-card);
  }

  &__name {
    font-size: 15px;
    font-weight: 600;
    color: var(--zg-ink-primary);
    margin: 0 0 4px;
  }

  &__category {
    font-size: 12px;
    color: var(--zg-brand-primary);
    margin: 0 0 8px;
  }

  &__brief {
    font-size: 13px;
    color: var(--zg-ink-secondary);
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

.zg-pagerbar {
  display: flex;
  justify-content: flex-end;
}

.zg-inspector {
  padding: 16px;

  &__name {
    font-size: 18px;
    font-weight: 600;
    color: var(--zg-ink-primary);
    margin: 0 0 16px;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid var(--zg-line-soft);
  }
}

.zg-draftform {
  padding: 8px;

  &__foot {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}
</style>