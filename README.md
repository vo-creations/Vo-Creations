# Vo Creations: vocreations.com

UGC agency that trains its own creators through live mentorship. Marketing site built with Next.js (App Router) + Tailwind, deployed on Vercel.

## Brand

- **Tagline:** _make them remember._ (rendered lowercase, in small caps, with the trailing period, the "dot")
- **Voice:** direct, confident, no fluff. No em dashes in site copy.
- **Themes:** Agency = amber accent (`#F5A623`) on near-black. Mentorship = green accent (`#5cff7e`).

Use the tagline in metadata, the homepage hero kicker, and the footer. Keep it styled `font-variant: small-caps` so the casing is consistent everywhere.

## Stack

- Next.js 14 (App Router), TypeScript, Tailwind CSS
- Deployed via Vercel CLI: `vercel deploy --prod`
- Analytics: Vercel Analytics + GA (`G-1TESF8060F`)

## Key conventions

- Metadata lives in each route's `layout.tsx` (or `page.tsx` for server pages). Root metadata + JSON-LD in `app/layout.tsx`.
- Shared chrome: `components/Nav.tsx`, `components/Footer.tsx`.
- SEO history is tracked in `SEO-WORK-DIARY.md`.
- Conference / QR landing pages live at top-level slugs (`/daniel`, `/danny`, `/thienvu`), `noindex`, standalone (no Nav/Footer).
- **Inline showcase videos** (vertical UGC clips in `bg-bg-card` cards): always use this exact setup so the first frame shows as a thumbnail on iOS Safari:
  - `src={`${v.src}#t=0.1`}`: the `#t=0.1` media fragment forces Safari to render the frame at 0.1s instead of a black box (no separate poster image needed).
  - `playsInline muted loop preload="metadata"`
  - `onMouseEnter` plays, `onMouseLeave` pauses and resets `currentTime = 0.1` (back to the thumbnail frame, not 0), `onClick` toggles mute.
  - Reference implementation: `app/page.tsx` (showcase grid). Mirrored in `app/about/page.tsx`. Keep all raw `<video>` blocks identical to this.

## Development

```bash
npm run dev      # local dev at http://localhost:3000
npm run build    # production build
vercel deploy --prod   # deploy to vocreations.com
```

## Site map (routes)

All routes live under `app/` (App Router). Metadata is in each route's `layout.tsx` (or `page.tsx` for server pages).

| Route | What it is | Notes |
| --- | --- | --- |
| `/` | Homepage | Showcase video grid (see Inline showcase videos convention) |
| `/about` | About page | Mirrors the homepage showcase video setup |
| `/creators` | Creator roster / agency page | |
| `/mentorship` | Mentorship landing | Green accent theme |
| `/mentorship/enroll` | Enrollment + checkout | **Not actively used.** `noindex`, removed from sitemap; reachable by direct link only (see Payments) |
| `/roi` | ROI calculator / pitch page | |
| `/refund-policy` | Refund policy | |
| `/pre-call` | Pre-call prep page | |
| `/blog` | Blog index | |
| `/blog/text-on-screen-ugc` | Blog post | |
| `/campaigns/maxxd` | Campaign dashboard (Maxxd) | |
| `/campaigns/leaderboard` | Creator leaderboard | Password-protected, `noindex` (see below) |
| `/daniel`, `/danny`, `/thienvu` | Conference / QR landing pages | `noindex`, standalone (no Nav/Footer) |

**API routes:**

| Route | Trigger | Purpose |
| --- | --- | --- |
| `POST /api/checkout` | Enroll page | Creates a Stripe Checkout session |
| `POST /api/stripe-webhook` | Stripe webhook delivery | Posts payment events to Slack + Google Sheet |

## Payments (Stripe → Slack + Google Sheets)

> **Status: not actively used.** Mentorship is no longer sold through the website; links are sent
> directly. `/mentorship/enroll` is `noindex` and excluded from the sitemap, but the code and the
> live Stripe webhook remain functional (reachable by direct link). Do not delete without also
> removing the Stripe Dashboard webhook endpoint and the Vercel env vars.

Mentorship payments flow through two Next.js API routes (Vercel serverless functions). The "custom Slack app" is just an Incoming Webhook URL stored as an env var; sheet logging POSTs to a Google Apps Script web app. All secrets live in Vercel, not the repo.

- `app/api/checkout/route.ts` creates the Checkout session (`full` = pay in full, `plan` = 4-payment subscription).
- `app/api/stripe-webhook/route.js` verifies the signature and handles `checkout.session.completed`, `invoice.paid` (auto-cancels the subscription after 4 payments), and `invoice.payment_failed`, each firing a Slack message + sheet row.

Full reference, including the env var table, the per-event side effects, and known fragile/hardcoded spots: [docs/stripe-slack-integration.md](docs/stripe-slack-integration.md).

## Creator Leaderboard (`/campaigns/leaderboard`)

Password-protected, `noindex` page ranking creators by month-to-date views across active campaigns. Refreshed daily.

**Data flow:** an Apps Script bound to the Campaign Tracker Google Sheet builds the snapshot daily at 06:30 on its own dedicated time-driven trigger, fully decoupled from the existing `syncActive()` digest (so a leaderboard failure cannot take down the daily Slack/Discord digest). It writes the top-10 JSON to a `Leaderboard-Current` tab and exposes it via a Web App `doGet()`. This page fetches that JSON (server-side, `revalidate: 3600`). Sideshift API keys never leave Apps Script; Vercel only knows the Web App URL and the page password.

- Reference copy of the Apps Script: [apps-script/campaign-tracker-v2.gs](apps-script/campaign-tracker-v2.gs). Live home is the `4-Automations/Daily Campaign Updates Slack-Descript` project.
- Page degrades gracefully: if `LEADERBOARD_DATA_URL` is unset or returns no creators, it shows a "warming up" state. No placeholder data is ever rendered.

**Env vars (Vercel):**

| Var | Purpose |
| --- | --- |
| `LEADERBOARD_DATA_URL` | The Apps Script Web App deployment URL returning the snapshot JSON. |
| `LEADERBOARD_PASSWORD` | Shared basic-auth password for the page. Rotate quarterly. |

Auth is enforced in [middleware.ts](middleware.ts) for `/campaigns/leaderboard*`; any username works, the password must match `LEADERBOARD_PASSWORD`. If `LEADERBOARD_PASSWORD` is unset the route returns 401 (locked, not open).

**Operations:**

- **Add/remove a brand:** edit the `SIDESHIFT_KEYS` Script Property in the Apps Script project (JSON map of `{ brandName: apiKey }`). No code change, no Vercel change. Next 06:30 run picks it up.
- **Rotate the password:** update `LEADERBOARD_PASSWORD` in Vercel project settings and redeploy. Share the new value with the creator roster.
- **Manual rebuild:** in the Apps Script editor, run `buildLeaderboardSnapshot()` directly; then hit the page (or wait for revalidation) to see fresh data.
- **If the Web App breaks:** the page shows the "warming up" state rather than erroring. Check the Apps Script execution logs, confirm the Web App deployment is still "Anyone with the link", and re-deploy a new version if the URL changed (then update `LEADERBOARD_DATA_URL`).
