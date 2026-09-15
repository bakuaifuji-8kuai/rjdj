/* [软著核心代码] ZgsqDataInitializer.java - H2 内存数据库初始化器
 * 职责：应用启动完成后自动建表 + 插入测试数据（仅 H2 验证模式下执行）
 * 注意：生产环境使用 MySQL 5.7 时，请通过 sql/schema.sql + sql/data.sql 手动初始化数据库
 */
package com.zgsq.illumination.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.util.StreamUtils;

import javax.sql.DataSource;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;

/**
 * [软著核心代码] H2 内存数据库自动初始化组件。
 * 应用启动完成后，自动从 classpath:sql/h2-init.sql 读取 DDL/DML 语句，
 * 逐条执行完成建表和测试数据插入。
 * <p>
 * 设计意图：
 * 为了让软著源码验证时无需外部 MySQL 依赖即可完整跑通，我们让 SpringBoot
 * 内嵌的 H2 内存库在应用启动瞬间自动初始化。
 * 当检测到数据库类型不是 H2 时（例如 MySQL 5.7 生产环境），自动跳过。
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
@Component
public class ZgsqDataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(ZgsqDataInitializer.class);

    private final JdbcTemplate jdbcTemplate;
    private final DataSource dataSource;

    public ZgsqDataInitializer(JdbcTemplate jdbcTemplate, DataSource dataSource) {
        this.jdbcTemplate = jdbcTemplate;
        this.dataSource = dataSource;
    }

    @Override
    public void run(String... args) throws Exception {
        try (Connection conn = dataSource.getConnection()) {
            // 判断数据库类型（不是 H2 就跳过，交给 DBA 手动执行 sql/schema.sql）
            String productName = conn.getMetaData().getDatabaseProductName();
            log.info("检测到数据库类型: {}", productName);
            if (!productName.toLowerCase().contains("h2")) {
                log.info("非 H2 数据库，跳过自动初始化（请手动执行 sql/schema.sql + sql/data.sql）");
                return;
            }

            // 检查表是否已存在（防止重复初始化）
            DatabaseMetaData md = conn.getMetaData();
            try (ResultSet rs = md.getTables(null, null, "T_ZGSQ_USER", null)) {
                if (rs.next()) {
                    log.info("H2 数据库已初始化过，跳过建表。");
                    return;
                }
            }

            // 读取 H2 初始化 SQL 脚本
            ClassPathResource res = new ClassPathResource("sql/h2-init.sql");
            if (!res.exists()) {
                log.warn("未找到 sql/h2-init.sql，跳过初始化。");
                return;
            }

            log.info("开始初始化 H2 内存数据库...");
            try (InputStream is = res.getInputStream()) {
                String sql = StreamUtils.copyToString(is, StandardCharsets.UTF_8);
                // H2 驱动不支持一次执行多条分号分隔的 SQL，逐条执行
                String[] statements = sql.split(";");
                int success = 0;
                int skipped = 0;
                for (String raw : statements) {
                    String trimmed = raw.trim();
                    if (trimmed.isEmpty() || trimmed.startsWith("--")) { skipped++; continue; }
                    try {
                        jdbcTemplate.execute(trimmed);
                        success++;
                    } catch (Exception e) {
                        // 单条语句失败不中断整体流程，只记录 debug（方便排错）
                        log.debug("跳过 SQL: {}", e.getMessage());
                        skipped++;
                    }
                }
                log.info("H2 初始化完成：成功 {} 条，跳过 {} 条", success, skipped);
            }
        }

        // 验证初始化结果（查一下管廊数量，确保建表成功）
        try {
            Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM t_zgsq_guan_lang", Integer.class);
            Integer userCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM t_zgsq_user", Integer.class);
            log.info("✅ 初始化验证通过：管廊 {} 条，用户 {} 条", count, userCount);
        } catch (Exception e) {
            log.warn("验证管廊表时出错：{}", e.getMessage());
        }
    }
}
