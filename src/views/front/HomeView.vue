<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useSiteStore } from '@/stores/site'

const router = useRouter()
const { homeBackground, homeIntro } = storeToRefs(useSiteStore())

let navigated = false
function goArticles() {
  if (navigated) return
  navigated = true
  router.push('/articles')
}

// 向下滚轮 / 上滑手势 → 进入文章列表
function onWheel(e) {
  if (e.deltaY > 6) goArticles()
}
let touchStartY = 0
function onTouchStart(e) {
  touchStartY = e.touches[0].clientY
}
function onTouchMove(e) {
  if (touchStartY - e.touches[0].clientY > 36) goArticles()
}

onMounted(() => {
  window.addEventListener('wheel', onWheel, { passive: true })
  window.addEventListener('touchstart', onTouchStart, { passive: true })
  window.addEventListener('touchmove', onTouchMove, { passive: true })
})
onUnmounted(() => {
  window.removeEventListener('wheel', onWheel)
  window.removeEventListener('touchstart', onTouchStart)
  window.removeEventListener('touchmove', onTouchMove)
})
</script>

<template>
  <section class="hero" :class="{ 'has-bg': homeBackground }">
    <div
      class="hero-bg"
      :style="homeBackground ? { backgroundImage: `url(${homeBackground})` } : undefined"
    ></div>
    <template v-if="!homeBackground">
      <div class="hero-orb orb1"></div>
      <div class="hero-orb orb2"></div>
    </template>

    <div class="container hero-inner">
      <span class="badge animate-pop">✦ 蔚蓝 · 记录与分享</span>
      <h1 class="hero-title">
        在<span class="text-gradient">代码</span>与<span class="text-gradient">思考</span>之间
      </h1>
      <p class="hero-sub">
        {{ homeIntro || '一个现代、流畅、蓝白主题的个人博客 —— 探索技术，沉淀想法。' }}
      </p>
      <div class="hero-actions">
        <button class="btn btn-primary lg" @click="goArticles">浏览文章 →</button>
        <router-link to="/about" class="btn btn-ghost lg">关于本站</router-link>
      </div>
    </div>

    <button class="scroll-down" type="button" aria-label="浏览文章" @click="goArticles">
      <span class="sd-text">向下浏览</span>
      <span class="sd-mouse"><span class="sd-wheel"></span></span>
    </button>
  </section>
</template>

<style scoped>
/* —— Hero（首屏占满视口） —— */
.hero {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  min-height: calc(100vh - var(--header-h));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-7) 0;
}
.hero-bg {
  position: absolute;
  inset: 0;
  z-index: -2;
  background: var(--grad-hero);
  background-size: cover;
  background-position: center;
}
/* 自定义首页背景图时，底部融入页面背景，保证文字可读 */
.hero.has-bg .hero-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(15, 23, 42, 0.42) 0%,
    rgba(15, 23, 42, 0.2) 45%,
    var(--bg-body) 99%
  );
}
.hero.has-bg .hero-title,
.hero.has-bg .hero-sub {
  color: #fff;
  text-shadow: 0 2px 14px rgba(0, 0, 0, 0.45);
}
.hero.has-bg .badge {
  color: #fff;
  background: rgba(255, 255, 255, 0.18);
  border-color: rgba(255, 255, 255, 0.32);
}
.hero.has-bg .scroll-down {
  color: rgba(255, 255, 255, 0.9);
}
.hero.has-bg .btn-ghost {
  color: #fff;
  background: rgba(255, 255, 255, 0.14);
  border-color: rgba(255, 255, 255, 0.34);
}
.hero.has-bg .btn-ghost:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.24);
}

.hero-orb {
  position: absolute;
  z-index: -1;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.5;
  animation: float 9s var(--ease-in-out) infinite;
}
.orb1 {
  width: 340px;
  height: 340px;
  top: 8%;
  right: 10%;
  background: radial-gradient(circle, #60a5fa, transparent 70%);
}
.orb2 {
  width: 280px;
  height: 280px;
  bottom: 10%;
  left: 6%;
  background: radial-gradient(circle, #818cf8, transparent 70%);
  animation-delay: -4s;
}

.hero-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 18px;
}
.badge {
  padding: 6px 16px;
  font-size: 13px;
  font-weight: 600;
  color: var(--brand);
  background: var(--glass-bg);
  border: 1px solid var(--brand-soft);
  border-radius: var(--radius-pill);
  backdrop-filter: blur(8px);
}
.hero-title {
  font-size: clamp(34px, 5.5vw, 58px);
  font-weight: 800;
  line-height: 1.18;
  color: var(--text-strong);
  letter-spacing: -0.5px;
}
.hero-sub {
  max-width: 580px;
  color: var(--text-soft);
  font-size: clamp(15px, 2vw, 18px);
}
.hero-actions {
  display: flex;
  gap: 14px;
  margin-top: 10px;
  flex-wrap: wrap;
  justify-content: center;
}
.btn.lg {
  height: 50px;
  padding-inline: 30px;
  font-size: 15px;
}

/* —— 向下滚动指示 —— */
.scroll-down {
  position: absolute;
  left: 50%;
  bottom: 24px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--text-soft);
  transition: color var(--t-fast), transform var(--t-fast) var(--ease-out);
}
.scroll-down:hover {
  color: var(--brand);
  transform: translateX(-50%) translateY(-3px);
}
.sd-text {
  font-size: 12px;
  letter-spacing: 2px;
}
.sd-mouse {
  position: relative;
  width: 24px;
  height: 38px;
  border: 2px solid currentColor;
  border-radius: var(--radius-pill);
}
.sd-wheel {
  position: absolute;
  left: 50%;
  top: 7px;
  width: 4px;
  height: 8px;
  margin-left: -2px;
  border-radius: 2px;
  background: currentColor;
  animation: sd-scroll 1.7s var(--ease-in-out) infinite;
}
@keyframes sd-scroll {
  0% {
    opacity: 0;
    transform: translateY(0);
  }
  35% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(13px);
  }
}
</style>
