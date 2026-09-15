/* [软著核心代码] RoleMapper.java - 角色表持久层 */
package com.zgsq.illumination.role.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zgsq.illumination.role.entity.Role;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 角色表 Mapper 接口
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
@Mapper
public interface RoleMapper extends BaseMapper<Role> {

    /**
     * 按角色编码查角色（唯一性校验）
     *
     * @param roleCode 角色编码
     * @return Role 或 null
     */
    Role selectByCode(@Param("roleCode") String roleCode);

    /**
     * 条件分页查询
     *
     * @param roleName   角色名称（模糊）
     * @param roleCode   角色编码（精确）
     * @param roleStatus 状态（null=不限）
     * @param offset     偏移量
     * @param pageSize   每页大小
     * @return 角色列表
     */
    List<Role> selectPageList(@Param("roleName") String roleName,
                              @Param("roleCode") String roleCode,
                              @Param("roleStatus") Integer roleStatus,
                              @Param("offset") int offset,
                              @Param("pageSize") int pageSize);

    /**
     * 统计条件下的角色数
     */
    long selectPageCount(@Param("roleName") String roleName,
                         @Param("roleCode") String roleCode,
                         @Param("roleStatus") Integer roleStatus);
}
