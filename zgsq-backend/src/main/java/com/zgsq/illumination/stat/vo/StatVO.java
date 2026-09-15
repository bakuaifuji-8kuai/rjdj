package com.zgsq.illumination.stat.vo;

import java.util.List;
import java.util.Map;

public class StatVO {

    /** 仪表盘汇总 */
    public static class DashboardVO {
        private Long guanLangCount;
        private Long lianLuCount;
        private Long peiGuangCount;
        private Long activeDingshiCount;
        private Long todayAlarmCount;
        private Long maintainGuanLangCount;

        public Long getGuanLangCount() { return guanLangCount; }
        public void setGuanLangCount(Long v) { this.guanLangCount = v; }
        public Long getLianLuCount() { return lianLuCount; }
        public void setLianLuCount(Long v) { this.lianLuCount = v; }
        public Long getPeiGuangCount() { return peiGuangCount; }
        public void setPeiGuangCount(Long v) { this.peiGuangCount = v; }
        public Long getActiveDingshiCount() { return activeDingshiCount; }
        public void setActiveDingshiCount(Long v) { this.activeDingshiCount = v; }
        public Long getTodayAlarmCount() { return todayAlarmCount; }
        public void setTodayAlarmCount(Long v) { this.todayAlarmCount = v; }
        public Long getMaintainGuanLangCount() { return maintainGuanLangCount; }
        public void setMaintainGuanLangCount(Long v) { this.maintainGuanLangCount = v; }
    }

    /** 单个分组统计项 */
    public static class StatItem {
        private String groupName;
        private Integer count;

        public String getGroupName() { return groupName; }
        public void setGroupName(String v) { this.groupName = v; }
        public Integer getCount() { return count; }
        public void setCount(Integer v) { this.count = v; }
    }

    /** 管廊分组统计容器（包含按区域 + 按状态的两个列表） */
    public static class GuanLangStatVO {
        private List<StatItem> districtList;
        private List<StatItem> statusList;

        public List<StatItem> getDistrictList() { return districtList; }
        public void setDistrictList(List<StatItem> v) { this.districtList = v; }
        public List<StatItem> getStatusList() { return statusList; }
        public void setStatusList(List<StatItem> v) { this.statusList = v; }
    }
}
