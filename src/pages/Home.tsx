import { ArrowRight } from 'lucide-react'
import { GithubIcon, Icon } from '../components/Icon'
import { ProjectCard } from '../components/ProjectCard'
import { asset } from '../config'
import { projects } from '../data/projects'
import { about, hero, site } from '../data/site'
import { skills } from '../data/skills'
import { useReveal } from '../lib/reveal'

export function Home() {
  useReveal([])
  const featured = projects.filter((p) => p.featured)

  return (
    <>
      <section className="container hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <span className="tag" data-reveal>
            <span className="status-dot" aria-hidden="true" />
            {site.availability}
          </span>
          <h1 id="hero-title" data-reveal>{hero.title}</h1>
          <p className="lead" data-reveal>{hero.intro}</p>
          <div className="btn-row" data-reveal>
            <a className="btn btn-primary marks" href="#projects">
              See my projects <Icon icon={ArrowRight} size={16} />
            </a>
            <a className="btn btn-secondary" href={site.github} target="_blank" rel="noopener noreferrer">
              <GithubIcon size={16} /> View my GitHub
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </div>
        <div className="hero-art" data-reveal>
          <div className="blob-outline" aria-hidden="true" />
          <div className="blob">
            <img src={asset('assets/brian-profile.png')} alt={hero.imageAlt} width={480} height={480} fetchPriority="high" />
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="about-title">
        <div className="container">
          <div className="section-head">
            <span className="kicker" data-reveal>About</span>
            <h2 id="about-title" data-reveal>A little about me</h2>
          </div>
          <div className="grid-3">
            {about.map((a) => (
              <div key={a.title} className="case-col" data-reveal>
                <h3>{a.title}</h3>
                <p>{a.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="skills-title">
        <div className="container">
          <div className="section-head">
            <span className="kicker" data-reveal>Skills</span>
            <h2 id="skills-title" data-reveal>What I work with</h2>
          </div>
          <div className="grid-3">
            {skills.map((g) => (
              <div key={g.title} className="card card-hover marks skill-card" data-reveal>
                <h3>
                  {g.title} <span className="kicker">{g.level}</span>
                </h3>
                <ul className="tag-list" aria-label={`${g.title} skills`}>
                  {g.items.map((s) => (
                    <li key={s} className="tag">{s}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="featured-title">
        <div className="container">
          <div className="section-head section-head-split">
            <div style={{ display: 'grid', gap: 12 }}>
              <span className="kicker" data-reveal>Featured</span>
              <h2 id="featured-title" data-reveal>Recent projects</h2>
            </div>
            <a className="btn btn-ghost" href="#projects" data-reveal>
              All {projects.length === 5 ? 'five' : projects.length} projects <Icon icon={ArrowRight} size={16} />
            </a>
          </div>
          <div className="project-grid">
            {featured.map((p) => (
              <ProjectCard key={p.id} project={p} onView={(id) => (location.hash = `projects/${id}`)} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
