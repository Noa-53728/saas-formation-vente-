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
  } catch {
    return new Response("Webhook error", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const supabase = createSupabaseServerClient();

    const type = session.metadata?.type;

    /* =========================
       🔥 BOOST 7 JOURS
    ========================== */
    if (type === "boost") {
      const courseId = session.metadata?.course_id;
      const userId = session.metadata?.user_id;

      if (!courseId || !userId) {
        return new Response("Missing boost metadata", { status: 400 });
      }

      // 🔒 sécurité : vérifier que le cours appartient bien au vendeur
      const { data: course } = await supabase
        .from("courses")
        .select("id, author_id")
        .eq("id", courseId)
        .maybeSingle();

      if (!course || course.author_id !== userId) {
        return new Response("Forbidden boost", { status: 403 });
      }

      const now = new Date();
      const expires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      await supabase
        .from("courses")
        .update({
          boosted_at: now.toISOString(),
          boost_expires_at: expires.toISOString(),
        })
        .eq("id", courseId);

      return new Response("Boost applied", { status: 200 });
    }

    /* =========================
       🛒 ACHAT FORMATION
       (si tu l’utilises encore)
    ========================== */
    if (type === "purchase") {
      const courseId = session.metadata?.course_id;
      const userId = session.metadata?.user_id;

      if (!courseId || !userId) {
        return new Response("Missing purchase metadata", { status: 400 });
      }

      await supabase.from("purchases").insert({
        user_id: userId,
        course_id: courseId,
        amount_cents: session.amount_total ?? 0,
      });

      return new Response("Purchase recorded", { status: 200 });
    }
  }

  return new Response("Ignored", { status: 200 });
}
