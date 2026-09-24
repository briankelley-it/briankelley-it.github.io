// Scroll reveal: fades and slides up anything with [data-reveal] as it enters the viewport.
// Items that arrive in the same batch are staggered by 70ms (max 6 steps).
import { useEffect } from 'react'

let observer: IntersectionObserver | null = null

function getObserver() {
  if (observer) return observer
  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((e) => e.isIntersecting)
      visible.forEach((entry, idx) => {
        const el = entry.target as HTMLElement
        el.style.transitionDelay = `${Math.min(idx, 5) * 70}ms`
        el.classList.add('is-in')
        observer?.unobserve(el)
        // Clear the delay afterwards so hover transitions aren't slowed down.
        window.setTimeout(() => (el.style.transitionDelay = ''), 600 + Math.min(idx, 5) * 70)
      })
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  )
  return observer
}

export function scanReveal() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-in'))
    return
  }
  const obs = getObserver()
  document.querySelectorAll('[data-reveal]:not(.is-in)').forEach((el) => obs.observe(el))
}

/** Re-scan for new [data-reveal] elements whenever any dependency changes. */
export function useReveal(deps: unknown[]) {
  useEffect(() => {
    const id = requestAnimationFrame(scanReveal)
    return () => cancelAnimationFrame(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
