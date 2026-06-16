<script setup>
import { watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  width: { type: String, default: '480px' },
})
const emit = defineEmits(['update:modelValue'])

function close() {
  emit('update:modelValue', false)
}

watch(
  () => props.modelValue,
  (v) => {
    document.body.style.overflow = v ? 'hidden' : ''
  }
)
</script>

<template>
  <teleport to="body">
    <transition name="modal">
      <div v-if="modelValue" class="modal-mask" @click.self="close">
        <div class="modal-card" :style="{ width }">
          <div class="modal-head">
            <h3>{{ title }}</h3>
            <button class="modal-close" aria-label="关闭" @click="close">✕</button>
          </div>
          <div class="modal-body"><slot /></div>
          <div v-if="$slots.footer" class="modal-foot"><slot name="footer" /></div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
.modal-mask {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 20px;
  background: var(--bg-mask);
  backdrop-filter: blur(4px);
}
.modal-card {
  max-width: calc(100vw - 40px);
  max-height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}
.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px;
  border-bottom: 1px solid var(--divider);
}
.modal-head h3 {
  font-size: 17px;
  font-weight: 700;
  color: var(--text-strong);
}
.modal-close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: var(--text-muted);
  transition: all var(--t-fast);
}
.modal-close:hover {
  background: var(--bg-hover);
  color: var(--brand);
}
.modal-body {
  padding: 22px;
  overflow-y: auto;
}
.modal-foot {
  padding: 14px 22px;
  border-top: 1px solid var(--divider);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--t-base) var(--ease-out);
}
.modal-enter-active .modal-card,
.modal-leave-active .modal-card {
  transition: transform var(--t-base) var(--ease-spring), opacity var(--t-base) var(--ease-out);
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal-card,
.modal-leave-to .modal-card {
  opacity: 0;
  transform: translateY(20px) scale(0.96);
}
</style>
