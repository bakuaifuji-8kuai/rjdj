<!--
  智光云枢 · 灯网监控 · 集群拓扑
  业务域：lampNet
  功能：灯网集群拓扑可视化与节点监测
        支持拓扑刷新、节点详情抽屉、链路探测
-->
<template>
  <section class="zg-topology">
    <!-- 页面头部：品牌徽标 + 标题 + 刷新入口 -->
    <header class="zg-topology__head">
      <div class="zg-topology__headline">
        <div class="zg-topology__sigil">
          <el-icon :size="22"><Share /></el-icon>
        </div>
        <div class="zg-topology__copy">
          <h1 class="zg-topology__title">集群拓扑</h1>
          <p class="zg-topology__sub">
            灯网监控 · 在役 {{ onlineNodeCount }} 节点 · 离线 {{ offlineNodeCount }} 节点 · 累计链路 {{ totalLinkCount }} 条
          </p>
        </div>
      </div>
      <div class="zg-topology__cta">
        <el-button @click="onRefreshTopology">
          <el-icon><RefreshLeft /></el-icon>
          <span>刷新拓扑</span>
        </el-button>
      </div>
    </header>

    <!-- 概览指标卡 -->
    <div class="zg-metrics">
      <div class="zg-metrics__cell">
        <span class="zg-metrics__num">{{ clusterCount }}</span>
        <span class="zg-metrics__lbl">集群数</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--ok">
        <span class="zg-metrics__num">{{ onlineNodeCount }}</span>
        <span class="zg-metrics__lbl">在线节点</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--warn">
        <span class="zg-metrics__num">{{ offlineNodeCount }}</span>
        <span class="zg-metrics__lbl">离线节点</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--info">
        <span class="zg-metrics__num">{{ totalLinkCount }}</span>
        <span class="zg-metrics__lbl">链路总数</span>
      </div>
    </div>

    <!-- 拓扑可视化区域 -->
    <div class="zg-topology__stage">
      <div class="zg-topology__toolbar">
        <el-input
          v-model="nodeFilter"
          placeholder="检索节点名称 / IP"
          clearable
          class="zg-topology__search"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <div class="zg-topology__zoom">
          <el-button circle @click="zoomLevel = Math.min(zoomLevel + 0.1, 2)">
            <el-icon><ZoomIn /></el-icon>
          </el-button>
          <el-button circle @click="zoomLevel = Math.max(zoomLevel - 0.1, 0.5)">
            <el-icon><ZoomOut /></el-icon>
          </el-button>
        </div>
      </div>

      <div class="zg-topology__viewport" :style="viewportStyle">
        <svg class="zg-topology__svg" viewBox="0 0 860 420">
          <line
            v-for="(link, idx) in visibleLinks"
            :key="'l' + idx"
            :x1="link.x1"
            :y1="link.y1"
            :x2="link.x2"
            :y2="link.y2"
            :class="[
              'zg-topology__link',
              link.status === '在线' ? 'online' : 'offline'
            ]"
          />
        </svg>
        <div class="zg-topology__nodes">
          <div
            v-for="node in visibleNodes"
            :key="node.id"
            class="zg-topology__node"
            :class="node.status === '在线' ? 'online' : 'offline'"
            :style="{ left: node.x + 'px', top: node.y + 'px' }"
            @click="onInspectNode(node)"
          >
            <div class="zg-topology__node-glyph">
              <el-icon :size="20"><Share /></el-icon>
            </div>
            <div class="zg-topology__node-label">{{ node.name }}</div>
            <div class="zg-topology__node-ip">{{ node.ip }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 节点详情抽屉 -->
    <el-drawer
      v-model="topologyInspector.drawerOpen"
      :title="'节点详情 · ' + (focusedNode?.name || '')"
      direction="rtl"
      size="640px"
    >
      <div v-if="focusedNode" class="zg-inspector">
        <div class="zg-inspector__head">
          <div class="zg-inspector__glyph">
            <el-icon :size="36"><Share /></el-icon>
          </div>
          <div class="zg-inspector__meta">
            <h2 class="zg-inspector__name">{{ focusedNode.name }}</h2>
            <p class="zg-inspector__type">{{ focusedNode.cluster }} · {{ focusedNode.role }}</p>
            <span
              class="zg-status"
              :class="focusedNode.status === '在线' ? 'online' : 'offline'"
            >
              <i class="dot"></i>{{ focusedNode.status }}
            </span>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">基本档案</h4>
          <div class="zg-inspector__grid">
            <div class="zg-inspector__cell">
              <span class="lbl">IP 地址</span>
              <span class="val">{{ focusedNode.ip }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">所属集群</span>
              <span class="val">{{ focusedNode.cluster }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">节点角色</span>
              <span class="val">{{ focusedNode.role }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">运行时长</span>
              <span class="val">{{ focusedNode.uptime }} h</span>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">链路邻接</h4>
          <el-table :data="focusedNode.neighbors" size="small" border>
            <el-table-column prop="target" label="邻接节点" min-width="140" />
            <el-table-column prop="latency" label="时延(ms)" width="110" align="center" />
            <el-table-column label="状态" width="100" align="center">
              <template #default="{ row }">
                <span
                  class="zg-status"
                  :class="row.status === '在线' ? 'online' : 'offline'"
                >
                  <i class="dot"></i>{{ row.status }}
                </span>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="zg-inspector__actions">
          <el-button size="large" @click="topologyInspector.closeInspector()">
            关闭
          </el-button>
          <el-button type="primary" size="large" @click="onPingNode(focusedNode)">
            <el-icon><RefreshLeft /></el-icon>
            <span>探测节点</span>
          </el-button>
        </div>
      </div>
    </el-drawer>
  </section>
</template>

<script setup>
/**
 * 智光云枢 · 灯网监控 · 集群拓扑
 * 业务域：lampNet
 * 功能：灯网集群拓扑可视化与节点监测
 * @module lampNet/ClusterTopology
 * @author 智光云枢研发团队
 */
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Share,
  RefreshLeft,
  Search,
  ZoomIn,
  ZoomOut
} from '@element-plus/icons-vue'
import { useDrawerInspector } from '@/shared/composables/useDrawerInspector'

// ---- 视图缩放 ----
const zoomLevel = ref(1)
const viewportStyle = computed(() => ({
  transform: `scale(${zoomLevel.value})`,
  transformOrigin: 'top left'
}))

// ---- 节点检索 ----
const nodeFilter = ref('')

// ---- 初始 mock 拓扑数据 ----
const initialNodes = [
  {
    id: 1,
    name: '控制中心-岳麓',
    cluster: '长沙-岳麓区',
    role: '控制中枢',
    status: '在线',
    ip: '10.0.1.1',
    uptime: 8760,
    x: 60,
    y: 40,
    neighbors: [
      { target: '汇聚节点-岳麓', latency: 2, status: '在线' },
      { target: '控制中心-天心', latency: 8, status: '在线' }
    ]
  },
  {
    id: 2,
    name: '汇聚节点-岳麓',
    cluster: '长沙-岳麓区',
    role: '汇聚节点',
    status: '在线',
    ip: '10.0.1.2',
    uptime: 7200,
    x: 60,
    y: 180,
    neighbors: [
      { target: '边缘节点-先导路', latency: 5, status: '在线' },
      { target: '边缘节点-力唯中天', latency: 6, status: '在线' }
    ]
  },
  {
    id: 3,
    name: '边缘节点-先导路',
    cluster: '长沙-岳麓区',
    role: '边缘网关',
    status: '在线',
    ip: '10.0.1.11',
    uptime: 6500,
    x: 20,
    y: 320,
    neighbors: [
      { target: '汇聚节点-岳麓', latency: 5, status: '在线' }
    ]
  },
  {
    id: 4,
    name: '边缘节点-力唯中天',
    cluster: '长沙-岳麓区',
    role: '边缘网关',
    status: '在线',
    ip: '10.0.1.12',
    uptime: 6100,
    x: 140,
    y: 320,
    neighbors: [
      { target: '汇聚节点-岳麓', latency: 6, status: '在线' }
    ]
  },
  {
    id: 5,
    name: '控制中心-天心',
    cluster: '长沙-天心区',
    role: '控制中枢',
    status: '在线',
    ip: '10.0.2.1',
    uptime: 8200,
    x: 380,
    y: 40,
    neighbors: [
      { target: '汇聚节点-天心', latency: 2, status: '在线' },
      { target: '控制中心-岳麓', latency: 8, status: '在线' },
      { target: '控制中心-开福', latency: 7, status: '在线' }
    ]
  },
  {
    id: 6,
    name: '汇聚节点-天心',
    cluster: '长沙-天心区',
    role: '汇聚节点',
    status: '在线',
    ip: '10.0.2.2',
    uptime: 7100,
    x: 380,
    y: 180,
    neighbors: [
      { target: '边缘节点-芙蓉路1号', latency: 4, status: '离线' },
      { target: '边缘节点-芙蓉路2号', latency: 5, status: '在线' }
    ]
  },
  {
    id: 7,
    name: '边缘节点-芙蓉路1号',
    cluster: '长沙-天心区',
    role: '边缘网关',
    status: '离线',
    ip: '10.0.2.11',
    uptime: 0,
    x: 320,
    y: 320,
    neighbors: [
      { target: '汇聚节点-天心', latency: 0, status: '离线' }
    ]
  },
  {
    id: 8,
    name: '边缘节点-芙蓉路2号',
    cluster: '长沙-天心区',
    role: '边缘网关',
    status: '在线',
    ip: '10.0.2.12',
    uptime: 5800,
    x: 440,
    y: 320,
    neighbors: [
      { target: '汇聚节点-天心', latency: 5, status: '在线' }
    ]
  },
  {
    id: 9,
    name: '控制中心-开福',
    cluster: '长沙-开福区',
    role: '控制中枢',
    status: '在线',
    ip: '10.0.3.1',
    uptime: 8500,
    x: 700,
    y: 40,
    neighbors: [
      { target: '汇聚节点-开福', latency: 2, status: '在线' },
      { target: '控制中心-天心', latency: 7, status: '在线' }
    ]
  },
  {
    id: 10,
    name: '汇聚节点-开福',
    cluster: '长沙-开福区',
    role: '汇聚节点',
    status: '在线',
    ip: '10.0.3.2',
    uptime: 7300,
    x: 700,
    y: 180,
    neighbors: [
      { target: '边缘节点-湘江路', latency: 4, status: '在线' },
      { target: '边缘节点-营盘路', latency: 5, status: '在线' }
    ]
  },
  {
    id: 11,
    name: '边缘节点-湘江路',
    cluster: '长沙-开福区',
    role: '边缘网关',
    status: '在线',
    ip: '10.0.3.11',
    uptime: 6200,
    x: 640,
    y: 320,
    neighbors: [
      { target: '汇聚节点-开福', latency: 4, status: '在线' }
    ]
  },
  {
    id: 12,
    name: '边缘节点-营盘路',
    cluster: '长沙-开福区',
    role: '边缘网关',
    status: '在线',
    ip: '10.0.3.12',
    uptime: 5900,
    x: 760,
    y: 320,
    neighbors: [
      { target: '汇聚节点-开福', latency: 5, status: '在线' }
    ]
  }
]

const initialLinks = [
  { source: 1, target: 2 },
  { source: 2, target: 3 },
  { source: 2, target: 4 },
  { source: 1, target: 5 },
  { source: 5, target: 6 },
  { source: 6, target: 7 },
  { source: 6, target: 8 },
  { source: 5, target: 9 },
  { source: 9, target: 10 },
  { source: 10, target: 11 },
  { source: 10, target: 12 },
  { source: 5, target: 9 },
  { source: 1, target: 5 },
  { source: 2, target: 6 }
]

// ---- 数据池 ----
const topologyNodes = ref([...initialNodes])
const topologyLinks = ref([...initialLinks])

// ---- 节点索引 ----
const nodeMap = computed(() => {
  const map = {}
  topologyNodes.value.forEach(n => { map[n.id] = n })
  return map
})

// ---- 可见节点 ----
const visibleNodes = computed(() => {
  if (!nodeFilter.value) return topologyNodes.value
  const kw = nodeFilter.value.toLowerCase()
  return topologyNodes.value.filter(
    n =>
      n.name.toLowerCase().includes(kw) ||
      n.ip.includes(kw)
  )
})

// ---- 可见连线（带坐标与状态） ----
const visibleLinks = computed(() => {
  return topologyLinks.value
    .map(link => {
      const s = nodeMap.value[link.source]
      const t = nodeMap.value[link.target]
      if (!s || !t) return null
      return {
        ...link,
        x1: s.x + 40,
        y1: s.y + 40,
        x2: t.x + 40,
        y2: t.y + 40,
        status: s.status === '在线' && t.status === '在线' ? '在线' : '离线'
      }
    })
    .filter(Boolean)
})

// ---- 概览指标派生 ----
const clusterCount = computed(() => {
  const set = new Set(topologyNodes.value.map(n => n.cluster))
  return set.size
})
const onlineNodeCount = computed(
  () => topologyNodes.value.filter(n => n.status === '在线').length
)
const offlineNodeCount = computed(
  () => topologyNodes.value.filter(n => n.status === '离线').length
)
const totalLinkCount = computed(() => topologyLinks.value.length)

// ---- 详情抽屉容器（useDrawerInspector） ----
const topologyInspector = useDrawerInspector({ size: '640px', direction: 'rtl' })
const focusedNode = computed(() => topologyInspector.focusedRecord)

/**
 * 刷新拓扑：模拟数据回执并提示
 */
const onRefreshTopology = () => {
  ElMessage.success('拓扑数据已刷新，节点状态回执已签收')
}

/**
 * 查看节点详情：打开抽屉检视面板
 * @param {Object} node 目标节点
 */
const onInspectNode = (node) => {
  topologyInspector.openInspector(node)
}

/**
 * 探测节点：模拟 Ping 并回执时延
 * @param {Object} node 目标节点
 */
const onPingNode = (node) => {
  const latency = Math.floor(Math.random() * 20) + 2
  ElMessage.success(`节点「${node.name}」探测成功，平均时延 ${latency} ms`)
}
</script>

<style scoped lang="scss">
.zg-topology {
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

  &__stage {
    background: var(--zg-surface-card);
    border: 1px solid var(--zg-line-soft);
    border-radius: var(--zg-radius-lg);
    padding: 16px;
    margin-bottom: 20px;
    box-shadow: var(--zg-shadow-card);
  }

  &__toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14px;
    flex-wrap: wrap;
    gap: 10px;
  }

  &__search {
    width: 260px;
  }

  &__zoom {
    display: flex;
    gap: 8px;
  }

  &__viewport {
    position: relative;
    width: 860px;
    height: 420px;
    background: var(--zg-surface-muted);
    border-radius: var(--zg-radius-md);
    overflow: hidden;
    transition: transform var(--zg-transition-normal);
  }

  &__svg {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  &__link {
    stroke-width: 2;
    stroke-linecap: round;
    opacity: 0.7;
    transition: stroke var(--zg-transition-normal);

    &.online {
      stroke: var(--zg-success);
    }

    &.offline {
      stroke: var(--zg-danger);
      stroke-dasharray: 6 4;
    }
  }

  &__nodes {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }

  &__node {
    position: absolute;
    width: 80px;
    height: 80px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    background: var(--zg-surface-card);
    border: 1px solid var(--zg-line-soft);
    border-radius: var(--zg-radius-lg);
    cursor: pointer;
    transition: all var(--zg-transition-normal);
    box-shadow: var(--zg-shadow-card);

    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--zg-shadow-card-hover);
      border-color: var(--zg-line-brand);
    }

    &.online {
      border-left: 3px solid var(--zg-success);
    }

    &.offline {
      border-left: 3px solid var(--zg-danger);
    }

    &-glyph {
      width: 32px;
      height: 32px;
      border-radius: var(--zg-radius-md);
      background: var(--zg-brand-tint-50);
      color: var(--zg-brand-primary);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    &-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--zg-ink-primary);
      white-space: nowrap;
    }

    &-ip {
      font-size: 10px;
      color: var(--zg-ink-tertiary);
      white-space: nowrap;
    }
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

  &__actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    padding-top: 18px;
    border-top: 1px solid var(--zg-line-soft);
    margin-top: 8px;
  }
}
</style>
