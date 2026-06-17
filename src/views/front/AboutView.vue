<script setup>
const stack = [
  { name: 'Vue 3', desc: '组合式 API' },
  { name: 'Vite', desc: '极速构建' },
  { name: 'Vue Router', desc: '前端路由' },
  { name: 'Pinia', desc: '状态管理' },
  { name: 'Element Plus', desc: '后台组件' },
  { name: 'Axios', desc: '网络请求' },
]
const features = [
  { icon: '🎨', title: '蓝白双主题', desc: '跟随系统浅色 / 深色，亦可一键手动切换。' },
  { icon: '✨', title: '流畅交互', desc: '空间感卡片、弹性动效与柔和圆角，观感舒适。' },
  { icon: '📝', title: 'Markdown 渲染', desc: '代码高亮、目录锚点、阅读体验在线。' },
  { icon: '🛡', title: 'RBAC 权限', desc: '角色与权限精细化控制后台访问。' },
]
</script>

<template>
  <div class="container page">
    <section class="intro card">
      <div class="intro-orb"></div>
      <span class="badge">关于本站</span>
      <h1>你好，欢迎来到<span class="text-gradient">我的博客</span> 👋</h1>
      <p>
        这是一个基于 <b>Vue 3 + Vite</b> 构建的现代个人博客前端，搭配 Spring Boot 后端，
        提供文章浏览、分类标签、评论互动与完整的后台管理。设计上追求蓝白通透的视觉、
        流畅的过渡动效与舒适的阅读体验。
      </p>
    </section>

    <section class="block">
      <h2>核心特性</h2>
      <div class="feat-grid">
        <div v-for="(f, i) in features" :key="i" class="feat" :style="{ animationDelay: `${i * 80}ms` }">
          <span class="f-ico">{{ f.icon }}</span>
          <h3>{{ f.title }}</h3>
          <p>{{ f.desc }}</p>
        </div>
      </div>
    </section>

    <section class="block">
      <h2>技术栈</h2>
      <div class="stack">
        <div v-for="(s, i) in stack" :key="i" class="s-pill" :style="{ animationDelay: `${i * 60}ms` }">
          <strong>{{ s.name }}</strong>
          <small>{{ s.desc }}</small>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page {
  padding: var(--space-6) var(--space-5) var(--space-7);
  max-width: 900px;
}
.intro {
  position: relative;
  overflow: hidden;
  padding: clamp(28px, 5vw, 52px);
  text-align: center;
}
.intro-orb {
  position: absolute;
  top: -100px;
  right: -60px;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--brand-soft), transparent 70%);
  filter: blur(30px);
}
.badge {
  display: inline-block;
  padding: 5px 16px;
  font-size: 13px;
  font-weight: 600;
  color: var(--brand);
  background: var(--brand-ghost);
  border-radius: var(--radius-pill);
}
.intro h1 {
  margin: 16px 0 14px;
  font-size: clamp(24px, 4vw, 36px);
  font-weight: 800;
  color: var(--text-strong);
}
.intro p {
  max-width: 640px;
  margin: 0 auto;
  color: var(--text-soft);
  line-height: 1.9;
}
.block {
  margin-top: var(--space-7);
}
.block h2 {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-strong);
  margin-bottom: var(--space-5);
  text-align: center;
}
.feat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-4);
}
.feat {
  padding: var(--space-5);
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  text-align: center;
  animation: fade-up 0.5s var(--ease-out) both;
  transition: transform var(--t-base), box-shadow var(--t-base);
}
.feat:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-lg);
}
.f-ico {
  font-size: 36px;
}
.feat h3 {
  margin: 12px 0 6px;
  color: var(--text-strong);
}
.feat p {
  font-size: 13.5px;
  color: var(--text-muted);
  line-height: 1.6;
}
.stack {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}
.s-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 12px 24px;
  border-radius: var(--radius-md);
  background: var(--bg-elev);
  border: 1px solid var(--border);
  animation: pop-in 0.4s var(--ease-spring) both;
  transition: all var(--t-fast);
}
.s-pill:hover {
  border-color: var(--brand);
  transform: translateY(-3px);
}
.s-pill strong {
  color: var(--brand);
}
.s-pill small {
  font-size: 12px;
  color: var(--text-muted);
}
</style>
