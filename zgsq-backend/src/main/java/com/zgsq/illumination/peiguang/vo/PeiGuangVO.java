package com.zgsq.illumination.peiguang.vo;

import java.time.LocalDateTime;

public class PeiGuangVO {
    private Long peiGuangId;
    private String peiGuangNo;
    private String peiGuangName;
    private Long lianLuId;
    private String lianLuName;
    private Long guanLangId;
    private String guanLangName;
    private Integer peiGuangType;
    private String peiGuangTypeName;
    private Integer peiGuangStatus;
    private String peiGuangStatusName;
    private Integer brightLevel;
    private Integer lampCount;
    private Double singleLampPower;
    private Double totalPower;
    private Integer interval;
    private Integer isAutoControl;
    private String remark;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;

    public Long getPeiGuangId() { return peiGuangId; }
    public void setPeiGuangId(Long v) { this.peiGuangId = v; }
    public String getPeiGuangNo() { return peiGuangNo; }
    public void setPeiGuangNo(String v) { this.peiGuangNo = v; }
    public String getPeiGuangName() { return peiGuangName; }
    public void setPeiGuangName(String v) { this.peiGuangName = v; }
    public Long getLianLuId() { return lianLuId; }
    public void setLianLuId(Long v) { this.lianLuId = v; }
    public String getLianLuName() { return lianLuName; }
    public void setLianLuName(String v) { this.lianLuName = v; }
    public Long getGuanLangId() { return guanLangId; }
    public void setGuanLangId(Long v) { this.guanLangId = v; }
    public String getGuanLangName() { return guanLangName; }
    public void setGuanLangName(String v) { this.guanLangName = v; }
    public Integer getPeiGuangType() { return peiGuangType; }
    public void setPeiGuangType(Integer v) { this.peiGuangType = v; }
    public String getPeiGuangTypeName() { return peiGuangTypeName; }
    public void setPeiGuangTypeName(String v) { this.peiGuangTypeName = v; }
    public Integer getPeiGuangStatus() { return peiGuangStatus; }
    public void setPeiGuangStatus(Integer v) { this.peiGuangStatus = v; }
    public String getPeiGuangStatusName() { return peiGuangStatusName; }
    public void setPeiGuangStatusName(String v) { this.peiGuangStatusName = v; }
    public Integer getBrightLevel() { return brightLevel; }
    public void setBrightLevel(Integer v) { this.brightLevel = v; }
    public Integer getLampCount() { return lampCount; }
    public void setLampCount(Integer v) { this.lampCount = v; }
    public Double getSingleLampPower() { return singleLampPower; }
    public void setSingleLampPower(Double v) { this.singleLampPower = v; }
    public Double getTotalPower() { return totalPower; }
    public void setTotalPower(Double v) { this.totalPower = v; }
    public Integer getInterval() { return interval; }
    public void setInterval(Integer v) { this.interval = v; }
    public Integer getIsAutoControl() { return isAutoControl; }
    public void setIsAutoControl(Integer v) { this.isAutoControl = v; }
    public String getRemark() { return remark; }
    public void setRemark(String v) { this.remark = v; }
    public LocalDateTime getCreateTime() { return createTime; }
    public void setCreateTime(LocalDateTime v) { this.createTime = v; }
    public LocalDateTime getUpdateTime() { return updateTime; }
    public void setUpdateTime(LocalDateTime v) { this.updateTime = v; }
}
