/* [软著核心代码] OpLogServiceImpl.java - 操作日志业务实现 */
package com.zgsq.illumination.oplog.service.impl;

import com.zgsq.illumination.common.PageResult;
import com.zgsq.illumination.oplog.dto.OpLogDTO;
import com.zgsq.illumination.oplog.entity.OpLog;
import com.zgsq.illumination.oplog.mapper.OpLogMapper;
import com.zgsq.illumination.oplog.service.OpLogService;
import com.zgsq.illumination.oplog.vo.OpLogVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 操作日志业务实现
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
@Service
public class OpLogServiceImpl implements OpLogService {

    @Autowired
    private OpLogMapper opLogMapper;

    @Override
    public PageResult<OpLogVO> pageOpLog(OpLogDTO query) {
        int pageNum = query.getSafePageNum();
        int pageSize = query.getSafePageSize();
        int offset = (pageNum - 1) * pageSize;
        long total = opLogMapper.selectPageCount(query.getOpModule(), query.getOpUserName(),
                query.getStartTime(), query.getEndTime());
        List<OpLog> list = opLogMapper.selectPageList(query.getOpModule(), query.getOpUserName(),
                query.getStartTime(), query.getEndTime(), offset, pageSize);
        List<OpLogVO> voList = list.stream().map(this::toVO).collect(Collectors.toList());
        return PageResult.of(voList, total, pageNum, pageSize);
    }

    /** Entity → VO */
    private OpLogVO toVO(OpLog log) {
        OpLogVO vo = new OpLogVO();
        vo.setOpLogId(log.getOpLogId());
        vo.setOpUserId(log.getOpUserId());
        vo.setOpUserName(log.getOpUserName());
        vo.setOpModule(log.getOpModule());
        vo.setOpAction(log.getOpAction());
        vo.setOpTargetId(log.getOpTargetId());
        vo.setOpContent(log.getOpContent());
        vo.setOpIp(log.getOpIp());
        vo.setOpResult(log.getOpResult());
        vo.setCostMs(log.getCostMs());
        vo.setOpTime(log.getOpTime());
        return vo;
    }

}
