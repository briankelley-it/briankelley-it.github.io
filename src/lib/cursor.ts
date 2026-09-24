// Custom cursors drawn as inline SVG data URLs. CSS only: nothing follows the mouse in JS.
export type Theme = 'light' | 'dark'

const enc = (svg: string) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`

function arrow(theme: Theme) {
  const fill = theme === 'dark' ? '#749dc4' : '#5980a6'
  const outline = theme === 'dark' ? '#16191c' : '#ffffff'
  return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><path d="M5 3 L5 22.5 L10 17.6 L13.6 25 L16.8 23.5 L13.3 16.3 L20.2 16.3 Z" fill="${fill}" stroke="${outline}" stroke-width="1.5" stroke-linejoin="round"/></svg>`
}

// Lucide "pointer" icon paths.
const POINTER = [
  'M22 14a8 8 0 0 1-8 8',
  'M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2',
  'M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1',
  'M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10',
  'M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15',
]

function pointer(theme: Theme) {
  const stroke = theme === 'dark' ? '#b5d9fd' : '#416180'
  const bg = theme === 'dark' ? '#16191c' : '#f2f2f3'
  const paths = (s: string, w: number, fill: string) =>
    POINTER.map(
      (d) => `<path d="${d}" fill="${fill}" stroke="${s}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`,
    ).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="-1 -1 26 26">${paths(bg, 5, bg)}${paths(stroke, 1.5, 'none')}</svg>`
}

export function applyCursors(theme: Theme) {
  const root = document.documentElement.style
  root.setProperty('--cursor-default', `${enc(arrow(theme))} 5 3, auto`)
  root.setProperty('--cursor-pointer', `${enc(pointer(theme))} 10 2, pointer`)
}
