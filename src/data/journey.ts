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
    label: 'Projects',
    title: 'Real projects',
    body: 'Built the five projects on this site end to end: an analysis report, a database design, an ETL pipeline on a schedule, a query tune-up and a job market tracker.',
  },
  {
    label: 'Now',
    title: 'Looking for my first role',
    body: 'Applying for Junior Data Analyst, SQL Developer and Python Developer roles while I keep building and learning.',
  },
]

export const learningNow = ['dbt fundamentals', 'Airflow basics', 'Docker', 'Power BI']
