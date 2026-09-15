package com.zgsq.illumination.guanlang.vo;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class GuanLangVO {

    private Long guanLangId;
    private String guanLangNo;
    private String guanLangName;
    private String belongDistrict;
    private Integer guanLangStatus;
    private String guanLangStatusName;
    private Double tunnelLength;
    private Integer buildYear;
    private Integer designLife;
    private Double remainLifeYears;
    private Integer remainLifePercent;
    private String maintainUnit;
    private java.time.LocalDate lastCheckDate;
    private Integer patrolFrequency;
    private String lastPatrolResult;
    private java.time.LocalDate nextPatrolPlan;
    private Boolean patrolExpired;
    private String gisCoord;
    private String monitorPointId;
    private Integer lianLuCount;
    private String remark;
    private java.time.LocalDateTime createTime;
    private java.time.LocalDateTime updateTime;
    private Integer rowNum;

    // ========== 手动生成: getter / setter ==========
    public Long getGuanLangId() { return this.guanLangId; }
    public void setGuanLangId(Long guanLangId) { this.guanLangId = guanLangId; }
    public String getGuanLangNo() { return this.guanLangNo; }
    public void setGuanLangNo(String guanLangNo) { this.guanLangNo = guanLangNo; }
    public String getGuanLangName() { return this.guanLangName; }
    public void setGuanLangName(String guanLangName) { this.guanLangName = guanLangName; }
    public String getBelongDistrict() { return this.belongDistrict; }
    public void setBelongDistrict(String belongDistrict) { this.belongDistrict = belongDistrict; }
    public Integer getGuanLangStatus() { return this.guanLangStatus; }
    public void setGuanLangStatus(Integer guanLangStatus) { this.guanLangStatus = guanLangStatus; }
    public String getGuanLangStatusName() { return this.guanLangStatusName; }
    public void setGuanLangStatusName(String guanLangStatusName) { this.guanLangStatusName = guanLangStatusName; }
    public Double getTunnelLength() { return this.tunnelLength; }
    public void setTunnelLength(Double tunnelLength) { this.tunnelLength = tunnelLength; }
    public Integer getBuildYear() { return this.buildYear; }
    public void setBuildYear(Integer buildYear) { this.buildYear = buildYear; }
    public Integer getDesignLife() { return this.designLife; }
    public void setDesignLife(Integer designLife) { this.designLife = designLife; }
    public Double getRemainLifeYears() { return this.remainLifeYears; }
    public void setRemainLifeYears(Double remainLifeYears) { this.remainLifeYears = remainLifeYears; }
    public Integer getRemainLifePercent() { return this.remainLifePercent; }
    public void setRemainLifePercent(Integer remainLifePercent) { this.remainLifePercent = remainLifePercent; }
    public String getMaintainUnit() { return this.maintainUnit; }
    public void setMaintainUnit(String maintainUnit) { this.maintainUnit = maintainUnit; }
    public java.time.LocalDate getLastCheckDate() { return this.lastCheckDate; }
    public void setLastCheckDate(java.time.LocalDate lastCheckDate) { this.lastCheckDate = lastCheckDate; }
    public Integer getPatrolFrequency() { return this.patrolFrequency; }
    public void setPatrolFrequency(Integer patrolFrequency) { this.patrolFrequency = patrolFrequency; }
    public String getLastPatrolResult() { return this.lastPatrolResult; }
    public void setLastPatrolResult(String lastPatrolResult) { this.lastPatrolResult = lastPatrolResult; }
    public java.time.LocalDate getNextPatrolPlan() { return this.nextPatrolPlan; }
    public void setNextPatrolPlan(java.time.LocalDate nextPatrolPlan) { this.nextPatrolPlan = nextPatrolPlan; }
    public Boolean getPatrolExpired() { return this.patrolExpired; }
    public void setPatrolExpired(Boolean patrolExpired) { this.patrolExpired = patrolExpired; }
    public String getGisCoord() { return this.gisCoord; }
    public void setGisCoord(String gisCoord) { this.gisCoord = gisCoord; }
    public String getMonitorPointId() { return this.monitorPointId; }
    public void setMonitorPointId(String monitorPointId) { this.monitorPointId = monitorPointId; }
    public Integer getLianLuCount() { return this.lianLuCount; }
    public void setLianLuCount(Integer lianLuCount) { this.lianLuCount = lianLuCount; }
    public String getRemark() { return this.remark; }
    public void setRemark(String remark) { this.remark = remark; }
    public java.time.LocalDateTime getCreateTime() { return this.createTime; }
    public void setCreateTime(java.time.LocalDateTime createTime) { this.createTime = createTime; }
    public java.time.LocalDateTime getUpdateTime() { return this.updateTime; }
    public void setUpdateTime(java.time.LocalDateTime updateTime) { this.updateTime = updateTime; }
    public Integer getRowNum() { return this.rowNum; }
    public void setRowNum(Integer rowNum) { this.rowNum = rowNum; }
}