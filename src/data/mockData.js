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
  { presetSn: 'PRST001', label: '日常灯网处方', activateAt: '18:30', deactivateAt: '06:00', luminancePct: 100, enabled: true, createdAt: '2024-01-01' },
  { presetSn: 'PRST002', label: '节能模式处方', activateAt: '22:00', deactivateAt: '05:00', luminancePct: 50, enabled: true, createdAt: '2024-01-05' },
  { presetSn: 'PRST003', label: '周末灯网处方', activateAt: '19:00', deactivateAt: '07:00', luminancePct: 90, enabled: false, createdAt: '2024-01-10' },
  { presetSn: 'PRST004', label: '节假日处方', activateAt: '18:00', deactivateAt: '08:00', luminancePct: 100, enabled: false, createdAt: '2024-01-12' }
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
