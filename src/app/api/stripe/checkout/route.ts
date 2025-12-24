import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
});

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { courseId } = await req.json();

  const { data: course } = await supabase
    .from("courses")
    .select("id, title, price_cents")
    .eq("id", courseId)
    .maybeSingle();

  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: session.user.email!,
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: course.title,
          },
          unit_amount: course.price_cents,
        },
        quantity: 1,
      },
    ],
    metadata: {
      course_id: course.id,
      user_id: session.user.id,
    },
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cancel`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
