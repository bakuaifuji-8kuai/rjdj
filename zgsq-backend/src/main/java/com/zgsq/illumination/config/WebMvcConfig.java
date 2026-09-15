/* [软著核心代码] WebMvcConfig.java - 智光云枢 WebMvc 扩展配置 */
package com.zgsq.illumination.config;

import com.zgsq.illumination.interceptor.LoginInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Spring MVC 扩展配置
 * <p>
 * 主要职责：
 * <ul>
 *   <li>注册 {@link LoginInterceptor} 到拦截器链</li>
 *   <li>配置拦截路径（/**）与放行路径（/api/user/login、/error 等）</li>
 *   <li>后续如需加静态资源映射 / 视图控制器，都写在本类</li>
 * </ul>
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    /** 登录拦截器（由 Spring 容器注入） */
    @Autowired
    private LoginInterceptor loginInterceptor;

    /**
     * 注册登录拦截器
     * <p>
     * 白名单路径说明：
     * <ul>
     *   <li>{@code /api/user/login}     —— 登录接口（拿 token 之前自然不会带 token）</li>
     *   <li>{@code /api/user/register}  —— 预留注册</li>
     *   <li>{@code /error}              —— Spring Boot 默认错误页</li>
     *   <li>{@code /druid/**}           —— Druid 监控页面（Druid 自己有独立鉴权）</li>
     *   <li>{@code /actuator/**}        —— Spring Boot Actuator（健康检查等）</li>
     * </ul>
     *
     * @param registry 拦截器注册表
     */
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(loginInterceptor)
                // 拦截所有路径
                .addPathPatterns("/**")
                // 放行白名单
                .excludePathPatterns(
                        "/api/user/login",
                        "/api/user/register",
                        "/error",
                        "/druid/**",
                        "/actuator/**",
                        // 拦截器自己的预检请求也放行
                        "/*.html", "/*.css", "/*.js", "/favicon.ico"
                );
    }

}
