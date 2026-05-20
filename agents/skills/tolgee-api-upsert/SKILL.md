---
name: tolgee-api-upsert
description: Add or update Tolgee translation keys through the Tolgee API, especially when approved UI copy from Figma, design specs, or implementation work needs to be written into Tolgee without editing `i18n/*.json` manually. Use when Codex needs to create missing keys, update translations, choose the correct namespace for shared UI or an applet, refresh downloaded translations, or script repeatable Tolgee write operations. If the correct namespace is ambiguous, stop and ask the user which namespace to use.
---

# Tolgee Api Upsert

## Overview

Use the Tolgee API to create or update translation keys, then refresh local
translation exports. Prefer the helper script in `scripts/` instead of
rewriting ad hoc `fetch` snippets every time.

Never edit files under `i18n/` directly. Those files are downloaded artifacts.

## Workflow

1. Confirm the target namespace before writing anything.
2. Read `appletConf.json` and current translation usage in code if needed.
3. If the namespace is still ambiguous, ask the user which namespace to use.
4. Confirm the allowed languages for that namespace. Do not assume every
   namespace ships both `fi` and `en`.
5. Gather exact approved copy from Figma or the user.
6. Upsert entries with
   `scripts/upsert_tolgee_translations.mjs`.
7. Re-download translations with `node utils/scripts/downloadTranslations.js`.
8. Verify the UI resolves the new keys under the intended namespace.

## JSX Translation Rules

- Prefer `TText` over raw `T` for JSX-rendered translation content in this
  repo. `src/components/common/TText.tsx` merges repo-wide rich-text params so
  Tolgee formatting works consistently.
- Keep `useTranslate().t(...)` for places that need a plain string instead of a
  React node, such as `aria-label`, helper text, document metadata, and other
  non-JSX APIs.
- `TText` default params currently provide:
  - `lb` and `br` for line breaks
  - `i` for italic text
  - `b` for bold text
- Those params use Tolgee ICU tag interpolation, so the message must use tags,
  not curly-brace value interpolation.
- Tolgee React rich-text tags are not self-closing. Use `<lb></lb>` or
  `<br></br>`, not `<lb />` or `<br />`.

Examples:

```text
Ensimmäinen rivi<lb></lb>Toinen rivi
Käytä <i>kursiivia</i> ja <b>lihavoituja</b> painotuksia
```

Avoid this:

```text
Ensimmäinen rivi{lb}Toinen rivi
```

`{lb}` is ICU value interpolation, so Tolgee will try to render the param
itself and React can throw `Functions are not valid as a React child`.

## ICU Rules

- Tolgee in this repo uses `FormatIcu`, so author messages with ICU syntax.
- Use `{name}` for plain value interpolation.
- Use ICU `plural` blocks for counts instead of JS-side singular/plural
  concatenation. Always include `other`.
- Add `=0`, `one`, `few`, `many`, and related categories only when the locale
  needs them.

Plural example:

```text
{count, plural, one {# kaava} other {# kaavaa}}
```

## Namespace Rules

- This repo has multiple Tolgee namespaces, generally one per applet.
- Shared main-app UI uses namespace `avoin-map`.
- Applet namespace definitions live in `appletConf.json`.
- If a key could plausibly belong either to shared UI or to an applet, ask the
  user which namespace to use before writing.

## API Rules

- Use `POST {TOLGEE_API_URL}/v2/projects/{projectId}/translations`.
- Send auth in the `X-API-Key` header.
- The request field is `key`, not `keyName`.
- `translations` values must be plain strings, not `{ text: ... }` objects.
- Prefer a write-capable API key. In this repo, `NEXT_PUBLIC_TOLGEE_API_KEY`
  may have broader write scopes than `TOLGEE_API_KEY`.

## Quick Start

```bash
node agents/skills/tolgee-api-upsert/scripts/upsert_tolgee_translations.mjs \
  --file /tmp/tolgee-entries.json \
  --project-id 1

node utils/scripts/downloadTranslations.js
```

Example input file:

```json
[
  {
    "key": "sidebar.main.contact.cta",
    "namespace": "avoin-map",
    "translations": {
      "fi": "Ota yhteyttä",
      "en": "Get in touch"
    }
  }
]
```

## References

- Repo-specific namespace, language, and ICU/TText notes:
  `references/repo-notes.md`
- Helper script format and flags:
  `scripts/upsert_tolgee_translations.mjs`
