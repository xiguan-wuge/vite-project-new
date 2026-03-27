import pluginVue from 'eslint-plugin-vue'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import vueParser from 'vue-eslint-parser'
import babelParser from '@babel/eslint-parser'

/**
 * ESLint Flat Config (v9+) 配置文件
 * 采用平面配置模式，所有的配置都在此数组中定义
 */
export default [
  // 1. 指定需要进行校验的文件范围
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,mjs,jsx,vue,cjs}'],
  },

  // 2. 全局忽略规则 (替代旧版的 .eslintignore)
  {
    name: 'app/files-to-ignore',
    ignores: [
      '**/dist/**', 
      '**/dist-ssr/**', 
      '**/coverage/**', 
      'node_modules/**', 
      '.vscode/**', 
      'public/**', 
      '*.md'
    ],
  },

  // 3. 继承 Vue 官方推荐的插件配置 (基础/必要规则)
  ...pluginVue.configs['flat/essential'],
  
  // 4. 集成 Prettier 配置，关闭与 Prettier 冲突的格式化规则
  skipFormatting,

  // 5. 核心解析与规则配置
  {
    languageOptions: {
      // 使用 vue-eslint-parser 作为顶层解析器，处理 .vue 文件
      parser: vueParser,
      parserOptions: {
        // 对于 .vue 文件中的 <script> 或纯 JS/JSX 文件，使用 babel-parser 进行解析
        parser: babelParser,
        ecmaVersion: 'latest',
        sourceType: 'module',
        requireConfigFile: false,
        babelOptions: {
          // 启用 JSX 语法支持，适配项目中的 JSX 组件
          plugins: [
            '@babel/plugin-transform-react-jsx'
          ]
        },
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    // 自定义业务规则
    rules: {
      // 关闭 Vue 组件名必须为多单词的限制 (方便小型组件开发)
      'vue/multi-word-component-names': 'off',
      // 生产环境下警告 console/debugger，开发环境下允许使用
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
    }
  }
]
