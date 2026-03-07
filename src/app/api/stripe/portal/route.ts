import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const baseUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "http://localhost:3000";

/** POST : crée une session du portail facturation Stripe (changer de plan, annuler, moyen de paiement). */
export async function POST() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const customerId = sub?.stripe_customer_id;
  if (!customerId || customerId === "pending") {
    return NextResponse.json(
      { error: "Aucun abonnement à gérer. Choisissez un plan pour commencer." },
      { status: 400 }
    );
  }

  try {
    const appUrl = baseUrl().replace(/\/$/, "");
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl}/dashboard/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    console.error("Stripe portal error:", err);
    const message = err instanceof Error ? err.message : "Erreur portail Stripe";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
