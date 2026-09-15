/* [软著核心代码] OpLogService.java - 操作日志业务接口 */
package com.zgsq.illumination.oplog.service;

import com.zgsq.illumination.common.PageResult;
import com.zgsq.illumination.oplog.dto.OpLogDTO;
import com.zgsq.illumination.oplog.vo.OpLogVO;

/**
 * 操作日志业务接口
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
public interface OpLogService {

    /** 分页查询操作日志（只读） */
    PageResult<OpLogVO> pageOpLog(OpLogDTO query);
}
