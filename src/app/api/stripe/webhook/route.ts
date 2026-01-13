import Stripe from "stripe";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs"; // ✅ recommandé sur Vercel pour Stripe

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

// ✅ Supabase ADMIN (service role) pour les updates sensibles (boost)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("stripe-signature");

  if (!signature) {
    return new Response("Missing stripe-signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return new Response("Webhook Error", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // ✅ sécurité : on ne traite que si payé
    if (session.payment_status && session.payment_status !== "paid") {
      return new Response("Not paid", { status: 200 });
    }

    const type = session.metadata?.type;

    // =========================
    // ✅ CASE 1 : BOOST 7 JOURS
    // =========================
    if (type === "boost") {
      const courseId = session.metadata?.courseId;

      if (!courseId) {
        return new Response("Missing courseId", { status: 200 });
      }

      const now = new Date();

      // ⚡ prolongation intelligente : si déjà boosté et encore actif, on ajoute 7 jours dessus
      const { data: course } = await supabaseAdmin
        .from("courses")
        .select("boost_until")
        .eq("id", courseId)
        .maybeSingle();

      const current = course?.boost_until ? new Date(course.boost_until) : null;
      const base = current && current > now ? current : now;
      const boostUntil = new Date(base.getTime() + 7 * 24 * 60 * 60 * 1000);

      const { error } = await supabaseAdmin
        .from("courses")
        .update({
          boost_until: boostUntil.toISOString(),
        })
        .eq("id", courseId);

      if (error) {
        console.error("Boost update error:", error);
        return new Response("Boost update failed", { status: 500 });
      }

      return new Response("Boost activated", { status: 200 });
    }

    // =========================
    // ✅ CASE 2 : ACHAT FORMATION
    // =========================
    // (On garde ton code, mais on sécurise un peu)
    const userId = session.metadata?.user_id;
    const courseId = session.metadata?.course_id;

    if (userId && courseId) {
      const supabase = createSupabaseServerClient();

      await supabase.from("purchases").insert({
        user_id: userId,
        course_id: courseId,
        amount_cents: session.amount_total ?? null,
      });
    }
  }

  return new Response("OK");
}
