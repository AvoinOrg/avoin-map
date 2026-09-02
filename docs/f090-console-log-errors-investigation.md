# F090: main-page console error provenance

## Tested environment

- Branch: `v2`
- Commit under test: `f72baf0c1f70fa758d70d994e32ccfb088683f56`
- Test date: 2026-09-02 (UTC)
- Build mode: the existing TanStack Start development server
- `PUBLIC_COMPILED_APPLETS`: `main,energy,carbon,luonnonmetsakartat,ui-baseline`
- Raw-response URL: `http://127.0.0.1:6900/en`
- Browser URL: `http://localhost:6900/en`
- Browser: Google Chrome 151.0.7922.71, headless throwaway context with
  `--disable-extensions`
- React / React DOM: `^19.2.5`
- TanStack Start / Router: `1.131.50`

The page was loaded from the stable, already-running development server. No
replacement server was started or stopped for this investigation.

## Server HTML

On 2026-09-02 at 13:59 UTC, a redirect-following request returned HTTP 200 and
the response began as follows:

```html
<!DOCTYPE html><html lang="en" class="font-arimo-variable"><head>
```

The root `<html>` element delivered by the application therefore had exactly
the `lang` and `class` attributes. It did not have
`suppresshydrationwarning` or `data-qb-installed`.

The response does contain `suppressHydrationWarning` in serialized TanStack
router data for a development script element. That is a separate React
property on a `<script>` and is not the lowercase, unexpected attribute shown
on `<html>` in the reported hydration diff.

## Application and loaded-module audit

The tracked application source was searched for the two attributes and for
extension messaging APIs:

```text
suppress[hH]ydration[wW]arning
data-qb-installed
runtime.lastError
chrome.runtime
browser.runtime
runtime.sendMessage
runtime.connect
```

No tracked application source match was found (excluding the archived
`legacy/` tree). The document owner in `src/routes/__root.tsx` renders only the
locale-derived `lang` and font `className`, and `src/client.tsx` hydrates the
whole document.

A clean browser load recorded 250 same-origin resources and fetched the 249
text resources among them. None contained `data-qb-installed` or any of the
messaging API expressions above. Case-insensitive matches for
`suppressHydrationWarning` occurred only in the HTML's development-script
metadata and framework/library implementations in React DOM, TanStack Router,
and MUI. No loaded module authored the reported lowercase root attribute.

## Controlled browser matrix

| Context | Reloads | Final `<html>` attributes | Matching console entries | Other error entries | Functional signal |
| --- | ---: | --- | --- | --- | --- |
| Throwaway Chrome context, extensions disabled | 3 | `class`, `lang` on every load | None | None | HTTP 200, document complete, body height 720 px, one map canvas, title `Avoin Map` |
| Same clean context with a test-only pre-hydration mutation | 1 | `class`, `lang`, `suppresshydrationwarning`, `data-qb-installed` | React emitted the same root hydration mismatch and listed both extra attributes | None besides that React diagnostic | HTTP 200 and document complete |
| Affected/user Chrome profile | Pending | Pending | Pending | Pending | The configured host Chrome endpoint was not running, and this session did not expose the installed Chrome-control bridge |

The three clean observations started at 14:02:03, 14:02:08, and 14:02:14 UTC,
with a five-second post-load observation window each. The controlled mutation
ran at 14:03 UTC using a throwaway browser initialization hook; it was not added
to application code. Its console source was React DOM's development bundle at
`node_modules/.vite/deps/react-dom_client.js`, line 4072. This demonstrates that
adding the reported attributes before React loads is sufficient to produce the
reported component diff.

The affected-profile attempt used the checked-in
`yarn browser:live:host:check` connection path. It failed with
`ECONNREFUSED 172.17.0.1:9222`; no existing profile, tabs, history, or extension
inventory was read or changed.

## Per-message classification

| Reported entry | Classification | Evidence | Confidence / remaining proof |
| --- | --- | --- | --- |
| Root hydration mismatch for `suppresshydrationwarning` and `data-qb-installed` | External pre-hydration DOM mutation; not app-owned | Raw SSR and three clean hydrated documents omit both attributes; tracked source and all loaded text modules omit `data-qb-installed`; injecting only the two attributes before hydration reproduces the same React diff | High confidence in external ownership. The exact browser extension must still be identified from the affected profile's source/stack or a user-controlled disable/re-enable comparison. |
| `Unchecked runtime.lastError: Could not establish connection. Receiving end does not exist.` | Browser-extension/runtime messaging noise; not app-owned in the tested application | It is absent on three clean loads, and neither tracked source nor any loaded text module invokes `chrome.runtime`, `browser.runtime`, `runtime.sendMessage`, or `runtime.connect` | High confidence in external ownership. Capture the expanded `chrome-extension://...` source in the affected profile to attribute a specific extension. |
| Rejected promise with `Could not establish connection. Receiving end does not exist.` | Browser-extension/runtime messaging noise; not app-owned in the tested application | It is absent on three clean loads, including all `pageerror` events, and the loaded application has no extension-messaging call site | High confidence in external ownership. Capture its expanded async stack in the affected profile to confirm that it follows the same external actor. |

`installHook.js` and the console label `en:1` are not treated as owners. They
are presentation/source clues only; the controlled comparison and actual
loaded call sites determine ownership.

## Implementation decision

No application-runtime change is warranted. In particular, this investigation
does not add `suppressHydrationWarning`, copy the lowercase attribute into JSX,
strip attributes inserted by another actor, patch the console, or filter global
errors. Any of those changes would hide a useful React diagnostic without
repairing its source.

For an affected user profile, the next environment action is to use the
expanded console source/stack to identify the emitting extension and then have
the user disable/re-enable or update that extension. Product code should not
special-case it.

## Checks

- Raw HTTP response captured with redirects followed and its root attributes
  inspected.
- Tracked source audit completed.
- Loaded same-origin text-module audit completed (249 resources).
- Three extension-free live loads completed with console and page-error
  capture.
- Test-only pre-hydration reproduction completed.
- `yarn start:typecheck`: passed with no diagnostics on 2026-09-02.
- Product-code regression test: not applicable because no app-owned defect or
  app code change was found.

## Reviewer sign-off

Pending. The reviewer must test the final candidate commit in the running app,
repeat the clean hard-reload control, and inspect the affected profile. The
review record must include the source URL/stack for both messaging entries and
either identify the extension or reject the external-ownership conclusion.
The reviewer must also confirm that the main page remains usable and that no
React diagnostic was suppressed.

## Branch propagation

At investigation start, `v2` and `luonnonmetsakartat` both pointed to
`f72baf0c1f70fa758d70d994e32ccfb088683f56`. `carbon` was an ancestor of `v2`
and moving it to `v2` would be a 3,215-commit fast-forward. The remote, checked
again over HTTPS on 2026-09-02, contains no branch named `energy`; it contains
`energiakartta`, which is not being treated as an implicit substitute.

Propagation is intentionally pending the independent review gate. After a
reviewed final `F090_SHA` exists, update `luonnonmetsakartat` and `carbon`, then
record before/after SHAs and ancestry checks here. The `energy` acceptance item
remains blocked until the exact target branch is supplied or `energiakartta` is
explicitly confirmed. No branch has been pushed.
