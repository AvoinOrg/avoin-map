# F074 Migration Residue Cleanup Results

Date: 2026-07-11

This is the retained completion record for the F074 cleanup family. It is not
current operating guidance and does not replace the superseded temporary
migration audit. Use `README.md`, `AGENTS.md`,
`docs/tanstack-start-route-conventions.md`, and
`docs/tanstack-start-dual-stack.md` for current development instructions.

## Parent MR disposition

| Item | Disposition | Revalidated result |
| --- | --- | --- |
| MR-01 | Completed by F074.5 | Active documentation now describes the retained TanStack Start ownership and routing model. Removed `src/app`, route-scaffold, `MutableLink`, and removed public-route guidance is no longer presented as current. Executable residue remains in `jest.config.ts` and the sidebar smoke helper; those hits belong to earlier siblings' tooling/route boundaries and are reported below rather than edited by this documentation child. |
| MR-02 | Already resolved by F069 | `src/routes/-helpers/scaffoldLabels.ts` is absent and active retained source contains no `scaffoldLabels` reference. F074 did not recreate or churn the helper. |
| MR-03 | Already resolved by F069 | `src/components/Sidebar/sidebarSpacing.ts` is absent, active retained source contains no `sidebarSpacing` reference, and the retained shared sidebar constants live in `src/common/style/theme/constants.ts`. |
| MR-04 | Completed and revalidated | The obsolete `utils/scripts/prebuildHiilikartta.js` stub is absent. Active scripts and instructions use the shared build pipeline. |
| MR-05 | Completed and revalidated | `package.json` uses the `avoin-map` metadata, has no CRA `browserslist`/Babel configuration or obsolete favicon script, and no longer declares the audited direct CRA/Webpack/Babel packages. The proven-unused `ol` and `ol-mapbox-style` dependencies are also absent. |
| MR-06 | Completed by F074.1 | Retained map source uses MapLibre only. Unsupported hybrid/OpenLayers modes, branches, helpers, imports, and `.ol-*` styling are absent; active GeoPackage behavior remains. |
| MR-07 | Completed by F074.3 and F074.4, documented by F074.5 | Public route facts come from `appletConf.json.publicRoute` through the shared public-route contract. Active public variables use `PUBLIC_*`, server credentials remain server-only, and `PUBLIC_COMPILED_APPLETS` is the shared main/standalone selection input. |
| MR-08 | Deferred by the parent decision | Auth/session/userinfo compatibility cleanup was not implemented. `/api/userinfo` and the retained auth compatibility surface remain outside F074. |
| MR-09 | Approved partial cleanup completed by F074.3 | Luonnonmetsakartat has no legacy subpath redirect facts or legacy-only route files; tests retain negative/pass-through coverage for the removed paths. Carbon's ordered legacy subpath redirects remain unchanged as explicitly required. |
| MR-10 | Completed and revalidated | `LoadingSpinnerOld.tsx` and the `legacy-ellipsis` fixture state are absent, with no active references. |
| MR-11 | Completed by F074.1 | The obsolete global stylesheet and its OpenLayers, App.css-question, and stale font-default residue are absent. Current Arimo theme/reset and accessibility behavior remain. |
| MR-12 | Completed and revalidated | The deleted `src/app/(ui)` source and `assertNoStaleUiApiCopySource` build guard are absent. Active documentation no longer describes that guard or copy path as current. |

## Final active-reference audit

The final search covered tracked documentation, hidden instructional files such
as `.devcontainer/**`, and retained executable areas.
It excluded archival or generated areas where old evidence is intentionally
non-actionable: `legacy/**`, `i18n/**`, generated `public/**` and build outputs,
dependencies, `.tmp/**`, and `.codex-orch/**`.

Searches covered the removed `src/app` tree and `(ui)` copy guard, the initial
`src/common/routing/routes` scaffold, `getRoute`, `MutableLink`, old public-env
prefixes, applet-specific prebuild command variants, old applet source folder
names, removed public slugs, Next webpack module identifiers,
scaffold/handoff wording, and applet-domain routing ownership. The dispositions
are:

- Active documentation was corrected to the retained Start architecture and
  current build/routing contracts.
- `docs/f048-8-netlify-build-deploy-report.md` intentionally retains old
  public-prefix command transcripts as dated evidence and is prominently
  marked historical and superseded.
- `docs/tmp-applet-component-duplication-audit.md` intentionally retains its
  dated pre-rename path catalogue and is marked historical and superseded. No
  F070.3 component migration was performed.
- `jest.config.ts` still maps `map/*` to the absent
  `src/app/[locale]/(map)/*` tree. This is executable tooling residue in
  F074.2's exact boundary. F074.5 reports it to that sibling/manager and does
  not silently broaden a documentation-only change.
- `agents/skills/sidebar-route-smoke/scripts/sidebar-route-smoke.js` remains an
  executable helper with removed `/fi/energiakartta` and `/fi/hiilikartta`
  route defaults/scenarios, references to the deleted
  `src/applets/energiakartta/state/appletStore.ts`, and Next
  `app-pages-browser`/webpack module-ID assumptions. The active skill prose now
  uses explicit canonical routes and warns readers not to use the stale
  built-in scenarios, but changing the helper would alter executable test
  tooling and is outside this documentation child's boundary. Route-default
  reconciliation is reported to the F074.3/manager boundary; deleted module
  paths and Next runtime assumptions are reported to the F074.2/manager tooling
  boundary.
- The active `agents/skills/carbon-mock-browser-smoke/SKILL.md` instructions now
  describe only the retained ordered Carbon subpath redirects beneath the
  canonical `/fi/carbon` root. They explicitly treat the removed
  `/fi/hiilikartta` root and descendants as unrecognized paths.
- The active host-Chrome launcher example under `.devcontainer/host-tools/`
  now opens the retained `/fi/carbon` route instead of the removed
  `/fi/hiilikartta` root.
- After those classifications, no other active instructional match from the
  F074.5 search set requires action in this child's boundary.

## Explicit exclusions confirmed

- MR-08 remains deferred.
- Carbon legacy redirects remain in `appletConf.json.publicRoute` and were not
  removed or expanded.
- The separate F070.3 applet-component migration was not performed.
- Generated translation JSON under `i18n/**`, generated outputs, archival
  `legacy/**`, product behavior, route compatibility, and the settled
  environment/build contract were not changed by F074.5.
- `docs/tmp-migration-residue-audit.md` was not recreated.
