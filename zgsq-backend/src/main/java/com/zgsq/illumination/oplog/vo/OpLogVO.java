package com.zgsq.illumination.oplog.vo;

import java.time.LocalDateTime;

public class OpLogVO {
    private Long opLogId;
    private String opUserName;
    private Long opUserId;
    private String opModule;
    private String opAction;
    private String opTargetId;
    private String opContent;
    private String opIp;
    private LocalDateTime opTime;
    private String opResult;
    private Long costMs;

    public Long getOpLogId() { return opLogId; }
    public void setOpLogId(Long v) { this.opLogId = v; }
    public String getOpUserName() { return opUserName; }
    public void setOpUserName(String v) { this.opUserName = v; }
    public Long getOpUserId() { return opUserId; }
    public void setOpUserId(Long v) { this.opUserId = v; }
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
    public LocalDateTime getOpTime() { return opTime; }
    public void setOpTime(LocalDateTime v) { this.opTime = v; }
    public String getOpResult() { return opResult; }
    public void setOpResult(String v) { this.opResult = v; }
    public Long getCostMs() { return costMs; }
    public void setCostMs(Long v) { this.costMs = v; }
}
