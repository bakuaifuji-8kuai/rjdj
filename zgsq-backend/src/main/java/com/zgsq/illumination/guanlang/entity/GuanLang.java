/* [软著核心代码] GuanLang.java - 地下综合管廊实体（核心模块） */
package com.zgsq.illumination.guanlang.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 地下综合管廊实体 {@code GuanLang} —— 智光云枢最核心业务对象
 * <p>
 * 字段说明（共 22 个，≥ 18 要求）：
 * <ol>
 *   <li>guanLangId        - 自增主键</li>
 *   <li>guanLangNo        - 业务编号，格式 GL-{市名}-{4位序}</li>
 *   <li>guanLangName      - 管廊名称</li>
 *   <li>tunnelLength      - 管廊总长度（米）</li>
 *   <li>guanLangStatus    - 管廊状态：0正常 / 1维护中 / 2停用</li>
 *   <li>belongDistrict    - 所属行政区</li>
 *   <li>maintainUnit      - 运维单位</li>
 *   <li>buildYear         - 建造年份</li>
 *   <li>designLife        - 设计寿命（年）</li>
 *   <li>lastCheckDate     - 上次巡检日期</li>
 *   <li>remainLifePercent - 剩余寿命百分比（冗余，由 Service 计算）</li>
 *   <li>patrolFrequency   - 巡检频率（天）</li>
 *   <li>lastPatrolResult  - 上次巡检结果文本</li>
 *   <li>nextPatrolPlan    - 下次巡检计划（冗余日期，由 Service 计算）</li>
 *   <li>gisCoord          - GIS 坐标串 "[经度,纬度]"</li>
 *   <li>monitorPointId    - 关联监测点 ID</li>
 *   <li>createTime        - 创建时间</li>
 *   <li>updateTime        - 更新时间</li>
 *   <li>remark            - 备注</li>
 *   <li>deleted           - 逻辑删除标志（0 未删 / 1 已删）</li>
 * </ol>
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
@TableName("t_zgsq_guan_lang")
public class GuanLang implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 管廊 ID（自增主键） */
    @TableId(value = "guan_lang_id", type = IdType.AUTO)
    private Long guanLangId;

    /** 管廊业务编号：GL-{市名}-XXXX（唯一，由 Service 自动生成） */
    @TableField("guan_lang_no")
    private String guanLangNo;

    /** 管廊中文名称，如 "XX市滨河大道地下综合管廊" */
    @TableField("guan_lang_name")
    private String guanLangName;

    /** 管廊总长度（米） */
    @TableField("tunnel_length")
    private Double tunnelLength;

    /** 管廊状态：0 正常 / 1 维护中 / 2 停用 */
    @TableField("guan_lang_status")
    private Integer guanLangStatus;

    /** 所属行政区，如 "XX区" */
    @TableField("belong_district")
    private String belongDistrict;

    /** 运维单位，如 "XX市市政工程有限公司" */
    @TableField("maintain_unit")
    private String maintainUnit;

    /** 建造年份，如 2018 */
    @TableField("build_year")
    private Integer buildYear;

    /** 设计寿命（年），如 50 */
    @TableField("design_life")
    private Integer designLife;

    /** 上次巡检日期（yyyy-MM-dd） */
    @TableField("last_check_date")
    private LocalDate lastCheckDate;

    /** 剩余寿命百分比（0-100，由 Service 在新增/更新时自动计算回填） */
    @TableField("remain_life_percent")
    private Integer remainLifePercent;

    /** 巡检频率（天），默认 30 */
    @TableField("patrol_frequency")
    private Integer patrolFrequency;

    /** 上次巡检结果文本（如 "正常 / 发现渗漏点 2 处"） */
    @TableField("last_patrol_result")
    private String lastPatrolResult;

    /** 下次巡检计划日期（由 Service 根据上次巡检日期 + 频率自动计算） */
    @TableField("next_patrol_plan")
    private LocalDate nextPatrolPlan;

    /** GIS 坐标，格式 "[经度,纬度]" */
    @TableField("gis_coord")
    private String gisCoord;

    /** 关联监测点 ID（IoT 系统关联，预留字段） */
    @TableField("monitor_point_id")
    private String monitorPointId;

    /** 创建时间 */
    @TableField("create_time")
    private LocalDateTime createTime;

    /** 更新时间 */
    @TableField("update_time")
    private LocalDateTime updateTime;

    /** 备注 */
    @TableField("remark")
    private String remark;

    /** 逻辑删除标志：0 未删除 / 1 已删除（MyBatis-Plus 全局配置） */
    @TableField("deleted")
    private Integer deleted;

    // ========== 手动生成的 getter/setter ==========
    public Long getGuanLangId() { return this.guanLangId; }
    public String getGuanLangNo() { return this.guanLangNo; }
    public String getGuanLangName() { return this.guanLangName; }
    public Double getTunnelLength() { return this.tunnelLength; }
    public Integer getGuanLangStatus() { return this.guanLangStatus; }
    public String getBelongDistrict() { return this.belongDistrict; }
    public String getMaintainUnit() { return this.maintainUnit; }
    public Integer getBuildYear() { return this.buildYear; }
    public Integer getDesignLife() { return this.designLife; }
    public LocalDate getLastCheckDate() { return this.lastCheckDate; }
    public Integer getRemainLifePercent() { return this.remainLifePercent; }
    public Integer getPatrolFrequency() { return this.patrolFrequency; }
    public String getLastPatrolResult() { return this.lastPatrolResult; }
    public LocalDate getNextPatrolPlan() { return this.nextPatrolPlan; }
    public String getGisCoord() { return this.gisCoord; }
    public String getMonitorPointId() { return this.monitorPointId; }
    public LocalDateTime getCreateTime() { return this.createTime; }
    public LocalDateTime getUpdateTime() { return this.updateTime; }
    public String getRemark() { return this.remark; }
    public Integer getDeleted() { return this.deleted; }
    public void setGuanLangId(Long guanLangId) { this.guanLangId = guanLangId; }
    public void setGuanLangNo(String guanLangNo) { this.guanLangNo = guanLangNo; }
    public void setGuanLangName(String guanLangName) { this.guanLangName = guanLangName; }
    public void setTunnelLength(Double tunnelLength) { this.tunnelLength = tunnelLength; }
    public void setGuanLangStatus(Integer guanLangStatus) { this.guanLangStatus = guanLangStatus; }
    public void setBelongDistrict(String belongDistrict) { this.belongDistrict = belongDistrict; }
    public void setMaintainUnit(String maintainUnit) { this.maintainUnit = maintainUnit; }
    public void setBuildYear(Integer buildYear) { this.buildYear = buildYear; }
    public void setDesignLife(Integer designLife) { this.designLife = designLife; }
    public void setLastCheckDate(LocalDate lastCheckDate) { this.lastCheckDate = lastCheckDate; }
    public void setRemainLifePercent(Integer remainLifePercent) { this.remainLifePercent = remainLifePercent; }
    public void setPatrolFrequency(Integer patrolFrequency) { this.patrolFrequency = patrolFrequency; }
    public void setLastPatrolResult(String lastPatrolResult) { this.lastPatrolResult = lastPatrolResult; }
    public void setNextPatrolPlan(LocalDate nextPatrolPlan) { this.nextPatrolPlan = nextPatrolPlan; }
    public void setGisCoord(String gisCoord) { this.gisCoord = gisCoord; }
    public void setMonitorPointId(String monitorPointId) { this.monitorPointId = monitorPointId; }
    public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }
    public void setUpdateTime(LocalDateTime updateTime) { this.updateTime = updateTime; }
    public void setRemark(String remark) { this.remark = remark; }
    public void setDeleted(Integer deleted) { this.deleted = deleted; }
}
