/* [软著核心代码] PeiGuangMapper.java - 配光组表持久层 */
package com.zgsq.illumination.peiguang.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zgsq.illumination.peiguang.entity.PeiGuang;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 配光组表 Mapper
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
@Mapper
public interface PeiGuangMapper extends BaseMapper<PeiGuang> {

    /** 按编号查（唯一性校验） */
    PeiGuang selectByNo(@Param("peiGuangNo") String peiGuangNo);

    /** 查询指定链路下的最大序号（用于自动生成 PG-{lianLuNo}-XX） */
    int selectMaxSeqByLianLuNo(@Param("lianLuNo") String lianLuNo);

    /**
     * 统计某链路下配光组数量（供 LianLuServiceImpl 删除校验用）
     */
    int countByLianLuId(@Param("lianLuId") Long lianLuId);

    /** 条件分页查询 */
    List<PeiGuang> selectPageList(@Param("peiGuangNo") String peiGuangNo,
                                  @Param("peiGuangName") String peiGuangName,
                                  @Param("peiGuangStatus") Integer peiGuangStatus,
                                  @Param("peiGuangType") Integer peiGuangType,
                                  @Param("lianLuId") Long lianLuId,
                                  @Param("guanLangId") Long guanLangId,
                                  @Param("offset") int offset,
                                  @Param("pageSize") int pageSize);

    long selectPageCount(@Param("peiGuangNo") String peiGuangNo,
                         @Param("peiGuangName") String peiGuangName,
                         @Param("peiGuangStatus") Integer peiGuangStatus,
                         @Param("peiGuangType") Integer peiGuangType,
                         @Param("lianLuId") Long lianLuId,
                         @Param("guanLangId") Long guanLangId);

    /** 按链路 ID 查配光组 */
    List<PeiGuang> selectByLianLuId(@Param("lianLuId") Long lianLuId);
}
