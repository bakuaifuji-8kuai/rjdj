/* [软著核心代码] UserController.java - 用户管理 REST 控制器 */
package com.zgsq.illumination.user.controller;

import com.zgsq.illumination.common.PageResult;
import com.zgsq.illumination.common.Result;
import com.zgsq.illumination.user.dto.UserDTO;
import com.zgsq.illumination.user.service.UserService;
import com.zgsq.illumination.user.vo.UserVOs;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 用户管理 REST 控制器
 * <p>
 * 暴露路径：{@code /api/user/**}
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    /**
     * 用户登录（放行 Token 校验）
     *
     * @param dto 登录请求体
     * @return 标准 Result，data = LoginVO(token + user)
     */
    @PostMapping("/login")
    public Result<UserVOs.LoginVO> login(@Validated @RequestBody UserDTO.LoginDTO dto) {
        return Result.ok(userService.login(dto));
    }

    /**
     * 新增用户
     *
     * @param dto 新增请求体
     * @return 新增用户 ID
     */
    @PostMapping("/add")
    public Result<Long> add(@Validated @RequestBody UserDTO.UserAddDTO dto) {
        return Result.ok(userService.addUser(dto));
    }

    /**
     * 修改用户
     *
     * @param dto 修改请求体（userId 必填）
     * @return 成功标志
     */
    @PutMapping("/update")
    public Result<Void> update(@RequestBody UserDTO.UserUpdateDTO dto) {
        userService.updateUser(dto);
        return Result.ok();
    }

    /**
     * 删除单个用户
     *
     * @param userId 用户 ID
     * @return 成功标志
     */
    @DeleteMapping("/delete")
    public Result<Void> delete(@RequestParam Long userId) {
        userService.deleteUser(userId);
        return Result.ok();
    }

    /**
     * 批量删除用户
     *
     * @param userIds 用户 ID 数组
     * @return 成功标志
     */
    @PostMapping("/batchDelete")
    public Result<Void> batchDelete(@RequestBody List<Long> userIds) {
        userService.batchDeleteUser(userIds);
        return Result.ok();
    }

    /**
     * 分页查询用户
     *
     * @param query 查询条件
     * @return 分页结果
     */
    @GetMapping("/page")
    public Result<PageResult<UserVOs.UserVO>> page(UserDTO.UserQueryDTO query) {
        return Result.ok(userService.pageUser(query));
    }

}
