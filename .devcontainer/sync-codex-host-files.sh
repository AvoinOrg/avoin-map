#!/usr/bin/env bash
set -euo pipefail

workspace_dir="${1:-}"

if [[ -z "${workspace_dir}" ]]; then
  echo "Usage: $0 <local-workspace-folder>" >&2
  exit 1
fi

host_home_dir="${HOME:-}"

if [[ -z "${host_home_dir}" ]]; then
  current_user="$(id -un 2>/dev/null || true)"
  if [[ -n "${current_user}" ]] && command -v getent >/dev/null 2>&1; then
    host_home_dir="$(getent passwd "${current_user}" | cut -d: -f6 || true)"
  fi
fi

if [[ -z "${host_home_dir}" ]]; then
  echo "Could not determine host home directory (HOME is unset)." >&2
  exit 1
fi

host_codex_dir="${host_home_dir}/.codex"
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
