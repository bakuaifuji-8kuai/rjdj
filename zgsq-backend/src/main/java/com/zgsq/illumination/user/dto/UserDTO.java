package com.zgsq.illumination.user.dto;

import com.zgsq.illumination.common.PageQuery;
import java.io.Serializable;

/**
 * UserDTO 内部 DTO 集合
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
public class UserDTO {

    public static class LoginDTO implements Serializable {
        private static final long serialVersionUID = 1L;
        private String userName;
        private String userPassword;

        // ========== 手动生成: getter / setter ==========
        public String getUserName() { return this.userName; }
        public void setUserName(String userName) { this.userName = userName; }
        public String getUserPassword() { return this.userPassword; }
        public void setUserPassword(String userPassword) { this.userPassword = userPassword; }
    }

    public static class UserAddDTO implements Serializable {
        private static final long serialVersionUID = 1L;
        private String userName;
        private String userPassword;
        private String userRealName;
        private String userPhone;
        private String userEmail;
        private Long roleId;
        private Integer userStatus;

        // ========== 手动生成: getter / setter ==========
        public String getUserName() { return this.userName; }
        public void setUserName(String userName) { this.userName = userName; }
        public String getUserPassword() { return this.userPassword; }
        public void setUserPassword(String userPassword) { this.userPassword = userPassword; }
        public String getUserRealName() { return this.userRealName; }
        public void setUserRealName(String userRealName) { this.userRealName = userRealName; }
        public String getUserPhone() { return this.userPhone; }
        public void setUserPhone(String userPhone) { this.userPhone = userPhone; }
        public String getUserEmail() { return this.userEmail; }
        public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
        public Long getRoleId() { return this.roleId; }
        public void setRoleId(Long roleId) { this.roleId = roleId; }
        public Integer getUserStatus() { return this.userStatus; }
        public void setUserStatus(Integer userStatus) { this.userStatus = userStatus; }
    }

    public static class UserUpdateDTO implements Serializable {
        private static final long serialVersionUID = 1L;
        private Long userId;
        private String userRealName;
        private String userPhone;
        private String userEmail;
        private Long roleId;
        private Integer userStatus;
        private String userPassword;

        // ========== 手动生成: getter / setter ==========
        public Long getUserId() { return this.userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getUserRealName() { return this.userRealName; }
        public void setUserRealName(String userRealName) { this.userRealName = userRealName; }
        public String getUserPhone() { return this.userPhone; }
        public void setUserPhone(String userPhone) { this.userPhone = userPhone; }
        public String getUserEmail() { return this.userEmail; }
        public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
        public Long getRoleId() { return this.roleId; }
        public void setRoleId(Long roleId) { this.roleId = roleId; }
        public Integer getUserStatus() { return this.userStatus; }
        public void setUserStatus(Integer userStatus) { this.userStatus = userStatus; }
        public String getUserPassword() { return this.userPassword; }
        public void setUserPassword(String userPassword) { this.userPassword = userPassword; }
    }

    public static class UserQueryDTO extends PageQuery {
        private String userName;
        private Integer userStatus;
        private Long roleId;
        private String userRealName;

        // ========== 手动生成: getter / setter ==========
        public String getUserName() { return this.userName; }
        public void setUserName(String userName) { this.userName = userName; }
        public Integer getUserStatus() { return this.userStatus; }
        public void setUserStatus(Integer userStatus) { this.userStatus = userStatus; }
        public Long getRoleId() { return this.roleId; }
        public void setRoleId(Long roleId) { this.roleId = roleId; }
        public String getUserRealName() { return this.userRealName; }
        public void setUserRealName(String userRealName) { this.userRealName = userRealName; }
    }

    public static class RegisterDTO implements Serializable {
        private static final long serialVersionUID = 1L;
        private String userName;
        private String userPassword;
        private String userRealName;
        private String userPhone;
        private String userEmail;

        // ========== 手动生成: getter / setter ==========
        public String getUserName() { return this.userName; }
        public void setUserName(String userName) { this.userName = userName; }
        public String getUserPassword() { return this.userPassword; }
        public void setUserPassword(String userPassword) { this.userPassword = userPassword; }
        public String getUserRealName() { return this.userRealName; }
        public void setUserRealName(String userRealName) { this.userRealName = userRealName; }
        public String getUserPhone() { return this.userPhone; }
        public void setUserPhone(String userPhone) { this.userPhone = userPhone; }
        public String getUserEmail() { return this.userEmail; }
        public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    }
}
