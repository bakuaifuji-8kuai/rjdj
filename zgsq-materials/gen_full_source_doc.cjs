/**
 * [软著核心代码] 完整源码Word文档生成器
 * 将 zgsq-backend（Java）+ zgsq-frontend（Vue/JS）所有源码文件
 * 合并写入一个 Word 文档，每页 50 行等宽字体
 */
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, PageBreak, convertInchesToTwip
} = require('/workspace/node_modules/docx');
const fs = require('fs');
const path = require('path');

// ============ 1. 收集所有源码文件，按业务逻辑排序 ============

const backendRoot = '/workspace/zgsq-backend/src/main/java';
const frontendRoot = '/workspace/zgsq-frontend/src';

// 后端排序（按业务模块，每个模块内按 entity→dto→vo→mapper→service→impl→controller）
const backendOrder = [
  { label: '启动类', dir: backendRoot + '/com/zgsq/illumination', files: ['ZhiGuangApplication.java'] },
  { label: '通用骨架 common', dir: backendRoot + '/com/zgsq/illumination/common', pattern: /\.java$/ },
  { label: '异常处理 exception', dir: backendRoot + '/com/zgsq/illumination/exception', pattern: /\.java$/ },
  { label: '业务专属工具 utils', dir: backendRoot + '/com/zgsq/illumination/utils', pattern: /\.java$/ },
  { label: '配置类 config', dir: backendRoot + '/com/zgsq/illumination/config', pattern: /\.java$/ },
  { label: '拦截器 interceptor', dir: backendRoot + '/com/zgsq/illumination/interceptor', pattern: /\.java$/ },
];
const bizModules = ['user', 'role', 'guanlang', 'lianlu', 'peiguang', 'dingshi', 'stat', 'oplog'];
bizModules.forEach(m => {
  const pkg = backendRoot + '/com/zgsq/illumination';
  const candidates = [
    pkg + '/' + m,
    pkg + '/modules/' + m,
  ];
  const order = ['entity', 'dto', 'vo', 'mapper', 'service', 'service/impl', 'controller'];
  backendOrder.push({
    label: '业务模块：' + m,
    dirs: candidates,
    subOrder: order,
  });
});

// 前端排序
const frontendSections = [
  { label: '入口文件', dirs: [frontendRoot], files: ['main.js', 'App.vue'] },
  { label: 'API 接口层', dirs: [frontendRoot + '/api'], pattern: /\.(js)$/ },
  { label: '路由配置', dirs: [frontendRoot + '/router'], pattern: /\.(js)$/ },
  { label: '状态管理 Pinia', dirs: [frontendRoot + '/store'], pattern: /\.(js)$/ },
  { label: '工具函数', dirs: [frontendRoot + '/utils'], pattern: /\.(js)$/ },
  { label: '布局组件', dirs: [frontendRoot + '/layout'], pattern: /\.(vue)$/ },
];
const viewOrder = ['login', 'dashboard', 'guanlang', 'lianlu', 'peiguang', 'dingshi', 'user', 'role', 'oplog'];
viewOrder.forEach(v => {
  frontendSections.push({
    label: '页面：' + v,
    dirs: [frontendRoot + '/views/' + v],
    pattern: /\.(vue|js)$/,
  });
});

// ============ 2. 工具函数 ============

function collectFilesFromDir(dir, pattern) {
  if (!fs.existsSync(dir)) return [];
  const results = [];
  const items = fs.readdirSync(dir);
  // 文件优先
  const files = items.filter(i => fs.statSync(path.join(dir, i)).isFile());
  const dirs = items.filter(i => fs.statSync(path.join(dir, i)).isDirectory());
  files.forEach(f => {
    if (!pattern || pattern.test(f)) results.push(path.join(dir, f));
  });
  // 子目录递归
  dirs.forEach(d => {
    results.push(...collectFilesFromDir(path.join(dir, d), pattern));
  });
  return results;
}

function collectByOrder(section, isBackend) {
  let files = [];
  if (section.files) {
    const base = section.dir || (section.dirs && section.dirs[0]);
    section.files.forEach(f => {
      const p = path.join(base, f);
      if (fs.existsSync(p)) files.push(p);
    });
  } else if (section.subOrder) {
    // 业务模块分层遍历
    section.subOrder.forEach(sub => {
      section.dirs.forEach(dir => {
        const subDir = path.join(dir, sub);
        if (fs.existsSync(subDir)) {
          files.push(...collectFilesFromDir(subDir, /\.java$/));
        }
      });
    });
  } else if (section.pattern) {
    (section.dirs || [section.dir]).forEach(dir => {
      if (fs.existsSync(dir)) {
        files.push(...collectFilesFromDir(dir, section.pattern));
      }
    });
  }
  return files;
}

// ============ 3. 构建文档内容 ============

const children = [];

// 标题页
children.push(new Paragraph({
  heading: HeadingLevel.TITLE,
  alignment: AlignmentType.CENTER,
  spacing: { after: 400 },
  children: [new TextRun({ text: '城市照明物联管控平台（智光云枢）V1.0', bold: true, size: 48 })]
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 200 },
  children: [new TextRun({ text: '完整源程序', size: 36 })]
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 600 },
  children: [new TextRun({ text: 'Java SpringBoot 2.7 + Vue 3 前后端分离', size: 28, color: '666666' })]
}));

let totalFiles = 0;
let totalLines = 0;

// === 后端 ===
children.push(new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 400, after: 300 },
  children: [new TextRun({ text: '第一部分  后端 Java 源码（SpringBoot 2.7 + MyBatis-Plus）', bold: true, size: 32 })]
}));

backendOrder.forEach(section => {
  const files = collectByOrder(section, true);
  if (files.length === 0) return;

  children.push(new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 200 },
    children: [new TextRun({ text: '▸ ' + section.label + '（' + files.length + ' 个文件）', bold: true, size: 28 })]
  }));

  files.forEach(filePath => {
    totalFiles++;
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    totalLines += lines.length;
    const relPath = filePath.replace(backendRoot + '/', '');

    // 文件分隔标题
    children.push(new Paragraph({
      spacing: { before: 200, after: 100 },
      shading: { type: 'clear', color: 'F0F4FF' },
      children: [new TextRun({ text: '// ' + relPath, bold: true, size: 22, color: '1E40AF', font: 'Courier New' })]
    }));

    // 代码行（每页凑满 50 行，这里用 lineSpacing 控制密度）
    lines.forEach(line => {
      // 空行也保留
      children.push(new Paragraph({
        spacing: { line: 180, before: 0, after: 0 },
        children: [new TextRun({
          text: line.length > 180 ? line.substring(0, 180) + '...' : line,
          font: 'Courier New',
          size: 16,
          color: '1F2937',
        })]
      }));
    });
    // 每个文件后补空行，确保视觉分隔
    for (let i = 0; i < 3; i++) {
      children.push(new Paragraph({
        spacing: { line: 180 },
        children: [new TextRun({ text: ' ', font: 'Courier New', size: 16 })]
      }));
    }
  });
});

// === 前端 ===
children.push(new Paragraph({
  pageBreakBefore: true,
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 400, after: 300 },
  children: [new TextRun({ text: '第二部分  前端 Vue 源码（Vue 3.2 + Element Plus + Pinia）', bold: true, size: 32 })]
}));

frontendSections.forEach(section => {
  const files = collectByOrder(section, false);
  if (files.length === 0) return;

  children.push(new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 200 },
    children: [new TextRun({ text: '▸ ' + section.label + '（' + files.length + ' 个文件）', bold: true, size: 28 })]
  }));

  files.forEach(filePath => {
    totalFiles++;
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    totalLines += lines.length;
    const relPath = filePath.replace(frontendRoot + '/', '');

    children.push(new Paragraph({
      spacing: { before: 200, after: 100 },
      shading: { type: 'clear', color: 'FFF7ED' },
      children: [new TextRun({ text: '// ' + relPath, bold: true, size: 22, color: 'C2410C', font: 'Courier New' })]
    }));

    lines.forEach(line => {
      children.push(new Paragraph({
        spacing: { line: 180, before: 0, after: 0 },
        children: [new TextRun({
          text: line.length > 180 ? line.substring(0, 180) + '...' : line,
          font: 'Courier New',
          size: 16,
          color: '1F2937',
        })]
      }));
    });
    for (let i = 0; i < 3; i++) {
      children.push(new Paragraph({
        spacing: { line: 180 },
        children: [new TextRun({ text: ' ', font: 'Courier New', size: 16 })]
      }));
    }
  });
});

// === 尾部统计 ===
children.push(new Paragraph({
  pageBreakBefore: true,
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 400, after: 300 },
  children: [new TextRun({ text: '附录  统计信息', bold: true, size: 32 })]
}));
children.push(new Paragraph({
  spacing: { line: 300 },
  children: [new TextRun({ text: '源码文件总数：' + totalFiles + ' 个', size: 24 })]
}));
children.push(new Paragraph({
  spacing: { line: 300 },
  children: [new TextRun({ text: '源码总行数：' + totalLines + ' 行', size: 24 })]
}));
children.push(new Paragraph({
  spacing: { line: 300 },
  children: [new TextRun({ text: '其中后端 Java 文件：69 个，前端 Vue/JS 文件：' + (totalFiles - 69) + ' 个', size: 24 })]
}));

// ============ 4. 生成文档 ============

const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: '宋体', size: 24 }
      }
    }
  },
  sections: [{
    properties: {
      page: {
        margin: {
          top: convertInchesToTwip(0.8),
          bottom: convertInchesToTwip(0.8),
          left: convertInchesToTwip(0.9),
          right: convertInchesToTwip(0.9),
        }
      }
    },
    children: children
  }]
});

const outPath = '/workspace/zgsq-materials/智光云枢-完整源代码.docx';
Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(outPath, buf);
  console.log('✅ 生成成功：' + outPath);
  console.log('📊 文件数：' + totalFiles + '，总行数：' + totalLines);
  console.log('💾 文件大小：' + (buf.length / 1024 / 1024).toFixed(1) + ' MB');
});
