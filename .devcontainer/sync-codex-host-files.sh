#!/usr/bin/env bash
set -euo pipefail

# Devcontainer initialize helper for ensuring project-local agent auth files exist.
# These exact files are used as bind-mount sources, so never replace them.

workspace_dir="${1:-}"

if [[ -z "${workspace_dir}" ]]; then
  echo "Usage: $0 <local-workspace-folder>" >&2
  exit 1
fi

ensure_file() {
  local relative_path="$1"
  local file_mode="$2"
  local workspace_file="${workspace_dir}/${relative_path}"

  mkdir -p "$(dirname "${workspace_file}")"

  if [[ ! -e "${workspace_file}" ]]; then
    touch "${workspace_file}"
    chmod "${file_mode}" "${workspace_file}"
  elif [[ ! -f "${workspace_file}" ]]; then
    echo "Expected ${workspace_file} to be a regular file." >&2
    exit 1
  fi
}

mkdir -p "${workspace_dir}/.codex" "${workspace_dir}/.codex/rules" "${workspace_dir}/.claude"

ensure_file ".codex/auth.json" 600
ensure_file ".codex/.credentials.json" 600
ensure_file ".codex/rules/default.rules" 644
ensure_file ".claude/.credentials.json" 600
