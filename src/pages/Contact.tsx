import { Download, Mail } from 'lucide-react'
import { Icon } from '../components/Icon'
import { asset, config } from '../config'
import { contact, site } from '../data/site'
import { useReveal } from '../lib/reveal'

export function Contact() {
  useReveal([])
  const rows = [
    { label: 'Email', value: site.email, href: `mailto:${site.email}` },
    { label: 'GitHub', value: site.githubLabel, href: site.github, external: true },
    { label: 'LinkedIn', value: site.linkedinLabel, href: site.linkedin, external: true },
    { label: 'Roles', value: site.roles },
  ]
  return (
    <div className="container contact">
      <div className="contact-copy">
        <span className="kicker" data-reveal>Contact</span>
        <h1 data-reveal>{contact.title}</h1>
        <p className="lead" data-reveal>{contact.body}</p>
        <div className="btn-row" data-reveal>
          <a className="btn btn-primary marks" href={`mailto:${site.email}`}>
            <Icon icon={Mail} size={16} /> Email me
          </a>
          <a className="btn btn-secondary" href={asset(config.resumeFile)} download>
            <Icon icon={Download} size={16} /> Download resume (PDF)
          </a>
        </div>
      </div>
      <ul className="info-rows" aria-label="Contact details">
        {rows.map((r) => (
          <li key={r.label} data-reveal>
            <span className="kicker">{r.label}</span>
            {r.href ? (
              <a className="value" href={r.href} {...(r.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                {r.value}
                {r.external && <span className="sr-only"> (opens in a new tab)</span>}
              </a>
            ) : (
              <span className="value">{r.value}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
