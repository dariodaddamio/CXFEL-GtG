#!/usr/bin/env bash
set -euo pipefail

# Restructure this Sphinx project into:
#   source/  - all editable docs + assets
#   build/   - all generated build outputs
#
# No duplicates: we only move (mv) and refuse to overwrite existing targets.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

SOURCE_DIR="source"
BUILD_DIR="build"

abort() {
  echo "error: $*" >&2
  exit 1
}

safe_mkdir() {
  local d="$1"
  mkdir -p "$d"
}

safe_mv() {
  local src="$1"
  local dst="$2"
  [[ -e "$src" ]] || return 0
  [[ -e "$dst" ]] && abort "refusing to overwrite existing: $dst"
  mv "$src" "$dst"
}

echo "Restructuring Sphinx project in: $ROOT_DIR"

# Create target dirs (but don't overwrite anything inside).
safe_mkdir "$SOURCE_DIR"
safe_mkdir "$BUILD_DIR"

# Move Sphinx build output (_build) into build/ (if present).
if [[ -d "_build" ]]; then
  # If build/ is empty, move _build contents into build/
  if [[ -z "$(ls -A "$BUILD_DIR" 2>/dev/null || true)" ]]; then
    echo "Moving _build/* -> build/"
    shopt -s dotglob nullglob
    mv _build/* "$BUILD_DIR"/
    shopt -u dotglob nullglob
    rmdir _build || true
  else
    abort "'build/' is not empty; won't move existing '_build' into it"
  fi
fi

# Move editable sources/assets into source/
for f in *.rst; do
  [[ -e "$f" ]] || break
  safe_mv "$f" "$SOURCE_DIR/$f"
done

safe_mv "conf.py" "$SOURCE_DIR/conf.py"
safe_mv "_static" "$SOURCE_DIR/_static"
safe_mv "_templates" "$SOURCE_DIR/_templates"
safe_mv "images" "$SOURCE_DIR/images"

echo "Done."
echo
echo "Next:"
echo "  - Build:   make html"
echo "  - Preview: sphinx-autobuild source build/html --port 8000"

