/* [软著核心代码] OpLogMapper.java - 操作日志表持久层 */
package com.zgsq.illumination.oplog.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zgsq.illumination.oplog.entity.OpLog;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 操作日志表 Mapper
 * <p>
 * 本 Mapper 除了提供 CRUD，还被 {@link com.zgsq.illumination.config.LogAspect} 直接注入，
 * 用于 AOP 切面里自动 insert 操作日志。
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
@Mapper
public interface OpLogMapper extends BaseMapper<OpLog> {

    /**
     * 条件分页查询
     *
     * @param opModule   模块名
     * @param opUserName 操作人
     * @param startTime  开始时间
     * @param endTime    结束时间
     * @param offset     偏移量
     * @param pageSize   每页大小
     * @return 日志列表
     */
    List<OpLog> selectPageList(@Param("opModule") String opModule,
                               @Param("opUserName") String opUserName,
                               @Param("startTime") LocalDateTime startTime,
                               @Param("endTime") LocalDateTime endTime,
                               @Param("offset") int offset,
                               @Param("pageSize") int pageSize);

    /** 条件计数 */
    long selectPageCount(@Param("opModule") String opModule,
                         @Param("opUserName") String opUserName,
                         @Param("startTime") LocalDateTime startTime,
                         @Param("endTime") LocalDateTime endTime);
}
