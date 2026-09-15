/**
 * 智光云枢 - 软件功能说明书生成脚本
 * 大幅扩充版：增加 API 文档、代码片段、接口示例、工具类详解
 */

const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, BorderStyle, Header, Footer,
  PageNumber, PageBreak, ShadingType, TableOfContents, LineRuleType,
} = require('docx');
const fs = require('fs');

const OUTPUT = '/workspace/zgsq-materials/智光云枢-软件功能说明书.docx';

const FONT_SONG = '宋体';
const FONT_COURIER = 'Courier New';
const SIZE = 24;          // 12pt
const SIZE_H1 = 36; SIZE_H2 = 30; SIZE_H3 = 26; SIZE_H4 = 24;
const SIZE_CODE = 20;      // 10pt

function r(text, opts = {}) {
  return new TextRun({ text, font: opts.font || FONT_SONG, size: opts.size || SIZE, bold: opts.bold || false, color: opts.color || '000000' });
}
function p(runs, opts = {}) {
  if (typeof runs === 'string') runs = [r(runs)];
  return new Paragraph({ children: runs, alignment: opts.align || AlignmentType.JUSTIFIED,
    spacing: { before: opts.before ?? 120, after: opts.after ?? 120, line: 360 }, indent: opts.indent || {} });
}
function h1(t) { return new Paragraph({ children: [r(t, { size: SIZE_H1, bold: true })], heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }); }
function h2(t) { return new Paragraph({ children: [r(t, { size: SIZE_H2, bold: true })], heading: HeadingLevel.HEADING_2, spacing: { before: 320, after: 160 } }); }
function h3(t) { return new Paragraph({ children: [r(t, { size: SIZE_H3, bold: true })], heading: HeadingLevel.HEADING_3, spacing: { before: 240, after: 120 } }); }
function h4(t) { return new Paragraph({ children: [r(t, { size: SIZE_H4, bold: true })], heading: HeadingLevel.HEADING_4, spacing: { before: 200, after: 100 } }); }
function p1(t) { return new Paragraph({ children: [r(t)], indent: { firstLine: 480 }, spacing: { before: 80, after: 80, line: 360 } }); }
function pb(t) { return new Paragraph({ children: [r(t)], spacing: { before: 60, after: 60 }, bullet: { level: 0 } }); }
function pb2(t) { return new Paragraph({ children: [r(t)], spacing: { before: 40, after: 40 }, bullet: { level: 1 } }); }
function blank() { return new Paragraph({ children: [], spacing: { before: 40, after: 40 } }); }
function pageBreak() { return new Paragraph({ children: [new PageBreak()] }); }

function code(text, linesBefore = 60) {
  const lines = text.split('\n');
  // 限制行数避免过长
  const showLines = lines.length > 80 ? lines.slice(0, 80).concat(['... // 省略后续', '']) : lines;
  const paras = showLines.map(line => new Paragraph({
    children: [r(line || ' ', { font: FONT_COURIER, size: SIZE_CODE, color: '333333' })],
    spacing: { before: 0, after: 0, line: 240 },
    indent: { left: 200 },
    shading: { type: ShadingType.CLEAR, color: 'F5F5F5' },
  }));
  // 加外框
  paras[0].border = { top: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' }, left: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' }, right: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' } };
  paras[paras.length - 1].border = { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' }, left: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' }, right: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' } };
  paras.forEach((par, i) => {
    if (i > 0 && i < paras.length - 1) par.border = { left: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' }, right: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' } };
  });
  return paras;
}

function cell(text, opts = {}) {
  return new TableCell({
    width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    shading: opts.header ? { type: ShadingType.CLEAR, color: 'D9E2F3' } : undefined,
    verticalAlign: 'center',
    children: [new Paragraph({ children: [r(text, { bold: opts.bold || opts.header, size: SIZE_CODE })],
      alignment: opts.align || AlignmentType.LEFT, spacing: { before: 40, after: 40, line: 240 } })],
  });
}
function tbl(rows, widths) {
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: rows.map((r, i) => new TableRow({
    children: r.map((c, j) => cell(typeof c === 'string' ? c : c.text || c, { header: i === 0, width: widths ? widths[j] : undefined, bold: c.bold, align: c.align })),
  })) });
}

// ============ 页眉页脚 ============
const HDR = '《城市照明物联管控平台（智光云枢）V1.0 软件功能说明书》';
function mkHeader() { return new Header({ children: [new Paragraph({ children: [r(HDR, { size: 18, color: '666666' })], alignment: AlignmentType.CENTER, border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' } } })] }); }
function mkFooter() { return new Footer({ children: [new Paragraph({ children: [r('第 ', { size: 18 }), new TextRun({ children: [PageNumber.CURRENT], size: 18 }), r(' 页 / 共 ', { size: 18 }), new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18 }), r(' 页', { size: 18 })], alignment: AlignmentType.CENTER, border: { top: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' } } })] }); }

// ============ 封面 ============
function cover() {
  return [
    new Paragraph({ children: [], spacing: { before: 1600 } }),
    p([r('软件功能说明书', { size: 72, bold: true })], { align: AlignmentType.CENTER, before: 200, after: 600 }),
    p([r('城市照明物联管控平台（智光云枢）V1.0', { size: 32, color: '333333' })], { align: AlignmentType.CENTER, before: 200, after: 200 }),
    blank(), blank(), blank(), blank(),
    p([r('著作权人：智光云枢科技有限公司', { size: SIZE_H3 })], { align: AlignmentType.CENTER, before: 120 }),
    p([r('完成日期：2026 年 09 月', { size: SIZE_H3 })], { align: AlignmentType.CENTER, before: 120 }),
    pageBreak(),
  ];
}

// ============ 目录 ============
function toc() {
  return [
    p([r('目  录', { size: SIZE_H1, bold: true })], { align: AlignmentType.CENTER, before: 200, after: 400 }),
    new TableOfContents('目录', { hyperlink: true, headingStyleRange: '1-4' }),
    pageBreak(),
  ];
}

// ============ 第1章 系统概述 ============
function ch1() {
  const c = [];
  c.push(h1('第1章 系统概述'));
  c.push(p1('本章从行业背景、产品定位、目标用户和技术架构四个维度，对城市照明物联管控平台（智光云枢）进行整体介绍。'));

  c.push(h2('1.1 项目背景'));
  c.push(p1('随着我国城镇化率持续提升，城市地下综合管廊的建设规模逐年扩大。管廊内部照明系统是保障巡检人员安全、维护设备正常运行的关键基础设施。传统照明运维模式存在三大行业痛点：'));
  c.push(pb('巡检效率低：依赖人工定期巡检，单次巡检耗时长、覆盖范围有限，难以满足管廊网络化增长的管理需求。传统方式下，一名巡检人员每天仅能覆盖 5-8 公里管廊，而大型城市管廊总长度可达数百公里。'));
  c.push(pb('故障发现滞后：照明灯具损坏、线路短路等问题无法实时感知，往往需待下次巡检时才能发现，存在较长时间的安全盲区。据统计，传统模式下照明故障的平均响应时间为 72 小时以上。'));
  c.push(pb('能耗管理粗放：照明系统缺乏分级调光和时序控制能力，要么全亮要么全灭，造成大量无效能耗。市政照明能耗约占城市市政总能耗的 15%-20%，其中超过 30% 为可避免的浪费。'));
  c.push(p1('智光云枢城市照明物联管控平台正是为破解上述痛点而生。通过数字化建模、自动化调度和智能化分析，帮助管理者实现"看得见、控得住、算得清"的照明全生命周期管理。'));

  c.push(h2('1.2 产品定位'));
  c.push(p1('智光云枢是一套面向城市地下综合管廊照明系统的全生命周期管控平台，覆盖从管廊档案建立、链路/配光组建模、定时调度策略下发，到数据统计与巡检周期管理的完整业务闭环。'));
  c.push(p1('平台以 GIS 坐标体系为空间锚点，以定时调度表为时间抓手，以状态机为业务护栏，帮助管廊运维单位实现照明系统的数字化、精细化、自动化管理。产品核心价值包括：'));
  c.push(pb('数字化档案：一条记录涵盖管廊基础信息、照明资产、巡检计划、寿命评估，告别纸质台账。'));
  c.push(pb('自动化调度：通过 Cron 表达式与亮度分级，自动执行"开灯-运行-关灯"全流程，无需人工值守。'));
  c.push(pb('精细化统计：按行政区、按状态、按时间维度的多维度聚合，支撑管理决策。'));
  c.push(pb('可追溯日志：AOP 自动采集全系统操作行为，所有变更有据可查。'));

  c.push(h2('1.3 目标用户'));
  c.push(pb('城市路灯管理处：负责市政管廊照明资产的统筹管理与监督考核，关注全局资产分布、能耗统计和运维绩效。'));
  c.push(pb('市政工程公司：承接管廊工程建设与后期运维项目，需要高效工具支撑多管廊并行管理、多项目数据隔离。'));
  c.push(pb('照明运营商：作为管廊照明系统的专业运营方，需要精细化的能耗管理和灵活的调度策略配置能力。'));

  c.push(h2('1.4 技术架构'));
  c.push(p1('智光云枢采用前后端分离的 B/S 架构，技术选型兼顾成熟度与可扩展性。整体调用链路为：浏览器 → Axios（加 Token）→ Nginx（可选反向代理）→ SpringBoot（LoginInterceptor 校验）→ Service 层（业务逻辑 + 状态机 + 工具类）→ MyBatis-Plus → MySQL。'));

  c.push(h3('1.4.1 后端架构'));
  c.push(pb('核心框架：SpringBoot 2.7.18，提供自动装配、内嵌 Tomcat、Starter 依赖管理、统一异常处理等开箱即用能力。'));
  c.push(pb('持久层：MyBatis-Plus 3.5.3.1，封装 BaseMapper/IService 接口实现通用 CRUD，内置分页插件（PaginationInnerInterceptor）、逻辑删除（deleted 字段）、自动填充（MetaObjectHandler）等特性。'));
  c.push(pb('数据库：MySQL 5.7，采用 utf8mb4 字符集支持 emoji 和生僻字；所有业务表使用 InnoDB 引擎保障事务一致性；关键业务编号建有 (字段, deleted) 联合唯一索引支持软删除后编号复用。'));
  c.push(pb('工具库：Lombok（@Data/@Builder/@Slf4j 减少样板代码）、自研工具类（ZgsqCodeGenUtil 编号生成、ZgsqGisUtil 地理计算、ZgsqDateUtil 日期运算、ZgsqDigestUtil 密码加密、ZgsqTreeUtil 树结构处理、GuanLangExcelUtil Excel 导入导出）。'));

  c.push(h3('1.4.2 前端架构'));
  c.push(pb('核心框架：Vue 3.2，采用 Composition API（setup + ref + reactive）构建组件逻辑，替代 Options API 提升代码组织性。'));
  c.push(pb('UI 组件库：Element Plus，提供 Table（自动适配列宽）、Form（规则校验）、Dialog/Drawer（弹窗/抽屉）、Pagination（分页）、Switch（开关）等丰富组件，支持中文国际化。'));
  c.push(pb('构建工具：Vite，基于 esbuild 实现极速冷启动（< 500ms）和 HMR 热更新（< 100ms），生产构建使用 Rollup。'));
  c.push(pb('状态管理：Pinia，Vue 3 官方推荐的状态管理方案，以模块化 store 形式替代 Vuex，管理用户信息（store/user.js）和管廊筛选条件（store/guanlang.js）等全局状态。'));
  c.push(pb('HTTP 客户端：Axios，封装于 api/request.js，实现请求拦截器注入 Token、响应拦截器统一处理 Result<T> 解包和 401 跳转登录。'));

  c.push(h3('1.4.3 数据库与缓存架构'));
  c.push(p1('数据库层采用单实例 MySQL 5.7，后续可平滑演进为主从架构。MyBatis-Plus 的 PaginationInnerInterceptor 在 SQL 层自动追加 LIMIT 子句实现物理分页，避免全表扫描。唯一索引和普通索引覆盖了高频查询路径：'));
  c.push(pb('业务编号唯一索引：所有实体的业务编号字段建有 uk_xxx (字段, deleted) 联合唯一索引。'));
  c.push(pb('状态索引：guan_lang_status、lian_lu_status、ding_shi_status 等状态字段单列索引。'));
  c.push(pb('外键索引：lian_lu.guan_lang_id、pei_guang.lian_lu_id、ding_shi.lian_lu_id 等关联查询索引。'));
  c.push(pb('时间索引：op_log.op_time、op_log.op_user_name 支撑操作日志的按时间/用户查询。'));

  c.push(h3('1.4.4 安全架构'));
  c.push(p1('系统安全边界由三层防线构成：'));
  c.push(pb('传输层：Nginx 可配置 HTTPS，SpringBoot 可选启用 spring-boot-starter-security。'));
  c.push(pb('应用层：LoginInterceptor 拦截器校验 X-Zgsq-Token 请求头；GlobalExceptionHandler 统一处理鉴权异常返回 401 状态码。'));
  c.push(pb('业务层：用户密码采用 MD5 + 随机盐加密存储（ZgsqDigestUtil）；重要操作（删除、状态切换）需校验关联数据完整性。'));

  c.push(pageBreak());
  return c;
}

// ============ 第2章 功能模块详述 ============
function ch2() {
  const c = [];
  c.push(h1('第2章 功能模块详述'));
  c.push(p1('本章按模块逐一说明系统的功能设计、操作界面、业务逻辑及对应代码文件，实现说明书与源代码 1:1 可追溯。每个模块遵循"功能说明 → 核心功能详述 → 业务逻辑 → 接口列表 → 对应代码"的写作模式。'));

  // ===== 2.1 用户与权限管理 =====
  c.push(h2('2.1 用户与权限管理模块'));
  c.push(h3('2.1.1 模块总览'));
  c.push(p1('用户与权限管理模块负责系统安全边界的管控，提供登录认证、用户 CRUD、角色 CRUD 三大核心功能。登录采用用户名密码校验 + Token 鉴权机制，Token 有效期内免登录。角色体系预置超级管理员（ADMIN）与普通运维（OPERATOR）两类角色，为后续扩展细粒度权限预留基础。'));
  c.push(p1('本模块在后端对应 user 包和 role 包，在前端对应 views/login/、views/user/、views/role/ 三个目录，通过 LoginInterceptor 和 WebMvcConfig 统一鉴权。'));

  c.push(h3('2.1.2 登录认证'));
  c.push(h4('功能说明'));
  c.push(p1('登录页面是系统入口（/login），用户输入用户名和密码后提交。后端 UserController.login 接口校验用户是否存在、密码是否匹配、用户状态是否为启用。校验通过后生成 Token 返回前端，前端存入 localStorage（key=zgsq_token），后续请求自动通过 HTTP Header X-Zgsq-Token 携带。'));

  c.push(h4('业务规则'));
  c.push(pb('用户名校验：3-20 个字符，前后端双重校验。'));
  c.push(pb('密码校验：6-20 个字符，前端正则校验 /^.{6,20}$/。'));
  c.push(pb('密码加密：后端使用 ZgsqDigestUtil.md5(password + salt) 比对存储值。'));
  c.push(pb('禁用状态用户禁止登录：返回 ErrorCode.USER_DISABLED（code=40301）。'));
  c.push(pb('Token 校验：LoginInterceptor 从 X-Zgsq-Token 请求头读取，与 application.yml 配置的 zgsq.admin-token 比对。'));

  c.push(h4('登录接口'));
  c.push(tbl([
    ['项目', '值'],
    ['接口路径', 'POST /api/user/login'],
    ['请求体', '{ "userName": "admin", "userPassword": "admin123" }'],
    ['成功响应', '{ "code": 200, "message": "登录成功", "data": { "token": "xxx", "userId": 1, "userName": "admin", "roleCode": "ADMIN" } }'],
    ['失败响应-密码错误', '{ "code": 40002, "message": "用户名或密码错误", "data": null }'],
    ['失败响应-用户禁用', '{ "code": 40301, "message": "用户已被禁用，请联系管理员", "data": null }'],
  ]));

  c.push(h4('前端路由守卫'));
  c.push(p1('前端 src/router/index.js 配置全局 beforeEach 守卫：每次路由跳转前检查 localStorage 中是否存在 Token，登录页（/login）直接放行，无 Token 则跳转 /login?redirect=目标路径。登录成功后 Login.vue 读取 route.query.redirect 自动跳回原目标页面。'));
  c.push(code(`// router/index.js 路由守卫核心
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('zgsq_token');
  if (to.path === '/login') {
    next();
  } else if (!token) {
    next({ path: '/login', query: { redirect: to.fullPath } });
  } else {
    next();
  }
});`));

  c.push(h4('后端登录拦截器'));
  c.push(p1('后端 LoginInterceptor 实现 HandlerInterceptor，preHandle 阶段从请求头读取 X-Zgsq-Token，校验后将用户信息写入 request attribute（供 LogAspect 读取操作人）。WebMvcConfig 注册拦截器时配置白名单放行 /api/user/login 等接口。'));
  c.push(code(`// LoginInterceptor.java 核心逻辑
public boolean preHandle(HttpServletRequest req, HttpServletResponse resp, Object handler) {
    String token = req.getHeader("X-Zgsq-Token");
    if (token == null || token.trim().isEmpty()) {
        throw new UnauthorizedException(ErrorCode.TOKEN_MISSING);
    }
    if (!token.trim().equals(adminToken)) {
        throw new UnauthorizedException(ErrorCode.TOKEN_INVALID);
    }
    req.setAttribute("zgsq.current.user.name", "admin");
    req.setAttribute("zgsq.current.user.id", 1);
    return true;
}`));

  c.push(h3('2.1.3 用户管理'));
  c.push(h4('功能说明'));
  c.push(p1('用户管理页面（/user/index）提供系统账户的完整生命周期管理。页面顶部为筛选条件区（用户名、真实姓名、手机号、状态），中部为数据表格（含批量选择复选框），右侧抽屉/弹窗承载新增和编辑表单，行内操作列提供编辑、删除、状态切换。'));

  c.push(h4('核心操作'));
  c.push(pb('用户列表查询：GET /api/user/page，支持多条件复合筛选 + 分页。'));
  c.push(pb('新增用户：POST /api/user/add，表单校验 + 用户名唯一性校验 + 密码 MD5+盐加密入库。'));
  c.push(pb('编辑用户：PUT /api/user/update，支持修改除用户名外的其他字段。'));
  c.push(pb('删除用户：DELETE /api/user/delete，逻辑删除（deleted=1）。'));
  c.push(pb('批量删除：POST /api/user/batchDelete，接收 Long[] ids。'));
  c.push(pb('状态切换：PUT /api/user/updateStatus，行内 Switch 组件触发。'));

  c.push(h4('用户模块接口列表'));
  c.push(tbl([
    ['接口', '方法', '路径', '功能'],
    ['登录', 'POST', '/api/user/login', '用户名密码校验，返回 Token'],
    ['用户分页', 'GET', '/api/user/page', '多条件筛选 + 分页'],
    ['用户详情', 'GET', '/api/user/detail/{id}', '单用户完整信息'],
    ['新增用户', 'POST', '/api/user/add', '创建账户'],
    ['修改用户', 'PUT', '/api/user/update', '编辑账户信息'],
    ['删除用户', 'DELETE', '/api/user/delete', '逻辑删除'],
    ['批量删除', 'POST', '/api/user/batchDelete', '批量逻辑删除'],
    ['状态切换', 'PUT', '/api/user/updateStatus', '启用/禁用'],
  ]));

  c.push(h3('2.1.4 角色管理'));
  c.push(h4('功能说明'));
  c.push(p1('角色管理页面（/role/index）维护角色字典表。角色通过 role_code 唯一标识（如 ADMIN、OPERATOR），为用户提供关联。每个角色包含角色名称、编码、描述、状态（启用/禁用）四个核心字段，支持完整 CRUD。已被用户引用的角色可禁用但不可删除。'));

  c.push(h4('角色模块接口列表'));
  c.push(tbl([
    ['接口', '方法', '路径', '功能'],
    ['角色列表', 'GET', '/api/role/page', '分页 + 条件筛选'],
    ['角色详情', 'GET', '/api/role/detail/{id}', '单角色信息'],
    ['新增角色', 'POST', '/api/role/add', '创建角色'],
    ['修改角色', 'PUT', '/api/role/update', '编辑角色'],
    ['删除角色', 'DELETE', '/api/role/delete', '删除未关联角色'],
    ['状态切换', 'PUT', '/api/role/updateStatus', '启用/禁用'],
  ]));

  c.push(h3('2.1.5 对应代码文件'));
  c.push(tbl([
    ['类型', '路径', '关键类/文件'],
    ['后端', 'com.zgsq.illumination.user', 'UserController（8 个接口）、UserService、UserServiceImpl、UserMapper、User（Entity）、UserDTO、UserVOs'],
    ['后端', 'com.zgsq.illumination.role', 'RoleController、RoleService、RoleServiceImpl、RoleMapper、Role（Entity）、RoleDTO、RoleVO'],
    ['后端', 'com.zgsq.illumination.interceptor', 'LoginInterceptor（Token 解析 + 校验 + ThreadLocal 用户上下文）'],
    ['后端', 'com.zgsq.illumination.config', 'WebMvcConfig（拦截器注册、白名单配置）'],
    ['后端', 'com.zgsq.illumination.utils', 'ZgsqDigestUtil（MD5 + 随机盐加密）'],
    ['后端', 'com.zgsq.illumination.exception', 'UnauthorizedException、GlobalExceptionHandler'],
    ['后端', 'com.zgsq.illumination.common', 'Result<T>、ErrorCode、PageResult<T>'],
    ['前端', 'src/views/login/', 'Login.vue（登录表单、表单校验、redirect 回跳）'],
    ['前端', 'src/views/user/', 'UserIndex.vue（用户列表、CRUD、状态切换、批量操作）'],
    ['前端', 'src/views/role/', 'RoleIndex.vue（角色列表、CRUD、状态切换）'],
    ['前端', 'src/api/', 'user.js、role.js（RESTful 接口封装）'],
    ['前端', 'src/router/', 'index.js（全局路由守卫、Token 检查、redirect 支持）'],
    ['前端', 'src/store/', 'user.js（Pinia Store，存 Token + 用户信息）'],
    ['前端', 'src/api/', 'request.js（Axios 实例 + 请求/响应拦截器）'],
  ]));

  // ===== 2.2 管廊管理（核心） =====
  c.push(pageBreak());
  c.push(h2('2.2 管廊管理模块（核心模块）'));
  c.push(h3('2.2.1 模块总览'));
  c.push(p1('管廊管理是智光云枢的核心业务模块，承担管廊档案的全生命周期管理。所有链路、配光组、定时调度均挂在管廊之下，管廊是整个业务域的顶层实体。管廊实体（t_zgsq_guan_lang）包含 22 个字段，覆盖从基础档案到运维管理的完整信息模型。'));
  c.push(p1('本模块后端对应 guanlang 包，前端对应 views/guanlang/ 目录下 4 个 Vue 文件（GuanLangIndex 列表、GuanLangAdd 新增、GuanLangEdit 编辑、GuanLangDetail 详情抽屉），配套 api/guanlang.js 接口封装。'));

  c.push(h3('2.2.2 管廊列表查询'));
  c.push(h4('筛选与查询'));
  c.push(p1('列表页顶部筛选区提供四个筛选维度：管廊编号（模糊）、管廊名称（模糊）、状态（下拉：全部/正常/维护中/停用）、所属行政区（下拉/自由输入）。后端 GuanLangMapper 采用自定义 SQL 拼接多条件查询，offset + limit 物理分页。'));

  c.push(h4('列表展示'));
  c.push(p1('数据表格展示字段：管廊编号、管廊名称、总长度、状态（彩色标签）、所属行政区、运维单位、建造年份、剩余寿命 %、巡检频率、下次巡检计划、GIS 坐标、操作列。操作列包含 详情、编辑、删除、状态切换 四个按钮。表格支持批量多选（复选框）和批量删除。'));

  c.push(h4('列表接口'));
  c.push(code(`GET /api/guanlang/page?pageNum=1&pageSize=10&guanLangNo=GL-&guanLangStatus=0&belongDistrict=西湖区

{
  "code": 200,
  "message": "操作成功",
  "data": {
    "records": [
      {
        "guanLangId": 1,
        "guanLangNo": "GL-杭州市-0001",
        "guanLangName": "文一路地下管廊",
        "tunnelLength": 3560.5,
        "guanLangStatus": 0,
        "guanLangStatusName": "正常",
        "belongDistrict": "西湖区",
        "maintainUnit": "XX 市政运维公司",
        "buildYear": 2018,
        "designLife": 50,
        "remainLifePercent": 84,
        "patrolFrequency": 30,
        "patrolExpired": false,
        "gisCoord": "[120.155,30.274]"
      }
    ],
    "total": 47, "current": 1, "size": 10, "pages": 5
  }
}`));

  c.push(h3('2.2.3 新增管廊'));
  c.push(h4('表单字段与校验'));
  c.push(p1('新增页面采用 Element Plus el-form 组件绑定 GuanLangAddDTO，所有必填字段通过 rules 规则校验。编号字段展示只读提示"系统自动生成，可手动填写"，用户填写后后端校验唯一性。提交时后端 Service 层执行：编号生成（或唯一性校验）→ 基础字段赋值 → 剩余寿命自动计算 → 巡检计划自动计算 → 入库。'));
  c.push(tbl([
    ['字段', '类型', '必填', '校验规则', '说明'],
    ['管廊编号', 'String', '否', '格式 GL-XX市-XXXX，唯一', 'ZgsqCodeGenUtil 自动生成'],
    ['管廊名称', 'String', '是', '1-128 字符', '中文名称'],
    ['总长度', 'Double', '否', '> 0', '单位：米'],
    ['状态', 'Integer', '否', '0/1/2', '默认 0（正常）'],
    ['所属行政区', 'String', '否', '-', '如 西湖区'],
    ['运维单位', 'String', '否', '-', '负责单位'],
    ['建造年份', 'Integer', '否', '4 位数字', '如 2018'],
    ['设计寿命', 'Integer', '否', '> 0', '默认 50 年'],
    ['上次巡检日期', 'Date', '否', 'YYYY-MM-DD', '-'],
    ['巡检频率', 'Integer', '是', '> 0', '默认 30 天'],
    ['上次巡检结果', 'String', '否', '-', '文本描述'],
    ['GIS 坐标', 'String', '否', '经度,纬度', 'WGS84'],
    ['监测点 ID', 'String', '否', '-', 'IoT 预留'],
    ['备注', 'String', '否', '< 500 字符', '-'],
  ]));

  c.push(h4('新增接口（Service 层核心逻辑）'));
  c.push(code(`@Transactional
public Long addGuanLang(GuanLangAddDTO dto) {
    GuanLang gl = new GuanLang();
    // 1) 编号处理：用户传了就校验唯一，没传就自动生成
    if (dto.getGuanLangNo() != null && !dto.getGuanLangNo().isEmpty()) {
        GuanLang exist = guanLangMapper.selectByNo(dto.getGuanLangNo());
        if (exist != null) throw new BusinessException(ErrorCode.GUANLANG_NO_DUPLICATE);
        gl.setGuanLangNo(dto.getGuanLangNo());
    } else {
        int maxSeq = guanLangMapper.selectMaxSeqByCity(dto.getBelongCity());
        gl.setGuanLangNo(ZgsqCodeGenUtil.genGuanLangNo(city, maxSeq));
    }
    // 2) 基础字段赋值（略）
    // 3) 剩余寿命自动计算
    gl.setRemainLifePercent(ZgsqDateUtil.calcRemainLifePercent(buildYear, designLife));
    // 4) 巡检计划自动计算
    gl.setNextPatrolPlan(ZgsqDateUtil.calcNextPatrolDate(null, patrolFreq));
    guanLangMapper.insert(gl);
    return gl.getGuanLangId();
}`));

  c.push(h3('2.2.4 编辑管廊'));
  c.push(p1('编辑页面与新增页面共用表单组件，路由携带 guanLangId 参数进入，页面加载时调用 GET /api/guanlang/detail/{id} 获取完整数据并自动回显。DTO 使用 null 语义——null 表示用户不修改该字段，非 null 才覆盖原值。修改后 Service 层重新计算剩余寿命百分比和下次巡检计划。'));
  c.push(code(`@Transactional
public void updateGuanLang(GuanLangUpdateDTO dto) {
    GuanLang gl = guanLangMapper.selectById(dto.getGuanLangId());
    // 逐字段更新（null 表示不修改）
    if (dto.getGuanLangName() != null) gl.setGuanLangName(dto.getGuanLangName());
    if (dto.getTunnelLength() != null) gl.setTunnelLength(dto.getTunnelLength());
    // ... 其余字段省略
    // 关键：重新计算剩余寿命
    gl.setRemainLifePercent(ZgsqDateUtil.calcRemainLifePercent(gl.getBuildYear(), gl.getDesignLife()));
    // 关键：重新计算下次巡检
    gl.setNextPatrolPlan(ZgsqDateUtil.calcNextPatrolDate(gl.getLastCheckDate(), gl.getPatrolFrequency()));
    gl.setUpdateTime(LocalDateTime.now());
    guanLangMapper.updateById(gl);
}`));

  c.push(h3('2.2.5 管廊详情抽屉'));
  c.push(p1('点击列表行内「详情」按钮，右侧弹出 Drawer 抽屉面板（宽度 640px）。抽屉上半部分展示管廊全部字段的只读版本（标签-值对形式），下半部分展示「关联链路列表」（调用 GET /api/lianlu/listByGuanLangId/{id}），每条链路显示编号、名称、类型、状态。'));

  c.push(h3('2.2.6 编号自动生成详解（ZgsqCodeGenUtil）'));
  c.push(p1('ZgsqCodeGenUtil 是自研业务编号生成器，为管廊、链路、配光组三类实体提供编号能力。核心设计：前缀固定 + 城市/管廊/链路名称 + 序列自动递增（DB 当前最大值 + 进程内 AtomicInteger 计数，双重保证不重复）。'));
  c.push(code(`// ZgsqCodeGenUtil.java — 管廊编号生成
public static String genGuanLangNo(String cityName, int dbMaxSeqNo) {
    String city = (cityName == null ? "默认市" : cityName.trim().replaceAll("\\s+", ""));
    int seq = Math.max(GL_SEQ.incrementAndGet(), dbMaxSeqNo + 1);
    String paddedSeq = padLeft(String.valueOf(seq), 4, '0');
    return "GL-" + city + "-" + paddedSeq;
}

// 链路编号生成：LL-{guanLangNo}-XX
public static String genLianLuNo(String guanLangNo, int dbMaxSeqNo) {
    int seq = Math.max(LL_SEQ.incrementAndGet(), dbMaxSeqNo + 1);
    return "LL-" + guanLangNo + "-" + padLeft(String.valueOf(seq), 2, '0');
}

// 配光组编号生成：PG-{lianLuNo}-XX
public static String genPeiGuangNo(String lianLuNo, int dbMaxSeqNo) {
    int seq = Math.max(PG_SEQ.incrementAndGet(), dbMaxSeqNo + 1);
    return "PG-" + lianLuNo + "-" + padLeft(String.valueOf(seq), 2, '0');
}

// 兜底：带 UUID 后缀的临时编号
public static String genFallbackNo(String baseNo) {
    String uuid = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
    return baseNo + "-" + uuid;
}`));

  c.push(h3('2.2.7 状态机（更新业务约束）'));
  c.push(p1('管廊状态枚举：0 正常、1 维护中、2 停用。状态切换遵循有限状态机约束，Service 层在 updateStatus 方法中内置校验逻辑：'));
  c.push(tbl([
    ['当前状态', '目标状态', '允许', '业务含义'],
    ['正常 (0)', '维护中 (1)', '是', '进入例行维护'],
    ['维护中 (1)', '正常 (0)', '是', '维护完成'],
    ['正常 (0)', '停用 (2)', '是', '紧急停用'],
    ['维护中 (1)', '停用 (2)', '否', '维护中不能直接停用'],
    ['停用 (2)', '正常 (0)', '是', '修复后恢复'],
    ['停用 (2)', '维护中 (1)', '否', '停用不能直接切维护中，需先恢复正常'],
  ]));
  c.push(code(`// GuanLangServiceImpl.updateStatus 状态机校验
public void updateStatus(GuanLangStatusDTO dto) {
    GuanLang gl = guanLangMapper.selectById(dto.getGuanLangId());
    int from = gl.getGuanLangStatus() == null ? 0 : gl.getGuanLangStatus();
    int to = dto.getTargetStatus() == null ? 0 : dto.getTargetStatus();
    // 停用不能直接切维护中
    if (from == 2 && to == 1) {
        throw new BusinessException(ErrorCode.GUANLANG_STATUS_ILLEGAL,
            "停用状态不允许直接切换到维护中，请先恢复正常状态");
    }
    // 维护中不能直接切停用
    if (from == 1 && to == 2) {
        throw new BusinessException(ErrorCode.GUANLANG_STATUS_ILLEGAL,
            "维护中状态不允许直接停用，请先恢复正常状态");
    }
    gl.setGuanLangStatus(to);
    guanLangMapper.updateById(gl);
}`));

  c.push(h3('2.2.8 巡检周期与剩余寿命（ZgsqDateUtil）'));
  c.push(p1('ZgsqDateUtil 提供三个核心计算方法：'));
  c.push(pb('calcRemainLifePercent(buildYear, designLife)：剩余寿命百分比 = 100 × (designLife − (当前年 − buildYear)) / designLife，负值归 0。'));
  c.push(pb('calcRemainLifeYears(buildYear, designLife)：剩余寿命年限，返回 Double。'));
  c.push(pb('calcNextPatrolDate(lastCheckDate, patrolFrequency)：下次巡检 = lastCheckDate + patrolFrequency 天；lastCheckDate 为 null 时取今天 + 周期。'));
  c.push(pb('isPatrolExpired(lastCheckDate, patrolFrequency)：判断巡检是否超期，供前端列表红色标签显示。'));
  c.push(code(`// ZgsqDateUtil 核心计算
public static int calcRemainLifePercent(int buildYear, int designLife) {
    int years = LocalDate.now().getYear() - buildYear;
    int remain = (int) Math.round(100.0 * (designLife - years) / designLife);
    return Math.max(0, Math.min(100, remain));
}
public static LocalDate calcNextPatrolDate(LocalDate lastCheck, int freq) {
    LocalDate base = lastCheck == null ? LocalDate.now() : lastCheck;
    return base.plusDays(freq);
}
public static boolean isPatrolExpired(LocalDate lastCheck, int freq) {
    if (lastCheck == null) return false;
    LocalDate plan = lastCheck.plusDays(freq);
    return LocalDate.now().isAfter(plan);
}`));

  c.push(h3('2.2.9 GIS 坐标（ZgsqGisUtil）'));
  c.push(p1('gis_coord 字段以 "[经度,纬度]" 格式存储 WGS84 坐标。ZgsqGisUtil 提供 Haversine 公式实现的球面距离计算，输入两个坐标串返回公里数。后续对接 GIS 地图服务时可基于此工具实现按距离聚合、范围查询等高级功能。'));
  c.push(code(`// ZgsqGisUtil Haversine 球面距离
public static double haversineDistance(String coord1, String coord2) {
    double[] c1 = parseCoord(coord1); // [经度, 纬度]
    double[] c2 = parseCoord(coord2);
    double R = 6371.0; // 地球半径 km
    double lat1 = Math.toRadians(c1[1]), lat2 = Math.toRadians(c2[1]);
    double dLat = Math.toRadians(c2[1] - c1[1]);
    double dLng = Math.toRadians(c2[0] - c1[0]);
    double a = Math.sin(dLat/2)*Math.sin(dLat/2)
             + Math.cos(lat1)*Math.cos(lat2)
             * Math.sin(dLng/2)*Math.sin(dLng/2);
    double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // 公里
}`));

  c.push(h3('2.2.10 删除保护'));
  c.push(p1('删除管廊前 Service 层调用 LianLuMapper.countByGuanLangId 校验关联链路数量。若存在链路（linkCount > 0），抛出 BusinessException 阻断删除操作并提示具体链路数量。批量删除时逐条校验，有任何一条管廊存在链路即中止并回滚事务。'));
  c.push(code(`public void deleteGuanLang(Long guanLangId) {
    GuanLang gl = guanLangMapper.selectById(guanLangId);
    int linkCount = lianLuMapper.countByGuanLangId(guanLangId);
    if (linkCount > 0) {
        throw new BusinessException(ErrorCode.GUANLANG_HAS_LIANLU,
            "管廊 " + gl.getGuanLangNo() + " 下存在 " + linkCount + " 条链路，不允许删除");
    }
    guanLangMapper.deleteById(guanLangId); // 逻辑删除
}`));

  c.push(h3('2.2.11 Excel 导入导出（GuanLangExcelUtil）'));
  c.push(p1('GuanLangExcelUtil 基于 Apache POI 实现管廊档案的 Excel 批量操作。导出模板包含全部字段表头，每行一条管廊记录；导入时逐行校验：编号格式正则 /^GL-[\\u4e00-\\u9fa5]+-\\d{4}$/、编号唯一性、必填字段非空。校验失败时收集错误行号 + 原因，返回部分成功 + 完整错误清单。'));

  c.push(h3('2.2.12 管廊模块完整接口列表'));
  c.push(tbl([
    ['接口', '方法', '路径', '功能'],
    ['管廊分页查询', 'GET', '/api/guanlang/page', '多条件 + 分页'],
    ['管廊详情', 'GET', '/api/guanlang/detail/{id}', '含 VO 状态文案 + 巡检超期标识'],
    ['新增管廊', 'POST', '/api/guanlang/add', '编号自动生成 + 寿命/巡检自动计算'],
    ['修改管廊', 'PUT', '/api/guanlang/update', 'null 语义部分更新 + 重算寿命/巡检'],
    ['删除管廊', 'DELETE', '/api/guanlang/delete', '删除前校验关联链路'],
    ['批量删除', 'POST', '/api/guanlang/batchDelete', '逐条校验 + 事务回滚'],
    ['状态切换', 'PUT', '/api/guanlang/updateStatus', '状态机校验'],
    ['导出 Excel', 'GET', '/api/guanlang/export', 'Apache POI 生成 .xlsx'],
    ['导入 Excel', 'POST', '/api/guanlang/import', '校验 + 批量入库'],
    ['按状态查询', 'GET', '/api/guanlang/listByStatus', '用于统计模块'],
  ]));

  c.push(h3('2.2.13 对应代码文件'));
  c.push(tbl([
    ['类型', '路径', '关键类/文件'],
    ['后端', 'guanlang/controller', 'GuanLangController（10 个接口）'],
    ['后端', 'guanlang/service', 'GuanLangService 接口、GuanLangServiceImpl（状态机 + 寿命 + 巡检 + 删除保护）'],
    ['后端', 'guanlang/mapper', 'GuanLangMapper（自定义 SQL：selectPageList / selectPageCount / selectMaxSeqByCity / selectByNo / selectByStatusList）'],
    ['后端', 'guanlang/entity', 'GuanLang（@TableName t_zgsq_guan_lang，22 字段）'],
    ['后端', 'guanlang/dto', 'GuanLangAddDTO、GuanLangUpdateDTO、GuanLangStatusDTO、GuanLangQueryDTO'],
    ['后端', 'guanlang/vo', 'GuanLangVO（含状态文案 statusName、巡检超期 patrolExpired、剩余年限 remainLifeYears）'],
    ['后端', 'utils', 'ZgsqCodeGenUtil、ZgsqDateUtil、ZgsqGisUtil、ZgsqDigestUtil、GuanLangExcelUtil'],
    ['前端', 'views/guanlang/', 'GuanLangIndex.vue（列表+筛选+批量）、GuanLangAdd.vue、GuanLangEdit.vue、GuanLangDetail.vue（抽屉）'],
    ['前端', 'api/', 'guanlang.js（10 个接口封装）'],
    ['前端', 'store/', 'guanlang.js（Pinia Store，存筛选条件）'],
  ]));

  // ===== 2.3 链路管理 =====
  c.push(pageBreak());
  c.push(h2('2.3 链路管理模块'));
  c.push(h3('2.3.1 功能说明'));
  c.push(p1('链路管理模块维护挂在管廊下的照明链路实体。一条管廊可包含多条链路（主干 / 支线），每条链路承载若干配光组。该模块提供完整的 CRUD 能力和按管廊 ID 的查询能力，是管廊 → 配光组中间层级的业务实体。'));

  c.push(h3('2.3.2 链路实体字段'));
  c.push(tbl([
    ['字段', '类型', '必填', '说明'],
    ['lian_lu_id', 'BIGINT', 'PK', '自增主键'],
    ['lian_lu_no', 'VARCHAR(128)', '是', '链路业务编号，格式 LL-{管廊编号}-XX，由 ZgsqCodeGenUtil.genLianLuNo 自动生成'],
    ['lian_lu_name', 'VARCHAR(128)', '是', '链路中文名称'],
    ['guan_lang_id', 'BIGINT', '是', '外键，所属管廊'],
    ['lian_lu_type', 'TINYINT', '是', '链路类型：1 主干 / 2 支线，默认 1'],
    ['total_length', 'DOUBLE', '否', '链路总长（米）'],
    ['lian_lu_status', 'TINYINT', '是', '状态：0 正常 / 1 停用，默认 0'],
    ['loop_count', 'INT', '否', '回路数量'],
    ['loop_power', 'DOUBLE', '否', '回路总功率（W）'],
    ['remark', 'VARCHAR(500)', '否', '备注'],
  ]));

  c.push(h3('2.3.3 核心操作'));
  c.push(pb('链路列表查询：GET /api/lianlu/page，支持按管廊 ID（guanLangId）、类型、状态筛选。'));
  c.push(pb('新增链路：选择所属管廊 → 系统调用 ZgsqCodeGenUtil.genLianLuNo 自动生成编号（基于管廊编号 + 序号）→ 填写链路类型、长度等字段 → 保存。'));
  c.push(pb('按管廊查询：GET /api/lianlu/listByGuanLangId/{id}，供管廊详情抽屉展示关联链路列表。'));
  c.push(pb('删除链路：删除前校验是否存在关联配光组（PeiGuangMapper.countByLianLuId），存在则拒绝删除。'));

  c.push(h3('2.3.4 链路模块接口列表'));
  c.push(tbl([
    ['接口', '方法', '路径', '功能'],
    ['链路分页', 'GET', '/api/lianlu/page', '多条件 + 分页'],
    ['按管廊查询', 'GET', '/api/lianlu/listByGuanLangId/{id}', '级联查询'],
    ['链路详情', 'GET', '/api/lianlu/detail/{id}', '单条完整信息'],
    ['新增链路', 'POST', '/api/lianlu/add', '自动生成编号 + 唯一性校验'],
    ['修改链路', 'PUT', '/api/lianlu/update', 'null 语义部分更新'],
    ['删除链路', 'DELETE', '/api/lianlu/delete', '删除前校验配光组关联'],
    ['批量删除', 'POST', '/api/lianlu/batchDelete', '逐条校验 + 事务'],
    ['状态切换', 'PUT', '/api/lianlu/updateStatus', '正常↔停用'],
  ]));

  c.push(h3('2.3.5 对应代码文件'));
  c.push(tbl([
    ['类型', '路径', '关键类/文件'],
    ['后端', 'lianlu/controller', 'LianLuController（8 个接口）'],
    ['后端', 'lianlu/service', 'LianLuService、LianLuServiceImpl（编号生成 + 删除保护）'],
    ['后端', 'lianlu/mapper', 'LianLuMapper（countByGuanLangId 供管廊删除保护用）'],
    ['后端', 'lianlu/entity', 'LianLu（@TableName t_zgsq_lian_lu，12 字段）'],
    ['后端', 'lianlu/dto', 'LianLuDTO'],
    ['后端', 'lianlu/vo', 'LianLuVO（含状态文案）'],
    ['后端', 'utils', 'ZgsqCodeGenUtil（genLianLuNo）'],
    ['前端', 'views/lianlu/', 'LianLuIndex.vue（列表 + CRUD 对话框）'],
    ['前端', 'api/', 'lianlu.js'],
  ]));

  // ===== 2.4 配光组管理 =====
  c.push(h2('2.4 配光组管理模块'));
  c.push(h3('2.4.1 功能说明'));
  c.push(p1('配光组是照明调度的最小物理单元，每条链路下可配置多个配光组。配光组记录灯具数量、单灯功率、总功率（自动计算）、配光方式（对称/交错/单侧）、亮度等级等信息，为定时调度模块提供精准的调光控制依据。'));

  c.push(h3('2.4.2 核心特性'));
  c.push(pb('双层关联：lianLuId 作为主外键（链路线），guanLangId 作为冗余外键（管廊线），便于跨层级聚合查询。'));
  c.push(pb('配光类型三选一：对称布置（双侧对称）、交错布置（双侧错位）、单侧布置（仅一侧）。'));
  c.push(pb('总功率自动计算：totalPower = lampCount × singleLampPower，Service 层新增/修改时自动回填，前端用户修改时实时回显。'));
  c.push(pb('亮度等级：brightLevel 范围 0-100（%），默认 80，定时调度时作为亮灯亮度基准。'));

  c.push(h3('2.4.3 字段说明'));
  c.push(tbl([
    ['字段', '类型', '说明'],
    ['pei_guang_no', 'VARCHAR(128)', '编号 PG-{链路编号}-XX（ZgsqCodeGenUtil.genPeiGuangNo）'],
    ['pei_guang_name', 'VARCHAR(128)', '配光组名称'],
    ['lian_lu_id', 'BIGINT', '所属链路 ID'],
    ['guan_lang_id', 'BIGINT', '冗余所属管廊 ID'],
    ['pei_guang_type', 'TINYINT', '1 对称 / 2 交错 / 3 单侧'],
    ['lamp_count', 'INT', '灯具数量'],
    ['single_lamp_power', 'DOUBLE', '单灯功率（W）'],
    ['total_power', 'DOUBLE', '总功率，自动计算 lamp_count × single_lamp_power'],
    ['bright_level', 'INT', '亮度等级 %，默认 80'],
    ['pei_guang_status', 'TINYINT', '0 正常 / 1 停用'],
  ]));

  c.push(h3('2.4.4 配光组模块接口列表'));
  c.push(tbl([
    ['接口', '方法', '路径', '功能'],
    ['配光组分页', 'GET', '/api/peiguang/page', '多条件 + 分页'],
    ['按链路查询', 'GET', '/api/peiguang/listByLianLuId/{id}', '级联查询'],
    ['按管廊查询', 'GET', '/api/peiguang/listByGuanLangId/{id}', '跨层级聚合'],
    ['新增配光组', 'POST', '/api/peiguang/add', '自动生成编号 + 总功率自动计算'],
    ['修改配光组', 'PUT', '/api/peiguang/update', '修改后重算总功率'],
    ['删除配光组', 'DELETE', '/api/peiguang/delete', '逻辑删除'],
    ['批量删除', 'POST', '/api/peiguang/batchDelete', '批量逻辑删除'],
    ['状态切换', 'PUT', '/api/peiguang/updateStatus', '正常↔停用'],
  ]));

  c.push(h3('2.4.5 对应代码文件'));
  c.push(tbl([
    ['类型', '路径', '关键类/文件'],
    ['后端', 'peiguang/controller', 'PeiGuangController（8 个接口）'],
    ['后端', 'peiguang/service', 'PeiGuangService、PeiGuangServiceImpl（总功率自动计算、guanLangId 冗余赋值）'],
    ['后端', 'peiguang/mapper', 'PeiGuangMapper（countByLianLuId 供链路删除保护用）'],
    ['后端', 'peiguang/entity', 'PeiGuang（@TableName t_zgsq_pei_guang，13 字段）'],
    ['后端', 'peiguang/dto', 'PeiGuangDTO'],
    ['后端', 'peiguang/vo', 'PeiGuangVO'],
    ['后端', 'utils', 'ZgsqCodeGenUtil（genPeiGuangNo）'],
    ['前端', 'views/peiguang/', 'PeiGuangIndex.vue'],
    ['前端', 'api/', 'peiguang.js'],
  ]));

  // ===== 2.5 定时调度 =====
  c.push(h2('2.5 定时调度模块'));
  c.push(h3('2.5.1 功能说明'));
  c.push(p1('定时调度模块是智光云枢实现照明自动化的核心引擎。运维人员通过配置 Cron 表达式、启停时间、亮灯/关灯亮度等级，实现照明系统的无人值守自动管控。每次调度执行后，系统自动记录执行时间与执行结果，便于事后审计和问题排查。'));

  c.push(h3('2.5.2 核心特性'));
  c.push(pb('Cron 表达式调度：cronExpr 字段采用 Spring Scheduler 6 位格式（秒 分 时 日 月 周），如 "0 0 18 * * ?" 表示每天 18:00 执行。'));
  c.push(pb('启停控制：dingShiStatus（0 启用 / 1 禁用），前端提供开关组件，后端提供 PUT /api/dingshi/toggle 接口快速切换，禁用后调度不触发。'));
  c.push(pb('执行记录：每次执行后回填 lastExecuteTime 和 lastExecuteResult（SUCCESS / FAIL:xxx），供运维排查问题。'));
  c.push(pb('亮度分级：brightLevelOn（开灯亮度 %）默认 80，brightLevelOff（关灯亮度 %）默认 0。'));
  c.push(pb('生效时间窗：startTime / endTime 限定调度的有效期，过期自动跳过，无需手动禁用。'));

  c.push(h3('2.5.3 字段说明'));
  c.push(tbl([
    ['字段', '类型', '说明'],
    ['ding_shi_id', 'BIGINT', '调度主键'],
    ['ding_shi_name', 'VARCHAR(128)', '调度名称，如"冬季晚高峰开灯"'],
    ['lian_lu_id', 'BIGINT', '关联链路 ID'],
    ['guan_lang_id', 'BIGINT', '冗余管廊 ID'],
    ['cron_expr', 'VARCHAR(64)', 'Spring 6 位 Cron 表达式'],
    ['bright_level_on', 'INT', '开灯亮度 %，默认 80'],
    ['bright_level_off', 'INT', '关灯亮度 %，默认 0'],
    ['start_time', 'TIME', '生效开始 HH:mm:ss'],
    ['end_time', 'TIME', '生效结束 HH:mm:ss'],
    ['ding_shi_status', 'TINYINT', '0 启用 / 1 禁用'],
    ['last_execute_time', 'DATETIME', '上次执行时间（自动回填）'],
    ['last_execute_result', 'VARCHAR(255)', '上次执行结果（SUCCESS / FAIL）'],
  ]));

  c.push(h3('2.5.4 Cron 表达式示例'));
  c.push(tbl([
    ['需求', '表达式', '说明'],
    ['每天 18:00 开灯', '0 0 18 * * ?', '秒 分 时 日 月 周'],
    ['每天 06:00 关灯', '0 0 6 * * ?', '-'],
    ['工作日 19:30 开灯', '0 30 19 ? * MON-FRI', '周一到周五'],
    ['每 30 分钟巡检', '0 0/30 * * * ?', '0,30 分钟触发'],
    ['每天 23:00 低亮度', '0 0 23 * * ?', '配合 brightLevelOn=20 实现节能模式'],
  ]));

  c.push(h3('2.5.5 定时调度模块接口列表'));
  c.push(tbl([
    ['接口', '方法', '路径', '功能'],
    ['调度分页', 'GET', '/api/dingshi/page', '多条件 + 分页'],
    ['调度详情', 'GET', '/api/dingshi/detail/{id}', '单条完整信息'],
    ['新增调度', 'POST', '/api/dingshi/add', '创建调度规则'],
    ['修改调度', 'PUT', '/api/dingshi/update', '编辑调度规则'],
    ['删除调度', 'DELETE', '/api/dingshi/delete', '逻辑删除'],
    ['批量删除', 'POST', '/api/dingshi/batchDelete', '批量删除'],
    ['启停切换', 'PUT', '/api/dingshi/toggle', '快速切换启用/禁用'],
  ]));

  c.push(h3('2.5.6 对应代码文件'));
  c.push(tbl([
    ['类型', '路径', '关键类/文件'],
    ['后端', 'dingshi/controller', 'DingShiController（7 个接口）'],
    ['后端', 'dingshi/service', 'DingShiService、DingShiServiceImpl（toggle 切换、执行记录回填）'],
    ['后端', 'dingshi/mapper', 'DingShiMapper'],
    ['后端', 'dingshi/entity', 'DingShi（@TableName t_zgsq_ding_shi，15 字段）'],
    ['后端', 'dingshi/dto', 'DingShiDTO'],
    ['后端', 'dingshi/vo', 'DingShiVO'],
    ['前端', 'views/dingshi/', 'DingShiIndex.vue（含 Cron 表达式提示、开关组件）'],
    ['前端', 'api/', 'dingshi.js'],
  ]));

  // ===== 2.6 数据统计 =====
  c.push(pageBreak());
  c.push(h2('2.6 数据统计模块'));
  c.push(h3('2.6.1 功能说明'));
  c.push(p1('数据统计模块为管理者提供全局业务视图，支撑"管廊总数、链路总数、配光组总数、启用调度数、今日告警数、维护中管廊数"六项核心指标。所有统计查询通过 StatMapper 自定义 SQL 实现，避免全表扫描。Dashboard.vue 以卡片 + 图表形式一屏展示全部指标。'));

  c.push(h3('2.6.2 工作台 Dashboard 六项指标'));
  c.push(tbl([
    ['指标', '统计口径', 'SQL 来源表'],
    ['管廊总数', 'COUNT(*) WHERE deleted = 0', 't_zgsq_guan_lang'],
    ['链路总数', 'COUNT(*) WHERE deleted = 0', 't_zgsq_lian_lu'],
    ['配光组总数', 'COUNT(*) WHERE deleted = 0', 't_zgsq_pei_guang'],
    ['启用调度数', 'COUNT(*) WHERE ding_shi_status = 0', 't_zgsq_ding_shi'],
    ['今日告警数', '预留扩展（可关联 op_log 或告警表）', '-'],
    ['维护中管廊数', 'COUNT(*) WHERE guan_lang_status = 1', 't_zgsq_guan_lang'],
  ]));

  c.push(h3('2.6.3 分组统计'));
  c.push(pb('按行政区分组：SELECT belong_district, COUNT(*) FROM t_zgsq_guan_lang WHERE deleted=0 GROUP BY belong_district，返回 [{ district, count }] 列表，饼图展示。'));
  c.push(pb('按状态分组：SELECT guan_lang_status, COUNT(*) FROM t_zgsq_guan_lang WHERE deleted=0 GROUP BY guan_lang_status，Service 层附加状态文案映射，柱状图展示。'));
  c.push(pb('按建造年份分组：用于寿命分布分析，柱状图展示不同年份管廊数量。'));

  c.push(h3('2.6.4 统计接口'));
  c.push(tbl([
    ['接口', '方法', '路径', '功能'],
    ['Dashboard 总览', 'GET', '/api/stat/dashboard', '返回 6 项核心指标'],
    ['按行政区统计', 'GET', '/api/stat/byDistrict', '分组列表'],
    ['按状态统计', 'GET', '/api/stat/byStatus', '分组列表'],
    ['按年份统计', 'GET', '/api/stat/byBuildYear', '寿命分布'],
  ]));

  c.push(h3('2.6.5 对应代码文件'));
  c.push(tbl([
    ['类型', '路径', '关键类/文件'],
    ['后端', 'stat/controller', 'StatController（4 个接口）'],
    ['后端', 'stat/service', 'StatService、StatServiceImpl'],
    ['后端', 'stat/mapper', 'StatMapper（自定义 @Select 注解 SQL）'],
    ['后端', 'stat/vo', 'StatVO（DashboardStatVO、GroupStatVO）'],
    ['前端', 'views/dashboard/', 'Dashboard.vue（指标卡片 + 分组图表，ECharts 饼图/柱状图）'],
    ['前端', 'api/', 'tongji.js（统计接口封装）'],
  ]));

  // ===== 2.7 操作日志 =====
  c.push(h2('2.7 操作日志模块'));
  c.push(h3('2.7.1 功能说明'));
  c.push(p1('操作日志模块通过 AOP 自动采集全系统的用户操作行为。LogAspect 使用 @Around 环绕通知拦截所有 Controller 方法，自动记录操作人、操作模块、入参、出参、耗时、执行结果等信息，业务代码无需显式埋点即可实现全链路可追溯。'));

  c.push(h3('2.7.2 AOP 切面设计'));
  c.push(p1('LogAspect 切点表达式：execution(* com.zgsq.illumination..*Controller.*(..))，即匹配包下所有以 Controller 结尾的类的所有 public 方法。切面内部分五步完成日志采集：'));
  c.push(pb('步骤一：方法签名解析 — 通过 ProceedingJoinPoint.getTarget() 获取 Controller 类名，通过 MethodSignature.getName() 获取方法名。'));
  c.push(pb('步骤二：模块/动作推断 — inferModule 方法硬编码映射表（如 GuanLangController → 管廊管理），inferAction 方法基于方法名关键字（add→新增、update→修改、delete→删除）推断操作动作。'));
  c.push(pb('步骤三：请求上下文获取 — 通过 RequestContextHolder 获取 HttpServletRequest，读取 LoginInterceptor 写入的 CURRENT_USER_NAME attribute 和真实客户端 IP（支持 X-Forwarded-For / X-Real-IP / 多级代理）。'));
  c.push(pb('步骤四：入参序列化 — 使用 Jackson ObjectMapper.writeValueAsString 序列化方法参数，失败时退化为 Arrays.deepToString。'));
  c.push(pb('步骤五：执行并记录 — 调用 proceed() 执行原方法，捕获异常、计算耗时，异步写入 t_zgsq_op_log 表（new Thread 避免阻塞主接口响应）。'));

  c.push(h3('2.7.3 LogAspect 完整代码'));
  c.push(code(`@Aspect
@Component
public class LogAspect {

    private final ObjectMapper objectMapper = new ObjectMapper();
    @Autowired private OpLogMapper opLogMapper;

    @Around("execution(* com.zgsq.illumination..*Controller.*(..))")
    public Object aroundController(ProceedingJoinPoint pjp) throws Throwable {
        long startMs = System.currentTimeMillis();
        MethodSignature sig = (MethodSignature) pjp.getSignature();
        String className = pjp.getTarget().getClass().getSimpleName();
        String methodName = sig.getName();

        String opModule = inferModule(className);
        String opAction = inferAction(methodName);

        ServletRequestAttributes attrs = (ServletRequestAttributes)
            RequestContextHolder.getRequestAttributes();
        HttpServletRequest request = attrs == null ? null : attrs.getRequest();
        String opIp = request == null ? "-" : resolveClientIp(request);
        String opUser = request == null ? "-" :
            (String) request.getAttribute(LoginInterceptor.CURRENT_USER_NAME);
        if (opUser == null) opUser = "-";

        String opContent = serializeArgs(pjp.getArgs());
        Object result = null; Throwable ex = null;
        try { result = pjp.proceed(); } catch (Throwable t) { ex = t; }
        long costMs = System.currentTimeMillis() - startMs;

        OpLog log = new OpLog();
        log.setOpModule(opModule); log.setOpAction(opAction);
        log.setOpUserName(opUser); log.setOpIp(opIp);
        log.setOpContent(opContent); log.setOpTime(LocalDateTime.now());
        log.setCostMs(costMs);
        log.setOpResult(ex == null ? "SUCCESS" : "FAIL:" + shortMessage(ex));

        // 异步写日志，避免拖慢主接口
        new Thread(() -> {
            try { opLogMapper.insert(log); }
            catch (Exception ignored) {}
        }, "oplog-writer").start();

        if (ex != null) throw ex;
        return result;
    }

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
    private String resolveClientIp(HttpServletRequest r) { /* ... 见完整源码 ... */ return null; }
    private String serializeArgs(Object[] args) { /* Jackson → String */ return null; }
    private String shortMessage(Throwable t) { return t.getMessage() == null ? "" : t.getMessage().substring(0, Math.min(200, t.getMessage().length())); }
}`));

  c.push(h3('2.7.4 操作日志查询页面'));
  c.push(p1('OpLogIndex.vue 提供日志列表页面，顶部筛选区支持按操作模块、操作动作、操作人、时间范围（开始/结束日期）进行多维筛选。数据表格展示字段：操作时间、操作人、模块、动作、目标 ID、客户端 IP、执行结果（SUCCESS 绿色 / FAIL 红色）、耗时（毫秒）。每行提供"详情"按钮，点击弹出 Dialog 展示完整入参 JSON 和出参 JSON。'));

  c.push(h3('2.7.5 日志查询接口'));
  c.push(tbl([
    ['接口', '方法', '路径', '功能'],
    ['日志分页查询', 'GET', '/api/oplog/page', '多条件 + 时间范围筛选'],
    ['日志详情', 'GET', '/api/oplog/detail/{id}', '完整入参/出参查看'],
  ]));

  c.push(h3('2.7.6 对应代码文件'));
  c.push(tbl([
    ['类型', '路径', '关键类/文件'],
    ['后端', 'config/', 'LogAspect（AOP 切面，@Around 拦截 Controller，异步写入）'],
    ['后端', 'oplog/controller', 'OpLogController（日志查询接口）'],
    ['后端', 'oplog/service', 'OpLogService、OpLogServiceImpl'],
    ['后端', 'oplog/mapper', 'OpLogMapper'],
    ['后端', 'oplog/entity', 'OpLog（@TableName t_zgsq_op_log，11 字段）'],
    ['后端', 'oplog/dto', 'OpLogDTO'],
    ['后端', 'oplog/vo', 'OpLogVO'],
    ['前端', 'views/oplog/', 'OpLogIndex.vue'],
    ['前端', 'api/', 'oplog.js'],
  ]));

  return c;
}

// ============ 第3章 技术架构 ============
function ch3() {
  const c = [];
  c.push(pageBreak());
  c.push(h1('第3章 技术架构'));
  c.push(p1('本章详细阐述系统采用的前后端技术栈、统一通信协议、异常处理机制和安全防护方案，是技术人员理解和二次开发的核心参考。'));

  c.push(h2('3.1 后端技术选型'));
  c.push(tbl([
    ['技术', '版本', '用途'],
    ['SpringBoot', '2.7.18', '核心框架，Starter 依赖管理、内嵌 Tomcat、自动装配'],
    ['MyBatis-Plus', '3.5.3.1', '持久层增强：BaseMapper、IService、PaginationInnerInterceptor、逻辑删除、自动填充'],
    ['MySQL', '5.7', '关系型数据库，InnoDB 引擎，utf8mb4 字符集'],
    ['Lombok', '-', '编译时注解 @Data @Builder @Slf4j 减少样板代码'],
    ['Spring AOP', '5.x', '操作日志切面（LogAspect）'],
    ['Jackson', '-', 'Spring Boot 内置 JSON 序列化（LogAspect 入参/出参采集）'],
    ['Apache POI', '5.x', '管廊档案 Excel 导入导出（GuanLangExcelUtil）'],
    ['Spring Validation', '-', '@Validated 注解实现 DTO 字段校验'],
    ['Spring MVC', '5.3.x', 'RESTful 接口暴露，自动 JSON 序列化'],
  ]));

  c.push(h2('3.2 前端技术选型'));
  c.push(tbl([
    ['技术', '版本', '用途'],
    ['Vue', '3.2.x', '渐进式框架，Composition API（setup + ref + reactive）'],
    ['Vue Router', '4.x', 'SPA 路由管理，全局 beforeEach 守卫实现 Token 检查'],
    ['Element Plus', '2.x', '企业级 UI：Table / Form / Dialog / Drawer / Switch / Pagination'],
    ['Pinia', '2.x', 'Vue 3 官方状态管理，替代 Vuex'],
    ['Vite', '4.x', 'esbuild 极速冷启动 + Rollup 生产构建'],
    ['Axios', '1.x', 'HTTP 客户端，统一拦截器'],
    ['ECharts', '5.x', 'Dashboard 数据可视化（饼图、柱状图）'],
    ['dayjs', '-', '日期处理，dayjs(date).format(...)'],
  ]));

  c.push(h2('3.3 统一返回格式 Result<T>'));
  c.push(p1('后端所有 Controller 方法返回 Result<T> 对象，确保前后端对接一致。字段含义：'));
  c.push(tbl([
    ['字段', '类型', '含义'],
    ['code', 'int', '业务状态码，200=成功，其它=错误'],
    ['message', 'String', '提示文本，直接展示给用户'],
    ['data', '泛型 T', '业务数据：可为 VO / List / PageResult / null'],
  ]));
  c.push(code(`// Result.java 完整结构
public class Result<T> implements Serializable {
    private int code;         // 业务状态码
    private String message;   // 提示信息
    private T data;           // 业务数据
    public static <T> Result ok(T data) { return new Result<>(200, "操作成功", data); }
    public static <T> Result fail(int code, String message) { return new Result<>(code, message, null); }
}

// 成功响应示例
{ "code": 200, "message": "操作成功", "data": { "guanLangId": 1 } }
// 失败响应示例
{ "code": 40001, "message": "管廊编号不能为空", "data": null }
// 分页响应 data 结构
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "records": [ /* VO 列表 */ ],
    "total": 47,
    "current": 1,
    "size": 10,
    "pages": 5
  }
}`));

  c.push(h2('3.4 全局异常处理 GlobalExceptionHandler'));
  c.push(p1('使用 @RestControllerAdvice + @ExceptionHandler 拦截 Controller 层所有异常，统一转换为 Result 响应体返回给前端，避免直接抛出堆栈。处理优先级（精确到宽泛）：'));
  c.push(tbl([
    ['异常类型', 'HTTP 状态', '业务 code', '处理方式'],
    ['UnauthorizedException', '401', '-', '返回 401 JSON，前端跳登录'],
    ['BusinessException', '200', '自定义 code', '直接返回 Result(code, msg)'],
    ['MethodArgumentNotValidException', '200', '40001', '拼接字段校验错误信息'],
    ['BindException', '200', '40001', '拼接表单校验错误'],
    ['MissingServletRequestParameterException', '200', '40001', '提示缺少哪个参数'],
    ['Exception（兜底）', '200', '50000', '打 ERROR 日志，返回通用错误'],
  ]));
  c.push(code(`@RestControllerAdvice(basePackages = "com.zgsq.illumination")
public class GlobalExceptionHandler {

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<Result<Void>> handleUnauthorized(UnauthorizedException e, HttpServletRequest req) {
        log.warn("[权限] {} - {}", req.getRequestURI(), e.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(Result.fail(e.getMessage()));
    }

    @ExceptionHandler(BusinessException.class)
    public Result<Void> handleBusiness(BusinessException e, HttpServletRequest req) {
        log.warn("[业务] code={}, msg={}", e.getCode(), e.getMessage());
        return Result.fail(e.getCode(), e.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result<Void> handleValid(MethodArgumentNotValidException e) {
        String msg = e.getBindingResult().getFieldErrors().stream()
            .map(fe -> fe.getField() + ":" + fe.getDefaultMessage())
            .collect(Collectors.joining("; "));
        return Result.fail(ErrorCode.PARAM_INVALID.getCode(), msg);
    }

    @ExceptionHandler(Exception.class)
    public Result<Void> handleUnknown(Exception e, HttpServletRequest req) {
        log.error("[系统异常] uri={}", req.getRequestURI(), e);
        return Result.fail(ErrorCode.SYSTEM_INTERNAL_ERROR);
    }
}`));

  c.push(h2('3.5 错误码体系 ErrorCode'));
  c.push(tbl([
    ['错误码', '枚举常量', '含义'],
    ['200', 'CODE_OK', '操作成功'],
    ['40001', 'PARAM_INVALID', '参数校验失败'],
    ['40002', 'LOGIN_FAIL', '用户名或密码错误'],
    ['40100', 'TOKEN_MISSING', '未携带 Token'],
    ['40101', 'TOKEN_INVALID', 'Token 无效'],
    ['40301', 'USER_DISABLED', '用户已被禁用'],
    ['40401', 'GUANLANG_NOT_FOUND', '管廊不存在'],
    ['40402', 'USER_NOT_FOUND', '用户不存在'],
    ['40403', 'ROLE_NOT_FOUND', '角色不存在'],
    ['50001', 'GUANLANG_NO_DUPLICATE', '管廊编号已存在'],
    ['50002', 'GUANLANG_HAS_LIANLU', '管廊下存在链路，不允许删除'],
    ['50003', 'GUANLANG_STATUS_ILLEGAL', '状态切换非法'],
    ['50004', 'SYSTEM_INTERNAL_ERROR', '系统内部错误'],
  ]));

  c.push(h2('3.6 拦截器机制 WebMvcConfig + LoginInterceptor'));
  c.push(p1('WebMvcConfig 实现 WebMvcConfigurer，在 addInterceptors 方法中注册 LoginInterceptor，配置拦截范围 /api/** 和白名单（登录接口等免鉴权）：'));
  c.push(code(`// WebMvcConfig.java
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
    @Autowired private LoginInterceptor loginInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(loginInterceptor)
            .addPathPatterns("/api/**")          // 拦截范围
            .excludePathPatterns(                 // 白名单
                "/api/user/login",
                "/api/user/register",
                "/api/error"
            );
    }
}`));

  c.push(h2('3.7 MyBatis-Plus 配置'));
  c.push(p1('MybatisPlusConfig 注册 PaginationInnerInterceptor（物理分页）和配置 @MapperScan 扫描范围。所有 Entity 使用 @TableName 指定物理表名，使用 @TableLogic 标记逻辑删除字段，使用 @TableField 标注字段与列名映射。'));

  c.push(h2('3.8 前端 Axios 拦截器（api/request.js）'));
  c.push(p1('Axios 实例 baseURL 从 .env 读取，创建后注册请求拦截器和响应拦截器：'));
  c.push(code(`// src/api/request.js
import axios from 'axios';
import { ElMessage } from 'element-plus';
import router from '@/router';

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
});

// 请求拦截器：注入 Token
request.interceptors.request.use(config => {
  const token = localStorage.getItem('zgsq_token');
  if (token) {
    config.headers['X-Zgsq-Token'] = token;
  }
  config.headers['Content-Type'] = 'application/json;charset=UTF-8';
  return config;
});

// 响应拦截器：统一解包 Result<T>
request.interceptors.response.use(
  resp => {
    const res = resp.data;
    if (res.code === 200) {
      return res.data;   // 直接返回 data 字段
    } else if (res.code === 401) {
      localStorage.removeItem('zgsq_token');
      ElMessage.error('登录已过期，请重新登录');
      router.push('/login');
      return Promise.reject(res);
    } else {
      ElMessage.error(res.message || '请求失败');
      return Promise.reject(res);
    }
  },
  err => {
    ElMessage.error(err.message || '网络异常');
    return Promise.reject(err);
  }
);
export default request;`));

  return c;
}

// ============ 第4章 数据库设计 ============
function ch4() {
  const c = [];
  c.push(pageBreak());
  c.push(h1('第4章 数据库设计'));
  c.push(p1('系统使用 MySQL 5.7 作为持久化存储，所有表和字段均包含中文 COMMENT。本节基于 /workspace/zgsq-backend/sql/schema.sql 完整说明。数据库名为 zgsq_illumination，默认字符集 utf8mb4。'));

  c.push(h2('4.1 整体 ER 关系描述'));
  c.push(p1('数据库包含 7 张表，核心实体关系如下：'));
  c.push(pb('用户 → 角色：多对一（t_zgsq_user.role_id → t_zgsq_role.role_id）。一个角色可分配给多个用户，一个用户只有一个角色。'));
  c.push(pb('管廊 → 链路：一对多（t_zgsq_lian_lu.guan_lang_id → t_zgsq_guan_lang.guan_lang_id）。一条管廊包含多条链路（主干/支线）。'));
  c.push(pb('链路 → 配光组：一对多（t_zgsq_pei_guang.lian_lu_id → t_zgsq_lian_lu.lian_lu_id）。一条链路下配置多个配光组（调度最小单元）。'));
  c.push(pb('管廊 → 配光组：一对多冗余（t_zgsq_pei_guang.guan_lang_id 冗余外键，便于跨层级聚合查询而无需 JOIN）。'));
  c.push(pb('链路 → 定时调度：一对多（t_zgsq_ding_shi.lian_lu_id → t_zgsq_lian_lu.lian_lu_id）。每条链路可配置多个调度规则。'));
  c.push(pb('操作日志：独立表，op_user_name 与用户表关联查询，不使用外键约束以提升写入性能。'));

  c.push(p1('所有业务表采用统一的逻辑删除设计：deleted TINYINT DEFAULT 0（0=未删除，1=已删除）。唯一索引使用 (业务字段, deleted) 联合约束，允许软删除后重新创建同编号记录。所有删除操作在 Service 层调用 mapper.deleteById 时由 MyBatis-Plus 的 @TableLogic 自动转为 UPDATE deleted=1。'));

  c.push(h2('4.2 核心表字段说明'));

  c.push(h3('4.2.1 管廊表 t_zgsq_guan_lang（22 字段，核心表）'));
  c.push(tbl([
    ['字段名', '类型', '约束', '中文注释'],
    ['guan_lang_id', 'BIGINT', 'PK, AUTO_INCREMENT', '管廊主键 ID'],
    ['guan_lang_no', 'VARCHAR(64)', 'NOT NULL, UNIQUE(+deleted)', '业务编号，格式 GL-{市名}-XXXX'],
    ['guan_lang_name', 'VARCHAR(128)', 'NOT NULL', '中文名称'],
    ['tunnel_length', 'DOUBLE', '-', '总长度（米）'],
    ['guan_lang_status', 'TINYINT', 'NOT NULL, DEFAULT 0', '0 正常 / 1 维护中 / 2 停用'],
    ['belong_district', 'VARCHAR(64)', '-', '所属行政区'],
    ['maintain_unit', 'VARCHAR(128)', '-', '运维单位'],
    ['build_year', 'INT', '-', '建造年份'],
    ['design_life', 'INT', 'DEFAULT 50', '设计寿命（年）'],
    ['last_check_date', 'DATE', '-', '上次巡检日期'],
    ['remain_life_percent', 'INT', 'DEFAULT 100', '剩余寿命 %（Service 自动计算）'],
    ['patrol_frequency', 'INT', 'DEFAULT 30', '巡检频率（天）'],
    ['last_patrol_result', 'VARCHAR(255)', '-', '上次巡检结果'],
    ['next_patrol_plan', 'DATE', '-', '下次巡检计划（Service 自动计算）'],
    ['gis_coord', 'VARCHAR(64)', '-', 'GIS 坐标 "[经度,纬度]" WGS84'],
    ['monitor_point_id', 'VARCHAR(64)', '-', 'IoT 监测点 ID（预留）'],
    ['create_time', 'DATETIME', 'DEFAULT CURRENT_TIMESTAMP', '创建时间'],
    ['update_time', 'DATETIME', 'ON UPDATE CURRENT_TIMESTAMP', '更新时间'],
    ['remark', 'VARCHAR(500)', '-', '备注'],
    ['deleted', 'TINYINT', 'NOT NULL, DEFAULT 0', '0 未删 / 1 已删'],
  ]));
  c.push(pb('索引：PRIMARY KEY(guan_lang_id)、UNIQUE KEY(guan_lang_no, deleted)、INDEX(guan_lang_status)、INDEX(belong_district)。'));
  c.push(pb('ENGINE=InnoDB, CHARSET=utf8mb4, COMMENT="地下综合管廊表（核心）"。'));

  c.push(h3('4.2.2 链路表 t_zgsq_lian_lu（12 字段）'));
  c.push(tbl([
    ['字段名', '类型', '约束', '中文注释'],
    ['lian_lu_id', 'BIGINT', 'PK, AUTO_INCREMENT', '链路主键'],
    ['lian_lu_no', 'VARCHAR(128)', 'NOT NULL, UNIQUE(+deleted)', '编号 LL-{管廊编号}-XX'],
    ['lian_lu_name', 'VARCHAR(128)', 'NOT NULL', '链路名称'],
    ['guan_lang_id', 'BIGINT', 'NOT NULL', '所属管廊（外键逻辑）'],
    ['lian_lu_type', 'TINYINT', 'DEFAULT 1', '1 主干 / 2 支线'],
    ['total_length', 'DOUBLE', '-', '总长（米）'],
    ['lian_lu_status', 'TINYINT', 'DEFAULT 0', '0 正常 / 1 停用'],
    ['loop_count', 'INT', '-', '回路数量'],
    ['loop_power', 'DOUBLE', '-', '回路总功率（W）'],
    ['create_time', 'DATETIME', 'DEFAULT CURRENT_TIMESTAMP', '创建时间'],
    ['deleted', 'TINYINT', 'DEFAULT 0', '逻辑删除'],
  ]));
  c.push(pb('索引：PRIMARY KEY、UNIQUE(lian_lu_no, deleted)、INDEX(guan_lang_id)。'));

  c.push(h3('4.2.3 配光组表 t_zgsq_pei_guang（13 字段）'));
  c.push(tbl([
    ['字段名', '类型', '约束', '中文注释'],
    ['pei_guang_id', 'BIGINT', 'PK, AUTO_INCREMENT', '配光组主键'],
    ['pei_guang_no', 'VARCHAR(128)', 'NOT NULL, UNIQUE(+deleted)', '编号 PG-{链路编号}-XX'],
    ['pei_guang_name', 'VARCHAR(128)', 'NOT NULL', '配光组名称'],
    ['lian_lu_id', 'BIGINT', 'NOT NULL', '所属链路'],
    ['guan_lang_id', 'BIGINT', '-', '冗余管廊 ID'],
    ['pei_guang_type', 'TINYINT', 'DEFAULT 1', '1 对称 / 2 交错 / 3 单侧'],
    ['lamp_count', 'INT', '-', '灯具数量'],
    ['single_lamp_power', 'DOUBLE', '-', '单灯功率（W）'],
    ['total_power', 'DOUBLE', '-', '总功率 = lamp_count × single_lamp_power'],
    ['bright_level', 'INT', 'DEFAULT 80', '亮度等级 %'],
    ['pei_guang_status', 'TINYINT', 'DEFAULT 0', '0 正常 / 1 停用'],
    ['create_time', 'DATETIME', 'DEFAULT CURRENT_TIMESTAMP', '创建时间'],
    ['deleted', 'TINYINT', 'DEFAULT 0', '逻辑删除'],
  ]));
  c.push(pb('索引：PRIMARY KEY、UNIQUE(pei_guang_no, deleted)、INDEX(lian_lu_id)、INDEX(guan_lang_id)。'));

  c.push(h3('4.2.4 定时调度表 t_zgsq_ding_shi（15 字段）'));
  c.push(tbl([
    ['字段名', '类型', '约束', '中文注释'],
    ['ding_shi_id', 'BIGINT', 'PK, AUTO_INCREMENT', '调度主键'],
    ['ding_shi_name', 'VARCHAR(128)', 'NOT NULL', '调度名称'],
    ['lian_lu_id', 'BIGINT', 'NOT NULL', '关联链路'],
    ['guan_lang_id', 'BIGINT', '-', '冗余管廊 ID'],
    ['cron_expr', 'VARCHAR(64)', 'NOT NULL', 'Spring 6 位 Cron'],
    ['bright_level_on', 'INT', 'DEFAULT 80', '开灯亮度 %'],
    ['bright_level_off', 'INT', 'DEFAULT 0', '关灯亮度 %'],
    ['start_time', 'TIME', '-', '生效开始'],
    ['end_time', 'TIME', '-', '生效结束'],
    ['ding_shi_status', 'TINYINT', 'DEFAULT 0', '0 启用 / 1 禁用'],
    ['last_execute_time', 'DATETIME', '-', '上次执行时间'],
    ['last_execute_result', 'VARCHAR(255)', '-', '执行结果'],
    ['create_time', 'DATETIME', 'DEFAULT CURRENT_TIMESTAMP', '创建时间'],
    ['update_time', 'DATETIME', 'ON UPDATE', '更新时间'],
    ['remark', 'VARCHAR(500)', '-', '备注'],
  ]));
  c.push(pb('注意：定时调度表无 deleted 字段，删除时使用物理删除（业务上不恢复）。'));

  c.push(h3('4.2.5 用户表 t_zgsq_user'));
  c.push(tbl([
    ['字段', '类型', '注释'],
    ['user_id', 'BIGINT PK AUTO_INCREMENT', '用户主键'],
    ['user_name', 'VARCHAR(64) NOT NULL', '登录账号，唯一'],
    ['user_password', 'VARCHAR(128) NOT NULL', '登录密码，MD5+盐加密'],
    ['user_real_name', 'VARCHAR(64)', '真实姓名'],
    ['user_phone', 'VARCHAR(32)', '手机号'],
    ['user_email', 'VARCHAR(128)', '邮箱'],
    ['role_id', 'BIGINT', '关联角色 ID'],
    ['user_status', 'TINYINT DEFAULT 0', '0 启用 / 1 禁用'],
    ['create_time', 'DATETIME DEFAULT CURRENT_TIMESTAMP', '创建时间'],
    ['deleted', 'TINYINT DEFAULT 0', '逻辑删除'],
  ]));
  c.push(pb('索引：PRIMARY KEY、UNIQUE(user_name, deleted)、INDEX(role_id)、INDEX(user_status)。'));

  c.push(h3('4.2.6 角色表 t_zgsq_role'));
  c.push(tbl([
    ['字段', '类型', '注释'],
    ['role_id', 'BIGINT PK AUTO_INCREMENT', '角色主键'],
    ['role_name', 'VARCHAR(64) NOT NULL', '角色中文名称，如 超级管理员'],
    ['role_code', 'VARCHAR(64) NOT NULL', '唯一编码，如 ADMIN / OPERATOR'],
    ['role_desc', 'VARCHAR(255)', '角色描述'],
    ['role_status', 'TINYINT DEFAULT 0', '0 启用 / 1 禁用'],
    ['create_time', 'DATETIME DEFAULT CURRENT_TIMESTAMP', '创建时间'],
    ['deleted', 'TINYINT DEFAULT 0', '逻辑删除'],
  ]));

  c.push(h3('4.2.7 操作日志表 t_zgsq_op_log'));
  c.push(tbl([
    ['字段', '类型', '注释'],
    ['op_log_id', 'BIGINT PK AUTO_INCREMENT', '日志主键'],
    ['op_user_name', 'VARCHAR(64)', '操作人用户名'],
    ['op_user_id', 'BIGINT', '操作人 ID'],
    ['op_module', 'VARCHAR(64)', '操作模块（用户管理/管廊管理等）'],
    ['op_action', 'VARCHAR(64)', '操作动作（新增/修改/删除等）'],
    ['op_target_id', 'VARCHAR(64)', '操作目标 ID'],
    ['op_content', 'TEXT', '操作详情（入参 JSON 或错误信息）'],
    ['op_ip', 'VARCHAR(64)', '客户端 IP'],
    ['op_time', 'DATETIME DEFAULT CURRENT_TIMESTAMP', '操作时间'],
    ['op_result', 'VARCHAR(64)', '执行结果（SUCCESS / FAIL）'],
    ['cost_ms', 'BIGINT', '耗时（毫秒）'],
  ]));
  c.push(pb('索引：PRIMARY KEY、INDEX(op_time)、INDEX(op_user_name)、INDEX(op_module)。'));
  c.push(pb('注意：操作日志表无外键约束，op_user_name 通过值关联用户表，写入性能优先。'));

  c.push(h2('4.3 索引设计总览'));
  c.push(pb('所有业务编号建有 (字段, deleted) 联合唯一索引 —— 实现业务编号唯一性 + 支持软删除后编号复用。'));
  c.push(pb('状态字段单列索引 —— 支撑列表筛选、Dashboard 统计。'));
  c.push(pb('外键字段索引 —— 支撑列表级联查询（按管廊查链路、按链路查配光组）。'));
  c.push(pb('时间字段索引 —— 支撑操作日志按时间范围查询。'));

  c.push(h2('4.4 建表脚本要点'));
  c.push(p1('完整建表脚本位于 /workspace/zgsq-backend/sql/schema.sql，执行命令：'));
  c.push(code(`CREATE DATABASE zgsq_illumination DEFAULT CHARSET utf8mb4;
USE zgsq_illumination;
SOURCE /path/to/schema.sql;
SOURCE /path/to/data.sql;`));

  return c;
}

// ============ 第5章 部署说明 ============
function ch5() {
  const c = [];
  c.push(pageBreak());
  c.push(h1('第5章 部署说明'));

  c.push(h2('5.1 后端部署'));
  c.push(h3('5.1.1 环境要求'));
  c.push(tbl([
    ['组件', '版本要求'],
    ['JDK', '17 或以上'],
    ['Maven', '3.8+'],
    ['MySQL', '5.7+，字符集 utf8mb4'],
    ['操作系统', 'Linux（推荐 Ubuntu 20.04+）或 Windows Server'],
    ['内存', '≥ 512MB（JVM -Xms256m -Xmx512m）'],
  ]));

  c.push(h3('5.1.2 数据库初始化'));
  c.push(code(`# 登录 MySQL
mysql -u root -p
# 执行 SQL
CREATE DATABASE zgsq_illumination DEFAULT CHARSET utf8mb4;
USE zgsq_illumination;
SOURCE /opt/zgsq/sql/schema.sql;    # 建表
SOURCE /opt/zgsq/sql/data.sql;     # 初始化数据（admin 账号、默认角色等）`));

  c.push(h3('5.1.3 应用配置'));
  c.push(p1('修改 src/main/resources/application.yml 中的数据库连接和 Token 配置：'));
  c.push(code(`server:
  port: 8080

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/zgsq_illumination?useUnicode=true&characterEncoding=utf8mb4&serverTimezone=Asia/Shanghai&useSSL=false
    username: root
    password: your-password
    driver-class-name: com.mysql.cj.jdbc.Driver
  jackson:
    date-format: yyyy-MM-dd HH:mm:ss
    time-zone: Asia/Shanghai

# 智光云枢自定义配置
zgsq:
  admin-token: zgsq-admin-token-2026   # Token 比对值，登录成功后下发给前端

mybatis-plus:
  configuration:
    map-underscore-to-camel-case: true
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl  # 生产可注释
  global-config:
    db-config:
      logic-delete-field: deleted
      logic-delete-value: 1
      logic-not-delete-value: 0
      table-underline: true
      id-type: auto`));

  c.push(h3('5.1.4 打包与运行'));
  c.push(code(`# 方式一：本地构建
cd /opt/zgsq-backend
mvn clean package -DskipTests

# 方式二：Docker 构建（可选）
mvn clean package docker:build

# 运行 Jar
java -jar target/zgsq-illumination-1.0.0.jar

# 指定端口运行
java -jar target/zgsq-illumination-1.0.0.jar --server.port=8080

# 指定配置文件运行（多环境）
java -jar target/zgsq-illumination-1.0.0.jar --spring.profiles.active=prod

# 后台运行（Linux）
nohup java -jar target/zgsq-illumination-1.0.0.jar > app.log 2>&1 &`));

  c.push(h3('5.1.5 后端健康检查'));
  c.push(p1('启动成功后访问 http://localhost:8080/api/guanlang/page 返回 200 即表示后端正常运行。白名单接口（如 /api/user/login）免 Token 可直接访问。'));

  c.push(h2('5.2 前端部署'));
  c.push(h3('5.2.1 环境要求'));
  c.push(tbl([
    ['组件', '版本要求'],
    ['Node.js', '16.15+'],
    ['npm', '8+ 或 pnpm 7+'],
    ['Nginx', '1.20+（可选，用于生产部署）'],
  ]));

  c.push(h3('5.2.2 配置 API 地址'));
  c.push(p1('在项目根目录创建或修改 .env.production：'));
  c.push(code(`VITE_API_BASE_URL=https://your-backend-host.com/api
# 开发环境 .env.development
# VITE_API_BASE_URL=http://localhost:8080/api`));

  c.push(h3('5.2.3 安装与打包'));
  c.push(code(`cd /opt/zgsq-frontend
# 安装依赖
npm install
# 生产打包（输出到 dist/ 目录）
npm run build
# 开发调试
npm run dev`));

  c.push(h3('5.2.4 Nginx 部署示例'));
  c.push(code(`server {
    listen 80;
    server_name your-domain.com;
    root /var/www/zgsq/dist;
    index index.html;

    # SPA 路由 fallback —— 所有 404 都返回 index.html，由 Vue Router 处理
    location / {
      try_files $uri $uri/ /index.html;
    }

    # 反向代理后端 API
    location /api/ {
      proxy_pass http://127.0.0.1:8080/api/;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 静态资源缓存（可选优化）
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ {
      expires 30d;
      add_header Cache-Control "public, immutable";
    }
}`));

  c.push(h3('5.2.5 HTTPS 配置（可选）'));
  c.push(code(`# 使用 certbot 申请 Let's Encrypt 免费证书
apt install certbot python3-certbot-nginx
certbot --nginx -d your-domain.com -d www.your-domain.com

# certbot 自动修改 nginx.conf 添加 443 监听和证书路径`));

  c.push(h2('5.3 部署架构总览'));
  c.push(p1('典型生产部署拓扑：浏览器 → HTTPS → Nginx（443/80，静态资源 + 反向代理）→ SpringBoot（8080）→ MySQL（3306）。组件可按需拆分：应用服务器（SpringBoot + Nginx）、数据库服务器（MySQL）、独立服务器。'));

  c.push(pageBreak());
  return c;
}

// ============ 第6章 运行示例 ============
function ch6() {
  const c = [];
  c.push(h1('第6章 运行示例'));

  c.push(h2('6.1 默认管理员账号'));
  c.push(p1('系统初始化时通过 data.sql 预置超级管理员账号：'));
  c.push(tbl([
    ['项目', '值'],
    ['用户名', 'admin'],
    ['密码', 'admin123'],
    ['角色', '超级管理员（ADMIN）'],
    ['权限', '全模块访问，包括用户管理、角色管理'],
    ['初始 Token', 'zgsq-admin-token-2026（可在 application.yml 配置）'],
  ]));

  c.push(h2('6.2 登录流程'));
  c.push(pb('浏览器访问系统地址（如 http://your-domain.com），未携带 Token 时自动跳转 /login。'));
  c.push(pb('输入 admin / admin123，点击"登录"按钮。'));
  c.push(pb('前端 POST /api/user/login → 后端校验成功返回 { token, userId, userName, roleCode }。'));
  c.push(pb('前端将 token 存入 localStorage，同时读取 redirect 参数（如有），跳转至 Dashboard 或目标页。'));
  c.push(pb('Dashboard 展示六项统计指标卡片：管廊总数、链路总数、配光组总数、启用调度数、今日告警数、维护中管廊数。'));
  c.push(pb('左侧导航栏包含：工作台、管廊管理、链路管理、配光组管理、定时调度、用户管理、角色管理、操作日志。'));

  c.push(h2('6.3 快速操作指引'));
  c.push(h3('新增第一条管廊'));
  c.push(pb('左侧导航 → 管廊管理 → 顶部「新增」按钮 → 系统自动生成编号 GL-XX市-0001 → 填写名称、长度、行政区 → 保存。'));
  c.push(pb('保存后 Service 层自动计算：剩余寿命百分比、下次巡检计划日期。'));
  c.push(h3('为管廊添加链路'));
  c.push(pb('左侧导航 → 链路管理 → 新增 → 选择刚创建的管廊 → 系统自动生成链路编号 LL-GL-XX市-0001-01 → 填写链路类型（主干）、长度 → 保存。'));
  c.push(h3('为链路配置配光组'));
  c.push(pb('左侧导航 → 配光组管理 → 新增 → 选择链路 → 系统自动生成编号 PG-LL-GL-XX市-0001-01-01 → 填写灯具数量（200）、单灯功率（30W）→ 总功率自动计算为 6000W → 保存。'));
  c.push(h3('配置定时调度'));
  c.push(pb('左侧导航 → 定时调度 → 新增 → 选择链路 → Cron 表达式填 "0 0 18 * * ?"（每天 18:00）→ 开灯亮度 80%、关灯亮度 0% → 保存 → 启用开关。'));

  c.push(h2('6.4 编号格式示例'));
  c.push(tbl([
    ['实体类型', '编号格式', '实际示例', '生成方法'],
    ['管廊', 'GL-{市名}-{4位序号}', 'GL-杭州市-0001', 'ZgsqCodeGenUtil.genGuanLangNo()'],
    ['链路', 'LL-{管廊编号}-{2位序号}', 'LL-GL-杭州市-0001-01', 'ZgsqCodeGenUtil.genLianLuNo()'],
    ['配光组', 'PG-{链路编号}-{2位序号}', 'PG-LL-GL-杭州市-0001-01-01', 'ZgsqCodeGenUtil.genPeiGuangNo()'],
  ]));

  c.push(h2('6.5 接口返回示例'));
  c.push(h3('登录成功响应'));
  c.push(code(`POST /api/user/login
Request:  { "userName": "admin", "userPassword": "admin123" }
Response:
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "zgsq-admin-token-2026",
    "userId": 1,
    "userName": "admin",
    "userRealName": "超级管理员",
    "roleCode": "ADMIN",
    "roleName": "超级管理员"
  }
}`));

  c.push(h3('Dashboard 统计响应'));
  c.push(code(`GET /api/stat/dashboard
Response:
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "guanLangTotal": 47,
    "lianLuTotal": 156,
    "peiGuangTotal": 892,
    "activeDingShiTotal": 23,
    "alertToday": 0,
    "maintainingGuanLangTotal": 3
  }
}`));

  c.push(h3('管廊新增成功响应'));
  c.push(code(`POST /api/guanlang/add
Request:
{
  "guanLangName": "文一路地下管廊",
  "tunnelLength": 3560.5,
  "belongDistrict": "西湖区",
  "buildYear": 2018,
  "designLife": 50,
  "patrolFrequency": 30,
  "gisCoord": "[120.155,30.274]"
}
Response:
{
  "code": 200,
  "message": "操作成功",
  "data": 1
}`));

  return c;
}

// ============ 主流程 ============
async function main() {
  console.log('开始生成《软件功能说明书》（大幅扩充版）...');
  const sections = [];
  sections.push(...cover());
  sections.push(...toc());
  sections.push(...ch1());
  sections.push(...ch2());
  sections.push(...ch3());
  sections.push(...ch4());
  sections.push(...ch5());
  sections.push(...ch6());

  const doc = new Document({
    sections: [{
      properties: {
        page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } },
      },
      headers: { default: mkHeader() },
      footers: { default: mkFooter() },
      children: sections,
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  require('fs').writeFileSync(OUTPUT, buffer);
  const kb = (buffer.length / 1024).toFixed(1);
  console.log(`\n✅ 生成完成！`);
  console.log(`📄 文件：${OUTPUT}`);
  console.log(`📦 大小：${kb} KB`);
  // 粗略估算：纯文本 docx 约 2500-4000 字节/页（压缩后），加上代码块和表格增加密度
  // 按 3500 字节/页估算
  console.log(`📊 估算页数：约 ${Math.round(buffer.length / 3500)} - ${Math.round(buffer.length / 2500)} 页`);
}

main().catch(e => { console.error('❌ 生成失败：', e.message); process.exit(1); });
