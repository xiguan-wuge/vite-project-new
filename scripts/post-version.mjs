import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const date = new Date().toISOString().split('T')[0];

function processChangelog(filePath) {
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const newLines = [];
  let versionFound = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 匹配版本号行，例如 "## 2.3.0"
    const versionMatch = line.match(/^## (\d+\.\d+\.\d+.*)/);
    
    if (versionMatch && !versionFound) {
      versionFound = true;
      // 1. 将 "## 2.3.0" 改为 "### 2.3.0"
      newLines.push(`### ${versionMatch[1]}`);
      // 2. 注入日期
      newLines.push(`\n_${date}_`);
      continue;
    }

    // 3. 替换类型标题并调整级别
    let newLine = line;
    if (line.startsWith('### Major Changes')) {
      newLine = '#### Breaking Changes';
    } else if (line.startsWith('### Minor Changes')) {
      newLine = '#### Features';
    } else if (line.startsWith('### Patch Changes')) {
      newLine = '#### Bug fixes';
    } else if (line.startsWith('### ')) {
       // 其他 h3 标题也降级为 h4
       newLine = line.replace('### ', '#### ');
    }

    newLines.push(newLine);
  }

  fs.writeFileSync(filePath, newLines.join('\n'));
  console.log(`- 已优化 Changelog: ${path.relative(rootDir, filePath)}`);
}

// 获取所有子包
const packagesDir = path.join(rootDir, 'packages');
const packages = fs.readdirSync(packagesDir);

packages.forEach(pkg => {
  const changelogPath = path.join(packagesDir, pkg, 'CHANGELOG.md');
  processChangelog(changelogPath);
});

// 处理根目录
processChangelog(path.join(rootDir, 'CHANGELOG.md'));
