package com.zgsq.illumination.role.vo;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class RoleVO {

    private Long roleId;
    private String roleName;
    private String roleCode;
    private Integer roleStatus;
    private String roleStatusName;
    private String roleDesc;
    private String remark;
    private java.time.LocalDateTime createTime;
    private java.time.LocalDateTime updateTime;

    // ========== 手动生成: getter / setter ==========
    public Long getRoleId() { return this.roleId; }
    public void setRoleId(Long roleId) { this.roleId = roleId; }
    public String getRoleName() { return this.roleName; }
    public void setRoleName(String roleName) { this.roleName = roleName; }
    public String getRoleCode() { return this.roleCode; }
    public void setRoleCode(String roleCode) { this.roleCode = roleCode; }
    public Integer getRoleStatus() { return this.roleStatus; }
    public void setRoleStatus(Integer roleStatus) { this.roleStatus = roleStatus; }
    public String getRoleStatusName() { return this.roleStatusName; }
    public void setRoleStatusName(String roleStatusName) { this.roleStatusName = roleStatusName; }
    public String getRoleDesc() { return this.roleDesc; }
    public void setRoleDesc(String roleDesc) { this.roleDesc = roleDesc; }
    public String getRemark() { return this.remark; }
    public void setRemark(String remark) { this.remark = remark; }
    public java.time.LocalDateTime getCreateTime() { return this.createTime; }
    public void setCreateTime(java.time.LocalDateTime createTime) { this.createTime = createTime; }
    public java.time.LocalDateTime getUpdateTime() { return this.updateTime; }
    public void setUpdateTime(java.time.LocalDateTime updateTime) { this.updateTime = updateTime; }
}