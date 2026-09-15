/* [软著核心代码] GuanLangService.java - 管廊模块业务接口 */
package com.zgsq.illumination.guanlang.service;

import com.zgsq.illumination.common.PageResult;
import com.zgsq.illumination.guanlang.dto.GuanLangDTO;
import com.zgsq.illumination.guanlang.entity.GuanLang;
import com.zgsq.illumination.guanlang.vo.GuanLangVO;

import java.util.List;

/**
 * 管廊模块业务接口
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
public interface GuanLangService {

    /** 新增管廊（含编号自动生成 + 唯一性校验） */
    Long addGuanLang(GuanLangDTO.GuanLangAddDTO dto);

    /** 修改管廊 */
    void updateGuanLang(GuanLangDTO.GuanLangUpdateDTO dto);

    /** 删除单条管廊（含链路关联校验） */
    void deleteGuanLang(Long guanLangId);

    /** 批量删除管廊（含链路关联校验） */
    void batchDeleteGuanLang(List<Long> ids);

    /** 状态切换（含合法性校验） */
    void updateStatus(GuanLangDTO.GuanLangStatusDTO dto);

    /** 分页查询 */
    PageResult<GuanLangVO> pageGuanLang(GuanLangDTO.GuanLangQueryDTO query);

    /** 详情查询 */
    GuanLangVO detail(Long guanLangId);

    /** 按状态列表筛选（内部工具方法） */
    List<GuanLang> listByStatus(List<Integer> statusList);
}
