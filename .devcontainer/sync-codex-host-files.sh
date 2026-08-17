#!/usr/bin/env bash
set -euo pipefail

# Prepare safe targets for the two host-backed Codex file mounts.
# The Compose bind mounts use create_host_path=false, so missing or invalid host
# sources fail instead of being silently created as directories.

workspace_dir="${1:-}"
host_codex_dir="${HOST_CODEX_DIR:-${HOME}/.codex}"

if [[ -z "${workspace_dir}" ]]; then
  echo "Usage: $0 <local-workspace-folder>" >&2
  exit 1
fi

require_host_file() {
  local source_file="$1"

  if [[ ! -f "${source_file}" || -L "${source_file}" ]]; then
    echo "Expected Codex mount source ${source_file} to be a regular, non-symlink file." >&2
    exit 1
  fi
}

prepare_mount_target() {
  local relative_path="$1"
  local file_mode="$2"
  local workspace_file="${workspace_dir}/${relative_path}"

  mkdir -p "$(dirname "${workspace_file}")"

  # Old setup revisions used host-absolute symlinks here. They are dangling in
  # containers and must be replaced by regular mount-point files. unlink only
  # removes the project-side symlink; it never touches the host credential.
  if [[ -L "${workspace_file}" ]]; then
    unlink "${workspace_file}"
  elif [[ -e "${workspace_file}" && ! -f "${workspace_file}" ]]; then
    echo "Expected Codex mount target ${workspace_file} to be a regular file." >&2
    exit 1
  fi

  if [[ ! -e "${workspace_file}" ]]; then
    install -m "${file_mode}" /dev/null "${workspace_file}"
  elif [[ ! -f "${workspace_file}" ]]; then
    echo "Expected ${workspace_file} to be a regular file." >&2
    exit 1
  else
    chmod "${file_mode}" "${workspace_file}"
  fi
}

if [[ -e "${workspace_dir}/.codex" && ! -d "${workspace_dir}/.codex" ]]; then
  echo "Expected ${workspace_dir}/.codex to be a directory." >&2
  exit 1
fi

require_host_file "${host_codex_dir}/auth.json"
require_host_file "${host_codex_dir}/.credentials.json"

mkdir -p "${workspace_dir}/.codex"
prepare_mount_target ".codex/auth.json" 600
prepare_mount_target ".codex/.credentials.json" 600
