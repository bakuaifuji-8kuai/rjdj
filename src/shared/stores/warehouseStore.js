/**
 * warehouseStore.js
 * 智光云枢 · 仓储模块共享 reactive store
 * 包含真状态：warehouses / stockRecords / purchaseOrders / skuCatalog
 */
import { reactive, computed } from 'vue'

// ============= 初始种子数据 =============
const SEED_WAREHOUSES = [
  {
    id: 'WH001', name: '长沙中心仓', type: 'central', location: { lat: 28.2275, lng: 112.9380 }, mgr: '李明', lastCheck: '2026-10-20',
    zones: [
      {
        id: 'A', name: '灯具货架A', cells: [
          { id: 'A12-03', skuId: 'ZG-LD-100W', qty: 15, batchNo: 'BATCH-20260815', inboundDate: '2026-10-15', assetCode: 'ASSET-LD-0003' },
          { id: 'A12-04', skuId: 'ZG-LD-100W', qty: 24, batchNo: 'BATCH-20261010', inboundDate: '2026-10-10', assetCode: 'ASSET-LD-0004' },
          { id: 'A06-01', skuId: 'ZG-LD-60W',  qty: 88, batchNo: 'BATCH-20260901', inboundDate: '2026-09-01', assetCode: 'ASSET-LD-0001' },
          { id: 'A06-02', skuId: 'ZG-DZ-220V', qty: 3, batchNo: 'BATCH-20260820', inboundDate: '2026-08-20', assetCode: 'ASSET-DZ-0001' },
          { id: 'A06-03', skuId: 'ZG-SF-DOME', qty: 12, batchNo: 'BATCH-20260715', inboundDate: '2026-07-15' },
          { id: 'A06-04', skuId: 'ZG-CTRL-4G', qty: 6, batchNo: 'BATCH-20260910', inboundDate: '2026-09-10', assetCode: 'ASSET-CTRL-0001' }
        ]
      },
      {
        id: 'B', name: '控制器货架B', cells: [
          { id: 'B01-01', skuId: 'ZG-CTRL-ZB', qty: 38, batchNo: 'BATCH-20260915', inboundDate: '2026-09-15' },
          { id: 'B01-02', skuId: 'ZG-DZ-380V', qty: 16, batchNo: 'BATCH-20260801', inboundDate: '2026-08-01' },
          { id: 'B01-03', skuId: 'ZG-METER-3P', qty: 22, batchNo: 'BATCH-20260920', inboundDate: '2026-09-20' }
        ]
      },
      {
        id: 'C', name: '配件货架C', cells: [
          { id: 'C03-01', skuId: 'ZG-JCT-BOX', qty: 120, batchNo: 'BATCH-20261001', inboundDate: '2026-10-01' },
          { id: 'C03-02', skuId: 'ZG-GRD-SENSOR', qty: 45, batchNo: 'BATCH-20260830', inboundDate: '2026-08-30' },
          { id: 'C03-03', skuId: 'ZG-SURGE-40kA', qty: 10, batchNo: 'BATCH-20260720', inboundDate: '2026-07-20' },
          { id: 'C03-04', skuId: 'ZG-BREAKER-3P63', qty: 30, batchNo: 'BATCH-20260925', inboundDate: '2026-09-25' },
          { id: 'C03-05', skuId: 'ZG-CAM-DOME', qty: 48, batchNo: 'BATCH-20260905', inboundDate: '2026-09-05' }
        ]
      }
    ]
  },
  {
    id: 'WH002', name: '先导路临时仓', type: 'temporary', location: { lat: 28.2200, lng: 112.9220 }, mgr: '王芳', lastCheck: '2026-10-15',
    zones: [
      {
        id: 'A', name: '灯具货架A', cells: [
          { id: 'A02-01', skuId: 'ZG-OV-150W', qty: 42, batchNo: 'BATCH-20260910', inboundDate: '2026-09-10', assetCode: 'ASSET-OV-0001' },
          { id: 'A02-02', skuId: 'ZG-CBL-3x70', qty: 28, batchNo: 'BATCH-20260920', inboundDate: '2026-09-20' },
          { id: 'A02-03', skuId: 'ZG-CBL-4x50', qty: 66, batchNo: 'BATCH-20260815', inboundDate: '2026-08-15' },
          { id: 'A02-04', skuId: 'ZG-POLE-6M', qty: 24, batchNo: 'BATCH-20260710', inboundDate: '2026-07-10' }
        ]
      }
    ]
  },
  {
    id: 'WH003', name: '麓谷临时仓', type: 'temporary', location: { lat: 28.2280, lng: 112.9500 }, mgr: '张伟', lastCheck: '2026-10-18',
    zones: [
      {
        id: 'A', name: '综合货架A', cells: [
          { id: 'A01-01', skuId: 'ZG-OV-250W', qty: 18, batchNo: 'BATCH-20260805', inboundDate: '2026-08-05', assetCode: 'ASSET-OV-0002' },
          { id: 'A01-02', skuId: 'ZG-SF-ROUND', qty: 55, batchNo: 'BATCH-20260901', inboundDate: '2026-09-01' },
          { id: 'A01-03', skuId: 'ZG-POLE-8M', qty: 12, batchNo: 'BATCH-20260710', inboundDate: '2026-07-10' }
        ]
      }
    ]
  }
]

const SEED_STOCK_RECORDS = [
  { id: 'REC-20261027-001', type: 'inbound', skuId: 'ZG-LD-100W', qty: 50, warehouseId: 'WH001', batchNo: 'BATCH-20261027', zoneId: 'A', cellId: 'A12-04', operator: '刘芳', relatedOrder: 'PO-20261027-001', timestamp: '2026-10-27 09:23' },
  { id: 'REC-20261027-002', type: 'outbound', skuId: 'ZG-LD-100W', qty: 5, warehouseId: 'WH001', batchNo: 'BATCH-20260815', zoneId: 'A', cellId: 'A12-03', operator: '张建国', relatedOrder: 'WO-20261027-008', timestamp: '2026-10-27 14:45' },
  { id: 'REC-20261025-003', type: 'transfer', skuId: 'ZG-OV-150W', qty: 10, warehouseId: 'WH002', batchNo: 'BATCH-20260910', zoneId: 'A', cellId: 'A02-01', operator: '王芳', relatedOrder: 'TR-20261025-002', timestamp: '2026-10-25 10:12' },
  { id: 'REC-20261020-004', type: 'return', skuId: 'ZG-DZ-220V', qty: 2, warehouseId: 'WH001', batchNo: 'BATCH-20260820', zoneId: 'A', cellId: 'A06-02', operator: '李明', relatedOrder: 'RT-20261020-001', timestamp: '2026-10-20 16:30' },
  { id: 'REC-20261015-005', type: 'scrap', skuId: 'ZG-CTRL-4G', qty: 1, warehouseId: 'WH001', batchNo: 'BATCH-20260815', zoneId: 'A', cellId: 'A06-04', operator: '李明', relatedOrder: 'SC-20261015-001', timestamp: '2026-10-15 11:00' }
]

const SEED_PURCHASE_ORDERS = [
  {
    id: 'PO-20261027-001',
    items: [
      { skuId: 'ZG-LD-100W', qty: 50, unitPrice: 56.00 }
    ],
    supplier: '欧普照明长沙代理',
    totalPrice: 2800,
    warehouse: 'WH001',
    status: 'received',
    createdAt: '2026-10-26 15:30',
    approvals: [
      { step: '主管', by: '赵刚', at: '2026-10-26 16:00', note: '同意紧急补货' },
      { step: '财务', by: '陈敏', at: '2026-10-26 17:20', note: '预算内' }
    ]
  },
  {
    id: 'PO-20261020-008',
    items: [
      { skuId: 'ZG-CBL-3x70', qty: 100, unitPrice: 18.50 },
      { skuId: 'ZG-CTRL-4G', qty: 20, unitPrice: 320.00 }
    ],
    supplier: '正泰电器长沙分公司',
    totalPrice: 8250,
    warehouse: 'WH001',
    status: 'approved',
    createdAt: '2026-10-20 09:10',
    approvals: [
      { step: '主管', by: '赵刚', at: '2026-10-20 10:00' },
      { step: '财务', by: '陈敏', at: '2026-10-20 11:30' }
    ]
  }
]

// SKU 目录
const SEED_SKU_CATALOG = [
  { sku: 'ZG-LD-100W',  desc: 'LED 路灯 · 100W 暖白', unitPrice: 56.00,  safetyStock: 30, category: '灯具' },
  { sku: 'ZG-LD-60W',   desc: 'LED 路灯 · 60W 暖白',  unitPrice: 42.00,  safetyStock: 50, category: '灯具' },
  { sku: 'ZG-OV-150W',  desc: '大功率 LED · 150W',   unitPrice: 128.00, safetyStock: 25, category: '灯具' },
  { sku: 'ZG-OV-250W',  desc: '大功率 LED · 250W',   unitPrice: 248.00, safetyStock: 20, category: '灯具' },
  { sku: 'ZG-DZ-220V',  desc: '电子镇流器 · 220V',   unitPrice: 128.00, safetyStock: 10, category: '电源' },
  { sku: 'ZG-DZ-380V',  desc: '电子镇流器 · 380V',   unitPrice: 196.00, safetyStock: 12, category: '电源' },
  { sku: 'ZG-CBL-3x70', desc: 'YJV 电缆 3×70',      unitPrice: 18.50,  safetyStock: 50, category: '电缆' },
  { sku: 'ZG-CBL-4x50', desc: 'YJV 电缆 4×50',      unitPrice: 22.00,  safetyStock: 40, category: '电缆' },
  { sku: 'ZG-SF-DOME',  desc: '球形灯罩 · PC 材质',   unitPrice: 32.00,  safetyStock: 25, category: '配件' },
  { sku: 'ZG-SF-ROUND', desc: '圆形吸顶灯罩',         unitPrice: 26.00,  safetyStock: 30, category: '配件' },
  { sku: 'ZG-CTRL-4G',  desc: '4G 智能控制器 V3',    unitPrice: 320.00, safetyStock: 15, category: '控制器' },
  { sku: 'ZG-CTRL-ZB',  desc: 'ZigBee 智能控制器',    unitPrice: 180.00, safetyStock: 20, category: '控制器' },
  { sku: 'ZG-POLE-6M',  desc: '路灯杆 · 热镀锌 6m',   unitPrice: 860.00, safetyStock: 15, category: '灯杆' },
  { sku: 'ZG-POLE-8M',  desc: '路灯杆 · 热镀锌 8m',   unitPrice: 1080.00,safetyStock: 10, category: '灯杆' },
  { sku: 'ZG-JCT-BOX',  desc: '地埋接线盒 · IP67',    unitPrice: 48.00,  safetyStock: 60, category: '配件' },
  { sku: 'ZG-GRD-SENSOR', desc: '浸水传感器',         unitPrice: 156.00, safetyStock: 20, category: '传感器' },
  { sku: 'ZG-CAM-DOME', desc: '球形摄像机',           unitPrice: 560.00, safetyStock: 20, category: '监控' },
  { sku: 'ZG-SURGE-40kA', desc: '浪涌保护器 40kA',   unitPrice: 280.00, safetyStock: 8,  category: '保护' },
  { sku: 'ZG-METER-3P', desc: '三相电表 RS485',       unitPrice: 240.00, safetyStock: 15, category: '仪表' },
  { sku: 'ZG-BREAKER-3P63', desc: '三相空开 63A',    unitPrice: 185.00, safetyStock: 20, category: '保护' }
]

const state = reactive({
  warehouses: SEED_WAREHOUSES,
  stockRecords: SEED_STOCK_RECORDS,
  purchaseOrders: SEED_PURCHASE_ORDERS,
  skuCatalog: SEED_SKU_CATALOG,
  // 月度用量（30 天滚动，用于 suggestPurchase）
  monthlyUsage: {
    'ZG-LD-100W': 12, 'ZG-LD-60W': 28, 'ZG-OV-150W': 6, 'ZG-OV-250W': 4,
    'ZG-DZ-220V': 3, 'ZG-DZ-380V': 2, 'ZG-CBL-3x70': 15, 'ZG-CBL-4x50': 10,
    'ZG-SF-DOME': 8, 'ZG-SF-ROUND': 5, 'ZG-CTRL-4G': 4, 'ZG-CTRL-ZB': 18,
    'ZG-POLE-6M': 3, 'ZG-POLE-8M': 1, 'ZG-JCT-BOX': 16, 'ZG-GRD-SENSOR': 5,
    'ZG-CAM-DOME': 7, 'ZG-SURGE-40kA': 2, 'ZG-METER-3P': 3, 'ZG-BREAKER-3P63': 6
  }
})

// ============= 计算属性 =============
function getSku(skuId) {
  return state.skuCatalog.find(s => s.sku === skuId)
}

function getWarehouse(whId) {
  return state.warehouses.find(w => w.id === whId)
}

/** 计算 SKU 在全部仓库中的总库存 */
function getTotalStock(skuId) {
  let total = 0
  for (const wh of state.warehouses) {
    for (const zone of wh.zones) {
      for (const cell of zone.cells) {
        if (cell.skuId === skuId) total += cell.qty
      }
    }
  }
  return total
}

/** 建议采购 */
function suggestPurchase(skuId) {
  const sku = getSku(skuId)
  if (!sku) return null
  const current = getTotalStock(skuId)
  const usage = state.monthlyUsage[skuId] || 0
  const safetyStock = Math.max(sku.safetyStock, usage * 1.5)
  if (current < safetyStock) {
    return {
      suggestQty: Math.ceil(safetyStock - current + usage),
      urgency: current < sku.safetyStock ? 'urgent' : 'warn',
      current, safetyStock, usage
    }
  }
  return { suggestQty: 0, urgency: 'ok', current, safetyStock, usage }
}

/** 批次追溯链 */
function traceBatch(batchNo) {
  return state.stockRecords.filter(r => r.batchNo === batchNo)
}

/** 低库存预警列表 */
const lowStockSuggestions = computed(() => {
  const list = []
  for (const sku of state.skuCatalog) {
    const s = suggestPurchase(sku.sku)
    if (s && s.urgency !== 'ok') {
      list.push({
        sku: sku.sku,
        desc: sku.desc,
        price: sku.unitPrice,
        ...s
      })
    }
  }
  return list.sort((a, b) => (b.safetyStock - b.current) - (a.safetyStock - a.current))
})

// ============= 写操作 =============
function now() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

let recordSeq = 10
function addStockRecord(record) {
  const full = { id: `REC-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(recordSeq++).padStart(3,'0')}`, timestamp: now(), ...record }
  state.stockRecords.unshift(full)
  return full
}

/** 真入库：找到仓位 cell 并增加 */
function inbound(payload) {
  const { skuId, qty, warehouseId, zoneId, cellId, batchNo, operator, relatedOrder } = payload
  const wh = getWarehouse(warehouseId)
  if (!wh) return null
  const zone = wh.zones.find(z => z.id === zoneId) || wh.zones[0]
  let cell = zone.cells.find(c => c.id === cellId)
  if (!cell) {
    // 新仓位
    const newId = `${zone.id}${String(zone.cells.length + 1).padStart(2, '0')}-01`
    cell = { id: newId, skuId, qty: 0, batchNo, inboundDate: now().slice(0, 10) }
    zone.cells.push(cell)
  }
  cell.qty += qty
  cell.skuId = skuId
  cell.batchNo = batchNo || cell.batchNo
  cell.inboundDate = cell.inboundDate || now().slice(0, 10)
  return addStockRecord({ type: 'inbound', skuId, qty, warehouseId, zoneId: zone.id, cellId: cell.id, batchNo, operator, relatedOrder })
}

/** 真出库：减少 cell.qty */
function outbound(payload) {
  const { skuId, qty, warehouseId, zoneId, cellId, batchNo, operator, relatedOrder } = payload
  const wh = getWarehouse(warehouseId)
  if (!wh) return null
  const zone = wh.zones.find(z => z.id === zoneId) || wh.zones[0]
  const cell = zone.cells.find(c => c.id === cellId)
  if (!cell) return null
  cell.qty = Math.max(0, cell.qty - qty)
  return addStockRecord({ type: 'outbound', skuId, qty, warehouseId, zoneId: zone.id, cellId: cell.id, batchNo: batchNo || cell.batchNo, operator, relatedOrder })
}

/** 盘点调整：盘亏/盘盈都走 stockRecords + 直接修正 */
function stockAdjust(warehouseId, skuId, zoneId, cellId, delta, operator, relatedOrder) {
  const wh = getWarehouse(warehouseId)
  if (!wh) return null
  const zone = wh.zones.find(z => z.id === zoneId) || wh.zones[0]
  let cell = zone.cells.find(c => c.id === cellId)
  const batchNo = cell ? cell.batchNo : ''
  if (!cell && delta > 0) {
    const newId = `${zone.id}${String(zone.cells.length + 1).padStart(2, '0')}-01`
    cell = { id: newId, skuId, qty: 0, batchNo, inboundDate: now().slice(0, 10) }
    zone.cells.push(cell)
  }
  if (cell) {
    cell.qty = Math.max(0, cell.qty + delta)
  }
  return addStockRecord({ type: delta < 0 ? 'scrap' : 'return', skuId, qty: Math.abs(delta), warehouseId, zoneId: zone.id, cellId: cellId, batchNo, operator, relatedOrder })
}

/** 创建采购申请 */
let poSeq = 3
function createPurchaseOrder({ items, supplier, warehouse, remark }) {
  const totalPrice = items.reduce((acc, it) => acc + it.qty * it.unitPrice, 0)
  const id = `PO-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(poSeq++).padStart(3,'0')}`
  const po = {
    id,
    items,
    supplier,
    warehouse,
    remark: remark || '',
    totalPrice,
    status: 'pending',
    createdAt: now(),
    approvals: []
  }
  state.purchaseOrders.unshift(po)
  return po
}

/** 审批流转：每点一次批准推进一个状态，approved 后自动入库 */
function approvePO(poId, approver, stepName) {
  const po = state.purchaseOrders.find(p => p.id === poId)
  if (!po) return null
  const flow = ['pending', 'approved', 'shipped', 'received']
  const idx = flow.indexOf(po.status)
  if (idx < flow.length - 1) {
    po.status = flow[idx + 1]
    po.approvals.push({ step: stepName || flow[idx + 1], by: approver, at: now() })
    // approved → 自动加进仓库（模拟到货）
    if (po.status === 'received') {
      for (const it of po.items) {
        inbound({
          skuId: it.skuId,
          qty: it.qty,
          warehouseId: po.warehouse,
          batchNo: `${po.id}`,
          operator: approver,
          relatedOrder: po.id
        })
      }
    }
  }
  return po
}

/** 获取 SKU 的所有 cell 列表（用于台账展示） */
function getCellsBySku(skuId) {
  const list = []
  for (const wh of state.warehouses) {
    for (const zone of wh.zones) {
      for (const cell of zone.cells) {
        if (cell.skuId === skuId) list.push({ ...cell, warehouseId: wh.id, warehouseName: wh.name, zoneName: zone.name })
      }
    }
  }
  return list
}

export const warehouseStore = {
  state,
  // 查询
  getSku, getWarehouse, getTotalStock, getCellsBySku,
  suggestPurchase, traceBatch,
  lowStockSuggestions,
  // 写操作
  inbound, outbound, stockAdjust,
  createPurchaseOrder, approvePO
}

export default warehouseStore
