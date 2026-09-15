/* [软著核心代码] GuanLangServiceImpl.java - 管廊模块业务实现（核心） */
package com.zgsq.illumination.guanlang.service.impl;

import com.zgsq.illumination.common.ErrorCode;
import com.zgsq.illumination.common.PageResult;
import com.zgsq.illumination.exception.BusinessException;
import com.zgsq.illumination.guanlang.dto.GuanLangDTO;
import com.zgsq.illumination.guanlang.entity.GuanLang;
import com.zgsq.illumination.guanlang.mapper.GuanLangMapper;
import com.zgsq.illumination.guanlang.service.GuanLangService;
import com.zgsq.illumination.guanlang.vo.GuanLangVO;
import com.zgsq.illumination.lianlu.mapper.LianLuMapper;
import com.zgsq.illumination.utils.ZgsqCodeGenUtil;
import com.zgsq.illumination.utils.ZgsqDateUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 管廊模块业务实现
 * <p>
 * 核心业务规则：
 * <ol>
 *   <li><b>编号自动生成</b>：guanLangNo 为空时，用 {@link ZgsqCodeGenUtil#genGuanLangNo} 按城市名生成 GL-{city}-XXXX；不为空时校验唯一性</li>
 *   <li><b>剩余寿命</b>：新增/修改时根据 buildYear + designLife 自动计算 remainLifePercent / remainLifeYears</li>
 *   <li><b>巡检计划</b>：新增/修改时根据 lastCheckDate + patrolFrequency 自动计算 nextPatrolPlan</li>
 *   <li><b>状态切换合法性</b>：停用(2) 不允许直接切维护中(1)，必须先切正常(0)</li>
 *   <li><b>删除保护</b>：若管廊下存在链路（由 {@link com.zgsq.illumination.lianlu.mapper.LianLuMapper#countByGuanLangId} 校验），不允许物理删除</li>
 * </ol>
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
@Service
public class GuanLangServiceImpl implements GuanLangService {

    @Autowired
    private GuanLangMapper guanLangMapper;

    /** 注入 LianLuMapper：用于删除管廊前校验是否存在链路关联 */
    @Autowired
    private LianLuMapper lianLuMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long addGuanLang(GuanLangDTO.GuanLangAddDTO dto) {
        GuanLang gl = new GuanLang();
        // ========== 1. 管廊编号（自动生成 or 唯一性校验） ==========
        if (dto.getGuanLangNo() != null && !dto.getGuanLangNo().isEmpty()) {
            // 用户显式传入了编号：唯一性校验
            GuanLang exist = guanLangMapper.selectByNo(dto.getGuanLangNo());
            if (exist != null) {
                throw new BusinessException(ErrorCode.GUANLANG_NO_DUPLICATE);
            }
            gl.setGuanLangNo(dto.getGuanLangNo());
        } else {
            // 自动生成：先查 DB 中同城市下当前最大序号，+1
            String cityName = dto.getBelongCity() == null ? "默认市" : dto.getBelongCity();
            int maxSeq = guanLangMapper.selectMaxSeqByCity(cityName);
            gl.setGuanLangNo(ZgsqCodeGenUtil.genGuanLangNo(cityName, maxSeq));
        }

        // ========== 2. 基础字段 ==========
        gl.setGuanLangName(dto.getGuanLangName());
        gl.setTunnelLength(dto.getTunnelLength());
        gl.setGuanLangStatus(dto.getGuanLangStatus() == null ? 0 : dto.getGuanLangStatus());
        gl.setBelongDistrict(dto.getBelongDistrict());
        gl.setMaintainUnit(dto.getMaintainUnit());
        gl.setBuildYear(dto.getBuildYear());
        gl.setDesignLife(dto.getDesignLife());
        // 巡检频率默认 30 天
        int patrolFreq = dto.getPatrolFrequency() == null ? 30 : dto.getPatrolFrequency();
        gl.setPatrolFrequency(patrolFreq);
        gl.setGisCoord(dto.getGisCoord());
        gl.setMonitorPointId(dto.getMonitorPointId());
        gl.setRemark(dto.getRemark());

        // ========== 3. 自动计算：剩余寿命百分比 ==========
        if (dto.getBuildYear() != null && dto.getDesignLife() != null) {
            gl.setRemainLifePercent(ZgsqDateUtil.calcRemainLifePercent(dto.getBuildYear(), dto.getDesignLife()));
        } else {
            gl.setRemainLifePercent(100);
        }

        // ========== 4. 自动计算：下次巡检计划 ==========
        gl.setLastCheckDate(null); // 新增时未巡检
        gl.setLastPatrolResult(null);
        gl.setNextPatrolPlan(ZgsqDateUtil.calcNextPatrolDate(null, patrolFreq));

        LocalDateTime now = LocalDateTime.now();
        gl.setCreateTime(now);
        gl.setUpdateTime(now);
        gl.setDeleted(0);

        guanLangMapper.insert(gl);
        return gl.getGuanLangId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateGuanLang(GuanLangDTO.GuanLangUpdateDTO dto) {
        GuanLang gl = guanLangMapper.selectById(dto.getGuanLangId());
        if (gl == null) {
            throw new BusinessException(ErrorCode.GUANLANG_NOT_FOUND);
        }
        // 逐字段更新（null 表示用户不想改）
        if (dto.getGuanLangName() != null) {
            gl.setGuanLangName(dto.getGuanLangName());
        }
        if (dto.getTunnelLength() != null) {
            gl.setTunnelLength(dto.getTunnelLength());
        }
        if (dto.getBelongDistrict() != null) {
            gl.setBelongDistrict(dto.getBelongDistrict());
        }
        if (dto.getMaintainUnit() != null) {
            gl.setMaintainUnit(dto.getMaintainUnit());
        }
        if (dto.getBuildYear() != null) {
            gl.setBuildYear(dto.getBuildYear());
        }
        if (dto.getDesignLife() != null) {
            gl.setDesignLife(dto.getDesignLife());
        }
        if (dto.getLastCheckDate() != null) {
            gl.setLastCheckDate(dto.getLastCheckDate());
        }
        if (dto.getPatrolFrequency() != null) {
            gl.setPatrolFrequency(dto.getPatrolFrequency());
        }
        if (dto.getLastPatrolResult() != null) {
            gl.setLastPatrolResult(dto.getLastPatrolResult());
        }
        if (dto.getGisCoord() != null) {
            gl.setGisCoord(dto.getGisCoord());
        }
        if (dto.getMonitorPointId() != null) {
            gl.setMonitorPointId(dto.getMonitorPointId());
        }
        if (dto.getRemark() != null) {
            gl.setRemark(dto.getRemark());
        }

        // ========== 关键：重新计算剩余寿命 ==========
        if (gl.getBuildYear() != null && gl.getDesignLife() != null) {
            gl.setRemainLifePercent(ZgsqDateUtil.calcRemainLifePercent(gl.getBuildYear(), gl.getDesignLife()));
        }

        // ========== 关键：重新计算下次巡检 ==========
        int freq = gl.getPatrolFrequency() == null ? 30 : gl.getPatrolFrequency();
        LocalDate lastCheck = gl.getLastCheckDate();
        gl.setNextPatrolPlan(ZgsqDateUtil.calcNextPatrolDate(lastCheck, freq));

        gl.setUpdateTime(LocalDateTime.now());
        guanLangMapper.updateById(gl);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteGuanLang(Long guanLangId) {
        GuanLang gl = guanLangMapper.selectById(guanLangId);
        if (gl == null) {
            throw new BusinessException(ErrorCode.GUANLANG_NOT_FOUND);
        }
        // 关联校验：若存在链路，不允许删除（链路模块会提供 countByGuanLangId）
        // 这里通过联查方式简单实现：若有链路则拒绝
        // 注意：LianLuMapper 通过 ApplicationContext 注入防止循环依赖
        int linkCount = countLianLuByGuanLangId(guanLangId);
        if (linkCount > 0) {
            throw new BusinessException(ErrorCode.GUANLANG_HAS_LIANLU,
                    "管廊 " + gl.getGuanLangNo() + " 下存在 " + linkCount + " 条链路，不允许删除");
        }
        guanLangMapper.deleteById(guanLangId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void batchDeleteGuanLang(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return;
        }
        // 逐一校验（有任何一条管廊存在链路就中止）
        for (Long id : ids) {
            int linkCount = countLianLuByGuanLangId(id);
            if (linkCount > 0) {
                GuanLang gl = guanLangMapper.selectById(id);
                String no = gl == null ? String.valueOf(id) : gl.getGuanLangNo();
                throw new BusinessException(ErrorCode.GUANLANG_HAS_LIANLU,
                        "管廊 " + no + " 下存在链路，不允许删除");
            }
        }
        guanLangMapper.deleteBatchIds(ids);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateStatus(GuanLangDTO.GuanLangStatusDTO dto) {
        GuanLang gl = guanLangMapper.selectById(dto.getGuanLangId());
        if (gl == null) {
            throw new BusinessException(ErrorCode.GUANLANG_NOT_FOUND);
        }
        int from = gl.getGuanLangStatus() == null ? 0 : gl.getGuanLangStatus();
        int to = dto.getTargetStatus() == null ? 0 : dto.getTargetStatus();

        // ========== 状态机校验：停用 不能直接切维护中(1) ==========
        if (from == 2 && to == 1) {
            throw new BusinessException(ErrorCode.GUANLANG_STATUS_ILLEGAL,
                    "停用状态不允许直接切换到维护中，请先恢复正常状态再切换");
        }
        // ========== 状态机校验：维护中 不允许切到停用(2)，必须先恢复正常 ==========
        if (from == 1 && to == 2) {
            throw new BusinessException(ErrorCode.GUANLANG_STATUS_ILLEGAL,
                    "维护中状态不允许直接停用，请先恢复正常状态");
        }
        // ========== 其它约束：正在维护中的管廊不允许切"正常"除非有巡检记录（简单版）==========
        // 这里放宽，允许维护中→正常，表示维护完毕

        gl.setGuanLangStatus(to);
        gl.setUpdateTime(LocalDateTime.now());
        guanLangMapper.updateById(gl);
    }

    @Override
    public PageResult<GuanLangVO> pageGuanLang(GuanLangDTO.GuanLangQueryDTO query) {
        int pageNum = query.getSafePageNum();
        int pageSize = query.getSafePageSize();
        int offset = (pageNum - 1) * pageSize;
        long total = guanLangMapper.selectPageCount(query.getGuanLangNo(), query.getGuanLangName(),
                query.getGuanLangStatus(), query.getBelongDistrict());
        List<GuanLang> list = guanLangMapper.selectPageList(query.getGuanLangNo(), query.getGuanLangName(),
                query.getGuanLangStatus(), query.getBelongDistrict(), offset, pageSize);
        List<GuanLangVO> voList = list.stream().map(this::toVO).collect(Collectors.toList());
        return PageResult.of(voList, total, pageNum, pageSize);
    }

    @Override
    public GuanLangVO detail(Long guanLangId) {
        GuanLang gl = guanLangMapper.selectById(guanLangId);
        if (gl == null) {
            throw new BusinessException(ErrorCode.GUANLANG_NOT_FOUND);
        }
        return toVO(gl);
    }

    @Override
    public List<GuanLang> listByStatus(List<Integer> statusList) {
        if (statusList == null || statusList.isEmpty()) {
            return guanLangMapper.selectList(null);
        }
        return guanLangMapper.selectByStatusList(statusList);
    }

    // ========== 私有方法 ==========

    /**
     * GuanLang → GuanLangVO 转换（含状态文案 + 巡检超期计算）
     *
     * @param gl 管廊实体
     * @return VO
     */
    private GuanLangVO toVO(GuanLang gl) {
        GuanLangVO vo = new GuanLangVO();
        vo.setGuanLangId(gl.getGuanLangId());
        vo.setGuanLangNo(gl.getGuanLangNo());
        vo.setGuanLangName(gl.getGuanLangName());
        vo.setTunnelLength(gl.getTunnelLength());
        vo.setGuanLangStatus(gl.getGuanLangStatus());
        vo.setGuanLangStatusName(statusText(gl.getGuanLangStatus()));
        vo.setBelongDistrict(gl.getBelongDistrict());
        vo.setMaintainUnit(gl.getMaintainUnit());
        vo.setBuildYear(gl.getBuildYear());
        vo.setDesignLife(gl.getDesignLife());
        vo.setRemainLifePercent(gl.getRemainLifePercent());
        // 计算剩余年限（Double）
        if (gl.getBuildYear() != null && gl.getDesignLife() != null) {
            vo.setRemainLifeYears(ZgsqDateUtil.calcRemainLifeYears(gl.getBuildYear(), gl.getDesignLife()));
        } else {
            vo.setRemainLifeYears(0.0);
        }
        vo.setLastCheckDate(gl.getLastCheckDate());
        vo.setPatrolFrequency(gl.getPatrolFrequency());
        vo.setLastPatrolResult(gl.getLastPatrolResult());
        vo.setNextPatrolPlan(gl.getNextPatrolPlan());
        // 巡检超期判断
        vo.setPatrolExpired(ZgsqDateUtil.isPatrolExpired(gl.getLastCheckDate(),
                gl.getPatrolFrequency() == null ? 30 : gl.getPatrolFrequency()));
        vo.setGisCoord(gl.getGisCoord());
        vo.setMonitorPointId(gl.getMonitorPointId());
        vo.setRemark(gl.getRemark());
        vo.setCreateTime(gl.getCreateTime());
        vo.setUpdateTime(gl.getUpdateTime());
        return vo;
    }

    /** 状态码 → 中文描述 */
    private String statusText(Integer status) {
        if (status == null) return "";
        switch (status) {
            case 0: return "正常";
            case 1: return "维护中";
            case 2: return "停用";
            default: return "未知";
        }
    }

    /**
     * 查询某管廊下的链路数量（委托 LianLuMapper）
     *
     * @param guanLangId 管廊 ID
     * @return 链路数量
     */
    private int countLianLuByGuanLangId(Long guanLangId) {
        return lianLuMapper.countByGuanLangId(guanLangId);
    }

}
