/* [软著核心代码] User.java - 用户实体 */
package com.zgsq.illumination.user.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 系统用户实体 {@code User}
 * <p>
 * 映射表：t_zgsq_user
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
@TableName("t_zgsq_user")
public class User implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 用户 ID（自增主键） */
    @TableId(value = "user_id", type = IdType.AUTO)
    private Long userId;

    /** 登录账号（唯一） */
    @TableField("user_name")
    private String userName;

    /** 登录密码（MD5 + 盐加密） */
    @TableField("user_password")
    private String userPassword;

    /** 真实姓名 */
    @TableField("user_real_name")
    private String userRealName;

    /** 手机号 */
    @TableField("user_phone")
    private String userPhone;

    /** 邮箱 */
    @TableField("user_email")
    private String userEmail;

    /** 关联角色 ID */
    @TableField("role_id")
    private Long roleId;

    /** 用户状态：0 启用 / 1 禁用 */
    @TableField("user_status")
    private Integer userStatus;

    /** 创建时间 */
    @TableField("create_time")
    private LocalDateTime createTime;

    /** 更新时间 */
    @TableField("update_time")
    private LocalDateTime updateTime;

    // ========== 手动生成的 getter/setter ==========
    public Long getUserId() { return this.userId; }
    public String getUserName() { return this.userName; }
    public String getUserPassword() { return this.userPassword; }
    public String getUserRealName() { return this.userRealName; }
    public String getUserPhone() { return this.userPhone; }
    public String getUserEmail() { return this.userEmail; }
    public Long getRoleId() { return this.roleId; }
    public Integer getUserStatus() { return this.userStatus; }
    public LocalDateTime getCreateTime() { return this.createTime; }
    public LocalDateTime getUpdateTime() { return this.updateTime; }
    public void setUserId(Long userId) { this.userId = userId; }
    public void setUserName(String userName) { this.userName = userName; }
    public void setUserPassword(String userPassword) { this.userPassword = userPassword; }
    public void setUserRealName(String userRealName) { this.userRealName = userRealName; }
    public void setUserPhone(String userPhone) { this.userPhone = userPhone; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    public void setRoleId(Long roleId) { this.roleId = roleId; }
    public void setUserStatus(Integer userStatus) { this.userStatus = userStatus; }
    public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }
    public void setUpdateTime(LocalDateTime updateTime) { this.updateTime = updateTime; }
}
