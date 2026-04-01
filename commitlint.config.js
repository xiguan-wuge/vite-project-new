export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-empty': [0], // 允许 scope 为空
    'scope-case': [0], // 允许任意大小写
  },
};
