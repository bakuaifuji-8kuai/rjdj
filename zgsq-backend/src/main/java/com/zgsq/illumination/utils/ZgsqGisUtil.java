/* [软著核心代码] ZgsqGisUtil.java - 智光云枢 GIS 坐标距离计算工具 */
package com.zgsq.illumination.utils;

import com.zgsq.illumination.common.ErrorCode;
import com.zgsq.illumination.exception.BusinessException;

/**
 * GIS 坐标距离计算工具
 * <p>
 * 业务场景：
 * <ul>
 *   <li>管廊 GIS 坐标 = "[经度,纬度]"（WGS84 格式，与高德 / 百度地图一致）</li>
 *   <li>需要计算两个管廊之间的直线距离（Haversine 球面距离公式）</li>
 *   <li>需要按"中心点 + 半径"过滤附近的管廊（selectByGisRange SQL 前置过滤的辅助判断）</li>
 * </ul>
 * 地球半径取 6371.0088 km（WGS84 参考椭球平均半径），精度 ±0.5%。
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
public class ZgsqGisUtil {

    /** 地球平均半径（单位：米） */
    private static final double EARTH_RADIUS_METERS = 6371008.8;

    /** 经纬度范围边界常量 */
    private static final double MIN_LON = -180.0;
    private static final double MAX_LON = 180.0;
    private static final double MIN_LAT = -90.0;
    private static final double MAX_LAT = 90.0;

    /** 坐标格式约定："[经度,纬度]" */
    public static final String COORD_FORMAT = "[经度,纬度]";

    private ZgsqGisUtil() {
        // 禁止实例化
    }

    /**
     * 计算两个经纬度坐标之间的球面距离（Haversine 公式）
     *
     * @param lon1 点 1 经度
     * @param lat1 点 1 纬度
     * @param lon2 点 2 经度
     * @param lat2 点 2 纬度
     * @return 距离（单位：米），保留 2 位小数
     */
    public static double haversine(double lon1, double lat1, double lon2, double lat2) {
        // 转弧度
        double rLat1 = Math.toRadians(lat1);
        double rLat2 = Math.toRadians(lat2);
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        // Haversine 中间量
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(rLat1) * Math.cos(rLat2)
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        double distance = EARTH_RADIUS_METERS * c;
        return Math.round(distance * 100.0) / 100.0;
    }

    /**
     * 判断点 2 是否在以点 1 为中心、radius 米为半径的范围内
     *
     * @param lon1    中心点经度
     * @param lat1    中心点纬度
     * @param lon2    目标点经度
     * @param lat2    目标点纬度
     * @param radius  半径（米）
     * @return true=在范围内
     */
    public static boolean withinRange(double lon1, double lat1, double lon2, double lat2, double radius) {
        return haversine(lon1, lat1, lon2, lat2) <= radius;
    }

    /**
     * 解析 GIS 坐标字符串 "[经度,纬度]" 为 double[2]
     * <p>
     * 兼容格式：
     * <ul>
     *   <li>"116.404,39.915" —— 直接逗号分隔</li>
     *   <li>"[116.404, 39.915]" —— 带方括号（允许空格）</li>
     *   <li>"116.404 39.915" —— 空格分隔</li>
     * </ul>
     *
     * @param coordStr 原始坐标串
     * @return double[2]，[0]=经度, [1]=纬度
     * @throws BusinessException 格式错误时抛出 GIS_COORD_INVALID
     */
    public static double[] parseCoord(String coordStr) {
        if (coordStr == null || coordStr.trim().isEmpty()) {
            throw new BusinessException(ErrorCode.GIS_COORD_INVALID, "坐标为空");
        }
        // 去括号、空格
        String s = coordStr.trim().replaceAll("[\\[\\]\\s]+", "");
        String[] parts = s.split(",");
        if (parts.length != 2) {
            throw new BusinessException(ErrorCode.GIS_COORD_INVALID,
                    "坐标格式错误，应为" + COORD_FORMAT + " 实际：" + coordStr);
        }
        try {
            double lon = Double.parseDouble(parts[0]);
            double lat = Double.parseDouble(parts[1]);
            validateLonLat(lon, lat);
            return new double[]{lon, lat};
        } catch (NumberFormatException e) {
            throw new BusinessException(ErrorCode.GIS_COORD_INVALID,
                    "坐标数字解析失败：" + coordStr);
        }
    }

    /**
     * 校验经纬度是否在合法范围内
     *
     * @param lon 经度 [-180, 180]
     * @param lat 纬度 [-90, 90]
     * @throws BusinessException 越界时抛
     */
    public static void validateLonLat(double lon, double lat) {
        if (lon < MIN_LON || lon > MAX_LON) {
            throw new BusinessException(ErrorCode.GIS_COORD_INVALID,
                    "经度越界：" + lon + "，范围 [-180, 180]");
        }
        if (lat < MIN_LAT || lat > MAX_LAT) {
            throw new BusinessException(ErrorCode.GIS_COORD_INVALID,
                    "纬度越界：" + lat + "，范围 [-90, 90]");
        }
    }

    /**
     * 计算两点距离（直接传入坐标字符串）
     *
     * @param coord1 GIS 坐标 1（"[经度,纬度]"）
     * @param coord2 GIS 坐标 2
     * @return 距离（米）
     */
    public static double distanceByCoord(String coord1, String coord2) {
        double[] c1 = parseCoord(coord1);
        double[] c2 = parseCoord(coord2);
        return haversine(c1[0], c1[1], c2[0], c2[1]);
    }

    /**
     * 获取点 {lon, lat} 在 {centerLon, centerLat} 半径 radius 米内的经纬度范围
     * <p>
     * 用于 SQL "BETWEEN ? AND ?" 粗过滤（精度略低但速度极快）。
     *
     * @param centerLon 中心经度
     * @param centerLat 中心纬度
     * @param radius    半径（米）
     * @return double[4]：{minLon, maxLon, minLat, maxLat}
     */
    public static double[] boundingBox(double centerLon, double centerLat, double radius) {
        // 经度方向：1 度 ≈ 111.32 km × cos
        double latRadians = Math.toRadians(centerLat);
        double deltaLat = radius / EARTH_RADIUS_METERS * 180.0 / Math.PI;
        double deltaLon = radius / (EARTH_RADIUS_METERS * Math.cos(latRadians)) * 180.0 / Math.PI;

        double minLat = centerLat - deltaLat;
        double maxLat = centerLat + deltaLat;
        double minLon = centerLon - deltaLon;
        double maxLon = centerLon + deltaLon;

        // 边界裁剪（跨 180/-180 度时简单处理，不追求完美）
        minLat = Math.max(MIN_LAT, minLat);
        maxLat = Math.min(MAX_LAT, maxLat);
        if (minLon < MIN_LON) minLon = MIN_LON;
        if (maxLon > MAX_LON) maxLon = MAX_LON;

        return new double[]{minLon, maxLon, minLat, maxLat};
    }

}
