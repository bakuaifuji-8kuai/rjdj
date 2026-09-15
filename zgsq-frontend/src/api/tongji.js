/* [软著核心代码] tongji.js + 统计看板接口：首页 Dashboard 数据、管廊状态分组 */
import request from './request' // 导入封装好的 axios 实例

/**
 * 获取首页工作台统计数据
 * 业务说明：6 张统计卡片的数据源
 * @returns {Promise<{guanLangTotal, lianLuTotal, peiGuangTotal, dingshiEnabledTotal, alarmToday, guanLangMaintaining}>}
 */
export const getDashboard = () => {
  return request({ url: '/tongji/dashboard', method: 'get' })
}

/**
 * 获取管廊状态分组统计（饼图数据）
 * 业务说明：首页左侧饼图展示各状态管廊数量分布
 * @returns {Promise<{normal: number, maintaining: number, disabled: number}>}
 */
export const getGuanLangGroup = () => {
  return request({ url: '/tongji/guanLangGroup', method: 'get' })
}
