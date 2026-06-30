---
name: carbon-mock-browser-smoke
description: Run and debug the Hiilikartta carbon mock visual scenarios and browser smoke utility against an already-running mock-enabled dev server.
---

# Carbon Mock Browser Smoke

Use this when checking the Hiilikartta carbon mock setup, visual scenario set, GeoPackage import flow, mock API save/calculation/report flow, or legacy redirect behavior.

## Runtime Rule

Use the shared dev server only. Do not start, stop, kill, restart, or reset dev-server processes from this workflow. If `http://127.0.0.1:3000` is unreachable from the app container, stop and report that the shared dev server is unavailable.

The dev server process must already have been started with mock flags equivalent to:

```bash
NEXT_PUBLIC_COMPILED_APPLETS=main,hiilikartta
NEXT_PUBLIC_MOCK_AUTH_ENABLED=1
NEXT_PUBLIC_MOCK_AUTH_INITIAL_STATE=authenticated
HIILIKARTTA_MOCK_API_ENABLED=1
NEXT_PUBLIC_HIILIKARTTA_MOCK_SCENARIOS_ENABLED=1
```

These flags belong to the existing dev server process, not to the smoke command.

## Commands

Run inside the `app` container so `http://127.0.0.1:3000` is the correct target:

```bash
yarn visual:carbon-mocks
yarn visual:carbon-mocks:smoke
```

Both commands use `--no-start`. If running the smoke script directly:

```bash
node ./utils/scripts/visual/carbon-mock-smoke.js --base-url=http://127.0.0.1:3000 --no-start
```

Visual artifacts under `.dev/visual-regression/` are local and are not committed.

## Mock Reset And Auth

URL reset:

```text
?mockReset=1
```

Empty reset:

```text
?mockReset=1&mockCarbonState=empty
?mockReset=1&mockCarbonState=reset
```

Runtime helpers from an already-loaded mock-enabled page:

```js
await window.__avoinCarbonMocks.reset()
await window.__avoinCarbonMocks.seed('state-name')
```

Mock auth URL toggles:

```text
mockAuth=authenticated
mockAuth=unauthenticated
```

The normal smoke default is authenticated mock auth.

## GeoPackage Import

Use the real browser file input on:

```text
/fi/carbon/plans/mock-local-plan?mockReset=1&mockCarbonState=import-placeholder&mockAuth=authenticated
```

Upload:

```text
test-data/carbon/test.gpkg
```

The fixture must not be edited. It has one feature table, `pappila`, so the UI may auto-select it and hide the table dropdown. Select zoning-code column `Subtype`; leaving the optional area-name column empty is valid. Accept the import, open:

```text
/fi/carbon/plans/mock-local-plan/areas
```

Expected result: invalid zoning data and a disabled calculate action.

## Visual State Catalog

Append `?mockReset=1&mockCarbonState=<state>` unless the row already shows full query params.

| State | Canonical path |
| --- | --- |
| `home` | `/fi/carbon` |
| `plans-empty` | `/fi/carbon/plans` |
| `plans-seeded` | `/fi/carbon/plans` |
| `import-placeholder` | `/fi/carbon/plans/mock-local-plan` |
| `plan-valid` | `/fi/carbon/plans/mock-local-plan` |
| `plan-invalid-zoning` | `/fi/carbon/plans/mock-invalid-plan` |
| `plan-invalid-land-use` | `/fi/carbon/plans/mock-invalid-plan` |
| `calc-not-started` | `/fi/carbon/plans/mock-server-plan` |
| `calc-initializing` | `/fi/carbon/plans/mock-server-plan` |
| `calc-calculating` | `/fi/carbon/plans/mock-server-plan` |
| `calc-errored` | `/fi/carbon/plans/mock-server-plan` |
| `calc-finished` | `/fi/carbon/plans/mock-server-plan` |
| `areas-valid` | `/fi/carbon/plans/mock-local-plan/areas` |
| `areas-invalid-zoning` | `/fi/carbon/plans/mock-invalid-plan/areas` |
| `areas-invalid-land-use` | `/fi/carbon/plans/mock-invalid-plan/areas` |
| `report-single-local` | `/fi/carbon/report?mockReset=1&mockCarbonState=report-single-local&planIds=mock-plan-local&prevPageId=mock-local-plan&prevPageStep=areas` |
| `report-comparison` | `/fi/carbon/report?mockReset=1&mockCarbonState=report-comparison&planIds=mock-plan-local,mock-plan-comparison&prevPageId=mock-local-plan&prevPageStep=areas` |
| `report-external` | `/fi/carbon/report?mockReset=1&mockCarbonState=report-external&planIds=mock-external-plan` |
| `report-invalid-id` | `/fi/carbon/report?mockReset=1&mockCarbonState=report-invalid-id&planIds=mock-invalid-plan` |
| `report-no-data` | `/fi/carbon/report?mockReset=1&mockCarbonState=report-no-data&planIds=mock-plan-invalid&prevPageId=mock-invalid-plan&prevPageStep=plan` |

Smoke-useful extra states:

```text
/fi/carbon/plans/mock-local-plan?mockReset=1&mockCarbonState=save-ready&mockAuth=authenticated
/fi/carbon/plans/mock-local-plan?mockReset=1&mockCarbonState=save-saved&mockAuth=authenticated
/fi/carbon/plans/mock-local-plan?mockReset=1&mockCarbonState=save-login&mockAuth=unauthenticated
/fi/carbon/plans/mock-local-plan?mockReset=1&mockCarbonState=save-disabled&mockAuth=authenticated
```

API-backed external report comparison:

```text
/fi/carbon/report?mockReset=1&mockCarbonState=report-single-local&planIds=mock-plan-local,mock-external-report&prevPageId=mock-local-plan&prevPageStep=areas
```

## Canonical And Legacy Paths

Primary checks should use canonical carbon paths:

```text
/fi/carbon
/fi/carbon/plans
/fi/carbon/plans/<planId>
/fi/carbon/plans/<planId>/areas
/fi/carbon/report
```

Legacy checks should only verify redirects:

```text
/fi/hiilikartta -> /fi/carbon
/fi/hiilikartta/kaavat/mock-local-plan -> /fi/carbon/plans/mock-local-plan
/fi/hiilikartta/kaavat/mock-local-plan/alueet -> /fi/carbon/plans/mock-local-plan/areas
/fi/raportti?... -> /fi/carbon/report?...
```
