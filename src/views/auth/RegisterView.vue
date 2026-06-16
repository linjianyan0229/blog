<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthShell from '@/components/AuthShell.vue'
import TextField from '@/components/TextField.vue'
import { authApi } from '@/api/auth'
import { toast } from '@/utils/message'
import { icons } from '@/utils/icons'
import { useCountdown } from '@/composables/useCountdown'

const router = useRouter()
const { count, start } = useCountdown(60)

const form = reactive({ username: '', email: '', password: '', code: '' })
const errors = reactive({ username: '', email: '', password: '', code: '' })
const loading = ref(false)
const sending = ref(false)

const emailValid = () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)

function validate() {
  errors.username = form.username.length >= 2 && form.username.length <= 20 ? '' : '用户名 2~20 位'
  errors.email = emailValid() ? '' : '请输入有效的邮箱地址'
  errors.password = form.password.length >= 6 && form.password.length <= 32 ? '' : '密码 6~32 位'
  errors.code = form.code.trim() ? '' : '请输入验证码'
  return !errors.username && !errors.email && !errors.password && !errors.code
}

async function sendCode() {
  if (!emailValid()) {
    errors.email = '请先填写有效邮箱'
    return
  }
  if (count.value > 0 || sending.value) return
  sending.value = true
  try {
    await authApi.sendCode({ email: form.email, type: 'register' })
    toast.success('验证码已发送，请查收邮箱')
    start()
  } catch {
    /* 拦截器已提示（如限流） */
  } finally {
    sending.value = false
  }
}

async function onSubmit() {
  if (!validate() || loading.value) return
  loading.value = true
  try {
    await authApi.register({ ...form })
    toast.success('注册成功，请登录')
    router.push({ path: '/login', query: { email: form.email } })
  } catch {
    /* 拦截器已提示 */
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthShell title="创建账号" subtitle="加入蔚蓝，开始你的记录">
    <form class="form" @submit.prevent="onSubmit">
      <TextField
        v-model="form.username"
        label="用户名"
        placeholder="2~20 位"
        :icon="icons.user"
        :error="errors.username"
      />
      <TextField
        v-model="form.email"
        label="邮箱"
        type="email"
        placeholder="you@example.com"
        autocomplete="email"
        :icon="icons.email"
        :error="errors.email"
      />
      <TextField
        v-model="form.code"
        label="邮箱验证码"
        placeholder="6 位验证码"
        :icon="icons.code"
        :error="errors.code"
      >
        <template #suffix>
          <button
            type="button"
            class="code-btn"
            :disabled="count > 0 || sending"
            @click="sendCode"
          >
            {{ count > 0 ? `${count}s` : sending ? '发送中' : '获取验证码' }}
          </button>
        </template>
      </TextField>
      <TextField
        v-model="form.password"
        label="密码"
        type="password"
        placeholder="6~32 位"
        autocomplete="new-password"
        :icon="icons.lock"
        :error="errors.password"
      />
      <button class="btn btn-primary submit" :disabled="loading" type="submit">
        <span v-if="loading" class="spinner"></span>
        {{ loading ? '注册中…' : '注 册' }}
      </button>
      <p class="foot">已有账号？<router-link to="/login">去登录</router-link></p>
    </form>
  </AuthShell>
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.code-btn {
  flex: none;
  padding: 7px 14px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  color: var(--brand);
  background: var(--brand-ghost);
  border-radius: var(--radius-sm);
  transition: all var(--t-fast);
}
.code-btn:hover:not(:disabled) {
  background: var(--brand);
  color: #fff;
}
.code-btn:disabled {
  color: var(--text-muted);
  background: var(--bg-sunken);
  cursor: not-allowed;
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
