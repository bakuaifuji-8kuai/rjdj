/* [软著核心代码] LogAspect.java - 智光云枢 AOP 操作日志切面 */
package com.zgsq.illumination.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zgsq.illumination.oplog.entity.OpLog;
import com.zgsq.illumination.interceptor.LoginInterceptor;
import com.zgsq.illumination.oplog.mapper.OpLogMapper;
import com.zgsq.illumination.utils.ZgsqDateUtil;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.beans.factory.annotation.Autowired;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.Arrays;

/**
 * AOP 操作日志切面 {@code LogAspect}
 * <p>
 * 职责：拦截所有 Controller 方法，自动记录一条 {@link OpLog} 持久化。
 * 记录内容：
 * <ul>
 *   <li>操作人 / IP（从 {@link LoginInterceptor#CURRENT_USER_NAME} 与 request 取）</li>
 *   <li>模块 + 动作（从 Controller / 方法名推断）</li>
 *   <li>请求入参（JSON 格式）</li>
 *   <li>响应出参（JSON 格式，失败时记录异常消息）</li>
 *   <li>耗时（毫秒）</li>
 * </ul>
 * 只记录 /api 下的 Controller，排除内部 / 健康检查接口。
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
@Aspect
@Component
public class LogAspect {

    /** JSON 序列化工具（使用 Spring Boot 内置 Jackson） */
    private final ObjectMapper objectMapper = new ObjectMapper();
    /** 日志输出（原 @Slf4j，因 Lombok 与 JDK 25 不兼容，改为手写） */
    private static final Logger log = LoggerFactory.getLogger(LogAspect.class);

    /** 操作日志 Mapper */
    @Autowired
    private OpLogMapper opLogMapper;

    /**
     * 切面表达式：所有 Controller 类中的 public 方法
     * <p>
     * {@code execution(* com.zgsq.illumination..*Controller.*(..))}
     * 代表：返回值任意 / 包下所有 / 类名以 Controller 结尾 / 所有方法 / 所有参数。
     *
     * @param pjp 可环绕通知 JoinPoint
     * @return 被拦截方法的原返回值
     * @throws Throwable 被代理方法抛出的异常会原样上抛（此处只记录不吞掉）
     */
    @Around("execution(* com.zgsq.illumination..*Controller.*(..))")
    public Object aroundController(ProceedingJoinPoint pjp) throws Throwable {
        long startMs = System.currentTimeMillis();
        MethodSignature signature = (MethodSignature) pjp.getSignature();
        String className = pjp.getTarget().getClass().getSimpleName();
        String methodName = signature.getName();

        // ========== 推断模块名 / 动作 ==========
        String opModule = inferModule(className);
        String opAction = inferAction(methodName);

        // ========== 获取请求上下文 ==========
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        HttpServletRequest request = attrs == null ? null : attrs.getRequest();
        String opIp = request == null ? "-" : resolveClientIp(request);
        String opUserName = request == null ? "-" : (String) request.getAttribute(LoginInterceptor.CURRENT_USER_NAME);
        if (opUserName == null || opUserName.isEmpty()) {
            opUserName = "-";
        }

        // ========== 序列化入参 ==========
        String opContent = serializeArgs(pjp.getArgs());

        // ========== 调用目标方法 ==========
        Object result = null;
        Throwable ex = null;
        try {
            result = pjp.proceed();
        } catch (Throwable t) {
            ex = t;
        }
        long costMs = System.currentTimeMillis() - startMs;

        // ========== 记录 DB（异步写入，不阻塞主流程） ==========
        final OpLog opLog = new OpLog();
        opLog.setOpModule(opModule);
        opLog.setOpAction(opAction);
        opLog.setOpUserName(opUserName);
        opLog.setOpIp(opIp);
        opLog.setOpContent(opContent);
        opLog.setOpTime(LocalDateTime.now());
        opLog.setCostMs(costMs);
        // 异常时记录简短错误信息
        opLog.setOpResult(ex == null ? "SUCCESS" : "FAIL:" + shortMessage(ex));

        // 异步写日志（避免主接口被日志拖慢）
        new Thread(() -> {
            try {
            try {
                opLogMapper.insert(opLog);
            } catch (Exception ex2) {
                // H2 内存库可能无 op_log 表，忽略写入失败
            }
            } catch (Exception e) {
                // 日志写入失败不能影响业务，仅打 warn
                log.warn("[OpLog] 写入失败：{}", e.getMessage());
            }
        }, "oplog-writer-" + ZgsqDateUtil.compactNow()).start();

        // 异常重新抛出
        if (ex != null) {
            throw ex;
        }
        return result;
    }

    // ========== 推断逻辑 ==========

    /**
     * 从 Controller 类名推断模块名
     * <p>
     * 例如 {@code GuanLangController → 管廊}、{@code PeiGuangController → 配光}。
     * 采用硬编码映射表，便于维护。
     *
     * @param className 类名
     * @return 模块中文名
     */
    private String inferModule(String className) {
        if (className.startsWith("User")) return "用户管理";
        if (className.startsWith("Role")) return "角色管理";
        if (className.startsWith("GuanLang")) return "管廊管理";
        if (className.startsWith("LianLu")) return "链路管理";
        if (className.startsWith("PeiGuang")) return "配光管理";
        if (className.startsWith("DingShi")) return "定时调度";
        if (className.startsWith("Stat")) return "数据统计";
        if (className.startsWith("OpLog")) return "操作日志";
        return className;
    }

    /**
     * 从方法名推断动作
     * <p>
     * 例如 {@code add → 新增}、{@code update → 修改}、{@code delete → 删除}、
     * {@code login → 登录}、{@code page → 分页查询}。
     *
     * @param methodName 方法名
     * @return 动作中文名
     */
    private String inferAction(String methodName) {
        if (methodName.contains("login")) return "登录";
        if (methodName.contains("add")) return "新增";
        if (methodName.contains("UpdateStatus")) return "状态变更";
        if (methodName.startsWith("update")) return "修改";
        if (methodName.contains("batchDelete")) return "批量删除";
        if (methodName.startsWith("delete")) return "删除";
        if (methodName.startsWith("page")) return "分页查询";
        if (methodName.startsWith("list")) return "列表查询";
        if (methodName.startsWith("detail")) return "详情查询";
        if (methodName.startsWith("toggle")) return "启停切换";
        return methodName;
    }

    // ========== 工具方法 ==========

    /**
     * 请求参数序列化（兜底：toString）
     *
     * @param args 方法参数
     * @return JSON 字符串
     */
    private String serializeArgs(Object[] args) {
        if (args == null || args.length == 0) {
            return "";
        }
        try {
            return objectMapper.writeValueAsString(args);
        } catch (Exception e) {
            // Jackson 序列化失败（如含不可序列化对象），退化为 Arrays.toString
            return Arrays.deepToString(args);
        }
    }

    /**
     * 获取真实客户端 IP（支持 Nginx / 反向代理场景）
     *
     * @param request HttpServletRequest
     * @return IP 字符串
     */
    private String resolveClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        // 多代理时 X-Forwarded-For 返回逗号分隔，取第一个
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip == null ? "-" : ip;
    }

    /**
     * 异常消息截断（避免太长的堆栈把 DB 字段撑爆）
     *
     * @param t 异常
     * @return 前 200 个字符
     */
    private String shortMessage(Throwable t) {
        String msg = t.getMessage();
        if (msg == null) {
            return t.getClass().getSimpleName();
        }
        return msg.length() > 200 ? msg.substring(0, 200) + "..." : msg;
    }

}
