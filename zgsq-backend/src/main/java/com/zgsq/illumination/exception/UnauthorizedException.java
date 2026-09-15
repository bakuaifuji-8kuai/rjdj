/* [软著核心代码] UnauthorizedException.java - 智光云枢未授权异常 */
package com.zgsq.illumination.exception;

import com.zgsq.illumination.common.ErrorCode;

/**
 * 未授权异常 {@code UnauthorizedException}
 * <p>
 * 专门用于"登录态异常"：
 * <ul>
 *   <li>Token 缺失 —— {@code LoginInterceptor} 拦截器抛出</li>
 *   <li>Token 已过期 / 格式错误 —— JWT 解析失败时抛出</li>
 * </ul>
 * 与 {@link BusinessException} 平级，但由 {@link GlobalExceptionHandler} 返回 HTTP 401。
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
public class UnauthorizedException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    /** 默认错误码：401 */
    private static final int DEFAULT_CODE = 401;

    /** 业务错误码 */
    private final int code;

    /**
     * 默认构造（使用通用"未授权"提示）
     */
    public UnauthorizedException() {
        super(ErrorCode.TOKEN_MISSING.getMessage());
        this.code = DEFAULT_CODE;
    }

    /**
     * 自定义提示
     *
     * @param message 错误描述
     */
    public UnauthorizedException(String message) {
        super(message);
        this.code = DEFAULT_CODE;
    }

    /**
     * 基于 ErrorCode 枚举构造
     *
     * @param errorCode 错误码枚举（通常是 TOKEN_MISSING / TOKEN_INVALID）
     */
    public UnauthorizedException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.code = DEFAULT_CODE;
    }

}
