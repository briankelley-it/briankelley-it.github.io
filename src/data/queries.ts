// Questions for the Query lab. Each one has fixed SQL, fixed result rows and a short
// explanation. Nothing runs against a real database: the page shows these rows after a
// short "Running…" delay. Edit, add or remove questions here.

export type LabQuery = {
  id: string
  question: string
  concepts: string
  sql: string
  columns: string[]
  rows: (string | number)[][]
  why: string
}

export const labIntro =
  "These run against a small store database with three tables: customers, orders and products. Pick a question, press Run, and you'll see the result plus a quick note on why the query works."

export const schema = [
  'customers(id, name, email, joined_on)',
  'orders(id, customer_id, ordered_at, total)',
  'products(id, name, category, price, units_sold)',
]

export const labQueries: LabQuery[] = [
  {
    id: 'top-customers',
    question: 'Who are our top customers?',
    concepts: 'JOIN · GROUP BY · LIMIT',
    sql: `-- Top 5 customers by lifetime spend
SELECT
    c.name,
    COUNT(o.id)            AS orders,
    ROUND(SUM(o.total), 2) AS lifetime_spend
FROM customers c
JOIN orders o ON o.customer_id = c.id
GROUP BY c.id, c.name
ORDER BY lifetime_spend DESC
LIMIT 5;`,
    columns: ['name', 'orders', 'lifetime_spend'],
    rows: [
      ['Maya Chen', 14, '2,318.40'],
      ['Jordan Ellis', 11, '1,942.15'],
      ['Priya Nair', 12, '1,780.00'],
      ['Carlos Mendez', 9, '1,512.75'],
      ['Aisha Bello', 8, '1,309.90'],
    ],
    why:
      'The JOIN lines up every order with its customer. GROUP BY collapses those rows to one per customer, so COUNT and SUM work per person. Grouping by id as well as name keeps two customers with the same name apart. ORDER BY with LIMIT keeps only the top five.',
  },
  {
    id: 'running-total',
    question: 'How is revenue building up this year?',
    concepts: 'CTE · SUM() OVER',
    sql: `-- Monthly revenue with a running total for 2024
WITH monthly AS (
    SELECT
        date_trunc('month', ordered_at)::date AS month,
        SUM(total)                            AS revenue
    FROM orders
    WHERE ordered_at >= DATE '2024-01-01'
      AND ordered_at <  DATE '2025-01-01'
    GROUP BY 1
)
SELECT
    month,
    revenue,
    SUM(revenue) OVER (ORDER BY month) AS running_total
FROM monthly
ORDER BY month;`,
    columns: ['month', 'revenue', 'running_total'],
    rows: [
      ['2024-01-01', '8,420.00', '8,420.00'],
      ['2024-02-01', '7,910.50', '16,330.50'],
      ['2024-03-01', '9,845.25', '26,175.75'],
      ['2024-04-01', '10,302.00', '36,477.75'],
      ['2024-05-01', '11,118.40', '47,596.15'],
      ['2024-06-01', '12,006.90', '59,603.05'],
    ],
    why:
      'The CTE first rolls orders up to one row per month, which keeps the main query easy to read. SUM() OVER (ORDER BY month) is a window function: it adds up every month up to and including the current one without collapsing the rows, which gives a running total next to each month.',
  },
  {
    id: 'losing-customers',
    question: 'Which customers might we be losing?',
    concepts: 'LEFT JOIN · HAVING · NULLS FIRST',
    sql: `-- Customers with no order in the last 90 days
SELECT
    c.name,
    c.email,
    MAX(o.ordered_at)::date AS last_order
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY c.id, c.name, c.email
HAVING MAX(o.ordered_at) IS NULL
    OR MAX(o.ordered_at) < CURRENT_DATE - INTERVAL '90 days'
ORDER BY last_order NULLS FIRST;`,
    columns: ['name', 'email', 'last_order'],
    rows: [
      ['Tom Becker', 'tom.b@example.com', 'NULL'],
      ['Grace Liu', 'grace.liu@example.com', 'NULL'],
      ['Omar Haddad', 'omar.h@example.com', '2024-01-18'],
      ['Nina Petrova', 'nina.p@example.com', '2024-02-02'],
    ],
    why:
      "A LEFT JOIN keeps every customer, even people who have never ordered (their order columns come back NULL). HAVING filters after grouping, so it can test MAX(ordered_at). NULLS FIRST puts people who signed up but never bought at the top, since they're the easiest win.",
  },
  {
    id: 'best-sellers',
    question: 'What are the best sellers in each category?',
    concepts: 'RANK() OVER (PARTITION BY)',
    sql: `-- Top 2 products per category by units sold
WITH ranked AS (
    SELECT
        category,
        name,
        units_sold,
        RANK() OVER (
            PARTITION BY category
            ORDER BY units_sold DESC
        ) AS rnk
    FROM products
)
SELECT category, rnk, name, units_sold
FROM ranked
WHERE rnk <= 2
ORDER BY category, rnk;`,
    columns: ['category', 'rnk', 'name', 'units_sold'],
    rows: [
      ['Accessories', 1, 'Canvas Tote', 842],
      ['Accessories', 2, 'Leather Keyring', 615],
      ['Home', 1, 'Stoneware Mug', 1204],
      ['Home', 2, 'Linen Napkins (4)', 733],
      ['Stationery', 1, 'Dot Grid Notebook', 968],
      ['Stationery', 2, 'Gel Pen Set', 902],
    ],
    why:
      "PARTITION BY restarts the ranking for every category, and ORDER BY units_sold DESC ranks inside each one. You can't filter on a window function in WHERE directly, so the ranking happens in a CTE and the outer query keeps ranks 1 and 2. RANK() lets ties share a place.",
  },
]
