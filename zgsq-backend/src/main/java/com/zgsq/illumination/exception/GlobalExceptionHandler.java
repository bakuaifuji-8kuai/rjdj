/* [软著核心代码] GlobalExceptionHandler.java - 智光云枢全局异常处理器 */
package com.zgsq.illumination.exception;

import com.zgsq.illumination.common.ErrorCode;
import com.zgsq.illumination.common.Result;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import javax.servlet.http.HttpServletRequest;
import java.util.stream.Collectors;

/**
 * 全局异常处理器 {@code GlobalExceptionHandler}
 * <p>
 * 使用 {@link RestControllerAdvice} 拦截所有 Controller 层抛出的异常，
 * 统一转换为 {@link Result} 响应体返回给前端，避免直接抛堆栈。
 * <p>
 * 处理优先级（从上到下，精确到宽泛）：
 * <ol>
 *   <li>{@link UnauthorizedException} —— 登录态异常，返回 HTTP 401</li>
 *   <li>{@link BusinessException}    —— 业务异常，返回业务 code + message</li>
 *   <li>参数校验异常                 —— 400 + 具体哪个字段错了</li>
 *   <li>其它未知异常                 —— 兜底 500，打 ERROR 日志</li>
 * </ol>
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
@RestControllerAdvice(basePackages = "com.zgsq.illumination")
public class GlobalExceptionHandler {
    /** 日志输出（原 @Slf4j，因 Lombok 与 JDK 25 不兼容，改为手写） */
    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * 处理未授权异常（HTTP 401）
     *
     * @param e       异常对象
     * @param request 当前请求（用于日志）
     * @return 401 状态码 + 标准 Result
     */
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<Result<Void>> handleUnauthorized(UnauthorizedException e,
                                                          HttpServletRequest request) {
        log.warn("[权限] {} - {}", request.getRequestURI(), e.getMessage());
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(Result.fail(e.getMessage()));
    }

    /**
     * 处理业务异常（422 + 业务 code）
     *
     * @param e 业务异常
     * @return 标准 Result
     */
    @ExceptionHandler(BusinessException.class)
    public Result<Void> handleBusiness(BusinessException e, HttpServletRequest request) {
        log.warn("[业务] {} - code={}, msg={}", request.getRequestURI(), e.getCode(), e.getMessage());
        return Result.fail(e.getCode(), e.getMessage());
    }

    /**
     * 处理 @Valid / @Validated 注解校验失败（JSON Body 场景）
     *
     * @param e 方法参数校验异常
     * @return 400
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result<Void> handleValid(MethodArgumentNotValidException e) {
        // 收集所有字段错误，拼接成可读字符串："userName:不能为空, userPhone:格式错误"
        String msg = e.getBindingResult().getFieldErrors().stream()
                .map(fe -> fe.getField() + ":" + fe.getDefaultMessage())
                .collect(Collectors.joining("; "));
        return Result.fail(ErrorCode.PARAM_INVALID.getCode(),
                ErrorCode.PARAM_INVALID.getMessage().replace("{0}", msg));
    }

    /**
     * 处理表单参数绑定异常（Query / FormData 场景）
     *
     * @param e BindException
     * @return 400
     */
    @ExceptionHandler(BindException.class)
    public Result<Void> handleBind(BindException e) {
        String msg = e.getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining("; "));
        return Result.fail(ErrorCode.PARAM_INVALID.getCode(), msg);
    }

    /**
     * 处理缺少必填参数
     *
     * @param e MissingServletRequestParameterException
     * @return 400
     */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public Result<Void> handleMissingParam(MissingServletRequestParameterException e) {
        return Result.fail(ErrorCode.PARAM_INVALID.getCode(),
                "缺少必填参数：" + e.getParameterName());
    }

    /**
     * 处理参数类型不匹配（例如要求 Integer 但传了 String）
     *
     * @param e MethodArgumentTypeMismatchException
     * @return 400
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public Result<Void> handleTypeMismatch(MethodArgumentTypeMismatchException e) {
        return Result.fail(ErrorCode.PARAM_INVALID.getCode(),
                "参数类型不匹配：" + e.getName());
    }

    /**
     * 兜底：所有未被上述分支捕获的异常
     * <p>
     * 仅打 ERROR 日志，向前端返回通用错误码，避免泄露堆栈。
     *
     * @param e       原始异常
     * @param request 当前请求
     * @return 500
     */
    @ExceptionHandler(Exception.class)
    public Result<Void> handleUnknown(Exception e, HttpServletRequest request) {
        log.error("[系统异常] uri={}, msg={}", request.getRequestURI(), e.getMessage(), e);
        return Result.fail(ErrorCode.SYSTEM_INTERNAL_ERROR);
    }

}
