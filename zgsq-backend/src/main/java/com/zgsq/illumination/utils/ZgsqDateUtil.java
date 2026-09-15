/* [软著核心代码] ZgsqDateUtil.java - 智光云枢专属日期工具类 */
package com.zgsq.illumination.utils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Date;

/**
 * 智光云枢专属日期工具类
 * <p>
 * 用于管廊巡检 / 告警 / 调度 时间处理。
 * 基于 Java 8 {@link LocalDateTime}，避免引入第三方库的重依赖。
 * <p>
 * 主要能力：
 * <ul>
 *   <li>日期格式化 / 解析（统一格式常量）</li>
 *   <li>巡检周期计算：给定上次巡检日期 + 巡检频率（天），推算下次巡检日期</li>
 *   <li>管廊剩余使用年限 / 剩余使用百分比计算</li>
 *   <li>今日零点 / 今日最后时刻（用于 Dashboard 当日统计）</li>
 * </ul>
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
public class ZgsqDateUtil {

    /** 通用日期格式 yyyy-MM-dd */
    public static final String PATTERN_DATE = "yyyy-MM-dd";
    /** 通用时间格式 yyyy-MM-dd HH:mm:ss */
    public static final String PATTERN_DATETIME = "yyyy-MM-dd HH:mm:ss";
    /** 紧凑格式（编号后缀等）yyyyMMddHHmmss */
    public static final String PATTERN_COMPACT = "yyyyMMddHHmmss";

    private static final DateTimeFormatter FMT_DATE = DateTimeFormatter.ofPattern(PATTERN_DATE);
    private static final DateTimeFormatter FMT_DATETIME = DateTimeFormatter.ofPattern(PATTERN_DATETIME);
    private static final DateTimeFormatter FMT_COMPACT = DateTimeFormatter.ofPattern(PATTERN_COMPACT);

    /** 禁止实例化 */
    private ZgsqDateUtil() {
    }

    // ========== 格式化 ==========

    /**
     * LocalDateTime → 格式化字符串（yyyy-MM-dd HH:mm:ss）
     *
     * @param dateTime 待格式化时间
     * @return 格式化字符串，null 安全返回 ""
     */
    public static String formatDateTime(LocalDateTime dateTime) {
        return dateTime == null ? "" : dateTime.format(FMT_DATETIME);
    }

    /**
     * LocalDate → 格式化字符串（yyyy-MM-dd）
     *
     * @param date 待格式化日期
     * @return 格式化字符串，null 安全返回 ""
     */
    public static String formatDate(LocalDate date) {
        return date == null ? "" : date.format(FMT_DATE);
    }

    /**
     * Date → LocalDateTime（老接口兼容）
     *
     * @param date java.util.Date
     * @return LocalDateTime，null 安全返回 null
     */
    public static LocalDateTime toLocalDateTime(Date date) {
        if (date == null) {
            return null;
        }
        return date.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();
    }

    /**
     * LocalDateTime → Date
     *
     * @param dateTime LocalDateTime
     * @return Date，null 安全返回 null
     */
    public static Date toDate(LocalDateTime dateTime) {
        if (dateTime == null) {
            return null;
        }
        return Date.from(dateTime.atZone(ZoneId.systemDefault()).toInstant());
    }

    // ========== 智光云枢专属：巡检周期计算 ==========

    /**
     * 计算下次巡检日期
     * <p>
     * 规则：下次巡检日期 = 上次巡检日期 + 巡检频率（天）。
     * 如果上次巡检日期为空，取"今天"作为起点，保证系统刚初始化时也能正常工作。
     *
     * @param lastCheckDate  上次巡检日期（管廊 lastCheckDate 字段），可空
     * @param patrolFrequency 巡检频率（天，管廊 patrolFrequency 字段），默认 30
     * @return 下次巡检日期（LocalDate）
     */
    public static LocalDate calcNextPatrolDate(LocalDate lastCheckDate, int patrolFrequency) {
        // 兜底：频率非法值时使用默认 30 天
        int frequency = patrolFrequency > 0 ? patrolFrequency : 30;
        // 没有上次巡检记录时，从今天开始算
        LocalDate base = lastCheckDate == null ? LocalDate.now() : lastCheckDate;
        return base.plusDays(frequency);
    }

    /**
     * 判断某个管廊当前是否"巡检超期"
     * <p>
     * 判定：今天 > 下次巡检日期 → 超期
     *
     * @param lastCheckDate  上次巡检日期
     * @param patrolFrequency 巡检频率（天）
     * @return true=已超期，false=未超期 / 未到
     */
    public static boolean isPatrolExpired(LocalDate lastCheckDate, int patrolFrequency) {
        LocalDate next = calcNextPatrolDate(lastCheckDate, patrolFrequency);
        return LocalDate.now().isAfter(next);
    }

    // ========== 智光云枢专属：剩余使用年限 / 剩余百分比 ==========

    /**
     * 计算管廊剩余使用年限（double，保留 2 位）
     *
     * @param buildYear  建造年份，例如 2015
     * @param designLife 设计寿命（年），例如 50
     * @return 剩余年限，负数表示已超期
     */
    public static double calcRemainLifeYears(int buildYear, int designLife) {
        int currentYear = LocalDate.now().getYear();
        long used = currentYear - (long) buildYear;
        double remain = designLife - used;
        // 保留 2 位小数
        return Math.round(remain * 100.0) / 100.0;
    }

    /**
     * 计算管廊剩余寿命百分比（0 - 100）
     *
     * @param buildYear  建造年份
     * @param designLife 设计寿命（年）
     * @return 剩余百分比，最小 0
     */
    public static int calcRemainLifePercent(int buildYear, int designLife) {
        if (designLife <= 0) {
            return 0;
        }
        double percent = calcRemainLifeYears(buildYear, designLife) * 100.0 / designLife;
        if (percent < 0) {
            return 0;
        }
        if (percent > 100) {
            return 100;
        }
        return (int) Math.round(percent);
    }

    // ========== 今日时间边界（Dashboard 当日统计用） ==========

    /**
     * 获取今日 00:00:00
     *
     * @return LocalDateTime of 00:00:00
     */
    public static LocalDateTime todayStart() {
        return LocalDate.now().atStartOfDay();
    }

    /**
     * 获取今日 23:59:59
     *
     * @return LocalDateTime of 23:59:59
     */
    public static LocalDateTime todayEnd() {
        return LocalDate.now().atTime(23, 59, 59);
    }

    /**
     * 获取紧凑格式时间戳（yyyyMMddHHmmss），用于管廊编号后缀
     *
     * @return 紧凑时间戳字符串
     */
    public static String compactNow() {
        return LocalDateTime.now().format(FMT_COMPACT);
    }

    /**
     * 取当前系统毫秒时间戳（用于操作日志 opTime 字段）
     *
     * @return 当前毫秒
     */
    public static long currentMillis() {
        return System.currentTimeMillis();
    }

}
