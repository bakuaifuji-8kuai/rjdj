const fs = require('fs');
const path = require('path');

const excludeDirs = ['node_modules', '.git', 'dist'];
let fileCount = 0;

async function getAllFiles(dir, baseDir = dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath);

    if (entry.isDirectory()) {
      if (!excludeDirs.includes(entry.name)) {
        files.push(...await getAllFiles(fullPath, baseDir));
      }
    } else if (entry.isFile() && /\.(vue|js|jsx|ts|tsx)$/.test(entry.name)) {
      files.push({ fullPath, relativePath });
    }
  }

  return files;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getFileExtension(filename) {
  return path.extname(filename).toLowerCase();
}

function getLanguageFromExtension(ext) {
  const map = {
    '.vue': 'html',
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.ts': 'typescript',
    '.tsx': 'typescript'
  };
  return map[ext] || 'plaintext';
}

async function generateHtmlDocument() {
  console.log('开始生成HTML文档...\n');

  const srcDir = path.join(__dirname, 'src');
  const files = await getAllFiles(srcDir);
  
  let tocHtml = '';
  let contentHtml = '';
  let fileIndex = 0;

  const dirStructure = {};
  for (const file of files) {
    const parts = file.relativePath.split(path.sep);
    let current = dirStructure;
    for (const part of parts) {
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }
  }

  function buildTocHtml(obj, depth = 0) {
    let html = '';
    const sortedKeys = Object.keys(obj).sort();
    for (const key of sortedKeys) {
      const isFile = !Object.keys(obj[key]).length;
      const indent = depth * 20;
      if (isFile) {
        const fileId = `file-${fileIndex++}`;
        html += `<div style="padding-left: ${indent}px;"><a href="#${fileId}" style="color: #0366d6; text-decoration: none;">📄 ${escapeHtml(key)}</a></div>\n`;
      } else {
        html += `<div style="padding-left: ${indent}px; color: #586069; font-weight: bold;">📁 ${escapeHtml(key)}</div>\n`;
        html += buildTocHtml(obj[key], depth + 1);
      }
    }
    return html;
  }

  tocHtml = buildTocHtml(dirStructure);

  // 生成每个文件的内容
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileId = `file-${i}`;
    const ext = getFileExtension(file.relativePath);
    const lang = getLanguageFromExtension(ext);

    contentHtml += `<div id="${fileId}" style="margin-bottom: 40px; page-break-inside: avoid;">\n`;
    contentHtml += `<h2 style="color: #24292e; border-bottom: 2px solid #e1e4e8; padding-bottom: 10px;">📄 ${escapeHtml(file.relativePath)}</h2>\n`;

    try {
      const fileContent = fs.readFileSync(file.fullPath, 'utf-8');
      const lines = fileContent.split('\n');

      contentHtml += `<pre style="background-color: #f6f8fa; border: 1px solid #e1e4e8; border-radius: 6px; overflow-x: auto; padding: 16px; font-size: 13px; line-height: 1.5;"><code class="language-${lang}">\n`;

      for (let j = 0; j < lines.length; j++) {
        const lineNum = String(j + 1).padStart(5, ' ');
        contentHtml += `<span style="color: #6a737d; user-select: none;">${lineNum} │ </span>${escapeHtml(lines[j])}\n`;
      }

      contentHtml += `</code></pre>\n`;
      fileCount++;
      console.log(`已处理: ${file.relativePath}`);
    } catch (err) {
      contentHtml += `<p style="color: #d73a49;">Error reading file: ${escapeHtml(err.message)}</p>\n`;
      console.error(`Error: ${file.relativePath}`);
    }

    contentHtml += `</div>\n`;
  }

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>城市隧道智慧照明系统 - 源码文档</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #24292e;
      background-color: #fff;
    }
    .container {
      display: flex;
      min-height: 100vh;
    }
    .sidebar {
      width: 300px;
      background-color: #f6f8fa;
      border-right: 1px solid #e1e4e8;
      padding: 20px;
      position: fixed;
      height: 100vh;
      overflow-y: auto;
    }
    .sidebar h1 {
      font-size: 20px;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid #e1e4e8;
    }
    .main-content {
      margin-left: 300px;
      padding: 30px;
      max-width: 1200px;
    }
    .header {
      background-color: #24292e;
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      font-size: 36px;
      margin-bottom: 10px;
    }
    .header p {
      font-size: 16px;
      color: #ccc;
    }
    .toc-title {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 15px;
      color: #24292e;
    }
    h2 {
      color: #24292e;
      margin-top: 30px;
    }
    pre {
      background-color: #f6f8fa;
      border-radius: 6px;
    }
    @media print {
      .sidebar {
        display: none;
      }
      .main-content {
        margin-left: 0;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🏙️ 城市隧道智慧照明系统</h1>
    <p>源码文档 | ${new Date().toLocaleString('zh-CN')} | ${files.length} 个文件</p>
  </div>

  <div class="container">
    <div class="sidebar">
      <h1>📑 文件目录</h1>
      <div class="toc-title">点击文件名跳转</div>
      ${tocHtml}
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e4e8; color: #586069; font-size: 12px;">
        <p>📊 文件总数: ${files.length}</p>
        <p>📦 生成时间: ${new Date().toLocaleString('zh-CN')}</p>
      </div>
    </div>

    <div class="main-content">
      <h1 style="margin-bottom: 30px;">📝 源代码</h1>
      ${contentHtml}
    </div>
  </div>
</body>
</html>`;

  const outputPath = path.join(__dirname, '隧道照明系统源码文档.html');
  fs.writeFileSync(outputPath, html, 'utf8');

  console.log('\n' + '='.repeat(80));
  console.log('HTML文档已生成!');
  console.log(`文件路径: ${outputPath}`);
  console.log(`处理文件数: ${fileCount}`);
  console.log(`文档大小: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
  console.log('='.repeat(80));
  console.log('\n提示: 用浏览器打开HTML文件可以获得更好的阅读体验！');
}

generateHtmlDocument().catch(console.error);
