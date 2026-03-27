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

---

## 五、 操作指南 (Operation Guide)

### 1. 日常开发与提交代码
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

### 2. 发布新版本 (Versioning & Changelog)
当你准备发布一个正式版本（如从 0.0.0 升级到 0.1.0）时：

1. **执行发布命令**：
   ```bash
   pnpm release
   ```
2. **自动化流程**：工具会自动执行以下动作：
   - **自动打包**：运行 `pnpm run build`。
   - **选择版本**：询问升级 Patch (0.0.1), Minor (0.1.0) 或 Major (1.0.0)。
   - **生成日志**：根据提交记录自动更新 `CHANGELOG.md`。
   - **Git 动作**：自动执行 Git Add, Commit 并打上 Tag。

### 3. 发布预发布版本 (Alpha/Beta)
如果你想发布一个测试版本（例如 1.0.0-alpha.0）：

- **发布 Alpha 版**：
  ```bash
  pnpm release --preRelease=alpha
  ```
- **发布 Beta 版**：
  ```bash
  pnpm release --preRelease=beta
  ```

---

## 六、 常见问题 (FAQ)

- **提交报错**：如果看到 `husky - commit-msg hook failed`，说明提交信息不符合规范，请检查前缀是否正确。
- **查看日志**：发布后根目录会自动生成或更新 `CHANGELOG.md`，记录了每个版本的变更明细。
- **NPM 发布**：默认配置中 `npm publish` 是关闭的（见 `.release-it.json`），如需开启请修改为 `"publish": true`。
