import Stripe from "stripe";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed.");
    return new Response("Webhook Error", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const supabase = createSupabaseServerClient();

    const metadata = session.metadata;

    if (!metadata) {
      return new Response("No metadata", { status: 400 });
    }

    /**
     * 🟢 CAS 1 : ACHAT D’UNE FORMATION
     */
    if (metadata.type === "course") {
      await supabase.from("purchases").insert({
        user_id: metadata.user_id,
        course_id: metadata.course_id,
        amount_cents: session.amount_total,
      });
    }

    /**
     * 🟣 CAS 2 : BOOST DE FORMATION (7 jours)
     */
    if (metadata.type === "boost") {
      const now = new Date();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await supabase
        .from("courses")
        .update({
          boosted_at: now.toISOString(),
          boost_expires_at: expiresAt.toISOString(),
        })
        .eq("id", metadata.course_id);
    }
  }

  return new Response("OK");
}
