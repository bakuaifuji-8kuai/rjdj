/* [软著核心代码] DingShiController.java - 定时调度管理 REST 控制器 */
package com.zgsq.illumination.dingshi.controller;

import com.zgsq.illumination.common.PageResult;
import com.zgsq.illumination.common.Result;
import com.zgsq.illumination.dingshi.dto.DingShiDTO;
import com.zgsq.illumination.dingshi.service.DingShiService;
import com.zgsq.illumination.dingshi.vo.DingShiVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * 定时调度管理 REST 控制器（Cron 定时亮灯/关灯/降功率策略）
 * 暴露路径：{@code /api/dingshi/**}
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
@RestController
@RequestMapping("/api/dingshi")
public class DingShiController {

    @Autowired
    private DingShiService dingShiService;

    /** 新增定时调度 */
    @PostMapping("/add")
    public Result<Long> add(@RequestBody DingShiDTO.DingShiAddDTO dto) {
        return Result.ok(dingShiService.addDingShi(dto));
    }

    /** 修改定时调度 */
    @PutMapping("/update")
    public Result<Void> update(@RequestBody DingShiDTO.DingShiUpdateDTO dto) {
        dingShiService.updateDingShi(dto);
        return Result.ok();
    }

    /** 删除定时调度 */
    @DeleteMapping("/delete")
    public Result<Void> delete(@RequestParam Long dingShiId) {
        dingShiService.deleteDingShi(dingShiId);
        return Result.ok();
    }

    /** 启停切换 */
    @PutMapping("/toggle")
    public Result<Void> toggle(@RequestParam Long dingShiId) {
        dingShiService.toggleDingShi(dingShiId);
        return Result.ok();
    }

    /** 分页查询 */
    @GetMapping("/page")
    public Result<PageResult<DingShiVO>> page(DingShiDTO.DingShiQueryDTO query) {
        return Result.ok(dingShiService.pageDingShi(query));
    }
}
