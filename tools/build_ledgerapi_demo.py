"""Build the static LedgerAPI demo for GitHub Pages.

Runs the real API against a throwaway SQLite database: registers a demo user, adds categories,
expenses, and budgets through the API itself, and records the response of every endpoint.
The demo page serves Swagger UI with the generated OpenAPI schema, and "Try it out" answers
from those recordings, because there is no server.

Usage, from a LedgerAPI checkout with its requirements installed:
    python tools/build_ledgerapi_demo.py <path-to-LedgerAPI> ledgerapi
"""

import argparse
import json
import os
import shutil
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).parent
DEMO_EMAIL = "demo@ledgerapi.dev"
DEMO_PASSWORD = "ledger-demo-2026"

CATEGORIES = [("Groceries", "#22c55e"), ("Rent", "#6366f1"), ("Transport", "#f59e0b"),
              ("Dining out", "#ef4444")]
# (amount, description, date, category index or None)
EXPENSES = [
    ("1450.00", "October rent", "2026-10-01", 1),
    ("86.40", "Weekly groceries", "2026-10-02", 0),
    ("42.15", "Gas", "2026-10-03", 2),
    ("31.80", "Thai takeout", "2026-10-04", 3),
    ("64.25", "Farmers market and groceries", "2026-10-05", 0),
    ("2.75", "Bus fare", "2026-10-06", 2),
    ("58.00", "Dinner with friends", "2026-10-06", 3),
    ("19.99", "Phone stand", "2026-10-07", None),
    ("1450.00", "September rent", "2026-09-01", 1),
    ("312.60", "September groceries", "2026-09-15", 0),
    ("118.30", "September gas", "2026-09-20", 2),
    ("96.50", "September dining", "2026-09-26", 3),
]
BUDGETS = [(0, "300.00"), (2, "150.00"), (3, "80.00")]


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("project", help="LedgerAPI checkout")
    parser.add_argument("out", help="Folder to write the demo into (replaced)")
    args = parser.parse_args()

    project = Path(args.project).resolve()
    out = Path(args.out).resolve()
    work = Path(tempfile.mkdtemp(prefix="ledgerapi-demo-"))
    sys.path.insert(0, str(project))
    os.chdir(project)
    os.environ.update(
        DJANGO_SETTINGS_MODULE="config.settings",
        SECRET_KEY="static-demo-build-only-never-used-to-sign-anything-real",
        DATABASE_URL=f"sqlite:///{(work / 'demo.db').as_posix()}",
        DEBUG="False",
        ALLOWED_HOSTS="*",
    )

    import django

    django.setup()
    from django.core.management import call_command
    from rest_framework.test import APIClient

    call_command("migrate", verbosity=0)
    client = APIClient()
    recordings = {}

    def call(method, path, data=None, query="", record=True):
        res = getattr(client, method.lower())(f"/api/v1/{path}{query}", data, format="json")
        body = res.json() if res.content else None
        if record:
            recordings[f"{method} /api/v1/{path}{query}"] = {"status": res.status_code, "body": body}
        assert res.status_code < 400, (method, path, res.status_code, body)
        return body

    # Accounts and tokens.
    call("GET", "health/")
    call("POST", "auth/register/", {"email": DEMO_EMAIL, "password": DEMO_PASSWORD})
    tokens = call("POST", "auth/token/", {"email": DEMO_EMAIL, "password": DEMO_PASSWORD})
    call("POST", "auth/token/refresh/", {"refresh": tokens["refresh"]})
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")

    # Sample data, created through the API.
    cats = [call("POST", "categories/", {"name": n, "color": c})["id"] for n, c in CATEGORIES]
    for amount, description, date, cat in EXPENSES:
        expense = call("POST", "expenses/", {"amount": amount, "currency": "USD",
                                            "description": description, "date": date,
                                            "category": cats[cat] if cat is not None else None})
    for cat, limit in BUDGETS:
        budget = call("POST", "budgets/", {"category": cats[cat], "month": "2026-10",
                                          "limit": limit, "currency": "USD"})

    # Updates and deletes, on records that end up as they started (or are removed).
    call("PUT", f"categories/{cats[3]}/", {"name": "Dining out", "color": "#ef4444"})
    call("PATCH", f"categories/{cats[3]}/", {"color": "#ef4444"})
    temp = call("POST", "categories/", {"name": "Temporary", "color": "#94a3b8"}, record=False)
    call("DELETE", f"categories/{temp['id']}/")
    call("PATCH", f"expenses/{expense['id']}/", {"description": expense["description"]})
    call("PUT", f"expenses/{expense['id']}/", {k: expense[k] for k in
                                              ("amount", "currency", "description", "date",
                                               "category")})
    temp = call("POST", "expenses/", {"amount": "1.00", "date": "2026-10-07"}, record=False)
    call("DELETE", f"expenses/{temp['id']}/")
    call("PATCH", f"budgets/{budget['id']}/", {"limit": budget["limit"]})
    call("PUT", f"budgets/{budget['id']}/", {"category": budget["category"], "month": budget["month"],
                                            "limit": budget["limit"], "currency": "USD"})
    temp = call("POST", "budgets/", {"category": cats[1], "month": "2026-11", "limit": "1500.00"},
                record=False)
    call("DELETE", f"budgets/{temp['id']}/")

    # Reads last, so lists and reports show the final data.
    call("GET", "auth/me/")
    for name, ids in (("categories", cats), ("expenses", None), ("budgets", None)):
        listing = call("GET", f"{name}/")
        for item in listing["results"]:
            call("GET", f"{name}/{item['id']}/")
    call("GET", "expenses/", query=f"?category={cats[0]}")
    call("GET", "expenses/", query="?ordering=-amount")
    call("GET", "expenses/", query="?date_after=2026-10-01&date_before=2026-10-31")
    call("GET", "budgets/", query="?over_budget=true")
    call("GET", "reports/summary/")
    call("GET", "reports/summary/", query="?start=2026-10-01&end=2026-10-31")
    client.credentials()
    unauthorized = client.get("/api/v1/auth/me/")

    schema = client.get("/api/schema/", {"format": "json"})
    assert schema.status_code == 200, schema.status_code
    spec = schema.json()

    shutil.rmtree(out, ignore_errors=True)
    out.mkdir(parents=True)
    (out / "schema.json").write_text(json.dumps(spec, indent=1), encoding="utf-8")
    (out / "recordings.json").write_text(json.dumps({
        "credentials": {"email": DEMO_EMAIL, "password": DEMO_PASSWORD},
        "access": tokens["access"],
        "unauthorized": {"status": unauthorized.status_code, "body": unauthorized.json()},
        "responses": recordings,
    }, indent=1), encoding="utf-8")
    shutil.copy(HERE / "ledgerapi-demo.html", out / "index.html")
    shutil.copy(HERE / "ledgerapi-demo.js", out / "ledgerapi-demo.js")
    print(f"Recorded {len(recordings)} responses; wrote the demo to {out}")


if __name__ == "__main__":
    main()
