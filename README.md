# Avoin Map

A map-based web app for visualizing sustainability-related data. The app is
available at https://map.avoin.org.

## Development

The app uses Next.js (App Router) and runs via Docker Compose.

Create `.env` from `.env.template`, then set at least:

```bash
# Map data source.
NEXT_PUBLIC_GEOSERVER_URL=https://gis.example.org/geoserver

# Tolgee runtime config (used in the client).
NEXT_PUBLIC_TOLGEE_API_URL=
NEXT_PUBLIC_TOLGEE_API_KEY=

# Tolgee export API (used by utils/scripts/downloadTranslations.js).
TOLGEE_API_URL=
TOLGEE_API_KEY=
```

If you need auth flows, also set:

```bash
NEXT_PUBLIC_ZITADEL_ISSUER=
ZITADEL_CLIENT_ID=
ZITADEL_CLIENT_SECRET=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
```

Run the app:

```bash
docker compose up
```

The app serves on `http://localhost:3000` unless `DEV_PORT` overrides it.

## App structure

- `src/app`: Next.js App Router entries (routes, layouts, API handlers).
- `src/app/[locale]/(map)/(applets)`: Applet roots.
- `src/app/[locale]/(map)/(applets)/(main)`: Main app pages/components.
- `src/common`: Shared hooks, routing, store, types, utilities.
- `src/components`: Shared UI and map components.
- `utils/scripts`: Build-time helpers (translations, applet prebuild, redirects).

## Applets and build modes

Applets are self-contained apps that reuse shared map components but keep their
own pages, stores, and layer configs. They can run inside the main app or as
standalone deployments.

- `APPLET=<namespace> yarn build-applet` runs `utils/scripts/prebuildApplet.js`
  to keep a single applet, rewrite import paths, and update `tsconfig` aliases.
- `NEXT_PUBLIC_COMPILED_APPLETS` controls which applets are compiled. If only
  one non-`main` applet is compiled, the app runs as a standalone site.
- `localeConf.json` defines applet namespaces, locales, and optional domains.
- `utils/scripts/writeNetlifyRedirects.js` uses `localeConf.json` to generate
  Netlify `_redirects` rules for applet domains.

## Routing and navigation

- Next.js folder routing applies; route groups in parentheses do not appear in
  the URL.
- Route trees in `src/common/routing/routes/*.ts` power `getRoute` and
  `MutableLink` for applet-aware paths.
- `src/middleware.ts` normalizes locale and applet routing and supports
  standalone applets or domain-based URLs.

## Assets and API copying

`next.config.js` copies:
- `src/public/**/*` into `public/files/*`
- `src/app/**/public/**/*` into `public/files/<applet>/*`
- `src/app/(ui)/**/api/**/*` into `src/app/api/<applet>/*`

`public/` and generated `src/app/api/*` entries are gitignored. Avoid dynamic
API route segments (like `[id]`) in applet API folders due to webpack
limitations.

## State, data, and map

- Map rendering uses MapLibre GL JS.
- UI components and styling are built with MUI (Material UI); prefer the `sx`
  prop for styling over separate style sheets when possible.
- State is managed with Zustand; the map store is split into slices and applet
  stores live in their applet folders.
- Data fetching uses TanStack Query.

## Localization

- Tolgee provides translations; namespaces and languages live in
  `localeConf.json`.
- `utils/scripts/downloadTranslations.js` generates `i18n/*` during prebuild.
- The Tolgee browser plugin (Alt+click) is the preferred editing workflow.

## Auth

Authentication uses NextAuth with a Zitadel issuer. Core auth routes live in
`src/app/api/auth` and `src/app/api/userinfo`.

## Tests

Tests are currently light. Routing has unit tests, but applet-specific e2e
coverage is not standardized yet.
