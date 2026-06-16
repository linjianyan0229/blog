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
  animation: float 4s var(--ease-in-out) infinite;
}
.empty p {
  color: var(--text-muted);
  font-size: 15px;
}
</style>
