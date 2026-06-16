<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { publicApi } from '@/api/public'
import { renderMarkdown, slugify } from '@/utils/markdown'
import { formatDate, compactNumber } from '@/utils/format'
import { toast } from '@/utils/message'
import CommentSection from '@/components/CommentSection.vue'
import EmptyState from '@/components/EmptyState.vue'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const article = ref(null)
const liked = ref(false)
const liking = ref(false)
const activeAnchor = ref('')
const contentEl = ref(null)

const html = computed(() => (article.value ? renderMarkdown(article.value.content) : ''))
const toc = computed(() => article.value?.toc || [])

let observer = null

async function load(id) {
  loading.value = true
  observer?.disconnect()
  try {
    article.value = await publicApi.getArticle(id)
    liked.value = false
    await nextTick()
    setupTocObserver()
  } catch (e) {
    if (e.code === 1010) {
      toast.warning('该文章未公开，请登录后查看')
      router.replace({ path: '/login', query: { redirect: route.fullPath } })
    } else {
      article.value = null
    }
  } finally {
    loading.value = false
  }
}

function setupTocObserver() {
  if (!contentEl.value) return
  const heads = contentEl.value.querySelectorAll('h1, h2, h3')
  if (!heads.length) return
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) activeAnchor.value = en.target.id
      })
    },
    { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
  )
  heads.forEach((h) => observer.observe(h))
}

function scrollToAnchor(text) {
  const id = slugify(text)
  const el = document.getElementById(id)
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY - 80
    window.scrollTo({ top, behavior: 'smooth' })
  }
}

async function toggleLike() {
  if (liking.value) return
  liking.value = true
  try {
    const count = await publicApi.likeArticle(article.value.id)
    article.value.likeCount = typeof count === 'number' ? count : article.value.likeCount + 1
    liked.value = true
    toast.success('感谢点赞 ♥')
  } finally {
    liking.value = false
  }
}

function onCommentChange(delta) {
  if (article.value) article.value.commentCount = Math.max(0, article.value.commentCount + delta)
}

onBeforeUnmount(() => observer?.disconnect())
watch(() => route.params.id, (id) => id && load(id), { immediate: true })
</script>

<template>
  <div class="article-page">
    <!-- 加载骨架 -->
    <div v-if="loading" class="container loading-wrap">
      <div class="sk-hero shimmer"></div>
      <div class="sk-text">
        <div v-for="i in 6" :key="i" class="sk-row shimmer" :style="{ width: 70 + (i % 3) * 10 + '%' }"></div>
      </div>
    </div>

    <template v-else-if="article">
      <!-- 顶部背景 -->
      <header class="hero" :class="{ 'has-img': article.thumbnail }">
        <div
          v-if="article.thumbnail"
          class="hero-img"
          :style="{ backgroundImage: `url(${article.thumbnail})` }"
        ></div>
        <div class="hero-overlay"></div>
        <div class="container hero-content">
          <div class="crumbs">
            <router-link to="/">首页</router-link>
            <span>/</span>
            <router-link
              v-if="article.categoryName"
              :to="{ path: '/', query: { categoryId: article.categoryId } }"
            >
              {{ article.categoryName }}
            </router-link>
          </div>
          <h1 class="title">{{ article.title }}</h1>
          <div class="meta">
            <span class="author">
              <img v-if="article.authorAvatar" :src="article.authorAvatar" alt="" />
              <span v-else class="a-fb">{{ (article.authorName || 'A').charAt(0) }}</span>
              {{ article.authorName || '佚名' }}
            </span>
            <span>· {{ formatDate(article.createTime) }}</span>
            <span>· 👁 {{ compactNumber(article.viewCount) }} 阅读</span>
          </div>
          <div v-if="article.tags?.length" class="tags">
            <router-link
              v-for="t in article.tags"
              :key="t"
              :to="{ path: '/tags' }"
              class="chip"
            >#{{ t }}</router-link>
          </div>
        </div>
      </header>

      <div class="container body-grid">
        <!-- 正文 -->
        <article class="content-col">
          <div ref="contentEl" class="markdown-body card content-card" v-html="html"></div>

          <CommentSection
            :article-id="article.id"
            :count="article.commentCount"
            @change="onCommentChange"
          />
        </article>

        <!-- 侧栏 TOC -->
        <aside class="side-col">
          <div class="toc card" v-if="toc.length">
            <p class="toc-title">目录</p>
            <ul>
              <li
                v-for="(item, i) in toc"
                :key="i"
                :class="[`lv-${item.level}`, { on: activeAnchor === slugify(item.text) }]"
                @click="scrollToAnchor(item.text)"
              >
                {{ item.text }}
              </li>
            </ul>
          </div>
          <div class="side-actions">
            <button class="like-btn" :class="{ liked }" @click="toggleLike">
              <span class="heart">♥</span>
              <span>{{ compactNumber(article.likeCount) }}</span>
            </button>
          </div>
        </aside>
      </div>

      <!-- 移动端浮动点赞 -->
      <button class="float-like" :class="{ liked }" @click="toggleLike">
        <span class="heart">♥</span>
        <small>{{ compactNumber(article.likeCount) }}</small>
      </button>
    </template>

    <div v-else class="container">
      <EmptyState text="文章不存在或已被删除" icon="📭">
        <router-link to="/" class="btn btn-primary">返回首页</router-link>
      </EmptyState>
    </div>
  </div>
</template>

<style scoped>
.article-page {
  padding-bottom: var(--space-7);
}

/* —— Hero —— */
.hero {
  position: relative;
  padding: var(--space-8) 0 var(--space-6);
  margin-bottom: var(--space-6);
  overflow: hidden;
  isolation: isolate;
  background: var(--grad-hero);
}
.hero.has-img {
  padding-top: calc(var(--space-8) + 40px);
}
.hero-img {
  position: absolute;
  inset: 0;
  z-index: -2;
  background-size: cover;
  background-position: center;
  transform: scale(1.05);
}
.hero-overlay {
  position: absolute;
  inset: 0;
  z-index: -1;
}
.hero.has-img .hero-overlay {
  background: linear-gradient(
    to top,
    var(--bg-body) 2%,
    rgba(15, 23, 42, 0.55) 60%,
    rgba(15, 23, 42, 0.35) 100%
  );
}
.hero.has-img .hero-content {
  color: #fff;
}
.hero.has-img .title,
.hero.has-img .crumbs a {
  color: #fff;
}
.hero-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
  animation: fade-up 0.6s var(--ease-out) both;
}
.crumbs {
  display: flex;
  gap: 8px;
  font-size: 13px;
  color: var(--text-soft);
}
.title {
  font-size: clamp(26px, 4vw, 40px);
  font-weight: 800;
  line-height: 1.25;
  color: var(--text-strong);
  max-width: 820px;
}
.meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  opacity: 0.92;
}
.author {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-weight: 600;
}
.author img,
.a-fb {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  object-fit: cover;
}
.a-fb {
  display: grid;
  place-items: center;
  background: var(--grad-brand);
  color: #fff;
  font-size: 13px;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.hero.has-img .chip {
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
  backdrop-filter: blur(4px);
}

/* —— 主体网格 —— */
.body-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 260px;
  gap: var(--space-6);
  align-items: start;
}
.content-card {
  padding: clamp(20px, 4vw, 44px);
}

/* —— 侧栏 —— */
.side-col {
  position: sticky;
  top: calc(var(--header-h) + 20px);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.toc {
  padding: var(--space-4);
  max-height: 64vh;
  overflow-y: auto;
}
.toc-title {
  font-weight: 700;
  color: var(--text-strong);
  margin-bottom: 10px;
  padding-left: 8px;
}
.toc ul {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.toc li {
  position: relative;
  padding: 6px 10px;
  font-size: 13.5px;
  color: var(--text-soft);
  border-radius: var(--radius-xs);
  cursor: pointer;
  border-left: 2px solid transparent;
  transition: all var(--t-fast);
}
.toc li:hover {
  color: var(--brand);
  background: var(--brand-ghost);
}
.toc li.on {
  color: var(--brand);
  font-weight: 600;
  background: var(--brand-ghost);
  border-left-color: var(--brand);
}
.toc li.lv-2 {
  padding-left: 22px;
}
.toc li.lv-3 {
  padding-left: 34px;
  font-size: 13px;
}

.side-actions {
  display: flex;
  justify-content: center;
}
.like-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 28px;
  border-radius: var(--radius-pill);
  font-weight: 700;
  font-size: 16px;
  color: var(--text-soft);
  background: var(--bg-elev);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  transition: all var(--t-base) var(--ease-spring);
}
.like-btn .heart {
  font-size: 20px;
  transition: transform var(--t-base) var(--ease-spring);
}
.like-btn:hover {
  color: #e11d48;
  border-color: #fda4af;
  transform: translateY(-3px);
}
.like-btn.liked {
  color: #fff;
  background: linear-gradient(135deg, #fb7185, #e11d48);
  border-color: transparent;
  box-shadow: 0 10px 28px rgba(225, 29, 72, 0.32);
}
.like-btn.liked .heart {
  transform: scale(1.25);
}

/* —— 移动浮动点赞 —— */
.float-like {
  display: none;
  position: fixed;
  right: 20px;
  bottom: 84px;
  z-index: 80;
  flex-direction: column;
  align-items: center;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  color: var(--text-soft);
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-md);
}
.float-like.liked {
  color: #fff;
  background: linear-gradient(135deg, #fb7185, #e11d48);
}
.float-like .heart {
  font-size: 18px;
}
.float-like small {
  font-size: 11px;
}

/* —— 骨架 —— */
.loading-wrap {
  padding-top: var(--space-6);
}
.sk-hero {
  height: 200px;
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-5);
}
.sk-text {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.sk-row {
  height: 16px;
  border-radius: 6px;
}
.shimmer {
  position: relative;
  overflow: hidden;
  background: var(--bg-sunken);
}
.shimmer::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, rgba(127, 160, 220, 0.14), transparent);
  animation: sk-shimmer 1.4s infinite;
}
@keyframes sk-shimmer {
  100% {
    transform: translateX(100%);
  }
}

@media (max-width: 960px) {
  .body-grid {
    grid-template-columns: 1fr;
  }
  .side-col {
    position: static;
    order: -1;
  }
  .toc {
    display: none;
  }
  .side-actions {
    display: none;
  }
  .float-like {
    display: flex;
  }
}
</style>
