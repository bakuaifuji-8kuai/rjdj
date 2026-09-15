/* [软著核心代码] UserServiceImpl.java - 用户模块业务实现 */
package com.zgsq.illumination.user.service.impl;

import com.zgsq.illumination.common.ErrorCode;
import com.zgsq.illumination.common.PageResult;
import com.zgsq.illumination.user.entity.User;
import com.zgsq.illumination.exception.BusinessException;
import com.zgsq.illumination.user.dto.UserDTO;
import com.zgsq.illumination.user.mapper.UserMapper;
import com.zgsq.illumination.user.service.UserService;
import com.zgsq.illumination.user.vo.UserVOs;
import com.zgsq.illumination.utils.ZgsqDigestUtil;
import com.zgsq.illumination.utils.ZgsqDateUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 用户模块业务实现
 * <p>
 * 业务逻辑集中在此类，Controller 层只做参数接收 / 返回体包装。
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserMapper userMapper;

    /** 模拟 Token（MVP 阶段直接返回固定值，实际应使用 JWT） */
    private static final String MOCK_TOKEN = "admin-token";

    @Override
    public UserVOs.LoginVO login(UserDTO.LoginDTO dto) {
        // 1. 根据用户名查用户
        User user = userMapper.selectByUserName(dto.getUserName());
        if (user == null) {
            throw new BusinessException(ErrorCode.LOGIN_USERNAME_OR_PASSWORD);
        }
        // 2. 校验密码（md5WithSalt 比对 DB 密文）
        if (!ZgsqDigestUtil.verifyPassword(dto.getUserPassword(), user.getUserPassword())) {
            throw new BusinessException(ErrorCode.LOGIN_USERNAME_OR_PASSWORD);
        }
        // 3. 校验账号状态（禁用状态不允许登录）
        if (user.getUserStatus() != null && user.getUserStatus() == 1) {
            throw new BusinessException(ErrorCode.LOGIN_USER_DISABLED);
        }
        // 4. 组装返回 VO
        UserVOs.LoginVO vo = new UserVOs.LoginVO();
        vo.setToken(MOCK_TOKEN);
        vo.setUser(toVO(user));
        return vo;
    }

    @Override
    public Long addUser(UserDTO.UserAddDTO dto) {
        // 1. 用户名唯一性校验
        User existing = userMapper.selectByUserName(dto.getUserName());
        if (existing != null) {
            throw new BusinessException(ErrorCode.DATA_ALREADY_EXISTS, "用户名已存在：" + dto.getUserName());
        }
        // 2. 组装实体
        User user = new User();
        user.setUserName(dto.getUserName());
        // 明文密码 → MD5 + 盐加密
        user.setUserPassword(ZgsqDigestUtil.md5WithSalt(dto.getUserPassword()));
        user.setUserRealName(dto.getUserRealName());
        user.setUserPhone(dto.getUserPhone());
        user.setUserEmail(dto.getUserEmail());
        user.setRoleId(dto.getRoleId());
        // 状态默认启用
        user.setUserStatus(dto.getUserStatus() == null ? 0 : dto.getUserStatus());
        LocalDateTime now = LocalDateTime.now();
        user.setCreateTime(now);
        user.setUpdateTime(now);
        // 3. 入库
        userMapper.insert(user);
        return user.getUserId();
    }

    @Override
    public void updateUser(UserDTO.UserUpdateDTO dto) {
        // 1. 存在性校验
        User user = userMapper.selectById(dto.getUserId());
        if (user == null) {
            throw new BusinessException(ErrorCode.DATA_NOT_FOUND, "用户不存在");
        }
        // 2. 更新字段（账号不允许修改，密码只在 dto 非空时更新）
        if (dto.getUserRealName() != null) {
            user.setUserRealName(dto.getUserRealName());
        }
        if (dto.getUserPhone() != null) {
            user.setUserPhone(dto.getUserPhone());
        }
        if (dto.getUserEmail() != null) {
            user.setUserEmail(dto.getUserEmail());
        }
        if (dto.getRoleId() != null) {
            user.setRoleId(dto.getRoleId());
        }
        if (dto.getUserStatus() != null) {
            user.setUserStatus(dto.getUserStatus());
        }
        if (dto.getUserPassword() != null && !dto.getUserPassword().isEmpty()) {
            user.setUserPassword(ZgsqDigestUtil.md5WithSalt(dto.getUserPassword()));
        }
        user.setUpdateTime(LocalDateTime.now());
        userMapper.updateById(user);
    }

    @Override
    public void deleteUser(Long userId) {
        userMapper.deleteById(userId);
    }

    @Override
    public void batchDeleteUser(List<Long> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return;
        }
        // MyBatis-Plus 批量删除
        userMapper.deleteBatchIds(userIds);
    }

    @Override
    public PageResult<UserVOs.UserVO> pageUser(UserDTO.UserQueryDTO query) {
        int pageNum = query.getSafePageNum();
        int pageSize = query.getSafePageSize();
        int offset = (pageNum - 1) * pageSize;
        // 1. 查总数
        long total = userMapper.selectPageCount(query.getUserName(), query.getUserStatus(), query.getUserRealName());
        // 2. 查当前页
        List<User> users = userMapper.selectPageWithRole(query.getUserName(), query.getUserStatus(),
                query.getUserRealName(), offset, pageSize);
        // 3. Entity → VO
        List<UserVOs.UserVO> voList = users.stream().map(this::toVO).collect(Collectors.toList());
        return PageResult.of(voList, total, pageNum, pageSize);
    }

    @Override
    public User getByUserName(String userName) {
        return userMapper.selectByUserName(userName);
    }

    // ========== Entity → VO 转换 ==========

    /**
     * User 实体 → UserVOs.UserVO
     *
     * @param user 实体
     * @return VO
     */
    private UserVOs.UserVO toVO(User user) {
        UserVOs.UserVO vo = new UserVOs.UserVO();
        vo.setUserId(user.getUserId());
        vo.setUserName(user.getUserName());
        vo.setUserRealName(user.getUserRealName());
        vo.setUserPhone(user.getUserPhone());
        vo.setUserEmail(user.getUserEmail());
        vo.setRoleId(user.getRoleId());
        vo.setUserStatus(user.getUserStatus());
        vo.setCreateTime(user.getCreateTime());
        vo.setUpdateTime(user.getUpdateTime());
        // 状态文案翻译
        vo.setUserStatusName(user.getUserStatus() == null ? "" : (user.getUserStatus() == 0 ? "启用" : "禁用"));
        return vo;
    }

}
