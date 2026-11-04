/* [软著核心代码] Result.java - 智光云枢统一 API 返回体 */
package com.zgsq.illumination.common;


import java.io.Serializable;

/**
 * 统一接口返回体 {@code Result<T>}
 * <p>
 * 所有 Controller 方法都应返回本对象，保证前后端对接一致。
 * 字段：
 * <ul>
 *   <li>{@code code}    - 业务状态码，200 表示成功，其它值为错误（详见 {@link ErrorCode}）</li>
 *   <li>{@code message} - 给前端展示的提示文本</li>
 *   <li>{@code data}    - 业务数据，可为任意 POJO / VO / List / PageResult</li>
 * </ul>
 *
 * @param <T> data 字段的泛型类型
 * @author 智光云枢研发部
 * @since 1.0.0
 */
public class Result<T> implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 成功响应码 */
    public static final int CODE_OK = 200;
    /** 失败响应码 */
    public static final int CODE_FAIL = 500;

    /** 业务状态码 */
    private int code;
    /** 提示信息 */
    private String message;
    /** 业务数据 */
    private T data;

    /**
     * 无参构造（Jackson 反序列化需要）
     */
    public Result() {
    }

    /**
     * 全参构造
     *
     * @param code    业务状态码
     * @param message 提示文本
     * @param data    返回数据
     */
    public Result(int code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
    }

    /**
     * 成功响应（无数据）
     *
     * @param <T> 期望的 data 类型
     * @return code=200，data=null
     */
    public static <T> Result ok() {
        return new Result<>(CODE_OK, "操作成功", null);
    }

    /**
     * 成功响应（带数据）
     *
     * @param data 返回数据
     * @param <T>  数据类型
     * @return code=200，data=data
     */
    public static <T> Result ok(T data) {
        return new Result<>(CODE_OK, "操作成功", data);
    }

    /**
     * 成功响应（自定义提示 + 数据）
     *
     * @param message 自定义提示
     * @param data    返回数据
     * @param <T>     数据类型
     * @return code=200
     */
    public static <T> Result ok(String message, T data) {
        return new Result<>(CODE_OK, message, data);
    }

    /**
     * 失败响应（默认 500）
     *
     * @param message 错误描述
     * @param <T>     数据类型
     * @return code=500
     */
    public static <T> Result fail(String message) {
        return new Result<>(CODE_FAIL, message, null);
    }

    /**
     * 失败响应（自定义 code）
     *
     * @param code    业务错误码
     * @param message 错误描述
     * @param <T>     数据类型
     * @return 自定义 code
     */
    public static <T> Result fail(int code, String message) {
        return new Result<>(code, message, null);
    }

    /**
     * 失败响应（基于 ErrorCode 枚举）
     *
     * @param errorCode 错误码枚举
     * @param <T>       数据类型
     * @return code + message 取自枚举
     */
    public static <T> Result fail(ErrorCode errorCode) {
        return new Result<>(errorCode.getCode(), errorCode.getMessage(), null);
    }


    // ========== getter / setter ==========
    public int getCode() { return this.code; }
    public void setCode(int code) { this.code = code; }
    public String getMessage() { return this.message; }
    public void setMessage(String message) { this.message = message; }
    public T getData() { return this.data; }
    public void setData(T data) { this.data = data; }
}
