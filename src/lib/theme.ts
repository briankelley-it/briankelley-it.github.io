import { flushSync } from 'react-dom'
import { config } from '../config'
import { applyCursors, type Theme } from './cursor'

export type { Theme }

export function getInitialTheme(): Theme {
  const attr = document.documentElement.getAttribute('data-theme')
  if (attr === 'light' || attr === 'dark') return attr
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/** Writes the theme to <html>, the meta theme-color and the cursors. */
export function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.setAttribute('data-theme', theme)
  root.style.colorScheme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#16191c' : '#f2f2f3')
  applyCursors(theme)
}

export function saveTheme(theme: Theme) {
  try {
    localStorage.setItem(config.themeStorageKey, theme)
  } catch {
    /* storage can be blocked; the theme still applies for this visit */
  }
}

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Switches theme with a circular reveal from the toggle button.
 * `update` must set React state; it runs inside the view transition.
 */
export function switchTheme(next: Theme, origin: HTMLElement | null, update: () => void) {
  const commit = () => {
    flushSync(update)
    applyTheme(next)
    saveTheme(next)
  }

  if (reduced()) return commit()

  const doc = document as Document & {
    startViewTransition?: (cb: () => void) => { ready: Promise<void> }
  }

  if (!doc.startViewTransition) {
    // Fallback: a short colour transition.
    const root = document.documentElement
    root.classList.add('theme-fade')
    commit()
    window.setTimeout(() => root.classList.remove('theme-fade'), 400)
    return
  }

  const rect = origin?.getBoundingClientRect()
  const x = rect ? rect.left + rect.width / 2 : innerWidth - 40
  const y = rect ? rect.top + rect.height / 2 : 32
  const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))

  const vt = doc.startViewTransition(commit)
  vt.ready
    .then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 600, easing: 'cubic-bezier(.4,0,.2,1)', pseudoElement: '::view-transition-new(root)' },
      )
    })
    .catch(() => {})
}
