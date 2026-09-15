/* [软著核心代码] dingshi.js + 定时调度接口：增、改、删、启停切换、分页查询 */
import request from './request' // 导入封装好的 axios 实例

/**
 * 新增定时调度任务
 * 业务说明：设置某配光组的定时开关灯策略（cron 表达式或固定时间点）
 * @param {Object} data 调度表单 { dingshiName, cronExpr, peiGuangId, startTime, endTime, ... }
 */
export const addDingShi = (data) => {
  return request({ url: '/dingshi/add', method: 'post', data })
}

/**
 * 修改定时调度任务
 * @param {Object} data 调度表单（必须带 dingshiId）
 */
export const updateDingShi = (data) => {
  return request({ url: '/dingshi/update', method: 'put', data })
}

/**
 * 删除定时调度任务
 * @param {number} dingshiId 调度主键
 */
export const deleteDingShi = (dingshiId) => {
  return request({ url: `/dingshi/delete/${dingshiId}`, method: 'delete' })
}

/**
 * 切换调度启停状态
 * 业务说明：一键启动/暂停定时任务，常用于临时屏蔽调度
 * @param {number} dingshiId 调度主键
 * @param {number} enabled 1-启用 0-暂停
 */
export const toggleDingShi = (dingshiId, enabled) => {
  return request({
    url: '/dingshi/toggle',
    method: 'put',
    data: { dingshiId, enabled }
  })
}

/**
 * 分页查询定时调度列表
 * @param {Object} params { pageNum, pageSize, dingshiName?, enabled? }
 */
export const pageDingShi = (params) => {
  return request({ url: '/dingshi/page', method: 'get', params })
}
