/* [软著核心代码] StatServiceImpl.java - 数据统计业务实现 */
package com.zgsq.illumination.stat.service.impl;

import com.zgsq.illumination.stat.mapper.StatMapper;
import com.zgsq.illumination.stat.service.StatService;
import com.zgsq.illumination.stat.vo.StatVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * 数据统计业务实现
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
@Service
public class StatServiceImpl implements StatService {

    @Autowired
    private StatMapper statMapper;

    @Override
    public StatVO.DashboardVO dashboard() {
        StatVO.DashboardVO vo = new StatVO.DashboardVO();
        vo.setGuanLangCount(statMapper.countGuanLang());
        vo.setLianLuCount(statMapper.countLianLu());
        vo.setPeiGuangCount(statMapper.countPeiGuang());
        vo.setActiveDingshiCount(statMapper.countActiveDingshi());
        vo.setTodayAlarmCount(statMapper.countTodayAlarm());
        vo.setMaintainGuanLangCount(statMapper.countMaintainGuanLang());
        return vo;
    }

    @Override
    public StatVO.GuanLangStatVO guanLangGroup() {
        StatVO.GuanLangStatVO vo = new StatVO.GuanLangStatVO();
        vo.setDistrictList(statMapper.groupByDistrict());
        vo.setStatusList(statMapper.groupByStatus());
        return vo;
    }

}
