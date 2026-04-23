import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const today = new Date().toISOString().split('T')[0];

const TYPE_MAPPING = {
  'feat': 'Features',
  'fix': 'Bug fixes',
  'refactor': 'Code Refactoring',
  'perf': 'Performance',
  'revert': 'Reverts',
  'docs': 'Documentation',
  'style': 'Styles',
  'chore': 'Miscellaneous',
  'build': 'Build',
  'ci': 'CI/CD',
  'test': 'Tests',
};

const SECTION_ORDER = [
  'Breaking Changes',
  'Features',
  'Bug fixes',
  'Code Refactoring',
  'Performance',
  'Reverts',
  'Documentation',
  'Styles',
  'Miscellaneous',
  'Build',
  'CI/CD',
  'Tests',
];

function parseChangesetEntry(line) {
  if (!line.startsWith('- ')) return null;
  
  const content = line.substring(2).trim();
  const parts = content.split(' | ');
  
  if (parts.length >= 4) {
    return {
      type: parts[0] || 'Miscellaneous',
      scope: parts[1] || '',
      summary: parts[2] || '',
      hash: parts[3]?.replace('[BREAKING]', '').trim() || '',
      isBreaking: content.includes('[BREAKING]'),
      original: line,
    };
  }
  
  const hashMatch = content.match(/\(([a-f0-9]{7,40})\)$/);
  const scopeMatch = content.match(/^\*\*\[([^\]]+)\]\*\*/);
  
  return {
    type: 'Miscellaneous',
    scope: scopeMatch ? scopeMatch[1] : '',
    summary: content.replace(/\*\*\[([^\]]+)\]\*\*/g, '').trim(),
    hash: hashMatch ? hashMatch[1] : '',
    isBreaking: false,
    original: line,
  };
}

function reorganizeByType(content) {
  const lines = content.split('\n');
  const result = [];
  let versionBlock = [];
  let currentVersion = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.startsWith('## ') || line.startsWith('### ')) {
      if (versionBlock.length > 0 && currentVersion) {
        result.push(...processVersionBlock(currentVersion, versionBlock));
        result.push('');
      }
      
      currentVersion = line;
      versionBlock = [];
      continue;
    }
    
    if (currentVersion) {
      versionBlock.push(line);
    } else {
      result.push(line);
    }
  }
  
  if (versionBlock.length > 0 && currentVersion) {
    result.push(...processVersionBlock(currentVersion, versionBlock));
  }
  
  return result.join('\n');
}

function processVersionBlock(versionLine, lines) {
  const entries = [];
  let inSection = false;
  
  for (const line of lines) {
    if (line.startsWith('### ') || line.startsWith('#### ')) {
      inSection = true;
      continue;
    }
    
    if (line.trim() === '') {
      inSection = false;
      continue;
    }
    
    if (inSection && (line.startsWith('- ') || line.startsWith('* '))) {
      const parsed = parseChangesetEntry(line);
      if (parsed) {
        entries.push(parsed);
      }
    }
  }
  
  const grouped = {};
  entries.forEach(entry => {
    const sectionName = entry.isBreaking ? 'Breaking Changes' : entry.type;
    if (!grouped[sectionName]) {
      grouped[sectionName] = [];
    }
    grouped[sectionName].push(entry);
  });
  
  const result = [];
  result.push(versionLine.startsWith('## ') ? versionLine.replace('## ', '### ') : versionLine);
  result.push('');
  result.push(`_${today}_`);
  result.push('');
  
  SECTION_ORDER.forEach(section => {
    if (grouped[section]) {
      result.push(`#### ${section}`);
      result.push('');
      
      grouped[section].forEach(entry => {
        const scopeLabel = entry.scope ? `[${entry.scope}] ` : '';
        const hashLink = entry.hash ? ` ([${entry.hash}](https://github.com/xiguan-wuge/vite-project-new/commit/${entry.hash}))` : '';
        result.push(`- ${scopeLabel}${entry.summary}${hashLink}`);
      });
      
      result.push('');
    }
  });
  
  return result.filter((line, idx, arr) => line.trim() !== '' || idx < arr.length - 1);
}

function processChangelog(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`- 跳过不存在的文件: ${path.relative(rootDir, filePath)}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  content = reorganizeByType(content);
  
  content = content.replace(/\n{3,}/g, '\n\n');
  
  fs.writeFileSync(filePath, content.trim() + '\n');
  console.log(`- 已优化 Changelog: ${path.relative(rootDir, filePath)}`);
}

const packagesDir = path.join(rootDir, 'packages');
if (fs.existsSync(packagesDir)) {
  const packages = fs.readdirSync(packagesDir);
  packages.forEach(pkg => {
    const changelogPath = path.join(packagesDir, pkg, 'CHANGELOG.md');
    processChangelog(changelogPath);
  });
}

processChangelog(path.join(rootDir, 'CHANGELOG.md'));
console.log('\n> Changelog 优化完成！');
