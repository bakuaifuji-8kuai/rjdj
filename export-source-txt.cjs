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

async function generateTxtDocument() {
  console.log('开始生成TXT文档...\n');

  const srcDir = path.join(__dirname, 'src');
  const files = await getAllFiles(srcDir);
  
  let content = '';
  content += '='.repeat(80) + '\n';
  content += '城市隧道智慧照明系统\n';
  content += '源码文档\n';
  content += '='.repeat(80) + '\n\n';
  content += `生成时间: ${new Date().toLocaleString('zh-CN')}\n`;
  content += `文件总数: ${files.length}\n\n`;
  content += '='.repeat(80) + '\n';
  content += '目录结构\n';
  content += '='.repeat(80) + '\n\n';

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

  function printStructure(obj, indent = 0) {
    let result = '';
    const sortedKeys = Object.keys(obj).sort();

    for (const key of sortedKeys) {
      const isFile = !Object.keys(obj[key]).length;
      const prefix = '  '.repeat(indent) + (isFile ? '[FILE] ' : '[DIR]  ');
      result += prefix + key + '\n';

      if (!isFile) {
        result += printStructure(obj[key], indent + 1);
      }
    }

    return result;
  }

  content += printStructure(dirStructure);

  // 添加每个文件的内容
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    content += '\n';
    content += '='.repeat(80) + '\n';
    content += `文件 ${i + 1}/${files.length}: ${file.relativePath}\n`;
    content += '='.repeat(80) + '\n\n';

    try {
      const fileContent = fs.readFileSync(file.fullPath, 'utf-8');
      const lines = fileContent.split('\n');

      for (let j = 0; j < lines.length; j++) {
        const lineNum = String(j + 1).padStart(5, ' ');
        content += lineNum + ' | ' + lines[j] + '\n';
      }

      fileCount++;
      console.log(`已处理: ${file.relativePath}`);
    } catch (err) {
      content += 'Error reading file: ' + err.message + '\n';
      console.error(`Error: ${file.relativePath}`);
    }

    content += '\n';
  }

  const outputPath = path.join(__dirname, '隧道照明系统源码文档.txt');
  fs.writeFileSync(outputPath, content, 'utf8');

  console.log('\n' + '='.repeat(80));
  console.log('TXT文档已生成!');
  console.log(`文件路径: ${outputPath}`);
  console.log(`处理文件数: ${fileCount}`);
  console.log(`文档大小: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);
  console.log('='.repeat(80));
}

generateTxtDocument().catch(console.error);
