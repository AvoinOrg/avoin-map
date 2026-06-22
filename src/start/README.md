# TanStack Start Shell Notes

This folder is Start-only scaffolding for the F048 migration.

- `StartShellProviders` mounts a temporary Tolgee bridge before notifications.
  It only provides `en` and the `avoin-map` namespace with empty static data so
  `@tolgee/react` hooks can render and missing keys surface. Full locale,
  static-data, SSR, and live-update behavior belongs to
  `F048.5-tolgee-start-integration`.
- `StartShellProviders` includes a no-op auth bridge. Start currently renders
  unauthenticated shell placeholders only; real auth/session behavior belongs to
  `F048.4-better-auth-session-migration`.
- Unmigrated routes keep using the Next provider stack in
  `src/app/[locale]/layoutClient.tsx`, including NextIntl, NextAuth, the shared
  theme, notifications, and the existing Next query client singleton.
- `StartMapShell` is a placeholder for the shared map-shell shape. The real
  MapLibre, sidebar, user-state, and applet shell components remain in the Next
  route tree until later route/auth/wrapper migration work owns them.
