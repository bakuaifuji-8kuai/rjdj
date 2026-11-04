/**
 * 运维组织共享数据 Store（原生 Vue 3 reactive，无需 Pinia）
 * 供 DispatchBoard / CertCenter / PatrolRecord / PerformanceBoard / OrgChart / PatrolPlan 共同读写
 */
import { reactive, computed, ref } from 'vue'

// ============ 真实 GPS 工具 ============
export function calcDistance(a, b) {
  const R = 6371000
  const toRad = (d) => d * Math.PI / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(s))
}

// 地图经纬度 → SVG 坐标（先导路 28.22 ~ 麓谷 28.26 lat, 112.90 ~ 112.96 lng）
const LAT_MIN = 28.215, LAT_MAX = 28.265
const LNG_MIN = 112.895, LNG_MAX = 112.965
export function gpsToSvg(gps, viewBoxW = 400, viewBoxH = 300) {
  const x = ((gps.lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * viewBoxW
  const y = (1 - (gps.lat - LAT_MIN) / (LAT_MAX - LAT_MIN)) * viewBoxH
  return [x, y]
}

// ============ Mock 初始化数据 ============
// 真实经纬度（长沙）：先导路 28.2275,112.9380 · 麓谷 28.2520,112.9475 · 梅溪湖 28.2410,112.9055
const INIT_STAFF = [
  {
    id: 1, name: '张建国', phone: '138****0001', status: 'idle',
    skills: ['换LED', '修摄像头', '380V', '登高证'],
    gps: { lat: 28.2275, lng: 112.9380 }, load: 0, currentOrderId: null,
    color: '#f59e0b', teamId: 'team-1', teamPath: ['运维部', '一分队'],
    certs: {
      dengao: { valid: true, expiry: '2027-11-10', certNo: 'GD-2024-001' },
      dengong: { valid: true, expiry: '2027-06-15', certNo: 'DG-2024-033' },
      xianjin: { valid: true, expiry: '2027-06-15', certNo: 'DY-2024-055' }
    }
  },
  {
    id: 2, name: '李明', phone: '138****0009', status: 'working',
    skills: ['换LED', '修摄像头', '登高证'],
    gps: { lat: 28.2410, lng: 112.9055 }, load: 2, currentOrderId: 'WO-202610-0422',
    color: '#10b981', teamId: 'team-2', teamPath: ['运维部', '二分队'],
    certs: {
      dengao: { valid: true, expiry: '2026-11-12', certNo: 'GD-2024-021' },
      dengong: { valid: true, expiry: '2027-06-20', certNo: 'DG-2024-055a' }
    }
  },
  {
    id: 3, name: '王强', phone: '138****0015', status: 'working',
    skills: ['换LED', '有限空间', '380V', '登高证'],
    gps: { lat: 28.2310, lng: 112.9220 }, load: 3, currentOrderId: 'WO-202610-0424',
    color: '#3b82f6', teamId: 'team-3', teamPath: ['运维部', '隧道专项组'],
    certs: {
      dengao: { valid: true, expiry: '2027-03-10', certNo: 'GD-2024-066' },
      xianjin: { valid: true, expiry: '2027-01-10', certNo: 'DY-2024-144' },
      youxianspace: { valid: false, expiry: '2026-10-25', certNo: 'YXKJ-2024-003' } // 已过期 3 天
    }
  },
  {
    id: 4, name: '张伟', phone: '138****0002', status: 'idle',
    skills: ['换LED', '修摄像头', '登高证'],
    gps: { lat: 28.2290, lng: 112.9400 }, load: 1, currentOrderId: null,
    color: '#8b5cf6', teamId: 'team-1', teamPath: ['运维部', '一分队'],
    certs: {
      dengao: { valid: true, expiry: '2026-12-01', certNo: 'GD-2024-088' },
      dengong: { valid: true, expiry: '2027-02-05', certNo: 'DG-2024-177' }
    }
  },
  {
    id: 5, name: '李磊', phone: '138****0003', status: 'patrol',
    skills: ['换LED', '380V', '登高证'],
    gps: { lat: 28.2520, lng: 112.9475 }, load: 2, currentOrderId: null,
    color: '#ec4899', teamId: 'team-1', teamPath: ['运维部', '一分队'],
    certs: {
      dengao: { valid: true, expiry: '2026-11-05', certNo: 'GD-2024-008' },
      xianjin: { valid: true, expiry: '2027-01-10', certNo: 'DY-2024-144' }
    }
  },
  {
    id: 6, name: '王芳', phone: '138****0011', status: 'idle',
    skills: ['换LED', '380V', '焊工证'],
    gps: { lat: 28.2450, lng: 112.9100 }, load: 0, currentOrderId: null,
    color: '#06b6d4', teamId: 'team-2', teamPath: ['运维部', '二分队'],
    certs: {
      hg: { valid: true, expiry: '2027-04-01', certNo: 'HG-2024-012' },
      xianjin: { valid: true, expiry: '2027-06-15', certNo: 'DY-2024-055' }
    }
  },
  {
    id: 7, name: '陈明', phone: '138****0005', status: 'working',
    skills: ['换LED', '修摄像头', '有限空间', '登高证'],
    gps: { lat: 28.2260, lng: 112.9350 }, load: 2, currentOrderId: 'WO-202610-0433',
    color: '#f97316', teamId: 'team-1', teamPath: ['运维部', '一分队'],
    certs: {
      dengao: { valid: true, expiry: '2027-05-20', certNo: 'GD-2024-122' },
      xianjin: { valid: true, expiry: '2026-12-05', certNo: 'DY-2024-055' }
    }
  },
  {
    id: 8, name: '周涛', phone: '138****0013', status: 'idle',
    skills: ['换LED', '登高证'],
    gps: { lat: 28.2400, lng: 112.9070 }, load: 0, currentOrderId: null,
    color: '#84cc16', teamId: 'team-2', teamPath: ['运维部', '二分队'],
    certs: {
      dengao: { valid: true, expiry: '2026-11-25', certNo: 'GD-2024-166' },
      dengong: { valid: true, expiry: '2027-06-20', certNo: 'DG-2024-055a' }
    }
  }
]

const INIT_TICKETS = [
  { id: 1, no: 'WO-202610-0421', title: '先导路#18 路灯不亮', location: '先导路#18', type: '故障维修', priority: 'urgent', skillNeeded: '换LED', certNeeded: '登高证', gps: { lat: 28.2278, lng: 112.9383 }, status: 'pending' },
  { id: 2, no: 'WO-202610-0422', title: '梅溪湖#12 摄像头离线', location: '梅溪湖#12', type: '摄像头', priority: 'high', skillNeeded: '修摄像头', certNeeded: '', gps: { lat: 28.2415, lng: 112.9060 }, status: 'pending' },
  { id: 3, no: 'WO-202610-0423', title: '金星大道#07 配电箱告警', location: '金星大道#07', type: '配电箱', priority: 'high', skillNeeded: '380V', certNeeded: '380V操作证', gps: { lat: 28.2350, lng: 112.9180 }, status: 'pending' },
  { id: 4, no: 'WO-202610-0424', title: '麓山隧道#02 灯组异响', location: '麓山隧道#02', type: '隧道灯', priority: 'mid', skillNeeded: '换LED', certNeeded: '有限空间作业证', gps: { lat: 28.2320, lng: 112.9210 }, status: 'pending' },
  { id: 5, no: 'WO-202610-0425', title: '先导路#33 灯杆倾斜', location: '先导路#33', type: '安全隐患', priority: 'urgent', skillNeeded: '换LED', certNeeded: '登高证', gps: { lat: 28.2260, lng: 112.9365 }, status: 'pending' },
  { id: 6, no: 'WO-202610-0426', title: '芙蓉路#05 线缆破损', location: '芙蓉路#05', type: '线缆', priority: 'high', skillNeeded: '380V', certNeeded: '', gps: { lat: 28.2380, lng: 112.9300 }, status: 'pending' },
  { id: 7, no: 'WO-202610-0427', title: '年嘉湖隧道照明灯灭', location: '年嘉湖隧道', type: '隧道灯', priority: 'mid', skillNeeded: '换LED', certNeeded: '有限空间作业证', gps: { lat: 28.2430, lng: 112.9200 }, status: 'pending' },
  { id: 8, no: 'WO-202610-0428', title: '营盘路隧道应急灯故障', location: '营盘路隧道', type: '隧道灯', priority: 'high', skillNeeded: '换LED', certNeeded: '有限空间作业证', gps: { lat: 28.2370, lng: 112.9150 }, status: 'pending' },
  { id: 9, no: 'WO-202610-0429', title: '湘江路#12 光源闪烁', location: '湘江路#12', type: '故障维修', priority: 'mid', skillNeeded: '换LED', certNeeded: '', gps: { lat: 28.2300, lng: 112.9450 }, status: 'pending' },
  { id: 10, no: 'WO-202610-0430', title: '五一大道#08 补光灯失效', location: '五一大道#08', type: '故障维修', priority: 'low', skillNeeded: '换LED', certNeeded: '', gps: { lat: 28.2340, lng: 112.9370 }, status: 'pending' },
  { id: 11, no: 'WO-202610-0431', title: '火车站广场#22 亮度不足', location: '火车站广场', type: '亮度调整', priority: 'low', skillNeeded: '换LED', certNeeded: '', gps: { lat: 28.2280, lng: 112.9550 }, status: 'pending' },
  { id: 12, no: 'WO-202610-0432', title: '会展中心#15 配电箱故障', location: '会展中心', type: '配电箱', priority: 'high', skillNeeded: '380V', certNeeded: '380V操作证', gps: { lat: 28.2310, lng: 112.9580 }, status: 'pending' },
  { id: 13, no: 'WO-202610-0433', title: '星沙东二路#05 线缆被盗', location: '星沙东二路', type: '线缆', priority: 'urgent', skillNeeded: '380V', certNeeded: '', gps: { lat: 28.2550, lng: 112.9600 }, status: 'pending' },
  { id: 14, no: 'WO-202610-0434', title: '广电中心#01 摄像头画面抖动', location: '广电中心', type: '摄像头', priority: 'mid', skillNeeded: '修摄像头', certNeeded: '', gps: { lat: 28.2480, lng: 112.9430 }, status: 'pending' },
  { id: 15, no: 'WO-202610-0435', title: '月湖公园#03 庭院灯破损', location: '月湖公园', type: '设施损坏', priority: 'low', skillNeeded: '换LED', certNeeded: '', gps: { lat: 28.2450, lng: 112.9500 }, status: 'pending' }
]

// 历史工单（绩效计算用）
const INIT_ORDERS = [
  // 张建国
  { id: 'h1', assignee: 1, title: '先导路#03 换LED', createdAt: Date.now() - 3600e3 * 30, startedAt: Date.now() - 3600e3 * 29.5, finishedAt: Date.now() - 3600e3 * 28, repairCount: 1, safetyIssue: false, status: 'done' },
  { id: 'h2', assignee: 1, title: '先导路#07 配电箱检修', createdAt: Date.now() - 3600e3 * 24, startedAt: Date.now() - 3600e3 * 23, finishedAt: Date.now() - 3600e3 * 22, repairCount: 1, safetyIssue: false, status: 'done' },
  { id: 'h3', assignee: 1, title: '先导路#12 摄像头离线', createdAt: Date.now() - 3600e3 * 12, startedAt: Date.now() - 3600e3 * 11.3, finishedAt: Date.now() - 3600e3 * 10, repairCount: 1, safetyIssue: false, status: 'done' },
  // 李明
  { id: 'h4', assignee: 2, title: '梅溪湖#05 换LED', createdAt: Date.now() - 3600e3 * 28, startedAt: Date.now() - 3600e3 * 27, finishedAt: Date.now() - 3600e3 * 25, repairCount: 1, safetyIssue: false, status: 'done' },
  { id: 'h5', assignee: 2, title: '梅溪湖#09 灯头不亮', createdAt: Date.now() - 3600e3 * 18, startedAt: Date.now() - 3600e3 * 17.5, finishedAt: Date.now() - 3600e3 * 16, repairCount: 2, safetyIssue: false, status: 'done' },
  // 王强
  { id: 'h6', assignee: 3, title: '麓山隧道#01 应急灯', createdAt: Date.now() - 3600e3 * 40, startedAt: Date.now() - 3600e3 * 39, finishedAt: Date.now() - 3600e3 * 36, repairCount: 1, safetyIssue: false, status: 'done' },
  { id: 'h7', assignee: 3, title: '麓山隧道#03 镇流器', createdAt: Date.now() - 3600e3 * 20, startedAt: Date.now() - 3600e3 * 19.5, finishedAt: Date.now() - 3600e3 * 17, repairCount: 2, safetyIssue: true, status: 'done' },
  // 张伟
  { id: 'h8', assignee: 4, title: '先导路#02 换LED', createdAt: Date.now() - 3600e3 * 15, startedAt: Date.now() - 3600e3 * 14.6, finishedAt: Date.now() - 3600e3 * 13, repairCount: 1, safetyIssue: false, status: 'done' },
  { id: 'h9', assignee: 4, title: '先导路#09 摄像头', createdAt: Date.now() - 3600e3 * 8, startedAt: Date.now() - 3600e3 * 7, finishedAt: Date.now() - 3600e3 * 6, repairCount: 1, safetyIssue: false, status: 'done' },
  // 李磊
  { id: 'h10', assignee: 5, title: '麓谷#01 灯杆倾斜', createdAt: Date.now() - 3600e3 * 35, startedAt: Date.now() - 3600e3 * 34, finishedAt: Date.now() - 3600e3 * 32, repairCount: 1, safetyIssue: false, status: 'done' },
  // 王芳
  { id: 'h11', assignee: 6, title: '梅溪湖服务区配电箱', createdAt: Date.now() - 3600e3 * 22, startedAt: Date.now() - 3600e3 * 21, finishedAt: Date.now() - 3600e3 * 20, repairCount: 1, safetyIssue: false, status: 'done' },
  // 陈明
  { id: 'h12', assignee: 7, title: '先导路#33 线缆维修', createdAt: Date.now() - 3600e3 * 10, startedAt: Date.now() - 3600e3 * 9.5, finishedAt: Date.now() - 3600e3 * 8, repairCount: 1, safetyIssue: false, status: 'done' },
  // 周涛
  { id: 'h13', assignee: 8, title: '梅溪湖#3 换LED', createdAt: Date.now() - 3600e3 * 16, startedAt: Date.now() - 3600e3 * 15.5, finishedAt: Date.now() - 3600e3 * 14, repairCount: 1, safetyIssue: false, status: 'done' }
]

// 巡检记录（绩效计算用）
const INIT_PATROL_RECORDS = [
  { id: 'p1', empId: 1, pointId: 1, pointName: '先导路#01', status: 'done', time: Date.now() - 86400e3 * 2 },
  { id: 'p2', empId: 1, pointId: 2, pointName: '先导路#02', status: 'done', time: Date.now() - 86400e3 * 2 },
  { id: 'p3', empId: 1, pointId: 3, pointName: '先导路#03', status: 'done', time: Date.now() - 86400e3 * 2 },
  { id: 'p4', empId: 2, pointId: 10, pointName: '梅溪湖#10', status: 'done', time: Date.now() - 86400e3 * 1 },
  { id: 'p5', empId: 2, pointId: 11, pointName: '梅溪湖#11', status: 'done', time: Date.now() - 86400e3 * 1 },
  { id: 'p6', empId: 3, pointId: 20, pointName: '麓山隧道#01', status: 'done', time: Date.now() - 86400e3 * 3 },
  { id: 'p7', empId: 3, pointId: 21, pointName: '麓山隧道#02', status: 'missed', time: Date.now() - 86400e3 * 3 },
  { id: 'p8', empId: 4, pointId: 4, pointName: '先导路#04', status: 'done', time: Date.now() - 86400e3 * 1 },
  { id: 'p9', empId: 5, pointId: 30, pointName: '麓谷#01', status: 'done', time: Date.now() - 86400e3 * 4 },
  { id: 'p10', empId: 5, pointId: 31, pointName: '麓谷#02', status: 'done', time: Date.now() - 86400e3 * 4 },
  { id: 'p11', empId: 6, pointId: 15, pointName: '梅溪湖服务区', status: 'done', time: Date.now() - 86400e3 * 1 },
  { id: 'p12', empId: 7, pointId: 5, pointName: '先导路#05', status: 'done', time: Date.now() - 86400e3 * 2 },
  { id: 'p13', empId: 8, pointId: 12, pointName: '梅溪湖#3', status: 'done', time: Date.now() - 86400e3 * 1 },
  { id: 'p14', empId: 8, pointId: 13, pointName: '梅溪湖#4', status: 'done', time: Date.now() - 86400e3 * 1 }
]

// 巡检点（真实经纬度）
const INIT_PATROL_POINTS = [
  { id: 1, poleNo: 'P01', name: '先导路#01', gps: { lat: 28.2272, lng: 112.9375 } },
  { id: 2, poleNo: 'P02', name: '先导路#02', gps: { lat: 28.2276, lng: 112.9378 } },
  { id: 3, poleNo: 'P03', name: '先导路#03', gps: { lat: 28.2280, lng: 112.9382 } },
  { id: 4, poleNo: 'P04', name: '先导路#04', gps: { lat: 28.2284, lng: 112.9386 } },
  { id: 5, poleNo: 'P05', name: '先导路#05', gps: { lat: 28.2288, lng: 112.9390 } },
  { id: 6, poleNo: 'P06', name: '先导路#06', gps: { lat: 28.2292, lng: 112.9394 } },
  { id: 7, poleNo: 'P07', name: '先导路#07', gps: { lat: 28.2296, lng: 112.9398 } },
  { id: 8, poleNo: 'P08', name: '先导路#08', gps: { lat: 28.2300, lng: 112.9402 } }
]

// ============ 响应式 Store ============
export const staff = reactive(INIT_STAFF)
export const tickets = reactive([...INIT_TICKETS])
export const orders = reactive([...INIT_ORDERS])
export const patrolRecords = reactive([...INIT_PATROL_RECORDS])
export const patrolPoints = reactive(INIT_PATROL_POINTS)

// ============ 推荐算法 ============
export function recommendScore(input) {
  const skillMatch =
    input.ticketRequiredSkill && input.staffSkills.includes(input.ticketRequiredSkill)
      ? 1
      : 0.5
  const distanceWeight = 1 - Math.min(input.staffDistance / 5000, 1)
  const loadWeight = 1 - input.staffLoad
  const certWeight = input.hasRequiredCert ? 1 : 0
  return skillMatch * 0.4 + distanceWeight * 0.3 + loadWeight * 0.2 + certWeight * 0.1
}

// ============ 绩效计算 ============
export function calcStaffPerformance(staffId) {
  const myOrders = orders.filter((o) => o.assignee === staffId)
  const myPatrols = patrolRecords.filter((p) => p.empId === staffId)
  const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0)
  const responseMinutes = avg(
    myOrders.map((o) => ((o.startedAt || o.createdAt) - o.createdAt) / 60000)
  )
  const firstFixRate = myOrders.length
    ? myOrders.filter((o) => o.repairCount <= 1).length / myOrders.length
    : 0
  const reworkRate = myOrders.length
    ? myOrders.filter((o) => o.repairCount > 1).length / myOrders.length
    : 0
  const patrolRate = myPatrols.length
    ? myPatrols.filter((p) => p.status === 'done').length / myPatrols.length
    : 1 // 没巡检记录视为 100%
  const safety = myOrders.filter((o) => o.safetyIssue).length === 0 ? 100 : 0

  const score =
    20 * (30 / Math.max(responseMinutes, 1)) +
    30 * firstFixRate +
    15 * (1 - reworkRate) +
    20 * patrolRate +
    15 * (safety / 100)

  return {
    score: Math.round(score * 10) / 10,
    responseTime: Math.round(responseMinutes),
    firstFixRate: Math.round(firstFixRate * 100),
    reworkRate: Math.round(reworkRate * 100),
    patrolRate: Math.round(patrolRate * 100),
    safety
  }
}

// ============ 派工单（公共方法） ============
/**
 * 执行派单：把 ticket 派给 staff
 * 返回 { ok, reason? }
 */
export function dispatchTicket(ticket, s) {
  // 1) 资质校验
  if (ticket.certNeeded) {
    const certMap = {
      '登高证': 'dengao',
      '电工证': 'dengong',
      '380V操作证': 'xianjin',
      '有限空间作业证': 'youxianspace',
      '焊工证': 'hg'
    }
    const key = certMap[ticket.certNeeded]
    if (key) {
      const c = s.certs[key]
      if (!c || !c.valid) {
        return { ok: false, reason: `${s.name} 的${ticket.certNeeded}已过期或未持，禁止派此类工单` }
      }
    }
  }

  // 2) 更新工单状态
  ticket.status = 'assigned'
  // 从 tickets 池移除（保留在 orders 里）
  const ordersEntry = {
    id: ticket.no,
    assignee: s.id,
    title: ticket.title,
    createdAt: Date.now(),
    startedAt: Date.now(),
    finishedAt: null,
    repairCount: 1,
    safetyIssue: false,
    status: 'working',
    skillNeeded: ticket.skillNeeded,
    certNeeded: ticket.certNeeded,
    gps: ticket.gps
  }
  orders.unshift(ordersEntry)

  // 3) 更新人员状态
  s.currentOrderId = ticket.no
  s.status = 'working'
  s.load = Math.min(3, s.load + 1)

  // 4) 从 ticket 池移除
  const idx = tickets.findIndex((t) => t.id === ticket.id)
  if (idx >= 0) tickets.splice(idx, 1)

  return { ok: true }
}

// ============ 模拟定时器 ============
let simTimer = null
export function startSimulation() {
  if (simTimer) return
  simTimer = setInterval(() => {
    // 每 30s 概率触发一个新工单
    if (Math.random() < 0.15) {
      const n = tickets.length + 1
      tickets.push({
        id: Date.now(),
        no: 'WO-' + Date.now().toString().slice(-6),
        title: '模拟新工单 #' + n,
        location: '模拟路段',
        type: '故障维修',
        priority: ['low', 'mid', 'high'][Math.floor(Math.random() * 3)],
        skillNeeded: ['换LED', '修摄像头', '380V'][Math.floor(Math.random() * 3)],
        certNeeded: '',
        gps: {
          lat: 28.22 + Math.random() * 0.04,
          lng: 112.91 + Math.random() * 0.04
        },
        status: 'pending'
      })
    }
  }, 30000)
}
export function stopSimulation() {
  if (simTimer) {
    clearInterval(simTimer)
    simTimer = null
  }
}
