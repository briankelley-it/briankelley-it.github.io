// The three skill cards on the home page.
export type SkillGroup = { title: string; level: string; items: string[] }

export const skills: SkillGroup[] = [
  {
    title: 'SQL & modeling',
    level: 'Strongest',
    items: [
      'PostgreSQL', 'MySQL', 'SQLite', 'Athena (Presto SQL)', 'CTEs', 'Window functions',
      'Indexing & EXPLAIN', 'Dimensional modeling', 'Schema design / 3NF', 'Views & constraints',
    ],
  },
  {
    title: 'Python & pipelines',
    level: 'Daily use',
    items: [
      'Python', 'pandas', 'ETL / ELT', 'Airflow', 'dbt Core', 'boto3', 'requests', 'SQLAlchemy', 'pytest', 'Parquet / CSV / JSON',
    ],
  },
  {
    title: 'Cloud & tooling',
    level: 'Hands-on',
    items: [
      'AWS S3', 'AWS Glue', 'AWS Athena', 'Git & GitHub', 'GitHub Actions CI / CD', 'Linux command line', 'cron', 'Docker (learning)',
    ],
  },
]
