// 样式导出入口文件

// 基础样式
import './styles/base.css';

// 组件样式
import './styles/components.css';

// 工具类样式
import './styles/utilities.css';

// 导出样式变量（供 JavaScript 使用）
export const cssVariables = {
  colors: {
    primary: 'var(--color-primary)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    danger: 'var(--color-danger)',
    info: 'var(--color-info)',
    textPrimary: 'var(--color-text-primary)',
    textRegular: 'var(--color-text-regular)',
    textSecondary: 'var(--color-text-secondary)',
    textPlaceholder: 'var(--color-text-placeholder)',
  },
  spacing: {
    xs: 'var(--spacing-xs)',
    sm: 'var(--spacing-sm)',
    md: 'var(--spacing-md)',
    lg: 'var(--spacing-lg)',
    xl: 'var(--spacing-xl)',
  },
  borderRadius: {
    base: 'var(--border-radius-base)',
    small: 'var(--border-radius-small)',
    round: 'var(--border-radius-round)',
    circle: 'var(--border-radius-circle)',
  },
  font: {
    family: 'var(--font-family)',
    sizeBase: 'var(--font-size-base)',
    sizeSmall: 'var(--font-size-small)',
    sizeLarge: 'var(--font-size-large)',
  },
};

// 导出工具函数
/**
 * 应用主题颜色
 * @param {string} color - 颜色名称 (primary, success, warning, danger, info)
 * @returns {Object} CSS 自定义属性对象
 */
export function getThemeColor(color) {
  const colorMap = {
    primary: 'var(--color-primary)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    danger: 'var(--color-danger)',
    info: 'var(--color-info)',
  };
  
  return {
    '--theme-color': colorMap[color] || colorMap.primary,
    '--theme-color-hover': `color-mix(in srgb, ${colorMap[color] || colorMap.primary} 90%, transparent)`,
  };
}

/**
 * 获取间距值
 * @param {string} size - 间距大小 (xs, sm, md, lg, xl)
 * @returns {string} 间距值
 */
export function getSpacing(size) {
  const spacingMap = {
    xs: 'var(--spacing-xs)',
    sm: 'var(--spacing-sm)',
    md: 'var(--spacing-md)',
    lg: 'var(--spacing-lg)',
    xl: 'var(--spacing-xl)',
  };
  
  return spacingMap[size] || spacingMap.md;
}

// 默认导出所有样式
export default {
  install(app) {
    // Vue 插件安装方法
    app.config.globalProperties.$styles = cssVariables;
  },
  ...cssVariables,
};