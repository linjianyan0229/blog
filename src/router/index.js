import { createRouter, createWebHistory } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { useUserStore } from '@/stores/user'
import { useSiteStore } from '@/stores/site'
import { toast } from '@/utils/message'

NProgress.configure({ showSpinner: false, trickleSpeed: 120, minimum: 0.12 })

const routes = [
  // ============ 前台 ============
  {
    path: '/',
    component: () => import('@/layouts/FrontLayout.vue'),
    children: [
      { path: '', name: 'home', component: () => import('@/views/front/HomeView.vue'), meta: { title: '首页' } },
      { path: 'articles', name: 'articles', component: () => import('@/views/front/ArticleListView.vue'), meta: { title: '文章' } },
      {
        path: 'article/:id',
        name: 'article',
        component: () => import('@/views/front/ArticleView.vue'),
        meta: { title: '文章详情' },
      },
      {
        path: 'categories',
        name: 'categories',
        component: () => import('@/views/front/CategoriesView.vue'),
        meta: { title: '分类' },
      },
      {
        path: 'tags',
        name: 'tags',
        component: () => import('@/views/front/TagsView.vue'),
        meta: { title: '标签' },
      },
      {
        path: 'links',
        name: 'links',
        component: () => import('@/views/front/LinksView.vue'),
        meta: { title: '友链' },
      },
      {
        path: 'about',
        name: 'about',
        component: () => import('@/views/front/AboutView.vue'),
        meta: { title: '关于' },
      },
      {
        path: 'user',
        name: 'user-center',
        component: () => import('@/views/user/UserCenterView.vue'),
        meta: { title: '个人中心', requiresAuth: true },
      },
    ],
  },

  // ============ 认证 ============
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { title: '登录' },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/auth/RegisterView.vue'),
    meta: { title: '注册' },
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: () => import('@/views/auth/ResetPasswordView.vue'),
    meta: { title: '重置密码' },
  },

  // ============ 后台 ============
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    redirect: '/admin/dashboard',
    children: [
      { path: 'dashboard', name: 'admin-dashboard', component: () => import('@/views/admin/DashboardView.vue'), meta: { title: '仪表盘' } },
      { path: 'articles', name: 'admin-articles', component: () => import('@/views/admin/ArticleManageView.vue'), meta: { title: '文章管理', perm: 'article:list' } },
      { path: 'articles/edit/:id?', name: 'admin-article-edit', component: () => import('@/views/admin/ArticleEditView.vue'), meta: { title: '编辑文章', perm: 'article:list' } },
      { path: 'categories', name: 'admin-categories', component: () => import('@/views/admin/CategoryManageView.vue'), meta: { title: '分类管理', perm: 'category:list' } },
      { path: 'tags', name: 'admin-tags', component: () => import('@/views/admin/TagManageView.vue'), meta: { title: '标签管理', perm: 'tag:list' } },
      { path: 'links', name: 'admin-links', component: () => import('@/views/admin/LinkManageView.vue'), meta: { title: '友链管理', perm: 'link:list' } },
      { path: 'comments', name: 'admin-comments', component: () => import('@/views/admin/CommentManageView.vue'), meta: { title: '评论管理', perm: 'comment:list' } },
      { path: 'users', name: 'admin-users', component: () => import('@/views/admin/UserManageView.vue'), meta: { title: '用户管理', perm: 'user:list' } },
      { path: 'roles', name: 'admin-roles', component: () => import('@/views/admin/RoleManageView.vue'), meta: { title: '角色权限', perm: 'role:list' } },
      { path: 'api-limits', name: 'admin-api-limits', component: () => import('@/views/admin/ApiLimitManageView.vue'), meta: { title: '接口限流', perm: 'api:list' } },
      { path: 'site-config', name: 'admin-site-config', component: () => import('@/views/admin/SiteConfigManageView.vue'), meta: { title: '站点配置', perm: 'config:list' } },
    ],
  },

  // ============ 404 ============
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: '页面走丢了' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth', top: 80 }
    return { top: 0, behavior: 'smooth' }
  },
})

const DEFAULT_TITLE = '蔚蓝博客'

router.beforeEach(async (to) => {
  NProgress.start()
  const userStore = useUserStore()

  // 已登录态尚未拉到用户信息时补拉（刷新后场景）
  if (userStore.token && !userStore.userInfo) {
    try {
      await userStore.fetchInfo()
    } catch {
      userStore.clear()
    }
  }

  if (to.meta.requiresAuth && !userStore.isLogin) {
    toast.warning('请先登录')
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  if (to.meta.requiresAdmin && !userStore.isAdmin) {
    // 非管理员，但有部分权限也允许进入后台（按菜单/页面 perm 控制）
    const hasAnyAdminPerm = userStore.permissions.some((p) => p.endsWith(':list'))
    if (!hasAnyAdminPerm) {
      toast.error('没有后台访问权限')
      return { path: '/' }
    }
  }
  if (to.meta.perm && !userStore.hasPerm(to.meta.perm)) {
    toast.error('没有该模块的访问权限')
    return from_or_home(to)
  }
  return true
})

function from_or_home() {
  return { path: '/admin/dashboard' }
}

router.afterEach((to) => {
  const baseTitle = useSiteStore().siteName || DEFAULT_TITLE
  document.title = to.meta.title ? `${to.meta.title} · ${baseTitle}` : baseTitle
  NProgress.done()
})

export default router
