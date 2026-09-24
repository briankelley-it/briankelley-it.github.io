type Props = { columns: string[]; rows: (string | number)[][]; caption?: string }

export function DataTable({ columns, rows, caption }: Props) {
  return (
    <div className="table-wrap" tabIndex={0} role="region" aria-label={caption ?? 'Query result'}>
      <table className="data">
        {caption && <caption>{caption}</caption>}
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c} scope="col">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((cell, j) => {
                const isNull = cell === 'NULL' || cell === ''
                const isNum = typeof cell === 'number' || /^-?[\d,]+(\.\d+)?$/.test(String(cell))
                return (
                  <td key={j} className={isNull ? 'null' : isNum ? 'num' : undefined}>
                    {cell === '' ? 'NULL' : cell}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
