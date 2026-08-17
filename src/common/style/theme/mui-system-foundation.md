# MUI System Foundation (F047.3)

This feature provides the shared MUI System typing surface used by migrated UI
code to consume `sx` and System primitives without depending on full Material
UI.

## Shared values in scope

- `@mui/system` primitives use the app theme produced by
  `src/common/style/theme/theme.ts`.
- Palette tokens (`neutral`), typography variants (`h7`, `body7`), custom
  breakpoints (`mobile`, `desktop`), shape (`borderRadius: 0`), shadows
  (disabled), and z-index values are shared through the MUI System theme
  context.
- `zIndex` now includes `popup` in runtime theme data so `theme.zIndex.popup` consumers keep working.

## Compatibility notes

- Full Material UI packages, Material component overrides, Material baseline,
  and the Material Next.js cache provider are no longer part of the retained app
  shell.
- Base UI/System components and other non-Material UI primitives are
  unstyled/headless and must be styled explicitly via `sx`/system classes/slots.
- Emotion remains installed only where required by MUI System/styled-engine or
  directly used by retained code.

## F047.14 final cleanup proof

- Retained-code cleanup scans cover `src`, `utils`, package/config files, and
  app build inputs. The archival `legacy/` tree is excluded from current
  `tsconfig.json` app builds; any broad full-MUI matches there are false
  positives unless that tree is explicitly reactivated.
- The final migration-baseline visual run is accepted with changed screenshots
  across the 9 scenario / 18 viewport set. The current captures are nonblank
  and coherent, and the remaining diffs are treated as Base UI + MUI System
  migration baseline drift rather than F047.14 product regressions.
- Visual baselines were not updated in F047.14. A follow-up baseline
  review/refresh remains queued in orchestration notes after the migration is
  accepted.
