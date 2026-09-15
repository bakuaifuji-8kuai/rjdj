/* [软著核心代码] DingShiMapper.java - 定时调度表持久层 */
package com.zgsq.illumination.dingshi.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zgsq.illumination.dingshi.entity.DingShi;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 定时调度表 Mapper
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
@Mapper
public interface DingShiMapper extends BaseMapper<DingShi> {

    /** 条件分页查询 */
    List<DingShi> selectPageList(@Param("dingShiName") String dingShiName,
                                 @Param("dingShiStatus") Integer dingShiStatus,
                                 @Param("lianLuId") Long lianLuId,
                                 @Param("guanLangId") Long guanLangId,
                                 @Param("offset") int offset,
                                 @Param("pageSize") int pageSize);

    long selectPageCount(@Param("dingShiName") String dingShiName,
                         @Param("dingShiStatus") Integer dingShiStatus,
                         @Param("lianLuId") Long lianLuId,
                         @Param("guanLangId") Long guanLangId);

    /** 统计启用中的调度数量（Dashboard 用） */
    int countActive();
}
