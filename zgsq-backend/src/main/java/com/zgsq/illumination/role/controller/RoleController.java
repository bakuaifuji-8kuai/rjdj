/* [软著核心代码] RoleController.java - 角色管理 REST 控制器 */
package com.zgsq.illumination.role.controller;

import com.zgsq.illumination.common.PageResult;
import com.zgsq.illumination.common.Result;
import com.zgsq.illumination.role.dto.RoleDTO;
import com.zgsq.illumination.role.service.RoleService;
import com.zgsq.illumination.role.vo.RoleVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 角色管理 REST 控制器
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
@RestController
@RequestMapping("/api/role")
public class RoleController {

    @Autowired
    private RoleService roleService;

    /** 新增角色 */
    @PostMapping("/add")
    public Result<Long> add(@Validated @RequestBody RoleDTO.RoleAddDTO dto) {
        return Result.ok(roleService.addRole(dto));
    }

    /** 修改角色 */
    @PutMapping("/update")
    public Result<Void> update(@RequestBody RoleDTO.RoleUpdateDTO dto) {
        roleService.updateRole(dto);
        return Result.ok();
    }

    /** 删除角色 */
    @DeleteMapping("/delete")
    public Result<Void> delete(@RequestParam Long roleId) {
        roleService.deleteRole(roleId);
        return Result.ok();
    }

    /** 分页查询角色 */
    @GetMapping("/page")
    public Result<PageResult<RoleVO>> page(RoleDTO.RoleQueryDTO query) {
        return Result.ok(roleService.pageRole(query));
    }

    /** 列表查询（所有启用角色） */
    @GetMapping("/list")
    public Result<List<RoleVO>> list() {
        return Result.ok(roleService.listRole());
    }

}
