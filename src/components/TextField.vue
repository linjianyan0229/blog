<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  type: { type: String, default: 'text' },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  icon: { type: String, default: '' },
  error: { type: String, default: '' },
  autocomplete: { type: String, default: 'off' },
  maxlength: { type: [Number, String], default: undefined },
})
const emit = defineEmits(['update:modelValue', 'enter'])

const show = ref(false)
const isPassword = computed(() => props.type === 'password')
const realType = computed(() => (isPassword.value ? (show.value ? 'text' : 'password') : props.type))
</script>

<template>
  <div class="field" :class="{ 'has-error': error }">
    <label v-if="label" class="label">{{ label }}</label>
    <div class="control">
      <span v-if="icon" class="ico" v-html="icon"></span>
      <input
        :type="realType"
        :value="modelValue"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :maxlength="maxlength"
        @input="emit('update:modelValue', $event.target.value)"
        @keyup.enter="emit('enter')"
      />
      <slot name="suffix" />
      <button
        v-if="isPassword"
        type="button"
        class="eye"
        :aria-label="show ? '隐藏密码' : '显示密码'"
        @click="show = !show"
      >
        <svg v-if="show" viewBox="0 0 24 24"><path fill="currentColor" d="M12 6a9.8 9.8 0 0 1 8.8 5.5 9.8 9.8 0 0 1-17.6 0A9.8 9.8 0 0 1 12 6m0 2a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7m0 1.8a1.7 1.7 0 1 1 0 3.4 1.7 1.7 0 0 1 0-3.4"/></svg>
        <svg v-else viewBox="0 0 24 24"><path fill="currentColor" d="m2.4 3.8 1.4-1.4 16.8 16.8-1.4 1.4-2.8-2.8A11 11 0 0 1 12 18 9.8 9.8 0 0 1 3.2 12.5a9.9 9.9 0 0 1 3.3-3.9zm6.1 6.1A3.5 3.5 0 0 0 12 15.5c.3 0 .6 0 .9-.1zM12 6a9.8 9.8 0 0 1 8.8 5.5 9.9 9.9 0 0 1-2 2.7l-1.4-1.5a3.5 3.5 0 0 0-4.6-4.6L11 6.2A10 10 0 0 1 12 6"/></svg>
      </button>
    </div>
    <transition name="err">
      <small v-if="error" class="err-text">{{ error }}</small>
    </transition>
  </div>
</template>

<style scoped>
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
.control {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 50px;
  padding: 0 16px;
  border-radius: var(--radius-md);
  background: var(--bg-elev);
  border: 1.5px solid var(--border);
  transition: border-color var(--t-fast), box-shadow var(--t-fast), background var(--t-fast);
}
.control:focus-within {
  border-color: var(--brand);
  box-shadow: 0 0 0 4px var(--brand-ghost);
}
.has-error .control {
  border-color: #ef4444;
}
.ico {
  display: flex;
  color: var(--text-muted);
}
.ico :deep(svg) {
  width: 19px;
  height: 19px;
}
.control input {
  flex: 1;
  min-width: 0;
  border: none;
  background: none;
  outline: none;
  font-size: 15px;
}
.eye {
  display: flex;
  color: var(--text-muted);
  transition: color var(--t-fast);
}
.eye:hover {
  color: var(--brand);
}
.eye svg {
  width: 20px;
  height: 20px;
}
.err-text {
  font-size: 12.5px;
  color: #ef4444;
}
.err-enter-active,
.err-leave-active {
  transition: opacity var(--t-fast), transform var(--t-fast);
}
.err-enter-from,
.err-leave-to {
  opacity: 0;
  transform: translateY(-3px);
}
</style>
