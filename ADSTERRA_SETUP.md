# Adsterra setup

This project ships with **no** Adsterra code. Every ad slot is empty (`snippet: null`) until you paste the code
that Adsterra generates for *your* publisher account. Nothing here invents IDs, zones, Smartlinks or script URLs.

## How ads are wired

| Slot id | Where it appears | Suggested unit |
|---|---|---|
| `top-banner` | Top of the home page, above the hero | 728x90 (or 320x50) |
| `mid-banner` | Between the QR studio and the template gallery | 728x90 |
| `result-banner` | Under the preview and download panel. **Shown only after the user's first successful Generate** | 300x250 |
| `footer-banner` | Top of the footer, on every page | 728x90 |

* Slots are defined in `src/config/ads.ts`. Rendering is in `src/components/ads/AdSlot.tsx`.
* The Generate-click behaviour is in `src/components/qr/QRStudio.tsx` (`handleGenerateClick`) and
  `src/components/ads/GenerateAdExperience.tsx`.
* Each configured banner is mounted **once**, inside its own sandboxed `<iframe srcdoc>`. The iframe isolates
  Adsterra's global `atOptions` variable, so several banners on one page do not overwrite each other.
  Re-renders and repeated Generate clicks never rebuild the iframe, so scripts are not re-injected and impressions are not inflated.
* If a script is blocked (ad blocker, network failure) the iframe stays empty. The QR preview and downloads are unaffected.

## 1. Banner formats (configured in `src/config/ads.ts`)

1. In the Adsterra dashboard go to **Websites → your site → Add code**, choose **Banner**, pick a size and copy the code.
   It looks like a `<script>` block that sets `atOptions` followed by a `<script src=".../invoke.js">`.
2. Open `src/config/ads.ts` and paste the code **exactly as given** into the slot's `snippet` as a template literal:

   ```ts
   'top-banner': {
     id: 'top-banner',
     description: '…',
     width: 728,   // must match the unit size you created
     height: 90,
     snippet: `
       <!-- paste Adsterra's code here, unchanged -->
     `,
   },
   ```
3. Set `width` and `height` to the unit's size. That space is reserved so the page does not jump when the ad loads.
   On screens narrower than the unit, the iframe is scaled down to fit.
4. Create a **separate** Adsterra ad unit for each slot you fill (Adsterra keys are per unit). Do not reuse one code in several slots.
5. Native Banner: paste the container `<div>` and the `<script>` together as one snippet.

Slots you leave as `null` render nothing in production.

## 2. Page-level formats (Social Bar, Popunder, Interstitial / OnClick)

These formats are a **single script that Adsterra's own code controls**: when and whether anything shows is decided by Adsterra, not by this app.
They cannot be triggered on demand, and this project deliberately does not try (no popups via `window.open`, no simulated clicks, no redirects).

To use one, paste the exact script from your dashboard into `index.html`, replacing the line
`<!-- ADSTERRA_PAGE_LEVEL_SCRIPT_PLACEHOLDER (intentionally empty) -->`. It then loads once per page view.

**Limitation (important):** an on-demand "show an ad when Generate is clicked" is not something Adsterra's documented banner or
Social Bar integrations provide, and this app does not invent an API for it. What the Generate click does instead is reveal the
`result-banner` placement under the QR, the "normal visible Adsterra placement" fallback. Set `ADS_CONFIG.generateAction` to `'none'` to disable even that.

Popunder/OnClick formats can interrupt people who are trying to download a QR code. Consider whether that trade-off suits your audience, and follow Adsterra's publisher policies.

## 3. Development placeholders

With no snippet, development builds (`npm run dev`) show a dashed box labelled **"Development placeholder · not an advertisement — Adsterra integration not configured"**.
It is never shown in a production build. To preview it in a build anyway, set `VITE_SHOW_AD_PLACEHOLDERS=true` when building.
Do not put publisher IDs in `.env`. There are none to configure; snippets live in `ads.ts`.

## 4. Content Security Policy

No CSP is shipped, because a restrictive policy would block Adsterra's scripts and the domains they load vary by format and change over time.
If you add one, take the exact domains from your browser's network tab with ads enabled. You will need at least `script-src`, `frame-src`/`child-src`
(the app's own `srcdoc` frames), `img-src` and `connect-src` entries for Adsterra's hosts, plus `data:` and `blob:` in `img-src` for the QR previews.
Test with ads loading before deploying.

## 5. Checklist before going live

- [ ] Your site is added and approved in Adsterra.
- [ ] One unit created per slot, sizes match `width`/`height`.
- [ ] Snippets pasted unchanged into `src/config/ads.ts`.
- [ ] `SITE.url` and `SITE.contactEmail` set in `src/config/site.ts`.
- [ ] `public/sitemap.xml` and `public/robots.txt` use your real domain.
- [ ] Privacy Policy re-read and checked against the services you actually enable (also have it legally reviewed for your jurisdiction, including consent requirements for ad cookies such as in the EU/UK).
- [ ] Open the site with an ad blocker on and confirm that generating and downloading still work.
