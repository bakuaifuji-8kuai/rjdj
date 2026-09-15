/* [软著核心代码] GuanLangController.java - 管廊管理 REST 控制器 */
package com.zgsq.illumination.guanlang.controller;

import com.zgsq.illumination.common.PageResult;
import com.zgsq.illumination.common.Result;
import com.zgsq.illumination.guanlang.dto.GuanLangDTO;
import com.zgsq.illumination.guanlang.service.GuanLangService;
import com.zgsq.illumination.guanlang.vo.GuanLangVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 管廊管理 REST 控制器 —— 智光云枢核心模块入口
 * <p>
 * 暴露路径：{@code /api/guanlang/**}
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
@RestController
@RequestMapping("/api/guanlang")
public class GuanLangController {

    @Autowired
    private GuanLangService guanLangService;

    /** 新增管廊（编号自动生成） */
    @PostMapping("/add")
    public Result<Long> add(@Validated @RequestBody GuanLangDTO.GuanLangAddDTO dto) {
        return Result.ok(guanLangService.addGuanLang(dto));
    }

    /** 修改管廊 */
    @PutMapping("/update")
    public Result<Void> update(@RequestBody GuanLangDTO.GuanLangUpdateDTO dto) {
        guanLangService.updateGuanLang(dto);
        return Result.ok();
    }

    /** 删除单个管廊 */
    @DeleteMapping("/delete")
    public Result<Void> delete(@RequestParam Long guanLangId) {
        guanLangService.deleteGuanLang(guanLangId);
        return Result.ok();
    }

    /** 批量删除管廊 */
    @PostMapping("/batchDelete")
    public Result<Void> batchDelete(@RequestBody List<Long> ids) {
        guanLangService.batchDeleteGuanLang(ids);
        return Result.ok();
    }

    /** 状态切换（含合法性校验） */
    @PutMapping("/updateStatus")
    public Result<Void> updateStatus(@RequestBody GuanLangDTO.GuanLangStatusDTO dto) {
        guanLangService.updateStatus(dto);
        return Result.ok();
    }

    /** 分页查询 */
    @GetMapping("/page")
    public Result<PageResult<GuanLangVO>> page(GuanLangDTO.GuanLangQueryDTO query) {
        return Result.ok(guanLangService.pageGuanLang(query));
    }

    /** 详情查询 */
    @GetMapping("/detail/{id}")
    public Result<GuanLangVO> detail(@PathVariable("id") Long guanLangId) {
        return Result.ok(guanLangService.detail(guanLangId));
    }

}
