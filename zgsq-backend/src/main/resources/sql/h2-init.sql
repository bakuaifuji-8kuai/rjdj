-- ====================================================================
-- [软著核心代码] H2 内存数据库初始化脚本
-- 智光云枢 · 管廊照明管理系统
-- 表名前缀 t_zgsq_，字段名小写加下划线（和 MyBatis-Plus 驼峰自动转换匹配）
-- ====================================================================

-- ========= 用户表 =========
DROP TABLE IF EXISTS t_zgsq_user;
CREATE TABLE t_zgsq_user (
  user_id           INT AUTO_INCREMENT PRIMARY KEY,
  user_name         VARCHAR(50) NOT NULL,
  user_password     VARCHAR(200) NOT NULL,
  user_real_name    VARCHAR(50),
  user_phone        VARCHAR(20),
  user_email        VARCHAR(100),
  role_id           INT DEFAULT 1,
  user_status       INT DEFAULT 0,
  create_time       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  update_time       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_name),
  deleted INT DEFAULT 0
);

-- ========= 角色表 =========
DROP TABLE IF EXISTS t_zgsq_role;
CREATE TABLE t_zgsq_role (
  role_id           INT AUTO_INCREMENT PRIMARY KEY,
  role_name         VARCHAR(50) NOT NULL,
  role_code         VARCHAR(50) NOT NULL,
  role_desc         VARCHAR(200),
  role_status       INT DEFAULT 0,
  create_time       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  update_time       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (role_code)
);

-- ========= 管廊表（核心） =========
DROP TABLE IF EXISTS t_zgsq_guan_lang;
CREATE TABLE t_zgsq_guan_lang (
  guan_lang_id      INT AUTO_INCREMENT PRIMARY KEY,
  guan_lang_no      VARCHAR(32) NOT NULL,
  guan_lang_name    VARCHAR(100),
  tunnel_length     DECIMAL(10,2) DEFAULT 0,
  guan_lang_status  INT DEFAULT 0,
  belong_district   VARCHAR(50),
  maintain_unit     VARCHAR(100),
  build_year        INT,
  design_life       INT,
  last_check_date   DATE,
  remain_life_percent DECIMAL(5,2),
  patrol_frequency  INT DEFAULT 30,
  last_patrol_result VARCHAR(50),
  next_patrol_plan  DATE,
  gis_coord         VARCHAR(100),
  monitor_point_id  VARCHAR(50),
  create_time       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  update_time       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  remark            VARCHAR(500),
  deleted           INT DEFAULT 0,
  UNIQUE (guan_lang_no)
);

-- ========= 链路表 =========
DROP TABLE IF EXISTS t_zgsq_lian_lu;
CREATE TABLE t_zgsq_lian_lu (
  lian_lu_id        INT AUTO_INCREMENT PRIMARY KEY,
  lian_lu_no        VARCHAR(32) NOT NULL,
  lian_lu_name      VARCHAR(100),
  guan_lang_id      INT,
  lian_lu_type      INT DEFAULT 1,
  lian_lu_status    INT DEFAULT 0,
  total_length      DECIMAL(10,2) DEFAULT 0,
  loop_count        INT DEFAULT 0,
  loop_power        DECIMAL(10,2) DEFAULT 0,
  create_time       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  update_time       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  remark            VARCHAR(500),
  deleted           INT DEFAULT 0,
  UNIQUE (lian_lu_no)
);

-- ========= 配光组表 =========
DROP TABLE IF EXISTS t_zgsq_pei_guang;
CREATE TABLE t_zgsq_pei_guang (
  pei_guang_id      INT AUTO_INCREMENT PRIMARY KEY,
  pei_guang_no      VARCHAR(32) NOT NULL,
  pei_guang_name    VARCHAR(100),
  lian_lu_id        INT,
  guan_lang_id      INT,
  pei_guang_type    INT DEFAULT 1,
  lamp_count        INT DEFAULT 0,
  single_lamp_power DECIMAL(10,2) DEFAULT 0,
  total_power       DECIMAL(10,2) DEFAULT 0,
  bright_level      INT DEFAULT 100,
  pei_guang_status  INT DEFAULT 0,
  create_time       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  update_time       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  remark            VARCHAR(500),
  deleted           INT DEFAULT 0,
  UNIQUE (pei_guang_no)
);

-- ========= 定时调度表 =========
DROP TABLE IF EXISTS t_zgsq_ding_shi;
CREATE TABLE t_zgsq_ding_shi (
  ding_shi_id       INT AUTO_INCREMENT PRIMARY KEY,
  ding_shi_name     VARCHAR(100),
  lian_lu_id        INT,
  guan_lang_id      INT,
  cron_expr         VARCHAR(50),
  bright_level_on   INT DEFAULT 100,
  bright_level_off  INT DEFAULT 0,
  start_time        TIME,
  end_time          TIME,
  ding_shi_status   INT DEFAULT 0,
  last_execute_time TIMESTAMP,
  last_execute_result VARCHAR(50),
  create_time       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  update_time       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  remark            VARCHAR(500),
  deleted           INT DEFAULT 0
);

-- ========= 操作日志表 =========
DROP TABLE IF EXISTS t_zgsq_op_log;
CREATE TABLE t_zgsq_op_log (
  op_log_id         INT AUTO_INCREMENT PRIMARY KEY,
  op_user_id        INT,
  op_user_name      VARCHAR(50),
  op_module         VARCHAR(50),
  op_action         VARCHAR(50),
  op_target_id      VARCHAR(50),
  op_content        VARCHAR(1000),
  op_ip             VARCHAR(50),
  op_time           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  op_result         VARCHAR(20),
  cost_ms           INT
);

-- ========= 初始化数据 =========
INSERT INTO t_zgsq_role (role_name, role_code, role_desc, role_status) VALUES
('超级管理员', 'admin', '拥有所有权限', 0),
('运维工程师', 'engineer', '日常巡检和告警处理', 0),
('只读用户', 'viewer', '仅查看数据', 0);

INSERT INTO t_zgsq_user (user_name, user_password, user_real_name, user_phone, role_id, user_status) VALUES ('admin',    '0bf5a4d295256ead0cfe45a7339a1ddb', '系统管理员', '13800000000', 1, 0);
INSERT INTO t_zgsq_user (user_name, user_password, user_real_name, user_phone, role_id, user_status) VALUES ('engineer', 'adf3f3a220a96528f7ef35b72875d561', '张工程师',   '13900000001', 2, 0);
INSERT INTO t_zgsq_user (user_name, user_password, user_real_name, user_phone, role_id, user_status) VALUES ('viewer',   'adf3f3a220a96528f7ef35b72875d561', '李观察员',   '13700000002', 3, 0);

INSERT INTO t_zgsq_guan_lang (guan_lang_no, guan_lang_name, tunnel_length, guan_lang_status, belong_district, maintain_unit, build_year, design_life, patrol_frequency, gis_coord, remark) VALUES
('GL-长沙-0001', '岳麓大道综合管廊', 2580.00, 0, '岳麓区', '长沙市路灯管理处', 2018, 30, 30, '112.93,28.22', '含电力、通信、给水管道'),
('GL-长沙-0002', '三一大道管廊',     1860.00, 1, '开福区', '长沙市路灯管理处', 2019, 30, 30, '112.96,28.24', '当前维护中，新增监测点'),
('GL-长沙-0003', '万家丽路管廊',     3200.00, 0, '雨花区', '湖南力维天科',     2020, 30, 30, '112.99,28.18', '分段建设，已全部投入使用');

INSERT INTO t_zgsq_lian_lu (lian_lu_no, lian_lu_name, guan_lang_id, lian_lu_type, lian_lu_status, total_length, loop_count, loop_power) VALUES
('LL-GL0001-01', '岳麓大道-西段', 1, 1, 0, 1200, 12, 1200),
('LL-GL0001-02', '岳麓大道-东段', 1, 2, 0, 1380,  8,  800),
('LL-GL0002-01', '三一大道-主线', 2, 1, 0, 1860, 20, 2000),
('LL-GL0003-01', '万家丽-北段',   3, 1, 0, 1600, 15, 1500),
('LL-GL0003-02', '万家丽-南段',   3, 2, 0, 1600, 10, 1000);

INSERT INTO t_zgsq_pei_guang (pei_guang_no, pei_guang_name, lian_lu_id, guan_lang_id, pei_guang_type, lamp_count, single_lamp_power, total_power, bright_level, pei_guang_status) VALUES
('PG-LL0001-01', '岳麓西段-对称配光', 1, 1, 1, 120, 50, 6000, 100, 0),
('PG-LL0002-01', '岳麓东段-交错配光', 2, 1, 2,  96, 40, 3840,  80, 0),
('PG-LL0003-01', '三大主线-单侧配光', 3, 2, 3, 160, 45, 7200, 100, 0);

INSERT INTO t_zgsq_ding_shi (ding_shi_name, lian_lu_id, guan_lang_id, cron_expr, bright_level_on, bright_level_off, start_time, end_time, ding_shi_status) VALUES
('每日傍晚亮灯', 1, 1, '0 30 18 * * ?', 100, 0, '18:30', '06:00', 0),
('夜间降功率',   1, 1, '0 0 23 * * ?',  50, 0, '23:00', '05:00', 0),
('凌晨关灯',     1, 1, '0 0 6 * * ?',    0, 0, '06:00', '18:30', 0),
('周末模式',     3, 2, '0 0 7 ? * SAT,SUN', 80, 0, '19:00', '23:00', 1);
