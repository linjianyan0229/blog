<script setup>
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'

const theme = useThemeStore()
const isDark = computed(() => theme.theme === 'dark')
</script>

<template>
  <button
    class="theme-toggle"
    :class="{ dark: isDark }"
    type="button"
    :aria-label="isDark ? '切换到浅色' : '切换到深色'"
    :title="isDark ? '切换到浅色模式' : '切换到深色模式'"
    @click="theme.toggle()"
  >
    <span class="track">
      <span class="thumb">
        <svg v-if="!isDark" class="ico" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10m0-5a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1m0 17a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1M4 11a1 1 0 0 1 0 2H2a1 1 0 1 1 0-2zm18 0a1 1 0 1 1 0 2h-2a1 1 0 1 1 0-2zM5.6 4.2l1.4 1.4A1 1 0 0 1 5.6 7L4.2 5.6a1 1 0 0 1 1.4-1.4m12.8 12.8 1.4 1.4a1 1 0 1 1-1.4 1.4L17 19.8a1 1 0 0 1 1.4-1.4M18.4 4.2a1 1 0 0 1 1.4 1.4L18.4 7A1 1 0 0 1 17 5.6zM5.6 17l1.4 1.4A1 1 0 0 1 5.6 19.8L4.2 18.4A1 1 0 0 1 5.6 17"
          />
        </svg>
        <svg v-else class="ico" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M12.74 2.07a1 1 0 0 0-1.1.27 8 8 0 1 0 11.2 11.2 1 1 0 0 0-1.06-1.6 6 6 0 0 1-7.6-7.6 1 1 0 0 0-.44-2.27z"
          />
        </svg>
      </span>
    </span>
  </button>
</template>

<style scoped>
.theme-toggle {
  display: inline-flex;
  align-items: center;
  padding: 0;
}
.track {
  position: relative;
  width: 52px;
  height: 28px;
  border-radius: var(--radius-pill);
  background: var(--bg-sunken);
  border: 1px solid var(--border);
  transition: background var(--t-base) var(--ease-out), border-color var(--t-base);
}
.theme-toggle.dark .track {
  background: var(--brand-ghost);
  border-color: var(--brand);
}
.thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: #f59e0b;
  background: var(--bg-elev);
  box-shadow: var(--shadow-sm);
  transition: transform var(--t-base) var(--ease-spring), color var(--t-base);
}
.theme-toggle.dark .thumb {
  transform: translateX(24px);
  color: var(--brand);
}
.ico {
  width: 15px;
  height: 15px;
}
</style>
