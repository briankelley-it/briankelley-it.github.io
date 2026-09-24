import { useEffect, useState } from 'react'

export type Page = 'home' | 'projects' | 'lab' | 'learning' | 'contact'
export const PAGES: Page[] = ['home', 'projects', 'lab', 'learning', 'contact']

export type Route = { page: Page; sub?: string }

function parse(): Route {
  const [page, sub] = location.hash.replace(/^#\/?/, '').split('/')
  return PAGES.includes(page as Page) ? { page: page as Page, sub } : { page: 'home' }
}

/** Hash routing: #home, #projects, #projects/<id>, #lab, #learning, #contact. */
export function useRoute() {
  const [route, setRoute] = useState<Route>(parse)
  useEffect(() => {
    const onHash = () => setRoute(parse())
    addEventListener('hashchange', onHash)
    return () => removeEventListener('hashchange', onHash)
  }, [])
  return route
}
