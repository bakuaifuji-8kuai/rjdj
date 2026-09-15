/* [软著核心代码] StatMapper.java - 数据统计 Mapper */
package com.zgsq.illumination.stat.mapper;

import com.zgsq.illumination.stat.vo.StatVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

/**
 * 数据统计 Mapper —— 全部自定义 SQL（不继承 BaseMapper）
 * <p>
 * 统计查询一般不涉及单表 CRUD，用原生 SQL 聚合更高效。
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
@Mapper
public interface StatMapper {

    /** 管廊总数 */
    long countGuanLang();

    /** 链路总数 */
    long countLianLu();

    /** 配光组总数 */
    long countPeiGuang();

    /** 启用中的定时调度数 */
    long countActiveDingshi();

    /** 维护中的管廊数（status=1） */
    long countMaintainGuanLang();

    /** 今日告警数（预留，暂时返回 0） */
    long countTodayAlarm();

    /** 按行政区分组统计管廊数量 */
    List<StatVO.StatItem> groupByDistrict();

    /** 按状态分组统计管廊数量 */
    List<StatVO.StatItem> groupByStatus();
}
