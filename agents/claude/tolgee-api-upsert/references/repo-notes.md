# Repo Notes

## Namespace Selection

- Namespace definitions live in `appletConf.json`.
- Current mapping in this repo:
  - `main` -> `avoin-map`
  - `hiilikartta` -> `hiilikartta`
  - `luonnonmetsakartat` -> `luonnonmetsakartat`
  - `energiakartta` -> `energiakartta`
- Shared UI on the main map path usually belongs to `avoin-map`.
- There are multiple namespaces in this repo, generally one per applet. If you
  cannot tell whether a key belongs to shared UI or an applet, ask the user
  which namespace to use before writing.

## Language Selection

- Do not assume all namespaces use the same languages.
- Check `langs` in `appletConf.json` before adding translations.
- In the current repo state:
  - `avoin-map` ships `fi` and `en`
  - the applet namespaces listed above currently ship `fi`

## Rich Text And ICU Authoring

- Prefer `TText` over raw `T` for JSX-rendered translated text. `TText`
  injects the repo default params from `src/components/common/TText.tsx`.
- Keep `useTranslate().t(...)` for string-only use cases.
- Default `TText` params:
  - `lb` and `br` render a line break
  - `i` wraps content in italics
  - `b` wraps content in bold
- Use Tolgee ICU tag interpolation for those params:
  - line break: `Ensimmäinen rivi<lb></lb>Toinen rivi`
  - italics: `Tämä on <i>korostus</i>`
  - bold: `Tämä on <b>painotus</b>`
- Do not use `{lb}` or `{br}` for line breaks. Curly braces are ICU value
  interpolation, so Tolgee will try to interpolate the param itself instead of
  treating it as a rich-text tag.
- Tolgee React tags are not self-closing. Use `<lb></lb>` or `<br></br>`,
  not `<lb />` or `<br />`.
- Use ICU plural syntax for counts instead of JS-side string concatenation.
  Always include `other`.

Plural example:

```text
{count, plural, one {# kaava} other {# kaavaa}}
```

## API Notes

- Direct write endpoint:
  `POST {TOLGEE_API_URL}/v2/projects/{projectId}/translations`
- Auth header:
  `X-API-Key: <key>`
- Request payload field names:
  - use `key`
  - use `namespace`
  - use `translations`
- `translations` values must be strings:

```json
{
  "key": "sidebar.main.contact.cta",
  "namespace": "avoin-map",
  "translations": {
    "fi": "Ota yhteyttä",
    "en": "Get in touch"
  }
}
```

- Do not send `keyName` to the Tolgee API payload.
- Do not send `{ "text": "..." }` objects as translation values.

## Local Refresh

- After successful writes, refresh local translation files with:

```bash
node utils/scripts/downloadTranslations.js
```

- Never manually edit files inside `i18n/`.

## Environment Notes

- `utils/scripts/downloadTranslations.js` reads `TOLGEE_API_URL` and
  `TOLGEE_API_KEY`.
- Tolgee write operations require `TOLGEE_API_KEY` to have edit scope. Keep
  that credential server/build-only.
