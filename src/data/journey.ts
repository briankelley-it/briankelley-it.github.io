// Timeline on the Learning page. Add, remove or reorder steps here.
export type JourneyStep = { label: string; title: string; body: string }

export const journey: JourneyStep[] = [
  {
    label: 'Diploma',
    title: 'Finished high school',
    body: 'Graduated with a high school diploma and a habit of taking things apart to see how they work.',
  },
  {
    label: 'Python',
    title: 'Python fundamentals',
    body: 'Learned variables, loops, functions and files by writing small scripts that automated my own chores, then moved on to requests, argparse and pytest.',
  },
  {
    label: 'SQL',
    title: 'SQL and databases',
    body: 'Went deep on SQL: joins, CTEs, window functions and indexes in PostgreSQL, MySQL and SQLite. Learned to read EXPLAIN plans and to design schemas in third normal form.',
  },
  {
    label: 'Pipelines',
    title: 'Data engineering stack',
    body: 'Moved from scripts to real pipelines: landed data in S3, catalogued it with Glue, queried it with Athena, transformed it with dbt and scheduled it with Airflow, all versioned in Git with CI.',
  },
  {
    label: 'Projects',
    title: 'Real projects',
    body: 'Built the projects on this site end to end: an AWS ELT pipeline with dbt and Airflow, an ETL pipeline on a schedule, a database design, a query tune-up, an analysis report and a job market tracker.',
  },
  {
    label: 'Now',
    title: 'Looking for my first role',
    body: 'Applying for Junior Data Engineer roles while I keep building: next up are Trino, Apache Iceberg and data catalogs.',
  },
]

export const learningNow = ['Trino', 'Apache Iceberg', 'DataHub (catalog & lineage)', 'Docker', 'Power BI / Tableau']
