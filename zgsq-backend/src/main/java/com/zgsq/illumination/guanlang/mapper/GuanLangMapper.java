/* [软著核心代码] GuanLangMapper.java - 管廊表持久层 */
package com.zgsq.illumination.guanlang.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zgsq.illumination.guanlang.entity.GuanLang;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 管廊表 Mapper 接口
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
@Mapper
public interface GuanLangMapper extends BaseMapper<GuanLang> {

    /**
     * 按编号精确查（唯一性校验）
     */
    GuanLang selectByNo(@Param("guanLangNo") String guanLangNo);

    /**
     * 查询指定城市下当前最大序号（用于自动生成编号 GL-{city}-XXXX）
     *
     * @param cityName 城市名
     * @return 最大序号；无记录时返回 0
     */
    int selectMaxSeqByCity(@Param("cityName") String cityName);

    /**
     * 按状态列表筛选管廊
     *
     * @param statusList 状态值数组（如 [0, 1]）
     * @return 管廊列表
     */
    List<GuanLang> selectByStatusList(@Param("statusList") List<Integer> statusList);

    /**
     * GIS 范围内查询（经纬度 bounding box）
     *
     * @param minLon 最小经度
     * @param maxLon 最大经度
     * @param minLat 最小纬度
     * @param maxLat 最大纬度
     * @return 管廊列表
     */
    List<GuanLang> selectByGisRange(@Param("minLon") double minLon,
                                    @Param("maxLon") double maxLon,
                                    @Param("minLat") double minLat,
                                    @Param("maxLat") double maxLat);

    /**
     * 条件分页查询
     */
    List<GuanLang> selectPageList(@Param("guanLangNo") String guanLangNo,
                                 @Param("guanLangName") String guanLangName,
                                 @Param("guanLangStatus") Integer guanLangStatus,
                                 @Param("belongDistrict") String belongDistrict,
                                 @Param("offset") int offset,
                                 @Param("pageSize") int pageSize);

    /**
     * 条件分页统计
     */
    long selectPageCount(@Param("guanLangNo") String guanLangNo,
                         @Param("guanLangName") String guanLangName,
                         @Param("guanLangStatus") Integer guanLangStatus,
                         @Param("belongDistrict") String belongDistrict);
}
