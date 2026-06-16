/** 通用格式化工具 */

const pad = (n) => String(n).padStart(2, '0')

/** 解析后端时间（LocalDateTime 字符串或时间戳）为 Date */
function toDate(input) {
  if (!input) return null
  if (input instanceof Date) return input
  if (typeof input === 'number') return new Date(input)
  // 兼容 "2026-06-16T18:00:00" / "2026-06-16 18:00:00"
  return new Date(String(input).replace(/-/g, '/').replace('T', ' '))
}

/** 格式化为 YYYY-MM-DD */
export function formatDate(input) {
  const d = toDate(input)
  if (!d || isNaN(d)) return ''
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** 格式化为 YYYY-MM-DD HH:mm */
export function formatDateTime(input) {
  const d = toDate(input)
  if (!d || isNaN(d)) return ''
  return `${formatDate(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** 相对时间：刚刚 / x分钟前 / x小时前 / x天前 / 日期 */
export function fromNow(input) {
  const d = toDate(input)
  if (!d || isNaN(d)) return ''
  const diff = (Date.now() - d.getTime()) / 1000
  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)} 天前`
  return formatDate(d)
}

/** 大数字缩写：1200 -> 1.2k */
export function compactNumber(n) {
  n = Number(n) || 0
  if (n < 1000) return String(n)
  if (n < 10000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return (n / 10000).toFixed(1).replace(/\.0$/, '') + 'w'
}

/** 性别文案 */
export function genderText(g) {
  return { 1: '男', 2: '女' }[g] || '保密'
}
