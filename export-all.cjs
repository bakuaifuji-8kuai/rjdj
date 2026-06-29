const fs = require('fs');
const path = require('path');

// 项目根目录
const rootDir = __dirname;

// 需要导出的文件扩展名
const extensions = ['.vue', '.js', '.json', '.css', '.scss', '.html'];

// 需要排除的目录
const excludeDirs = ['node_modules', 'dist', '.git', '.idea', '.vscode'];

console.log('开始收集项目源码...');

// 递归收集文件
function collectFiles(dir, depth = 0) {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && excludeDirs.includes(item)) {
      continue;
    }

    if (stat.isDirectory()) {
      files.push(...collectFiles(fullPath, depth + 1));
    } else {
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

// 生成 HTML 格式
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

  files.forEach((file, index) => {
    html += `      <li><a href="#file-${index}">${file.relativePath}</a></li>\n`;
  });

  html += `    </ul>
  </div>
  <hr class="section-divider">
`;

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

// 生成 Markdown 格式
function generateMarkdown(files) {
  let md = `# 城市智慧照明系统 - 项目源码\n\n`;
  
  md += `## 目录\n\n`;
  files.forEach((file, index) => {
    md += `${index + 1}. [${file.relativePath}](#${index})\n`;
  });
  
  md += `\n---\n\n`;
  
  files.forEach((file, index) => {
    md += `## <a id="${index}"></a>${file.relativePath}\n\n`;
    md += `**文件路径**: \`${file.relativePath}\`\n\n`;
    md += '```' + getLanguage(file.name) + '\n';
    md += file.content + '\n';
    md += '```\n\n';
    md += '---\n\n';
  });

  return md;
}

// 生成纯文本格式
function generateText(files) {
  let text = `==============================\n`;
  text += `  城市智慧照明系统 - 项目源码\n`;
  text += `==============================\n\n`;
  
  text += `文件目录:\n`;
  text += `---------\n`;
  files.forEach((file, index) => {
    text += `${index + 1}. ${file.relativePath}\n`;
  });
  
  text += `\n\n`;
  text += `==============================\n`;
  text += `  文件内容\n`;
  text += `==============================\n\n`;
  
  files.forEach((file, index) => {
    text += `\n${'='.repeat(60)}\n`;
    text += `文件 ${index + 1}: ${file.relativePath}\n`;
    text += `${'='.repeat(60)}\n\n`;
    text += file.content;
    text += `\n\n`;
  });

  return text;
}

// 获取代码语言
function getLanguage(filename) {
  const ext = path.extname(filename).toLowerCase();
  const map = {
    '.vue': 'vue',
    '.js': 'javascript',
    '.json': 'json',
    '.css': 'css',
    '.scss': 'scss',
    '.html': 'html'
  };
  return map[ext] || 'text';
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
    
    console.log('\n正在生成 HTML 格式...');
    const html = generateHTML(files);
    fs.writeFileSync(path.join(rootDir, '项目源码.html'), html, 'utf-8');
    
    console.log('正在生成 Markdown 格式...');
    const md = generateMarkdown(files);
    fs.writeFileSync(path.join(rootDir, '项目源码.md'), md, 'utf-8');
    
    console.log('正在生成纯文本格式...');
    const txt = generateText(files);
    fs.writeFileSync(path.join(rootDir, '项目源码.txt'), txt, 'utf-8');
    
    console.log(`\n✅ 源码导出成功！`);
    console.log(`\n已生成的文件：`);
    console.log(`1. 项目源码.html  - 推荐：可用 Word 直接打开或浏览器打开后复制`);
    console.log(`2. 项目源码.md    - Markdown 格式，可在 Markdown 编辑器中打开`);
    console.log(`3. 项目源码.txt   - 纯文本格式，通用性最强`);
    console.log(`\n如何导入 Word：`);
    console.log(`方法一：双击 项目源码.html，然后用 Word 打开`);
    console.log(`方法二：浏览器打开 项目源码.html，全选复制，粘贴到 Word`);
    console.log(`方法三：打开 项目源码.txt，复制需要的内容到 Word`);
  } catch (error) {
    console.error('❌ 导出失败:', error.message);
    process.exit(1);
  }
}

main();
