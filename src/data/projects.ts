// The five projects. Each one is a short case study plus the real code.
//
// PLACEHOLDERS to replace before you share the site:
//   - repo:        the GitHub URL of each project's repository
//   - metrics:     the numbers in each case study (use your own measured results)
//   - screenshot / process images: drop files in public/assets/projects/ and set the paths
//   - results:     sample output tables (copy real output from your runs)

export type Lang = 'sql' | 'python'
export type CodeFile = { name: string; lang: Lang; code: string }
export type Metric = { value: string; label: string }
export type ProcessImage = { src?: string; alt: string; caption: string }
export type ResultTable = { caption: string; columns: string[]; rows: (string | number)[][] }

export type Project = {
  id: string
  title: string
  kicker: string
  summary: string
  skills: string[]
  repo: string
  featured: boolean
  /** Optional path in /public, e.g. 'assets/projects/retail.png'. Empty shows a blank slot. */
  screenshot?: string
  metrics: Metric[]
  problem: string
  approach: string[]
  solution: string
  role: string
  learned: string
  process: ProcessImage[]
  files: CodeFile[]
  results?: ResultTable
}

/** Filter buttons on the Projects page, in display order. */
export const projectFilters = ['All', 'SQL', 'Python', 'dbt', 'Airflow', 'AWS', 'ETL', 'pandas', 'Schema design', 'Testing']

export const projects: Project[] = [
  {
    id: 'taxi-elt-aws',
    title: 'NYC Taxi ELT on AWS',
    kicker: 'Data engineering',
    summary: 'Airflow lands monthly trip data in S3, Glue catalogs it, and dbt models it on Athena into tested, BI-ready tables.',
    skills: ['Python', 'SQL', 'dbt', 'Airflow', 'AWS', 'ETL', 'Testing'],
    repo: 'https://github.com/briankelley-it/nyc-taxi-elt', // PLACEHOLDER repo URL
    featured: true,
    // PLACEHOLDER metrics: replace with numbers from your own runs
    metrics: [
      { value: '12', label: 'monthly files loaded' },
      { value: '3', label: 'dbt layers: staging, intermediate, marts' },
      { value: '15', label: 'dbt tests on every run' },
    ],
    problem:
      'NYC publishes taxi trips as one large Parquet file per month. I wanted a small lakehouse-style pipeline that loads new months automatically and gives BI tools clean daily tables, without re-processing everything each time.',
    approach: [
      'Airflow DAG runs monthly: downloads the Parquet file and uploads it to S3 under a raw/ prefix partitioned by year and month.',
      'A Glue crawler updates the Data Catalog so the new partition is queryable in Athena right away.',
      'dbt Core (dbt-athena) builds staging models that clean types and drop bad rows, then an incremental fact table so only the new month is processed.',
      'dbt tests (not_null, unique, accepted_values, relationships) run after every build, and GitHub Actions runs dbt build on each pull request.',
    ],
    solution:
      'A repeatable ELT pipeline: raw files in S3, a catalog in Glue, SQL models in dbt, orchestration in Airflow, and CI on every change. The marts are small, documented tables that Tableau or Power BI can read straight from Athena.',
    role: 'Solo project. I designed the S3 layout and the dbt models, wrote the Airflow DAG and the CI workflow, and documented how to run it.',
    learned:
      'Partitioning and incremental models are what keep lake queries cheap. I also learned to treat data like code: every model is versioned, tested and reviewed before it reaches the people who use it.',
    process: [
      { alt: 'Architecture diagram: Airflow to S3, Glue catalog, Athena and dbt', caption: 'Architecture: Airflow → S3 → Glue → Athena → dbt → BI.' },
      { alt: 'dbt lineage graph from sources to marts', caption: 'dbt lineage from raw sources to the daily mart.' },
    ],
    files: [
      {
        name: 'dags/taxi_elt.py',
        lang: 'python',
        code: `"""Monthly NYC taxi ELT: download -> S3 raw -> Glue crawler -> dbt build."""
from datetime import datetime

import boto3
import requests
from airflow import DAG
from airflow.operators.bash import BashOperator
from airflow.operators.python import PythonOperator
from airflow.providers.amazon.aws.operators.glue_crawler import GlueCrawlerOperator

BUCKET = "bk-data-lake"
SOURCE = "https://d37ci6vzurychx.cloudfront.net/trip-data/yellow_tripdata_{ym}.parquet"


def land_raw(ds: str, **_) -> str:
    """Download one month and upload it to s3://bucket/raw/taxi/year=/month=/."""
    ym = ds[:7]  # the logical date's YYYY-MM
    year, month = ym.split("-")
    resp = requests.get(SOURCE.format(ym=ym), timeout=120)
    resp.raise_for_status()
    key = f"raw/taxi/year={year}/month={month}/trips.parquet"
    boto3.client("s3").put_object(Bucket=BUCKET, Key=key, Body=resp.content)
    return key  # same key on rerun, so the load is idempotent


with DAG(
    dag_id="taxi_elt",
    start_date=datetime(2024, 1, 1),
    schedule="@monthly",
    catchup=True,
    max_active_runs=1,
    default_args={"retries": 2},
    tags=["elt", "aws", "dbt"],
) as dag:
    land = PythonOperator(task_id="land_raw", python_callable=land_raw)

    crawl = GlueCrawlerOperator(
        task_id="glue_crawl",
        config={"Name": "taxi_raw_crawler"},
        wait_for_completion=True,
    )

    dbt_build = BashOperator(
        task_id="dbt_build",
        bash_command=(
            "cd /opt/dbt/taxi && "
            "dbt build --select +fct_trips_daily --vars '{month: {{ ds[:7] }}}'"
        ),
    )

    land >> crawl >> dbt_build`,
      },
      {
        name: 'models/marts/fct_trips_daily.sql',
        lang: 'sql',
        code: `-- Daily trip facts, built incrementally so each run only adds the new month.
{{ config(
    materialized = 'incremental',
    incremental_strategy = 'insert_overwrite',
    partitioned_by = ['trip_month'],
    table_type = 'iceberg' if var('use_iceberg', false) else 'hive'
) }}

WITH trips AS (
    SELECT *
    FROM {{ ref('stg_taxi__trips') }}
    {% if is_incremental() %}
    WHERE trip_month = '{{ var("month") }}'
    {% endif %}
)

SELECT
    CAST(pickup_at AS DATE)                AS trip_date,
    pickup_zone_id,
    COUNT(*)                               AS trips,
    ROUND(SUM(total_amount), 2)            AS revenue,
    ROUND(AVG(trip_distance_miles), 2)     AS avg_distance_miles,
    ROUND(AVG(date_diff('minute', pickup_at, dropoff_at)), 1) AS avg_minutes,
    trip_month
FROM trips
GROUP BY 1, 2, trip_month`,
      },
      {
        name: 'models/staging/stg_taxi__trips.sql',
        lang: 'sql',
        code: `-- Clean and type the raw Parquet data. One row per valid trip.
WITH source AS (
    SELECT * FROM {{ source('raw', 'taxi') }}
)

SELECT
    CAST(tpep_pickup_datetime AS TIMESTAMP)   AS pickup_at,
    CAST(tpep_dropoff_datetime AS TIMESTAMP)  AS dropoff_at,
    CAST(pulocationid AS INTEGER)             AS pickup_zone_id,
    CAST(dolocationid AS INTEGER)             AS dropoff_zone_id,
    CAST(trip_distance AS DOUBLE)             AS trip_distance_miles,
    CAST(total_amount AS DECIMAL(10, 2))      AS total_amount,
    year || '-' || month                      AS trip_month
FROM source
WHERE tpep_dropoff_datetime > tpep_pickup_datetime   -- drop impossible trips
  AND trip_distance BETWEEN 0.1 AND 200
  AND total_amount >= 0`,
      },
    ],
    // PLACEHOLDER sample output
    results: {
      caption: 'Sample rows from fct_trips_daily in Athena',
      columns: ['trip_date', 'pickup_zone_id', 'trips', 'revenue', 'avg_distance_miles', 'avg_minutes'],
      rows: [
        ['2024-03-01', 132, 5412, '412,380.55', 16.84, 38.2],
        ['2024-03-01', 161, 4988, '118,204.10', 2.11, 14.6],
        ['2024-03-01', 237, 4731, '96,540.25', 1.74, 12.9],
      ],
    },
  },
  {
    id: 'retail-sales',
    title: 'Retail Sales Analysis',
    kicker: 'Data analysis',
    summary: 'Month-over-month revenue growth with a CTE and LAG(), turned into a one-page pandas report.',
    skills: ['SQL', 'Python', 'pandas'],
    repo: 'https://github.com/briankelley-it/retail-sales-analysis', // PLACEHOLDER repo URL
    featured: false,
    // PLACEHOLDER metrics: replace with your own numbers
    metrics: [
      { value: '24', label: 'months of orders analysed' },
      { value: '1', label: 'query powers the whole report' },
      { value: '<2s', label: 'to rebuild the report' },
    ],
    problem:
      'A small online store had two years of orders in a PostgreSQL table but no easy way to see whether revenue was growing month to month, or which months were dragging the numbers down.',
    approach: [
      'Rolled orders up to one row per month with date_trunc so every month is comparable.',
      "Used a CTE to keep the monthly totals readable, then LAG() to pull the previous month's revenue onto the same row.",
      'Calculated growth as a percentage with NULLIF so the first month does not divide by zero.',
      'Loaded the result into pandas with SQLAlchemy and drew a bar chart of growth with matplotlib.',
    ],
    solution:
      'One SQL query returns revenue and growth for every month, and a short Python script turns it into a PNG chart and a CSV the store owner can open in Excel. Rerunning it next month is a single command.',
    role: 'Solo project. I wrote the SQL, the Python report script and the README, and generated the sample data.',
    learned:
      'Window functions like LAG() replace a lot of self-joins. I also learned to push the heavy lifting into SQL and keep pandas for the last mile of formatting and charts.',
    process: [
      { alt: 'Sketch of the monthly revenue report layout', caption: 'First sketch of the report and the numbers it needed.' },
      { alt: 'Screenshot of the growth bar chart', caption: 'The finished month-over-month growth chart.' },
    ],
    files: [
      {
        name: 'monthly_growth.sql',
        lang: 'sql',
        code: `-- Month-over-month revenue growth for the store.
-- One row per month: revenue, previous month, and % change.
WITH monthly AS (
    SELECT
        date_trunc('month', ordered_at)::date AS month,
        SUM(total)                            AS revenue,
        COUNT(*)                              AS orders
    FROM orders
    WHERE status = 'completed'
    GROUP BY 1
)
SELECT
    month,
    revenue,
    orders,
    LAG(revenue) OVER (ORDER BY month) AS prev_revenue,
    ROUND(
        100.0 * (revenue - LAG(revenue) OVER (ORDER BY month))
        / NULLIF(LAG(revenue) OVER (ORDER BY month), 0),
        1
    ) AS growth_pct
FROM monthly
ORDER BY month;`,
      },
      {
        name: 'report.py',
        lang: 'python',
        code: `"""Build the monthly growth report: a CSV and a bar chart."""
import argparse
from pathlib import Path

import matplotlib.pyplot as plt
import pandas as pd
from sqlalchemy import create_engine, text

SQL_FILE = Path(__file__).with_name("monthly_growth.sql")


def load_growth(db_url: str) -> pd.DataFrame:
    engine = create_engine(db_url)
    with engine.connect() as conn:
        df = pd.read_sql(text(SQL_FILE.read_text()), conn, parse_dates=["month"])
    return df


def plot_growth(df: pd.DataFrame, out: Path) -> None:
    colors = ["#5980a6" if g >= 0 else "#a65959" for g in df["growth_pct"].fillna(0)]
    fig, ax = plt.subplots(figsize=(10, 4))
    ax.bar(df["month"].dt.strftime("%b %y"), df["growth_pct"].fillna(0), color=colors)
    ax.axhline(0, color="#1d1f20", linewidth=0.8)
    ax.set_ylabel("Growth vs previous month (%)")
    ax.set_title("Month-over-month revenue growth")
    plt.xticks(rotation=45, ha="right")
    fig.tight_layout()
    fig.savefig(out, dpi=150)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--db", default="postgresql://localhost/store")
    parser.add_argument("--out", default="report", type=Path)
    args = parser.parse_args()

    args.out.mkdir(exist_ok=True)
    df = load_growth(args.db)
    df.to_csv(args.out / "monthly_growth.csv", index=False)
    plot_growth(df, args.out / "monthly_growth.png")

    best = df.loc[df["growth_pct"].idxmax()]
    print(f"{len(df)} months. Best month: {best.month:%B %Y} ({best.growth_pct:+.1f}%)")


if __name__ == "__main__":
    main()`,
      },
    ],
    // PLACEHOLDER sample output
    results: {
      caption: 'Sample output from monthly_growth.sql (first six months)',
      columns: ['month', 'revenue', 'orders', 'prev_revenue', 'growth_pct'],
      rows: [
        ['2024-01-01', '18,420.50', 412, '', ''],
        ['2024-02-01', '19,105.00', 431, '18,420.50', '3.7'],
        ['2024-03-01', '21,880.75', 488, '19,105.00', '14.5'],
        ['2024-04-01', '20,940.20', 470, '21,880.75', '-4.3'],
        ['2024-05-01', '23,310.00', 519, '20,940.20', '11.3'],
        ['2024-06-01', '24,002.40', 533, '23,310.00', '3.0'],
      ],
    },
  },

  {
    id: 'library-db',
    title: 'Library Database Design',
    kicker: 'Database design',
    summary: 'A 3NF schema for a small library, with keys, CHECK constraints, a partial index and an overdue-loans view.',
    skills: ['SQL', 'Schema design'],
    repo: 'https://github.com/briankelley-it/library-database', // PLACEHOLDER repo URL
    featured: false,
    // PLACEHOLDER metrics
    metrics: [
      { value: '6', label: 'tables in third normal form' },
      { value: '9', label: 'constraints guarding the data' },
      { value: '1', label: 'view the front desk uses daily' },
    ],
    problem:
      'A community library tracked books and loans in one big spreadsheet. The same author was typed five different ways, copies went missing from the list, and nobody could quickly see which loans were overdue.',
    approach: [
      'Listed every fact the spreadsheet stored and split them into entities: authors, books, copies, members and loans.',
      'Normalised to third normal form so each fact lives in exactly one place, with a join table for books with several authors.',
      'Added primary keys, foreign keys, UNIQUE and CHECK constraints so bad data is rejected at the door.',
      'Created a partial index on open loans only, and a view that lists overdue loans with the member and title.',
    ],
    solution:
      'A PostgreSQL schema the library can trust: duplicates are impossible, a copy can only be on one open loan, and staff run one SELECT against the overdue view each morning.',
    role: 'Solo project. I designed the ER diagram, wrote the DDL and the view, and tested the constraints with bad inserts.',
    learned:
      'Constraints are documentation that the database enforces. A partial index is a neat way to keep an index small when you only ever query a slice of the table.',
    process: [
      { alt: 'Entity relationship diagram of the library schema', caption: 'ER diagram before writing any SQL.' },
      { alt: 'Screenshot of a rejected insert that breaks a CHECK constraint', caption: 'Testing that bad data is rejected.' },
    ],
    files: [
      {
        name: 'schema.sql',
        lang: 'sql',
        code: `-- Library schema, third normal form (PostgreSQL).
CREATE TABLE authors (
    id         SERIAL PRIMARY KEY,
    full_name  TEXT NOT NULL,
    born_year  INT CHECK (born_year BETWEEN 1000 AND 2100),
    UNIQUE (full_name, born_year)
);

CREATE TABLE books (
    id         SERIAL PRIMARY KEY,
    isbn       CHAR(13) NOT NULL UNIQUE CHECK (isbn ~ '^[0-9]{13}$'),
    title      TEXT NOT NULL,
    published  INT CHECK (published BETWEEN 1450 AND 2100)
);

-- A book can have several authors, and an author several books.
CREATE TABLE book_authors (
    book_id    INT REFERENCES books(id) ON DELETE CASCADE,
    author_id  INT REFERENCES authors(id) ON DELETE RESTRICT,
    PRIMARY KEY (book_id, author_id)
);

-- Physical copies on the shelf.
CREATE TABLE copies (
    id         SERIAL PRIMARY KEY,
    book_id    INT NOT NULL REFERENCES books(id),
    barcode    TEXT NOT NULL UNIQUE,
    condition  TEXT NOT NULL DEFAULT 'good'
               CHECK (condition IN ('new', 'good', 'worn', 'lost'))
);

CREATE TABLE members (
    id         SERIAL PRIMARY KEY,
    full_name  TEXT NOT NULL,
    email      TEXT NOT NULL UNIQUE,
    joined_on  DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE loans (
    id           SERIAL PRIMARY KEY,
    copy_id      INT NOT NULL REFERENCES copies(id),
    member_id    INT NOT NULL REFERENCES members(id),
    loaned_on    DATE NOT NULL DEFAULT CURRENT_DATE,
    due_on       DATE NOT NULL,
    returned_on  DATE,
    CHECK (due_on > loaned_on),
    CHECK (returned_on IS NULL OR returned_on >= loaned_on)
);

-- Only open loans are ever searched, so index just those rows.
-- UNIQUE also means a copy can't be on two open loans at once.
CREATE UNIQUE INDEX loans_open_copy_idx
    ON loans (copy_id)
    WHERE returned_on IS NULL;`,
      },
      {
        name: 'overdue_view.sql',
        lang: 'sql',
        code: `-- Everything the front desk needs to chase overdue books.
CREATE OR REPLACE VIEW overdue_loans AS
SELECT
    l.id                         AS loan_id,
    m.full_name                  AS member,
    m.email,
    b.title,
    c.barcode,
    l.due_on,
    CURRENT_DATE - l.due_on      AS days_overdue
FROM loans   l
JOIN members m ON m.id = l.member_id
JOIN copies  c ON c.id = l.copy_id
JOIN books   b ON b.id = c.book_id
WHERE l.returned_on IS NULL
  AND l.due_on < CURRENT_DATE;

-- Morning check, most overdue first:
SELECT member, email, title, days_overdue
FROM overdue_loans
ORDER BY days_overdue DESC;`,
      },
    ],
    results: {
      caption: 'Sample output from the overdue_loans view',
      columns: ['member', 'email', 'title', 'days_overdue'],
      rows: [
        ['Dana Ruiz', 'dana@example.com', 'The Pragmatic Programmer', 12],
        ['Sam Okafor', 'sam@example.com', 'Designing Data-Intensive Applications', 6],
        ['Lee Park', 'lee@example.com', 'SQL Antipatterns', 2],
      ],
    },
  },

  {
    id: 'weather-etl',
    title: 'Weather Data ETL Pipeline',
    kicker: 'Data engineering',
    summary: 'Pulls hourly weather from the Open-Meteo API, cleans it, and upserts it into SQLite on a cron schedule.',
    skills: ['Python', 'ETL', 'SQL', 'Testing'],
    repo: 'https://github.com/briankelley-it/weather-etl', // PLACEHOLDER repo URL
    featured: true,
    // PLACEHOLDER metrics
    metrics: [
      { value: '24', label: 'runs a day on cron' },
      { value: '0', label: 'duplicate rows after reruns' },
      { value: '6', label: 'pytest tests on the transform' },
    ],
    problem:
      'I wanted a local history of hourly weather for a few cities to practise analysis, but the free API only returns a short window. Anything I did not save was gone.',
    approach: [
      'Extract: call the Open-Meteo forecast API with requests, with a timeout and a check on the HTTP status.',
      'Transform: flatten the parallel arrays in the JSON into one row per city per hour and drop incomplete rows.',
      'Load: upsert into SQLite with INSERT ... ON CONFLICT so reruns update rows instead of duplicating them.',
      'Schedule it hourly with cron and cover the transform step with pytest.',
    ],
    solution:
      'A small, boring, reliable pipeline. It has been running on a schedule, the table only ever holds one row per city and hour, and tests catch it if the API shape changes.',
    role: 'Solo project. I wrote the pipeline, the tests and the cron setup, and documented how to run it.',
    learned:
      'Idempotent loads matter: being able to rerun a job safely makes everything calmer. Keeping the transform a pure function made it easy to test without calling the API.',
    process: [
      { alt: 'Diagram of the extract, transform and load steps', caption: 'Pipeline sketch: API, transform, SQLite.' },
      { alt: 'Screenshot of pytest passing in the terminal', caption: 'Tests passing on the transform step.' },
    ],
    files: [
      {
        name: 'pipeline.py',
        lang: 'python',
        code: `"""Hourly weather ETL: Open-Meteo API -> clean rows -> SQLite upsert.

Run by cron:
    0 * * * * cd ~/weather-etl && .venv/bin/python pipeline.py >> etl.log 2>&1
"""
import logging
import sqlite3
from datetime import datetime

import requests

API = "https://api.open-meteo.com/v1/forecast"
CITIES = {
    "Chicago": (41.88, -87.63),
    "Phoenix": (33.45, -112.07),
    "Seattle": (47.61, -122.33),
}
DB_PATH = "weather.db"

log = logging.getLogger("weather_etl")


def extract(lat: float, lon: float) -> dict:
    params = {"latitude": lat, "longitude": lon,
              "hourly": "temperature_2m,precipitation", "past_days": 1}
    resp = requests.get(API, params=params, timeout=10)
    resp.raise_for_status()
    return resp.json()


def transform(city: str, payload: dict) -> list[tuple]:
    hourly = payload["hourly"]
    rows = []
    for ts, temp, rain in zip(hourly["time"], hourly["temperature_2m"], hourly["precipitation"]):
        if temp is None:
            continue  # skip hours the API has not filled in yet
        rows.append((city, datetime.fromisoformat(ts).isoformat(), round(temp, 1), rain or 0.0))
    return rows


def load(conn: sqlite3.Connection, rows: list[tuple]) -> int:
    conn.execute("""
        CREATE TABLE IF NOT EXISTS readings (
            city        TEXT NOT NULL,
            observed_at TEXT NOT NULL,
            temp_c      REAL NOT NULL,
            rain_mm     REAL NOT NULL,
            PRIMARY KEY (city, observed_at)
        )""")
    conn.executemany("""
        INSERT INTO readings (city, observed_at, temp_c, rain_mm)
        VALUES (?, ?, ?, ?)
        ON CONFLICT (city, observed_at)
        DO UPDATE SET temp_c = excluded.temp_c, rain_mm = excluded.rain_mm
    """, rows)
    conn.commit()
    return len(rows)


def run() -> None:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    with sqlite3.connect(DB_PATH) as conn:
        for city, (lat, lon) in CITIES.items():
            try:
                count = load(conn, transform(city, extract(lat, lon)))
                log.info("%s: upserted %d rows", city, count)
            except requests.RequestException as exc:
                log.error("%s: API call failed: %s", city, exc)


if __name__ == "__main__":
    run()`,
      },
      {
        name: 'test_pipeline.py',
        lang: 'python',
        code: `import sqlite3

import pytest

from pipeline import load, transform

PAYLOAD = {
    "hourly": {
        "time": ["2024-06-01T00:00", "2024-06-01T01:00", "2024-06-01T02:00"],
        "temperature_2m": [21.44, None, 19.96],
        "precipitation": [0.0, 0.2, None],
    }
}


def test_transform_skips_missing_temperatures():
    rows = transform("Chicago", PAYLOAD)
    assert len(rows) == 2


def test_transform_rounds_and_fills_rain():
    rows = transform("Chicago", PAYLOAD)
    assert rows[0] == ("Chicago", "2024-06-01T00:00:00", 21.4, 0.0)
    assert rows[1][3] == 0.0  # None rain becomes 0.0


@pytest.fixture
def conn():
    c = sqlite3.connect(":memory:")
    yield c
    c.close()


def test_load_is_idempotent(conn):
    rows = transform("Chicago", PAYLOAD)
    load(conn, rows)
    load(conn, rows)  # rerun must not duplicate
    (count,) = conn.execute("SELECT COUNT(*) FROM readings").fetchone()
    assert count == 2


def test_load_updates_existing_row(conn):
    load(conn, [("Chicago", "2024-06-01T00:00:00", 21.4, 0.0)])
    load(conn, [("Chicago", "2024-06-01T00:00:00", 22.0, 1.5)])
    row = conn.execute("SELECT temp_c, rain_mm FROM readings").fetchone()
    assert row == (22.0, 1.5)`,
      },
    ],
  },

  {
    id: 'query-tuneup',
    title: 'Query Performance Tune-up',
    kicker: 'Performance',
    summary: 'Read EXPLAIN ANALYZE, swapped EXTRACT(YEAR…) for a range filter and added a composite index.',
    skills: ['SQL'],
    repo: 'https://github.com/briankelley-it/query-tuneup', // PLACEHOLDER repo URL
    featured: true,
    // PLACEHOLDER metrics: replace with timings from your own runs
    metrics: [
      { value: '3,840 ms', label: 'before' },
      { value: '295 ms', label: 'after' },
      { value: '13×', label: 'faster' },
    ],
    problem:
      "A yearly sales-by-customer query on a 5 million row orders table took almost four seconds. It ran on every dashboard load, so everything felt slow.",
    approach: [
      'Ran EXPLAIN ANALYZE and saw a sequential scan over the whole table.',
      'Spotted the cause: wrapping the column in EXTRACT(YEAR FROM ordered_at) stops PostgreSQL from using an index on it.',
      'Rewrote the filter as a half-open date range that the planner can match against an index.',
      'Added a composite index on (ordered_at, customer_id) INCLUDE (total) so the query can be answered from the index alone.',
    ],
    solution:
      'Same result set, a fraction of the time. The plan changed from a sequential scan to an index-only scan, and the dashboard stopped hanging.',
    role: 'Solo project. I generated the test data, measured before and after, and wrote up the plans side by side.',
    learned:
      'Always measure first. Functions on a filtered column are a classic index killer, and INCLUDE columns can turn a normal index scan into an index-only scan.',
    process: [
      { alt: 'EXPLAIN ANALYZE output before the fix, showing a sequential scan', caption: 'Before: Seq Scan over every row.' },
      { alt: 'EXPLAIN ANALYZE output after the fix, showing an index-only scan', caption: 'After: Index Only Scan on the new index.' },
    ],
    files: [
      {
        name: 'before_after.sql',
        lang: 'sql',
        code: `-- BEFORE: the function on ordered_at hides the column from any index.
EXPLAIN ANALYZE
SELECT customer_id, SUM(total) AS spent
FROM orders
WHERE EXTRACT(YEAR FROM ordered_at) = 2024
GROUP BY customer_id;
-- Seq Scan on orders  (rows=5000000)
-- Execution Time: 3840 ms

-- FIX 1: compare the raw column against a half-open range.
-- FIX 2: a composite index that covers the whole query.
CREATE INDEX orders_date_customer_idx
    ON orders (ordered_at, customer_id)
    INCLUDE (total);

VACUUM ANALYZE orders;  -- refresh stats and the visibility map

-- AFTER
EXPLAIN ANALYZE
SELECT customer_id, SUM(total) AS spent
FROM orders
WHERE ordered_at >= DATE '2024-01-01'
  AND ordered_at <  DATE '2025-01-01'
GROUP BY customer_id;
-- Index Only Scan using orders_date_customer_idx
-- Execution Time: 295 ms`,
      },
    ],
    // PLACEHOLDER: replace with your measured numbers
    results: {
      caption: 'Before and after, same result set',
      columns: ['version', 'plan', 'rows scanned', 'execution time'],
      rows: [
        ['Before', 'Seq Scan', '5,000,000', '3,840 ms'],
        ['After', 'Index Only Scan', '1,212,400', '295 ms'],
      ],
    },
  },

  {
    id: 'job-skills',
    title: 'Job Market Skills Tracker',
    kicker: 'Data analysis',
    summary: 'Tags job postings with skills using regex in pandas, then ranks skills by share of postings in SQL.',
    skills: ['Python', 'pandas', 'SQL', 'ETL'],
    repo: 'https://github.com/briankelley-it/job-skills-tracker', // PLACEHOLDER repo URL
    featured: false,
    // PLACEHOLDER metrics
    metrics: [
      { value: '500', label: 'postings tagged' },
      { value: '30', label: 'skills tracked' },
      { value: '1', label: 'SQL query for the ranking' },
    ],
    problem:
      'While job hunting I kept guessing which skills junior data roles actually ask for. I wanted real numbers from real postings instead of opinions.',
    approach: [
      'Collected postings I was reading into a CSV: title, company, date and the full description text.',
      'Built a dictionary of skills with a regex for each, using word boundaries so "R" does not match every word with an r in it.',
      'Tagged every posting in pandas and exploded the tags into one row per posting per skill.',
      'Loaded the tags into SQLite and wrote a query that ranks skills by the share of postings that mention them.',
    ],
    solution:
      'A repeatable tracker. I add new postings to the CSV, rerun one script, and get an up to date ranking of skills. It shaped what I chose to learn next.',
    role: 'Solo project. I collected the data, wrote the tagging script and the SQL, and used the results to plan my learning.',
    learned:
      'Regex is powerful but needs tests for edge cases like C++ and .NET. Splitting the work (pandas to clean, SQL to aggregate) kept each part simple.',
    process: [
      { alt: 'Spreadsheet of collected job postings', caption: 'Raw postings collected into a CSV.' },
      { alt: 'Bar chart ranking skills by share of postings', caption: 'Skills ranked by share of postings.' },
    ],
    files: [
      {
        name: 'tag_skills.py',
        lang: 'python',
        code: `"""Tag job postings with skills and load them into SQLite."""
import re
import sqlite3

import pandas as pd

SKILLS = {
    "SQL": r"\\bsql\\b",
    "Python": r"\\bpython\\b",
    "Excel": r"\\bexcel\\b",
    "Power BI": r"\\bpower\\s?bi\\b",
    "Tableau": r"\\btableau\\b",
    "pandas": r"\\bpandas\\b",
    "R": r"(?<![\\w.])R(?![\\w+#])",   # capital R on its own only
    "Git": r"\\bgit(hub)?\\b",
    "dbt": r"\\bdbt\\b",
    "Airflow": r"\\bairflow\\b",
}
PATTERNS = {name: re.compile(rx, re.IGNORECASE if name != "R" else 0) for name, rx in SKILLS.items()}


def tag(description: str) -> list[str]:
    return [name for name, rx in PATTERNS.items() if rx.search(description or "")]


def main() -> None:
    posts = pd.read_csv("postings.csv", parse_dates=["posted_on"])
    posts = posts.drop_duplicates(subset=["company", "title", "posted_on"])
    posts["skills"] = posts["description"].map(tag)

    tags = (
        posts[["posting_id", "skills"]]
        .explode("skills")
        .dropna()
        .rename(columns={"skills": "skill"})
    )

    with sqlite3.connect("jobs.db") as conn:
        posts.drop(columns=["skills"]).to_sql("postings", conn, if_exists="replace", index=False)
        tags.to_sql("posting_skills", conn, if_exists="replace", index=False)

    print(f"Tagged {len(posts)} postings with {len(tags)} skill mentions")


if __name__ == "__main__":
    main()`,
      },
      {
        name: 'skill_share.sql',
        lang: 'sql',
        code: `-- Share of postings that mention each skill, most common first.
WITH total AS (
    SELECT COUNT(*) AS n FROM postings
)
SELECT
    ps.skill,
    COUNT(DISTINCT ps.posting_id)                            AS postings,
    ROUND(100.0 * COUNT(DISTINCT ps.posting_id) / total.n, 1) AS share_pct
FROM posting_skills ps
CROSS JOIN total
GROUP BY ps.skill, total.n
ORDER BY share_pct DESC;`,
      },
    ],
    // PLACEHOLDER sample output
    results: {
      caption: 'Sample output from skill_share.sql',
      columns: ['skill', 'postings', 'share_pct'],
      rows: [
        ['SQL', 402, 80.4],
        ['Excel', 311, 62.2],
        ['Python', 276, 55.2],
        ['Tableau', 158, 31.6],
        ['Power BI', 141, 28.2],
      ],
    },
  },
]
