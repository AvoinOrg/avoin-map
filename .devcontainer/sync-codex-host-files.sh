#!/usr/bin/env bash
set -euo pipefail

workspace_dir="${1:-}"

if [[ -z "${workspace_dir}" ]]; then
  echo "Usage: $0 <local-workspace-folder>" >&2
  exit 1
fi

host_codex_dir="${HOME}/.codex"
workspace_codex_dir="${workspace_dir}/.codex"

link_file() {
  local relative_path="$1"
  local ensure_host_file="${2:-false}"
  local host_file="${host_codex_dir}/${relative_path}"
  local workspace_file="${workspace_codex_dir}/${relative_path}"

  mkdir -p "$(dirname "${host_file}")"
  mkdir -p "$(dirname "${workspace_file}")"

  if [[ "${ensure_host_file}" == "true" ]]; then
    touch "${host_file}"
  fi

  rm -rf "${workspace_file}"
  ln -sf "${host_file}" "${workspace_file}"
}

mkdir -p "${host_codex_dir}" "${workspace_codex_dir}"

link_file "auth.json" true
link_file ".credentials.json"
link_file "rules/default.rules" true
