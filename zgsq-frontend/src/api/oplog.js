/* [软著核心代码] oplog.js + 操作日志接口：分页查询，用于管理员审计追溯 */
import request from './request' // 导入封装好的 axios 实例

/**
 * 分页查询操作日志
 * 业务说明：记录谁在什么时间对什么业务做了什么操作，支持按用户名、操作类型过滤
 * @param {Object} params { pageNum, pageSize, userName?, operType?, startTime?, endTime? }
 */
export const pageOpLog = (params) => {
  return request({ url: '/oplog/page', method: 'get', params })
}
