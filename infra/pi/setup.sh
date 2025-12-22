#!/usr/bin/env bash
set -euo pipefail

# 使い方:
#   ./setup.sh pi@192.168.1.10


TARGET="${1:-}"
if [[ -z "$TARGET" ]]; then
  echo "Usage: $0 <user@host>"
  exit 1
fi

SSH_PORT="${SSH_PORT:-22}"

ssh -p "$SSH_PORT" -o BatchMode=yes -o ConnectTimeout=10 "$TARGET" "bash -s" <<'REMOTE'
set -euo pipefail

echo "[1/4] Check prerequisites..."
if ! command -v curl >/dev/null 2>&1; then
  echo "curl not found. Installing curl..."
  if command -v apt-get >/dev/null 2>&1; then
    sudo apt-get update -y
    sudo apt-get install -y curl ca-certificates
  else
    echo "apt-get not available. Please install curl manually."
    exit 1
  fi
fi

echo "[2/4] Installing uv (Astral installer)..."
# 公式のインストーラをダウンロード
curl -LsSf https://astral.sh/uv/install.sh | sh

echo "[3/4] Ensure PATH includes uv..."
export PATH="$HOME/.local/bin:$HOME/.cargo/bin:$PATH"

echo "[4/4] Verify..."
if ! command -v uv >/dev/null 2>&1; then
  echo "uv not found in PATH. Try opening a new shell or add ~/.local/bin to PATH."
  echo 'Example: echo '\''export PATH="$HOME/.local/bin:$PATH"'\'' >> ~/.bashrc'
  exit 1
fi

uv --version
echo "Done."
REMOTE
