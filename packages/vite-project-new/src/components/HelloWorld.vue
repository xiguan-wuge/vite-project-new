<!--
 * @Author: xiguan wuge 1584077483@qq.com
 * @Date: 2025-02-24 00:26:37
 * @LastEditors: xiguan wuge 1584077483@qq.com
 * @LastEditTime: 2026-03-21 23:06:15
 * @FilePath: /vite-project-new/src/components/HelloWorld.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<script setup>
import { ref } from 'vue'
import tableDemo from './elementPlus/tableDemo.vue';
import macImage from '../assets/images/mac.png';

defineProps({
  msg: String,
})

const count = ref(0)
</script>

<template>
  <h1>{{ msg }}</h1>
  <tableDemo></tableDemo>
  <div class="img-wrapper"></div>
  <hr>
  <div class="img-wrapper img2" :style="{ backgroundImage: `url(${macImage})` }"></div>
</template>

<style scoped>
/**
 * 读取文档样式 - 验证多包changelog功能
 */
.read-the-docs {
  color: #888;
}
.img-wrapper {
  width: 200px;
  height: 200px;
  background-image: url('../assets/che.jpeg');
  background-size: 100%;
  background-repeat: no-repeat;
}
.img2 {
  /* background-image: url('../assets/images/mac.png'); */
}
</style>
