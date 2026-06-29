export const lightStatusData = [
  { id: 'L001', name: '先导路-入口段-001', status: 'on', brightness: 85, power: 45, lastUpdate: '2024-01-15 14:30:22', location: '长沙-岳麓区-先导路入口段' },
  { id: 'L002', name: '先导路-入口段-002', status: 'on', brightness: 70, power: 38, lastUpdate: '2024-01-15 14:30:18', location: '长沙-岳麓区-先导路入口段' },
  { id: 'L003', name: '先导路-基本段-001', status: 'off', brightness: 0, power: 0, lastUpdate: '2024-01-15 14:28:45', location: '长沙-岳麓区-先导路基本段' },
  { id: 'L004', name: '先导路-基本段-002', status: 'on', brightness: 90, power: 48, lastUpdate: '2024-01-15 14:30:20', location: '长沙-岳麓区-先导路基本段' },
  { id: 'L005', name: '先导路-出口段-001', status: 'on', brightness: 65, power: 35, lastUpdate: '2024-01-15 14:30:15', location: '长沙-岳麓区-先导路出口段' },
  { id: 'L006', name: '先导路-出口段-002', status: 'fault', brightness: 0, power: 0, lastUpdate: '2024-01-15 10:15:33', location: '长沙-岳麓区-先导路出口段' },
  { id: 'L007', name: '先导路-应急照明-001', status: 'on', brightness: 80, power: 42, lastUpdate: '2024-01-15 14:30:21', location: '长沙-岳麓区-先导路中央' },
  { id: 'L008', name: '先导路-应急照明-002', status: 'on', brightness: 75, power: 40, lastUpdate: '2024-01-15 14:30:19', location: '长沙-岳麓区-先导路中央' },
  { id: 'L009', name: '先导路-应急照明-003', status: 'off', brightness: 0, power: 0, lastUpdate: '2024-01-15 06:30:00', location: '长沙-岳麓区-先导路中央' },
  { id: 'L010', name: '先导路-入口段-003', status: 'on', brightness: 88, power: 46, lastUpdate: '2024-01-15 14:30:22', location: '长沙-岳麓区-先导路入口段' }
]

export const timingStrategies = [
  { id: 'T001', name: '日常照明策略', startTime: '18:30', endTime: '06:00', brightness: 100, enabled: true, createTime: '2024-01-01' },
  { id: 'T002', name: '节能模式策略', startTime: '22:00', endTime: '05:00', brightness: 50, enabled: true, createTime: '2024-01-05' },
  { id: 'T003', name: '周末照明策略', startTime: '19:00', endTime: '07:00', brightness: 90, enabled: false, createTime: '2024-01-10' },
  { id: 'T004', name: '节假日策略', startTime: '18:00', endTime: '08:00', brightness: 100, enabled: false, createTime: '2024-01-12' }
]

export const distributionBoxes = [
  { id: 'D001', name: '先导路入口段配电箱', status: 'normal', voltage: 220.5, current: 45.2, power: 9911, load: 68, lastUpdate: '2024-01-15 14:30:22' },
  { id: 'D002', name: '先导路基本段配电箱', status: 'normal', voltage: 219.8, current: 38.6, power: 8484, load: 52, lastUpdate: '2024-01-15 14:30:20' },
  { id: 'D003', name: '先导路出口段配电箱', status: 'warning', voltage: 215.2, current: 52.3, power: 11255, load: 85, lastUpdate: '2024-01-15 14:30:18' },
  { id: 'D004', name: '先导路应急配电箱', status: 'normal', voltage: 221.1, current: 32.8, power: 7252, load: 45, lastUpdate: '2024-01-15 14:30:15' },
  { id: 'D005', name: '先导路备用配电箱', status: 'fault', voltage: 0, current: 0, power: 0, load: 0, lastUpdate: '2024-01-15 10:20:33', faultReason: '短路保护触发' }
]

export const circuitData = [
  { id: 'C001', boxId: 'D001', name: '回路1-入口段左侧', power: 3200, energy: 1560, voltage: 220.5, current: 14.5, powerFactor: 0.95 },
  { id: 'C002', boxId: 'D001', name: '回路2-入口段右侧', power: 3400, energy: 1680, voltage: 220.3, current: 15.4, powerFactor: 0.94 },
  { id: 'C003', boxId: 'D001', name: '回路3-入口段应急', power: 3311, energy: 1620, voltage: 220.7, current: 15.0, powerFactor: 0.96 },
  { id: 'C004', boxId: 'D002', name: '回路1-基本段左侧', power: 2800, energy: 1350, voltage: 219.8, current: 12.8, powerFactor: 0.95 },
  { id: 'C005', boxId: 'D002', name: '回路2-基本段右侧', power: 2900, energy: 1420, voltage: 219.5, current: 13.2, powerFactor: 0.94 },
  { id: 'C006', boxId: 'D002', name: '回路3-基本段应急', power: 2784, energy: 1310, voltage: 220.1, current: 12.6, powerFactor: 0.96 },
  { id: 'C007', boxId: 'D003', name: '回路1-出口段左侧', power: 3800, energy: 1820, voltage: 215.2, current: 17.7, powerFactor: 0.92 },
  { id: 'C008', boxId: 'D003', name: '回路2-出口段右侧', power: 3700, energy: 1780, voltage: 214.8, current: 17.2, powerFactor: 0.93 },
  { id: 'C009', boxId: 'D003', name: '回路3-出口段应急', power: 3755, energy: 1800, voltage: 215.5, current: 17.4, powerFactor: 0.91 },
  { id: 'C010', boxId: 'D004', name: '回路1-中央应急照明', power: 3600, energy: 1750, voltage: 221.1, current: 16.3, powerFactor: 0.95 }
]

export const deviceList = [
  { id: 'DVC001', name: '隧道LED照明灯-A001', model: 'SL-LED-200W', type: '隧道LED灯', status: 'online', installDate: '2023-06-15', location: '长沙-岳麓区-先导路入口段', voltage: 220, power: 200, brightness: 85, lastMaintenance: '2024-01-01' },
  { id: 'DVC002', name: '隧道LED照明灯-A002', model: 'SL-LED-150W', type: '隧道LED灯', status: 'online', installDate: '2023-06-16', location: '长沙-岳麓区-先导路入口段', voltage: 220, power: 150, brightness: 70, lastMaintenance: '2024-01-05' },
  { id: 'DVC003', name: '隧道LED照明灯-B001', model: 'SL-LED-200W', type: '隧道LED灯', status: 'offline', installDate: '2023-07-01', location: '长沙-岳麓区-先导路基本段', voltage: 220, power: 200, brightness: 0, lastMaintenance: '2023-12-15' },
  { id: 'DVC004', name: '隧道LED照明灯-B002', model: 'SL-LED-150W', type: '隧道LED灯', status: 'online', installDate: '2023-07-02', location: '长沙-岳麓区-先导路基本段', voltage: 220, power: 150, brightness: 90, lastMaintenance: '2024-01-10' },
  { id: 'DVC005', name: '隧道LED照明灯-C001', model: 'SL-LED-180W', type: '隧道LED灯', status: 'online', installDate: '2023-08-01', location: '长沙-岳麓区-先导路出口段', voltage: 220, power: 180, brightness: 65, lastMaintenance: '2023-12-20' },
  { id: 'DVC006', name: '隧道LED照明灯-C002', model: 'SL-LED-200W', type: '隧道LED灯', status: 'fault', installDate: '2023-08-02', location: '长沙-岳麓区-先导路出口段', voltage: 0, power: 200, brightness: 0, lastMaintenance: '2023-11-01', faultReason: '驱动故障' },
  { id: 'DVC007', name: '隧道应急照明灯-D001', model: 'SL-LED-150W', type: '隧道应急灯', status: 'online', installDate: '2023-09-01', location: '长沙-岳麓区-先导路中央', voltage: 220, power: 150, brightness: 80, lastMaintenance: '2024-01-08' },
  { id: 'DVC008', name: '隧道应急照明灯-D002', model: 'SL-LED-150W', type: '隧道应急灯', status: 'online', installDate: '2023-09-02', location: '长沙-岳麓区-先导路中央', voltage: 220, power: 150, brightness: 75, lastMaintenance: '2024-01-12' },
  { id: 'DVC009', name: '隧道应急照明灯-E001', model: 'SL-LED-200W', type: '隧道应急灯', status: 'offline', installDate: '2023-10-01', location: '长沙-岳麓区-先导路中央', voltage: 220, power: 200, brightness: 0, lastMaintenance: '2023-12-01' },
  { id: 'DVC010', name: '隧道LED照明灯-E002', model: 'SL-LED-180W', type: '隧道LED灯', status: 'online', installDate: '2023-10-02', location: '长沙-岳麓区-先导路入口段', voltage: 220, power: 180, brightness: 88, lastMaintenance: '2024-01-14' }
]

export const sceneTemplates = [
  { id: 'S001', name: '节日庆典模式', description: '全亮度照明，营造节日氛围', brightness: 100, duration: null, enabled: true },
  { id: 'S002', name: '节能模式', description: '降低亮度至50%，节省电能', brightness: 50, duration: null, enabled: true },
  { id: 'S003', name: '深夜模式', description: '凌晨2点后降低亮度', brightness: 30, duration: '02:00-05:00', enabled: true },
  { id: 'S004', name: '应急模式', description: '突发情况全亮照明', brightness: 100, duration: null, enabled: false },
  { id: 'S005', name: '雾霾模式', description: '提高亮度应对低能见度', brightness: 90, duration: null, enabled: true }
]

export const scheduledScenes = [
  { id: 'SCH001', name: '工作日定时节能', templateId: 'S002', scheduleType: 'daily', time: '22:00', enabled: true },
  { id: 'SCH002', name: '周末全亮模式', templateId: 'S001', scheduleType: 'weekend', time: '18:00', enabled: true },
  { id: 'SCH003', name: '深夜自动降亮', templateId: 'S003', scheduleType: 'daily', time: '02:00', enabled: true },
  { id: 'SCH004', name: '节假日特殊模式', templateId: 'S001', scheduleType: 'holiday', time: '17:30', enabled: false }
]

export const workOrders = [
  { id: 'WO001', type: 'fault', title: '先导路出口段灯光故障', description: '隧道出口段LED灯不亮', location: '长沙-岳麓区-先导路出口段', priority: 'high', status: 'pending', assignee: '', createTime: '2024-01-15 10:15:33', updateTime: '2024-01-15 10:15:33' },
  { id: 'WO002', type: 'maintenance', title: '先导路照明例行维护', description: '隧道照明系统定期检修保养', location: '长沙-岳麓区-先导路全线', priority: 'medium', status: 'processing', assignee: '张三', createTime: '2024-01-14 09:00:00', updateTime: '2024-01-15 08:30:00' },
  { id: 'WO003', type: 'fault', title: '先导路配电箱异常', description: '隧道基本段配电箱跳闸', location: '长沙-岳麓区-先导路基本段', priority: 'high', status: 'completed', assignee: '李四', createTime: '2024-01-13 14:20:00', updateTime: '2024-01-13 16:45:00' },
  { id: 'WO004', type: 'maintenance', title: '先导路灯具清洗', description: '隧道照明灯清洗', location: '长沙-岳麓区-先导路', priority: 'low', status: 'pending', assignee: '', createTime: '2024-01-15 08:00:00', updateTime: '2024-01-15 08:00:00' },
  { id: 'WO005', type: 'fault', title: '先导路灯光闪烁', description: '隧道基本段部分灯光频繁闪烁', location: '长沙-岳麓区-先导路基本段', priority: 'medium', status: 'processing', assignee: '王五', createTime: '2024-01-15 11:30:00', updateTime: '2024-01-15 12:00:00' },
  { id: 'WO006', type: 'maintenance', title: '先导路照明升级', description: '隧道LED灯亮度优化', location: '长沙-岳麓区-先导路全线', priority: 'medium', status: 'completed', assignee: '张三', createTime: '2024-01-12 09:00:00', updateTime: '2024-01-14 17:30:00' },
  { id: 'WO007', type: 'fault', title: '先导路亮度不足', description: '隧道部分区域亮度明显下降', location: '长沙-岳麓区-先导路出口段', priority: 'low', status: 'pending', assignee: '', createTime: '2024-01-15 13:45:00', updateTime: '2024-01-15 13:45:00' },
  { id: 'WO008', type: 'maintenance', title: '先导路配电箱检测', description: '隧道配电箱季度检测', location: '长沙-岳麓区-先导路', priority: 'low', status: 'processing', assignee: '李四', createTime: '2024-01-15 09:30:00', updateTime: '2024-01-15 10:00:00' }
]

export const loadHistoryData = {
  labels: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
  voltage: [220.1, 219.8, 220.3, 220.5, 221.0, 220.8, 220.6, 220.4, 220.7, 220.2, 219.9, 220.0],
  current: [25.2, 28.5, 32.1, 22.3, 18.6, 15.2, 16.8, 14.5, 18.2, 45.6, 52.3, 48.9],
  power: [5544, 6175, 7068, 4911, 4092, 3336, 3705, 3195, 4000, 9946, 11516, 10758],
  loadPercent: [35, 40, 45, 30, 25, 20, 22, 19, 25, 65, 75, 68]
}

export const energyStatistics = {
  today: { power: 85600, energy: 1820, peakLoad: 52.3 },
  week: { power: 599200, energy: 12740, peakLoad: 58.6 },
  month: { power: 2653600, energy: 47240, peakLoad: 62.1 }
}
