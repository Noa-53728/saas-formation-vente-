import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs"; // webhook nécessite le runtime Node pour le body brut

export async function POST(request: Request) {
  const sig = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Signature ou secret manquant" }, { status: 400 });
  }

  let event;
  const rawBody = await request.text();

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Webhook invalide";
    console.error("Erreur de construction webhook", message);
    return NextResponse.json({ error: `Webhook invalide: ${message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const courseId = (session.metadata as Record<string, string> | null)?.course_id;
    const userId = (session.metadata as Record<string, string> | null)?.user_id;
    const stripeSessionId = session.id;

    if (courseId && userId) {
      const supabase = createSupabaseAdminClient();
      const { error } = await supabase
        .from("purchases")
        .upsert({ course_id: courseId, user_id: userId, stripe_session_id: stripeSessionId })
        .select("id")
        .single();

      if (error) {
        console.error("Erreur insertion purchase", error.message);
        return NextResponse.json({ received: true, warning: "purchase non inséré" }, { status: 200 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
