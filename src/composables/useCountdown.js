import { onUnmounted, ref } from 'vue'

/** 验证码发送倒计时 */
export function useCountdown(seconds = 60) {
  const count = ref(0)
  let timer = null

  function start() {
    count.value = seconds
    timer && clearInterval(timer)
    timer = setInterval(() => {
      count.value--
      if (count.value <= 0) clearInterval(timer)
    }, 1000)
  }

  function stop() {
    timer && clearInterval(timer)
    count.value = 0
  }

  onUnmounted(stop)
  return { count, start, stop }
}
