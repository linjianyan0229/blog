<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { publicApi } from '@/api/public'
import { useSiteStore } from '@/stores/site'
import ArticleCard from '@/components/ArticleCard.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'
import EmptyState from '@/components/EmptyState.vue'

const route = useRoute()
const router = useRouter()
const { homeBackground, homeIntro } = storeToRefs(useSiteStore())

const loading = ref(true)
const articles = ref([])
const categories = ref([])
const page = reactive({ current: 1, size: 9, total: 0, pages: 0 })

const keyword = computed(() => route.query.keyword || '')
const activeCat = computed(() => (route.query.categoryId ? Number(route.query.categoryId) : null))
const activeTag = computed(() => (route.query.tagId ? Number(route.query.tagId) : null))

async function loadCategories() {
  try {
    categories.value = await publicApi.getCategories()
  } catch {
    categories.value = []
  }
}

async function loadArticles() {
  loading.value = true
  try {
    const data = await publicApi.getArticles({
      page: page.current,
      size: page.size,
      keyword: keyword.value || undefined,
      categoryId: activeCat.value || undefined,
      tagId: activeTag.value || undefined,
    })
    articles.value = data.records || []
    page.total = data.total || 0
    page.pages = data.pages || 0
  } catch {
    articles.value = []
  } finally {
    loading.value = false
  }
}

function selectCategory(id) {
  const query = { ...route.query }
  if (id) query.categoryId = id
  else delete query.categoryId
  delete query.tagId
  router.push({ path: '/', query })
}

function clearSearch() {
  const query = { ...route.query }
  delete query.keyword
  router.push({ path: '/', query })
}

function goPage(p) {
  if (p < 1 || p > page.pages || p === page.current) return
  page.current = p
  loadArticles()
  window.scrollTo({ top: 360, behavior: 'smooth' })
}

const pageList = computed(() => {
  const list = []
  const { current, pages } = page
  const around = 2
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || (i >= current - around && i <= current + around)) {
      list.push(i)
    } else if (list[list.length - 1] !== '...') {
      list.push('...')
    }
  }
  return list
})

// query 变化时重置到第一页并重新拉取
watch(
  () => route.query,
  () => {
    page.current = 1
    loadArticles()
  },
  { immediate: true }
)
loadCategories()
</script>

<template>
  <div>
    <!-- Hero -->
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
      </div>
    </section>

    <div class="container">
      <!-- 筛选条 -->
      <div class="filter-bar">
        <div class="cats">
          <button class="cat-chip" :class="{ on: !activeCat }" @click="selectCategory(null)">
            全部
          </button>
          <button
            v-for="c in categories"
            :key="c.id"
            class="cat-chip"
            :class="{ on: activeCat === c.id }"
            @click="selectCategory(c.id)"
          >
            {{ c.name }}
          </button>
        </div>
        <p v-if="keyword" class="search-tip">
          搜索：<b>{{ keyword }}</b>
          <button @click="clearSearch">✕</button>
        </p>
      </div>

      <!-- 文章网格 -->
      <div v-if="loading" class="grid">
        <SkeletonCard v-for="i in 6" :key="i" />
      </div>

      <template v-else>
        <div v-if="articles.length" class="grid">
          <ArticleCard
            v-for="(a, i) in articles"
            :key="a.id"
            :article="a"
            :index="i"
          />
        </div>
        <EmptyState v-else text="没有找到相关文章" icon="🔍" />
      </template>

      <!-- 分页 -->
      <nav v-if="page.pages > 1 && !loading" class="pager">
        <button class="pg-btn" :disabled="page.current === 1" @click="goPage(page.current - 1)">
          ‹
        </button>
        <template v-for="(p, i) in pageList" :key="i">
          <span v-if="p === '...'" class="pg-dots">…</span>
          <button v-else class="pg-btn" :class="{ on: p === page.current }" @click="goPage(p)">
            {{ p }}
          </button>
        </template>
        <button
          class="pg-btn"
          :disabled="page.current === page.pages"
          @click="goPage(page.current + 1)"
        >
          ›
        </button>
      </nav>
    </div>
  </div>
</template>

<style scoped>
/* —— Hero —— */
.hero {
  position: relative;
  overflow: hidden;
  padding: var(--space-8) 0 var(--space-7);
  isolation: isolate;
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
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.16), var(--bg-body) 96%);
}
.hero.has-bg {
  padding-top: var(--space-7);
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
  width: 320px;
  height: 320px;
  top: -80px;
  right: 8%;
  background: radial-gradient(circle, #60a5fa, transparent 70%);
}
.orb2 {
  width: 260px;
  height: 260px;
  bottom: -120px;
  left: 4%;
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
  font-size: clamp(32px, 5vw, 52px);
  font-weight: 800;
  line-height: 1.2;
  color: var(--text-strong);
  letter-spacing: -0.5px;
}
.hero-sub {
  max-width: 560px;
  color: var(--text-soft);
  font-size: clamp(15px, 2vw, 17px);
}

/* —— 筛选条 —— */
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin: var(--space-6) 0 var(--space-5);
}
.cats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.cat-chip {
  padding: 7px 16px;
  font-size: 14px;
  font-weight: 500;
  border-radius: var(--radius-pill);
  color: var(--text-soft);
  background: var(--bg-elev);
  border: 1px solid var(--border);
  transition: all var(--t-fast) var(--ease-out);
}
.cat-chip:hover {
  color: var(--brand);
  border-color: var(--brand);
  transform: translateY(-2px);
}
.cat-chip.on {
  color: var(--text-on-brand);
  background: var(--grad-brand);
  border-color: transparent;
  box-shadow: var(--shadow-brand);
}
.search-tip {
  font-size: 14px;
  color: var(--text-soft);
}
.search-tip b {
  color: var(--brand);
}
.search-tip button {
  margin-left: 6px;
  color: var(--text-muted);
}

/* —— 网格 —— */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-5);
}

/* —— 分页 —— */
.pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: var(--space-7) 0 var(--space-4);
}
.pg-btn {
  min-width: 40px;
  height: 40px;
  padding: 0 8px;
  border-radius: var(--radius-sm);
  font-weight: 600;
  color: var(--text-soft);
  background: var(--bg-elev);
  border: 1px solid var(--border);
  transition: all var(--t-fast);
}
.pg-btn:hover:not(:disabled) {
  color: var(--brand);
  border-color: var(--brand);
}
.pg-btn.on {
  color: var(--text-on-brand);
  background: var(--grad-brand);
  border-color: transparent;
}
.pg-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.pg-dots {
  color: var(--text-muted);
}
</style>
