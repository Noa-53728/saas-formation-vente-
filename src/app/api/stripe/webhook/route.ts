import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";

async function isProcessed(supabase: ReturnType<typeof createSupabaseAdminClient>, eventId: string) {
  const { data } = await supabase
    .from("stripe_webhook_events")
    .select("id")
    .eq("id", eventId)
    .maybeSingle();
  return !!data?.id;
}

async function markProcessed(supabase: ReturnType<typeof createSupabaseAdminClient>, event: Stripe.Event) {
  const { error } = await supabase.from("stripe_webhook_events").insert({
    id: event.id,
    type: event.type,
  });
  if (error) throw error;
}

export async function POST(req: Request) {
  const signature = headers().get("stripe-signature");
  if (!signature) return new NextResponse("Missing signature", { status: 400 });

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return new NextResponse("Invalid signature", { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  // Idempotence
  if (await isProcessed(supabase, event.id)) {
    return new NextResponse("OK", { status: 200 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const type = session.metadata?.type;
      const courseId = session.metadata?.course_id;
      const userId = session.metadata?.user_id;

      if (!type || !courseId || !userId) {
        await markProcessed(supabase, event);
        return new NextResponse("OK", { status: 200 });
      }

      // ===== BOOST =====
      if (type === "boost") {
        const { data: course, error } = await supabase
          .from("courses")
          .select("id, author_id")
          .eq("id", courseId)
          .maybeSingle();

        if (error) throw error;
        if (!course || course.author_id !== userId) {
          await markProcessed(supabase, event);
          return new NextResponse("Forbidden boost", { status: 200 });
        }

        const now = new Date();
        const expires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const { error: updErr } = await supabase
          .from("courses")
          .update({
            boosted_at: now.toISOString(),
            boost_expires_at: expires.toISOString(),
          })
          .eq("id", courseId);

        if (updErr) throw updErr;

        await markProcessed(supabase, event);
        return new NextResponse("OK", { status: 200 });
      }

      // ===== PURCHASE =====
      if (type === "purchase") {
        const amountTotal = session.amount_total ?? 0;
        const currency = session.currency ?? "eur";
        const paymentIntent =
          typeof session.payment_intent === "string" ? session.payment_intent : null;

        const { error: orderErr } = await supabase.from("orders").upsert(
          {
            user_id: userId,
            course_id: courseId,
            stripe_checkout_session_id: session.id,
            stripe_payment_intent_id: paymentIntent,
            amount_cents: amountTotal,
            currency,
            status: "paid",
          },
          { onConflict: "stripe_checkout_session_id" }
        );
        if (orderErr) throw orderErr;

        const { error: entErr } = await supabase.from("entitlements").upsert(
          { user_id: userId, course_id: courseId, source: "purchase" },
          { onConflict: "user_id,course_id" }
        );
        if (entErr) throw entErr;

        await markProcessed(supabase, event);
        return new NextResponse("OK", { status: 200 });
      }
    }

    // Even if event type ignored, mark processed to avoid retries
    await markProcessed(supabase, event);
    return new NextResponse("OK", { status: 200 });
  } catch {
    // Do not mark processed on failure -> Stripe retries
    return new NextResponse("Webhook failed", { status: 500 });
  }
}
