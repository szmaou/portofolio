#!/bin/bash
PORT=${2:-8080}

case "$1" in
  --docker)
    docker compose up -d --build
    echo "→ Portofolio running at http://localhost:$PORT"
    ;;
  --python)
    python3 -m http.server "$PORT"
    ;;
  --npx)
    npx http-server -p "$PORT"
    ;;
  *)
    echo "Usage: ./run.sh --docker | --python | --npx [port]"
    exit 1
    ;;
esac
