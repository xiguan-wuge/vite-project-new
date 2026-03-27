# 工程化库改造方案手册

## 一、 提交规范化 (Commit Specification)
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

## 二、 版本管理与自动化发布 (Versioning & Automation)
利用自动化工具接管版本号计算、标签（Tag）生成、变更日志（Changelog）生成以及云端自动发布流程。

- **核心工具组**：
  - **release-it**: 强大的版本发布自动化工具，负责本地版本号更新、打标和推送。
  - **@release-it/conventional-changelog**: 插件，负责根据规范化的提交记录自动生成 `CHANGELOG.md`。
  - **GitHub Actions**: 负责在云端监听 Tag 动作并执行最终的构建与 NPM 发布。

## 三、 CI/CD 自动化流水线 (CI/CD Pipeline)
为了提升交付质量并实现全自动化发布，项目配置了两套 **GitHub Actions** 流水线：

1. **持续集成 (CI - 校验与测试)**
   - **触发**：所有分支的 `push` 和 `Pull Request`。
   - **动作**：自动运行代码风格检查 (Lint)、单元测试 (Test) 和构建验证 (Build Check)。
2. **持续交付 (CD - 自动化发布)**
   - **触发**：当推送到以 `v*` 开头的 Git Tag 时。
   - **动作**：自动化构建产物 -> 发布到 NPM -> 创建 GitHub Release。

---

## 四、 操作指南 (Operation Guide)

### 1. 代码质量与测试
在提交前，建议手动运行以下命令确保代码质量：
- **代码检查**：`pnpm run lint` (自动修复简单问题)
- **格式化代码**：`pnpm run format` (统一代码风格)
- **运行测试**：`pnpm run test` (执行单元测试)

### 2. 日常开发与提交代码
为了确保提交记录符合规范并能自动生成日志，请遵循以下方式：

- **推荐方式：交互式提交**
  执行 `git add .` 后，运行：
  ```bash
  pnpm cz
  ```
  按照终端提示选择提交类型（feat, fix 等）并填写描述。

- **手动提交规范**
  格式：`<type>(<scope>): <subject>`
  - 例子：`feat: 增加用户登录功能`
  - 例子：`fix(table): 修复分页显示异常`

### 3. 发布新版本流程 (关键)
发布一个新版本（如从 `0.1.0` 升级到 `0.2.0`）的完整步骤：

1. **准备工作**：确保代码已合并至主分支，且本地没有未提交的更改。
2. **配置 Secrets (仅需一次)**：
   - 在 GitHub 仓库设置中：`Settings > Secrets and variables > Actions`。
   - 添加 `NPM_TOKEN`，其值为 NPM 官网申请的 `Automation` 类型 Token。
3. **执行发布命令**：
   ```bash
   pnpm release
   ```
4. **选择版本**：按照提示选择升级 Patch, Minor 或 Major。工具会自动：
   - 运行本地测试与打包。
   - 更新 `package.json` 版本号。
   - 生成/更新 `CHANGELOG.md`。
   - 提交更改并打上 Git Tag。
5. **推送到远端**：
   ```bash
   git push --follow-tags
   ```
6. **云端接管**：GitHub Actions 会自动触发发布流水线，完成最终的 NPM 发布。

### 4. 发布预发布版本 (Alpha/Beta)
如果你想发布一个测试版本（例如 `1.0.0-alpha.0`）：
- **发布 Alpha 版**：`pnpm release --preRelease=alpha`
- **发布 Beta 版**：`pnpm release --preRelease=beta`

---

## 五、 常见问题 (FAQ)

- **提交报错**：如果看到 `husky - commit-msg hook failed`，说明提交信息不符合规范，请检查前缀是否正确。
- **本地构建报错**：`release-it` 在发布前会执行 `pnpm run build`。如果打包失败，发布流程将终止。
- **GitHub Actions 失败**：请检查 GitHub Actions 的日志，通常是因为缺少 `NPM_TOKEN` 或 NPM 账号权限问题。
