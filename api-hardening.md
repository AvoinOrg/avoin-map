# API Hardening Plan

Date: 2026-03-04  
Status: Planning document (framework paths refreshed for TanStack Start)
Scope: Avoin Map frontend repo + Netlify deployment + Python backends behind Traefik/Dokploy + GeoServer behind Traefik

## 1. Goal and constraints

### 1.1 Goal

Make backend abuse materially harder by ensuring backend services are primarily callable through the frontend app path and by layering request verification, quotas, and anti-automation controls.

### 1.2 Constraints we are designing for

1. Public anonymous usage must remain possible for core app usage.
2. Logged-in and anonymous users both exist, so backend trust cannot rely only on user-bound API keys.
3. We accept that this is not perfect prevention; objective is to raise cost, detect abuse early, and reduce backend blast radius.
4. Frontend is hosted on Netlify, and backend services are behind Traefik (managed via Dokploy).

### 1.3 Security posture selected

1. Balanced hardening (high value controls with moderate complexity).
2. Private backend via BFF: browser calls app-domain API routes, not backend hostnames.
3. Challenge only heavy/mutating anonymous operations.
4. Service provenance via signed gateway headers (no mTLS in this phase).
5. Keep GeoServer tiles/glyphs public and direct, with strict Traefik path restrictions and IP-level throttling.

## 2. Current-state summary (from this repo)

1. Applet browser requests use same-origin `/api/hiilikartta` and
   `/api/luonnonmetsakartat` paths; their upstream hosts are configured only by
   the server-side `HIILIKARTTA_API_URL` and `LUONNONMETSAKARTAT_API_URL`.
2. GeoServer URLs are currently exposed to the browser via `PUBLIC_GEOSERVER_URL`.
3. There are existing TanStack Start server routes, but they do not currently
   form a full abuse-control layer:
   1. `src/routes/api/map/core/mml/tms/$z/$x/$y.ts`
   2. `src/routes/api/userinfo.ts`
   3. `src/routes/$locale/api/data.ts` and
      `src/routes/$locale/(map)/_map/(applets)/hiilikartta/api/data.ts`
      (present, but current applet traffic mostly bypasses them)
4. The Start/Nitro server path currently has no dedicated abuse/security
   headers or proxy hardening logic.
5. `netlify.toml` already has deploy contexts but no backend hardening strategy.
6. Public WFS/WMS query access is not required in the target state.

## 3. Target architecture

### 3.1 Request flow after rollout

1. Browser calls same-origin endpoints (`/api/...`) for Python backend operations.
2. TanStack Start server routes (BFF) enforce:
   1. Anonymous session identity cookie
   2. endpoint policy checks (quota, challenge requirement, method/params)
   3. request signing to upstream
3. BFF forwards only allowlisted upstream targets through private Traefik routes.
4. GeoServer tiles/glyphs are fetched directly from GeoServer public endpoints, but only through narrow Traefik allowlisted paths with IP throttling.
5. Python backends verify provenance and reject direct/unsigned traffic.
6. Traefik applies network and rate controls before app workloads are hit.

### 3.2 Trust boundaries

1. Browser is untrusted.
2. Netlify BFF is trusted to sign and route.
3. Traefik is trusted to strip spoofed trust headers and enforce perimeter policy.
4. Python backend services trust only signed requests from BFF path.
5. GeoServer public tile/glyph endpoints are protected by path restrictions + throttling, not by trust headers.

## 4. Ownership split

### 4.1 This repo (TanStack Start app, hosted on Netlify)

Implement BFF routes, client migration, challenge integration, policy engine, and env changes.

### 4.2 Netlify

Configure env vars/secrets, deploy contexts, logs/alerts, and operational controls for BFF execution.

### 4.3 Python backend stack (Traefik + Dokploy + Python apps)

Enforce network isolation, request provenance verification, replay protection, and endpoint quotas.

### 4.4 GeoServer stack (Traefik + GeoServer)

Expose only required public tile/glyph paths, deny unneeded OGC/admin paths, and enforce IP-level throttling at Traefik.

## 5. Step-by-step plan by owner

## 5A. This repo (frontend + BFF code)

### Step A1: Create a single abuse policy module

1. Add `src/common/server/security/abusePolicy.ts` with explicit policy classes:
   1. `public_read`
   2. `public_expensive_read`
   3. `anonymous_write`
   4. `auth_user_write`
   5. `admin_write`
2. Define per-policy defaults:
   1. rate limit buckets (per minute and per hour)
   2. max body size
   3. challenge required flag
   4. auth required flag
3. Include endpoint-to-policy mapping in code (not in ad-hoc route logic).

### Step A2: Add server-side abuse primitives

1. Add `src/common/server/security/identity.ts`:
   1. derive identity key from `userId` if logged in
   2. otherwise from anonymous session cookie + IP hash + UA hash
2. Add `src/common/server/security/session.ts`:
   1. issue signed anonymous session cookie (`HttpOnly`, `Secure`, `SameSite=Lax`)
   2. TTL 30 days (rolling refresh)
3. Add `src/common/server/security/rateLimit.ts`:
   1. token bucket using Redis (`ABUSE_REDIS_URL`)
   2. fallback in-memory limiter for local dev only
4. Add `src/common/server/security/challenge.ts`:
   1. Turnstile token verification helper
   2. strict hostname and action verification
5. Add `src/common/server/security/signing.ts`:
   1. HMAC canonical signing for upstream calls
   2. request nonce and timestamp generation
   3. body hash support for non-empty payloads

### Step A3: Add API entrypoints for session/challenge

1. Create `src/routes/api/security/session.ts`:
   1. `POST` ensures anonymous session cookie exists
   2. return session metadata (no secrets)
2. Optionally create `src/routes/api/security/challenge/verify.ts` for client pre-verification (if needed), otherwise verify in write route handlers directly.

### Step A4: Implement hiilikartta BFF routes

1. Create proxied routes under `src/routes/api/hiilikartta/...` for:
   1. `GET/PUT/DELETE /plan`
   2. `GET /plan/external`
   3. `GET /user/plans`
   4. `GET/POST /calculation`
2. In each route:
   1. enforce method allowlist
   2. validate allowed query params
   3. apply policy from `abusePolicy.ts`
   4. require challenge for anonymous heavy writes (`POST /calculation`, and any other heavy anonymous mutator)
   5. forward to `HIILIKARTTA_API_URL` with signed headers

### Step A5: Implement luonnonmetsakartat BFF routes

1. Create proxied routes under `src/routes/api/luonnonmetsakartat/...` for:
   1. `/layers`
   2. `/layer/:id`
   3. `/layer/:layerId/area/:featureId`
   4. `/admin/validate`
2. Enforce:
   1. admin/auth requirement for mutating admin routes
   2. strict payload and query validation
   3. signed upstream forwarding

### Step A6: Keep GeoServer direct in frontend, and remove Geo proxy scope

1. Keep `PUBLIC_GEOSERVER_URL` as the browser-facing host for tiles/glyphs.
2. Do not add generic `src/routes/api/geoserver/...` proxy routes in this phase.
3. Frontend-side guardrails:
   1. lock source templates to tile/glyph paths only
   2. avoid introducing public WFS/WMS query calls
   3. centralize Geo URL template construction so path usage can be audited

### Step A7: Migrate frontend call sites to same-origin API paths

1. Keep browser backend access on the same-origin paths:
   1. `HIILIKARTTA_API_URL` remains server-only behind `/api/hiilikartta`
   2. `LUONNONMETSAKARTAT_API_URL` remains server-only behind
      `/api/luonnonmetsakartat`
2. Keep direct GeoServer URL usage for tiles/glyphs (`PUBLIC_GEOSERVER_URL`) and avoid adding client-side WFS/WMS access.
3. Update relevant files (minimum set currently identified):
   1. hiilikartta query modules under `src/applets/hiilikartta/common/queries/*`
   2. luonnonmetsakartat query modules under `src/applets/luonnonmetsakartat/common/queries/*`
   3. map sources and layer configs using `PUBLIC_GEOSERVER_URL`:
      1. `src/components/Map/MapHandler.tsx`
      2. `src/components/Map/layers/main/Buildings/HelsinkiBuildings/layerConf.ts`
      3. `src/applets/forests/layers/layerConf.ts`
      4. `src/applets/luonnonmetsakartat/common/utils.ts`
      5. `src/applets/luonnonmetsakartat/common/queries/adminFolayerAreaQuery.tsx`
      6. `src/applets/luonnonmetsakartat/common/queries/folayerAreaQuery.tsx`
      7. `src/applets/hiilikartta/layers/vegetationCO2.ts`
      8. `src/applets/hiilikartta/components/CarbonMapGraph/CarbonMapGraphMap.tsx`

### Step A8: Integrate anonymous challenge only where needed

1. Add challenge widget flow in frontend only for endpoints mapped as `anonymous_write`.
2. Inject challenge token in request header/body for those calls.
3. Keep logged-in flows challenge-free by default.
4. Add fallback UX for challenge failure and rate-limit responses (`429`).

### Step A9: Add environment model changes

1. Update `.env.template`:
   1. do not add `PUBLIC_*` aliases for backend upstream URLs
   2. add server-only vars:
      1. `HIILIKARTTA_API_URL`
      2. `LUONNONMETSAKARTAT_API_URL`
      3. `ABUSE_HMAC_SECRET`
      4. `ABUSE_HMAC_KEY_ID`
      5. `ABUSE_ANON_SESSION_SECRET`
      6. `ABUSE_REDIS_URL`
      7. `ABUSE_TURNSTILE_SECRET_KEY`
      8. `PUBLIC_TURNSTILE_SITE_KEY`
      9. `ABUSE_ENFORCE_SIGNED_PROXY`
      10. `ABUSE_ENFORCE_TURNSTILE_ANON_WRITES`
2. Coordinate server-only deployment values without a checked-in public alias.

### Step A10: Add tests and acceptance checks in this repo

1. Unit tests:
   1. canonical signing/verification input format
   2. identity derivation for anon vs authenticated users
   3. rate limiter keying and bucket behavior
2. Route tests:
   1. reject unknown methods/params
   2. challenge required behavior for anonymous writes
   3. reject when upstream host is not allowlisted
3. Integration checks:
   1. app can run without login
   2. map loads with direct GeoServer tile/glyph requests only
   3. no direct Python backend hostname visible in browser network panel
   4. public WFS/WMS paths are not used by frontend

## 5B. Netlify work (platform and operations)

### Step B1: Set Netlify environment variables by context

1. Production context:
   1. set all server-only secrets listed in Step A9
2. Branch deploy/preview context:
   1. set separate non-production secrets and backend URLs
3. Keep applet deploy contexts (`hiilikartta_deploy`, `luonnonmetsakartat_deploy`) aligned with required vars.

### Step B2: Harden secret handling and rotation

1. Rotate existing backend-facing secrets before enforcing signature checks.
2. Use versioned key IDs (`ABUSE_HMAC_KEY_ID`) to support rolling rotation.
3. Keep two valid keys during rotation window (old + new).

### Step B3: Ensure function runtime suitability

1. Run abuse-control BFF handlers in Node runtime where needed (Redis client, crypto libs).
2. Keep edge runtime only for simple read-through cases where feature parity is confirmed.

### Step B4: Logging and alerting for abuse controls

1. Define alerts for sudden increases in:
   1. `403 challenge_required`
   2. `403 invalid_signature`
   3. `429 rate_limited`
   4. `5xx upstream_proxy_error`
2. Export function logs to your central log sink.
3. Add dashboards split by endpoint policy class.

### Step B5: Rollout and rollback controls

1. Use env toggles for staged enforcement:
   1. shadow mode (log only)
   2. enforce mode per endpoint family
2. Keep fast rollback path:
   1. disable strict checks via env var
   2. redeploy only config if possible

## 5C. Python backend side (Dokploy + Traefik + service code)

### Step C1: Remove direct public exposure

1. In Dokploy/Traefik config:
   1. remove public routers that expose backend services directly
   2. keep only internal routes reachable from Netlify BFF ingress path
2. Ensure backend container ports are not publicly published.

### Step C2: Add Traefik perimeter controls

1. Apply middleware on backend routers:
   1. rate limit (global and per-path tiers)
   2. in-flight request cap
   3. request buffering/body size limit
   4. read/write timeout caps
2. Strip inbound trust headers from external traffic:
   1. remove any incoming `X-Avoin-*` before forwarding

### Step C3: Implement backend signature verification middleware

1. Add middleware in each Python service to verify:
   1. required signed headers present
   2. key ID exists
   3. timestamp skew within threshold (for example +/-60s)
   4. nonce not replayed (Redis TTL store)
   5. body hash matches
   6. HMAC signature valid
2. Reject failures early with `403`.
3. Make enforcement toggleable during shadow phase.

### Step C4: Endpoint-level abuse budgets in backend

1. Define backend-side quotas even after BFF checks (defense in depth):
   1. expensive calculations
   2. batch exports
   3. admin writes
2. Enforce per-identity and global ceilings.
3. Add specific cooldown logic for repeated failures from same identity/IP.

### Step C5: Input and execution hardening

1. Validate payload schemas and query params strictly.
2. Set max upload size and zip expansion limits.
3. Add execution timeout for expensive jobs.
4. Add queued job limits and reject when queue is saturated.

### Step C6: Backend observability

1. Emit structured logs containing:
   1. endpoint
   2. policy class
   3. identity type (anon/auth/admin)
   4. decision outcome
   5. reason code
2. Add metrics for rejection categories and queue pressure.

## 5D. GeoServer side (Traefik + GeoServer)

### Step D1: Narrow public GeoServer surface to tile/glyph paths only

1. Keep public only the exact paths required by the app:
   1. tile endpoints used by current map styles (for example `gwc/service/tms/...` or specific WMTS tile path if needed)
   2. glyph endpoint (`/www/font/{fontstack}/{range}.pbf`)
2. Block direct internet access to unneeded endpoints:
   1. `/ows` (including WFS/WMS query usage)
   2. `/wfs`
   3. `/wms`
   4. `/web`
   5. `/rest`
3. Keep GeoServer UI/admin endpoints (`/web`, `/rest`) internal-only.

### Step D2: Apply IP-level throttling at Traefik for public tile/glyph routes

1. Configure per-IP rate limits on tile routes with high but finite burst capacity.
2. Configure stricter per-IP limits for glyph routes (lower volume expected).
3. Add in-flight request caps per IP to reduce concurrency abuse.
4. Add fail2ban or equivalent automated temporary bans for repeated extreme abuse patterns.
5. Do not rely on browser-generated signing secrets for these routes, because client-side secrets are forgeable.

### Step D3: Add soft anti-hotlink controls (advisory, not trust)

1. Add CORS allowlist headers for app origins.
2. Add optional `Origin`/`Referer` checks in Traefik middleware for casual abuse reduction.
3. Treat these checks as bypassable and rely primarily on IP throttling for enforcement.

### Step D4: Tile and cache strategy for safe performance

1. Keep aggressive cache headers for immutable tiles and glyph responses.
2. Use CDN/proxy caching where possible to absorb spikes.
3. Ensure throttling limits are tuned with cache hit rate to avoid harming normal users.

### Step D5: Geo observability and tuning

1. Log route-level metrics for:
   1. top IPs
   2. request rate
   3. `429`/blocked counts
   4. cache hit/miss ratios
2. Review weekly and tune thresholds based on real traffic.

## 6. Rollout timeline and gates

### Phase 0: Preparation (Week 1)

1. Finalize endpoint policy matrix.
2. Implement logging-only decision paths (no blocking).
3. Add required secrets/env vars in Netlify and backend environments.
4. Add signature verification middleware in monitor mode.

Gate: no major false-positive signals in logs for 3-5 days.

### Phase 1: BFF for Python APIs (Week 2)

1. Ship hiilikartta and luonnonmetsakartat BFF routes.
2. Migrate frontend query modules to same-origin API paths.
3. Enable anonymous challenge on heavy writes only.

Gate: no functional regression in anon/auth user flows; rejection rates expected and stable.

### Phase 2: Geo perimeter hardening (Week 3)

1. Apply Traefik path allowlist so only tile/glyph routes are public.
2. Apply IP-level throttling and in-flight limits to tile/glyph routes.
3. Validate map performance baseline after throttling and cache tuning.

Gate: map performance and tile error rates within acceptable baseline.

### Phase 3: Enforce provenance and perimeter (Week 4)

1. Enforce signed-header verification in Python services.
2. Enforce Traefik stripping and public route removal for Python backend ingress.
3. Enforce Geo blocked-path behavior (`/ows`, `/wfs`, `/wms`, `/web`, `/rest`) on public ingress.

Gate: direct Python backend calls fail reliably, disallowed Geo paths fail reliably, and app path remains healthy.

### Phase 4: Tightening and rotation (Week 5+)

1. Rotate signing keys.
2. Tune rate limits based on real traffic.
3. Expand abuse heuristics for repeated offender patterns.

## 7. Acceptance criteria

1. Browser network traffic shows no direct calls to Python backend hostnames.
2. Anonymous user can still use read flows without login.
3. Anonymous heavy writes require and validate challenge token.
4. Direct replay/automation attempts trigger `403`/`429` with correct reason codes.
5. Backends reject unsigned requests even if attacker discovers internal endpoint path.
6. GeoServer public surface is limited to tile/glyph routes, and those routes have active IP-level throttling.
7. Operational dashboards expose abuse decision rates and allow rapid tuning.

## 8. Operational runbook items

### 8.1 Reason codes to standardize

1. `challenge_required`
2. `challenge_invalid`
3. `rate_limited`
4. `signature_missing`
5. `signature_invalid`
6. `nonce_replayed`
7. `timestamp_out_of_window`
8. `param_not_allowed`
9. `upstream_not_allowlisted`
10. `geo_path_blocked`
11. `geo_rate_limited`

### 8.2 Emergency rollback order

1. Disable strict enforcement flags in Netlify env.
2. Re-enable compatibility mode in backend verifier.
3. Keep logs enabled while blocking is relaxed.
4. Investigate false positives and re-enable stepwise.

## 9. Implementation checklist by owner

### Repo checklist

1. Add security utility modules (identity/session/rate/challenge/signing).
2. Implement full BFF routes for hiilikartta and luonnonmetsakartat.
3. Migrate Python backend call sites to same-origin API paths.
4. Keep Geo tile/glyph call sites direct and audit that WFS/WMS are not introduced client-side.
5. Add anonymous challenge to heavy writes.
6. Update `.env.template` with new variables and comments.
7. Add tests for policy, signature, and route enforcement.

### Netlify checklist

1. Configure production and preview secrets.
2. Configure key rotation process.
3. Configure logs and alerts for abuse events.
4. Roll out with env-based shadow/enforce toggles.

### Python backend checklist

1. Remove direct public service exposure.
2. Add Traefik middleware for rate/inflight/body-size/header stripping.
3. Implement signed-header verification middleware.
4. Add replay protection storage.
5. Add endpoint quotas and schema validation.

### GeoServer checklist

1. Remove public direct OGC access.
2. Keep only tile/glyph public paths (`gwc/service/tms` and `www/font` patterns actually used by the app).
3. Enforce IP-level throttling and concurrency limits.
4. Add optional soft anti-hotlink checks (`Origin`/`Referer`) as secondary controls.
5. Tune cache and throttle thresholds from production metrics.
