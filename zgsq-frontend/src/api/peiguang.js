/* [软著核心代码] peiguang.js + 配光组管理接口：增删改查、链路下的配光列表 */
import request from './request' // 导入封装好的 axios 实例

/**
 * 新增配光组
 * 业务说明：配光组是最细粒度的照明单元，挂在链路下
 * @param {Object} data 配光表单（必须带 lianLuId 关联所属链路）
 */
export const addPeiGuang = (data) => {
  return request({ url: '/peiguang/add', method: 'post', data })
}

/**
 * 修改配光组
 * @param {Object} data 配光表单（必须带 peiGuangId）
 */
export const updatePeiGuang = (data) => {
  return request({ url: '/peiguang/update', method: 'put', data })
}

/**
 * 删除配光组
 * @param {number} peiGuangId 配光主键
 */
export const deletePeiGuang = (peiGuangId) => {
  return request({ url: `/peiguang/delete/${peiGuangId}`, method: 'delete' })
}

/**
 * 分页查询配光组列表
 * @param {Object} params { pageNum, pageSize, peiGuangCode?, peiGuangName?, lianLuId? }
 */
export const pagePeiGuang = (params) => {
  return request({ url: '/peiguang/page', method: 'get', params })
}

/**
 * 按链路查询配光组列表（不分页）
 * 业务说明：查看某条链路下属的全部配光单元时使用
 * @param {number} lianLuId 链路主键
 */
export const listPeiGuangByLianLu = (lianLuId) => {
  return request({ url: '/peiguang/listByLianLu', method: 'get', params: { lianLuId } })
}
