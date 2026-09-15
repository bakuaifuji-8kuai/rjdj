-- [软著核心代码] schema.sql - 智光云枢管廊照明管理系统 MySQL 5.7 建表脚本
-- =================================================================
-- 所有表、所有字段、所有索引均加中文 COMMENT。
-- 执行前请先创建数据库：CREATE DATABASE zgsq_illumination DEFAULT CHARSET utf8mb4;
-- =================================================================

-- 切换字符集
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 1. 角色表
-- ============================================================
DROP TABLE IF EXISTS `t_zgsq_role`;
CREATE TABLE `t_zgsq_role` (
    `role_id`      BIGINT        NOT NULL AUTO_INCREMENT COMMENT '角色主键 ID',
    `role_name`    VARCHAR(64)   NOT NULL                 COMMENT '角色中文名称，如 超级管理员',
    `role_code`    VARCHAR(64)   NOT NULL                 COMMENT '角色英文编码，唯一，如 ADMIN / OPERATOR',
    `role_desc`    VARCHAR(255)  DEFAULT NULL             COMMENT '角色描述',
    `role_status`  TINYINT       NOT NULL DEFAULT 0       COMMENT '角色状态：0 启用 / 1 禁用',
    `create_time`  DATETIME      DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`  DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`      TINYINT       NOT NULL DEFAULT 0       COMMENT '逻辑删除：0 未删 / 1 已删',
    PRIMARY KEY (`role_id`),
    UNIQUE KEY `uk_role_code` (`role_code`, `deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表';

-- ============================================================
-- 2. 用户表
-- ============================================================
DROP TABLE IF EXISTS `t_zgsq_user`;
CREATE TABLE `t_zgsq_user` (
    `user_id`        BIGINT        NOT NULL AUTO_INCREMENT COMMENT '用户主键 ID',
    `user_name`      VARCHAR(64)   NOT NULL                 COMMENT '登录账号，唯一',
    `user_password`  VARCHAR(128)  NOT NULL                 COMMENT '登录密码，MD5 + 盐加密',
    `user_real_name` VARCHAR(64)   DEFAULT NULL             COMMENT '真实姓名',
    `user_phone`     VARCHAR(32)   DEFAULT NULL             COMMENT '手机号',
    `user_email`     VARCHAR(128)  DEFAULT NULL             COMMENT '邮箱',
    `role_id`        BIGINT        DEFAULT NULL             COMMENT '关联角色 ID（外键 t_zgsq_role.role_id）',
    `user_status`    TINYINT       NOT NULL DEFAULT 0       COMMENT '用户状态：0 启用 / 1 禁用',
    `create_time`    DATETIME      DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`    DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`        TINYINT       NOT NULL DEFAULT 0       COMMENT '逻辑删除：0 未删 / 1 已删',
    PRIMARY KEY (`user_id`),
    UNIQUE KEY `uk_user_name` (`user_name`, `deleted`),
    KEY `idx_user_role` (`role_id`),
    KEY `idx_user_status` (`user_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统用户表';

-- ============================================================
-- 3. 地下综合管廊表（核心）
-- ============================================================
DROP TABLE IF EXISTS `t_zgsq_guan_lang`;
CREATE TABLE `t_zgsq_guan_lang` (
    `guan_lang_id`       BIGINT        NOT NULL AUTO_INCREMENT COMMENT '管廊主键 ID',
    `guan_lang_no`       VARCHAR(64)   NOT NULL                 COMMENT '管廊业务编号，格式 GL-{市名}-XXXX，唯一',
    `guan_lang_name`     VARCHAR(128)  NOT NULL                 COMMENT '管廊中文名称',
    `tunnel_length`      DOUBLE        DEFAULT NULL             COMMENT '管廊总长度（米）',
    `guan_lang_status`   TINYINT       NOT NULL DEFAULT 0       COMMENT '管廊状态：0 正常 / 1 维护中 / 2 停用',
    `belong_district`    VARCHAR(64)   DEFAULT NULL             COMMENT '所属行政区，如 XX区',
    `maintain_unit`      VARCHAR(128)  DEFAULT NULL             COMMENT '运维单位',
    `build_year`         INT           DEFAULT NULL             COMMENT '建造年份，如 2018',
    `design_life`        INT           DEFAULT NULL             COMMENT '设计寿命（年），如 50',
    `last_check_date`    DATE          DEFAULT NULL             COMMENT '上次巡检日期',
    `remain_life_percent` INT          DEFAULT 100              COMMENT '剩余寿命百分比（0-100，Service 自动计算）',
    `patrol_frequency`   INT           DEFAULT 30               COMMENT '巡检频率（天），默认 30',
    `last_patrol_result` VARCHAR(255)  DEFAULT NULL             COMMENT '上次巡检结果文本',
    `next_patrol_plan`   DATE          DEFAULT NULL             COMMENT '下次巡检计划日期（Service 自动计算）',
    `gis_coord`          VARCHAR(64)   DEFAULT NULL             COMMENT 'GIS 坐标串 "[经度,纬度]"，WGS84',
    `monitor_point_id`   VARCHAR(64)   DEFAULT NULL             COMMENT '关联监测点 ID（IoT 系统预留）',
    `create_time`        DATETIME      DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`        DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `remark`             VARCHAR(500)  DEFAULT NULL             COMMENT '备注',
    `deleted`            TINYINT       NOT NULL DEFAULT 0       COMMENT '逻辑删除：0 未删 / 1 已删',
    PRIMARY KEY (`guan_lang_id`),
    UNIQUE KEY `uk_guan_lang_no` (`guan_lang_no`, `deleted`),
    KEY `idx_guan_lang_status` (`guan_lang_status`),
    KEY `idx_guan_lang_district` (`belong_district`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='地下综合管廊表（核心）';

-- ============================================================
-- 4. 链路表（挂在管廊下）
-- ============================================================
DROP TABLE IF EXISTS `t_zgsq_lian_lu`;
CREATE TABLE `t_zgsq_lian_lu` (
    `lian_lu_id`      BIGINT        NOT NULL AUTO_INCREMENT COMMENT '链路主键 ID',
    `lian_lu_no`      VARCHAR(128)  NOT NULL                 COMMENT '链路业务编号，格式 LL-{管廊编号}-XX',
    `lian_lu_name`    VARCHAR(128)  NOT NULL                 COMMENT '链路中文名称',
    `guan_lang_id`    BIGINT        NOT NULL                 COMMENT '所属管廊 ID（外键 t_zgsq_guan_lang.guan_lang_id）',
    `lian_lu_type`    TINYINT       NOT NULL DEFAULT 1       COMMENT '链路类型：1 主干 / 2 支线',
    `total_length`    DOUBLE        DEFAULT NULL             COMMENT '链路总长（米）',
    `lian_lu_status`  TINYINT       NOT NULL DEFAULT 0       COMMENT '链路状态：0 正常 / 1 停用',
    `loop_count`      INT           DEFAULT NULL             COMMENT '回路数量',
    `loop_power`      DOUBLE        DEFAULT NULL             COMMENT '回路总功率（W）',
    `create_time`     DATETIME      DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`     DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `remark`          VARCHAR(500)  DEFAULT NULL             COMMENT '备注',
    `deleted`         TINYINT       NOT NULL DEFAULT 0       COMMENT '逻辑删除：0 未删 / 1 已删',
    PRIMARY KEY (`lian_lu_id`),
    UNIQUE KEY `uk_lian_lu_no` (`lian_lu_no`, `deleted`),
    KEY `idx_lian_lu_guanlang` (`guan_lang_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='照明链路表';

-- ============================================================
-- 5. 配光组表（挂在链路下）
-- ============================================================
DROP TABLE IF EXISTS `t_zgsq_pei_guang`;
CREATE TABLE `t_zgsq_pei_guang` (
    `pei_guang_id`      BIGINT        NOT NULL AUTO_INCREMENT COMMENT '配光组主键 ID',
    `pei_guang_no`      VARCHAR(128)  NOT NULL                 COMMENT '配光组业务编号，格式 PG-{链路编号}-XX',
    `pei_guang_name`    VARCHAR(128)  NOT NULL                 COMMENT '配光组中文名称',
    `lian_lu_id`        BIGINT        NOT NULL                 COMMENT '所属链路 ID（外键 t_zgsq_lian_lu.lian_lu_id）',
    `guan_lang_id`      BIGINT        DEFAULT NULL             COMMENT '所属管廊 ID（冗余外键，便于聚合查询）',
    `pei_guang_type`    TINYINT       NOT NULL DEFAULT 1       COMMENT '配光方式：1 对称 / 2 交错 / 3 单侧',
    `lamp_count`        INT           DEFAULT NULL             COMMENT '灯具数量',
    `single_lamp_power` DOUBLE        DEFAULT NULL             COMMENT '单灯功率（W）',
    `total_power`       DOUBLE        DEFAULT NULL             COMMENT '总功率（W，冗余 = lamp_count × single_lamp_power）',
    `bright_level`      INT           DEFAULT 80               COMMENT '亮度等级（%，0-100）',
    `pei_guang_status`  TINYINT       NOT NULL DEFAULT 0       COMMENT '配光组状态：0 正常 / 1 停用',
    `create_time`       DATETIME      DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`       DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `remark`            VARCHAR(500)  DEFAULT NULL             COMMENT '备注',
    `deleted`           TINYINT       NOT NULL DEFAULT 0       COMMENT '逻辑删除：0 未删 / 1 已删',
    PRIMARY KEY (`pei_guang_id`),
    UNIQUE KEY `uk_pei_guang_no` (`pei_guang_no`, `deleted`),
    KEY `idx_pei_guang_lianlu` (`lian_lu_id`),
    KEY `idx_pei_guang_guanlang` (`guan_lang_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='配光组表';

-- ============================================================
-- 6. 定时调度表
-- ============================================================
DROP TABLE IF EXISTS `t_zgsq_ding_shi`;
CREATE TABLE `t_zgsq_ding_shi` (
    `ding_shi_id`         BIGINT        NOT NULL AUTO_INCREMENT COMMENT '定时调度主键 ID',
    `ding_shi_name`       VARCHAR(128)  NOT NULL                 COMMENT '调度名称',
    `lian_lu_id`          BIGINT        NOT NULL                 COMMENT '关联链路 ID',
    `guan_lang_id`        BIGINT        DEFAULT NULL             COMMENT '关联管廊 ID（冗余）',
    `cron_expr`           VARCHAR(64)   NOT NULL                 COMMENT 'Cron 表达式（Spring Scheduler 6 位格式）',
    `bright_level_on`     INT           DEFAULT 80               COMMENT '开灯亮度等级（%）',
    `bright_level_off`    INT           DEFAULT 0                COMMENT '关灯亮度等级（%）',
    `start_time`          TIME          DEFAULT NULL             COMMENT '生效开始时间（HH:mm:ss）',
    `end_time`            TIME          DEFAULT NULL             COMMENT '生效结束时间（HH:mm:ss）',
    `ding_shi_status`     TINYINT       NOT NULL DEFAULT 0       COMMENT '调度状态：0 启用 / 1 禁用',
    `last_execute_time`   DATETIME      DEFAULT NULL             COMMENT '上次执行时间',
    `last_execute_result` VARCHAR(255)  DEFAULT NULL             COMMENT '上次执行结果（SUCCESS / FAIL / 错误信息）',
    `create_time`         DATETIME      DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`         DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `remark`              VARCHAR(500)  DEFAULT NULL             COMMENT '备注',
    PRIMARY KEY (`ding_shi_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='定时调度表';

-- ============================================================
-- 7. 操作日志表
-- ============================================================
DROP TABLE IF EXISTS `t_zgsq_op_log`;
CREATE TABLE `t_zgsq_op_log` (
    `op_log_id`      BIGINT        NOT NULL AUTO_INCREMENT COMMENT '日志主键 ID',
    `op_user_name`   VARCHAR(64)   DEFAULT NULL             COMMENT '操作人用户名',
    `op_user_id`     BIGINT        DEFAULT NULL             COMMENT '操作人用户 ID',
    `op_module`      VARCHAR(64)   DEFAULT NULL             COMMENT '操作模块（用户管理 / 管廊管理 / 登录 等）',
    `op_action`      VARCHAR(64)   DEFAULT NULL             COMMENT '操作动作（新增 / 修改 / 删除 / 登录 等）',
    `op_target_id`   VARCHAR(64)   DEFAULT NULL             COMMENT '操作目标 ID（如管廊 ID）',
    `op_content`     TEXT          DEFAULT NULL             COMMENT '操作详情（入参 JSON 或错误信息）',
    `op_ip`          VARCHAR(64)   DEFAULT NULL             COMMENT '客户端 IP',
    `op_time`        DATETIME      DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    `op_result`      VARCHAR(64)   DEFAULT NULL             COMMENT '执行结果（SUCCESS / FAIL:xxx）',
    `cost_ms`        BIGINT        DEFAULT NULL             COMMENT '耗时（毫秒）',
    PRIMARY KEY (`op_log_id`),
    KEY `idx_op_time` (`op_time`),
    KEY `idx_op_user` (`op_user_name`),
    KEY `idx_op_module` (`op_module`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

SET FOREIGN_KEY_CHECKS = 1;
