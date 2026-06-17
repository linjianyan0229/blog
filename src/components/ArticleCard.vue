<script setup>
import { computed } from 'vue'
import { fromNow, compactNumber } from '@/utils/format'

const props = defineProps({
  article: { type: Object, required: true },
  index: { type: Number, default: 0 },
})

const cover = computed(() => props.article.thumbnail || '')
const initial = computed(() => (props.article.authorName || 'A').charAt(0).toUpperCase())
const delay = computed(() => `${Math.min(props.index, 8) * 60}ms`)
</script>

<template>
  <article class="a-card" :style="{ animationDelay: delay }">
    <router-link :to="`/article/${article.id}`" class="card-link">
      <div class="cover" :class="{ 'no-img': !cover }">
        <img v-if="cover" :src="cover" :alt="article.title" loading="lazy" />
        <div v-else class="cover-ph">
          <span>{{ initial }}</span>
        </div>
        <span v-if="article.top === 1" class="top-flag">置顶</span>
        <span v-if="article.categoryName" class="cat-flag">{{ article.categoryName }}</span>
      </div>

      <div class="body">
        <h3 class="title clamp-2">
          <span v-if="article.hasPassword" class="lock-tag" title="加密文章">🔒</span>{{ article.title }}
        </h3>
        <p class="summary clamp-2">{{ article.summary || '暂无摘要…' }}</p>

        <div v-if="article.tags?.length" class="tags">
          <span v-for="t in article.tags.slice(0, 3)" :key="t" class="chip">#{{ t }}</span>
        </div>

        <div class="meta">
          <div class="author">
            <img v-if="article.authorAvatar" :src="article.authorAvatar" alt="" />
            <span v-else class="a-fallback">{{ initial }}</span>
            <span class="a-name">{{ article.authorName || '佚名' }}</span>
          </div>
          <div class="stats">
            <span title="阅读"><i>👁</i>{{ compactNumber(article.viewCount) }}</span>
            <span title="点赞"><i>♥</i>{{ compactNumber(article.likeCount) }}</span>
            <span title="评论"><i>💬</i>{{ compactNumber(article.commentCount) }}</span>
          </div>
        </div>
        <time class="date">{{ fromNow(article.createTime) }}</time>
      </div>
    </router-link>
  </article>
</template>

<style scoped>
.a-card {
  animation: fade-up 0.6s var(--ease-out) both;
  perspective: 1000px;
}
.card-link {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  color: inherit;
  transition: transform var(--t-base) var(--ease-out), box-shadow var(--t-base) var(--ease-out),
    border-color var(--t-base);
  will-change: transform;
}
.card-link:hover {
  transform: translateY(-8px) rotateX(2deg);
  box-shadow: var(--shadow-lg);
  border-color: var(--brand-soft);
}

.cover {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: var(--grad-sky);
}
.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--t-slow) var(--ease-out);
}
.card-link:hover .cover img {
  transform: scale(1.08);
}
.cover-ph {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  background: var(--grad-brand);
}
.cover-ph span {
  font-size: 48px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.85);
}
.top-flag,
.cat-flag {
  position: absolute;
  top: 12px;
  padding: 3px 12px;
  font-size: 12px;
  font-weight: 600;
  border-radius: var(--radius-pill);
  backdrop-filter: blur(6px);
}
.top-flag {
  left: 12px;
  color: #fff;
  background: rgba(245, 158, 11, 0.92);
}
.cat-flag {
  right: 12px;
  color: var(--brand-strong);
  background: var(--glass-bg);
}

.body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: var(--space-4);
  flex: 1;
}
.title {
  font-size: 17px;
  font-weight: 700;
  color: var(--text-strong);
  line-height: 1.4;
  transition: color var(--t-fast);
}
.lock-tag {
  font-size: 13px;
  margin-right: 4px;
  vertical-align: 1px;
}
.card-link:hover .title {
  color: var(--brand);
}
.summary {
  font-size: 13.5px;
  color: var(--text-soft);
  line-height: 1.6;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px solid var(--divider);
}
.author {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  color: var(--text-soft);
}
.author img,
.a-fallback {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}
.a-fallback {
  display: grid;
  place-items: center;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  background: var(--grad-brand);
}
.stats {
  display: flex;
  gap: 10px;
  font-size: 12.5px;
  color: var(--text-muted);
}
.stats span {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}
.stats i {
  font-style: normal;
  font-size: 11px;
}
.date {
  font-size: 12px;
  color: var(--text-muted);
}
</style>
