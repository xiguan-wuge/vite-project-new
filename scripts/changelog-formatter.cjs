const changelogFunctions = {
  getReleaseLine: async (changeset, type, changelogOpts) => {
    const [firstLine, ...futureLines] = changeset.summary
      .split("\n")
      .map((l) => l.trimEnd());

    if (!firstLine) return "";

    // 解析结构化内容: type | scope | summary | hash
    const parts = firstLine.split(" | ");
    if (parts.length < 4) {
      return `\n\n- ${firstLine}`;
    }

    const [commitType, scope, summary, hash] = parts;
    const scopeLabel = scope ? `[${scope}] ` : "";
    const commitLink = hash
      ? ` ([${hash}](https://github.com/xiguan-wuge/vite-project-new/commit/${hash}))`
      : "";

    return `\n\n- ${scopeLabel}${summary}${commitLink}`;
  },
  getDependencyReleaseLine: async (
    changesets,
    dependenciesUpdated,
    changelogOpts
  ) => {
    if (dependenciesUpdated.length === 0) return "";

    const updatedDependenciesList = dependenciesUpdated.map(
      (dependency) => `  - ${dependency.name}@${dependency.newVersion}`
    );

    return `\n\n- 依赖更新：\n${updatedDependenciesList.join("\n")}`;
  },
};

module.exports = changelogFunctions;
