/* [软著核心代码] LianLuMapper.java - 链路表持久层 */
package com.zgsq.illumination.lianlu.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zgsq.illumination.lianlu.entity.LianLu;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 链路表 Mapper
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
@Mapper
public interface LianLuMapper extends BaseMapper<LianLu> {

    /**
     * 按编号查（唯一性校验）
     */
    LianLu selectByNo(@Param("lianLuNo") String lianLuNo);

    /**
     * 统计某管廊下链路数量（供 GuanLangServiceImpl 删除校验用）
     *
     * @param guanLangId 管廊 ID
     * @return 链路数
     */
    int countByGuanLangId(@Param("guanLangId") Long guanLangId);

    /**
     * 查询指定管廊下的最大链路序号（用于自动生成 LL-{guanLangNo}-XX）
     *
     * @param guanLangNo 管廊编号（链路编号的前缀）
     * @return 最大序号；无记录时返回 0
     */
    int selectMaxSeqByGuanLangNo(@Param("guanLangNo") String guanLangNo);

    /**
     * 条件分页查询（联表带出管廊名称）
     */
    List<LianLu> selectPageList(@Param("lianLuNo") String lianLuNo,
                                @Param("lianLuName") String lianLuName,
                                @Param("lianLuStatus") Integer lianLuStatus,
                                @Param("guanLangId") Long guanLangId,
                                @Param("offset") int offset,
                                @Param("pageSize") int pageSize);

    long selectPageCount(@Param("lianLuNo") String lianLuNo,
                         @Param("lianLuName") String lianLuName,
                         @Param("lianLuStatus") Integer lianLuStatus,
                         @Param("guanLangId") Long guanLangId);

    /**
     * 按管廊 ID 查链路列表（列表页 + 树导航用）
     */
    List<LianLu> selectByGuanLangId(@Param("guanLangId") Long guanLangId);
}
