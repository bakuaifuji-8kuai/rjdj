const fs = require('fs');
const path = require('path');

// 需要替换的层级数据映射
const replacements = {
  '梅溪湖隧道': '先导路',
  '梅溪湖隧道1栋': '力唯中天1栋',
  '梅溪湖隧道2栋': '力唯中天2栋',
  '梅溪湖隧道3栋': '力唯中天3栋'
};

// 只处理src目录下的Vue文件，排除dist目录
const targetDir = path.join(__dirname, 'src');

console.log('开始批量更新层级数据...\n');

// 遍历目录的函数
function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.vue') || file.endsWith('.js')) {
      processFile(filePath);
    }
  }
}

// 处理单个文件
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  for (const [oldStr, newStr] of Object.entries(replacements)) {
    if (content.includes(oldStr)) {
      content = content.replaceAll(oldStr, newStr);
      modified = true;
    }
  }
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`已更新: ${filePath.replace(__dirname, '')}');
  }
}

// 开始处理
processDirectory(targetDir);
console.log('\n所有文件更新完成！');
