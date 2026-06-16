<script setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'
import { fromNow } from '@/utils/format'

defineOptions({ name: 'CommentItem' })

const props = defineProps({
  comment: { type: Object, required: true },
  depth: { type: Number, default: 0 },
})
const emit = defineEmits(['reply', 'delete'])

const userStore = useUserStore()
const { userInfo, isAdmin, isLogin } = storeToRefs(userStore)

const replying = ref(false)
const replyText = ref('')

const initial = computed(() => (props.comment.nickname || 'U').charAt(0).toUpperCase())
const canDelete = computed(
  () => isAdmin.value || (isLogin.value && userInfo.value?.id === props.comment.userId)
)

function submitReply() {
  const content = replyText.value.trim()
  if (!content) return
  emit('reply', { parentId: props.comment.id, content })
  replyText.value = ''
  replying.value = false
}
</script>

<template>
  <div class="c-item" :class="{ child: depth > 0 }">
    <div class="avatar">
      <img v-if="comment.avatar" :src="comment.avatar" alt="" />
      <span v-else>{{ initial }}</span>
    </div>
    <div class="c-main">
      <div class="c-head">
        <strong>{{ comment.nickname || '匿名用户' }}</strong>
        <time>{{ fromNow(comment.createTime) }}</time>
      </div>
      <p class="c-content">{{ comment.content }}</p>
      <div class="c-actions">
        <button @click="replying = !replying">{{ replying ? '取消' : '回复' }}</button>
        <button v-if="canDelete" class="del" @click="emit('delete', comment.id)">删除</button>
      </div>

      <transition name="slide">
        <div v-if="replying" class="reply-box">
          <textarea
            v-model="replyText"
            rows="2"
            :placeholder="`回复 @${comment.nickname}…`"
            @keydown.ctrl.enter="submitReply"
          ></textarea>
          <button class="btn btn-primary sm" @click="submitReply">发送</button>
        </div>
      </transition>

      <div v-if="comment.children?.length" class="children">
        <CommentItem
          v-for="c in comment.children"
          :key="c.id"
          :comment="c"
          :depth="depth + 1"
          @reply="emit('reply', $event)"
          @delete="emit('delete', $event)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.c-item {
  display: flex;
  gap: 12px;
  padding: 16px 0;
}
.c-item.child {
  padding: 12px 0 0;
}
.avatar {
  flex: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  display: grid;
  place-items: center;
  font-weight: 700;
  color: #fff;
  background: var(--grad-brand);
}
.c-item.child .avatar {
  width: 32px;
  height: 32px;
  font-size: 13px;
}
.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.c-main {
  flex: 1;
  min-width: 0;
}
.c-head {
  display: flex;
  align-items: center;
  gap: 10px;
}
.c-head strong {
  color: var(--text-strong);
  font-size: 14.5px;
}
.c-head time {
  font-size: 12px;
  color: var(--text-muted);
}
.c-content {
  margin: 5px 0 8px;
  color: var(--text);
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
}
.c-actions {
  display: flex;
  gap: 14px;
  font-size: 13px;
}
.c-actions button {
  color: var(--text-muted);
  transition: color var(--t-fast);
}
.c-actions button:hover {
  color: var(--brand);
}
.c-actions .del:hover {
  color: #dc2626;
}
.reply-box {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}
.reply-box textarea {
  flex: 1;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--bg-sunken);
  resize: vertical;
  font-size: 14px;
  outline: none;
  transition: border-color var(--t-fast);
}
.reply-box textarea:focus {
  border-color: var(--brand);
  background: var(--bg-elev);
}
.btn.sm {
  height: 38px;
  align-self: flex-end;
  padding-inline: 18px;
}
.children {
  margin-top: 6px;
  padding-left: 6px;
  border-left: 2px solid var(--divider);
}
.slide-enter-active,
.slide-leave-active {
  transition: opacity var(--t-fast), transform var(--t-fast) var(--ease-out);
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
