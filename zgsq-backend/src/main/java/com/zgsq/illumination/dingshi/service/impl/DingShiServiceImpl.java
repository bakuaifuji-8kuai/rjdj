/* [软著核心代码] DingShiServiceImpl.java - 定时调度模块业务实现 */
package com.zgsq.illumination.dingshi.service.impl;

import com.zgsq.illumination.common.ErrorCode;
import com.zgsq.illumination.common.PageResult;
import com.zgsq.illumination.dingshi.dto.DingShiDTO;
import com.zgsq.illumination.dingshi.entity.DingShi;
import com.zgsq.illumination.dingshi.mapper.DingShiMapper;
import com.zgsq.illumination.dingshi.service.DingShiService;
import com.zgsq.illumination.dingshi.vo.DingShiVO;
import com.zgsq.illumination.exception.BusinessException;
import com.zgsq.illumination.guanlang.entity.GuanLang;
import com.zgsq.illumination.guanlang.mapper.GuanLangMapper;
import com.zgsq.illumination.lianlu.entity.LianLu;
import com.zgsq.illumination.lianlu.mapper.LianLuMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 定时调度模块业务实现
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
@Service
public class DingShiServiceImpl implements DingShiService {

    @Autowired
    private DingShiMapper dingShiMapper;

    @Autowired
    private LianLuMapper lianLuMapper;

    @Autowired
    private GuanLangMapper guanLangMapper;

    @Override
    public Long addDingShi(DingShiDTO.DingShiAddDTO dto) {
        // 1. 链路必须存在
        LianLu ll = lianLuMapper.selectById(dto.getLianLuId());
        if (ll == null) {
            throw new BusinessException(ErrorCode.LIANLU_NOT_FOUND);
        }
        // 2. Cron 表达式格式校验（简单版：包含 5 或 6 段）
        validateCron(dto.getCronExpr());

        DingShi ds = new DingShi();
        ds.setDingShiName(dto.getDingShiName());
        ds.setLianLuId(dto.getLianLuId());
        ds.setGuanLangId(ll.getGuanLangId());
        ds.setCronExpr(dto.getCronExpr());
        ds.setBrightLevelOn(dto.getBrightLevelOn() == null ? 80 : dto.getBrightLevelOn());
        ds.setBrightLevelOff(dto.getBrightLevelOff() == null ? 0 : dto.getBrightLevelOff());
        ds.setStartTime(dto.getStartTime());
        ds.setEndTime(dto.getEndTime());
        ds.setDingShiStatus(dto.getDingShiStatus() == null ? 0 : dto.getDingShiStatus());
        ds.setRemark(dto.getRemark());
        LocalDateTime now = LocalDateTime.now();
        ds.setCreateTime(now);
        ds.setUpdateTime(now);
        dingShiMapper.insert(ds);
        return ds.getDingShiId();
    }

    @Override
    public void updateDingShi(DingShiDTO.DingShiUpdateDTO dto) {
        DingShi ds = dingShiMapper.selectById(dto.getDingShiId());
        if (ds == null) {
            throw new BusinessException(ErrorCode.DINGSHI_NOT_FOUND);
        }
        if (dto.getDingShiName() != null) ds.setDingShiName(dto.getDingShiName());
        if (dto.getCronExpr() != null && !dto.getCronExpr().isEmpty()) {
            validateCron(dto.getCronExpr());
            ds.setCronExpr(dto.getCronExpr());
        }
        if (dto.getBrightLevelOn() != null) ds.setBrightLevelOn(dto.getBrightLevelOn());
        if (dto.getBrightLevelOff() != null) ds.setBrightLevelOff(dto.getBrightLevelOff());
        if (dto.getStartTime() != null) ds.setStartTime(dto.getStartTime());
        if (dto.getEndTime() != null) ds.setEndTime(dto.getEndTime());
        if (dto.getDingShiStatus() != null) ds.setDingShiStatus(dto.getDingShiStatus());
        if (dto.getRemark() != null) ds.setRemark(dto.getRemark());
        ds.setUpdateTime(LocalDateTime.now());
        dingShiMapper.updateById(ds);
    }

    @Override
    public void deleteDingShi(Long dingShiId) {
        dingShiMapper.deleteById(dingShiId);
    }

    @Override
    public void toggleDingShi(Long dingShiId) {
        DingShi ds = dingShiMapper.selectById(dingShiId);
        if (ds == null) {
            throw new BusinessException(ErrorCode.DINGSHI_NOT_FOUND);
        }
        // 0 启用 ↔ 1 禁用
        int cur = ds.getDingShiStatus() == null ? 0 : ds.getDingShiStatus();
        ds.setDingShiStatus(cur == 0 ? 1 : 0);
        ds.setUpdateTime(LocalDateTime.now());
        dingShiMapper.updateById(ds);
    }

    @Override
    public PageResult<DingShiVO> pageDingShi(DingShiDTO.DingShiQueryDTO query) {
        int pageNum = query.getSafePageNum();
        int pageSize = query.getSafePageSize();
        int offset = (pageNum - 1) * pageSize;
        long total = dingShiMapper.selectPageCount(query.getDingShiName(), query.getDingShiStatus(),
                query.getLianLuId(), query.getGuanLangId());
        List<DingShi> list = dingShiMapper.selectPageList(query.getDingShiName(), query.getDingShiStatus(),
                query.getLianLuId(), query.getGuanLangId(), offset, pageSize);
        List<DingShiVO> voList = list.stream().map(this::toVO).collect(Collectors.toList());
        return PageResult.of(voList, total, pageNum, pageSize);
    }

    private DingShiVO toVO(DingShi ds) {
        DingShiVO vo = new DingShiVO();
        vo.setDingShiId(ds.getDingShiId());
        vo.setDingShiName(ds.getDingShiName());
        vo.setLianLuId(ds.getLianLuId());
        vo.setGuanLangId(ds.getGuanLangId());
        vo.setCronExpr(ds.getCronExpr());
        vo.setBrightLevelOn(ds.getBrightLevelOn());
        vo.setBrightLevelOff(ds.getBrightLevelOff());
        vo.setStartTime(ds.getStartTime());
        vo.setEndTime(ds.getEndTime());
        vo.setDingShiStatus(ds.getDingShiStatus());
        vo.setDingShiStatusName(ds.getDingShiStatus() == null ? "" : (ds.getDingShiStatus() == 0 ? "启用" : "禁用"));
        vo.setLastExecuteTime(ds.getLastExecuteTime());
        vo.setLastExecuteResult(ds.getLastExecuteResult());
        vo.setRemark(ds.getRemark());
        vo.setCreateTime(ds.getCreateTime());
        vo.setUpdateTime(ds.getUpdateTime());
        // 关联带出名称
        if (ds.getLianLuId() != null) {
            LianLu ll = lianLuMapper.selectById(ds.getLianLuId());
            vo.setLianLuName(ll == null ? "" : ll.getLianLuName());
        }
        if (ds.getGuanLangId() != null) {
            GuanLang gl = guanLangMapper.selectById(ds.getGuanLangId());
            vo.setGuanLangName(gl == null ? "" : gl.getGuanLangName());
        }
        return vo;
    }

    /**
     * 简单 Cron 表达式校验
     * <p>
     * Spring Scheduler 6 位格式：秒 分 时 日 月 周
     * 要求：
     * <ul>
     *   <li>非空</li>
     *   <li>空格分隔后 ≥ 5 段（兼容 5 位格式）</li>
     * </ul>
     *
     * @param cron Cron 表达式
     * @throws BusinessException 格式错误时抛 DINGSHI_CRON_INVALID
     */
    private void validateCron(String cron) {
        if (!StringUtils.hasText(cron)) {
            throw new BusinessException(ErrorCode.DINGSHI_CRON_INVALID, "Cron 表达式不能为空");
        }
        String[] parts = cron.trim().split("\\s+");
        if (parts.length < 5 || parts.length > 7) {
            throw new BusinessException(ErrorCode.DINGSHI_CRON_INVALID,
                    "Cron 表达式格式错误，应为 5-6 段（秒 分 时 日 月 周）");
        }
    }

}
