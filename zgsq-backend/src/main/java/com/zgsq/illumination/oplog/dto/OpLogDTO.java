package com.zgsq.illumination.oplog.dto;

import java.time.LocalDateTime;
import java.io.Serializable;

/**
 * 操作日志 DTO 集合（主类 = 查询 DTO）
 */
public class OpLogDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private String opModule;
    private String opUserName;
    private String opResult;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer safePageNum;
    private Integer safePageSize;

    public int getSafePageNum() { return safePageNum != null ? safePageNum : 1; }
    public void setSafePageNum(Integer v) { this.safePageNum = v; }
    public int getSafePageSize() { return safePageSize != null ? safePageSize : 10; }
    public void setSafePageSize(Integer v) { this.safePageSize = v; }
    public String getOpModule() { return this.opModule; }
    public void setOpModule(String v) { this.opModule = v; }
    public String getOpUserName() { return this.opUserName; }
    public void setOpUserName(String v) { this.opUserName = v; }
    public String getOpResult() { return this.opResult; }
    public void setOpResult(String v) { this.opResult = v; }
    public LocalDateTime getStartTime() { return this.startTime; }
    public void setStartTime(LocalDateTime v) { this.startTime = v; }
    public LocalDateTime getEndTime() { return this.endTime; }
    public void setEndTime(LocalDateTime v) { this.endTime = v; }

    public static class OpLogAddDTO implements Serializable {
        private static final long serialVersionUID = 1L;
        private String opModule, opAction, opTargetId, opContent, opIp, opResult;
        public String getOpModule() { return opModule; }
        public void setOpModule(String v) { this.opModule = v; }
        public String getOpAction() { return opAction; }
        public void setOpAction(String v) { this.opAction = v; }
        public String getOpTargetId() { return opTargetId; }
        public void setOpTargetId(String v) { this.opTargetId = v; }
        public String getOpContent() { return opContent; }
        public void setOpContent(String v) { this.opContent = v; }
        public String getOpIp() { return opIp; }
        public void setOpIp(String v) { this.opIp = v; }
        public String getOpResult() { return opResult; }
        public void setOpResult(String v) { this.opResult = v; }
    }
}
