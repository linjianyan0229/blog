<script setup>
import { reactive, ref, watchEffect } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'
import { userApi } from '@/api/user'
import { fileApi } from '@/api/file'
import TextField from '@/components/TextField.vue'
import { toast } from '@/utils/message'
import { icons } from '@/utils/icons'
import { formatDate } from '@/utils/format'

const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

const tab = ref('profile')
const fileInput = ref(null)
const uploading = ref(false)
const savingProfile = ref(false)
const savingPwd = ref(false)

const profile = reactive({ nickname: '', avatar: '', bio: '', gender: 0 })
const pwd = reactive({ oldPassword: '', newPassword: '', confirm: '' })
const pwdErr = reactive({ oldPassword: '', newPassword: '', confirm: '' })

watchEffect(() => {
  if (userInfo.value) {
    profile.nickname = userInfo.value.nickname || ''
    profile.avatar = userInfo.value.avatar || ''
    profile.bio = userInfo.value.bio || ''
    profile.gender = userInfo.value.gender ?? 0
  }
})

function pickAvatar() {
  fileInput.value?.click()
}

async function onFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) return toast.warning('请选择图片文件')
  if (file.size > 5 * 1024 * 1024) return toast.warning('图片不能超过 5MB')
  uploading.value = true
  try {
    const url = await fileApi.upload(file)
    profile.avatar = url
    toast.success('头像已上传，记得保存')
  } finally {
    uploading.value = false
    e.target.value = ''
  }
}

async function saveProfile() {
  savingProfile.value = true
  try {
    await userApi.updateProfile({
      nickname: profile.nickname,
      avatar: profile.avatar,
      bio: profile.bio,
      gender: profile.gender,
    })
    await userStore.fetchInfo()
    toast.success('资料已更新')
  } finally {
    savingProfile.value = false
  }
}

function validatePwd() {
  pwdErr.oldPassword = pwd.oldPassword ? '' : '请输入原密码'
  pwdErr.newPassword = pwd.newPassword.length >= 6 && pwd.newPassword.length <= 32 ? '' : '新密码 6~32 位'
  pwdErr.confirm = pwd.confirm === pwd.newPassword ? '' : '两次密码不一致'
  return !pwdErr.oldPassword && !pwdErr.newPassword && !pwdErr.confirm
}

async function savePassword() {
  if (!validatePwd()) return
  savingPwd.value = true
  try {
    await userApi.updatePassword({ oldPassword: pwd.oldPassword, newPassword: pwd.newPassword })
    toast.success('密码修改成功，请重新登录')
    pwd.oldPassword = pwd.newPassword = pwd.confirm = ''
    await userStore.logout()
    location.href = '/login'
  } finally {
    savingPwd.value = false
  }
}

const genders = [
  { v: 0, label: '保密' },
  { v: 1, label: '男' },
  { v: 2, label: '女' },
]
</script>

<template>
  <div class="container page">
    <div class="layout">
      <!-- 侧栏概览 -->
      <aside class="profile-card card">
        <div class="banner"></div>
        <button class="avatar-edit" :disabled="uploading" @click="pickAvatar">
          <img v-if="profile.avatar" :src="profile.avatar" alt="avatar" />
          <span v-else class="a-fb">{{ (userInfo?.nickname || userInfo?.username || 'U').charAt(0).toUpperCase() }}</span>
          <span class="cam">{{ uploading ? '…' : '📷' }}</span>
        </button>
        <input ref="fileInput" type="file" accept="image/*" hidden @change="onFileChange" />
        <h2>{{ userInfo?.nickname || userInfo?.username }}</h2>
        <p class="email">{{ userInfo?.email }}</p>
        <div class="roles">
          <span v-for="r in userInfo?.roles || []" :key="r" class="chip">{{ r }}</span>
        </div>
        <p class="join">注册于 {{ formatDate(userInfo?.createTime) }}</p>
      </aside>

      <!-- 主区 -->
      <section class="main card">
        <div class="tabs">
          <button :class="{ on: tab === 'profile' }" @click="tab = 'profile'">个人资料</button>
          <button :class="{ on: tab === 'security' }" @click="tab = 'security'">账号安全</button>
        </div>

        <transition name="route-fade" mode="out-in">
          <!-- 资料 -->
          <div v-if="tab === 'profile'" key="p" class="panel">
            <TextField v-model="profile.nickname" label="昵称" placeholder="给自己起个昵称" :icon="icons.user" :maxlength="50" />
            <div class="field">
              <label class="label">性别</label>
              <div class="seg">
                <button
                  v-for="g in genders"
                  :key="g.v"
                  :class="{ on: profile.gender === g.v }"
                  @click="profile.gender = g.v"
                >
                  {{ g.label }}
                </button>
              </div>
            </div>
            <div class="field">
              <label class="label">个人简介</label>
              <textarea v-model="profile.bio" rows="4" maxlength="500" placeholder="介绍一下你自己…"></textarea>
              <small class="cnt">{{ profile.bio.length }}/500</small>
            </div>
            <button class="btn btn-primary save" :disabled="savingProfile" @click="saveProfile">
              {{ savingProfile ? '保存中…' : '保存资料' }}
            </button>
          </div>

          <!-- 安全 -->
          <div v-else key="s" class="panel">
            <TextField v-model="pwd.oldPassword" label="原密码" type="password" placeholder="请输入原密码" :icon="icons.lock" :error="pwdErr.oldPassword" />
            <TextField v-model="pwd.newPassword" label="新密码" type="password" placeholder="6~32 位" :icon="icons.lock" :error="pwdErr.newPassword" />
            <TextField v-model="pwd.confirm" label="确认新密码" type="password" placeholder="再次输入新密码" :icon="icons.lock" :error="pwdErr.confirm" />
            <button class="btn btn-primary save" :disabled="savingPwd" @click="savePassword">
              {{ savingPwd ? '提交中…' : '修改密码' }}
            </button>
          </div>
        </transition>
      </section>
    </div>
  </div>
</template>

<style scoped>
.page {
  padding: var(--space-6) var(--space-5) var(--space-7);
}
.layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: var(--space-5);
  align-items: start;
}

/* —— 侧栏 —— */
.profile-card {
  position: relative;
  overflow: hidden;
  padding: 0 var(--space-5) var(--space-5);
  text-align: center;
}
.banner {
  height: 96px;
  margin: 0 calc(-1 * var(--space-5)) 0;
  background: var(--grad-brand);
}
.avatar-edit {
  position: relative;
  width: 92px;
  height: 92px;
  margin: -46px auto 12px;
  border-radius: 50%;
  border: 4px solid var(--bg-elev);
  overflow: hidden;
  display: block;
}
.avatar-edit img,
.a-fb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.a-fb {
  display: grid;
  place-items: center;
  font-size: 34px;
  font-weight: 800;
  color: #fff;
  background: var(--grad-brand);
}
.cam {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: 22px;
  opacity: 0;
  background: rgba(0, 0, 0, 0.4);
  transition: opacity var(--t-fast);
}
.avatar-edit:hover .cam {
  opacity: 1;
}
.profile-card h2 {
  font-size: 19px;
  color: var(--text-strong);
}
.email {
  margin-top: 4px;
  font-size: 13px;
  color: var(--text-muted);
}
.roles {
  display: flex;
  gap: 6px;
  justify-content: center;
  margin: 12px 0;
  flex-wrap: wrap;
}
.join {
  font-size: 12.5px;
  color: var(--text-muted);
}

/* —— 主区 —— */
.main {
  padding: var(--space-5) clamp(20px, 4vw, 40px) var(--space-6);
}
.tabs {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid var(--divider);
  margin-bottom: var(--space-5);
}
.tabs button {
  position: relative;
  padding: 12px 6px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-soft);
  transition: color var(--t-fast);
}
.tabs button.on {
  color: var(--brand);
}
.tabs button.on::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 3px;
  border-radius: 3px;
  background: var(--grad-brand);
}
.panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  max-width: 460px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.label {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text-soft);
}
.seg {
  display: inline-flex;
  gap: 4px;
  padding: 4px;
  background: var(--bg-sunken);
  border-radius: var(--radius-md);
  width: fit-content;
}
.seg button {
  padding: 8px 22px;
  border-radius: var(--radius-sm);
  font-weight: 500;
  color: var(--text-soft);
  transition: all var(--t-fast);
}
.seg button.on {
  color: var(--text-on-brand);
  background: var(--grad-brand);
  box-shadow: var(--shadow-sm);
}
textarea {
  padding: 12px 16px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--border);
  background: var(--bg-elev);
  resize: vertical;
  font-size: 15px;
  outline: none;
  transition: border-color var(--t-fast);
}
textarea:focus {
  border-color: var(--brand);
}
.cnt {
  align-self: flex-end;
  font-size: 12px;
  color: var(--text-muted);
}
.save {
  align-self: flex-start;
  height: 46px;
  margin-top: 6px;
}

@media (max-width: 820px) {
  .layout {
    grid-template-columns: 1fr;
  }
}
</style>
