/* [软著核心代码] OpLog.java - 操作日志实体 */
package com.zgsq.illumination.oplog.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 操作日志实体 {@code OpLog}
 * <p>
 * 映射表：t_zgsq_op_log
 * <p>
 * 本实体由 {@link com.zgsq.illumination.config.LogAspect} 切面自动写入，
 * 也可由 Service 手动插入。
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
@TableName("t_zgsq_op_log")
public class OpLog implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 日志 ID（自增主键） */
    @TableId(value = "op_log_id", type = IdType.AUTO)
    private Long opLogId;

    /** 操作人用户名（从 LoginInterceptor request attribute 取） */
    @TableField("op_user_name")
    private String opUserName;

    /** 操作人 ID（预留，当前取 request attribute） */
    @TableField("op_user_id")
    private Long opUserId;

    /** 操作模块（如 "用户管理" / "管廊管理" / "登录"） */
    @TableField("op_module")
    private String opModule;

    /** 操作动作（如 "新增" / "修改" / "删除" / "登录" / "分页查询"） */
    @TableField("op_action")
    private String opAction;

    /** 操作目标 ID（如管廊 ID / 链路 ID，可选） */
    @TableField("op_target_id")
    private String opTargetId;

    /** 操作详情（入参 JSON 或错误信息） */
    @TableField("op_content")
    private String opContent;

    /** 客户端 IP（支持代理） */
    @TableField("op_ip")
    private String opIp;

    /** 操作时间 */
    @TableField("op_time")
    private LocalDateTime opTime;

    /** 执行结果（SUCCESS / FAIL:xxx） */
    @TableField("op_result")
    private String opResult;

    /** 耗时（毫秒） */
    @TableField("cost_ms")
    private Long costMs;

    // ========== 手动生成的 getter/setter ==========
    public Long getOpLogId() { return this.opLogId; }
    public String getOpUserName() { return this.opUserName; }
    public Long getOpUserId() { return this.opUserId; }
    public String getOpModule() { return this.opModule; }
    public String getOpAction() { return this.opAction; }
    public String getOpTargetId() { return this.opTargetId; }
    public String getOpContent() { return this.opContent; }
    public String getOpIp() { return this.opIp; }
    public LocalDateTime getOpTime() { return this.opTime; }
    public String getOpResult() { return this.opResult; }
    public Long getCostMs() { return this.costMs; }
    public void setOpLogId(Long opLogId) { this.opLogId = opLogId; }
    public void setOpUserName(String opUserName) { this.opUserName = opUserName; }
    public void setOpUserId(Long opUserId) { this.opUserId = opUserId; }
    public void setOpModule(String opModule) { this.opModule = opModule; }
    public void setOpAction(String opAction) { this.opAction = opAction; }
    public void setOpTargetId(String opTargetId) { this.opTargetId = opTargetId; }
    public void setOpContent(String opContent) { this.opContent = opContent; }
    public void setOpIp(String opIp) { this.opIp = opIp; }
    public void setOpTime(LocalDateTime opTime) { this.opTime = opTime; }
    public void setOpResult(String opResult) { this.opResult = opResult; }
    public void setCostMs(Long costMs) { this.costMs = costMs; }
}
