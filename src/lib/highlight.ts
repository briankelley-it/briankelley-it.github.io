// A tiny tokenizer for SQL and Python. Good enough for portfolio snippets,
// and far lighter than a full highlighting library.
import type { Lang } from '../data/projects'

export type TokenType = 'comment' | 'string' | 'number' | 'keyword' | 'func' | 'plain'
export type Token = { type: TokenType; text: string }

const SQL_KEYWORDS = new Set(
  `select from where and or not in is null as on join left right inner outer full cross group by order
  having limit offset with union all distinct case when then else end create table view index unique
  primary key references foreign check default insert into values update set delete returning over
  partition rank row_number lag lead asc desc nulls first last between like ilike exists replace
  cascade restrict interval date serial int integer text char varchar real boolean true false
  explain analyze include vacuum conflict do excluded if current_date`
    .split(/\s+/)
    .filter(Boolean),
)

const PY_KEYWORDS = new Set(
  `def return if elif else for while in not and or is None True False import from as with class try
  except finally raise pass continue break lambda yield global nonlocal assert del async await`
    .split(/\s+/)
    .filter(Boolean),
)

// Ordered rules. Each regex is sticky (y) so it matches at the current position only.
const SQL_RULES: [TokenType, RegExp][] = [
  ['comment', /--[^\n]*/y],
  ['comment', /\/\*[\s\S]*?\*\//y],
  ['string', /'(?:[^']|'')*'/y],
  ['string', /"(?:[^"])*"/y],
  ['number', /\b\d+(?:\.\d+)?\b/y],
]

const PY_RULES: [TokenType, RegExp][] = [
  ['comment', /#[^\n]*/y],
  ['string', /[rRbBfF]{0,2}"""[\s\S]*?"""/y],
  ['string', /[rRbBfF]{0,2}'''[\s\S]*?'''/y],
  ['string', /[rRbBfF]{0,2}"(?:\\.|[^"\\\n])*"/y],
  ['string', /[rRbBfF]{0,2}'(?:\\.|[^'\\\n])*'/y],
  ['number', /\b\d+(?:\.\d+)?\b/y],
]

const IDENT = /[A-Za-z_][A-Za-z0-9_]*/y

export function tokenize(code: string, lang: Lang): Token[] {
  const rules = lang === 'sql' ? SQL_RULES : PY_RULES
  const tokens: Token[] = []
  let plain = ''
  let i = 0
  const flush = () => {
    if (plain) tokens.push({ type: 'plain', text: plain })
    plain = ''
  }

  outer: while (i < code.length) {
    for (const [type, rx] of rules) {
      rx.lastIndex = i
      const m = rx.exec(code)
      if (m && m[0].length) {
        // A string prefix like f" must start at a word boundary.
        flush()
        tokens.push({ type, text: m[0] })
        i += m[0].length
        continue outer
      }
    }
    IDENT.lastIndex = i
    const id = IDENT.exec(code)
    if (id) {
      const word = id[0]
      const after = code.slice(i + word.length).match(/^\s*\(/)
      const isKw = lang === 'sql' ? SQL_KEYWORDS.has(word.toLowerCase()) : PY_KEYWORDS.has(word)
      flush()
      tokens.push({ type: isKw ? 'keyword' : after ? 'func' : 'plain', text: word })
      i += word.length
      continue
    }
    plain += code[i]
    i++
  }
  flush()
  return tokens
}

/** Splits tokens into lines, cutting multi-line tokens (block comments, docstrings) apart. */
export function toLines(code: string, lang: Lang): Token[][] {
  const lines: Token[][] = [[]]
  for (const tok of tokenize(code, lang)) {
    const parts = tok.text.split('\n')
    parts.forEach((part, idx) => {
      if (idx > 0) lines.push([])
      if (part) lines[lines.length - 1].push({ type: tok.type, text: part })
    })
  }
  return lines
}
