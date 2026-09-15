/* [软著核心代码] LianLu.java - 链路实体 */
package com.zgsq.illumination.lianlu.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 链路实体 {@code LianLu} —— 挂在管廊下的照明供电链路
 * <p>
 * 映射表：t_zgsq_lian_lu
 * <p>
 * 层级结构：管廊(1) → 链路(N) → 配光组(M)
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
@TableName("t_zgsq_lian_lu")
public class LianLu implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 链路 ID（自增主键） */
    @TableId(value = "lian_lu_id", type = IdType.AUTO)
    private Long lianLuId;

    /** 链路业务编号：LL-{管廊编号}-XX */
    @TableField("lian_lu_no")
    private String lianLuNo;

    /** 链路中文名称 */
    @TableField("lian_lu_name")
    private String lianLuName;

    /** 所属管廊 ID（外键） */
    @TableField("guan_lang_id")
    private Long guanLangId;

    /** 链路类型：1 主干 / 2 支线 */
    @TableField("lian_lu_type")
    private Integer lianLuType;

    /** 链路总长（米） */
    @TableField("total_length")
    private Double totalLength;

    /** 链路状态：0 正常 / 1 停用 */
    @TableField("lian_lu_status")
    private Integer lianLuStatus;

    /** 回路数量 */
    @TableField("loop_count")
    private Integer loopCount;

    /** 回路总功率（W） */
    @TableField("loop_power")
    private Double loopPower;

    /** 创建时间 */
    @TableField("create_time")
    private LocalDateTime createTime;

    /** 更新时间 */
    @TableField("update_time")
    private LocalDateTime updateTime;

    /** 备注 */
    @TableField("remark")
    private String remark;

    /** 逻辑删除：0 未删 / 1 已删 */
    @TableField("deleted")
    private Integer deleted;

    // ========== 手动生成的 getter/setter ==========
    public Long getLianLuId() { return this.lianLuId; }
    public String getLianLuNo() { return this.lianLuNo; }
    public String getLianLuName() { return this.lianLuName; }
    public Long getGuanLangId() { return this.guanLangId; }
    public Integer getLianLuType() { return this.lianLuType; }
    public Double getTotalLength() { return this.totalLength; }
    public Integer getLianLuStatus() { return this.lianLuStatus; }
    public Integer getLoopCount() { return this.loopCount; }
    public Double getLoopPower() { return this.loopPower; }
    public LocalDateTime getCreateTime() { return this.createTime; }
    public LocalDateTime getUpdateTime() { return this.updateTime; }
    public String getRemark() { return this.remark; }
    public Integer getDeleted() { return this.deleted; }
    public void setLianLuId(Long lianLuId) { this.lianLuId = lianLuId; }
    public void setLianLuNo(String lianLuNo) { this.lianLuNo = lianLuNo; }
    public void setLianLuName(String lianLuName) { this.lianLuName = lianLuName; }
    public void setGuanLangId(Long guanLangId) { this.guanLangId = guanLangId; }
    public void setLianLuType(Integer lianLuType) { this.lianLuType = lianLuType; }
    public void setTotalLength(Double totalLength) { this.totalLength = totalLength; }
    public void setLianLuStatus(Integer lianLuStatus) { this.lianLuStatus = lianLuStatus; }
    public void setLoopCount(Integer loopCount) { this.loopCount = loopCount; }
    public void setLoopPower(Double loopPower) { this.loopPower = loopPower; }
    public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }
    public void setUpdateTime(LocalDateTime updateTime) { this.updateTime = updateTime; }
    public void setRemark(String remark) { this.remark = remark; }
    public void setDeleted(Integer deleted) { this.deleted = deleted; }
}
