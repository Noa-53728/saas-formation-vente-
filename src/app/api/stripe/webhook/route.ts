import Stripe from "stripe";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("stripe-signature");

  if (!signature) {
    return new Response("Missing signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return new Response("Webhook error", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // ✅ on ne traite que les boosts
    if (session.metadata?.type === "boost") {
      const courseId = session.metadata.course_id;

      const supabase = createSupabaseServerClient();

      const now = new Date();
      const expires = new Date(now);
      expires.setDate(expires.getDate() + 7);

      await supabase
        .from("courses")
        .update({
          boosted_at: now.toISOString(),
          boost_expires_at: expires.toISOString(),
        })
        .eq("id", courseId);
    }
  }

  return new Response("OK");
}
