<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import AppLogo from '@/components/AppLogo.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { useUserStore } from '@/stores/user'
import { useSiteStore } from '@/stores/site'
import { toast } from '@/utils/message'

const userStore = useUserStore()
const { isLogin, userInfo, isAdmin, permissions } = storeToRefs(userStore)
const siteStore = useSiteStore()
const { footerText, siteName } = storeToRefs(siteStore)
const route = useRoute()
const router = useRouter()

const scrolled = ref(false)
const menuOpen = ref(false)
const userMenuOpen = ref(false)
const keyword = ref('')

const navs = [
  { name: 'home', label: '首页', to: '/' },
  { name: 'articles', label: '文章', to: '/articles' },
  { name: 'categories', label: '分类', to: '/categories' },
  { name: 'tags', label: '标签', to: '/tags' },
  { name: 'links', label: '友链', to: '/links' },
  { name: 'about', label: '关于', to: '/about' },
]

const canEnterAdmin = computed(
  () => isAdmin.value || permissions.value.some((p) => p.endsWith(':list'))
)
const avatarText = computed(
  () => (userInfo.value?.nickname || userInfo.value?.username || 'U').charAt(0).toUpperCase()
)

function onScroll() {
  scrolled.value = window.scrollY > 12
}
onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  document.addEventListener('click', closeUserMenu)
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  document.removeEventListener('click', closeUserMenu)
})

function closeUserMenu(e) {
  if (!e.target.closest('.user-area')) userMenuOpen.value = false
}

function doSearch() {
  const k = keyword.value.trim()
  router.push({ path: '/articles', query: k ? { keyword: k } : {} })
  menuOpen.value = false
}

async function handleLogout() {
  await userStore.logout()
  userMenuOpen.value = false
  toast.success('已退出登录')
  if (route.meta.requiresAuth) router.push('/')
}

function scrollTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div class="front">
    <!-- 顶部导航 -->
    <header class="navbar" :class="{ scrolled }">
      <div class="container nav-inner">
        <AppLogo />

        <nav class="nav-links" :class="{ open: menuOpen }">
          <router-link
            v-for="n in navs"
            :key="n.name"
            :to="n.to"
            class="nav-link"
            :class="{ active: route.name === n.name }"
            @click="menuOpen = false"
          >
            {{ n.label }}
          </router-link>
        </nav>

        <div class="nav-actions">
          <div class="search-box">
            <svg class="s-ico" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14"
              />
            </svg>
            <input v-model="keyword" type="text" placeholder="搜索文章…" @keyup.enter="doSearch" />
          </div>

          <ThemeToggle />

          <!-- 用户区 -->
          <div class="user-area">
            <router-link v-if="!isLogin" to="/login" class="btn btn-primary login-btn">
              登录
            </router-link>
            <template v-else>
              <button class="avatar-btn" @click.stop="userMenuOpen = !userMenuOpen">
                <img v-if="userInfo?.avatar" :src="userInfo.avatar" alt="avatar" />
                <span v-else class="avatar-fallback">{{ avatarText }}</span>
              </button>
              <transition name="dropdown">
                <div v-if="userMenuOpen" class="user-menu card">
                  <div class="um-head">
                    <strong>{{ userInfo?.nickname || userInfo?.username }}</strong>
                    <small>{{ userInfo?.email }}</small>
                  </div>
                  <div class="um-divider"></div>
                  <router-link to="/user" class="um-item" @click="userMenuOpen = false">
                    <span class="um-ico">👤</span> 个人中心
                  </router-link>
                  <router-link
                    v-if="canEnterAdmin"
                    to="/admin"
                    class="um-item"
                    @click="userMenuOpen = false"
                  >
                    <span class="um-ico">⚙️</span> 后台管理
                  </router-link>
                  <div class="um-divider"></div>
                  <button class="um-item danger" @click="handleLogout">
                    <span class="um-ico">↩</span> 退出登录
                  </button>
                </div>
              </transition>
            </template>
          </div>

          <button class="burger" :class="{ open: menuOpen }" @click="menuOpen = !menuOpen">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </header>

    <!-- 内容 -->
    <main class="main">
      <router-view v-slot="{ Component }">
        <transition name="route-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- 页脚 -->
    <footer class="footer">
      <div class="container footer-inner">
        <div class="f-brand">
          <AppLogo />
          <p>{{ footerText || '一处记录思考与代码的蔚蓝角落。' }}</p>
        </div>
        <div class="f-links">
          <router-link to="/categories">分类</router-link>
          <router-link to="/tags">标签</router-link>
          <router-link to="/links">友链</router-link>
          <router-link to="/about">关于</router-link>
        </div>
        <p class="f-copy">© {{ new Date().getFullYear() }} {{ siteName }} · Powered by Vue 3 + Vite</p>
      </div>
    </footer>

    <!-- 回到顶部 -->
    <transition name="pop">
      <button v-show="scrolled" class="to-top" title="回到顶部" @click="scrollTop">
        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 8l-6 6 1.4 1.4L12 10.8l4.6 4.6L18 14z" /></svg>
      </button>
    </transition>
  </div>
</template>

<style scoped>
.front {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* —— 导航栏 —— */
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  height: var(--header-h);
  display: flex;
  align-items: center;
  transition: background var(--t-base) var(--ease-out), box-shadow var(--t-base),
    border-color var(--t-base);
  border-bottom: 1px solid transparent;
}
.navbar.scrolled {
  background: var(--glass-bg);
  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  border-bottom-color: var(--divider);
  box-shadow: var(--shadow-sm);
}
.nav-inner {
  display: flex;
  align-items: center;
  gap: var(--space-5);
  width: 100%;
}
.nav-links {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-right: auto;
}
.nav-link {
  position: relative;
  padding: 8px 14px;
  border-radius: var(--radius-pill);
  font-weight: 500;
  color: var(--text-soft);
  transition: color var(--t-fast), background var(--t-fast);
}
.nav-link:hover {
  color: var(--brand);
  background: var(--brand-ghost);
}
.nav-link.active {
  color: var(--brand);
  background: var(--brand-ghost);
}
.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 3px;
  border-radius: 3px;
  background: var(--grad-brand);
}
.nav-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
.search-box {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 38px;
  padding: 0 14px;
  border-radius: var(--radius-pill);
  background: var(--bg-sunken);
  border: 1px solid transparent;
  transition: border-color var(--t-fast), background var(--t-fast), width var(--t-base);
  width: 190px;
}
.search-box:focus-within {
  border-color: var(--brand);
  background: var(--bg-elev);
}
.s-ico {
  width: 17px;
  height: 17px;
  color: var(--text-muted);
  flex: none;
}
.search-box input {
  width: 100%;
  border: none;
  background: none;
  outline: none;
  font-size: 14px;
}

/* —— 用户区 —— */
.user-area {
  position: relative;
}
.login-btn {
  height: 38px;
  padding-inline: 20px;
}
.avatar-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--border);
  transition: border-color var(--t-fast), transform var(--t-fast);
}
.avatar-btn:hover {
  border-color: var(--brand);
  transform: scale(1.05);
}
.avatar-btn img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.avatar-fallback {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  font-weight: 700;
  color: var(--text-on-brand);
  background: var(--grad-brand);
}
.user-menu {
  position: absolute;
  top: 48px;
  right: 0;
  width: 220px;
  padding: 10px;
  box-shadow: var(--shadow-lg);
  transform-origin: top right;
}
.um-head {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 10px;
}
.um-head strong {
  color: var(--text-strong);
}
.um-head small {
  color: var(--text-muted);
  font-size: 12px;
}
.um-divider {
  height: 1px;
  margin: 6px 0;
  background: var(--divider);
}
.um-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 9px 10px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  color: var(--text);
  text-align: left;
  transition: background var(--t-fast), color var(--t-fast);
}
.um-item:hover {
  background: var(--bg-hover);
  color: var(--brand);
}
.um-item.danger:hover {
  color: #dc2626;
  background: rgba(220, 38, 38, 0.08);
}
.um-ico {
  font-size: 15px;
}

/* —— 汉堡菜单 —— */
.burger {
  display: none;
  flex-direction: column;
  gap: 5px;
  padding: 6px;
}
.burger span {
  width: 22px;
  height: 2px;
  border-radius: 2px;
  background: var(--text);
  transition: transform var(--t-base), opacity var(--t-base);
}
.burger.open span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}
.burger.open span:nth-child(2) {
  opacity: 0;
}
.burger.open span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

.main {
  flex: 1;
}

/* —— 页脚 —— */
.footer {
  margin-top: var(--space-8);
  padding: var(--space-7) 0 var(--space-6);
  background: var(--bg-elev);
  border-top: 1px solid var(--divider);
}
.footer-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  text-align: center;
}
.f-brand p {
  margin-top: 8px;
  color: var(--text-muted);
  font-size: 14px;
}
.f-links {
  display: flex;
  gap: var(--space-5);
}
.f-links a {
  color: var(--text-soft);
  font-size: 14px;
}
.f-links a:hover {
  color: var(--brand);
}
.f-copy {
  color: var(--text-muted);
  font-size: 13px;
}

/* —— 回到顶部 —— */
.to-top {
  position: fixed;
  right: 28px;
  bottom: 28px;
  z-index: 90;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: var(--text-on-brand);
  background: var(--grad-brand);
  box-shadow: var(--shadow-brand);
  transition: transform var(--t-fast) var(--ease-spring);
}
.to-top:hover {
  transform: translateY(-3px) scale(1.06);
}
.to-top svg {
  width: 24px;
  height: 24px;
}

/* —— 下拉动画 —— */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity var(--t-fast) var(--ease-out), transform var(--t-fast) var(--ease-spring);
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.96);
}
.pop-enter-active,
.pop-leave-active {
  transition: opacity var(--t-base), transform var(--t-base) var(--ease-spring);
}
.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: scale(0.5);
}

/* —— 响应式 —— */
@media (max-width: 860px) {
  .search-box {
    display: none;
  }
  .burger {
    display: flex;
  }
  .nav-links {
    position: fixed;
    top: var(--header-h);
    left: 0;
    right: 0;
    flex-direction: column;
    align-items: stretch;
    gap: 4px;
    padding: 16px;
    background: var(--glass-bg);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--divider);
    transform: translateY(-12px);
    opacity: 0;
    pointer-events: none;
    transition: opacity var(--t-base), transform var(--t-base);
  }
  .nav-links.open {
    transform: translateY(0);
    opacity: 1;
    pointer-events: auto;
  }
}
</style>
