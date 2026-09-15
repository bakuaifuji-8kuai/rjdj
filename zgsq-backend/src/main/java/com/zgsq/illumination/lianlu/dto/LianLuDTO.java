package com.zgsq.illumination.lianlu.dto;

import com.zgsq.illumination.common.PageQuery;
import java.io.Serializable;

/**
 * LianLuDTO 内部 DTO 集合
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
public class LianLuDTO {

    public static class LianLuAddDTO implements Serializable {
        private static final long serialVersionUID = 1L;
        private String lianLuNo;
        private String lianLuName;
        private Long guanLangId;
        private Integer lianLuType;
        private Double totalLength;
        private Integer lianLuStatus;
        private Integer loopCount;
        private Double loopPower;
        private String remark;

        // ========== 手动生成: getter / setter ==========
        public String getLianLuNo() { return this.lianLuNo; }
        public void setLianLuNo(String lianLuNo) { this.lianLuNo = lianLuNo; }
        public String getLianLuName() { return this.lianLuName; }
        public void setLianLuName(String lianLuName) { this.lianLuName = lianLuName; }
        public Long getGuanLangId() { return this.guanLangId; }
        public void setGuanLangId(Long guanLangId) { this.guanLangId = guanLangId; }
        public Integer getLianLuType() { return this.lianLuType; }
        public void setLianLuType(Integer lianLuType) { this.lianLuType = lianLuType; }
        public Double getTotalLength() { return this.totalLength; }
        public void setTotalLength(Double totalLength) { this.totalLength = totalLength; }
        public Integer getLianLuStatus() { return this.lianLuStatus; }
        public void setLianLuStatus(Integer lianLuStatus) { this.lianLuStatus = lianLuStatus; }
        public Integer getLoopCount() { return this.loopCount; }
        public void setLoopCount(Integer loopCount) { this.loopCount = loopCount; }
        public Double getLoopPower() { return this.loopPower; }
        public void setLoopPower(Double loopPower) { this.loopPower = loopPower; }
        public String getRemark() { return this.remark; }
        public void setRemark(String remark) { this.remark = remark; }
    }

    public static class LianLuUpdateDTO implements Serializable {
        private static final long serialVersionUID = 1L;
        private Long lianLuId;
        private String lianLuName;
        private Integer lianLuType;
        private Double totalLength;
        private Integer lianLuStatus;
        private Integer loopCount;
        private Double loopPower;
        private String remark;

        // ========== 手动生成: getter / setter ==========
        public Long getLianLuId() { return this.lianLuId; }
        public void setLianLuId(Long lianLuId) { this.lianLuId = lianLuId; }
        public String getLianLuName() { return this.lianLuName; }
        public void setLianLuName(String lianLuName) { this.lianLuName = lianLuName; }
        public Integer getLianLuType() { return this.lianLuType; }
        public void setLianLuType(Integer lianLuType) { this.lianLuType = lianLuType; }
        public Double getTotalLength() { return this.totalLength; }
        public void setTotalLength(Double totalLength) { this.totalLength = totalLength; }
        public Integer getLianLuStatus() { return this.lianLuStatus; }
        public void setLianLuStatus(Integer lianLuStatus) { this.lianLuStatus = lianLuStatus; }
        public Integer getLoopCount() { return this.loopCount; }
        public void setLoopCount(Integer loopCount) { this.loopCount = loopCount; }
        public Double getLoopPower() { return this.loopPower; }
        public void setLoopPower(Double loopPower) { this.loopPower = loopPower; }
        public String getRemark() { return this.remark; }
        public void setRemark(String remark) { this.remark = remark; }
    }

    public static class LianLuQueryDTO extends PageQuery {
        private String lianLuNo;
        private String lianLuName;
        private Long guanLangId;
        private Integer lianLuStatus;

        // ========== 手动生成: getter / setter ==========
        public String getLianLuNo() { return this.lianLuNo; }
        public void setLianLuNo(String lianLuNo) { this.lianLuNo = lianLuNo; }
        public String getLianLuName() { return this.lianLuName; }
        public void setLianLuName(String lianLuName) { this.lianLuName = lianLuName; }
        public Long getGuanLangId() { return this.guanLangId; }
        public void setGuanLangId(Long guanLangId) { this.guanLangId = guanLangId; }
        public Integer getLianLuStatus() { return this.lianLuStatus; }
        public void setLianLuStatus(Integer lianLuStatus) { this.lianLuStatus = lianLuStatus; }
    }
}
