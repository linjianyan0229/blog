<script setup>
import AppLogo from '@/components/AppLogo.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'

defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
})
</script>

<template>
  <div class="auth">
    <!-- 左侧品牌展示 -->
    <aside class="brand-side">
      <div class="orb o1"></div>
      <div class="orb o2"></div>
      <div class="orb o3"></div>
      <div class="brand-content">
        <AppLogo />
        <h2 class="slogan">在代码与思考之间，<br />留下属于你的蔚蓝。</h2>
        <p class="brand-desc">现代、流畅、舒适的写作与阅读体验。</p>
        <div class="float-cards">
          <span class="fc fc1">✦ 流畅动效</span>
          <span class="fc fc2">🎨 蓝白主题</span>
          <span class="fc fc3">📝 Markdown</span>
        </div>
      </div>
    </aside>

    <!-- 右侧表单 -->
    <main class="form-side">
      <div class="top-bar">
        <router-link to="/" class="back">← 返回首页</router-link>
        <ThemeToggle />
      </div>
      <div class="form-wrap">
        <div class="form-head">
          <AppLogo class="m-logo" :compact="false" />
          <h1>{{ title }}</h1>
          <p v-if="subtitle">{{ subtitle }}</p>
        </div>
        <slot />
      </div>
    </main>
  </div>
</template>

<style scoped>
.auth {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.1fr 1fr;
}

/* —— 左侧 —— */
.brand-side {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  padding: var(--space-8);
  background: linear-gradient(150deg, #1d4ed8, #2563eb 45%, #3b82f6);
  isolation: isolate;
}
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(50px);
  opacity: 0.5;
  animation: float 9s var(--ease-in-out) infinite;
}
.o1 {
  width: 300px;
  height: 300px;
  top: -60px;
  left: -40px;
  background: #93c5fd;
}
.o2 {
  width: 240px;
  height: 240px;
  bottom: 10%;
  right: -40px;
  background: #818cf8;
  animation-delay: -3s;
}
.o3 {
  width: 180px;
  height: 180px;
  bottom: -40px;
  left: 30%;
  background: #c4b5fd;
  animation-delay: -5s;
}
.brand-content {
  position: relative;
  color: #fff;
  animation: fade-up 0.7s var(--ease-out) both;
}
.brand-content :deep(.logo),
.brand-content :deep(.name) {
  color: #fff;
}
.brand-content :deep(.name b) {
  -webkit-text-fill-color: #dbeafe;
}
.slogan {
  margin: var(--space-6) 0 14px;
  font-size: clamp(24px, 3vw, 34px);
  font-weight: 800;
  line-height: 1.4;
}
.brand-desc {
  font-size: 16px;
  opacity: 0.85;
}
.float-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: var(--space-6);
}
.fc {
  padding: 10px 18px;
  border-radius: var(--radius-pill);
  font-size: 14px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: float 5s var(--ease-in-out) infinite;
}
.fc2 {
  animation-delay: -1.5s;
}
.fc3 {
  animation-delay: -3s;
}

/* —— 右侧 —— */
.form-side {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: var(--space-5) clamp(24px, 6vw, 80px);
  background: var(--bg-body);
}
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-2) 0;
}
.back {
  font-size: 14px;
  color: var(--text-soft);
}
.back:hover {
  color: var(--brand);
}
.form-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 400px;
  width: 100%;
  margin: 0 auto;
  animation: fade-up 0.5s var(--ease-out) both;
}
.form-head {
  margin-bottom: var(--space-6);
}
.m-logo {
  display: none;
}
.form-head h1 {
  margin-top: 14px;
  font-size: 28px;
  font-weight: 800;
  color: var(--text-strong);
}
.form-head p {
  margin-top: 8px;
  color: var(--text-soft);
}

@media (max-width: 880px) {
  .auth {
    grid-template-columns: 1fr;
  }
  .brand-side {
    display: none;
  }
  .m-logo {
    display: inline-flex;
  }
}
</style>
