/* [软著核心代码] user.js + 用户管理接口：登录、增删改查、分页 */
import request from './request' // 导入封装好的 axios 实例

/**
 * 用户登录
 * 业务说明：前端传用户名密码，后端校验通过后签发 JWT 返回
 * @param {Object} params { userName, password }
 * @returns {Promise<{token, userInfo}>}
 */
export const login = (params) => {
  return request({
    url: '/user/login',
    method: 'post',
    data: params
  })
}

/**
 * 新增用户
 * 业务说明：管理员创建新账号，需要指定角色
 * @param {Object} data 用户表单数据
 */
export const addUser = (data) => {
  return request({ url: '/user/add', method: 'post', data })
}

/**
 * 修改用户信息
 * @param {Object} data 用户表单数据（必须带 userId）
 */
export const updateUser = (data) => {
  return request({ url: '/user/update', method: 'put', data })
}

/**
 * 删除单个用户
 * @param {number} userId 用户主键
 */
export const deleteUser = (userId) => {
  return request({ url: `/user/delete/${userId}`, method: 'delete' })
}

/**
 * 批量删除用户
 * 业务说明：前端传用户 ID 数组，后端批量移除
 * @param {number[]} userIds 用户 ID 数组
 */
export const batchDeleteUser = (userIds) => {
  return request({ url: '/user/batchDelete', method: 'post', data: userIds })
}

/**
 * 分页查询用户列表
 * @param {Object} params { pageNum, pageSize, userName?, status? }
 */
export const pageUser = (params) => {
  return request({ url: '/user/page', method: 'get', params })
}
