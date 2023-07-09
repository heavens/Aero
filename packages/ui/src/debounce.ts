export default function debounce(fn: () => void, wait: number) {
  let timestamp: number, timeout: number;

  function later() {
    const last = Date.now() - timestamp
    if (last < wait && last >= 0) {
      timeout = setTimeout(later, wait - last)
    } else {
      timeout = null
      fn()
    }
  }

  return function () {
    timestamp = Date.now()
    if (!timeout) timeout = setTimeout(later, wait)
  }
}
