// Handles Mercury bank webhook events:
// - transaction.created → Slack
//
// PHASE 1 (current): signature verification + raw debug logging only.
//   We have not yet seen a real transaction.created payload, so we do NOT
//   hardcode any amount/direction/counterparty field paths. We just verify the
//   signature, console.log the full parsed payload, and post a minimal raw
//   message to Slack. Once a real event is captured, PHASE 2 will add the
//   incoming-only filter (positive/credit amounts) and the formatted message.
//
// Env vars needed:
//   MERCURY_WEBHOOK_SECRET  (new — see notes at bottom of file)
//   SLACK_WEBHOOK_URL       (reused)

import crypto from "crypto";

export const dynamic = "force-dynamic";

const SLACK_URL = process.env.SLACK_WEBHOOK_URL;

// Reject events whose signed timestamp is older than this (replay protection).
const MAX_TIMESTAMP_AGE_SECONDS = 5 * 60; // 5 minutes, per Mercury's docs

// --- Helpers ---

// Fail-soft Slack post: logs on failure, never throws.
async function notifySlack(message) {
  if (!SLACK_URL) return;
  try {
    await fetch(SLACK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });
  } catch (err) {
    console.error("Slack notification failed:", err);
  }
}

// Verifies the Mercury-Signature header.
// Header format: "t=<timestamp>,v1=<signature>"
// signature = HMAC-SHA256( "<timestamp>.<rawBody>" ) keyed with the webhook secret.
// Returns true only if the signature is valid AND the timestamp is recent.
function verifyMercurySignature(rawBody, header, secret) {
  if (!header || !secret) return false;

  // Parse the comma-separated "k=v" pairs.
  let timestamp;
  let signature;
  for (const part of header.split(",")) {
    const [key, value] = part.split("=");
    if (key === "t") timestamp = value;
    if (key === "v1") signature = value;
  }
  if (!timestamp || !signature) return false;

  // Replay protection: reject signatures older than the allowed window.
  const timestampSeconds = parseInt(timestamp, 10);
  if (!Number.isFinite(timestampSeconds)) return false;
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSeconds - timestampSeconds) > MAX_TIMESTAMP_AGE_SECONDS) {
    return false;
  }

  // Recompute the expected signature over "<timestamp>.<rawBody>".
  const signedPayload = `${timestamp}.${rawBody}`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(signedPayload, "utf8")
    .digest("hex");

  // Constant-time comparison. timingSafeEqual throws on length mismatch, so
  // guard the lengths first.
  const expectedBuf = Buffer.from(expected, "hex");
  const signatureBuf = Buffer.from(signature, "hex");
  if (expectedBuf.length !== signatureBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, signatureBuf);
}

// --- Main handler ---

// Health check so Mercury's "Verify endpoint" connectivity probe gets a 200.
// Real events always arrive as POST and go through signature verification below.
export async function GET() {
  return Response.json({ ok: true });
}

export async function POST(req) {
  // Read the raw body as text FIRST — signature verification must run against
  // the exact bytes Mercury signed, before any JSON parsing.
  const rawBody = await req.text();
  const signatureHeader = req.headers.get("mercury-signature");

  if (
    !verifyMercurySignature(
      rawBody,
      signatureHeader,
      process.env.MERCURY_WEBHOOK_SECRET
    )
  ) {
    console.error("Mercury webhook signature verification failed");
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch (err) {
    console.error("Mercury webhook: invalid JSON body:", err);
    // Body was signed correctly but isn't JSON — ack so Mercury stops retrying.
    return Response.json({ received: true });
  }

  // TODO: Mercury delivers at-least-once, so the same event may arrive more
  // than once. No idempotency store in v1 — a duplicate Slack ping is harmless.

  // We only subscribe to transaction.created.
  if (event?.type === "transaction.created") {
    // PHASE 1: log the full payload so we can inspect the real shape, then post
    // a minimal raw message to Slack. No field-path assumptions yet.
    console.log(
      "Mercury transaction.created payload:",
      JSON.stringify(event, null, 2)
    );

    await notifySlack({
      blocks: [
        {
          type: "header",
          text: { type: "plain_text", text: "🏦 Mercury event received" },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text:
              "```" +
              JSON.stringify({
                type: event.type,
                id: event.id,
                data: event.data,
              }) +
              "```",
          },
        },
      ],
    });
  }

  // Always ack quickly with a 2xx — Mercury marks delivery failed after 5s and
  // retries up to 10x.
  return Response.json({ received: true });
}
