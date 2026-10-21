# Adsterra setup, diagnostics and verification

Status of this document: audited the real code, then verified the **live site** (https://qr-gen-two-psi.vercel.app/) in a real Chrome on 2026-10-22.
Banner scripts load, Adsterra returns real creatives, and they render. Native Banner and Social Bar are not integrated yet (no snippets supplied). See sections 2, 3 and 8.

## 1. How ads are wired

| Slot id | Where | Desktop unit | Phone unit (< 760 px wide) |
|---|---|---|---|
| `top-banner` | Top of the home page | 728x90 | 320x50 |
| `mid-banner` | Between the studio and the templates | 728x90 | 320x50 |
| `features-banner` | Home page, between templates and features | 728x90 | 320x50 |
| `faq-banner` | Home page, after the FAQ | 728x90 | 320x50 |
| `page-top-banner` / `page-bottom-banner` | About, Contact, FAQ, Privacy, Terms (under the title and at the end) | 728x90 | 320x50 |
| `result-banner` | Under the preview and downloads, **after the first successful Generate** | 320x50 | 320x50 |
| `features-banner` | Home page, between the templates and the features | 728x90 | 320x50 |
| `faq-banner` | Home page, after the FAQ | 728x90 | 320x50 |
| `page-top-banner` / `page-bottom-banner` | About, Contact, FAQ, Privacy, Terms (under the title and at the end) | 728x90 | 320x50 |
| `footer-banner` | Top of the footer, every page | 728x90 | 320x50 |

* Code: `src/config/ads.ts` (snippets, unit choice), `src/components/ads/AdSlot.tsx` (frame, status), `src/components/ads/adFrame.ts` (sandbox flags, timeout),
  `src/components/ads/GenerateAdExperience.tsx` and `QRStudio.handleGenerateClick` (Generate flow).
* Each slot mounts its snippet **once** in its own `<iframe srcdoc>`. That keeps Adsterra's global `atOptions` separate per slot and means re-renders,
  resizes and repeated Generate clicks never re-inject a script.
* The ad unit size is read from the snippet's own `atOptions`, so the reserved box always matches the ad. Units are never scaled with CSS.
* The unit (desktop or phone) is chosen once at mount from the viewport width.
* A slot shows the **Advertisement** label only after the loader has injected its ad frame. If nothing is injected within 10 s (script blocked, failed, or ad blocker)
  the slot collapses, so no empty labelled box is left behind. The QR generator never depends on any of this.

### What "ready" means
`data-ad-state="ready"` means: the iframe loaded **and** Adsterra's loader script ran and inserted its own frame. It does **not** prove a creative was returned.
Whether a real advertisement is visible can only be confirmed by looking at the page in a normal browser (section 5).

## 2. Findings from the audit (what was wrong)

1. **Ad requests carried no `Referer` (confirmed root cause of the blank slots).** The frames were sandboxed *without* `allow-same-origin`, which gives them an opaque
   origin. Measured in Chromium against a local mock ad server: the loader script request and the nested ad frame request arrived with **no Referer header**,
   and `localStorage` / `document.cookie` / `top.location` threw `SecurityError` inside the ad code. Ad networks normally match the requesting page to the registered
   site, so a request that does not say where it came from is a likely reason for an empty response. Confirmed on the live domain with one A/B test: the same snippet in an old-style isolated frame sent the ad request with no Referer and got **no creative** (0 images);
   in the current frame the Referer was the site URL and a creative image loaded.
   *Fix:* frames now use `allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox`. The same test then showed the page URL in the Referer
   header and working storage and cookies.
2. **Result banner box did not match its unit.** The slot reserved 300x250 but its code is a 320x50 unit: the ad was clipped by 20 px and sat in a 200 px blank box that
   still showed the word "Advertisement". *Fix:* size now comes from the snippet.
3. **"Advertisement" label shown over nothing.** The label was always rendered once a snippet existed. *Fix:* label only after the loader injected a frame, slot collapses on failure.
4. **728x90 scaled down on phones.** CSS-scaling a 728 px unit to about 0.5 on a 390 px screen made it tiny and alters the creative. *Fix:* phones use the 320x50 unit you already have.
5. **Vercel returned 404 for every route except `/`** (checked with `curl`: `/faq` gave 404). Refreshing or opening `/faq`, `/privacy`, etc. directly failed, and so would the sitemap URLs.
   *Fix:* `vercel.json` rewrites all paths to `index.html` (takes effect after you push and Vercel redeploys).
6. **One ad key reused in three slots.** Top, mid and footer all use the same 728x90 unit. Adsterra reporting then cannot tell the slots apart, and some networks limit repeated identical
   placements. Not changed (they are your units), but see section 6.

### Security trade-off of fix 1 (please read)
With `allow-same-origin` the ad code runs as part of your site's origin. It can use cookies and storage like a banner pasted into the page, and it can in principle read this
site's browser storage (the "recent codes" list, which can hold URLs and contact details, but never Wi-Fi passwords) or remove its own sandbox. The sandbox still blocks
top-level navigation, forms, modals and downloads. This is the same exposure as pasting Adsterra's script straight into the page, which is Adsterra's standard integration.
Only Adsterra code you pasted yourself is ever placed in `ads.ts`. The Privacy Policy now says this.

If you prefer maximum isolation, set `ADS_CONFIG.isolateFrames = true` in `src/config/ads.ts`. Be aware that this is the configuration in which ads were not being served.
A cleaner long-term option is a separate origin for the ad frames, but Adsterra matches ads to your registered site, so that needs Adsterra's agreement first.

## 3. Status of each placement

| Placement | Expected format | Configuration | Rendering | Script status | Real ad verified |
|---|---|---|---|---|---|
| `top-banner` | Banner 728x90 (320x50 on phones) | PASS | PASS (Chrome, mocked) | PASS (live, 200) | NEEDS MANUAL VERIFICATION |
| `mid-banner` | Banner 728x90 (320x50 on phones) | PASS | PASS (Chrome, mocked) | PASS (live, 200) | PASS (creative rendered, live) |
| `result-banner` | Banner 320x50 | PASS | PASS (revealed only after a successful Generate) | PASS (live, 200) | PASS (creative rendered, live) |
| `footer-banner` | Banner 728x90 (320x50 on phones) | PASS | PASS (Chrome, mocked) | PASS (live, 200) | PASS (creative rendered, live) |
| `features-banner`, `faq-banner`, `page-top-banner`, `page-bottom-banner` | Banner 728x90 (320x50 on phones) | PASS (reuse the same two units) | PASS (Chrome, mocked) | PASS (live, 200) | PASS (creative rendered, live) |
| `features-banner`, `faq-banner`, `page-top-banner`, `page-bottom-banner` | Banner 728x90 (320x50 on phones) | PASS | PASS (Chrome, mocked, production build) | PASS (live, 200) | PASS (creative rendered, live) |
| Banner 468x60, 300x250, 160x300, 160x600 | Banner | NOT CONFIGURED (no snippet in the repo) | n/a | n/a | n/a |
| Native Banner | Container + script | NOT CONFIGURED (snippet not supplied) | n/a | n/a | n/a |
| Social Bar | Page-level script | NOT CONFIGURED (snippet not supplied; `index.html` has no Adsterra script) | n/a | n/a | n/a |
| Popunder | Page-level script | NOT CONFIGURED | n/a | n/a | n/a |
| Smartlink | Link | NOT CONFIGURED (and not used as an ad substitute by design) | n/a | n/a | n/a |

"Active" in the Adsterra dashboard only means the unit exists. It does not mean the unit is on the site.

## 4. Changing or adding units

* Paste the code exactly as Adsterra gives it. Banner code is an `atOptions` block followed by `<script src=".../invoke.js">` style loader. Keep the order.
* `src/config/ads.ts` holds two named constants (`BANNER_728X90`, `BANNER_320X50`). Slots point at them. To give a slot its own unit, create a new unit in the dashboard
  and put its snippet in that slot's `snippet` (and `mobileSnippet`). The size is read from the snippet automatically.
* Page-level formats (Social Bar, Popunder): one script from your dashboard, pasted in `index.html` replacing the `ADSTERRA_PAGE_LEVEL_SCRIPT_PLACEHOLDER` comment.
  Adsterra's code decides when they show. They cannot be triggered by Generate, and this app does not try. Popunders can interrupt people while they download a QR code, so
  consider that before enabling one.
* Native Banner needs a container element plus a script. It is not supported by `AdSlot` yet. Send the snippet if you want it added.
* No Content Security Policy is shipped (Vercel sends none either). If you add one later, take the allowed hosts from the network tab with ads loading.

## 5. How to verify real ads yourself (manual, required)

Do this in a normal browser with **ad blockers and tracker blocking turned off** (also Brave Shields, Firefox strict mode, and VPN/DNS ad filters).

1. Push the changes so Vercel deploys, then open https://qr-gen-two-psi.vercel.app/ in a fresh private window.
2. DevTools, Network tab, reload. Filter by the loader host you see in your snippets. For each slot you should see a `200` script request, then a second request for the ad frame.
   Click a request and confirm the request headers contain `Referer: https://qr-gen-two-psi.vercel.app/`.
3. Elements tab: inside the slot's `iframe`, expect Adsterra's own `iframe` containing the creative. Look at the page: an actual banner should be visible under the small "Advertisement" label.
4. Console tab: look for CSP, mixed-content or blocked-request errors. (In dev builds, `[ads]` messages say whether a loader injected a frame.)
5. Slot disappears after about 10 s: the loader injected nothing, so the script was blocked or Adsterra returned nothing. Check the next list.
6. Test on a phone (or DevTools device mode, 390 px wide, then reload): the 320x50 unit should appear.
7. Do **not** click your own ads, and do not reload repeatedly to "see more" ads. Adsterra treats that as invalid traffic.

If requests succeed but no creative appears:
* New sites/units can take time to start filling, and low-volume or low-value geos may have no demand. Check the Adsterra dashboard statistics (impressions) after some hours.
* Confirm the site URL registered in Adsterra is exactly `qr-gen-two-psi.vercel.app` (not a different or www variant). Ask Adsterra support whether the site and these unit IDs are active for that domain.
* If they say the domain is fine and a request with the correct Referer still returns nothing, send Adsterra the failing request (URL with the key removed, response status and body).

## 6. Recommended follow-ups (your decision)
* The home page now has 5 banners and content pages 3, all reusing two units. More than this hurts visitors and risks Adsterra's ad-density policy, so I stopped here. Better revenue comes from separate units per slot and bigger formats, not more banners.
* Create separate units for top, mid and footer so the dashboard shows which placement earns what.
* Consider a 300x250 banner for the result slot (more valuable than 320x50). Send me that snippet and I will wire it in.
* If you will not use a placement, set its snippets to `null` and it disappears in production.

## 7. Development
`npm run dev` shows a dashed "Adsterra integration not configured" box for any slot with no snippet. It is never shown in production unless `VITE_SHOW_AD_PLACEHOLDERS=true`
is set at build time, and it is never labelled "Advertisement".
`npm run test` runs the automated checks. The tests use fake `.invalid` snippets and never contact an ad network.

## 8. Live verification results (2026-10-22)
Method: one real Chrome load of the production site, no mocking, no clicks. Recorded network, frames and console.
* **Banner scripts load:** yes. Each banner loader returned 200 with the site URL as Referer.
* **Scripts initialise:** yes. Each slot's frame contained an injected ad frame, then Adsterra ad requests returned 200 (a few `307` redirects are normal).
* **Real ad content rendered:** yes. Creative images (GIF/JPEG, 23-73 KB) loaded from Adsterra's image CDN and displayed in the 728x90 slots (visually confirmed in a screenshot).
* **Console:** no page errors. Only Chrome's expected warning that `allow-scripts` plus `allow-same-origin` can escape a sandbox (see section 2).
* **Native Banner / Social Bar:** not operational. They are not on the site because no snippet has been supplied.
* **Not tested:** phone-sized viewport on the live site, the result banner after Generate on the live site, other browsers, ad blockers.

### Content warning
The creative served in the top slot was **sexually explicit** imagery. Adsterra serves adult ads unless you restrict them. On a general-audience tool this can breach
the site's own audience expectations, get you flagged by browsers/parents' filters and hurt trust. In the Adsterra dashboard, edit the website's settings and
exclude the adult category (and review the per-unit category/filter options). Ask Adsterra support if the option is not visible. This cannot be fixed in code.

### To add Native Banner and Social Bar
Send the exact code from the dashboard for each. Social Bar is a single page-level script (goes in `index.html`; it overlays a corner of the screen and may sit near the
Generate button on phones). Native Banner is a container plus script and needs its own slot. Neither will be made up.

## 9. VPN, proxy and DNS-filter visitors

What QRForge controls and what it does not:
* QRForge does **not** detect VPNs, filter by IP or country, or try to get around blockers. Whether a VPN visitor receives an ad is decided by Adsterra (inventory,
  geo, anti-fraud) and by the visitor's network/browser (VPN ad-blocking, DNS filters, extensions). The app cannot and does not override that.
* Before 2026-10-22 evening a slot was marked "ready" as soon as the loader injected its frame. If the ad server answered but the creative never loaded
  (blocked image CDN, empty response), the visitor saw an empty box labelled "Advertisement". Now a slot is only shown when a creative is actually rendered
  (an image larger than a 1x1 pixel, or media). Otherwise it disappears after 15 s (long enough for slow VPN routes), without affecting the page.
* Reproduced with simulated conditions (not a real VPN): creative CDN blocked, empty ad response and ad host blocked all left the old code showing an empty labelled
  box, and the new code removes the slot. Normal delivery is unchanged.

Hosts involved in a banner impression (observed on the live site, 2026-10-22):

| Host | Role | If blocked |
|---|---|---|
| `bauval.org` | loader script (`/22/`), ad request (`/19/`), counters | no ad at all |
| `static.nresystems.com` | tracking pixel | usually ad still shows |
| `cdn.storageimagedisplay.com` | creative images | request "succeeds" but the box stays empty |

### How to test VPN on and off yourself
1. Open https://qr-gen-two-psi.vercel.app/?adsdebug=1 in a clean Chrome profile with extensions off (VPN off first).
2. DevTools, Network tab, filter `bauval|nresystems|storageimagedisplay`. Record status for each host. A blocked request shows `ERR_BLOCKED_BY_CLIENT`,
   `ERR_NAME_NOT_RESOLVED` or `ERR_CONNECTION_*`.
3. Look at the page: an ad shows, or (with `?adsdebug=1`) an "Ad slot ... is empty: reason" line names the cause, including the blocked host name.
4. Repeat with the VPN on, then with the VPN's ad-blocking / threat-protection feature off. Compare the hosts from step 2.
5. Interpret: `bauval.org` blocked means the VPN/DNS filter blocks the ad network. Only the image host blocked means the same for the CDN. All 200 but "no creative"
   means Adsterra returned nothing for that IP or location, so ask Adsterra support. Do not try to bypass either.
