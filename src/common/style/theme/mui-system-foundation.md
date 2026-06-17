# MUI System Foundation (F047.3)

This feature introduces a shared MUI System typing surface so future migrations can consume
`sx` and System primitives consistently while remaining compatible with existing Material UI usage.

## Shared values in scope

- `@mui/system` primitives now use the existing app theme produced by `src/common/style/theme/theme.ts`.
- Palette tokens (`neutral`), typography variants (`h7`, `body7`), custom breakpoints (`mobile`, `desktop`), shape (`borderRadius: 0`), shadows (disabled), and z-index values are shared through Material's theme context.
- `zIndex` now includes `popup` in runtime theme data so `theme.zIndex.popup` consumers keep working.

## Compatibility notes

- Material-specific `theme.components` overrides and `Mui*` styling APIs only apply to Material components.
  Base UI/System components and other non-Material UI primitives are unstyled/headless and must be styled explicitly via `sx`/system classes/slots.
- `@mui/material-nextjs`, Emotion, `CssBaseline`, and `notistack` wrappers are intentionally kept in place for the migration period.
- Existing direct imports of `@mui/system` remain in a few non-foundation places (for example legacy component implementations) and should be migrated in later slices using this new shared module.
