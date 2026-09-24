import { useMemo } from 'react'
import { config } from '../config'
import type { Lang } from '../data/projects'
import { toLines } from '../lib/highlight'

type Props = { code: string; lang: Lang; filename: string; action?: React.ReactNode }

const LANG_LABEL: Record<Lang, string> = { sql: 'SQL', python: 'Python' }

export function CodeViewer({ code, lang, filename, action }: Props) {
  const lines = useMemo(() => toLines(code, lang), [code, lang])
  return (
    <div className={`code${config.codeTheme === 'light' ? ' code-light' : ''}`}>
      <div className="code-bar">
        <span>{filename}</span>
        {action ?? (
          <span className="code-meta">
            {lines.length} lines · {LANG_LABEL[lang]}
          </span>
        )}
      </div>
      <div className="code-scroll" tabIndex={0} role="region" aria-label={`${filename} source code`}>
        <pre>
          <code>
            {lines.map((line, i) => (
              <span className="line" key={i}>
                {line.map((t, j) =>
                  t.type === 'plain' ? t.text : <span key={j} className={`tok-${t.type}`}>{t.text}</span>,
                )}
                {'\n'}
              </span>
            ))}
          </code>
        </pre>
      </div>
    </div>
  )
}
