import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

async function createBoostSession(
  courseId: string,
  userId: string,
  origin: string
) {
  const priceId = process.env.STRIPE_BOOST_PRICE_ID;
  if (!priceId) {
    throw new Error("STRIPE_BOOST_PRICE_ID manquant");
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/dashboard?boost=success`,
    cancel_url: `${origin}/dashboard?boost=cancel`,
    metadata: {
      type: "boost",
      course_id: courseId,
      user_id: userId,
    },
  });

  return session.url;
}

/** GET : utilisé par le lien "Booster 7 jours" (courseId en query) → redirection vers Stripe */
export async function GET(req: NextRequest) {
  try {
    const courseId = req.nextUrl.searchParams.get("courseId");
    if (!courseId) {
      return NextResponse.json({ error: "courseId manquant" }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { data: course } = await supabase
      .from("courses")
      .select("id, author_id")
      .eq("id", courseId)
      .maybeSingle();

    if (!course || course.author_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const origin = req.headers.get("origin") ?? req.nextUrl.origin ?? "http://localhost:3000";
    const url = await createBoostSession(courseId, user.id, origin);

    if (!url) {
      return NextResponse.json({ error: "Pas d'URL Stripe" }, { status: 500 });
    }

    return NextResponse.redirect(url);
  } catch (err: any) {
    console.error("BOOST_GET_ERROR:", err?.message, err);
    return NextResponse.json(
      { error: err?.message ?? "Erreur inconnue" },
      { status: 500 }
    );
  }
}

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
    const url = await createBoostSession(courseId, user.id, origin);

    return NextResponse.json({ url: url ?? null }, { status: 200 });
  } catch (err: any) {
    console.error("BOOST_API_ERROR:", err?.message, err);
    return NextResponse.json(
      { error: err?.message ?? "Erreur inconnue" },
      { status: 500 }
    );
  }
}
