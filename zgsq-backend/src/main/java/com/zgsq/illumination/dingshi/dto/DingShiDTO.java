package com.zgsq.illumination.dingshi.dto;

import com.zgsq.illumination.common.PageQuery;
import java.io.Serializable;
import java.time.LocalTime;

/**
 * DingShiDTO 内部 DTO 集合
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
public class DingShiDTO {

    public static class DingShiAddDTO implements Serializable {
        private static final long serialVersionUID = 1L;
        private String dingShiName;
        private Long lianLuId;
        private Long guanLangId;
        private String cronExpr;
        private Integer brightLevelOn;
        private Integer brightLevelOff;
        private LocalTime startTime;
        private LocalTime endTime;
        private Integer dingShiStatus;
        private String remark;

        // ========== 手动生成: getter / setter ==========
        public String getDingShiName() { return this.dingShiName; }
        public void setDingShiName(String dingShiName) { this.dingShiName = dingShiName; }
        public Long getLianLuId() { return this.lianLuId; }
        public void setLianLuId(Long lianLuId) { this.lianLuId = lianLuId; }
        public Long getGuanLangId() { return this.guanLangId; }
        public void setGuanLangId(Long guanLangId) { this.guanLangId = guanLangId; }
        public String getCronExpr() { return this.cronExpr; }
        public void setCronExpr(String cronExpr) { this.cronExpr = cronExpr; }
        public Integer getBrightLevelOn() { return this.brightLevelOn; }
        public void setBrightLevelOn(Integer brightLevelOn) { this.brightLevelOn = brightLevelOn; }
        public Integer getBrightLevelOff() { return this.brightLevelOff; }
        public void setBrightLevelOff(Integer brightLevelOff) { this.brightLevelOff = brightLevelOff; }
        public LocalTime getStartTime() { return this.startTime; }
        public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
        public LocalTime getEndTime() { return this.endTime; }
        public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
        public Integer getDingShiStatus() { return this.dingShiStatus; }
        public void setDingShiStatus(Integer dingShiStatus) { this.dingShiStatus = dingShiStatus; }
        public String getRemark() { return this.remark; }
        public void setRemark(String remark) { this.remark = remark; }
    }

    public static class DingShiUpdateDTO implements Serializable {
        private static final long serialVersionUID = 1L;
        private Long dingShiId;
        private String dingShiName;
        private Long lianLuId;
        private String cronExpr;
        private Integer brightLevelOn;
        private Integer brightLevelOff;
        private LocalTime startTime;
        private LocalTime endTime;
        private Integer dingShiStatus;
        private String remark;

        // ========== 手动生成: getter / setter ==========
        public Long getDingShiId() { return this.dingShiId; }
        public void setDingShiId(Long dingShiId) { this.dingShiId = dingShiId; }
        public String getDingShiName() { return this.dingShiName; }
        public void setDingShiName(String dingShiName) { this.dingShiName = dingShiName; }
        public Long getLianLuId() { return this.lianLuId; }
        public void setLianLuId(Long lianLuId) { this.lianLuId = lianLuId; }
        public String getCronExpr() { return this.cronExpr; }
        public void setCronExpr(String cronExpr) { this.cronExpr = cronExpr; }
        public Integer getBrightLevelOn() { return this.brightLevelOn; }
        public void setBrightLevelOn(Integer brightLevelOn) { this.brightLevelOn = brightLevelOn; }
        public Integer getBrightLevelOff() { return this.brightLevelOff; }
        public void setBrightLevelOff(Integer brightLevelOff) { this.brightLevelOff = brightLevelOff; }
        public LocalTime getStartTime() { return this.startTime; }
        public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
        public LocalTime getEndTime() { return this.endTime; }
        public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
        public Integer getDingShiStatus() { return this.dingShiStatus; }
        public void setDingShiStatus(Integer dingShiStatus) { this.dingShiStatus = dingShiStatus; }
        public String getRemark() { return this.remark; }
        public void setRemark(String remark) { this.remark = remark; }
    }

    public static class DingShiQueryDTO extends PageQuery {
        private String dingShiName;
        private Integer dingShiStatus;
        private Long lianLuId;
        private Long guanLangId;

        // ========== 手动生成: getter / setter ==========
        public String getDingShiName() { return this.dingShiName; }
        public void setDingShiName(String dingShiName) { this.dingShiName = dingShiName; }
        public Integer getDingShiStatus() { return this.dingShiStatus; }
        public void setDingShiStatus(Integer dingShiStatus) { this.dingShiStatus = dingShiStatus; }
        public Long getLianLuId() { return this.lianLuId; }
        public void setLianLuId(Long lianLuId) { this.lianLuId = lianLuId; }
        public Long getGuanLangId() { return this.guanLangId; }
        public void setGuanLangId(Long guanLangId) { this.guanLangId = guanLangId; }
    }
}
