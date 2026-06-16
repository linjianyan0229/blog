<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { publicApi } from '@/api/public'
import ArticleCard from '@/components/ArticleCard.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'
import EmptyState from '@/components/EmptyState.vue'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const articles = ref([])
const categories = ref([])
const tagMap = ref({})
const page = reactive({ current: 1, size: 9, total: 0, pages: 0 })

const keyword = computed(() => route.query.keyword || '')
const activeCat = computed(() => (route.query.categoryId ? Number(route.query.categoryId) : null))
const activeTag = computed(() => (route.query.tagId ? Number(route.query.tagId) : null))

const catName = computed(() => categories.value.find((c) => c.id === activeCat.value)?.name || '')
const tagName = computed(() => tagMap.value[activeTag.value] || '')
const subtitle = computed(() => {
  if (keyword.value) return `“${keyword.value}” 的搜索结果 · 共 ${page.total} 篇`
  if (activeCat.value) return `分类「${catName.value}」· 共 ${page.total} 篇`
  if (activeTag.value) return `标签 #${tagName.value} · 共 ${page.total} 篇`
  return `共收录 ${page.total} 篇文章，记录技术与思考`
})

async function loadCategories() {
  try {
    categories.value = await publicApi.getCategories()
  } catch {
    categories.value = []
  }
}

async function loadTags() {
  try {
    const tags = await publicApi.getTags()
    const map = {}
    for (const t of tags) map[t.id] = t.name
    tagMap.value = map
  } catch {
    tagMap.value = {}
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
  router.push({ path: '/articles', query })
}

function clearSearch() {
  const query = { ...route.query }
  delete query.keyword
  router.push({ path: '/articles', query })
}

function goPage(p) {
  if (p < 1 || p > page.pages || p === page.current) return
  page.current = p
  loadArticles()
  window.scrollTo({ top: 0, behavior: 'smooth' })
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

watch(
  () => route.query,
  () => {
    page.current = 1
    loadArticles()
  },
  { immediate: true }
)
loadCategories()
loadTags()
</script>

<template>
  <div class="container page">
    <header class="page-head">
      <h1>文章<span class="text-gradient">列表</span></h1>
      <p>{{ subtitle }}</p>
    </header>

    <!-- 筛选条 -->
    <div class="filter-bar">
      <div class="cats">
        <button class="cat-chip" :class="{ on: !activeCat && !activeTag }" @click="selectCategory(null)">
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
        <ArticleCard v-for="(a, i) in articles" :key="a.id" :article="a" :index="i" />
      </div>
      <EmptyState v-else text="没有找到相关文章" icon="🔍" />
    </template>

    <!-- 分页 -->
    <nav v-if="page.pages > 1 && !loading" class="pager">
      <button class="pg-btn" :disabled="page.current === 1" @click="goPage(page.current - 1)">‹</button>
      <template v-for="(p, i) in pageList" :key="i">
        <span v-if="p === '...'" class="pg-dots">…</span>
        <button v-else class="pg-btn" :class="{ on: p === page.current }" @click="goPage(p)">
          {{ p }}
        </button>
      </template>
      <button class="pg-btn" :disabled="page.current === page.pages" @click="goPage(page.current + 1)">
        ›
      </button>
    </nav>
  </div>
</template>

<style scoped>
.page {
  padding: var(--space-6) var(--space-5) var(--space-7);
}
.page-head {
  text-align: center;
  margin-bottom: var(--space-5);
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

/* —— 筛选条 —— */
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin: 0 0 var(--space-5);
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
