import { useEffect, useRef, useState } from 'react'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { useRoute } from './lib/route'
import { applyTheme, getInitialTheme, switchTheme, type Theme } from './lib/theme'
import { Contact } from './pages/Contact'
import { Home } from './pages/Home'
import { Learning } from './pages/Learning'
import { Projects } from './pages/Projects'
import { QueryLab } from './pages/QueryLab'

const TITLES = {
  home: 'Brian Kelley · SQL & Python Developer',
  projects: 'Projects · Brian Kelley',
  lab: 'Query lab · Brian Kelley',
  learning: 'Learning · Brian Kelley',
  contact: 'Contact · Brian Kelley',
}

export default function App() {
  const { page, sub } = useRoute()
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const mainRef = useRef<HTMLElement>(null)
  const firstRender = useRef(true)

  // Apply the theme and cursors once on load.
  useEffect(() => applyTheme(theme), []) // eslint-disable-line react-hooks/exhaustive-deps

  // On page change: update the title, scroll to top and move focus to the page.
  useEffect(() => {
    document.title = TITLES[page]
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    if (!(page === 'projects' && sub)) {
      scrollTo({ top: 0 })
      mainRef.current?.focus({ preventScroll: true })
    }
  }, [page]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleTheme = (btn: HTMLElement | null) => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    switchTheme(next, btn, () => setTheme(next))
  }

  return (
    <>
      <a className="skip-link" href="#main" onClick={(e) => { e.preventDefault(); mainRef.current?.focus() }}>
        Skip to content
      </a>
      <Header page={page} theme={theme} onToggleTheme={toggleTheme} />
      <main id="main" ref={mainRef} tabIndex={-1} style={{ outline: 'none' }}>
        {page === 'home' && <Home />}
        {page === 'projects' && <Projects selectedId={sub} />}
        {page === 'lab' && <QueryLab />}
        {page === 'learning' && <Learning />}
        {page === 'contact' && <Contact />}
      </main>
      <Footer />
    </>
  )
}
