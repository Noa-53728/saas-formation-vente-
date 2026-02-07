import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();
  const admin = createSupabaseAdminClient();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) return new NextResponse("Unauthorized", { status: 401 });

  const body = await req.json().catch(() => null);
  const planId = body?.planId as "creator" | "pro" | undefined;

  if (!planId || (planId !== "creator" && planId !== "pro")) {
    return new NextResponse("Invalid planId", { status: 400 });
  }

  // 1) Lire le price depuis plans (source de vérité)
  const { data: plan, error: planErr } = await admin
    .from("plans")
    .select("id, stripe_price_id")
    .eq("id", planId)
    .single();

  if (planErr || !plan?.stripe_price_id) {
    return new NextResponse("Plan misconfigured", { status: 500 });
  }

  // 2) Récupérer la ligne subscription unique du user
  const { data: subRow, error: subErr } = await admin
    .from("subscriptions")
    .select("user_id, stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (subErr) return new NextResponse("Subscriptions read failed", { status: 500 });

  let stripeCustomerId = subRow?.stripe_customer_id ?? null;

  // 3) Créer customer Stripe si besoin
  if (!stripeCustomerId || stripeCustomerId === "pending") {
    const customer = await stripe.customers.create({
      metadata: { user_id: user.id },
    });
    stripeCustomerId = customer.id;

    // ✅ upsert verrouillé sur user_id (1 ligne par user)
    const { error: upErr } = await admin.from("subscriptions").upsert(
      {
        user_id: user.id,
        stripe_customer_id: stripeCustomerId,
        plan_id: "free",
        status: "canceled",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (upErr) return new NextResponse("Subscriptions upsert failed", { status: 500 });
  }

  // 4) Créer session Checkout subscription
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: stripeCustomerId,
    line_items: [{ price: plan.stripe_price_id, quantity: 1 }],
    success_url: `${appUrl}/dashboard/billing?checkout=success`,
    cancel_url: `${appUrl}/dashboard/billing?checkout=cancel`,

    client_reference_id: user.id,

    metadata: {
      user_id: user.id,
      type: "subscription",
      plan_id: planId,
    },

    // ✅ CRITIQUE : metadata sur la subscription
    subscription_data: {
      metadata: {
        user_id: user.id,
        plan_id: planId,
      },
    },
  });

  return NextResponse.json({ url: session.url });
}
