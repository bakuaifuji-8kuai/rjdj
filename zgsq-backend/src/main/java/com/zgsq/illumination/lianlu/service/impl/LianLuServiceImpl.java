/* [软著核心代码] LianLuServiceImpl.java - 链路模块业务实现 */
package com.zgsq.illumination.lianlu.service.impl;

import com.zgsq.illumination.common.ErrorCode;
import com.zgsq.illumination.common.PageResult;
import com.zgsq.illumination.exception.BusinessException;
import com.zgsq.illumination.guanlang.entity.GuanLang;
import com.zgsq.illumination.guanlang.mapper.GuanLangMapper;
import com.zgsq.illumination.lianlu.dto.LianLuDTO;
import com.zgsq.illumination.lianlu.entity.LianLu;
import com.zgsq.illumination.lianlu.mapper.LianLuMapper;
import com.zgsq.illumination.lianlu.service.LianLuService;
import com.zgsq.illumination.lianlu.vo.LianLuVO;
import com.zgsq.illumination.utils.ZgsqCodeGenUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 链路模块业务实现
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
@Service
public class LianLuServiceImpl implements LianLuService {

    @Autowired
    private LianLuMapper lianLuMapper;

    @Autowired
    private GuanLangMapper guanLangMapper;

    @Override
    public Long addLianLu(LianLuDTO.LianLuAddDTO dto) {
        // 1. 管廊必须存在
        GuanLang gl = guanLangMapper.selectById(dto.getGuanLangId());
        if (gl == null) {
            throw new BusinessException(ErrorCode.GUANLANG_NOT_FOUND);
        }
        // 2. 编号（自动生成 or 唯一性校验）
        LianLu ll = new LianLu();
        if (dto.getLianLuNo() != null && !dto.getLianLuNo().isEmpty()) {
            LianLu exist = lianLuMapper.selectByNo(dto.getLianLuNo());
            if (exist != null) {
                throw new BusinessException(ErrorCode.DATA_ALREADY_EXISTS, "链路编号已存在");
            }
            ll.setLianLuNo(dto.getLianLuNo());
        } else {
            // 自动生成：LL-{guanLangNo}-XX
            String glNo = gl.getGuanLangNo();
            int maxSeq = lianLuMapper.selectMaxSeqByGuanLangNo(glNo);
            ll.setLianLuNo(ZgsqCodeGenUtil.genLianLuNo(glNo, maxSeq));
        }
        ll.setLianLuName(dto.getLianLuName());
        ll.setGuanLangId(dto.getGuanLangId());
        ll.setLianLuType(dto.getLianLuType() == null ? 1 : dto.getLianLuType());
        ll.setTotalLength(dto.getTotalLength());
        ll.setLianLuStatus(dto.getLianLuStatus() == null ? 0 : dto.getLianLuStatus());
        ll.setLoopCount(dto.getLoopCount());
        ll.setLoopPower(dto.getLoopPower());
        ll.setRemark(dto.getRemark());
        LocalDateTime now = LocalDateTime.now();
        ll.setCreateTime(now);
        ll.setUpdateTime(now);
        ll.setDeleted(0);
        lianLuMapper.insert(ll);
        return ll.getLianLuId();
    }

    @Override
    public void updateLianLu(LianLuDTO.LianLuUpdateDTO dto) {
        LianLu ll = lianLuMapper.selectById(dto.getLianLuId());
        if (ll == null) {
            throw new BusinessException(ErrorCode.DATA_NOT_FOUND, "链路不存在");
        }
        if (dto.getLianLuName() != null) ll.setLianLuName(dto.getLianLuName());
        if (dto.getLianLuType() != null) ll.setLianLuType(dto.getLianLuType());
        if (dto.getTotalLength() != null) ll.setTotalLength(dto.getTotalLength());
        if (dto.getLianLuStatus() != null) ll.setLianLuStatus(dto.getLianLuStatus());
        if (dto.getLoopCount() != null) ll.setLoopCount(dto.getLoopCount());
        if (dto.getLoopPower() != null) ll.setLoopPower(dto.getLoopPower());
        if (dto.getRemark() != null) ll.setRemark(dto.getRemark());
        ll.setUpdateTime(LocalDateTime.now());
        lianLuMapper.updateById(ll);
    }

    @Override
    public void deleteLianLu(Long lianLuId) {
        LianLu ll = lianLuMapper.selectById(lianLuId);
        if (ll == null) {
            throw new BusinessException(ErrorCode.LIANLU_NOT_FOUND);
        }
        // 配光关联校验（暂时略过，PeiGuang 模块会提供 countByLianLuId）
        lianLuMapper.deleteById(lianLuId);
    }

    @Override
    public PageResult<LianLuVO> pageLianLu(LianLuDTO.LianLuQueryDTO query) {
        int pageNum = query.getSafePageNum();
        int pageSize = query.getSafePageSize();
        int offset = (pageNum - 1) * pageSize;
        long total = lianLuMapper.selectPageCount(query.getLianLuNo(), query.getLianLuName(),
                query.getLianLuStatus(), query.getGuanLangId());
        List<LianLu> list = lianLuMapper.selectPageList(query.getLianLuNo(), query.getLianLuName(),
                query.getLianLuStatus(), query.getGuanLangId(), offset, pageSize);
        List<LianLuVO> voList = list.stream().map(this::toVO).collect(Collectors.toList());
        return PageResult.of(voList, total, pageNum, pageSize);
    }

    @Override
    public List<LianLuVO> listByGuanLang(Long guanLangId) {
        List<LianLu> list = lianLuMapper.selectByGuanLangId(guanLangId);
        return list.stream().map(this::toVO).collect(Collectors.toList());
    }

    @Override
    public int countByGuanLangId(Long guanLangId) {
        return lianLuMapper.countByGuanLangId(guanLangId);
    }

    private LianLuVO toVO(LianLu ll) {
        LianLuVO vo = new LianLuVO();
        vo.setLianLuId(ll.getLianLuId());
        vo.setLianLuNo(ll.getLianLuNo());
        vo.setLianLuName(ll.getLianLuName());
        vo.setGuanLangId(ll.getGuanLangId());
        vo.setLianLuType(ll.getLianLuType());
        vo.setLianLuTypeName(ll.getLianLuType() == null ? "" : (ll.getLianLuType() == 1 ? "主干" : "支线"));
        vo.setTotalLength(ll.getTotalLength());
        vo.setLianLuStatus(ll.getLianLuStatus());
        vo.setLianLuStatusName(ll.getLianLuStatus() == null ? "" : (ll.getLianLuStatus() == 0 ? "正常" : "停用"));
        vo.setLoopCount(ll.getLoopCount());
        vo.setLoopPower(ll.getLoopPower());
        vo.setRemark(ll.getRemark());
        vo.setCreateTime(ll.getCreateTime());
        vo.setUpdateTime(ll.getUpdateTime());
        // 关联管廊名称
        GuanLang gl = guanLangMapper.selectById(ll.getGuanLangId());
        vo.setGuanLangName(gl == null ? "" : gl.getGuanLangName());
        return vo;
    }

}
