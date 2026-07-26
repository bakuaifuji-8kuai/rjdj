<!--
  智光云枢 · 灯网监控 · GIS图谱
  业务域：lampNet
  功能：照明设施空间分布一张图，支持图层切换、位点检视与地图居中
-->
<template>
  <section class="zg-gis">
    <!-- 页面头部：品牌徽标 + 标题 + 图层切换 -->
    <header class="zg-gis__head">
      <div class="zg-gis__headline">
        <div class="zg-gis__sigil">
          <el-icon :size="22"><MapLocation /></el-icon>
        </div>
        <div class="zg-gis__copy">
          <h1 class="zg-gis__title">GIS图谱</h1>
          <p class="zg-gis__sub">
            灯网设施空间分布 · 在役 {{ activeMarkerCount }} 处 ·
            离线 {{ offlineMarkerCount }} 处 · 告警 {{ alarmMarkerCount }} 处
          </p>
        </div>
      </div>
      <div class="zg-gis__cta">
        <el-radio-group v-model="activeLayer" size="default" @change="onToggleLayer">
          <el-radio-button value="all">
            <el-icon><Menu /></el-icon>
            <span>全部</span>
          </el-radio-button>
          <el-radio-button value="lamp">
            <el-icon><Location /></el-icon>
            <span>路灯</span>
          </el-radio-button>
          <el-radio-button value="cabinet">
            <el-icon><Lightning /></el-icon>
            <span>配电箱</span>
          </el-radio-button>
          <el-radio-button value="sensor">
            <el-icon><Cpu /></el-icon>
            <span>传感器</span>
          </el-radio-button>
        </el-radio-group>
      </div>
    </header>

    <!-- 概览指标卡 -->
    <div class="zg-metrics">
      <div class="zg-metrics__cell">
        <span class="zg-metrics__num">{{ markerCtl.totalRows }}</span>
        <span class="zg-metrics__lbl">位点总数</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--ok">
        <span class="zg-metrics__num">{{ activeMarkerCount }}</span>
        <span class="zg-metrics__lbl">在线位点</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--warn">
        <span class="zg-metrics__num">{{ offlineMarkerCount }}</span>
        <span class="zg-metrics__lbl">离线位点</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--danger">
        <span class="zg-metrics__num">{{ alarmMarkerCount }}</span>
        <span class="zg-metrics__lbl">告警位点</span>
      </div>
    </div>

    <!-- 地图区域 -->
    <div class="zg-gis__mapwrap">
      <div class="zg-gis__map" ref="mapRef">
        <div
          v-for="marker in visibleMarkers"
          :key="marker.id"
          class="zg-gis__pin"
          :class="`zg-gis__pin--${marker.status}`"
          :style="{ left: marker.x + '%', top: marker.y + '%' }"
          @click="onInspectMarker(marker)"
        >
          <el-icon :size="18">
            <Location v-if="marker.type === 'lamp'" />
            <Lightning v-else-if="marker.type === 'cabinet'" />
            <Cpu v-else />
          </el-icon>
          <span class="zg-gis__pinlabel">{{ marker.name }}</span>
        </div>
      </div>

      <!-- 地图工具栏 -->
      <div class="zg-gis__toolbar">
        <el-button circle size="small" @click="onZoomIn">
          <el-icon><ZoomIn /></el-icon>
        </el-button>
        <el-button circle size="small" @click="onZoomOut">
          <el-icon><ZoomOut /></el-icon>
        </el-button>
        <el-button circle size="small" @click="onCenterMap">
          <el-icon><MapLocation /></el-icon>
        </el-button>
      </div>

      <!-- 图例面板 -->
      <div class="zg-gis__legend">
        <h4 class="zg-gis__legend-title">图例</h4>
        <div class="zg-gis__legend-row">
          <span class="zg-gis__dot zg-gis__dot--online"></span>
          <span>在线</span>
        </div>
        <div class="zg-gis__legend-row">
          <span class="zg-gis__dot zg-gis__dot--offline"></span>
          <span>离线</span>
        </div>
        <div class="zg-gis__legend-row">
          <span class="zg-gis__dot zg-gis__dot--alarm"></span>
          <span>告警</span>
        </div>
        <div class="zg-gis__legend-row">
          <span class="zg-gis__dot zg-gis__dot--lamp"></span>
          <span>路灯</span>
        </div>
        <div class="zg-gis__legend-row">
          <span class="zg-gis__dot zg-gis__dot--cabinet"></span>
          <span>配电箱</span>
        </div>
        <div class="zg-gis__legend-row">
          <span class="zg-gis__dot zg-gis__dot--sensor"></span>
          <span>传感器</span>
        </div>
      </div>
    </div>

    <!-- 标记点详情抽屉 -->
    <el-drawer
      v-model="gisInspector.drawerOpen"
      :title="'位点详情 · ' + (focusedMarker?.name || '')"
      direction="rtl"
      size="640px"
    >
      <div v-if="focusedMarker" class="zg-inspector">
        <div class="zg-inspector__head">
          <div class="zg-inspector__glyph">
            <el-icon :size="36">
              <Location v-if="focusedMarker.type === 'lamp'" />
              <Lightning v-else-if="focusedMarker.type === 'cabinet'" />
              <Cpu v-else />
            </el-icon>
          </div>
          <div class="zg-inspector__meta">
            <h2 class="zg-inspector__name">{{ focusedMarker.name }}</h2>
            <p class="zg-inspector__type">{{ focusedMarker.area }} · {{ typeLabel(focusedMarker.type) }}</p>
            <span class="zg-status" :class="statusClass(focusedMarker.status)">
              <i class="dot"></i>{{ statusText(focusedMarker.status) }}
            </span>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">基本档案</h4>
          <div class="zg-inspector__grid">
            <div class="zg-inspector__cell">
              <span class="lbl">安装时间</span>
              <span class="val">{{ focusedMarker.installTime }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">坐标</span>
              <span class="val">{{ focusedMarker.lng }}, {{ focusedMarker.lat }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">运行时长</span>
              <span class="val">{{ focusedMarker.runTime }} h</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">备注</span>
              <span class="val">{{ focusedMarker.remark || '-' }}</span>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">实时遥测</h4>
          <div class="zg-datagrid">
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">电压</div>
              <div class="zg-datacard__val">{{ focusedMarker.voltage }}<em>V</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">功率</div>
              <div class="zg-datacard__val">{{ focusedMarker.power }}<em>kW</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">电流</div>
              <div class="zg-datacard__val">{{ focusedMarker.current }}<em>A</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">功率因数</div>
              <div class="zg-datacard__val">{{ focusedMarker.pf }}<em></em></div>
            </div>
          </div>
        </div>

        <div class="zg-inspector__actions">
          <el-button size="large" @click="gisInspector.closeInspector()">关闭</el-button>
          <el-button type="primary" size="large" @click="onCenterMap(focusedMarker)">
            <el-icon><MapLocation /></el-icon>
            <span>地图定位</span>
          </el-button>
        </div>
      </div>
    </el-drawer>
  </section>
</template>

<script setup>
/**
 * 智光云枢 · 灯网监控 · GIS图谱
 * 业务域：lampNet
 * 功能：照明设施空间分布一张图，支持图层切换、位点检视与地图居中
 * @module lampNet/GisAtlas
 * @author 智光云枢研发团队
 */
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  MapLocation,
  Location,
  Search,
  ZoomIn,
  ZoomOut,
  Menu,
  Lightning,
  Cpu
} from '@element-plus/icons-vue'
import { usePresetTable } from '@/shared/composables/usePresetTable'
import { useDrawerInspector } from '@/shared/composables/useDrawerInspector'

// ---- 图层切换 ----
const activeLayer = ref('all')

// ---- 初始 mock 数据池 ----
const initialMarkers = [
  {
    id: 1,
    no: 1,
    name: '先导路-路灯01',
    type: 'lamp',
    status: 'online',
    area: '长沙-岳麓区-先导路',
    lng: '112.9384',
    lat: '28.2341',
    voltage: 220,
    power: 0.12,
    current: 0.55,
    pf: 0.98,
    installTime: '2024-01-15',
    runTime: 8760,
    remark: '主干道照明',
    x: 24,
    y: 32
  },
  {
    id: 2,
    no: 2,
    name: '先导路-路灯02',
    type: 'lamp',
    status: 'online',
    area: '长沙-岳麓区-先导路',
    lng: '112.9392',
    lat: '28.2335',
    voltage: 220,
    power: 0.12,
    current: 0.54,
    pf: 0.97,
    installTime: '2024-01-15',
    runTime: 8760,
    remark: '',
    x: 38,
    y: 28
  },
  {
    id: 3,
    no: 3,
    name: '先导路1号配电箱',
    type: 'cabinet',
    status: 'online',
    area: '长沙-岳麓区-先导路',
    lng: '112.9388',
    lat: '28.2338',
    voltage: 380,
    power: 50,
    current: 75.8,
    pf: 0.95,
    installTime: '2024-01-10',
    runTime: 8920,
    remark: '主路馈电',
    x: 31,
    y: 30
  },
  {
    id: 4,
    no: 4,
    name: '芙蓉路-路灯03',
    type: 'lamp',
    status: 'offline',
    area: '长沙-天心区-芙蓉路',
    lng: '112.9856',
    lat: '28.1923',
    voltage: 0,
    power: 0,
    current: 0,
    pf: 0,
    installTime: '2024-03-10',
    runTime: 5200,
    remark: '待检修',
    x: 62,
    y: 56
  },
  {
    id: 5,
    no: 5,
    name: '芙蓉路2号配电箱',
    type: 'cabinet',
    status: 'online',
    area: '长沙-天心区-芙蓉路',
    lng: '112.9861',
    lat: '28.1927',
    voltage: 380,
    power: 55,
    current: 83.2,
    pf: 0.96,
    installTime: '2024-04-05',
    runTime: 4500,
    remark: '',
    x: 66,
    y: 52
  },
  {
    id: 6,
    no: 6,
    name: '湘江路-传感器01',
    type: 'sensor',
    status: 'alarm',
    area: '长沙-开福区-湘江路',
    lng: '112.9102',
    lat: '28.2456',
    voltage: 12,
    power: 0.005,
    current: 0.42,
    pf: 1.0,
    installTime: '2024-05-18',
    runTime: 2800,
    remark: '光照传感器异常',
    x: 45,
    y: 18
  },
  {
    id: 7,
    no: 7,
    name: '湘江路-路灯04',
    type: 'lamp',
    status: 'online',
    area: '长沙-开福区-湘江路',
    lng: '112.9108',
    lat: '28.2451',
    voltage: 220,
    power: 0.12,
    current: 0.56,
    pf: 0.98,
    installTime: '2024-05-20',
    runTime: 2750,
    remark: '',
    x: 50,
    y: 22
  },
  {
    id: 8,
    no: 8,
    name: '湘江路3号配电箱',
    type: 'cabinet',
    status: 'alarm',
    area: '长沙-开福区-湘江路',
    lng: '112.9115',
    lat: '28.2445',
    voltage: 380,
    power: 60,
    current: 92.5,
    pf: 0.94,
    installTime: '2024-05-15',
    runTime: 2900,
    remark: '过流告警',
    x: 55,
    y: 26
  }
]

// ---- 数据容器（usePresetTable） ----
const markerCtl = usePresetTable(null, {
  defaultPageSpan: 15,
  initialData: initialMarkers
})

// ---- 概览指标派生 ----
const activeMarkerCount = computed(
  () => markerCtl.presetPlaybook.filter(m => m.status === 'online').length
)
const offlineMarkerCount = computed(
  () => markerCtl.presetPlaybook.filter(m => m.status === 'offline').length
)
const alarmMarkerCount = computed(
  () => markerCtl.presetPlaybook.filter(m => m.status === 'alarm').length
)

// ---- 图层过滤后的可见标记 ----
const visibleMarkers = computed(() => {
  if (activeLayer.value === 'all') {
    return markerCtl.presetPlaybook
  }
  return markerCtl.presetPlaybook.filter(m => m.type === activeLayer.value)
})

// ---- 详情抽屉容器（useDrawerInspector） ----
const gisInspector = useDrawerInspector({ size: '640px', direction: 'rtl' })
const focusedMarker = computed(() => gisInspector.focusedRecord)

// ---- 地图引用 ----
const mapRef = ref(null)

/**
 * 图层切换：按类型过滤地图标记
 * @param {string} layer 图层标识
 */
const onToggleLayer = (layer) => {
  activeLayer.value = layer
  ElMessage.success(`已切换至${layer === 'all' ? '全部' : typeLabel(layer)}图层`)
}

/**
 * 查看标记详情：打开抽屉检视面板
 * @param {Object} marker 目标位点
 */
const onInspectMarker = (marker) => {
  gisInspector.openInspector(marker)
}

/**
 * 居中地图：将指定位点置于地图中心
 * @param {Object} marker 目标位点（可选，默认居中首个可见位点）
 */
const onCenterMap = (marker) => {
  const target = marker || visibleMarkers.value[0]
  if (!target) {
    ElMessage.warning('当前图层无可定位位点')
    return
  }
  ElMessage.success(`地图已居中至「${target.name}」`)
}

/**
 * 地图放大
 */
const onZoomIn = () => {
  ElMessage.success('地图已放大')
}

/**
 * 地图缩小
 */
const onZoomOut = () => {
  ElMessage.success('地图已缩小')
}

/**
 * 类型标签翻译
 * @param {string} type 类型码
 * @returns {string} 业务标签
 */
const typeLabel = (type) => {
  const map = { lamp: '路灯', cabinet: '配电箱', sensor: '传感器' }
  return map[type] || type
}

/**
 * 状态文本翻译
 * @param {string} status 状态码
 * @returns {string} 业务状态
 */
const statusText = (status) => {
  const map = { online: '在线', offline: '离线', alarm: '告警' }
  return map[status] || status
}

/**
 * 状态样式类映射
 * @param {string} status 状态码
 * @returns {string} CSS 类名
 */
const statusClass = (status) => {
  const map = { online: 'online', offline: 'offline', alarm: 'alarm' }
  return map[status] || ''
}
</script>

<style scoped lang="scss">
.zg-gis {
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
    align-items: center;
    gap: 10px;
  }

  &__mapwrap {
    position: relative;
    background: var(--zg-surface-card);
    border: 1px solid var(--zg-line-soft);
    border-radius: var(--zg-radius-lg);
    overflow: hidden;
    height: 560px;
    box-shadow: var(--zg-shadow-card);
  }

  &__map {
    position: relative;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, var(--zg-surface-muted) 0%, var(--zg-surface-card) 100%);
  }

  &__pin {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    transition: transform var(--zg-transition-normal);
    color: var(--zg-ink-primary);

    &:hover {
      transform: scale(1.15) translateY(-4px);
      z-index: 10;
    }

    &--online {
      color: var(--zg-success);
    }

    &--offline {
      color: var(--zg-danger);
    }

    &--alarm {
      color: var(--zg-warning);
      animation: zg-gis-blink 1.2s infinite;
    }
  }

  &__pinlabel {
    font-size: 11px;
    color: var(--zg-ink-secondary);
    background: var(--zg-surface-card);
    padding: 1px 6px;
    border-radius: var(--zg-radius-pill);
    border: 1px solid var(--zg-line-soft);
    white-space: nowrap;
    box-shadow: var(--zg-shadow-card);
  }

  &__toolbar {
    position: absolute;
    top: 14px;
    left: 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__legend {
    position: absolute;
    right: 14px;
    bottom: 14px;
    background: var(--zg-surface-card);
    border: 1px solid var(--zg-line-soft);
    border-radius: var(--zg-radius-md);
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    box-shadow: var(--zg-shadow-card);
    min-width: 120px;
  }

  &__legend-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--zg-ink-primary);
    margin: 0 0 4px;
  }

  &__legend-row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: var(--zg-ink-secondary);
  }

  &__dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: inline-block;
    flex-shrink: 0;
    border: 1px solid rgba(0,0,0,0.08);

    &--online { background: var(--zg-success); }
    &--offline { background: var(--zg-danger); }
    &--alarm { background: var(--zg-warning); }
    &--lamp { background: var(--zg-brand-primary); }
    &--cabinet { background: var(--zg-info); }
    &--sensor { background: var(--zg-purple); }
  }
}

@keyframes zg-gis-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
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
    &--danger::before { background: var(--zg-danger); }
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
  &.alarm {
    color: var(--zg-warning);
    background: var(--zg-warning-soft);
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

.zg-datagrid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.zg-datacard {
  padding: 14px 16px;
  background: var(--zg-gradient-surface);
  border: 1px solid var(--zg-line-soft);
  border-radius: var(--zg-radius-md);

  &__lbl {
    font-size: 12px;
    color: var(--zg-ink-tertiary);
    margin-bottom: 6px;
  }

  &__val {
    font-size: 22px;
    font-weight: 700;
    color: var(--zg-brand-primary);

    em {
      font-style: normal;
      font-size: 13px;
      color: var(--zg-ink-tertiary);
      margin-left: 4px;
      font-weight: 400;
    }
  }
}
</style>
