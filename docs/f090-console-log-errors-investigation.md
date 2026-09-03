# F090: main-page console error provenance

## Tested environment

- Branch: `v2`
- Initial investigation baseline:
  `f72baf0c1f70fa758d70d994e32ccfb088683f56`
- Initial F090 evidence commit:
  `8370906e61bc757ff29a63526628e9e473da2949`
- Final synchronized candidate independently reviewed in the running app:
  `4a1430b84e6962307b45451aa3f59bf17fce5651`
- Test dates: 2026-09-02 (initial investigation) and 2026-09-03
  (independent review)
- Build mode: the existing TanStack Start development server
- `PUBLIC_COMPILED_APPLETS`: `main,energy,carbon,luonnonmetsakartat,ui-baseline`
- Raw-response URL: `http://127.0.0.1:6900/en`
- Browser URL: `http://localhost:6900/en`
- Browser controls: Google Chrome 151.0.7922.71 in an initial throwaway context
  with `--disable-extensions`, followed by independent headed Chromium under
  Xvfb in the existing app container
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
| Initial throwaway Chrome context, extensions disabled | 3 | `class`, `lang` on every load | None | None | HTTP 200, document complete, body height 720 px, one map canvas, title `Avoin Map` |
| Independent reviewer, headed Chromium/Xvfb with extensions disabled | 3 | `class`, `lang` on every load | None | None | HTTP 200, visible MapLibre canvas, and the `Zoom in` control changed the rendered map without adding an error |
| Independent reviewer with a test-only pre-hydration mutation | 1 | `class`, `lang`, `suppresshydrationwarning`, `data-qb-installed` | React emitted the reported root hydration mismatch and listed both extra attributes | None besides that React diagnostic | HTTP 200, document complete, and visible map canvas |
| Affected/user Chrome profile | Unavailable | Not observed | Not observed | Not observed | The configured host Chrome endpoint was not running; no profile or extension state was changed |

The three initial clean observations started at 14:02:03, 14:02:08, and
14:02:14 UTC, with a five-second post-load observation window each. The
independent review repeated three clean observations against the synchronized
candidate. Its controlled mutation used a throwaway browser initialization
hook; it was not added to application code. React's development bundle emitted
the diagnostic. This demonstrates that adding the reported attributes before
React loads is sufficient to produce the reported component diff.

The affected-profile attempt used the checked-in
`yarn browser:live:host:check` connection path. It failed with
`ECONNREFUSED 172.17.0.1:9222`; no existing profile, tabs, history, or extension
inventory was read or changed.

## Per-message classification

| Reported entry | Classification | Evidence | Confidence / remaining proof |
| --- | --- | --- | --- |
| Root hydration mismatch for `suppresshydrationwarning` and `data-qb-installed` | External pre-hydration DOM mutation; not app-owned | Raw SSR and six clean hydrated documents omit both attributes; tracked source and all loaded text modules omit `data-qb-installed`; injecting only the two attributes before hydration reproduces the same React diff | High confidence in external ownership. The unavailable affected profile leaves only the specific actor unidentified. |
| `Unchecked runtime.lastError: Could not establish connection. Receiving end does not exist.` | Browser-extension/runtime messaging artifact; not app-owned in the tested application | It is absent on six clean loads, and neither tracked source nor any loaded text module invokes `chrome.runtime`, `browser.runtime`, `runtime.sendMessage`, or `runtime.connect` | High confidence in external ownership. The affected profile's unavailable source URL prevents extension-ID attribution but does not expose an application call site. |
| Rejected promise with `Could not establish connection. Receiving end does not exist.` | Browser-extension/runtime messaging artifact; not app-owned in the tested application | It is absent on six clean loads, including all `pageerror` events, and the loaded application has no extension-messaging call site | High confidence in external ownership. The affected profile's unavailable async stack is residual actor-attribution risk. |

`installHook.js` and the console label `en:1` are not treated as owners. They
are presentation/source clues only; the controlled comparison and actual
loaded call sites determine ownership.

## Implementation decision

No application-runtime change is warranted. In particular, this investigation
does not add `suppressHydrationWarning`, copy the lowercase attribute into JSX,
strip attributes inserted by another actor, patch the console, or filter global
errors. Any of those changes would hide a useful React diagnostic without
repairing its source.

For an affected user profile, optional remediation is to inspect the expanded
console source/stack and have the user disable/re-enable or update the emitting
extension. Exact extension attribution is not required to justify an
application change because the controlled evidence shows no application-owned
failure. Product code should not special-case it.

## Reproduction recipe

Capture the server-owned root element and repeat the application source audit:

```bash
curl -fsS http://127.0.0.1:6900/en | rg -o '<html[^>]*>' | head -1
rg -n 'chrome\.runtime|browser\.runtime|runtime\.sendMessage|runtime\.connect|data-qb-installed|suppress[hH]ydration[wW]arning' \
  src utils package.json vite.config.mts --glob '!routeTree.gen.ts'
```

When the orchestration review artifacts are present, the exact independent
clean-load, interaction, resource-audit, and controlled-mutation check is:

```bash
docker compose -f /workspace/project/docker-compose.dev.yml \
  --project-directory /workspace/project exec app sh -lc \
  'cd /app && xvfb-run -a --server-args="-screen 0 1440x900x24 -ac -nolisten tcp +extension RANDR" node .codex-orch/features/F090-console-log-errors-investigation/reviewer-live-check.cjs'
```

The structured output is retained in
`.codex-orch/features/F090-console-log-errors-investigation/artifacts/live-console-evidence.json`.

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

Completed on 2026-09-03 against synchronized candidate
`4a1430b84e6962307b45451aa3f59bf17fce5651`. Independent review repeated three
clean live loads, exercised the visible `Zoom in` control, and reproduced the
exact hydration diagnostic with a controlled pre-hydration mutation. The main
page remained usable, no clean-load console or page errors were observed, and
the React diagnostic was not suppressed.

The complete independent record is
`.codex-orch/features/F090-console-log-errors-investigation/functional-review.md`.
The affected host Chrome profile was not reachable on its configured debugging
endpoint, so the specific extension ID and source stack remain unconfirmed.
That is residual external actor-attribution risk, not an incomplete app fix.

## Branch propagation

The owner confirmed that the four active branch targets are `v2`,
`energiakartta` (Energy), `hiilikartta` (Carbon), and
`luonnonmetsakartat`. The literal historical `energy` and `carbon` refs are not
deployment targets.

On 2026-09-03, the reviewed changes from `v2` and `energiakartta` were combined
without rewriting history in merge commit
`4a1430b84e6962307b45451aa3f59bf17fce5651`. The other two active branches
were fast-forwarded to that same commit and the four refs were published
atomically:

| Required branch | Pre-integration local tip | Reviewed local and remote tip |
| --- | --- | --- |
| `v2` | `8370906e61bc757ff29a63526628e9e473da2949` | `4a1430b84e6962307b45451aa3f59bf17fce5651` |
| `energiakartta` | `d6caf39ce4ba10f0922568fcf720fa865ff253a9` | `4a1430b84e6962307b45451aa3f59bf17fce5651` |
| `hiilikartta` | `f72baf0c1f70fa758d70d994e32ccfb088683f56` | `4a1430b84e6962307b45451aa3f59bf17fce5651` |
| `luonnonmetsakartat` | `f72baf0c1f70fa758d70d994e32ccfb088683f56` | `4a1430b84e6962307b45451aa3f59bf17fce5651` |

Fresh local, remote-tracking, and remote (`ls-remote`) checks showed the same
commit and tree for every required branch, with zero pairwise revision or file
differences. Typechecking and all 117 test suites (1,195 tests) passed on that
synchronized candidate.

The reviewer-requested correction to this evidence record is documentation
only. After committing it, all four local branches are fast-forwarded to the
same correction commit without pushing; its exact non-self-referential SHA and
the final equality/ancestry checks are recorded in
`.codex-orch/features/F090-console-log-errors-investigation/coder-report.md`.
