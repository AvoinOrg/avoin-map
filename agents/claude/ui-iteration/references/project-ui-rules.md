# Project UI Rules

Use this reference for local Avoin Map UI conventions before making UI edits.

## Locate the right surface

- Main app routes live under `src/app/[locale]/(map)/(applets)/(main)`.
- Shared UI lives under `src/components`.
- Shared routing helpers live under `src/common/routing` and `src/common/navigation`.
- Applet-specific UI usually belongs under the relevant applet folder instead of shared components.

## Preserve local patterns

- Use functional components with `const`.
- Prefer path aliases over deep relative imports.
- Preserve the existing design language unless the user explicitly asks for a broader redesign.
- Use `getRoute` or `MutableLink` instead of hardcoded paths when changing applet-aware navigation.

## Styling rules

- Prefer MUI System `sx` over `styled()` for ordinary component styling.
- Keep styling colocated with component usage unless extraction materially improves reuse or clarity.
- For responsive styling, use the project breakpoints `mobile` and `desktop`, not MUI defaults like `xs` or `sm`.
- When creating a stylable component that accepts `sx`, extend it as an array:

```tsx
sx={[baseStyles, ...(Array.isArray(sx) ? sx : [sx])]}
```

## Accessibility and interaction

- Add unique `aria-label` values to icon-only buttons and custom clickable UI when a stable accessible name is not already present.
- Preserve keyboard and focus behavior when moving or restyling interactive elements.

## Localization and config

- Do not edit files inside `i18n/` directly.
- Do not add fallback strings for translation keys. Use keys only.
- If a UI change adds, renames, or removes environment variables, update `.env.template` in the same change.

## When to read other references

- Read `figma-ui-workflow.md` when the UI task includes a Figma URL, node, or design asset fidelity requirement.
- Read `verification-workflow.md` before closing any UI task so the correct visual and live-browser checks are used.
