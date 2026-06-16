<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <div class="nf">
    <div class="orb o1"></div>
    <div class="orb o2"></div>
    <div class="nf-inner">
      <h1 class="code text-gradient">404</h1>
      <p class="msg">页面飘到云端去了…</p>
      <div class="acts">
        <button class="btn btn-primary" @click="router.push('/')">返回首页</button>
        <button class="btn btn-ghost" @click="router.back()">回到上一页</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nf {
  position: relative;
  min-height: 100vh;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: var(--grad-hero);
}
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(70px);
  opacity: 0.5;
  animation: float 8s var(--ease-in-out) infinite;
}
.o1 {
  width: 360px;
  height: 360px;
  top: 8%;
  left: 12%;
  background: radial-gradient(circle, #60a5fa, transparent 70%);
}
.o2 {
  width: 300px;
  height: 300px;
  bottom: 6%;
  right: 14%;
  background: radial-gradient(circle, #818cf8, transparent 70%);
  animation-delay: -3s;
}
.nf-inner {
  position: relative;
  text-align: center;
  animation: fade-up 0.6s var(--ease-out) both;
}
.code {
  font-size: clamp(96px, 20vw, 200px);
  font-weight: 900;
  line-height: 1;
  letter-spacing: -4px;
}
.msg {
  margin: 8px 0 28px;
  font-size: 18px;
  color: var(--text-soft);
}
.acts {
  display: flex;
  gap: 14px;
  justify-content: center;
}
</style>
