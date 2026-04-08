import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * 自动化生成 Changeset 脚本
 * 逻辑：
 * 1. 获取自上一个 Tag 之后的所有 Commit
 * 2. 识别每个 Commit 修改的文件路径，自动映射到对应的子包
 * 3. 根据 Commit 类型 (feat/fix/chore) 自动判定版本提升级别 (minor/patch)
 * 4. 为每个受影响的包生成独立的 .changeset/*.md 文件
 */

const PKG_PREFIX = '@vite-project-new/';
const CHANGESET_DIR = '.changeset';

// 解析命令行参数
const args = process.argv.slice(2);
const filterIndex = args.indexOf('--filter');
const filterPkgDir = filterIndex !== -1 ? args[filterIndex + 1] : null;

// 解析版本提升级别
const bumpIndex = args.indexOf('--bump');
const forceBumpType = bumpIndex !== -1 ? args[bumpIndex + 1] : null;

// 获取子包的上一个 Tag (changeset 格式通常为 pkg-name@version)
function getLastTag(pkgName) {
  try {
    // 优先匹配该包自己的 tag
    return execSync(`git describe --tags --abbrev=0 --match "${pkgName}@*"`).toString().trim();
  } catch (e) {
    try {
      // 如果没有包自己的 tag，则获取全局最新的 tag
      return execSync('git describe --tags --abbrev=0').toString().trim();
    } catch (e) {
      // 如果都没有，则获取第一个 Commit
      return execSync('git rev-list --max-parents=0 HEAD').toString().trim();
    }
  }
}

// 获取 Commit 列表，限制在特定路径下
function getCommitsSince(tag, pkgPath) {
  const pathFilter = pkgPath ? `-- ${pkgPath}` : '';
  const logs = execSync(`git log ${tag}..HEAD --pretty=format:"%H|%s" ${pathFilter}`).toString().trim();
  if (!logs) return [];
  return logs.split('\n').map(line => {
    const [hash, msg] = line.split('|');
    return { hash, msg };
  });
}

// 获取 Commit 修改的文件列表
function getModifiedFiles(hash) {
  return execSync(`git show --name-only ${hash} --pretty=""`).toString().trim().split('\n');
}

// 解析 Commit 信息
function parseCommit(msg) {
  // 匹配格式: type(scope): summary
  const match = msg.match(/^(feat|fix|chore|docs|style|refactor|perf|test|build|ci|revert)(\(([^)]+)\))?: (.+)$/);
  if (!match) return null;
  const [_, type, __, scope, summary] = match;
  return { type, scope, summary };
}

// 获取所有子包及其目录
function getPackages() {
  const packagesDir = 'packages';
  if (!fs.existsSync(packagesDir)) return [];
  return fs.readdirSync(packagesDir).map(dir => {
    const pkgJsonPath = path.join(packagesDir, dir, 'package.json');
    if (fs.existsSync(pkgJsonPath)) {
      const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
      return {
        name: pkgJson.name,
        dir: path.join(packagesDir, dir),
        dirName: dir
      };
    }
    return null;
  }).filter(Boolean);
}

// 主逻辑
function run() {
  const allPackages = getPackages();
  
  // 如果指定了过滤器，筛选目标包
  const targetPackages = filterPkgDir 
    ? allPackages.filter(p => p.dirName === filterPkgDir)
    : allPackages;

  if (filterPkgDir && targetPackages.length === 0) {
    console.error(`> 错误: 未找到目录名为 "${filterPkgDir}" 的包。`);
    process.exit(1);
  }

  if (filterPkgDir) {
    console.log(`> 已启用过滤：仅针对包 "${targetPackages[0].name}"`);
    if (forceBumpType) console.log(`> 已强制指定版本提升类型: ${forceBumpType}`);
  }

  // 1. 为每个目标包获取其自上次发布以来的所有相关 Commit
  const commitMap = new Map(); // hash -> { hash, msg, affectedPkgs: Set }

  targetPackages.forEach(pkg => {
    const lastTag = getLastTag(pkg.name);
    console.log(`- 包 ${pkg.name} 的上一次 Tag: ${lastTag}`);
    
    const pkgCommits = getCommitsSince(lastTag, pkg.dir);
    pkgCommits.forEach(({ hash, msg }) => {
      if (!commitMap.has(hash)) {
        commitMap.set(hash, { hash, msg, affectedPkgs: new Set() });
      }
      commitMap.get(hash).affectedPkgs.add(pkg.name);
    });
  });

  const uniqueCommits = Array.from(commitMap.values());

  if (uniqueCommits.length === 0) {
    console.log('> 没有发现新的提交。');
    return;
  }

  console.log(`> 发现 ${uniqueCommits.length} 个相关提交，开始自动生成 Changeset...`);

  // 获取现有的 changeset 文件中的 commit hash，避免重复生成
  const existingHashes = new Set();
  if (fs.existsSync(CHANGESET_DIR)) {
    fs.readdirSync(CHANGESET_DIR).forEach(file => {
      if (file.endsWith('.md') && file !== 'README.md') {
        const content = fs.readFileSync(path.join(CHANGESET_DIR, file), 'utf-8');
        const match = content.match(/\(([a-f0-9]{7,})\)$/);
        if (match) existingHashes.add(match[1]);
      }
    });
  }

  let count = 0;
  uniqueCommits.forEach(({ hash, msg, affectedPkgs }) => {
    const shortHash = hash.substring(0, 7);
    if (existingHashes.has(shortHash)) {
      console.log(`- 提交 ${shortHash} 已存在对应的 Changeset，跳过。`);
      return;
    }

    const parsed = parseCommit(msg);
    if (!parsed) {
      console.log(`- 提交 ${shortHash} 格式不规范 ("${msg}")，跳过。`);
      return;
    }

    // 过滤掉不需要产生版本变动的提交类型
    if (['chore', 'docs', 'test', 'ci', 'build'].includes(parsed.type) && !msg.includes('BREAKING CHANGE')) {
      console.log(`- 提交 ${shortHash} 类型为 ${parsed.type}，不触发版本更新，跳过。`);
      return;
    }

    // 再次确认受影响的包（主要是为了排除掉那些虽然在 targetPackages 中，但实际上此 commit 没改它的包）
    // 虽然 getCommitsSince 已经带了路径过滤，但这里的 affectedPkgs 是针对 targetPackages 的
    // 如果是 global 运行，这步是必须的
    const modifiedFiles = getModifiedFiles(hash);
    const finalAffectedPkgs = new Set();

    modifiedFiles.forEach(file => {
      targetPackages.forEach(pkg => {
        if (file.startsWith(pkg.dir + path.sep) || file === pkg.dir) {
          finalAffectedPkgs.add(pkg.name);
        }
      });
    });

    if (finalAffectedPkgs.size === 0) return;

    // 生成 Changeset 内容
    // 优先级：强制指定 > BREAKING CHANGE > feat (minor) > others (patch)
    const bumpType = forceBumpType || ((msg.includes('BREAKING CHANGE') || parsed.type.includes('!')) ? 'major' : (parsed.type === 'feat' ? 'minor' : 'patch'));
    
    let changesetContent = '---\n';
    finalAffectedPkgs.forEach(pkgName => {
      changesetContent += `"${pkgName}": ${bumpType}\n`;
    });
    changesetContent += '---\n\n';
    
    const scope = parsed.scope || '';
    changesetContent += `${parsed.type} | ${scope} | ${parsed.summary} | ${shortHash}\n`;

    const changesetPath = path.join(CHANGESET_DIR, `auto-${shortHash}.md`);
    fs.writeFileSync(changesetPath, changesetContent);
    console.log(`+ 已为提交 ${shortHash} 生成 Changeset: ${changesetPath}`);
    count++;
  });

  console.log(`\n> 完成！成功生成 ${count} 个 Changeset 文件。`);
}

run();
