/* [软著核心代码] UserMapper.java - 用户表持久层 */
package com.zgsq.illumination.user.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zgsq.illumination.user.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 用户表 Mapper 接口
 * <p>
 * 继承 MyBatis-Plus {@link BaseMapper}，天然获得单表 CRUD / 分页能力；
 * 业务自定义 SQL（联表查角色名、条件组合查询）写在 resources/mapper/UserMapper.xml 中。
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
@Mapper
public interface UserMapper extends BaseMapper<User> {

    /**
     * 根据登录账号查询用户（登录校验用）
     *
     * @param userName 登录账号
     * @return User 对象，不存在则 null
     */
    User selectByUserName(@Param("userName") String userName);

    /**
     * 条件分页查询（联表带出角色名）
     *
     * @param userName   登录账号（精确或模糊）
     * @param userStatus 状态筛选（null=不限）
     * @param userRealName 真实姓名（模糊）
     * @param offset     偏移量
     * @param pageSize   每页大小
     * @return 用户列表（含角色名）
     */
    List<User> selectPageWithRole(@Param("userName") String userName,
                                  @Param("userStatus") Integer userStatus,
                                  @Param("userRealName") String userRealName,
                                  @Param("offset") int offset,
                                  @Param("pageSize") int pageSize);

    /**
     * 统计条件下的用户数（配合 selectPageWithRole）
     *
     * @param userName     登录账号
     * @param userStatus   状态
     * @param userRealName 真实姓名
     * @return 总条数
     */
    long selectPageCount(@Param("userName") String userName,
                         @Param("userStatus") Integer userStatus,
                         @Param("userRealName") String userRealName);
}
