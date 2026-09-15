/* [软著核心代码] Role.java - 角色实体 */
package com.zgsq.illumination.role.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 系统角色实体 {@code Role}
 * <p>
 * 映射表：t_zgsq_role
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
@TableName("t_zgsq_role")
public class Role implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 角色 ID（自增主键） */
    @TableId(value = "role_id", type = IdType.AUTO)
    private Long roleId;

    /** 角色名称（中文，如 "超级管理员"） */
    @TableField("role_name")
    private String roleName;

    /** 角色编码（英文，唯一，如 "ADMIN" / "OPERATOR"） */
    @TableField("role_code")
    private String roleCode;

    /** 角色描述 */
    @TableField("role_desc")
    private String roleDesc;

    /** 角色状态：0 启用 / 1 禁用 */
    @TableField("role_status")
    private Integer roleStatus;

    /** 创建时间 */
    @TableField("create_time")
    private LocalDateTime createTime;

    /** 更新时间 */
    @TableField("update_time")
    private LocalDateTime updateTime;

    // ========== 手动生成的 getter/setter ==========
    public Long getRoleId() { return this.roleId; }
    public String getRoleName() { return this.roleName; }
    public String getRoleCode() { return this.roleCode; }
    public String getRoleDesc() { return this.roleDesc; }
    public Integer getRoleStatus() { return this.roleStatus; }
    public LocalDateTime getCreateTime() { return this.createTime; }
    public LocalDateTime getUpdateTime() { return this.updateTime; }
    public void setRoleId(Long roleId) { this.roleId = roleId; }
    public void setRoleName(String roleName) { this.roleName = roleName; }
    public void setRoleCode(String roleCode) { this.roleCode = roleCode; }
    public void setRoleDesc(String roleDesc) { this.roleDesc = roleDesc; }
    public void setRoleStatus(Integer roleStatus) { this.roleStatus = roleStatus; }
    public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }
    public void setUpdateTime(LocalDateTime updateTime) { this.updateTime = updateTime; }
}
