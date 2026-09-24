// The three skill cards on the home page.
export type SkillGroup = { title: string; level: string; items: string[] }

export const skills: SkillGroup[] = [
  {
    title: 'SQL',
    level: 'Strongest',
    items: [
      'PostgreSQL', 'MySQL', 'SQLite', 'Joins & subqueries', 'CTEs', 'Window functions',
      'Indexing & EXPLAIN', 'Schema design / 3NF', 'Views & constraints',
    ],
  },
  {
    title: 'Python',
    level: 'Daily use',
    items: ['pandas', 'SQLAlchemy', 'requests', 'pytest', 'argparse', 'matplotlib', 'Jupyter', 'Regex'],
  },
  {
    title: 'Tools',
    level: 'Comfortable',
    items: ['Git & GitHub', 'VS Code', 'Linux command line', 'cron', 'CSV / JSON', 'Excel', 'Docker (learning)'],
  },
]
