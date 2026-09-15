<!-- [软著核心代码] App.vue + 根组件，只包含 router-view + 过渡动画 -->
<template>
  <!-- 路由出口：页面切换时通过 transition 组件实现淡入淡出过渡 -->
  <router-view v-slot="{ Component }">
    <!-- transition 组件：name=fade 对应 CSS 中 .fade-enter-from / .fade-leave-to -->
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<script setup>
// App.vue 作为根组件不需要业务逻辑
// 所有业务状态由子组件和 Pinia store 管理
</script>

<style>
/* 全局重置样式，消除浏览器默认边距 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
html, body, #app {
  width: 100%;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;
  background: #f0f2f5;
}

/* fade 过渡动画：页面切换时的淡入淡出效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
