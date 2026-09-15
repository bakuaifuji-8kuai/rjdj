package com.zgsq.illumination.guanlang.dto;

import com.zgsq.illumination.common.PageQuery;
import java.io.Serializable;
import java.time.LocalDate;

/**
 * GuanLangDTO 内部 DTO 集合
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
public class GuanLangDTO {

    public static class GuanLangAddDTO implements Serializable {
        private static final long serialVersionUID = 1L;
        private String guanLangNo;
        private String guanLangName;
        private String belongCity;
        private Double tunnelLength;
        private Integer guanLangStatus;
        private String belongDistrict;
        private String maintainUnit;
        private Integer buildYear;
        private Integer designLife;
        private Integer patrolFrequency;
        private String gisCoord;
        private String monitorPointId;
        private String remark;

        // ========== 手动生成: getter / setter ==========
        public String getGuanLangNo() { return this.guanLangNo; }
        public void setGuanLangNo(String guanLangNo) { this.guanLangNo = guanLangNo; }
        public String getGuanLangName() { return this.guanLangName; }
        public void setGuanLangName(String guanLangName) { this.guanLangName = guanLangName; }
        public String getBelongCity() { return this.belongCity; }
        public void setBelongCity(String belongCity) { this.belongCity = belongCity; }
        public Double getTunnelLength() { return this.tunnelLength; }
        public void setTunnelLength(Double tunnelLength) { this.tunnelLength = tunnelLength; }
        public Integer getGuanLangStatus() { return this.guanLangStatus; }
        public void setGuanLangStatus(Integer guanLangStatus) { this.guanLangStatus = guanLangStatus; }
        public String getBelongDistrict() { return this.belongDistrict; }
        public void setBelongDistrict(String belongDistrict) { this.belongDistrict = belongDistrict; }
        public String getMaintainUnit() { return this.maintainUnit; }
        public void setMaintainUnit(String maintainUnit) { this.maintainUnit = maintainUnit; }
        public Integer getBuildYear() { return this.buildYear; }
        public void setBuildYear(Integer buildYear) { this.buildYear = buildYear; }
        public Integer getDesignLife() { return this.designLife; }
        public void setDesignLife(Integer designLife) { this.designLife = designLife; }
        public Integer getPatrolFrequency() { return this.patrolFrequency; }
        public void setPatrolFrequency(Integer patrolFrequency) { this.patrolFrequency = patrolFrequency; }
        public String getGisCoord() { return this.gisCoord; }
        public void setGisCoord(String gisCoord) { this.gisCoord = gisCoord; }
        public String getMonitorPointId() { return this.monitorPointId; }
        public void setMonitorPointId(String monitorPointId) { this.monitorPointId = monitorPointId; }
        public String getRemark() { return this.remark; }
        public void setRemark(String remark) { this.remark = remark; }
    }

    public static class GuanLangUpdateDTO implements Serializable {
        private static final long serialVersionUID = 1L;
        private Long guanLangId;
        private String guanLangName;
        private Double tunnelLength;
        private String belongDistrict;
        private String maintainUnit;
        private Integer buildYear;
        private Integer designLife;
        private LocalDate lastCheckDate;
        private Integer patrolFrequency;
        private String lastPatrolResult;
        private String gisCoord;
        private String monitorPointId;
        private String remark;

        // ========== 手动生成: getter / setter ==========
        public Long getGuanLangId() { return this.guanLangId; }
        public void setGuanLangId(Long guanLangId) { this.guanLangId = guanLangId; }
        public String getGuanLangName() { return this.guanLangName; }
        public void setGuanLangName(String guanLangName) { this.guanLangName = guanLangName; }
        public Double getTunnelLength() { return this.tunnelLength; }
        public void setTunnelLength(Double tunnelLength) { this.tunnelLength = tunnelLength; }
        public String getBelongDistrict() { return this.belongDistrict; }
        public void setBelongDistrict(String belongDistrict) { this.belongDistrict = belongDistrict; }
        public String getMaintainUnit() { return this.maintainUnit; }
        public void setMaintainUnit(String maintainUnit) { this.maintainUnit = maintainUnit; }
        public Integer getBuildYear() { return this.buildYear; }
        public void setBuildYear(Integer buildYear) { this.buildYear = buildYear; }
        public Integer getDesignLife() { return this.designLife; }
        public void setDesignLife(Integer designLife) { this.designLife = designLife; }
        public LocalDate getLastCheckDate() { return this.lastCheckDate; }
        public void setLastCheckDate(LocalDate lastCheckDate) { this.lastCheckDate = lastCheckDate; }
        public Integer getPatrolFrequency() { return this.patrolFrequency; }
        public void setPatrolFrequency(Integer patrolFrequency) { this.patrolFrequency = patrolFrequency; }
        public String getLastPatrolResult() { return this.lastPatrolResult; }
        public void setLastPatrolResult(String lastPatrolResult) { this.lastPatrolResult = lastPatrolResult; }
        public String getGisCoord() { return this.gisCoord; }
        public void setGisCoord(String gisCoord) { this.gisCoord = gisCoord; }
        public String getMonitorPointId() { return this.monitorPointId; }
        public void setMonitorPointId(String monitorPointId) { this.monitorPointId = monitorPointId; }
        public String getRemark() { return this.remark; }
        public void setRemark(String remark) { this.remark = remark; }
    }

    public static class GuanLangStatusDTO implements Serializable {
        private static final long serialVersionUID = 1L;
        private Long guanLangId;
        private Integer targetStatus;

        // ========== 手动生成: getter / setter ==========
        public Long getGuanLangId() { return this.guanLangId; }
        public void setGuanLangId(Long guanLangId) { this.guanLangId = guanLangId; }
        public Integer getTargetStatus() { return this.targetStatus; }
        public void setTargetStatus(Integer targetStatus) { this.targetStatus = targetStatus; }
    }

    public static class GuanLangQueryDTO extends PageQuery {
        private String guanLangNo;
        private String guanLangName;
        private Integer guanLangStatus;
        private String belongCity;
        private String belongDistrict;

        // ========== 手动生成: getter / setter ==========
        public String getGuanLangNo() { return this.guanLangNo; }
        public void setGuanLangNo(String guanLangNo) { this.guanLangNo = guanLangNo; }
        public String getGuanLangName() { return this.guanLangName; }
        public void setGuanLangName(String guanLangName) { this.guanLangName = guanLangName; }
        public Integer getGuanLangStatus() { return this.guanLangStatus; }
        public void setGuanLangStatus(Integer guanLangStatus) { this.guanLangStatus = guanLangStatus; }
        public String getBelongCity() { return this.belongCity; }
        public void setBelongCity(String belongCity) { this.belongCity = belongCity; }
        public String getBelongDistrict() { return this.belongDistrict; }
        public void setBelongDistrict(String belongDistrict) { this.belongDistrict = belongDistrict; }
    }
}
