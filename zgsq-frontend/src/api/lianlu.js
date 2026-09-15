/* [软著核心代码] lianlu.js + 链路管理接口：增删改查、管廊下的链路列表 */
import request from './request' // 导入封装好的 axios 实例

/**
 * 新增链路
 * 业务说明：链路挂在管廊下，表示一段连续的照明回路
 * @param {Object} data 链路表单（必须带 guanLangId 关联所属管廊）
 */
export const addLianLu = (data) => {
  return request({ url: '/lianlu/add', method: 'post', data })
}

/**
 * 修改链路信息
 * @param {Object} data 链路表单（必须带 lianLuId）
 */
export const updateLianLu = (data) => {
  return request({ url: '/lianlu/update', method: 'put', data })
}

/**
 * 删除链路
 * @param {number} lianLuId 链路主键
 */
export const deleteLianLu = (lianLuId) => {
  return request({ url: `/lianlu/delete/${lianLuId}`, method: 'delete' })
}

/**
 * 分页查询链路
 * @param {Object} params { pageNum, pageSize, lianLuCode?, lianLuName?, guanLangId? }
 */
export const pageLianLu = (params) => {
  return request({ url: '/lianlu/page', method: 'get', params })
}

/**
 * 按管廊查询链路列表（不分页，用于下拉选择）
 * 业务说明：新增配光组时，需要选择所属链路，下拉数据源来自这里
 * @param {number} guanLangId 管廊主键
 */
export const listLianLuByGuanLang = (guanLangId) => {
  return request({ url: '/lianlu/listByGuanLang', method: 'get', params: { guanLangId } })
}
