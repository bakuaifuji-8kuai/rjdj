/* [软著核心代码] guanlang.js + 管廊管理接口：增删改查、批量操作、状态切换、详情 */
import request from './request' // 导入封装好的 axios 实例

/**
 * 新增管廊
 * 业务说明：管廊是平台最上层的实体单位，下面挂链路、配光组
 * @param {Object} data 管廊表单
 */
export const addGuanLang = (data) => {
  return request({ url: '/guanlang/add', method: 'post', data })
}

/**
 * 修改管廊信息
 * @param {Object} data 管廊表单（必须带 guanLangId）
 */
export const updateGuanLang = (data) => {
  return request({ url: '/guanlang/update', method: 'put', data })
}

/**
 * 删除单个管廊
 * @param {number} guanLangId 管廊主键
 */
export const deleteGuanLang = (guanLangId) => {
  return request({ url: `/guanlang/delete/${guanLangId}`, method: 'delete' })
}

/**
 * 批量删除管廊
 * 业务说明：勾选多行后批量移除，后端级联清理关联链路
 * @param {number[]} ids 管廊 ID 数组
 */
export const batchDeleteGuanLang = (ids) => {
  return request({ url: '/guanlang/batchDelete', method: 'post', data: ids })
}

/**
 * 切换管廊启用/停用状态
 * 业务说明：一键开关，常用于临时维护或停用
 * @param {number} guanLangId 管廊主键
 * @param {number} status 1-启用 0-停用
 */
export const updateGuanLangStatus = (guanLangId, status) => {
  return request({
    url: '/guanlang/updateStatus',
    method: 'put',
    data: { guanLangId, status }
  })
}

/**
 * 分页查询管廊列表
 * @param {Object} params { pageNum, pageSize, guanLangCode?, guanLangName?, status?, district? }
 */
export const pageGuanLang = (params) => {
  return request({ url: '/guanlang/page', method: 'get', params })
}

/**
 * 查询管廊详情（含关联链路列表）
 * 业务说明：打开详情抽屉时，需要展示完整字段和子级链路
 * @param {number} guanLangId 管廊主键
 */
export const getGuanLangDetail = (guanLangId) => {
  return request({ url: `/guanlang/detail/${guanLangId}`, method: 'get' })
}
