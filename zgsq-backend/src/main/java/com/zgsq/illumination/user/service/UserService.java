/* [软著核心代码] UserService.java - 用户模块业务接口 */
package com.zgsq.illumination.user.service;

import com.zgsq.illumination.common.PageResult;
import com.zgsq.illumination.user.entity.User;
import com.zgsq.illumination.user.dto.UserDTO;
import com.zgsq.illumination.user.vo.UserVOs;

import java.util.List;

/**
 * 用户模块业务接口
 * <p>
 * 只定义契约，实现类 {@link com.zgsq.illumination.user.service.impl.UserServiceImpl} 承担全部业务逻辑。
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
public interface UserService {

    /**
     * 用户登录
     *
     * @param dto 登录请求（用户名 + 明文密码）
     * @return 登录成功返回 token + 用户基础信息
     * @throws com.zgsq.illumination.exception.BusinessException 用户名或密码错误、账号禁用
     */
    UserVOs.LoginVO login(UserDTO.LoginDTO dto);

    /**
     * 新增用户
     *
     * @param dto 新增请求
     * @return 新增后的用户 ID
     * @throws com.zgsq.illumination.exception.BusinessException 用户名重复
     */
    Long addUser(UserDTO.UserAddDTO dto);

    /**
     * 修改用户
     *
     * @param dto 修改请求
     * @throws com.zgsq.illumination.exception.BusinessException 用户不存在
     */
    void updateUser(UserDTO.UserUpdateDTO dto);

    /**
     * 删除用户
     *
     * @param userId 用户 ID
     */
    void deleteUser(Long userId);

    /**
     * 批量删除用户
     *
     * @param userIds 用户 ID 列表
     */
    void batchDeleteUser(List<Long> userIds);

    /**
     * 分页查询用户列表（联表查角色名）
     *
     * @param query 查询条件
     * @return 分页结果
     */
    PageResult<UserVOs.UserVO> pageUser(UserDTO.UserQueryDTO query);

    /**
     * 根据用户名查询（service 内部辅助）
     *
     * @param userName 登录账号
     * @return User 实体
     */
    User getByUserName(String userName);
}
