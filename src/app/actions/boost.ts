"use server";

import Stripe from "stripe";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

function getBaseUrl() {
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  if (!host) return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return `${proto}://${host}`;
}

export async function createBoostCheckoutAction(formData: FormData) {
  const courseId = String(formData.get("courseId") ?? "").trim();
  if (!courseId) throw new Error("courseId manquant");

  const supabase = createSupabaseServerClient();
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData?.user) redirect("/auth/login");

  const user = userData.user;

  // Sécurité: le cours doit appartenir à l'utilisateur
  const { data: course, error: courseErr } = await supabase
    .from("courses")
    .select("id, author_id, title")
    .eq("id", courseId)
    .maybeSingle();

  if (courseErr || !course) throw new Error("Cours introuvable");
  if (course.author_id !== user.id) throw new Error("Non autorisé");

  const priceId = process.env.STRIPE_BOOST_PRICE_ID;
  if (!priceId) throw new Error("STRIPE_BOOST_PRICE_ID manquant");

  const baseUrl = getBaseUrl();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/dashboard?boost=success`,
    cancel_url: `${baseUrl}/dashboard?boost=cancel`,
    metadata: {
      type: "boost",
      course_id: courseId,
      user_id: user.id,
    },
  });

  if (!session.url) throw new Error("URL Stripe manquante");
  redirect(session.url);
}
