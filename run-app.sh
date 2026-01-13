#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/app"
PORT="${PORT:-8000}"

if ! command -v python >/dev/null 2>&1; then
  echo "Python is required to run the local server." >&2
  exit 1
fi

echo "Starting UFC Analyzer at http://127.0.0.1:${PORT}/index.html"
python -m http.server "${PORT}" --directory "${APP_DIR}"
