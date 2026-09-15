/* [软著核心代码] LianLuController.java - 链路管理 REST 控制器 */
package com.zgsq.illumination.lianlu.controller;

import com.zgsq.illumination.common.PageResult;
import com.zgsq.illumination.common.Result;
import com.zgsq.illumination.lianlu.dto.LianLuDTO;
import com.zgsq.illumination.lianlu.service.LianLuService;
import com.zgsq.illumination.lianlu.vo.LianLuVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 链路管理 REST 控制器（管廊内的照明回路）
 * 暴露路径：{@code /api/lianlu/**}
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
@RestController
@RequestMapping("/api/lianlu")
public class LianLuController {

    @Autowired
    private LianLuService lianLuService;

    /** 新增链路 */
    @PostMapping("/add")
    public Result<Long> add(@RequestBody LianLuDTO.LianLuAddDTO dto) {
        return Result.ok(lianLuService.addLianLu(dto));
    }

    /** 修改链路 */
    @PutMapping("/update")
    public Result<Void> update(@RequestBody LianLuDTO.LianLuUpdateDTO dto) {
        lianLuService.updateLianLu(dto);
        return Result.ok();
    }

    /** 删除单个链路（含配光关联校验） */
    @DeleteMapping("/delete")
    public Result<Void> delete(@RequestParam Long lianLuId) {
        lianLuService.deleteLianLu(lianLuId);
        return Result.ok();
    }

    /** 分页查询 */
    @GetMapping("/page")
    public Result<PageResult<LianLuVO>> page(LianLuDTO.LianLuQueryDTO query) {
        return Result.ok(lianLuService.pageLianLu(query));
    }

    /** 按管廊 ID 查询所有链路 */
    @GetMapping("/listByGuanLang")
    public Result<List<LianLuVO>> listByGuanLang(@RequestParam Long guanLangId) {
        return Result.ok(lianLuService.listByGuanLang(guanLangId));
    }
}
