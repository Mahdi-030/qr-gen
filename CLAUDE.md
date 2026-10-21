# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

QRForge: a Vite 8 + React 19 + TypeScript 6 + Tailwind v4 SPA that generates styled QR codes fully client-side, with a configurable Adsterra ad layer. See `README.md` for the feature list and `ADSTERRA_SETUP.md` for ads.

## Commands

```bash
npm run dev       # Vite dev server (http://localhost:5173)
npm run build     # tsc -b (type-check all project references) then vite build
npm run lint      # oxlint (not ESLint)
npx tsc -b        # type-check only
```

There is no test runner. Verification so far was done by driving the dev server in a browser: dev modules can be imported from the page
(`await import('/src/lib/qrExport.ts')`) to render a payload and decode it with `jsqr`.

## Git layout (important)

This directory is **not** its own git repo; the nearest `.git` is `C:\Users\mahdi` (home). Run `git init` here before committing anything, and never stage from the home-level repo.
The home-level CLAUDE.md's graphify step does not apply (no `graphify-out/` here).

## Architecture

Rendering pipeline (read `lib/qrRender.ts` + `lib/qrExport.ts` together):
`qr-code-styling` (lazy-imported) emits a vector SVG -> `composeSvg` inlines it in an outer SVG that adds the optional frame/label -> that single SVG drives the preview `<img>`,
SVG download, and (rasterized via canvas in `rasterize`) PNG/JPEG/PDF. Keep it that way so preview == export.

- `hooks/useStudio.ts` holds all studio state (type, per-type form data, style, template, generated result, history). `HomePage` creates it once and passes it to `QRStudio` and `QRTemplateGallery`.
- The result shown is the *generated snapshot* (`generated.payload`) plus the *live* style. Editing inputs after Generate marks it stale until Generate is pressed again.
- `lib/qrPayload.ts` builds standard payloads (WIFI:, vCard, iCalendar, mailto:, geo:, SMSTO:, wa.me); `lib/validation.ts` validates per type.
- `buildOptions` passes the payload through `toUtf8Binary`: qr-code-styling otherwise encodes non-ASCII as Latin-1 and produces garbled scans. Do not remove it.
- Ads: `config/ads.ts` (slots, all `snippet: null` until the owner pastes real Adsterra code) -> `components/ads/AdSlot.tsx` (sandboxed `srcdoc` iframe mounted once; dev-only placeholder otherwise).
  `QRStudio.handleGenerateClick` is the single Generate entry point; `GenerateAdExperience` reveals the result slot after the first successful generate. Never invent Adsterra APIs, auto-click, `window.open` popups, or re-inject scripts per click.
- Never persist Wi-Fi passwords (history strips them). Heavy deps (`jspdf`, `jsqr`, `qr-code-styling`) must stay dynamically imported.

## TypeScript / lint constraints

- `tsconfig.json` is a solution file; use `tsc -b`. `erasableSyntaxOnly` (no enums/namespaces/parameter properties), `verbatimModuleSyntax` (`import type`), `noUnusedLocals/Parameters` are errors in build.
- Oxlint: `react/rules-of-hooks` error, `only-export-components` warns (keep non-component exports out of component files; e.g. toast context lives in `hooks/toastContext.ts`), and the React Compiler-style rules flag `setState` inside effects and impure calls in render.
- Theme colours are CSS variables (`--c-*` in `index.css`) mapped to Tailwind tokens (`bg-surface`, `text-muted`, ...). Dark mode toggles the `dark` class on `<html>`; use tokens rather than `dark:` variants.
- Editing note: files written by the Write tool use LF; use the Edit tool rather than scripted multi-line replacements.
