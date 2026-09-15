package com.zgsq.illumination.lianlu.vo;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class LianLuVO {

    private Long lianLuId;
    private Long guanLangId;
    private String guanLangName;
    private String lianLuName;
    private String lianLuNo;
    private Integer lianLuType;
    private String lianLuTypeName;
    private Integer lianLuStatus;
    private String lianLuStatusName;
    private Double totalLength;
    private Double remainLength;
    private Integer loopCount;
    private Double loopPower;
    private String startPoint;
    private String endPoint;
    private String gisCoord;
    private String remark;
    private java.time.LocalDateTime createTime;
    private java.time.LocalDateTime updateTime;
    private Integer rowNum;

    // ========== 手动生成: getter / setter ==========
    public Long getLianLuId() { return this.lianLuId; }
    public void setLianLuId(Long lianLuId) { this.lianLuId = lianLuId; }
    public Long getGuanLangId() { return this.guanLangId; }
    public void setGuanLangId(Long guanLangId) { this.guanLangId = guanLangId; }
    public String getGuanLangName() { return this.guanLangName; }
    public void setGuanLangName(String guanLangName) { this.guanLangName = guanLangName; }
    public String getLianLuName() { return this.lianLuName; }
    public void setLianLuName(String lianLuName) { this.lianLuName = lianLuName; }
    public String getLianLuNo() { return this.lianLuNo; }
    public void setLianLuNo(String lianLuNo) { this.lianLuNo = lianLuNo; }
    public Integer getLianLuType() { return this.lianLuType; }
    public void setLianLuType(Integer lianLuType) { this.lianLuType = lianLuType; }
    public String getLianLuTypeName() { return this.lianLuTypeName; }
    public void setLianLuTypeName(String lianLuTypeName) { this.lianLuTypeName = lianLuTypeName; }
    public Integer getLianLuStatus() { return this.lianLuStatus; }
    public void setLianLuStatus(Integer lianLuStatus) { this.lianLuStatus = lianLuStatus; }
    public String getLianLuStatusName() { return this.lianLuStatusName; }
    public void setLianLuStatusName(String lianLuStatusName) { this.lianLuStatusName = lianLuStatusName; }
    public Double getTotalLength() { return this.totalLength; }
    public void setTotalLength(Double totalLength) { this.totalLength = totalLength; }
    public Double getRemainLength() { return this.remainLength; }
    public void setRemainLength(Double remainLength) { this.remainLength = remainLength; }
    public Integer getLoopCount() { return this.loopCount; }
    public void setLoopCount(Integer loopCount) { this.loopCount = loopCount; }
    public Double getLoopPower() { return this.loopPower; }
    public void setLoopPower(Double loopPower) { this.loopPower = loopPower; }
    public String getStartPoint() { return this.startPoint; }
    public void setStartPoint(String startPoint) { this.startPoint = startPoint; }
    public String getEndPoint() { return this.endPoint; }
    public void setEndPoint(String endPoint) { this.endPoint = endPoint; }
    public String getGisCoord() { return this.gisCoord; }
    public void setGisCoord(String gisCoord) { this.gisCoord = gisCoord; }
    public String getRemark() { return this.remark; }
    public void setRemark(String remark) { this.remark = remark; }
    public java.time.LocalDateTime getCreateTime() { return this.createTime; }
    public void setCreateTime(java.time.LocalDateTime createTime) { this.createTime = createTime; }
    public java.time.LocalDateTime getUpdateTime() { return this.updateTime; }
    public void setUpdateTime(java.time.LocalDateTime updateTime) { this.updateTime = updateTime; }
    public Integer getRowNum() { return this.rowNum; }
    public void setRowNum(Integer rowNum) { this.rowNum = rowNum; }
}