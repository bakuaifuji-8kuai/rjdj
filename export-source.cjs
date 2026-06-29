const { Document, Packer, Paragraph, TextRun, HeadingLevel } = require('docx');
const fs = require('fs');
const path = require('path');

const excludeDirs = ['node_modules', '.git', 'dist'];
const excludeFiles = []; // 不排除任何文件，因为工单和设备模块已删除

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

async function generateWordDocument() {
  console.log('开始生成Word文档...');

  const srcDir = path.join(__dirname, 'src');
  const files = await getAllFiles(srcDir);

  const children = [];

  // 添加标题
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '城市隧道智慧照明系统',
          bold: true,
          size: 48,
        }),
      ],
      heading: HeadingLevel.TITLE,
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '源码文档',
          bold: true,
          size: 36,
        }),
      ],
      heading: HeadingLevel.HEADING_1,
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `生成时间: ${new Date().toLocaleString('zh-CN')}`,
          italics: true,
          size: 24,
        }),
      ],
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `文件总数: ${files.length}`,
          size: 24,
        }),
      ],
    })
  );

  // 添加目录结构
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '目录结构',
          bold: true,
          size: 32,
        }),
      ],
      heading: HeadingLevel.HEADING_1,
    })
  );

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
    const lines = [];
    const sortedKeys = Object.keys(obj).sort();

    for (const key of sortedKeys) {
      const isFile = !Object.keys(obj[key]).length;
      const prefix = '  '.repeat(indent) + (isFile ? '📄 ' : '📁 ');
      lines.push(
        new Paragraph({
          children: [
            new TextRun({
              text: prefix + key,
              size: 20,
              font: 'Consolas',
            }),
          ],
        })
      );

      if (!isFile) {
        lines.push(...printStructure(obj[key], indent + 1));
      }
    }

    return lines;
  }

  children.push(...printStructure(dirStructure));

  // 添加每个文件的内容
  for (const file of files) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: file.relativePath,
            bold: true,
            size: 28,
          }),
        ],
        heading: HeadingLevel.HEADING_1,
      })
    );

    try {
      const content = fs.readFileSync(file.fullPath, 'utf-8');
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const lineNum = String(i + 1).padStart(4, ' ');
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: lineNum + ' │ ' + lines[i],
                size: 18,
                font: 'Consolas',
              }),
            ],
          })
        );
      }
    } catch (err) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Error reading file: ' + err.message,
              color: 'FF0000',
            }),
          ],
        })
      );
    }

    // 分页
    children.push(
      new Paragraph({
        children: [],
        pageBreakBefore: true,
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        children: children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outputPath = path.join(__dirname, '隧道照明系统源码文档.docx');
  fs.writeFileSync(outputPath, buffer);

  console.log(`Word文档已生成: ${outputPath}`);
  console.log(`共 ${files.length} 个源文件`);
}

generateWordDocument().catch(console.error);
