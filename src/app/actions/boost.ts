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
  if (!host) {
    const url = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    return url.replace(/\/$/, "");
  }
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

const BOOST_DAYS = 7;

/** Applique un boost gratuit pour un utilisateur Pro (illimité) ou Creator (3/mois). */
export async function applyFreeBoostAction(formData: FormData) {
  const courseId = String(formData.get("courseId") ?? "").trim();
  if (!courseId) redirect("/dashboard/courses?error=missing");

  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) redirect("/auth/login");
  const userId = userData.user.id;

  const { data: course } = await supabase
    .from("courses")
    .select("id, author_id")
    .eq("id", courseId)
    .maybeSingle();

  if (!course || course.author_id !== userId) redirect("/dashboard/courses?error=forbidden");

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan_id, status")
    .eq("user_id", userId)
    .maybeSingle();

  const planId = sub && ["active", "trialing"].includes(sub.status)
    ? (sub.plan_id as "free" | "creator" | "pro")
    : "free";

  if (planId === "free") redirect("/dashboard/courses?error=plan");

  if (planId === "creator") {
    const now = new Date();
    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const { count } = await supabase
      .from("boost_usage")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("used_at", startOfMonth.toISOString());

    if ((count ?? 0) >= 3) redirect("/dashboard/courses?error=limit");

    await supabase.from("boost_usage").insert({ user_id: userId, used_at: now.toISOString() });
  }

  const now = new Date();
  const expires = new Date(now.getTime() + BOOST_DAYS * 24 * 60 * 60 * 1000);

  await supabase
    .from("courses")
    .update({
      boosted_at: now.toISOString(),
      boost_expires_at: expires.toISOString(),
    })
    .eq("id", courseId);

  redirect("/dashboard/courses?boost=success");
}
