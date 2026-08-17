---
name: component-refactor
description: Use when refactoring or migrating an individual component and needing before/after fixture visual checks with the component fixture harness.
---

# Component Refactor

Use this skill for component migrations and focused refactors that need an
isolated before/after visual check. The harness lives at
`/en/dev/component-fixtures` in development and is intentionally outside the map
shell unless a fixture explicitly adds its own providers.

## When To Add Or Update A Fixture

Create or update a fixture before changing a component when the refactor can
affect rendering, layout, styling, focus state, disabled state, loading state,
or open/closed UI. Keep fixtures narrow: render one component in one named
state per URL.

Use meaningful state IDs such as `placeholder`, `empty`, `open`, `selected`,
`disabled`, `focused`, `error`, `loading`, `modal-open`, or a component-specific
name that is clearer for reviewers.

Do not migrate or redesign a component just to add the fixture. Do not edit
generated files under `i18n/`, and do not add Tolgee keys for dev-only fixture
labels.

## Add A Fixture

1. Add fixture metadata to
   `src/common/component-fixtures/manifest.json`.
2. Add or update the render definition under
   `src/common/component-fixtures/fixtures/`.
3. Register the fixture in
   `src/common/component-fixtures/registry.tsx`.
4. Include component implementation paths in `sourceGlobs`, for example:
   `src/components/common/LayerToggleRow.tsx`.
5. Keep fixture setup deterministic: no random data, timestamps, remote calls,
   or state that leaks through storage between screenshots.

Each rendered fixture page must expose
`data-testid="component-fixture-ready"` through `ComponentFixtureFrame`, plus
`data-component-fixture-id` and `data-component-fixture-state`.

## Capture Baselines

Run visual commands inside the project `app` container so
`http://127.0.0.1:6900` is the correct dev-server URL. Always reuse the existing
server and pass `--no-start`.

```bash
docker compose -f /workspace/project/docker-compose.dev.yml --project-directory /workspace/project exec app sh -lc 'cd /app && yarn visual:baseline -- --no-start --scenario-set component-fixtures'
```

Baselines under `.dev/visual-regression/baseline/` are local artifacts. Do not
commit them unless a later feature explicitly changes that policy.

## Compare After Editing

Use `visual:after-edit` for changed-file targeting:

```bash
docker compose -f /workspace/project/docker-compose.dev.yml --project-directory /workspace/project exec app sh -lc 'cd /app && yarn visual:after-edit -- --no-start --scenario-set component-fixtures src/components/common/LayerToggleRow.tsx'
```

Or use the lower-level changed runner with comma-separated files:

```bash
docker compose -f /workspace/project/docker-compose.dev.yml --project-directory /workspace/project exec app sh -lc 'cd /app && yarn visual:changed -- --no-start --scenario-set component-fixtures --files src/components/common/LayerToggleRow.tsx'
```

If the only failure is `missing-baseline`, generate local component-fixture
baselines first, then rerun the changed check. Do not start or stop `yarn dev`
from an agent session.

## Inspect Artifacts

The runner writes the latest report to:

```text
.dev/visual-regression/report/latest.json
```

Screenshots and diffs are grouped by scenario:

```text
.dev/visual-regression/baseline/<scenario-id>/desktop.png
.dev/visual-regression/baseline/<scenario-id>/mobile.png
.dev/visual-regression/current/<scenario-id>/desktop.png
.dev/visual-regression/current/<scenario-id>/mobile.png
.dev/visual-regression/diff/<scenario-id>/<viewport>.png
```

Confirm the selected scenarios are component fixtures and not broad route
captures. Report any visual discrepancies by fixture ID, state ID, viewport,
and whether the difference is expected or needs follow-up.

## Reviewer Checklist

- The fixture covers the states that could regress in the refactor.
- `sourceGlobs` point at the component files so targeted visual checks select
  the right fixture states.
- The changed comparison passes after baseline capture, or discrepancies are
  documented with artifact paths.
- No product navigation links to the dev fixture route were added.
- No generated translation JSON files were edited.
