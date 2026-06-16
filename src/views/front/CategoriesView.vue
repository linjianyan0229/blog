<script setup>
import { ref } from 'vue'
import { publicApi } from '@/api/public'
import EmptyState from '@/components/EmptyState.vue'

const categories = ref([])
const loading = ref(true)

async function load() {
  try {
    categories.value = await publicApi.getCategories()
  } catch {
    categories.value = []
  } finally {
    loading.value = false
  }
}
load()
</script>

<template>
  <div class="container page">
    <header class="page-head">
      <h1>文章<span class="text-gradient">分类</span></h1>
      <p>按主题浏览所有文章</p>
    </header>

    <div v-if="loading" class="grid">
      <div v-for="i in 6" :key="i" class="cat-card sk"></div>
    </div>
    <div v-else-if="categories.length" class="grid">
      <router-link
        v-for="(c, i) in categories"
        :key="c.id"
        :to="{ path: '/articles', query: { categoryId: c.id } }"
        class="cat-card"
        :style="{ animationDelay: `${i * 60}ms` }"
      >
        <div class="cat-ico">{{ (c.name || '#').charAt(0) }}</div>
        <div class="cat-body">
          <h3>{{ c.name }}</h3>
          <p class="clamp-2">{{ c.description || '探索更多精彩内容' }}</p>
        </div>
        <span v-if="c.articleCount != null" class="cat-count">{{ c.articleCount }}</span>
        <span class="cat-arrow">→</span>
      </router-link>
    </div>
    <EmptyState v-else text="还没有分类" icon="🗂" />
  </div>
</template>

<style scoped>
.page {
  padding: var(--space-6) var(--space-5) var(--space-7);
}
.page-head {
  text-align: center;
  margin-bottom: var(--space-6);
}
.page-head h1 {
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 800;
  color: var(--text-strong);
}
.page-head p {
  margin-top: 8px;
  color: var(--text-soft);
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-4);
}
.cat-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: var(--space-4);
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  color: inherit;
  overflow: hidden;
  animation: fade-up 0.5s var(--ease-out) both;
  transition: transform var(--t-base) var(--ease-out), box-shadow var(--t-base),
    border-color var(--t-base);
}
.cat-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
  border-color: var(--brand-soft);
}
.cat-ico {
  flex: none;
  width: 54px;
  height: 54px;
  border-radius: var(--radius-md);
  display: grid;
  place-items: center;
  font-size: 24px;
  font-weight: 800;
  color: #fff;
  background: var(--grad-brand);
  box-shadow: var(--shadow-brand);
}
.cat-body {
  flex: 1;
  min-width: 0;
}
.cat-body h3 {
  font-size: 17px;
  font-weight: 700;
  color: var(--text-strong);
}
.cat-body p {
  margin-top: 4px;
  font-size: 13px;
  color: var(--text-muted);
}
.cat-count {
  position: absolute;
  top: 14px;
  right: 40px;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: var(--radius-pill);
  color: var(--brand);
  background: var(--brand-ghost);
}
.cat-arrow {
  position: absolute;
  right: 16px;
  bottom: 16px;
  color: var(--text-muted);
  transition: transform var(--t-base), color var(--t-base);
}
.cat-card:hover .cat-arrow {
  transform: translateX(4px);
  color: var(--brand);
}
.cat-card.sk {
  height: 90px;
  background: var(--bg-sunken);
  animation: none;
}
</style>
