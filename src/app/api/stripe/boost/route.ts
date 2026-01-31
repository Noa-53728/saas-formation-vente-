import Stripe from "stripe";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

function getBaseUrl() {
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  if (host) return `${proto}://${host}`;
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export async function GET(req: Request) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const url = new URL(req.url);
  const courseId = url.searchParams.get("courseId");
  if (!courseId) return new Response("courseId manquant", { status: 400 });

  const { data: course } = await supabase
    .from("courses")
    .select("id, author_id, title")
    .eq("id", courseId)
    .maybeSingle();

  if (!course) return new Response("Formation introuvable", { status: 404 });
  if (course.author_id !== user.id) return new Response("Interdit", { status: 403 });

  const baseUrl = getBaseUrl();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price: process.env.STRIPE_BOOST_PRICE_ID!,
        quantity: 1,
      },
    ],
    success_url: `${baseUrl}/dashboard?boost=success`,
    cancel_url: `${baseUrl}/dashboard?boost=cancel`,
    metadata: {
      type: "boost",
      user_id: user.id,
      course_id: course.id,
      duration_days: "7",
    },
  });

  if (!session.url) return new Response("Stripe session sans URL", { status: 500 });

  redirect(session.url);
}
