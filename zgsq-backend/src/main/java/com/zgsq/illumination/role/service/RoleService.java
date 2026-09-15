/* [软著核心代码] RoleService.java - 角色模块业务接口 */
package com.zgsq.illumination.role.service;

import com.zgsq.illumination.common.PageResult;
import com.zgsq.illumination.role.dto.RoleDTO;
import com.zgsq.illumination.role.vo.RoleVO;

import java.util.List;

/**
 * 角色模块业务接口
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
public interface RoleService {

    /** 新增角色 */
    Long addRole(RoleDTO.RoleAddDTO dto);

    /** 修改角色 */
    void updateRole(RoleDTO.RoleUpdateDTO dto);

    /** 删除角色 */
    void deleteRole(Long roleId);

    /** 分页查询 */
    PageResult<RoleVO> pageRole(RoleDTO.RoleQueryDTO query);

    /** 列表查询（所有启用的角色，下拉选择用） */
    List<RoleVO> listRole();
}
