#!/usr/bin/env bash
# Kept as the familiar entry point; now publishes the complete three-episode app.
set -euo pipefail
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
exec python3 "$SCRIPT_DIR/deploy-phone.py" "$@"
