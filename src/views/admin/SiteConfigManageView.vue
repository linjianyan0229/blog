<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Check, UploadFilled, Message } from '@element-plus/icons-vue'
import { adminApi } from '@/api/admin'
import { fileApi } from '@/api/file'
import { useUserStore } from '@/stores/user'
import { useSiteStore } from '@/stores/site'
import PageHeader from '@/components/admin/PageHeader.vue'

const userStore = useUserStore()
const siteStore = useSiteStore()

const loading = ref(false)
const saving = ref(false)
const list = ref([])

async function load() {
  loading.value = true
  try {
    const data = (await adminApi.siteConfig.list()) || []
    list.value = data.slice().sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
  } finally {
    loading.value = false
  }
}

function uploadFor(item, opt) {
  return fileApi
    .upload(opt.file)
    .then((url) => {
      item.configValue = url
      ElMessage.success('上传成功')
    })
    .catch(() => {})
}

async function save() {
  saving.value = true
  try {
    const payload = list.value.map((i) => ({
      configKey: i.configKey,
      configValue: i.configValue,
      name: i.name,
      type: i.type,
      sort: i.sort,
    }))
    await adminApi.siteConfig.update(payload)
    ElMessage.success('保存成功，已即时生效')
    // 刷新前台站点配置（标题 / favicon / 导航 / 页脚等随之更新）
    await siteStore.refresh()
  } finally {
    saving.value = false
  }
}

async function sendTestMail() {
  const { value } = await ElMessageBox.prompt('请输入接收测试邮件的邮箱地址', '发送测试邮件', {
    confirmButtonText: '发送',
    cancelButtonText: '取消',
    inputPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    inputErrorMessage: '邮箱格式不正确',
    inputPlaceholder: 'you@example.com',
  })
  await adminApi.siteConfig.testMail(value)
  ElMessage.success(`测试邮件已发送，请查收 ${value}`)
}

load()
</script>

<template>
  <div>
    <PageHeader title="站点配置" subtitle="自定义站点名称、Logo、首页背景、页脚等，保存后即时生效">
      <template #actions>
        <el-button v-if="userStore.hasPerm('config:update')" :icon="Message" round @click="sendTestMail">
          发送测试邮件
        </el-button>
        <el-button
          v-if="userStore.hasPerm('config:update')"
          type="primary"
          :icon="Check"
          round
          :loading="saving"
          @click="save"
        >
          保存配置
        </el-button>
      </template>
    </PageHeader>

    <div v-loading="loading" class="card config-card">
      <el-empty v-if="!loading && !list.length" description="暂无配置项" />

      <div v-for="item in list" :key="item.configKey" class="config-row">
        <div class="config-label">
          <span class="label-name">{{ item.name || item.configKey }}</span>
          <code class="label-key">{{ item.configKey }}</code>
        </div>

        <div class="config-control">
          <!-- 文本 -->
          <el-input
            v-if="item.type === 'text'"
            v-model="item.configValue"
            placeholder="请输入"
            clearable
          />

          <!-- 密码（如邮箱 SMTP 授权码） -->
          <el-input
            v-else-if="item.type === 'password'"
            v-model="item.configValue"
            type="password"
            show-password
            placeholder="请输入"
            clearable
          />

          <!-- 多行文本 -->
          <el-input
            v-else-if="item.type === 'textarea'"
            v-model="item.configValue"
            type="textarea"
            :rows="3"
            placeholder="请输入"
          />

          <!-- 颜色 -->
          <div v-else-if="item.type === 'color'" class="color-control">
            <el-color-picker v-model="item.configValue" />
            <el-input v-model="item.configValue" placeholder="#2563eb" style="width: 160px" />
          </div>

          <!-- 图片 -->
          <div v-else-if="item.type === 'image'" class="image-control">
            <div class="img-preview" :class="{ empty: !item.configValue }">
              <img v-if="item.configValue" :src="item.configValue" alt="preview" />
              <span v-else>无图</span>
            </div>
            <div class="img-actions">
              <el-upload
                :show-file-list="false"
                accept="image/*"
                :http-request="(opt) => uploadFor(item, opt)"
              >
                <el-button :icon="UploadFilled">上传图片</el-button>
              </el-upload>
              <el-input
                v-model="item.configValue"
                placeholder="或直接填写图片 URL"
                clearable
                class="img-url"
              />
            </div>
          </div>

          <!-- 其它类型回退为普通输入 -->
          <el-input v-else v-model="item.configValue" placeholder="请输入" clearable />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.config-card {
  padding: 8px 4px;
}
.config-row {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 24px;
  align-items: start;
  padding: 20px 20px;
  border-bottom: 1px solid var(--divider);
}
.config-row:last-child {
  border-bottom: none;
}
.config-label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 6px;
}
.label-name {
  font-weight: 600;
  color: var(--text-strong);
}
.label-key {
  font-size: 12px;
  color: var(--text-muted);
  font-family: var(--font-mono);
}
.config-control {
  max-width: 560px;
}
.color-control {
  display: flex;
  align-items: center;
  gap: 12px;
}
.image-control {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}
.img-preview {
  width: 140px;
  height: 80px;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--border);
  background: var(--bg-sunken);
  flex: none;
}
.img-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.img-preview.empty {
  display: grid;
  place-items: center;
  color: var(--text-muted);
  font-size: 13px;
}
.img-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}
.img-url {
  max-width: 360px;
}

@media (max-width: 768px) {
  .config-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>
