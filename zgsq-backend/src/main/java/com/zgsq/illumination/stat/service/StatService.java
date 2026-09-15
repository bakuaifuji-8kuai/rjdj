/* [软著核心代码] StatService.java - 数据统计业务接口 */
package com.zgsq.illumination.stat.service;

import com.zgsq.illumination.stat.vo.StatVO;

/**
 * 数据统计业务接口
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
public interface StatService {

    /** Dashboard 总览 */
    StatVO.DashboardVO dashboard();

    /** 管廊分组统计（按行政区 + 状态） */
    StatVO.GuanLangStatVO guanLangGroup();
}
