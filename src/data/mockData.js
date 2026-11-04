/**
 * 智光云枢-Mock 业务数据池
 * 业务域：lampNet / energyPulse / terminalAtlas /
 *        scenarioOrch / opsTicket / tubeLumen
 * 说明：所有数据均为仿真，仅用于界面演示
 */

export const lightStatusData = [
  { nodeSn: 'LMP001', label: '先导路-入口段-001', lifecycle: 'IN_SERVICE', luminancePct: 85, loadWatt: 45, lastHeartbeatAt: '2024-01-15 14:30:22', geoLabel: '长沙-岳麓区-先导路入口段' },
  { nodeSn: 'LMP002', label: '先导路-入口段-002', lifecycle: 'IN_SERVICE', luminancePct: 70, loadWatt: 38, lastHeartbeatAt: '2024-01-15 14:30:18', geoLabel: '长沙-岳麓区-先导路入口段' },
  { nodeSn: 'LMP003', label: '先导路-基本段-001', lifecycle: 'OFFLINE', luminancePct: 0, loadWatt: 0, lastHeartbeatAt: '2024-01-15 14:28:45', geoLabel: '长沙-岳麓区-先导路基本段' },
  { nodeSn: 'LMP004', label: '先导路-基本段-002', lifecycle: 'IN_SERVICE', luminancePct: 90, loadWatt: 48, lastHeartbeatAt: '2024-01-15 14:30:20', geoLabel: '长沙-岳麓区-先导路基本段' },
  { nodeSn: 'LMP005', label: '先导路-出口段-001', lifecycle: 'IN_SERVICE', luminancePct: 65, loadWatt: 35, lastHeartbeatAt: '2024-01-15 14:30:15', geoLabel: '长沙-岳麓区-先导路出口段' },
  { nodeSn: 'LMP006', label: '先导路-出口段-002', lifecycle: 'FAULT', luminancePct: 0, loadWatt: 0, lastHeartbeatAt: '2024-01-15 10:15:33', geoLabel: '长沙-岳麓区-先导路出口段' },
  { nodeSn: 'LMP007', label: '先导路-应急灯网-001', lifecycle: 'IN_SERVICE', luminancePct: 80, loadWatt: 42, lastHeartbeatAt: '2024-01-15 14:30:21', geoLabel: '长沙-岳麓区-先导路中央' },
  { nodeSn: 'LMP008', label: '先导路-应急灯网-002', lifecycle: 'IN_SERVICE', luminancePct: 75, loadWatt: 40, lastHeartbeatAt: '2024-01-15 14:30:19', geoLabel: '长沙-岳麓区-先导路中央' },
  { nodeSn: 'LMP009', label: '先导路-应急灯网-003', lifecycle: 'OFFLINE', luminancePct: 0, loadWatt: 0, lastHeartbeatAt: '2024-01-15 06:30:00', geoLabel: '长沙-岳麓区-先导路中央' },
  { nodeSn: 'LMP010', label: '先导路-入口段-003', lifecycle: 'IN_SERVICE', luminancePct: 88, loadWatt: 46, lastHeartbeatAt: '2024-01-15 14:30:22', geoLabel: '长沙-岳麓区-先导路入口段' }
]

export const timingStrategies = [
  { presetSn: 'PRST001', label: '日常灯网策略', activateAt: '18:30', deactivateAt: '06:00', luminancePct: 100, enabled: true, createdAt: '2024-01-01' },
  { presetSn: 'PRST002', label: '节能模式策略', activateAt: '22:00', deactivateAt: '05:00', luminancePct: 50, enabled: true, createdAt: '2024-01-05' },
  { presetSn: 'PRST003', label: '周末灯网策略', activateAt: '19:00', deactivateAt: '07:00', luminancePct: 90, enabled: false, createdAt: '2024-01-10' },
  { presetSn: 'PRST004', label: '节假日策略', activateAt: '18:00', deactivateAt: '08:00', luminancePct: 100, enabled: false, createdAt: '2024-01-12' }
]

export const distributionBoxes = [
  { cabSn: 'CAB001', label: '先导路入口段馈电柜', lifecycle: 'IN_SERVICE', voltageProbe: 220.5, amperageProbe: 45.2, loadWatt: 9911, loadPct: 68, lastHeartbeatAt: '2024-01-15 14:30:22' },
  { cabSn: 'CAB002', label: '先导路基本段馈电柜', lifecycle: 'IN_SERVICE', voltageProbe: 219.8, amperageProbe: 38.6, loadWatt: 8484, loadPct: 52, lastHeartbeatAt: '2024-01-15 14:30:20' },
  { cabSn: 'CAB003', label: '先导路出口段馈电柜', lifecycle: 'ALERT', voltageProbe: 215.2, amperageProbe: 52.3, loadWatt: 11255, loadPct: 85, lastHeartbeatAt: '2024-01-15 14:30:18' },
  { cabSn: 'CAB004', label: '先导路应急馈电柜', lifecycle: 'IN_SERVICE', voltageProbe: 221.1, amperageProbe: 32.8, loadWatt: 7252, loadPct: 45, lastHeartbeatAt: '2024-01-15 14:30:15' },
  { cabSn: 'CAB005', label: '先导路备用馈电柜', lifecycle: 'FAULT', voltageProbe: 0, amperageProbe: 0, loadWatt: 0, loadPct: 0, lastHeartbeatAt: '2024-01-15 10:20:33', faultTrace: '短路保护触发' }
]

export const circuitData = [
  { loopSn: 'LOOP001', boxId: 'D001', label: '链路1-入口段左侧', loadWatt: 3200, energy: 1560, voltageProbe: 220.5, amperageProbe: 14.5, powerFactor: 0.95 },
  { loopSn: 'LOOP002', boxId: 'D001', label: '链路2-入口段右侧', loadWatt: 3400, energy: 1680, voltageProbe: 220.3, amperageProbe: 15.4, powerFactor: 0.94 },
  { loopSn: 'LOOP003', boxId: 'D001', label: '链路3-入口段应急', loadWatt: 3311, energy: 1620, voltageProbe: 220.7, amperageProbe: 15.0, powerFactor: 0.96 },
  { loopSn: 'LOOP004', boxId: 'D002', label: '链路1-基本段左侧', loadWatt: 2800, energy: 1350, voltageProbe: 219.8, amperageProbe: 12.8, powerFactor: 0.95 },
  { loopSn: 'LOOP005', boxId: 'D002', label: '链路2-基本段右侧', loadWatt: 2900, energy: 1420, voltageProbe: 219.5, amperageProbe: 13.2, powerFactor: 0.94 },
  { loopSn: 'LOOP006', boxId: 'D002', label: '链路3-基本段应急', loadWatt: 2784, energy: 1310, voltageProbe: 220.1, amperageProbe: 12.6, powerFactor: 0.96 },
  { loopSn: 'LOOP007', boxId: 'D003', label: '链路1-出口段左侧', loadWatt: 3800, energy: 1820, voltageProbe: 215.2, amperageProbe: 17.7, powerFactor: 0.92 },
  { loopSn: 'LOOP008', boxId: 'D003', label: '链路2-出口段右侧', loadWatt: 3700, energy: 1780, voltageProbe: 214.8, amperageProbe: 17.2, powerFactor: 0.93 },
  { loopSn: 'LOOP009', boxId: 'D003', label: '链路3-出口段应急', loadWatt: 3755, energy: 1800, voltageProbe: 215.5, amperageProbe: 17.4, powerFactor: 0.91 },
  { loopSn: 'LOOP010', boxId: 'D004', label: '链路1-中央应急灯网', loadWatt: 3600, energy: 1750, voltageProbe: 221.1, amperageProbe: 16.3, powerFactor: 0.95 }
]

export const deviceList = [
  { cabSn: 'CABVC001', label: '隧道LED灯网灯-A001', model: 'SL-LED-200W', type: '隧道LED灯', status: 'online', installDate: '2023-06-15', geoLabel: '长沙-岳麓区-先导路入口段', voltageProbe: 220, loadWatt: 200, luminancePct: 85, lastMaintenance: '2024-01-01' },
  { cabSn: 'CABVC002', label: '隧道LED灯网灯-A002', model: 'SL-LED-150W', type: '隧道LED灯', status: 'online', installDate: '2023-06-16', geoLabel: '长沙-岳麓区-先导路入口段', voltageProbe: 220, loadWatt: 150, luminancePct: 70, lastMaintenance: '2024-01-05' },
  { cabSn: 'CABVC003', label: '隧道LED灯网灯-B001', model: 'SL-LED-200W', type: '隧道LED灯', status: 'offline', installDate: '2023-07-01', geoLabel: '长沙-岳麓区-先导路基本段', voltageProbe: 220, loadWatt: 200, luminancePct: 0, lastMaintenance: '2023-12-15' },
  { cabSn: 'CABVC004', label: '隧道LED灯网灯-B002', model: 'SL-LED-150W', type: '隧道LED灯', status: 'online', installDate: '2023-07-02', geoLabel: '长沙-岳麓区-先导路基本段', voltageProbe: 220, loadWatt: 150, luminancePct: 90, lastMaintenance: '2024-01-10' },
  { cabSn: 'CABVC005', label: '隧道LED灯网灯-C001', model: 'SL-LED-180W', type: '隧道LED灯', status: 'online', installDate: '2023-08-01', geoLabel: '长沙-岳麓区-先导路出口段', voltageProbe: 220, loadWatt: 180, luminancePct: 65, lastMaintenance: '2023-12-20' },
  { cabSn: 'CABVC006', label: '隧道LED灯网灯-C002', model: 'SL-LED-200W', type: '隧道LED灯', lifecycle: 'FAULT', installDate: '2023-08-02', geoLabel: '长沙-岳麓区-先导路出口段', voltageProbe: 0, loadWatt: 200, luminancePct: 0, lastMaintenance: '2023-11-01', faultTrace: '驱动异常' },
  { cabSn: 'CABVC007', label: '隧道应急灯网灯-D001', model: 'SL-LED-150W', type: '隧道应急灯', status: 'online', installDate: '2023-09-01', geoLabel: '长沙-岳麓区-先导路中央', voltageProbe: 220, loadWatt: 150, luminancePct: 80, lastMaintenance: '2024-01-08' },
  { cabSn: 'CABVC008', label: '隧道应急灯网灯-D002', model: 'SL-LED-150W', type: '隧道应急灯', status: 'online', installDate: '2023-09-02', geoLabel: '长沙-岳麓区-先导路中央', voltageProbe: 220, loadWatt: 150, luminancePct: 75, lastMaintenance: '2024-01-12' },
  { cabSn: 'CABVC009', label: '隧道应急灯网灯-E001', model: 'SL-LED-200W', type: '隧道应急灯', status: 'offline', installDate: '2023-10-01', geoLabel: '长沙-岳麓区-先导路中央', voltageProbe: 220, loadWatt: 200, luminancePct: 0, lastMaintenance: '2023-12-01' },
  { cabSn: 'CABVC010', label: '隧道LED灯网灯-E002', model: 'SL-LED-180W', type: '隧道LED灯', status: 'online', installDate: '2023-10-02', geoLabel: '长沙-岳麓区-先导路入口段', voltageProbe: 220, loadWatt: 180, luminancePct: 88, lastMaintenance: '2024-01-14' }
]

export const sceneTemplates = [
  { presetSn: 'SCN001', label: '节日庆典模式', description: '全亮度灯网，营造节日氛围', luminancePct: 100, duration: null, enabled: true },
  { presetSn: 'SCN002', label: '节能模式', description: '降低亮度至50%，节省电能', luminancePct: 50, duration: null, enabled: true },
  { presetSn: 'SCN003', label: '深夜模式', description: '凌晨2点后降低亮度', luminancePct: 30, duration: '02:00-05:00', enabled: true },
  { presetSn: 'SCN004', label: '应急模式', description: '突发情况全亮灯网', luminancePct: 100, duration: null, enabled: false },
  { presetSn: 'SCN005', label: '雾霾模式', description: '提高亮度应对低能见度', luminancePct: 90, duration: null, enabled: true }
]

export const scheduledScenes = [
  { presetSn: 'SCNCH001', label: '工作日定时节能', templateId: 'S002', scheduleType: 'daily', time: '22:00', enabled: true },
  { presetSn: 'SCNCH002', label: '周末全亮模式', templateId: 'S001', scheduleType: 'weekend', time: '18:00', enabled: true },
  { presetSn: 'SCNCH003', label: '深夜自动降亮', templateId: 'S003', scheduleType: 'daily', time: '02:00', enabled: true },
  { presetSn: 'SCNCH004', label: '节假日特殊模式', templateId: 'S001', scheduleType: 'holiday', time: '17:30', enabled: false }
]

export const workOrders = [
  { ticketSn: 'TKO001', type: 'fault', title: '先导路出口段灯光异常', description: '隧道出口段LED灯不亮', geoLabel: '长沙-岳麓区-先导路出口段', priority: 'high', status: 'pending', assignee: '', createdAt: '2024-01-15 10:15:33', updateTime: '2024-01-15 10:15:33' },
  { ticketSn: 'TKO002', type: 'maintenance', title: '先导路灯网例行维护', description: '隧道灯网系统定期检修保养', geoLabel: '长沙-岳麓区-先导路全线', priority: 'medium', status: 'processing', assignee: '张三', createdAt: '2024-01-14 09:00:00', updateTime: '2024-01-15 08:30:00' },
  { ticketSn: 'TKO003', type: 'fault', title: '先导路馈电柜异常', description: '隧道基本段馈电柜跳闸', geoLabel: '长沙-岳麓区-先导路基本段', priority: 'high', status: 'completed', assignee: '李四', createdAt: '2024-01-13 14:20:00', updateTime: '2024-01-13 16:45:00' },
  { ticketSn: 'TKO004', type: 'maintenance', title: '先导路光源清洗', description: '隧道灯网灯清洗', geoLabel: '长沙-岳麓区-先导路', priority: 'low', status: 'pending', assignee: '', createdAt: '2024-01-15 08:00:00', updateTime: '2024-01-15 08:00:00' },
  { ticketSn: 'TKO005', type: 'fault', title: '先导路灯光闪烁', description: '隧道基本段部分灯光频繁闪烁', geoLabel: '长沙-岳麓区-先导路基本段', priority: 'medium', status: 'processing', assignee: '王五', createdAt: '2024-01-15 11:30:00', updateTime: '2024-01-15 12:00:00' },
  { ticketSn: 'TKO006', type: 'maintenance', title: '先导路灯网升级', description: '隧道LED灯亮度优化', geoLabel: '长沙-岳麓区-先导路全线', priority: 'medium', status: 'completed', assignee: '张三', createdAt: '2024-01-12 09:00:00', updateTime: '2024-01-14 17:30:00' },
  { ticketSn: 'TKO007', type: 'fault', title: '先导路亮度不足', description: '隧道部分区域亮度明显下降', geoLabel: '长沙-岳麓区-先导路出口段', priority: 'low', status: 'pending', assignee: '', createdAt: '2024-01-15 13:45:00', updateTime: '2024-01-15 13:45:00' },
  { ticketSn: 'TKO008', type: 'maintenance', title: '先导路馈电柜检测', description: '隧道馈电柜季度检测', geoLabel: '长沙-岳麓区-先导路', priority: 'low', status: 'processing', assignee: '李四', createdAt: '2024-01-15 09:30:00', updateTime: '2024-01-15 10:00:00' }
]

export const loadHistoryData = {
  labels: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
  voltageProbe: [220.1, 219.8, 220.3, 220.5, 221.0, 220.8, 220.6, 220.4, 220.7, 220.2, 219.9, 220.0],
  amperageProbe: [25.2, 28.5, 32.1, 22.3, 18.6, 15.2, 16.8, 14.5, 18.2, 45.6, 52.3, 48.9],
  loadWatt: [5544, 6175, 7068, 4911, 4092, 3336, 3705, 3195, 4000, 9946, 11516, 10758],
  loadPercent: [35, 40, 45, 30, 25, 20, 22, 19, 25, 65, 75, 68]
}

export const energyStatistics = {
  today: { loadWatt: 85600, energy: 1820, peakLoad: 52.3 },
  week: { loadWatt: 599200, energy: 12740, peakLoad: 58.6 },
  month: { loadWatt: 2653600, energy: 47240, peakLoad: 62.1 }
}

// ========== 杆桩运营 · 扫码共享用电终端 ==========
export const sharedPowerTerminals = [
  { id: 'SP001', name: '荷塘镇夜市共享终端-东1号', geoLabel: '蓬江区荷塘镇·中心广场东', poleId: 'P1024', powerKw: 7, phase: '单相', status: 'USING', currentUser: { avatar: '摊', nickname: '摆摊张师傅', consumedKwh: 1.27, feeYuan: 0.76, startAt: '19:32:15' }, todayOrders: 23, todayIncome: 186.50, totalOrders: 1247, installDate: '2025-03-15', remark: '夜市摊位照明用' },
  { id: 'SP002', name: '共和镇人才广场共享终端-A', geoLabel: '鹤山共和镇·人才招聘广场', poleId: 'P1088', powerKw: 15, phase: '三相', status: 'USING', currentUser: { avatar: '舞', nickname: '广场舞李阿姨', consumedKwh: 3.42, feeYuan: 2.05, startAt: '20:05:30' }, todayOrders: 15, todayIncome: 142.80, totalOrders: 892, installDate: '2025-06-22', remark: '舞台灯光/音响供电' },
  { id: 'SP003', name: '市府广场共享终端-主舞台', geoLabel: '开平市·府广场主舞台区', poleId: 'P2003', powerKw: 30, phase: '三相', status: 'IDLE', currentUser: null, todayOrders: 8, todayIncome: 95.20, totalOrders: 2156, installDate: '2025-01-08', remark: '大型活动临时供电' },
  { id: 'SP004', name: '荷塘镇烧烤街共享终端-西2号', geoLabel: '蓬江区荷塘镇·烧烤街西口', poleId: 'P1028', powerKw: 7, phase: '单相', status: 'USING', currentUser: { avatar: '烧', nickname: '老王烧烤', consumedKwh: 5.18, feeYuan: 3.11, startAt: '18:45:00' }, todayOrders: 31, todayIncome: 245.60, totalOrders: 1876, installDate: '2025-04-01', remark: '烧烤摊照明+冰柜' },
  { id: 'SP005', name: '共和镇便民服务点-1号', geoLabel: '鹤山共和镇·便民服务点', poleId: 'P1090', powerKw: 3, phase: '单相', status: 'FAULT', currentUser: null, todayOrders: 0, todayIncome: 0, totalOrders: 524, installDate: '2025-05-12', remark: '漏电保护跳闸待修复', faultTrace: '漏电电流 32mA 触发保护' },
  { id: 'SP006', name: '开平美食节共享终端-展位区', geoLabel: '开平市·美食节展位区', poleId: 'P2005', powerKw: 15, phase: '三相', status: 'IDLE', currentUser: null, todayOrders: 12, todayIncome: 178.90, totalOrders: 678, installDate: '2025-09-15', remark: '美食节专用，活动结束后闲置' },
  { id: 'SP007', name: '荷塘镇元宵灯会共享终端', geoLabel: '蓬江区荷塘镇·元宵灯会主会场', poleId: 'P1050', powerKw: 30, phase: '三相', status: 'IDLE', currentUser: null, todayOrders: 0, todayIncome: 0, totalOrders: 312, installDate: '2025-02-10', remark: '季节性灯会专用终端' },
  { id: 'SP008', name: '共和镇农田灌溉临时终端', geoLabel: '鹤山共和镇·田间地头', poleId: 'P1100', powerKw: 7, phase: '单相', status: 'USING', currentUser: { avatar: '农', nickname: '种粮陈大哥', consumedKwh: 8.56, feeYuan: 5.14, startAt: '16:20:00' }, todayOrders: 5, todayIncome: 72.30, totalOrders: 198, installDate: '2025-07-28', remark: '农田灌溉水泵临时用电' }
]

// ========== 杆桩运营 · 充电桩 ==========
export const chargingPiles = [
  { id: 'CP001', name: '先导路入口段灯桩-桩1', poleId: 'LMP001', geoLabel: '岳麓区·先导路入口段', powerKw: 7, type: '慢充7kW', connector: 'Type2', status: 'BUSY', currentSession: { vehicleNo: '粤A·88888', brand: '比亚迪', consumedKwh: 12.5, feeYuan: 18.75, startAt: '14:05:00', remainingMin: 42 }, todayChargeCount: 18, todayEnergyKwh: 156, todayIncome: 234.00, totalEnergyKwh: 21840, installDate: '2025-02-10' },
  { id: 'CP002', name: '先导路基本段灯桩-桩2', poleId: 'LMP004', geoLabel: '岳麓区·先导路基本段', powerKw: 60, type: '直流快充', connector: 'CCS', status: 'FREE', currentSession: null, todayChargeCount: 24, todayEnergyKwh: 312, todayIncome: 468.00, totalEnergyKwh: 45600, installDate: '2025-02-10' },
  { id: 'CP003', name: '先导路出口段灯桩-桩3', poleId: 'LMP008', geoLabel: '岳麓区·先导路出口段', powerKw: 7, type: '慢充7kW', connector: 'Type2', status: 'BUSY', currentSession: { vehicleNo: '粤B·E12345', brand: '小鹏', consumedKwh: 8.3, feeYuan: 12.45, startAt: '14:22:00', remainingMin: 18 }, todayChargeCount: 12, todayEnergyKwh: 98, todayIncome: 147.00, totalEnergyKwh: 15200, installDate: '2025-03-01' },
  { id: 'CP004', name: '万家丽路灯桩-桩1', poleId: 'LMP010', geoLabel: '雨花区·万家丽路西段', powerKw: 60, type: '直流快充', connector: 'CCS', status: 'FAULT', currentSession: null, todayChargeCount: 0, todayEnergyKwh: 0, todayIncome: 0, totalEnergyKwh: 8900, installDate: '2025-05-15', faultTrace: '通信模块故障，4G离线' },
  { id: 'CP005', name: '三一大道灯桩-桩1', poleId: 'LMP012', geoLabel: '开福区·三一大道北段', powerKw: 7, type: '慢充7kW', connector: 'Type2', status: 'FREE', currentSession: null, todayChargeCount: 15, todayEnergyKwh: 128, todayIncome: 192.00, totalEnergyKwh: 18600, installDate: '2025-04-20' },
  { id: 'CP006', name: '三一大道灯桩-桩2', poleId: 'LMP015', geoLabel: '开福区·三一大道南段', powerKw: 60, type: '直流快充', connector: 'CCS', status: 'BUSY', currentSession: { vehicleNo: '粤A·T99999', brand: '特斯拉', consumedKwh: 28.6, feeYuan: 42.90, startAt: '14:10:00', remainingMin: 6 }, todayChargeCount: 21, todayEnergyKwh: 284, todayIncome: 426.00, totalEnergyKwh: 38900, installDate: '2025-04-20' }
]

// ========== 隧道增强 · 灯随车亮 ==========
export const followLightTunnel = {
  tunnelName: '先导路下穿隧道',
  tunnelLengthM: 2180,
  radarRangeM: 300,
  segmentCount: 8,
  baseBrightnessPct: 10,
  followBrightnessPct: 90,
  segments: [
    { idx: 1, name: '入口过渡段', lengthM: 200, baseLux: 35, targetLux: 320, mode: 'AUTO' },
    { idx: 2, name: '基本段-1', lengthM: 250, baseLux: 15, targetLux: 180, mode: 'AUTO' },
    { idx: 3, name: '基本段-2', lengthM: 300, baseLux: 15, targetLux: 180, mode: 'AUTO' },
    { idx: 4, name: '基本段-3', lengthM: 300, baseLux: 15, targetLux: 180, mode: 'AUTO' },
    { idx: 5, name: '基本段-4', lengthM: 300, baseLux: 15, targetLux: 180, mode: 'AUTO' },
    { idx: 6, name: '基本段-5', lengthM: 300, baseLux: 15, targetLux: 180, mode: 'AUTO' },
    { idx: 7, name: '基本段-6', lengthM: 230, baseLux: 15, targetLux: 180, mode: 'AUTO' },
    { idx: 8, name: '出口过渡段', lengthM: 200, baseLux: 35, targetLux: 280, mode: 'AUTO' }
  ]
}

// ========== 杆桩运营 · 5G 微基站站址 ==========
export const gBaseStations = [
  { id: 'GB001', name: '先导路入口段-华为 LampSite', poleId: 'LMP001', geoLabel: '岳麓区·先导路入口段', towerVendor: '华为', towerModel: 'LampSite 3.0', operators: ['移动', '联通', '电信'], band: 'n77/n78', powerKw: 0.2, contractStatus: 'ACTIVE', contractNo: 'CT-2025-001', startDate: '2025-03-01', endDate: '2028-02-28', monthlyRent: 3800, lastPayDate: '2026-09-28', poleLoadPct: 62, polePowerPct: 45, signalStrength: -78, throughputMbps: 420, subscriberCount: 2860, installDate: '2025-02-20' },
  { id: 'GB002', name: '先导路基本段-中兴 QCell', poleId: 'LMP004', geoLabel: '岳麓区·先导路基本段', towerVendor: '中兴', towerModel: 'QCell 2.5', operators: ['移动', '电信'], band: 'n41/n78', powerKw: 0.3, contractStatus: 'ACTIVE', contractNo: 'CT-2025-002', startDate: '2025-04-15', endDate: '2028-04-14', monthlyRent: 4200, lastPayDate: '2026-10-01', poleLoadPct: 71, polePowerPct: 58, signalStrength: -72, throughputMbps: 680, subscriberCount: 4120, installDate: '2025-04-10' },
  { id: 'GB003', name: '万家丽路-爱立信 Street Macro', poleId: 'LMP010', geoLabel: '雨花区·万家丽路西段', towerVendor: '爱立信', towerModel: 'Street Macro IRU', operators: ['联通'], band: 'n78', powerKw: 0.25, contractStatus: 'RENEW', contractNo: 'CT-2024-018', startDate: '2024-06-01', endDate: '2026-05-31', monthlyRent: 3500, lastPayDate: '2026-09-15', poleLoadPct: 55, polePowerPct: 40, signalStrength: -82, throughputMbps: 310, subscriberCount: 1820, installDate: '2024-05-25' },
  { id: 'GB004', name: '三一大道-诺基亚 Metro Cell', poleId: 'LMP015', geoLabel: '开福区·三一大道南段', towerVendor: '诺基亚', towerModel: 'Metro Cell RRH', operators: ['移动', '联通', '电信'], band: 'n77/n78/n79', powerKw: 0.4, contractStatus: 'ACTIVE', contractNo: 'CT-2025-009', startDate: '2025-07-01', endDate: '2028-06-30', monthlyRent: 5600, lastPayDate: '2026-09-25', poleLoadPct: 78, polePowerPct: 68, signalStrength: -68, throughputMbps: 890, subscriberCount: 5360, installDate: '2025-06-22' },
  { id: 'GB005', name: '管廊口部-华为 LampSite 5G-A', poleId: 'GLP001', geoLabel: '岳麓区·管廊主入口', towerVendor: '华为', towerModel: 'LampSite 5G-A Pro', operators: ['移动', '电信'], band: 'n41/n78/n28', powerKw: 0.35, contractStatus: 'ACTIVE', contractNo: 'CT-2026-003', startDate: '2026-01-15', endDate: '2029-01-14', monthlyRent: 4800, lastPayDate: '2026-10-05', poleLoadPct: 65, polePowerPct: 52, signalStrength: -74, throughputMbps: 1250, subscriberCount: 3980, installDate: '2025-12-28' },
  { id: 'GB006', name: '芙蓉广场-中兴 QCell Ultra', poleId: 'LMP022', geoLabel: '芙蓉区·芙蓉广场', towerVendor: '中兴', towerModel: 'QCell Ultra 2.0', operators: ['联通'], band: 'n77/n78', powerKw: 0.28, contractStatus: 'ACTIVE', contractNo: 'CT-2025-012', startDate: '2025-09-01', endDate: '2028-08-31', monthlyRent: 3900, lastPayDate: '2026-10-01', poleLoadPct: 58, polePowerPct: 42, signalStrength: -76, throughputMbps: 450, subscriberCount: 2450, installDate: '2025-08-20' },
  { id: 'GB007', name: '湘江新区-爱立信 Street Macro', poleId: 'LMP030', geoLabel: '岳麓区·湘江新区核心区', towerVendor: '爱立信', towerModel: 'Street Macro 6T6R', operators: ['移动', '联通', '电信'], band: 'n78/n79', powerKw: 0.45, contractStatus: 'ACTIVE', contractNo: 'CT-2025-015', startDate: '2025-10-15', endDate: '2028-10-14', monthlyRent: 6200, lastPayDate: '2026-10-08', poleLoadPct: 85, polePowerPct: 75, signalStrength: -65, throughputMbps: 1580, subscriberCount: 6890, installDate: '2025-10-01' },
  { id: 'GB008', name: '星沙产业园-诺基亚 Indoor Slim', poleId: 'LMP035', geoLabel: '长沙县·星沙产业园', towerVendor: '诺基亚', towerModel: 'Indoor Slim 3T3R', operators: ['移动'], band: 'n78', powerKw: 0.15, contractStatus: 'EXPIRED', contractNo: 'CT-2023-045', startDate: '2023-05-01', endDate: '2026-04-30', monthlyRent: 2800, lastPayDate: '2026-04-15', poleLoadPct: 32, polePowerPct: 25, signalStrength: -95, throughputMbps: 85, subscriberCount: 520, installDate: '2023-04-20' }
]

// ========== 杆桩运营 · 信息发布屏（广告排期）==========
export const adBoards = [
  { id: 'AD001', name: '先导路入口-P2.5 LED', poleId: 'LMP001', geoLabel: '岳麓区·先导路入口', size: '2.4m × 1.6m', pitch: 'P2.5', brightness: '7000 nits', orientation: '东向', panelStatus: 'ONLINE', schedulerStatus: 'RUNNING', todayPlayCount: 142, todayExposure: 125600, runningAds: ['A003', 'A007', 'A012'], installDate: '2025-02-15', remark: '主干道入口，车流量大' },
  { id: 'AD002', name: '万家丽路-P3 LED', poleId: 'LMP010', geoLabel: '雨花区·万家丽路', size: '3.2m × 2.1m', pitch: 'P3', brightness: '6500 nits', orientation: '南向', panelStatus: 'ONLINE', schedulerStatus: 'RUNNING', todayPlayCount: 98, todayExposure: 86400, runningAds: ['A001', 'A005'], installDate: '2025-05-20', remark: '商圈核心位' },
  { id: 'AD003', name: '三一大道-P2.5 LED', poleId: 'LMP015', geoLabel: '开福区·三一大道南段', size: '2.4m × 1.6m', pitch: 'P2.5', brightness: '7000 nits', orientation: '西向', panelStatus: 'ONLINE', schedulerStatus: 'PAUSED', todayPlayCount: 0, todayExposure: 0, runningAds: [], installDate: '2025-04-15', remark: '施工中暂停播放' },
  { id: 'AD004', name: '芙蓉广场-P2 LED', poleId: 'LMP022', geoLabel: '芙蓉区·芙蓉广场', size: '2.8m × 1.8m', pitch: 'P2', brightness: '7500 nits', orientation: '双向', panelStatus: 'ONLINE', schedulerStatus: 'RUNNING', todayPlayCount: 256, todayExposure: 286400, runningAds: ['A002', 'A004', 'A009', 'A015'], installDate: '2025-08-01', remark: '商业核心区，黄金位' },
  { id: 'AD005', name: '湘江新区-P2.5 LED', poleId: 'LMP030', geoLabel: '岳麓区·湘江新区', size: '3.2m × 2.1m', pitch: 'P2.5', brightness: '7000 nits', orientation: '东向', panelStatus: 'FAULT', schedulerStatus: 'STOPPED', todayPlayCount: 0, todayExposure: 0, runningAds: [], installDate: '2025-10-10', remark: '屏体进水待维修', faultTrace: 'LED 模组进水短路，80% 灯珠不亮' },
  { id: 'AD006', name: '管廊主入口-P3 LED', poleId: 'GLP001', geoLabel: '岳麓区·管廊主入口', size: '1.6m × 1.1m', pitch: 'P3', brightness: '6000 nits', orientation: '北向', panelStatus: 'ONLINE', schedulerStatus: 'RUNNING', todayPlayCount: 64, todayExposure: 28600, runningAds: ['A006', 'A018'], installDate: '2025-11-05', remark: '公益信息为主' }
]

// 广告排期（所有广告条目的当前排期）
export const adSchedules = [
  { adId: 'A001', brand: '比亚迪汽车', mediaType: '视频 15s', adBoardId: 'AD002', slotStart: '07:00', slotEnd: '22:00', priority: 1, status: 'ACTIVE', startDate: '2026-09-01', endDate: '2026-11-30', cpm: 85, bookedSlots: 1800, deliveredCount: 1560 },
  { adId: 'A002', brand: '招商银行信用卡', mediaType: '图片 8s', adBoardId: 'AD004', slotStart: '08:00', slotEnd: '21:00', priority: 2, status: 'ACTIVE', startDate: '2026-10-01', endDate: '2026-12-31', cpm: 60, bookedSlots: 1200, deliveredCount: 1180 },
  { adId: 'A003', brand: '长沙市文旅·橘子洲烟花', mediaType: '视频 20s', adBoardId: 'AD001', slotStart: '18:00', slotEnd: '22:00', priority: 1, status: 'ACTIVE', startDate: '2026-09-20', endDate: '2026-10-25', cpm: 120, bookedSlots: 480, deliveredCount: 396 },
  { adId: 'A004', brand: '星巴克金秋新品', mediaType: '图片 8s', adBoardId: 'AD004', slotStart: '07:00', slotEnd: '10:00', priority: 3, status: 'ACTIVE', startDate: '2026-10-10', endDate: '2026-11-10', cpm: 55, bookedSlots: 300, deliveredCount: 210 },
  { adId: 'A005', brand: '长沙银行', mediaType: '视频 15s', adBoardId: 'AD002', slotStart: '12:00', slotEnd: '18:00', priority: 2, status: 'ACTIVE', startDate: '2026-09-15', endDate: '2026-12-14', cpm: 75, bookedSlots: 900, deliveredCount: 810 },
  { adId: 'A006', brand: '应急管理局 · 消防安全提示', mediaType: '滚动字幕', adBoardId: 'AD006', slotStart: '00:00', slotEnd: '24:00', priority: 0, status: 'PUBLIC', startDate: '2026-01-01', endDate: '2026-12-31', cpm: 0, bookedSlots: 0, deliveredCount: 0 },
  { adId: 'A007', brand: '比亚迪汽车', mediaType: '视频 15s', adBoardId: 'AD001', slotStart: '07:00', slotEnd: '12:00', priority: 2, status: 'ACTIVE', startDate: '2026-10-01', endDate: '2026-11-30', cpm: 85, bookedSlots: 900, deliveredCount: 720 },
  { adId: 'A009', brand: '广汽埃安', mediaType: '视频 15s', adBoardId: 'AD004', slotStart: '10:00', slotEnd: '14:00', priority: 2, status: 'ACTIVE', startDate: '2026-10-05', endDate: '2026-12-04', cpm: 80, bookedSlots: 480, deliveredCount: 310 },
  { adId: 'A012', brand: '湖南电信5G套餐', mediaType: '视频 10s', adBoardId: 'AD001', slotStart: '12:00', slotEnd: '18:00', priority: 3, status: 'ACTIVE', startDate: '2026-09-10', endDate: '2026-12-10', cpm: 50, bookedSlots: 720, deliveredCount: 612 },
  { adId: 'A015', brand: '芙蓉广场中秋灯会', mediaType: '视频 20s', adBoardId: 'AD004', slotStart: '18:00', slotEnd: '22:00', priority: 1, status: 'ACTIVE', startDate: '2026-10-15', endDate: '2026-10-25', cpm: 150, bookedSlots: 440, deliveredCount: 120 },
  { adId: 'A018', brand: '长沙市气象局 · 公益气象', mediaType: '滚动字幕', adBoardId: 'AD006', slotStart: '00:00', slotEnd: '24:00', priority: 0, status: 'PUBLIC', startDate: '2026-01-01', endDate: '2026-12-31', cpm: 0, bookedSlots: 0, deliveredCount: 0 }
]
