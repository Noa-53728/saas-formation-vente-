import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const baseUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "http://localhost:3000";

/** POST : crée ou récupère un compte Connect Express et retourne l’URL d’onboarding. */
export async function POST() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const appUrl = baseUrl().replace(/\/$/, "");
  const returnUrl = `${appUrl}/dashboard/billing?connect=success`;
  const refreshUrl = `${appUrl}/dashboard/billing?connect=refresh`;

  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_connect_account_id")
      .eq("id", user!.id)
      .maybeSingle();

    let accountId = profile?.stripe_connect_account_id ?? null;

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "FR",
        email: user!.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });
      accountId = account.id;

      await supabase
        .from("profiles")
        .update({ stripe_connect_account_id: accountId })
        .eq("id", user!.id);
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (err: unknown) {
    console.error("Stripe Connect onboard error:", err);
    const message = err instanceof Error ? err.message : "Erreur Stripe Connect";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
