#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

# ── Python venv ───────────────────────────────────────────────────────────────
VENV="$ROOT/backend/field_avail"
if [ ! -d "$VENV" ]; then
  echo "Creating Python venv..."
  python3 -m venv "$VENV"
fi
source "$VENV/bin/activate"
pip install -q -r "$ROOT/backend/requirements.txt"

# ── Node deps ─────────────────────────────────────────────────────────────────
if [ ! -d "$ROOT/frontend/node_modules" ]; then
  echo "Installing frontend dependencies..."
  npm --prefix "$ROOT/frontend" install
fi

# ── Kill background jobs on exit ──────────────────────────────────────────────
trap 'kill $(jobs -p) 2>/dev/null; echo "Stopped."' EXIT

# ── Start servers ─────────────────────────────────────────────────────────────
echo "Backend  → http://localhost:8000"
cd "$ROOT/backend" && uvicorn main:app --reload &

echo "Frontend → http://localhost:5173"
npm --prefix "$ROOT/frontend" run dev
