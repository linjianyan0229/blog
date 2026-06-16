/**
 * 轻量全局 Toast —— 蓝白风格，独立于 Element Plus，
 * 供前台页面与 axios 拦截器统一调用。
 */
let container = null

function ensureContainer() {
  if (container) return container
  container = document.createElement('div')
  container.className = 'toast-container'
  document.body.appendChild(container)
  injectStyleOnce()
  return container
}

const ICONS = {
  success:
    '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>',
  error:
    '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
  warning:
    '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M1 21h22L12 2zm12-3h-2v-2h2zm0-4h-2v-4h2z"/></svg>',
  info:
    '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M11 9h2V7h-2m1 13c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8m0-18C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m-1 15h2v-6h-2z"/></svg>',
}

function show(message, type = 'info', duration = 2600) {
  const root = ensureContainer()
  const el = document.createElement('div')
  el.className = `toast toast-${type}`
  el.innerHTML = `<span class="toast-icon">${ICONS[type] || ICONS.info}</span><span class="toast-text"></span>`
  el.querySelector('.toast-text').textContent = message
  root.appendChild(el)
  // 入场
  requestAnimationFrame(() => el.classList.add('toast-in'))
  const close = () => {
    el.classList.remove('toast-in')
    el.classList.add('toast-out')
    el.addEventListener('transitionend', () => el.remove(), { once: true })
  }
  setTimeout(close, duration)
  return close
}

export const toast = {
  success: (m, d) => show(m, 'success', d),
  error: (m, d) => show(m, 'error', d),
  warning: (m, d) => show(m, 'warning', d),
  info: (m, d) => show(m, 'info', d),
}

let styleInjected = false
function injectStyleOnce() {
  if (styleInjected) return
  styleInjected = true
  const style = document.createElement('style')
  style.textContent = `
  .toast-container{position:fixed;top:24px;left:50%;transform:translateX(-50%);z-index:9999;
    display:flex;flex-direction:column;gap:10px;align-items:center;pointer-events:none}
  .toast{display:flex;align-items:center;gap:10px;max-width:90vw;padding:11px 18px;border-radius:14px;
    font-size:14px;font-weight:500;color:var(--text-strong,#1e293b);
    background:var(--glass-bg,rgba(255,255,255,.8));backdrop-filter:blur(14px);
    border:1px solid var(--border,#e2e8f0);box-shadow:var(--shadow-lg,0 18px 48px rgba(30,64,175,.14));
    opacity:0;transform:translateY(-16px) scale(.96);
    transition:opacity .3s cubic-bezier(.16,1,.3,1),transform .3s cubic-bezier(.34,1.56,.64,1)}
  .toast-in{opacity:1;transform:translateY(0) scale(1)}
  .toast-out{opacity:0;transform:translateY(-16px) scale(.96)}
  .toast-icon{display:flex;flex:none}
  .toast-success .toast-icon{color:#16a34a}
  .toast-error .toast-icon{color:#dc2626}
  .toast-warning .toast-icon{color:#d97706}
  .toast-info .toast-icon{color:var(--brand,#2563eb)}
  `
  document.head.appendChild(style)
}
