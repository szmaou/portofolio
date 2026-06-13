#!/bin/bash
PORT=${1:-8080}

if command -v docker &> /dev/null; then
  echo "→ Detected Docker, running via compose..."
  docker compose up -d --build
  echo "→ Portofolio running at http://localhost:$PORT"
elif command -v python3 &> /dev/null; then
  echo "→ Detected Python3, running local server..."
  python3 -m http.server "$PORT"
elif command -v npx &> /dev/null; then
  echo "→ Detected Node, running http-server..."
  npx http-server -p "$PORT"
else
  echo "→ No Docker/Python/Node found."
  echo "→ Buka index.html langsung di browser."
fi
