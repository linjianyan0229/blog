<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { Document, User, ChatDotRound, Collection, PriceTag, Link } from '@element-plus/icons-vue'
import { adminApi } from '@/api/admin'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

const loading = ref(true)
const stats = reactive({ articles: 0, users: 0, comments: 0, categories: 0, tags: 0, links: 0 })

const hour = new Date().getHours()
const greeting = computed(() => {
  if (hour < 6) return '夜深了'
  if (hour < 12) return '早上好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

const cards = computed(() => [
  { key: 'articles', label: '文章总数', value: stats.articles, icon: Document, color: '#2563eb', to: '/admin/articles', perm: 'article:list' },
  { key: 'users', label: '用户总数', value: stats.users, icon: User, color: '#7c3aed', to: '/admin/users', perm: 'user:list' },
  { key: 'comments', label: '评论总数', value: stats.comments, icon: ChatDotRound, color: '#0ea5e9', to: '/admin/comments', perm: 'comment:list' },
  { key: 'categories', label: '分类数', value: stats.categories, icon: Collection, color: '#059669', to: '/admin/categories', perm: 'category:list' },
  { key: 'tags', label: '标签数', value: stats.tags, icon: PriceTag, color: '#d97706', to: '/admin/tags', perm: 'tag:list' },
  { key: 'links', label: '友链数', value: stats.links, icon: Link, color: '#db2777', to: '/admin/links', perm: 'link:list' },
].filter((c) => userStore.hasPerm(c.perm)))

async function load() {
  const tasks = []
  if (userStore.hasPerm('article:list'))
    tasks.push(adminApi.articles.list({ page: 1, size: 1 }).then((d) => (stats.articles = d.total || 0)).catch(() => {}))
  if (userStore.hasPerm('user:list'))
    tasks.push(adminApi.users.list({ page: 1, size: 1 }).then((d) => (stats.users = d.total || 0)).catch(() => {}))
  if (userStore.hasPerm('comment:list'))
    tasks.push(adminApi.comments.list({ page: 1, size: 1 }).then((d) => (stats.comments = d.total || 0)).catch(() => {}))
  if (userStore.hasPerm('category:list'))
    tasks.push(adminApi.categories.list().then((d) => (stats.categories = (d || []).length)).catch(() => {}))
  if (userStore.hasPerm('tag:list'))
    tasks.push(adminApi.tags.list().then((d) => (stats.tags = (d || []).length)).catch(() => {}))
  if (userStore.hasPerm('link:list'))
    tasks.push(adminApi.links.list().then((d) => (stats.links = (d || []).length)).catch(() => {}))
  await Promise.allSettled(tasks)
  loading.value = false
}
load()
</script>

<template>
  <div class="dashboard">
    <!-- 欢迎横幅 -->
    <div class="welcome">
      <div class="w-orb"></div>
      <div class="w-text">
        <h1>{{ greeting }}，{{ userInfo?.nickname || userInfo?.username }} 👋</h1>
        <p>欢迎回到蔚蓝博客管理后台，祝你拥有高效的一天。</p>
      </div>
      <div class="w-roles">
        <el-tag v-for="r in userInfo?.roles || []" :key="r" effect="dark" round>{{ r }}</el-tag>
      </div>
    </div>

    <!-- 统计卡 -->
    <el-row :gutter="20" class="stat-row" v-loading="loading">
      <el-col v-for="c in cards" :key="c.key" :xs="12" :sm="8" :md="8" :lg="4">
        <div class="stat-card" @click="router.push(c.to)">
          <div class="s-icon" :style="{ background: c.color + '1a', color: c.color }">
            <el-icon :size="24"><component :is="c.icon" /></el-icon>
          </div>
          <div class="s-info">
            <span class="s-value">{{ c.value }}</span>
            <span class="s-label">{{ c.label }}</span>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 快捷操作 -->
    <div class="quick card">
      <h3>快捷操作</h3>
      <div class="quick-grid">
        <button v-if="userStore.hasPerm('article:create')" class="q-btn" @click="router.push('/admin/articles/edit')">
          <span class="q-ico">✍️</span> 写新文章
        </button>
        <button v-if="userStore.hasPerm('category:list')" class="q-btn" @click="router.push('/admin/categories')">
          <span class="q-ico">🗂</span> 管理分类
        </button>
        <button v-if="userStore.hasPerm('comment:list')" class="q-btn" @click="router.push('/admin/comments')">
          <span class="q-ico">💬</span> 审核评论
        </button>
        <button v-if="userStore.hasPerm('user:list')" class="q-btn" @click="router.push('/admin/users')">
          <span class="q-ico">👥</span> 用户管理
        </button>
        <button class="q-btn" @click="router.push('/')">
          <span class="q-ico">🏠</span> 查看前台
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}
.welcome {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 28px 32px;
  border-radius: var(--radius-lg);
  color: #fff;
  background: var(--grad-brand);
  box-shadow: var(--shadow-md);
}
.w-orb {
  position: absolute;
  top: -60px;
  right: 8%;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.16);
  filter: blur(10px);
}
.w-text {
  position: relative;
}
.w-text h1 {
  font-size: 24px;
  font-weight: 800;
}
.w-text p {
  margin-top: 6px;
  opacity: 0.9;
}
.w-roles {
  position: relative;
  display: flex;
  gap: 8px;
}

.stat-row {
  row-gap: 20px;
}
.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: transform var(--t-base) var(--ease-out), box-shadow var(--t-base);
}
.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}
.s-icon {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: var(--radius-md);
}
.s-info {
  display: flex;
  flex-direction: column;
}
.s-value {
  font-size: 26px;
  font-weight: 800;
  color: var(--text-strong);
  line-height: 1.1;
}
.s-label {
  font-size: 13px;
  color: var(--text-muted);
}

.quick {
  padding: 24px;
}
.quick h3 {
  font-size: 17px;
  color: var(--text-strong);
  margin-bottom: 16px;
}
.quick-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.q-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: var(--radius-md);
  font-weight: 600;
  color: var(--text);
  background: var(--bg-sunken);
  border: 1px solid var(--border);
  transition: all var(--t-fast) var(--ease-out);
}
.q-btn:hover {
  color: var(--brand);
  border-color: var(--brand);
  transform: translateY(-2px);
}
.q-ico {
  font-size: 17px;
}
</style>
