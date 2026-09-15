<!-- [软著核心代码] Dashboard.vue + 首页工作台：6 张统计卡片 + 管廊状态饼图 + 最近操作日志 + 待处理告警 -->
<template>
  <div class="zgsq-dashboard">
    <!-- ========== 顶部 6 张统计卡片 ========== -->
    <el-row :gutter="16" class="zgsq-stat-row">
      <el-col
        v-for="card in statCards"
        :key="card.key"
        :xs="12" :sm="8" :md="4"
      >
        <!-- 每张卡片有自己的渐变背景和图标 -->
        <div class="zgsq-stat-card" :style="{ background: card.bg }">
          <div class="zgsq-stat-icon">{{ card.icon }}</div>
          <div class="zgsq-stat-info">
            <div class="zgsq-stat-num">{{ card.value }}</div>
            <div class="zgsq-stat-label">{{ card.label }}</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- ========== 中部：饼图 + 最近日志 ========== -->
    <el-row :gutter="16" class="zgsq-mid-row">
      <!-- 左侧：管廊状态分布（纯 CSS 饼图实现） -->
      <el-col :xs="24" :md="12">
        <el-card class="zgsq-panel" shadow="hover">
          <template #header>
            <span class="zgsq-panel-title">🏗️ 管廊状态分布</span>
          </template>

          <div class="zgsq-pie-wrap">
            <!-- 左侧：CSS 饼图 -->
            <div class="zgsq-pie-chart" :style="pieConicStyle"></div>
            <!-- 右侧：图例 + 数值 -->
            <div class="zgsq-pie-legend">
              <div
                v-for="item in pieData"
                :key="item.name"
                class="zgsq-legend-item"
              >
                <!-- 色块 -->
                <span class="zgsq-legend-color" :style="{ background: item.color }"></span>
                <span class="zgsq-legend-name">{{ item.name }}</span>
                <span class="zgsq-legend-val">{{ item.value }}</span>
                <span class="zgsq-legend-pct">{{ item.pct }}%</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：最近操作日志（最近 5 条） -->
      <el-col :xs="24" :md="12">
        <el-card class="zgsq-panel" shadow="hover">
          <template #header>
            <div class="zgsq-panel-header">
              <span class="zgsq-panel-title">📋 最近操作日志</span>
              <el-button link type="primary" @click="$router.push('/oplog')">查看全部</el-button>
            </div>
          </template>

          <!-- 精简表格：只展示 5 条最新日志 -->
          <el-table :data="recentLogs" stripe size="default" height="300">
            <el-table-column prop="userName"   label="操作人" width="100" />
            <el-table-column prop="operType"   label="操作类型" width="100">
              <template #default="{ row }">
                <el-tag :type="opTagType(row.operType)" size="small">{{ row.operType }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="operDesc"   label="操作描述" show-overflow-tooltip />
            <el-table-column prop="operTime"   label="时间" width="170" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- ========== 底部：待处理告警 ========== -->
    <el-card class="zgsq-panel zgsq-alarm-panel" shadow="hover">
      <template #header>
        <span class="zgsq-panel-title">⚠️ 待处理告警</span>
      </template>

      <el-table :data="alarmList" stripe>
        <el-table-column type="index" label="#" width="60" />
        <el-table-column prop="alarmLevel" label="告警级别" width="110">
          <template #default="{ row }">
            <el-tag :type="alarmLevelTag(row.alarmLevel)" effect="dark">{{ row.alarmLevel }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="guanLangName" label="所属管廊" width="160" />
        <el-table-column prop="lianLuName"    label="所属链路" width="160" />
        <el-table-column prop="alarmContent"  label="告警内容" show-overflow-tooltip />
        <el-table-column prop="alarmTime"     label="告警时间" width="180" />
        <el-table-column label="操作" width="140">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleHandleAlarm(row)">处理</el-button>
            <el-button link type="info" @click="handleIgnoreAlarm(row)">忽略</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
// ========== 导入依赖 ==========
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as tongjiApi from '@/api/tongji.js' // 统计看板接口

// ========== 响应式状态 ==========

// 统计数据：6 张卡片的数值
const stats = reactive({
  guanLangTotal: 0,         // 管廊总数
  lianLuTotal: 0,           // 链路总数
  peiGuangTotal: 0,         // 配光组总数
  dingshiEnabledTotal: 0,   // 启用调度数
  alarmToday: 0,            // 今日告警数
  guanLangMaintaining: 0    // 维护中管廊数
})

// 管廊状态分组饼图数据
const pieData = ref([
  { name: '正常运行', value: 0, color: '#67c23a', pct: 0 },
  { name: '维护中',   value: 0, color: '#e6a23c', pct: 0 },
  { name: '已停用',   value: 0, color: '#909399', pct: 0 }
])

// 最近操作日志（5 条）
const recentLogs = ref([])
// 待处理告警列表
const alarmList = ref([])

// ========== 卡片配置（带渐变背景和图标） ==========
const statCards = computed(() => [
  { key: 'guanLangTotal', label: '管廊总数',     value: stats.guanLangTotal,      icon: '🏗️', bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { key: 'lianLuTotal',   label: '链路总数',     value: stats.lianLuTotal,        icon: '🔗', bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { key: 'peiGuangTotal', label: '配光组总数',   value: stats.peiGuangTotal,      icon: '💡', bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { key: 'dingshiEnable', label: '启用调度数',   value: stats.dingshiEnabledTotal,icon: '⏰', bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  { key: 'alarmToday',    label: '今日告警数',   value: stats.alarmToday,         icon: '⚠️', bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { key: 'glMaintaining', label: '维护中管廊',   value: stats.guanLangMaintaining,icon: '🛠️', bg: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' }
])

/**
 * 饼图 CSS 渐变属性
 * 业务说明：用 conic-gradient 实现纯 CSS 饼图，无需 ECharts 依赖
 */
const pieConicStyle = computed(() => {
  // 只取有值的部分，拼 conic-gradient
  const parts = pieData.value
    .filter(p => p.value > 0)
    .map(p => `${p.color} ${p.pct}%`)
    .join(', ')
  return parts ? `conic-gradient(${parts})` : 'conic-gradient(#dcdfe6 0%)'
})

// ========== 辅助方法 ==========

/**
 * 操作类型对应的 Tag 类型
 */
const opTagType = (type) => {
  if (type === '新增') return 'success'
  if (type === '删除') return 'danger'
  if (type === '修改') return 'warning'
  return 'info'
}

/**
 * 告警级别对应的 Tag 类型
 */
const alarmLevelTag = (level) => {
  if (level === '紧急') return 'danger'
  if (level === '严重') return 'warning'
  return 'info'
}

// ========== 事件处理 ==========
const handleHandleAlarm = (row) => {
  ElMessage.success(`已处理告警：${row.alarmContent}`)
  alarmList.value = alarmList.value.filter(a => a !== row)
}
const handleIgnoreAlarm = (row) => {
  ElMessage.info(`已忽略告警：${row.alarmContent}`)
  alarmList.value = alarmList.value.filter(a => a !== row)
}

// ========== 生命周期 ==========

/**
 * 组件挂载时拉取所有统计数据
 * 业务说明：Dashboard 是用户登录后第一眼看到的页面，需要尽快展示数据
 */
onMounted(async () => {
  try {
    // 并行请求统计数据和饼图数据
    const [dashboard, group] = await Promise.all([
      tongjiApi.getDashboard(),
      tongjiApi.getGuanLangGroup()
    ])

    // 回填统计数据
    Object.assign(stats, dashboard || {})

    // 回填饼图数据并计算百分比
    const total = (group?.normal || 0) + (group?.maintaining || 0) + (group?.disabled || 0)
    pieData.value = [
      { name: '正常运行', value: group?.normal || 0,     color: '#67c23a', pct: total ? Math.round(((group?.normal || 0) / total) * 100) : 0 },
      { name: '维护中',   value: group?.maintaining || 0, color: '#e6a23c', pct: total ? Math.round(((group?.maintaining || 0) / total) * 100) : 0 },
      { name: '已停用',   value: group?.disabled || 0,   color: '#909399', pct: total ? Math.round(((group?.disabled || 0) / total) * 100) : 0 }
    ]
  } catch (e) {
    // 后端未就绪时，用 mock 数据让页面能正常展示（软著演示用途）
    Object.assign(stats, {
      guanLangTotal: 12, lianLuTotal: 38, peiGuangTotal: 156,
      dingshiEnabledTotal: 42, alarmToday: 5, guanLangMaintaining: 2
    })
    pieData.value = [
      { name: '正常运行', value: 9,  color: '#67c23a', pct: 75 },
      { name: '维护中',   value: 2,  color: '#e6a23c', pct: 17 },
      { name: '已停用',   value: 1,  color: '#909399', pct: 8 }
    ]
  }

  // 填充 mock 数据（日志和告警），让 Dashboard 有东西展示
  recentLogs.value = [
    { userName: 'admin', operType: '新增', operDesc: '新增管廊 G003 - 中山大道东段', operTime: '2026-09-15 10:32:18' },
    { userName: 'admin', operType: '修改', operDesc: '更新链路 L012 的所属管廊', operTime: '2026-09-15 09:45:02' },
    { userName: 'zhangsan', operType: '删除', operDesc: '删除定时调度任务 T-0087', operTime: '2026-09-15 08:12:55' },
    { userName: 'admin', operType: '新增', operDesc: '新增配光组 P-2026-09-15-014', operTime: '2026-09-14 22:03:10' },
    { userName: 'lisi',  operType: '修改', operDesc: '修改角色"巡检员"权限配置', operTime: '2026-09-14 18:30:00' }
  ]
  alarmList.value = [
    { alarmLevel: '紧急', guanLangName: '长江大桥管廊',  lianLuName: '北岸主链路', alarmContent: '光照亮度异常偏低（低于阈值 40%）', alarmTime: '2026-09-15 11:05:23' },
    { alarmLevel: '严重', guanLangName: '珠江隧道管廊',  lianLuName: '东西向主链路', alarmContent: '配光组 P-0376 离线超过 30 分钟', alarmTime: '2026-09-15 10:48:12' },
    { alarmLevel: '一般', guanLangName: '中山大道管廊', lianLuName: '东段支路',    alarmContent: '定时调度任务执行延迟',           alarmTime: '2026-09-15 09:22:51' }
  ]
})
</script>

<style scoped>
/* ====== 统计卡片行 ====== */
.zgsq-stat-row {
  margin-bottom: 16px;
}
.zgsq-stat-card {
  height: 110px;
  border-radius: 10px;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  color: #fff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  margin-bottom: 12px;
}
.zgsq-stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}
.zgsq-stat-icon {
  font-size: 38px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.25));
}
.zgsq-stat-num {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
}
.zgsq-stat-label {
  font-size: 13px;
  opacity: 0.9;
  margin-top: 4px;
}

/* ====== 中部 + 底部面板 ====== */
.zgsq-mid-row {
  margin-bottom: 16px;
}
.zgsq-panel {
  border-radius: 8px;
  border: none;
}
.zgsq-panel :deep(.el-card__header) {
  padding: 14px 20px;
  border-bottom: 1px solid #ebeef5;
}
.zgsq-panel-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2d3d;
}
.zgsq-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* ====== CSS 饼图 ====== */
.zgsq-pie-wrap {
  display: flex;
  align-items: center;
  gap: 40px;
  padding: 20px 10px;
}
.zgsq-pie-chart {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  position: relative;
}
.zgsq-pie-chart::after {
  /* 中间挖空，变成环形图效果 */
  content: '';
  position: absolute;
  inset: 36px;
  background: #fff;
  border-radius: 50%;
}
.zgsq-pie-legend {
  flex: 1;
}
.zgsq-legend-item {
  display: flex;
  align-items: center;
  padding: 6px 0;
  font-size: 13px;
}
.zgsq-legend-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  margin-right: 10px;
}
.zgsq-legend-name {
  flex: 1;
  color: #606266;
}
.zgsq-legend-val {
  width: 40px;
  text-align: right;
  font-weight: 600;
  color: #1f2d3d;
  margin-right: 12px;
}
.zgsq-legend-pct {
  width: 50px;
  text-align: right;
  color: #909399;
}

/* ====== 告警面板 ====== */
.zgsq-alarm-panel {
  /* 与上方 el-row 的 gutter 对齐 */
}
</style>
