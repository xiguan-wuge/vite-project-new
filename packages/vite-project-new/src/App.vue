<script setup>
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <div>
  <HelloWorld msg="Vite + Vue" />
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #2028ccaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #1f905daa);
}
</style>
