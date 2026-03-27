import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx() // 启用 JSX 支持
  ],
  test: {
    globals: true,
    environment: 'jsdom'
  },
  build: {
    lib: {
      // 库的入口文件
      entry: resolve(__dirname, 'src/index.js'),
      // 库的名称，用于 UMD 模式
      name: 'ViteProjectNew',
      // 输出的文件名
      fileName: (format) => `index.${format}.js`,
      // 指定输出格式
      formats: ['es', 'umd']
    },
    rollupOptions: {
      // 确保外部化处理那些不想打包进库的依赖
      external: ['vue', 'element-plus'],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          vue: 'Vue',
          'element-plus': 'ElementPlus'
        },
        exports: 'named'
      }
    }
  }
})
