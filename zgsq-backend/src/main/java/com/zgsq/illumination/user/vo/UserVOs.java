package com.zgsq.illumination.user.vo;

import java.time.LocalDateTime;

public class UserVOs {

    public static class LoginVO {
        private String token;
        private Long userId;
        private String userName;
        private String userRealName;
        private Long roleId;
        private String roleName;
        private UserVO user;

        public String getToken() { return token; }
        public void setToken(String v) { this.token = v; }
        public Long getUserId() { return userId; }
        public void setUserId(Long v) { this.userId = v; }
        public String getUserName() { return userName; }
        public void setUserName(String v) { this.userName = v; }
        public String getUserRealName() { return userRealName; }
        public void setUserRealName(String v) { this.userRealName = v; }
        public Long getRoleId() { return roleId; }
        public void setRoleId(Long v) { this.roleId = v; }
        public String getRoleName() { return roleName; }
        public void setRoleName(String v) { this.roleName = v; }
        public UserVO getUser() { return user; }
        public void setUser(UserVO v) { this.user = v; }
    }

    public static class UserVO {
        private Long userId;
        private String userName;
        private String userRealName;
        private String userPhone;
        private String userEmail;
        private Long roleId;
        private String roleName;
        private Integer userStatus;
        private String userStatusName;
        private String remark;
        private LocalDateTime createTime;
        private LocalDateTime updateTime;

        public Long getUserId() { return userId; }
        public void setUserId(Long v) { this.userId = v; }
        public String getUserName() { return userName; }
        public void setUserName(String v) { this.userName = v; }
        public String getUserRealName() { return userRealName; }
        public void setUserRealName(String v) { this.userRealName = v; }
        public String getUserPhone() { return userPhone; }
        public void setUserPhone(String v) { this.userPhone = v; }
        public String getUserEmail() { return userEmail; }
        public void setUserEmail(String v) { this.userEmail = v; }
        public Long getRoleId() { return roleId; }
        public void setRoleId(Long v) { this.roleId = v; }
        public String getRoleName() { return roleName; }
        public void setRoleName(String v) { this.roleName = v; }
        public Integer getUserStatus() { return userStatus; }
        public void setUserStatus(Integer v) { this.userStatus = v; }
        public String getUserStatusName() { return userStatusName; }
        public void setUserStatusName(String v) { this.userStatusName = v; }
        public String getRemark() { return remark; }
        public void setRemark(String v) { this.remark = v; }
        public LocalDateTime getCreateTime() { return createTime; }
        public void setCreateTime(LocalDateTime v) { this.createTime = v; }
        public LocalDateTime getUpdateTime() { return updateTime; }
        public void setUpdateTime(LocalDateTime v) { this.updateTime = v; }
    }
}
