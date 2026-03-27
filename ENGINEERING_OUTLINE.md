# 工程化库改造方案大纲

## 一、 提交规范化 (Commit Specification)
通过强制性的校验和交互式的引导，确保所有提交信息符合 [Conventional Commits](https://www.conventionalcommits.org/) 规范。

- **核心工具组**：
  - **Husky**: Git Hooks 管理工具，用于在 `git commit` 前触发校验。
  - **Commitlint**: 校验 Commit Message 是否符合规范（如 `feat:`, `fix:`, `docs:` 等前缀）。
  - **Commitizen**: 提供交互式命令行界面，引导开发者通过“填空”方式生成符合规范的提交信息。
- **流程实现**：
  1. 开发者执行 `git commit`。
  2. Husky 拦截提交动作，触发 Commitlint 检查。
  3. 若格式错误，提交失败并提示。
  4. 推荐使用 `pnpm cz` 代替原始 commit 命令，通过菜单选择类型。

## 二、 版本管理与自动发布 (Versioning & Release)
利用自动化工具接管版本号计算、标签（Tag）生成、变更日志（Changelog）生成以及 NPM 发布流程。

- **核心工具组**：
  - **release-it**: 强大的版本发布自动化工具。
  - **@release-it/conventional-changelog**: 插件，负责根据规范化的提交记录自动生成 `CHANGELOG.md`。
- **功能特性**：
  - **智能版本提升**：根据提交记录自动判断提升 `patch` (fix)、`minor` (feat) 或 `major` (breaking change)。
  - **预发布支持**：支持 `alpha`、`beta`、`rc` 等版本的灵活发布（例如 `1.0.0-alpha.1`）。
  - **自动打标与推送**：自动创建 Git Tag 并推送至远端。
  - **发布同步**：自动执行 `npm publish`（可配置是否跳过）。

## 三、 自动化构建流 (Build Workflow)
确保发布的包始终是经过最新代码编译的产物。

- **流程钩子**：
  - 在 `release-it` 的生命周期钩子中集成 `npm run build`。
  - 确保发布前清理 `dist` 目录并重新打包生成的 **ESM** 和 **UMD** 产物。

---

## 四、 后续实施步骤 (Implementation Steps)

1. **修改 package.json**：配置 `scripts` 脚本，集成上述工具命令。
2. **初始化 Husky**：设置 `commit-msg` 钩子。
3. **配置 Commitlint**：采用 `@commitlint/config-conventional` 预设。
4. **配置 release-it**：创建 `.release-it.json`，定义打包与发布的规则。
5. **权限配置**：确保本地环境已登录 NPM 账号。
