<script setup>
defineProps({
  text: { type: String, default: '这里空空如也' },
  icon: { type: String, default: '🪶' },
})
</script>

<template>
  <div class="empty">
    <div class="ico">{{ icon }}</div>
    <p>{{ text }}</p>
    <slot />
  </div>
</template>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: var(--space-8) var(--space-4);
  text-align: center;
  animation: fade-in var(--t-slow) var(--ease-out) both;
}
.ico {
  font-size: 56px;
  filter: grayscale(0.2);
  /* 仅入场轻微弹出，不再持续上下浮动 */
  animation: pop-in 0.45s var(--ease-spring) both;
}
.empty p {
  color: var(--text-muted);
  font-size: 15px;
}
</style>
