/* [软著核心代码] role.js + 角色管理接口：增、改、删、列表查询 */
import request from './request' // 导入封装好的 axios 实例

/**
 * 新增角色
 * @param {Object} data 角色表单 { roleName, roleCode, description }
 */
export const addRole = (data) => {
  return request({ url: '/role/add', method: 'post', data })
}

/**
 * 修改角色
 * @param {Object} data 角色表单（必须带 roleId）
 */
export const updateRole = (data) => {
  return request({ url: '/role/update', method: 'put', data })
}

/**
 * 删除角色
 * @param {number} roleId 角色主键
 */
export const deleteRole = (roleId) => {
  return request({ url: `/role/delete/${roleId}`, method: 'delete' })
}

/**
 * 查询全部角色列表（不分页，用于下拉选择）
 * 业务说明：分配用户角色时，需要所有角色的简易列表
 */
export const listRole = () => {
  return request({ url: '/role/list', method: 'get' })
}
