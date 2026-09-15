/* [软著核心代码] ZgsqCodeGenUtil.java - 智光云枢业务编号生成器 */
package com.zgsq.illumination.utils;

import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * 智光云枢业务编号生成工具
 * <p>
 * 核心能力：
 * <ul>
 *   <li>{@link #genGuanLangNo(String, int)} —— 管廊编号，格式：{@code GL-{市名}-XXXX}，自动补零到 4 位</li>
 *   <li>{@link #genLianLuNo(String, int)}  —— 链路编号，格式：{@code LL-{管廊编号}-XX}</li>
 *   <li>{@link #genPeiGuangNo(String, int)}—— 配光编号，格式：{@code PG-{链路编号}-XX}</li>
 * </ul>
 * 编号生成遵循：
 * <ul>
 *   <li>前缀固定（GL / LL / PG）</li>
 *   <li>拼接时间序列（4 位 / 2 位 / 2 位，不足补零）</li>
 *   <li>进程内自增 AtomicInteger 保证同 JVM 内不重复</li>
 *   <li>极端场景（分布式部署）建议结合 Redis 序列，本实现为单机版</li>
 * </ul>
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
public class ZgsqCodeGenUtil {

    /** 管廊编号前缀 */
    public static final String PREFIX_GUANLANG = "GL";
    /** 链路编号前缀 */
    public static final String PREFIX_LIANLU = "LL";
    /** 配光编号前缀 */
    public static final String PREFIX_PEIGUANG = "PG";

    /** 管廊编号序号宽度：4 位 → GL-XX市-0001 */
    private static final int GUANLANG_SEQ_WIDTH = 4;
    /** 链路编号序号宽度：2 位 → LL-GL-XX市-0001-01 */
    private static final int LIANLU_SEQ_WIDTH = 2;
    /** 配光编号序号宽度：2 位 */
    private static final int PEIGUANG_SEQ_WIDTH = 2;

    /** 管廊序号计数器（进程内递增） */
    private static final AtomicInteger GL_SEQ = new AtomicInteger(0);
    /** 链路序号计数器 */
    private static final AtomicInteger LL_SEQ = new AtomicInteger(0);
    /** 配光序号计数器 */
    private static final AtomicInteger PG_SEQ = new AtomicInteger(0);

    private ZgsqCodeGenUtil() {
        // 禁止实例化
    }

    /**
     * 生成管廊编号：GL-{city}-XXXX
     *
     * @param cityName   城市名称（如 "XX市"），会自动去除空格
     * @param dbMaxSeqNo 数据库中当前最大管廊序号（用于跨进程兜底），小于 0 时忽略
     * @return 完整管廊编号
     */
    public static String genGuanLangNo(String cityName, int dbMaxSeqNo) {
        // 城市名清洗：去空格 + "市" 字保留，去掉前后多余字符
        String city = (cityName == null ? "默认市" : cityName.trim().replaceAll("\\s+", ""));
        if (city.isEmpty()) {
            city = "默认市";
        }
        // 取进程内序号与 DB 最大序号中的较大者 + 1
        int seq = Math.max(GL_SEQ.incrementAndGet(), dbMaxSeqNo + 1);
        String paddedSeq = padLeft(String.valueOf(seq), GUANLANG_SEQ_WIDTH, '0');
        return PREFIX_GUANLANG + "-" + city + "-" + paddedSeq;
    }

    /**
     * 生成链路编号：LL-{guanLangNo}-XX
     *
     * @param guanLangNo 所属管廊编号
     * @param dbMaxSeqNo DB 中该管廊下已存在的最大链路序号
     * @return 链路编号
     */
    public static String genLianLuNo(String guanLangNo, int dbMaxSeqNo) {
        String glNo = (guanLangNo == null || guanLangNo.isEmpty()) ? "GL-默认-0001" : guanLangNo;
        int seq = Math.max(LL_SEQ.incrementAndGet(), dbMaxSeqNo + 1);
        return PREFIX_LIANLU + "-" + glNo + "-" + padLeft(String.valueOf(seq), LIANLU_SEQ_WIDTH, '0');
    }

    /**
     * 生成配光编号：PG-{lianLuNo}-XX
     *
     * @param lianLuNo 所属链路编号
     * @param dbMaxSeqNo DB 中该链路下已存在的最大配光序号
     * @return 配光编号
     */
    public static String genPeiGuangNo(String lianLuNo, int dbMaxSeqNo) {
        String llNo = (lianLuNo == null || lianLuNo.isEmpty()) ? "LL-默认-01" : lianLuNo;
        int seq = Math.max(PG_SEQ.incrementAndGet(), dbMaxSeqNo + 1);
        return PREFIX_PEIGUANG + "-" + llNo + "-" + padLeft(String.valueOf(seq), PEIGUANG_SEQ_WIDTH, '0');
    }

    /**
     * 兜底：当编号已存在时（极端并发），生成一个带短 UUID 后缀的临时编号
     * <p>
     * 不推荐作为常规方案，仅用于并发冲突时保证不重复入库。
     *
     * @param baseNo 基础编号（如 GL-XX市-0001）
     * @return 基础编号 + "-" + 8 位短 UUID
     */
    public static String genFallbackNo(String baseNo) {
        String uuid = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        return baseNo + "-" + uuid;
    }

    /**
     * 左补位（SQL LPAD 对应的 Java 实现）
     *
     * @param src    原始字符串
     * @param width  目标长度
     * @param padChar 补位字符
     * @return 补位后的字符串，若 src 长度已达 width 则原样返回
     */
    public static String padLeft(String src, int width, char padChar) {
        if (src == null || width <= src.length()) {
            return src;
        }
        StringBuilder sb = new StringBuilder(width);
        for (int i = 0; i < width - src.length(); i++) {
            sb.append(padChar);
        }
        sb.append(src);
        return sb.toString();
    }

}
