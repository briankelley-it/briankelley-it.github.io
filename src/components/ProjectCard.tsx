import { ArrowRight } from 'lucide-react'
import { asset } from '../config'
import type { Project } from '../data/projects'
import { GithubIcon, Icon } from './Icon'

type Props = { project: Project; selected?: boolean; onView: (id: string) => void; headingLevel?: 'h2' | 'h3' }

export function ProjectCard({ project: p, selected, onView, headingLevel: H = 'h3' }: Props) {
  return (
    <article className={`card card-hover marks project-card${selected ? ' is-selected' : ''}`} data-reveal>
      <div className="shot">
        {p.screenshot ? (
          <img src={asset(p.screenshot)} alt={`Screenshot of ${p.title}`} loading="lazy" width={640} height={400} />
        ) : (
          // PLACEHOLDER: add a screenshot path in src/data/projects.ts
          <span>Screenshot coming soon</span>
        )}
      </div>
      <div className="project-body">
        <div className="card-head">
          <span className="kicker">{p.kicker}</span>
          <span className="muted" style={{ fontSize: 14 }}>Solo project</span>
        </div>
        <H style={{ fontSize: 26 }}>{p.title}</H>
        <p>{p.summary}</p>
        <ul className="tag-list" aria-label="Skills">
          {p.skills.map((s) => (
            <li key={s} className="tag">{s}</li>
          ))}
        </ul>
        <div className="btn-row" style={{ marginTop: 6 }}>
          <button type="button" className="btn btn-primary marks" onClick={() => onView(p.id)} aria-label={`View project: ${p.title}`}>
            View project <Icon icon={ArrowRight} size={16} />
          </button>
          <a className="btn btn-secondary" href={p.repo} target="_blank" rel="noopener noreferrer" aria-label={`View ${p.title} on GitHub (opens in a new tab)`}>
            <GithubIcon size={16} /> View GitHub
          </a>
        </div>
      </div>
    </article>
  )
}
