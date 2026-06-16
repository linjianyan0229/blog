<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { publicApi } from '@/api/public'
import { linkApplyApi } from '@/api/linkApply'
import { fileApi } from '@/api/file'
import { useUserStore } from '@/stores/user'
import { toast } from '@/utils/message'
import { formatDate } from '@/utils/format'
import EmptyState from '@/components/EmptyState.vue'
import AppModal from '@/components/AppModal.vue'
import TextField from '@/components/TextField.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const { isLogin } = storeToRefs(userStore)

const links = ref([])
const loading = ref(true)

const STATUS = {
  PENDING: { label: '待审核', cls: 'pending' },
  APPROVED: { label: '已通过', cls: 'approved' },
  REJECTED: { label: '已拒绝', cls: 'rejected' },
}

// —— 申请相关 —— //
const modalOpen = ref(false)
const tab = ref('apply')
const submitting = ref(false)
const uploading = ref(false)
const logoInput = ref(null)
const form = reactive({ name: '', url: '', logo: '', description: '', applyEmail: '' })
const errors = reactive({ name: '', url: '', applyEmail: '' })
const mineList = ref([])
const mineLoading = ref(false)

async function load() {
  try {
    links.value = await publicApi.getLinks()
  } catch {
    links.value = []
  } finally {
    loading.value = false
  }
}

function openApply() {
  if (!isLogin.value) {
    toast.warning('请先登录后再申请友链')
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  tab.value = 'apply'
  modalOpen.value = true
}

function resetForm() {
  form.name = form.url = form.logo = form.description = form.applyEmail = ''
  errors.name = errors.url = errors.applyEmail = ''
}

function validate() {
  errors.name = form.name.trim() ? '' : '请输入网站名称'
  errors.url = /^https?:\/\/.+/.test(form.url.trim()) ? '' : '请输入有效的网站地址（http/https）'
  errors.applyEmail =
    !form.applyEmail || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.applyEmail) ? '' : '邮箱格式不正确'
  return !errors.name && !errors.url && !errors.applyEmail
}

async function submitApply() {
  if (!validate() || submitting.value) return
  submitting.value = true
  try {
    await linkApplyApi.submit({ ...form })
    toast.success('申请已提交，请等待管理员审核')
    resetForm()
    tab.value = 'mine'
    loadMine()
  } finally {
    submitting.value = false
  }
}

function pickLogo() {
  logoInput.value?.click()
}
async function onLogoChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) return toast.warning('请选择图片文件')
  uploading.value = true
  try {
    form.logo = await fileApi.upload(file)
    toast.success('LOGO 已上传')
  } finally {
    uploading.value = false
    e.target.value = ''
  }
}

async function loadMine() {
  mineLoading.value = true
  try {
    mineList.value = (await linkApplyApi.mine()) || []
  } catch {
    mineList.value = []
  } finally {
    mineLoading.value = false
  }
}

function switchMine() {
  tab.value = 'mine'
  loadMine()
}

load()
</script>

<template>
  <div class="container page">
    <header class="page-head">
      <h1>友情<span class="text-gradient">链接</span></h1>
      <p>这些有趣的人和站点，值得一逛</p>
      <button class="btn btn-primary apply-btn" @click="openApply">＋ 申请友链</button>
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
    <EmptyState v-else text="还没有友链，来申请第一个吧～" icon="🔗">
      <button class="btn btn-primary" @click="openApply">＋ 申请友链</button>
    </EmptyState>

    <!-- 申请弹窗 -->
    <AppModal v-model="modalOpen" title="友链申请" width="500px">
      <div class="tabs">
        <button :class="{ on: tab === 'apply' }" @click="tab = 'apply'">提交申请</button>
        <button :class="{ on: tab === 'mine' }" @click="switchMine">我的申请</button>
      </div>

      <!-- 提交申请 -->
      <div v-if="tab === 'apply'" class="apply-form">
        <TextField v-model="form.name" label="网站名称" placeholder="如：张三的博客" :error="errors.name" />
        <TextField v-model="form.url" label="网站地址" placeholder="https://example.com" :error="errors.url" />
        <div class="logo-row">
          <TextField v-model="form.logo" label="网站 LOGO（可选）" placeholder="图片 URL，或点击上传" class="logo-input" />
          <button class="btn btn-ghost upload-btn" :disabled="uploading" @click="pickLogo">
            {{ uploading ? '上传中…' : '上传' }}
          </button>
          <input ref="logoInput" type="file" accept="image/*" hidden @change="onLogoChange" />
        </div>
        <div class="field">
          <label class="field-label">网站描述（可选）</label>
          <textarea v-model="form.description" rows="3" maxlength="200" placeholder="一句话介绍你的网站"></textarea>
        </div>
        <TextField
          v-model="form.applyEmail"
          label="联系邮箱（可选）"
          placeholder="便于审核结果通知"
          :error="errors.applyEmail"
        />
      </div>

      <!-- 我的申请 -->
      <div v-else class="mine">
        <div v-if="mineLoading" class="mine-loading">加载中…</div>
        <template v-else>
          <div v-if="mineList.length" class="mine-list">
            <div v-for="m in mineList" :key="m.id" class="mine-item">
              <div class="mi-logo">
                <img v-if="m.logo" :src="m.logo" :alt="m.name" />
                <span v-else>{{ (m.name || 'L').charAt(0) }}</span>
              </div>
              <div class="mi-main">
                <div class="mi-top">
                  <strong>{{ m.name }}</strong>
                  <span class="badge" :class="STATUS[m.status]?.cls">{{ STATUS[m.status]?.label || m.status }}</span>
                </div>
                <a :href="m.url" target="_blank" rel="noopener noreferrer" class="mi-url">{{ m.url }}</a>
                <p v-if="m.status === 'REJECTED' && m.auditRemark" class="mi-remark">
                  拒绝原因：{{ m.auditRemark }}
                </p>
                <time class="mi-time">{{ formatDate(m.createTime) }}</time>
              </div>
            </div>
          </div>
          <EmptyState v-else text="还没有提交过申请" icon="📝" />
        </template>
      </div>

      <template #footer>
        <button v-if="tab === 'apply'" class="btn btn-ghost" @click="modalOpen = false">取消</button>
        <button v-if="tab === 'apply'" class="btn btn-primary" :disabled="submitting" @click="submitApply">
          {{ submitting ? '提交中…' : '提交申请' }}
        </button>
        <button v-else class="btn btn-ghost" @click="tab = 'apply'">去申请</button>
      </template>
    </AppModal>
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
.apply-btn {
  margin-top: 18px;
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
  transition: transform var(--t-base) var(--ease-out), box-shadow var(--t-base), border-color var(--t-base);
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

/* —— 弹窗内 —— */
.tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 18px;
  padding: 4px;
  background: var(--bg-sunken);
  border-radius: var(--radius-md);
}
.tabs button {
  flex: 1;
  padding: 9px;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 14px;
  color: var(--text-soft);
  transition: all var(--t-fast);
}
.tabs button.on {
  color: var(--brand);
  background: var(--bg-elev);
  box-shadow: var(--shadow-xs);
}
.apply-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.logo-row {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}
.logo-input {
  flex: 1;
}
.upload-btn {
  height: 50px;
  flex: none;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.field-label {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text-soft);
}
.field textarea {
  padding: 12px 16px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--border);
  background: var(--bg-elev);
  resize: vertical;
  font-size: 15px;
  outline: none;
  transition: border-color var(--t-fast);
}
.field textarea:focus {
  border-color: var(--brand);
}

/* —— 我的申请 —— */
.mine-loading {
  padding: 30px;
  text-align: center;
  color: var(--text-muted);
}
.mine-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.mine-item {
  display: flex;
  gap: 12px;
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--bg-sunken);
}
.mi-logo {
  flex: none;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  display: grid;
  place-items: center;
  font-weight: 700;
  color: #fff;
  background: var(--grad-brand);
}
.mi-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.mi-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.mi-top {
  display: flex;
  align-items: center;
  gap: 10px;
}
.mi-top strong {
  color: var(--text-strong);
}
.mi-url {
  font-size: 12.5px;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mi-remark {
  font-size: 12.5px;
  color: #dc2626;
}
.mi-time {
  font-size: 12px;
  color: var(--text-muted);
}
.badge {
  padding: 2px 10px;
  font-size: 12px;
  font-weight: 600;
  border-radius: var(--radius-pill);
}
.badge.pending {
  color: #d97706;
  background: rgba(217, 119, 6, 0.12);
}
.badge.approved {
  color: #16a34a;
  background: rgba(22, 163, 74, 0.12);
}
.badge.rejected {
  color: #dc2626;
  background: rgba(220, 38, 38, 0.12);
}
</style>
