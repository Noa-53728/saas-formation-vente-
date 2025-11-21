import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const { courseId } = await request.json();
    if (!courseId) {
      return NextResponse.json({ error: "courseId manquant" }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();
    const {
      data: { session }
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { data: course, error } = await supabase
      .from("courses")
      .select("id, title, price_cents, author_id")
      .eq("id", courseId)
      .single();

    if (error || !course) {
      return NextResponse.json({ error: "Formation introuvable" }, { status: 404 });
    }

    if (course.author_id === session.user.id) {
      return NextResponse.json({ error: "Vous êtes déjà l'auteur" }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: course.price_cents,
            product_data: {
              name: course.title,
              description: `Formation ${course.title}`
            }
          }
        }
      ],
      success_url: `${baseUrl}/courses/${course.id}?paiement=succes`,
      cancel_url: `${baseUrl}/courses/${course.id}?paiement=annule`,
      customer_email: session.user.email ?? undefined,
      metadata: {
        course_id: course.id,
        user_id: session.user.id
      }
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error("Erreur Stripe checkout", err);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
