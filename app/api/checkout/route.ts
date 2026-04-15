import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY as string);
}

const PRICES: Record<string, string | undefined> = {
  full: process.env.STRIPE_PRICE_FULL,
  plan: process.env.STRIPE_PRICE_PLAN,
};

export async function POST(req: NextRequest) {
  try {
    const { plan, email } = await req.json();

    const priceId = PRICES[plan];
    if (!priceId) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vocreations.com";
    const stripe = getStripe();

    const isSubscription = plan === "plan";

    const params: Stripe.Checkout.SessionCreateParams = {
      mode: isSubscription ? "subscription" : "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/mentorship/enroll?success=true`,
      cancel_url: `${siteUrl}/mentorship/enroll?canceled=true`,
      metadata: { plan },
    };

    if (email) params.customer_email = email;

    const session = await stripe.checkout.sessions.create(params);

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe checkout error:", err.message);
    return NextResponse.json(
      { error: err.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
