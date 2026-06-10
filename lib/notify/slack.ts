// Fail-soft Slack post. Mirrors the webhook routes' pattern (app/api/*-webhook):
// logs on failure, never throws — a Slack outage must never fail the caller.
//
// Incoming Webhooks are channel-bound, so each target channel needs its own URL:
//   SLACK_WEBHOOK_URL            payment + sync alerts (#ka-ching)
//   SLACK_CAMPAIGNS_WEBHOOK_URL  campaign accountability digest (#campaigns)

/** Post `text` to a webhook. Defaults to SLACK_WEBHOOK_URL (#ka-ching); pass an
 *  explicit url (e.g. the campaigns webhook) to target another channel. Returns
 *  false if no url was configured or the post failed — never throws. */
export async function notifySlack(text: string, url = process.env.SLACK_WEBHOOK_URL): Promise<boolean> {
  if (!url) return false;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    return res.ok;
  } catch (err) {
    console.error("Slack notification failed:", err);
    return false;
  }
}
