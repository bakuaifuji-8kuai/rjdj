package com.zgsq.illumination.role.dto;

import com.zgsq.illumination.common.PageQuery;
import java.io.Serializable;

/**
 * RoleDTO 内部 DTO 集合
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
public class RoleDTO {

    public static class RoleAddDTO implements Serializable {
        private static final long serialVersionUID = 1L;
        private String roleCode;
        private String roleName;
        private String roleDesc;
        private Integer roleStatus;

        // ========== 手动生成: getter / setter ==========
        public String getRoleCode() { return this.roleCode; }
        public void setRoleCode(String roleCode) { this.roleCode = roleCode; }
        public String getRoleName() { return this.roleName; }
        public void setRoleName(String roleName) { this.roleName = roleName; }
        public String getRoleDesc() { return this.roleDesc; }
        public void setRoleDesc(String roleDesc) { this.roleDesc = roleDesc; }
        public Integer getRoleStatus() { return this.roleStatus; }
        public void setRoleStatus(Integer roleStatus) { this.roleStatus = roleStatus; }
    }

    public static class RoleUpdateDTO implements Serializable {
        private static final long serialVersionUID = 1L;
        private Long roleId;
        private String roleCode;
        private String roleName;
        private String roleDesc;
        private Integer roleStatus;

        // ========== 手动生成: getter / setter ==========
        public Long getRoleId() { return this.roleId; }
        public void setRoleId(Long roleId) { this.roleId = roleId; }
        public String getRoleCode() { return this.roleCode; }
        public void setRoleCode(String roleCode) { this.roleCode = roleCode; }
        public String getRoleName() { return this.roleName; }
        public void setRoleName(String roleName) { this.roleName = roleName; }
        public String getRoleDesc() { return this.roleDesc; }
        public void setRoleDesc(String roleDesc) { this.roleDesc = roleDesc; }
        public Integer getRoleStatus() { return this.roleStatus; }
        public void setRoleStatus(Integer roleStatus) { this.roleStatus = roleStatus; }
    }

    public static class RoleQueryDTO extends PageQuery {
        private String roleCode;
        private String roleName;
        private Integer roleStatus;

        // ========== 手动生成: getter / setter ==========
        public String getRoleCode() { return this.roleCode; }
        public void setRoleCode(String roleCode) { this.roleCode = roleCode; }
        public String getRoleName() { return this.roleName; }
        public void setRoleName(String roleName) { this.roleName = roleName; }
        public Integer getRoleStatus() { return this.roleStatus; }
        public void setRoleStatus(Integer roleStatus) { this.roleStatus = roleStatus; }
    }
}
