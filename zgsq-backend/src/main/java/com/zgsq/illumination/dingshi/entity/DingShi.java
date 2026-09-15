/* [软著核心代码] DingShi.java - 定时调度实体 */
package com.zgsq.illumination.dingshi.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.io.Serializable;
import java.time.LocalTime;
import java.time.LocalDateTime;

/**
 * 定时调度实体 {@code DingShi} —— 配光组定时启停规则
 * <p>
 * 映射表：t_zgsq_ding_shi
 * <p>
 * 业务场景：智光云枢平台自动根据设定的 cron 表达式调节管廊链路下配光组的亮度等级。
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
@TableName("t_zgsq_ding_shi")
public class DingShi implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 调度 ID */
    @TableId(value = "ding_shi_id", type = IdType.AUTO)
    private Long dingShiId;

    /** 调度名称 */
    @TableField("ding_shi_name")
    private String dingShiName;

    /** 关联链路 ID */
    @TableField("lian_lu_id")
    private Long lianLuId;

    /** 关联管廊 ID（冗余外键） */
    @TableField("guan_lang_id")
    private Long guanLangId;

    /** Cron 表达式（Spring Scheduler 标准 6 位格式） */
    @TableField("cron_expr")
    private String cronExpr;

    /** 开灯亮度等级（%） */
    @TableField("bright_level_on")
    private Integer brightLevelOn;

    /** 关灯亮度等级（%，一般为 0） */
    @TableField("bright_level_off")
    private Integer brightLevelOff;

    /** 生效开始时间（HH:mm:ss） */
    @TableField("start_time")
    private LocalTime startTime;

    /** 生效结束时间（HH:mm:ss） */
    @TableField("end_time")
    private LocalTime endTime;

    /** 调度状态：0 启用 / 1 禁用 */
    @TableField("ding_shi_status")
    private Integer dingShiStatus;

    /** 上次执行时间 */
    @TableField("last_execute_time")
    private LocalDateTime lastExecuteTime;

    /** 上次执行结果（SUCCESS / FAIL / 执行报错） */
    @TableField("last_execute_result")
    private String lastExecuteResult;

    /** 创建时间 */
    @TableField("create_time")
    private LocalDateTime createTime;

    /** 更新时间 */
    @TableField("update_time")
    private LocalDateTime updateTime;

    /** 备注 */
    @TableField("remark")
    private String remark;

    // ========== 手动生成的 getter/setter ==========
    public Long getDingShiId() { return this.dingShiId; }
    public String getDingShiName() { return this.dingShiName; }
    public Long getLianLuId() { return this.lianLuId; }
    public Long getGuanLangId() { return this.guanLangId; }
    public String getCronExpr() { return this.cronExpr; }
    public Integer getBrightLevelOn() { return this.brightLevelOn; }
    public Integer getBrightLevelOff() { return this.brightLevelOff; }
    public LocalTime getStartTime() { return this.startTime; }
    public LocalTime getEndTime() { return this.endTime; }
    public Integer getDingShiStatus() { return this.dingShiStatus; }
    public LocalDateTime getLastExecuteTime() { return this.lastExecuteTime; }
    public String getLastExecuteResult() { return this.lastExecuteResult; }
    public LocalDateTime getCreateTime() { return this.createTime; }
    public LocalDateTime getUpdateTime() { return this.updateTime; }
    public String getRemark() { return this.remark; }
    public void setDingShiId(Long dingShiId) { this.dingShiId = dingShiId; }
    public void setDingShiName(String dingShiName) { this.dingShiName = dingShiName; }
    public void setLianLuId(Long lianLuId) { this.lianLuId = lianLuId; }
    public void setGuanLangId(Long guanLangId) { this.guanLangId = guanLangId; }
    public void setCronExpr(String cronExpr) { this.cronExpr = cronExpr; }
    public void setBrightLevelOn(Integer brightLevelOn) { this.brightLevelOn = brightLevelOn; }
    public void setBrightLevelOff(Integer brightLevelOff) { this.brightLevelOff = brightLevelOff; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
    public void setDingShiStatus(Integer dingShiStatus) { this.dingShiStatus = dingShiStatus; }
    public void setLastExecuteTime(LocalDateTime lastExecuteTime) { this.lastExecuteTime = lastExecuteTime; }
    public void setLastExecuteResult(String lastExecuteResult) { this.lastExecuteResult = lastExecuteResult; }
    public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }
    public void setUpdateTime(LocalDateTime updateTime) { this.updateTime = updateTime; }
    public void setRemark(String remark) { this.remark = remark; }
}
