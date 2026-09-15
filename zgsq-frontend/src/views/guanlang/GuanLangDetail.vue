<!-- [软著核心代码] GuanLangDetail.vue + 管廊详情抽屉：展示全部字段 + 关联链路列表 -->
<template>
  <el-drawer
    :model-value="visible"
    :title="detail?.guanLangName ? `管廊详情 - ${detail.guanLangName}` : '管廊详情'"
    size="560px"
    @update:model-value="$emit('update:visible', $event)"
  >
    <template v-if="detail">
      <!-- ========== 基础信息 ========== -->
      <div class="zgsq-detail-section">
        <h4 class="zgsq-detail-section-title">📌 基础信息</h4>
        <el-descriptions :column="2" border size="default">
          <el-descriptions-item label="管廊编号">{{ detail.guanLangCode || '-' }}</el-descriptions-item>
          <el-descriptions-item label="管廊名称">{{ detail.guanLangName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="长度(米)">{{ detail.lengthMeters ?? '-' }}</el-descriptions-item>
          <el-descriptions-item label="所属行政区">{{ detail.district || '-' }}</el-descriptions-item>
          <el-descriptions-item label="养护单位">{{ detail.maintainUnit || '-' }}</el-descriptions-item>
          <el-descriptions-item label="管廊状态">
            <!-- 状态用 Tag 展示，颜色区分 -->
            <el-tag :type="statusTagType(detail.status)">{{ statusText(detail.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="巡检频率">{{ detail.patrolFrequency || '-' }} 天/次</el-descriptions-item>
          <el-descriptions-item label="最近巡检">{{ detail.lastPatrolDate || '-' }}</el-descriptions-item>
          <el-descriptions-item label="下次巡检" :span="2">
            {{ nextPatrolDate || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ detail.remark || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ detail.createTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ detail.updateTime || '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- ========== 关联链路 ========== -->
      <div class="zgsq-detail-section">
        <h4 class="zgsq-detail-section-title">🔗 关联链路（{{ linkList.length }} 条）</h4>
        <el-table :data="linkList" border stripe size="small" empty-text="暂无关联链路">
          <el-table-column type="index" label="#" width="50" />
          <el-table-column prop="lianLuCode" label="链路编号" width="140" />
          <el-table-column prop="lianLuName" label="链路名称" />
          <el-table-column prop="linkType" label="类型" width="90" />
          <el-table-column prop="status" label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
                {{ row.status === 1 ? '启用' : '停用' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </template>

    <!-- 正在加载中的占位 -->
    <div v-else class="zgsq-detail-loading">
      <el-skeleton :rows="6" animated />
    </div>
  </el-drawer>
</template>

<script setup>
// ========== 导入依赖 ==========
import { ref, watch, computed } from 'vue'
import { getGuanLangDetail } from '@/api/guanlang'
import { calcZgsqNextPatrolDate } from '@/utils/zgsqDate'

// ========== props / emit ==========
const props = defineProps({
  visible: Boolean,
  guanLangId: [Number, String]
})
const emit = defineEmits(['update:visible'])

// ========== 响应式 ==========
const detail = ref(null)       // 管廊详情对象
const linkList = ref([])       // 关联链路列表

// ========== 计算：下次巡检日期 ==========
const nextPatrolDate = computed(() => {
  if (!detail.value) return null
  return calcZgsqNextPatrolDate(detail.value.lastPatrolDate, detail.value.patrolFrequency)
})

// ========== 辅助：状态文本 / Tag 类型 ==========
const statusText = (s) => {
  if (s === 1) return '正常'
  if (s === 2) return '维护中'
  if (s === 0) return '停用'
  return '-'
}
const statusTagType = (s) => {
  if (s === 1) return 'success'
  if (s === 2) return 'warning'
  if (s === 0) return 'info'
  return ''
}

// ========== 监听 visible：打开时拉取详情 ==========
watch(() => props.visible, async (val) => {
  if (val && props.guanLangId) {
    detail.value = null  // 先清空，显示 loading
    try {
      const res = await getGuanLangDetail(props.guanLangId)
      detail.value = res
      // 后端返回的 detail 里如果带了 linkList 就直接用，否则用空数组
      linkList.value = res?.linkList || res?.lianLuList || []
    } catch (e) {
      detail.value = {} // 出错也让页面有内容可展示
      linkList.value = []
    }
  }
})
</script>

<style scoped>
.zgsq-detail-section {
  margin-bottom: 24px;
}
.zgsq-detail-section-title {
  font-size: 14px;
  color: #303133;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}
.zgsq-detail-loading {
  padding: 20px;
}
</style>
