/* [软著核心代码] BusinessException.java - 智光云枢业务异常 */
package com.zgsq.illumination.exception;

import com.zgsq.illumination.common.ErrorCode;

/**
 * 业务异常 {@code BusinessException}
 * <p>
 * 所有"业务逻辑不满足"的场景都应抛出本异常，由 {@link GlobalExceptionHandler} 统一捕获
 * 并转为 {@link com.zgsq.illumination.common.Result} 响应。
 * <p>
 * 使用示例：
 * <pre>{@code
 * if (guanLang == null) {
 *     throw new BusinessException(ErrorCode.GUANLANG_NOT_FOUND);
 * }
 * if ("停用".equals(guanLang.getStatus()) && "维护中".equals(targetStatus)) {
 *     throw new BusinessException(ErrorCode.GUANLANG_STATUS_ILLEGAL,
 *         "停用状态不允许直接切换到维护中，需先恢复正常");
 * }
 * }</pre>
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
public class BusinessException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    /** 关联的错误码枚举 */
    private final ErrorCode errorCode;

    /** 业务错误码（冗余，便于直接读取） */
    private final int code;

    /**
     * 基于 ErrorCode 枚举构造
     *
     * @param errorCode 错误码枚举
     */
    public BusinessException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
        this.code = errorCode.getCode();
    }

    /**
     * 基于 ErrorCode + 自定义详细描述（覆盖枚举 message）
     *
     * @param errorCode 错误码枚举
     * @param message   自定义详细错误描述
     */
    public BusinessException(ErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
        this.code = errorCode.getCode();
    }

    /**
     * 自定义 code + message（不依赖 ErrorCode）
     *
     * @param code    业务状态码
     * @param message 错误描述
     */
    public BusinessException(int code, String message) {
        super(message);
        this.code = code;
        this.errorCode = null;
    }


    // ========== 手动生成: getter ==========
    public int getCode() { return this.code; }
    public ErrorCode getErrorCode() { return this.errorCode; }
}
