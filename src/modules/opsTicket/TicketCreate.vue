<!--
  智光云枢 · 运维工单 · 创建工单
  业务域：opsTicket
  功能：运维工单的新建编排，支持草稿留存与附件挂载
-->
<template>
  <section class="zg-ticketcreate">
    <!-- 页面头部：品牌徽标 + 标题 + 返回入口 -->
    <header class="zg-ticketcreate__head">
      <div class="zg-ticketcreate__headline">
        <div class="zg-ticketcreate__sigil">
          <el-icon :size="22"><Tickets /></el-icon>
        </div>
        <div class="zg-ticketcreate__copy">
          <h1 class="zg-ticketcreate__title">创建工单</h1>
          <p class="zg-ticketcreate__sub">运维工单中枢 · 新建工单</p>
        </div>
      </div>
      <div class="zg-ticketcreate__cta">
        <el-button @click="onReturnList">
          <el-icon><ArrowLeft /></el-icon>
          <span>返回列表</span>
        </el-button>
      </div>
    </header>

    <!-- 工单创建表单 -->
    <div class="zg-ticketcreate__sheet">
      <el-form
        ref="ticketForm.formAnchor"
        :model="ticketForm.draftPayload"
        label-width="100px"
        class="zg-ticketcreate__form"
      >
        <div class="zg-ticketcreate__band">
          <h3 class="zg-ticketcreate__band-title">基本信息</h3>
          <el-form-item label="工单类型" required>
            <el-select
              v-model="ticketForm.draftPayload.type"
              placeholder="请选择工单类型"
              style="width: 100%"
            >
              <el-option label="故障工单" value="fault" />
              <el-option label="维修工单" value="maintenance" />
              <el-option label="巡检工单" value="inspection" />
            </el-select>
          </el-form-item>
          <el-form-item label="优先级" required>
            <el-select
              v-model="ticketForm.draftPayload.priority"
              placeholder="请选择优先级"
              style="width: 100%"
            >
              <el-option label="高" value="high" />
              <el-option label="中" value="medium" />
              <el-option label="低" value="low" />
            </el-select>
          </el-form-item>
          <el-form-item label="工单标题" required>
            <el-input
              v-model="ticketForm.draftPayload.title"
              placeholder="请输入工单标题"
            />
          </el-form-item>
          <el-form-item label="详细描述">
            <el-input
              v-model="ticketForm.draftPayload.description"
              type="textarea"
              :rows="4"
              placeholder="请输入详细描述"
            />
          </el-form-item>
        </div>

        <div class="zg-ticketcreate__band">
          <h3 class="zg-ticketcreate__band-title">位置与人员</h3>
          <el-form-item label="地点" required>
            <el-input
              v-model="ticketForm.draftPayload.location"
              placeholder="请输入地点"
            >
              <template #prefix>
                <el-icon><Location /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="指派人员">
            <el-input
              v-model="ticketForm.draftPayload.assignee"
              placeholder="请输入指派人员"
            >
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>
        </div>

        <div class="zg-ticketcreate__band">
          <h3 class="zg-ticketcreate__band-title">附件资料</h3>
          <el-form-item label="附件上传">
            <el-upload
              action="#"
              :auto-upload="false"
              :on-change="onAttachmentChange"
              :file-list="attachmentList"
              multiple
              drag
              class="zg-ticketcreate__uploader"
            >
              <el-icon :size="32"><Upload /></el-icon>
              <div class="el-upload__text">
                将文件拖到此处，或 <em>点击上传</em>
              </div>
            </el-upload>
          </el-form-item>
        </div>
      </el-form>

      <!-- 提交按钮区 -->
      <div class="zg-ticketcreate__actions">
        <el-button @click="onResetForm">
          <el-icon><RefreshLeft /></el-icon>
          <span>重置</span>
        </el-button>
        <el-button type="info" @click="onSaveDraft">
          <el-icon><Document /></el-icon>
          <span>保存草稿</span>
        </el-button>
        <el-button
          type="primary"
          :loading="ticketForm.submitting"
          @click="onCommitTicket"
        >
          <el-icon><Plus /></el-icon>
          <span>提交工单</span>
        </el-button>
      </div>
    </div>
  </section>
</template>

<script setup>
/**
 * 智光云枢 · 运维工单 · 创建工单
 * 业务域：opsTicket
 * 功能：运维工单的新建编排，支持草稿留存与附件挂载
 * @module opsTicket/TicketCreate
 * @author 智光云枢研发团队
 */
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Tickets,
  ArrowLeft,
  Plus,
  Upload,
  Location,
  User,
  RefreshLeft,
  Document
} from '@element-plus/icons-vue'
import { useFormDraft } from '@/shared/composables/useFormDraft'

const router = useRouter()

// ---- 附件列表 ----
const attachmentList = ref([])

const onAttachmentChange = (_file, fileList) => {
  attachmentList.value = fileList
}

// ---- 表单草稿容器（useFormDraft） ----
const ticketForm = useFormDraft(
  {
    type: '',
    title: '',
    description: '',
    location: '',
    priority: 'medium',
    assignee: '',
    status: 'pending'
  },
  {
    validateFn: (draft) => {
      if (!draft.type) {
        ElMessage.warning('请选择工单类型')
        return false
      }
      if (!draft.priority) {
        ElMessage.warning('请选择优先级')
        return false
      }
      if (!draft.title) {
        ElMessage.warning('请输入工单标题')
        return false
      }
      if (!draft.location) {
        ElMessage.warning('请输入地点')
        return false
      }
      return true
    }
  }
)

// ---- 派生状态 ----
const draftSnapshot = computed(() => ({ ...ticketForm.draftPayload }))

/**
 * 生成工单编号
 */
const generateTicketNo = () => {
  const timestamp = Date.now().toString(36).toUpperCase()
  return 'WO' + timestamp.slice(-3) + String(Math.random()).slice(-3).toUpperCase()
}

/**
 * 返回列表页
 */
const onReturnList = () => {
  router.push('/workorder/list')
}

/**
 * 提交工单：校验通过后生成编号并回执
 */
const onCommitTicket = async () => {
  const snapshot = await ticketForm.onDraftCommit()
  if (!snapshot) return

  const payload = {
    ...snapshot,
    id: generateTicketNo(),
    attachments: attachmentList.value.map(f => f.name),
    createTime: new Date().toLocaleString('zh-CN'),
    updateTime: new Date().toLocaleString('zh-CN')
  }

  ElMessage.success(`工单 ${payload.id} 提交成功，已汇入待处置队列`)
  router.push('/workorder/list')
}

/**
 * 保存草稿：本地留存，便于断点续编
 */
const onSaveDraft = () => {
  const bundle = {
    ...draftSnapshot.value,
    attachments: attachmentList.value.map(f => f.name),
    savedAt: new Date().toLocaleString('zh-CN')
  }
  localStorage.setItem('zg:ticket:create:draft', JSON.stringify(bundle))
  ElMessage.success('草稿已保存至本地，可随时续编')
}

/**
 * 重置表单：清空草稿与附件
 */
const onResetForm = () => {
  ticketForm.resetDraft()
  attachmentList.value = []
  ElMessage.info('表单已重置')
}
</script>

<style scoped lang="scss">
.zg-ticketcreate {
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

  &__cta {
    display: flex;
    gap: 10px;
  }

  &__sheet {
    max-width: 720px;
    margin: 0 auto;
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &__band {
    background: var(--zg-surface-card);
    border: 1px solid var(--zg-line-soft);
    border-radius: var(--zg-radius-lg);
    padding: 20px 24px;
    box-shadow: var(--zg-shadow-card);
  }

  &__band-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--zg-ink-secondary);
    margin: 0 0 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--zg-line-soft);
  }

  &__uploader {
    width: 100%;

    :deep(.el-upload-dragger) {
      background: var(--zg-surface-muted);
      border-color: var(--zg-line-soft);
      color: var(--zg-ink-secondary);

      .el-upload__text {
        color: var(--zg-ink-tertiary);

        em {
          color: var(--zg-brand-primary);
          font-style: normal;
        }
      }
    }
  }

  &__actions {
    display: flex;
    gap: 12px;
    justify-content: center;
    padding: 24px 0 12px;
  }
}
</style>
