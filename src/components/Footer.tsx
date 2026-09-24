import { site } from '../data/site'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <p>{site.name} · {site.tagline}</p>
        <p>Built by hand. Code for every project is on GitHub.</p>
      </div>
    </footer>
  )
}
