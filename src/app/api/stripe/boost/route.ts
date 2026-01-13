import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // ⚠️ Mets la version qui correspond à ton package stripe (tu avais eu l'erreur)
  apiVersion: "2024-06-20",
});

export async function POST(req: Request) {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { courseId } = await req.json();

    if (!courseId) {
      return NextResponse.json({ error: "courseId manquant" }, { status: 400 });
    }

    // ✅ Vérifier que le cours existe et que l'utilisateur est l'auteur
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id, author_id, title")
      .eq("id", courseId)
      .maybeSingle();

    if (courseError || !course) {
      return NextResponse.json({ error: "Formation introuvable" }, { status: 404 });
    }

    if (course.author_id !== user.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const priceId = process.env.STRIPE_BOOST_PRICE_ID; // 👈 on met ça en env

    if (!priceId) {
      return NextResponse.json(
        { error: "STRIPE_BOOST_PRICE_ID manquant" },
        { status: 500 }
      );
    }

    // ✅ Créer la session Checkout
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/dashboard?boost=success`,
      cancel_url: `${baseUrl}/courses/${courseId}?boost=cancel`,
      metadata: {
        type: "boost_7d",
        courseId,
        userId: user.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}
