/* [软著核心代码] PeiGuangServiceImpl.java - 配光模块业务实现 */
package com.zgsq.illumination.peiguang.service.impl;

import com.zgsq.illumination.common.ErrorCode;
import com.zgsq.illumination.common.PageResult;
import com.zgsq.illumination.exception.BusinessException;
import com.zgsq.illumination.guanlang.entity.GuanLang;
import com.zgsq.illumination.guanlang.mapper.GuanLangMapper;
import com.zgsq.illumination.lianlu.entity.LianLu;
import com.zgsq.illumination.lianlu.mapper.LianLuMapper;
import com.zgsq.illumination.peiguang.dto.PeiGuangDTO;
import com.zgsq.illumination.peiguang.entity.PeiGuang;
import com.zgsq.illumination.peiguang.mapper.PeiGuangMapper;
import com.zgsq.illumination.peiguang.service.PeiGuangService;
import com.zgsq.illumination.peiguang.vo.PeiGuangVO;
import com.zgsq.illumination.utils.ZgsqCodeGenUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 配光模块业务实现
 * <p>
 * 额外业务规则：自动计算总功率 totalPower = lampCount × singleLampPower
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
@Service
public class PeiGuangServiceImpl implements PeiGuangService {

    @Autowired
    private PeiGuangMapper peiGuangMapper;

    @Autowired
    private LianLuMapper lianLuMapper;

    @Autowired
    private GuanLangMapper guanLangMapper;

    @Override
    public Long addPeiGuang(PeiGuangDTO.PeiGuangAddDTO dto) {
        // 1. 链路必须存在
        LianLu ll = lianLuMapper.selectById(dto.getLianLuId());
        if (ll == null) {
            throw new BusinessException(ErrorCode.LIANLU_NOT_FOUND);
        }
        // 2. 编号自动生成 or 唯一性校验
        PeiGuang pg = new PeiGuang();
        if (dto.getPeiGuangNo() != null && !dto.getPeiGuangNo().isEmpty()) {
            PeiGuang exist = peiGuangMapper.selectByNo(dto.getPeiGuangNo());
            if (exist != null) {
                throw new BusinessException(ErrorCode.DATA_ALREADY_EXISTS, "配光编号已存在");
            }
            pg.setPeiGuangNo(dto.getPeiGuangNo());
        } else {
            String llNo = ll.getLianLuNo();
            int maxSeq = peiGuangMapper.selectMaxSeqByLianLuNo(llNo);
            pg.setPeiGuangNo(ZgsqCodeGenUtil.genPeiGuangNo(llNo, maxSeq));
        }
        pg.setPeiGuangName(dto.getPeiGuangName());
        pg.setLianLuId(dto.getLianLuId());
        // 冗余外键：直接从链路带出
        pg.setGuanLangId(ll.getGuanLangId());
        pg.setPeiGuangType(dto.getPeiGuangType() == null ? 1 : dto.getPeiGuangType());
        pg.setLampCount(dto.getLampCount());
        pg.setSingleLampPower(dto.getSingleLampPower());
        // ========== 自动计算总功率 ==========
        if (dto.getLampCount() != null && dto.getSingleLampPower() != null) {
            pg.setTotalPower(Math.round(dto.getLampCount() * dto.getSingleLampPower() * 100.0) / 100.0);
        } else {
            pg.setTotalPower(0.0);
        }
        pg.setBrightLevel(dto.getBrightLevel() == null ? 80 : dto.getBrightLevel());
        pg.setPeiGuangStatus(dto.getPeiGuangStatus() == null ? 0 : dto.getPeiGuangStatus());
        pg.setRemark(dto.getRemark());
        LocalDateTime now = LocalDateTime.now();
        pg.setCreateTime(now);
        pg.setUpdateTime(now);
        pg.setDeleted(0);
        peiGuangMapper.insert(pg);
        return pg.getPeiGuangId();
    }

    @Override
    public void updatePeiGuang(PeiGuangDTO.PeiGuangUpdateDTO dto) {
        PeiGuang pg = peiGuangMapper.selectById(dto.getPeiGuangId());
        if (pg == null) {
            throw new BusinessException(ErrorCode.PEIGUANG_NOT_FOUND);
        }
        boolean needRecalc = false;
        if (dto.getPeiGuangName() != null) pg.setPeiGuangName(dto.getPeiGuangName());
        if (dto.getPeiGuangType() != null) pg.setPeiGuangType(dto.getPeiGuangType());
        if (dto.getLampCount() != null) {
            pg.setLampCount(dto.getLampCount());
            needRecalc = true;
        }
        if (dto.getSingleLampPower() != null) {
            pg.setSingleLampPower(dto.getSingleLampPower());
            needRecalc = true;
        }
        if (dto.getBrightLevel() != null) pg.setBrightLevel(dto.getBrightLevel());
        if (dto.getPeiGuangStatus() != null) pg.setPeiGuangStatus(dto.getPeiGuangStatus());
        if (dto.getRemark() != null) pg.setRemark(dto.getRemark());
        // 修改了灯具数或单灯功率 → 重新计算总功率
        if (needRecalc && pg.getLampCount() != null && pg.getSingleLampPower() != null) {
            pg.setTotalPower(Math.round(pg.getLampCount() * pg.getSingleLampPower() * 100.0) / 100.0);
        }
        pg.setUpdateTime(LocalDateTime.now());
        peiGuangMapper.updateById(pg);
    }

    @Override
    public void deletePeiGuang(Long peiGuangId) {
        peiGuangMapper.deleteById(peiGuangId);
    }

    @Override
    public PageResult<PeiGuangVO> pagePeiGuang(PeiGuangDTO.PeiGuangQueryDTO query) {
        int pageNum = query.getSafePageNum();
        int pageSize = query.getSafePageSize();
        int offset = (pageNum - 1) * pageSize;
        long total = peiGuangMapper.selectPageCount(query.getPeiGuangNo(), query.getPeiGuangName(),
                query.getPeiGuangStatus(), query.getPeiGuangType(),
                query.getLianLuId(), query.getGuanLangId());
        List<PeiGuang> list = peiGuangMapper.selectPageList(query.getPeiGuangNo(), query.getPeiGuangName(),
                query.getPeiGuangStatus(), query.getPeiGuangType(),
                query.getLianLuId(), query.getGuanLangId(), offset, pageSize);
        List<PeiGuangVO> voList = list.stream().map(this::toVO).collect(Collectors.toList());
        return PageResult.of(voList, total, pageNum, pageSize);
    }

    @Override
    public List<PeiGuangVO> listByLianLu(Long lianLuId) {
        List<PeiGuang> list = peiGuangMapper.selectByLianLuId(lianLuId);
        return list.stream().map(this::toVO).collect(Collectors.toList());
    }

    private PeiGuangVO toVO(PeiGuang pg) {
        PeiGuangVO vo = new PeiGuangVO();
        vo.setPeiGuangId(pg.getPeiGuangId());
        vo.setPeiGuangNo(pg.getPeiGuangNo());
        vo.setPeiGuangName(pg.getPeiGuangName());
        vo.setLianLuId(pg.getLianLuId());
        vo.setGuanLangId(pg.getGuanLangId());
        vo.setPeiGuangType(pg.getPeiGuangType());
        vo.setPeiGuangTypeName(typeText(pg.getPeiGuangType()));
        vo.setLampCount(pg.getLampCount());
        vo.setSingleLampPower(pg.getSingleLampPower());
        vo.setTotalPower(pg.getTotalPower());
        vo.setBrightLevel(pg.getBrightLevel());
        vo.setPeiGuangStatus(pg.getPeiGuangStatus());
        vo.setPeiGuangStatusName(pg.getPeiGuangStatus() == null ? "" : (pg.getPeiGuangStatus() == 0 ? "正常" : "停用"));
        vo.setRemark(pg.getRemark());
        vo.setCreateTime(pg.getCreateTime());
        vo.setUpdateTime(pg.getUpdateTime());
        // 关联带出名称
        if (pg.getLianLuId() != null) {
            LianLu ll = lianLuMapper.selectById(pg.getLianLuId());
            vo.setLianLuName(ll == null ? "" : ll.getLianLuName());
        }
        if (pg.getGuanLangId() != null) {
            GuanLang gl = guanLangMapper.selectById(pg.getGuanLangId());
            vo.setGuanLangName(gl == null ? "" : gl.getGuanLangName());
        }
        return vo;
    }

    private String typeText(Integer t) {
        if (t == null) return "";
        switch (t) {
            case 1: return "对称";
            case 2: return "交错";
            case 3: return "单侧";
            default: return "未知";
        }
    }

}
