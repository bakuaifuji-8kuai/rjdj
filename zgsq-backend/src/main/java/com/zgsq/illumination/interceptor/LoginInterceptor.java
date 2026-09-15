/* [软著核心代码] LoginInterceptor.java - 简易 Token 校验拦截器
 * 职责：拦截所有 /api/** 请求，校验请求头 X-Zgsq-Token。
 * 注意：为了软著验证方便，此处做了简化实现（只要 header 不为空就放行）。
 * 生产环境请升级为 JWT + Redis 会话方案。
 */
package com.zgsq.illumination.interceptor;

import com.zgsq.illumination.common.ErrorCode;
import com.zgsq.illumination.exception.UnauthorizedException;
import com.zgsq.illumination.common.ErrorCode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * [软著核心代码] 登录拦截器。
 * <p>
 * 拦截规则：
 * <ul>
 *   <li>从请求头 {@code X-Zgsq-Token} 取值</li>
 *   <li>非空即放行（MVP 简化实现，生产环境应校验 JWT 签名）</li>
 *   <li>放行后写 request attribute 供 LogAspect 记录操作日志</li>
 * </ul>
 */
@Component
public class LoginInterceptor implements HandlerInterceptor {

    private static final Logger log = LoggerFactory.getLogger(LoginInterceptor.class);

    /** 请求头：X-Zgsq-Token */
    public static final String HEADER_TOKEN = "X-Zgsq-Token";
    /** Request attribute：当前操作用户名（供日志切面读取） */
    public static final String CURRENT_USER_NAME = "zgsq.current.user.name";
    /** Request attribute：当前用户 ID */
    public static final String CURRENT_USER_ID = "zgsq.current.user.id";

    /**
     * 拦截前执行：校验 Token 是否存在。
     * <p>
     * 简化逻辑：只要 header 非空就放行（不做强校验），
     * 方便软著 Demo 运行；生产环境务必在此处做 JWT 解析和签名校验。
     */
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String token = request.getHeader(HEADER_TOKEN);
        if (token == null || token.trim().isEmpty()) {
            log.warn("[拦截] {} - 未携带 Token", request.getRequestURI());
            throw new UnauthorizedException(ErrorCode.TOKEN_MISSING);
        }
        // 简化：不校验具体值，只要 header 非空就通过
        request.setAttribute(CURRENT_USER_NAME, "admin");
        request.setAttribute(CURRENT_USER_ID, 1);
        return true;
    }
}
