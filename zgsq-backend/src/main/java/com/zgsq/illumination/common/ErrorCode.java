/* [软著核心代码] ErrorCode.java - 智光云枢业务错误码枚举 */
package com.zgsq.illumination.common;

/**
 * 统一业务错误码枚举
 * <p>
 * 规则：
 * <ul>
 *   <li>10000 - 19999：通用错误</li>
 *   <li>20000 - 29999：用户 / 权限错误</li>
 *   <li>30000 - 39999：管廊（guanlang）模块错误</li>
 *   <li>40000 - 49999：链路（lianlu）模块错误</li>
 *   <li>50000 - 59999：配光（peiguang）模块错误</li>
 *   <li>60000 - 69999：定时调度（dingshi）模块错误</li>
 *   <li>70000 - 79999：其它业务模块错误</li>
 * </ul>
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
public enum ErrorCode {

    // ========== 通用错误 10xxx ==========
    SYSTEM_INTERNAL_ERROR(10001, "系统内部错误，请联系管理员"),
    PARAM_INVALID(10002, "参数校验失败：{0}"),
    DATA_NOT_FOUND(10003, "数据不存在"),
    DATA_ALREADY_EXISTS(10004, "数据已存在"),
    OPERATION_TOO_FREQUENT(10005, "操作过于频繁，请稍后再试"),

    // ========== 认证 / 权限错误 20xxx ==========
    TOKEN_MISSING(20001, "未携带 Token，请先登录"),
    TOKEN_INVALID(20002, "Token 无效或已过期"),
    LOGIN_USERNAME_OR_PASSWORD(20003, "用户名或密码错误"),
    LOGIN_USER_DISABLED(20004, "该账号已被禁用，请联系管理员"),
    PERMISSION_DENIED(20005, "无权限执行该操作"),

    // ========== 管廊模块 30xxx ==========
    GUANLANG_NOT_FOUND(30001, "管廊不存在"),
    GUANLANG_NO_DUPLICATE(30002, "管廊编号已存在，不允许重复"),
    GUANLANG_STATUS_ILLEGAL(30003, "管廊状态切换不合法：{0}"),
    GUANLANG_HAS_LIANLU(30004, "该管廊下存在链路，不允许删除"),

    // ========== 链路模块 40xxx ==========
    LIANLU_NOT_FOUND(40001, "链路不存在"),
    LIANLU_HAS_PEIGUANG(40002, "该链路上存在配光组，不允许删除"),

    // ========== 配光模块 50xxx ==========
    PEIGUANG_NOT_FOUND(50001, "配光组不存在"),

    // ========== 定时调度模块 60xxx ==========
    DINGSHI_NOT_FOUND(60001, "定时调度不存在"),
    DINGSHI_CRON_INVALID(60002, "Cron 表达式格式错误"),

    // ========== 其它 70xxx ==========
    EXCEL_IMPORT_FAIL(70001, "Excel 导入失败：{0}"),
    EXCEL_EXPORT_FAIL(70002, "Excel 导出失败：{0}"),
    GIS_COORD_INVALID(70003, "GIS 坐标格式错误，应为 [经度,纬度]");

    /** 业务错误码 */
    private final int code;
    /** 默认错误描述（可带占位符，最终由调用方 format） */
    private final String message;

    /**
     * 枚举构造器（枚举构造器默认 private）
     *
     * @param code    业务错误码
     * @param message 默认错误描述
     */
    ErrorCode(int code, String message) {
        this.code = code;
        this.message = message;
    }

    /**
     * 获取业务错误码
     *
     * @return 错误码数字
     */
    public int getCode() {
        return this.code;
    }

    /**
     * 获取默认错误描述
     *
     * @return 错误描述文本（可能含 {0} 占位符）
     */
    public String getMessage() {
        return this.message;
    }
}
