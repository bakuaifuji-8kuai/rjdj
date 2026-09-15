/* [软著核心代码] PeiGuang.java - 配光组实体 */
package com.zgsq.illumination.peiguang.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 配光组实体 {@code PeiGuang} —— 挂在链路下的照明灯具配光方案
 * <p>
 * 映射表：t_zgsq_pei_guang
 * <p>
 * 层级结构：管廊(1) → 链路(N) → 配光组(M)
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
@TableName("t_zgsq_pei_guang")
public class PeiGuang implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 配光组 ID */
    @TableId(value = "pei_guang_id", type = IdType.AUTO)
    private Long peiGuangId;

    /** 配光组编号：PG-{链路编号}-XX */
    @TableField("pei_guang_no")
    private String peiGuangNo;

    /** 配光组名称 */
    @TableField("pei_guang_name")
    private String peiGuangName;

    /** 所属链路 ID（外键） */
    @TableField("lian_lu_id")
    private Long lianLuId;

    /** 所属管廊 ID（冗余外键，便于直接按管廊聚合） */
    @TableField("guan_lang_id")
    private Long guanLangId;

    /** 配光方式：1 对称 / 2 交错 / 3 单侧 */
    @TableField("pei_guang_type")
    private Integer peiGuangType;

    /** 灯具数量 */
    @TableField("lamp_count")
    private Integer lampCount;

    /** 单灯功率（W） */
    @TableField("single_lamp_power")
    private Double singleLampPower;

    /** 总功率（W，冗余：lampCount × singleLampPower） */
    @TableField("total_power")
    private Double totalPower;

    /** 亮度等级（%，0 - 100） */
    @TableField("bright_level")
    private Integer brightLevel;

    /** 配光组状态：0 正常 / 1 停用 */
    @TableField("pei_guang_status")
    private Integer peiGuangStatus;

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
    public Long getPeiGuangId() { return this.peiGuangId; }
    public String getPeiGuangNo() { return this.peiGuangNo; }
    public String getPeiGuangName() { return this.peiGuangName; }
    public Long getLianLuId() { return this.lianLuId; }
    public Long getGuanLangId() { return this.guanLangId; }
    public Integer getPeiGuangType() { return this.peiGuangType; }
    public Integer getLampCount() { return this.lampCount; }
    public Double getSingleLampPower() { return this.singleLampPower; }
    public Double getTotalPower() { return this.totalPower; }
    public Integer getBrightLevel() { return this.brightLevel; }
    public Integer getPeiGuangStatus() { return this.peiGuangStatus; }
    public LocalDateTime getCreateTime() { return this.createTime; }
    public LocalDateTime getUpdateTime() { return this.updateTime; }
    public String getRemark() { return this.remark; }
    public Integer getDeleted() { return this.deleted; }
    public void setPeiGuangId(Long peiGuangId) { this.peiGuangId = peiGuangId; }
    public void setPeiGuangNo(String peiGuangNo) { this.peiGuangNo = peiGuangNo; }
    public void setPeiGuangName(String peiGuangName) { this.peiGuangName = peiGuangName; }
    public void setLianLuId(Long lianLuId) { this.lianLuId = lianLuId; }
    public void setGuanLangId(Long guanLangId) { this.guanLangId = guanLangId; }
    public void setPeiGuangType(Integer peiGuangType) { this.peiGuangType = peiGuangType; }
    public void setLampCount(Integer lampCount) { this.lampCount = lampCount; }
    public void setSingleLampPower(Double singleLampPower) { this.singleLampPower = singleLampPower; }
    public void setTotalPower(Double totalPower) { this.totalPower = totalPower; }
    public void setBrightLevel(Integer brightLevel) { this.brightLevel = brightLevel; }
    public void setPeiGuangStatus(Integer peiGuangStatus) { this.peiGuangStatus = peiGuangStatus; }
    public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }
    public void setUpdateTime(LocalDateTime updateTime) { this.updateTime = updateTime; }
    public void setRemark(String remark) { this.remark = remark; }
    public void setDeleted(Integer deleted) { this.deleted = deleted; }
}
