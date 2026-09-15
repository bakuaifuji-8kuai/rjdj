/* [软著核心代码] DingShiService.java - 定时调度模块业务接口 */
package com.zgsq.illumination.dingshi.service;

import com.zgsq.illumination.common.PageResult;
import com.zgsq.illumination.dingshi.dto.DingShiDTO;
import com.zgsq.illumination.dingshi.vo.DingShiVO;

/**
 * 定时调度模块业务接口
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
public interface DingShiService {

    Long addDingShi(DingShiDTO.DingShiAddDTO dto);

    void updateDingShi(DingShiDTO.DingShiUpdateDTO dto);

    void deleteDingShi(Long dingShiId);

    /** 启停切换（0 ↔ 1） */
    void toggleDingShi(Long dingShiId);

    PageResult<DingShiVO> pageDingShi(DingShiDTO.DingShiQueryDTO query);
}
