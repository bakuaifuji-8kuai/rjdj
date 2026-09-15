/* [软著核心代码] LianLuService.java - 链路模块业务接口 */
package com.zgsq.illumination.lianlu.service;

import com.zgsq.illumination.common.PageResult;
import com.zgsq.illumination.lianlu.dto.LianLuDTO;
import com.zgsq.illumination.lianlu.vo.LianLuVO;

import java.util.List;

/**
 * 链路模块业务接口
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
public interface LianLuService {

    /** 新增链路（含编号自动生成） */
    Long addLianLu(LianLuDTO.LianLuAddDTO dto);

    /** 修改链路 */
    void updateLianLu(LianLuDTO.LianLuUpdateDTO dto);

    /** 删除链路（含配光关联校验） */
    void deleteLianLu(Long lianLuId);

    /** 分页查询 */
    PageResult<LianLuVO> pageLianLu(LianLuDTO.LianLuQueryDTO query);

    /** 按管廊 ID 查询所有链路 */
    List<LianLuVO> listByGuanLang(Long guanLangId);

    /** 按链路 ID 数量统计（供 GuanLangServiceImpl 关联校验用） */
    int countByGuanLangId(Long guanLangId);
}
