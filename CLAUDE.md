# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

QRForge: a Vite 8 + React 19 + TypeScript 6 + Tailwind v4 SPA that generates styled QR codes fully client-side, with a configurable Adsterra ad layer. See `README.md` for the feature list and `ADSTERRA_SETUP.md` for ads.

## Commands

```bash
npm run dev       # Vite dev server (http://localhost:5173)
npm run build     # tsc -b (type-check all project references) then vite build
npm run lint      # oxlint (not ESLint)
npm run test      # vitest run (jsdom + Testing Library); tests use fake `.invalid` ad snippets, never real keys
npx tsc -b        # type-check only
```

Browser verification was done by driving the dev server with Playwright/Chrome: dev modules can be imported from the page
(`await import('/src/lib/qrExport.ts')`) to render a payload and decode it with `jsqr`. Intercept requests to the ad host instead of letting them through.

## Git layout

This directory is its own git repo (remote `origin` = GitHub `Mahdi-030/qr-gen`, branch `main`). Vercel deploys from it, so a change is not live until it is committed and pushed.
The home-level CLAUDE.md's graphify step does not apply (no `graphify-out/` here).

## Architecture

Rendering pipeline (read `lib/qrRender.ts` + `lib/qrExport.ts` together):
`qr-code-styling` (lazy-imported) emits a vector SVG -> `composeSvg` inlines it in an outer SVG that adds the optional frame/label -> that single SVG drives the preview `<img>`,
SVG download, and (rasterized via canvas in `rasterize`) PNG/JPEG/PDF. Keep it that way so preview == export.

- `hooks/useStudio.ts` holds all studio state (type, per-type form data, style, template, generated result, history). `HomePage` creates it once and passes it to `QRStudio` and `QRTemplateGallery`.
- The result shown is the *generated snapshot* (`generated.payload`) plus the *live* style. Editing inputs after Generate marks it stale until Generate is pressed again.
- `lib/qrPayload.ts` builds standard payloads (WIFI:, vCard, iCalendar, mailto:, geo:, SMSTO:, wa.me); `lib/validation.ts` validates per type.
- `buildOptions` passes the payload through `toUtf8Binary`: qr-code-styling otherwise encodes non-ASCII as Latin-1 and produces garbled scans. Do not remove it.
- Ads: `config/ads.ts` holds the owner's real Adsterra snippets (never print, log or put the keys in tests/reports; keep them byte-for-byte) -> `components/ads/AdSlot.tsx` (`srcdoc` iframe mounted once, size parsed from the snippet,
  desktop vs mobile unit chosen at mount, collapses if the loader injects nothing in 10 s; dev-only placeholder when unconfigured).
  The frame sandbox deliberately includes `allow-same-origin`: without it the ad request has no Referer and storage throws (measured), see `ADSTERRA_SETUP.md` and `components/ads/adFrame.ts` before changing it.
  `QRStudio.handleGenerateClick` is the single Generate entry point; `GenerateAdExperience` reveals the result slot after the first successful generate. Never invent Adsterra APIs, auto-click, `window.open` popups, scale ad units with CSS, or re-inject scripts per click.
- Deployment: Vercel from `main` on GitHub. `vercel.json` rewrites all paths to `index.html` (SPA routing); without it deep links 404.
- Never persist Wi-Fi passwords (history strips them). Heavy deps (`jspdf`, `jsqr`, `qr-code-styling`) must stay dynamically imported.

## TypeScript / lint constraints

- `tsconfig.json` is a solution file; use `tsc -b`. `erasableSyntaxOnly` (no enums/namespaces/parameter properties), `verbatimModuleSyntax` (`import type`), `noUnusedLocals/Parameters` are errors in build.
- Oxlint: `react/rules-of-hooks` error, `only-export-components` warns (keep non-component exports out of component files; e.g. toast context lives in `hooks/toastContext.ts`), and the React Compiler-style rules flag `setState` inside effects and impure calls in render.
- Theme colours are CSS variables (`--c-*` in `index.css`) mapped to Tailwind tokens (`bg-surface`, `text-muted`, ...). Dark mode toggles the `dark` class on `<html>`; use tokens rather than `dark:` variants.
- Editing note: files written by the Write tool use LF; use the Edit tool rather than scripted multi-line replacements.
