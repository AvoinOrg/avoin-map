#!/usr/bin/env bash
set -euo pipefail

# Devcontainer initialize helper for ensuring project-local Codex files exist.
# These exact files are used as bind-mount sources, so never replace them.

workspace_dir="${1:-}"

if [[ -z "${workspace_dir}" ]]; then
  echo "Usage: $0 <local-workspace-folder>" >&2
  exit 1
fi

workspace_codex_dir="${workspace_dir}/.codex"

ensure_file() {
  local relative_path="$1"
  local file_mode="$2"
  local workspace_file="${workspace_codex_dir}/${relative_path}"

  mkdir -p "$(dirname "${workspace_file}")"

  if [[ ! -e "${workspace_file}" ]]; then
    touch "${workspace_file}"
    chmod "${file_mode}" "${workspace_file}"
  fi
}

mkdir -p "${workspace_codex_dir}" "${workspace_codex_dir}/rules"

ensure_file "auth.json" 600
ensure_file ".credentials.json" 600
ensure_file "rules/default.rules" 644
