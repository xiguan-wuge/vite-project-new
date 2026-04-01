# Monorepo 自动化版本与 Changelog 管理方案大纲

## 一、 方案背景与目标
在 Monorepo 架构中，手动管理每个子包的 `changeset` 记录往往效率低下且容易遗漏。本方案旨在结合 **Changesets** 的稳健版本管理能力与 **Git 路径检测** 的自动化能力，实现“提交即记录，发布即自动更新”的高级工程化流程。

- **核心目标**：根据 Git Commit 自动识别受影响的子包，并生成细粒度的、符合 Conventional Commits 规范的 Changelog。

## 二、 核心架构设计

### 1. 技术栈组合
- **底层引擎**: [Changesets](https://github.com/changesets/changesets) (负责版本计算、依赖更新、发布流程)。
- **规范校验**: [Commitlint](https://commitlint.js.org/) + [Commitizen](https://github.com/commitizen/cz-cli) (确保提交信息格式统一)。
- **自动化桥接**: 自定义 `auto-gen-changeset` 脚本 (基于 Node.js)。
- **样式增强**: `@changesets/changelog-github` 或类似插件 (生成带链接、分类清晰的专业日志)。

### 2. 自动化识别逻辑 (1-to-N 自动分发)
脚本在执行时将遵循以下逻辑：
1. **提取增量提交**：获取自上次发布（Tag）以来的所有 Git Commit。
2. **分析文件路径**：针对每一条 Commit，使用 `git show --name-only` 获取其修改的文件列表。
3. **映射子包归属**：
   - 路径命中 `packages/pkg-a/**` -> 标记该 Commit 属于 `pkg-a`。
   - 路径命中 `packages/pkg-b/**` -> 标记该 Commit 属于 `pkg-b`。
4. **解析细粒度作用域**：从 Commit Message 中提取 `scope`（如 `feat(button): ...` 中的 `button`），确保 Changelog 能体现组件级的变更。
5. **判定版本提升**：根据 Commit 类型（feat/fix/BREAKING CHANGE）自动判定为 minor/patch/major。

## 三、 预期效果演示

### 1. 开发阶段 (只需关注提交)
开发者正常提交代码：
```bash
git add .
pnpm cz  # 生成：feat(button): 优化按钮点击动效
```

### 2. 发布阶段 (全自动处理)
运行自动化脚本后，各子包的 `CHANGELOG.md` 将自动生成如下格式：

#### `packages/common-styles/CHANGELOG.md`
> ### **2.1.0**
> #### **Features**
> - **button**: 优化按钮点击动效 ([hash](link))
> - **layout**: 增加响应式断点支持 ([hash](link))
> #### **Bug Fixes**
> - **theme**: 修复深色模式颜色偏差 ([hash](link))

## 四、 实施计划 (实施路径)

### 1. 环境增强
- 安装 Changesets 格式化插件，提升 Changelog 的可读性和专业感。
- 放开 `commitlint` 对 `scope` 的静态限制，允许灵活的组件名作为作用域。

### 2. 脚本集成
- 编写 `scripts/auto-changeset.mjs` 核心逻辑脚本。
- 在根目录 `package.json` 集成自动化命令，如 `pnpm gen-changeset`。

### 3. 流程集成
- 将自动化生成步骤整合进现有的 `pnpm version-packages` 流程中。
- 更新 [ENGINEERING_OUTLINE.md](file:///Users/xiguanwuge/codespace/vue3/vite-project-new/ENGINEERING_OUTLINE.md) 文档，确保团队操作一致。

## 五、 方案优势总结
1. **符合行业共性**：采用与 Lerna、Vite 等项目类似的路径识别机制，逻辑严谨。
2. **零漏记风险**：机器扫描确保只要代码有变动，就一定会有对应的版本记录。
3. **极低维护成本**：开发者无需学习复杂的 Changeset 命令，保持原有的开发习惯即可。
4. **精细化展示**： Changelog 能够清晰地区分不同子包及其内部组件的变动详情。
