# Stripe → Slack + Google Sheets Integration

How mentorship payments flow from the website into Stripe, Slack, and a Google Sheet.

## TL;DR

There is **no separate service**. The integration is two Next.js API routes that deploy
as Vercel serverless functions on the `vocreations` project. The "custom Slack app" is just
an **Incoming Webhook URL** stored as an env var. All secrets live in Vercel, not in the repo.

- **Repo:** `mohios-nz/Vo-Creations` (GitHub)
- **Runtime:** Vercel project `mohios/vocreations`
- **Code:**
  - `app/api/checkout/route.ts` — creates the Stripe Checkout session
  - `app/api/stripe-webhook/route.js` — receives Stripe events, posts to Slack + Sheet

## Flow

```
Enroll page  ──POST /api/checkout──>  Stripe Checkout session  ──>  Stripe hosted checkout
                                                                          │
                                                              customer pays
                                                                          │
Stripe  ──POST /api/stripe-webhook──>  verify signature  ──>  Slack message + Google Sheet row
```

## 1. Checkout — `app/api/checkout/route.ts`

- Receives `POST { plan, email }` from the enroll page.
- Maps the plan to a Stripe price:
  - `full` → one-time `payment` (price `STRIPE_PRICE_FULL`)
  - `plan` → recurring `subscription` (price `STRIPE_PRICE_PLAN`)
- Creates a Stripe Checkout session with success/cancel URLs back to `/mentorship/enroll`.
- Returns `{ url }` for the browser to redirect to.

## 2. Webhook — `app/api/stripe-webhook/route.js`

Verifies the Stripe signature, then handles three events. Each fires a **Slack message**
and a **Google Sheet log** row.

| Stripe event | Behavior | Slack message |
|---|---|---|
| `checkout.session.completed` | New enrollment logged (name, email, plan, amount) | 💰 New mentorship enrollment! |
| `invoice.paid` | Counts paid invoices on the subscription. Notifies at payment 2/4. **Auto-cancels the subscription after 4 payments** (`cancel_at_period_end`). Logs payments 2–4 to the sheet (payment 1 already logged at checkout). | 📊 Payment plan halfway / ✅ Payment plan completed! |
| `invoice.payment_failed` | Logs the failure and attempt count; Slack message suggests pausing Skool access | 🚨 Payment failed! |

Notes:
- Slack messages use Block Kit JSON posted to `SLACK_WEBHOOK_URL`.
- Sheet logging POSTs JSON to a Google Apps Script web app (`GOOGLE_SHEET_WEBHOOK`).
- The payment plan is hard-coded to 4 installments.
- Slack/Sheet failures are caught and logged; they do not fail the webhook response.

## Environment variables (set in Vercel — `mohios/vocreations`)

| Var | Purpose |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe API calls (both routes) |
| `STRIPE_WEBHOOK_SECRET` | Verify incoming webhook signatures |
| `STRIPE_PRICE_FULL` | Price ID for pay-in-full |
| `STRIPE_PRICE_PLAN` | Price ID for the 4-payment plan |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client-side Stripe |
| `NEXT_PUBLIC_SITE_URL` | Base URL for success/cancel redirects (default `https://vocreations.com`) |
| `SLACK_WEBHOOK_URL` | Slack Incoming Webhook (the "custom Slack app") |
| `GOOGLE_SHEET_WEBHOOK` | Google Apps Script web app URL for sheet logging |

Values are encrypted in Vercel and are **not** stored in the repo.

## Where the pieces live (not in GitHub)

- **Slack:** a Slack app with one Incoming Webhook; only its URL matters, stored as `SLACK_WEBHOOK_URL`.
- **Google Sheet:** a Google Apps Script web app deployed as a URL, stored as `GOOGLE_SHEET_WEBHOOK`.
- **Stripe Dashboard:** a webhook endpoint pointed at `https://vocreations.com/api/stripe-webhook`,
  subscribed to `checkout.session.completed`, `invoice.paid`, and `invoice.payment_failed`.
  (Configure this in the Stripe Dashboard; it is not in code.)

## Known limitations / fragile spots

1. **"4 payments" is hardcoded in three places** (`paidCount >= 4` cancel, `paidCount === 2`
   halfway, the `1/4` / `${paidCount}/4` labels) and not derived from Stripe. A different plan
   length silently breaks all of it.
2. **`invoices.list({ limit: 10 })`** never paginates — `paidCount` is implicitly capped at 10.
3. **`paidCount` is race-prone**: it depends on the just-paid invoice already showing as
   `status: "paid"` when the webhook fires. The halfway branch is exact-match (`=== 2`), so an
   off-by-one count skips it entirely.
4. **`invoice.subscription` is deprecated** in newer Stripe API versions. If undefined,
   `if (!subscriptionId) break;` would skip every subscription payment. Confirm the pinned API version.
5. **Slack/Sheet failures are swallowed** — both helpers only `console.error` and the webhook
   still returns 200. No retry, no dead-letter; a dropped alert leaves no trace but Vercel logs.
6. **No idempotency**: nothing dedupes on `event.id`, so a Stripe redelivery re-runs counts and
   can re-post Slack/sheet rows.
7. **`plan === "plan"` magic string** decides subscription vs one-time in checkout; a typo falls
   through to a one-time payment rather than erroring.
8. **Raw Stripe `err.message` is returned to the client** in the checkout 500 response (minor leak).

## How to verify it's working

- List Vercel env vars: `vercel env ls production`
- Check Stripe Dashboard → Developers → Webhooks for recent deliveries / failures
- Trigger a test event with the Stripe CLI:
  `stripe trigger checkout.session.completed`
