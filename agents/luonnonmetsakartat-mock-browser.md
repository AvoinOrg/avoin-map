# Luonnonmetsakartat Mock Browser Runbook

This runbook is for agent-driven Luonnonmetsakartat browser checks against the
already-running app-container dev server. Do not start, stop, restart, or kill
the shared dev server from this workflow.

## Required Mock Env

The dev server must already be running with:

```bash
PUBLIC_COMPILED_APPLETS=main,luonnonmetsakartat
PUBLIC_MOCK_AUTH_ENABLED=1
PUBLIC_MOCK_AUTH_INITIAL_STATE=authenticated
LUONNONMETSAKARTAT_MOCK_API_ENABLED=1
PUBLIC_LUONNONMETSAKARTAT_MOCK_SCENARIOS_ENABLED=1
```

Existing production guards reject mock auth/API/scenario flags when
`NODE_ENV=production`.

## Dev-Server Rule

Run browser smoke and visual commands inside the project `app` container so
`http://127.0.0.1:6900` points at the app-container dev server:

```bash
docker compose -f /workspace/project/docker-compose.dev.yml --project-directory /workspace/project exec app sh -lc 'cd /app && yarn luonnonmetsakartat:mock:smoke'
```

The smoke script probes `http://127.0.0.1:6900` for reachability but remaps
browser navigation to `http://localhost:6900` for reliable app-container
hydration and clicks. If `:6900` is unreachable, stop and report that the main
dev server is unavailable. Do not launch a replacement `yarn dev` process.

From the Codex agent or host namespace, do not probe `127.0.0.1:6900`; use the
host-published `DEV_PORT` only for manual diagnostics outside this runbook.

## Commands

```bash
yarn luonnonmetsakartat:mock:smoke
yarn visual:luonnonmetsakartat-mocks
node utils/scripts/visual/luonnonmetsakartat-mock-smoke.js --help
```

Both smoke and visual commands are no-start flows and expect the stable dev
server to already exist.

## Main-App URLs

Canonical main-app paths:

- `/fi/luonnonmetsakartat`
- `/fi/luonnonmetsakartat/admin`
- `/fi/luonnonmetsakartat/admin/import`
- `/fi/luonnonmetsakartat/admin/layer/mock-visible-layer`
- `/fi/luonnonmetsakartat/admin/layer/mock-visible-layer/settings`
- `/fi/luonnonmetsakartat/admin/layer/mock-visible-layer/pictures`

Legacy redirects:

- `/fi/luonnonmetsakartat/admin/tuo`
- `/fi/luonnonmetsakartat/admin/taso/mock-visible-layer`
- `/fi/luonnonmetsakartat/admin/taso/mock-visible-layer/asetukset`
- `/fi/luonnonmetsakartat/admin/taso/mock-visible-layer/kuvat`

## Standalone URLs

Standalone Luonnonmetsakartat builds omit the applet slug:

- `/fi`
- `/fi/admin`
- `/fi/admin/import`
- `/fi/admin/layer/mock-visible-layer`
- `/fi/admin/layer/mock-visible-layer/settings`
- `/fi/admin/layer/mock-visible-layer/pictures`

Standalone legacy equivalents include:

- `/fi/admin/tuo`
- `/fi/admin/taso/mock-visible-layer`
- `/fi/admin/taso/mock-visible-layer/asetukset`
- `/fi/admin/taso/mock-visible-layer/kuvat`

## Mock Query Params

Use these query params for seeded browser states:

- `mockReset=1`
- `mockLuonnonmetsakartatState=<state>`
- `mockAuth=authenticated`

Common states are `public-layers`, `admin-layers`, `layer-detail`,
`settings-clean`, and `pictures-mapped`.

## Upload Fixtures

Committed shapefile ZIP fixtures:

- `test-data/luonnonmetsakartat/valid-layer.zip`
- `test-data/luonnonmetsakartat/duplicate-id-layer.zip`

The fixture manifest is
`test-data/luonnonmetsakartat/README.md`. The valid fixture should auto-detect
`id`, `nimi`, `kunta`, `maakunta`, `kuvaus`, and `pinta_ala`. The duplicate
fixture should stay on the import route and trigger duplicate-ID validation
before any create POST.

## Known Limitations

- The mock API does not emulate production GeoServer/vector tiles beyond the
  current mock API, WFS, and empty vector-tile endpoints.
- Import fixture geometry is used for client parsing and validation. The mock
  API creates deterministic mock areas rather than ingesting uploaded geometry.
- The picture save smoke uses in-memory mock picture fixture state from the
  `pictures-mapped` scenario, not a real OS directory picker.
- Server-side mock API storage can persist for the life of the dev-server
  process. Smoke flows parse created layer IDs dynamically and do not assume
  `mock-created-layer-1`.
