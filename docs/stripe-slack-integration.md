# Stripe → Slack + Google Sheets Integration

How mentorship payments are tracked. There is **no checkout flow on the website** — sales go
through **direct Stripe payment links** sent to buyers (Thienvu sends them directly). The only
code involved is a single webhook that reports payment events to Slack and a Google Sheet.

- **Repo:** `mohios-nz/Vo-Creations` (GitHub)
- **Runtime:** Vercel project `mohios/vocreations`
- **Code:** `app/api/stripe-webhook/route.js`

## Flow

```
Buyer pays via a direct Stripe payment link
        │
Stripe  ──POST /api/stripe-webhook──>  verify signature  ──>  Slack message + Google Sheet row
```

## Webhook — `app/api/stripe-webhook/route.js`

Triggered by Stripe webhook delivery (`POST`). Reads the raw body, verifies the signature, then
handles three events. Each fires a **Slack message** and a **Google Sheet log** row.

| Stripe event | Behavior | Slack message |
|---|---|---|
| `checkout.session.completed` | New enrollment logged (name, email, plan, amount) | 💰 New mentorship enrollment! |
| `invoice.paid` | Counts paid invoices on the subscription. Notifies at payment 2/4. **Auto-cancels the subscription after 4 payments.** Logs payments 2–4 to the sheet. | 📊 halfway / ✅ plan completed |
| `invoice.payment_failed` | Logs the failure and attempt count | 🚨 Payment failed! |

- Slack messages use Block Kit JSON posted to `SLACK_WEBHOOK_URL`.
- Sheet logging POSTs JSON to a Google Apps Script web app (`GOOGLE_SHEET_WEBHOOK`).
- The payment plan is hard-coded to 4 installments.
- Slack/Sheet failures are caught and logged; they do not fail the webhook response.

## Environment variables (set in Vercel — `mohios/vocreations`)

| Var | Purpose |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe API calls in the webhook |
| `STRIPE_WEBHOOK_SECRET` | Verify incoming webhook signatures |
| `SLACK_WEBHOOK_URL` | Slack Incoming Webhook (the "custom Slack app") |
| `GOOGLE_SHEET_WEBHOOK` | Google Apps Script web app URL for sheet logging |

Values are encrypted in Vercel and are **not** stored in the repo.

`STRIPE_PRICE_FULL` and `STRIPE_PRICE_PLAN` were used only by the removed website checkout and
are now unused (safe to delete from Vercel later).

## Out-of-repo pieces

- **Slack:** a Slack app with one Incoming Webhook; only its URL matters, stored as `SLACK_WEBHOOK_URL`.
- **Google Sheet:** a Google Apps Script web app deployed as a URL, stored as `GOOGLE_SHEET_WEBHOOK`.
- **Stripe Dashboard:** a webhook endpoint pointed at `https://vocreations.com/api/stripe-webhook`,
  subscribed to `checkout.session.completed`, `invoice.paid`, and `invoice.payment_failed`.

## How to verify it's working

- List Vercel env vars: `vercel env ls production`
- Check Stripe Dashboard → Developers → Webhooks for recent deliveries / failures
- Trigger a test event with the Stripe CLI: `stripe trigger checkout.session.completed`
