<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
})
</script>

<template>
  <div class="page-header">
    <div class="ph-left">
      <h1>{{ title }}</h1>
      <p v-if="subtitle">{{ subtitle }}</p>
    </div>
    <div class="ph-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: var(--space-5);
}
.ph-left h1 {
  font-size: 22px;
  font-weight: 800;
  color: var(--text-strong);
}
.ph-left p {
  margin-top: 4px;
  font-size: 13.5px;
  color: var(--text-muted);
}
.ph-actions {
  display: flex;
  gap: 10px;
}
</style>
