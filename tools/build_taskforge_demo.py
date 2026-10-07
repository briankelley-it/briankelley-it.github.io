"""Build the static TaskForge demo for GitHub Pages.

Seeds the demo data into a throwaway SQLite database, signs in as the demo user, and crawls
every page (plus the HTMX fragments those pages request) into plain HTML files. In the result,
anything that would change data shows a notice instead, because there is no server.

Usage, from a TaskForge checkout with its requirements installed and static/css/app.css built:
    python tools/build_taskforge_demo.py <path-to-TaskForge> taskforge --base /taskforge/
"""

import argparse
import os
import re
import shutil
import sys
import tempfile
from pathlib import Path
from urllib.parse import urlsplit

DEMO_JS = Path(__file__).with_name("taskforge-demo.js")
LINK_RE = re.compile(r'\b(href|hx-get)="([^"]+)"')
# These make no sense without a server.
SKIP = ("logout", "/admin/", "/accounts/demo/", "/accounts/google/", "/accounts/3rdparty/", "/__reload__/")


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("project", help="TaskForge checkout")
    parser.add_argument("out", help="Folder to write the demo into (replaced)")
    parser.add_argument("--base", default="/taskforge/", help="URL path the demo is served from")
    args = parser.parse_args()

    project = Path(args.project).resolve()
    out = Path(args.out).resolve()
    base = "/" + args.base.strip("/") + "/"
    work = Path(tempfile.mkdtemp(prefix="taskforge-demo-"))
    sys.path.insert(0, str(project))
    os.chdir(project)
    os.environ.update(
        DJANGO_SETTINGS_MODULE="config.settings.base",
        SECRET_KEY="static-demo-build-only-never-used-to-sign-anything-real",
        DATABASE_URL=f"sqlite:///{(work / 'demo.db').as_posix()}",
        MEDIA_ROOT=str(work / "media"),
        DEBUG="False",
        ALLOWED_HOSTS="*",
    )

    import django

    django.setup()
    from django.conf import settings
    from django.contrib.auth import get_user_model
    from django.core.management import call_command
    from django.test import Client, override_settings
    from django.urls import set_script_prefix

    call_command("migrate", verbosity=0)
    call_command("seed_demo")
    static_storage = {"BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"}
    overrides = {
        "FORCE_SCRIPT_NAME": base.rstrip("/"),
        "STATIC_URL": f"{base}static/",
        "STATIC_ROOT": work / "static",
        "MEDIA_URL": f"{base}media/",
        "STORAGES": {**settings.STORAGES, "staticfiles": static_storage},
        "ALLOWED_HOSTS": ["*"],
    }
    shutil.rmtree(out, ignore_errors=True)
    out.mkdir(parents=True)

    with override_settings(**overrides):
        call_command("collectstatic", interactive=False, verbosity=0)
        set_script_prefix(base)  # the test client does not set it, and {% url %} needs it
        anon = Client()
        user = Client()
        demo = get_user_model().objects.get(email__iexact=settings.DEMO_EMAIL)
        user.force_login(demo, backend="django.contrib.auth.backends.ModelBackend")

        saved = {}
        head_tag = f'<script src="{base}static/demo/taskforge-demo.js" defer></script>\n</head>'

        def target(path, hx):
            rel = path[len(base):]
            if hx:
                rel += "__hx/"
            return out / rel / "index.html" if rel == "" or rel.endswith("/") else out / rel

        def save(client, path, hx=False):
            key = (path, hx)
            if key in saved or not path.startswith(base) or len(saved) > 1500:
                return []
            headers = {"HX-Request": "true"} if hx else {}
            res = client.get(path[len(base) - 1:], headers=headers)
            saved[key] = res.status_code
            file = target(path, hx)
            file.parent.mkdir(parents=True, exist_ok=True)
            if res.status_code in (301, 302):
                if hx:
                    return []
                to = res["Location"]
                file.write_text(f'<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" '
                                f'content="0; url={to}"><a href="{to}">Continue</a>', encoding="utf-8")
                return [(to, False)]
            if res.status_code != 200:
                print(f"  skipped {path} ({res.status_code})")
                return []
            if "html" not in res.get("Content-Type", ""):
                file.write_bytes(res.content)
                return []
            html = res.content.decode()
            if not hx:
                html = html.replace("</head>", head_tag, 1)
            file.write_text(html, encoding="utf-8")
            found = []
            for attr, url in LINK_RE.findall(html):
                url = urlsplit(url.replace("&amp;", "&")).path
                if url.startswith(base) and not url.startswith(f"{base}static/"):
                    found.append((url, attr == "hx-get"))
            return found

        # Signed out: the sign-up and login pages, which offer the one-click demo.
        for page in ("", "accounts/signup/", "accounts/login/", "accounts/password/reset/"):
            save(anon, base + page)
        # Signed in as the demo user: follow every link and HTMX fragment.
        queue = [(base + p, False) for p in ("projects/", "my-tasks/", "search/")]
        while queue:
            path, hx = queue.pop()
            if any(s in path for s in SKIP):
                continue
            queue += save(user, path, hx)

    shutil.copytree(work / "static", out / "static", ignore=shutil.ignore_patterns("admin"))
    (out / "static" / "demo").mkdir(exist_ok=True)
    shutil.copy(DEMO_JS, out / "static" / "demo" / DEMO_JS.name)
    if (work / "media").exists():
        shutil.copytree(work / "media", out / "media")
    pages = sum(1 for (_, hx), code in saved.items() if code == 200 and not hx)
    fragments = sum(1 for (_, hx), code in saved.items() if code == 200 and hx)
    print(f"Wrote {pages} pages and {fragments} HTMX fragments to {out}")


if __name__ == "__main__":
    main()
