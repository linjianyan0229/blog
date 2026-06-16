<script setup>
// 顶层只承载路由出口；前台 / 后台各自的布局在路由内部决定。
// 各布局内部对内容区做过渡，避免整页布局抖动。
</script>

<template>
  <router-view />
</template>
