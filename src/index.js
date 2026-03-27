/*
 * @Author: xiguan wuge 1584077483@qq.com
 * @Date: 2026-03-21 21:16:31
 * @LastEditors: xiguan wuge 1584077483@qq.com
 * @LastEditTime: 2026-03-21 21:17:15
 * @FilePath: /vite-project-new/src/index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import HelloWorld from './components/HelloWorld.vue'
import TableDemo from './components/elementPlus/tableDemo.vue'

export { HelloWorld, TableDemo }

export default {
  install(app) {
    app.component('HelloWorld', HelloWorld)
    app.component('TableDemo', TableDemo)
  }
}
