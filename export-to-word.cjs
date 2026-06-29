const fs = require('fs');
const path = require('path');

// 项目根目录
const rootDir = __dirname;

// 需要导出的文件扩展名
const extensions = ['.vue', '.js', '.json', '.css', '.scss', '.html'];

// 需要排除的目录
const excludeDirs = ['node_modules', 'dist', '.git', '.idea', '.vscode'];

// 输出文件
const outputFile = path.join(rootDir, '项目源码.html');

console.log('开始收集项目源码...');

// 递归收集文件
function collectFiles(dir, depth = 0) {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    // 跳过排除的目录
    if (stat.isDirectory() && excludeDirs.includes(item)) {
      continue;
    }

    if (stat.isDirectory()) {
      files.push(...collectFiles(fullPath, depth + 1));
    } else {
      // 检查文件扩展名
      const ext = path.extname(item).toLowerCase();
      if (extensions.includes(ext)) {
        const relativePath = path.relative(rootDir, fullPath);
        files.push({
          path: fullPath,
          relativePath: relativePath,
          name: item,
          content: fs.readFileSync(fullPath, 'utf-8')
        });
      }
    }
  }

  return files;
}

// 生成 HTML 内容
function generateHTML(files) {
  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>城市智慧照明系统 - 项目源码</title>
  <style>
    body {
      font-family: 'Microsoft YaHei', Arial, sans-serif;
      margin: 40px;
      background-color: #ffffff;
    }
    h1 {
      color: #333333;
      border-bottom: 2px solid #409eff;
      padding-bottom: 10px;
    }
    h2 {
      color: #409eff;
      background-color: #f5f7fa;
      padding: 10px;
      margin-top: 30px;
      border-left: 4px solid #409eff;
    }
    .file-info {
      color: #666;
      margin-bottom: 10px;
      font-size: 14px;
    }
    .code-block {
      background-color: #f9fafc;
      border: 1px solid #e4e7ed;
      border-radius: 4px;
      padding: 15px;
      overflow-x: auto;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 12px;
      line-height: 1.5;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    .toc {
      background-color: #f5f7fa;
      padding: 15px;
      border-radius: 4px;
      margin-bottom: 30px;
    }
    .toc h3 {
      margin-top: 0;
      color: #333;
    }
    .toc ul {
      list-style-type: none;
      padding-left: 0;
    }
    .toc li {
      margin: 5px 0;
    }
    .toc a {
      color: #409eff;
      text-decoration: none;
    }
    .toc a:hover {
      text-decoration: underline;
    }
    .section-divider {
      border: none;
      border-top: 2px dashed #ddd;
      margin: 40px 0;
    }
  </style>
</head>
<body>
  <h1>城市智慧照明系统 - 项目源码</h1>
  
  <div class="toc">
    <h3>文件目录</h3>
    <ul>
`;

  // 添加目录
  files.forEach((file, index) => {
    html += `      <li><a href="#file-${index}">${file.relativePath}</a></li>\n`;
  });

  html += `    </ul>
  </div>
  <hr class="section-divider">
`;

  // 添加文件内容
  files.forEach((file, index) => {
    html += `
  <h2 id="file-${index}">${file.relativePath}</h2>
  <div class="file-info">文件路径: ${file.relativePath}</div>
  <div class="code-block">${escapeHtml(file.content)}</div>
  <hr class="section-divider">
`;
  });

  html += `
</body>
</html>`;

  return html;
}

// HTML 转义
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };

  return text.replace(/[&<>"]/g, m => map[m]);
}

// 主函数
function main() {
  try {
    const files = collectFiles(rootDir);
    console.log(`共找到 ${files.length} 个文件`);
    
    const html = generateHTML(files);
    fs.writeFileSync(outputFile, html, 'utf-8');
    
    console.log(`\n✅ 源码导出成功！`);
    console.log(`📁 输出文件: ${outputFile}`);
    console.log(`\n使用说明：`);
    console.log(`1. 用浏览器打开 ${outputFile}，然后可以直接复制粘贴到 Word`);
    console.log(`2. 或者直接用 Word 打开该 HTML 文件`);
    console.log(`3. 包含目录导航，点击可跳转到对应文件`);
  } catch (error) {
    console.error('❌ 导出失败:', error.message);
    process.exit(1);
  }
}

main();
