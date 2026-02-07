import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(req: Request) {
  try {
    const { courseId } = await req.json();

    if (!courseId) {
      return NextResponse.json({ error: "courseId manquant" }, { status: 400 });
    }

    const priceId = process.env.STRIPE_BOOST_PRICE_ID;
    if (!priceId) {
      return NextResponse.json({ error: "STRIPE_BOOST_PRICE_ID manquant" }, { status: 500 });
    }

    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // sécurité: vérifier que le cours appartient au user
    const { data: course } = await supabase
      .from("courses")
      .select("id, author_id")
      .eq("id", courseId)
      .maybeSingle();

    if (!course || course.author_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const origin = req.headers.get("origin") ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard?boost=success`,
      cancel_url: `${origin}/dashboard?boost=cancel`,
      metadata: {
        type: "boost",
        course_id: courseId,
        user_id: user.id,
      },
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err: any) {
    console.error("BOOST_API_ERROR:", err?.message, err);
    return NextResponse.json(
      { error: err?.message ?? "Erreur inconnue" },
      { status: 500 }
    );
  }
}
