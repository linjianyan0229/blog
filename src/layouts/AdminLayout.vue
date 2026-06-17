<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import {
  Odometer,
  Document,
  Collection,
  PriceTag,
  ChatDotRound,
  Link,
  User,
  Lock,
  Promotion,
  Fold,
  Expand,
  HomeFilled,
  SwitchButton,
  ArrowDown,
  Sunny,
  Moon,
  Setting,
  Stamp,
  DataLine,
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useThemeStore } from '@/stores/theme'
import AppLogo from '@/components/AppLogo.vue'
import { toast } from '@/utils/message'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const themeStore = useThemeStore()
const { userInfo, isAdmin } = storeToRefs(userStore)
const isDark = computed(() => themeStore.theme === 'dark')

const collapse = ref(false)

const menuGroups = [
  {
    title: '概览',
    items: [{ title: '仪表盘', index: '/admin/dashboard', icon: Odometer, perm: null }],
  },
  {
    title: '内容管理',
    items: [
      { title: '文章管理', index: '/admin/articles', icon: Document, perm: 'article:list' },
      { title: '分类管理', index: '/admin/categories', icon: Collection, perm: 'category:list' },
      { title: '标签管理', index: '/admin/tags', icon: PriceTag, perm: 'tag:list' },
      { title: '评论管理', index: '/admin/comments', icon: ChatDotRound, perm: 'comment:list' },
      { title: '友链管理', index: '/admin/links', icon: Link, perm: 'link:list' },
      { title: '友链申请', index: '/admin/link-applies', icon: Stamp, perm: 'link:audit' },
    ],
  },
  {
    title: '系统管理',
    items: [
      { title: '用户管理', index: '/admin/users', icon: User, perm: 'user:list' },
      { title: '角色权限', index: '/admin/roles', icon: Lock, perm: 'role:list' },
      { title: '接口限流', index: '/admin/api-limits', icon: Promotion, perm: 'api:list' },
      { title: '访问统计', index: '/admin/visit', icon: DataLine, perm: 'visit:list' },
      { title: '站点配置', index: '/admin/site-config', icon: Setting, perm: 'config:list' },
    ],
  },
]

const visibleGroups = computed(() =>
  menuGroups
    .map((g) => ({ ...g, items: g.items.filter((i) => userStore.hasPerm(i.perm)) }))
    .filter((g) => g.items.length)
)

const activeMenu = computed(() => {
  if (route.path.startsWith('/admin/articles')) return '/admin/articles'
  return route.path
})

const crumb = computed(() => route.meta.title || '')

const avatarText = computed(() =>
  (userInfo.value?.nickname || userInfo.value?.username || 'A').charAt(0).toUpperCase()
)

function handleCommand(cmd) {
  if (cmd === 'home') router.push('/')
  else if (cmd === 'profile') router.push('/user')
  else if (cmd === 'logout') doLogout()
}
async function doLogout() {
  await userStore.logout()
  toast.success('已退出登录')
  router.push('/login')
}

// 后台用 el-main 内部滚动，进入时关闭窗口级 gutter 以免右侧留白，离开后恢复
onMounted(() => {
  document.documentElement.style.scrollbarGutter = 'auto'
})
onUnmounted(() => {
  document.documentElement.style.scrollbarGutter = ''
})
</script>

<template>
  <el-container class="admin">
    <!-- 侧边栏 -->
    <el-aside :width="collapse ? '64px' : '232px'" class="aside" :class="{ 'is-collapsed': collapse }">
      <div class="aside-logo">
        <AppLogo :compact="collapse" />
      </div>
      <el-scrollbar class="menu-scroll">
        <el-menu
          :default-active="activeMenu"
          :collapse="collapse"
          :collapse-transition="false"
          router
          class="menu"
        >
          <template v-for="g in visibleGroups" :key="g.title">
            <div v-if="!collapse" class="group-title">{{ g.title }}</div>
            <el-menu-item v-for="it in g.items" :key="it.index" :index="it.index">
              <el-icon><component :is="it.icon" /></el-icon>
              <template #title>{{ it.title }}</template>
            </el-menu-item>
          </template>
        </el-menu>
      </el-scrollbar>
    </el-aside>

    <el-container>
      <!-- 顶栏 -->
      <el-header class="header">
        <div class="h-left">
          <el-button text class="collapse-btn" @click="collapse = !collapse">
            <el-icon :size="20"><component :is="collapse ? Expand : Fold" /></el-icon>
          </el-button>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item>后台</el-breadcrumb-item>
            <el-breadcrumb-item>{{ crumb }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="h-right">
          <el-button text circle class="icon-btn" title="切换主题" @click="themeStore.toggle()">
            <el-icon :size="18">
              <Sunny v-if="isDark" />
              <Moon v-else />
            </el-icon>
          </el-button>
          <el-button text circle class="icon-btn" title="查看前台" @click="router.push('/')">
            <el-icon :size="18"><HomeFilled /></el-icon>
          </el-button>
          <el-dropdown @command="handleCommand">
            <div class="user-trigger">
              <el-avatar :size="32" :src="userInfo?.avatar">{{ avatarText }}</el-avatar>
              <span class="u-name">{{ userInfo?.nickname || userInfo?.username }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon> 个人中心
                </el-dropdown-item>
                <el-dropdown-item command="home">
                  <el-icon><HomeFilled /></el-icon> 返回前台
                </el-dropdown-item>
                <el-dropdown-item command="logout" divided>
                  <el-icon><SwitchButton /></el-icon> 退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 内容 -->
      <el-main class="main">
        <router-view v-slot="{ Component }">
          <transition name="route-fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.admin {
  height: 100vh;
  background: var(--bg-body);
}
.aside {
  display: flex;
  flex-direction: column;
  background: var(--bg-elev);
  border-right: 1px solid var(--divider);
  transition: width var(--t-base) var(--ease-out);
  overflow: hidden;
}
.aside-logo {
  height: var(--header-h);
  display: flex;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid var(--divider);
  overflow: hidden;
}
/* 折叠态：Logo 区去 padding 并居中，与下方菜单图标中线(64px 居中)对齐 */
.aside.is-collapsed .aside-logo {
  padding: 0;
  justify-content: center;
}
.aside.is-collapsed .menu {
  padding: 8px 0;
}
.menu-scroll {
  flex: 1;
}
.menu {
  border-right: none;
  background: transparent;
  padding: 8px 12px;
}
.group-title {
  padding: 14px 12px 6px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: var(--text-muted);
}
.menu :deep(.el-menu-item) {
  height: 44px;
  margin: 4px 0;
  border-radius: var(--radius-sm);
  color: var(--text-soft);
}
.menu :deep(.el-menu-item:hover) {
  background: var(--brand-ghost);
  color: var(--brand);
}
.menu :deep(.el-menu-item.is-active) {
  color: #fff;
  background: var(--grad-brand);
  box-shadow: var(--shadow-brand);
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--header-h);
  background: var(--bg-elev);
  border-bottom: 1px solid var(--divider);
  padding: 0 20px;
}
.h-left {
  display: flex;
  align-items: center;
  gap: 14px;
}
.collapse-btn {
  color: var(--text-soft);
}
.h-right {
  display: flex;
  align-items: center;
  gap: 6px;
}
.icon-btn {
  color: var(--text-soft);
}
.user-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  cursor: pointer;
  transition: background var(--t-fast);
  outline: none;
}
.user-trigger:hover {
  background: var(--bg-hover);
}
.u-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
}
.main {
  padding: var(--space-5);
  overflow-y: auto;
  /* 后台内容区滚动条恒定预留，切换页面不抖动 */
  scrollbar-gutter: stable;
}
</style>
