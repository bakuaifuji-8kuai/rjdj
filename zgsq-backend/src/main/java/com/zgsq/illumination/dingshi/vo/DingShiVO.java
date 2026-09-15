package com.zgsq.illumination.dingshi.vo;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class DingShiVO {

    private Long dingShiId;
    private String dingShiName;
    private Long lianLuId;
    private String lianLuName;
    private Long guanLangId;
    private String guanLangName;
    private Long peiGuangId;
    private String peiGuangName;
    private String cronExpr;
    private java.time.LocalTime startTime;
    private java.time.LocalTime endTime;
    private Integer brightLevelOn;
    private Integer brightLevelOff;
    private Integer dingShiStatus;
    private String dingShiStatusName;
    private java.time.LocalDateTime lastExecuteTime;
    private String lastExecuteResult;
    private String errorMsg;
    private String remark;
    private java.time.LocalDateTime createTime;
    private java.time.LocalDateTime updateTime;

    // ========== 手动生成: getter / setter ==========
    public Long getDingShiId() { return this.dingShiId; }
    public void setDingShiId(Long dingShiId) { this.dingShiId = dingShiId; }
    public String getDingShiName() { return this.dingShiName; }
    public void setDingShiName(String dingShiName) { this.dingShiName = dingShiName; }
    public Long getLianLuId() { return this.lianLuId; }
    public void setLianLuId(Long lianLuId) { this.lianLuId = lianLuId; }
    public String getLianLuName() { return this.lianLuName; }
    public void setLianLuName(String lianLuName) { this.lianLuName = lianLuName; }
    public Long getGuanLangId() { return this.guanLangId; }
    public void setGuanLangId(Long guanLangId) { this.guanLangId = guanLangId; }
    public String getGuanLangName() { return this.guanLangName; }
    public void setGuanLangName(String guanLangName) { this.guanLangName = guanLangName; }
    public Long getPeiGuangId() { return this.peiGuangId; }
    public void setPeiGuangId(Long peiGuangId) { this.peiGuangId = peiGuangId; }
    public String getPeiGuangName() { return this.peiGuangName; }
    public void setPeiGuangName(String peiGuangName) { this.peiGuangName = peiGuangName; }
    public String getCronExpr() { return this.cronExpr; }
    public void setCronExpr(String cronExpr) { this.cronExpr = cronExpr; }
    public java.time.LocalTime getStartTime() { return this.startTime; }
    public void setStartTime(java.time.LocalTime startTime) { this.startTime = startTime; }
    public java.time.LocalTime getEndTime() { return this.endTime; }
    public void setEndTime(java.time.LocalTime endTime) { this.endTime = endTime; }
    public Integer getBrightLevelOn() { return this.brightLevelOn; }
    public void setBrightLevelOn(Integer brightLevelOn) { this.brightLevelOn = brightLevelOn; }
    public Integer getBrightLevelOff() { return this.brightLevelOff; }
    public void setBrightLevelOff(Integer brightLevelOff) { this.brightLevelOff = brightLevelOff; }
    public Integer getDingShiStatus() { return this.dingShiStatus; }
    public void setDingShiStatus(Integer dingShiStatus) { this.dingShiStatus = dingShiStatus; }
    public String getDingShiStatusName() { return this.dingShiStatusName; }
    public void setDingShiStatusName(String dingShiStatusName) { this.dingShiStatusName = dingShiStatusName; }
    public java.time.LocalDateTime getLastExecuteTime() { return this.lastExecuteTime; }
    public void setLastExecuteTime(java.time.LocalDateTime lastExecuteTime) { this.lastExecuteTime = lastExecuteTime; }
    public String getLastExecuteResult() { return this.lastExecuteResult; }
    public void setLastExecuteResult(String lastExecuteResult) { this.lastExecuteResult = lastExecuteResult; }
    public String getErrorMsg() { return this.errorMsg; }
    public void setErrorMsg(String errorMsg) { this.errorMsg = errorMsg; }
    public String getRemark() { return this.remark; }
    public void setRemark(String remark) { this.remark = remark; }
    public java.time.LocalDateTime getCreateTime() { return this.createTime; }
    public void setCreateTime(java.time.LocalDateTime createTime) { this.createTime = createTime; }
    public java.time.LocalDateTime getUpdateTime() { return this.updateTime; }
    public void setUpdateTime(java.time.LocalDateTime updateTime) { this.updateTime = updateTime; }
}