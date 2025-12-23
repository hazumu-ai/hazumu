#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 || $# -gt 3 ]]; then
  echo "Usage: $0 <user@host> <remote_dir> [local_dir]"
  echo "Example: $0 hazumu@192.168.1.195 ~/mcp apps/robot-mcp"
  exit 1
fi

RASPI_HOST="$1"
REMOTE_DIR="$2"
LOCAL_DIR="${3:-apps/robot-mcp}"

# 転送
rsync -av --delete "${LOCAL_DIR}" "${RASPI_HOST}:${REMOTE_DIR}/"
