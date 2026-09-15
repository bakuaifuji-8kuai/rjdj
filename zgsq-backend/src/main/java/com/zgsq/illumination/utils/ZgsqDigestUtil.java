/* [软著核心代码] ZgsqDigestUtil.java - 智光云枢摘要加密工具 */
package com.zgsq.illumination.utils;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

/**
 * 智光云枢专属摘要加密工具
 * <p>
 * 业务注释：
 * <ul>
 *   <li>用于用户密码加密（MD5 + 固定盐值，兼容数据库历史数据）</li>
 *   <li>用于管廊编号 + 时间戳 的快速指纹，避免重复提交</li>
 * </ul>
 * 注意：仅内部使用，不对外暴露加密算法细节。
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
public class ZgsqDigestUtil {

    /** MD5 算法名 */
    private static final String ALGO_MD5 = "MD5";
    /** 业务盐值（实际生产建议改为配置项） */
    private static final String SALT = "zgsq-illumination-2024";

    private ZgsqDigestUtil() {
        // 禁止实例化
    }

    /**
     * 对原始密码做 MD5 + 盐值加密
     * <p>
     * 流程：rawPassword + "::" + SALT → UTF-8 字节 → MD5 → 十六进制小写（32 位）
     *
     * @param rawPassword 原始明文密码
     * @return 32 位小写十六进制 MD5 摘要；rawPassword 为 null 时返回 ""
     */
    public static String md5WithSalt(String rawPassword) {
        if (rawPassword == null || rawPassword.isEmpty()) {
            return "";
        }
        // 固定拼接：原始密码 + "::" + 盐值
        String toDigest = rawPassword + "::" + SALT;
        return md5Hex(toDigest);
    }

    /**
     * 通用 MD5 十六进制输出（无盐）
     *
     * @param src 待摘要字符串
     * @return 32 位小写十六进制
     */
    public static String md5Hex(String src) {
        if (src == null) {
            return "";
        }
        try {
            MessageDigest md = MessageDigest.getInstance(ALGO_MD5);
            byte[] bytes = md.digest(src.getBytes(StandardCharsets.UTF_8));
            return toHex(bytes);
        } catch (Exception e) {
            // MessageDigest.getInstance 在标准 JRE 中不会抛（MD5 必需实现）
            throw new RuntimeException("MD5 算法不可用：" + e.getMessage(), e);
        }
    }

    /**
     * 校验密码：将输入明文重新做 md5WithSalt，对比数据库密文
     *
     * @param rawInput 用户输入明文
     * @param dbCipher 数据库存的密文
     * @return true=匹配
     */
    public static boolean verifyPassword(String rawInput, String dbCipher) {
        if (rawInput == null || dbCipher == null) {
            return false;
        }
        return md5WithSalt(rawInput).equalsIgnoreCase(dbCipher);
    }

    /**
     * 字节数组 → 十六进制小写字符串
     *
     * @param bytes 原始字节
     * @return 十六进制
     */
    private static String toHex(byte[] bytes) {
        char[] hexDigits = "0123456789abcdef".toCharArray();
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            int v = b & 0xFF;
            sb.append(hexDigits[v >>> 4]);
            sb.append(hexDigits[v & 0x0F]);
        }
        return sb.toString();
    }

}
