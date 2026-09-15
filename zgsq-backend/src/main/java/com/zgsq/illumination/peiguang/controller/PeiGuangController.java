/* [软著核心代码] PeiGuangController.java - 配光组管理 REST 控制器 */
package com.zgsq.illumination.peiguang.controller;

import com.zgsq.illumination.common.PageResult;
import com.zgsq.illumination.common.Result;
import com.zgsq.illumination.peiguang.dto.PeiGuangDTO;
import com.zgsq.illumination.peiguang.service.PeiGuangService;
import com.zgsq.illumination.peiguang.vo.PeiGuangVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 配光组管理 REST 控制器（照明灯具的分组控制）
 * 暴露路径：{@code /api/peiguang/**}
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
@RestController
@RequestMapping("/api/peiguang")
public class PeiGuangController {

    @Autowired
    private PeiGuangService peiGuangService;

    /** 新增配光组 */
    @PostMapping("/add")
    public Result<Long> add(@RequestBody PeiGuangDTO.PeiGuangAddDTO dto) {
        return Result.ok(peiGuangService.addPeiGuang(dto));
    }

    /** 修改配光组 */
    @PutMapping("/update")
    public Result<Void> update(@RequestBody PeiGuangDTO.PeiGuangUpdateDTO dto) {
        peiGuangService.updatePeiGuang(dto);
        return Result.ok();
    }

    /** 删除配光组 */
    @DeleteMapping("/delete")
    public Result<Void> delete(@RequestParam Long peiGuangId) {
        peiGuangService.deletePeiGuang(peiGuangId);
        return Result.ok();
    }

    /** 分页查询 */
    @GetMapping("/page")
    public Result<PageResult<PeiGuangVO>> page(PeiGuangDTO.PeiGuangQueryDTO query) {
        return Result.ok(peiGuangService.pagePeiGuang(query));
    }

    /** 按链路 ID 查询配光组列表 */
    @GetMapping("/listByLianLu")
    public Result<List<PeiGuangVO>> listByLianLu(@RequestParam Long lianLuId) {
        return Result.ok(peiGuangService.listByLianLu(lianLuId));
    }
}
