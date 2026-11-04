<!--
  智光云枢 · 数字孪生 · 元数起航 3D 引擎接入配置
  业务域：digitalTwin
  功能：TwinAdapter 配置表单 · 连接测试 · 资产映射预览 · Mock 降级演示
-->
<template>
  <section class="zg-twin-adapter">
    <header class="zg-twin-adapter__head">
      <div class="zg-twin-adapter__headline">
        <div class="zg-twin-adapter__sigil"><el-icon :size="22"><Connection /></el-icon></div>
        <div class="zg-twin-adapter__copy">
          <h1 class="zg-twin-adapter__title">元数起航 3D 引擎接入配置</h1>
          <p class="zg-twin-adapter__sub">智光云枢 ↔ 元数起航 数字孪生引擎 · v1.0 · 适配层模式（TwinAdapter）</p>
        </div>
      </div>
    </header>

    <!-- ===== 连接状态 ===== -->
    <div class="zg-twin-adapter__status-bar" :class="'is-' + connectionState">
      <span class="dot"></span>
      <span class="label">{{ connectionText }}</span>
      <span class="stats" v-if="adapter">
        · 资产映射 {{ stats.mappingCount }} · 已同步 {{ stats.counter }} 次
      </span>
      <div class="zg-twin-adapter__status-actions">
        <el-button size="small" @click="testConnection" :loading="testing">
          <el-icon><Link /></el-icon> 测试连接
        </el-button>
        <el-button size="small" plain @click="loadSampleMappings" :disabled="!adapter">
          加载示例映射
        </el-button>
      </div>
    </div>

    <div class="zg-twin-adapter__grid">
      <!-- ===== 配置表单 ===== -->
      <div class="zg-twin-adapter__card">
        <h3 class="zg-twin-adapter__card-title">
          <el-icon><Setting /></el-icon> 引擎连接参数
        </h3>
        <el-form :model="form" label-width="180px" size="default" class="zg-twin-adapter__form">
          <el-form-item label="引擎 WebSocket 地址">
            <el-input v-model="form.engineUrl" placeholder="wss://engine.yuanshuqihang.com/ws" />
            <div class="zg-twin-adapter__hint">真实引擎以 wss:// 开头；本地联调可用 ws://localhost:8080/ws</div>
          </el-form-item>
          <el-form-item label="API Key">
            <el-input v-model="form.apiKey" type="password" show-password placeholder="从元数起航申请" />
          </el-form-item>
          <el-form-item label="数据同步间隔">
            <el-input-number v-model="form.syncInterval" :min="500" :step="500" :max="60000" />
            <span class="zg-twin-adapter__inline-unit">ms（毫秒）</span>
          </el-form-item>
          <el-form-item label="自动重连">
            <el-switch v-model="form.autoReconnect" />
            <span class="zg-twin-adapter__inline-unit" style="margin-left:10px;color:var(--zg-ink-tertiary);font-size:var(--zg-text-caption);">断线后 3 秒自动重连</span>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveAndConnect" :loading="testing">
              <el-icon><Promotion /></el-icon> 保存并连接
            </el-button>
            <el-button @click="startMockMode">
              <el-icon><MagicStick /></el-icon> 降级为本地模拟模式
            </el-button>
            <el-button v-if="adapter" plain type="danger" @click="disconnect">
              断开连接
            </el-button>
          </el-form-item>
        </el-form>

        <!-- ===== 实时事件日志 ===== -->
        <h3 class="zg-twin-adapter__card-title" style="margin-top:24px">
          <el-icon><Document /></el-icon> 孪生实时事件流
          <el-tag size="small" effect="dark" style="margin-left:8px">{{ events.length }}</el-tag>
        </h3>
        <div class="zg-twin-adapter__event-log">
          <div v-if="events.length === 0" class="zg-twin-adapter__event-empty">
            暂无事件 · 连接引擎或启用 Mock 模式后，此处将显示孪生引擎推送的实时事件
          </div>
          <div
            v-for="(e, i) in events"
            :key="i"
            class="zg-twin-adapter__event"
          >
            <span class="time">{{ formatTime(e.timestamp) }}</span>
            <span class="type" :class="'type--' + e.type">{{ e.type }}</span>
            <span class="asset">{{ e.assetCode }}</span>
            <span class="data">{{ formatData(e.data) }}</span>
          </div>
        </div>
      </div>

      <!-- ===== 资产映射预览 ===== -->
      <div class="zg-twin-adapter__card">
        <h3 class="zg-twin-adapter__card-title">
          <el-icon><MapLocation /></el-icon> 资产 ↔ 孪生 对象 映射
        </h3>
        <el-table :data="mappings" stripe height="460" class="zg-twin-adapter__table">
          <el-table-column prop="assetCode" label="智光资产编码" width="170">
            <template #default="{ row }">
              <span style="font-family:monospace;color:var(--zg-amber-glow)">{{ row.assetCode }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="twinObjectId" label="元数孪生对象 ID" width="200">
            <template #default="{ row }">
              <span style="font-family:monospace;font-size:12px">{{ row.twinObjectId }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="type" label="类型" width="100">
            <template #default="{ row }">
              <el-tag size="small" :type="typeTagColor(row.type)">{{ typeLabel(row.type) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="sceneId" label="所属场景" width="120">
            <template #default="{ row }">
              <el-tag size="small" effect="plain">{{ row.sceneId }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="3D 坐标">
            <template #default="{ row }">
              <span style="font-family:monospace;color:var(--zg-ink-tertiary);font-size:12px">
                X={{ row.position.x }}, Y={{ row.position.y }}, Z={{ row.position.z }}
              </span>
            </template>
          </el-table-column>
        </el-table>

        <!-- 适配层说明 -->
        <el-alert type="info" show-icon title="🧱 TwinAdapter 适配层设计">
          <template #default>
            业务代码 <code>不直接依赖</code> 元数起航 API。只通过 <code>TwinAdapter</code> 适配层调用 ——
            引擎切换（Three.js 自研 / Unreal Engine / 其他）<strong>只需改 adapter 内部</strong>，业务代码零改动。
          </template>
        </el-alert>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, shallowRef } from 'vue'
import { Connection, Link, Setting, Promotion, MagicStick, Document, MapLocation } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import TwinAdapter, { AssetTwinMapping, TwinConfig, TwinRealtimeEvent } from '../adapter/TwinAdapter'

// ===== 表单 =====
const form = reactive<TwinConfig>({
  engineUrl: 'ws://localhost:8080/ws',
  apiKey: '',
  syncInterval: 1000,
  autoReconnect: true
})

// ===== 适配器实例（shallowRef 避免 Vue 深层代理 TS 类实例）=====
const adapter = shallowRef<TwinAdapter | null>(null)
const testing = ref(false)
const connectionState = ref<'idle' | 'connecting' | 'connected' | 'mock' | 'error'>('idle')

const connectionText = computed(() => ({
  idle: '未连接',
  connecting: '连接中...',
  connected: '✅ 已连接元数起航引擎',
  mock: '🔧 本地 Mock 模式（引擎不可用降级）',
  error: '❌ 连接失败'
}[connectionState.value]))

const stats = computed(() => adapter.value ? adapter.value.getSyncStats() : { counter: 0, lastSyncAt: 0, mappingCount: 0 })

// ===== 事件日志 =====
const events = ref<TwinRealtimeEvent[]>([])

function addEvent(evt: TwinRealtimeEvent) {
  events.value.unshift(evt)
  if (events.value.length > 200) events.value.pop()
}

function formatTime(ts: number) {
  const d = new Date(ts)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}
function formatData(data: any) {
  if (!data) return '-'
  try {
    const s = JSON.stringify(data)
    return s.length > 80 ? s.slice(0, 77) + '...' : s
  } catch { return String(data) }
}

function typeTagColor(t: string) {
  const map: Record<string, string> = { pole: '', lamp: 'success', cabinet: 'warning', camera: 'info', drone: 'danger', feeder: '' }
  return map[t] || ''
}
function typeLabel(t: string) {
  const map: Record<string, string> = { pole: '灯杆', lamp: '灯具', cabinet: '配电箱', camera: '摄像头', drone: '无人机', feeder: '馈电柜' }
  return map[t] || t
}

// ===== 资产映射 =====
const mappings = ref<AssetTwinMapping[]>([])

function loadSampleMappings() {
  const sample: AssetTwinMapping[] = [
    { assetCode: 'ASSET-2024-0312', twinObjectId: 'YSQH-FDR-A01-20240815', type: 'feeder', position: { x: 120, y: 80, z: 0 }, sceneId: '先导路' },
    { assetCode: 'ASSET-2024-0315', twinObjectId: 'YSQH-POLE-023-20240815', type: 'pole', position: { x: 230, y: 120, z: 15 }, sceneId: '先导路' },
    { assetCode: 'ASSET-2024-0316', twinObjectId: 'YSQH-POLE-024-20240815', type: 'pole', position: { x: 245, y: 180, z: 15 }, sceneId: '先导路' },
    { assetCode: 'ZG-ASSET-CAB-2025-017', twinObjectId: 'YSQH-CAB-D11-20250320', type: 'cabinet', position: { x: 300, y: 240, z: 1.2 }, sceneId: '先导路' },
    { assetCode: 'ZG-ASSET-CAB-2025-023', twinObjectId: 'YSQH-CAB-D23-20250320', type: 'cabinet', position: { x: 600, y: 540, z: 1.2 }, sceneId: '麓谷' },
    { assetCode: 'ASSET-2024-CAM-008', twinObjectId: 'YSQH-CAM-008-20240901', type: 'camera', position: { x: 305, y: 230, z: 8 }, sceneId: '先导路' },
    { assetCode: 'ASSET-2025-DRN-003', twinObjectId: 'YSQH-DRN-003-FLT01', type: 'drone', position: { x: 450, y: 350, z: 120 }, sceneId: '全域' },
    { assetCode: 'ASSET-2024-0314', twinObjectId: 'YSQH-FDR-C01-20240815', type: 'feeder', position: { x: 970, y: 30, z: 0 }, sceneId: '梅溪湖' }
  ]
  mappings.value = sample
  adapter.value?.loadMappings(sample)
  ElMessage.success(`已加载 ${sample.length} 条资产 ↔ 孪生 映射`)
}

// ===== 操作 =====
async function testConnection() {
  testing.value = true
  try {
    if (adapter.value) {
      adapter.value.destroy()
      adapter.value = null
    }
    const inst = new TwinAdapter({ ...form })
    adapter.value = inst
    // 订阅事件
    inst.onEvent((evt) => addEvent(evt))
    inst.onStateChange((s) => { connectionState.value = s })
    const ok = await inst.connect()
    if (!ok) {
      ElMessage.warning('已降级为本地 Mock 模式（引擎未连通）')
    } else {
      ElMessage.success('元数起航引擎连接成功')
    }
  } catch (err: any) {
    ElMessage.error('连接失败：' + (err?.message || err))
  } finally {
    testing.value = false
  }
}

async function saveAndConnect() {
  if (!form.engineUrl) { ElMessage.warning('请填写引擎 WebSocket 地址'); return }
  await testConnection()
}

function startMockMode() {
  if (adapter.value) {
    adapter.value.stopMockMode()
    adapter.value.destroy()
  }
  const inst = new TwinAdapter({ ...form })
  adapter.value = inst
  inst.onEvent((evt) => addEvent(evt))
  inst.onStateChange((s) => { connectionState.value = s })
  loadSampleMappings()
  inst.startMockMode()
  connectionState.value = 'mock'
  ElMessage.success('已启动本地 Mock 模式：每 5s 随机推送孪生事件')
}

async function disconnect() {
  try {
    await ElMessageBox.confirm('确定要断开与孪生引擎的连接吗？', '断开连接', { type: 'warning' })
    adapter.value?.destroy()
    adapter.value = null
    connectionState.value = 'idle'
    ElMessage.info('已断开孪生引擎')
  } catch { /* cancel */ }
}

// ===== 生命周期 =====
onMounted(() => {
  // 启动后自动进入 Mock 模式，让页面立即有事件流可看
  startMockMode()
})

onUnmounted(() => {
  adapter.value?.destroy()
  adapter.value = null
})
</script>

<style lang="scss" scoped>
.zg-twin-adapter {
  padding: var(--zg-space-6);
  background: var(--zg-gradient-surface);
  min-height: calc(100vh - 120px);

  &__head {
    padding-bottom: var(--zg-space-5); margin-bottom: var(--zg-space-4);
    border-bottom: 1px solid var(--zg-line-soft);
    &line { display: flex; gap: var(--zg-space-4); align-items: center; }
    &__sigil {
      width: 44px; height: 44px; border-radius: var(--zg-radius-md);
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #fff; display: flex; align-items: center; justify-content: center;
    }
    &__title { margin: 0; font-size: var(--zg-text-display-md); font-weight: 700; }
    &__sub { margin: 2px 0 0; font-size: var(--zg-text-body-sm); color: var(--zg-ink-tertiary); }
  }

  &__status-bar {
    display: flex; align-items: center; gap: 10px;
    padding: var(--zg-space-3) var(--zg-space-4);
    border-radius: var(--zg-radius-md);
    margin-bottom: var(--zg-space-5);
    font-weight: 600; font-size: var(--zg-text-body-sm);
    border: 1px solid var(--zg-line-soft);

    .dot {
      width: 10px; height: 10px; border-radius: 50%;
      background: #94a3b8; position: relative;
      &::after { content: ''; position: absolute; inset: -3px; border-radius: 50%; animation: zg-pulse 1.8s ease-out infinite; }
    }

    &.is-connected { background: rgba(5,150,105,0.08); border-color: #059669; color: #047857; .dot { background: #059669; } }
    &.is-connecting { background: rgba(59,130,246,0.08); border-color: #3b82f6; color: #1d4ed8; .dot { background: #3b82f6; } }
    &.is-mock { background: rgba(99,102,241,0.08); border-color: #6366f1; color: #4f46e5; .dot { background: #6366f1; } }
    &.is-error { background: rgba(220,38,38,0.08); border-color: #dc2626; color: #b91c1c; .dot { background: #dc2626; } }
    &.is-idle { background: rgba(148,163,184,0.08); border-color: #94a3b8; color: #475569; .dot { background: #94a3b8; } }

    .stats { color: var(--zg-ink-tertiary); font-weight: 400; font-size: var(--zg-text-caption); }
    &-actions { margin-left: auto; display: flex; gap: 8px; }
  }

  &__grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: var(--zg-space-5);
  }

  &__card {
    background: var(--zg-surface-card); border: 1px solid var(--zg-line-strong);
    border-radius: var(--zg-radius-lg); padding: var(--zg-space-5);
    box-shadow: var(--zg-shadow-card);
  }

  &__card-title {
    margin: 0 0 var(--zg-space-4); font-size: var(--zg-text-body); font-weight: 700;
    display: flex; align-items: center; gap: 8px;
    color: var(--zg-ink-primary);
  }

  &__form :deep(.el-form-item__label) { font-weight: 500; color: var(--zg-ink-secondary); }
  &__inline-unit { font-size: var(--zg-text-caption); color: var(--zg-ink-tertiary); margin-left: 10px; }
  &__hint { font-size: 11px; color: var(--zg-ink-tertiary); margin-top: 4px; }

  &__event-log {
    height: 240px; overflow-y: auto;
    background: #0f172a; border-radius: var(--zg-radius-md); padding: var(--zg-space-3);
    font-family: var(--zg-font-mono); font-size: 12px;
  }

  &__event-empty {
    color: #94a3b8; text-align: center; padding: 40px 0; font-style: italic;
  }

  &__event {
    display: grid; grid-template-columns: 70px 110px 170px 1fr; gap: 8px;
    padding: 4px 0; border-bottom: 1px dashed rgba(148,163,184,0.2);
    color: #cbd5e1;
    &:last-child { border-bottom: none; }
    .time { color: #64748b; }
    .type {
      font-weight: 700; padding: 1px 6px; border-radius: 3px; display: inline-block;
      &.type--lightToggle { color: #fbbf24; background: rgba(251,191,36,0.15); }
      &.type--alarm { color: #f87171; background: rgba(248,113,113,0.15); }
      &.type--droneFly { color: #a78bfa; background: rgba(167,139,250,0.15); }
      &.type--gpsMove { color: #34d399; background: rgba(52,211,153,0.15); }
      &.type--objectClick { color: #60a5fa; background: rgba(96,165,250,0.15); }
      &.type--engineStatus { color: #22d3ee; background: rgba(34,211,238,0.15); }
    }
    .asset { color: #e2e8f0; }
    .data { color: #94a3b8; word-break: break-all; }
  }

  &__table { :deep(.el-table__cell) { font-size: 13px; } }

  // 响应式
  @media (max-width: 1200px) {
    &__grid { grid-template-columns: 1fr; }
  }
}
</style>
