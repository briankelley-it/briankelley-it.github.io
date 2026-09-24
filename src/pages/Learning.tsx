import { Award } from 'lucide-react'
import { Icon } from '../components/Icon'
import { certs } from '../data/certs'
import { journey, learningNow } from '../data/journey'
import { useReveal } from '../lib/reveal'

export function Learning() {
  useReveal([])
  return (
    <div className="container">
      <header className="page-head">
        <span className="kicker" data-reveal>Learning</span>
        <h1 data-reveal>How I got here</h1>
        <p className="lead" data-reveal>
          No degree and no shortcuts: I learned by building, one step at a time. Here's the path so far.
        </p>
      </header>

      <ol className="timeline" aria-label="Learning journey">
        {journey.map((s, i) => {
          const isNow = i === journey.length - 1
          return (
            <li key={s.label} className={isNow ? 'is-now' : undefined} data-reveal>
              <span className="kicker t-label">
                {isNow && <span className="status-dot" aria-hidden="true" style={{ marginTop: 5 }} />}
                {s.label}
              </span>
              <div className="t-body">
                <h2 style={{ fontSize: 26 }}>{s.title}</h2>
                <p>{s.body}</p>
              </div>
            </li>
          )
        })}
      </ol>

      <section className="section" aria-labelledby="certs-title" style={{ borderTop: 0 }}>
        <div className="section-head">
          <h2 id="certs-title" data-reveal>Certifications</h2>
        </div>
        {/* PLACEHOLDER certificate names and years live in src/data/certs.ts */}
        <div className="grid-3">
          {certs.map((c) => (
            <div key={c.name} className="card card-hover marks" data-reveal>
              <span className="kicker" style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                <Icon icon={Award} size={16} /> {c.year}
              </span>
              <h3>{c.name}</h3>
              <p className="muted">{c.issuer}</p>
              {c.url && (
                <a href={c.url} target="_blank" rel="noopener noreferrer">
                  View credential<span className="sr-only"> for {c.name} (opens in a new tab)</span>
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="now-title" style={{ paddingBottom: 'var(--section)' }}>
        <div className="section-head">
          <h2 id="now-title" data-reveal>Learning right now</h2>
        </div>
        <ul className="tag-list" data-reveal>
          {learningNow.map((t) => (
            <li key={t} className="tag tag-outline">{t}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}
