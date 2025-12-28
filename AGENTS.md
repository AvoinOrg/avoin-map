# AGENTS

## Repository overview
Avoin Map is a map-based web app built on Next.js. The codebase contains a core
map experience plus multiple applets that can run inside the main app or as
standalone sites.

## Top-level structure
- `src/app`: Next.js App Router entries (routes, layouts, API handlers).
- `src/app/[locale]/(map)/(applets)`: Applet roots.
- `src/app/[locale]/(map)/(applets)/(main)`: Main app pages/components.
- `src/components`: Shared UI and map components.
- `src/common`: Shared hooks, routing, store, types, and utilities.
- `utils/scripts`: Build-time helpers (translations, applet prebuild, redirects).

## Applets and build modes
- Applets live under `src/app/[locale]/(map)/(applets)/<namespace>`.
- `APPLET=<namespace> yarn build-applet` runs `utils/scripts/prebuildApplet.js`
  to keep only one applet, update `tsconfig` aliases, and rewrite applet import
  paths.
- `NEXT_PUBLIC_COMPILED_APPLETS` controls which applets are compiled. If only
  one applet (and not `main`) is compiled, the app runs in standalone mode.
- `localeConf.json` declares applets, their locales, and optional domains.

## Routing
- Next.js folder routing applies; folders in parentheses are route groups and
  do not appear in the URL.
- Route trees live in `src/common/routing/routes/*.ts` and are converted into
  pathnames in `src/common/navigation/navigation.ts`.
- Use `getRoute`/`MutableLink` for applet-aware links instead of hardcoding
  paths.
- `src/middleware.ts` normalizes locale and applet routing, handling standalone
  applets and domain-based URLs.

## Assets and API copying
- `next.config.js` uses CopyPlugin to copy:
  - `src/public/**/*` into `public/files/*`
  - `src/app/**/public/**/*` into `public/files/<applet>/*`
  - `src/app/(ui)/**/api/**/*` into `src/app/api/<applet>/*`
- `public/` and generated `src/app/api/*` entries are gitignored.
- Avoid dynamic API routes like `[id]` in applet API folders (CopyPlugin
  limitation).

## Localization
- Tolgee powers translations. Applet namespaces and locales are defined in
  `localeConf.json`.
- `utils/scripts/downloadTranslations.js` downloads translation files into
  `i18n/` based on `localeConf.json` (requires `TOLGEE_API_URL` and
  `TOLGEE_API_KEY`).
- Prefer the Tolgee browser plugin (Alt+click) for editing keys.

## State and data
- Zustand manages client state. The map store is sliced under
  `src/common/store/mapStore`, and applets keep their own stores in their
  folders.
- Queries are handled via TanStack Query.

## Map and styling
- Map rendering uses MapLibre GL JS.
- Layer configs live in `src/components/Map/layers` plus applet-specific layer
  definitions.
- Styles use MapLibre/Mapbox expression syntax for dynamic styling.

## Auth
- Auth uses NextAuth with a Zitadel issuer.
- Core auth endpoints live in `src/app/api/auth` and `src/app/api/userinfo`.

## Code style
- Prefer `const` arrow functions.
- Use object params for functions with more than two arguments.
- Keep types in `src/common/types` or applet-specific `common/types`.
- Use path aliases (`#/*`, `applets/*`, `@i18n/*`) instead of deep relative
  imports.

## Tests
- Jest is configured, but coverage is limited (routing has unit tests).
- Applet-specific e2e tests are not standardized yet.
