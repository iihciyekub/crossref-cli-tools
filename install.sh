#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
DEFAULT_BIN_DIR="$HOME/.local/bin"

BIN_DIR="$DEFAULT_BIN_DIR"
FORCE=0
SKIP_NPM=0

COMMANDS=(
  "crossref-stq"
  "crossref-doi"
  "crossref-csl"
  "doi-pdf"
)

usage() {
  cat <<'EOF'
Usage:
  ./install.sh [options]

Options:
  --dir DIR     Install symlinks into DIR. Default: ~/.local/bin
  --force       Replace existing files or symlinks in the target directory
  --no-npm      Skip npm install
  --help        Show this help text
EOF
}

fail() {
  echo "$1" >&2
  exit 1
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    fail "Missing required command: $1"
  fi
}

path_contains() {
  case ":${PATH:-}:" in
    *:"$1":*) return 0 ;;
    *) return 1 ;;
  esac
}

while [ $# -gt 0 ]; do
  case "$1" in
    --dir)
      [ $# -ge 2 ] || fail "Missing value for --dir"
      BIN_DIR="$2"
      shift 2
      ;;
    --force)
      FORCE=1
      shift
      ;;
    --no-npm)
      SKIP_NPM=1
      shift
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      fail "Unknown option: $1"
      ;;
  esac
done

require_cmd ln
require_cmd mkdir

if [ "$SKIP_NPM" -ne 1 ]; then
  require_cmd npm
fi

mkdir -p "$BIN_DIR"

if [ "$SKIP_NPM" -ne 1 ]; then
  echo "Installing Node dependencies..."
  (cd "$ROOT_DIR" && npm install >/dev/null)
fi

for command_name in "${COMMANDS[@]}"; do
  src="$ROOT_DIR/$command_name"
  dest="$BIN_DIR/$command_name"

  [ -f "$src" ] || fail "Missing source script: $src"
  chmod +x "$src"

  if [ -e "$dest" ] || [ -L "$dest" ]; then
    if [ "$FORCE" -ne 1 ]; then
      fail "Target already exists: $dest (re-run with --force to replace)"
    fi
    rm -f "$dest"
  fi

  ln -s "$src" "$dest"
  echo "Installed $command_name -> $dest"
done

if path_contains "$BIN_DIR"; then
  echo "Install complete. Commands are available in your PATH."
else
  echo "Install complete."
  echo "Add this to your shell config to use the commands anywhere:"
  echo "  export PATH=\"$BIN_DIR:\$PATH\""
fi
