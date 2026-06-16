<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthShell from '@/components/AuthShell.vue'
import TextField from '@/components/TextField.vue'
import { useUserStore } from '@/stores/user'
import { toast } from '@/utils/message'
import { icons } from '@/utils/icons'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const form = reactive({ email: '', password: '' })
const errors = reactive({ email: '', password: '' })
const loading = ref(false)

function validate() {
  errors.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? '' : '请输入有效的邮箱地址'
  errors.password = form.password.length >= 6 ? '' : '密码至少 6 位'
  return !errors.email && !errors.password
}

async function onSubmit() {
  if (!validate() || loading.value) return
  loading.value = true
  try {
    await userStore.login({ email: form.email, password: form.password })
    toast.success('登录成功，欢迎回来 👋')
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } catch {
    /* 拦截器已提示 */
  } finally {
    loading.value = false
  }
}

function fillDemo() {
  form.email = 'admin@blog.com'
  form.password = 'admin123'
}
</script>

<template>
  <AuthShell title="欢迎回来" subtitle="登录以继续你的蔚蓝之旅">
    <form class="form" @submit.prevent="onSubmit">
      <TextField
        v-model="form.email"
        label="邮箱"
        type="email"
        placeholder="you@example.com"
        autocomplete="email"
        :icon="icons.email"
        :error="errors.email"
        @enter="onSubmit"
      />
      <TextField
        v-model="form.password"
        label="密码"
        type="password"
        placeholder="请输入密码"
        autocomplete="current-password"
        :icon="icons.lock"
        :error="errors.password"
        @enter="onSubmit"
      />
      <div class="row">
        <button type="button" class="link" @click="fillDemo">填入演示账号</button>
        <router-link to="/reset-password" class="link">忘记密码？</router-link>
      </div>
      <button class="btn btn-primary submit" :disabled="loading" type="submit">
        <span v-if="loading" class="spinner"></span>
        {{ loading ? '登录中…' : '登 录' }}
      </button>
      <p class="foot">
        还没有账号？<router-link to="/register">立即注册</router-link>
      </p>
    </form>
  </AuthShell>
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: -4px;
}
.link {
  font-size: 13.5px;
  color: var(--brand);
}
.link:hover {
  text-decoration: underline;
}
.submit {
  height: 50px;
  margin-top: 6px;
  font-size: 16px;
}
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
.foot {
  text-align: center;
  font-size: 14px;
  color: var(--text-soft);
}
.foot a {
  font-weight: 600;
}
</style>
