package com.zgsq.illumination.utils;

import com.zgsq.illumination.guanlang.entity.GuanLang;
import com.zgsq.illumination.exception.BusinessException;
import com.zgsq.illumination.common.ErrorCode;

import java.io.*;
import java.util.*;

/**
 * 管廊 Excel 导入/导出工具
 * 使用简单 CSV 读写（无 Apache POI 依赖）
 */
public class GuanLangExcelUtil {

    /** 导入行映射 DTO */
    public static class GuanLangRow {
        private String guanLangNo;
        private String guanLangName;
        private String belongDistrict;
        private String belongCity;
        private Double tunnelLength;
        private Integer guanLangStatus;
        private String maintainUnit;
        private Integer buildYear;
        private Integer designLife;
        private Integer patrolFrequency;
        private String gisCoord;
        private String monitorPointId;
        private String remark;
        private Integer rowNum;

        public String getGuanLangNo() { return guanLangNo; }
        public void setGuanLangNo(String v) { this.guanLangNo = v; }
        public String getGuanLangName() { return guanLangName; }
        public void setGuanLangName(String v) { this.guanLangName = v; }
        public String getBelongDistrict() { return belongDistrict; }
        public void setBelongDistrict(String v) { this.belongDistrict = v; }
        public String getBelongCity() { return belongCity; }
        public void setBelongCity(String v) { this.belongCity = v; }
        public Double getTunnelLength() { return tunnelLength; }
        public void setTunnelLength(Double v) { this.tunnelLength = v; }
        public Integer getGuanLangStatus() { return guanLangStatus; }
        public void setGuanLangStatus(Integer v) { this.guanLangStatus = v; }
        public String getMaintainUnit() { return maintainUnit; }
        public void setMaintainUnit(String v) { this.maintainUnit = v; }
        public Integer getBuildYear() { return buildYear; }
        public void setBuildYear(Integer v) { this.buildYear = v; }
        public Integer getDesignLife() { return designLife; }
        public void setDesignLife(Integer v) { this.designLife = v; }
        public Integer getPatrolFrequency() { return patrolFrequency; }
        public void setPatrolFrequency(Integer v) { this.patrolFrequency = v; }
        public String getGisCoord() { return gisCoord; }
        public void setGisCoord(String v) { this.gisCoord = v; }
        public String getMonitorPointId() { return monitorPointId; }
        public void setMonitorPointId(String v) { this.monitorPointId = v; }
        public String getRemark() { return remark; }
        public void setRemark(String v) { this.remark = v; }
        public Integer getRowNum() { return rowNum; }
        public void setRowNum(Integer v) { this.rowNum = v; }
    }

    /** CSV 分隔符 */
    public static final String CSV_SEP = ",";

    /** 状态文本 → 数值映射 */
    public static final Map<String, Integer> STATUS_MAP = new HashMap<>();
    static {
        STATUS_MAP.put("正常", 1);
        STATUS_MAP.put("停用", 0);
        STATUS_MAP.put("维护中", 2);
    }

    /** 解析 CSV 行 → GuanLangRow */
    public static GuanLangRow parseRow(String[] cells, int rowNum) {
        GuanLangRow row = new GuanLangRow();
        row.setRowNum(rowNum);
        if (cells.length > 0) row.setGuanLangNo(cells[0].trim());
        if (cells.length > 1) row.setGuanLangName(cells[1].trim());
        if (cells.length > 2) row.setBelongCity(cells[2].trim());
        if (cells.length > 3) row.setBelongDistrict(cells[3].trim());
        if (cells.length > 4) {
            try { row.setTunnelLength(Double.parseDouble(cells[4].trim())); } catch (Exception ignore) {}
        }
        if (cells.length > 5) {
            String statusStr = cells[5].trim();
            if (STATUS_MAP.containsKey(statusStr)) {
                row.setGuanLangStatus(STATUS_MAP.get(statusStr));
            } else {
                try { row.setGuanLangStatus(Integer.parseInt(statusStr)); } catch (Exception ignore) {}
            }
        }
        if (cells.length > 6) row.setMaintainUnit(cells[6].trim());
        if (cells.length > 7) {
            try { row.setBuildYear(Integer.parseInt(cells[7].trim())); } catch (Exception ignore) {}
        }
        if (cells.length > 8) {
            try { row.setDesignLife(Integer.parseInt(cells[8].trim())); } catch (Exception ignore) {}
        }
        if (cells.length > 9) {
            try { row.setPatrolFrequency(Integer.parseInt(cells[9].trim())); } catch (Exception ignore) {}
        }
        if (cells.length > 10) row.setGisCoord(cells[10].trim());
        if (cells.length > 11) row.setMonitorPointId(cells[11].trim());
        if (cells.length > 12) row.setRemark(cells[12].trim());
        return row;
    }

    /** GuanLangRow → GuanLang 实体 */
    public static GuanLang toEntity(GuanLangRow row) {
        GuanLang gl = new GuanLang();
        gl.setGuanLangNo(row.getGuanLangNo());
        gl.setGuanLangName(row.getGuanLangName());
        gl.setBelongDistrict(row.getBelongDistrict());
        gl.setTunnelLength(row.getTunnelLength());
        gl.setGuanLangStatus(row.getGuanLangStatus());
        gl.setMaintainUnit(row.getMaintainUnit());
        gl.setBuildYear(row.getBuildYear());
        gl.setDesignLife(row.getDesignLife());
        gl.setPatrolFrequency(row.getPatrolFrequency());
        gl.setGisCoord(row.getGisCoord());
        gl.setMonitorPointId(row.getMonitorPointId());
        gl.setRemark(row.getRemark());
        return gl;
    }

    /** 读取 CSV 文件为 GuanLangRow 列表 */
    public static List<GuanLangRow> readCsv(InputStream is) {
        List<GuanLangRow> rows = new ArrayList<>();
        try (BufferedReader br = new BufferedReader(new InputStreamReader(is))) {
            String line;
            int rowNum = 0;
            boolean firstLine = true;
            while ((line = br.readLine()) != null) {
                rowNum++;
                if (firstLine) { firstLine = false; continue; } // 跳过表头
                if (line.trim().isEmpty()) continue;
                String[] cells = line.split(CSV_SEP);
                rows.add(parseRow(cells, rowNum));
            }
        } catch (Exception e) {
            throw new BusinessException(ErrorCode.EXCEL_IMPORT_FAIL, "文件读取失败: " + e.getMessage());
        }
        return rows;
    }
}
