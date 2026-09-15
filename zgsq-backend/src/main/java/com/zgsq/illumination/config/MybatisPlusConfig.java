/* [软著核心代码] MybatisPlusConfig.java - 智光云枢 MyBatis-Plus 全局配置 */
package com.zgsq.illumination.config;

import com.baomidou.mybatisplus.annotation.DbType;
import com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.PaginationInnerInterceptor;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * MyBatis-Plus 配置类
 * <p>
 * 职责：
 * <ul>
 *   <li>注册 MybatisPlusInterceptor（3.5+ 新版插件入口）</li>
 *   <li>注入 PaginationInnerInterceptor，开启物理分页（MySQL）</li>
 *   <li>本类不写 @MapperScan，已由 {@link com.zgsq.illumination.ZhiGuangApplication} 统一扫描</li>
 * </ul>
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
@Configuration
public class MybatisPlusConfig {

    /**
     * MyBatis-Plus 插件链（3.5.x 新版写法）
     * <p>
     * 旧版 PaginationInterceptor 已废弃，这里使用 {@link PaginationInnerInterceptor}。
     *
     * @return 插件拦截器实例
     */
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        // MySQL 5.7 / 8.0 都用 DbType.MYSQL
        PaginationInnerInterceptor paginationInterceptor = new PaginationInnerInterceptor(DbType.MYSQL);
        // 溢出处理：请求页码超过总页数时，自动回到第 1 页（false 时返回空）
        paginationInterceptor.setOverflow(true);
        // 单页最大条数：200（兜底防止扫全表）
        paginationInterceptor.setMaxLimit(200L);
        interceptor.addInnerInterceptor(paginationInterceptor);
        return interceptor;
    }

}
