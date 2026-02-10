from __future__ import annotations

from datetime import datetime, timedelta, timezone
import json
from pathlib import Path
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from scrapers import build_dashboard_payload

BASE_DIR = Path(__file__).resolve().parent.parent
APP_DIR = BASE_DIR / "app"
CACHE_TTL = timedelta(minutes=10)
_cache_data: dict | None = None
_cache_expiry: datetime | None = None


def _dashboard() -> dict:
    global _cache_data, _cache_expiry
    now = datetime.now(timezone.utc)
    if _cache_data is None or _cache_expiry is None or now >= _cache_expiry:
        _cache_data = build_dashboard_payload()
        _cache_expiry = now + CACHE_TTL
    return _cache_data


class Handler(BaseHTTPRequestHandler):
    def do_GET(self) -> None:  # noqa: N802
        if self.path == "/api/dashboard":
            data = json.dumps(_dashboard()).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return

        path = "index.html" if self.path in {"/", ""} else self.path.lstrip("/")
        file_path = APP_DIR / path
        if file_path.exists() and file_path.is_file():
            content = file_path.read_bytes()
            content_type = "text/plain"
            if file_path.suffix == ".html":
                content_type = "text/html"
            elif file_path.suffix == ".css":
                content_type = "text/css"
            elif file_path.suffix == ".js":
                content_type = "application/javascript"
            self.send_response(200)
            self.send_header("Content-Type", content_type)
            self.send_header("Content-Length", str(len(content)))
            self.end_headers()
            self.wfile.write(content)
            return

        self.send_response(404)
        self.end_headers()


def run() -> None:
    server = ThreadingHTTPServer(("0.0.0.0", 8000), Handler)
    print("UFC Intelligence Hub running at http://127.0.0.1:8000")
    server.serve_forever()


if __name__ == "__main__":
    run()
