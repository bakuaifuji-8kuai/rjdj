/**
 * 软著源代码鉴别文档生成脚本
 * 输出：/workspace/zgsq-materials/智光云枢-源代码鉴别材料.docx
 */
import fs from 'node:fs';
import path from 'node:path';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  Header,
  Footer,
  PageNumber,
  PageBreak,
  convertMillimetersToTwip,
} from 'docx';

// ============================ 常量 ============================
const BACKEND_ROOT = '/workspace/zgsq-backend/src/main/java/com/zgsq/illumination';
const FRONTEND_ROOT = '/workspace/src';
const OUTPUT_FILE = '/workspace/zgsq-materials/智光云枢-源代码鉴别材料.docx';

const LINES_PER_PAGE = 50;
const HEADER_TEXT = '《城市照明物联管控平台（智光云枢）V1.0 源程序》';

// ============================ 后端文件排序 ============================
// 启动类 → common → exception → utils → config → interceptor → 业务模块
// 业务模块内：entity → dto → vo → mapper → service → serviceImpl → controller
const BUSINESS_MODULES = ['user', 'role', 'guanlang', 'lianlu', 'peiguang', 'dingshi', 'stat', 'oplog'];
const TYPE_ORDER = ['entity', 'dto', 'vo', 'mapper', 'service', 'serviceImpl', 'controller'];

function listBackendFiles() {
  const files = [];

  // 1. 启动类
  const startClass = path.join(BACKEND_ROOT, 'ZhiGuangApplication.java');
  if (fs.existsSync(startClass)) files.push(startClass);

  // 2. common 目录
  const commonDir = path.join(BACKEND_ROOT, 'common');
  if (fs.existsSync(commonDir)) {
    fs.readdirSync(commonDir)
      .filter(f => f.endsWith('.java'))
      .sort()
      .forEach(f => files.push(path.join(commonDir, f)));
  }

  // 3. exception 目录
  const excDir = path.join(BACKEND_ROOT, 'exception');
  if (fs.existsSync(excDir)) {
    fs.readdirSync(excDir)
      .filter(f => f.endsWith('.java'))
      .sort()
      .forEach(f => files.push(path.join(excDir, f)));
  }

  // 4. utils 目录
  const utilsDir = path.join(BACKEND_ROOT, 'utils');
  if (fs.existsSync(utilsDir)) {
    fs.readdirSync(utilsDir)
      .filter(f => f.endsWith('.java'))
      .sort()
      .forEach(f => files.push(path.join(utilsDir, f)));
  }

  // 5. config 目录
  const configDir = path.join(BACKEND_ROOT, 'config');
  if (fs.existsSync(configDir)) {
    fs.readdirSync(configDir)
      .filter(f => f.endsWith('.java'))
      .sort()
      .forEach(f => files.push(path.join(configDir, f)));
  }

  // 6. interceptor 目录
  const interceptorDir = path.join(BACKEND_ROOT, 'interceptor');
  if (fs.existsSync(interceptorDir)) {
    fs.readdirSync(interceptorDir)
      .filter(f => f.endsWith('.java'))
      .sort()
      .forEach(f => files.push(path.join(interceptorDir, f)));
  }

  // 7. 业务模块
  for (const mod of BUSINESS_MODULES) {
    const modDir = path.join(BACKEND_ROOT, mod);
    if (!fs.existsSync(modDir)) continue;

    // 每个 type 目录按预定义顺序
    for (const type of TYPE_ORDER) {
      let typeDir;
      if (type === 'serviceImpl') {
        // serviceImpl 可能在 service/impl 下或直接在模块根
        const implInService = path.join(modDir, 'service', 'impl');
        const implDirect = path.join(modDir, 'impl');
        if (fs.existsSync(implInService)) {
          typeDir = implInService;
        } else if (fs.existsSync(implDirect)) {
          typeDir = implDirect;
        } else {
          continue;
        }
      } else {
        typeDir = path.join(modDir, type);
      }
      if (!fs.existsSync(typeDir)) continue;
      fs.readdirSync(typeDir)
        .filter(f => f.endsWith('.java'))
        .sort()
        .forEach(f => files.push(path.join(typeDir, f)));
    }

    // 处理 service 接口（排除 service/impl 子目录，只取 service/ 下的 .java）
    // 上面 TYPE_ORDER 中 service 会走到 modDir/service，包含 impl，已经处理过
  }

  // 去重 + 确认存在
  return [...new Set(files)].filter(fs.existsSync);
}

// ============================ 前端文件排序 ============================
// 前端按目录层级 + 文件名排序：根目录文件 → data → modules(按业务模块) → router → shared
function listFrontendFiles() {
  const files = [];

  // 根目录 src/*.{vue,js}
  const rootFiles = ['App.vue', 'main.js'];
  rootFiles.forEach(f => {
    const p = path.join(FRONTEND_ROOT, f);
    if (fs.existsSync(p)) files.push(p);
  });

  // data/
  const dataDir = path.join(FRONTEND_ROOT, 'data');
  if (fs.existsSync(dataDir)) addFilesRecursive(dataDir, files);

  // modules/（按目录名排序）
  const modulesDir = path.join(FRONTEND_ROOT, 'modules');
  if (fs.existsSync(modulesDir)) {
    const moduleDirs = fs.readdirSync(modulesDir)
      .filter(d => fs.statSync(path.join(modulesDir, d)).isDirectory())
      .sort();
    for (const md of moduleDirs) {
      addFilesRecursive(path.join(modulesDir, md), files);
    }
  }

  // router/
  const routerDir = path.join(FRONTEND_ROOT, 'router');
  if (fs.existsSync(routerDir)) addFilesRecursive(routerDir, files);

  // shared/
  const sharedDir = path.join(FRONTEND_ROOT, 'shared');
  if (fs.existsSync(sharedDir)) addFilesRecursive(sharedDir, files);

  // 过滤掉配置文件
  const excludeNames = ['vite.config.js', 'package.json', 'application.yml', 'pom.xml'];
  return files.filter(f => !excludeNames.includes(path.basename(f)));
}

function addFilesRecursive(dir, list) {
  const entries = fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      addFilesRecursive(full, list);
    } else if (/\.(vue|js)$/.test(entry.name)) {
      list.push(full);
    }
  }
}

// ============================ 收集源码文本 ============================
function readAllLines(fileList, prefixLabel) {
  const allLines = [];
  for (const fp of fileList) {
    const content = fs.readFileSync(fp, 'utf-8');
    const label = `${prefixLabel}::${path.relative(fp.includes('zgsq-backend') ? '/workspace/zgsq-backend/src/main/java/com/zgsq/illumination' : FRONTEND_ROOT, fp)}`;
    allLines.push(`// ==================== ${label} ====================`);
    // 保持原文件换行风格，去掉末尾空行再 split
    const normalized = content.replace(/\r\n/g, '\n');
    allLines.push(...normalized.split('\n'));
    allLines.push(''); // 文件间加一空行
  }
  return allLines;
}

// ============================ 主流程 ============================
console.log('=== 软著源代码鉴别文档生成 ===\n');

// 1. 收集文件
const backendFiles = listBackendFiles();
const frontendFiles = listFrontendFiles();
console.log(`后端文件数: ${backendFiles.length}`);
console.log(`前端文件数: ${frontendFiles.length}`);

// 2. 读取所有源码行
console.log('\n读取源码中...');
const backendLines = readAllLines(backendFiles, 'BACKEND');
const frontendLines = readAllLines(frontendFiles, 'FRONTEND');
const allLines = [...backendLines, ...frontendLines];
const totalLines = allLines.length;
const totalPagesRaw = Math.ceil(totalLines / LINES_PER_PAGE);
console.log(`总行数(含分隔): ${totalLines}`);
console.log(`总页数(按 50 行/页): ${totalPagesRaw}`);

// 3. 确定实际要保留的行
let keptLines;
let skipInfo = null;

if (totalPagesRaw > 120) {
  const firstPageLines = 60 * LINES_PER_PAGE;  // 3000 行
  const lastPageLines = 60 * LINES_PER_PAGE;   // 3000 行
  const middleStart = firstPageLines;
  const middleEnd = totalLines - lastPageLines;
  const middlePages = Math.ceil((middleEnd - middleStart) / LINES_PER_PAGE);

  const firstPart = allLines.slice(0, firstPageLines);
  const skipMarker = [
    '',
    `// ==================== 中间部分代码略，共 ${middlePages} 页 ====================`,
    '',
  ];
  const lastPart = allLines.slice(middleEnd);
  keptLines = [...firstPart, ...skipMarker, ...lastPart];
  skipInfo = { middlePages, middleLines: middleEnd - middleStart };
  console.log(`\n[截断] 总页数 > 120，保留前 ${firstPageLines} 行 + 后 ${lastPageLines} 行`);
  console.log(`       跳过中间 ${middlePages} 页（约 ${skipInfo.middleLines} 行）`);
  console.log(`       实际保留行数: ${keptLines.length}`);
} else {
  // 全部保留，补齐空行到整页
  keptLines = [...allLines];
  const remain = keptLines.length % LINES_PER_PAGE;
  if (remain > 0) {
    keptLines.push(...Array(LINES_PER_PAGE - remain).fill(''));
  }
  console.log(`\n[未截断] 总页数 ≤ 120，全部保留。补齐后 ${keptLines.length} 行。`);
}

// 4. 构建 docx paragraphs
console.log('\n构建 Word 文档段落...');
const paragraphs = keptLines.map(line => {
  // 需要把 tab 转为空格，docx 里的 tab 会显示异常
  const safeLine = line.replace(/\t/g, '    ');
  // 空行用空段落
  const run = new TextRun({
    text: safeLine,
    font: { name: 'Courier New', eastAsia: 'Courier New' },
    size: 20, // 10pt = 20 half-points
  });
  return new Paragraph({
    children: [run],
    spacing: {
      line: 200,
      lineRule: 'auto',
      before: 0,
      after: 0,
    },
  });
});

// 5. 组装文档（带页眉页脚）
console.log('生成 Word 文件...');

const doc = new Document({
  styles: {
    default: {
      document: {
        run: {
          font: 'Courier New',
          size: 20,
        },
      },
    },
  },
  sections: [{
    properties: {
      // A4 纸 210mm x 297mm
      page: {
        margin: {
          top: convertMillimetersToTwip(25.4),
          bottom: convertMillimetersToTwip(25.4),
          left: convertMillimetersToTwip(20),
          right: convertMillimetersToTwip(20),
        },
      },
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({
            text: HEADER_TEXT,
            font: { name: 'SimSun', eastAsia: '宋体' },
            size: 20,
          })],
        })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              children: [PageNumber.CURRENT],
              font: { name: 'SimSun', eastAsia: '宋体' },
              size: 20,
            }),
            new TextRun({ text: ' / ', font: { name: 'SimSun', eastAsia: '宋体' }, size: 20 }),
            new TextRun({
              children: [PageNumber.TOTAL_PAGES],
              font: { name: 'SimSun', eastAsia: '宋体' },
              size: 20,
            }),
          ],
        })],
      }),
    },
    children: paragraphs,
  }],
});

const buffer = await Packer.toBuffer(doc);
fs.writeFileSync(OUTPUT_FILE, buffer);

const fileSizeKB = (buffer.length / 1024).toFixed(1);
console.log(`\n✓ 生成完成: ${OUTPUT_FILE}`);
console.log(`  文件大小: ${fileSizeKB} KB`);
console.log(`  总行数(含分隔): ${totalLines}`);
console.log(`  原始总页数: ${totalPagesRaw}`);
if (skipInfo) {
  console.log(`  跳过中间: ${skipInfo.middlePages} 页（${skipInfo.middleLines} 行）`);
}
console.log(`  实际保留: ${keptLines.length} 行 ≈ ${Math.ceil(keptLines.length / LINES_PER_PAGE)} 页`);
