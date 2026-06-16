<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { publicApi } from '@/api/public'
import { commentApi } from '@/api/comment'
import { useUserStore } from '@/stores/user'
import { toast } from '@/utils/message'
import CommentItem from '@/components/CommentItem.vue'
import EmptyState from '@/components/EmptyState.vue'

const props = defineProps({
  articleId: { type: [Number, String], required: true },
  count: { type: Number, default: 0 },
})
const emit = defineEmits(['change'])

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const { isLogin, userInfo } = storeToRefs(userStore)

const comments = ref([])
const loading = ref(true)
const text = ref('')
const submitting = ref(false)

async function load() {
  loading.value = true
  try {
    comments.value = await publicApi.getComments(props.articleId)
  } catch {
    comments.value = []
  } finally {
    loading.value = false
  }
}

function requireLogin() {
  toast.warning('请先登录后再评论')
  router.push({ path: '/login', query: { redirect: route.fullPath } })
}

async function submit(parentId = 0, content = text.value) {
  if (!isLogin.value) return requireLogin()
  const body = content.trim()
  if (!body) return toast.warning('评论内容不能为空')
  submitting.value = true
  try {
    await commentApi.add({ articleId: Number(props.articleId), content: body, parentId })
    if (parentId === 0) text.value = ''
    toast.success('评论发表成功')
    emit('change', 1)
    await load()
  } finally {
    submitting.value = false
  }
}

function onReply({ parentId, content }) {
  if (!isLogin.value) return requireLogin()
  submit(parentId, content)
}

async function onDelete(id) {
  try {
    await commentApi.remove(id)
    toast.success('已删除')
    emit('change', -1)
    await load()
  } catch {
    /* 拦截器已提示 */
  }
}

load()
</script>

<template>
  <section class="comments card">
    <h2 class="c-title">
      评论 <span class="cnt">{{ count }}</span>
    </h2>

    <!-- 发表框 -->
    <div class="post-box">
      <div class="post-avatar">
        <img v-if="isLogin && userInfo?.avatar" :src="userInfo.avatar" alt="" />
        <span v-else>{{ isLogin ? (userInfo?.nickname || 'U').charAt(0) : '?' }}</span>
      </div>
      <div class="post-main">
        <textarea
          v-model="text"
          rows="3"
          :placeholder="isLogin ? '说点什么吧… (Ctrl+Enter 发送)' : '登录后即可参与评论'"
          :disabled="!isLogin"
          @keydown.ctrl.enter="submit(0)"
          @focus="!isLogin && requireLogin()"
        ></textarea>
        <div class="post-foot">
          <span class="hint">{{ text.length }}/1000</span>
          <button
            class="btn btn-primary"
            :disabled="submitting || !text.trim()"
            @click="isLogin ? submit(0) : requireLogin()"
          >
            {{ submitting ? '发送中…' : '发表评论' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 列表 -->
    <div v-if="loading" class="c-loading">加载评论中…</div>
    <div v-else-if="comments.length" class="c-list">
      <CommentItem
        v-for="c in comments"
        :key="c.id"
        :comment="c"
        @reply="onReply"
        @delete="onDelete"
      />
    </div>
    <EmptyState v-else text="还没有评论，来抢沙发吧～" icon="💬" />
  </section>
</template>

<style scoped>
.comments {
  margin-top: var(--space-6);
  padding: clamp(20px, 4vw, 36px);
}
.c-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-strong);
  margin-bottom: var(--space-5);
}
.cnt {
  font-size: 13px;
  padding: 2px 12px;
  border-radius: var(--radius-pill);
  color: var(--brand);
  background: var(--brand-ghost);
}
.post-box {
  display: flex;
  gap: 14px;
  padding-bottom: var(--space-5);
  border-bottom: 1px solid var(--divider);
}
.post-avatar {
  flex: none;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
  display: grid;
  place-items: center;
  font-weight: 700;
  color: #fff;
  background: var(--grad-brand);
}
.post-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.post-main {
  flex: 1;
}
.post-main textarea {
  width: 100%;
  padding: 14px 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--bg-sunken);
  resize: vertical;
  font-size: 14.5px;
  line-height: 1.6;
  outline: none;
  transition: border-color var(--t-fast), background var(--t-fast);
}
.post-main textarea:focus {
  border-color: var(--brand);
  background: var(--bg-elev);
}
.post-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
}
.hint {
  font-size: 12.5px;
  color: var(--text-muted);
}
.c-loading {
  padding: var(--space-6);
  text-align: center;
  color: var(--text-muted);
}
.c-list {
  margin-top: var(--space-3);
}
.c-list > :deep(.c-item):not(:last-child) {
  border-bottom: 1px solid var(--divider);
}
</style>
