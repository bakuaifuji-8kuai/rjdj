/* [软著核心代码] StatController.java - 数据统计 REST 控制器 */
package com.zgsq.illumination.stat.controller;

import com.zgsq.illumination.common.Result;
import com.zgsq.illumination.stat.service.StatService;
import com.zgsq.illumination.stat.vo.StatVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 数据统计 REST 控制器
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
@RestController
@RequestMapping("/api/stat")
public class StatController {

    @Autowired
    private StatService statService;

    /** Dashboard 总览数据（首页大数字卡片） */
    @GetMapping("/dashboard")
    public Result<StatVO.DashboardVO> dashboard() {
        return Result.ok(statService.dashboard());
    }

    /** 管廊分组统计（按行政区 + 按状态） */
    @GetMapping("/guanLangGroup")
    public Result<StatVO.GuanLangStatVO> guanLangGroup() {
        return Result.ok(statService.guanLangGroup());
    }

}
