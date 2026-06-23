# TanStack Start Shell Notes

This folder is Start-only scaffolding for the F048 migration.

- `StartShellProviders` mounts a temporary Tolgee bridge before notifications.
  It provides the current URL locale with empty sentinel records for the
  `avoin-map`, `fi-forests`, and `energiakartta` namespaces so public map
  applet wrappers can render and missing keys still surface. Full static-data,
  SSR, and live-update behavior belongs to
  `F048.5-tolgee-start-integration`.
- `StartShellProviders` includes a temporary unauthenticated NextAuth
  `SessionProvider` so shared public map components that call `useSession()` can
  render. Real auth/session behavior belongs to
  `F048.4-better-auth-session-migration`.
- Unmigrated routes keep using the Next provider stack in
  `src/app/[locale]/layoutClient.tsx`, including NextIntl, NextAuth, the shared
  theme, notifications, and the existing Next query client singleton.
- `StartMapShell` reuses the current client map layout so migrated public map
  routes mount MapLibre, sidebar slots, user/UI state handlers, login modal, and
  confirmation dialogs. The Start auth/Tolgee providers above are still
  temporary bridges owned by later F048 features.
- `vite.start.config.mts` aliases `next/image` to a Start-only `<img>` shim and
  aliases `#/common/navigation/navigation` to a TanStack Router adapter. Full
  Next wrapper and navigation parity belongs to `F048.6` and later `F048.3`
  siblings.
- `vite.start.config.mts` defines loaded `NEXT_PUBLIC_*` environment variables
  for Start client code. This is a temporary Next-public-env compatibility
  bridge for migrated shared map layers and shell UI; full build/deploy parity
  belongs to `F048.8`.
- `vite.start.config.mts` also aliases `maplibre_symbol_utils` to the package's
  ESM entry because the package `main` bundle expects a browser-global
  `maplibregl` during Start SSR.
- `StartMapShell` imports `configureMapLibreWorker`, which points MapLibre at
  the package's emitted CSP worker asset. This avoids the default inlined worker
  bundle used by the Vite/Start build, which currently drops a class-field
  helper required by vector-tile parsing.
