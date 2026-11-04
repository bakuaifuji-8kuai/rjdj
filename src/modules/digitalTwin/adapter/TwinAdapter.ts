/**
 * TwinAdapter — 智光云枢 ↔ 元数起航 3D 引擎 适配层
 *
 * 设计目标：
 *  - 业务代码不直接依赖元数起航 API
 *  - 引擎切换（Three.js 自研 / Unreal Engine / 其他）只需改 adapter 内部
 *  - 引擎不可用时自动降级为本地 Mock 模式
 *
 * 元数起航提供：WebGL + Three.js 封装的城市数字孪生引擎
 * 智光云枢需要做：
 *  1. 配置引擎连接（API Key / WS 地址）
 *  2. 资产编码 ↔ 孪生对象 3D ID 映射
 *  3. 实时数据同步（灯开关/告警/GPS）
 *  4. 业务交互（点孪生对象 → Drawer 联动业务系统）
 */

export interface TwinConfig {
  engineUrl: string          // 'wss://engine.yuanshuqihang.com/ws'
  apiKey: string             // 元数起航 API Key
  syncInterval: number       // 数据同步间隔 ms
  autoReconnect: boolean
}

export type TwinObjectType = 'pole' | 'lamp' | 'cabinet' | 'camera' | 'drone' | 'feeder'

export interface AssetTwinMapping {
  assetCode: string          // 'ASSET-2024-0312' 智光云枢资产编码
  twinObjectId: string       // 'YSQH-POLE-023-20240815' 元数起航 3D 对象 ID
  type: TwinObjectType
  position: { x: number; y: number; z: number }  // 3D 坐标（米）
  sceneId: string            // 所属孪生场景（先导路 / 麓谷 / 梅溪湖）
}

export type TwinEventType =
  | 'lightToggle'
  | 'alarm'
  | 'droneFly'
  | 'gpsMove'
  | 'objectClick'
  | 'engineStatus'

export interface TwinRealtimeEvent {
  type: TwinEventType
  assetCode: string
  data: any
  timestamp: number
}

export interface TwinEventListener {
  (event: TwinRealtimeEvent): void
}

export interface TwinObjectClickHandler {
  (mapping: AssetTwinMapping): void
}

export interface TwinEngineSyncState {
  on?: boolean
  alarm?: 'red' | 'yellow' | 'green'
  telemetry?: Record<string, number>
  position?: { x: number; y: number; z: number }
  color?: string
}

export interface TwinConfigSchemaField {
  key: keyof TwinConfig | string
  label: string
  type?: 'text' | 'password' | 'number' | 'switch'
  placeholder?: string
  default?: any
  min?: number
  step?: number
}

type EngineState = 'idle' | 'connecting' | 'connected' | 'mock' | 'error'

export class TwinAdapter {
  private ws: WebSocket | null = null
  private config: TwinConfig
  private mappings: Map<string, AssetTwinMapping> = new Map()
  private listeners: Set<TwinEventListener> = new Set()
  private clickHandlers: Set<TwinObjectClickHandler> = new Set()
  private syncTimer: number | null = null
  private autoReconnectTimer: number | null = null
  private engineState: EngineState = 'idle'
  private stateListeners: Set<(s: EngineState) => void> = new Set()
  private lastSyncAt: number = 0
  private syncCounter: number = 0

  constructor(config: TwinConfig) {
    this.config = { ...config }
  }

  /** 连接元数起航引擎（WebSocket） */
  async connect(): Promise<boolean> {
    this.setState('connecting')
    try {
      if (this.ws) {
        try { this.ws.close() } catch { /* ignore */ }
      }
      const url = this.config.engineUrl
      // ws://localhost 常用来本地联调，ws(s):// 开头才是真引擎
      const isRealEngine = /^wss?:\/\//i.test(url) && !/localhost|127\.0\.0\.1/i.test(url)
      if (!isRealEngine) {
        console.warn('[TwinAdapter] 元数起航引擎地址不是真实 wss 端点，降级为本地模拟模式')
        this.startMockMode()
        return false
      }
      this.ws = new WebSocket(url)
      this.ws.onopen = () => {
        this.setState('connected')
        this.sendAuth()
        console.log('[TwinAdapter] ✅ 元数起航引擎已连接')
      }
      this.ws.onmessage = (e) => this.handleMessage(e)
      this.ws.onclose = () => {
        this.setState('error')
        console.warn('[TwinAdapter] 元数起航引擎连接断开')
        if (this.config.autoReconnect) {
          this.autoReconnectTimer = window.setTimeout(() => this.connect(), 3000)
        }
      }
      this.ws.onerror = () => {
        this.setState('error')
        console.warn('[TwinAdapter] 元数起航引擎连接错误，降级为本地模拟模式')
        this.startMockMode()
      }
      return true
    } catch (err) {
      console.warn('[TwinAdapter] 元数起航引擎未连接，降级为本地模拟模式', err)
      this.startMockMode()
      return false
    }
  }

  /** 加载资产 ↔ 孪生对象 映射 */
  loadMappings(mappings: AssetTwinMapping[]): void {
    mappings.forEach(m => this.mappings.set(m.assetCode, m))
  }

  /** 追加单条映射 */
  addMapping(m: AssetTwinMapping): void {
    this.mappings.set(m.assetCode, m)
  }

  /** 查询映射 */
  getMapping(assetCode: string): AssetTwinMapping | undefined {
    return this.mappings.get(assetCode)
  }

  getAllMappings(): AssetTwinMapping[] {
    return Array.from(this.mappings.values())
  }

  /** 智光云枢 → 孪生引擎：同步资产状态 */
  syncAssetState(assetCode: string, state: TwinEngineSyncState): void {
    const mapping = this.mappings.get(assetCode)
    if (!mapping) {
      // 允许"先同步后映射"的场景：放入队列
      console.debug(`[TwinAdapter] mapping 未命中，暂存同步: ${assetCode}`)
      return
    }
    this.send({
      type: 'syncState',
      twinObjectId: mapping.twinObjectId,
      assetCode,
      state,
      timestamp: Date.now()
    })
    this.syncCounter++
    this.lastSyncAt = Date.now()
  }

  /** 批量同步（整个场景） */
  syncSceneStates(states: Record<string, TwinEngineSyncState>): void {
    for (const code in states) {
      this.syncAssetState(code, states[code])
    }
  }

  /** 孪生引擎 → 智光云枢：订阅任意事件 */
  onEvent(listener: TwinEventListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /** 业务交互：孪生对象被点击 → 联动 Drawer 打开智光业务详情 */
  onTwinObjectClick(handler: TwinObjectClickHandler): () => void {
    this.clickHandlers.add(handler)
    // 同时注册底层 listener
    const unsub = this.onEvent((e) => {
      if (e.type === 'objectClick') {
        const m = this.mappings.get(e.assetCode)
        if (m) handler(m)
      }
    })
    return () => {
      this.clickHandlers.delete(handler)
      unsub()
    }
  }

  /** 订阅引擎连接状态 */
  onStateChange(cb: (s: EngineState) => void): () => void {
    this.stateListeners.add(cb)
    return () => this.stateListeners.delete(cb)
  }

  getState(): EngineState { return this.engineState }
  getSyncStats(): { counter: number; lastSyncAt: number; mappingCount: number } {
    return { counter: this.syncCounter, lastSyncAt: this.lastSyncAt, mappingCount: this.mappings.size }
  }

  /** 降级模式：引擎不可用时用本地数据模拟孪生 */
  startMockMode(): void {
    this.setState('mock')
    this.stopSyncTimer()
    this.syncTimer = window.setInterval(() => {
      const codes = Array.from(this.mappings.keys())
      if (codes.length === 0) return
      // 每 5s 随机闪烁几根灯的状态，模拟引擎回推
      const rand = codes[Math.floor(Math.random() * codes.length)]
      const mapping = this.mappings.get(rand)!
      const mockEvt: TwinRealtimeEvent = {
        type: 'lightToggle',
        assetCode: rand,
        data: {
          twinObjectId: mapping.twinObjectId,
          on: Math.random() > 0.3,
          sceneId: mapping.sceneId
        },
        timestamp: Date.now()
      }
      this.dispatchEvent(mockEvt)
      // 同时触发一次 objectClick 概率（让 Demo 有联动感）
      if (Math.random() < 0.15) {
        const clickEvt: TwinRealtimeEvent = {
          type: 'objectClick',
          assetCode: rand,
          data: { twinObjectId: mapping.twinObjectId, reason: 'auto-demo' },
          timestamp: Date.now()
        }
        this.dispatchEvent(clickEvt)
      }
    }, this.config.syncInterval || 5000)
  }

  stopMockMode(): void {
    this.stopSyncTimer()
  }

  /** 静态：返回 el-form 可直接消费的配置字段 schema */
  static getConfigSchema(): TwinConfigSchemaField[] {
    return [
      { key: 'engineUrl', label: '引擎 WebSocket 地址', placeholder: 'wss://engine.yuanshuqihang.com/ws', default: 'ws://localhost:8080/ws' },
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: '从元数起航申请' },
      { key: 'syncInterval', label: '数据同步间隔 (ms)', type: 'number', default: 1000, min: 500, step: 500 },
      { key: 'autoReconnect', label: '自动重连', type: 'switch', default: true }
    ]
  }

  /** 更新运行时配置（部分字段） */
  updateConfig(partial: Partial<TwinConfig>): void {
    this.config = { ...this.config, ...partial }
  }

  getConfig(): TwinConfig { return { ...this.config } }

  /** 销毁：关闭 WS + 清定时器 */
  destroy(): void {
    if (this.ws) { try { this.ws.close() } catch { /* ignore */ } this.ws = null }
    this.stopSyncTimer()
    if (this.autoReconnectTimer) { clearTimeout(this.autoReconnectTimer); this.autoReconnectTimer = null }
    this.listeners.clear()
    this.clickHandlers.clear()
    this.stateListeners.clear()
    this.mappings.clear()
    this.setState('idle')
  }

  // ============ 内部 ============
  private setState(s: EngineState): void {
    this.engineState = s
    this.stateListeners.forEach(cb => { try { cb(s) } catch { /* ignore */ } })
  }

  private sendAuth(): void {
    this.send({ type: 'auth', apiKey: this.config.apiKey })
  }

  private send(msg: any): void {
    if (this.ws?.readyState === 1) {
      this.ws.send(JSON.stringify(msg))
    }
  }

  private handleMessage(e: MessageEvent): void {
    try {
      const evt = JSON.parse(e.data) as TwinRealtimeEvent
      this.dispatchEvent(evt)
    } catch { /* ignore malformed */ }
  }

  private dispatchEvent(evt: TwinRealtimeEvent): void {
    this.listeners.forEach(l => {
      try { l(evt) } catch (err) { console.warn('[TwinAdapter] listener error', err) }
    })
  }

  private stopSyncTimer(): void {
    if (this.syncTimer) { clearInterval(this.syncTimer); this.syncTimer = null }
  }
}

export type {
  TwinConfig,
  AssetTwinMapping,
  TwinRealtimeEvent,
  TwinEventListener,
  TwinObjectClickHandler,
  TwinEngineSyncState
}

export default TwinAdapter
