/* [软著核心代码] PeiGuangService.java - 配光模块业务接口 */
package com.zgsq.illumination.peiguang.service;

import com.zgsq.illumination.common.PageResult;
import com.zgsq.illumination.peiguang.dto.PeiGuangDTO;
import com.zgsq.illumination.peiguang.vo.PeiGuangVO;

import java.util.List;

/**
 * 配光模块业务接口
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
public interface PeiGuangService {

    Long addPeiGuang(PeiGuangDTO.PeiGuangAddDTO dto);

    void updatePeiGuang(PeiGuangDTO.PeiGuangUpdateDTO dto);

    void deletePeiGuang(Long peiGuangId);

    PageResult<PeiGuangVO> pagePeiGuang(PeiGuangDTO.PeiGuangQueryDTO query);

    List<PeiGuangVO> listByLianLu(Long lianLuId);
}
