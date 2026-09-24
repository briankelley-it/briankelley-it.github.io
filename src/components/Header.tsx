import { useEffect, useRef, useState } from 'react'
import { Download, Menu, Moon, Sun, X } from 'lucide-react'
import { asset, config } from '../config'
import { site } from '../data/site'
import type { Page } from '../lib/route'
import type { Theme } from '../lib/theme'
import { Icon } from './Icon'

const LINKS: { page: Page; label: string }[] = [
  { page: 'home', label: 'Home' },
  { page: 'projects', label: 'Projects' },
  { page: 'lab', label: 'Query lab' },
  { page: 'learning', label: 'Learning' },
  { page: 'contact', label: 'Contact' },
]

type Props = { page: Page; theme: Theme; onToggleTheme: (btn: HTMLElement | null) => void }

export function Header({ page, theme, onToggleTheme }: Props) {
  const [open, setOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const menuBtnRef = useRef<HTMLButtonElement>(null)

  // Close the mobile menu whenever the page changes.
  useEffect(() => setOpen(false), [page])

  // Close on Escape and return focus to the menu button.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        menuBtnRef.current?.focus()
      }
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [open])

  const next = theme === 'dark' ? 'light' : 'dark'
  const resume = asset(config.resumeFile)

  return (
    <header className="site-header">
      <div className="container header-inner">
        <a className="brand" href="#home" aria-label={`${site.name}, home`}>
          <span className="monogram" aria-hidden="true">{site.initials}</span>
          <span className="brand-name">{site.name}</span>
        </a>

        <nav className="nav" aria-label="Main">
          <ul className="nav-links">
            {LINKS.map((l) => (
              <li key={l.page}>
                <a className="nav-link" href={`#${l.page}`} aria-current={page === l.page ? 'page' : undefined}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="nav-tools">
            <button
              ref={toggleRef}
              type="button"
              className="btn btn-secondary btn-icon"
              aria-label={`Switch to ${next} theme`}
              onClick={() => onToggleTheme(toggleRef.current)}
            >
              <Icon icon={theme === 'dark' ? Sun : Moon} />
            </button>
            <a className="btn btn-primary btn-sm marks resume-btn" href={resume} download>
              <Icon icon={Download} size={16} />
              Resume
            </a>
            <button
              ref={menuBtnRef}
              type="button"
              className="btn btn-secondary btn-icon menu-btn"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((o) => !o)}
            >
              <Icon icon={open ? X : Menu} />
            </button>
          </div>
        </nav>
      </div>

      <div id="mobile-menu" className={`mobile-menu${open ? ' open' : ''}`}>
        <nav aria-label="Mobile">
          <ul>
            {LINKS.map((l) => (
              <li key={l.page}>
                <a href={`#${l.page}`} aria-current={page === l.page ? 'page' : undefined} onClick={() => setOpen(false)}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <a className="btn btn-primary marks" href={resume} download>
            <Icon icon={Download} size={18} />
            Download resume
          </a>
        </nav>
      </div>
    </header>
  )
}
