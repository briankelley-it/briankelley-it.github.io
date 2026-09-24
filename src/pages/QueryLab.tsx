import { useEffect, useRef, useState } from 'react'
import { Play } from 'lucide-react'
import { CodeViewer } from '../components/CodeViewer'
import { DataTable } from '../components/DataTable'
import { Icon } from '../components/Icon'
import { labIntro, labQueries, schema } from '../data/queries'
import { useReveal } from '../lib/reveal'

type State = { status: 'idle' } | { status: 'running' } | { status: 'done'; ms: number }

export function QueryLab() {
  const [activeId, setActiveId] = useState(labQueries[0].id)
  const [state, setState] = useState<State>({ status: 'idle' })
  const timer = useRef<number>(0)
  const q = labQueries.find((x) => x.id === activeId)!

  useReveal([state.status === 'done' ? `${activeId}-done` : activeId])
  useEffect(() => () => clearTimeout(timer.current), [])

  const pick = (id: string) => {
    clearTimeout(timer.current)
    setActiveId(id)
    setState({ status: 'idle' })
  }

  const run = () => {
    clearTimeout(timer.current)
    setState({ status: 'running' })
    timer.current = window.setTimeout(() => {
      setState({ status: 'done', ms: 6 + Math.floor(Math.random() * 31) })
    }, 420)
  }

  return (
    <div className="container">
      <header className="page-head">
        <span className="kicker" data-reveal>Query lab</span>
        <h1 data-reveal>Run a few of my queries</h1>
        <p className="lead" data-reveal>{labIntro}</p>
      </header>

      <div className="lab" style={{ paddingBottom: 'var(--section)' }}>
        <aside className="lab-side" aria-label="Questions and schema">
          <div style={{ display: 'grid', gap: 12 }} data-reveal>
            <h2 style={{ fontSize: 24 }}>Pick a question</h2>
            <ul className="question-list">
              {labQueries.map((x) => (
                <li key={x.id}>
                  <button type="button" className="question" aria-pressed={x.id === activeId} onClick={() => pick(x.id)}>
                    {x.question}
                    <small>{x.concepts}</small>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div style={{ display: 'grid', gap: 12 }} data-reveal>
            <h2 style={{ fontSize: 24 }}>Schema</h2>
            <ul className="schema">
              {schema.map((s) => <li key={s}>{s}</li>)}
            </ul>
          </div>
        </aside>

        <div className="lab-main">
          <div data-reveal>
            <CodeViewer
              code={q.sql}
              lang="sql"
              filename="store.db · query.sql"
              action={
                <button type="button" className="btn btn-primary btn-sm marks run-btn" onClick={run} disabled={state.status === 'running'}>
                  <Icon icon={Play} size={14} /> Run
                </button>
              }
            />
          </div>

          <section aria-labelledby="result-title" aria-live="polite" aria-busy={state.status === 'running'}>
            <h2 id="result-title" style={{ fontSize: 24, marginBottom: 12 }}>Result</h2>
            {state.status === 'idle' && <div className="result-empty">Press Run to execute the query</div>}
            {state.status === 'running' && (
              <div className="result-empty">
                <span className="spinner" aria-hidden="true" />
                Running…
              </div>
            )}
            {state.status === 'done' && (
              <div data-reveal key={`${activeId}-${state.ms}`}>
                <p className="result-meta">
                  {q.rows.length} rows · {state.ms} ms
                </p>
                <DataTable columns={q.columns} rows={q.rows} caption={q.question} />
                <p className="why">
                  <strong>Why it works:</strong> {q.why}
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
