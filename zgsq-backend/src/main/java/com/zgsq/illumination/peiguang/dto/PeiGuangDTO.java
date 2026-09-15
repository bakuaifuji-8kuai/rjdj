package com.zgsq.illumination.peiguang.dto;

import com.zgsq.illumination.common.PageQuery;
import java.io.Serializable;

public class PeiGuangDTO {

    public static class PeiGuangAddDTO implements Serializable {
        private static final long serialVersionUID = 1L;
        private String peiGuangNo;
        private String peiGuangName;
        private Integer peiGuangType;
        private Long lianLuId;
        private Long guanLangId;
        private Integer lampCount;
        private Double singleLampPower;
        private Integer brightLevel;
        private Integer peiGuangStatus;
        private String remark;

        public String getPeiGuangNo() { return peiGuangNo; }
        public void setPeiGuangNo(String v) { this.peiGuangNo = v; }
        public String getPeiGuangName() { return peiGuangName; }
        public void setPeiGuangName(String v) { this.peiGuangName = v; }
        public Integer getPeiGuangType() { return peiGuangType; }
        public void setPeiGuangType(Integer v) { this.peiGuangType = v; }
        public Long getLianLuId() { return lianLuId; }
        public void setLianLuId(Long v) { this.lianLuId = v; }
        public Long getGuanLangId() { return guanLangId; }
        public void setGuanLangId(Long v) { this.guanLangId = v; }
        public Integer getLampCount() { return lampCount; }
        public void setLampCount(Integer v) { this.lampCount = v; }
        public Double getSingleLampPower() { return singleLampPower; }
        public void setSingleLampPower(Double v) { this.singleLampPower = v; }
        public Integer getBrightLevel() { return brightLevel; }
        public void setBrightLevel(Integer v) { this.brightLevel = v; }
        public Integer getPeiGuangStatus() { return peiGuangStatus; }
        public void setPeiGuangStatus(Integer v) { this.peiGuangStatus = v; }
        public String getRemark() { return remark; }
        public void setRemark(String v) { this.remark = v; }
    }

    public static class PeiGuangUpdateDTO implements Serializable {
        private static final long serialVersionUID = 1L;
        private Long peiGuangId;
        private String peiGuangName;
        private Integer peiGuangType;
        private Integer peiGuangStatus;
        private Integer lampCount;
        private Double singleLampPower;
        private Double totalPower;
        private Integer brightLevel;
        private Long guanLangId;
        private Integer interval;
        private Integer isAutoControl;
        private String remark;

        public Long getPeiGuangId() { return peiGuangId; }
        public void setPeiGuangId(Long v) { this.peiGuangId = v; }
        public String getPeiGuangName() { return peiGuangName; }
        public void setPeiGuangName(String v) { this.peiGuangName = v; }
        public Integer getPeiGuangType() { return peiGuangType; }
        public void setPeiGuangType(Integer v) { this.peiGuangType = v; }
        public Integer getPeiGuangStatus() { return peiGuangStatus; }
        public void setPeiGuangStatus(Integer v) { this.peiGuangStatus = v; }
        public Integer getLampCount() { return lampCount; }
        public void setLampCount(Integer v) { this.lampCount = v; }
        public Double getSingleLampPower() { return singleLampPower; }
        public void setSingleLampPower(Double v) { this.singleLampPower = v; }
        public Double getTotalPower() { return totalPower; }
        public void setTotalPower(Double v) { this.totalPower = v; }
        public Integer getBrightLevel() { return brightLevel; }
        public void setBrightLevel(Integer v) { this.brightLevel = v; }
        public Long getGuanLangId() { return guanLangId; }
        public void setGuanLangId(Long v) { this.guanLangId = v; }
        public Integer getInterval() { return interval; }
        public void setInterval(Integer v) { this.interval = v; }
        public Integer getIsAutoControl() { return isAutoControl; }
        public void setIsAutoControl(Integer v) { this.isAutoControl = v; }
        public String getRemark() { return remark; }
        public void setRemark(String v) { this.remark = v; }
    }

    public static class PeiGuangQueryDTO extends PageQuery implements Serializable {
        private static final long serialVersionUID = 1L;
        private String peiGuangNo;
        private String peiGuangName;
        private Long lianLuId;
        private Long guanLangId;
        private Integer peiGuangStatus;
        private Integer peiGuangType;

        public String getPeiGuangNo() { return peiGuangNo; }
        public void setPeiGuangNo(String v) { this.peiGuangNo = v; }
        public String getPeiGuangName() { return peiGuangName; }
        public void setPeiGuangName(String v) { this.peiGuangName = v; }
        public Long getLianLuId() { return lianLuId; }
        public void setLianLuId(Long v) { this.lianLuId = v; }
        public Long getGuanLangId() { return guanLangId; }
        public void setGuanLangId(Long v) { this.guanLangId = v; }
        public Integer getPeiGuangStatus() { return peiGuangStatus; }
        public void setPeiGuangStatus(Integer v) { this.peiGuangStatus = v; }
        public Integer getPeiGuangType() { return peiGuangType; }
        public void setPeiGuangType(Integer v) { this.peiGuangType = v; }
    }
}
