<script setup>
import { ref } from 'vue'
import { publicApi } from '@/api/public'
import EmptyState from '@/components/EmptyState.vue'

const links = ref([])
const loading = ref(true)

async function load() {
  try {
    links.value = await publicApi.getLinks()
  } catch {
    links.value = []
  } finally {
    loading.value = false
  }
}
load()
</script>

<template>
  <div class="container page">
    <header class="page-head">
      <h1>友情<span class="text-gradient">链接</span></h1>
      <p>这些有趣的人和站点，值得一逛</p>
    </header>

    <div v-if="loading" class="grid">
      <div v-for="i in 4" :key="i" class="link-card sk"></div>
    </div>
    <div v-else-if="links.length" class="grid">
      <a
        v-for="(l, i) in links"
        :key="l.id"
        :href="l.url"
        target="_blank"
        rel="noopener noreferrer"
        class="link-card"
        :style="{ animationDelay: `${i * 60}ms` }"
      >
        <div class="logo">
          <img v-if="l.logo" :src="l.logo" :alt="l.name" loading="lazy" />
          <span v-else>{{ (l.name || 'L').charAt(0) }}</span>
        </div>
        <div class="info">
          <h3>{{ l.name }}</h3>
          <p class="clamp-2">{{ l.description || l.url }}</p>
        </div>
      </a>
    </div>
    <EmptyState v-else text="还没有友链" icon="🔗" />
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
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--space-4);
}
.link-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: var(--space-4);
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  color: inherit;
  animation: fade-up 0.5s var(--ease-out) both;
  transition: transform var(--t-base) var(--ease-out), box-shadow var(--t-base),
    border-color var(--t-base);
}
.link-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
  border-color: var(--brand-soft);
}
.logo {
  flex: none;
  width: 50px;
  height: 50px;
  border-radius: var(--radius-md);
  overflow: hidden;
  display: grid;
  place-items: center;
  font-size: 20px;
  font-weight: 800;
  color: #fff;
  background: var(--grad-brand);
}
.logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.info {
  min-width: 0;
}
.info h3 {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-strong);
}
.info p {
  margin-top: 3px;
  font-size: 13px;
  color: var(--text-muted);
}
.link-card.sk {
  height: 82px;
  background: var(--bg-sunken);
  animation: none;
}
</style>
