<script setup>
import { ref } from 'vue'
import { publicApi } from '@/api/public'
import EmptyState from '@/components/EmptyState.vue'

const tags = ref([])
const loading = ref(true)

// 给标签云一些尺寸/色阶变化，增强层次
const sizes = ['s1', 's2', 's3', 's4', 's5']
function sizeOf(tag, i) {
  const n = tag.articleCount != null ? tag.articleCount : (i * 7) % 20
  if (n >= 16) return 's5'
  if (n >= 10) return 's4'
  if (n >= 5) return 's3'
  if (n >= 2) return 's2'
  return sizes[i % sizes.length]
}

async function load() {
  try {
    tags.value = await publicApi.getTags()
  } catch {
    tags.value = []
  } finally {
    loading.value = false
  }
}
load()
</script>

<template>
  <div class="container page">
    <header class="page-head">
      <h1>标签<span class="text-gradient">云</span></h1>
      <p>顺着兴趣的标签，发现更多</p>
    </header>

    <div v-if="loading" class="cloud">
      <span v-for="i in 12" :key="i" class="tag sk" :style="{ width: `${60 + (i % 4) * 24}px` }"></span>
    </div>
    <div v-else-if="tags.length" class="cloud">
      <router-link
        v-for="(t, i) in tags"
        :key="t.id"
        :to="{ path: '/articles', query: { tagId: t.id } }"
        class="tag"
        :class="sizeOf(t, i)"
        :style="{ animationDelay: `${i * 40}ms` }"
      >
        <span class="hash">#</span>{{ t.name }}
        <small v-if="t.articleCount != null">{{ t.articleCount }}</small>
      </router-link>
    </div>
    <EmptyState v-else text="还没有标签" icon="🏷" />
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
.cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  max-width: 820px;
  margin: 0 auto;
}
.tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 8px 18px;
  border-radius: var(--radius-pill);
  font-weight: 600;
  color: var(--text-soft);
  background: var(--bg-elev);
  border: 1px solid var(--border);
  animation: pop-in 0.4s var(--ease-spring) both;
  transition: all var(--t-fast) var(--ease-out);
}
.tag .hash {
  color: var(--brand);
  opacity: 0.6;
}
.tag small {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 500;
}
.tag:hover {
  color: #fff;
  background: var(--grad-brand);
  border-color: transparent;
  transform: translateY(-3px) scale(1.05);
  box-shadow: var(--shadow-brand);
}
.tag:hover .hash,
.tag:hover small {
  color: rgba(255, 255, 255, 0.85);
}
.tag.s1 { font-size: 14px; }
.tag.s2 { font-size: 15px; }
.tag.s3 { font-size: 16px; }
.tag.s4 { font-size: 18px; }
.tag.s5 { font-size: 20px; }
.tag.sk {
  height: 38px;
  background: var(--bg-sunken);
  border: none;
  animation: none;
}
</style>
