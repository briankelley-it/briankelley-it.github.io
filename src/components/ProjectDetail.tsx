import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { asset } from '../config'
import type { Project } from '../data/projects'
import { useReveal } from '../lib/reveal'
import { CodeViewer } from './CodeViewer'
import { DataTable } from './DataTable'
import { Icon } from './Icon'

type Props = { project: Project; onClose: () => void }

export function ProjectDetail({ project: p, onClose }: Props) {
  const tabs = [
    { id: 'case', label: 'Case study' },
    { id: 'process', label: 'Process' },
    ...p.files.map((f) => ({ id: `file:${f.name}`, label: f.name })),
    ...(p.results ? [{ id: 'results', label: 'Results' }] : []),
  ]
  const [tab, setTab] = useState('case')
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const ref = useRef<HTMLElement>(null)

  // New project: reset tab and scroll the panel into view.
  useEffect(() => {
    setTab('case')
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    requestAnimationFrame(() => ref.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }))
  }, [p.id])

  useReveal([p.id, tab])

  // Arrow keys move between tabs (WAI-ARIA tabs pattern).
  const onKeyDown = (e: React.KeyboardEvent, idx: number) => {
    let n = idx
    if (e.key === 'ArrowRight') n = (idx + 1) % tabs.length
    else if (e.key === 'ArrowLeft') n = (idx - 1 + tabs.length) % tabs.length
    else if (e.key === 'Home') n = 0
    else if (e.key === 'End') n = tabs.length - 1
    else return
    e.preventDefault()
    setTab(tabs[n].id)
    tabRefs.current[n]?.focus()
  }

  const file = tab.startsWith('file:') ? p.files.find((f) => `file:${f.name}` === tab) : undefined

  return (
    <section ref={ref} className="card marks detail" aria-labelledby="detail-title" data-reveal>
      <div className="detail-head">
        <div style={{ display: 'grid', gap: 6 }}>
          <span className="kicker">{p.kicker} · Solo project</span>
          <h2 id="detail-title">{p.title}</h2>
        </div>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          <Icon icon={X} size={16} /> Close
        </button>
      </div>

      <div className="tabs" role="tablist" aria-label={`${p.title} sections`}>
        {tabs.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => { tabRefs.current[i] = el }}
            type="button"
            role="tab"
            id={`tab-${p.id}-${i}`}
            className="tab"
            aria-selected={tab === t.id}
            aria-controls={`panel-${p.id}`}
            tabIndex={tab === t.id ? 0 : -1}
            onClick={() => setTab(t.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div
        className="tabpanel"
        role="tabpanel"
        id={`panel-${p.id}`}
        aria-labelledby={`tab-${p.id}-${tabs.findIndex((t) => t.id === tab)}`}
        key={tab}
      >
        {tab === 'case' && (
          <>
            {/* PLACEHOLDER metrics live in src/data/projects.ts */}
            <div className="metrics" data-reveal>
              {p.metrics.map((m) => (
                <div className="metric" key={m.label}>
                  <span className="metric-value">{m.value}</span>
                  <span className="metric-label">{m.label}</span>
                </div>
              ))}
            </div>
            <div className="case-cols">
              <div className="case-col" data-reveal>
                <span className="kicker">01 · Problem</span>
                <p>{p.problem}</p>
              </div>
              <div className="case-col" data-reveal>
                <span className="kicker">02 · Approach</span>
                <ol>{p.approach.map((s) => <li key={s}>{s}</li>)}</ol>
              </div>
              <div className="case-col" data-reveal>
                <span className="kicker">03 · Solution &amp; result</span>
                <p>{p.solution}</p>
              </div>
            </div>
            <hr className="hr" />
            <div className="case-cols">
              <div className="case-col" data-reveal>
                <h3>My role</h3>
                <p>{p.role}</p>
              </div>
              <div className="case-col" data-reveal>
                <h3>What I learned</h3>
                <p>{p.learned}</p>
              </div>
            </div>
          </>
        )}

        {tab === 'process' && (
          <div className="process-grid">
            {p.process.map((img) => (
              <figure key={img.caption} data-reveal>
                {img.src ? (
                  <img src={asset(img.src)} alt={img.alt} loading="lazy" width={800} height={600} />
                ) : (
                  // PLACEHOLDER: add sketches, ER diagrams or screenshots in src/data/projects.ts
                  <div className="empty-slot" role="img" aria-label={`Image coming soon: ${img.alt}`}>
                    Image coming soon
                  </div>
                )}
                <figcaption>{img.caption}</figcaption>
              </figure>
            ))}
          </div>
        )}

        {file && (
          <div data-reveal>
            <CodeViewer code={file.code} lang={file.lang} filename={file.name} />
          </div>
        )}

        {tab === 'results' && p.results && (
          <div data-reveal>
            <DataTable columns={p.results.columns} rows={p.results.rows} caption={p.results.caption} />
          </div>
        )}
      </div>
    </section>
  )
}
