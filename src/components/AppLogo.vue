<script setup>
import { computed } from 'vue'
import { useSiteStore } from '@/stores/site'

defineProps({ compact: { type: Boolean, default: false } })

const site = useSiteStore()
const logo = computed(() => site.navLogo)
const title = computed(() => site.navTitle)
</script>

<template>
  <router-link to="/" class="logo" :class="{ compact }">
    <span class="mark">
      <img v-if="logo" :src="logo" alt="logo" class="logo-img" />
      <svg v-else viewBox="0 0 32 32" width="28" height="28">
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#60a5fa" />
            <stop offset="1" stop-color="#2563eb" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="28" height="28" rx="9" fill="url(#lg)" />
        <path
          d="M11 21V11h4.5a3 3 0 0 1 .6 5.94A3.2 3.2 0 0 1 16.4 23H11zm2.4-6.1h1.9a1.1 1.1 0 0 0 0-2.2h-1.9zm0 4.1h2.1a1.2 1.2 0 0 0 0-2.4h-2.1z"
          fill="#fff"
        />
      </svg>
    </span>
    <span v-if="!compact" class="name">
      <template v-if="title">{{ title }}</template>
      <template v-else>蔚蓝<b>博客</b></template>
    </span>
  </router-link>
</template>

<style scoped>
.logo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  color: var(--text-strong);
}
.mark {
  display: grid;
  place-items: center;
  transition: transform var(--t-base) var(--ease-spring);
}
.logo:hover .mark {
  transform: rotate(-8deg) scale(1.06);
}
.logo-img {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  object-fit: cover;
}
.name {
  font-size: 19px;
  letter-spacing: 0.5px;
}
.name b {
  background: var(--grad-brand);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
