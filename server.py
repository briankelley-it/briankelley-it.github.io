"""Local Python portfolio server. Requires Python 3.10+ and no packages.

Run: python server.py
Then open: http://127.0.0.1:8000
This is a development server, not a production application server.
"""
import argparse
import json
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parent
PUBLIC_FILES = {"index.html", "styles.css", "script.js", "projects.json"}


class PortfolioHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def send_head(self):
        path = urlsplit(self.path).path
        if path in {"/api/projects", "/api/health"}:
            payload = ({"status": "ok"} if path == "/api/health"
                       else json.loads((ROOT / "projects.json").read_text(encoding="utf-8")))
            encoded = json.dumps(payload, ensure_ascii=False).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(encoded)))
            self.send_header("Cache-Control", "no-cache")
            self.end_headers()
            if self.command != "HEAD":
                self.wfile.write(encoded)
            return None
        if path == "/":
            self.path = "/index.html"
        elif path.startswith("/thistledown/"):
            # Static export of the Thistledown Homes demo: folders serve their index.html.
            candidate = (ROOT / path.lstrip("/")).resolve()
            if candidate.is_dir():
                candidate = candidate / "index.html"
            if ".." in path or "%" in path or not candidate.is_relative_to(ROOT / "thistledown") or not candidate.is_file():
                self.send_error(404)
                return None
            self.path = "/" + candidate.relative_to(ROOT).as_posix()
        elif path.lstrip("/") not in PUBLIC_FILES:
            if not path.startswith("/assets/") or ".." in path or "%" in path:
                self.send_error(404)
                return None
            candidate = (ROOT / path.lstrip("/")).resolve()
            if not candidate.is_relative_to(ROOT / "assets") or not candidate.is_file():
                self.send_error(404)
                return None
        return super().send_head()

    def end_headers(self):
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        super().end_headers()


def main():
    parser = argparse.ArgumentParser(description="Run Brian Kelley's local portfolio.")
    parser.add_argument("--port", type=int, default=8000)
    args = parser.parse_args()
    server = ThreadingHTTPServer(("127.0.0.1", args.port), PortfolioHandler)
    print(f"Brian Kelley portfolio: http://127.0.0.1:{args.port}", flush=True)
    print("Press Ctrl+C to stop.", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nPortfolio server stopped.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
