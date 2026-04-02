# 工程化库改造方案手册 (Monorepo 版)

## 一、 架构模式: Monorepo
项目采用 **pnpm workspace** 进行多包管理，结构如下：
- `packages/`：存放所有的子包。
- `package.json` (根目录)：管理工作区级的依赖和脚本。

## 二、 提交规范化 (Commit Specification)
通过强制性的校验和交互式的引导，确保所有提交信息符合 [Conventional Commits](https://www.conventionalcommits.org/) 规范。

- **核心工具组**：
  - **Husky**: Git Hooks 管理工具，用于在 `git commit` 前触发校验。
  - **Commitlint**: 校验 Commit Message 是否符合规范（如 `feat:`, `fix:`, `docs:` 等前缀）。
  - **Commitizen**: 提供交互式命令行界面，引导开发者通过“填空”方式生成符合规范的提交信息。
- **流程实现**：
  1. 开发者执行 `git add` 暂存更改。
  2. 开发者执行 `git commit` 或 `pnpm cz`。
  3. Husky 拦截提交动作，触发 `commitlint` 检查。
  4. 若格式错误，提交失败并提示。

## 三、 版本管理与自动化发布 (Versioning & Automation)
利用 **Changesets** 接管独立版本号计算、标签（Tag）生成、变更日志（Changelog）生成以及云端自动发布流程。

- **核心工具组**：
  - **Changesets**: 负责收集变更、更新子包版本和发布。
  - **GitHub Actions**: 负责在云端监听 Tag 动作并执行最终的构建与 NPM 发布。

## 四、 CI/CD 自动化流水线 (CI/CD Pipeline)
项目配置了两套 **GitHub Actions** 流水线：

1. **持续集成 (CI - 校验与测试)**
   - **触发**：所有分支的 `push` 和 `Pull Request`。
   - **动作**：自动运行代码风格检查 (Lint)、单元测试 (Test) 和构建验证 (Build Check)。
2. **持续交付 (CD - 自动化发布)**
   - **触发**：当推送到以 `v*` 开头的 Git Tag 时。
   - **动作**：自动化构建产物 -> 执行 `changeset publish` 发布到 NPM -> 创建 GitHub Release。

---

## 五、 操作指南 (Operation Guide)

### 1. 代码质量与测试
在提交前，建议从根目录运行以下命令：
- **代码检查**：`pnpm run lint` (检查所有子包)
- **格式化代码**：`pnpm run format` (统一工作区代码风格)
- **运行测试**：`pnpm run test` (执行所有子包测试)

### 2. 日常开发与提交代码
- **常规提交**：使用 `pnpm cz` 按照交互式引导生成规范的提交信息。
- **作用域支持**：支持细粒度的作用域（如 `feat(button): ...`），这些信息将直接体现到子包的 Changelog 中。
- **自动记录变更 (Changeset)**：
  项目集成了自动化检测脚本。你**不需要**再手动运行 `pnpm changeset`，发布脚本会自动扫描 Git Commit 并分发到各子包。

### 3. 发布新版本流程 (关键)

1. **合并代码**：确保所有变更已合并到主分支。
2. **自动化生成变更并更新版本**：
   ```bash
   pnpm version-packages
   ```
   - **自动化逻辑**：该命令会运行 `pnpm gen-changeset`，它根据自上次 Tag 以来修改的文件路径，自动识别受影响的子包，并提取 Commit 中的 `type` (feat/fix) 和 `scope` 生成变更记录。
   - **格式化增强**：会自动为 `CHANGELOG.md` 注入发布日期、Commit 哈希链接，并按 `Features`、`Bug fixes` 等类型分组展示。
3. **手动干预版本（可选）**：
   - 如果你想手动选择版本提升类型（Major/Minor/Patch），请运行：
     ```bash
     pnpm changeset
     ```
4. **发布先行版本 (Alpha/Beta/RC)**：
    - 进入预发布模式：`pnpm changeset pre enter alpha`
    - 正常运行 `pnpm version-packages` 更新版本（如 `1.0.0-alpha.0`）
    - 退出预发布模式：`pnpm changeset pre exit`
 5. **仅发布单个子包（按需）**：
    如果你只想更新并发布其中一个包，可以跳过全局的 `pnpm version-packages`，手动执行以下步骤：
    - **生成目标包记录**：`pnpm gen-changeset -- --filter <pkg-dir>`（例如 `common-styles`）
    - **更新版本与日志**：`pnpm changeset version && node scripts/post-version.mjs`
    - **仅构建目标包**：`pnpm --filter <pkg-name> run build`（例如 `@vite-project-new/common-styles`）
    - **生成该包的 Tag**：`pnpm changeset tag`
 6. **提交版本更新并打标签**：
   ```bash
   git add .
   git commit -m "chore: version packages"
   pnpm tag
   ```
   - **pnpm tag**：会执行 `pnpm build` 并根据当前包版本生成本地 Git Tag，但不执行发布动作。
6. **推送到远端**：
   ```bash
   git push --follow-tags
   ```
7. **执行正式发布 (按需)**：
   如果你需要将包发布到 NPM 仓库，请执行：
   ```bash
   pnpm release
   ```

---

## 六、 常见问题 (FAQ)

- **如何添加新子包？**：在 `packages/` 下新建文件夹并初始化 `package.json`，之后运行 `pnpm install`。
- **子包之间如何引用？**：使用 `pnpm add <package-name> --filter <target-package>`，pnpm 会自动建立 workspace 软链接。
