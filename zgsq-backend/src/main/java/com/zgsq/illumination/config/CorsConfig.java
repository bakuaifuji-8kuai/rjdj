/* [软著核心代码] CorsConfig.java - 智光云枢全局跨域配置 */
package com.zgsq.illumination.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

/**
 * 全局 CORS 跨域配置
 * <p>
 * 前后端分离场景中，前端（Vue / React）一般跑在 3000 / 5173 端口，
 * 后端跑在 8080 端口，浏览器同源策略会拦截跨域请求。
 * 本类注册一个 {@link CorsFilter} 统一放行：
 * <ul>
 *   <li>允许所有来源（*）—— 生产环境应改为具体域名白名单</li>
 *   <li>允许所有方法（GET / POST / PUT / DELETE / OPTIONS）</li>
 *   <li>允许所有请求头（含 X-Zgsq-Token 自定义头）</li>
 *   <li>允许携带凭证（cookie）</li>
 * </ul>
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
@Configuration
public class CorsConfig {

    /** 智光云枢自定义 Token 头 */
    public final String HEADER_ZGSQ_TOKEN = "X-Zgsq-Token";

    /**
     * 构建 CorsFilter 注册到 Spring 容器
     *
     * @return CorsFilter 实例
     */
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        // ========== 来源 ==========
        // 允许所有来源，生产环境建议改为具体域名（如 https://illumination.example.com）
        config.addAllowedOriginPattern("*");
        // ========== 请求方法 ==========
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        // ========== 请求头（含智光云枢自定义 Token） ==========
        config.setAllowedHeaders(Arrays.asList(
                "Origin", "Content-Type", "Accept", "Authorization",
                HEADER_ZGSQ_TOKEN, "X-Requested-With"
        ));
        // ========== 暴露给前端的响应头 ==========
        config.setExposedHeaders(Arrays.asList(
                "Content-Disposition", "Content-Length", HEADER_ZGSQ_TOKEN
        ));
        // ========== 允许携带 cookie ==========
        config.setAllowCredentials(true);
        // ========== 预检请求缓存时间（秒） ==========
        config.setMaxAge(3600L);

        // 对所有路径生效
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }

}
