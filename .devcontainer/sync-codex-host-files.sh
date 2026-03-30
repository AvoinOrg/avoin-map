#!/usr/bin/env bash
set -euo pipefail

# Devcontainer initialize helper for copying Codex config files into the workspace.
# Prefer CODEX_HOST_DIR/CODEX_SQLITE_HOME when set so we do not depend on symlinked home paths.

workspace_dir="${1:-}"

if [[ -z "${workspace_dir}" ]]; then
  echo "Usage: $0 <local-workspace-folder>" >&2
  exit 1
fi

read_env_file_var() {
  local env_file="$1"
  local var_name="$2"

  if [[ ! -f "${env_file}" ]]; then
    return 1
  fi

  awk -F= -v key="${var_name}" '$1 == key { print substr($0, index($0, "=") + 1); exit }' "${env_file}"
}

host_codex_dir="${CODEX_HOST_DIR:-}"
host_codex_sqlite_dir="${CODEX_SQLITE_HOME:-}"

if [[ -z "${host_codex_dir}" ]]; then
  host_codex_dir="$(read_env_file_var "${workspace_dir}/.env" "CODEX_HOST_DIR" || true)"
fi

if [[ -z "${host_codex_sqlite_dir}" ]]; then
  host_codex_sqlite_dir="$(read_env_file_var "${workspace_dir}/.env" "CODEX_SQLITE_HOME" || true)"
fi

if [[ -z "${host_codex_dir}" ]] && [[ -n "${host_codex_sqlite_dir}" ]]; then
  host_codex_dir="$(dirname "${host_codex_sqlite_dir}")"
fi

if [[ -z "${host_codex_dir}" ]]; then
  host_home_dir="${HOME:-}"

  if [[ -z "${host_home_dir}" ]]; then
    current_user="$(id -un 2>/dev/null || true)"
    if [[ -n "${current_user}" ]] && command -v getent >/dev/null 2>&1; then
      host_home_dir="$(getent passwd "${current_user}" | cut -d: -f6 || true)"
    fi
  fi

  if [[ -z "${host_home_dir}" ]]; then
    echo "Could not determine CODEX_HOST_DIR or host home directory." >&2
    exit 1
  fi

  host_codex_dir="${host_home_dir}/.codex"
fi

workspace_codex_dir="${workspace_dir}/.codex"
host_codex_sqlite_dir="${host_codex_sqlite_dir:-${host_codex_dir}/sqlite}"
workspace_codex_sqlite_dir="${workspace_codex_dir}/sqlite"

sync_file() {
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

  if [[ -e "${host_file}" ]]; then
    cp -fL "${host_file}" "${workspace_file}"
  fi
}

mkdir -p "${host_codex_dir}" "${workspace_codex_dir}" "${host_codex_sqlite_dir}" "${workspace_codex_sqlite_dir}"

sync_file "auth.json" true
sync_file ".credentials.json"
sync_file "rules/default.rules" true
