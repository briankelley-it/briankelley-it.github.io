import { useState } from 'react'
import { ProjectCard } from '../components/ProjectCard'
import { ProjectDetail } from '../components/ProjectDetail'
import { projectFilters, projects } from '../data/projects'
import { useReveal } from '../lib/reveal'

export function Projects({ selectedId }: { selectedId?: string }) {
  const [filter, setFilter] = useState('All')
  const selected = projects.find((p) => p.id === selectedId)
  const shown = filter === 'All' ? projects : projects.filter((p) => p.skills.includes(filter))

  useReveal([filter])

  const open = (id: string) => {
    // Keep the URL shareable: #projects/<id>
    history.replaceState(null, '', `#projects/${id}`)
    dispatchEvent(new HashChangeEvent('hashchange'))
  }
  const close = () => {
    history.replaceState(null, '', '#projects')
    dispatchEvent(new HashChangeEvent('hashchange'))
  }

  return (
    <div className="container">
      <header className="page-head">
        <span className="kicker" data-reveal>Projects</span>
        <h1 data-reveal>Things I've built</h1>
        <p className="lead" data-reveal>
          Five personal projects, each written up as a short case study: the problem, my approach, the result, and the actual code.
        </p>
      </header>

      <div className="filters" role="group" aria-label="Filter projects by skill" data-reveal>
        {projectFilters.map((f) => {
          const count = f === 'All' ? projects.length : projects.filter((p) => p.skills.includes(f)).length
          const active = f === filter
          return (
            <button
              key={f}
              type="button"
              className={`btn btn-sm ${active ? 'btn-primary marks' : 'btn-secondary'}`}
              aria-pressed={active}
              onClick={() => setFilter(f)}
            >
              {f} <span className="filter-count">{count}</span>
            </button>
          )
        })}
      </div>

      <p className="sr-only" aria-live="polite">
        Showing {shown.length} {shown.length === 1 ? 'project' : 'projects'}
      </p>

      <div className="project-grid" key={filter}>
        {shown.map((p) => (
          <ProjectCard key={p.id} project={p} selected={p.id === selectedId} onView={open} headingLevel="h2" />
        ))}
      </div>

      {selected && <ProjectDetail project={selected} onClose={close} />}
      <div style={{ height: 'var(--section)' }} />
    </div>
  )
}
