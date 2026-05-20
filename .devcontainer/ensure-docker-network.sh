#!/usr/bin/env bash

set -euo pipefail

network_name="${1:-climate-map-network}"

if ! docker network inspect "$network_name" >/dev/null 2>&1; then
  docker network create "$network_name" >/dev/null
fi
