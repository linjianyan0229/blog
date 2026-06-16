<template>
  <div class="sk-card">
    <div class="sk-cover shimmer"></div>
    <div class="sk-body">
      <div class="sk-line w80 shimmer"></div>
      <div class="sk-line w60 shimmer"></div>
      <div class="sk-line w100 shimmer" style="height: 10px"></div>
      <div class="sk-line w90 shimmer" style="height: 10px"></div>
      <div class="sk-meta">
        <div class="sk-dot shimmer"></div>
        <div class="sk-line w40 shimmer" style="height: 10px"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sk-card {
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.sk-cover {
  aspect-ratio: 16 / 9;
}
.sk-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: var(--space-4);
}
.sk-line {
  height: 16px;
  border-radius: 6px;
}
.w100 {
  width: 100%;
}
.w90 {
  width: 90%;
}
.w80 {
  width: 80%;
}
.w60 {
  width: 60%;
}
.w40 {
  width: 40%;
}
.sk-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
}
.sk-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}
.shimmer {
  position: relative;
  overflow: hidden;
  background: var(--bg-sunken);
}
.shimmer::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(
    90deg,
    transparent,
    rgba(127, 160, 220, 0.14),
    transparent
  );
  animation: sk-shimmer 1.4s infinite;
}
@keyframes sk-shimmer {
  100% {
    transform: translateX(100%);
  }
}
</style>
